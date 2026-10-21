#!/usr/bin/env node
/** FA-I1 scoring (preregistered metrics and gates, evaluation/fa-i1/preregistration.json). Reads the private run files
 * (inventory, judgements J1/J2, adjudication, validation, diagnostic judgement and inference outputs) and writes:
 *  - public counts only: evaluation/fa-i1/<LABEL>-scores.json
 *  - private detail: $PEE_PRIVATE_EVAL_DIR/fa-i1/runs/<LABEL>-detail.json
 * Usage: node scripts/fa-i1-score.mjs LABEL */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const LABEL=process.argv[2];if(!LABEL)throw Error('usage: LABEL');
const OUT=new URL(`../evaluation/fa-i1/${LABEL}-scores.json`,import.meta.url).pathname;if(existsSync(OUT))throw Error(OUT+' exists');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'fa-i1');
const J=p=>JSON.parse(readFileSync(join(PE,p),'utf8'));const has=p=>existsSync(join(PE,p));
const L=await import('./fa-i1-lib.mjs');
const sample=new Map(J('sample.json').items.map(x=>[x.item,x]));
const inv=new Map([...J('runs/inventory-1.json').items,...J('runs/inventory-2.json').items].map(x=>[x.item,x.units]));
const enc=new Map([1,2,3,4].flatMap(k=>J(`runs/encoding-${k}.json`).items).map(x=>[x.item,x]));
const val=J('runs/validation.json').items;
const j1=['a','b','c','d','e'].flatMap(k=>J(`runs/judge-1${k}.json`).items);
const j2=has('runs/judge-2a.json')?['a','b'].flatMap(k=>J(`runs/judge-2${k}.json`).items):[];
const adj=has('runs/adjudication.json')?new Map(J('runs/adjudication.json').decisions.map(d=>[d.key,d])):new Map();
const CRIT=['negation','essential_condition','identity','provenance','efficacy_status','modality'];
const SCHEMA_CAUSES=new Set(['schema','schema_ambiguity']);
// one record per unit (inventory units + missed units), with the final verdict (adjudication over J1)
const units=[];
for(const it of j1){const kind=sample.get(it.item)?.kind;const invU=new Map((inv.get(it.item)??[]).map(u=>[u.u,u]));
 const add=(u,key,src)=>{const a=adj.get(key);const f=a?{...u,expressible:a.expressible??u.expressible,cause:a.cause??u.cause,schemaGap:a.schemaGap??u.schemaGap,fix:a.fix??u.fix,adjCritical:a.critical}:u;
  const flags=invU.get(u.u)?.critical??u.critical??[];units.push({key,item:it.item,kind,src,type:invU.get(u.u)?.type??u.type??'missed',flags,...f,adjudicated:!!a});};
 for(const u of it.units??[])add(u,u.u,'inventory');(it.missedUnits??[]).forEach((u,i)=>add(u,`${it.item}-m${String(i+1).padStart(2,'0')}`,'missed'));}
// a validating fix proves expressibility of an encoding-caused loss; otherwise the loss counts against the schema
const fixValid=u=>{if(!u.fix)return false;try{const base=enc.get(u.item)??{entities:[],assertions:[]};const fx=typeof u.fix==='string'?JSON.parse(u.fix):u.fix;
 const ents=new Map(base.entities.map(e=>[e.id,e]));for(const e of fx.entities??[])ents.set(e.id,e);const asr=new Map(base.assertions.map(a=>[a.id,a]));for(const a of fx.assertions??[])asr.set(a.id,a);
 if(!(fx.entities?.length||fx.assertions?.length))return false;return L.validateEncoding({entities:[...ents.values()],assertions:[...asr.values()]}).errors.length===0;}catch{return false;}};
for(const u of units){u.critical=(u.criticalLoss??[]).length>0;u.fixValidates=u.cause==='encoding'?fixValid(u):null;
 u.schemaCritical=u.critical&&(SCHEMA_CAUSES.has(u.cause)||(u.cause==='encoding'&&!u.fixValidates)||u.cause==='rule');
 u.encodingCritical=u.critical&&u.cause==='encoding'&&u.fixValidates;}
const rate=(xs,f)=>xs.length?+(xs.filter(f).length/xs.length).toFixed(3):null;
const block=xs=>({units:xs.length,expressible:rate(xs,u=>u.expressible==='yes'),expressiblePartial:rate(xs,u=>u.expressible==='partial'),conversionFaithful:rate(xs,u=>u.encoded==='faithful'),
 freeTextOnly:rate(xs,u=>u.encoded==='free_text_only'),reconstructionOfFaithful:rate(xs.filter(u=>u.encoded==='faithful'),u=>u.reconstructed==='faithful'),reconstructionOverall:rate(xs,u=>u.reconstructed==='faithful'),
 criticalLosses:xs.filter(u=>u.critical).length,schemaCriticalLosses:xs.filter(u=>u.schemaCritical).length,encodingCriticalLosses:xs.filter(u=>u.encodingCritical).length});
const byKind=Object.fromEntries(['package_row','store_concept','qk_aspect','pd_property'].map(k=>[k,block(units.filter(u=>u.kind===k))]));
const byType=Object.fromEntries([...new Set(units.map(u=>u.type))].sort().map(t=>[t,block(units.filter(u=>u.type===t))]));
const byAspect=Object.fromEntries(CRIT.map(a=>[a,block(units.filter(u=>u.flags.includes(a)))]));
const lossByAspect=Object.fromEntries(CRIT.map(a=>[a,{schema:units.filter(u=>u.schemaCritical&&(u.criticalLoss??[]).includes(a)).length,encoding:units.filter(u=>u.encodingCritical&&(u.criticalLoss??[]).includes(a)).length}]));
const causes={};for(const u of units)causes[u.cause??'none']=(causes[u.cause??'none']??0)+1;
// per-item (macro) view: the QK/PD items have many more units (term lists), so the per-item mean is reported as well
const items=[...new Set(units.map(u=>u.item))];const macro=f=>+(items.reduce((s,i)=>{const xs=units.filter(u=>u.item===i);return s+(xs.filter(f).length/Math.max(1,xs.length));},0)/items.length).toFixed(3);
// provenance and epistemic per item (J1)
const prov={yes:0,partial:0,no:0},epi={yes:0,partial:0,no:0};for(const it of j1){prov[it.provenancePreserved]=(prov[it.provenancePreserved]??0)+1;epi[it.epistemicCorrect]=(epi[it.epistemicCorrect]??0)+1;}
const validItems=Object.values(val).filter(v=>!v.errors.length).length;
// J1/J2 agreement on the overlap
const kappa=(pairs)=>{const n=pairs.length;if(!n)return null;const po=pairs.filter(([a,b])=>a===b).length/n;const cats=[...new Set(pairs.flat())];const pe=cats.reduce((s,c)=>s+(pairs.filter(p=>p[0]===c).length/n)*(pairs.filter(p=>p[1]===c).length/n),0);return {n,agreement:+po.toFixed(3),kappa:pe===1?1:+((po-pe)/(1-pe)).toFixed(3)};};
const j1u=new Map(j1.flatMap(it=>(it.units??[]).map(u=>[u.u,u])));const pairs=j2.flatMap(it=>(it.units??[]).filter(u=>j1u.has(u.u)).map(u=>[j1u.get(u.u),u]));
const cls=c=>SCHEMA_CAUSES.has(c)?'schema':c==='encoding'?'encoding':c==='none'||!c?'none':'other';
const agreement=j2.length?{items:j2.length,unitsPaired:pairs.length,expressible:kappa(pairs.map(([a,b])=>[a.expressible,b.expressible])),encoded:kappa(pairs.map(([a,b])=>[a.encoded,b.encoded])),
 reconstructed:kappa(pairs.map(([a,b])=>[a.reconstructed,b.reconstructed])),causeClass:kappa(pairs.map(([a,b])=>[cls(a.cause),cls(b.cause)])),criticalLossPresence:kappa(pairs.map(([a,b])=>[!!(a.criticalLoss??[]).length,!!(b.criticalLoss??[]).length].map(String)))}:null;
// diagnostic
let diag=null;if(has('runs/diag-judgement.json')){const d=J('runs/diag-judgement.json').cases;const lines=d.flatMap(c=>c.lines.map(l=>({...l,case:c.id})));
 const al=lines.filter(l=>l.kind==='allowed'),fo=lines.filter(l=>l.kind==='forbidden');const fcause={};for(const l of lines)if(!['reached','avoided'].includes(l.verdict))fcause[l.kind+':'+l.cause]=(fcause[l.kind+':'+l.cause]??0)+1;
 diag={cases:d.length,allowed:al.length,allowedReached:al.filter(l=>l.verdict==='reached').length,allowedWrongQualification:al.filter(l=>l.verdict==='reached_with_wrong_qualification').length,
  allowedReachedExclEncodingCase:rate(al.filter(l=>!['encoding','case'].includes(l.cause)||l.verdict==='reached'),l=>l.verdict==='reached'),
  forbidden:fo.length,forbiddenAvoided:fo.filter(l=>l.verdict==='avoided').length,forbiddenDerivedByRuleOrSchema:fo.filter(l=>l.verdict==='derived'&&['rule','schema'].includes(l.cause)).length,
  forbiddenDerivedByEncoding:fo.filter(l=>l.verdict==='derived'&&l.cause==='encoding').length,failuresByCause:fcause,unexpectedWrong:d.reduce((s,c)=>s+(c.unexpectedWrong?.length??0),0)};}
const overall=block(units);const crit=Object.values(byAspect);
const gates={G1_noSchemaCriticalLoss:{value:overall.schemaCriticalLosses,pass:overall.schemaCriticalLosses===0},
 G2_expressiveness:{overall:overall.expressible,minCriticalAspect:Math.min(...crit.map(b=>b.expressible??1)),minStratum:Math.min(...Object.values(byKind).map(b=>b.expressible??1)),
  pass:overall.expressible>=0.9&&crit.every(b=>(b.expressible??1)>=0.9)&&Object.values(byKind).every(b=>(b.expressible??1)>=0.8)},
 G3_reconstruction:{value:overall.reconstructionOfFaithful,pass:(overall.reconstructionOfFaithful??0)>=0.9},
 G4_provenanceEpistemic:{provenanceYes:+(prov.yes/j1.length).toFixed(3),pass:prov.yes/j1.length>=0.95},
 G5_inference:diag?{forbiddenDerivedByRuleOrSchema:diag.forbiddenDerivedByRuleOrSchema,allowedReachedExclEncodingCase:diag.allowedReachedExclEncodingCase,pass:diag.forbiddenDerivedByRuleOrSchema===0&&(diag.allowedReachedExclEncodingCase??0)>=0.9}:{pass:null,note:'not scored'},
 G6_agreement:agreement?{criticalLossPresence:agreement.criticalLossPresence,conclusive:(agreement.criticalLossPresence?.agreement??0)>=0.8}:{conclusive:null}};
const admit=gates.G1_noSchemaCriticalLoss.pass&&gates.G2_expressiveness.pass&&gates.G3_reconstruction.pass&&gates.G4_provenanceEpistemic.pass&&gates.G5_inference.pass===true&&gates.G6_agreement.conclusive===true;
const schemaGaps={};for(const u of units)if(SCHEMA_CAUSES.has(u.cause)||u.schemaCritical){const g=(u.schemaGap??'unspecified').slice(0,120);schemaGaps[g]=(schemaGaps[g]??0)+1;}
writeFileSync(OUT,JSON.stringify({schema:'pee.fa-i1.scores.v1',label:LABEL,note:'counts only; detail private',items:j1.length,wellFormedItems:validItems,
 overall,macroPerItem:{expressible:macro(u=>u.expressible==='yes'),conversionFaithful:macro(u=>u.encoded==='faithful'),reconstructionOverall:macro(u=>u.reconstructed==='faithful')},
 byStratum:byKind,byUnitType:byType,byCriticalAspect:byAspect,criticalLossesByAspectAndCause:lossByAspect,causes,provenancePreserved:prov,epistemicCorrect:epi,agreement,diagnostic:diag,
 adjudicatedUnits:units.filter(u=>u.adjudicated).length,gates,admitModel:admit},null,1)+'\n');
writeFileSync(join(PE,`runs/${LABEL}-detail.json`),JSON.stringify({units,schemaGaps},null,1));
console.log(JSON.stringify({overall,gates,admit},null,1));
