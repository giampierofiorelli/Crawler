# FA-I1 — Foundational Architecture Representability Gate: report

- **Date:** 2026-10-21.
- **Authorisation:** verbatim in `.claude/skills/pee-guided-learning/references/owner-fa-i1-authorisation-2026-10-21.md`.
- **Preregistration:** `evaluation/fa-i1/preregistration.json`. The schema, inference program, guides, scripts and sample
  hashes were frozen and pushed before any run.
- **Roadmap step:** R3, design verification.
- **Kind:** vocabulary, inference.
- **Maturity:** km.2 stays a *hypothesis*. Nothing was implemented, migrated or promoted.
- **Sealed G1/G1b sets:** not used.
- **No code, store or model change.** Experimental scripts only: `scripts/fa-i1-*.mjs`.
- **Public scores:** `evaluation/fa-i1/firstrun-scores.json` (counts only). Private detail is in `$PEE_PRIVATE_EVAL_DIR/fa-i1/`
  and in pee-knowledge `private-eval/fa-i1/`.

## 1. Outcome

**The model is not admitted, and FA-I2 cannot be authorised.** Four of the six preregistered conditions fail, including
both critical ones. As the owner instructed, the work stops at a design revision (§6). No later component was developed.

| Gate | Preregistered condition | First run | Result |
|---|---|---|---|
| G1 | zero critical losses caused by the schema | **123** units (121 schema, 2 schema ambiguity) | **fail (critical)** |
| G2 | expressiveness ≥ 0.90 overall, ≥ 0.90 per critical aspect, ≥ 0.80 per stratum | 0.685 overall; worst aspect provenance 0.494; worst stratum PD properties 0.547 | fail |
| G3 | reconstruction ≥ 0.90 of faithfully encoded units | 0.991 | pass |
| G4 | provenance preserved in ≥ 0.95 of items | 0.51 (51 yes, 49 partial) | fail |
| G5 | zero forbidden conclusions from rules or schema; allowed ≥ 0.90 | **3 forbidden conclusions derived** by the rules; allowed 0.50 (excluding encoding/case failures) | **fail (critical)** |
| G6 | J1/J2 agreement on critical-loss presence ≥ 0.80 | 0.927 (κ 0.62; 477 paired units, 30 items) | conclusive |

**What the result means.** The three corrections the owner asked for were partly sound but are not enough.
- **Necessity vs sufficiency:** largely held in the rules. 71 of 74 forbidden conclusions were avoided, including every
  "necessary but not sufficient" trap. The diagnostic set still exposed a new form of the same error (§4).
- **Epistemic dimensions:** the schema separates them, but only on assertions. Most of the knowledge that loses its status
  and provenance is not an assertion: entity definitions, aliases, observations and condition axes.
- **Identity:** held well. Expressiveness 0.92, with 3 critical losses.

## 2. Material and protocol (as preregistered)

**Sample.**
- 100 items: 60 owner-package table rows (10 per taught category), 20 store concepts (stratified by concept kind), 10 QK
  aspects and 10 PD properties.
- Seed 20261021. The 150 rows that informed the design (G1c audit, G1d trace, G1d reference R) were excluded.
- Every required feature is present in at least 8 package rows:
  - conditions 16, negations 33, quantities 10, qualitative 9, no-purchase 22;
  - contraindications 13, provenance 27, unvalidated 12, cross-category 8.
- A defect in the sampling script was found and fixed before any run: store-concept item ids were overwritten by the
  concept record. The sample was rebuilt with the same seed, and the selection did not change.

**Roles.** All roles were Claude agents, each blind as the guides in `evaluation/fa-i1/protocol/` state:
- **Inventory U:** 1,838 atomic units, blind to the model.
- **Encoders E (4):** given the schema, blind to the inventory.
- **Mechanical validation:** 0 errors in all 100 items.
- **Blind reconstructors R (2):** read typed fields only. Quotes, notes and the unrepresented lists were removed.
- **Judges J1 (5):** judged every unit.
- **Blind second judge J2 (2):** judged the 30 preregistered items.
- **Adjudicators A (4):** decided all 670 units that were schema-attributed, critical or disputed.
- **Encoding fixes:** every fix was validated mechanically, and all 124 passed.
- **Diagnostic set:** 17 adversarial cases (71 allowed and 74 forbidden lines), written by an independent agent blind to
  the rules and sealed before encoding. They were encoded by ED, run through the km.2 program on the existing KR engine, and
  judged by D.

**Deviations, all recorded.**
- **Scripted reconstruction.** Both reconstructors rendered the typed fields with scripts, then reviewed the output. The
  renderers never printed passage locators or cited-source names, which caused 24 losses attributed to reconstruction.
- **Scratchpad collision.** The two reconstructors collided once in the shared scratchpad. Each briefly saw the other's
  *reconstruction* text, never a source.
- **Uneven granularity.** The inventory is much finer for QK and PD items, where each term is a unit: 817 units, against 553
  for package rows. Per-item (macro) rates are therefore reported alongside unit rates: expressible 0.687, conversion 0.689.

**Limits.** All judgements are agreement between Claude agents, not independent scientific validation. They measure
representation fidelity, not whether the sources are true.

## 3. What the model represents faithfully, and what it loses

### 3.1 Overall (1,839 units: the inventory units and 1 missed unit)

| Measure | Value |
|---|---|
| Expressible with typed constructs | 0.685 (partial 0.194, no 0.121) |
| Encoded faithfully | 0.704 (free text only 0.04) |
| Reconstructed faithfully, of faithfully encoded | 0.991 |
| Units with any critical loss | 193: schema 123, encoding 58 (all with validated fixes), reconstruction 12 |

**Faithful:**
- **Identity:** distinctions between things a reader could confuse are expressible at 0.923, with 3 critical losses. This
  covers general vs contextual needs, opposite directions, and subtype/product/variant.
- **Entities, methods, scope, qualitative judgements:** expressible at 0.68–0.81, with almost no critical loss.
- **Typed content reads back unambiguously** (0.991). Where the schema holds a meaning, its typed fields carry it.

**Lost or distorted (the critical aspects):**

| Critical aspect | Units | Expressible | Critical losses: schema / encoding |
|---|---|---|---|
| provenance | 166 | **0.494** | 47 / 22 |
| efficacy status (demonstrated vs hypothesised) | 169 | **0.568** | 32 / 12 |
| modality (necessary / sufficient / possible) | 66 | 0.636 | 5 / 8 |
| essential condition | 141 | 0.667 | 27 / 16 |
| negation | 90 | 0.722 | 22 / 3 |
| identity | 65 | 0.923 | 4 / 0 |

### 3.2 By stratum

| Stratum | Units | Expressible | Schema critical | Encoding critical |
|---|---|---|---|---|
| package rows | 553 | 0.669 | 58 | 16 |
| store concepts | 469 | 0.829 | 26 | 42 |
| QK aspects | 237 | 0.776 | 4 | 0 |
| PD properties | 580 | **0.547** | 35 | 0 |

## 4. Adversarial (diagnostic) cases

17 cases, judged by D.

| Lines | Result |
|---|---|
| Allowed lines | 31 of 71 reached; 3 reached with a wrong qualification; 37 not reached |
| Forbidden lines | 71 of 74 avoided; **3 derived, all caused by the rules** |
| Failures by cause | rules 19, schema 15, encoding 9, case 0 |
| Wrong conclusions no line covered | 5 |

### 4.1 The three forbidden conclusions (critical)

1. **D07: "buy a new dishwasher".** A purchase strategy with **no documented requirement** counted as realised by any
   artefact, because the program reads "no requirement group unmet" as true when there are no groups. This is vacuous
   truth: the necessity/sufficiency error returning in a new form. The program even concluded that the user's own machine
   realises "replace the dishwasher".
2. **D15: "an air purifier will fix the dust-mite allergy".** A **user anecdote** (claim nature `user_report`) was enough to
   make a strategy relevant. No rule used the source's "not a substitute for bedding hygiene" (a denied `substitutes_for`)
   or the "possible" modality.
3. **D14: "W2 meets 44 dB(A)".** The category-first `serves` rule ignored the unverified required level that the forward
   rule had correctly flagged.

### 4.2 Other rule failures

- A strategy that addresses a *cause* was never connected to the situation the user reported. The documented no-purchase
  remedies of D07 and D08 were therefore missed.
- No rule can rule out a cause from a discriminating test.
- An association was promoted to a confirmed cause (D09).
- Opposition was attached to a capability and never carried to the family that has it.
- There is no conflict between observations (D03).
- No-purchase strategies lose their open conditions.

### 4.3 Schema failures in the cases

- The request frame has no slot for required levels or required capabilities.
- There are no comparatives (OLED vs LCD, IPS vs VA).
- There is no primary remedy vs adjunct.
- Two appliances cannot realise one strategy together.
- Requirements cannot be bound to the same setting, or derived from room volume.

### 4.4 What held

- Every "necessary but not sufficient" trap was avoided (D01, D02, D16): no purifier serves humidity, and no dehumidifier
  serves fine particles.
- No physical principle became product efficacy (D04).
- No measurement was transferred across conditions or models (D05, D06, D17).
- No hypothesis was presented as established (D12).
- No unsuitable dehumidifier was proposed at 3 °C (D13).

## 5. Architectural errors vs acquisition errors

### 5.1 Architecture (schema)

570 units have cause schema or schema ambiguity; 123 of them are critical. The adjudicated gap descriptions group into the
themes below. The grouping is by keyword and is approximate; the detail is private.

| Theme | Units | Critical | What is missing |
|---|---|---|---|
| status and provenance of non-assertion knowledge | 113 | 35 | entities, definitions, aliases and condition axes carry no epistemic profile or support. Knowledge that is not an assertion has no provenance or status |
| relayed or cited sources | 20 | 16 | support can only cite the package passage; nothing links an assertion to the study, register entry or test the package relays (R01, N16, S11). There are no roles for scientific literature or an unknown role |
| observations | 22 | 11 | observations have no support, epistemic or applicability block, and no synthetic or illustrative nature. A single study or tested unit cannot be the subject, so its result is pushed up to the category |
| property fields | 69 | 13 | the value basis (per run / per period) and when it applies; the object of interest; unit and metric; plausible range. Context axes lack value kinds, structure class and a QK-axis mapping (namespace ambiguity) |
| comparison, priority, main determinant | 19 | 8 | comparisons between artefacts or subtypes; primary vs adjunct remedy; "X, not Y, governs" |
| study design and time | 43 | 7 | replicates, blinding, sample design, protocol version, dates of validity |
| `assessed_by` modality | 32 | 6 | "required to assess" (necessary) is undefined for this predicate; a denial combined with necessity is ambiguous ("not always" vs "never") |
| lexical cues and term status | 128 | 4 | terms that evoke a concept without sharing its meaning; positive and negative pole terms; supported vs candidate status of a term (aliases correctly refuse these) |
| adviser method knowledge | 19 | 4 | curriculum, clarification questions, abstention duties, admissibility rules: knowledge about how PEE investigates, not about the world |
| other (single gaps) | 105 | 19 | thresholds without values, upper bounds, hidden assumptions, etc. |

### 5.2 Acquisition (encoding)

There are 124 such units. Each has a corrected km.2 fragment that validates, so none blocks the schema; they are
acquisition findings that bear on FA-I4. 58 of them were critical. Recurring patterns:
- "Must / verify" was encoded as `assessed_by` with modality possible.
- A blind source verification was left as `derived_unreviewed`. The encoder guide's blanket rule caused this.
- Source-backed or method-reference package content was flattened to `hypothesis`.
- "Plausibly" was encoded as modality possible, which reads as "in some cases".
- A subtype scope was missing.
- "Each mode" was encoded with condition logic `any`.
- Negations and conditions were omitted.

**The inference program is an architectural component.** Its 3 forbidden conclusions are architecture errors, not
acquisition errors.

### 5.3 Reconstruction

24 units. The renderers omitted passage locators and the `judgement` form. These are tool errors, not schema errors.

## 6. Corrections the model needs (design revision km.3, on paper; not implemented)

Each correction answers a demonstrated loss. None is category-specific. Where a construct is added, the reason is the loss
it prevents.

**K1 — Everything that is knowledge is an assertion, or carries the same epistemic block.**
This is the largest structural cause (G4; provenance 0.49).
- Entity definitions, category membership, alias statements and axis definitions become *attribute assertions* about the
  entity (`defined_as`, `has_value_kind`, `labelled_as`), each with support and the epistemic dimensions.
- Entities keep only their identity.
- Observations receive the full epistemic block and support.

**K2 — A provenance chain (W3C PROV-style).**
- Support distinguishes the **relaying passage** (the package) from the **cited source** (`cites` → a source entity with
  its own role).
- Roles are extended with `scientific_literature`, `regulator`, `practitioner` and `unknown`.
- Independence is evaluated on the cited source, never on the relay.

**K3 — Observation subjects at the right level.**
- A `test` entity (a study, a trial or a tested unit, with sample design, replicates, blinding, protocol version and date)
  is `about` a product or variant, and observations hang off it.
- Observations gain the natures `synthetic` and `illustrative`.
- This makes the existing efficacy rule F4 enforceable, instead of forcing results up to the category.

**K4 — A lexical layer, separate from the ontology.**
- `term` objects relate to a concept through `same_meaning` (an alias), `evokes` (a cue) or `pole_of` (a dimension with a
  direction).
- Each relation carries a status (supported or candidate) and provenance.
- Aliases stay strict. This answers the 128 cue and pole units without weakening identity.

**K5 — Property and axis metadata (I-ADOPT aligned).**
- A property gains an object of interest, a value basis with its applicability rule, a canonical unit or metric, and a
  plausible range.
- Defining conditions may themselves be conditional ("defining only for a per-period basis").
- A context axis gains value kinds, a structure class and a namespaced mapping to QK axes.

**K6 — Comparison and priority predicates.**
- `compares`: A vs B on a property or dimension, with direction and conditions.
- `preferred_over` / `primary_remedy_for` between strategies, with the adjunct reading.
- `main_determinant_of`.

**K7 — Closed modality semantics per predicate.**
- `assessed_by` gains `necessary` ("required evidence").
- A denial combined with a modality is defined as negating the modal claim ("not necessarily"), never as "never".
- A universal negation is a denial without modality.

**K8 — Request-frame slots.**
- Required levels: property, comparator, value and unit, bound to a setting.
- Required capabilities.
- User-reported test results, recorded as observations by the user, instead of a hand-set "confirms".
- Derived requirements (for example per room volume), computed by documented formulas.

**K9 — Method knowledge kept out of the world model.**
- Curriculum, questions to ask, abstention duties and admissibility rules are PEE's *research methodology*.
- They belong in the existing governed KR programs and guides, which have a rule lifecycle and admission, not in the
  scientific universe.
- This needs an owner decision. The mission (SKILL.md §0) names methodology as a learning kind of its own.

**K10 — Inference corrections (km2 → km3 rules).**
1. **No vacuous realisation.** A purchase strategy needs at least one documented requirement, or the artefact must
   `addresses` it directly and documentedly. Otherwise the outcome is a gap, never a candidate.
2. **Relevance needs an evidence profile.** A `user_report`, an anecdote or a hypothesis alone never makes a strategy
   relevant. A possible modality yields "may contribute" only. A denied `substitutes_for`, or a primary remedy, makes a
   purchase an adjunct.
3. **`serves` (category-first) requires the full forward conclusion:** no unverified level, no contraindication, and a
   documented capability.
4. **Remedies through causes.** If a situation indicates a cause and a strategy addresses or acts on that cause, the
   strategy is a remedy labelled by the cause's status. This reaches the documented no-purchase remedies.
5. **Discriminating tests.** A user observation that matches a source-stated test confirms one cause and rules out the
   others. An association never confirms causation.
6. **Opposition propagates** from a capability to every artefact that has it necessarily.
7. **Conflicting observations** on the same property, artefact and condition withhold the conclusion and report the
   conflict.
8. **No-purchase strategies keep their open conditions.** For example, "use existing extraction" is conditional when the
   extraction's existence is unknown.

## 7. Decision and proposal

**FA-I2 cannot be authorised.** Following the preregistration and the owner's instruction, no post-hoc re-encoding was run.
The preregistration allowed one; the stop at design revision takes precedence.

**Proposal: authorise a km.3 revision and a second representability gate (FA-I1b), with the same protocol and gates.**
- **The revision:** written on paper and frozen before any run. It applies K1–K10 only where a demonstrated loss requires
  it.
- **The sample:** fresh and untouched. The FA-I1 sample and diagnostic set are now **spent** for schema design and may
  serve only as regression.
- **The diagnostic set:** new, written by a new independent author, and including the three forbidden patterns found here
  (vacuous realisation, relevance from an anecdote, `serves` without a level).
- **The encoder guide:** corrected for the acquisition errors of §5. This does not change the schema.

**Owner decision needed first: K9.** Methodological knowledge stays in the KR programs and guides, outside the scientific
universe.
