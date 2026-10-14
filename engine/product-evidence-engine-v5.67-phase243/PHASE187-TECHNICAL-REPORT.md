# Product Evidence Engine — Phase 187 technical report

**Date:** 12 October 2026  
**Canonical predecessor:** v5.10 / Phase 186  
**Release:** v5.11 / Phase 187  
**Status:** coded and regression-tested field-specific evidence policy prototype. **Not** a product-ranking validation, production release, independently audited certificate authority, or verified real-product recommendation.

## Executive engineering decision

Technical specifications must not be uniformly discarded when independent reviews are missing. Nor is it defensible to apply a universal trust weight (e.g. “manufacturer specifications are worth 30%”). A source establishes a particular proposition only in the context of its product identity, stated dimension, units, measurement method, protocol version, issuing/verification process, field applicability and rights.

Phase187 introduces a **generic, reviewed field-evidence contract** on top of the existing cumulative modules instead of replacing their rankings. It has a precise scope: field suitability for one reviewed usage profile, not a holistic best-product result. It handles signed certificates/registry measurements and independent technical observations only when the reviewed field policy admits that class. Manufacturer statements may remain visible as provisional leads. Missing information does not produce an artificial zero.

## What was implemented

1. `src/phase187_field_evidence_bridge.ts`
   - `compareFieldEvidence187` verifies an out-of-band Ed25519 signed structured product/field catalog (a signature proves only what key signed the bytes), the authenticated review policy, date/market/category applicability, exact product variants, original-source SHA-256 identifiers, rights/identity review references, dimensions, units and test protocols.
   - Supports two independently configured field-policy kinds: numerical threshold / optional bounded range and **exact certified claim**. The configuration is not generated or approved by the shopper. A higher rated number is not automatically better: ordinary suitability can be tied, and externally reviewed comparison direction can produce only a **single-dimension order**. For example, a numeric cooling-capacity threshold alone does not prove the best room sizing; a reviewed upper bound is required to hold potential oversizing.
   - Keeps matched field evidence, provisional manufacturer statements, missing fields, contradictory records and incompatible methods in distinct arrays. Refuses mixed protocols, contradictory values, derived metrics substituted for independent measures, invalid signatures, stale catalogs, category/market drift, and forbidden source-class upgrades.
   - `projectEvidenceLanes187` keeps Phase181 independently reviewed test ranking, Phase185 registry fact display, Phase186 bounded AC suitability and the new Phase187 field comparison in **separate lanes**. It explicitly does not combine their ranks or authorize cross-category publication.
2. `tests/phase187_field_evidence_bridge.test.ts`: **39/39 passing** fictional-product tests, including year-first protocol versions, source-class permission rules, hard mismatches, signed tampering, true ties, numerical upper bounds, a precise fictional water-filter lead claim, and safe cross-module separation.
3. `scripts/demo-phase187.mjs` and `evaluation/phase187/fictional_demo.json`: three reproducible **fictional** example categories (air cleaners, water filters and window ACs). Demonstrates admissible, provisional and held rows. No production product IDs or genuine certificate attestations.
4. `docs/phase187/README.md`: original technical source URLs, cumulative module boundaries, rights and independent-review cautions.

## Engineering sources and what they support

| Publisher / source | Supported technical distinction | What it does **not** establish |
|---|---|---|
| AHAM Verifide air filtration standard, https://ahamverifide.org/ahams-air-filtration-standards/ | Tobacco smoke, dust and pollen CADR are distinct pollutant-specific measures. | No direct evidence of gas removal, noise, reliability or every particle in actual homes. |
| AHAM Verifide independently tested directory, https://ahamverifide.org/directory-of-air-cleaners/ | Describes independent third-party program verification and model-level ratings. | A PEE input label is not proof that a particular observation really came from the verified directory. |
| ENERGY STAR room AC guidance, https://www.energystar.gov/products/room_air_conditioners | Room size, cooling rating and adjustments are related; excess capacity is not always preferable. | A general profile/nominal rating does not replace a full room heat-load analysis. |
| ENERGY STAR certified room AC fields, https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Conditioners/5xn2-dv4h | Explicit rated cooling capacity and device-type information, with specified test-procedure meanings. | Rated capacity/CEER do not directly measure subjective comfort, noise or durability. |
| NSF contaminant reduction claims, https://www.nsf.org/consumer-resources/articles/contaminant-reduction-claims-guide | Requires a product's actual contaminant-specific certified reduction claim. | “NSF/ANSI 53” generically does not establish that every certified device removes lead. |
| NSF water filtration, https://www.nsf.org/water-systems/water-filtration | Specific treatment/certification domains and standards. | Certification of one dimension is not universal purification effectiveness. |

The preceding sources were consulted for field and source-class distinctions. Their presence here does **not** constitute an original independent lab validation of any fixture, or a legal authorization to republish entire test tables. The latest official documents, rights and exact variants must be checked in the operating ingestion pipeline.

## Regression and preservation

- `npm run test:phase187`: TypeScript compiled, **39 passing** focused tests.
- Eligible TypeScript full regression: **2,882 passed across 149 eligible files in 14 isolated groups**; zero failures. Legacy Phase91/92 deliberately excluded as in prior releases. Exact command results: `evaluation/phase187/regression-ts.json`.
- Six Python `unittest` discovery groups: **212 passed**, historical `ResourceWarning` outputs regarding sqlite connections in the companion group. `evaluation/phase187/regression-python.json`.
- Demo uses ephemeral test signing keys and invented product data. No external model, package, API subscription or proprietary repository added.

## Scientific and product limits

- No real Air Conditioner or Water Filter product has been approved by this release. Existing Phase184 EPA air-cleaner records remain non-ranking observations until additional original source rights, identity/registry validation and accepted field policy are provided.
- The generic policy **does not** silently authorize a production rating, perform a live web search, verify the content behind a source URL, or establish that an issuer's certificate actually exists. A signed review reference is a trust-boundary technical assertion, not its own scientific validation.
- A web user can confirm a criterion in Phase177, but Phase187's `confirmedByUser` flag is still a local test interface. Future integration must bind a real authenticated server-side, versioned decision snapshot and domain-reviewed profile, including current market and conditions.
- Compositional multi-criterion ranking and bundles remain with prior modules; no unsafe numeric blending of tiered sources has been implemented. Field comparisons remain useful, but may not be presented as a holistic Top 5.
- Benchmark next: acquire exact certified records with verifiable rights, match retail variant identifiers, test an unseen English original-request corpus and compare decision error rates for provisional vs withheld candidates.

## Follow-on Phase188 recommendations

1. Obtain a real, legally reusable, original certified/model-level room-AC file or AHAM Verifide record with verified publisher custody and protocol version; distinguish certified values from original comparative consumer reviews.
2. Implement an explicit promotion workflow from phase183/184 quarantine through independent human/technical review into **field-specific** signed knowledge, and establish policy profile review, not in-band LLM or browser approval.
3. Bind versioned Phase177 confirmed criteria and Phase181 product knowledge on the same exact product variant and scope. Evaluate one-criterion correctness before adding multi-criterion tradeoffs.
4. Compare three browsing strategies in the website UX: show manufacturer-only candidates provisionally, withhold unknown candidates, or trigger research. Evaluate missed decisive exclusions and wrong confidence, not merely clicks or perceived persuasiveness.
5. Continuously update product/category knowledge and invalidate only materially affected decisions (Phase105/106), preserving rank reproducibility and showing source drift.

No new user download required to continue with the architecture, but an actual professional source document with lawful reuse and verified variants will be required before claiming any evidence-approved real ranking.
