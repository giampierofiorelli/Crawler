# Product Evidence Engine — Phase 94: genuine-source evaluation, without invented live crawling

**10 October 2026 | Basis: original v4.18 Phase93 repository | Scope: legitimate source-access preflight and reproducible authentic-data replay**

## Verdict

**Live web-crawling evaluation: NOT COMPLETED.** This is a real-source examination and a replay of previously preserved genuine data, not a simulated success reported as live. The container cannot resolve external DNS for any of four scoped hosts and therefore did not download source-native HTML or fresh CSV. In addition, a source-content Creative Commons licence does not itself authorize crawling its website. Raspberry Pi's current site terms expressly reserve web-scraping and text/data-mining rights. All proposed automatic extraction from that website is excluded unless separately authorized or demonstrably within an applicable legal exception.

**Actual execution results:**

| Check | Actual outcome | Interpretation |
|---|---:|---|
| Source websites reviewed via public browsing | 4 source families | External pages are real, but raw HTML not delivered to this runtime |
| DNS feasibility (4 domains) | 0/4 resolved | Network barrier, not extractor failure |
| Original live HTML fetched by project | 0 | Therefore no real-HTML precision/recall |
| Raspberry Pi automatic-acquisition authorization | Refused | Explicit current site-terms restriction |
| Arduino automatic-acquisition authorization | Refused pending review | Published HTML, but site-specific rights/robots not cleared |
| SBAF original HPDB measurement fragment, previously held | 20/20 points reproduced | Existing genuine-source *offline* parser regression; self-derived reference, not independent accuracy |
| Blender Open Data, previously transcribed | 3 device records parsed | Not a fresh original CSV export or a retail product recommendation |
| New Phase94 rights-gate software tests | 5/5 passed | Controlled unit tests, not field accuracy |
| Phase69/90/93 relevant mainline tests | 23/23 passed | Mainline integration regression |
| Existing Python primary-source tests | 47/47 passed | Source adapter regression |
| Existing evaluation tests | 26/26 passed | Evaluation harness regression |

The cross-run test counts test distinct suites, but **none are measurements of general web extraction quality**. A result of “20/20” cannot be advertised as 100% accuracy on real websites. The locked comparison values came from the same saved 20-point excerpt.

## Sources examined and explicit URLs

1. **Raspberry Pi** — product documentation: https://www.raspberrypi.com/documentation/microcontrollers/pico-series.html . Online documentation licence: https://www.raspberrypi.com/licensing/ . Site terms (last updated 2 June 2026), clause 5.8: https://www.raspberrypi.com/terms-and-conditions/ . Site robots: https://www.raspberrypi.com/robots.txt . Content licence CC BY-SA is positive for certain forms of reuse, but clause 5.8 is an express reservation against scraping/TDM on the website. Do not use site robots permissiveness to override contractual restrictions. Public manual review of the page reveals clearly attributed *different variants in the same HTML document*, a high-risk situation for careless model matching. Do not treat the entire document as one model's data.
2. **Arduino** — three separate official product pages: https://docs.arduino.cc/hardware/uno-r4-wifi/ , https://docs.arduino.cc/hardware/uno-r4-minima/ , https://docs.arduino.cc/hardware/nano-esp32/ . Terms: https://www.arduino.cc/en/terms-conditions . The public page representation contains genuine numeric manufacturer declarations, such as UNO R4 WiFi and Minima having a 48 MHz microcontroller clock. No machine-use rights claim is made; raw HTML and robots access for the manufacturer's domain could not be verified in this environment. Do not infer permission from the open hardware licensing policies.
3. **Blender Open Data** — official raw-data page: https://opendata.blender.org/download/ ; methodology: https://opendata.blender.org/about/ ; grouped page referenced in prior dataset: https://opendata.blender.org/benchmarks/query/?blender_version=4.4.0&compute_type=OPTIX&group_by=device_name . Blender states that the published raw benchmark archive is CC0. Our preserved local 3-record demonstration was *manually transcribed from a published grouped page in an earlier phase*, and is NOT that original raw archive. Device-level, community-submitted scores cannot establish exact retail SKUs or overall product suitability. For a genuine new acquisition benchmark, prefer a documented download of the official CC0 archive (checking its included LICENSE.txt) in a network-enabled, rights-approved environment.
4. **SBAF / Super Best Audio Friends HPDB** — original dataset: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response ; example file: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/cEAR30-Sennheiser-HD600-L.txt ; author's statement of CC BY 4.0: https://github.com/superbestaudiofriends/headphone-measurements-frequency-response/blob/master/README.md ; licence https://creativecommons.org/licenses/by/4.0/legalcode.en . A pre-existing locally saved first-20-point partial measurement excerpt was checked with SHA-256 `4320f9033e35189d73646b28d8f605c8522e7ea951d683d6a70954c14bff7757`; the pre-existing replay parser read all 20 existing reference points. It is **not** an external fetch performed in this phase, a complete measurement, or a validated assessment of the headphones.

## Evidence hierarchy maintained

- Arduino and Raspberry Pi technical fields are manufacturer declarations, **never independent lab performance results**.
- SBAF supplies independent measurement data with methodology limits and an original-test provenance trail; the small excerpt is not enough for a product suitability conclusion.
- Blender benchmark submissions use a named benchmark version and compute backend, but are community submissions and cannot be treated as an independent controlled consumer-product comparison.
- No price, affiliate link, commercial offer or retailer status influences ranking. No product recommendation or manufacturing-retirement conclusion has been generated.

## Reproducibility

The accompanying repository contains `evaluation/phase94/genuine_source_gate.py`, `evaluation/phase94/test_genuine_source_gate.py`, and execution outputs in `audit/phase94/`. All 666 original members of the supplied v4.18 zip are present and **byte-for-byte unchanged**; Phase94 adds evaluation resources only. The folder is deliberately labeled `v4.18-phase94-real-source-pilot`, not `v4.19` or a production-ready live integration.

```bash
python -m evaluation.phase94.genuine_source_gate audit/phase94/phase94-genuine-source-results.json
python -m unittest -v evaluation.phase94.test_genuine_source_gate
python -m evaluation.phase84.replay --manifest evaluation/phase84/authentic_source_manifest.json
python -m primary_sources.blender_ingest fixtures/primary_blender/observations.csv fixtures/primary_blender/manifest.json audit/phase94/blender-replay.json
```

### Requirements for a proper live experiment

Use a runtime with authorized outbound DNS/HTTPS; document actual terms, robots, content rights and exact purposes of collection *before* the source reader accesses a URL. Prefer the official Blender archive or a first-party repository with clear source-data reuse terms. Capture immutable original response SHA-256 and exact model IDs with **independently labeled** train/qualification and held-out validation samples. The Phase93 `runPermissionedHtmlPilot` harness is ready for source-native HTML input, but must not receive fabricated rights receipts. Measure failed URLs in the denominator and report accuracy by page template and extraction type, in addition to runtime/cost and human repair effort. Do not bypass source restrictions or call manual transcriptions live acquisitions.

## Outcome

This phase found a genuine source-legitimacy problem (open documentation licence versus restrictive site terms) and demonstrated functioning, limited replay of authentic data while refusing unverified live acquisition. A trustworthy **real-HTML acquisition benchmark remains blocked**, for documented reasons. The highest-value next field test is a *fresh official openly licensed data export* with independently verified source bytes, followed by a separately authorized set of manufacturer HTML pages and held-out products.
