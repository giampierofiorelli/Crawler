# Product Evidence Engine — Phase226 technical report (v5.50.0)

**Date:** 2026-10-13  
**Base:** `product-evidence-engine-v5.49-phase225-FULL.zip` (v5.49.0)  
**Status:** tested **offline** enhancement to test-result discovery in HTML tables. **No live web acquisition, verified professional measurement, or consumer ranking.**

## 1. Problem verified in code

Phase225 `src/phase225_transient_test_probe.ts` could extract some first-person numerical measurements from paragraphs and list cells but not reliably from table grid relationships. An unscoped `td` contains a number without saying whether it belongs to a model, a manufacturer specification, an experimental result, a tested condition, or a different unit. The archive already includes `phase183_source_measurement_intake.ts`, which parses *reviewed operator-supplied CSV tables*, but that does not parse transient public HTML or establish original-test identity. There was no justification for a second fetch or a new heavy dependency.

## 2. Concrete implementation

- `src/phase226_transient_test_tables.ts` is a bounded, dependency-free **research lead** extractor, invoked inside the *same* previously gated HTML read through Phase225 and Phase222. Maximum 12 tables, 35 rows per accepted table, 8 columns, 20 leads overall. It uses `thead`, one explicit `th scope="col"` header row, `tbody`, `th scope="row"`, and unambiguous dimensions/units. It **abstains** on `colspan`, `rowspan`, nested/complex/ragged tables, ambiguous model assignments or absent explicit units. It requires nearby first-person measured/tested prose; an “Our test measurements” caption alone is insufficient.
- Each table row must identify **exactly one** publisher-declared product name, model or SKU from the already-observed page; no partial or fuzzy model matching. For each candidate, source URL, source/document digest when byte-exact, derived block digest, numeric value/unit, and provisional dimension and part-scope codes are recorded. A labelled “compartment” volume is never silently equated to total usable bin capacity. Model matching is still *unverified source metadata*, not proof of a correct market variant.
- `src/phase225_transient_test_probe.ts` joins table leads with the prior prose leads under the existing 20-candidate maximum; deduplication and deterministic IDs remain in place. `src/phase225_test_lead_audit.ts` now recognises strictly quarantined table candidate scope and rejects missing dimension labels or forged scientific-admission flags. No table passes the scientific evidence gate.
- `scripts/phase226-evaluate-tables.mjs` reproduces two **synthetic** examples without network operations, one football boot mass and one unspecified bin-compartment volume. Full publisher HTML/text is never returned in output. `tests/phase226_transient_test_tables.test.ts` covers column attribution, strict scope, negation, advertised columns, nonmatching SKU, different units, malformed grids, invariance, boundaries, tampering and reuse of the same HTML GET.

**No new runtime dependencies, no external model weights, no copied OSS code, no change to commercial ranking or source-access policies.** This is original limited parser code informed by public HTML documentation.

## 3. Evidence from executed software

| Verification | Result | Limit |
|---|---|---|
| TypeScript build (`tsc -p tsconfig.json`) | PASS | Local dev-only `@types/node` was linked from the installed Node development tooling, **not packed** as dependency |
| Phase225 + Phase226 focused tests | **29/29 PASS** | 13 inherited Phase225 tests + 16 new Phase226 tests; constructed HTML |
| Admitted TypeScript regression | **4,020/4,020 PASS** | 190 files across 15 groups; historical Phase91–92 excluded as inherited; see logs |
| Synthetic football / bin table demo | 1 quarantined table lead for each fixture | **0** real web requests, **0** independently authenticated experiments, **0** rankings |
| Operational Phase225 CLI for both categories | Executed, 0 live acquisitions, 0 ranks | Example SearXNG endpoint is disabled; not a real-world generalisation result |

The *cumulative count* is the actual tests run in this phase; it includes the new test file. No blind real-review precision, recall, F1, or cross-site coverage can be inferred from it.

## 4. Independent technical sources consulted (not downloaded by PEE)

- [MDN: HTML `th`, `scope`, `rowspan`, `colspan`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/th): header associations are required to identify the correct value context. Our deliberately simple parser rejects the more complex span layout rather than pretending to implement the full HTML table algorithm.
- [MDN: Explicit `id`/`headers` associations in complex tables](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Table_accessibility): complex associations need a complete grid processor, not naive positional extraction; currently excluded.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/): supports distinguishing source entities, attributed agents, derivation and original-source identity. PEE's result receipt is only a *provisional* candidate provenance chain; it is not provenance authenticity proof.
- [NIST metrological traceability policy](https://www.nist.gov/calibrations/traceability): a quoted value or an instrument name does not establish calibration chain, measurement uncertainty or suitability for purpose.
- [ISO 5725-1:2023 (official standard overview)](https://www.iso.org/standard/69418.html): measurement conditions, precision and trueness matter for comparisons. Standard overview is not evidence the software is compliant with ISO 5725.

These are **web research sources for engineering design**, not source material ingested in a PEE live run.

## 5. Crucial limits and next test

1. **Current environment cannot demonstrate live PEE search** because no deployed SearXNG instance is configured and prior direct DNS failed. ChatGPT web search does not count as a PEE execution. No work is demanded of the iPhone-only user.
2. The table reader intentionally misses many *real* layouts (dynamic JavaScript, multi-level headers, `id`/`headers`, merged cells, non-English, PDFs, qualitative assessments). It is not an HTML5 DOM parser and is not a robust semantic original-test reader.
3. A source-authored “we measured” statement is an *unverified statement by a publisher*. Original experiment, author independence, equipment calibration, endpoint definition, test protocol version, variant, country and environmental conditions remain unconfirmed. Do not compare or rank candidates on such leads.
4. Archived short real-language quotations (Phases138/143/147) were manually curated, not blinded test HTML. No actual complete HTML review snapshot for the new table path was verified in this phase. No real-excerpt performance score is claimed.
5. Next: test on authentic, legally accessible original complete review HTML collected through a functioning PEE connection. Validate row/column assignment and measure false attribution with an independently annotated, category/source-disjoint sample. Only then consider more complex HTML table support and downstream normalisation/protocol comparison.

## 6. Reproduce

```bash
# Node >=20; Node 22 development typings; no extra production libraries
npm run build
node --test dist/tests/phase225_transient_test_probe.test.js dist/tests/phase226_transient_test_tables.test.js
node scripts/phase226-evaluate-tables.mjs
# Runs normal non-mock CLI; with provided example search configuration it cannot search live
node scripts/phase225-run.mjs --request "I need boots for artificial grass" \
  --registry docs/phase220/phase220-category-vocabulary.json \
  --state /tmp/pee226-football.json \
  --search-config docs/phase223/SEARXNG-SEARCH-CONFIG-EXAMPLE.json
```

Cumulative sources remain in the full ZIP; histories identified as absent in earlier canonical reports are not assumed to have appeared. This package incorporates prior PEE source, research, test results and documentation from the v5.49 predecessor. Exact integrity information is recorded separately in the release JSON and SHA-256 manifests.
