# Product Evidence Engine — Phase215 continuity

**Canonical predecessor:** `product-evidence-engine-v5.38-phase214.zip` (cumulative, not its checkpoint).

## Verified Phase214

- Added `src/phase214_asr_model_integrity.ts` and `scripts/phase214-model-preflight.mjs` as a LOCAL artifact integrity gate with user-supplied SHA-256 pin, multilingual GGML header/size checks and entirely explicit `upstreamAuthenticated:false`, `trainedWeightsValidated:false`, `asrInferenceExecuted:false` status.
- Linked this gate to **the existing** `scripts/phase213-whispercpp-local.mjs`: genuine inference now requires a sixth argument containing the pinned model manifest. Preserve all prior Phase212/213 output schemas and ranking prohibition.
- Added `src/phase214_transcription_risk_audit.ts` reusing Phase212's validation; textless diagnostic counts for numeric-unit discrepancies and human-reference language transitions. This never verifies underlying product measurement claims or code-switch word precision.
- No downloaded/present ASR weights. No audio transcript recognized on the original MP4; WER/CER and scientific multilingual benchmark remain unknown. The original MP4 SHA-256 is `2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932` and the raw recording is **not** distributed.
- Tested TypeScript code, CLI controls, and cumulative Python groups. See Phase214 report/results/logs for exact verified totals. Historical Phase91/92 TS tests remain excluded/inconclusive. No model/runtime installed as a new dependency.

## Next highest value

Get complete trained multilingual GGML Whisper model weights from a trustworthy source, validate variant/version/legal provenance, and run on the exact original user MP4 with the Phase214 pin and Phase213 runner. Then obtain a human-verified transcript, evaluate errors including numeric product claims, mixed-language speech and timestamp drift using the existing Phase212 and Phase207/208 evaluators. Compare to faster-whisper, WhisperX, Qwen3-ASR only after their complete weights are available, and never treat transcript plausibility or source popularity as truth. Keep all existing source ZIPs and past research immutable.

## Permanent cumulative invariants

Never rebuild PEE from scratch, never infer product performance from transcript confidence or creator sentiment, never count repeated experiments twice, never retain full review texts, never auto-certify any creator/award or product. Ranking must remain deterministic for equivalent intent/constraints/evidence. Products without reviews are uncertain rather than bad. Task-specific specialist assessment complements technical testing. The user's seven GitHub source archives (YouTube.js, youtube-transcript-api, PyABSA, faster-whisper, whisper.cpp, WhisperX, Qwen3-ASR) remain study materials, not mandatory runtime dependencies.
