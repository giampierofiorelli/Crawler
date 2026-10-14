import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {findDocumentCandidates194,checkFreshPublisherSnapshot194,evaluateCandidateRetrieval194,
 type Document194,type PairLabel194} from '../src/phase194_candidate_retrieval.js';
import {emptyLedger193,recordScreening193,type SourceRevision193,type ScreeningDecision193}
 from '../src/phase193_screening_memory.js';
const hash=(x:string)=>createHash('sha256').update(x).digest('hex');
const txt='In this independent practical trial the operator measured the airflow and acoustic performance using a calibrated system in a controlled room. The exact product model, surface conditions, instrument settings, test repetition, temperature, humidity, operator and protocol version were recorded for this particular original laboratory experiment. The conclusions apply to these measured outcomes only and cannot determine the full product quality or its lifetime reliability.';
const make=(id:string,t=txt,over:Partial<Document194>={}):Document194=>({
 sourceId:id,url:`https://${id}.example/review/`,variantIds:['vacuum_one'],text:t,
 basis:'rights_appropriate_extract',contentHash:hash(t),...over});
const find=(...docs:Document194[])=>findDocumentCandidates194(docs);
const labels=(same:boolean):PairLabel194[]=>[{sourceA:'a',sourceB:'b',textuallyRelated:same,reviewedBy:'fixture_author',reviewProtocol:'synthetic_ground_truth_only'}];
const summary=(docs:Document194[])=>find(...docs).candidates.map(x=>`${x.sourceA}|${x.sourceB}:${x.reason}`);
const src=(over:Partial<SourceRevision193>={}):SourceRevision193=>({
 sourceId:'roundup',url:'https://review.example/buyers-guide/',contentHash:hash('frozen page'),
 contentBasis:'publisher_bytes',policyVersion:'p1',classificationRevision:'c1',
 market:'uk',category:'vacuum',variantId:'rare_model',field:'noise',observedAt:'2026-10-01T10:00:00Z',...over});
const decision=(over:Partial<ScreeningDecision193>={}):ScreeningDecision193=>({
 source:src(),scope:'document',action:'discovery_only',reason:'marketplace_stars_without_original_test',
 reviewerId:'reviewer_a',reviewTicket:'review-194-case',reviewedAt:'2026-10-02T12:00:00Z',
 reviewBasis:'human_source_screen',evidenceNote:'A commercial buying guide with marketplace stars only and no original laboratory method.',
 originalTestEventId:null,retainedCandidateVariantIds:['rare_model'],...over});
const ledger=()=>recordScreening193(emptyLedger193(),decision());

test('empty candidate set is safe and does not authorize a ranking',()=>{
 const r=find();assert.equal(r.documents,0);assert.equal(r.publicRankingAllowed,false);assert.deepEqual(r.candidates,[]);
});
test('single document retained and no fabricated independent tests',()=>{
 const r=find(make('a'));assert.deepEqual(r.unmatchedSourceIds,['a']);assert.equal(r.testEventMergesAuthorized,false);
});
test('identical publisher bytes in two sources flag documentary duplicate, not experiment identity',()=>{
 const r=find(make('a',txt,{basis:'publisher_bytes'}),make('b',txt,{basis:'publisher_bytes'}));
 assert.equal(r.candidates[0].reason,'identical_publisher_bytes');assert.equal(r.candidates[0].testEventMerged,false);
 assert.equal(r.sourceAttributionVerified,false);
});
test('same analyst text not falsely authenticated as publisher full bytes',()=>{
 const r=find(make('a'),make('b'));assert.equal(r.candidates[0].reason,'same_normalized_text');
 assert.equal(r.candidates[0].sourceAttributionVerified,false);
});
test('same URL is a document relation even when text changes',()=>{
 const x=find(make('a'),make('b','unrelated engineering method overview notes',{url:'https://a.example/review/?utm_source=abc'}));
 assert.equal(x.candidates[0].reason,'same_normalized_url');
});
test('nontracking query string remains a distinct URL',()=>{
 const r=find(make('a',txt,{url:'https://a.example/review/?variant=a'}),make('b','entirely different short excerpt',{url:'https://a.example/review/?variant=b'}));
 assert.equal(r.candidates.length,0);
});
test('different URLs with identical normalized text produce candidate',()=>{
 const punct=txt.toUpperCase().replaceAll(',','');
 const r=find(make('a'),make('b',punct));assert.equal(r.candidates[0].reason,'same_normalized_text');
});
test('near duplication with a few edited words identified as candidate, not proven copy',()=>{
 const changed=txt.replace('acoustic performance','noise output').replace('operator and protocol','technician and procedure');
 const r=find(make('a'),make('b',changed));assert.ok(r.candidates.length>0);assert.equal(r.candidates[0].testEventMerged,false);
});
test('unrelated short excerpts not counted as duplicate',()=>{
 const r=find(make('a','Coffee tastes smooth after brewing.'),make('b','Snowboards are waxed for winter.'));
 assert.equal(r.candidates.length,0);
});
test('same numeric outcome in different experiments is not enough for copy conclusion',()=>{
 const a='Experiment A measured exactly 43 dB with one instrument and used its own acoustic methodology.';
 const b='Experiment B independently measured exactly 43 dB with a completely different microphone in another laboratory.';
 assert.equal(find(make('a',a),make('b',b)).candidates.length,0);
});
test('a copied article containing an additional observation is flagged but not discarded',()=>{
 const r=find(make('a'),make('b',txt+' The reviewer also evaluated handling on steep stairs.'));
 assert.equal(r.testEventMergesAuthorized,false);assert.ok(r.candidates.length>0);
});
test('minimum metadata and source identifiers validated',()=>{
 assert.throws(()=>find(make('BAD_ID')),/invalid194_document/);
 assert.throws(()=>find(make('a',txt,{url:'http://a.example/'})),/bad192_url/);
 assert.throws(()=>find(make('a',txt,{variantIds:['v','v']})),/invalid194_document/);
 assert.throws(()=>find(make('a',txt,{basis:'nope' as any})),/invalid194_document/);
});
test('content hashes tied to actual authorized local text',()=>{
 assert.throws(()=>find(make('a',txt,{contentHash:'0'.repeat(64)})),/invalid194_document/);
});
test('duplicate source ids rejected before candidate retrieval',()=>{
 assert.throws(()=>find(make('a'),make('a')),/invalid194_corpus/);
});
test('return candidate order invariant to corpus order',()=>{
 const docs=[make('b'),make('a'),make('c','no relevant repeated text')];
 assert.deepEqual(summary(docs),summary([...docs].reverse()));
});
test('content duplicate detection does not depend on product variant metadata',()=>{
 const r=find(make('a',txt,{basis:'publisher_bytes',variantIds:['vacuum_a']}),
 make('b',txt,{basis:'publisher_bytes',variantIds:['vacuum_b']}));
 assert.equal(r.candidates.length,1);assert.equal(r.testEventMergesAuthorized,false);
});
test('two documents with different text are not auto-merged into test events',()=>{
 const r=find(make('a'),make('b','Other original lab has distinct protocol and model.'));
 assert.equal(r.testEventMergesAuthorized,false);
});
test('the number of considered pairs cannot exceed exhaustive combinations',()=>{
 const docs=Array.from({length:24},(_,i)=>make('doc'+i,i%3===0?txt:'The quick test is not equivalent '+i));
 const r=find(...docs);assert.ok(r.pairsConsidered<=r.allPairsPossible);
});
test('identical publisher bytes priority above URL or text normalization',()=>{
 const r=find(make('a',txt,{basis:'publisher_bytes',url:'https://x.example/review/'}),
 make('b',txt,{basis:'publisher_bytes',url:'https://x.example/review/'}));
 assert.equal(r.candidates[0].reason,'identical_publisher_bytes');
});
test('change to original document bytes invalidates cached commercial exclusion',()=>{
 const r=checkFreshPublisherSnapshot194({ledger:ledger(),revision:src(),
 freshPublisherBytes:Buffer.from('updated page')});
 assert.equal(r.verdict,'screen_required_content_revision');assert.equal(r.candidatePreserved,true);
});
test('unchanged verified bytes allow existing Phase193 decision reuse',()=>{
 const l=recordScreening193(emptyLedger193(),decision({source:src({contentHash:hash('frozen page')})}));
 const r=checkFreshPublisherSnapshot194({ledger:l,revision:src(),
 freshPublisherBytes:Buffer.from('frozen page')});
 assert.equal(r.verdict,'reuse_screening_decision');assert.equal(r.reused?.action,'discovery_only');
 assert.equal(r.mayUseAsIndependentTest,false);
});
test('ETag-only / null original fetch cannot justify screening reuse',()=>{
 const r=checkFreshPublisherSnapshot194({ledger:ledger(),revision:src(),freshPublisherBytes:null});
 assert.equal(r.verdict,'screen_required_unverified_revision');assert.equal(r.fullDocumentRescreenSkipped,false);
});
test('rights-appropriate excerpts cannot be misrepresented as publisher bytes',()=>{
 const r=checkFreshPublisherSnapshot194({ledger:ledger(),revision:src({contentBasis:'rights_appropriate_extract'}),
 freshPublisherBytes:Buffer.from('frozen page')});
 assert.equal(r.verdict,'screen_required_unverified_revision');
});
test('updated screening policy still invalidates reuse even with byte match',()=>{
 const r=checkFreshPublisherSnapshot194({ledger:ledger(),revision:src({policyVersion:'p2'}),
 freshPublisherBytes:Buffer.from('frozen page')});assert.equal(r.verdict,'screen_required_policy_revision');
});
test('source classification change invalidates same bytes',()=>{
 const r=checkFreshPublisherSnapshot194({ledger:ledger(),revision:src({classificationRevision:'new_method'}),
 freshPublisherBytes:Buffer.from('frozen page')});assert.equal(r.verdict,'screen_required_context_revision');
});
test('field scope mutation prevents reuse of reviewed document when scope differs',()=>{
 const l=recordScreening193(emptyLedger193(),decision({scope:'field',action:'contextual_research_only',reason:'mixed_or_untraced_method'}));
 const r=checkFreshPublisherSnapshot194({ledger:l,revision:src({variantId:'new_variant'}),
 freshPublisherBytes:Buffer.from('frozen page')});assert.equal(r.verdict,'screen_required_new_document');
});
test('a cached exclusion cannot be interpreted as a ranked negative',()=>{
 const r=checkFreshPublisherSnapshot194({ledger:ledger(),revision:src(),freshPublisherBytes:null});
 assert.equal(r.mayUseAsIndependentTest,false);assert.equal(r.candidatePreserved,true);
});
test('evaluation labels must be explicit and never inferred for unknown pairs',()=>{
 const r=find(make('a'),make('b'));const s=evaluateCandidateRetrieval194(r,labels(true));
 assert.deepEqual([s.tp,s.fp,s.fn,s.tn],[1,0,0,0]);assert.equal(s.externallyReviewedLabelsAuthenticated,false);
});
test('self-authored negative labeled pair counted as false candidate without concealing it',()=>{
 const r=find(make('a'),make('b'));const s=evaluateCandidateRetrieval194(r,labels(false));
 assert.equal(s.fp,1);assert.equal(s.precision,0);
});
test('missing candidate shows up as false negative if gold says duplicate',()=>{
 const r=find(make('a'),make('b','totally different description'));const s=evaluateCandidateRetrieval194(r,labels(true));
 assert.equal(s.fn,1);assert.equal(s.recall,0);
});
test('correctly separated documents counted as true negative only for explicitly labeled pair',()=>{
 const r=find(make('a'),make('b','different description'));const s=evaluateCandidateRetrieval194(r,labels(false));
 assert.equal(s.tn,1);assert.equal(s.recall,null);
});
test('duplicate labels rejected',()=>{
 const r=find(make('a'),make('b'));
 assert.throws(()=>evaluateCandidateRetrieval194(r,[...labels(true),...labels(true)]),/invalid194_repeated_label/);
});
test('malformed labels rejected',()=>{
 const r=find(make('a'),make('b'));
 assert.throws(()=>evaluateCandidateRetrieval194(r,[{...labels(true)[0],sourceB:'a'}]),/invalid194_label/);
});
test('no labeled pairs does not invent precision',()=>{
 const s=evaluateCandidateRetrieval194(find(make('a')),[]);
 assert.equal(s.precision,null);assert.equal(s.recall,null);assert.equal(s.noClaimsAboutUnlabeledPairs,true);
});
test('no full-text license asserted by research-only corpus',()=>{
 const r=find(make('a',txt,{basis:'analyst_annotation'}));assert.equal(r.publicRankingAllowed,false);
});
test('same content on multiple publisher URLs does not prove unlawful plagiarism',()=>{
 const r=find(make('a',txt,{basis:'publisher_bytes'}),make('b',txt,{basis:'publisher_bytes'}));
 assert.equal(r.candidates[0].action,'inspect_document_relationship_not_experiment_merge');
});
test('two different authors with identical words cannot generate more than one candidate pair',()=>{
 const r=find(make('a'),make('b'));assert.equal(r.candidates.length,1);
});
test('allowed document snapshots never include raw text in output',()=>{
 const r=find(make('a'));assert.ok(!JSON.stringify(r).includes('operator measured the airflow'));
});

test('labels for nonexistent source IDs cannot inflate scores',()=>{
 const r=find(make('a'),make('b'));
 assert.throws(()=>evaluateCandidateRetrieval194(r,[{...labels(true)[0],sourceB:'ghost'}]),/invalid194_label/);
});

test('shared review boilerplate across a large corpus does not swamp source deduplication',()=>{
 const docs=Array.from({length:40},(_,i)=>make('source'+i,
  txt.replace('The exact product model','The exact product model tested at station '+i+', under separate conditions,')
     .replace('a controlled room','laboratory '+i+' in a controlled room')));
 const r=find(...docs);
 assert.ok(r.pairsConsidered<r.allPairsPossible/4,
   `Too many pairs screened: ${r.pairsConsidered} of ${r.allPairsPossible}`);
 assert.equal(r.testEventMergesAuthorized,false);
});
test('boilerplate filter still retrieves content copied with a small edit',()=>{
 const originals=Array.from({length:35},(_,i)=>make('item'+i,
  txt.replace('acoustic performance','acoustic performance of research unit '+i)
  .replace('operator and protocol','operator number '+i+' and protocol')));
 const a=originals[14];const clone=make('derivative',a.text.replace('in a controlled room','in the documented controlled room'));
 const r=find(...originals,clone);
 assert.ok(r.candidates.some(p=>p.sourceA==='derivative'&&p.sourceB==='item14'));
});
