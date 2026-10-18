# Typed quantity knowledge (GK), 2026-10-18

Owner brief (2026-10-18): make PEE generalise through general mechanisms, verify whether the scientific knowledge can
represent quantities, units, metrics, methods, conditions and relations and whether modules use it, and intervene where
needed. Constraints: 1G published configuration stays the immutable baseline; no change to the operational store,
permissions, legal constraints or ranking; no new publishers or pages; targeted consultation of QUDT, UCUM and official
sources only, licences checked; no claim of demonstrated generalisation on data used for development.

## 1. What the audit found (root causes, not symptoms)

| # | Finding | Evidence |
|---|---|---|
| R1 | Quantity knowledge was **code, not data**, written seven times: closed unit lists in phase145, phase166, phase245, phase253, phase265, phase272 and the 1G lexicon. They disagree. | `evaluation/quantity-knowledge/lexicon-audit.json`: 15 of 34 printed units read differently; dBA and dB(A) collapsed to dB by 272, 245 and 1G (265 keeps "dBA" but turns "dB(A)" into dB); kWh/annum read as energy and L/day as a volume by 1G; "cubic feet per minute", lux and ACH unknown to all. |
| R2 | The category knowledge in the store types a taught measurement **only by prose**. The extraction plan (phase272) gives it a "dimension" from bag-of-words, so CADR (a method-defined metric) and fan airflow share the dimension `airflow`. | `compileExtractionPlan272`; `linkToMeasure272("Rated airflow 400 m3/h")` returns the CADR measurement of *fine particle reduction*. |
| R3 | Knowledge that exists is **not consulted where decisions are made**. The teaching says `attr:rated airflow` and `attr:water tank capacity` are `not_sufficient_for` an outcome, but the reading-time link ignores it; only the ranking step (via a catalog) checks proxies. | 6 retained table values (dehumidifier tank capacities) linked by words to *moisture removal* despite the teaching. |
| R4 | Wrong quantity on the **operational request path**: Phase253 read "at least 12 L/day" and "1.5 L per minute" as a *capacity*, checked it against capacity declarations, and could return a positive shortlist for the wrong requirement. | §4 D; fixed through the knowledge. |
| R5 | Silent loss of intent: "a CADR of at least 200 CFM, quieter than 45 dBA" yields no constraint, no unmapped span, no unassessed objective, and the statement "No checkable requirement is stated yet". | Principle 8; reproduced on the operational advice. |

The owner's doubt was justified. One assumption I do not share: that general scientific knowledge belongs in the private
SQLite store. Quantity kinds, units, metrics and condition axes are public metrology, identical for every session and
test, and a reading must be identified by exactly the knowledge it used. They are therefore a **versioned, validated,
content-addressed data pack in the code repository** (`resources/quantity-knowledge/quantity-knowledge.v1.json`). The
private store keeps the category teaching; the new link reads it, typed by the pack, without changing it.

## 2. Design (one mechanism, several consumers)

- **Data, not rules** (`resources/quantity-knowledge/quantity-knowledge.v1.json`, schema `pee.quantity-knowledge.v1`):
  - 27 quantity kinds with SI dimension vectors. Kinds that share a dimension are told apart by unit hints, unit form
    (`requiresClass: reference_period`) and words: power vs energy per year; luminance vs illuminance; frequency vs
    rotational speed vs air change rate;
  - 51 unit atoms composed by a small grammar (`m³/h`, `cu ft/min`, `sq. ft.`, `kWh/100 cycles`, `pints per day`);
  - 5 level units carrying frequency weighting (A, C, unspecified) and reference (20 µPa, 1 pW); levels are never
    converted;
  - 6 metrics defined by a method or convention, each with the condition axes that make results comparable and explicit
    non-equivalence (CADR ≠ fan airflow; EU-label noise is a sound power level);
  - 6 condition axes, and the English bound words (min/max, increase/decrease comparatives) as language data;
  - a source on every entry.
- **One interface** (`src/quantity_knowledge.ts`):
  - `loadQuantityKnowledge` fails closed; identity = version + digest;
  - `parseUnit`, `findQuantities`;
  - `typeQuantity` (kind, metric, weighting, required and stated conditions, explicit ambiguity);
  - `sameQuantity`, `compareQuantities` (a verdict with reasons);
  - `readQuantityRequirements`, `evidenceNeed`.
- **Consumers**, each separate and identifiable:
  1. *Reading*: `src/table_interpreter1g_knowledge.ts` applies the knowledge to the frozen 1G output. 1G is not edited;
     the result has identity `1G identity + '+qk:' + knowledge identity`.
  2. *Request understanding* (opt-in): `adviseFromRequest253(..., {quantityKnowledge})` states the quantitative
     requirements the Phase253 vocabulary misses, asks when the quantity is ambiguous, and adds an evidence need
     (metric, defining method, comparability conditions, what is not evidence).
  3. *Request understanding* (default path): the Phase253 constraint reader consults the knowledge, so a rate is never
     checked as a capacity. This adds a protection and removes nothing.
  4. *Relevance link*: `typedMeasures272` and `linkTypedToMeasure272`, next to the unchanged `linkToMeasure272`, type the
     taught measurements and link a typed value only to a measurement of the same quantity. Declared proxies and
     non-equivalent metrics never reach the outcome.

## 3. Licences and sources (checked before incorporation)

| Source | Decision |
|---|---|
| UCUM (Regenstrief) | **Not incorporated.** Its licence forbids modified content and derivative works, and the development of another unit-identification standard. No UCUM code or table entry is copied; the pack records this. |
| QUDT | CC BY 4.0 (vocabulary metadata). Used for cross-reference identifiers only (`qudt` fields), attributed. |
| NIST SP 811, SI Brochure | Conversion factors and definitions as facts (ft = 0.3048 m and lb = 0.45359237 kg, exactly). |
| Reg. (EU) 2019/2017 (dishwashers), 2023/2534 (tumble dryers) | Declared noise is an A-weighted **sound power** level, dB(A) re 1 pW (LWA). Facts only. |
| US EPA ENERGY STAR, ANSI/AHAM AC-1 | CADR = chamber decay rate with the unit on, minus the natural decay, times the chamber volume; one value per challenge (smoke, dust, pollen). |

## 4. Experiments and results

Evidence tiers are kept apart. All retained pages are **spent** development data: 69 unique pages from 12 publishers,
with 5 identical copies excluded from the counts. Nothing below is held-out generalisation.

**A. Reading: 1G vs 1G + knowledge** (`reading-final.json`; T2 on spent pages; dev1 to final are tuned iterations):

| | 1G baseline | 1G + knowledge |
|---|---|---|
| Value observations with a unit / typed | 589 with a unit | 564 typed (24 baseline "units" are pence, not quantities; 1 lost) |
| Quantity kind established | — (dimension words only) | 524; 40 explicitly ambiguous (all sound pressure vs sound power) |
| A-weighting kept on level values | 0 of 60 (all read as `db`) | 44 A-weighted, 16 unspecified |
| Same quantity printed twice (one cell, two units, conversion verified) | counted twice: 81 | 81 linked (`sameAs`) |
| Method-defined metrics typed | 0 | CADR 62, room coverage 46, peak luminance 15, refresh rate 2 |
| Comparability conditions stated / missing (metrics) | — | 46 complete / 79 incomplete |

The effect is **concentrated**, so it counts as evidence from two groups, not from 140 independent cases:

- one publisher template (airpurifierfirst, 4 pages) gives 59 of the 81 dual expressions and 32 of the 44 A-weightings;
- a second publisher (housefresh) gives 14 and 12.

Units of the sealed 1E and 1G gold elements, annotated before this work: 203 of 220 and 110 of 133 parsed. The rest are
scores ("/10"), currency, "bedrooms", "p/kWh" and "Place Setting"; the pack claims none of them.

**B. Requests, first run** (`requests-firstrun.json`). Set-up:

- frozen before the run in `requirements-freeze.json`;
- 168 request texts from earlier phases;
- gold of 235 quantities, written by a fresh-context agent blind to the reader;
- committed unchanged.

| 76 product requirements in the gold | count |
|---|---|
| Phase253 constraint | 33 |
| Phase253 unmapped (explicit) | 11 |
| Silent in the operational path | 32 |
| … recovered by the knowledge reader | 3 |
| Knowledge reader: surfaced / bound correct | 33 / 32 |
| Non-requirements surfaced as requirements (false) | 5 |
| Advice "No checkable requirement is stated yet" although the gold has one | 3 → 2 |
| Advice fields other than statements, objectives, questions, research plan | identical on 168 of 168 |

The first run shows a **small** effect on this distribution. The cause is diagnosed, not tuned away (debt D19):

- 13 silent requirements are exact values without a bound word;
- most others are in units the pack does not hold (ampere, ohm, bytes, grit, R-value);
- the false positives are ownership durations ("had them for at least 4 years").

Typing a quantity is solved. Deciding its *role* in a request is the next obstacle, and it is a language problem.

**C. Relevance link, words vs typed** (`links-final.json`; 483 typed values in taught categories; store copy, read only):

| Outcome | Values |
|---|---|
| Same link | 193 |
| Neither links | 199 |
| Words only | 63 |
| Typed only | 4 |
| Different link | 24 |

- The typed link never connects a taught proxy to its outcome. The word link did so 6 times (tank capacity → moisture
  removal).
- It abstains where the words linked cooking minutes to *usable cooking area* (24) or a product weight to *batch
  cooking* (5).
- It also abstains where a link was defensible: 21 air-purifier clean-up times, and 1 kWh to running cost.
- These judgements are mine (author-dependent); there is no gold for links.

**D. Default-path protection (Phase253 rate guard).**

- Reproduced before the fix: "at least 12 L/day" and "at least 20 litres per day" (dehumidifier) became `capacity_min`,
  and "a kettle that boils at least 1.5 L per minute" returned a positive shortlist on capacity.
- With the guard they stay explicit as unmapped ("a periodic volume … not a volume").
- Regression: the advice is byte-identical to bb64e96 on 363 of 363 frozen request texts; none of them contains a rate.

**E. Mechanism tests** (T1, `tests/quantity_knowledge.test.ts`, 12 tests):

- knowledge change without code change: adding `sone` and an extraction metric to the pack changes every consumer and
  the reading identity;
- ablations: removing CFM, the A-weighting or the non-equivalence removes exactly that behaviour;
- metamorphic invariance: dB(A)↔dBA, m³/h↔m3/h, CFM↔cubic feet per minute, 147.1 CFM↔250 m³/h;
- the 1G output is untouched by the layer;
- the rate guard.

The full suite passes: 4,651 tests.

## 5. Decisions taken autonomously

1. General quantity knowledge is a public data pack in the code repository, not store rows (§1).
2. 1G is not edited. Knowledge is a layer with its own identity, reusable by any reader.
3. Levels are never converted. Weighting and reference are properties; an unknown weighting makes a comparison
   *undetermined*, never assumed.
4. Value axes (pollutant, fan setting) are read only from the value's own labels and conditions: a nearby paragraph
   ("in sleep mode") does not set a cell's condition. Measured axes (distance) may come from the method context, and
   the source is recorded.
5. Ambiguity becomes a question generated from the knowledge ("the noise level measured at some distance … or the noise
   emission the maker declares …"), never a guess.
6. A teaching name "A per B" is a ratio when B is a quantity and a reporting basis otherwise. Inside a name, the longest
   phrase wins ("sound pressure" is not "pressure").
7. Only one default-path change: the Phase253 rate guard. It removes a demonstrated wrong check and changes no frozen
   output.

## 6. Errors found and corrected during the work

| Error | Correction |
|---|---|
| `"(inches / cm)"` parsed as a ratio | a ratio of like units is not a unit |
| "4K" read as kelvin | the symbol K alone is no longer read |
| cd/m² had no kind | unit-only kinds accept listed expressions |
| kWh/100 cycles read as plain energy | counted bases are kinds |
| equal values in the same unit taken as re-expressions | a re-expression must be in another unit; the closest value wins |
| a paragraph's "sleep mode" attached to every cell | value axes come from labels only |
| "(10%, in nits)" gave no unit | each bracketed part is tried |
| generic words typed taught measurements ("pressure" in "sound pressure") | the longest phrase wins |

Found and **not** fixed (debt D18): 1F joins text across `<br>` without a separator, so 1G merges in-cell labels
("CFMSmoke").

## 7. What is demonstrated and what is not

- **Demonstrated** (T2 on spent pages; T1 tests). The same typed knowledge changes PEE's behaviour in four places:
  - table reading: weighting, dual expressions, metrics, conditions;
  - request understanding: silent requirements stated; a wrong-quantity check removed on the default path;
  - relevance linking: proxies kept from outcomes;
  - comparability: verdicts with reasons.

  A new unit or metric reaches all four without a code change.
- **Not demonstrated:**
  - generalisation to unseen publishers: all pages are spent, and the effects concentrate in two templates;
  - benefit on real requests beyond 3 recovered requirements (first run);
  - any effect on ranking or persistence (not authorised);
  - the remaining legacy vocabularies (D20) and the store's comparability paths (D21) still do not consult the
    knowledge.
- **Next obstacles by evidence**, in order:
  1. the role of a quantity in a request (D19);
  2. migrating each legacy vocabulary to a view of the pack, after an equivalence run;
  3. an authorised small set of unseen pages, split by publisher template, to test the reading claims out of
     distribution.

---

# Addendum KN (2026-10-18): the `<br>` fix and knowledge v2 (qk.2)

Owner brief of 2026-10-18 (Italian; key parts): fix the `<br>` defect "preservando la fedeltà dell'acquisizione e le
baseline pubblicate"; then enrich the scientific knowledge (quantities, application metrics, methods, conditions,
physical relations, qualitative results, specialist knowledge) from the category packages and authoritative sources;
"verifica quali report sono realmente disponibili e non ricostruire quelli mancanti"; errors become knowledge or
mechanism fixes, always reusable.

## K1. `<br>` defect (D18): fixed in new versions, baselines byte-identical

- **Acquisition v1f.2** (opt-in `acquireTables1F(html,{rendered:true})`) adds `renderedText` to cells and captions: an
  innerText-like text where `<br>` and block boundaries are line breaks, hidden content is excluded (the `hidden`
  attribute, inline `display:none` / `visibility:hidden`), `aria-hidden` is kept, and an image is a non-collapsing
  boundary. Every v1f.1 field is unchanged.
- **Interpreter v1g.2** (`{text:'rendered'}`) reads that text. v1g.1 stays the default.
- **Verification:**
  - Chromium `innerText` oracle (`scripts/rendered-text-1f-verify.mjs`): 2,063 of 2,063 cells equal on the 69 retained
    pages.
  - v1f.1 and v1g.1 outputs are byte-identical to cb68490 on 69 of 69 pages.
  - The sealed 1E dev gold and the 1G check gold score identically under v1g.1 and v1g.2.
  - Labels merged across `<br>`: 34 → 0. Bare numbers that recovered their unit: 73. Values lost: 0.
- The knowledge layer reads v1g.2 by default; with an explicit `base` reading it follows that reading's version.

## K2. What research is actually available (no reconstruction)

The private repository holds these packages, unmodified:
- air purifiers v1.2.0;
- robot floor cleaners v1.0.0;
- household dishwashers v2.0.0 (plus a countertop v1.0.0);
- televisions v1.0.0;
- soundbars v1.0.0;
- speakers v1.0.0;
- dehumidifiers (consolidated, original, restored sources R01–R39);
- coffee;
- air fryers: only the RECOVERED v2.2.0 compendium and its addenda.

The air-fryer v3.9.0 report is not available and was not reconstructed. Package claims were used only as leads. Each
fact entered the pack only after it was checked against the cited official or standard source (the `verification`
field of each new source). Where only secondary sources agreed, the source says so.

## K3. Knowledge v2 (`quantity-knowledge.v2.json`, identity `qk.2:…`)

Built reproducibly from v1 by `resources/quantity-knowledge/build/v2-additions.py`; v1 is unchanged and still loads.

| Section | New content | Sources (verification) |
|---|---|---|
| Kinds | electric current, electrical resistance, volume per energy (energy factor), colour difference ΔE; sound power `notDirectlyMeasured`, `determinedBy` ISO 3741/3744 | SI; ISO catalogue descriptions |
| Units | A (case-sensitive) / amp, Ω / ohm, ΔE (case-sensitive), UK pint | SI, physics |
| Condition axes | method, inlet air state, reference gamut, signal mode, floor type, drive level | DOE, ITU-R BT.2020, IEC 62885-7 |
| Metrics | dehumidifier capacity vs tank capacity (not equivalent), energy factor, filter efficiency class, robot suction vs debris pickup (not equivalent), pump vs brew pressure (not equivalent), gamut coverage, colour error ΔE (unitless), input lag, speaker sensitivity, impedance | ENERGY STAR, DOE, EN 1822, IEC 62885-7, secondary (espresso) |
| Methods | DOE appendix X1 (65 °F, 60 % RH); AHAM DH-1-2008 (80 °F, 60 % RH, superseded); EU dishwasher label 2019 and tumble-dryer label 2025 (eco programme); AHAM AC-1; ISO 3741/3744; IEC 62885-7 | official pages read |
| Relations | room area from CADR (`cadr*60/(ach*height)`, 8 ft default, smoke CADR preferred, AHAM); energy = power × time; per cycle from per 100 cycles; free-field distance law and P = V²/R (explain only) | AHAM, ENERGY STAR, physics |
| Scales | EU energy class 2021 (A–G, regimes by product group and date), pre-2021 (A+++…; distinctive A+++/A++/A+; tumble dryers until 2025-06-30), EU dishwasher noise class, EN 1822 filter classes | European Commission, EN 1822 (secondary) |
| Language | label unit prepositions ("in watts"), basis words ("daily" + L = L/day), axis letters (W, H, D, L, Ø) | — |

## K4. Shared mechanisms that consume it (one knowledge, several functions)

- **Reading** (`findQuantities`, `typeQuantity`, 1G knowledge layer):
  - dimension lists with axis letters ("27.16W x 10.5D in" is inches, not watts);
  - units stated by labels, bases named by labels, unitless metrics;
  - a publisher's own reading is sound pressure, because sound power is only ever computed;
  - a named method adds the conditions it fixes;
  - classes are typed on scales.
- **Comparability:**
  - ratings under different methods are `not_comparable` (dehumidifier 65 °F vs 80 °F);
  - classes compare only on one scale (`compareClasses`).
- **Consistency:** `relationChecks` checks per product the relations a table's values provide. It reports the implied
  assumption when a value disagrees ("the room size implies a 5.95 ft ceiling"). It never pairs values it cannot pair.
- **Requests:**
  - `readClassRequirements`, used in the advice with the request date;
  - a class requirement is now an explicit unassessed objective. It was previously lost silently (principle 8);
  - a superseded-scale class is stated as such and never translated;
  - an ambiguous scale becomes a question.
- **Evidence needs:** `evidenceNeed` names the defining method and the conditions it fixes.
- **Relevance links (Phase272):** typed links now reach colour accuracy (ΔE), dehumidifier removal and ACH-based room
  measures.

## K5. Results (T2 on SPENT development pages; T1 tests; no held-out claim)

Reading, 69 pages, same code, v1g.2 base (`evaluation/quantity-knowledge/reading-kn-v1.json` vs `reading-kn-v2b.json`):

| Measure | qk.1 | qk.2 |
|---|---|---|
| typed values | 697 | 882 |
| kind established / ambiguous | 657 / 40 | 859 / 23 |
| sound levels resolved as sound pressure | 49 | 97 |
| unit from label / from unitless metric | 41 / 0 | 110 / 8 |
| same quantity printed twice (all 50 new: dimension lists in in and cm, axes checked) | 84 | 134 |
| methods detected / classes typed | 0 / 0 | 7 / 7 |
| relation checks (room area from smoke CADR) | 0 | 16, all consistent |
| metrics with every required condition stated | 46 | 84 |

Other results:
- **Relevance links** (`links-kn-v2b.json`):
  - 21 typed-only links, all checked correct (8 ΔE, 6 daily extraction, 7 ACH);
  - 4 wrong links (percentages) removed;
  - 2 "different" noise readings now go to the noise measure instead of a CADR.
- **Requests** (`requests-kn-v2-tuned.json`, labelled TUNED, since the gold is spent):
  - identical to the first run on every surfaced requirement;
  - 6 more requirements are read but have no bound;
  - the gold corpus contains no class requirement, so the class path is shown on own synthetic requests (T1/T2,
    store copy):
    - "A+++ rated dishwasher" → pre-2021 scale, stated as no longer in use;
    - "energy class B or better" → 2021 scale, minimum bound;
    - "energy class A++" TV → superseded;
    - "true HEPA H13" → EN 1822.
- **Default path:**
  - the advice without the knowledge is byte-identical on the 363 corpus requests (same hash as cb68490);
  - the live store is unchanged (SHA 5dd1e763…);
  - full suite: 4,662 passed.

## K6. Errors that became knowledge or mechanism fixes

| Error found | Kind | Fix (reusable) |
|---|---|---|
| "27.16W x … inches" typed as watts | mechanism | dimension-list parsing with axis letters (pack language); cell-level reading |
| energy = power × time paired arbitrary values | mechanism | no relation check when several distinct candidate values remain |
| room area disagreed using dust CADR | knowledge | `prefer: {challenge_pollutant: smoke}` (AHAM two-thirds rule) |
| "HEPA" made any nearby percentage a filter efficiency | knowledge | metric terms name efficiency; "HEPA" stays a scale term |
| "100% warranty" linked to the only dimensionless measurement | mechanism (pre-existing since GK) | a bare dimensionless value links only by its metric or the measurement's own words |

## K7. Open

- Pairing of re-expressed dimension lists is by closest value, not by axis or list position (correct on all 50 cases
  seen; an axis-aware pairing would be stricter).
- Class requirements need the product group. A request whose category is not in the registry ("tumble dryer",
  "fridge") keeps the scale ambiguous unless the class itself settles it.
- Relations and classes are reported, not used by any decision. Ranking and persistence are not authorised (D21
  stays open).
- Every page is spent. A small authorised unseen set is still needed for an out-of-distribution claim.
- Qualitative results (package teaching) entered no new mechanism in this step; they remain in the Phase269–272
  teaching.

## K8. Correction (owner review, 2026-10-18): acoustic kind inferred from the evidence class — withdrawn

**What was wrong.** Published qk.2 (`2b2e6fd`, identity `qk.2:4827ebd09f9d2771`) marked sound power
`notDirectlyMeasured`. The layer then concluded that any value a publisher measured itself was sound pressure. This is
scientifically unjustified:
- ISO 3741/3744 determine sound power *from* pressure measurements, but a laboratory reports the determined power as
  its own result;
- EU Regulation 2019/2017 has dishwasher labels declare noise emission in dB(A) re 1 pW.

Only the source's words decide the kind:
- a meter reading at a distance → sound pressure;
- LWA, "re 1 pW" or an energy label → sound power;
- a bare "45 dBA" stays ambiguous.

**Correction of the K4/K5 wording.** The rise in sound pressure from 49 to 97 was not 48 cases decided by this rule.
Re-examining every value against its page shows two groups:

| Values | What decided them | Verdict |
|---|---|---|
| 31 | The source's own words: "from 3 ft. away" in the label, or "sound level meter … measured from … away" in the context | Justified; they stay sound pressure |
| 16 | The rule (one reviewer, two pages). The pages describe "a special noise measurement tool" and the dBA scale, with no distance, in a methodology section the reader does not consult | Pressure is plausible from that protocol, but the rule reached it for the wrong reason |
| 1 | The rule ("Sound (normal) 62.1 dB" in a review's test data). Nothing on the page says pressure or power | Unjustified |

None of the 17 rule-decided values was shown to be power. Still, none was established, so all 17 return to
ambiguous.

**Change (qk.2.1).**
- The marker and the rule are removed.
- `determinedBy` stays as knowledge of the method, with a note that "measured" does not decide the kind.
- Relations now carry their `nature` and a `caveat`; the loader refuses a relation without them:
  - `definition`: energy = power × time; per cycle;
  - `physical_law_idealised`: the distance law, V²/R;
  - `sizing_convention`: room area from CADR. Its caveat says it is a consistency check between declared figures
    under the AHAM/ENERGY STAR assumptions, not a measurement of performance in a real room.

**Results** (`reading-kn-v21.json`, `links-kn-v21.json`, same pages):
- kind established 859 → 842;
- acoustic values ambiguous 23 → 40;
- sound pressure 97 → 80;
- every other count unchanged;
- links unchanged.

The published qk.2 and its runs (`*-kn-v2*`) are kept for comparison and reproduce at `2b2e6fd`.

**Open.** A document's own test protocol (instrument, distance, stated once in a methodology section) is not yet read
as a condition of the table values it governs. That is the general route by which the 16 values could be resolved
legitimately. It is not added here: it would be tuned on these spent pages.

## K9. From abstention to justified conclusions (owner review, 2026-10-18)

**Owner's point.** K8 removed an unjustified inference but went to the other extreme: every value whose table did not
name the quantity stayed ambiguous, even when an applicable standard, the document's own method or instrument, or an
established convention fixes it. Four questions are distinct:
- identity of the quantity;
- quality of the method;
- comparability;
- sufficiency for the decision.

Unjustified interpretations and unjustified abstentions are to be measured separately.

**Reference, sealed first.**
- A fresh-context agent annotated all 120 acoustic table values on the 12 pages carrying them, from document text only
  and blind to every reader version. For each value it gave kind, justification type, distance and evidence.
- Hash sealed in `evaluation/acoustic-ac/freeze.json`; private values in pee-knowledge `private-eval/acoustic-ac/`.
- Development adjudication on spent pages, not held-out.
- The annotation also found an error no earlier check had: 31 "values" are fan-speed indices ("Speed 1 / 40.2 dBA"),
  read as decibels in every published version.

**Mechanism (qk.2.2), general, in the existing interface and layer:**
- **`kindEvidence` in the pack.** Words that justify a kind, by type (explicit, standard, documented method,
  contextual), with sources:
  - IEC 61672-1: a sound level meter reads sound pressure (scope read);
  - EU 2019/2017: label noise emission is sound power re 1 pW.
  
  Document-wide types must say which evidence classes they cover (the loader refuses otherwise).
- **Defeasible document protocols.** A statement the document makes once covers values in three cases:
  - it restates the value ("operates at 40.2 dBA", "energy label claim of 44dB");
  - it is a method note inside the value's own table;
  - its covered classes include the value's class.

  The value's own words override it. A document naming another quantity withdraws it.
- **`kind.justification`** on every typed value: type, where (`unit`, `labels`, `context`, `protocol`), evidence and a
  block or cell reference. The strongest available justification is reported.
- **Within-source comparability.** Values of one source under one protocol get `comparable_within_source`: they compare
  with each other, and the reason states that they do not compare with other sources.
- **Header units.** A header's unit reaches a cell's unitless number only when the cell prints no unit of its own.

**Results on the sealed reference** (`evaluation/acoustic-ac/score-*.json`):

| Version | Correct interpretations | Unjustified interpretations | Unjustified abstentions | Correct abstentions | Speed indices read as dB |
|---|---|---|---|---|---|
| qk.2 published (`2b2e6fd`) | 65 | 1 | 17 | 6 | 31 |
| qk.2.1 (`18932bc`) | 49 | 0 | 33 | 7 | 31 |
| qk.2.2 first run (`score-qk22-first`, unchanged) | 65 | 0 | 17 | 7 | 31 |
| qk.2.2 tuned (`score-qk22-tuned5`) | 82 | 0 | 0 | 7 | 0 |

Notes on the table:
- The tuned run's justification type agrees with the reference on 82 of 82 values.
- The tuned row is TUNED on this reference. Its four refinements were each made after looking at a failing row:
  restated values, in-table method notes, the next two blocks of a method paragraph, and the cell-unit rule for header
  units.
- It shows that the mechanism can reach the reference; it is not a generalisation result.

**Regression check** (`reading-kn-v22b` vs `reading-kn-v21`):
- 69 fewer typed values, every one a wrong typing now removed:
  - 31 speed indices read as dB;
  - 26 speed indices read as W;
  - 12 dimension values that 1G truncates at an axis letter ("19.87D" read as 19). D23 stays open in 1G.
- Links: 62 links of those wrong values removed. The dishwasher label value now links to the sound-power label
  measurement instead of in-home sound pressure.
- Advice without the knowledge: identical on 363 requests. Live store unchanged. Suite: 4,668 passed.

**One overreach caught by a test during the work.** The label scheme briefly covered values of unknown class, so one
mention of the energy label turned every unclassified dB on a review page into sound power. It now covers declared
values only; for other values, a statement restating the value is required.

**Open.**
- The reference is spent. An authorised unseen set is needed for the generalisation claim.
- "noise measurement tool" was added to the instrument terms after reading these pages.
- Protocol coverage uses the 1G evidence class, whose `manufacturer_declared` default can rest on a heading word
  ("Specs").
- No decision consumes `comparable_within_source` yet (D21/D22).

## K10. Scope of applicability (owner review, 2026-10-18)

**Defect.**
- K9's `comparable_within_source` needed only the same source and the same protocol statement.
- So "32 dBA, lowest speed" and "60 dBA, highest speed" of one review were declared comparable with each other.
- A common source or a common method statement does not make unstated conditions equal.
- On the 12 acoustic pages, 35 of the 54 pairs the K9 rule accepted belong to different tests of one source.

**Correction.**
- Values share the conditions their source leaves unstated only when the source presents them as one test: same
  table, and the same row, column and condition labels apart from the product (`cohort`).
- Such values compare with each other, never with other sources or with other tests of the same source.
- Now 40 pairs; the sealed acoustic score is unchanged (`score-qk22-k10`).
- Open:
  - protocol coverage is still scoped by approximations: same table, the next two blocks of a method paragraph, the
    evidence class;
  - it is not scoped by the products a statement names.
  
  The formal-rule evaluation below proposes making each such scope an explicit, tested rule.

## K11. Decisions moved into declarative rules (2026-10-18)

See `docs/plans/knowledge-rules.md`:
- scope, kind justification and comparability are now rules (`resources/quantity-knowledge/rules.v1.json`, engine
  `src/knowledge_rules.ts`);
- every earlier decision is reproduced on the 69 pages;
- two scope defects and one duplication were found and fixed.
