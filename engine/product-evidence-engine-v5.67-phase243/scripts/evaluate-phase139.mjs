import {readFileSync,writeFileSync} from 'node:fs';
import {readUnmarkedEnglish139} from '../dist/src/phase139_unmarked_english_candidate_reader.js';
const rows=JSON.parse(readFileSync('research/phase138_original_review_pilot/PHASE138-ORIGINAL-EXCERPT-PILOT.json','utf8'));
const cases=rows.map(r=>{
 const prediction=readUnmarkedEnglish139({document:{text:r.text,sha256:r.excerptSha256,
  source:{id:`snippet_${r.id}`,originalDocumentId:`snippet_${r.id}`,url:r.url,title:r.reviewedProductName,role:'original_product_test'}},
  pageIdentity:{reviewedProductId:r.reviewedProductFamilyId,reviewedVariantId:r.reviewedProductFamilyId,
   reviewedAliases:r.approvedNameAliases}});
 const fields={id:r.id,publisher:r.publisherGroupId,url:r.url,excerptSha256:r.excerptSha256,
  inputContainedDeveloperSubjectSpans:false,inputContainedDeveloperObjectSpans:false,
  inputContainedDeveloperRelationLabels:false,
  mentions:prediction.mentions.map(m=>({literal:m.literal,type:m.type,span:m.span,identityClaim:m.identityClaim})),
  pairs:prediction.pairs.map(p=>({status:p.status,reasons:p.reasons,subject:prediction.mentions.find(m=>m.id===p.subjectMentionId)?.literal,
   object:prediction.mentions.find(m=>m.id===p.objectMentionId)?.literal??null,pattern:p.pattern})),
  reviewedPageIdentityWasSupplied:true,scientificTruthValidated:false};
 return fields;
});
const statuses={};for(const c of cases)for(const p of c.pairs)statuses[p.status]=(statuses[p.status]??0)+1;
const out={phase:139,version:'4.63-phase139',date:'2026-10-11',
 originalExcerptSources:3,originalShortExcerpts:cases.length,independentlyAnnotatedSources:0,
 evaluatedOnPreselectedPhase138Excerpts:true,
 relationCandidateSpansManuallySuppliedToReader:false,
 reviewedPageAliasesStillProvided:true,
 modelPrecisionOrRecallOnUnseenReviews:null,
 originalFullArticleSnapshots:0,
 scientificFactsAdded:0,rankingAuthorized:false,canonicalWriteAuthorized:false,
 byStatus:statuses,cases};
writeFileSync('PHASE139-UNMARKED-ORIGINAL-EXCERPT-DIAGNOSTIC.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({excerpts:cases.length,byStatus:statuses,
 automaticallyProposedMentionCount:cases.reduce((sum,c)=>sum+c.mentions.length,0)},null,2));
