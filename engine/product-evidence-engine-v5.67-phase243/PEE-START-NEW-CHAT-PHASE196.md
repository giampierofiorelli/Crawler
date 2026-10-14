# PEE continuity — Phase196

**Canonical full predecessor:** `product-evidence-engine-v5.19-phase195.zip`, NOT the Phase195 checkpoint. User's controlling requirement: avoid permanent storage of full text of reviews. Reviews of an exact product may be inspected *together transiently* before admitting structured product evidence, then keep only metadata, provenance, compact fingerprints, scoped measurement observations, candidate relationships and reviewed decisions. Do not copy publisher content or treat it as owned source data. Reading data requires lawful source access.

## What Phase195 actually implemented

New `src/phase195_ephemeral_batch_lineage.ts` provides `analyzeEphemeralBatch195` over in-memory product variant batches, calls native Phase194 source-candidate retrieval, outputs a strict textless `BatchResult195`, and optionally atomically saves/reads **derived metadata only** via `writeDerivedMetadata195`/`readDerivedMetadata195`. It retains `SHA-256` of the **transient extract** and separate `datePublished`, `dateModified`, visible date, archive capture, first PEE observation and claimed experiment date. Chronological anomalies are review alerts, **not proof of authorship**. Matching numbers or exact texts **never merge original test events**. Products with no reliable test stay discoverable. New package version 5.19.0.

- 40 targeted tests pass, 3,181 TypeScript admissible tests total and 212 inherited Python tests pass; historic Phase91/92 quarantined.
- Demo/sources are authored/synthetic; no independent blind labeling of actual reviews, no authenticated publisher bytes, no source-rights certification or live customer ranking.
- Source references/method in `PHASE195-TECHNICAL-REPORT.md` and `docs/phase195/README.md`.
- No third-party runtime dependency was installed. User supplied four repositories in Phase194; audit remains authoritative. Phase181–194 are cumulative, not to be replaced.

## Critical scope limitations

An extract hash is not a verified complete publisher content hash and does not support automatic Phase193 screening reuse if publisher bytes might have changed. SHA alone cannot recognize a deep paraphrase in the next batch. The Phase194 approximate retrieval can miss or mistakenly propose pairs. Textless output stores unverified metadata and relationship cues; datePublished and firstSeen do not identify original producer; no plagiarized/duplicated-experiment claims are permitted without review.

## Phase196 plan

Consider independently measured **compact keyed similarity signatures** instead of full review bodies: assess HMAC token shingle bottom-K, minhash/LSH and privacy/linkability risk; use a deployment key external to the stored data (never embed secrets), small versioned sketches and expiry, compare against fresh re-fetch when feasible. Test false-negative/false-merge failure cases with multiple categories and genuinely independently annotated source originals (user can provide copyrighted sources if legally accessible). Attach the Phase195 pre-admission batch output to Phase193 reviewed decision memory and Phase182 research queue **without skipping original bytes/source validation or domain-wide affiliate screening**. Production/authentication/license issues remain blockers. Real progress is measured by independent evaluation, not amount of code.
