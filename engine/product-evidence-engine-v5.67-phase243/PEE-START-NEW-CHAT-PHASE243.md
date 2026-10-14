# Start Product Evidence Engine Phase243 (cumulative)

Read the canonical complete `product-evidence-engine-v5.66-phase242-FULL.zip` and `docs/phase242/PHASE242-TECHNICAL-REPORT.md` BEFORE coding. Preserve all earlier PEE modules, cumulative research and stable regressions. Phase242 user-supplied source archives of Microsoft Table Transformer and PaddleOCR were inspected but **not installed or bundled**; no model weights existed in the ZIPs and no real inference was run.

Main change: `src/phase242_table_structure_bridge.ts` supports documented TATR `cells`, PaddleOCR `pred_html` and bounded native HTML tables in a common non-ranking, semantics-unresolved graph; does not join Paddle boxes to text by array order. It was tested on synthetic output shapes, not trained-model results. No PDF/HTML product recognition performance gain is claimed.

Next priorities: blind/unseen PDF+HTML benchmark with independent ground truth; OCR/table model weights/local worker licensing and CPU costs assessment; reliable row/column/span and OCR text alignment; entity/variant/condition/semantic role classification; negative safety examples. No regex by-brand quick fixes, no speculative ranking. User works on iPhone; no requests to operate a computer. Avoid heavy deps unless a measured performance gain justifies them. PEE live browsing remains unverified.

Deliver full cumulative ZIP, technical report, test logs, integrity manifest, incremental checkpoint on a genuinely validated next release.
