#!/usr/bin/env node
/** Deterministic, offline synthetic fixture evaluation; no network or real products. */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const gold={
 'two-columns':[['weight',215,'g','BOOT-A1'],['length',290,'mm','BOOT-A1'],['height',10,'cm','BOOT-A1']],
 'single-row':[],
 'parallel-variants':[],
 'multi-model':[['weight',215,'g',null],['length',290,'mm',null]],
 'invalid-unit':[],
 'interloper':[],
 'duplicate-two-paths':[['weight',215,'g','BOOT-A1'],['length',290,'mm','BOOT-A1']]
};
const key=(r)=>JSON.stringify(r);
const records=[];let tp=0,fp=0,fn=0,elapsed=0;
for(const [name,truth] of Object.entries(gold)){
 const bytes=readFileSync(`evaluation/phase229/SYNTHETIC-${name}.pdf`);
 const started=performance.now();const result=await parseDocumentBytes228(bytes,'pdf');const ms=performance.now()-started;elapsed+=ms;
 const expected=new Set(truth.map(key));const actual=new Set(result.claims.map(c=>key([c.label,c.value,c.unit,c.model])));
 const matches=[...actual].filter(x=>expected.has(x)).length;
 const unexpected=[...actual].filter(x=>!expected.has(x));
 const missed=[...expected].filter(x=>!actual.has(x));
 tp+=matches;fp+=unexpected.length;fn+=missed.length;
 records.push({name,expected:expected.size,observed:actual.size,correct:matches,falseAssociations:unexpected.length,missed:missed.length,elapsedMs:Math.round(ms),rankings:0,reasonCodes:result.reasonCodes});
}
const precision=tp+fp?tp/(tp+fp):null;const recall=tp+fn?tp/(tp+fn):null;
const output={schema:'pee229.synthetic-pdf-geometry-evaluation.v1',mode:'synthetic_local_only',realVendorDocuments:0,liveSearches:0,
 parser:'Poppler -bbox-layout + bounded two-column alignment; existing plain keys preserved',
 methodology:'Hand-authored fictional PDFs and explicit expected cells; not a real-world accuracy benchmark',
 totals:{documents:records.length,truePositive:tp,falseAssociation:fp,missed:fn,precision,recall,elapsedMs:Math.round(elapsed)},cases:records,
 qualityGate:'all candidates remain unverified; rankings not authorized'};
mkdirSync('docs/phase229',{recursive:true});
writeFileSync('docs/phase229/PHASE229-SYNTHETIC-PDF-EVALUATION.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output.totals));
if(fp>0||fn>0)process.exitCode=1;
