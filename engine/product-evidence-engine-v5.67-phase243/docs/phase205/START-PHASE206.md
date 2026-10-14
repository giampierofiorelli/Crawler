# Product Evidence Engine — continuity for Phase206

## Canonical baseline

`product-evidence-engine-v5.29-phase205.zip` is the full cumulative release built from authenticated uploaded `product-evidence-engine-v5.28-phase204.zip` (SHA-256 `61e62b1478849f26dde88ca0b1d84f95c792bdc3a6c0947d1ee6a8d9ede82895`). Continue the existing PEE; do not start from zero, remove earlier modules or replace the source/research architecture.

## What Phase205 implemented

- `src/phase205_video_provider_normalization.ts`: native TypeScript adapter for explicitly tagged official search snapshots vs YouTube.js parsed snapshots; cross-provider forgery forbidden. Reuses Phase203 canonical video IDs and its existing Phase182-based plan. Missing creator/date/conflicting metadata are leads, not automatic reputation.
- Transcript track adapter: YouTube.js `start_ms/end_ms` in ms strings and youtube-transcript-api `start/duration` in seconds with strict bounds; ASR/human/translated/unknown, selected vs verified spoken language, unavailable/blocked/no transcript; returns no caption text or unkeyed fingerprints.
- Aspect analysis: bounded transient source snippets plus externally supplied human/AI annotations, distinct taste/practical use/instrument claims/promotional material; reuse Phase203 timestamped lineage and Phase204 methodology cue appraisal. AI findings and even human annotated claims are not independently authenticated.
- Version 5.29.0; all 3 user-uploaded GitHub source code ZIPs included **unchanged** inside cumulative release (`research/phase205-external-code/`) with SHA-256 retention register and original technical code audit. **DO NOT ABANDON these candidate technologies in later phases.** No dependencies, models or separate scraper installed.
- Test results and baseline comparison in `PHASE205-TECHNICAL-REPORT.md` and `PHASE205-TEST-RESULTS.json`; interpret only successfully completed regression runs as passes. All new tests use authored/synthetic fixtures, not validation on real reviews.

## Nonnegotiable cumulative guards

Goal-sensitive deterministic ranking; exact variant/product/criterion/region/protocol; independent expertise (instrumental vs practical/cultural/tradition); no nationality-only credential; specialized qualified result evaluation where materially necessary; rare products not penalized for missing reviews; source-level search priority not global whitelist; no Amazon-star-only commercial lists as science; no copied text corpora; Phase193 screening reuse strictly with checked original bytes and scope; no experiment merging from matching numbers, pages, translations or timestamp age; awards and user impressions are separate signals; no badge without issuer authentication and Phase199–201 publication guard. English-first baseline, international language and region probes when justified. Video/creator authority and awards remain research-only. Respect source access restrictions and avoid an unreviewed network scraper.

## Phase206 priority

Do an authorized, small, **real** empirical evaluation on specific videos and written review pairs (specialist and non-specialist, niche and established, translated/manual/ASR tracks if available). Independently label opinion aspects, claim method, creator relevance, award scope, exact variant, timestamps and event identity; compare different providers with error rates, latency, licence/terms, hosting footprint and resilience. Only then consider a live provider and optional PyABSA/YouTube.js/transcript-api integration. Keep all three code archives as revisitable engineering candidates, including their licences and audited source snapshots.
