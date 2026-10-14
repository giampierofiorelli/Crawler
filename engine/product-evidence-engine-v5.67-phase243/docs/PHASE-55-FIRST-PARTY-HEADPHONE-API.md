# Phase 55 — Direct first-party headphone measurements, through a real API

**Date:** 10 October 2026  
**Status:** API adapter implemented and tested with **mocked** GitHub API responses; live acquisition attempted but **blocked by network DNS in this environment**. The product is **not** linked to this dataset and does **not** publish recommendations from it.

## Why this is an actual primary-source opportunity

The [Super Best Audio Friends / Headphone Measurements Frequency Response repository](https://github.com/superbestaudiofriends/headphone-measurements-frequency-response) openly publishes numerical curves for specific named headphone models, not secondary review-rating averages. Its README says the measurement work is **Creative Commons Attribution 4.0** and documents measurement-rig labels/compensation versions and file layout. It is a small enthusiast/reviewer measurement collection, not a general professional-lab subscription or guaranteed current-UK-product inventory.

The repository contains, for example, `cEAR30-Sennheiser-HD600-L.txt`, `cEAR30-Focal-Elex-L.txt`, `cEAR32-Focal-Elex-L.txt`. The original format has two tab/space-separated columns (`frequency`, `amplitude dB`), with compensation and left/right channel encoded in filenames. The README states measurements are 1/6-octave smoothed and normalised, with potential seal and placement errors. It warns measurement systems and compensation versions differ.

**The source is ORIGINAL to the upstream public measurement archive, not a feed of Testseek or alaTest aggregated ratings.** Its quality and 2026 market coverage are limited and must be evaluated. A declared CC BY licence does not resolve every possible downstream attribution, original contributor, or data-protection question; assess exact file provenance before public use.

### Primary links

- Source: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response
- Publisher README with license and methodology: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/README.md
- Example measurement file: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/cEAR30-Sennheiser-HD600-L.txt
- Official GitHub REST Contents API: https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content
- CC BY 4.0 terms: https://creativecommons.org/licenses/by/4.0/
- Another documented public measurement API, **not independently licensed for re-use of every original measurement**: https://www.spinorama.org/docs/09_api.html — Spinorama explicitly includes a mix of third-party reviewer, lab, and manufacturer-origin data; do not confuse its GPL software licence with blanket rights over source measurement data: https://www.spinorama.org/docs/06_sources.html

## Implemented in this phase

`primary_sources/headphone_api.py` provides a runnable official-API client. It:

1. Resolves the official GitHub repository's master branch to an immutable **40-character commit SHA** before fetching files; optionally accepts a fixed SHA.
2. Uses **the official GitHub REST API**, not an uncontrolled website scraper, for repository contents at the pinned revision.
3. Has a hard-coded repository allowlist, exact `.txt` filename rules, HTTPS-only API host checks, no redirects, bounded payload sizes, and optional GitHub token via `GITHUB_TOKEN`.
4. Verifies the Git blob SHA-1 returned by GitHub against the actual returned bytes, and also records an independent SHA-256.
5. Parses the native raw frequency-response curve in original `Hz` and relative `dB` without inventing a 0–10 grade.
6. Preserves channel, protocol/rig-compensation label, original file link, attribution and source revision.
7. Separates tentative within-protocol comparisons from observations obtained on **different** rigs/compensation versions; **even a within-protocol pair is not yet proven comparable** without editorial/measurement-method review.
8. Marks the entire result `research_only: true`, `ranking_input_approved: false` and `real_market_variant_match_verified: false`. It is completely disconnected from the production ranking and Amazon purchase links.

### Run with access to GitHub's official API

From project root:

```bash
python -m primary_sources.headphone_api \
  --file cEAR30-Sennheiser-HD600-L.txt \
  --file cEAR30-Focal-Elex-L.txt \
  --output headphone-research.json
```

The module fetches the current repository commit and both files using the official GitHub API. The output is a research-only structured JSON with original unit data, hashes and source citations. `GITHUB_TOKEN` may be supplied in the environment for authenticated API rate limits; the client does not print it or permit arbitrary outgoing hosts. Running outside this environment is necessary to demonstrate the live download. No API access is claimed here.

### Tests

```bash
python -m unittest -v primary_sources.test_headphone_api
python -m unittest -v primary_sources.test_blender_ingest primary_sources.test_original_lab_feed primary_sources.test_headphone_api
python -m unittest -v ingestion.test_validate ingestion.test_export_approved ingestion.test_postgres
npm test && npm run test:launch && npm run test:release
```

Phase results recorded in the ZIP: **17/17** direct API tests, **47/47** total primary-source tests, **21/21** existing Python tests, **145/145** TypeScript tests, **4/4** launch isolation, **3/3** standalone release. The new API tests use fictional values inside mocked GitHub API responses; they verify code behavior but not availability of a live feed or scientific quality.

The actual live attempt in this container failed with a name-resolution/network error. See `phase55-live-attempt.txt`, included in the ZIP. No records were downloaded live; none are described as real measurement observations in our output.

## Evidence suitability gate before recommendations

1. **Rights:** Validate exact file's copyright/contributor attribution and any modification obligations. Preserve attribution and mark any derived results as adaptations. Note that a commercial use clause does not automatically validate independently obtained third-party copies.
2. **Identity:** Verify the exact headphone variant and era/revision, right/left channel, region, and retail identity; filename-only matching is insufficient.
3. **Protocol:** Verify compensation and measurement fixture, version, calibration, seal and conditions; otherwise incompatible curves cannot be compared.
4. **Performance scope:** Frequency response is only one quality dimension. This source cannot alone determine audio experience, comfort, durability, isolation, ANC, battery, call quality or user fit.
5. **Coverage:** Quantify current catalogue coverage across user-selected products and categories before any product claim of comprehensive market analysis.
6. **Independent evidence:** Seek multiple lawful ORIGINAL measurements and source-method disagreements. Separate community test results from controlled professional lab results in confidence levels.
7. **Public gate:** Do not elevate any result into `buildLaunchRecommendation()` until independent editorial validation, rights evidence and real-world calibration exist. No new price or Amazon inputs are permitted.

## Other sources checked; important difference

- [Spinorama API](https://www.spinorama.org/docs/09_api.html) is a promising **machine-readable numerical-measurement API**, BUT Spinorama's documented sources include AudioScienceReview, ErinsAudioCorner, other labs and *manufacturer* measurements, each with potentially different rights. Its source mix means it is **not itself the original producer of every measurement**; its GPL code licence is not a blanket third-party dataset licence. For this user's requirement to start **upstream**, require provenance and source rights per original dataset before use.
- [RTINGS commerce/licensing contact](https://www.rtings.com/company/contact-us) remains important for broader controlled independent consumer tests; as of 2026 RTINGS moved its full measurements behind membership, so there is no verified public bulk API for our use: https://www.rtings.com/company/revamping-our-membership-program

## Decision

**Meaningful technical advance:** a tested first-party numerical source client exists, using official API calls and a declared commercially reusable license, without downstream scores/aggregators.

**Not a finished evidence engine:** we still lack sufficient independently validated original results across multiple criteria and models, live API access confirmation here, editorial rights review per measurement, and calibration for original personalised rankings. Preserve the current public demo as non-publishable and keep merchant links after ranking only.
