#!/usr/bin/env node
/** Continuous-learning Step 1D-A: DEVELOPMENT evaluation of the document identity inventory (no network; existing private
 * pages and gold only). Arm A = the Step 1C attribution candidate; arm B = the same candidate with the inventory
 * (src/experience_entity_inventory.ts); scorer, readers, plans and every other rule unchanged. All results are
 * development evidence: the Step 1C pages and the Phase272 pages were examined while the inventory was designed.
 * Reports by measurement (gold item), by lead, by document and by DISTINCT entity problem (one identity error repeated over
 * many measurements counts once), inventory typing and links, improper merges and regressions.
 * Usage: node scripts/step1d-identity-eval.mjs LABEL. Private -> pee-knowledge/private-eval/experience/step1d-LABEL.json;
 * value-free -> evaluation/experience/step1d-LABEL.json. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {documentLeads,documentInventory,buildIdentity} from './experience-observe.mjs';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const PRIV=join(REPO,`private-eval/experience/step1d-${label}.json`),PUB=`evaluation/experience/step1d-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const S=await import(resolve('dist/src/experience_attribution_scoring.js'));const UNIT=(await import(resolve('dist/src/phase272_extraction_plan.js'))).canonicalUnit272;
const UE={db:['db','dba','db(a)'],nits:['nits','nit','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs','sec'],hours:['hours','hrs','h'],'%':['%','percent'],l:['l','litres','liters'],w:['w','watts'],kwh:['kwh'],ms:['ms'],cfm:['cfm']};
const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return UNIT?.(l)??l;};
const E=join(homedir(),'.local/share/product-evidence-engine/private-eval');const CAT={tv:'televisions',ap:'air_purifiers',af:'air_fryers',dw:'dishwashers'};
const s1c=JSON.parse(readFileSync(join(E,'step1c/gold.json'),'utf8'));
const SETS=[
 {set:'step1c (spent; inventory designed on it)',ev:'step1c',docs:s1c.documents.map(d=>({tag:d.tag,category:d.category})),gold:s1c.values},
 {set:'phase272 untouched (spent; examined)',ev:'phase272',gold:JSON.parse(readFileSync(join(E,'phase272/gold-untouched.json'),'utf8')).quantitative.map(q=>({...q,subjectStatus:'exact'}))},
 {set:'phase272 development pages',ev:'phase272',gold:JSON.parse(readFileSync(join(E,'phase272/gold-dev.json'),'utf8')).quantitative.map(q=>({...q,subjectStatus:'exact'}))}];
for(const st of SETS)st.docs??=[...new Set(st.gold.map(g=>g.doc))].map(tag=>({tag,category:CAT[tag.split('_')[1]]}));
const ARMS=[['A','constrained_candidate_1c'],['B','candidate_1c_inventory']];const D=resolve('dist/src');
const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});const good=c=>c==='correct'||c==='correct_multi';const wrong=c=>c==='wrong_product'||c==='false_identity_match';
const gs=(s,variants=[])=>({subject:s,subjectStatus:'exact',acceptedVariants:variants,id:'',doc:'',value:0,unit:''});
const docsOut=[],problems=[];
for(const st of SETS)for(const d of st.docs){
 const g=st.gold.filter(x=>x.doc===d.tag).map(x=>({...x,unit:canon(x.unit)}));const res={};
 for(const [k,p] of ARMS){const r=await documentLeads(D,{evaluation:st.ev,docTag:d.tag,category:d.category},{policy:p});if(r.unobservable)throw Error(d.tag+': '+r.unobservable);
  const L=r.leads.map(l=>({...l,unit:canon(l.unit)}));res[k]={items:Object.fromEntries(g.map(x=>[x.id,S.scoreItem1C(x,L)])),leads:L.map(l=>({cls:S.scoreLead1C(l,g),subject:l.subject,value:l.value,unit:l.unit,assignment:l.assignment,blockIndex:l.blockIndex}))};}
 const iv=await documentInventory(D,{evaluation:st.ev,docTag:d.tag});const inv=iv.inventory;
 // Entity-level view: each gold subject of the document, its inventory entity (by the frozen identity rule) and outcomes.
 const subjects=[...new Set(g.map(x=>x.subject).filter(Boolean))];const ents=[];
 for(const s of subjects){const variants=g.find(x=>x.subject===s)?.acceptedVariants??[];
  const match=inv.entities.filter(e=>e.type==='product'&&S.identity1C(gs(s,variants),e.canonical)==='match');
  const step1c=iv.step1cMentions.filter(m=>S.identity1C(gs(s,variants),m.name)==='match').map(m=>m.name);
  const items=g.filter(x=>x.subject===s);const A=count(items.map(x=>res.A.items[x.id])),B=count(items.map(x=>res.B.items[x.id]));
  const ms=match.flatMap(e=>inv.mentions.filter(m=>m.entityId===e.id));
  // Cause of the remaining non-success in arm B (codes of the Step 1D-A brief): 1 not detected, 3 short name not linked,
  // 4 identity split or merged, 5 identity present but not used, 6 evaluator rejects alias (2 and 7 are found by trace review).
  const bad=items.filter(x=>!good(res.B.items[x.id])&&res.B.items[x.id]!=='missing');
  const cause=!bad.length?null:!match.length?(inv.mentions.some(m=>m.state==='ambiguous'&&m.candidates.some(c=>S.sameProduct1C(s,c)))?'3_short_name_not_linked':'1_not_detected')
   :match.length>1?'4_identity_split_across_entities':bad.some(x=>res.B.items[x.id]==='false_identity_match')?'6_evaluator_rejects_alias':'5_identity_present_not_used';
  ents.push({subject:s,items:items.length,inventoryEntities:match.map(e=>({id:e.id,canonical:e.canonical,typeReason:e.typeReason,unresolved:e.unresolved})),
   aliasForms:[...new Set(ms.filter(m=>m.state==='contextual_alias').map(m=>m.surface))],step1cDetected:step1c,A,B,cause,affected:bad.length,missingB:items.filter(x=>res.B.items[x.id]==='missing').length});
  if(cause)problems.push({set:st.set,doc:d.tag,subject:s,cause,measurementsAffected:bad.length,B});}
 // Improper merges: one inventory product entity identity-matching two different gold subjects.
 const merges=inv.entities.filter(e=>e.type==='product'&&subjects.filter(s=>S.identity1C(gs(s),e.canonical)==='match').length>1).map(e=>e.canonical);
 // Wrong leads of arm B grouped by the identity they were given (one identity error -> many measurements).
 const wrongB=count(res.B.leads.filter(l=>l.cls==='lead_wrong_product'||l.cls==='lead_false_identity').map(l=>l.subject+' <- '+l.assignment));
 docsOut.push({set:st.set,doc:d.tag,category:d.category,gold:g.length,
  arms:Object.fromEntries(ARMS.map(([k])=>[k,{items:count(Object.values(res[k].items)),leads:count(res[k].leads.map(l=>l.cls))}])),
  itemsChanged:g.filter(x=>res.A.items[x.id]!==res.B.items[x.id]).map(x=>({goldId:x.id,A:res.A.items[x.id],B:res.B.items[x.id]})),
  regressions:g.filter(x=>good(res.A.items[x.id])&&!good(res.B.items[x.id])).map(x=>x.id),newWrong:g.filter(x=>wrong(res.B.items[x.id])&&!wrong(res.A.items[x.id])).map(x=>x.id),
  inventory:{entities:count(inv.entities.map(e=>e.type)),mentions:count(inv.mentions.map(m=>m.state)),aliasLinks:inv.mentions.filter(m=>m.state==='contextual_alias').length,
   productEntitiesWithoutGold:inv.entities.filter(e=>e.type==='product'&&!subjects.some(s=>S.identity1C(gs(s),e.canonical)==='match')).map(e=>e.canonical),
   notProduct:inv.entities.filter(e=>e.type==='standard'||e.type==='instrument'||e.type==='other').map(e=>e.type+': '+e.canonical)},
  improperMerges:merges,wrongLeadsByIdentityB:wrongB,entities:ents});}
const sum=(f,part)=>Object.fromEntries(ARMS.map(([k])=>[k,docsOut.filter(f).reduce((o,d)=>{for(const [c,n] of Object.entries(d.arms[k][part]))o[c]=(o[c]??0)+n;return o;},{})]));
const summary=Object.fromEntries(SETS.map(st=>[st.set,{documents:st.docs.length,gold:st.gold.length,items:sum(d=>d.set===st.set,'items'),leads:sum(d=>d.set===st.set,'leads'),
 regressions:docsOut.filter(d=>d.set===st.set).flatMap(d=>d.regressions).length,newWrong:docsOut.filter(d=>d.set===st.set).flatMap(d=>d.newWrong).length,
 improperMerges:docsOut.filter(d=>d.set===st.set).flatMap(d=>d.improperMerges).length}]));
const entityView=Object.fromEntries(SETS.map(st=>{const es=docsOut.filter(d=>d.set===st.set).flatMap(d=>d.entities);
 return [st.set,{goldEntities:es.length,detectedByStep1C:es.filter(e=>e.step1cDetected.length).length,detectedByInventory:es.filter(e=>e.inventoryEntities.length).length,
  withAliasLinks:es.filter(e=>e.aliasForms.length).length,entitiesWithRemainingProblem:es.filter(e=>e.cause).length}];}));
const problemSummary={distinctProblems:problems.length,measurementsAffected:problems.reduce((a,p)=>a+p.measurementsAffected,0),byCause:count(problems.map(p=>p.cause)),
 measurementsByCause:problems.reduce((o,p)=>(o[p.cause]=(o[p.cause]??0)+p.measurementsAffected,o),{})};
const out={schema:'pee.step1d.identity-eval.v1',label,at:new Date().toISOString(),tier:'development (spent and examined pages; never untouched)',build:buildIdentity(D),arms:Object.fromEntries(ARMS),summary,entityView,problemSummary};
writeFileSync(PRIV,JSON.stringify({...out,problems,documents:docsOut},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...out,documents:docsOut.map(d=>({set:d.set,doc:d.doc,category:d.category,gold:d.gold,arms:d.arms,itemsChanged:d.itemsChanged,regressions:d.regressions,newWrong:d.newWrong,
 inventory:{entities:d.inventory.entities,mentions:d.inventory.mentions,aliasLinks:d.inventory.aliasLinks,productEntitiesWithoutGold:d.inventory.productEntitiesWithoutGold.length,notProduct:d.inventory.notProduct.length},
 improperMerges:d.improperMerges.length,entityProblems:d.entities.filter(e=>e.cause).map(e=>({cause:e.cause,measurementsAffected:e.affected}))}))},null,1)+'\n');
console.log(JSON.stringify({summary,entityView,problemSummary},null,1));
for(const p of problems)console.log(p.doc.padEnd(32),p.subject.slice(0,30).padEnd(30),p.cause.padEnd(34),p.measurementsAffected,JSON.stringify(p.B));
