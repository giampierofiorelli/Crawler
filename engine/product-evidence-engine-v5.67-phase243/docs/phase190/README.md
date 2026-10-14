# Phase190 — bounded robustness of evidence-backed preferences (research only)

Reuses Phase189 manually annotated expert review facts for an engineering replay; extends (does not replace) Phase181/187 policy, signed product identity gates, Phase188 dependency audits and Phase189 context/protocol checks. No third-party OSS dependencies added. The source study included RTINGS, Notebookcheck, and SoundGuys pages; this phase does not claim independent, original-document custody.

## What the new evaluator checks

- The user's task must be marked confirmed by the scenario caller; this **is not** a cryptographically authenticated Phase177 confirmation yet.
- A candidate must have **exact category, variant ID, criterion, versioned test protocol, operating context and unit** in each field; missing cannot be imputed as a zero.
- Mandatory criteria must be supported across the full stipulated measurement interval. Failure cannot be compensated by strong performance elsewhere. Straddling a threshold remains unresolved.
- Any duplicate/conflicting readings of the same field/variant or reused original evidence group across fields are held for review, not counted twice.
- All utility normalizations use **explicit, fixed, separately reviewable** anchors. No pair-dependent or candidate-set-dependent min/max normalization. Out-of-anchor readings hold rather than silently clip.
- User weight scenarios are nonnegative bounded intervals satisfying a feasible **sum-to-one** constraint. The linear minimum and maximum of a pairwise utility difference over a box-constrained simplex are computed by a deterministic greedy method; no guessed one-size-fits-all weights.
- Measurement ranges in experiments are purely illustrative unless the value is an uncalibrated original reported point. They **are not probabilistic confidence intervals**.
- `robustly_*` means invariance over that **analyst-proposed scenario only**, not scientific certainty, global product supremacy, or source admission.
- `publicRankingAllowed` is hard-coded false. This module is **not used for live product rankings**.

## Key limitations

No authenticated original publisher documents, source permissions or signed source review; no lab uncertainty estimates, no calibrated likelihoods, no independent reviewer, no external validating set and no controlled user benchmark. The Phase181 point weights remain unchanged. No external repository has been installed, and no attempt at live web crawling or market completeness is made.

## Reproduce

```
npm run build
node --test dist/tests/phase190_robust_preference_audit.test.js
node scripts/phase190_demo.mjs
```

See `PHASE190-TECHNICAL-REPORT.md` and `PEE-START-NEW-CHAT-PHASE191.md` for next steps.
