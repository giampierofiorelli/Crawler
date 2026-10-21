#!/usr/bin/env node
/** G1 first run on the sealed independent set (evaluation/g1/preregistration.json; seal evaluation/g1/r-freeze.json).
 * Arms: C0-before (operational path before the G1 fixes, build snapshot), C0 (operational path after the fixes), C1 (goal
 * understanding C, c.1). The GF arm was stopped by the diagnosis gate and is not run. Metrics M1-M7 and harm per class.
 * Public counts only; per-request detail is private. Refuses material that differs from its seal; never overwrites.
 * Usage: node scripts/g1-check.mjs LABEL --store STORE_COPY --before BUILD_DIR */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!/^[a-z0-9-]+$/.test(LABEL)||!arg('store')||!arg('before'))throw Error('usage: LABEL --store STORE_COPY --before BUILD_DIR');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const E=new URL('../evaluation/g1/',import.meta.url).pathname;const OUT=join(E,`check-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists');
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval/g1');const R=join(PE,'r');const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const fz=JSON.parse(readFileSync(join(E,'r-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(join(R,f))!==h)throw Error(f+' differs from its seal');
const REQ=JSON.parse(readFileSync(join(R,'requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(R,'reference.json'),'utf8')).items.map(x=>[x.id,x]));
const CAT=JSON.parse(readFileSync(join(E,'knowledge-catalogue.json'),'utf8'));const CATIDS=new Set([...CAT.families.map(f=>f.id),...CAT.strategies.map(s=>s.id)]);
const mod=(dir,m)=>import(join(resolve(dir),'dist/src',m));const NOW=new URL('..',import.meta.url).pathname;
const [B0,B1,REG,STORE,C,QK,RN]=await Promise.all([mod(arg('before'),'phase253_request_advice.js'),mod(NOW,'phase253_request_advice.js'),mod(NOW,'phase248_category_registry.js'),
 mod(NOW,'phase246_knowledge_store.js'),mod(NOW,'goal_understanding_c.js'),mod(NOW,'quantity_knowledge.js'),mod(NOW,'phase254_research_needs.js')]);
const RN0=await mod(arg('before'),'phase254_research_needs.js');const REG0=await mod(arg('before'),'phase248_category_registry.js');const ST0=await mod(arg('before'),'phase246_knowledge_store.js');
mkdirSync(join(homedir(),'.cache-g1'),{recursive:true});
const c0=join(homedir(),'.cache-g1',`check-${LABEL}-before.sqlite`),c1=join(homedir(),'.cache-g1',`check-${LABEL}.sqlite`);copyFileSync(arg('store'),c0);copyFileSync(arg('store'),c1);
const s0=new ST0.KnowledgeStore246(c0),s1=new STORE.KnowledgeStore246(c1);const qk=QK.loadQuantityKnowledge();const opts={quantityKnowledge:qk,date:'2026-10-21'};
const cls=x=>{if(x.categoryNeeded==='none'||x.sufficient==='nothing_fits')return 'Z';const P=(x.strategies??[]).filter(s=>s.strength==='primary');const p=(P.length?P:(x.strategies??[]))[0];if(!p)return 'Z';
 if(p.kind==='no_purchase')return CATIDS.has(p.id)?'NS':'NA';if(CATIDS.has(p.id))return (x.objects??[]).some(o=>o.role==='requested'&&o.family===p.id)?'A':'U';return 'X';};
const DEC=a=>JSON.stringify([a.shortlist,a.excluded,a.unknown,a.ranked??null,a.held??null,a.rankingAuthorized]);
const stratOf=a=>{const js=JSON.stringify([a.statements,a.needs,a.questions,a.response]);return CAT.strategies.filter(s=>js.includes(s.id.slice(9))).map(s=>s.id);};
const words=t=>new Set(String(t).toLowerCase().match(/[a-z]{4,}|\d+(?:\.\d+)?/g)??[]);
const kept=(a,c)=>{const w=[...words(c.text)];const nums=w.filter(x=>/\d/.test(x));const hay=JSON.stringify([a.constraints,a.unassessedObjectives,a.uninterpreted??[],a.otherLimits??[],a.quantityRequirements??[]]).toLowerCase();
 return nums.length?nums.every(n=>hay.includes(n)):w.some(x=>hay.includes(x));};
const agg={};const bump=(arm,g,k,n=1)=>{for(const x of [g,'all']){agg[arm]??={};agg[arm][x]??={};agg[arm][x][k]=(agg[arm][x][k]??0)+n;}};const detail=[];
for(const r of REQ){const ref=REF.get(r.id);const g=cls(ref);const strat=ref.strategies??[];
 const relevant=new Set(strat.map(s=>s.id).filter(i=>CATIDS.has(i)));const unj=new Set((ref.unjustified??[]).map(u=>u.id??u));
 const a0=B0.adviseFromRequest253(r.text,s0,REG0.CATEGORY_REGISTRY250,opts),a1=B1.adviseFromRequest253(r.text,s1,REG.CATEGORY_REGISTRY250,opts);
 const c=C.goalUnderstandingC(r.text,a1,s1,{qk});
 const arms={C0before:{a:a0,props:[...(a0.category?['family:'+a0.category]:[]),...stratOf(a0)],rn:RN0.researchNeedsFromAdvice254(a0,s0)},
  C0:{a:a1,props:[...(a1.category?['family:'+a1.category]:[]),...stratOf(a1)],rn:RN.researchNeedsFromAdvice254(a1,s1)},
  C1:{a:null,props:[...new Set([...(c.committed?[c.committed]:[]),...c.hypotheses.map(h=>h.family)])].map(f=>'family:'+f),rn:[],c}};
 const row={id:r.id,class:g,arms:{}};
 for(const [arm,x] of Object.entries(arms)){const props=[...new Set(x.props)];
  bump(arm,g,'requests');
  if(relevant.size){bump(arm,g,'with_relevant');bump(arm,g,'M1_reached',props.some(p=>relevant.has(p))?1:0);}
  bump(arm,g,'M2_invented',props.filter(p=>!relevant.has(p)).length);bump(arm,g,'M2_named_unjustified',props.filter(p=>unj.has(p)).length);
  const npRel=[...relevant].filter(i=>i.startsWith('strategy:')),pRel=[...relevant].filter(i=>i.startsWith('family:'));
  if(npRel.length&&pRel.length){bump(arm,g,'M4_eligible');bump(arm,g,'M4_both',props.some(p=>npRel.includes(p))&&props.some(p=>pRel.includes(p))?1:0);}
  const typedGap=x.rn.some(n=>/^missing_(?:category|need)_knowledge$/.test(n.kind));
  const outside=arm==='C1'?x.c.action==='abstain':(x.a.response==='out_of_scope'||typedGap);
  if(g==='NA'||g==='X'){bump(arm,g,'M3_outside',outside?1:0);bump(arm,g,'M3_typed_research_need',typedGap?1:0);bump(arm,g,'M3_wrong_commitment',props.some(p=>!relevant.has(p))&&(arm==='C1'?x.c.action==='commit':!!x.a.category)?1:0);}
  if(g==='A'||g==='U')bump(arm,g,'M5_unjustified_abstention',relevant.size&&!props.some(p=>relevant.has(p))&&(arm==='C1'?x.c.action==='abstain':(x.a.response==='out_of_scope'||!x.a.category))?1:0);
  if(arm!=='C1'){for(const k of (ref.expressed?.constraints??[]).filter(k=>['budget','size','noise','energy','time'].includes(k.kind))){bump(arm,g,'M6_expressed');bump(arm,g,'M6_lost',kept(x.a,k)?0:1);}
   const qs=x.a.questions??[];if(qs.length){bump(arm,g,'M7_asked');bump(arm,g,'M7_user_only',ref.userOnlyUncertainty&&ref.userOnlyUncertainty!=='none'?1:0);}bump(arm,g,'M7_with_cause',0);}
  else if(x.c.question){bump(arm,g,'M7_asked');bump(arm,g,'M7_user_only',ref.userOnlyUncertainty&&ref.userOnlyUncertainty!=='none'?1:0);}
  row.arms[arm]={props,response:x.a?.response??x.c.action,research:x.rn.map(n=>n.kind)};}
 bump('harm','all','decision_fields_changed_C0before_vs_C0',DEC(a0)!==DEC(a1)?1:0);
 detail.push(row);}
mkdirSync(join(PE,'runs'),{recursive:true});writeFileSync(join(PE,'runs',`check-${LABEL}-detail.json`),JSON.stringify(detail,null,1));
writeFileSync(OUT,JSON.stringify({schema:'pee.g1.check.v1',label:LABEL,seal:fz.files,storeCopySha256:sha(arg('store')),
 tier:'T1: Claude-authored requests (independent author agent, aware of the catalogue), two blind Claude-agent annotations adjudicated by a third; no human validation',
 note:'GF (goal-first shadow) not run: stopped by the diagnosis gate (evaluation/g1/diag-firstrun.json). M7 cause: the operational path carries no question cause (0 by construction).',
 counts:agg},null,1)+'\n');
for(const arm of ['C0before','C0','C1'])console.log(arm.padEnd(9),JSON.stringify(agg[arm].all));console.log('harm',JSON.stringify(agg.harm.all));
