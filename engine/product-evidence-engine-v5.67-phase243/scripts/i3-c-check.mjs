#!/usr/bin/env node
/** Third increment, C on the sealed fresh requests R (evaluation/i3/preregistration.json; seal evaluation/i3/r-freeze.json).
 * Arms: C0 (operational path: category = commitment, its first question), C1 (C without claims), C2 (C with row claims).
 * Measures: objects and roles, named-product family, hypotheses (primary hit, justified, invented, unjustified families),
 * action vs sufficiency, justification completeness, harm; writes the blind judge inputs for questions (C vs C0, shuffled)
 * and for the relevance of hypothesis support (sample). Refuses material that differs from its seal; never overwrites.
 * Usage: node scripts/i3-c-check.mjs LABEL --store STORE_COPY_WITH_CLAIMS */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!/^[a-z0-9-]+$/.test(LABEL)||!arg('store'))throw Error('usage: LABEL --store STORE_COPY');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const E=new URL('../evaluation/i3/',import.meta.url).pathname;const OUT=join(E,`c-check-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists');
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval/i3');const R=join(PE,'r');
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const fz=JSON.parse(readFileSync(join(E,'r-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(join(R,f))!==h)throw Error(f+' differs from its seal');
const REQ=JSON.parse(readFileSync(join(R,'requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(R,'reference.json'),'utf8')).requests.map(r=>[r.id,r]));
const D=new URL('../dist/src/',import.meta.url).pathname;const I=m=>import(join(D,m));
const {KnowledgeStore246}=await I('phase246_knowledge_store.js');const {adviseFromRequest253}=await I('phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await I('phase248_category_registry.js');const {goalUnderstandingC}=await I('goal_understanding_c.js');const QK=await I('quantity_knowledge.js');
const copy=join(homedir(),'.cache-i2','n1',`c-check-${LABEL}.sqlite`);copyFileSync(arg('store'),copy);const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const REG=new Set(CATEGORY_REGISTRY250.map(r=>r.id));
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const rows=[];const qPairs=[];const supportSample=[];
let seed=20261026;const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
const decision=a=>JSON.stringify([a.response,a.category,a.needs,a.constraints,a.excluded,a.shortlist,a.statements,a.questions,a.unassessedObjectives,a.ranked??null]);
for(const r of REQ){const ref=REF.get(r.id);const g=[`type:${ref.type}`,`sufficient:${ref.sufficient}`,'all'];const G=(k,n=1)=>{for(const x of g)inc(x+'|'+k,n);};
 const a=adviseFromRequest253(r.text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});const before=decision(a);
 const P=new Set(ref.plausibleFamilies.map(f=>f.family)),PRIM=new Set(ref.plausibleFamilies.filter(f=>f.strength==='primary').map(f=>f.family)),A=new Set(ref.acceptableFamilies??[]),U=new Set((ref.unjustifiedFamilies??[]).map(f=>typeof f==='string'?f:f.family));
 const reachablePrim=[...PRIM].filter(f=>REG.has(f));const rejected=new Set(ref.objects.filter(o=>o.role==='rejected').map(o=>o.family));
 const expected=ref.sufficient===true?'commit':ref.sufficient==='nothing_fits'?'abstain':'ask';
 G('messages');G('reachable_primary',reachablePrim.length?1:0);
 const arms={C0:{H:a.category?[a.category]:[],action:a.category?'commit':a.questions.length?'ask':'abstain',requested:a.category??null,question:a.questions[0]??null,objects:[],hyps:[]}};
 for(const [arm,claims] of [['C1',false],['C2',true]]){const c=goalUnderstandingC(r.text,a,s,{qk,claims});
  arms[arm]={H:[...new Set([...(c.committed?[c.committed]:[]),...c.hypotheses.map(h=>h.family)])],action:c.action,requested:c.requested??c.committed,question:c.question?.text??null,objects:c.objects,hyps:c.hypotheses};}
 if(decision(a)!==before)G('harm:answer_changed');
 for(const [arm,x] of Object.entries(arms)){
  if(ref.type==='named')G(`${arm}:named_family_correct`,x.requested&&PRIM.has(x.requested)?1:0);
  if(ref.type!=='named'){G(`${arm}:nonnamed_messages`);G(`${arm}:primary_hit`,x.H.some(f=>PRIM.has(f))?1:0);G(`${arm}:primary_hit_reachable`,reachablePrim.length&&x.H.some(f=>PRIM.has(f))?1:0);}
  G(`${arm}:hypotheses`,x.H.length);G(`${arm}:justified`,x.H.filter(f=>P.has(f)||A.has(f)).length);G(`${arm}:invented`,x.H.filter(f=>!P.has(f)&&!A.has(f)).length);
  G(`${arm}:unjustified_family_named_by_reference`,x.H.filter(f=>U.has(f)).length);G(`harm:${arm}:rejected_family_hypothesised`,x.H.filter(f=>rejected.has(f)).length);
  G(`${arm}:action:${x.action}`);G(`${arm}:action_correct`,x.action===expected?1:0);
  G(`${arm}:unjustified_commitment`,x.action==='commit'&&ref.sufficient!==true?1:0);
  G(`${arm}:correct_abstention`,x.action==='abstain'&&ref.sufficient==='nothing_fits'?1:0);
  G(`${arm}:unjustified_abstention`,x.action==='abstain'&&ref.sufficient!=='nothing_fits'&&reachablePrim.length?1:0);
  if(arm!=='C0'){for(const h of x.hyps){G(`${arm}:justification_complete`,h.reason&&h.support.length&&Array.isArray(h.conditions)&&Array.isArray(h.counterEvidence)?1:0);}
   for(const o of ref.objects.filter(o=>REG.has(o.family))){const m=x.objects.find(y=>y.family===o.family);G(`${arm}:objects_reference_in_vocabulary`);G(`${arm}:objects_found`,m?1:0);G(`${arm}:objects_role_correct`,m&&m.role===o.role?1:0);}
   G(`${arm}:objects_invented`,x.objects.filter(y=>!ref.objects.some(o=>o.family===y.family)).length);}}
 // question pairs for the blind judge (C vs C0), order shuffled
 for(const arm of ['C1','C2']){const cq=arms[arm].question,bq=arms.C0.question;if(!cq&&!bq)continue;if(arm==='C2'&&cq===arms.C1.question)continue;
  const flip=rnd()<0.5;qPairs.push({pair:`${r.id}:${arm}`,request:r.id,first:flip?bq:cq,second:flip?cq:bq,key:{arm,cIsFirst:!flip}});}
 for(const h of arms.C2.hyps)supportSample.push({request:r.id,family:h.family,support:h.support.map(x=>x.text).slice(0,3)});
 rows.push({id:r.id,expected,arms:Object.fromEntries(Object.entries(arms).map(([k,v])=>[k,{H:v.H,action:v.action,requested:v.requested,question:v.question,objects:v.objects,hyps:v.hyps.map(h=>({family:h.family,score:h.score,support:h.support.map(x=>x.ref)}))}]))});}
const sample=supportSample.map(x=>({x,k:rnd()})).sort((a,b)=>a.k-b.k).slice(0,40).map(o=>o.x);
mkdirSync(join(PE,'runs'),{recursive:true});
const judgeInput={requests:REQ.map(r=>({id:r.id,text:r.text,keyUncertainty:REF.get(r.id).keyUncertainty||''})),
 questionPairs:qPairs.map((q,i)=>({item:'QP'+String(i).padStart(3,'0'),request:q.request,first:q.first??'(no question)',second:q.second??'(no question)'})),
 supportItems:sample.map((x,i)=>({item:'SP'+String(i).padStart(3,'0'),request:x.request,family:x.family,support:x.support}))};
const judgeKey={questionPairs:qPairs.map((q,i)=>({item:'QP'+String(i).padStart(3,'0'),...q.key})),supportItems:sample.map((x,i)=>({item:'SP'+String(i).padStart(3,'0'),request:x.request,family:x.family}))};
writeFileSync(join(PE,'runs',`c-check-${LABEL}-detail.json`),JSON.stringify(rows,null,1));
writeFileSync(join(PE,'runs',`c-judge-input-${LABEL}.json`),JSON.stringify(judgeInput,null,1));writeFileSync(join(PE,'runs',`c-judge-key-${LABEL}.json`),JSON.stringify(judgeKey,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.i3.c-check.v1',label:LABEL,seal:fz.files,storeCopySha256:sha(arg('store')),
 tier:'requests: Claude-authored by an independent agent (T1); reference: two blind Claude-agent annotations adjudicated by a third (no human validation)',totals:T,questionPairs:qPairs.length,supportSample:sample.length},null,1)+'\n');
console.log(JSON.stringify(Object.fromEntries(Object.entries(T).filter(([k])=>k.startsWith('all|')))));
