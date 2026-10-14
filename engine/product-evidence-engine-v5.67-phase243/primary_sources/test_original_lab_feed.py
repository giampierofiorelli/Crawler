import copy
import json
import unittest
from pathlib import Path
from primary_sources.original_lab_feed import validate_feed, FeedQuarantine

HERE=Path(__file__).resolve().parents[1]/'fixtures'/'primary_lab'
BLOB=(HERE/'fictional_lab.json').read_bytes()
MAN=json.loads((HERE/'fictional_manifest.json').read_text())
VARIANTS={'UK-HEADPHONES-A','UK-HEADPHONES-B'}

class OriginalLabFeedTests(unittest.TestCase):
    def parse(self,obj=None,manifest=None,variants=None):
        if obj is None: obj=json.loads(BLOB)
        blob=json.dumps(obj).encode()
        return validate_feed(blob,manifest if manifest is not None else MAN,variants if variants is not None else VARIANTS)
    def test_admits_research_without_approving_public_rank(self):
        result=self.parse()
        self.assertEqual(result['record_count'],3)
        self.assertEqual(result['original_test_count'],2)
        self.assertFalse(result['ranking_input_approved'])
        self.assertFalse(result['publishable_consumer_recommendations'])
        self.assertEqual(len(result['input_sha256']),64)
    def test_requires_full_rights_manifest(self):
        for k in ['commercial_storage','derivative_analysis','machine_ingestion']:
            m=copy.deepcopy(MAN);m['rights_asserted'][k]=False
            with self.assertRaises(FeedQuarantine): self.parse(manifest=m)
    def test_requires_explicit_research_only(self):
        m=copy.deepcopy(MAN);m['review_only']=False
        with self.assertRaises(FeedQuarantine): self.parse(manifest=m)
    def test_rejects_unknown_variant(self):
        d=json.loads(BLOB);d['measurements'][0]['tested_variant']='US-OTHER'
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_amazon_or_wrong_publisher_url(self):
        for url in ['https://amazon.co.uk/x','http://laboratory.example.org/a','https://laboratory.example.org.evil.invalid/a','https://u:p@laboratory.example.org/a']:
            d=json.loads(BLOB);d['measurements'][0]['test_url']=url
            with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_duplicate_measurements(self):
        d=json.loads(BLOB);d['measurements'].append(dict(d['measurements'][0]))
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_duplicate_criterion_under_different_record_id(self):
        d=json.loads(BLOB);dup=dict(d['measurements'][0]);dup['record_id']='e999';d['measurements'].append(dup)
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_test_conflict(self):
        d=json.loads(BLOB);d['measurements'][2]['test_url']='https://laboratory.example.org/wrong'
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_nonfinite_or_invalid_value(self):
        for value in [-5,'NaN',float('inf'),None,True]:
            d=json.loads(BLOB);d['measurements'][0]['measurement']=value
            with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_empty_test_conditions(self):
        d=json.loads(BLOB);d['measurements'][0]['conditions']={}
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_unknown_dimension(self):
        d=json.loads(BLOB);d['measurements'][0]['criterion']='magic_quality'
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_later_test_than_export(self):
        d=json.loads(BLOB);d['measurements'][0]['tested_at']='2026-12-01T00:00:00Z'
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_unsupported_export_schema(self):
        d=json.loads(BLOB);d['measurements'][0]['invented_score']=100
        with self.assertRaises(FeedQuarantine): self.parse(d)
    def test_rejects_missing_catalogue(self):
        with self.assertRaises(FeedQuarantine): self.parse(variants=set())
    def test_preserves_real_units_no_normalization(self):
        out=self.parse()
        self.assertEqual(out['measurements'][0]['unit'],'h')
        self.assertNotIn('ranking_score',out['measurements'][0])
    def test_only_matching_test_protocol_may_form_comparison_group(self):
        out=self.parse()
        self.assertEqual(len(out['potentially_comparable_groups']),1)
        self.assertEqual(out['potentially_comparable_groups'][0]['criterion'],'battery_runtime')
        self.assertEqual(out['potentially_comparable_groups'][0]['variant_count'],2)
        d=json.loads(BLOB)
        d['measurements'][1]['protocol_version']='v3'
        self.assertEqual(self.parse(d)['potentially_comparable_groups'],[])
    def test_mismatched_test_conditions_not_compared(self):
        d=json.loads(BLOB)
        d['measurements'][1]['conditions']['volume_db']='90'
        self.assertEqual(self.parse(d)['potentially_comparable_groups'],[])
    def test_cannot_supply_non_lab_as_original_test(self):
        m=copy.deepcopy(MAN);m['kind']='third_party_aggregator_export'
        with self.assertRaises(FeedQuarantine): self.parse(manifest=m)

if __name__=='__main__': unittest.main()
