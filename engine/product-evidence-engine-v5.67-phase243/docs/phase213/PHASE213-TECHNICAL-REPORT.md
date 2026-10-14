# Product Evidence Engine — Phase213 technical report

**Date:** 2026-10-13  
**Predecessor:** v5.36.0 Phase212  
**Candidate release:** v5.37.0 Phase213

## Executive finding

Four code repositories uploaded by the user were inspected from their actual ZIP contents. **They contain source code, not usable Whisper/Qwen ASR weights.** The only large model-shaped file in WhisperX is a VAD component. The previously selected faster-whisper path is preserved. A native `whisper.cpp` CLI was compiled from user source and its version inspected (`1.9.5-dev`); no full speech recognition was possible because an actual model was missing and a download of Hugging Face's configuration was unsuccessful. The user's 65.2-second MP4 was cryptographically matched to the Phase210 receipt but was **not transcribed**.

The Phase213 increment offers a second **conditional** local CPU engine. Rather than building parallel quality and trust systems, the new adapter normalises actual whisper.cpp output into the existing Phase212 transient evaluation contract. Explicitly distinguishes engine identity and segment versus word timing. No ranking, expert accreditation, or scientific ASR-accuracy conclusions are enabled.

## Four-engine comparison and decisions

| Source code | Primary capability demonstrated by code review | Practical engineering decision |
|---|---|---|
| [SYSTRAN/faster-whisper](https://github.com/SYSTRAN/faster-whisper) | CTranslate2-based Whisper transcription; `word_timestamps`, multilingual decoding | Retain Phase212 as priority benchmark path; requires Python runtime and whole local CTranslate2 model directory |
| [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp) | Buildable native CLI, `-l auto`, JSON result timestamps in milliseconds | Phase213 optional CPU adapter implemented; source compiled but no model-run |
| [m-bain/whisperX](https://github.com/m-bain/whisperX) | Alignment, diarization, optional third-party models, language-specific phoneme resources | Preserve for later boundary-quality experiments; `assets/pytorch_model.bin` is for VAD and not an ASR model; other packages/models needed |
| [QwenLM/Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR) | 0.6B / 1.7B ASR architecture and separate 0.6B forced aligner, multilingual pipeline | Preserve as larger-model candidate; no trained weights in ZIP; no GPU/CPU performance demonstrated here |

The repository licensing files declare MIT (faster-whisper and whisper.cpp), BSD-2-Clause (WhisperX) and Apache-2.0 (Qwen3-ASR). These are code licenses; **the availability, usage terms, and redistribution of external model weights must be checked separately**. None of the four Python stacks has been installed as an automatic PEE dependency.

## Implementation and safeguards

1. Inspected `examples/cli/cli.cpp`: JSON has `params`, `model`, `result.language` and `transcription[].offsets.from/to` in milliseconds. `--output-json-full` exposes **token** information; it is unsafe to claim those as correctly aligned word boundaries.
2. `src/phase213_whispercpp_normalization.ts` enforces real CLI schema, no `--translate`, exact time limits, model multilingual flag, recognised engine version, unknown-language preservation, token/word separation and rejection of bad units or malformed data.
3. `scripts/phase213-whispercpp-local.mjs` validates model presence and rejects test-only or tiny model placeholders; checks SHA-256 for the original media; invokes FFmpeg and CLI only as local executables; uses private temporary files removed in `finally` and writes only the textless evaluation.
4. Extends the existing `evaluateLocalAsr212` instead of duplicating WER/CER calculations and retains `engine` in results to avoid mistaken provider attribution.
5. The source archives are preserved **verbatim** under `research/phase213-local-asr-source/` with SHA-256, licence findings and exact archive names. The previous three user-provided GitHub repositories remain in the predecessor tree.

## Verifiable results and limits

- Compilation: TypeScript build succeeded after using existing Node typings available in the test environment. No new server dependencies installed.
- C++ source: the user-supplied `whisper.cpp` compiled into a runnable local CPU CLI; `whisper-cli --version` returned `1.9.5-dev`. A host-specific executable was not bundled.
- The test-only `for-tests-ggml-base.bin` was refused before inference: **correct negative control**.
- Targeted TypeScript / CLI tests inspect real JSON structure using authored fixtures, units, no-transcript persistence, engine provenance, source/model hash validation, runtime type mismatch, language unknowns and wrong-scope handling.
- No complete multilingual model weights present: **0 completed real ASR inference runs**, **0 verified human audio reference transcripts**, **no WER/CER or language-switch accuracy** on the user MP4. Synthetic fixture checks must not be reported as scientific accuracy.

## Phase213 test totals

The release verification has 3,797 admitted TypeScript tests passing across 13 complete shards and the 11 admissible historical tests files, 212 Python tests passing in the six inherited groups, and two additional newly authored CLI tests passing (not in the TypeScript shard total). The Phase213 new TypeScript file contains 14 tests. The two historic Phase91/92 files are not counted. The real MP4 fingerprint check and refusal of an untrained placeholder model both succeeded. Complete logs are under `docs/phase213/test-logs/`.

The Phase212 future priorities continue: verified reference transcript, original-publisher identity, real ASR output, within-window code switching, timestamp/number correction, and evaluation on multiple languages and product categories.

## Original documentation links

- https://github.com/SYSTRAN/faster-whisper
- https://github.com/ggml-org/whisper.cpp
- https://github.com/m-bain/whisperX
- https://github.com/QwenLM/Qwen3-ASR
- https://huggingface.co/Systran/faster-whisper-base/tree/main
- https://huggingface.co/ggerganov/whisper.cpp/tree/main

These URLs provide documentation and model access paths, not assurances of quality or licence compatibility. `ggml-base.bin` must be the multilingual model, not the English-only `base.en` variant.
