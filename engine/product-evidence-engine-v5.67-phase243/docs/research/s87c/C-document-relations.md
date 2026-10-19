# C. Document-level and n-ary relation extraction, implicit arguments, frames: lessons for PEE

Research date: 2026-10-19. Analyst: Claude (subagent). Scope: primary sources only.

**Verification marks**
- **verified (read):** I downloaded the PDF or data file from the URL and read the cited passage. I extracted the text with `pdftotext` or read it with WebFetch.
- **not verified (snippet):** the claim comes only from a search-result snippet.

Quotations are short. Numbers are copied from the papers.

---

## 0. Bottom line for PEE

1. **Cross-sentence linking is the normal case.**
   - In DocRED, at least 40.7% of facts need several sentences, and 61.1% need some reasoning beyond pattern matching.
   - In SciREX, 99% of 4-ary result relations cross sentences and 55% cross *sections*.
   - A review's "value + product + property + setting + method" result is structurally a SciREX-style 4/5-ary result tuple, so PEE should expect most roles to sit outside the value's sentence.
2. **End-to-end n-ary extraction collapses through error compounding.** SciREX's 4-ary relation step scores F1 0.611 given gold inputs. End to end it scores 0.008, and 0.268 even with gold entity clusters.
   - Lesson: score and gate **each role** separately, and do not trust a tuple whose roles were linked by chained guesses.
3. **Implicit roles are pervasive and come in two kinds.**
   - Implicit arguments add 65–71% to NomBank's role coverage (Gerber & Chai).
   - FrameNet and SemEval-2010 Task 10 separate **definite** null instantiation (DNI) from **indefinite** null instantiation (INI):
     - DNI: the filler must be found in the context, e.g. "the eco programme" named earlier.
     - INI: the filler is understood by convention for the predicate, e.g. *eat* → a meal, and by analogy "used 0.9 kWh" in a dishwasher test → per cycle.
   - PEE's implicit *basis* is an INI-type default and should be labelled as inferred-by-convention. PEE's implicit *product* or *programme* is DNI-type and must be resolved to a document location, or the system abstains.
4. **Frames give role inventories that already fit PEE.**
   - FrameNet's `Operational_testing` frame has the elements Tester, Product, Tested_property, Circumstances, Means and Result. Its example sentence is literally "How we tested the Radeon 9700 Pro video-card".
   - `Measure_scenario` has the elements Entity, Attribute, Value, Unit, Count and Circumstances.
   - `Using_resource` has the elements Agent, Resource, Purpose, **Portion** and Means.
   - MeasEval (SemEval-2021 Task 8) has the roles Quantity, Unit, MeasuredEntity, MeasuredProperty and Qualifier ("the pressure at which a boiling point was observed").
   - A category-independent "test result" frame with these roles is well supported by prior art.
5. **Evaluate per role, plus a separate "should this role be filled at all?" decision.**
   - SemEval-2010 Task 10's organisers say in hindsight that one score was "too demanding". Scores should have been separate for three things:
     - recognising that a role is null-instantiated;
     - classifying it as DNI or INI;
     - finding the antecedent.
   - MeasEval's agreement shows how hard the roles are: Quantity α=0.943 and Unit α=0.866, but MeasuredProperty 0.641, MeasuredEntity 0.546 and Qualifier 0.334. Gold for the *conditions* role is intrinsically noisy, so PEE's gold needs adjudication for that role in particular.
6. **Evidence-first pipelines help, and most evidence is found by three simple rules.**
   - EIDER's heuristic silver evidence covers 88.52% of positive DocRED pairs: co-occurrence 54.46%, coreference 7.99% and bridge entity 26.07%.
   - Predicting on the evidence-only "pseudo document" and fusing that with the full document improves inter-sentence F1.
   - In TAT-QA (tables plus text), 84% of the model's errors are wrong or missing evidence, not arithmetic. The table scale ("million") often appears only in a header or a paragraph, just as PEE's units, bases and settings live in headers and row labels.

---

## 1. Document-level relation extraction (DocRED and follow-ups)

### DocRED (Yao et al., ACL 2019)
- Source: https://aclanthology.org/P19-1074.pdf — verified (read).
- **Data**
  - 5,053 human-annotated Wikipedia documents, 132,375 entities and 56,354 relational facts over 96 relations.
  - Plus about 101,873 documents with distant supervision.
  - Annotation covers mentions, coreference, relations and **supporting-evidence sentences**.
- **How much needs cross-sentence reasoning:** "at least 40.7% of the relational facts in DocRED can only be extracted from multiple sentences".
- **Reasoning types** (manual analysis of 300 documents, 3,820 relation instances):

  | Reasoning type | Share | Note |
  |---|---|---|
  | Simple pattern recognition | 38.9% | Only these need no reasoning ("61.1% require reasoning") |
  | Logical reasoning | 26.6% | Relation set up indirectly "by a bridge entity" |
  | Coreference reasoning | 17.6% | |
  | Common-sense reasoning | 16.6% | |
  | Other (e.g. temporal) | 0.3% | |

- **Evidence-type breakdown** (development set, 12,332 instances):

  | Subset | Instances | Model recall |
  |---|---|---|
  | Single supporting sentence | 6,115 | 51.1% |
  | Several sentences, the pair co-occurs in one ("mix") | 1,062 | 49.4% |
  | Several sentences, the pair never co-occurs ("multiple") | 4,668 | 46.6% |

- **Human vs. model:**

  | Task | Model F1 | Human F1 |
  |---|---|---|
  | Relation extraction (RE) | 54.1 | 88.0 |
  | RE plus evidence (RE+Sup) | 44.7 | 73.4 |

- **What transfers:** the decomposition of mentions → coreference clusters → entity-pair relation → evidence sentences, and the reasoning taxonomy.
- **What needs domain knowledge:** the common-sense share (16.6%) cannot be learned from the text alone.
- **For PEE:** budget for about a quarter of links needing a *bridge*. In a review the bridge is typically the product heading or the table's product column linking a value to a model name.

### Re-DocRED (Tan et al., EMNLP 2022)
- Sources: https://aclanthology.org/2022.emnlp-main.580.pdf and https://arxiv.org/abs/2205.12696 — verified (read).
- **Finding:** DocRED's recommend-revise annotation left "false negative samples ... prevalent". DocRED keeps an average of 12.5 triples per document. Re-DocRED re-annotated 4,053 documents, giving 28.1 triples per document (train) and 34.6 (dev).
- **Effect:** models trained and evaluated on Re-DocRED gain "around 13 F1 points".
- **For PEE:**
  - Gold built by *reviewing system suggestions* under-counts true links, and that depresses measured recall and precision.
  - PEE's blind-annotation protocol (annotating before any run) is the right defence and should stay.
  - Where gold *is* seeded from system output, report it as such.

### ATLOP (Zhou et al., AAAI 2021)
- Source: https://arxiv.org/pdf/2010.11304 — verified (read).
- **Method:** adaptive thresholding replaces the global threshold with "a learnable threshold class". Labels scoring above the TH class are output, otherwise the result is NA. Localized context pooling reuses pretrained attention to find context specific to each entity pair.
- **Result:** DocRED F1 63.4.
- **For PEE:** a per-pair, learned "no relation" class is the ML analogue of PEE's abstention. The threshold should depend on the pair or role, not be one global cut-off. In a rules engine, keep a per-role confidence floor rather than one global one.

### EIDER (Xie et al., Findings ACL 2022)
- Source: https://aclanthology.org/2022.findings-acl.23.pdf — verified (read).
- **Method**
  - Joint relation and evidence extraction.
  - At inference it predicts on the full document *and* on a pseudo-document built only from the extracted evidence sentences, then blends the two.
  - +1.37 / +1.26 Ign F1 / F1 on DocRED.
- **Heuristic silver evidence** (no human evidence labels) when evidence is not annotated:

  | Rule | Definition | Share of test samples |
  |---|---|---|
  | Co-occur | Head and tail appear in the same sentence | 54.46% |
  | Coref | Coreferent mentions of head and tail co-occur | 7.99% |
  | Bridge | A third entity co-occurs with both head and tail | 26.07% |
  | **Total coverage** | | **88.52%** |

- **For PEE:** these three rules transfer almost directly as *evidence-location* rules for a value:
  - the same sentence or table row;
  - a coreferent product mention such as "it" or "the machine";
  - a bridge through the section heading or the table's product column.
- Keeping the evidence pointer per role makes the result auditable.

### DREEAM (Ma et al., EACL 2023)
- Source: https://aclanthology.org/2023.eacl-main.145.pdf — verified (read).
- **Method:** evidence is defined as "sentences containing clues for the relationship". The evidence is used as a supervisory signal on attention, with self-training of evidence retrieval on unannotated data. The paper reports state of the art on DocRED for both relation extraction and evidence retrieval.
- **Transferable idea:** the evidence can be learned from automatically generated (silver) labels and then refined.

---

## 2. N-ary and cross-sentence relation extraction; conditions

### Peng et al., TACL 2017: graph LSTMs
- Source: https://aclanthology.org/Q17-1008.pdf — verified (read).
- **Representation:** a document graph that joins words with sequential, syntactic, discourse and coreference edges, within and across sentences. The task is the ternary relation (drug, gene, mutation).
- **Candidate restriction:** the entities must lie within K ≤ 3 consecutive sentences and form a "minimal span". This avoids "many obviously wrong examples".
- **Results** (5-fold cross-validation, balanced, distant supervision; accuracy):

  | Model | Single sentence | Cross-sentence |
  |---|---|---|
  | Feature-based | 74.7 | 77.7 |
  | Graph LSTM-FULL | 77.9 | 80.7 |

- Cross-sentence extraction "yields 3 to 5 times more relations than single-sentence extraction".
- Manual precision of the cross-sentence ternary relations was 64% at p≥0.5 and 75% at p≥0.9.
- Multi-task learning with the binary sub-relations (drug-gene, drug-mutation) helped.
- **For PEE**
  - The **minimal-span** rule is directly reusable: when several products or programmes could fill a role, prefer the closest non-overlapping span and reject far-apart combinations.
  - Learning the n-ary relation together with its binary sub-relations (value-product, value-property) matches a role-by-role design.
  - Cross-sentence linking raises yield 3–5× but lowers precision, so it needs gating.

### SciREX (Jain et al., ACL 2020)
- Source: https://aclanthology.org/2020.acl-main.670.pdf — verified (read).
- **Representation:** document-level **4-ary result relations** (Dataset, Metric, Task, Method) between *salient* entity clusters in full papers. 438 documents.
- **Where the relations sit:** "57% of binary and 99% of 4-ary relations occur across sentences. 20% binary and 55% 4-ary relations occur across sections."
- **Results** (Table 5, F1):

  | Setting | 4-ary relations |
  |---|---|
  | Component with gold inputs | 0.611 |
  | End to end, predicted input | 0.008 |
  | End to end, gold salient clusters | 0.268 |

  End to end with predicted input, salient clusters score 0.307 and binary relations 0.096.
- **For PEE**
  - This is the closest published analogue to "a test result whose roles are spread over a review". The method sits in a "how we test" section, the product in a heading and the value in a table.
  - The catastrophic compounding (0.611 → 0.008) argues for:
    - per-role evaluation;
    - an evidence location per role;
    - abstaining when a required role's link is weak, rather than emitting a full tuple.
  - "Salience" also matters: SciREX only relates the paper's *own* result entities. For PEE, values about the reviewed product rather than comparison or reference products are the analogue, and they need explicit identity tracking.

### Fact–condition tuples (Jiang et al., EMNLP 2019)
- Source: https://aclanthology.org/D19-1029.pdf — verified (read).
- **Claim:** "Without the conditions (e.g., equipment, environment) that were precisely specified, facts ... may no longer be valid."
- **Representation**
  - Separate **fact tuples** and **condition tuples**, each with five slots: subject concept, subject attribute, relation phrase, object concept, object attribute.
  - Concept and attribute are kept apart, e.g. `{TRPV5/V6 channels : activity}`.
  - One span can fill a slot in both a fact and a condition tuple.
- **Data:** 756 fact and 654 condition tuples from 336 sentences. 61% and 52% of sentences have more than one fact or condition tuple respectively.
- **Results:** the multi-input multi-output tagger improves F1 relatively by 6.2% on the new BioCFE dataset and 4.2% on BioNLP2013. The gains are "consistently bigger" for conditions.
- **For PEE**
  - Model the test **setting or condition** (programme, load, mode, distance, temperature) as a first-class tuple linked to the result, not as free text.
  - Separate the **entity** (the dishwasher) from the **attribute** (energy use).
  - Expect several results per sentence and per table row.

---

## 3. Implicit semantic roles, NomBank and FrameNet

### NomBank (Meyers et al., 2004)
- Source: https://aclanthology.org/W04-2705.pdf — verified (read).
- Argument structure (ARG0/ARG1/...) for about 5,000 common nouns in the Penn Treebank. Example: "REL = gift, ARG0 = her, ARG1 = a book".
- NomBank annotates only arguments *inside* the local syntactic context.
- **For PEE:** nominal predicates such as *consumption*, *use*, *noise* and *runtime* carry roles just like verbs. "Energy consumption of 0.9 kWh" has the same role structure as "used 0.9 kWh".

### Gerber & Chai, ACL 2010; Computational Linguistics 2012
- Sources: https://aclanthology.org/P10-1160.pdf and https://aclanthology.org/J12-4003.pdf — verified (read).
- **Coverage:** implicit arguments add 65% (2010) and 71% (2012) relative role coverage to NomBank for ten frequent nominal predicates.
- **Location:** "approximately 56% of the implicit arguments ... can be resolved within the sentence containing the predicate". The rest need up to 46 sentences back. The best candidate window was the current sentence plus the two before it.
- **Results**
  - 2010: the discriminative model reached overall F1 about 42 against a baseline of 26.5. That is "a 59% relative (15-point absolute) gain".
  - 2012: "F1 score of 50%". An informed baseline fills the argument from the nearest other instance of the same predicate.
- **For PEE**
  - The baseline itself is a usable rule: copy the role filler from the nearest other instance of the same predicate. If the previous "used X kWh" sentence named the eco programme, the next one inherits it unless it is overridden.
  - Most fillers are local, so search outward and stop early.

### SemEval-2010 Task 10: Linking Events and Their Participants in Discourse (Ruppenhofer et al.)
- Source: https://aclanthology.org/S10-1008.pdf — verified (read).
- **Representation:** FrameNet frames. Null-instantiated core roles are typed:
  - **DNI** (definite): the referent "must be accessible to speaker and hearer from the discourse";
  - **INI** (indefinite): the referent is only "existentially bound".
- **Data:** about 18.7% (train) and 18.4% (test) of frame elements are omitted. Of the DNIs, 80.9% (train) and 74.2% (test) had an antecedent in the text.
- **Results:** systems were weak.
  - SEMAFOR recognised 63.4% of null instantiations.
  - It typed only 54.7% of those correctly as DNI or INI, against a 50.8% majority baseline.
- **Evaluation lesson, in the organisers' words:** "It would have been better to give separate scores for 1) ability to recognize when a core FE has to be treated as null-instantiated; 2) ability to distinguish INI and DNI; and 3) ability to find antecedents."
- **Core-set lesson:** with frame-element core sets, once one member is overt the others are *not* null-instantiated. Systems that treat each core role separately produce false-positive "missing role" claims.

### FrameNet null instantiation (Ruppenhofer et al., FrameNet II book, 2006)
- Source: https://research.cs.wisc.edu/zhu/space2/FrameNet1.3/docs/book.pdf — verified (read), §3.2.3.
- **DNI:** the missing element "must be something that is already understood in the linguistic or discourse context".
- **INI:** for the missing objects of *eat*, *bake* or *drink*, "the nature ... of the missing element can be understood given conventions of interpretation, but there is no need to retrieve or construct a specific discourse referent". Licensing is *lexical*: *eat* allows omission and *devour* does not.
- **CNI** (constructional): licensed by a construction such as the passive or the imperative.
- **For PEE**
  - The implicit "per cycle" basis of "the eco programme used 0.9 kWh" behaves like an **INI with a conventional filler**. The predicate (energy *use* by a dishwasher *programme*) licenses a conventional basis (one run or cycle) without a textual antecedent.
  - That convention is **category and frame knowledge**, so it belongs in the knowledge store as a typed default per (category, property, predicate). It must be marked `inferred_by_convention`, never as a text-extracted value.
  - By contrast, "the programme" or "the machine" is DNI: a textual antecedent must exist, and if none is found PEE must abstain.

### Relevant FrameNet 1.7 frames
- Read from the official FrameNet 1.7 XML as distributed by NLTK: https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/framenet_v17.zip — verified (read) (`frame/*.xml`).
- The FrameNet website itself returned HTTP 503: https://framenet2.icsi.berkeley.edu/fnReports/data/frameIndex.xml?frame=Using_resource — not read.

| Frame | Definition (short) | Core / key frame elements | PEE role mapping |
|---|---|---|---|
| `Operational_testing` | "A Tester uses a concrete or conceptual Product in order to determine ... how well ... it works" | Tester, Product, Tested_property, Purpose, Unwanted_characteristics, Desired_state_of_affairs; peripheral Means ("How we tested the Radeon 9700 Pro video-card"), Circumstances ("circumstances that obtain during the test procedure"), Duration, Result | Method → Means; setting → Circumstances; property → Tested_property; product → Product; publisher → Tester |
| `Measure_scenario` | An Entity has a Value for an Attribute, possibly as Count × Unit | Entity, Attribute, Value, Unit, Count, Degree; Circumstances, Time | value, unit, property, product, condition |
| `Using_resource` | An Agent uses a finite Resource for a Purpose; "the specific Portion of the Resource may be stated" | Agent, Resource, Purpose, Portion, Means | "the eco programme used 0.9 kWh": Means/Agent = programme, Resource = electricity, Portion = 0.9 kWh, Purpose = one wash (implicit) |
| `Expend_resource` | A Resource is consumed. Lexical units include *consume*, *use up*, *go through* | Resource, Agent; Degree is core-unexpressed | consumption verbs |
| `Measurable_attributes` and `Dimension` | Gradable attribute with a value. Inherited by Sound_level, Temperature, Speed_description, Duration_description, Size | Entity, Attribute, Value, Degree; Circumstances | "quiet", "47 dB" |
| `Quantity` | "His cholesterol level was 124 mg/dL" | Entity, Quantity, Value | "energy level", "noise level" nouns |
| `Assessing` | An Assessor examines a Phenomenon for its Value on a Feature, possibly using a Method | Assessor, Phenomenon, Feature, Method, Medium; Value, Standard | ratings and scores (distinct from measurements) |

- **How frames let new expressions be interpreted through roles:**
  - Lexical units are attached to frames: *use*, *spend*, *consume*, *go through*, *test*, *trial*, *try out*.
  - A new verb or noun only needs to be mapped to an existing frame. Its arguments then fill the same roles, and downstream logic (unit checks, basis defaults, product linking) is reused.
  - The frame hierarchy carries roles down: `Measurable_attributes` is inherited by `Sound_level`, `Temperature` and others, and `Expend_resource` inherits from `Using`.
  - A new product category (say tumble dryers) then reuses `Operational_testing` + `Measure_scenario`. It adds only category vocabulary (lexical units, property names) and the category's conventional INI defaults (per cycle, per kg, per hour).

### MeasEval (SemEval-2021 Task 8; Harper et al.)
- Source: https://aclanthology.org/2021.semeval-1.38.pdf — verified (read).
- **Representation**
  - Quantity: a count, or a measurement with Value and Unit, plus modifiers such as isMean, isApproximate and isRange.
  - MeasuredEntity, MeasuredProperty and Qualifier.
  - Relations HasQuantity, HasProperty and Qualifies.
  - "All relationships are optional", and the information "might even be in a different sentence".
  - Qualifiers are "information that is required to interpret the measurement", e.g. the pressure for a boiling point.
- **Agreement (Krippendorff's α):**

  | Role | α |
  |---|---|
  | Quantity | 0.943 |
  | Unit | 0.866 |
  | MeasuredProperty | 0.641 |
  | MeasuredEntity | 0.546 |
  | Qualifier | 0.334 |

- **Results**
  - The best overall F1 (overlap) was 0.519 out of 19 teams. The proximity-based baseline scored 0.239: it links each property to the nearest quantity and each entity to the nearest property or quantity.
  - Only 7 teams attempted Qualifiers, "the most difficult aspects of the task".
- **For PEE:** this is the closest *evaluation* template. Score span or slot F1 **per role**: value, unit, product, property, condition, method. Expect the condition role to be the least reliable, both for gold and for the system.

---

## 4. Joint table and text understanding

### TAT-QA (Zhu et al., ACL 2021)
- Source: https://aclanthology.org/2021.acl-long.254.pdf — verified (read).
- **Data:** 16,552 questions over 2,757 table + paragraph contexts from financial reports.
- **Scale:** the **scale** (thousand, million, ...) is "often omitted or shown only in headers or associated paragraphs of the table". TAGOP predicts the scale with a separate classifier.
- **Results:** TAGOP F1 58.0 against human 90.8.
- **Error analysis** (100 errors):

  | Error type | Share |
  |---|---|
  | Wrong evidence | 55% |
  | Missing evidence | 29% |
  | Wrong calculation | 9% |
  | Unsupported calculation | 4% |
  | Scale error | 3% |

  So "about 84% error is caused by the failure to extract the supporting evidence".
- **Annotation:** each answer is annotated with its source: Table, Text or Table-text.
- **For PEE**
  - Treat unit, basis and setting carried by a header or caption as a **separate role** with its own evidence pointer and classifier or rule, just as TAT-QA treats scale.
  - Record the role source as table cell, row label, column header, caption, prose or method section.
  - Evidence selection, not arithmetic, is where most failures come from.

### HybridQA (Chen et al., Findings EMNLP 2020)
- Source: https://aclanthology.org/2020.findings-emnlp.91.pdf — verified (read).
- Questions need both a Wikipedia table and the passages linked from its cells: "lack of either form would render the question unanswerable".
- Table-only and text-only baselines score below 20% EM; the hybrid model scores over 40% EM, still far below humans.
- **For PEE:** table cells act as *entity anchors* (a product row) that link to prose (the method or caveats). Joining across modalities is required, not optional.

### SemTab 2019 (Jiménez-Ruiz et al., ESWC 2020)
- Source: https://openaccess.city.ac.uk/id/eprint/23907/1/eswc2020_semtab_resources.pdf — verified (read).
- **Tasks**
  - CTA (column type annotation): each column is mapped to a knowledge-graph class.
  - CEA (cell entity annotation): each cell is mapped to an entity.
  - CPA (column property annotation): each column pair is mapped to a knowledge-graph property.
- **Listed difficulties**
  - "Lack of metadata or uninformative table and column names";
  - noise;
  - a knowledge gap (cells with no knowledge-graph entity);
  - ambiguous cells;
  - missing data;
  - short labels and acronyms.
- **Scope:** CTA and CEA focus on categorical columns; numeric columns are "a different data wrangling task".
- **Lesson:** unlimited submissions "may lead to over-tuning the matching model".
- MTab won all tasks in 2019: https://arxiv.org/pdf/1910.00246 — not verified (snippet).
- **For PEE**
  - CPA (the relation between the product column and a value column) is exactly "which property does this column measure".
  - CTA corresponds to "which entity type or role does this column hold".
  - PEE's tables usually lack a knowledge graph for products, so CEA must be replaced by document-internal identity (the product heading or model number), and abstention is needed for the knowledge-gap case.
  - The over-tuning warning matches PEE's held-out rules.

---

## 5. Coreference, bridging and comparative reviews

### Bridging resolution
- Rösiger, Riester & Kuhn, COLING 2018: https://aclanthology.org/C18-1298.pdf — verified (read).
- Yu & Poesio, COLING 2020: https://aclanthology.org/2020.coling-main.315.pdf — verified (read).
- **Rösiger et al.: two kinds of bridging**
  - **Referential bridging**: anaphors that "require for their interpretation the antecedent as an implicit argument", e.g. "the construction of the new townhall".
  - **Lexical bridging**: meronymy and similar relations.
  - Mixing the two definitions explains poor transfer between corpora.
  - Filtering out coreferent anaphors first helps.
- **Yu & Poesio**
  - Full bridging resolution remains hard.
  - Multi-task learning with coreference gains up to 8 points.
  - On SciCorp (a domain shift) their system reached F1 21.8% (full resolution) and 46.3% (anaphor recognition). A rule-based system reached only 1.5% and 8.1%, because it recognised "less than 1% of the bridging anaphors".
  - Bridging anaphors are about 4% of mentions in ARRAU RST, against 33% discourse-old and 63% discourse-new.
- **For PEE**
  - "The drum" or "the eco programme" in a washer review is *referential bridging*: an implicit part-of or of-product argument whose antecedent is the reviewed product.
  - This is the same mechanism as an implicit argument, so it should use the same per-role resolution and abstention machinery.
  - Hand rules tuned on one publisher can collapse on another; that is the domain-shift risk.

### Comparisons in product reviews (Kessler & Kuhn, LREC 2014)
- Source: http://www.lrec-conf.org/proceedings/lrec2014/pdf/1001_Paper.pdf — verified (read).
- **Representation:** a comparison has a predicate, a type, Entity 1, Entity 2 and an aspect. The corpus has 2,108 comparisons in 1,707 camera-review sentences.
- **Findings**
  - "One or both of the entities may be implicit."
  - Entity types include product, set of products, standard, company and aspect.
  - Implicit aspects (e.g. "expensive" → price) were *not* annotated.
  - Deciding whether a sentence contains a comparison "is difficult to make even for trained human annotators". Once that is decided, detailed annotation is consistent.
  - Observed agreement for the aspect span was the lowest of the text spans in their table (0.56 agreement on spans).
- **For PEE:** in comparative and multi-product reviews, each value needs an explicit product role. "Standard" (a reference or benchmark) and "set of products" are legitimate fillers that must **not** be collapsed into the reviewed product, which matches the non-negotiable rule against merging products. An implicit entity calls for DNI resolution or abstention.

---

## 6. Concrete design and evaluation lessons for PEE

### 6.1 Representation: a "TestResult" frame with per-role evidence
Model each test result as an **n-ary frame instance**:

| Role | Prior-art basis | Typical location in a review | Null-instantiation type if absent |
|---|---|---|---|
| value (+ modifiers: mean, approx, range) | MeasEval Quantity | cell or sentence | never null (the anchor) |
| unit | MeasEval Unit; TAT-QA scale | cell, column header, caption | DNI from header, else abstain |
| product | Operational_testing.Product; SciREX salient entity; comparison Entity | heading, product column, "it" or "the machine" | DNI: must resolve or abstain |
| property | Tested_property; MeasuredProperty; CPA | row label, column header, sentence predicate | DNI from header or predicate |
| setting / condition | Circumstances; MeasEval Qualifier; Jiang condition tuple | row label, sentence modifier ("on eco") | may be absent; DNI if anaphoric ("this programme") |
| method | Operational_testing.Means; SciREX cross-section | "how we test" section | DNI to a method section, else "unspecified" |
| basis (per cycle, per hour, per kg) | Using_resource.Portion + Purpose; FrameNet INI | usually implicit | **INI with category default**, flagged as convention |
| sample / instrument / tester | Tester; Medium (Assessing) | method section | may be unspecified |

- Each filled role carries:
  - an `evidence` pointer (section, table, row, column or sentence offset);
  - a `fill_type`: explicit | coreference | bridge | header-inherited | INI-default | unresolved;
  - a confidence.
- This mirrors DocRED and EIDER evidence, TAT-QA answer source and SemEval DNI/INI typing.
- **Core sets** (SemEval-2010): define which roles are jointly required. Example: product + property + value is required; unit is required unless the property is unitless. A role is not marked "missing" when a set member is overt.

### 6.2 Linking procedure (evidence first, minimal span, nearest-instance inheritance)
1. Anchor on the value.
2. Search for each role outward:
   - same sentence or row;
   - table headers and caption;
   - the previous 2 sentences (Gerber & Chai window);
   - the section heading;
   - the method section.
3. Use the EIDER evidence rules: co-occurrence → coreference → bridge (heading or product column).
4. Apply Peng's **minimal span** rule when several fillers compete.
5. Use the Gerber & Chai **nearest-same-predicate** inheritance for settings and programmes.
6. Use an ATLOP-style **per-role threshold** with NA for abstention, not one global gate.

### 6.3 Evaluation
- **Report per-role metrics:**
  - precision, recall and F1 per role;
  - the fill-type confusion (explicit vs. coreference vs. bridge vs. INI-default);
  - the null decision (should this role be filled?) separately from the antecedent choice (SemEval-2010 hindsight).
- **Report a strict tuple score as well.** SciREX shows the tuple score can be near zero while components look fine, so report both, as well as cross-sentence and cross-section subsets (DocRED's single / mix / multiple split).
- **Expect low agreement on the condition and method roles** (MeasEval Qualifier α=0.334). Use double annotation with adjudication for those roles.
- **Watch for false negatives in gold seeded from system suggestions** (Re-DocRED). Keep blind annotation, and do not over-tune on spent sets (SemTab).

### 6.4 Transfer across categories
- **Category-independent:** the frame roles, the evidence rules, the DNI/INI/core-set logic, table role semantics (CTA/CPA analogues) and the scoring.
- **Category-specific knowledge:**
  - lexical units, such as the predicates and property names per category;
  - the INI defaults for basis (dishwasher energy → per cycle; air purifier CADR → per hour; dehumidifier → litres per day at stated conditions);
  - typical conditions (programmes, modes, loads).
- These belong in the knowledge store as typed, versioned teaching, never as product facts.
- FrameNet's inheritance (`Measurable_attributes` → `Sound_level`, `Temperature`, ...) suggests a small property hierarchy, so that a new category inherits role and unit constraints.

---

## Source list (all verified (read) unless marked)

| Paper or resource | URL |
|---|---|
| DocRED | https://aclanthology.org/P19-1074.pdf |
| Re-DocRED | https://aclanthology.org/2022.emnlp-main.580.pdf ; https://arxiv.org/abs/2205.12696 |
| ATLOP | https://arxiv.org/pdf/2010.11304 ; https://arxiv.org/abs/2010.11304 |
| EIDER | https://aclanthology.org/2022.findings-acl.23.pdf |
| DREEAM | https://aclanthology.org/2023.eacl-main.145.pdf |
| Peng et al. 2017 | https://aclanthology.org/Q17-1008.pdf |
| SciREX | https://aclanthology.org/2020.acl-main.670.pdf |
| Jiang et al. 2019 | https://aclanthology.org/D19-1029.pdf |
| NomBank | https://aclanthology.org/W04-2705.pdf |
| Gerber & Chai 2010 | https://aclanthology.org/P10-1160.pdf |
| Gerber & Chai 2012 | https://aclanthology.org/J12-4003.pdf |
| SemEval-2010 Task 10 | https://aclanthology.org/S10-1008.pdf |
| FrameNet II book | https://research.cs.wisc.edu/zhu/space2/FrameNet1.3/docs/book.pdf |
| FrameNet 1.7 data (NLTK distribution) | https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora/framenet_v17.zip |
| MeasEval | https://aclanthology.org/2021.semeval-1.38.pdf |
| TAT-QA | https://aclanthology.org/2021.acl-long.254.pdf |
| HybridQA | https://aclanthology.org/2020.findings-emnlp.91.pdf |
| SemTab 2019 | https://openaccess.city.ac.uk/id/eprint/23907/1/eswc2020_semtab_resources.pdf |
| MTab | https://arxiv.org/pdf/1910.00246 — not verified (snippet) |
| Rösiger et al. 2018 | https://aclanthology.org/C18-1298.pdf |
| Yu & Poesio 2020 | https://aclanthology.org/2020.coling-main.315.pdf |
| Kessler & Kuhn 2014 | http://www.lrec-conf.org/proceedings/lrec2014/pdf/1001_Paper.pdf |

- I did not read HybridQA's full results table beyond its abstract figures.
- I did not read DREEAM's numeric results.
- MeasEval's per-role team scores were not reliably parsable from the PDF text, so only the overall and α figures are cited.
