# Phase244 — live browsing made to work (research-only)

Phase243 ended with "PEE live browsing remains unverified". Phase244 ran the existing live path
(`scripts/phase222-run.mjs`, `scripts/phase228-run.mjs`) against real public websites from a
cloud container whose only egress is an HTTPS proxy, and fixed every generic defect that stopped it.
No new dependencies, no site- or brand-specific rules, no ranking.

## Defects found on real sites and what changed

| # | Where | Defect seen live | Change |
|---|---|---|---|
| 1 | `approved_web_reader.ts` | Pinned `lookup` answered `(address, family)` while Node >= 20 asks with `{all:true}`; every request failed with `ERR_INVALID_IP_ADDRESS` before connecting. | Answer in the form requested. |
| 2 | `approved_web_reader.ts` | `HTTPS_PROXY` ignored; proxy-only networks unreachable. | HTTP CONNECT tunnel when `HTTPS_PROXY` is set (honours `NO_PROXY`); TLS end-to-end with origin SNI/certificate checks; HTTPS-only, no redirects, byte cap, identity encoding unchanged. **Private-IP pinning cannot be enforced through a proxy** (documented in code). |
| 3 | `approved_web_reader.ts` | `Accept: text/plain` first: a Shopify store answered 404 (agent-only variant). | Browser-like `text/html` first; robots.txt is still served as `text/plain`. |
| 4 | `approved_web_reader.ts` | Transport max 12MB while Phase228 asks 40MB for PDFs: every live PDF read failed with `Invalid byte cap`. | Max 40MB (callers still pass their own smaller caps). |
| 5 | `robotsDecision` | `Disallow: */path` (leading `*`, used by most large sites) made the whole file `unknown`; `$` end anchor was escaped into a literal. | Leading `*` accepted; `$` anchors the end; other non-path values still fail closed. |
| 6 | `publicRobotsDecision223` | Empty / comment-only robots.txt treated as `unknown`. | No group at all = no restriction (RFC 9309 2.2.1). Unreachable/5xx robots still block. |
| 7 | Phase75 sitemap parser | `<image:loc>` counted as pages, 3,019 "URLs" > 1,000 limit, source blocked. | Only `<loc>` in the root element's namespace; limits follow sitemaps.org (50,000 URLs), byte cap 10MB (was 800KB, real sitemaps were 1.3–3.8MB). |
| 8 | Phase75 | Sitemap indexes (Shopify, Yoast) yielded only `.xml` URLs. | One level of index followed: same host, robots-checked, max 5 children, scope-matching children first. |
| 9 | Phase75 | Configured `/sitemap.xml` missing (404) on a manufacturer site. | Fall back to same-host `Sitemap:` lines in robots.txt (max 3); reason `sitemap_from_robots_declaration`. |
| 10 | Phase75/220/221 | First N URLs in publisher order kept, then sorted alphabetically: socks and snowshoes visited for "hiking boots". | Visit order by overlap between URL path words and category/need terms, deeper (item) pages first on ties, then publisher order. Not relevance proof, not ranking. |
| 11 | Phase222/224–226/241 | 850KB page cap; retail product pages were 1.4–1.6MB. | Shared `PAGE_MAX_BYTES` = 3MB. |
| 12 | Phase222/224 | Only the first 35 `<script>` tags were inspected; JSON-LD on retail pages sat at positions 36–66 and was ignored. | Filter JSON-LD blocks first, then bound to 35. |
| 13 | Phase222/241 | `ProductGroup` (product with size/colour variants) not recognised. | One product lead per group (`productGroupID` as identifier); offer price as a value or min–max range across variants. |
| 14 | Phase241 → Phase222 | Phase241 property extraction existed but was not wired into live observation, and did not read comparison tables. | `comparisonMatrixFacts241` (strict shapes: products as columns with empty corner cell, or products as rows under a short key heading with >=1/3 quantitative columns; no spans; opinions dropped); currency prices and lb/oz weights normalised. Facts appear in each receipt as `productFacts241`. |

All facts remain `unverified_source_declaration`, `rankingAuthorized:false`, `scientificTestEvidence:false`;
no page body, sentence or quotation is stored.

## Live results (2026-10-14, egress through an HTTPS proxy)

Registry: `PHASE244-TEST-ONLY-LIVE-REGISTRY.json` — **test-only**, `public_metadata` access, basis
`unknown`, no rights document. Outputs: `live-runs/`.

| Request | Site | Discovery | Pages read | Extracted |
|---|---|---|---|---|
| waterproof hiking boots | switchbacktravel.com (editorial, Drupal) | 780KB sitemap, 20 in-scope leads, boot reviews first | 2/2 byte-exact | 18 + 20 comparison facts (price USD, weight g, type, waterproofing, upper, midsole) for 7 models |
| football boots, firm ground | prodirectsport.com (Shopify) | sitemap index, 5 children with query strings, 20 FG boot leads | 2/2 byte-exact (1.4MB) | product lead (name, brand, group id) + offer price GBP |
| recycling bins, paper & plastic | brabantia.com (Magento) | `/sitemap.xml` 404 → robots-declared 3.3MB sitemap, 20 leads, item pages first | 2/2 byte-exact | none: the site declares no `Product` metadata and no tables (site limitation; no site-specific scraping added) |

Phase228 documents: a real public PDF was downloaded through the proxy, hashed and parsed
(`needs_review`, 0 product claims as expected for a non-product document).

Observed environment/site restrictions: all egress via proxy (direct TLS is intercepted by a
re-signing gateway); `mizunoeurope.com` TLS alert; `joseph-joseph.com` connection reset; Brabantia
HTTP 429 after repeated requests (transient, handled as a rejected page).

## Tests

`npm run test:phase244` — 10 fixture tests for the changes above. Full TS corpus: 4,261/4,261 pass
(212 files). The CONNECT proxy path is verified live, not by a fixture test.

## Not done / next

- Pages whose specifications are only in site-specific markup (Brabantia) yield no facts.
- A link-only table row ("Women's" → link to the women's model) is kept as a short text value; harmless but noise.
- Comparison-matrix product names are publisher text, not verified identities; variant resolution
  and cross-source identity matching remain separate, unverified steps.
- robots.txt is re-read for every page; per-host caching would reduce requests.
- No real rights review exists for any live source; the shipped registry still has no approved sources.
