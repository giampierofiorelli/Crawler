# Phase253 technical report — connecting understanding to advice

**Date:** 2026-10-16. **Branch:** `claude/typescript-network-transport-test-1givnd`.
**Private store:** pee-knowledge `38495fe` (90 sources, 189 products, 2,385 declarations, 1,373 events).
**Full suite:** 4,405 tests pass, exit 0. **Development agent:** Claude only. No new dependencies; the ECC harness-audit
remains unavailable (missing `@iarna/toml`, not installed) and no score is claimed.

This report supersedes the Phase252 report as current status.

## Summary

Before Phase253 the advisory journey never called the decision layer. No ordinary request could produce a product
answer, and the stated quantities were lost.

PEE now answers a request end to end: purchase target, stated requirements, Phase177 snapshot, evidence eligibility,
`decideAdvice249`, then an unordered, cited shortlist with exclusions, unknowns, conflicts and limitations.

On the pre-registered first run (43 cases), the new path (N) beats the Phase252 path (P):

| Measure | P | N |
|---|---|---|
| Correct response type | 8 | 35 |
| Stated constraints recovered | 0/26 | 25/26 |
| Product checks agreeing with gold | 0/138 | 121/138 |
| Justified positive answers | 0 of 17 | 14 of 17 |
| Harmful answers | 0 | 0 |

The positives come from **synthetic requests on real retained evidence (T1)**, written by the same author as the
code. They are not held-out. The **new real requests (T2, n=16)** contained no request with a checkable limit. Real
buying questions with explicit limits are scarce in the lawful pool. The real-request evidence therefore shows safe
handling (out of scope, clarification, no harm), not positive advice.

## Commits

| Commit | Content |
|---|---|
| `4086850` | Stages 0–5: audit artifact, strict contract and scorer, purchase target, constraints, journey → decision |
| `c46ce18` | Stage 4: evidence-based typing of unknown sources (journaled, reversible) |
| `4ff6ebb`, `c0d8c70` | Stage 8 protocol and amendment a1, both registered before collection |
| `f13e1bf` | Sealed gold |
| `eac647d` | First-run results, unchanged |
| `771158e` | Development after the first run, plus the T3 control on frozen code |
| `0179027` | Stages 6–7: module inventory, teaching-package interface |
| `5c4081a` | Public/private correction of committed runs (see §9) |

## 1. Can PEE now produce a correct factual shortlist directly from an ordinary request?

**Yes, for registry categories with checkable declarations, when the request states a checkable limit.**

`adviseFromRequest253` (`src/phase253_request_advice.ts`) turns "I need an air fryer under £100" into a cited,
unordered shortlist. It does not re-ask the stated limit. It also lists:

- excluded products with the reason;
- products that could not be checked;
- source conflicts;
- performance needs as "Not checked";
- its limitations: declarations are not tests, the list is unordered, coverage is not the whole market.

First run (T1, 27 cases on real evidence):

- 17 gold positive cases: 14 positives, all correct;
- 20 included products, every one with full provenance;
- 0 wrong inclusions; 12 missed inclusions;
- 45 of 45 gold-unknown products kept unknown, none presented as meeting a requirement.

The 12 missed inclusions all came from widths written inside "20.7(W) x 28.4(D) x 33(H) cm" strings. Two of them
produced a **misleading justified negative** ("none of the 1 checked meets"), while 4–6 products fit.

After the first run, development on these spent cases added axis-labelled overall dimensions to the width, height and
depth checks (`axisValue249` in `src/phase249_decision.ts`); slot, box and bowl dimensions and unlabelled triples stay
unknown. With that change, T1 is 27/27 correct, 132/138 product checks agree, and 2 inclusions are missed. This is
development, not a first-run result.

## 2. How often does it identify the intended purchase?

The scorer counts the purchase target as correct (m1) when its kind (category / other / none / ambiguous) and its
category match the gold.

| Tier | First run, P | First run, N | Development, N |
|---|---|---|---|
| T1 | 26/27 | 26/27 | 27/27 |
| T2 | 5/16 | 5/16 | 5/16 |

The T2 score is low for two reasons:

- **Non-purchase questions get spurious targets.** Of the 16 T2 cases, 14 are electrical-DIY or cooking questions
  that do not ask to buy anything. N named spurious "other" targets ("they", "meaning") or picked a category
  mentioned only as context (`r07` "40 amp breaker … air fryer", `r13` immersion blender).
- **The responses were still right.** Out of scope or a question; never a product.

The development rules removed the spurious targets: pronouns end a phrase; which/what count only when they open the
question; gerund-led and "X of" titles are skipped. Context categories in questions that are not purchases are still
the main remaining weakness.

On the earlier spent sets the target stage changed decisions (development reruns, not held-out):

| Set | Before | After | Harmful before | Harmful after |
|---|---|---|---|---|
| Set 5 | 21/30 | 25/30 | 4 | 0 |
| Teaching set | 21 | 27 | 7 | 1 |
| Set 4 | 48/50 | 47/50 | 0 | 0 |

The set 4 loss is `u09`: an Indian "mixie" is not a known name, so the request asks rather than mapping to blenders.

## 3. Which quantities and constraints are understood without asking?

`extractConstraints253` (`src/phase253_request_constraints.ts`) reads bound, value, unit, property, what the
quantity describes (the product or the space for it), the span and the offsets.

**Stated without asking** when the bound and the property are explicit:

- capacity minimum (L, ml, qt);
- width, height and depth maximum, including "a space 57.5 cm wide";
- weight maximum;
- power minimum;
- battery life minimum;
- budget maximum (Phase125 reading, same currency only).

**Kept as candidates** (one confirmation question, never applied silently):

- negated statements ("does not need to be 5 litres");
- unbounded quantities ("5.8 qt");
- bare ranges ("2000-2400W": a development fix after a harmful positive appeared on a kettle label).

**Recorded as unmapped:** "no bigger than 3 litres" (no capacity maximum criterion) and the upper half of a range.

**Never constraints:** quantities describing something else ("a 2 kg chicken"). Power carries a rated-versus-output
caution; spaces carry a "clearances not added" caution.

First run: 25 of 26 gold constraints recovered, 1 false.

T3 control (993 human-labelled QueryNER queries, on frozen code):

- 1 stated constraint ("under 20 dollars", correct); 0 false stated;
- 4 candidates that would trigger a confirmation question, one of them silly ("f2.8l" lens read as 2.8 L).

Phase177 gains provenance `user_request_statement` (action `state_in_request`). It confirms a requirement only with
the sha256 of its verbatim span, and never overrides a user control. NLP candidates still cannot be confirmed.

## 4. Unreliable, conflicting or missing evidence

- **Missing or incomparable:** the product is listed as "could not be checked" with the reason. Foreign-currency
  prices are unknown, not failures.
- **Conflicts** (sources disagree by more than 2 %): unknown, reported under "conflicts". The retained evidence for
  these criteria holds no real conflict, so the conflict path is tested on the T1 fixture only (`Twin Fryer 60`).
- **Product lines with no own page:** ineligible.
- **Table-only products and unknown-type sources:** a caution on any inclusion.
- **Source type:**
  - 53 sources were registered `unknown`;
  - `proposeSourceTypes253` typed 19 as manufacturer (every declared brand is the host's name) and 1 as retailer
    (several foreign brands);
  - 33 stay unknown: 9 with one foreign brand (own label, distributor or retailer cannot be told apart), 24 with no
    brand declared;
  - unclassified declarations fell from 1,041 to 800;
  - the change is journaled and reversible (`classifySourceType253` / `reverseSourceClassification253`), with basis
    `heuristic_unverified`; operator-asserted types are never overwritten;
  - advice cites such sources as "source type inferred from its host and declared brand, not verified".

## 5. More justified positives without more harm?

**Yes, on this evidence.**

| Measure | P | N, first run | N, development |
|---|---|---|---|
| Justified positives | 0 | 14 | 17 |
| Harmful answers | 0 | 0 | 0 |
| Correct justified negatives (of 5) | 0 | 5 | 5 |
| Correct justified abstentions (of 1) | 1 | 1 | 1 |

Before the range fix, development produced one harmful positive: `r03` read a kettle label "2000-2400W" as a
stated power minimum. That defect was found, fixed generally and tested.

**Caveats.** The positives are T1 (same author, synthetic requests, real evidence). The T2 pool had no positive
case. A held-out real positive test is still missing (§10).

## 6. Existing modules reused

There is no second engine. The new modules call:

- `runJourney248`;
- `candidatesFromStore249` and `decideAdvice249` (all checks);
- Phase177 snapshot, extended with request provenance;
- Phase245 `canonicalUnit245` / `parseNumber245` and dimension values with axes;
- Phase125 `composeQuestion125` for budgets;
- the Phase246 store (journal, invalidation);
- Phase252 `applyTeaching252` / `CategoryTeaching252` for teaching packages.

`phase251-score.mjs` now refuses incomplete gold (exit 2) instead of scoring it silently; sets 4 and 5 reproduce
unchanged.

## 7. Capabilities still disconnected

Measured by V8 coverage (`docs/phase253/MODULE-INVENTORY.md`):

- 90 of 245 modules are import-reachable from the advice path;
- 33 are loaded;
- **11 execute**.

**Disconnected:**

- research execution (`phase182_gap_research_orchestrator`), which is the next link: `researchPlan` strings are
  produced but nothing runs them;
- source discovery (acquisition side by design);
- category cognition and function models (loaded, never called);
- need discovery (Phase56);
- headphone measurements and lab bridges (no data).

**Coverage gap:** the operational registry lacks `headphones` and `microwave_ovens`, although the store holds
checkable products in both. A request for them is answered "not a category PEE holds". Adopting the Phase252 teaching
for them is still an owner decision.

## 8. Scientific teaching packages processed

**None.** No package file was found in the repositories, the home directory or the private evaluation directory.

The interface exists:

- `src/phase253_teaching_package.ts` (`pee253.teaching-package.v1`): a strict validator and a compiler to
  `CategoryTeaching252`;
- `scripts/phase253-import-package.mjs`: validate-only by default; applying needs an explicit store copy.

Packages enter only as unreviewed hypotheses. Ranking fields and ranking language are refused, and the Phase252
budget applies.

**Reserved, untaught categories:** `rice_cookers`, `pressure_cookers`, `food_processors`, `steam_cookers`. They are
kept as generalisation controls; the expected packages (air fryers, dehumidifiers, coffee machines, coffee grinders)
do not touch them. `dehumidifiers` is not yet a registry category; a package would add it as a new taught category.

## 9. What still prevents autonomous research and independent ranking

- **Autonomy stops at the research plan.** Unknowns and unresolved needs become strings. No module executes them,
  admits new evidence and re-answers.
- **Ranking.**
  - Performance needs (crispiness, noise, evenness) need independent measurements; the store holds none for its
    products.
  - Ranking stays with the signed Phase180 path, which has no signed release here.
  - Specification shortlists are explicitly not rankings (`ordered:false`, `rankingAuthorized:false`).
- **Public/private incident.**
  - The first-run and development N runs were committed with retained declaration values (cited raw values and
    numbers in reasons) in `eac647d` and `771158e`. That breaks `pee249-factual-observations-v1`.
  - `5c4081a` replaces them with public forms; the scores are identical.
  - The values remain in Git history of the pushed branch. Rewriting pushed history is an owner decision.
  - The arms script now writes only the public form to the repository.

## 10. Next highest-value gaps

1. **A held-out real positive test.** Collect real requests that state a checkable limit (needs a new lawful source;
   Stack Exchange is exhausted for this) and run N against them unchanged.
2. **Connect the research loop.** Feed `unresolved`, unknown and conflict reasons to
   `phase182_gap_research_orchestrator` as research tasks. Lawfully acquired declarations then re-enter through the
   store, and the request is answered again.
3. **Registry coverage decision** for `headphones` and `microwave_ovens` (owner), then a fresh first run.
4. **Context categories in questions that are not purchases** (`r07`, `r13`): add a purchase-intent signal rather
   than vocabulary.
5. **Declarations that could exclude but stay unknown.** Declared ranges ("1000-1200W" below a 2000 W minimum) and
   capacities in product names ("700ml") could exclude a product; today they stay unknown. This is safe but loses
   exclusions.
6. **Reconcile the two quantity parsers** (`phase166` and `phase253_request_constraints`).
7. **Owner teaching packages**: validate, apply to an evaluation copy, then run a pre-registered first run against
   the untaught reserved categories.

## Evaluation integrity

- Protocol and amendment were registered before collection, and the gold was sealed before the first run.
- First-run results were committed unchanged; their redaction (§9) does not change any score.
- T1 is never reported as held-out.
- The Phase253 set is now spent; every later change is labelled development.
- Gold is developer gold (same author as the code) for T1 and T2; T3 is human-labelled but measures only false
  constraints.
