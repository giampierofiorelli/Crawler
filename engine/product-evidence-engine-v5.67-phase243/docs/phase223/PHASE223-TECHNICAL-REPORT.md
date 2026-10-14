# Product Evidence Engine — Phase 223 (v5.47.0)

**Date:** 2026-10-13. **Canonical predecessor:** full `product-evidence-engine-v5.46-phase222-FULL.zip` (v5.46.0). **Status:** executable offline-tested incremental advance. **Not a verified live autonomous web-research product.**

## What changed

1. **Replaceable general search discovery:** `src/phase223_search_discovery.ts` accepts a *configured*, operator-reviewed HTTPS SearXNG `/search` service with JSON output. `searchCandidateUrls223` converts a canonical Phase220 English need and essential slots to at most three bounded, deterministic queries, checks the index service's `robots.txt`, sends real HTTPS GETs through the pre-existing SSRF-resistant Phase69 transport, and safely extracts candidate HTTPS URLs only. It removes tracking parameters, deduplicates, rejects credentials, invalid/unsafe IP hosts, non-HTTPS and nonstandard ports. It does not store SearXNG result titles, snippets or response JSON. Digest custody is asserted only for byte-exact responses. This is an **adapter** to a search index, not an implemented independent full-web search index and not a preconfigured working SearXNG deployment.
2. **Search-to-page bridge:** `inspectSearchLeads223` reuses Phase222 transient reading of source pages, dynamically constructing bounded, source-host-specific discovery scope. Page bodies remain in transient process memory only. No publisher declarations are promoted to verified independent tests, rankings, or suitability. Exact-variant matching still needs substantive verification. An explicit prohibition recorded for a host now blocks any Phase222 lead for that host, regardless of the lead's source identifier. Search results are discovery leads only.
3. **Public-metadata discovery access:** `src/phase223_public_metadata_access.ts` and changes to `src/phase75_source_discovery.ts`, `src/phase221_authorized_feed_discovery.ts`, `src/phase220_autonomous_discovery_worker.ts` introduce explicit per-source `discoveryAccess:'public_metadata'`, distinct from the legacy rights-qualified metadata mode. With an enabled Phase82 watch and a registry source policy identifying the exact host, it permits a bounded attempt to read publicly available sitemap/feed *metadata* **without inventing an individually negotiated copyright licence**. An existing explicit prohibition of website terms, robots, or refused rights remains blocking. This access mode does not permit mass content mining, archival copies, remote AI content transfer, reproduction or scientific evidence admission. The legacy rights-qualified path remains the default and its tests remain intact.
4. **Robots semantics:** Public-metadata mode applies a limited RFC 9309-consistent treatment for robots 404/410 and for no matching user-agent group. It refuses 401/403, 5xx, network failures, redirect, malformed body and ambiguous matching group. This is an intentional conservative implementation, not a complete formal robots parser. Phase222 page observation keeps its prior conservative policy, except explicit host-wide prohibitions; full standardization remains to do.
5. **Production CLI:** `scripts/phase223-run.mjs` combines Phase220 source discovery, Phase222 transient observation and optional Phase223 search + transient observation. It has **no fixture-transport option**. The search endpoint is supplied separately through a JSON file, deliberately disabled in the example. No new Node packages, external model weights or crawler frameworks were installed.

## Tested interfaces and invocation

```bash
npm run build
npm run test:phase223
node scripts/phase223-run.mjs \
 --request 'I need football boots for AG pitches' \
 --registry docs/phase220/phase220-category-vocabulary.json \
 --state /tmp/pee-223-football-state.json \
 --search-config docs/phase223/SEARXNG-SEARCH-CONFIG-EXAMPLE.json \
 --output /tmp/pee-223-football-result.json
node scripts/phase223-run.mjs \
 --request 'I need a recycling bin for paper and plastic' \
 --registry docs/phase220/phase220-category-vocabulary.json \
 --state /tmp/pee-223-bins-state.json \
 --search-config docs/phase223/SEARXNG-SEARCH-CONFIG-EXAMPLE.json \
 --output /tmp/pee-223-bins-result.json
```

For an eventual live trial, configure an operator-controlled SearXNG HTTPS endpoint, enable `format=json` in SearXNG, check the specific search-service access policy, and set `enabled` and `serviceAccessReviewed` only once those checks have actually been performed. The sample `search.example.org` value is **not a deployable endpoint**. An HTTP `localhost` endpoint is deliberately rejected by the Phase69 external network transport; use a separate strictly isolated IPC bridge if a future deployment requires a local SearXNG instance. **None of this requires the user to run anything on an iPhone now.**

## Actual verification

- **TypeScript build:** passed (`npm run build`). Type declarations for Node from an environment-provided installed package were linked locally for development; they were **not bundled** into the release.
- **Focused Phase223 tests:** **14 passed**, all synthetic transport cases, `tests/phase223_search_and_public_metadata.test.ts`. They cover intent paraphrase equivalence; no-category/slot prompts; safe URL filtering; deduplication; no snippets retained; disabled/unauthorized service; denied robots; 403 JSON; malformed responses; live/fixture separation; search-to-Phase222 bridge; football footwear and recycling bins; legacy source restriction precedence; public RSS and sitemap; no matching robots group; 404/410 vs 403/5xx; and host-wide blocks.
- **Cumulative admitted TypeScript regressions:** **3,973 passed / 0 failed** across **15 groups** and **187 eligible test files**. All 14 focused tests are *included* within this total, not additive. Historical Phase91/92 tests were excluded, as inherited and documented. See `PHASE223-REGRESSION-RESULTS.json` and `test-logs/`.
- **Real software CLI tests:** Both natural-language cases ran in **live mode**, but the default source registry has no source hosts and the example search configuration is disabled: **0 external HTTP calls**, **0 discovered URLs**, **0 verified products**. See `PHASE223-CLI-RESULTS.json`. This is a correct insufficiency outcome, not an online research result.
- **Network environment:** DNS lookup of `github.com` and `www.gov.uk` returned `EAI_AGAIN`. No live SearXNG server, news site or product page was fetched by the PEE runtime; **no live accuracy, coverage, source quality or ranking performance is claimed**.
- No Python suites were rerun in Phase223; code changes are to TypeScript and the CLI. The predecessor's existing Python-test results remain historical, not newly verified.

## Known limitations and next engineering priorities

1. A **real HTTPS SearXNG service** and working DNS/network are required to demonstrate independent web discovery. Connection to an operator-controlled *local* instance would need a separate narrow-scope trusted channel; opening local/private IPs in the generic Phase69 web reader is not acceptable.
2. Search results depend on SearXNG's external engine availability, anti-bot rules, API settings and result coverage. This connector does not prove superiority to 4get, YaCy or another engine. Do not assume search-service access grants access to each result page.
3. Search-result relevance and exact variant matching are currently unverified. A next iteration should perform transient full content analysis with original-work lineage, publisher methodology, trustworthy factual extraction, independent-source agreement and matching to the actual user goal, reusing Phase109/110/130, 193–219; do not infer technical scores from ratings or marketing claims.
4. Source registry operation still requires explicit enabling and a minimal host policy record even in public metadata mode (its rights fields may remain unknown). Watch enabled state is **not** a new copyright licence. Known denied rights always prevail; documented legacy controls are not discarded.
5. The general search connector stores query URLs for auditing. It does not store search snippets/article bodies, but query URLs reveal the search terms; deployment should protect the resulting state files and logs. Review personally sensitive inputs separately.
6. Existing Phase69 transport remains IPv4-only, HTTPS-only and refuses redirects. Some real providers will require additional safely designed allowances; no blanket network bypass has been introduced.

## Primary technical sources

- SearXNG official API docs, GET `/search`, `q`, `format=json`, disabled-format 403: https://docs.searxng.org/dev/search_api.html
- SearXNG repository (previously provided by the user for source review): https://github.com/searxng/searxng
- RFC 9309, Robots Exclusion Protocol: https://www.rfc-editor.org/rfc/rfc9309.html
- Google Search Central robots.txt documentation: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- Node.js HTTPS documentation: https://nodejs.org/api/https.html
- Crawl library studied separately (not installed): https://github.com/apify/crawlee

**Source boundary:** URLs above are design/reference sources researched outside the PEE runtime. Phase223 did **not** fetch them itself and did not establish legal clearance of an actual public SearXNG instance.
