import {createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {investigateCategory129,stageCategoryObservations129,approveGrowth129,
  interpretAfterGrowth129,nativeMeasurementNameObserver129} from '../dist/src/phase129_category_growth_cycle.js';
const sum=t=>createHash('sha256').update(t).digest('hex');
const asOf='2026-10-11T14:21:00+01:00';
const label='portable air cleaner';
const paper='Most portable air cleaners are rated according to their clean air delivery rate (CADR). '+
 'This number is intended to help consumers select an air cleaner based on the size of the area it will be placed in. '+
 'The higher the CADR, the more particles the air cleaner will remove and the larger the area it can serve.';
const source={id:'epa_method',url:'https://www.epa.gov/indoor-air-quality-iaq/guide-air-cleaners-home',
 title:'US EPA Guide to Air Cleaners in the Home',originalDocumentId:'epa_air_cleaner_guide',
 role:'original_expert_method'};
const b={categoryId:'portable_air_cleaner',schemaVersion:1,
 aliases:['portable air cleaner','air purifier','purificatore aria'],sources:[],concepts:[],quality:[],distinctions:[]};
const plan=await investigateCategory129({label,catalog:[],asOf,workers:[]});
const batch=await stageCategoryObservations129({brain:b,documents:[{source,text:paper,
 contentSha256:sum(paper),observedAt:asOf,
 permission:{fetchAllowed:true,factExtractionAllowed:true,publicCitationAllowed:true}}],
 extractor:nativeMeasurementNameObserver129(),asOf});
const receipt={reviewId:'fixture_review',reviewerId:'simulated_reviewer',reviewScope:'category_definition',sourceRefIds:['epa_method']};
const x=approveGrowth129({brain:b,batch,
 approvals:batch.claims.map(c=>({discoveryId:c.discovery.discoveryId,receipt})),
 authority:{verify:r=>r.reviewerId==='simulated_reviewer'}});
const q=interpretAfterGrowth129(x.brain,'Which air purifier has the highest CADR?');
const report={phase:129,fixtureNotIndependentCategoryResearch:true,
 originalDocumentManuallyProvided:true,sourceUrl:source.url,
 originalCategoryRoute:plan.research.plan.route.status,
 pendingResearchTasks:plan.research.plan.tasks.length,
 actualLiveWebCalls:0,
 observedTermCount:batch.claims.length,
 observedTerms:batch.claims.map(c=>c.discovery.concept.label),
 rawArticleBodyRetainedInBatch:batch.sourceBodiesRetained,
 simulatedReviewNotProductionAuthentication:true,
 approvedConceptCount:x.approvedCount,
 snapshotChanged:x.newSnapshot!==x.oldSnapshot,
 newQueryMentions:q.reviewedConceptMentions,
 newResearchEvidenceKeys:q.researchEvidenceKeys,
 commercialProductPerformanceAvailable:false,
 rankingAuthorized:q.rankingAuthorized,
 transactionCommitted:x.transactionCommitted};
writeFileSync('PHASE129-EPA-COLD-START-TRACE.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
