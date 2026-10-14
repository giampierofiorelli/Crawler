import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from phase163_relation_eval import evaluate
from phase160_gliner_batch import sha

TEXT='Aster R4 delivered 40 dBA noise.'
def part(w):
    s=TEXT.index(w)
    return {'text':w,'start':s,'end':s+len(w),'confidence':0.9}
def relation():
    return {'type':'product_has_feature','head':part('Aster R4'),'tail':part('noise'),
            'entityTypeCheck':'matched','identityVerified':False,'scientificEvidence':False,
            'canonicalWriteAuthorized':False,'rankingAuthorized':False}
def fixture():
    doc={'id':'d1','text':TEXT,'sha256':sha(TEXT),'kind':'constructed'}
    manifest={'protocol':'pee.phase160.batch.v1','datasetId':'test1','documents':[doc]}
    coord={'protocol':'pee.phase161.coordination.v1','datasetId':'test1',
           'cases':[{'id':'d1','result':'processed','neuralProcessed':True,
                     'documentSha256':sha(TEXT),'relationCandidates':[relation()]}]}
    gold={'protocol':'pee.phase163.relation.gold.v1','datasetId':'test1',
          'annotationProcess':'developer_constructed','cases':{'d1':{'sha256':sha(TEXT),'relations':[relation()]}}}
    return manifest,coord,gold
class RelationsEval(unittest.TestCase):
    def test_true_match_unverified(self):
        result=evaluate(*fixture())
        self.assertEqual(result['candidateCounts']['tp'],1)
        self.assertFalse(result['qualityClaimAuthorized'])
    def test_bad_source_and_approval_rejected(self):
        m,c,g=fixture();c['cases'][0]['relationCandidates'][0]['scientificEvidence']=True
        with self.assertRaisesRegex(ValueError,'unearned_authority'):evaluate(m,c,g)
        m,c,g=fixture();g['cases']['d1']['sha256']='00'
        with self.assertRaisesRegex(ValueError,'source_digest_mismatch'):evaluate(m,c,g)
    def test_untagged_ends_count_unconfirmed(self):
        m,c,g=fixture();c['cases'][0]['relationCandidates'][0]['entityTypeCheck']='mismatch_or_missing'
        r=evaluate(m,c,g)
        self.assertEqual(r['candidateCounts']['tp'],1)
        self.assertEqual(r['typedMatchedCounts']['fn'],1)
if __name__=='__main__':unittest.main()
