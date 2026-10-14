# Product Evidence Engine — Phase 186 engineering report

**Date:** 2026-10-12  
**Input:** canonical v5.09 / Phase185.  
**Question:** should technical specifications influence recommendations if independent reviews are absent, and how should the effect depend on the engineering question?

## Evidence review

1. **ENERGY STAR room air conditioning guidance** explicitly links room floor area to rated cooling capacity in Btu/hour (e.g. 300–350 sq ft -> 8,000 Btu/h under reference assumptions), with adjustments for sunlight, occupancy, kitchen heat and ceiling height. Too-large units can finish cooling without adequate dehumidification. Sources: https://www.energystar.gov/most-efficient/me-certified-room-ac/results?is_most_efficient_filter=Most+Efficient and https://www.energy.gov/cmei/femp/purchasing-energy-efficient-room-air-conditioners . These are *sizing guidelines*, not independent cooling-speed tests or guarantees for a particular room.
2. **Efficiency labels are meaningful evidence within scope**: ENERGY STAR reports cooling capacity and CEER for specific certified models and versions. Capacity is a feasibility variable, CEER a rated energy-efficiency variable; neither measures comfort, build quality or durability. Criteria: https://www.energystar.gov/products/room_air_conditioners/key_product_criteria ; program obligations, including third-party verification testing: https://www.energystar.gov/sites/default/files/ENERGY%20STAR%20Version%204.0%20Room%20Air%20Conditioners%20Program%20Requirements.pdf . Verify the *current relevant specification* and certified record; a submitted technical figure alone is not an authenticated independent consumer sample.
3. **Independent performance tests answer different questions**. Consumer Reports describes climate-controlled chamber measurements of cooling time, set-point retention and noise. Source: https://www.consumerreports.org/cro/air-conditioners/buying-guide.htm . These observations can distinguish products with the same rated cooling capacity, but PEE cannot assume comparability between unknown protocols or substitute CEER for measured speed.
4. **Manufacturer data remains useful, differently labeled**: a technical-dimension claim can support tentative screening, but no assumed 30% / 50% source weight should silently convert it into a certified test or hard pass. Expert documentation supports question-specific evidence relevance, not a universal numerical trust factor. Comparison of window and portable cooling ratings requires actual standards/protocol review before conversion.

## Implemented incremental code

- `src/phase186_tiered_specification_suitability.ts` — independent, bounded policy using reviewed signed product specifications, provenance, identity, units and methods; reacts deterministically to confirmed English-first web input.
- `tests/phase186_tiered_specification_suitability.test.ts` — fictional-model adversarial cases for engineering constraints, ties, missing data, unsigned source, source spoofing, and incompatible rating methods.
- `docs/phase186/README.md` — source links, specific limits and reproduction instructions.

**Evidence classes:** manufacturer technical specifications => visibly *provisional* compatibility only; certified registered rated capacity => bounded suitability screen, not an independent cooling outcome; certified CEER => separate conditional efficiency-only order if standards match; reviewed independent tests => separate evidence class, not double counted. A product with missing test data is retained, not falsely scored zero. Oversized products are marked for reassessment, not portrayed as necessarily defective. All derived advice is conditional on the explicit category, market and sizing profile.

**This module is not production-wired to the web UI or the original-test-only Phase181 ranking.** A subsequent phase must unify the publisher-specific policies with reviewed technical field mappings, license checks and application UX, using the existing per-product evidence and dynamic decision engines. No evidence signatures have been issued for real products.

## Decisions retained

- Never make precomputed rankings a prerequisite; build from versioned per-product knowledge at request time.
- A material feasibility criterion can matter more than a generally stronger product score; no universal trust weight for technical vs independent evidence.
- Source coverage, publication rights, exact variant identity and methodology limitations must remain visible.
- No artificial ordering when only the required capacity is known; equivalent capacities tie.
- Prioritize the user's actual tasks and load conditions; outside the validated sizing profile the system requests further technical assessment rather than guessing.

## Results and reproducibility (verified)

- Phase186 targeted: **25/25 passing**, including signed-catalog tamper checks, exact variant binding, provisional manufacturer-only matches, CEER protocol mismatch, tie handling, cooling-size bounds, bad solar/load conditions and anti-double-counting.
- Eligible cumulative TypeScript regression: **2,843 passing / 148 files**, all groups successful; historic Phase91/92 suites excluded consistently with predecessor releases. See `evaluation/phase186/regression-ts.json`.
- Python regression: **212 tests in six groups passed**, historical SQLite resource warnings in the companion suite. See `evaluation/phase186/regression-python.json`.
- Fixture demo: `npm run demo:phase186` and `evaluation/phase186/fixture-demo.json`. Products A/B/C are invented and the keypair is ephemeral. No independent measured cooling ranking, no approved real air conditioner catalog and no production recommendation authorized.

## Explicit follow-up

Build a general, *field-specific* policy between Phase60/181 and this narrow pilot. The policy needs external expert review, exact variants and standards mapping before user-facing rankings. Request specific original source bytes when lawful access is required. Study source coverage and uncertainty; do not award arbitrary preference to higher rated capacity or conflate ENERGY STAR efficiency with independent in-room cooling effectiveness.
