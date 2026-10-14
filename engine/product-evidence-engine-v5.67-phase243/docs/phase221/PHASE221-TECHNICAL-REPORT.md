# Product Evidence Engine — Phase 221 (v5.45.0): RSS/Atom execution + checkpoint permission integrity

**Date:** 2026-10-13  
**Predecessor:** user-uploaded complete `product-evidence-engine-v5.44-phase220-FULL.zip` (v5.44.0).  
**Run condition:** user can only work from iPhone; no expectation of a local/server runtime at this stage.  
**Verdict:** verified increment to the *source discovery worker*, **not** a complete autonomous product research or recommendation engine.

## Concrete result

Phase220 already executed one approved sitemap channel. Phase82 had RSS and Atom *planning* but no actual feed reader linked to the user-question CLI. Phase221 extends **the same worker**, via `src/phase221_authorized_feed_discovery.ts`, to attempt metadata-only reads of permitted RSS 2.0 and Atom 1.0 feeds. The module uses the pre-existing Phase69 HTTPS `SourceTransport`, robots decisions and Phase75 source permission predicate; it does not add a crawler, external dependency, self-hosted service, LLM or model weights.

**Actual runnable control flow** (for *operator-verified authorized* sources on a DNS/HTTPS-enabled machine):

```
English question -> Ph220 bounded category/essential constraint -> Ph82 source selection
 -> Ph75 shared permission gate -> Ph69 HTTPS /robots.txt
 -> robots decision for feed path -> Ph69 HTTPS declared /rss.xml or /atom.xml
 -> bounded source-host, path-scoped entry-link extraction + per-link robots check
 -> deduplicated unverified URL candidates + optional exact HTTP-body SHA-256
 -> Ph82 next check scheduling + Ph220 checkpoint -> NO rating or recommendation
```

`src/phase220_autonomous_discovery_worker.ts` now accepts `feedPath` for `rss` and `atom` sources and records `feedSha256` separately from `sitemapSha256`. It refuses DTD and entity declarations, unbounded feeds, malformed/unsupported feed formats, dangerous URLs, other-host links, prohibited robots paths, bad MIME, redirects and sources with missing/expired declared rights. No article body is retained or passed to the evidence ranking machinery. This is a bounded parser for metadata *leads*, not a standards-complete XML library or a scientific document reader. Feed descriptions, identity, dates and testing methods are **not validated** by this parser.

`src/phase75_source_discovery.ts` extracts the existing Phase75 metadata permission predicate into `approvedMetadataDiscovery75`, reused by both sitemap and feed routines. No permission threshold was relaxed.

**Additional integrity fix:** Phase220 previously reloaded full watch metadata, including `rightsClearedForMetadata`, from the editable checkpoint. Phase221 restricts checkpoint reuse to timing/error counters, while current authority/host/category/mechanism/tier come from the operator source registry. An old checkpoint therefore cannot restore permission revoked in the registry. Observation cache reuse is now source mechanism + discovery-path scoped and rechecks the full current metadata permission predicate, not only part of it. For both errors and success, repeat reads respect Ph82 `nextCheckAt` rather than forcing a new fetch after 24 hours. Existing cached URL leads remain bounded to 24h (not a scientific evidence freshness claim).

## Verification performed **on software**

- TypeScript build with Node v22 / globally available TypeScript and an environment-supplied development-only `@types/node` symlink: **passed**. Temporary symlink deliberately excluded from archive.
- New / adjacent offline targeted suite: **22/22 passed**, including RSS and Atom, permitted and forbidden paths, robot/rights denials before metadata fetch, exclusion of external URLs, DTD/malformed/oversize rejection, digest round-trip validation, replay with no extra network calls, feed-path change, revoked checkpoint authority and unchanged deterministic buyer intent. All HTTP fixture payloads and rights are deliberately **synthetic**.
- Fresh admitted TypeScript regression run: **3,944 passed, 0 failed, 15 groups**, 185 test files. See `PHASE221-REGRESSION-RESULTS.json` and the actual TAP outputs in `test-logs/`. Historical phase91 and phase92 suites remain excluded, as inherited and documented. The 22 focused tests are a subset of the 3,944 and MUST NOT be added to that total.
- Actual compiled CLI with normal English requests for **football boots (AG)** and **recycling bins (paper + plastic)**: both returned `awaiting_authorized_sources`, **0 HTTP calls, 0 products**. See `PHASE221-FOOTBALL-CLI.log`, `PHASE221-BINS-CLI.log`. Registry intentionally contains no independently licensed and reviewed live source.
- **No network-capable PEE run; no real site, publication, product, review, model variant, original test, ranking, Trustpilot review, or video was acquired.** DNS failure was reported in the inherited Phase220 logs, not freshly reverified in this Phase221 run. An HTTP transport *fixture* returning 200 is not proof that the software accessed the external web.

### Commands to reproduce in a Node environment

```bash
npm install                 # development dependencies, only if needed by that environment
npm run build
npm run test:phase221
node scripts/phase220-run.mjs --request 'I need football boots for AG pitches' \
  --registry docs/phase220/phase220-category-vocabulary.json \
  --state /tmp/pee-football.json --output /tmp/pee-football-run.json
node scripts/phase220-run.mjs --request 'I need a recycling bin for paper and plastic' \
  --registry docs/phase220/phase220-category-vocabulary.json \
  --state /tmp/pee-bins.json --output /tmp/pee-bins-run.json
```

The CLI remains live-mode only, without fixture transport injection. It will not call any website until a genuine qualified source registry is provided. Never copy synthetic permission IDs from the tests and use them as real licence evidence.

## Remaining priority gaps

1. **Live networking & genuine rights-cleared source**: requires a runnable PEE host with DNS/HTTPS and independently verified permission record/robots/terms. The user's iPhone-only workflow permits continued source review, coding and fixture testing, but cannot demonstrate a live PEE fetch from this isolated runtime.
2. **General search source/index**: RSS/Atom and approved sitemaps discover only registered sources, not the full web. SearXNG remains a replaceable candidate search gateway, with 4get as comparison; both need legitimate live evaluation. Uploaded source-code reviews are preserved at `external-source-code-reviews/`. The four original third-party source ZIPs are not copied into this PEE release; their actual uploaded checksums are recorded in `UPLOADED-SOURCE-ARCHIVE-SHA256.txt`.
3. **URL lead -> product, exact variant, edition, market and original publication identity**, via Ph69 quarantine and Ph193–219 screening. RSS entries are not evidence, even when a publisher labels an article a test.
4. **Persistent lawful evidence memory, sufficiency and stop policy**: an RSS feed checksum or 24h URL cache is neither independent scientific evidence nor a reason to recommend a product. Preserve Ph78/79, Ph112, Ph193 constraints.
5. **RSS/Atom format coverage**: the current parser deliberately handles only limited RSS 2.0 and Atom 1.0 link patterns. Before production, benchmark on an authorized, representative feed corpus; verify edge cases such as namespaces, URL XML escaping, genuine redirects, HTTP caching, publication versioning and parser correctness. Fail closed when unsupported. Do not claim general RSS/Atom conformance from synthetic tests.

## Technical source documentation (context, not PEE live acquisitions)

- RSS specification: https://www.rssboard.org/rss-specification
- Atom Syndication Format, RFC 4287: https://www.rfc-editor.org/rfc/rfc4287
- Robots Exclusion Protocol, RFC 9309: https://www.rfc-editor.org/rfc/rfc9309
- SearXNG source: https://github.com/searxng/searxng
- Crawlee source: https://github.com/apify/crawlee
- YaCy source: https://github.com/yacy/yacy_search_server
- 4get source: https://git.lolcat.ca/lolcat/4get

These links support reference and later research. The new code does not imply permission to mine any of these services or the underlying sites. Product coverage and live recall remain unmeasured.
