# Product Evidence Engine — Phase 103
## Evidence convergence, product-card agreement, and rigorous audit of the knowledge engine

**Date:** 11 October 2026  
**Build baseline:** v4.26 / Phase 102. **Target:** v4.27 / Phase 103.  
**Status:** A working deterministic evidence-convergence prototype and a methodological audit, **not a calibrated or production-verified consensus estimator**.  
**Scope:** Independent original professional product tests, qualitative findings, contextual measurements, and reuse of verified interpretations. No universal product-quality score, no arbitrary expert-polarity weights, no market-wide truth claims.

## Executive verdict

**The Phase 102 architecture is not complete.** It already gets three difficult boundaries right: original tests are counted instead of duplicated articles; conflicting reports and incomparable contexts are preserved; and query-time reasoning can work without original review bodies or a language-model call. But it does **not** yet fully address the user's new question: "How much do original professional tests actually agree on this product, in what respects, with how much coverage, and should that change the recommendation?"

A trustworthy system must represent at least **four dimensions separately**:

1. **Directional/result convergence:** genuinely independent tests conclude the same thing about the *same outcome in a comparable context*.
2. **Evidence confidence:** methods, repeatability, provenance, precise outcome measurement, quantity/richness and representativeness support the conclusion. Agreement alone does not establish accuracy.
3. **Coverage and selective reporting:** the catalogue may not include every test, and a review's silence on noise/reliability is not neutral or positive evidence. We currently cannot identify every test that *examined* a criterion but did not publish a result.
4. **Relevance to the request:** normal versus turbo mode, hard floor versus carpet, glasses versus no glasses, and long-term use versus a short test may generate legitimately different experiences.

**Recommendation for the product sheet:** Provide a transparent overall *evidence landscape* and expandable **criterion × context agreement map**. Avoid a single unvalidated “expert unanimity: 87%” badge or an automatic agreement bonus to ranking. Present an evidence inventory such as “4 criteria with directly convergent results; 2 with material disagreement; 3 without reviewed evidence,” stating the chosen denominator and the coverage of the actual acquired material. Such counts are descriptive, not a percentage probability.

## What the verified external methods actually support

### Original study versus report
Cochrane Handbook, Chapter 4, Section 4.6: multiple publications must be collated into the **underlying study**, and secondary reports may provide useful information without becoming additional independent experiments. Exact source: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04 . Adaptation: `originalTestId` is the evidence unit, subject to audited lineage; multiple URLs to the same lab execution cannot increase independent support.

### Consistency and heterogeneity, with a critical restriction
Cochrane Handbook, Chapter 10: differing effect estimates, protocols, uncertainties and between-study variation require investigation; small I² values or overlapping intervals do not imply universality. It is **wrong to calculate I² from words such as “fairly noisy” or from incompatible sound pressure/sound power measurements**. Exact source: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10 . When genuinely comparable quantitative estimates and uncertainties exist, appropriate measurement agreement or heterogeneity analysis may be justified.

Bland & Altman (1986) show that correlation is not a measure of interchangeability between measurement methods. Before translating tests on different instruments or protocols onto one scale, study systematic difference and agreement limits with suitable paired observations. Exact DOI: https://doi.org/10.1016/S0140-6736(86)90837-8 .

### Qualitative finding: coherence is not simply headcount
GRADE-CERQual asks for methodological limitations, relevance, coherence and **adequacy of information** at the level of an individual qualitative synthesis finding, rather than an organisation-wide average. Importantly, an analysis of its use identified the mistaken reduction of **coherence** to agreement "within and across studies" as a common error; coherence asks whether the synthesis explains the underlying evidence, including diversity and exceptions. These concepts come from health/social intervention research, not validated consumer-review scoring. Sources:
- Lewin et al. (2015): https://pmc.ncbi.nlm.nih.gov/articles/PMC4624425/
- CERQual coherence methods: https://pmc.ncbi.nlm.nih.gov/articles/PMC5791039/
- Evaluation of fidelity (2023): https://pmc.ncbi.nlm.nih.gov/articles/PMC10369711/
- CERQual adequacy: https://pmc.ncbi.nlm.nih.gov/articles/PMC5791045/
- CERQual relevance: https://pmc.ncbi.nlm.nih.gov/articles/PMC5791042/

### Vote counting is a *description*, not a verdict
Cochrane Handbook, Chapter 12, §12.2.1.3: a directional count is sometimes permissible when studies report only direction, but it **does not express magnitude or account for differing study sizes**. It is misleading to vote-count the presence of statistical significance and unjustified to convert 4 favourable to 1 unfavourable finding into "80% chance the product is good". Source: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-12 . Product display may show fully contextualized numbers of independently reported results and all opposing observations.

### Confidence is not a popularity score
Cochrane/GRADE assess confidence **per outcome** using risks of bias, inconsistencies, indirectness, imprecision and selective dissemination. High agreement from weak or correlated methods may yield weak confidence; a few directly applicable, well-conducted original tests may be more decision-relevant than a chorus of poorly documented opinions. Source: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14 ; overview: https://book.gradepro.org/guideline/overview-of-the-grade-approach (updated 6 October 2026).

### Dependence of findings and reviewer effects
Correlated outcomes reported by the same underlying test should not be treated as independent replications. Multilevel/meta-analytic methods explicitly account for dependence when adequate inputs exist. Source: https://pubmed.ncbi.nlm.nih.gov/25361866/ . This does **not** license fitting a multilevel model to a handful of qualitatively different product-review phrases.

Krippendorff's alpha or similar coding-reliability measures can evaluate whether independent *human labelers* consistently interpret the same professional review material; they should not be confused with the substantive agreement of independent product testers who observed different devices or conditions. Relevant reference: https://www.asc.upenn.edu/krippendorffs-alpha-reliability .

### Absence and missing evidence
Missing a negative observation can result from limited coverage, selective reporting, publishing access, or no testing at all. None may be assumed from silence. See Cochrane Chapter III on reporting and missing outcomes: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-iii and GRADE dissemination bias: https://book.gradepro.org/guideline/dissemination-bias .

## The intended product-card design

**Top line:** “Quadro dei giudizi professionali” with exactly scoped coverage: number of *distinct original tests* linked to that exact product version, number of assessed category/criterion/context frames, and number without recorded conclusions. Clearly state if not all independent reviews in existence are known to the system.

**Next:** per-criterion rows, each with its own **context**, e.g.:

| Characteristic & conditions | Descriptive finding | Evidence basis | What user sees |
|---|---|---|---|
| Vacuum cleaning, carpet, normal mode | Consistent calibrated favourable result | 4 distinct original tests, agreed scale | “Concordant under tested conditions”; tap for methods/sources |
| Noise, carpet, turbo mode | Calibrated results differ | 3 distinct original tests | “Experts disagree”; show each measurement/observation and conditions |
| Noise, hard floor, normal mode | Only one original test | 1 test | “One documented test”; neither unanimous nor uncertain by numerical fiat |
| Long-term durability | No reviewed finding | Unknown | “Not enough verified information”; do **not** display positive/neutral |
| Comfort, long sessions | Agreement across original testers | Qualitative with approved reference scale | “Convergent for sessions like those tested”; do not generalize to all users |

**Optional overall portrait:** “4 aspects with convergent evidence; 1 with disagreement; 2 with insufficient or missing evidence.” This is a **descriptive inventory of explicitly configured frames**, not a universal truth or percentage based on editor star scores. If only one aspect has been examined, the card must make that clear. A product may have unanimous agreement that a criterion is *bad*, not only good.

**Ranking implication:** Performance and personal preference remain from Phases 98–100. Evidence agreement affects the trust/uncertainty of the criterion-specific inference, and may motivate abstention or further acquisition. It should not add a second “consensus bonus” to the outcome score, because that would double-count the same positive test results. Negative qualitative findings remain legitimate inputs to preference trade-offs, with veto only for an explicitly non-negotiable user requirement shown to fail under applicable tests.

## Built in Phase 103

`src/phase103_evidence_consensus.ts` integrates without rewriting Phases 96–102 or bypassing the Phase 101 immutable SQLite evidence memory.

- Reuses `reasonOverEvidenceFrame102` to validate context, exact variant and the hashed evidence snapshot.
- Works entirely from approved, preinterpreted stored claims; no article HTML/body, source-text access, Ollama or other LLM calls during a query.
- Counts distinct `originalTestId` rather than claim or publication frequency; preserves raw claim counts only as an explicitly different diagnostic.
- Recognizes: no recorded evidence; a single original test; consistent levels from at least two distinct original tests using the exact same calibration reference; discordant levels; incomparable scales; intervals; conflicting claims *within the same original test*; descriptive-only evidence; and measured values without a validated agreement/equivalence analysis.
- Exposes measured values **grouped by unit, metric and protocol**, never silently merging different methods.
- Preserves reviewer-specific qualitative descriptors without mapping adjective frequency into a universal score.
- Builds a multi-criterion, multi-context product profile with separate coverage, consistent, disputed, and unassessed frame lists, and an intentionally `null` overall consensus score.
- Exposes per-pair directional evidence counts from the existing Phase 102 comparison ledger without inventing magnitude or a probability of truth.

**What has NOT been implemented:** globally calibrated reviewer-severity models; signed reviewer approval identity; a complete coverage registry of what every external test actually examined; a validated overall confidence classifier; CI or I² on raw qualitative reviews; automatic public ranking impact; high-scale production database migrations; actual licensed real-world expert review corpus evaluation; independent gold validation of the new code.

## Architecture QA: what remains open after this phase

| Priority | Finding in v4.26/v4.27 | Risk / remedy |
|---|---|---|
| **Critical** | `SourcePointer` carries asserted `originalTestLineageReviewed` and other boolean receipts, not an authentication proof on its own | Production must verify provenance, source corrections and independent original-test identity against authenticated attestations and execution IDs |
| **Critical** | Product test **coverage denominator** is unknown: an acquired article with no stored noise claim might never have tested noise, or might have a result omitted during extraction | Add an explicit test-by-criterion coverage register: observed, tested-not-reported, article-not-processed, not-tested, extraction-failed, not-applicable, unknown; never silently assign 'neutral' |
| **Critical** | No blinded cross-publisher benchmark of expert-style observations or independent calibration data | Annotate actual original tests, hold out publishers, compare agreement and false conclusions to human adjudication; include disagreement due to conditions |
| **High** | Qualitative memory ontology has a narrow illustrative set of noise descriptors, not a complete category-general ontology with polarity, intensity, conditions and functional consequence | Expand versioned criterion ontology; record adverse and favourable *finding meaning* (not just adjectives), model qualifiers, negation and test setup |
| **High** | Two genuinely original tests can still have highly correlated or shared methods and systematic errors | Model tester/publisher method family, instrument/protocol lineage and conflicts of interest separately from independent execution IDs |
| **High** | No verified, calibrated way to translate heterogeneous levels onto a common scale | Collect anchor observations, estimate rater/publisher calibration only where overlapping data identify parameters; evaluate on publisher holdouts |
| **High** | `frameId` is a single exact equality key and can over-fragment contexts that could legitimately be bridged | Introduce independently reviewed context compatibility graphs with explicit transformations and error bounds; default no bridge |
| **High** | Existing experiment can describe independent level agreement but cannot calculate the degree of effect or perceptual importance from words | Keep context-aware qualitative scale anchors separate from utility elicitation and context-specific veto conditions |
| **High** | Absence of critique in a review can be mistaken by downstream product-card UX for praise | UI must show 'not documented' instead of neutrality or consensus, and expose analysed-source coverage |
| **High** | Cross-criterion dependence and correlated sources may cause double counting in product-level trust/ranking | Never aggregate raw occurrence counts; add evidence-family/criterion graph and independence review |
| **High** | Reviewer agreement metrics such as Fleiss κ/Krippendorff α are inappropriate unless same items and a defensible coding scheme were used | Restrict statistics to independently coded common items; evaluate prevalence, missingness, nominal/ordinal distance and labeler selection |
| **Medium** | Time dependence: firmware updates, product revisions, source corrections can change findings | Version observations by tested SKU/revision, test time and protocol; revalidate or retire stale claims without rewriting history |
| **Medium** | A product-card “confidence” badge could overstate meaning of concordant results | Show evidence bases, disagreement, extent and limits; calibrate any badge empirically before deployment |
| **Medium** | No validated quantitative protocol agreement | Where paired compatible measurements exist, assess repeatability/bias, Bland–Altman limits or heterogeneity/prediction intervals only if assumptions justified |
| **Medium** | Static deterministic queries may be slow over huge product catalogues | Promote a materialized validated read model with revision invalidation, per-user ranking separate from source claims |

**An important subtlety:** data-quality/consensus and predicted product quality are different estimands. A high degree of consensus *that a product is loud* is valuable negative evidence for a buyer seeking quietness. The consensus level should not itself make the product more attractive.

## Recommended empirical validation (not completed)

1. Choose two contrasting domains: vacuum noise (measurable acoustic construct) and long-wear headphone comfort (person-dependent construct). Pre-register unit of analysis, expected frames, criteria and what is a comparable source.
2. Select an evidence corpus from legitimately usable original professional reviews; record unknown/unavailable/non-extracted outcomes as part of the denominator for retrieval and coverage evaluation. Do not generate reference labels with the same LLM being evaluated.
3. Independently label each source for exact variant, independent test ID, setup, adverse/favourable observations, strength of claim, numerical measurement, reviewer comparison, “not tested”, “not reported” and contextual qualifiers. Human adjudication plus inter-annotator reliability on shared items.
4. First evaluate *what was captured* (claim precision/recall, wrong variant, missing negative points, source reproducibility, deduplicated original tests). Then evaluate convergence labels against an adjudicated gold set and assess false-unanimity specifically.
5. Challenge the system with: 2/2 agreement versus 12/15 agreement; 4 syndicated pages from 1 original test; opposite findings in different modes; missed adverse findings; different levels with the same word; contradictory exact-level claims within one original test; large well-conducted versus many low-quality reports; a severe problem but only in a context unrelated to a particular user.
6. Next measure what actually matters: decisions with and without consensus metadata, calibration of declared uncertainty, user choice stability, wrongful exclusion rates, ranking reversals, and whether product-card readers understand the evidence limitations.
7. Separate product interface from research model until the quality and usefulness of the feature are independently demonstrated.

## Reproduction

```bash
npm run build
node --test dist/tests/phase103_evidence_consensus.test.js
# For cumulative tests, run package scripts or compiled test shards separately.
```

The newly added tests use constructed product comparisons; passing them demonstrates deterministic software behavior only, not real-world precision or expert consensus accuracy. Claim numbers in examples are constructed, not findings about existing products.

## Scientific references (accessible URLs)

1. Cochrane — study vs. report lineage: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-04
2. Cochrane — quantitative heterogeneity and uncertainty: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-10
3. Cochrane — synthesis without meta-analysis and directional vote count limitations: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-12
4. Cochrane — certainty by outcome: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-14
5. Cochrane — systematic reporting of synthesis: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-iii
6. Lewin et al. (2015), GRADE-CERQual: https://pmc.ncbi.nlm.nih.gov/articles/PMC4624425/
7. CERQual coherence paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC5791039/
8. CERQual fidelity evaluation: https://pmc.ncbi.nlm.nih.gov/articles/PMC10369711/
9. CERQual adequacy paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC5791045/
10. CERQual relevance paper: https://pmc.ncbi.nlm.nih.gov/articles/PMC5791042/
11. GRADE handbook overview, updated October 6, 2026: https://book.gradepro.org/guideline/overview-of-the-grade-approach
12. Bland & Altman, measurement agreement: https://doi.org/10.1016/S0140-6736(86)90837-8
13. Multilevel meta-analysis with dependent outcomes: https://pubmed.ncbi.nlm.nih.gov/25361866/
14. UPenn / Krippendorff — coding reliability: https://www.asc.upenn.edu/krippendorffs-alpha-reliability
15. Publication/dissemination bias: https://book.gradepro.org/guideline/dissemination-bias
16. W3C PROV: https://www.w3.org/TR/prov-overview/
17. NIST AI RMF measurement: https://airc.nist.gov/airmf-resources/playbook/measure/

**Final review stance:** The v4.27 software adds an important truthful *display and inference substrate*, not a scientifically calibrated expert-equivalent agreement measure. No sound methodology can promise that nothing will ever be improvable; future findings, missing evidence and bias must remain first-class records in the system.
