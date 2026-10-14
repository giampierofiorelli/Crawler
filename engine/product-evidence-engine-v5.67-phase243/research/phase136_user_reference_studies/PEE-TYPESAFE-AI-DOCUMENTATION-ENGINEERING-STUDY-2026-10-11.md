# Product Evidence Engine — TypeSafe AI documentation study

**Date:** 11 October 2026  
**Baseline:** PEE v4.57 / Phase 133. No software changes, no TypeSafe integration.  
**Priority language:** English only for the current engineering and evaluation programme. Multilingual support deferred.  
**Method:** Review of the official TypeSafe AI documentation and published examples, cross-checked against actual PEE v4.57 source files. Distinguish vendor examples from independently reproduced results.

## Executive engineering decision

**Study TypeSafe's system architecture; do not adopt Jev or TypeSafe's API.** The design principle is valuable: keep workflows, product facts, ranking and side effects inside application code, and use narrow, typed, independently evaluated semantic judgments for the parts deterministic algorithms cannot handle. This is not evidence that Jev is required for PEE, and the Jev API is not a free, locally deployable licensed dependency established by the documentation. It is an externally metered inference service, contrary to PEE's binding product policy.

The most valuable additions to PEE are *candidate/decision decomposition*, *multiple-hypothesis evaluation*, *separate evidence relevance versus entailment*, *trinary entity identity*, *hierarchical beam alternatives*, and *automatic feature-question discovery under frozen evaluation*. These can be implemented natively and selectively; no additional server runtime, vendor package, pretrained weights, or Python ML stack is implied.

## 1. What TypeSafe actually describes

### Architecture
- **State + typed questions** rather than long generated prose. Its model Jev outputs predefined types.
- Three primitives: `Choice` (closed-set choice + distribution + confidence), `Score` (ordered rubric levels + distribution + confidence), `Noul` (binary-claim probability; does not expose a separate confidence in the same way).
- Ask independent atomic questions about the same state, then compose resulting decisions in code, where error handling, thresholds and external side effects remain explicit.
- Supply only relevant state instead of the entire knowledge graph or web document.
- Confidence in Choice/Score is a **summary of distribution concentration**, not proof that the chosen proposition is true. Calibrated empirical accuracy requires a separate held-out dataset. A syntactically typed value can still be semantically wrong.

Sources: [Introduction](https://docs.typesafe.ai/introduction), [How to build with TypeSafe](https://docs.typesafe.ai/concepts/how-to-build-with-system-one), [Confidence](https://docs.typesafe.ai/confidence), [Jev 1.13 jaggedness](https://docs.typesafe.ai/model-jaggedness/jev-1.13).

### Commercial / license warning
The company describes metered token pricing for Jev API queries. Public documentation does not establish downloadable open licensed weights usable for local inference. Documentation is open for reading; this is **not** a license to clone proprietary implementation or weights. Ideas/methods can inform independent engineering, subject to ordinary legal diligence (copyright, patents, trademarks). Do not copy cookbook source without checking individual code licenses.

Sources: [company introduction including price](https://typesafe.ai/blog/introducing-system-one-models-and-jev), [API overview](https://docs.typesafe.ai/api), [legal](https://docs.typesafe.ai/legal).

## 2. What is directly useful for PEE

| TypeSafe recipe or principle | Source technique | Existing PEE capability | Proposed ORIGINAL PEE development | Caution |
|---|---|---|---|---|
| **Atomic typed questions** | Short, single-property criteria; recombine in code | Phase125 question frames, Phase128 category concepts, Phase131 relation labels | Derive a small set of candidate judgments from **reviewed** category schema: evidence relevant? supports claim? explicitly negates it? measurement conditions compatible? | Closed-set answers cannot discover options omitted by candidate generation. |
| **Citation verification** | First verify exact quote exists; then assess contextual support versus contradiction | Phase129 source-span checks; Phase132 negation guard | Distinguish `exact_span_found`, `supports`, `contradicts`, `out_of_scope`, `insufficient_context`; retain source and offsets | Quote existence alone does not establish support or truth. |
| **Knowledge-graph entity alignment** | Candidate duplicates triaged into different, possibly-related, same | Phase104 entity cognition; Phase128 category brain | Native entity triage **different / related-but-distinct-or-uncertain / same**, with manufacturer/model/version/region evidence. No auto-merge merely from name similarity. | False merges contaminate all downstream evidence. |
| **Hierarchical classification** | Keep multiple plausible branches via beam search rather than greedy decision | Phase73/74 category discovery; Phase128 reviewed schema | Budgeted breadth-2/3 category interpretations, preserving alternate subtypes and abstention | Beam score depends on classifier quality and level depth; not evidence of correct taxonomy. |
| **Autoresearch feature discovery** | LLM proposes atomic feature questions, model evaluates, supervised downstream estimator trained and error-driven iterations | Phase130 concept candidate reader; Phase131 local naive Bayes training | **Independently generated / research-derived** candidate quality dimensions; evaluate on frozen unseen category- and source-disjoint splits, promote only reviewed dimensions | Their example calls proprietary TypeSafe and LLMs; scores predict critic scores, not real product quality. |
| **RAG passage classification** | Separately evaluate relevance, usable evidence, contradiction, injected instructions | Phase122 local BM25 retrieval; Phase129 source gates | Between retrieval and knowledge promotion, assess four independent checks, preserving distinct failure statuses | TypeSafe example uses paid embedding and generation APIs; borrow architectural shape, not services. |
| **Reranking** | BM25 shortlist, then specialized pairwise passage scorer | Phase122 local BM25 | Native source/passage reranker constrained to retrieved, verified original texts | Cannot recover a relevant passage omitted from the shortlist; retrieve recall must be measured. |
| **Confidence-gated routing** | Low certainty: review/research; high: propose next step | Phase126/127 clarification and dialogue state; Phase131 abstention | Decision policies depend on **error consequences**: lower stakes allow display, higher stakes require evidence/review. Track raw margin and calibrated error separately. | Confidence of answer distribution is not source certainty. |
| **Self-consistency checks** | Vary prompts/options and check stable decision | Phase112 ranking invariance | Permute option order and paraphrase criteria; if uncertainty changes, escalate, never silently change ranking | TypeSafe admits option-order bias in Jev 1.13. |

Primary docs: [citation check](https://docs.typesafe.ai/cookbooks/citation_check), [entity alignment](https://docs.typesafe.ai/cookbooks/entity_alignment), [hierarchical classification](https://docs.typesafe.ai/cookbooks/hierarchical_classification), [feature discovery](https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery), [RAG passage classification](https://docs.typesafe.ai/cookbooks/classifying_rag_passages), [re-ranking](https://docs.typesafe.ai/cookbooks/rerank_typesafe), [confidence routing](https://docs.typesafe.ai/patterns/confidence-routing), [consistency](https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook).

## 3. A concrete TypeSafe-inspired native workflow for PEE

**Example English question:** "What's the best robot cleaner for high-pile carpet? I don't want a mop, and I care about maintenance more than speed."

1. **Question frame**: Phase125 + derived, reviewed category schema detect category candidate, no-mopping exclusion, carpet condition, autonomy/maintenance criterion, and potentially different meanings of maintenance.
2. **Intent branches**: preserve competing readings (`lowest routine work`, `fewest rescue interventions`, `easiest repair`) until context and evidence distinguish them. Do not force a choice before autonomous research if a general answer is viable.
3. **Research**: Phase122 native BM25 and Phase129 source-research path find original expert reviews and measurement protocols.
4. **Generate candidate statements**: Phase130 reader and Phase131 learner propose `mechanism -> measured outcome under condition` links from exact spans; no new trusted facts yet.
5. **Atomic evidence checks** (our code, no TypeSafe calls): source span authenticated? passage about the exact model/variant? outcome genuinely measured? in-scope floor type? supports or contradicts the candidate? method version comparable? independence/reuse of source?
6. **Native constraint solver**: select a non-contradictory **set of proposals**, distinguishing absence-of-proof from proof-of-absence; unresolved evidence is stored as unresolved.
7. **Review + versioning**: Phase128/129 knowledge only changes after the appropriate reviewed evidence receipts; if the category schema changes, invalidate affected downstream projections, preserving earlier evidence snapshots.
8. **Ranking**: existing deterministic, evidence-governed ranking remains sole authority. Clarification policy (Phases126/127) may ask a *single* useful question only when its answer changes a decision.

**Candidate outcome shape (illustrative original pseudocode; not current implemented PEE output):**

```ts
type AtomicDecision = {
  subjectId: string;
  claimId: string;
  sourceDocumentId: string;
  evidenceSpan: { start: number; end: number };
  label: 'supported' | 'contradicted' | 'irrelevant' | 'insufficient';
  uncertainty: { kind: 'uncalibrated_margin' | 'calibrated_risk'; value: number };
  nextAction: 'review' | 'research_more' | 'retain_candidate';
  rankingAuthorized: false;
};
```

The `uncertainty.kind` field explicitly prevents a raw classifier score from being presented as a calibrated correctness probability. Candidate generation remains open ended; closed-set classification takes place only **after** candidate recall has been assessed.

## 4. Vendor claims versus evidence

**Example TypeSafe claims (not reproduced in PEE):**
- Re-ranking sample: for 40 legal CLERC queries and 3,565 passages, documented top-1 retrieval rises 5% to 18%, top-10 from 38% to 62%; a limited, company-selected demonstration, not a product-review benchmark.
- Entity alignment sample: 450 candidate pairs in two beer catalogs; case study, not evidence of error rates in consumer electronics or model variants.
- Hierarchical sample: beam search finds correct leaf 4/4 versus greedy 2/4 on four preselected examples; far too small for general accuracy.
- Auto-feature discovery: vendor's wine-score example uses 2,000 review notes and reports held-out RMSE improved to 1.77 vs word-count model 2.47; this predicts critics' ratings, not objective performance, and its pipeline uses LLM question generation and TypeSafe evaluation.

**Published caveats by vendor, Jev 1.13:** literal reading, option-order effects, wrong answers on numerical operations and multi-hop inference, sensitivity to irrelevant content, and injection/adversarial behavior. PEE must test the same risks even if its models differ. [Official limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13).

## 5. Evaluation protocol before any code is promoted

**Unit tests are necessary, never sufficient.** Build an ENGLISH original-source benchmark, set aside completely before tuning, with independent labels for:
- model/variant identity and related-vs-same distinction;
- exact document quote, contextual entailment vs negation vs method mismatch;
- source relevance, scope, test protocol/version comparability;
- new category feature proposals versus unsupported inventions;
- multi-sentence relations and hostile source content;
- paraphrase and *order permutation* invariance across equivalent user queries.

Report precision/recall by relation and category, retrieval recall@K, false-merge rate, false-evidence-promotion rate, abstention and human-review workload, plus memory/CPU/latency. Keep thresholds fixed after calibration. The final split must be source-disjoint and product/brand-disjoint to avoid near-duplicate leakage. Do not claim calibrated probabilities from small developer-authored fixtures.

**Minimal runtime commitment:** none. Native TS only; no GLiNER2, TypeSafe, PyTorch, CatBoost, spaCy, Snorkel, DeepKE, remote API or model weights are added by this review.

## 6. Engineering conclusion

TypeSafe documents a highly relevant **control-flow pattern** rather than a freely deployable component: *candidate generation -> narrowly scoped structured judgments -> deterministic composition -> consequence-aware abstention/review*. It complements the lessons already obtained from GLiNER2, medSpaCy, DeepKE and Snorkel. Best next work is to implement one measured TypeSafe-inspired native bridge for evidence checks and alternative hypotheses, while maintaining scientific source and legal review, and then evaluate on original English product reviews independently of the developer-authored fixtures.

No repository source files were changed in this study. The study is not a statement that TypeSafe invented these general NLP/recommender patterns or that its commercial benchmarks generalize to PEE.

## Source URLs (official)

- https://docs.typesafe.ai/introduction
- https://docs.typesafe.ai/llms.txt
- https://docs.typesafe.ai/concepts/how-to-build-with-system-one
- https://docs.typesafe.ai/confidence
- https://docs.typesafe.ai/patterns
- https://docs.typesafe.ai/patterns/confidence-routing
- https://docs.typesafe.ai/cookbooks/entity_alignment
- https://docs.typesafe.ai/cookbooks/citation_check
- https://docs.typesafe.ai/cookbooks/hierarchical_classification
- https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery
- https://docs.typesafe.ai/cookbooks/classifying_rag_passages
- https://docs.typesafe.ai/cookbooks/rerank_typesafe
- https://docs.typesafe.ai/cookbooks/consistency_choice_cookbook
- https://docs.typesafe.ai/model-jaggedness/jev-1.13
- https://docs.typesafe.ai/legal
- https://typesafe.ai/blog/introducing-system-one-models-and-jev
