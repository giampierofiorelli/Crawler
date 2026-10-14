# Product Evidence Engine — Phase 219 technical report

**Date:** 2026-10-13  
**Canonical predecessor:** `product-evidence-engine-v5.42-phase218.zip` (v5.42.0)  
**Release:** v5.43.0  
**Scope:** Company-level review signals, new-product press-release discovery and editorial/news publication discovery. **Research-only, no scoring/ranking changes and no unauthorized data access.**

## Executive decision

The user's three suggestions are important but measure **different constructs**:

1. **Trustpilot / company-experience platforms:** may provide leads concerning post-sale service, warranties, repairs, returns, direct-shop fulfillment and unresolved product complaints. Platform aggregates are not direct measurements of the technical quality of a specific model. Reviewer selection, incentives, jurisdiction, retailer versus maker responsibility, authenticity and verification are all material.
2. **Manufacturer press releases and newsroom items:** useful for early model discovery, refreshes, availability, new variants, withdrawal notices and specification *claims*. They are not independent performance tests. Monitor with the existing Phase82 market watch.
3. **Journalism / specialist editorial / news:** useful for discovering original product tests, safety issues, published investigations and relevant developments. Editorial first-hand reporting is different from republishing a press release; news coverage is not automatically an original controlled test. A reprint is not another independent original event.

**Critical permission finding:** Trustpilot's active public legal policies prohibit unauthorized scraping/text/data mining. Official APIs exist, but permitted access and downstream uses must be reviewed and licensed where required. An API description or publicly visible profile **does not** grant PEE scraping/licensing rights. Therefore Phase219 does **not** fetch Trustpilot, does **not** rely on unlicensed review bodies, and accepts only bounded, declared, properly permitted structured feedback submitted by an upstream authorized pathway. That pathway must verify the actual permission record: the placeholder identifier alone is not a legal authorization.

## Existing components reused

- **Phase82 (`phase82_market_watch.ts`)** already has manufacturer newsroom, manufacturer product index, specialist editorial and professional test feed channels; RSS/Atom/sitemap/change-watch scheduling; host budget and backoff; discovery triage; and original work ID deduplication. Phase219 **does not introduce a second monitor**.
- **Phase68/69** governs actual web access, terms/robots/rights and complete-byte custody. Phase219 doesn't bypass it or assert metadata rights from RSS existence.
- **Phases193–204, 216–218** retain separate decisions about source screening, original work/test identity, reviewer expertise, exact market/variant, scientific evidence, publisher document versions and video provenance.
- Existing Phase82 `MarketSignal` and `triageMarketSignals` are used directly for authorized metadata. Research candidates aren't product recommendations.

## New implementation

`src/phase219_company_and_publication_signals.ts`:

### `triagePublications219`

Takes up to 1,000 **pre-obtained** structured publication descriptors with HTTPS URL, manufacturer/product/category, publisher role, original-work identity **if actually reviewed**, publication date, access status, independence claim and method-review status. Validates source and security boundaries. It maps permitted, identified press releases and editorial items into the existing Phase82 discovery queue, without fetching source content.

- Producer press releases: `collect_official_specs` **only when publisher is reviewed as manufacturer**.
- Media/press-wire reprints: remain derivative; if original-work identity is actually reviewed, they share the original ID so Phase82 deduplicates them. Without that evidence, keep distinct unresolved leads.
- Original editorial article without a test: research stub, not independent performance evidence.
- Editorial product review with reviewed editorial independence and original-work identity: request *later* inspection of original work, test and methodology. Even an item labeled method-reviewed triggers research; it doesn't authorize any measurement in ranking.
- Sponsored article: label sponsored; not an independent review.
- Media safety warning: priority action `verify_primary_safety_notice`; no automatic determination that a recall applies to a model.
- News reporting discontinuation: primary-source verification needed; no automatic retirement.
- Unknown permissions, exact variant, or publisher: hold/block/verify without enqueueing content as verified data.

The output holds only descriptors, URLs, unresolved checks, next action and Phase82 triage: no original article body, no independent test admission, no trust badge, no ranking.

### `assessCompanyFeedback219`

Takes up to 2,000 pre-cleared structured feedback records, **not review text**. For Trustpilot, missing explicit permission is held/blocked by default; no scraping/API request is performed. Applies per-review original ID deduplication, rejects contradictory duplicate fields, requires matching manufacturer scope, retains market/model references when known and partitions:

- Warranty/repairs/support/returns attributable to the manufacturer.
- Manufacturer's **direct-shop** delivery and fulfillment, relevant to direct purchase experience, but not a physical product defect.
- Retailer and third-party carrier complaints (not assigned to manufacturer service).
- Model-specific product failure/usability **leads**; not a measurement or verified defect.
- Unknown responsibility (unresolved, not forced into maker blame).

Counts are **raw discovered case counts**, not prevalence, satisfaction scores, population estimators or statistically representative rates. There is no sentiment-derived single numeric score and no TrustScore interpretation. Source-native 'verified' flags are not independent proof of identity.

### `planPublicationWatch219`

Passes permitted newsroom/editorial feed sources to the **existing Phase82 planner**. Source records and rights status must be configured upstream. No network requests, continuous background task, feed subscription or periodic automation are launched by this adapter.

`examples/phase219-publication-intelligence-demo.ts` and `PHASE219-SYNTHETIC-REPLAY.json` reproduce permitted-press and independent-review lead routing; a press reprint shares the original ID; a Trustpilot record with unreviewed permission remains blocked; a rights-uncleared RSS source is not scheduled. **All metadata, authorizations and source identities in this demo are synthetic.**

## Research: primary documentation and implications

1. Trustpilot consumer terms (effective October 1, 2026): https://corporate.trustpilot.com/legal/for-reviewers/terms-of-use-for-consumers/oct-2026  — restrictions on unauthorized collection, automated scraping and text mining.
2. Trustpilot data-use enforcement / scraping policy: https://corporate.trustpilot.com/legal/for-everyone/action-we-take/mar-2026 — expressly includes bots, AI agents and unauthorized scraping.
3. Trustpilot developer authentication: https://developers.trustpilot.com/authentication — public API requires an API key; private API requires OAuth. Availability is not a general reuse licence.
4. Trustpilot business API and content licensing requirements: https://uk.corporate.trustpilot.com/legal/for-businesses/legal-brand-guidelines/sept-2026 — API use restricted to permitted subscription/use case; no unlicensed display.
5. CMA (UK), fake reviews guidance (April 2025): https://www.gov.uk/government/publications/fake-reviews and https://assets.publishing.service.gov.uk/media/67eeb64fe9c76fa33048c790/CMA208_-_Fake_reviews_guidance.pdf — fake/concealed-incentive reviews, misleading review information and obligations to prevent distortion.
6. FTC native advertising guide: https://www.ftc.gov/business-guidance/resources/native-advertising-guide-businesses — paid/promotional material may mimic independent editorial; relationships and disclosure are material.
7. Google News policy: https://support.google.com/news/publisher-center/answer/6204050?hl=en — publisher identity, bylines, dates and disclosure are relevant transparency fields (not independently sufficient to certify accuracy).
8. Samsung Global Newsroom (real official public discovery example): https://news.samsung.com/global/ — manufacturer has product announcements / press-release categories and RSS. **Observed as a public information source through external web research, not live ingested by the Phase219 PEE runtime.**
9. UK Office for Product Safety and Standards official recalls and alerts: https://www.gov.uk/guidance/product-recalls-and-alerts and https://www.gov.uk/product-safety-alerts-reports-recalls — primary safety information with product/variant and market scope.
10. GDELT project data documentation: https://gdeltproject.org/data.html — potential *news discovery* index, but downstream collection and rights, completeness, deduplication and bias need separate testing before adoption.

## Validation results and limitations

- **TypeScript compilation succeeded** using Node 22-compatible type definitions from an environment-provided package; these are a local dev build dependency, not a runtime package dependency and are **not** included in the ZIP.
- **32/32 new focused tests passed.** Includes press reprints, editorial independence, sponsored advertorials, reporter-only article, primary-safety verification, Trustpilot permission denial, direct-shop vs retailer/carrier assignment, duplicate source conflicts, prohibited URLs, bad publisher/variant, and reuse of Phase82 scheduler.
- **3,922 admitted TypeScript tests passed** across 15 bounded groups. Historical Phase91 and Phase92 remain excluded/inconclusive. See Phase219 test result file and logs.
- **212 Python unit tests passed** across the established groups. The slow phase170 companion suite took longer than the others, but completed successfully. See logs.
- **No real Trustpilot data was accessed**, no Trustpilot API credentials were created, and no content licensing was asserted.
- **No real live publisher/feed page was fetched from within this runtime.** Three direct HTTPS attempts failed with DNS resolution errors. External web search verified the existence of actual newsroom and regulatory pages, but this is not a PEE end-to-end permitted website ingestion test.
- No precision/recall/F1 on actual company review aspect classification; no estimate of fake-review incidence, publisher originality detection, actual feed freshness, language generalization, news discovery coverage or ranking improvement.
- The adapter expects upstream, verified source fields. These cannot be automatically derived from a publisher-supplied label or a headline alone. User's preference for English-first processing remains unchanged.
- No automation scheduler was activated. Phase82 remains a scheduling **planner** until a properly authorized operational service executes it.

## Required next steps — Phase220

1. Pilot with one **actually permitted** real public manufacturer newsroom metadata source (the access reviewer must document a rights/terms decision, robots rules, capture URL, time, bytes/hash and version). Do not infer authorization merely from a feed existing.
2. Complete newsroom/editorial metadata integration into the existing Phase82 execution worker and Phase218 video discovery (one URL/source/work receipt across modalities). This Phase219 adapter is a **bounded bridge**, not an autonomous production monitor.
3. For Trustpilot, determine whether the PEE product's exact intended use can obtain appropriate official API/licensed access; until then leave it disabled. Independently design handling of other lawful company-service evidence sources.
4. Build a properly consented or licensable, blinded **English-language** annotation set for service/warranty vs retailer/carrier, manufacturer direct fulfillment, and newsroom vs PR reprint vs independent test/sponsored advertorial. Measure false attribution and false independence separately.
5. Triangulate safety articles with jurisdictional regulator records (e.g., UK OPSS); verified recall may warrant a distinct safety blocking gate, not arbitrary sentiment-based scoring.
6. Preserve cumulative source/reviewer/taxonomy/ranking invariance and avoid a single "brand goodness" score.
