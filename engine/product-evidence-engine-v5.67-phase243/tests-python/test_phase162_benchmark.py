import hashlib
from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from phase162_benchmark import evaluate,sha
from phase162_corpus_prepare import build

LABELS=('product_model','brand','product_feature','measured_value')
def e(text,mark):
 a=text.index(mark);return {'start':a,'end':a+len(mark),'text':mark}
class Phase162Tests(unittest.TestCase):
 def setUp(self):
  self.text='We tested Maytag Q123. Noise was 44 dBA.'
  self.doc={'id':'a','kind':'constructed','rightsBasis':'constructed_original','rightsStatement':'Developer authored sample','category':'fridge',
            'sourceTitle':'Maytag Q123','sourceUrl':'https://example.org/review','sourceRole':'original_product_test',
            'text':self.text,'sha256':sha(self.text)}
  self.man={'protocol':'pee.phase160.batch.v1','datasetId':'demo','documents':[self.doc]}
  self.ent={label:[] for label in LABELS};self.ent['product_model']=[e(self.text,'Maytag Q123')]
  self.native={'protocol':'pee.phase162.native_spans.v1','datasetId':'demo','predictions':{'a':{'sha256':sha(self.text),'entities':self.ent}}}
  self.neural={'model_id':'fastino/gliner2.5-small-v1','model_architecture':'boundary',
               'model_integration_status':'local_offline_worker_not_connected_to_PEE','cases':{
                'a':{'input':self.text,'source_sha256':sha(self.text),'entities':deepcopy(self.ent),'offset_errors':[]}}}
  self.gold={'protocol':'pee.phase162.gold.v1','datasetId':'demo','annotationProcess':'developer_constructed',
             'cases':{'a':{'sha256':sha(self.text),'entities':self.ent}}}
 def test_exact_paired_counts_without_independence_claim(self):
  r=evaluate(self.man,self.native,self.neural,self.gold)
  self.assertEqual(r['pairedDocuments'],1)
  self.assertEqual(r['pairedExactSpanMetrics']['neural']['product_model']['tp'],1)
  self.assertFalse(r['independentBenchmarkEstablished']);self.assertFalse(r['rankingAuthorized'])
 def test_wrong_offsets_and_missing_neural_not_hidden(self):
  self.neural['cases']['a']['entities']['product_model'][0]['text']='altered'
  with self.assertRaisesRegex(ValueError,'unaligned_span'):evaluate(self.man,self.native,self.neural,self.gold)
  self.neural['cases']={}; self.gold['cases']['a']['entities']=deepcopy(self.native['predictions']['a']['entities']); r=evaluate(self.man,self.native,self.neural,self.gold)
  self.assertEqual(r['missingNeural'],['a']);self.assertEqual(r['pairedDocuments'],0)
 def test_cannot_call_publisher_label_developer_constructed(self):
  self.doc['kind']='rights_permitted_full_review'
  with self.assertRaisesRegex(ValueError,'constructed_gold_on_external_source'):
   evaluate(self.man,self.native,None,self.gold)
 def test_split_source_and_family_leakage(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'a.txt').write_text(self.text);(root/'b.txt').write_text('Different text')
   base={key:self.doc[key] for key in ('id','kind','rightsBasis','rightsStatement','category','sourceTitle','sourceUrl','sourceRole','sha256')}
   base.update(textFile='a.txt',split='development',productFamilyId='maytag_series',publisherGroupId='publisher_one')
   clone={**base,'id':'b','textFile':'b.txt','sha256':sha('Different text'),'sourceUrl':'https://example.org/b',
          'split':'frozen_holdout','publisherGroupId':'publisher_two'}
   with self.assertRaisesRegex(ValueError,'product_family_cross_split_leakage'):
    build({'protocol':'pee.phase162.corpus.v1','datasetId':'demo','records':[base,clone]},root)
   clone['productFamilyId']='other_family';clone['publisherGroupId']='publisher_one'
   with self.assertRaisesRegex(ValueError,'publisher_group_cross_split_leakage'):
    build({'protocol':'pee.phase162.corpus.v1','datasetId':'demo','records':[base,clone]},root)
   clone['publisherGroupId']='publisher_two'
   jobs,receipt=build({'protocol':'pee.phase162.corpus.v1','datasetId':'demo','records':[base,clone]},root)
   self.assertEqual(len(jobs),2);self.assertEqual(receipt['count'],2)
 def test_utf16_offsets_enforced(self):
  self.text='A 😀 Maytag Q123';self.doc['text']=self.text;self.doc['sha256']=sha(self.text)
  self.ent['product_model']=[e(self.text,'Maytag Q123')]
  self.native['predictions']['a']['sha256']=sha(self.text)
  self.gold['cases']['a']['sha256']=sha(self.text)
  self.neural['cases']['a']['input']=self.text;self.neural['cases']['a']['source_sha256']=sha(self.text)
  with self.assertRaisesRegex(ValueError,'unaligned_span'):evaluate(self.man,self.native,self.neural,self.gold)
if __name__=='__main__':unittest.main()
