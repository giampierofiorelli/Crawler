# Product Evidence Engine — Phase206, v5.30.0

**Date:** 13 October 2026. **Canonical predecessor:** `product-evidence-engine-v5.29-phase205.zip` (full cumulative project). **Status:** implemented, compiled, bounded software-tested; NOT an independently validated video/content-understanding engine, production ranker or automatic public trust-badge authority.

## Executive decision

The bottleneck in Phase205 is **credible evaluation**, not another parser. The native Phase203 video search, Phase204 creator/award appraisal and Phase205 provider/track normalization already exist. Adding YouTube.js, youtube-transcript-api or PyABSA without independently labelled original videos risks optimizing the appearance of sophistication rather than making better product recommendations. Phase206 instead builds a strict, reproducible measurement and abstention layer and seeds a real public-metadata discovery sample. None of the three user-provided code archives was removed, installed as a runtime dependency or made obsolete.

**Long-term objective:** understand a real buyer's intent and critical constraints; discover product models even in niche markets; identify the underlying independent tests, qualified experience and specialist result evidence; compare test scope, author qualifications, provenance and contradictions; stop only when decision-relevant evidence is sufficient; communicate cautious reproducible recommendations with credible specialist confirmations only if separately authenticated.

## Changes to source

- New `src/phase206_video_evidence_benchmark.ts`: versioned, bounded, deterministic, offline adjudication/evaluation for task-scoped video evidence; consumes source-linked `Case206`, at least two separately identified, blind-to-prediction human `CaseJudgment206` annotations, optional explicitly reviewed event relationships, and versioned model/native `Prediction206` outputs.
- Per-field metrics are **not conflated**: claim kind, discipline-specific reviewer capability, exact variant, originality and commercial disclosures. Computes prediction-only accuracy **with coverage**, abstentions, unresolved gold values, and annotator conflicts separately. Timestamp alignment counts only independently labelled moments; paired event scoring distinguishes false merges from false splits. Missing or ambiguous evidence has no automatic negative product-quality score.
- Scope and input safety: Phase203 strict canonical YouTube URL, exact variation/category/criterion/discipline, input and receipt validation, mandatory provider and version match, review independence checks, reviewer/pair duplicates rejected, publisher/video body text rejected by allowlisted fields. No HTTP, API credentials, transcript copy, badges or rank updates.
- New `scripts/phase206-evaluate.mjs` offline CLI. New `tests/phase206_video_evidence_benchmark.test.ts`, focused on error cases, provenance, no fake scientific accuracy, metamorphic order invariance, false experiment merging, abnormally missing data and precise refusal states.
- New `docs/phase206/REAL-VIDEO-METADATA-PILOT.json` with **six real public video URLs** obtained from the web and their bounded discovery scopes (espresso, air fryers, Japanese sashimi knives; EN/DE/JA). These are metadata leads, **not watched video content or a corpus of independently verified test outcomes**. No full transcript, view count, like score or inferred expert nationality is stored. A replay on the real-metadata pilot correctly reports zero eligible gold labels and accuracy `null`. `PUBLIC-PILOT-SOURCE-NOTES.md` provides exact source links and necessary access/review caveats.
- A stable baseline README for the next independently blinded expert/professional annotation protocol, with checks for source rights, exact variant, translation/ASR, visual verification, commercial disclosures and matched written experiments. User-supplied GitHub originals remain intact in the existing `research/phase205-external-code/` collection.

## Actual sample and evidence status

- James Hoffmann, *The Fellow ES1 Espresso Machine Review* (13 Aug 2026): https://www.youtube.com/watch?v=mAYbmcqPphc — video description lists espresso result and pressure chapters. No source content independently examined.
- James Hoffmann, *The £60 Aldi Espresso Machine* (17 Jan 2025): https://www.youtube.com/watch?v=zX6F_l_KreM — a second model on the same channel, **not an independent laboratory endorsement inferred from a second URL**.
- Fritteusen-Profi, *Tested for months... Which air fryer will be the best in 2026?* (23 Nov 2025): https://www.youtube.com/watch?v=fKm_-q-APk0 — German multi-appliance video; affiliate links declared in public description.
- Houme Interior Design, *We tested World's Best Air Fryer 2026 I Now in India* (3 Jul 2026): https://www.youtube.com/watch?v=hDt0XWw0IvU — public description discusses an Indian-cooking comparative setting; creator's test method not validated.
- 料理人設楽の料理道場, *How to Sharpen a Sashimi Knife* (28 Nov 2020): https://www.youtube.com/watch?v=y-T-e5LLgH8 — Japanese specialist-topic metadata, public affiliate disclosure, no authenticated credentials.
- Secrets of Sushi, *How to Sharpen Your Yanagiba* (4 Sep 2017): https://www.youtube.com/watch?v=k-AX5ayEVgM — comparative topic/source discovery, not a verified independent test.

All 6 records have `reviewBasis=metadata_only`, no source-review receipt, no truth labels and no test-event attribution. The scope variant is a search target, **not authenticated model identification**. A scientifically measured recall, extraction precision, independent reviewer judgement, award validity or final recommendation change cannot be computed from these 6 entries. This absence of fake metrics is a desired outcome.

## Research and existing solution evaluation

1. [Cochrane Handbook (data collection)](https://www.cochrane.org/node/97) distinguishes underlying studies from publications discussing them; do not count a copied video or translated text as a new experiment. Evidence interpretation, not authorization for scraping.
2. [W3C PROV-O](https://www.w3.org/TR/prov-o/) provides a grounded model for provenance, attribution and derivation, already used in earlier PEE lineage work.
3. [SAFE stopping heuristics (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10908130/) and [robust early stopping criteria (2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11583672/) show the trade-off between cost and missed relevant sources. Their quantitative performance is **not** transferred to PEE without evaluation.
4. [Argilla annotator agreement guidance](https://docs.v1.argilla.io/en/v1.26.0/practical_guides/collect_responses.html) documents inter-annotator methodology. This Phase206 module uses explicit reviewer disagreement counts, not Krippendorff's alpha, which would require suitable sample structure and calibration. No Argilla runtime dependency.
5. [YouTube developer policies](https://developers.google.com/youtube/terms/developer-policies) and [policy guide](https://developers.google.com/youtube/terms/developer-policies-guide) permit some public video metadata API operations without creator OAuth, subject to service credentials/policies; **do not justify arbitrary caption scraping**. [Official caption download](https://developers.google.com/youtube/v3/docs/captions/download) requires editing permissions. A search-engine value-added use is not a blanket exemption.
6. **User-provided repository source audits:** YouTube.js 18.1.0, youtube-transcript-api 1.2.4, PyABSA 2.4.3 are still present as originals, with their earlier hashes and engineering decisions. Future A/B comparison must report extraction quality, false merges, deployment/RAM footprint, hosted costs, licence/access constraints, code maintenance and independent-label performance before adoption.

## Tests and scope of verification

See `PHASE206-TEST-RESULTS.json` and logs in `docs/phase206/test-logs/` of the new ZIP. The TypeScript build passes, and all **25 Phase206 targeted tests pass**. Source-backed metadata replay has 6 candidates, zero accepted gold content labels and zero authenticated test events. Regression counts reflect **completed** test runs only, with historic uncompleted Phase91/92 separated from passed files. Source data are discovered real public video pages; test fixtures for annotation/classification are synthetic.

## Difference from Phase205

| Domain | v5.29 Phase205 | v5.30 Phase206 |
|---|---|---|
| YouTube discovery and transcript shape | Native bounded provider adapters | Reused unchanged |
| Author/awards/specialist review | Research-only categorization | Reused unchanged; now explicitly measurable fields |
| Accuracy or error measurement | No repeatable evaluation harness | New offline, per-criterion evaluation with missing/abstention/conflict handling |
| Original source sample | Synthetic test data | Six authentic public metadata leads, still **no actual transcript/video review** |
| Model/SDK adoption | None; 3 original code archives retained | None; 3 original archives still retained and compared as future candidates |
| Product ranking, trust badge | Not authorized | Still not authorized |

## Blockers and next increment

- Obtain permissible source content access and record versioned review receipts. An available video URL/metadata is not enough to authenticate claimed test outcomes or professional qualifications.
- Independent two-reviewer annotation of a genuine mixed sample, blinded to candidate predictions; disagreements adjudicated by separate reviewer and documented separately. Evaluate out-of-domain creators, niche specialism, commercial content and same-experiment reposts/translated tracks.
- Run a real provider comparison against the native Phase205 baseline. Hold provider outputs to the same sample, not author-written labels. Calculate precision/recall only with eligible reviewed cases; measure false event merges, specialist missed evidence and research cost (including failure modes).
- Connect evaluation results to Phase197 evidence sufficiency **only after** verified accuracy and decision-impact checks. Never turn external awards or specialty practice opinions into official certificates or global review authority.

**No claim of production YouTube retrieval, calibrated source reliability, scientifically validated rankings, or automatically verified external badges.**
