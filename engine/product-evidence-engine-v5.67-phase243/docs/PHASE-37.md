# Phase 37 — UK commercial-source audit (10 October 2026)

## Decision
**Amazon is a mandatory coverage objective, not a cleared integration.** Keepa is the first historical-data candidate; Awin is the first multi-retailer-feed candidate. Google Merchant Center pricing reports are **not** a legal basis for a public comparison engine. Do not ingest, store, chart, or publicly display provider data until provider-specific rights are verified in writing.

## Source-by-source verified capabilities and constraints

| Provider | Official evidence | Technical capability | Critical commercial / rights blocker | Gate |
|---|---|---|---|---|
| Amazon UK Creators API | https://affiliate-program.amazon.co.uk/help/operating/policies/ | Current price and availability for eligible affiliates | Product Advertising Content generally has 24-hour caching limit; app's principal purpose and linkage restrictions may conflict with a neutral multi-merchant comparison site; no implied indefinite historical retention | Legal review of exact UX + written clearance; valid account/API access |
| Keepa API | https://keepa.com/api-docs/ and https://keepa.com/api-docs/plans-tokens.html | Amazon marketplace price histories, offers, sellers, tracking; `/product` typically 1 token per ASIN; optional offer pages add tokens | Public API documentation does **not** by itself grant rights to redistribute historical charts or derived values in a consumer app; offer data can be stale/gappy | Written permission for public history and derived analytics, API plan, sample ASINs |
| Awin | https://help.awin.com/developers/docs/product-feed-publisher-guide-intro | Product feeds designed for price-comparison publishers | Accessible feeds depend on publisher and advertiser agreements; fields and completeness vary; historical retention needs permission | Publisher credentials, program approvals, actual UK feeds, rights for snapshots |
| Google Merchant API | https://support.google.com/merchants/answer/13798101?hl=en-GB | Price competitiveness insights for eligible merchants | Google expressly forbids public display, resale and aggregation of Pricing reports across businesses | **Do not use** for public comparison; investigate merchant-direct feeds instead |

## Important nuance
The Awin interface may offer an advertiser feed in a *Google Shopping format*. This is a feed format supplied by a retailer; it is **not** permission to retrieve Google Shopping search results or Merchant Center's restricted competitive pricing reports.

## Questions to send to vendors (copyable)
1. May we show current product prices, total delivered prices, merchant names and direct purchase links in a neutral, multi-retailer consumer comparison service?
2. May we store daily or hourly historical prices for 12–24 months, display charts, and publish derived percentiles/medians and buy/wait context?
3. May we combine your data with Amazon/other retailers in the same comparison and rank offers without commercial preference?
4. What attribution, branding, affiliate-link, refresh, cache, timestamp and deletion rules apply? Do they differ for web vs mobile app?
5. What happens on termination, revocation or expiration? Must derived statistics, historical observations and cached responses be deleted?
6. Which UK product categories and exact GTIN/MPN/ASIN mappings can you provide, including variations, bundles, condition, VAT and delivery?
7. Can we obtain a trial API key and a sample covering 30 UK SKUs across three or more merchants? What are the fees, rate limits, SLAs and coverage gaps?
8. Are any downstream data sources or subcontracted feeds restricted from re-publication?

## Measurement pilot (not yet performed)
Use 30 manually verified UK variants from the selected category, including 10 difficult variant cases. Record for each source: accessible products, exact-identity match rate, price including shipping/VAT, freshness, condition, stock, independent merchant count, 7-day coverage, rights for display/history, cost per 1,000 products/month. Report missing data and uncertainty. Do not claim coverage before account access and measured samples.

## Implementation gate
The existing `src/provider_feeds.ts` is **offline parsing only**, and `src/price_observations.ts` uses fixture-level rights markers. No source is production-approved. Add a separate signed-rights registry and authorization review before enabling network connectors. Keep the Product Fit ranking separate from purchase timing.
