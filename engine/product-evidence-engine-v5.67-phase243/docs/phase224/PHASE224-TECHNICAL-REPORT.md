# Product Evidence Engine — Phase 224 technical report (v5.48.0)

**Date:** 13 October 2026  
**Base:** complete, previously delivered `product-evidence-engine-v5.47-phase223-FULL.zip` (v5.47.0).  
**Scope:** executable offline enhancement of transient product attribute observation. **No independent online research or commercially usable ranking was demonstrated.**

## Decision and material change

In Phase223, PEE can query a configured HTTPS SearXNG API for URLs and Phase222 can retrieve HTML into process memory, but the resulting receipts contain only product/publication identity metadata. Numeric and categorical *machine-readable product property claims* were discarded before any downstream audit. Phase224 connects that missing step during the **same page fetch**.

- **`src/phase224_transient_structured_claims.ts`**: bounds and parses JSON-LD `Product`/`ProductModel` with a valid `schema.org` context, including a `Product` nested beneath a `Review` or an `@graph`. Extracts only atomic `additionalProperty` → `PropertyValue` attributes with valid short property name, numeric value or narrowly bounded categorical value, and optional validated unit. Values are publisher declarations; claims are fingerprinted using source URL and publisher-declared model scope. No free-text reviews, product descriptions, aggregate ratings, article quotations, HTML or search snippets are returned or saved. Separate `model`/`sku` fields remain **unauthenticated**; unknown market is represented explicitly. Claims are bounded to 24 per page; oversized inputs and unsafe units are rejected. Duplicates within a page are suppressed, and conflicting declarations for one publisher-declared subject/property are flagged.
- **`src/phase222_transient_public_page_observer.ts`**: on an existing permitted page retrieval, it now calls the Phase224 extractor **before discarding the transient HTML**. Extends each page receipt with `structuredDeclarations224`. It does not cause an additional HTTP request, does not bypass old explicit prohibitions or robots, and retains the existing byte-exact SHA-256 receipts when underlying bytes were supplied and correspond to decoded UTF-8.
- **`src/phase224_claim_lineage.ts`**: audits one or more Phase222 observation runs, deduplicates repeated identical claim IDs even when the same page was obtained through two discovery routes, and reports *unresolved differences* when publisher declarations appear to refer to the same brand, model and SKU. Missing brand and model/SKU cannot be force-merged by product-title similarity. Neither agreement nor disagreement across publishers is a proven experiment or a verified market variant. `originalTestsVerified=0`, `exactVariantsVerified=0`, `rankingAuthorized=false` remain explicit.
- **`scripts/phase224-run.mjs`**: real-mode CLI extends Phase223 CLI with a `structuredClaimAudit` result. Does not expose synthetic transport injection. Existing functions are reused; no crawler, browser, machine-learning model, service or runtime package added.
- **`examples/phase224-evidence-gap-demo.ts`**: an explicitly synthetic, reproducible test with two fabricated publisher pages reporting different values for the same hypothetical boot. It runs through actual Phase222 page-reading logic with a labelled fixture transport and exercises the Phase224 extraction and audit. The resulting JSON is `docs/phase224/PHASE224-SYNTHETIC-REPLAY.json`.

### Sample offline results, explicitly fabricated

The synthetic demo requests two different fabricated URLs. It makes **four simulated transport calls** (two robots and two HTML pages). The same hypothetical shoe is described with one claimed stud height of 12 mm, another of 15 mm, and a shared surface attribute `AG`. Phase224 produces four structured publisher claims and one unresolved stud-height disagreement. **This does not establish which figure is correct, that either publisher exists or that the footwear is actually safe for an AG pitch.** No article body is in the result JSON.

For recycling bins, the focused fixture declares 60 L **total** capacity and two compartments. The Phase224 result does **not** invent individual compartment capacities of 30 L, nor does it establish compatibility with local collection rules or bag dimensions.

### Source/provenance boundaries

1. A schema.org `Review` label and a `Product` label are publisher-supplied markup, **not verification** of an independent original test, reviewer expertise or exact-product identity.
2. The HTML and raw bytes are held only by the existing fetch-and-parse stack during processing; this module only outputs small structured claim hypotheses and provenance links/hashes. No full text, scraped article archive or reproductions of original pages are produced.
3. The source URL is included for citation and verification, and a prior page receipt includes a SHA-256 **only when full byte equality was checked**. This is a version fingerprint, not proof of factual truth or intellectual-property permissions.
4. The value vocabulary is deliberately generic. Semantic correctness, conversion between units, equivalence of manufacturer and market variants, and claim-to-user-need mapping are **not implemented** in this phase. No invented shoe-sole compatibility rules or recycling-bin compartment deductions were introduced.
5. Rights/robots/SSRF and rate limits remain upstream in Phases69/222. The new parser runs only after those gates in the production path. Public reading is not equated with unrestricted mass text mining; the requirement to obtain individual written permission from every public site is not imposed.

## Validation

- TypeScript `npm run build`: passed with environment-provided development typings (`@types/node` v22.19.7); these are not included as a runtime dependency.
- **18/18 Phase224 focused tests:** source-bound numerical/categorical claims, manufacturer and reviewer declarations, bin non-inference, schema/context and free-text rejection, malformed units, nested review/graph, duplicate and contradictory properties, weak identity, exact provenance, bounded parsing, live/fixture separation through the inherited Phase222 gateway, explicit registry access prohibition, cross-publisher disagreement, same-source deduplication, different variant non-merger, and observation tampering.
- Admitted full TS regression: **see the re-executed `PHASE224-REGRESSION-RESULTS.json`** for final count. Historical Phase91/92 remain excluded; do not interpret this exclusion as a passing result.
- Actual new Phase224 CLI executed for two everyday English requests: `I need football boots for AG pitches`; `I need a recycling bin for paper and plastic`. In the default configuration the source registry has no live sources and the example SearXNG endpoint is disabled. **Zero external HTTP calls, zero observed products, zero verified claims.** The engine explains insufficiency instead of inventing product facts.
- Source-material demo and fixture tests are **synthetic offline software tests**, not real-world validation. No vendor testing methodology or accuracy measurement was established.
- No Python suites rerun because changes are confined to TS, CLI and metadata/docs.

## Reproduce in an appropriate Node environment

```bash
npm run build
npm run test:phase224
node dist/examples/phase224-evidence-gap-demo.js > /tmp/phase224-synthetic-replay.json
node scripts/phase224-run.mjs --request 'I need football boots for AG pitches' \
 --registry docs/phase220/phase220-category-vocabulary.json \
 --state /tmp/pee224-football-state.json \
 --search-config docs/phase223/SEARXNG-SEARCH-CONFIG-EXAMPLE.json \
 --output /tmp/pee224-football.json
node scripts/phase224-run.mjs --request 'I need a recycling bin for paper and plastic' \
 --registry docs/phase220/phase220-category-vocabulary.json \
 --state /tmp/pee224-bins-state.json \
 --search-config docs/phase223/SEARXNG-SEARCH-CONFIG-EXAMPLE.json \
 --output /tmp/pee224-bins.json
```

`--state` is a private local JSON checkpoint, not a product evidence database. Do not mistake an example endpoint for a deployed search service. Real live discovery requires working DNS/network and a configured, functioning search index. This work neither asks the user to operate a computer nor claims to bypass the runtime networking block.

## Still missing, in priority order

1. A real, reachable search index and live authorized/public source reading test from **PEE itself**, not the ChatGPT web research channel.
2. A bounded transient **content-level** analysis of original reviewed test methods and quantitative results, with market/product variant anchoring and independent-source verification. JSON-LD cannot substitute for this.
3. A verified bridge to prior evidence/screening/ranking components (Phases95–112, 193–219); a declared specification may inform a candidate but must not become a verified independent measurement or override an incompatible surface/safety constraint.
4. Evaluation on legitimately accessible real pages for precision, recall, source-vs-model attribution and contradiction handling, including change detection and stale-data behaviour. No performance metrics can be claimed from fabricated pages.

## Technical references, separate from PEE web acquisition

- Schema.org [`Product`](https://schema.org/Product): `additionalProperty` and identity metadata.
- Schema.org [`additionalProperty`](https://schema.org/additionalProperty): property-value pairs with a generic product attribute.
- Schema.org [`PropertyValue`](https://schema.org/PropertyValue): `value`, `unitText`, `unitCode`, and `propertyID` semantics.
- [Google Search Central product structured-data documentation](https://developers.google.com/search/docs/appearance/structured-data/product-snippet): publisher-inserted Product/Review markup used for search features; markup is not an independently validated laboratory test.
- [SearXNG search API documentation](https://docs.searxng.org/dev/search_api.html): configurable search-index interface used by the existing Phase223 adapter, not deployed here.
- [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html): robots exclusion protocol implemented and assessed in upstream stages.

**Do not conflate:** External documentation was consulted by ChatGPT for the design/review. The PEE runtime did not retrieve those pages in Phase224.
