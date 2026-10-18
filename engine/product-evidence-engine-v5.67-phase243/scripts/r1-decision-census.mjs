#!/usr/bin/env node
/**
 * R1 (roadmap, 2026-10-18): which mechanism makes each decision of the reading stack. Zero HTTP; spent pages only.
 *   node scripts/r1-decision-census.mjs LABEL     writes evaluation/r1/decision-census-LABEL.json (counts only)
 * Every retained page (deduplicated by hash) is read by the whole-document reader and the product-facts view, once with
 * the full knowledge and once per ablation, each ablation removing one kind of knowledge and nothing else. A decision
 * that changes when a kind of knowledge is removed depends on that knowledge; a decision no data ablation changes is
 * made by code alone (or by data no ablation removed: units, kinds, dimensions). Decisions:
 *   quantity (segment and table): found, kind, metric, conditions, product, evidence class, record role, identifier;
 *   comparability verdict of every pair of same-kind values of one product on a page (capped);
 *   qualitative item: present, aspect, polarity, statement type, evidence type;
 *   function statement: present, presence, product; mode: present.
 */
import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const label=process.argv[2];if(!/^[a-z0-9-]{3,30}$/.test(label??''))throw Error('usage: LABEL');const OUT=`evaluation/r1/decision-census-${label}.json`;if(existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const W=await import(D+'document_evidence.js');const PF=await import(D+'product_facts.js');
const R='resources/quantity-knowledge/';const PACK=JSON.parse(readFileSync(R+'quantity-knowledge.v2.json','utf8'));const RULES=JSON.parse(readFileSync(R+'rules.v2.json','utf8'));const FN=JSON.parse(readFileSync(R+'functions.v1.json','utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const ARMS={
 full:{},
 no_scientific_methods:{pack:p=>{p.kindEvidence=[];p.methods=[];p.relations=[];p.scales=[];return p;},note:'methods with fixed conditions, kind evidence (standards, documented methods), physical relations, class scales'},
 no_metrics:{pack:p=>{p.metrics=[];p.relations=[];for(const m of p.methods??[])m.measures=[];for(const s of p.scales??[])delete s.metric;return p;},note:'metric definitions (terms, required conditions); relations, and the metric links of methods and scales, depend on metrics'},
 no_condition_knowledge:{pack:p=>{for(const a of p.conditionAxes){if(a.values)a.values={};a.cues=[];a.freeText=[];}return p;},note:'condition-axis values, cues and free-text words'},
 no_kind_words:{pack:p=>{for(const k of p.kinds){k.terms=[];delete k.discriminators;delete k.comparatives;}p.kindEvidence=[];return p;},note:'words that tell kinds of one dimension apart (and the kind evidence built on them)'},
 no_qualitative_vocabulary:{pack:p=>{p.aspects=[{id:'other',terms:[],source:'pee'}];p.phenomena=[];return p;},note:'aspects and phenomena'},
 no_function_vocabulary:{fn:f=>{for(const x of [...f.functions,...f.components])x.terms=['zzz-no-term-'+x.id];return f;},note:'function and component names (the named-pattern code stays)'},
 no_kr_record_program:{rules:r=>{r.programs=r.programs.filter(p=>p.id!=='record');return r;},note:'rule program record (P1)'}};
const ROOT=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const pages=[];const seen=new Set();
for(const ev of readdirSync(ROOT).sort()){const rd=join(ROOT,ev,'raw');if(!existsSync(rd))continue;for(const f of readdirSync(rd).filter(f=>f.endsWith('.html')).sort()){const b=readFileSync(join(rd,f));const h=createHash('sha256').update(b).digest('hex');if(seen.has(h))continue;seen.add(h);pages.push({tag:ev+'/'+f,html:b.toString('utf8')});}}
const ck=c=>c.map(x=>x.axis+'='+x.value).sort().join(',');
function decisions(arm){const a=ARMS[arm];const qk=QK.loadQuantityKnowledge(a.pack?a.pack(clone(PACK)):undefined,a.rules?a.rules(clone(RULES)):undefined);const fns=a.fn?PF.loadProductFunctions(a.fn(clone(FN))):PF.loadProductFunctions();
 const d=new Map();const put=(k,v)=>d.set(k,v);
 for(const p of pages){let doc;try{doc=W.readDocumentEvidence(p.html,qk,{sourceType:'independent_review'});}catch(e){put(`err:${p.tag}`,String(e.message).slice(0,60));continue;}
  const typed=[];
  for(const q of doc.quantities){const k=`q:${p.tag}:${q.segment}:${q.start}`;put(k+':found',q.surface);if(q.identifierPart){put(k+':identifier','yes');continue;}
   put(k+':kind',q.quantity?.kind.id??'open');put(k+':metric',q.quantity?.metric.id??'-');put(k+':conditions',q.quantity?ck(q.quantity.conditions):'-');put(k+':product',q.product??'-');put(k+':evidence',q.evidenceClass);put(k+':role',q.recordRole??'-');
   if(q.quantity?.kind.id&&q.product)typed.push({k,q:q.quantity,p:q.product});}
  for(const t of doc.tables.tables)for(const o of t.observations){if(!['quantity','range','bound','number'].includes(o.kind))continue;const k=`t:${p.tag}:${t.table}:${o.id}`;
   put(k+':kind',o.quantity?.kind.id??'open');put(k+':metric',o.quantity?.metric.id??'-');put(k+':conditions',o.quantity?ck(o.quantity.conditions):'-');put(k+':product',o.product??'-');put(k+':role',o.recordRole??'-');
   if(o.quantity?.kind.id&&o.product)typed.push({k,q:o.quantity,p:o.product});}
  let n=0;for(let i=0;i<typed.length&&n<400;i++)for(let j=i+1;j<typed.length&&n<400;j++){const x=typed[i],y=typed[j];if(x.p!==y.p||x.q.kind.id!==y.q.kind.id)continue;n++;
   try{put(`c:${x.k}|${y.k}`,QK.compareQuantities(qk,x.q,y.q).verdict);}catch{put(`c:${x.k}|${y.k}`,'error');}}
  for(const e of doc.qualitativeEvidence){const k=`e:${p.tag}:${e.segment}:${e.sentence.start}:${e.property.aspect}`;put(k+':present','yes');put(k+':polarity',e.polarity);put(k+':statement',e.statementType);put(k+':evidence',e.evidenceType);}
  let pf;try{pf=PF.readProductFacts(qk,doc,{functions:fns});}catch(e){put(`errf:${p.tag}`,String(e.message).slice(0,60));continue;}
  for(const f of pf.functions){const k=`f:${p.tag}:${f.segment}:${f.sentence.start}:${f.function}`;put(k+':present','yes');put(k+':presence',f.presence);put(k+':product',f.product??'-');}
  for(const m of pf.modes)put(`m:${p.tag}:${m.segment}:${m.sentence.start}:${m.mode}`,'yes');}
 return d;}
const typeOf=k=>{const parts=k.split(':');const fam={q:'quantity',t:'table_value',c:'comparability',e:'qualitative',f:'function',m:'mode',err:'error',errf:'error'}[parts[0]]??parts[0];return parts[0]==='c'||parts[0]==='m'?fam:fam+'.'+parts[parts.length-1];};
const full=decisions('full');const totals={};for(const k of full.keys()){const t=typeOf(k);totals[t]=(totals[t]??0)+1;}
const out={schema:'pee.r1.decision-census.v1',label,generatedAt:new Date().toISOString(),pages:pages.length,tier:'spent development and evaluation pages (descriptive census, not an accuracy evaluation)',arms:Object.fromEntries(Object.entries(ARMS).map(([k,v])=>[k,v.note??'all knowledge'])),totals,changed:{},dependsOnAny:{}};
const anyDep=new Map();
for(const arm of Object.keys(ARMS).filter(a=>a!=='full')){const d=decisions(arm);const ch={};
 for(const [k,v] of full){if(d.get(k)!==v){const t=typeOf(k);ch[t]=(ch[t]??0)+1;anyDep.set(k,[...(anyDep.get(k)??[]),arm]);}}
 for(const k of d.keys())if(!full.has(k)){const t=typeOf(k)+'(new)';ch[t]=(ch[t]??0)+1;}
 out.changed[arm]=ch;console.log(arm,JSON.stringify(ch));}
for(const k of full.keys()){const t=typeOf(k);const r=out.dependsOnAny[t]??={decisions:0,dependOnSomeKnowledge:0,codeOrUnablatedDataOnly:0};r.decisions++;if(anyDep.has(k))r.dependOnSomeKnowledge++;else r.codeOrUnablatedDataOnly++;}
writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log('totals',JSON.stringify(totals));console.log('wrote',OUT);
