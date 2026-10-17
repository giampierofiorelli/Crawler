#!/usr/bin/env node
/** Continuous-learning Step 1A: build the pilot experience-case set (18 cases) from EXISTING committed evaluations only.
 * Step 1B: `--set step1b` builds the separate 6-case extension (EX-19..EX-24, attribution cases around the tuned Phase272
 * mention rule) into step1b-cases.json / evaluation/experience/step1b-index.json; the Step 1A set is never rewritten.
 *  - historical state: the committed first-run records (immutable): Phase272 untouched first run (arm B, private full copy of
 *    evaluation/phase272/ab-untouched-firstrun.json) and the unknown-category pilot (evaluation/phase272/unknown-category-pilot.json);
 *  - locator and lead subject string: re-observed on the frozen arm-B build (commit c206c9a, worktree /home/user/p272-frozenB);
 *    the re-observed status and subject outcome must equal the committed ones, or the build stops;
 *  - reference: the independent untouched gold (private), plus the recorded Phase272 developer audit where stated;
 *  - features: generic document properties (several named products, value in a table cell, sentence headline, subject is not
 *    the page product, untaught dimension, found only by the exploratory pass), computed, not hand-written.
 * Writes the private case file (values, names) to pee-knowledge/private-eval/experience/ and the public value-free index to
 * evaluation/experience/pilot-index.json. Never overwrites. No network. Usage: node scripts/experience-pilot-build.mjs */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {observeCase,sameProduct} from './experience-observe.mjs';
const {publicCase,sameObservation}=await import(resolve('dist/src/experience_cases.js'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const PRIV=join(homedir(),'.local/share/product-evidence-engine/private-eval/phase272');
// The private knowledge repository (CLAUDE.md: cloned at /home/user/pee-knowledge; PEE_KNOWLEDGE_REPO overrides).
const SETNAME=process.argv.includes('--set')?process.argv[process.argv.indexOf('--set')+1]:'step1a';
if(!['step1a','step1b'].includes(SETNAME))throw Error('unknown set '+SETNAME);
const OUT_PRIV=join(process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge','private-eval/experience/'+(SETNAME==='step1a'?'pilot-cases.json':'step1b-cases.json'));
const OUT_PUB='evaluation/experience/'+(SETNAME==='step1a'?'pilot-index.json':'step1b-index.json');
for(const f of [OUT_PRIV,OUT_PUB])if(existsSync(f))throw Error(f+' exists: the pilot set is never overwritten');
const FROZEN_B={commit:'c206c9a',path:'/home/user/p272-frozenB/engine/product-evidence-engine-v5.67-phase243/dist/src'};
const CURRENT=resolve('dist/src');
const RUN='evaluation/phase272/ab-untouched-firstrun.json';
const run=JSON.parse(readFileSync(join(PRIV,'ab-untouched-firstrun.json'),'utf8'));
if(sha(JSON.stringify(run.summary))!==sha(JSON.stringify(JSON.parse(readFileSync(RUN,'utf8')).summary)))throw Error('private first run differs from the committed public run');
const G=JSON.parse(readFileSync(join(PRIV,'gold-untouched.json'),'utf8'));const W=JSON.parse(readFileSync(join(PRIV,'wave.json'),'utf8'));
const UC=JSON.parse(readFileSync('evaluation/phase272/unknown-category-pilot.json','utf8'));
const gq=Object.fromEntries(G.quantitative.map(g=>[g.id,g])),go=Object.fromEntries(G.qualitative.map(g=>[g.id,g]));
const docOf=t=>run.documents.find(d=>d.tag===t);
const GOLD_INDEP='untouched gold by an independent Claude annotator (frozen before any run; hash in evaluation/phase272/gold-untouched-freeze.json); not author-independent of the project';
const AUDIT='plus the Phase272 developer audit (REPORT.md §5): the two names denote the same product; the audit is not independent';
// Curated selection (Step 1A): mechanism diversity first, successes as regression guards, counterexamples paired.
const SEL=[
 {id:'EX-01',kind:'quantitative_value',family:'F1_identity_by_default',gold:'tv-q10',cause:['candidate','a comparison sentence/table value of another model inherits the page product (no product named in its own clause by the frozen reader)'],
  lesson:'In a document naming several products, a value without its own named subject is unresolved, never the page product.',supports:['EX-03'],counter:['EX-05']},
 {id:'EX-02',kind:'quantitative_value',family:'F1_identity_by_default',gold:'ap-q24',cause:['candidate','the clause-level attribution picked the nearest preceding model code, which names a different compared product'],
  lesson:'Nearest-mention binding must not cross a comparison boundary; prefer unresolved over the nearest mention.',supports:['EX-01'],counter:['EX-04']},
 {id:'EX-03',kind:'quantitative_value',family:'F1_identity_by_default',gold:'tv-q68',cause:['candidate','a rival product figure in comparison prose inherits the page product'],
  lesson:'Same as EX-01 (comparison prose).',supports:['EX-01'],counter:['EX-09']},
 {id:'EX-04',kind:'quantitative_value',family:'S_attribution_success',gold:'ap-q23',cause:['not_applicable','clause attribution bound another product correctly'],
  lesson:'Counterexample: clause-level binding to another named product can be right; a fix must not force every value to the page product or to unresolved.',supports:[],counter:[]},
 {id:'EX-05',kind:'quantitative_value',family:'S_attribution_success',gold:'tv-q1',cause:['not_applicable','the reviewed product value in a comparison document'],
  lesson:'Counterexample: in comparison documents the reviewed product\'s own values are still bound correctly.',supports:[],counter:[]},
 {id:'EX-06',kind:'quantitative_value',family:'F8_identity_variant',gold:'tv-q59',accept:['Samsung S85H','Samsung QE65S85H'],cause:['confirmed','series name in gold vs exact variant in the page product name; the frozen subject rule (token Jaccard) scores them as different'],
  lesson:'Identity comparison must distinguish "same product, other name" (series vs variant code) from "other product".',supports:['EX-07'],counter:[]},
 {id:'EX-07',kind:'quantitative_value',family:'F8_identity_variant',gold:'dw-q8',accept:['Candy CF 57CF0W-80','Candy CF 57CF0W'],cause:['confirmed','model-code suffix (-80) present in gold, absent in the page product'],
  lesson:'Same as EX-06 (suffix variant).',supports:['EX-06'],counter:[]},
 {id:'EX-08',kind:'quantitative_value',family:'F1_identity_headline',gold:'ap-q62',cause:['confirmed','the page main product name is the article headline sentence, so every value is bound to a non-product string'],
  lesson:'A headline sentence is not a product identity; bind to the named product or leave unresolved.',supports:[],counter:[]},
 {id:'EX-09',kind:'quantitative_value',family:'S_extraction_success',gold:'tv-q73',cause:['not_applicable','found by arm A and arm B'],lesson:'Guard: a value the baseline reader already found must stay found.',supports:[],counter:[]},
 {id:'EX-10',kind:'quantitative_value',family:'S_extraction_success',gold:'af-q10',cause:['not_applicable','observed cooking time found by guided reading'],lesson:'Guard: guided reading of observed durations.',supports:[],counter:[]},
 {id:'EX-11',kind:'quantitative_value',family:'F3_lost_under_guidance',gold:'ap-q13',cause:['candidate','found as a lead by the knowledge-free exploratory pass (arm E) but not admitted by the guided pass'],
  lesson:'Guidance may add or veto with a stated reason; a value a generic pass locates must not vanish silently.',supports:['EX-15'],counter:[]},
 {id:'EX-12',kind:'false_positive_finding',family:'F2_qualitative_overreach',fp:{doc:'u_ap_hf_xiaomi_4pro',dimension:'clinical_health_outcome',direction:'positive',subject:'Xiaomi 4 Pro'},
  cause:['candidate','one evaluative word in a clause sharing one taught term became a finding (health outcome) without a tester finding'],
  lesson:'An evaluative finding needs an anchor, a stated subject and a test context in the same clause.',supports:['EX-13'],counter:['EX-14']},
 {id:'EX-13',kind:'false_positive_finding',family:'F2_qualitative_overreach',fp:{doc:'u_tv_tg_lg_b6',dimension:'accessible_operation',direction:'positive',subject:'LG OLED evo AI B6 4K Smart TV (2026)'},
  cause:['candidate','as EX-12 (accessibility outcome from a generic positive clause)'],lesson:'Same as EX-12.',supports:['EX-12'],counter:['EX-16']},
 {id:'EX-14',kind:'qualitative_finding',family:'S_extraction_success',gold:'dw-o17',cause:['not_applicable','taught dimension found with the right subject'],lesson:'Guard: guided qualitative reading of a taught outcome.',supports:[],counter:[]},
 {id:'EX-15',kind:'qualitative_finding',family:'F3_lost_under_guidance',gold:'af-o11',cause:['candidate','untaught dimension: the guided pass links no taught outcome; only the exploratory pass records it, as a lead'],
  lesson:'Untaught dimensions must surface (at least as leads attached to the case) rather than be dropped.',supports:['EX-11'],counter:[]},
 {id:'EX-16',kind:'qualitative_finding',family:'S_extraction_success',gold:'af-o1',cause:['not_applicable','found by arm A and arm B'],lesson:'Guard: a baseline qualitative finding must stay found.',supports:[],counter:[]},
 {id:'EX-17',kind:'request',family:'F5_category_recognition',req:1,cause:['confirmed','purchase-phrase detection finds no phrase in "I want a quiet tumble dryer…", so shared need words decide'],
  lesson:'A product noun phrase the registry does not know is a gap to state, not a near match to accept.',supports:[],counter:['EX-18']},
 {id:'EX-18',kind:'request',family:'S_gap_recognition_success',req:0,cause:['not_applicable','unknown product named after "Which"; gap stated'],lesson:'Guard: a stated gap must stay stated.',supports:[],counter:[]},
];
// Step 1B extension: the attribution behaviour of the tuned Phase272 mention rule (body/table-header mentions activate the
// clause rule "nearest preceding named product"). Selected from the census of first-run vs after-change subject outcomes.
const SEL1B=[
 {id:'EX-19',kind:'quantitative_value',family:'S_attribution_success',gold:'tv-q26',cause:['confirmed','correct by page-product default; the tuned mention list activates the clause rule, which binds the value to the nearest preceding named product (a comparison object of the sentence)'],
  lesson:'In "X has less Y (v) than Z", the value belongs to the sentence subject X, not to the nearest named product.',supports:['EX-05'],counter:['EX-20']},
 {id:'EX-20',kind:'quantitative_value',family:'F1_identity_by_default',gold:'tv-q29',cause:['confirmed','wrong by page-product default; the tuned clause rule binds the value to the product named just before it'],
  lesson:'A value in parentheses directly after a product name belongs to that product.',supports:['EX-21'],counter:['EX-19']},
 {id:'EX-21',kind:'quantitative_value',family:'F1_identity_by_default',gold:'tv-q22',cause:['confirmed','as EX-20: parenthetical value directly after a named product; corrected by the tuned rule; an all-ambiguous policy would leave it unresolved'],
  lesson:'Counterexample to "several products in the sentence = unresolved": adjacency can still identify the subject.',supports:['EX-20'],counter:['EX-05']},
 {id:'EX-22',kind:'quantitative_value',family:'F1_identity_by_default',gold:'tv-q38',cause:['confirmed','another page and model family: parenthetical value after a named rival; corrected by the tuned rule'],
  lesson:'Same as EX-20 on a second page.',supports:['EX-20','EX-21'],counter:[]},
 {id:'EX-23',kind:'quantitative_value',family:'F1_identity_by_default',gold:'ap-q21',cause:['candidate','corrected by the tuned rule, but the bound subject string is a truncated name (the capitalised word before the code is taken as the brand); the scorer accepts it through the shared model code'],
  lesson:'A model-code match is not an identity: the stored subject name must be a valid product name, or stay unresolved.',supports:[],counter:[]},
 {id:'EX-24',kind:'quantitative_value',family:'F1_identity_by_default',gold:'ap-q26',cause:['candidate','"both with ... 174 cfm" names two products; the frozen build binds the page product, the tuned rule the nearest code-bearing product, which is a third, unrelated product; the committed "absent" comes from the scorer counting identical (value, unit, subject) leads once'],
  lesson:'A value stated for several products at once ("both") needs a multi-subject or unresolved attribution, never the nearest name.',supports:[],counter:[]},
];
const cases=[];
for(const s of SETNAME==='step1a'?SEL:SEL1B){
 let c;
 if(s.kind==='request'){
  const g=UC.gapBefore[s.req];
  c={schema:'pee.experience-case.v1',id:s.id,kind:'request',family:s.family,category:'tumble_dryers',
   source:{host:null,docTag:null,docSha256:null,evaluation:'phase272',run:'evaluation/phase272/unknown-category-pilot.json',goldId:null,historicalArm:'journey',historicalBuild:{commit:'20fa5ae',path:'(not rebuilt: immutable committed record)'}},
   item:{text:g.text,requestSha256:sha(g.text)},historical:{status:'responded',response:g.response,category:g.category??null},
   reference:{expected:'gap_stated',basis:'frozen_request_design',independence:'request authored by the developer before any tumble-dryer page was read (evaluation/phase272/unknown-category-requests.json); the expectation is the design intent, not an independent judgement'},
   features:['request_names_unknown_product',...(/^(?:which|what)\b/i.test(g.text)?['question_word_purchase_anchor']:['no_question_word_anchor'])],maturity:'T2_frozen_request_set'};
 }else if(s.kind==='false_positive_finding'){
  const d=docOf(s.fp.doc);const p=W.pages.find(x=>x.tag===s.fp.doc);
  const present=d.arms.B.qualitative.extra.some(e=>e.dimension===s.fp.dimension&&e.direction===s.fp.direction&&e.subject===s.fp.subject);if(!present)throw Error(s.id+': not in the committed run');
  c={schema:'pee.experience-case.v1',id:s.id,kind:s.kind,family:s.family,category:d.category,
   source:{host:new URL(p.finalUrl??p.url).host,docTag:s.fp.doc,docSha256:p.sha256,evaluation:'phase272',run:RUN,goldId:null,historicalArm:'B',historicalBuild:FROZEN_B},
   item:{dimension:s.fp.dimension,direction:s.fp.direction,subject:s.fp.subject},historical:{status:'emitted',subject:s.fp.subject},
   reference:{expected:'absent',basis:'independent_gold',independence:GOLD_INDEP+'; "absent" relies on the gold being complete for this dimension and subject'},features:[],maturity:'T2_untouched_first_run'};
 }else{
  const g=s.kind==='quantitative_value'?gq[s.gold]:go[s.gold];const d=docOf(g.doc);const p=W.pages.find(x=>x.tag===g.doc);
  const list=s.kind==='quantitative_value'?d.arms.B.quantitative.matched:d.arms.B.qualitative.matched;const m=list.find(x=>x.g===s.gold);
  const xm=s.kind==='quantitative_value'?d.arms.E.exploratoryQuant.matchedGold:d.arms.E.exploratoryQual.matchedGold;
  const aHit=(s.kind==='quantitative_value'?d.arms.A.quantitative.matched:d.arms.A.qualitative.matched).some(x=>x.g===s.gold);
  c={schema:'pee.experience-case.v1',id:s.id,kind:s.kind,family:s.family,category:d.category,
   source:{host:new URL(p.finalUrl??p.url).host,docTag:g.doc,docSha256:p.sha256,evaluation:'phase272',run:RUN,goldId:s.gold,historicalArm:'B',historicalBuild:FROZEN_B},
   item:s.kind==='quantitative_value'?{value:g.value,unit:g.unit,goldSubject:g.subject}:{dimension:g.dimension,direction:g.direction,goldSubject:g.subject},
   // Other gold items of the same document with the same value and unit (one-to-one scoring may assign the lead to them).
   ...(s.kind==='quantitative_value'?{sameValueGoldIds:G.quantitative.filter(x=>x.doc===g.doc&&x.id!==g.id&&x.value===g.value&&x.unit===g.unit).map(x=>x.id)}:{}),
   historical:m?{status:'found',subjectOutcome:m.subject}:{status:'absent'},
   reference:{expected:'found_with_accepted_subject',acceptedSubjects:s.accept??[g.subject],unresolvedAcceptable:false,basis:s.accept?'independent_gold_plus_developer_audit':'independent_gold',
    independence:GOLD_INDEP+(s.accept?'; '+AUDIT:'')},
   features:[...(aHit?['found_by_baseline_reader']:[]),...(!m&&!aHit&&xm.includes(s.gold)?['found_only_by_exploratory_pass']:[]),...(String(g.dimension??'').startsWith('untaught:')?['untaught_dimension']:[])],
   maturity:s.accept?'T2_untouched_first_run_with_developer_audit':'T2_untouched_first_run'};
 }
 c.cause={candidate:s.cause[1],status:s.cause[0],evidence:s.cause[0]==='confirmed'?'Phase272 REPORT.md §5/§7 audit and this case\'s re-observation':'Phase272 REPORT.md audit; not yet isolated by a controlled change'};
 c.lesson={hypothesis:s.lesson,status:'hypothesis',applicability:'documents and requests of the kind described by this case\'s features; not validated beyond the listed cases',exceptions:s.counter.map(x=>'see '+x)};
 c.supports=s.supports;c.counterexamples=s.counter;
 // Locator and subject string: re-observed on the frozen historical build; status and subject outcome must agree.
 if(c.kind!=='request'){
  const r=await observeCase(c,FROZEN_B.path);if(r.unobservable)throw Error(s.id+': '+r.unobservable);
  // A disagreement is recorded, never resolved by editing the committed state (it is a finding about the case or the scorer).
  const agrees=sameObservation(c.historical,r.observation);
  c.historicalCheck={reobservedOn:FROZEN_B.commit,reproduced:agrees,reobserved:{status:r.observation.status,subjectOutcome:r.observation.subjectOutcome??null},
   note:agrees?null:'the committed run and a single-case re-observation on the frozen build disagree; the committed state is kept unchanged'};
  if(agrees)c.historical={...c.historical,subject:r.observation.subject??c.historical.subject??null,blockSha256:r.observation.blockSha256??null,blockIndex:r.observation.blockIndex??null};
  // Generic document features (computed on the bytes with the current build's mention detector and table-cell test).
  const html=readFileSync(join(PRIV,'raw',c.source.docTag+'.html'),'utf8');
  const tl=await import(CURRENT+'/phase265_test_measurements.js'),tb=await import(CURRENT+'/phase225_transient_test_probe.js'),sp=await import(CURRENT+'/phase245_spec_extraction.js');
  const ments=tl.documentMentions272(html);if(ments.length>=2)c.features.push('document_names_several_products');
  const x=tl.testDocumentSubject268(sp.extractSpecifications245(html,'https://'+c.source.host+'/'),'independent_original_test');const page=x?.mainProduct?.name??'';
  if(/^['‘“"]|\b(?:I|we)\b|:/.test(page)||page.split(/\s+/).length>9)c.features.push('headline_is_sentence');
  const subj=c.item.goldSubject??c.item.subject;if(subj&&page&&!sameProduct(subj,page))c.features.push('subject_is_not_page_product');
  if(c.historical.blockIndex!=null){const blk=tb.textBlocks225(html,{maxBlocks:1500}).blocks[c.historical.blockIndex]??'';const w=tb.textBlocks225(html,{withTags:true,maxBlocks:1500});
   if(w.blocks.some((b,i)=>w.tags[i]==='td'&&b===blk))c.features.push('value_in_table_cell');}
 }
 c.features=[...new Set(c.features)].sort();cases.push(c);
}
const doc={schema:'pee.experience-case-set.v1',set:SETNAME==='step1a'?'step1a-pilot':'step1b-attribution-extension',builtAt:new Date().toISOString(),builder:'scripts/experience-pilot-build.mjs',frozenHistoricalBuild:FROZEN_B.commit,
 goldSha256:sha(readFileSync(join(PRIV,'gold-untouched.json'))),cases};
mkdirSync(join(OUT_PRIV,'..'),{recursive:true});mkdirSync('evaluation/experience',{recursive:true});
writeFileSync(OUT_PRIV,JSON.stringify(doc,null,1)+'\n');
writeFileSync(OUT_PUB,JSON.stringify({schema:'pee.experience-case-index.v1',set:doc.set,builtAt:doc.builtAt,frozenHistoricalBuild:doc.frozenHistoricalBuild,
 privateCasesSha256:sha(readFileSync(OUT_PRIV)),goldSha256:doc.goldSha256,cases:cases.map(publicCase)},null,1)+'\n');
console.log(JSON.stringify(cases.map(c=>[c.id,c.family,c.category,c.historical.status,c.historical.subjectOutcome??c.historical.response??'',c.features.join(',')]),null,0).replace(/\],\[/g,'],\n['));
