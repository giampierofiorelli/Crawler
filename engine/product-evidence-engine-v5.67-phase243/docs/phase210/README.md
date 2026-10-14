# Product Evidence Engine — Phase210: first user-provided audiovisual review excerpt

**Date:** 2026-10-13. **Cumulative successor candidate:** v5.34.0 based on verified full v5.33 Phase209. **Status:** real MP4 upload inspected; offline decoding and integrity receipt working; external original-video authenticity, complete speech understanding, expert qualifications and independent scientific labels NOT established.

## Strategic objective

The buyer-facing PEE must decide whether a product fulfills a concrete need on evidence: technical performance, relevant specialist outcome validation, authentic experiences and well-scoped uncertainty. The user supplied an actual 65.2-second MP4 screen recording. The next measurable step is admitting it as a *user-supplied excerpt of unknown publisher provenance* without misrepresenting it as an authenticated original video or a validated experiment.

## Source and actual observations

- Received file: `ScreenRecording_10-13-2026 11-35-17_1.mp4`; original uploaded byte length **47,544,531**; SHA-256 **`2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932`**.
- Container MP4, H.264 video 1112 × 512 at 30 fps; AAC audio track at 44.1 kHz; duration 65.2 seconds.
- Screens observed at multiple times show onscreen text identifying the subject as "iPhone 18 Pro Max" and a comparison labeled "iPhone 17 Pro Max". This is a *title claimed in the screen recording*, NOT publisher/product/model authentication.
- At ~10 s: on-screen claim of adjustable aperture. At ~20 s and ~60 s: smartphone camera interfaces demonstrated outdoors. Around 25 s: thermal image with displayed temperature values; the instrumentation, conditions, reproducibility and exact model identity are not established. At ~30 s and ~55 s: edited visual comparisons of handset design/screen.
- Two different presenter shots appear in this excerpt. This is not enough to identify them, their expertise, relationship to the channel, or original event lineage.
- Audio **exists** but was **not transcribed** in the current runtime. Claims made orally cannot be characterized from these frames. No verified speech timestamps, original YouTube URL, original full-video byte hash or creator credentials are available.

### Distinct evidence levels

1. **Verified media processing:** uploaded file exists, exact uploaded bytes SHA-256 computed, ffprobe parsed streams, four PNG frame samples decoded by FFmpeg, frame hashes and timestamps persisted, sample images deleted.
2. **Preliminary manual image observations:** visual notes by one analyst, explicitly not blinded or independently corroborated; see `docs/phase210/first-real-user-clip-notes.json`.
3. **Unverified external facts:** exact model, claimed camera hardware features, scientific validity of thermals, source author expertise, reviewer independence, sponsor relation and product recommendations.

The recording is an excerpt of a displayed review; even matching its local hash again would only prove the same **uploaded recording**. It would not verify publisher originals or demonstrate a lab test. No captions or video are bundled into the PEE release.

## Engineering changes

- `src/phase210_user_supplied_video.ts` adds a strict receipt for externally provided MP4 screen recordings, disjoint from the Phase209 Wikimedia original-WebM receipt. Reuses Node built-in SHA-256. Enforces exact schema, bounded bytes, MP4 signature, video timestamp order, no extraneous transcript fields and explicit zero gold labels.
- `scripts/phase210-user-clip-probe.mjs` runs offline `ffprobe` and `ffmpeg`, checks real codec/container and duration, samples four frames into a temporary folder, persists only metadata, hashes and analyst observations, and deletes transient PNG files. No internet access or vendor API dependency. Reuses the Phase209 media-decoding pattern rather than establishing a second crawler or ranking system.
- `tests/phase210_user_supplied_video.test.ts` and `tests/phase210_user_clip_probe.test.mjs` exercise tampering, false authenticity, source mismatch, injected transcript, duration errors, numeric bounds, actual synthetic MP4 decoding and omitted evidence.
- `docs/phase210/first-real-user-clip-notes.json` provides seven image-derived, non-gold annotations tied to approximate local times; no full editorial text, uploaded media or person identification is stored.

## Verification and reproducibility

The source code compiles via `npm run build`. A targeted combined suite for Phase203–210 passed **262 of 262 tests**, including **16 new Phase210 targeted tests** (14 TypeScript and two CLI). On the real user-uploaded MP4, `node scripts/phase210-user-clip-probe.mjs docs/phase210/first-real-user-clip-notes.json <input.mp4> <output.json>` emitted a receipt with **65.2 seconds, hasAudio=true, four sampled decoded frames, zero scientific gold labels, sourceOriginalAuthenticated=false**. Its standalone output is `PHASE210-USER-VIDEO-RECEIPT.json` and is not a product assessment.

Cumulative regression details are in `PHASE210-TEST-RESULTS.json` and test logs under `docs/phase210/test-logs/`. The two inherited Phase91/92 hang-prone files are tracked as *not concluded*, not silently passed.

## Risk and limits

- **Source rights:** provision of a screen recording does not imply rights to redistribute a review. The full MP4 is excluded from the distributed ZIP; any future storage or public display requires a separate rights review.
- **Audio:** no speech-to-text weights or service used; do not claim the PEE understood the spoken discussion.
- **Video security:** `ffmpeg`/`ffprobe` are invoked with bounded timeouts and ephemeral files, but no hardened media-decoder sandbox or production transport implemented.
- **Annotation:** frame inspection by an assistant is not blinded independent expert annotation. The system must not use these notes as scientific benchmark gold.
- **Scope:** this is not a full-video original retrieval, live YouTube pipeline, validated product benchmark, credential check, ranking change, or consumer trust badge.
- **Model claim caution:** names, temperatures and feature claims seen on an edited recording remain on-screen assertions, not verified statements about commercially available hardware.

## Comparison with Phase209

Phase209's authenticated *reference type* applies narrowly to media pages on Wikimedia Commons and WebM. Phase210 adds actual locally supplied MP4 screen recording bytes as a distinct research input while preserving Phase209 semantics and the Phase206–208 benchmark. It validates decoding on real uploaded footage rather than exclusively synthetic footage. It does **not** turn a user-uploaded excerpt into publisher-authenticated bytes or grant evaluation authority.

## Next stage: Phase211

1. Establish a reproducible audio transcription path with verified timestamp alignment where tooling and rights allow; check a sample manually. Do not call generated ASR text authoritative.
2. Recover an independently documented original review/video URL and investigate the reviewer's relevant expertise/conflicts; retain an explicit unknown when unavailable.
3. Split each spoken technical assertion and visual demonstration into criterion-scoped claim candidates. Audit thermal instrumentation and model variants.
4. Obtain two genuine independent human reviewers with validated competence for the specific criterion, freeze provider predictions, and use the already implemented Phase206–208 paired benchmark only once sufficient evidence exists.
5. Maintain the three archived GitHub technologies (YouTube.js, youtube-transcript-api, PyABSA) as candidate methods; no unvalidated deployment or runtime dependencies.
