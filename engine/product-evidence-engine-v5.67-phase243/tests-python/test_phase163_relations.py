"""Only API-contract/stub verification: no local pretrained GLiNER2.5 loaded."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from phase163_neural_relations import extract_relations_163
from phase161_neural_worker import safe_cache_result,run_one_batch
from phase160_gliner_batch import sha

TEXT='We measured noise on the Maytag MRT311FFFE at 44.9 dBA.'
def ep(chunk,surface):
    start=chunk.index(surface)
    return {'text':surface,'start':start,'end':start+len(surface),'confidence':0.9}
class FakeRelations:
    def __init__(self,alter=False):self.calls=0;self.alter=alter
    def extract_relations(self,chunk,labels,**kwargs):
        self.calls+=1
        if 'MRT311FFFE' not in chunk:return {'relation_extraction':{}}
        h=ep(chunk,'MRT311FFFE'); t=ep(chunk,'44.9 dBA')
        if self.alter:t['start']+=1
        return {'relation_extraction':{'product_has_feature':[{'head':h,'tail':t}]}}
class Relations(unittest.TestCase):
    def test_reuses_real_gliner_api_shape_and_offsets(self):
        model=FakeRelations();res=extract_relations_163(model,TEXT)
        self.assertEqual(model.calls,1)
        self.assertEqual(len(res['relation_candidates']),1)
        self.assertEqual(res['relation_candidates'][0]['head']['text'],'MRT311FFFE')
        self.assertFalse(res['relation_candidates'][0]['scientificEvidence'])
    def test_fails_bad_offsets_instead_of_silently_omitting(self):
        with self.assertRaisesRegex(ValueError,'relation_endpoint_unaligned'):
            extract_relations_163(FakeRelations(alter=True),TEXT)
    def test_preserves_utf16_offsets_for_emoji(self):
        t='🧊 '+TEXT;result=extract_relations_163(FakeRelations(),t)
        head=result['relation_candidates'][0]['head']
        self.assertEqual(t.encode('utf-16-le')[2*head['start']:2*head['end']].decode('utf-16-le'),'MRT311FFFE')
    def test_refuses_unsafe_cached_relations(self):
        base={'entities':{'product_model':[],'brand':[],'product_feature':[],'measured_value':[]},'offset_errors':[],
              **extract_relations_163(FakeRelations(),TEXT)}
        self.assertTrue(safe_cache_result(base,TEXT,require_relations=True))
        base['relation_candidates'][0]['head']['text']='made up'
        self.assertFalse(safe_cache_result(base,TEXT,require_relations=True))
    def test_separate_worker_cache_keys_per_inference_mode(self):
        doc={'id':'fridge','kind':'constructed','rightsBasis':'constructed_original',
             'rightsStatement':'Developer made diagnostic','text':TEXT,'sha256':sha(TEXT),'category':'fridge',
             'sourceTitle':'Diagnostic','sourceUrl':'https://example.org/test','sourceRole':'original_product_test'}
        manifest={'protocol':'pee.phase160.batch.v1','datasetId':'test_relation_163','documents':[doc]}
        def infer(model,t):
            return {'entities':{'product_model':[],'brand':[],'product_feature':[],'measured_value':[]},
                    'offset_errors':[],'seconds_inference':0.1,**extract_relations_163(model,t)}
        with tempfile.TemporaryDirectory() as tmp:
            model=FakeRelations()
            a,b=run_one_batch(manifest,model,'a'*64,Path(tmp),'2.1.0',infer=infer,with_relations=True)
            self.assertEqual(b['freshInferCalls'],1)
            self.assertEqual(b['cacheHits'],0)
            a,b=run_one_batch(manifest,model,'a'*64,Path(tmp),'2.1.0',infer=infer,with_relations=True)
            self.assertEqual(b['freshInferCalls'],0)
            self.assertEqual(b['cacheHits'],1)
            # A relation-disabled run must not treat relation-enabled cache as its own.
            a,b=run_one_batch(manifest,model,'a'*64,Path(tmp),'2.1.0',infer=lambda m,t:{'entities':{
                'product_model':[],'brand':[],'product_feature':[],'measured_value':[]},'offset_errors':[],'seconds_inference':0.1})
            self.assertEqual(b['cacheHits'],0)

if __name__=='__main__':unittest.main()
