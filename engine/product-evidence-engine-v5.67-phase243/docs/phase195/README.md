# Phase195 — Transient Product-Scoped Review Comparison (research-only)

**Purpose.** Respect the user requirement **not to retain entire review articles** while still comparing a group of reviews *together before knowledge admission*. This research component consumes lawfully accessible local extracts transiently; the returned and persisted schema contain no source-body, quote, token sequence or source snippet. It reuses Phase194 for documentary duplicate candidates, Phase192 URL normalization, and retains Phase193's requirement that reuse of an approved screening decision must check genuine publisher content freshness. It does not authorize new ratings or classification conclusions.

## Pipeline and retention contract

1. Assemble rights-appropriate, English-first review texts temporarily for **one or more exact product variants**. Keep product identity, category and source identity; inspect commercial affiliation, origin of each test and claims in the upstream screening and source-custody workflow.
2. Call `analyzeEphemeralBatch195({batchId,analyzedAt,reviews})`. It groups *within category and exact product variant* and delegates candidate documentary relations to `findDocumentCandidates194` in memory. Its measurement collisions compare exact field, value, unit, protocol and condition; the same value does NOT merge test events.
3. Return only `CompactSource195` (source URL, category, variant, SHA-256 of transient authorized extract, publication/observation date signals, counts), `DocumentLink195` (candidate only), `ClaimCollision195` (candidate only), explicit declared attributions, chronology alerts and per-product coverage counts. Never append text to logs or error messages; don't persist source texts/quotes/paragraphs/HTML; discard source buffers after the session.
4. `writeDerivedMetadata195`/`readDerivedMetadata195` enforce allowlisted schema and field validation and write metadata only to a restricted JSON file. The writer is intended for single-writer experiments, **not** a production transactional database.
5. Authorize no original experiment, no original publisher, no copied/plagiarized accusation, no independent-test count, no product rankings. A product with no original evidence remains a product candidate.

## Dates are evidence, not proof of priority

`publisher_datePublished` and `publisher_dateModified` are publisher-supplied metadata; `visible_publication` and `visible_updated` are user-visible claims; `archive_capture` only indicates a particular version existed no later than its capture time; `first_seen_by_pee` is a crawler observation; `claimed_test_performed` is a claim about the date of an experiment. This pilot raises chronology alerts for implausible combinations **without choosing the earliest article as the original test**. A change in date metadata is not automatically a change in scientific measurement.

## Important limits

- No licensed multi-source full-review corpus, independent blinded annotation, provenance authentication or calibrated duplicate-detection metrics was obtained. Fixtures and explicit human-supplied metadata are **synthetic**.
- A SHA-256 of a local extract is not proof of unchanged publisher bytes. If a new source appears later, deep paraphrase detection requires fresh rights-permitted reading of relevant sources or a future privacy-reviewed compact index. The persisted SHA alone cannot detect paraphrases.
- Fingerprints and URLs can still be linkable identifiers; they are **not anonymized**. Apply access control, retention/deletion periods and privacy review.
- Both Phase194's LSH and the numeric collision heuristics can return false positives and false negatives. Candidate pairs must be source-review triage, never automatic test-event merging.
- `datePublished` can be edited or backdated; canonical hints and first discovery times do not authenticate the creator of a test.
- Phase193 needs freshly verified publisher bytes and authenticated reviewers to reuse decisions in production. This module neither circumvents nor replaces those requirements.
- The runtime does not crawl sites and this is not integrated into Phase182 acquisition, a production DB, the customer website or Phase181 ranking.

## Reproduce

```bash
npm run test:phase195
npm run demo:phase195
```

## Expert and official references (methodological, not evidence of code validation)

- Cochrane Handbook, Chapter 5, Collecting data: https://www.cochrane.org/node/97 — multiple reports of one original study should be collated, without discarding unique information.
- W3C PROV-O: https://www.w3.org/TR/prov-o/ — distinctions between quotations, revisions, derivations and primary sources.
- Google Search Central Article markup: https://developers.google.com/search/docs/appearance/structured-data/article — `datePublished` versus `dateModified`.
- Google Search Central dating guidance: https://developers.google.com/search/blog/2019/03/help-google-search-know-best-date-for — dates derived from multiple imperfect clues.
- User-supplied source code (Phase194) `datasketch`, `text-dedup`, `dedupe`, `changedetection.io`: studying them does not mean they were installed. The Phase194 source audit has the SHA-256 inventory.
