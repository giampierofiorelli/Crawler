# PEE Phase213 — Source-code audit and two-engine offline-ASR pilot

**13 October 2026 · candidate v5.37.0 · research-only, no trained weights bundled.**

## Audited user-provided source archives

| User ZIP | Observed code | Model files observed | Role |
|---|---|---|---|
| `faster-whisper-master.zip` | Python `WhisperModel` and VAD/test fixtures | No complete CTranslate2 `model.bin` | Primary candidate for **word-level** timestamps; Phase212 adapter remains intact |
| `whisper.cpp-master.zip` | Native C/C++/ggml code, CLI and JSON output | `for-tests-ggml-*.bin` **are empty test model shells**, not inference weights | New optional locally built CPU alternative; CLI was successfully compiled in this environment (`1.9.5-dev`) |
| `whisperX-main.zip` | WhisperX ASR, language-dependent alignment and diarization code | Included `whisperx/assets/pytorch_model.bin` belongs to pyannote VAD, **not** a complete transcription model | Candidate for later *timing* improvement; additional model licenses and runtime required |
| `Qwen3-ASR-main(1).zip` | Qwen3-ASR model/inference code for 0.6B/1.7B series | No complete 0.6B/1.7B weights or forced aligner weights | Larger multilingual ASR alternative with separate model download and accelerator considerations |

Source ZIP checksums, sizes, licenses and preservation policy are recorded under `research/phase213-local-asr-source/`.

## Code increment

* `src/phase213_whispercpp_normalization.ts`: parses the **actual** `whisper-cli -oj` JSON structure; converts `offsets.from`/`to` from **milliseconds** to global video seconds; checks multilingual model flag and `translate=false`; leaves `words=[]` because segment timing / token timing is not verified word alignment.
* `scripts/phase213-whispercpp-local.mjs`: optional executable with explicit local `whisper-cli` path and >25MB complete model path; verifies the exact Phase210 user-file SHA-256 receipt; uses FFmpeg to create **temporary** 15-second WAV windows; requests `-l auto` separately for each; reads temporary CLI JSON, deletes WAV/JSON in a private scratch directory and writes only textless Phase212 output.
* `src/phase212_local_asr_evaluation.ts`: extends, rather than duplicates, the Phase212 evaluator to accept a typed `whispercpp_local` engine and preserve provider identity. The evaluation still cannot authorize public ranking, trust badges or independent gold labels.

## How to execute (with separately provisioned models)

The native executable built **for the current Linux host** is not distributed as a portable dependency. From the reviewed whisper.cpp source, build with CMake, then provide a complete multilingual GGML model (`ggml-base.bin`, **not** `ggml-base.en.bin`, and not a `for-tests-*` file).

```bash
npm run build
node scripts/phase213-whispercpp-local.mjs --probe
node scripts/phase213-whispercpp-local.mjs \
  /private/PHASE210-USER-VIDEO-RECEIPT.json \
  /private/ScreenRecording.mp4 \
  /private/ggml-base.bin \
  /private/whisper-cli \
  /private/phase213-evaluation.json
```

The CLI was built successfully from the uploaded source, but **no actual speech-to-text inference ran** because the user supplied source ZIPs only, with no trained ASR model. Do not interpret the compiler, CLI `--version` check, artificial fixtures or reject-invalid-model test as recognition accuracy.

## Code-switching limits

Repeating `-l auto` every 15 seconds provides tentative **window** language inference, not reliable language labels per word. Switching languages within a window, background music, product names, numeric values and code-switch timing remain untested on real data. The CLI JSON segment boundaries are not proven per-word alignments. The existing Phase212 faster-whisper path remains preferred for future word-timestamp experiments. Any WER/CER requires actual decoder output and an independently checked reference transcript; no such baseline is available yet.

## Provenance, safeguards and priorities

The exact uploaded MP4 remains outside the release. The derived result stores only source fingerprint, model fingerprint, selected engine, counts, coarse inferred language counts and missing-validation flags. The evaluator is **research-only** and must not create product evidence, source authority, rankings or public specialist approvals.

Next: provision a complete multilingual local model, run on the exact Phase210 MP4, compare against faster-whisper on identical hardware and human-labelled segments; measure WER/CER, timestamp error, cross-language confusion, spoken numerical-value errors, hallucinations, runtime and memory. Compare Qwen3-ASR and WhisperX only after measured value outweighs deployment costs and after model licenses and practical conditions are checked.
