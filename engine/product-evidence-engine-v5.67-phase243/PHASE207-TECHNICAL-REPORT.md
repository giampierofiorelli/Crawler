# Product Evidence Engine — Phase207 technical report (v5.31.0)

**Date:** 13 October 2026  
**Canonical predecessor:** `product-evidence-engine-v5.30-phase206.zip`  
**Scope:** signed benchmark review admission, output freezing, and rights-aware source-accountability; **not** a production video-analysis engine or independently validated recommendation system.

## Executive decision

Phase206 can measure errors only when at least two separately identified reviewers have labelled the same original source. Its review receipts and blindness declarations were previously ordinary values inside a JSON object. A caller could claim an independent review without a cryptographically verifiable link to a configured reviewer identity. Phase207 makes that assertion harder to spoof, while retaining the critical distinction between **signatures and actual evidentiary truth**.

The higher-level objective has not changed: reliably infer a buyer's real use case, find relevant original measurements and qualified practical/outcome experience, avoid repeated experiments and false authority, stop research only when decision-relevant evidence suffices, then give deterministic and cautious recommendations. Video sources (including consumer creators and non-English specialists) are useful insofar as they improve those decisions, not because additional content is automatically stronger evidence.

## Code actually implemented

- New `src/phase207_signed_benchmark_admission.ts`. It reuses Phase203's canonical video identity, Phase200's signed-envelope type and Phase206's evaluator. It **does not add a crawler, scoring engine, publisher ranking or automatic trust-badge issuer**.
- A coordinator-approved Ed25519 signature binds dataset ID, version, specific cases and canonical sorted prediction/pair-prediction digests. Changes after freeze are refused; shuffled order is invariant.
- Reviewer Ed25519 signatures bind the **exact case/variant/criterion/discipline/language/video**, source review/version/access receipt, reviewer identity, time and five original Phase206 classifications. Unrecognized keys, modified labels, scope changes, expired keys and duplicate keys/principals are refused.
- A case is admitted to Phase206's reviewed-gold subset only with two correctly signed, distinct reviewer principals; source metadata-only results are held. Similar controls apply to same/different underlying test-event pair judgements. Missing reviewers and rejected attestations remain explicit.
- The signed receipt format never contains full transcripts, frames, publisher paragraphs or private keys. The runtime's output still sets `realScientificAccuracyClaimAllowed=false`, `actualOriginalVideoAccessVerified=false`, `reviewerIndependenceProvenBySignature=false` and `productRankingModified=false`.
- New `scripts/phase207-public-metadata-replay.mjs` runs the six **real metadata leads** carried over from Phase206, using **ephemeral test-owned keys only**. All six remain held; zero signed gold labels are admitted; accuracy remains `null`.
- `tests/phase207_signed_benchmark_admission.test.ts` provides 27 software tests for signed scope identity, tampering, frozen predictions, same-key duplicate identities, the metadata-only firewall, pair relationships, abstention and output retention. `docs/phase207/REVIEW-PROTOCOL.md` defines the external annotation and provider-comparison procedure.

## What was measured (and what wasn't)

- TypeScript build passed. **27/27 Phase207 targeted tests passed.**
- Cumulative TypeScript regression: **3,672 tests passed** in 14 completed shards plus all 12 separately completed files of one initially stalled shard. Two inherited test files `phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js` remain outside the confirmed run, consistent with earlier legacy timeouts. Do not count them as passes.
- Python: **212 tests passed** (47 primary, 21 ingestion, 26 evaluation, 12 Phase95, 35 tests-python, 71 tests-companion). The companion group passed using `/usr/bin/python3` after an inconclusive invocation using the virtualenv. See preserved execution logs and `PHASE207-TEST-RESULTS.json`.
- Source-backed experiment: **six genuine public YouTube URLs**, all metadata-only. **Zero** video bodies or subtitle tracks were verified; **zero** independent real-world gold labels; **no scientifically meaningful accuracy, recall, false-merge rate or reduction of research work measured**. The demo explicitly reports accuracy `null`.

## Comparison with Phase206

| Dimension | Phase206 v5.30 | Phase207 v5.31 |
|---|---|---|
| Evaluation | Two labels identified by text fields, checked structurally | Adds real Ed25519 verification against externally configured key anchors |
| Blindness | A boolean supplied by caller | Coordinator-signed frozen predictions plus signed reviewers, **still not proof of true blindness** |
| Exact scope | Structurally checked | Reviewer signatures cover video/variant/discipline and source review/version IDs |
| Same underlying experiment | Evaluated from reviewed pair labels | Optional signed pair-review admission before Phase206 evaluation |
| Six real metadata leads | No gold labels, accuracy null | Remain unlabelled and held; public replay reproduces null |
| Provider comparison | No valid real source labels | Audit-ready signed input contract; provider comparison still blocked by absent reviewed content |
| User buying advice/ranking | Unchanged | Unchanged |

## Original evidence and scientific sources

1. [NIST AI RMF, MEASURE core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/): context-specific evaluation, documented uncertainty and independent review improve reliability. This supports evaluation discipline; it does **not** scientifically validate this implementation.
2. [NIST AI RMF Playbook, Measure](https://airc.nist.gov/airmf-resources/playbook/measure/): traceable test sets, metrics, documentation and monitoring.
3. [NIST AI 600-1, Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf): provenance, content-lineage awareness and independent evaluation are necessary safeguards.
4. [W3C PROV-O Recommendation](https://www.w3.org/TR/prov-o/): provenance and derivation concepts; earlier PEE phases use these distinctions.
5. [Cochrane Handbook on collecting data](https://www.cochrane.org/node/97): collate publications from the same underlying study, not count repeated reports as independent experiments.
6. [YouTube official captions download documentation](https://developers.google.com/youtube/v3/docs/captions/download): official caption download needs user permission to edit the video. No unrestricted automated caption ingestion was implemented here.
7. User-supplied originals: YouTube.js, youtube-transcript-api and PyABSA are still present byte-for-byte in `research/phase205-external-code/`, with the existing source retention register and cumulative audit notes. Nothing was installed as a runtime dependency in this phase.

## Critical limitations and risks

- Signing keys only attest configured identities. The provided policy must be loaded by a **privileged trusted application component**, never selected by a creator, content provider or model being tested. Test-generated keys can demonstrate software behaviour but do not authenticate independent researchers.
- Even two independent configured keys cannot prove that two real people independently watched the same video, maintained blindness, had source rights, possessed domain expertise, or correctly interpreted a culturally specific outcome. Separate review operations and original-source custody must be audited.
- Source review/version/access identifiers are *signed assertions*, not authenticated YouTube source-byte hashes. Phase201's controlled acquisition applies to supported document formats; no attempt was made to treat metadata as authenticated video media.
- The reviewer and coordinator roles are conceptually separate from the Phase200 **public trust mark** approval roles; the signature envelope is reused but no authorization to publish claims is borrowed from it.
- Contaminated/gamed annotations, source changes, translation errors, commercial relationships, presenter performance and true event identity require actual blind reviewed cases. Passing authored fixtures cannot establish numerical scientific precision/recall or provider superiority.
- The two inherited Phase91/92 runner issues still require an isolated maintainer audit. They are not silently excluded from future release requirements.

## Phase208 priorities

1. Acquire a **small rights-appropriate original video/creator dataset**, with original source/version receipts, exact product variants and independent source examination. Do not infer human qualifications from channel followers, national origin or awards.
2. Enroll reviewer keys in privileged configuration with real identity and role checks; freeze model outputs out of reviewers' reach; audit external source viewing and expert qualifications. Apply Phase207 intake only after these external conditions exist.
3. Compare native Phase205 pipeline and preserved YouTube.js/youtube-transcript-api/PyABSA on **the same** reviewed examples. Report extraction precision/recall, abstention/coverage, false test merges, latency/dependencies and effect on Phase197 research stopping or recommendation decisions. No automatic provider adoption based on synthetic scores.
4. Examine Phase91/92 test-runner hangs independently and keep quarantining transparent.

**Release criterion:** improvements are only real when properly sampled original cases show the PEE makes a more defensible buyer decision without misrepresenting evidence or raising unsupported trust badges. Phase207 meets a software provenance prerequisite; it does not yet meet that outcome criterion.
