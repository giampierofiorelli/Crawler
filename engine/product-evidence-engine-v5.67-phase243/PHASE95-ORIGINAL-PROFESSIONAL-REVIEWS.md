# Product Evidence Engine — Phase 95: original professional review acquisition

**Date:** 10 October 2026 · **Cumulative repository:** v4.19 (Phase 95), based on v4.18 Phase 94

## What is implemented

This phase directly extends the **existing repository**, rather than producing a disconnected review-analysis demonstration. It introduces:

- `phase95/review_html.py`: a bounded HTML parser (Python standard library) for explicitly attributed battery-runtime measurements in **single-product professional reviews** and **reviewed comparison articles**. It preserves the exact product, reported metric, unit and ANC context, and rejects inaccessible-score placeholders, other-model misattribution, manufacturer-claimed values, and conflicting figures. Any unrecognised claim is omitted rather than inferred.
- `src/phase95_professional_review_intake.ts`: a TypeScript bridge from the established **Phase 68 research planner → Phase 69 guarded web reader → transient HTML parser → Phase 70 structured evidence quarantine**. The output is an audit-ready observation with source URL, content SHA-256, test ID, method ID/version, exact product/variant ID, measurement unit and source passage hashes. Raw article HTML and quotations are not persisted through this new path.
- Eight TypeScript and twelve Python focused tests, including end-to-end simulated authorized retrieval, value conversion, source/model distinction, and multiple-product comparisons.
- A small **real-publisher factual audit**, clearly segregated from the software's synthetic end-to-end tests: `audit/phase95/real-professional-review-facts.json`.

This phase deliberately **does not replace** independent expert reviews with summary ratings, manufacturer specifications, price signals, retailer popularity or consumer feedback. Nor does it merge measurements across incompatible methods. It does not change the consumer recommendation engine or automatically approve quarantined observations.

## The concrete real-review evidence inspected

The following are factual observations read from currently published source pages using the web research tool. They were not retrieved as native HTML by the running repository, because outbound HTTPS/DNS remains unavailable here.

| Original source | Exact tested model | Continuous battery result reported by source | Test context |
|---|---|---:|---|
| [RTINGS Sony WH-1000XM5 review](https://www.rtings.com/headphones/reviews/sony/wh-1000xm5-wireless) | Sony WH-1000XM5 Wireless | Approximately 27 h | ANC enabled; RTINGS test bench/methodology v2.3 in current review |
| [SoundGuys Bose vs Sony comparison](https://www.soundguys.com/bose-quietcomfort-ultra-headphones-vs-sony-wh-1000xm5-104454/) | Sony WH-1000XM5 | 31 h 53 min | ANC on; SoundGuys lab battery test |
| [SoundGuys Bose vs Sony comparison](https://www.soundguys.com/bose-quietcomfort-ultra-headphones-vs-sony-wh-1000xm5-104454/) | Bose QuietComfort Ultra Headphones (first generation) | 27 h 37 min | Same stated SoundGuys test conditions |

**Interpretation:** RTINGS and SoundGuys report *different measurements* of Sony battery life, differing by **4 h 53 min**. This is not grounds to choose one or take an average. Preserve two separate publisher/test-method records. The two figures in the SoundGuys comparison are comparable within the published test's own method claim, pending independent methodological appraisal. The RTINGS review reports that its Sony headphone review was retested on **2 July 2026**. Test version dates and updates do not by themselves certify correctness or external reproducibility.

The published RTINGS page displays certain detailed metrics only to subscribers using placeholders such as `Locked` and `0.0`; these are intentionally not observations. No attempt was made to retrieve restricted metrics or bypass access controls.

## Actual software test outcome

- Phase 95 Python HTML parser: **12/12 passed**.
- Phase 95 TypeScript end-to-end research integration: **8/8 passed**.
- Original repository TypeScript/JavaScript test corpus: **650 passed in five completed shards** (logs in `audit/phase95/`). All original integration paths are retained.
- Source-connector Python suite: **47 passed**; ingestion Python suite: **21 passed**; evaluation Python suite: **26 passed**.
- Phase 87–89 companion integration suite: **60 Python and 16 Node tests passed**.
- Launch checks: **4 passed**; release checks: **3 passed**.

The TypeScript full monolithic command hit its runtime limit in the evaluation environment; the five independently executed shards completed successfully. **These regression tests are not a measurement of accuracy across new public review sites.** The focused tests use synthetic HTML/authorization. `source_native_html_downloaded_by_repository=false` is explicitly recorded in the source audit JSON.

## Next engineering work

The substantive acquisition system must now broaden beyond battery life. Follow the same reviewed source-specific recipe process for noise isolation, frequency-response and distortion measurements, microphone intelligibility, tested cleaning/drying/cooling capacity, durability/repair outcomes, and clearly labelled qualitative expert observations. Distinguish *what was measured*, *under what protocol*, *what the reviewer concluded*, and *what the user actually needs*. For mixed-comparison prose, require explicit entity links and refuse ambiguous attribution. Add verified strategy learning and reuse to the Phase 85 archive, with local LLM assistance only when no deterministic recipe suffices.

For a true live extraction benchmark, run **the unmodified Phase 69 authorized reader** in a network-enabled environment, with real articles and independent criterion/variant labels. Record coverage, false values, abstentions, access failures, and model-inference cost by source and category. Don't describe consultable pages or manually recorded figures as live crawler output.
