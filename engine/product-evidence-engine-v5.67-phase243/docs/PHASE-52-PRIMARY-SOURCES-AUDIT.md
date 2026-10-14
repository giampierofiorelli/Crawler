# Product Evidence Engine — Phase 52
## Direct-source test evidence: API, bulk access and commercial reuse audit
**Research date:** 10 October 2026  
**Market/product context:** UK-first, independent consumer product testing synthesis, personalised product ranking, no price comparison, no Amazon inputs to ranking, retailer links only after ranking.  
**Scope:** Original laboratories, benchmark publishers and original testing infrastructures — **not review aggregators**.

## Answer-first conclusion
The original product concept should **not** be replaced by a catalogue-specification comparator or by averages of review stars. We found one directly relevant example of original benchmark results that are genuinely offered as structured commercial-reusable open data (Blender Open Data, CC0), and another primary benchmark publisher with a documented programmatic API (Geekbench Browser API) whose commercial derivative-use rights still need confirmation. However, the two editorial test publishers investigated (RTINGS and Notebookcheck) do not document a public machine-readable commercial feed to their original measurements in the sources inspected, and Notebookcheck's copyright terms expressly reserve broader reuse. Therefore the technical access question and the legal-reuse question must be evaluated separately, source by source.

**Most important qualification:** Benchmarks measure individual performance dimensions; they do not by themselves tell us which TV, headphone, washing machine or laptop is better overall. The system's differentiator remains multi-criterion, evidence-based recommendation using original professional testing, with explicit evidence gaps.

## Findings by primary source

| Source | Type of evidence | Verified access | Commercial reuse | Best fit / blocker |
|---|---|---|---|---|
| **RTINGS** | Original hands-on lab measurements, methodologies and comparable test benches | Public review pages and methodology; no public score/test-result API confirmed in pages examined | Content licensing documented via Wright's Media (badges, quotes, other forms); rights for full machine-readable measurement feed **not established** | High-value primary source, but request permission/feed for measured dimensions; test bench version essential |
| **Notebookcheck** | Original hardware tests with display, battery, thermals, sound and performance measurements | Public detailed tables and individual device reviews; no official results API confirmed | Official .net contact/copyright page reserves reproduction; short quotation exception with attribution/link, not a general machine-readable extraction right | Direct publisher contact required for automated machine-readable commercial ingestion |
| **Geekbench Browser** | Scores from the benchmark creator's test suite, uploaded to official browser; includes CPU/GPU/AI and device metadata | **Documented API**, search/download, account-bound key, provisional endpoints and rate limits; specification explicitly under development | Commercial redistribution/derivative-use permission **not demonstrated by API specification** | Strong structured technical input where appropriate; API availability and licence to be confirmed |
| **Blender Open Data** | Original Blender rendering benchmark harness; raw community-submitted test runs | Official downloadable daily snapshots; site supports JSON/CSV queries/downloads | **CC0** licence expressly stated on raw-data download page | Directly useful for rendering-performance dimension; user-submitted runs and device matching require QA |
| **OpenBenchmarking.org / Phoronix Test Suite** | Reproducible benchmark profiles, opt-in community results and performance statistics | Public test/result browser and test profiles | External API described as a **future** feature on source's Features page; reuse licence for downloaded result datasets not established here | Investigate direct exports/permissions, but do not assert a currently available public external API |
| **DXOMARK** | Original lab testing of camera/audio and measurement software | Corporate **AZ API** exists, but is an API for conducting *new image-quality measurements*, **not an API to retrieve DXOMARK's published review/test database** | Software licences offered; cannot extrapolate rights to ingest editorial review results | Do not mistake product-measurement software API for a review-result data API |

## Primary-source links and what they establish

### RTINGS
- https://www.rtings.com/company/about-us — independent original testing and published methodologies.
- https://www.rtings.com/monitor/learn/how-we-test — lab testing depth; notes bench-version comparability and retesting.
- https://www.rtings.com/company/how-we-make-money — affiliate and content licensing revenue; Wright's Media manages licensing of selected content.
- https://www.rtings.com/company/revamping-our-membership-program — current shift toward memberships and concern about automated uncredited scraping.
- https://wrightsmedia.com/content-licensing-solutions — third-party publisher-content licensing options; does not by itself demonstrate dataset licensing.

### Notebookcheck
- https://www.notebookcheck.net/Contact.270.0.html — official copyright and contact; explicitly disallows unpermitted copying; short attributed quotations exception.
- https://www.notebookcheck.com/Impressum.45.0.html — German imprint, stronger express statement concerning electronic evaluation and permission.
- https://www.notebookcheck.net/Nvidia-RTX-PRO-4000-Blackwell-Generation-Laptop-Benchmarks-and-Specs.996484.0.html — example hardware benchmark page, not evidence of extraction rights.

### Geekbench / Primate Labs
- https://www.geekbench.com/api/api.html — API spec v0.1.0, under development; key requested by email to support@geekbench.com; supports individual/batch/search result operations; preliminary 100 req/min.
- https://www.geekbench.com/corporate/ — corporate licences for **running** Geekbench, distinct from a data/API redistribution licence.
- https://www.geekbench.com/blog/2026/03/geekbench-6-and-intels-binary-optimization-tool/ — example that benchmark comparability can be compromised.
- https://www.geekbench.com/blog/2026/04/geekbench-67/ — notes later detection of binary modification, plus compatibility between specified Geekbench 6 releases.
- https://browser.geekbench.com/ — user-submitted benchmark data in the official browser.

### Blender Open Data
- https://opendata.blender.org/download/ — **CC0 licensed raw datasets**, daily snapshot downloads.
- https://opendata.blender.org/about/ — score definition and JSON/CSV/search access.
- https://opendata.blender.org/ — original benchmark website.
- https://www.blender.org/news/introducing-blender-benchmark/ — official explanation of original benchmark client and public-domain data.
- https://opendata.blender.org/benchmarks/query/?group_by=device_name — grouped device outputs (watch hardware identity and different settings).

### OpenBenchmarking / Phoronix
- https://mail.openbenchmarking.org/features — API listed as *future work*, not a demonstrated present external API.
- https://openbenchmarking.org/tests — test profiles and their executable measurement definitions.

### DXOMARK
- https://corp.dxomark.com/catalog/testing-tools/product-type/software/az-image-quality-software/?attribute_licensing=Yearly&attribute_version=AZ+API — measurement automation software. **Not** an editorial results feed.

## Technical design for the original vision (not an alternative product)

**Source-level policy registry** for each original publisher or lab:
- `source_id`, `source_type` (`original_lab`, `benchmark_creator`, `testing_publisher`), and reference URL.
- `access_method` (`official_api`, `official_bulk_download`, `licensed_feed`, `permitted_public_reference`, `none`).
- `data_reuse_basis` (`CC0`, `signed_permission`, `documented_public_terms`, `legal_review_required`, `denied`).
- `rights_scope` fields for automated collection, persistent retention, numerical processing, derivative rankings, publication/attribution, commercial affiliate website, and user-facing excerpts. Each permission is separate.
- evidence timestamp, exact licence/version URL or agreement ID, human review, expiry/withdrawal status.
- `test_method`, `test_version`, `tested_product_variant`, `units`, `test_conditions`, `sample_size`, `independent_original_measurement`, and `source_url` for every input that contributes to ranking.

**Pipeline:** discover original source -> check legal access and rights -> retrieve authorised records -> verify exact product and test version -> retain raw authorised evidence/provenance -> normalise only genuinely comparable physical measurements -> user-priority fit scoring -> disclose evidence gaps -> post-ranking affiliate destination resolver.

**Separate a few published numbers from mass extraction:** a fact may not be copyright-protected in isolation, but that alone does not resolve contractual access restrictions, sui generis database rights, or automated extraction. Do not claim that a clickable web page implies permission to crawl or store the whole database. Conversely, do not assume that every public numerical result individually requires a paid licence to cite.

**Ranking safeguards:**
1. A Geekbench or Blender score measures only the particular workload and configuration, never overall laptop suitability.
2. Original editorial measurements from different labs cannot be naively averaged without comparable definitions, instruments, configurations and versions.
3. Missing performance evidence stays missing: don't infer measured lab performance from marketing specifications or reviewer adjectives.
4. Publisher and manufacturer conflict, independence, variant and updated-firmware differences should remain explicit.
5. Product ranking unaffected by Amazon, store availability, affiliate payouts or retail price data.

## Decision gates and concrete next work

### Now possible without negotiating editorial feeds
Run a narrow, technical, **non-production** proof of concept with CC0 Blender Open Data; verify the raw archive's included licence text, actual file schema, variant identity and reliability/aggregation. This proves legitimate primary-source ingestion and evidence provenance, **not** broad consumer-product recommendation capability.

### Next priority: direct commercial questions to producers of the best original tests
1. **RTINGS** — request a machine-readable subset of original per-metric monitor/headphone results, with test bench version, SKU, update logs, and explicit commercial derivative-ranking rights. A quote/badge licence is not sufficient.
2. **Notebookcheck** — request permission for structured extraction or a licensed feed of original per-test measurements, with linked review/model and explicit retention and derivative use rights.
3. **Geekbench** — ask for API key and explicit right to store, normalise, aggregate and use benchmark results inside paid/affiliate-funded consumer recommendations; clarify API maturity/coverage and production limits.
4. **OpenBenchmarking** — ask whether any non-public/partner API or authorised bulk export now exists and what permissions apply.

### Acceptance criteria (proposed; not currently achieved)
- Obtain documented rights and a representative machine-readable sample before integrating a restricted source.
- Confirm a high fraction of independently selected UK-market devices can be matched to the **exact tested variant**; publish measured rate rather than inventing a coverage figure.
- Obtain sufficient independent dimensions for actual user-relevant tradeoffs; no broad "best product" conclusion from only one performance benchmark.
- Demonstrate a traceable path from every decisive criterion to a permitted original measurement and method.
- Keep original commercial product architecture: independent evidence analysis first, retailer links later, no prices.

## Evidence status and caveats
- This report derives from current public first-party documents; it does not contain vendor API keys, non-public licensing terms, price quotations, or full raw-data quality checks.
- No claim that RTINGS or Notebookcheck offers no API whatsoever; only **no official public measurements API was confirmed** in the materials inspected.
- Licences to run benchmarking software are not licences to reproduce someone else's benchmark data.
- The legal status of each content acquisition use case requires source-specific review; this document is product/research guidance, not legal advice.
