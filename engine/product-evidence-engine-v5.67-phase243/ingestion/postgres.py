"""PostgreSQL v0.3 ingestion CLI. Requires psycopg 3 and DATABASE_URL.

No automated claim of source rights or SKU equivalence. No production access policy.
Run only against a dedicated development database until roles and security are audited.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any
from .validate import COLLECTIONS, validate

TABLES = (
    ('families', 'product_family', ('id', 'brand', 'model_name'), 'family'),
    ('variants', 'product_variant', ('id', 'family_id', 'market', 'sku', 'gtin', 'currency', 'specifications', 'identity_status'), 'variant'),
    ('publishers', 'source_publisher', ('id', 'name', 'website'), 'publisher'),
    ('sessions', 'test_session', ('id', 'publisher_id', 'tested_variant_id', 'tested_model_as_reported', 'identity_status', 'tested_on', 'protocol_id', 'protocol_version', 'conditions'), 'session'),
    ('measurements', 'measurement', ('id', 'session_id', 'dimension', 'metric', 'numeric_value', 'unit', 'qualitative_value', 'direction', 'method_notes', 'status'), 'measurement'),
    ('applicability', 'evidence_applicability', ('id', 'measurement_id', 'variant_id', 'decision', 'rationale', 'reviewer', 'reviewed_at'), 'applicability'),
    ('rights', 'rights_grant', ('id', 'publisher_id', 'status', 'allowed_uses', 'evidence_uri', 'effective_from', 'expires_on', 'recorded_by'), 'rights'),
    ('articles', 'review_article', ('id', 'publisher_id', 'url', 'title', 'published_on', 'original_test_session_id'), 'article'),
)

def connect(url: str | None = None):
    try:
        import psycopg
    except ImportError as exc:
        raise RuntimeError('Install PostgreSQL driver: python -m pip install "psycopg[binary]>=3.2,<4"') from exc
    return psycopg.connect(url or os.environ['DATABASE_URL'])

def stage(conn: Any, path: Path, actor: str) -> str:
    raw = path.read_bytes()
    data = json.loads(raw)
    errors = validate(data)
    if errors:
        raise ValueError('Validation failed: ' + '; '.join(errors))
    sha = hashlib.sha256(raw).hexdigest()
    batch_id = 'batch-' + sha[:24]
    # All writes are atomic. No review/approval inferred from input fields.
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute('SELECT id FROM import_batch WHERE source_file_sha256=%s', (sha,))
            existing = cur.fetchone()
            if existing:
                return existing[0]
            cur.execute('INSERT INTO import_batch (id,dataset_label,source_file_sha256,fixture_kind,status) VALUES (%s,%s,%s,%s,%s)',
                        (batch_id, data['dataset_label'], sha, data['fixture_kind'], 'quarantined'))
            cur.execute('INSERT INTO import_payload (batch_id,payload) VALUES (%s,%s::jsonb)',
                        (batch_id, json.dumps(data, allow_nan=False)))
            audit(cur,batch_id,actor,'stage','batch',batch_id,{'sha256':sha})
    return batch_id

def audit(cur: Any, batch_id: str | None, actor: str, action: str, entity_type: str, entity_id: str, details: dict | None = None):
    cur.execute('INSERT INTO audit_event (batch_id,actor,action,entity_type,entity_id,details) VALUES (%s,%s,%s,%s,%s,%s::jsonb)',
                (batch_id,actor,action,entity_type,entity_id,json.dumps(details or {})))

def prepared(key: str, row: dict, kind: str) -> dict:
    out = dict(row)
    if key == 'variants':
        out.setdefault('currency', {'UK':'GBP','US':'USD','EU':'EUR'}[out['market']])
        out.setdefault('specifications', {})
        out['identity_status'] = 'unverified'
    if key == 'sessions':
        out['identity_status'] = 'ambiguous'
        out.setdefault('conditions', {})
    if key == 'measurements':
        out['status'] = 'pending'
        out.setdefault('direction','descriptive')
    if key == 'applicability':
        out['decision'] = 'pending'
        out['reviewer'] = None
        out['reviewed_at'] = None
    if key == 'rights':
        out['status'] = 'unknown'
        out['allowed_uses'] = []
        out.setdefault('recorded_by', 'intake')
    return out

def promote(conn: Any, batch_id: str, actor: str):
    """Copy staged JSON into relational tables as PENDING, never published."""
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute('SELECT status, payload FROM import_batch JOIN import_payload ON id=batch_id WHERE id=%s FOR UPDATE', (batch_id,))
            row = cur.fetchone()
            if not row: raise ValueError('Unknown batch')
            status, data = row
            if status != 'quarantined': raise ValueError('Only quarantined batches can be promoted')
            if isinstance(data, str): data=json.loads(data)
            # Prevent duplicate IDs across batches: rollback on collision.
            for key, table, cols, entity_type in TABLES:
                for original in data[key]:
                    item = prepared(key,original,data['fixture_kind'])
                    fields = [field for field in cols if field in item]
                    placeholders = ','.join(['%s'] * len(fields))
                    # SQL identifiers are constant source-code literals, never user-controlled.
                    cur.execute(f"INSERT INTO {table} ({','.join(fields)}) VALUES ({placeholders})",
                                tuple(json.dumps(item[f]) if isinstance(item[f],dict) else item[f] for f in fields))
                    cur.execute('INSERT INTO imported_record (batch_id,entity_type,entity_id) VALUES (%s,%s,%s)',
                                (batch_id,entity_type,item['id']))
            for link in data['measurement_rights']:
                cur.execute('INSERT INTO measurement_rights (measurement_id,grant_id) VALUES (%s,%s)',
                            (link['measurement_id'],link['grant_id']))
            cur.execute('UPDATE import_batch SET status=%s WHERE id=%s', ('reviewed',batch_id))
            audit(cur,batch_id,actor,'promote_pending','batch',batch_id)

def decide(conn: Any, batch_id: str, entity_type: str, entity_id: str, decision: str, actor: str, rationale: str, documentary_uri: str | None = None):
    """Record a human decision; approving does not automatically mutate technical/rights statuses."""
    if decision not in ('approved','rejected') or not rationale.strip() or not actor.strip():
        raise ValueError('Decision, actor and rationale required')
    if entity_type=='rights' and decision=='approved' and not documentary_uri:
        raise ValueError('Rights approval requires documentary URI')
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute('SELECT status FROM import_batch WHERE id=%s FOR UPDATE',(batch_id,))
            row=cur.fetchone()
            if not row or row[0] not in ('reviewed','approved'): raise ValueError('Batch must be reviewed')
            cur.execute('INSERT INTO review_decision (batch_id,entity_type,entity_id,decision,actor,rationale,documentary_uri) VALUES (%s,%s,%s,%s,%s,%s,%s)',
                        (batch_id,entity_type,entity_id,decision,actor,rationale,documentary_uri))
            if decision=='approved':
                if entity_type=='variant':
                    cur.execute('UPDATE product_variant SET identity_status=%s WHERE id=%s',('verified',entity_id))
                elif entity_type=='session':
                    cur.execute('UPDATE test_session SET identity_status=%s WHERE id=%s AND tested_variant_id IS NOT NULL',('verified',entity_id))
                    if cur.rowcount != 1: raise ValueError('Cannot verify a test without an identified variant')
                elif entity_type=='measurement':
                    cur.execute('UPDATE measurement SET status=%s WHERE id=%s',('admitted',entity_id))
                elif entity_type=='applicability':
                    cur.execute('SELECT t.tested_variant_id, a.variant_id FROM evidence_applicability a JOIN measurement m ON m.id=a.measurement_id JOIN test_session t ON t.id=m.session_id WHERE a.id=%s',(entity_id,))
                    pair=cur.fetchone()
                    if not pair or pair[0]!=pair[1]: raise ValueError('Cross-variant applicability needs a separate evidence-based equivalence workflow')
                    cur.execute('UPDATE evidence_applicability SET decision=%s, reviewer=%s, reviewed_at=now() WHERE id=%s',('verified',actor,entity_id))
                elif entity_type=='rights':
                    cur.execute('SELECT evidence_uri FROM rights_grant WHERE id=%s',(entity_id,))
                    original=cur.fetchone()
                    if not original or not original[0]: raise ValueError('Documentary source URI missing')
                    # An explicit manual approval permits the scoped use recorded in the staged fixture.
                    # This is a dev-only workflow; the supplied URL is NOT legally verified by software.
                    cur.execute('SELECT payload FROM import_payload WHERE batch_id=%s',(batch_id,))
                    payload=cur.fetchone()[0]
                    if isinstance(payload,str): payload=json.loads(payload)
                    original_grant=next((g for g in payload['rights'] if g['id']==entity_id),None)
                    if not original_grant or 'commercial_scoring' not in original_grant.get('allowed_uses',[]):
                        raise ValueError('No commercial_scoring scope in original source record')
                    cur.execute('UPDATE rights_grant SET status=%s, allowed_uses=%s WHERE id=%s',
                                ('authorized',original_grant['allowed_uses'],entity_id))
            elif decision=='rejected':
                if entity_type=='measurement': cur.execute('UPDATE measurement SET status=%s WHERE id=%s',('excluded',entity_id))
                elif entity_type=='applicability': cur.execute('UPDATE evidence_applicability SET decision=%s WHERE id=%s',('rejected',entity_id))
                elif entity_type=='rights': cur.execute('UPDATE rights_grant SET status=%s WHERE id=%s',('prohibited',entity_id))
                elif entity_type=='variant': cur.execute('UPDATE product_variant SET identity_status=%s WHERE id=%s',('unverified',entity_id))
                elif entity_type=='session': cur.execute('UPDATE test_session SET identity_status=%s WHERE id=%s',('ambiguous',entity_id))
            audit(cur,batch_id,actor,'review_'+decision,entity_type,entity_id,{'rationale':rationale,'documentary_uri':documentary_uri})

def approve_batch(conn: Any, batch_id: str, actor: str):
    """Batch gate; individual approvals and statuses are STILL mandatory in eligibility view."""
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute('SELECT status,fixture_kind FROM import_batch WHERE id=%s FOR UPDATE',(batch_id,))
            row=cur.fetchone()
            if not row or row[0]!='reviewed': raise ValueError('Batch must be reviewed')
            if row[1]!='real': raise ValueError('Synthetic fixtures can never be approved for commercial scoring')
            cur.execute('UPDATE import_batch SET status=%s WHERE id=%s',('approved',batch_id))
            audit(cur,batch_id,actor,'approve_batch','batch',batch_id,
                  {'note':'No measurement becomes eligible without separate approval, applicability, verified identity and live rights'})

def revoke_rights(conn: Any, grant_id: str, actor: str, reason: str):
    if not reason.strip() or not actor.strip(): raise ValueError('Actor and reason required')
    with conn.transaction():
        with conn.cursor() as cur:
            cur.execute('UPDATE rights_grant SET status=%s WHERE id=%s RETURNING id',('prohibited',grant_id))
            if not cur.fetchone(): raise ValueError('Unknown grant')
            cur.execute('SELECT batch_id FROM imported_record WHERE entity_type=%s AND entity_id=%s',('rights',grant_id))
            row=cur.fetchone()
            audit(cur,row[0] if row else None,actor,'revoke_rights','rights',grant_id,{'reason':reason})

def main():
    p=argparse.ArgumentParser(description='v0.3 PostgreSQL staged import / review CLI')
    p.add_argument('--actor',required=True,help='Reviewer identifier (not authenticated; dev only)')
    sub=p.add_subparsers(dest='command',required=True)
    s=sub.add_parser('stage');s.add_argument('json_file',type=Path)
    s=sub.add_parser('promote');s.add_argument('batch_id')
    s=sub.add_parser('decide');s.add_argument('batch_id');s.add_argument('entity_type');s.add_argument('entity_id');s.add_argument('decision',choices=['approved','rejected']);s.add_argument('--reason',required=True);s.add_argument('--documentary-uri')
    s=sub.add_parser('approve-batch');s.add_argument('batch_id')
    s=sub.add_parser('revoke-rights');s.add_argument('grant_id');s.add_argument('--reason',required=True)
    a=p.parse_args()
    with connect() as conn:
        if a.command=='stage': print(stage(conn,a.json_file,a.actor))
        elif a.command=='promote': promote(conn,a.batch_id,a.actor)
        elif a.command=='decide': decide(conn,a.batch_id,a.entity_type,a.entity_id,a.decision,a.actor,a.reason,a.documentary_uri)
        elif a.command=='approve-batch': approve_batch(conn,a.batch_id,a.actor)
        elif a.command=='revoke-rights': revoke_rights(conn,a.grant_id,a.actor,a.reason)
    print('OK')

if __name__=='__main__': main()
