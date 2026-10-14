/**
 * Phase136 — original, dependency-free, English-first evidence-screen benchmark.
 *
 * This evaluates a *screening pipeline*, not product truth. Gold annotations,
 * source rights, reviewer identities, source independence, and preregistration
 * are caller attestations, not authenticated by this program. No result may
 * be sent to the ranking system or canonical knowledge writers.
 *
 * Engineering inspirations: Snorkel LF coverage/conflict/slices; TypeSafe
 * atomic decisions; DeepKE document-scoped evidence; GLiNER2 abstention and
 * fixed candidate sets. NO imported implementations or external models.
 */
import {createHash} from 'node:crypto';
import {buildDocumentMentionGraph135,inspectDocumentBridge135,
 type MentionInput135,type ReferenceReview135,type BridgeStatus135} from './phase135_document_mention_graph.js';
import {inspectLearnedProposal134,auditSignals134,
 type IndependentSignal134,type SignalStatus134} from './phase134_atomic_context_evidence.js';
import type {RelationDocument131,CandidateRelation131} from './phase131_local_relation_learning.js';

const hash136=(s:string)=>createHash('sha256').update(s).digest('hex');
const identifier136=(s:unknown):s is string=>typeof s==='string'&&/^[\w.:-]{1,100}$/.test(s);
const stable136=(v:unknown)=>JSON.stringify(v);
export type GoldEvidence136='supported_by_passage'|'contradicted_by_passage'|'indeterminate_from_passage';
export type ScreenDecision136='candidate_quarantined'|'rejected_by_screen'|'abstain'|'invalid';
export type Phenomenon136='pronoun'|'multiple_products'|'component_competitor'|'variant'|'negative_scope'|
 'manufacturer_attribution'|'protocol_scope'|'indirect_reference'|'other';
export interface GoldVote136 {annotatorId:string;label:GoldEvidence136;}
export interface CaseMetadata136 {
  sourceGroupId:string;productFamilyId:string;categoryId:string;
  origin:'constructed'|'original_professional';
  permission:'evaluation_authorized'|'not_established';
  phenomena:readonly Phenomenon136[];
}
export interface BenchmarkCase136 {
  id:string;split:'development'|'frozen_holdout';metadata:CaseMetadata136;
  document:RelationDocument131;mentions:readonly MentionInput135[];
  reviewedLinks?:readonly ReferenceReview135[];
  proposal:CandidateRelation131;subjectMentionId:string;objectMentionId:string;
  signals?:readonly IndependentSignal134[];
  /** The annotation provider attests to independent votes; this system cannot authenticate that fact. */
  goldVotes?:readonly GoldVote136[];
}
export interface CaseDecision136 {
  id:string;split:BenchmarkCase136['split'];sourceGroupId:string;categoryId:string;
  phenomena:Phenomenon136[];screen:ScreenDecision136;phase135Status:BridgeStatus135;
  phase134Baseline:ScreenDecision136;signalStatus:SignalStatus134;
  signalFamilies:string[];signalConflictingFamilies:string[];gold:GoldEvidence136|null;
  goldUsableForDescriptiveScoring:boolean;goldExclusionReason:string|null;
  canonicalWriteAuthorized:false;rankingAuthorized:false;
}
export interface ScreeningStats136 {
  total:number;screened:number;rejected:number;abstained:number;invalid:number;
  baselineScreened:number;baselineInvalid:number;coverage:number|null;baselineCoverage:number|null;
  goldSupportedCases:number;falseAcceptCount:number;baselineFalseAcceptCount:number;
  acceptedContradictedCount:number;acceptedIndeterminateCount:number;
  falseRejectSupportedCount:number;baselineFalseRejectSupportedCount:number;
  supportedRecallAmongGoldSupported:number|null;baselineSupportedRecallAmongGoldSupported:number|null;
  falseAcceptRateAmongScreened:number|null;baselineFalseAcceptRateAmongScreened:number|null;
  textualSupportPrecisionAmongScreened:number|null;baselineTextualSupportPrecisionAmongScreened:number|null;
  abstentionRate:number|null;
}
export interface SignalStats136 {
  caseCount:number;nonAbstainVoteCases:number;signalCoverage:number|null;
  overlapCases:number;conflictCases:number;conflictRateAmongVoted:number|null;
  familyCounts:{family:string;votes:number;cases:number;supports:number;opposes:number;abstains:number}[];
}
export interface CorpusEvaluation136 {
 phase:136;manifestDigest:string;referenceManifestMatched:boolean;
 preregistrationIndependentlyVerified:false;annotationIdentityVerified:false;
 rightsVerifiedByThisModule:false;signalFamilyIndependenceVerified:false;
 rankingAuthorized:false;canonicalWriteAuthorized:false;scientificAccuracyClaimAuthorized:false;
 counts:{development:number;holdout:number;descriptivelyScorableHoldout:number;holdoutExcluded:number};
 holdout:ScreeningStats136;byPhenomenon:Record<string,ScreeningStats136>;
 byCategory:Record<string,ScreeningStats136>;
 bySourceGroup:Record<string,ScreeningStats136>;
 signals:SignalStats136;cases:CaseDecision136[];
 warnings:string[];
}
function validateCase136(c:BenchmarkCase136):void {
 if(!c||!identifier136(c.id)||!['development','frozen_holdout'].includes(c.split)||
  !c.metadata||!identifier136(c.metadata.sourceGroupId)||
  !identifier136(c.metadata.productFamilyId)||!identifier136(c.metadata.categoryId)||
  !['constructed','original_professional'].includes(c.metadata.origin)||
  !['evaluation_authorized','not_established'].includes(c.metadata.permission)||
  !Array.isArray(c.metadata.phenomena)||c.metadata.phenomena.length>10||
  c.metadata.phenomena.some(p=>!(['pronoun','multiple_products','component_competitor','variant',
   'negative_scope','manufacturer_attribution','protocol_scope','indirect_reference','other'] as const).includes(p))||
  !identifier136(c.subjectMentionId)||!identifier136(c.objectMentionId)||
  !c.document||typeof c.document.text!=='string'||c.document.text.length>250000||
  c.document.sha256!==hash136(c.document.text)||
  !c.document.source||!identifier136(c.document.source.id)||
  !identifier136(c.document.source.originalDocumentId)||
  !/^https:\/\//.test(c.document.source.url??'')||
  !Array.isArray(c.mentions)||!Array.isArray(c.reviewedLinks??[])||
  !Array.isArray(c.signals??[])||!Array.isArray(c.goldVotes??[])||
  (c.goldVotes?.length??0)>12)throw Error('invalid_benchmark_case_136');
 const annotators=new Set<string>();
 for(const vote of c.goldVotes??[]){
  if(!vote||!identifier136(vote.annotatorId)||annotators.has(vote.annotatorId)||
   !(['supported_by_passage','contradicted_by_passage','indeterminate_from_passage'] as const).includes(vote.label))
   throw Error('invalid_gold_votes_136');
  annotators.add(vote.annotatorId);
 }
 // Always validate weak votes even where the Phase135 bridge abstains.
 auditSignals134(c.signals??[]);
}
function validateCorpus136(cases:readonly BenchmarkCase136[]):void {
 if(!Array.isArray(cases)||cases.length>500)throw Error('unbounded_corpus_136');
 const ids=new Set<string>(),sourceDev=new Set<string>(),productDev=new Set<string>(),
  sourceHold=new Set<string>(),productHold=new Set<string>(),hostDev=new Set<string>(),hostHold=new Set<string>(),
  documents=new Map<string,string>();
 for(const c of cases){
  validateCase136(c);
  if(ids.has(c.id))throw Error('duplicate_case_136');ids.add(c.id);
  const dest=c.split==='development'?[sourceDev,productDev]:[sourceHold,productHold];
  dest[0].add(c.metadata.sourceGroupId);dest[1].add(c.metadata.productFamilyId);
  const host=new URL(c.document.source.url).hostname.toLowerCase();
  (c.split==='development'?hostDev:hostHold).add(host);
  const snapshot=c.document.sha256;
  if(documents.has(snapshot)&&documents.get(snapshot)!==c.split)throw Error('duplicate_document_leakage_136');
  documents.set(snapshot,c.split);
 }
 if([...sourceDev].some(x=>sourceHold.has(x)))throw Error('source_group_leakage_136');
 if([...hostDev].some(x=>hostHold.has(x)))throw Error('source_hostname_leakage_136');
 if([...productDev].some(x=>productHold.has(x)))throw Error('product_group_leakage_136');
}
/** A deterministic hash of the entire declared protocol and its gold votes.
 * It detects *later* changes if an expected digest was preserved elsewhere;
 * computing it here does NOT establish when a benchmark was frozen. */
export function manifestDigest136(cases:readonly BenchmarkCase136[]):string {
 validateCorpus136(cases);
 return hash136(stable136(cases.map(c=>({
  id:c.id,split:c.split,metadata:{...c.metadata,phenomena:[...new Set(c.metadata.phenomena)].sort()},
  source:{id:c.document.source.id,originalDocumentId:c.document.source.originalDocumentId,
   url:c.document.source.url},documentSha256:c.document.sha256,
  mentions:[...c.mentions].sort((a,b)=>a.id.localeCompare(b.id)),
  reviewedLinks:[...(c.reviewedLinks??[])].sort((a,b)=>a.id.localeCompare(b.id)),
  proposal:c.proposal,subjectMentionId:c.subjectMentionId,objectMentionId:c.objectMentionId,
  signals:[...(c.signals??[])].sort((a,b)=>a.id.localeCompare(b.id)),
  goldVotes:[...(c.goldVotes??[])].sort((a,b)=>a.annotatorId.localeCompare(b.annotatorId))
 })).sort((a,b)=>a.id.localeCompare(b.id))));
}
function normalizedScreen136(status:BridgeStatus135):ScreenDecision136 {
 if(status==='quarantined_cross_sentence_hypothesis')return 'candidate_quarantined';
 if(status==='rejected_by_context')return 'rejected_by_screen';
 if(status==='invalid_proposal')return 'invalid';
 return 'abstain';
}
function goldInfo136(c:BenchmarkCase136):{gold:GoldEvidence136|null;reason:string|null;eligible:boolean}{
 if(c.split!=='frozen_holdout')return {gold:null,reason:'development_only',eligible:false};
 if(c.metadata.origin!=='original_professional')return {gold:null,reason:'constructed_not_original',eligible:false};
 if(c.metadata.permission!=='evaluation_authorized')return {gold:null,reason:'source_rights_not_established',eligible:false};
 if(!c.goldVotes||c.goldVotes.length<2)return {gold:null,reason:'two_independent_votes_missing',eligible:false};
 const unique=[...new Set(c.goldVotes.map(x=>x.label))];
 if(unique.length!==1)return {gold:null,reason:'gold_annotator_disagreement',eligible:false};
 return {gold:unique[0],reason:null,eligible:true};
}
export function screenCase136(c:BenchmarkCase136):CaseDecision136 {
 validateCase136(c);
 // Phase135 reconstructs source-backed graph rather than trusting a claimed
 // "resolved" edge in a serialized object.
 const graph=buildDocumentMentionGraph135({document:c.document,mentions:c.mentions,reviewedLinks:c.reviewedLinks});
 const bridge=inspectDocumentBridge135({document:c.document,graph,proposal:c.proposal,
  subjectMentionId:c.subjectMentionId,objectMentionId:c.objectMentionId});
 const audit=auditSignals134(c.signals??[]);
 let screen=normalizedScreen136(bridge.status);
 let baseline:ScreenDecision136='invalid';
 try{
  const atomic=inspectLearnedProposal134({document:c.document,proposal:c.proposal,signals:c.signals});
  baseline=atomic.status==='quarantined_candidate'?'candidate_quarantined':
   atomic.status==='rejected_candidate'?'rejected_by_screen':
   atomic.status==='invalid_source'?'invalid':'abstain';
  // Phase134 weak-signal audits must be enforced even if Phase135's own
  // bridge ran without signal input. Phase135 can never be bypassed by votes.
  if(screen==='candidate_quarantined')screen=baseline;
 }catch{baseline='invalid';if(screen==='candidate_quarantined')screen='invalid';}
 const gold=goldInfo136(c);
 return {id:c.id,split:c.split,sourceGroupId:c.metadata.sourceGroupId,categoryId:c.metadata.categoryId,
  phenomena:[...new Set(c.metadata.phenomena)].sort(),screen,phase135Status:bridge.status,
  phase134Baseline:baseline,signalStatus:audit.status,
  signalFamilies:[...new Set((c.signals??[]).map(s=>s.family))].sort(),
  // Show *all* sides of the conflict, including when each family votes in only
  // one direction. Intersection alone would incorrectly hide this conflict.
  signalConflictingFamilies:audit.status==='conflicting_signals'?
   [...new Set([...audit.supportFamilies,...audit.opposeFamilies])].sort():[],
  gold:gold.gold,goldUsableForDescriptiveScoring:gold.eligible,goldExclusionReason:gold.reason,
  rankingAuthorized:false,canonicalWriteAuthorized:false};
}
function stats136(rows:CaseDecision136[]):ScreeningStats136 {
 const total=rows.length, screened=rows.filter(r=>r.screen==='candidate_quarantined').length,
  rejected=rows.filter(r=>r.screen==='rejected_by_screen').length,
  invalid=rows.filter(r=>r.screen==='invalid').length, abstained=total-screened-rejected-invalid;
 const accepted=rows.filter(r=>r.screen==='candidate_quarantined'),
  oldAccepted=rows.filter(r=>r.phase134Baseline==='candidate_quarantined'),
  supported=rows.filter(r=>r.gold==='supported_by_passage'),
  bad=accepted.filter(r=>r.gold!=='supported_by_passage'),
  oldBad=oldAccepted.filter(r=>r.gold!=='supported_by_passage');
 // evaluateCorpus136 only sends eligible, concordantly labeled holdout rows
 // here. The metrics are descriptive even for attested original sources.
 return {total,screened,rejected,abstained,invalid,
  baselineScreened:oldAccepted.length,
  baselineInvalid:rows.filter(r=>r.phase134Baseline==='invalid').length,
  coverage:total?screened/total:null,baselineCoverage:total?oldAccepted.length/total:null,
  goldSupportedCases:supported.length,falseAcceptCount:bad.length,baselineFalseAcceptCount:oldBad.length,
  acceptedContradictedCount:bad.filter(r=>r.gold==='contradicted_by_passage').length,
  acceptedIndeterminateCount:bad.filter(r=>r.gold==='indeterminate_from_passage').length,
  falseRejectSupportedCount:rows.filter(r=>r.gold==='supported_by_passage'&&r.screen==='rejected_by_screen').length,
  baselineFalseRejectSupportedCount:rows.filter(r=>r.gold==='supported_by_passage'&&r.phase134Baseline==='rejected_by_screen').length,
  supportedRecallAmongGoldSupported:supported.length?
   accepted.filter(r=>r.gold==='supported_by_passage').length/supported.length:null,
  baselineSupportedRecallAmongGoldSupported:supported.length?
   oldAccepted.filter(r=>r.gold==='supported_by_passage').length/supported.length:null,
  falseAcceptRateAmongScreened:screened?bad.length/screened:null,
  baselineFalseAcceptRateAmongScreened:oldAccepted.length?oldBad.length/oldAccepted.length:null,
  textualSupportPrecisionAmongScreened:screened?(screened-bad.length)/screened:null,
  baselineTextualSupportPrecisionAmongScreened:oldAccepted.length?
   (oldAccepted.length-oldBad.length)/oldAccepted.length:null,
  abstentionRate:total?abstained/total:null};
}
function signalStats136(cases:readonly BenchmarkCase136[]):SignalStats136 {
 const map=new Map<string,{votes:number;cases:number;supports:number;opposes:number;abstains:number}>();
 let nonAbstainVoteCases=0,overlapCases=0,conflictCases=0;
 for(const c of cases){
  const signals=c.signals??[],a=auditSignals134(signals);
  const positive=signals.filter(s=>s.vote!=='abstains');
  if(positive.length)nonAbstainVoteCases++;
  if(positive.length>1)overlapCases++;
  if(a.status==='conflicting_signals')conflictCases++;
  for(const family of new Set(signals.map(s=>s.family))){
   const v=signals.filter(s=>s.family===family);
   const item=map.get(family)??{votes:0,cases:0,supports:0,opposes:0,abstains:0};
   item.votes+=v.length;item.cases++;
   item.supports+=v.filter(s=>s.vote==='supports_candidate').length;
   item.opposes+=v.filter(s=>s.vote==='opposes_candidate').length;
   item.abstains+=v.filter(s=>s.vote==='abstains').length;map.set(family,item);
  }
 }
 return {caseCount:cases.length,nonAbstainVoteCases,
  signalCoverage:cases.length?nonAbstainVoteCases/cases.length:null,overlapCases,conflictCases,
  conflictRateAmongVoted:nonAbstainVoteCases?conflictCases/nonAbstainVoteCases:null,
  familyCounts:[...map].map(([family,v])=>({family,...v})).sort((a,b)=>a.family.localeCompare(b.family))};
}
/** Scoring is restricted to attested original texts with two concordant votes.
 * Caller labels/permissions cannot be authenticated; metrics remain descriptive.
 * A digest comparison guards against mutation but NOT against retrospective seal. */
export function evaluateCorpus136(args:{cases:readonly BenchmarkCase136[];expectedManifestDigest:string}):CorpusEvaluation136 {
 const digest=manifestDigest136(args.cases);
 if(!/^[a-f0-9]{64}$/.test(args.expectedManifestDigest??'')||digest!==args.expectedManifestDigest)
  throw Error('manifest_mismatch_136');
 const cases=[...args.cases].sort((a,b)=>a.id.localeCompare(b.id));
 const rows=cases.map(screenCase136);
 const held=rows.filter(r=>r.split==='frozen_holdout'),scorable=held.filter(r=>r.goldUsableForDescriptiveScoring);
 const byPhenomenon:Record<string,ScreeningStats136>={},byCategory:Record<string,ScreeningStats136>={},
  bySourceGroup:Record<string,ScreeningStats136>={};
 for(const p of [...new Set(scorable.flatMap(r=>r.phenomena))].sort())byPhenomenon[p]=stats136(scorable.filter(r=>r.phenomena.includes(p)));
 for(const p of [...new Set(scorable.map(r=>r.categoryId))].sort())byCategory[p]=stats136(scorable.filter(r=>r.categoryId===p));
 for(const p of [...new Set(scorable.map(r=>r.sourceGroupId))].sort())bySourceGroup[p]=stats136(scorable.filter(r=>r.sourceGroupId===p));
 const warnings=['SOURCE_AND_ANNOTATOR_ATTESTATIONS_NOT_AUTHENTICATED',
  'DIGEST_MATCH_DOES_NOT_PROVE_HOLDOUT_WAS_FROZEN_BEFORE_TUNING',
  'ACCEPTED_SCREEN_STATUS_IS_NOT_SCIENTIFIC_TRUTH'];
 if(!scorable.length)warnings.push('NO_INDEPENDENT_ORIGINAL_HOLDOUT_SCORABLE');
 if(scorable.length<30)warnings.push('SMALL_HOLDOUT_NO_POPULATION_ACCURACY_ESTIMATE');
 if(held.length!==scorable.length)warnings.push('SOME_HOLDOUT_CASES_EXCLUDED_FROM_METRICS');
 if(new Set(cases.map(c=>c.document.sha256)).size<cases.length)
  warnings.push('REPEATED_DOCUMENT_SNAPSHOTS_CASES_ARE_NOT_INDEPENDENT_SAMPLES');
 return {phase:136,manifestDigest:digest,referenceManifestMatched:true,
  preregistrationIndependentlyVerified:false,annotationIdentityVerified:false,
  rightsVerifiedByThisModule:false,signalFamilyIndependenceVerified:false,
  rankingAuthorized:false,canonicalWriteAuthorized:false,scientificAccuracyClaimAuthorized:false,
  counts:{development:rows.filter(r=>r.split==='development').length,holdout:held.length,
   descriptivelyScorableHoldout:scorable.length,holdoutExcluded:held.length-scorable.length},
  holdout:stats136(scorable),byPhenomenon,byCategory,bySourceGroup,
  signals:signalStats136(cases),cases:rows,warnings};
}
