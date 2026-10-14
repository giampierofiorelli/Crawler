import unittest
from unittest.mock import MagicMock
from ingestion.export_approved import export_snapshot, VARIANTS_SQL, EVIDENCE_SQL

class ExportTests(unittest.TestCase):
    def test_uses_eligibility_view_and_fresh_offers(self):
        self.assertIn('scoring_eligible_measurements', EVIDENCE_SQL)
        self.assertIn('48 hours', VARIANTS_SQL)
        self.assertIn("availability='in_stock'", VARIANTS_SQL)
        self.assertNotIn('FROM measurement m', EVIDENCE_SQL)

    def test_read_only_transaction_and_two_queries(self):
        conn=MagicMock(); cur=conn.cursor.return_value.__enter__.return_value
        cur.description=[('id',)]; cur.fetchall.side_effect=[[('A-UK',)],[('ev-1',)]]
        result=export_snapshot(conn)
        self.assertEqual(result['origin'],'live-postgres-eligible-view')
        self.assertEqual(result['variants'],[{'id':'A-UK'}])
        self.assertEqual(result['evidence'],[{'id':'ev-1'}])
        self.assertEqual(cur.execute.call_count,3)
        self.assertIn('READ ONLY',cur.execute.call_args_list[0].args[0])

if __name__=='__main__': unittest.main()
