# PEE — Independent Scientific Universe: Design Charter

- **Date:** 2026-10-21.
- **Authorisation:** verbatim in `.claude/skills/pee-guided-learning/references/owner-design-charter-authorisation-2026-10-21.md`.
- **Decision row:** DC-start.
- **Kind of work:** design and conceptual verification only.
- **What was not done:**
  - no core was built;
  - nothing changed in the operational path, store, embeddings, research permissions or legacy modules;
  - no new package or source was read;
  - G1 and G1b were not used.
- **Maturity of everything here:** proposed. It awaits owner approval.
- **Roadmap:** R3 stays current. The path FA-I1b → FA-I2 is suspended as an obligatory route.

**Inputs.** Kept unchanged, with their SHA-256, in `evaluation/dc/inputs/`:

| File | What it is | SHA-256 |
|---|---|---|
| `requirements.md` | Structure-neutral requirements catalogue. It derives from the mission (SKILL.md §0), the owner's messages, and the FA-I1 and G1–G1d lessons rewritten as capabilities and 25 adversarial patterns | `fcc4a2c0…` |
| `design-independent.md` | Independent conceptual architecture, by a Claude agent that saw *only* the requirements: no code, no km.2/km.3, no legacy schema | `32e91867…` |
| `logic-analysis.md` | Independent formal-expressivity analysis, under the same blinding | `968cca38…` |

The independent work was done by Claude agents. It shows that a design *can* be built from the requirements without the
legacy structures. It is not independent validation (§8.3).

**Executable checks.** Synthetic data only, run in isolation on the existing rule evaluator: `scripts/dc-checks.mjs` →
`evaluation/dc/checks.json` (§3.4).

---

## Summary

**Recommended architecture: assertion-first with structured argumentation.**
- **Claims and attestations.** Each *Claim* (one qualified proposition) is stored once. Every source passage that
  asserts it is a separate *Attestation*, with a PROV-style chain back to the original source.
- **One epistemic discipline for every claim,** including concept existence, definitions, aliases and observations. It
  has six separate, unordered dimensions.
- **Belief is computed, never stored.** It is derived from the claims and the active rules on three levels:
  - *strict*: types, units, requirement trees in three-valued logic, constitutional invariants;
  - *defeasible*: arguments with rebuttal, undermining and undercutting, under sceptical (grounded) semantics.
    Unresolvable conflicts stay *undecided* and are reported;
  - *graded*, narrow: only measurement uncertainty and counts of independent origins.
- **Methodology is separate.** It is learned with a rule lifecycle. A small owner constitution stays outside learning.
- **Retrieval views are derived and disposable.** Vectors and graph views only propose.

**Full second-order logic is not needed.** Every need that looks second-order can be met in first-order logic over a
vocabulary in which relation types and rules are named, governed individuals (Henkin-equivalent). That keeps reasoning
decidable, polynomial and explainable. Three needs are genuinely second-order and are deliberately kept *outside* the
logic, as governed processes:
- inventing predicates and rules;
- claims about the theory as a whole;
- identity of indiscernibles, which PEE must forbid anyway.

**The existing rule engine is not sufficient as the core.** Check C2 shows that it rejects the recursion through
negation that argumentation needs. The core needs Datalog with the **well-founded semantics**. Its third value,
"undefined", is exactly "withhold and report".

**Proposal.**
- Approve the charter and the decisions in §11.
- Authorise only **U0**: a disposable formal prototype on synthetic data, with 16 preregistered checks.
- The four gates A–D follow, each with its own authorisation.

---

## 1. Requirements and fundamental principles

The full catalogue is `evaluation/dc/inputs/requirements.md`. Its groups, condensed:

- **K — Representation.**
  - Needs: general and contextual, with opposite directions.
  - Situations; phenomena and causes (possible vs established); "indicates" is not "produces".
  - Strategies (primary vs adjunct; "not a substitute"); capabilities and components.
  - Categories, subtypes, products, variants and tested units.
  - Properties (basis, object, unit, plausible range, defining conditions); methods (sample design, version, date).
  - Observations of every kind, including synthetic.
  - Requirements (joint, alternative, levelled) and contraindications with their force.
  - Comparisons and main determinants; every form of negation and hedge; absent knowledge.
  - Methodological knowledge; a lexicon of aliases, cues and pole terms.
- **E — Epistemics and provenance for *every* piece of knowledge.**
  - The epistemic dimensions are separate and unordered.
  - The source that reports is distinct from the source it cites.
  - No promotion between evidence types.
  - Every conclusion is traceable and capped by its weakest support.
  - Demonstrated efficacy needs a measured result about that artefact under comparable conditions.
- **R — Reasoning.**
  - Need-first and category-first over the same knowledge, with asymmetric validity.
  - No vacuous satisfaction.
  - Relevance requires an evidence profile.
  - Diagnosis uses discriminating tests.
  - Opposites propagate.
  - Contradictions are withheld and reported.
  - Transfer has limits.
  - The request's stance is respected (negated, owned, named).
  - Questions are asked only about user facts.
  - Defaults with exceptions; meta-principles; uncertainty without fabricated precision.
- **A — Acquisition and learning.**
  - Extraction into quarantine.
  - Entity resolution with an undecided state.
  - Conflicts are kept, never overwritten.
  - Each source is judged for whether it is sufficient.
  - Revision over time, with re-derivation.
  - Methodology learning under a lifecycle.
  - Categories never studied before.
- **T — Transfer.** Only through a documented mechanism, never by name similarity. It must work on domains not used in
  development.
- **V — Vectors.**
  - They recognise and retrieve, and never relate or decide.
  - Units and queries are typed.
  - Abstention does not rest on an absolute threshold alone.
  - Density must not vote.
  - Indexes are derived and incremental.
- **X — Governance.** Journaling and reproducibility; four gates; a path to integration or abandonment.
- **C — Constraints.**
  - Claude is the sole developer.
  - No paid services or heavy dependencies.
  - Private data.
  - Rights respected.
  - An isolated experimental engine.

**Fundamental principles.** Both independent proposals converge on these.

| # | Principle | Answers |
|---|---|---|
| P1 | **One discipline for all knowledge.** Concept existence, definitions, aliases, observations, causal claims and methodological rules are all claims, with attestations, epistemic profiles and history | E; the largest FA-I1 loss |
| P2 | **Content ≠ support ≠ belief.** The claim (what is said), the attestation (who said it, where, on what basis) and the computed belief (what is accepted and why) are three different things | E1, A3, A5, R6 |
| P3 | **Profiles, not scores.** No single confidence number exists anywhere | E1, R12 |
| P4 | **Weakest-premise ceiling, per dimension** | E4, R11 |
| P5 | **Absence is an object.** Unknown, unmeasured, contested and undecided are typed; never a missing row | K12, R9 |
| P6 | **Similarity proposes, structure disposes.** Vector outputs enter only candidate predicates, enforced by a static checker | V1 |
| P7 | **Constitution ≠ learned methodology.** A small set of owner invariants cannot be revised by learning (e.g. "a declaration is never an independent test", "synthetic never reads as measured") | E3, A6 |
| P8 | **Append-only and bitemporal.** "What was believed when, and why" is a query | A5 |
| P9 | **Negation discipline.** Negation-as-failure ("not known") applies only to store and epistemic predicates. A world fact can be negated only by an explicit, supported negative claim. So "missing evidence is not evidence of poor performance" becomes a property a checker can verify | E3, K11 |
| P10 | **Layer-flow typing.** Every predicate has a layer and a sort. A rule is admitted only if its flow respects them: quarantine never feeds decisions, vectors never feed world facts, meta-rules never assert world facts | A1, V1, R11 |

---

## 2. Proposed conceptual architecture and alternatives

### 2.1 Layers

| Layer | Holds | Must never hold |
|---|---|---|
| L0 Sources and passages | source records (role, document, version, date, authorisation, rights and retention class); passage anchors (locator, hash; an excerpt only where retention permits); reporting chains; status labels verbatim | third-party full texts; truth judgements; merged sources |
| L1 Lexicon | terms; lexical claims `alias` (same meaning), `cue` (evokes), `poleTerm` (dimension, pole); hedge and negation markers; each with attestations and a supported/candidate status | world facts; product identity |
| L2 Concept registry | concept identities and kinds; existence and definition claims; `sameAs` / `distinctFrom`; undecided identity questions | merges by name similarity; concepts without attestation |
| L3 World knowledge | causal, diagnostic, functional, requirement, contraindication, comparison, determinant, bound and threshold claims, with qualifiers (polarity, modality, quantifier, conditions, scope, hedge, valid time) | single-unit results presented as general; methodology; synthetic values; belief status |
| L4 Evidence and observations | O&M/SOSA observations: feature of interest at its exact level (unit, variant, model, category-typical sample); I-ADOPT variable; result, uncertainty and basis; **result kind as a record type**; procedure and version; conditions; sample design | generalisations; averages over conflicting results |
| L5 Methodology | admissibility tables; meta-principles (undercutter schemas, ceilings); research templates; question and abstention duties; extraction lessons; curriculum. Rules have a lifecycle and a reliability record. The kernel is the owner constitution | world facts; rules that are not active being executed |
| L6 Belief state (derived) | for each rule-set version and transaction time: established, supported, hypothesised, possible, contested, unknown or excluded, each with its argument tree | statuses entered by hand |
| L7 Learning state | quarantine; validation decisions; experience cases; candidate lessons; typed research needs; conflict dossiers | promoted knowledge |
| L8 Retrieval views (derived) | per-type vector indexes; need-first and category-first graph projections; caches with model and snapshot versions | anything canonical |

L0–L5 and L7 are canonical. L6 and L8 can be rebuilt from them.

### 2.2 Claims and attestations

**Claims.**
- A claim is `⟨type, arguments, qualifiers⟩` with a content hash.
- A proposition asserted by five sources is one claim with five attestations.
- A claim and its denial are two claims, linked by *negates*.
- Modality composes structurally: outer polarity, modal operator, inner polarity. This separates "not always"
  (¬□P = ◇¬P) from "never" (□¬P), which FA-I1 could not express.

**Claim families.**
- **Meaning:** exists, defines, alias, cue, poleTerm, sameAs, distinctFrom.
- **Taxonomy.**
- **Causal:** produces (established or possible), prevents, opposes, worksBy.
- **Diagnostic:** indicates; discriminates (test, outcome, confirms, rules out).
- **Statistical:** associated. It never licenses a causal claim.
- **Functional:** hasCapability and hasComponent, each with an all / most / some quantifier; componentRole.
- **Remedial:**
  - addresses, with role primary or adjunct;
  - notSubstituteFor;
  - `requires`: an AND/OR tree of capability-at-level leaves, bound to an operating point;
  - `sufficientFor`;
  - `realisedBy`, derived only.
- **Normative:** contraindicates with force; applicability; threshold (the value may be unknown); bound.
- **Comparative:** compares; ranks (a source's ranking, never converted into measurements); determinant.
- **Evidential:** necessaryEvidence, informs.
- **Absence:** unknown, unmeasured, contested.
- **Methodological:** rule, admissibility, researchTemplate, questionDuty.

**Attestation.** A nanopublication-like triple:
1. a reference to the claim;
2. its provenance: attributed to, derived from (the passage), quoted from or reported via (the reporting chain),
   generated by (the extraction activity), plus the verbatim label, the evidence type and the nature;
3. publication information: entry time, authorisation, rights class and review decisions.

**Epistemic profile.** Six independent dimensions:

| Dimension | Values |
|---|---|
| Nature | definition, principle, mechanism, calculation, measurement, qualitative, guidance, regulation, association, hypothesis, user report, declaration |
| Evidence type | a closed list, with no conversion between types |
| Independence | computed over **origins**, the last source in a reporting chain. Relays count once. Interested origins are marked |
| Specificity | general → category → subtype → model → variant → unit |
| Applicability | the conditions, and any transfer statement made by the source |
| Review state | quarantined / validated by rule / validated by review / rejected / superseded / retracted |

At most there is a partial order inside each dimension. The **admissibility tables** (L5) state, for each conclusion
type, which region of the profile it requires. For example, `efficacy(model, variable, conditions)` needs a measured
result, from an independent original test, at model level or finer, under comparable conditions.

### 2.3 Identity

- Identity comes only from explicit, attested `sameAs` / `distinctFrom` claims.
- Entity resolution has four outcomes: matched, new, distinct or **undecided**.
- While identity is undecided:
  - observations are not pooled;
  - no transfer is licensed;
  - reasoning treats the candidates as separate.
- Moving a result from a unit to a model or a category is an **inference with a licence** (sample representativeness),
  never a relabelling. This prevents the FA-I1 failure where a single study was pushed up to the category.

### 2.4 Alternatives compared

| Alternative | Meets | Fails | Verdict |
|---|---|---|---|
| **A. Ontology-first property graph (OWL/RDF, LPG)** | taxonomy, traversal in both directions, tooling | provenance only per edge, with no shared claim; monotonic open world, so no defaults; a contradiction makes the base inconsistent instead of being reported; no modal negation; concepts and aliases kept in the schema without provenance; a dangerous global `sameAs` | **derived navigation view only** |
| **B. Assertion-first + structured argumentation (recommended)** | E for everything; independence counted over origins; conflicts reported; defaults and exceptions; meta-principles as undercutters; argument trees; versioning; quarantine; licensed transfer | representation cost; claim canonicalisation is itself an identity problem; conservative results; depends on coverage | **canonical model** |
| **C. Probabilistic logic (ProbLog, Markov logic, PSL)** | graded combination of evidence; learnable weights | averages conflicts (R6); fabricated precision (R12); collapses the profile into one number (E1); implicit promotion (E3); needs large data and heavy tooling | **intervals for measurements only** |
| **D. Document-centric retrieval with verification (RAG)** | breadth; paraphrase | full texts cannot be retained (C3); similarity becomes the relation (V1); no identity, absence or asymmetry; needs an AI service at run time | **rejected**; its retrieval discipline survives in L8 |
| **E. Per-category frames or cases** | curricula for new categories | no transfer across categories; no per-claim provenance | **absorbed as research templates** |

**Why B.** It is the only alternative in which the hardest invariants are *structural* rather than policies:
- E holds for every piece of knowledge;
- conflicts are never averaged;
- defaults and meta-rules have a proper semantics;
- evidence types are never promoted.

---

## 3. Formal expressivity: vectors, first- and second-order logic, meta-reasoning, evidence

This section answers the owner's explicit requirement: evaluate the expressivity that is actually needed, instead of
choosing Datalog or a graph because they already exist.

### 3.1 Required expressivity

| Feature | Needed for | Form |
|---|---|---|
| Bounded universal quantification with existential import | joint requirements; "all members" | ∀ over sets the store declares complete. Empty ⇒ *unknown*, never *true* (the fix for vacuous realisation) |
| Existentials in conclusions | unknown thresholds, research needs, derived requirements | Skolem terms / labelled nulls, non-recursive, with a weak-acyclicity check |
| Counting and aggregates | independent origins; most/some | stratified, **never over a set in conflict** |
| n-ary statements | value + unit + basis + conditions + method + subject + source + time | reified statements |
| Strong negation | denials, "never", "does not address" | stored claims with evidence |
| Negation-as-failure | "not known / not verified" | **only over epistemic predicates** (P9) |
| Defaults, exceptions, partial priorities | R10, hedges, "most" | defeasible rules; specificity and supersession are the only preferences that defeat; the amount of evidence is never a preference |
| Modalities | possible vs established; "may"; "not always" | modal tags and the square of opposition; Kripke semantics not needed |
| Three truth values | conflicts, unknown levels | Kleene for requirement trees; **well-founded semantics (undefined)** for argumentation |
| Arithmetic and units | thresholds, conversions, requirements derived from volume | built-ins and intervals, kept outside recursion |
| Operating-point scope | two requirements at the same setting | one shared variable (∃S: A(S) ∧ B(S)), not ∃S1 A ∧ ∃S2 B |
| Quantification over relations and rules | "correlation is not causation", admissibility, rule reliability, mechanism schemas | **reified relation types and rule ids, typed and stratified** |
| Claims about claims | reporting chains, review states, conflicts | reification with level stratification (a Tarski hierarchy) |
| Time and revision | A5 | bitemporal log plus justification maintenance (JTMS / DRed); optional ATMS labels for conditions |
| Open vs closed world | E3, R7, R9 | open world for facts about the world; closed world for the store's records, request slots and rule states |

### 3.2 Formalisms compared

This is a summary; the full table is in `logic-analysis.md` §2.

- **OWL 2 DL — rejected as core.**
  - It has no defaults, no negation-as-failure, and no n-ary relations except through awkward patterns.
  - One contradiction makes the base trivial.
  - It needs Java reasoners.
  - OWL 2 RL is still useful as a catalogue of vocabulary axioms written as Datalog rules.
- **Stratified Datalog (the existing engine) — not sufficient.** It is good for closure, provenance chains, bounded
  requirements and re-derivation. It **cannot** express the needed conflict semantics (check C2).
- **Datalog with the well-founded semantics — the minimal sufficient extension.** It runs in polynomial time and its
  proofs are trees. Its "undefined" value means "withhold and report". It can be built in-house with the alternating
  fixpoint.
- **Datalog± (existential rules) — only for Skolem objects,** restricted to the weakly acyclic case.
- **Structured argumentation (ASPIC+ / ABA) under grounded semantics — recommended for the defeasible level.**
  - It gives the best explanations.
  - It is the only option that expresses **undercutting** ("this inference is not licensed") without asserting a
    falsehood.
  - Flat grounded ABA compiles into the well-founded semantics, so **one engine runs both the strict and the
    defeasible level**.
- **ASP (clingo) — fallback B,** kept for shortlist selection with preferences. It is more expressive than needed, needs
  an external solver, explains less well, and under conflict yields no answer set or several.
- **Defeasible logic (Nute/Antoniou) — fallback C.** It is linear and simple, but its single superiority relation
  strains a six-dimensional profile.
- **ProbLog, Markov logic, PSL — rejected.** They violate R6, R12 and E1. A probability may appear only as *data*, when
  a source states it.
- **AGM belief revision — used for tests, not as a mechanism.** It chooses between conflicting inputs, which R6 forbids
  for evidence. **Its postulates serve as tests** for the governance of rules and admissions.
- **Full second-order logic and higher-order provers — rejected** (§3.3).

### 3.3 The second-order question, answered precisely

Each need that looks second-order has a first-order form over reified, governed vocabularies:

| Need | First-order form |
|---|---|
| "For every causal relation, an association does not establish it" | a meta-rule over the *sort* of the reified relation type, acting as an undercutter (check C3) |
| Which evidence establishes which claim type | an admissibility *table*: data, not rules |
| Reliability of rules | rules as identified terms; derivations record rule ids; reliability enters the ceiling |
| "A hypothesis never yields more than a hypothesised conclusion" | an engine invariant (the ceiling), not a rule |
| "A result does not transfer without justification" | the only rule that derives an observation about a new subject requires `comparable(...)` |
| Transfer of a mechanism schema | schemas as individuals with typed roles; bounded existential over the bindings |
| No promotion between evidence types | disjoint sorts, plus a static check that no rule promotes |

This is **Henkin-style** quantification: it ranges over the relations and rules *named in the governed vocabulary*.
For PEE that restriction is a virtue. Admitting a new relation type is an act of governance, not something a
quantifier should range over silently.

Three needs are genuinely second-order and stay **outside the logic**:
1. **Identity of indiscernibles.** "The same if every property is equal" must be *forbidden*, since entities are never
   merged on similarity. Its inexpressibility protects PEE.
2. **Inventing predicates and rules from experience.** This is inductive search. It runs as a *governed process*:
   proposals become reified rules in quarantine, are evaluated on held-out material, and are promoted by a recorded act.
3. **Claims about the whole theory** (consistency, completeness, "no rule derives *demonstrated* from a declaration").
   These are verified *externally*, by static analysis of the rule graph and by property tests.

**Costs of full second-order logic:**
- no complete proof system;
- heavy tooling, not available for Node;
- proofs the owner cannot read;
- classical explosion on a single contradiction, the opposite of R6.

### 3.4 Executable checks run now

Synthetic data, existing evaluator, in isolation.

| Check | Claim | Result |
|---|---|---|
| C1 | No vacuous satisfaction needs existential import (documented requirements); stratified Datalog is enough | **pass**. Without the guard, "buy new" is realised by every artefact. With it, only the dehumidifier realises "dehumidify" |
| C2 | Grounded / well-founded acceptance (undecided under mutual attack) | **not expressible in the existing engine**: it rejects the program as "not stratifiable". The core needs the well-founded semantics |
| C3 | "Association does not establish causation" as a typed meta-rule over reified relation types, in a higher stratum | **pass**. The causal inference is undercut without asserting "not a cause", and is reinstated by an admitted identification |
| C4 | Two requirements at the same operating point | **pass**. The shared variable accepts only the right product; the naive reading accepts the wrong one |

### 3.5 The four levels as the owner framed them, and their contract

| Level | Formalism | Contract |
|---|---|---|
| **Vectors** → recognising and retrieving meaning | embeddings (existing CPU model) + typed lexical claims | they emit only `candidate_*`, which may feed resolution, quarantine and request slots confirmed by a deterministic check. Never world facts, identity, evidence or decisions |
| **Formal logic** → representing and verifying relations | many-sorted first-order logic with reified n-ary statements, strong negation, stratified Datalog with aggregates, built-ins and bounded Skolem terms | a deduced conclusion has nature `inferred(principle / calculation / definition)`, **never `measured`** |
| **Meta-reasoning** → controlling inference, revision, methodology | typed meta-rules over reified relation types and rule ids, in higher strata; rule lifecycle; constitution kernel | they undercut, gate rule activation and set ceilings. **They never assert world facts** |
| **Evidence** → empirical support, validity conditions, uncertainty | a product of qualitative lattices plus intervals; grounded argumentation (well-founded semantics) | decisions use only *accepted* conclusions. *Undecided* ones are reported with both sides. No aggregation over conflicts |

**Similarity, deduction and scientific truth stay separate:**
- similarity proposes;
- deduction derives what follows from admitted claims;
- only evidence, through admissibility, makes a claim *established*.

---

## 4. The complete scientific cycle, including future autonomous acquisition

1. **Research need.** The universe types it: missing entity, missing claim of type T for subject X, unverified claim,
   contested claim. It names the evidence that would be admissible.
2. **Authorisation gate.** Robots, access controls, retention class and budget. A refusal is recorded and never
   bypassed.
3. **Reading.** Passages with anchors and hashes, keeping only what retention permits.
4. **Extraction.** Claims and observations with their qualifiers, verbatim labels and reporting chains go into
   **quarantine**. Quarantined knowledge is used only in explicitly hypothetical contexts.
5. **Entity resolution.** Lexical and vector *candidates*, then a structural check. Result: matched, new, distinct or
   undecided. New terms enter as *candidate* lexical claims.
6. **Normalisation.** I-ADOPT variables, units and bases, condition sets.
7. **Conflict detection.** Same subject (not undecided identity), overlapping conditions, and opposite polarity or
   incompatible values produce a conflict dossier. Both sides are kept, and a research need is raised.
8. **Sufficiency judgement.** What this attestation can establish, and what is missing (A4).
9. **Validation.** Mechanical checks, a sealed blind sample, and review of high-impact claims lead to *admission*,
   recorded as a journaled event.
10. **Re-derivation.** Only the dependent conclusions are recomputed. Earlier states stay queryable.
11. **Methodology learning.**
    - experience cases lead to candidate lessons;
    - each lesson is evaluated on held-out material and promoted only within a stated scope;
    - reliability is recorded;
    - a counterexample triggers review.
12. **Categories never studied before.** A template derived from general knowledge lists what must be learned:
    functions, mechanisms, requirements, contraindications, deciding properties, test methods and subtypes. Each empty
    slot becomes a research need. Mechanisms and contraindications come before product facts.
13. **Transfer.**
    - It requires an attested `worksBy(K, M)`.
    - M's conditions are evaluated within K's operating envelope.
    - The result is capped at *principle-based expectation*: it never demonstrates efficacy, and name similarity plays
      no part.

**Autonomy grows in stages, never by automatic publication:**
- first, quarantine plus admission through validation;
- then, rules that may admit only those claim types whose extraction accuracy has been demonstrated on held-out
  material;
- every admission is journaled and reversible.

---

## 5. Semantic and vector design

- **Per-type indexes generated from canonical knowledge.** Third-party text is never embedded beyond what retention
  permits. The indexes cover:
  - lexical senses;
  - concept prototypes (a canonical description plus attested aliases and cues);
  - claim glosses (one canonical sentence per admitted claim);
  - variables and methods;
  - sealed request examples.
- **Typed requests.** A request is decomposed into situations, needs (with direction), constraints, owned objects (as
  context), named products (to be checked), negated or excluded items, and questions.
  - Each slot queries only its own index.
  - Negated and owned items are never used as positive queries.
- **Structural verification of every candidate:**
  - its kind must be compatible with the slot;
  - its polarity and direction must agree ("more humid" never matches "drier");
  - it must have admitted claims.

  Similarity scores never enter argumentation.
- **Abstention per slot,** combining four signals:
  - coverage;
  - relative margin against a typed background distribution;
  - a round-trip check (the prototype reproduces the slot's kind and direction);
  - agreement between the lexical and the dense ranking.

  Out-of-knowledge requests produce a research need.
- **Density.** Scores are pooled per concept (maximum, or mean of the top k), never counted per unit.
- **Incremental.**
  - Every admission triggers an index event.
  - The full rebuild is reproducible.
  - Quarantined units sit in a separate candidate index, used only by entity resolution.

---

## 6. Comparison with km.3, the FA-I1 lessons and the standards

### 6.1 How the design answers each FA-I1 lesson

| FA-I1 lesson | Answer in the design |
|---|---|
| Status and provenance lost on entities, definitions, aliases and axes (G4 0.51; 35 critical) | P1: everything is a claim with attestations, including existence and definitions |
| Reporting source vs cited source (16 critical) | Attestations carry the reporting chain; independence is counted over origins |
| Observations without support; synthetic read as measured; studies pushed up to the category (11 critical) | L4 O&M/SOSA: feature of interest at its exact level; result kind as a *record type*; moving to the category only under licence |
| Basis, object, unit and range of a property missing (13 critical) | I-ADOPT variable with ValueBasis; basis conversion only where the conditions define it |
| Comparisons, primary remedy, main determinant (8 critical) | Comparative and remedial families: `compares`, `ranks`, `determinant`, `addresses(role)`, `notSubstituteFor` |
| Undefined modality of "required to assess"; "not always" vs "never" | `necessaryEvidence` vs `informs`; structural composition of modality |
| Cue and pole terms vs aliases (128 units) | L1 lexicon with `cue` and `poleTerm` claims and statuses |
| Methodological knowledge in the world model | L5, separate, with a lifecycle and a constitution |
| Vacuous realisation (forbidden inference D07) | Kleene requirement trees plus existential import (check C1) |
| An anecdote makes a remedy relevant (D15) | Admissibility table and weakest-premise ceiling |
| `serves` with an unverified level (D14) | `serves` has a single constructor (the complete chain); an unverified level is *unknown* |
| Remedies through causes, discriminating tests, association ≠ causation | Diagnostic family plus undercutter (check C3) |
| Conflicts between observations | Grounded argumentation; *undecided* is reported (needs the well-founded semantics, check C2) |
| Two requirements at one operating point; requirements derived from volume | Shared operating-point variable; strict functions (check C4) |

### 6.2 Comparison with km.3

km.3 (corrections K1–K10 in `docs/plans/fa-i1-report.md`) and the independent design converge on almost every
correction. That supports them, since they were reached independently.

The independent design goes further at five structural points where km.3 would fail:
1. **Claim ≠ attestation.** In km.3 an assertion is tied to one support, so independent origins cannot be counted and
   several attestations of the same claim become duplicates.
2. **Computed belief.** km.3 stores review status as a field. The independent design derives the belief state from
   attestations and rules, so it can be reproduced at any transaction time.
3. **Conflict semantics.** km.3 relies on the existing stratified Datalog, which cannot hold "undecided" (C2).
4. **Negation discipline and layer-flow typing (P9, P10)** can be verified by a static checker. In km.3 they are only
   principles.
5. **Constitution separated from learnable methodology (P7).**

**km.3 adds nothing structurally absent from B.** It remains a point of comparison.

### 6.3 Standards

| Standard | Use |
|---|---|
| **W3C PROV-O** | Provenance of attestations: wasAttributedTo, wasDerivedFrom, wasQuotedFrom, wasGeneratedBy, plus `reportedVia` |
| **SOSA/SSN and OGC O&M** | Observations: feature of interest, observed property, result, procedure |
| **I-ADOPT** | Decomposition of variables: object of interest, property, matrix, constraints |
| **QUDT** | Quantity kinds and units (already present in QK) |
| **Nanopublications / micropublications** | Assertion as the unit, and support/challenge links |
| **ASPIC+ / ABA** | Argumentation semantics |
| **AGM** | Postulates used as governance tests |

The standards serve as alignment and vocabulary. They are not imported wholesale, which would bring heavy tooling (C1).

---

## 7. Protocols of the four gates

The thresholds below are proposed. They become binding only on the owner's approval, and are preregistered before each
experiment.

**Rules common to all gates:**
- material is sealed by hash before any run;
- first runs are committed unchanged;
- development material is never reported as held-out;
- references are produced by blind Claude agents, and their agreement is measured and reported;
- independent validation is done by the owner on a sample (§8.3).

### Gate A — Representation

- **Material.** A fresh stratified sample, distinct from the FA-I1 sample and from the rows used by G1c/G1d. It must
  include the hard cases (reporting sources, synthetic values, single units, cues and poles, bases, modal negations) and
  fragments of the reserved material (§8), which are not used for development.
- **Protocol:**
  - an inventory of atomic units, blind to the model;
  - two blind encoders;
  - reconstruction from typed fields only;
  - two judges;
  - adjudication.
- **Thresholds:**
  - **zero critical losses caused by the model;**
  - **E-completeness 100%**: no knowledge without an attestation;
  - expressiveness ≥ 0.95 overall and for every critical aspect;
  - encoder agreement on qualifiers κ ≥ 0.70;
  - reconstruction ≥ 0.95.
- **Stop.** A critical model loss leads to a revision on paper and a new sample. A second failure leads to re-evaluating
  the architecture.

### Gate B — Reasoning (on curated knowledge)

- **Material.**
  - Development: the 25 patterns, now *spent*.
  - Check: a **new sealed adversarial set** of at least 40 cases and 120 lines. It is written by a new independent author
    agent, blind to the rules. It has at least 2 variants of each pattern, set in other categories, and includes
    over-strict cases.
- **Thresholds:**
  - **zero forbidden conclusions caused by the rules or the model;**
  - allowed conclusions reached ≥ 0.90, excluding knowledge that was not supplied;
  - argument trees complete in 100% of cases;
  - incremental re-derivation equal to full recomputation in 100% of cases;
  - over-strictness (admissible conclusions withheld) ≤ 10%, reported per case.
- **Stop.** A single forbidden conclusion fails the gate. Corrections are made on development material only, and a new
  sealed set is required.

### Gate C — Acquisition (into quarantine)

- **Material.** Original documents *never seen* (§8), under a dedicated owner authorisation, with a blind reference
  sealed before the run.
- **Thresholds:**
  - **no invented critical qualifiers** (negation, essential condition, modality, result kind, status label): at least
    0.95 precision on the critical aspects;
  - extraction precision ≥ 0.85 and recall ≥ 0.70, reported by type;
  - provenance to the passage in 100% of cases;
  - verbatim labels in 100% of cases;
  - **false merges: 0**; undecided identities reported;
  - recall of seeded conflicts ≥ 0.90;
  - agreement on sufficiency ≥ 0.80;
  - **leaks from quarantine into decisions: 0**;
  - **rights violations: 0**.
- **Stop.**
  - A false merge, a leak or a rights violation stops the gate.
  - If critical-qualifier fidelity stays below threshold after one revision, an **abandonment review** follows.

### Gate D — Transfer

- **Material.** A reserved domain (§8). The principle is learned in domain X (development) and applied in a domain Y
  never seen before. Decoys are included: artefacts with similar names and no `worksBy`.
- **Thresholds:**
  - transfers that carry their conditions and limits ≥ 0.80 of the sealed reference;
  - **zero transfers by name or similarity** (the decoys);
  - **zero "demonstrated" conclusions from principles**;
  - conclusions unchanged by renaming every identifier (α-renaming) in 100% of cases;
  - the research curriculum for the new domain compared with a sealed list of what must be learned.
- **Stop.** One unlicensed transfer fails the gate.

---

## 8. Reserved material and independence of evaluations

### 8.1 What is already known

Assessed from metadata only; no new material was opened.

| Material | State |
|---|---|
| Owner packages for the six taught categories (air fryers, coffee, dehumidifiers, dishwashers, air purifiers, televisions); dehumidifier sources R01–R39 | **Spent**: used in teaching, G1b–G1d and FA-I1 |
| Tumble dryers | **Spent for development**: Phase272 method pages read under policy; 18 teaching items in the store |
| Robot cleaners and soundbars (packages 05 and 08) | **Partly seen**: Stage-A inventories (Phase271) and PD profiles (S88). Not translated, under the owner rule |
| Speakers (package 09) | **Partly seen**: Stage-A inventory (Phase272) |
| FA-I1 sample, the 17 diagnostic cases and the 25 patterns | **Spent** (used in design) |
| Sealed sets G1 and G1b | Untouched; **must not be used** (owner rule) |

**No material in the repositories is wholly unseen for a new category.**

### 8.2 Proposed reservation protocol

1. **Choice of domains.** Pick domains whose mechanisms are shared with known knowledge (for transfer), plus contrast
   domains with similar names (as decoys).

   | Candidate domain | Mechanism shared with known knowledge | Role |
   |---|---|---|
   | **Washing machines** | water hardness, energy and noise per cycle, as for dishwashers | primary transfer domain |
   | **Cooker hoods** | extraction to outside vs filtration with recirculation; CADR-like quantities, as for purifiers and dehumidifiers | second transfer domain |
   | **Heat-pump tumble dryers** | vapour compression and condensation, shared with compressor dehumidifiers | near transfer only: *new* documents, with Phase272 knowledge excluded from the development universe |

   Humidifiers are excluded: 25 rows that mention them have already been read.
2. **Sealing.**
   - The documents come either from a new owner package or from a bounded, authorised source wave.
   - They are hashed and sealed in pee-knowledge.
   - The main session never opens them. Only the acquisition role reads them, during gates C and D.
   - The blind reference is written by a separate agent before the run and sealed by hash.
3. **Contamination control.** For each domain, list the documents and knowledge already seen and exclude them from the
   development universe. Verify everything by hash.

**Authorisations needed later:**
- the reserved domains;
- an exception to "no new categories", limited to the isolated core;
- procurement of the material (a new owner package, or a source wave with a stated budget and hosts);
- the sealing itself.

### 8.3 Independence of evaluations

| Kind | Who | Value |
|---|---|---|
| Agreement between Claude agents | inventory, encoders, judges, reference authors (blind, with measured agreement) | reproducibility and blind consistency; **not independent validation** |
| Independent validation | the owner, or authorised external experts, on a sample per gate (proposed: 20 items per gate, chosen by the owner) | the only validation that counts as independent |
| Structural verification | static checkers (layer flow, negation, stratification, weak acyclicity), property tests, re-derivation equivalence | formal properties, independent of judgement |

---

## 9. Costs, risks, possible reuse and integration criteria

### 9.1 Costs

- **Engine.** An in-house TypeScript engine of 2–4k lines, with no dependencies. It needs:
  - semi-naive Datalog;
  - the well-founded semantics by alternating fixpoint;
  - stratified aggregates;
  - built-ins for arithmetic, units and intervals;
  - bounded Skolem terms;
  - proof recording and DRed.
- **Store.** About 13 SQLite tables: source, passage, concept, term, claim, attestation, observation, rule,
  belief_event, research_need, conflict, identity_question, journal.
- **The dominant cost** is curating and validating knowledge, and the blind evaluation by agents at each gate.

### 9.2 Risks

These come from both independent proposals and from FA-I1.

1. **Extraction fidelity.** In FA-I1 even careful encoders made 124 errors, 58 of them critical, and a lost qualifier
   silently corrupts the reasoning. *Mitigation:* quarantine, Gate C, and admission only for claim types whose accuracy
   has been demonstrated.
2. **Canonicalising claims.** Merging too much hides conflicts; merging too little miscounts origins. *Mitigation:*
   canonicalisation is treated as an identity decision with an undecided state.
3. **Overlapping conditions** are rarely decidable. Expect spurious conflicts and many *unknown* results.
4. **Coverage.** With thin `requires` / `discriminates` / `worksBy` claims, answers are correct but useless.
5. **Over-strictness.** The weakest-premise ceiling and sceptical semantics can be too cautious. *Mitigation:* measure
   over-strictness in Gate B and audit the constitution.
6. **Sealed sets written by Claude** carry a stylistic bias. *Mitigation:* the owner validates a sample independently.
7. **A parallel engine that never integrates.** *Mitigation:* the criteria in §9.4, including abandonment.

### 9.3 Possible reuse (only where compatible)

| Existing component | Reuse |
|---|---|
| KR rule parser and analyser, its governance (lifecycle, admission, static analysis) and its explanations | candidates for extension with the well-founded semantics; decided in U0 against a new engine |
| CPU embedding model and rebuildable index | candidate generator in L8 |
| SQLite, the hash-chained journal, the rights and retention rules, the publication check | infrastructure |
| QK (kinds, units, axes) and PD (properties, I-ADOPT) | vocabularies, imported as **quarantined attestations**, not as truth |
| Legacy knowledge (category items, statements, assessments) | only as quarantined attestations, through Gate C |
| Legacy request readers | **not reused** as structure; they serve as negative cases |

### 9.4 Integration or abandonment

- **Integrate only if all of these hold:**
  - all four gates pass on held-out material;
  - zero forbidden conclusions and zero false merges;
  - re-derivation is reproducible;
  - on the 206 frozen legacy requests (regression), the core is no worse on safety (forbidden recommendations,
    inventions) and better on at least one preregistered measure.
- **Integration surface.** The core answers with status, argument tree and research needs. Legacy logic is replaced
  stage by stage, with a shadow phase for each stage.
- **Abandon if any of these happens:**
  - Gate A fails twice;
  - Gate C does not reach critical-qualifier fidelity after one revision;
  - forbidden conclusions persist in Gate B after two revisions;
  - over-strictness beyond the agreed limit makes the answers useless.

---

## 10. Minimal roadmap, dependencies and stop conditions

| Step | Content | Depends on | Stop |
|---|---|---|---|
| **DC** (this charter) | Charter, independent proposals, checks C1–C4 | — | owner approval |
| **U0** | **Disposable** formal prototype on synthetic data: an in-house engine with the well-founded semantics, and the 16 checks of `logic-analysis.md` §6 (listed below) | DC approved | if checks 2, 8 or 9 need unmanageable encodings, fall back to B (ASP) or C (defeasible logic), decided before building |
| **U1** | Gate A (representation) | U0 | §7 Gate A |
| **U2** | Gate B (reasoning on curated knowledge from the taught packages, for development) plus the new sealed adversarial set | U1 | §7 Gate B |
| **U3** | Gate C (acquisition into quarantine) on new, sealed material | U2 + material authorisation | §7 Gate C |
| **U4** | Gate D (transfer) on reserved domains | U3 | §7 Gate D |
| **U5** | Decision to integrate or abandon | U4 | §9.4 |

The 16 checks of U0 cover:
- vacuity;
- conflict → undecided;
- the layer-flow and negation-as-failure checkers;
- the ceiling;
- the operating point;
- the modal square;
- undercut vs rebut;
- levels;
- re-derivation;
- α-renaming and decoys;
- termination;
- explanations;
- the adversarial suite, with outputs written beforehand;
- scale at 10⁵ facts.

**Every step needs its own owner authorisation.** This charter authorises no permanent core and no implementation.

---

## 11. Decisions requested from the owner

1. **Architecture.** Approve B (assertion-first with grounded argumentation, three levels, layers L0–L8, principles
   P1–P10) as the base of the isolated core.
2. **Logic.** Approve first-order logic over reified, governed vocabularies (Henkin-style), with no full second-order
   logic, the well-founded semantics required in the core, and ASP and defeasible logic kept as fallbacks.
3. **Gate thresholds** A–D (§7), or changes to them.
4. **Reserved domains.**
   - Washing machines and cooker hoods.
   - Heat-pump tumble dryers only for near transfer.
   - The way new material is procured: a new owner package, or a bounded source wave.
   - The exception to "no new categories", limited to the isolated core.
5. **Independent validation.** The owner reviews a sample of 20 items per gate.
6. **Authorisation of U0 only.** A disposable prototype on synthetic data.
