import importlib.util, pathlib, subprocess, sys, tempfile, unittest, json
ROOT=pathlib.Path(__file__).resolve().parents[1]
def mod(name):
    p=ROOT/'scripts'/name
    s=importlib.util.spec_from_file_location(name,p);m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
class Test158(unittest.TestCase):
    def test_jsonld_valid_metadata_preserved(self):
        parser=mod('phase158_extruct_jsonld_port.py')
        s=b'<html><script type="application/ld+json">{"@type":"Product","name":"Ninja Flex","model":"AF451"}</script></html>'
        result=parser.jsonld(s)
        self.assertEqual(result['json-ld'][0]['model'],'AF451')
        self.assertFalse(result['extructFullLibraryExecuted'])
    def test_malformed_does_not_invent_product(self):
        parser=mod('phase158_extruct_jsonld_port.py')
        result=parser.jsonld('<script type="application/ld+json">{broken:true}</script>')
        self.assertEqual(result['json-ld'],[]);self.assertEqual(len(result['errors']),1)
    def test_no_network_checkpoint_nonexistent(self):
        p=subprocess.run([sys.executable,str(ROOT/'scripts/phase158_local_gliner_runner.py'),
           '--model-dir','/a-definitely-nonexistent-peemodel','--source-file','-'],input=b'GE Fridge',capture_output=True)
        self.assertEqual(p.returncode,2)
        self.assertIn(b'checkpoint_directory_missing',p.stderr)
    def test_html_budget(self):
        parser=mod('phase158_extruct_jsonld_port.py')
        with self.assertRaisesRegex(ValueError,'budget'):
            parser.jsonld('x'*2_000_001)
if __name__=='__main__':unittest.main()
