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

Source discovery is Claude's in C3: PEE has no configured search service (Phase223 needs an operator SearXNG
endpoint). This is reported as a limit of the path, never as PEE capability.



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
