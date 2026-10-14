import type { Candidate, Dimension, Evidence, RankingResult, Request, Variant } from './types.js';

const dimensions: Dimension[] = ['carpet', 'pet_hair', 'ease'];
const sameConditions = (a: Record<string,string>, b: Record<string,string>) =>
  JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());

/** Conservative: cross-protocol numerical pooling is forbidden. */
function validEvidence(e: Evidence, variantId: string): boolean {
  return e.status === 'admitted' && e.rights === 'authorized' &&
    e.applicableVariantIds.includes(variantId) && e.scale === 'synthetic_0_10' &&
    Number.isFinite(e.value) && e.value >= 0 && e.value <= 10 &&
    e.sourceUrl.startsWith('https://');
}

export function rank(variants: Variant[], evidence: Evidence[], request: Request): RankingResult {
  const weights = request.weights;
  if (dimensions.some(d => !Number.isFinite(weights[d]) || weights[d] < 0)) throw new Error('Weights must be non-negative finite numbers');
  const totalWeight = dimensions.reduce((sum,d) => sum + weights[d], 0);
  if (totalWeight <= 0) throw new Error('At least one weight must be positive');
  const allowed = variants.filter(v => v.market === request.market && v.currency === request.currency &&
    (request.maxPrice === undefined || v.price <= request.maxPrice) &&
    Object.entries(request.requiredSpecifications ?? {}).every(([key,val]) => v.specifications[key] === val));
  const candidates: Candidate[] = allowed.map(v => {
    const dimensionScores: Partial<Record<Dimension, number>> = {};
    const usedEvidenceIds: string[] = [];
    const notes: string[] = [];
    let covered = 0;
    let weightedSum = 0;
    for (const d of dimensions) {
      if (weights[d] === 0) continue;
      const admissible = evidence.filter(e => e.dimension === d && validEvidence(e,v.id));
      // One original test contributes at most once, even if syndicated in many articles.
      const byOriginalTest = new Map<string, Evidence>();
      for (const e of admissible) if (!byOriginalTest.has(e.originalTestId)) byOriginalTest.set(e.originalTestId,e);
      const unique = [...byOriginalTest.values()];
      if (!unique.length) { notes.push(`Missing admissible evidence for ${d}`); continue; }
      const baseline = unique[0];
      const compatible = unique.filter(e => e.protocolId === baseline.protocolId && sameConditions(e.conditions,baseline.conditions));
      if (compatible.length !== unique.length) {
        notes.push(`Incompatible protocols/conditions for ${d}; numerical pooling withheld`);
        continue;
      }
      const value = compatible.reduce((sum,e)=>sum+e.value,0)/compatible.length;
      dimensionScores[d] = value;
      usedEvidenceIds.push(...compatible.map(e=>e.id));
      covered += weights[d];
      weightedSum += value * weights[d];
    }
    return {variantId:v.id,score:covered?weightedSum/covered:null,coverage:covered/totalWeight,dimensionScores,usedEvidenceIds,notes};
  });
  candidates.sort((a,b)=>(b.score ?? -Infinity)-(a.score ?? -Infinity));
  // No arbitrary confidence threshold: winner only if all relevant weighted dimensions have evidence,
  // and the leading score is strictly greater. This is a technical rule, NOT statistical certainty.
  const fullyCovered = candidates.filter(c => c.coverage >= 1-1e-10 && c.score !== null);
  fullyCovered.sort((a,b)=>(b.score ?? 0)-(a.score ?? 0));
  const winnerId = fullyCovered.length && (fullyCovered.length===1 || (fullyCovered[0].score! > fullyCovered[1].score!)) ? fullyCovered[0].variantId : null;
  const outcome = winnerId ? 'candidate' : fullyCovered.length > 1 ? 'alternatives' : 'insufficient_evidence';
  return {candidates,winnerId,outcome,warnings:[
    'Synthetic scoring only; not validated for real products or cross-source measurement.',
    'A first-ranked candidate is not a statistically established winner.',
    'Unknown or prohibited reuse rights exclude evidence from scoring.'
  ]};
}
