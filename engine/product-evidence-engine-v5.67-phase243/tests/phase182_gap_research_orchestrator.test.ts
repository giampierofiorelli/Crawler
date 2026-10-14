import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {planResearchGaps182,executeResearchGaps182,type ResearchPlan182} from '../src/phase182_gap_research_orchestrator.js';
import type {DynamicDecision181,ResearchGap181} from '../src/phase181_dynamic_knowledge_ranking.js';
import type {WebCandidate,WebSourcePolicy} from '../src/web_evidence_acquisition.js';
import type {SourceTransport} from '../src/approved_web_reader.js';
import type {LocalCapabilityWorker} from '../src/category_research_execution.js';

const asOf='2026-10-12T20:00:00Z';
const gap=(kind:ResearchGap181['kind'],reference:string):ResearchGap181=>({kind,reference,action:'Investigate with original specialist sources.'});
function decision(gaps:readonly ResearchGap181[]):DynamicDecision181{return {
 phase:181,language:'en',source:'signed_product_knowledge',status:'research_required',
 firstLayer:[],visibleCautions:[],rankInputFingerprint:'canonical_intent',knowledgeRevision:'v1',policyRevision:'p1',
 ranked:[],held:[],researchGaps:gaps,coverage:{discovered:0,reviewed:0,notYetReviewed:0,marketCoverageComplete:false},
 rankingsPrecomputed:false,researchAccessPerformed:false,scientificValidityNotEstablishedBySignature:true
};}
const make=(gaps:readonly ResearchGap181[],maxJobs?:number)=>planResearchGaps182({decision:decision(gaps),categoryId:'vacuum',categoryLabel:'Vacuum cleaners',market:'uk',asOf,maxJobs});
const inputs={categoryCatalog:[{categoryId:'vacuum',label:'Vacuum cleaners',aliases:[],status:'reviewed' as const,registryVersion:1}],workers:[],operatorSources:[],sourcePolicies:[]};
const clone=<T>(v:T):T=>JSON.parse(JSON.stringify(v));
const sha=(v:string)=>createHash('sha256').update(v).digest('hex');
function candidate(variant='model_a'):WebCandidate{return {id:'professional_1',sourceId:'expert_org',url:'https://evidence.research.org/reviews/model-a',exactVariantId:variant,
 originalTestId:'original_test_123',lineageAttestationReference:'reviewer_original_test_123',kind:'original_professional_test',publishedAt:null,updatedAt:null,metadataOrigin:'human_supplied'};}
function policy(approved=false):WebSourcePolicy{return {sourceId:'expert_org',host:'evidence.research.org',basis:approved?'written_permission':'unknown',
 rightsDocumentId:approved?'operator_review_1':null,rightsDocumentUrl:approved?'https://evidence.research.org/permissions':null,
 reviewedBy:approved?'legal_reviewer':null,reviewedAt:approved?'2026-10-12T19:00:00Z':null,validUntil:approved?'2026-11-12T00:00:00Z':null,
 permittedOperations:approved?['metadata_discovery','page_retrieval','local_analysis','fact_storage','public_citation']:[],
 robots:approved?'allowed':'unknown',robotsCheckedAt:approved?asOf:null,websiteTerms:approved?'reviewed_permitted':'unknown',
 termsCheckedAt:approved?asOf:null,commercialUseReviewed:approved};}
const sources=(variant='model_a')=>[{variantId:variant,sourceRegistry:'operator_curated_unverified' as const,candidates:[candidate(variant)],existing:[]}];

test('same gap set in different order gives stable deterministic plan',()=>{
 const g=[gap('missing_test','model_a:carpet_pickup'),gap('missing_product','model_b'),gap('missing_criterion','stairs')];
 assert.deepEqual(make(g).jobs,make(g.slice().reverse()).jobs);
 assert.equal(make(g).planHash,make(g.slice().reverse()).planHash);
});
test('deduplicates a research gap without suppressing another criterion',()=>{
 const p=make([gap('missing_test','model_a:carpet_pickup'),gap('missing_test','model_a:carpet_pickup'),gap('missing_test','model_a:pet_hair')]);
 assert.equal(p.jobs.length,2);assert.notEqual(p.jobs[0].jobId,p.jobs[1].jobId);
});
test('enforces budget deterministically',()=>{
 const p=make([gap('missing_product','model_a'),gap('missing_criterion','accessibility'),gap('missing_product','model_b')],1);
 assert.equal(p.jobs.length,1);assert.equal(p.jobs[0].gapKind,'missing_criterion');assert.equal(p.omittedByBudget,2);
});
test('maps exact variant and unmeasured dimension without losing identity',()=>{
 const j=make([gap('missing_test','model_a:carpet_pickup')]).jobs[0];
 assert.equal(j.exactVariantId,'model_a');assert.equal(j.criterionId,'carpet_pickup');assert.equal(j.kind,'exact_variant_source_research');
});
test('does not treat clarification as a web research authorization',async()=>{
 const p=make([gap('unconfirmed_need','vacuum')]);const r=await executeResearchGaps182({plan:p,...inputs});
 assert.equal(r.outcomes[0].status,'clarification_needed');assert.equal(r.sourceRetrievalAttempts,0);
 assert.equal(r.canonicalKnowledgeUpdated,false);assert.equal(r.rankingAuthorized,false);
});
test('category research executes existing Phase129/179 workers, not a new ontology',async()=>{
 let invoked=0;
 const workers:LocalCapabilityWorker[]=[{execution:'local_only',capability:'coverage_analysis',
  async run(){invoked++;return {outcome:'no_sufficient_material',sourceReferences:[],questions:[],reasonCode:'no_sources'};}}];
 const p=make([gap('missing_criterion','unknown_need')]);
 const r=await executeResearchGaps182({plan:p,...inputs,workers,existingWorkerBudget:1});
 assert.equal(invoked,1);assert.equal(r.categoryExecution?.purpose,'category_research_executed_not_verified');
 assert.equal(r.outcomes[0].status,'worker_attempted_pending_review');assert.equal(r.reviewReceiptsIssued,0);
});
test('category without workers returns missing-worker status',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('new_category','air_purifier')]),...inputs});
 assert.equal(r.outcomes[0].status,'category_worker_missing');assert.equal(r.canonicalKnowledgeUpdated,false);
});
test('unknown product generates a discoverable task without made-up source evidence',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('missing_product','model_a')]),...inputs});
 assert.equal(r.outcomes[0].status,'no_curated_sources');assert.deepEqual(r.outcomes[0].discoveryRecords,[]);
});
test('realistic original-source candidate with absent legal clearance stays metadata only',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('missing_product','model_a')]),...inputs,
  operatorSources:sources(),sourcePolicies:[policy(false)]});
 assert.equal(r.sourceRetrievalAttempts,0);assert.equal(r.outcomes[0].status,'source_policy_blocked');
 assert.equal(r.outcomes[0].discoveryRecords[0].action,'metadata_only');
});
test('operator authorization is mandatory for even one HTTP read',async()=>{
 await assert.rejects(executeResearchGaps182({plan:make([gap('missing_product','model_a')]),...inputs,
  operatorSources:sources(),sourcePolicies:[policy(true)],maxSourceReads:1}),/phase182_read_requires/);
});
test('rights-approved source still defaults to zero network reads',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('missing_product','model_a')]),...inputs,
  operatorSources:sources(),sourcePolicies:[policy(true)]});
 assert.equal(r.sourceRetrievalAttempts,0);assert.equal(r.outcomes[0].discoveryRecords[0].action,'retrieve_for_research');
 assert.equal(r.rankingAuthorized,false);
});
test('permitted source and robots allow yield only digests pending independent review',async()=>{
 let gets=0;
 const transport:SourceTransport={async get(url){gets++;
  if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',body:'User-agent: *\nAllow: /'};
  return {status:200,finalUrl:url,contentType:'text/html',body:'<html>Original specialist observations awaiting independent validation.</html>'};
 }};
 const r=await executeResearchGaps182({plan:make([gap('missing_test','model_a:carpet_pickup')]),...inputs,
  operatorSources:sources(),sourcePolicies:[policy(true)],allowSourceReads:true,maxSourceReads:1,transport});
 assert.equal(gets,2);assert.equal(r.sourceRetrievalAttempts,1);assert.equal(r.sourcePagesQuarantined,1);
 assert.equal(r.outcomes[0].status,'source_research_quarantined');
 assert.match(r.outcomes[0].discoveryRecords[0].contentSha256!,/^[a-f0-9]{64}$/);
 assert.equal(r.sourceBodiesRetained,false);assert.equal(r.canonicalKnowledgeUpdated,false);
 assert.equal(JSON.stringify(r).includes('Original specialist observations'),false);
});
test('robots disallow causes no page download or evidence',async()=>{
 let gets=0;const transport:SourceTransport={async get(url){gets++;return {status:200,finalUrl:url,
  contentType:'text/plain',body:'User-agent: *\nDisallow: /reviews/'};}};
 const r=await executeResearchGaps182({plan:make([gap('missing_product','model_a')]),...inputs,
  operatorSources:sources(),sourcePolicies:[policy(true)],allowSourceReads:true,maxSourceReads:1,transport});
 assert.equal(gets,1);assert.equal(r.sourcePagesQuarantined,0);assert.equal(r.outcomes[0].status,'source_retrieval_blocked');
 assert.equal(r.outcomes[0].discoveryRecords[0].contentSha256,null);
});
test('wrong variant cannot be rescued by source metadata from another variant',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('missing_product','model_a')]),...inputs,
 operatorSources:[{variantId:'model_a',sourceRegistry:'operator_curated_unverified',candidates:[candidate('model_b')],existing:[]}],
 sourcePolicies:[policy(true)]});
 assert.equal(r.outcomes[0].discoveryRecords[0].action,'reject_mismatch');
 assert.equal(r.sourceRetrievalAttempts,0);
});
test('old/stale knowledge triggers category review work, not a false ranking',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('stale_knowledge','observations_v1')]),...inputs});
 assert.equal(r.outcomes[0].kind,'category_research');assert.equal(r.rankingAuthorized,false);
});
test('signed evidence failure goes to independent reviewer, not auto re-signing',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('need_review','vacuum')]),...inputs});
 assert.equal(r.outcomes[0].kind,'independent_review');assert.equal(r.outcomes[0].status,'awaiting_independent_review');
});
test('plan tamper is rejected before worker execution',async()=>{
 const p=clone(make([gap('missing_product','model_a')]));p.jobs[0].exactVariantId='model_b';
 await assert.rejects(executeResearchGaps182({plan:p,...inputs}),/tampered/);
});
test('forged plan hash cannot authorize ranking or source rights',async()=>{
 const p=clone(make([gap('missing_product','model_a')]));(p as any).rankingAuthorized=true;
 await assert.rejects(executeResearchGaps182({plan:p,...inputs}),/invalid_execution/);
});
test('malformed reference and injected category ids fail closed',()=>{
 assert.throws(()=>make([gap('missing_test','model_a:not/clean')]),/bad_variant_or_criterion/);
 assert.throws(()=>planResearchGaps182({decision:decision([]),categoryId:'../../x',categoryLabel:'Vacuum cleaners',market:'uk',asOf}),/bad_plan_input/);
});
test('research gap priorities do not alter the already computed ranking',()=>{
 const d=decision([gap('missing_product','model_a')]);d.ranked=[{variantId:'x',name:'Synthetic',rank:1,scorePoints:9000,originalTestIds:[],sourceUrls:[]}];
 const original=clone(d);make(d.researchGaps);assert.deepEqual(d,original);
});
test('metadata-only source access remains possible without importing any model weights',async()=>{
 const r=await executeResearchGaps182({plan:make([gap('missing_product','model_a')]),...inputs,
 operatorSources:sources(),sourcePolicies:[policy(false)]});
 assert.ok(r.runHash.match(/^[a-f0-9]{64}$/));
 assert.equal(r.sourceBodiesRetained,false);assert.equal(r.reviewReceiptsIssued,0);
});
test('rejects duplicate operator registry identities',async()=>{
 await assert.rejects(executeResearchGaps182({plan:make([]),...inputs,operatorSources:[...sources(),...sources()]}),/invalid_operator_registry/);
});
test('bounded source reads cannot be used as an unrestricted spider',async()=>{
 await assert.rejects(executeResearchGaps182({plan:make([]),...inputs,allowSourceReads:true,maxSourceReads:6}),/read_requires/);
});
test('missing all gaps is a valid no-work result, not ranking-ready',async()=>{
 const r=await executeResearchGaps182({plan:make([]),...inputs});
 assert.equal(r.outcomes.length,0);assert.equal(r.rankingAuthorized,false);assert.equal(r.sourceRetrievalAttempts,0);
});

test('exact variant with colon is kept intact when locating missing test',()=>{
 const j=make([gap('missing_test','miele:boost_cx1:carpet_pickup')]).jobs[0];
 assert.equal(j.exactVariantId,'miele:boost_cx1');assert.equal(j.criterionId,'carpet_pickup');
});
import {openResearchJournal182,appendResearchRun182} from '../src/phase182_gap_research_orchestrator.js';
test('durable journal saves research run WITHOUT promoting product evidence',async()=>{
 const p=make([gap('missing_product','model_a')]);const r=await executeResearchGaps182({plan:p,...inputs});
 const start=openResearchJournal182('vacuum');const j=appendResearchRun182({journal:start,plan:p,run:r,expectedRevision:0,expectedHash:start.snapshotHash});
 assert.equal(j.revision,1);assert.equal(j.scientificClaimsReviewed,false);assert.equal(j.rankingAuthorized,false);
 assert.equal(j.receipts[0].statuses[0].status,'no_curated_sources');assert.equal(j.receipts[0].runHash,r.runHash);
});
test('journal retries are idempotent on same run snapshot',async()=>{
 const p=make([gap('missing_product','model_a')]),r=await executeResearchGaps182({plan:p,...inputs});
 const begin=openResearchJournal182('vacuum');const first=appendResearchRun182({journal:begin,plan:p,run:r,expectedRevision:0,expectedHash:begin.snapshotHash});
 const second=appendResearchRun182({journal:first,plan:p,run:r,expectedRevision:1,expectedHash:first.snapshotHash});
 assert.deepEqual(first,second);
});
test('journal rejects stale writes and modified history',async()=>{
 const p=make([gap('missing_product','model_a')]),r=await executeResearchGaps182({plan:p,...inputs});
 const begin=openResearchJournal182('vacuum');const first=appendResearchRun182({journal:begin,plan:p,run:r,expectedRevision:0,expectedHash:begin.snapshotHash});
 assert.throws(()=>appendResearchRun182({journal:first,plan:p,run:r,expectedRevision:0,expectedHash:begin.snapshotHash}),/stale_journal/);
 const forged=clone(first);forged.receipts[0].statuses[0].status='source_research_quarantined';
 assert.throws(()=>appendResearchRun182({journal:forged,plan:p,run:r,expectedRevision:1,expectedHash:first.snapshotHash}),/corrupted_journal/);
});
test('journal refuses a fabricated evidence-review result',async()=>{
 const p=make([gap('missing_product','model_a')]),r=await executeResearchGaps182({plan:p,...inputs});
 const begin=openResearchJournal182('vacuum'),forged=clone(r);(forged as any).rankingAuthorized=true;
 assert.throws(()=>appendResearchRun182({journal:begin,plan:p,run:forged,expectedRevision:0,expectedHash:begin.snapshotHash}),/untrusted_run/);
});
