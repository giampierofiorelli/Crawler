# Product Evidence Engine — Phase 180 technical report

**Date:** 12 October 2026  
**Parent release:** v5.03 / Phase 179  
**Target release:** v5.04 / Phase 180  
**Status:** bounded implementation of the website's **reviewed first-answer publication path**, not a real-product recommendation or a fully autonomous precomputed market index.

## Decision

The PEE's differentiated first response requires the product evidence to be researched, reviewed and prepared **before** the shopper requests it. The site must not search a handful of links at request time, treat the results as the whole market and improvise a ranking. A relevant, complete-enough, comparable, externally reviewed snapshot must be chosen and deterministically projected onto **the actual confirmed user requirements**. Any decisive requirement not supported by the reviewed evidence must hold the item out instead of passing it.

The new Phase180 software explicitly separates the existence of a scoreable, signed offline evidence pack from the quality of the original scientific source work. A valid signature is necessary for publication through this prototype, but **not proof that the underlying study, weights or interpretation are correct**.

## Implemented source changes

1. `src/phase180_reviewed_first_answer.ts`: canonical JSON, pinned-key Ed25519 signature verification, release-date and market checks, exact confirmed requirement descriptions and values, versioned evidence and ranking-policy bindings, strict original-source/variant/protocol checks, non-compensatory hard-gate passes, missing-source holds, deterministic scoring/ties, evidence URLs, full ranked and held sets, and explicit non-exhaustive market coverage.
2. `src/phase178_site_server.ts`: optional server-side publication registry, no client-supplied keys or signing capability. Its default remains safe research-only abstention. It checks a matching review pack for the current Phase177 snapshot on each request and withdraws the ranking after a material edit. Signed release evaluation uses the server's actual clock, not client timestamps.
3. `web/phase178/app.js`: an English read-only ranked display when authorized, showing policy points, sources, held products, and visible cautions; otherwise an explicit unavailable notice. All variable text continues to use DOM text nodes; no HTML string interpolation for external evidence.
4. Tests: `tests/phase180_reviewed_first_answer.test.ts`, `tests/phase180_first_answer_http.test.ts`. Fixtures deliberately use **nonexistent products**, generated test keys and simulated expert-reviewed data. These tests prove the behavior of code, not quality of product recommendations.
5. `docs/phase180` preserves preceding solution-composition/market research decisions and documents this slice and its limits.

## Key engineering distinctions

- **Eligibility**: a hard requirement is passed only if the signed review includes source-bound affirmative evidence for the exact product. `unknown` stays held, and a demonstrated failure is visible. A high numerical score cannot override a failed/unknown hard gate.
- **Ranking**: signed, reviewed ordinal preference weights and value scales are used for deterministic *policy points*. Their validity must be established upstream. The ranking covers the eligible reviewed candidates, **not all existing products**.
- **Ties and uncertainty**: identical policy scores receive the same rank. Missing or incompatible evidence is shown separately. A source referenced by the wrong exact variant or tested with an incompatible protocol fails validation.
- **Paraphrases and revisions**: the parent Phase177 fingerprint is reused. Because it intentionally does not include natural-language criterion labels, the signed release additionally binds the confirmed label, value and priority to prevent label-only semantic drift. The cost is conservative abstention on some equivalent renamings until an independent English semantic-equivalence proof is implemented.
- **Market and time**: market must match the server's trusted market; expired releases are suppressed. The universe of discovered variants is explicit, including candidates without reviewed measurements.
- **Review and signature**: tests emulate an external approved publishing authority. The project has **no connected professional review issuer, key-management system, curated approved dataset or calibration procedure** yet. The release's asserted source-role declarations are not independently authenticated by this bridge.

## Tests

Targeted Phase180 + existing Phase178 HTTP/UI tests were run after the latest changes (see `evaluation/phase180`). Legacy Phase91/92 regression suites retain their historical exclusion. Test counts and full validation are reported in the separate regression JSON and release verification manifest in the ZIP.

## Critical limitations to resolve

- **First turn**: Phase177 language interpretation proposes *unconfirmed* needs. A signed reviewed ranking cannot automatically be applied to arbitrary English wording. The desired 'immediate first result' is **not yet implemented** for open-ended real user requests. We need source-disjoint validation of semantic goal→reviewed need frames with visible assumptions and high-value clarifying questions only when decisive.
- **No real market coverage**: discovery/crawling, review ingestion, protocol reconciliation, exact product identity and professional independent ranking releases are not connected to this publisher. Phase80/81 and Phase179 provide adjacent research/discovery modules; a completed end-to-end autonomous corpus is not demonstrated.
- **Adequate for purpose**: a passing product-specific hard gate is not yet a full calibrated adequacy threshold. Source-measured performance minima must be established before marking a model "good enough". Multi-product goal solutions, owned equipment, exact compatible accessories and total economic cost remain separate open modules.
- **Legal and editorial**: acquiring or republishing professional measurements requires source-level terms/permissions and reviewer governance. No copyrighted review corpus was repackaged in this increment.
- **Deployment**: Phase178 is localhost, in-memory and unauthenticated; do not deploy as-is. Offline release signing keys are generated only in tests and are not distributed.
- **Competitor comparison**: superiority versus ChatGPT Shopping Research or Claude has not been independently measured.

## Sources inspected (original URLs)

- NIST AI RMF MEASURE, reliable and repeatable evaluations, uncertainty, ongoing monitoring and third-party management: https://airc.nist.gov/airmf-resources/airmf/5-sec-core/
- NIST AI RMF Playbook, validation, benchmark comparison and external validity: https://airc.nist.gov/airmf-resources/playbook/measure/
- Google's OR-Tools CP-SAT design and solver statuses, considered for future bundle constraints but not imported: https://developers.google.com/optimization/cp/cp_solver
- Previous PEE documented research and options (retained verbatim in `docs/phase180`): `SOLUTION-FIRST-CRITICAL-REVIEW.md`, `GOAL-TO-SOLUTION-COMPOSITION-ARCHITECTURE.md` and `CATEGORY-NEEDS-RESEARCH-CONTINUITY.md`.

## Phase181 priorities

1. Perform one **real professionally documented category** ingestion and review using original source documents, measured variants and scope/protocol validation. No fake 'complete web' claim.
2. Connect output of the Phase169–171 original-source custody and source conflict workbench to an independent audited, **offline** approval and signing process. Avoid self-issuing evidence or secrets in the website.
3. Build the **first-turn** English semantic matching of verified category-goal frames against persistent reviewed evidence snapshots. Evaluate critical missed needs, paraphrase invariance, hidden disqualifiers, latency and abstention on source-disjoint authentic requests.
4. Define defensible adequacy thresholds, full product population scope and systematic model/technology update cadence; display missing and not-compared models explicitly.
5. Implement and evaluate whole-goal solutions (including no-purchase and compatible multi-product bundles) after source-grounded individual role assessment. Develop actual reviewer and production-key management before public ranking claims.

**Additional GitHub archives / model weights required right now:** none. Future neural matching experiments may need runtime/model files, but only request them after a measured baseline demonstrates a specific gap. 
