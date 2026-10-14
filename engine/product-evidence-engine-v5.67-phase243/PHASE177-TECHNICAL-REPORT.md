# Product Evidence Engine — Phase177 release report

**12 October 2026 | Canonical successor:** v5.01 / Phase177, based on v5.00 / Phase176.

## Engineering verdict

This release puts PEE's established **website-first product decision model** into an initial, testable code contract, rather than requiring prolonged chat. It does **not** replace historical natural-language or product-review work. It connects the Phase175 request-analysis chain, which reuses scoped-review techniques originally built in Phase154, to an immutable canonical criterion state with explicit user edits, provenance, undo and a read-only web presentation contract. Phase176's cross-turn dialogue machinery is optional; its single-turn quotation handling is reused without making chat mandatory. FastCoref and SGD/SGD-X were reviewed in the supplied archives and remain possible **independent future evaluation** tools, not installed runtime dependencies.

### Implemented code

- `src/phase177_decision_snapshot.ts`: immutable/versioned decision snapshots with typed criteria, distinction among tentative/confirmed/denied/withdrawn/unknown states, importance, task/family scope, explicit user actions, sortable canonical *confirmed-input* fingerprint, tamper-evident hash-chain revision structure, testable diff and single-step undo. The `applyDecisionBatch177` function makes multiple changes from **one** web gesture a single reversible revision.
- `src/phase177_web_intake.ts`: preserves an original English request, word offsets and hash; imports actual Phase175/174/172 provisional need observations into unconfirmed editable suggestions; uses Phase176 for double-quoted scope boundaries; will not overwrite a confirmed UI edit. `unmappedGoalText` retains a request the bounded parser cannot classify. `renderWebDecision177` surfaces uncertainty and essential requirements immediately, without fictional product winners.
- `tests/phase177_web_decision.test.ts`: 56 developer-authored deterministic safety/transition tests. `scripts/demo-phase177.mjs` and `evaluation/phase177/demo-output.json` demonstrate UI revision, changed criteria, and undo without recommending any product.
- `docs/phase177/PHASE177-ENGINEERING-NOTES.md`: technical scope, limitations, source-code/license inventory and engineering backlog.

### Tested behaviors and limits

| Example | System behavior |
|---|---|
| `I need a water filter for PFAS, and replacement filter costs matter.` | Two or more provisional suggestions; atomic single intake revision; no certification or product claim |
| Explicitly confirm the water-treatment criterion | The criterion enters confirmed decision state; ranking remains unauthorized |
| Change confirmed priority and Undo | Confirmed-input fingerprint changes and returns; undo is separately auditable |
| Add a different English wording without changing any confirmed criterion | Confirmed-input fingerprint is invariant, but this **does not prove** the two utterances are semantically equal |
| `A review said "I want to remove lead from tap water".` | Quoted text guarded against promotion to even a default active suggestion |
| `I want to make rigatoni.` | English request retained as unmapped; category mapping is **not solved** |
| `I need a pasta maker to make rigatoni.` | Provisional category-specific research suggestion; still no product veto |
| Hard constraint confirmed in website UI | Shown promptly as user need, but actual product compatibility remains unverified |

**Important:** SHA-256 revision hashes are reproducible integrity checks, **not digital signatures, authenticated identity or server-side access controls**. `rankInputFingerprint` is a canonical key for already confirmed structured values, not a real-world ranking. Production would need signed/authorized events, verified source/protocol/variant/policy binding, privacy and durable storage before recommendations.

### Regression outcomes

- **TypeScript:** 2,588 passing tests in 137 eligible files, 13 isolated groups. Historic quarantined `phase91_watch_gate.test.js` and `phase92_recipe_lifecycle.test.js` excluded consistently with previous releases. No failed eligible group.
- **Python:** 212 passing tests in six grouped commands; historical SQLite `ResourceWarning`s remain present in the companion suite. No claims of stress, model accuracy or UI usability testing follow from these tests.
- **Phase177 targeted:** 56 passing tests, designer-authored, including no automatic NLP confirmation, raw English input retention, citation quote filtering, per-field provenance, immutable changes, input validation and atomic undo.
- Read `evaluation/phase177/regression-ts.json` and `evaluation/phase177/regression-python.json` for exact reproducible group commands/counts.

### Open-source engineering audit and substantive reuse

The user-supplied `fastcoref-main.zip` is **MIT** at repository root and exposes learned coreference clusters/spans; it is relevant to ambiguous references within multi-product reviews but does not verify product identity or expert evidence. `pyproject.toml` includes PyTorch/Transformers/SpaCy-related requirements and no verified production checkpoint is included. No integration has been made. Source: https://github.com/shon-otmazgin/fastcoref .

The supplied Google Schema-Guided Dialogue / SGD-X archive contains annotated task dialogues and semantic schema variants, distributed **CC BY-SA 4.0**, not an independent product-review or PEE user benchmark. SGD-X illustrates robustness to schema wording, but adoption as PEE ground truth would be misleading. Source: https://github.com/google-research-datasets/dstc8-schema-guided-dialogue ; https://doi.org/10.1609/aaai.v36i10.21341 .

Earlier uploaded code continues to inform review-side and source processing: medSpaCy methods are materially reused through Phase154's scoped context; Phase163 relation candidates remain separate from fact admission, and Phase169–171 keep original-source identity/protocol/rights controls. GLiNER2 and DeepKE may support future extraction experiments; OAMine/MAVE/WDC-PAVE support research on product attributes, WDCProducts on deduplication, Snorkel on labeled-data quality, extruct on published structured markup, and VADER on sentiment baselines. None of these imply product suitability on their own. MAVE's uploaded root license is **CC BY-NC 4.0**, which bars casual commercial incorporation. WDC-PAVE root archive lacks a verified root license in our inspection; treat rights as unresolved. See engineering notes for the full per-archive audit.

Relevant research for iterative critiques and comparison interfaces: https://doi.org/10.1007/s11257-008-9057-x ; https://doi.org/10.1007/s11257-011-9108-6 ; https://www.nngroup.com/articles/explicit-differences/ . These motivate comparisons but are **not** empirical verification of PEE's specific UI or efficacy.

### Next work

1. Browser UI for editable, accessible criteria and comparison, built on snapshots, not transcript state. Preserve user agency, ability to reverse course and meaningful feedback controls.
2. Independent source-blind English test set: goal-only needs, multiple products, quoted opinions, changing priorities, missing crucial restrictions and unseen categories. Record missed decisive constraints and mistaken hard exclusions; no leakage from developer rule examples.
3. Specialist verification of need→physical mechanism→test protocol links using original, exact technical sources before any criterion becomes a product veto.
4. Isolated review coreference feasibility comparison on licensed annotated expert-review passages; evaluate FastCoref against the bounded PEE extractor, and measure false device/speaker attribution and runtime resources. Avoid automatic installation.
5. Production server-side authorized revision events and a separate **ranking-input bundle** binding verified criteria + evidence snapshot + policy/version + exact product variant/protocol lineage. No such ranking currently exists.

**Release characterization:** verified incremental software contract, not independently benchmarked language understanding, independently validated recommender, working production website or scientifically certified product comparison.
