#!/usr/bin/env node
/** S87b: information-survival census of the observation model across PEE's module boundaries, per group.
 * Input: a private corpus of gold observations (value, unit, subject, conditions, measurand words, group keys).
 * Each observation enters as a perfect reading would give it; the census asks, for each element of the observation model,
 * whether each module's representation and inference still carries it. Current code, unchanged (no fitting to the corpus).
 *   PEE_KNOWLEDGE_DIR=STORE_COPY node scripts/s87b-survival-census.mjs --corpus PRIVATE --out PUBLIC [--private DETAIL]
 * Two knowledge states per observation: 'taught' (the category's own teaching) and 'untaught' (general knowledge only:
 * the category's teaching withheld), so transfer to a category PEE was never taught is measured on real observations.
 * Public output: counts and fractions per group only. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');
const QK=await import(D+'quantity_knowledge.js');const P=await import(D+'phase272_extraction_plan.js');
const KL=await import(D+'knowledge_link.js');const V=await import(D+'phase268_evidence_validation.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const store=new KnowledgeStore246(join(process.env.PEE_KNOWLEDGE_DIR,'pee246.sqlite'));
const qk=QK.loadQuantityKnowledge();const rc=KL.readerConditions();
const corpus=JSON.parse(readFileSync(arg('corpus'),'utf8'));
const CATS=[...new Set(corpus.map(o=>o.category))];
const UNTAUGHT='s87b_untaught_probe';
const know=new Map();
const knowledgeFor=(cat)=>{if(know.has(cat))return know.get(cat);
 const others=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions','tumble_dryers'].filter(c=>c!==cat);
 const plan=P.compileExtractionPlan272(store,cat,CATEGORY_REGISTRY250.find(e=>e.id===cat)?.aliases??[],others);
 const k={plan,measures:P.typedMeasures272(store,cat,plan,qk),ck:KL.categoryKnowledge(store,cat,{qk})};know.set(cat,k);return k;};
const words=o=>[o.note??'',(o.measurand??'').replace(/_/g,' ')].filter(Boolean).join('; ');
const condText=c=>String(c).replace(/^untaught:/,'').replace(/_/g,' ');
const readerCodeOf=t=>{for(const a of rc.axes)for(const [v,ws] of Object.entries(a.values))if(ws.some(w=>QK.hasPhrase(t,w)))return a.id+'='+v;return null;};
const typedBy=(q,t)=>q.conditions.some(c=>QK.hasPhrase(t,c.raw)||QK.hasPhrase(c.raw,t)||QK.hasPhrase(t,String(c.value)));
const teachBy=(plan,t)=>plan.measurements.some(m=>m.conditions.some(c=>c.terms.some(w=>QK.hasPhrase(t,w))));
function census(o,state){
 const cat=state==='taught'?o.category:UNTAUGHT;const k=knowledgeFor(cat);const w=words(o);const conds=(o.conditions??[]).map(condText);
 const p=QK.typeStoredQuantity(qk,{value:o.value,unit:String(o.unit??''),dimension:null},[]);
 const q=p?QK.typeQuantity(qk,{surface:`${o.value} ${o.unit}`,value:o.value,unit:p.unit},{labels:[w],conditions:conds}):null;
 const e={};
 // reading -> typed quantity (general knowledge)
 e.unit=!!p;e.kind=!!q?.kind.id;e.metric=!!q?.metric.id;
 // typed quantity -> taught measurement (two linkers that exist in the code)
 const l272=q?P.linkTypedToMeasure272(k.plan,k.measures,q,w,qk):null;e.measure272=!!l272?.measureId;e.measure272Ambiguous=!l272?.measureId&&(l272?.candidates.length??0)>1;
 let lkl=null;try{lkl=q?KL.linkUnderKnowledge(qk,k.ck,{id:'g',product:o.subject,quantity:q}):null;}catch{lkl=null;}
 e.measureRules=!!lkl&&!['none','ambiguous'].includes(lkl.link);
 e.linkersAgree=(e.measure272||e.measureRules)?(l272?.measureId??null)===(e.measureRules?lkl.link:null):null;
 // conditions: which representation can hold each stated condition
 e.conditions=conds.length;e.condReader=conds.filter(t=>readerCodeOf(t)).length;e.condAxes=q?conds.filter(t=>typedBy(q,t)).length:0;
 e.condTeaching=conds.filter(t=>teachBy(k.plan,t)).length;e.condAny=conds.filter(t=>readerCodeOf(t)||(q&&typedBy(q,t))||teachBy(k.plan,t)).length;
 // store boundary: the Phase265 row keeps value, unit, reader condition codes; not the words, the metric or the measurement
 const s=QK.typeStoredQuantity(qk,{value:o.value,unit:String(o.unit??''),dimension:null},[]);
 e.storeKind=!!s?.kind.id;e.storeMetric=!!s?.metric.id;
 const ls=s?P.linkTypedToMeasure272(k.plan,k.measures,s,'',qk):null;e.storeMeasure=!!ls?.measureId;
 e.storeConditions=e.condReader;
 // validation boundary (Phase268, authorised policy) on the best case a perfect reader could store
 let host='www.'+(o.host??'unknown');
 const row={measurementId:'g',revisionId:'r',leadId:'l',state:'current',value:o.value,unit:String(o.unit??''),retention:'facts_retained_class_policy',
  source:{url:'https://'+host+'/',host,sourceType:'independent_original_test'},reportedBy:'test_publisher_operator_asserted',productId:'p',
  subjectAssociation:'page_main_product_unverified',setpointC:null,conditionCodes:conds.map(readerCodeOf).filter(Boolean).map(x=>x.split('=')[1]==='empty'?'load_empty':x.split('=')[1]==='all'?'all_compartments':'single_compartment'),protocolCodes:[]};
 const v=V.validateTestMeasurements268([row],()=>({name:o.subject,declaredModel:null}),V.VALIDATION_POLICY268);
 e.validated=v.validated.length===1;e.validationReasons=v.rejected[0]?.reasons??[];
 return e;}
const groups=o=>({category:o.category,publisher:o.host,group:o.category+' @ '+o.host,set:o.set});
const rows=[];for(const o of corpus)for(const st of ['taught','untaught'])rows.push({...groups(o),state:st,role:o.kind??'unstated',e:census(o,st)});
const agg=(rs)=>{const n=rs.length;const f=k=>rs.filter(r=>r.e[k]).length;const c=rs.reduce((a,r)=>a+r.e.conditions,0);const cs=k=>rs.reduce((a,r)=>a+r.e[k],0);
 return {n,unit:f('unit'),kind:f('kind'),metric:f('metric'),measure272:f('measure272'),measure272Ambiguous:f('measure272Ambiguous'),measureRules:f('measureRules'),
  linkersDisagree:rs.filter(r=>r.e.linkersAgree===false).length,storeKind:f('storeKind'),storeMetric:f('storeMetric'),storeMeasure:f('storeMeasure'),validated:f('validated'),
  conditions:c,condReader:cs('condReader'),condAxes:cs('condAxes'),condTeaching:cs('condTeaching'),condAny:cs('condAny')};};
const out={schema:'pee.s87b.survival-census.v1',corpus:{observations:corpus.length,categories:CATS.length,publishers:new Set(corpus.map(o=>o.host)).size,groups:new Set(corpus.map(o=>o.category+'@'+o.host)).size},
 note:'Oracle input: each gold observation as a perfect reading would give it. Development material spent by earlier phases; not held-out. Counts only.',states:{}};
for(const st of ['taught','untaught']){const rs=rows.filter(r=>r.state===st);const by=key=>Object.fromEntries([...new Set(rs.map(r=>r[key]))].sort().map(g=>[g,agg(rs.filter(r=>r[key]===g))]));
 out.states[st]={all:agg(rs),byCategory:by('category'),byPublisher:by('publisher'),byGroup:by('group'),byRole:by('role')};}
const reasons={};for(const r of rows.filter(r=>r.state==='taught'))for(const x of r.e.validationReasons)reasons[x]=(reasons[x]??0)+1;out.validationRejections=reasons;
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(rows,null,1)+'\n');
console.log(JSON.stringify({taught:out.states.taught.all,untaught:out.states.untaught.all,validationRejections:reasons},null,1));
