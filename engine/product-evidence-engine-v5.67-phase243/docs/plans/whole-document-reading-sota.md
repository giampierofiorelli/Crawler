# Whole-document reading: state of the art and what PEE takes from it (2026-10-18)

Owner brief (2026-10-18, Italian):
- read the whole document;
- quantitative and qualitative evidence, wherever it sits, uses the same scientific knowledge and the same attribution
  and reasoning rules.

This note records what the literature and practice offer, and what fits PEE's constraints:
- no heavy dependencies;
- no paid services;
- no external AI;
- every conclusion explainable.

It is a reading note. The restriction audit is in `docs/plans/restriction-audit.md`; the design and results are in
`docs/plans/whole-document-reading.md`.

## 1. Where product evidence sits on a page

| Location | Typical content | Reading technique in the literature | Fits PEE? |
|---|---|---|---|
| HTML tables | spec sheets, test grids | table-type detection and header/role inference (Wang & Hu 2002; Crestan & Pantel 2011 web-table taxonomy; TabEL; TURL) | already: 1F acquisition, 1G interpreter |
| Definition lists, key-value `div` grids, spec cards | spec sheets in retailer and maker templates | attribute-value extraction from repeated DOM structure (Ghani, Probst et al. 2006–07; Google "scalable attribute-value extraction" 2009; wrapper induction: Kushmerick 1997, RoadRunner 2001; MDR/DEPTA 2003–05 for repeated records) | yes: structural, rule-based, explainable. Phase245 already reads `dl` and div grids, for declarations only |
| Lists and record lists (`li`, repeated cards) | roundups, product cards, pros and cons | record segmentation by repeated sub-trees (MDR, DEPTA); PLAtE list-page dataset (Amazon, 2022) | yes: repeated-subtree detection is small |
| Prose (`p`, `figcaption`, `blockquote`) | test results stated in sentences, qualitative judgements | measurement extraction as n-ary relations of quantity, unit, measured entity, property and qualifiers (MeasEval, SemEval-2021 Task 8; Harper et al. 2021); measurement extraction across sources (arXiv 2308.02951); open IE | yes, as rules over sentences with the existing knowledge; no model |
| Embedded structured data: JSON-LD, microdata, RDFa | name, brand, GTIN, offers; sometimes `additionalProperty` / `PropertyValue` specs; review pages often repeat the article body | schema.org parsing | yes; already read for names and (Phase245) declarations |
| Hydration payloads of client-rendered pages: `__NEXT_DATA__`, Next.js `self.__next_f` flight data, `window.__INITIAL_STATE__`, site configuration objects | the spec sheet the browser later renders | practice: read the JSON the page ships; render with a headless browser only as a last resort | yes: plain parsing, no browser. Chromium is available as an oracle check only |
| Images and PDFs (energy labels, spec sheets) | label values | OCR, PDF text | not now (heavy) |

## 2. Model families, and why PEE does not adopt them now

- **Markup language models** (MarkupLM 2022, DOM-LM 2022, WebFormer 2022).
  - They are pre-trained transformers over text plus XPath, strong on closed-attribute extraction with training data.
  - They need heavy inference, a model download and labelled data, and their decisions cannot be explained rule by
    rule.
  - Excluded by the "no heavy dependencies" rule; kept as a later comparison point.
- **LLM extraction** (NEXT-EVAL, arXiv 2505.17125). Flat JSON records with XPath keys work best as LLM input.
  - The lesson for PEE is about representation: give each text segment its locator and keep the record flat.
  - PEE has no LLM in its runtime: Claude is the development agent, not a component.
- **Boilerplate removal** (Boilerpipe 2010, Readability, Trafilatura 2021). Content blocks are selected by text and
  link density.
  - Useful as a *signal*: navigation, related-product carousels and footers are not evidence about the page's subject.
  - Never as a hard filter that drops text unseen.

## 3. Principles PEE takes

1. **One segment model for every location.** Every piece of text becomes a segment with:
   - its text and locator;
   - its structural role: cell, key-value pair, list item, sentence or embedded field;
   - its section path;
   - the products it names.

   Quantities and qualitative statements are read from segments by the same knowledge.
2. **Structure gives roles; prose needs relations.**
   - In a table or key-value pair, the key is the label and the structure gives the record.
   - In prose, the label, the product and the conditions must be found in the sentence: MeasEval's measured entity,
     property and qualifiers.
   - This is where coverage is lost today. Of the quantities found in paragraphs and lists of the 69 development pages,
     about 95% get a kind from the unit and the knowledge, but fewer than 8% get a metric.
3. **The record, not the metric, carries the conditions** (P1, from KV). This holds in every location: a table row, a
   spec card and a sentence ("at 27 °C and 60% RH it extracted 12 L/day") are each one record.
4. **Embedded data is the page's own statement.**
   - JSON-LD and hydration payloads are what the publisher ships. They are read as segments with an `embedded` role,
     trusted neither more nor less than visible text.
   - Duplicates of visible text (JSON-LD `articleBody`) are recognised as the same statement, not counted twice.
5. **Boilerplate is a scope signal.** Text in navigation, footers and "related products" is outside the page's
   subject unless it names the subject.
6. **Every segment carries provenance** (locator and byte hash). Short attributed excerpts (proposal R2, not approved)
   could then be kept for qualitative evidence when the owner decides.

## Sources (consulted 2026-10-18 through search summaries; full texts not re-read)

- NEXT-EVAL: arXiv 2505.17125 (2025).
- MarkupLM (Li et al., ACL 2022); WebFormer (Wang et al., WWW 2022); DOM-LM (Deng et al., 2022).
- PLAtE, a large-scale dataset for list-page web extraction (Amazon, 2022).
- Probst, Ghani et al., semi-supervised attribute-value extraction (2006–07); scalable attribute-value extraction from
  semi-structured text (Google, 2009).
- MeasEval, SemEval-2021 Task 8 (Harper et al. 2021); measurement extraction across sources (arXiv 2308.02951).
- Next.js documentation on `__NEXT_DATA__` and React Server Components payloads (practice, not a paper).

Cited from established knowledge, not re-read:
- Kushmerick 1997 (wrapper induction); Crescenzi et al. 2001 (RoadRunner); Liu et al. 2003 (MDR); Zhai & Liu 2005
  (DEPTA);
- Kohlschütter et al. 2010 (Boilerpipe); Barbaresi 2021 (Trafilatura);
- Wang & Hu 2002; Crestan & Pantel 2011; TabEL; TURL.
