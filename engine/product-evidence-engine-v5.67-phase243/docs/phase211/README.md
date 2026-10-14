# Phase211 — Byte-bound audio timeline and ephemeral caption alignment

This is a limited, **research-only** successor to `phase210_user_supplied_video.ts`.

- `scripts/phase211-audio-timeline.mjs` receives the prior Phase210 receipt, the **same** local MP4, and an output path. It verifies the complete upload SHA-256 and byte length before FFmpeg processing, verifies the presence and duration of an audio track, and performs FFmpeg `silencedetect` (fixed -20 dB, minimum 0.4 seconds). It does **not** detect speech, speakers, words, expertise, or the publisher's original media.
- `src/phase211_audio_claim_alignment.ts` validates a strict, optional SRT/VTT caption representation (`user_supplied_captions`, `local_asr`, or `single_reviewer_transcription`) and criterion-specific *analyst-provided* claim types. It links a cue to nearby Phase210 on-screen notes by timestamp. Matching time is not corroboration. The output contains **no subtitle text**, no automatically inferred claims, no gold labels, no product ranking authority, and no trust badge.
- Neither YouTube.js, youtube-transcript-api nor PyABSA was installed. Their complete source ZIPs remain in the cumulative package for future comparative trials.

Run offline from project root after `npm run build`:

```sh
node scripts/phase211-audio-timeline.mjs phase210-receipt.json supplied.mp4 receipt211.json
```

Optional *caller-authorized* captions and manual annotations:

```sh
node scripts/phase211-audio-timeline.mjs phase210-receipt.json supplied.mp4 receipt211.json \
  --captions captions.srt srt user_supplied_captions captions-v1 \
  --annotations annotations.json
```

Annotations JSON is `{"language":"en","annotations":[{"claimId":"c1","cueId":"cue1","criterionId":"taste.espresso","kind":"outcome_judgement"}]}`. The sample is constructed, **not a transcription or finding** about the user's phone-comparison clip. Input files and temporary transcript cues must be handled with appropriate rights and ephemeral retention. Caller is responsible for providing actual transcripts; no ASR weights or service are bundled.

Relevant documentation:
- [FFmpeg silencedetect](https://ffmpeg.org/ffmpeg-filters.html#silencedetect) documents threshold-based *silence*, not voice activity identification.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/) distinguishes source attribution, derivation and relations.

See `PHASE211-TECHNICAL-REPORT.md` at release root. The real MP4 and captions are **excluded** from the distributed package.
