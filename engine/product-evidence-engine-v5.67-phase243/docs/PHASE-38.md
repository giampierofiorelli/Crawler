# Phase 38 — Commercial rights and 30-SKU coverage pilot
Date: 2026-10-10 | Market: GB | Status: research and offline controls; **NO LIVE PROVIDER APPROVAL**

## Executive decision
**Do not build or ship Amazon price tracking/alerts under standard Amazon Associates terms.** The current Amazon UK Associates Program Policies, Participation Requirements §(y), explicitly say: “Unless otherwise agreed by Amazon, your Site must not have price tracking and/or price alerting functionality.” A Keepa subscription alone does not override this restriction. Seek written exception / legal interpretation of combined use case before enabling features. Do not interpret our software's authorization flags as proof of a legal right.

Amazon's Creators API/PA API license also restricts aggregation/analysis of Product Advertising Content without express prior written approval, use on mobile, and retention (generally 24h). A neutral multi-retailer comparison app may conflict with the principal-purpose restriction. Note also the Associates Linking Requirements contain specific conditions for comparing Amazon prices with other sites (including showing the lowest new price and used price when provided). **All of these need specialist legal and Amazon review for the exact planned UX.**

Keepa API officially provides price histories and seller/offers data via token-based billing. But availability of data is not evidence of rights to redistribute histories/charts in a consumer app, nor does it override any separate Amazon contract applicable to our site.

Awin officially describes price-comparison publishers as main feed users; actual programs and merchant rights, storage, historical reuse, coverage and completeness require account-level verification.

Google Merchant Center pricing insights are not a public competitor-pricing feed; do not use them for this purpose.

## Official sources and direct links
1. Amazon UK Associates Program Policies (Participation Requirements (y), (z), mobile, and license): https://affiliate-program.amazon.co.uk/help/operating/policies/
2. Amazon EU Associates Programme IP License: https://affiliate-program.amazon.co.uk/help/operating/license
3. Amazon Linking Requirements (comparison conditions): https://affiliate-program.amazon.co.uk/help/operating/linking
4. Keepa API overview: https://keepa.com/api-docs/
5. Keepa token model: https://keepa.com/api-docs/plans-tokens.html
6. Awin product feed publisher guide: https://help.awin.com/developers/docs/product-feed-publisher-guide-intro
7. Google Merchant Center pricing reports: https://support.google.com/merchants/answer/13798101?hl=en-GB

## Commercial integration decision matrix
| Provider | Current offer display | History and public charts | Alerts | Decision |
|---|---|---|---|---|
| Amazon | Conditional; affiliate account and product-specific conditions, legal review | Not authorized by standard caching permission; specific restrictions | Prohibited absent separate Amazon agreement | Block by default |
| Keepa | API technically available; publication permission unknown | Historical data technically available; commercial redistribution unconfirmed | Requires contract review and assessment of Amazon site terms | Block by default |
| Awin | Feed use by price comparators documented; advertiser rights vary | Historical storage/display not automatically granted | Not automatically granted | Block by default |
| eBay | API access subject to agreement | No general history rights assumed | Not assumed | Block by default |
| Google Merchant reports | Not a public price-comparison source | Not for public aggregation | Not for our use | Block |

## What was implemented in v0.9
- `src/commercial_rights.ts`: fail-closed provider+market+feature authorizations. Requires documented signed agreement, named reviewer, term and explicit use. Amazon additionally requires recorded exception IDs for price tracking/aggregation. Google Merchant always denied in this tool.
- `src/coverage_pilot.ts`: denominator-first offline audit; counts exact SKU matches, freshness, complete offers and rights-cleared coverage separately; no synthetic dataset is misrepresented as actual coverage.
- Tests exercise denial defaults, missing/expired agreements, Amazon tracking/aggregation, Google exclusion, SKU matching, freshness, and empty coverage.
- These are safeguards, not contractual or legal approvals. In production, signed artifacts must be checked in an access-controlled rights registry, not simply typed into a JSON file.

## 30-SKU empirical pilot: protocol
1. Fix 30 manually verified UK variants from the chosen product category, including at least 10 hard cases (bundles, model suffixes, UK vs US variants, color, replacement generation). Record canonical variant ID, manufacturer MPN, GTIN/EAN where available, and marketplace ASIN only as a separate identifier.
2. For each provider, record whether account access is actually available; date/time; offer identifier; seller; exact variant; new/used/refurbished; currency; VAT; delivery cost; availability; estimated delivery; direct purchase URL; evidence of rights to display/store/history.
3. Measure exact identity coverage = number of 30 variants with ≥1 verified exact match / 30; fresh coverage = variants with an offer updated within the declared freshness window / 30; complete coverage = variants with a fresh exact offer including VAT, shipping, stock / 30; *publishable coverage* additionally requires verified provider rights. Show merchant count separately; one marketplace is not several independent retailers.
4. Measure 7-day continuity (daily successful observations and gaps), not merely a one-time scrape. Record missingness and exclusions.
5. Never obtain data through prohibited scraping, bypass authentication, or use restricted Merchant Center reports.
6. **Go/no-go:** no public display until rights and exact-SKU coverage are demonstrated. No price-history or buy/wait promise until rights, continuity and backtesting are separately established. No invented minimum coverage threshold is treated as evidence-based.

## Access needed from project owner
- Amazon Associates/Creators API eligibility and exact planned site/app UX for legal review.
- Keepa sales/licensing confirmation on charts, derived stats, price alerts, mixed-retailer presentation and termination.
- Awin publisher account and advertiser feed approvals; rights for historical snapshots.
- A shortlist of 30 exact UK variants and permission to conduct a time-boxed provider pilot.

## Message to Amazon UK Associates / business development
Subject: Written clarification and permission request — independent UK product recommendation and price-comparison service

Hello Amazon Associates team,

We are developing a UK consumer product recommendation service that independently ranks products by user needs, then displays current purchase offers from multiple retailers. We would like Amazon to be included as a merchant, using approved Amazon affiliate links and the Creators API where permitted.

We understand the UK Associates Participation Requirements restrict price tracking/alerts unless otherwise agreed by Amazon, and that the API license places additional restrictions on aggregation, caching and the purpose of the application.

Could you confirm in writing whether our proposed experience is eligible, and if an exception or separate agreement is possible for: (1) displaying Amazon alongside other merchants for the exact same variant; (2) showing an independently licensed third-party historical Amazon price chart and derived median; (3) price-drop alerts; (4) consumer web/mobile delivery; (5) retaining only ASIN mappings versus Amazon-sourced price content? Please also clarify attribution, new/used comparison, timestamp, API refresh and deletion requirements.

We can share UX mockups and a detailed data-flow diagram before any integration.

Kind regards,
[Company / contact]

## Message to Keepa licensing
Subject: Commercial redistribution rights inquiry — UK consumer comparison product

Hello Keepa team,

We are evaluating your API for a UK consumer product recommendation and price-comparison application. We need a written licensing clarification before integrating historical price data.

May we (1) show Keepa-sourced Amazon price histories/charts to end users; (2) publish derived statistics such as 30/90-day medians and historical percentiles; (3) combine them with other retailer prices and independent product rankings; (4) offer alerts; (5) retain historical records or derived statistics after termination? What attribution, refresh, plan, sublicensing, caching, mobile-app and downstream Amazon-related restrictions apply? Is a specific redistribution/enterprise agreement available?

Please provide the relevant commercial terms and pricing for a trial covering 30 UK ASINs.

Kind regards,
[Company / contact]

## Message to Awin
Subject: UK product-feed access and historical price rights for comparison publisher

Hello Awin team,

We are developing a neutral UK product recommendation and price-comparison service. We would like to trial product feeds for 30 exact UK variants across several merchants.

Could you confirm publisher onboarding requirements, advertiser approval process, which UK feeds expose GTIN/MPN, landed price, stock and timestamps, and whether we may publicly compare offers and store daily snapshots for historical price charts/alerts? Please specify merchant-specific limitations, branding, deletion obligations, fees and API/feed refresh rules.

Kind regards,
[Company / contact]

## Explicit non-claims
No accounts were accessed, no API keys were used, no live merchant prices were retrieved, no licenses were approved, and no measured real-market coverage or forecasting accuracy is claimed in this phase.
