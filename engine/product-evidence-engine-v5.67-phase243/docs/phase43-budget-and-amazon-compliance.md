# Phase 43 — Launch budget semantics and Amazon boundary

## Implemented

- The launch entry point never passes `Request.maxPrice` to the legacy core `rank()` function. This prevents a list-price/reference field in `Variant.price` from being mistaken for a verified live selling price and silently removing an otherwise suitable product.
- When the user supplies `maxPrice`, the public launch result explicitly warns that the budget is **not enforced** and that actual retailer prices must be checked independently.
- The launch artifact still exposes no price, price history, price alerts, retailer availability, or purchase timing. Its retail links are attached after ranking, subject to the pre-existing approval workflow.
- This is a conservative safety change, **not** a solution for reliable budget-aware recommendations. Future research should develop price-band preferences from verified manufacturer MSRP/RRP with provenance and transparent uncertainty, without using these as proof of affordability.

## Amazon compliance baseline (UK; recheck at deployment)

Source: https://affiliate-program.amazon.co.uk/help/operating/policies (Participation Requirements, 2(a)-(b), 3, 4, 5), and https://affiliate-program.amazon.co.uk/help/operating/license.

- Use independently licensed evidence, images and specifications for rankings and shared product pages. No Amazon content/API in ranking.
- Show only manually reviewed Amazon product links using an authorized Associates tag, exact variant matching, and direct user clicks on the website.
- Do not publish Amazon prices, stock claims, comparison prices, historical price tracking, price alerts, or purchase timing advice.
- Affiliate disclosures and privacy/tracking compliance must be implemented in the actual UI before publication; returning a disclosure string in JSON is not sufficient.
- Other merchants' links require independent permission, exact-match verification and their own compliance review.
- No native mobile app release without checking Amazon's separate Approved Mobile Application requirements.
- Policies and site eligibility may change; code tests cannot certify compliance. Human review of the deployed pages and actual affiliate agreement remains mandatory.

## Known limitations

- `Variant.price` and `Request.maxPrice` remain in the legacy core and synthetic tests. They are not exposed in the restricted launch result, but should be refactored before real-data onboarding.
- No real merchant accounts, affiliate destinations, product source licences, real-data scoring calibration, production website, or legal review were exercised in this phase.
- No manufacturer list price ingestion, verified market-specific MSRP, or public budget band presentation is implemented.
