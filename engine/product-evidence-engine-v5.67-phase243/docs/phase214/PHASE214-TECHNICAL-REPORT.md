# Product Evidence Engine — Phase 214 technical report

**Date:** 2026-10-13  
**Predecessor:** v5.37.0 Phase213  
**Candidate cumulative version:** v5.38.0 Phase214

## Decision and result

The immediate user goal is **genuine local transcription of the supplied MP4, including mixed-language speech where present, with timestamp and error validation**. This is **not yet accomplished**. The user's four ASR source-code archives (faster-whisper, whisper.cpp, WhisperX and Qwen3-ASR) have no complete trained multilingual weights. The runtime also failed to resolve Hugging Face during a HEAD probe against the model download endpoint on 2026-10-13. No local complete GGML/CT2 ASR weight file was found. This phase must not report transcript text, measured WER/CER or code-switch accuracy.

Instead, the highest demonstrable bounded improvement is a **model integrity preflight** connected to the actual Phase213 runner, plus a **unit-bearing numeric claim discrepancy audit** over ephemeral Phase212 transcripts and optional *analyst-only unverified* reference. Neither reimplements Phase212 ASR scoring or Phase207 signed gold admission.

## Existing architecture reused

- Phase210 user-video SHA-256 receipt, no raw file in distribution.
- Phase211 transient audio/visual synchronization and timestamped SRT/VTT ingestion.
- Phase212 local ASR validation and WER/CER diagnostics, without gold-label claims.
- Phase213 compiled whisper.cpp CLI and window normalization.
- Phase207 signed independent gold-label admission is separate; no rating/publisher authenticity inferred.
- Phase192–205 evidence lineage, publisher competence, commercial conflicts, consumer trust and rankings are not modified.

## New code

1. `src/phase214_asr_model_integrity.ts`: validates a versioned analyst-supplied manifest, SHA-256 consistency, GGML header bytes, plausible model size, allowed multilingual vocabulary (51865 or 51866) and rejects `.en` or test-only filenames. Returns only a **local-research-only** qualification. An attacker could create a fake file, pin its own hash and imitate the first bytes, so this does **not** authenticate weight provenance or completeness.
2. `scripts/phase214-model-preflight.mjs`: streams the full local model SHA-256 from disk; reads the first eight GGML bytes and checks the manifest. Does not download, install, decode or retain the model. Emits only a textless integrity receipt with `upstreamAuthenticated:false`, `trainedWeightsValidated:false`, `asrInferenceExecuted:false`.
3. Existing `scripts/phase213-whispercpp-local.mjs` now **requires the manifest as a sixth argument before any inference**. A legacy five-argument invocation that otherwise has a model, valid receipt and executable cannot proceed to inference. A matching pin cannot authorize a product ranking.
4. `src/phase214_transcription_risk_audit.ts`: explicitly invokes Phase212's original validator, then flags unit-bearing numeric discrepancies (e.g. 41 °C versus 47 °C) between ASR hypothesis and an unverified analyst reference; preserves only counts, no words, extracted numbers, subtitles or personal transcript. No context, spoken-number, unitless-value or cross-language semantic equivalence is established. Language switches in analyst-labelled segments are only counted, not verified as word-level switch accuracy.
5. Twenty-two new TypeScript software tests and three separate CLI tests cover forged pin, spoofable GGML header, size, language-specific weights, absent model, text retention, numeric disagreements, duplicated figures and language-switch status.

### Running locally when a model is actually available

The input file must be the complete **multilingual** `ggml-base.bin` or another supported multilingual GGML Whisper model. The same binary model must be available during preflight and inference. Its license and authoritative origin require independent checks. Obtain it from the upstream model page, not from random mirrors; confirm its exact variant. The repository's model table exposes **40-character SHA-1 values** in its `SHA` column, **not SHA-256**. Do not paste an upstream SHA-1 into the SHA-256 manifest field.

Construct a `pee214.local-model-pin.v1` JSON manifest with `modelId`, `expectedSha256`, `modelFormat="whisper-ggml"`, `multilingualRequired=true`, `provenance="analyst_supplied_pin"`, plus `sourceUrl` and `licenseUrl` HTTPS references. Record the actual local file SHA-256 with `sha256sum`. A locally generated pin is only a reproducibility marker; verifying upstream authenticity requires a separate trusted digest/attestation.

```bash
npm run build
node scripts/phase214-model-preflight.mjs model-pin.json /path/to/ggml-base.bin local-model-qualification.json
node scripts/phase213-whispercpp-local.mjs receipt210.json original.mp4 /path/to/ggml-base.bin /path/to/whisper-cli out.json model-pin.json
```

The original MP4 and Phase210 receipt must match byte-for-byte. The `whisper-cli` executable is built separately from the user-supplied whisper.cpp code, and real trained weights are not bundled. The ASR output remains research-only even after successful execution. A language assigned to an inference window is not a scientifically validated label for every word in that window.

## Verified execution and benchmark limitations

- Input video file exists; its SHA-256 matches the Phase210 baseline: `2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932`.
- Internet model download **not available** from this runtime (DNS resolution failed).
- The model-integrity helper and numeric discrepancy validator ran on **authored synthetic fixtures**; successful assertions do not measure ASR accuracy or experimental provenance.
- No trained model ran on the user's speech. No original real-video transcript or independent human reference was created.
- It is impossible to quote WER, CER, code-switch recall, numeral accuracy or recommendation uplift at this stage.
- **3,819 admitted TypeScript tests passed** across 14 test groups; **212 Python tests passed** across six inherited groups. The phase added **22 TypeScript tests and three CLI tests**, all passed. The complete cumulative test results are recorded in `PHASE214-TEST-RESULTS.json` and raw logs under `docs/phase214/test-logs/`. The historical Phase91/92 TypeScript test files remain out-of-scope due to their known inconclusive runner behavior.

## Methodological sources and code references

- Original whisper.cpp model catalogue, naming, sizes, SHA column and declared license: https://huggingface.co/ggerganov/whisper.cpp
- Whisper.cpp original source/model converter, `0x67676d6c` model magic and `n_vocab` logic, examined in the **user-supplied** archived repository: https://github.com/ggml-org/whisper.cpp
- WhisperX academic paper (recognition errors, timestamp drift and forced alignment): https://arxiv.org/abs/2303.00747
- Faster-whisper original source (multilingual windows and word timestamps): https://github.com/SYSTRAN/faster-whisper
- User-supplied Qwen3-ASR original source: https://github.com/QwenLM/Qwen3-ASR
- User-supplied WhisperX original source: https://github.com/m-bain/whisperX

The source references support implementation mechanics and known concerns; they are **not independent validation of Phase214 ASR accuracy**.

## Next phase, prioritized by actual user value

Obtain one real model file with license and version, ideally multilingual `ggml-base.bin`, and check its origin and SHA-256 independently. Run whisper.cpp on the exact MP4, keeping the transcript transient, and manually verify both audio and timestamps. Benchmark it against faster-whisper on the **same media and reference** only after obtaining its complete model and runtime. Prioritize numbers, technical claims, brand/model identifiers, translation drift and language switches. Keep the three earlier GitHub source repositories and four ASR repositories cumulative, but do not install them all or make a provider choice without measured benefit.
