# Product Evidence Engine — Phase 164 / v4.88
## User-request journey integration (English-first, research-only)

**Status:** implementation and deterministic regression complete; **not** natural-language generalization, independently validated user intent, independent expert-product evaluation, or production recommendation readiness.

## Why this phase

The user explicitly deferred the pretrained GLiNER2.5 checkpoint/desktop host until returning to a computer, while insisting development must continue elsewhere: user questions, conversational context, evidence, product recommendations, category expansion, and web research remain incomplete. This phase addresses the **user-request-to-research** bridge rather than adding yet another neural test notebook.

## Existing architecture reused

| Prior work | Used in this phase | Important limitation |
|---|---|---|
| Phase 125 `composeQuestion125` | Lexically grounded, schema-bounded requests: aspects, provisional goals, prices and hazards | Bounded grammar, not arbitrary English understanding |
| Phase 126 `decideDialogue126` | Material clarification and one-question guard | Evidence impact must be separately reviewed |
| Phase 127 `advanceConversation127`, `registerPresentedCandidates127` | Session state, immutable event trail, presented-candidate references | UI presentation assertion is not cryptographic proof |
| Phase 128 `compileCategoryKnowledge128` | A single derived category vocabulary, with ontology snapshots | Reviewed receipts are only structurally checked here |
| Phase 73 `planCategoryCapabilities` | New/unreviewed categories go to existing category cold-start research tasks | Planning does not itself perform web research |
| Phase 122 `retrieveComposedCandidates125` / local BM25 | Source-passage candidate discovery when its narrow guards are met | Passage rights assertion is not evidence of editorial independence or original-source authenticity |
| Phase 112 invariance discipline | Same category snapshot and scope preserved, no unauthorized rank | **No** general semantic-equivalence proof or new ranking engine built here |

## New working code

- `src/phase164_user_request_journey.ts`: new category-aware **bounded coordinator**, with `newRequestSession164`, `advanceUserRequest164`, `registerUserCandidates164` and `resolveBudgetRevision164`.
- `src/phase127_stateful_clarification.ts`: adds a user-confirmed, auditable budget revision. Until confirmation, the old budget is retained. A revision may be declined and cannot be replayed.
- `src/index.ts`: exports new review-only coordinator functions; public ranking remains prohibited.
- `scripts/phase164-request-journey.mjs`: offline batch driver for session-aware JSON events; does not require a GPU, a desktop, an LLM, internet or the user's iPhone.
- `research/phase164/PHASE164-CONSTRUCTED-CATEGORY-REGISTRY.json` and `research/phase164/PHASE164-CONSTRUCTED-QUESTION-JOURNEYS.json`: **explicitly constructed test fixtures** for six product categories, plus one research-only new category. The synthetic `fixture_only_not_authenticated` review receipts do **NOT** validate any category ontology, source rights or product performance. NEVER promote these fixture receipts into production.
- `tests/phase164_user_request_journey.test.ts`: 21 targeted correctness/safety tests.

## What the coordinator now handles

1. **Nested category names** by individual text occurrences. An `air fryer` is not mistaken for the separate `fryer` category merely because its phrase contains "fryer"; `air fryer or fryer` is correctly treated as involving two categories.
2. **Scoped followups** reuse candidate requirements and previous candidate goals without declaring independently verified semantics. Standalone unrelated questions cannot automatically inherit the prior product category.
3. **Category changes** start a fresh dialogue epoch; old environment, budget and source-policy preferences do not bleed into another product category.
4. **Budgets** require explicit currency/amount to extract a numerical ceiling. "Price doesn't matter" in a session that already has a price ceiling triggers a pending, explicitly confirmed revision; a "yes" and "no" use auditable turn events. No silently inherited obsolete budget.
5. **Source restrictions**, e.g. "only expert reviews, no customer reviews", become explicit evidence-research obligations scoped to the current category. The existing local passage type **cannot prove** independent editorial role, so professional-only queries intentionally do not retrieve those unqualified passages.
6. **Unknown capabilities or contexts**, such as "for a narrow kitchen", are retained as unresolved phrases and research obligations, never silently dropped to make a superficially valid answer.
7. **Deictic comparisons** such as "which one is better?" require a grounded displayed candidate set, or ask for the referents; no phantom winner is chosen.
8. **Unreviewed product categories** (e.g. washing machines in the constructed catalog) are routed to the already implemented category identity / research / methods / rights / source-acquisition capability plan, not treated as already understood.
9. **Tamper/replay/schema checks**: history entries are hash-chained, turn IDs cannot be replayed, and a changed category ontology blocks reuse of the previous session until reconciliation. This is local integrity checking, not secure identity attestation.

## Reproducible evaluation performed here

- `npm run build` — passed.
- `npm run test:phase164` — **21/21** targeted TypeScript tests passed.
- Complete eligible TypeScript regression: **2,113 passed across 123 files** (11 separately reported groups, zero failures). The legacy Phase91/92 suites were excluded as in prior releases; this is not a claim that those legacy suites passed.
- Python unchanged corpus: **103 passed** (47 in `primary_sources`, 21 in `ingestion`, 35 in `tests-python`). `primary_sources` needs package-style invocation because one test uses relative imports; running a bare file-discovery command there produces a test harness import error.
- The constructed JSON demo: **13/13 events processed without runtime error**, across independent sessions; includes a three-turn air-fryer conversation, a switch to coffee machines, confirmed removal of a price limit, ambiguous traditional-vs-air fryer, unresolved narrow-fridge context, a short comparison missing candidates, steamer, and an unreviewed washing machine category.

The 13/13 figure **measures execution success, not semantic correctness**. The 20 test examples and the six-category pilot metadata are all developer-constructed, not independently collected/adjudicated user queries.

### Re-run on a trusted local environment

```sh
npm run build
npm run test:phase164
node scripts/phase164-request-journey.mjs \
  --registry research/phase164/PHASE164-CONSTRUCTED-CATEGORY-REGISTRY.json \
  --turns research/phase164/PHASE164-CONSTRUCTED-QUESTION-JOURNEYS.json \
  --out /tmp/phase164-fresh-report.json
```

The driver refuses to overwrite an existing output. It stores question digests, extracted phrases, scoped decision actions and audit metadata. User-request text should be treated as potentially personal; run with authorized local data. The sample passes **no product ratings, measured tests, actual ranking, or manufacturer endorsements**.

## Known limitations / what remains to build

- **User language beyond limited schema terms:** no independent blind benchmark of actual organic queries, coreference, subtle negation, degree, priority, contradictory personal constraints, source policies and multi-category comparison. Only English-first partial coverage; even English is not generally solved.
- **User-goal authority:** inherited goals are *candidate carryovers*, not confirmed user intents; the ranking-equivalence guarantee applies only to previously independently verified canonical intents and identical evidence snapshots.
- **Ranking/recommendation engine:** this coordinator intentionally outputs `rankingAuthorized:false` and `publicRecommendationAuthorized:false` in every branch. The existing deterministic ranking infrastructure must later be connected through independent intent, eligibility, evidence and comparability gates; this phase did not claim a finished recommendation engine.
- **Evidence pipeline:** no live authorized web crawling, no validated expert editorial source-role classifier for strict source preferences, no checked cross-product protocols, original measurements, calibrated performance policies or current market universe supplied here. BM25 candidate matches are not scientific facts.
- **Category knowledge:** six diagnostic category definitions have fake *engineering-fixture* review receipts. Real category research and source/rights review are separate tasks. Backlog includes traditional fryers, air fryers, toasters, coffee machines, food steamers, and broader appliances without assuming all are already research-complete.
- **Neural checkpoint** and independent full-review evaluation remain blocked by lack of a trusted reachable execution host; do not return to repetitive 3-sentence iPhone notebook loops. GLiNER2.5 has not been run in this phase.
- **Product/UX:** no production website, payment, affiliate attribution, product selection UI or finished shopping answer in this phase.

## Next high-value work (Phase165+)

1. Assemble a *rights-cleared, independently annotated* **real-user question benchmark** covering generic best, single-person suitability, must-have/exclusion, source restrictions, conflicting needs, unknown categories, comparison references, followup edits, and multiple intents. Define adjudication and uncertainty taxonomy before tuning. Do not report constructed fixture hit rates as real-world success.
2. Join verified user-intent requirements to the already existing source-acquisition/qualification and comparison engine. Prevent incomplete coverage, missing qualifying independent tests or method mismatches from yielding unwarranted "best overall" recommendations.
3. Build preference/constraint lifecycle tests with actual category ontology versions and independently verified semantic equivalence; measure whether paraphrased user questions produce the same complete ranking **only after** verified equivalence and identical candidate/evidence/policy snapshots.
4. Continue studying available permissively licensed upstream algorithms where they demonstrate a material benefit, without bundling full repos or adding unreviewed deployment dependencies.
5. Revisit full pretrained checkpoint execution only when there is a trusted development host, not as a prerequisite for the preceding tasks.

## Distribution / compliance

All Phase163 historical files remain in the cumulative ZIP. No model weights or complete external GitHub ZIPs are included. Existing mandatory license files/attribution remain internal to technical assets; no third-party public UI credits were added. No scientific DB writes, identity merges, or changes to product ranking were authorized.
