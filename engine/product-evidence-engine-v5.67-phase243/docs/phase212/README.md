# Phase212 — Offline multilingual ASR adapter (conditional on locally supplied engine + model)

**Scope:** An opt-in, executable local *adapter* for faster-whisper, not a demonstrated transcript of the original uploaded video. No weights, no ASR package, no transcript outputs or source media are distributed. PEE Phase210/211 source receipts and all earlier controls remain authoritative. **No downstream ranking or trust badge.**

## Chosen research direction

- Primary: [SYSTRAN faster-whisper](https://github.com/SYSTRAN/faster-whisper) (MIT) using a locally supplied CTranslate2 model, CPU INT8 and word timestamps. It is an *optional* Python dependency, deliberately not installed in PEE by default.
- Alternative: [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (MIT), with a different model format. Evaluate memory and timestamp precision before adoption.
- Further research: [WhisperX](https://github.com/m-bain/whisperX) (language-specific forced alignment), [Qwen3-ASR](https://github.com/QwenLM/Qwen3-ASR) and [NVIDIA NeMo](https://docs.nvidia.com/nemo/speech/nightly/asr/asr_checkpoints.html). No benchmark outcomes claimed.

## Local operation after provisioning dependencies

1. On a system with Internet access, provision `faster-whisper` in a separate environment, and activate it *before* invoking the Node bridge. For example, `python3 -m venv /path/pee-asr-venv`, then `source /path/pee-asr-venv/bin/activate`, then `pip install faster-whisper huggingface_hub`. Pin and review dependencies for production. Do not alter PEE's production runtime by default.
2. Download a **complete** converted multilingual CTranslate2 model directory, including `model.bin`, `config.json`, `tokenizer.json` and other required files, from a documented source such as [Systran/faster-whisper-base](https://huggingface.co/Systran/faster-whisper-base/tree/main). One approach with the HF CLI installed is `hf download Systran/faster-whisper-base --local-dir /path/to/converted-model-dir`. `model.bin` alone is insufficient. Verify provenance and pin versions. Do not use `.en` models if the task is multilingual.
3. Keep the model directory **outside** the PEE release ZIP and configure its absolute local path. The bridge refuses absent weights; `local_files_only=True` disallows model downloads.
4. `npm run build`, then `node scripts/phase212-local-transcribe.mjs --probe`.
5. To process the Phase210-verified original user upload:

```
node scripts/phase212-local-transcribe.mjs PHASE210-USER-VIDEO-RECEIPT.json /path/to/exact-original.mp4 /path/to/converted-model-dir /tmp/phase212-textless-result.json
```

The exact video SHA-256 must match the Phase210 receipt. Only **derived textless metadata** is written. Recognition text travels solely inside the Python child process's captured stdout pipe and the Node parent's process memory. Do not run the Python child directly with stdout redirected to a file if no transcript retention is desired. No audio or word text is written by the bridge.

## Multiple languages in one video

`--strategy multilingual_windows` is used with 15-second windows, fresh language autodetection per window and word timestamps. The windows are *not* proof of the true language of each word or each speaker. Code-switching inside a window or at its boundary can be missed or mistranscribed. Windows are cut at fixed times, so sentence truncation is a known accuracy risk. This is a conservative **pilot**, not language diarization or a precision-certified multilingual model. No translation or language-specific expert authority is inferred.

## Diagnostics and benchmarking

The typed `evaluateLocalAsr212` accepts ephemeral text, checks segment/word timing, exact source and local model hashes, and emits only counts, language-window changes, and optional **diagnostic** WER/CER/timestamp-boundary error against an analyst's provisional reference. Those diagnostics are not scientifically validated accuracy estimates, even when numerically zero. For true external evaluation, use signed reviewer workflows from Phase207, source originals, native-language reviewers and truly independent blinded references.

No language segment is assumed verified, no speech-content claim is promoted, and no product ranking or specialist validation is altered. Preserve all three user-provided reference ZIPs: YouTube.js, youtube-transcript-api, PyABSA.

## Verified execution and blockers in this environment

- FFmpeg available. Original Phase210 MP4 present and Phase211 source hash known.
- `faster-whisper` module **absent** and **ASR model weights absent**. This environment cannot resolve the Hugging Face model host.
- Node capability probe succeeds and reports unavailable model/runtime; the Python runner rejects missing model folders before inference, without writing text or pretending to transcribe.
- 23 focused software checks pass (19 evaluation tests, 4 CLI negative/probe tests). No actual inference, measured WER, CER, per-word timestamp accuracy or code-switch recall for the uploaded video.
