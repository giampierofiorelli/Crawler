#!/usr/bin/env node
/** N1 L3 and L4 (preregistration evaluation/n1/preregistration.json) on the sealed fresh requests (evaluation/n1/q-freeze.json).
 *  L4: the need interpretation with arms A (no knowledge), B (statements, R3-P arm B) and BN1 (B plus recovered row claims,
 *      same code: needInterpretation.claims) scored as in scripts/r3p-needs-check.mjs (found, acceptable, invented, harmful).
 *  L3: knowledge retrieved for each request (retrieveKnowledgeN1): R0 statements, R1 claims, top 5, with the category PEE
 *      recognised (null when none) and with the category withheld (null); a blind pool (shuffled, no arm ids) for the judge.
 * Store: a copy of the store copy that holds the claims (scripts/n1-materialise.mjs); never the live store.
 * Usage: node scripts/n1-needs-check.mjs LABEL --store STORE_WITH_CLAIMS   (writes evaluation/n1/needs-check-LABEL.json;
 *        detail and the judge pool privately; never overwrites; refuses material that differs from its seal) */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!/^[a-z0-9-]+$/.test(LABEL)||!arg('store'))throw Error('usage: LABEL --store STORE_WITH_CLAIMS');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const E=new URL('../evaluation/n1/',import.meta.url).pathname;const OUT=join(E,`needs-check-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'n1');
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const fz=JSON.parse(readFileSync(join(E,'q-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(join(PE,f))!==h)throw Error(f+' differs from its seal');
const AUTH=new Map(JSON.parse(readFileSync(join(PE,'q/q-requests-authored.json'),'utf8')).requests.map(r=>[r.id,r]));
const REQ=JSON.parse(readFileSync(join(PE,'q/requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(PE,'q/reference.json'),'utf8')).requests.map(r=>[r.id,r]));
const D=new URL('../dist/src/',import.meta.url).pathname;const I=m=>import(join(D,m));
const {KnowledgeStore246}=await I('phase246_knowledge_store.js');const {adviseFromRequest253}=await I('phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await I('phase248_category_registry.js');const QK=await I('quantity_knowledge.js');const {retrieveKnowledgeN1}=await I('need_interpretation.js');
const cdir=join(homedir(),'.cache-i2','n1');mkdirSync(cdir,{recursive:true});const copy=join(cdir,`needs-${LABEL}.sqlite`);copyFileSync(arg('store'),copy);
const store=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const words=t=>new Set(String(t).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=4));
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const rows=[];const pool=[];const ARMS=['A','B','BN1'];
let seed=20261024;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
for(const r of REQ){const ref=REF.get(r.id),au=AUTH.get(r.id);if(!ref||ref.notABuyingRequest){inc('notBuying');continue;}
 const E_=new Set((ref.needs??[]).filter(n=>n.basis==='expressed').map(n=>n.label)),I_=new Set((ref.needs??[]).filter(n=>n.basis==='inferred').map(n=>n.label));
 const ACC=new Set(ref.acceptable??[]),NOT=new Set((ref.notNeeds??[]).map(n=>n.label).filter(Boolean));
 const G=[`named:${au.named}`,`category:${au.category}`,au.category==='dehumidifiers'?'set:heldout_tables':'set:development_tables'];
 const g=(k,n=1)=>{inc(k,n);for(const x of G)inc(x+'|'+k,n);};
 g('requests');g('ref:expressed',E_.size);g('ref:inferred',I_.size);
 const dec={};let recognised=null;
 for(const arm of ARMS){const a=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:{knowledgeGuided:arm!=='A',claims:arm==='BN1'}});
  const ni=a.needInterpretation;recognised=a.category??null;
  const sys=new Set([...ni.expressed.map(e=>e.concept),...(arm==='A'?[]:ni.inferred.map(i=>i.concept))]);
  for(const x of E_)g(`${arm}:expressed_found`,sys.has(x)?1:0);for(const x of I_)g(`${arm}:inferred_found`,sys.has(x)?1:0);
  for(const s of sys){if(E_.has(s)||I_.has(s))g(`${arm}:correct`);else if(ACC.has(s))g(`${arm}:acceptable`);else g(`${arm}:invented`);
   if(NOT.has(s))g(`${arm}:harmful_negatedNeed`);
   if((ref.features??[]).some(f=>f.outcomeItSuggests===s)&&!E_.has(s)&&!I_.has(s))g(`${arm}:feature_read_as_need`);}
  g(`${arm}:inferred_recovered_relation`,ni.inferred.filter(i=>i.provenance==='recovered_relation').length);
  const applied=a.constraints.filter(c=>c.status==='stated_in_request');
  for(const L of ref.limits??[])if(L.handling!=='apply'&&applied.some(c=>Math.abs(Number(c.value)-Number(L.value))<1e-9))g(`${arm}:harmful_appliedWhenNot`);
  dec[arm]=JSON.stringify([a.response,a.category,a.needs,a.constraints,a.excluded,a.shortlist,a.statements,a.questions,a.unassessedObjectives,a.ranked??null]);
  rows.push({id:r.id,arm,needs:[...sys],inferred:ni.inferred.map(i=>({concept:i.concept,support:i.support,provenance:i.provenance,path:i.path})),category:recognised});}
 // inferred needs must never change the decision: every arm on one build gives the same answer
 if(new Set(Object.values(dec)).size>1)g('harm:decisionChangedByKnowledge');
 g(recognised?'category_recognised':'category_not_recognised');
 // L3 retrieval
 for(const [mode,cat] of [['recognised',recognised],['withheld',null]])for(const [arm,source] of [['R0','statements'],['R1','claims']]){
  const top=retrieveKnowledgeN1(store,r.text,{categoryId:cat,source,k:5});g(`L3:${mode}:${arm}:requests_with_items`,top.length?1:0);g(`L3:${mode}:${arm}:items`,top.length);
  g(`L3:${mode}:${arm}:items_in_request_category`,top.filter(t=>t.categoryId===au.category).length);
  for(const t of top)pool.push({request:r.id,mode,arm,ref:t.ref,categoryId:t.categoryId,text:t.text.slice(0,700)});}}
// blind pool: one entry per (request, item), arms and modes removed, shuffled
const byKey=new Map();for(const p of pool){const k=p.request+'|'+p.ref;if(!byKey.has(k))byKey.set(k,{request:p.request,ref:p.ref,text:p.text,from:[]});byKey.get(k).from.push(p.mode+':'+p.arm);}
const items=[...byKey.values()].map(x=>({x,k:rnd()})).sort((a,b)=>a.k-b.k).map(({x},i)=>({item:'P'+String(i).padStart(4,'0'),...x}));
const judgeInput={requests:REQ.map(r=>({id:r.id,text:r.text})),items:items.map(i=>({item:i.item,request:i.request,text:i.text}))};
const judgeKey=items.map(i=>({item:i.item,request:i.request,ref:i.ref,from:i.from}));
const pub={schema:'pee.n1.needs-check.v1',label:LABEL,arms:ARMS,seal:fz.files,storeCopySha256:sha(arg('store')),
 tier:'requests: Claude-authored by an independent agent (T1); reference: two blind Claude-agent annotations adjudicated by a third (no human validation)',totals:T,poolItems:items.length};
writeFileSync(OUT,JSON.stringify(pub,null,1)+'\n');mkdirSync(join(PE,'runs'),{recursive:true});
writeFileSync(join(PE,'runs',`needs-check-${LABEL}.json`),JSON.stringify({...pub,rows,pool},null,1)+'\n');
writeFileSync(join(PE,'runs',`l3-judge-input-${LABEL}.json`),JSON.stringify(judgeInput,null,1)+'\n');writeFileSync(join(PE,'runs',`l3-judge-key-${LABEL}.json`),JSON.stringify(judgeKey,null,1)+'\n');
console.log(JSON.stringify(T));
