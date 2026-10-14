# Product Evidence Engine — Phase 112
## Semantic-equivalence invariance, real professional review evidence and adversarial controls

**Date:** 11 October 2026. **Version:** v4.36. **Status:** implemented restricted research prototype; **not** a production recommender, not a validated general-purpose query interpreter and not a statistically representative user evaluation.

## Executive result

The challenge is correct: **two people who have expressed the same verified decision need must get the same evidence-grounded ranking when all other decision inputs match**. Mere differences in phrasing, language, punctuation, order of synonyms, user identity, or request arrival order must not create different product facts or independent rankings. Conversely, a genuinely changed need **must be allowed** to change the answer. Neither identical top-1 outputs alone nor lexical text similarity proves semantic equivalence.

The prior Phase111 gate checks *candidate interpretations* but cannot prove the underlying interpretations are semantically correct. Phase112 adds a typed canonical interpretation contract; deterministic rankings from an immutable original-test evidence snapshot; a metamorphic equivalence comparator; a deliberately narrow bilingual grammar **that abstains** on unsupported conditions; and a pilot using **actual measurements from four original professional reviews**.

**Result:** Four constructed English/Italian paraphrases of quiet vacuum cleaners *on bare floors* produced identical intent hashes, source fingerprints, rankings and source references. An authentic change of testing surface to *low-pile carpet* changed the relative positions of Dyson V11 and Dyson V15 Detect. An unknown additional `cordless` constraint was rejected rather than silently dropped. Tests are controlled; no observed authentic-user paraphrase cohort or real local model inference was used. No overall product-quality score was inferred.

## Research basis — linkable original publications

1. **Bailey, Moffat, Scholer & Thomas (2017), “Retrieval consistency in the presence of query variations,” SIGIR.** Evaluates consistency over alternate formulations of a need, including a rank-overlap metric. Importantly, consistency and retrieval effectiveness are distinct. https://www.microsoft.com/en-us/research/publication/retrieval-consistency-presence-query-variations/
2. **Bailey et al. (2016), UQV100**: 100 topics, 10,835 collected queries from 263 workers, reduced to 5,764 unique normalized query variants; enables evaluating how a stable information need is phrased by different people. Its corpus and retrieval task differ from our product-ranking domain. https://www.microsoft.com/en-us/research/publication/uqv100-a-test-collection-with-query-variability/
3. **Metamorphic testing/paraphrase invariance**, IEEE/ACM ICSE 2026 paper: equivalent prompts should preserve relevant output semantics; the results in code generation are not estimates of consumer-ranking robustness. https://doi.org/10.1145/3786582.3786809
4. **NIST AI RMF — valid and reliable**: realistic test data, external validity, disaggregated performance and the separation of reliability from robustness. https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/
5. **RTINGS, “How We Test Vacuums”**: original lab's published common test methodology and its explicit distinction between scored/subjective tests and measured quantities. https://www.rtings.com/vacuum/learn/how-we-test

## Original professional reviews in the pilot

Values below were **manually checked from the Noise sections of the live original review pages via web browsing**, not collected through Phase110 automated extraction. They are presented as a small, nonrepresentative engineering pilot, not newly measured scientific results. Each URL is the original review, not a re-published comparison article. These results are **one publisher's four original tests**, not four independent laboratories or a multi-publisher consensus.

| Product as reviewed | Noise on bare floor | Noise on low-pile carpet | Published protocol | Original page |
|---|---:|---:|---|---|
| Tineco PURE ONE S11 | 67.8 dBA | 64.1 dBA | RTINGS v1.4 | https://www.rtings.com/vacuum/reviews/tineco/pure-one-s11 |
| Dyson V11 | 70.2 dBA | 71.4 dBA | RTINGS v1.4 | https://www.rtings.com/vacuum/reviews/dyson/v11 |
| Dyson V15 Detect | 70.5 dBA | 71.0 dBA | RTINGS v1.4 | https://www.rtings.com/vacuum/reviews/dyson/v15-detect |
| Shark Stratos, **tested unit IZ682H** | 74.2 dBA | 75.7 dBA | RTINGS v1.4 | https://www.rtings.com/vacuum/reviews/shark/stratos-cordless |

**Variant warning discovered from a real source:** the Shark article URL/headline prominently says IZ862H but its “Differences Between Sizes and Variants” section identifies the **tested unit as IZ682H**. We use the actual tested unit in our illustration and must preserve this distinction in production.

**Method warning discovered from a real source:** the Samsung Jet 90 Complete review currently states **Methodology v1.3**, whereas the chosen four pages state v1.4. Its measurements must not be mixed into the v1.4 cohort without evaluating method compatibility. Reference: https://www.rtings.com/vacuum/reviews/samsung/jet-90-complete . A test explicitly rejects such a method mismatch.

These are dBA readings in the publication's test circumstances, **not** universal noise levels, subjective annoyance, frequency spectrum, a comparative multi-lab meta-analysis or a guarantee that differences are perceptually important. Full product-variant identity still needs independent normalization for some review models. Neither price, availability nor other aspects of product suitability were used.

### Two original-test noise rankings

- **Bare floor:** Tineco S11 (67.8), Dyson V11 (70.2), Dyson V15 (70.5), Shark tested IZ682H (74.2).
- **Low-pile carpet:** Tineco S11 (64.1), Dyson V15 (71.0), Dyson V11 (71.4), Shark tested IZ682H (75.7).

That V11 and V15 swap positions is *desirable sensitivity to a real criterion-context difference*, not a failure of semantic invariance. The pilot ranks **only the measured noise criterion**, not which vacuum is best to buy.

## Architecture

`src/phase112_semantic_ranking_invariance.ts`:

1. `VerifiedIntent112`: explicit category, criterion, surface, direction, hard requirements, preference-profile reference and verification state; **no identity, prose or discovery query** is a scoring input. `canonicalIntent112` hashes the semantic structure.
2. `EvidenceSnapshot112`: candidate set, measurement records with exact origin/method/unit/context, and immutable evidence revision. Hashes are independent of row order. Stale or different versions are flagged separately from language instability.
3. `rankSameIntent112`: exact, deterministic ranking by measured dBA **within one validated methodology**; no LLM, no invented utility/weight, no auto veto. Missing observations remain listed as unknown; unreconciled independent tests are not averaged; reprints with the same original-test ID do not add votes; numerical ties share a rank.
4. `compareEquivalentRequests112`: compares intent hash, snapshot hash, full ranking and provenance. Identical winner alone is insufficient.
5. `boundedNoiseRequest112`: **intentionally limited** Italian/English controlled grammar to show working paraphrase normalization; unsupported or unknown modifiers, absolute silence and unspecified surface lead to review, never convenient guesswork. This is **not** capable of parsing general shopping requests or arbitrary natural-language paraphrases.
6. `examples/phase112-real-reviews-demo.ts` and `audit/phase112/real-professional-reviews-invariance-pilot.json`: reproducible curated source facts, constructed paraphrases and resulting rankings.

### A stronger invariant for the eventual full product recommender

Let `I(q,u,t)` be a **validated semantic intent** from a question, user-confirmed restrictions and context; `E_v` the versioned *canonical* original-test evidence, `C_v` the candidate-universe snapshot, `P_v` the validated preference configuration and `A_v` the frozen ranking policy. Then require:

`I(q1,u1,t1) = I(q2,u2,t2)`, `E_v,C_v,P_v,A_v` identical => `R(q1)=R(q2)` including tiers, vetoes, unknowns and explanations.

This is a **design/test contract**, not a theorem that the unconstrained model will always derive identical intents. Users' undisclosed preferences, locations, accessibility requirements or unresolved interpretations cannot be silently assumed equal. If underlying evidence legitimately changes, the result may also change — that is not query-language instability. Do not treat a deterministic but scientifically wrong ranking as success.

## Specific adversarial controls built

- Equivalent utterances in two languages and changed syntax yield an identical intent signature, rank and provenance.
- Explicit surface changes invert a real pairwise comparison and are **not** classed as paraphrases.
- Unspecified or mutually conflicting surfaces are not defaulted; clarification/semantic review is required.
- An unknown feature such as `cordless` cannot be deleted to coerce queries into the same frame.
- Absolute silence is not converted into a softer relative noise preference.
- Hidden user preferences cannot be inferred from names or chat wording.
- Changing the evidence revision must invalidate claims of same-snapshot consistency.
- Different ranking due to source method v1.3/v1.4 is not silently treated as comparable.
- Multiple reviews of one original test do not increase evidence weight; contrary observations are not averaged without calibration.
- Missing product evidence remains visible as missing; numerical ties are not given fabricated preference.
- No private ranking or request is written back as a canonical product fact.

## What is still missing / phase 113+ priority

1. **Genuine user-utterance gold set.** Collect independent paraphrases from actual users for real purposes, multiple languages, implicit and explicit constraints, negation, units and context; two independent annotators adjudicate equivalence. UQV100 offers an evaluation precedent, not our data.
2. **General semantic parsing.** Compare a local model's typed interpretation with independently established labels; calibrate abstention and clarification; explicitly record false-equivalence and false-separation rates. The narrow controlled grammar does not solve this.
3. **Full ranking reproducibility.** Extend the contract from measured noise to reviewed Phase98–100 compensatory personalized utility, source quality, noncompensatory hard requirements, tie handling, uncertainty and cold-start queries. The current prototype does not expose this as publication-ready.
4. **Corpus-level metrics.** Exact canonical-frame agreement, top-1 agreement, full-list agreement, rank-biased overlap, false merged meanings, false separated meanings, abstention/clarification quality, and relevance/decision utility (since perfect consistency in bad answers is not success). Confidence intervals and resampling must cluster by *underlying information need* rather than treating paraphrases as independent users.
5. **Independent real-world professional source validations.** Test across publishers, protocols, versions and exact variants; explicit non-comparability, selective extraction, repeated/derived same test, and potential condition differences.
6. **Reproducibility with concurrency.** Freeze candidate scope, product evidence version, policy version, user confirmed constraints and profile version atomically for each comparison; reject results when any component changes in flight.

## Test record

22 Phase112 TypeScript tests passed, including one adversarial protocol-version test and a four-review measurement pilot. Previous project test suites were also rerun in bounded groups. This is **software regression success**, not evidence of accuracy on real natural-language queries or real local model inference.

**Release conclusion:** constrained scientific engineering advancement; canonical product knowledge remains query-neutral. Evidence evaluation and user query interpretation are separate concerns. The contract for *same meaning => same decision* is made explicit and executable, but a general NLP parser and statistical human evaluation remain necessary before a production guarantee.
