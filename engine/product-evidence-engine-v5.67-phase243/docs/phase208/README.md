# Phase208 — fixed-cohort, paired video-provider research trial

Release target: v5.32.0, 2026-10-13. This is NOT a live or independent scientific evaluation.

## Problem resolved in code

Before Phase208, Phase206 reported per-provider benchmark fields, and Phase207 admitted reviewed annotations via signed envelopes. Independent one-provider reports could not rule out selection bias (different video cases, versions, product variants, reviewer labels, or trust anchors). `src/phase208_paired_provider_trial.ts` now ensures *all* comparison arms use exactly the same scoped cases, source version via the case review, signing anchors and signed review set before calculating paired disagreements.

The implementation does NOT obtain YouTube media, run PyABSA, run YouTube.js, authenticate professional competence, change Phase197 sufficiency, or modify the public product ranking. It reuses Phase206/207 rather than creating an alternative evaluator or key registry.

## How to reproduce

```sh
npm run build
node --test dist/tests/phase208_paired_provider_trial.test.js
node scripts/phase208-public-metadata-fair-replay.mjs
```

The latter splits the **six real public-metadata leads** carried from Phase206 into espresso, air fryers and Japanese knives. These links have NOT been treated as authenticated video footage. Four named provider-family arms are registered but explicitly `not_executed`. Exactly **zero** original videos were analysed and no real independent labels or A/B accuracy exist. This replay demonstrates truthful missing-data behavior, not provider quality.

## What output fields mean

- `leftCorrectOnly`, `rightCorrectOnly`, `bothCorrect`, `bothWrong`: counts only where *both* methods answered and two signed reviewers agreed on a resolved field label.
- `leftOnlyResponded`/`rightOnlyResponded`: availability/abstention difference; **not** a win.
- `eligible`, `metadataOnlyCases`, `reviewedCasesWithTwoSignatures`: cohort and review status. Signed claims remain unverified real-world reviewer independence.
- `missingCriticalCriterionIds`: no signed, exact-variant, consensus annotation of the *requested kind*, not evidence that the product is bad.
- `essentialCriterionIdentification`: provider extraction on task-specific cases, **not** actual food taste, functional product performance or buyer satisfaction.
- Source authenticity, human independence, scientific accuracy, provider runtime, production rankings and public trust marks are always marked **not established**.

## Next real benchmark admission conditions

1. Recruit independent reviewers with verified discipline-specific professional experience where required, plus an annotator competent in the actual source language; record conflicts and tasks. Keep providers' output hidden during review.
2. Obtain each media source legally for actual examination. Record precise source/revision/access receipts, exact variant, criterion, and video timestamps. Document whether a transcript alone or footage plus audio was examined. Never infer media access from a YouTube URL.
3. Freeze provider predictions (including native code, YouTube.js, transcript-api and PyABSA where technically and legally usable) before opening labels. Run on **the exact same cohort**, documenting attempted retrieval, outcomes, wall-time, peak memory, costs, terms, dependencies and failure modes.
4. Independently label original/derived experiments (separate from recurring sentiments and repeat articles). Resolve reviewer disagreement without unblinded model adjudication. Only then compute precision/recall, false experimental merges and effects on the Phase197 decision and existing ranking. Validate credential and award scope before admitting specialist signals.
5. At least some niche/new products, different market variants, conflicts and culturally specific outcomes must be included. Do not treat absence of reviewed material as a zero quality score.

## Sourced methodology

- W3C PROV-O, https://www.w3.org/TR/prov-o/ — source/agent derivation concepts.
- Cochrane Handbook, https://www.cochrane.org/node/97 — collating distinct reports of the same study.
- NIST AI RMF, https://airc.nist.gov/airmf-resources/airmf/5-sec-core/ — documented, context-specific testing and limitations.
- YouTube Data API official `captions.download`, https://developers.google.com/youtube/v3/docs/captions/download — requires permission to edit the video.

Existing preserved candidates: user-supplied YouTube.js, youtube-transcript-api, PyABSA. They are **not** installed as production dependencies. Their original archive hashes are retained in `research/phase205-external-code/` and Phase205 audit notes.
