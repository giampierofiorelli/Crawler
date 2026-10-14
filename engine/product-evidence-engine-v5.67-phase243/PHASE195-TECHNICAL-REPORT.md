# Product Evidence Engine — Phase 195: Ephemeral Multi-Review Comparison and Chronological Provenance

**Date:** 2026-10-13  
**Cumulative candidate release:** v5.19.0 built from verified v5.18 Phase194.  
**Status:** Completed bounded engineering increment, NOT independent validation of live web review source attribution, copyright clearance or production rankings.

## Executive conclusion

The user observed that PEE should examine reviews of one product together **before admitting product knowledge**, but probably **must not store copies of the full review bodies**. This is the controlling design decision. Phase195 applies Phase194's candidate retrieval temporarily to a group of reviews for each exact product variant, then returns only structured metadata and relationship candidates. No article text, editorial excerpt, HTML, shingle text or quoted content is persisted.

This substantially changes *data retention and group processing* but does NOT magically solve heavily rewritten-copy identification. Real test-event identity is still subject to source verification and human review. Similar strings, duplicated measurements, and earlier publication dates are insufficient by themselves.

## What was implemented

`src/phase195_ephemeral_batch_lineage.ts`:

- Input contains `transientText`, `category`, exact `variantId`, source URL, typed source/date signals, typed measurement records and explicit attribution hints. Text basis is necessarily a rights-appropriate extract or an analyst annotation: no claim of raw publisher byte authentication.
- Grouping prevents accidental cross-variant/cross-category document duplicate conclusions, even when the same boilerplate exists across products. Phase194 native LSH proposes text duplicate candidates within group; it never merges experiments.
- Outputs only URL, counts, SHA-256 extract fingerprints, chronological metadata, candidate pair IDs, numeric-claim hash collisions (exact scoped field, number, protocol, unit, condition) and explicit unverified source links.
- Dates distinguish published, modified, visible date, archived capture, first crawler observation and **claimed experiment date**. Implausible chronology triggers an alert; cannot determine the original laboratory by ordering article dates.
- Persistence via allowlisted `writeDerivedMetadata195` / `readDerivedMetadata195` serializes **only** the result schema; rejects unexpected keys or invalid fields that could be used to inject raw review text. Restricted single-writer temporary atomic file.
- A rare product with no original professional tests remains represented, with **0 verified original tests** in this pilot — not a zero performance value, and not an exclusion.
- Explicit no source text persisted, no independent tests verified, no automatic source-of-origin verdict, no new ranking authority.

## Source and methodological grounding

- **Cochrane Handbook, Chapter 5 (Collecting data):** multiple publications of a single research study must be collated as one study, although derived reports may contain valuable original material. https://www.cochrane.org/node/97
- **W3C PROV-O (W3C Recommendation):** formal distinctions between derivation, quotation, revision, attribution and primary-source relationships. https://www.w3.org/TR/prov-o/
- **Google Article structured data:** `datePublished` and `dateModified` have distinct meanings. https://developers.google.com/search/docs/appearance/structured-data/article
- **Google's page dating guidance:** the apparent first publication date is only one signal, and signals can conflict. https://developers.google.com/search/blog/2019/03/help-google-search-know-best-date-for
- **Phase194 uploaded-code audit:** user-supplied datasketch, text-dedup, dedupe, changedetection.io were previously examined. Reused native PEE Phase194/192 implementations; no third-party runtime code was copied or installed in Phase195.

The sources justify the distinctions and engineering approach, not a claim that the new algorithm's real-world accuracy has been measured.

## Test results

- **40 targeted TypeScript software tests**, all passed. Includes no raw text in returned metadata/disk, nested unexpected text injection blocked, exact/near duplicate candidates, repeated values from independent labs, variation in field/protocol/variant, chronology disagreements, latest document review requirement, URL normalization, input validation, deterministic group order and product with no original tests.
- **Cumulative TypeScript**: 3,181 tests in 157 admitted test files passed; historic Phase91/92 excluded consistently with predecessor.
- **Cumulative Python**: 212 tests in six existing groups passed. Existing companion ResourceWarning lines are historical warnings, not failures.
- Demo: four synthetic documents, two air-purifier variants, one deliberate near-duplicate, coincident technical observations and a sparsely documented product. No original lab verified, no public ranking.

These outcomes validate **software behavior on authored fixtures**, not false-positive/false-negative rates on an independent real editorial corpus. No blinded labelers, original publisher-authenticated page snapshots or external benchmark were used.

## Why not store full review text?

Retaining full review bodies would entail intellectual-property, storage, update, privacy and access-control concerns. The PEE's business objective is **knowledge about products**, not a copied corpus of publishers' articles. Where authorized, ephemeral content permits batch similarity computation, claim extraction and contextual assessment. Durable outputs should be attributed facts, traceable observations, source links, source revision fingerprints, event-lineage hypotheses and review decisions.

However, **not storing full content trades off future analysis flexibility**. If we have only a SHA digest from a previous review, detecting a newly paraphrased copy requires retrieving source content again, storing a tested compact similarity sketch (with reidentification/privacy controls), or both. Full-page freshness cannot be certified by the hash of an analyst extract. An old citation date or latest HTTP ETag is not conclusive evidence that measurements stayed constant.

## Integration status, risks and next stage

The module is additive and reuses PEE Phase194's candidate finder and Phase192's URL normalizer; it does not alter Phase193 screening decisions or bypass them. It is not connected to Phase182 search-job ingestion, publisher-authenticated crawling, production database, the consumer web experience or Phase181 dynamic ranking.

**Phase196 priorities:** evaluate safe, keyed compact similarity sketches so new documents can be matched with prior sessions without storing text; test the sketches for linkability/privacy, boilerplate and false positives; connect metadata to a reviewed research queue with versioned source updates; get lawful primary original reviews and independent blinded test-event labels; evaluate recall, false merges and missing-source scenarios before authorizing original test counts or rankings. Do not equate earlier timestamps with producer identity, or Amazon-only affiliate lists with professional tests.
