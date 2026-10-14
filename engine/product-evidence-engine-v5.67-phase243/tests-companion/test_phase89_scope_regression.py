import unittest
from phase87.html_recipes import _source_scope,Reject

class Phase87ScopeBoundaryRegression(unittest.TestCase):
    def test_path_segment_boundary(self):
        _source_scope('https://maker.example/products/device','maker.example','/products')
        with self.assertRaises(Reject):
            _source_scope('https://maker.example/products-evil/device','maker.example','/products')
    def test_trailing_slash_prefix(self):
        _source_scope('https://maker.example/products/device','maker.example','/products/')
        with self.assertRaises(Reject):
            _source_scope('https://maker.example/products-evil/device','maker.example','/products/')
    def test_url_fragment_rejected(self):
        with self.assertRaises(Reject):
            _source_scope('https://maker.example/products/device#frag','maker.example','/products/')
    def test_prefix_out_of_scope(self):
        with self.assertRaises(Reject):
            _source_scope('https://maker.example/other/device','maker.example','/products/')
