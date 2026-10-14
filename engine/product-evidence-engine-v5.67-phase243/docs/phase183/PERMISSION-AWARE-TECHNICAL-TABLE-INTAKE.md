# Phase183 — Permission-aware, model-exact measurement intake

Date: 2026-10-12. Canonical predecessor: v5.06 (Phase182).

## Outcome and limits

The TypeScript module `src/phase183_source_measurement_intake.ts` accepts a *separately authorized operator-supplied local CSV snapshot*, stages numerical facts for a single exact model and identifies original source byte positions and SHA-256 digests. It connects an exact-model missing-test/missing-product research job of Phase182 to a quarantined measurement packet and stores successive packets in an integrity-checked, append-only journal. Source versions, measurement units, original document hashes, protocol identifiers and model identity are retained. Conflicts and protocol changes remain visible. None of these outputs authorize ranking, independent science, or promotion into the signed Phase181 knowledge catalog.

This component does **not** download a source, authorize a website, search the internet, decide that certification is an independent performance trial, compute comparable normalized points, or issue reviewer signatures. `operator_reviewed_local_fact_storage` is an *operator-controlled declaration*, not a self-enforcing rights credential. Deployment must obtain, persist and authenticate the source's independent legal/terms/robots review, including any distinction between API and website access. Prior Phase68/69 gates continue to apply to autonomous retrieval.

The local development environment could not download the official dataset: DNS for `data.energystar.gov` failed here, and the separate download attempt for an ENERGY STAR PDF was unsuccessful. The tests use a SHORT **hand-authored illustrative CSV fixture**, not a real downloaded EPA CSV and not an independently audited set of product results. The fixture has synthetic row context: the software tests parsing and custody invariants, not accuracy of EPA-published measurements.

## Real source identified for the next externally authorized pilot

1. US EPA ENERGY STAR Certified Room Air Cleaners V3.0 dataset: https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6 (dataset identifier `gaa3-swy6`). The dataset documents brand/model columns, dust/smoke/pollen CADR, and specification v3.0 effective October 9, 2025. On October 12, 2026, the public catalog page reported an update on September 28, 2026. Its CADR descriptions identify figures as manufacturer-reported *rated* values under the certification program. Certification is valuable structured evidence but is not automatically an independent test of suitability for every indoor environment.
2. EPA Standard Open Data License: https://edg.epa.gov/EPA_Data_License.html . EPA-produced data are generally public domain unless otherwise specified; the agency disclaims warranty and directs users to metadata limitations. This does not by itself establish permission to crawl every website or access restricted pages.
3. ENERGY STAR Products Tools and Resources: https://www.energystar.gov/products/productstr . Describes bulk CSV, XML and API access to certified product lists and daily updates.
4. ENERGY STAR air cleaner product guidance and specification history: https://www.energystar.gov/products/air_cleaners and https://www.energystar.gov/room-air-cleaners-v30 .

For the next real pilot, a verified original CSV/API export plus its metadata/rights assessment is required. Do not claim this release ingested real bytes from these links.

## Engineering evidence levels

- Original online identity and licence: verified externally, for planning.
- Original dataset content downloaded by PEE: **not done**.
- Local schema-based intake and exact-row byte custody: **implemented and software-tested using illustrative data**.
- Independent method/variant/units review: **not done**.
- Canonical product catalog admission: **not done**.
- Ranking of genuinely verified real products: **not done**.

No new upstream GitHub repository, model weights or framework were added. The current implementation reuses Node crypto, Phase182 research plans and the existing versioned evidence architecture.
