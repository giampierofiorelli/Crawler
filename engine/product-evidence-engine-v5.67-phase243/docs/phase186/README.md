# Phase 186 — Evidence classes and preliminary specification-based suitability

English-first, web-first Product Evidence Engine. Phase186 extends rather than replaces the source separations of Phases 59/60/169–171/181/183–185.

## Decision
Specifications matter, but *evidence tier is not a percentage weight*. A standardized, certified capacity can decide a task-specific feasibility screen when independent comparative reviews are absent. A manufacturer's capacity alone can suggest a **provisional** match. Comparable, certified CEER can justify an energy-efficiency ordering **only within correctly sized window units under the same protocol**. None of these qualifies as a measured whole-product quality ranking.

Official technical guidance: https://www.energystar.gov/products/room_air_conditioners/key_product_criteria ; https://www.energystar.gov/most-efficient/me-certified-room-ac/results?is_most_efficient_filter=Most+Efficient ; https://www.energy.gov/cmei/femp/purchasing-energy-efficient-room-air-conditioners . Consumer Reports describes separate climate-chamber cooling, temperature-hold and noise tests: https://www.consumerreports.org/cro/air-conditioners/buying-guide.htm . EPA ENERGY STAR room AC certification program: https://www.energystar.gov/sites/default/files/ENERGY%20STAR%20Version%204.0%20Room%20Air%20Conditioners%20Program%20Requirements.pdf . **The exact test protocol and specification version must be checked for the particular product and jurisdiction.**

## Implemented
`src/phase186_tiered_specification_suitability.ts` consumes a signed, externally reviewed *partial* exact-product technical catalog (never a precomputed rank) with a reviewed sizing policy. It screens a narrowly scoped US window room air conditioner for a user-confirmed room size under uncomplicated default conditions. It yields certified nominal-capacity matches, separate manufacturer-only provisional matches, oversize/undersize or missing/conflicting candidates, and optionally a CEER-only comparison. Records include exact variant, source tier, original URL, document digest and protocol version. Duplicates, conflicts, bad units, incompatible protocols and tampered signatures fail closed. The source or review assertions are NOT independently authenticated by the code alone.

The sizing band in the test fixture (300–350 sq ft -> nominal 8,000 Btu/h) reflects a narrow ENERGY STAR illustrative guide case, NOT a general heat-load calculation. The pilot deliberately abstains for unknown sun exposure, non-8ft ceilings, additional heat gains and out-of-range room sizes. The implementation does **not** mix portable ASHRAE labels/SACC figures with window unit ratings. Manufacturer documentation is displayed in a separate provisional tier when capacity fits; it is not secretly converted to certified evidence. Missing CEER does not mean bad efficiency; missing professional tests do not imply low performance.

## Hard limits
- **No actual air-conditioner ranking released**: every test product and signing authority is fictional. No source was acquired or reviewed by PEE's runtime in this phase.
- Only one confirmed product family, market and simplified sizing profile is supported, no full HVAC or solar/occupancy load model.
- Certified or registered observations do not establish measured cooling speed, noise, reliability, installation compatibility, cost or shopper suitability for more complex needs.
- A reviewer signature guarantees only that a configured key signed the same structured bytes. Rights, source origin, equipment identity and scientific review remain external duties.
- Phase181 continues to govern its signed independent-test dynamic scoring route; Phase186 adds a **conditional, dimension-specific comparison**, not a bypass to publish an overall score.
- Before production integration, define a vetted market coverage protocol, verified source-byte custody, certificate issuer authority, field-level admissibility, category policy and independent evaluation.

## Reproduction
Run `npm run test:phase186`. No new dependencies, no model weights and no old code deletion.
