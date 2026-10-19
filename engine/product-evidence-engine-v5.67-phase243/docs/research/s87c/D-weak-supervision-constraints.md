# D — Weak supervision, constraints and knowledge-guided inference (S87c research)

Research date: 2026-10-19. Analyst: Claude (research subagent). No PEE code or data was read; the recommendations
are based only on the problem description in the brief (regex cue lists, two linkers disagreeing on 267 of 472 gold
observations, condition vocabularies, category teaching as concepts and relations in SQLite).

**Source marking.** "verified (read)" means I opened the primary document, either on the web or as the full PDF text
extracted locally with `pdftotext`, and read the passage cited. "not verified (snippet)" means I saw only a search
snippet or a bibliographic page. Quotations are kept short. Text marked **[inference]** is my own reasoning and does
not come from a source.

---

## 0. Summary for PEE

| PEE need | Best-supported technique | Weight it can carry |
|---|---|---|
| (1) Combine imperfect signals, estimate their accuracy and correlation, abstain on conflict | Data programming / label model (Snorkel). Use majority vote first; add the closed-form triplet estimator (FlyingSquid) only when there are at least 3 roughly independent signals | Strong as a method. Benefits depend on the regime (label density, independence) |
| (2) Declarative, verifiable constraints on stored observations and on comparability | SHACL Core vocabulary (cardinality, datatype, `in`, property-pair `equals`/`lessThan`, `qualifiedValueShape`, `and/or/not/xone`) plus SPARQL-style custom constraints, re-implemented as a small TypeScript shape interpreter that emits SHACL-style validation reports | Strong. Standard semantics, no RDF stack required |
| (3) Learn the meaning of new expressions from held knowledge | Distant supervision from the store's own (term → concept) pairs, used as labeling functions rather than as truth; mutual-exclusion bootstrapping against semantic drift; owner review chosen by active learning | Medium. Noise of distant supervision is measured at 13–31% even in clean settings |
| (4) Reconcile two disagreeing linkers without assuming either is right | Stratified adjudication sample, per-stratum confusion matrices, chance-corrected agreement (kappa/alpha) reported together with raw agreement | Strong. With only two systems, accuracies are **not identifiable** from agreement alone, so adjudication is required |
| Joint consistency across extractions | PSL-style soft rules (hinge loss) for knowledge-graph identification | Medium. A modest F1 gain on NELL; a heavy machine to rebuild. Use its rule *patterns*, not an engine |

---

## 1. Weak supervision / data programming (Snorkel family)

### 1.1 Data programming (Ratner et al., NeurIPS 2016)

Source: https://arxiv.org/abs/1605.07723 (abstract) and https://arxiv.org/pdf/1605.07723 (full text) — **verified (read)**.

- **What it does.** Users write *labeling functions* (LFs): "programs that label subsets of the data, but that are
  noisy and may conflict." The labeling process is modelled as a generative model, which "denoises" the labels. A
  noise-aware discriminative model is then trained on the result.
- **Model (Sec. 3, independent case).**
  - Each LF i labels an item with probability βᵢ (coverage). When it labels, it is correct with probability αᵢ.
  - LF outputs are in {−1, 0, 1}, where **0 = abstain**.
  - The analysis assumes 0.3 ≤ βᵢ ≤ 0.5 and 0.8 ≤ αᵢ ≤ 0.9, "roughly consistent with our applied experience."
  - It assumes the LFs are conditionally independent given the true class, and that the class label is independent of
    the features given the LF outputs. The paper also gives a dependency-aware extension.
- **Results.**
  - TAC-KBP 2014 slot filling: the method "would have led to a new winning score."
  - An LSTM trained with it beat a state-of-the-art LSTM baseline by "almost 6 F1 points."

### 1.2 Snorkel system (Ratner et al., VLDB 2018 / PVLDB 11(3))

Sources: https://arxiv.org/abs/1711.10160 (abstract) and https://arxiv.org/pdf/1711.10160 (full text) —
**verified (read)**.

- **Results.**
  - Users built models "2.8x faster" with "45.5%" better predictive performance than after seven hours of hand
    labelling.
  - "132% average improvements over prior heuristic approaches"
  - Within "3.60%" of large hand-curated training sets.
- **When a learned model beats majority vote.** This is the key result for PEE.
  - The paper defines the *label density* d_Λ as the "mean number of non-abstention labels per data point."
  - Low density: an optimal weighting can barely differ from majority vote (MV), because few items carry conflicting
    labels. The expected advantage is bounded by O(d̄²).
  - High density: if the mean LF accuracy is above 50%, MV "converges exponentially to an optimal solution."
  - Medium density: "the middle-density regime where we expect to most benefit from applying the generative model."
  - The *modeling advantage* A_w counts the items where the weighted vote correctly disagrees with MV, minus the
    items where it disagrees incorrectly.
  - Table 1 gives the empirical advantage of the generative model over MV: 7.0, 4.9, 4.4, 0.1 and 2.8 points on five
    applications. The optimizer chose MV for Chem, where the advantage was 0.1.
  - The optimizer predicts the advantage "to within 2.16 accuracy points on average."
- **Correlated LFs.** Users often write dependent LFs, for example "checking for matches against similar regular
  expressions."
  - In Example 3.1, 5 perfectly correlated LFs with 50% accuracy and 5 independent LFs with 99% accuracy are fitted
    with the independent model. The estimated accuracies come out as **100% and 50%**, the reverse of the truth.
  - Structure learning (a pseudolikelihood estimator with a threshold ε) chooses which correlations to model. The
    authors recommend the "elbow point" in ε.
- **Implications for PEE [inference].**
  - PEE's cue lists are exactly "variations of each other … similar regular expressions."
  - Treating each regex list as an independent voter will therefore over-weight clusters of near-duplicate cues.
  - Group them into one LF per *family*, or model the correlation explicitly.

### 1.3 Snorkel MeTaL (Ratner et al., AAAI 2019)

Sources: https://arxiv.org/abs/1810.02840 and https://arxiv.org/pdf/1810.02840 — **verified (read)**.

- It handles sources that label at different granularities (multi-task). Accuracies are recovered by "solving a
  matrix completion-style problem," using the structure of the inverse covariance matrix. The dependency graph of the
  sources must be known. The paper gives an identifiability condition.
- Results: on average +20.2 points over supervised learning, **+6.8 over majority vote**, and +4.1 over data
  programming.
- **Relevance [inference].**
  - PEE signals answer questions at different levels: "is this a test result?", "which measurement?", "which
    condition?"
  - MeTaL's multi-task framing matches this hierarchy. It needs a known dependency graph, which PEE can write down
    from its own code, because it knows which cue lists share inputs.

### 1.4 FlyingSquid triplet method (Fu et al., ICML 2020)

Sources: https://arxiv.org/abs/2002.11955 and https://arxiv.org/pdf/2002.11955 — **verified (read)**.

- **Closed form.**
  - Let aᵢ = E[vᵢY] be an accuracy rescaled to [−1, 1].
  - If vᵢ ⊥ vⱼ | Y, then aᵢaⱼ = E[vᵢvⱼ], which is the observable agreement rate.
  - With a third conditionally independent source k, the three equations give |aᵢ|, |aⱼ| and |aₖ|. Signs are resolved
    by assuming better-than-random sources on average.
  - Abstains are encoded as 0. Results are averaged over all valid triplets (mean or median).
  - Claims: "170 times faster on average," with label quality the same or better.
- **Implementable in TypeScript [inference].** It needs only pairwise agreement counts over a label matrix and a
  square root: about 50 lines, with no dependencies.
- **Critical limitation for problem (4) [inference, derived from the equation above].**
  - With **only two** sources, only the product a₁a₂ is observable. The individual accuracies of PEE's two linkers
    *cannot* be recovered from their agreement alone.
  - Either a third, conditionally independent signal is needed, or gold/adjudicated labels are needed.
  - This is the formal reason not to "assume either linker is right."

### 1.5 WRENCH benchmark (Zhang et al., NeurIPS 2021 Datasets & Benchmarks)

Sources: https://arxiv.org/abs/2109.11377 and https://arxiv.org/pdf/2109.11377 — **verified (read)**.

- Covers 22 datasets and more than 120 method variants.
- "there is no such method that could consistently outperform others."
- For classification: "MeTaL and MV are the most worth-a-try label models."
- For sequence tagging with very low LF coverage (MIT-Restaurants): "the simple majority voting-based methods achieve
  superior performance compared with other complex probabilistic models."
- **Implication [inference].**
  - For PEE, MV with abstain plus per-LF empirical accuracies on the sealed annotation is a strong baseline.
  - A learned label model must beat it on a held-out split before it is adopted.

### 1.6 Tooling patterns worth copying (no dependency needed)

Source: Snorkel `LFAnalysis` docs,
https://snorkel.readthedocs.io/en/v0.9.7/packages/_autosummary/labeling/snorkel.labeling.LFAnalysis.html —
**verified (read)**.

- Per-LF statistics:
  - coverage;
  - overlaps ("at least one other LF returns a (non-abstain) label");
  - conflicts;
  - `lf_empirical_accuracies(Y)` against development labels;
  - `lf_empirical_probs`, a confusion table P(LF output | true label).
- All are simple counts over a label matrix, so they port easily to TypeScript.
- (The snorkel.org tutorial page returned HTTP 403. It was not accessed further.)

### 1.7 Dawid–Skene (1979)

Source: https://ideas.repec.org/a/bla/jorssc/v28y1979i1p20-28.html — **verified (read)**, abstract only.

- Estimates per-observer error rates on multi-category variables "even when the … 'true' response is not available,"
  via EM. EM is described as "slow but sure."
- This is the multi-class ancestor of the label model. It gives each source a full confusion matrix rather than a
  single accuracy, which suits PEE's many measurement classes. The method is identifiable only with enough
  independent sources [inference].

### 1.8 Failure modes (all from sources above)

| Failure mode | Source |
|---|---|
| Correlated LFs invert the estimated accuracies | Snorkel Example 3.1 |
| Low label density: no gain over MV | Snorkel Prop. 1 |
| Low coverage: MV wins | WRENCH |
| Sources worse than random break sign recovery | FlyingSquid |
| Unknown dependency graph means parameters may not be identifiable | MeTaL |

### 1.9 Recommendations for PEE (1) [inference]

1. **Refactor each cue family into an LF** with the signature `(item) → label | ABSTAIN`. Keep the existing regex
   lists as the LF bodies. Record *which knowledge or code each LF reads*, so that correlation groups are explicit.
2. **Build the label matrix** over every candidate observation, including the 472 gold items, and print an LFAnalysis
   table: coverage, overlap, conflict, and empirical accuracy on the sealed annotation.
   - Treat this as development evidence: once inspected, the sealed annotation is spent, in line with PEE's rule that
     a tuned set is never reported as held-out.
3. **Combination rule, decided on development data.**
   - (a) MV with abstain.
   - (b) Accuracy-weighted vote, with weights log(αᵢ/(1−αᵢ)) from empirical accuracies.
   - (c) The triplet estimator, only where there are ≥3 LFs from *different* inputs.
   - Adopt (b) or (c) only if it beats (a) on a fresh held-out sample. WRENCH's result is that it often will not.
4. **Abstention policy.** Output ABSTAIN when the posterior margin is below a threshold, or when LFs from different
   correlation groups conflict.
   - Report coverage and accuracy together (a selective-prediction curve).
   - Never fill an abstention with a default.
5. **Measure label density first.** If most items have at most one non-abstaining LF, Snorkel's own analysis says a
   generative model will not help. In that case, invest in coverage instead.

---

## 2. Declarative constraints: SHACL, ShEx, JSON Schema

### 2.1 SHACL 1.0 (W3C Recommendation, 20 July 2017)

Source: https://www.w3.org/TR/shacl/ — **verified (read)**, two passes (offset 0 and 100000).

- SHACL is "a language for validating RDF graphs against a set of conditions."
- **Core constraint components:**

| Group | Components |
|---|---|
| Value type | `sh:class`, `sh:datatype`, `sh:nodeKind` |
| Cardinality | `sh:minCount`, `sh:maxCount` |
| Value range | `sh:min/maxInclusive`, `sh:min/maxExclusive` |
| String | `sh:pattern`, `sh:minLength`, `sh:maxLength`, `sh:languageIn`, `sh:uniqueLang` |
| Property pair | `sh:equals`, `sh:disjoint`, `sh:lessThan`, `sh:lessThanOrEquals` |
| Logical | `sh:and`, `sh:or`, `sh:not`, `sh:xone` |
| Shape-based | `sh:node`, `sh:property`, `sh:qualifiedValueShape` with qualified min/max counts |
| Other | `sh:closed`, `sh:hasValue`, `sh:in` |

- **Property-pair semantics.**
  - `sh:equals` requires that "the set of all value nodes is equal to the set of objects" of the comparison property
    on the same focus node.
  - `sh:lessThan` uses SPARQL `<`. Incomparable values also produce a result.
- **Conditional constraints** need no extra syntax: they are expressed with `sh:or`/`sh:not`, as in
  "not(A) or B" = "if A then B" [inference from the logical operators].
- **SHACL-SPARQL** (Part 2) adds constraints written as SPARQL SELECT queries (`sh:sparql`/`sh:select`), with `$this`
  bound to the focus node. "There is one validation result for each solution …" This is how arbitrary cross-node
  rules are expressed, such as "two compared energies must share basis and method."
- **Validation report.**
  - `sh:conforms` is true "if and only if the validation did not produce any validation results."
  - Each `sh:ValidationResult` has `sh:focusNode`, `sh:resultPath`, `sh:value`, `sh:sourceShape`,
    `sh:sourceConstraintComponent`, `sh:resultSeverity` (`sh:Violation` [default], `sh:Warning`, `sh:Info`) and
    `sh:resultMessage` (from `sh:message`).

### 2.2 SHACL 1.2 Core (W3C Working Draft, 14 Oct 2026)

Source: https://www.w3.org/TR/shacl12-core/ — **verified (read)**, first 100k characters only. It is still a draft;
the Recommendation is the 2017 version.

- Visible additions that matter for PEE:
  - node expressions;
  - `sh:targetWhere`;
  - list constraints (`sh:memberShape`, `sh:uniqueMembers`);
  - `sh:uniqueValuesFor`;
  - descriptive `sh:unit`, `sh:intent` and `sh:codeIdentifier`;
  - reification of severity and messages.
- I could not confirm which of these are new against 1.0, because the changes appendix was truncated.

### 2.3 SHACL Advanced Features (Working Group Note, 8 June 2017)

Source: https://www.w3.org/TR/shacl-af/ — **verified (read)**.

- Defines custom targets, SHACL functions, node expressions, expression constraints, and **SHACL rules** (triple
  rules and SPARQL rules) for deriving new triples.
- It is a Note, so it "does not imply endorsement by the W3C Membership."
- **Relevance [inference].** Rules are the declarative analogue of PEE's derived facts, such as "observation X is
  comparable with Y."

### 2.4 ShEx 2.1 (Final Community Group Report, 8 Oct 2019)

Source: https://shex.io/shex-semantics/ — **verified (read)**, first 100k characters.

- "not a W3C Standard nor is it on the W3C Standards Track."
- A grammar-like approach:
  - triple expressions with `EachOf` (`;`), `OneOf` (`|`) and cardinalities `{m,n}`;
  - closed shapes;
  - validation driven by a *ShapeMap* of node/shape pairs, whose results are pass or fail with a reason;
  - "semantic actions," an implementation-dependent extension point.
- **Verdict [inference].**
  - SHACL's violation-report model fits PEE better: severities, a source constraint per result, and focus nodes.
  - ShEx's regular-expression style suits describing an observation's *required parts*.
  - Either can be imitated without RDF.

### 2.5 JSON Schema 2020-12 (lightweight alternative) and its limits

Source: https://json-schema.org/draft/2020-12/json-schema-core — **verified (read)**.

- Conditionals:
  - `if`/`then`/`else`. The `if` outcome "has no direct effect on the overall validation result."
  - `dependentSchemas` is evaluated "if the instance is an object and contains a certain property."
- **No core keyword compares one property's value with another property's value.** The spec only says keywords "MAY"
  use JSON Pointers, as an extension.

Source: Ajv docs, https://ajv.js.org/guide/combining-schemas.html — **verified (read)**.

- Ajv's `$data` option ("use values from the validated data as the values for the schema keywords") is an Ajv
  extension, not part of the standard.
- **Verdict [inference].**
  - JSON Schema can enforce per-record presence, types, enumerations and conditional presence.
  - It *cannot* express "comparable only if same basis and equal conditions" across two records.
  - That needs SHACL-SPARQL-style custom constraints, which in TypeScript are just named predicate functions.

### 2.6 Recommendations for PEE (2) [inference]

1. **A "shapes as data" module.** A TypeScript interpreter of perhaps 300–500 lines over plain JSON shapes, using the
   SHACL Core vocabulary names: `minCount`, `maxCount`, `datatype`, `in`, `pattern`, `minInclusive`, `equals`,
   `disjoint`, `lessThan`, `qualifiedValueShape`, `and/or/not/xone`, `closed`.
   - Add one escape hatch, `constraint: "<registeredPredicateId>"`, as the SPARQL-constraint analogue for cross-record
     rules.
   - Store the shapes in the knowledge store or as versioned JSON, so they are teachable and auditable.
2. **Example shape: `StoredMeasuredObservation`.**
   - Exactly one `measurement` (`minCount 1`, `maxCount 1`, class `TaughtMeasurement`).
   - Exactly one numeric `value`.
   - `unit` `in` the units allowed for that measurement.
   - `basis` required when the measurement is of energy type (`or(not(type=Energy), minCount basis 1)`).
   - `method` and `conditions` present or explicitly `unknown`, never silently absent.
   - `source` present, with `independence` `in` {independentTest, manufacturerDeclaration, …}.
   - `closed: true` with `ignoredProperties` for provenance.
3. **Comparability as a pair shape.** `ComparablePair(a, b)` requires:
   - `equals(a.basis, b.basis)`;
   - `methodCompatible(a.method, b.method)`, looked up in a taught compatibility relation;
   - `equals(a.conditions, b.conditions)`;
   - unit convertible.

   The comparison and ranking code may only consume pairs that conform. Everything else is returned as a validation
   result with severity `Violation` or `Warning` and a message.
4. **Emit SHACL-style reports** (`conforms`, plus results with `focusNode`, `path`, `value`, `sourceShape`,
   `sourceConstraintComponent`, `severity`, `message`). They are machine-checkable in tests and make every rejected
   comparison explainable to the owner.
5. **No RDF stack.** No triple store or SPARQL engine is needed. This respects the "no heavy dependencies" rule.
   Optionally, export the shapes as Turtle later for interoperability.

---

## 3. Probabilistic logic for consistency across extractions

### 3.1 Markov Logic Networks (Richardson & Domingos, MLJ 2006)

Source: https://homes.cs.washington.edu/~pedrod/papers/mlj05.pdf — **verified (read)**, abstract and introduction
from the extracted PDF.

- "A Markov logic network (MLN) is a first-order knowledge base with a weight attached to each formula."
- Grounded with constants, it yields a Markov network. "Inference in MLNs is performed by MCMC." Weights are learned
  by pseudo-likelihood.
- **Cost (per Pujara et al., below).** "all logical predicates must take Boolean truth values," and the resulting
  "combinatorial explosion … makes inference and learning in MLNs intractable optimization problems."

### 3.2 PSL / Hinge-Loss MRFs (Bach et al., JMLR 2017)

Sources: https://www.jmlr.org/papers/v18/15-631.html (abstract) and
https://www.jmlr.org/papers/volume18/15-631/15-631.pdf (full text) — **verified (read)**.

- Atoms take soft truth values in [0, 1] under Łukasiewicz logic:
  - x₁∧x₂ = max{x₁+x₂−1, 0};
  - x₁∨x₂ = min{x₁+x₂, 1};
  - ¬x = 1−x.
- Each rule becomes a hinge-loss potential, and "MAP inference in HL-MRFs is always a convex optimization," solved by
  ADMM message passing.
- Learned HL-MRFs are "as accurate as analogous discrete models, but much more scalable."

### 3.3 Knowledge Graph Identification (Pujara, Miao, Getoor, Cohen, ISWC 2013)

Source: https://linqs.org/assets/resources/pujara-iswc13.pdf — **verified (read)**, extracted PDF.

- Jointly performs entity resolution, collective classification and link prediction over noisy extractions using
  ontological constraints: domain, range, mutual exclusion, subsumption and inverse.
- Each extractor technique T gets its own rule `CandRel_T ⇒ Rel` with its own weight. This is effectively a
  per-source accuracy, the same idea as an LF weight.
- **NELL results (Table 3).**

| Method | AUC | F1 |
|---|---|---|
| Baseline | 0.873 | 0.828 |
| NELL | 0.765 | 0.673 |
| MLN | 0.899 | 0.836 |
| PSL-KGI | 0.904 | 0.853 |

- The authors say this "produces modest improvements in both F1 and AUC."
- In the ablation (Table 4), removing the ontology lowers F1 from 0.853 to 0.826. This is the largest single
  component effect.
- **Assessment [inference].**
  - The gain is real but modest, and mostly comes from *ontological constraints*.
  - Rebuilding PSL/ADMM in TypeScript is feasible for small groundings, but it is a substantial component.
  - The cheaper path is to take the *rule patterns* (mutual exclusion, domain/range, per-source weights) and enforce
    them as (a) hard SHACL-like violations and (b) soft penalties in a simple greedy or ILP-free resolver.
  - Revisit PSL only if many interacting soft constraints appear.

### 3.4 Recommendations for PEE (3) [inference]

- Express cross-extraction consistency as rules over the store:
  - one value per (product, measurement, conditions, source);
  - mutually exclusive condition codes;
  - measurement domain and range (unit family, plausible range from category teaching).
- Hard violations go through the shape validator (§2). Soft ones are scored as Łukasiewicz distances to
  satisfaction, max(0, body − head), and summed with per-source weights. This is the PSL objective without the
  optimizer, used for *ranking* candidate interpretations rather than solving jointly.
- Log which rule changed each decision.

---

## 4. Ontology/schema matching and reconciling two linkers

### 4.1 Matcher taxonomy

Source: Madhavan, Bernstein & Rahm, "Generic Schema Matching with Cupid," VLDB 2001,
https://dbs.uni-leipzig.de/file/vldb01.pdf — **verified (read)**, extracted PDF. (I tried to fetch the
Rahm–Bernstein survey, but this URL served Cupid.)

- "Individual vs. Combinational."
  - "Hybrid matchers use multiple criteria."
  - Multiple (composite) matchers "run independent match algorithms … and combine the results."
- An instance-based example is SEMINT.
- LSD uses "base learners that use different instance-level matching schemes" with "a meta-learner" combining them.
- **Relevance [inference].** PEE's two linkers are two base matchers from the taught-measurement vocabulary to
  observed expressions. LSD's pattern, combining base matchers with a meta-learner trained on labelled matches, is the
  supervised analogue of §1. It needs the adjudicated sample from §4.3.

Source: Isaac et al., "An empirical study of instance-based ontology matching," ISWC 2007 (LNCS 4825:253–266),
https://research.utwente.nl/en/publications/an-empirical-study-of-instance-based-ontology-matching/ —
**not verified (snippet)**.

- Concepts are aligned by co-occurrence of shared instances.
- Reported finding (from the snippet only): simpler measures, such as Jaccard-like overlap, often beat more
  sophisticated statistical ones.
- **Use [inference].** Align two vocabularies by the overlap of the observations each maps to a concept.

### 4.2 Agreement metrics for system-vs-system

Source: Artstein & Poesio, "Inter-Coder Agreement for Computational Linguistics," Computational Linguistics 34(4),
2008, https://aclanthology.org/J08-4004.pdf — **verified (read)**, extracted PDF.

- The survey covers Cohen's κ, Scott's π and Krippendorff's α, and argues that weighted α-like coefficients "may be
  more appropriate for many corpus annotation tasks."
- **Bias problem.** π and κ "yield quite different numerical values when the annotators' marginal distributions are
  widely divergent."
- **Prevalence problem.** With skewed categories, "chance-corrected agreement may be low even though Ao is high." The
  real test is "the ability to agree on the rare categories."
- **Implication [inference].**
  - Report raw agreement (205/472 = 43.4% if 267 disagree), κ, and α.
  - Report a **per-category** confusion matrix, because the measurement classes are surely skewed.
  - Agreement measures reliability, *not* correctness. Two linkers can agree and both be wrong.

### 4.3 Recommendations for PEE (4) [inference]

1. **Do not estimate the linkers' accuracies from their disagreement.** With two sources only, the product of their
   accuracies is identifiable (FlyingSquid §1.4), not each one. Use the existing gold where it is unspent. For new
   evidence, adjudicate a sample.
2. **Taxonomy of the 267 disagreements.**
   - Classify each one mechanically:
     - (a) A links, B abstains;
     - (b) B links, A abstains;
     - (c) both link, to different measurements in the same family;
     - (d) both link, to measurements in different families;
     - (e) same measurement, different conditions or basis.
   - Cross the type with category (air fryer, dishwasher, …), publisher/template, and table vs prose.
3. **Stratified adjudication sample.**
   - Draw randomly *within* each (type × category) stratum, with a minimum per stratum (for example 10–20) so that
     rare strata are seen.
   - Weight each stratum by its population share when estimating overall accuracy.
   - Adjudicate blind: hide which linker produced which answer, and offer a third option, "neither / should abstain."
   - Seal the sample hash before any run, as PEE already does.
   - Keep this random sample separate from any active-learning sample. Settles warns that an actively selected set
     "comes from a biased distribution" (§5.4), so it cannot give unbiased accuracy.
4. **Outputs.**
   - A per-linker confusion matrix (gold measurement × predicted, including abstain) for each category.
   - Per-stratum accuracy with Wilson intervals.
   - A **routing rule** learned from the strata, for example "in table context, prefer A; when A abstains and B links
     across families, abstain."
   - This is the Dawid–Skene idea (one confusion matrix per source), estimated on adjudicated data rather than by EM.
5. **Add a third, independent signal**, for example a knowledge-based linker that only uses taught unit and range
   compatibility.
   - Three conditionally independent signals make the triplet estimator usable on the *unlabeled* remainder.
   - Check the estimates against the adjudicated strata.

---

## 5. Learning new expressions from existing knowledge

### 5.1 Distant supervision (Mintz et al., ACL-IJCNLP 2009)

Source: https://aclanthology.org/P09-1113.pdf — **verified (read)**, extracted PDF.

- Uses Freebase relations to label sentences. The assumption is that "if two entities participate in a relation, any
  sentence" containing them may express it.
- Combines "400,000 noisy pattern features" and extracts "10,000 instances of 102 relations at a precision of
  67.6%."
- Negatives are sampled from unrelated pairs (1%).

### 5.2 Distant-supervision noise (Riedel, Yao, McCallum, ECML-PKDD 2010)

Source: https://link.springer.com/content/pdf/10.1007/978-3-642-15939-8_10.pdf — **verified (read)**, extracted PDF.

- By manual inspection, the assumption "is violated approximately 13% of the time when aligning Freebase to
  Wikipedia, but 31% when aligning to the New York Times." By relation, NYT violations are 38% for nationality and
  35% for place_of_birth.
- The proposed fix is "expressed-at-least-once": the relation holds in at least one mention, not in all. It gives a
  "31% error reduction."
- **Implication [inference].**
  - When PEE uses its store's (term → concept) pairs to label new page text, a co-occurring known term does *not*
    mean that this mention expresses that concept. Expect double-digit noise.
  - Treat KB matches as LFs with estimated accuracy, never as gold. Prefer at-least-once aggregation per document or
    expression.

### 5.3 Bootstrapping and semantic drift

**DIPRE and Snowball.** Source: Agichtein & Gravano, "Snowball," ACM DL 2000,
http://www.cs.columbia.edu/~gravano/Papers/2000/dl00.pdf — **verified (read)**, extracted PDF.

- DIPRE starts from "a handful of instances" (seed tuples), learns patterns from their contexts, extracts new tuples
  and iterates.
- Snowball adds pattern confidence: Conf(P) = positive/(positive+negative). A pattern's output is checked against
  tuples already known with high confidence. The check uses a key: organization → one location.
- It also adds the RlogF variant: Conf·log₂(positive).
- Tuple confidence is "a function of the selectivity and the number of the patterns that generated it."
- **Direct PEE analogue [inference].** A candidate new expression ("kWh per cycle", "eco 50 programme") is scored by
  how often its matches agree with *already-taught* (product, measurement) facts that have a functional key.

**Semantic drift and mutual exclusion.** Source: McIntosh & Curran, ALTA 2008, https://aclanthology.org/U08-1013.pdf
— **verified (read)**, extracted PDF.

- "semantic drift often occurs when ambiguous or erroneous terms or patterns are introduced."
- Mutual Exclusion Bootstrapping (Curran et al. 2007) reduces it "by eliminating templates that collide with two or
  more categories" and by "ignoring colliding candidate terms."
- The original Curran et al. 2007 PACLING paper is **not verified (snippet)**; it is cited via McIntosh & Curran.

**Coupled learning in NELL.** Carlson et al., WSDM 2010, "Coupled semi-supervised learning for information
extraction" — **not verified (snippet)**, via https://ir.webis.de/anthology/2010.wsdm_conference-2010.11 and a search
result.

- Thesis: few-seed semi-supervised learning is "underconstrained." Coupling many extractors with mutual-exclusion and
  type-checking constraints improves accuracy.

### 5.4 Active learning for owner review

Source: Settles, "Active Learning Literature Survey," UW-Madison TR 1648 (2010),
https://burrsettles.com/pub/settles.activelearning.pdf — **verified (read)**, extracted PDF.

- **Uncertainty sampling** queries the least-confident item, or uses margin or entropy.
- **Query-by-committee:** the "most informative query is considered to be the instance about which they most
  disagree." This is exactly PEE's two linkers plus the LFs as a committee.
- **Caveats.**
  - Uncertainty-based methods can query outliers; density-weighted methods are "less prone to querying outliers."
  - An actively built set "comes from a biased distribution."
- **Use [inference].** Active learning chooses *which* new expressions the owner should teach. Accuracy must still be
  estimated on a separate random or stratified sample.

### 5.5 Recommendations for PEE (5) [inference]

1. **Store-as-distant-supervisor.** For each unknown expression e near a value, collect its co-occurrences with
   already-taught (term → concept) pairs and with known facts that have functional keys (product × measurement ×
   conditions → one value).
   - Score e → concept c with Snowball confidence (agreeing / (agreeing + conflicting)) and RlogF to penalise low
     support.
2. **Mutual exclusion.** Discard e if it scores for two mutually exclusive concepts. Taught disjointness, such as
   noise level versus power, gives the exclusion classes.
3. **No self-feeding without review.**
   - A learned expression enters the store only as a *proposed* lesson, with its evidence counts.
   - Promotion needs the owner, or N independent agreeing documents from different publishers and templates.
   - This blocks semantic drift.
4. **Owner queue by query-by-committee.** Rank pending expressions by committee disagreement (linker A, linker B,
   cue LFs) × frequency (density weighting). Show only the top-k each session.
5. **Evaluate on held-out pages** never used for scoring, and report precision of promoted lessons. Expect the
   13–31% noise class seen in distant supervision before filters.

---

## 6. Feasibility in a small TypeScript codebase [inference]

| Component | Size estimate | Dependencies |
|---|---|---|
| LF registry and label matrix with abstain, LFAnalysis stats | ~200 LOC | none |
| Weighted vote with abstain threshold; Wilson intervals | ~80 LOC | none |
| Triplet (FlyingSquid) accuracy estimator, binary and one-vs-rest | ~80 LOC | none |
| SHACL-Core-like shape interpreter plus named custom predicates, SHACL-style report | ~400 LOC | none |
| Snowball-style expression scoring and mutual exclusion | ~150 LOC | reads SQLite (already present) |
| Query-by-committee review queue | ~60 LOC | none |
| Agreement metrics (raw, κ, Krippendorff α nominal), per-stratum confusion | ~120 LOC | none |
| PSL/MLN engine | large; **not recommended** now | — |

---

## 7. Source register

| # | Source | Status |
|---|---|---|
| 1 | Ratner et al. 2016, Data Programming — https://arxiv.org/abs/1605.07723, https://arxiv.org/pdf/1605.07723 | verified (read) |
| 2 | Ratner et al. 2018, Snorkel — https://arxiv.org/abs/1711.10160, https://arxiv.org/pdf/1711.10160 | verified (read) |
| 3 | Ratner et al. 2019, MeTaL — https://arxiv.org/abs/1810.02840, https://arxiv.org/pdf/1810.02840 | verified (read) |
| 4 | Fu et al. 2020, FlyingSquid — https://arxiv.org/abs/2002.11955, https://arxiv.org/pdf/2002.11955 | verified (read) |
| 5 | Zhang et al. 2021, WRENCH — https://arxiv.org/abs/2109.11377, https://arxiv.org/pdf/2109.11377 | verified (read) |
| 6 | Snorkel LFAnalysis docs — https://snorkel.readthedocs.io/en/v0.9.7/packages/_autosummary/labeling/snorkel.labeling.LFAnalysis.html | verified (read) |
| 7 | Dawid & Skene 1979 — https://ideas.repec.org/a/bla/jorssc/v28y1979i1p20-28.html | verified (read), abstract only |
| 8 | SHACL REC 2017 — https://www.w3.org/TR/shacl/ | verified (read) |
| 9 | SHACL 1.2 Core WD — https://www.w3.org/TR/shacl12-core/ | verified (read), partial |
| 10 | SHACL-AF Note — https://www.w3.org/TR/shacl-af/ | verified (read) |
| 11 | ShEx 2.1 — https://shex.io/shex-semantics/ | verified (read), partial |
| 12 | JSON Schema 2020-12 Core — https://json-schema.org/draft/2020-12/json-schema-core | verified (read) |
| 13 | Ajv `$data` — https://ajv.js.org/guide/combining-schemas.html | verified (read) |
| 14 | Richardson & Domingos 2006, MLN — https://homes.cs.washington.edu/~pedrod/papers/mlj05.pdf | verified (read), abstract and introduction |
| 15 | Bach et al. 2017, HL-MRF/PSL — https://www.jmlr.org/papers/volume18/15-631/15-631.pdf | verified (read) |
| 16 | Pujara et al. 2013, KGI — https://linqs.org/assets/resources/pujara-iswc13.pdf | verified (read) |
| 17 | Madhavan, Bernstein, Rahm 2001, Cupid — https://dbs.uni-leipzig.de/file/vldb01.pdf | verified (read) |
| 18 | Isaac et al. 2007, instance-based ontology matching — https://research.utwente.nl/en/publications/an-empirical-study-of-instance-based-ontology-matching/ | not verified (snippet) |
| 19 | Artstein & Poesio 2008 — https://aclanthology.org/J08-4004.pdf | verified (read) |
| 20 | Mintz et al. 2009 — https://aclanthology.org/P09-1113.pdf | verified (read) |
| 21 | Riedel et al. 2010 — https://link.springer.com/content/pdf/10.1007/978-3-642-15939-8_10.pdf | verified (read) |
| 22 | Agichtein & Gravano 2000, Snowball — http://www.cs.columbia.edu/~gravano/Papers/2000/dl00.pdf | verified (read) |
| 23 | McIntosh & Curran 2008, WMEB — https://aclanthology.org/U08-1013.pdf | verified (read) |
| 24 | Curran, Murphy, Scholz 2007, MEB | not verified (snippet; cited via #23) |
| 25 | Carlson et al. 2010, coupled SSL — https://ir.webis.de/anthology/2010.wsdm_conference-2010.11 | not verified (snippet) |
| 26 | Settles 2010, Active Learning survey — https://burrsettles.com/pub/settles.activelearning.pdf | verified (read) |

Not accessed:

- snorkel.org tutorial (HTTP 403, respected);
- pubs.dbs.uni-leipzig.de (HTTP 503);
- the Carlson thesis on DTIC (HTTP 403).

Extracted source texts (for re-checking quotations) are in
`/tmp/claude-0/-home-user/bd9afe5f-596c-54bb-82da-d49f2aed691c/scratchpad/s87c-research/D-src/`.
