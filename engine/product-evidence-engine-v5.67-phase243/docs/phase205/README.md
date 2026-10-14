# Phase205 — Native video provider and aspect normalization

**State:** v5.29.0, bounded *research-only* engineering pilot. No live platform ingestion, no creator authorization assumption, no final product ranking or certification publication.

## Integration and cumulative reuse

- Phase182 owns research jobs and gaps; Phase203's video plan is required to normalize candidate search hits. This module makes **no new job queue**.
- Phase203 owns canonical YouTube URL/ID and evidence observation/lineage invariants; Phase205 composes its API rather than creating another experiment store.
- Phase204 owns video method and creator credibility, plus awards; Phase205 routes method cues through `appraiseVideoMethodCues204`. It does not authenticate creators, awards, original tests or performance claims.
- Phase196 Source Intelligence, Phase197 stopping/uncertainty, Phase198 specialist outcome, Phase193 screening memory and Phase199–201 badge publication guards retain their previous authority. No automatic admission/rank path exists from the new module.

## Inputs and outputs

`normalizeVideoDiscovery205` receives **one** tagged provider schema (`youtube_data_api_official_snapshot` or `youtubejs_parsed_snapshot`) for a job already present in Phase203's plan. It refuses untyped and crossed payloads. YouTube.js input is **an explicit parsed-field DTO**, not an undocumented raw InnerTube payload. The provider label, version, missing channel and publication date are preserved; duplicate video URLs are canonicalized; conflicting channel/date hints are review alerts. No view count or subscriber count influences this.

`normalizeTranscriptTrack205` consumes **temporary** segments with the formats inspected in uploaded source: YouTube.js `start_ms/end_ms` as decimal strings, youtube-transcript-api `start/duration` as seconds, or operator milliseconds. It preserves overlapping captions, records only count/bounds and track metadata, and explicitly distinguishes caption kind `human/asr/translated/unknown`. The original spoken language remains unknown unless separately reviewed. Missing, blocked, unauthorized and unreviewed access are **not** silently considered product failures. It doesn't download any video/transcript.

`inspectTranscriptAspects205` combines a temporarily held transcript with analyst/AI **annotations**, then delegates to Phase203 for timestamped textless candidates and Phase204 for method cues. Separate types for taste, use, claimed measurements, claimed visual demonstration, method talk and promotions prevent a global sentiment label from becoming product truth. AI cannot assign itself a human review receipt; neither human review receipts nor creator qualifications are authenticated here. The provider identity/version must match the track used. Full subtitles, excerpts and unkeyed phrase hashes are never emitted by this module. Ephemeral content remains caller-owned and should be released after the call. Strict controls still depend on the caller's documented source-access rights.

## Retaining all three GitHub contributions

All three user-provided **original ZIP archives** are included unchanged under `research/phase205-external-code/`. `SOURCE-RETENTION-REGISTER.json` records exact versions and SHA-256; tests verify the original bytes. This prevents loss of reference code across phases **without** auto-installing it:

1. YouTube.js v18.1.0: parser-transport separation, source metadata, transcript timings. Future: optional authorized provider benchmark, evaluate breakage rate, change resilience and runtime footprint.
2. youtube-transcript-api v1.2.4: language/ASR/translation discrimination and timestamp semantics. Future: optional authorized access evaluation; no automatic bypass of restrictions or cloud-IP blocks.
3. PyABSA v2.4.3: aspect-sentiment and opinion-triplet ideas. Future: benchmark real labelled domain-specific aspect recognition against a native approach before adopting PyTorch/Transformers or Python 3.10 constraints.

The MIT licenses on library code **do not** license YouTube content. These archives are research sources, not runtime dependencies or imported third-party source code. Do not treat this work as settled platform terms/legal clearance.

## Test boundary

The new tests exercise authored fixtures only: provider confusion, YouTube IDs, offset conversion, ASR/translation, no text retention, aspect-specific opinions, AI/human cues, lineage and full-byte archive preservation. No live videos, real creator qualifications, award issuers or independent source-label benchmark were evaluated. See `PHASE205-TEST-RESULTS.json` and logs in `docs/phase205/test-logs/`.

## Next stage — Phase206

Build an independently annotated, authorized and reproducible *small real review/video corpus* across at least coffee, sushi knives and an unrelated appliance. Record exact model, criterion, source track, original language, test event, reviewer qualifications, sponsorship and awards. Determine precision/recall of aspect extraction and video timestamp accuracy, missed independent original tests, duplicates and expert-relevance errors; compare native PEE vs optional provider/model **on measured improvement**. Do not promote video transcript opinion to specialist certification or global truth.
