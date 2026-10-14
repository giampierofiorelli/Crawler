# Product Evidence Engine v4.74 — Phase 150: document-scale reference audit

**Date:** 11 October 2026  
**Parent:** v4.73 / Phase 149.  
**Status:** implemented, TypeScript/Python regressions passed; scientific extraction accuracy **not** established.

## 1. Executive result

Phase 149 generated possible source-anchored product reference links, but our evaluations chiefly used short snippets and author-designed clauses. Phase 150 introduces an **executable source-offset-grounded evaluation harness** for longer multi-paragraph examples, without changing the ranking, reference resolver, external dependencies or canonical knowledge. It prevents the project from treating silence/abstention as successful comprehension.

**Seven newly written long multi-paragraph documents, seven development annotations** across washing machines, CD players, televisions, ovens, speakers, coffee machines and air fryers:

- Phase149 proposed **0/7** tentative links; blocked/abstained in **7/7**. Among three developer-labeled same-textual-referent examples, **3/3 were missed**. The other four were annotated unresolved; conservative abstention there avoids fabricating a referent.
- This is a diagnostic of **coverage and over-abstention** in the authored cases, NOT evidence of 0% general coreference accuracy. No independent gold, source-disjoint original review holdout or model-vs-native inference benchmark has been obtained.
- The “same” label indicates a claimed *textual* referent, not verified manufacturer product identity, model variant equivalence, causal evidence or a scientific fact.

**Three additional short source-original editorial excerpts** were checked from separate professional publishers. Outcomes: two blocked/abstained and one not detected. No independent annotations. These short quotes are **not** long original reviews; there is no claim of evaluating complete copyright-protected reviews.

| Case | Type | Phase149 result | Grounded assessment |
|---|---|---|---|
| washing machine | constructed long, 3 paragraphs | `blocked_nonproduct_competitor` | misses developer-labeled cross-paragraph product reference; intervening filter/program language is over-broad |
| CD player | constructed long, 3 paragraphs | `unresolved_no_safe_candidate` | misses developer-labeled forward description due to intervening context |
| television | constructed long, 3 paragraphs | `blocked_competing_candidates` | appropriate abstention when two models are possible |
| oven | constructed long, 3 paragraphs | `blocked_variant_collision` | appropriate abstention when a model and its Pro variant appear |
| speaker | constructed long, 3 paragraphs | `prior_blocked` | component could be antecedent |
| coffee machine | constructed long, 3 paragraphs | `blocked_nonproduct_competitor` | misses developer-labeled reference; also distinct manufacturer/reviewer claims |
| air fryer | constructed long, 3 paragraphs | `prior_blocked` | basket or sensor could be antecedent |

## 2. Actual code and tests

- `src/phase150_document_reference_benchmark.ts` independently authored TypeScript evaluator wrapping the existing `readBidirectionalDocument149` without feeding gold labels to the resolver.
- `tests/phase150_document_reference_benchmark.test.ts`: **28 passing tests** covering original offsets, target spans, constructed-vs-original eligibility, two distinct reviewer votes, disagreement, variants and ambiguous references, source/domain/product-family separation, split duplicates, manifest tampering, null denominators and read-only authorization.
- `scripts/evaluate-phase150.mjs`: reproducible seven-long + three-short evaluation, prints descriptive counts and writes auditable JSON.
- `evaluation/phase150/CONSTRUCTED-LONG-DOCUMENT-CORPUS.json`: complete *invented* English documents and one developer label each. This is not a hidden holdout, no independent reviewer and no authentic professional article text.
- `research/phase150_original_editorial_short_excerpt_registry.json`: three short attributed quotes, source URLs and SHA-256. No full reviews bundled.
- `PHASE150-LONG-DOCUMENT-REFERENCE-DIAGNOSTIC.json`: case-level decisions and explicit caveats, with no scientific precision/recall invented.

The evaluator validates exact source offsets and text hashes, reference labels and textual target locations. It rejects train/test overlap on content hashes, declared source group, publisher hostname and product family. A caller may preserve an externally time-stamped manifest SHA-256 and refuse later changes. A hash alone cannot prove when labels were frozen, who annotated them or whether the original page was authentic.

It distinguishes (a) proposed but **unverified** links, (b) explicit block/abstention, (c) missed detection. Candidate links count as matching a developer-labeled target only if **exactly one** named surface span matches the target. If the evaluator finds competing target anchors, it must not credit precision.

**Gold rules:** a frozen evaluation row becomes descriptively eligible for original-source metrics only when permission is declared established and at least two named, agreeing annotator votes cite the same span. These conditions are **caller attestations**, and the output always makes clear that reviewer independence, licence, source authenticity and preregistration are not authenticated by the module. The actual released corpus includes **zero** eligible original holdout annotations. Hence independent precision, recall, false-merge rate and model benchmark remain **null**, not 0%.

## 3. Editorial source review (short attributed passages only)

The current sample deliberately exposes three cross-category linguistic problems. Only short quotes from the sources are included in the JSON registry; the longer surrounding pages were read during research but are **not** packaged, scored as a full-length original corpus or redistributed.

1. **What Hi-Fi?**, *Marantz CD 70*, review published 28 July 2026. The review uses pronouns in its features section and compares the new model with the CD6007. URL: https://www.whathifi.com/hi-fi/cd-players/marantz-cd-70 .
2. **RTINGS**, *TCL QM8K* TV review, with 2026 protocol changes visible on the review page. The panel, the television, competing sizes and variants cannot be collapsed into one referent. URL: https://www.rtings.com/tv/reviews/tcl/qm8k .
3. **TechRadar**, *Ninja Prestige DualBrew*, product-experience article. A sentence about a milk frother uses a pronoun whose antecedent is outside the short retained passage. URL: https://www.techradar.com/home/coffee-machines/one-year-on-the-ninja-prestige-dualbrew-is-still-the-most-versatile-coffee-maker-ive-ever-tested-heres-why-its-the-best-pick-for-your-small-kitchen .

The publisher snippets are diagnostic only. Their accuracy cannot be evaluated from the short fragment without independently reconciled full-document referents. The article text is not licensed for wholesale redistribution simply because it is public.

## 4. Why the source studies still matter

- **DeepKE / DocRED**: document-wide candidate edges, sentence-scoped evidence and explicit mention-to-entity separation. Current PEE lacks robust document-level reference inference. https://github.com/zjunlp/DeepKE ; https://aclanthology.org/P19-1074/
- **GLiNER2**: schema-shaped candidate discovery and constrained alternatives; the Python neural inference engine and weights were NOT installed. https://github.com/fastino-ai/GLiNER2
- **medSpaCy**: target-scoped modifiers; a contextual cue near one measurement must not be transferred to unrelated statements. https://github.com/medspacy/medspacy
- **Snorkel**: correlated signal diagnostics and abstention measurement, without assuming duplicate heuristic votes are independent scientific evidence. https://github.com/snorkel-team/snorkel
- **VerbNet / Open English WordNet / VADER**: remain reusable local, attributed lexical data from Phase141. Word similarity and sentiment cannot by themselves establish referents or scientific truth.

We kept all existing original reference studies, without introducing vendor code or network inference. This phase implements evaluation, not a replacement pretrained model or a generally intelligent parser.

## 5. Phase 151 priority supported by the negative result

1. **Improve recall without unsafe merging.** Use typing of product/model vs component/programme/test condition, and document-wide alternative evidence to distinguish true competing entities from incidental intervening nouns. Keep multiple viable hypotheses rather than forcing a single link.
2. **Use new, genuinely withheld original English professional reviews**, ideally licensed for research and independently labeled by at least two evaluators, spanning different publishers and product families. Pre-register sample IDs and expected metrics before tuning.
3. Compare unchanged Phase149 against Phase151 for tentative-link precision and coverage, false merges, missed gold links, variant errors, abstention, CPU/memory. Measure independently from category-specific vocabulary engineering.
4. Only if a native improvement remains inadequate, compare a **separately isolated, offline local pretrained model** against that fixed benchmark. Decision requires gains in safe recall *and* acceptable deployment/maintenance. No model weights or remote APIs have been introduced by Phase150.

**No additional product categories or user input required right now.** Existing backlog includes conventional/deep fryers, air fryers, toasters, coffee machines and cooking steamers.

## 6. Release verification and limits

- Targeted TypeScript: 28/28.
- Full eligible TypeScript suite: 1,927/1,927 over 109 test files, excluding the same two legacy Phase91/92 suites.
- Python: 47 primary + 21 ingestion + 9 offline Phase133 probe = **77/77**.
- Zero new runtime dependencies, paid APIs, models, ranking changes or autonomous canonical writes.
- All previous v4.73 files are preserved; only `README.md` and `package.json` are intentionally modified among prior files.
- This is **not** a scientific generalization benchmark, not evidence of superior reference accuracy, not a product performance evaluation and not a certification of published source rights.
