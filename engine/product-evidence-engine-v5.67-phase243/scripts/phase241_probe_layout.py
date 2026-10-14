#!/usr/bin/env python3
"""Optional developer-only geometry baseline, never an evidence or ranking reader.
Requires pdfplumber separately (not a mandatory PEE dependency).
Documents supplied as paths by the developer; no original bytes/text distributed.
Extracts candidate *row/column positions* only if explicit physical table lines
and numeric+unit cells are visible. It does not infer a model or scientific test.
"""
import argparse,hashlib,json,re,os,sys
try:
 import pdfplumber
except ImportError:
 sys.exit('optional pdfplumber not installed: comparison unavailable')
NUMBER_UNIT=re.compile(r'(?<![A-Za-z0-9])[-+]?\d{1,7}(?:[.,]\d+)?\s*(?:mm|cm|kg|g/h|g|kW|W|V|mbar|°C|litres?|L|min)(?![\w/])',re.I)

def read(path,pages):
 sha=hashlib.sha256(open(path,'rb').read()).hexdigest()
 out=[]
 with pdfplumber.open(path) as pdf:
  for pg in pages:
   if pg<1 or pg>len(pdf.pages):continue
   page=pdf.pages[pg-1]
   try:tables=page.find_tables(table_settings={'vertical_strategy':'lines','horizontal_strategy':'lines'})
   except Exception:continue
   for ti,t in enumerate(tables[:15]):
    data=t.extract()
    if not(2<=len(data)<=120):continue
    for ri,row in enumerate(data[:100]):
     if len(row)<2 or len(row)>15:continue
     label=(row[0] or '').strip()
     if not label or not re.search('[A-Za-z]',label) or len(label)>90:continue
     for col,cell in enumerate(row[1:],1):
      if not cell or len(cell)>200:continue
      matches=list(NUMBER_UNIT.finditer(cell))
      # Exactly one unit-bearing quantity in this cell; model column unresolved.
      if len(matches)!=1:continue
      val=matches[0].group().replace('\n',' ')
      # Conserve source location/label, but no product identity, variant, test status.
      out.append({'page':pg,'tableIndex':ti,'rowIndex':ri,'columnIndex':col,
       'rowLabel':label.replace('\n',' ')[:90], 'quantityText':val,
       'status':'unassigned_table_cell_candidate_not_verified',
       'modelAssignment':'unresolved', 'rankingAuthorized':False})
 return {'schema':'pee241.optional-geometry-probe.v1','fileSha256':sha,
  'pagesExamined':pages,'candidateCount':len(out),'candidates':out[:40],
  'runtimeDependencyOptional':'pdfplumber','independentEvidenceAdmitted':False,'rankingAuthorized':False}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('file');p.add_argument('--pages',default='4');a=p.parse_args()
 pages=[int(x) for x in a.pages.split(',') if x.isdigit()][:12]
 print(json.dumps(read(a.file,pages),indent=2,ensure_ascii=False))
