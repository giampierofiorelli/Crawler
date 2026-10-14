/** Phase196: scoped source intelligence, NEVER an authority score or evidence admission.
 * Extends Phase193 screening memory, Phase194 publisher-byte revalidation and
 * Phase195 textless batch lineage. The seed contains publisher METHOD CLAIMS,
 * not verified lab experiments. Research queue output is deterministic and nonexclusive.
 * No publisher content/bytes, editorial excerpts or HMAC keys are retained.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {normalizeDiscoveryUrl192} from './phase192_lineage_marketplace_screen.js';
import {checkFreshPublisherSnapshot194} from './phase194_candidate_retrieval.js';
import {type ScreeningLedger193,type SourceRevision193,validateLedger193,type ReuseVerdict193} from './phase193_screening_memory.js';
import {type BatchResult195} from './phase195_ephemeral_batch_lineage.js';
import {type ResearchPlan182} from './phase182_gap_research_orchestrator.js';

const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const id=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x);
const marketId=(x:unknown):x is string=>typeof x==='string'&&/^[a-zA-Z][a-zA-Z0-9_.:-]{0,100}$/.test(x);
const strict=(v:unknown,keys:string[])=>{
 if(!v||typeof v!=='object'||Array.isArray(v)||
  Object.keys(v).sort().join('|')!==keys.sort().join('|'))throw Error('phase196_unexpected_schema');
};
const arrayOf=(a:unknown,f:(x:unknown)=>boolean,max=120)=>Array.isArray(a)&&a.length<=max&&a.every(f)&&new Set(a).size===a.length;
const safeUrl=(x:unknown)=>{if(typeof x!=='string'||x.length>2048)return false;
 try {const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password&&u.hostname.includes('.')&&
  !['localhost','127.0.0.1'].includes(u.hostname)&&!u.hostname.endsWith('.local');}catch{return false;}};
const stamp=(x:unknown)=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,19)===x.slice(0,19);
const day=(x:unknown)=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const domain=(x:unknown)=>typeof x==='string'&&x.length<=200&&/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(x)&&
 !x.includes('..')&&!x.startsWith('-');

export interface Profile196 {
 publisherId:string;domain:string;categoryScope:readonly string[];marketScope:readonly string[];
 methodStatementUrls:readonly string[];statedPractice:readonly string[];limitations:readonly string[];
 profileStatus:'methodology_candidate_not_verified_all_articles';
 proofLevel:'self_reported_method_or_official_registry_scope';perArticleTestAuthRequired:true;noGlobalWhitelist:true;
}
export interface PublisherSeed196 {
 schema:'pee.publisher-method-seed.2026-10-13';sourceKind:'first_party_published_method_statements_and_program_directories';
 verification:'public_web_documentation_checked_not_independent_experimental_audit';
 snapshotDate:string;purpose:'research-seed-for-scoped-search-priority_only';
 automaticallyTrustedTestEvents:false;automaticDocumentScreenBypass:false;automaticOriginalityAttribution:false;
 policy:{methodProfileRequiresVersionedReview:true;articleAndClaimOriginalityCheckedEachTime:true;
 reviewReusedOnlyWithPhase193PublisherBytesAndPolicyScopeMatch:true;knownPublisherDoesNotExcludeNicheSources:true;
 rareProductsNeverAutoExcluded:true;amazonStarsOnlyAreDiscoveryNotIndependentPerformanceEvidence:true;noFullReviewTextRetention:true};
 profiles:readonly Profile196[];
}
const policyKeys=['methodProfileRequiresVersionedReview','articleAndClaimOriginalityCheckedEachTime',
 'reviewReusedOnlyWithPhase193PublisherBytesAndPolicyScopeMatch','knownPublisherDoesNotExcludeNicheSources',
 'rareProductsNeverAutoExcluded','amazonStarsOnlyAreDiscoveryNotIndependentPerformanceEvidence','noFullReviewTextRetention'];
/** Seed is curated and self-reported: loading it is not an authentication procedure. */
export function validatePublisherSeed196(seed:PublisherSeed196):void{
 strict(seed,['schema','sourceKind','verification','snapshotDate','purpose','automaticallyTrustedTestEvents',
  'automaticDocumentScreenBypass','automaticOriginalityAttribution','policy','profiles']);
 if(seed.schema!=='pee.publisher-method-seed.2026-10-13'||
  seed.sourceKind!=='first_party_published_method_statements_and_program_directories'||
  seed.verification!=='public_web_documentation_checked_not_independent_experimental_audit'||
  seed.purpose!=='research-seed-for-scoped-search-priority_only'||!day(seed.snapshotDate)||
  seed.automaticallyTrustedTestEvents!==false||seed.automaticDocumentScreenBypass!==false||
  seed.automaticOriginalityAttribution!==false)throw Error('phase196_unsafe_seed');
 strict(seed.policy,policyKeys);
 if(policyKeys.some(k=>seed.policy[k as keyof PublisherSeed196['policy']]!==true)||
  !Array.isArray(seed.profiles)||seed.profiles.length>200||
  new Set(seed.profiles.map(x=>x.publisherId)).size!==seed.profiles.length||
  new Set(seed.profiles.map(x=>x.domain)).size!==seed.profiles.length)throw Error('phase196_unsafe_seed');
 for(const p of seed.profiles){
  strict(p,['publisherId','domain','categoryScope','marketScope','methodStatementUrls','statedPractice',
   'limitations','profileStatus','proofLevel','perArticleTestAuthRequired','noGlobalWhitelist']);
  if(!id(p.publisherId)||!domain(p.domain)||
   !arrayOf(p.categoryScope,id)||p.categoryScope.length===0||
   !arrayOf(p.marketScope,marketId)||p.marketScope.length===0||
   !arrayOf(p.methodStatementUrls,safeUrl,30)||!p.methodStatementUrls.length||
   !arrayOf(p.statedPractice,x=>typeof x==='string'&&/^[a-z0-9_]{1,80}$/.test(x))||
   !arrayOf(p.limitations,x=>typeof x==='string'&&/^[a-z0-9-]{1,120}$/.test(x))||
   p.profileStatus!=='methodology_candidate_not_verified_all_articles'||
   p.proofLevel!=='self_reported_method_or_official_registry_scope'||
   p.perArticleTestAuthRequired!==true||p.noGlobalWhitelist!==true)throw Error('phase196_unsafe_profile');
 }
}
export function loadPublisherSeed196(path:string):PublisherSeed196{
 const raw=readFileSync(path,'utf8');if(raw.length>250000)throw Error('phase196_seed_too_large');
 const seed=JSON.parse(raw) as PublisherSeed196;validatePublisherSeed196(seed);return seed;
}
export type MaterialRole196='original_instrumental_claim'|'structured_practical_claim'|
 'derived_citation'|'manufacturer_specification'|'marketplace_stars_only'|'unclassified';
/** Input annotations describe what to inspect next; they do NOT authenticate a test. */
export interface CandidateAnnotation196 {
 sourceId:string;market:string;field:string;protocol:string|null;
 materialRole:MaterialRole196;
 /** Passing old sourceRevision alone NEVER enables Phase193 screening reuse. */
 sourceRevision:SourceRevision193|null;freshPublisherBytes:Uint8Array|null;
}
export type PriorityLane196='method_scope_review'|'new_source_probe'|'unscoped_review'|'derived_followup'|'discovery_only';
export interface ScopedMatrixRow196{
 sourceId:string;publisherId:string|null;publisherKind:'known_method_claim'|'unregistered';
 category:string;market:string;variantId:string;field:string;protocol:string|null;
 methodCategoryScopeMatched:boolean;methodMarketScopeMatched:boolean;
 fieldProtocolMethodAuthenticated:false;publisherMethodSelfReported:boolean;
 practiceClaims:readonly string[];methodStatementUrls:readonly string[];
 materialRole:MaterialRole196;claimCount:number;claimedOriginalCount:number;
 previousScreeningVerdict:ReuseVerdict193|'fresh_publisher_bytes_required';
 priorScreeningReused:boolean;independentTestAdmitted:false;
 historicalDocumentScreens:number;historicalOriginalTestCandidates:number;
 historicalScopesAreNotPerformanceRates:true;
 lineageReviewSignals:readonly string[];anomalies:readonly string[];
 priorityLane:PriorityLane196;nextAction:'source_and_claim_review'|'look_for_independent_method'|
  'originality_and_test_event_review'|'discovery_only_preserve_products';
}
export interface SourceQueue196{sourceId:string;lane:PriorityLane196;
 purpose:'research_only';claimedIndependenceUnverified:true;}
export interface SourceMatrix196{
 schema:'196.1';state:'research_only';batchId:string;seedSnapshot:string;seedFingerprint:string;
 rows:readonly ScopedMatrixRow196[];reviewQueue:readonly SourceQueue196[];
 explorationIncluded:boolean;queueCap:number;unqueuedSourceCount:number;
 coverage:readonly {category:string;variantId:string;sourceCount:number;originalTestsVerified:0;
   noTestsDoesNotImplyPoorProduct:true}[];
 sourceBodiesStored:false;reviewDecisionsAreNotTestAuthentication:true;
 universalPublisherScoreUsed:false;publisherWhitelistUsed:false;
 verifiedOriginalExperiments:0;experimentMergesAuthorized:false;publicRankingAllowed:false;
}
function getProfile(url:string,seed:PublisherSeed196):Profile196|null{
 const hostname=new URL(url).hostname.toLowerCase();
 return seed.profiles.find(p=>hostname===p.domain||hostname.endsWith('.'+p.domain))??null;
}
/** Count only latest human screens on claimed original-publisher-byte BASIS within the exact
 * source category/market/field scope. These are selective reviewed decisions,
 * NOT authenticated source custody, representative publication/test-originality frequencies or verified experiments. */
function history(ledger:ScreeningLedger193,p:Profile196|null,category:string,market:string,field:string,url:string){
 const host=new URL(url).hostname;
 const latest=new Map<string,(typeof ledger.events)[number]>();
 for(const e of ledger.events){const x=e.decision;
  if(x.reviewBasis!=='human_source_screen'||x.source.contentBasis!=='publisher_bytes'||
   x.source.category!==category||x.source.market!==market||
   !(x.scope==='document'||x.source.field===field)||!(p?(new URL(x.source.url).hostname===p.domain||new URL(x.source.url).hostname.endsWith('.'+p.domain)):
    new URL(x.source.url).hostname===host))continue;
  const key=normalizeDiscoveryUrl192(x.source.url)+'|'+x.scope+'|'+(x.scope==='field'?field:'document')+'|'+x.source.variantId;
  latest.set(key,e);
 }
 const decisions=[...latest.values()].map(e=>e.decision);
 return {screens:decisions.length,candidates:decisions.filter(d=>d.action==='original_evidence_candidate').length};
}
const laneOrder:Record<PriorityLane196,number>={method_scope_review:0,new_source_probe:1,unscoped_review:2,derived_followup:3,discovery_only:4};
/** The only ordering goal is where to investigate first. No source reputation is
 * used to change product evidence weights or final recommendation rankings.
 * A new unfamiliar source competes for a reserved exploration slot (cap>=2).
 */
export function planSourceReviews196(args:{batch:BatchResult195;ledger:ScreeningLedger193;
 seed:PublisherSeed196;annotations:readonly CandidateAnnotation196[];maxQueue?:number}):SourceMatrix196{
 const {batch,ledger,seed,annotations}=args;
 validatePublisherSeed196(seed);validateLedger193(ledger);
 if(!batch||batch.schema!=='195.1'||batch.state!=='research_only'||batch.sourceBodiesStored!==false||
  batch.originalTestIdentityVerified!==false||batch.testEventMergesAuthorized!==false||
  batch.publicRankingAllowed!==false||batch.skipFutureSourceScreeningWithoutFreshRead!==false||
  !Array.isArray(batch.sources)||!Array.isArray(batch.coverage)||!Array.isArray(batch.documentCandidates)||
  !Array.isArray(batch.measurementCollisions)||!Array.isArray(batch.explicitAttribution)||
  !Array.isArray(batch.chronologyAlerts)||!id(batch.batchId)||
  !Array.isArray(annotations)||annotations.length!==batch.sources.length||annotations.length>1500)
  throw Error('phase196_invalid_batch');
 const cap=args.maxQueue??annotations.length;
 if(!Number.isSafeInteger(cap)||cap<0||cap>1500)throw Error('phase196_invalid_queue_cap');
 const sourceMap=new Map(batch.sources.map(x=>[x.sourceId,x]));
 if(sourceMap.size!==batch.sources.length||new Set(annotations.map(x=>x.sourceId)).size!==annotations.length)
  throw Error('phase196_duplicate_source');
 const rows:ScopedMatrixRow196[]=[];
 for(const a of annotations){
  const s=sourceMap.get(a?.sourceId);
  if(!s||!marketId(a.market)||!id(a.field)||a.protocol!==null&&!id(a.protocol)||
   !(['original_instrumental_claim','structured_practical_claim','derived_citation',
     'manufacturer_specification','marketplace_stars_only','unclassified'] as string[]).includes(a.materialRole)||
   !id(s.category)||!id(s.variantId)||!safeUrl(s.url)||s.needsFreshPublisherCheck!==true||
   s.status!=='original_origin_unverified'||!Number.isSafeInteger(s.claimCount)||s.claimCount<0||
   !Number.isSafeInteger(s.claimedOriginalCount)||s.claimedOriginalCount<0||
   s.claimedOriginalCount>s.claimCount)throw Error('phase196_invalid_annotation');
  if(a.freshPublisherBytes!==null&&(!(a.freshPublisherBytes instanceof Uint8Array)||a.freshPublisherBytes.length>2_000_000||!a.sourceRevision))
   throw Error('phase196_invalid_fresh_bytes');
  if(a.sourceRevision!==null){const rev=a.sourceRevision;
   if(rev.sourceId!==s.sourceId||normalizeDiscoveryUrl192(rev.url)!==normalizeDiscoveryUrl192(s.url)||
    rev.category!==s.category||rev.variantId!==s.variantId||rev.market!==a.market||
    (rev.field!==null&&rev.field!==a.field))throw Error('phase196_cross_scope_revision');
  }
  const p=getProfile(s.url,seed);
  // The seed's generic / regional phrases are NOT grants of verified applicability.
  const categoryMatched=p?.categoryScope.includes(s.category)??false;
  const marketMatched=p?.marketScope.includes(a.market)??false;
  const methodologicalRelevance=categoryMatched&&marketMatched;
  const reuse=a.sourceRevision!==null&&a.freshPublisherBytes!==null?
   checkFreshPublisherSnapshot194({ledger,revision:a.sourceRevision,
    freshPublisherBytes:a.freshPublisherBytes,scope:'field'}):null;
  const verdict=reuse?.verdict??'fresh_publisher_bytes_required';
  const reused=verdict==='reuse_screening_decision';
  const scopedHistory=history(ledger,p,s.category,a.market,a.field,s.url);
  const cues:string[]=[];
  for(const l of batch.documentCandidates)if(l.sourceA===s.sourceId||l.sourceB===s.sourceId)
   cues.push('document_candidate_'+l.reason);
  for(const l of batch.measurementCollisions)if(l.sourceA===s.sourceId||l.sourceB===s.sourceId)
   cues.push('identical_scoped_number_not_test_identity');
  for(const l of batch.explicitAttribution)if(l.from===s.sourceId||l.to===s.sourceId)
   cues.push('unverified_explicit_attribution');
  for(const l of batch.chronologyAlerts)if(l.sourceId===s.sourceId||l.relatedSourceId===s.sourceId)
   cues.push('chronology_requires_review');
  const anomalies:string[]=[];
  if(a.materialRole==='marketplace_stars_only'&&s.claimedOriginalCount>0)
   anomalies.push('marketplace_vs_claimed_original_conflict');
  if(a.materialRole==='manufacturer_specification'&&s.claimedOriginalCount>0)
   anomalies.push('manufacturer_vs_claimed_original_conflict');
  if(reuse&&reuse.verdict!=='reuse_screening_decision')anomalies.push('previous_decision_not_reusable');
  if(p&&(!methodologicalRelevance))anomalies.push('publisher_profile_out_of_scope');
  if(p&&a.protocol!==null)anomalies.push('protocol_requires_article_level_method_check');
  let lane:PriorityLane196;
  const conflicting=anomalies.includes('marketplace_vs_claimed_original_conflict')||
   anomalies.includes('manufacturer_vs_claimed_original_conflict');
  const excluded=reused&&reuse?.reused?.action==='discovery_only';
  if((a.materialRole==='marketplace_stars_only'&&!conflicting)||excluded)lane='discovery_only';
  else if(a.materialRole==='derived_citation'||a.materialRole==='manufacturer_specification')lane='derived_followup';
  else if(!p&&['original_instrumental_claim','structured_practical_claim'].includes(a.materialRole))lane='new_source_probe';
  else if(p&&methodologicalRelevance&&['original_instrumental_claim','structured_practical_claim'].includes(a.materialRole))lane='method_scope_review';
  else lane='unscoped_review';
  const nextAction=lane==='discovery_only'?'discovery_only_preserve_products':
   lane==='derived_followup'?'look_for_independent_method':
   cues.length||conflicting?'originality_and_test_event_review':'source_and_claim_review';
  rows.push({sourceId:s.sourceId,publisherId:p?.publisherId??null,
   publisherKind:p?'known_method_claim':'unregistered',category:s.category,market:a.market,
   variantId:s.variantId,field:a.field,protocol:a.protocol,
   methodCategoryScopeMatched:categoryMatched,methodMarketScopeMatched:marketMatched,
   fieldProtocolMethodAuthenticated:false,publisherMethodSelfReported:p!==null,
   practiceClaims:p&&methodologicalRelevance?[...p.statedPractice].sort():[],
   methodStatementUrls:p&&methodologicalRelevance?[...p.methodStatementUrls].sort():[],
   materialRole:a.materialRole,claimCount:s.claimCount,claimedOriginalCount:s.claimedOriginalCount,
   previousScreeningVerdict:verdict,priorScreeningReused:reused,independentTestAdmitted:false,
   historicalDocumentScreens:scopedHistory.screens,
   historicalOriginalTestCandidates:scopedHistory.candidates,
   historicalScopesAreNotPerformanceRates:true,
   lineageReviewSignals:[...new Set(cues)].sort(),anomalies:[...new Set(anomalies)].sort(),
   priorityLane:lane,nextAction});
 }
 const ordered=rows.sort((a,b)=>laneOrder[a.priorityLane]-laneOrder[b.priorityLane]||
  a.category.localeCompare(b.category,'en')||a.variantId.localeCompare(b.variantId,'en')||
  a.field.localeCompare(b.field,'en')||a.sourceId.localeCompare(b.sourceId,'en'));
 // 1 in-scope unfamiliar source among first 2 whenever possible. No exclusive whitelist.
 const unknown=ordered.find(x=>x.priorityLane==='new_source_probe');
 const picked=ordered.slice(0,cap);
 if(cap>=2&&unknown&&!picked.includes(unknown))picked[cap-1]=unknown;
 const queue=picked.map(x=>({sourceId:x.sourceId,lane:x.priorityLane,
  purpose:'research_only' as const,claimedIndependenceUnverified:true as const}));
 const coverage=batch.coverage.map(c=>({category:c.category,variantId:c.variantId,
  sourceCount:c.sourceCount,originalTestsVerified:0 as const,noTestsDoesNotImplyPoorProduct:true as const}));
 return {schema:'196.1',state:'research_only',batchId:batch.batchId,seedSnapshot:seed.snapshotDate,
  seedFingerprint:sha(JSON.stringify(seed)),rows:ordered,reviewQueue:queue,queueCap:cap,
  explorationIncluded:queue.some(q=>q.lane==='new_source_probe'),
  unqueuedSourceCount:ordered.length-queue.length,coverage,sourceBodiesStored:false,
  reviewDecisionsAreNotTestAuthentication:true,universalPublisherScoreUsed:false,
  publisherWhitelistUsed:false,verifiedOriginalExperiments:0,experimentMergesAuthorized:false,
  publicRankingAllowed:false};
}
/** Read-only research-job bridge. Does not change Phase182's protected priorities,
 * source-acquisition permissions or any evidence admission. */
export function linkSourceQueueToResearch182(plan:ResearchPlan182,matrix:SourceMatrix196){
 if(!plan||plan.phase!==182||plan.schema!=='182.1'||plan.rankingAuthorized!==false||
  plan.planningOnly!==true||!Array.isArray(plan.jobs)||matrix?.schema!=='196.1'||
  matrix.publicRankingAllowed!==false)throw Error('phase196_invalid_182_plan');
 return plan.jobs.filter(j=>j.kind==='exact_variant_source_research').map(j=>({
  jobId:j.jobId,exactVariantId:j.exactVariantId,criterionId:j.criterionId,
  prioritizedSourceIds:matrix.reviewQueue.map(q=>matrix.rows.find(r=>r.sourceId===q.sourceId)!)
   .filter(r=>r.category===plan.categoryId&&r.variantId===j.exactVariantId&&
    (j.criterionId===null||r.field===j.criterionId)).map(r=>r.sourceId),
  executionUnchanged:true as const,sourceEvidenceAdmitted:false as const}));
}
