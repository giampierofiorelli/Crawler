/**
 * QE (2026-10-18): the qualitative content of a buying need, and the observations relevant to it. Shadow only.
 *
 * A need ("quiet enough for a bedroom at night", "cooks chips evenly") is read with the same vocabulary as the pages: the
 * aspects it names, the facets it asks for (spatial uniformity, consistency across runs, tonal character...), the use
 * situation and the conditions. An observation is relevant when it is about a named aspect, or shows a facet the need asks
 * for in any aspect: the facet is the reified cross-category principle "when a goal requires a uniform result, observations
 * of spatial variation are relevant" (a hypothesis until tested).
 *
 * Relevance is a set of stated reasons, never a numeric score. The evidence type orders what a reader is shown first (a
 * test observation before an opinion, an opinion before a maker's claim); it does not merge or weight them.
 */
import {hasPhrase,type QuantityKnowledge} from './quantity_knowledge.js';
import type {QualitativeEvidence} from './document_evidence.js';

export interface QualitativeNeed {aspects:string[];facets:string[];useContexts:string[];conditions:string[]}
export interface RelevantObservation {evidence:QualitativeEvidence;reasons:string[]}
const EVIDENCE_ORDER:QualitativeEvidence['evidenceType'][]=['observed_in_test','experience_in_use','opinion','inference','reported_by_others','manufacturer_claim'];

export function readQualitativeNeed(qk:QuantityKnowledge,text:string):QualitativeNeed{
 const any=(ws:readonly string[])=>ws.some(w=>hasPhrase(text,w));
 return {aspects:(qk.pack.aspects??[]).filter(a=>any(a.terms)).map(a=>a.id),
  facets:(qk.pack.facets??[]).filter(f=>any(f.needTerms)).map(f=>f.id),
  useContexts:(qk.pack.useContexts??[]).filter(c=>any(c.terms)).map(c=>c.id),
  conditions:[...qk.pack.conditionAxes.filter(a=>a.operatingCondition&&a.values).flatMap(a=>Object.entries(a.values!).filter(([,ws])=>any(ws)).map(([v])=>v)),
   ...(qk.pack.language.en.qualitative?.testMaterials??[]).filter(w=>hasPhrase(text,w))]};}

/** The observations relevant to a need, each with its reasons, test observations first. */
export function relevantObservations(need:QualitativeNeed,evidence:readonly QualitativeEvidence[]):RelevantObservation[]{
 const out:RelevantObservation[]=[];
 for(const e of evidence){const reasons:string[]=[];
  if(need.aspects.includes(e.property.aspect))reasons.push(`about ${e.property.aspect}`);
  for(const f of e.property.facets)if(need.facets.includes(f))reasons.push(`shows ${f}, which the need asks for`);
  if(!reasons.length)continue;
  if(e.useContext&&need.useContexts.includes(e.useContext))reasons.push(`judged for the same use: ${e.useContext}`);
  else if(e.useContext&&need.useContexts.length)reasons.push(`judged for another use (${e.useContext}): may not transfer`);
  const cs=e.conditions.filter(c=>need.conditions.includes(c.value));if(cs.length)reasons.push(`under the need's conditions: ${cs.map(c=>c.value).join(', ')}`);
  out.push({evidence:e,reasons});}
 return out.sort((a,b)=>EVIDENCE_ORDER.indexOf(a.evidence.evidenceType)-EVIDENCE_ORDER.indexOf(b.evidence.evidenceType));}
