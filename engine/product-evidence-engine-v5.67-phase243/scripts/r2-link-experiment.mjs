#!/usr/bin/env node
/**
 * R2 (owner S68): the typed link (src/knowledge_link.ts, rules lk.1) against the R1 arms, scored in both directions:
 * wrong links avoided AND correct links recovered (owner: "non basta ridurre i falsi positivi aumentando
 * indiscriminatamente le astensioni").
 *   A    the older plan-guided reader with the inherited lexical link (as R1 arm A)
 *   C1   the newer reader with the inherited lexical link (as R1 arm C1)
 *   C2   the R1 typed seam (kind via dimension words; taught terms break ties), reproduced
 *   C3   lk.1: taught measurements translated into typed descriptors; link and force by the KR programs link/evidence
 *   C3k  ablation: C3 with the descriptors' condition values and axes removed (what conditions decide)
 *   C3m  ablation: C3 with metrics removed (kinds only: what metrics decide)
 *   C8s  lk.6 (R3): the most specific consistent candidate, no acquired knowledge
 *   C8   lk.6 + condition axes PEE acquired from the category's owner package (knowledge_translation.acquireConditionAxes),
 *        used both in reading the page and in describing the taught measurements; C8r reading only; C8d descriptors only
 *   C7   lk.5 (owner review S72): the reader's procedure identity (protocol, named test) is a compatibility basis
 *        (same_protocol), never an observation identity; no run identity is supplied, so identity stays unknown
 *   C6   lk.4 (owner review S71): positive compatibility only (one identified test, or a shared stated method, with every
 *        required condition stated); observation identity only from an identified test; unresolved force (not partial)
 *        through an incompletely translated measurement. The test identity comes from the reader (readerTestIdentity).
 *   C5   lk.3 (owner review S70): observation identity by provenance; aligned points need shown compatibility; direct
 *        force capped at partial through a measurement whose translation is incomplete
 *   C4   lk.2 (owner S69): one observation, several analytical uses (a value describes one measurement and may be a member
 *        of compatible analytical sets; a member alone is a component; set force needs aligned observations)
 * Sets (--set):
 *   p272  the Phase272 untouched set with the R1 blind link reference. SPENT, and its details were inspected for the R2
 *         diagnosis: development evidence only.
 *   s1cd  the Step 1C and Step 1D-B pages of taught categories, with their sealed value references (blind, 2026-10-17/18)
 *         and a blind link reference annotated after this build was frozen (evaluation/r2/freeze-s1cd.json). The link
 *         mechanism was never developed on them; the pages were used before to develop other readers (attribution,
 *         tables), so they are not untouched documents.
 *   af    the air-fryer test pages of Phases 268 (held-out), 270 and 271 with their sealed value references, and a blind
 *         link reference annotated after the lk.4 build froze (evaluation/r2/freeze-af.json). Never used for the link.
 *   node scripts/r2-link-experiment.mjs LABEL --set p272|s1cd|af  -> evaluation/r2/link-LABEL.json (counts),
 *                                                               private detail in $PE/r2/link-LABEL.json
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const args=process.argv.slice(2);const label=args[0];const set=args[args.indexOf('--set')+1];
const OUT=`evaluation/r2/link-${label}.json`;if(!label||existsSync(OUT)||!['p272','s1cd','af'].includes(set))throw Error('usage: LABEL (new) --set p272|s1cd|af');
const sha=b=>createHash('sha256').update(b).digest('hex');const D=new URL('../dist/src/',import.meta.url).href;
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
// a set: documents (tag, category, html, sourceType), gold values (id, doc, value, unit, subject), the link reference and its freeze
let SET;
/** Set af: the air-fryer test pages of Phases 268 (held-out), 270 and 271, with their sealed value references. */
function afSet(PE){const docs=[],gold=[];
 const add=(dir,tag,vals)=>{const W=JSON.parse(readFileSync(join(PE,dir,'wave.json'),'utf8'));const page=(W.pages??[]).find(p=>p.tag===tag)??{tag,url:'',sourceType:'independent_original_test',sha256:''};
  if(!existsSync(join(PE,dir,'raw',tag+'.html'))||!vals.length)return;
  docs.push({tag,category:'air_fryers',html:()=>readFileSync(join(PE,dir,'raw',tag+'.html'),'utf8'),page});gold.push(...vals);};
 for(const dir of ['phase270','phase271']){const G=JSON.parse(readFileSync(join(PE,dir,'untouched-extraction-gold.json'),'utf8'));
  const vs=G.quantitative.map((v,i)=>({id:`${dir}:q${i+1}`,doc:v.doc,value:v.value,unit:v.unit,subject:v.subject,conditions:[...(v.conditions??[]),...(v.food?['food '+v.food]:[])],note:String(v.measurand??'').replace(/_/g,' ')}));
  for(const t of [...new Set(vs.map(v=>v.doc))])add(dir,t,vs.filter(v=>v.doc===t));}
 const H=JSON.parse(readFileSync(join(PE,'phase268','gold-heldout.json'),'utf8'));
 for(const d of H.documents)add('phase268',d.tag,d.measurements.map((m,i)=>({id:`phase268:${d.tag}:${i+1}`,doc:d.tag,value:m.value,unit:m.unit,subject:d.subject,conditions:m.conditions??[],note:String(m.measurand??'')})));
 return {docs,gold};}
if(set==='af'){const fz=JSON.parse(readFileSync('evaluation/r2/freeze-af.json','utf8'));if(!fz.reference)throw Error('af link reference not sealed yet');
 for(const f of fz.reference.files)if(sha(readFileSync(join(PE,'r2/links-af',f.file)))!==f.sha256)throw Error('link reference changed: '+f.file);
 SET={...afSet(PE),links:fz.reference.files.filter(f=>/^gold-/.test(f.file)).flatMap(f=>JSON.parse(readFileSync(join(PE,'r2/links-af',f.file),'utf8')).links)};}
else if(set==='p272'){const DIR=join(PE,'phase272');const fz=JSON.parse(readFileSync('evaluation/r1/link-reference-freeze.json','utf8'));
 for(const f of fz.files)if(sha(readFileSync(join(PE,'r1v/links',f.file)))!==f.sha256)throw Error('link reference changed: '+f.file);
 const G=JSON.parse(readFileSync(join(DIR,'gold-untouched.json'),'utf8'));const W=JSON.parse(readFileSync(join(DIR,'wave.json'),'utf8'));
 SET={docs:G.documents.map(d=>({tag:d.tag,category:d.category,html:()=>readFileSync(join(DIR,'raw',d.tag+'.html'),'utf8'),page:W.pages.find(x=>x.tag===d.tag)})),
  gold:G.quantitative,links:['gold-g1.json','gold-g2.json'].flatMap(f=>JSON.parse(readFileSync(join(PE,'r1v/links',f),'utf8')).links)};}
else{const fz=JSON.parse(readFileSync('evaluation/r2/freeze-s1cd.json','utf8'));if(!fz.reference)throw Error('s1cd link reference not sealed yet');
 for(const f of fz.reference.files)if(sha(readFileSync(join(PE,'r2/links-s1cd',f.file)))!==f.sha256)throw Error('link reference changed: '+f.file);
 SET={docs:[],gold:[],links:fz.reference.files.filter(f=>/^gold-/.test(f.file)).flatMap(f=>JSON.parse(readFileSync(join(PE,'r2/links-s1cd',f.file),'utf8')).links)};
 for(const dir of ['step1c','step1d-b']){const G=JSON.parse(readFileSync(join(PE,dir,'gold.json'),'utf8'));const W=JSON.parse(readFileSync(join(PE,dir,'wave.json'),'utf8'));
  for(const p of W.pages.filter(p=>TAUGHT.includes(p.category)&&existsSync(join(PE,dir,'raw',p.tag+'.html')))){
   SET.docs.push({tag:p.tag,category:p.category,html:()=>readFileSync(join(PE,dir,'raw',p.tag+'.html'),'utf8'),page:p});
   SET.gold.push(...G.values.filter(v=>v.doc===p.tag));}}}
const LG=new Map(SET.links.map(l=>[l.id,l]));
const P=JSON.parse(readFileSync('evaluation/phase272/protocol.json','utf8'));
const {compileExtractionPlan272,canonicalUnit272,DIMENSION_WORDS272,planWords272,linkToMeasure272}=await import(D+'phase272_extraction_plan.js');
const spec=await import(D+'phase245_spec_extraction.js'),tl=await import(D+'phase265_test_measurements.js');const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');
const QK=await import(D+'quantity_knowledge.js');const WD=await import(D+'document_evidence.js');const KL=await import(D+'knowledge_link.js');const qk=QK.loadQuantityKnowledge();
const OVERLAY=process.env.PEE_FORCE_OVERLAY??'/home/user/pee-knowledge/knowledge-overlays/r2-relation-force.v1.json';const overlay=JSON.parse(readFileSync(OVERLAY,'utf8'));
const UE=P.scoring.unitEquivalence;const canon=u=>{const l=String(u??'').toLowerCase().trim();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return canonicalUnit272(l)??l;};
const GENERIC=new Set(['the','a','and','with','review','in','1','smart','oled','tv','tvs','air','fryer','fryers','purifier','purifiers','dishwasher','dishwashers','tumble','dryer','dryers','television','series','dual','basket','integrated','heat','pump']);
const core=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9.\- ]+/g,' ').split(/\s+/).filter(t=>t&&!GENERIC.has(t)));
const sameProduct=(a,b)=>{const x=core(a),y=core(b);if(!x.size||!y.size)return false;let i=0;for(const t of x)if(y.has(t))i++;return i/(x.size+y.size-i)>=0.6||[...x].some(t=>/\d/.test(t)&&y.has(t));};
const near=(v,u,g)=>v!==null&&Math.abs(v-g.value)<=1e-9*Math.max(1,Math.abs(g.value))&&u===canon(g.unit);
const store=new KnowledgeStore246(join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite'));
const cats=[...new Set(SET.docs.map(d=>d.category))];
const plans={},views={};for(const c of cats){plans[c]=compileExtractionPlan272(store,c,CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[],TAUGHT.filter(t=>t!==c));views[c]=KL.teachingView(store,c,overlay);}
// R3 cycle 2: outcome concepts, for the proxy limits translated from the owner packages
const outcomeConcepts={};for(const c of cats)outcomeConcepts[c]=store.categoryItems246(c).filter(i=>i.concept?.kind==='outcome').map(i=>({id:i.concept.id,statement:i.statement,aliases:i.concept.aliases}));store.close();
const desc={};for(const c of cats)desc[c]=views[c].measurements.map(m=>KL.describeMeasurement(qk,m.concept,m.conditions));
const KT=await import(D+'knowledge_translation.js');const {readdirSync,statSync}=await import('node:fs');
const PKGD=join(PE,'r1v/packages');const PKG={air_purifiers:'PEE-CATEGORY-RESEARCH-04-AIR-PURIFIERS-COMPLETE-v1.2.0',televisions:'PEE-CATEGORY-RESEARCH-07-TELEVISIONS-COMPLETE-v1.0.0',air_fryers:'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES/af',
 coffee_machines:'PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES',dishwashers:'PEE-CATEGORY-RESEARCH-06-HOUSEHOLD-DISHWASHERS-COMPLETE-v2.0.0',dehumidifiers:'PEE-DEHUMIDIFIERS-RESTORED-SOURCES-R01-R39'};
const pkgDocs=cat=>{const out=[];const w=x=>{if(!existsSync(x))return;for(const f of readdirSync(x)){const q=join(x,f);if(statSync(q).isDirectory()){if(!/archive/.test(f))w(q);}else if(f.endsWith('.md'))out.push({source:q.slice(PKGD.length+1),md:readFileSync(q,'utf8')});}};
 if(PKG[cat])w(join(PKGD,PKG[cat]));return cat==='coffee_machines'?out.filter(x=>/COFFEE/.test(x.source)):cat==='dehumidifiers'?out.concat(pkgDocs0('PEE-THREE-SCIENTIFIC-RESEARCH-PACKAGES').filter(x=>/DEHUMID/.test(x.source))):out;};
const pkgDocs0=dir=>{const out=[];for(const f of readdirSync(join(PKGD,dir)))if(f.endsWith('.md'))out.push({source:dir+'/'+f,md:readFileSync(join(PKGD,dir,f),'utf8')});return out;};
const acq={},qkAcq={},descAcq={};
for(const c of cats){const qs=KT.distinctionQuestions(desc[c]);acq[c]=KT.acquireConditionAxes(qk,pkgDocs(c),qs);qkAcq[c]=KT.withAcquiredAxes(qk,acq[c],pk=>QK.loadQuantityKnowledge(pk));
 descAcq[c]=views[c].measurements.map(m=>KL.describeMeasurement(qkAcq[c],m.concept,m.conditions));}
// R3 cycle 2 (S74): proxy limits from the translated not_sufficient / not_comparable statements of each category's package;
// an annotation on read values only (no link, force or ranking changes)
const limits={};for(const c of cats)limits[c]=KT.proxyLimits(qk,pkgDocs(c).flatMap(x=>KT.translateDocument(qk,x.md,{source:x.source}).statements),outcomeConcepts[c]);
const ablate=(ds,what)=>ds.map(d=>what==='conditions'?{...d,fixed:[],axes:[]}:{...d,measurands:d.measurands.filter(m=>!m.metric||m.level==='head').map(m=>({...m,metric:null}))});
// C2, reproduced from scripts/r1-integration-experiment.mjs
const KINDS={energy:['energy','energy_per_event','periodic_energy_consumption'],power:['power'],sound:['sound_pressure_level','sound_power_level'],luminance:['luminance'],latency:['duration'],frequency:['frequency'],
 airflow:['volumetric_flow_rate','air_change_rate'],duration:['duration'],volume:['volume','volume_per_event'],mass:['mass'],fraction:['ratio','amount_fraction'],temperature:['temperature'],concentration:['mass_concentration']};
const DIMW=new Set(Object.values(DIMENSION_WORDS272).flat());
function typedLink(plan,q,text){const ks=q.kind.id?[q.kind.id]:q.kind.candidates;if(!ks.length)return {status:'no_kind',ms:[]};
 const cands=plan.measurements.filter(m=>m.outcomes.length&&m.dimensions.some(d=>(KINDS[d]??[]).some(k=>ks.includes(k))));if(!cands.length)return {status:'no_candidate',ms:[]};
 if(cands.length===1)return {status:'linked',ms:[cands[0].id]};
 const ws=new Set(planWords272(text));const sc=cands.map(m=>({m,s:m.terms.filter(t=>!DIMW.has(t)&&ws.has(t)).length})).sort((a,b)=>b.s-a.s);
 if(sc[0].s>0&&sc[0].s>(sc[1]?.s??0))return {status:'linked',ms:[sc[0].m.id]};return {status:'ambiguous',ms:cands.map(m=>m.id)};}
const LK1=JSON.parse(readFileSync('resources/quantity-knowledge/link-rules.v1.json','utf8'));
const LK2=JSON.parse(readFileSync('resources/quantity-knowledge/link-rules.v2.json','utf8'));
const LK3=JSON.parse(readFileSync('resources/quantity-knowledge/link-rules.v3.json','utf8'));
const LK4=JSON.parse(readFileSync('resources/quantity-knowledge/link-rules.v4.json','utf8'));
const LK5=JSON.parse(readFileSync('resources/quantity-knowledge/link-rules.v5.json','utf8'));
const ARMS=['A','C1','C2','C3','C3k','C3m','C4','C5','C6','C7','C8s','C8','C8r','C8d'];const C=Object.fromEntries(ARMS.map(a=>[a,{}]));C.L={};const inc=(a,k,n=1)=>C[a][k]=(C[a][k]??0)+n;const detail=[];
/** one outcome per value and arm, in both directions */
function score(ref,status,ms){
 const linkedSet=['linked','linked_condition_not_shown','linked_equivalent'].includes(status)?ms:[];
 if(ref==='ambiguous')return linkedSet.length?'link_on_ambiguous_reference':'abstain_on_ambiguous_reference';
 if(ref==='none')return linkedSet.length?'wrong_link_where_none':status==='no_taught_measurement'?'correct_none_reported_outside_teaching':'correct_no_link';
 if(!linkedSet.length)return status==='ambiguous'?(ms.includes(ref)?'missed_ambiguous_ref_among':'missed_ambiguous_ref_not_among'):'missed_no_candidate';
 if(linkedSet.includes(ref))return linkedSet.length===1?'correct':'correct_in_equivalent_set';
 return 'wrong_measurement';}
/** C4: the primary link and the memberships are scored apart (a membership is a legitimate use, not the value's identity) */
function score4(ref,status,ms,mem){const linkedSet=['linked','linked_condition_not_shown','linked_equivalent'].includes(status)?ms:[];
 if(ref==='ambiguous')return linkedSet.length||mem.length?'link_on_ambiguous_reference':'abstain_on_ambiguous_reference';
 if(ref==='none')return linkedSet.length?'wrong_link_where_none':mem.length?'wrong_membership_where_none':status==='no_taught_measurement'?'correct_none_reported_outside_teaching':'correct_no_link';
 if(linkedSet.includes(ref))return linkedSet.length===1?'correct':'correct_in_equivalent_set';
 if(mem.includes(ref))return 'correct_via_membership';
 if(linkedSet.length)return 'wrong_measurement';if(mem.length)return 'wrong_membership';
 return status==='ambiguous'?(ms.includes(ref)?'missed_ambiguous_ref_among':'missed_ambiguous_ref_not_among'):'missed_no_candidate';}
const GOOD=new Set(['correct','correct_in_equivalent_set','correct_via_membership']);const BAD=new Set(['wrong_measurement','wrong_link_where_none','link_on_ambiguous_reference','wrong_membership','wrong_membership_where_none']);
for(const d of SET.docs){const p=d.page;const html=d.html();const url=p.finalUrl??p.url;const gq=SET.gold.filter(g=>g.doc===d.tag);
 const readNew=qkx=>{const doc=WD.readDocumentEvidence(html,qkx,{sourceType:'independent_review'});const seg=new Map(doc.segments.map(s=>[s.id,s]));
 return [...doc.quantities.filter(q=>!q.identifierPart&&q.quantity).map(q=>{const s=seg.get(q.segment);const u=WD.sentences(s.text).find(u=>q.start>=u.start&&q.end<=u.start+u.text.length);
   return {value:q.quantity.value,unit:canon(q.surface.replace(/^[^A-Za-z°%µ]*/,'')),q:q.quantity,product:q.product,text:[s.label??'',u?.text??s.text,s.headings.at(-1)??''].join(' '),rawUnit:q.surface,ev:q.evidenceClass??null};}),
  ...doc.tables.tables.flatMap(tb=>tb.observations.filter(o=>o.quantity).map(o=>({value:o.quantity.value,unit:canon(o.unitSurface??o.surface.replace(/^[^A-Za-z°%µ]*/,'')),q:o.quantity,product:o.product,text:o.property.join(' '),rawUnit:o.surface,ev:o.evidence?.class??null})))];};
 const lb=readNew(qk);const lb8=qkAcq[d.category]===qk?lb:readNew(qkAcq[d.category]);
 // arm A: the older reader with its plan (as R1)
 const {blocks}=textBlocks225(html,{maxBlocks:1500});const x=tl.testDocumentSubject268(spec.extractSpecifications245(html,url),p.sourceType);
 const t=tl.testLeadsFromHtml265(html,url,p.sha256,x,{category:d.category,plan:plans[d.category]});
 const la=[...t.probe.candidates.map(c=>({value:c.value,unit:canon(c.unit),product:c.subject?.name??null,text:c.blockIndex>=0?blocks[c.blockIndex]??'':'',rawUnit:c.unit})),...(t.comparative270??[]).map(c=>({value:c.value,unit:canon(c.unit),product:c.subject?.name??null,text:'',rawUnit:c.unit}))];
 const usedA=new Set();
 for(const g of gq){let i=la.findIndex((r,k)=>!usedA.has(k)&&near(r.value,r.unit,g)&&sameProduct(g.subject,r.product));if(i<0)i=la.findIndex((r,k)=>!usedA.has(k)&&near(r.value,r.unit,g));
  const ref=LG.get(g.id)?.measurement??'missing';inc('A','gold_values');
  if(i<0){inc('A','not_found_by_reader');continue;}usedA.add(i);const r=la[i];inc('A','found');const prod=!r.product?'missing':sameProduct(g.subject,r.product)?'correct':'wrong';inc('A','product_'+prod);
  const m=linkToMeasure272(plans[d.category],r.text,r.rawUnit.replace(/^[^A-Za-z°%µ]*/,''))?.measureId??null;const s=score(ref,m?'linked':'not_linked',m?[m]:[]);inc('A','link_'+s);
  if(GOOD.has(s)&&prod==='correct')inc('A','decision_usable_correct');}
 const used=new Set();const matched=[];
 for(const g of gq){let i=lb.findIndex((r,k)=>!used.has(k)&&near(r.value,r.unit,g)&&sameProduct(g.subject,r.product));if(i<0)i=lb.findIndex((r,k)=>!used.has(k)&&near(r.value,r.unit,g));
  if(i<0){for(const a of ARMS.filter(a=>a!=='A')){inc(a,'gold_values');inc(a,'not_found_by_reader');}continue;}used.add(i);matched.push({g,r:lb[i],id:'v'+matched.length});}
 const values=matched.map(m=>({id:m.id,quantity:m.r.q,product:m.r.product,source:d.tag}));
 const used8=new Set();const values8=matched.map(m=>{let i=lb8.findIndex((r,k)=>!used8.has(k)&&near(r.value,r.unit,m.g)&&r.product===m.r.product);if(i<0)i=lb8.findIndex((r,k)=>!used8.has(k)&&near(r.value,r.unit,m.g));
  if(i>=0)used8.add(i);return {id:m.id,quantity:i>=0?lb8[i].q:m.r.q,product:m.r.product,source:d.tag};});
 const P8=xs=>xs.map(x=>({...x,test:null,protocol:KL.readerProcedureIdentity(x.quantity)}));
 const runs={C3:KL.linkValues(qk,views[d.category],values,{descriptors:desc[d.category]}),C3k:KL.linkValues(qk,views[d.category],values,{descriptors:ablate(desc[d.category],'conditions')}),
  C3m:KL.linkValues(qk,views[d.category],values,{descriptors:ablate(desc[d.category],'metrics')})};
 for(const a of ['C3','C3k','C3m'])runs[a]=KL.linkValues(qk,views[d.category],values,{rules:LK1,descriptors:a==='C3'?desc[d.category]:ablate(desc[d.category],a==='C3k'?'conditions':'metrics')});
 runs.C4=KL.linkValues(qk,views[d.category],values,{rules:LK2,descriptors:desc[d.category]});
 runs.C5=KL.linkValues(qk,views[d.category],values,{rules:LK3,descriptors:desc[d.category]});
 const values6=values.map(x=>({...x,test:KL.readerTestIdentity(x.quantity)}));
 runs.C6=KL.linkValues(qk,views[d.category],values6,{rules:LK4,descriptors:desc[d.category]});
 const values7=values.map(x=>({...x,test:null,protocol:KL.readerProcedureIdentity(x.quantity)}));
 runs.C7=KL.linkValues(qk,views[d.category],values7,{rules:LK5,descriptors:desc[d.category]});
 runs.C8s=KL.linkValues(qk,views[d.category],P8(values),{descriptors:desc[d.category]});
 runs.C8=KL.linkValues(qkAcq[d.category],views[d.category],P8(values8),{descriptors:descAcq[d.category]});
 runs.C8r=KL.linkValues(qkAcq[d.category],views[d.category],P8(values8),{descriptors:desc[d.category]});
 runs.C8d=KL.linkValues(qkAcq[d.category],views[d.category],P8(values),{descriptors:descAcq[d.category]});
 for(const x of runs.C7.relationships)inc('C7',x.kind+(x.basis?':'+x.basis:''));for(const _ of runs.C7.repeatedReports)inc('C7','repeated_reports');
 for(const x of values7)inc('C7',x.protocol?'procedure_identified':'procedure_unknown');for(const o of runs.C7.outcomes)inc('C7','outcome_'+o.assessment);for(const r of runs.C7.results)for(const e of r.evidence)inc('C7','force_'+e.force);
 for(const x of runs.C6.relationships)inc('C6',x.kind+(x.basis?':'+x.basis:''));for(const _ of runs.C6.repeatedReports)inc('C6','repeated_reports');
 for(const x of values6)inc('C6',x.test?'test_identity_known':'test_identity_unknown');
 for(const o of runs.C6.outcomes)inc('C6','outcome_'+o.assessment);for(const o of runs.C5.outcomes)inc('C5','outcome_'+o.assessment);
 for(const r of runs.C6.results)for(const e of r.evidence)inc('C6','force_'+e.force);for(const r of runs.C5.results)for(const e of r.evidence)inc('C5','force_'+e.force);
 for(const x of runs.C5.relationships)inc('C5',x.kind+(x.basis?':'+x.basis:''));for(const _ of runs.C5.repeatedReports)inc('C5','repeated_reports');
 for(const x of runs.C4.relationships)inc('C4',x.kind);
 // S69: a set's force (direct, partial, unverified) carried by a value without an aligned point is an unjustified conclusion
 const sets=new Set(desc[d.category].filter(x=>KL.measurandGroups(x).length>1).map(x=>x.id));
 const alignedAt=new Set(runs.C4.relationships.filter(x=>x.kind==='aligned_point').map(x=>x.product+'|'+x.measurement+'|'+x.setting));
 const alignedAt5=new Set(runs.C5.relationships.filter(x=>x.kind==='aligned_point').map(x=>x.product+'|'+x.measurement+'|'+x.setting));
 const alignedAt6=new Set(runs.C6.relationships.filter(x=>x.kind==='aligned_point').map(x=>x.product+'|'+x.measurement+'|'+x.setting));
 for(const a of ['C3','C4','C5','C6'])for(const r of runs[a].results){const v=values.find(x=>x.id===r.value);
  for(const e of r.evidence.filter(e=>sets.has(e.measurement)&&['direct','partial','unverified'].includes(e.force))){
   const ok=v.quantity.conditions.some(c=>(a==='C6'?alignedAt6:a==='C5'?alignedAt5:alignedAt).has(v.product+'|'+e.measurement+'|'+c.value));inc(a,ok?'set_force_on_aligned_point':'set_force_without_aligned_point_UNJUSTIFIED');}}for(const _ of runs.C4.repeatedReports)inc('C4','repeated_reports');
 for(const m of matched){const ref=LG.get(m.g.id)?.measurement??'missing';const prod=!m.r.product?'missing':sameProduct(m.g.subject,m.r.product)?'correct':'wrong';const row={id:m.g.id,cat:d.category,ref,product:prod,subject:m.r.product,conds:m.r.q.conditions.map(c=>c.axis+'='+c.value)};
  for(const a of ARMS.filter(a=>a!=='A')){inc(a,'gold_values');inc(a,'found');inc(a,'product_'+prod);let status,ms,ev=[];
   if(a==='C1'){const l=linkToMeasure272(plans[d.category],m.r.text,m.r.rawUnit.replace(/^[^A-Za-z°%µ]*/,''))?.measureId??null;status=l?'linked':'not_linked';ms=l?[l]:[];}
   else if(a==='C2'){const t=typedLink(plans[d.category],m.r.q,m.r.text);status=t.status==='linked'?'linked':t.status;ms=t.ms;}
   else{const r=runs[a].results.find(x=>x.value===m.id);status=r.status;ms=r.measurements;ev=r.evidence;var mem=r.memberships??[];if(['C3','C4','C5','C6','C7','C8s','C8','C8r','C8d'].includes(a))row[a]={status,ms,mem,deciding:r.decidingAxes,evidence:ev,derivation:r.derivation.slice(0,12)};}
   const s=['C4','C5','C6','C7','C8s','C8','C8r','C8d'].includes(a)?score4(ref,status,ms,mem):score(ref,status,ms);inc(a,'link_'+s);row[a+'_score']=s;
   if(GOOD.has(s)&&prod==='correct'){inc(a,'decision_usable_correct');
    if(a.startsWith('C3')||['C4','C5','C6','C7','C8s','C8','C8r','C8d'].includes(a)){const f=ev.filter(e=>ms.includes(e.measurement)||(a.startsWith('C3')?false:(mem??[]).includes(e.measurement))).map(e=>e.force);inc(a,'decision_usable_force_'+(f.includes('direct')?'direct':f.includes('partial')?'partial':f.includes('unverified')?'unverified':f.includes('unresolved')?'unresolved':f.includes('conditions_not_shown')?'conditions_not_shown':f.includes('indirect')?'indirect':f.includes('component_only')?'component_only':'no_outcome'));}}}
  { const q=m.r.q;const sk={role:0};const ap=KT.applicableLimits(limits[d.category],{metric:q.metric.id,kind:q.kind.id??q.kind.candidates[0]??null,conditions:q.conditions,label:m.r.text,evidenceClass:m.r.ev??null},sk);if(sk.role)inc('L','skipped_role_unknown',sk.role);inc('L','value_role_'+(m.r.ev??'none'));
   row.limits=ap.map(x=>({id:x.limit.id,type:x.limit.type,appliesTo:x.limit.appliesTo,basis:x.basis,object:x.limit.object,outcome:x.limit.outcome,scope:x.limit.scope,quote:x.limit.quote,source:x.limit.source,line:x.limit.line}));row.text=m.r.text;row.ev=m.r.ev??null;
   inc('L','values');if(ap.length){inc('L','values_with_limit');inc('L','limits_applied',ap.length);for(const x of ap)inc('L','basis_'+x.basis);}}
  detail.push(row);}}
// both directions, per value: C3 against C2
const cls=s=>GOOD.has(s)?'good':BAD.has(s)?'bad':'abstain';
const T={};for(const r of detail){const k=cls(r.C2_score)+'->'+cls(r.C3_score);T[k]=(T[k]??0)+1;}
const T4={};for(const r of detail){const k=cls(r.C3_score)+'->'+cls(r.C4_score);T4[k]=(T4[k]??0)+1;}
const T5={};for(const r of detail){const k=cls(r.C4_score)+'->'+cls(r.C5_score);T5[k]=(T5[k]??0)+1;}
const T8={};for(const r of detail){const k=cls(r.C7_score)+'->'+cls(r.C8_score);T8[k]=(T8[k]??0)+1;}
const T6={};for(const r of detail){const k=cls(r.C5_score)+'->'+cls(r.C6_score);T6[k]=(T6[k]??0)+1;}
const descriptorCensus=Object.fromEntries(cats.map(c=>[c,{measurements:desc[c].length,withHeadMeasurand:desc[c].filter(x=>x.measurands.some(m=>m.level==='head')).length,
 withFixedConditions:desc[c].filter(x=>x.fixed.length).length,withAxes:desc[c].filter(x=>x.axes.length).length,withUntypedWords:desc[c].filter(x=>x.untyped.length).length}]));
const pub={schema:'pee.r2.link-experiment.v1',label,generatedAt:new Date().toISOString(),set,
 tier:set==='af'?'Air-fryer test pages of Phases 268/270/271: link reference blind and sealed after the lk.4 build froze; never used to develop the link (the pages served Phase268-271 extraction development).':set==='p272'?'Phase272 untouched set: SPENT (R1 tuning and R2 diagnosis inspected its link reference). Development evidence; never held-out.':'Step 1C + 1D-B pages of taught categories: link reference blind and sealed after the build froze; the link mechanism was never developed on them; the pages served earlier reader development (not untouched documents).',
 rules:KL.loadLinkRules().version,proxyLimits:{perCategory:Object.fromEntries(cats.map(c=>[c,limits[c].length]))},forceOverlay:overlay.id,descriptorCensus,arms:C,c2ToC3:T,c3ToC4:T4,c4ToC5:T5,c5ToC6:T6,c7ToC8:T8,acquired:Object.fromEntries(cats.map(c=>[c,acq[c].map(p=>({axis:p.axis,values:Object.keys(p.values),answers:p.answers.length,evidence:p.evidence.length,structure:[...new Set(p.evidence.map(e=>e.structure))]}))]))};
writeFileSync(OUT,JSON.stringify(pub,null,1)+'\n');mkdirSync(join(PE,'r2'),{recursive:true});
writeFileSync(join(PE,'r2',`link-${label}.json`),JSON.stringify({...pub,descriptors:desc,detail},null,1)+'\n');
for(const a of ARMS)console.log(a,JSON.stringify(C[a]));console.log('C2->C3',JSON.stringify(T));console.log('C3->C4',JSON.stringify(T4));console.log('C4->C5',JSON.stringify(T5));console.log('C7->C8',JSON.stringify(T8));console.log('C5->C6',JSON.stringify(T6));
