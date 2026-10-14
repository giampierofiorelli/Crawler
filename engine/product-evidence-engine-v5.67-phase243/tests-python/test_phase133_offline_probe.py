import hashlib
import tempfile
import unittest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from phase133_offline_checkpoint_probe import preflight, collect_pairs, unmark, evaluate_local


def d(s):return hashlib.sha256(s).hexdigest()

class TestPhase133(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
  self.path=Path(self.tmp.name)
  (self.path/'model.safetensors').write_text('fixture, not a model')
  self.manifest={'model_id':'fastino/gliner2.5-small-v1','reviewer_approved':True,
   'review_reference':'review-133','offline_only':True,
   'files':{'model.safetensors':{'sha256':d(b'fixture, not a model'),'license':'Apache-2.0',
      'commercial_use_confirmed':True,'licence_url':'https://example.org/license','notice_preserved':True}},
   'all_runtime_dependencies':[{'name':'example','installed_version':'1','license':'MIT','reviewed':True,
    'commercial_use_confirmed':True,'origin_url':'https://example.org','fee_required':False}]}
 def test_missing_model_is_blocked(self):
  self.assertIn('local_checkpoint_not_present',preflight(self.path/'absent',self.manifest))
 def test_closed_licence_blocked(self):
  self.manifest['files']['model.safetensors']['license']='CC-BY-NC-4.0'
  self.assertTrue(preflight(self.path,self.manifest))
 def test_missing_review_blocked(self):
  self.manifest['reviewer_approved']=False
  self.assertIn('independent_licence_review_missing',preflight(self.path,self.manifest))
 def test_missing_transitive_inventory_blocked(self):
  self.manifest['all_runtime_dependencies']=[]
  self.assertIn('runtime_dependency_inventory_missing',preflight(self.path,self.manifest))
 def test_other_unlisted_file_blocked(self):
  (self.path/'unexpected.py').write_text('print("bad")')
  self.assertIn('checkpoint_file_inventory_mismatch',preflight(self.path,self.manifest))
 def test_tamper_blocked(self):
  (self.path/'model.safetensors').write_text('tampered')
  self.assertIn('checkpoint_digest_mismatch:model.safetensors',preflight(self.path,self.manifest))
 def test_pair_direction_enforced(self):
  out=collect_pairs({'relation_extraction':{'measures':[('B','A'),('A','B')]}})
  self.assertEqual(out,[('measures','B','A'),('measures','A','B')])
 def test_annotation_boundary_handled(self):
  self.assertEqual(unmark('The <S>CADR</S> measures <O>particles</O>.'),('The CADR measures particles.','CADR','particles'))
 def test_no_output_invents_ranking(self):
  class Fake:
   def extract_relations(self, text, labels):return {'relation_extraction':{'measures':[('CADR','particles')]}}
  data={'records':[{'marked':'<S>CADR</S> measures <O>particles</O>.','label':'measures'},
                   {'marked':'<S>Airflow</S> does not measure <O>gases</O>.','label':'not_evidence_of'}]}
  r=evaluate_local(Fake(),data)
  self.assertEqual((r['accepted'],r['acceptedCorrect'],r['abstained']),(1,1,1))
  self.assertFalse(r['rankingAuthorized'])

if __name__=='__main__':unittest.main()
