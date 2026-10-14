# Phase194 — Candidate retrieval for potential reused documents (research only)

Four user-supplied OSS archives were manually inspected: **datasketch (MIT)**, **text-dedup (Apache-2.0)**, **Dedupe (MIT)** and **changedetection.io (Apache-2.0)**. No copied third-party code and no external runtime packages have been introduced.

The native Phase194 candidate index is an **additive preparation step** before the existing Phase192 lineage analyst and the Phase193 persisted screening ledger. It is not a new ranking engine and does not rewrite evidence source identities. The new output never claims that an article copied unlawfully, that shared language establishes a shared scientific experiment, or that lack of retrieval means two experiments are independent.

Features:

- Deterministic 5-token shingle bottom-hash signatures, 64 permutations, 16 LSH bands of 4, distinctive-shingle Jaccard confirmation of returned candidates with pilot floor 0.60 (high-document-frequency boilerplate shingles suppressed on larger corpora) (NOT empirically tuned). Published canonical URL or publisher-body SHA-256 and normalized text hashes provide separate blocking keys. Retrieval keys only return **candidates**; no source or test merging is permitted.
- Source ordering invariance, input/document hash verification, source URL normalization reused from Phase192, explicit `publisher_bytes` versus `rights_appropriate_extract` versus `analyst_annotation` distinction.
- Reuse of the actual Phase193 policy/market/variant/field/reviewer gates after new **publisher bytes have been supplied and hashed**. HTTP validators alone are not taken as proof of unchanged content. This does NOT perform internet fetching or authenticate the source.
- Explicit labeled-pair precision/recall accounting, not an invented real-world metric. Synthetic authored labels are not independent human gold; no auto annotation, adjudication or false-merge measurement of real original experiments yet.

## Run

```bash
npm run test:phase194
npm run demo:phase194
```

The demo dataset is authored/synthetic. Benchmark positive labels denote **textual relatedness**, including lightly edited copies, not exact document identity or common experiment origin. **Study/event identity** is a separate question and is not decided here.

## OSS source audit (user-provided archives)

- `datasketch/datasketch/lsh.py`: LSH band parameters, hash table insert/query and explicit retrieval tradeoffs; `minhash.py`: signatures and estimated resemblance.
- `text-dedup/src/text_dedup/minhash.py`: shingle fingerprints, clustering and **false-positive checks** before deduplication. Bulk Python dataset stack not added to PEE.
- `dedupe/dedupe/api.py`: `uncertain_pairs` and `mark_pairs` for labeled record linkage; cannot use model unless enough genuine independent labels. It must NOT decide test-event identity from text similarities alone.
- `changedetection.io/changedetectionio/processors/base.py`: raw content checksum and update detection; `content_fetchers/requests.py`: HTTP response handling. Use its *change-detection patterns* rather than deploying a web monitoring service. Hashing an analyst extract cannot prove publisher raw bytes unchanged.

## Required next work

Obtain lawful primary source snapshots, blinded independent pair labels across categories, original-test-event lineage gold, including deliberately identical values from independent labs and deeply paraphrased copies. Quantify candidate recall, false positives, false merges and the cost of manual review; decide thresholds with held-out data. Source-right checks and author authentication remain blockers for production, as does research worker/DB integration.
