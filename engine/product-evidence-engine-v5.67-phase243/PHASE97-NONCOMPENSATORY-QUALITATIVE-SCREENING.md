# Product Evidence Engine — Phase 97
## Non-compensatory screening based on independent measurements and qualitative original tests

**Date:** 11 October 2026  
**Cumulative version:** `4.21.0`, based on the complete v4.20 / Phase96 source tree  
**Status:** Executable, tested **research-only** module. No live review acquisition validated. No production-ranking or storefront integration.

## Executive result

The Phase61 contextual functional suitability evaluator and the Phase96 original-professional-test qualitative evaluator now feed one **non-compensatory, per-exact-product eligibility screen**: `src/phase97_noncompensatory_qualitative_gate.ts`.

A supported failure of a confirmed essential user requirement cannot be offset by excellent results on other aspects, overall reviewer stars, commercial placement, manufacturer advertising, or prices. At the same time, a negative assertion is **not** automatically a product-level veto. Original source, reviewer methods, exact variant and use context must be checked; conflicting evidence and incompletely tested essential requirements hold the decision instead of being silently scored as zero.

The implementation makes no calibrated confidence scores, probabilities, universal weights, winner or public purchase recommendations.

## Actual operations and definitions

The public-facing analogy is a suitability *screen*, **not a universal rating**. Phase97 consumes the already-existing output from Phase61 and the original-test claim/semantic-review schema from Phase96:

```
Confirmed use-case + original independent measurements + technical declarations
                     ↓ (Phase61 existing evaluation)
ContextualFunctionalResult for the two exact variants
                     +
Bounded qualitative claims with exact original-test/source/span hashes
                     ↓ (Phase96 existing assessQualitativeNeeds)
Reviewed, context-matched positive/negative/descriptive/contradictory implications
                     +
A separately documented user-hard-constraint assessment (where applicable)
                     ↓ (Phase97)
per-variant: provisionally_excluded | hold_for_adjudication |
             conditional_comparison_only
```

**`provisionally_excluded`** is returned for:

- A Phase61 original independent measurement whose **publisher-reported expanded interval** fails a properly documented **essential** user threshold under the reviewed test conditions; or
- A direct, source-anchored, separately semantically reviewed and method-reviewed hands-on professional observation that a *distinct* assessor has subsequently judged incompatible with the **confirmed non-negotiable** user requirement. Its original reviewer method, context, test identity and source hash must agree; no contradictory accepted finding for that criterion may be present. This is a documentary **research screening exclusion**, **not a signed operational approval**.

**`hold_for_adjudication`** applies to a potentially important adverse finding without the additional adjudication, apparently conflicting original tests, an unconfirmed user requirement, a manufacturer-only structural mismatch, or incomplete essential evidence. The gate does **not** label an untested need as product failure.

**`conditional_comparison_only`** means no detected essential exclusion/hold *among the reviewed inputs*. It does **not** mean that every possible defect has been ruled out or that a scientifically established winner exists. Important but nonessential drawbacks remain visible and are not flattened into a score.

### Example: entirely fictional

- Headphones A: independently tested audio quality is very good, but a tester directly reports severe discomfort after long use. The person requires eight-hour wear without that adverse effect.
- If the negative claim has passed a semantic/method review **but not** an independent determination that it breaches this user's hard requirement: **hold for adjudication**.
- If that determination is documented by a second declared assessor (later in time), the use-context matches, and no contradictory accepted test exists: **provisional exclusion**. Excellent audio cannot reverse it.
- If the first reviewer's context was short wearing or the source/method is uncertain: **do not infer a veto**.
- For someone to whom eight-hour wear is irrelevant, the same observation is a contextual drawback, not an automatic exclusion.

### Source and decision trace

Each reason includes the category/need ID, origin lane, failure type, original test IDs and review-source URLs where qualitative evidence supports the result; numeric results include the Phase61 `sourceRecordId` when available. No full review passage, copied article, original HTML, inferred numeric score or customer review star average is emitted by this module.

No unsupported interpolation is made between tests with different methods or product variants. The existing acquisition rights checks and provenance quarantine stay upstream and intact.

## Files and API

- `src/phase97_noncompensatory_qualitative_gate.ts`: `screenNonCompensatoryEvidence` (accepts a separately computed Phase61 result) and `evaluateNonCompensatorySuitability` (runs the **actual Phase61 evaluator** before combining the qualitative observations).
- `tests/phase97_noncompensatory_qualitative_gate.test.ts`: contextual, negative, contradictory, missing-data, mixed qualitative/numeric, mistaken-product, forged-attestation and complete Phase61 integration tests.
- `package.json`: version `4.21.0`, `npm run test:phase97`.
- `audit/phase97/`: actual focused, sharded mainline, companion and Python/regression/release logs.

**Example invocation:**

```ts
import {evaluateNonCompensatorySuitability} from './src/phase97_noncompensatory_qualitative_gate.js';

const result = evaluateNonCompensatorySuitability({
  functionalInput,         // existing Phase61 real input and genuine upstream validators
  qualitativeByVariant,   // quarantined original professional findings and review receipts
  adjudications            // separate documentary hard-constraint decisions, or []
});
// result.variants[i].outcome is RESEARCH ONLY; no winner or public ranking.
```

### Safeguards and known limitations

- Phase96's `ReviewEvidenceApproval` and this phase's `HardConstraintAdjudication` are *documentary fields*, not cryptographically authenticated human signatures. The new gate insists on a different declared assessor and a later timestamp but cannot prove human identity. Actual Phase92/93 policy and reviewer authorization integration is still required before deploying adjudicated exclusions.
- The assessor's `confirmedUserRequirementReference` must be resolved against an authenticated record of the user's confirmed hard requirement in future integration. Here the Phase61 `needsConfirmed` result and Phase96 `avoidAdverseFinding` flag are enforced, while the reference string is *only structurally checked*. This is a known trust gap, not hidden verification.
- Phase96 proposals remain human/method-reviewed research observations; production-calibrated autonomous extraction from real professional review sites and multi-category blinded evaluation are not yet established.
- This phase does not change the `src/launch_rank.ts` synthetic legacy launch ranker, public launch artifact, commerce links, price restrictions, web reader, source-rights rules, market watchdog, or original-test lineage.
- An essential tested failure is shown as **provisional** under Phase61's documentary source permissions and lab-method assumptions. The observed testing protocol may not match every real-world condition.
- Findings from the same original test are not counted as independent votes. A conflict holds; it does not get averaged away. A professional's individual comfort experience must not be projected onto all users.
- A conditional comparison outcome **does not certify complete data coverage**; missing evidence must be tracked upstream via Phase61 and source-coverage modules.
- No evidence of real-world accuracy or benefit to consumer decisions is claimed from synthetic test totals.

## Executed verification

| Suite | Passed | Nature |
|---|---:|---|
| TypeScript/JavaScript five bounded shards | **685** | All existing mainline test files + 19 Phase97 cases |
| Focused Phase97 tests | **19** | Also included within the 685; do not count twice |
| Companion Python | 60 | Legacy HTML strategy tests |
| Companion Node | 16 | Legacy integration tests |
| Primary original sources Python | 47 | Legacy ingestion & parser verification |
| Ingestion Python | 21 | Legacy ingestion |
| Evaluation Python | 26 | Phase83–84 and related |
| Launch tests | 4 | Existing public isolated launch behavior |
| Release tests | 3 | Existing launch distribution checks |
| **Total across distinct completed suites** | **862** | Research/controlled fixtures; not live extraction or human accuracy |

All results are from actually executed suite logs, included in `audit/phase97/`. The 19 focused Phase97 assertions are a subset of 685, not an extra 19. No permission is inferred from a passing software test.

## Relevant methodological references (with exact links)

- **Phase61 original research baseline:** `src/contextual_functional_suitability.ts` and prior `PRODUCT-EVIDENCE-ENGINE-PHASE61-FUNCTIONAL-SUITABILITY.md`; confirmed essential need and non-compensatory flag already present in the project, not invented in Phase97.
- **Phase96 original research baseline:** `PHASE96-QUALITATIVE-EVIDENCE-RESEARCH-AND-IMPLEMENTATION.md`, particularly source-anchoring, independent review, use-context matching and conflict treatment.
- **ISPOR MCDA Good Practices Report 1** (Thokala et al., 2016): explicit decision criteria and trade-offs; not a consumer-review veto algorithm. https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---an-introduction
- **ISPOR MCDA Good Practices Report 2** (Marsh et al., 2016): explicit implementation/validation and uncertainty; not a calibrated score for headphones. https://www.ispor.org/heor-resources/good-practices/article/multiple-criteria-decision-analysis-for-health-care-decision-making---emerging-good-practices
- **Cochrane qualitative evidence synthesis, chapter 21:** consider context, methodological limitations and fit before treating qualitative findings as decision support. Transfer from health research to professional product reviews is **methodological inspiration**. https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-21
- **GRADE-CERQual, Lewin et al. (2015):** methodological limitations, coherence, adequacy and relevance. No healthcare confidence grade is applied to consumer testing. https://doi.org/10.1371/journal.pmed.1001895
- **Baymard user observation:** 53% of users *in its user-study setting* sought negative product reviews. This motivates exposing drawbacks but does not validate a veto threshold or measure accuracy. https://baymard.com/research-articles/respond-to-negative-user-reviews

## Next research milestone

Validate and authenticate the two-level review/adjudication workflow using the existing Phase92/93 signed authorization policy; bind confirmed user hard-requirement receipts to each adjudication; build a blinded reference set of authentic original professional tests (including unscored adverse observations) and evaluate wrongful exclusions, missed disqualifying defects, unresolved conflicts, and missing-evidence decisions. **Only then** consider a reviewed gateway into published recommendations. Acquisition must remain in-house, source-specific, reusable and use a local model only as a candidate proposer where needed.
