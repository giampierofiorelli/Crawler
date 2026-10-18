#!/usr/bin/env node
/** Quantity knowledge (GK) evaluation, zero HTTP. Never overwrites a result.
 *
 *  reading  LABEL  1G baseline vs 1G + quantity knowledge on every retained page (unique by content hash; SPENT
 *                  development pages): typed kinds, frequency weighting kept, metrics, conditions, same quantity printed
 *                  twice, units the baseline lost or the knowledge lost. Also the units of the sealed 1E/1G gold elements.
 *  requests LABEL  Phase253 constraint reader (operational) vs the knowledge requirement reader, and the advice with and
 *                  without knowledge, on the frozen request selection against the blind gold (requirements-gold.json,
 *                  hash sealed in requirements-freeze.json before any run).
 *  links    LABEL  word-overlap link (linkToMeasure272) vs typed link (linkTypedToMeasure272) from every typed table value
 *                  of a taught category to its taught measurements (category teaching read from a COPY of the store).
 * Public output (value-free: no page values, no page labels) in evaluation/quantity-knowledge; full output in
 * pee-knowledge private-eval/quantity-knowledge. */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,readdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const [cmd,label]=process.argv.slice(2);
if(!['reading','requests','links'].includes(cmd)||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: reading|requests|links LABEL');
const sha=b=>createHash('sha256').update(b).digest('hex');const D=resolve('dist/src');
const Q=await import(D+'/quantity_knowledge.js');const K=await import(D+'/table_interpreter1g_knowledge.js');
const qk=Q.loadQuantityKnowledge(process.env.QK_PACK?JSON.parse(readFileSync(process.env.QK_PACK,'utf8')):undefined);
const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const PRIV=join(REPO,'private-eval/quantity-knowledge',`${cmd}-${label}.json`),PUB=join('evaluation/quantity-knowledge',`${cmd}-${label}.json`);
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
mkdirSync(join(REPO,'private-eval/quantity-knowledge'),{recursive:true});
const codeHash=sha(['quantity_knowledge.js','table_interpreter1g_knowledge.js','phase272_extraction_plan.js','phase253_request_advice.js'].map(f=>readFileSync(join(D,f),'utf8')).join('\n'));
const meta={knowledge:qk.identity,codeSha256:codeHash,generatedAt:new Date().toISOString()};
const storeCopy=async()=>{const ST=await import(D+'/phase246_knowledge_store.js');const live=join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite');
 const copy=join(homedir(),'.local/share/product-evidence-engine/qk-eval-store-copy.sqlite');copyFileSync(live,copy);return new ST.KnowledgeStore246(copy);};
const pages=()=>{const out=[];const seen=new Map();for(const ev of readdirSync(ROOT).sort()){const rd=join(ROOT,ev,'raw');if(!existsSync(rd))continue;
 let wave=null;try{wave=JSON.parse(readFileSync(join(ROOT,ev,'wave.json'),'utf8'));}catch{}
 for(const f of readdirSync(rd).filter(f=>f.endsWith('.html')).sort()){const b=readFileSync(join(rd,f));const h=sha(b);const tag=f.replace(/\.html$/,'');
  const w=wave?.pages?.find(p=>p.tag===tag);if(seen.has(h)){seen.get(h).copies.push(ev+'/'+tag);continue;}
  const p={key:ev+'/'+tag,sha256:h,html:b.toString('utf8'),host:w?(()=>{try{return new URL(w.finalUrl??w.url).host;}catch{return null;}})():null,category:w?.category??null,copies:[]};seen.set(h,p);out.push(p);}}
 return out;};
const write=(pub,priv)=>{writeFileSync(PUB,JSON.stringify({...meta,...pub},null,1)+'\n');writeFileSync(PRIV,JSON.stringify({...meta,...priv},null,1)+'\n');console.log('wrote',PUB,PRIV);};

if(cmd==='reading'){
 const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const perHost={};const rows=[];let copies=0;
 for(const p of pages()){copies+=p.copies.length;const t0=Date.now();const r=K.interpretWithKnowledge1G(p.html,qk);const ms=Date.now()-t0;inc('pages');
  const h=p.host??'unknown';perHost[h]??={pages:0,typed:0,sameQuantityTwice:0,aWeightingKept:0};perHost[h].pages++;
  for(const t of r.tables)for(const o of t.observations){if(!['quantity','range','bound','number'].includes(o.kind))continue;inc('valueObservations');
   const q=o.quantity;const currency=o.dimension==='currency';
   if(o.unit)inc('baseline_unit');if(q)inc('knowledge_typed');
   if(o.unit&&!q)inc(currency?'baseline_unit_currency_not_a_quantity':'baseline_unit_knowledge_lost');
   if(!o.unit&&q)inc('knowledge_unit_baseline_lost');
   if(!q){if(o.unit&&!currency)rows.push({page:p.key,obs:o.id,surface:o.surface,baselineUnit:o.unit,knowledge:null});continue;}
   perHost[h].typed++;
   inc(q.kind.id?'kind_established':'kind_ambiguous');
   if(q.unit.level){inc('level_values');inc('level_weighting_'+q.weighting);inc('level_baseline_unit_'+(o.unit??'none'));if(q.weighting==='A')perHost[h].aWeightingKept++;
    inc('level_kind_'+(q.kind.id??'ambiguous'));}
   if(q.metric.id){inc('metric_'+q.metric.id);inc(q.missingConditions.length?'metric_conditions_incomplete':'metric_conditions_complete');}
   if(o.sameAs){inc('same_quantity_printed_twice');perHost[h].sameQuantityTwice++;}
   rows.push({page:p.key,obs:o.id,surface:o.surface,labels:o.property,baselineUnit:o.unit,baselineDimension:o.dimension,unit:q.unit.expression,kind:q.kind.id,kindCandidates:q.kind.candidates,kindBasis:q.kind.basis,
    metric:q.metric.id,weighting:q.weighting,conditions:q.conditions,missing:q.missingConditions,sameAs:o.sameAs,sameAsReason:o.sameAsReason,unresolved:q.unresolved});}
  inc('ms_total',ms);}
 C.identicalCopiesExcluded=copies;
 // the units of the sealed gold elements (1E dev sample and 1G check set), annotated before this knowledge existed
 const gold={};for(const [set,ann] of [['1e-dev','tables-1e/annotations.json'],['1g-check','tables-1e/annotations-1g-check.json']]){const A=JSON.parse(readFileSync(join(ROOT,ann),'utf8')).tables;
  const g={withUnit:0,unitParsed:0,unparsed:[]};for(const t of A)for(const c of t.cells)for(const e of c.elements??[]){if(!e.unit||/^[£$€]|pence|^p$/i.test(e.unit))continue;g.withUnit++;
   if(Q.parseUnit(qk,e.unit))g.unitParsed++;else g.unparsed.push(e.unit);}
  g.unparsed=[...new Set(g.unparsed)].sort();gold[set]=g;}
 write({schema:'pee.qk-eval-reading.v1',evidenceTier:'T2 authentic controlled on SPENT development pages (not held-out)',counts:C,perHost,goldUnits:gold},{rows});
}

if(cmd==='requests'){
 const FREEZE=JSON.parse(readFileSync('evaluation/quantity-knowledge/requirements-freeze.json','utf8'));
 const goldB=readFileSync('evaluation/quantity-knowledge/requirements-gold.json');if(sha(goldB)!==FREEZE.goldSha256)throw Error('gold differs from the sealed hash');
 const selB=readFileSync('evaluation/quantity-knowledge/request-selection.json');if(sha(selB)!==FREEZE.selectionSha256)throw Error('selection differs from the sealed hash');
 if(!process.env.QK_TUNED&&qk.identity!==FREEZE.knowledge)throw Error('knowledge differs from the frozen identity '+FREEZE.knowledge);
 if(!process.env.QK_TUNED&&codeHash!==FREEZE.codeSha256)throw Error('code differs from the frozen hash');
 const GOLD=JSON.parse(goldB).items;const SEL=JSON.parse(selB).items;
 const C253=await import(D+'/phase253_request_constraints.js');const ADV=await import(D+'/phase253_request_advice.js');const REG=await import(D+'/phase248_category_registry.js');
 const store=await storeCopy();
 const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const items=[];
 const at=(text,s)=>{const i=text.indexOf(s);return i<0?null:[i,i+s.length];};
 const overlaps=(a,b)=>!!a&&!!b&&a[0]<b[1]&&b[0]<a[1];
 for(const it of SEL){const g=GOLD.find(x=>x.id===it.id);if(!g)throw Error('no gold '+it.id);const text=it.text;
  const ex=C253.extractConstraints253(text);const baseSpans=[...ex.constraints.map(c=>({s:at(text,c.span),how:'constraint'})),...ex.unmapped.map(u=>({s:at(text,u.span),how:'unmapped'}))];
  const reqs=Q.readQuantityRequirements(qk,text);const surfaced=reqs.filter(r=>(r.bound!==null||r.quantity.low!==undefined)&&r.status!=='no_bound');
  const used=new Map();
  const gq=g.quantities.map(q=>{const occ=[];let i=-1;while((i=text.indexOf(q.surface,i+1))>=0)occ.push([i,i+q.surface.length]);const n=used.get(q.surface)??0;used.set(q.surface,n+1);return {...q,occ,span:occ[Math.min(n,occ.length-1)]??null};});
  const rowQs=[];
  for(const q of gq){const s=q.span;const required=q.describes==='product_requirement'||q.describes==='available_space';
   const b=baseSpans.find(x=>overlaps(x.s,s));const k=surfaced.find(r=>overlaps([r.start,r.end],s));const anyK=reqs.find(r=>overlaps([r.start,r.end],s));
   const goldBound=q.bound==='none'?null:q.bound;const kBound=k?(k.bound??(k.quantity.low!==undefined?'range':null)):null;
   const row={surface:q.surface,describes:q.describes,goldBound:q.bound,unit:q.unit,quantityMeant:q.quantityMeant,ambiguity:q.ambiguity,baseline:b?b.how:'silent',
    knowledge:k?{bound:kBound,status:k.status,kind:k.quantity.kind.id,kindCandidates:k.quantity.kind.candidates,metric:k.quantity.metric.id,weighting:k.quantity.weighting}:anyK?{surfaced:false,reason:anyK.status,kind:anyK.quantity.kind.id}:null};
   rowQs.push(row);
   if(required){inc('req_total');inc('req_baseline_'+row.baseline);
    inc('req_combined_'+(b?b.how:k?'knowledge':'silent'));
    if(k){inc('req_knowledge_surfaced');inc('req_knowledge_bound_'+(kBound===goldBound?'correct':'differs'));inc('req_knowledge_status_'+k.status);}
    else inc('req_knowledge_'+(anyK?'read_not_surfaced_'+anyK.status:'not_read'));}
   else{inc('nonreq_total');if(k)inc(b?'nonreq_surfaced_by_knowledge_also_baseline':'nonreq_surfaced_by_knowledge_only');if(b)inc('nonreq_baseline_'+b.how);}}
  for(const r of surfaced)if(!gq.some(q=>q.occ.some(o=>overlaps([r.start,r.end],o))))inc('knowledge_surfaced_matching_no_gold_quantity');
  // the answer with and without knowledge
  const a0=ADV.adviseFromRequest253(text,store,REG.CATEGORY_REGISTRY250);const a1=ADV.adviseFromRequest253(text,store,REG.CATEGORY_REGISTRY250,{quantityKnowledge:qk});
  const hasReq=rowQs.some(r=>r.describes==='product_requirement'||r.describes==='available_space');
  const noCheck=a=>a.statements.some(s=>/^No checkable requirement is stated yet/.test(s));
  if(hasReq&&noCheck(a0))inc('advice_baseline_states_no_requirement_but_gold_has_one');
  if(hasReq&&noCheck(a1))inc('advice_knowledge_states_no_requirement_but_gold_has_one');
  const strip=a=>JSON.stringify({...a,statements:null,unassessedObjectives:null,questions:null,researchPlan:null,quantityRequirements:null});
  inc(strip(a0)===strip(a1)?'advice_other_fields_identical':'advice_other_fields_changed');
  if(a1.response!==a0.response)inc('advice_response_changed');
  inc('advice_added_unassessed',a1.unassessedObjectives.length-a0.unassessedObjectives.length);inc('advice_added_questions',a1.questions.length-a0.questions.length);
  items.push({id:it.id,quantities:rowQs,advice:{baseline:{response:a0.response,unassessed:a0.unassessedObjectives},knowledge:{response:a1.response,unassessed:a1.unassessedObjectives,quantityRequirements:a1.quantityRequirements??[],questions:a1.questions.filter(q=>!a0.questions.includes(q))}}});}
 store.close?.();
 write({schema:'pee.qk-eval-requests.v1',evidenceTier:process.env.QK_TUNED?'TUNED re-run after looking at the first run (not a first run)':'T2 first run on frozen public request texts; gold by a fresh-context agent blind to the reader; reader and knowledge frozen before the run',counts:C,items},{counts:C,items});
}

if(cmd==='links'){
 const P=await import(D+'/phase272_extraction_plan.js');const store=await storeCopy();
 const cats=[...new Set(store.db.prepare("SELECT DISTINCT category_id c FROM category_items WHERE concept_kind='measurement'").all().map(r=>r.c))].sort();
 const plans=new Map(cats.map(c=>{const pl=P.compileExtractionPlan272(store,c,[c.replace(/_/g,' ').replace(/s$/,'')],cats);return [c,{plan:pl,typed:P.typedMeasures272(store,c,pl,qk)}];}));
 const C={};const inc=(k,n=1)=>C[k]=(C[k]??0)+n;const rows=[];
 for(const p of pages()){if(!plans.has(p.category))continue;const {plan,typed}=plans.get(p.category);const r=K.interpretWithKnowledge1G(p.html,qk);
  for(const t of r.tables)for(const o of t.observations){const q=o.quantity;if(!q||o.sameAs)continue;inc('values');
   const text=[...o.property,...o.conditions,o.surface].join(' ');const u=P.canonicalUnit272(q.unit.surface)??o.unit??q.unit.surface;
   const w=P.linkToMeasure272(plan,text,u);const k=P.linkTypedToMeasure272(plan,typed,q,text,qk);
   const cls=!w&&!k.measureId?'both_none':w&&k.measureId===w.measureId?'same':!w?'typed_only':!k.measureId?'words_only':'different';inc(cls);inc(p.category+':'+cls);
   if(k.proxyFor.length)inc('typed_reports_taught_proxy');if(w&&k.proxyFor.some(x=>w.outcomes.includes(x)))inc('words_links_taught_proxy_to_its_outcome');
   if(cls!=='both_none'&&cls!=='same')rows.push({page:p.key,category:p.category,obs:o.id,labels:o.property,surface:o.surface,unit:q.unit.expression,kind:q.kind.id,kindCandidates:q.kind.candidates,metric:q.metric.id,words:w?.measureId??null,typed:k.measureId,typedCandidates:k.candidates,typedBasis:k.basis,proxyFor:k.proxyFor});}}
 store.close?.();
 write({schema:'pee.qk-eval-links.v1',evidenceTier:'T2 authentic controlled on SPENT development pages; category teaching from a store copy (read only)',counts:C,
  typedMeasures:Object.fromEntries([...plans].map(([c,v])=>[c,v.typed.filter(m=>m.metrics.length||m.kinds.length)])),
  changed:rows.map(r=>({category:r.category,unit:r.unit,kind:r.kind,metric:r.metric,words:r.words,typed:r.typed,typedBasis:r.typedBasis,proxyFor:r.proxyFor}))},{rows});
}
