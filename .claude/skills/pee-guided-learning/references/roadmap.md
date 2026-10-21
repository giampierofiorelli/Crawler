# PEE roadmap — the path ("il selciato")

**Owner request (2026-10-18):** "non so se c'è un modo per fare una road map che tu possa memorizzare così che non
esci più dal selciato".

**How this roadmap is kept in mind.** Claude has no memory between sessions; the repository is the memory.
- The SessionStart hook (`.claude/hooks/pee-knowledge-session-start.sh`) prints the **Current step** line below at the
  start of every session.
- `CLAUDE.md` and `SKILL.md` §1 (item 0) send every piece of PEE work here first.
- Changing a step's goal, its order, the architecture or the resources needs an owner decision, recorded in
  `decisions-and-supersessions.md`.
- Claude adapts engineering details and experiment designs autonomously, giving reasons in the report (owner,
  2026-10-18, S64). Ordinary technical progress needs no approval.
- Claude may propose amendments, marked *proposed*. Claude never moves the Current step without meeting the step's
  exit criteria and recording the owner's review.

**Kinds of source; keep them apart (owner, S64).** A research note or an external evaluation inserted here does not
become a mandatory rule.

| Source | Status |
|---|---|
| The owner's decisions | project requirements |
| Scientific research | knowledge and methodological reference |
| Evaluations by other assistants the owner consults (e.g. the FC review) | recommendations, to be verified |
| Claude's technical choices | justified and demonstrated in reports |

This matters most for higher-order reasoning, where alternatives are still to be tested.

Sources:
- the owner's FC review and engineering research, verbatim in `research-fc-review-2026-10-18.md`;
- the permanent mission (SKILL.md §0);
- the higher-order learning decision (`generalization-method.md` Part D, S58);
- decision S63.

**Current step: R3 — scientific knowledge consulted in reading, with translation fidelity and completeness (owner S68, S72); closing consolidation R3-C with exit criteria C1–C4 (owner S80). Read §3 R3, R3-C and the §4 checklist before any work.**

## 1. Destination

**The cycle to demonstrate, in PEE's software and not in Claude's head:** scientific knowledge → general relations →
justified inferences → transferable learning.

**What PEE must know:** what a product can do, how it does it, how well, under which conditions, and which evidence
supports each claim. Progress is measured by evidence correctly understood, attributed and justified on data not used
to build the method, not by rules, terms or tests added.

## 2. Maturity: report every capability on two separate axes

**Level:**

| Level | Meaning |
|---|---|
| L0 proposed | written as an idea or plan |
| L1 documented | specified in the skill or a plan, with exit criteria |
| L2 implemented | code and synthetic tests (tier T1) |
| L3 measured on development data | first run unchanged; later runs labelled TUNED; the set then counts as spent |
| L4 demonstrated on independent data | a sealed reference, data not used to build it, a first run |
| L5 operational | on the user's path (T3), with the advice consequences checked |

**Kind:**
- *vocabulary*: words that recognise things;
- *inference*: rules that derive conclusions from facts;
- *learning*: rules or relations acquired by PEE, not written by Claude;
- *transfer*: what was acquired in one category improves another category without manual correction.

Never report vocabulary growth as learning, nor inference as learning. Claude learning as a developer is not PEE
learning as software.

**Status on 2026-10-18 (honest baseline):**

| Area | Level | Kind | Note |
|---|---|---|---|
| 1G tables + QK typed quantities | L3–L4 | vocabulary + inference | KV unseen validation (S59) |
| KR engine (programs kind, compare, scope, record) | L3 | inference | rules written by Claude |
| WD whole-document reader | L4 once (KV first run), now spent | vocabulary + inference | |
| QE qualitative evidence | L3 | vocabulary + inference | the facet hypothesis is only at L2 |
| FC product facts (functions, components, modes) | L3 | vocabulary + inference | rules M6, E2, E5–E7 under review (R1) |
| Rule learning by PEE | L0–L1 | learning | `generalization-method.md` Part C proposed, not built |
| Cross-category transfer | L0–L2 | transfer | no demonstration on unseen data |
| Use of FC, QE or WD in advice | none | — | shadow only |

## 3. Steps, in order

Each step names its exit criteria. A later step does not start before the earlier one exits, unless the owner decides
otherwise.

### R1 — Conformity verification against the existing skill (COMPLETE: owner review 2026-10-19, S68)

**Owner (2026-10-18):** "non manderei ancora Claude a sviluppare un'altra serie di funzionalità": first verify the
existing architecture and the demonstrated capabilities.

1. **Map of where knowledge lives,** per module (1G, QK, KR, WD, QE, FC, the teaching):
   - what is declarative knowledge (data);
   - what is executed logic (KR programs);
   - what is embedded in TypeScript recognisers (regexes, cue lists in code);
   - with counts (the complexity account of `generalization-method.md` B4).
2. **Audit of every rule** in `rules.v2.json` and `product-rules.v1.json`: what inference it licenses, what it does not,
   and what further evidence it needs. Specifically:
   - **Negation as failure.** Classify each use: is it closed over a record declared complete for that question, or
     open? Example: M6 turns "equivalence not shown" into "different state". The correct reading is "relation
     unknown" unless a difference is documented.
   - **Function ↔ performance links.**
     - E2: a value measured in the function's mode is not evidence about the function without a scientific relevance
       link between the metric and the outcome. For example, 8 W in auto mode says nothing about air quality held.
     - E5 and E7: what is said about the component or mode is *relevant to* the function. It *supports* only a bounded
       conclusion, scoped to method, product, configuration and conditions.
     - E6: an unspecified sensor cannot be tied to a specific function.
   - **Comparability and causality** in `compare` and `record`.
   - **Tests on derivations, not only on rule shapes:** combined relations (component + mode + observation), with
     metamorphic cases. Preserve every valid inference: an equivalence replay must show which conclusions change and
     why.
3. **Competency questions answered by the software, with derivations.** At least:
   - a declared function vs one verified in a test;
   - why two measurements do not compare;
   - an auto-mode result relevant to consumption but insufficient for control quality;
   - a new scientific relation used on an unseen product;
   - a conclusion withdrawn after a contradicting result;
   - unknown vs documented-different settings.
4. **Mechanism status table:** every mechanism the skill describes, marked operational, documented only, or proposed.
   Synthetic tests do not make a capability demonstrated.
5. **One knowledge-isolation experiment:** does the existing scientific knowledge (taught outcomes, `measured_by`,
   methods, facets) change interpretation on a category not used to build it? Run it as an ablation (knowledge on or
   off), or report that the software cannot yet do it, and why.
6. **Out of scope in R1:**
   - new recognisers or vocabulary;
   - use in advice;
   - new acquisition;
   - a new architecture or new technology.

**Exit (the owner's criteria, S64), each shown with code and experiments:**
1. Rules draw no conclusion stronger than the evidence, also when several rules combine.
2. Stored scientific knowledge, applied rules and hand-coded behaviour are clearly told apart, with counts.
3. Consulting scientific knowledge has a measurable effect on at least one PEE capability, or the report says
   exactly why it has none today.
4. The report says, without inventing results, which learning and generalisation mechanisms are operational and
   which are missing.

A negative result on any of these is a diagnosis, not a failure. R1 must change our understanding of what the system
really does. It must not be another phase of many tests and a document. Its central question: **how much of what PEE
does comes from knowledge, and how much from behaviour Claude wrote into the code?**

**Added exit criterion (owner, 2026-10-18, S66).** Inherited rules and knowledge (the older reading stack, the store's
teaching) are evaluated for correctness, utility, generality and consequences on decisions before any of it is migrated
or reused.
- Proportionate, not a new phase: highest-consequence rules first. These are product identity and evidence attribution,
  admission of evidence, exclusions, comparability, effectiveness claims and must-have requirements. Simple
  recognisers come later.
- Classify each rule or relation: a general scientific principle, a technical convention, an unconfirmed hypothesis, a
  shortcut for particular cases, or one that is superseded or in conflict.
- Verify knowledge against its source: does the cited source support the relation, not merely exist (ProVe)?
- Old behaviour is characterisation, not truth (Feathers): agreement with it proves continuity, not correctness.
- **Architecture:** unifying knowledge and reading responsibilities is the goal (Strangler Fig, through a reversible
  seam). Not yet decided: migrating the old rules wholesale, or retiring either stack. The decision follows a reversible
  experiment on the same documents and criteria:
  - A: the old stack with its teaching;
  - B: the new stack alone;
  - C: the new stack consulting validated knowledge;
  - C with the knowledge removed again (does it change anything, and why?).
  Precision, coverage, attribution and inference correctness are reported. Spent references serve diagnosis only.
  Independent confirmation needs data unused in development.
- **Wording:** "PEE learns nothing by itself" means no operational induction of rules or relations. PEE does reuse
  knowledge, store experiences and apply inferences. What is missing is a verified cycle that turns new evidence into
  generalised, controlled knowledge.

### R2 — Justified inference layer, across the KR programs (COMPLETE as experimental infrastructure, not as a validated scientific capability: owner S72)

- **Epistemic status of relations:** documented same / documented different / unknown / controversial.
- **Negation** only under declared completeness.
- **Evidence relations:** relevant_to, supports, refutes, requires_condition, derived_from, unresolved. These are the
  owner's illustrative names, not prescribed predicates.
- **Bounded conclusions:** method, product, configuration, conditions.
- **Defeasible re-derivation** when premises change: versioned derivations, conclusions withdrawn when they lose
  support. Build on KR proofs (PROV-style); no new provenance infrastructure.
- **Exit:**
  - metamorphic tests pass: renaming a product leaves the inferences unchanged; removing the only support withdraws
    the conclusion; changing a mode changes the result's conditions;
  - no unexplained regression in the equivalence replays.

**Owner authorisation and conditions (2026-10-19, S68; verbatim in `owner-r1-review-r2-authorisation-2026-10-19.md`).**
- **The newer reader is the architectural reference base for the integration, not yet the operational substitute** for
  the older one. The older reader stays available for comparison and operational continuity until the newer one is
  shown to preserve the needed capabilities along the whole request → advice path.
- **Typed, reversible integration** reusing QK, KR, WD and the teaching already in the store. The older lexical link is
  not carried over wholesale.
- **Ambiguity is resolved with knowledge:** methods, conditions and scientific relations, never by inventing
  equivalences or attributions. Among the values left ambiguous (79 in C2), tell apart justified abstentions from
  missed uses of knowledge PEE already holds.
- **Scoring rewards both directions:** fewer wrong inferences *and* more correct conclusions recovered. Lowering false
  positives by abstaining more is not success.
- **Graded evidential force, not a binary** (supersedes the S67 proposal that only "establishing" relations may
  authorise a ranking). Tell apart:
  - direct evidence of an outcome;
  - a partial contribution to assessing it (several measures and observations together may assess it);
  - an indirect indicator only;
  - insufficient evidence.
  A conclusion is authorised only after checking the sufficiency of the whole evidence set, its conditions, the
  independence of its items and the user's specific need. The `measured_by` authority (D26) is corrected this way
  before any use in rankings.
- **Shadow only:** no automatic transfer of new conclusions into the store or the rankings.
- **Principle:** PEE must use the scientific knowledge it holds correctly, and also recognise the knowledge it lacks,
  the knowledge not yet translated, and the knowledge that is only partly sufficient.
- **Fixed condition:** R2 must not become another system of specific recognisers. It improves general mechanisms, and
  keeps the ability to recover valid knowledge, not only to avoid wrong knowledge.
- **Not in R2:** the full translation of the scientific documents (R3).

### R3 — Scientific knowledge consulted in reading

- Taught outcomes, `measured_by`, methods and facets generate interpretation hypotheses. The text verifies them;
  explicit facts and inferences stay apart.
- A functional model (verb–object with flows: Functional Basis principles; device / function / state / property: SAREF
  principles), inside the existing declarative structures. It reads functions described by actions, not only by
  names.
- **Exit:** an ablation shows a gain attributable to knowledge, not to added words, on documents and categories not
  used to build it, with the complexity accounted for.

**Consolidated R3 brief (owner, 2026-10-19, S73; verbatim in `owner-r3-brief-2026-10-19.md`).** Operative summary:
- inventory the owner documents actually available (names, paths, versions); prefer air purifiers, coffee, air fryers;
- source-first inventory of the documents' knowledge (mechanisms, physical/chemical relations, causal and conditional
  claims, methods, compound procedures, quantitative evidence, expert judgements, limitations, conflicts,
  applicability, consumer outcomes); compare with the store: correct / partial / distorted / missing /
  represented-but-unused;
- representational adequacy and genuine gaps, keeping principle / source observation / expert judgement / hypothesis /
  verified evidence apart; teaching is never promoted to validated proof;
- the smallest general mechanism **inside PEE** that acquires knowledge from documents with provenance, scope,
  uncertainty and reversible validation, reusing QK/KR/WD/QE/FC and the store (Claude's manual inventory is not PEE's
  capability);
- fidelity in both directions (document → structure → checkable statement): omissions, distortions, unjustified
  inference;
- operational benefit by before/after and knowledge ablation, separating base-reader limits;
- held-out sections or groups; same-model blind annotation is not independent human validation;
- references: CommonKADS (domain / inference / task), Rosetta Statements (typed statements that render back to a
  checkable sentence), ORKG (questions, methods, conditions, findings, comparability), NeOn (reuse, no duplicate
  ontologies), Functional Basis, SAREF;
- diagnostic cases (empty-run vs cooking energy, SDR/HDR, aged filter, compound cost) are tests of general mechanisms,
  never category recognisers;
- **success:** a reusable translation/consultation mechanism with a measured improvement beyond vocabulary, with
  traceable, bounded conclusions. Shadow only; no acquisition; original sources not retrieved.

**Translation fidelity and completeness are a core part of R3 (owner, 2026-10-19, S68).** R1 checked the relations
already translated (160 of 180 supported); it says nothing about what the documents hold that was never translated
(explanations, conditions of applicability, causal mechanisms, qualitative expert observations).
- Use material already held. Start with two or three documents of different knowledge types: one dominated by
  physical phenomena, one by chemical processes, one rich in qualitative observations.
- Measure translation fidelity, the relations lost, and above all how much the knowledge improves PEE's behaviour.
- Ask whether PEE can acquire that knowledge through a general procedure, so acquisition becomes a capability of PEE
  and not a task Claude repeats per category.
- Methodological references, without imposing new frameworks: CommonKADS, Rosetta Statements, ORKG, NeOn.
- Extend to other categories only afterwards.

### R3-C — Consolidation and validation (owner S80, 2026-10-19; verbatim in `owner-r3-consolidation-2026-10-19.md`)

R3 stays the current step. No feature expansion, no new categories, no LLM experiments, no new large methodological
research, no tuning on the same data. Exit criteria, all measurable (proposed by Claude from the owner's four
priorities; the owner reviews R3 closure):
- **C1 integrity.** Store, code, knowledge and active rules are verifiably in sync:
  - a session restores a live store that is behind the snapshot;
  - `sync` never saves a stale or diverged store over a newer snapshot (tests);
  - every evaluation run records the store schema and journal head, the snapshot commit and the active rule and
    knowledge versions it used.
- **C2 decision safety.** End-to-end tests on the request → advice path show three things:
  - a withheld authorisation never orders products, whatever signed catalog is supplied;
  - no machine-translated statement reaches any user-facing field;
  - the two withheld pairs carry a recorded validation status.
- **C3 independent end-to-end validation.** The setup:
  - genuinely new realistic requests;
  - a reference sealed before the run;
  - a frozen build;
  - live acquisition only within the authorised budget;
  - the first run committed unchanged.

  Scored per request and stage: goals understood; evidence needed; sources read; attribution; evidence classification
  (valid measurement, commercial declaration, insufficient); decision (justified ranking or precise missing
  evidence). The first failing stage is named.
- **C4 generalisable improvement.** Corrections made after C3 improve the end-to-end outcome on new material held back
  from diagnosis and fixing, with both builds run once, and add no new harmful conclusion. Otherwise R3 stays open
  and the result is reported as it is.
- **Amendment 2026-10-21 (first increment A1–A4; owner authorisation verbatim in
  `owner-first-increment-authorisation-2026-10-21.md`).**
  - **C2** now holds under every experimental option (arms A, B, C-lite) and on the ranking path. Experimental
    inferences sit only in fields listed in `EXPERIMENTAL_FIELDS253`, declare themselves unreviewed and have no decision
    effect. A source scan fails when a new reader of those fields appears without review
    (`tests/i1_experimental_isolation.test.ts`). The two withheld pairs are pinned end to end
    (`tests/i1_withheld_pairs.test.ts`).
  - **Contract.** It records the measured request path (imports and executed modules per option;
    `tests/i1_reachability.test.ts`).
  - **C3/C4 scoring limit.** While evidence validation, comparable assessment and authorised ranking are blocked, the
    decision stage is scored only on these:
    - justified abstention;
    - precise missing evidence;
    - unjustified abstention, counted as an error;
    - harmful conclusions.

    Ranking quality is never scored then (`evaluation/r3c/c3-c4-scoring-limits.json`, tied to the contract by
    `tests/i1_c3c4_scoring_limits.test.ts`).

Source discovery is Claude's in C3: PEE has no configured search service (Phase223 needs an operator SearXNG
endpoint). This is reported as a limit of the path, never as PEE capability.

### R3-P — Experimental pilot: negation foundation and knowledge-guided needs (owner 2026-10-20; verbatim in `owner-r3p-authorisation-2026-10-20.md`)

An explicitly experimental work package beside R3-C. It does not change R3-C's restrictions, does not redefine R4
(within-document evidence linking) and does not renumber later steps.
- **Stage 1:** one typed mechanism for clause boundaries, negation scope, polarity and contrast, shared by request and
  document readers, with proposition negation kept apart from requirement negation; evaluated on new sealed material
  against S103.
- **Stage 2:** a knowledge-path switch in one build. Arm A: switch off. Arm B: existing scientific knowledge connects
  user contexts to scientific objectives through typed, attributable relations. Arm C-lite: knowledge-derived candidate
  relations admitted as experimental, shadow only.
- **Stage 3:** preregistered evaluation on licensed real consumer wording (Phase251 protocol) plus fresh agent-authored
  requests, blind references, first runs unchanged; categories air purifiers, coffee machines/grinders, dishwashers.
- **Never:** an inferred need as a hard exclusion; production ranking; unreviewed knowledge treated as validated.
- **Exit:** the consolidated report answering the owner's seven questions. No claim that R3, R4 or R5 is complete.

### R4 — Evidence linking across the whole document

<!-- S85 (owner decision 8, 2026-10-19): heading restored as it was before commit 842550d removed it by accident; requirements and order unchanged. -->

- Conditions, modes, methods and products are linked across sentences, headings and tables, with coreference.
- Every link carries its location and confidence. References: DocRED, SciERC; ACOS and COQE serve as extraction
  components only.
- **Exit:** a sealed reference, with coverage and risk reported together (selective prediction).

### R5 — Rule learning by PEE

**Capability:** PEE learns general relations and rules from facts and counterexamples. ILP, Popper and MIL are
scientific references to evaluate, not an obligation to build a specific algorithm (owner, S64). The algorithm is
chosen by experiment, weighing performance, complexity and cost. Method principles:
- a bounded, typed hypothesis space;
- positive and negative examples from the experience cases;
- a counterexample store;
- promotion only after independent validation;
- comparison with the manual rules on complexity, errors and generalisation.

No ILP engine as a dependency unless an experiment shows a substantial gain.

**Exit:** at least one rule or relation acquired by PEE, not written by Claude, validated on held-out data.

### R6 — Transfer

- A relation acquired in category A improves category B, unseen, without manual correction. Report the worst group.
- **Data:** authentic documents already held may be used if they are genuinely independent and were never used to
  develop or correct the mechanism (owner, S64). A new acquisition needs the authorisations in force.
- **Exit:** a first run on independent data, unchanged.

**Throughout R1–R6 (owner, S64):** the full path from request to advice stays continuously verified, with shadow
experiments as needed, so the work never becomes a laboratory cut off from the final product (vertical-path fitness
tests, principle 2).

### R7 — Use in advice (only after R2, and after R6 evidence)

- A verified presence of a must-have function may determine eligibility.
- Effectiveness is never inferred from presence.
- Partial comparisons keep their labels.

### Deferred (not on the path unless the owner decides)

- a complete second-order engine;
- an external knowledge graph or RDF migration;
- large specialised models;
- paid services;
- per-category fixes.

## 4. Anti-drift checklist: answer it before starting work, and again in every report

1. **Step:** which step does this serve? If none, stop and ask the owner.
2. **Kind:** is it vocabulary, inference, learning or transfer? Say so plainly.
3. **Level and tier:** which level and tier will it reach? Give rates over the **whole** reference (e.g. 113 of 227),
   not only over what was reached.
4. **Unseen data:** would the gain hold on a category or document not used to build it? If untested, say "not shown".
5. **Complexity:** terms, rules and code added versus capability gained.
6. **Negation:** for every negation or absence, over which record is it closed, and is that record declared complete?
7. **Evidence links:** what exactly does each license (relevant vs supports vs refutes), and bounded to what?
8. **Integrity:** first runs unchanged; tuned runs labelled. Reference counts come from the sealed files, never from
   memory (the FC "670" was an addition error: the files hold 610).
9. **Owner's standing warnings:**
   - no per-category fixes;
   - no new architecture imposed;
   - preserve materials and history;
   - shadow until R7.

## 5. Progress log

- 2026-10-18: roadmap created (S63). FC is complete at L3. R1 opened.
- 2026-10-18: owner amendments S64 (autonomy on engineering details; sources kept apart; R1 exit criteria; R5 names a
  capability, not an algorithm; R6 data; the full path verified throughout). R1 started.
- 2026-10-18: R1 work done (`docs/plans/r1-conformity.md`, S65). All four exit criteria are answered: overclaiming rules
  corrected (kr.3, pr.3); knowledge and code separated with counts; a measured effect of scientific knowledge
  (acoustics 82 vs 42 of 120) and the diagnosis that the newer readers never consult the teaching; learning mechanisms:
  none operational. Awaiting the owner's review before R2, including the architecture question of the two reading
  stacks.
- 2026-10-18: owner review of R1 (S66). Added exit criterion: inherited rules and knowledge are validated before reuse;
  the reversible integration experiment A/B/C (+ ablation) decides the architecture. R1 continues.
- 2026-10-19: R1 continued (S67, `r1-conformity.md` §7). 180 inherited relations source-checked; most `measured_by`
  relations only inform their outcome (D26). Integration experiment: the newer reader is the better base; the lexical
  link is a shortcut; the typed link is safe but leaves many values ambiguous. All five exit criteria answered. Awaiting
  the owner's architecture decision before R2.
- 2026-10-19: owner review (S68): R1 complete; R2 authorised with conditions (the newer reader as reference base, not
  operational substitute; typed reversible integration; scoring rewards recovery as well as avoidance; graded
  evidential force instead of the binary S67 proposal; shadow only). R3 gains translation fidelity and completeness.
  Current step: R2.
- 2026-10-19: R2 work (`r2-typed-link-and-evidential-force.md`): typed link lk.1 and graded force (KR, shadow). Dev (spent): correct links 13 → 56, wrong 21 → 2. Link-unused set s1cd, first run: wrong 46 (lexical) → 11, correct 74 (lexical) vs 56 (C3); 77 ambiguous (exclusive-candidate assumption 50; untyped SDR/HDR and aged filter 27). Exit tests pass. Recovery not yet at the lexical link's level: R2 continues.
- 2026-10-19: owner clarification S69 (one observation, several analytical uses). lk.2: analytical sets, members, aligned points, dependent contributions. Unjustified set conclusions 6/22 → 0 (dev / tuned); correct links on s1cd 56 → 117 (tuned). No independent validation of lk.2 yet: no suitable unused pages held.
- 2026-10-19: owner review S70 → lk.3: observations identified by provenance; aligned points need shown compatibility; direct force capped through incompletely translated measurements. Direct force 20 → 0 on s1cd (tuned); the only aligned point rejected (a value read at two settings). Next in R2: what held material can still show; acquisition not yet authorised.
- 2026-10-19: owner review S71 → lk.4: positive compatibility, test identity, unresolved force. af (air fryers, link-unused, first run): lk.4 0 wrong vs 14 (lexical), 0 correct vs 8, 23 justified abstentions (13 outside the teaching, 10 untyped empty-vs-cooking). Held materials exhausted for independent link validation; targeted test-page acquisition would need authorisation (not requested).
- 2026-10-19: closure check (S72): protocol ≠ run corrected (lk.5: procedure = compatibility basis, never identity; no effect on data); R2 requirements table and regressions in `r2-typed-link-and-evidential-force.md` §8. R2 complete as experimental infrastructure. Current step: R3. No acquisition authorised.
- 2026-10-19: R3 first cycle (`docs/plans/r3-knowledge-translation.md`): blind source-first inventory 1,680 units; store holds 8% correctly, 20% partly, 72% missing, 169 represented but unused. PEE translator (typed statements, provenance, render-back, self-check) and question-driven acquisition of condition axes (reversible overlay); lk.6. Held-out first run (unchanged, blind same-model judges): faithful 43%, distorted 25% (negation lost), captured 23%, omitted 45%; after kt-cues.2 (TUNED): faithful 67%, distorted 5%, omitted unchanged. Operational (spent sets): +12 correct links, 0 regressions, all from the SDR/HDR axis acquired from the held-out TV package. Not yet: typed statements consulted in decisions; independent validation. Maturity: experimental.
- 2026-10-19: R3 cycle 2 (S74): sufficiency from translated statements vs R1+ reference: 0 derived (statements concern page proxies, not taught tests). Proxy limits on read values (annotation only): first run 24/173 apply, 0 harmful; subject-head rule (TUNED) 19/21 apply, 0 harmful. Binding constraint: identifying document subjects (85% untyped).
- 2026-10-19: R3 cycle 3 start (S75): held-out funnel: not extracted 19%, extracted other knowledge 26%, distorted 4%, kept not identified 21%, identified not consulted 30%, consulted 0.5%. Omission is extraction/representation (status, compound procedures, expert judgement, conflicts), not naming; consultation is the largest single loss; mapping correctness unmeasured.
- 2026-10-19: R3 cycle 3 alignment reference (blind, held-out sealed): identity-grade candidates are rare (6/393 dev, 19/382 held-out); half of mentions denote features, claims, sources (no store concepts). Cycle-2 identifier on held-out first run: 3 of 21 identifications correct, 14 related turned into identity. Lexical overlap is not identification; equivalence/hierarchy knowledge needed.
- 2026-10-19: R3 cycle 3: semantic-type gate (denotation dn.1 + v1 alignment), held-out first run: false identities 18 → 4, correct 3 → 2, precision 14% → 33%, recall ~10%; denotation 45%. Lexical evidence cannot reach true identities; options recorded (corpus distributional retriever; local model needs authorisation; document concepts + evidence-role-aware limits).
- 2026-10-19: owner review: v1 held-out missed 17 of 19 identities (16 unresolved + 1 wrong candidate), report corrected; the held-out alignment reference is now examined: later results on it are development evidence.
- 2026-10-19: R3 cycle 3 options 3 and 1: role-aware limits (guard; 2 trivial attachments; 213/327 values role unknown); document concepts 956/856 phrases, ~4% recur; corpus-distributional similarity = relatedness (aerosol~gas~particle). Retrieval has the identity in top 3 for 22/25; validation fails at every threshold (precision <= 33%). Identity validation needs semantic knowledge PEE lacks.
- 2026-10-19: S76 semantic-model experiment stopped. Fresh blind transfer reference (14 identities), first run: lexical 3/15 correct, v1 type-gated 1/4, NLI (deberta-v3-xsmall, concept->phrase) 4/15 with 7 related promoted, LLM Qwen2.5-1.5B 0/5. Costs NLI 0.1 s/pair 0.9 GB; LLM 1.5B 1.8 s/pair 9.3 GB. Criterion (clearly better identity recovery without promoting related) not met; no model integrated. R3 continues on extraction/representation and evidence-role reading.
- 2026-10-19: S77 architecture audit (docs/plans/r3-knowledge-translation.md §14). Verified: 15 translator defects (fixed; held-out blind fidelity TUNED faithful 367→404, distorted 29→22, units captured 265→289), reader evidence class (role agreement 35→113 of 327, 17 undecidable assertions), Datalog string comparison, orphan relations; evaluation defects (LLM readout, reach table without proposed_method, delta-scorer chain, duplicate limit pairs, circular retrieval claim, several miscounts) corrected. LLM 1.5B re-run with valid readout: still 0 identities (S76 stands). Production ranking: every measured_by authorises and conditions are pooled (phase253_request_advice.ts:172,176): reported, not changed, owner decision. Constraints on R3: store cannot represent conditions/scope/status/negation; identity knowledge absent; same-model evaluation.
- 2026-10-19: S78 (docs/plans/r3-knowledge-translation.md §15). Ranking authorisation ra.2 in production after a shadow census (ra.1 authorised 38 of 56 pairs incl. 20 inform-only and 5 unassessed; ra.2 15): store v9 relation_assessments (R1+ blind verification recorded: 16 establish, 37 inform only, 3 unclear); conditions per measurement. Store v10 knowledge_statements (6,118 translated statements, never ranking input) and labelled research caveats in advice (subject-only links, blind check 12/16 apply, 0 misleading; TUNED). Translator precision (held-out bad statements 66 -> 26 of 547, TUNED); attribution via prose-discovered names and model codes (s1cd correct 79 -> 93, wrong 5 -> 5; spent sets). Model experiments suspended. Bottleneck that remains: concept identity of document phrases.
- 2026-10-19: owner decision S80: R3-C consolidation opened (exit criteria C1–C4 above); work moved to one session (the other told to stop); C1 defect found and fixed at once: a container kept a Phase249 v3 live store while the snapshot was v10 (load skipped any existing store; the Stop-hook sync would have saved the stale store over the snapshot). Lineage check on load and sync.
- 2026-10-19: S80 R3-C work (`docs/plans/s80-r3-consolidation.md`). C1: snapshot lineage + integrity record. C2: ra.1 no longer selectable on the production path; end-to-end safety guards; both withheld pairs verified against sources, still withheld. C3: 6 new requests, 12 new pages, frozen build, sealed same-model reference: first failing stage S1 (request understanding) in 6/6; no request can reach a justified ranking (validation knows one protocol). C4 (fixes on D, measured once on H): silent drops 5 -> 0, S1 judge points 2 -> 3, reading 3 -> 7/33 measurements and 5 -> 13/36 declarations, 0 wrong products, 0 harmful conclusions; no decision changed. R3 NOT closed: no generalisable operational gain from scientific knowledge shown. Next: paraphrase-robust need recognition; a second validation protocol (owner authorisation needed).
- 2026-10-19: S81 (owner brief, verbatim `owner-r3-knowledge-operational-2026-10-19.md`; report `docs/plans/s81-knowledge-operational.md`). Trace: the acquired teaching reached the reasoning only in part (56 of 79 required conditions invisible and treated as met; comparability never consulted the teaching; 49 attribute-proxy relations unused; store verdicts not the default). Structured batteries over the real teaching (7 categories, gold before runs): best current code 31/65 dev, 27/55 held-back with 10 over-claims; kr81 (link-rules v8, shadow) 60/65 dev (TUNED), held-back first run 51/55 with 1 over-claim. Principle shown with knowledge on/off on the same algorithm across 7 categories: results compare only when every taught required condition is shown equal (held-back comparability: 13 correct / 0 over-claims vs 9 / 6 without the requirements). Real S80 pages (spent, development): 7 partial-evidence conclusions withdrawn, source-checked correct (the pages state no filter condition or decay control). Kind: inference over acquired knowledge (L2-L3, T1 + T2 census); not learning, not transfer. Blockers now on the connection side: 65 of 153 required conditions on real readings have no axis and no reader captures them (D27); wording reaches concepts only by aliases; ra.2 trusts catalog-declared conditionsMet (D28). R3 not closed: no user-facing decision changed (shadow).
- 2026-10-19: S82 (owner review of S81, verbatim `owner-r3-architecture-check-2026-10-19.md`; report `docs/plans/s82-architecture-check.md`). Duplication census: 12 readers of the teaching relations (requires_condition pooled per need on the user path, per measurement elsewhere), source type mapped to roles 3-4 times, five table readers deciding test vs declaration, sound under four names, seven unit tables, about six condition vocabularies with no translation. 'Not documented != different' audited across inferences; fixed in shadow (QK kr.4, link-rules v9), user-path conflations reported. D27 by extending an existing path (reader codes as overlay axes): on the store's 12 real rows, 4 of 8 energy rows identified as empty-run energy (S81: 0) and judged indirect only from the teaching, as Phase268's coded protocol does. D28 derivation in shadow. Sealed S82 battery (same author, mechanism check): pre-S81 7/19 (10 over-claims), S81 12/19 (4), S82 19/19 (0); without taught conditions 6/19 (8 over-claims), without reader axes 16/19. R3 not closed: nothing on the user path changed.
- 2026-10-19: S83 (owner review of S82, verbatim `owner-r3-consolidation-s83-2026-10-19.md`; report `docs/plans/s83-consolidation.md`). Consolidation, no new census or layer. User path: requires_condition per measurement (19 wrongly pooled lists in 8 measure/outcome pairs on 206 regression requests), conditions verified / incompatible / not verifiable, refusal renamed conditions_not_verified; 0 decisions changed. D28: validity per observation; the dimension as compiled and a restricted comparable group (two or more products) reported apart; shadow trace on the ranking path, no authorisation changed. First S83 battery run had 2 over-claims (one product's test read as showing a comparison condition), kept unchanged and fixed; final spent-set results equal S82 (19/19, 60/65, 53/55). Phase225 negation fixed (probe v3). Removed: pooled field, two-state fields, deprecated spec_test_evidence (src +164/-234 since S82); old rule files declared replay data. Kind: inference + consolidation; maturity L3 on the user path (conditions), L2 shadow (D28). R3 not closed: no independent material; the real catalog has no case where D28 would change a decision.
- 2026-10-19: S84 (owner review of S83, verbatim `owner-cross-system-audit-s84-2026-10-19.md`; report `docs/plans/s84-cross-system-audit.md`). Cross-system audit and integration design, alongside R3 (not an R step; R3 open, R4-R7 not advanced). Measured: on 206 requests the advice path executes 16 of 70 loaded modules (5,346 lines); 158 of 290 modules reachable from no entry point. Census: two request quantity typers disagree (six verified misreadings); features read as outcome needs; declarations can enter measured comparative rows (latent); live acquisition stores but does not enforce the policy file; about 6 robots policies; sufficiency ignores assessment independence (owner decision); no single observation-to-knowledge path though the store journal has the shape. S75-S77 models were tested only as validators; candidate-ranking hypotheses recorded, after consolidation. Proposed: A one quantity typing (first: request slice), B role gates, C candidate intake on the store journal, D one acquisition gate. Kind: architecture; nothing implemented.
- 2026-10-19: S85 (owner review of S84, verbatim `owner-s85-consolidation-2026-10-19.md`; report `docs/plans/s85-safety-and-quantities.md`). Cross-system work alongside R3 (no R step completed). Safety: same-model sufficiency no longer authorises ranking (13 census pairs -> 0); declarations kept out of measured comparative evidence and independent-result counts; the live wave enforces the owner policy before every request (offline rehearsal only). Intervention A on the request path: one quantity semantics (QK), six S84 counterexamples resolved, quiet/most reliable/feature boundary checks. 206 spent requests: 0 decision changes after one fix; 3 recoveries. Independent validation outstanding. Kind: architecture + vocabulary reuse; maturity L3 on the request path, regression tier only.
- 2026-10-19: S86 (owner review of S85, verbatim `owner-s86-extraction-quantities-2026-10-19.md`; report `docs/plans/s86-extraction-quantities.md`). Cross-system work alongside R3 (no R step completed): the extraction slice of intervention A. The quantity knowledge now types the operational test-lead and table readers (A-weighting, time denominators, CADR vs airflow kept; local unit tables removed) and stored rows on read; an observation-level declaration check shared by the prose and comparative readers keeps quoted specifications out of measured evidence. Development/regression only (12 spent S80 pages, store rows, 206 requests: no change in leads or advice; 5 of 7 leads newly typed). Kind: vocabulary reuse + evidence role; independent validation outstanding.
- 2026-10-19: S86b (owner review of S86, verbatim `owner-s87-capability-preservation-2026-10-19.md`; report `docs/plans/s86b-capability-preservation-and-recovery.md`). Cross-system work alongside R3 (no R step completed). The four-set capability check of S85/S86 restored 2 request capabilities lost in S85 and fixed shared gaps (206 requests unchanged). On the 12 spent S80 pages, measured against a blind sealed reference: the operational readers recover 6 of 125 measured results; the knowledge-compiled plan recovers 68, but without precision guards (settings, declarations, other products). The four-set rule is now permanent for every merge. S87 is deferred until the owner decides. Kind: evaluation plus restoration; maturity of knowledge-guided discovery: shadow, not operational.
- 2026-10-19: S86c (owner review of S86b, verbatim `owner-s86c-knowledge-guided-discovery-2026-10-19.md`; report `docs/plans/s86c-knowledge-guided-discovery.md`). Cross-system work alongside R3 (no R step completed). The measurement was verified first: scorer v2, real persistence, and a manual audit of the pairings. The knowledge-guided reading gained per-observation role, subject, repeat, boundary and structure controls (shadow, inside the existing reader). On the 12 spent pages, tuned: 53 correct results stored on the reviewed product, against 6 operationally; 0 attributed to the wrong product; 1 non-result stored; no legacy capability lost. Kind: inference (evidential role, attribution). Maturity: shadow, development-validated only; independent pages need an owner acquisition policy.
- 2026-10-19: S86d (owner brief, verbatim `owner-s86d-independent-validation-2026-10-19.md`; report `docs/plans/s86d-independent-validation.md`). Cross-system work alongside R3 (no R step completed). The independent run is blocked: no active owner policy covers it. S86c was frozen and the run pre-registered. Offline findings: (1) Phase268 validation admits one protocol for one publisher, so S86c's 84 stored rows validate 1 and no answer changes; (2) the S86c controls were learned mostly on one publisher; (3) PEE cannot distinguish named features from products, and the Step 1D-A inventory prototype (E) did not fix this (rejected). Kind: evaluation and architecture. Maturity: S86c shadow, development-only. Next: the authorised independent run, then knowledge-derived validation protocols in shadow.
- 2026-10-19: S87a (owner briefs, verbatim `owner-s87a-architecture-and-research-freedom-2026-10-19.md`; report `docs/plans/s87a-generalisation-and-research-freedom.md`). Cross-system work alongside R3 (no R step completed). Cause: capabilities are measured in isolation, and each stage keeps its own representation of what a value is (reader codes, QK type, taught measurement, Phase268 constant). Built in shadow: purpose-relative evidence assessment, with opt-in linking corrections. On 84 S80 rows: 22 can describe their product, 21 compare within source, 1 compares across sources (Phase268: 1); wrong links ~9/54 → 0/34. Research freedom: standing policy kind, temporary suspensions, Crawl-delay, back-off and a private archive; the standing policy awaits owner confirmation; no live request was made. Kind: inference and operational. Maturity: shadow. Next: store the measurement id and measurand words at reading time; shadow validation path from the assessment.
- 2026-10-19: S87b (owner decision, verbatim `owner-s87b-generalisation-2026-10-19.md`; report `docs/plans/s87b-generalisation.md`). Cross-system work alongside R3 (R3 not closed). Survival census of 472 gold observations through PEE's modules: 0 validated; the two linkers disagree on 267; the general condition axes carry 0% of stated conditions in 9 of 14 groups. Category-free observation model, developed on 2 groups and frozen: on 12 unseen groups, conditions 79% correct (existing 14%), measurand kind 259/268, stated basis 36/79; worst group 53%. Kind: inference and evaluation. Maturity: shadow. Next (owner decision): store the model per row; move content vocabulary into knowledge; validate on fresh pages.
- 2026-10-19: S87c (owner instruction and review, verbatim `owner-review-s87b-2026-10-19.md`; report `docs/plans/s87c-source-study-and-representation-contract.md`). Study and diagnosis, no implementation; R3 not closed. Sources (VIM, I-ADOPT, LOINC, O&M, QUDT, MeasEval, ChemDataExtractor, DocRED/SciREX, FrameNet null instantiation, Snorkel/WRENCH, SHACL, EU labels, AHAM, RTINGS versioning, GRADE) map each PEE failure to an established answer. Linker disagreements: complementary coverage plus overlapping bundled concepts (blind adjudication of 44). Draft observation contract and graded comparability (C0-C4, CU) for owner review before any store migration. Kind: evaluation and architecture. Maturity: proposed.
- 2026-10-19: S87c review and S87d (owner OK; contract v0.2 `docs/plans/s87c-observation-contract-v0.2.md`; report `docs/plans/s87d-observation-contract-first-step.md`). Contract v0.2 answers the four objections (qualitative results; three comparability questions; relevance-based unknowns; knowledge lifecycle). Step 1 in shadow: contract types, shapes and read-only adapters; the test table records no measured property; the qualitative table admits 63 of 310 gold judgements; all existing rows conform. Kind: representation. Maturity: shadow. Next: enrichment in shadow, knowledge lifecycle, condition relevance, then one additive migration (owner decisions).
- 2026-10-19: S87e (owner review of S87d, verbatim `owner-review-s87d-2026-10-19.md`; report `docs/plans/s87e-reconstruction-of-missing-meaning.md`). Contract v0.3; pre-registered reconstruction of unknown slots from original pages. On 61 unseen hosts the knowledge-as-data slots transfer (quantity kind 99% precision, scale 65/68); phrase-cue slots do not (object 30 wrong of 48, conditions 3/24) and are rejected; header bridge recovers basis on development pages. Qualitative and comparison reconstruction not testable offline. Kind: inference and evaluation. Maturity: shadow. Next: condition/object/basis knowledge as data with the lifecycle; structural roles; fresh pages need the standing policy.
- 2026-10-19: S88 (experimental continuation of S87c–S87e, owner correction verbatim `owner-s88-correction-2026-10-19.md`; report `docs/plans/s88-declarative-definitions-along-the-path.md`). Declarative property definitions (pd.2) consumed by attribution, interpretation (dimensions, relevance, basis), Q1 and reading plans; shadow. Held-out on two unseen categories (fresh pages, definitions sealed before): attribution exists where none did (58/69) but false attributions are too many (56/179; 13 after removing the refuted profile licence, tuned); reading not improved. R3 not closed; next: admissible unit scales, a result-role gate before attribution, embedded-JSON reading, a second fresh wave.
- 2026-10-20: S89 (owner review of S88 verbatim `owner-review-s88-2026-10-20.md`; report `docs/plans/s89-learning-definitions-and-independent-check.md`). Failed rule removed; known objects and plausible ranges as knowledge; definition learning with cross-publisher verification. Never-seen publishers: precision 80% (S88 code 36%), recall 48/113; learning yielded nothing (one measuring publisher per category); role below trivial. R3 not closed; next: document structure (spec boxes, tables) for role and label, more measuring publishers for learning, a second independent check.
- 2026-10-20: S90 (owner review of S89 verbatim `owner-review-s89-2026-10-20.md`; report `docs/plans/s90-document-structure-and-definitions.md`). Structure connected to the definitions (labels, role); learning with uncertainty states. Second independent check: recall 49% at 82% precision (S89 code 40%); role improved but below majority; learning not yet shown on independent documents. R3 not closed; next: unresolved-by-default role with page type, learning on a richer wave, a third check.
- 2026-10-20: S91 (owner review of S90 verbatim `owner-review-s90-2026-10-20.md`; report `docs/plans/s91-evidence-role-from-positive-evidence.md`). Documentary context to the definitions; role from positive evidence; per-role metrics. Third independent check on measurement-rich pages: property precision 97%, recall 56%; learned layer +2 (first held-out gain); positive-evidence role worse than the S90 model and the majority baseline (negative result, cause recorded). R3 not closed; next: link methodology to result tables (1G method links), S90 role as base, a new independent check.
- 2026-10-20: S92 (owner review of S91 verbatim `owner-review-s91-2026-10-20.md`; report `docs/plans/s92-algorithm-comparison-document-relations.md`). Algorithm comparison: 1G links reused, evidence selection, label model, R3 learning mechanisms. Development gains (D2 197 vs 181); independent check underpowered for measured values (6), D2/C1 beat S90 with 100% declared precision but stay below the majority baseline; links rarely reach the cited statement; never-taught category fails on two close definitions; R3 mechanisms no effect on new pages. R3 not closed; next: a check truly rich in measurements, argument-based evidence selection, definition relations, E3 concepts to definitions.
- 2026-10-20: S93 (owner review of S92 verbatim `owner-review-s92-2026-10-20.md`; report `docs/plans/s93-provenance-nature-links-learning-cycle.md`). Three effects checked on new pages: links improve (21% of distant provenance lines reached, from 4%) but not reliable; calculations now distinguished (60% precision) with low recall and no assumptions found; learned definitions not demonstrated. Label model audited as unreliable. Object resolution strong on development only. R3 not closed; next: table relations for calculations, calculation arguments, stronger concept verification, checks with same-kind conflicts.
- 2026-10-20: owner review of S93 (verbatim `owner-review-s93-2026-10-20.md`): stay in R3; S94 = three sequential, separately measured workstreams (joint table and document inference; hybrid vector-symbolic; controlled Qwen). The head-word `narrower_than` is superseded (decision row S93-review): relations are typed by kind and object (I-ADOPT) and remain unverified candidates.
- 2026-10-20: S94 (owner review of S93 verbatim `owner-review-s93-2026-10-20.md`; report `docs/plans/s94-consolidated-algorithm-evaluation.md`). Three sequential stages. Table relations (Stage 1) precise where HTML comparison tables carry the calculation (smartphones, development template: calculated 8 -> 48 of 94, 1 error) but untested on other publishers (no such tables); hybrid vector-symbolic alignment (Stage 2) negative for identity, positive for candidate retrieval; learned definitions unused; Qwen (Stage 3) negative and suspended by the owner (`owner-decision-qwen-suspension-2026-10-20.md`). R3 not closed: generalisation and operational validation not met. Next: table relations on a second publisher, aggregate rule restricted to statistics over a set, concept structure (object, quantity) before alignment validation. Kind: inference (tables), retrieval (vectors). Maturity: implemented, shadow.
- 2026-10-20: owner review of S94 and research on multi-view vector-symbolic representation and product qualities (verbatim `owner-research-s94-vectors-qualities-2026-10-20.md`): candidate direction for the step after S94 (MultiKE, GraphSAGE, TURL, OWL2Vec*, BLINK, SimKGC hard negatives; I-ADOPT, QUDT, SOSA/SSN, PROV-O; ACOS, Structured Sentiment Analysis, StarE, ISO 13299 for qualities). Not authorised work; no new instruction yet.
- 2026-10-20: S95 (owner "Procedi"; report `docs/plans/s95-multiview-concept-alignment.md`). Multi-view concept views derived from existing knowledge with a symbolic second stage: on a new blind reference (20 identities) identity not better than the lexical identifier (3 vs 5 correct); retrieval marginally better (18 vs 17 of 20); the S94 PPMI retrieval advantage did not replicate (15). Next for this direction: concepts must state object, quantity and conditions (knowledge, not inference from names) before a multi-view validator can be tested again. Kind: representation, retrieval. Maturity: implemented, shadow; identity not demonstrated.
- 2026-10-20: S96 (owner instruction; report `docs/plans/s96-scientific-entity-representation.md`). Typed scientific entities from the explicit knowledge PEE already held (QK metrics, teaching tables) connected to the existing attribution and qualitative readers as candidates. On never-seen publishers and the unfamiliar category monitors, attribution 1 -> 28 of 131 with no added false attributions. Teaching-row vocabulary, document validation, the PPMI hybrid and qualitative candidates did not show reliable value. Next for this direction: category profiles or document context for unfamiliar categories (67 refresh-rate values lost for want of a term), stated objects of interest, and use of the acquired conditions and traps in comparison. Kind: representation, transfer. Maturity: implemented, shadow; reuse demonstrated for display quantities only.
- 2026-10-20: S97 causal audit (owner review of S96; report `docs/plans/s97-causal-architecture-audit.md`). Since S88 every reading improvement lives off both operational paths (debt D30); within the paths, knowledge is lost at named steps (S96 overlay conditions, ingestion discarding QK conditions, teaching basis/scope as text, unread store tables) and two S89 decisions became wrong as knowledge grew. Restoring condition transfer fixes comparability safety without attribution cost (spent material). Next step needs an owner decision: the single operational reader and what the store keeps; no new recognition algorithm or category profile before that. Kind: architecture, integration. Maturity: diagnosis; counterfactuals shadow.
- 2026-10-20: S98 operational knowledge path (owner decision after S97; report `docs/plans/s98-operational-knowledge-path.md`). One shared scientific reading at ingestion, persisted in store v11 and read by the user path, both gated; integration fitness tests make shadow-only capabilities fail unless registered with debt. Independent check on 7 new pages: 19 of 60 values typed (baseline 0), 14 false under the sealed reference (3 real after adjudication), 0 decisions changed; kept gated by the owner's stop rule. Next blockers: bounds and standards vs results, nature from test narrative, recall, comparison-table subjects. Kind: integration, inference. Maturity: gated (validated on spent and new material, not promoted).
- 2026-10-20: S99 end-to-end semantic integrity (owner review of S98; report `docs/plans/s99-semantic-integrity.md`). Each reading now carries its observation identity and meaning into store v12 and the integrity check shows no field changed between reading and store and no product link without a stated subject. Two identity defects removed (value+unit duplicates; colliding keys). On new pages the stop rules hold but correctness equals S98's; the next causes are the extractor-type role of Phase245 rows, value-level vs sentence-level evidence, mm:ss times, threshold vocabulary and the S89 term-distance rule. Kind: integration, inference. Maturity: gated.
- 2026-10-20: S100 rule governance and operational semantic correction (owner review of S99; report `docs/plans/s100-rule-governance.md`). (a) Governance: one precedence policy in `knowledge_rules` (constraint > explicit > inherited > default; narrowest scope; equal-level disagreement abstains; defaults only presumptions), with load-time rejection of undeclared or contradicting rules, a registry of the remaining imperative rules in the contract and debt D31 for the conflicts not yet under it. (b) The extractor no longer decides role, nature or provenance: Phase245 rows, Phase265 leads and prose share one decision (os.2). Spent dev: role precision 87%, nature 81%, false product values 45 (S99 85%, 63%, 59), coverage 81 (S99 98). Two preregistered independent checks (11 pages, 6 new publishers): all stop rules hold; S100 becomes the gated reading. The table blocker is removed as a wrong decision (a new publisher's measured table: S99 17 of 17 specifications, S100 17 undecided) but not yet resolved to results (D31/TCX). Kind: inference, governance. Maturity: gated. R3 open.
- 2026-10-20: S102 rule lifecycle, declarative governance and user intent (owner review of S100; audit `docs/plans/s102-rule-ownership-audit.md`, report `docs/plans/s102-rule-lifecycle.md`). Rule lifecycle (active / under review / superseded / retired, with reason, consumers and evidence; superseded and retired rules never executed; invariants protected) in `knowledge_rules` and in the contract for imperative rules and historical guards; rederivation when rules, definitions or QK change; IR7 closed for leads; the statement introducing a table reaches the shared decision (1G table_context); the request bound and conflicting limits decided under the shared policy (request-semantics rq.1; 0 of 206 answers changed). Development (spent, fixed scorer): reviewed-product values correctly linked 78 -> 97 (S99 98) at S100 precision. S100 check sets (held out from S102 tuning): level with S100. Kind: governance, inference. Maturity: gated. R3 open.
- 2026-10-20: S103 rule admission, static analysis and request semantics (owner authorisation 2026-10-20; report `docs/plans/s103-rule-admission.md`). Admission records and invariant governance; named contests verified by a static analyser with declared coverage; request semantics rq.2 (intervals, strict/inclusive, force, correction, object, scenario, combination; RQ08 superseded); one bound reader; fast-check property and scoped metamorphic tests. Independent first runs: 40 Claude-authored requests (harmful 7 vs 8, closure 45/47 vs 29/45); 6 new table pages (no change, table introductions not shown working). D31: RQ08 and INVARIANT_GOV resolved; NEG_BOUND, HEDGE_AFTER, BUDGET_READER, REQ_VOCAB, INTRO_NEG, SCORER_PAIR, OS_ADMISSION added. Kind: governance, inference. Maturity: gated. R3 open.
- 2026-10-20: owner review of S103 and the brainstorming memo; read-only dependency study `docs/plans/post-s103-need-pilot-dependencies.md` for the shared negation mechanism and the knowledge-driven need-understanding pilot (A/B/C). Five owner decisions open, including where the pilot sits on the roadmap (R3-C forbids feature expansion). R3 open.
- 2026-10-20: R3-P opened (owner authorisation, verbatim `owner-r3p-authorisation-2026-10-20.md`): negation foundation, then the knowledge-guided needs pilot A/B/C-lite. Experimental; R3-C unchanged; R4 meaning unchanged.
- 2026-10-20: NR research study on implicit needs (owner request, verbatim `owner-needs-reasoning-research-2026-10-20.md`; `docs/plans/needs-reasoning-research.md`): serves R3-P question 6; no code; proposal N0-N3 awaits an owner decision after the R3-P report. R3-P pilot frozen and unaffected.
- 2026-10-20: owner review of NR (verbatim `owner-review-nr-2026-10-20.md`): N0–N3 not authorised; decision after the R3-P first runs, with failures classified into four causes. R3-P collection resumes as scheduled.
- 2026-10-20: before the scheduled R3-P resumption (owner: do safe work meanwhile): failure-cause diagnosis preregistered (`evaluation/r3p/needs-failure-causes.json`), needs assembly script, frozen 58676ef build prepared, and the read-only N0 inventory `docs/plans/needs-model-inventory-n0.md` (equivalences and 15 incompatibilities; no consolidation authorised).
- 2026-10-20: owner review of the N0 inventory (verbatim `owner-review-n0-inventory-2026-10-20.md`): N0 after R3-P results, without loss; separate incompatibilities, duplications, missing capabilities; diagnosis made multi-label before any run.
- 2026-10-21: R3-P report (`docs/plans/r3p-negation-and-needs-pilot.md`): negation foundation validated on sealed T1 (no new harm); knowledge-guided needs pilot weak on fresh material (B 10 of 100 correct, A 7); dominant first loss is category/target recognition, then relations lost in acquisition (K-lost) and selection. Next step awaits an owner decision. R3, R4, R5 not complete.
- 2026-10-21: owner decision after R3-P with the external architecture audit (verbatim `owner-decision-post-r3p-and-audit-2026-10-21.md`); audit verified finding by finding and one coordinated programme proposed (`docs/plans/coordinated-plan-after-r3p.md`: streams A–G, R5–R7 unchanged). Current step stays R3 / R3-C; implementation awaits owner authorisation.
- 2026-10-21: first increment of the coordinated plan (owner authorisation verbatim `owner-first-increment-authorisation-2026-10-21.md`; report `docs/plans/first-increment-report.md`). Stream A done (C2 permanent under all experimental options and the ranking path; measured reachability in the contract; withheld pairs pinned; C3/C4 scoring limits; R3-P cycles removed; engines); A5 census and guarantees only (no store change); N0 essential in shadow (D32); D1 census: of 4,391 documented situation/need/criterion/evidence relations, 1,910 sit in documents never translated and 266 of 2,481 survive in the store, causes demonstrated in the translator and the document selection. No decision changed (206 requests). R3 stays current; next steps (C, N1, N2, A5 structural) need owner decisions. Kind: integrity, safety, vocabulary, diagnosis. Maturity: A operational (tests); N0 proposed/shadow; D1 measured.
- 2026-10-21: owner review of the first increment (verbatim `owner-review-first-increment-2026-10-21.md`): design decisions on I-8 (request decides want and force; reviewed knowledge decides function -> outcome), N1 (compatible extension of phase247 relations with typed ends, conditions, provenance, review status; no second database) and A5 (full reconstruction from events or immutable versioned inputs; G2 kept). Proposed next sequence N1 -> C, with F/G (R4) in parallel; bulk translation of untranslated packages only after validation. Open: allow-list publication interface for C2; N0 validation on independent requests. Next phase awaits one consolidated instruction. R3 stays current.
- 2026-10-21: owner authorisation of the second increment N1 (verbatim `owner-n1-authorisation-2026-10-21.md`, research kept byte for byte). Preregistered before any code or gold (`evaluation/n1/preregistration.json`: L0-L4, held-out H1/H2 table rows and 48 fresh requests sealed blind, thresholds fixed in advance). Serves R3 (translation fidelity and completeness) and prepares C and R4 without anticipating their decisions. R3 stays current. Kind: vocabulary, inference (relevance only). Maturity: proposed.
- 2026-10-21: N1 result (report `docs/plans/n1-report.md`): row claims implemented in the same store (v14) with exact rebuild and journaled reviews; held-out first runs below the preregistered admission bar (H1 exact links 0.37/0.30; column pairs 0.81/0.66), so no claim is in the live store (D33); no gain in need understanding or retrieval on 48 sealed fresh requests (first loss: situation-only requests get no category; retrieval ignores request stances). 206 answers unchanged. R3 stays current. Kind: vocabulary, inference (relevance). Maturity: implemented in shadow, not validated; nothing operational.
- 2026-10-21: owner review of N1 (verbatim `owner-review-n1-2026-10-21.md`): N1 closed as a completed first experiment (representation and rebuild established; operational capability not validated; claims stay off the live store). Proposed third increment, not yet authorised: C in shadow (object roles, solution families, explicit insufficiency) and general semantic table understanding (method comparison, no new word lists), in parallel; hypotheses kept apart from needs attributed to the user; success measured also by handling new problems, recognising what PEE does not know and asking better questions. Full N2 and store restructuring not yet. R3 stays current.
- 2026-10-21: owner authorisation of the third increment (verbatim `owner-third-increment-authorisation-2026-10-21.md`): C in shadow and general semantic table understanding; preregistered in `evaluation/i3/preregistration.json` (fresh requests R, template-disjoint tables H3, development on spent material only). Serves R3 and prepares C and R4. R3 stays current. Maturity: proposed.
- 2026-10-21: third increment result (report `docs/plans/third-increment-report.md`): C implemented in shadow (object roles incl. rejected, justified hypotheses separate from needs, ask/abstain) and learned table methods compared; first runs on sealed fresh requests and template-disjoint tables below every preregistered threshold; nothing promoted (D34). Main measured limits: PEE knowledge covers 11 of 60 fresh requests' families; C forces known families on unknown problems; learned table semantics did not transfer across templates. R3 stays current. Kind: inference, learning. Maturity: implemented in shadow, not validated.
- 2026-10-21: owner review of the third increment (verbatim `owner-review-third-increment-2026-10-21.md`): proposed principle that PEE is a goal-oriented adviser (category as a tool, not the entry point), uncertainty classified by cause before acting (missing knowledge, retrieval, interpretation, algorithm, integration, genuine ambiguity), counterfactual failure diagnosis, cross-category need knowledge as the missing layer, autonomous research when knowledge is missing. No implementation authorised: next is a consolidated architectural review. Report correction: object-role assignment not demonstrated (7 of 18). R3 stays current.
- 2026-10-21: goal-first architectural review authorised (verbatim `owner-architectural-review-authorisation-2026-10-21.md`): read-only; separates demonstrated, disconnected, missing knowledge, algorithm and integration defects; proposes the next increment without starting it. R3 stays current.
- 2026-10-21: goal-first architectural review report (`docs/plans/architectural-review-goal-first.md`): the knowledge key (category) is the fundamental dependency; failures split into reachable-knowledge, representation, integration, absent-knowledge and algorithm causes; G1 (need-scoped knowledge + goal-first entry in shadow, integration fixes, typed research needs) proposed, not authorised. R3 stays current. Kind: diagnosis. Maturity: none changed.
- 2026-10-21: G1 authorised (verbatim `owner-g1-authorisation-2026-10-21.md`): diagnosis E1-E5 on copies, then need-scoped knowledge and a goal-first path in shadow. Serves R3 (need understanding) and prepares research from gaps. R3 stays current. Kind: vocabulary, inference. Maturity: proposed.
- 2026-10-21: G1 result (report `docs/plans/g1-report.md`): diagnosis refuted the representation-by-relocation and name-matching premises (GF stopped); operational integration fixes F1-F6 validated on a sealed independent set (lost limits 21 -> 12 of 32, typed research needs for out-of-knowledge requests 0 -> 13 of 22, harm 0); goal-first reach unchanged (D35). G1b proposed, not authorised. R3 stays current. Kind: integration, inference. Maturity: F1-F6 operational; goal-first path stopped.
- 2026-10-21: G1b authorised (verbatim `owner-g1b-authorisation-2026-10-21.md`): situation-linked scientific knowledge, method free, shadow; G1 residues (lost information, questions without cause). Permanent requirement: bidirectional knowledge by need and by category (SKILL.md §2b). R3 stays current. Kind: vocabulary, inference. Maturity: proposed.
- 2026-10-21: G1b result (report `docs/plans/g1b-report.md`): situation-linked knowledge projection in shadow (both directions); goal-first matching did not pass development (precision- and paraphrase-bound, measured); sealed sets unspent; every operational question now carries its cause; lost limits reduced, not closed. Next proposed: typed situations, then a semantic-model decision. R3 stays current. Kind: vocabulary, inference, integration. Maturity: projection implemented in shadow; question causes operational.
- 2026-10-21: owner review of G1b (verbatim `owner-review-g1b-2026-10-21.md`): vectorisation moves to the centre of the next architectural evaluation together with typed scientific situations (A, B, A+B, A+B with relation verification), retrieval, link correctness and decision measured separately; report §8 sequencing superseded (§10). No work authorised until the consolidated prompt. R3 stays current.
- 2026-10-21: G1c authorised (verbatim `owner-g1c-authorisation-2026-10-21.md`): local sentence-embedding model (experimental, offline), comparison A typed situations / B embeddings / C hybrid / D hybrid + scientific verification; blind audit of G1b situations and links; rebuildable vector index of knowledge units; semantic safety probes; lost-limits residue. R3 stays current. Kind: inference, learning (retrieval). Maturity: proposed.
- 2026-10-21: G1c done (`docs/plans/g1c-report.md`): local embeddings + rebuildable knowledge-unit index implemented (shadow); no method passed development (precision among close neighbours), sealed sets untouched; blind audit: 51 of 70 G1b situation->strategy links inappropriate; lost limits on a development-only set 33 -> 8 of 98 (operational, rc80.5). R3 stays current. Kind: inference, learning (retrieval). Maturity: proposed (retrieval), operational (coverage fix).
- 2026-10-21: G1d authorised (verbatim `owner-g1d-authorisation-2026-10-21.md`): scientific relation integrity (trace links to sources, general derivation method, source-grounded reference set), verified semantic retrieval in three stages (retrieval, verification, selection) with the fused ranking measured, owner contraindication and question rules, longer-request limit losses, contract-status protection. R3 stays current. Kind: inference, learning (relations, retrieval). Maturity: proposed.
- 2026-10-21: G1d done (`docs/plans/g1d-report.md`): G1b links traced to sources (51/70 unsupported; asserting clauses mostly in dropped columns); assertion-grounded relation method precision 0.32 -> 0.77 on a sealed reference, below gate, not promoted; verified three-stage retrieval halves invented proposals but fails the gates; fused ranking not better than vector; long-request limits 33 -> 5 of 78 (operational); contract statuses protected by tests. R3 stays current. Kind: inference, learning (relations, retrieval). Maturity: proposed (relations, retrieval), operational (coverage, ledger).
- 2026-10-21: owner direction after G1d (verbatim `owner-foundational-architecture-review-2026-10-21.md`): development suspended; read-only Foundational Scientific Knowledge Architecture Review (audit, scientific universe, semantic/vector design, complete cycle, paper verification, consolidated report, proposal awaiting authorisation). Permanent method rule SKILL.md §2c. R3 stays current. Kind: design. Maturity: n/a.
- 2026-10-21: FA review done (`docs/plans/foundational-architecture-review.md`): causes are representation and acquisition; recommended a canonical typed graph of entities and reified assertions with admissible inferences, per-type views and one request frame (alternative C). Proposal FA-I1 (representability, offline) awaits owner authorisation. R3 stays current. Kind: design (vocabulary, inference, learning, transfer). Maturity: proposed.
- 2026-10-21: owner authorises FA-I1 only (verbatim `owner-fa-i1-authorisation-2026-10-21.md`): correct three model errors first, then the representability gate on existing material; critical losses block; no migration or canonical tables. R3 stays current. Kind: design verification. Maturity: proposed.
