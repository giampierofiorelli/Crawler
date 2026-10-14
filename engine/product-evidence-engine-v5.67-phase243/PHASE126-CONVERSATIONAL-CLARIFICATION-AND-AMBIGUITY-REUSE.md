# Product Evidence Engine — Phase 126: Decision-relevant conversational clarification

**Date:** 11 October 2026  
**Base:** cumulative v4.49, Phase 125  
**Release:** v4.50, Phase 126  
**Status:** research-sidecar dialogue controller, not deployed conversational UI, not a validated open-domain interpreter, not a product-ranking release.

## Executive decision

The user should be able to ask *generally* for the best robot, the best value-for-money robot, or the robot requiring least human intervention, without answering a questionnaire. The engine first recovers verified conversation context, distinguishes functional goals and quality criteria, identifies what evidence it needs, and performs research where evidence is absent. It interrupts with a **single, consequential, optional clarification** only when distinct plausible interpretations can materially change what is eligible, what is considered mandatory, or which candidate would be chosen, and the ambiguity has been independently checked. Prefer a short multiple-choice prompt (not a multi-field form), an alternative-comparison choice where meaningful, and free-text replies. Unknown user preferences and missing source measurements are different problems: ask only about the former. Answers affect a **query-specific decision view**, never permanent source facts.

**This is an extension of existing work, not a new ambiguity architecture.** The Phase 111 gate (`gateRequest111`) judges material reading differences; Phase 100's `assessAdaptiveSwingPreferences` can supply one bounded, grounded swing question when independently reviewed alternatives are underdetermined and the user explicitly approves exploration; Phase 125 supplies the candidate multi-goal query frame and verified conversational reference requirements. Phase 120 says explicitly general requests do not require a preliminary task-scope question. Existing Phase 101/105/107 knowledge, provenance and recommender calculations remain unchanged.

## Evidence review and applicability

1. Lei, He, de Rijke & Chua (SIGIR 2020), *Conversational Recommendation: Formulation, Methods, and Evaluation*, discusses mixed-initiative question versus recommendation decisions and user fatigue from excessive turns: https://staff.fnwi.uva.nl/m.derijke/wp-content/papercite-data/pdf/lei-2020-conversational.pdf
2. Aliannejadi et al. (CIKM 2021), *Analysing mixed initiatives and search strategies during conversational search*: on 49 TREC WebTrack topics, clarification-first and feedback-after strategies perform differently; their analysis does **not** supply a universally optimal policy for product search: https://www.microsoft.com/en-us/research/publication/analysing-mixed-initiatives-and-search-strategies-during-conversational-search/
3. Mass et al. (DialDoc/ACL 2022), *Asking Good Clarification Questions backed-up by Passage Retrieval*: context and evidence passages can improve candidate question selection; the method uses trained language models, whereas the Phase126 component does not claim that empirical ability: https://aclanthology.org/2022.dialdoc-1.7/
4. Ziegfeld, Di Scala & Cremers (Computer Speech & Language 2025), *The effect of preference elicitation methods on the user experience in conversational recommender systems*: method of elicitation and satisfaction influence user experience, so interaction quality must be measured alongside retrieval/ranking: https://doi.org/10.1016/j.csl.2024.101696
5. Zhang et al. (ACM TOIS 2025), *Vague Preference Policy Learning for Conversational Recommendation*: vague positive/negative responses should not always be treated as strict candidate-removing constraints; this supports cautious handling of “non so”, ambiguous acceptance/rejection and exploratory comparisons: https://doi.org/10.1145/3717831
6. Ye et al. (EMNLP Industry 2025), *ProductAgent: Benchmarking Conversational Product Search Agent with Asking Clarification Questions*: benchmark for product clarification through multi-turn questions and retrieved candidates, mostly using LLM tools; provides a useful **evaluation comparison** rather than a mandatory architecture or reason to outsource ours: https://aclanthology.org/2025.emnlp-industry.25/
7. UK Government Analysis Function, *An Introductory Guide to Multi-Criteria Decision Analysis*: relative value cannot be extracted reliably by simply asking which *attribute label* is most important; differences from best to worst outcomes must be considered. This is why the existing Phase100 swing question is used rather than a forced “importance weight” field: https://analysisfunction.civilservice.gov.uk/policy-store/an-introductory-guide-to-mcda/
8. Xia, Zhang & Wang (arXiv preprint, July 2026), *When and How to Ask*: proposes stage-aware choice of whether and how to elicit preferences, as **preliminary** external research, not a verified Phase126 effect size: https://arxiv.org/abs/2607.06765

These sources support the interaction *design direction*, not proven accuracy of Phase126. No user trial has been conducted on this implementation.

## Native decision contract

| Situation | Decision | Why |
|---|---|---|
| “Qual è il miglior robot?” | Research and compare general viable task families, with performance and value perspectives | A general request is legitimate; no invented personal scope |
| “Quali richiedono meno lavoro da parte mia?” | Search measurements of interventions and cleaning quality before asking preferences | Missing test results cannot be supplied by the user |
| “Sale gli scalini?” and independently checked alternatives mean *doorstep* vs *whole flight* with materially different candidates | Ask one choice: “piccole soglie” / “scala completa” / “mostrami entrambe” | Meaning changes eligible products |
| User has already been asked the same issue | Do not ask again; show both scenarios where grounded, otherwise investigate further | Avoid clarification loops |
| “Which one would you choose?” with no verified previous candidate set | One open question for the referred models | No invented antecedent |
| Unresolved negation/contradiction | Seek semantic review; do not automatically restrict products | Hard requirement misattachment is high impact |
| Reviewed equivalent alternatives lead to the same winner and same eligible set | Do not ask | The ambiguity is not material to current decision |
| Comparable original results insufficient | Continue source acquisition, no preference question | Consumer preferences do not fill missing product measurements |
| Phase100 independently verified tie across full-criterion swings and explicit exploration approval | Offer one reviewed pairwise swing question (3 answers) | Adaptive elicitation rather than arbitrary importance scores |

### Example interaction (hypothetical, not a product recommendation)

**User:** «Cerco un robot che salga gli scalini.»  
**Assistant, once alternatives have actually been established:** «Intendi piccoli gradini o soglie tra stanze, oppure una scala vera?»  
**Selectable responses:** «Piccoli gradini o soglie»; «Una scala completa»; «Mostrami entrambe le possibilità».  
The user can also answer in natural language or skip; the selected option creates a scoped *interpretation receipt*, not a new product claim. The example assumes the Phase111 alternatives were separately evaluated. The Phase126 controller itself does not discover or establish them.

### Implementation

- `src/phase126_conversational_clarification_policy.ts`: typed `decideDialogue126` and `processReply126`; integrates Phase111 material ambiguity decisions, Phase125 composed frame, optional trusted Phase100 swing proposal, distinct evidence status, one pending question, bounded options, reply IDs and scope, refusal to bind invented options, no repeated issue, free-text re-interpretation handoff.
- `tests/phase126_conversational_clarification_policy.test.ts`: 25 constructed cases for general versus specific asks, material/immaterial ambiguity, missing evidence, option binding, contradiction, missing referents, no repeated question, free-text, skip, provenance and Phase100 handoff.
- `package.json`: `test:phase126`, v4.50.0-phase126.
- `README.md`: cumulative phase status and links.

**Security and identity:** Phase111 option labels do *not* intrinsically map to reading IDs. Phase126 requires explicit caller-provided mappings to an independently checked Phase111 reading set before it will offer selectable interpretations. Replies must match the current question ID and a distinct answer turn, and incompatible modes (choice plus free text) fail. This only checks local structural consistency; it does not authenticate an end user's identity or a source URL. End-to-end session persistence and tamper-evident server-side receipts are still pending.

## Validation

- TypeScript build: passed.
- New Phase126 tests: **25/25 passed**.
- TypeScript cumulative regression: **1,325/1,325 passed** across **85** test files, in 11 bounded groups, excluding the two still-unverified Phase91/92 legacy test files. Not an exhaustive project suite claim.
- Python original-source test suite: **47/47 passed**.
- Python ingestion test suite: **21/21 passed**.
- All examples and option-to-reading bindings are **constructed** and **not blinded**; no real-user decision impact, user-effort, recommendation-quality or question-acceptance rate has been measured.
- No live crawling, expert source extraction, authenticated market ranking, deployed session memory or consumer app/UI is provided by Phase126.

## Necessary next validation

1. Evaluate an independently collected **multi-turn** corpus (including Italian and English) with human-adjudicated plausible readings, choice answers, free-text replies, corrections, and referents; freeze before changes to interpreter.
2. Measure question-trigger precision/recall on *material* ambiguity, unnecessary question rate, number of turns, task completion, refusal/skip handling, dropped constraints, contextual attribution and downstream top-k effects, including negative examples where a question worsens the outcome.
3. Connect verified Phase111 reading proposals and the Phase126 controller to the actual application session backend. Keep temporary preference decisions separate from query-neutral evidence memory.
4. Run permitted original expert-source retrieval, product attribution and measurement extraction: the decision controller cannot solve data scarcity by dialogue alone.
5. Establish whether single-choice versus multi-select is genuinely needed for a particular attribute; preserve “both” as a semantic alternative when appropriate, not an accidental pair of independent mandatory constraints.
6. Inspect bias: option labels or presentation order can influence answers. Do not claim our question selector is unbiased, optimally informative, or universally validated.
