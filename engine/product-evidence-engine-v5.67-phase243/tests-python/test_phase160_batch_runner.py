import importlib.util, unittest, pathlib, hashlib
from unittest.mock import patch
modpath=pathlib.Path(__file__).resolve().parents[1]/'scripts/phase160_gliner_batch.py'
spec=importlib.util.spec_from_file_location('p160',modpath)
p160=importlib.util.module_from_spec(spec);spec.loader.exec_module(p160)
class FakeModel:
 def extract_entities(self, text, labels, include_confidence, include_spans):
  entities={k:[] for k in labels}
  if 'Maytag' in text:
   start=text.index('Maytag');entities['brand']=[{'text':'Maytag','start':start,'end':start+6,'confidence':0.8}]
  return {'entities':entities}
class BatchTest(unittest.TestCase):
 def test_codepoint_to_utf16(self):
  text='💡 Maytag'
  self.assertEqual(p160.utf16_offset(text,2),3)
  x=p160.infer_document(FakeModel(),text)
  self.assertEqual(x['entities']['brand'][0]['start'],3)
  self.assertEqual(x['offset_errors'],[])
 def test_window_retains_full_text_and_recovers_near_end(self):
  text='word '*400+'Maytag'
  chunks=list(p160.character_windows(text))
  self.assertGreater(len(chunks),1)
  self.assertTrue(any('Maytag' in t for _,t in chunks))
  r=p160.infer_document(FakeModel(),text)
  self.assertEqual(r['entities']['brand'][0]['start'],2000)
 def test_batch_contract_and_digests(self):
  text='Maytag fridge';a={'id':'fridge','kind':'constructed','rightsBasis':'constructed_original',
   'text':text,'sha256':p160.sha(text),'sourceUrl':'https://example.org/fridge','sourceTitle':'Test fridge'}
  with patch('importlib.metadata.version',return_value='2.1.0'):
   r=p160.execute({'protocol':'pee.phase160.batch.v1','documents':[a]},FakeModel())
  self.assertEqual(len(r['cases']),1)
  self.assertEqual(r['cases']['fridge']['source_sha256'],p160.sha(text))
  a['sha256']='bad'
  with self.assertRaisesRegex(ValueError,'digest'):p160.execute({'protocol':'pee.phase160.batch.v1','documents':[a]},FakeModel())
if __name__=='__main__':unittest.main()
