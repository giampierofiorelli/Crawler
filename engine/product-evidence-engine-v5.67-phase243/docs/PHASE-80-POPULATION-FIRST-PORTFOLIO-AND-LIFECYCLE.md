# Phase 80: population-first priorities, lifecycle and launch seeding

> **Superseded lifecycle policy:** see Phase 81. Retail availability has been removed from manufacturing lifecycle decisions. A verified permanent model retirement must remain excluded from current rankings, with a retained historical product page. This document records an earlier design.

**Date:** 2026-10-10. **Status:** implemented as isolated research-stage deterministic planning modules. **Not production ingestion or a validated winner predictor.**

## Corrected requirement

The key priority is **which products are worth adding to the structured knowledge database first**. It is NOT simply which already-ingested products merit more tests. An open-ended attempt to comprehensively store every low-potential model before launch is wasteful. Use inexpensive *discovery stubs* (canonical identity, market, category/solution family, URLs/lineage, light lifecycle), while performing resource-intensive knowledge extraction only on selected models.

1. **Discovery layer:** maintain minimal stubs for all candidates encountered. This is a recall mechanism, not a fully populated product corpus.
2. **Enrichment layer:** initially build full records for candidates plausibly competitive for an unfiltered/general category. Use independent professional best-of shortlists as *weak discovery leads*, not independent proofs of real-world superiority. Other selection criteria can include verified product identity, representation of a solution family, and a novel technical feature requiring investigation.
3. **Recommendation layer:** rankings require their existing independent, comparable, rights-cleared evidence gates. Presence in another publication's list never adds to a product's performance score or provides a copied endorsement.
4. **Specific-demand exception:** a long-tail product that legitimately meets a niche/verified constraint becomes urgent to enrich for that request, even if it was not competitive in a broad general category. Do not treat a competitor's lack of appearance on an editorial list as a negative score.
5. **Budget/saturation:** enrichment can stop *for this launch wave* when allocated resources are consumed, or be paused after independently reviewed discovery passes found no new plausible candidates, currently reviewed solution families are represented, and no high-priority candidates remain deferred. This does not prove that the market is exhausted, or that current ranking can be published. Discovery continues periodically and on incoming user needs. `independentDiscoveryPasses>=2` is an **engineering policy pilot**, not a scientifically calibrated threshold.
6. **Pre-launch:** prioritize which **categories** to seed with actual demand evidence and risk/complexity. Within each category select first-wave product records by `planProductPopulation`; do not claim that any category's products were independently evaluated until they were.
7. **New product:** a model confirmed through a manufacturer technical spec can enter the discovery register and be queued ahead when its differentiated feature may be important. Without independent performance tests it remains in quarantine and must not automatically displace a recommended product.
8. **Discontinuation:** the manufacturing lifecycle of a model and local merchant availability are separate dimensions. Out-of-stock or retailer delisting does not establish that production has stopped. A verified explicit manufacturer discontinuation notice can exclude the product from *current-new-product* competition while keeping its permalink as a historical, visibly greyed-out product page. Conflicting current/discontinued notices require review. This is scoped by market; resale and remaining new stock must be shown accurately, not silently removed.

## Code and extension points

- `src/phase80_population_portfolio.ts`: first-wave candidate intake priority, duplicate original editorial-list suppression, family coverage, demand override, stopping/pause semantics, triage dispositions.
- `src/phase80_product_lifecycle.ts`: official model lifecycle versus retailer availability, product archive behavior.
- `db/migrations/013_prioritized_population_and_lifecycle.sql`: additive proposed schema for light stubs, source leads, lifecycle, wave audits. **Not migrated**.
- `tests/phase80_population_portfolio.test.ts`: constructed fixtures only.
- `examples/phase80-population-demo.ts`: contrasting broad category and tight demand.

## Methodological limits

- Editorial rankings are discovery priors only. Best-of lists can repeat one another, mix affiliate interests with editorial work, and systematically underrepresent new/small brands. The signal therefore uses documented independent original publishers, collapses duplicate original lists and never establishes a calibrated probability of winning.
- Confirmed product/variant identity and market presence are prerequisites for full enrichment; uncertain records first require cheap identity verification.
- This module does **not** crawl the live web, check actual licensing for specific websites, populate PostgreSQL, operate a production scheduler, identify all distinct editorial sources automatically, or validate ranking accuracy. Those interfaces must be connected to trusted source-receipt systems.
- The single-wave inputs are bounded to 5,000 discovery candidates and 500 enrichments for this deterministic prototype; large catalogues require batched, persistent processing and a source-independent discovery frontier.
- The lifecycle assessment currently represents verified evidence records supplied by upstream. Authentication, conflicting dates, model aliases, regional distributions, discontinued-versus-replaced policies and consumer-facing website CSS/UI still need end-to-end integration.
- Build a category-seeding budget from actual user demand rather than a speculative static list of 'popular' categories.

## Example

`npm run test:phase80` and `npm run demo:phase80`. With the constructed example, a broadly well-referenced candidate is selected first for the general first wave; a validated niche-fit candidate is selected first when the user expresses a matching need. Deferred products remain stubs, not erased.

## Reference vocabulary

Schema.org distinguishes [`Discontinued`](https://schema.org/Discontinued) from [`OutOfStock`](https://schema.org/OutOfStock). This distinction is useful for modelling but schema.org does not verify any merchant or manufacturer assertion.
