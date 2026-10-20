# After S103: dependencies of the need-understanding pilot and of a shared negation mechanism

Owner review of S103 (verbatim in `.claude/skills/pee-guided-learning/references/owner-review-s103-2026-10-20.md`) and the
owner's brainstorming memo of 2026-10-20 (private repository `owner-documents/`, §5 and §14). The owner said: "Non preparerei
ancora un ulteriore prompt senza esaminare prima le dipendenze di questo esperimento."

This is a **read-only dependency study**:
- no code, rule, resource or store was changed;
- every behaviour cited was read in the code at commit `09c78cd`, or run on a copy of the live store, which was not written.

Roadmap: R3 stays open. Where the pilot sits on the roadmap needs an owner decision (§6).

## 1. What the current system does with the owner's examples (run on a store copy, 2026-10-20)

| Request | Today's answer |
|---|---|
| "I need an air purifier for my bedroom. I'm a light sleeper." | category air_purifiers; **no need**, no unassessed objective; one generic goal question. "bedroom" and "light sleeper" are dropped **without a trace** |
| "I need an air purifier, the fan noise when sleeping bothers me." | need `quiet_night_operation`, stated as unassessed; the goal names the measurement `cadr_noise_power_curve` (same-mode pairing) and rejects the proxies "noise dB" and "max-mode CADR" |
| "I want an air purifier with a sleep mode." | no need, no feature; nothing says why |
| An air-fryer request with the S103 q01 wording "nothing over N litres" | **positive shortlist with a strict minimum of N litres applied**: the opposite of the request, on a category with products in the store (the figure is omitted here because it equals a retained product declaration) |

The fourth line is the most urgent finding. The S103 harmful error is not only a scoring row; it reaches a shortlist.

The first three lines show that the knowledge needed for the bedroom example exists and is correct once a need is
recognised. **The bottleneck is recognising the need, not the science behind it.**

## 2. Priority 1: one mechanism for negation, scope and contrast

### What exists

A census of `src/` and `resources/`, read for this study, found:
- **request path:**
  - five negation readers (`phase248` lines 79–98, 156, 285, 310, 345; `phase253_request_constraints` lines 55–56 and 105; `quantityBound`, which only reads "no/not X-er than");
  - one clause splitter (`request_coverage80`);
  - the Phase125 budget reader;
- **document path:**
  - seven clause splitters;
  - six negation readers (`document_evidence`, `product_facts`, `phase225`, `phase269`, `phase272`, `knowledge_translation`);
  - **no negation at all** in `observation_semantics` (`clauseCues`, the rules OS17–19, OS57–61, OS70–71) or in `table_interpreter1g` (`blockKind`, the table-context cue ladder);
- **vocabularies:** at least four different negator lists. The QK pack's `evaluation.negators` is used on the document side only.

How "nothing over 6L" becomes a minimum:
1. `quantityBound` finds "over" (a minimum word).
2. "nothing" is in no negator list, and the request negation only demotes a limit to a candidate. It never flips the side.
3. The limit is applied as `capacity_min` 6, strict.

The table introduction ("real everyday use numbers, and not what manufacturers claim") fails the same way:
1. `DECLARATION_CUE272` matches "claim", with no negation check.
2. The table-context level gets two classes and is skipped.
3. The linked statements then disagree, and OS57–61 and OS70–71 conflict.

### What a shared mechanism needs

The function would be `scope(text, span) → {clause, polarity, negator, contrast relation to neighbouring clauses}`:
- one clause model, with per-reader parameters where readers truly differ;
- one negator vocabulary in the QK pack's language section.

It would serve:
- the request readers listed above, **including flipping the side of a bound** ("nothing over 6L", "not more than", "nothing bigger than");
- the cue readers of observation semantics and of the 1G table context: a negated cue is evidence *against* its class, so "not what manufacturers claim" denies the declaration;
- the contrast cases already handled by local code ("claimed X, but we measured Y" in Phase225; "could buy X, but" in Phase248).

The rule programs need a polarity input. Today cues are positive facts only.

Further dependencies:
- **Tests to update.** About 15 test files assert today's behaviour. They are listed in the census and include s80, phase248, phase250, phase252, s102, s103, quantity_knowledge, phase253, s85, document_evidence, product_facts, phase225, s83, s86c, s100, s99 and phase269.
- **Validation material.** There is **no negation gold**. The S103 requests are now spent: q01, q09, q21 and q31 contain negated bounds. A held-out set must be written and annotated blind before the change, covering:
  - requests: negated bounds, negated needs, indifference, contrast;
  - document sentences: negated declaration and measurement cues, "claimed … but measured".

  The first run must be committed unchanged. The S103 protocol can be reused as is.
- **Interaction with priority 2.** Inferred needs would turn harmful without polarity: "I don't care about noise" must not produce a noise need. Negation must therefore come first, or in the same step.

## 3. Priority 2: the need-understanding pilot (arms A/B/C of the memo, §5)

### 3.1 What the request path already uses

**Consulted today:**
- store concept aliases, matched as loose phrases, plus an IDF paraphrase match (`phase248` lines 57–118, 332–347);
- `category_relations` (`measured_by` into the research plan);
- `needKnowledge269` (`measured_by`, `not_sufficient_for`, `requires_condition`, plus `relation_assessments`);
- QK `evidenceNeed`;
- QK `aspects`, read only when the aspect word sits next to the product name.

**Present but never consulted for requests:**

| Knowledge | Note |
|---|---|
| QK `useContexts.night_bedroom` | its terms include **"bedroom" and "light sleeper"**; read only by `qualitative_needs.ts`, which only a test and a script call |
| QK `facets` (tonal character, transient events) and `phenomena` | |
| QK `pack.relations` | e.g. `room_area_from_cadr` |
| 6,118 `knowledge_statements` | 436 `measured_by`, 311 `not_sufficient_for`, 580 `requires`; 45 air-purifier statements mention sleep, bedroom or noise. Their only consumer is `teachingCaveatsShadow`, which is for evaluation only |
| `category_relations` of kinds `enables`, `may_risk`, `may_support` | |
| property definitions linking `noise_experience` to `quiet_night_operation` | |

The air-purifier aliases are narrow and written in code: `quiet_night_operation` has three aliases, set in
`phase271_category_teaching.ts:52`.

### 3.2 Dependencies, in order

| # | Dependency | State | Why the pilot needs it |
|---|---|---|---|
| N1 | Polarity and scope (§2) | missing | arm B would otherwise create needs from negated or indifferent wording |
| N2 | **No silent loss** of request content | violated: `request_coverage80` drops short clauses ("for my bedroom") and sentences with no recognised word ("I'm a light sleeper") | principle 8; without it neither arm can show what it ignored. Extends D31/RQC |
| N3 | **Use contexts linked to goals** | missing: `night_bedroom` has no relation to `quiet_night_operation` or to any measurement | the knowledge path for arm B; it must be a relation in the knowledge, not an alias added in code |
| N4 | A switch for knowledge on the request path | missing: no option turns store concepts, relations or QK contexts off; `aspectObjectives253` always loads QK | the A/B comparison must be one build with a switch, not two builds |
| N5 | Separate outputs for expressed needs, inferred needs, scenarios and questions | partial: `Advice253.needs` mixes them; noise gets no question; an aspect-only objective gets no goal outcome | the memo's metrics (correct, missed or invented needs) cannot be scored otherwise |
| N6 | A feature is not evidence | represented in knowledge (sleep mode is a fan setting, a condition; proxies via `not_sufficient_for`), absent from the request path | "sleep mode" should produce an evidence need ("noise at the sleep setting, with CADR at the same setting"), not a feature check |
| N7 | Inferred needs never exclude a product | **holds**: only stated numeric criteria become hard; there is no noise criterion | keep it as a test; arm B must not change it |
| N8 | Evidence plan from the request | partial: the journey plan and QK `need_evidence` reach `researchPlan`; `researchNeedsFromAdvice254` is not called on the request path and ignores goal measures and conditions | needed to measure the memo's "consequences for the research plan" |
| N9 | Validated knowledge | **none validated**: every taught item is `proposed_unverified` / `assistant_authored_unreviewed`; relation assessments are same-model | arm B runs on unvalidated knowledge; every report must say so, and no answer may treat it as established |
| N10 | Evaluation material | **missing**: no existing set scores inferred needs, invented preferences, scenarios or feature-vs-evidence. The closest is `evaluation/phase269/teaching-eval-set.json` (spent) | a new sealed set (§4) |
| N11 | Arm C: governed rule proposals made by PEE | missing: PEE has no mechanism that proposes a rule or relation; that is roadmap R5 | see §5 |

### 3.3 Category coverage for the three proposed categories

| Category | Knowledge in the store | Package | Fit for the pilot |
|---|---|---|---|
| Air purifiers | 37 items (18 measurements), 40 relations, 848 statements; noise–CADR–power curve, same-mode pairing, rejected proxies | 04 v1.2.0, received and inventoried | **good** |
| Coffee machines | 27 items, 14 relations, 747 statements; grinders: 6 items, 0 relations | received, partly taught; "traditional Italian espresso" still not recognised (Phase269) | **partial**: a real test of knowledge use |
| Washing machines / washer-dryers | **nothing**: no package, no category id, no store items | **not received** | needs the owner's package, or another category |

Better-covered alternatives to washing machines: dishwashers (38 items, 45 relations) and televisions (41 items,
47 relations). For transfer, tumble dryers are an unfamiliar category: no package, 18 items learned in the Phase272 pilot.

## 4. Evaluation design the dependencies impose

**Request set.** New requests in natural wording, including the memo's examples:
- light sleeper;
- stains;
- "espresso like an Italian bar";
- corners;
- "no drilling or wetting the cabinet";
- negations, indifference, scenarios.

Authors:
- an independent Claude agent (T1, as in S103), or a real-user source;
- real-user requests are better. Phase251 used CC BY-SA real requests, so that protocol is reusable, subject to its licence.

**Reference.** Written blind, before any run. Per request:
- expressed needs and limits;
- defensible inferred needs, each with the property, measurement or condition that would assess it;
- preferences the request does **not** express (a list of inventions to penalise);
- scenarios;
- the questions a careful adviser would ask;
- features that must not count as evidence.

**Metrics:**
- needs correct, missed and invented;
- expressed limits kept;
- function vs result;
- negation, scenario and preference handling;
- appropriate questions;
- consequences on the research plan;
- **improper exclusions (must stay 0)**;
- per-category and worst-category results;
- one held-out category for transfer.

**Arms:**
- A: the current build;
- B: the same build with the knowledge switch on;
- C: see §5.

Ranking gates stay unchanged and B runs in shadow first, as the memo asks.

## 5. Arm C: what is realistic now

PEE cannot propose rules today (R5). Two honest options:
- **C-lite (feasible in the pilot):** PEE derives *candidate* links from knowledge it already holds, for example a use context or a statement term as a candidate alias for an outcome. Each is admitted as `experimental` under the S103 admission (shadow only, never deciding), and the pilot measures what would change if they were admitted. This tests whether knowledge can *suggest* improvements, without letting it change rules unchecked.
- **Full C:** learned rules or relations promoted after held-out validation. That is R5 and should not be part of this pilot.

## 6. Decisions only the owner can take

1. **Order:** negation first, then the pilot; or both in one step with separate measurements. Dependency N1 argues for negation first.
2. **Roadmap placement.** R3-C forbids feature expansion. The pilot is new use of existing knowledge on the request path; it can count as R3 ("knowledge consulted in reading", extended to reading requests) by owner decision, or open a step of its own.
   - The brainstorming's R4 (linking across documents and sources) differs from the repository's R4 (linking within a whole document); R5–R7 match.
3. **Washing machines:** send the package, or use dishwashers or televisions in its place.
4. **Request authors:** Claude-authored only (T1), or also real-user requests under the Phase251 protocol.
5. **Arm C scope:** C-lite now, full C under R5.

## 7. Other points of the review

- **Admission checks are structural** (owner point 1). Agreed: `checkAdmission` verifies that the fields are present and well formed, not that they are true.
  - Proposal: an independent review becomes an evidence type in the admission record (`evidence.review`). An unreviewed rule stays `legacyUnreviewed` or `experimental`.
  - The 86 legacy os.4 rules are reviewed in order of how many decisions they take on the development material.
- **Extraction quality** (owner point 2). In the S103 tables, 28 of 61 items had no property definition, and 20 of 26 reference values were not stored. The pilot does not address this. It stays a separate obstacle on the document side.
- **The 152 stale revisions** (owner point 3). Proposed plan:
  - re-fetch in priority of what reaches a user's answer first: products that appear in shortlists, then categories in the regression requests;
  - stay within the standing policy budget (about 1,200 requests left) and honour robots and rights;
  - each re-derivation records old vs new;
  - revisions whose host now refuses access are marked, never bypassed.
  
  This needs no code change and can run alongside.

## Sources read for this study

- Owner review of S103 and the brainstorming memo 2026-10-20 (§0–15); strategic memo 2026-10-17 §4, §9, §13, §15.
- Roadmap §3: R3-C to R7.
- Code at `09c78cd`:
  - `phase253_request_advice.ts`, `phase248_advisory_journey.ts`, `request_coverage80.ts`, `phase253_request_constraints.ts`;
  - `quantity_knowledge.ts`, `observation_semantics.ts`, `table_interpreter1g.ts`, `phase272_extraction_plan.ts`;
  - `knowledge_link.ts`, `qualitative_needs.ts`, `phase254_research_needs.ts`, `phase271_category_teaching.ts`.
- Resources: `quantity-knowledge.v3.json`, `functions.v1.json`, `property-definitions.v1.json`, `request-semantics.v1.json`, `observation-semantics.v1.json`.
- Live store, read only: tables `category_items`, `category_relations`, `knowledge_statements`, `relation_assessments`.
- Private research packages and inventories in pee-knowledge.
