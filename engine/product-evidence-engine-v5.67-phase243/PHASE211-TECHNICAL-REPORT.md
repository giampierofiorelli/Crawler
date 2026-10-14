# Product Evidence Engine — Phase211 technical report

**13 October 2026.** Candidate v5.35.0; cumulative predecessor v5.34 Phase210. Scope: authentic *user-supplied excerpt* audio handling with cautious alignment to visual observations, not an authenticated publisher original, automatic spoken-language understanding or consumer product recommendation.

## Purpose and architectural integration

The buyer-facing goal remains to understand what the buyer wants, find independent relevant tests and real-world product outcomes, judge source expertise for each criterion, preserve niche products and uncertainty, and rank deterministically only from suitably validated evidence. Phase210 had already verified the bytes of one 65.2-second user-uploaded screen recording and four visual frames. Phase211 extends that **existing** receipt instead of creating an independent ingestion, crawler, trust score, source authority registry, recommender or review-text archive.

`src/phase211_audio_claim_alignment.ts` links to `UserUploadReceipt210` and guards the exact upload SHA-256, duration and known unverified scope. `scripts/phase211-audio-timeline.mjs` uses existing FFmpeg system tooling: no model, commercial STT API or package dependency was installed.

## Engineering changes

1. The offline CLI SHA-256 streams local MP4 bytes and rejects alteration or substitution **before** calling FFmpeg. It checks the audio stream and the clip's duration with ffprobe.
2. FFmpeg `silencedetect` extracts intervals below a fixed threshold (-20 dB for at least 0.4 s). This is an intentionally limited *acoustic activity* cue; threshold choice is engineering configuration, **not** an empirically validated voice-activity threshold. Speech, music and edits can overlap.
3. A strict ephemeral SRT/VTT parser permits captions supplied by an authorized caller, a local ASR workflow or one reviewer, preserving stated origin and tool version. The research result stores cue IDs, timing, criterion and analyst-selected claim kind **without raw transcript bodies**.
4. Timestamp-proximate visuals are marked `temporal_proximity_only`, not corroborating evidence. Even a reported thermal number, an outcome judgement or a claimed specification remains unverified until the instrument/method and original source are independently checked.
5. All new output explicitly preserves `independentGoldLabels: 0`, `rankingAuthorized: false` and `trustBadgeAuthorized: false`.

The user-supplied video and the original three research ZIPs (YouTube.js, youtube-transcript-api, PyABSA) were not discarded. The MP4 itself is **not redistributed** in the release.

## Actual uploaded MP4 analysis (real bytes; not speech transcription)

- Input `ScreenRecording_10-13-2026 11-35-17_1.mp4`; **47,544,531 bytes**, 65.2 seconds.
- Upload SHA-256 **`2ffa85cdab9abe838265d83c0faaf01ae4d5e564ad276496e95d8ec23b19c932`**, equal to the Phase210 receipt.
- FFmpeg silence-detector settings: -20 dB, 0.4 second minimum.
- Intervals below threshold: **39.974–40.416 seconds** and **51.565–52.025 seconds**. These are NOT established speech pauses; no ASR text, speaker identification or validated spoken claim exists.
- Product identities presented on screen, any displayed thermal figures, camera specifications and apparent presenter identities remain externally unverified.
- Output `PHASE211-USER-VIDEO-AUDIO-RECEIPT.json`: contains no raw audio, media frames or spoken words; zero admitted scientific evidence events.

## Evidence levels and test status

1. **Verified local computation:** identical input bytes, audio stream parsed, FFmpeg filter completed, metadata produced.
2. **Software test fixtures:** SRT/VTT input parsing and adversarial claim alignment with authored fictional text, **not** an assessment of the original recording's dialogue.
3. **Not performed:** audible speech transcription, ASR error-rate evaluation, source-channel identification, original-upload authentication, reviewer qualification, independent blinded human labels, protocol provenance and downstream ranking effects.

The previous Phase91/92 runner files were repeatedly inconclusive. Record all new and cumulative test outcomes by their actual logs, not inferred from the prior version.

## External documentation and why it supports only a bounded implementation

- FFmpeg official filter reference — [silencedetect](https://www.ffmpeg.org/ffmpeg-filters.html#silencedetect): the filter reports sections below a specified amplitude threshold for a specified duration; **not** speaker diarization or ASR.
- W3C — [PROV-O](https://www.w3.org/TR/prov-o/): recording attribution and source derivation is distinct from demonstrating that the source's content is true.
- W3C — [WebVTT](https://www.w3.org/TR/webvtt1/): timed-text structure; parser here is a bounded subset and not claimed fully conformant to the standard.
- [OpenAI Whisper repository](https://github.com/openai/whisper) and [whisper.cpp repository](https://github.com/ggml-org/whisper.cpp): examples of possible offline ASR tools for future evaluation; no model weights available or installed in this environment, and neither was evaluated for transcription accuracy.

## Comparison with v5.34 and next work

The Phase210 receipt proved an MP4 upload could be probed and sampled visually but did not inspect its audio. Phase211 adds genuine audio filter operation on **the same original upload**, a byte-bound audit and a timed-text/claim intake path. It does not yet solve the high-value missing scientific question: what exactly did the presenter say, and was that demonstrated by a qualified and independent original test?

Next: acquire a functioning, licensable local speech-to-text model or authorized transcript; establish its language, coverage and time-alignment error on independently reviewed speech samples; verify the publisher original; then recruit genuinely independent qualified annotators and pass only admissible cases to Phase206–208 paired evaluation. Maintain all cumulative source-evidence and non-compensatory decision constraints.
