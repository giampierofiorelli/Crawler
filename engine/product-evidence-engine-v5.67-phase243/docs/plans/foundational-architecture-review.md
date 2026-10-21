# PEE — Foundational scientific knowledge architecture review

- **Date:** 2026-10-21.
- **Owner request:** verbatim in `.claude/skills/pee-guided-learning/references/owner-foundational-architecture-review-2026-10-21.md`.
- **Kind of work:** read-only review and paper design.
  - Nothing changed in code, store, models or research permissions.
  - No sealed set (G1, G1b) was used.
  - No new package, archive or accessory document was produced.
- **Roadmap step served:** R3 (knowledge-guided needs). The owner required this design step before any further R3
  implementation (SKILL.md §2c: where it sits, which knowledge it uses or changes, how it contributes to learning).
- **Maturity of everything proposed here:** proposed.
- **Kinds:** vocabulary, inference, learning, transfer.
- **Relation to earlier reports:** complements `docs/plans/architectural-review-goal-first.md` (the AR goal-first
  diagnosis) and the G1b–G1d reports. It supersedes none of them.

**Material consulted:**
- **Code:** five read-only audits:
  - request side;
  - store and teaching;
  - concept layers outside the store;
  - evidence path and scientific cycle;
  - experimental layers N0–G1d.
- **Store census:** a store copy (`~/.cache-g1/base.sqlite`, schema v10, same content as the live snapshot).
- **Near-duplicate census:** of the 926 G1b situation rows (bge cosine, situation text only).
- **Reports:** `docs/plans/architectural-review-goal-first.md`, `n1-report.md`, `i3-report.md`, `g1-report.md`,
  `g1b-report.md`, `g1c-report.md`, `g1d-report.md`, `docs/phase272/REPORT.md`.
- **Contract:** `docs/architecture/vertical-contract.json` (open debt D1–D35).

---

## Summary

**PEE has no general structure of scientific knowledge.**
- It has a store keyed only by **category**.
- It holds three or four uncoordinated copies of the same owner packages.
- It has separate vocabularies for the same concepts: "noise" alone lives in at least six places.
- No entity represents a situation, a cause, a strategy or a mechanism.
- No relation has defined semantics for direction, polarity, conditions or epistemic status.

**The cause is the knowledge structure, not the embedding model.**
- Since G1b, every increment has tried to *find* knowledge through better retrieval: lexical, typed, vector, fused,
  verified. That knowledge was never *represented* in a form that can answer the question.
- The demonstrated failures follow from this: 51 of 70 links concern nothing the source says; 18 of 24 asserting clauses
  sit in dropped columns; negation probes fail; categories are invented where none applies.

**Recommendation (§6, alternative C): one canonical, category-independent knowledge graph.**
- **Contents:** typed entities and reified assertions.
- **Persistence:** journal events, with a projection in the existing store.
- **Reasoning:** a closed set of admissible inference rules, run by the existing Datalog engine (`knowledge_rules`).
- **Search:** per-entity-type semantic **views** that only *propose* candidate entities; the graph *decides*.
- **Two directions:** need-first and category-first traverse the same assertions.

Most existing parts are reused (§6.3). What is new is the entity and assertion layer, and one shared request frame that
replaces five duplicate readers.

**Proposed next step (§8, §9): an offline representability experiment, FA-I1.**
- It encodes a stratified sample of existing knowledge in the model and measures what cannot be represented.
- It runs before any schema migration or any code on the request path.
- It waits for owner authorisation.

---

## 1. Inventory of the existing architecture

### 1.1 What exists, by layer

| Layer | Concept models | Status on the answer path | Category-bound? |
|---|---|---|---|
| **Request reading** (`phase248_advisory_journey`, `phase253_request_*`, `request_coverage80`) | purchase target; category; category concepts as needs; constraints (`RequestConstraint253`); quantity and class requirements; stated objectives (regex strings); coverage spans; questions (strings) | **operational** | yes. Needs exist only as concepts of the resolved category, and without a category `adviseCore253` returns early (`phase253_request_advice.ts:110-112`) |
| **N0 need model** (`need_model_n0.ts`) | object roles (requested, owned, context, hypothesised, alternative); item content kind, stance, force, basis | shadow (used by C and G1b–G1d only) | partly; uses static `CATEGORY_REGISTRY250` |
| **NI need interpretation** (`need_interpretation.ts`) | expressed and inferred needs from statements, claims and QK use contexts | gated pilot (`opts.needInterpretation`; no `src` caller sets it) | yes (needs `cat`) |
| **C goal understanding** (`goal_understanding_c.ts`) | category hypotheses with support, conditions and counter-evidence; commit / ask / abstain | shadow, no consumer | a "goal" is a category choice |
| **Store: category teaching** (`category_items` 284, `category_relations` 200, `relation_assessments` 56) | concepts of 8 kinds (task, environment, capability, meaning, outcome, failure, mechanism, measurement); relations requires_condition 81, measured_by 63, not_sufficient_for 49, enables 4, may_support 2, may_risk 1 | **operational** (`runJourney248`, `needKnowledge269`, ra.2 authorisation) | `category_id NOT NULL` |
| **Store: knowledge_statements** (6,118, 6 categories) | machine-translated sentences (definition, limitation, requires, method_step, measured_by, …) with polarity, hedge, subject and object | gated or shadow only; a CHECK fixes `review='machine_translated_unreviewed'` | `category_id NOT NULL` |
| **Store: relation_claims_n1** | n-ary row claims with column roles and a link chain | **absent from the live store** (0 rows; experimental copies only) | per document |
| **Store: evidence** (`declarations` 2,385, `test_measurements265` 12, `qualitative_observations270` 9, `comparative_results271` 87, `scientific_readings98` absent) | declarations by role; publisher-reported tests; outcome codes; comparisons | declarations operational; tests only via evaluation scripts; qualitative rows have no reader; comparative rows air fryers only, none linked to a product | no category column; linked to taught measurements only lexically, at read time |
| **Store: provenance** (`sources` 94, `revisions` 159, `events` 1,919 hash-chained, `research_gaps` 80) | source type (operator-asserted or heuristic); revision sha; journal | operational | no |
| **Quantity knowledge** QK qk.2.6 | kinds 32, metrics 19, units 57, methods 7, condition axes 12, aspects 25, phenomena 13, use contexts 10, facets 6 (all `hypothesis`), relations 5 | operational (requirements, coverage, objectives) | kinds, units and axes are general; metrics, methods, scales, many aspects and use contexts are category-bound |
| **Property definitions** S88 pd.10 | 28 properties (quantity or judgement); 20 condition dimensions (7 tied to QK axes); 4 category profiles | gated reading (S98) | 4 profiles against 17 store categories |
| **Knowledge rules** (Datalog engine with rule lifecycle) | kind, compare, scope, record, link, evidence, comparable and product programs | operational (kind, compare, request semantics); link and evidence programs shadow | the engine is general |
| **S96 entities, S98 reading, S89 definition learning, S95 concept views** | property, attribute, feature, method, instrument; statement role and nature; learned terms | gated or shadow; never reach a stored row or an answer (D30) | mixed |
| **G1b projection** | 926 situation rows (839 package rows + 87 store concepts); 9 strategies (store concepts with suffix `_alternative` / `_constraint`); 41 general needs | shadow, in memory | rows are package-local |
| **G1c index** | 7,094 units (situations, strategies, general needs, statements, situation types); bge-small ONNX | shadow | — |
| **G1d** | source rows with all cells; `RelationG1d` (polarity, quote, header, source label, `derived_unreviewed`); category applicability; three-stage selection | shadow | — |
| **Research** (`phase254`, `phase257`, `phase261/262/223`, source memory 258/260) | typed research needs (`pending_authorization`); dry-run planning; discovery leads | planning only. **No research need ever becomes a fetch**; test and category needs are outside policy | — |

### 1.2 Which models are used, duplicated, disconnected, or depend on old structures

**Used on the answer path.** The operational chain is **request → declarations → unordered shortlist with stated gaps.**
The evidence → ranking half runs only in evaluation. The path consists of:
- the Phase248 journey (category, then category concepts);
- Phase253 constraints and quantity requirements;
- `needKnowledge269` over `category_items` and `category_relations`;
- declarations through `decideAdvice249`;
- ra.2 authorisation;
- coverage.

**Duplicated: the same thing, several uncoordinated models.**
- **Object roles are read five ways:** journey regexes, `ANCHOR253`, N0 cues, C `rejected`, `CLASS_RE` of phase270.
- **Needs are read four times:** journey, NI, N0, C/G1b.
- **Other readers:** negation has three mechanisms, stemming three, and the budget is read twice.
- **The same owner package is stored up to four times, with no shared key:**
  - `category_items` and `category_relations`: TS paraphrases, with the citation pasted into the text, so there is no
    document sha and no line;
  - `knowledge_statements`: document sha plus line;
  - `relation_claims_n1`: cells;
  - the in-memory G1b projection: re-derived from bytes.

  The same `measured_by` fact can therefore exist as an edge, a statement and a claim that do not point to one another.
- **"Noise" lives in at least six places:**
  - QK aspect `noise`, plus its phenomena, facets, metric, method and scale;
  - PD `sound_level` (quantity);
  - PD `noise_experience` (judgement), with no typed link to `sound_level`;
  - store concepts `low_noise` (three categories), `quiet_night_operation`, `noise_and_acoustic_events`, `sound_outcome`;
  - S96 `qkm_*` and `acq_*` candidates.
- **Situations and strategy links:** there are three situation inventories (C items, G1b rows, G1d source rows), and
  strategy links are derived twice (G1b lexically, G1d from asserting clauses).

**Disconnected.**
- **Identity:** nothing joins QK, PD, store concepts and S96 entities; the joins are text or stem matching.
- **Unvalidated references:** PD `outcomes` holds store concept-id strings that nothing validates.
- **Evidence:** stored test, comparative and reading rows have no link to the taught `measured_by` concept.
- **Research:** research needs never trigger research.
- **Definitions:** learned definitions never reach readers.
- **N1 claims:** not in the live store, and missing from the NDJSON export.

**Depending on old structures.**
- Strategy identity is a concept-id suffix (`_alternative`, `_constraint`).
- Every taught need lands in section `user_goals`, whatever its kind.
- `compileTo116` drops `not_sufficient_for` and `requires_condition`.
- The category version hashes only items and relation support, so new statements or claims never create a new version.

**The validation ladder exists only in name.**
- `reviewCategoryItem246`, `reviewRelation247` and `reviewClaimN1` have no caller outside tests.
- CHECK constraints make statements and test independence unreviewable without a migration.
- Independence is inferred from `sources.source_type`, which is operator-asserted or heuristic.

### 1.3 Where the problems sit: representation, acquisition, retrieval, interpretation, reasoning

The experimental-layer audit classified every documented failure; the counts come from the published reports.

| Class | Demonstrated failures | Weight |
|---|---|---|
| **Representation** | families never taught (49 of 60 I3 requests; 14 absent, 9 non-purchase); no-purchase remedies inexpressible except as a category-concept suffix; 6 stored `*_alternative` remedies unreachable (E2 reaches 1 of 13); generic needs taught as family concepts (10 of 19 invented families); no situation, cause or strategy entity; no cross-category entity | **primary** |
| **Acquisition** | N1 held-out exact 0.37/0.30, learned model 0.14; G1b links: 51 of 70 not addressed by the source; 18 of 24 asserting clauses in dropped columns; R1 precision 0.77, recall 0.54; category applicability 40/100 against a trivial 62/100; row extraction partial in 33–56 of 120; about a fifth of package rows are labelled by their own source as PROPOSED_NOT_TESTED, synthetic or hypotheses | **primary** |
| **Retrieval** | paraphrase gap (12 of 24 problem requests share no two content words with any relevant row); vector P@5 0.15–0.17; fused ranking 0.133 < vector-only 0.150; framing words ("I need…") and dense packages dominate similarity; N1 returns contradicting items (11 vs 2) | secondary: caused by how units and queries are formed, not by the model |
| **Interpretation** | object roles 7 of 18; an owned TV read as requested; V fails 5 of 6 negation probes because it embeds the raw request; 23 of 48 N1 requests get no category, so nothing acts | secondary: no shared request frame |
| **Reasoning / selection** | C's stem score cannot separate justified from invented hypotheses (AUC 0.53); the "one dominates" rule is wrong in 11 of 15 commitments; close neighbours across categories (first category correct 10 of 35); contraindicated purchases kept as conditional (V fails 6 of 6 contraindication probes); right category supplied, yet the stored strategy is raised in only 1 of 12 | derived: with no validated assertions to reason over, selection reasons over similarity |

**On embeddings specifically.** The evidence does not support blaming the embedding model.
- The 51 of 70 wrong links were made lexically, before any vector existed.
- Where vectors help, they help as expected: on the paraphrase gap that lexical methods could not cross, L1 recall@10 rose
  to 0.85.
- Their failures come from what was embedded and how it was queried:
  - row text mixing situation and need cells;
  - store concepts embedded as id plus aliases;
  - the raw request, with its framing and negations, used as the query;
  - one index queried with a whole request;
  - absolute cosine gates used as decisions.

The model is a resource. The problem is the design of units, views and query decomposition.

---

## 2. Demonstrated gaps and their structural causes

Each cause is stated with its evidence. The design's remedy is under "Fix" (§3–§5).

**SC1 — Category is the only key.**
- Evidence:
  - `category_id NOT NULL` on items, relations and statements;
  - needs exist only as concepts of a resolved category, so no category means no needs, no questions and no goal
    assessment;
  - a need that several categories serve ("lower my electricity bill") is a separate concept per category;
  - a need that no category serves cannot be represented.
- Consequences: invented categories (G1c D: 66 invented proposals); no-purchase answers unreachable.
- Fix: Need, Situation, Cause, Strategy and Function are category-independent entities; Category is one entity type.

**SC2 — No canonical entity identity across layers.**
- Evidence: QK aspects, PD properties, store concepts and S96 entities name the same concept with different ids ("noise" ×
  6). Joins are by words.
- Consequences:
  - unvalidated links (PD `outcomes`);
  - judgement and quantity not linked;
  - vocabulary gaps reported as open where the concept exists: the contract's "noise vocabulary" gap, despite QK `noise`.
- Fix: one identity per entity; other layers reference it.

**SC3 — One source, several unkeyed copies.**
- Evidence:
  - the same package row is a paraphrased item, several translated statements, an N1 claim and a G1b row, with no
    cross-reference;
  - review of one copy cannot propagate;
  - citations sit inside the hashed statement text, so ids change when a citation is edited.
- Fix: a source passage is a support object that assertions point to; the copies become views.

**SC4 — Relations without semantics.**
- Evidence:
  - relation kinds are few and category-local;
  - N1 link kinds (`relevant_to`, `qualified_by`, `alternative_of`) have no store counterpart, and `compileTo116` drops two
    kinds;
  - polarity, modality, condition kind (essential, modifiable) and epistemic kind are not fields; where they exist
    (statements, G1d relations), they are regex-derived and unreviewed;
  - strategy identity is an id suffix.
- Consequences:
  - "not a substitute for" is read as nothing;
  - a humidifier and a dehumidifier are both "relevant to humidity";
  - contraindications cannot be told apart from caveats.
- Fix: a closed predicate set with direction, inverse, polarity, modality, typed conditions and epistemic kind.

**SC5 — Acquisition reads the wrong unit.**
- Evidence:
  - packages were read row by row through a fixed column chain (situation → need → function …);
  - this dropped the columns where sources assert remedies, conditions and contraindications (18 of 24);
  - links were then made by shared words (51 of 70 wrong).
- Fix: acquisition extracts assertions from clauses with all cells kept (G1d `sourceRowsG1d`, reused), maps them onto
  canonical entities, and enters them as `derived_unreviewed`.

**SC6 — Retrieval units and queries are not semantic units.**
- Evidence:
  - indexed units are package rows (text mixing situation and need), sentences, or id plus aliases;
  - the query is the raw request or its bag of stems;
  - density: one category's 284 rows outvote another's 17;
  - absent knowledge has no representation, so the nearest row always "matches".
- Fix: per-entity-type views; one vector per surface expression, pooled per entity; slot-wise queries; abstention measured
  against out-of-knowledge probes; entities, not rows, are counted.

**SC7 — No shared request frame.**
- Evidence:
  - five object-role readers, four need readers, three negation mechanisms;
  - downstream code receives the flattened `Advice253`, which has no owned objects, no stance and no excluded categories,
    and whose constraints are stripped of property, scenario and object.
- Fix: one query frame with typed slots, built once and consumed by everything.

**SC8 — Selection reasons over similarity, not over assertions.**
- Evidence:
  - C counts stems, G1c ranks cosines, G1d gates cosines;
  - none can say *why* a strategy applies: there are no admissible inference rules, no path status, and no blocking by a
    negative assertion.
- Fix: closed inference rules on the KR engine; the output's status is the weakest link of its path.

**SC9 — The validation ladder is nominal.**
- Evidence:
  - nothing is ever reviewed outside tests;
  - CHECK constraints freeze statements and tests at "unreviewed";
  - independence is asserted, not established;
  - package teaching enters as `technical_hypothesis`, and the source's own label (PROPOSED_NOT_TESTED, synthetic)
    survives only inside text.
- Fix:
  - assertion status is a field with a defined ladder;
  - the source's own label is preserved separately;
  - package text is support, never independent evidence.

**SC10 — Category-specific content inside "general" layers.**
- Evidence:
  - QK metrics, methods, scales, many aspects and use contexts are category-bound;
  - PD profiles cover 4 categories, 2 of them absent from the store;
  - a never-studied category therefore gets only kinds, units and 28 unscoped properties.
- Fix: general entities (functions, mechanisms, properties, methods) are linked to categories by assertions, so a new
  category inherits through function and mechanism rather than through a name.

**SC11 — The cycle is open at three joints.**
- Evidence:
  - answer → research: needs never become reads;
  - shadow readers → store (D11, D30);
  - test rows → catalog (D1, D2, D5).
- Fix: not in this review. The design states where each joint attaches to the graph (§5.3), so that closing them later does
  not create a parallel structure.

---

## 3. Recommended conceptual model

> **Dated note (2026-10-21, FA-I1).** §3.2–§3.5 of this review (model km.1) were corrected into km.2
> (`evaluation/fa-i1/schema-v2.json`) at the owner's request. km.2 was then tested and **not admitted** by the FA-I1
> representability gate (`docs/plans/fa-i1-report.md`): critical losses of provenance, efficacy status, essential conditions
> and negation, and three forbidden inferences. The corrections needed (km.3, K1–K10) are in that report. Read §3 together
> with it; this text is kept unchanged as the record of the original proposal.


### 3.1 Principles

1. **One canonical graph; category is an entity, not a key.**
   - Every scientific statement PEE holds is an assertion between typed entities.
   - Category-scoped tables become projections of it.
2. **Assertions, not texts, are the unit of knowledge.**
   - Package cells, translated statements and page passages are **support**: provenance objects.
   - An assertion cites its support with a quote hash and the source's own status label.
3. **Epistemic separation on every assertion.**
   - The relation kind is one of a closed set with written semantics.
   - Polarity, modality, conditions, epistemic kind, support, counter-evidence and validation status are fields, never
     text.
4. **Two directions, one knowledge.**
   - Every predicate has a defined inverse.
   - Need-first and category-first traverse the same assertions.
5. **Retrieval proposes, the graph decides.**
   - Similarity produces candidate *entity matches* only.
   - A proposal to the user exists only as the conclusion of an admissible inference over assertions.
6. **Absence is explicit.** No verified match produces a typed gap (research need), never the nearest category.
7. **Reuse before invention.** These are hosts, not things to rebuild (§6.3):
   - the journal, provenance and rights rules;
   - QK and PD;
   - the KR engine;
   - the G1c index machinery;
   - the G1d source re-reading;
   - the N0 type axes.

### 3.2 Entity types and identity

| # | Entity | What it is | Identity rule | Seeds already in PEE |
|---|---|---|---|---|
| E1 | **Need / goal** | a desired state of the user's world or use ("keep the bedroom quiet at night", "lower running cost"); general (category-independent) or **contextual** = general need + Context qualifiers, expressed as conditions on assertions and request slots, *not* as new entities | canonical goal + outcome dimension, including its **direction** (more vs less); specialisation by `specialises` | QK aspects (25), G1b general needs (41), store `outcome` concepts (55), N0 content kinds |
| E2 | **Situation** (subtypes **symptom** = observable, **problem** = undesired state) | what a user reports: "condensation on the windows", "the kitchen stays smoky" | observable + locus (+ context) | G1b rows (926; 220 within-category near-duplicate pairs, 2 across categories), store `failure`/`environment` concepts |
| E3 | **Cause / phenomenon** | a physical state or process that produces situations: excess indoor moisture, insufficient air exchange, cooking aerosols, scale deposition | physical description; a QK phenomenon where one exists | QK phenomena (13), statements `depends_on` / increases / decreases |
| E4 | **Strategy / intervention** | an action that changes a cause or situation. Kinds: behavioural; building or maintenance; use-change of an owned object; service; **purchase of a function** | action + target (+ kind); conditions are not part of identity (G1d condition/action split, reused) | G1b strategies (9), store `*_alternative` / `*_constraint` concepts, package "Relevant solution" cells |
| E5 | **Mechanism** | the physical principle by which a function or intervention acts: refrigerant condensation, desiccant adsorption, mechanical filtration, forced convection | principle | store `mechanism` concepts (13 items, 3 typed), statements |
| E6 | **Function / capability** | what a product or system does: remove water vapour from air, capture airborne particles, exhaust air outdoors | verb + object (category-independent) | `functions.v1.json` (29 functions, 22 components), store `capability` / `task` |
| E7 | **Category / subtype / product / variant** | existing families, subtypes, products and variants | existing registry and exact-key identity (never merged on names) | `CATEGORY_REGISTRY250`, `products`, `variants` |
| E8 | **Property** | a measurable quantity (QK kind + metric + method + conditions) or a judgement (PD judgement), linked to the quantity it judges | PD/QK id | PD 28, QK kinds/metrics |
| E9 | **Method** | a test or measurement procedure with its fixed conditions | QK/PD method id | QK methods 7, PD |
| E10 | **Observation / evidence** | a value or outcome about a product/variant and property, under conditions, from a source, with its role (declaration, publisher test, comparative, qualitative, reading) | existing row id | the five evidence tables |
| E11 | **Source / support passage** | a document (page revision, owner package, standard) and a passage within it (sha + line or cell) | revision sha + locator | `sources`, `revisions`, statement `source_sha256`+`line`, N1/G1d cell hashes |
| E12 | **Context** | conditions of use and of the user: room size, climate, temperature, household, owned objects, installation (no sink, rented flat) | QK condition axis or use context, PD dimension; otherwise a typed context id | QK axes (12), use contexts (10), PD dimensions (20) |
| E13 | **Gap** | a typed absence: missing entity, missing assertion of a named predicate, or unverified assertion | (gap kind, subject, predicate) | `research_gaps`, `phase254` needs |

**Entity status.**
- An entity is `candidate` (machine-derived), `reviewed` (identity accepted) or `superseded`.
- A merge or split is a journal event, never an overwrite.
- Entities carry no scientific claims; claims are assertions.

### 3.3 Assertions (reified, n-ary)

Every assertion has these fields:

- **Core:** `subject`, `predicate`, `object` (entity ids).
- **Polarity:** positive; negative ("does not", "is not a substitute for"); or null effect.
- **Modality:** `necessary`, `sufficient`, `contributes`, `may`, `not_sufficient`, or `contraindicated`. A
  contraindication carries a **condition kind** — `essential`, `modifiable` or `nonessential` — per the owner rule in the
  G1d brief.
- **Conditions[]:** typed Context or Property thresholds ("ambient temperature < 15 °C", "room has an outdoor wall"). Each
  carries its kind: applicability condition, prerequisite or exclusion.
- **Scope:** general, or restricted to categories, subtypes or contexts.
- **Epistemic kind:** `definition`, `physical_law` (idealised), `documented_guidance` (expert or method source),
  `measured_result`, `statistical_association` or `hypothesis`.
- **Support[]:**
  - passage ids with quote sha;
  - the **source's own label**, kept verbatim (e.g. PROPOSED_NOT_TESTED, synthetic, source_backed_observation);
  - the source role (owner package, standard, publisher, manufacturer).
- **Counter[]:** assertions or observations against it.
- **Validation status:**
  1. `derived_unreviewed`;
  2. `structurally_reviewed`: well-formed and faithful to the quote;
  3. `source_verified`: support re-read and confirmed;
  4. `independently_supported`: independent evidence or independent expert review.

  Side states: `refuted`, `superseded`.
- **Provenance:** journal event id, deriver and version, rule id.

### 3.4 Predicate set (closed; each with semantics and inverse)

| Predicate | Subject → object | Semantics | Inverse |
|---|---|---|---|
| `produces` | Cause → Situation | the cause brings about the situation (causal) | `produced_by` |
| `indicates` | Situation → Cause | defeasible diagnosis; used for one step only | `manifests_as` |
| `frustrates` | Situation → Need | the situation prevents the need | `frustrated_by` |
| `addressed_by` | Situation or Need → Strategy | the strategy resolves or serves it, with polarity, modality and conditions | `addresses` |
| `acts_on` | Strategy → Cause | the strategy changes the cause, with the direction of change (reduces, removes, increases) | `acted_on_by` |
| `requires_function` | Strategy (purchase or use-change) → Function | the strategy is carried out by that function | `required_by` |
| `provided_by` | Function → Category, Subtype or Product | the family provides the function (stated at subtype level when only some subtypes do) | `provides` |
| `works_by` | Function → Mechanism | how the function is achieved | `realises` |
| `valid_under` | Mechanism, Function or Strategy → Context condition | applicability domain (e.g. a compressor dehumidifier loses capacity at low temperature) | — |
| `assessed_by` | Function or Need → Property | the property measures how well it is served; carries sufficiency `establishes` / `informs` (existing `relation_assessments`) | `assesses` |
| `not_sufficient_for` | Property → Function or Need | the existing kind, kept | — |
| `measured_with` | Property → Method | — | — |
| `contraindicated_for` | Strategy or Category → Situation, Context or Need | must not be proposed when the object holds; condition kind essential, modifiable or nonessential | `contraindicates` |
| `conflicts_with` | Strategy → Need | opposite effect (a humidifier against "reduce damp") | — |
| `not_substitute_for` | Strategy → Strategy | the first cannot replace the second (purifier vs exterior-venting extraction) | — |
| `specialises` | Need → Need; Situation → Situation | a more specific form | `generalises` |
| `subtype_of`, `instance_of`, `variant_of` | Category / Product / Variant | the existing taxonomy and identity | — |
| `about`, `of`, `under`, `from` | Observation → Product, Property, Context, Source | the existing evidence rows, as typed edges | — |

**Co-occurrence, similarity and retriever agreement are never assertions.**
- **Similarity** is a property of a view. It is used only to propose a candidate match or a candidate identity merge.
- **Co-occurrence** is a statistic.
- **Association:** a `statistical_association` assertion is allowed when a source reports one, but no rule may derive a
  strategy from it alone.

| Kind of claim | Where it lives |
|---|---|
| similarity | views only |
| co-occurrence | statistics only |
| association | `statistical_association` assertions |
| causation | `produces` / `acts_on`, with epistemic kind `physical_law` or `documented_guidance` |
| demonstrated effectiveness | `addressed_by` at `independently_supported`, or backed by observations |

### 3.5 Admissible inferences (closed rule set, executable by the KR Datalog engine)

**Path status rule.**
- A conclusion's status is the **minimum** along its path, on two scales:
  - validation status;
  - epistemic kind: `hypothesis` < `statistical_association` < `documented_guidance` < `measured_result` <
    `physical_law` / `definition`.
- Scope is respected along the path.
- A negative-polarity assertion on the path **blocks** the conclusion.
- A conclusion never states more certainty than its weakest premise.

**Rules.**

- **I1 Documented remedy.**
  - If `Situation S addressed_by Strategy T` (positive), and T's conditions can be satisfied in the request context, then
    T is a candidate for S.
- **I2 Mechanistic remedy (weaker).**
  - If `S indicates C` and `T acts_on C` (reduces), then T is a *mechanistic hypothesis* for S.
  - Both premises must be at least `structurally_reviewed`.
  - The conclusion is labelled as derived and never ranks above an I1 conclusion.
  - `indicates` is never chained twice.
- **I3 From strategy to purchase.**
  - If `T requires_function F` and `F provided_by K`, then K is a candidate family.
  - Then apply the contraindication rule:
    - essential → **not suitable**, stated with its support;
    - modifiable or unverified → **conditional possibility**, never "suitable";
    - nonessential → **assessed** as a disadvantage.
- **I4 Opposites.**
  - If `T conflicts_with N`, and N or its generalisation is in the request, then T is excluded.
  - If `T not_substitute_for T′`, and T′ is the documented remedy, then T is offered at most as an adjunct.
- **I5 What to measure.**
  - If the need is served via F, and `F assessed_by P` with a sufficiency, then P is decision-relevant.
  - Observations of P are comparable only under the conditions of `valid_under` and the method (existing QK
    comparability and ra.2).
- **I6 Category-first (inverse traversal).**
  - `K provides F`, `T requires_function F` and `T addresses S/N` give the needs and situations K serves.
  - `K contraindicated_for X` gives where K must not be used.
  - These are the same assertions as in I1–I3, traversed backwards.
- **I7 Negation and exclusion in the request.**
  - A negated or rejected slot becomes an exclusion constraint on the matching entity.
  - It is never a positive query term.
- **I8 Named product.**
  - A family the user names is their choice. It is never replaced on similarity.
  - The reasoning checks:
    - which of the stated situations or needs K serves (I6);
    - K's contraindications in the stated context (I3);
    - whether an assertion says K does **not** address a stated situation (e.g. a purifier for CO2).
  - In that last case, the documented remedy is offered alongside K, with its quote.
- **I9 Absence.** The result is a typed Gap (subject, missing predicate), never the nearest family, when either:
  - no slot has a verified entity match; or
  - a matched situation has no `addressed_by`, and no cause with `acted_on_by`.
- **I10 Questions.**
  - A question is allowed only when two conclusions of comparable status differ by a Context or Situation fact that only
    the user knows (owner rule, G1d).
  - Missing knowledge never produces a question (I9).

**Not admissible.**
- Transitive similarity.
- "A category is relevant because many of its rows matched."
- Promoting `derived_unreviewed` assertions to a proposal above "hypothesis".
- Treating package teaching text as independent evidence.
- Deriving performance from the presence of a component (the existing product-rules prohibition).

---

## 4. Design of semantic units and indexes

### 4.1 What is embedded and what is not

| View (index) | Unit | Text embedded | Granularity | Used for |
|---|---|---|---|---|
| **V-situation** | Situation entity | each **surface expression** (user wording from packages, cases and reviewed request spans), *without* framing words | one vector per expression; the entity score is the maximum over its expressions | situation and symptom slots |
| **V-need** | Need entity | the goal statement and surface expressions (QK aspect terms, outcome aliases) | as above | goal slots |
| **V-strategy** | Strategy entity | the **action phrase only** (the G1d action, without its condition) | one vector per action expression | strategies the user reports having tried ("I already tried airing the room"); alignment during acquisition |
| **V-object** | Category, subtype or function | names, aliases, function phrases | one vector per alias | requested and owned object slots, after the lexical registry match |
| **V-property** | Property | PD surface words, QK terms | one vector per term | constraint and quality slots ("quiet" → `sound_level` / `noise_experience`) |
| **V-passage** (acquisition only) | support passage | the passage text | one vector per clause | aligning source clauses with candidate entities during derivation and review. **Never queried by a user request** |

**Never embedded.** The graph checks these; they are never inferred from vector proximity:
- assertions and their predicates;
- polarity, modality, conditions, condition kinds, scope, epistemic kind and validation status;
- contraindications;
- numbers, units and thresholds;
- product identity and provenance.

### 4.2 Query decomposition: one shared request frame

The frame is built once and replaces the five duplicate readers. It consolidates three existing pieces:
- N0: object roles, stance, force;
- Phase253: constraints and quantity requirements;
- coverage spans.

```
QueryFrame {
  requested[]:   object span → Category/Product candidate, basis                      (V-object + registry, lexical first)
  owned[]:       object span → Category/Product, as Context                           (never a query term)
  tried[]:       strategy spans the user reports having done                          (V-strategy; excludes or qualifies)
  situations[]:  span, stance (present | absent | negated), locus                      (V-situation)
  goals[]:       span, stance (wanted | not_needed | unwanted), force                 (V-need)
  context[]:     room, climate, household, installation                               (QK axes, use contexts)
  constraints[]: property, bound, unit, role (product requirement | fact about an owned object | usage context)  (QK/PD, lexical)
  exclusions[]:  negated or rejected objects, strategies, properties
  questions[]:   what the user asks
  uninterpreted[]: coverage residue
}
```

- **Each slot is matched only against its own view.** Framing words ("I need", "I'm looking for") belong to no slot span,
  which addresses the framing problem.
- **Negated spans and owned objects are never query vectors.** This addresses the 5-of-6 negation failures and the owned
  TV read as requested.
- **Constraint slots keep the quantity-role fields** that `shape()` drops today (the vertical contract records 29 of 76
  product requirements staying silent).

### 4.3 Separate views over one canonical source

- **Views are derived** from canonical entities and their reviewed surface expressions.
  - They are rebuildable, idempotent, and keyed by model and content hash, as `SemanticIndexG1c` already is.
- **An entity's view entries are rebuilt** from the journal event that creates, merges, splits or supersedes it.
- **The answer trace** records the view version used.

### 4.4 Duplicates, density, unvalidated knowledge, absent knowledge

**Duplicates are resolved at acquisition, not at query time.**
- Near-duplicate expressions (the 220 within-category pairs at ≥ 0.88) become merge *candidates*.
- Review accepts or rejects each merge into one Situation entity that has several expressions.
- Cross-category identity is rare: 2 pairs. A shared situation such as "no sink near the appliance" becomes one entity that
  several categories' strategies address.

**Density.**
- Scores are per **entity**, never per row.
- A category is reached only through assertions (I3), never by counting matched rows, so package size cannot vote.

**Unvalidated documents and assertions.**
- They can be retrieved and shown in traces.
- Only assertions at or above the status a decision requires may authorise a proposal.
- Derived assertions yield "hypothesis" or research.

**Absent knowledge.** Abstention is calibrated **relatively**, never by an absolute cosine. A candidate counts only if:
- it beats a background set of out-of-knowledge probes by a margin; and
- it passes a slot-consistency check: locus and object compatible with the request, stance not negated.

Otherwise the result is a Gap (I9). E4 measures this rule (§7).

### 4.5 Combining vector, structured and lexical retrieval

- **Per slot:** candidates are lexical matches (registry, aliases, QK/PD terms) united with vector matches from the slot's
  view, each exposed separately.
- **No cross-slot score fusion.** G1d measured that RRF did not help.
- **Then** structural verification (§4.4), **then** traversal (§3.5).
- **Ranking** among verified conclusions is by path status, then path length, then evidence. Similarity is never used to
  rank.

### 4.6 Indexing newly acquired knowledge

- **New sources** produce support passages, plus `derived_unreviewed` assertions and entities, through the acquisition
  path (§5.3).
- **Each journal event** triggers an incremental view update for the entities it touches.
- **Requests contribute new surface expressions only after review:**
  - a request span matched to a verified entity becomes a **candidate expression**;
  - it is added only after review, never from the request text alone;
  - this keeps request text, which may be private, out of shared views unless it is reviewed and rights-cleared.

---

## 5. Operational paths in both directions

### 5.1 Need → solutions (the request path)

1. **Frame** (§4.2).
2. **Slot matching** (§4.5): candidate Situations, Needs, Objects and Properties.
3. **Verification:** stance; locus and object consistency; margin over the background; exclusions.
4. **Traversal:**
   - I1: documented remedies;
   - I2: mechanistic remedies, labelled;
   - I3: purchase families via functions, with the contraindication rule;
   - I4: opposites;
   - I8: if a family is named.
5. **Evidence:** I5 gives the properties that assess the needed function. The existing declaration and evidence path
   (Phase249, ra.2, QK comparability) takes over, unchanged.
6. **Answer:**
   - proposals with status and quote;
   - not-suitable statements with support;
   - conditional possibilities with their condition;
   - a question only under I10;
   - a Gap under I9, as a typed research need (`pending_authorization`, existing Phase254);
   - abstention when nothing can be verified.

### 5.2 Category → needs (category-first)

1. **Functions:** category K (named by the user, or under a coverage audit) `provides` Functions.
2. **Needs served:** Functions → strategies (`required_by`) → situations and needs (`addresses`). The result is the needs
   K serves, with condition and status.
3. **Limits:**
   - `contraindicated_for` gives the contexts where K must not be used;
   - `valid_under` gives the applicability domain of its mechanisms.
4. **Deciding properties:** `assessed_by` gives the properties that decide between products of K, and which evidence
   exists for them.

**Uses:**
- answering "is a dehumidifier good for X";
- auditing what a taught category covers;
- planning acquisition for a new category by listing which predicates are missing.

The I3/I6 symmetry makes the owner's §2b bidirectional requirement structural.

### 5.3 The complete cycle, including a never-studied category

| Stage | Existing component reused | What changes in the design |
|---|---|---|
| Source research | Phase254 typed needs; Phase257/272 policies; robots, rights and rate gates; source memory 258/260 | Gaps are typed by the graph (missing entity, or missing predicate for subject X), so a research need says *what kind of statement* is sought. Executing reads stays owner-gated |
| Reading | Phase245/265/269 readers; S98 reading; G1d `sourceRowsG1d` (all cells) | none to the readers; package rows are re-read with all their cells |
| Extraction | declarations; tests; statements; G1d condition/action split | statements and cells become **support passages**, not knowledge |
| Interpretation | QK, PD, S98 role and nature, KR programs | clauses → candidate assertions (predicate, polarity, modality, conditions), mapped onto canonical entities: V-passage proposes, rules check |
| Attribution | exact-key product identity; Fellegi–Sunter undecided states | unchanged; evidence attaches to Product/Variant, never by name |
| Validation | journal; `relation_assessments`; review functions (now uncalled) | one journaled status ladder for assertions and entities; the source's own label is preserved; package teaching is support with role `owner_research_package`, never independent evidence; independence needs evidence, not a source type |
| Storage | hash-chained `events`; projection tables; snapshot procedure | new projection tables (entities, assertions, support, expressions) in a future migration, not now; the existing category tables become projections of assertions |
| Indexing | `SemanticIndexG1c` machinery (model- and hash-keyed, idempotent) | per-type views, updated incrementally from journal events |
| Retrieval | lexical registry and alias matching; QK/PD term matching | per-slot candidates (§4.5) |
| Reasoning | KR Datalog engine with rule lifecycle (S100–S103) | I1–I10 as a governed rule program |
| Evaluation | sealed references; first runs unchanged; experience cases; replays | E1–E7 (§7) |
| Learning | rule lifecycle; experience lessons; relation assessments | (a) reviewed surface expressions from requests; (b) assertions from sources; (c) counterexamples as `counter` links or refutations; (d) rules promoted or retired through the lifecycle; (e) transfer through shared Function, Mechanism and Property entities |

**A never-studied category.**
- **Detection.** The frame finds either a requested object with no Category entity, or a situation whose strategies need a
  function that no taught family provides. Either produces Gaps.
- **Acquisition template.** For a new family K, the graph lists what to establish:
  - which Functions it provides;
  - by which Mechanisms, and under which conditions (`valid_under`);
  - its contraindications;
  - which Properties and Methods assess it.
- **Transfer through shared entities.** A new desiccant appliance inherits, if a source asserts that K works by them:
  - the `desiccant adsorption` mechanism and its `valid_under` domain;
  - the `remove water vapour` function and its `assessed_by` properties.
- **Sources** enter as `derived_unreviewed` under the existing Phase272 path, its policies and the owner's research
  permission.
- The template is a schema of questions, not a package.

### 5.4 Paper verification with traceable reasoning

The traces use spent cases only: the I3 set, the G1c safety probes and the Phase272 pilot. No sealed set was opened.

**Codes in the last column:**
- **K** = whether current sources hold the required knowledge (checked in the G1b rows or the reports);
- **S** = structurally verifiable on paper;
- **X** = needs an experiment;
- **R** = needs independent scientific or expert review.

| Case | Frame (slots) | Required assertions | Inference and outcome | K / verification |
|---|---|---|---|---|
| **R-20** opposite: wants a humidifier for a damp nursery | requested: humidifier; situation: damp (present); locus: nursery | `humidifier conflicts_with Need(reduce indoor damp)`; `Situation(damp) addressed_by Strategy(ventilate / dehumidify)` | I8 keeps the named family, but I4 flags the conflict with its quote, and the documented remedy is offered. Current systems either propose humidifiers or retrieve "humidity" rows of both kinds | K: 25 humidifier rows exist (dehumidifier and purifier packages); the conflict is stated in the dehumidifier package. S: the path is mechanical. R: none |
| **R-40** combination: washing does not dry, plus a musty smell | situations: slow indoor drying; musty smell; context: laundry indoors | `slow drying produced_by high humidity`; `musty smell indicates excess moisture` (defeasible); `Strategy(dehumidify) acts_on excess moisture`; a documented `addressed_by` from the dehumidifier package | I1 for drying and I2 (labelled mechanistic) for the smell join on the shared Cause entity, so **one** strategy serves both situations. G1b/G1c could only score rows separately | K: yes (dehumidifier rows). The 41 "musty/mould" rows, many in unrelated categories, show the density problem. S: the join is structural. X: E2 (identity of "excess moisture") |
| **R-33 / R-46** cooking smell | situation: cooking smell or smoke; context: kitchen | `Situation(smoky kitchen) addressed_by Strategy(ducted extraction)`; `purifier not_substitute_for ducted extraction` | I1 gives extraction: no purchase if a hood exists, otherwise a purchase constraint. I4 makes a purifier an adjunct at most. The G1d R1 defect ("not a substitute" left unread) becomes a predicate, not a regex | K: present (purifier package; 1 extractor row). S. X: acquisition must extract `not_substitute_for` (E1) |
| **R-11** hard water, no taught family | situation: limescale or hard water | `scale deposition produced_by hard water`; `Strategy(descale / softener) acts_on scale deposition` | Only kettle, coffee and dishwasher rows mention limescale, and only as **maintenance of those appliances**. Situation identity (E2) must not merge "my kettle scales" with "my house has hard water". With no `addressed_by` for the household situation, I9 gives a Gap (missing Strategy for the Situation), with no invented category | K: partial (5 rows, appliance-scoped). S. X: E2, E4 (abstention) |
| **R-29** electricity bill | goal: lower running cost; no object | `Need(lower energy cost) addressed_by` behavioural strategies (documented as use guidance in the packages); `assessed_by` energy-consumption properties per family | I1 gives the no-purchase strategies where documented. A purchase family arises only through I3, and only if a source asserts that replacement saves energy under stated conditions; otherwise a Gap | K: 17 rows across 7 families, as use guidance; today a separate concept per category (SC1). S. R: comparative energy claims |
| **R-35** stove left on (safety) | situation: forgotten hob; context: safety | `Strategy(auto shut-off device) acts_on Cause(unattended heat source)`; no source in PEE | I9 gives a Gap. Safety is flagged by existing hazard handling, not by a guessed family | K: none. S |
| **R-57** washer-dryer with constraints | requested: washer-dryer (untaught); constraints: size, capacity | — | I8 keeps the user's choice. For the untaught family, Phase255 `unsupported_category` checks only the stated limits (existing behaviour), and a category-acquisition Gap carries the template (§5.3) | K: none. S |
| **R-10** dog hair (vacuums untaught; robot-cleaner package untranslated under the owner rule) | situation: pet hair on floors | `Situation(pet hair) addressed_by Strategy(regular vacuuming with a pet tool)` would need a source | I9 gives a Gap. The robot-cleaner package stays untranslated (owner rule); the template names what would be needed | K: the package exists but must not be translated. S |
| **R-03** TV sound (soundbars untaught) | owned: TV; situation: poor dialogue intelligibility | `Function(improve speech intelligibility) provided_by soundbar` would come from an untaught package | The owned TV is context, never requested, which fixes the I3 error. If the TV package's audio-setting rows assert it, I1 gives no-purchase strategies (dialogue mode); otherwise a Gap for the purchase path | K: TV package (275 rows) for settings. S. X: E3 (owned-object role) |
| **P-01** negation: "no damp problems, just want cleaner air" | situation damp: **negated**; goal: cleaner air | — | I7 makes damp an exclusion, never a query; only the goal slot queries V-need. V failed this probe because it embedded the raw text | S (frame design). X: E3 measures frame fidelity |
| **P-08** owns an air fryer, asks for a rice cooker | owned: air fryer; requested: rice cooker | — | I8: the requested family is untaught. The 10 "rice" rows are mostly in unrelated families (density noise). The owned object is context, so no air-fryer proposal; a Gap for the rice cooker | S. X: E3 |
| **P-15** opposite stance: *wants* sound (speaker) | goal: louder or richer sound (wanted) | `Need(more sound) ≠ Need(less noise)`: direction is part of Need identity | The Need entity carries its direction, so it is not matched to "quiet" needs. I9 if no family is taught | S. X: E2 (needs with direction) |
| **P-22** cause vs symptom: chemical smell | situation: chemical smell (symptom) | `chemical smell indicates VOC emission` (defeasible); `Strategy(source removal, ventilation) acts_on VOC`; activated-carbon purifiers `assessed_by` gas-phase properties | I2, labelled mechanistic; I1 if the purifier package asserts it. A particle filter is **not** offered for gases when `not_sufficient_for` is present | K: purifier package. R: VOC chemistry beyond the source |
| **P-29** function vs result: purifier for a musty smell | requested: purifier; situation: musty smell | `musty smell indicates excess moisture or mould`; `purifier not_sufficient_for moisture control` | I8 keeps the purifier; I4/I3 state, with the quote, that it does not address the cause; the documented remedy (moisture control) is offered | K: present. S |
| **P-36** generic need: "something quiet" | goal: low noise; no object | `Need(low noise) assessed_by sound_level / noise_experience` | No family can be inferred from a generic need alone. I10 allows a question only if verified alternatives exist; otherwise I9 gives a Gap. This replaces "quiet → invented family" (10 of 19 invented) | S |
| **P-40** burning smell from a plug (safety) | situation: burning smell, electrical | `contraindicated_for` any purchase; safety guidance | Hazard handling comes first, with no purchase proposal. I9 for remedies: "call an electrician" is a safety notice, not PEE advice | S. R: safety wording |
| **Named family + requirement:** "a dehumidifier that works in my cold garage" | requested: dehumidifier; context: low ambient temperature | `Mechanism(refrigerant condensation) valid_under ambient ≥ ~15 °C` (the source's figure); `desiccant adsorption valid_under` a wide range; subtype `provides` | I8 + I3 with `valid_under`: the compressor subtype is a **conditional possibility** (modifiable: heating), or unsuitable (essential) if the garage cannot be heated; the desiccant subtype is proposed. The requirement acts through Mechanism and Context, not keywords | K: dehumidifier package (mechanisms). S. R: the threshold value is the source's |
| **Category-first:** "what is an air purifier good for?" | requested family; no situation | inverse I6 | Functions: capture particles; gas phase only with activated carbon. Then strategies, then situations addressed (pollen, smoke particles). Then contraindicated or not-sufficient uses: CO2, moisture, and cooking fumes as a substitute for extraction. Then properties (CADR, noise at CADR) | K: present. S |
| **New family (Phase272 pilot):** tumble dryers, spent material | requested: tumble dryer, registered only through teaching | template (§5.3) | Functions: remove water from textiles. Mechanisms: vented, condenser, heat pump, each with `valid_under` (installation: venting); the `condensation` mechanism is shared with dehumidifiers. Properties from QK (energy, drying time). The pilot's extraction failure (1/27) is a reading problem and is unchanged | K: method pages already read under the Phase272 policy. X: E7 |

**What the paper traces establish (19 cases).**
1. **Representable.** Every case can be expressed with the entity types and predicates of §3; none needed a
   category-specific rule.
2. **Absence is explicit.** Every out-of-knowledge case ends in a typed Gap, never in a nearest category.
3. **Requests are read before similarity.** Negation, owned objects and named families are handled by the frame and I7/I8
   before any similarity is computed.
4. **Opposites and limits are predicates.** Opposites, substitutes and contraindications are expressed by
   `conflicts_with`, `not_substitute_for` and `contraindicated_for` with a condition kind, not by regex cues.

**What the paper cannot establish.**
- **(X) Acquisition:** whether sources can yield these assertions faithfully, and at what precision and recall (E1, E5).
- **(X) Identity:** whether annotators agree on situation and need identity (E2).
- **(X) Frame:** whether the frame reads real requests correctly (E3).
- **(X) Retrieval:** whether per-view retrieval with relative abstention separates in-knowledge from out-of-knowledge
  requests (E4).
- **(R) Scientific truth:** whether specific causal and mechanistic assertions are right (thresholds, VOC chemistry,
  energy savings).
  - Claude review is not independent.
  - These assertions stay `documented_guidance`, with the source's label, until an independent reviewer or independent
    evidence supports them.

---

## 6. Alternatives compared, reuse, costs, risks and dependencies

### 6.1 Alternatives

| | Alternative | What it means | Evidence for or against |
|---|---|---|---|
| A | **Category-centric (status quo)** | keep the category as the key; add concepts and relations per category | against: SC1. It cannot represent cross-category needs, no-purchase remedies or never-taught families, as shown in N1, I3 and G1 |
| B | **Row or document retrieval (the G1b–G1d line)** | retrieve package rows, sentences or documents and select among them | against: 51/70 wrong links; P@5 ≤ 0.17; fused < vector; 5/6 negation probes failed; no abstention. It improves recall, not correctness, and every further step adds heuristics, which the owner's G1d stop rule rejects |
| **C** | **Typed graph with reified assertions and per-type views (recommended)** | §3–§5 | for: covers every paper trace; reuses most components; puts the uncertainty where it can be measured (acquisition fidelity, identity agreement, frame fidelity). Against: needs review effort, and acquisition must reach useful precision (E1, E5) |
| D | **Import an external ontology wholesale** | adopt a large upper or domain ontology | against: no ontology covers consumer situations and remedies; heavy dependency; conflicts with English-first and no paid services. **Use partially instead:** align with W3C PROV (provenance), I-ADOPT (property decomposition, already in PD), SOSA/SSN (observations, already close to the evidence rows) and QUDT (already in QK) |
| E | **LLM reasoning over retrieved text** | let a model infer remedies and contraindications | excluded: an extra AI service; not traceable; the owner suspended Qwen; contradicts "never invent a meaning" |

### 6.2 Costs (Claude only, no paid services, no heavy dependency)

**Schema.**
- One future store migration (v15), not authorised now. FA-I1 needs no schema change.
- New projection tables: `entities`, `assertions`, `assertion_support`, `entity_expressions`, `gaps`.
- New event types in the existing journal.

**Code: mostly consolidation, not addition.**
- The frame consolidates N0, Phase253 constraints and coverage, and retires the duplicate readers.
- Acquisition reuses the G1d source rows and splitters.
- Views reuse the G1c index.
- Reasoning reuses the KR engine.

**Review: the dominant cost.**
- Order of magnitude for the six taught categories, from the census:
  - ~600–700 situations after collapsing near-duplicates;
  - tens of strategies, functions and mechanisms;
  - roughly 1,000–2,000 candidate assertions.
- Structural review by Claude is feasible. It is labelled as Claude review, not as independent.
- Independent review can come only from the owner or later authorised experts. Without it, the highest reachable status
  is `source_verified`.

**Embeddings.** The same small model, local and on CPU. The views are smaller than today's 7,094 units.

### 6.3 Reuse

| Existing part | Role in the design |
|---|---|
| Journal, `events`, snapshot procedure, rights and robots gates, publication check | unchanged; they persist and govern entities and assertions |
| `sources`, `revisions`, statement `source_sha256`+line, N1/G1d cell hashes | support passages |
| QK (kinds, units, axes, phenomena, aspects, use contexts) | seeds for Property, Context, Cause and Need; its category-bound parts become scoped assertions |
| PD (properties, dimensions, I-ADOPT basis) | Property entities; its `outcomes` strings become `assessed_by` assertions |
| `functions.v1.json` | Function and component seeds |
| `category_items`, `category_relations`, `relation_assessments` | migrated as candidate entities and assertions; `measured_by` + sufficiency becomes `assessed_by` with `establishes` / `informs` |
| `knowledge_statements` (6,118) | candidate assertions with support; their polarity, hedge and type are proposals |
| N0 type axes (content kind, stance, force, roles) | QueryFrame slot types |
| Phase253 constraints, quantity requirements, coverage | QueryFrame constraint slots, keeping the role fields |
| N1 row-claim structure; G1d `sourceRowsG1d`, condition/action split, `RelationG1d` fields | acquisition of assertions from tables |
| G1c `SemanticIndexG1c` | view machinery |
| G1d three-stage split (retrieve, verify, select) and the owner contraindication rule | the verification and selection stages, now over assertions |
| KR Datalog engine and rule lifecycle | I1–I10 as a governed program |
| Phase254 typed research needs; Phase272 unknown-category path | Gaps, and acquisition of new families |
| Sealed-reference and first-run discipline; experience cases | evaluation |

**Retired: dead ends already demonstrated.**
- Stem/idf overlap scoring (C, G1b M1–M3, G1c A).
- PPMI.
- Lexical strategy linking.
- NB role and link models.
- Header-cue vocabulary treated as general.
- RRF fusion.
- Absolute cosine gates used as decisions.
- Regex cues for category applicability.
- Strategy identity by suffix.

### 6.4 Risks and dependencies

- **R1 — Acquisition fidelity is the critical risk.** If assertions cannot be derived at useful precision (R1 reached
  0.77/0.54 for one predicate), the graph fills slowly.
  - Mitigations: assertions enter as `derived_unreviewed` and gate nothing; Claude structurally reviews a bounded sample;
    stop rules apply (§8).
- **R2 — Identity disagreement.** Situations and needs may not canonicalise reliably. E2 measures this before anything
  depends on it.
- **R3 — Review is not independent.** Statuses above `structurally_reviewed` need the owner or authorised experts. Without
  them, conclusions stay labelled "documented guidance" or "hypothesis": honest, but weaker answers.
- **R4 — Migration risk.** The live store (v10 now) must not be migrated without authorisation. All experiments run on
  copies under `~/.cache-*`.
- **R5 — Over-structuring.** A rich schema could encode false precision.
  - Mitigations: every field may be `unknown`; the predicate set is closed and small; representability is measured (E1)
    before the schema is fixed.
- **R6 — Rights.** Support passages from third-party pages keep the existing retention rules: hashes in public, text only
  where the policy permits. Owner packages stay private.

**Dependencies:**
- owner authorisation for each increment;
- the existing research permissions, unchanged, for any new source;
- no new service or model.

---

## 7. Experiments needed to verify the design

Each experiment states what it verifies, its material, its measure and its gate. **The sealed G1/G1b sets are used only
after the development gates pass** (owner rule).

| # | Experiment | Verifies | Material | Measure | Gate (admit / stop) |
|---|---|---|---|---|---|
| E0 | Paper traces (done, §5.4) | coverage of the model on representative cases | spent | cases representable without a category rule | 19/19, met |
| E1 | **Representability round-trip** | existing knowledge fits the model without loss | stratified sample: 60 package rows (6 categories, all cells), 20 store concepts with their relations, 10 QK aspects and phenomena, 10 PD properties | share of asserting clauses representable as assertions with faithful polarity, modality and conditions; list of the clauses that cannot be represented | admit ≥ 90% representable; stop < 75% (revise §3) |
| E2 | **Identity agreement** | situations, needs and strategies canonicalise consistently | the 220 + 2 near-duplicate pairs plus 80 random pairs; two blind annotations, adjudicated | agreement (κ) on same / different / specialises | admit κ ≥ 0.7; stop < 0.5 |
| E3 | **Query-frame fidelity** | the shared frame reads roles, stance, slots and constraint roles | spent I3, N1 and R3-P requests with their existing references (baseline: roles 7/18), plus the 42 probes | slot accuracy per type; negation and owned-object errors | admit: roles ≥ 15/18 and 0 negation or owned-object errors on the probes; stop: no gain over N0 |
| E4 | **Per-view retrieval with relative abstention** | slot-wise views separate in-knowledge from out-of-knowledge requests | spent I3 set and probes; out-of-knowledge probes from the spent untaught-family requests | entity recall@10 per slot; abstention precision and recall | admit: recall ≥ L1 vector (0.85) and ≥ 80% of out-of-knowledge requests correctly abstained; stop: no separation |
| E5 | **Assertion acquisition** | sources yield assertions faithfully | the spent sealed reference R (100 rows) for `addressed_by`; a new blind reference only for new predicates | precision and recall per predicate | admit: precision ≥ 0.8 and recall above R0 (owner G1d gate); stop: still below R1 after one revision |
| E6 | **Traversal over reviewed assertions** | I1–I10 give the right outcome when the knowledge is right | the E1 sample after structural review; the paper-trace cases | outcome correctness per case; invented proposals; contraindication and negation probes | admit: contraindication 6/6, negation 6/6, invented ≤ C1 (18) with reached ≥ C1 (9); then one first run on sealed G1, then G1b |
| E7 | **New-family acquisition dry run** | transfer through shared entities for a never-studied family | the spent Phase272 tumble-dryer material (already read); no new requests | template slots filled from sources; shared entities reused | descriptive; admits nothing by itself |

**What can be verified, and how:**
- **structurally**, on paper or by code inspection: E0 and parts of E1;
- **only by experiment:** E1–E7;
- **only by independent scientific or expert review:** the truth of specific causal, mechanistic and threshold
  assertions, and comparative effectiveness claims.

---

## 8. Incremental plan with admission and stop conditions

**Rules for every increment:**
- It answers the three questions of SKILL.md §2c: where it sits, which knowledge it uses or changes, how it contributes to
  general learning.
- Nothing touches the operational path before FA-I5.
- The live store is not migrated before FA-I4.

| Increment | Where in the architecture | Knowledge used or changed | Contribution to learning | Admission | Stop |
|---|---|---|---|---|---|
| **FA-I1 Representability** (E1) | knowledge model (§3), offline | reads packages, a store copy, QK and PD; writes only private evaluation files | fixes the schema on evidence; lists what PEE knows but cannot express | owner authorisation of this report | < 75% representable → revise §3; no further increment |
| **FA-I2 Canonical identity** (E2) + entity census | entities (§3.2), offline on a store copy | situation, need and strategy entities for the 6 taught categories, `derived_unreviewed` | one identity per concept, the precondition for transfer and density control | FA-I1 ≥ 90% | κ < 0.5 |
| **FA-I3 Shared query frame** (E3) | request side (§4.2), shadow | replaces the duplicate readers in shadow; changes no knowledge | request understanding becomes a reusable, measurable structure | FA-I2 passed | no gain over N0 on roles and negation |
| **FA-I4 Assertions and acquisition** (E5) + store migration on a copy | assertions (§3.3–3.4), acquisition (§5.3) | candidate assertions from packages, statements and relations, with support | scientific knowledge becomes assertion-level, reviewable and cumulative | FA-I3 passed; owner authorisation of the migration design | precision still below R1's after one revision |
| **FA-I5 Views and traversal** (E4, E6) | views (§4), reasoning (§3.5), shadow on the request path | reviewed assertions; views rebuilt from entities | need-first and category-first answers from one knowledge; Gaps typed for research | FA-I4 passed | E6 development gates unmet → no sealed first run |
| **FA-I6 Sealed validation and new family** (E6 first run on G1, then G1b; E7) | the whole cycle | none new | measures generalisation honestly; shows transfer | FA-I5 development gates met | first run committed unchanged, whatever the result |
| Later (separate owner decisions) | closing the cycle joints of SC11 (research execution, shadow readers → store, test rows → catalog); live-store migration; operational promotion | — | — | — | — |

---

## 9. Motivated proposal

**Proposal: authorise FA-I1 (the representability round-trip) only.**
- Offline, read-only, on store copies.
- No code on the request path, no migration, no sealed set, no new sources.
- Private outputs in the evaluation directory; counts in public.

**Why this step first:**
- Every failure since G1b was an attempt to retrieve or select knowledge that the structure could not represent.
- FA-I1 is the cheapest test of whether the recommended structure can represent what PEE already knows, and of what it
  loses.
- Its stop rule prevents building identity, views or reasoning on a schema that does not fit.
- It changes nothing operational, and its result decides the rest of the plan.

I wait for the owner's authorisation before developing anything in this report.
