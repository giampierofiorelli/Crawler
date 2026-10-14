# Phase 134 — From four uploaded AI codebases and TypeSafe documentation to one *native* English-first PEE evidence screen

**Date:** 2026-10-11  
**Build:** Product Evidence Engine v4.58 / Phase 134  
**Parent:** v4.57 / Phase 133 (untouched user source ZIPs remain outside runtime/package)  
**Decision:** No GLiNER2, medSpaCy, DeepKE, Snorkel or TypeSafe component is installed, bundled or called. All new runtime code is independently written TypeScript. No new dependency, Python model runtime, weights, remote API, paid licensing, or server service.

## 1. Answer to the user's concern: what was interrupted?

The previous work **inspected** four uploaded source code archives and TypeSafe online documentation, produced studies, but **did not implement** the proposed integrated context/evidence system in the cumulative v4.57. The source audits and ideas existed on paper; the runtime stayed unchanged. Phase 134 starts to close that gap. It does **not** assert that all the techniques from the third-party projects are now implemented or that we match their neural models.

| Reference | Actual relevant technical lesson | Phase 134 implementation | NOT yet done |
|---|---|---|---|
| medSpaCy | Direction, scope, termination and typing of assertion modifiers (`medspacy/context/context_rule.py`, `context_modifier.py`, `context_graph.py`) | Typed modifier records with original text offsets, bounded clause scope, explicit pseudo/ambiguous negation, lack-of-proof versus direct negative, uncertainty, hypothetical and claimant markers. | Dependency parsing, attachment of cues to arbitrary targets, genuine grammatical scope graph, reliable handling of quoted/sarcastic/long-range constructions. |
| DeepKE | Evidence is about entities, relations and documents, not isolated keywords (`example/re/docred` and related extraction pipelines) | Every hypothetical edge is pinned to source ID, original document ID, SHA-256 of source content, SHA-256 of original evidence span, both entity spans. Cross-sentence links **abstain** when there is no verified referent. | Trained document relation model, semantic coreference or legitimate cross-sentence inference; independent annotation of all entities. |
| Snorkel | Labeling signals can abstain, conflict and be correlated (`snorkel/labeling`, weak-supervision architecture) | Separate typed signal votes; track support/oppose/abstain; never count repeated IDs twice; count distinct *declared* families and expose contradictory votes. | Probabilistic label model, learned dependence structure, calibrated likelihood of correctness, actual retraining. Declared signal families are NOT guaranteed independent. |
| GLiNER2 | Schema-guided candidate relations, bounded alternative selection, explicit feasibility statuses (`gliner2/joint_ie/schema.py`, `candidates.py`, `optimizers/beam.py`) | Bounded 50-candidate set, deterministic ordering, duplicate-ID rejection, mutually incompatible same-span labels -> unresolved review, source integrity failure distinct from no candidate. | Neural candidate generation, learned spans, beam search, joint globally optimal entity/coreference resolution. |
| TypeSafe AI documentation | Atomic typed semantic judgements, evidence support vs contradiction, entity alignment, order-invariance diagnostics | Source/span proof separated from relation polarity, signal conflict, abstention and permission to promote. Stable ordering test. | No use of proprietary Jev (paid API); no proof of full entailment, calibrated scores, automated feature selection, or entity equivalence. |

These are adaptations of **ideas and algorithms**, not copies/translations of implementation source. New code contains no copied third-party source. Patent and license requirements must still be checked if any future direct implementation is incorporated.

## 2. What is actually added

- `src/phase134_atomic_context_evidence.ts`: `modifiersForPair134`, `auditSignals134`, `inspectAtomicCandidate134`, `inspectCandidateSet134`, `inspectLearnedProposal134`.
- `tests/phase134_atomic_context_evidence.test.ts`: 34 constructed regression assertions; source/digest mismatch, uncertainty, competing claims, no evidence vs evidence of absence, English contrast, cross-sentence abstention, manufacturer attribution, signal correlation and signal disagreement; also explicit link to Phase131 provenance checks.
- `scripts/evaluate-phase134.mjs`: eight developer-authored illustrative sentences and a reproducible output trace in `PHASE134-CONSTRUCTED-SCENARIO-TRACE.json`. The earlier five-scenario `PHASE134-ATOMIC-EVIDENCE-TRACE.json` is retained as an additional historical diagnostic.
- Research continuity: copies of the previously written source-code audits and TypeSafe documentation study in `research/phase134_reference_studies/`. **Third-party source ZIP archives are not inside the PEE distribution.**

**Existing code reuse:** Input `RelationDocument131` and `CandidateRelation131` are consumed through `inspectLearnedProposal134`; `assertRelationAnchoring131` must accept provenance *and* existing Phase132 scope gate before the Phase134 audit runs. Phase134 also distinguishes opposition-only weak signals from direct disagreement and checks English contracted negations such as “doesn't”. Nothing in this module writes to canonical category knowledge, changes source evidence, upgrades a model, or produces a ranking.

### Decision examples (developer-authored test data only)

- `No evidence establishes that the steam feature measures surface sterilization.` → reject a positive `measures` proposal. A candidate `not_evidence_of` may remain **quarantined**, meaning a passage *reports missing evidence*, NOT that steam is proven ineffective.
- `The manufacturer claims that its heater improves hygiene.` → candidate hypothesis with explicit manufacturer-attribution reason, not independent expert validation.
- `The fan setting may improve particulate capture.` → abstain: a modal claim is not a measured outcome.
- `The metric measures particles, but no study establishes gas removal.` → avoid attaching the second clause's negation to the first clause.
- `The robot has a heated dock. It removes more soil.` → abstain on cross-sentence connection because reference resolution has NOT been established.

**Honesty:** Some phenomena are currently handled by *abstention*, not by successful language understanding. Modifier-to-target attachment is limited to short English clauses. Generic 'not' statements, complex parentheticals, tables and multiparagraph references can still be misread. Cryptographic checking of a developer-provided source digest **does not prove the source is authentically from the website**; that must be established upstream. Signal agreement **does not mean scientific corroboration**.

## 3. Architecture and server effects

Input: independently obtained and rights-reviewed original document snapshot + tentative entity spans + relation hypothesis from local pipeline.  
Control: Phase131 anchoring and Phase132 guard for learned hypotheses → Phase134 bounded English contextual cues → separate weak-signal conflict audit → quarantine/review/abstain.  
Output: typed candidate status with offsets, source hashes and explicit `canonicalWriteAuthorized:false`, `rankingAuthorized:false`, `independentReviewRequired:true`.

- Runtime: existing Node/TypeScript, built-in `node:crypto` only. Added **0** runtime dependencies, **0** models and **0** background services. No Python interpreter requirement introduced by Phase134.
- Complexity: linear bounded scanning of each evidence snippet and at most 50 candidates; there is no GPU requirement. Deployment cost not benchmarked on production hardware.
- Updates to user interpretation: none automatically. Only knowledge reviewed under Phases128/129 can expand category schemas. A Phase134 hypothesis is **never** canonical vocabulary or product evidence on its own.
- Scope: English initially; the absence of Italian rules in medSpaCy does not matter to this phase.

## 4. Tests and what they do not prove

- New targeted: **34/34** in authored examples, including connection to Phase131.
- Grouped TypeScript suite: **1,496 passing tests across 93 test files**; see `PHASE134-REGRESSION-GROUPS.json` (excluding the same two legacy tests from Phase91/92 previously known for timeouts).
- Existing Python suites: **77 passing tests** = 47 primary + 21 ingestion + 9 Phase133 probe tests.
- Not performed: blinded original-professional-review annotation, cross-source / cross-category holdout, deployment CPU/memory benchmarks, model versus native benchmark, true web acquisition, scientific accuracy or false acceptance rate. No comparison to GLiNER2 model inference was possible from source ZIPs alone.

**Next necessary study:** obtain small rights-reviewed original English professional-review documents, freeze a source-disjoint annotated evaluation set BEFORE tuning, and compare Phase131+132 baseline versus Phase131+132+134 on: false accepts of positive claims under negation, precision at accepted coverage, false rejections, abstention by phenomenon, source identity mistakes, latency and memory. Phase134 cannot be switched into the canonical knowledge pipeline without those checks.

## 5. What remains from the source-learning roadmap

1. **Real contextual target scope**: detect whose claim is negated even if one clause has multiple entities and modifiers, rather than rejecting entire ambiguous clauses; use explicit finite-state/token graph before dependency parser decisions.
2. **Evidence document graph**: recover the same product/model variant over adjacent sentences, but require verifiable co-reference links; keep unresolved cases isolated and do not confuse manufacturer specifications with independent test observations.
3. **Weak supervision experiment**: label functions with abstention and correlation diagnostics; freeze held-out original samples and evaluate actual learning versus existing Phase131 model. Do not assume two heuristic rules are independent.
4. **Small joint constraint solver**: select compatible edges without fabricating missing features; distinguish zero candidates, incomplete context, contradictory evidence and infeasible constraints.
5. **E2E category growth**: hand scientific-review-approved evidence receipts to existing Phase128/129 category knowledge and confirm revised question understanding, with audit/invalidation. This is a separate authorization step.

## 6. Source links, exact upstream files and licensing context

- Uploaded GLiNER2 source: https://github.com/fastino-ai/GLiNER2 ; schema: https://github.com/fastino-ai/GLiNER2/tree/main/gliner2/joint_ie
- Uploaded medSpaCy source: https://github.com/medspacy/medspacy ; modifier: https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_modifier.py ; scope rule: https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_rule.py
- Uploaded DeepKE source: https://github.com/zjunlp/DeepKE ; research: https://arxiv.org/abs/2201.03335
- Uploaded Snorkel source: https://github.com/snorkel-team/snorkel ; paper: https://doi.org/10.14778/3157794.3157797
- TypeSafe documentation, **study only, no runtime**: https://docs.typesafe.ai/introduction ; https://docs.typesafe.ai/cookbooks/citation_check ; https://docs.typesafe.ai/cookbooks/entity_alignment ; https://docs.typesafe.ai/cookbooks/hierarchical_classification ; https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery
- Supporting document-relation research: DocRED https://aclanthology.org/P19-1074/ and DyGIE++ https://aclanthology.org/D19-1585/
- License obligations if future code is incorporated: MIT https://opensource.org/license/mit ; Apache 2.0 https://www.apache.org/licenses/LICENSE-2.0

Repository LICENSE declarations from the uploaded source studies: medSpaCy MIT, DeepKE MIT (example components may have different provenance), Snorkel Apache-2.0, GLiNER2 Apache-2.0; the TypeSafe API is not introduced. Licenses for model weights and downstream assets must be individually verified before adoption. This phase includes **no** vendor source code, weights or model data.

## 7. Conclusion

The user was correct that research on the uploaded repositories had stalled before integration. Phase134 now implements a **limited but real, executable** integrated evidence screening layer. It should **not** be described as a general semantic brain, a mature knowledge graph reasoner, a Snorkel implementation or a substitute for the pretrained GLiNER2 model. Further progression should be evidence-led rather than duplicating large external stacks.
