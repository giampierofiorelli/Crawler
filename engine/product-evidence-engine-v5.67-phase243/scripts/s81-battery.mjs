#!/usr/bin/env node
/** S81 structured-fact reasoning battery (evaluation/s81/battery.json): runs one ARM of PEE's inference over the
 * battery's correctly structured facts and scores it against the gold written before any run.
 *
 * Arms (the same algorithms; what changes is the knowledge they are given, or the build):
 *   K0   no category teaching (knowledge off)
 *   Kc   the teaching as a caller gets it today (teachingView without a force overlay)
 *   Ks   Kc plus the store's own sufficiency assessments as the force overlay (the best the current code can do)
 *   K+   the S81 mechanism (knowledge_link.ts kr81: evidenceUnderKnowledge / compareUnderKnowledge / linkUnderKnowledge),
 *        only when the build exports it; ablations K+-conditions, K+-proxies, K+-assessments remove one relation kind
 * Layers: R (measurement identified; reasoning only), A (declared attribute), C (two products, comparability),
 * I (typed quantity only; concept identification). Usage:
 *   node scripts/s81-battery.mjs --arm Ks [--build DIR_WITH_dist] [--out FILE]   (refuses to overwrite) */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const ARM=arg('arm')??'Ks';const BUILD=arg('build')??process.cwd();const OUT=arg('out');
if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const D=join(BUILD,'dist/src/');
const BAT=readFileSync(arg('battery')??'evaluation/s81/battery.json','utf8');const B=JSON.parse(BAT);
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const KL=await import(D+'knowledge_link.js');const QK=await import(D+'quantity_knowledge.js');
const KR=await import(D+'knowledge_rules.js');const {sufficiencyOf247,relations247}=await import(D+'phase247_category_relations.js');
const qk=QK.loadQuantityKnowledge();const qk0=qk;
const store=new KnowledgeStore246(process.env.PEE_KNOWLEDGE_FILE??join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));

// ---- typed quantities as the reader states them (kind, metric, stated axes; missing = the metric's own requirements not stated)
const tq=(q={},product=null)=>{const met=q.metric?qk.metrics.get(q.metric):null;const axes=q.axes??[];
 return {surface:'',value:1,unit:{expression:'x',kinds:[q.kind],dim:{},factor:1,offset:0,atoms:[]},si:{value:1},
  kind:{id:q.kind??null,candidates:q.kind?[q.kind]:[],basis:[],justification:{type:'unit',from:'unit',evidence:[],ref:null,rules:[],derivation:[]}},
  metric:{id:q.metric??null,candidates:[],basis:[]},weighting:null,reference:null,
  conditions:axes.map(([axis,value])=>({axis,value,raw:value,from:'labels'})),missingConditions:(met?.requires??[]).filter(a=>!axes.some(x=>x[0]===a)),unresolved:[],
  knowledge:qk.identity,source:'doc-'+(product??'x'),protocol:null,cohort:null,product,contextScope:null};};

// ---- the current-code engine (arms K0, Kc, Ks): link-rules as shipped, the evidence program with the link given
const storeOverlay=cat=>({id:'store-relation-assessments',relations:Object.fromEntries(relations247(store,cat).filter(r=>r.kind==='measured_by').map(r=>{const s=sufficiencyOf247(store,r.relationId).state;
 return [r.relationId,{support:'supported',...(s==='established'?{sufficiency:'establishes'}:s==='informs_only'?{sufficiency:'informs_only'}:{})}];}))});
const currentEngine=(arm)=>{
 const view=cat=>arm==='K0'?{category:cat,measurements:[],basis:{items:0,relations:0,forceOverlay:null}}:KL.teachingView(store,cat,arm==='Ks'?storeOverlay(cat):null);
 const ev=KL.loadLinkRules().rules.get('evidence');
 const evidence=(cat,vals)=>{const V=view(cat);const ds=V.measurements.map(m=>KL.describeMeasurement(qk,m.concept,m.conditions));
  const lvs=vals.map(v=>({id:v.id,quantity:tq(v.q??{},v.product),product:v.product,source:'doc-'+v.product,test:null}));
  const I=KL.linkFacts(V,ds,lvs,qk);const known=new Set(V.measurements.map(m=>m.concept.id));
  const F={...I,link_to:vals.filter(v=>v.m&&known.has(v.m)).map(v=>[v.id,v.m]),assumes_condition:[],member:[],member_group:[],identity_unknown:[]};
  for(const v of vals)for(const [a,x] of v.axes??[])F.value_condition.push([v.id,a,x]);
  const only=Object.fromEntries(Object.entries(F).filter(([k])=>ev.vocab.has(k)&&(ev.vocab.get(k).role==='input'||!ev.rules.some(r=>r.head.pred===k))));
  const m=KR.evaluate(ev,only,{record:'battery'});const out={};
  for(const f of m.all('evidence_force')){const [, o,force]=f.args;const k=force==='unverified'?'not_verified':force;(out[o]??=[]).push(k);}
  return out;};
 return {name:arm,evidence,attribute:()=>({}),
  compare:(cat,meas,a,b)=>{const r=QK.compareQuantities(qk,tq(a.q,a.product),tq(b.q,b.product));return {verdict:mapVerdict(r.verdict),reasons:r.reasons};},
  // current code: reader codes are not consulted; a catalog's declared conditions are what ranking trusts
  row:(c)=>{const r=c.row;const f=QK.findQuantities(qk,`${r.value} ${r.unit==='kwh'?'kWh':r.unit}`)[0];const q=QK.typeQuantity(qk,{surface:f.surface,value:f.value,unit:f.unit},{});
   if(!c.measurement){const x=KL.linkValues(qk,view(c.category),[{id:'v',quantity:q,product:'P',source:'doc',test:null}]).results[0];
    return {link:x.status==='ambiguous'?'ambiguous':['no_taught_measurement','not_linked','member_only'].includes(x.status)?'none':x.measurements.length===1?x.measurements[0]:'ambiguous'};}
   const V=view(c.category);const ds=V.measurements.map(m=>KL.describeMeasurement(qk,m.concept,m.conditions));const tm=V.measurements.find(m=>m.concept.id===c.measurement);
   const axes=new Set(ds.find(d=>d.id===c.measurement)?.axes.map(a=>a.axis)??[]);const req=(tm?.conditions??[]).map(x=>x.id).sort();
   // pre-S81: a requirement was checked only through its axis; untyped ones counted as shown
   const typed=(tm?.conditions??[]).filter(x=>[...axes].some(a=>KL.statementHead(x.statement).toLowerCase().includes(a.replace(/_/g,' ')))).map(x=>x.id);
   return {shown:req.filter(x=>!typed.includes(x)),notShown:typed.sort()};},
  derive:(c)=>({derived:[...c.declared].sort(),unsupported:[]}),
  link:(cat,v)=>{const V=view(cat);const r=KL.linkValues(qk,V,[{id:'v',quantity:tq(v.q,v.product),product:v.product,source:'doc',test:null}]).results[0];
   return r.status==='ambiguous'?'ambiguous':r.status==='no_taught_measurement'||r.status==='not_linked'||r.status==='member_only'?'none':r.measurements.length===1?r.measurements[0]:'ambiguous';}};
};
const mapVerdict=v=>v==='comparable'||v==='comparable_within_source'?'comparable':v==='not_comparable'?'not_comparable':'unestablished';

// ---- the S81 engine (arm K+ and its ablations), when the build provides it
const plusEngine=(arm)=>{if(!KL.evidenceUnderKnowledge)return null;
 // S82: K+ uses the reader-condition axes when the build has them; K+-readers is the ablation without them
 const noReaders=arm==='K+-readers';const ablate=arm.startsWith('K+-')&&!noReaders?arm.slice(3):null;
 const qk=KL.withReaderConditions&&!noReaders?KL.withReaderConditions(qk0):qk0;
 const know=cat=>KL.categoryKnowledge(store,cat,{qk,ablate});
 const rowValue=(c)=>{const r=c.row;const f=QK.findQuantities(qk,`${r.value} ${r.unit==='kwh'?'kWh':r.unit}`)[0];const q=QK.typeQuantity(qk,{surface:f.surface,value:f.value,unit:f.unit},{});
  const ax=KL.readerConditionAxes&&!noReaders?KL.readerConditionAxes(r.codes).axes:[];return {id:'v',product:'P',quantity:q,axes:ax,measurement:c.measurement??null};};
 return {name:arm,
  evidence:(cat,vals)=>KL.evidenceUnderKnowledge(qk,know(cat),vals.map(v=>({id:v.id,product:v.product,measurement:v.m,quantity:v.q?tq(v.q,v.product):null,axes:v.axes??[],states:v.states??{}}))).byOutcome,
  attribute:(cat,vals)=>KL.attributeEvidence(know(cat),vals.map(v=>({id:v.id,product:v.product,attribute:v.attr}))).byOutcome,
  compare:(cat,meas,a,b)=>{const r=KL.compareUnderKnowledge(qk,know(cat),meas,...[a,b].map(x=>({id:x.id,product:x.product,quantity:tq(x.q,x.product),states:x.states??{}})));return {verdict:r.verdict,reasons:r.reasons,conditions:r.conditions};},
  link:(cat,v)=>KL.linkUnderKnowledge(qk,know(cat),{id:'v',product:v.product,quantity:tq(v.q,v.product),states:v.states??{}}).link,
  row:(c)=>{const k=know(c.category);const v=rowValue(c);if(!c.measurement){const q=v.quantity;return {link:KL.linkUnderKnowledge(qk,k,{...v,quantity:{...q,conditions:[...q.conditions,...v.axes.map(([axis,value])=>({axis,value,raw:value,from:'labels'}))]}}).link};}
   const e=KL.evidenceUnderKnowledge(qk,k,[v]);const req=(k.view.measurements.find(m=>m.concept.id===c.measurement)?.conditions??[]).map(x=>x.id).sort();
   const ns=e.conditionsNotShown.map(x=>x.condition).sort();return {shown:req.filter(x=>!ns.includes(x)),notShown:ns};},
  derive:(c)=>{const k=know(c.category);const tests=c.tests.map((t,i)=>({id:'t'+i,product:t.product,quantity:null,states:t.states??{},
    axes:[...(t.axes??[]),...(t.codes&&KL.readerConditionAxes&&!noReaders?KL.readerConditionAxes(t.codes).axes:[])]}));
   if(!KL.conditionsMetFromRecords)return {derived:[...c.declared].sort(),unsupported:[]};
   const d=KL.conditionsMetFromRecords(qk,k,c.measurement,tests,c.declared);return {derived:d.derived,unsupported:d.unsupported};}};
};
const engine=ARM.startsWith('K+')?plusEngine(ARM):currentEngine(ARM);
if(!engine)throw Error('arm '+ARM+' needs a build that exports the S81 mechanism');

// ---- scoring
const STRONG={direct:3,partial:2};const strength=f=>STRONG[f]??0;const POS=new Set(['direct','partial','indirect']);
const best=list=>!list?.length?'none':[...list].sort((a,b)=>strength(b)-strength(a)||a.localeCompare(b))[0];
const classify=(pred,gold)=>pred===gold?'correct':strength(pred)>strength(gold)?'over_claim':(!POS.has(pred)&&POS.has(gold))?'unjustified_abstention':'wrong';
const results=[];
for(const c of B.cases){let got,score;
 if(c.layer==='R'||c.layer==='A'){const by=c.layer==='R'?engine.evidence(c.category,c.values):engine.attribute(c.category,c.values);
  got=Object.fromEntries(Object.keys(c.gold.outcomes).map(o=>[o,best(by[o])]));
  const extra=Object.entries(by).filter(([o,l])=>!(o in c.gold.outcomes)&&l.some(f=>STRONG[f])).map(([o])=>o);
  score=Object.entries(c.gold.outcomes).map(([o,g])=>classify(got[o],g));if(extra.length){score.push('over_claim');got.__extra=extra;}}
 else if(c.layer==='C'){const r=engine.compare(c.category,c.measurement,c.values[0],c.values[1]);got=r;const g=c.gold.verdict;
  score=[r.verdict===g?'correct':r.verdict==='comparable'?'over_claim':r.verdict==='unestablished'?'unjustified_abstention':'wrong'];}
 else if(c.layer==='D'){const r=engine.row(c);got=r;const g=c.gold;const eq=(a,b)=>JSON.stringify([...(a??[])].sort())===JSON.stringify([...(b??[])].sort());
  if(g.link){const l=r.link;score=[l===g.link?'correct':(g.link==='ambiguous'||g.link==='none')&&l!=='ambiguous'&&l!=='none'?'over_claim':(l==='ambiguous'||l==='none')?'unjustified_abstention':'wrong'];}
  else{const over=(r.shown??[]).some(x=>!g.shown.includes(x)),under=g.shown.some(x=>!(r.shown??[]).includes(x));score=[eq(r.shown,g.shown)?'correct':over?'over_claim':under?'unjustified_abstention':'wrong'];}}
 else if(c.layer==='K'){const r=engine.derive(c);got=r;const g=c.gold;const over=r.derived.some(x=>!g.derived.includes(x)),under=g.derived.some(x=>!r.derived.includes(x));
  score=[!over&&!under?'correct':over?'over_claim':'unjustified_abstention'];}
 else {const l=engine.link(c.category,c.values[0]);got={link:l};const g=c.gold.link;
  score=[l===g?'correct':(g==='ambiguous'||g==='none')&&l!=='ambiguous'&&l!=='none'?'over_claim':(l==='ambiguous'||l==='none')?'unjustified_abstention':'wrong'];}
 results.push({id:c.id,layer:c.layer,category:c.category,principle:c.principle,got,score});}
// metamorphic
const meta=[];const byId=Object.fromEntries(B.cases.map(c=>[c.id,c]));
if(byId['C-ap-1']){{const c=byId['C-ap-1'];const r1=engine.compare(c.category,c.measurement,c.values[0],c.values[1]);
 const ren=c.values.map((v,i)=>({...v,product:'Renamed '+i}));const r2=engine.compare(c.category,c.measurement,ren[0],ren[1]);meta.push({id:'M-rename',pass:r1.verdict===r2.verdict,got:[r1.verdict,r2.verdict]});}
{const c=byId['C-dh-1'];const b={...c.values[1],q:{...c.values[1].q,axes:[['inlet_air_state','30 C 80 % RH']]},states:{matched_temperature_humidity:'30 C, 80 % RH, normal, 24 h'}};
 const r=engine.compare(c.category,c.measurement,c.values[0],b);meta.push({id:'M-flip-condition',pass:r.verdict==='not_comparable',got:r.verdict});}
if(ARM.startsWith('K+')){const c=byId['R-ap-1'];const k=KL.categoryKnowledge(store,c.category,{dropRelation:{from:'cadr_noise_power_curve',to:'quiet_night_operation',kind:'measured_by'}});
 const by=KL.evidenceUnderKnowledge(qk,k,c.values.map(v=>({id:v.id,product:v.product,measurement:v.m,quantity:null,axes:v.axes??[],states:v.states??{}}))).byOutcome;
 meta.push({id:'M-remove-support',pass:!(by.quiet_night_operation??[]).some(f=>STRONG[f]),got:by.quiet_night_operation??[]});}
else meta.push({id:'M-remove-support',pass:null,got:'not runnable on this arm (no relation-level ablation in the current code)'});}
// totals
const T={};const add=(k,n=1)=>T[k]=(T[k]??0)+n;
for(const r of results)for(const s of r.score){add('all:'+s);add(r.layer+':'+s);for(const p of r.principle)add(p+':'+s);add('cat:'+r.category+':'+s);}
const units=results.reduce((n,r)=>n+r.score.length,0);
const out={schema:'pee.s81.battery-run.v1',arm:ARM,build:BUILD,battery:createHash('sha256').update(BAT).digest('hex'),units,
 summary:{correct:T['all:correct']??0,over_claim:T['all:over_claim']??0,unjustified_abstention:T['all:unjustified_abstention']??0,wrong:T['all:wrong']??0},
 byLayer:Object.fromEntries(['R','A','C','I','D','K'].map(l=>[l,{correct:T[l+':correct']??0,over_claim:T[l+':over_claim']??0,unjustified_abstention:T[l+':unjustified_abstention']??0,wrong:T[l+':wrong']??0}])),
 totals:T,metamorphic:meta,results};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({arm:ARM,units,summary:out.summary,byLayer:out.byLayer,metamorphic:meta.map(m=>[m.id,m.pass])}));
