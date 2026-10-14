# Phase207 reviewer and source-provenance protocol (implementation boundary)

Version: 207.1, research-only. This is a runbook, not a claim of compliance, qualified personnel or scientific validation.

## Why a valid signature is not sufficient

A signature establishes that a payload corresponds to a configured key. It cannot prove the named person exists, independence between real people, permission to access video, actual footage inspection, honest annotation or the quality of expertise. The trust-anchor configuration must be managed by a privileged administrator outside the source's or prediction provider's control. Test keys used by the public pilot are generated in memory and **do not authenticate reviewers**.

## Before any real benchmark

1. Freeze category, exact product variant, use criterion, language, discipline and decision stakes. Include understudied/new products; treat absent video reviews as missing evidence rather than product failure.
2. Obtain video content through rights-appropriate access. Record the exact URL, source version/capture reference, acquisition method, date, access constraints and an operator's source review ID. Do not keep entire publisher transcripts as permanent PEE evidence.
3. Assign two real, separate reviewers **without access to model predictions**. Verify identities and any specialist training by independently sourced documentation. Keep the review roster and assignment/audit logs outside content supplied by a creator.
4. Have the independent coordinator freeze the candidate's outputs using the canonical digest **before** reviewers inspect or receive labels. Restrict later access to the prediction set. The software merely checks signed timestamps and digest; physical blindness is an operational audit requirement.
5. Have each reviewer separately inspect source content and record the exact timestamp, what was said versus visually demonstrated, variant identification, possible commercial disclosures and test-event linkage. SourceReviewId and sourceVersionId must correspond to reviewed external acquisition/custody records.
6. Sign source-scoped, version-scoped labels with distinct assigned keys, held in privileged key management. Avoid storing creator video/transcript bodies in the benchmark metadata.
7. Disagreements remain disagreements. A third reviewer may adjudicate separately, but the existing Phase206 benchmark does not silently convert majority votes into ground truth.
8. Run one frozen dataset through PEE's native pipeline and each feasible upstream-provider baseline. Track per-field coverage, errors, abstentions, duplicate-event false merges and splits, measured latency and licensing/deployment costs. Do not compare providers on different cases.
9. Review effects on Phase197 search stopping and Phase181 recommendation decisions **only after** independently justified truth labels exist. Neither results from a public video metadata page nor signature verification alone permit ranking changes or public trust badges.

## Provider/source backlog (retained)

- YouTube.js: provider metadata and timed text adapter; source retained under `research/phase205-external-code/`.
- youtube-transcript-api: timestamped captions adapter; same source retention.
- PyABSA: aspect-sentiment model to compare against the native labels when actual licensed source observations and runtime resources are available; not installed.

Source code may be examined without authorizing unrestricted automated scraping. Official YouTube captions.download requires permissions to edit the video. Alternative methods require separate contract/rights and robustness review.

## Recommended benchmark sampling

Include equal attention to (a) credentialed technical laboratories, (b) relevant practicing professionals, (c) creators providing real-world use, (d) explicitly subjective opinions, (e) promotional/affiliate material, and (f) niche or new sources. Use espresso-machine outcomes, air-fryer performance and Japanese knife application as pilot domains, but do not automatically presume reviewer competence from nationality, popularity or platform verification. Separately label award scope and issuer when an award is invoked.

## Accuracy admission status

The six original Phase206 YouTube records remain **public metadata leads only**. Phase207 public replay has zero accepted gold labels and an accuracy of `null`. Newly signed gold data would still require auditing reviewer independence, source access and annotation procedure before being described as an independent scientific benchmark.
