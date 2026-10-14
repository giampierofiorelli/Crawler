import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {analyzeEphemeralBatch195,type ReviewIn195} from '../src/phase195_ephemeral_batch_lineage.js';
import {emptyLedger193,recordScreening193,type ScreeningLedger193,type SourceRevision193} from '../src/phase193_screening_memory.js';
import {loadPublisherSeed196,validatePublisherSeed196,planSourceReviews196,
 linkSourceQueueToResearch182,type PublisherSeed196,type CandidateAnnotation196} from '../src/phase196_source_intelligence.js';
import {type ResearchPlan182} from '../src/phase182_gap_research_orchestrator.js';
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const corpus='A practical engineering evaluation of appliance controls and timed performance records was performed in a configured laboratory setup. '.repeat(8);
const rev=(id:string,url:string,bytes:string,field:string|null='noise',market='UK'):SourceRevision193=>({
 sourceId:id,url,contentHash:digest(bytes),contentBasis:'publisher_bytes',policyVersion:'method_v1',
 market,category:'home_appliances',variantId:'model_one',field,observedAt:'2026-10-13T08:00:00Z',
 classificationRevision:'classification_v1'});
const review=(sourceId:string,url:string,category='home_appliances',variantId='model_one',text=corpus):ReviewIn195=>({
 sourceId,url,category,variantId,transientText:text,textBasis:'analyst_annotation',dates:[],attribution:[],measurements:[]});
const mkBatch=(reviews:ReviewIn195[])=>analyzeEphemeralBatch195({batchId:'batch_196',analyzedAt:'2026-10-13T08:00:00Z',reviews});
const ann=(sourceId:string,role:CandidateAnnotation196['materialRole']='original_instrumental_claim',field='noise',market='UK'):
CandidateAnnotation196=>({sourceId,materialRole:role,field,market,protocol:'rig_v1',sourceRevision:null,freshPublisherBytes:null});
const seedPath='data/phase196/publisher-method-seed.json';
const seed=()=>loadPublisherSeed196(seedPath);
const plan=(reviews:ReviewIn195[],annotations:CandidateAnnotation196[],ledger=emptyLedger193(),maxQueue?:number)=>
 planSourceReviews196({batch:mkBatch(reviews),annotations,seed:seed(),ledger,maxQueue});
const W='https://www.which.co.uk/reviews/test/example';
const U='https://small-lab.example.org/reviews/model_one';
const R='https://www.rtings.com/monitor/reviews/model';
const M='https://affiliate.example.net/best-models';

test('196 seed is curated, non-authoritative and contains 6 profiles',()=>{
 const s=seed();assert.equal(s.profiles.length,6);
 assert.equal(s.automaticallyTrustedTestEvents,false);assert.equal(s.automaticOriginalityAttribution,false);
 assert.equal(s.profiles.find(x=>x.publisherId==='energystar')?.noGlobalWhitelist,true);
});
test('196 rejecting injected profile authority keys',()=>{
 const s=structuredClone(seed()) as unknown as Record<string,unknown>;
 (s.profiles as unknown as Record<string,unknown>[])[0].autoAdmitExperiments=true;
 assert.throws(()=>validatePublisherSeed196(s as unknown as PublisherSeed196),/unexpected_schema/);
});
test('196 rejecting false profile reliability/proof claim',()=>{
 const s=structuredClone(seed());s.profiles[0].perArticleTestAuthRequired=false as true;
 assert.throws(()=>validatePublisherSeed196(s),/unsafe_profile/);
});
test('196 rejecting unbounded method statement URLs',()=>{
 const s=structuredClone(seed());s.profiles[0].methodStatementUrls=['http://invalid.org'] as string[];
 assert.throws(()=>validatePublisherSeed196(s),/unsafe_profile/);
});
test('196 seed loading cannot accept huge file',()=>{
 const dir=mkdtempSync(join(tmpdir(),'pee196_seed'));
 try{const f=join(dir,'s.json');writeFileSync(f,' '.repeat(250001));assert.throws(()=>loadPublisherSeed196(f),/too_large/);}
 finally{rmSync(dir,{recursive:true,force:true});}
});
test('196 known relevant method gets search priority but is not proof',()=>{
 const p=plan([review('which_1',W)],[ann('which_1')]);const a=p.rows[0];
 assert.equal(a.publisherId,'which');assert.equal(a.methodCategoryScopeMatched,true);assert.equal(a.methodMarketScopeMatched,true);
 assert.equal(a.priorityLane,'method_scope_review');assert.equal(a.independentTestAdmitted,false);
 assert.equal(a.fieldProtocolMethodAuthenticated,false);assert.equal(a.previousScreeningVerdict,'fresh_publisher_bytes_required');
 assert.equal(p.verifiedOriginalExperiments,0);assert.equal(p.publicRankingAllowed,false);
});
test('196 publisher name spoofing via hostname does not match',()=>{
 const p=plan([review('spoof','https://which.co.uk.attacker.org/review')],[ann('spoof')]);
 assert.equal(p.rows[0].publisherId,null);assert.equal(p.rows[0].priorityLane,'new_source_probe');
});
test('196 publisher subdomain matches only suffix with label boundary',()=>{
 const p=plan([review('sub','https://reviews.which.co.uk/review')],[ann('sub')]);
 assert.equal(p.rows[0].publisherId,'which');
});
test('196 known editor outside category gets no inherited authority',()=>{
 const p=plan([review('irrelevant',R,'coffee_machines')],[ann('irrelevant')]);
 assert.equal(p.rows[0].publisherId,'rtings');assert.equal(p.rows[0].methodCategoryScopeMatched,false);
 assert.equal(p.rows[0].priorityLane,'unscoped_review');assert.deepEqual(p.rows[0].practiceClaims,[]);
});
test('196 generic market label does not imply exact review-market coverage',()=>{
 const p=plan([review('nc','https://www.notebookcheck.net/laptop/review','laptops')],[ann('nc','original_instrumental_claim','performance','UK')]);
 assert.equal(p.rows[0].methodMarketScopeMatched,false);assert.equal(p.rows[0].priorityLane,'unscoped_review');
});
test('196 new independent-test claimant is discoverable and reviewable',()=>{
 const p=plan([review('small_lab',U)],[ann('small_lab')]);
 assert.equal(p.rows[0].priorityLane,'new_source_probe');assert.equal(p.reviewQueue.length,1);
 assert.equal(p.rows[0].independentTestAdmitted,false);
});
test('196 unknown source has exploration guarantee in small mixed research queue',()=>{
 const r=[review('known_b',W),review('known_a',W+'?q=2'),review('small_lab',U)];
 const p=plan(r,r.map(x=>ann(x.sourceId)),emptyLedger193(),2);
 assert.equal(p.reviewQueue.length,2);assert.equal(p.reviewQueue[1].sourceId,'small_lab');
 assert.equal(p.explorationIncluded,true);assert.equal(p.unqueuedSourceCount,1);
});
test('196 exploration disappears if none eligible, not a forced quota',()=>{
 const p=plan([review('known',W)],[ann('known')],emptyLedger193(),2);
 assert.equal(p.explorationIncluded,false);assert.equal(p.reviewQueue.length,1);
});
test('196 cap 0 returns no queue and keeps matrix',()=>{
 const p=plan([review('small_lab',U)],[ann('small_lab')],emptyLedger193(),0);
 assert.equal(p.rows.length,1);assert.equal(p.reviewQueue.length,0);assert.equal(p.unqueuedSourceCount,1);
});
test('196 deterministic across review and annotation order',()=>{
 const r=[review('a',W),review('b',U),review('c',M)];
 const a=[ann('a'),ann('b'),ann('c','marketplace_stars_only')];
 const x=plan(r,a,emptyLedger193(),2),y=plan([...r].reverse(),[...a].reverse(),emptyLedger193(),2);
 assert.deepEqual(x,y);
});
test('196 stars-only document is discovery, not rank evidence',()=>{
 const p=plan([review('affiliate',M)],[ann('affiliate','marketplace_stars_only')]);
 assert.equal(p.rows[0].priorityLane,'discovery_only');assert.equal(p.rows[0].nextAction,'discovery_only_preserve_products');
 assert.equal(p.coverage[0].noTestsDoesNotImplyPoorProduct,true);
});
test('196 page-specific affiliate does not blacklist publisher or other articles',()=>{
 const reviews=[review('affiliate',M),review('affiliate_test','https://affiliate.example.net/my-lab-method')];
 const p=plan(reviews,[ann('affiliate','marketplace_stars_only'),ann('affiliate_test')]);
 assert.equal(p.rows.find(x=>x.sourceId==='affiliate_test')!.priorityLane,'new_source_probe');
});
test('196 contradictory alleged original measurement in stars-only list forces review',()=>{
 const r=review('contradiction',M);r.measurements=[{field:'noise',value:50,unit:'dB',protocol:'v1',condition:'low',
  producerId:null,testEventId:null,basis:'original_test_claimed'}];
 const p=plan([r],[ann(r.sourceId,'marketplace_stars_only')]);
 assert.equal(p.rows[0].anomalies.includes('marketplace_vs_claimed_original_conflict'),true);
 assert.notEqual(p.rows[0].priorityLane,'discovery_only');
});
test('196 manufacturer specs get provisional research only',()=>{
 const p=plan([review('oem','https://maker.example.com/model')],[ann('oem','manufacturer_specification')]);
 assert.equal(p.rows[0].priorityLane,'derived_followup');assert.equal(p.rows[0].nextAction,'look_for_independent_method');
});
test('196 exact measured-value collisions are originality cues, not merges',()=>{
 const a=review('known',W),b=review('unknown',U,'home_appliances','model_one',corpus+' different');
 const m={field:'noise',value:50,unit:'dB',protocol:'v1',condition:'low',producerId:null,testEventId:null,basis:'original_test_claimed' as const};
 a.measurements=[m];b.measurements=[m];
 const p=plan([a,b],[ann('known'),ann('unknown')]);
 for(const row of p.rows)assert.ok(row.lineageReviewSignals.includes('identical_scoped_number_not_test_identity'));
 assert.equal(p.experimentMergesAuthorized,false);assert.equal(p.verifiedOriginalExperiments,0);
});
test('196 direct quote/republication stays unverified',()=>{
 const a=review('known',W),b=review('unknown',U);b.attribution=[{targetSourceId:'known',kind:'explicitly_cites'}];
 const p=plan([a,b],[ann('known'),ann('unknown','derived_citation')]);
 assert.equal(p.rows.find(x=>x.sourceId==='unknown')!.lineageReviewSignals.includes('unverified_explicit_attribution'),true);
});
test('196 chronology anomalies cue human review rather than earliest-source attribution',()=>{
 const a=review('known',W);a.dates=[{kind:'publisher_datePublished',iso:'2026-03-01T00:00:00Z'},
  {kind:'publisher_dateModified',iso:'2026-02-01T00:00:00Z'}];
 const p=plan([a],[ann('known')]);assert.ok(p.rows[0].lineageReviewSignals.includes('chronology_requires_review'));
 assert.equal(p.rows[0].independentTestAdmitted,false);
});
test('196 cross-variant no transfer of source screening',()=>{
 const batch=mkBatch([review('known',W,'home_appliances','model_two')]);
 const a=ann('known');a.sourceRevision=rev('known',W,'signed','noise');
 assert.throws(()=>planSourceReviews196({batch,seed:seed(),ledger:emptyLedger193(),annotations:[a]}),/cross_scope/);
});
test('196 fresh bytes without revision prohibited',()=>{
 const a=ann('known');a.freshPublisherBytes=new TextEncoder().encode('bytes');
 assert.throws(()=>plan([review('known',W)],[a]),/invalid_fresh_bytes/);
});
test('196 unchanged bytes permit only screening reuse from phase193, not original test admission',()=>{
 const bytes='publisher full bytes for the stars-only affiliate page';
 const source=rev('affiliate',M,bytes,null);
 let ledger=emptyLedger193();ledger=recordScreening193(ledger,{source,scope:'document',action:'discovery_only',
  reason:'marketplace_stars_without_original_test',reviewerId:'researcher_one',reviewTicket:'ticket_abcd196',
  reviewedAt:'2026-10-13T09:00:00Z',reviewBasis:'human_source_screen',
  evidenceNote:'No original tests were contained within the manually inspected commercial ranked list.',
  originalTestEventId:null,retainedCandidateVariantIds:['model_one']});
 const a=ann('affiliate','marketplace_stars_only');a.sourceRevision=source;
 let p=plan([review('affiliate',M)],[a],ledger);
 assert.equal(p.rows[0].priorScreeningReused,false);
 a.freshPublisherBytes=new TextEncoder().encode(bytes);
 p=plan([review('affiliate',M)],[a],ledger);
 assert.equal(p.rows[0].priorScreeningReused,true);
 assert.equal(p.rows[0].priorityLane,'discovery_only');assert.equal(p.rows[0].independentTestAdmitted,false);
 assert.equal(p.rows[0].historicalDocumentScreens,1);
 assert.equal(p.rows[0].historicalOriginalTestCandidates,0);
});
test('196 revision mismatch mandates new review',()=>{
 const bytes='full publisher bytes';const source=rev('affiliate',M,bytes,null);
 let ledger=recordScreening193(emptyLedger193(),{source,scope:'document',action:'discovery_only',
 reason:'marketplace_stars_without_original_test',reviewerId:'reader_one',reviewTicket:'ticket_abcd196',
 reviewedAt:'2026-10-13T09:00:00Z',reviewBasis:'human_source_screen',
 evidenceNote:'This specific older commercial page relied only on online marketplace star counts.',
 originalTestEventId:null,retainedCandidateVariantIds:['model_one']});
 const a=ann('affiliate','marketplace_stars_only');a.sourceRevision=source;
 a.freshPublisherBytes=new TextEncoder().encode(bytes+' updated with original testing');
 const p=plan([review('affiliate',M)],[a],ledger);
 assert.equal(p.rows[0].previousScreeningVerdict,'screen_required_content_revision');
 assert.ok(p.rows[0].anomalies.includes('previous_decision_not_reusable'));
 ledger=recordScreening193(ledger,{source:{...source,contentHash:digest(bytes+' updated with original testing'),
 observedAt:'2026-10-13T10:00:00Z',classificationRevision:'classification_v2',field:'noise'},
 scope:'field',action:'original_evidence_candidate',reason:'reported_original_method_pending_independent_review',
 reviewerId:'reader_one',reviewTicket:'ticket_new_test196',reviewedAt:'2026-10-13T11:00:00Z',
 reviewBasis:'human_source_screen',evidenceNote:'New page now claims a test conducted by a named producer and protocol.',
 originalTestEventId:'candidate_new_test',retainedCandidateVariantIds:[]});
 assert.equal(ledger.events.length,2);
});
test('196 extract SHA is never treated as fresh complete publisher bytes',()=>{
 const a=ann('known');a.sourceRevision=rev('known',W,corpus);
 const p=plan([review('known',W)],[a]);assert.equal(p.rows[0].previousScreeningVerdict,'fresh_publisher_bytes_required');
});
test('196 no full text, extract hashes, measurements or original bytes in matrix result',()=>{
 const a=review('small_lab',U);a.transientText=corpus+'SECRET_EDITORIAL_PAYLOAD';
 const out=JSON.stringify(plan([a],[ann('small_lab')]));
 assert.equal(out.includes('SECRET_EDITORIAL_PAYLOAD'),false);
 assert.equal(out.includes(digest(a.transientText)),false);
 assert.equal(out.includes('transientText'),false);assert.equal(out.includes('freshPublisherBytes'),false);
});
test('196 sparse niche product preserved when zero studies',()=>{
 const a=review('unknown','https://niche-science.example.org/handmade-test','niche_vaporizers','rare_model','Few documented lab methods.');
 const p=plan([a],[ann('unknown','unclassified','usability')]);
 assert.equal(p.coverage[0].originalTestsVerified,0);assert.equal(p.coverage[0].noTestsDoesNotImplyPoorProduct,true);
 assert.equal(p.rows[0].priorityLane,'unscoped_review');
});
test('196 rejects duplicate annotation sourceIds',()=>{
 const r=[review('one',W),review('two',U)];
 assert.throws(()=>plan(r,[ann('one'),ann('one')]),/duplicate_source/);
});
test('196 rejects missing annotation source IDs',()=>{
 assert.throws(()=>plan([review('one',W)],[ann('other')]),/invalid_annotation/);
});
test('196 forbids impersonating Phase195 verified original experiments',()=>{
 const batch=structuredClone(mkBatch([review('one',W)]));
 batch.originalTestIdentityVerified=true as false;
 assert.throws(()=>planSourceReviews196({batch,seed:seed(),ledger:emptyLedger193(),annotations:[ann('one')]}),/invalid_batch/);
});
test('196 Phase182 link is research-only, does not alter original plan or authorize reads',()=>{
 const matrix=plan([review('which_1',W)],[ann('which_1')]);
 const r={phase:182,schema:'182.1',categoryId:'home_appliances',
  rankingAuthorized:false,planningOnly:true,jobs:[{jobId:'job_a',kind:'exact_variant_source_research',
  exactVariantId:'model_one',criterionId:'noise'}]} as unknown as ResearchPlan182;
 const before=JSON.stringify(r),linked=linkSourceQueueToResearch182(r,matrix);
 assert.deepEqual(linked[0].prioritizedSourceIds,['which_1']);assert.equal(linked[0].sourceEvidenceAdmitted,false);
 assert.equal(JSON.stringify(r),before);
});
test('196 Phase182 linkage cannot admit ranking from external plan',()=>{
 const matrix=plan([review('which_1',W)],[ann('which_1')]);
 const r={phase:182,schema:'182.1',rankingAuthorized:true,planningOnly:true,jobs:[]} as unknown as ResearchPlan182;
 assert.throws(()=>linkSourceQueueToResearch182(r,matrix),/invalid_182_plan/);
});
test('196 frozen input seed unchanged by planning',()=>{
 const s=seed();const input=JSON.stringify(s),batch=mkBatch([review('one',W)]);
 planSourceReviews196({batch,seed:s,ledger:emptyLedger193(),annotations:[ann('one')]});
 assert.equal(JSON.stringify(s),input);
});
