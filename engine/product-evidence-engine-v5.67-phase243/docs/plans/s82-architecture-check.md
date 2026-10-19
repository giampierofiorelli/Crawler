# S82 — Architectural check inside R3 (owner review of S81, 2026-10-19)

**Roadmap step.** R3, still current; a check inside it, not a new phase. Owner review, verbatim:
`.claude/skills/pee-guided-learning/references/owner-r3-architecture-check-2026-10-19.md`. It continues
`docs/plans/s81-knowledge-operational.md`.

**Anti-drift checklist.**
1. **Step:** R3.
2. **Kind:** inference and integration.
   - Two condition axes were added as a reversible overlay: vocabulary taken from the reader's own patterns, disclosed below.
   - Five procedure nouns are excluded from "untyped" words.
3. **Level and tier:** L2–L3 (T1 batteries over the real teaching; T2 checks on the store's real rows and on the spent S80 pages).
4. **Unseen data:** none independent; see §6.
5. **Complexity:** see §5.
6. **Negation:** every absence is closed over the record. The audit in §2 lists where it is not, on the user path.
7. **Shadow only:** no public authorisation changed. D28 is design and experimental verification only, as authorised.
8. **First runs:** committed unchanged.

## 1. Where the same thing is interpreted by several algorithms (census)

The census was done by three read-only searches over `src/` and the rule files.

**Relations** (`measured_by`, `not_sufficient_for`, `requires_condition`, sufficiency) have 12 readers.

| Relation reading | Interpretations | Classification |
|---|---|---|
| Does `measured_by` establish the outcome? | Any `measured_by` establishes (ra.1, `goalAssessment269.relevantMeasures` on the user path, the Phase272 plan, Phase247 priorities, Phase272 research); stored sufficiency `established` only (ra.2); graded direct / partial / unverified (knowledge_link); support grade only, no sufficiency (Phase248 journey, on the user path) | ra.2 and knowledge_link are **fundamental**. ra.1 is **superseded but kept as a restriction** (owner S79). The others are **provisional or duplicate** readings that predate S78. |
| Scope of `requires_condition` | **Pooled per need**: ra.1, `goalAssessment269.requiredConditions` and through it `comparativeEvidence271` (user-visible "does not record X"). **Per measurement**: ra.2, the statement text, knowledge_link. | Pooled reading: **superseded, still on the user path** (duplicate). |
| Contested sufficiency | ra.2: its own refusal reason. knowledge_link: same as unverified. | Minor duplicate. |
| A measurement that is both `measured_by` and `not_sufficient_for` the same outcome | ra.1/ra.2: the proxy wins. knowledge_link: direct evidence outranks indirect. | **Conflict.** Teaching never holds both today; reported. |
| `attr:` proxies | Five different readings: underscore ids in advice, normalised names in knowledge_link, word bags in the plan, all `attr:` kinds in the journey, dropped in `compileTo116` | Duplicate. |

**Evidence classes** (declaration vs test).
- The same source type is mapped to roles three or four times (`declarationRole246`, `reportedBy265`, `categoryBrain246.roleOf`, display labels).
- Reclassifying a source rewrites only one of these mappings.
- "Test vs declaration" in tables is decided by five readers (226, 1D2, 1E, 1G, WD). Only Phase226 is on the ingestion path.
- Prose first-hand tests are decided by four regex sets, and the qualitative basis by three more.

**Quantity kind.**
- Sound has four incompatible names: `noise`, `sound`, `sound_pressure_level` for every dB, and the quantity knowledge's pressure/power pair.
- dBA is handled three ways.
- There are at least seven canonical unit tables.
- The advice path types the request's quantities two ways (Phase253 constraints and the quantity knowledge).
- The measurand of a stored test is set in three unrelated places (226 headers, the 268 protocol unit, the 271 hard-coded map). None of them uses the quantity knowledge.

**Test conditions.**
- About six vocabularies:
  - Phase225 codes;
  - Phase268 protocol fields;
  - Phase270 codes;
  - Phase271's code map;
  - teaching condition concepts;
  - quantity-knowledge axes;
  - plus 1G, 1E and Phase245 setting regexes and acquired `acq_*` axes.
- Before S82, no module translated one into another. The reader's codes never reached the reasoning (D27).

**Superseded or unreachable:**
- the Phase145/166 unit bridges;
- `spec_test_evidence.ts` (deprecated, Phase 60);
- phase121/185 evidence classes;
- `linkToMeasure272` (kept only for plan identity);
- the plan's `decisionEvidence` (nothing consumes it);
- `planConditionIds272` (discarded at screening);
- the dead deduplication in `acquireConditionAxes` (`qk.axes.has('acq_…')` is never true).

## 2. "Condition not documented ≠ condition different": audit across inferences

| Place | Before | Now |
|---|---|---|
| QK `compare` F10b: two conditions named differently, relation unknown (sleep vs speed 1) | verdict `not_comparable` (the reason already said "not shown equal") | **kr.4**: `comparable_conditions_unestablished` (rules.v3 kept and reproduced in a test). Shadow consumers only. |
| knowledge_link `comparable` | passed QK's verdict through; dropped "within one presented test" | QK conflation removed at the source; the scope is kept (`scope: within_one_presented_test`) |
| knowledge_link identification (link program) | a candidate fixing a condition the record does not state was excluded: an absence decided identity (an energy reading with no load became cooking-task energy; a water reading with no programme became litres per workload) | **Unsettled** (rules LU1–LU3, L26b) when the remaining candidate is no better supported; the deciding axis is reported |
| knowledge_link condition shown by axis | an axis named among several components showed the whole condition (the S81 held-back over-claim) | **whole-condition test** (residue of the statement); enumerated values of the axis recognised from the teaching |
| knowledge_link verdict with no taught requirement | "required_conditions_equal" | `no_taught_requirement` |
| Phase253 ra.1/ra.2 | absent `conditionsMet` refuses as `conditions_not_met` | **unchanged, reported**: the refusal is right, its name says "not met" for "not shown"; `conditionsMet` is never derived (D28) |
| Phase271 comparative evidence | `comparable_with_unmet_conditions`, `conditionsMissing`; an empty condition list gives `comparable`; uncoded `compartments_in_use` always "missing" | **unchanged, reported** (user-visible text) |
| Phase268 | `compartments:'whole_appliance'` never enforced (absent → met); "30 min" read as duration not stated | **unchanged, reported** (owner policy) |
| Phase225 reader | `/\bempty\b/` and `/\bpreheat/` without negation ("empty the basket", "no preheat needed") | **unchanged, reported** (operational reader) |
| link-rules E27 `condition_clash` | operating axes with value lists count as closed (sleep vs standby "documented incompatible" within one product's set) while QK `compare` does not | **reported**; within one product the reading is defensible, across products it is not |

**Two defects in S81's own mechanism, found and fixed here:**
- `programme_identity` was typed as a **product-identity** condition, because its name contains "identity". The identity pattern is now "variant" or "model" only.
- The duplicated check of axes named by a requirement. The same requirement was checked twice: as a condition concept, and as the measurement's `requires_axis`. One check now passes through the condition (rule EV1).

## 3. D27: the existing path, extended minimally

- **No new layer.** The reader's codes are declared, as data, as values of quantity-knowledge condition axes (`resources/quantity-knowledge/reader-conditions.v1.json`).
- **Reversible overlay.** The axes are added as an overlay (`withReaderConditions`), the way R3 adds acquired axes; the default pack and every other reader are unchanged.
- **Only two axes.** Only `load` and `compartments` are added, the two the teaching names. Their value terms are the reader's own patterns (Phase225 `ALL_C`, `ONE_C`, "empty").
- **Unmapped codes stay unmapped, with reasons:** setpoint, one-hour duration, from cold, preheat, power meter, block provenance.

What a code then concludes comes from the teaching:
- the empty-run measurement fixes an empty load (its name), so a recorded empty load identifies it;
- the cooking-task measurement requires the compartments in use, so a recorded compartment code shows that condition whole;
- the food-load condition names more than a load, so an empty-load code shows it only in part.

**On the store's 12 real operational rows** (`evaluation/s81/s82-store-rows-*.json`):

| | S81 (kr81.2) | S82 (kr82.1) |
|---|---|---|
| Energy rows identified | 0 of 8 | **4 of 8** as empty-run energy (they record an empty load); 4 stay ambiguous (no load recorded) |
| What the knowledge concludes for them | nothing | indirect indicator only, for low energy use and for cooking results |
| Phase268 (coded protocol) | 3 validated as an empty-run partial comparison | same 3; the knowledge reaches the same scientific conclusion from the teaching, and identifies a 4th row that Phase268 rejects on publisher policy (identity and source policy stay separate) |

## 4. D28: conditions met, derived from the records (shadow)

`conditionsMetFromRecords` derives which conditions a catalog dimension meets.
- A required condition is met only when **every** test record of the dimension shows it.
- A declared condition the records do not show is reported as unsupported.
- A condition shown but not declared is reported too.
- Nothing reads it for ranking (`rankingInput:false`).

The real catalog (Phase268 empty-run energy) has no taught requirement, so on real data there is nothing to derive.
The mechanism is verified only on the S82 battery and tests. Before any use in ranking, the owner decides whether
ra.2 reads derived instead of declared conditions.

## 5. Ablations and results

**S82 battery** (`evaluation/s81/battery-s82.json`, 19 units). Written and sealed before any S82 code (`6e9aa8e`); each arm run once, first runs committed unchanged.

| Arm | Correct | Over-claims | Unjustified abstentions |
|---|---|---|---|
| pre-S81 code + store verdicts (73199f8) | 7 | 10 | 2 |
| S81 kr81.2 (b952ddf) | 12 | 4 | 3 |
| **S82 kr82.1 (a3785e9)** | **19** | 0 | 0 |
| S82 without the reader-condition axes | 16 | 0 | 3 |
| S82 without the taught conditions | 6 | 8 | 5 |
| S82 without the sufficiency verdicts | 17 | 0 | 2 |
| S82 without the proxies | 19 | 0 | 0 (no proxy case in this battery) |

Removing the taught requirements turns 8 units into over-claims. Removing the reader axes leaves the reader's
records unreadable: the 3 reader-condition cases regress.

**Regression checks on spent batteries** (not verification):

| Battery | S81 | S82 |
|---|---|---|
| Development | 60/65, 0 over-claims | 60/65, 0 over-claims |
| S81 held-back | 51/55, 1 over-claim | 53/55, 0 over-claims (the dishwasher over-claim is gone) |

**Spent S80 pages, S81 → S82** (`real-census-s80pages-kr821.json`):
- 21 values change only in identification, with the deciding axis named:
  - 15 go from linked to "ambiguous". Five dishwasher water readings were attributed to "litres per completed workload" only because they do not state the eco programme. Ten CADR values without a fan setting no longer exclude the sleep-mode measurement.
  - 6 dishwasher energy readings that were already ambiguous keep the EU-label candidate, which S81 excluded for an unstated programme.
- No strong conclusion is lost.
- Two more partial-evidence conclusions are withdrawn (method named, challenge and edition not).

Suite: 4,840 tests pass.

**Complexity.**
- link-rules v9: +8 link rules, +1 evidence rule, +4 comparable rules.
- rules.v4: one rule's verdict changed.
- One data file.
- About 120 lines in `knowledge_link.ts`.
- Word lists:
  - requirement-framing words (about 70 English function words, for the residue test);
  - five procedure nouns;
  - the identity pattern narrowed.

## 6. Limits (as the owner set them)

- **Not independent.** The S82 battery is synthetic and by the same author as the mechanism. It was sealed before the code, but I knew its cases while designing the rules. One rule was decided knowing a gold case: procedure nouns ("run") are not qualifiers. The 19/19 is a mechanism check, not a validation.
- **The S81 held-back battery is spent.** It was used here as a regression check.
- **No user path changed.** Shadow only.
- **Real-data effects** are on spent pages and on 12 store rows from one reader for one category (air-fryer energy).

## 7. What the check recommends (owner decisions, not done here)

Simplification that would let the knowledge work on the user path, in this order:

1. **One reading of `requires_condition`:** per measurement.
   - Replace `needKnowledge269.conditions` (pooled) in `goalAssessment269` and `comparativeEvidence271` with `byMeasure`.
   - Rename the user-visible "unmet" / "not met" texts to "not recorded".
2. **D28 in ranking:** ra.2 to read conditions derived from records, after the owner's decision on public authorisations.
3. **One condition vocabulary.** Phase225, 268, 270 and 271 codes become views of the quantity-knowledge axes. The reader-conditions file is the first step; Phase270's `power_meter` (which also matches "lab") must be separated first.
4. **Phase225 negation defects** before its codes carry more weight.
5. **Later** (D7–D12 of the census): one evidence-class vocabulary and one unit/kind source for the advice path (Phase249/253 still use their own tables).
