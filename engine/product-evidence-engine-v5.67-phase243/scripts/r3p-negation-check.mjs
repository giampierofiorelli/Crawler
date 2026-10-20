#!/usr/bin/env node
/** R3-P stage 1 (evaluation/r3p/preregistration.json): the sealed negation material scored for one frozen build.
 *   node scripts/r3p-negation-check.mjs LABEL --build ENGINE_DIR
 * Requests: the S103 scorer (scripts/s103-request-check.mjs, same matching and handling classes) plus the stances of the
 * R3-P guide. Documents: each passage read as a page by the gated reading path (scientific_reading98.readPage98); every
 * reference value matched to a reading of the same value and unit, in order of appearance.
 * Writes evaluation/r3p/negation-check-LABEL.json (counts only) and the per-item detail to the private evaluation
 * directory; never overwrites. Refuses material whose hashes differ from evaluation/r3p/negation-freeze.json. */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const bi=process.argv.indexOf('--build');const BUILD=bi>0?process.argv[bi+1]:null;
if(!LABEL||!/^[a-z0-9-]+$/.test(LABEL)||!BUILD)throw Error('usage: LABEL --build ENGINE_DIR');
const E=new URL('../evaluation/r3p/',import.meta.url).pathname;const OUT=join(E,`negation-check-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3p');const N=join(PE,'negation');
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const fz=JSON.parse(readFileSync(join(E,'negation-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(join(N,f))!==h)throw Error(f+' differs from its seal');
const J=f=>JSON.parse(readFileSync(join(N,f),'utf8'));
const REQ=J('requests.json').requests,REF=new Map(J('request-reference.json').requests.map(r=>[r.id,r]));
const PAS=J('passages.json').passages,DREF=new Map(J('document-reference.json').passages.map(p=>[p.id,p.values]));
const D=join(BUILD,'dist/src/');const I=m=>import(join(D,m));
const {extractConstraints253}=await I('phase253_request_constraints.js');const P249=await I('phase249_decision.js');
const {KnowledgeStore246}=await I('phase246_knowledge_store.js');const {adviseFromRequest253}=await I('phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await I('phase248_category_registry.js');const QK=await I('quantity_knowledge.js');
const SR=await I('scientific_reading98.js');const {extractSpecifications245}=await I('phase245_spec_extraction.js');
const {testLeadsFromHtml265,testDocumentSubject268}=await I('phase265_test_measurements.js');const {qualitativeObservations269}=await I('phase269_qualitative_observations.js');
const live=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const cdir=join(homedir(),'.cache-r3p');mkdirSync(cdir,{recursive:true});const copy=join(cdir,`neg-${LABEL}.sqlite`);copyFileSync(live,copy);const store=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
// ---- requests (the S103 scorer's matching)
const CRIT={'capacity|min':'capacity_min','capacity|max':'capacity_max','water_tank|min':'water_tank_capacity_min','width|max':'width_max','height|max':'height_max','depth|max':'depth_max',
 'weight|max':'weight_max','power|min':'power_min','power|max':'power_max','battery_life|min':'battery_life_min','price|max':'budget_max'};
const UNIT={volume:'l',length:'mm',mass:'g',power:'W',duration:'h'};
const unitOf=u=>{const x=String(u??'').toLowerCase().trim();return /^(?:litres?|liters?|l)$/.test(x)?'l':/^ml$/.test(x)?'ml':/^cm$/.test(x)?'cm':/^mm$/.test(x)?'mm':/^kg$/.test(x)?'kg':/^g$/.test(x)?'g':/^kw$/.test(x)?'kW':/^w$/.test(x)?'W':
 /^(?:hours?|h|hrs?)$/.test(x)?'h':/^(?:minutes?|mins?|min)$/.test(x)?'min':/^(?:gbp|£|pounds?|quid)$/.test(x)?'gbp':/^(?:usd|\$|dollars?)$/.test(x)?'usd':/^(?:eur|€|euros?)$/.test(x)?'eur':x;};
const base=(crit,value,unit)=>{const s=P249.SPEC_CRITERIA249[crit]??{budget_max:{dimension:'price'},capacity_max:{dimension:'volume'},power_max:{dimension:'power'}}[crit];if(!s)return null;
 if(s.dimension==='price')return {v:Number(value),c:unitOf(unit)};const b=P249.comparable249({kind:'quantity',number:Number(value),unit:unitOf(unit),approximate:false},s.dimension,UNIT[s.dimension]);return b===null?null:{v:Number(b.toPrecision(10)),c:''};};
const same=(a,b)=>a&&b&&a.c===b.c&&Math.abs(a.v-b.v)<=Math.max(1e-9,Math.abs(a.v)*1e-6);
const opp=c=>c.replace(/_min$/,'_MAX').replace(/_max$/,'_min').replace('_MAX','_max');
const handlingOf=s=>s==='stated_in_request'?'apply':s==='candidate'?'ask':'report';
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const rows=[];
const STOP=new Set(['the','a','an','of','for','and','or','to','in','on','it','its','with','about']);
for(const r of REQ){const ex=extractConstraints253(r.text).constraints;const ref=REF.get(r.id)??{limits:[],stances:[]};
 const a=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-20'});const used=new Set();
 for(const L of ref.limits??[]){const crit=CRIT[`${L.property}|${L.side}`];inc('ref:limits');
  if(!crit){inc('ref:outOfScope');rows.push({id:r.id,text:L.text,ref:L.handling,scope:'out'});continue;}
  inc('ref:inScope');const want=base(crit,L.value,L.unit);
  const i=ex.findIndex((c,j)=>!used.has(j)&&c.criterion===crit&&same(base(crit,c.value,c.unit),want));
  if(i<0){// the same value read with the opposite side: an inverted reading
   const k=ex.findIndex((c,j)=>!used.has(j)&&c.criterion===opp(crit)&&same(base(c.criterion,c.value,c.unit),base(c.criterion,L.value,L.unit)));
   if(k>=0){used.add(k);inc('wrongSide');const got=handlingOf(ex[k].status);if(got==='apply')inc('harmful:wrongSideApplied');rows.push({id:r.id,text:L.text,crit,ref:L.handling,got,wrongSide:true});continue;}
   inc('missed');if(L.handling==='apply')inc('missed:apply');rows.push({id:r.id,text:L.text,crit,ref:L.handling,got:null});continue;}
  used.add(i);const c=ex[i];const got=handlingOf(c.status);inc('detected');inc(`handling:${L.handling}->${got}`);if(got===L.handling)inc('handling:exact');
  if(got==='apply'&&L.handling!=='apply')inc('harmful:appliedWhenNot');if(got!=='apply'&&L.handling==='apply')inc(got==='ask'?'overCautious:askedWhenApply':'missedApply:reportedWhenApply');
  const cl=c.closure??'inclusive';inc(cl===L.closure?'closure:agree':'closure:disagree');rows.push({id:r.id,text:L.text,crit,ref:L.handling,got,closure:cl,refClosure:L.closure});}
 ex.forEach((c,j)=>{if(used.has(j))return;inc('extra');if(c.status==='stated_in_request')inc('harmful:extraApplied');rows.push({id:r.id,text:c.span,crit:c.criterion,ref:null,got:handlingOf(c.status)});});
 // stances: what the answer turns into a need, an objective or an applied limit
 const outText=JSON.stringify([a.needs??[],a.unassessedObjectives??[],(a.constraints??[]).filter(c=>c.status==='stated_in_request').map(c=>c.property+' '+c.criterion)]).toLowerCase().replace(/_/g,' ');
 for(const s of ref.stances??[]){inc('stance:'+s.stance);const ws=String(s.aspect).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=3&&!STOP.has(w));
  const present=ws.some(w=>outText.includes(w));
  if((s.stance==='indifferent'||s.stance==='rejected')&&present){inc('harmful:stanceBecameNeed');rows.push({id:r.id,stance:s.stance,aspect:s.aspect,harmful:true});}
  if((s.stance==='wanted'||s.stance==='required')){inc(present?'stance:wantedKept':'stance:wantedLost');}}
 inc('response:'+a.response);rows.push({id:r.id,response:a.response});}
// ---- documents
const ROLE={result:'result',specification:'specification',condition:'condition',other:'other'};
const unitN=u=>String(u??'').toLowerCase().replace(/\s+/g,'').replace('³','^3').replace('m3','m^3');
for(const p of PAS){const html=`<html><body>${p.html}</body></html>`;const url=`https://r3p.invalid/${p.id}`;const h=createHash('sha256').update(html).digest('hex');
 const x=testDocumentSubject268(extractSpecifications245(html,url),'independent_original_test');
 const sci=SR.readPage98(html,url,h,x,testLeadsFromHtml265(html,url,h,x,{category:null}),qualitativeObservations269(html).observations,null,'independent_original_test');
 const factByKey=new Map(x.facts.map(f=>[SR.declarationKey98(f),f]));
 const got=[...sci.document.map(d=>({value:d.value,unit:d.unit,r:d.reading,via:'document'})),
  ...sci.declarations.map(d=>{const f=factByKey.get(d.key);const v=f?.value;return {value:v?.kind==='quantity'?v.number:null,unit:v?.unit??null,r:d.reading,via:'declaration'};}).filter(g=>g.value!==null)];
 const used=new Set();
 for(const v of DREF.get(p.id)??[]){inc('doc:refValues');const i=got.findIndex((g,j)=>!used.has(j)&&Math.abs(Number(g.value)-Number(v.value))<1e-9);
  if(i<0){inc('doc:notRead');rows.push({doc:p.id,value:v.value,ref:v.role,got:null});continue;}
  used.add(i);const g=got[i];const role=g.r.statement?.role??'unresolved',nat=g.r.nature,prov=g.r.provenance;inc('doc:read');
  if(role==='unresolved')inc('doc:role:abstain');else{inc('doc:role:decided');if(role===v.role)inc('doc:role:correct');}
  if(nat==='unresolved')inc('doc:nature:abstain');else{inc('doc:nature:decided');if(nat===v.nature)inc('doc:nature:correct');}
  if(prov==='unresolved')inc('doc:prov:abstain');else{inc('doc:prov:decided');if(prov===v.provenance)inc('doc:prov:correct');}
  // harmful: a publisher result read as a maker declaration; a non-result read as a publisher measurement
  if(v.role==='result'&&role==='specification')inc('doc:harmful:resultReadAsDeclaration');
  if(v.role!=='result'&&role==='result')inc('doc:harmful:inventedMeasurement');
  rows.push({doc:p.id,value:v.value,ref:[v.role,v.nature,v.provenance],got:[role,nat,prov],via:g.via});}}
const pub={schema:'pee.r3p.negation-check.v1',label:LABEL,build:BUILD,seal:fz.files,tier:'T1 (Claude-authored requests and synthetic passages; blind Claude reference r3p-neg-blind-1)',totals:T};
writeFileSync(OUT,JSON.stringify(pub,null,1)+'\n');mkdirSync(join(PE,'runs'),{recursive:true});writeFileSync(join(PE,'runs',`negation-check-${LABEL}.json`),JSON.stringify({...pub,rows},null,1)+'\n');
console.log(JSON.stringify(T));
