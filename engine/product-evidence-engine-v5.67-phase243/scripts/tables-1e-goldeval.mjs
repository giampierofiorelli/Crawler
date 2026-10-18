#!/usr/bin/env node
/** Table understanding, Stage D: DEVELOPMENT evaluation of the table lessons on every existing value-level gold set (all spent:
 * Step 1C, Phase272 untouched and development, Step 1D-B; the 18-table sample of Stage C informed the lessons). No network.
 * Arms (same pages, plans, scorer): C = frozen Step 1D-A2 candidate (candidate_1c_semantics_tables); E = C with every shadow
 * table lesson (candidate_1e_tables); E-TLk = E without lesson k (ablation). Scored with the frozen Step 1C scorer. Reports per set,
 * per publisher (with each lesson's provenance publishers marked, so effects outside the publishers a lesson came from are
 * visible), transitions C -> E, negative controls read, and corpus-wide table-lead counts on all retained pages.
 * Usage: node scripts/tables-1e-goldeval.mjs LABEL. Private full -> pee-knowledge private-eval/tables-1e; value-free -> evaluation/tables-1e. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {documentLeads,buildIdentity} from './experience-observe.mjs';
const label=process.argv[2];if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL');
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const PRIV=join(REPO,'private-eval/tables-1e',`goldeval-${label}.json`),PUB=`evaluation/tables-1e/goldeval-${label}.json`;
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const D=resolve('dist/src');const S=await import(D+'/experience_attribution_scoring.js');const PL=await import(D+'/phase272_extraction_plan.js');const LS=await import(D+'/table_lessons1e.js');
const E0=join(homedir(),'.local/share/product-evidence-engine/private-eval');const rd=p=>JSON.parse(readFileSync(p,'utf8'));
const UE={db:['db','dba','db(a)','decibels','decibel'],nits:['nits','nit','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs','sec'],hours:['hours','hrs','h','hour'],'%':['%','percent'],l:['l','litres','liters'],w:['w','watts'],kwh:['kwh'],ms:['ms'],cfm:['cfm']};
const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return PL.canonicalUnit272?.(l)??l;};
const CAT={tv:'televisions',ap:'air_purifiers',af:'air_fryers',dw:'dishwashers'};
const s1c=rd(join(E0,'step1c/gold.json')),unt=rd(join(E0,'phase272/gold-untouched.json')),dvg=rd(join(E0,'phase272/gold-dev.json')),s1db=rd(join(E0,'step1d-b/gold.json'));
const hostOf=(ev,tag)=>{const p=rd(join(E0,ev,'wave.json')).pages.find(x=>x.tag===tag);return new URL(p.finalUrl??p.url).host.replace(/^www\./,'');};
const SETS=[
 {set:'step1c',ev:'step1c',docs:s1c.documents.map(d=>({tag:d.tag,category:d.category})),gold:s1c.values,neg:[]},
 {set:'phase272_untouched',ev:'phase272',gold:unt.quantitative.map(q=>({...q,subjectStatus:'exact'})),neg:unt.negativeControls??[]},
 {set:'phase272_dev',ev:'phase272',gold:dvg.quantitative.map(q=>({...q,subjectStatus:'exact'})),neg:[]},
 {set:'step1d_b',ev:'step1d-b',docs:s1db.documents.map(d=>({tag:d.doc,category:d.category})),gold:s1db.values,neg:s1db.negativeControls}];
for(const st of SETS)st.docs??=[...new Set(st.gold.map(g=>g.doc))].map(tag=>({tag,category:CAT[tag.split('_')[1]]}));
const SHADOW=LS.TABLE_LESSONS1E.filter(l=>l.appliedIn==='shadow_table_reader').map(l=>l.id);
const ARMS=[['C','candidate_1c_semantics_tables',null],['E','candidate_1e_tables',SHADOW],...SHADOW.map(id=>['E-'+id.split('_')[0],'candidate_1e_tables',SHADOW.filter(x=>x!==id)]),['P','candidate_1e_tables',LS.activeTableLessons1E()]];
// Arm P: the default shadow set (promoted lessons only), i.e. what candidate_1e_tables applies without an explicit lesson list.
// Publishers each lesson was derived from (Stage C adjudication evaluation/tables-1e/adjudication-cmp1.json).
const PROVENANCE={TL1:['airpurifierfirst.com'],TL2:['tomsguide.com','airpurifierfirst.com'],TL3:['airpurifierfirst.com'],TL4:['airpurifierfirst.com'],TL5:['housefresh.com','airpurifierfirst.com'],TL6:['housefresh.com'],TL7:['housefresh.com','airpurifierfirst.com']};
const good=c=>c==='correct'||c==='correct_multi'||c==='correctly_unresolved';const wrong=c=>c==='wrong_product'||c==='false_identity_match'||c==='unsupported_assignment';
const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});const docsOut=[];
for(const st of SETS)for(const d of st.docs){const host=hostOf(st.ev,d.tag);const g=st.gold.filter(x=>x.doc===d.tag).map(x=>({...x,unit:canon(x.unit)}));const ng=st.neg.filter(n=>n.doc===d.tag);const res={};
 for(const [k,pol,les] of ARMS){const r=await documentLeads(D,{evaluation:st.ev,docTag:d.tag,category:d.category},{policy:pol,details:true,...(les?{lessons:les}:{})});if(r.unobservable)throw Error(d.tag+': '+r.unobservable);
  const L=r.leads.map(l=>({...l,unit:canon(l.unit)}));
  res[k]={items:Object.fromEntries(g.map(x=>[x.id,S.scoreItem1C(x,L)])),negRead:ng.filter(n=>L.some(l=>Math.abs(l.value-n.value)<1e-9&&l.unit===canon(n.unit))).length,
   tableLeads:L.filter(l=>l.methodCue==='structured_table_measurement_term').length,withCondition:L.filter(l=>l.methodCue==='structured_table_measurement_term'&&l.condition).length,leads:L.length};}
 docsOut.push({set:st.set,doc:d.tag,host,category:d.category,gold:g.length,arms:Object.fromEntries(ARMS.map(([k])=>[k,{items:count(Object.values(res[k].items)),negativeControlsRead:res[k].negRead,tableLeads:res[k].tableLeads,withCondition:res[k].withCondition,leads:res[k].leads}])),
  transitionsCE:{gained:g.filter(x=>!good(res.C.items[x.id])&&good(res.E.items[x.id])).map(x=>x.id),lost:g.filter(x=>good(res.C.items[x.id])&&!good(res.E.items[x.id])).map(x=>({id:x.id,to:res.E.items[x.id]})),
   newWrong:g.filter(x=>wrong(res.E.items[x.id])&&!wrong(res.C.items[x.id])).map(x=>x.id),wrongRemoved:g.filter(x=>wrong(res.C.items[x.id])&&!wrong(res.E.items[x.id])).map(x=>x.id)},
  promotedVsC:{gained:g.filter(x=>!good(res.C.items[x.id])&&good(res.P.items[x.id])).map(x=>x.id),lost:g.filter(x=>good(res.C.items[x.id])&&!good(res.P.items[x.id])).map(x=>x.id),
   newWrong:g.filter(x=>wrong(res.P.items[x.id])&&!wrong(res.C.items[x.id])).map(x=>x.id),wrongRemoved:g.filter(x=>wrong(res.C.items[x.id])&&!wrong(res.P.items[x.id])).map(x=>x.id)},
  ablation:Object.fromEntries(ARMS.slice(2,-1).map(([k])=>[k,{lostVsE:g.filter(x=>good(res.E.items[x.id])&&!good(res[k].items[x.id])).length,gainedVsE:g.filter(x=>!good(res.E.items[x.id])&&good(res[k].items[x.id])).length,
   newWrongVsE:g.filter(x=>wrong(res[k].items[x.id])&&!wrong(res.E.items[x.id])).length,wrongRemovedVsE:g.filter(x=>wrong(res.E.items[x.id])&&!wrong(res[k].items[x.id])).length}]))});}
const agg=f=>{const ds=docsOut.filter(f);const sum=k=>ds.reduce((o,d)=>{for(const [c,n] of Object.entries(d.arms[k].items))o[c]=(o[c]??0)+n;return o;},{});
 return {documents:ds.length,gold:ds.reduce((a,d)=>a+d.gold,0),C:sum('C'),E:sum('E'),gained:ds.reduce((a,d)=>a+d.transitionsCE.gained.length,0),lost:ds.reduce((a,d)=>a+d.transitionsCE.lost.length,0),
  newWrong:ds.reduce((a,d)=>a+d.transitionsCE.newWrong.length,0),wrongRemoved:ds.reduce((a,d)=>a+d.transitionsCE.wrongRemoved.length,0),
  negativeControlsRead:{C:ds.reduce((a,d)=>a+d.arms.C.negativeControlsRead,0),E:ds.reduce((a,d)=>a+d.arms.E.negativeControlsRead,0)},
  tableLeads:{C:ds.reduce((a,d)=>a+d.arms.C.tableLeads,0),E:ds.reduce((a,d)=>a+d.arms.E.tableLeads,0),EwithCondition:ds.reduce((a,d)=>a+d.arms.E.withCondition,0)},
  promotedOnly:{P:sum('P'),gainedVsC:ds.reduce((a,d)=>a+d.promotedVsC.gained.length,0),lostVsC:ds.reduce((a,d)=>a+d.promotedVsC.lost.length,0),newWrongVsC:ds.reduce((a,d)=>a+d.promotedVsC.newWrong.length,0),wrongRemovedVsC:ds.reduce((a,d)=>a+d.promotedVsC.wrongRemoved.length,0),negativeControlsRead:ds.reduce((a,d)=>a+d.arms.P.negativeControlsRead,0),tableLeads:ds.reduce((a,d)=>a+d.arms.P.tableLeads,0)},
  ablation:Object.fromEntries(ARMS.slice(2,-1).map(([k])=>[k,Object.fromEntries(['lostVsE','gainedVsE','newWrongVsE','wrongRemovedVsE'].map(f=>[f,ds.reduce((a,d)=>a+d.ablation[k][f],0)]))]))};};
const summary={all:agg(()=>true),bySet:Object.fromEntries(SETS.map(s=>[s.set,agg(d=>d.set===s.set)])),byHost:Object.fromEntries([...new Set(docsOut.map(d=>d.host))].map(h=>[h,agg(d=>d.host===h)])),
 outsideProvenance:Object.fromEntries(Object.entries(PROVENANCE).map(([l,hs])=>[l,{provenance:hs,...(k=>({lostWithoutLessonOutside:docsOut.filter(d=>!hs.includes(d.host)).reduce((a,d)=>a+d.ablation[k].lostVsE,0),
  lostWithoutLessonInside:docsOut.filter(d=>hs.includes(d.host)).reduce((a,d)=>a+d.ablation[k].lostVsE,0),
  gainedWithoutLessonOutside:docsOut.filter(d=>!hs.includes(d.host)).reduce((a,d)=>a+d.ablation[k].gainedVsE,0),gainedWithoutLessonInside:docsOut.filter(d=>hs.includes(d.host)).reduce((a,d)=>a+d.ablation[k].gainedVsE,0)}))('E-'+l)}]))};
// Corpus-wide: table leads of arms C and E on every retained page with a plan (the 69-page inventory corpus).
const EVALS=['phase268','phase270','phase271','phase272','step1c','step1d-b'];const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];const corpus={pages:0,C:0,E:0,EwithCondition:0};
const T=await import(D+'/phase265_test_measurements.js');
for(const ev of EVALS)for(const p of rd(join(E0,ev,'wave.json')).pages){if(p.outcome!=='fetched'||!TAUGHT.includes(p.category)||!existsSync(join(E0,ev,'raw',p.tag+'.html')))continue;corpus.pages++;
 for(const [k,pol,les] of ARMS.slice(0,2)){const r=await documentLeads(D,{evaluation:ev,docTag:p.tag,category:p.category},{policy:pol,details:true,...(les?{lessons:les}:{})});
  const tl=r.leads.filter(l=>l.methodCue==='structured_table_measurement_term');corpus[k]+=tl.length;if(k==='E')corpus.EwithCondition+=tl.filter(l=>l.condition).length;}}
const meta={schema:'pee.tables1e.goldeval.v1',label,at:new Date().toISOString(),tier:'development: every page and gold set is spent; the Stage C sample informed the lessons; no generalisation claim',build:buildIdentity(D),
 arms:Object.fromEntries(ARMS.map(([k,p,l])=>[k,{policy:p,lessons:l}])),readingIdentityExample:T.readingIdentity265(T.readingConfiguration265({plan:{schema:'x',categoryId:'x',compiledFrom:{digest:'x'}},semantics:{},tableLessons:SHADOW}))};
mkdirSync(join(REPO,'private-eval/tables-1e'),{recursive:true});
writeFileSync(PRIV,JSON.stringify({...meta,summary,corpus,documents:docsOut},null,1)+'\n');writeFileSync(PUB,JSON.stringify({...meta,summary,corpus,documents:docsOut},null,1)+'\n');
console.log(JSON.stringify({all:summary.all,bySet:Object.fromEntries(Object.entries(summary.bySet).map(([k,v])=>[k,{gold:v.gold,C:v.C,E:v.E,gained:v.gained,lost:v.lost,newWrong:v.newWrong,neg:v.negativeControlsRead}])),outsideProvenance:summary.outsideProvenance,corpus},null,1));
for(const [h,v] of Object.entries(summary.byHost))console.log(h.padEnd(22),'gold',v.gold,'C',JSON.stringify(v.C),'E',JSON.stringify(v.E),'gained',v.gained,'lost',v.lost,'newWrong',v.newWrong,'neg',JSON.stringify(v.negativeControlsRead));
