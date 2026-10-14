# Product Evidence Engine — Phase 116: Function-first category intelligence
**Research and implementation summary — 11 October 2026**

## Design decision

A product category must not be represented as a flat list of appealing functions. It should be modeled through **intended goals → operating processes/mechanisms → observed results → failure modes**, with explicit contexts, evidence classes and independent source references. Crucially, merely having a mechanism (e.g. continuous roller rinsing) does **not** prove a higher level of stain removal or sanitation. Use direct original tests whenever available; keep mechanistic scientific background as reasoned indirect support, never as manufactured product measurements.

The category representation belongs to the query-neutral product knowledge layer; users' questions may choose goals/importance but must not rewrite original product facts or the category's scientific model. Model-stage and activation details allow periodic dock washing and continuously self-cleaning rollers to remain distinct, and allow modes/firmware/default wash intervals to be represented as conditional instead of universal.

## Implemented research prototype

- `src/phase116_category_function_model.ts`: typed reusable goal/mechanism/endpoint graph, `before`/`during`/`after` stages, continuous/periodic/etc. cadence, known vs unknown mechanism states, source provenance and independently measured endpoints. Pilot category definitions for robot floor cleaners, dishwashers and headphones.
- `tests/phase116_category_function_model.test.ts`: 31 targeted tests. No false microbial reduction from hot rinse or roller type; no claim of effective ANC from presence of ANC hardware; configurable cycle intervals; source and model integrity.
- **Added following user stress test:** `src/phase116_stain_outcome_semantics.ts` and `tests/phase116_stain_outcome_semantics.test.ts`: pure end-of-test effectiveness vs first-pass, fewest-pass and fastest-time results. Fourteen new tests; detailed protocol and authoritative editor sources are in `PHASE116-STAIN-OUTCOME-VS-EFFICIENCY-RESEARCH.md`.

This is a structural research prototype, not an approved overall consumer ranking. Existing complex temporal, semantic extraction, original-test provenance and query-neutrality components from the previous phases remain intact.

## Sources and method limits

- NIST, *Core Product Model for Representing Design Information*: https://www.nist.gov/publications/core-product-model-representing-design-information
- ISO 9241-11:2018 (context of use and user outcomes): https://www.iso.org/standard/63500.html
- IEC/ASTM 62885-6:2023 (wet hard-floor appliances, *robotic cleaners explicitly excluded*): https://webstore.iec.ch/en/publication/66770
- RTINGS robot test bench 1.1 original methodology: https://www.rtings.com/robot-vacuum/tests/changelogs/1-1
- Vacuum Wars original robot testing methodology: https://vacuumwars.com/how-vacuum-wars-tests-robot-vacuums/
- Vacuum Wars study of roller vs spinning-pad mops: https://vacuumwars.com/robot-vacuum-mop-systems/

Template structure alone cannot guarantee completeness or applicability. Human-reviewed category-goal protocols, empirical validation of outcome comparability, and automated full-source extraction on genuine reviews are still open research tasks. The software tests verify implementation invariants on constructed inputs, not accuracy on original live review ingestion or a deployed LLM.
