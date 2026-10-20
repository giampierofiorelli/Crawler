# Rule admission: what knowledge_rules checks today, and what DMN/Drools, Z3 and fast-check would add

Owner direction (2026-10-20, verbatim in
`.claude/skills/pee-guided-learning/references/owner-rule-admission-2026-10-20.md`): "Prima confronterei i controlli già
disponibili in knowledge_rules.ts con le capacità di questi strumenti, scegliendo soltanto quelle che aggiungono un
vantaggio dimostrabile."

This is an assessment only. Nothing is implemented, installed or executed. Roadmap step: R3 (governance of
interpretation). It feeds the owner's design of the next consolidated intervention, together with the five items of the
S102 follow-up (`owner-review-s102-followup-2026-10-20.md`).

## 1. What knowledge_rules checks today (verified in `src/knowledge_rules.ts`)

| Check | What it actually does | Weakness |
|---|---|---|
| Constant head | the head field, value and tier are constants | sound |
| Declared vocabulary | fields, values and scopes must be declared | sound |
| Duplicates | `JSON.stringify([head, body])` equality | **textual only**: the same body with its conditions reordered, or a body that is a subset of another, is not seen |
| Contradictions | two rules with the same field and tier and different values must be declared in a contested group | **syntactic, and vacuous for explicit claims in os.3**: the contested groups are blanket (role explicit: 5 scopes × 6 values; nature explicit: 4 values; provenance explicit: 3 values; each inherited group: 5 scopes). Every pair is declared in advance, so the check cannot find an undeclared one. The S100 report's statement that contradictions are checked holds only outside these groups |
| Lifecycle (S102) | states, dates, reasons, evidence, successor exists, invariant guard | protects whatever is marked invariant, **but nothing checks whether a rule deserves the mark** (RQ08) |
| Tests | hand-written seeded property tests | no shrinking to a minimal case; no replayable counterexample record |

Missing entirely:
- semantic overlap (two bodies that can hold at once);
- subsumption (one rule never fires without the other);
- gaps (inputs no rule decides, within a declared scope);
- interval reasoning over numeric conditions;
- an admission record (who proposed a rule, from what, its definition, scope, assumptions, exceptions and counterexamples).

## 2. The three tools, judged by what they would add

### DMN / Drools: adopt the method, not the tool

- **What it offers.** Drools' decision-table static analysis (`kie-maven-plugin`, `ANALYZE_DECISION_TABLE`) reports
  gaps, overlaps, subsumption and conflicting rules. The algorithms come from Calvanese et al.:
  - BPM 2016: overlap and missing-rule detection over tables with numeric intervals;
  - Information Systems 2018: simplification;
  - TPLP 2019: Semantic DMN, the same checks with background knowledge.
- **The tool itself.** Java and Maven, and decision tables, not PEE's Datalog-style programs. It would be a parallel
  stack and a heavy dependency.
- **Demonstrable advantage.** The method fills exactly the missing checks in §1. Our rule bodies are conjunctions of
  conditions over finite declared vocabularies, so overlap, subsumption and gaps can be computed exactly in TypeScript
  inside `knowledge_rules`, in a few hundred lines. That would replace the blanket contested groups with contests the
  analysis finds.
- **Recommendation.** Implement the analysis in `knowledge_rules`. Do not install Drools.

### Z3: not now

- **What it offers.** z3-solver 5.3.1 on npm: MIT licence, 35.5 MB unpacked, one dependency, Node ≥ 16. It needs
  threads/SharedArrayBuffer, async calls and explicit `killThreads`. It decides whether constraint sets are
  satisfiable, impossible or redundant.
- **What PEE needs today.** Single-quantity bounds: "at least 4 L", "at most 4 L", "between". Compatibility, the most
  restrictive bound and a genuine contradiction (min > max on the same object and conditions) are exact interval
  arithmetic, which is a few lines of TypeScript and easier to test.
- **When it would earn its place.** Constraints across several quantities, for example CADR ≥ room volume × air changes,
  combined with other limits. Reconsider then, with an owner decision on the dependency.
- **Limit.** Z3 can prove that 4 L and 6 L minimums are compatible. It cannot say whether the user meant a requirement, a
  preference, a correction or two alternative scenarios. That is reading intent, not logic.

### fast-check: adopt as a test-only dependency, after an owner decision

- **What it offers.** fast-check 4.10.2: MIT licence, about 1.5 MB, one dependency (pure-rand), Node ≥ 12.17.
  - It generates cases and shrinks a failure to a minimal counterexample.
  - It records the seed and path of a failure, so the failure can be replayed exactly.
  - `fc.assert` throws, so it runs inside `node:test` unchanged.
- **Demonstrable advantage over today's seeded tests.**
  - Minimal counterexamples instead of large random ones.
  - A replayable seed and path that can be stored as admission evidence.
  - Metamorphic properties are easy to state. Examples: reordering request clauses must not change the requirements;
    adding an unrelated sentence must not change a reading.
- **Cost.** A devDependency only; nothing in the runtime path.
- **Recommendation.** Adopt, but the owner decides, because every new dependency needs an owner decision.

### None of the three decides scientific truth or user intent

- Formal checks show that rules are consistent and complete within a scope.
- Whether a definition is scientifically right, or whether a sentence states a requirement, a preference, a correction
  or a scenario, still needs evidence and validated reading.

## 3. Proposed admission process (for the owner's design)

| Step | Content | Executable evidence |
|---|---|---|
| Proposal | origin (research package, existing knowledge, document, failure); the rule; its intended consumers | admission record in the program file |
| Meaning | definition, scope, assumptions, exceptions, known counterexamples | each counterexample is a test |
| Classification | algorithmic, policy or invariant. An invariant names its kind (semantic, reliability, evidence integrity, authorisation) and a justification as a general property, not a development convenience | the owner's four examples as tests: a preference never becomes a requirement (semantic invariant); two different minimums are not a contradiction (RQ08 is wrong); two mandatory minimums on one object combine to the stricter one (logical rule, with assumptions); an unverifiable requirement never definitively excludes (reliability invariant) |
| Interactions | overlap, subsumption, gaps, precedence, the older rules involved | the §2 analysis at load time; failure blocks admission |
| Verification | positive, negative, metamorphic and generated cases; cases never seen during development | fast-check properties with stored seeds; a held-out check where one exists |
| Decision | active, experimental (runs in shadow, never decides), under review, rejected; with reason | lifecycle entry; a rejected rule is kept with its reason |

## 4. Proposed scope of the next intervention, in dependency order

1. **Admission record and invariant governance.**
   - Every invariant carries a kind and a justification.
   - RQ08 is reclassified (not an invariant) and superseded.
2. **Rule analysis** (overlap, subsumption, gaps) in `knowledge_rules`. It replaces the blanket contested groups with
   contests that the analysis finds and that are then explicitly declared.
3. **Request constraint semantics.**
   - Distinguish requirement, preference, correction and alternative scenario.
   - Track the object and the conditions of each constraint.
   - Reason over intervals.
   - The owner's examples become tests.
   - Where the scenario is unclear, ask a question rather than invent a preference.
4. **Generated tests (fast-check)**, if the owner approves the dependency.
5. **Census of the residual hardcoded policies** (negation scopes, applicability, clause boundaries, duplicate cue lists).
   Each gets a declarative plan where appropriate, and replaced code is actually retired.
6. **Store-wide re-derivation report.** Separate pages that can be re-read (content held, rights allowing) from pages
   whose content or rights are gone.
7. **Independent validation.**
   - Tables whose introductions state their origin.
   - New user requests.
   - Both preregistered, with sealed references.

**Stop conditions:**
- false product values or links to another product increase;
- any advice changes without an explained reason;
- a static check rejects a rule that was shown to be sound (the check is wrong, not the rule);
- any non-test dependency without an owner decision.

## Sources

- Drools documentation, decision-table analysis: <https://docs.drools.org/latest/drools-docs/drools/DMN/index.html>
- Calvanese, Dumas, Laurson, Maggi, Montali, Teinemaa, "Semantics and Analysis of DMN Decision Tables", BPM 2016:
  <https://link.springer.com/chapter/10.1007/978-3-319-45348-4_13>
- Calvanese et al., "Semantics, analysis and simplification of DMN decision tables", Information Systems 2018:
  <https://doi.org/10.1016/j.is.2018.01.007>
- Calvanese, Montali, Dumas, Maggi, "Semantic DMN: Formalizing and Reasoning About Decisions in the Presence of
  Background Knowledge", TPLP 2019: <https://doi.org/10.1017/S1471068419000269>
- Z3 JavaScript bindings: <https://www.npmjs.com/package/z3-solver>; <https://github.com/Z3Prover/z3>
- fast-check: <https://fast-check.dev/>; <https://www.npmjs.com/package/fast-check>
- Segura et al., "A Survey on Metamorphic Testing", IEEE TSE 2016: <https://doi.org/10.1109/TSE.2016.2532875>
