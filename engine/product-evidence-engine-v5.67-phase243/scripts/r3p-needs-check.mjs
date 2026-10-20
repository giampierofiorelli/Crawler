#!/usr/bin/env node
/** R3-P stage 3 (evaluation/r3p/preregistration.json stage3_needs): the sealed needs material scored for one build.
 *   node scripts/r3p-needs-check.mjs LABEL --build ENGINE_DIR [--arms A,B,C] [--candidates FILE] [--baseline]
 * --baseline: the S103 build, which has no need interpretation: only its recognised needs (advice.needs) and applied
 * limits are scored, reported apart from the A/B/C comparison. Writes evaluation/r3p/needs-check-LABEL.json (counts only)
 * and the per-request detail privately; never overwrites; refuses material whose hashes differ from the seal. */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const BUILD=arg('build');const BASE=process.argv.includes('--baseline');const ARMS=(arg('arms')??'A,B,C').split(',');
if(!LABEL||!/^[a-z0-9-]+$/.test(LABEL)||!BUILD)throw Error('usage: LABEL --build ENGINE_DIR');
const E=new URL('../evaluation/r3p/',import.meta.url).pathname;const OUT=join(E,`needs-check-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3p');const N=join(PE,'needs');
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const fz=JSON.parse(readFileSync(join(E,'needs-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(join(N,f))!==h)throw Error(f+' differs from its seal');
const REQ=JSON.parse(readFileSync(join(N,'requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(N,'reference.json'),'utf8')).requests.map(r=>[r.id,r]));
const D=join(BUILD,'dist/src/');const I=m=>import(join(D,m));
const {KnowledgeStore246}=await I('phase246_knowledge_store.js');const {adviseFromRequest253}=await I('phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await I('phase248_category_registry.js');const QK=await I('quantity_knowledge.js');
const cdir=join(homedir(),'.cache-r3p');mkdirSync(cdir,{recursive:true});const copy=join(cdir,`needs-${LABEL}.sqlite`);
copyFileSync(join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite'),copy);const store=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
let cand=null;if(arg('candidates')){const KR=await I('knowledge_rules.js');cand=KR.compileRuleSet(JSON.parse(readFileSync(arg('candidates'),'utf8'))).get('need_candidates');}
const words=t=>new Set(String(t).toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>=4));
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const rows=[];
const groupsOf=(r,ref)=>[`source:${r.source}`,`category:${ref.category??'unknown'}`,ref.category==='dehumidifiers'?'set:transfer':'set:main'];
for(const r of REQ){const ref=REF.get(r.id);if(!ref||ref.notABuyingRequest){inc('notBuying');continue;}
 const E_=new Set((ref.needs??[]).filter(n=>n.basis==='expressed').map(n=>n.label)),I_=new Set((ref.needs??[]).filter(n=>n.basis==='inferred').map(n=>n.label));
 const ACC=new Set(ref.acceptable??[]),NOT=new Set((ref.notNeeds??[]).map(n=>n.label).filter(Boolean));const G=groupsOf(r,ref);
 const g=(k,n=1)=>{inc(k,n);for(const x of G)inc(x+'|'+k,n);};
 g('requests');g('ref:expressed',E_.size);g('ref:inferred',I_.size);
 const runs=BASE?[['S103',{}]]:ARMS.map(a=>[a,{needInterpretation:{knowledgeGuided:a!=='A',candidates:a==='C'?cand:null}}]);
 const excl={};
 for(const [arm,opt] of runs){const a=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-20',...opt});const ni=a.needInterpretation;
  const sys=new Set(BASE?a.needs:[...ni.expressed.map(e=>e.concept),...(arm==='A'?[]:ni.inferred.map(i=>i.concept)),...(arm==='C'?(ni.candidateEffects??[]).map(e=>e.concept):[])]);
  for(const x of E_)g(`${arm}:expressed_found`,sys.has(x)?1:0);for(const x of I_)g(`${arm}:inferred_found`,sys.has(x)?1:0);
  for(const s of sys){if(E_.has(s)||I_.has(s))g(`${arm}:correct`);else if(ACC.has(s))g(`${arm}:acceptable`);else g(`${arm}:invented`);
   if(NOT.has(s))g(`${arm}:harmful_negatedNeed`);
   if((ref.features??[]).some(f=>f.outcomeItSuggests===s)&&!E_.has(s)&&!I_.has(s))g(`${arm}:feature_read_as_need`);}
  // limits applied that the reference does not apply (S103 handling classes)
  const applied=a.constraints.filter(c=>c.status==='stated_in_request');
  for(const L of ref.limits??[])if(L.handling!=='apply'&&applied.some(c=>Math.abs(Number(c.value)-Number(L.value))<1e-9))g(`${arm}:harmful_appliedWhenNot`);
  excl[arm]=JSON.stringify(a.excluded.map(x=>x.productId).sort());
  if(!BASE){g(`${arm}:uninterpreted_clauses`,ni.trace.filter(t=>t.status==='uninterpreted').length);
   const found=[...sys].filter(s=>E_.has(s)||I_.has(s));g(`${arm}:plan_for_correct_need`,ni.evidencePlan.filter(p=>found.includes(p.concept)&&p.measures.length).length);
   const qs=words(a.questions.join(' '));g(`${arm}:ref_questions`,(ref.questions??[]).length);g(`${arm}:ref_questions_asked`,(ref.questions??[]).filter(q=>[...words(q)].some(w=>qs.has(w))).length);
   g(`${arm}:features_found`,(ref.features??[]).filter(f=>ni.features.some(x=>[...words(f.feature)].some(w=>words(x.span).has(w)))).length);g(`ref:features`,arm==='A'?(ref.features??[]).length:0);}
  rows.push({id:r.id,arm,needs:[...sys],inferred:BASE?[]:ni.inferred.map(i=>({concept:i.concept,support:i.support,provenance:i.provenance,path:i.path})),cand:BASE?[]:ni.candidateEffects??[],trace:BASE?[]:ni.trace,response:a.response,
   // diagnosis only (evaluation/r3p/needs-failure-causes.json): no metric reads these fields
   unsupported:BASE?[]:ni.unsupported??[],stances:BASE?[]:ni.stances??[],features:BASE?[]:ni.features??[],contexts:BASE?[]:ni.contexts??[],
   category:a.category??null});}
 // an inferred need must never change the exclusions: arms on one build must exclude the same products
 if(!BASE&&new Set(Object.values(excl)).size>1)g('improperExclusionChange');}
const pub={schema:'pee.r3p.needs-check.v1',label:LABEL,build:BUILD,baseline:BASE,arms:BASE?['S103']:ARMS,seal:fz.files,
 tier:'requests: licensed real consumer wording (Stack Exchange, CC BY-SA) and Claude-authored (T1); reference: two blind Claude-agent annotations adjudicated by a third (no human validation)',totals:T};
writeFileSync(OUT,JSON.stringify(pub,null,1)+'\n');mkdirSync(join(PE,'runs'),{recursive:true});writeFileSync(join(PE,'runs',`needs-check-${LABEL}.json`),JSON.stringify({...pub,rows},null,1)+'\n');
console.log(JSON.stringify(T));
