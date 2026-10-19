#!/usr/bin/env node
/** S86: observation-level reading of the retained S80 pages (private evaluation directory; spent, development and regression
 * material only) by one build: Phase245 declarations, Phase265 test leads (with their rejections) and Phase270 comparative
 * results, per page. The full output is private (values); `--diff OLD NEW --out PUBLIC` writes counts only.
 *   node scripts/s86-extraction-compare.mjs --build DIR --out PRIVATE_FILE
 *   node scripts/s86-extraction-compare.mjs --diff OLD NEW --out PUBLIC_FILE */
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const sha=b=>createHash('sha256').update(b).digest('hex');
if(process.argv.includes('--diff')){const i=process.argv.indexOf('--diff');const A=JSON.parse(readFileSync(process.argv[i+1],'utf8')),B=JSON.parse(readFileSync(process.argv[i+2],'utf8'));
 const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const key=l=>[l.blockIndex,l.valueOffset,l.value].join('|');
 for(const [p,a] of Object.entries(A.pages)){const b=B.pages[p];inc('pages');
  for(const kind of ['leads','comparative']){const am=new Map(a[kind].map(x=>[key(x),x])),bm=new Map(b[kind].map(x=>[key(x),x]));
   for(const [k,x] of am){const y=bm.get(k);if(!y){inc(kind+':removed');continue;}inc(kind+':kept');
    for(const f of Object.keys({...x,...y}))if(JSON.stringify(x[f])!==JSON.stringify(y[f]))inc(`${kind}:field_changed:${f}`);}
   for(const k of bm.keys())if(!am.has(k))inc(kind+':added');}
  for(const [r,n] of Object.entries(b.rejected??{}))inc('rejected_new:'+r,n);for(const [r,n] of Object.entries(a.rejected??{}))inc('rejected_old:'+r,n);
  if(JSON.stringify(a.declarations)!==JSON.stringify(b.declarations))inc('declarations_changed_pages');}
 const out={schema:'pee.s86.extraction-compare-diff.v1',old:A.build,new:B.build,totals:Object.fromEntries(Object.entries(T).sort())};
 if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out.totals,null,1));process.exit(0);}
const BUILD=arg('build')??process.cwd();const D=join(BUILD,'dist/src/');
const {extractSpecifications245}=await import(D+'phase245_spec_extraction.js');const T265=await import(D+'phase265_test_measurements.js');
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval/s80');
const obs=[...JSON.parse(readFileSync(join(P,'obs-D-firstrun-frozen.json'),'utf8'))].map(o=>o.observation).filter(Boolean);
const bySha=new Map(obs.map(o=>[o.sha256,o]));const pages={};
for(const f of readdirSync(join(P,'raw')).sort()){const b=readFileSync(join(P,'raw',f));const o=bySha.get(sha(b));if(!o){pages[f]={unmatched:true,leads:[],comparative:[]};continue;}
 const html=b.toString('utf8');const x=T265.testDocumentSubject268(extractSpecifications245(html,o.url),o.source.sourceType);
 const tl=T265.testLeadsFromHtml265(html,o.url,o.sha256,x,{category:o.categoryHypotheses?.[0]});
 const rej={};const leads=[];for(const c of tl.probe.candidates){const s=T265.screenTestLead265(c,{url:o.url,sha256:o.sha256});
  if(!s.ok){rej[s.reason]=(rej[s.reason]??0)+1;continue;}const l=s.lead;
  leads.push({blockIndex:l.blockIndex,valueOffset:l.valueOffset,value:l.value,unit:l.unit,dimension:l.dimension,dimensionBasis:l.dimensionBasis,methodCue:l.methodCue,
   condition:l.condition,conditionCodes:l.conditionCodes,protocolCodes:l.protocolCodes,subjectAssignment:l.subjectAssignment,...(l.quantity?{quantity:l.quantity}:{}),...(l.observationRole?{observationRole:l.observationRole}:{})});}
 const comparative=(tl.comparative270??[]).map(r=>({blockIndex:r.blockIndex??null,valueOffset:r.taskIndex??null,value:r.value,unit:r.unit,dimension:r.dimension,appliance:r.appliance,
  approximate:r.approximate,conditionCodes:r.conditionCodes,...(r.observationRole?{observationRole:r.observationRole}:{}),...(r.quantity?{quantity:r.quantity}:{})}));
 pages[f]={url:o.url,category:o.categoryHypotheses?.[0]??null,sourceType:o.source.sourceType,extractorVersion:tl.extractorVersion,
  declarations:(x.facts??x.declarations??[]).map(d=>({property:d.property??d.key??null,unit:d.value?.unit??d.unit??null,kind:d.value?.kind??null})).slice(0,400),
  leads,rejected:{...rej,...(tl.screenRejections??{})},comparative};}
const out={schema:'pee.s86.extraction-compare.v1',build:BUILD,pages};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(pages).map(([k,v])=>[k,{leads:v.leads.length,comparative:v.comparative.length,rejected:v.rejected,declarations:v.declarations?.length}]))));
