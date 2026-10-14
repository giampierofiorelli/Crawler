import copy
import json
import unittest
from pathlib import Path
from ingestion.validate import validate,manifest

FIXTURE=Path(__file__).resolve().parents[1]/'fixtures'/'synthetic-import.json'

class ValidateTests(unittest.TestCase):
    def setUp(self): self.data=json.loads(FIXTURE.read_text())
    def test_valid_fixture_quarantined_not_published(self):
        self.assertEqual(validate(self.data),[])
        result=manifest(FIXTURE)
        self.assertEqual(result['status'],'quarantined')
        self.assertFalse(result['publishable'])
    def test_unknown_variant_rejected(self):
        self.data['applicability'][0]['variant_id']='missing'
        self.assertTrue(validate(self.data))
    def test_cross_variant_transfer_rejected_even_if_marked_verified(self):
        self.data['variants'].append({'id':'syn-a-us','family_id':'syn-a','market':'US','sku':'SYN-A-US','identity_status':'verified'})
        self.data['applicability'][0]['variant_id']='syn-a-us'
        self.assertIn('cross-variant',str(validate(self.data)))
    def test_authorization_needs_documentary_reference(self):
        self.data['rights'][0]['evidence_uri']=None
        self.assertIn('documentary',str(validate(self.data)))
    def test_grant_must_match_test_publisher(self):
        self.data['publishers'].append({'id':'other','name':'Other'})
        self.data['rights'][0]['publisher_id']='other'
        self.assertIn('differs',str(validate(self.data)))
    def test_duplicate_id_rejected(self):
        self.data['measurements'].append(copy.deepcopy(self.data['measurements'][0]))
        self.assertIn('duplicate',str(validate(self.data)))
    def test_nan_rejected(self):
        self.data['measurements'][0]['numeric_value']=float('nan')
        self.assertIn('invalid number',str(validate(self.data)))
    def test_missing_test_session_rejected(self):
        self.data['measurements'][0]['session_id']='missing'
        self.assertIn('unknown session',str(validate(self.data)))

if __name__=='__main__': unittest.main()
