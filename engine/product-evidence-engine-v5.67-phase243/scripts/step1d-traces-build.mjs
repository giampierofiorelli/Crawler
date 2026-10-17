#!/usr/bin/env node
/** Continuous-learning Step 1D-A: diagnostic traces of document-identity decisions, in the experience-case format
 * (src/experience_cases.ts `diagnostic`). For each selected gold value: the source region and heading chain, the mentions
 * the Step 1C candidate saw, the inventory's entity, mention state, reason and supporting location, both attributions
 * (A = Step 1C candidate, B = with the inventory), the reference, the cause code, a lesson HYPOTHESIS with counterexamples
 * and the evidence that would resolve what remains. Development material only (spent or examined pages); no network.
 * Also records the non-product entities the inventory typed (instrument, standard, other, navigation) with their reasons.
 * Usage: node scripts/step1d-traces-build.mjs. Private -> pee-knowledge/private-eval/experience/step1d-traces.json;
 * value-free -> evaluation/experience/step1d-traces-index.json. Never overwrites. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {documentLeads,documentInventory} from './experience-observe.mjs';
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const PRIV=join(REPO,'private-eval/experience/step1d-traces.json'),PUB='evaluation/experience/step1d-traces-index.json';
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const sha=x=>createHash('sha256').update(x).digest('hex');
const S=await import(resolve('dist/src/experience_attribution_scoring.js'));const UNIT=(await import(resolve('dist/src/phase272_extraction_plan.js'))).canonicalUnit272;
const UE={db:['db','dba','db(a)'],nits:['nits','nit'],minutes:['minutes','mins','min'],w:['w','watts'],ms:['ms'],cfm:['cfm'],l:['l','litres','liters'],kwh:['kwh']};
const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return UNIT?.(l)??l;};
const E=join(homedir(),'.local/share/product-evidence-engine/private-eval');const D=resolve('dist/src');
const gold={step1c:JSON.parse(readFileSync(join(E,'step1c/gold.json'),'utf8')).values,
 phase272:[...JSON.parse(readFileSync(join(E,'phase272/gold-untouched.json'),'utf8')).quantitative,...JSON.parse(readFileSync(join(E,'phase272/gold-dev.json'),'utf8')).quantitative].map(q=>({...q,subjectStatus:'exact'}))};
const CAT={tv:'televisions',ap:'air_purifiers',af:'air_fryers',dw:'dishwashers'};
// Curated selection: successes, remaining failures and counterexamples across both page sets (lessons are hypotheses).
const SEL=[
 ['EX-25','step1c','t1-02','S_identity_link_success','3_short_name_not_linked (fixed)','A bare model code links to the one full name the document states, even once.','EX-34 (a code with no full name in the document stays separate)',null],
 ['EX-26','step1c','t2-03','S_identity_link_success','1_not_detected (fixed)','A brand-less model code that recurs is a product mention of the full name stated once.','EX-31 (two codes sharing a stem are not linked)',null],
 ['EX-27','step1c','t3-02','S_identity_link_success','1_not_detected (fixed)','A series name ending in a number and a roman numeral is a model-like name.','EX-36 (a one-letter code is not detected)',null],
 ['EX-28','step1c','a1-01','S_identity_link_success','6_evaluator_rejects_alias (fixed by linking)','A brand-dropped name links to the full name observed in the same document; the canonical name carries the brand.','EX-29 bedroom page: a brand shared by two products stays ambiguous',null],
 ['EX-29','step1c','a2-24','S_identity_link_success','5_identity_present_not_used (fixed)','Values under sub-headings belong to the product of the enclosing section heading (heading hierarchy, not nearest heading).','EX-30 (a comparative deck heading naming another product does not take over)',null],
 ['EX-30','step1c','a1-34','S_identity_link_success','5_identity_present_not_used (fixed)','A comparative sub-heading ("matched the performance of X") does not override the section product.','a heading naming two products leaves the value unresolved (focused test)',null],
 ['EX-35','step1c','t2-06','F9_grammar_after_identity','5_identity_present_not_used (grammar)','Identity is present; the attribution grammar treats "with the X clocking in" as an object.','EX-19 (elided subject handled)','a grammar rule for absolute "with X <verb>-ing" constructions'],
 ['EX-31','phase272','tv-q63','F9_variant_or_family','4_variant_not_established','Series name (S85H) and full regional code (QE65S85H) are not merged without the page stating it; unresolved is the safe outcome.','EX-06 (developer audit says same product)','a page statement linking the series name and the full code (apposition, specification table)'],
 ['EX-32','phase272','dw-q8','F9_variant_or_family','4_variant_not_established','A code suffix (-80) is a possible variant; the page product without it is not proof of the same variant.','EX-07','a page statement that the suffix denotes the same model (market or colour code)'],
 ['EX-33','phase272','ap-q25','F9_mention_not_detected','1_not_detected','A product named without any model-like token ("Elite") is not detected; its values stay with the page product or unresolved.','EX-27 (a series name with a number is detected)','a document inventory rule for code-less names introduced as products ("the pricier X", "we tested the X")'],
 ['EX-34','phase272','q3','F9_identity_split','3_short_name_not_linked','An abbreviated code ("AD3000") with no stated link to the full name ("AirDoctor 3000") stays a separate entity; linking it would be a guess from similarity.','EX-25 (a bare code that equals the full name model token is linked)','a page statement linking the abbreviation and the full name (apposition, product box, URL slug read as metadata)'],
 ['EX-36','phase272','ap-q62','F9_mention_not_detected','1_not_detected','A one-letter series code ("Atem X") is not detected; the headline-like page name is rejected, so the value stays unresolved.','EX-08 (headline is not an identity)','a structured product name (schema.org Product name, product box) or a model-like token'],
];
const cache=new Map();
async function docData(ev,tag){const k=ev+'|'+tag;if(cache.has(k))return cache.get(k);const category=CAT[tag.split('_')[1]];
 const A=await documentLeads(D,{evaluation:ev,docTag:tag,category},{policy:'constrained_candidate_1c'}),B=await documentLeads(D,{evaluation:ev,docTag:tag,category},{policy:'candidate_1c_inventory'});
 const iv=await documentInventory(D,{evaluation:ev,docTag:tag});const W=JSON.parse(readFileSync(join(E,ev,'wave.json'),'utf8'));const p=W.pages.find(x=>x.tag===tag);
 const r={category,A,B,iv,page:p};cache.set(k,r);return r;}
const cases=[],index=[];
for(const [id,ev,gid,family,causeCode,lesson,counter,needed] of SEL){
 const g0=gold[ev].find(x=>x.id===gid);const g={...g0,unit:canon(g0.unit)};const dd=await docData(ev,g.doc);const inv=dd.iv.inventory;
 const near=L=>L.leads.map(l=>({...l,unit:canon(l.unit)})).filter(l=>Math.abs(l.value-g.value)<1e-9&&l.unit===g.unit);
 const pickA=near(dd.A),pickB=near(dd.B);const clsA=S.scoreItem1C(g,pickA),clsB=S.scoreItem1C(g,pickB);
 const bestB=pickB.find(l=>l.subject&&S.identity1C(g,l.subject)==='match')??pickB.find(l=>l.subject)??pickB[0]??null;const bestA=pickA[0]??null;
 const bi=bestB?.blockIndex??bestA?.blockIndex??null;const block=bi!=null?dd.iv.blocks[bi]??null:null;
 const ms=bi!=null?inv.mentions.filter(m=>m.at.blockIndex===bi):[];const sec=bi!=null?inv.section(bi):{entityId:null,competing:0};
 const entity=inv.entities.find(e=>e.type==='product'&&S.identity1C(g,e.canonical)==='match')??null;
 const mm=entity?ms.find(m=>m.entityId===entity.id)??inv.mentions.find(m=>m.entityId===entity.id&&m.state==='contextual_alias')??inv.mentions.find(m=>m.entityId===entity.id)??null:null;
 const diagnostic={region:{blockIndex:bi,blockSha256:block?sha(block):null,regionType:mm?.at.region??null,headingChain:sec.entityId?[inv.entities.find(e=>e.id===sec.entityId).canonical]:[]},
  mentionsBefore:dd.iv.step1cMentions.map(m=>m.name),
  inventory:{entity:entity?.canonical??null,state:mm?.state??null,reason:mm?.reason??null,support:mm?.support?{blockIndex:mm.support.blockIndex,region:mm.support.region}:null,
   competing:[...new Set(ms.filter(m=>m.entityId&&m.entityId!==entity?.id).map(m=>inv.entities.find(e=>e.id===m.entityId)?.canonical))].filter(Boolean)},
  attributionBefore:{subject:bestA?.subject??null,rule:bestA?.assignment??null,class:clsA},attributionAfter:{subject:bestB?.subject??null,rule:bestB?.assignment??null,class:clsB},
  causeCode,neededEvidence:needed};
 const c={schema:'pee.experience-case.v1',id,kind:'quantitative_value',family,category:dd.category,
  source:{host:new URL(dd.page.finalUrl??dd.page.url).host,docTag:g.doc,docSha256:dd.page.sha256,evaluation:ev,run:'evaluation/experience/step1d-dev1.json',goldId:gid,historicalArm:'B',historicalBuild:{commit:'step1c-candidate',path:'dist/src'}},
  item:{value:g.value,unit:g.unit,goldSubject:g.subject},historical:{status:clsA==='missing'?'absent':'found',subject:bestA?.subject??null,subjectOutcome:clsA==='correct'?'correct':!bestA?.subject?'unresolved':'incorrect_match'},
  reference:{expected:'found_with_accepted_subject',acceptedSubjects:[g.subject],unresolvedAcceptable:false,basis:'independent_gold',independence:ev==='step1c'?'Step 1C blind gold (separate Claude annotator; pages now spent)':'Phase272 gold (separate Claude annotator; pages spent)'},
  features:[],cause:{candidate:causeCode,status:'candidate',evidence:'step1d-dev1 development run and this trace'},
  lesson:{hypothesis:lesson,status:'hypothesis',applicability:'within one document; not validated on new pages',exceptions:[counter]},supports:[],counterexamples:[],
  maturity:'T2_untouched_first_run_with_developer_audit',diagnostic};
 cases.push(c);
 index.push({id,family,category:c.category,docTag:g.doc,goldId:gid,before:clsA,after:clsB,ruleBefore:bestA?.assignment??null,ruleAfter:bestB?.assignment??null,
  inventoryState:mm?.state??null,inventoryReason:mm?.reason??null,regionType:mm?.at.region??null,blockSha256:diagnostic.region.blockSha256,causeCode,lesson,counterexample:counter,neededEvidence:needed});}
// Non-product entities typed by the inventory on the development pages (with the reason), and navigation exclusions.
const nonProducts=[];
for(const [ev,tag] of [['step1c','s1c_tv_trd_affordable_oled3'],['step1c','s1c_ap_hf_small'],['step1c','s1c_ap_hf_bedroom'],['phase272','u_tv_tg_lg_b6'],['phase272','u_ap_trd_iqair_atemx']]){
 const dd=await docData(ev,tag);const inv=dd.iv.inventory;const before=dd.iv.step1cMentions.map(m=>m.name);
 for(const e of inv.entities.filter(e=>e.type!=='product'&&e.type!=='unknown'))nonProducts.push({docTag:tag,entity:e.canonical,type:e.type,reason:e.typeReason,inStep1cMentions:before.includes(e.canonical)});
 for(const m of dd.iv.rawMentions)if(!inv.mentions.some(x=>x.surface.toLowerCase().includes(m.model.toLowerCase())))nonProducts.push({docTag:tag,entity:m.name,type:'not_in_article_region_or_not_detected',reason:'Step 1C mention absent from the inventory (before the article h1, or filtered)',inStep1cMentions:true});}
writeFileSync(PRIV,JSON.stringify({schema:'pee.experience-case-set.v1',set:'step1d-identity-traces',builtAt:new Date().toISOString(),cases,nonProducts},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({schema:'pee.experience-case-index.v1',set:'step1d-identity-traces',privateCasesSha256:sha(readFileSync(PRIV)),
 cases:index,nonProductCounts:nonProducts.reduce((o,n)=>(o[n.type]=(o[n.type]??0)+1,o),{})},null,1)+'\n');
for(const r of index)console.log(r.id,r.family.padEnd(26),r.before.padEnd(20),'->',r.after.padEnd(14),String(r.ruleAfter).padEnd(26),String(r.inventoryState).padEnd(18),r.inventoryReason??'');
console.log(nonProducts.map(n=>n.docTag.slice(0,14)+': '+n.type+' '+n.entity).join('\n'));
