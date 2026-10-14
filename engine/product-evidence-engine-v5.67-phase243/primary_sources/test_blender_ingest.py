import copy
import csv
import io
import json
import unittest
from pathlib import Path
from .blender_ingest import parse_csv, QuarantinedSource

ROOT = Path(__file__).resolve().parents[1]
CSV = (ROOT/'fixtures/primary_blender/observations.csv').read_bytes()
MANIFEST = json.loads((ROOT/'fixtures/primary_blender/manifest.json').read_text())

class BlenderFirstPartyTests(unittest.TestCase):
    def test_research_only_fixture_from_published_primary_source(self):
        result=parse_csv(CSV,MANIFEST)
        self.assertEqual(result['device_count'],3)
        self.assertEqual(result['devices'][0]['median_render_score'],15081.98)
        self.assertFalse(result['publishable_consumer_recommendations'])
        self.assertFalse(result['ranking_input_approved'])
        self.assertTrue(all('device_label_not_retail_sku' in r['quality_flags'] for r in result['devices']))
    def test_no_licence(self):
        m={**MANIFEST,'licence_basis':'unknown'}
        with self.assertRaisesRegex(QuarantinedSource,'unverified_license_basis'): parse_csv(CSV,m)
    def test_no_rights_review(self):
        m={**MANIFEST,'rights_reviewed':False}
        with self.assertRaisesRegex(QuarantinedSource,'independent_rights_review_missing'): parse_csv(CSV,m)
    def test_reject_amazon_origin(self):
        m={**MANIFEST,'source_url':'https://amazon.co.uk/benchmarks/query/?blender_version=4.4.0&compute_type=OPTIX&group_by=device_name'}
        with self.assertRaisesRegex(QuarantinedSource,'source_scope'): parse_csv(CSV,m)
    def test_mixed_backend(self):
        m={**MANIFEST,'compute_type':'HIP'}
        with self.assertRaisesRegex(QuarantinedSource,'source_scope'): parse_csv(CSV,m)
    def test_mixed_version(self):
        m={**MANIFEST,'blender_version':'5.0.0'}
        with self.assertRaisesRegex(QuarantinedSource,'source_scope'): parse_csv(CSV,m)
    def test_unsupported_columns(self):
        with self.assertRaisesRegex(QuarantinedSource,'unexpected_csv_columns'): parse_csv(b'Device Name,Score\na,2\n',MANIFEST)
    def test_duplicate_device(self):
        with self.assertRaisesRegex(QuarantinedSource,'duplicate_device_name'): parse_csv(CSV+CSV.splitlines()[-1]+b'\n',MANIFEST)
    def test_bad_measurements(self):
        for data in [b'Device Name,Median Score,Number of Benchmarks\na,nan,23\n',b'Device Name,Median Score,Number of Benchmarks\na,1.0,0\n', b'Device Name,Median Score,Number of Benchmarks\na,10.0,2.5\n']:
            with self.assertRaises(QuarantinedSource): parse_csv(data,MANIFEST)
    def test_small_samples_flagged(self):
        d=b'Device Name,Median Score,Number of Benchmarks\nGPU Sample,1.5,2\n'
        self.assertIn('low_submission_count',parse_csv(d,MANIFEST)['devices'][0]['quality_flags'])
    def test_empty(self):
        with self.assertRaisesRegex(QuarantinedSource,'empty_dataset'): parse_csv(b'Device Name,Median Score,Number of Benchmarks\n',MANIFEST)
    def test_future_observation_refused(self):
        m={**MANIFEST,'captured_at':'2099-11-01T00:00:00Z'}
        with self.assertRaisesRegex(QuarantinedSource,'invalid_capture_timestamp'): parse_csv(CSV,m)

if __name__ == '__main__': unittest.main()
