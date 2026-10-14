import unittest
from phase95.review_html import read

class OriginalReviewReaderTests(unittest.TestCase):
    def test_battery_parsed_with_anc(self):
        r=read('<html><body><article><h1>Sony WH-1000XM5 Headphones Review</h1>'
          '<p>Our lab test found 31 hours and 53 minutes with ANC on during the battery runtime test.</p>'
          '</article></body></html>','Sony WH-1000XM5')
        self.assertEqual(len(r['facts']),1)
        self.assertAlmostEqual(r['facts'][0]['number'],31.883333,5)
        self.assertEqual(r['facts'][0]['usage'],'anc_on')
    def test_cannot_assign_comparison_to_single_model(self):
        with self.assertRaisesRegex(ValueError,'multi_product'):
            read('<h1>Sony WH-1000XM5 vs Bose QC Ultra comparison</h1><p>Sonys last 31 hours on ANC.</p>', 'Sony WH-1000XM5')
    def test_wrong_model_cannot_sneak_in(self):
        with self.assertRaisesRegex(ValueError,'exact_model'):
            read('<h1>Sony WH-1000XM4 Review</h1><p>Battery lasts 27 hours.</p>', 'Sony WH-1000XM5')
    def test_fake_paywall_score_ignored(self):
        r=read('<h1>Sony WH-1000XM5 Review</h1><p>Locked 0.0 hours battery runtime. Join Now.</p>', 'Sony WH-1000XM5')
        self.assertEqual(r['facts'],[])
    def test_manufacturer_claim_not_lab(self):
        r=read('<h1>Sony WH-1000XM5 Review</h1><p>The manufacturer advertises 40 hours of battery life.</p>','Sony WH-1000XM5')
        self.assertEqual(r['facts'],[])
    def test_conflicting_runtime_refuses(self):
        with self.assertRaisesRegex(ValueError,'conflicting_article'):
            read('<h1>Sony WH-1000XM5 Review</h1><p>Battery tested 22 hours.</p><p>Battery lasted 30 hours.</p>','Sony WH-1000XM5')
    def test_inline_tag_non_contiguous_anchor_not_invented(self):
        r=read('<h1>Sony WH-1000XM5 Review</h1><p>Battery runtime: 27 <b>hours</b> with ANC on.</p>','Sony WH-1000XM5')
        self.assertEqual(r['facts'],[])
    def test_navigation_suppressed(self):
        r=read('<nav><p>Battery life 90 hours</p></nav><h1>Sony WH-1000XM5 Review</h1><p>Battery life measured at 27 hours ANC on.</p>', 'Sony WH-1000XM5')
        self.assertEqual(r['facts'][0]['number'],27)
    def test_headline_needs_exact_model(self):
        with self.assertRaisesRegex(ValueError,'one_review_heading'):
            read('<h2>Sony WH-1000XM5 Review</h2><p>Battery life 27 hours</p>','Sony WH-1000XM5')

if __name__ == '__main__':unittest.main()

class ComparisonModelTests(unittest.TestCase):
    text=('<h1>Bose QuietComfort Ultra Headphones vs Sony WH-1000XM5</h1>'
          '<p>Our shared ANC battery lab test found the Sony WH-1000XM5 lasting 31 hours and 53 minutes with ANC on, '
          'while the Bose QuietComfort Ultra Headphones lasted 27 hours and 37 minutes under identical conditions.</p>')
    models=['Sony WH-1000XM5','Bose QuietComfort Ultra Headphones']
    def test_comparison_assigns_sony_only_to_sony(self):
        r=read(self.text,self.models[0],self.models)
        self.assertEqual(len(r['facts']),1)
        self.assertAlmostEqual(r['facts'][0]['number'],31.883333,places=5)
    def test_comparison_assigns_bose_only_to_bose(self):
        r=read(self.text,self.models[1],self.models)
        self.assertEqual(len(r['facts']),1)
        self.assertAlmostEqual(r['facts'][0]['number'],27.616667,places=5)
    def test_comparison_cannot_invent_model_roster(self):
        with self.assertRaisesRegex(ValueError,'multi_product'):
            read(self.text,self.models[0],[self.models[0],'Sennheiser Momentum 4'])
