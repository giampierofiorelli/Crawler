import copy
import json
import unittest
from pathlib import Path
from unittest.mock import patch
from ingestion.postgres import prepared, stage, approve_batch, revoke_rights, decide

FIXTURE=Path(__file__).resolve().parents[1]/'fixtures'/'synthetic-import.json'

class FakeCursor:
    def __init__(self, answers=()):
        self.answers=list(answers)
        self.calls=[]
        self.rowcount=1
    def execute(self,sql,args=None):
        self.calls.append((sql,args))
    def fetchone(self):
        return self.answers.pop(0) if self.answers else None
    def __enter__(self):return self
    def __exit__(self,*args):return False
class FakeConn:
    def __init__(self,answers=()):self.cur=FakeCursor(answers);self.commits=0;self.rollbacks=0
    def cursor(self):return self.cur
    def transaction(self):return self
    def __enter__(self):return self
    def __exit__(self,typ,val,tb):
        if typ:self.rollbacks+=1
        else:self.commits+=1
        return False

class IngestionTests(unittest.TestCase):
    def test_stage_quarantine_and_hash(self):
        db=FakeConn([None])
        batch=stage(db,FIXTURE,'developer')
        self.assertTrue(batch.startswith('batch-'))
        self.assertEqual(db.commits,1)
        self.assertTrue(any('quarantined' in str(args) for _,args in db.cur.calls))
    def test_stage_idempotent(self):
        db=FakeConn([('batch-existing',)])
        self.assertEqual(stage(db,FIXTURE,'developer'),'batch-existing')
        self.assertFalse(any('INSERT INTO import_batch' in sql for sql,_ in db.cur.calls))
    def test_bad_data_never_writes(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'bad.json'
            payload=json.loads(FIXTURE.read_text())
            payload['variants'][0]['family_id']='unknown'
            path.write_text(json.dumps(payload))
            db=FakeConn()
            with self.assertRaises(ValueError):stage(db,path,'developer')
            self.assertEqual(db.cur.calls,[])
    def test_preparation_forces_pending(self):
        data=json.loads(FIXTURE.read_text())
        self.assertEqual(prepared('measurements',data['measurements'][0],'real')['status'],'pending')
        self.assertEqual(prepared('rights',data['rights'][0],'real')['status'],'unknown')
        self.assertEqual(prepared('applicability',data['applicability'][0],'real')['decision'],'pending')
        self.assertEqual(prepared('variants',data['variants'][0],'real')['identity_status'],'unverified')
        self.assertEqual(prepared('sessions',data['sessions'][0],'real')['identity_status'],'ambiguous')
    def test_synthetic_batch_cannot_approve(self):
        db=FakeConn([('reviewed','synthetic')])
        with self.assertRaisesRegex(ValueError,'Synthetic'):
            approve_batch(db,'batch-1','developer')
        self.assertEqual(db.rollbacks,1)
    def test_rights_approval_requires_document(self):
        db=FakeConn()
        with self.assertRaisesRegex(ValueError,'documentary URI'):
            decide(db,'batch-1','rights','grant-1','approved','developer','looks fine')
    def test_revoke_updates_and_audits(self):
        db=FakeConn([('grant-1',),('batch-1',)])
        revoke_rights(db,'grant-1','developer','license ended')
        self.assertTrue(any('UPDATE rights_grant' in sql for sql,_ in db.cur.calls))
        self.assertTrue(any('INSERT INTO audit_event' in sql for sql,_ in db.cur.calls))
    def test_unknown_grant_rollback(self):
        db=FakeConn([None])
        with self.assertRaisesRegex(ValueError,'Unknown grant'):
            revoke_rights(db,'missing','developer','revoked')
        self.assertEqual(db.rollbacks,1)
    def test_cross_variant_review_denied(self):
        db=FakeConn([('reviewed',),('tested-us','target-uk')])
        with self.assertRaisesRegex(ValueError,'Cross-variant'):
            decide(db,'batch-1','applicability','a1','approved','reviewer','verified')
        self.assertEqual(db.rollbacks,1)

if __name__=='__main__':unittest.main()

class PromotionTests(unittest.TestCase):
    def test_promotion_is_atomic_and_forces_review(self):
        from ingestion.postgres import promote
        payload=json.loads(FIXTURE.read_text())
        db=FakeConn([('quarantined',payload)])
        promote(db,'batch-1','developer')
        self.assertEqual(db.commits,1)
        self.assertTrue(any('UPDATE import_batch SET status=' in sql and 'reviewed' in str(args) for sql,args in db.cur.calls))
        self.assertEqual(sum('INSERT INTO imported_record' in sql for sql,_ in db.cur.calls),
                         sum(len(payload[k]) for k in ('families','variants','publishers','sessions','measurements','applicability','rights','articles')))
        self.assertFalse(any('approved' in str(args) for sql,args in db.cur.calls if 'UPDATE import_batch' in sql))
    def test_promotion_rollback_on_duplicate_record(self):
        from ingestion.postgres import promote
        payload=json.loads(FIXTURE.read_text())
        class FailCursor(FakeCursor):
            def execute(self,sql,args=None):
                super().execute(sql,args)
                if 'INSERT INTO product_family' in sql: raise RuntimeError('duplicate key')
        db=FakeConn([('quarantined',payload)])
        db.cur=FailCursor([('quarantined',payload)])
        with self.assertRaisesRegex(RuntimeError,'duplicate'):
            promote(db,'batch-1','developer')
        self.assertEqual(db.rollbacks,1)
