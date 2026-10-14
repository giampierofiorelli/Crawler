/** Phase204: source-specific creator credibility, situated opinions and awards.
 * Research-only supplement to Phase182/196/198/203. Never an authority score,
 * award certification engine, transcript archive, ranking update or public badge.
 * External review annotations are documentary *leads*, not authenticated issuers.
 */
import {canonicalYouTubeVideo203,type VideoEvidenceResearch203,
 type VideoEvidenceCandidate203,type VideoSearchPlan203} from './phase203_video_evidence_search.js';
import {type SourceMatrix196} from './phase196_source_intelligence.js';
import {type ResearchPlan182} from './phase182_gap_research_orchestrator.js';

const id=(x:unknown):x is string=>typeof x==='string'&&/^[a-z][a-z0-9_.:-]{0,100}$/.test(x)&&
 !['__proto__','constructor','prototype'].includes(x);
const text=(x:unknown,max=200):x is string=>typeof x==='string'&&x.length>=1&&x.length<=max&&
 x.trim()===x&&!/[<>\u0000-\u001f\u007f]/.test(x);
const date=(x:unknown):x is string=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&
 !Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const validUrl=(x:unknown):x is string=>{if(typeof x!=='string'||x.length>2048)return false;
 try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&
 u.hostname.includes('.')&&!u.hostname.endsWith('.local')&&!['localhost','127.0.0.1','0.0.0.0'].includes(u.hostname);}
 catch{return false;}};
const channel=(x:unknown):x is string=>typeof x==='string'&&/^UC[A-Za-z0-9_-]{22}$/.test(x);
const unique=(xs:readonly string[])=>new Set(xs).size===xs.length;
const err=(why:string):never=>{throw Error('phase204_'+why);};
const sorted=<T extends string>(a:readonly T[]):T[]=>[...new Set(a)].sort();

export type CreatorCueKind204='official_qualification_record'|'documented_professional_practice'|
 'independent_professional_reference'|'independent_critical_coverage'|'self_biography'|
 'copied_publicity'|'commercial_affiliation'|'documented_correction';
/** No credentials are verified by a text model or a creator's About page. */
export interface CreatorCue204 {
 cueId:string;creatorId:string;sourceUrl:string;sourceGroupId:string;
 kind:CreatorCueKind204;disciplineId:string|null;outcomeId:string|null;
 observedOn:string;reviewedRecordId:string|null;
 identityMatchReviewId:string|null;
 originalPublisher:'documented'|'uncertain'|'derived_republication';
 relationship:'independent_reported'|'self_asserted'|'commercially_connected'|'unknown';
}
export interface CreatorAssessmentInput204 {
 research:VideoEvidenceResearch203;channelId:string;creatorId:string;
 disciplineId:string;outcomeId:string;asOf:string;
 /** A creator/channel mapping requires documentary review; a title is insufficient. */
 channelIdentityReviewId:string|null;
 cues:readonly CreatorCue204[];
 /** Declared material connections are not proof that every statement is inaccurate. */
 declaredCommercialRelationship:'declared'|'none_declared_not_audit'|'unknown';
}
export type CreatorLane204='task_specialist_to_verify'|'documented_experience_to_verify'|
 'opinion_and_use_experience'|'unknown_creator_research';
export interface CreatorAssessment204 {
 schema:'204.creator.1';state:'research_only';creatorId:string;channelId:string;
 videoId:string;disciplineId:string;outcomeId:string;
 lane:CreatorLane204;credentialHints:readonly string[];experienceHints:readonly string[];
 reputationHints:readonly string[];commercialOrDisputeCues:readonly string[];
 missingChecks:readonly string[];
 /** An opinion remains a person's preference, not automatically a product experiment. */
 opinionObservations:readonly {observationId:string;urlAtTime:string;
  criterionId:string;kind:'personal_preference_or_use_report';
  finding:'supports'|'contradicts'|'inconclusive';reviewStatus:'human_annotated'|'ai_unverified';
  mayInformUserExperienceResearch:true;instrumentalTestAdmitted:false;specialistValidationAdmitted:false}[];
 independentReferenceGroups:number;subscriptionsOrViewsUsed:false;nationalityUsedAsCredential:false;
 sourceProfileIsNotClaimAuthentication:true;ratingOrUniversalScore:null;
 rankingAuthorized:false;trustBadgeAuthorized:false;noVideoOrTranscriptTextStored:true;
}
/** Documentary credibility signals support WHERE TO RESEARCH, not whether a specific
 * video claim is true. One article republished ten times is only one reference group. */
export function assessCreatorCredibility204(a:CreatorAssessmentInput204):CreatorAssessment204{
 const r=a?.research;
 if(!r||r.schema!=='203.evidence.1'||r.state!=='research_only'||
  r.rankingAuthorized!==false||r.transcriptPersisted!==false||r.consumerBadgeAuthorized!==false||
  !channel(a.channelId)||!id(a.creatorId)||!id(a.disciplineId)||!id(a.outcomeId)||
  !date(a.asOf)||(a.channelIdentityReviewId!==null&&!id(a.channelIdentityReviewId))||
  !['declared','none_declared_not_audit','unknown'].includes(a.declaredCommercialRelationship)||
  !Array.isArray(a.cues)||a.cues.length>100||!unique(a.cues.map(x=>x.cueId))||
  !Array.isArray(r.candidates)||r.candidates.length>200)err('input');
 const canonical=canonicalYouTubeVideo203(r.url);
 if(canonical.videoId!==r.videoId)err('video_identity');
 const credential:string[]=[],experience:string[]=[],reputation:string[]=[],conflict:string[]=[];
 const independentGroups=new Set<string>();
 for(const c of a.cues){
  if(!id(c?.cueId)||c.creatorId!==a.creatorId||!validUrl(c.sourceUrl)||!id(c.sourceGroupId)||
   !['official_qualification_record','documented_professional_practice',
    'independent_professional_reference','independent_critical_coverage','self_biography',
    'copied_publicity','commercial_affiliation','documented_correction'].includes(c.kind)||
   (c.disciplineId!==null&&!id(c.disciplineId))||(c.outcomeId!==null&&!id(c.outcomeId))||
   !date(c.observedOn)||c.observedOn>a.asOf||
   (c.reviewedRecordId!==null&&!id(c.reviewedRecordId))||
   (c.identityMatchReviewId!==null&&!id(c.identityMatchReviewId))||
   !['documented','uncertain','derived_republication'].includes(c.originalPublisher)||
   !['independent_reported','self_asserted','commercially_connected','unknown'].includes(c.relationship))err('cue');
  const scoped=c.disciplineId===a.disciplineId&&c.outcomeId===a.outcomeId;
  const checked=!!a.channelIdentityReviewId&&!!c.reviewedRecordId&&!!c.identityMatchReviewId&&
   c.originalPublisher==='documented';
  const independent=checked&&c.relationship==='independent_reported';
  if(independent)independentGroups.add(c.sourceGroupId);
  if(scoped&&independent&&c.kind==='official_qualification_record')credential.push(c.cueId);
  if(scoped&&independent&&c.kind==='documented_professional_practice')experience.push(c.cueId);
  if(independent&&['independent_professional_reference','independent_critical_coverage'].includes(c.kind))
   reputation.push(c.cueId);
  if(['commercial_affiliation','documented_correction','copied_publicity'].includes(c.kind))conflict.push(c.cueId);
 }
 const observed=r.candidates.filter(x=>x.disciplineId===a.disciplineId&&x.outcomeId===a.outcomeId&&
  x.mode==='specialist_practical_opinion');
 const opinions=observed.map(x=>({observationId:x.observationId,urlAtTime:x.urlAtTime,
  criterionId:x.criterionId,kind:'personal_preference_or_use_report' as const,
  finding:x.finding,reviewStatus:x.sourceBasis==='human_annotation'?'human_annotated' as const:
   'ai_unverified' as const,mayInformUserExperienceResearch:true as const,
  instrumentalTestAdmitted:false as const,specialistValidationAdmitted:false as const}))
  .sort((x,y)=>x.observationId.localeCompare(y.observationId));
 const lane:CreatorLane204=credential.length>0?'task_specialist_to_verify':
  experience.length>0?'documented_experience_to_verify':opinions.length>0?
  'opinion_and_use_experience':'unknown_creator_research';
 const missing:string[]=[];
 if(!a.channelIdentityReviewId)missing.push('creator_channel_identity_not_documented');
 if(!credential.length&&!experience.length)missing.push('task_specific_competence_unconfirmed');
 if(a.declaredCommercialRelationship==='unknown')missing.push('commercial_relationship_unknown');
 if(!independentGroups.size)missing.push('no_independent_documentary_reference_checked');
 if(opinions.some(o=>o.reviewStatus==='ai_unverified'))missing.push('video_opinions_need_human_check');
 return {schema:'204.creator.1',state:'research_only',creatorId:a.creatorId,channelId:a.channelId,
  videoId:r.videoId,disciplineId:a.disciplineId,outcomeId:a.outcomeId,lane,
  credentialHints:sorted(credential),experienceHints:sorted(experience),reputationHints:sorted(reputation),
  commercialOrDisputeCues:sorted(conflict),missingChecks:missing,
  opinionObservations:opinions,independentReferenceGroups:independentGroups.size,
  subscriptionsOrViewsUsed:false,nationalityUsedAsCredential:false,
  sourceProfileIsNotClaimAuthentication:true,ratingOrUniversalScore:null,
  rankingAuthorized:false,trustBadgeAuthorized:false,noVideoOrTranscriptTextStored:true};
}

/** Phase182 work-id and Phase203 discovered-video constraint are preserved.
 * Only produce queries to attach to EXISTING source research; no new crawler or queue. */
export function planCreatorLateralChecks204(a:{plan:ResearchPlan182;videoPlan:VideoSearchPlan203;
 matrix:SourceMatrix196;jobId:string;creatorLabel:string;disciplineId:string;outcomeId:string;
 maxQueries?:number}):{schema:'204.lateral.1';researchOnly:true;jobId:string;
 queries:readonly {query:string;purpose:'competence'|'external_reputation'|'award_authentication';
  sourcePriority:'open_exploration';reviewRequired:true}[];newResearchQueue:false;rankingAuthorized:false}{
 const max=a.maxQueries??4;
 if(!a.plan||a.plan.schema!=='182.1'||a.plan.planningOnly!==true||
  !a.videoPlan||a.videoPlan.schema!=='203.1'||a.videoPlan.researchPlanHash!==a.plan.planHash||
  !a.matrix||a.matrix.schema!=='196.1'||a.matrix.state!=='research_only'||
  !id(a.jobId)||!a.plan.jobs.some(x=>x.jobId===a.jobId&&x.kind==='exact_variant_source_research')||
  !a.videoPlan.tasks.some(x=>x.jobId===a.jobId)||!text(a.creatorLabel,110)||
  !id(a.disciplineId)||!id(a.outcomeId)||!Number.isSafeInteger(max)||max<1||max>4)
  err('lateral_scope');
 const q=[
  {query:`"${a.creatorLabel}" ${a.disciplineId.replaceAll('_',' ')} professional qualifications`,purpose:'competence' as const},
  {query:`"${a.creatorLabel}" independent reviews corrections expertise`,purpose:'external_reputation' as const},
  {query:`"${a.creatorLabel}" ${a.outcomeId.replaceAll('_',' ')} experience`,purpose:'competence' as const},
  {query:`"${a.creatorLabel}" award winner official jury registry`,purpose:'award_authentication' as const}
 ].slice(0,max).map(x=>({...x,sourcePriority:'open_exploration' as const,reviewRequired:true as const}));
 return {schema:'204.lateral.1',researchOnly:true,jobId:a.jobId,queries:q,newResearchQueue:false,
  rankingAuthorized:false};
}

export type AwardScope204='design'|'innovation'|'sustainability'|'practical_performance'|
 'specialist_outcome'|'consumer_popularity'|'creator_career';
export type AwardMethod204='design_jury'|'application_jury_not_product_test'|
 'structured_original_test'|'structured_practical_jury'|'public_vote'|'unverified';
export interface AwardCandidate204{
 awardId:string;issuerId:string;programmeId:string;edition:string;
 winnerKind:'product'|'creator';winnerId:string;variantId:string|null;
 awardScope:AwardScope204;method:AwardMethod204;sourceUrl:string;
 issuerRecordReviewId:string|null;exactVariantReviewId:string|null;
 methodReviewId:string|null;disciplineId:string|null;outcomeId:string|null;
 awardStatus:'active_claimed'|'issuer_entry_reviewed'|'withdrawn'|'expired'|'unknown';
 relationship:'no_relation_disclosed_not_audit'|'fee_or_licensing_disclosed'|
  'sponsorship_disclosed'|'unknown';
 sourceGroupId:string; /** Same award republished in multiple places is ONE award. */
}
export interface AwardAssessment204 {
 schema:'204.awards.1';state:'research_only';productId:string;variantId:string;
 awards:readonly {awardId:string;issuerId:string;scope:AwardScope204;
  classification:'issuer_entry_documented_unauthed'|'award_claim_unverified'|
   'outside_variant_or_winner_scope'|'withdrawn_or_expired';
  relevantFor:'design_or_innovation_context'|'practical_use_research'|'consumer_preference_context'|
   'creator_biography_only'|'none';
  authenticAwardExternallyConfirmed:false;originalTestAdmitted:false;
  canServeAsSpecialistValidation:false;sourceUrl:string;
  commercialDisclosure:AwardCandidate204['relationship'];}[];
 uniqueAwardGroups:number;noAwardsCountedAsIndependentExperiments:true;
 issuerVerificationPending:true;productRankingUnchanged:true;publicBadgeAuthorized:false;
 noAwardLogosIncluded:true;
}
/** Award provenance is a different evidence kind from the Phase198 recognition
 * of a task-specific result. Even a genuine design award is not coffee taste proof. */
export function appraiseAwardCandidates204(a:{productId:string;variantId:string;
 entries:readonly AwardCandidate204[]}):AwardAssessment204{
 if(!id(a?.productId)||!id(a.variantId)||!Array.isArray(a.entries)||a.entries.length>200||
  !unique(a.entries.map(x=>x.awardId)))err('award_input');
 const output:AwardAssessment204['awards'][number][]=[];const groups=new Set<string>();
 for(const e of a.entries){
  if(!id(e?.awardId)||!id(e.issuerId)||!id(e.programmeId)||!text(e.edition,60)||
   !['product','creator'].includes(e.winnerKind)||!id(e.winnerId)||
   (e.variantId!==null&&!id(e.variantId))||
   !['design','innovation','sustainability','practical_performance','specialist_outcome',
    'consumer_popularity','creator_career'].includes(e.awardScope)||
   !['design_jury','application_jury_not_product_test','structured_original_test',
    'structured_practical_jury','public_vote','unverified'].includes(e.method)||
   !validUrl(e.sourceUrl)||(e.issuerRecordReviewId!==null&&!id(e.issuerRecordReviewId))||
   (e.exactVariantReviewId!==null&&!id(e.exactVariantReviewId))||
   (e.methodReviewId!==null&&!id(e.methodReviewId))||
   (e.disciplineId!==null&&!id(e.disciplineId))||
   (e.outcomeId!==null&&!id(e.outcomeId))||
   !['active_claimed','issuer_entry_reviewed','withdrawn','expired','unknown'].includes(e.awardStatus)||
   !['no_relation_disclosed_not_audit','fee_or_licensing_disclosed','sponsorship_disclosed','unknown'].includes(e.relationship)||
   !id(e.sourceGroupId))err('award_entry');
  const isProduct=e.winnerKind==='product'&&e.winnerId===a.productId&&e.variantId===a.variantId;
  let classification:AwardAssessment204['awards'][number]['classification'];
  if(e.awardStatus==='withdrawn'||e.awardStatus==='expired')classification='withdrawn_or_expired';
  else if(!isProduct)classification='outside_variant_or_winner_scope';
  else if(e.awardStatus==='issuer_entry_reviewed'&&e.issuerRecordReviewId&&e.exactVariantReviewId&&
   e.methodReviewId)classification='issuer_entry_documented_unauthed';
  else classification='award_claim_unverified';
  const relevantFor:AwardAssessment204['awards'][number]['relevantFor']=
   ['withdrawn','expired'].includes(e.awardStatus)?'none':
   e.winnerKind==='creator'&&e.awardScope==='creator_career'?'creator_biography_only':
   !isProduct?'none':
   e.awardScope==='consumer_popularity'?'consumer_preference_context':
   ['practical_performance','specialist_outcome'].includes(e.awardScope)&&
    ['structured_original_test','structured_practical_jury'].includes(e.method)&&
    e.disciplineId!==null&&e.outcomeId!==null?'practical_use_research':
   ['design','innovation','sustainability'].includes(e.awardScope)?'design_or_innovation_context':'none';
  groups.add(JSON.stringify([e.issuerId,e.programmeId,e.edition,e.winnerKind,e.winnerId,e.variantId]));
  output.push({awardId:e.awardId,issuerId:e.issuerId,scope:e.awardScope,classification,relevantFor,
   authenticAwardExternallyConfirmed:false,originalTestAdmitted:false,
   canServeAsSpecialistValidation:false,sourceUrl:e.sourceUrl,commercialDisclosure:e.relationship});
 }
 output.sort((x,y)=>x.awardId.localeCompare(y.awardId));
 return {schema:'204.awards.1',state:'research_only',productId:a.productId,variantId:a.variantId,
  awards:output,uniqueAwardGroups:groups.size,noAwardsCountedAsIndependentExperiments:true,
  issuerVerificationPending:true,productRankingUnchanged:true,publicBadgeAuthorized:false,
  noAwardLogosIncluded:true};
}

export type VideoMethodCue204='setup_parameters_disclosed'|'repeat_or_comparison_shown'|
 'limitations_or_confounders_discussed'|'long_term_use_context'|'personal_taste_explicit'|
 'unsupported_superlative'|'commercial_pitch';
export interface VideoMethodAnnotation204 {
 cueId:string;observationId:string;kind:VideoMethodCue204;
 basis:'human_reviewed_annotation'|'ai_proposal';reviewReceiptId:string|null;
}
export interface VideoMethodSummary204 {
 schema:'204.video_method.1';state:'research_only';videoId:string;
 methodReviewLeads:readonly string[];experienceContextLeads:readonly string[];
 concernLeads:readonly string[];aiUnverifiedCues:readonly string[];
 mode:'methodology_followup'|'situated_experience'|'commercial_or_unsupported_only'|
  'not_enough_annotation';
 humanAnnotationDoesNotAuthenticateVideo:true;noExperimentsAdmitted:true;
 canReplaceSpecialistOutcomeValidation:false;rankingAuthorized:false;
 noTranscriptStored:true;
}
/** The value of a video is relative to the question: a candid hands-on account
 * can help usability decisions without being a laboratory protocol. These cues
 * are bounded annotations of Phase203 observations, not automatic video vision. */
export function appraiseVideoMethodCues204(research:VideoEvidenceResearch203,
 cues:readonly VideoMethodAnnotation204[]):VideoMethodSummary204{
 if(!research||research.schema!=='203.evidence.1'||research.rankingAuthorized!==false||
  research.transcriptPersisted!==false||!Array.isArray(cues)||cues.length>150||
  !unique(cues.map(x=>x.cueId)))err('video_method_input');
 const observations=new Map(research.candidates.map(x=>[x.observationId,x]));
 const methodology:string[]=[],experience:string[]=[],concerns:string[]=[],ai:string[]=[];
 for(const x of cues){
  if(!id(x?.cueId)||!id(x.observationId)||!observations.has(x.observationId)||
   !['setup_parameters_disclosed','repeat_or_comparison_shown','limitations_or_confounders_discussed',
    'long_term_use_context','personal_taste_explicit','unsupported_superlative',
    'commercial_pitch'].includes(x.kind)||
   !['human_reviewed_annotation','ai_proposal'].includes(x.basis)||
   (x.reviewReceiptId!==null&&!id(x.reviewReceiptId))||
   (x.basis==='human_reviewed_annotation'&&!x.reviewReceiptId))err('video_method_cue');
  if(x.basis==='ai_proposal'){ai.push(x.cueId);continue;}
  if(['setup_parameters_disclosed','repeat_or_comparison_shown',
    'limitations_or_confounders_discussed'].includes(x.kind))methodology.push(x.cueId);
  if(['long_term_use_context','personal_taste_explicit'].includes(x.kind))experience.push(x.cueId);
  if(['unsupported_superlative','commercial_pitch'].includes(x.kind))concerns.push(x.cueId);
 }
 const mode:VideoMethodSummary204['mode']=methodology.length?'methodology_followup':
  experience.length?'situated_experience':concerns.length?'commercial_or_unsupported_only':
  'not_enough_annotation';
 return {schema:'204.video_method.1',state:'research_only',videoId:research.videoId,
  methodReviewLeads:sorted(methodology),experienceContextLeads:sorted(experience),
  concernLeads:sorted(concerns),aiUnverifiedCues:sorted(ai),mode,
  humanAnnotationDoesNotAuthenticateVideo:true,noExperimentsAdmitted:true,
  canReplaceSpecialistOutcomeValidation:false,rankingAuthorized:false,noTranscriptStored:true};
}
