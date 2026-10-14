# PEE v4.85 / Phase 161 — Persistent local neural worker and reproducible audit

**Scope:** preserve Phase160's 1–100-document source-hashed batch pipeline; add an **opt-in, long-lived offline worker** and a stricter model-to-PEE intake. English-first, no public website change, no neural weights, third-party repository copies or hosted inference service in this release.

## Result and boundaries

**Executable and tested:** `scripts/phase161_neural_worker.py` can keep one model instance loaded while watching a local directory for jobs. For each operator-authorised batch it (a) checks source/rights declarations, (b) requires locally available model files and matching SHA-256 inventory, (c) runs the Phase160 GLiNER2.5 overlap-window adapter, (d) caches source-bound hypotheses by **checkpoint fingerprint + algorithm source digest + schema + document hash**, (e) isolates document inference failures, and (f) emits separate candidate predictions and conservative provenance/audit records. `scripts/phase161-coordinate.mjs` checks the worker's audit, exact source digests and safety flags before passing candidates to the existing Phase160 PEE review orchestrator. The TypeScript API also now requires the corresponding audit whenever the report claims to come from the offline worker.

**Not executed:** the GLiNER2.5 trained checkpoint **has still not been installed or loaded inside this environment**. No new pretrained neural inference, accuracy/recall claim, performance per full professional review or independent gold evaluation is asserted. We tried accessing Hugging Face via container HTTP on this run; hostname resolution failed. `gliner2` is not installed locally. Model checkpoints and full publisher-review material are deliberately absent from the ZIP.

The worker is an internal, configurable component. It is **not yet a deployed, monitored production service**; an appropriate operator-controlled inference host with a downloaded and reviewed checkpoint is necessary to run it for real. Its directory watch mode remains active within a single process, loading the model only once for successive jobs. The code does not start a public HTTP server or connect to a paid API.

## Components and reuse

| File | Capability | Security / scientific limitations |
|---|---|---|
| `scripts/phase161_neural_worker.py` | SHA-256 checkpoint inventory and operator lock; offline model load once per process; source-bound 100-document job validation; persistent local cache; watcher mode; atomic JSON reports | Operator attestation does **not** independently certify checkpoint origin or legal rights. Real model execution unavailable in this development environment. |
| `scripts/phase160_gliner_batch.py` (reused, unchanged) | Real existing source-bounded windowed inference and UTF-16 offset conversion, when a model is supplied | Candidate truncation/offset errors cause rejection rather than being silently treated as full coverage. |
| `scripts/phase161-coordinate.mjs` | Validates neural report against worker audit and original Phase160 manifest; refuses different hashes, missing/extra cases, false authority flags and overwrites | Audits are local technical receipts, not independent authentication or gold labels. |
| `src/phase160_batch_review_pipeline.ts` | Requires Phase161 worker audit before accepting locally reported neural hypotheses; retains per-document quarantine and native fallback | No automatic canonical writes, ranking changes, scientifically established product identity or approved measurements. |
| `src/phase159_colab_gliner25_coordinator.ts` | Supports `local_offline_worker_not_connected_to_PEE` alongside legacy genuine Colab responses; distinguishes external worker provenance | The pretrained model is not running in the TypeScript PEE process; all candidates remain unverified. |
| `tests-python/test_phase161_neural_worker.py` and `tests/phase161_local_worker_bridge.test.ts` | Offline fake-checkpoint and extractor tests, CLI tamper tests, watcher, cache, UTF-16 validation | These tests are **simulation/contract tests**, not a claim about GLiNER2.5 neural quality. |

All previous cumulative TypeScript and Python functionality remains. The Phase137 original-source blind annotation workflow and Phase150 source-disjoint benchmark safeguards remain the required route for any independent semantic-performance claims; this release does not invent gold annotations.

## Execution on a future trusted inference machine

**One-time preparation:** obtain model weights from <https://huggingface.co/fastino/gliner2.5-small-v1>, review the exact license/revision and its dependencies, and store the checkpoint outside the PEE source/ZIP. The public model advertises Apache 2.0, but that is not a substitute for reviewing the actual downloaded artifact. Install compatible `gliner2`/PyTorch dependencies in the *worker* environment only; the PEE TypeScript server does not require them. Review RAM/CPU/GPU and storage needs on the actual host before scheduling jobs.

```bash
# Inventory files without model loading or internet access:
python scripts/phase161_neural_worker.py \
  --model-dir /private/models/gliner2.5-small-v1 --inspect-only
```

After manual review, create a private JSON file with protocol `pee.phase161.worker.v1`, `model_id: "fastino/gliner2.5-small-v1"`, `checkpoint_fingerprint` exactly as printed, `declared_license: "Apache-2.0"`, and `rights_reviewed_by_operator: true`. These are declarations by the operator, not auto-verified legal facts. Keep this lock **outside the public website and Git repository**.

```bash
# Once for a rights-scoped manifest (1–100 documents):
python scripts/phase161_neural_worker.py \
  --model-dir /private/models/gliner2.5-small-v1 \
  --operator-lock /private/models/checkpoint-operator-lock.json \
  --cache-dir /private/pee-cache \
  --manifest /private/pee-jobs/batch.json \
  --out /private/pee-results/batch.neural.json \
  --audit /private/pee-results/batch.audit.json

npm run build
node scripts/phase161-coordinate.mjs \
  --manifest /private/pee-jobs/batch.json \
  --neural /private/pee-results/batch.neural.json \
  --audit /private/pee-results/batch.audit.json \
  --out /private/pee-results/batch.pee.json
```

For a **resident local process**, create a private jobs directory, write each input manifest to a temporary filename and atomically rename it to `<datasetId>.json`. Start the worker with `--watch-dir /private/pee-jobs --watch-out-dir /private/pee-results --cache-dir ... --model-dir ... --operator-lock ...`. A dataset emits `<datasetId>.neural.json` and `<datasetId>.audit.json`, with a separate error file for bad jobs. No public ports are opened. Monitor disk space and service health externally. Access-control, service restart management, deployment security review and persistent host provision are operational work still to be done.

**Data hygiene:** outputs include the original complete text as required by the Phase159 binding contract, so manifest, cache and neural result files must remain on controlled private storage and **must not be put in the downloadable PEE release ZIP**. The shipped test records contain only generated texts or summaries, not full reviews. Changing model, input, schema or implementation invalidates cache reuse. An error, oversized candidate output or malformed offset is a failure, never permission to silently accept an incomplete result.

## Actual verification in this release

- TypeScript build completed. Eligible full-suite regression: **2,087 passed on 121 files**, legacy Phase91/92 files excluded. A new local-worker provenance/audit integration test file adds two test cases. The regressions are machine-recorded in `PHASE161-TYPESCRIPT-REGRESSION.json`.
- Python: 47 primary-source tests + 21 ingestion tests + **22 tests-python tests = 90 passed**, including six new Phase161 worker tests. They use a deterministic stub rather than loading the trained checkpoint.
- Worker dry-run on **100 constructed documents** with a deterministic fake extractor: initial run 100 fresh extractions; second run 100 cache hits, zero fresh extractions; 100/100 entity sets identical, no failures. See `PHASE161-OFFLINE-WORKER-DRYRUN.json`. **No actual neural model weights were used.**
- The reader for the two genuinely executed (but constructed) Colab examples continues to run; the new local-worker route cannot borrow their status to pretend local inference has occurred.

## Next hard gates

1. A controlled execution host with reviewed local model weights and appropriate CPU/RAM or GPU resources. Once present, measure cold/warm inference, latency, peak memory, costs and failure rates on one *fixed* multi-document batch, not repeated iPhone notebook shuttling.
2. Rights-cleared, complete and diverse original professional reviews; freeze publisher/product-family disjoint splits **before** model tuning. Existing RTINGS snippets remain only publisher excerpts, not legally cleared complete review records.
3. Real independent, blinded annotations with disagreements and adjudication; run the existing Phase137/150 evidence and leakage controls. Compare full-review candidate recall, false model merges, wrongly attributed measured values, reviewer/manufacturer boundaries and correct abstention against Phase160 native processing.
4. Only after demonstrated improvements should model-dependent paths influence the production data workflow; direct knowledge/ranking writes remain prohibited.

## Provenance references

Upstream GLiNER2 code: <https://github.com/fastino-ai/GLiNER2>. Model: <https://huggingface.co/fastino/gliner2.5-small-v1>. Context-engine precedent: <https://github.com/medspacy/medspacy>. Signal diagnostics: <https://github.com/snorkel-team/snorkel>. Entity/mention relation research: <https://github.com/zjunlp/DeepKE>. Product-specific extraction: <https://github.com/xinyangz/OAMine>; product matching: <https://github.com/megagonlabs/ditto>; HTML fields: <https://github.com/scrapinghub/extruct>; attribute evaluation: <https://github.com/wbsg-uni-mannheim/ExtractGPT>. Source code reused from these projects in prior phases remains under its applicable license/notice in private technical files. **No UI credits, upstream source ZIPs or pretrained weights are added in Phase161.**
