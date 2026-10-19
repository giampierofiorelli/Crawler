# Scientific contract of an observation — v0.2 (S87c, after the owner review)

**Status.** Proposal: not implemented, and no store migration. It supersedes §4–5 (contract v0.1) of
`s87c-source-study-and-representation-contract.md`; the study itself stays as written.

**Owner decision (verbatim).** "io direi di procedere così come ti hai proposto, però Claud non è al 100% d'accordo ha
delle piccole obiezioni te che ne pensi se te ritieni di aver ragione io ti do l'ok". The review with the four objections
is kept verbatim in `.claude/skills/pee-guided-learning/references/owner-review-s87c-2026-10-19.md`.

## 0. Claude's assessment of the four objections

All four are right. They change the contract; they do not change the direction.

| Objection | Verdict | Evidence checked by Claude |
|---|---|---|
| **A.** Qualitative observations are missing | **Right, and worse than stated** | `qualitative_observations270` only admits air-fryer cooking outcomes (`outcome IN ('crispness','browning','evenness','doneness','moisture')`, `dish NOT NULL`, `basis='first_person_cooking_test'`). `comparative_results271` admits only cooking appliance classes and duration/energy/cost. A qualitative judgement about a dishwasher or a TV cannot be stored today. The *store schema* is category-specific. I-ADOPT 1.1.0 defines a property as "a quantity or a quality" (verified at the source). |
| **B.** The C-scale is PEE's design, and one agreement index mixes three questions | **Right** | VIM 2.47 compatibility is defined "for a specified measurand"; its Note 2 says correlation changes the uncertainty of the difference (verified). Agreement (ζ) applies to *the same measurand of the same object*, e.g. one model measured by two publishers. It never applies to two different products, whose difference is the information sought. |
| **C.** Unknown conditions must not block every comparison | **Right** | v0.1 said "no constraint slot `unknown` on either side". That repeats Phase268's over-restriction. VIM separates measurand-defining constraints from influence quantities; LOINC adds a method only when it splits results; GUM 3.1.3 needs completeness only "with respect to the required accuracy". Relevance must come from knowledge, per measurand; PEE already holds 81 `requires_condition` relations. |
| **D.** Taught knowledge is unverified | **Right** | 218 of 218 items are `proposed_unverified`. A lexical layer moved into the store without a verification lifecycle would only relocate the 4,300 cue words. |

One nuance on B: ζ remains the correct tool for one specific question, whether two publishers' results for **the same
model** agree. The contract keeps it there and only there.

## 1. One observation, three result forms

Quantitative, qualitative and comparative findings share one record. The result form changes; the identity, conditions,
evidence and provenance do not.

```
Observation  (contract version: pee.observation.v0.2)
 subjects[]            one product (single result) or several (comparative); each: model identity, unit/variant tested,
                       identity state (stated|inferred|unknown) + evidence pointer        [O&M ultimate/proximate feature]
 assessed
   property            reusable property term: a quantity OR a quality (energy use, run duration, stain removal,
                       rinse result, picture uniformity, crispness…)                         [I-ADOPT 1.1 Property]
   objectOfInterest    appliance | programme run | batch/dish/load | room air | picture | sound
   constraints[]       {dimension: programme|mode|setting|load|content|sample|distance|…, value, state, evidence}
                                                                                            [I-ADOPT Constraint; VIM 2.3]
   basis               per run | per 100 runs | per year@usage | per portion | per hour | none — with state
                       (stated | inferred:<convention id> | unknown); quantitative only     [EU 2019/2017 Annex I; LOINC time]
   statistic           single | mean of n | weighted | max/min | derived                    [I-ADOPT StatisticalModifier]
 result                exactly one of:
   quantitative        {value, unit, rounding, quantityKind}                                [QUDT; VIM]
   qualitative         {judgement: positive|negative|mixed|neutral, grade?: {value, scale(ordinal: n levels | nominal)},
                        strength: explicit|hedged, wording span}                            [LOINC scale; Phase269 fields]
   comparative         {relation: better|worse|equal|ranked, ordering[], by how much (if stated) → links to quantitative}
 observationBasis      instrumented measurement | hands-on use test | expert inspection | user report | declaration
                       (+ method cue, document method section)                              [GRADE indirectness; PEE roles]
 procedure             {ref: standard+edition | publisher method | none, status, version|era (+source)}  [VIM 2.6; RTINGS]
 parameters[]          instrument (+ change date), operator, event settings                 [O&M 9.2.4; VIM 2.22]
 influenceConditions[] ambient, supply, room… with intervals                               [VIM 2.52]
 observer              publisher, author role/expertise if stated, evidential role (independent test | manufacturer
                       declaration | retailer | reviewer claim | user)                      [PEE non-negotiable]
 limitations[]         what the source says the observation does not cover (sample size, one unit, short use)
 uncertainty           stated | prior + source | unknown; validity range                    [GUM; AHAM]
 provenance            document, per-role evidence pointers (block, cell, header, section), dates, extractor and
                       knowledge versions                                                   [PROV; SciREX/TAT-QA lesson]
 unknowns[]            slots not established
```

The reviewer's sentence becomes **two** observations: same subject, same observer, two properties.
- **Stain removal (dried-on):** qualitative, positive, explicit.
- **Rinse result:** qualitative, negative, explicit.

For both, `observationBasis` is a hands-on use test, unless the document says otherwise.

## 2. Comparability: three separate questions (replaces v0.1 §5)

| Question | When it is asked | How it is answered |
|---|---|---|
| **Q1. Protocol comparability**: can these two observations be put on one scale? | Any two observations of the same property | A graded relation, **a PEE design** (not a VIM classification), inspired by VIM 2.46, LOINC's method rule and the EU "equivalent/corrected" methods: identical, equivalent, convertible (named conversion), related only, not comparable, unknown. The grade is per purpose: within one publisher or across publishers. |
| **Q2. Compatibility**: do two results of the *same measurand on the same product* agree? | Same model, two publishers or two runs, after Q1 ≥ convertible | ζ = Δ / u(Δ) with u(Δ)² = u₁² + u₂² − 2·r·u₁·u₂ (VIM 2.47 Note 2). When r is unknown, report the range for r ∈ [0, 1] and say so. Disagreement is a finding to explain; it is never averaged away. |
| **Q3. Performance difference**: is product A better than product B on this property? | Different products, after Q1 ≥ convertible | The difference relative to its uncertainty or the publisher's resolution, then **sufficiency for the buyer's need** (GUM 3.1.3; GRADE indirectness and imprecision). It is never an "agreement" test. |

**Qualitative results.**
- Q1 needs the same property and object.
- A comparison within one publisher (same reviewer team, same use test) can support ordering.
- Across publishers, judgements are combined only as consistent or inconsistent evidence (GRADE inconsistency). They are
  never converted into numbers.

## 3. Unknown conditions: relevance from knowledge, not a blanket rule (replaces v0.1 constraint 4)

Each property carries, as **knowledge** (not code), the relevance of each condition dimension:

| Relevance | Meaning | Effect of an `unknown` |
|---|---|---|
| defining | changes *what* is measured (programme for dishwasher energy; HDR/SDR for TV luminance) | across publishers: Q1 = unknown; within a publisher with a recorded fixed protocol: inherits the protocol; Q3 not across sources |
| influencing | changes the value but not the measurand (room temperature, distance for sound pressure) | Q1 unaffected; uncertainty widened or a stated caveat; Q3 needs a margin beyond it |
| irrelevant | does not matter for this property | none |
| not yet known | the knowledge has no relevance for this dimension | treated as influencing, with a caveat |

- An unknown value is **never read as equal**.
- An unknown value **never blocks** a comparison unless the knowledge says the dimension is *defining* for that property.
- The existing `requires_condition` relations (81) are the first source for "defining". Their verification state
  (§4) limits how strongly they apply.

## 4. Knowledge maturity: a lifecycle, not a list (answers D)

Every knowledge item — term, concept, relation, condition relevance, default convention — carries a state and its
evidence:

```
candidate term      → supported concept        → verified relation               → decision-usable
(seen in documents,   (≥1 authoritative or       (consistent across ≥2 independent  (used in a decision path and
 Claude-proposed, or   method source states it;   sources, or a standard/regulation;  validated on held-out
 owner package)        provenance recorded)       no open counterexample)             material for that use)
```

- **Promotion** is automatic when the evidence criterion is met and recorded. It is not approved item by item. An audit
  takes a random sample of promotions per period, and the owner can review it.
- **Demotion:** a counterexample (an adjudicated contradiction) or a source revision demotes the item, and the readings
  that used it are reconsidered (extends `readingsToReconsider265`, debt D14).
- **Learned expressions** (bootstrapped terms) are weak labels. They start as candidates. Promotion requires agreement
  with known facts and no score for a mutually exclusive concept, which is the Snowball confidence rule with a
  semantic-drift guard.
- **Decisions** consult the state. A `candidate` relation can guide reading but cannot make a condition "defining" for
  a cross-source decision.
- **Existing items:**
  - the 214 assistant-authored items start as `candidate`;
  - the 4 professional-method references start as `supported`;
  - nothing is deleted.

## 5. Versioned and compatible with what exists

- **The contract is a versioned type** (`pee.observation.v0.2`), checked by declarative shapes with structured reports
  (SHACL-style, implemented in code without an RDF stack).
- **Read-only adapters** map the existing tables into it:
  - `test_measurements265` → quantitative;
  - `qualitative_observations270` → qualitative;
  - `comparative_results271` → comparative;
  - Phase245/249 declarations → quantitative with `observationBasis = declaration`.

  What an adapter cannot fill becomes `unknown`, which measures exactly what each table loses.
- **No table is replaced.** A later migration adds one general table alongside the existing ones. Readers move one at a
  time; an old table is retired only after the new path has reproduced its results (the four-set capability rule).
- **The architecture is chosen after the shape checks and adapters show where the gaps are.** Claude is not bound to
  replicate any ontology wholesale; the sources above supply constraints, not a schema to copy.

## 6. Proposed first implementation step (shadow, reversible; the owner gave the go-ahead)

1. The contract as TypeScript types, plus the shape checker.
2. Read-only adapters from the four existing representations, and from the S87b gold corpus (472 quantitative) plus
   the Phase269–272 qualitative gold.
3. **Measure per field, per group and per result form:**
   - what existing data fills, infers or leaves unknown;
   - which shapes fail.

   Then compare with the S87b survival census.
4. **No store change, no operational reader change.** The 206 answers stay identical, and a test asserts it.

Only after (3) does the next decision follow: the lexical layer as knowledge data with the lifecycle, decomposing the
bundled measurements, one linker, and validation from knowledge. Each step is measured on groups not used to build it.
