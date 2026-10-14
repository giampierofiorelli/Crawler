# Product Evidence Engine — Phase203 technical report

**Date:** 2026-10-13  
**Version:** v5.27.0, derived from the complete v5.26.0 Phase202 archive.  
**Status:** implemented, compiled, synthetic software tests passed; **not** independently validated as a real-world YouTube review retrieval or authenticity engine.

## Executive result

The user wants PEE to operate as a product-evidence search engine and to discover specialist reviews on YouTube without asking each creator for permission. This phase introduces the first typed, deterministic **video search/evidence candidate** layer, *reusing* Phase182 research jobs, Phase196 source-intelligence assumptions, Phase192–195 provenance rules and Phase198 task-specific expertise requirements. No competing crawler, canonical ranking, trust-mark authority, caption scraper, video downloader, runtime model dependency or repository of full transcripts was introduced.

**Code:** `src/phase203_video_evidence_search.ts`; **tests:** `tests/phase203_video_evidence_search.test.ts`; `package.json` updated to `5.27.0` with `npm run test:phase203`.

## Implemented behaviors

1. `canonicalYouTubeVideo203`: restricted HTTPS YouTube watch/shorts/live and youtu.be URL normalization. Ignores tracking metadata for identity; rejects userinfo, redirects, look-alike hosts and malformed IDs.
2. `planVideoSearch203`: maps *existing* Phase182 exact-variant research jobs to multilingual search candidates, keeping both scoped known-method search and open expert exploration. Language/market hints do not certify skill; language is a relevance probe only. No job automatically scheduled or executed.
3. `inspectYouTubeSearchSnapshot203`: accepts **externally provided official search.list response metadata**, extracts canonical video/channel/date/title with bounded validation and video ID deduplication. It does not call YouTube itself; it cannot establish exact variant, expert qualifications, sponsorship absence or original tests from metadata.
4. `inspectVideoObservations203`: consumes transient, bounded **operator/provider annotations**, records time-coded claims and links to possible existing written-test event groups. Distinguishes spoken claims, merely claimed visuals, reviewed-but-not-independently-authenticated observations, claimed measurements, specialist opinions and promotions. An AI annotation cannot declare itself a human-checked visual demonstration. Outputs remain candidates only.
5. Review-required, ranking and authority gates: no independently verified events, specialist endorsement, public badge, ranking change or experiment fusion authorized; videos are not counted as independent simply because they are a separate publication.
6. Raw captions and excerpts are never in output. Short-text fingerprints are **not created by default**; optional per-session caller-supplied keys produce HMAC-SHA-256. No keys or raw text are serialized to outputs. This avoids misleading full-source hash claims and reduces short-text dictionary/linkability risks.

## Comparison with Phase202

| Aspect | Phase202 v5.26 | Phase203 v5.27 |
|---|---|---|
| Official registry adapter | Offline ENERGY STAR scoped candidate reconciliation | Preserved unchanged |
| YouTube | Feasibility research only | Typed discovery plan, metadata adaptation, time-coded observation intake and duplicate-event cues |
| Actual caption/AV retrieval | None | None; intentionally no unapproved scraping |
| Source/channel expertise | Research guidance | Review gate flags, not automatic authenticating expertise |
| Product ranking/trust badge | Unchanged | Unchanged |
| Model API | Not installed | Not installed; optional provider can supply provisional structured annotations |

## Research and access routes

- **Official YouTube metadata discovery:** `search.list` documents video results and channel/video IDs, requiring YouTube Data API project access and quota. No creator OAuth is needed for ordinary public metadata search. https://developers.google.com/youtube/v3/docs/search/list ; https://developers.google.com/youtube/v3/getting-started
- **Direct public video understanding:** Google Gemini documentation describes analysis of public YouTube URLs, including timestamped audiovisual queries. Provider credentials/terms and model behavior still apply; it is not a licence to republish whole transcripts nor proof that an observation is real. https://ai.google.dev/gemini-api/docs/video-understanding ; https://ai.google.dev/gemini-api/terms
- **Captions:** official API cannot generally download arbitrary third-party caption files without the necessary permissions. https://developers.google.com/youtube/v3/docs/captions/download ; https://developers.google.com/youtube/terms/developer-policies
- **Unapproved extractors:** `youtube-transcript-api`, `yt-dlp` and `YouTube.js` document technical access through unofficial interfaces. Their OSS licences do not confer copyright or platform access rights to the captions. https://github.com/jdepoix/youtube-transcript-api ; https://github.com/yt-dlp/yt-dlp ; https://github.com/LuanRT/YouTube.js
- **Originality:** W3C PROV-O is the reference for distinguishing generation, attribution and derivation: https://www.w3.org/TR/prov-o/ . Cochrane's multiple-reports-of-the-same-study methodology motivates not double-counting one event: https://training.cochrane.org/handbook/current/chapter-04

The verified documentation establishes *technical possibilities*, not that PEE now retrieves/arbitrates live video reviews or has a blanket commercial right to copy captions.

## Tests — exact scope and outcomes

- TypeScript compile (`tsc -p tsconfig.json`): **passed** during implementation, including inherited sources and new tests, with preinstalled local Node types and no new PEE package dependencies. A later re-run through `npm` was interrupted by runner timeout after starting compilation; do not count that attempt as a second completed verification.
- Focused Phase203: **46/46 passed**, via `node --test dist/tests/phase203_video_evidence_search.test.js`. Synthetic/constructed scenarios, not independent video labels.
- Cumulative TypeScript: **12/13 sharded groups passed (3,362 tests)**. Seven isolated files from the remaining group passed (103 tests) and three additional isolated files passed (42 tests): **3,507 successful test cases confirmed across disjoint completed runs**. Phase91, Phase92 and Phase93 historically problematic runners did **not** complete in this session; no clean full-corpus success claim.
- Python: **141 tests passed** in five groups (primary 47, ingestion 21, evaluation 26, Phase95 12, tests-python 35). Companion group did not complete within environment limit, so cumulative 212/212 cannot be asserted for this run.
- All command logs and partial results are included in `docs/phase203/test-logs/`. User-provided Phase202 passing results remain in the cumulative archive as predecessor evidence, not a substitute for new execution.

## What remains unverified

1. The code does not yet perform a live public-URL Gemini inference call, a YouTube Data API search request, or any caption extraction. It adapts externally retrieved data; service/API keys, terms, quotas, cost and stability require a separate deployment decision.
2. Titles and channel names do not demonstrate testing expertise. No real credential authentication, exact visual validation, real article/video event genealogy or independent source snapshots were evaluated.
3. Models may hallucinate visual events and timecodes; created annotations need independent source review, calibration and false-positive benchmarks across categories and languages.
4. Metadata and externally supplied text may have platform retention or copyright constraints. Verify before persisting even title metadata. HMAC sketches need protected per-session keys, rotation and threat modelling if persisted later.
5. No improvement in recommendations, ranking or purchasing outcomes has been demonstrated. No automatic source inclusion/public badges.

## Phase204 priority

Within the **existing** Phase182 pipeline, connect one genuinely permitted search feed, such as official YouTube metadata through an operator-managed API key *or* the already-available general search source, and evaluate retrieval on authentic videos from espresso, sushi knives and an unrelated appliance category. Separately evaluate the optional Gemini public URL analysis route as an externally operated provider without creator OAuth, with blinded human timestamp/originality annotations, logged costs and explicit terms review. Never make AI statements direct evidence admission. Preserve the cumulatively inherited source credibility and stopping rules.
