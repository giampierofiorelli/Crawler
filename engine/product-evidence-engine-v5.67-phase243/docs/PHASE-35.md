# Phase 35 — Provider feasibility and rights-first adapter (v0.8)

## Evidence status (10 October 2026)

This is a **provider feasibility review**, not a live integration or a license clearance. All tests use fictional rows. The research distinguishes API technical availability from account access, legal rights to store prices, historical redistribution, and actual category coverage.

| Provider | Verified capability | Important limitations | Next verification |
|---|---|---|---|
| Awin publisher product feeds | Downloadable advertiser feeds, product identifiers, prices, some shipping/stock columns; timestamps on feed list | Feed access depends on program; missing columns; not a guaranteed complete UK market; historical retention/public price comparisons not cleared | Publisher account; identify eligible UK merchants and exact SKUs; get written history/display rights |
| eBay Browse API | GTIN/item lookup, listing details, condition, shipping, seller, availability | Marketplace listings, condition and seller variation; not comparable to retail catalog by default; account and terms unverified | App credentials, access rights, item-to-variant mapping, restrictions on historical retention |
| Keepa | API SDK supports Amazon product historical prices and locale selection | Amazon-focused; subscription/cost/rights for redistribution and derived history not verified | Ask vendor for UK commercial license, sample coverage, historical storage and UI rights |
| Amazon Creators API | Amazon moved away from PA-API (old docs say deprecated May 2026) | Associates IP License generally limits caching of Product Advertising Content; cannot presume indefinite historical storage | Check current Creators API terms for proposed price history use; do not import until cleared |

### Primary-source URLs
- Awin publisher feed overview: https://help.awin.com/developers/docs/product-feed-publisher-guide-intro
- Awin feed list / available columns: https://help.awin.com/developers/docs/product-feed-list-download
- Awin publisher FAQs: https://help.awin.com/developers/docs/faqs-for-publishers
- eBay Browse API: https://developer.ebay.com/api-docs/buy/static/api-browse.html
- eBay inventory refresh: https://developer.ebay.com/develop/guides/buy/inventory-discovery-and-refresh-guide
- Keepa public API implementation: https://github.com/keepacom/api_backend/blob/master/src/main/java/com/keepa/api/backend/structs/Request.java
- Amazon PA-API deprecation notice: https://webservices.amazon.co.uk/paapi5/documentation/
- Amazon Associates IP License (cache and display): https://affiliate-program.amazon.com/help/operating/policies

## Decision

**Investigate Awin first** for a UK pilot with one category, and eBay as an optional complementary channel. Keepa only after license review. Do not scrape merchant websites or rely on old Amazon PA-API instructions. No source is approved for production use at this stage.

## Pilot acceptance gates (to be measured, not claimed)

1. Confirm contractually that product-price display, retention, derived historical charts, comparisons and affiliate linking are permitted, with expiry and deletion obligations.
2. Inspect actual accessible UK feeds: count independently identified exact UK SKUs across at least three distinct merchants and the target category.
3. Sample 30 target SKUs, manually verify GTIN/MPN, package/bundle, VAT, delivery and availability, and document error rates.
4. Record feed update cadence, missing price/stock/shipping fields and real end-to-end offer freshness.
5. Test removal and rights revocation; prohibit unknown rights from being ingested or displayed.
6. Run shadow collection for 30–90 days, calculate coverage, gaps and false positive price changes; **do not** claim predictive power from this window alone.
7. Later, evaluate a buy/wait classifier against chronological holdout data and simple no-prediction baselines; compare outcomes at 7/14/30 days, costs and regret; no look-ahead leakage.

## New adapter contract

`src/provider_feeds.ts` parses **locally supplied** Awin-like CSV or eBay-like JSON, not live provider APIs. It emits candidate records for **human verification only**, with original merchant SKU, GTIN, market, condition, total-price components, and source provenance. It **never** sets `identityVerified=true` or `permission=authorized`, and never creates approved history. Downstream `quarantinePriceFeed` remains the independent rights and identity gate.

### Important implementation warning

`src/price_observations.ts` presently accepts `permissionEvidenceUrl` plus `permission='authorized'` as a fixture-level marker; that is not independent proof of a signed license. Do not connect real providers directly to that flag. Approval requires a separate audited rights workflow. Also `summarizeMerchantHistory` accepts its input array as trusted; only call it with records selected from the approved-rights database view. These boundaries need end-to-end enforcement before launch.
