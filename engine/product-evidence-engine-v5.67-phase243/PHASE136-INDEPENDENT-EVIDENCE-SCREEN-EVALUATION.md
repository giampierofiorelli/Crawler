# Product Evidence Engine — Phase 136: native evidence-screen benchmark and weak-signal measurement

**Date:** 11 October 2026  
**Build:** v4.60 / Phase 136  
**Parent:** v4.59 / Phase 135  
**Language:** English-first  
**Purpose:** quantify failures of semantic screening without confusing prepared examples, weak-label agreement or evidence anchoring with independent scientific accuracy.

## Executive decision

The four repositories supplied as engineering references—GLiNER2, DeepKE, medSpaCy, Snorkel—plus the TypeSafe technical study were inspected in previous phases and their study material was provided again. Phase 136 retains the source-auditing decisions: **study first; independent native TypeScript implementations; no packages, model weights, vendor code or remote API installed.** This phase adds evaluation machinery rather than claiming that neural-level language understanding has been achieved.

The Phase 135 reference graph can conservatively abstain where pronouns have not been linked by a local reviewed receipt. Until Phase 136, it could not be compared systematically, with a frozen controlled benchmark, against Phase 134's lexical/context screen; weak-label agreements could be logged but not evaluated on a fixed corpus by phenomenon or declared signal family. Phase 136 closes **part of the measurement gap**.

## Software delivered

1. **`src/phase136_independent_signal_benchmark.ts`**: new original TypeScript APIs:
   - `screenCase136` reconstructs the Phase 135 mention graph and applies the Phase 131/132/134 gates, with weak-signal conflict and abstention preserved. Reports Phase 134-alone as a **diagnostic baseline**, not a recommended decision.
   - `manifestDigest136` fingerprints a declared corpus and annotations, independent of case order and vote/mention array order; repeated IDs and incomplete provenance fail closed.
   - `evaluateCorpus136` evaluates only held-out cases **declared** to be original professional texts, evaluation-authorized, with two concordant distinct annotator IDs. Conflicts, missing permissions and constructed examples are excluded from textual support precision denominators.
   - Distinguishes `candidate_quarantined`, `rejected_by_screen`, `abstain`, `invalid`. A screened candidate is not an accepted fact.
   - Calculates per-phenomenon, per-category and per-source-group outcomes; false accepts separated into contradicted vs indeterminate gold; false rejections of supported passages; abstentions, coverage, and supported-claim retention. Outputs paired Phase134 baseline and Phase135/136 values for coverage, screened textual precision, false accepts, and supported-claim recall. These metrics expose the cost of conservative abstention rather than presenting selectivity as an unqualified improvement. It separately measures weak-signal coverage, overlap, conflict, and family counts.
   - Refuses declared source-group and product-family crossover between development and holdout; additionally checks raw source URL hostname crossover and identical source-text SHA-256 across splits. These are safeguards, **not** an assurance that metadata is truthful or all near-duplicates are found.
   - Always returns `canonicalWriteAuthorized:false`, `rankingAuthorized:false`, `scientificAccuracyClaimAuthorized:false`, `annotationIdentityVerified:false`, `preregistrationIndependentlyVerified:false`, `rightsVerifiedByThisModule:false`.
2. **`tests/phase136_independent_signal_benchmark.test.ts`**: 38 developer-authored checks for open reference abstention, reviewed local reference, tampering, family correlation/conflicts, source/product/hostname split leakage, source snapshot consistency, frozen-manifest changes, gold disagreements, null-denominator metrics and order invariance.
3. **`scripts/evaluate-phase136.mjs`**: three self-contained *constructed* cases: a repeated product name, an unresolved pronoun, and contradictory signals. Produces `PHASE136-CONSTRUCTED-TRACE.json` with **zero original professionally annotated evaluation documents**.
4. **`scripts/phase136_regress.mjs`**: existing TypeScript regression run divided into bounded groups, retaining explicit exclusions for the two already-known Phase91/92 legacy timeout-prone test files.
5. The user's source-study documents are preserved verbatim in `research/phase136_user_reference_studies/`; original third-party repository ZIPs remain OUTSIDE the distributable runtime.

### Guard decision precedence

1. Failed source/document/offset and evidence integrity -> **invalid**.
2. Unresolved reference under Phase135 -> **abstain**, even if a separate phrase-based Phase134 check would admit a candidate.
3. Contextual rejection/negation -> **rejected/invalid**, respecting pre-existing Phase131/132 assertions.
4. Disagreeing weak signals -> **abstain**, regardless of a positive Phase135 hypothesis.
5. Only a source-anchored, context-surviving Phase135 candidate with no new conflicting signals -> **candidate in quarantine**, never trusted knowledge.

When two different signal families disagree, *both* sides are shown in `signalConflictingFamilies` rather than hiding the disagreement behind an empty family intersection.

This module **does not perform cross-sentence relation discovery or autonomous pronoun resolution**; it evaluates candidate extractions and already-annotated identities. It does not measure science or causality independently of the supplied labels.

## Observed constructed-example behaviour

| Developer-authored case | Phase134 diagnostic | Phase136 output | Meaning |
|---|---|---|---|
| Repeated `Aster X2` | Candidate | Candidate in quarantine | Locally anchored but not independently validated |
| `It` without reference review | Candidate | Abstain | Prevent unverified identity transfer |
| One signal supports and another opposes | Abstain | Abstain | No majority-force or consensus masquerading as truth |

**These three examples cannot produce any generalisable accuracy estimate.** All three are `origin:'constructed'`, `permission:'not_established'`, with no professional source or independently verified annotations. The report accordingly yields `descriptivelyScorableHoldout:0` and null precision/coverage denominators for the scientific-style evaluation set.

## Required next corpus: empirical protocol, not performed

1. Obtain **original English professional-review passages** under documented collection and evaluation rights. Preserve original URL, date, published revision/protocol, unmodified text and source snapshot hash. Distinguish the technical SHA-256 consistency check from independent website/source-authentication evidence and usage permissions.
2. Assign **source family, product family and category** by a separately reviewed inventory; preserve brand, variant, method and test-condition identifiers. Split before tuning: entire publisher/source groups and product families must belong to one split. Check overlapping content and near-duplicates manually or by independent tooling; the current runtime checks declared groups, hostnames and exact snapshots only.
3. Give at least two genuinely separate adjudicators the original passage and candidate spans **without the algorithm's result**. Ask for `supported_by_passage`, `contradicted_by_passage`, or `indeterminate_from_passage`, and separately annotate pronoun referent, competitor mentions, evidence scope, claimant, protocol and any need for additional context. Resolve disagreements externally, track the adjudication trail and retain disagreement statistics (the current scorer excludes disagreement and does not verify identities).
4. Freeze a versioned manifest **outside the evaluation job**, with a timestamp, repository commit, permitted source IDs, annotation protocol and hash. Supply that SHA-256 as `expectedManifestDigest` during subsequent execution. A matching digest proves consistency with the supplied manifest, **not** that it was frozen before development.
5. Measure *Phase134 baseline vs Phase135/136* with candidate recall, accuracy on eligible gold, selective precision, false accepts among screened, false rejection rates, abstention and review workload, and slices for negation, manufacturer claims, modifiers, models/variants, competing products, component referents, source/protocol version and source/publisher. Count documents/publishers as clusters; multiple claims from one review are correlated.
6. Only after real, source-disjoint, independently adjudicated labels exist should an **actual learning experiment** compare deterministic weak supervision to a trainable model (if justified). Use separate development/validation/holdout partitions, family-dependence diagnostics and per-slice error analysis; do not optimize on the untouched test set.

### Known limits

- Caller-supplied `origin`, permissions, `sourceGroupId`, `productFamilyId`, gold annotator IDs and reviewed coreference receipts are **attestations**; this code cannot authenticate them or establish reviewer independence or genuine sample rights. A caller can fabricate these fields. Scores remain descriptive even when all fields are present.
- Two concordant annotators establish provisional *textual label agreement*, not that a product claim is scientifically true. The chosen screen threshold is not calibrated.
- Missing mention annotations can hide real competitors; same-URL-host blocking cannot detect all publisher aliases and near-duplicate pages. Long sentence parsing and cross-chunk references remain incomplete.
- `manifestDigest136` includes the declared gold, thus is a post-hoc integrity control only unless its digest was independently preserved before tuning.
- Repeated snapshots in one split are allowed to support several annotation instances; the report warns that those cases are not independent samples. Confidence intervals or broad population performance are intentionally not asserted.
- A constructed regression can pass all tests despite poor recall or failure in professional prose. CPU and memory benchmarks are not yet reported for deployment workloads.
- No auto-learning, no canonical database growth, no scientific approval signature, no ranking changes, no general entailment, no trained pronoun resolver.

## Source-learning trace and permissions

- **Snorkel**, [labeling functions](https://github.com/snorkel-team/snorkel/tree/main/snorkel/labeling), [model assumptions](https://github.com/snorkel-team/snorkel/blob/main/snorkel/labeling/model/label_model.py): inspect votes, abstentions, overlap and conflict; do not treat correlated labeling rules as independent expert corroboration. Original analytics code written for PEE.
- **DeepKE**, [repository](https://github.com/zjunlp/DeepKE) and [DocRED paper](https://aclanthology.org/P19-1074/): preserve full-document identity, spans and mention links; Phase135 already implements a bounded portion.
- **medSpaCy**, [context rules](https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_rule.py): scope and negation need independent validation; Phase134 has bounded controls, Phase136 measures their outcome, without copying spaCy.
- **GLiNER2**, [schema and constraints](https://github.com/fastino-ai/GLiNER2): bounded typed candidates, alternatives and explicit infeasibility; no weights or Python service adopted.
- **TypeSafe AI**, [entity alignment](https://docs.typesafe.ai/cookbooks/entity_alignment) and [citation checks](https://docs.typesafe.ai/cookbooks/citation_check): separate atomic screened judgments from proof and consequence; proprietary API not used.

The licence and source-integrity studies bundled in `research/phase136_user_reference_studies/` describe their **previously observed** repository ZIP SHA-256 values and requirements. Their inclusion does not imply those third-party sources are executable runtime assets or commercially relicensed by PEE.

## Reproduction

```bash
npm run build
npm run test:phase136
npm run demo:phase136
npm run regress:phase136
python -m unittest discover -s primary_sources -t . -p 'test_*.py'
python -m unittest discover -s ingestion -p 'test_*.py'
python -m unittest discover -s tests-python -p 'test_phase133*.py'
```

This is a cumulative release. The root `README.md` and `package.json` are updated, and all prior files are preserved. Results and file-integrity manifest are in `PHASE136-RELEASE-VERIFICATION.json`.
