# Product Evidence Engine — Phase205, v5.29.0

**Date:** 13 October 2026. **Base:** uploaded `product-evidence-engine-v5.28-phase204.zip`. **Scope:** provider-honest offline search/video transcript normalization and scoped video opinion classification, plus permanent retention of all three GitHub code archives as research candidates. **Status:** software pilot only, no actual YouTube retrieval, production endorsement, scientific calibration or ranking changes.

## Answer first

The repository comparison exposed a real interoperability gap. Phase203 accepts an official YouTube Data API search response, but the user-supplied YouTube.js code uses the undocumented InnerTube representation and transcript segment millisecond-string offsets, while youtube-transcript-api returns float-second timestamps and distinguishable human/ASR tracks. PyABSA supports aspect-centric sentiment rather than a single positive/negative video score. An adapter now makes the shapes and provenance explicit, reusing existing Phase203 evidence and Phase204 creator/method review, not replacing those modules.

**The three projects have not been abandoned.** Original user-uploaded full archives of YouTube.js 18.1.0, youtube-transcript-api 1.2.4 and PyABSA 2.4.3 live unchanged in the cumulative release under `research/phase205-external-code/`, with verified SHA-256, licenses contained in the source archives, and an explicit evaluation backlog in `SOURCE-RETENTION-REGISTER.json`. They remain external engineering references, not runtime imports or automatic install dependencies.

## Implementation

- `src/phase205_video_provider_normalization.ts` provides `normalizeVideoDiscovery205`, `normalizeTranscriptTrack205`, and `inspectTranscriptAspects205`.
- Discovery requires an EXISTING Phase203 plan/job, distinguishes `youtube_data_api_official_snapshot` from `youtubejs_parsed_snapshot`, rejects crossed input shapes and malicious video URL aliases, merges same-video hits only as metadata candidates, and exposes contradictory channel/date hints. No channel popularity, global reputation or article-level test originality assumption.
- Transcripts accept YouTube.js `start_ms/end_ms` strings, youtube-transcript-api `start/duration` floats, or reviewed operator timestamps. Input arrays remain ephemeral. The returned summaries contain counts, boundaries, selected track language and separate verified-original-language signal, caption kind, availability and missing checks. Overlapping captions are legal; invalid/overflow timestamps, wrong units and unreviewed access are rejected. No source text, video bodies or unkeyed short-text digests are stored.
- Aspect annotations from human or AI may classify personal taste, day-to-day use, claimed measurement, claimed visual demonstration, method and promotions by **criterion**, timestamp and discipline. Delegation to Phase203 preserves no-event-merge and textless/provisional claims; Phase204 assesses independently human-reviewed or AI-only methodological hints. No automatic truth claims or an aspect sentiment model fitted from source video.
- A track and its Phase203 batch must have the same video, language and access review, and an identical provider identity/version. This prevents false provider provenance. A creator's professional ability and a product award remain solely in Phase204's existing separate reviews, not inferred from captions.
- `tests/phase205_video_provider_normalization.test.ts` adds synthetic and adversarial tests (see detailed log); no third-party dependencies were installed. `docs/phase205/README.md` documents integration and planned independent evaluation. The repository archives and prior external audit are preserved in full.

## Repository decision log (unchanged source archives)

| Source | Version from uploaded code | Useful implementation | Decision | Evidence gap before integration |
|---|---|---|---|---|
| [YouTube.js](https://github.com/LuanRT/YouTube.js) | `youtubei.js` 18.1.0 | Parsed search objects, transcript lookup, ms-string offsets, language menu | Retain original archive and patterns; no runtime integration yet | Unofficial InnerTube evolution, access/terms, reliability, hosting footprint, versioning |
| [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api) | 1.2.4 | Segments with seconds/duration, ASR status, explicit access errors | Retain original archive and patterns; no automatic downloading | Reliable and permissible retrieval; API changes and cloud blocking; Python bridge overhead |
| [PyABSA](https://github.com/yangheng95/PyABSA) | 2.4.3 | Aspect-polarity and opinion triplets | Retain original archive; classify through native annotation DTO now | Specialized transcript benchmark; model language/genre suitability, PyTorch/Transformers size and Python compatibility |

Code-package MIT licences apply to the library implementations, **not** to YouTube audio, video or captions. The supplied archive and prior source audit support the architecture findings, but do not establish actual accuracy, rights clearance or performance of the third-party projects in the PEE environment.

## Official operational references

- YouTube Developer Policies (June 2026 revision): https://developers.google.com/youtube/terms/developer-policies — public search-engine status does not automatically establish a scraping exemption; undocumented API access and scraping restrictions matter.
- YouTube API Developer Policies Guide: https://developers.google.com/youtube/terms/developer-policies-guide — search engines providing additional value are examples of allowed *API* use under conditions.
- Captions download authorization: https://developers.google.com/youtube/v3/docs/captions/download — owner/editor permission required for official caption download. This module does not call it.
- Previous static source audit: `docs/phase205/GITHUB-SOURCE-AUDIT.md` (full original analysis of three user archives and original package checksums).

## What is not claimed

No fetching or caption extraction from live YouTube was performed. No real creator, external credential, award or original test event was authenticated; all new fixtures are synthetic. Whether PEE legally or technically qualifies as a public search engine for platform scraping remains unresolved. Neither a PyABSA sentiment label nor a model's claimed video understanding proves taste quality, professional competence, performance or visual originality. The v5.28 scoring/ranking and public badge are unchanged. The source archives will be revisited in Phase206 for an independently labelled real comparison, not dropped.

## Phase206 benchmark gates

Acquire a modest, legitimately processable labelled set spanning espresso, Japanese sushi knives and unrelated appliances, and mark precise product variant, source/event identity, spoken vs translated captions, sponsor status, specific technical/practical/taste claims and creator specialism. Measure aspect extraction precision/recall, timestamp alignment, unsupported visual inference, reviewer-qualification attribution, false independent experiment merges, cost/failure/latency, niche creator omission and change in evidence sufficiency. Compare the current bounded native approach to optional implementations from the **three preserved repositories** (and model components only when licensed/feasible). No threshold or model integration without measured benefit and explicit scope.

## Reproducibility and regression notes

Full evidence, exact executed commands, counts, exceptional timeouts and individual log paths are in `PHASE205-TEST-RESULTS.json` and under `docs/phase205/test-logs/` in the cumulative release. Tests assert typed offline transformations and SHA-256 archive integrity; they cannot establish live video, expert or award correctness.

## Verified software tests and previous-version comparison

- TypeScript build succeeded; **57/57 new Phase205 tests passed**.
- **3,620 TypeScript test passes independently verified** across completed shards and separately completed Phase78–95 files. The historic Phase91 and Phase92 test files timed out repeatedly: **not counted as passes**, so the full TypeScript cumulative suite is **not** certified green. Previous v5.28 reports 3,580 passes for its own run; the counts are not directly comparable due to the unfinished files in this run.
- Python: **212 passed**, five groups directly and the 71 companion cases after an isolated rerun. An overlapping run had two subprocess timeouts, documented; the repeat was green with existing ResourceWarnings.
- All tests added by Phase205 are authored synthetic cases, not independently annotated original videos. Three user-provided source archive ZIPs passed full ZIP integrity and SHA-256 checks; original source code was not copied into runtime modules.
- One new research module, one new targeted test module, two new compiled outputs and Phase205 docs/archives; pre-existing algorithms not replaced.

