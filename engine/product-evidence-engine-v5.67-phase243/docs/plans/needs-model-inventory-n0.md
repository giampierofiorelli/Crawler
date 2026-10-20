<!-- Header added by the main session -->
**Read-only inventory (N0 preparation), 2026-10-20.**
- **Authorisation:** the owner asked that safe work be done before the scheduled R3-P resumption. Their review of NR names inventorying equivalences and incompatibilities as the first part of N0 (`owner-review-nr-2026-10-20.md`).
- **What it is not:** this is not N0 development. No consolidation is authorised or proposed for implementation here.
- **How it was produced:** an independent Claude agent wrote it from `src/`, `tests/`, `resources/` and phase reports only. It read no evaluation material and modified no file.
- **Verification:** the main session spot-checked two claims, both confirmed:
  - Phase125 is on the request path: imported by `phase248_advisory_journey.ts:14` and `phase253_request_constraints.ts:16`.
  - The answer contract has no excluded-feature slot: `phase253_advice_contract.ts` has product `excluded` only.
- **Status of the rest:** other claims carry `file:line` evidence but are not independently re-verified.

---

# N0 — Need-representation inventory: equivalences and incompatibilities

Read-only inventory. No consolidation and no code proposal beyond a mapping.

- **Scope:** engine `engine/product-evidence-engine-v5.67-phase243`, at HEAD 809b4da (2026-10-20).
- **Paths:** all `file:line` references are relative to `src/` unless they say otherwise.
- **Behaviour checks:** marked **[run]**. They ran the existing `dist/` build (newer than `src/` for the modules involved) through `node -e`. Nothing was written.
- **Not read:** `evaluation/r3p/`, private-eval and the knowledge store were not read.

---

## 0. Module census, reachability, tests, stated maturity

### How reachability was computed

- A script (scratchpad `reach.mjs`) parsed every `import … from './x.js'` and `import('./x.js')` in `src/`.
- It separates **runtime** edges from **type-only** edges.
  - A type-only edge is `import type`, or an import whose members all carry `type`.
- **Two roots:**
  - `phase253_request_advice.ts` is the request path. Its runtime closure holds 76 modules.
  - `index.ts` is the public library export. Its runtime closure holds 62 modules.
- `index.ts` does **not** export the Phase253 path.
- `phase253_request_advice.ts` is reached from `scripts/*.mjs` (for example `scripts/phase253-advice-arms.mjs` and `scripts/s83-advice-regression.mjs`) and from `system_integrity80.ts`.

### Census

| Module | Runtime-reachable from request path (`phase253_request_advice`)? | From `index.ts`? | Importers (src) | Tests (`tests/*.test.ts`) | Stated maturity (header) |
|---|---|---|---|---|---|
| `needs_discovery.ts` | **No** | No | contextual_functional_suitability, decision_robustness, lab_needs_bridge, needs_demo_pipeline | needs_discovery, contextual_functional_suitability, lab_needs_bridge, lab_uncertainty, needs_demo_pipeline (+ robustness_fixtures.ts) | "Phase 56: research-informed NEEDS DISCOVERY PROTOTYPE" (needs_discovery.ts:2) |
| `contextual_functional_suitability.ts` | No | No | decision_robustness, phase97_noncompensatory_qualitative_gate | contextual_functional_suitability, phase97_noncompensatory_qualitative_gate | "RESEARCH ONLY … NOT a calibrated decision model" (:2, :8) |
| `lab_needs_bridge.ts` | No | No | contextual_functional_suitability, evidence_appraisal, evidence_lineage, lab_uncertainty | lab_needs_bridge, contextual_functional_suitability, evidence_appraisal, evidence_lineage, lab_uncertainty | "research-only bridge from CONFIRMED needs" (:1) |
| `phase98_tradeoff_value_model.ts` (added: hard requirement) | No (type-only via 100) | No | phase99, phase100 (type) | phase98_tradeoff_value_model, phase99_qualitative_tradeoff_bridge, phase100_adaptive_preference_envelope | "research-only compensatory preference model with explicit hard vetoes" (:2) |
| `phase100_adaptive_preference_envelope.ts` | Type-only (via phase246 → phase128 → 127 → 126) | Type-only | phase107, phase126 (type) | phase100_adaptive_preference_envelope | purpose `'phase100_bounded_adaptive_preference_research_only'` (:38) |
| `phase126_conversational_clarification_policy.ts` | Type-only | **Runtime** (index → 164 → 127 → 126) | phase127 | phase126_conversational_clarification_policy | "locally owned, evidence-bound mixed-initiative clarification controller" (:1); no maturity word |
| `phase127_stateful_clarification.ts` | Type-only (phase128:11 `import type`) | **Runtime** (index → 164 → 127) | phase128 (type), phase164 | phase127_stateful_clarification, phase128_category_cognition_dialogue_bridge | "bounded research prototype" (:1) |
| `phase125_compositional_dialogue_frame.ts` | **Runtime** (253 → 248 → 125; also 253_request_constraints:16) | Runtime | 126, 127, 128, 129, 164, 165, 248, 253_request_constraints | phase125_compositional_dialogue_frame, 126, 127, 165, phase250_need_understanding, phase251_category_and_requests | "conservative scoped recognizer, NOT open-domain language understanding" (:4) |
| `phase164_user_request_journey.ts` | Type-only (via 173 adapter) | **Runtime** | index, 166–170, 172, 173 | phase164_user_request_journey, 165–172 tests | "All outputs are hypotheses/research actions" (:5) |
| `phase165_request_context_audit.ts` (added: meaning of modifiers) | Type-only | **Runtime** | index, 164 | phase165_request_context_audit | "source-anchored, fail-closed user-request context audit" (:1) |
| `phase116_category_function_model.ts` | **Runtime** (253 → 247 → 116) | Runtime (via 128) | 116_stain, 117, 128, 247 | phase116_category_function_model, phase117_goal_outcome_comparison | "Research-only companion: NO inferred performance …" (:3) |
| `phase117_goal_outcome_comparison.ts` | No | No | (none) | phase117_goal_outcome_comparison | "Research adapter, NOT the public recommendation path" (:2) |
| `phase247_category_relations.ts` | **Runtime** (direct, :24) | No | knowledge_link, need_interpretation, 247_seeds, 248, 252, 253_request_advice, 272_* | phase247_category_relations, phase270_ranking_authorisation, s80_decision_safety, s81_knowledge_reasoning, vertical_path_fitness | operational store layer (header :1–10, "Nothing here ranks products") |
| `phase168_qualitative_need_research_bridge.ts` | No | **Runtime** (index:53) | index, phase169 | phase168_qualitative_need_research_bridge | "NEVER connects to production rankers, automatic exclusions" (:4) |
| `phase96_qualitative_review_evidence.ts` (QualitativeNeed) | Type-only | Runtime (via 168) | 97, 99, 168, 169 | phase96_*, phase97_*, phase99_*, phase100_*, phase168_*, phase169_* | "Research/quarantine only, not a public ranker" (:3) |
| `phase97_noncompensatory_qualitative_gate.ts` (added: importance mapping) | No | No | — | phase97_noncompensatory_qualitative_gate | "RESEARCH ONLY" (:2) |
| `qualitative_needs.ts` | **No** | No | (none in src) | document_evidence | "QE (2026-10-18) … Shadow only" (:2) |
| `phase172_goal_suitability_guide.ts` | Type-only (253 → 246 → 245 → … → 175 → 174 → 173 → 172; all type-only at phase245:21/241:9/228:12) | No | 172_domain_protocol_registry, 173_goal_scope_adapter | phase172_goal_suitability_guide, phase172_domain_and_adversarial | "Curated usage rules are RESEARCH HYPOTHESES" (:2) |
| `phase173_goal_scope_adapter.ts` | Type-only (same chain) | No | 173_need_mechanism_graph, 174 | phase173_scope_and_graph, phase174_category_transfer | "It must NEVER authorize vetoes or rank changes" (:4) |
| `phase173_need_mechanism_graph.ts` | No | No | (none) | phase173_scope_and_graph | "controlled, research-only knowledge graph proposals" (:1) |
| `phase113_local_intent_interpreter.ts` (added: strength) | No | No | (none) | — | "RESEARCH PATH ONLY" (:3) |
| `phase190_robust_preference_audit.ts` (added: mandatory threshold) | No | No | (none) | — | "RESEARCH ONLY" (:1) |
| `phase253_request_constraints.ts` | **Runtime** (:21) | No | 253_request_advice | phase253_advice, s103_request_semantics, r3p_language_scope, s85, s86, s102, s103_rule_admission, quantity_knowledge, phase266 | operational (S103 / R3-P) |
| `phase253_advice_contract.ts` | Type-only (types only) | No | need_interpretation, 253_*, 254 | phase253_advice, vertical_path_fitness | operational contract |
| `need_interpretation.ts` | **Runtime** (:13); called only when `opts.needInterpretation` is set (phase253_request_advice.ts:333–346) | No | 253_request_advice, 253_advice_contract (type) | r3p_need_interpretation (through `adviseFromRequest253`) | "R3-P stage 2 … experimental … never becomes a constraint" (:1, :15–17) |
| `language_scope.ts` | **Runtime** (:14) | No | need_interpretation, observation_semantics, 248, 253_*, quantity_knowledge, table_interpreter1g | r3p_language_scope | "R3-P stage 1 … one typed mechanism" (:1–4) |
| `phase248_advisory_journey.ts` | **Runtime** (:18) | No | 248_registry, 248_safety, 250, 252, 253_request_advice | phase248_advisory_journey, 250, 251, 252, 253, 266, 269, s86 | operational journey (:1–8) |

### Notes on reachability

- **Phase125 on the path is used only for budget and hazards.**
  - phase248 calls `composeQuestion125(text, schemas)` with `aspects:[]` (phase248_advisory_journey.ts:396).
  - phase253_request_constraints calls it with `aspects:[]` (phase253_request_constraints.ts:152).
  - So no `AspectFinding125` / `Modifier125` role is ever produced on the request path.
- **Phase116 on the path is loaded through phase247 only.**
  - The request path uses only the shared relation kinds through `relations247`.
  - `compileTo116` (phase247_category_relations.ts:145) has **no caller** in `src/`; a grep over `src` found none outside phase247.
- **Type-only reachability means no runtime effect.**
  - Modules 100, 126, 127, 96, 164, 165, 168, 172 and 173 appear from the request path only through type imports.
  - The links are phase246:33–34 → phase128, then phase128:11 `import type {ReviewedAmbiguity127}`.
  - The other chain runs phase245:21, phase241:9 and phase228:12, all `import type`.

---

## D1. Epistemic basis / origin of a need

| Module | Representation | Values | Evidence |
|---|---|---|---|
| need_interpretation (path, opt-in) | `NeedInterpretation.expressed[]` vs `inferred[]`; `evidencePlan[].basis` | `'expressed' \| 'inferred'`; inferred `state:'experimental_unverified'` | need_interpretation.ts:42–43, :38, :51 |
| need_interpretation | `InferredNeed.provenance` | `'existing_statement' \| 'existing_relation'` | :39 |
| phase248 (path) | `Journey248.stages.need.concepts[]` carries no basis. A paraphrase match is marked only by `matched:'~w1+w2'`, with `start:-1` | — | phase248_advisory_journey.ts:261, :114 |
| phase248 | category basis (category level, not need level) | `'explicit_alias' \| 'cue_inferred' \| 'need_inferred' \| 'ambiguous' \| 'unresolved'` | :260 |
| phase253_request_constraints (path) | `RequestConstraint253.status` | `'stated_in_request' \| 'candidate' \| 'preference' \| 'superseded' \| 'implied'` | phase253_request_constraints.ts:41 |
| phase253_advice_contract (path) | `Advice253.needs:string[]` (flat) vs gold `explicitNeeds` / `implicitNeeds` | — | phase253_advice_contract.ts:34, :97; scoring merges them at :148 |
| needs_discovery | `InterpretedCriterion.origin` | `'declared_priority' \| 'scenario_inference'` | needs_discovery.ts:50 |
| needs_discovery | `NeedsAnswers.confirmInterpretation?:boolean`; status `'needs_confirmation'` | `DecisionStatus` | :40, :10, :141–144 |
| CFS (Phase61) | `DocumentaryThreshold.basis` (origin of a threshold, not of a need) | `'explicit_user_requirement' \| 'documented_domain_threshold'` | contextual_functional_suitability.ts:23 |
| CFS (Phase61) | `PracticalDifference.basis` | `'user_stated' \| 'domain_validated'` | :29 |
| CFS (Phase61) | `needsConfirmed:boolean` | — | :95, :179–180 |
| phase98 | `userPreferencesConfirmed:true` | — | phase98_tradeoff_value_model.ts:30 |
| phase98 | `HardRequirement.confirmedHardRequirementReference` | — | :54–55 |
| phase100 | `OrdinalSwingJudgement.userConfirmed:true` | — | phase100_adaptive_preference_envelope.ts:25 |
| phase125 | `confirmedGoals?` (inherited state) | — | phase125_compositional_dialogue_frame.ts:24–25 |
| phase125 | `interpretationConfirmed:false` | — | :38 |
| phase127 | `SessionValue127.status` | `'candidate' \| 'confirmed'` | phase127_stateful_clarification.ts:34–35 |
| phase168 | `QualitativeRequirement168.userConfirmationDocumented:boolean` | — | phase168_qualitative_need_research_bridge.ts:38 |
| phase168 | `userConfirmationAuthenticated:false` | — | :38 |
| phase168 | `UserConfirmation168` (explicit event) | — | :23–30 |
| phase165 | `ConstraintOccurrence165.interpretationVerified:false` | — | phase165_request_context_audit.ts:21 |
| phase165 | `CandidateCorrection165.status` | `'unverified_rule_based_candidate'` | :29 |
| phase172 | `OutcomeCandidate172.confirmedByUser:false` | — | phase172_goal_suitability_guide.ts:32 |
| phase172 | `HardConstraintCandidate172.statedInCurrentText:true` | — | :36 |
| phase172 | `authenticatedUserConfirmation:false` | — | :36 |
| phase173 adapter | `NeedHypothesis173.origin` | `'inherited_phase172_candidate' \| 'phase173_usage_expansion'` | phase173_goal_scope_adapter.ts:21 |
| phase96 | `QualitativeNeed.avoidAdverseFinding` ("Requirement explicitly supplied by user") | boolean | phase96_qualitative_review_evidence.ts:174–175 |
| qualitative_needs | `QualitativeNeed` has **no basis field**; everything read from text is implicitly expressed | — | qualitative_needs.ts:16 |

### Pair classification

- **need_interpretation `expressed` ⊂ needs_discovery `declared_priority`? OVERLAPPING-INCOMPATIBLE.**
  - In needs_discovery, `declared_priority` is set only when the user typed an explicit priority. A criterion activated by an explicitly **chosen** questionnaire answer is labelled `'scenario_inference'` (needs_discovery.ts:121–125).
  - Merged, a user's own answer would read as "inferred" under one module and "expressed" under the other.
- **need_interpretation `expressed` vs phase248 paraphrase hits.**
  - `expressed` copies every `advice.needs` id (need_interpretation.ts:148–149). This includes paraphrase matches by word overlap (phase248_advisory_journey.ts:114, `alias:'~'+hit.join('+')`, `start:-1`).
  - The research taxonomy (needs-reasoning-research.md §3.2) would call a paraphrase match by IDF overlap closer to *hypothesised*.
  - Classification: **SUBSUMES-with-loss.** The path's `expressed` is coarser and hides the lexical / paraphrase distinction. That distinction survives only in the `~` prefix of `needSpans[].matched` (phase253_request_advice.ts:96).
- **need_interpretation `inferred` (state `experimental_unverified`) vs other "inferred" types. EQUIVALENT in role; OVERLAPPING in semantics.**
  - Compared types: phase172 `OutcomeCandidate172` (`confirmedByUser:false`, `knowledgeLevel:'usage_hypothesis_requires_domain_review'`, :25, :31–32), phase173 `NeedHypothesis173` (`status:'candidate_requires_specialist_review'`, :15, :20) and needs_discovery `scenario_inference`.
  - All four mean "PEE proposed it; the user did not say it".
  - **Inference source differs:**
    - need_interpretation: typed knowledge statements plus store relations (:87–126);
    - phase172 / phase173: hand-written regex rules in code (phase172:65–80; phase173 adapter:40–60);
    - needs_discovery: questionnaire `activates` lists (needs_discovery.ts:21, :116).
  - A merged record must carry the inference source, or the knowledge-path provenance of need_interpretation is lost.
- **phase253 constraint `stated_in_request` / `candidate` vs phase127 `candidate` / `confirmed`. OVERLAPPING-INCOMPATIBLE.**
  - In phase253, `candidate` means "unclear; ask" (phase253_request_constraints.ts:9, :39–41), and a clear explicit limit is `stated_in_request` **without any confirmation**.
  - In phase127, everything read from text is `candidate` (phase127:169; phase164:237), and `confirmed` is declared but **never assigned anywhere** (grep: the only `'confirmed'` is the type at phase127:35).
  - Merged, a phase253 applied requirement would become a phase127 "candidate", or a phase127 candidate would be applied.
- **phase168 `userConfirmationDocumented` vs needs_discovery `confirmInterpretation` vs CFS `needsConfirmed`. SUBSUMES.**
  - phase168 is per aspect and needs an event reference (:23–30, :135–136).
  - needs_discovery / CFS use one global boolean for the whole interpretation (needs_discovery.ts:40; CFS:179–180).
  - Mapping 168 → 56 loses per-need confirmation. Mapping 56 → 168 must invent an event reference.
- **phase98 / phase100 `userConfirmed:true` (literal type) vs every `…:false` literal (125:38, 126:24, 168:38, 172:32). DISJOINT in use, EQUIVALENT in concept.**
  - These are opposite literal flags of one concept (user confirmation). Phase98/100 *require* it as an input, while the others *forbid* claiming it.
- **qualitative_needs. DISJOINT (no basis field).**
  - Mapping its output into a basis-carrying model requires a default (expressed). It also reads no stance (D3), so the default can be wrong.

---

## D2. Force / meaning (what the need may do)

| Module | Representation | Values | Evidence |
|---|---|---|---|
| phase253_request_constraints (path) | `force` | `'requirement' \| 'preference' \| 'superseded' \| null` | phase253_request_constraints.ts:45 |
| phase253_request_constraints | `status` | `stated_in_request` (applied) / `candidate` (asked) / `preference` (reported, never applied) / `superseded` / `implied` | :39–41 |
| phase253_request_constraints | rule-fact name `mandatory` (force requirement ∧ stated); invariant "a preference became a mandatory requirement" | — | :236–237, :240 |
| phase253_request_constraints | negated need → `status:'preference'`, `force:'preference'` | — | :109, :147, :231 |
| phase253_advice_contract (path) | `otherLimits` "Reported, never used to exclude" | — | phase253_advice_contract.ts:31–33 |
| phase253_advice_contract | `featurePreferences` "kept, never outcome needs" | — | :69–70 |
| phase253_request_advice (path) | feature → "not an outcome PEE assesses; no product is checked or ordered" | — | phase253_request_advice.ts:88–89 |
| phase253_request_advice | aspect objectives "never filters or orders" | — | :409–413 |
| phase253_request_advice | context needs `*_alternative`, `*_constraint` (not outcomes) | — | :204–206 |
| need_interpretation (path) | inferred need "never becomes a constraint, an exclusion, a ranking input" (no force field) | — | need_interpretation.ts:15–17 |
| phase248 (path) | `factualRequirements` "to be confirmed by the user before … shortlist"; category `excluded[]` (negated category name) | — | phase248_advisory_journey.ts:264–267, :260, :284–290 |
| needs_discovery | `Importance` | `'essential' \| 'important' \| 'nice_to_have' \| 'irrelevant'` | needs_discovery.ts:9 |
| CFS | `essential` ⇒ mandatory (`mandatoryNeedIds`, `mandatoryStatus`, non-compensatory) | — | CFS:83–84, :247–262 |
| phase96 | `QualitativeNeed.importance` | `'essential' \| 'important' \| 'optional'` | phase96_qualitative_review_evidence.ts:171 |
| phase96 | `avoidAdverseFinding` | boolean | :175 |
| phase97 | maps 56 → 96: `essential` → `essential`, `important` → `important`, **else** → `optional` | — | phase97_noncompensatory_qualitative_gate.ts:123 |
| phase168 | `Meaning168` | `'required' \| 'excluded' \| 'preferred' \| 'optional'` | phase168_qualitative_need_research_bridge.ts:15 |
| phase168 | 168 → 96: `required` → `essential` + `avoidAdverseFinding:true`; `preferred` → `important` | — | :153–156 |
| phase168 | `optional` → `optional_not_requirement` | — | :141 |
| phase165 | `proposedMeaning` | `'required' \| 'excluded' \| 'optional' \| 'preferred' \| 'unresolved'` | phase165_request_context_audit.ts:20 |
| phase165 | cue classes REQUIRED / EXCLUDE / OPTIONAL | — | :41–60 |
| phase125 | `Modifier125` | `'required' \| 'excluded' \| 'environment' \| 'environment_absent' \| 'requested_capability'` | phase125_compositional_dialogue_frame.ts:15 |
| phase164 | `role` (string) adds `'optional'` from a 165 correction | — | phase164_user_request_journey.ts:281–282 |
| phase98 | `HardRequirement` "Explicitly confirmed nonnegotiable by THIS user; other important needs are soft" | — | phase98_tradeoff_value_model.ts:52–63 |
| phase100 | status `'hard_requirement_unresolved_or_failed'` | — | phase100_adaptive_preference_envelope.ts:41 |
| phase100 | `SwingPreference` | `'more_important' \| 'equally_important'` | :19 |
| phase172 | `HardConstraintCandidate172` with `exclusionAuthorized:false` | — | phase172_goal_suitability_guide.ts:34–38 |
| phase173 | `canDisqualifyProduct:false` | — | phase173_goal_scope_adapter.ts:20 |
| phase173 | `hardVetoEligible:false` | — | phase173_need_mechanism_graph.ts:18 |
| phase113 | `PreferenceStrength113` | `'mandatory' \| 'preferred' \| 'unclear'` | phase113_local_intent_interpreter.ts:25 |
| phase190 | `mandatoryThreshold` | — | phase190_robust_preference_audit.ts:14 |
| CFS | `DocumentaryThreshold` (at_least / at_most / equal_to) | — | CFS:19–25 |

### Pair classification

- **EQUIVALENT (rename only).** These all mean "applies or excludes":
  - 253 `force:'requirement'` ∧ `status:'stated_in_request'`;
  - 168 `required` once confirmed;
  - 165 `required`;
  - 113 `mandatory`;
  - 56 `essential`;
  - 96 `essential` + `avoidAdverseFinding`;
  - 98 `HardRequirement`.
  - Caveat: only 98 and 168 require a confirmation **event**, while 253 applies a clear stated limit at once (phase253_request_constraints.ts:9, :133). See incompatibility I-3.
- **EQUIVALENT.** These all mean "reported, never excludes":
  - 253 `preference`;
  - 168 / 165 `preferred`;
  - 113 `preferred`;
  - 56 `important`;
  - 96 `important`.
- **OVERLAPPING-INCOMPATIBLE: 56 `important`.**
  - 56 `important` is also the **default** for a criterion the user did not rank (needs_discovery.ts:123).
  - 168 `preferred` → 96 `important` is a user-stated preference (phase168:154).
  - The same value carries two epistemic bases (D1).
- **OVERLAPPING-INCOMPATIBLE: 125 `required`.**
  - 125 `required` is the **default role of any positively mentioned task aspect** (phase125_compositional_dialogue_frame.ts:87). It is a mention, not a must-have.
  - Phase165 exists to correct exactly this (`required_strength_not_preserved`, phase165:13, :128).
  - Merging 125 `required` with 253 `requirement` or 168 `required` would turn mentions into exclusion-capable requirements.
- **Optional and excluded. SUBSUMES or DISJOINT across modules:**
  - **56 `nice_to_have` ⊂ 96 `optional`.** phase97:123 collapses `nice_to_have` into `optional`. `irrelevant` never reaches it, because needs_discovery.ts:118–119 deletes it.
  - **168 / 165 `optional` vs 164.** 168 / 165 `optional` means "preserve without exclusion" (phase168:141). Phase164 **drops** an aspect corrected to `set_optional` from session memory (phase164_user_request_journey.ts:236–238). So `optional` exists in the output projection (:281) but not in the session state.
  - **253 has no `optional` value.** The nearest are `preference` (never applied) and `candidate` (asked).
  - **`excluded` (negative requirement) exists only off path:** 125:15, 165:20, 168:15. On the path the only exclusion of a need-like object is the category level (`stages.category.excluded`, phase248_advisory_journey.ts:260, :284–290).

---

## D3. Stance (negation, indifference, rejection)

| Module | Representation | Values | Evidence |
|---|---|---|---|
| language_scope (path) | `stanceAt` → `stance` | `'indifferent' \| 'negated'` | language_scope.ts:83 |
| language_scope | `Negation.kind` | `'proposition' \| 'requirement'` | :20 |
| language_scope | rules | indifferent = a negated indifference predicate within 4 words; negated = a governing negator | :79–91 |
| need_interpretation (path) | `stances[]` | `{term, stance:'indifferent' \| 'negated', negator}`; both kinds go into `setAside` | need_interpretation.ts:46, :137–140, :164–165 |
| phase248 (path) | need set aside if `indifferent` **or** (`negated` ∧ `kind:'requirement'`); a negated **proposition** ("don't want cold spots") **still expresses a need** | — | phase248_advisory_journey.ts:345–353 |
| phase253_request_advice (path) | aspect objective dropped if indifferent, or negated unless the term is a listed negative-aspect word | — | phase253_request_advice.ts:425–428 |
| phase253_request_constraints (path) | negated requirement → `preference`; negator on the quantity without a bound word → `candidate` | — | :106–110, :147 |
| phase125 | negation → `excluded` / `environment_absent`; "dont need" is `uncertainNegation` → **not** a negation | — | phase125:71–72, :78–88 |
| phase165 | `"don't need"`, `"no need for"`, `"not required"` → OPTIONAL; `"don't want"`, `"without"`, `"no"` → EXCLUDE | — | phase165_request_context_audit.ts:41–54 |
| phase172 | `locallyRejected172` is **one boolean** for indifference ("doesn't matter", "is not a concern") and rejection ("don't want", "without", "avoid", "don't mind"); "not too X" is not rejected | — | phase172_goal_suitability_guide.ts:13–22 |
| needs_discovery | `Importance:'irrelevant'` (user-set) removes the criterion | — | needs_discovery.ts:9, :118–119 |
| phase96 | `OpinionPolarity` (of *reviews*, not of needs) | — | phase96:16–18 |
| qualitative_needs | **no stance**: `readQualitativeNeed` matches terms with `hasPhrase` only | — | qualitative_needs.ts:20–26 |

### [run] Behaviour on identical words

The table covers the request path (language_scope / 248) and the off-path modules (125, 165). It uses the existing `dist/` build with a schema aspect `mop` (capability).

| Text | language_scope `stanceAt` | Phase125 role | Phase165 `proposedMeaning` |
|---|---|---|---|
| "I don't need a mop" | `negated`, kind `requirement` (→ 248 sets the need aside; 253 turns a quantity into `preference`) | `requested_capability` | `optional` (correction `set_optional`) |
| "without a mop" | `negated`, kind `proposition` (→ 248 **keeps** the need) | `excluded` | `excluded` |
| "it must have a mop" | — | `requested_capability` | `required` (correction `set_required`) |
| "I don't mind noise" | `indifferent` | — | — |
| "I don't want wifi" | `negated`, kind `proposition` | — | (EXCLUDE cue, phase165:48) |

The table cites need_interpretation.ts:139–140 and :145, phase248_advisory_journey.ts:348–349, and phase253_request_constraints.ts:147.

### Pair classification

- **language_scope `indifferent` ≡ needs_discovery `irrelevant`. EQUIVALENT in meaning.**
  - The difference is the source: text vs an explicit priority.
  - It is also ≈ the research doc's "indifferent".
- **language_scope `indifferent` vs phase172 `locallyRejected172`. SUBSUMES.**
  - Phase172's boolean is coarser and mixes indifference with rejection (:20–21).
  - Mapping 172 → path loses which of the two it was.
  - Mapping path → 172 is lossless but merges the two.
- **"don't need X". OVERLAPPING-INCOMPATIBLE, four ways:**
  - **Path, need:** set aside, as for indifference (phase248:349).
  - **Path, quantity:** a `preference` meaning sufficiency (phase253_request_constraints.ts:106–109, :147).
  - **phase165:** `optional` (phase165:41).
  - **phase125:** a positive `requested_capability` (it treats it as *not* a negation; phase125:71, :84; **[run]**).
  - The comment at phase125:82–83 says "'I don't need a mop' expresses a preference, not necessarily a ban". The code makes it a positive request.
  - A merged model must choose one of: set aside / sufficiency-preference / optional / positive.
- **"don't want X" / "without X". OVERLAPPING-INCOMPATIBLE.**
  - **Path, phase248:** the need is still expressed, as a negated wish (:347).
  - **Path, need_interpretation:** X is in `stances` and its stem is `setAside`, which blocks inferences containing it (:139–140, :164–165). A function feature under any stance is **not recorded at all** (:145–146).
  - **Off path:** `excluded` in 125, 165 and 168 (with action `verify_feature_absent_for_exact_variant`, phase168:145), and `rejected` in 172.
  - The path has no "excluded feature" representation. The negated feature survives only as a `stances[]` term, without offsets.
- **"don't mind X". OVERLAPPING-INCOMPATIBLE.**
  - language_scope: `indifferent` ("mind" is an indifference predicate in `resources/quantity-knowledge/quantity-knowledge.v3.json` from :2809).
  - phase172: rejection (:21, `don't\s+(?:…|mind|…)`).
- **qualitative_needs vs language_scope. DISJOINT.**
  - qualitative_needs ignores stance. "noise doesn't bother me" would still list the `noise` aspect (qualitative_needs.ts:22; no negation check).

---

## D4. Need content kind

| Module | Representation | Values | Evidence |
|---|---|---|---|
| store concept kinds (phase128, read on path via `categoryItems246`) | `ConceptKind128` | `'task' \| 'environment' \| 'capability' \| 'meaning' \| 'outcome' \| 'failure' \| 'mechanism' \| 'measurement'` | phase128_category_cognition_dialogue_bridge.ts:20–23 |
| phase248 (path) | need concept `kind:string\|null` (copied from the store) | — | phase248_advisory_journey.ts:261, :394–395 |
| phase253_request_advice (path) | `mechanism`, or `task` after "with a / has a", → feature preference | — | phase253_request_advice.ts:62–73, :88 |
| phase253_request_advice | context needs `*_alternative` (owned equipment), `*_constraint` (installation), `single_compartment_use` | — | :204–206 |
| need_interpretation (path) | inferred only if kind ∈ {`outcome`, `environment`} | — | need_interpretation.ts:117 |
| need_interpretation | `features[].kind` | `'function' \| 'mode'` | :45 |
| need_interpretation | `contexts[]` (QK use contexts) | — | :47 |
| phase253_request_constraints (path) | `property` | `capacity \| water_tank \| width \| height \| depth \| weight \| power \| battery_life \| price` | phase253_request_constraints.ts:37 |
| phase253_request_constraints | `describes` | `'product' \| 'available_space'` | :38 |
| phase253_request_constraints | `object` | `'product' \| 'other'` | :46 |
| phase253_advice_contract (path) | `QuantityRequirement253`, `ClassRequirement253`, `featurePreferences`, `unassessedObjectives` | — | phase253_advice_contract.ts:79–82, :70, :44 |
| phase253_advice_contract | `GoalAssessment253.outcomes[].coverage` | `'assessed' \| 'proxy_only' \| 'unassessed' \| 'context'` | :184 |
| phase116 | `Function116.kind` | `'primary_goal' \| 'secondary_goal' \| 'risk_control'` | phase116_category_function_model.ts:16 |
| phase116 | `Mechanism116` (`stage`, `cadence`) | — | :17 |
| phase116 | `Endpoint116` | soil_removal … unspecified | :15 |
| phase116 | `failureModes` | — | :20 |
| phase247 (path) | `compileTo116` maps store sections: `user_goals` → `primary_goal`, `performance_outcomes` → `secondary_goal`, `mechanisms`, `quality_measurements` → endpoints, `failure_modes_safety` | — | phase247_category_relations.ts:142–169 |
| phase117 | `Dimension117` | `'outcome_effectiveness' \| 'time_efficiency' \| 'pass_efficiency' \| 'side_effect'` | phase117_goal_outcome_comparison.ts:10 |
| phase125 | `SchemaAspect125.kind` | `'task' \| 'environment' \| 'capability'` | phase125_compositional_dialogue_frame.ts:17 |
| phase125 | `Goal125` | `'performance' \| 'value' \| 'autonomy' \| 'capability_discovery'` | :13 |
| CFS | `TaskRole` | `'main_task' \| 'task_friction' \| 'accessibility' \| 'continuity' \| 'safety'` | CFS:18 |
| needs_discovery | `DecisionCriterion` (`requiredEvidence`, `concern`) — one undifferentiated kind | — | needs_discovery.ts:11–20 |
| phase168 | `evidenceSemantics` | `'feature_presence' \| 'performance_quality'` | phase168:19 |
| qualitative_needs | `{aspects, facets, useContexts, conditions}` | — | qualitative_needs.ts:16 |
| phase172 | `OutcomeCandidate172` (goal, `decisionDimensions`, `mechanismHypotheses`, `potentialFailureModes`) | — | phase172_goal_suitability_guide.ts:26–33 |
| phase172 | `HardConstraintCandidate172` | — | :34–38 |
| phase172 | `possibleSolutionFamilies` | — | :48 |
| phase173 adapter | `Task173` (product_selection / solution_comparison / use_or_troubleshoot) | — | phase173_goal_scope_adapter.ts:13 |
| phase173 adapter | `Target173` | — | :14 |
| phase173 adapter | `ownedEquipment` | — | :26 |
| phase113 | `Goal113` | — | phase113_local_intent_interpreter.ts:22 |
| phase113 | `Requirement113` | — | :24 |

### Pair classification

- **Store `outcome` ≈ 116 `primary_goal` / `secondary_goal` ≈ 172 `goal` ≈ 117 `goalId`. EQUIVALENT in concept, but OVERLAPPING-INCOMPATIBLE in granularity.**
  - 116 / 247 derive goal vs secondary goal from the *store section* (phase247:148, :161), not from the concept kind.
  - Phase117's `Dimension117` splits one goal into effectiveness / time / pass / side effect. No path type has that split.
- **Store `mechanism` ≈ 116 `Mechanism116` ≈ 172 `mechanismHypotheses` ≈ need_interpretation `features[kind:'function']`?**
  - Store `mechanism` ≈ 116 `Mechanism116` ≈ 172 `mechanismHypotheses` are EQUIVALENT names.
  - **Path conflict:** a store `mechanism` concept is turned into a *user-asked feature* (phase253_request_advice.ts:62–71). In 116 / 172 a mechanism is *how the product works*, linked to a goal by `enables` / `may_support`.
  - Both readings exist on the path, which makes this OVERLAPPING-INCOMPATIBLE.
- **Store `task` vs 125 `task` vs CFS `TaskRole` vs 173 `Task173`. DISJOINT despite the shared word.**
  - Store `task` is a use the product serves, or equipment when cued (phase253_request_advice.ts:63–64).
  - 125 `task` aspect is an activity whose default role is `required` (phase125:87).
  - CFS `TaskRole` is the role of a need within a task (main / friction / accessibility / continuity / safety, CFS:18).
  - 173 `Task173` is the user's *dialogue task* (selection vs troubleshooting, phase173 adapter:13).
- **Environment / context.** Several representations name a use context: store `environment`, 125 `environment` / `environment_absent`, QK `useContexts` (need_interpretation:47, :152; qualitative_needs:24), 253 `*_constraint` / `*_alternative` suffix contracts (phase253_request_advice.ts:206) and 173 `ownedEquipment`.
  - **125 `environment_absent` (negated context) has no path counterpart.** need_interpretation drops a negated use context (:152, `!stanceAt`).
  - **Owned equipment:** 173 `ownedEquipment` ≈ 253 `*_alternative` naming contract. They are EQUIVALENT in meaning. 253 encodes it in an id suffix, 173 as a typed field.
- **Measurement / endpoint.** Store `measurement` ≈ 116 `EndpointDef116` ≈ 117 `Protocol117.metricId` ≈ lab bridge `measurementCriterion` (lab_needs_bridge.ts:36) ≈ needs_discovery `requiredEvidence` (needs_discovery.ts:15).
  - These are EQUIVALENT as "what would establish the need".
  - **needs_discovery `requiredEvidence` is one string per criterion; the store holds many measurements per outcome with conditions** (phase253_request_advice.ts:207–232). Mapping the store onto needs_discovery is lossy.
- **Failure / obstacle.** 116 `failureModes` ≈ 172 `potentialFailureModes` ≈ 173 `possibleFailureModes` ≈ store `failure` ≈ needs_discovery `concern`. These are EQUIVALENT.
  - **The path does not surface failure concepts as needs.** need_interpretation keeps only `outcome` / `environment` (:117).
  - A negated failure ("don't want cold spots") stays a need only through phase248:347.
- **Quantity constraint.** 253 `RequestConstraint253` SUBSUMES CFS `DocumentaryThreshold` (kind / value / basis / reference, CFS:19–25) and 190 `mandatoryThreshold`.
  - CFS also carries `equal_to` and boolean values, which 253 lacks (253: min / max only, :37).

---

## D5. Function vs outcome separation

| Module | Representation | Evidence |
|---|---|---|
| CFS | `FunctionLane` = `'declared_structural_capability' \| 'observed_task_outcome'`; `practicalDifference` only for the observed lane | CFS:17, :131 |
| phase116 | `LinkKind116` = `enables \| may_support \| measured_by \| may_risk` | phase116_category_function_model.ts:13 |
| phase116 | `State116` (`manufacturer_only` vs `independently_observed`) | :14 |
| phase116 | `Basis116` | :11 |
| phase116 | `Finding116` (presence) | :12 |
| phase247 (path) | `RelationKind247` adds `not_sufficient_for`, `requires_condition`; `KIND116` drops both (→ null) | phase247_category_relations.ts:17, :141 |
| phase247 | `Support247` | :18 |
| phase247 | `Sufficiency247` `'establishes'` vs state `'established'` | :64, :101–106 |
| phase253_request_advice (path) | `featureConcepts253` (a mechanism, or a task named as equipment, is a feature, never an outcome need) | phase253_request_advice.ts:62–73, :88–90 |
| phase253_request_advice | `needKnowledge269` (`relevant` from `measured_by`, `proxies` from `not_sufficient_for`, `conditions` from `requires_condition`) | :207–232 |
| phase253_advice_contract (path) | `coverage:'proxy_only'`; "A proxy never assesses an outcome" | phase253_advice_contract.ts:50–53, :184 |
| need_interpretation (path) | `features[].note` "a feature is not evidence that its outcome is met"; `evidencePlan.notSufficient` | need_interpretation.ts:144, :51, :181 |
| phase168 | `evidenceSemantics:'feature_presence' \| 'performance_quality'`; presence → `structural_feature_verification` | phase168:18–19, :143–146 |
| phase125 | `evidenceKeys` "Describes a search goal, not evidence that a product implements it" | phase125:18 |
| phase125 | role `requested_capability` | :15, :87 |
| phase172 / phase173 | mechanisms as `mechanismHypotheses` "never a verified cause" | phase172:29–30 |
| phase172 / phase173 | `LinkProposal173.scientificStatus:'proposed_unreviewed'` | phase173_need_mechanism_graph.ts:17 |
| phase117 | refuses to "infer performance from mechanisms" | phase117:5 |

### Pair classification

- **CFS `declared_structural_capability` ≡ 168 `feature_presence`; CFS `observed_task_outcome` ≡ 168 `performance_quality`. EQUIVALENT (rename).**
  - Both are a per-need lane chosen by a reviewed mapping (CFS `FunctionRule.lane`, :32–43; 168 `FacetMapping168`, :16–22).
- **Path `featurePreferences` vs CFS / 168 lanes. OVERLAPPING-INCOMPATIBLE.**
  - On the path the split is **per concept kind in the store** (mechanism / task → feature; phase253_request_advice.ts:62–71).
  - In CFS / 168 it is **per need, by a reviewed mapping**. The same aspect (for example "sleep mode") could be a presence check in one category and a performance criterion in another.
  - **The path feature is never checked** (:89). In 168 a confirmed presence need *is* checked (`verify_feature_present_for_exact_variant`, :145–146).
- **247 `not_sufficient_for` ⊃ 116 `may_support`?** They are not equivalent.
  - 116 `may_support` is a positive but weak link ("may limit soil carryover but is not proof", phase116:132).
  - 247 `not_sufficient_for` is an explicit negative link: proxy rejection, path :217.
  - `compileTo116` drops `not_sufficient_for` (phase247:141, :144 "stay in the store").
  - Mapping 247 → 116 is **lossy**. 116 → 247 is lossless for the four shared kinds.
- **Sufficiency naming. EQUIVALENT (rename)**, but a merge must fix one spelling.
  - The input value is `Sufficiency247 = 'establishes'` (phase247:64, :74).
  - The derived state is `'established'` (:101, :106), used at phase253_request_advice.ts:201, :226.
- **116 `State116` (`manufacturer_only` / `independently_observed`) vs 117 `evidenceBasis` (`independent_measured` / `manufacturer_claim` / `independent_qualitative`, phase117:26) vs 116 `Basis116` (`manufacturer_declared` / `independent_observed` / `independent_measured`, :11). EQUIVALENT families with different spellings.**
  - These are product-evidence states, not need states. They belong to the evidence side of a consolidated model.

---

## D6. Hypothesis / review status

| Module | Field | Values | Evidence |
|---|---|---|---|
| need_interpretation (path) | `InferredNeed.state` | `'experimental_unverified'` | need_interpretation.ts:38 |
| need_interpretation | `candidateEffects` (C-lite shadow); rules `experimental` | — | :52–53, :171–177; resources/request-semantics/need-candidates.v1.json:4 |
| phase247 (path) | `Support247` | `'hypothesis' \| 'method_reference' \| 'reviewed' \| 'evidence_supported'` | phase247:18 |
| phase247 | sufficiency state | `established \| informs_only \| unclear \| contested \| unassessed` | :101 |
| phase128 (store) | `KnowledgeState128` | `'proposed_unverified' \| 'reviewed_definition'` | phase128:24 |
| phase253_request_constraints (path) | `confidence` | `'clear' \| 'ambiguous'` | :41 |
| phase172 | `KnowledgeLevel172` | `'usage_hypothesis_requires_domain_review' \| 'question_from_published_research'` | phase172:25 |
| phase172 | `confirmedByUser:false`, `engineeringVerified:false` | — | :32 |
| phase173 adapter | `LinkStatus173` | `'candidate_requires_specialist_review'` | phase173_goal_scope_adapter.ts:15 |
| phase173 adapter | `productMeasurementVerified:false` | — | :20 |
| phase173 graph | `scientificStatus` | `'proposed_unreviewed'` | phase173_need_mechanism_graph.ts:17 |
| phase173 graph | `methodStatus` | — | :16 |
| phase173 graph | `ReviewRecord173.reviewStatus` | `'unverified_review_submission'` | :37 |
| phase173 graph | `reviewerAssessment` | consistent / contradicts / inconclusive | :35 |
| phase168 | `NeedDisposition168` | `pending_user_confirmation \| ambiguous_user_scope \| unmapped_reviewed_facet \| optional_not_requirement \| qualitative_test_research \| structural_feature_verification \| unresolved_excluded_performance` | phase168:31–33 |
| phase168 | `candidateOnly:true` | — | :57 |
| phase165 | `interpretationVerified:false`; correction `status:'unverified_rule_based_candidate'` | — | phase165:21, :29 |
| phase125 | `FrameStatus125` | `'candidate_needs_evidence' \| 'requires_semantic_review' \| 'requires_context'` | phase125:16 |
| phase125 | `interpretationConfirmed:false` | — | :38 |
| phase126 | `meaningConfirmed:false` | — | phase126:24 |
| phase127 | `SessionValue127.status` | candidate / confirmed | phase127:35 |
| needs_discovery | `DecisionStatus` | `needs_context \| needs_confirmation \| insufficient_evidence \| criteria_mapped` | needs_discovery.ts:10 |
| lab_needs_bridge | `NeedToTestRule` "editorially specified hypothesis"; `reviewReference` | — | lab_needs_bridge.ts:32, :45 |

### Pair classification

- **Same idea, different names: "proposed by PEE, unreviewed".** need_interpretation `experimental_unverified` ≈ 173 `proposed_unreviewed` ≈ 172 `usage_hypothesis_requires_domain_review` ≈ 247 `hypothesis` ≈ 128 `proposed_unverified` ≈ 173 `candidate_requires_specialist_review`.
  - They are EQUIVALENT as a level. The *object* differs: a need instance (need_interpretation, 173 adapter), a relation (247, 173 graph) or a knowledge item (128).
  - A merge must keep "status of the need" separate from "status of the knowledge that produced it".
  - need_interpretation already states both together: the need is experimental *because* its knowledge is `proposed_unverified` (need_interpretation.ts:15–16).
- **Reviewed level. OVERLAPPING-INCOMPATIBLE.**
  - 247 `reviewed` needs a *verified* receipt citing store revisions (phase247:52–60).
  - 173 `ReviewRecord173` explicitly cannot promote (`canPromoteToVerifiedCausalLink:false`, :40).
  - A merged "reviewed" status would be unsafe unless it keeps 247's promotion gate.
- **needs_discovery `DecisionStatus` and 168 `NeedDisposition168` are request-level / need-level *dispositions*, not hypothesis states.**
  - They map partly onto path fields: `needs_confirmation` ≈ 253 `candidate` + `questions`; `insufficient_evidence` ≈ `GoalAssessment253.decision:'research'` (phase253_advice_contract.ts:183).
  - Classification: OVERLAPPING. They are dispositions with different enumerations.
- **253 `confidence:'clear' \| 'ambiguous'`** is a reading-confidence flag on constraints only. No need-level analogue exists on the path.

---

## D7. Question / clarification representation

| Module | Representation | Evidence |
|---|---|---|
| phase253_advice_contract (path) | `Advice253.questions:string[]` (plain strings) | phase253_advice_contract.ts:49 |
| phase253_request_constraints (path) | `RequestConstraint253.question?:string` (only when `status:'candidate'`) | phase253_request_constraints.ts:49, :242–267 |
| phase248 (path) | `clarificationQuestions:string[]` | phase248_advisory_journey.ts:274 |
| phase248 | `CategoryEntry248.needQuestions` Record<need, string> | :29–31, :469–472 |
| phase248 | fixed `QUESTION` map | :467–468 |
| phase253_request_advice (path) | `NEED_QUESTION` / `needQuestions` for unresolved factual needs | phase253_request_advice.ts:131 |
| phase253_request_advice | quantity / class questions | :393–395, :407 |
| needs_discovery | `DecisionQuestion` `stage:'essential_context' \| 'refinement'`; `choices[].activates`; `maxQuestions`; skip via `confirmInterpretation` | needs_discovery.ts:21–27, :99, :128–133 |
| phase126 | `Pending126.kind` = `'material_ambiguity' \| 'swing_preference' \| 'missing_referent'`; `optional:true`, `allowsFreeText:true`; `questionIssueCode` | phase126:19–21 |
| phase126 | `Choice126.kind` = `'reading' \| 'compare' \| 'preference' \| 'unsure'` | :15–18 |
| phase126 | "Show both possibilities" (`compare_both`) | :105–106 |
| phase126 | `Reply126.skip` | :153 |
| phase126 | `ReplyOutcome126` | :150–151 |
| phase126 | `TurnAction126` | :13–14 |
| phase111 (gate used by 126) | decides materiality | phase126:83 |
| phase100 | `AdaptivePreferenceQuestion` (responses first / second / equal; conditional bounds) | phase100:28–36 |
| phase127 | `askedIssueCodes`, `pendingSwing`, `comparisonsRequested` | phase127:44–45 |
| phase127 | `ReviewedAmbiguity127` (triggers, meanings) | :25–27 |
| phase127 | dismiss pending (`new_topic` / `not_now`) | :255–258 |
| phase172 | `ClarifyingQuestion172.decisionImpact` = `'changes_solution_family' \| 'changes_feasibility' \| 'changes_scoring_context'`; `answeredByUser:false`; at most one question | phase172:39–42, :179, :197 |

### Pair classification

- **Path questions (`string[]`) vs every off-path question type. SUBSUMED-with-loss.**
  - The path carries only the text. It loses:
    - the reason (decision impact, 172:40; materiality, 126:83);
    - options (126:15–18; 56:21–27);
    - the skip / "show both" affordances (126:105–106, :153);
    - the need it resolves. 253 constraints keep it on the constraint (:49), but `Advice253.questions` does not link back.
- **172 `decisionImpact` vs 126 `material_ambiguity` (Phase111 gate). OVERLAPPING-INCOMPATIBLE.**
  - 172 labels impact by hand-written rule (172:137–151).
  - 126 requires an independently reviewed projection showing that readings change eligibility (phase127:146–154, "forbid improvising a 'material' question").
  - Merged, 172 questions would bypass 126's gate.
- **56 `stage:'essential_context'` ≈ 172 `changes_feasibility` / `changes_solution_family`.** Both mean "ask before anything else".
  - Classification: OVERLAPPING. They are different enumerations; 56 is a stage and 172 an impact type.
- **126 / 127 "one question" ≡ 172 "at most one" ≡ need_interpretation `maxInferred:1` (a different object: inferences).** The one-at-a-time policy matches.
  - The path has **no cap**: questions are pushed from several sources (phase253_request_advice.ts:131, :393–395, :407; phase248:466–472).

---

## D8. Provenance of a need

| Module | Representation | Evidence |
|---|---|---|
| phase253_request_constraints (path) | `span`, `start`, `end` (verbatim offsets; negator included) | :38, :128 |
| phase253_request_constraints | `relations[]` to other limits | :48 |
| phase253_request_constraints | `closureBasis` | :44 |
| phase253_advice_contract (path) | `researchInputs.needSpans {id, matched}`: **no offsets**; paraphrase as `~a+b` | phase253_advice_contract.ts:89; phase248:114 |
| need_interpretation (path) | `expressed[].span` (= `matched`, no offsets) | need_interpretation.ts:42, :148–149 |
| need_interpretation | `InferredNeed.path: PathStep[][]` (`request_words` → `use_context` → `statement` (source doc:line, reliability) → `concept` → `relation`) | :37, :118–122 |
| need_interpretation | `from`, `anchors`, `provenance` | :39 |
| need_interpretation | `trace[]` per clause | :50, :182–194 |
| need_interpretation | `features[].span` | :45 |
| need_interpretation | `stances[].term` (no offsets) | :46 |
| phase248 (path) | need `matched` alias only | :261 |
| phase125 | `AspectFinding125.matchedText`, `source:'current_turn'` | phase125:29–30 |
| phase125 | `questionSha256` | :31 |
| phase127 | `SessionValue127.originTurnId` | phase127:34 |
| phase127 | swing `originTurnId` | :43 |
| phase127 | `history[]` with `eventSha256` | :47 |
| phase165 | occurrence `start`, `end`, `literal`, `modifiers[]` with offsets | phase165:17–21 |
| phase168 | `mentionSpans {start, end, literal, sha256}` | phase168:36 |
| phase168 | `UserConfirmation168` (`turnId`, `questionSha256`, `exactUserPhrase`, `confirmationEventReference`) | :23–30 |
| phase172 | `observedUsageSpan`, `start`, `end`, `literatureOrDiscoveryReference` | phase172:27–31 |
| phase173 adapter | `inputSpan`, `inputStart`, `inputEnd`, `origin` | phase173 adapter:19–21 |
| phase173 adapter | `ownedEquipmentEvidence` spans | :26 |
| phase173 graph | `fingerprint`, `methodReferences` | phase173 graph:12–15 |
| needs_discovery | `origin` only; answer ids, no text | needs_discovery.ts:36, :50 |
| CFS | `DocumentaryThreshold.reference`, `mappingReference` | CFS:24, :42 |
| phase100 | `answerReference` | phase100:26 |
| phase98 | `confirmedHardRequirementReference` | phase98:55 |
| lab_needs_bridge | `reviewReference` | lab_needs_bridge.ts:45 |

### Pair classification

- **253 constraint spans ≡ 165 / 168 / 172 / 173 spans** (literal + offsets). EQUIVALENT.
  - 168 adds a sha256 per literal (:36). That is lossless to keep and droppable.
- **Path need provenance (`needSpans.matched`, `expressed.span`) vs off-path spans. SUBSUMED-with-loss.**
  - The path has **no offsets** for needs, and for paraphrases no contiguous span at all (`start:-1`, phase248:114).
  - Mapping 165 / 168 / 172 → path loses offsets.
- **Turn provenance.** 127 `originTurnId` ≈ 168 `turnId` ≈ 126 `turnId`. These are EQUIVALENT.
  - **The path is single-turn and has no turn id** (Advice253 has `text` only, phase253_advice_contract.ts:27).
- **Inference provenance.** need_interpretation `PathStep[]` (typed, with source document and line) SUBSUMES 172 `literatureOrDiscoveryReference` (one URL per rule, phase172:31, :59–63) and 173 `origin` (two-valued).
  - Mapping 172 / 173 → need_interpretation is lossless only if a `PathStep` kind for "hand-written code rule" is added. Today the step kinds are only `request_words | use_context | statement | concept | relation | candidate` (:37).
- **Confirmation provenance.** 168 `confirmationEventReference` ≈ 98 `confirmedHardRequirementReference` ≈ 100 `answerReference`. These are EQUIVALENT.
  - **There is no path counterpart.** The path never records a confirmation, since it is single-turn.

---

## (a) Candidate "one representation" per dimension

| Dim | Candidate single representation (from existing values) | Maps losslessly | Loses information (what) |
|---|---|---|---|
| D1 basis | `basis: expressed_lexical \| expressed_paraphrase \| confirmed \| inferred{source: knowledge_statement \| store_relation \| code_rule \| questionnaire}` + `confirmationRef?` | need_interpretation `expressed` / `inferred` (needs the paraphrase split from `~`, phase248:114); 172 (`code_rule`); 173 adapter (`code_rule` + `origin`); 127 candidate / confirmed; 168 (`confirmationRef`) | needs_discovery `origin` (a questionnaire answer is labelled `scenario_inference`, :125: the real basis must be re-derived); CFS / 56 global `confirmInterpretation` (no per-need ref); 98 / 100 literal `userConfirmed:true` (no turn); qualitative_needs (no basis) |
| D2 force | 253 `force` + `status` extended with `optional` and `excluded`: `requirement \| preference \| optional \| excluded \| superseded \| implied`, plus `applied:boolean` | 253 (all values); 168 `Meaning168`; 165 (minus `unresolved` → `candidate`); 113 (`mandatory` → requirement, `preferred` → preference, `unclear` → candidate); 98 HardRequirement (requirement + confirmationRef) | 56 `Importance` (`important` default vs stated; `nice_to_have` vs `optional` is a rename, but `irrelevant` is a *stance*, D3); 96 (`avoidAdverseFinding` is a second flag beside `essential`); 125 `Modifier125` (`required` = mention default, not force; `environment` / `environment_absent` are content kind D4 + stance D3); 100 swing ordinals (a weight relation between two needs, not a force) |
| D3 stance | language_scope `{stance: indifferent \| negated, kind: proposition \| requirement, negator}` | 56 `irrelevant` (= indifferent, from priority); 172 `locallyRejected172` → `negated` or `indifferent` (needs re-reading; 172 does not say which) | 125 negation → `excluded` (125 treats "don't need" as non-negated; [run]); 165 OPTIONAL / EXCLUDE classes (they conflate stance and force); qualitative_needs (no stance) |
| D4 content kind | Store `ConceptKind128` (task, environment, capability, meaning, outcome, failure, mechanism, measurement) + 253 `property` / `describes` / `object` for quantities + QK `useContexts` | 116 functions / mechanisms / endpoints / failureModes (via the store sections, phase247:142–169); 172 / 173 goal / mechanism / failure lists; 125 `SchemaAspect125.kind` (subset); qualitative_needs (aspects / facets / useContexts / conditions as typed fields) | 117 `Dimension117` (effectiveness / time / pass / side effect: no store kind); CFS `TaskRole` (main / friction / accessibility / continuity / safety: no store kind); 173 `Task173` (dialogue task, a different axis); 125 `Goal125` (performance / value / autonomy: a request-level goal, not a need kind); 253 suffix contracts `*_alternative` / `*_constraint` (phase253_request_advice.ts:206; an id convention, not a kind) |
| D5 function / outcome | 247 `RelationKind247` (6 kinds) + a per-need `lane: presence \| performance` (CFS ≡ 168) | 116 `LinkKind116` (4 kinds, ⊂ 247); CFS `FunctionLane`; 168 `evidenceSemantics`; path `featurePreferences` (→ lane presence, not checked) | 247 → 116 via `compileTo116` loses `not_sufficient_for` and `requires_condition` (phase247:141); the path decides the lane by store concept kind (phase253_request_advice.ts:62–71), CFS / 168 by a reviewed per-need mapping: path → lane loses "who decided" |
| D6 review status | Two fields: `needStatus: candidate \| confirmed \| experimental_unverified` and `knowledgeStatus: hypothesis \| method_reference \| reviewed \| evidence_supported` (247), with `proposed_unverified` ≡ hypothesis | need_interpretation `state`; 247 `Support247`; 128 `KnowledgeState128`; 172 `KnowledgeLevel172` (→ hypothesis); 173 `proposed_unreviewed` / `candidate_requires_specialist_review` (→ hypothesis) | 173 `ReviewRecord173` (`unverified_review_submission` has no 247 level: it would wrongly look "reviewed"); 56 `DecisionStatus` and 168 `NeedDisposition168` (dispositions / actions, not statuses: the action text is lost) |
| D7 question | 126 `Pending126` (kind, choices with kinds, optional, allowsFreeText, issueCode) + 172 `decisionImpact` + `resolves: needId \| constraintIndex` | 172 `ClarifyingQuestion172`; 56 `DecisionQuestion` (`stage` → impact class; `activates` → resolves); 100 `AdaptivePreferenceQuestion` (`swing_preference`); 253 `RequestConstraint253.question` (resolves = constraint) | path `Advice253.questions:string[]` and 248 `clarificationQuestions:string[]` (no kind, options, impact or link: these must be reconstructed from their producers) |
| D8 provenance | `{span, start, end, turnId?, sha256?}` for words + need_interpretation `PathStep[]` for inferences + `confirmationRef?` | 253 constraints; 165; 168; 172; 173 adapter; 125 (`matchedText`, no offsets: partial); 127 (`originTurnId`) | path needs (`needSpans.matched`, `expressed.span`: no offsets; paraphrase `~a+b` has no span, phase248:114); needs_discovery (answer ids only); 172 / 173 rule references (no `PathStep` kind for a code rule, need_interpretation.ts:37) |

---

## (b) Concrete incompatibilities a consolidation must resolve

**I-1. "don't need X" has four meanings.**

| Module | Meaning | Evidence |
|---|---|---|
| phase248 (path, need) | set aside, like indifference | phase248_advisory_journey.ts:346–349 |
| phase253_request_constraints (path, quantity) | preference "what would be enough" | phase253_request_constraints.ts:106–109, :147 |
| phase165 | `optional` | phase165_request_context_audit.ts:41–43 |
| phase125 | positive `requested_capability` / `required` | phase125:71, :84–87; [run]: "robot vacuum, I don't need a mop" → `requested_capability` |

- phase125's comment (:82–83) says "a preference, not necessarily a ban".

**I-2. "don't want X" / "without X".**
- **On the path:**
  - phase248 keeps the need ("a negated wish … still expresses a need", :347).
  - need_interpretation drops the negated feature from `features` (:145–146) and blocks inferences on its stem (:164–165).
- **Off the path:** it is an `excluded` requirement (125:86; 165:48–51; 168:145, `verify_feature_absent_for_exact_variant`) or a rejection (172:21).
- The path has no excluded-feature or negative-requirement slot. Its only exclusion is the category (phase248:260, :284–290).

**I-3. When a stated requirement may apply.**
- phase253 applies a clear stated limit at once (`stated_in_request`, "applied", :39–41; :9).
- phase168 requires a separate explicit confirmation event before a requirement is acted on (:26–27, :142).
- phase98 requires `confirmedHardRequirementReference` (:54–55).
- needs_discovery and CFS block all mandatory status until `confirmInterpretation` (CFS:251–252; needs_discovery.ts:141–142).
- One rule must be chosen: *stated is enough for a feasibility limit* versus *confirmation required*. The research doc §3.3 ("Only expressed or confirmed") allows both.

**I-4. `candidate` means two different things.**
- phase253 `candidate` = unclear, ask (:9, :41).
- phase127 `candidate` = every reading from text, confirmed never set (phase127:35, :169; the grep found no `'confirmed'` assignment).
- phase164 also writes `status:'candidate'` for 165 corrections (phase164:237).
- phase127 also passes its `goals` to Phase125 as `confirmedGoals` (phase127:139) but exports them as `candidateGoals` (:264). This is an internal contradiction in one module.

**I-5. The default role of a positive mention.**
- phase125 makes any non-negated `task` aspect `required` (:87).
- phase165 flags that as `required_strength_not_preserved` when no REQUIRED cue is present (:13, :128).
- A merged force field must not take 125 `required` as a requirement.

**I-6. `important` has two bases.**
- needs_discovery default `important` for unranked criteria (:123).
- phase168 `preferred` → `important` (:154).
- phase97 then enforces equality of importance across 56 and 96 (:123–124, `unconfirmed_priority_change`). A default could therefore be compared as if the user had stated it.

**I-7. Optional is lost in session state.**
- phase164 deletes an aspect corrected to `set_optional` from the session values (:236–238).
- It still reports `role:'optional'` in the output projection (:281).
- phase168 keeps `optional_not_requirement` (:141).
- The path has no optional value at all (phase253_request_constraints.ts:41, :45).

**I-8. The feature / outcome lane is decided by different authorities.**
- **On the path:** by store concept kind plus a regex cue (phase253_request_advice.ts:62–73), and a feature is never checked (:89).
- **In CFS / 168:** by a reviewed per-need mapping (CFS:32–43; 168:16–22), and a confirmed presence need *is* verified (168:143–146).
- The same "steam wand" would be an unchecked preference on the path and a presence requirement in 168.

**I-9. Relation kinds are lost to Phase116.**
- `compileTo116` maps `not_sufficient_for` and `requires_condition` to null (phase247:141).
- These are exactly the kinds the path uses for proxy rejection and comparability conditions (phase253_request_advice.ts:217, :219, :223).
- Any consolidation on the 116 model loses them.

**I-10. Sufficiency spelling.**
- `'establishes'` (assessment input, phase247:64, :74) vs `'established'` (derived state, :101, :106; consumed at phase253_request_advice.ts:201, :226).

**I-11. Two types named `QualitativeNeed`.**

| Module | Type | Evidence |
|---|---|---|
| phase96 | `{criterionId, importance, context, avoidAdverseFinding}` (a *force* record) | phase96_qualitative_review_evidence.ts:170–176 |
| qualitative_needs | `{aspects, facets, useContexts, conditions}` (a *content* record) | qualitative_needs.ts:16 |

- They are DISJOINT despite the identical name.

**I-12. Indifference vs rejection.**
- phase172 merges them in one boolean (:13–22) and treats "don't mind" as a rejection (:21).
- language_scope reads "I don't mind noise" as `indifferent` ([run]; the predicate "mind" is in quantity-knowledge.v3.json from :2809).

**I-13. Questions.**
- phase172 assigns decision impact by code rule (:137–151).
- phase126 / 127 forbid a "material" question without an independently reviewed impact projection (phase127:148–154).
- The path has neither: questions are plain strings with no cap (phase253_advice_contract.ts:49; phase253_request_advice.ts:131, :393–407; phase248:466–472).

**I-14. Granularity of evidence requirements.**
- needs_discovery holds one `requiredEvidence` string per criterion (:15).
- The path holds many measurements per outcome, each with its own conditions (phase253_request_advice.ts:221–230; S83 note in phase253_advice_contract.ts:186–188).
- needs_discovery's single string cannot hold the path's per-measurement conditions.

**I-15. The header claim of lab_needs_bridge does not match its code.**
- The header says "bridge from CONFIRMED needs" (lab_needs_bridge.ts:1).
- The code iterates every interpreted criterion regardless of `status` / `confirmInterpretation` (:131–135).
- Mapping it as "confirmed" would be wrong.

---

## (c) Duplicates on the request path of off-path representations

1. **Negation and indifference stance.**
   - On the path: language_scope `stanceAt` (language_scope.ts:83–91), consumed by phase248:348, need_interpretation:139–146, phase253_request_advice:427 and phase253_request_constraints (through quantityBound / negationAt, :14, :106–110).
   - Off-path duplicates: phase125 `roleFor` / cue lists (:69–88), phase165 context rules (:41–60), phase172 `locallyRejected172` (:13–22), phase113 `negation` regex (:106) and phase123 guard (:128–133).
   - Phase125 is runtime-reachable from the path, but its negation code runs there with empty aspects (phase248:396; phase253_request_constraints:152). Only its `unbound_negation` **hazard** reaches the path, through `frame.hazards` (phase248:399; phase125:221–222).
   - So two negation readers execute on every request: the shared scope and Phase125's hazard cue.
2. **"Candidate need not yet confirmed".**
   - On the path: need_interpretation `inferred[].state:'experimental_unverified'` (:38) and 253 `status:'candidate'` (:41).
   - Off path, the same idea: 172 `OutcomeCandidate172` (`confirmedByUser:false`), 173 `NeedHypothesis173`, 127 `SessionValue127` candidate, 168 `pending_user_confirmation`, 56 `scenario_inference` / `needs_confirmation`.
3. **Feature vs outcome separation.**
   - On the path: `featurePreferences` (phase253_request_advice.ts:62–90; contract:70) and need_interpretation `features` + note (:144–146).
   - These duplicate CFS `FunctionLane` (:17) and 168 `evidenceSemantics` (:19), with different deciding authority (I-8).
4. **Need → measurement → proxy / condition.**
   - On the path: `needKnowledge269` (phase253_request_advice.ts:207–232) and need_interpretation `evidencePlan` (:51, :179–181; it calls `needKnowledge269`).
   - These duplicate lab_needs_bridge `NeedToTestRule` (:33–46: measurement, protocol, conditions), needs_discovery `requiredEvidence` (:15) and 117 `ExactContract117` (:18–22).
   - The path version is the only one fed by the store.
5. **Goal / mechanism / failure graph.**
   - The path reads the 247 store graph through `relations247`, and need_interpretation's inference walks it (:87–126).
   - 172 / 173 hold a parallel *hand-coded* goal → dimension → mechanism → failure rule set (phase172:65–80; phase173 adapter:40–60), with its own hypothesis status (D6).
6. **Use context / owned equipment.**
   - On the path: QK `useContexts` (need_interpretation:47, :150–152), the 253 `*_alternative` / `*_constraint` id convention (phase253_request_advice.ts:204–206), and 253 `object:'other'` (phase253_request_constraints.ts:46, :216) for "a limit about another product".
   - These duplicate 173 `ownedEquipment` (:26), 125 `environment` / `environment_absent` (:15) and qualitative_needs `useContexts` (:24).
7. **Budget.** Read once by Phase125 `monetaryBudget` (phase125:96) and consumed twice on the path (phase248:397–398 as `need.budget`; phase253_request_constraints:152–159 as a `budget_max` constraint).
   - This is not an off-path duplicate, but one value has two path representations (Journey248 `need.budget` and `Constraint253`).
8. **Explicit vs implicit needs in evaluation only.**
   - `AdviceGold253` distinguishes `explicitNeeds` / `implicitNeeds` (contract:97).
   - The answer `Advice253.needs` is flat (:34), and the scorer pools them (:148).
   - The D1 split that need_interpretation computes (`expressed` / `inferred`) is not what the contract scores.
