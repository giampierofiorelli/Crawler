import copy, unittest
from evaluation.phase94.genuine_source_gate import SOURCES,build_report,can_authorize_automatic_acquisition

class GenuineSourcePreflightTest(unittest.TestCase):
 def test_licence_alone_cannot_authorize_scraping(self):
  s=copy.deepcopy(SOURCES[0]);s['rights']='cc_by_sa';s['robots_receipt']='allow';self.assertFalse(can_authorize_automatic_acquisition(s))
 def test_reviewed_flag_only_insufficient(self):
  s=copy.deepcopy(SOURCES[2]);s['automated_acquisition']='reviewed_authorized';self.assertFalse(can_authorize_automatic_acquisition(s))
 def test_permission_receipts_required(self):
  s=copy.deepcopy(SOURCES[2]);s.update(automated_acquisition='reviewed_authorized',authenticated_rights_receipt='independent_approval',robots_receipt='verified',terms_receipt='verified');self.assertTrue(can_authorize_automatic_acquisition(s))
 def test_existing_real_data_replay_but_not_live_claim(self):
  r=build_report(network_probe=False)
  self.assertEqual(r['live_pages_fetched'],0)
  self.assertIsNone(r['live_extraction_precision'])
  self.assertEqual(r['existing_original_evidence']['sbaf']['reference_points_matched'],20)
  self.assertEqual(r['existing_original_evidence']['blender']['device_count'],3)
  self.assertEqual(len(r['sources']),4)
  self.assertTrue(all(not x['automatic_acquisition_eligible'] for x in r['sources']))
 def test_real_lab_not_reclassified_as_maker_specs(self):
  r=build_report(network_probe=False)
  self.assertFalse(r['existing_original_evidence']['sbaf']['ranking_allowed'])
  self.assertFalse(r['existing_original_evidence']['blender']['ranking_allowed'])

if __name__=='__main__':unittest.main()
