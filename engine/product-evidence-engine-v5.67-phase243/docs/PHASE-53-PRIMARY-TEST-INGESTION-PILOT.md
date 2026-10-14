# Product Evidence Engine — Phase 53: direct primary-source evidence pilot

**Date:** 10 October 2026  
**Status:** Research-only engineering proof; **NOT** a live data integration or a consumer recommendation release.  
**Vision unchanged:** evaluate ORIGINAL independent tests, not spec sheets or averages of unrelated expert stars; personalisation comes from actual user-relevant evidence; commercial links occur after ranking and do not affect it.

## Executive findings

1. Blender Open Data explicitly licenses its daily **raw benchmark archive** under CC0 and offers JSON/CSV query downloads. It is a genuinely original benchmark publisher (the community submits results through Blender's own benchmark software), not a review aggregator.
2. We have implemented a fail-closed **offline parser for the grouped CSV export** with mandatory documented benchmark version and compute backend, per-record audit provenance, source URL, sample counts and input SHA-256. It accepts a deliberately limited fixture transcribed from Blender's official grouped page. It is not yet integrated with a live export or the zipped raw archive, whose structure may differ.
3. Twelve new Python tests pass, including failure on missing licence review, incompatible scope, duplicates, malformed numeric measurements and suspicious sample size.
4. **A GPU benchmark is not an independent comparative review of a retail product**, and Blender GPU device labels cannot identify an exact UK SKU. The outputs MUST NOT flow into the public ranking pipeline. We deliberately make `publishable_consumer_recommendations: false` and `ranking_input_approved: false` unconditional.
5. The core product bottleneck is still **original lab data with per-criterion measurements and reuse rights**. RTINGS and Notebookcheck remain the primary targets. Geekbench is a complementary source for a narrow performance dimension; access/API spec is preliminary.

## Official evidence and exact URLs

- **Blender Open Data licence and raw archive:** https://opendata.blender.org/download/ — official site states CC0; check the archive's `LICENSE.txt` when acquiring bulk data.
- **Benchmark methodology and downloads:** https://opendata.blender.org/about/ — publisher describes performance score (Cycles samples/minute across scenes), community submissions, and CSV/JSON access.
- **Exact filtered page used to transcribe this demonstration fixture:** https://opendata.blender.org/benchmarks/query/?blender_version=4.4.0&compute_type=OPTIX&group_by=device_name
- **RTINGS lab and business licensing:** https://www.rtings.com/company/how-we-make-money , https://www.rtings.com/company/contact-us — content licensing of badges/quotes is documented; a machine-readable per-measurement dataset licence is NOT established. Official contact page lists commerce@rtings.com.
- **Notebookcheck rights/contact:** https://www.notebookcheck.net/Contact.270.0.html — does NOT publicly establish permission for automated commercial extraction of measurement tables.
- **Geekbench developer API:** https://www.geekbench.com/api/api.html — API v0.1.0, under development; use rights and key availability must be checked with Primate Labs.

## Actual research fixture (NOT a verified archival export)

Three original Blender grouped-page measurements were **transcribed from the publicly indexed official page** for Blender 4.4.0 with OPTIX compute, grouped by `device_name`:

| Grouped hardware label | Median benchmark score | Number of submitted benchmarks |
|---|---:|---:|
| NVIDIA GeForce RTX 5090 | 15081.98 | 917 |
| NVIDIA GeForce RTX 4090 | 11123.82 | 404 |
| NVIDIA GeForce RTX 5080 | 9162.84 | 1150 |

This is only a demonstration of parsing/validation, not a complete or contemporaneously verified bulk dataset. Figures may change as community submissions change. The manifest says `documented_public_page_transcription`, not `official_site_csv_export`. Input must be replaced by a real site CSV export before any source ingestion can be called automated.

**Access limitation:** The available execution environment could not retrieve/download the site archive; hence **no live data download was tested**, and we make no claim of one. The official source shows a CSV/JSON control, but the exact machine-readable endpoint/format remains untested.

## Run it offline

```sh
python -m unittest -v primary_sources.test_blender_ingest
python -m primary_sources.blender_ingest \
  fixtures/primary_blender/observations.csv \
  fixtures/primary_blender/manifest.json \
  /tmp/blender-research.json
```

To analyse an official CSV export, replace the fixture CSV and set `acquisition_method` in the manifest to `official_site_csv_export`, with the actual source URL, verified exact benchmark version, compute backend, capture date and reviewer reference. This adapter accepts precisely columns `Device Name`, `Median Score`, `Number of Benchmarks`. If the official export differs, quarantine it and extend parser after reviewing the real schema; do not silently remap fields or falsely assert compatibility.

## Two *distinct* missing capabilities

### A. Original raw-data retrieval

The official page offers bulk archive downloads; a third-party Python script mentions a presumed `https://opendata.blender.org/snapshots/opendata-latest.zip` URL, but we **have not verified it with the original publisher** or inspected its contents. Do not hardcode it as an operational API. First obtain an official snapshot, verify its own `LICENSE.txt`, document archive schema and implement a separate raw-archive adapter with integrity/identity checks.

### B. Professional independent product test inputs

This is the BUSINESS-CRITICAL path; Blender only tests our governance/ingestion architecture. For any original lab, secure written and field-specific rights for automated access, retained numeric measurements, comparison/normalisation and independently derived affiliate-funded rankings. Source-to-method, method-to-version, score-to-exact-variant and per-criterion relevance must be provable. Publicly available article scores are not automatically reusable as a bulk feed.

### Direct primary-producer enquiry — RTINGS

**To:** commerce@rtings.com (or business enquiry at official contact page)  
**Subject:** Commercial access to original lab measurements for personalised recommendations

Hello,

We are building a UK-first product research service that independently ranks consumer products for individual needs using original hands-on professional test evidence. Retailer affiliate links appear only after ranking and never influence results. We are not building a ratings widget, scraper or price-comparison service.

Could RTINGS offer licensed machine-readable access to a representative subset of original per-criterion lab measurements, including units, test-bench versions, conditions, tested model/variant identifiers and updates? We would like to store and analyse the measures to generate our own personalised comparisons and explainable rankings without reproducing your full articles, quotes, proprietary tables or ratings.

Would such derived analysis, commercial publication and affiliate-funded use be expressly licensed? If possible, could you provide a field schema, a small sample, UK model coverage, pricing, minimum commitment, attribution rules, rights to retain derived results and restrictions on automation? Please distinguish measurement-feed rights from your existing quote/badge licensing arrangements.

Thank you.

### Direct primary-producer enquiry — Notebookcheck

**Contact:** https://www.notebookcheck.net/Contact.270.0.html  
**Subject:** Permission or data licence for structured original hardware test measurements

Hello,

We are developing an independent consumer recommendation engine that compares laptop models and exact UK variants according to user requirements. We are interested specifically in Notebookcheck's original laboratory measurements such as display characteristics, battery-life tests, noise, thermals and performance, not in copying articles or charts.

Do you offer an authorised structured feed, export or commercial licence to extract, retain and algorithmically analyse specified measured fields, with original article attribution, methods, conditions and tested SKU? Our output would be our own evidence-based and personalised assessment with affiliate links to retailers only after the ranking is complete.

Could you share available data formats, permitted derivative uses, product/market coverage, commercial terms and a representative sample? We will not automate acquisition before a suitable agreement.

Thank you.

### Direct benchmark publisher enquiry — Geekbench

**Contact:** support@geekbench.com (listed in API documentation)  
**Subject:** Geekbench Browser API — access and commercial derivative benchmark analysis

Hello,

We are exploring the Geekbench Browser API as one narrow dimension of an independent consumer-product recommendation service. Could you confirm current API availability, authentication/key application, field/schema stability, request limits, and access to benchmark-version, test configuration and machine/device metadata?

Please clarify whether a commercial affiliate-funded website may download, retain, filter, statistically aggregate and publish original derived conclusions based on Browser API results, with appropriate attribution and no redistribution of your raw benchmark database. If permitted, could you provide the applicable data licence and a limited development key?

Thank you.

## Release and decision gates

- Source licence and relevant terms reviewed: **Blender CC0 documented**, but fixture itself is a site transcription, not a bulk-archive retrieval.
- Parser and quarantine behavior: **tested**.
- Exact UK retail variant mapping: **not demonstrated**.
- First-party multi-dimension lab data sufficient for original concept: **not demonstrated**.
- RTINGS/Notebookcheck written feed/rights and sample: **not obtained**.
- Live API/bulk downloader: **not tested**.
- Real user recommendations: **NOT approved**.
- Amazon independence: unchanged; no Amazon content added.

**Next decision should prioritise replies/samples from primary original-test producers and prove per-dimension matching**, rather than increasing investment in GPU-only benchmark adapters. No correspondence has been sent on the user's behalf.
