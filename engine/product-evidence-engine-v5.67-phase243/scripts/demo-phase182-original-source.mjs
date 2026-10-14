/** Metadata-only pilot against externally inspected original professional pages.
 * NOT a software web crawl, measurements import or product rank. */
import {writeFileSync} from 'node:fs';
import {planResearchGaps182,executeResearchGaps182,openResearchJournal182,appendResearchRun182}
 from '../dist/src/phase182_gap_research_orchestrator.js';
const asOf='2026-10-12T21:00:00Z';
const decision={phase:181,language:'en',source:'signed_product_knowledge',status:'research_required',
 firstLayer:[],visibleCautions:[],rankInputFingerprint:'pilot_english_need_scope',
 knowledgeRevision:'pilot_unreviewed',policyRevision:'not_authorized',ranked:[],held:[],
 researchGaps:[{kind:'missing_product',reference:'miele_boost_cx1_cat_dog',action:'Study exact variant'},
  {kind:'missing_test',reference:'shark_wandvac:stairs',action:'Study exact test scope'}],
 coverage:{discovered:0,reviewed:0,notYetReviewed:0,marketCoverageComplete:false},
 rankingsPrecomputed:false,researchAccessPerformed:false,scientificValidityNotEstablishedBySignature:true};
const variant=(variantId,id,url)=>({variantId,sourceRegistry:'operator_curated_unverified',candidates:[{
 id,sourceId:'rtings',url,exactVariantId:variantId,originalTestId:null,
 lineageAttestationReference:null,kind:'original_professional_test',
 publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'}],existing:[]});
const sources=[variant('miele_boost_cx1_cat_dog','rtings_boost_cx1','https://www.rtings.com/vacuum/reviews/miele/boost-cx1'),
 variant('shark_wandvac','rtings_wandvac','https://www.rtings.com/vacuum/reviews/shark/wandvac')];
const policy={sourceId:'rtings',host:'www.rtings.com',basis:'unknown',rightsDocumentId:null,
 rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,permittedOperations:[],
 robots:'unknown',robotsCheckedAt:null,websiteTerms:'unknown',termsCheckedAt:null,commercialUseReviewed:false};
const plan=planResearchGaps182({decision,categoryId:'vacuum',categoryLabel:'Vacuum cleaners',market:'uk',asOf});
const run=await executeResearchGaps182({plan,categoryCatalog:[{categoryId:'vacuum',label:'Vacuum cleaners',aliases:[],status:'reviewed',registryVersion:1}],
 workers:[],operatorSources:sources,sourcePolicies:[policy]});
const start=openResearchJournal182('vacuum');const journal=appendResearchRun182({journal:start,plan,run,expectedRevision:0,expectedHash:start.snapshotHash});
const out={pilot:'original_professional_source_metadata_only',sources:sources.map(s=>({variantId:s.variantId,url:s.candidates[0].url})),
 scientificResearchAccessByPEE:false,sourceLicensingUnknown:true,methodComparabilityApproved:false,
 actualMeasuredValueExtracted:false,rankingAuthorized:false,plan,run,journal};
writeFileSync('evaluation/phase182/original_source_pilot.json',JSON.stringify(out,null,2)+'\n');
process.stdout.write(JSON.stringify({jobs:plan.jobs.length,statuses:run.outcomes.map(x=>x.status),reads:run.sourceRetrievalAttempts,ranked:run.rankingAuthorized})+'\n');
