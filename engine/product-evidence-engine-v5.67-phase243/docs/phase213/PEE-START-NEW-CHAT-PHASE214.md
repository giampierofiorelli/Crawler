# Product Evidence Engine — Phase214 continuity

**Canonical predecessor:** `product-evidence-engine-v5.37-phase213.zip`. Continue cumulatively; do not replace the PEE, reimplement ranking/search/sufficiency/lineage/creator authority, or lose prior user-supplied GitHub source ZIPs.

## Phase213 confirmed

- The user uploaded four additional original code repositories: faster-whisper, whisper.cpp, WhisperX, Qwen3-ASR. All are inside `research/phase213-local-asr-source/` with per-archive SHA-256 manifest, alongside the three older original repositories preserved in `research/phase205-external-code/`.
- No complete trained multilingual ASR weights were present. The WhisperX 17MB `.bin` is a VAD auxiliary, **not ASR transcription weights**; whisper.cpp `for-tests-*` placeholders are **not trained**. Environment failed a small Hugging Face configuration download. Do not say user MP4 speech has been transcribed.
- User's original Phase210 MP4 SHA-256: `2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932`; do not include the raw MP4 in the ZIP.
- Built user-supplied whisper.cpp C++ CLI successfully on local CPU, output `whisper.cpp version: 1.9.5-dev`. Host-specific compiled binary **not** shipped. ASR inference on real audio: **zero**; full trained model absent.
- `src/phase213_whispercpp_normalization.ts`, `scripts/phase213-whispercpp-local.mjs` added as optional second local engine. It adapts whisper.cpp's JSON milliseconds to global video seconds; every 15s optionally redetects language; never equates token timestamps with verified word boundaries.
- Reused/extended the Phase212 evaluator (also `dist` JS) to retain engine provenance in research-only output. No impact on public ranking, trust badges, expert identity or sufficiency gates.
- Verified 3,797 TypeScript tests across all admitted groups, 212 Python in previous six baseline groups, plus two new CLI tests. Historic Phase91/92 TypeScript files remain excluded/inconclusive. No ASR WER/CER or human-independent gold-label accuracy measured.

## Next highest-value task

Obtain one **complete multilingual model** with provenance and separately verified licensing. Prefer starting with `ggml-base.bin` for locally built whisper.cpp or full Systran faster-whisper-base CTranslate2 model directory with its `model.bin`; do not use an English-only `.en` version for code-switch tests. Only after obtaining weights run on the exact MP4, inspect speech in short multilingual windows, and perform manual competent transcription and timestamp checks. Make an apples-to-apples comparison on the same source/hardware. Measure WER/CER, code-switch confusion, numeric product-claim mistakes, token alignment accuracy, hallucinations, memory, run time, and avoid false expert identity or product-ranking promotion. WhisperX and Qwen3-ASR remain candidates subject to licensing, dependencies and measured benefit.

## Exact background research

See `docs/phase213/PHASE213-TECHNICAL-REPORT.md`, `docs/phase213/README.md`, `research/phase213-local-asr-source/PHASE213-SOURCE-AUDIT-MANIFEST.json`, as well as all earlier Phase192–212 cumulative technical docs. The user demands strict source provenance, claims scoped to variants, results not opinions, no duplicate tests counted twice, no full publisher review storage, independent expert competence relative to precise task, and determinism for equivalent ranking inputs.
