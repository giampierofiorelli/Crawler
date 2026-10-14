import os
import sqlite3
import tempfile
import unittest
from pathlib import Path
from phase89.watch_ledger import WatchLedger,WatchReject

RECIPE='a'*64
URLROOT='https://maker.example/products/'

def event(model='Maker One',kind='quarantined_success',at='2026-10-10T18:00:00Z',
          receipt='quarantine-receipt-001',url=None):
    return {'source_host':'maker.example','path_prefix':'/products/',
        'category':'headphones','recipe_id':RECIPE,'url':url or URLROOT+model.lower().replace(' ','-'),
        'model':model,'observed_at':at,'event_type':kind,'receipt_id':receipt}

class WatchLedgerTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.db=Path(self.tmp.name)/'watch.sqlite3'
        self.ledger=WatchLedger(self.db)

    def test_success_is_advisory_only(self):
        r=self.ledger.record(event())
        self.assertEqual(r['action'],'reuse_when_authorized')
        self.assertEqual(r['automatic_llm_calls'],0)
        self.assertFalse(r['automatic_approval'])
        self.assertEqual(self.ledger.pending(),[])

    def test_idempotent_same_receipt_and_event(self):
        original=self.ledger.record(event())
        replay=self.ledger.record(event())
        self.assertEqual(original['event_id'],replay['event_id'])
        self.assertFalse(original['idempotent_replay'])
        self.assertTrue(replay['idempotent_replay'])
        with sqlite3.connect(self.db) as c:
            self.assertEqual(c.execute('select count(*) from watch_events').fetchone()[0],1)

    def test_single_model_failure_is_not_source_drift(self):
        result=self.ledger.record(event(kind='structural_missing',receipt='error-verified-001'))
        self.assertEqual(result['recent_distinct_structural_failures'],1)
        self.assertEqual(result['action'],'observe_more_models')
        self.assertEqual(self.ledger.pending(),[])

    def test_two_models_trigger_review_queue_no_autonomous_ai(self):
        self.ledger.record(event(kind='structural_missing',receipt='err-first-model'))
        result=self.ledger.record(event(model='Maker Two',kind='structural_missing',
            at='2026-10-10T18:00:01Z',receipt='err-second-model'))
        self.assertEqual(result['recent_distinct_structural_failures'],2)
        self.assertEqual(result['action'],'human_requalification_required')
        self.assertEqual(result['review_case']['status'],'pending_review')
        self.assertEqual(len(self.ledger.pending()),1)
        self.assertEqual(result['automatic_llm_calls'],0)

    def test_same_model_different_urls_not_counted_twice(self):
        self.ledger.record(event(kind='structural_missing',receipt='err-first-model'))
        result=self.ledger.record(event(kind='structural_missing',
            at='2026-10-10T18:00:01Z',receipt='err-second-try',
            url=URLROOT+'maker-one-alternate'))
        self.assertEqual(result['recent_distinct_structural_failures'],1)
        self.assertEqual(self.ledger.pending(),[])

    def test_recovered_model_no_longer_counts_as_failure(self):
        self.ledger.record(event(kind='structural_missing',receipt='error-model-001'))
        result=self.ledger.record(event(kind='quarantined_success',
            at='2026-10-10T18:01:00Z',receipt='quarantine-real-001'))
        self.assertEqual(result['recent_distinct_structural_failures'],0)
        result=self.ledger.record(event(model='Maker Two',kind='structural_missing',
            at='2026-10-10T18:02:00Z',receipt='error-model-002'))
        self.assertEqual(result['recent_distinct_structural_failures'],1)
        self.assertEqual(self.ledger.pending(),[])

    def test_access_denial_never_counts_as_layout_drift(self):
        self.ledger.record(event(kind='structural_missing',receipt='err-first-model'))
        result=self.ledger.record(event(model='Maker Two',kind='source_access_blocked',
            at='2026-10-10T18:00:01Z',receipt='access-failed-123'))
        self.assertEqual(result['action'],'access_review_required_no_ai')
        self.assertEqual(result['recent_distinct_structural_failures'],1)
        self.assertEqual(self.ledger.pending(),[])

    def test_old_failures_outside_window_do_not_count(self):
        self.ledger.record(event(kind='structural_missing',at='2026-10-01T18:00:00Z',
            receipt='error-model-old'))
        result=self.ledger.record(event(model='Maker Two',kind='structural_missing',
            at='2026-10-10T18:00:00Z',receipt='error-model-new'))
        self.assertEqual(result['recent_distinct_structural_failures'],1)

    def test_out_of_order_rejected(self):
        self.ledger.record(event())
        with self.assertRaisesRegex(WatchReject,'stale_observation'):
            self.ledger.record(event(kind='structural_missing',at='2026-10-10T17:00:00Z',
                receipt='error-previous'))

    def test_same_timestamp_conflict_rejected(self):
        self.ledger.record(event())
        with self.assertRaisesRegex(WatchReject,'conflicting_same_time'):
            self.ledger.record(event(kind='structural_missing',receipt='error-same-time'))

    def test_new_recipe_separate_scope(self):
        self.ledger.record(event(kind='structural_missing',receipt='error-model-one'))
        x=event(model='Maker Two',kind='structural_missing',at='2026-10-10T18:00:01Z',
            receipt='error-model-two')
        x['recipe_id']='b'*64
        r=self.ledger.record(x)
        self.assertEqual(r['recent_distinct_structural_failures'],1)
        self.assertEqual(self.ledger.pending(),[])

    def test_category_separate_scope(self):
        self.ledger.record(event(kind='structural_missing',receipt='error-model-one'))
        x=event(model='Maker Two',kind='structural_missing',at='2026-10-10T18:00:01Z',receipt='error-model-two')
        x['category']='speakers'
        self.assertEqual(self.ledger.record(x)['recent_distinct_structural_failures'],1)
        self.assertEqual(self.ledger.pending(),[])

    def test_review_closure_does_not_activate_method(self):
        self.ledger.record(event(kind='structural_missing',receipt='error-one'))
        self.ledger.record(event(model='Maker Two',kind='structural_missing',
            at='2026-10-10T18:00:01Z',receipt='error-two'))
        queue=self.ledger.pending()[0]
        r=self.ledger.close_case(queue['source_key'],queue['recipe_id'],
            'reviewed-by-independent-human')
        self.assertEqual(r['status'],'closed_manually')
        self.assertFalse(r['automatic_approval'])
        self.assertEqual(self.ledger.pending(),[])
        with self.assertRaisesRegex(WatchReject,'no_pending_review_case'):
            self.ledger.close_case(queue['source_key'],queue['recipe_id'],'try-again-receipt')

    def test_source_host_scope_restriction(self):
        x=event();x['url']='https://maker.example.evil/products/maker-one'
        with self.assertRaises(WatchReject): self.ledger.record(x)

    def test_reject_unapproved_http(self):
        x=event();x['url']='http://maker.example/products/maker-one'
        with self.assertRaises(WatchReject):self.ledger.record(x)

    def test_reject_prefix_confusion(self):
        x=event();x['path_prefix']='/products';x['url']='https://maker.example/products-evil/maker-one'
        with self.assertRaises(WatchReject):self.ledger.record(x)

    def test_no_persisted_numeric_values_or_html(self):
        self.ledger.record(event())
        with sqlite3.connect(self.db) as c:
            names=[row[1] for row in c.execute('pragma table_info(watch_events)')]
            self.assertNotIn('html',names)
            self.assertNotIn('value',names)
            self.assertNotIn('source_url',names)
            self.assertNotIn('model',names)

    def test_bad_utc_timestamp(self):
        x=event();x['observed_at']='2026-10-10T19:00:00+01:00'
        with self.assertRaises(WatchReject):self.ledger.record(x)

    def test_unknown_event_refused(self):
        x=event();x['event_type']='automatic_ai_retrain'
        with self.assertRaises(WatchReject):self.ledger.record(x)

    def test_unexpected_input_key_refused(self):
        x=event();x['approved']=True
        with self.assertRaises(WatchReject):self.ledger.record(x)

if __name__=='__main__':unittest.main()
