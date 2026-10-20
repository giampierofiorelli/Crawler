#!/usr/bin/env node
/** S103 part A (evaluation/s103/preregistration.json): the 40 independent-author requests read by one frozen build and
 * scored against the sealed blind reference (evaluation/s103/request-reference.json, hash in request-reference-freeze.json).
 *   node scripts/s103-request-check.mjs LABEL --build DIR
 * DIR is a built checkout of the frozen commit (a git worktree). Writes evaluation/s103/request-check-LABEL.json (never
 * overwritten): counts and per-limit outcomes. The requests are Claude-authored; nothing here comes from the store except
 * the type of the answer (response), computed on a copy of the live store. */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdtempSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [LABEL]=process.argv.slice(2);const bi=process.argv.indexOf('--build');const BUILD=bi>0?process.argv[bi+1]:null;
if(!LABEL||!/^[a-z0-9-]+$/.test(LABEL)||!BUILD)throw Error('usage: LABEL --build DIR');
const E=new URL('../evaluation/s103/',import.meta.url).pathname;const OUT=join(E,`request-check-${LABEL}.json`);if(existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const freeze=JSON.parse(readFileSync(join(E,'request-reference-freeze.json'),'utf8'));
if(sha(join(E,'request-reference.json'))!==freeze.referenceSha256||sha(join(E,'requests.json'))!==freeze.requestsSha256)throw Error('reference or requests differ from the seal');
const REQ=JSON.parse(readFileSync(join(E,'requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(E,'request-reference.json'),'utf8')).requests.map(r=>[r.id,r.limits]));
const D=join(BUILD,'engine/product-evidence-engine-v5.67-phase243/dist/src/');
const {extractConstraints253}=await import(D+'phase253_request_constraints.js');const P249=await import(D+'phase249_decision.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const QK=await import(D+'quantity_knowledge.js');
const live=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const copy=join(mkdtempSync(join(homedir(),'.cache-s103r-')),'store.sqlite');copyFileSync(live,copy);const store=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
// the reference's property and side -> the criterion that would check it (S103 criteria; a criterion the build lacks is a miss)
const CRIT={'capacity|min':'capacity_min','capacity|max':'capacity_max','water_tank|min':'water_tank_capacity_min','width|max':'width_max','height|max':'height_max','depth|max':'depth_max',
 'weight|max':'weight_max','power|min':'power_min','power|max':'power_max','battery_life|min':'battery_life_min','price|max':'budget_max'};
const UNIT={volume:'l',length:'mm',mass:'g',power:'W',duration:'h'};
const unitOf=u=>{const x=String(u).toLowerCase().trim();return /^(?:litres?|liters?|l)$/.test(x)?'l':/^ml$/.test(x)?'ml':/^cm$/.test(x)?'cm':/^mm$/.test(x)?'mm':/^kg$/.test(x)?'kg':/^g$/.test(x)?'g':/^kw$/.test(x)?'kW':/^w$/.test(x)?'W':
 /^(?:hours?|h|hrs?)$/.test(x)?'h':/^(?:minutes?|mins?|min)$/.test(x)?'min':/^(?:gbp|£|pounds?|quid)$/.test(x)?'gbp':/^(?:usd|\$|dollars?)$/.test(x)?'usd':/^(?:eur|€|euros?)$/.test(x)?'eur':x;};
const base=(crit,value,unit)=>{const s=P249.SPEC_CRITERIA249[crit]??{budget_max:{dimension:'price'},capacity_max:{dimension:'volume'},power_max:{dimension:'power'}}[crit];if(!s)return null;
 if(s.dimension==='price')return {v:Number(value),c:unitOf(unit)};const b=P249.comparable249({kind:'quantity',number:Number(value),unit:unitOf(unit),approximate:false},s.dimension,UNIT[s.dimension]);return b===null?null:{v:Number(b.toPrecision(10)),c:''};};
const same=(a,b)=>a&&b&&a.c===b.c&&Math.abs(a.v-b.v)<=Math.max(1e-9,Math.abs(a.v)*1e-6);
const handlingOf=s=>s==='stated_in_request'?'apply':s==='candidate'?'ask':'report';
const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const rows=[];
for(const r of REQ){const ex=extractConstraints253(r.text).constraints;const ref=REF.get(r.id)??[];
 const a=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-20'});
 const used=new Set();
 for(const L of ref){const crit=CRIT[`${L.property}|${L.side}`];inc('ref:limits');
  if(!crit){inc('ref:outOfScope');rows.push({id:r.id,text:L.text,ref:L.handling,scope:'out',got:null});continue;}
  inc('ref:inScope');inc('ref:inScope:'+L.handling);
  const want=base(crit,L.value,L.unit);
  const i=ex.findIndex((c,j)=>!used.has(j)&&c.criterion===crit&&same(base(crit,c.value,c.unit),want));
  if(i<0){inc('missed');if(L.handling==='apply')inc('missed:apply');rows.push({id:r.id,text:L.text,crit,ref:L.handling,refKind:L.kind,got:null});continue;}
  used.add(i);const c=ex[i];const got=handlingOf(c.status);inc('detected');
  const applied=got==='apply',shouldApply=L.handling==='apply';
  inc(`handling:${L.handling}->${got}`);
  if(got===L.handling)inc('handling:exact');
  if(applied&&!shouldApply)inc('harmful:appliedWhenNot');
  if(!applied&&shouldApply)inc(got==='ask'?'overCautious:askedWhenApply':'missedApply:reportedWhenApply');
  if(!applied&&!shouldApply)inc('notApplied:agree');
  if(L.handling==='ask'&&got==='ask')inc('justifiedAbstention');
  const cl=c.closure??'inclusive';inc(cl===L.closure?'closure:agree':'closure:disagree');
  rows.push({id:r.id,text:L.text,crit,ref:L.handling,refKind:L.kind,refClosure:L.closure,got,status:c.status,closure:cl});}
 ex.forEach((c,j)=>{if(used.has(j))return;inc('extra');if(c.status==='stated_in_request')inc('extra:applied');rows.push({id:r.id,text:c.span,crit:c.criterion,ref:null,got:handlingOf(c.status),status:c.status,closure:c.closure??'inclusive'});});
 rows.push({id:r.id,response:a.response});inc('response:'+a.response);}
writeFileSync(OUT,JSON.stringify({schema:'pee.s103.request-check.v1',label:LABEL,build:BUILD,referenceSha256:freeze.referenceSha256,tier:'T1-independent-author (Claude-authored requests, blind Claude reference)',totals:T,rows},null,1)+'\n');
console.log(JSON.stringify(T,null,1));
