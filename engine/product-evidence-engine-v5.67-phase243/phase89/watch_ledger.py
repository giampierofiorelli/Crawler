"""Phase 89: durable, per-product source-strategy drift telemetry.

The ledger is an *advisory* companion to the existing Phase82 market watch and
Phase85 reviewed-recipe catalogue. No network, LLM, source authorization, recipe
approval, or ranking happens here. No HTML, numeric values or article text persist.
An outcome is trusted only to the extent its upstream caller/receipts are trusted.
"""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
import hashlib
import json
import re
import sqlite3
from urllib.parse import urlsplit

HASH = re.compile(r'^[0-9a-f]{64}$')
CATEGORY = re.compile(r'^[a-z][a-z0-9_-]{1,50}$')
HOST = re.compile(r'^(?=.{4,253}$)[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])$')
EVENTS = frozenset({'quarantined_success','structural_missing',
                    'source_access_blocked','transient_acquisition_failure',
                    'recipe_suspended','manual_validation_required'})
DRIFT_WINDOW_DAYS = 7
DRIFT_DISTINCT_MODELS = 2
MAX_EVENTS = 100_000

class WatchReject(ValueError):
    pass


def _require_str(value, name, lo=1, hi=256):
    if not isinstance(value,str) or not lo<=len(value)<=hi or value.strip()!=value:
        raise WatchReject('invalid_'+name)
    return value


def _timestamp(value):
    _require_str(value,'observed_at',20,35)
    try:
        dt=datetime.fromisoformat(value.replace('Z','+00:00'))
    except ValueError as exc:
        raise WatchReject('invalid_observed_at') from exc
    if dt.tzinfo is None or dt.utcoffset()!=timedelta(0):
        raise WatchReject('timestamp_must_be_utc')
    return dt.astimezone(timezone.utc).isoformat(timespec='microseconds')


def _source(url,host,prefix):
    _require_str(url,'source_url',12,2048)
    _require_str(host,'source_host',4,253)
    _require_str(prefix,'path_prefix',1,200)
    if not HOST.fullmatch(host) or host.lower()!=host or '..' in host or '..' in prefix:
        raise WatchReject('invalid_source_scope')
    if not prefix.startswith('/') or '?' in prefix or '#' in prefix or '\\' in prefix:
        raise WatchReject('invalid_source_scope')
    try:
        p=urlsplit(url)
        port=p.port
    except ValueError as exc:
        raise WatchReject('invalid_source_url') from exc
    if (p.scheme!='https' or p.hostname!=host or port is not None or
        p.username or p.password or p.fragment or '\\' in p.path or
        not (p.path.startswith(prefix) and (prefix.endswith('/') or
          p.path==prefix or p.path[len(prefix):].startswith('/')))):
        raise WatchReject('source_scope_mismatch')
    return url


def _digest(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True, ensure_ascii=False,
        separators=(',',':')).encode('utf-8')).hexdigest()


def _check_request(record):
    if not isinstance(record,dict) or set(record)!={
        'source_host','path_prefix','category','recipe_id','url','model',
        'observed_at','event_type','receipt_id'}:
        raise WatchReject('invalid_event_schema')
    host,prefix,url=record['source_host'],record['path_prefix'],record['url']
    _source(url,host,prefix)
    if not isinstance(record['category'],str) or not CATEGORY.fullmatch(record['category']):
        raise WatchReject('invalid_category')
    if not isinstance(record['recipe_id'],str) or not HASH.fullmatch(record['recipe_id']):
        raise WatchReject('invalid_recipe_id')
    _require_str(record['model'],'model',2,100)
    if record['event_type'] not in EVENTS:
        raise WatchReject('invalid_event_type')
    _require_str(record['receipt_id'],'receipt_id',8,256)
    observed_at=_timestamp(record['observed_at'])
    if record['event_type']=='quarantined_success' and not record['receipt_id']:
        raise WatchReject('missing_quarantine_receipt')
    return observed_at

SCHEMA = '''
PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS watch_events (
    event_id TEXT PRIMARY KEY,
    source_key TEXT NOT NULL,
    product_key TEXT NOT NULL,
    recipe_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    receipt_hash TEXT NOT NULL,
    UNIQUE(source_key,product_key,recipe_id,observed_at,event_type,receipt_hash)
);
CREATE INDEX IF NOT EXISTS idx_watch_source_time
 ON watch_events(source_key,recipe_id,observed_at);
CREATE TABLE IF NOT EXISTS review_queue (
    source_key TEXT NOT NULL,
    recipe_id TEXT NOT NULL,
    raised_at TEXT NOT NULL,
    reason TEXT NOT NULL,
    distinct_models INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('pending_review','closed_manually')),
    disposition_receipt_hash TEXT,
    PRIMARY KEY (source_key,recipe_id)
);
'''


class WatchLedger:
    """Local SQLite reporter; multiple writers serialized through BEGIN IMMEDIATE.

    It never marks a recipe approved nor restarts a suspended recipe. The review
    queue is advisory and must be reconciled with Phase85/82, not used as source
    access permission. Case closure records only a human disposition receipt.
    """
    def __init__(self, db_path):
        self.db_path=_require_str(str(db_path),'db_path',1,4096)
        with sqlite3.connect(self.db_path,timeout=5) as con:
            con.executescript(SCHEMA)

    def _db(self):
        con=sqlite3.connect(self.db_path,timeout=5)
        con.execute('PRAGMA busy_timeout=5000')
        return con

    def _latest_by_product(self,con,source_key,recipe_id,cutoff):
        """One current outcome per product, excluding any later success or denial.

        A product's latest structural failure is counted only within the recent
        window. An older structural failure displaced by success never counts.
        """
        rows=con.execute('''SELECT product_key,event_type,observed_at,event_id
            FROM watch_events WHERE source_key=? AND recipe_id=?
            ORDER BY observed_at DESC,event_id DESC''',(source_key,recipe_id))
        latest={}
        for model_key,kind,at,eid in rows:
            if model_key not in latest:
                latest[model_key]=(kind,at)
        return {key for key,(kind,at) in latest.items()
                if kind=='structural_missing' and at>=cutoff}

    def record(self,record):
        at=_check_request(record)
        # Materially different product URLs and model names cannot contribute as
        # one model twice; a repeated observation for the same model is one vote.
        source_key=_digest({'host':record['source_host'],
            'prefix':record['path_prefix'],'category':record['category']})
        # Count one canonical model once, even if it appears at multiple URLs.
        product_key=_digest({'model':record['model'].casefold()})
        rid=record['recipe_id']
        eid=_digest({'source':source_key,'product':product_key,'recipe':rid,
            'time':at,'type':record['event_type'],'receipt':record['receipt_id']})
        cutoff=(datetime.fromisoformat(at)-timedelta(days=DRIFT_WINDOW_DAYS)).isoformat(timespec='microseconds')
        with self._db() as con:
            con.execute('BEGIN IMMEDIATE')
            # Do not process historic/reordered reports as latest observations.
            prev=con.execute('''SELECT observed_at,event_id FROM watch_events
                WHERE source_key=? AND recipe_id=? AND product_key=?
                ORDER BY observed_at DESC,event_id DESC LIMIT 1''',
                (source_key,rid,product_key)).fetchone()
            if prev and at<prev[0]:
                raise WatchReject('stale_observation')
            if prev and at==prev[0] and eid!=prev[1]:
                raise WatchReject('conflicting_same_time_observation')
            existing=con.execute('SELECT event_id FROM watch_events WHERE event_id=?',(eid,)).fetchone()
            if not existing:
                count=con.execute('SELECT COUNT(*) FROM watch_events').fetchone()[0]
                if count>=MAX_EVENTS: raise WatchReject('ledger_capacity_limit')
                con.execute('''INSERT INTO watch_events
                    (event_id,source_key,product_key,recipe_id,event_type,observed_at,receipt_hash)
                    VALUES (?,?,?,?,?,?,?)''',
                    (eid,source_key,product_key,rid,record['event_type'],at,
                     _digest(record['receipt_id'])))
            failed_models=self._latest_by_product(con,source_key,rid,cutoff)
            queue=con.execute('''SELECT status FROM review_queue
                WHERE source_key=? AND recipe_id=?''',(source_key,rid)).fetchone()
            if len(failed_models)>=DRIFT_DISTINCT_MODELS and not queue:
                con.execute('''INSERT INTO review_queue
                    (source_key,recipe_id,raised_at,reason,distinct_models,status)
                    VALUES (?,?,?,?,?,?)''',
                    (source_key,rid,at,'distinct_product_structural_drift',
                     len(failed_models),'pending_review'))
            queue=con.execute('''SELECT status,reason,raised_at,distinct_models
                FROM review_queue WHERE source_key=? AND recipe_id=?''',
                (source_key,rid)).fetchone()
        if queue and queue[0]=='pending_review':
            action='human_requalification_required'
        elif record['event_type']=='source_access_blocked':
            action='access_review_required_no_ai'
        elif record['event_type']=='recipe_suspended':
            action='manual_recipe_status_check'
        elif record['event_type']=='transient_acquisition_failure':
            action='retry_under_source_policy_no_ai'
        elif record['event_type']=='manual_validation_required':
            action='manual_validation_no_ai'
        else:
            action='reuse_when_authorized' if record['event_type']=='quarantined_success' else 'observe_more_models'
        return {'event_id':eid,'idempotent_replay':bool(existing),
                'source_key':source_key,'recipe_id':rid,
                'recent_distinct_structural_failures':len(failed_models),
                'action':action,
                'review_case': None if not queue else {
                    'status':queue[0],'reason':queue[1],
                    'raised_at':queue[2], 'distinct_models_at_trigger':queue[3]},
                'automatic_llm_calls':0,'automatic_approval':False}

    def case_status(self, source_host, path_prefix, category, recipe_id):
        """Exact recipe scoped read for the acquisition safety gate.

        Both pending and manually closed cases remain NOT CLEARED FOR REUSE.
        A closed advisory ticket does not reapprove the authoritative recipe.
        """
        _source('https://' + str(source_host) + str(path_prefix),
                source_host, path_prefix)
        if not isinstance(category,str) or not CATEGORY.fullmatch(category):
            raise WatchReject('invalid_category')
        if not isinstance(recipe_id,str) or not HASH.fullmatch(recipe_id):
            raise WatchReject('invalid_recipe_id')
        source_key=_digest({'host':source_host,'prefix':path_prefix,
                            'category':category})
        with self._db() as con:
            row=con.execute('''SELECT status,raised_at,reason,distinct_models
                FROM review_queue WHERE source_key=? AND recipe_id=?''',
                (source_key,recipe_id)).fetchone()
        return {'source_key':source_key,'recipe_id':recipe_id,
                'case_status':row[0] if row else 'none',
                'safe_to_reuse_under_review_gate':row is None,
                'review_reason':row[2] if row else None,
                'automatic_llm_calls':0,'automatic_approval':False}

    def case_status_many(self, recipes):
        if not isinstance(recipes,list) or len(recipes)>100:
            raise WatchReject('invalid_batch')
        results=[]
        for record in recipes:
            if not isinstance(record,dict) or set(record)!={
                'source_host','path_prefix','category','recipe_id'}:
                raise WatchReject('invalid_case_status_scope')
            results.append(self.case_status(**record))
        return results

    def pending(self):
        with self._db() as con:
            rows=con.execute('''SELECT source_key,recipe_id,raised_at,reason,
                distinct_models FROM review_queue WHERE status='pending_review'
                ORDER BY raised_at,source_key LIMIT 100''').fetchall()
        return [{'source_key':a,'recipe_id':b,'raised_at':c,'reason':d,
                 'distinct_models_at_trigger':e} for a,b,c,d,e in rows]

    def close_case(self,source_key,recipe_id,disposition_receipt):
        if not isinstance(source_key,str) or not HASH.fullmatch(source_key):
            raise WatchReject('invalid_source_key')
        if not isinstance(recipe_id,str) or not HASH.fullmatch(recipe_id):
            raise WatchReject('invalid_recipe_id')
        _require_str(disposition_receipt,'disposition_receipt',12,256)
        with self._db() as con:
            con.execute('BEGIN IMMEDIATE')
            cur=con.execute('''UPDATE review_queue SET status='closed_manually',
                disposition_receipt_hash=? WHERE source_key=? AND recipe_id=?
                AND status='pending_review' ''',
                (_digest(disposition_receipt),source_key,recipe_id))
            if cur.rowcount!=1: raise WatchReject('no_pending_review_case')
        # Closing the advisory queue neither changes Phase87 SQLite strategy
        # status nor grants authorization to use/create any new recipe.
        return {'status':'closed_manually','recipe_id':recipe_id,
                'automatic_approval':False,'automatic_llm_calls':0}
