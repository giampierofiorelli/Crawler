# Product Evidence Engine — Phase 216 continuity

**Canonical predecessor:** `product-evidence-engine-v5.39-phase215.zip` (full cumulative release, not incremental checkpoint).

## Phase215 verified

- The user provided a real 65.2-second screen recording and the `ggml-base.bin` multilingual model. File SHA-256 and model SHA-256 are in `PHASE215-TECHNICAL-REPORT.md` and `PHASE215-REAL-ASR-CROSSDECODE.json`.
- Locally compiled whisper.cpp 1.9.5-dev **actually transcribed the recording** into 13 English time-coded segments; the user confirmed the subject is correct. There is no and will not be a user-provided human reference transcript. Do not make it a blocker or invent WER/CER.
- Phase215 `src/phase215_asr_crossdecode_review.ts` adds *textless* cross-decoding triage using Phase212 validation, not a second ASR accuracy engine. Two passes on the same model found a suspect display-brightness unit during 45–60 seconds. Neither pass verifies the spoken word or any manufacturer claim. 9 targeted tests passed.
- Full/regression details in `PHASE215-TECHNICAL-REPORT.md`, `PHASE215-TEST-RESULTS.json` and `docs/phase215/test-logs/`.
- Historical Phase91/92 TypeScript files remain excluded from the admitted suite; no ranking/award/badge authority changed.

## Next increment, measurable objective

Use genuine video and its original publisher URL if accessible to verify source and variant identity, and extract timestamped, provenance-labeled claims. Where possible, triangulate suspect measurements against primary specifications, visible measurement protocols and a second *different* ASR model; do not treat model agreement, plausible units, topical accuracy or likes/follower counts as scientific evidence. Evaluate whether these checks reduce consequential wrong claims without a reference transcript. For mixed-language capability, obtain a naturally code-switched video and measure only what labels actually support. Preserve the seven original GitHub repositories as study references. Do not archive proprietary full transcript or uploaded user video.

## Unchanged permanent constraints

Continue cumulative architecture/research; no parallel ranking/ingestion; source and claim-specific competence; independent original experiments versus copies; historic screening memory Phase193 reuse only with eligible byte/authentication scope; non-compensatory safety and intended product outcome; rare products not excluded for missing reviews; deterministic ranking; clearly differentiated specialist approvals and awards; never claim measured accuracy without ground truth. The user does not wish to produce a complete human transcript.
