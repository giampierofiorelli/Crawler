# Phase 54 — Original laboratory data contract and quarantined import

Date: 10 October 2026. **Status: implemented offline intake prototype using a fully fictional sample. NOT a live API connection, licensed supplier feed, or production scoring.**

## Why this phase

User's non-negotiable product vision: original independent professional test evidence must determine suitability to an individual's needs. Not an aggregate star widget, not manufacturer specs. Amazon and other merchants are **only purchase destinations after the independent ranking**, never input evidence. Current public app has no prices or budget filter.

The previous phase's Blender benchmark pilot was useful solely for source provenance; community-submitted GPU benchmarks cannot stand in for lab-tested UK retail products. This phase therefore formalises the *required machine-readable original lab export*, not another aggregator.

## Implemented, verified locally

`primary_sources/original_lab_feed.py` accepts a locally acquired JSON feed and a separate rights/identity manifest. It rejects non-primary-source manifests, missing asserted commercial machine-processing grants, malformed or oversized input, unsafe publisher URLs, wrong exact market variant IDs, duplicate or conflicting original test identities, non-finite metrics, missing methods, invalid dates and unfamiliar dimensions. All accepted raw values retain the publisher's original units, original test URLs and protocol conditions. A SHA-256 fingerprint and per-variant criterion coverage report provide reproducible research lineage.

A **potential comparability report** is generated only for two or more exact product variants tested with the same dimension, unit, protocol ID and version, and conditions. This is NOT normalized performance scoring and NOT evidence that protocols are valid or UK market variants have been externally verified. No relative winner is computed.

The module is not compiled into `dist-launch/`, is not connected to the independent public ranking, makes no requests to a supplier, and always marks research data `ranking_input_approved: false` and `publishable_consumer_recommendations: false`.

### Run the isolated, fictional pilot

```bash
python -m unittest -v primary_sources.test_original_lab_feed
python -m primary_sources.original_lab_feed \
  fixtures/primary_lab/fictional_lab.json \
  fixtures/primary_lab/fictional_manifest.json \
  fixtures/primary_lab/fictional_variants.json \
  /tmp/lab-research.json
```

**Do not use this fixture for consumer recommendations**: the lab, contract, measurement numbers, identities and product IDs are invented. Flags in the manifest are assertions **not independently verified legal rights**. Before even a controlled real-data intake, a reviewer must actually inspect rights from the laboratory with coverage for machine access, retention, computational analysis and derivative commercial recommendations. An authenticated rights registry must replace handwritten manifest assertions for production.

## Required provider reply

An original testing publisher must provide:

1. A documented first-party data endpoint or a scheduled authorised export, with authentication/rate limits/refresh terms (API preferred; licensed exports acceptable).
2. Original first-party test result IDs; original review/test URL and publication date, not third-party aggregated score.
3. Exact tested make/model/variant (preferably GTIN/MPN and UK market relevance) and a tested configuration record.
4. Per-dimension measured values **with units**, test protocol/version, environment/conditions, and direction of the measurement.
5. A clear signed licence to download, retain, analyse and generate our **own user-specific rankings**, including affiliate-supported commercial use. Sub-licences and attribution restrictions must be documented.
6. A realistic sample of 20–30 real UK models (e.g. headphones/TVs), so we can measure coverage, representativeness and comparability before any fee commitment.

**Fail/hold** if a vendor only offers an average star rating, quotes/widgets, or rights to show ratings but not to compute derivative rankings. This applies to RTINGS, Notebookcheck, other primary labs and also to Testseek/alaTest if used later as suppliers.

## Public documentation and access status (not promises of permissions)

- RTINGS, original controlled product tests and methods: https://www.rtings.com/company/how-we-make-money ; contact https://www.rtings.com/company/contact-us . **No verified public measurement API/commercial feed licence in this research.**
- Notebookcheck original tests and contact: https://www.notebookcheck.net/Contact.270.0.html . **No verified commercial extraction licence.**
- Geekbench Browser API (benchmark producer, narrow technical evidence): https://www.geekbench.com/api/api.html . Published developer API specification; **commercial reuse rights and active key unverified**.
- Blender Open Data: https://opendata.blender.org/download/ ; https://opendata.blender.org/about/ . CC0 raw benchmark archive, but **only a GPU/workload-specific community benchmark**, not holistic product testing. Prior phase fixture is a page transcription, not an automated real site download.
- MLCommons MLPerf results repository: https://github.com/mlcommons/inference_results_v5.1 ; https://github.com/mlcommons/inference_policies . These are original structured results from a benchmark organisation, but **MLPerf terms of use and hardware/test scenarios need independent clearance; enterprise benchmarks are not UK consumer product reviews**.

## Exact remaining barriers

- No live original professional-laboratory API key, export, licence or test dataset obtained.
- No ability to demonstrate real product-level correctness, protocol calibration, or prediction of personal preference.
- No validation of actual rights documents, human reviewer identity, authorship or provenance authenticity.
- No full-stack connection to user-facing rankings, deliberately.
- No live download here: container network DNS was unavailable when trying the original Blender publisher URL; a web page can be read through public search but it is not an authenticated API test.

The next **business-critical milestone** is a direct original lab response and a licensed sample dataset. Only after that should we implement a specific authenticated API adapter and measurement normalisation for a category. Building another general scraper would misdirect the product.
