# Owner clarification after S95 and consolidated instruction for S96 (2026-10-20), verbatim

Received after S95 (Crawler f3a114a). Preserved unchanged. It accepts S95 as a valid negative result for the specific
implementation only, and directs R3 towards a typed scientific representation of PEE's entity classes, reused by the
existing readers, with vector views only where justified. It stays in R3 and does not authorise ranking, migration of
decision authority, new LLM dependencies or paid services.

---

PEE — R3: Scientific Entity Representation and Vector-Symbolic Learning

Owner clarification after S95

S95 is accepted as a valid negative experiment for the specific implementation tested. However, it must not be interpreted as a negative evaluation of the broader scientific representation approach discussed in the owner's research.

The intended research direction was not simply to improve concept identity matching by combining existing lexical PPMI vectors with additional similarity scores.

The objective is more fundamental:

Investigate how PEE can represent different scientific entities, their defining properties, relationships, operating conditions, quantitative and qualitative observations, and supporting evidence in a reusable structured and potentially vector-based knowledge representation.

This representation should improve how PEE researches, reads, extracts, attributes, compares, evaluates and learns from scientific and expert product evidence.

Please preserve this distinction throughout the next R3 work.

1. Reconsider the scientific models already researched

Use the owner's existing S94 research and the relevant scientific work, including:

* Multi-view Knowledge Graph Embeddings and MultiKE.
* OWL2Vec* and inductive representation learning such as GraphSAGE.
* I-ADOPT, QUDT, SOSA/SSN and PROV-O.
* Limaye, TableMiner+, Sato and TURL for structural table understanding.
* ChemDataExtractor 2.0 for scientific information extraction.
* BLINK and ontology-alignment approaches for candidate selection and validation.
* ACOS, Structured Sentiment Analysis and hyper-relational knowledge representations for expert qualitative observations.

These are scientific references, not mandatory software dependencies.

Select and justify the mechanisms that genuinely fit PEE. Do not mechanically implement every model.

Do not restart the old Qwen experiments or introduce paid services.

2. First establish what each entity actually represents

Audit and reuse the scientific knowledge already available in PEE:

* Existing concept graph and knowledge store.
* QuantityKnowledge and property definitions.
* Category scientific knowledge packages.
* Whole-document and table interpreters.
* Observation, method, condition and provenance representations.
* Existing qualitative-observation readers from Phases 269/270.

Determine which scientific relationships already exist, which are missing, and which are merely inferred from words.

Develop a general typed representation appropriate to different entity classes, including:

* Products, variants and components.
* Properties and physical quantities.
* Features and functions.
* Test methods, instruments and protocols.
* Operating conditions and influencing factors.
* Quantitative observations, calculations and their inputs.
* Qualitative performance attributes and expert assessments.
* Scientific definitions and relations among concepts.

Do not force every entity into an identical collection of attributes.

A measurement property, a test procedure, a product function and a sensory quality have different scientific identities.

For each applicable entity type, establish explicit distinguishing characteristics, admissible relationships, provenance and uncertainty.

Distinguish direct evidence from inferred relationships. Unknown scientific attributes must remain unknown rather than being invented from names or nearby words.

In particular, shared units, words, dimensions or embedding proximity must never establish identity, hierarchy, causality or comparability on their own.

3. Build on existing architecture rather than another isolated experiment

The scientifically grounded representation should connect to existing PEE modules and stored knowledge.

Prefer permanent, general mechanisms that can be reused by multiple readers and future categories.

Investigate whether different complementary views are useful, such as:

* Lexical and contextual representations.
* Typed scientific attributes.
* Physical dimensions and units.
* Objects of interest.
* Conditions and measurement bases.
* Verified knowledge-graph relations.
* Table structure and document relationships.
* Evidence provenance and derivation.
* Qualitative aspects and expert observations.

A view may be symbolic, numeric, vector-based or relational. Do not assume every view needs a neural embedding.

The intention is to investigate meaningful scientific representations, not simply average more similarity scores.

If explicit scientific attributes are missing, prioritise acquiring and validating them from existing scientific knowledge and eligible documents before relying on vector matching.

Keep provisional knowledge separate from verified, decision-usable knowledge.

4. Investigate operational applications beyond entity identity

Evaluate whether the resulting representation can improve several parts of PEE:

Research and retrieval: discover relevant scientific concepts, evidence and documents expressed using unfamiliar terminology.

Document reading: identify relationships between text, sections, tables, products, methods and results.

Quantitative interpretation: connect observations to measurands, conditions, calculation inputs and provenance.

Qualitative interpretation: identify distinct product qualities, expert assessments, their objects, contexts and evidential basis.

Concept learning: acquire previously unknown concepts and distinguish genuine new properties from linguistic noise.

Knowledge reuse: use validated acquired knowledge to improve interpretation of subsequent documents, including unfamiliar categories.

Do not equate identifying a plausible candidate with verifying its scientific meaning.

5. Compare representations scientifically

Preserve frozen previous baselines, including S94 and S95, and maintain development/check separation.

Evaluate in a manageable sequence:

1. Existing knowledge representation and readers, unchanged.
2. Explicit typed scientific representation linked to existing knowledge.
3. Hybrid vector-symbolic or multi-view representation where justified by the available evidence.

Measure each component's incremental contribution.

Include challenging pairs such as related-but-not-identical concepts, distinct objects sharing physical dimensions, measured versus calculated results, functions versus performance qualities, and qualitative observations under different conditions.

Evaluate on genuinely unseen material, including at least one unfamiliar product category, without selecting only examples favourable to the proposed mechanism.

Most importantly, demonstrate whether a scientifically validated concept or relationship acquired from one source actually improves the reading of a later unseen source.

If the current knowledge is too sparse for a meaningful embedding experiment, report that limitation and address the underlying representation gap instead of repeating S95 with different thresholds.

Use ablations, meaningful baselines, error analysis and resource measurements. Limit reformulations and stop approaches that do not demonstrate incremental value.

6. Architectural and operational safeguards

Preserve the existing repositories, rights policy, provenance rules, publication guards, deterministic decision framework and production-ranking restrictions.

Avoid duplicating existing readers, creating parallel knowledge stores or introducing category-specific exceptions merely to improve a demonstration.

Do not promote unverified knowledge to decision authority.

No new LLM dependency, paid API or unnecessary model installation.

Work autonomously through a bounded investigation and implementation, with suitable validation and clear stopping conditions. Do not repeatedly request approval for safe experimental improvements.

Distinguish implementation, development improvements, genuinely independent validation and demonstrated operational capability.

7. Expected outcome

Produce an evidence-backed evaluation establishing:

* Whether PEE now has a scientifically meaningful representation of its different entity types.
* Whether that representation actually reuses the scientific knowledge already acquired.
* Which vector, symbolic or hybrid mechanisms are useful for which operations.
* Whether expert qualitative attributes can participate in the same general knowledge framework.
* Whether acquired knowledge produces a measurable improvement on previously unseen documents.
* Which limitations remain before the original R3 objectives can be considered satisfied.

The central question is not whether vectors improve synonym matching. It is whether structured scientific knowledge and complementary representations can make PEE more capable of understanding, learning and applying evidence across product categories.

Preserve the successful results of earlier phases and their architectural decisions. Do not claim R3 complete or recommend moving to R4 without evidence of operational generalisation.

This is one consolidated direction. Choose the most economical scientifically defensible implementation and validation path rather than multiplying experiments or introducing unnecessary infrastructure.
