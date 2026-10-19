# B — Measurement / quantity extraction from text and tables, and domain transfer

Research for PEE S87c. Prepared 2026-10-19. Every claim cites a URL.
- **verified (read)**: I opened the page or PDF and read the passage.
- **not verified (snippet)**: the claim rests on a search-result snippet only.

Quotations are kept short.

---

## 0. Bottom line for PEE

1. **The hard part is context, and nobody has solved it.**
   - **MeasEval** is the reference benchmark for exactly PEE's tuple: Quantity / Unit / Modifier / MeasuredEntity / MeasuredProperty / Qualifier.
   - Quantity extraction is easy: the best system scores 0.861 F1-overlap, and even a spaCy baseline scores 0.827.
   - **Qualifier** (= PEE "conditions") is the worst component:
     - best F1 0.163; only 7 of 19 teams attempted it;
     - the Qualifies relation reaches only 0.092;
     - human Krippendorff α is 0.334.
   - A 2026 7B model trained with RL still reaches only F1 0.170 on qualifiers.
   - So PEE's 79% condition typing on unseen categories is not behind the state of the art. The remaining failures are the known-hard residue.
2. **What generalises is structure; what does not is domain vocabulary.**
   - Generalises: value/unit grammar, modifiers (range, approximate, mean, tolerance), and table cell roles. AxCell's table-cell segmentation keeps 77–93 F1 on held-out *tasks*.
   - Does not generalise: entity/property/condition lexemes. Every system that works across domains keeps those as *data*:
     - ChemDataExtractor 2 model classes;
     - quantulum3 and CQE unit/entity JSON;
     - the Equity quantity KB;
     - AxCell's curated leaderboard lists, which beat bag-of-phrases on linking.
3. **Declarative definitions work, within limits.**
   - ChemDataExtractor 2.0 adds a property as a *model declaration*: a typed quantity class, a specifier grammar, and nested condition models with `required` / `contextual` / `binding` flags. Sentence and table parsers are then generated automatically.
   - A condition such as "altitude" from another sentence or paragraph is merged into the record by document-level "interdependency resolution".
   - This is the closest published precedent for "new property as data, not code". **It still needs a hand-written specifier pattern per property.** That pattern is exactly the domain-vocabulary layer PEE lacks for "peak HDR", "10% window" and "small drawer".
4. **Implicit basis and units.**
   - No benchmark evaluates "per cycle / per programme run" basis as a field.
   - The evidence that does exist:
     - units and conditions often live *outside* the value: in a column header, caption or footnote, or in a different sentence;
     - Equity searches cell → column header → table context;
     - CDE merges document-level context;
     - Hira et al. count conditions and units in captions/footers.
   - Treat basis as a first-class condition slot. Resolve it by a context cascade plus category knowledge, never by surface regex alone.
5. **LLMs have not yet beaten tuned specialised systems on the full tuple, and they hallucinate units.**
   - Few-shot GPT-4-class models roughly match grobid-quantities on quantities: about 59–62 vs 59 F1 on MeasEval.
   - Gemini-2.5-Pro reached 0.440 overall MeasEval, below the 2021 winner's 0.519.
   - Unit conversion is the hardest normalisation step for GPT-4 on product data.
   - For PEE (offline, no paid services) an LLM is at most an *annotation and adjudication aid*, not a runtime component.

---

## 1. SemEval-2021 Task 8 — MeasEval

**Sources**
- Task paper, Harper et al. 2021: https://aclanthology.org/2021.semeval-1.38.pdf — verified (read, full text).
- Repository: https://github.com/harperco/MeasEval — verified (read).
- Annotation guidelines: https://raw.githubusercontent.com/harperco/MeasEval/main/annotationGuidelines/README.md — verified (read).

### What it extracts and how it is represented

**Spans and attributes:**
- **Quantity**: a count or a measurement (value + unit). It is kept as a string: "Quantities are treated as strings, and are not converted or normalized."
- **Unit**: a sub-span of the Quantity.
- **Modifiers**: IsApproximate, IsCount, IsRange, IsList, IsMean, IsMedian, IsMeanHasSD, IsMeanHasTolerance, IsRangeHasTolerance, HasTolerance (guidelines).
- **MeasuredEntity** and optional **MeasuredProperty**.
- **Qualifier**: "additional related context to either validate or understand each identified Quantity".

**Relations:**
- **HasQuantity**: Property→Quantity, or Entity→Quantity when there is no property.
- **HasProperty**: Entity→Property.
- **Qualifies**: Qualifier→any span. Relations may cross sentences inside the paragraph.

**Qualifier examples in the guidelines:**
- time ("during one solar rotation");
- condition ("after I drank half the can");
- location;
- method or basis ("estimated", instrument or standard);
- statistic ("median");
- process.

The guidelines also say: "Apply annotations liberally, but use Qualifiers sparingly". This is a deliberate precision bias.

**Guideline rules relevant to PEE:**
- A modifier word adjacent to the Quantity goes into the Quantity span. Otherwise it becomes a Qualifier.
- "Respectively" lists are split per target.
- Conditions such as temperature or duration with no explicit property attach to the entity directly.
- A quantity used as a *name* (e.g. a size fraction) is annotated as an Entity/Quantity pair.
  - Analogue for PEE: "10% window" or "small drawer" are *test-configuration names*, not measured results.

### Data and evaluation

- **Corpus:** 110 CC-BY articles from 10 subject areas; 428 paragraphs; 1,663 quantities.
  - Train: 1,164 quantities (313 paragraphs). Eval: 499 quantities (135 paragraphs).
  - Data licence: CC-BY (repository README).
- **Metric:** SQuAD-style token-overlap F1, averaged over 9 components.
  - Quantities are first "pinned" to gold quantities, so an entity linked to the wrong quantity earns nothing.
  - Missing or spurious items become zero "penalty rows".
- **Inter-annotator agreement (Krippendorff α):**

| Component | α |
|---|---|
| Quantity | 0.943 |
| Unit | 0.866 |
| MeasuredProperty | 0.641 |
| MeasuredEntity | 0.546 |
| Qualifier | **0.334** |

### Results (Table 2/3 of the task paper)

**Winner, LIORI (overall 0.519):**

| Component | F1 |
|---|---|
| Quantity | 0.861 |
| Unit | 0.722 |
| Modifier | 0.642 |
| MeasuredEntity | 0.437 |
| MeasuredProperty | 0.467 |
| **Qualifier** | **0.163** |
| HasQuantity | 0.482 |
| HasProperty | 0.318 |
| **Qualifies** | **0.092** |

**spaCy baseline (overall 0.239):**

| Component | F1 |
|---|---|
| Quantity | 0.827 |
| Unit | 0.561 |
| Qualifier | 0.005 |

**Notes on the results:**
- "only 7 teams attempted extraction of Qualifiers and the Qualifies relation, as these were the most difficult aspects of the task."
- Conclusion: "The challenge of context is especially pronounced in the Qualifier span and Qualifies relationship."
- **Erratum I found:** the task paper's Table 2 row for Counts@IITK is shifted one column. It shows "Qualifier 0.614", but the team's own paper gives Modifier 0.614 and Qualifier **0.077**. https://aclanthology.org/2021.semeval-1.175.pdf — verified (read).
  - So **0.163 is the best 2021 Qualifier F1.**
- Counts@IITK error analysis: relations were sought "only within a sentence"; the model "didn't work well on MeasuredProperty and Qualifiers" (same URL, verified).
- **Methods:** almost all systems used BERT-family pipelines: quantity first, then multi-task tagging of entity/property/qualifier conditioned on the quantity span. Units and modifiers came from rules, dictionaries or char-BiLSTMs (task paper, Table 5).
- **Multiple-hypotheses remark:** the organisers suggest disagreements "are not automatically right or wrong". Different context interpretations may suit different applications (§6.2).

### Later results on MeasEval

**GPT-3 few-shot** (Kohler & Daniel 2021): https://arxiv.org/abs/2106.14720
- verified (read, abstract): "we have not been successful in that effort".
- Overall 0.226, 18th of 20 — not verified (snippet).

**Foppiano et al. 2024**, LLM evaluation on materials text: https://arxiv.org/html/2401.11052 — verified (read). Property/quantity NER on MeasEval, soft-match F1:

| System | F1 |
|---|---|
| grobid-quantities | ~59 |
| GPT-4 zero-shot | 59.51 |
| GPT-4-Turbo few-shot | 62.35 |
| fine-tuned GPT-3.5 | 59.61 |

- Hints from small models "may introduce bias".
- LLMs are sensitive to entity order.
- "specialised models are currently a better choice for tasks requiring extracting complex domain-specific entities".

**MeasHalu** (Huang et al., arXiv 2604.16929, April 2026): https://arxiv.org/html/2604.16929v1 — verified (read, first 100k chars).
- Method: Qwen2.5 0.5–7B with SFT + GRPO.
- MeasHalu-7B overall 0.512, vs LIORI 0.519; Gemini-2.5-Pro prompted 0.440.
- Qualifier "remains low" (F1 = 0.170); 0.315 under relaxed matching.
- Hallucination taxonomy: quantity fabrication / out-of-scope / misclassification; relation misclassification / inference bias / role definition (entity↔property inversion).

### Lessons for PEE

**Adopt the MeasEval schema as the internal record shape:**
- Quantity (value + unit + modifiers) → Property → Entity, with Qualifier spans attached by relation.
- Add PEE's typed qualifier *roles* (setting, distance, programme, temperature, instrument, method, sample, **basis**). MeasEval leaves qualifiers untyped. PEE's typing is an *extension*, and a reason MeasEval numbers are not directly comparable.

**Adopt its evaluation protocol:**
- pin quantities to gold first;
- score each component separately, plus relations;
- report exact and overlap scores;
- penalise unmatched gold and spurious items;
- publish IAA per component, so a Qualifier ceiling of α ≈ 0.33 frames expectations.

**Copy the precision bias** ("use Qualifiers sparingly"): an abstained condition beats a wrong one.

---

## 2. Rule/statistical quantity extractors

### 2.1 grobid-quantities (Foppiano et al.)

**Sources**
- https://github.com/lfoppiano/grobid-quantities — verified (read).
- Introduction: https://grobid-quantities.readthedocs.io/en/latest/introduction/ — verified (read).
- Evaluation: https://grobid-quantities.readthedocs.io/en/latest/evaluation-scores/ — verified (read).
- Paper (DocEng 2019): https://hal.inria.fr/hal-02294424 — cited from the references page https://grobid-quantities.readthedocs.io/en/latest/references/ (verified that it is listed; PDF not read).

**What it extracts and how:**
- Atomic values, intervals/ranges ("from 3 to 5 km", "100 +- 4") and lists.
- Units are decomposed (prefix / base / power) and normalised to SI with the Java Units of Measurement library.
- A "quantified substance" module is "still *experimental*".
- Cascade of models (quantities → units → values) using CRF, BidLSTM-CRF or SciBERT-CRF.

**Scores:**
- Quantities NER holdout (10 articles, 1,404 entities): CRF 76.50; BidLSTM-CRF 81.70; BERT-CRF 85.22 micro-F1.
- Unit segmentation (UNISCOR, 6,288 labels): CRF **80.76** beats BERT-CRF 74.41. Character-level unit grammar suits small linear models.
- End-to-end on MeasEval: quantities 57.52 strict / 70.23 soft. Quantified substance only **11.71 strict / 20.89 soft**. The entity link is the weak point here too.

**Licences:** code Apache-2.0; annotated data CC-BY 4.0; docs CC0 (README).

**Lessons for PEE:**
- PEE's value/unit layer should be a small grammar plus unit lexicon (UNISCOR-style prefix/base/power). It does not need a neural model: CRF and grammar beat BERT on units.
- The UNISCOR unit corpus (https://github.com/lfoppiano/grobid-quantities/tree/master/resources/dataset/units/evaluation, listed on the references page) could become a regression set for PEE's unit parser. Check its licence first.

### 2.2 Quantulum3

**Source:** https://github.com/nielstron/quantulum3 — verified (read).

**What it extracts:**
- value, unit, entity (dimension), uncertainty (±), ranges, and spelled-out numbers;
- a unit dictionary of "more than 290 units and 75 entities".

**Method:**
- An optional classifier (Wikipedia text + GloVe) disambiguates ambiguous surfaces, e.g. "pound" as currency vs mass.
- Extension is pure data: `load_custom_units` / `load_custom_entities` JSON with surfaces, entity, URI, dimensions, symbols and prefixes.
- Language support goes in a `_lang` folder.

**Licence:** MIT.

**Weaknesses** (per the CQE evaluation below):
- misses noun base units;
- over-generalises tokens to units ("at" read as percent per ampere-turn).

### 2.3 CQE — Comprehensive Quantity Extractor (Almasian et al., EMNLP 2023)

**Sources**
- Paper: https://aclanthology.org/2023.emnlp-main.793.pdf — verified (read, full text).
- Repository: https://github.com/vivkaz/CQE — verified (read).

**What it extracts:**
- value, unit, **change** (direction: rise/fall/=) and **concept** (what the quantity is about ≈ MeasuredEntity/Property).

**Method:**
- spaCy dependency parse + POS + 61 rules (e.g. NOUN_NUM, LONELY_NUM).
- Unit dictionary of 531 units, merged from quantulum3, Wikipedia Convert, Microsoft Recognizers-Text and UCUM.
- BERT classifiers for 18 ambiguous unit surfaces, trained on ChatGPT-generated sentences.

**Benchmark:** NewsQuant (news, over 900 quantities, includes negative examples).

**Results (NewsQuant):**

| System | Value F1 | Value+Unit F1 | Concept F1 (relaxed) | Concept F1 (strict) |
|---|---|---|---|---|
| CQE | 92.0 | 85.6 | 76.1 | 57.0 |
| Quantulum3 | 73.0 | 47.2 | – | – |
| grobid-quantities | 55.8 | 35.5 | – | – |
| GPT-3 few-shot | 70.6 | 59.1 | 54.8 | 25.7 |

- GPT-3 suffered "extreme hallucination": extracted values "were not actual numbers and units were not normalized".
- Concept is "implicit" in many cases.
- Limitations section: "still mainly a rule-based approach, requiring manual feature engineering and rule-writing for unseen cases". Rule order decides the concept, and parser errors propagate.

**Licence:** GPL-3.0 (repository). Incompatible with copying code into a permissively licensed project. Ideas and the unit list's *sources* (UCUM etc.) are fine.

**Lessons for PEE:**
- Strict vs relaxed span scoring of the "concept" differs by about 20 points. Report both.
- A change/direction slot ("dropped to", "up from") matters for review prose.
- A unit lexicon merged from public sources, with explicit surfaces/symbols/prefixes and dimension, is the reusable core.

### 2.4 LLM-based quantity/attribute extraction (2023–2026)

**Brinkmann, Baumann & Bizer 2024**, product attribute extraction *and normalisation* (WDC-PAVE: 565 offers, 59 sites, 5 categories): https://arxiv.org/html/2403.02130 — verified (read).
- GPT-4 extraction F1 ≈ 90.5–91.3; PLM baseline AVEQA 80.83.
- Unit conversion is "the most challenging operation for GPT-3.5 and GPT-4". With normalisation it reaches 83.5%, and it improves when extraction and conversion are separated.
- Cost: about $3.5–4.6 per 1,000 values for GPT-4.
- No cross-category transfer evaluated.
- *Lesson:* never let a generative model convert units. Extract the surface and convert deterministically.

**ChatExtract** (Polak & Morgan, Nat. Commun. 2024): https://arxiv.org/pdf/2303.05352 — verified (read).
- Zero-shot conversational extraction of Material–Value–Unit with redundant "uncertainty-inducing" follow-up questions.
- GPT-4: P 90.8 / R 87.7 on bulk modulus. Without follow-ups, overall precision falls to 42.7%.
- Recall on multi-valued sentences is 82.7%, vs 100% on single-valued.
- LLaMA2-chat 70B: about 61.5 / 62.9.
- On conditions, the authors say generalising to "multiplets" (e.g. a temperature) is "formally straightforward" but "we have made no assessment of their accuracy".
- *Lesson:* split single- vs multi-valued sentences. Verification questions buy precision. Conditions remain unevaluated even in strong LLM pipelines.

**MOF synthesis-condition extraction** (Shi et al. 2024): https://arxiv.org/html/2408.04665v2 — verified (read, first 100k chars).
- 10 condition fields: precursor and amount, linker, solvent, modulator, time, temperature.
- Macro-F1 zero-shot 0.77 vs few-shot 0.94 (average of 3 datasets). BM25-retrieved demonstrations (K = 4) were best.
- Zero-shot errors: role confusion (modulator vs solvent) and dropping a second unit ("30mg" but not "0.1mmol").
- *Lesson:* domain demonstrations retrieved by lexical similarity are what fixes role typing. This is the LLM analogue of PEE needing category vocabulary.

**Dunn/Dagdelen et al.**, fine-tuned GPT-3 seq2seq joint NER+RE with JSON outputs, about 500 examples: https://arxiv.org/abs/2212.05238 — verified (read, abstract only; scores not read).

---

## 3. ChemDataExtractor (v1, v2) and TableDataExtractor

### 3.1 ChemDataExtractor 1.0 (Swain & Cole, JCIM 2016)

**Source:** https://www.repository.cam.ac.uk/bitstream/1810/266462/1/chemdataextractor.pdf — verified (read).

**Method:**
- CRF POS tagger and CRF chemical NER.
- "multiple, more specialized grammars", rather than one universal grammar like ChemicalTagger.
- Table parser: table cells are tokenised separately and header-type classification picks the cell grammar.

**Document-level "interdependency resolution":** records from each heading, paragraph, caption and table are merged by entity. Abbreviations are resolved with Hearst–Schwartz. A sentence with only context ("a temperature, solvent or apparatus") "is merged into all other records for all spectra or properties of that type".

**Evaluation:** 50 open-access articles. A record counts as a true positive "only if it is exactly correct". Record-level F1:

| Record type | F1 |
|---|---|
| Identifiers | 93.4 |
| Spectra | 86.8 |
| Properties | 91.5 |

**Licence:** MIT.

### 3.2 ChemDataExtractor 2.0 (Mavračić, Court, Isazawa, Elliott & Cole, JCIM 2021, doi:10.1021/acs.jcim.1c00446)

**Paper:**
- The publisher page returned HTTP 403, so I did not read it.
- Abstract-level facts via search snippets — not verified (snippet): "autopopulated ontologies"; nested models; a crystallographic hierarchy of 18 interrelated submodels; overall precision 92.2% across 26 journals.

**Model-definition mechanism** (docs, verified (read)): https://cambridgemolecularengineering-chemdataextractor-development.readthedocs-hosted.com/en/latest/introduction/new_property.html

```python
class Altitude(LengthModel):
    specifier = StringType(parse_expression=I('Altitude'), required=True)
    compound = ModelType(Compound)
class BoilingPoint(TemperatureModel):
    specifier = StringType(parse_expression=(I('Boiling') + I('Point')).add_action(join), required=True)
    compound = ModelType(Compound, binding=True)
    altitude = ModelType(Altitude, contextual=True)
```

- **Quantity type:** the property inherits value/units fields from a dimension template (TemperatureModel, LengthModel).
- **`specifier`:** the phrase that must appear. With `required=True`, "any records without a specifier will be discarded".
- **`contextual=True`:** the nested condition (altitude), "which may be found in a different sentence or even a different paragraph", is merged in automatically.
- **`binding=True`:** keeps the nested condition tied to the same compound.
- **Generated parsers:** declaring the model generates sentence parsers (QuantityModelTemplateParser, MultiQuantityModelTemplateParser) and `AutoTableParser`. Nested models are discovered automatically.
- **Table precision:** the docs say automatic table parsing "can often" reach above 90% precision with suitable settings.
- **Custom parsers:** hand-written grammar parsers remain an option for higher precision.

**Units as data/code:** https://…/en/latest/examples/creating_units.html — verified (read).
- A `Dimension` subclass has optional `constituent_dimensions` (Speed = Length/Time).
- A `Unit` subclass has four conversion methods.
- `units_dict` maps regexes to units.

**InferredProperty:** https://…/en/latest/examples/inferred_property.html — verified (read).
- A derived field declared with `origin_field` and an `inferrer` function. Example: `value` is inferred from `raw_value`, `units` from `raw_units`.
- This is a clean hook for *normalisation and basis derivation* without parser code.

**Licence and related tools:** https://…/en/latest/license.html — verified (read).
- MIT for v1 and v2.
- Snowball semi-supervised relation extraction (Court & Cole, Sci. Data 2018) learns new property phrasings from seeds. Only the citation was read; method not verified.

### 3.3 TableDataExtractor

**Source:** https://cambridgemolecularengineering-tabledataextractor.readthedocs-hosted.com/en/latest/features.html — verified (read).
- Input-format-independent (HTML, CSV, list).
- MIPS (Minimum Indexing Point Search, Embley et al.) finds the header and data regions. It "relies on duplicate entries in the header regions".
- Labels each cell as Data / Row Header / Column Header / Stub Header / Title / footnote.
- Duplicates spanning cells, copies footnote text "into the appropriate cells where the footnotes have been referenced", and splits subtables.
- Outputs a **category table**: each data cell paired with its row and column header paths.
- MIT licence (search snippet — not verified (snippet)).
- No evaluation figures on the features page.

### Does "model definition as data" generalise to new properties?

**Partly.**
- The *schema* (quantity type + nested conditions + flags) and the parsers are generic. Adding a property means adding a declaration, not a parser.
- **But the `specifier` parse expression is a hand-written lexical pattern per property.** Conditions also need their own models with specifiers.
- CDE therefore moves domain knowledge out of procedural code into declarative lexical knowledge. It does not remove the need for that knowledge.

**For PEE this maps cleanly onto the knowledge store:**
- a **property definition row**: property id, dimension, accepted units, specifier lexemes/patterns, plausible range;
- **condition definition rows**: role, dimension or enumerated values, specifier lexemes, `contextual` (may come from elsewhere in the page), `binding` (must share the product);
- an **inferred basis** rule: the default basis of a property per category, e.g. "energy per programme run" for dishwasher programme energy unless "per year" or "annual" is present.

New categories would then be added as rows, as in CDE, and the 79% structural classifier would supply the category-free part.

---

## 4. Scientific result extraction from tables and text

### 4.1 SciREX (Jain et al., ACL 2020)

**Source:** https://aclanthology.org/2020.acl-main.670.pdf — verified (read).
- Document-level 4-ary relations (Dataset, Metric, Task, Method) over 438 papers.
- 99% of 4-ary relations cross sentences; 55% cross sections.
- **The metric *value* is not extracted, and tables were excluded**: text was taken "with no figures / tables / equations".

**Results:**

| Setting | F1 |
|---|---|
| Component-wise, gold input, 4-ary relations | 0.611 |
| End-to-end, predicted input | **0.008** |
| End-to-end with gold salient clusters | 0.268 |

- "the accumulation of errors in previous steps"; salient-entity identification is "the most problematic step".

**Lesson:** report component-wise (gold-input) *and* end-to-end scores. Pipelines compound errors severely.

### 4.2 AxCell (Kardas et al., EMNLP 2020)

**Source:** https://aclanthology.org/2020.emnlp-main.692.pdf — verified (read).

**Results tuple** (task, dataset, metric, value) from LaTeX tables:
1. table-type classification (leaderboard / ablation / irrelevant);
2. **semantic segmentation of cells** (dataset, metric, paper model, competing model, other) using the cell text plus the paper context where the cell is mentioned;
3. linking to a taxonomy of 3,445 leaderboards.

**Cross-domain evidence** (Table 3): cell segmentation trained leave-one-task-out keeps test micro-F1 between 77.1 (image generation, speech recognition) and 92.9 (semantic segmentation) on unseen ML tasks.

**Full-tuple results:** TDMS F1 28.7 micro, vs 56.1 for TDM without the score. "to get the score right, the model needs to correctly predict the table, column and row … Additionally, the extracted value needs to be normalized."

**Linking** (Table 4): curated lists of names and aliases beat bag-of-phrases. Top-1 TDMS: 76 vs 42 (speech recognition), 77 vs 49 (semantic segmentation). Abbreviations alone help less, and adding them to curated lists *adds* false positives.

**Lessons for PEE:**
- (a) Classifying cell *roles* structurally transfers across domains. This matches PEE's 79% structural classifier.
- (b) Linking to properties needs a curated alias list per category: domain vocabulary as data.
- (c) The value cell's row and column headers are the condition carriers.

### 4.3 Materials tables: conditions and implicit units

**Hira et al.**, "Reconstructing the materials tetrahedron" (Digital Discovery 2024; arXiv 2310.08383): https://arxiv.org/html/2310.08383v3 — verified (read). The RSC page returned 403.

From 100 property tables:
- **9%** report the *same property under different conditions* (refractive index at different wavelengths, Tg at heating rates, hardness at loads).
- **30%** need abbreviations or units from the caption or footer.
- **2%** give no units in the table, only in the caption or footer.
- About 2% repeat a value in two units.
- "Processing and testing conditions are mostly reported in the text."

From text:
- **39.53%** of compositions had no explicit unit.

From 2,536 papers:
- 7.37% needed inter-table linking via sample IDs.

**Circi et al.**, "Extracting Materials Science Data from Scientific Tables" (polymer composites, GPT-4 / GPT-4V): https://language-plus-molecules.github.io/uploads/17.pdf — verified (read).
- Each property gets value, unit and conditions, each condition typed as (type, value, unit).
- Strict property-detail F1 **0.419**, rising to 0.769 with lenient thresholds.
- Image input was best. Captions *hurt* F1 because conditions are "reported inside the table".
- The condition score uses best-match pairing of (type, value, unit) triples. **This is a reusable scorer design for PEE.**

**DiSCoMaT** (Gupta et al., ACL 2023): https://aclanthology.org/2023.acl-long.753 — verified (read, abstract).
- Composition extraction from tables with GNNs plus "task-specific regular expressions, features, and constraints".
- 4,408 distantly supervised and 1,475 annotated tables.
- Hira et al. report DiSCoMaT failed on 60% of tables where composition is encoded in sample IDs.

### 4.4 Web tables: implicit units and context cascade

**Equity** (Ibrahim, Riedewald & Weikum, CIKM 2016): https://khoury.northeastern.edu/home/mirek/papers/2016-CIKM-Equity.pdf — verified (read).
- Quantities are canonicalised to ⟨measure, value, unit⟩ over a Quantity KB. Per measure the KB stores aliases, "range bounds for the value", surface regexes and conversion rules.
- **Unit search cascade:** "We look for possible units, first in the cell, then in the column header, and eventually in the table context."
- For unit-less quantities the column header identifies the measure.
- Scale words ("M", "mil") are folded into normalised values.
- Its running example has a footnote "(1) measured per 100 mile": a basis carried by a footnote.
- Quantity-linking precision is about 93%. Product entities are the weak spot (about 81%).

---

## 5. Explicit work on conditions and implicit basis: what exists

- **Conditions as a typed field:**
  - MeasEval Qualifier (untyped span), best F1 0.163;
  - CDE `contextual` nested models;
  - ChatExtract "multiplets" (unevaluated);
  - Circi et al. (type, value, unit) conditions, strict 0.419;
  - MOF synthesis conditions, few-shot F1 0.94, but these are *process parameters* extracted as main slots, not qualifiers of a result.
- **Implicit unit/basis:** I found no dataset that annotates *basis* ("per cycle", "per programme run", "per year") as its own field.
  - Closest: Hira's counts of units only in captions/footers and compositions without units; Equity's cell→header→context cascade; CQE "concept is implicit … hard to distinguish even for human annotators".
- **Inference:** PEE's "implicit basis" is an open problem the literature does not benchmark. PEE should define and gold-annotate it itself (basis ∈ {per cycle/run, per hour, per day, per year, per kg load, …} plus "stated / inferred-from-category-default / unknown").

---

## 6. Recommendations for PEE (S87c)

1. **Representation:** adopt the MeasEval core plus CDE-style nesting:
   ```
   Measurement { quantity{value, unit, modifiers[range|approx|mean|tolerance|list]},
                 property (typed id), entity (product id),
                 conditions[ {role, value|enum, unit?, span, source: same-sentence|header|caption|footnote|elsewhere} ],
                 basis {value, source: stated|header|category-default|unknown},
                 change? }
   ```
   Make `basis` and each condition role explicit. Record *where* each came from, as in Equity's cascade, so evidence stays auditable.
2. **Property and condition definitions as data** (the CDE 2.0 pattern), stored in the knowledge store and not in code:
   - property: dimension, units, specifier lexemes, plausible range (Equity range bounds), default basis;
   - condition role: dimension or enum, lexemes, contextual / binding flags.

   Domain content words ("peak HDR", "10% window", "small drawer", "eco programme") become *condition-value lexicon entries* per category, not regex in code. The category-free classifier remains the fallback.
3. **Context resolution order:** same clause → table row/column header path (TableDataExtractor category table) → caption/footnote → section/page-level context (CDE interdependency) → category default (basis only, flagged as inferred).
4. **Evaluation protocol:**
   - pin quantities to gold;
   - per-component scores (quantity, unit, property, entity, each condition role, basis) with exact and overlap;
   - (type, value, unit) best-match condition scoring (Circi);
   - component-wise with gold upstream *and* end-to-end (SciREX);
   - leave-one-category-out for transfer (AxCell);
   - report double-annotated agreement per component (MeasEval α);
   - keep the precision bias for conditions.
5. **LLMs:** not at runtime (PEE constraints; no measured gain over specialised systems on full tuples; unit hallucination). If a small local model is ever justified, use it to *propose* lexicon entries offline (like CQE's ChatGPT-generated disambiguation data) or with retrieved demonstrations (MOF paper), under the gold/held-out rules.
6. **Licences:**
   - safe to borrow ideas or data from: MIT (CDE, TDE, quantulum3), Apache-2.0 (grobid-quantities code), CC-BY (MeasEval data, grobid-quantities data);
   - **GPL-3.0 for CQE code**: do not copy;
   - SciREX/AxCell: arXiv-licence constraints are noted in the AxCell appendix.
