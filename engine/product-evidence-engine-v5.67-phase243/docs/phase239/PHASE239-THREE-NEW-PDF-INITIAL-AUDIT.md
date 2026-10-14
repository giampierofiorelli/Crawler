# Product Evidence Engine — Phase 239: three new PDF samples, frozen baseline

**Status:** Baseline/audit only. No modification to PEE v5.62; no Phase239 release claimed.

## Method and source custody

- Three PDFs newly provided by the user were checked locally and identified by SHA-256 in `PHASE239-THREE-NEW-PDF-PREREGISTRATION.json`.
- **Before running the baseline PEE reader**, 24 selected expected observations and 13 specific negative-assignment controls were frozen in the registration file (SHA-256 `dae1a2dcc5e692e3a2da042ea905cdecb63bdeb83895ae748b780a5ff62ac693`). These observations are deliberately **not exhaustive** ground truth for the PDFs.
- The baseline was executed using the **unmodified v5.62.0 `parseDocumentBytes228`** TypeScript build and `document_intake/phase228_extract.py`. The compiled reader, Python extractor and Phase238 discrepancy source were checked byte-for-byte against the canonical `product-evidence-engine-v5.62-phase238-FULL.zip` release.
- Local input documents and original publisher PDF bytes are **not included** in this report package, and no extracted publisher article bodies are retained. No autonomous web discovery was attempted or shown.
- The reader examines up to the first 24 physical PDF pages; the PDF's physical pages may contain two printed document pages. English is the current primary supported language.

## Results of unchanged v5.62 reader

| File | PDF pages | Document size | Parsed successfully | Structured claims | Model/variant established |
|---|---:|---:|---|---:|---|
| `EY905J_IFU_User_Manual.pdf` | 45 | 3,980,735 bytes | Yes | **0** | No |
| `IFU_User_Manual_Tefal_Dolci_Ice_Cream_Maker.pdf` | 56 | 10,327,975 bytes | Yes | **0** | No |
| `GC242D_IFU.pdf` | 8 | 1,119,679 bytes | Yes | **0** | No |

**Selected-target recall at baseline:** **0/24** preregistered positive targets automatically recovered. This is a *selected-case audit*, not a population estimate. Since the parser emits no claims, there is no observed false claim in this run; **precision is undefined**, not 100%. No manufacturer assertion is independent laboratory evidence or eligible for ranking.

## PDF 1 — Jamie Oliver by Tefal Dual Air Fryer (filename includes EY905J)

- Physical page 6 (description) identifies a **large first drawer** and a **regular second drawer**; physical page 8 limits the grill function to drawer 1, and provides a manual thermostat of **40–200°C** and a manual timer of **0–60 minutes**.
- Physical page 10 contains an image-backed cooking guide with explicit rows: frozen fries in drawer 1 at **600 g**, **15–20 min**, **180°C**, versus drawer 2 at **300 g**, **10–15 min**, **180°C**. The rows are a manufacturer *cooking guide*, not technical performance results.
- Physical page 7 requires a **15 cm clearance around the appliance** for ventilation; this MUST NOT become a product dimension.
- Physical pages 13–23 repeat information in French; later pages are German and Dutch. The same author statement translated into another language must NOT be mistaken for independent corroboration.

## PDF 2 — Moulinex/Tefal Dolci ice cream maker (filename does not establish exact commercial variant)

- Physical page 2 describes machine components, different control panel presentations, and an ice cream spoon **depending on model**. Availability must not be assigned to every retail SKU.
- Physical page 5 has six *Scoopable* programme columns and authored durations such as Sorbet **3 min 14 s** (194 s), Ice Cream **3 min 16 s** (196 s), and Gelato **3 min 45 s** (225 s). The page is a **two-printed-page spread** inside one physical PDF page; icons and asterisks are important.
- Physical page 6 has *Drinkable* programmes and *Extra* operations, with a Mix-in option that is restricted to an earlier Scoopable programme. The **50 g** cited for mix-ins is an *ingredient quantity limit*, not bowl capacity.
- Physical page 7 recommends the **external freezer** set between **−22°C and −13°C** for frozen preparations. This is NOT an internal cooling capability or the machine's temperature setting.
- The manual contains multilingual repetitions; do not count translations as independent sources.

## PDF 3 — Tefal Inicio Grill Adjust (filename includes GC242D)

- Physical pages 3–5 are mostly pictograms. Page 3 illustrates **5–10 min preheating**, page 4 indicates **2 h cooling**, and page 5 has a cooking guide where food identities, thermostat settings and durations are principally linked by images.
- Physical page 5 includes **5–11 min** and other ranges, with a footnote stating that timings depend on food thickness. Plain extracted text lacks a reliable food-to-row assignment; it would be wrong to invent one.
- Physical pages 6–8 contain worldwide guarantee contact details, **not product specifications**. Page 7's raw extracted text is visibly overlapped and cannot be treated as a reliable structured source.

## Optional post-baseline geometry diagnostic (NOT a PEE feature)

A local `pdfplumber` exploratory pass was run **after baseline capture**, without changing production dependencies or code:

| Document/page | Observed `pdfplumber` output | Conservative conclusion |
|---|---|---|
| Dual Air Fryer, PDF p.10 | One 14-row × 3-column grid, with row 1 headings *Manual programme / Min-max / Temperature* and rows distinguishing drawers | Promising direct candidate for a strict grid-to-scoped tuple reader |
| Dolci, PDF p.5 | A 5-row × 7-column main programme table; names are encoded largely as icon headings, durations survive in six columns | Geometry is feasible, but programme-name/image associations and *depending on model* must be validated |
| Inicio Grill, PDF p.5 | A partly empty 12-row × 5-column grid, with durations in text but food identities supplied as pictograms | No safe food assignment without image-based/table-symbol interpretation; abstention appropriate |

Diagnostics are recorded in `PHASE239-PDFPLUMBER-DIAGNOSTIC.json`. Seeing a table is **not** the same as having established the semantic association of its cells. `pdfplumber` is a development diagnostic here, **not a required PEE production dependency**.

## Recommended engineering next step

1. Implement a strict **original PDF grid parser** for manufacturer cooking-guide tuples (food, drawer/component, food load, duration range, temperature), retaining page and geometrical provenance, with explicit source role `manufacturer_cooking_guide_not_test`. Require populated row labels and unambiguous headings; fail closed otherwise.
2. Add a separately typed **manufacturer programme-duration schema** supporting `minutes + seconds` with model-dependent availability qualifiers, icon/heading uncertainty, and preparation preconditions; prevent equation with test results.
3. Handle image-dependent manuals via an optional visual/manual-review fallback, **not guessed assignments**. Explicitly exclude service telephone tables and graphical instructions with unreadable icons from technical claims.
4. Add fresh unseen PDFs only for a future sealed holdout. **Once the Phase239 engineering process uses these PDFs for tuning, they cease being independent unseen evaluation documents.**
5. Preserve exact product model ambiguity from filenames; do not link to a marketplace SKU until externally confirmed. Carry edition, market, language and document SHA in eventual cross-document discrepancy comparisons.

## Baseline limits

- The entire 56-page multilingual manual was not semantically extracted; the reader scans only 24 physical pages. This is enough to cover the English programme tables in this manual, but not the full translated text.
- The baseline cannot measure retrieval from URLs or actual live crawler performance; PDF bytes were locally supplied.
- No general model precision, recall, ranking quality, OCR capability, or commercial model identity can be inferred from these three PDFs.
- Do not treat `GC242D`/`EY905J` inferred from filenames as source-verified product models.
