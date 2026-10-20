# Reasoning about implicit needs: research and audit (NR, 2026-10-20)

**Status: research study. No code, knowledge or store changes. Every capability named below is at maturity *proposed*
unless this document says it already exists.** Owner request (verbatim, Italian):
`.claude/skills/pee-guided-learning/references/owner-needs-reasoning-research-2026-10-20.md`.

The R3-P needs pilot stays frozen at build `58676ef`. The author of this study (the main Claude session) has not read
the pilot's evaluation requests, annotations or references. Nothing here was tuned on them, and nothing here may be
used to change the frozen build before its first runs are committed. The pilot's results will be the independent
diagnosis this study is checked against (§9).

## 0. Answer in brief

1. **The problem is a known engineering problem.** Goal-oriented requirements engineering (KAOS, iStar, NFR, CORE,
   Techne, contextual goal models) gives the vocabulary for turning what someone says into needs and then into
   verifiable requirements:
   - goal vs quality vs quality constraint vs domain fact vs agent assumption vs context vs obstacle;
   - mandatory vs optional;
   - justified approximation of a subjective quality by a measurable property.

   It does **not** give an automatic interpreter: every framework assumes a human analyst (strand A §S3).
2. **The inference is abductive.** It must therefore manage several competing hypotheses, each with:
   - a support chain;
   - assumptions;
   - defeaters (critical questions);
   - an epistemic status that limits what it may do downstream.

   The present cap of one inferred need per request (R3-P, `NI_THRESHOLDS.maxInferred=1`) is a symptom of a missing
   selection and uncertainty mechanism, as the owner suspected. The literature replaces it with per-group selection
   among rivals, irredundancy across groups, and asking only when the answer changes the advice (strand B §Synthesis).
3. **Function is not outcome.** Design science (FBS, functional ontologies, means-end chains, QFD, Kano) is unanimous on
   this. A feature ("sleep mode") supports an outcome ("sleep undisturbed") only through behaviour measured under the
   deployment condition and compared with a target derived from the outcome (strand C §S1).
4. **Association is not causation.** A relation "property → outcome" needs:
   - a claim level (association, intervention, counterfactual);
   - its conditions;
   - its evidence type and independence;
   - transfer assumptions;
   - contraindications.

   Association-level links may order questions, never assert that a product serves a need (strand D §2).
5. **Context activates needs; it is not a need.** A context fact is a precondition on a knowledge relation, with
   category scope (`ist(c, activates(need))`). Only stated or confirmed feasibility facts ("can't plumb", "can't modify
   the cabinets") may become hard constraints (strand D §1; strand A, Ali et al. 2010).
6. **PEE already holds much of this vocabulary.** It sits in research modules that are not on the request path (§2):
   - Phase56: declared vs scenario-inferred needs, and "irrelevant";
   - Phase61: declared capability vs observed outcome, and thresholds only from the user or a documented domain source;
   - Phase116/117: goal → mechanism → endpoint → failure; outcome vs efficiency dimension;
   - Phase100/126/127: one decision-relevant question, exclusion only on explicit requirements;
   - Phase168: required, excluded, preferred, optional;
   - Phase172/173: usage clue → candidate outcome, never an exclusion.

   The operational store has **no typed relation from a user situation to an outcome**. That missing representation is
   why the R3-P arm B had to match statement text with anchor-word heuristics.
7. **Recommendation (for owner decision, §10):** do not add a new architecture or hundreds of "light sleeper → quiet"
   associations. Consolidate the existing vocabulary into one need model on the request path. Add **one** knowledge
   relation family (context activation, with claim level, conditions, scope and provenance), derived from teaching
   already held. Replace the cap with the hypothesis-management pattern of §5. Evaluate on an unused category.

## 1. Method

**Literature.** Four independent Claude agents surveyed primary literature on the web, one strand each. Each was
instructed to:
- record every source's verification status (full text read, abstract read, secondary source only, could not verify);
- never invent a citation;
- quote fewer than 25 words.

They saw no PEE code and no evaluation material. Their surveys are kept unchanged:

| Strand | File | Sources | Full text | Abstract | Secondary | Unverified content |
|---|---|---|---|---|---|---|
| A. Goal-oriented and ontological requirements engineering | [`needs-reasoning-research/A-gore.md`](needs-reasoning-research/A-gore.md) | 31 | 14 | 4 | 13 | 0 (4 claims flagged inline) |
| B. Abduction, hypothesis management, argumentation, value of information | [`needs-reasoning-research/B-abduction.md`](needs-reasoning-research/B-abduction.md) | 30 | 11 | 11 | 8 | 3 claims |
| C. Function, behaviour, structure; means-end; QFD; Kano; needs- vs feature-based advice | [`needs-reasoning-research/C-design.md`](needs-reasoning-research/C-design.md) | 31 | 11 | 12 | 7 | 1 |
| D. Context; knowledge- and constraint-based recommendation; causality; PROV, OWL 2 RL, SKOS, nanopublications | [`needs-reasoning-research/D-context-causal-prov.md`](needs-reasoning-research/D-context-causal-prov.md) | 38 | 19 | 8 | 10 | 1 |

Notes on the counts:
- **Unverified content** counts sources whose content could not be checked, or for strand B, specific claims that
  could not be confirmed (that strand reported no source as unverifiable).
- The strand-B counts come from the agent's report. Its own tally adds to 30 only if Bruggeman et al. 2025 is counted
  among full texts. That entry was read through a tool summary, and its figures still need checking against the PDF.
- **Totals:** 130 entries (B, C and D each count one double entry as one source); 55 read in full; 4 sources and 3
  claims could not be checked.

Where a strand corrected the brief, the correction stands:
- Zave and Jackson write S, K ⊢ R;
- the ConceptNet paper is "ConceptNet 5.5" (2017);
- Burke 2002 replaces the inaccessible Burke 2000;
- the novice/needs evidence is Randall, Terwiesch and Ulrich 2007 plus Felix et al. 2001, not the paper first named.

Paywalls and HTTP 403/429 answers were respected and the source downgraded; nothing was bypassed.

**Owner-cited works, verified:**
- **Ali, Dalpiaz and Giorgini 2010**, "A goal-based framework for contextual requirements modeling and analysis",
  *Requirements Engineering* 15(4). Read in full (strand A §5.1).
- **Bruggeman, Ciliotta Chehade and Ciuccarelli 2023**, "Expanding user need finding through abductive reasoning",
  ICED23, *Proceedings of the Design Society*, pp. 1745–1754, doi:10.1017/pds.2023.175. Read in full (strand B §19).
  - It is a theoretical proposal.
  - Its only illustration is shoe lacing.
  - It gives no algorithm, no selection among hypotheses and no treatment of uncertainty.
  - The 2025 follow-up (doi:10.1017/pds.2025.10279) compares humans with GPT-4o on very small groups with proxy metrics.

  As the owner said, it motivates the approach but validates nothing here.
- **ISO/IEC/IEEE 29148:2018** (stakeholder needs vs requirements): paywalled; known through SEBoK and Wheaton and Herber
  2024 only (strand A §6.1).
- **W3C PROV-O and OWL 2 RL**: specifications read in full (strand D §F).

**Audit of PEE** (main session):
- grep by operation, not by expected names;
- the module headers and reports of Phases 56, 61, 100, 116, 117, 123, 126, 127, 168, 172 and 173;
- `need_interpretation.ts` (R3-P), `phase253_request_constraints.ts`, `qualitative_needs.ts`, `scientific_entities.ts`;
- a read-only census of a copy of the operational store (copy deleted afterwards; counts only, no values).

## 2. What PEE already has

### 2.1 Store census (operational knowledge, 2026-10-20)

**`category_items`: 284 rows, all `proposed_unverified` / `technical_hypothesis`.**
- `concept_kind`:

  | Kind | Rows |
  |---|---|
  | measurement | 93 |
  | outcome | 55 |
  | environment | 23 |
  | capability | 9 |
  | task | 6 |
  | failure | 5 |
  | mechanism | 3 |
  | none | 90 |

- Sections include `user_goals` (87), `spec_need_relevance` (11), `constraints_requirements` (3), `trade_offs` (4),
  `failure_modes_safety` (4) and `user_questions` (8).

**`category_relations`: 200 rows, all with support `hypothesis` (195) or `method_reference` (5).**

| Kind | Rows | Meaning |
|---|---|---|
| `requires_condition` | 81 | Measurement → test condition |
| `measured_by` | 63 | Outcome → measurement |
| `not_sufficient_for` | 49 | 47 from declared attributes: "a declared attribute is not outcome evidence" |
| `enables` | 4 | |
| `may_support` | 2 | |
| `may_risk` | 1 | |

**`relation_assessments`: 56 rows.** Aspects `sufficiency` (`establishes`, `informs_only`), basis, citation, assessor,
independence and supersession. This is the closest existing analogue of a causal-justification record.

**`knowledge_statements`: 6,118 rows, all `machine_translated_unreviewed`.**

| Type | Rows |
|---|---|
| definition | 1,554 |
| limitation | 1,472 |
| requires | 580 |
| method_step | 487 |
| measured_by | 436 |
| not_sufficient | 311 |
| is_not | 281 |
| quantitative_finding | 266 |
| bears_on_outcome | 237 |
| depends_on | 202 |
| applicability | 135 |
| composed_of | 66 |
| decreases | 50 |
| increases | 35 |
| not_comparable | 6 |

- Each statement carries its source document, line, quote hash, hedge (`may`, `can`...), polarity and a reliability
  class. Reliability: `reliable_type` 3,189, `unreliable_type` 2,637, `unmeasured_type` 292.

**What the census shows:**
1. **No typed situation → outcome relation exists.** The only bridge from a shopper's circumstances to an outcome is
   237 machine-translated, unreviewed `bears_on_outcome` statements, reached by matching words.
2. **`environment` mixes three different things:**
   - shopper circumstances;
   - alternatives to buying (`ventilation_alternative`, `source_control_alternative`);
   - feasibility constraints (`cannot_plumb_constraint`).

   The literature keeps these apart: context fact, solution alternative (OR-refinement / obstacle resolution by goal
   substitution), and resource or feasibility constraint.
3. **The principle "a declared attribute is not outcome evidence" is already data** (47 `not_sufficient_for`). It is the
   design-science rule "function/structure ≠ outcome", applied to specifications.

### 2.2 Existing modules that already carry the literature's distinctions

| Literature concept | Existing PEE owner | On the R3 request path? |
|---|---|---|
| Expressed vs inferred need; "irrelevant" importance (Kano indifferent) | `needs_discovery.ts` (Phase56): `origin: declared_priority \| scenario_inference`; `Importance` includes `irrelevant`; questionnaire choices *activate* criteria | No (research prototype; used by Phase61, demo pipeline) |
| Declared capability vs observed outcome; thresholds only from the user or a documented domain source; practical-difference margins | `contextual_functional_suitability.ts` (Phase61): `FunctionLane = declared_structural_capability \| observed_task_outcome`; `TaskRole`; `DocumentaryThreshold.basis` | No |
| Goal → mechanism → endpoint → failure (FBS-like); `enables`, `may_support`, `measured_by`, `may_risk` | `phase116_category_function_model.ts`; relation kinds reused by `phase247_category_relations.ts` (store) | Relations: yes (store). Graph model: no |
| Outcome effectiveness vs time/pass efficiency vs side effect | `phase117_goal_outcome_comparison.ts` | No |
| One decision-relevant question; preferences only on swings; exclusion only on explicit non-negotiables | `phase100_adaptive_preference_envelope.ts`, Phase126/127 clarification policy | No |
| Ask, show both scenarios, skip; candidate meanings with turn provenance; corrections | Phase127 (stateful clarification) | No |
| Required / excluded / preferred / optional meaning of an aspect | `phase168_qualitative_need_research_bridge.ts` (`Meaning168`) | No |
| Usage clue → candidate outcome with mechanism hypotheses and failure modes; questions typed by decision impact | `phase172_goal_suitability_guide.ts`, `phase173_need_mechanism_graph.ts` (all `proposed_unreviewed`, `hardVetoEligible:false`) | No |
| Qualitative facets as cross-category principles (uniformity, consistency...) | `qualitative_needs.ts` (QE, shadow) | Shadow |
| Requirement / preference / report force; negated need → preference; strict vs inclusive bounds | `phase253_request_constraints.ts` (S103, R3-P) | **Yes** |
| Indifference and negation stance | `language_scope.ts` `stanceAt` (R3-P) | **Yes** |
| Knowledge-guided inferred need, state `experimental_unverified`, path of typed statements, maxInferred 1 | `need_interpretation.ts` (R3-P arm B, opt-in) | Opt-in, frozen |
| Typed scientific entity classes `property \| attribute \| feature \| method \| instrument`; relations never inferred from shared words | `scientific_entities.ts` (S96) | Reading path |
| Rule admission (meaning, scope, exceptions, counterexample, provenance, consumers, evidence); lifecycle | S102/S103 (`rule_admission`, lifecycle) | Governs rules |

**Finding.** The vocabulary the owner asks for mostly exists, but it is dispersed over about ten research modules that
never reached the request path. Several of them overlap: four modules each represent "candidate need not yet
confirmed", and three represent a feature/outcome separation. By the owner's standing rule ("retire proven duplicate
readers"), the next step is consolidation into one need model on the request path, not a new module. The R3-P
`need_interpretation.ts` is the natural owner, since it is the only one on the path.

## 3. Taxonomy of needs

The owner asked for a taxonomy that is explicit, implicit, hypothesised, conditional, optional, negated and unknown,
and that distinguishes goal, quality, constraint, function and technical characteristic. The literature shows these are
**three independent axes**. Mixing them is a known error: CORE separates the kind of statement from the attitude
towards it, and Kano classes belong to a person, not to a feature.

### 3.1 Axis 1: content kind (what the statement is about)

| Kind | Definition and source | Example | Verifiable by PEE? |
|---|---|---|---|
| **Outcome (goal)** | The intended state of the user or their world, solution-neutral (ISO 9241-11 "goal = intended outcome"; iStar goal; Ulrich and Eppinger "what, not how") | sleep undisturbed; espresso with crema and body; clean dry glasses | Only through a measured approximation |
| **Quality (softgoal)** | A desired degree of an attribute with a subjective space; satisficed, not satisfied (iStar quality; NFR softgoal; CORE) | "quiet"; "like an Italian bar" | Through a justified approximation only (CORE jApprox) |
| **Quality constraint** | A quality over a shared, well-defined space: property + unit + method + condition + bound (CORE; Letier and van Lamsweerde 2004) | sound level at the setting that gives the needed clean-air rate, under a named method | Yes |
| **Feasibility constraint / resource** | Something needed by the solution or bounding it (iStar NeededBy; KAOS domain property) | "can't modify the cabinets"; no plumbing; socket; space | Yes (dimensions, installation type) |
| **Function** | What the product is meant to do, independent of how (functional basis; Kitamura) | remove particles from room air; froth milk | Presence only; performance needs behaviour |
| **Way / feature** | One named way of achieving a function (Kitamura "way of function achievement") | sleep mode; steam wand; heat-pump drying | Presence only |
| **Technical property** | Structure or behaviour quantity with unit, method and condition (FBS S/B; HoQ engineering characteristic) | sound power; brew pressure stability | Yes, when measured under a stated condition |
| **Context fact** | Information about the situation: who, where, when, purpose, infrastructure (Dey; Zamani; ISO context of use) | bedroom; small flat; dog; night use | It is the user's word: stated, confirmed or unknown |
| **User statement (belief)** | An assertion about the user that the adviser cannot verify (Ali et al.: *statement* vs *fact*) | "I'm a light sleeper" | No; it only supports hypotheses |
| **Agent assumption** | Behaviour the advice relies on but the product cannot enforce (KAOS expectation) | "I'll grind fresh beans"; "I'll descale monthly" | No; shown as an assumption |
| **Obstacle** | A condition that, with domain knowledge, prevents the goal (van Lamsweerde and Letier 2000) | end-of-cycle beep cannot be disabled; machine needs barista skill | Yes, when formulated over evidence |
| **Solution alternative** | Another way to reach the outcome, possibly without the product (OR-refinement; goal substitution) | ventilation or source control instead of a purifier | It is knowledge, not a need |

### 3.2 Axis 2: epistemic basis (how PEE knows it)

| Basis | Meaning | Owner's term |
|---|---|---|
| expressed | Said by the user in any words | espliciti |
| confirmed | Answered or confirmed by the user | — |
| entailed | Follows from expressed facts by intervention-level knowledge whose conditions are met (rare) | impliciti (strong) |
| hypothesised | Abduced from context through typed knowledge; rivals exist or conditions are unconfirmed | impliciti / ipotizzati |
| conditional | Holds only in a scenario the user described ("when guests come…") or under an unconfirmed context condition | condizionali |
| negated / rejected | The user rejects it or wants its absence (Kano reverse) | negati |
| indifferent | The user says it does not matter (Kano indifferent) | negati (a different case) |
| unknown | Relevant to the decision but neither said nor inferable | ancora sconosciuti |
| defeated | Was hypothesised, then contradicted by the user's words or an integrity constraint | — |

The owner's term *facoltativi* belongs on axis 3 (force), not on this axis.

**Negated and indifferent must stay apart.**
- "No beeps at night" is a *rejection*. It is a constraint with negative polarity, kept at the right layer (strand C
  §S2, test 7).
- "Noise doesn't bother me" is *indifference*. It adds nothing to fit and defeats a noise hypothesis.
- "I don't need more than N" is a *negated need*. It is a statement of sufficiency (R3-P: a preference, never an
  exclusion).

R3-P already separates all three on the request path (`stanceAt`, negated-need → preference).

### 3.3 Axis 3: force (what it may do)

| Force | Licenses | Origin allowed |
|---|---|---|
| requirement (hard) | Exclusion of products that fail it, with a relaxation path and explanation (FastDiag/QuickXPlain idea) | **Only expressed or confirmed**, and only feasibility constraints or explicit must-haves |
| preference | Ordering and visible reasons; never exclusion | Expressed, confirmed, or hypothesised with status `suggested` |
| report / question | Shown, or asked about; no effect on eligibility | Any basis |
| none | Recorded only | Indifferent, defeated, unknown |

The invariant the owner set, and that strands B, C and D each support independently: **a hypothesised need never has
force *requirement*.** Must-be needs ("cleans properly", "is safe") are a separate case. The user usually leaves them
unsaid (Kano). They belong to category knowledge as default *gates on evidence* ("tested to clean"), never to a user
hypothesis.

## 4. Relation model

The model starts from the relations PEE already has. The owner's examples map as follows:

| Owner's example | Existing PEE relation | Literature | Proposal |
|---|---|---|---|
| `measured_by` | `measured_by` (63 store rows; 436 statements) | FBS: behaviour → measured property; HoQ | Keep; add the test condition it applies under (exists: `requires_condition`) |
| `requires_condition` | `requires_condition` (81) | RELAX MON/REL; Woodward's invariance conditions | Keep |
| `insufficient_as_evidence` | `not_sufficient_for` (49); statement type `not_sufficient` (311) | FBS: no F → S shortcut; Pearl rung 1 ≠ rung 2 | Keep the existing name; do not add a synonym |
| `may_impair` | `may_risk` (1), concept kind `failure` (5), Phase116/172 failure modes | KAOS **obstruction** {O, Dom} ⊨ ¬G; iStar *hurt/break* | Generalise `may_risk` to `obstructs` (outcome-level), keeping `may_risk` for safety |
| `used_in` | none | Ali et al. contextual precondition; McCarthy `ist`; strand C `situated_in` | **New: `activates`** (context → outcome); see below |
| `seeks_outcome` | none as data (`user_goals` items exist; the user → outcome link is per request) | iStar goal of an actor; CORE desire | Not a stored relation: it is the *output* of interpretation (a need hypothesis), per request |

### 4.1 Proposed relation family (minimal)

Each row carries the common fields of §4.2.

| Relation | From → to | Semantics | Licenses | Never licenses |
|---|---|---|---|---|
| `activates` *(new)* | context concept → outcome | In context c, outcome o becomes relevant for this category (`ist(c, relevant(o))`), with a strength tier | A need *hypothesis* (status ≤ suggested), a question, a choice of test condition matching the deployment mode | A requirement; activation in another category; chaining (A→B→C) without each step justified |
| `defeated_by` *(new, as data on `activates`)* | activation → stance or context concept | Critical question: the activation fails if this holds ("noise doesn't bother me"; unit in another room) | Withdrawing the hypothesis | Being treated as a positive need |
| `refines` | outcome → sub-outcome | AND/OR refinement (KAOS, iStar) | Decomposition; questions at the right level | Importance from mention frequency |
| `achieved_by_function` (reuse `enables` / `may_support`) | function or way → outcome | The function contributes to the outcome under the goal (Kitamura: goal-relative) | Considering products that have the function; asking for its measured behaviour | Claiming the outcome is met (that needs `measured_by` evidence under the condition) |
| `alternative_to` (exists in code) | solution or way → solution or way | OR-alternatives; goal or agent substitution | Showing alternatives (including "you may not need this product") | Merging alternatives |
| `needs_resource` | product type or way → resource / infrastructure | iStar NeededBy | Feasibility questions; hard exclusion **only** against a stated or confirmed constraint | Assuming the user lacks the resource |
| `obstructs` | property / behaviour / condition → outcome | KAOS obstacle | Counter-evidence; caveats; questions | Exclusion without an expressed requirement |
| `trades_off_with` | property ↔ property | HoQ roof; conditional divergence (van Lamsweerde et al. 1998) | Explaining compromises under a boundary condition | Numeric trade-off weights (Olewnik and Lewis) |
| `measured_by`, `requires_condition`, `not_sufficient_for` | existing | existing | existing | existing |

Two relations are deliberately left out:
- **Generic association** (ConceptNet-style "related", co-mention). It may order questions, but never asserts (strand D
  §2).
- **A user → outcome edge.** That is a per-request hypothesis, not knowledge.

### 4.2 Fields every relation row carries

The fields come from PROV, nanopublications, Pearl/Woodward/Cartwright and CORE jApprox. Most of them already exist on
`category_relations`, `relation_assessments` and `knowledge_statements`.

| Field | Content | Existing column |
|---|---|---|
| kind, from, to | As above | yes |
| category scope | The categories where it holds (a dog matters for vacuums, not kettles) | implicit in `category_id` |
| activation conditions | Context conditions (room, time, mode), as concept ids | no |
| claim level | `association` \| `intervention` \| `counterfactual` (Pearl's ladder) | no (`support: hypothesis`) |
| claim kind | `capacity` (can) \| `manifestation` (does, under conditions) (Cartwright) | no |
| direction / strength tier | Ordinal (`essential`, `strong`, `weak`), never a fake probability (strand B pitfall 7) | no |
| evidence | Source, evidence type, independence, primary source | `source_revision_ids_json`, `relation_assessments` |
| transfer assumptions | Why test conditions carry to the user's home | no |
| contraindications / defeaters | Conditions under which it fails or reverses | partly (`qualification` text) |
| provenance and publication info | Generated by which activity (teaching, derivation, review), attributed to which agent, when, under which retention class; content hash | partly (`review_json`, timestamps) |
| status and lifecycle | `proposed` \| `supported` \| `contested` \| `retired`; superseded by | `superseded_by` on items; S102 lifecycle for rules |

## 5. Justified inference and hypothesis management

### 5.1 When an inferred need is admissible

Synthesis of strands A, B and D, adapted to PEE. A need hypothesis is formed only if **all** of the following hold:

1. **Typed chain.** A cue in the request resolves to a *context concept* by its designation (preferred or alternative
   label: SKOS-style labels of a taught concept, not stems of statement text). An `activates` relation from that
   concept to an outcome exists in the category, with provenance.
   - *"A common word is not a justification"* (owner): a cue that matches only statement prose is not a context
     concept.
2. **Conditions satisfied, or explicitly open.** The relation's activation conditions are either stated by the user
   (bedroom) or left open. Open conditions lower the status to `to_ask` or `suggested`. They are never assumed true.
3. **No defeater holds.** These defeat the hypothesis:
   - an indifference or negation stance on the outcome or its aspect;
   - an explicit contrary statement;
   - a context that contradicts a condition.
4. **Category scope.** The relation holds for the category of the request.
5. **Independent support counted once.** Two cues from the same fact ("bedroom" and "at night") count as one line of
   support (Josephson's consilience requires independence).
6. **One step only.** No silent chaining of hypotheses: dog → hair → clogging → washable filter is a chain of separate
   hypotheses, each needing its own relation and status (Halpern–Pearl non-transitivity; SKOS non-transitive `broader`).

### 5.2 The hypothesis record

From strand B §(1), mapped to PEE fields:

```
NeedHypothesis {
  outcome           taught concept id (axis 1 kind: outcome or quality)
  group             rival set: hypotheses that explain the same cue(s), plus an explicit "other / none" member
  support[]         {cue span, context concept, relation id, relation provenance}
  conditions        satisfied | open (listed)
  defeaters[]       {critical question, state: open | answered-for | answered-against}
  tier              essential | clear_best | weak_best | candidate  (ordinal, Josephson)
  status            asserted | suggested | to_ask | unknown | defeated
  force             always ≤ preference unless confirmed by the user
  trace             as in need_interpretation.ts (path of typed steps)
}
```

### 5.3 Selection without the cap of one

These criteria are ordinal and auditable, with no global optimisation (abduction is NP-hard in general, Bylander et
al. 1991):
1. **Consistency.** Drop anything that contradicts an explicit statement or a hard constraint (status `defeated`).
2. **Coverage.** Count the independent cues explained.
3. **Specificity.** A relation conditioned on more of the stated context beats a generic one (defeasible-logic
   superiority: explicit > specific > generic).
4. **Plausibility tier** of the relation, as taught and reviewed.
5. **Margin within the group.** `essential` means the only explanation; `clear_best` means no near rival; `weak_best`
   means ahead but not decisively.
6. **Irredundancy across groups**, not minimum cardinality: a shopper may have several needs at once (Peng and Reggia,
   caveat).

**Outcome:** one selected hypothesis per group, any number of groups, a small active budget, and every rival kept
visible with its status. This replaces `maxInferred: 1`.

### 5.4 Assert, suggest, ask, leave unknown

| Status | When | Licenses | Never |
|---|---|---|---|
| asserted | Expressed or confirmed; an inferred need only if `essential` or `clear_best` with no open relevant defeater, and still labelled "inferred" | Weighting, explanation; requirement force **only if the user stated or confirmed it** | Exclusion on an unconfirmed inference |
| suggested | `clear_best` or `weak_best`; low stakes | A visible reason ("relevant if it will be in a bedroom"); showing the relevant measurement | Filtering, hiding products |
| to_ask | Rivals are close, or a condition is open, **and** the answer would change the shortlist, an exclusion or a warning (value of information) | One question in situation or needs language; conditional presentation ("if…, otherwise…") | Acting as if answered |
| unknown | No relation fires; only "other / none" fits | Logging a knowledge gap for teaching (offline, R5) | Inventing a need |
| defeated | Contradicted by the user, a stance or a constraint | Recording why it was dropped | Any effect |

The question policy already exists: Phase100/126/127 ask at most one question, only when it is decision-relevant,
offer "show both" and skip, and never ask the user for product measurements. The literature adds two things:
- **impact × uncertainty × stakes** (Howard; Rao and Daumé) as the ordering;
- the **crucial literal**: ask the question whose answer refutes one of two rivals (Kakas, Kowalski and Toni).

Questions should use needs or situation terms. Novices do better with needs-based than parameter-based interfaces
(Randall, Terwiesch and Ulrich 2007). Fixed technical batteries create "means objectives" (Viappiani, Faltings and Pu
2006).

## 6. Function, outcome, property, and causality

### 6.1 The layered chain (strand C §S1)

```
context (L0) —activates→ outcome (L1) —achieved_by_function→ function (L2) ←is_a_way_of— feature (L2′)
   function/feature —realised_by→ behaviour in a mode (L3) —measured_by→ property under test condition (L5)
   structure (L4) —produces→ behaviour (L3)
```

**Key rule:** a feature never implies the outcome. Only the path feature → behaviour → property measured *under the
deployment condition* and compared with a target derived from the outcome supports "the feature contributes to the
outcome".
- **The owner's example.** Sleep mode is a way (L2′). Sleeping undisturbed is the outcome (L1). Sound level and its
  variation at the setting that still gives the needed cleaning rate is the evidence (L5 under a condition from L0).
- **Existing support for this rule.** PEE already enforces it for declared attributes (`not_sufficient_for`) and in
  Phase61 lanes. What is missing is the link from the user's context to the *test condition*: the deployment mode
  chosen by the context.

### 6.2 Operational tests for shopper language (strand C §S2)

1. **"How" test.** Several technical ways possible → outcome or function. One named way → feature.
2. **Beneficiary test.** The subject is the person or their world → outcome. The subject is the product → function.
3. **"Why?" ladder.** Climb to the first personal consequence a test can reach; do not climb to values.
4. **Unit test.** Takes a unit and a direction → property or requirement on behaviour.
5. **Substitutability test.** If the shopper would accept another way, the feature was a proxy. If not ("a real steam
   wand to learn latte art"), the way itself is the requirement (over-abstraction is an error too).
6. **Test-condition test.** A property without its condition is a datum, not evidence for the outcome.
7. **Polarity test.** Keep negative polarity ("no app", "no beeps") as a rejection at the right layer.

### 6.3 Causal justification

A relation "property → outcome" may be used to say a product *serves* a need only at claim level `intervention` with
recorded conditions that the user's context meets. Otherwise its conditions are stated as caveats. Association-level
links (co-mention, reviews, commonsense resources) may only order questions or candidate needs (strand D §2).
- **Manufacturer declarations** give at most `capacity` with `independence = manufacturer`. This is already a PEE
  non-negotiable.
- **A mechanism story without a difference-making test** is a sketch (Machamer, Darden and Craver), not a
  justification. PEE's Phase116 already states "a mechanism is never a measured result".

## 7. Context model (strand D §1)

| Dimension | Examples | Typical effect |
|---|---|---|
| Who | light sleeper, baby, allergy, pets, household size | Activates noise, filtration, capacity or safety outcomes |
| Where | room, floor area, shared walls, storage | Activates compactness and noise; sets conditions for capacity claims |
| Infrastructure | plumbing, venting, cabinets, socket, renter | **Feasibility constraint, only when stated or confirmed** |
| When | night use, frequency | Activates night noise, energy, cycle time |
| Purpose | dry laundry indoors, reduce dust | Root outcome |
| Climate | humidity, temperature, pollen season | Conditions under which a capacity becomes an outcome |
| Expertise | beginner, enthusiast | Dialogue style (needs- vs feature-based); agent assumptions |
| Observability | stated, confirmed, inferred, unknown | Governs assert vs ask |

**Rules:**
- **Context is a pre-filter on knowledge (which relations are live), never on products.**
- **Context relations carry category scope.**
- **No missing-knowledge default.** When a context has no relation, a broader concept may be used (a "studio flat"
  falls back to "small flat" via `broader`), and the answer says so.
- **No context-from-context default.** A guessed context ("renter, so probably can't plumb") is not a stated
  constraint.

## 8. Counterexamples the mechanism must survive

These are illustrative cases for metamorphic and property tests, written for this study. They are **not** taken from
the R3-P evaluation material. Each states the expected behaviour.

| # | Case | Expected |
|---|---|---|
| X1 | "Light sleeper" + the unit is for the living room | Noise hypothesis loses its room condition → `to_ask` or `suggested`, not asserted |
| X2 | "Light sleeper, but noise doesn't bother me with this kind of thing" | Indifference defeats the noise hypothesis (`defeated`) |
| X3 | "Bedroom" and "at night" | One line of support, not two |
| X4 | "We have a dog" for a kettle | No activation (category scope) |
| X5 | "We have a dog" for an air purifier | Hypothesis group (hair, odour, allergy) with "other/none"; question only if it changes the shortlist |
| X6 | "Sleep mode" asked by name, no goal stated | Feature listed; outcome not inferred from the feature alone (Phase61/strand C rule) |
| X7 | "I want a real steam wand" | The way itself is the requirement (substitutability test fails) |
| X8 | "Espresso like an Italian bar, but I don't want to fiddle" | Two rival ways; agent assumption (skill/time) and its obstacle are visible; no hard choice |
| X9 | "Can't modify my cabinets" | Feasibility constraint (stated) → requirement on installation type; built-in types obstructed |
| X10 | "I rent" (nothing about plumbing) | No plumbing constraint; at most a question |
| X11 | Manufacturer night-mode sound figure, no condition | Datum; not evidence for the outcome without the setting and method |
| X12 | Chain dog → hair → clogging → washable filter | Separate hypotheses, each needing its own relation; no transitive leap |
| X13 | Two plausible needs from one sentence (bedroom: noise and light at night) | Both kept (different groups); neither capped away |
| X14 | Unknown context word with no relation | Kept visible as uninterpreted; `unknown`; logged as a knowledge gap |
| X15 | Adding an irrelevant sentence | Hypotheses and statuses unchanged (metamorphic invariance) |

## 9. Transferable experimental method

A method for any implementation that follows. It is not authorised by this study.

1. **Preregister** arms, metrics and stop rules before any run:
   - A: no knowledge;
   - B: current relations;
   - C: with `activates` relations;
   - ablations: no defeaters, cap-1 vs groups.
2. **Knowledge authoring is separate from evaluation.** `activates` relations are *derived* from teaching PEE already
   holds (owner packages, `bears_on_outcome` statements, `user_goals` items, Phase172/173 rules). Derivation is by a
   generator with admission records (S103), never by Claude writing synonyms to pass tests (owner R3-P). Their
   provenance and status are recorded, and they are sealed before evaluation.
3. **Material.**
   - Real consumer requests (Phase251 policy) plus fresh agent-written requests.
   - Two blind annotations and an adjudication with the axis 1–3 labels of §3.
   - Sealed before any run.
   - Includes **one category used neither for authoring nor for development**: the transfer check the owner asked for.
4. **Metrics** over the whole reference:
   - expressed needs found;
   - inferred needs found, and invented;
   - stances (negated, indifferent, rejected) respected;
   - **hard exclusions created from inferences (must be 0)**;
   - questions asked and whether the answer would change the shortlist;
   - worst group per category;
   - complexity added (relations, rules, code) against capability gained.
5. **The counterexample suite of §8** as metamorphic and property tests, written before implementation.
6. **The R3-P first runs as diagnosis.** When the frozen pilot's results are committed, compare its failures with the
   gaps of §2. Expected (to check, not presumed):
   - B's errors come from word-matched statements (no typed context relation);
   - the cap hides co-occurring needs;
   - context conditions are not checked.

   If the results show different causes, this study's priorities change.

## 10. Proposal for owner decision

**Roadmap position.** This study serves R3-P question 6 (which limitations remain: representational, linguistic,
scientific, evidential, architectural) and prepares the next decision after the pilot. It changes nothing in R3-C, R4
or R5. Learning new relations from experience remains R5.

**Anti-drift checklist (§4 of the roadmap):**
1. **Step:** R3-P (research supporting its question 6), authorised by the owner's request of 2026-10-20.
2. **Kind:** vocabulary and inference design. No learning, no transfer shown.
3. **Level and tier:** proposed; no tier (no runs).
4. **Unseen data:** not shown.
5. **Complexity:** none added. The proposal adds one relation family plus fields, and removes duplicate need models.
6. **Negation:** indifference and negation defeat hypotheses. An `unknown` status is never read as absence.
7. **Evidence links:** §4.1 says what each relation licenses and never licenses.
8. **Integrity:** the pilot is untouched. Counts in this study come from the files and the store census.
9. **Standing warnings:**
   - no per-category fixes, since relations are data derived from teaching;
   - no new architecture, since this is consolidation into the existing request-path owner;
   - history is preserved;
   - shadow only.

**Proposed sequence, each step a separate owner decision after the R3-P report:**

| Step | Content | Kind | Exit |
|---|---|---|---|
| N0 | Consolidation map: which of Phases 56, 61, 116, 117, 168, 172 and 173 hold the one representation of need kind, basis, force, function/outcome lanes and hypothesis state; retire duplicates into `need_interpretation.ts` and `phase253_request_constraints.ts` | Vocabulary | Map, consumers, equivalence tests; nothing lost |
| N1 | Split `environment` into context / alternative / feasibility. Add `activates` with the §4.2 fields, **derived** from existing teaching with admission records; claim levels on existing relations | Vocabulary (data) | Census before/after; every row with provenance and status `proposed` |
| N2 | Hypothesis groups, defeaters, statuses and per-group selection replacing the cap; question ordering by impact × uncertainty × stakes on the existing Phase126/127 policy | Inference | Counterexample suite §8 passes; 0 exclusions from inference |
| N3 | Preregistered evaluation §9 including one unused category | Transfer | Report by maturity and kind; first runs unchanged |

**What this study does not establish:**
- that any of these mechanisms works on PEE's requests (no runs);
- that the proposed relations can be derived with acceptable precision from the existing machine-translated
  statements (2,637 of 6,118 are of a type classed unreliable);
- that users prefer the resulting questions (no user study).

Goal-oriented requirements engineering, abduction-based need finding, jobs-to-be-done and the Kano lifecycle are
used as vocabulary and design principles, not as validated methods (strand A §S3.10; strand B pitfall 11; strand C
pitfall 11).

## References

Full bibliographic entries, DOIs and verification status are in the four strand files. Works this document leans on
most:
- **Requirements engineering:**
  - van Lamsweerde 2001 (guided tour of goal-oriented requirements engineering);
  - van Lamsweerde and Letier 2000 (obstacles);
  - Dalpiaz, Franch and Horkoff 2016 (iStar 2.0);
  - Giorgini et al. 2002 (reasoning with goal models);
  - Zave and Jackson 1997;
  - Jureta, Mylopoulos and Faulkner 2008 (CORE);
  - Ali, Dalpiaz and Giorgini 2010;
  - Whittle et al. 2009 (RELAX);
  - Liaskos et al. 2010.
- **Abduction and argumentation:**
  - Josephson 1989;
  - Bylander et al. 1991;
  - Poole 1988 and 1993;
  - Kakas, Kowalski and Toni 1992;
  - de Kleer 1986 (ATMS);
  - Dung 1995;
  - Modgil and Prakken 2013 and 2014 (ASPIC+);
  - Walton, Reed and Macagno 2008;
  - Atkinson, Bench-Capon and McBurney 2006;
  - Bruggeman, Ciliotta Chehade and Ciuccarelli 2023;
  - Howard 1966;
  - Rao and Daumé 2018.
- **Design science:**
  - Gero 1990;
  - Gero and Kannengiesser 2004;
  - Kitamura and Mizoguchi 2003 and 2004;
  - Hirtz et al. 2002;
  - Umeda et al. 1996;
  - Gutman 1982;
  - Reynolds and Gutman 1988;
  - Hauser and Clausing 1988;
  - Olewnik and Lewis 2008;
  - Berger et al. 1993 (Kano);
  - Felix et al. 2001;
  - Randall, Terwiesch and Ulrich 2005 and 2007;
  - ISO 9241-11:2018.
- **Context, recommendation, causality and representation:**
  - Dey 2001;
  - Adomavicius and Tuzhilin 2011;
  - McCarthy 1993;
  - Burke 2002;
  - Felfernig, Schubert and Zehentner 2012 (FastDiag);
  - Junker 2004 (QuickXPlain);
  - Jannach 2004;
  - Viappiani, Faltings and Pu 2006;
  - Jannach et al. 2021;
  - Zamani et al. 2020;
  - Pearl 2009 and 2019;
  - Woodward 2003;
  - Machamer, Darden and Craver 2000;
  - Halpern and Pearl 2005;
  - Cartwright 1989;
  - W3C PROV-O and PROV-DM 2013;
  - OWL 2 Profiles (RL);
  - SKOS 2009;
  - Groth, Gibson and Velterop 2010;
  - Kuhn et al. 2018;
  - Speer, Chin and Havasi 2017;
  - Sap et al. 2019.
