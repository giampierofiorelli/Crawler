#!/usr/bin/env node
/** S87c (diagnosis only): the two measurement linkers on the S87b corpus. Phase272 linkTypedToMeasure272 (word overlap over
 * typed candidates) and knowledge_link linkUnderKnowledge (S81 rule programs). For each observation: both results, the
 * disagreement type, and whether each link is consistent with the sealed blind annotation of the measurand (kind; basis).
 *   PEE_KNOWLEDGE_DIR=STORE_COPY node scripts/s87c-linker-disagreement.mjs --corpus P --annotations P [--out PUBLIC] [--private DETAIL] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const QK=await import(D+'quantity_knowledge.js');
const P=await import(D+'phase272_extraction_plan.js');const KL=await import(D+'knowledge_link.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const M=await import(D+'observation_model.js');
const store=new KnowledgeStore246(join(process.env.PEE_KNOWLEDGE_DIR,'pee246.sqlite'));const qk=QK.loadQuantityKnowledge();
const corpus=JSON.parse(readFileSync(arg('corpus'),'utf8'));const ann=JSON.parse(readFileSync(arg('annotations'),'utf8'));
const ALL=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions','tumble_dryers'];
const K=new Map();const kn=c=>{if(!K.has(c)){const plan=P.compileExtractionPlan272(store,c,CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[],ALL.filter(x=>x!==c));
 K.set(c,{plan,measures:P.typedMeasures272(store,c,plan,qk),ck:KL.categoryKnowledge(store,c,{qk})});}return K.get(c);};
const COARSE=k=>({sound_pressure_level:'sound_level',sound_power_level:'sound_level',energy_per_event:'energy',periodic_energy_consumption:'energy',volume_per_event:'volume',periodic_volume:'volume',
 amount_fraction:'ratio_or_percentage',ratio:'ratio_or_percentage',relative_humidity:'ratio_or_percentage',mass_concentration:'concentration',illuminance:'luminance'}[k]??k);
const rows=[];
corpus.forEach((o,i)=>{const k=kn(o.category);const w=[o.note??'',(o.measurand??'').replace(/_/g,' ')].filter(Boolean).join('; ');const conds=(o.conditions??[]).map(c=>String(c).replace(/^untaught:/,'').replace(/_/g,' '));
 const p=QK.parseUnit(qk,String(o.unit??''));const q=p?QK.typeQuantity(qk,{surface:`${o.value} ${o.unit}`,value:o.value,unit:p},{labels:[w],conditions:conds}):null;
 const a=q?P.linkTypedToMeasure272(k.plan,k.measures,q,w,qk):null;let b=null;try{b=q?KL.linkUnderKnowledge(qk,k.ck,{id:'g',product:o.subject,quantity:q}):null;}catch(e){b={link:'error',status:'error'};}
 const A=a?.measureId??null,B=b&&!['none','ambiguous','error'].includes(b.link)?b.link:null;
 const type=!A&&!B?'neither':A&&B?(A===B?'agree':'both_differ'):A?'only_phrase272':'only_rules';
 const g=ann.measurands['o'+i];const tm=id=>id?k.measures.find(m=>m.id===id):null;
 const fit=id=>{const m=tm(id);if(!m)return null;const kinds=[...m.kinds,...m.metrics.map(x=>qk.metrics.get(x)?.kind).filter(Boolean),...(m.ratio?m.ratio.numerator:[])].map(COARSE);
  const basisName=/per_(?:100_)?(?:\w*cycle|\w*task|\w*programme|\w*run|\w*cook|\w*load)/.test(id)?'per_task_or_cycle':/per_(?:year|annum|hour|day)|annual/.test(id)?'per_time_period':null;
  return {kindOk:kinds.length?kinds.includes(g.kind):null,basisOk:basisName?basisName===g.basis:null};};
 rows.push({i,category:o.category,group:o.category+' @ '+o.host,type,phrase272:A,phrase272Basis:a?.basis??null,rules:B,rulesStatus:b?.status??null,goldKind:g.kind,goldBasis:g.basis,fitA:fit(A),fitB:fit(B),model:M.interpretObservation87(qk,{value:o.value,unit:String(o.unit??''),words:w,conditions:o.conditions??[]}).measurand});});
const count=(f)=>{const m={};for(const r of rows){const x=f(r);m[x]=(m[x]??0)+1;}return m;};
const out={schema:'pee.s87c.linker-disagreement.v1',note:'Diagnosis on spent material; consistency with the blind measurand annotation (kind, basis implied by the measurement id) is a proxy, not proof of the right link.',
 types:count(r=>r.type),byCategory:Object.fromEntries([...new Set(rows.map(r=>r.category))].map(c=>[c,count(r=>r.category===c?r.type:'_').__proto__&&Object.fromEntries(Object.entries(count(r=>r.category===c?r.type:null)).filter(([k])=>k!=='null'))])),
 rulesStatus:count(r=>r.type!=='agree'&&r.type!=='neither'?r.rulesStatus:'-'),
 kindConsistency:{phrase272:count(r=>r.fitA?String(r.fitA.kindOk):'no_link'),rules:count(r=>r.fitB?String(r.fitB.kindOk):'no_link')},
 basisConsistency:{phrase272:count(r=>r.fitA&&r.fitA.basisOk!==null?String(r.fitA.basisOk):'n/a'),rules:count(r=>r.fitB&&r.fitB.basisOk!==null?String(r.fitB.basisOk):'n/a')},
 bothDifferKind:count(r=>r.type==='both_differ'?`A:${r.fitA?.kindOk} B:${r.fitB?.kindOk}`:'-')};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(rows,null,1)+'\n');
console.log(JSON.stringify(out,null,1));
