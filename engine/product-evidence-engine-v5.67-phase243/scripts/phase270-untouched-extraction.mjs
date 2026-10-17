#!/usr/bin/env node
/** Phase270 untouched-extraction evaluation: runs the operational test-lead path (extractSpecifications245 →
 * testDocumentSubject268 → testLeadsFromHtml265, exactly as phase246-live-wave.mjs `observations`) and the qualitative
 * reader (qualitativeObservations269) on the Phase270 pilot's transient bytes, and scores them against the private gold
 * annotated before any run (private-eval/phase270/untouched-extraction-gold.json).
 * Writes the full run (values) to the private evaluation directory and a value-free summary to evaluation/phase270/.
 * Never overwrites a run. Usage: node scripts/phase270-untouched-extraction.mjs LABEL
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';import {homedir} from 'node:os';import {join} from 'node:path';
import {extractSpecifications245} from '../dist/src/phase245_spec_extraction.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../dist/src/phase265_test_measurements.js';
import {qualitativeObservations269} from '../dist/src/phase269_qualitative_observations.js';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const P=join(homedir(),'.local/share/product-evidence-engine/private-eval/phase270');
const PRIV=join(P,`untouched-extraction-${label}.json`),PUB=`evaluation/phase270/untouched-extraction-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: runs are never overwritten');
const G=JSON.parse(readFileSync(join(P,'untouched-extraction-gold.json'),'utf8'));const goldSha=createHash('sha256').update(readFileSync(join(P,'untouched-extraction-gold.json'))).digest('hex');
const S=JSON.parse(readFileSync(join(P,'wave.json'),'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
// Scoring vocabulary, fixed before the first run and applied identically to every run.
const UNIT={min:['minutes'],kWh:['kwh'],p:['p','pence'],'GBP/yr':['gbp/yr']};
const MEASURAND_DIM={duration_per_completed_task:'duration',energy_per_completed_task:'energy'};
const DISH={jacket_potato:'potatoes',baked_potatoes_4:'potatoes',halloumi_fries:'halloumi_fries',sausages:'sausages',chips_standard_test:'chips'};
const dish=d=>DISH[d]??d;
const modelCode=s=>(String(s).match(/\b[A-Z]{1,5}[0-9][A-Z0-9-]{2,}\b|\b\d{6}\b/g)??[]);
const docs=[];const Q={gold:0,matched:0,leads:0,subjectCorrect:0,dimensionCorrect:0},QL={gold:0,matched:0,extracted:0};
const byMeasurand={};
for(const tag of G.documents){
 const p=S.pages.find(x=>x.tag===tag);const b=readFileSync(join(P,'raw',tag+'.html'));if(sha(b)!==p.sha256)throw Error('receipt mismatch '+tag);
 const html=b.toString('utf8'),url=p.finalUrl??p.url;
 const x=testDocumentSubject268(extractSpecifications245(html,url),p.sourceType);
 // The lead set is everything the operational path extracts: the Phase225/226 product leads and (from Phase270) the
 // comparative results. Matching and scoring rules are unchanged from the first run.
 const tl=testLeadsFromHtml265(html,url,p.sha256,x,{category:p.category});
 const cands=[...tl.probe.candidates,...(tl.comparative270??[]).map(c=>({...c,publisherDeclaredDimension:c.dimension==='cost'?'other':c.dimension,methodCue:'comparative_'+c.form}))];
 const gold=G.quantitative.filter(g=>g.doc===tag);const used=new Set();const matches=[];
 for(const g of gold){
  (byMeasurand[g.measurand]??={gold:0,matched:0}).gold++;
  const i=cands.findIndex((c,k)=>!used.has(k)&&typeof g.value==='number'&&Math.abs(c.value-g.value)<1e-9&&(UNIT[g.unit]??[]).includes(String(c.unit).toLowerCase()));
  if(i<0)continue;used.add(i);byMeasurand[g.measurand].matched++;
  const c=cands[i];const codes=modelCode(g.subject);
  const subjOk=codes.length?!!c.subject&&codes.some(m=>[c.subject.name,c.subject.model,c.subject.sku].some(s=>s&&String(s).includes(m))):c.subject===null||c.subjectAssignment!=='page_context_unverified';
  const dimOk=!MEASURAND_DIM[g.measurand]||c.publisherDeclaredDimension===MEASURAND_DIM[g.measurand]||c.publisherDeclaredDimension===undefined;
  matches.push({gold:g,lead:{value:c.value,unit:c.unit,subject:c.subject,subjectAssignment:c.subjectAssignment,dimension:c.publisherDeclaredDimension??null,methodCue:c.methodCue,conditionCodes:c.conditionCodes??[]},subjectCorrect:subjOk,dimensionCorrect:dimOk});
 }
 const extra=cands.filter((c,k)=>!used.has(k)).map(c=>({value:c.value,unit:c.unit,subject:c.subject,methodCue:c.methodCue,dimension:c.publisherDeclaredDimension??null}));
 Q.gold+=gold.length;Q.matched+=matches.length;Q.leads+=cands.length;Q.subjectCorrect+=matches.filter(m=>m.subjectCorrect).length;Q.dimensionCorrect+=matches.filter(m=>m.dimensionCorrect).length;
 // Qualitative.
 const {observations}=qualitativeObservations269(html);const qg=G.qualitative.filter(g=>g.doc===tag);const qu=new Set();let qm=0;
 for(const g of qg){const i=observations.findIndex((o,k)=>!qu.has(k)&&o.dish===dish(g.dish)&&o.outcome===g.outcome&&o.direction===g.direction);if(i>=0){qu.add(i);qm++;}}
 QL.gold+=qg.length;QL.matched+=qm;QL.extracted+=observations.length;
 docs.push({tag,quantitative:{gold:gold.length,leads:cands.length,matched:matches.length,matches,extra},
  qualitative:{gold:qg.length,extracted:observations.length,matched:qm,extra:observations.filter((o,k)=>!qu.has(k)).map(o=>({dish:o.dish,outcome:o.outcome,direction:o.direction}))}});
}
const r=(a,b)=>b?Math.round(1000*a/b)/1000:null;
const summary={quantitative:{gold:Q.gold,leads:Q.leads,matched:Q.matched,precision:r(Q.matched,Q.leads),recall:r(Q.matched,Q.gold),exactSubjectAttribution:r(Q.subjectCorrect,Q.matched),dimensionAgreement:r(Q.dimensionCorrect,Q.matched),byMeasurand},
 qualitative:{gold:QL.gold,extracted:QL.extracted,matched:QL.matched,precision:r(QL.matched,QL.extracted),recall:r(QL.matched,QL.gold)}};
const meta={label,at:new Date().toISOString(),goldSha256:goldSha};
writeFileSync(PRIV,JSON.stringify({schema:'pee270.untouched-extraction-run.v1',...meta,summary,docs},null,1)+'\n');
// Public: counts per document and the value-free shape of each false positive (unit, dimension, cue, subject kind).
writeFileSync(PUB,JSON.stringify({schema:'pee270.untouched-extraction-run-public.v1',...meta,summary,
 documents:docs.map(d=>({tag:d.tag,quantitative:{gold:d.quantitative.gold,leads:d.quantitative.leads,matched:d.quantitative.matched,
  falsePositives:d.quantitative.extra.map(e=>({unit:e.unit,dimension:e.dimension,methodCue:e.methodCue,subject:e.subject?'named':'none'}))},
  qualitative:{gold:d.qualitative.gold,extracted:d.qualitative.extracted,matched:d.qualitative.matched,falsePositives:d.qualitative.extra}}))},null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
