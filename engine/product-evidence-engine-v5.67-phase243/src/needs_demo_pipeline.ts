/** Research-only integration: explicit user needs -> toy independent test ranking.
 * NEVER publish as a consumer recommendation or import this into the launch bundle.
 */
import { interpretDecisionNeeds, type NeedsAnswers, type NeedsCategory } from './needs_discovery.js';
import { rankPriceFree, type LaunchVariant } from './launch_rank.js';
import type { Evidence, Market, RankingResult } from './types.js';
export interface NeedsDemoDecision {
  needs: ReturnType<typeof interpretDecisionNeeds>;
  ranking: RankingResult | null;
  /** Suppress winner whenever any compared variant lacks requested evidence. */
  winnerId: string | null;
  reason: string;
  publicationReady: false;
  purpose: 'synthetic_demo';
}
const commercial = /(?:price|cost|budget|msrp|rrp|deal|discount|sale|availability|retailer|merchant|amazon|affiliate|commission)/i;
export function runNeedsDemo(input: {
  purpose:'synthetic_demo'; category:NeedsCategory; answers:NeedsAnswers;
  variants:readonly LaunchVariant[]; evidence:readonly Evidence[];
  market:Market; currency:string;
}): NeedsDemoDecision {
  if (input.purpose!=='synthetic_demo') throw new Error('Only synthetic needs scenario permitted');
  for(const v of input.variants){
    if(Object.hasOwn(v,'price')) throw new Error('Commercial fields not allowed in synthetic needs demo');
    if(Object.keys(v.specifications).some(k=>commercial.test(k))) throw new Error('Commercial specification not permitted');
  }
  // Capabilities are demonstrative only. The ranking engine performs per-variant admissibility.
  const marketIds = new Set(input.variants.filter(v=>v.market===input.market).map(v=>v.id));
  const capabilities = new Set(input.evidence.filter(e=>e.status==='admitted' && e.rights==='authorized' &&
    e.scale==='synthetic_0_10' && Number.isFinite(e.value) && e.value>=0 && e.value<=10 &&
    e.sourceUrl.startsWith('https://') && e.applicableVariantIds.some(id=>marketIds.has(id)))
    .map(e=>e.dimension));
  const needs = interpretDecisionNeeds(input.category,input.answers,capabilities);
  if (!needs.syntheticWeights) return {needs,ranking:null,winnerId:null,
    reason:'Needs unconfirmed, evidence missing, or no validated toy-dimension mapping',publicationReady:false,purpose:'synthetic_demo'};
  const ranking = rankPriceFree([...input.variants],[...input.evidence],{
    market:input.market,currency:input.currency,weights:needs.syntheticWeights,
  });
  const complete = ranking.candidates.length >= 2 && ranking.candidates.every(c=>c.coverage===1);
  return {needs,ranking,winnerId:complete?ranking.winnerId:null,
    reason:complete?'Synthetic demonstration only; not a real-world product recommendation':
      'Comparative evidence is incomplete for at least one candidate; no winner claimed',
    publicationReady:false,purpose:'synthetic_demo'};
}
