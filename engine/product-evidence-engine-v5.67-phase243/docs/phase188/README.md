# Phase 188 — auditable argument dependencies, NOT a second ranking engine

**Baseline**: canonical Product Evidence Engine v5.11 Phase187, 12 October 2026. English-first, cumulative, web-first.

## Boundaries and status

This is a bounded prototype on **synthetic examples**, not a certified reasoner or empirical shopping benchmark. The `src/phase188_evidence_argument_audit.ts` module only evaluates the origin, support, challenge and uncertainty of claims tied to the already-reviewed and signed Phase187 field-catalogue decision. It calls `compareFieldEvidence187` and returns that exact field decision unchanged. It does **not** convert qualitative narratives into quantitative measurements, merge Phase181 rankings, admit raw source data, rank real products, or communicate with the Internet.

The signed Phase188 ledger must be external-reviewer-authorized with an identity/rights audit upstream. It is bound to Phase187 market, category, exact variant, canonical field, usage profile, source URL, original content hash, locator, protocol, unit and catalogue revision. Detached qualitative professional notes are separately classified and never claim to be instruments. Editorial conclusions must link to same-root premises, and derived articles cannot create independent experiments. Ambiguity or conflict produces contest/research gaps, not an arbitrary majority vote. The ledger signature authenticates bytes, not scientific accuracy or copyright permission.

## Implementation / inspiration

- `auditFieldArguments188`: independently signed argument ledger review, version alignment, exact-source/measurement binding, signed Phase187 gate, acyclic derivation, root-experiment grouping, duplicate/origin checking, pro/contra presentation, conservative states, English cautions and research gaps. No new Go/Python services or npm dependencies.
- Carneades 4 user-supplied ZIP: `src/engine/caes/caes.go` (premises, exceptions, issues, undecided claims). We copied no source or numeric proof threshold.
- Scikit-Criteria user-supplied ZIP: `skcriteria/core/dominance.py` and `skcriteria/ranksrev/rank_invariant_check.py` (future differential tests), not installed.
- GRADE-CERQual methodology: https://www.cerqual.org/overall-confidence-in-the-evidence/ ; prompts on methodological limitations, coherence, adequacy and relevance, **not** a validated product-review grading algorithm.
- W3C PROV-O: https://www.w3.org/TR/prov-o/ ; derived-from, original artifacts and reviewer activities as a conceptual data model, **not** a claim truth validator.
- ASReview / pgmpy ZIPs: deferred for offline screening / genuinely calibrated probabilities respectively.
- Source inspection and licensing: `PEE-PHASE188-FOUR-REPOSITORIES-SOURCE-AUDIT-2026-10-12.md`, included at archive root.

## Tests and limitations

`npm run test:phase188` (36 adverse cases, all synthetic). These cover source identity, forged signatures, stale reviews, protocol differences, threshold direction, copied editorials, mixed source roots, cyclic derivations, source disagreement, provisional manufacturer claims and no evidence.

**Not proven:** agreement with human experts, reliability of external review, useful distinctions across real expert reports, precision/recall of product identity resolution, probabilistic confidence, soundness on real use cases, empirical reduction in wrong recommendations, or first-response ranking. Phase188 does not establish a production UX or source-discovery system. Methodologically independent tests require access to original lawful documents and a blinded benchmark versus Phase187, with explicit ablations.

**Next:** Phase189 should use a small genuine legal original-source pilot to assess this argument layer against the unchanged Phase187 baseline; attach to Phase177 confirmed decision-state and the website only after independent evaluation. Include real measurement/qualitative joint examples and protocol conflicts without silently publishing ranked recommendations.
