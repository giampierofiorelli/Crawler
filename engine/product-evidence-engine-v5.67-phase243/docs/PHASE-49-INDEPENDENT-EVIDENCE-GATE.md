# Phase 49 — Independent evidence admission gate (10 October 2026)

## Scope and factual status
This is an **offline synthetic research prototype**. The code does not access any live independent reviewer, verify a real publisher identity, verify a licence agreement, authenticate an editor, normalize professional measurements or validate a product with a real testing protocol. A generated ranking is **NOT publishable**.

The phase addresses an earlier design defect: `Evidence.rights = authorized` was a field supplied by the caller and not substantiated by a distinct review document. It also allowed an unverified mapping from a test of one variant to another.

## Implemented
- `src/evidence_review.ts`: SHA-256 fingerprint covers source, original test, source URL, tested variant, all applicable variants, dimension, score, synthetic scale, test protocol, conditions, admission status and rights.
- A **separate** approved editorial record is required for each evidence ID and exact fingerprint. It declares publisher type, independent identity, commercial reuse grant, methodology, original test and tested variant references, reviewer identity and a time-bounded approval. Missing, revoked, duplicate, outdated and future-dated approvals fail closed.
- Only `publisherType = independent_testing` is accepted; Amazon-hosted product sources and shortened `amzn.to` links are explicitly excluded from the scoring input. This is a defensive block, **not** a substitute for verifying all retailer domains and publisher independence.
- Untested cross-variant score transfers are blocked, even when two products share a family, SKU fragment or manufacturer description.
- Inconsistent copies claiming the same original test are rejected rather than silently pooled.
- Launch pipeline applies this audit **before** synthetic scoring. Rejected evidence IDs and reasons are returned without merchant data affecting ranks.
- Caller must explicitly use `purpose: synthetic_demo`; other or missing purposes are rejected. All responses have `publicationReady: false` and carry a prominent warning. No real-world scoring profile exists.
- Retailer offers remain appended after ranking; no price, MSRP, retailer data, Amazon API content, availability or affiliate commission enters the score.

## What documentary references do **not** prove
A string like `commercialReuseGrantReference: "document-42"` is NOT evidence that a valid licence exists. The application still needs an authenticated workflow which verifies an actual signed contract, authorized scope (commercial summaries, derived data, machine processing), ownership, permitted storage/distribution, termination/expiry, right to use test data, and reviewer identity. This phase is a gate for recorded claims, **not legal clearance**. The synthetic test fixture supplies fictional references only.

## Rights discovery, example of an excluded source
**Which? UK**, General Terms (dated 5 May 2026): https://www.which.co.uk/help/general-terms-aYhBS9Y7TTtE. Its terms explicitly restrict commercial use of Which? content, scraping/collection, database construction, and public reproduction of scores/stars. Do not scrape or import Which? scores merely because they are visible on the web. A negotiated, specific permission would need checking by legal counsel.

**Schema.org ProductModel** (https://schema.org/ProductModel) supports `isVariantOf`, `manufacturer` and recommends strong product identifiers such as `gtin` and `mpn`. Such identifiers can help candidate resolution but **do not** by themselves establish a tested variant matches the sold variant. Exact test applicability still requires evidence.

## Next blockers (not implemented)
1. Acquire one or more genuine commercial-use licences for professional tests or other lawful data sources.
2. Authenticate editors and bind approvals to retained original documents and verified publisher ownership; support revocations and audit trails in a real DB.
3. Design methodology-specific calibration / interpretation of genuine test measurements. The current synthetic 0–10 metric cannot represent them.
4. Verify exact variant IDs and independent reference product data for a limited category with a named source, documented protocol and measured coverage denominator.
5. Only then introduce a production mode and consumer-facing recommendation claims. Until then do not deploy this package as a live recommendation system.

## Test commands
```
npm test
npm run test:launch
npm run test:release
python3 -m unittest discover -s ingestion -p 'test_*.py' -v
```
