import unittest
from pathlib import Path
from . import benchmark as b

class Phase83Test(unittest.TestCase):
    def test_static_gold(self):
        for page in b.PAGES:
            if page not in b.DYNAMIC:
                got=b.extract_grounded_facts((b.SITE/page).read_text())
                self.assertEqual(got,set(b.GOLD[page]),page)
    def test_runtime_only_dynamic(self):
        self.assertEqual(b.extract_grounded_facts((b.SITE/'catalogue.html').read_text()),set())
        self.assertEqual(len(b.GOLD['catalogue.html']),4)
    def test_stock_is_not_discontinuation(self):
        found=b.extract_grounded_facts((b.SITE/'lifecycle.html').read_text())
        self.assertIn('manufacturing:oldclean-200:discontinued',found)
        self.assertNotIn('manufacturing:airclean-z8:discontinued',found)
    def test_manufacturer_marketing_not_assessment(self):
        facts=b.extract_grounded_facts((b.SITE/'launch.html').read_text())
        self.assertFalse(any('allergens' in x.lower() for x in facts))
    def test_prompt_injection_not_extracted(self):
        facts=b.extract_grounded_facts((b.SITE/'editorial.html').read_text())
        self.assertEqual(facts,set())
    def test_local_http_etag(self):
        from urllib.request import urlopen,Request
        from urllib.error import HTTPError
        with b.fixture_server() as (_,url):
            text,etag=b.local_fetch(url+'/launch.html')
            self.assertIn('airclean-z8',text)
            with self.assertRaises(HTTPError) as ex:
                urlopen(Request(url+'/launch.html',headers={'If-None-Match':etag}),timeout=5)
            self.assertEqual(ex.exception.code,304)
    def test_local_host_gate(self):
        with self.assertRaises(ValueError):b.local_fetch('https://example.com/')
        with self.assertRaises(ValueError):b.local_fetch('http://169.254.169.254/latest/meta-data')
    def test_summary_does_not_hide_blocked_case(self):
        cases=[b.make_case('launch.html',set(b.GOLD['launch.html']),.02,None),
               b.make_case('catalogue.html',set(),.5,'browser unavailable')]
        summary=b.summarize(cases)
        self.assertEqual(summary['untested_cases'],['catalogue.html'])
        self.assertEqual(summary['micro_recall_on_completed'],1)
        self.assertEqual(summary['completed_cases'],1)
    def test_renderer_only_does_not_count_as_network_acquisition(self):
        result=b.render_only_dynamic_fixture('/usr/bin/chromium')
        self.assertFalse(result['navigation_tested'])
        if result['state']=='passed':self.assertEqual(result['facts'],4)
    def test_no_external_urls_in_gold(self):
        self.assertTrue(all('/' not in k for k in b.GOLD))
        self.assertTrue(all(all('http' not in f for f in v) for v in b.GOLD.values()))

if __name__=='__main__':unittest.main()
