# PEE Phase 188 — source-code study and evidence-reasoning reuse decision

**Date:** 12 October 2026  
**Baseline:** canonical `product-evidence-engine-v5.11-phase187.zip`, 2,086 archived entries.  
**Scope:** four exact, user-supplied repository ZIP files, plus GRADE-CERQual and W3C PROV-O official websites.  
**Status:** engineering and research audit only. No code or dependencies imported into PEE, no production rankings made, and no scientific accuracy improvement experimentally demonstrated yet.

## Executive decision

Study and selectively reproduce **principles** rather than install all four frameworks. Phase188 should introduce, in the existing PEE architecture, an **evidence-to-claim reasoning audit** with original-source custody, field-specific warrant, arguments pro and contra, derivation/dependency links, decisive vetoes, uncertainty and explicit abstention. Use Scikit-Criteria as an *external reference* for tests on rank reversals and Pareto dominance. Reserve ASReview for a later, bounded offline screening benchmark after accumulating labelled examples. Defer pgmpy until genuine probabilities, dependencies and validation sets exist. Keep Phase181 and Phase187 review/authorization controls intact.

This follows the user's mandatory requirements: product knowledge grows independently of any cached rankings, original sources and exact variant identities remain traceable, certified specifications can determine bounded technical fit, structured/observational expert evidence is included with contextual warrant, and users' expressed needs change priorities but never scientific facts. The PEE must neither count copied reports as independent evidence nor convert unknown properties into numerical zero.

## Exact repositories inspected, technical points, potential traps

### 1. `carneades-4-master.zip` — **study now, do not install**

- Local license file: `LICENSE` **Mozilla Public License 2.0**; implementation is **Go** (`go.mod` specifies go 1.18) with dependencies including GoCHR, YAML, CouchDB and testify; not a self-contained TypeScript package.
- Source: `src/engine/caes/caes.go` has typed `Statement`, `Argument`, `Premise`, `Issue`, `Scheme`, `Labelling`, and `WeighingFunction`; statuses include `Undecided`, `In`, `Out` (lines 60–68). Schemes have `Premises`, `Assumptions`, `Exceptions` and `Conclusions` (lines 83–101).
- Source: `src/engine/caes/caes.go` shows issue resolution using argument weights (lines 393–430), and selectable proof standards `PE`, `CCE`, `BRD` (lines 103–110), including example numerical thresholds `alpha=0.5`, `beta=0.3` (lines 373–385). **Do not import these legal-style standards or threshold numbers into consumer-product science.**
- Source: `src/engine/caes/weighing.go` includes linked, convergent, cumulative and factorized weighing functions; their existence is not empirical calibration of trust in expert reviews.
- Most useful to PEE: grounded premises, exceptions/undercutters, many-to-one derivations and explicitly undecided claims; represent *why a field conclusion holds or is defeated*. Do not make the argument count determine performance quality.
- Research pages: https://carneades.github.io/carneades/ ; https://github.com/carneades/carneades-4

### 2. `scikit-criteria-master.zip` — **reference benchmark now, no runtime dependency**

- `LICENSE.txt` BSD-3-Clause. Local `pyproject.toml` has version **0.10.0.dev0** (the ZIP reflects a development snapshot, not necessarily a fixed release); demands Python libraries including numpy>=2.4.0, pandas>=3.0.0, scipy>=1.17.0, scikit-learn>=1.7.0. A dependency update could be materially disruptive to the PEE environment.
- Source: `skcriteria/core/dominance.py`, `DecisionMatrixDominanceAccessor`, calculates pairwise/Pareto dominance and supports strictness; useful for veto/robustness checks *after* eligibility and comparability gates.
- Source: `skcriteria/ranksrev/rank_invariant_check.py`, `RankInvariantChecker`, alters suboptimal alternatives to detect changes in rankings despite unchanged decision criteria (lines 200–238). Particularly useful for checking PEE's reproducibility and stability in presence of candidate-set changes.
- Source: `skcriteria/agg/topsis.py` forms weighted matrices, ideal/anti-ideal alternatives and ranks by closeness (lines 37–68). WARNING: the ideal points depend on the candidate set; applying an algorithm mechanically to incomparable measurements, incompatible protocols or missing evidence would confer false precision.
- `skcriteria/agg/electre.py` includes outranking with thresholds; the default values are algorithmic policy choices, not justified universal consumer-product weights.
- Most useful to PEE: offline differential tests, Pareto dominance, rank-reversal and sensitivity probes on admitted equivalent measurement dimensions. Do not change ranking policy just to match another algorithm.
- Documentation: https://scikit-criteria.quatrope.org/en/stable/tutorial/rankrev.html ; https://github.com/quatrope/scikit-criteria

### 3. `asreview-main.zip` — **screening research only, benchmark later**

- `LICENSE` Apache-2.0. `pyproject.toml` Python >=3.10 and separate numpy, pandas, scikit-learn plus UI and other dependencies. Do not add an entire screening web application to PEE hosting to inspect a few documents.
- Source: `asreview/models/queriers.py`, `TopDown`, `Uncertainty` (select predictions near 0.5 or the decision boundary), `Max` (highest predicted inclusion), `HybridMaxUncertainty` and `HybridMaxRandom`. Defaults like 95% relevance/5% exploration are **heuristics**, not scientifically optimal universal rates.
- Source: `asreview/models/feature_extractors.py` uses TF-IDF and encoders; `classifiers.py` includes SVM, RandomForest, NaiveBayes and LogisticRegression.
- Most useful to PEE: select the next records worth reading when a category's search results are numerous and user/auditor labels exist. It is **not a web crawler**, a model-matching engine, a test analyzer or a verifier of claims.
- Must benchmark recall of *decisive* documents, not just faster average screening: a missed negative review about electrical incompatibility is higher cost than a missed cosmetic feature. Use holdout/unseen cases and audit random exploration before any automated discarding.
- Links: https://github.com/asreview/asreview ; https://asreview.readthedocs.io/en/stable/technical/reference/asreview.html

### 4. `pgmpy-dev.zip` — **defer probabilistic integration**

- `LICENSE` MIT. `pyproject.toml` version **1.1.2**, Python >=3.10,<3.15, many dependencies (networkx, numpy, scipy, pandas, statsmodels, scikit-learn etc.); optional torch/pyro integrations. Do not host to assign speculative probability scores.
- Source: `pgmpy/estimators/BayesianEstimator.py` defines Dirichlet, BDeu and K2 priors, with default `equivalent_sample_size=5` (lines 57–84). These are model assumptions and **not evidence that expert opinions deserve 5 virtual votes**.
- Source: `pgmpy/inference/ExactInference.py` implements Variable Elimination, MAP queries etc., which can evaluate a *specified and calibrated* model; it does not discover the right causal graph or validate real product test reliability by itself.
- Most useful later: dependencies between genuinely measurable failure events, causal factors and correlated outcomes, provided empirical calibration, model checks and credible training/validation data exist.
- Link: https://github.com/pgmpy/pgmpy

## The two web-only methodological resources (and Cochrane)

1. **GRADE-CERQual** (official: https://www.cerqual.org/overall-confidence-in-the-evidence/ ): four confidence considerations for *findings synthesized from qualitative research*: **methodological limitations, coherence, adequacy, relevance**. It is not validated as an automatic scoring rubric for a single journalist's impression of a kettle; adapt its questions to PEE and test empirically, rather than describe the result as a certified CERQual grade. Original methodological paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC4624425/ .
2. **W3C PROV-O** (official W3C Recommendation: https://www.w3.org/TR/prov-o/ ): `prov:Entity`, `prov:Activity`, `prov:Agent` and links like `prov:wasDerivedFrom`, `prov:wasGeneratedBy`, `prov:wasAttributedTo`, `prov:used`. Use as a model for provenance/export of measurements, reviews, measurements' parent documents, revisions and decision reasons; **PROV-O establishes an audit representation, not the truth or independence of sources**. RDF triple storage is not a prerequisite.
3. **Cochrane GRADE handbook** (https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14 ): certainty by *outcome* (not a single global grade for an entire product), with bias, inconsistency, indirectness, imprecision and publication bias. Health evidence methods are methodological inspiration, not a consumer-device certification scheme.

## Mapping into existing PEE components (avoid new parallel systems)

| Existing PEE part | Design extension to evaluate | What must remain unchanged |
|---|---|---|
| Phase102/104 original evidence and entity-centred reasoning | Read-only claim/reason graph deriving from original claims | Original source custody; exact variant resolution |
| Phase105–106 dependency and recomputation | Reverse invalidation from modified original measure through derived claims and decision | Version snapshots, no retroactive silent mutation |
| Phase181 `ProductKnowledgeCatalog181` | Reviewed field-specific score input *where truly admissible*, knowledge reused across user needs | Signed reviewed catalog, hard-veto semantics, deterministic recomputation |
| Phase182 `gap_research_orchestrator` | Source-query priority based on missing decisive evidence | No autonomous admission of fetched text |
| Phase183–185 original EPA observation/registry reviews | `Claim` references precise field/row/version/document and evidence type | Registry fact ≠ independent lab comparison |
| Phase186 AC condition-specific sizing | Argument for capacity fit with conditional exceptions (sun, installation, room load) | No blind larger-is-better ranking |
| Phase187 `phase187_field_evidence_bridge.ts` | Explicit field warrants: measured vs certified vs qualitative observed vs manufacturer provisional | Signed policy and source class / protocol compatibility gates |

**Proposed tiny internal schema (conceptual, not implementation):**

```
Claim {id, exactVariantId, fieldId, proposition, unit, context,
       state: supported|contradicted|undetermined|conditionally_supported,
       sourceIds[], independentExperimentIds[], sourceVersion,
       assessmentPolicyRevision}
Argument {id, conclusionClaimId, premises[], exceptions[],
          warrantId, argumentKind: measured|certified|structured_observation|
                        contextual_observation|editorial_interpretation,
          applicabilityScope, derivationIds[]}
Warrant {id, fieldId, eligibleEvidenceTypes[], protocolFamily,
         minAdequacyCriteria, hardVetoCriteria[], reviewerSignatureReference}
```

The claim graph *explains* the reviewed ranker; it is not a second ranked-score generator. No invented probabilities and no global 70/30 expert/test weight.

## Adversarial experiment required before any adoption

1. **Same experiment twice**: lab report and editorial summary of that same test must count as one independent test, not two votes.
2. **Three websites citing one lab**: identical root experiment must be linked to one underlying evidence group; copied praise cannot outweigh a second independent contradictory test.
3. **Review opinion vs measurement**: "works brilliantly" on a carpet cannot negate calibrated debris pickup measurements; expert observation of stair handling may instead be relevant to stair usability.
4. **Manufacturer specification only**: candidate may remain provisionally suitable for an appropriate field; no invented measured performance or categorical dismissal.
5. **Incompatible test protocols**: quarantine comparison; keep candidates visible and identify work needed to reconcile protocols.
6. **Uncertain essential compatibility**: no first-ranked *verified-fit* result unless it passes reviewed gates.
7. **User priority perturbations**: genuinely changed constraints may change ranking; paraphrases with unchanged normalized decision state may not.
8. **Candidate rank reversal**: adding a clearly dominated product, or replacing a worse alternative with an even worse one, should not arbitrarily flip unrelated comparisons when policy promises invariant results.
9. **Preference ranges**: if A outranks B for all admissible weights, explain as robust; if ranking flips, show that it depends on the user's unresolved priorities rather than fabricate a precise single winner.
10. **Withdrawn data**: invalidate affected claims and recompute; historical snapshot stays reproducible.
11. **Unknown model / unknown category**: routed to Phase182 research; do not state market coverage is complete.
12. **Conflicting genuine independent studies**: surface conflict, scope and uncertainty; do not average incomparable outputs.

**Acceptance gate:** a blind comparison with the existing PEE baseline must find demonstrably fewer unsupported conclusions, wrong identities, duplicated-source endorsements and unstable ranks, without trading away coverage or decision speed. Use unseen English prompts and actual legally accessible original sources; fixtures alone are not evidence of scientific improvement.

## Deployment/licence choices

- No repository integrated, copied, installed or imported into core PEE at this stage. Reading the source is allowed subject to each licence; incorporation of protected source code would require respecting corresponding terms and attribution.
- In particular, **do not use Carneades's legal argument proof thresholds**, ASReview's mix ratio or pgmpy's Bayesian prior defaults as unreviewed scientific credibility weights.
- Put a limited comparative test harness in `evaluation/phase188/` only when we have actual reviewed inputs, or start with a minimal original TypeScript prototype with code-level adversarial tests explicitly labelled fictional; do not assert production validity.
- Do not require a graph database, Go microservice, Python service, local LLM or GPUs to demonstrate correctness of the first claim/warrant adapter.

## Integrity / review notes

The current four uploaded archives were inspected directly and not executed. Local source paths above refer to the repository root *inside* the ZIP. Official methodological websites were read online on 12 October 2026. These ZIP snapshots are development branches and not necessarily immutable releases; their checksums are recorded in the companion audit manifest. Versioning, source copyright and dependence on older code must be reviewed before any integration. The material does not prove that adding these concepts increases shopping recommendation quality; that is the hypothesis to test.
