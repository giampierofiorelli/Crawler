# Phase 60 — Documented technical specifications and independent third-party evidence
**Date:** 10 October 2026  
**Product:** Product Evidence Engine, UK-first, research prototype

## Binding editorial decision
Only two evidence classes are admissible in the future evidence-evaluation workflow:

1. **TECHNICAL_SPECIFICATION**: a precisely mapped field from a versioned manufacturer technical document or official regulatory technical document. The source is clearly labeled as a **declaration**, not proof of real-world results. Nominal performance values such as *specified battery runtime* are admitted **only when they appear as structured specifications in technical documentation** with the relevant conditions. Merely claiming a performance advantage in marketing materials is not admissible, even if the sentence contains a number.
2. **INDEPENDENT_EVIDENCE**: a directly attributable third-party laboratory measurement or a distinguishable professional editorial assessment. A subjective editorial finding is never converted into a laboratory measurement.

**Excluded unconditionally:** marketing claims, promotional copy, awards used as promotional evidence, manufacturer testimonials, "best/most advanced" language, retailer reviews/content, affiliate signals, Amazon data, prices, MSRP/RRP, availability, purchase-timing analytics. Manufacturers' claims should not be laundered as objective test evidence by quoting them in a numeric format.

## What the implementation actually changes
- New `src/technical_vs_independent.ts` defines a **closed union** of the only two allowed origin classes, strict field mappings reviewed per criterion, exact product variant, explicit methodology/conditions, and documentary provenance approval tied to a SHA-256 document fingerprint.
- The old Phase 59 `manufacturer_performance_claim` type is **disabled at runtime**: calls to the legacy `reconcileDeclaredWithTested()` reject any such record. All new integrations must use the Phase 60 module.
- A declared technical specification remains visible in `technicalSpecification` with `verifiedByThirdParty:false`. A real third-party measurement remains separately visible in `independentMeasurement`; editorial judgement stays in `independentEditorial`.
- A matching specification and independent measurement are **not counted as two independent observations**. The prototype emits an explicit maximum of one decision contribution per criterion and does **not** calculate a score or rank.
- Measurements across products are tagged comparable only with identical protocol ID, protocol version, criterion mapping, units, and required conditions. The statement of comparability does **not** prove statistical or practical superiority.
- Specification-only comparisons can be described as *technical specifications* but cannot result in *tested* superiority, even when the numbers look attractive.
- Missing tests are never interpreted as poor performance. Duplicated or contradictory records are flagged for editorial review rather than silently averaged.
- No guessed numerical confidence, no arbitrary "70% independent tests / 30% specifications" weighting, no real consumer recommendation or rights clearance.

## Data sourcing and rights limitations
An `approved` marker and document SHA-256 are **not** proof that a reviewer is authenticated, that a document belongs to the claimed publisher, or that a licence permits commercial use. Authentication, source ownership, rights, quality audits, independent editorial verification, and secure storage are not implemented. A convincing-looking manufacturer technical PDF could still contain marketing. Its fields must be reviewed against category-specific admissible-field registries before any future production use.

Inputs in all tests and examples are synthetic. This new component remains **RESEARCH ONLY** and is intentionally excluded from the allowlisted consumer `dist-launch/` package. The legacy synthetic ranking engine elsewhere in the repository also remains non-public. Nothing in the tests certifies legal compliance or objective recommendation quality.

## Test contract
`npm test` runs all TypeScript unit tests including new Phase 60 adversarial tests. `npm run test:launch` and `npm run test:release` check the isolated launch graph. Run Python regression tests separately from the repository root using `python -m unittest discover` according to existing suites.

## Still to be done
- Authenticate source and reviewer identities; trace licensing across rights holders.
- Collect real authorized original professional test results and actual official technical specifications.
- Set admissibility rules per category (for example nominal battery rating vs independently tested endurance).
- Establish measurement uncertainty, repeatability, independence, relevance and practical threshold rules on real datasets.
- Conduct user studies and validate that explanations improve decisions.
- Only then consider a score or a published ranking derived from real data.
