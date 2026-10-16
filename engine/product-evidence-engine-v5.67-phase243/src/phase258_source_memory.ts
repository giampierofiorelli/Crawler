/**
 * Phase258 checkpoint B — evolving source memory, verified-contribution feedback and dry-run source selection.
 *
 * Source states complement Phase193 (screening decisions per document revision) with the life of a source:
 * discovered → reviewed → useful | restricted | temporarily_unavailable | moved | changed | retired. The ledger is
 * append-only and hash-chained like Phase193; nothing is ever deleted. A 404 is temporary; only an operator retires a
 * source; a moved or changed source inherits neither permissions, reviews nor feedback.
 *
 * Feedback records what a verified research outcome actually contributed. Reliability, evidence quality, relevance,
 * contribution, cost and eligibility stay separate fields; no score is computed and agreement with PEE is not an
 * outcome. Selection is a dry run for one planned job (Phase257): sources are chosen by the role that fits the gap, never
 * by publisher or requester country, with an exploration slot for unfamiliar sources (as Phase196 does). Nothing is
 * fetched, interpreted, translated or admitted.
 */
import {createHash} from 'node:crypto';
import {materialRoleFor196,type SourceDescriptor258,type SourceRole258} from './phase258_source_contributions.js';

const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const ID=/^[a-z][a-z0-9_.:-]{0,100}$/;
const STAMP=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/;
const fail=(m:string):never=>{throw Error('phase258_'+m);};

// ---- source states ------------------------------------------------------------------------------------------------
export type SourceState258='discovered'|'reviewed'|'useful'|'restricted'|'temporarily_unavailable'|'moved'|'changed'|'retired';
export type SourceCause258=
 {kind:'discovery';reviewId:string|null}|{kind:'review';reviewId:string}|{kind:'feedback';feedbackId:string}|
 {kind:'access_policy';reviewId:string|null}|{kind:'http_status';httpStatus:number}|
 {kind:'redirect';newUrl:string;newSourceId:string}|
 {kind:'content_change'|'ownership_change'|'method_change';reviewId:string|null}|
 {kind:'operator_retirement';reviewId:string};
export interface SourceStateEvent258In {sourceId:string;state:SourceState258;cause:SourceCause258;at:string}
export interface SourceStateEvent258 extends SourceStateEvent258In {seq:number;previousHash:string;eventHash:string}
export interface SourceLedger258 {schema:'pee258.source-states.v1';events:readonly SourceStateEvent258[];
 /** Sources whose latest state is "changed": earlier reviews and permissions no longer apply. */
 reReviewRequired:readonly string[];findingsDeleted:false;scoresComputed:false}
const GENESIS=sha('pee258.source-states.v1');
const eventHash=(e:Omit<SourceStateEvent258,'eventHash'>)=>sha(JSON.stringify([e.seq,e.sourceId,e.state,e.cause,e.at,e.previousHash]));
export function emptySourceLedger258():SourceLedger258{return {schema:'pee258.source-states.v1',events:[],reReviewRequired:[],findingsDeleted:false,scoresComputed:false};}
const ALLOWED:Record<SourceState258,readonly SourceCause258['kind'][]>={discovered:['discovery'],reviewed:['review'],useful:['feedback'],
 restricted:['access_policy'],temporarily_unavailable:['http_status'],moved:['redirect'],changed:['content_change','ownership_change','method_change'],
 retired:['operator_retirement']};
function checkEvent(e:SourceStateEvent258In){
 if(!e||!ID.test(e.sourceId)||!STAMP.test(e.at)||!(e.state in ALLOWED))fail('invalid_state_event');
 if(!ALLOWED[e.state].includes(e.cause?.kind)){
  if(e.state==='retired')fail('invalid_state_event: only an operator can retire a source (an HTTP status never retires it)');
  if(e.state==='useful')fail('invalid_state_event: useful needs verified contribution feedback');
  fail(`invalid_state_event: ${e.state} cannot be caused by ${e.cause?.kind}`);}
 const c=e.cause as Record<string,unknown>;
 if(e.cause.kind==='review'||e.cause.kind==='operator_retirement'){if(typeof c.reviewId!=='string'||!ID.test(c.reviewId))fail('invalid_state_event: reviewId');}
 if(e.cause.kind==='feedback'&&(typeof c.feedbackId!=='string'||!ID.test(c.feedbackId)))fail('invalid_state_event: feedbackId');
 if(e.cause.kind==='http_status'&&(!Number.isInteger(c.httpStatus)||![0,404,408,410,429,451,500,502,503,504].includes(c.httpStatus as number)))fail('invalid_state_event: httpStatus');
 if(e.cause.kind==='redirect'){if(typeof c.newSourceId!=='string'||!ID.test(c.newSourceId)||c.newSourceId===e.sourceId)fail('invalid_state_event: a move creates a new source id');
  try{if(new URL(c.newUrl as string).protocol!=='https:')fail('invalid_state_event: newUrl');}catch{fail('invalid_state_event: newUrl');}}
}
export function validateSourceLedger258(L:SourceLedger258):void{
 if(!L||L.schema!=='pee258.source-states.v1'||L.findingsDeleted!==false||L.scoresComputed!==false||!Array.isArray(L.events))fail('invalid_ledger');
 let prev=GENESIS;
 // Integrity first (an edited event is tampering), then the meaning of each event.
 L.events.forEach((e,i)=>{if(e.seq!==i+1||e.previousHash!==prev||eventHash({seq:e.seq,sourceId:e.sourceId,state:e.state,cause:e.cause,at:e.at,previousHash:e.previousHash})!==e.eventHash)fail('invalid_ledger: broken hash chain');checkEvent(e);prev=e.eventHash;});
}
export function recordSourceState258(L:SourceLedger258,e:SourceStateEvent258In):SourceLedger258{
 validateSourceLedger258(L);checkEvent(e);
 const base={...e,seq:L.events.length+1,previousHash:L.events.at(-1)?.eventHash??GENESIS};
 const events=[...L.events,{...base,eventHash:eventHash(base)}];
 const latest=new Map<string,SourceState258>();for(const x of events)latest.set(x.sourceId,x.state);
 return {...L,events,reReviewRequired:[...latest].filter(([,s])=>s==='changed').map(([k])=>k).sort()};
}
export function currentSourceState258(L:SourceLedger258,sourceId:string):SourceState258|null{
 return [...L.events].reverse().find(e=>e.sourceId===sourceId)?.state??null;
}
/** The new record a move creates: it starts as discovered and inherits nothing but the link to its predecessor. */
export function successorSource258(L:SourceLedger258,sourceId:string){
 const m=[...L.events].reverse().find(e=>e.sourceId===sourceId&&e.state==='moved');
 if(!m||m.cause.kind!=='redirect')return null;
 return {sourceId:m.cause.newSourceId,state:'discovered' as const,predecessor:sourceId,inheritsPermissions:false as const,inheritsReviews:false as const,inheritsFeedback:false as const};
}

// ---- verified-contribution feedback -------------------------------------------------------------------------------
export const OUTCOMES258=['confirmed_specification','revealed_error','resolved_identity','provided_independent_test','valid_contradiction',
 'prevented_wrong_recommendation','no_contribution','not_retrievable'] as const;
export type Outcome258=typeof OUTCOMES258[number];
export interface ContributionFeedback258 {
 schema:'pee258.contribution-feedback.v1';feedbackId:string;sourceId:string;jobId:string;
 scope:{categoryId:string;criterion:string;productId:string|null};
 outcome:Outcome258;reviewId:string;at:string;
 /** Separate dimensions: none is derived from the others, none is a score. */
 reliability:'not_assessed'|'consistent_with_independent_evidence'|'error_found_in_source';
 evidenceQuality:{originality:SourceDescriptor258['originality'];methodReported:boolean};
 relevance:'exact_product_and_criterion'|'same_criterion_other_variant'|'category_context'|'not_relevant';
 cost:{sourceReads:number;minutes:number};
 eligibility:{rights:SourceDescriptor258['access']['rights'];robots:SourceDescriptor258['access']['robots']};
}
const FB_KEYS=['schema','feedbackId','sourceId','jobId','scope','outcome','reviewId','at','reliability','evidenceQuality','relevance','cost','eligibility'];
export function validateFeedback258(f0:unknown):ContributionFeedback258{
 const f=f0 as Record<string,unknown>;
 if(!f||typeof f!=='object')fail('invalid_feedback');
 for(const k of Object.keys(f))if(!FB_KEYS.includes(k))fail(`invalid_feedback: unknown field ${k} (no scores, no agreement flags)`);
 for(const k of FB_KEYS)if(!(k in f))fail(`invalid_feedback: missing ${k}`);
 const x=f as unknown as ContributionFeedback258;
 if(x.schema!=='pee258.contribution-feedback.v1'||!ID.test(x.feedbackId)||!ID.test(x.sourceId)||!/^research_[0-9a-f]{32}$/.test(x.jobId)||!STAMP.test(x.at))fail('invalid_feedback: identifiers');
 if(typeof x.reviewId!=='string'||!ID.test(x.reviewId))fail('invalid_feedback: a verified outcome needs a review');
 if(!(OUTCOMES258 as readonly string[]).includes(x.outcome))fail('invalid_feedback: outcome (agreement with PEE is not an outcome)');
 if(!x.scope||!ID.test(x.scope.categoryId)||!ID.test(x.scope.criterion)||(x.scope.productId!==null&&!ID.test(x.scope.productId)))fail('invalid_feedback: scope');
 if(!['not_assessed','consistent_with_independent_evidence','error_found_in_source'].includes(x.reliability))fail('invalid_feedback: reliability');
 if(!['exact_product_and_criterion','same_criterion_other_variant','category_context','not_relevant'].includes(x.relevance))fail('invalid_feedback: relevance');
 if(!x.cost||!Number.isInteger(x.cost.sourceReads)||x.cost.sourceReads<0||!Number.isFinite(x.cost.minutes)||x.cost.minutes<0)fail('invalid_feedback: cost');
 return x;
}
/** Counts per source and outcome. Deliberately no score, rank or weight until enough genuine feedback exists. */
export function summarizeFeedback258(fs:readonly unknown[]){
 const bySource:Record<string,Partial<Record<Outcome258,number>>>={};
 for(const f of fs.map(validateFeedback258)){const s=(bySource[f.sourceId]??={});s[f.outcome]=(s[f.outcome]??0)+1;}
 return {bySource,scoresComputed:false as const,records:fs.length};
}

// ---- dry-run selection for one planned job --------------------------------------------------------------------------
export type Lane258='declaration'|'measurement'|'practical'|'interpretation'|'lead';
const DECLARING:readonly SourceRole258[]=['manufacturer_specification','retailer_listing'];
function laneOf(d:SourceDescriptor258,gap:string):Lane258|null{
 const r=new Set(d.roles),k=new Set(d.statementKinds);
 if(gap==='missing_declaration'||gap==='declaration_conflict')return DECLARING.some(x=>r.has(x))&&k.has('declared_specification')?'declaration':null;
 if(r.has('independent_measurement')&&k.has('instrumental_measurement'))return 'measurement';
 if((r.has('structured_professional_testing')||r.has('original_video_demonstration'))&&k.has('observed_practical_result'))return 'practical';
 if(k.has('expert_interpretation')&&(r.has('qualified_cultural_expertise')||r.has('journalism')))return 'interpretation';
 if(r.has('derivative_publication')||r.has('news_report')||r.has('journalism')||r.has('user_experience_report'))return 'lead';
 return null;
}
const LANE_ORDER:Record<Lane258,number>={declaration:0,measurement:0,practical:1,interpretation:2,lead:3};
export function selectSourcesForJob258(a:{job:{productId:string;criterion:string;gapKind:'missing_declaration'|'declaration_conflict'|'missing_test'};
 descriptors:readonly SourceDescriptor258[];feedback:readonly ContributionFeedback258[];states:SourceLedger258;maxSources:number}){
 if(!Number.isInteger(a.maxSources)||a.maxSources<1||a.maxSources>10)fail('invalid_selection: maxSources 1-10');
 validateSourceLedger258(a.states);
 const familiar=new Set(a.feedback.map(f=>validateFeedback258(f).sourceId));
 const excluded:{sourceId:string;reason:string}[]=[],collapsed:{sourceId:string;duplicateOf:string}[]=[],notSuited:string[]=[];
 const pool:{d:SourceDescriptor258;lane:Lane258}[]=[];const seenUrl=new Map<string,string>();
 for(const d of a.descriptors){
  const st=currentSourceState258(a.states,d.sourceId);
  if(d.access.rights==='not_permitted'||d.access.robots==='disallowed'){excluded.push({sourceId:d.sourceId,reason:'access_not_permitted'});continue;}
  if(st==='retired'||st==='restricted'){excluded.push({sourceId:d.sourceId,reason:'state_'+st});continue;}
  const u=new URL(d.url);const key=(u.host+u.pathname).toLowerCase().replace(/\/$/,'');
  if(seenUrl.has(key)){collapsed.push({sourceId:d.sourceId,duplicateOf:seenUrl.get(key)!});continue;}seenUrl.set(key,d.sourceId);
  // Phase258 pilot defect: a source about another product cannot answer this product's gap (it was only ranked lower).
  if(d.product.productId!==null&&d.product.productId!==a.job.productId){excluded.push({sourceId:d.sourceId,reason:'other_product'});continue;}
  const lane=laneOf(d,a.job.gapKind);if(!lane){notSuited.push(d.sourceId);continue;}
  // A source not attributed to any product may inform interpretation or lead to sources, never declare or measure.
  if(d.product.productId===null&&(lane==='declaration'||lane==='measurement'||lane==='practical')){notSuited.push(d.sourceId);continue;}
  pool.push({d,lane});
 }
 // A derivative of a candidate original is the same evidence, not a second source.
 const ids=new Set(pool.map(p=>p.d.sourceId));
 const kept=pool.filter(p=>{const orig=p.d.derivedFrom.find(x=>ids.has(x));if(orig&&(p.d.originality!=='original'||p.d.roles.includes('derivative_publication'))){collapsed.push({sourceId:p.d.sourceId,duplicateOf:orig});return false;}return true;});
 const rank=(p:{d:SourceDescriptor258;lane:Lane258})=>[LANE_ORDER[p.lane],p.d.product.productId===a.job.productId?0:1,currentSourceState258(a.states,p.d.sourceId)==='temporarily_unavailable'?1:0];
 const ordered=kept.sort((x,y)=>{const rx=rank(x),ry=rank(y);for(let i=0;i<rx.length;i++)if(rx[i]!==ry[i])return rx[i]-ry[i];return x.d.sourceId.localeCompare(y.d.sourceId,'en');});
 let picked=ordered.slice(0,a.maxSources);let explorationSlotUsed=false;
 const unfamiliar=ordered.find(p=>!familiar.has(p.d.sourceId)&&!picked.includes(p));
 if(a.maxSources>=2&&unfamiliar&&picked.every(p=>familiar.has(p.d.sourceId))){picked=[...picked.slice(0,-1),unfamiliar];explorationSlotUsed=true;}
 return {schema:'pee258.source-selection.v1',job:a.job,dryRun:true as const,fetches:0 as const,
  selected:picked.map(p=>({sourceId:p.d.sourceId,descriptorId:p.d.descriptorId,lane:p.lane,roles:[...p.d.roles],materialRole196:materialRoleFor196(p.d),
   exactProduct:p.d.product.productId===a.job.productId,identityStatus:p.d.product.identityStatus,language:p.d.language,publisherCountry:p.d.publisherCountry,
   productMarket:p.d.productMarket,sponsorship:p.d.sponsorship,unfamiliar:!familiar.has(p.d.sourceId),
   requiresReReview:a.states.reReviewRequired.includes(p.d.sourceId),limitations:[...p.d.limitations]})),
  excluded,collapsed,notSuited,explorationSlotUsed,requesterCountryUsed:false as const,publisherCountryUsed:false as const,
  evidenceAdmitted:false as const,rankingAuthorized:false as const};
}
