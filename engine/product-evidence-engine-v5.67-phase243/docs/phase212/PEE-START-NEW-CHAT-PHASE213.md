# Product Evidence Engine — Phase213 continuity

**Canonical predecessor:** `product-evidence-engine-v5.36-phase212.zip`. Cumulative continuation only. Preserve all code/research and bundled original YouTube.js, youtube-transcript-api, PyABSA ZIPs. Do not add duplicate search, ranking, reviewer or evidence storage systems.

## Phase212 actual completion

- `src/phase212_local_asr_evaluation.ts`: guarded textless local-ASR evaluation and optional **non-independent** diagnostics (WER, CER, timestamp-boundary MAE, language window agreement).
- `scripts/phase212-faster-whisper-local.py` & `scripts/phase212-local-transcribe.mjs`: optional local faster-whisper CPU INT8 with SHA-256-bound Phase210 user media, local CTranslate2 directory required, zero auto-download, 15-second window language detection and word timestamps; text only in transient process memory.
- 19 TypeScript and four real CLI tests pass. **No inference on real speech was completed:** both `faster-whisper` and multilingual model weights are missing locally, and the environment cannot reach model servers.
- Source SHA for exact user MP4: `2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932` (65.2 seconds). Do not include original copyrighted media in the release. Phase210/211 original video receipts are authoritative.
- The code neither promotes user/audio claims nor alters ranking or trust badges. All scientific gold labels remain zero.

## Next highest-value work

1. Install/provision `faster-whisper` *in an isolated runtime* and a complete pinned multilingual CTranslate2 model (e.g. from `https://huggingface.co/Systran/faster-whisper-base/tree/main`) via lawful available distribution; do not require users to authorize each video owner. The user may upload the complete model directory ZIP if network model retrieval stays blocked. Only install after dependency/license/security assessment.
2. Run inference on the exact Phase210 original MP4; manually audit representative short excerpts with a competent multilingual listener and record words/phrase timestamps and source language switches. Distinguish *provisional* hand transcription from independently verified Phase207 gold.
3. Compare the same file, human annotations, and hardware with `whisper.cpp`; quantify WER/CER, numerical-term error, timing error, language confusion, hallucinations on music and code-switch boundaries, RTF/memory/cost. Keep `whisperX` and `Qwen3-ASR` as research alternatives, not default runtime dependencies.
4. Use Phase206–208 paired benchmark with signed independent gold only after actually qualified reviewers examine source audio, and ensure an original publisher link is verified before source authority or product recommendations.
5. Maintain no raw transcript retention by default, rank invariance for identical canonical intents, sparse products discoverable, measured and practical specialist evidence separate, honest stop conditions, awards and YouTube creator expertise scoped to the test.
