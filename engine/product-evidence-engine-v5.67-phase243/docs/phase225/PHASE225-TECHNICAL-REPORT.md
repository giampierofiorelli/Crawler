# Product Evidence Engine — Phase225 technical report (v5.49.0)

**Date:** 2026-10-13. **Canonical base:** full `product-evidence-engine-v5.48-phase224-FULL.zip`. **Status:** offline integration and executable tests, **not** a demonstrated live independent product-review analysis or ranked recommendation.

## What actually changed

`src/phase225_transient_test_probe.ts` adds a bounded English-first parser for first-person, explicitly measured test **leads** within an HTML page already retrieved by Phase222. It rejects overt marketing/specification attribution, explicit no-test statements and JavaScript/JSON-LD bodies as prose evidence. It records atomic quantity and unit, a bounded instrument cue when present, an explicit ambient-condition cue when present, source-block digest, document digest when byte-exact, source URL and unverified publisher-declared model context. It returns no sentences, paragraphs, excerpts, article body or ratings. It processes at most 380 bounded semantic blocks and emits at most 20 test candidates per page. Its conservatism necessarily misses many genuinely useful test reports.

**Reuse, not a new crawler:** `src/phase222_transient_public_page_observer.ts` calls the new probe during the **same** previously gated HTTPS page read that runs Phase224 JSON-LD extraction. It also runs the pre-existing Phase155 (`analyzeEnglishReview155`) English professional-review reader on bounded ephemeral text as a **diagnostic only**. That reader is historically specialised for certain page layouts/fields; no cross-category recognition accuracy is asserted. These are candidate extraction paths, not evidence admission.

`src/phase225_test_lead_audit.ts` deduplicates leads, detects two different byte versions at the same URL when hashes exist, checks source/product scope, refuses tampered promotion flags and outputs a queue of *review-needed source/variant/method* references. Original publication, independent experiment, author, exact market variant, calibration and comparability remain unverified. No new commercial ranking, claim score or product-performance evidence is admitted.

`tests/phase225_transient_test_probe.test.ts`, `examples/phase225-transient-test-demo.ts` and `scripts/phase225-run.mjs` make the chain testable from parsed page leads to structured audit and a real-mode CLI without mock transport exposed to CLI. The demonstration uses **fictional** shoes, bins, publishers, methods and measurements. They are not scientific or empirical evidence. The CLI does not fabricate products when sources are absent.

`src/phase225_local_node_types_compat.d.ts` supplies a **development-only** type overload for Node's `generateKeyPairSync('ed25519')` because this sandbox has `@types/node` v25 while the canonical TypeScript tests were authored for Node22 type inference. No inherited test source was edited to suppress errors, and runtime behaviour was unchanged. The global `@types/node` package used in compilation is an environment dev tool and is **not** embedded as a runtime dependency.

## Verification actually executed

- `tsc -p tsconfig.json`: **passed** with the local dev-only compatibility declaration and environment-provided Node typings.
- `node --test dist/tests/phase225_transient_test_probe.test.js`: **13/13 passed**.
- **Admitted TypeScript regression: 4,004/4,004 passed**, 15 groups and 189 test files, no failed groups. Groups 1–13 were run with Node test concurrency 3, group 14 was rerun serially after the concurrent run stalled (186/186 passed), group 15 passed with concurrency 3 (97/97). The Phase91/92 legacy suites were excluded **as inherited**, not counted as passed. See `PHASE225-REGRESSION-RESULTS.json` and `test-logs/ts-*.log` for the actual output.
- `node dist/examples/phase225-transient-test-demo.js`: performed four **fixture transport calls**, including two synthetic robots.txt responses and two fictional HTML page responses. Yielded 2 first-person numeric measurement **leads** and 0 admitted scientific tests. See `PHASE225-SYNTHETIC-REPLAY.json`. No network fetch was performed by PEE.
- `node scripts/phase225-run.mjs` executed using plain English requests about artificial-grass football boots and paper/plastic recycling bins. Registry has no configured real publisher sources; example search engine is disabled. Both attempts reported **0 live acquisitions, 0 admitted tests, 0 ranked products**, see `PHASE225-FOOTBALL-CLI.json` and `PHASE225-BINS-CLI.json`.
- No separate Python unit regression was run, and no precision/recall/F1 on independent original professional reviews has been demonstrated. A passing fixture cannot establish extraction accuracy on real webpages.

## Reproduce without an external LLM service

```bash
# In a Node >=20 environment with project development typings (Node22 preferred):
npm run build
node --test dist/tests/phase225_transient_test_probe.test.js
node dist/examples/phase225-transient-test-demo.js
node scripts/phase225-run.mjs --request 'I need football boots for artificial grass pitches' \
  --registry docs/phase220/phase220-category-vocabulary.json \
  --state /tmp/pee225-football-state.json \
  --search-config docs/phase223/SEARXNG-SEARCH-CONFIG-EXAMPLE.json \
  --output /tmp/pee225-football.json
```

## What remains blocking actual consumer recommendations

1. **Live source discovery and acquisition by the software** must be shown from an environment with working DNS, an actual configured search provider and a real documented public source. ChatGPT external browsing is not PEE program execution. The user currently works from an iPhone, so these steps are deferred rather than requesting a local computer.
2. HTML probing is limited to explicit first-person measured statements in bounded English blocks. It is not a general semantic scientific reader; it misses table-only results, PDFs, methods across distant sections, videos, product alias/coreference and implicit measurement reports. HTML rendering with script execution is not implemented here.
3. **Actual scientific evidence approval** still requires source originality/independence review, original protocol, unit and test-condition normalisation, version/document identity, reader attribution to the precise market variant and reviewer attestation. Existing Phase95/139–156, 183/193–205 and 216–219 systems are relevant but have not been automatically elevated to verified evidence by this stage.
4. An instrument name mentioned in prose does not demonstrate a valid instrument, a correct experiment, sufficient sample size or suitable test surface. For example, a generic measurement of a football boot's mass is not proof of safety on AG; a bin's measured total volume is not proof of usable compartment capacity.
5. The user asks for **reasoned, original answers with citations**, not reprinting or retaining publishers' articles. This component stores only bounded hypotheses, URL and hashes in its results. Upstream access continues to respect explicit restrictions, robots and network safety; it does not demand a fictional individual licence for every public page.

## Technical references and original software locations

The citations below are **external documentation for the engineering contracts**, not sites visited by the PEE execution in this phase.

- [Schema.org Review](https://schema.org/Review) and [Product](https://schema.org/Product): publisher-authored markup is not independent experimental verification.
- [RFC 9309 — Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html): upstream crawler access checks.
- [SearXNG Search API](https://docs.searxng.org/dev/search_api.html): the existing optional Phase223 search discovery interface; not deployed here.
- Within the repository: `src/phase95_professional_review_intake.ts`, `src/phase155_review_orchestrator.ts`, `src/phase193_screening_memory.ts`, `src/phase217_primary_fact_custody.ts`, `src/phase222_transient_public_page_observer.ts`, `src/phase224_transient_structured_claims.ts`.
