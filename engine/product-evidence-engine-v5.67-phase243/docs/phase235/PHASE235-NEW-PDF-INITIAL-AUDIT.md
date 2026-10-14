# Product Evidence Engine — Phase 235: first-time PDF sample audit

**Date:** 14 October 2026  
**Code tested:** unchanged PEE v5.58.0 (Phase 234) `document_intake/phase228_extract.py` from the verified cumulative archive.  
**State:** **source intake and one-time new-document baseline only; Phase 235 software development is not completed.**

## Scope and method

Five newly user-provided publisher PDFs were checked for readability and genuine new document failure modes. The annotation file `PHASE235-NEW-PDF-PREREGISTRATION.json` (29 targeted page-level anchors across the five PDFs) was created **before** executing the existing Python PDF reader. The reader was then run once without changes. Its output (structured claims, reason codes, and hashes) is preserved in `PHASE235-NEW-PDF-UNSEEN-BASELINE.json`. These anchors represent a deliberately **partial**, manually inspected selection; **29 is not the total number of true extractable specifications** in the PDFs. Therefore the 0–1 candidate counts below are not a document-level recall estimate.

No additional library or PDF bytes were added to the software package. Files are user uploads, not confirmed currently valid purchasable SKUs, independent lab tests, or live autonomous browsing evidence. **None can be used as independent performance evidence for ranking**. The one-time evaluation was out-of-development-sample for v5.58; any later tuning using these PDF outputs makes those sources development cases, not pristine future holdouts.

## Initial execution of original PEE v5.58 PDF reader

| Source, PDF pages | Candidate claims | Representative challenge and manual source anchors |
|---|---:|---|
| Lavazza Classy Pro DWC instructions (36) | 0 | p.7 water connection 15–116 psi (1–8 bar); p.9 milk tube 50 cm **with optional refrigerator**, otherwise 40 cm; usage/warranty constraints distinct from specifications |
| Tefal MultiCook Advanced 45 in 1 (33) | **1 false positive; 0 reliable** | p.12 multi-axis cooking programme table (per food, mode, time and temperature); p.14 2.5 L is a **steaming-water limit**, not unconditionally the bowl capacity; p.24 table header triggers false option label |
| Miele WWI860 WCS technical sheet (4) | 0 | p.1 material number 11359330 and nominal capacity 9 kg; p.2 49 kWh/100 cycles vs 48 L/cycle; p.3 850 × 596 × 643 mm and 2.10–2.40 kW |
| Tefal Steam Cuisine 700 CL / 1000 CL manual (8) | 0 | p.2 700 CL/1000 CL are model labels; p.5 rice bowl **on certain models only**; p.8 food cooking times are recipe guidance, not a machine performance experiment |
| Miele Professional Product Range 2021 catalogue (40) | 0 | p.10 and p.16 large multi-model specification grids: PWM 507 weight 98 kg vs PWM 507 Hygiene weight 101 kg; PDR 507 HP weight 68.5 kg vs PDR 507 weight 49 kg |

Total from the existing reader: **one candidate, incorrectly identified**. Its structured value is `availabilityKind=feature`, `optionStatus=optional`, `label='of pasta in the bowl'`, locator **page 24, line 16** of the Tefal MultiCook manual. The original page reads the split table header roughly as `Weight of pasta | Water level in the bowl | Salt (optional)`. Poppler's layout order placed `of pasta in the bowl (optional)` on the same extracted visual cell; the current `OPTIONAL_FEATURE234` pattern incorrectly elevated this fragment. **This is a confirmed wrong category attachment, not a real optional product feature.** The program did not authorize any of these claims for ranking.

## Engineering implications

1. **Table/column scope first.** Multi-model Miele grids must preserve column headers and product identifiers; weights and capacities must never be copied to adjacent models.
2. **Multi-axis tables are not single-product attributes.** Tefal program times need mode + food condition, and recipe quantities must not become nominal product capacity or measured performance.
3. **Conditional accessory logic.** Lavazza optional-fridge milk tubes, and Tefal rice bowl only on certain versions, require explicit dependency representation or abstention.
4. **Quantity semantics.** Rates and denominators (`kWh / 100 cycles`, `L / cycle`), vectors (`H × W × D`), ranges (`kW`) and units must be preserved without pretending they are comparable scalars.
5. **Table-header false-positive gate.** The Tefal false status claim is a targeted confirmed bug for regression testing.
6. **24-page reader limit.** Lavazza (36 pp), Tefal MultiCook (33 pp), Miele catalog (40 pp) have content beyond the current PDF first-24-page bound; do not claim full-document recall.
7. **Source lifecycle.** Miele catalogue published 2021 may describe superseded SKUs and promotional endurance claims; version, market and current availability require separate evidence.

## Status, release discipline

- No modifications were made to the PEE production source in this audit.
- No TypeScript regressions were executed in this audit; the prior v5.58 published test count has **not** been reasserted as a new run.
- No new PEE version or Phase 235 cumulative ZIP has been released.
- Next engineering block: first fix the verified table-header false-positive with a generalizable guard and regression; then prototype optional-dependency relations and grouped tables, compare with frozen baseline; retain independent documents for a subsequent unbiased evaluation.
