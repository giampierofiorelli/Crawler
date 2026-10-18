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
