# Phase 58 — Research-only measurement uncertainty audit
**Date:** 10 October 2026  
**Status:** implemented and tested in experimental source code; not public-product capable.

## What was actually implemented
- `src/lab_uncertainty.ts`: accepts the **quarantined original-lab export** and a Phase 57 user-needs ↔ laboratory bridge. It does not retrieve data from any laboratory.
- `src/lab_needs_bridge.ts`: provides exact original measurement record IDs in successful descriptive pairwise comparisons. This prevents using an uncertainty statement about a different test to justify a result.
- `tests/lab_uncertainty.test.ts`: separation, overlap/touch, missing data, mismatched k, altered measurements, publisher identity and malformed/forged metadata.
- `examples/phase58-uncertainty-demo.ts`: invented headphone battery results (20 h vs 19 h, each ±1.5 h expanded uncertainty, k=2); the intervals overlap and the engine **does not select a winner**.

## Scientific reasoning and strict boundaries
The original laboratory must report an *expanded uncertainty* **U**, its coverage factor **k**, and a publication documenting the estimation method and conditions. The conceptual relation is **U = k × u_c**, where `u_c` is the combined standard uncertainty. A stated k=2 **does not, on its own, warrant a universal 95% confidence interpretation**: assumptions, distributions, systematic contributions, and effective degrees of freedom matter.

This module checks whether the two **reported intervals** `[x−U, x+U]` are disjoint or overlap/touch, only for measurements already declared comparable under Phase 57's strict protocol matching. It is **not a significance test** or a quantitative model of P(A>B), because joint covariance/independence, bias, sample design, repeatability and coverage properties have not been established. Overlap also does not prove equality. Even non-overlap does not establish real-world superiority or overall product quality.

Inputs with no reported uncertainty, insufficient publisher documentation, incompatible coverage factors, wrong test identity, wrong unit, bad numeric values, or stale source records are rejected or marked as non-assessable. We do **not** manufacture uncertainty from a single observation or from the number of review sources. An editor's assertion is not proof that publisher or dataset rights are granted.

### Why uncertainty != total evidence reliability
A useful future model must evaluate separately:
1. **Measurement precision/uncertainty:** repeatability, expanded uncertainty and uncertainty budgets, where genuinely reported.
2. **Method validity:** correct measurand, standardized protocol, relevant conditions, calibration and applicability to the user's use case.
3. **Source independence & provenance:** independent labs vs duplicate/syndicated tests, test funding, traceability, source timestamps.
4. **External validity & coverage:** tested model equals marketed variant, wear/fit/environment, small samples vs broader use cases.
5. **Evidence rights:** publication and algorithmic reuse must have documented legal bases; a source URL or CC-looking label is not enough.
6. **Decision fit:** customer values, hard constraints, materiality of any difference, whether needs are confirmed.

These dimensions must not be compressed into an arbitrarily precise 0–100 confidence score. Future decisions may conditionally abstain, explain uncertainty, and ask for user confirmation; model validation with original real data and qualified domain reviewers must precede publication.

## References (primary sources with copyable URLs)
- NIST Technical Note 1297 — Expanded uncertainty, coverage factor and caveats: https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-6-expanded-uncertainty
- NIST TN 1297 Appendix C — reporting measurement uncertainty, method and assumptions: https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-c-nist-technical-communications-program
- NIST Glossary — Expanded Uncertainty: https://www.nist.gov/glossary-term/38251
- NIST Metrological Traceability: https://www.nist.gov/metrology/metrological-traceability

## Verification
```bash
npm test
node dist/examples/phase58-uncertainty-demo.js
npm run test:launch
npm run test:release
python -m unittest discover -s . -p 'test_*.py'
```
The tests use fictional records from `example.org`; **no live professional-feed measurements or commercial data licences were obtained**. Approval for deployment is not claimed.

## Explicit next evidence gates
1. Acquire lawfully at least one original-lab dataset with methods, same-variant metadata and any published uncertainty budget.
2. Have domain experts check comparability and whether errors are systematic/correlated; ensure units and k assumptions are meaningful.
3. Compare outputs to the lab's actual interpretation, and conduct sensitivity analysis across consumer priorities.
4. Validate against actual user decision-making and assess if abstention and limitations are understandable.
5. Only after approvals connect the laboratory research layer to public rankings; keep purchase links downstream.
