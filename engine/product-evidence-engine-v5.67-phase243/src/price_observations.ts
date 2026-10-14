/** Phase 34: offline authorized price-feed intake and conservative historical context.
 * No scraping, network connector, forecasting, or live merchant data.
 * All records are fictional in the demonstration.
 */
export type PriceCondition = 'new' | 'refurbished' | 'used';
export type FeedPermission = 'authorized' | 'unknown' | 'prohibited' | 'expired';
export interface PriceFeedSource {
  sourceId: string;
  merchantId: string;
  permission: FeedPermission;
  /** Written evidence of right to ingest, retain, and display commercial prices. */
  permissionEvidenceUrl: string | null;
  allowedUses: ('price_display' | 'price_history')[];
  expiresAt?: string;
  /** Market+currency the authorized feed covers. */
  market: string;
  currency: string;
}
export interface PriceObservation {
  observationId: string;
  sourceId: string;
  merchantId: string;
  /** Exact variant ID previously verified against merchant SKU/GTIN. */
  variantId: string;
  identityVerified: boolean;
  market: string;
  currency: string;
  condition: PriceCondition;
  itemPrice: number;
  shippingPrice: number | null;
  /** Explicitly false means VAT/taxes may be missing: cannot compare landed prices. */
  taxesIncluded: boolean;
  availability: 'in_stock' | 'out_of_stock' | 'unknown';
  observedAt: string;
  productUrl: string;
  deliveryDays?: number;
}
export interface IntakeRejection { observationId: string; reason: string }
export interface IntakeResult {
  accepted: PriceObservation[];
  rejected: IntakeRejection[];
  /** Intake does not publish, approve or confer rights; storage must be append-only. */
  status: 'quarantined';
}
const time = (s:string):number => {
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(s)) return NaN;
  return Date.parse(s);
};
const validHttps=(s:string):boolean => {
  try { const u=new URL(s); return u.protocol==='https:' && !!u.hostname && !u.username && !u.password; }
  catch {return false;}
};
const nonnegative=(v:number):boolean=>Number.isFinite(v)&&v>=0;
const DAY=86_400_000;

/** Quarantine feed observations; deny unknown rights, uncertain variant identity, or incomplete landed price. */
export function quarantinePriceFeed(
  sources: PriceFeedSource[], observations: PriceObservation[], asOf:string
):IntakeResult {
  const now=time(asOf);
  if(!Number.isFinite(now)) throw new Error('Invalid asOf timestamp');
  const sourceMap=new Map<string,PriceFeedSource>();
  for(const source of sources){
    if(sourceMap.has(source.sourceId)) throw new Error('Duplicate feed source ID');
    sourceMap.set(source.sourceId,source);
  }
  const seen=new Set<string>();
  const accepted:PriceObservation[]=[];
  const rejected:IntakeRejection[]=[];
  for(const o of observations){
    const s=sourceMap.get(o.sourceId);
    const t=time(o.observedAt);
    let reason='';
    if(!o.observationId || seen.has(o.observationId)) reason='duplicate_or_missing_observation_id';
    else if(!s) reason='unknown_source';
    else if(s.permission!=='authorized'||!s.permissionEvidenceUrl||!validHttps(s.permissionEvidenceUrl)||
      !s.allowedUses.includes('price_display')||!s.allowedUses.includes('price_history')) reason='rights_not_verified';
    else if(s.expiresAt && (!Number.isFinite(time(s.expiresAt)) || time(s.expiresAt)<now)) reason='source_permission_expired';
    else if(o.merchantId!==s.merchantId || o.market!==s.market || o.currency!==s.currency) reason='source_scope_mismatch';
    else if(!o.identityVerified || !o.variantId) reason='variant_not_verified';
    else if(!['new','refurbished','used'].includes(o.condition)) reason='invalid_condition';
    else if(!nonnegative(o.itemPrice)||o.shippingPrice===null||!nonnegative(o.shippingPrice)||!o.taxesIncluded) reason='landed_price_incomplete';
    else if(!['in_stock','out_of_stock','unknown'].includes(o.availability)) reason='invalid_availability';
    else if(!Number.isFinite(t)||t>now||t<now-366*DAY) reason='invalid_or_out_of_range_timestamp';
    else if(!validHttps(o.productUrl)) reason='invalid_product_url';
    else if(o.deliveryDays!==undefined && (!Number.isFinite(o.deliveryDays)||o.deliveryDays<0)) reason='invalid_delivery';
    seen.add(o.observationId);
    if(reason) rejected.push({observationId:o.observationId,reason});
    else accepted.push({...o});
  }
  return {accepted,rejected,status:'quarantined'};
}

export interface HistoryPolicy {
  asOf: string;
  lookbackDays: number;
  minDistinctDays: number;
  /** Minimum fraction of days actually observed in the lookback window. */
  minDayCoverage: number;
  /** Max acceptable gap in observation dates, in days. */
  maxGapDays: number;
}
export interface PriceHistorySummary {
  variantId: string;
  merchantId: string;
  sampleDays: number;
  coverageRatio: number;
  maxGapDays: number;
  observedMedian: number | null;
  observedMinimum: number | null;
  observedMaximum: number | null;
  status: 'descriptive_only' | 'insufficient_coverage';
  warnings: string[];
}
/** Merchant-specific series only: never silently blend changing retailer panels into one price history. */
export function summarizeMerchantHistory(
  observations: PriceObservation[], variantId:string, merchantId:string,
  market:string,currency:string,policy:HistoryPolicy
):PriceHistorySummary {
  const now=time(policy.asOf);
  if(!Number.isFinite(now)||!Number.isInteger(policy.lookbackDays)||policy.lookbackDays<2||
    !Number.isInteger(policy.minDistinctDays)||policy.minDistinctDays<2||
    !Number.isFinite(policy.minDayCoverage)||policy.minDayCoverage<0||policy.minDayCoverage>1||
    !Number.isInteger(policy.maxGapDays)||policy.maxGapDays<0) throw new Error('Invalid history policy');
  const byDay=new Map<number,number>();
  for(const o of observations){
    if(o.variantId!==variantId||o.merchantId!==merchantId||o.market!==market||o.currency!==currency||
      o.condition!=='new'||!o.identityVerified||o.shippingPrice===null||!o.taxesIncluded||
      !nonnegative(o.itemPrice)||!nonnegative(o.shippingPrice)) continue;
    const t=time(o.observedAt);
    if(!Number.isFinite(t)||t>now||t<now-policy.lookbackDays*DAY) continue;
    const d=Math.floor(t/DAY);
    const total=o.itemPrice+o.shippingPrice;
    const old=byDay.get(d);
    byDay.set(d,old===undefined?total:Math.min(old,total));
  }
  const days=[...byDay.keys()].sort((a,b)=>a-b);
  const values=[...byDay.values()].sort((a,b)=>a-b);
  const coverage=days.length/policy.lookbackDays;
  // Count leading/trailing gaps as well, so old data alone cannot pass as current.
  const start=Math.floor((now-policy.lookbackDays*DAY)/DAY)+1;
  const end=Math.floor(now/DAY);
  const marks=[start-1,...days,end+1];
  let gap=0;
  for(let i=1;i<marks.length;i++) gap=Math.max(gap,marks[i]-marks[i-1]-1);
  const warnings:string[]=[];
  if(days.length<policy.minDistinctDays) warnings.push('too_few_observed_days');
  if(coverage<policy.minDayCoverage) warnings.push('low_calendar_coverage');
  if(gap>policy.maxGapDays) warnings.push('long_observation_gap');
  const enough=warnings.length===0;
  const n=values.length;
  const median=n?(n%2?values[(n-1)/2]:(values[n/2-1]+values[n/2])/2):null;
  return {variantId,merchantId,sampleDays:n,coverageRatio:coverage,maxGapDays:gap,
    observedMedian:enough?median:null,observedMinimum:enough?values[0]:null,
    observedMaximum:enough?values[n-1]:null,
    status:enough?'descriptive_only':'insufficient_coverage',warnings};
}
