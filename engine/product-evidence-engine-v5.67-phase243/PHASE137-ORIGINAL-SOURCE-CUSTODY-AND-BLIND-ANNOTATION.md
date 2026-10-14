# Product Evidence Engine v4.61 — Phase 137
## Original-source candidate inventory, source custody, blind annotation and split-leakage controls

**Date:** 2026-10-11. **Parent:** v4.60 Phase 136. **Engineering decision:** independent TypeScript code, English-first, no new runtime dependencies, no vendor package, no training weights, no remote or paid semantic API. The authoritative knowledge store and deterministic ranking are unchanged.

### Executive finding

Phase 136 measured a semantic screening pipeline only on constructed fixtures and provided an API for independently annotated original expert passages. It did not actually possess such a corpus. Phase 137 makes that gap visible and adds an executable, inspectable preparation path: an honest **URL-only original-source candidate inventory**, **machine-decision-free annotation packets**, dual textual + entity-reference review, integrity checks for packet bindings and SHA-256 source spans, and normalized near-duplicate detection across development and holdout. A failure remains an abstention or a blocked evaluation, not a fabricated fact.

**Real benchmark status at release:** three public original-review candidate URLs identified, **zero original article snapshots collected into this release**, zero evaluation rights authenticated, zero independent human annotators recruited/validated, zero independently labeled original-document holdout cases, zero statistically meaningful semantic accuracy estimates. Developer-authored tests and illustrative vote IDs demonstrate code paths only. Source availability on a public website is *not* authorization to copy, redistribute, crawl at scale, or use an article as an annotation dataset.

### 1. What was implemented

| Artifact | Concrete role | Guarantee and limitation |
|---|---|---|
| `src/phase137_original_source_annotation.ts` | Source candidate schema and audit; blind evidence packet with exact unchanged UTF-16 offsets and SHA-256; blind vote intake and unanimous agreement on both claim support and antecedent identity; corpus seal digest; shingled leakage gate; Phase136 evaluation bridge | No third-party runtime code. SHA checks bytes supplied by the caller, not external website authenticity. Human identities, label independence, commercial permissions and preregistration are NOT verified. |
| `tests/phase137_original_source_annotation.test.ts` | Constructed tests for source inventory, corruption and evidence spans, contamination, review conflicts and promotion restrictions | These tests certify local implementation behavior only, not semantic generalization. |
| `scripts/evaluate-phase137.mjs` | Reproducible source inventory audit and one developer-authored example through blind vote protocol | The two vote IDs in the example are **simulated**, not human evaluations. |
| `research/phase137_source_candidates/PHASE137-ORIGINAL-SOURCE-CANDIDATES.json` | Three discovered original expert-review URLs, deliberately with `rightsStatus:not_established`, `snapshotStatus:not_collected` and `stage:url_discovered_only` | No article body or unauthorized third-party code included. |
| `scripts/phase137_regress.mjs` | Full bounded TypeScript regression over eligible suites | Two inherited Phase91/92 timeout-prone suites remain excluded exactly as in parent release. |

**Blind packet:** passes the original passage and selected candidate proposition to an independent reviewer, but does **not** reveal model score, contextual screen decision, vote-family diagnostics or reference outcome. It attaches the unmodified source hash, URL, document ID, exact subject/object/evidence spans and a packet digest. The digest is checked when votes arrive. A packet built from an original-professional case whose permission is `not_established` is refused. Even `evaluation_authorized` is only **caller-provided**; this code cannot authenticate a legal license.

**Annotation policy:** at least two different declared annotator IDs; each must separately judge `supported_by_passage / contradicted_by_passage / indeterminate_from_passage` and `same_entity / different_entity / unresolved`. Disagreement on either question requires **outside adjudication**; the system does not majority-vote a result. A concordant `unresolved` reference cannot be used to make a holdout case descriptively scorable. Gold labels supplied to input before the blind workflow are rejected. Source/proposal content hashes and typed identity must be internally consistent; a model proposal with a damaged evidence hash is excluded before packet issue.

**Leakage policy:** maintains Phase136 exact duplicate, declared publisher-source, domain and product-family guards; adds a conservative cross-split normalized word-shingle near-duplicate check. It can flag boilerplate as similar and cannot catch all paraphrases, syndicated feeds or common manufacturer ownership. It is an added safety filter, not an independent identity oracle. Up to 120 blind cases are accepted per run and evidence snippets are capped at 25,000 characters in this phase.

**Evaluation:** only after blind submissions, `evaluateBlindAnnotatedCorpus137` assembles eligible gold votes and sends them to the existing `manifestDigest136` and `evaluateCorpus136` code, retaining the Phase134 baseline and Phase135 documentary-reference comparison. All results retain `rankingAuthorized:false`, `canonicalWriteAuthorized:false`, `scientificAccuracyClaimAuthorized:false`. Numerical descriptive metrics can be misleading if a caller dishonestly marks constructed fixtures as original or invents reviewers; this limitation is explicitly surfaced and tested.

### 2. Original professional source candidates, publicly located on 2026-10-11

These are references for a **future authorized corpus**, not examples counted as present in the dataset:

| Publisher | Original review page | Evidence and scope issues to consider in annotation |
|---|---|---|
| RTINGS | [Roborock Qrevo Curv](https://www.rtings.com/robot-vacuum/reviews/roborock/qrevo-curv) | The visible review says Methodology v1.1 with a July 2026 bench update; contains multiple variants, other Roborock devices, physical components, measured results and claims. Versions must not be mixed automatically with earlier v1.0 examples. |
| Vacuum Wars | [Dreame L60 Ultra PE](https://vacuumwars.com/dreame-l60-ultra-pe-review/) | The publisher distinguishes PE from FE and related L60 versions, and reports a correction to an earlier mopping score. Preserve exact model, attribution, measured context and article revision before data collection. |
| TechGearLab | [Mova P10 Pro Ultra](https://www.techgearlab.com/reviews/smart-home/robot-vacuum/mova-p10-pro-ultra) | Product-specific tested review; discusses comparable models and a newer Gen 2. Prevent statements about the Gen 2, competitors or components transferring automatically to the originally tested unit. |

Original links were confirmed through public search results in this work session. Page-level visible descriptions represent publisher claims; publication/access times and titles are not cryptographically authenticated. The project preserves **URLs and catalogue metadata only**, not full article text, payment-gated test values or image assets. These three source candidates are not independently selected random samples and cannot establish publisher-independent performance.

### 3. What remains unperformed and the next empirical release gate

1. **Legitimate source acquisition.** Clarify and document the exact permissions and terms before storing/redistributing article excerpts in a release package. Acquire allowed unmodified original English passages through existing approved PEE transport; capture publisher revision, access method, retrieval time, variant and protocol/version. Preserve a trusted source-custody chain independent from just a developer-provided SHA.
2. **Task-specific gold corpus.** Use original passages with multiple entities, pronouns, variants, negations, methods, numerical conditions and reviewer/manufacturer contrast. Independently identify and label *all* relevant mentions (not only those found by our detector) to make candidate recall measurable. Avoid only easy positive sentences.
3. **Independent annotation.** Give two real annotators blind packets; keep identification and independence evidence outside model code. Record disagreements and external adjudication, including relation support, reference identity, measurement scope, attribution, test method, and necessary adjacent context.
4. **Out-of-band frozen split.** Choose and externally time-stamp a publisher-disjoint, product/brand-disjoint holdout before fitting, tuning or revising rules. Address syndicated articles, reprinted measurements, near-duplicate revisions and common ownership. Recompute fingerprints on subsequent document revisions.
5. **Metric comparison.** On a credible untouched corpus, report false acceptances and rejections, screened coverage, gold candidate recall, abstention, pronoun false-merge rate, source/publisher clusters, exact variant assignment, context/negation slices, and reviewer workload. The Phase136 descriptive metric API is a starting point, not a substitute for source sampling or uncertainty intervals.
6. **Only then** assess whether focused new rules, native learned extractors or a replaceable offline model offer enough measured benefit to justify operational cost. Weak supervision signals cannot become scientific assertions by consensus.

Do not make the source candidate inventory itself a ranking input, a source of new category concepts, or a claim that PEE accurately understands expert reviews. Research references and primary-source intake remain distinct from scientific acceptance.

### 4. Cumulative source-learning decisions

- **GLiNER2** [repository](https://github.com/fastino-ai/GLiNER2): schema-constrained alternative entity/relation hypotheses, original implementation, no Python or weights introduced.
- **DeepKE** [repository](https://github.com/zjunlp/DeepKE) and [DocRED](https://aclanthology.org/P19-1074/): document-level mention identity and evidence spans remain a review problem; Phase135 graphs are not full document relation inference.
- **Snorkel** [repository](https://github.com/snorkel-team/snorkel): weak signal agreement and conflict are *not* an independent-label gold set; Phase136 diagnostics remain separate.
- **medSpaCy** [ConText rules](https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_rule.py): short-scope negation tests and failure modes remain test slices, not conclusive language understanding.
- **TypeSafe** [citation checks](https://docs.typesafe.ai/cookbooks/citation_check) and [entity alignment](https://docs.typesafe.ai/cookbooks/entity_alignment): structurally separate typed judgments, passage support and candidate entity alignment, no vendor API.

The prior five source-study documents (Phase134 and Phase136 research directories) remain part of the cumulative distribution. User-supplied third-party *source ZIPs* remain outside the runtime and distribution, and no vendor implementation is imported.

### 5. Reproducibility and honest result

```bash
npm run build
npm run test:phase137
npm run demo:phase137
npm run regress:phase137
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

Phase137 focused: **21/21 developer-authored checks pass**. Cumulative TypeScript **1,584 passing / 96 eligible files**, two inherited legacy exclusions. Python **47+21+9 = 77 passing**. The test demonstration produces **one constructed simulated consensus** and **zero real original holdout**. No runtime dependencies, no official quality claim, no canonical data updates, and no ranking updates.
