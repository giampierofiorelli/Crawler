# Product Evidence Engine — Phase 215: First real local transcription and self-consistency triage

**Date:** 2026-10-13  
**Candidate release:** v5.39.0, cumulative successor to v5.38.0 (Phase214)  
**Evidence classification:** actual uploaded video and actual locally run model; deterministic software tests; **no independent gold transcript and no measured ASR accuracy**.

## Objective and user's clarified requirement

The user will **not** provide a human reference transcription and has confirmed that the model correctly identified the topic of the video. This confirmation supports topical relevance, **not** word-level transcription accuracy or the truth of product claims. Phase215 therefore does not demand human transcription as a precondition for useful progress, does not compute fictitious WER/CER, and does not admit product measurements into ranking. The PEE must produce a focused review queue for consequential claims while preserving its research-first, independent-consultant mission.

## Source and model really exercised

- User-provided screen recording: 47,544,531 bytes; SHA-256 `2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932`. Approximate media duration 65.2 seconds. This hash identifies the uploaded recording, **not** the original published video.
- User-provided multilingual `ggml-base.bin`: 147,951,465 bytes; SHA-256 `60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe`.
- `whisper.cpp` locally compiled from the previously attached source; CLI identified version `1.9.5-dev`. Full-clip offline inference exited 0. English was detected, model-estimated probability ~0.9985. Runtime around 10 seconds, CPU, not a universal benchmark.
- **13 time-coded segments** were produced in the full-clip pass. A separate pass over five approximately 15-second windows produced 20 shorter segments in total. Both are outputs of the **same model and same source**. They do not constitute independent scientific evidence.
- The user confirmed the subject matter of the review (comparison of iPhone models, camera, processor, physical design, display). Product model names mentioned by the video and any claims about specs remain unverified against manufacturer originals and the review's provenance.

## Engineering increment

`src/phase215_asr_crossdecode_review.ts` extends Phase212 evaluation without rewriting it. Its `assessCrossDecode215()`:

- Accepts a full-clip and windowed `Transcript212` for the same upload, same model hash, engine and engine version, with explicit window starts and validated temporal bounds.
- Reuses `evaluateLocalAsr212` to reject malformed input.
- Identifies within-window differences in numeric quantities and their unit words, including context-sensitive questionable unit forms in display-brightness discussion; marks missing coverage between passes.
- Produces only alert types and time ranges, not transcript content, numerical claim values, text fragments or phonetic hashes.
- Declares `wordErrorRate:null`, `characterErrorRate:null`, `languageChangeAccuracy:null`, `claimVerified:false` and `productEvidenceAdmissionAuthorized:false`. A clean comparison does **not** certify accuracy.

The actual textless replay result (`PHASE215-REAL-ASR-CROSSDECODE.json`) identifies a **45–60 s review window**, with `context_sensitive_unit` and `unit_disagreement`. The full pass decoded a brightness unit as “bits” and the short-window pass as “hits” (brief diagnostic examples only); neither is accepted as the correct word. “Nits” is a plausible interpretation requiring external verification of the spoken audio or original specifications, not an automatically corrected claim. No other numeric-unit disagreement was flagged under this deliberately narrow detector. This is **not** a claim that the remaining transcript is correct.

Both passes identify English. Mixed-language recognition has **not been demonstrated** on this English clip, despite the model being multilingual.

## Tests and exact scope

- TypeScript build passed; new targeted tests: **9/9 passed**.
- Cumulative admitted TypeScript suite: **3,828 tests passed in 14 shards**; historical Phase91 and Phase92 test files excluded consistently with predecessor. Shard logs included.
- Python regressions: **212 tests passed** in six groups (47 primary, 21 ingestion, 26 evaluation, 12 phase95, 35 tests-python, 71 companion); logs included.
- No new runtime dependency was introduced. The older seven user-supplied GitHub source repositories remain part of the predecessor and unchanged.
- The small authored fixtures validate algorithm behavior; the user MP4 exercises real ASR and one observed cross-decode alert. Neither is an independent benchmark of classification or recommendation quality.

## High-priority next work

1. Verify suspect units, numbers and product/variant claims by original audio and independent primary specifications where accessible. Agreement between two passes must never be treated as proof.
2. Connect flagged claims to original source identity, actual review methodology and frame evidence with timestamps. Do not infer original author identity from screen recording bytes.
3. Test mixed-language clips with genuine language switching; quantify code-switch performance only with external verifiable labels when obtainable, or report diagnostic consistency without accuracy claims.
4. Compare against faster-whisper and other retained source projects only after their trained weights and required runtime are available; benchmark equal source and settings.
5. Keep all user-supplied media and model weights outside the redistributable cumulative ZIP; retain only fingerprint, engine/model provenance, logs and textless diagnostics.

## Original project references

- whisper.cpp source: https://github.com/ggml-org/whisper.cpp
- Whisper model files: https://huggingface.co/ggerganov/whisper.cpp/tree/main
- Whisper research implementation: https://github.com/openai/whisper
- faster-whisper source: https://github.com/SYSTRAN/faster-whisper
- PEE prior methods: `PHASE212-TECHNICAL-REPORT.md`, `PHASE213-TECHNICAL-REPORT.md`, `PHASE214-TECHNICAL-REPORT.md` contained in the cumulative package.

These references describe the tools and design. They do not establish the word-level correctness of the audio supplied in this phase.
