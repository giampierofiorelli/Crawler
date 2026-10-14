/** Experimental purchase-decision presentation layer.
 * Product fit is immutable; price timing never changes the fit ranking.
 * No price prediction, urgency pressure, or unsupported 'buy now' claim.
 */
import type { RankingResult } from './types.js';

export type Urgency = 'immediate' | 'weeks' | 'flexible';
export type TimingLabel = 'below_observed_median' | 'near_observed_median' | 'above_observed_median' | 'insufficient_history';
export interface OfferSnapshot {
  variantId: string; merchantId: string; currency: string; market: string;
  itemPrice: number; shipping: number; available: boolean;
  observedAt: string; deliveryDays?: number;
  condition: 'new' | 'refurbished' | 'used';
}
export interface HistoricalPrice {
  variantId: string; currency: string; market: string;
  /** Comparable landed price for the exact variant and condition. */
  totalPrice: number; observedAt: string; condition: 'new' | 'refurbished' | 'used';
}
export interface DecisionInput {
  fit: RankingResult;
  offers: OfferSnapshot[];
  history: HistoricalPrice[];
  market: string; currency: string; asOf: string;
  urgency: Urgency; maxDeliveryDays?: number;
  /** User's explicit maximum age for an actionable merchant offer. */
  maxOfferAgeHours: number;
  /** Minimum independently observed days for a descriptive timing label. */
  minHistoryDays: number;
}
export interface PurchaseCandidate {
  variantId: string; fitRank: number; fitScore: number | null; coverage: number;
  bestOffer: {merchantId:string; totalPrice:number; observedAt:string; deliveryDays?:number} | null;
  historyMedian: number | null; historySampleDays: number;
  deltaFromMedian: number | null; deltaPercent: number | null;
  timing: TimingLabel; actionableNow: boolean;
  limitations: string[];
}
export interface PurchaseDecision {
  bestFitVariantId: string | null;
  /** Shortlist is NOT re-ranked by an unvalidated blended quality-price score. */
  shortlist: PurchaseCandidate[];
  immediateAlternatives: string[];
  messages: string[];
}
const finiteNonNegative = (v:number) => Number.isFinite(v) && v >= 0;
const parseTime = (v:string):number => {const t=Date.parse(v);if(!Number.isFinite(t)) throw new Error('Invalid ISO date');return t;};
const median = (values:number[]):number => {const sorted=[...values].sort((a,b)=>a-b);const n=sorted.length;return n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;};
const dayKey = (time:string):string => new Date(parseTime(time)).toISOString().slice(0,10);

export function assessPurchaseDecision(input:DecisionInput):PurchaseDecision {
  const now=parseTime(input.asOf);
  if (!finiteNonNegative(input.maxOfferAgeHours) || !Number.isInteger(input.minHistoryDays) || input.minHistoryDays < 2) throw new Error('Invalid freshness/history policy');
  if (input.maxDeliveryDays !== undefined && !finiteNonNegative(input.maxDeliveryDays)) throw new Error('Invalid delivery limit');
  const seen=new Set<string>();
  const sortedFit=[...input.fit.candidates].sort((a,b)=> (b.coverage>=1?1:0)-(a.coverage>=1?1:0) || (b.score??-Infinity)-(a.score??-Infinity) || a.variantId.localeCompare(b.variantId));
  const shortlist:PurchaseCandidate[]=sortedFit.map((candidate,i)=>{
    if(seen.has(candidate.variantId)) throw new Error('Duplicate candidate ID');
    seen.add(candidate.variantId);
    const limitations:string[]=[];
    const offers=input.offers.filter(o=>{
      if(o.variantId!==candidate.variantId || o.market!==input.market || o.currency!==input.currency || o.condition!=='new') return false;
      if(!finiteNonNegative(o.itemPrice)||!finiteNonNegative(o.shipping)) throw new Error('Invalid offer price');
      const age=now-parseTime(o.observedAt);
      return o.available && age>=0 && age<=input.maxOfferAgeHours*3600000 && (input.urgency!=='immediate'||input.maxDeliveryDays===undefined||(o.deliveryDays!==undefined && o.deliveryDays<=input.maxDeliveryDays));
    }).sort((a,b)=>(a.itemPrice+a.shipping)-(b.itemPrice+b.shipping) || a.merchantId.localeCompare(b.merchantId));
    const best=offers[0];
    if(!best) limitations.push('No verified, fresh, eligible offer for the requested timing');
    const byDay=new Map<string,number>();
    for(const h of input.history){
      if(h.variantId!==candidate.variantId||h.market!==input.market||h.currency!==input.currency||h.condition!=='new') continue;
      if(!finiteNonNegative(h.totalPrice)) throw new Error('Invalid historical price');
      const time=parseTime(h.observedAt);
      if(time>now) continue;
      const day=dayKey(h.observedAt);
      const old=byDay.get(day);
      // One comparable daily minimum; repeated snapshots do not inflate the sample size.
      byDay.set(day,old===undefined?h.totalPrice:Math.min(old,h.totalPrice));
    }
    const historyDays=byDay.size;
    const historicalMedian=historyDays>=input.minHistoryDays?median([...byDay.values()]):null;
    if(historicalMedian===null) limitations.push('Insufficient independent daily price observations');
    const total=best?best.itemPrice+best.shipping:null;
    const delta=total!==null&&historicalMedian!==null?total-historicalMedian:null;
    const pct=delta!==null&&historicalMedian!==null&&historicalMedian>0?100*delta/historicalMedian:null;
    // ±5% is only a presentation band; not a forecasting or purchasing threshold.
    const timing:TimingLabel=pct===null?'insufficient_history':pct< -5?'below_observed_median':pct>5?'above_observed_median':'near_observed_median';
    if(candidate.coverage<1 || candidate.score===null) limitations.push('Incomplete fit evidence; quality comparison is not established');
    return {variantId:candidate.variantId,fitRank:i+1,fitScore:candidate.score,coverage:candidate.coverage,
      bestOffer:best?{merchantId:best.merchantId,totalPrice:total!,observedAt:best.observedAt,deliveryDays:best.deliveryDays}:null,
      historyMedian:historicalMedian,historySampleDays:historyDays,deltaFromMedian:delta,deltaPercent:pct,
      timing,actionableNow:!!best&&candidate.coverage>=1&&candidate.score!==null,limitations};
  });
  const bestFitVariantId=input.fit.winnerId;
  const immediateAlternatives=input.urgency==='immediate'?shortlist.filter(c=>c.actionableNow).map(c=>c.variantId):[];
  const messages=[
    'Fit ranking and purchase opportunity remain separate; no automatic quality winner substitution.',
    'Historical median describes observed prices only; it does not predict future prices or establish fair value.',
    'Timing labels use an illustrative ±5% band, not a validated buy/wait model.',
    'A higher current price does not mean waiting will save money; the user may choose the best-fit product now.',
    'Only exact variant, market, currency and new-condition records are compared; merchants are not trust-scored.'
  ];
  return {bestFitVariantId,shortlist,immediateAlternatives,messages};
}
