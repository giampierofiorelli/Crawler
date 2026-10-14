# Product Evidence Engine — Phase198 Technical Report

**Date:** 2026-10-13  
**New cumulative version:** v5.22.0, built from the CRC-verified and unpacked `product-evidence-engine-v5.21-phase197.zip` (SHA-256 `5f5e7d13a7be8acc72aa8ff4c7fff5cf2c3e5f12e1522f5c6ee5254341a341ea`).

**Status:** Engineering prototype with verified **software** invariants. Not an independent validation of food expertise, product quality, programme accreditation, source originality or retail ranking. No machine has been automatically certified by PEE.

## Decision

The user's new requirement is an **additional criterion-specific outcome-confirmation layer**, NOT a product-category reputation table or endorsement booster. For a Neapolitan pizza oven, a suitable specialist baking assessment or properly scoped supplier programme may provide information beyond temperature stability and energy consumption. For coffee, a certified **filter** brewer must not be presented as validated for **Italian espresso**. For sushi tools, documented actual relevant Japanese-cuisine technique matters beyond metal hardness, but a Japanese-cooking personal credential does not itself certify a knife. Strong technical scores must never override missing or adverse performance on an essential user outcome. Where the goal does not require additional specialists, do not impose unnecessary research or distrust of technical tests.

## Existing interfaces checked and reused

- **Phase77/78/79:** confirmed user demand, boundary, evidence-gap and search continuation.
- **Phase191:** sparse source findings, exact variant and per-field original record references.
- **Phase192–195:** original-event and document lineage, Phase193 decision memory and no full editorial article retention. Phase198 neither resets nor overrides these systems.
- **Phase196:** multidimensional source-scoping and review-queue candidates, no publisher whitelist.
- **Phase197:** five search-stop states, criterion/protocol/condition checks, international search receipts and safety guardrails.
- **Phase182:** existing exact-variant research jobs are used in a **read-only bridge**; no second queue, no network access or ingestion privilege.

## Changed software

1. `src/phase198_specialist_outcome_validation.ts`, new, 272 lines:
   - `OutcomeNeed198`: reviewed `optional_corroboration` vs `essential_for_goal`, exact criterion/discipline/outcome and documented interpretation of user goal.
   - `Specialist198`: documented specific professional practice or evaluated sensory panel vs self-asserted/unverified competence. No nationality, passport or celebrity field; unfamiliar specialists are not excluded.
   - `PracticalOutcome198`: Phase197-rooted professional observation, reviewed operator participation, field protocol and conditions, screened commercial relationship, outcome and result. Controlled sensory panels demand evaluated panel competence.
   - `Recognition198`: formal product certification, specialist programme approval, professional endorsement, sponsorship/supplier and person credentials remain distinct. Only exact-variant, active, dated, programme-versioned, scope-and-registry-reviewed **product** entries with an official programme record are eligible as scoped *research annotations*. Registry statements are not externally authenticated by the code.
   - For matching specialist positive and negative events, groups deduplicate; a document that reproduces the same measurement event cannot create an extra independent event. The output is sorted and deterministic. A qualified conflicting result requests renewed investigation even if technical assessments supported that result previously.
   - Calls `assessSufficiency197` instead of duplicating it. Missing required specialist outcome stops `sufficient_bounded` but does not automatically condemn the product; an optional missing opinion does not. Existing `deferred_by_budget`, provisional and source-exhausted statuses persist.
   - `specialistJobHints198` references only existing Phase182 jobs and the Phase196 candidate matrix, exact category/variant and correct Phase191 field, including specialist publishers with no stored profile. It cannot create work or publish rankings.
2. `tests/phase198_specialist_outcome_validation.test.ts`: 59 authored/synthetic tests, spanning positive, negative, scope/version, cross-discipline, duplicate event, disclosure, expiry and noncompensation cases.
3. `docs/phase198/`: research source basis, original input research, test logs, predevelopment checkpoint and integration notes; package version bumped 5.21.0 → 5.22.0.

## Particularly important adversarial cases

- Practitioner trained in pizza baking vs person whose documented practice concerns another preparation. Citizenship cannot substitute for training.
- Japan MAFF culinary **person** certificate cannot be transformed into a knife **product** certificate.
- SCA home-brewer certification cannot be transferred to espresso; expired, suspended, future or unreviewed registries cannot grant specialist suitability.
- Conflict disclosure is reviewed rather than blanket banned; missing conflict evaluation cannot silently grant independent testing.
- Same experiment in different professional/technical documents is not an additional experiment. Positive professional evidence still gives *outcome coverage* when genuinely relevant to the result, even if tested alongside technical measurements.
- Low-evidence niche products are not given low performance scores. No special evidence needed for irrelevant categories.
- Safety/compatibility remain non-compensable. A specialist badge does not verify safety.

## Verified test execution

- TypeScript compile (`tsc -p tsconfig.json`): **PASS**, including a final targeted recheck.
- Phase198 targeted: **59/59 PASS**, `docs/phase198/test-logs/phase198-target.tap`.
- All compiled TypeScript regression shards: **3,348/3,348 PASS** across 13 shards (`docs/phase198/test-logs/shard01.log` … `shard13.log` and `regression-shards.json`). Shard12 also passed in isolated run. Shards executed in parallel bounded processes; direct rerun of final targeted build passed.
- Existing Python tests: **212 PASS** across companion (71), original-source (47), ingestion (21), evaluation (26), Phase95 (12), tests-python (35). Historical Python `ResourceWarning`s about open sqlite connections persist; these are not new failures. The initially attempted non-existent `phase96` discovery path failed at setup, was not a valid test group, and is recorded in `python-cumulative.log` for audit; all six **actual** prior groups completed.
- No real editorial original-source dataset, credential adjudication corpus, paired independent lab replicates, blinded human judge group or published purchase-outcome benchmark was measured. Therefore precision, recall, calibration, false-merger frequency, purchase impact and expert-assessor qualification accuracy are **NOT MEASURED**, not zero.

## Comparison with v5.21 Phase197

| Capability | v5.21 Phase197 | v5.22 Phase198 |
|---|---|---|
| Scoped criterion stopping | Implemented, advisory | Reused as baseline, not replaced |
| Documented domain expertise | Record note for cultural observation | Explicit practice/discipline/outcome check for practical validations |
| Personal qualification vs product certificate | Not represented separately | Separate typed records, non-interchangeable |
| Specialist programmes | Generic search hints | Exact scheme, model, version, status, validity, registry, method and disclosure annotations |
| Optional vs user-essential specialist corroboration | Not separated | Separate stopping impact |
| Shared test event vs additive specialist confirmation | Phase197 reviewed root counts | Root dedup plus indication of distinct roots versus instrumental claims |
| Unknown specialist and publisher | Accessible in exploratory search | Accessible, no whitelist or national stereotype |
| Automatic credential/document authentication | Not provided | **Still not provided** |
| Validated public ranking | Not authorized | **Still not authorized** |
| Automated multilingual reading | Not provided | **Still not provided** |

## Why no universal specialist bonus

Some technical criteria are already directly testable. An AVPN-like programme might add highly relevant task-specific evidence for Neapolitan pizza while offering no additional evidence for a different pizza type or device safety. An affiliation or sports/event sponsorship provides no product experiment by itself. Professional review of a sensory result must consider ingredient choice, operator method, repeatability and whether the expert has demonstrated the required discrimination, not just a job title. Commercial ties do not automatically void the whole editorial outlet, but must be assessed claim by claim.

## Grounding: primary URLs and what they support

1. **AVPN** approved electric ovens: https://www.pizzanapoletana.org/en/forni_elettrici_approvati — an association-managed programme scoped to genuine Neapolitan pizza, not a global quality-ranking benchmark.
2. **SCA** home brewing certified equipment: https://sca.coffee/certified-home-brewer — reported model-level third-party testing of home brewers, not Italian espresso validation.
3. **Japan MAFF** overseas Japanese-cuisine culinary skills programme: https://www.maff.go.jp/e/policies/market/cooking_skills.html — credentials for **people** in a specific cuisine, not for knives.
4. **ISO 8586:2023** https://www.iso.org/standard/76667.html — selection and training of sensory assessors.
5. **ISO 11132:2021** https://www.iso.org/standard/76669.html — quantitative descriptive panel performance/monitoring with defined exclusions.
6. **ISO/IEC 17065 summary** https://committee.iso.org/bodies.html — impartiality and processes of conformity bodies, not proof that a named programme is accredited.
7. **ISO attestations** https://committee.iso.org/attestations-of-conformity.html — differences between attestations, evaluation snapshots and controlled marks.
8. **W3C WAI** https://www.w3.org/WAI/test-evaluate/involving-users/ — evaluations with real users can complement conformance tests but should not be overgeneralized.
9. **W3C PROV-O** https://www.w3.org/TR/prov-o/ — provenance model separating agents, activities, entities and derivations; does not prove the truth of user-supplied lineage annotations.

These sources were checked against current public pages on 2026-10-13. They justify *representation and cautious research policy*, not empirical claims about PEE performance. Extended discussion (including sensory differences across cultures) is available in the user's preceding `PEE-RESEARCH-TASK-SPECIFIC-EXPERT-VALIDATION-2026-10-13.md`, copied into this cumulative release under `docs/phase198/RESEARCH-INPUT.md`.

## Still open and phase199 priority

- Independent original review/credential/registry validation and labels with multiple blinded qualified evaluators. A reviewer ID is not evidence the review happened outside synthetic test inputs.
- Data capture and timestamped refresh for programme registries, renewals and scoped standards, with lawful access and existing Phase193/195 custody/version memory.
- Detection of unknown yet excellent experts without relying on name, passport, awards or degree alone. Expert competence is task-specific and continuous, not a Boolean truth.
- Scientifically justified thresholds for material improvement in evidence sufficiency, demonstrable user benefit, inter-rater agreement, and regression-safe influence on actual ranking.
- End-to-end runtime wiring to production search orchestration, source ingestion and user-facing communication requires a later authorized increment. Phase198's bridge is **read-only**, not a completed production path.
