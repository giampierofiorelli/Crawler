# Phase 39 — Independent Ranking / Purchase Links Compliance Boundary

## Decision (10 October 2026)

Ranking must never depend on Amazon, retailer availability, affiliate commissions, or retailer pricing. The purchase-link resolver runs only after ranking is final. It must not reorder or hide ranked products when there is no merchant link.

## Implemented

- `src/purchase_links.ts`: standalone retailer link resolver; no Amazon API or Amazon product content, no price fields, no history, no timing recommendations.
- Fail-closed eligibility: exact variant match, independent sourcing, rights approval, destination approval and market match must all be explicitly true.
- UK Amazon links limited to HTTPS `www.amazon.co.uk/dp/<10-character ID>?tag=<associate-id>`; the Associate ID must match the provided tag. These checks are a conservative application-level policy, **not** a substitute for Amazon review.
- Non-Amazon merchant URLs independently sourced; no Amazon URLs may be passed off as other retailers.
- Product ranking object is preserved by identity and untouched by the resolver.
- Clear affiliate disclosure provided as a string for UI display. Place conspicuously adjacent to purchase links and in site-level disclosure.

## Important limits / no compliance certification

- An approval flag is a required input from a separately audited verification workflow; the resolver does not establish legal rights or verify that a live retailer listing is accurate.
- This module does not verify live URLs, ASIN identity, stock, current Associates enrollment, merchant contracts, or real-world rights. **Do not auto-set the flags to true.**
- No Amazon APIs, scraping, price history, price alerts, Amazon reviews, or Amazon images are used.
- Legacy `purchase_decision.ts`, `price_observations.ts` and other experimental commercial modules still exist in the repository for research/backwards compatibility; **they are NOT launch-approved and must not be wired to the public UI**. Follow-up engineering should gate or remove these modules from the production entry point.
- Existing `Variant.price` and `Request.maxPrice` in the legacy synthetic engine represent prototype budget constraints, not Amazon prices. This phase does not certify real-world price rights or launch suitability.
- Separate legal review needed for UK ASA/CAP affiliate disclosure, UK GDPR/PECR tracking, product source licensing, other retailer affiliate contracts, and any future mobile application.
- The website and affiliate account must meet Amazon's current enrollment and link requirements; this is not guaranteed by passing unit tests.

## Authoritative primary sources (reviewed 10 October 2026)

- Amazon UK Associates Programme Policies: https://affiliate-program.amazon.co.uk/help/operating/policies
- Amazon UK Associates IP License: https://affiliate-program.amazon.co.uk/help/operating/license
- Amazon UK Associates Operating Agreement: https://affiliate-program.amazon.co.uk/help/operating/agreement

## Acceptance criteria

1. Any variation in retailer offers or commissions leaves ranking unchanged.
2. Missing/unknown rights or unverified variant leads to **no purchase link**, not a guess.
3. No Amazon data reaches the ranking or non-Amazon merchant offers.
4. No prices, historical price data, alerts or buy/wait decisions in the launch purchase-links UI.
5. Links are only enabled following explicit documented review and verification.
