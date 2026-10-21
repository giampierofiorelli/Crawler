# Architectural review: goal-first scientific reasoning (2026-10-21)

Owner authorisation (verbatim): `.claude/skills/pee-guided-learning/references/owner-architectural-review-authorisation-2026-10-21.md`.
Linked from decision row AR-result and the roadmap entry of the same date. Supersedes nothing.

**Scope.** Read-only. No code, store, model or operational mechanism was changed, and no increment was started. The
only executions were the frozen build on store **copies** (`~/.cache-ar*/`, never the live store). New files:
- this report;
- public counts in `evaluation/ar/c-cause-split.json`;
- private detail in `$PEE_PRIVATE_EVAL_DIR/ar/`, copied to pee-knowledge `private-eval/ar/`.

**Roadmap step served:** R3 (it decides how R3 continues). The review does not advance any capability's maturity.

**Sources consulted:**
- **Code:**
  - request path: `src/phase253_request_advice.ts`, `src/phase248_advisory_journey.ts`, `src/phase248_category_registry.ts`;
  - store and relations: `src/phase246_knowledge_store.ts`, `src/phase247_category_relations.ts`;
  - need and goal modules: `src/need_model_n0.ts`, `src/need_interpretation.ts`, `src/goal_understanding_c.ts`;
  - research: `src/relation_claims_n1.ts`, `src/phase254_research_needs.ts`, `src/phase257_research_planning.ts`,
    `src/phase261_discovery_bridge.ts`, `src/phase262_job_search.ts`, `src/phase272_category_research.ts`.
- **Reports:** R3-P, NR, N0 inventory, first increment (D1), N1, third increment, S97, coordinated plan, Phase272, and
  continuous-scientific-learning readiness.
- **Data:** the I3 reference, run detail and requests; the live store, through a copy.

Three read-only Claude agents mapped three areas: the request path, research and discovery, and representation and
learning. I re-checked every finding this report relies on (file and line, or a run on a copy). Where an agent's claim was
not re-checked, it is marked "unverified".

## 0. Answer to the central question

**Yes, in large part.** Since R3-P we have been improving interpretation algorithms that sit on a knowledge
representation whose only key is the product category. Every knowledge table has `category_id NOT NULL`:
- `category_items` and `category_relations`: `src/phase246_knowledge_store.ts:192`, `:217`;
- `knowledge_statements` and `relation_claims_n1`: `:314`, `:370`.

A relation must join two items of the same category (`src/phase247_category_relations.ts:25-28`). The request path
reads needs only after it has fixed one category (`src/phase248_advisory_journey.ts:394`). Every later stage is keyed
by that category: relations, products, need knowledge, coverage and goal assessment.

There is no node for a need, cause, strategy or solution family above the category, and no link from one need to several
categories. Non-purchase remedies exist, but each sits as a concept inside one category (9 in all, for example
`air_purifiers|ventilation_alternative` and `dehumidifiers|leak_or_structural_alternative`). So they are reachable
only after a product has been chosen.

The owner's caution is confirmed, though. **Missing knowledge is not the main cause of all errors.** On the 60 sealed
I3 requests (§2), C's misses (38 requests with a primary family not found) and its wrong commitments split into five
causes:
- missing knowledge;
- knowledge PEE holds but cannot reach;
- a representation that cannot hold the answer;
- requests that need no family at all;
- a matching algorithm whose evidence does not discriminate, which cuts across every class.

Knowledge that is truly absent explains 14 of 60 requests, plus 9 whose remedy is non-purchase and also undocumented. It
does not explain 49.

The fundamental dependency is therefore **the entry key of knowledge and reasoning**. That key is the category, where
it should be the need, goal or situation. Algorithmic and integration defects compound it, and each of those can be
fixed separately.

## 1. What was asked and where it is answered

| Owner question | Section |
|---|---|
| Six capabilities: what exists, what is disconnected, what is missing | §3 |
| C and N1: first loss point, cause split, never assuming missing knowledge | §2, §4 |
| Counterfactual experiments; say when data cannot decide | §2.4, §8 |
| Heuristics and learned models: general, or fitted to seen documents? | §5 |
| Web experience: interaction alternatives, questions only for what the user alone knows | §6 |
| Alternatives, advantages and costs; recommended path; next increment (not authorised) | §7, §8, §9 |

## 2. C re-examined: where the information is lost

### 2.1 Cause split on the sealed I3 requests (post-hoc, spent material)

Classes were assigned by Claude from the adjudicated reference (single annotator, post hoc). C1 was re-run read-only with
the frozen build on a copy of the live store. Public counts are in `evaluation/ar/c-cause-split.json`; the private
detail is in `$PEE_PRIVATE_EVAL_DIR/ar/c-cause-split-detail.json`.

| Class (by the reference's primary family) | Requests | C1 primary found | Invented hypotheses | Unjustified commitments | Abstained |
|---|---|---|---|---|---|
| **In knowledge:** primary family taught and registered | 11 | **10** | 3 | 1 | 1 |
| **Non-purchase remedy, matching knowledge stored** under some category's `*_alternative` | 6 | 0 | 3 | 3 | 1 |
| **Non-purchase remedy, nothing stored** | 9 | 0 | 5 | 4 | 4 |
| **Family held but unreachable:** tumble dryers taught but not registered; soundbars, speakers and robot cleaners documented in never-translated owner packages | 8 | 0 | 3 | 1 | 4 |
| **Family absent** from PEE in any form | 14 | 0 | 7 | 4 | 6 |
| **No family needed:** vague, gift, nothing fits | 12 | — | 2 | 3 | 9 |

**What this shows**

1. **Where knowledge exists and is reachable, C finds the family: 10 of 11.** This includes 3 of 3 problem-only
   requests (dampness, wildfire smoke, laundry that will not dry).
   - The third-increment headline (3 of 39) mixed this group with the out-of-knowledge one.
   - The owner's request to separate in-knowledge and out-of-knowledge samples is therefore a requirement for a valid
     measure, not a refinement.
   - The in-knowledge sample is small (11). It shows that the mechanism can work, not how well it works.
2. **Integration and representation, not absence, block 14 requests (6 + 8).**
   - PEE already holds the relevant knowledge: either an `*_alternative` concept for the right remedy (mould, condensation,
     cooking smells, dust mites), or a family taught or documented by the owner.
   - It cannot reach that knowledge. The alternatives are scoped to a category that the request does not name. Tumble
     dryers are taught in the store but absent from the hand-written registry. The owner packages for soundbars,
     speakers and robot cleaners were never translated (D1: 1,910 relations).
3. **The representation cannot hold the correct answer for 15 requests.** Their primary remedy needs no purchase:
   - 6 have a stored per-category alternative;
   - 9 have nothing.

   Even with perfect interpretation, PEE's answer types (`Decision248`, `Advice253.response`) and C's `HypothesisC.family`
   can only express a product category. `no_purchase_check` is reachable only inside an already-named category
   (`src/phase253_request_advice.ts:513`).
4. **True knowledge absence: 14 requests** (washing machines, microwaves, hobs, fans, fridge freezers, cooker hoods and
   others). Here missing knowledge is the cause. The correct behaviour is "outside my knowledge: research needed". C did
   that in 6 of 14 (abstain); it committed to a wrong family in 4.
5. **No family needed: 12 requests.** Knowledge is irrelevant here; the right action is a question. C abstained or asked
   in 9 and committed wrongly in 3. This is an algorithmic error, not a knowledge gap.

### 2.2 The algorithmic defect that cuts across every class

- **Invented hypotheses.** C's 23 invented hypotheses come from shared word stems with no shared meaning. Examples:
  "scrubb, spot" gives dishwashers; "sofa, day" gives televisions; "hot, gets" gives toasters; "place, nice" gives
  coffee machines; "open, lift, pans" gives televisions; "watch, film" gives televisions.
- **The score does not separate justified from invented hypotheses.** The median is 11.0 for the 12 justified
  hypotheses and 11.04 for the 23 invented ones.
  - No threshold or commitment rule can fix that. The evidence signal itself does not discriminate.
  - Justified hypotheses often rest on incidental words too ("window", "smell", "house"). Some of the 10 in-knowledge
    hits are therefore partly lucky. The data cannot say how many.
- **Object roles are a second, separate algorithmic defect.** C labelled 7 objects "requested" that the reference called
  alternative (4) or owned (3), and 3 owned objects as context.
  - A television mentioned as the owned device became the requested family in four requests. Examples: "soundbar for
    the living room TV", and "the telly can be heard downstairs".
  - The operational path (C0) makes the same error: "soundbar for the TV" leads to televisions.
- **Lexical capture in the operational path.** Its need-inferred category commits from the same kind of overlap:
  - black spots on a bathroom ceiling, an electricity bill and a noisy breakfast all lead to dishwashers;
  - a fish smell leads to pressure cookers;
  - arthritic hands lead to televisions.

  The operational path has its own mechanism for this (`src/phase248_advisory_journey.ts:359-368`). It is not caused by C.

### 2.3 First loss point per class

| Class | First loss | Kind of cause |
|---|---|---|
| In knowledge, invented extras | Hypothesis evidence = shared stems (`goal_understanding_c.ts` support scoring) | algorithm |
| Non-purchase, stored | Knowledge reached only through a category key (`phase248:394`; `phase246:192`) | representation + integration |
| Non-purchase, absent | No answer type or node type for a non-purchase strategy | representation (then knowledge) |
| Held, unreachable | Registry is a code constant (`phase248_category_registry.ts`); packages untranslated | integration / acquisition |
| Absent | No knowledge; and no typed research need is raised (`phase254_research_needs.ts:70` returns `[]` without a category) | knowledge + integration |
| No family needed | Commitment from incidental overlap | algorithm |
| Owned or context object as the request | Object-role assignment (7 of 18 roles correct) | algorithm (interpretation) |

### 2.4 What the existing data cannot decide

These questions remain open:
- whether the in-knowledge result (10 of 11) holds on a larger sample;
- whether the 14 held-but-unreachable or stored-alternative requests would be answered correctly once their knowledge
  is reachable;
- for absent families, whether the right abstention would persist once the matching is fixed.

Each needs a counterfactual run that supplies one input to one module, on a copy, with everything else frozen (§8, E1–E5).

## 3. The six capabilities

Legend:
- **D:** demonstrated (operational, measured);
- **P:** present but disconnected, or shadow only;
- **M:** missing;
- **X:** a defect in an algorithm or an integration.

### 3.1 Understanding needs, problems, goals and constraints independently of the category

- **D:**
  - negation and stance-aware need recognition inside a known category (R3-P, sealed T1);
  - constraint semantics: intervals, units, requirement vs preference (S103);
  - budget and hazards (Phase125).
- **P:** N0 (`src/need_model_n0.ts`) holds goal, problem and context spans without a category, untyped. C holds hypotheses
  with full justification. Neither feeds an answer.
- **M:** a typed need, goal or situation node not owned by a category.
- **X (verified by runs on a copy)**
  - "I need something to keep my small flat dry, under 200 pounds" returns `clarification`.
    - The generic question is "Which kind of product are you looking for…".
    - `needs:[]`, `constraints:0`, `unassessedObjectives:[]`: the budget and the goal are dropped silently.
    - Cause: `phase253:104-107` returns before constraints are set, and request coverage runs only when a category is
      found (`:309`). This breaks engineering principle 8, "no silent loss of user intent".
  - "The air in my flat feels stuffy and I get headaches. What can I do?" returns `out_of_scope`, because "can i" is read
    as a product term (`namedProductTermIn`, `phase248:392`). The store already teaches `ventilation_alternative`.
  - "My bedroom walls have black mould from condensation" leads to dehumidifiers, `clarification` with **no question**,
    and the leak or structural alternative is never raised. Cause: `phase253:135-137` copies an empty question list from
    `phase248:466`.

### 3.2 Cross-category scientific knowledge: need → strategies, mechanisms, categories, combinations, no purchase

- **D:** per-category teaching with conditions and provenance:
  - 284 items, 200 relations and 6,118 statements;
  - full provenance (document SHA-256, line, hashes, journal) and review status.
- **P:**
  - N1 row claims already have the roles situation, need, function, alternative and the link `alternative_of`, with
    qualifiers and rebuild from source. But they are category-scoped, carry free cell text, and have 0 rows in the
    persistent store.
  - The QK pack has cross-category `useContexts`, `aspects` and `facets`, as reading vocabulary only.
  - NR proposed `activates`, `obstructs` and `alternative_to`, all category-scoped and none implemented.
- **M:** cause, strategy and solution-family node kinds; need → several categories, combinations, non-purchase
  strategies; mechanism as a chain step (3 items of kind `mechanism`; no need → mechanism → criterion link).
- **Knowledge already documented but not held:**
  - **D1 census:** 632 situation → need relations in the owner packages, of which 48 survive in the store.
  - **Expression → goal tables:** about 44 tables (about 462 rows). Heuristic count by an agent, unverified.
  - **Alternative or category-solution columns:** about 20 tables (about 300 rows). Same heuristic count, unverified.
  - **Mechanism columns:** 7 tables.

### 3.3 Category requested, to be discovered, or not yet needed

- **D:** an explicitly named category (7 of 8 in-knowledge named requests correct in I3); out-of-scope for named unknown
  products.
- **P:** C's ask, commit or abstain with hypotheses; its four correct "nothing fits" abstentions against one for C0.
- **M:** a "category not yet needed" state.
  - The path cannot answer at the level of a goal or strategy before a category ("first check ventilation; if that is
    not possible, a dehumidifier or an extractor fan").
  - A response with no category can only be a request for a category.
- **X:** need-inferred category by lexical overlap (§2.2); the purchase-phrase head and "what can I do"; context objects
  taken as the product.

### 3.4 Recognising missing knowledge and starting research

- **D:**
  - gaps are stated in the answer: `researchPlan` strings, `out_of_scope`, `unassessedObjectives`;
  - research needs are typed for products of a known category (Phase254);
  - plans are made under policy (Phase257, dry run);
  - an operator-run live wave applies robots and 403/429 gates;
  - reading, typing and provenance of fetched pages.
- **P:**
  - the Phase272 unknown-category pilot went from an unseen product to hypothesis-level teaching in the representation
    the path consumes;
  - discovery: the Phase261 known-channel bridge and the Phase262 search adapter (no provider configured);
  - the Phase264 metadata pilot.
- **M:**
  - no research is ever triggered by missing need or goal knowledge;
  - no component looks for method or teaching sources for a new problem (Phase272's sources came from an operator
    web search);
  - no orchestrator links request → gap → plan → discovery → reading → teaching → better answer.
- **X**
  - `researchNeedsFromAdvice254` returns `[]` when there is no category (`phase254:70`), and ignores unrecognised needs.
  - The `missing_criterion` gap is excluded by `PHASE257_NEED_KINDS` (`phase257:28`).
  - `researchPlan` is `string[]` (`phase253_advice_contract.ts:49`).
  - Learned categories never enter the registry.
  - **By design:** Phase257 rejects any policy with source reads (`phase257:62`), while Phase261/262 run only with reads
    allowed. Live discovery is therefore unreachable. This is the owner's Phase257 decision ("specification research
    only"), a safeguard rather than a bug; changing it needs an owner decision.

### 3.5 Telling genuine user ambiguity apart from software defects

- **D:** separate errors are measured (unjustified interpretation vs unjustified abstention, S54); first-run discipline;
  the R3-P oracle counterfactual for the category cause.
- **P:** C's justification fields: reason, support, conditions and counter-evidence on 100% of hypotheses.
- **M:** an uncertainty cause carried by the answer itself (missing knowledge, retrieval, interpretation, algorithm,
  integration, genuine ambiguity). Today every failure leaves the path as the same `clarification`.
- **X:** these questions hide defects:
  - the generic category question after a recognition failure;
  - a clarification with no question at all;
  - a goal question offering repair alternatives as product goals (`phase248:452-453`);
  - `goalAssessment.decision='research'` with `response` left as `clarification`.

### 3.6 Improving through scientific learning and experience, not words and thresholds

- **D:** rule governance (S100-S103: admission, lifecycle, static analysis). This is control of rules, not learning.
- **P:** experience cases (24 plus identity traces). This is regression memory with no runtime consumer.
- **M:** any learning that changes need or goal behaviour on fresh material; any demonstrated transfer of need
  knowledge across categories (first-increment §7: "none shown").
- **Evidence of word and threshold growth on the request path**
  - The two request-path modules carry 58 comments recording development-driven exceptions (34 + 24).
  - The registry is hand-written: 60 aliases, 16 cues, 8 need counterexamples.
  - C has 8 tuned parameters.
- **Learned definitions (S89-S95) had a negligible effect on unseen material:**
  - 0 terms;
  - no change on 208 values;
  - +2 correct of 222;
  - 11 promoted definitions used 0 times on 398 values;
  - alignment 16% vs a lexical baseline of 17%.

## 4. N1 re-examined

- **The first loss is upstream of N1.**
  - 23 of 48 fresh requests got no category, and the B arm and the B+N1 claims arm (N1 relations added) infer only
    inside a recognised category.
  - Where a category was recognised, claims reached 71 outcomes. Statements already reached 69 of them.
  - So N1's measured lack of effect on need understanding is mostly a **dependency** effect (the category key, §0), not
    evidence that the row claims carry no value.
  - Cause established by the R3-P oracle counterfactual: correct needs tripled when the category was supplied.
- **Table semantics: fitted, not general.**
  - Header vocabulary: development 0.78 → held-out 0.37 / 0.38.
  - Learned model: development 0.59 → template-disjoint held-out 0.14 (vs 0.40).
  - On H1, link pairs transfer (0.81 / 0.66) but kinds and directions do not; on televisions the kind or direction was
    right in only 8% of predictions.
  - The concrete mechanism: one header family ("verification") changes meaning between templates.
  - Data limit: the annotated material (about 190 rows from about 50 tables) is too few templates to train or validate
    any learned role model. Leave-template-out evaluation is the minimum valid design.
- **Retrieval.** 7 of 12 contradicting items were "opposite situation" rows. Retrieval applies no request stance. This is
  an integration defect: N0 and R3-P have the stance machinery.
- **Persistence.** The persistent store (live copy and snapshot) is at schema v10 (`PRAGMA user_version=10`); the code
  is at v14.
  - The S98 `scientific_readings98` (v11–v13) and the N1 `relation_claims_n1` (v14) tables therefore exist only on
    copies.
  - Opening the live store with the current build adds them empty. That is additive and harmless, but no S98 or N1
    knowledge is operational.

## 5. General capability or fitting to seen material?

| Component | Development (spent) | Fresh / held-out | Reading |
|---|---|---|---|
| C, problem requests, family found | 37/55 | 3/39 (10/11 in knowledge) | Rules tuned on spent phrasing. They work where knowledge is reachable and fail as lexical capture elsewhere. |
| N1 header vocabulary, exact links | 0.78/0.79 | 0.37/0.30, 0.38/0.40 | Pairs transfer; meanings do not. |
| Learned table model | 0.59 | 0.14 | One template learned. |
| R3-P knowledge-guided needs | — | 10 of 100 correct | Dominated by the category dependency. |
| Definition learning S89-S95 | positive on spent | about 0 | Vocabulary growth. |

**Pattern.** Each line gained on development and lost the gain on fresh material, and the lost part is always the part
expressed as **words or templates**:
- aliases;
- cues;
- header phrases;
- stem overlap;
- template-specific column meanings.

The parts that hold are representational:
- negation scope;
- typed constraints;
- provenance;
- hypothesis/need separation;
- abstention;
- column pairing.

This supports the owner's suspicion. Algorithms that compensate for a missing representation turn into word lists, and
word lists do not generalise.

## 6. Web experience: interaction alternatives (no interface chosen)

A website, not necessarily a chat. Each mode has its own precondition, and the path today supports only the first two,
as plain strings.

| Mode | When it is justified | What the architecture needs | Today |
|---|---|---|---|
| Direct answer | Enough knowledge and evidence for the stated goal | as now | D (shortlists with cited declarations) |
| Targeted clarification | An uncertainty that only the user can resolve: an owned device, a room, a constraint, a priority | uncertainty cause = genuine ambiguity, with a value of information | strings; also used to mask defects (§3.5) |
| Structured options | Several strategies are plausible ("improve ventilation / extractor fan / dehumidifier / mould treatment") | strategy nodes with conditions and counter-evidence; option = strategy, not only category | M (needs_discovery has an off-path `Choice` type) |
| Progressive research | Knowledge is missing (§2.1 "absent") | a typed research job from the gap; honest "researching" state; policy-gated reads | M (Phase254-257 offline only) |
| Updated results | Research or evidence changes after the first answer | a stable request identity and a re-advice on new knowledge; the Phase177 snapshot and undo exist only in the Phase178 prototype | M |

Two rules follow from the owner's requirement:
- An answer must carry the **cause** of every question, abstention or research step. A question is admissible only when
  the cause is genuine ambiguity.
- A defect must surface as a limitation of PEE, never as a question to the user.

## 7. Architectural alternatives

| Alternative | What it means | Advantages | Costs and risks | Verdict |
|---|---|---|---|---|
| **A. Stay category-first.** Teach more categories and add aliases. | Grow the registry and the packages per category. | Least code; reuses everything. | Cannot represent the 15 non-purchase requests; leaves the 6 stored alternatives unreachable; scales word lists, the pattern §5 shows does not generalise. | Not sufficient. |
| **B. Need scope as a compatible extension of the store.** | Allow `category_id` NULL (or a scope list) on items, relations and row claims. Add node kinds (need/goal, situation, cause, strategy incl. non-purchase, mechanism) and link kinds (need → strategy, strategy → category, strategy → no purchase, situation → need, cause → need), with conditions, counter-evidence, provenance and review. Category knowledge stays where it is. | Same database, journal, provenance and review; no second engine (owner rule); existing per-category consumers are unchanged; the 9 stored alternatives, the N1 claims and the D1 package tables can be re-derived into it. | Migration on every reader that assumes NOT NULL (`relations247`, `needKnowledge269`, knowledge_link, Phase116 compile); rebuild-from-events discipline (G2) must cover it; it needs a goal-first entry on the request path to have any effect. | **Recommended**, staged (§8). |
| **C. Separate goal graph or engine** | A new store or service for needs. | Clean model. | Excluded by the owner (no parallel engines, no second database); duplicates provenance and review. | Rejected. |
| **D. Language model for interpretation** | Let a model map requests to goals and strategies. | Broad phrasing coverage. | Heavy dependency; Qwen suspended by the owner; would hide representation gaps rather than fix them. | Not now. Revisit only with measured justification and owner authorisation. |
| **E. Fix algorithms only:** typed matching, roles, defects | Replace stem overlap with role-typed matching; fix the integration defects of §3.1, §3.4 and §3.5. | Necessary in any case; cheap. | Alone it recovers at most the in-knowledge and no-family classes; the 15 non-purchase and 8 unreachable requests stay structurally blocked. | Necessary, not sufficient: to be done with B. |

**Why reuse is sufficient (no general rebuild).**
- Provenance, review, journal, rebuild, negation scope, constraint semantics, evidence gates, reading and research gates
  are all category-agnostic in function and remain valid.
- Only the knowledge **key** and the **entry** of the request path are category-bound.
- Their replacement is local: a schema extension plus one stage before the category stage.
- The N1 row-claim structure is the closest host: it is n-ary, role-typed, with qualifiers and a rebuild.

## 8. Recommended incremental path, dependencies and experiments

**Dependencies.**
- Goal-first answers depend on (1) need-scoped knowledge and (2) a goal-first entry.
- Both depend on (3) typed matching, without which more knowledge only means more lexical capture.
- Autonomous research (4) depends on (1) for its target: the gap must be a need or strategy node, not a string.
- Better tables (N1 admission, R4) feed (1) but are not blocking: 9 alternatives, 48 surviving situation → need relations
  and the N1 copies already give seed knowledge.

**Counterfactual experiments.** Each runs on a copy, supplies one thing and freezes the rest. They are designed so that
each cause class of §2.1 has a single-mechanism test:

| # | Supplies | Separates | Expected if the diagnosis is right |
|---|---|---|---|
| E1 | Oracle strategy or family (from the reference) to the downstream stages | downstream capacity vs upstream interpretation | In-knowledge and stored-alternative requests reach correct statements; the others show the representation gap |
| E2 | Relocate the 9 stored `*_alternative` concepts and their statements to need scope (copy only) | representation vs knowledge | The 6 stored-alternative requests become reachable without new knowledge |
| E3 | Register the store-taught tumble dryers, and translate one owner package (soundbars) on a copy | integration/acquisition vs absence | The 8 held-unreachable requests split into the reached and the still missing |
| E4 | Replace stem overlap by role-typed evidence on the same knowledge | algorithm vs knowledge | Invented hypotheses fall in every class; justified ones keep a score separation |
| E5 | Inject the correct object roles | role defect vs the rest | The owned-device-as-request errors disappear |

**Evaluation design for any next step**
- Separate samples per class: in knowledge, held unreachable, non-purchase, absent, no family needed.
- Fresh sealed requests, written by an independent author agent, annotated blind twice and adjudicated.
- At least 15 requests per class, so that a class can fail on its own.
- Measures:
  - correct strategy or family;
  - correct non-purchase remedy;
  - correct "outside my knowledge";
  - questions admissible by cause;
  - invented hypotheses;
  - silent losses (should be 0);
  - harm (should be 0).
- Leave-template-out for any learned table method.

## 9. Proposed next increment (not authorised): G1, "need-scoped knowledge and goal-first entry"

**Goal.** Remove the fundamental dependency: knowledge and reasoning keyed only by category. Later work on
interpretation, research and recommendations can then accumulate and transfer.

The increment has four strands; each says what it is, what it builds on, and what it adds or does not add.

1. **Representation.**
   - Extend the existing store compatibly:
     - nullable scope on items and relations, or need-scoped row claims;
     - node kinds need/goal, situation, cause, strategy (including non-purchase) and mechanism;
     - link kinds situation → need, need → strategy, strategy → category, strategy → no purchase, with conditions,
       counter-evidence, provenance and review status.
   - Seed it **only by re-deriving knowledge PEE already holds:**
     - the 9 alternatives;
     - the surviving situation → need relations;
     - the N1 claims on copies;
     - owner-package expression → goal and alternative columns.
   - No new categories and no bulk translation (owner rule).
2. **Goal-first entry in shadow.** One stage before the category stage. It reads the request into need/situation
   hypotheses with the existing N0 objects, scope and roles. It then consults need-scoped knowledge and outputs one of
   these, each carrying an **uncertainty cause**:
   - strategies with their conditions;
   - categories when justified;
   - a question when only the user can resolve the ambiguity;
   - "outside my knowledge" plus a typed research need.

   Typed matching replaces stem overlap (E4). The operational answer is unchanged until admission.
3. **Integration defects.** These are independent of G1's experiment; each is test-first and small:
   - budget and goal dropped without a category;
   - "what can I do" read as `out_of_scope`;
   - clarification with no question;
   - repair alternatives offered as product goals;
   - tumble dryers taught but not registered.

   They change the operational answer and need the 206-request regression with explained diffs.
4. **Gap → typed research need.** Phase254 learns to emit a need- or strategy-scoped research need. **No live reads:** the
   Phase257 policy is unchanged unless the owner decides otherwise.

**Excluded from G1:**
- new categories;
- live research;
- recommendations or ranking changes;
- N1 admission;
- a language model;
- any change to the evidence gates.

**Success shown by:**
- E1–E5 on spent material first;
- then a fresh sealed set separated by class (§8).

**Thresholds to preregister.** The in-knowledge class must not regress. In addition, the measured gains are expected
where §2.1 says the cause is representation or integration:
- the stored-alternative class (6): correct remedy reached;
- the unreachable class (8): reached;
- the absent class (14): correct "outside my knowledge" plus a typed research need, instead of a commitment;
- invented hypotheses: down in every class.

A mere rise of percentages on the same error types would not count. The test is that the non-purchase and out-of-knowledge
classes become **representable and answerable honestly**.

**Why this order.**
- Teaching more categories first (A) would scale word lists.
- Fixing algorithms first (E) would leave 23 of 60 requests structurally unanswerable.
- G1's representation strand (B) and typed matching (E) must advance together. Otherwise new knowledge feeds lexical
  capture.
- Research (strand 4) needs a typed gap to target.
- Table semantics (N1 admission, R4) can follow in parallel. They feed the same need-scoped structure.

**Maturity and kind.**

| Capability | Today | Kind | Maturity after G1 if successful |
|---|---|---|---|
| Need-scoped knowledge | — | vocabulary + inference | proposed → implemented in shadow, validated |
| Goal-first entry | — | inference | proposed → implemented in shadow, validated |
| Typed research needs from gaps | — | inference | proposed → implemented in shadow, validated |

No capability becomes operational without a separate admission decision.

## 10. Uncertainty and limits of this review

- The cause classes were assigned post hoc by one annotator, Claude, on spent material.
- Stored-alternative matching (6 requests) is my judgement.
- The package counts for expression → goal and alternatives are heuristic (agent, unverified).
- Unverified agent claims:
  - the standing research policy's confirmation status;
  - whether anything after Phase272 loads a registry from the store (grep found nothing).
- The in-knowledge sample is 11.
- Nothing here is held-out evidence. It is a diagnosis to be tested by E1–E5 and a fresh, class-separated set.
