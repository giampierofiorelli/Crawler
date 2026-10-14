# Product Evidence Engine — Phase 140: bounded structural recall, source-audited limitations and next engineering decision

**Date:** 2026-10-11  
**Version:** v4.64 / Phase 140  
**Parent:** v4.63 / Phase 139  
**Language:** English-first  
**Source learning policy:** study third-party repos/documentation; no installation, vendoring, model weights, remote APIs, new service or runtime dependency.

## Decision: are the user's source repositories useful? Do we need more?

**YES, they are useful and remain directly relevant. NO, do not request additional model repositories now.** The user's source audits and source ZIPs already establish a rich engineering reference set. However, learning graph, extraction, negation and weak-supervision design from source code does not reproduce the generalisation of trained pretrained models. Reaching their semantic quality is an unsolved empirical question.

| Reference | Specific reusable engineering principles | Existing PEE result | Unsolved gap |
|---|---|---|---|
| GLiNER2 | Typed graph candidate proposal; identity/relationship constraints; bounded search and abstention; offset-preserving long document work | Stage139 proposes untyped bounded candidates; Stage135 has documented mention graph; Stage140 increases coverage for six English structural patterns | General learned candidate generation and cross-domain quality; no trained weight used |
| DeepKE | Source-anchored document mentions and relations; evidence sentence identifiers; cross-sentence relation modelling | Stage135 separate mention graph; Stage140 stays local by design | Long-range coreference and document-level attribution |
| medSpaCy | Typed, target-scoped modifiers, negation, termination and pseudo-negation | Stage134 modifier screen; Stage140 preserves negative/uncertain hypotheses | Parsing reliable attachment and scope when multiple targets and modifiers occur |
| Snorkel | Label functions with abstentions; conflict/correlation analysis; slice evaluation | Stage136 audits signal conflict and evaluation leakage | No independent gold annotations; probabilistic learning not justified |
| TypeSafe AI documentation | Atomic typed judgments; separate entity alignment, quote matching, relevance and entailment; application-controlled effects | Stage134 checks evidence; Stage136 screens; Stage140 preserves quarantines | No calibrated held-out semantic judgement and no license for free local Jev inference |

The source-learning material and its precise links remain inside the cumulative `research/phase134_reference_studies/` and `research/phase136_user_reference_studies/`, with the external source archives **not** added to the production runtime.

## 1. What was actually built

New `src/phase140_bounded_english_recall.ts` exports `readBoundedEnglishRecall140` as a supplement to `readUnmarkedEnglish139`, NOT a substitute or claimed neural reader. It does not take manually marked spans, proposed scientific relation labels or gold answers. It consumes the existing validated original text, page metadata, and Phase139 proposed mentions.

The narrowly scoped new candidates include:

- Explicit limitations: `struggles with`, `fails to`, `is poor at`.
- Positive qualitative assessments: `excels at`, `succeeds in`, `is effective at`.
- Feature descriptions: `uses`, `comes with`, `is equipped with`, `lacks`.
- Relative comparisons: `outperforms`, `underperforms`.
- Original-document offsets, bounded complement spans, and *candidate* conditions such as `on carpeted surfaces`.
- No automatic page-title-to-pronoun resolution, no nearest-entity attachment with two competing product names, no forced variant merge, no manufacturer promise interpreted as test evidence.
- Ambiguous negation, modal claims and lack of evidence produce `unsupported_scope` instead of a trusted finding. Explicit limitations remain *negative statement hypotheses*, not independently established facts.
- App/component names inside an object remain explicitly distinct from verified rival products. `Roomba Home app` should not be treated as a second vacuum merely because `Roomba Home` is capitalised.
- Bound of 200 supplementary proposals and a `coverageTruncated` marker, with separate counts of unmatched sentences and unresolved cue subjects. The counts are diagnostics, **not** a recall estimate.

Source URL provenance remains upstream and caller-asserted. SHA-256 protects the supplied text's internal consistency; it does **not** prove the text is an authentic publisher snapshot. Every output has `scientificallyValidated:false`, `canonicalWriteAuthorized:false`, `rankingAuthorized:false`. No category knowledge or recommendation ranking changes.

## 2. New publisher-language diagnostic, not an independent holdout

Source file: `research/phase140_original_excerpt_diagnostic/PHASE140-NEW-PUBLISHER-EXCERPTS.json`. Reproduce the trace with `npm run demo:phase140`. The source excerpts were selected during engineering and each is under a 25-word attributed excerpt budget. **They must not be reused as an unbiased test set.** No full articles are bundled.

| Original short excerpt source | Stage139 pairs | Supplemental Stage140 proposals | Decision |
|---|---:|---:|---|
| RTINGS, Roborock Qrevo | 0 | 1 | Negative performance assessment, quarantined |
| TechRadar, Dreame L40 Ultra | 0 | 1 | Generic `the robot` has no explicit verified referent in the short excerpt; unresolved |
| Tom's Guide, Roomba Max 775 Combo | 0 | 1 | Named app feature claim, quarantined; no false rival-product identification |
| **Totals** | **0** | **3** | **Not a precision/recall estimate** |

Original URL pages:

- RTINGS: https://www.rtings.com/robot-vacuum/reviews/roborock/qrevo — reviewed February 2024, retested July 2025; methodology identified by publisher. The pilot examines the sentence about pet hair pickup on carpets.
- TechRadar: https://www.techradar.com/home/robot-vacuums/dreame-l40-ultra-review — the selected sentence has a generic noun referring to the robot, needing previous context to attach a specific model.
- Tom's Guide: https://www.tomsguide.com/home/home-appliances/roomba-max-775-combo-review — the selected sentence names the robot and its app, but the app must not become another product entity.

**The exact same input is passed to both stages.** The developer-authored expectations are labeled as such. These diagnostic improvements concern candidate *coverage* on three hand-picked clauses. The independent gold corpus, external holdout and statistically meaningful precision/recall remain zero/not estimated.

## 3. Test evidence and compatibility

- Phase140 tests: **28 passed**, including alternative predicates, explicit vs unresolved subjects, identical vs variant model names, manufacturer attribution, no-evidence / uncertainty / double-negation precautions, conditions and UTF-16 offsets, accessory/app identity, deterministic replay, invalid digest, proposal bounds, and no automatic canonical write.
- Cumulative TypeScript: **1,660 tests passed across 99 eligible test files**, excluding the same two legacy test files (`phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js`). All 13 shards passed. This does not establish correctness on professional reviews outside the inspected examples.
- Existing Python: **77 passed** (47 primary + 21 ingestion + 9 offline Phase133 probe).
- The cumulative parent release is byte-preserved, except the intentional README/package metadata updates. Refer to the release verification and SHA-256 manifest.
- Runtime dependencies: zero additions; no proprietary service, model runtime or third-party neural weights.

Reproduce in a Node environment with the repository's existing development dependencies:

```bash
npm run test:phase140
npm run demo:phase140
npm run regress:phase140
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

## 4. Technical limitations and what should come next

The increase in covered verbs is **not** a solution to general language comprehension. The Stage139 upstream proper-noun finder can propose apps, techniques and accessories as putative product names. A sentence lacking a lexical trigger remains unscanned, even if it contains an important result. The limited condition spans are not verified measurement conditions; handling of coordinated predicates, punctuation, passive sentences, section headings, tables, long-range product references and sarcasm is incomplete. A source title, webpage claim or multiple agreeing heuristics is not independent scientific evidence.

**Stage141 priority:** begin a controlled native benchmark on larger, unseen, source-disjoint original English review excerpts. Annotate named entities vs apps/parts, explicit/implicit referents, relation and assertion scope, conditions, method version, and provenance. Preserve the untuned Stage139 baseline and Stage140 supplement. Measure missed mentions, wrongly merged variants, incorrect subject attachment, false positive scientific statements and abstention per slice. Avoid tuning on the held-out set.

At present there is **no need for more external code archives**. The most useful future extra input, if the user can conveniently supply it, is a set of lawfully available original professional-review documents and a few independently annotated examples of the correct product, feature, condition and measured outcome. We can also continue sourcing public candidates ourselves. A pretrained, locally runnable model should only be considered after an independent native-vs-model benchmark, explicit license review for weights and inference dependencies, and concrete hosting/resource measurements. No such comparison has yet been performed.

### Reference links

- GLiNER2: https://github.com/fastino-ai/GLiNER2
- DeepKE: https://github.com/zjunlp/DeepKE ; DocRED: https://aclanthology.org/P19-1074/
- medSpaCy: https://github.com/medspacy/medspacy
- Snorkel: https://github.com/snorkel-team/snorkel
- TypeSafe documentation: https://docs.typesafe.ai/introduction ; https://docs.typesafe.ai/cookbooks/entity_alignment

No third-party software was copied into this phase; ideas were implemented with independently written TypeScript. Research references are not proof of trained-model quality.
