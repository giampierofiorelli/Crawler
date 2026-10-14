# Product Evidence Engine — Phase 139: proposing evidence candidates from unmarked English review text

**Release:** v4.63 / Phase 139  
**Date:** 11 October 2026  
**Parent:** v4.62 / Phase 138  
**Decision:** Implement a bounded, original TypeScript candidate reader without installing GLiNER2, DeepKE, medSpaCy, Snorkel, TypeSafe AI, neural weights, Python services or commercial inference/search dependencies. Leave the scientific approval, canonical database and ranking untouched.

## 1. What changed, exactly

Until Phase 138, the original-excerpt diagnostic supplied an explicit `subjectLiteral`, `objectLiteral` and relation label alongside the text. That made it possible to test source/context **screening**, but not the preceding question of whether PEE could *find* the passages of interest in a review.

The new `src/phase139_unmarked_english_candidate_reader.ts` exports `readUnmarkedEnglish139`. Its input contains source text, a caller-provided SHA-256 digest and source metadata. It may also receive a **page identity hint** (reviewed product/variant IDs and exact aliases); it **does not** accept developer-marked entity spans, relation types, answer labels or an approved scientific fact.

Native bounded rules propose:

- Exact page aliases and candidate multi-token capitalized product names with absolute UTF-16 character offsets.
- Distinct unverified variants, including the source-page PE versus in-text FE example.
- Unresolved personal and possessive anaphors (`it`, `its`, `they`, `their`): a page title is **not** sufficient to resolve them.
- Short feature-noun phrases and bounded predicate outcomes; a numerical percentage stays incomplete without an explicit measured endpoint.
- Potential subject/predicate/object pairs, **always** labelled `untyped_extraction_hypothesis`, never assigned a causal/scientific relation type from word order alone.

The candidate-stage gates reuse `modifiersForPair134` for bounded evidence scope, negation, attribution and uncertainty. Cross-sentence identity is **not** assumed to be solved by this new module: Phase 135's document reference/graph controls remain a separate layer. Phase 136's evaluator, Phase 137's source custody and blind-annotation contracts, and Phase 138's excerpt diagnostics remain available unchanged.

All candidate records are traceable to their original text offsets and source identifiers. Each pair sets `canonicalWriteAuthorized:false`, `rankingAuthorized:false`, `scientificReviewRequired:true`. The reader itself returns `sourceAuthenticityVerified:false`, `independentAnnotations:0` and `anyClaimsScientificallyValidated:false`.

**Additional safety correction during final review:** when `maxMentions` or `maxPairs` prevents complete candidate discovery, the output now declares `coverageTruncated:true` and `truncationReasons` with `mention_limit` and/or `pair_limit`. A capped scan cannot be misreported as exhaustive discovery or absence of further evidence.

## 2. Reproducible pilot on the previously selected excerpts

The Phase 138 file `research/phase138_original_review_pilot/PHASE138-ORIGINAL-EXCERPT-PILOT.json` contains six short, manually transcribed excerpts from three publisher webpages. This phase replays those excerpts **without supplying the pre-authored subject/object spans or relation labels to the reader**. The page identity and aliases are still supplied, and the same excerpts were already seen and selected by the developer. Consequently, this is a *diagnostic replay*, **not** an independent holdout, population precision estimate, neural performance demonstration or blind annotation result.

| Observed candidate disposition | Number of excerpt cases | Meaning |
|---|---:|---|
| `candidate_quarantined` | 2 | Textual subject and performance phrase proposed, not accepted as a scientifically verified fact |
| `unresolved_reference` | 2 | Local pronouns could not be linked to verified antecedents |
| `missing_measurement_endpoint` | 1 | The percentage lacked an explicit named measurable target |
| `variant_not_reviewed` | 1 | A different model variant must not inherit the reviewed model's identity |
| **Total** | **6** | **12 mentions proposed across the cases** |

Per-case offsets and decision reasons: `PHASE139-UNMARKED-ORIGINAL-EXCERPT-DIAGNOSTIC.json`. The six source excerpts remain the *same* excerpts from Phase 138; no external full-text corpus or new gold benchmark was acquired in this phase.

The publisher URLs carried forward from the Phase 138 source file are:

- RTINGS — https://www.rtings.com/robot-vacuum/reviews/roborock/qrevo-curv
- Vacuum Wars — https://vacuumwars.com/dreame-l60-ultra-pe-review/
- TechGearLab — https://www.techgearlab.com/reviews/smart-home/robot-vacuum/mova-p10-pro-ultra

The stored digest attests only to consistency of the excerpt *provided to the function*; it cannot authenticate publication provenance or verify that the current publisher page matches it. No permission to redistribute whole professional articles is assumed.

## 3. Tests and release conditions

- TypeScript build: pass, existing compiler (`tsc -p tsconfig.json`).
- Targeted Phase 139 tests: **29/29 pass**, including discovery with and without page aliases, variant mismatch, pronouns, quantified claims, negation, source attribution, bounded ambiguity, offset preservation, integrity checks, deterministic replay and both forms of output truncation.
- Cumulative regression: **1,632 passing assertions across 98 eligible test files**, executed in 13 groups. As in the parent, two pre-existing legacy suites `phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js` remain excluded; they have **not** been silently described as passing.
- Python tests: **77 pass** (47 primary source, 21 ingestion, 9 Phase 133 offline probe).
- Third-party runtime dependencies: **0 added**. No model weights, copied vendor source code or paid API introduced.
- Every file from the parent release is retained; only `README.md` and `package.json` among existing parent files are intentionally changed. Automatically regenerated Python `.pyc` cache files are restored to their exact parent ZIP contents before archiving.

Reproduce from the archive root (environment with existing development tools):

```bash
npm run test:phase139
npm run demo:phase139
npm run regress:phase139
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

## 4. Lessons taken from cumulative engineering studies (not copied code)

- **GLiNER2:** typed schema constraints, candidate caps, separate proposal and constrained selection, and explicit distinction between no candidate and infeasible/incomplete extraction. [Repository](https://github.com/fastino-ai/GLiNER2).
- **DeepKE:** represent document-anchored mentions and potential links with source offsets rather than isolated keywords. [Repository](https://github.com/zjunlp/DeepKE); [DocRED](https://aclanthology.org/P19-1074/).
- **medSpaCy:** scope and target-specific assertion modifiers; existing Phase 134 remains deliberately conservative. [Repository](https://github.com/medspacy/medspacy).
- **Snorkel:** weak signals may abstain, conflict or duplicate a family. They are not independent scientific observations. [Repository](https://github.com/snorkel-team/snorkel).
- **TypeSafe AI documentation:** typed atomic decisions and entity-alignment candidates, followed by application-controlled side effects and evaluation; no Jev API integrated. [Docs](https://docs.typesafe.ai/introduction).

The exact user-supplied audits and TypeSafe reference materials remain in `research/phase136_user_reference_studies/` and the earlier `research/phase134_reference_studies/`. Their findings predate this release; no claim is made that their external model performance has been reproduced by these short English lexical rules.

## 5. What Phase 139 does **not** solve

1. **General semantic extraction.** Rules cover limited English spelling, phrase structures and predicate verbs, not universal named-entity recognition, long-distance coreference, syntax, tables, footnotes or implicit attributes. A non-matching clause may be silently missed if it does not hit a known verb pattern (unless a configured cap is reached).
2. **Full review comprehension.** Only the six already selected short original excerpts were replayed. No complete authorised independent source document, representative original-review benchmark, independently annotated gold set or source/product-disjoint external holdout was tested.
3. **Identity authentication.** Exact page aliases come from caller metadata; a detected name can still be a false product, and page metadata alone does not prove that two variants are equal.
4. **Scientific inference.** Extraction of “94%” does not establish test conditions, methodology, cross-protocol comparability or whether the figure is favorable. Qualitative adjectives are not a measured outcome or comparison by themselves.
5. **End-to-end deployment.** This is a callable module/diagnostic runner, not a replacement for ingestion, Phase 131 learning, Phase 128/129 reviewed category growth, or ranking. No new facts are written.

## 6. Engineering follow-up

The next meaningful capability is **source-anchored candidate recall and error characterization on unseen original English reviews**, including manually and independently labelled spans for product, variant, task, feature, measurement, protocol and speaker. Freeze source/product-disjoint partitions before improving the candidate-generation algorithm. Compare the Phase 139 baseline with any later native extractor on missing candidates, false variant merges, wrong subject attachment, false positive relations, context/negation failures, abstention, runtime and memory. Only after the reader achieves credible recall should Phase 135 candidate links and Phases 134/136 evidence controls be assembled into a scientifically reviewed end-to-end knowledge-growth path.

This release is progress toward reading raw text, **not evidence that PEE is now an expert-level natural-language understanding system**.
