# PEE v4.78 / Phase 154 — Original open-source reuse, context graphs and signal diagnostics

Date: 11 October 2026. Baseline: user-provided v4.77 / Phase 153 cumulative release. Implementation language: English-first TypeScript.

## Why this phase differs

This phase directly inspects **all four original GitHub source ZIPs supplied by the user**, copies real upstream implementation files and their licences for provenance, and ports functional algorithms rather than merely describing concepts. The four entire original ZIPs are also preserved in the cumulative release, so later phases do not need the user to re-upload them. No web download replaced the originals.

### Upstream source material and integration disposition

| Uploaded codebase | Licence found in archive | Original code inspected / retained | Operational result in PEE |
|---|---|---|---|
| medSpaCy, https://github.com/medspacy/medspacy | MIT, © 2020 medspacy | `medspacy/context/context_graph.py`, `context_modifier.py`, `context_rule.py` copied verbatim into `third_party` | Adapted scoped directional trigger matching, termination, pseudo suppression, overlap and target constraints in `src/phase154_context_graph.ts` |
| Snorkel, https://github.com/snorkel-team/snorkel | Apache-2.0 | `snorkel/labeling/analysis.py` and its original `test/labeling/test_analysis.py` copied verbatim | Adapted LFAnalysis vote matrix, abstention, polarity, coverage, overlap, conflict, empirical accuracy when external gold is supplied in `src/phase154_label_diagnostics.ts` |
| GLiNER2, https://github.com/fastino-ai/GLiNER2 | Apache-2.0 | Original archive and full relevant prior technical studies retained, including classification/constraint schema source | Not incorporated at runtime: model-based NER cannot be recreated by copying lightweight utilities without weights and transformer runtime |
| DeepKE, https://github.com/zjunlp/DeepKE | MIT | Original archive and full relevant prior technical studies retained, including document-relation extraction source | Not incorporated at runtime: typical components depend on model frameworks/checkpoints and have yet to pass local runtime cost and licence-dependency assessment |

### Executable pipeline

`analyzeEnglishProductDocument154()` invokes Phase153’s existing source-hash-checked candidate inventory, then applies a port of medSpaCy ConText graph semantics to evidence spans and a Snorkel-like label-function diagnostic matrix. It exposes results through `src/index.ts`, but **requires explicit invocation**. The production launch pathway is unchanged. No new ML model, server, API, JavaScript/browser-based attribution banner, model weight, commercial source, ranked product, approved evidence or database record is introduced.

Context scopes support FORWARD, BACKWARD, BIDIRECTIONAL, TERMINATE and PSEUDO; per-rule scope and target limits; allowed/excluded target kinds; overlapping trigger suppression; category-specific termination; source offsets. Product-specific configurations include `did not test`, `was not tested`, `excluding`, `compared with`, `but`, and clause boundaries. The vocabulary is small and *not* a claim of robust general language understanding. The context result remains an **unverified linguistic interpretation**, not a verified experimental result.

### Substantive correction exposed by comparison

Phase153 may extract `Excluding Kenwood MultiPro Compact` as a commercial candidate and incorrectly scope EXCLUDED_FROM_TEST to the following `Philips Airfryer Dual Basket`. Phase154 now records a **separate contextual target** `Kenwood MultiPro Compact`, preserving the original Phase153 source span, and terminates the exclusion at the comma. The exclusion no longer attaches to Philips. It also links backward `was not tested` to `Sage Barista Touch` rather than incorrectly applying it to the following sentence. Both behaviours have dedicated tests.

### Test and integrity results

- TypeScript builds with the original, existing `typescript` and `@types/node` development dependencies; **zero new runtime dependencies**.
- Phase154 focused: **12/12 passing**. The Snorkel portion includes numerical expectations directly taken from its upstream test fixture.
- Cumulative eligible TypeScript group results after this modification: shards 1–7 and 9 plus the safe subset of shard 8: **2,023 passing tests**. Historical Phase91/92 suites remain excluded, as in v4.77. A whole-suite runner attempt timed out at the legacy-heavy shard before group-wise verification; this is **not** a passing whole-suite single command.
- Python: primary 47, ingestion 21, Phase133 probe 9: **77 passing**. First attempt at primary tests without `-t .` failed to import relative modules; corrected invocation passed; no source change was necessary.
- Baseline Phase153 targeted test 36/36 and Phase152 24/24 were rerun after integration.
- `PHASE154-CONSTRUCTED-DIAGNOSTIC.json` contains five developer-chosen scenarios and observed per-call latency in this environment. It is **not blind**, **not source-disjoint**, contains **zero independently annotated original full reviews**, and must **not** be treated as precision/recall.

### Known limitations and next evidence gate

1. This is a real multi-capability executable document analysis pipeline but remains opt-in; no automatic live research intake, canonical-evidence writing or ranking is connected.
2. PEE still misses `iRobot Roomba j9+` as a complete product span in the selected challenge. Phase154 context interpretation cannot repair a missing name boundary on its own.
3. English lexicon coverage is partial; negations, coordination, comparison, parentheses, tables, paragraph segmentation and genuine long documents need dedicated, independently evaluated cases.
4. The port is feature-selective: these TypeScript implementations do **not** replicate the whole medSpaCy or Snorkel ecosystems or an ML extractor.
5. Labeling-function metrics describe **agreement between correlated heuristics**. They do not prove correctness and they are never interpreted as probabilities.
6. Upstream licences and copyright notices remain in technical files. No visible public-site acknowledgement is needed for the present server-side use, but distribution and public browser bundles should be legally checked before shipping.

### Why the full source ZIPs are included

The user originally supplied large source archives expressly to avoid months of reimplementing code. The four exact original archives, not downloaded replacements, are now part of this cumulative release (`research/upstream_source_archives`). The selected extracts and licences sit in `third_party`, while custom TypeScript ports in `src` are actually executable. This ensures further engineering can reuse the rest of the original code directly.

## Relevant original source URLs

- https://github.com/medspacy/medspacy/tree/master/medspacy/context
- https://github.com/snorkel-team/snorkel/tree/main/snorkel/labeling
- https://github.com/fastino-ai/GLiNER2
- https://github.com/zjunlp/DeepKE

All precise source assertions here are based on the **uploaded archives**, not on the current state of those external URLs.
