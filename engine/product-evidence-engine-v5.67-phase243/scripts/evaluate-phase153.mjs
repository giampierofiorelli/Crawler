import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {discoverEntityInventory153} from '../dist/src/phase153_entity_inventory.js';
const sha=t=>createHash('sha256').update(t).digest('hex');
const earlier=JSON.parse(readFileSync('PHASE152-POSTCODE-EDITORIAL-DIAGNOSTIC.json','utf8'));
const targets={
 p152_techradar_airfryer:['Cosori Dual Blaze Twinfry Compact Air Fryer'],
 p152_whathifi_cd:['Marantz CD6007','CD 70'],
 p152_housefresh_air:['3200','Philips 3000i Series'],
 p152_trusted_washer:['Samsung WW90T684DLH'],
 p152_notebookcheck_laptop:['Lenovo ThinkBook 16 G7 QOY 21NH0005GE'],
 p152_rtings_tv:['Samsung The Frame Pro 2026','LG Gallery 2026']
};
const earlierRows=earlier.rows.map(r=>({id:r.id,category:r.category,publisher:r.publisher,url:r.sourceUrl,
 title:r.publisher,text:r.originalExcerpt,authorSelectedTargets:targets[r.id],fromPreviousPilot:true}));
// New short original publisher quotations transcribed from pages inspected on
// 11 Oct 2026. These are not complete reviews and not independently labelled.
const newRows=[
 {id:'p153_which_toaster',category:'toaster',publisher:'Which?',url:'https://www.which.co.uk/reviews/toasters/2-slice-lite-26205',title:'Dualit 2 Slice Lite 26205 review',text:'Dualit 2 Slice Lite 26205',authorSelectedTargets:['Dualit 2 Slice Lite 26205'],fromPreviousPilot:false},
 {id:'p153_tomsguide_breville',category:'coffee_machine',publisher:"Tom's Guide",url:'https://www.tomsguide.com/home/coffee-makers/breville-luxe-brewer-review',title:'Breville Luxe Brewer review',text:'The Breville Luxe Brewer makes coffee incredibly quickly.',authorSelectedTargets:['Breville Luxe Brewer'],fromPreviousPilot:false},
 {id:'p153_tomsguide_delonghi',category:'coffee_machine',publisher:"Tom's Guide",url:'https://www.tomsguide.com/home/coffee-makers/no-you-dont-need-to-spend-usd1-000-on-an-espresso-machine-i-recommend-these-4-breville-and-delonghi-models-for-delicious-coffee-at-home',title:'Affordable espresso machines reviewed',text:"De'Longhi Stilosa",authorSelectedTargets:["De'Longhi Stilosa"],fromPreviousPilot:false}
];
const cases=[...earlierRows,...newRows];
const rows=cases.map(c=>{
 const input={document:{text:c.text,sha256:sha(c.text),source:{id:c.id,originalDocumentId:c.id,
  url:c.url,title:c.title,role:'original_product_test'}}};
 const start=performance.now(),g=discoverEntityInventory153(input),milliseconds=performance.now()-start;
 const baselineLiterals=g.baseline152.possibleSurfaces.map(s=>s.span.literal),newLiterals=g.mentions.map(m=>m.span.literal);
 const observed=c.authorSelectedTargets.map(name=>({name,exactSourceSpan:c.text.includes(name),
  baseline152:baselineLiterals.includes(name),phase153:newLiterals.includes(name)}));
 return {id:c.id,sourceKind:'real_publisher_short_excerpt_not_full_review',category:c.category,publisher:c.publisher,
  sourceUrl:c.url,sourceHostname:new URL(c.url).hostname,excerptSha256:sha(c.text),originalExcerpt:c.text,
  sourceReusedFromPriorPhase:c.fromPreviousPilot,authorSelectedTargets:observed,
  phase152Candidates:baselineLiterals,phase153Candidates:g.mentions.map(m=>({literal:m.span.literal,offset:m.span.start,
    kind:m.kind,signals:m.signals,baselineIndexed:m.recognizedByBaseline})),
  phase152Decisions:g.baseline152.links.map(l=>({surface:l.mention.literal,decision:l.decision})),
  phase153Decisions:g.links.map(l=>({surface:l.mention.literal,decision:l.decision})),
  runtimeMsSingleNonBenchmarkedRun:Math.round(milliseconds*1000)/1000,
  originalFullReviewEvaluated:false,independentHumanLabels:0,
  canonicalWriteAuthorized:false,rankingAuthorized:false};
});
const sums={selectedTargets:rows.flatMap(r=>r.authorSelectedTargets).length,
 baseline152ExactPatternMatches:rows.flatMap(r=>r.authorSelectedTargets).filter(x=>x.baseline152).length,
 phase153ExactPatternMatches:rows.flatMap(r=>r.authorSelectedTargets).filter(x=>x.phase153).length,
 publisherShortExcerpts:rows.length,previouslyViewedExcerpts:earlierRows.length,newlyCheckedExcerpts:newRows.length,
 uniquePublisherHostnames:new Set(rows.map(r=>r.sourceHostname)).size,
 missedAuthorSelectedTargets:rows.flatMap(r=>r.authorSelectedTargets.filter(x=>!x.phase153).map(x=>({id:r.id,target:x.name})))};
// Minimal evaluation against a separately declared, constructed negative control;
// no independent annotation or valid accuracy estimates are inferred.
const negativeExamples=[
 {id:'lab_mode',text:'HDR 1000 and Heavy Duty 60 were laboratory settings.',rejected:['HDR 1000','Heavy Duty 60']},
 {id:'measurement',text:'LG C6 was tested at 120 Hz and used 3200 rpm.',rejected:['120 Hz','3200']},
 {id:'unknown_two_word',text:'Digital Power was improved after cleaning.',rejected:['Digital Power']},
 {id:'component',text:'The Steam Wand was wiped down after testing.',rejected:['Steam Wand']}
].map(c=>{const input={document:{text:c.text,sha256:sha(c.text),source:{id:c.id,originalDocumentId:c.id,
 url:`https://example.org/constructed/${c.id}`,title:'Constructed',role:'original_product_test'}}};
 const g=discoverEntityInventory153(input);return {...c,proposed:g.mentions.map(m=>m.span.literal),
 wrongNominations:c.rejected.filter(r=>g.mentions.some(m=>m.span.literal===r)),developerCreated:true};});
const report={phase:153,version:'4.77-phase153',date:'2026-10-11',diagnosticType:'developer_selected_short_original_excerpts_and_constructed_negative_controls',
 independentGoldAnnotations:0,sourceDisjointIndependentHoldout:false,fullProfessionalReviewsEvaluated:0,
 originalPublisherPagesAttestedAsStoredSnapshots:false,precision:null,recall:null,accuracy:null,
 disclaimers:['author-selected explicit name surfaces, not a random sample of all mentions',
 'no independent annotators, frozen pre-tuning protocol or publisher-disjoint gold split',
 'source URLs and hashes ground supplied excerpt bytes, not a live publisher snapshot',
 'Phase153 is an opt-in advisory candidate layer; no ranking or canonical DB integration'],
 summary:sums,rows,constructedNegativeControls:negativeExamples};
writeFileSync('PHASE153-EDITORIAL-AND-ADVERSARIAL-DIAGNOSTIC.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary:sums,negativeControls:negativeExamples.map(x=>[x.id,x.wrongNominations])},null,2));
