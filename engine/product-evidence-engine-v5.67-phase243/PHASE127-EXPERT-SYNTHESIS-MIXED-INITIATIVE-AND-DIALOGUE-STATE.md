# Product Evidence Engine — Phase 127: integrating ambiguity discovery, clarifications and conversation state

**Date:** 11 October 2026  
**Software:** v4.51, research-only additive module; cumulative baseline v4.50 (Phase 126).  
**Evidence-status:** original scientific/peer-reviewed article abstracts and publisher metadata checked online; method implications distinguished from our engineering proposals. Test inputs constructed by the developer and **not** a blinded or user study. No automatic public-web product ranking is authorized.

## Executive decision

A consumer query is not just a flat intent label; it may contain multiple goals, hard constraints, contextual conditions, comparison referents and unresolved alternative meanings. Two existing capabilities—the ambiguity gate of Phase 111 and the one-question controller of Phase 126—must share one evolving dialogue state. Missing expert product measurements must trigger **research**, not a question answered by the consumer. A meaningful, accurately framed **user clarification** is appropriate if independently investigated interpretations have different feasible-product sets, decision-critical constraints or sufficiently different winners. Ask at most one question, permit free-text, comparison of both alternatives and skip; keep all previous grounded restrictions scoped to the conversation. The user can later correct a previous answer.

**Boundary:** the Phase 127 implementation discovers only ambiguity hypotheses recognized against a reviewed, category-specific descriptor schema. It does NOT generate arbitrary new meanings, verify original source measurements, calculate probabilistic value of information or autonomously authenticate reviewed scenario projections. Those are additional research tasks, not hidden accomplishments.

## Primary literature and what it actually supports

1. **Rastogi et al. (AAAI 2020), _Towards Scalable Multi-Domain Conversational Agents: The Schema-Guided Dialogue Dataset_.** Published study describes schema-driven intents and slots, over 16,000 conversations spanning 16 domains, and tests generalization to unseen services. **Implication:** the category's task/goal schema is a more scalable basis for new requests than an ever-growing fixed keyword list. **Limit:** it does not validate our hand-coded parser, nor make open-domain comprehension automatic. https://ojs.aaai.org/index.php/AAAI/article/view/6394
2. **Lee et al. (AAAI 2022), _SGD-X: A Benchmark for Robust Generalization in Schema-Guided Dialogue Systems_.** Semantically equivalent schema descriptions can change state-tracking accuracy. **Implication:** freeze diverse paraphrases; test schema sensitivity and multilingual reformulations rather than counting only code-unit tests. https://ojs.aaai.org/index.php/AAAI/article/view/21341
3. **Liao et al. (TACL 2021), _Dialogue State Tracking with Incremental Reasoning_.** Models gradually refine state across dialogue turns and with back-end data. **Implication:** preserve provenance of user goals and corrections; don't repeatedly parse the entire conversation as unstructured text at every turn. **Limit:** their empirically tested neural method is not the one implemented here. https://aclanthology.org/2021.tacl-1.34/
4. **Mass et al. (DialDoc/ACL 2022), _Conversational Search with Mixed-Initiative: Asking Good Clarification Questions backed-up by Passage Retrieval_.** Demonstrates question selection in conversation with evidence passages in open-domain search and customer support. **Implication:** source-retrieval results and clarification choice should interact, instead of treating a user question as the universal first action. **Limit:** trained retrieval/ranking method differs from this module. https://aclanthology.org/2022.dialdoc-1.7/
5. **Rahmani et al. (Findings EACL 2024), _Clarifying the Path to User Satisfaction_.** Analysis finds specificity and aspects of ambiguity useful in predicting satisfaction; poor questions can harm. **Implication:** ask a precise, short, actionable question only when helpful. Their published classifier improvements do not translate into effect-size predictions for our product. https://aclanthology.org/2024.findings-eacl.84/
6. **Viappiani & Boutilier (Artificial Intelligence 2020), _On the Equivalence of Optimal Recommendation Sets and Myopically Optimal Query Sets_.** Explicitly discusses *expected value of information* of preference-elicitation questions and the cost of asking. **Implication:** in future, rank candidate clarifications by expected improvement in the downstream purchase decision minus user burden, not by linguistic uncertainty alone. **Limit:** our code only implements a conservative material-impact gate, not an estimated utility function. https://doi.org/10.1016/j.artint.2020.103328 ; author record: https://research.google/pubs/on-the-equivalence-of-optimal-recommendation-sets-and-myopically-optimal-query-sets/
7. **Ye et al. (EMNLP Industry 2025), _ProductAgent: Benchmarking Conversational Product Search Agent with Asking Clarification Questions_.** Actual product-search closed-loop example: dialogue memory, candidate-product statistics, strategic questions and retrieval. Reports progress in a benchmark of 2,000 **automatically generated sessions with simulated users**. **Implication:** benchmark iterative retrieval + dialogue + product selection, but do not treat simulated successes as proof of human usability or verified expert measurements. The published implementation uses LLMs, which is NOT a reason our project must outsource its decision logic. https://aclanthology.org/2025.emnlp-industry.25/
8. **Zhang et al. (ACL 2024), _CLAMBER: A Benchmark of Identifying and Clarifying Ambiguous Information Needs in Large Language Models_.** 12,000-case ambiguity dataset; reports persistent problems with ambiguity detection and question quality even in tested LLMs. **Implication:** an LLM alone cannot be designated an ambiguity oracle. Require held-out measurement and explicit provenance boundaries. https://aclanthology.org/2024.acl-long.578/
9. **Jannach et al. (Artificial Intelligence Review, 2023), _Evaluating Conversational Recommender Systems_.** Survey recommends holistic evaluation beyond component-only test accuracy, including user-facing metrics. **Implication:** measure completion and unnecessary question rates, not only classifier labels. https://link.springer.com/article/10.1007/s10462-022-10229-x
10. **Advances and challenges in conversational recommender systems: A survey (AI Open, 2021).** Differentiates asking-vs-recommending policies, multi-turn state, over-questioning and uncertainty. **Implication:** conversational intervention should be selective; users seeking general recommendations should not be forced through a questionnaire. https://doi.org/10.1016/j.aiopen.2021.06.002
11. **Ziegfeld, Di Scala & Cremers (Computer Speech & Language, 2025), _The effect of preference elicitation methods on the user experience in conversational recommender systems_.** Both elicitation method and recommendation satisfaction influence the user experience. **Implication:** selectable choices + optional free text are experimental design choices requiring user testing, not validated optimum for our users. https://doi.org/10.1016/j.csl.2024.101696
12. **Kumar & Black (ACL 2020), _ClarQ_.** ~2 million clarification examples from Stack Exchange across 173 domains. **Implication:** offers an external benchmark/research corpus, but example volume is not a guarantee of semantically reviewed consumer-product decisions. https://aclanthology.org/2020.acl-main.651/

## Architecture: a closed-loop *decision policy*, not an interrogation

```
USER UTTERANCE + CONFIRMED SESSION CONTEXT
   -> Phase125 composed hypothesis (goals, negations, environment, category, budget)
   -> Phase127 domain-reviewed ambiguity hypothesis discovery
   -> Phase111 alternative consequence check USING reviewed product projections
       |-- Unknown meaning/product outcomes -> acquire/inspect evidence
       |-- Alternatives lead to same eligible set/constraints/winner -> do not ask
       |-- Meaningful difference verified -> Phase126 asks one optional question
       |-- General query without material ambiguity -> continue research
   -> Phase127 append-only scoped dialogue state
       |-- chosen answer -> store scoped meaning with turn provenance
       |-- show both -> separate comparison branch, not combined hard requirements
       |-- free-text -> fresh semantic review (not silently adopted)
       |-- skipped -> no inferred preference
       |-- explicit correction -> replace named meaning and log event
   -> independent product evidence/ranking review [NOT IMPLEMENTED HERE]
```

**Evidence and dialogue must not contaminate each other.** A user can specify a strict need or pick a reading, but cannot provide independent measurements of a robot merely by answering a choice. Source facts stay under the canonical source data (earlier Phase108+); Phase127 only stores conversation-specific hypotheses and choices.

### Four important situations

1. **“Qual è il miglior robot?”** Valid broad request; look for comparable general-purpose robot options, no artificial “aspirazione o lavaggio?” gate. Optional secondary lenses can show best performance, best-value and autonomy independently when evidence exists.
2. **“Cerco robot che salgano gli scalini.”** A reviewed category schema can flag “soglia singola” versus “scala completa”; it **must first investigate** consequences or verified candidate sets. A general “8.8 cm double threshold” sales number is not stair-climbing evidence. Only when consequence estimates are separately reviewed can it ask one question offering two readings, both, free text or skip.
3. **“Quali robot non richiedono interventi?”** Missing autonomous-use observations should initiate evidence acquisition; do not ask the shopper to fill the missing robot measurements. Context can later support a preference tradeoff such as more cleaning quality vs less maintenance, but only after those tradeoffs are measured.
4. **“Which one would you choose?”** Ground the pronoun to a previously *presented* and verified candidate set; otherwise ask for models. Do not invent antecedents from arbitrary historical mentions.

### User revisions and provenance

- **User-confirmed reading**: scoped to an issue and category; the event records the selected reviewed reading identifier, not modified product facts.
- **Free-text**: records a redacted/hash reference and triggers an interpretation step; no automatic hard constraint.
- **Candidate aspect values**: current Phase125 detections retain `status=candidate` and `originTurnId`; they must not be used for irreversible product screening without independent confirmation of semantic scope.
- **Contextual product set**: can be registered only after it is presented to the user with a source-snapshot identifier. Caller attestations are not cryptographic proof; a production server requires authorization and transactional write controls.
- **Correction**: a later explicit user correction can replace the earlier reading while retaining an audit event. The original value remains visible through the history policy if an authorized log is retained.
- **New topic**: active pending question may be dismissed; domain switches must not leak old category constraints.

## Implementation in v4.51

- `src/phase127_stateful_clarification.ts`: internal schema-bound ambiguity hypothesis detection; safe Phase111+Phase126 handoff; session-scoped values, goals, budget, Phase100 swing-preference receipts, selected reading, question history and question ID; response/reply/skip/both handling; explicit corrections; `registerPresentedCandidates127` for bounded pronoun referents; session JSON round-tripping; duplicate-turn and stale-question checks; no ranking authority.
- `tests/phase127_stateful_clarification.test.ts`: 27 constructed tests of multi-turn continuation and failure cases, including no implicit general clarification, unsupported ambiguity research, option identity, no invented winner, negative constraints, correction, replay, unrelated sessions and grounded pronouns.
- `README.md`, `package.json` updated cumulatively. Existing Phase100/111/125/126 modules retained and reused, no new SaaS/LLM.

## Open scientific and engineering gaps / what must NOT be claimed

1. **Open-domain semantic discovery** remains unproven. A category alias + reviewed trigger only finds anticipated ambiguity classes; multilingual natural language and novel implied meanings remain difficult. This module cannot produce its own schema or generalized alternatives from arbitrary requests.
2. **Decision impact is supplied**, with a reviewer identifier and snapshot string. These are checked for shape and identity consistency but NOT authenticated by a signed, revision-pinned original expert data store. The gate is only as sound as the upstream projection. Do not claim autonomous evidence-based ambiguity discovery.
3. **Question value** is an ordinal materiality condition, NOT Bayesian expected value of information. No calibrated user effort penalty, uncertainty distribution, downstream gain, preference stability or A/B test has been established.
4. **Conversation persistence** is a serializable snapshot with history digests, not a deployed atomic database, multi-user auth, cryptographic tamper-proof ledger, consent system or privacy retention policy.
5. **No real consumer-product outcome measurements** were gathered or validated in this phase. There is no autonomous market-wide ranking or full original-source pipeline demonstrated.
6. **No independent multi-turn corpus** has been scored in this phase. Constructed test assertions can be strong implementation checks without estimating actual accuracy.
7. **Cognitive cost of UI choice style:** “show both” can be preferable to forcing a binary commitment. A multi-select control is useful only when answers describe independently combinable needs, not mutually exclusive meanings. An optional free-text reply must be understood on its own merits, not mapped to the first option.
8. **Source contamination and personalization** remain explicit red-line boundaries. The product evidence ledger cannot be changed by dialogue or question order. Semantic-equivalent user goals under same snapshots must yield identical rankings.

## Next verification design (pre-register BEFORE improving on held-out examples)

- Freeze a separately collected and multi-person adjudicated Italian+English multi-turn set across robot-vacuum tasks, unfamiliar product categories, open-ended preferences, elliptical references, contradictions and corrections. Distinguish linguistic ambiguity vs lack of evidence vs lack of preference.
- Annotate each turn: material viable readings, unchanged constraints, needed source evidence, correct action (research/ask/compare/answer/abstain), question quality, expected candidate-set impact, and correct next state.
- Measure **state slot precision/recall**, false hard-constraint assignment, category leakage, wrong-reference rate, question precision/recall on materially decision-changing ambiguity, unnecessary questions per completed task, correction survival, forced-question rate, total turns to appropriate recommendation and user effort.
- On original expert reviews, evaluate actual impact of asking: **downstream eligibility/top-k/regret** and realized benefit over simply presenting two scenarios; include a no-question baseline. Test sensitivity to option wording/order, language variation, unknown products and product-source misattribution.
- Compare in-house parser with a small reproducible local model **only if** failures persist on held-out data, with privacy, energy, cost, accuracy, latency and auditability as first-class factors. All product facts and ranking remain internally controlled regardless of interpretation implementation.

## Verification declaration

The included tests use developer-built example requests, domains and placeholder robot identifiers, NOT newly measured robot products. Results in `PHASE127-RELEASE-VERIFICATION.json` list exact completed suites, caveats and file preservation. Claim **native mixed-initiative dialogue control with structured context** only, not autonomous general reasoning.
