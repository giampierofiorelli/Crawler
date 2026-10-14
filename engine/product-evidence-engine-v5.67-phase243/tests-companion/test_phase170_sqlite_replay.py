"""Phase170: actual sqlite transactions, not simulated in-memory receipt lists."""
import concurrent.futures
from pathlib import Path
import os
import sqlite3
import subprocess
import sys
import tempfile
import unittest
import json

SCRIPT=Path(__file__).resolve().parent.parent/'scripts'/'phase170_replay_ledger.py'


def envelope(receipts=None, revision=1, epoch=0, fingerprint='b'*64, question='a'*64,
             session='session_alpha', turn='turn_one'):
    return {'phase':170,'sessionId':session,'epoch':epoch,'revision':revision,
            'turnId':turn,'questionSha256':question,'revisionFingerprint':fingerprint,
            'receiptIds':receipts if receipts is not None else ['receipt_one'],
            'rankingAuthorized':False,'publicationAuthorized':False,'humanIdentityVerified':False}


class LedgerTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.db=Path(self.tmp.name)/'ledger.sqlite3'

    def tearDown(self):self.tmp.cleanup()

    def run_cli(self,p,db=None):
        cp=subprocess.run([sys.executable,str(SCRIPT),'--db',str(db or self.db)],
             input=json.dumps(p),capture_output=True,text=True,timeout=9)
        return cp

    def test_first_receipt_admits_with_explicit_no_ranking(self):
        cp=self.run_cli(envelope());self.assertEqual(cp.returncode,0,cp.stderr)
        response=json.loads(cp.stdout)
        self.assertEqual(response['status'],'admitted_research_only')
        self.assertFalse(response['rankingAuthorized']);self.assertFalse(response['humanIdentityVerified'])

    def test_receipt_replay_blocked_across_process_restarts(self):
        self.assertEqual(self.run_cli(envelope()).returncode,0)
        cp=self.run_cli(envelope());self.assertEqual(cp.returncode,2)
        self.assertIn('receipt_replay',cp.stderr)

    def test_atomic_batch_replay_rolls_back_new_receipt(self):
        self.run_cli(envelope())
        cp=self.run_cli(envelope(['receipt_new','receipt_one']))
        self.assertEqual(cp.returncode,2)
        self.assertEqual(self.run_cli(envelope(['receipt_new'])).returncode,0)

    def test_stale_epoch_or_revision_rejected(self):
        self.run_cli(envelope(['receipt_high'],revision=4,epoch=3))
        self.assertIn('stale_session_revision',self.run_cli(envelope(['receipt_low'],revision=3,epoch=3)).stderr)
        self.assertIn('stale_session_revision',self.run_cli(envelope(['receipt_older'],revision=99,epoch=2)).stderr)
        self.assertEqual(self.run_cli(envelope(['receipt_fresh'],revision=0,epoch=4)).returncode,0)

    def test_same_revision_cannot_change_question_turn_or_binding(self):
        self.run_cli(envelope())
        for altered in [envelope(['other_a'],fingerprint='c'*64),
                        envelope(['other_b'],turn='turn_two'),envelope(['other_c'],question='d'*64)]:
            cp=self.run_cli(altered);self.assertEqual(cp.returncode,2)
            self.assertIn('conflicting_revision_binding',cp.stderr)

    def test_distinct_valid_receipts_same_revision_are_allowed(self):
        self.assertEqual(self.run_cli(envelope()).returncode,0)
        self.assertEqual(self.run_cli(envelope(['receipt_two'])).returncode,0)

    def test_rejects_invalid_unsafe_flags_and_duplicate_ids(self):
        for mod in [dict(rankingAuthorized=True),dict(humanIdentityVerified=True),
                    dict(publicationAuthorized=True),dict(epoch=True),
                    dict(receiptIds=['receipt_one','receipt_one']),
                    dict(receiptIds=['receipt_two','receipt_one']),
                    dict(receiptIds=[]),dict(questionSha256='bad')]:
            v={**envelope(),**mod}
            self.assertNotEqual(self.run_cli(v).returncode,0,str(mod))

    def test_directory_permissions_enforced(self):
        with tempfile.TemporaryDirectory() as tmp:
            os.chmod(tmp,0o755)
            cp=self.run_cli(envelope(),Path(tmp)/'ledger.sqlite3')
            self.assertNotEqual(cp.returncode,0)
            self.assertIn('database_directory_not_private',cp.stderr)

    def test_symlink_to_database_rejected(self):
        self.assertEqual(self.run_cli(envelope()).returncode,0)
        link=Path(self.tmp.name)/'link.sqlite3';link.symlink_to(self.db)
        cp=self.run_cli(envelope(['receipt_two']),link)
        self.assertEqual(cp.returncode,2)
        self.assertIn('database_symlink_forbidden',cp.stderr)

    def test_concurrent_processes_only_one_can_admit(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            trials=list(executor.map(self.run_cli,[envelope() for _ in range(6)]))
        self.assertEqual(sum(c.returncode==0 for c in trials),1,[c.stderr for c in trials])
        with sqlite3.connect(self.db) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM consumed').fetchone()[0],1)

    def test_no_other_receipts_inserted_on_failed_group(self):
        self.run_cli(envelope(['receipt_one','receipt_two']))
        self.assertEqual(self.run_cli(envelope(['receipt_two','receipt_three'])).returncode,2)
        with sqlite3.connect(self.db) as db:
            self.assertEqual(db.execute('SELECT COUNT(*) FROM consumed').fetchone()[0],2)

if __name__=='__main__':unittest.main()
