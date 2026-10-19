#!/usr/bin/env node
/**
 * R1 (S66): reversible integration experiment. The same 16 Phase272 untouched pages (spent: diagnostic only) and the same
 * criteria for every arm; the blind link reference (evaluation/r1/link-reference-freeze.json) says which taught measurement
 * each of the 163 gold values reports.
 *   A    older plan-guided reader (current build) with its compiled plan; inherited lexical link (linkToMeasure272)
 *   B    newer reader (WD with QK), no teaching
 *   C1   B + the same plan, inherited lexical link applied to the newer reader's values (migrating the old rule as is)
 *   C2   B + the plan through the seam: typed link (the value's quantity kind selects the measurements; distinctive taught
 *        terms only choose among them; a tie is left unresolved)
 *   C2v  C2 with only the relations the source verification supports (--verdicts DIR)
 *   K    C2 without taught terms (kind only): what the teaching's words add
 *   node scripts/r1-integration-experiment.mjs LABEL [--verdicts DIR]   -> evaluation/r1/integration-LABEL.json (counts)
 */
import {readFileSync,writeFileSync,existsSync,readdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const args=process.argv.slice(2);const label=args[0];const OUT=`evaluation/r1/integration-${label}.json`;if(!label||existsSync(OUT))throw Error('usage: LABEL (new)');
const vIdx=args.indexOf('--verdicts');const VDIR=vIdx>0?args[vIdx+1]:null;
const sha=b=>createHash('sha256').update(b).digest('hex');const D=new URL('../dist/src/',import.meta.url).href;
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');const DIR=join(PE,'phase272');
const fz=JSON.parse(readFileSync('evaluation/r1/link-reference-freeze.json','utf8'));for(const f of fz.files)if(sha(readFileSync(join(PE,'r1v/links',f.file)))!==f.sha256)throw Error('link reference changed: '+f.file);
const LG=new Map([...JSON.parse(readFileSync(join(PE,'r1v/links/gold-g1.json'),'utf8')).links,...JSON.parse(readFileSync(join(PE,'r1v/links/gold-g2.json'),'utf8')).links].map(l=>[l.id,l]));
const G=JSON.parse(readFileSync(join(DIR,'gold-untouched.json'),'utf8'));const W=JSON.parse(readFileSync(join(DIR,'wave.json'),'utf8'));
const P=JSON.parse(readFileSync('evaluation/phase272/protocol.json','utf8'));
const spec=await import(D+'phase245_spec_extraction.js'),tl=await import(D+'phase265_test_measurements.js');
const {compileExtractionPlan272,linkToMeasure272,canonicalUnit272,DIMENSION_WORDS272,planWords272}=await import(D+'phase272_extraction_plan.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const QK=await import(D+'quantity_knowledge.js');const WD=await import(D+'document_evidence.js');const qk=QK.loadQuantityKnowledge();
const UE=P.scoring.unitEquivalence;const canon=u=>{const l=String(u??'').toLowerCase().trim();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return canonicalUnit272(l)??l;};
const GENERIC=new Set(['the','a','and','with','review','in','1','smart','oled','tv','tvs','air','fryer','fryers','purifier','purifiers','dishwasher','dishwashers','tumble','dryer','dryers','television','series','dual','basket','integrated','heat','pump']);
const core=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9.\- ]+/g,' ').split(/\s+/).filter(t=>t&&!GENERIC.has(t)));
const sameProduct=(a,b)=>{const x=core(a),y=core(b);if(!x.size||!y.size)return false;let i=0;for(const t of x)if(y.has(t))i++;return i/(x.size+y.size-i)>=0.6||[...x].some(t=>/\d/.test(t)&&y.has(t));};
const near=(v,u,g)=>v!==null&&Math.abs(v-g.value)<=1e-9*Math.max(1,Math.abs(g.value))&&u===canon(g.unit);
// plans from the store, and the seam's view of them
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const plans={};for(const c of new Set(G.documents.map(d=>d.category)))plans[c]=compileExtractionPlan272(store,c,CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[],TAUGHT.filter(t=>t!==c));store.close();
// validated view: a measured_by link survives only when the source verification supports it (fully or partly)
let verdicts=null;if(VDIR){verdicts={};for(const f of readdirSync(VDIR).filter(f=>/^verdict-.*\.json$/.test(f))){const v=JSON.parse(readFileSync(join(VDIR,f),'utf8'));const rels=JSON.parse(readFileSync(join(VDIR,v.category+'.json'),'utf8')).relations;
 for(const r of rels){const x=v.verdicts.find(y=>y.id===r.id);verdicts[[v.category,r.kind,r.from.concept,r.to.concept].join('|')]=x?.support??'missing';}}}
const ok=s=>s==='supported'||s==='partially_supported';
const validated=c=>{const p=plans[c];if(!verdicts)return null;return {...p,measurements:p.measurements.map(m=>({...m,outcomes:m.outcomes.filter(o=>ok(verdicts[[c,'measured_by',m.id,o].join('|')]))}))};};
const KINDS={energy:['energy','energy_per_event','periodic_energy_consumption'],power:['power'],sound:['sound_pressure_level','sound_power_level'],luminance:['luminance'],latency:['duration'],frequency:['frequency'],
 airflow:['volumetric_flow_rate','air_change_rate'],duration:['duration'],volume:['volume','volume_per_event'],mass:['mass'],fraction:['ratio','amount_fraction'],temperature:['temperature'],concentration:['mass_concentration']};
const DIMW=new Set(Object.values(DIMENSION_WORDS272).flat());
/** the seam's typed link: kind first, taught distinctive terms (not dimension words) only to choose; ties unresolved */
function typedLink(plan,q,text,useTerms=true){const ks=q.kind.id?[q.kind.id]:q.kind.candidates;if(!ks.length)return {status:'no_kind'};
 const cands=plan.measurements.filter(m=>m.outcomes.length&&m.dimensions.some(d=>(KINDS[d]??[]).some(k=>ks.includes(k))));if(!cands.length)return {status:'no_candidate'};
 if(cands.length===1)return {status:'linked',measureId:cands[0].id};if(!useTerms)return {status:'ambiguous'};
 const ws=new Set(planWords272(text));const sc=cands.map(m=>({m,s:m.terms.filter(t=>!DIMW.has(t)&&ws.has(t)).length})).sort((a,b)=>b.s-a.s);
 if(sc[0].s>0&&sc[0].s>(sc[1]?.s??0))return {status:'linked',measureId:sc[0].m.id};return {status:'ambiguous'};}
const ARMS=['A','B','C1','C2',...(verdicts?['C2v']:[]),'K'];const C=Object.fromEntries(ARMS.map(a=>[a,{}]));const inc=(a,k)=>C[a][k]=(C[a][k]??0)+1;
const linkScore=(a,g,m)=>{const ref=LG.get(g.id)?.measurement??'missing';const got=m??null;
 if(ref==='ambiguous'){inc(a,got?'link_on_ambiguous_reference':'no_link_on_ambiguous_reference');return;}
 if(ref==='none'){inc(a,got?'link_wrong_reference_none':'link_correct_none');return;}
 if(!got){inc(a,'link_missing');return;}inc(a,got===ref?'link_correct':'link_wrong_measurement');};
for(const d of G.documents){const p=W.pages.find(x=>x.tag===d.tag);const html=readFileSync(join(DIR,'raw',d.tag+'.html'),'utf8'),url=p.finalUrl??p.url;const plan=plans[d.category];const gq=G.quantitative.filter(g=>g.doc===d.tag);
 // A: the older reader with its plan (as Phase272 arm B)
 const {blocks}=textBlocks225(html,{maxBlocks:1500});const x=tl.testDocumentSubject268(spec.extractSpecifications245(html,url),p.sourceType);
 const t=tl.testLeadsFromHtml265(html,url,p.sha256,x,{category:d.category,plan});
 const la=[...t.probe.candidates.map(c=>({value:c.value,unit:canon(c.unit),product:c.subject?.name??null,text:c.blockIndex>=0?blocks[c.blockIndex]??'':'',rawUnit:c.unit})),...(t.comparative270??[]).map(c=>({value:c.value,unit:canon(c.unit),product:c.subject?.name??null,text:'',rawUnit:c.unit}))];
 // B/C: the newer reader
 const doc=WD.readDocumentEvidence(html,qk,{sourceType:'independent_review'});const seg=new Map(doc.segments.map(s=>[s.id,s]));
 const lb=[...doc.quantities.filter(q=>!q.identifierPart&&q.quantity).map(q=>{const s=seg.get(q.segment);const u=WD.sentences(s.text).find(u=>q.start>=u.start&&q.end<=u.start+u.text.length);
   return {value:q.quantity.value,unit:canon(q.surface.replace(/^[^A-Za-z°%µ]*/,'')),q:q.quantity,product:q.product,text:[s.label??'',u?.text??s.text,s.headings.at(-1)??''].join(' '),rawUnit:q.surface};}),
  ...doc.tables.tables.flatMap(tb=>tb.observations.filter(o=>o.quantity).map(o=>({value:o.quantity.value,unit:canon(o.unitSurface??o.surface.replace(/^[^A-Za-z°%µ]*/,'')),q:o.quantity,product:o.product,text:o.property.join(' '),rawUnit:o.surface})))];
 const reads={A:la,B:lb,C1:lb,C2:lb,C2v:lb,K:lb};
 for(const a of ARMS){const rs=reads[a];inc(a,'reader_values');const used=new Set();for(const _ of rs)inc(a,'values_read');
  for(const g of gq){inc(a,'gold_values');let i=rs.findIndex((r,k)=>!used.has(k)&&near(r.value,r.unit,g)&&sameProduct(g.subject,r.product));if(i<0)i=rs.findIndex((r,k)=>!used.has(k)&&near(r.value,r.unit,g));
   if(i<0){inc(a,'not_found');if(a!=='B')linkScore(a,g,null);continue;}used.add(i);const r=rs[i];inc(a,'found');
   const prod=!r.product?'missing':sameProduct(g.subject,r.product)?'correct':'wrong';inc(a,'product_'+prod);
   if(a==='B')continue;
   let m=null;if(a==='A'||a==='C1')m=linkToMeasure272(plan,r.text,r.rawUnit.replace(/^[^A-Za-z°%µ]*/,''))?.measureId??null;
   else{const pl=a==='C2v'?validated(d.category):plan;const res=typedLink(pl,r.q,r.text,a!=='K');inc(a,'typed_'+res.status);m=res.measureId??null;}
   linkScore(a,g,m);if(prod==='correct'&&m&&m===LG.get(g.id)?.measurement)inc(a,'decision_usable_correct');}}}
for(const a of ARMS){C[a].values_read=C[a].values_read;}
writeFileSync(OUT,JSON.stringify({schema:'pee.r1.integration.v1',label,generatedAt:new Date().toISOString(),tier:'Phase272 untouched set (spent: diagnostic, not independent); link reference blind and sealed',verdicts:VDIR?'source verification applied':'none',arms:C},null,1)+'\n');
for(const a of ARMS)console.log(a,JSON.stringify(C[a]));
