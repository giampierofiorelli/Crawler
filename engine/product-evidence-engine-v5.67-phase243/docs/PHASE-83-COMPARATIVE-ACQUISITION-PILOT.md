# Phase 83 — Build in-house versus Crawl4AI: measurement pilot

**10 October 2026 | Baseline Product Evidence Engine v4.10, Phase 82.**

**Decision status: PENDING.** No third-party AI crawler has been installed or made a production dependency. No changes were made to existing TypeScript product/evidence/ranking source modules. Version 4.11 is an **evaluation package**, not proof of a complete operational acquisition service.

## The decision we are testing

Build and retain our own orchestrator and product-evidence logic. For the mechanical job of retrieving structured content, compare:

- **A, internal lightweight prototype:** standard HTTP for static pages, Playwright Chromium for pages that demonstrably need JavaScript, a deterministic parser for stable structures. This pilot is implemented in **Python as an independent experimental harness**, not yet merged into the TypeScript production reader.
- **B, optional Crawl4AI:** self-hosted open-source framework in a separate evaluation process. No paid search/scraping API or service is required by the proposed experiment. If unavailable, **do not invent a benchmark score**.

The same HTML-to-facts parser is applied to both outputs to isolate **retrieval quality**. This is *not* a comparison of Crawl4AI's full agentic extraction versus a mature custom extractor. That requires a distinct study and a common local language model.

## What we actually executed

Six **constructed local HTML fixtures**, never public website pages, test mechanisms relevant to the Product Evidence Engine:

| Fixture | Intended failure mode | What the harness can establish |
|---|---|---|
| `launch.html` | Manufacturer specs mixed with unverified performance marketing | Retrieve and parse explicit technical data; no automatic marketing-to-test conversion |
| `lab.html` | Methods, variants and lab units | Keep source's original-test ID, measure/unit and method distinct |
| `lifecycle.html` | Permanently discontinued versus retailer out-of-stock | Preserve manufacturing-status distinction |
| `variants.html` | Multiple variants and closely named models | Preserve separate variant IDs |
| `editorial.html` | Narrative professional judgement and injection attempt | Prevent an unstructured claim from silently becoming a measured result; **not a test of semantic extraction** |
| `catalogue.html` | JavaScript-only products and load-more pagination | Needs real browser navigation; a separate in-memory DOM renderer diagnostic verifies JavaScript behavior only |

**Results, executed in this session** (`audit/phase83/offline-local-benchmark.json`):

- HTTP/static internal prototype: **5 of 5 static fixtures fetched**, 12 of 12 deliberately structured facts recovered, 0 extra facts. Four of these fixtures contained structured facts; the narrative fixture intentionally yielded none. **This is a simple controlled test on attributes designed to be machine-readable, not evidence of real-site accuracy.**
- JavaScript-only catalogue **not verified by browser navigation**. Chromium executable was available, but `Page.goto` failed with `net::ERR_BLOCKED_BY_ADMINISTRATOR`, including when connecting to the local fixture server. The dynamic page worked in a **separate** `page.set_content` JavaScript rendering diagnostic (four DOM cards), which does not test page acquisition and is not counted as browser success.
- **Crawl4AI NOT RUN**: its Python package is not installed in this environment; container internet/DNS is unavailable. No comparative latency, resource, precision or recall conclusion is warranted.
- Simple local conditional HTTP request test returned **304** for an unchanged fixture using `ETag`, without retransmitting the body. This tests a possible mechanism for low-cost monitoring, not real publisher behavior.
- **10 new Python tests passed**, **577 existing JavaScript/TypeScript tests passed**, **47 existing primary-source Python tests passed**, **21 ingestion Python tests passed**, **4 launch and 3 release tests passed**. Existing TypeScript build compiled successfully by pointing a local development-only symlink to `@types/node` already installed globally; it is *not bundled* into the release.

All cases were evaluated on synthetic local files with no login, no scraping of sites, no externally hosted model, no commercial API calls and no commercial source-rights determination. A single fast local run is not a stable performance measurement.

## Repeat the experiment

```bash
# From repository root; Python >=3.11 and beautifulsoup4 for the evaluation harness
python -m unittest discover -s evaluation/phase83 -t . -p 'test_*.py'

# Lightweight prototype; for dynamic JS, install Playwright and its compatible Chromium.
python evaluation/phase83/benchmark.py --arm inhouse --output audit/phase83/local-repeat.json

# Optionally test Crawl4AI in a SEPARATE disposable environment, following its pinned official installation.
# No change to package.json production dependencies is necessary.
python evaluation/phase83/benchmark.py --arm both --output audit/phase83/local-ab.json
```

**Environment:** Chromium 120+ with compatible Playwright browser binary; the benchmark's `--chromium PATH` is for local experimental overrides only. Playwright cautions against arbitrary browser executable paths. The ordinary app transport is intentionally HTTPS-only with DNS/IP/robot/rights checks; **do not reuse the local test server's HTTP exception in production**.

The optional Crawl4AI adapter uses `AsyncWebCrawler`, `BrowserConfig`, `CrawlerRunConfig`, and cache bypass, with the same local fixture URLs. If local JS handling requires different `wait_for`/`js_code` values, document and lock the configuration **before** measuring. No LLM is enabled in either arm. When the second arm is absent or any case is blocked, `comparison_valid` is `false`.

## The missing real-world study

Before any recommendation to integrate B, run both systems, pinned to known software/browser versions, on **the same legally approved public pages and with the same access constraints**, covering:

1. Official new product announcements and manufacturer specifications.
2. Original laboratory pages with measurement details and methods.
3. Narrative expert reviews, assessed by blind human raters (the current deterministic parser cannot interpret them).
4. JavaScript-rendered product indexes, pagination and variant pages.
5. Official end-of-production notices and ambiguous stock messages.
6. Source change detection, deduplication and fresh product discovery across a category.

Track separately: correct product/variant identities, source coverage and original-test lineage, recall/precision of grounded fields, missing/equivocal evidence, rejected sources, false discontinuations, request counts/bytes, memory/CPU, duration, and **time spent integrating and repairing site changes**. Record false positives with higher severity for manufacturing-retirement and fabricated test data. Use a common local model only if semantic extraction itself is being compared, not for the retrieval-only subtest.

Do not use the number of models in the database as a proxy for market coverage. Continue existing criteria for rational population priorities, narrow-filter search, evidence sufficiency and product exclusion.

## Acceptance decision

- **Do not integrate any full framework now.** There is no A/B evidence from this environment to justify it.
- Continue to treat a *thin in-house acquisition adapter* as the preferred, reversible working hypothesis because the project's custom reasoning, existing TypeScript architecture and zero required commercial API costs remain priorities.
- Accept B only if controlled real-page tests establish clear net benefits in completeness, reliability and maintained engineering effort **without sacrificing** rights, traceability, security or lifecycle rules; include its runtime and maintenance costs in the comparison.
- Do not assert A is better; the internal renderer and the framework still need a genuine equal-footing execution.

## Original technical documentation

- Crawl4AI `AsyncWebCrawler`: https://docs.crawl4ai.com/api/async-webcrawler/
- Crawl4AI quick start: https://docs.crawl4ai.com/core/quickstart/
- Crawl4AI non-LLM extraction: https://docs.crawl4ai.com/extraction/no-llm-strategies/
- Playwright Python installation: https://playwright.dev/python/docs/library
- Playwright browser compatibility and executable-path caveat: https://playwright.dev/python/docs/api/class-browsertype
- HTTP validators: https://www.rfc-editor.org/rfc/rfc9110.html
- Earlier decision research: `PRODUCT-EVIDENCE-ENGINE-DECISIONE-BUILD-VS-FRAMEWORK-2026-10-10.md`, supplied separately in the project history.
