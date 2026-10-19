# S88 — Declarative property definitions used along the path: built, measured, and where they fail

**Roadmap step.** R3 (scientific knowledge consulted in reading and interpretation), consolidation R3-C. This is the
experimental continuation of S87c–S87e (owner correction, verbatim in `owner-s88-correction-2026-10-19.md`). R3 is
**not** closed by this report; §7 says what the results allow.

**Scope.**
- Shadow only. No operational module imports the new code; a test enforces this.
- No store migration.
- No ranking.
- Fresh pages were fetched under the standing internal research policy: robots-checked, with no reservations present on
  the pages. 32 requests were made in total, including robots and discovery.

**Sources consulted.**
- `docs/plans/s88-proposal-…md`, `s87e-…md` (§6, §8) and `s87d-…md`.
- Owner packages 05 (robot floor cleaners) and 08 (soundbars), supplement 01 only.
- `src/phase272_extraction_plan.ts`, `src/quantity_knowledge.ts` and `src/observation_model.ts`.

## 1. What was built

| Component | What it is | Maturity | Kind |
|---|---|---|---|
| `resources/property-definitions/property-definitions.v1.json` | The pd.2 knowledge data (details below) | implemented, shadow | vocabulary + inference knowledge |
| `src/property_definitions.ts` | The loader. It fails closed when a kind, metric, axis, source, state or relevance does not resolve. Tested: a wrong kind (`price_or_cost`) in pd.1 was caught. | implemented | — |
| `src/definition_interpreter.ts` | One interpreter that uses the same definition for four tasks (listed below) | implemented, shadow | inference |

**What pd.2 contains:**
- 28 shared properties and 20 condition dimensions.
- 4 category profiles: air purifiers, dishwashers, robot floor cleaners, soundbars.
- Each property and dimension records its form, quantity kind (from the quantity-knowledge pack), object of interest,
  object nouns, basis rule, surface terms, condition relevance (defining, influencing or irrelevant), lifecycle state and
  sources.

**The four tasks of the interpreter:**
- **Attribution:** the unit kind nominates candidate properties; a definition term in the label or context must support
  the choice; equal support chooses none; outside its profile, a property needs its object named.
- **Interpretation:** condition dimensions with their relevance. Structure comes from the S87b category-free principles
  (relations before objects); dimension, value and relevance come from the definitions. The basis is either stated
  (words, unit, or "per + run noun") or inferred as an indefinite null instantiation. Defining dimensions that are not
  stated are listed.
- **Evaluation:** Q1 comparability from the defining dimensions (`compareByDefinition`).
- **Reading:** plan measurements compiled from the definitions (`definitionPlanMeasurements`).

**G1 (one definition, four stages).** A test removes one definition and checks that reading, attribution, interpretation
(basis and relevance) and comparability all change. 7 S88 tests pass; the full suite has 4,876 passing.

## 2. Protocol

- Preregistration: `evaluation/s88/preregistration.json`.
- Freeze after three development reformulations: `freeze.json`.
- E4 definitions sealed before any page was fetched: `e4-definitions-freeze.json`.
- E4 protocol committed before annotation: `e4-protocol.json`.
- Two new blind Claude-agent references, each sealed by hash before scoring: `attribution-annotation-freeze.json` (472
  observations) and `e4-annotation-freeze.json` (248 values).
- First runs are committed unchanged. Every later run is labelled `after-*` or `fix1` and counts as tuned.

## 3. E1/E2 — S87b corpus (spent material; definitions not written for TVs, tumble dryers, dehumidifiers or air fryers)

**Check groups, first run** (`e1-check-firstrun.json`, `e2-check-firstrun.json`):

| Slot | Definitions | Comparison |
|---|---|---|
| Property attribution (154 reference properties) | 127 correct, 9 wrong, 18 abstained | unit kind only: 136 / 10 / 8 |
| False attribution (114 reference "none", 102 of them TV values) | **0** | unit kind only: **37** |
| Condition class (391) | 305 | S87b model 309 (4 broken by the layering) |
| Condition dimension (340 reference) | 247 correct, 31 wrong | — (no earlier mechanism assigns dimensions) |
| Basis against the S87b reference (268) | 232 (7 wrong non-none) | S87b model 225 |

**After fix1 (tuned, on these groups).** Three general corrections:
- object nouns gate generic terms;
- the head noun decides the dimension;
- the layering keeps the structural quantity kind.

Results:
- property wrong 9 → 2, false attributions still 0;
- dimension correct 247 → 272, wrong 31 → 6;
- condition class 309 (no item broken);
- basis 239 of 268, with 0 wrong non-none.

**Counterexample recorded.** Adding the robot and soundbar definitions first produced 37 false attributions on TVs:
- gamut "coverage" was attributed to robot floor coverage;
- "input lag" was attributed to audio latency.

The fix is a principle, not a word list: outside its profile, a property needs its object named.

**Reference conflict, not tuned away.** The S87b reference gives task durations the basis "per task". The S88 reference
gives them "none", because my annotation instruction said so. Both are reported.

## 4. E3 — reading on the 12 retained S80 pages (development material; S86b reference, S86d scorer)

| Plan given to the existing reader | Measured results persisted on the reviewed product | False persisted |
|---|---|---|
| taught plan | 66 | 40 |
| taught plan + S86c precision (best earlier) | **77** | **1** |
| measurements compiled from definitions | 51 | 22 |
| definitions + S86c precision | 62 | 6 |
| teaching ∪ definitions + precision (fix1) | 61 | 6 |

**Definitions do not yet read better than teaching.** Generic definition terms lose the category words the bundled
teaching carries (cooking tests, programme names). Air fryers have no profile and lose the most. Reading stays on the
taught plan. The definitions contribute at interpretation, not at reading.

## 5. E4 — unseen categories, fresh pages (held-out first run)

**Pages.** 20 pages from 6 publishers: robot floor cleaners from Vacuum Wars and TechRadar; soundbars from TechRadar,
What Hi-Fi, Trusted Reviews and Tom's Guide.

**Items.** 248 values: every quantity with a known unit in the page text.

**Definitions.** Written from owner packages 05 and 08 before any page was read.

| Arm | Correct / wrong / abstained of 69 reference properties | False attributions of 179 "none" | Conditions matched (64) | Basis correct (69) |
|---|---|---|---|---|
| **pd.2, first run** | **58 / 4 / 7** | **56** | 23 | 55 (5 wrong) |
| pd.1: development definitions only (transfer) | 2 / 5 / 62 | 8 | 0 | 5 |
| unit kind only | 55 / 3 / 11 | 54 | — | — |
| existing linkers | 0 coverage: no taught plan exists for these categories | — | — | — |

**What the first run shows:**
- **Category definitions written from a research package make the categories interpretable.** The shared development
  definitions alone recover 2 of 69.
- **The development rule "a profile licenses attribution by unit kind alone" does not generalise.** It attributed every
  length on a robot page as an obstacle height, and every Hz on a soundbar page (including HDMI refresh rates) as a
  frequency response. It looked right on the S87b corpus only because that corpus contains values already known to be
  results.
- **Tuned arm without the licence** (`e4-after-nolicense.json`): 41 correct, 2 wrong, 26 abstained, 13 false. Precision
  of the attributions it makes rises from 49% to 73%, at the cost of recall. Neither arm is yet good enough to feed advice.
- **Residual errors without the licence:** "years" accepted as a latency (no admissible unit scale in the definition);
  grams of water left accepted as a capacity (mass); "0% tangling" accepted as debris pickup.

**Reading gap found.** The 8 rtings pages yield no items. Their test results are rendered from embedded script JSON, and
the text reader sees 6 navigation blocks. This is a reading-stage gap, not addressed here.

> **Correction (2026-10-20, S89).** The diagnosis above is wrong. The 8 rtings pages declare `"triggered_paywall": true`
> and contain no test results at all, in the text or in any script. The gap is an access restriction, which PEE must never
> bypass, not a reader limitation. A census of the 20 S88 and 12 S80 pages found no measurement that exists only inside
> embedded data. The owner review of S88 relied on this wrong diagnosis.
> Report: `docs/plans/s89-learning-definitions-and-independent-check.md`.

## 6. What carries over, and what does not (lessons with their status)

| Lesson | Evidence | Status |
|---|---|---|
| Knowledge held as data with references to the QK pack transfers when it is precise: units → kinds → candidate properties | E2 check: 0 false attributions on 114; E4: 58/69 with pd.2 against 2/69 with shared definitions only | supported (one held-out run) |
| A property is a quality *of an object*: outside its profile the object must be named | removed 37 TV false attributions (spent) | supported on spent material; untested held-out |
| Unit kind is never enough on real pages, even inside a profile | E4 first run | supported (held-out counterexample) |
| Structural relations (comparison, procedure state) come before dimension typing | E1: layering 0 broken after fix1 | supported (spent) |
| Generic definition terms read worse than bundled teaching terms | E3 | supported (development) |
| Definitions need an admissible unit scale (latency in ms, not years) | E4 residual errors | proposed |

## 7. R3 status, and what the results allow

**Achieved:**
- G1 holds in code.
- **Attribution in unseen categories now exists:** before, no mechanism covered robot floor cleaners or soundbars. Its
  precision on real pages is not yet sufficient.
- On spent material, interpretation adds dimension, value and relevance without breaking the structural classes.

**Not achieved:**
- Reading is not improved (E3).
- E4 false attributions are not yet acceptable.
- Q2/Q3 and the end-to-end request path (C3/C4) were not run.
- Qualitative judgements and comparisons were not measured on a new reference.

So R3 stays open.

**Next experimental steps:**
- Admissible unit scales in the definitions.
- An "is this a result?" gate: the evidence role from document structure (S86c roles) placed before attribution, instead
  of the profile licence.
- Reading of embedded JSON.
- A second fresh wave to test the corrected mechanism held-out.

## 8. Files

**Public (counts only):** `evaluation/s88/*`.

**Private** (`private-eval/s88/`, copied to pee-knowledge):
- the annotation inputs and references;
- runs with text windows;
- the wave receipt.

Page bytes are never committed.
