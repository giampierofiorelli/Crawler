# Phase 41 — Independent ranking to approved purchase destinations

## Implemented

`buildLaunchRecommendation` (`src/launch_pipeline.ts`) calls the independent `rank()` engine **before** resolving merchant links with the existing Phase 40 approval gate. Commercial inputs are never passed to `rank()`. Merchant availability, retailer choice and affiliate incentives cannot change candidate order or winner in this function. Output includes the original ranking and per-variant approved destination links; no prices or purchase-timing advice is serialized.

### Production-facing usage

```ts
import { buildLaunchRecommendation } from './src/index.js';
const result = buildLaunchRecommendation({
  variants, evidence, request, offers, approvals, nowIso: new Date().toISOString()
});
```

The caller must obtain `offers` and `approvals` from controlled, audited stores. Approval records are **assertions by a reviewer**, not proof of rights or link validity. URL syntax checking is not a live HTTP/redirect/product verification. Use only independently licensed catalogue and evidence inputs. Do not use Amazon content to create cross-retailer product listings.

## Explicitly not done

- No real affiliate accounts, licensed feeds, or Amazon APIs connected.
- No proof of actual product availability, accurate ASIN-to-variant mapping, or link destination at runtime.
- No UK regulatory/legal approval, no confirmed acceptance by Amazon Associates, and no merchant agreement verification.
- No production authentication, rate limiting, storage, observability or web UI.
- Ranking still relies on **synthetic 0–10 measurements** and includes independent catalogue `Variant.price` in its optional `request.maxPrice` filtering. This is **not** an Amazon price and is **not** shown in the launch response, but the broader user requirement of price-free selection needs a separate product-policy decision and refactor. Avoid setting `maxPrice` until catalogue price provenance and rights are approved.
- Legacy experimental price modules remain present in source and dist; `src/index.ts` does not export them. Build/deployment must use an explicit allowlist before calling this production-safe.

## Verification

Run `npm test` and Python tests. New tests assert ranking independence under offer changes, fail-closed approval behavior, price-free response shape and input immutability. Tests use fictional fixtures only.
