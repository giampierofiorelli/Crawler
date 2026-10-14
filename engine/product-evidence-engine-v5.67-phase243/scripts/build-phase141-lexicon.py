"""Offline-only projection of three user-supplied lexical ZIP archives.
Requires PyYAML ONLY for offline regeneration (no PEE runtime dependency).
Usage: python scripts/build-phase141-lexicon.py VADER.zip VERBNET.zip OEWN.zip
The narrow, human-reviewed inventory is intentional: WordNet sense membership
is NOT a validated product-review relation or entailment.
"""
import sys, json, hashlib, re, zipfile, xml.etree.ElementTree as ET
from pathlib import Path
import yaml

out=Path(__file__).resolve().parent.parent
if len(sys.argv)!=4:raise SystemExit('provide the three source ZIP paths in order: vader verbnet oewn')
vader,verbnet,wordnet=map(Path,sys.argv[1:])
for p in [vader,verbnet,wordnet]:
 if not p.is_file():raise SystemExit(f'missing source {p}')
sha=lambda data: hashlib.sha256(data).hexdigest()
zipsha=lambda p: sha(p.read_bytes())

# One explicit sense and part of speech per reviewed domain-constrained surface family.
# Allowed surface lemmas deliberately EXCLUDE dangerous same-synset alternatives.
reviewed={
 '01161188-v':('feature_presence',{'utilize','utilise'},'direct_object'),
 '02332196-v':('feature_presence',{'supply','furnish'},'direct_object'),
 '02636270-v':('feature_presence',{'feature'},'direct_object'),
 '01108050-v':('comparison',{'outmatch','outstrip','outdo'},'direct_object'),
 '02593624-v':('limitation',{'grapple'},'with_complement'),
}
with zipfile.ZipFile(wordnet) as z:
 wordnet_synsets={}
 for name in z.namelist():
  if name.startswith('english-wordnet-main/src/yaml/verb.') and name.endswith('.yaml'):
   data=yaml.safe_load(z.read(name))
   for id_, details in data.items():
    if id_ in reviewed:
     wordnet_synsets[id_]=details
 if len(wordnet_synsets)!=len(reviewed):raise SystemExit(f'missing WordNet senses {set(reviewed)-set(wordnet_synsets)}')
 oewnlicense=z.read('english-wordnet-main/LICENSE.md');princeton=z.read('english-wordnet-main/WNDB_License.txt')
 (out/'research/phase141_licences/OEWN-LICENSE.md').write_bytes(oewnlicense)
 (out/'research/phase141_licences/OEWN-WNDB-LICENSE.txt').write_bytes(princeton)

with zipfile.ZipFile(verbnet) as z:
 index={}
 vnfiles=0
 for name in z.namelist():
  if not re.fullmatch(r'verbnet-master/verbnet3\.4/[^/]+\.xml',name):continue
  vnfiles+=1
  root=ET.fromstring(z.read(name))
  cid=root.attrib.get('ID','')
  roles=sorted(set(e.attrib.get('type','') for e in root.findall('./THEMROLES/THEMROLE')))
  for mem in root.findall('./MEMBERS/MEMBER'):
   lemma=mem.attrib.get('name','').lower()
   if lemma:
    index.setdefault(lemma,[]).append({'class':cid,'roles':roles})
 for v in index.values():v.sort(key=lambda x:x['class'])

with zipfile.ZipFile(vader) as z:
 raw=z.read('vaderSentiment-master/vaderSentiment/vader_lexicon.txt')
 vader_lex={}
 for line in raw.decode('utf8').splitlines():
  parts=line.split('\t')
  if len(parts)>=2:
   try: vader_lex[parts[0]]=float(parts[1])
   except ValueError:continue
 (out/'research/phase141_licences/VADER-LICENSE.txt').write_bytes(z.read('vaderSentiment-master/LICENSE.txt'))

lex=[]
for sid,(kind,allowed,construction) in sorted(reviewed.items()):
 data=wordnet_synsets[sid]; members={s.lower() for s in data.get('members',[])}
 if not allowed<=members:raise SystemExit(f'non-WordNet lemmas! {sid}: {allowed-members}')
 for lemma in sorted(allowed):
  lex.append({'lemma':lemma,'construction':construction,'kind':kind,'wordnetSynset':sid,
              'verbnetClasses':index.get(lemma,[])})

bundle={
 'schema':'pee-lexicon-141-v1','evaluation':'developer-curated-not-independent',
 'provenance':{
  'vader':{'sha256':zipsha(vader),'license':'MIT','source':'https://github.com/cjhutto/vaderSentiment','entries':len(vader_lex),'lexiconSha256':sha(raw)},
  'verbnet':{'sha256':zipsha(verbnet),'license':'VerbNet-3.X-custom-license','source':'https://github.com/cu-clear/verbnet','classes':vnfiles,'lemmaCount':len(index)},
  'wordnet':{'sha256':zipsha(wordnet),'license':'CC-BY-4.0+Princeton-WordNet','source':'https://github.com/globalwordnet/english-wordnet','selectedSynsets':len(reviewed)}},
 'reviewedLexicalCues':lex,'verbnetLemmaIndex':dict(sorted(index.items())),
 'vaderRawValence':dict(sorted(vader_lex.items())),
 'warnings':['WordNet lexical similarity never proves intended sense in context','VerbNet role labels are possible syntactic roles, not parsed arguments','Raw VADER valence is not an aspect-level product assessment','No candidate may write product knowledge or ranking']}
path=out/'resources/phase141/english_lexical_bundle.json'
path.write_text(json.dumps(bundle,ensure_ascii=False,separators=(',',':'),sort_keys=True)+'\n',encoding='utf8')
print(json.dumps({'output':str(path),'bytes':path.stat().st_size,'wordnetCues':len(lex),'verbnetLemmas':len(index),'vaderEntries':len(vader_lex),'verbnetXML':vnfiles},indent=2))
