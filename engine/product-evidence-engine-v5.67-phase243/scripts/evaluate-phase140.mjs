import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readUnmarkedEnglish139} from '../dist/src/phase139_unmarked_english_candidate_reader.js';
import {readBoundedEnglishRecall140} from '../dist/src/phase140_bounded_english_recall.js';
const examples=JSON.parse(readFileSync('research/phase140_original_excerpt_diagnostic/PHASE140-NEW-PUBLISHER-EXCERPTS.json','utf8'));
const sha=t=>createHash('sha256').update(t).digest('hex');
const rows=examples.examples.map(e=>{
 const input={document:{text:e.text,sha256:sha(e.text),source:{id:e.id,originalDocumentId:e.id+'_short_excerpt',url:e.url,title:'Manually selected short attributed excerpt; not a complete authenticated snapshot',role:'original_product_test'}},pageIdentity:{reviewedProductId:e.reviewedProductId,reviewedVariantId:e.reviewedVariantId,reviewedAliases:e.reviewedAliases}};
 const prior=readUnmarkedEnglish139(input),current=readBoundedEnglishRecall140(input);
 return {id:e.id,publisher:e.publisher,url:e.url,sha256:input.document.sha256,
  previous139Pairs:prior.pairs.length,new140Proposals:current.proposals.length,
  cueCount:current.structuralCueCount,manualExpectation:e.expectedStatus,
  outcomes:current.proposals.map(p=>({status:p.status,structure:p.structure,reasons:p.reasons,
   subject:p.subjectSpan?e.text.slice(p.subjectSpan.start,p.subjectSpan.end):null,
   predicate:e.text.slice(p.predicateSpan.start,p.predicateSpan.end),
   object:p.objectSpan?e.text.slice(p.objectSpan.start,p.objectSpan.end):null,
   sourceSpanEvidence:e.text.slice(p.evidenceSpan.start,p.evidenceSpan.end),
   conditions:p.conditionSpans.map(s=>e.text.slice(s.start,s.end)),
   canonicalWriteAuthorized:false,rankingAuthorized:false})),
  matchesDeveloperExpectation:current.proposals[0]?.status===e.expectedStatus};
});
const out={phase:140,comparison:'baseline139-versus-structural-supplement',labelOrigin:'developer_own_interpretation_not_independent',
 neverCountAsStatisticalAccuracy:true,benchmarkReady:false,independentlyAnnotatedCases:0,realHoldoutAccuracy:null,
 examples:rows};
writeFileSync('PHASE140-NEW-ORIGINAL-EXCERPT-DIAGNOSTIC.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({cases:rows.length,baselinePairs:rows.reduce((n,r)=>n+r.previous139Pairs,0),
 newProposals:rows.reduce((n,r)=>n+r.new140Proposals,0),matchesDeveloperExpectation:rows.filter(x=>x.matchesDeveloperExpectation).length,
 statuses:rows.map(r=>[r.id,r.outcomes.map(x=>x.status)])},null,2));
