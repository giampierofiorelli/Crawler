"""Offline, dependency-free validation and quarantine manifest generator.

Does NOT connect to PostgreSQL or grant publication permission.
Run: python3 -m ingestion.validate fixtures/synthetic-import.json
"""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse

COLLECTIONS = ('families','variants','publishers','sessions','measurements','applicability','rights','measurement_rights','articles')

def validate(data: dict) -> list[str]:
    errors: list[str] = []
    if data.get('fixture_kind') not in ('synthetic','real'):
        errors.append('fixture_kind must be synthetic or real')
    if not isinstance(data.get('dataset_label'),str) or not data['dataset_label'].strip():
        errors.append('dataset_label is required')
    for key in COLLECTIONS:
        if not isinstance(data.get(key),list):
            errors.append(f'{key} must be an array')
    if errors: return errors
    idx: dict[str,dict] = {}
    for key in COLLECTIONS:
        ids = [r.get('id') for r in data[key] if isinstance(r,dict) and 'id' in r]
        if key != 'measurement_rights' and (len(ids)!=len(data[key]) or len(ids)!=len(set(ids))):
            errors.append(f'{key}: missing or duplicate IDs')
        idx[key] = {r['id']:r for r in data[key] if isinstance(r,dict) and 'id' in r}
    for v in data['variants']:
        if v.get('family_id') not in idx['families']: errors.append(f"variant {v.get('id')}: unknown family")
        if v.get('market') not in ('UK','EU','US'): errors.append(f"variant {v.get('id')}: invalid market")
        if v.get('identity_status') not in ('verified','unverified'): errors.append(f"variant {v.get('id')}: invalid identity status")
    for s in data['sessions']:
        if s.get('publisher_id') not in idx['publishers']: errors.append(f"session {s.get('id')}: unknown publisher")
        if s.get('tested_variant_id') and s['tested_variant_id'] not in idx['variants']: errors.append(f"session {s.get('id')}: unknown tested variant")
        if s.get('identity_status')=='verified' and not s.get('tested_variant_id'): errors.append(f"session {s.get('id')}: verified identity requires variant")
    for m in data['measurements']:
        if m.get('session_id') not in idx['sessions']: errors.append(f"measurement {m.get('id')}: unknown session")
        val=m.get('numeric_value')
        if val is not None and (type(val) not in (int,float) or not -1e300 < val < 1e300): errors.append(f"measurement {m.get('id')}: invalid number")
        if val is not None and not m.get('unit'): errors.append(f"measurement {m.get('id')}: numeric value missing unit")
        if m.get('status') not in ('pending','admitted','limited','contextual','excluded'): errors.append(f"measurement {m.get('id')}: invalid status")
    for a in data['applicability']:
        if a.get('measurement_id') not in idx['measurements'] or a.get('variant_id') not in idx['variants']: errors.append(f"applicability {a.get('id')}: broken reference")
        if a.get('decision')=='verified' and not (a.get('reviewer') and a.get('reviewed_at')): errors.append(f"applicability {a.get('id')}: review metadata required")
        # A transfer between different variants is never auto-approved by an import.
        m=idx['measurements'].get(a.get('measurement_id'),{})
        s=idx['sessions'].get(m.get('session_id'),{})
        if a.get('decision')=='verified' and s.get('tested_variant_id')!=a.get('variant_id'):
            errors.append(f"applicability {a.get('id')}: cross-variant transfer requires separate manual equivalence workflow")
    for g in data['rights']:
        if g.get('publisher_id') not in idx['publishers']: errors.append(f"grant {g.get('id')}: unknown publisher")
        if g.get('status')=='authorized' and not g.get('evidence_uri'): errors.append(f"grant {g.get('id')}: documentary evidence URI required")
        if g.get('status') not in ('authorized','unknown','prohibited','expired'): errors.append(f"grant {g.get('id')}: invalid status")
    for link in data['measurement_rights']:
        m=idx['measurements'].get(link.get('measurement_id'))
        g=idx['rights'].get(link.get('grant_id'))
        if not m or not g:
            errors.append('measurement_rights: broken reference')
            continue
        session=idx['sessions'].get(m.get('session_id'),{})
        if session.get('publisher_id')!=g.get('publisher_id'): errors.append('measurement_rights: grant publisher differs from test publisher')
    for a in data['articles']:
        if a.get('publisher_id') not in idx['publishers'] or a.get('original_test_session_id') not in idx['sessions']: errors.append(f"article {a.get('id')}: broken reference")
        url=a.get('url','')
        if urlparse(url).scheme!='https' or not urlparse(url).netloc: errors.append(f"article {a.get('id')}: https URL required")
    # Imported real-world data always quarantined even if all checks pass.
    return errors

def manifest(path: Path) -> dict:
    raw=path.read_bytes()
    data=json.loads(raw)
    issues=validate(data)
    return {'dataset_label':data.get('dataset_label'), 'fixture_kind':data.get('fixture_kind'),
            'source_file_sha256':hashlib.sha256(raw).hexdigest(),
            'status':'rejected' if issues else 'quarantined',
            'publishable':False, 'errors':issues,
            'counts':{key:len(data.get(key,[])) for key in COLLECTIONS}}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description='Validate import fixture; never publishes data')
    parser.add_argument('input',type=Path)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args()
    result=manifest(args.input)
    payload=json.dumps(result,indent=2,ensure_ascii=False)
    if args.output:
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text(payload+'\n',encoding='utf-8')
    print(payload)
    raise SystemExit(1 if result['errors'] else 0)
