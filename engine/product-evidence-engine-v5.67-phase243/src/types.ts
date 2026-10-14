export type Market = 'UK' | 'EU' | 'US';
export type EvidenceStatus = 'admitted' | 'limited' | 'contextual' | 'excluded';
export type RightsStatus = 'authorized' | 'unknown' | 'prohibited';
export type Dimension = 'carpet' | 'pet_hair' | 'ease';
export interface Variant { id: string; familyId: string; market: Market; sku: string; price: number; currency: string; specifications: Record<string, string | number | boolean>; }
export interface Evidence {
  id: string; originalTestId: string; source: string; sourceUrl: string;
  testedVariantId: string; applicableVariantIds: string[];
  dimension: Dimension; value: number; scale: 'synthetic_0_10';
  protocolId: string; conditions: Record<string, string>;
  status: EvidenceStatus; rights: RightsStatus;
}
export interface Request {
  market: Market; currency: string; maxPrice?: number;
  weights: Record<Dimension, number>; requiredSpecifications?: Record<string, string | number | boolean>;
}
export interface Candidate {
  variantId: string; score: number | null; coverage: number;
  dimensionScores: Partial<Record<Dimension, number>>;
  usedEvidenceIds: string[]; notes: string[];
}
export interface RankingResult { candidates: Candidate[]; winnerId: string | null; outcome: 'candidate' | 'alternatives' | 'insufficient_evidence'; warnings: string[]; }
