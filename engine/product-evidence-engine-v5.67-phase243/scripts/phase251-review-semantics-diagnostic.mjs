#!/usr/bin/env node
/** Phase251 — bounded review-semantics diagnostic on the DEPLOYED TypeScript runtime (Phase109/110, Phase113).
 * Statements are synthetic (T1), adapted from the lesson-design probes of research v9 Addendum IV §2.1; they are not
 * real reviews. For each statement a scripted provider (standing in for a model; NOT a model) proposes one correct
 * interpretation and one wrong interpretation (a mutation of the meaning). The runtime either accepts or rejects each.
 * It measures: (1) what the runtime interprets with no model at all; (2) which meaning errors its validation catches.
 * It never measures Claude's own understanding.
 * Usage: node scripts/phase251-review-semantics-diagnostic.mjs [--out FILE]
 */
import {writeFileSync} from 'node:fs';import {resolve} from 'node:path';
import {extractReview110} from '../dist/src/phase110_local_semantic_extractor.js';
import {auditModelProposal113} from '../dist/src/phase113_local_intent_interpreter.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const V=['this_product','other_product'];
const atom=(text,span,o={})=>{const s=text.indexOf(span);if(s<0)throw Error('fixture span '+span);
 return {variantId:'this_product',relatedVariantIds:[],conceptId:'aspect',criterionId:null,kind:'observation',polarity:'favorable',assertionCode:'claim',
  evidenceMode:'expert_judgement',epistemicStatus:'observed',conditionCodes:[],evidenceStart:s,evidenceEnd:s+span.length,...o};};
const CASES=[
 {id:'qualified_criticism',phenomenon:'negation / qualified praise and criticism',text:'Coffee is excellent, but cleaning the machine takes ages.',
  good:t=>atom(t,'cleaning the machine takes ages',{conceptId:'cleaning_effort',kind:'maintenance',polarity:'unfavorable'}),
  bad:t=>atom(t,'cleaning the machine takes ages',{conceptId:'cleaning_effort',kind:'maintenance',polarity:'favorable'}),mutation:'criticism read as praise'},
 {id:'negated_comparison',phenomenon:'negation',text:'It is not louder than my previous vacuum.',
  good:t=>atom(t,'It is not louder than my previous vacuum',{conceptId:'noise',kind:'comparison',polarity:'neutral',relatedVariantIds:['other_product'],relation:{direction:'equivalent',targetVariantId:'other_product',basis:'same_original_test'}}),
  bad:t=>atom(t,'It is not louder than my previous vacuum',{conceptId:'noise',kind:'comparison',polarity:'unfavorable',relatedVariantIds:['other_product'],relation:{direction:'worse',targetVariantId:'other_product',basis:'same_original_test'}}),mutation:'negation dropped: read as louder'},
 {id:'condition',phenomenon:'condition of use',text:'The battery lasts six hours unless Bluetooth is on.',
  good:t=>atom(t,'The battery lasts six hours unless Bluetooth is on',{conceptId:'battery_life',conditionCodes:['bluetooth_off']}),
  bad:t=>atom(t,'The battery lasts six hours unless Bluetooth is on',{conceptId:'battery_life',conditionCodes:[]}),mutation:'condition dropped (universal six hours)'},
 {id:'surface_scope',phenomenon:'condition of use',text:'Great for tiles, hopeless on thick carpet.',
  good:t=>atom(t,'hopeless on thick carpet',{conceptId:'carpet_cleaning',polarity:'unfavorable',conditionCodes:['thick_carpet']}),
  bad:t=>atom(t,'hopeless on thick carpet',{conceptId:'carpet_cleaning',polarity:'favorable',conditionCodes:[]}),mutation:'surface-specific criticism generalised as praise'},
 {id:'variant_attribution',phenomenon:'product and variant attribution',text:'My old blender leaked; this one has not so far.',
  good:t=>atom(t,'My old blender leaked',{variantId:'other_product',conceptId:'leaks',kind:'durability',polarity:'unfavorable'}),
  bad:t=>atom(t,'My old blender leaked',{variantId:'this_product',conceptId:'leaks',kind:'durability',polarity:'unfavorable'}),mutation:'old product\'s leak attributed to this product'},
 {id:'comparison_direction',phenomenon:'comparison direction',text:'Unlike model B, model A browned both sides evenly.',
  good:t=>atom(t,'model A browned both sides evenly',{conceptId:'even_browning',kind:'comparison',relatedVariantIds:['other_product'],relation:{direction:'better',targetVariantId:'other_product',basis:'same_original_test'}}),
  bad:t=>atom(t,'model A browned both sides evenly',{conceptId:'even_browning',kind:'comparison',relatedVariantIds:['other_product'],relation:{direction:'worse',targetVariantId:'other_product',basis:'same_original_test'}}),mutation:'comparison direction reversed'},
 {id:'attributed_claim',phenomenon:'reviewer observation versus unverified claim',text:'The reviewer says the manufacturer claims 19 bar.',
  good:t=>atom(t,'the manufacturer claims 19 bar',{conceptId:'pump_pressure',kind:'measurement',evidenceMode:'manufacturer_attribution',epistemicStatus:'attributed',quantity:{value:19,unitCode:'bar',protocolId:'manufacturer_declaration'}}),
  bad:t=>atom(t,'the manufacturer claims 19 bar',{conceptId:'pump_pressure',kind:'measurement',evidenceMode:'direct_test',epistemicStatus:'observed',quantity:{value:19,unitCode:'bar',protocolId:'lab_test'}}),mutation:'manufacturer claim promoted to a direct test'},
 {id:'hedged_recall',phenomenon:'reviewer observation versus unverified claim',text:'It looked like it was recalled, but I could not find a recall notice.',
  good:t=>atom(t,'It looked like it was recalled, but I could not find a recall notice',{conceptId:'recall_status',kind:'uncertainty',polarity:'not_applicable',epistemicStatus:'not_assessed',evidenceMode:'unverified'}),
  bad:t=>atom(t,'It looked like it was recalled',{conceptId:'recall_status',kind:'risk',polarity:'unfavorable',epistemicStatus:'observed',evidenceMode:'expert_judgement'}),mutation:'unverified recall stated as an observed fact'},
 {id:'temporal_revision',phenomenon:'qualified praise and criticism',text:'I expected it to be faster; after three months I no longer think so.',
  good:t=>atom(t,'after three months I no longer think so',{conceptId:'speed',kind:'temporal',polarity:'unfavorable'}),
  bad:t=>atom(t,'I expected it to be faster',{conceptId:'speed',kind:'observation',polarity:'favorable'}),mutation:'initial expectation taken as the result'},
 {id:'implicit_aspect',phenomenon:'implicit aspects',text:'After a week the handle was loose.',
  good:t=>atom(t,'After a week the handle was loose',{conceptId:'build_durability',kind:'durability',polarity:'unfavorable'}),
  bad:t=>atom(t,'After a week the handle was loose',{conceptId:'cleaning_effort',kind:'usability',polarity:'unfavorable'}),mutation:'implicit durability aspect mapped to the wrong aspect'},
 {id:'wrong_number',phenomenon:'measurement fidelity',text:'We measured 74.2 dB in maximum mode.',
  good:t=>atom(t,'74.2 dB in maximum mode',{conceptId:'noise',kind:'measurement',evidenceMode:'direct_test',quantity:{value:74.2,unitCode:'db',protocolId:'lab'},conditionCodes:['max_mode']}),
  bad:t=>atom(t,'74.2 dB in maximum mode',{conceptId:'noise',kind:'measurement',evidenceMode:'direct_test',quantity:{value:72.4,unitCode:'db',protocolId:'lab'},conditionCodes:['max_mode']}),mutation:'number not in the text'},
 {id:'ungrounded_span',phenomenon:'grounding',text:'The lid feels solid.',
  good:t=>atom(t,'The lid feels solid',{conceptId:'build_quality'}),
  bad:t=>({...atom(t,'The lid feels solid',{conceptId:'build_quality'}),evidenceText:'The lid is waterproof'}),mutation:'claim not present in the text'},
];
async function run(cand,text){
 const model={name:'scripted_provider_not_a_model',async extract({mode}){return mode==='initial'?{claims:[{segmentId:'s1',candidate:cand}],emptySegments:[]}:{claims:[],emptySegments:[]};}};
 const p=await extractReview110({reportId:'diag_251',originalTestId:'diag_251',sourceUrl:'https://example.org/synthetic',categoryId:'diagnostic',
  inventoryReviewerId:'synthetic_fixture',inventoryReviewReference:'synthetic contrast statement (T1)',variants:V,
  blocks:[{segmentId:'s1',locator:'#s1',surface:'paragraph',accessible:true,representation:'complete',content:text}]},model);
 return {accepted:p.proposed.length===1,reason:p.problems[0]??null};
}
const rows=[];
for(const c of CASES){const g=await run(c.good(c.text),c.text);const b=await run(c.bad(c.text),c.text);
 rows.push({id:c.id,phenomenon:c.phenomenon,mutation:c.mutation,correctAccepted:g.accepted,correctRejectionReason:g.reason,mutationRejected:!b.accepted,rejectionReason:b.reason});}
// No model at all: what does the runtime interpret by itself?
const none={name:'no_model',async extract(){return {claims:[],emptySegments:[]};}};
let nativeAtoms=0;for(const c of CASES){const p=await extractReview110({reportId:'diag_251',originalTestId:'diag_251',sourceUrl:'https://example.org/synthetic',categoryId:'diagnostic',
 inventoryReviewerId:'synthetic_fixture',inventoryReviewReference:'synthetic',variants:V,blocks:[{segmentId:'s1',locator:'#s1',surface:'paragraph',accessible:true,representation:'complete',content:c.text}]},none);nativeAtoms+=p.proposed.length;}
// Phase113 audit on request-side negation: it flags negation for adjudication, it does not resolve scope.
const q='Quietest cordless vacuum, not for carpet, without a bag.';
const audit=auditModelProposal113(q,{category:'vacuum_cleaner',goal:'least_noise',surface:'unspecified',requirements:[],hygieneTargets:[],anchors:[],ambiguous:false,unresolvedText:[]});
const totals={statements:CASES.length,correctAccepted:rows.filter(r=>r.correctAccepted).length,mutationsRejected:rows.filter(r=>r.mutationRejected).length,
 nativeAtomsWithoutModel:nativeAtoms,phase113NegationFlagged:audit.problems.includes('negation_requires_scope_adjudication'),phase113Status:audit.status};
const out={schema:'pee251.review-semantics-diagnostic.v1',tier:'T1 synthetic contrast statements (research v9 Addendum IV §2.1 probes); scripted provider, not a model',totals,cases:rows};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify(totals));for(const r of rows)console.log(r.mutationRejected?'caught ':'MISSED ',r.id,'|',r.mutation,r.rejectionReason?'| '+r.rejectionReason:'',r.correctAccepted?'':'| correct REJECTED '+r.correctRejectionReason);
