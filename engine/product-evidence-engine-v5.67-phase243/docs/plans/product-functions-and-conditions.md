# Functions, components, modes, conditions and results as typed facts (FC), 2026-10-18

Extends `docs/plans/qualitative-evidence.md` and `docs/plans/whole-document-reading.md`. Supersedes nothing.

## Question

**Owner message (2026-10-18, Italian), framed as an engineering question, not an architecture to impose.** PEE must
distinguish seven things and link them with typed, verifiable relations:
- a function or capability (auto mode, a sensor-based control);
- a component (a PM2.5 sensor, a filter);
- an operating mode or setting (speed 1/2/3, often ordinal; sleep; nominal values);
- a test condition;
- a metric defined by a method (CADR; a sound level with its method and conditions);
- a result (a value of a metric under conditions, such as noise in night mode);
- an expert qualitative observation.

Rules the owner set:
- A function's presence is categorical (available / not available / not verified) and never evidence that it works
  well.
- "Speed 1", "Sleep" and "Lowest" are not synonyms without proof.
- The qualitative model must not become a container for everything without a unit.
- First-order facts come first: a product has a function, a mode sets a setting, a test uses a mode, a result
  measures a metric. Higher-order principles come later.

References the owner named, read for the distinctions they draw:
- **JCGM VIM:** an influence quantity and a rated operating condition belong to a measurement's specification, not
  to the metric.
- **W3C SOSA/SSN:** an Observation is distinct from an Actuation; a Procedure is reusable.
- **Schema.org:** QualitativeValue (categorical) is distinct from QuantitativeValue, and `valueReference` holds a
  value's context.
- **ENERGY STAR room air cleaners:** CADR, power and efficiency under defined methods; a feature's presence is not
  part of the performance evaluation.

## 1. What existed (audit)

- **Functions:** none were represented.
  - A "Yes" table cell was a categorical value of `phase245_value_normalizer` or 1G, not a product function.
  - A sentence such as "it has an app" could become a qualitative item: QE's aspect `connectivity_app` holds "app",
    "wi-fi" and "remote control", and `safety` holds "child lock".
- **Components:** none were represented.
- **Modes:** only as condition values of quantities (the `fan_setting`, `programme` and `signal_mode` axes). There was
  no scale, no ordinal position and no statement of equivalence. Since S61, named settings are separate values; there
  was nothing to state when two names are the same state.
- **Existing parts reused:**
  - the quantity knowledge with its operating-condition axes;
  - the whole-document reader (segments, product attribution, quantities, results and their conditions);
  - the structured qualitative evidence;
  - the KR engine (stratified Datalog with proofs, closed-world negation over the record).

## 2. What was built (`src/product_facts.ts`; vocabulary `functions.v1.json`; rules `product-rules.v1.json`)

**A view over the existing reading, not a new reader.** Quantities, results and their conditions are unchanged. The
quantity pack and every existing reading identity are untouched: the new vocabulary has its own file and digest.

| Class | Representation | Source of the distinction |
|---|---|---|
| Function | `FunctionStatement`: function id (28 known, plus unknown names such as "VarioSpeed Plus function"), presence `available`/`not_available` (negation in the clause, Yes/No values), product, stated by (spec or maker, reviewer observed, reviewer mention, reported by others), sensor-based | Schema.org QualitativeValue |
| Component | `ComponentStatement`: 22 components with the functions they *can* enable (knowledge) and the ones the document says they serve (stated). The tester's instrument ("our PurpleAir sensor") is part of the procedure, not the product | SOSA/SSN system vs. procedure |
| Mode or setting | `ModeStatement`: nominal (sleep, turbo), ordinal with rank and series length (speed 3 of 4; lowest; highest), numeric setting, programme (programme lists); equivalence only where the page states it ("sleep mode (speed 1)"), for that product | SOSA/SSN actuation; VIM operating condition |
| Test condition | a result's conditions by kind: operating mode, test material, environment, procedure | VIM influence quantity |
| Metric | unchanged: the quantity knowledge's metrics and kinds | VIM measurand |
| Result | `ResultStatement`: a typed value with its metric or kind, product, evidence class and operating modes. A mode named in the value's own clause is attached when the knowledge attached none | SOSA/SSN Observation |
| Observation | unchanged (`QualitativeEvidence`). An item whose only property word is a function's name, with no statement of how it works, is **reclassified** as availability, not opinion | owner: availability is not an opinion |
| Function performance | `FunctionPerformance`: a statement about how well a function works (response time, air quality reached, oscillation, reliability, accuracy...), with its evidence type and polarity, apart from the presence statement | owner: effectiveness needs its own evidence |

**First-order program `product` (pr.2; 23 rules, KR engine, every conclusion with its derivation):**
- `presence(P,F,available | not_available | conflicting)`;
- `presence_not_verified(P,F)`: closed over the record, never "absent";
- `may_support(P,C,F)`: a component that can enable F is a research lead, never a presence;
- `enabled_by`;
- `effectiveness_evidence(P,F,O,E)` from:
  - a performance statement;
  - a value measured in the function's mode;
  - (tuned) what is said about the enabling component or the realising mode;
- `effectiveness_unassessed(P,F)`: present, and nothing says how well it works;
- `same_state` and `different_state_results`: one state only by the same name or a stated equivalence for that
  product;
- `same_named_setting` across products: names match, physical states are not shown to;
- needs: `need_met_by_presence`, `need_presence_unverified`, `need_effectiveness_unassessed`.

**Invariant, checked by a test over the rule set and counted by the scorer.** A rule that concludes about
effectiveness has a positive statement or result in its body. Only "unassessed" rests on an absence. Presence alone
never suffices.

## 3. Measurement (9 development pages, function content not inspected by the developer; 610 reference items)

**Protocol and reference** (`evaluation/function-fc/`):
- The protocol and the reference were sealed (`212104d`) before any code.
- 3 fresh-context annotators worked from a neutral rendering: 227 functions, 129 components, 95 modes, 109 results
  under a mode, 50 function-performance statements.
- 5 categories: air purifiers 5, dehumidifiers 1, tumble dryers 1, dishwashers 1, air fryers 1.
- The build was frozen at `2dd37dc` and developed on 4 other development pages only. Zero HTTP.

| | Base (current readers, `b49f8b0`) | fc.1 first run | fc.2 (TUNED) |
|---|---|---|---|
| Functions reached as typed facts (of 227) | 0 (7 as untyped table values, 34 only as qualitative items) | **113 (50%)** | 117 |
| Presence correct, of reached | — | **108 of 113 (96%)** | 110 of 117 |
| Function product correct / wrong / missing | — | 92 / 11 / 10 | — |
| Stated by correct | — | 73 of 113 | — |
| Function statements read as a qualitative opinion (presence-only statements) | 30 | 26 | 25 |
| Reader functions not in the reference | — | 42 of 155 | 57 of 174 |
| Components reached (of 129) | 0 | 56 (product correct 41) | — |
| Modes reached (of 95, page level) | 13 (as result conditions) | **45**; scale correct 36 | 45 |
| Stated equivalences reached / **false equivalences** | — | 0 of 1 / **0** | 0 / **0** |
| Results under a mode: reached / mode attributed (of 109) | 60 / 22 | 60 / **28** | 60 / 28 |
| Function-performance statements linked to their function (of 50) | 0 | 5 | **15** |
| Rules deriving effectiveness without evidence | — | **0** | **0** |
| Present functions with effectiveness unassessed / with evidence | — | 37 / 30 | 39 / 43 |

**What the first run teaches:**
1. **The categories meet at their boundary, so the useful structure is the relations between them.**
   - 45 of 50 performance statements were not linked. Most are said about the component ("the sensor is very
     responsive") or the mode ("laundry mode dried a load in four hours"), not the function's name.
   - A mode with a purpose is both an actuation state and the means of a capability: "no dedicated laundry mode" is the
     absence of a function.
   - The precise relations are: a component *enables* a function, and a mode *realises* it. What is said about the
     means is evidence about the function, but only when the product is stated to have that function.
   - Added as rules E5–E7 (TUNED). Linked statements went from 5 to 15. A sensor's behaviour on a product with no
     stated function remains no evidence (tested).
2. **Reach is limited by vocabulary, as for QE.** 114 functions were not reached. Most are described by actions, not
   names ("turn off from the phone", "disable the ionizer with a button", "adjust settings remotely", "height-adjustable
   top rack"). A closed list of names reaches about half. The same loss as QE's: properties recognised only by listed
   words.
3. **Modes are often in another sentence or a heading.** 31 results under a mode still have no mode, e.g. "at maximum
   speed" stated in the sentence after the values, or a drying programme named in the heading. The clause rule is
   deliberately narrow; reading a mode from a test section's heading follows the same scope principle as the kind
   protocols (C1–C5).
4. **Who states it is the weakest field** (73 of 113). The reader confuses a reviewer's mention with a reviewer's
   observed use. The reference itself has 9 values outside the schema ("judged").

## 4. Shown, not shown, next

**Shown:**
- The seven classes are represented separately, with first-order typed relations and derivations.
- On pages whose function content the developer had not read, half of the stated functions become typed facts, with
  presence correct for 96% of them. The current readers have none.
- No rule derives effectiveness from presence: checked over the rules and counted by the scorer.
- No equivalence between settings is asserted that the page does not state: 0 false equivalences.
- "Speed 1", "sleep" and "lowest" stay three states. Over the 9 pages the program derives 418 pairs of results in
  different states, against 78 in the same state.
- Presence-only statements no longer count as qualitative opinions where the reader recognises them (5 reclassified);
  most such cases are not yet recognised (26 remain).

**Not shown:**
- Generalisation: the reference is now spent.
- Precision beyond these counts. "Not in the reference" overstates false readings for components, because annotators
  mostly annotated a component once per product while the reader reports every mention.
- Any use in advice: shadow only. Nothing reaches the store or the ranking.

**Limits of the reference:**
- The annotators share the developer's model family.
- Each page had one annotator.
- The annotators' hand-back summaries mentioned a few reference cases (e.g. "Turbo is not stated equal to speed 4").
  No rule was written from them.

**Next, by measured cost:**
1. Read functions from action descriptions ("controlled from the phone" → remote app control) through the same
   vocabulary, with negation scope.
2. Modes from the test section's heading and the next sentence (a scope rule, not a word list).
3. Use function needs in advice. Advice should report "available, effectiveness unassessed" and never rank on
   presence.
4. A new authentic set, which needs the owner's authorisation for any acquisition.

## 5. Owner review, 2026-10-18 (dated note; the text above is unchanged)

The owner's review is preserved verbatim in the skill: `references/research-fc-review-2026-10-18.md`. Decision: S63.
Roadmap: `references/roadmap.md`, current step R1.

**Corrections and readings this report needs:**
- **The 96% is over reached items.** Presence is correct for 108 of 227 reference functions; 113 were reached.
- **The 73 of 113 is "stated by", not attribution.** Product attribution was 92 correct, 11 wrong and 10 missing.
- **"0 false equivalences" is uninformative.** The reader asserted no equivalence and missed the only stated one
  (0 of 1).
- **The reference holds 610 items** (221 + 174 + 215, from the sealed files). A working message said 670; that was an
  addition error, and no item was excluded.

**Rules that license more than their evidence supports; to be audited in R1 (shadow only, nothing in advice):**
- **M6** turns "equivalence not shown" into "different state". Closed-world negation is applied where the
  question is open: the relation is unknown unless a difference is documented.
- **E2** makes a value measured in the function's mode evidence about the function. Relevance needs a scientific link
  between the metric and the outcome: a wattage in auto mode says nothing about the air quality it holds.
- **E5 and E7** make what is said about the enabling component or the realising mode evidence of effectiveness. It is
  *relevant to* the function, and *supports* at most a bounded conclusion (method, product, configuration,
  conditions).
- **E6** ties an unspecified sensor to every sensor-based function. That is not justified.

**Superseded next steps.** The "Next" list in §4 (action vocabulary, scope rules for modes, advice) is superseded by
the roadmap order. No new feature series comes before the R1 conformity verification.
