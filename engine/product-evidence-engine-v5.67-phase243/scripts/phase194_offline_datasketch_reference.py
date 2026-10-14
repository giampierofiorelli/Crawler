"""OPTIONAL offline apples-to-apples candidate-generation reference vs user-supplied datasketch source.
No pip/network install and not needed for PEE runtime. Synthetic texts, not independent human gold.
Run with `python scripts/phase194_offline_datasketch_reference.py --datasketch-source /path/to/datasketch-master`.
"""
import argparse,sys,json,re,hashlib,collections,pathlib
parser=argparse.ArgumentParser()
parser.add_argument('--datasketch-source',required=True)
a=parser.parse_args()
sys.path.insert(0,a.datasketch_source)
from datasketch import MinHash,MinHashLSH
base='In this independent experiment the reviewer documented instrument setup measurements and conditions with detailed comparison criteria. The protocol includes room temperature humidity pressure acoustic attenuation equipment calibration and repeated trials. Original test source documentation identifies the exact product model and records limitations without claiming overall product superiority or any unsupported property. The researcher also described subjective usability observations distinct from quantitative measured performance and commercial marketplace advertising descriptions.'
def doc(i):return base.replace('reviewer documented',f'reviewer number {i} documented').replace('equipment calibration',f'facility {i} equipment calibration')
docs={f's{i}':doc(i) for i in range(70)}
for k in range(8):
 s=docs[f's{k}'];docs[f'clone{k}']=s if k%2==0 else s.replace('commercial marketplace advertising descriptions','disclosed online advertising summaries')
def tokens(s):return re.findall(r'\w+',s.lower())
def shingle(s):
 x=tokens(s);return set(' '.join(x[i:i+5]) for i in range(len(x)-4))
sets={k:shingle(v) for k,v in docs.items()}
df=collections.Counter(x for sh in sets.values() for x in sh)
rare={k:{s for s in ss if df[s]<=max(3,round(len(docs)*.25))} for k,ss in sets.items()}
def run(group):
 lsh=MinHashLSH(num_perm=64,params=(16,4))
 sketches={}
 for k,ss in sorted(group.items()):
  if len(ss)<5:continue
  x=MinHash(num_perm=64,seed=313)
  for s in sorted(ss):x.update(s.encode())
  sketches[k]=x
  lsh.insert(k,x)
 candidates=set()
 for k,x in sketches.items():
  for other in lsh.query(x):
   if k>=other:continue
   z=group[k];y=group[other]
   if len(z&y)/len(z|y)>=.60:candidates.add((k,other))
 return sorted(candidates)
r0=run(sets);r1=run(rare)
expected={tuple(sorted((f's{k}',f'clone{k}'))) for k in range(8)}
result={'software':'Original user-supplied datasketch source (local, not installed as PEE dependency)',
 'corpus':'author-generated 78-document synthetic benchmark, not real review corpus',
 'allPairs':len(docs)*(len(docs)-1)//2,
 'unfilteredReferenceCandidates':len(r0),
 'rareShingleReferenceCandidates':len(r1),
 'rareShingleReferenceTrueFixturePairs':len(set(r1)&expected),
 'expectedPairs':len(expected),
 'falseMergeExperimentClaimAuthorized':False,
 'externallyAnnotatedOriginalReviewBenchmark':False}
path=pathlib.Path('evaluation/phase194/datasketch-reference-comparison.json');path.parent.mkdir(parents=True,exist_ok=True)
path.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
