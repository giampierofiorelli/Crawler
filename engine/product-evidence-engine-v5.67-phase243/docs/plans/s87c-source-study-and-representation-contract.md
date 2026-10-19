# S87c — Source study, linker diagnosis and the scientific contract of an observation (no implementation)

**Owner instruction (verbatim).** "Accedi alle fonti per studiare come vanno fatte queste cose accedi a tutto quello che
ti può servire. Non basarti sulla tua sul su come sei stato allenato. Dovevi apprendere cose nuove perché è un territorio
dove non ti stai muovendo bene a sufficienza."

The owner's review of S87b ends: "conviene consolidare questa diagnosi prima di autorizzare un'altra implementazione
ampia". Both are verbatim in `.claude/skills/pee-guided-learning/references/owner-review-s87b-2026-10-19.md`. This study
supersedes nothing; §2 corrects earlier claims of S87a and S87b.

**Scope.** Study and diagnosis only. No operational code, no store schema and no teaching were changed, and PEE made no
network request. Claude's research agents read public literature, standards and regulations, honouring robots and
refusals: blocked pages (loinc.org, iso.org, EUR-Lex bot check, BSI) were not circumvented.

**Research notes.** `docs/research/s87c/A–E`. They contain about 200 sources in all, each marked "verified (read)" or
"not verified (snippet)", with short quotations only.

**Spot checks by Claude, at the source:**
- **VIM 2.47:** compatibility is defined "for a specified measurand". Confirmed.
- **MeasEval:** the inter-annotator agreement table, Qualifier α = 0.334. Confirmed.
- **EU 2019/2017 Annex I:** the definitions of "cycle" and of eco-programme energy "per cycle". Confirmed.

## 0. Outcome first

1. **PEE's failures are known problems with known shapes.** The literature and standards answer each one, and none of
   the answers is "more words in a regex":

   | PEE failure | Established answer | Sources (verified) |
   |---|---|---|
   | Conditions lost or category-specific | Conditions are *roles of a frame*. Their words are kept as data per property, never in code | MeasEval; ChemDataExtractor 2 (declarative property models); I-ADOPT constraints |
   | Implicit basis ("the eco programme used 0.9 kWh") | The basis is part of the measurand. When unstated, it is an *indefinite null instantiation*, filled by a convention the knowledge holds and flagged as inferred | VIM 2.3; EU 2019/2017 ("cycle" = complete process of the selected programme; EPEC in kWh per cycle); FrameNet/SemEval-2010 Task 10 (DNI vs INI) |
   | Two linkers, one meaning | Agreement alone cannot rank two sources: only the product of their accuracies is observable. Adjudication, or a third independent source, is required | FlyingSquid (Fu et al. 2020); Snorkel |
   | `comparabilityKey` taken as comparability | Comparability is a *graded pair relation*. It needs the full measurand, the procedure and its version, the conditions and the uncertainty | VIM 2.46/2.47; LOINC method axis; AHAM AC-1; RTINGS versioned test benches; EU equivalence/correction |
   | Facts spread over heading, table and method section | Results are n-ary relations across the document; most cross sentences, many cross sections. Each role is scored and gated separately, with an evidence pointer per role | SciREX (99% cross sentences, 55% sections; end-to-end F1 0.008 vs 0.611 with gold inputs); DocRED; TAT-QA (84% of errors are evidence errors) |
   | Regex cues everywhere (338 regexes, 73 files) | Treat cues as *labelling functions* that may abstain. Measure their accuracy and conflicts. Start from majority vote, which is often as good as learned combiners | Snorkel; WRENCH |
   | No verifiable rule for what an observation must contain | Declarative shapes (SHACL Core plus named custom constraints) with structured violation reports | W3C SHACL |

2. **The two linkers mostly complement each other** (§3). In a blind sample of 44, the linker that links alone is right
   in 13/16 and 9/12 cases. Where both link to different measurements, 13/16 are *both* acceptable. Those overlaps are
   bundled, overlapping teaching concepts, not linker errors.
3. **A draft scientific contract of an observation** (§4), with a graded comparability relation (§5) and an evaluation
   protocol (§6). It is meant to be agreed *before* any store migration.
4. **Corrections to Claude's earlier claims** (§2).

## 1. What the sources establish

The full notes and URLs are in `docs/research/s87c/`. Only the conclusions PEE needs are below.

**A. Observation and measurand models.** Sources: VIM (JCGM 200:2012), I-ADOPT 1.1, LOINC (Huff et al. 1998),
ISO 19156:2023 / OGC OMS, W3C SOSA/SSN, QUDT, OM, OBOE.
- A measurand is a *kind of quantity plus the state of the thing measured* (VIM 2.3). An influence quantity changes the
  result but not the measurand (VIM 2.52). Settings that define *what* was measured, such as programme, load or picture
  mode, are therefore measurand constraints; ambient conditions are influence quantities.
- LOINC makes the **time aspect** (point, 24 h) part of a code's identity. It names a **method** only "when information
  specified in the other five axes is insufficient", that is, when results from different methods would not be
  comparable.
- O&M 2023 separates the generic **procedure** from event-specific **parameters** (instrument settings, operator). It
  also separates the feature *actually* measured (this unit, this run) from the feature of ultimate interest (the
  product model).
- I-ADOPT composes a variable from reusable parts: property, object of interest, matrix, context object, constraints.
  The CoRDI 2023 paper warns that assigning those roles automatically is the hard part.
- QUDT: the same dimension does not mean the same kind (kWh per cycle and kWh per year have one dimension and two kinds).
  Keep the basis out of the unit.

**B. Measurement extraction.** Sources: MeasEval (SemEval-2021 Task 8), ChemDataExtractor 1/2, CQE, grobid-quantities,
AxCell, Hira et al. 2023.
- **Number and unit are solved; context is not.**
  - MeasEval human agreement: Quantity 0.943, Unit 0.866, Property 0.641, Entity 0.546, Qualifier (condition) 0.334.
  - The best systems are weakest on qualifiers.
  - CQE: value+unit F1 85.6, but the concept a quantity is about only 57.0.
- Systems that work across domains keep property and condition *vocabulary as data*:
  - ChemDataExtractor 2 declares each property as a model with a trigger phrase and nested condition models, which can
    be taken from another sentence or paragraph; sentence and table parsers are generated from the declaration;
  - quantulum3 and CQE keep units and entities in JSON;
  - AxCell uses curated name lists, which beat word matching for linking (top-1 76 vs 42).
- Table cell *roles* transfer to held-out tasks (AxCell: 77–93 F1); linking needs curated names.
- No benchmark annotates **basis**. PEE must define it and build its own reference.
- LLMs did not beat specialised systems on the full tuple, and they hallucinate or mis-normalise units. They are not a
  fit for PEE's runtime.

**C. Relations across a document.** Sources: DocRED, Re-DocRED, EIDER, SciREX, Peng et al. 2017, SemEval-2010 Task 10,
FrameNet, TAT-QA, SemTab.
- A test result is an n-ary frame. The FrameNet frames that fit are `Operational_testing` (Tester, Product,
  Tested_property, Means, Circumstances, Result), `Measure_scenario` and `Using_resource` (its Portion role is the
  "0.9 kWh used").
- **Missing roles come in two types:**
  - **definite (DNI):** must be recovered from context ("this programme");
  - **indefinite (INI):** understood by convention (the implicit per-run basis).

  SemEval-2010 Task 10's organisers recommend scoring *three* steps separately: that a role is missing, its DNI/INI type,
  and its antecedent.
- Three evidence rules (same sentence, coreference, bridge) cover 88.5% of DocRED evidence (EIDER). In TAT-QA, 84% of
  errors are wrong or missing evidence, and the scale often sits only in headers.
- End-to-end scores collapse even when each component works (SciREX). So each role must be scored and gated, with a
  pointer to its evidence.

**D. Combining signals and constraints.** Sources: Snorkel / data programming, FlyingSquid, WRENCH, SHACL, PSL / KG
identification, distant supervision (Mintz 2009, Riedel 2010), Snowball, active learning.
- **Turn cues into labelling functions that may abstain.** Measure coverage, overlap, conflict and accuracy on the
  sealed annotation.
- **Majority vote is a strong baseline.** WRENCH found no method that wins consistently.
- **Correlated cues (near-duplicate regexes) distort accuracy estimates,** so group them first.
- **Agreement between two sources does not say which is right.** It needs adjudication or a third conditionally
  independent source.
- **Knowledge-base labels are noisy.** The distant-supervision assumption failed 13–31% of the time (Riedel), so stored
  term→concept pairs are weak labels, never gold.
- **Bootstrapping new expressions drifts unless guarded:** reject an expression that scores for two mutually exclusive
  concepts, and let a person review it before promotion.
- **SHACL Core and named custom constraints** express cardinality, value types, conditional logic and property-pair
  comparisons. JSON Schema cannot compare one value with another.

**E. Comparability.** Sources: VIM, GUM, ISO/IEC 17025 and ISO 13528 (via EA, Eurachem and NIST summaries), EU
2019/2017, 2019/2022, 2023/2534 and 2019/2013, AHAM AC-1-2020, RTINGS, CHOICE, HouseFresh, the EU air-quality directives,
JCTLM, GRADE.
- **Comparability and agreement are different questions.**
  - *Comparability*: results are traceable to the same reference (VIM 2.46).
  - *Compatibility*: the difference is smaller than a chosen multiple of its uncertainty, *for a specified measurand*
    (VIM 2.47).
- **Labels and standards are formal measurand definitions:**
  - the dishwasher EPEC is measured on the eco programme at rated capacity, per cycle;
  - values for other programmes are "indicative only";
  - tumble-dryer energy is weighted over full and half loads;
  - AHAM CADR fixes the chamber, the conditions and a valid range.
- HouseFresh's PM1 CADR in a 728 ft³ room with incense is therefore a *different measurand* from AHAM CADR.
- **Publishers version their methods.** RTINGS calls converted older scores "approximations"; CHOICE splits 2023− and
  2024+; HouseFresh dates a sensor change.
- **Other domains grade comparability:** EU air quality accepts "equivalent" methods or "corrected" ones; GRADE rates
  indirect evidence down.

## 2. Corrections to Claude's earlier claims

1. **"S87b's 79% is not behind the state of the art" (research note B) is wrong.**
   - S87b *classified* condition texts already isolated by the gold set (oracle spans).
   - MeasEval systems had to *find* qualifier spans in raw text.
   - The numbers are not comparable. S87b says nothing yet about finding conditions in pages.
2. **S87a §4 "no new inference engine is needed" stays a hypothesis.** The sources support a frame-and-roles
   representation with per-role evidence and declarative constraints. Whether PEE's existing rule engine (knowledge_link
   programs) can carry it is untested.
3. **S87b's comparability key is a pre-selection, not comparability** (the owner's point). VIM, LOINC, AHAM and RTINGS
   all require the procedure and its version, the conditions with their intervals, and the uncertainty.
4. **S87b's `observation_model.ts` added 13 more cue regexes,** reproducing the pattern the sources advise against.
   Its structural principles (quantity kind as condition axis, relation before object) agree with the sources. Its
   content vocabulary should move to data.

## 3. The 267 linker disagreements (diagnosis; `evaluation/s87c/`)

The two linkers are Phase272 `linkTypedToMeasure272` (word overlap over typed candidates) and `knowledge_link`
`linkUnderKnowledge` (S81 rule programs). The census input is 472 gold observations as a perfect reading would give
them:

| | agree | only Phase272 | only rules | both, differ | neither |
|---|---|---|---|---|---|
| Observations | 32 | 168 | 45 | 54 | 173 |

**Blind adjudication.** The sample has 44 items, stratified and deterministic, sealed by hash before judging. Candidate
order was randomised, so the adjudicator, a Claude agent, did not know which linker proposed which candidate.

| Stratum | Result |
|---|---|
| only Phase272 (16) | Phase272 right 13; neither 2; unclear 1 |
| only rules (12) | rules right 9; neither 2; unclear 1 |
| both differ (16) | both acceptable 13; rules right 3 (standby power); Phase272 alone right 0 |

**Reading.**
- Each linker abstains where the other links, and the one that links is usually right (about 80% in each stratum).
- The 54 conflicts are almost all *overlapping concepts*, all on air-purifier power:
  - `cadr_noise_power_curve` and `mode_power_and_tco` both contain "watts per fan setting";
  - the teaching bundles several measurands into one concept.
- I-ADOPT's composition (property + object + constraints) would make these separate measurands with shared parts.
- The rule linker links 24 values to a measurement of a different kind; the Phase272 linker cannot do that by
  construction.
- Strata are small, so wide uncertainty applies. FlyingSquid's result explains why this adjudication was necessary: the
  agreement counts alone could not say which linker is right.

**Teaching inventory (store copy).**
- 218 items in 7 categories. All are `proposed_unverified`; 214 are `assistant_authored_unreviewed`.
- 200 relations: `requires_condition` 81, `measured_by` 63, `not_sufficient_for` 49, other 7.
- Concepts carry **no explicit lexical layer**: terms are derived from names and statements at compile time.

**Code inventory.**
- 338 word-list regexes in 73 files (about 4,300 alternatives).
- The same notions are recognised repeatedly: settings in 20 files, test cues in 9, basis in 11.

## 4. Draft scientific contract of an observation (for owner review; not implemented)

Sources per field are in brackets. Every identity slot has three possible states:
- **stated**, with an evidence pointer;
- **inferred**, with the convention or knowledge item that supplied it (INI);
- **unknown**.

An unknown slot never counts as equal.

```
Observation
 subject
   productOfInterest      model identity (never merged on name)                     [O&M ultimate feature; PEE rule]
   unitTested             the unit/variant/firmware actually tested                 [O&M proximate feature; RTINGS retests]
 measurand  (identity: what was measured)                                          [VIM 2.3; I-ADOPT; LOINC]
   property               reusable property term (energy use, run duration, sound level, clean-air delivery…)
   quantityKind           QK kind (dimension is not identity)                       [QUDT; VIM 1.2]
   objectOfInterest       appliance | programme run | batch/portion | room air | picture
   basis                  {per: run|100 runs|year@usage|portion|hour|none, state: stated|inferred|unknown}
                                                                                   [EU 2019/2017 Annex I; LOINC time aspect]
   timeAspect             point | over run | over interval(d) | max/min over interval
   statistic              single run | mean of n | weighted (full+partial) | derived estimate     [I-ADOPT; EU 2023/2534]
   constraints[]          {target, dimension: programme|mode|setting|load|content|distance|sample|…, value, state, evidence}
   scale                  quantitative | ordinal score | nominal | narrative                       [LOINC scale]
 value                    raw value + raw unit + rounding as published; normalised value (unit only)
 valueLayer               measurement | derived calculation | publisher score | rank | declared value   [RTINGS; EU Annex IX]
 procedure                {ref: standard+edition | publisher method, status: standard_unmodified|standard_based|in_house|undocumented,
                           version|era (+ source), calculationRef}                                  [VIM 2.6; ISO/IEC 17025; RTINGS]
 parameters[]             instrument (+ change date), operator, event settings not in the measurand [O&M 9.2.4; VIM 2.22]
 influenceConditions[]    ambient T, RH, supply, room volume… with stated intervals; completeness   [VIM 2.52; AHAM 4.2]
 context                  link to a shared test-session observation of the same document           [OBOE hasContext]
 uncertainty              stated | prior + source (label tolerance, AHAM precision, n runs) | unknown; validity range  [GUM; AHAM]
 evidentialRole           independent test | manufacturer declaration | retailer | reviewer claim  [PEE non-negotiable]
 provenance               publisher, document, per-role evidence pointers (block, cell, header, section), test/publish/port dates,
                           extractor and knowledge versions                                         [SciREX/TAT-QA lesson; PROV]
 unknowns[]               identity slots not established                                           [VIM 2.47 needs a specified measurand]
```

### Constraints, written as shapes (SHACL-style; to be checked in code with a structured report)

- **Value fields.** A `value` has a raw unit, or the unit is in `unknowns`.
- **Basis.** A quantity of an extensive kind (energy, volume, money, duration of use) has a `basis` with a state; an
  `inferred` basis names its convention.
- **Declarations.** A `declared value` is never `evidentialRole = independent test`.
- **Comparability.** Two observations may be graded C0–C2 only when quantityKind, basis, timeAspect and statistic are
  equal (or convertible with a named conversion) and no constraint slot is `unknown` on either side.

## 5. Comparability as a graded relation (replaces "the key")

The scale comes from note E: C0 identical, C1 equivalent, C2 convertible, C3 related but not comparable, C4 not
comparable, CU unknown. It is computed per pair and per purpose.
- **Within a publisher:** same procedure *version or era*, same value layer, instrument continuity and same
  constraints. Without a recorded version, the grade is limited (RTINGS, CHOICE and HouseFresh show why).
- **Across publishers:** the same named standard, or knowledge that the procedures do not split results (LOINC rule).
  Otherwise C3 at best.
- **Agreement (only for C0–C2):** ζ = Δ/√(u₁²+u₂²), with the sources of the uncertainty priors shown. |ζ| ≤ 2 agree;
  2–3 questionable; ≥ 3 disagree.
- **Sufficiency for a need:** the GUM 3.1.3 completeness "with respect to the required accuracy", downgraded GRADE-style
  for indirectness, inconsistency and imprecision.

## 6. Evaluation protocol for the next step (adopted from the sources)

- **Per-role scoring.** Each role (property, basis, every constraint, procedure, instrument, product) is scored apart;
  end-to-end is reported too. Missing roles are scored in three steps: missing or not, DNI/INI, antecedent.
- **Evidence pointers.** Each role carries one, and evidence errors are counted separately (TAT-QA).
- **Group splits and worst group,** as in S87b. A blind reference is sealed before scoring. Claude agents are labelled
  as such.
- **Labelling-function accounting** for every cue family (coverage, conflict, accuracy), with majority vote as the
  baseline for any combiner.
- **The reading boundary must be measured on pages, not on oracle spans.** This needs pages with retained bytes:
  - the 12 S80 pages now;
  - fresh pages under an owner policy.

## 7. Proposed sequence (each needs an owner decision; nothing started)

1. **Agree the contract (§4) and the comparability scale (§5).** Then plan one versioned store migration that holds them,
   instead of several partial ones.
2. **A lexical/vocabulary layer as knowledge data.** ChemDataExtractor-style declarations: property models with trigger
   terms and condition models, stored with the teaching and reviewed by the owner. The S87b structural classifier and
   the existing cues become abstaining labelling functions, measured on the sealed annotation.
3. **Decompose the bundled teaching measurements** into property + object + constraints (I-ADOPT). This removes the
   overlap behind the linker conflicts. Then one linker, with the adjudicated sample as a regression check.
4. **Validation from knowledge.** The graded comparability replaces Phase268's publisher constant, in shadow first.
5. **Reading on real pages.** Per-role evaluation on S80 pages now, and on fresh pages once the standing research policy
   is confirmed.

## 8. Limits

- Research notes were produced by Claude agents. Claude spot-checked three load-bearing claims at the source; other
  claims rest on the agents' "verified (read)" marks.
- ISO texts (17025, 13528, 19156 full), LOINC's own guide, IEC 60436 and IEC 63086 were not readable (403) or only via
  summaries.
- The adjudication and the S87b annotation are by Claude agents, not independent human experts. The adjudication strata
  are small.
- Nothing here changes PEE's behaviour. The 206 answers are unchanged.
