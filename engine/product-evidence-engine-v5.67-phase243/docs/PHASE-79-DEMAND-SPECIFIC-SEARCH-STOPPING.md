# Phase 79 — Search-depth signals, legitimate narrowness and large catalogues

**Date: 10 October 2026. Status: offline research-only implementation; no live discovery, public recommendation, verified external attestation or calibrated stopping probability.**

## Correction to earlier phases

Phase 77's `evaluatePortfolio` reports `fewer_than_two_comparable_eligible_products` when only one independently tested product remains: **that is a comparative-analysis floor, not a legitimate reason to reject a single valid product**. Phase 78 can assess a bounded, single verified option, but Phase 78 alone relies on attestations of search coverage and known product exclusions. Phase 79 adds an explicit second analysis of demand-specific filter decisions and an independent *challenge search* before declaring the exploration bounded.

## Stop/search question (not based on product quantity)

We separate:

1. **Discovery depth**: reviewed solution families, rights-approved sources, different original publishers and independent search paths; unresolved alternatives and new entrants.
2. **Demand-specific filters**: verified per-product fulfilment of every confirmed need, evidence-backed failure of hard constraints, unresolved measurements/variant distinctions. Missing evidence is not failure of a requirement.
3. **Adversarial challenge**: a separately reviewed discovery pass by an independent origin deliberately searching for plausible alternatives that the main methods missed. One unsuccessful challenge is a *review requirement*, not statistical proof the whole market was exhausted.
4. **Decision change potential**: important evidence conflicts, safety or test-protocol doubts, freshness, newly relevant products and whether additional tests could change the decision. Unknown potential triggers research, not false certainty.
5. **Independent publication**: passing the search adequacy gate routes the result to editorial/decision review. It never grants publication of a numbered ranking or sole-on-market claim.

The decision should not use a fixed **minimum/maximum number of products**. For a real user with two genuinely binding requirements, 1/3 relevant products after a systematic search can be a well-supported outcome, while a list of 100 products can be shallow because key evidence is missing. The exclusion breakdown is scoped to user-confirmed filters and can overlap (one product may fail several requirements), so its per-filter counts must not be summed.

### Examples (synthetic)

| Discovered in reviewed portfolio | Verified matching | Hard-filter exclusions | Independent search coverage / challenge | Research decision |
|---:|---:|---:|---|---|
| 3 | 1 | 2 | documented | bounded single option, independent decision review required |
| 1 | 1 | 0 | incomplete | expand source and solution discovery |
| 103 | 3 | 100 | documented | bounded comparative review, not automatic ranking |
| 100 | 100 | 0 | documented | comparative review/shortlisting, not indiscriminate new discovery |
| 100 | 3 | 0 confirmed, 97 unresolved | incomplete product checks | resolve filters/critical evidence, not merely request more candidates |

**Why an enormous product pool requires another design:** a large candidate pool should be handled with a two-stage, demand-specific funnel: inexpensive, *reviewed* hard-constraint eligibility checks first, then deeper independent evidence for viable contenders. Avoid running laboratory-level research on everything. Prioritise safety, uncertain exclusions, previously untested challengers and borderline decisions. For large-scale deployment, use versioned paginated batch audits and durable deduplication; the current Phase 77/78 in-memory audit caps at **500 candidates**. Phase 79 was regression-tested up to this cap and is **not a scalable streaming implementation** yet.

## Preventive versus triggered research

**Preventively**, establish category-relevant capabilities, discovery source inventory, test methods, safety and user-need maps, and refresh dates. **On-demand**, run a light audit of gaps. Run further research only when an independent discovery route is missing, an existing item has unverified filters, plausible new entrants are detected, additional information could change a decision, the original test becomes stale, or an adversarial discovery pass has not ruled out obvious omissions. These signals choose different actions; a large count or a low count is not itself an action.

A proposed **future** optimisation is to estimate, using held-out decision scenarios and real authorized evidence, how often new evidence changes the shortlist and the cost of gathering it. Do not label the current rule-based logic a calibrated probability, formal value-of-information calculation, proven recall threshold or scientific stopping rule.

## Code and verification

- `src/phase79_adaptive_search_decision.ts`: second-stage continuation decision, verified filter narrowing, independent discovery challenge, decision-stability/freshness gates, next action codes and truthful messages.
- `tests/phase79_adaptive_search_decision.test.ts`: synthetic adversarial checks, including one legitimate option, one merely known, three after narrow hard filters, 100 eligible, 500 catalogued, unknown outcomes, new entrants and cross-demand isolation.
- `examples/phase79-stop-or-search-demo.ts`: four reproducible offline scenarios.
- `npm run test:phase79` and `npm run demo:phase79`.

**Important security/epistemic qualification:** reviewer IDs, search receipts, filter justifications and new evidence flags used in constructed tests are *strings*. This TypeScript module validates their shape and consistency but cannot independently authenticate issuers, establish genuine legal reuse rights, verify true absence of market alternatives, or infer product suitability from actual measurements. The production service must verify receipt provenance, original-test lineage, rights, effective dated source access and decisions before calling this module. External model output must never be allowed to self-certify its own approvals. The upstream AI and web crawler are still not live here.

### Methodological sources (analogies, NOT validated shopping thresholds)

- Boetje J, van de Schoot R (2024). *The SAFE procedure: a practical stopping heuristic for active learning-based screening in systematic reviews and meta-analyses.* https://doi.org/10.1186/s13643-024-02502-7 — multiple conservative checks and independent challenge screening. Systematic evidence reviews are **not identical** to online retail search.
- Callaghan MW, Müller-Hansen F (2020). *Statistical stopping criteria for automated screening in systematic reviews.* https://doi.org/10.1186/s13643-020-01521-4 — independent sampling of unseen records is needed for meaningful statistical recall-based stopping; this version has no such sample and makes **no recall claim**.
- *Computer-assisted screening in systematic evidence synthesis requires robust and well-evaluated stopping criteria*, https://pmc.ncbi.nlm.nih.gov/articles/PMC11583672/ — stopping criteria require empirical validation.
