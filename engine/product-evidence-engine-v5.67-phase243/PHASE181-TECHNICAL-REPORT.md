# Product Evidence Engine — Phase 181 technical report

**Date:** 2026-10-12  
**Canonical parent:** v5.04 / Phase180  
**Release:** v5.05 / Phase181  
**Status:** verified bounded dynamic-ranking implementation with *fictional test products only*. Not a live evidence-backed shopping engine.

## Architectural decision — correction of Phase180

The PEE must **not** depend on storing a precomputed ranking for each user goal, priority vector or market context. Its persistent reusable asset is verified, continuously expandable **product knowledge**: exact variant identity, function and performance, original professional tests, protocols, normalization, compatibility, confidence/limits, coverage and reviewed scoring policy. A ranking is computed deterministically from that knowledge and the **current confirmed criterion snapshot**. Previously signed ranking releases can be reused as a **cache** only with strictly matching scope, data version and original confirmed criteria.

The system should research likely high-demand categories/products *before* incoming questions. It must also recognize missing knowledge when a new category or exact model appears, or when the user needs a previously unmeasured property, and trigger a *bounded* research process. This release **detects and records research gaps** but does not yet autonomously fetch sources or approve discoveries. New claims must pass preexisting source custody, method comparison and independent review before affecting recommendations.

## Implemented code

- `src/phase181_dynamic_knowledge_ranking.ts` introduces a versioned *per-product evidence catalog*, authenticated by a trusted server-pinned public key. Unlike Phase180's whole-ranking releases, its schema has **no shopper fingerprint or ranked order**.
- A request confirms category, relevant dimensions, label meaning, values and priorities through Phase177. Query-time dynamic scoring then uses admitted exact-variant observations and the signed policy's priority-dependent dimension weights. It enforces noncompensatory hard gates and holds unknown/missing tests aside, with links and original test IDs.
- Unseen exact variants, missing measured dimensions, unsupported user needs and stale catalogs produce machine-readable `researchGaps`. Missing decisive criteria block an unjustified *partial personalized* ranking. Discovered but not yet reviewed products stay visible, rather than silently disappearing.
- `src/phase178_site_server.ts` accepts an optional server-provisioned knowledge registry and selects the dynamic output when eligible, preserving Phase180's exact-match signed precomputed publication path as a fallback cache. Visitors cannot set or sign product evidence through request bodies. Old callers and the safe unauthenticated localhost default remain backwards compatible.
- `web/phase178/app.js` labels query-time rankings distinctly from cached publications.
- New test files `tests/phase181_dynamic_knowledge_ranking.test.ts` and `tests/phase181_dynamic_http.test.ts` verify ranking recalculation, confirmation, no rank drift across identical need vectors, source and variant binding, unknown/missing evidence, time/market, tampering, client-injection resistance, website responses and continued Phase180 operation.
- `docs/phase181/PRODUCT-KNOWLEDGE-FIRST-ENGINEERING-DECISION.md` records the contracts, existing code reuse, limitations and testable next steps.

## Scenarios exercised

1. Two fictional vacuum models are assessed for carpet cleaning and carrying upstairs. Initially the carpet-oriented fixture ranks first. After a legitimate change in relative priorities, the stairs-oriented fixture ranks first using the **same catalog**: no whole-ranking release was regenerated.
2. A newly admitted independently signed product observation revision adds a previously unmeasured model. Under unchanged needs the newer model can now rank first, with an explicit knowledge revision difference.
3. An additional confirmed need not covered by the approved knowledge blocks publication and requests category-specific study.
4. A variant missing measurements, even on a non-hard criterion, remains held. A known hard failure is not compensated by a high score elsewhere.
5. A request names a previously unknown product and triggers a precise missing-variant research item, rather than silently treating the reviewed population as the whole market.
6. Tampered signatures, reused tests from other variants, incompatible protocol versions, different markets and expired snapshots fail closed.

## Critical separation of concerns

An authentic cryptographic signature verifies the **provenance of the signed knowledge snapshot**, not the correctness of its numerical scores, experts' methods, or weighting policy. The sample data, weights, reviewer and original URLs in unit tests are all fixtures. The software does **not** derive scores from downloaded reviews, judge research quality, or authenticate copyright/licensing claims by itself. All production scientific claims would require genuine source acquisition and independent review, including the earlier Phases95, 105–106, 129, 169–171, 179.

### Still missing

- A real reviewed exact-variant product catalog, with lawful ingestion of original professional measurements, method comparability and an independently operated signing authority.
- Bounded automated **execution** of just-in-time research tasks from `researchGaps` using the existing research workers; source provenance and review must remain separate.
- Broad/independent English goal interpretation on previously unseen queries and a robust first-turn path balancing assumptions and confirmation.
- Adequacy thresholds for "good enough for this goal", global product coverage monitoring, uncertainty calibration and direct product-page views.
- Complete alternative solution composition with exact accessory compatibility, no-purchase solutions and total ownership cost.
- Production website, authentication, durable data storage and live updating. Phase178 is still a localhost research prototype.

## Software test scope

Targeted Phase181 tests and neighboring Phase178/180 tests run with TypeScript compilation. Eligible TypeScript full regression excludes the legacy Phase91/92 suites, consistent with the prior release. Six Python suites are run separately. Regression machine-readable results live under `evaluation/phase181/` inside the archive. **Test success demonstrates expected code behavior on bounded examples, not product-science validity.**

## No downloads or Colab needed

No new GitHub repo, local neural weights or commercial service are necessary for the implemented slice. Further external source access and model experiments can be requested only when a measured gap makes a specific artifact necessary.
