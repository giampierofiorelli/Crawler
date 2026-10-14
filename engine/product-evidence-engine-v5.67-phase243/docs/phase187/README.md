# Phase 187 — Field-specific evidence admission without universal source weights

English-first, website-first PEE v5.11; cumulative successor to v5.10. This phase **does not certify products** and does not authorize an overall commercial product ranking.

## Decision

A specification, an externally verified certification claim and an original independent consumer test answer different questions. The dimension, source type, method, units, specific product variant, and permitted use must be reviewed together. Manufacturer-stated capacity may generate a **provisional** lead; a domain-reviewed certification/registry measure can establish **limited field suitability**; an independent matched-method test can establish only what it actually measured. No universal percentage discount between tiers.

Phase187 uses a *reviewed, signed field policy* that specifies the intended usage profile and required threshold/range **or** exact certificate claim, allowed confirmation sources, measurement dimension and protocol version. This is deliberately **not** an LLM suggestion or a website user's arbitrary threshold. If the requested use case lacks a reviewed field policy, the engine abstains. Changing a product's identified variant, certification procedure or original document requires a new reviewed catalog; unreviewed data do not qualify.

Numeric range ceilings, when reviewed and present, prevent a larger nominal rating being treated as automatically better; otherwise a minimum does **not** prove optimal sizing. The signed policy must review every applicable load condition.

The new module implements:
- `compareFieldEvidence187`: identical behavior for fictional air-cleaner, room-AC or water-filter configurations when their own field-specific reviewed policy exists; confirmed field fits, provisional manufacturer statements, held/research gaps, and optional ordering **of one specific numeric dimension**, never whole-product ranking. Same-value ties are equal; missing measurements are not scored zero; contradictory values/protocol mismatches are held.
- `projectEvidenceLanes187`: read-only presentation separation of Phase181 original-professional-test dynamic ranking, Phase185 registry fact display, Phase186 room-AC sizing pilot and Phase187 bounded single-field comparison. It **never merges or upgrades scores**.
- New adversarial tests over fictional records, including source-class substitution, changing signed policy, certificate-specific claims, numerical comparison tie, exact-variant binding, unknown profiles, stale policy and protocol version starting in a year.

## Engineering sources (methodological, not proof that fixture values are real)

- AHAM Verifide, air filtration standard and separate dust, smoke and pollen CADR: https://ahamverifide.org/ahams-air-filtration-standards/
- AHAM Verifide original directory and independent third-party verification process: https://ahamverifide.org/directory-of-air-cleaners/
- ENERGY STAR room-AC guide: https://www.energystar.gov/products/room_air_conditioners
- ENERGY STAR certified room AC measurements and catalog fields: https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Conditioners/5xn2-dv4h
- NSF certified contaminant-specific claims: https://www.nsf.org/consumer-resources/articles/contaminant-reduction-claims-guide
- NSF water filtration certifications: https://www.nsf.org/water-systems/water-filtration

**Evidence cautions:** Two displays of one issuer's register are not two independent tests. A CEER rating is not evidence of quiet cooling. A smoke CADR does not verify gas-phase contaminant removal. An NSF/ANSI standard alone is not a specific lead reduction certification; the precise model and claim matter. Underlying external rights and identity review must be genuine; signing fixture data does not produce that validation.

## Existing components and boundaries

- Phase60: original technical vs independent evidence categories; no global source-quality factor.
- Phase181: independent original professional test, signed per-product knowledge and deterministic dynamic ranking; retained as its own authorized route.
- Phases183–184: technical observations from source documents, original hashes, source rights and exact variant safeguards; quarantined data remain quarantined.
- Phase185: source-attributed ENERGY STAR values may be shown only under a separately signed display review; they are **not** promoted automatically by this phase.
- Phase186: reviewed window-room-AC nominal cooling suitability and conditional CEER-only ranking; no general HVAC model.

## Current limitations

This work is limited to structured, already externally reviewed policy inputs. No field policy for real products has been commissioned, reviewed or signed; signing with an ephemeral test key proves only that the verification code works. No real source bytes were re-fetched, no independent blinded user decision benchmark was run, no production server routes/UI adopted the bridge, and no automatic scientific assessment exists. It does not solve multi-criterion ranking of certified+independent mixed sources. The existing actual EPA air-cleaner CSV remains non-ranking observational evidence. In a production deployment policy reviewer keys must be pinned outside user-controlled input and model-suggested updates.

## Reproduction

`npm run test:phase187` compiles and executes the focused tests with Node's built-in test runner; no new dependency or neural weights required. Full eligible regression excludes the historically quarantined Phase91/92 suites as in v5.10.
