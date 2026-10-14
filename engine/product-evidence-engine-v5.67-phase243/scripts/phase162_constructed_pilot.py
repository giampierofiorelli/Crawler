#!/usr/bin/env python3
"""Replay only the TWO real Colab neural outputs from Phase159.
Constructed texts and manually labelled spans: never independent benchmark.
"""
import json
import hashlib
from pathlib import Path
from phase162_benchmark import LABELS, sha

repo=Path(__file__).resolve().parents[1]
source=json.loads((repo/'research/phase159/GLINER25-COLAB-CONSTRUCTED-PILOT.json').read_text())
folder=repo/'research/phase162';folder.mkdir(exist_ok=True)
manifest={'protocol':'pee.phase160.batch.v1','datasetId':'phase162_constructed_colab_replay','documents':[]}
gold={'protocol':'pee.phase162.gold.v1','datasetId':manifest['datasetId'],
      'annotationProcess':'developer_constructed','cases':{}}
# Deliberately human-specified targets for the examples, not copied from model predictions.
annotation={
 'constructed_fridge':{
  'product_model':['MRT311FFFE','GTS22KGNRWW'],
  'brand':['Maytag','GE'],
  'product_feature':['cooling noise'],
  'measured_value':['44.9 dBA']},
 'constructed_coffee':{
  'product_model':["De'Longhi Dedica Duo",'Breville Bambino','Bambino','Dedica Duo'],
  'brand':["De'Longhi",'Breville'],
  'product_feature':['steam wand'],
  'measured_value':[]}
 }
for name,raw in source['cases'].items():
 text=raw['input']
 cat='refrigerator' if name=='constructed_fridge' else 'coffee_machine'
 url='https://example.org/pee-constructed/'+name
 manifest['documents'].append({'id':name,'kind':'constructed','rightsBasis':'constructed_original',
  'rightsStatement':'Original developer constructed diagnostic, not a published professional review',
  'category':cat,'sourceTitle':'PEE constructed '+cat+' pilot','sourceUrl':url,
  'sourceRole':'original_product_test','text':text,'sha256':sha(text),'independentGoldAvailable':False})
 labels={}
 for label in LABELS:
  labels[label]=[]
  for token in annotation[name][label]:
   # An abbreviated mention can legitimately occur later in the text.
   start=0
   while True:
    pos=text.find(token,start)
    if pos<0:break
    before=text[pos-1:pos] if pos else ''
    after=text[pos+len(token):pos+len(token)+1]
    if (not before or not before.isalnum()) and (not after or not after.isalnum()):
     a=len(text[:pos].encode('utf-16-le'))//2
     b=a+len(token.encode('utf-16-le'))//2
     labels[label].append({'start':a,'end':b,'text':token})
    start=pos+len(token)
  # Dedupe spans if a shortened token is contained at the same positions? exact ranges distinct.
 gold['cases'][name]={'sha256':sha(text),'entities':labels}
 raw['source_sha256']=sha(text)
 raw['source_url']=url
 raw['source_title']='PEE constructed '+cat+' pilot'
(folder/'phase162_constructed_manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
(folder/'phase162_developer_gold.json').write_text(json.dumps(gold,indent=2)+'\n')
source['experiment']='Phase162 exact replay of genuine Phase159 Colab predications on constructed input'
(folder/'phase162_colab_replay.json').write_text(json.dumps(source,indent=2)+'\n')
print('Prepared',len(manifest['documents']),'constructed cases; no neural inference performed')
if __name__=='__main__':pass
