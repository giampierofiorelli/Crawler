# Product Evidence Engine — Phase 212 technical report

**Date:** 13 October 2026  
**Predecessor:** v5.35 Phase211  
**Candidate release:** v5.36 Phase212  
**Status:** Executable *conditional* offline ASR integration and validated diagnostic contracts. **No successful speech-to-text inference in this environment; no measured real-audio ASR accuracy.**

## Executive finding

PEE already knew how to verify a user-supplied MP4, inspect some frames (Phase210), analyze audio amplitude and accept authorized SRT/VTT text transiently (Phase211). The remaining problem was identifying the spoken words and language changes. The research-selected primary path is **faster-whisper on CPU INT8 with a locally provisioned multilingual CTranslate2 model**. It supports per-segment word timestamps and an option to repeat language detection during decoding. For a conservative, traceable pilot, Phase212 uses **15-second inference windows**, each separately detected, and explicitly marks possible intra-window switching as unresolved. It does not assign language to each word as fact.

An alternative worth continuing to study is `whisper.cpp` using different GGML/GGUF model files. Forced alignment with WhisperX can improve timing estimates but adds models and constraints by language. Qwen3-ASR is a further candidate, with a separate forced aligner and heavier runtime. None of these are installed or benchmarked in this release.

## Source research and documentation

| Source | Documented capabilities | Inference limits / relevance |
| --- | --- | --- |
| [faster-whisper repository](https://github.com/SYSTRAN/faster-whisper) | Offline CTranslate2 Whisper; CPU `int8`; `word_timestamps`; optional `multilingual` setting | Model files and Python/CTranslate2 runtime required; author-reported speed claims not a PEE benchmark |
| [faster-whisper implementation](https://github.com/SYSTRAN/faster-whisper/blob/master/faster_whisper/transcribe.py) | Language detection and alignment behavior | Per-window detection is not verified language diarization at word level |
| [Code-switching discussion](https://github.com/SYSTRAN/faster-whisper/discussions/1026) | Reports ability and limitations of `multilingual=True` | Rapid mixed-language speech may not be detected, `Segment` does not expose verified per-window language for every word |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | Local C/C++ inference and optional token timestamps | Requires separately supplied model, quality and performance not verified in PEE |
| [GGML converted models](https://huggingface.co/ggerganov/whisper.cpp/tree/main) | Published model artifact sizes/hashes | Not the same file format as faster-whisper CTranslate2 |
| [Systran faster-whisper-base](https://huggingface.co/Systran/faster-whisper-base/tree/main) | Multilingual converted model files, approximately 148 MB combined | Model is **not present** locally; complete directory, not just `model.bin`, is needed |
| [WhisperX](https://github.com/m-bain/whisperX) | Forced word alignment with language-dependent phoneme models | More compute and per-language model availability required |
| [Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR) | Multilingual ASR and optional forced timestamp alignment | Heavier model; prospective only |
| [W3C PROV-O](https://www.w3.org/TR/prov-o/) | Provenance and derivation distinctions | Source authenticity does not establish the truth of product claims |
| [NIST AI RMF](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/) | Validity, documentation and independently examined evaluation | Signed/pinned evaluation necessary to make decision claims defensible |

## Implemented code

- `src/phase212_local_asr_evaluation.ts`: text-ephemeral typed evaluator; validates source/model hashes, engine version, word/segment timing and language-window annotation; derives optional diagnostic WER/CER, exact-ID boundary MAE and language agreement when analyst notes are provided; serializes **no transcript or gold text**, and always reports `independentGoldLabels: 0`, `rankingAuthorized: false` and `trustBadgeAuthorized: false`.
- `scripts/phase212-faster-whisper-local.py`: optional actual CPU inference adapter, with `local_files_only=True`, SHA-256 guard, FFmpeg audio passed through stdout memory instead of a WAV file, word timestamps and separate 15-second model decoding windows. No dependency is installed automatically.
- `scripts/phase212-local-transcribe.mjs`: checks exact Phase210 receipt and upload bytes, passes the authorized local model directory to Python, captures transient text internally and writes only a metadata result when inference genuinely completes. `--probe` reports availability. A missing model or package fails closed.
- `tests/phase212_local_asr_evaluation.test.ts`: 19 focused authored software cases, including code-switch window handling, Unicode/CER, timer validation, source binding, no persistent text and intentionally untrusted diagnostic references.
- `tests/phase212_asr_cli.test.mjs`: four actual subprocess/CLI tests for capabilities and controlled failure when the model is unavailable or the source has changed.
- `docs/phase212/README.md` provides exact, local-only activation steps.

## Executions actually performed

- **Source inspection:** verified Phase211 source modules, continuity and original packaged code. Three historical GitHub repositories preserved.
- **Compilation:** TypeScript build succeeded.
- **Targeted:** 23/23 tests passed (19 TypeScript, four Node CLI tests).
- **Offline engine probe:** reported `pythonPackageAvailable:false`, `modelWeightsBundled:false`, `inferenceExecuted:false`.
- **Real MP4 attempted as a negative control:** supplied original file SHA-256 `2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932`; explicit failure when local model directory was missing. **No transcription performed**.
- **Gold references:** none. **No real-audio WER, CER, language switch error rate, timestamp mean error, or user recommendation effect can be reported.**

See `PHASE212-TEST-RESULTS.json` for cumulative regression results and the persisted group logs under `docs/phase212/test-logs/`.

## Comparison to Phase211

Phase211 checked acoustic amplitude and could align *externally supplied* timed captions with visual observations. Phase212 adds an offline-ASR runtime boundary which can execute once **separately installed** model/runtime files exist, with strict no-auto-download and no-transcript-persistence enforcement. It also adds diagnostic comparison contracts. It does **not** yet overcome the missing weights, the lack of independently transcribed reference speech, nor prove reliable multilingual language switching.

## Constraints, errors and next decision

1. The container has no installed faster-whisper or ASR weights and DNS resolution to the model host failed. CPU-only inference was **not executed**. Source correctness alone cannot demonstrate end-to-end model function or quality.
2. Fixed-window segmentation may truncate words, miss rapid switches and introduce timestamp artifacts. The window's detected language is a hypothesis, never a fact about all its words.
3. `WER` depends on tokenization and human reference quality. The included calculation is diagnostic only; it is not an independently validated ASR benchmark, and character error rate is especially important for languages without whitespace word boundaries.
4. A user-supplied screen recording is not an authenticated publisher original; numbers on a phone-review video still need a method and reviewer/source verification.
5. Full text should remain transient and only where access rights permit. Artifacts store metadata and source pointers, not copyrighted reviews or transcript bodies.
6. **Next step:** provision a complete pinned multilingual CTranslate2 model and optional faster-whisper runtime outside the core PEE package; run the real 65.2 s original, compare with a native-speaker reference, measure numeric-claim error, word-time error and within-video code switches. Evaluate `whisper.cpp` as CPU alternative on the same source. Do not deploy based solely on software fixtures.
