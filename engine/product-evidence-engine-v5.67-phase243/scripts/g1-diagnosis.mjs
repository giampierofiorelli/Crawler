#!/usr/bin/env node
/** G1 diagnosis E1-E5 (evaluation/g1/preregistration.json) on the spent I3 R set: each arm changes one mechanism on a store
 * copy and freezes the rest. Diagnostic only, never held-out. Writes public counts (evaluation/g1/diag-LABEL.json) and
 * private detail ($PEE_PRIVATE_EVAL_DIR/g1/diag/). Refuses I3 material that differs from its seal; never overwrites.
 * Usage: node scripts/g1-diagnosis.mjs LABEL --store STORE_COPY */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!/^[a-z0-9-]+$/.test(LABEL)||!arg('store'))throw Error('usage: LABEL --store STORE_COPY');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const E=new URL('../evaluation/',import.meta.url).pathname;const OUT=join(E,'g1',`diag-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists');
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');const R=join(PE,'i3','r');const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const fz=JSON.parse(readFileSync(join(E,'i3','r-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(join(R,f))!==h)throw Error(f+' differs from its seal');
const REQ=JSON.parse(readFileSync(join(R,'requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(R,'reference.json'),'utf8')).requests.map(r=>[r.id,r]));
const KEY=new Map(JSON.parse(readFileSync(join(PE,'g1','diag','strategy-key.json'),'utf8')).items.map(x=>[x.id,x]));
const CLS=new Map(Object.entries(JSON.parse(readFileSync(join(E,'ar','c-cause-split.json'),'utf8')).idsByClass).flatMap(([c,ids])=>ids.map(i=>[i,c])));
const CAT=JSON.parse(readFileSync(join(E,'g1','knowledge-catalogue.json'),'utf8'));
const D=new URL('../dist/src/',import.meta.url).pathname;const I=m=>import(join(D,m));
const {KnowledgeStore246}=await I('phase246_knowledge_store.js');const {adviseFromRequest253}=await I('phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await I('phase248_category_registry.js');const {goalUnderstandingC,C_PARAMS}=await I('goal_understanding_c.js');const QK=await I('quantity_knowledge.js');
const copy=join(homedir(),'.cache-g1',`diag-${LABEL}.sqlite`);mkdirSync(join(homedir(),'.cache-g1'),{recursive:true});copyFileSync(arg('store'),copy);const s=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const STRAT=new Map(CAT.strategies.map(x=>[x.id,x]));const TAUGHT=new Set(CAT.families.filter(f=>f.depth==='taught').map(f=>f.id.slice(7)));
const famOk=r=>new Set([...r.plausibleFamilies.map(f=>f.family),...(r.acceptableFamilies??[])]);
const prim=r=>new Set(r.plausibleFamilies.filter(f=>f.strength==='primary').map(f=>f.family));
const unj=r=>new Set((r.unjustifiedFamilies??[]).map(f=>typeof f==='string'?f:f.family));
const alias=f=>CATEGORY_REGISTRY250.find(r=>r.id===f)?.aliases[0]??f.replace(/_/g,' ').replace(/s$/,'');
const agg={};const bump=(arm,g,k,n=1)=>{for(const x of [g,'all']){agg[arm]??={};agg[arm][x]??={};agg[arm][x][k]=(agg[arm][x][k]??0)+n;}};
const detail=[];const scores={};
const ARMS={C1:{},E2:{strategyScope:'own'},E3:{families:'store'},E4:{evidence:'typed'},E5:'oracle',ALL:'all'};
for(const r of REQ){const ref=REF.get(r.id),key=KEY.get(r.id)??{relevant:[],wrong:[]},g=CLS.get(r.id)??'unclassified';
 const a=adviseFromRequest253(r.text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
 const roles=new Map(ref.objects.filter(o=>!o.family.startsWith('other:')).map(o=>[o.family,o.role]));
 const row={id:r.id,class:g,arms:{}};
 for(const [arm,dg] of Object.entries(ARMS)){
  const diag=dg==='oracle'?{oracleRoles:roles}:dg==='all'?{strategyScope:'own',families:'store',evidence:'typed',oracleRoles:roles}:dg;
  const c=goalUnderstandingC(r.text,a,s,{qk,diag});
  const fams=[...new Set([...(c.committed?[c.committed]:[]),...c.hypotheses.map(h=>h.family)])].filter(f=>!f.startsWith('strategy:'));
  const strats=c.hypotheses.map(h=>h.family).filter(f=>f.startsWith('strategy:'));
  const ok=famOk(ref),P=prim(ref),U=unj(ref);
  bump(arm,g,'requests');
  bump(arm,g,'primary_family_found',fams.some(f=>P.has(f))?1:0);
  bump(arm,g,'families_justified',fams.filter(f=>ok.has(f)).length);bump(arm,g,'families_invented',fams.filter(f=>!ok.has(f)).length);
  bump(arm,g,'families_named_unjustified',fams.filter(f=>U.has(f)).length);
  if(key.relevant.length){bump(arm,g,'with_relevant_strategy');bump(arm,g,'relevant_strategy_reached',strats.some(x=>key.relevant.includes(x))?1:0);}
  bump(arm,g,'strategies_proposed',strats.length);bump(arm,g,'strategies_relevant',strats.filter(x=>key.relevant.includes(x)).length);bump(arm,g,'strategies_wrong',strats.filter(x=>key.wrong.includes(x)).length);
  bump(arm,g,'strategies_other',strats.filter(x=>!key.relevant.includes(x)&&!key.wrong.includes(x)).length);
  bump(arm,g,'unjustified_commitment',c.action==='commit'&&ref.sufficient!==true?1:0);bump(arm,g,'abstain',c.action==='abstain'?1:0);
  for(const o of ref.objects.filter(o=>!o.family.startsWith('other:'))){const m=c.objects.find(y=>y.family===o.family);bump(arm,g,'objects_ref');bump(arm,g,'objects_role_correct',m&&m.role===o.role?1:0);}
  for(const h of c.hypotheses){if(h.family.startsWith('strategy:'))continue;(scores[arm]??=[]).push({just:ok.has(h.family),score:h.score});}
  row.arms[arm]={action:c.action,committed:c.committed,hyps:c.hypotheses.map(h=>({f:h.family,score:h.score,shared:[...new Set(h.support.flatMap(x=>x.shared))]})),objects:c.objects.map(o=>`${o.family}:${o.role}`)};}
 // E1: the category supplied as if the shopper had named it (best catalogue family of the reference), frozen operational path
 const order=[...ref.plausibleFamilies.filter(f=>f.strength==='primary'),...ref.plausibleFamilies.filter(f=>f.strength!=='primary')].map(f=>f.family);
 const oracle=order.find(f=>CAT.families.some(x=>x.id==='family:'+f));
 bump('E1',g,'requests');
 if(oracle){bump('E1',g,'oracle_family_available');const b=adviseFromRequest253(`I am looking for a ${alias(oracle)}. ${r.text}`,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
  const js=JSON.stringify([b.statements,b.questions,b.needs,b.response,b.unassessedObjectives]);
  bump('E1',g,'category_taken',b.category===oracle?1:0);bump('E1',g,'needs_found',b.needs.length?1:0);bump('E1',g,'goal_question',b.questions.length?1:0);
  if(key.relevant.length){bump('E1',g,'oracle_with_relevant_strategy');const hit=key.relevant.some(x=>{const st=STRAT.get(x);return st&&(js.includes(x.slice(9))||js.includes(st.statement.slice(0,40)));});
   bump('E1',g,'relevant_strategy_surfaced',hit?1:0);bump('E1',g,'no_purchase_check',b.response==='no_purchase_check'?1:0);}
  row.E1={oracle,category:b.category,response:b.response,needs:b.needs,questions:b.questions.length};}
 else row.E1={oracle:null};
 detail.push(row);}
const auc=xs=>{const p=xs.filter(x=>x.just).map(x=>x.score),n=xs.filter(x=>!x.just).map(x=>x.score);if(!p.length||!n.length)return null;let w=0;for(const a of p)for(const b of n)w+=a>b?1:a===b?0.5:0;return +(w/(p.length*n.length)).toFixed(3);};
// post hoc secondary (not preregistered): typed evidence with one named concept accepted at family level
C_PARAMS.minShared=1;const post={};
for(const r of REQ){const ref=REF.get(r.id),g=CLS.get(r.id)??'unclassified';const a=adviseFromRequest253(r.text,s,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
 const c=goalUnderstandingC(r.text,a,s,{qk,diag:{evidence:'typed'}});const fams=[...new Set([...(c.committed?[c.committed]:[]),...c.hypotheses.map(h=>h.family)])];const ok=famOk(ref),P=prim(ref);
 for(const x of [g,'all']){post[x]??={requests:0,primary_family_found:0,families_justified:0,families_invented:0};post[x].requests++;post[x].primary_family_found+=fams.some(f=>P.has(f))?1:0;post[x].families_justified+=fams.filter(f=>ok.has(f)).length;post[x].families_invented+=fams.filter(f=>!ok.has(f)).length;}}
C_PARAMS.minShared=2;
mkdirSync(join(PE,'g1','diag'),{recursive:true});writeFileSync(join(PE,'g1','diag',`diag-${LABEL}-detail.json`),JSON.stringify(detail,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1.diagnosis.v1',label:LABEL,material:'spent I3 R (60), diagnostic only',seal:fz.files,storeCopySha256:sha(arg('store')),
 classes:'retrospective classes of evaluation/ar/c-cause-split.json (hypotheses under test)',strategyKey:'blind Claude agent, private-eval/g1/diag/strategy-key.json',
 arms:{C1:'c.1 unchanged',E1:'oracle category as a named purchase phrase, frozen operational path',E2:'alternatives as own strategies',E3:'family list from the store',E4:'typed evidence (concept names only)',E5:'oracle object roles',ALL:'E2+E3+E4+E5 together (supplementary)'},
 counts:agg,auc:Object.fromEntries(Object.entries(scores).map(([k,v])=>[k,auc(v)])),posthocTypedOneConcept:post},null,1)+'\n');
for(const arm of Object.keys(agg))console.log(arm.padEnd(4),JSON.stringify(agg[arm].all));console.log('auc',JSON.stringify(Object.fromEntries(Object.entries(scores).map(([k,v])=>[k,auc(v)]))));console.log('posthoc',JSON.stringify(post.all));
