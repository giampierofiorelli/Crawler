# Product Evidence Engine v5.64.0 — Phase 240 Technical Report

**Date:** 2026-10-14. **Status:** actual integrated implementation and offline regression verified; independent accuracy/generalization and autonomous web acquisition **not** demonstrated.

## Executive findings

The predecessor is the complete canonical `product-evidence-engine-v5.63-phase239-FULL.zip` (3,800 files). Phase 240 does **not** claim to understand pictures or diagrams. It introduces a **conservative, typed, coordinates-only review queue** for numeric programme durations in icon-headed PDF tables. Poppler's existing `pdftotext -bbox-layout` reconstructs **bounding rectangles of the numbers**, but an association to a pictogram, programme, food, physical component, exact SKU or test outcome remains explicitly **unresolved**.

- **Tefal/Moulinex Dolci Ice Cream Maker, original English pages 5–6:** **13** programme-duration visual slots (6 scoopable-like table positions on physical p5, 4 drinkable-like and 3 ancillary positions on physical p6). This is a *numerical visual-slot count*, not 13 identified programmes. No icon-to-label assignment has occurred. The older v5.63 extracts **0 document claims** and v5.64 still extracts **0 claims**.
- **Tefal Inicio Grill Adjust, original physical page 5:** **13** unassigned illustrated-food cooking-time ranges. The original page visually contains a food-pictogram/time/thermostat-selector table. Poppler reads the numeric intervals but does not supply trustworthy food names. **0 claims** remain the correct conservative result.
- **Jamie Oliver by Tefal Dual Air Fryer EY905J manual:** **11** existing authored instruction claims retained unchanged. Its author-text-labeled tables require no icon-only visual queue.
- **All 12 prior original manufacturer PDF development documents:** exact prior claim counts unchanged; no visual slots added. The **15-document replay** is repeatable by an operator who possesses the original separately supplied PDFs, whose SHA256s are recorded. The manufacturer PDFs are **not** in either ZIP.

**Crucial interpretation:** `visualTableSlots` are *not* `claims`. They are a new optional output side-channel; `claimCount`, source-role gate, contradiction graph and scientific/ranking authorization are unaffected. There is no authoritative field or inferred text for the icon. `association = unresolved_icon_or_column_heading`, `sourceRole = manufacturer_layout_candidate_not_test`, and `rankingAuthorized = false` are fixed by both the Python producer and a narrow TypeScript validation contract.

## Implementation and security

- `document_intake/phase228_extract.py`: use existing transient `pdftotext -layout` reading to select candidate English page-local contexts, then run bounded Poppler XHTML geometrical extraction for those pages only. Select either multiple `N min M s` cells beside author-authored `Program ... length` rows or multiple `N–M min` values with a printed `Depending on thickness` qualifier. Reject invalid seconds/units and missing context. Do **not** infer food or programme names from pixels.
- XML: Poppler may emit PDF-specific invalid control characters in its XHTML coordinate listing. Strip only XML-illegal ASCII controls before standard-library XML parse; cap output size and execution time and bound coordinates, page number, quantities and result count. The PDF stays in volatile process memory, without original text or raster storage.
- `src/phase228_document_observer.ts`: optional `VisualTableSlot240` and strict input checks on shape, pagination, coordinates, duration range, immutable 'unresolved' assignment and non-ranking source role. Results pass through `DocumentReceipt228` for the existing HTTPS/robots-gated discovery pipeline. Receipts without actual claims retain `needs_review`, **not** `parsed_unverified` scientific status.
- **No extra production npm dependencies, Python dependencies, model weights or OCR.** ReportLab creates *fictional fixtures only* and is not a PEE deployment requirement.

This is **not** computer vision. Icon semantics, illustrated thermostat settings, programme/food association and exact SKU entitlement require a future verified visual model, trustworthy explicit text links, or a human checking the rendered page; until then, no attribution.

## Evaluation boundaries

- Six new targeted TypeScript tests using four fictional PDF fixtures: programming-style duration slots, illustrated food-time ranges, no-heading negative, invalid-seconds negative, rank/evidence isolation and deterministic replay. **6/6 passed**.
- Cumulative TypeScript regression: **4,181 passed**, zero failed, **18 groups** (16 regular + two older slow suites Phase91/92). Includes previous 4,175 tests; all group logs in `docs/phase240/test-logs` and summary `docs/phase240/PHASE240-TEST-RESULTS.json`.
- Real replay across all fifteen previously supplied originals: **every prior claim count unchanged**, 13+13 new *unassigned* numeric slots. These same documents have already influenced development; they are **developer samples and cannot be reported as unseen holdout validation**.
- Entire separate Python test corpus **not rerun**. No additional original unseen documents were supplied after freezing Phase239; **no new independently preregistered unseen evaluation** was achieved. Network configuration for actual PEE runtime web acquisition was not proven.
- Current reader considers first **24 physical pages**. Original downloaded/manufacturer documents not redistributed. Mixed-language programme tables and OCR remain unresolved.

## What comes next (Phase 241)

1. **Image-to-text association evaluation:** create human-annotated or externally independently checked labelled icon alignment on brand- and category-diverse held-out tables; compare false *assignment* rate, not just count of numbers. An icon association must require explicit grounded geometry, provenance and independent validation before claim promotion.
2. Hold out new genuinely unseen original PDFs and preregister target and negative cases **before** changing extraction rules, and report denominators and selection bias.
3. Verify version-, geography-, device component- and market-aware cross-document contradictions, without globally merging publisher claims with independent performance tests.
4. Test the real standalone PEE HTTPS/robots-aware acquisition path; ChatGPT browsing is separate. Continue practical offline development in the absence of internet access for the runtime.

## Reproducible instructions

From the unpacked full ZIP on a machine with Node 20+, TypeScript, Python 3 and Poppler: `npm run build`, `npm run test:phase240`. The new developer-only audit script `node scripts/phase240_replay_original_pdfs.mjs` additionally requires the original 15 manufacturer PDF filenames mounted in `/mnt/data/` and the previous Phase239 replay there. It does not redistribute them. All 4 synthetic PDFs are included. No demand is placed on the user to execute these commands.

## Public engineering references

- Poppler, the actual geometry-producing utility: https://poppler.freedesktop.org/
- `pdfplumber` and its table/geometry design, studied previously, **not** a new dependency: https://github.com/jsvine/pdfplumber
- W3C Techniques for accessible header association in structured HTML tables, distinct from unstructured PDF artwork: https://www.w3.org/WAI/tutorials/tables/

These are algorithm/protocol references, **not** external proof of commercial-product specifications or PDF interpretation accuracy.
