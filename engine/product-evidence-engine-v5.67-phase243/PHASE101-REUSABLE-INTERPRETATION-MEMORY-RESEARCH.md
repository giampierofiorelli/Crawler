# Phase 101 — Reusing interpreted professional-review evidence without rereading article text

**Product Evidence Engine, v4.25, 11 October 2026**  
**Status:** Cumulative *research* release, software-tested using invented fixtures. Not a calibrated product-ranking release or independent evaluation on live source pages.

## Verdict

The user's design correction is necessary: **review interpretation is a durable product-evidence asset, not a one-off response to a question**. After an independently assessed professional original test has been read, preserve its claim-level semantic interpretation, exact variant, category, criterion, usage context, original-test identity, methodological conditions, provenance pointers, and calibration status. Answer new queries using those records, without requiring the source article's text or another model call. Keep retrieval/verification outside the hot query path; preserve original source URL, revision SHA-256 and evidence locator for audit and re-verification.

For a one-criterion request such as “show the quieter vacuum cleaners,” do **not** automatically discard noisy products, assign them a low global score, or sort incomparable adjectives as if they were calibrated decibel values. The output may be a *partial evidence-supported order*. For a multi-criterion request, feed independently calibrated levels into the existing Phase98–100 compensatory trade-off modules and apply only user-confirmed genuine hard constraints.

The distinction is material: “a bit noisy” is a *contextual expert observation*, not evidence that the product cannot be the quietest among the available shortlist. Every tested vacuum produces some sound, and a negative observation may be relative to the reviewer's expectations rather than a universal threshold. A soft concern belongs in the evaluated criterion; a true veto requires a separate documented, confirmed user requirement.

## What scientific and standards sources actually support

1. **Different reviewers can use the same verbal category differently.** King, Murray, Salomon & Tandon (2004), *Enhancing the Validity and Cross-Cultural Comparability of Measurement in Survey Research*, American Political Science Review, 98, 191–207. Their *anchoring vignettes* method addresses incomparable response thresholds using common example scenarios. This is evidence for testing source-specific calibration, **not** evidence that a universal translation table of 'rather noisy' to 60/100 can be installed. [Original journal page](https://www.cambridge.org/core/journals/american-political-science-review/article/abs/enhancing-the-validity-and-cross-cultural-comparability-of-measurement-in-survey-research/220C13F13BA152E91A53F794BE3575ED) and [author's explanation](https://gking.harvard.edu/files/abs/vign-abs.shtml).
2. **Pairwise comparisons can be modeled, but not hallucinated from adjectives.** Bradley–Terry and Thurstone methods use actual comparisons of objects. A methodological review, *Diagnostic Framework for the Bradley–Terry Model*, JRSS Series A, discusses their independence/exchangeability assumptions; see [original article](https://doi.org/10.1111/rssa.12959). A historical empirical study compared discriminability scales and found neither model uniformly satisfactory across its six data sets: [Journal of Mathematical Psychology (1966)](https://doi.org/10.1016/0022-2496(66)90010-1). We implement **only a deterministic directed comparison graph**, not Bradley–Terry probability fitting; the latter would require enough independently evaluated pairs and diagnostics.
3. **Keep evidence lineage independently of its original bytes.** W3C PROV links entities, derivations, activities and people responsible for data. It permits audit of a stored interpretation without treating the interpretation as the source itself: [W3C PROV overview](https://www.w3.org/TR/prov-overview/). The [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) describes selectors/targets for identifying spans within a source. This supports our source URL + revision fingerprint + locator pattern; the standards do **not** assert that a SHA-256 digest proves an interpretation correct.
4. **Noise emissions and perceived loudness are different constructs.** [IEC 60704-1:2021](https://webstore.iec.ch/en/publication/62976) documents household-appliance airborne acoustic-noise test principles. [IEC 60704-2-1:2026](https://webstore.iec.ch/en/publication/86833) addresses dry household vacuum cleaners, including operating conditions and accessories/docking stations. [ISO 532-1:2017](https://www.iso.org/standard/63077.html) describes computational methods for perceived loudness under particular listening conditions. A subjective 'irritating whine' observation is not the same variable as a dB(A) sound power measurement, nor is sound power the same as sound pressure at a listener position. Never silently pool these measurements.
5. **Decision criteria may be imprecise, and veto must remain exceptional.** [A review of MCDA approaches (2020)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7970504/) describes indifference/preference/veto thresholds and the influence of decision-maker preferences. [Rogers & Bruen (1998)](https://doi.org/10.1016/S0377-2217(97)00175-6) discusses the difficulty of selecting ELECTRE thresholds with actual consequences and uncertainty. These ideas support differentiating ordinary preference from a documented disqualifier, but do not provide automatic household-vacuum cutoffs.

## Tested implementation

### Source of truth: derived *evidence*, not another recipe catalog

`src/phase101_interpretation_memory.ts` adds `InterpretationMemory101` using Node 22's **experimental** built-in SQLite driver; it does not replace the Phase85 reviewed *extraction-recipe* authority, the Phase93 permission policy, the Phase72 evidence quarantine, or the original-test lineage controls of Phase63/64. This is a separate materialized **reviewed interpretation** repository behind those upstream controls. It must not be filled from arbitrary unapproved model output.

Each structured item stores:

- `categoryId`, exact `variantId`, criterion and `frameId` (same operating context and comparable test frame)
- **type**: `descriptor` (ordinary qualitative observation), `pairwise` (documented relative ordering), `measurement` (value, unit, protocol and uncertainty), or `calibrated_level` (already reviewed mapping to an existing value scale)
- original professional test ID, source URL, source revision/content-span SHA-256, locator, method reference, assessor reference and review timestamp
- event-style withdrawal of obsolete or disputed assertions, without silently overwriting their history

**Not stored:** full original article, lengthy excerpts, arbitrary generated summaries, invented 1–10 sentiment scores, retailer prices, affiliate links, article's overall stars, or instructions from source HTML.

### For a request about noise

`findLessNoisy({categoryId, criterionId:'noise', frameId})` reads only existing reviewed interpretations. It does no browsing and no language-model calls.

- A raw adjective is shown as a warning/observation, but does not by itself create a relative position.
- A professional tester's explicitly reviewed pairwise observation (A quieter than B in comparable conditions) becomes an auditable relative edge A → B.
- Compatible independently measured sound results may create a directional edge only if protocol/unit agree, measurement uncertainty is stated, and a separately reviewed practical-difference threshold is supplied. Disparate measurement units or protocols produce no numeric ranking.
- Contrary expert comparisons, contradictions between stated ties and strict preferences, or multiple unreconciled same-protocol results trigger uncertainty rather than an average or a hidden winner.
- The output comprises supported **relative tiers**, unresolved/incomparable products, products without evidence, claim IDs and source URLs. A tier of disconnected products is *not* evidence that they are equal or interchangeable.
- All registered products remain represented, including those called 'somewhat noisy'. This query contains **no implicit absolute noise cutoff**.

### Reuse in the multi-criterion ranking

`getCalibratedPerformance(...)` retrieves claim records previously reviewed against an explicit criterion scale and produces the existing Phase98 `IndependentPerformanceAssessment` shape. This can be passed to Phase98/100's *research-only* preference-value models, **without the source text or a new model call**. A second unadjudicated level assignment for the same product and criterion is reported as unresolved, never averaged. A descriptive label alone cannot create a calibrated value level.

We do **not** assert that the research-only stored receipts authenticate a real assessor or that a separately supplied scale is scientifically calibrated. The already-established Phase98 value scale requires its own independent validation. The public launch ranking path remains untouched.

## Demonstration, explicitly fictional

Five fictional vacuums in normal mode on hard floors:

- **Alpha:** a reviewer calls it *somewhat noisy*, but directly compares it as quieter than Beta.
- **Beta:** directly compared as quieter than Gamma in a context-matched test.
- **Gamma:** documented as noisier in the comparisons above.
- **Delta:** currently no comparable evidence.
- **Epsilon:** a different review calls it *very quiet*, with no comparable reference.

The correctly limited result is a supported order **Alpha → Beta → Gamma** and an explicitly unresolved position for Delta and Epsilon. Alpha is **not** excluded merely because of its negative descriptor. Epsilon is **not** falsely made the winner because its adjective is positive. No input is a real product measurement, and the graph's ordering assumes the review of frame compatibility is correct.

`examples/phase101-persisted-noise-demo.ts` generates a machine-readable demonstration (also copied into `audit/phase101/constructed-noise-demo.json`).

## Remaining research and operational work

1. **Empirical calibration of reviewers:** collect overlap sets of original hands-on reviews and independently labeled noise perceptions for actual exact variants. Measure which reviewers use 'loud' at different comparable measured/experienced levels. Test whether shared anchor products and contexts improve order accuracy, rather than assigning arbitrary bands across publications.
2. **Evaluate rankings on held-out products:** precision of direction, erroneous comparisons, missed relevant data, agreement of independent adjudicators, and performance under incomplete/contradictory sources. Count blocked and incomparable cases; do not assess only a filtered easy subset.
3. **Scale learned relational graphs:** actual comparison coverage is sparse. Investigate Bradley–Terry or other models only with sufficient independent pairwise judgments, source dependence modeling and fit diagnostics. Do not infer global cardinal utilities from a sparse graph without validation.
4. **Database operations:** the current built-in SQLite API remains experimental; add authenticated reviewer writes, cross-process concurrency, migrations, backup/restore, source invalidation and transaction-safe integration with Phase70 quarantine and Phase82 market watch. Separate source access/processing rights reviews continue to apply.
5. **Broader categories and criterion direction:** this first query adapter handles noise specifically. The data representation supports additional criteria, but their preferred direction, method equivalence and user need mapping must be explicitly reviewed before enabling comparison.
6. **End-to-end proof on real permitted professional sources** is still outstanding. The tests and demonstration use constructed claims, not live acquisitions or a measured user-population validation.

## Reproduction

```bash
npm run test:phase101
npm test
npm run test:companion
npm run test:primary
npm run test:ingestion
npm run test:phase84
npm run test:launch
npm run test:release
node dist/examples/phase101-persisted-noise-demo.js
```

For time-constrained environments, `node scripts/run-test-shards.mjs` exercises all TypeScript/JavaScript test files in five separately supervised groups.

**Software testing is evidence of implemented control behavior on constructed inputs, not evidence of expert equivalence, actual calibration, review-data permissions, live source acquisition, or published recommendation validity.**
