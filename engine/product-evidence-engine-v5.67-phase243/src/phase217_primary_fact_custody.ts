/** Phase217: strictly scoped, ephemeral page-byte linkage for Phase216 facts.
 * Reuses the Phase69 approved reader. An exact phrase present in retrieved bytes
 * is a provenance cue only: NOT publisher authentication, an independent test,
 * proof that the phrasing refers to the intended model, or release approval.
 * Operator-injected transports are always reported as FIXTURES.
 */
import {createHash} from 'node:crypto';
import {readApprovedSource,type SourceTransport} from './approved_web_reader.js';
import type {EvidenceAcquisitionPlan,EvidenceQueueItem,WebCandidate,WebSourcePolicy} from './web_evidence_acquisition.js';
import type {Triage216,SpecObservation216} from './phase216_primary_claim_triage.js';

const digest=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const id=(s:unknown):s is string=>typeof s==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(s);
const sha=(s:unknown):s is string=>typeof s==='string'&&/^[0-9a-f]{64}$/.test(s);
const safe=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<1100;
/** Analyst-entered excerpts must be short; no excerpts are copied into results. */
export interface PrimaryFactAnchor217 {
 factId:string;reviewId:string;exactFragment:string;
 /** Human reviewed this correspondence; not independently attested. */
 scopeReviewed:boolean;
}
export interface FactCaptureRequest217 {
 triage:Triage216;facts:readonly SpecObservation216[];
 plan:EvidenceAcquisitionPlan;queueItem:EvidenceQueueItem;
 candidate:WebCandidate;policy:WebSourcePolicy;checkedAt:string;
 anchors:readonly PrimaryFactAnchor217[];
 /** If provided, demand matching complete publisher bytes, not an extract hash. */
 expectedDocumentSha256:string|null;
 /** Never accepted as evidence of actual network retrieval. */
 fixtureTransport?:SourceTransport;
}
export type AnchorFinding217='exact_fragment_present_once'|'fragment_absent'|
 'fragment_ambiguous'|'anchor_scope_not_reviewed';
export interface ScopedAnchorResult217{factId:string;finding:AnchorFinding217;}
export interface FactCustodyResult217 {
 schema:'pee217.scoped-primary-fact-custody.v1';
 state:'blocked'|'fixture_only'|'controlled_fetch_unreviewed';
 sourceUrl:string;sourceId:string;observedOn:string;
 capturedSha256:string|null;expectedSha256:string|null;
 revisionState:'not_captured'|'first_observation'|'expected_version_matches'|'version_changed';
 anchors:ScopedAnchorResult217[];reason:string|null;
 rawPublisherTextRetained:false;rawAnchorTextRetained:false;
 sourceMaterialIsManufacturerStatementOnly:true;
 publisherIdentityIndependentlyAuthenticated:false;
 productModelInDocumentIndependentlyAuthenticated:false;
 originalReviewerAuthenticated:false;
 independentPerformanceTestAuthenticated:false;
 rankingAuthorized:false;trustBadgeAuthorized:false;
}
function validateRequest(req:FactCaptureRequest217):void {
 if(!req||req.triage?.schema!=='pee216.primary-claim-triage.v1'||
  req.triage.rankingAuthorized!==false||req.triage.sourcePagesByteAuthenticated!==false||
  !Array.isArray(req.anchors)||req.anchors.length<1||req.anchors.length>30||
  !Array.isArray(req.facts)||req.facts.length>300||
  !req.candidate||!req.plan||!req.queueItem||!req.policy||
  req.plan.exactVariantId!==req.candidate.exactVariantId||
  req.queueItem.candidateId!==req.candidate.id||
  req.queueItem.canonicalUrl!==req.candidate.url||
  req.policy.sourceId!==req.candidate.sourceId||
  req.candidate.kind!=='manufacturer_technical_document'||
  (req.expectedDocumentSha256!==null&&!sha(req.expectedDocumentSha256))||
  !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(req.checkedAt)||
  !Number.isFinite(Date.parse(req.checkedAt)))throw Error('phase217_invalid_source_boundary');
 // A repeated factId with altered scope must not be resolved by array order.
 const seenFacts=new Set<string>();
 for(const fact of req.facts){
  if(!id(fact?.factId)||seenFacts.has(fact.factId)||fact.publisher!=='manufacturer'||
   fact.reviewMode!=='analyst_observed_public_page'||fact.sourceByteHash!==null||
   !Number.isFinite(fact.value))throw Error('phase217_ambiguous_source_fact');
  seenFacts.add(fact.factId);
 }
 const allowedFacts=new Map<string,{url:string;variant:string;metric:string;condition:string;market:string;value:number;unit:string}>();
 for(const c of req.triage.claims){
  for(const f of c.comparedFacts){
   const known=req.facts.find(x=>x.factId===f.factId);
   if(!known||known.sourceUrl!==f.sourceUrl||known.market!==f.market||
    known.value!==f.value||known.unit!==f.unit||
    known.metricId!==c.metricId||known.conditionId!==c.conditionId||
    !c.variants.includes(known.variantId))continue;
   allowedFacts.set(f.factId,{url:f.sourceUrl,variant:known.variantId,
    metric:c.metricId,condition:c.conditionId,market:f.market,value:f.value,unit:f.unit});
  }
 }
 const seen=new Set<string>();
 for(const a of req.anchors){
  const known=allowedFacts.get(a?.factId);
  if(!known||seen.has(a.factId)||!id(a.reviewId)||
   !safe(a.exactFragment)||a.exactFragment.length<16||a.exactFragment.length>260||
   /[\x00-\x08\x0b-\x1f]/.test(a.exactFragment)||typeof a.scopeReviewed!=='boolean'||
   known.url!==req.candidate.url||req.candidate.exactVariantId!==known.variant||
   !Number.isFinite(known.value))throw Error('phase217_anchor_scope_mismatch');
  // The specific annotated quantity and unit must be part of the exact phrase.
  // This is a necessary condition, not proof of a true model-field relation.
  const normalized=a.exactFragment.toLowerCase().replace(/(?<=\d),(?=\d)/g,'');
  const valueRe=new RegExp(`(^|[^\\d])${String(known.value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?![\\d])`);
  const unitRe=new RegExp(`(^|[^a-z])${known.unit.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?![a-z])`);
  if(!valueRe.test(normalized)||!unitRe.test(normalized))throw Error('phase217_anchor_not_about_quantity');
  seen.add(a.factId);
 }
}
/** Transport is never created here: reuses Phase69 for rights, robots, DNS and
 * content quarantine. Even on the real HTTPS branch, the result is UNREVIEWED. */
export async function captureScopedPrimaryFacts217(req:FactCaptureRequest217):Promise<FactCustodyResult217>{
 validateRequest(req);
 const base:FactCustodyResult217={schema:'pee217.scoped-primary-fact-custody.v1',state:'blocked',
  sourceUrl:req.candidate.url,sourceId:req.candidate.sourceId,observedOn:req.checkedAt.slice(0,10),
  capturedSha256:null,expectedSha256:req.expectedDocumentSha256,
  revisionState:'not_captured',anchors:[],reason:null,
  rawPublisherTextRetained:false,rawAnchorTextRetained:false,
  sourceMaterialIsManufacturerStatementOnly:true,publisherIdentityIndependentlyAuthenticated:false,
  productModelInDocumentIndependentlyAuthenticated:false,originalReviewerAuthenticated:false,
  independentPerformanceTestAuthenticated:false,rankingAuthorized:false,trustBadgeAuthorized:false};
 let observed:{sha:string;anchors:ScopedAnchorResult217[]}|null=null;
 try {
  const outcome=await readApprovedSource({plan:req.plan,queueItem:req.queueItem,
   candidate:req.candidate,policy:req.policy,checkedAt:req.checkedAt,
   transport:req.fixtureTransport,onQuarantinedDocument:doc=>{
    if(doc.url!==req.candidate.url||!/^(?:text\/html|text\/plain)(?:\s*;|\s*$)/i.test(doc.contentType))
     throw Error('unexpected_source_version_or_type');
    const pageText=Buffer.from(doc.completeBytes).toString('utf8');
    const findings=req.anchors.map(a=>{
     const count=a.exactFragment.length>0?pageText.split(a.exactFragment).length-1:0;
     const finding:AnchorFinding217=!a.scopeReviewed?'anchor_scope_not_reviewed':
      count===0?'fragment_absent':count===1?'exact_fragment_present_once':'fragment_ambiguous';
     return {factId:a.factId,finding};
    });
    observed={sha:digest(doc.completeBytes),anchors:findings};
   }});
  if(outcome.status==='blocked')return {...base,reason:outcome.reasons[0]??'reader_blocked'};
 }catch{return {...base,reason:'controlled_reader_or_ephemeral_capture_failed'};}
 if(!observed)return {...base,reason:'reader_did_not_provide_complete_bytes'};
 const captured=observed as {sha:string;anchors:ScopedAnchorResult217[]};
 return {...base,state:req.fixtureTransport?'fixture_only':'controlled_fetch_unreviewed',
  capturedSha256:captured.sha,anchors:captured.anchors,
  revisionState:req.expectedDocumentSha256===null?'first_observation':
   req.expectedDocumentSha256===captured.sha?'expected_version_matches':'version_changed'};
}
export interface FactSourceGate217{
 schema:'pee217.fact-source-gate.v1';state:'research_only';
 claims:{claimId:string;priorState:string;sourceStatus:'no_eligible_capture'|
  'source_revision_requires_review'|'anchor_recheck_needed'|'all_linked_facts_captured_in_fixture'|
  'controlled_bytes_observed_requires_independent_review';factIds:string[]}[];
 factsFromPublisherNotIndependentlyMeasured:true;
 originalVideoStillUnauthenticated:true;rankingAuthorized:false;trustBadgeAuthorized:false;
}
/** An observational join, never an evidence-promotion gate. Duplicate capture
 * revisions of a URL must not be cherry-picked to clear a negative result. */
export function compareScopedFactCaptures217(triage:Triage216,captures:readonly FactCustodyResult217[]):FactSourceGate217{
 if(triage?.schema!=='pee216.primary-claim-triage.v1'||triage.rankingAuthorized!==false||
  !Array.isArray(captures)||captures.length>200)throw Error('phase217_invalid_join');
 for(const c of captures){if(c.schema!=='pee217.scoped-primary-fact-custody.v1'||
  c.rankingAuthorized!==false||c.trustBadgeAuthorized!==false||
  c.publisherIdentityIndependentlyAuthenticated!==false||
  !['fixture_only','controlled_fetch_unreviewed','blocked'].includes(c.state)||
  (c.capturedSha256!==null&&!sha(c.capturedSha256)))throw Error('phase217_invalid_capture');}
 const claims=triage.claims.map(claim=>{
  const factIds=[...new Set(claim.comparedFacts.map(f=>f.factId))].sort();
  const linked=claim.comparedFacts.flatMap(f=>captures.filter(c=>c.sourceUrl===f.sourceUrl&&
   c.anchors.some((a:ScopedAnchorResult217)=>a.factId===f.factId)));
  const missing=factIds.some(id=>!linked.some(c=>c.anchors.some((a:ScopedAnchorResult217)=>a.factId===id)));
  const unsafe=linked.some(c=>c.revisionState==='version_changed'||c.revisionState==='not_captured'||c.state==='blocked')||
   new Set(linked.filter(c=>c.capturedSha256).map(c=>`${c.sourceUrl}|${c.capturedSha256}`)).size!==
   new Set(linked.filter(c=>c.capturedSha256).map(c=>c.sourceUrl)).size;
  const incomplete=linked.some(c=>c.anchors.some((a:ScopedAnchorResult217)=>factIds.includes(a.factId)&&a.finding!=='exact_fragment_present_once'));
  const sourceStatus:FactSourceGate217['claims'][number]['sourceStatus']=missing||!linked.length?'no_eligible_capture':
   unsafe?'source_revision_requires_review':incomplete?'anchor_recheck_needed':
   linked.some(c=>c.state==='fixture_only')?'all_linked_facts_captured_in_fixture':
   'controlled_bytes_observed_requires_independent_review';
  return {claimId:claim.claimId,priorState:claim.state,sourceStatus,factIds};
 }).sort((a,b)=>a.claimId.localeCompare(b.claimId));
 return {schema:'pee217.fact-source-gate.v1',state:'research_only',claims,
  factsFromPublisherNotIndependentlyMeasured:true,originalVideoStillUnauthenticated:true,
  rankingAuthorized:false,trustBadgeAuthorized:false};
}
