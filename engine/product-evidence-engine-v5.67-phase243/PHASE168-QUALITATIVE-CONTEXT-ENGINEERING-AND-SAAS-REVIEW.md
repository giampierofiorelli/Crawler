# Product Evidence Engine — Phase 168 / v4.92

**Status:** implemented and mechanically tested; **not** a validated end-to-end product recommender. Date: 2026-10-12.

## Executive finding

We can improve coverage **without** a new cloud AI dependency. The review-side Phase96 `assessQualitativeNeeds` was already carefully separated from measured lab facts, while the user-side Phase165 scope audit already distinguishes required, excluded, optional and preferred language. Phase168 adds the **missing guarded bridge**, rather than building a second sentiment interpreter. This is a study of constrained meaning and original sources, **not** a claim of general English understanding.

The principal engineering discovery is that **feature existence** and **feature quality** require fundamentally different evidence:

- `must have a steam wand` → an independently confirmed **feature-presence** check for the exact variant, not a positive reviewer sentiment about a wand.
- `without a steam wand` → a verified **feature-absence** check, not a low quality score.
- `ideally quiet` → an **important contextual performance** preference; adverse qualitative findings can matter, but cannot automatically exclude.
- `must have quiet operation` → an **essential performance criterion**, subject to explicit user confirmation and independent original test/context review. Relevant adverse evidence triggers a research hold, not exclusion.
- `no need for quick heat-up` → **optional**, never a required capability or implied product defect.
- `not too noisy` or incompatible modifier scopes → **clarify**, not polarity reversal.

## Code added and reused

- `src/phase168_qualitative_need_research_bridge.ts`: `planQualitativeNeedResearch168(...)` reuses **Phase164** source-question SHA and request-state history; **Phase165** aspect spans/negation/modifier scope; **Phase96** original-professional qualitative need assessment. No duplicate ABSA implementation, language model dependency or inference endpoint.
- `FacetMapping168` explicitly distinguishes `feature_presence` from `performance_quality`, scoped to a category and criterion. It has a *documentary* review reference, never an authenticated source check. Unmapped facets stay unresolved.
- User confirmations are a **separate input event**, keyed to exact request SHA, turn, aspect, meaning and exact phrase; wrong-turn, changed-question, missing aspect and contradictory meaning are refused. Even valid-looking events remain *documentary assertions* until upstream user-authenticated confirmation exists.
- Source observations retain Phase96 quarantine and are screened by **exact variant**, reviewer-controlled criterion, context and source digest. Missing original-test reviews, mismatched context, method uncertainty and contradictory findings remain visible. No raw article text copied into the diagnostic.
- The result explicitly reports `publicationAuthorized:false`, `rankingAuthorized:false`, `candidateOnly:true`, `independentUserConfirmationAuthentication:false`, `independentlyAuthenticatedReviewEvidence:false`; the Phase97/99 noncompensatory eligibility or public recommender is **not** called.
- `tests/phase168_qualitative_need_research_bridge.test.ts` 22 new constructed engineering tests: source/variant mixing, documentary user confirmation, unavailable reviews, adverse evidence, negative/optional language, exact offsets, mixed quantitative/qualitative requirements, contradictory context and unsafe source-polarity shortcuts.
- `scripts/phase168-qualitative-preview.mjs` generates `evaluation/phase168/PHASE168-CONSTRUCTED-QUALITATIVE-RESEARCH.json` from **four constructed** request-and-review fixtures. Output is NOT ground truth, measured accuracy, real professional tests or a public recommendation.

**Source-derived engineering baseline:** Phase96, Phase97, Phase125, Phase128, Phase154, Phase164, Phase165, Phase166 and Phase167 modules in the supplied v4.91 archive. Those modules were inspected before this implementation; see prior phase reports for their own provenance and validation boundaries.

## Targeted expert research (external; linked primary sources)

1. **Fine-grained aspect-level opinion is not global sentiment.** Pontiki et al., *SemEval-2014 Task 4: Aspect Based Sentiment Analysis*, ACL Anthology, https://aclanthology.org/S14-2004/. The task separately defines aspect term extraction, aspect category detection and polarity, including conflicting positive/negative descriptions of distinct aspects. **Engineering implication (our inference):** retain criterion-level source spans and context. Do not turn an entire review's sentiment into a product/feature suitability result.
2. **ABSA models are not method or identity authenticators.** Brauwers & Frasincar, *A Survey on Aspect-Based Sentiment Classification*, ACM Computing Surveys (2022), https://doi.org/10.1145/3503044. This survey categorises knowledge-based, ML and hybrid aspect sentiment approaches. **Our inference:** a specialised classifier may improve recall, but cannot alone validate expert test conditions, product variants or what the specific user means.
3. **Usability is defined relative to user, task and use context.** ISO 9241-11:2018 definition as reproduced by NIST, https://csrc.nist.gov/glossary/term/Usability, and ISO online catalogue excerpts at https://www.iso.org/obp/ui/. **Our inference:** claims about comfort, ease, quietness, speed, usable capacity and convenience should not be universalized without usage and method context.
4. **Provenance requires explicit links between entity, process and agent.** W3C PROV-O, W3C Recommendation 2013, https://www.w3.org/TR/prov-o/. **Our inference:** keep separate the review article, its editor/reviewer, the described observation, its extraction and its independent assessment. Source hash is integrity evidence, not proof that an article reports genuine independent testing.
5. **Precise text annotations should survive textual changes.** W3C Web Annotation Data Model, https://www.w3.org/TR/annotation-model/, provides quote selectors and text position selectors. **Our inference:** keep source-local surface/offset and digest and eventually include selector context for stable passage auditing; Phase168 currently uses request mention offsets and hashes, and Phase96 retains source span digest, but does NOT implement the entire W3C interchange format.
6. **ISO 20488:2018** https://www.iso.org/standard/68193.html sets requirements for collection/moderation/publication of *online consumer reviews*. It is not a standard authenticating independent appliance lab tests; **do not conflate**. Not adopted as a scientific quality certificate for PEE.

### Hosted SaaS alternatives (review only, NOT integrated)

- **Azure AI Language Opinion Mining** (Microsoft official docs): https://learn.microsoft.com/azure/ai-services/language-service/sentiment-opinion-mining/how-to/call-api. Returns attribute targets and sentiment assessments. Cloud API requires submitting review text; does not independently certify test provenance, product variant or test protocol.
- **Amazon Comprehend Targeted Sentiment** (AWS official docs): https://docs.aws.amazon.com/comprehend/latest/dg/how-targeted-sentiment.html. Supports English targeted entity mention sentiment and coreference grouping, not an appliance suitability decision engine.
- **Google Cloud Natural Language Entity Sentiment**: https://docs.cloud.google.com/natural-language/docs/analyzing-entity-sentiment. Returns entity/mention sentiment; not proof of independent product testing.

**Decision for PEE:** Do not add any hosted NLP API now. The missing work is not just polarity classification. Cloud calls would introduce data-rights and privacy review, cost, vendor lock-in and nonlocal failure modes. First benchmark against independent source-labelled data; only consider a sandboxed SaaS candidate if it demonstrably improves accuracy/cost while preserving the original-source and deterministic-intent requirements. No SaaS credentials, accounts or payments needed for this phase.

## Verification

- TypeScript compilation: passed, reusing separately installed TypeScript + Node type definitions; no new application dependency.
- New Phase168 tests: **22/22 passed**.
- All eligible TypeScript regression suites (excluding the pre-existing Phase91/92 legacy suites): **2,212 tests, 127 files**, executed in thirteen bounded subprocess groups; no failures. Full console group counts in `evaluation/phase168/REGRESSION-COUNTS.json`.
- Python: **47** original-source tests, **21** ingestion tests and **60** companion tests via the currently supplied `test_phase*.py` discovery patterns: **128/128 passed**. These are the counts from this execution; not a claimed improvement in model quality.
- Constructed replay: four questions / two fictional variants, outputs from Phase164+Phase165+Phase96 integration. No genuine neural inference, no real source fetching, no blind annotations, no accuracy estimate.

## Remaining limitations and immediate priorities

1. Independent user-confirmation authentication and revision tracking across multi-turn dialogues is missing: confirmations are *documentary-only* and the adapter intentionally cannot approve a ranking.
2. Original-source rights, independent testing, variants and human review are **not independently authenticated** by Phase168. A source digest does not prove a reviewer or lab.
3. User language coverage is still limited to Phase165's reviewed aliases and contextual rules; scalar adjectives, comparative demands (`quieter than`), implicit negation and unreviewed qualitative concepts may require clarification. Do not silently pass them as successfully parsed requirements.
4. Feature presence/absence needs a separate independently reviewed model-/variant-safe check. Reviewer sentiment alone is insufficient.
5. Research must include actual original English professional reviews and a human-labelled held-out set; until then no sensitivity/specificity/recall estimate. Continue previous Phase124 author-labelled frozen Reddit questions as a diagnostic, **not** an independent benchmark.
6. Neural processing and runtime deployment remain deferred without the user's desktop environment. Continue other coding work; never require repetitive three-example Colab executions from the iPhone.
7. Phase169 priority: link confirmed (authenticated) user needs and independently reviewed source receipts into a versioned, auditable suitability research state, with source-method comparability, identity binding, safer clarification UX and explicit blocking statuses before any Phase97/99 promotion. No hypothetical approvals or ranking shortcuts.

## Preservation

Cumulative source remains proprietary, with original mandatory technical notices and licence files retained. No complete additional GitHub repository, neural model checkpoint or hosted SaaS SDK added. Prior file contents are compared byte-for-byte outside the few intentional integration changes.
