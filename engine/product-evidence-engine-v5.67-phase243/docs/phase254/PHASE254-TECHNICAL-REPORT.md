# Phase254 technical report — focused research-gap bridge

**Date:** 2026-10-16. **Branch:** `claude/typescript-network-transport-test-1givnd`.
**Commits:** `13d80ce` (gold, sealed before the run), `f435e56` (bridge, tests, first run).
**Full suite:** 4,409 tests pass, exit 0. **Private store:** pee-knowledge `38495fe`, verified, unchanged (the bridge
writes nothing).

## What was built

When `adviseFromRequest253` cannot establish something, PEE now records it as a typed research need. Each need is
attributed to a category, a criterion and the exact product, deduplicated across requests and prioritised within a
budget.

| Piece | Change |
|---|---|
| `src/phase249_decision.ts` | Every criterion check carries a machine `code`: `no_declaration`, `not_comparable`, `sources_disagree`, `upper_bound_only`, `identity_unreviewed`, … Downstream code no longer parses reason text. |
| `src/phase253_advice_contract.ts`, `phase253_request_advice.ts` | `Advice253.researchInputs`: stated and pending criteria, unresolved needs, performance needs, per-product outcomes and codes, ineligible products. Keys and codes only, no declared values. Advice scores are identical to Phase253 development. |
| `src/phase182_gap_research_orchestrator.ts` | `researchJobFromGap182` extracted from `planResearchGaps182` with behaviour unchanged (Phase182 29/29 and Phase183 37/37 tests pass). A need can show the exact Phase182 job it would become. |
| `src/phase254_research_needs.ts` | `researchNeedsFromAdvice254` and `collectResearchNeeds254`, schema `pee254.research-needs.v1` (described below). |
| `scripts/phase254-research-needs.mjs` | Runs advice and needs on a store copy and scores them against gold. The output holds ids and criteria only. |

### The needs schema (`pee254.research-needs.v1`)

**Destinations:**

- `research`: new lawful evidence would close it;
- `user_clarification`: only the user can close it;
- `reextraction`: retained evidence holds it but could not be compared;
- `not_actionable`: with a reason (another currency, product line).

**Fields:**

- research needs carry a `ResearchGap181` and the Phase182 job preview;
- performance needs become one independent-test need per shortlisted product, never inferred from declarations;
- products already decided (meets or fails) raise no need;
- clarifications stay per request; research needs merge across requests;
- research is ordered conflicts, missing declarations, identity, independent tests; volatile prices come last;
- a budget applies (default 20; the overflow is `omitted_by_budget`);
- every output carries `planningOnly`, `rankingAuthorized:false`, `evidenceAdmitted:false` and
  `sourcePermissionsGranted:false`.

## Trust boundary (verified before implementation)

`planResearchGaps182` accepts only a `DynamicDecision181`. Per-product and per-criterion gaps exist only when
`dynamicKnowledgeAnswer181` has verified a **signed** catalog; without one it yields a single category-level
`no_catalog` gap.

Two facts make this boundary easy to cross by accident:

- `planResearchGaps182` checks the decision's shape, not the signature;
- a hand-built object would pass it.

PEE has no signed catalog. The bridge therefore constructs no decision and calls no planner. Every research need is
`pending_authorization` with the reason recorded, and `phase182.eligible` is false. Its preview is computed by the
same function Phase182 uses, so a future phase holding an authorised decision will produce the same job ids.

## Measured results

**T1 tests** (fixture, 4 tests, written first):

- missing declarations and conflicts are attributed to the exact product and criterion;
- clarifications are never research;
- performance needs become tests of shortlisted products only;
- needs merge across requests, the budget applies, and advice is not modified;
- a Phase182 plan still refuses a non-authorised decision.

**Real retained products** (14 requests from the spent Phase253 T1 set; gold by the code author from raw
declarations, sealed before the run; not held-out):

| Measure | Result |
|---|---|
| Correct needs | 32 of 34 |
| Missed needs | 0 |
| False needs | 1 |
| Wrong destination | 2 |
| Clarification sent to research, or research to clarification | 0 |
| Product, criterion and category attribution (incl. job preview) | 33 / 33 |
| Duplicates merged across requests | 2 |
| Research needs | 28 (20 within budget, 8 `omitted_by_budget`) |
| Clarifications / reextraction / not actionable | 2 / 1 / 2 |
| Needs eligible for Phase182 | 0 (correct: no signed decision) |
| Ranking or evidence flags changed | none |

**All three errors have one cause.** A value a person can read in retained evidence is coded `no_declaration` by
`decideAdvice249`:

- "1500W" in the name "Commercial Blender 2L 1500W";
- "700ml" in a kettle name;
- a dimension text without a unit.

The bridge files these as new research instead of reextraction. The blender case was also missing from my gold
(I assumed the product was already included), so it is scored as false.

## Limitations

- **Gold.** Developer gold on spent T1 requests; useful for attribution checks, not a held-out estimate.
- **Readable values.** Values in product names and unit-less texts are not distinguished from absent declarations
  (above).
- **No research is executed.** Nothing is fetched, planned or admitted. Autonomous research does not work yet: the
  needs are inputs for it.
- **No authorised entry path into Phase182.** That requires a signed Phase181 catalog, or a new owner-approved
  authority for research planning that is not ranking. That design is not attempted here.

## Use by a future research-execution phase

`pee254.research-needs.v1` is the input contract. Each queued need has:

- a stable `needId`;
- an exact product identity (`productId`, key basis, declared model, identity state);
- a criterion;
- a bounded `ResearchGap181`;
- the Phase182 job it maps to (`exact_variant_source_research`, `independent_review`, `category_research`).

`evaluation/phase254/research-needs-firstrun.json` is a worked example (ids and criteria only).
