# Phase 181 — Product knowledge first, on-demand ranking second

**Base:** PEE v5.04 Phase180. **Target:** cumulative v5.05 Phase181. **Language:** English-first. **Status:** bounded implementation, synthetic data only.

## Critical correction accepted

A precomputed whole-ranking release is a possible **cache/publication artifact**, NOT the main knowledge base or a prerequisite for a recommendation. The persistent source of truth must be the evidence about exact product variants, performance dimensions, limitations, measurements, protocols, revisions, and professional provenance. The same validated product knowledge can support a newly weighted ranking at request time, a direct product inspection or a whole-goal solution after goal decomposition. Phrase changes alone must not change results when the canonical needs are identical.

### Existing components reused

- Phase177: confirmed goal/criterion/value/priority snapshots and integrity validation.
- Phase180: canonical JSON and pinned independent Ed25519 verification plus a **legacy optional cached whole-ranking publication**.
- Phase178: website read model and server-side-only injection of authenticated product knowledge. Never accept a catalog or signing key sent in a visitor request.
- Phases169–171: original-source/variant/protocol audit and conflicts, still required upstream.
- Phases73–74/128–129/179: bounded category research orchestration and candidate quarantine, still required upstream for missing products and category updates.

### Implemented in this slice

1. `phase181_dynamic_knowledge_ranking.ts`: a signed *knowledge catalog* stores variant-bound original tests and normalised dimension assessments, without any prepared ranking and without a shopper/criteria fingerprint.
2. At query time, align each **user-confirmed** criterion key, label and exact value with reviewed catalog dimensions; derive weights by the chosen priorities under an **externally reviewed** policy, and rank deterministically using all eligible reviewed products. A genuinely different need/priority can change the result with no new ranking release.
3. Before ranking, verify catalog signature and server-pinned trusted public key, market/category/time/version, exact model/test/method/protocol identity, scoring-scale bounds, and exact user criteria. Never equate a signature with scientific validity.
4. Failed hard gates exclude products, missing measurements/unknown hard outcomes hold them out, unstudied discovered products remain explicitly visible. Unsupported criteria block the ranking instead of being silently ignored. Coverage cannot claim an exhaustive market.
5. Emit machine-readable gaps for unknown categories, missing catalogs, exact variants, missing tests, unsupported criteria and stale knowledge. **These are pending research work items, not proof that autonomous browsing ran.**
6. Phase178 website selects dynamic per-product knowledge if the result is authorised; the Phase180 exact-matching precomputed release is a fallback cache, never required. The old public API remains supported. The dynamic publisher is server-provisioned only.

## Separate research/knowledge/recommendation responsibilities

`English request -> goal/category/need candidate -> user-confirmed decision snapshot -> reviewed product evidence lookup -> gaps/just-in-time research when needed -> independent source and method verification -> versioned canonical knowledge -> eligibility + dynamic score -> visible explanation/product page`.

Research acquisition and training from source documents must **not** directly mutate the approved catalog, hard gates, or ranking; the Phase129/179 quarantine and the independent Phases169–171 review chain continue to be mandatory. New evidence and catalogs can trigger re-evaluation. Historical snapshots and policy versions must remain reproducible.

## Important limits

- All catalog/product/test/policy data used in new tests are **fictional**. There is no admitted professionally measured live product corpus and no independently operated reviewer signing authority.
- Signed precomputed rankings remain functional for exact matching but are not the canonical strategy.
- The new gap detector does not itself download pages, execute web browsing, validate the source's permission or perform scientific review. This remains the next engineering integration, using the existing research workers and source governance.
- Normalised points and reviewed weights are *inputs* from an external process, not created/validated by this module. Passing tests does not validate the measurement construct or relative product utility.
- The first English free-form request still generates provisional criteria; critical false-negative assessment, user-confirmation UX, and source-disjoint real-query benchmarks remain required for immediate answers.
- Multiple-product solution optimisation, exact accessory compatibility, product-page additional goals, calibrated task adequacy, and no-purchase comparisons remain separate work.
- The test server remains localhost-only and unauthenticated. Do not deploy as-is.

## Acceptance criteria for subsequent work

1. Retrieve at least two authentic independent professional original protocols and exact product variants for a narrow category; maintain licensed access and source custody; establish comparability without silently mixing protocol revisions.
2. Demonstrate incremental update of one product from a newly admitted original source and deterministic rank recomputation under two confirmed needs; preserve predecessor snapshot and explain changes.
3. Trigger *bounded, targeted* research for a previously unseen model and log failures/permissions, then quarantine findings pending independent review.
4. Direct product pages and cross-category solutions must use the same evidence graph as rankings, not copies of claims.
5. Measure first-answer recall of decisive requirements, time-to-useful-comparison, source coverage and false-veto rates on untrained English requests; include a standard AI-shopping baseline.

