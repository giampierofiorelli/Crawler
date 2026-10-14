import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {trainNativeModel123,type LabeledQuestion123} from '../src/phase123_native_learned_intent.js';
import {attemptResearch124,auditAttribution124,type CuratedAnchor124} from '../src/phase124_end_to_end_attempt.js';
import {continueNativeDiscovery124} from '../src/phase124_authorized_discovery.js';
import type {IndexedPassage122} from '../src/phase122_native_local_retrieval.js';
const {samples}=JSON.parse(readFileSync('research/phase123_training_examples.json','utf8')) as {samples:LabeledQuestion123[]};
const {passages}=JSON.parse(readFileSync('research/phase124_editorial_passages.json','utf8')) as {passages:IndexedPassage122[]};
const {cases}=JSON.parse(readFileSync('research/phase124_authentic_questions.json','utf8')) as {cases: {id:string;text:string;source:string;expected:string}[]};
const model=trainNativeModel123(samples.filter((_,i)=>i%5!==4),samples.filter((_,i)=>i%5===4));
const context={verifiedCategory:'floor_cleaning_robot' as const};
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const a:CuratedAnchor124={reviewRecordId:'phase118_review_stairs',
 sourceIdentity:passages[0].sourceIdentity,sourceUrl:passages[0].sourceUrl,
 exactProductId:'roborock_saros_rover',passageSha256:digest(passages[0].text),
 passageId:passages[0].passageId,reviewerRecordedProducts:['roborock_saros_rover']};

test('truly empty corpus: autonomous attempt returns missing-source step and cannot rank',()=>{
 const r=attemptResearch124(model,'Trovami i robot che sono in grado di salire gli scalini',context,[],[]);
 assert.equal(r.state,'source_acquisition_required');
 assert.ok(r.nextActions.includes('execute_authorized_in_house_source_discovery_and_acquisition'));
 assert.equal(r.retrieval.externalWebSearchExecuted,false);assert.equal(r.publicRankingAuthorized,false);
});
test('source-less autonomy question inherits validated legacy research obligations only as hypotheses',()=>{
 const r=attemptResearch124(model,'Quali robot richiedono meno interventi umani?',context,[],[]);
 assert.ok(r.obligations.includes('unattended_completion'));
 assert.ok(r.obligations.includes('routine_human_minutes'));
 assert.ok(r.nextActions.includes('review_legacy_intent_hypothesis_not_accepted_as_ground_truth'));
 assert.equal(r.interpretation.learnedLabel,null);
 assert.equal(r.publicRankingAuthorized,false);
});
test('real editorial notes enable candidate retrieval, not capability certification',()=>{
 const r=attemptResearch124(model,'Trovami i robot che sono in grado di salire gli scalini',context,passages,[a]);
 assert.ok(r.retrieval.candidateHits.length>0);
 assert.equal(r.state,'candidate_sources_found');
 assert.equal(r.sourceFactsVerified,false);assert.equal(r.originalSourceAuthenticated,false);
 assert.equal(r.publicRankingAuthorized,false);
});
test('reordering local passages changes neither state nor retrieved evidence',()=>{
 const q='Trovami i robot che sono in grado di salire gli scalini';
 const forward=attemptResearch124(model,q,context,passages,[a]);
 const backward=attemptResearch124(model,q,context,[...passages].reverse(),[a]);
 assert.deepEqual(forward,backward);
});
test('even exact manually attested source match does not authenticate a webpage',()=>{
 const result=auditAttribution124(passages[0],'roborock_saros_rover',[a]);
 assert.equal(result.status,'curated_anchor_match');assert.equal(result.originalSourceAuthenticated,false);
 assert.equal(result.measurementValidated,false);
});
test('misattributed product is quarantined (phase118 observed vulnerability)',()=>{
 const r=auditAttribution124(passages[0],'dreame_cyber_x',[a]);
 assert.equal(r.status,'quarantined');assert.ok(r.reasons.includes('product_misattribution'));
});
test('tampered text fails digest pinning',()=>{
 const r=auditAttribution124({...passages[0],text:passages[0].text+' New sales claim'},'roborock_saros_rover',[a]);
 assert.equal(r.status,'quarantined');assert.ok(r.reasons.includes('passage_content_changed'));
});
test('url and publisher swapping fails source binding',()=>{
 const r=auditAttribution124({...passages[0],sourceUrl:passages[1].sourceUrl},'roborock_saros_rover',[a]);
 assert.equal(r.status,'quarantined');assert.ok(r.reasons.includes('source_url_or_identity_mismatch'));
});
test('duplicate anchors cannot count as a unique verification',()=>{
 const r=auditAttribution124(passages[0],'roborock_saros_rover',[a,{...a,reviewRecordId:'other_review'}]);
 assert.equal(r.status,'quarantined');assert.ok(r.reasons.includes('missing_or_ambiguous_reviewed_anchor'));
});
test('rights unreviewed prohibits source passage attestation',()=>{
 const r=auditAttribution124({...passages[0],rightsReviewed:false},'roborock_saros_rover',[a]);
 assert.equal(r.status,'quarantined');assert.ok(r.reasons.includes('rights_not_reviewed'));
});
test('negation forces review before automatic research',()=>{
 const r=attemptResearch124(model,'I want a robot that does NOT have a mopping function',context,passages,[a]);
 assert.equal(r.state,'needs_constraint_adjudication');assert.equal(r.retrieval.attemptedQueries,0);
 assert.equal(r.publicRankingAuthorized,false);
});
test('unknown product category cannot inherit floor robot assumptions',()=>{
 const r=attemptResearch124(model,'Which dishwasher needs the least human maintenance?',context,passages,[a]);
 assert.equal(r.interpretation.categoryEstablished,false);
 assert.equal(r.publicRankingAuthorized,false);
});
test('authentic question fixture is sourced, unique and not leaked into model training',()=>{
 const normalize=(s:string)=>s.trim().toLowerCase();
 const trainTexts=new Set(samples.map(x=>normalize(x.text)));
 assert.equal(cases.length,12);
 assert.equal(new Set(cases.map(c=>c.text)).size,cases.length);
 for(const c of cases){assert.ok(/^https:\/\/www\.reddit\.com\/r\/RobotVacuums\//.test(c.source));
   assert.equal(trainTexts.has(normalize(c.text)),false);}
});
test('empty approval registry cannot initiate web discovery or attest evidence',async()=>{
 const r=attemptResearch124(model,'Trovami i robot che sono in grado di salire gli scalini',context,[],[]);
 const step=await continueNativeDiscovery124({attempt:r,policies:[],asOf:'2026-10-11T12:00:00Z'});
 assert.equal(step.status,'needs_permissions');assert.equal(step.webCalls,0);
 assert.equal(step.publicRankingAuthorized,false);
});
test('an approved fixture can invoke first-party source discovery without promoting URLs to evidence',async()=>{
 const attempt=attemptResearch124(model,'Trovami i robot che sono in grado di salire gli scalini',context,[],[]);
 const policy={sourceId:'reviewed_publisher',host:'vacuumwars.com',basis:'written_permission' as const,
  rightsDocumentId:'fictional_fixture_only',rightsDocumentUrl:'https://vacuumwars.com/review-rights',
  reviewedBy:'test_fixture',reviewedAt:'2026-10-10T10:00:00Z',validUntil:'2026-12-11T00:00:00Z',
  permittedOperations:['metadata_discovery' as const],robots:'allowed' as const,
  robotsCheckedAt:'2026-10-11T11:00:00Z',websiteTerms:'reviewed_permitted' as const,
  termsCheckedAt:'2026-10-10T10:00:00Z',commercialUseReviewed:true};
 const transport={get:async (url:string)=>{
  if(url.endsWith('/robots.txt'))return {status:200,finalUrl:url,contentType:'text/plain',
   body:'User-agent: ProductEvidenceResearchBot\nAllow: /\n'};
  return {status:200,finalUrl:url,contentType:'application/xml',
   body:'<?xml version="1.0"?><urlset><url><loc>https://vacuumwars.com/roborock-saros-20-review/</loc></url></urlset>'};
 }};
 const result=await continueNativeDiscovery124({attempt,policies:[policy],
   asOf:'2026-10-11T12:00:00Z',transport});
 assert.equal(result.status,'candidate_urls_found');
 assert.equal(result.webCalls,2);assert.equal(result.candidateUrls.length,1);
 assert.equal(result.articleTextAcquired,false);assert.equal(result.publicRankingAuthorized,false);
});
test('unreviewed rights or expired robots record blocks even mocked sitemap discovery',async()=>{
 const attempt=attemptResearch124(model,'Trovami i robot che sono in grado di salire gli scalini',context,[],[]);
 const policy={sourceId:'publisher',host:'vacuumwars.com',basis:'unknown' as const,
  rightsDocumentId:null,rightsDocumentUrl:null,reviewedBy:null,reviewedAt:null,validUntil:null,
  permittedOperations:['metadata_discovery' as const],robots:'unknown' as const,
  robotsCheckedAt:null,websiteTerms:'unknown' as const,
  termsCheckedAt:null,commercialUseReviewed:false};
 const res=await continueNativeDiscovery124({attempt,policies:[policy],asOf:'2026-10-11T12:00:00Z',
  transport:{get:async()=>{throw Error('must_not_be_called');}}});
 assert.equal(res.status,'needs_permissions');assert.equal(res.webCalls,0);
 assert.equal(res.candidateUrls.length,0);
});
