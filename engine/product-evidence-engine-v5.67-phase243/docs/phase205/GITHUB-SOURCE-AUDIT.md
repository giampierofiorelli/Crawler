# Product Evidence Engine — technical source-code audit of three uploaded GitHub repositories

**Date:** 13 October 2026  
**Baseline:** PEE `product-evidence-engine-v5.28-phase204.zip`  
**Scope:** static inspection of actual user-supplied source archives; comparison against actual PEE source; no external packages installed; no network extraction of videos/subtitles; no third-party model inference; no changes to the PEE v5.28 code in this audit.

## Decision

**Keep all three packages outside PEE runtime for now.** Reuse their architecture and tested data-shaping patterns to build a **small native TypeScript video-evidence adapter** in the existing Phase182 → Phase203 → Phase204 workflow, without a second crawler or sentiment-based ranking. Only trial a live provider if access and terms, failure rate, maintenance, cost, and measurable value pass a separate evaluation. Retain provider provenance. This audit does **not** establish real-world access reliability, sentiment accuracy, or permission to reproduce YouTube content.

## What was actually examined

| Archive | Snapshot from files | Entries | Repository code inspected | License contained |
|---|---|---:|---|---|
| `YouTube.js-main.zip` | `youtubei.js` **18.1.0** | 1,817 | `src/core/mixins/MediaInfo.ts`, `src/parser/youtube/TranscriptInfo.ts`, `src/parser/classes/TranscriptSegment.ts`, `src/parser/youtube/Search.ts`, `package.json` | MIT |
| `youtube-transcript-api-master.zip` | **1.2.4** | 47 | `youtube_transcript_api/_api.py`, `_transcripts.py`, `proxies.py`, `pyproject.toml`, tests and README | MIT |
| `PyABSA-2 2.zip` | `pyabsa` **2.4.3**, self-described in `__init__.py` | 786 | `setup.py`, `requirements.txt`, aspect extractor, aspect sentiment triplet predictor, sentiment classifier | MIT |
| PEE `v5.28-phase204.zip` | Baseline v5.28 | 2,595 | `src/phase182_gap_research_orchestrator.ts`, `phase196_source_intelligence.ts`, `phase198_specialist_outcome_validation.ts`, `phase203_video_evidence_search.ts`, `phase204_creator_authority_awards.ts` | Existing project |

All four ZIP containers passed `zipfile.testzip()`; this checks archive CRC/readability **not** trustworthiness of their code. Exact original ZIP SHA-256 checksums are saved in the companion JSON manifest. No historical Git commit IDs are supplied by these GitHub ZIPs; version labels are from the enclosed package metadata, and are not proof of a precise upstream commit or publication date.

## 1. YouTube.js — what its code teaches us

The uploaded `package.json` describes a client for YouTube's **private InnerTube API**. Dependencies include `@bufbuild/protobuf`, `fflate` and `meriyah`; the package also contains a large parser/schema and platform-specific entries. This is an ambitious integration, not a trivial metadata adapter.

- `src/parser/youtube/Search.ts`, lines 18–54, parses search-response structures, sections, and result nodes. PEE could learn to isolate platform-specific presentation parsing from its own normalized video metadata.
- `src/core/mixins/MediaInfo.ts`, lines 179–206, implements `getTranscript()`: it searches for the searchable transcript engagement panel, obtains a continuation and wraps its response. This can fail when the panel/continuation is unavailable; it is **not** equivalent to guaranteed subtitle access.
- `src/parser/youtube/TranscriptInfo.ts`, lines 22–53, implements language selection and available languages. The reported language options are **display strings**, so any normalization to `it`, `ja`, `en`, etc. needs explicit validation; do not infer the original spoken language from a translated menu label.
- `src/parser/classes/TranscriptSegment.ts`, lines 8–20, models `start_ms`, `end_ms` as strings and a caption snippet. Convert to numeric seconds only after strict range and numeric validation.

**Engineering judgment:** learn the source/transport/parser separation; avoid copying the enormous InnerTube parser into PEE or introducing another long-term request engine. The protocol is undocumented and can change without notice. The repository's MIT software licence is **not** a licence to download or republish arbitrary third-party video material.

## 2. youtube-transcript-api — compact transcript pipeline

The supplied `pyproject.toml` identifies version **1.2.4**, Python `>=3.8,<3.15`, and dependencies `requests` and `defusedxml`. This library is much smaller than YouTube.js.

- `youtube_transcript_api/_api.py`: `YouTubeTranscriptApi.fetch()` and `.list()` separate actual subtitle acquisition from track discovery.
- `_transcripts.py`, lines 180–245: explicitly distinguishes **manually created** tracks from **ASR-generated** tracks using the `kind == "asr"` signal; records languages and whether translations are supported.
- `_transcripts.py`, lines 34–73 and 483–491: returns bounded segments with `text`, `start` and `duration` as seconds. Preserve origin and timings in a temporary analysis context; do not retain full transcripts by default.
- `_transcripts.py`, lines 347–454: fetches YouTube web HTML, obtains an InnerTube key, accesses internal responses and handles blocks/consent. This is an **unofficial method**, not the official YouTube Data API.
- README section `Working around IP bans` and exception handling for `IpBlocked`/`RequestBlocked` show the fragility of automated access from cloud hosting. The code includes optional proxy support, which is not a reason to bypass access restrictions automatically.

**Engineering judgment:** the types and handling of language, manual vs automatic captions, timestamps and explicit failures are reusable patterns; running a Python bridge merely to gain access to captions is unlikely to be a sensible default for our TypeScript-first project before testing its reliability and acceptability.

## 3. PyABSA — aspect-specific opinions, not expert authentication

The uploaded archive contains a substantial Python NLP framework, not a simple string classifier.

- `pyabsa/tasks/AspectTermExtraction/prediction/aspect_extractor.py`: aspect-term extraction and sentiment attribution; returned fields include `aspect`, `sentiment`, `probs` and `confidence` (see around lines 216–281 and 734–740).
- `pyabsa/tasks/AspectSentimentTripletExtraction/prediction/predictor.py`, lines 233–269 and 340–386: extracts structured aspect/opinion/sentiment triplets.
- `pyabsa/tasks/AspectPolarityClassification/prediction/sentiment_classifier.py`: checkpoint-driven predictions using tokenizers and PyTorch.
- `setup.py` declares Python `>=3.10,<3.11`, `torch`, `transformers<4.30.0`, `spacy`, `sentencepiece` and additional packages, while `requirements.txt` lists even more dependencies, including `pyabsa[dev]` and a Git-hosted TextAttack dependency. **Do not install `requirements.txt` blindly.**
- Packaging issue in this supplied snapshot: `setup.py` opens `README.md`, but the uploaded ZIP contains `README.MD` and **not** `README.md`. On case-sensitive filesystems this may break source installation. This is a static finding, not an attempted installation.

**Engineering judgment:** its useful idea is *aspect-targeted opinion extraction* rather than a global positive/negative sentiment label. For PEE: "easy to clean" is an experiential usability observation; "espresso tastes sour" is a taste claim requiring context; neither becomes a measured machine defect nor qualifies the speaker as a professional. A PyABSA probability/confidence is **not** a probability that a claim is true or the reviewer is authoritative. The pretrained model's performance on video transcripts and specialized Italian/Japanese food vocabulary is **not established by the uploaded source**. Do not add PyTorch/Transformers to current hosting without separate benchmarks.

## 4. What PEE already has, and the precise integration gap

- `phase182_gap_research_orchestrator.ts`: research jobs. Preserve this as the **single job queue**.
- `phase196_source_intelligence.ts`: source priorities. Use scoped credibility, never global channel fame/subscribers.
- `phase198_specialist_outcome_validation.ts`: scoped professional applicability; video expertise must not bypass qualifications, method, exact variant or outcome checks.
- `phase203_video_evidence_search.ts`: video tasks, URL normalization, metadata and textless timestamped observation candidates. **Its `inspectYouTubeSearchSnapshot203` (lines 100–127) specifically accepts official Data API `youtube#searchListResponse`; a YouTube.js InnerTube response CANNOT be relabelled as an official API response.**
- `phase204_creator_authority_awards.ts`: creator lateral-reading leads, situated experience, method cues and awards; research-only outputs, no ranking authority. Use these instead of building separate scoring.

**Minimum valuable next increment:** a `Phase205VideoProviderNormalization` module, research-only, that normalizes separately labelled provider inputs into a shared *candidate* schema. It must never forge an official-provider enum, grant expertise or attach a new original experiment. Provider capability detection should explicitly return `unavailable`, `blocked`, `no_transcript`, `not_permitted`, or `needs_review` rather than manufacturing empty evidence.

Suggested internal fields (proposal, not implemented): `videoId`, `channelId`, `sourceMethod`, `methodVersion`, `originalLanguage`, `selectedTrackLanguage`, `captionKind` (`human|asr|translated|unknown`), `timebase`, `segmentsTransient`, `rightsBasis`, `timestampAccuracy`, `claimKind`, `criterionId`, `exactVariantReviewId`, `expertiseReviewId`, `lineageReviewId`, `canAdmitEvidence:false`.

Processing flow: Phase182 query → provider-specific adapter → Phase203 canonical video identity → ephemeral caption/AI observation extraction → Phase204 content/creator scrutiny → Phase192–195 event-lineage review → Phase197 sufficiency and Phase198 specialist outcome checks. Persist only bounded derived metadata, reviewed provenance and source/time links, not wholesale subtitles or copies of videos.

## 5. Test cases to build before connecting a real provider

1. Same video repeated under `watch`, `shorts` and short URLs is **one video**.
2. Distinct uploads of the **same underlying experiment** are not counted as independent tests.
3. Manual and ASR captions for the same video are alternative observations, not independent sources.
4. Translated captions cannot establish original spoken language or specialist competence.
5. Milliseconds from YouTube.js and seconds from transcript-api lead to identical canonical timestamps.
6. Broken/negative/end-before-start timestamps are rejected.
7. Missing transcript yields `no_transcript`, not negative product evidence.
8. No transcript speech can authenticate a visual demonstration; a video claim remains a **claim** until footage/method is checked.
9. Sentiment about ease of use cannot establish espresso taste, and vice versa.
10. Statement of flavour preference is separate from objective defect / tradition-specific conformity.
11. Video author's credentials require discipline/outcome-specific external evidence.
12. Sponsorship disclosures do not prove falsity, but must remain visible and may prompt extra verification.
13. Error, rate-limit and provider changes leave existing PEE evidence/ranking invariant.
14. Transcript source bytes/excerpts are never written into durable PEE metadata or logs.
15. Product variant mismatch never silently resolves using a fuzzy video title.
16. Source provider labels and methods cannot be forged by converting an InnerTube payload into a Data API payload.

These are **proposed tests**, not reported passes.

## 6. Platform terms and rights must be treated separately from GitHub code licences

All three uploaded repositories include an MIT software licence. This does **not** establish permission to extract all YouTube subtitles or video data at scale.

YouTube UK Terms of Service contain an exception for public search engines acting in accordance with `robots.txt`, but calling PEE "a search engine" does **not** itself prove that it qualifies for that exception. The official YouTube API policy also prohibits scraping YouTube applications by API clients and describes conditions for use of official services. YouTube's official `captions.download` requires edit permission for the video. We should assess the actual planned workflow and deployment rather than assume a GitHub project settles this legal or operational question.

- YouTube UK terms: https://uk.youtube.com/t/terms
- YouTube Developer Policies (updated June 2026): https://developers.google.com/youtube/terms/developer-policies
- API policy guide (including examples of independent-value search engines): https://developers.google.com/youtube/terms/developer-policies-guide
- Official caption download requirements: https://developers.google.com/youtube/v3/docs/captions/download
- YouTube.js: https://github.com/LuanRT/YouTube.js
- Transcript API: https://github.com/jdepoix/youtube-transcript-api
- PyABSA: https://github.com/yangheng95/PyABSA
- PyABSA docs: https://pyabsa.readthedocs.io/en/latest/

## 7. What is demonstrated vs not demonstrated

**Demonstrated by inspected code:** each library implements the architectural elements described above, and PEE already has research/source/creator/lineage/sufficiency modules which should be reused. ZIP CRC succeeded.

**Not demonstrated:** live transcript success in our hosting; any creator permission, legal licence or platform exception; accurate AI detection of original product tests; recognized expertise on real creators; reliable accuracy on authentic video transcripts; any improvement in final ranking. No code was copied or installed in PEE and no new Phase205 release is claimed.

**Practical recommendation:** start Phase205 with a native normalization layer and authored adversarial tests only, then benchmark one optional provider offline/within authorized source access. Do not make PyABSA a deployment dependency until targeted aspect extraction is measurably better than the PEE's existing bounded semantic extraction.
