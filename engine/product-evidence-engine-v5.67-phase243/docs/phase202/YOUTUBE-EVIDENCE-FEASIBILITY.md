# PEE YouTube professional video evidence — Phase202 feasibility (13 October 2026)

## Verdict and immediate constraint

**Yes:** YouTube should become a *discovery channel and potential source of criterion-specific original professional tests*, not a sentiment/popularity feed or blanket trusted-channel whitelist. Professional demonstrations can contain observed outcomes missing from written reviews. **Not yet implemented as a retrieval or transcription feature**: access and rights must be established first.

Google confirms NotebookLM can ingest public YouTube links and answer with citations linked to a video's **transcript** (not a guarantee that every video or visual claim can be fully analyzed): https://blog.google/innovation-and-ai/products/notebooklm-audio-video-sources/ (26 September 2024). Product-specific visual tests need **additional evidence beyond captions**.

YouTube's official `search.list` API supports metadata discovery by query/channel: https://developers.google.com/youtube/v3/docs/search/list . Channel and video metadata may be discovered subject to API quotas and policy. However `captions.list` **does not return the caption text** and requires OAuth scopes: https://developers.google.com/youtube/v3/docs/captions/list . `captions.download` requires the user to **have permission to edit the video**: https://developers.google.com/youtube/v3/docs/captions/download . Do not imply the captions of arbitrary public videos are available through the official API. Developer policies prohibit scraping YouTube applications and obtaining scraped YouTube content: https://developers.google.com/youtube/terms/developer-policies . Treat licensed creator-supplied transcripts or properly authorized owner access as distinct, documented pathways, subject to actual terms and permission review.

## Why not 'video sentiment'

A creator saying 'excellent' is a subjective judgment until mapped to a relevant purpose; an affiliate disclosure or gifted unit requires claim-level review. Views, likes, positive comments, subscriber count or the language of a video are **not** independent test results. A creator may have decades of specialist expertise and few subscribers. The video *itself* must show an original protocol, actual exact variant, test conditions, observations and transparency; claims must not be derived from other channels or producer marketing.

Competence is **task × discipline × criterion × method × outcome × time-specific** (Phase198), not based on nationality or channel popularity. For Italian espresso or sushi knife work, recognize documented practicing specialists of the *specific* traditions. Avoid blanket claims that Italian/Japanese citizenship establishes skill; geography and language guide discovery, not authority.

## Provenance-preserving design

1. Use **Phase182** existing research jobs and Phase196 Source Intelligence matrix to discover videos. Do not create a second crawler/queue. Keep unknown channels eligible for exploration.
2. Store public source identifiers/URLs, authorized metadata, channel identity review ID, upload date, declared sponsorship, exact product variant and declared languages *subject to YouTube API storage/deletion rules*. Verify the source identity with the official API if permission and quotas allow.
3. Maintain an explicit `transcript_access`: `none | licensed_creator_copy | appropriately_authorized_owner_api`. Do not fetch or infer unauthorized subtitles. Confirm retention terms **before** reading; treat automatic captions/translations as fallible and mark the original-language basis.
4. Parse **transient, rights-cleared** caption cues; use *timecode* to connect claim/criterion/protocol/outcome and source version. Retain only permitted derived metadata and hashes consistent with Phase195; do not archive the full transcription as default.
5. `spoken_assertion` is separate from `visual_demonstration_reviewed`, `instrumental_measurement_documented`, `structured_specialist_use_reviewed`, and `commercial_endorsement`. Captions alone never authenticate the visual demonstration. Future vision access requires its own rights and original media review.
6. Use Phase192–195 lineage to detect if an article and video describe **one test event**. A publisher video of its own article is not a second independent test; a new, original video section may be a distinct event only after review.
7. Show consumer source attribution only after Phase199–201 custody and any relevant Phase198 specialist outcome review; no YouTube popularity trust seals. Stop research under Phase197 when enough *independent relevant evidence* exists, not after N videos.

## Incremental pilot before automation

Select a small rights-cleared panel of **creator-provided transcripts**, preferably with video clips specifically licensed for verification and expert review. Include: Italian espresso, sushi knife usage, air-purifier practical tests, unrelated generic products; English and Italian/Japanese audio where permissions exist. Include short videos, absent captions, inaccurate automatic subtitles, affiliate demonstrations, repackaged material and unseen critical steps. Annotate timecode, exact model, demonstrated/only-spoken status, separate measurement/professional opinion, professional competence and sponsorship; two independent labelers adjudicate disagreements. Evaluate precision/recall on observed claims, false original-test admissions, copied-event duplication, expertise-match precision, rights compliance, and marginal influence on consumer recommendations. Publish no performance percentages without this corpus.

## Non-claims

No YouTube API integration, no automatic caption retrieval, no creator authorization, no video benchmark or general video understanding was completed in Phase202. The proposed workflow is engineering design only. The Phase202 code increment instead addresses one specific officially documented certification dataset and remains research-only.
