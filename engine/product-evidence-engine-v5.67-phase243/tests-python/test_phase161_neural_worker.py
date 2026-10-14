"""Phase161 worker tests: no network and no pretrained checkpoint used."""
import hashlib
import json
import tempfile
from pathlib import Path
import sys
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import phase161_neural_worker as w


def doc(id, text):
    return {'id':id,'kind':'constructed','rightsBasis':'constructed_original',
            'rightsStatement':'This text is an original fictional test fixture.',
            'category':'coffee','sourceTitle':'Local constructed sample','sourceUrl':'https://example.org/test',
            'sourceRole':'original_product_test','text':text,'sha256':w.sha(text)}


class FakeModel:
    pass


class TestWorker161(unittest.TestCase):
    def test_fingerprint_and_lock(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            for path in w.REQUIRED_FILES:
                (root/path).write_bytes(b'fake-not-real-checkpoint')
            (root/'config.json').write_text('{"architecture":"boundary","model_type":"gliner2"}')
            f=w.fingerprint_checkpoint(root)
            self.assertEqual(len(f['checkpoint_fingerprint']),64)
            lock={'protocol':w.WORKER_PROTOCOL,'model_id':w.MODEL_ID,
                  'checkpoint_fingerprint':f['checkpoint_fingerprint'],
                  'rights_reviewed_by_operator':True,'declared_license':'Apache-2.0'}
            w.verify_operator_lock(f,lock)
            lock['checkpoint_fingerprint']='0'*64
            with self.assertRaisesRegex(ValueError,'fingerprint_mismatch'):w.verify_operator_lock(f,lock)
            (root/'model.safetensors').unlink()
            with self.assertRaisesRegex(ValueError,'missing_model'):w.fingerprint_checkpoint(root)

    def test_cache_and_source_binding(self):
        with tempfile.TemporaryDirectory() as d:
            t='We tested the DeLonghi A12 machine.'
            calls=[]
            def fake(model, text):
                calls.append(text)
                start=text.index('A12');end=start+3
                return {'entities':{k:([{'text':'A12','start':start,'end':end,'confidence':0.9}] if k=='product_model' else []) for k in w.LABELS},
                        'seconds_inference':0.1,'offset_errors':[]}
            m={'protocol':'pee.phase160.batch.v1','datasetId':'pilot161','documents':[doc('coffee',t),doc('coffee2',t+' again')]}
            a, audit=w.run_one_batch(m,FakeModel(),'c'*64,Path(d),'2.1.0',fake)
            self.assertEqual(audit['freshInferCalls'],2)
            self.assertEqual(audit['cacheHits'],0)
            b, audit2=w.run_one_batch(m,FakeModel(),'c'*64,Path(d),'2.1.0',fake)
            self.assertEqual(audit2['cacheHits'],2)
            self.assertEqual(len(calls),2)
            self.assertEqual(b['cases']['coffee']['source_sha256'],w.sha(t))
            m['documents'][0]['sha256']='not-the-source'
            with self.assertRaisesRegex(ValueError,'source_hash'):w.run_one_batch(m,FakeModel(),'c'*64,Path(d),'2.1.0',fake)

    def test_invalid_one_case_does_not_break_batch(self):
        with tempfile.TemporaryDirectory() as d:
            m={'protocol':'pee.phase160.batch.v1','datasetId':'pilot161','documents':[
                doc('bad','The BadMachine was tested.'),doc('good','The GoodMachine was tested.')]}
            def fake(_, text):
                if 'BadMachine' in text:raise RuntimeError('inference_failure')
                return {'entities':{k:[] for k in w.LABELS},'seconds_inference':0.1,'offset_errors':[]}
            report,audit=w.run_one_batch(m,FakeModel(),'e'*64,Path(d),'2.1.0',fake)
            self.assertEqual(list(report['cases']),['good'])
            self.assertIn('bad',audit['failures'])
            self.assertEqual(audit['processed'],1)

    def test_utf16_and_rejection_of_truncated_or_corrupted(self):
        t='🧊 GE model H123 measures 44.9 dBA.'
        self.assertEqual(w.utf16_offset(t,t.index('GE')),3)
        begin=w.utf16_offset(t,t.index('GE'))
        result={'entities':{k:([{'text':'GE','start':begin,'end':begin+2,'confidence':0.95}] if k=='brand' else []) for k in w.LABELS},
                'seconds_inference':0.2,'offset_errors':[]}
        self.assertTrue(w.safe_cache_result(result,t))
        result['entities']['brand'][0]['text']='FAKE'
        self.assertFalse(w.safe_cache_result(result,t))
        result['offset_errors']=['candidate_budget_exceeded']
        self.assertFalse(w.safe_cache_result(result,t))


    def test_watch_mode_loads_once_and_writes_bounded_job_results(self):
        from unittest.mock import patch
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);checkpoint=root/'checkpoint';checkpoint.mkdir()
            for name in w.REQUIRED_FILES:(checkpoint/name).write_bytes(b'fake-local-test-only')
            (checkpoint/'config.json').write_text('{"architecture":"boundary","model_type":"gliner2"}')
            fp=w.fingerprint_checkpoint(checkpoint)
            lock={'protocol':w.WORKER_PROTOCOL,'model_id':w.MODEL_ID,
                  'checkpoint_fingerprint':fp['checkpoint_fingerprint'],
                  'rights_reviewed_by_operator':True,'declared_license':'Apache-2.0'}
            lock_path=root/'operator-lock.json';lock_path.write_text(json.dumps(lock))
            inbox=root/'incoming';inbox.mkdir();out=root/'out'
            manifest={'protocol':'pee.phase160.batch.v1','datasetId':'onejob',
                      'documents':[doc('machine','We tested DemoModel Z000.')]} 
            (inbox/'onejob.json').write_text(json.dumps(manifest))
            class StubExtractor:
                def extract_entities(self,text,labels,**kwargs):
                    i=text.index('DemoModel')
                    return {'entities':{k:([{'text':'DemoModel','start':i,'end':i+9,'confidence':0.7}]
                            if k=='product_model' else []) for k in w.LABELS}}
            with patch.object(w,'load_model',return_value=StubExtractor()) as loader, \
                    patch('importlib.metadata.version',return_value='2.1.0'):
                code=w.main(['--model-dir',str(checkpoint),'--operator-lock',str(lock_path),
                             '--cache-dir',str(root/'cache'),'--watch-dir',str(inbox),
                             '--watch-out-dir',str(out),'--max-jobs','1'])
            self.assertEqual(code,0)
            loader.assert_called_once()
            self.assertTrue((out/'onejob.neural.json').is_file())
            self.assertTrue((out/'onejob.audit.json').is_file())
            result=json.loads((out/'onejob.neural.json').read_text())
            self.assertEqual(len(result['cases']),1)
            self.assertEqual(result['cases']['machine']['entities']['product_model'][0]['text'],'DemoModel')

    def test_document_contract_rights(self):
        m={'protocol':'pee.phase160.batch.v1','datasetId':'pilot161','documents':[doc('x','Hello!')]}
        self.assertEqual(len(w.validate_manifest(m)),1)
        m['documents'][0]['kind']='rights_permitted_full_review'
        with self.assertRaisesRegex(ValueError,'rights_declaration'):w.validate_manifest(m)
        m['documents'][0]['rightsBasis']='permission_granted'
        self.assertEqual(len(w.validate_manifest(m)),1)
        m['documents'][0]['independentGoldAvailable']=True
        with self.assertRaisesRegex(ValueError,'gold_declaration'):w.validate_manifest(m)

if __name__=='__main__':unittest.main()
