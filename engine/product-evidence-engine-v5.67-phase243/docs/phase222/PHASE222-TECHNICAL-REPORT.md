# Product Evidence Engine — Phase 222 (v5.46.0)

**Date:** 2026-10-13. **Predecessor:** complete `product-evidence-engine-v5.45-phase221-FULL.zip` (v5.45.0).

## User's corrected contract

The PEE is an independent research and recommendation assistant. It should read publicly accessible material to learn relevant facts, critically compare their quality and applicability, synthesize its **own** conclusions, and link to the original sources. It must **not store or republish articles, reviews or copied page bodies** in its outputs or evidence memory. Saving **URL, time, source identity, bounded structured product metadata and hashes** is not the same as storing copied articles. Transient data necessarily passes through RAM when read and analysed; this release does not promise that the OS instantaneously wipes all memory copies.

Publicly reachable HTTPS pages should not automatically be treated as requiring an individual written licence **merely to attempt a visit**. Keep robots, security, explicit access prohibitions, subscription restrictions, rate limits and other applicable constraints. Access/crawling is separate from copyright, contractual restrictions, substantial copying, republication, and commercial text/data mining. **Do not claim blanket legal authorization** for all websites or operations. In particular the UK statutory TDM exception expressly addresses **non-commercial** research, so it is not a universal commercial-use licence.

## Delivered working code

- `src/phase222_transient_public_page_observer.ts`: consumes real outputs of the Phase220/221 discovery worker, uses the **existing** SSRF-resistant Phase69 HTTPS transport (pinned public IPv4 DNS, HTTPS only, response byte cap, no redirects, timeouts), checks `/robots.txt` before page reads, and rejects explicit terms/robots prohibitions already recorded in the operator registry. A missing robots file with HTTP 404/410 may permit reading consistent with RFC 9309, while 401/403, 5xx, ambiguous parsing and unreachable robots are blocked. A separate small host/page budget limits visits.
- **Transient page examination:** bounded page HTML and JSON-LD are processed only in the local method; no HTML, article text, snippets or quotations are present in the serialized return. The output includes original URL, time, exact HTTP response byte SHA-256 when provable, publisher-declared `Product` name/brand/model/SKU and `Article`/`Review`/`NewsArticle` type/date **hypotheses**. Returns reason codes and explicit next tasks. Schema declarations do not prove product identity, commercial availability, independence, testing protocol, measurement or suitability.
- `scripts/phase222-run.mjs`: live-mode CLI orchestration `English request -> Phase220/221 URL discovery -> Phase222 public page observation`. Does not accept a fixture transport from CLI. The CLI saves the Phase220 URL/state checkpoint and structured Phase222 observations, **not page bodies**. No substantive ranking or scored recommendation.
- `tests/phase222_transient_public_page_observer.test.ts`: 15 synthetic offline tests, including end-to-end composition with Phase221 RSS, product and editorial JSON-LD, zero source-body persistence in outputs, unreviewed terms labelled as uncertainty, prohibited terms/login and inherited registry prohibitions blocked before I/O, robots disallow, RFC 9309 404/410 treatment, page/redirect/MIME handling, exact-byte custody, malicious cross-host rejection, bounded crawling, football and recycling-bin category distinction, and paraphrase invariance. All domain names, sources, product names, rights descriptions and fetched pages in these tests are **fictional**.

### Key change in access reasoning

Phase222 does **not demand** a per-site written licence before temporary examination of a previously discovered public page. Unknown website terms do not magically mean forbidden *or* licensed: the output marks `terms_not_reviewed_no_licence_claim`. Proven disallow/explicit restriction always takes precedence. This new Phase222 page-read policy is **not yet propagated to earlier Phase75/Phase221 sitemap/feed discovery policy**, which still requires an operator's affirmative rights review. The general web search/index source is still absent; extending the bounded public-read workflow into source discovery is therefore the next engineering task. Do **not** describe Phase222 as a universal search engine or full commercial content-mining authorization.

## Reproducible validation (actually executed)

Build: `npm run build` succeeded using the same environment-provided Node/TypeScript development setup as prior releases.

Focused: `npm run test:phase222` = **15 passed / 0 failed**. These 15 are included within the admitted regression total and must **not** be added to it.

Admitted cumulative TS regression: **3,959 passed / 0 failed** across 15 bounded groups, all 186 eligible test files, excluding the same historically inconclusive Phase91 and Phase92 suites. See `docs/phase222/PHASE222-REGRESSION-RESULTS.json` and test logs.

Real *software CLI* (not ChatGPT browsing):

```bash
npm run build
node scripts/phase222-run.mjs --request 'I need football boots for AG pitches' \
 --registry docs/phase220/phase220-category-vocabulary.json \
 --state /tmp/pee-football-222.json --output /tmp/pee-football-output-222.json
node scripts/phase222-run.mjs --request 'I need a recycling bin for paper and plastic' \
 --registry docs/phase220/phase220-category-vocabulary.json \
 --state /tmp/pee-bins-222.json --output /tmp/pee-bins-output-222.json
```

Both CLI runs finished with `awaiting_authorized_sources`, **0 network requests, 0 candidate URLs, 0 real product identities, 0 verified professional studies**. Source registry deliberately includes no real sources. Test-time fixture HTTP results, despite status 200, are **not** live page acquisitions. Separate runtime DNS check for `www.gov.uk` and `github.com` returned `EAI_AGAIN`, so an external page acquisition cannot be certified here. The user has only an iPhone; this release requires no action from them.

## What remains unbuilt

1. General autonomous web discovery/search index connector capable of searching beyond registered sitemap/RSS sources, evaluated against SearXNG/4get and the actual PEE operational constraints. This stage must not be replaced by ChatGPT's own web calls.
2. Align the legacy Phase75/221 discovery gates with the user's clarified public-access versus publication rights model. Do not weaken robots, known prohibitions, SSRF protection, or traffic budgets.
3. Use the existing Phase109/110/130 and Phase193–219 apparatus for **transient original-content reasoning** into independently reviewed structured claims, original-work and variant resolution, without persisting article text or licensing fabricated metrics. JSON-LD alone is never evidence.
4. Empirically test on real public, permitted websites from an environment with working DNS/HTTPS; audit parsing, variant matching, recall, source quality, error handling and ranking stability. No real research evidence or ranking exists in Phase222.
5. Keep separate platform restrictions, particularly where automated commercial use is restricted (e.g. review platforms). Public availability is not universal downstream permission.

## Primary references (technical/legal context, **not** URLs fetched by the PEE runtime)

- Robots Exclusion Protocol, RFC 9309: https://www.rfc-editor.org/rfc/rfc9309.html
- Google Search Central: How Googlebot accesses websites: https://developers.google.com/search/docs/crawling-indexing/googlebot
- Google Search Central: Robots.txt guide: https://developers.google.com/search/docs/crawling-indexing/robots/intro
- UK Intellectual Property Office, Exceptions to copyright: https://www.gov.uk/guidance/exceptions-to-copyright
- UK Copyright, Designs and Patents Act 1988, Section 29A (non-commercial computational analysis): https://www.legislation.gov.uk/ukpga/1988/48/section/29A
- Structured data vocabulary, schema.org `Product`: https://schema.org/Product
- Schema.org `Review`: https://schema.org/Review

## Integrity

The package includes the complete predecessor, original source-code reviews and cumulative research available in the predecessor. External GitHub/other source-code archive ZIPs remain separate user uploads, not secretly bundled as runtime dependencies. Phase222 adds no third-party libraries, installed LLM weights, remote API keys or external crawler.
