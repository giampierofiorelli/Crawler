/** v0.4: strict bridge between the approved DB snapshot and the deterministic engine.
 * Real-world measurements are NOT automatically converted into synthetic 0-10 scores.
 * Production normalization is deliberately disabled until independently validated.
 */
import { rank } from './engine.js';
import type { Dimension, Evidence, RankingResult, Request, Variant } from './types.js';

const dimensions = new Set<Dimension>(['carpet','pet_hair','ease']);
const markets = new Set(['UK','EU','US']);
const currencies: Record<string,string> = {UK:'GBP',EU:'EUR',US:'USD'};
export type BridgeMode = 'synthetic_fixture' | 'production';
export interface BridgeReport {
  result: RankingResult;
  acceptedEvidence: number;
  rejectedEvidence: { id: string; reason: string }[];
  eligibleVariants: number;
  mode: BridgeMode;
}
function object(value: unknown): Record<string,unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected object');
  return value as Record<string,unknown>;
}
function str(v: unknown): string { if (typeof v !== 'string' || !v.trim()) throw new Error('Invalid string'); return v; }
function finite(v: unknown): number { if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('Invalid number'); return v; }
function https(v: unknown): string { const s = str(v); if (!/^https:\/\/[^/\s]+/i.test(s)) throw new Error('HTTPS source URL required'); return s; }
function conditions(v: unknown): Record<string,string> {
  const o=object(v);
  if (!Object.values(o).every(x=>typeof x==='string')) throw new Error('Conditions must be strings');
  return o as Record<string,string>;
}
function variantRow(raw: unknown): Variant {
  const r=object(raw); const market=str(r.market);
  if (!markets.has(market)) throw new Error('Invalid market');
  if (r.currency!==currencies[market]) throw new Error('Market currency mismatch');
  const price=finite(r.price); if (price<0) throw new Error('Invalid price');
  https(r.offer_url);
  const observed = Date.parse(str(r.observed_at));
  if (!Number.isFinite(observed)) throw new Error('Invalid offer timestamp');
  // DB enforces 48h, but a reused snapshot must also be checked on consumption.
  const age=Date.now()-observed;
  if (age<0 || age>48*60*60*1000) throw new Error('Stale or future offer');
  const specs=object(r.specifications);
  if (!Object.values(specs).every(v=>['string','number','boolean'].includes(typeof v))) throw new Error('Unsupported specifications');
  return {id:str(r.id),familyId:str(r.family_id),market:market as Variant['market'],
    sku:str(r.sku),currency:str(r.currency),price,specifications:specs as Variant['specifications']};
}
function evidenceRow(raw: unknown, mode: BridgeMode): Evidence {
  const r=object(raw); const id=str(r.id); const dimension=str(r.dimension);
  if (!dimensions.has(dimension as Dimension)) throw new Error('Unsupported dimension');
  // Real measurement units and metrics require approved per-protocol calibration.
  // Never pass them through as if they were comparable 0-10 measurements.
  if (mode==='production') throw new Error('No validated production normalization profiles installed');
  if (r.metric!=='synthetic_score' || r.unit!=='synthetic_0_10') throw new Error('Fixture metric/unit mismatch');
  const value=finite(r.numeric_value);
  if (value<0 || value>10) throw new Error('Score out of range');
  const testedVariantId=str(r.tested_variant_id);
  const variantId=str(r.variant_id);
  if (testedVariantId!==variantId) throw new Error('Cross-variant transfer is not approved by this bridge');
  return {id, originalTestId:str(r.session_id), source:str(r.source),sourceUrl:https(r.source_url),
    testedVariantId, applicableVariantIds:[variantId],dimension:dimension as Dimension,
    value,scale:'synthetic_0_10',protocolId:`${str(r.protocol_id)}@${str(r.protocol_version??'unversioned')}`,
    conditions:conditions(r.conditions),status:'admitted',rights:'authorized'};
}
/** Caller MUST ensure production snapshot came from export_approved.py, not user-supplied JSON. */
export function rankSnapshot(snapshot: unknown, request: Request, mode: BridgeMode): BridgeReport {
  const s=object(snapshot);
  if (s.schema_version!==1) throw new Error('Unsupported snapshot version');
  if (mode==='production' && s.origin!=='live-postgres-eligible-view') throw new Error('Production must use the live DB eligibility view');
  if (mode==='synthetic_fixture' && s.origin!=='synthetic-fixture') throw new Error('Synthetic mode requires explicit fixture origin');
  if (!Array.isArray(s.variants) || !Array.isArray(s.evidence)) throw new Error('Missing snapshot arrays');
  const variants: Variant[] = [];
  const rejectedEvidence: {id:string;reason:string}[] = [];
  for (const raw of s.variants) {
    try { variants.push(variantRow(raw)); }
    catch (err) { rejectedEvidence.push({id:String((raw as any)?.id??'unknown variant'),reason:`Variant excluded: ${(err as Error).message}`}); }
  }
  const validVariantIds = new Set(variants.map(v=>v.id));
  const evidence: Evidence[] = [];
  for (const raw of s.evidence) {
    try {
      const e=evidenceRow(raw,mode);
      if (!validVariantIds.has(e.applicableVariantIds[0])) throw new Error('No eligible market variant/offer');
      evidence.push(e);
    } catch (err) { rejectedEvidence.push({id:String((raw as any)?.id??'unknown evidence'),reason:(err as Error).message}); }
  }
  const result=rank(variants,evidence,request);
  return {result,acceptedEvidence:evidence.length,rejectedEvidence,eligibleVariants:variants.length,mode};
}
