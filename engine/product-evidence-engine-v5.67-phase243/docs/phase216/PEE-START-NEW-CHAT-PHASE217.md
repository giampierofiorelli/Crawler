# Product Evidence Engine — Phase217 continuity

## Canonical predecessor

`product-evidence-engine-v5.40-phase216.zip` (full cumulative archive; not the incremental checkpoint). Read `PHASE216-TECHNICAL-REPORT.md`, `PHASE216-REAL-CLAIM-TRIAGE.json`, and prior Phase215 continuity/report.

## What Phase216 actually did

Introduced `src/phase216_primary_claim_triage.ts` and `scripts/phase216-real-video-replay.mjs`. Reused Phase210 upload receipt, validated Phase212 transcription, and correlated Phase215 cross-decode flags. Compared actual **user-video ASR** to **analyst-observed**, market-, condition- and exact-variant-scoped official manufacturer specifications; no publisher-byte authentication yet. Real replay outcomes: `possible_asr_unit_error` (3000 bits versus 3000 nits manufacturer peak-outdoor), `spec_quantity_matches` (up to 120Hz manufacturer specification), `market_scope_unresolved` (16 grams heavier across inconsistent region-specific weight sources). Not independent physical measurements. No claimed ASR WER/CER, no external authority/publisher authenticated, no ranking/trust authorization. Source URL list and replay in technical report.

## Next highest-value work

1. Identify actual publisher URL, original reviewer and exact regional model for user-uploaded comparison where possible; never infer them from the screen recording hash alone.
2. Integrate authoritative publisher bytes / timestamped specification versions via existing Phase69/201 controlled source acquisition and Phase193 memory, *without* building a second crawler or unconditionally trusting 'manufacturer' fields.
3. More sophisticated extraction from real audiovisual claims and the ability to prioritize uncertain numerical claims. Verify visual instrumentation and test protocols rather than merely same-time captions.
4. If second independent ASR model or original multilingual sample is available, evaluate under exact provenance and timed anchors. No assumption the current English clip proves mixed-language performance.
5. Preserve archives of the seven GitHub source repositories, existing Source Intelligence and ranking determinism, original-test provenance, sparse-products policy, specialist validation, and previous decisions. Never archive private full transcript or user video in the cumulative package.

## Validation boundaries

All Phase216 software tests and replay must be rerun after modifications. Phase91/92 old hanging tests remain outside admitted test baseline. The user will not provide a full human reference transcript; do not require one or invent accuracy.
