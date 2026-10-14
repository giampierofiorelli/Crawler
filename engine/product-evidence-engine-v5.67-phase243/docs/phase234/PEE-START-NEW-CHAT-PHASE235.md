# Product Evidence Engine — Continue from Phase 234 (v5.58)

Use **`product-evidence-engine-v5.58-phase234-FULL.zip`** as the canonical cumulative baseline. Read `docs/phase234/PHASE234-TECHNICAL-REPORT.md`, `PHASE234-REAL-PDF-BENCHMARK.json`, the phase 233 report and cumulative project research. Preserve original source and provenance; do not restart from an older ZIP.

Phase 234 adds narrowly-scoped **author-explicit standard/optional** categorical manufacturer leads from PDFs, preserving `scopeComponent`, page/line and file hash without promoting an accessory to the base product or a verified SKU. It omits conditionally supplied items and ambiguous lists. The Azurion in-sample PDF now yields 24 additional provisional availability leads; four earlier PDFs keep previous claim counts. No new required runtime dependencies, no web-live demonstration, no independent rankings.

Priorities for Phase 235:
1. Build test coverage for **conditional/depending-on-option** availability and nested component hierarchy, but do not misrepresent options or infer bundled SKUs. Only encode conditions that are explicitly tied to an item; unresolved cases must abstain.
2. Obtain/annotate *previously unseen* original manufacturer PDFs **before** changing algorithms. Quantify wrong-variant/component assignments separately from missing values and justified abstention.
3. Continue nuanced cross-category unit handling, table scopes and PDF/DOCX support without heavy framework integration unless a measurable benefit warrants it.
4. Validate live autonomous Internet transport of the actual PEE only when an authorized runtime with functioning DNS and search-engine connection exists. ChatGPT's web searches are not a PEE network test.

The user works from iPhone. Continue offline as feasible, with verified source code, tests and full ZIP, exact integrity/sha256, and URLs in the report. The existing five real PDFs are development samples, not held-out accuracy evidence. Do not include their bytes in the project ZIP or invent source links.
