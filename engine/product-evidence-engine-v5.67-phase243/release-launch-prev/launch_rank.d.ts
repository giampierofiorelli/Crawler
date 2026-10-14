import type { Evidence, RankingResult, Request, Variant } from './types.js';
/** Public launch types: prices do not exist in this scoring model. */
export type LaunchVariant = Omit<Variant, 'price'> & {
    price?: never;
};
export type LaunchRequest = Omit<Request, 'maxPrice'> & {
    maxPrice?: never;
};
export declare function rankPriceFree(variants: LaunchVariant[], evidence: Evidence[], request: LaunchRequest): RankingResult;
