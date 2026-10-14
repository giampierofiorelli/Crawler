# Product Evidence Engine — Phase 216: scoped primary-specification cross-check of real review audio

**Date:** 2026-10-13  
**Cumulative predecessor:** `product-evidence-engine-v5.39-phase215.zip` (v5.39.0)  
**Candidate:** v5.40.0  
**Status:** bounded research implementation and repeatable real-input replay; **not** publisher-byte authentication, independent test verification or product-ranking validation.

## Executive result

The first genuinely transcribed user-uploaded video, a 65.2-second screen recording, contained three scoped numerical statements for which an analyst could find corresponding manufacturer specification pages. Phase216 compares the original Whisper hypothesis (not a silently amended transcript) with typed, market- and condition-scoped manufacturer facts. The video source and claim author are **not authenticated**. A manufacturer specification, even when corroborating the same figure, is **not** an independent performance measurement. No public ranking, scientific accuracy figure or trust badge is authorized.

### Genuine replay (not synthetic input)

- Source: original user-uploaded MP4, SHA-256 `2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932` (identifies **the screen recording**, not the publisher original).
- Model: actual `ggml-base.bin` run in Phase215, SHA-256 `60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe`; whisper.cpp 1.9.5-dev output, no WER reference. Phase215 second pass with *same* model supplied correlated disagreement flags.
- **36.08–41.92 s, 16 grams heavier:** `market_scope_unresolved`. Apple UK's iPhone 17 Pro Max page reports 231 g while a Latin-American Apple page reports 233 g. Apple's UK iPhone 18 Pro Max lists 249 g, and the video market/hardware identity is not independently established. Sources must not be blended across incompatible markets or hardware variants. The 16 g spoken difference is *not* declared false or true by this tool.
- **47.20–51.84 s, 3,000 “bits” (Whisper):** `possible_asr_unit_error`; a scoped Apple manufacturer page states outdoor peak brightness 3,000 **nits**. Another decode of the *same model* reported a different suspect word (“hits”), so the ASR surface word is not validated. The manufacturer number/unit is a reference hypothesis, **not** proof of what was spoken, observed display brightness or independent measurement.
- **47.20–51.84 s, 120 hertz:** `spec_quantity_matches` Apple manufacturer's *maximum/adaptive refresh-rate specification*, **not** an observed or measured 120 Hz performance result.
- Output is in `PHASE216-REAL-CLAIM-TRIAGE.json`. It contains no transcript body, article body, frames or user video.

## Engineering changes

- `src/phase216_primary_claim_triage.ts` introduces `triagePrimaryClaims216`, calling the existing Phase212 strict transcript validation and requiring the exact Phase210 upload identity and Phase215 same-model triage identity.
- Claim probes require an explicit criterion, exact variant, test/advertised condition, time range, ASR segment IDs, numerical value and **literal ASR unit**; the claimed pair must actually exist in the transient original transcript. This prevents silently changing `bits` to `nits` or inventing a claim.
- Typed source observations carry individual fact IDs, primary publisher URL, model, market, field, condition, value, unit, time of analyst observation and the explicit lack of publisher-byte authentication. Contradictory manufacturer observations in the **same** scope block positive matching. Incomparable markets/conditions and absent pairwise weights produce uncertainty, not spurious confirmation.
- Visual proximity is reported only as a temporal cue and is never treated as photographic validation. Reviewer-measured values cannot be verified merely because manufacturer specifications agree. Independent measurements, product suitability, ranking and public trust badges remain disallowed.
- `scripts/phase216-real-video-replay.mjs` consumes locally available Phase215 Whisper JSON and Phase210/215 derived receipts, compares with versioned analyst source observations in `docs/phase216/primary-source-observations.json`, and writes only a textless structured research output. This script runs offline; it does not fetch publisher pages or require cloud model inference.
- 20 targeted tests cover cross-market weights, matching and suspect units, source contradictions, condition and variant differences, false measurement admission, fabricated ASR quotes, output text hygiene, duplicate identities and deterministic order.

## Evidence, scope and provenance

These are **primary publisher pages observed via web research**, not downloaded and SHA-256 authenticated manufacturer source bodies:

1. Apple UK iPhone 18 Pro and Pro Max specifications (249 g, 3000 nits **peak outdoor**, ProMotion **up to** 120 Hz): https://www.apple.com/uk/iphone-18-pro/specs/
2. Apple UK support, iPhone 17 Pro Max (231 g; display specification): https://support.apple.com/en-gb/125091
3. Apple Latin America support, iPhone 17 Pro Max (233 g): https://support.apple.com/en-la/125091
4. Apple international support, iPhone 18 Pro Max (249 g; 3000 nits peak **outdoor**; up to 120 Hz): https://support.apple.com/en-euro/148591
5. NIST, metrological traceability policy, requiring measurement-specific process and reference documentation: https://www.nist.gov/metrology/metrological-traceability
6. W3C PROV-O for qualified distinctions between attributed/derived/primary sources: https://www.w3.org/TR/prov-o/

**Evidence levels:** source web observations above are authentic *publisher-page observations* gathered in the current research, not raw publisher-signed evidence; the speech hypothesis is actually generated Whisper ASR; the video remains a user-uploaded screen recording of a review with no original publisher URL; test fixtures are synthetic; no independent gold labels are available. Do not interpret this as measured real-world extraction precision, recall or scientific product validation.

## Checks and regression

The new module compiled with the existing TypeScript build and passed **20/20 targeted tests**. The original Phase215 admitted suite has 3,828 TypeScript tests, run in 14 groups without the old Phase91/92 hanging files. See `PHASE216-TEST-RESULTS.json` for exact current verification and log counts. The six historical Python groups were rerun separately. No new PEE runtime dependency or independent crawler was installed.

## Limits, next work

1. Publisher identity and original video: screen recording SHA does **not** authenticate the original reviewer; obtain the actual original URL/metadata if possible without assuming that channel or the experiments are authentic.
2. Spec authenticity and freshness: use Phase69/201 acquisition controls and Phase200 review policy when valid authenticated bytes and external approvals are available. The current source observations are from manual research and cannot authorize publication.
3. More fields: the current mechanism is for scoped **numerical specification statements**, not arbitrary causal/expert judgements, original bench data, camera-image quality or qualitative outcome validation. It does not understand a video without an ASR transcript.
4. Exact units/conditions: 3,000 nits **peak outdoor** must not be compared with normal brightness or HDR; ProMotion up to 120 Hz is not proof of continuous 120 Hz in a test.
5. Conflicting manufacturer regional weights may reflect different marketed models, versions or publication errors; do not automatically resolve based on oldest page or favorable number.
6. A second independent ASR model and genuinely code-switched video remain untested; same-model pass agreement is correlated and not measured accuracy.
7. Do not store entire review transcripts or full video; preserve only scoped derived facts, flags and URLs needed for lawful reacquisition and review.

## Next measurable milestone (Phase217)

Get real original reviewer provenance or a second genuine review segment and compare this bounded claim-checker's evidence routing to Phase182 research planning. Evaluate precision of source-to-field matching only when reviewed labels exist; include negative tests for variant aliasing and conflicting edits to primary pages. Keep all prior repositories as reference sources, not automatic runtime requirements.
