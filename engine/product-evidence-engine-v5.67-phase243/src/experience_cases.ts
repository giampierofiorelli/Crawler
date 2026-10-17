/** Continuous-learning Step 1A — experience cases and deterministic replay verdicts
 * (owner assignment 2026-10-17; docs/plans/continuous-scientific-learning-readiness.md §4, §6).
 *
 * An experience case is ONE authentic, previously evaluated situation (a gold value, a gold finding, an emitted finding
 * gold does not contain, or a consumer request) with three states kept apart:
 *  - historical: what the frozen extraction actually produced (from a committed run, re-checked on the frozen build);
 *  - current: what the build under test produces now;
 *  - reference: what the independent gold (or a recorded, labelled audit) says should happen.
 * An extractor's output is never ground truth; a historical error is not expected to persist.
 *
 * This module is pure: no I/O, no store, no network. Observing a case needs an extractor build and the private page bytes;
 * that happens in scripts/experience-replay.mjs. Nothing here changes extraction, teaching, ranking or the store.
 * A lesson attached to a case is a HYPOTHESIS; recurringPatterns() only proposes candidates, never rules.
 */

export type CaseKind='quantitative_value'|'qualitative_finding'|'false_positive_finding'|'request';
/** Failure families of the readiness review (§3) and the success families that guard against regressions. */
export type ExperienceFamily=
 |'F1_identity_by_default'|'F1_identity_headline'|'F2_qualitative_overreach'|'F3_lost_under_guidance'|'F5_category_recognition'|'F8_identity_variant'
 |'S_attribution_success'|'S_extraction_success'|'S_gap_recognition_success'
 /** Step 1D-A document-identity families. */
 |'F9_mention_not_detected'|'F9_alias_not_linked'|'F9_section_scope_lost'|'F9_variant_or_family'|'F9_identity_split'|'F9_grammar_after_identity'|'S_identity_link_success';
export type SubjectOutcome='correct'|'incorrect_match'|'unresolved';
/** One observation of a case by one build. Values and names live only in the private copy. */
export interface ObservedState {
 status:'found'|'absent'|'emitted'|'not_emitted'|'responded';
 subject?:string|null;subjectOutcome?:SubjectOutcome|null;
 response?:string|null;category?:string|null;
 /** Locator of the observed lead or finding (block hash and index in the reader's block list), when one was found. */
 blockSha256?:string|null;blockIndex?:number|null;
 /** Step 1C: a documented multi-subject statement (one value for several named products). */
 subjects?:string[]|null;
}
export interface ReferenceExpectation {
 /** found_with_accepted_subject: the value/finding must be found and bound to one of acceptedSubjects (or left unresolved
  * when unresolvedAcceptable); absent: the emitted finding must not be emitted; gap_stated: the request must be answered
  * as an unknown category (no known category, no ranking). */
 expected:'found_with_accepted_subject'|'absent'|'gap_stated';
 acceptedSubjects?:string[];unresolvedAcceptable?:boolean;
 basis:'independent_gold'|'independent_gold_plus_developer_audit'|'frozen_request_design';
 /** Plain statement of what the reference does and does not establish (e.g. "annotator is Claude; audit by the developer"). */
 independence:string;
}
export interface ExperienceCase {
 schema:'pee.experience-case.v1';id:string;kind:CaseKind;family:ExperienceFamily;category:string;
 source:{host:string|null;docTag:string|null;docSha256:string|null;evaluation:string;run:string;goldId:string|null;
  historicalArm:'A'|'B'|'E'|'journey';historicalBuild:{commit:string;path:string}};
 /** What identifies the item inside the document or request (private values: value/unit or dimension/direction/subject). */
 item:Record<string,unknown>;
 historical:ObservedState;reference:ReferenceExpectation;
 /** Observable, generic properties of the situation (computed, not category-specific): the basis for pattern detection. */
 features:string[];
 cause:{candidate:string;status:'confirmed'|'candidate'|'not_applicable';evidence:string};
 lesson:{hypothesis:string;status:'hypothesis';applicability:string;exceptions:string[]};
 supports:string[];counterexamples:string[];
 maturity:'T2_untouched_first_run'|'T2_frozen_request_set'|'T2_untouched_first_run_with_developer_audit';
 /** Re-observation of the historical state on the frozen historical build, when that build is available. A disagreement is
  * recorded here and never repaired by editing `historical`. */
 /** Other gold items of the same document with the same value and unit: whole-document one-to-one scoring may have given
  * the lead to one of them (the source of the EX-11 disagreement). */
 sameValueGoldIds?:string[];
 historicalCheck?:{reobservedOn:string;reproduced:boolean;reobserved:{status:ObservedState['status'];subjectOutcome:SubjectOutcome|null};note:string|null};
 /** Step 1D-A diagnostic trace: the observable steps of an identity decision (source region, mentions before and after the
  * document inventory, candidate identities and their evidence, both attributions, the reference, cause, what would resolve
  * the remaining ambiguity). Observable operations only; no private reasoning. */
 diagnostic?:{region:{blockIndex:number|null;blockSha256:string|null;regionType:string|null;headingChain:string[]};
  mentionsBefore:string[];inventory:{entity:string|null;state:string|null;reason:string|null;support:{blockIndex:number;region:string}|null;competing:string[]};
  attributionBefore:{subject:string|null;rule:string|null;class:string};attributionAfter:{subject:string|null;rule:string|null;class:string};
  causeCode:string;neededEvidence:string|null};
}

/** Does an observation meet the case's reference expectation? */
export function meetsReference(c:ExperienceCase,o:ObservedState):boolean{
 const r=c.reference;
 if(r.expected==='absent')return o.status==='not_emitted'||o.status==='absent';
 if(r.expected==='gap_stated')return o.status==='responded'&&o.response==='out_of_scope'&&!o.category;
 if(o.status!=='found')return false;
 if(o.subjectOutcome==='correct')return true;
 if(!o.subject)return !!r.unresolvedAcceptable;
 return (r.acceptedSubjects??[]).some(s=>s===o.subject);
}
/** Step 1B: incomparable_state = the knowledge state that governs the observation (the compiled plan digest) differs from
 * the frozen one, so a difference cannot be attributed to the extractor; it is reported, never counted as a regression or a
 * correction. */
export type ReplayTransition='preserved_success'|'lost_success'|'corrected'|'persistent_failure'|'unreproducible'|'incomparable_state';
/** Step 1B: what an observation says about attribution, kept apart from "meets the reference". An unresolved subject is
 * safer than a wrong one but is not a correct attribution. */
export type AttributionClass='correct'|'accepted_variant'|'wrong_product'|'unresolved_preserved'|'multi_subject'|'missing'|'emitted'|'not_emitted'|'gap_stated'|'other_response';
export function attributionClass(c:ExperienceCase,o:ObservedState):AttributionClass{
 if(o.status==='emitted'||o.status==='not_emitted')return o.status;
 if(o.status==='responded')return meetsReference(c,o)?'gap_stated':'other_response';
 if(o.status!=='found')return 'missing';
 if(o.subjectOutcome==='correct')return 'correct';
 if(o.subjects?.length)return 'multi_subject';
 if(!o.subject||o.subjectOutcome==='unresolved')return 'unresolved_preserved';
 return (c.reference.acceptedSubjects??[]).includes(o.subject)?'accepted_variant':'wrong_product';
}
export interface ReplayVerdict {caseId:string;family:ExperienceFamily;historicalMeets:boolean;currentMeets:boolean|null;
 historicalReproduced:boolean|null;transition:ReplayTransition;reason:string|null;
 historicalClass:AttributionClass;currentClass:AttributionClass|null}
/** Two observations are the same when status, subject outcome, response and category agree. Subject strings and locators
 * are not compared: committed runs record the subject OUTCOME, and block indices may differ between builds. */
export function sameObservation(a:ObservedState,b:ObservedState):boolean{
 return a.status===b.status&&(a.subjectOutcome??null)===(b.subjectOutcome??null)&&(a.response??null)===(b.response??null)&&(a.category??null)===(b.category??null);
}
/** The replay verdict of one case. `current` null = the case's inputs could not be observed (missing bytes, receipt
 * mismatch, unavailable build): unreproducible, never guessed. `frozenReobserved` is a fresh observation on the frozen
 * historical build, compared with the committed historical state. */
export function replayVerdict(c:ExperienceCase,current:ObservedState|null,frozenReobserved:ObservedState|null,reason:string|null=null,
 state:{comparable:boolean;why?:string}={comparable:true}):ReplayVerdict{
 const h=meetsReference(c,c.historical);const hc=attributionClass(c,c.historical);
 const reproduced=frozenReobserved?sameObservation(c.historical,frozenReobserved):null;
 if(!current)return {caseId:c.id,family:c.family,historicalMeets:h,currentMeets:null,historicalReproduced:reproduced,transition:'unreproducible',reason:reason??'inputs not observable',historicalClass:hc,currentClass:null};
 const n=meetsReference(c,current);
 const transition:ReplayTransition=!state.comparable?'incomparable_state':h&&n?'preserved_success':h&&!n?'lost_success':!h&&n?'corrected':'persistent_failure';
 return {caseId:c.id,family:c.family,historicalMeets:h,currentMeets:n,historicalReproduced:reproduced,transition,
  reason:!state.comparable?[reason,state.why??'knowledge state differs from the frozen one'].filter(Boolean).join('; '):reason,historicalClass:hc,currentClass:attributionClass(c,current)};
}
export function summariseReplay(v:readonly ReplayVerdict[]){
 const count=(t:ReplayTransition)=>v.filter(x=>x.transition===t).length;
 return {cases:v.length,preserved_success:count('preserved_success'),lost_success:count('lost_success'),corrected:count('corrected'),
  persistent_failure:count('persistent_failure'),unreproducible:count('unreproducible'),incomparable_state:count('incomparable_state'),
  /** Current attribution classes (Step 1B): correct, accepted variant, wrong product, unresolved but preserved, missing. */
  currentClasses:Object.fromEntries([...new Set(v.map(x=>x.currentClass??'unobserved'))].sort().map(k=>[k,v.filter(x=>(x.currentClass??'unobserved')===k).length])),
  historicalReproduced:v.filter(x=>x.historicalReproduced===true).length,historicalNotReproduced:v.filter(x=>x.historicalReproduced===false).length,
  /** A regression signal: any previously meeting case that no longer does. */
  regression:v.some(x=>x.transition==='lost_success')};
}
/** Candidate general lessons: a generic feature shared by failing cases of one family across at least two hosts or two
 * categories, with the successes that share the feature listed as counterexamples. Proposals only (status hypothesis). */
export function recurringPatterns(cases:readonly ExperienceCase[]){
 const failing=cases.filter(c=>c.family.startsWith('F'));
 const out:{family:ExperienceFamily;feature:string;cases:string[];hosts:string[];categories:string[];counterexamples:string[];status:'candidate_lesson_hypothesis'}[]=[];
 const keys=new Set(failing.flatMap(c=>c.features.map(f=>c.family+'|'+f)));
 for(const k of [...keys].sort()){const [family,feature]=k.split('|') as [ExperienceFamily,string];
  const cs=failing.filter(c=>c.family===family&&c.features.includes(feature));
  const hosts=[...new Set(cs.map(c=>c.source.host??'none'))].sort(),cats=[...new Set(cs.map(c=>c.category))].sort();
  if(cs.length<2||(hosts.length<2&&cats.length<2))continue;
  out.push({family,feature,cases:cs.map(c=>c.id),hosts,categories:cats,
   counterexamples:cases.filter(c=>c.family.startsWith('S')&&c.features.includes(feature)).map(c=>c.id),status:'candidate_lesson_hypothesis'});}
 return out;
}
/** The public, value-free view of a case: no values, no product names, no text from the source. */
export function publicCase(c:ExperienceCase){
 const strip=(o:ObservedState)=>({status:o.status,subjectOutcome:o.subjectOutcome??null,response:o.response??null,blockSha256:o.blockSha256??null});
 return {id:c.id,kind:c.kind,family:c.family,category:c.category,source:{host:c.source.host,docTag:c.source.docTag,docSha256:c.source.docSha256,
  evaluation:c.source.evaluation,run:c.source.run,goldId:c.source.goldId,historicalArm:c.source.historicalArm,historicalBuild:c.source.historicalBuild.commit},
  historical:strip(c.historical),reference:{expected:c.reference.expected,basis:c.reference.basis,independence:c.reference.independence},
  features:c.features,cause:c.cause,lesson:c.lesson,supports:c.supports,counterexamples:c.counterexamples,maturity:c.maturity,historicalCheck:c.historicalCheck??null};
}
