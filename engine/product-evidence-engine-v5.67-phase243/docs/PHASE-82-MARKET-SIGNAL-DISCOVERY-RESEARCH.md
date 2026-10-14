# Phase 82 — Market Signals, Newly Introduced Models & Low-Cost Discovery
**Product Evidence Engine — 10 October 2026**  
**Status:** scheduler and signal triage implemented and tested with constructed metadata; no live publisher feeds polled, no publisher permissions newly established, no category recall or detection lead time measured.

## Architecture decision

Monitor **changes and new information** before reading individual product pages. The source-specific RSS/Atom feed, WebSub (where supported), manufacturer newsroom, permitted product-index sitemap, original independent-test feed and expert-community signal feed each have distinct evidential roles. A product mention is a discovery lead, **not** an independently appraised evaluation, proof of product identity or release, or proof that manufacture has ended.

This new module is upstream of `phase81_new_model_intake.ts`, `phase80_population_portfolio.ts`, `phase81_competition_gate.ts`, and category cold-start. It plans which sources to check under a fixed cost budget, updates the next permitted check time, and turns prequalified metadata signals into **tasks**. It deliberately does not perform network access, and requires the older rights-checked transport for every real fetch.

### What the public guidance actually supports

1. Google documents XML sitemaps and RSS/Atom feeds as URL discovery aids; reliable `lastmod` should describe meaningful page changes. These are hints, not definitive evidence of a product release. https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
2. HTTP conditional requests (`If-None-Match` / ETag) reduce the transfer overhead when a feed or index has not changed, provided the origin supports validators: RFC 9110. https://www.rfc-editor.org/rfc/rfc9110.html
3. WebSub supports push notification **only when a publisher and hub support it**, not for arbitrary websites. https://www.w3.org/TR/websub/
4. Scrapy's AutoThrottle adjusts crawl delays to response latency/load and respects host limits. If operational scraping is deployed, protect each host with permissions, rate limits, backoff and anomaly checks. https://docs.scrapy.org/en/master/topics/autothrottle.html
5. `robots.txt` is governed by RFC 9309, but **is not a legal licence** for commercial content reuse. https://www.rfc-editor.org/rfc/rfc9309.html
6. Google recommends verifiable GTIN, MPN and brand identifiers to distinguish exact models; GS1 rules distinguish a new model from modifications or packaging differences. https://developers.google.com/search/blog/2021/02/product-information ; https://www.gs1.org/1/gtinrules/en/
7. Reddit's own business guidance recommends product pages, press releases, release notes and product announcements for detecting competitive changes. This is practitioner guidance rather than evaluation of discovery precision. https://www.business.reddit.com/learning-hub/articles/monitoring-competitor-trends

### Practitioner community discussions (anecdotal, not controlled evidence)

- RSS/sitemaps sometimes fail; programmers discuss supplementing them with constrained source-specific monitors: https://www.reddit.com/r/webscraping/comments/1kn0n6w/
- Site changes and silently degraded extractor quality need alerting and validation: https://www.reddit.com/r/webscraping/comments/1p3xi6d/ ; https://www.reddit.com/r/webscraping/comments/1ser5eo/
- E-commerce practitioners report wanting relevant-change digests rather than monitoring all updates: https://www.reddit.com/r/ecommerce/comments/1oo5yz3/

## Recommended discovery channels and interpretation

| Event | Initial action | Never infer |
| --- | --- | --- |
| Manufacturer announces named model | Confirm identity and specifications; create inexpensive candidate stub | Superior performance; independent recommendation |
| Manufacturer publishes new catalog page | Confirm whether it is a genuinely new model/variant | Release date, novelty, or manufacturing status from URL alone |
| Independent lab publishes original testing | Discover and qualify provenance, methods, rights and findings | That the product automatically outranks current leaders |
| Trade publication reports a launch | Find manufacturer origin, determine whether syndicated news | That several reposts are several confirmations |
| Exhibition showcase / launch calendar | Verify manufacturer announcement; schedule a future check | That a presented prototype is commercially released |
| Forum detects obscure brand/model | Keep exploratory stub; verify identity independently | That popularity on a forum equals performance |
| Retailer adds model | Verify manufacturer identity, do not track stock | New manufacturing lifecycle or release solely from listing |
| Apparent discontinuation announcement | Refer to phase-81 original manufacturer notice review | Permanent retirement on a snippet or retailer availability |

**Explicit exclusion:** no `in_stock`, `sold_out`, or merchant inventory status enters the manufacturing lifecycle state. Once manufacturer discontinuation is verified and persisted, archive the product page and keep it out of all current-product competitions; a later catalog mention must not reverse the tombstone.

## Monitoring policy

- **Core sources**: manufacturer newsrooms, original professional test feeds, limited catalog-change endpoints. Example initial cadence: 24 hours.
- **Secondary sources**: trade press and industry events. Example initial cadence: 72 hours.
- **Exploration sources**: specialist communities and smaller makers. Example initial cadence: 168 hours.
- Double the interval after unchanged polls up to a capped maximum; reset on verified relevant changes. Slower after errors and especially `429` rate-limiting. Adjust cadence through **measured yield**, not assumed fixed optimum.
- Use ETag/Last-Modified and `304` when available, maintain cursor/entry IDs and hashes and deduplicate by *original publisher work*, not URLs. Confirm upstream provenance and rights before treating matches as known originals.
- Preserve a small monitoring budget for emerging brands so dominant manufacturers do not crowd out new entrants. Avoid making an external brand-list ranking a product performance score.
- **Discovery cost budget is distinct from full evidence extraction budget**; discovered candidates can stay as lightweight entries until phase-80 population priority elects to enrich them.

## Acceptance criteria for production pilot

Measure verified unique model detections per hundred permitted metadata requests, median detection lag relative to a publisher's dated source, mistaken "new model" matches, missed launches found by random manual audit, republished-press-release false independence, number of category gaps, rights-review failures, latency, source error and throttling rates, and the fraction of niche models captured in exploration. Ensure each sample has an identifiable original dated record; results here are not actual metrics.

## Current implementation

- `src/phase82_market_watch.ts`: `planMarketWatch`, `nextMarketWatch`, `triageMarketSignals`.
- `tests/phase82_market_watch.test.ts`: deterministic checks for due/blocked sources, source-host budget, exploration reserve, idle backoff, 429 backoff, announcement/specification versus independent-test routing, deduplication, unknown categories and discontinuation archiving.
- **Not implemented:** live feed adapter, conditional HTTP fetch integration, licensed source enrolment and persisted scheduler, measured detection recall, real-time monitoring/notifications, or automatic promotion to published rankings.

In particular: successfully planning a feed check does not prove that the feed exists, that it has changed, or that its contents are licensed for the requested reuse.
