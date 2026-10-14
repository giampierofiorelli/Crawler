# Phase 122 — in-house question → evidence-gap → research architecture

**Date:** 11 October 2026  
**Starting point:** Product Evidence Engine v4.45, Phase 121  
**Status:** additive, executable, strictly bounded internal research prototype. **No autonomous public ranking validated.**

## Design decision

Keep the scientific reasoning, question/goal ontology, source obligations, evidence provenance, sufficiency gates and rankings **owned and implemented in-house**. Do **not** make Ollama, SearXNG, Crawl4AI, Firecrawl, Apify, a hosted LLM, or any commercial search/scraping API mandatory for the architecture. A reusable open-source library, if ever adopted, must demonstrate superior performance or substantially lower maintenance cost, and meet local-operation and replaceability requirements. This is an engineering policy, not proof that every required capability has been built.

The user's concrete challenge is: **“Quali robot richiedono meno interventi umani?”**. At Phase121, the system could calculate limited comparisons only after being supplied expert-reviewed metrics; Phase113 had a narrow and incomplete intent proposal scheme. No successful, unprompted query → discovery → reading → semantic extraction → source attribution → evaluated recommendation chain had been shown. That remains the central challenge.

## Science and expert evidence: what to reproduce ourselves

| Scientific concept | Source | How it informs our own implementation | Current limitation |
|---|---|---|---|
| Probabilistic information retrieval, BM25 | Robertson & Zaragoza, *The Probabilistic Relevance Framework: BM25 and Beyond*: https://doi.org/10.1561/1500000019 | Implemented small local lexical BM25 retrieval over locally supplied passages (`src/phase122_native_local_retrieval.ts`) | Lexical retrieval is not semantic understanding, factual validation or web-scale discovery |
| Query expansion and relevance feedback | Manning, Raghavan & Schütze, *Introduction to Information Retrieval*, ch. 9: https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf | Distinguish a user's words from search formulations, later adapt based on newly verified sources | Phase122 has static, reviewed search query suggestions; no adaptive feedback loop |
| Behavioural testing, paraphrase/negation/robustness | Ribeiro et al., ACL 2020, CheckList: https://aclanthology.org/2020.acl-main.442/ | Independent tests for equivalent goals, disambiguation, negation, unsupported queries, reproducibility | 24 constructed tests are not a held-out genuine-user language benchmark |
| Controlled deep-research evaluations | BrowseComp-Plus (2025): https://arxiv.org/abs/2508.06600 | Use frozen source sets, independent answer keys and hard negatives to isolate retrieval from language reasoning | Not yet implemented as a full offline experimental benchmark |
| Retrieval quality and gold relevance judgments | NIST TREC overview: https://www.nist.gov/publications/34th-text-retrieval-conference-trec-2025 ; NIST warning on automated relevance labels: https://www.nist.gov/publications/dont-use-llms-make-relevance-judgments | Measure recall/precision and have independent judgements, not self-certified model success | No independent judgement corpus yet |
| Retrieval-augmented reasoning and attribution | Lewis et al., NeurIPS 2020: https://arxiv.org/abs/2005.11401 | Keep document-derived facts outside model parameters; evidence and version remain first-class | Retrieval must be linked to verified identity and usable metrics |
| Research agents can fail despite browsing | BrowseComp 2025: https://openai.com/index/browsecomp/ | Evaluate multi-step discovery and persistently reformulate rather than assuming first-page search suffices | Benchmarks differ from open-ended product recommendation tasks |
| Trust and uncertainty evaluation | NIST AI RMF Measure: https://airc.nist.gov/airmf-resources/playbook/measure/ | Explicit measurement of failures, uncertainty, missing information and public-answer gates | Synthetic software tests do not validate market correctness |
| Cost of building a foundation model from scratch | Hoffmann et al., Chinchilla: https://arxiv.org/abs/2203.15556 | Large-scale pretraining is costly and dataset-intensive: do not assume it is economically preferable to local domain adaptation | Not an actual project cost estimate or an impossibility proof |
| Task-specific domain adaptation | Hugging Face training documentation: https://huggingface.co/docs/transformers/v5.7.0/training | Should native classical NLP fail on verified blind tests, compare it with a replaceable self-hosted open-weights model | No side-by-side model comparison has yet been run |

## Phase122 code, what actually runs

1. `src/phase122_native_question_to_research.ts`: a fully internal bounded IT/EN interpretation of robot-floor-cleaning questions, with established-conversation-context handling, autonomy/performance/value goals, vacuum/mop/combined/undecided scope, personal/general mode, fail-closed negation review, an evidence-obligation registry and deterministic research instructions for missing measurements. It does **not** call a model, a search API or the network. Interpretation is only a hypothesis and cannot self-certify eligibility.
2. `src/phase122_native_local_retrieval.ts`: a small, pure-TypeScript BM25 index over caller-supplied, rights-reviewed local passages. Returns **candidate passages only**, never trusted evidence or a score of product quality. URL and source identity are not authenticated merely by metadata supplied by the caller.
3. `tests/phase122_native_question_to_research.test.ts` and `tests/phase122_native_local_retrieval.test.ts`: bounded unit tests including authentic-style user requests, parity tests, negative intent, insufficient evidence, deterministic behavior, and rights exclusion. An example input is directly adapted from the user's question, but these are **not a blind independent sample**.
4. `scripts/demo-phase122.mjs`: can be run locally with `npm run demo:phase122`. Shows planned tasks with an **empty** evidence set; cannot imply web research occurred.

### Example without evidence: honesty is expected

For **“Quali robot richiedono meno interventi umani?”** with verified ongoing conversation context *floor-cleaning robot* and zero evidence, the system proposes:
- Discover relevant products and variants.
- Verify exact SKU and source identities.
- Find independently reviewed task-quality minimum and original cleaning results.
- Find unattended task-completion and rescue-intervention rates.
- Find measured routine and unplanned human work in minutes.
- Check protocol, exposure, floor type and revision comparability.

Output is `continue_research`; `publicRankingAuthorized=false`, `searchExecuted=false` and `marketExhaustionProven=false`. Without established product context it requests clarification: 'robot' alone can mean more than floor-cleaning devices. If asked about unsupported novel objectives it issues `semantic_review` instead of fabricating an intent.

### The remaining scientific and engineering problems (not solved by the 23 tests)

- **Adaptive intent beyond fixed phrases**: a high-coverage compositional parser needs an independently annotated real-user prompt corpus, ambiguity and negation handling, consistency tests, linguistic generalization and justified fallback decisions. Evaluate an internally trained light classifier / parser first; compare with replaceable local pretrained-language-model assistance only when actual blind-test failures demand it. A full from-scratch general LLM should require an explicit measured feasibility/benefit case.
- **Discovery and licensed collection**: connect the existing Phase68–93 rights-aware source acquisition and search continuation components to requests. Build or reuse replaceable open standards only as warranted; no hosted search dependency. Robots/ToS/source permissions still apply.
- **Source fact extraction**: validate source spans, exact product/model/version binding, methodology and the difference between direct observed outcome and claims. Phase118 exposed a concrete wrong-product source-binding failure; do not ignore it.
- **Novel category-goal research**: a useful system must eventually infer *what should be measured* for a previously unseen category using scientific source-backed category goals, not merely activate hand-written robot goal labels.
- **Evidence adequacy**: a local BM25 hit must not count as a complete original test, a known product must not count as market coverage, and unmeasured autonomy features must not be converted into time-saving estimates.
- **Real end-to-end evaluation**: freeze an independently collected set of user questions, original source documents and expected decision boundaries, including deliberate adversarial samples and sources referring to the wrong products. Hold out questions not used to create the ontology/phrase list and record failures without fixing the test answers by hardcoding their wording.

## Build vs buy decision contract

| Component | Default decision | Condition for external/local dependency |
|---|---|---|
| Intent contract, research planning and abstention | **Build internally** | None justified yet |
| Category/goal ontology and quality policy | **Build internally**, with original scientific sources | Need independent domain experts to audit minimum-performance thresholds |
| Local indexing, search, retrieval evaluation | **Build internally first** | Reuse local library only if benchmarked more accurate/easier to maintain and rights-compliant |
| Web fetching, robots, source policies, text extraction | **Extend existing in-house code** | External code libraries only if they demonstrably reduce complexity; never force paid APIs |
| Product/SKU attribution and evidence consistency | **Build internally** | Third-party prediction can only propose, never silently certify |
| Natural-language generalization | **Start in-house deterministic/classical** | Test an open-weights local model if real blind prompts exceed robust internal methods; do not blindly build a foundation model |
| Product performance, value and autonomy ranking | **Build internally** | Expert-review protocols, source measurements and independent evaluation still required |

**Rule:** program source ownership is not the same as zero dependencies. The objective is to avoid *irreducible external decision-making or runtime services*, maintain replaceable infrastructure, and own the scientific criteria. We should not rewrite mature commodity software merely to claim total independence if that harms reliability.

### Open-wording diagnostic from current conversation (not a blind benchmark)

A diagnostic pass against ten user-style prompts, including exact earlier requests and paraphrases, found that the bounded interpreter can identify the explicit autonomy request but cannot reliably resolve newer task descriptions involving stairs, steam, maintenance burden or open-ended supervision. A request for two explicitly enumerated rankings initially collapsed into `best_value`; this was corrected to `semantic_review` rather than silently assigning a single goal. These observations **do not constitute a representative accuracy rate** because examples were chosen by the developer, are context-dependent and some are fragments rather than self-contained shopping questions. The diagnostic is preserved in `PHASE122-OPEN-QUERY-DIAGNOSTIC.json`.

The intended Phase123 work must first target this generalized learning/gap: **source-backed, compositional interpretation of previously unseen tasks and quality goals**, evaluated against held-out genuine queries. Merely adding phrases for “vapore”, “scalini”, “autonomia” one by one would recreate the original brittle architecture, and must not be presented as a solution.
