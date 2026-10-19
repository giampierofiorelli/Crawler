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
 *   C4   lk.2 (owner S69): one observation, several analytical uses (a value describes one measurement and may be a member
 *        of compatible analytical sets; a member alone is a component; set force needs aligned observations)
 * Sets (--set):
 *   p272  the Phase272 untouched set with the R1 blind link reference. SPENT, and its details were inspected for the R2
 *         diagnosis: development evidence only.
 *   s1cd  the Step 1C and Step 1D-B pages of taught categories, with their sealed value references (blind, 2026-10-17/18)
 *         and a blind link reference annotated after this build was frozen (evaluation/r2/freeze-s1cd.json). The link
 *         mechanism was never developed on them; the pages were used before to develop other readers (attribution,
 *         tables), so they are not untouched documents.
 *   node scripts/r2-link-experiment.mjs LABEL --set p272|s1cd  -> evaluation/r2/link-LABEL.json (counts),
 *                                                               private detail in $PE/r2/link-LABEL.json
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const args=process.argv.slice(2);const label=args[0];const set=args[args.indexOf('--set')+1];
const OUT=`evaluation/r2/link-${label}.json`;if(!label||existsSync(OUT)||!['p272','s1cd'].includes(set))throw Error('usage: LABEL (new) --set p272|s1cd');
const sha=b=>createHash('sha256').update(b).digest('hex');const D=new URL('../dist/src/',import.meta.url).href;
const PE=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
// a set: documents (tag, category, html, sourceType), gold values (id, doc, value, unit, subject), the link reference and its freeze
let SET;
if(set==='p272'){const DIR=join(PE,'phase272');const fz=JSON.parse(readFileSync('evaluation/r1/link-reference-freeze.json','utf8'));
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
const plans={},views={};for(const c of cats){plans[c]=compileExtractionPlan272(store,c,CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[],TAUGHT.filter(t=>t!==c));views[c]=KL.teachingView(store,c,overlay);}store.close();
const desc={};for(const c of cats)desc[c]=views[c].measurements.map(m=>KL.describeMeasurement(qk,m.concept,m.conditions));
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
const ARMS=['A','C1','C2','C3','C3k','C3m','C4'];const C=Object.fromEntries(ARMS.map(a=>[a,{}]));const inc=(a,k)=>C[a][k]=(C[a][k]??0)+1;const detail=[];
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
 const doc=WD.readDocumentEvidence(html,qk,{sourceType:'independent_review'});const seg=new Map(doc.segments.map(s=>[s.id,s]));
 const lb=[...doc.quantities.filter(q=>!q.identifierPart&&q.quantity).map(q=>{const s=seg.get(q.segment);const u=WD.sentences(s.text).find(u=>q.start>=u.start&&q.end<=u.start+u.text.length);
   return {value:q.quantity.value,unit:canon(q.surface.replace(/^[^A-Za-z°%µ]*/,'')),q:q.quantity,product:q.product,text:[s.label??'',u?.text??s.text,s.headings.at(-1)??''].join(' '),rawUnit:q.surface};}),
  ...doc.tables.tables.flatMap(tb=>tb.observations.filter(o=>o.quantity).map(o=>({value:o.quantity.value,unit:canon(o.unitSurface??o.surface.replace(/^[^A-Za-z°%µ]*/,'')),q:o.quantity,product:o.product,text:o.property.join(' '),rawUnit:o.surface})))];
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
 const values=matched.map(m=>({id:m.id,quantity:m.r.q,product:m.r.product}));
 const runs={C3:KL.linkValues(qk,views[d.category],values,{descriptors:desc[d.category]}),C3k:KL.linkValues(qk,views[d.category],values,{descriptors:ablate(desc[d.category],'conditions')}),
  C3m:KL.linkValues(qk,views[d.category],values,{descriptors:ablate(desc[d.category],'metrics')})};
 for(const a of ['C3','C3k','C3m'])runs[a]=KL.linkValues(qk,views[d.category],values,{rules:LK1,descriptors:a==='C3'?desc[d.category]:ablate(desc[d.category],a==='C3k'?'conditions':'metrics')});
 runs.C4=KL.linkValues(qk,views[d.category],values,{descriptors:desc[d.category]});
 for(const x of runs.C4.relationships)inc('C4',x.kind);
 // S69: a set's force (direct, partial, unverified) carried by a value without an aligned point is an unjustified conclusion
 const sets=new Set(desc[d.category].filter(x=>KL.measurandGroups(x).length>1).map(x=>x.id));
 const alignedAt=new Set(runs.C4.relationships.filter(x=>x.kind==='aligned_point').map(x=>x.product+'|'+x.measurement+'|'+x.setting));
 for(const a of ['C3','C4'])for(const r of runs[a].results){const v=values.find(x=>x.id===r.value);
  for(const e of r.evidence.filter(e=>sets.has(e.measurement)&&['direct','partial','unverified'].includes(e.force))){
   const ok=v.quantity.conditions.some(c=>alignedAt.has(v.product+'|'+e.measurement+'|'+c.value));inc(a,ok?'set_force_on_aligned_point':'set_force_without_aligned_point_UNJUSTIFIED');}}for(const _ of runs.C4.repeatedReports)inc('C4','repeated_reports');
 for(const m of matched){const ref=LG.get(m.g.id)?.measurement??'missing';const prod=!m.r.product?'missing':sameProduct(m.g.subject,m.r.product)?'correct':'wrong';const row={id:m.g.id,cat:d.category,ref,product:prod};
  for(const a of ARMS.filter(a=>a!=='A')){inc(a,'gold_values');inc(a,'found');inc(a,'product_'+prod);let status,ms,ev=[];
   if(a==='C1'){const l=linkToMeasure272(plans[d.category],m.r.text,m.r.rawUnit.replace(/^[^A-Za-z°%µ]*/,''))?.measureId??null;status=l?'linked':'not_linked';ms=l?[l]:[];}
   else if(a==='C2'){const t=typedLink(plans[d.category],m.r.q,m.r.text);status=t.status==='linked'?'linked':t.status;ms=t.ms;}
   else{const r=runs[a].results.find(x=>x.value===m.id);status=r.status;ms=r.measurements;ev=r.evidence;var mem=r.memberships??[];if(a==='C3'||a==='C4')row[a]={status,ms,mem,deciding:r.decidingAxes,evidence:ev,derivation:r.derivation.slice(0,12)};}
   const s=a==='C4'?score4(ref,status,ms,mem):score(ref,status,ms);inc(a,'link_'+s);row[a+'_score']=s;
   if(GOOD.has(s)&&prod==='correct'){inc(a,'decision_usable_correct');
    if(a.startsWith('C3')){const f=ev.filter(e=>ms.includes(e.measurement)).map(e=>e.force);inc(a,'decision_usable_force_'+(f.includes('direct')?'direct':f.includes('partial')?'partial':f.includes('unverified')?'unverified':f.includes('conditions_not_shown')?'conditions_not_shown':f.includes('indirect')?'indirect':'no_outcome'));}}}
  detail.push(row);}}
// both directions, per value: C3 against C2
const cls=s=>GOOD.has(s)?'good':BAD.has(s)?'bad':'abstain';
const T={};for(const r of detail){const k=cls(r.C2_score)+'->'+cls(r.C3_score);T[k]=(T[k]??0)+1;}
const T4={};for(const r of detail){const k=cls(r.C3_score)+'->'+cls(r.C4_score);T4[k]=(T4[k]??0)+1;}
const descriptorCensus=Object.fromEntries(cats.map(c=>[c,{measurements:desc[c].length,withHeadMeasurand:desc[c].filter(x=>x.measurands.some(m=>m.level==='head')).length,
 withFixedConditions:desc[c].filter(x=>x.fixed.length).length,withAxes:desc[c].filter(x=>x.axes.length).length,withUntypedWords:desc[c].filter(x=>x.untyped.length).length}]));
const pub={schema:'pee.r2.link-experiment.v1',label,generatedAt:new Date().toISOString(),set,
 tier:set==='p272'?'Phase272 untouched set: SPENT (R1 tuning and R2 diagnosis inspected its link reference). Development evidence; never held-out.':'Step 1C + 1D-B pages of taught categories: link reference blind and sealed after the build froze; the link mechanism was never developed on them; the pages served earlier reader development (not untouched documents).',
 rules:KL.loadLinkRules().version,forceOverlay:overlay.id,descriptorCensus,arms:C,c2ToC3:T,c3ToC4:T4};
writeFileSync(OUT,JSON.stringify(pub,null,1)+'\n');mkdirSync(join(PE,'r2'),{recursive:true});
writeFileSync(join(PE,'r2',`link-${label}.json`),JSON.stringify({...pub,descriptors:desc,detail},null,1)+'\n');
for(const a of ARMS)console.log(a,JSON.stringify(C[a]));console.log('C2->C3',JSON.stringify(T));console.log('C3->C4',JSON.stringify(T4));
