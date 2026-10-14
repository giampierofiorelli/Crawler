# GLiNER2 uploaded source audit — Product Evidence Engine
**Date:** 11 October 2026  
**Scope:** direct inspection of the user-provided `GLiNER2-main.zip`, compared with Product Evidence Engine v4.57 (Phase 133) and official Apache/GLiNER documentation. **This is an integration decision, not an executed model benchmark or a complete legal/supply-chain clearance.**

## 1. Findings from the actual ZIP

- Source archive SHA-256: `ce0259e4143ba9027720314373d18956f8d5803e12208b2bc14b39870b98f300`.
- ZIP has 320 archive entries; approximately 7.0 MB uncompressed. Source tree includes 247 Python files and 143 Python tests under `tests/` (these counts overlap, as tests are Python files).
- `LICENSE`: full text of **Apache License 2.0**, including copyright and patent grants and redistribution conditions.
- `pyproject.toml`: declares `license = "Apache-2.0"` and a Python package with `pydantic`, `requests`, `tqdm`, `urllib3` in its base dependency list. Local inference also requires packages including `numpy`, `peft`, `safetensors`, `torch`, `transformers`. These are not yet fully checked for exact-version licensing and transitive dependencies.
- `gliner2/__init__.py`: reports version **2.1.0**. There is no `.git` commit metadata or locked dependency snapshot in the supplied archive; source SHA identifies this ZIP but not an upstream commit.
- The small `.pt` and `.safetensors` files in `tests/fixtures` are **testing fixtures**, not the trained `fastino/gliner2.5-small-v1` checkpoint. **The actual model weights are absent.** This archive cannot establish or test the model's prediction quality on its own.
- No `NOTICE` file was found inside the archive. That does not erase the duty to preserve any applicable source attribution and modified-file notices when distributing derivatives. The Apache section 4(d) `NOTICE` condition applies when an upstream NOTICE exists.

## 2. Legal answer: do we need to change the license or “work around” it?

**No.** Apache-2.0 already allows zero-royalty commercial use, modifications, combinations with proprietary code and redistribution. It does not require making proprietary Product Evidence Engine source public merely because GLiNER2 is used. It does require compliance when copying or distributing covered code: retain the license, retain applicable notices, mark modified source files, and include upstream NOTICE attributions if one exists. Trademark rights are not automatically granted. Patent grants have conditions including the patent-litigation termination provision.

Changing GLiNER2 source, renaming functions or rearranging it **does not remove** the obligations inherited from copied/derivative code. It would be both unnecessary and improper to present such modifications as license-free origin. If we write a genuinely independent implementation from published algorithmic ideas without copying protected expression, it has its own authorship, although patents and third-party materials still warrant review.

Official primary references:
- https://www.apache.org/licenses/LICENSE-2.0
- https://www.apache.org/foundation/license-faq.html
- https://github.com/fastino-ai/GLiNER2

**Important distinction:** Apache-2.0 on `GLiNER2-main.zip` does not prove the license or authenticity of every **checkpoint, tokenizer, training dataset or transitive dependency**. The `fastino/gliner2.5-small-v1` model card separately declares `apache-2.0`; its exact downloaded artifact must still be inventoried, checked and hashed: https://huggingface.co/fastino/gliner2.5-small-v1.

## 3. Tailoring specifically for Product Evidence Engine

| Existing GLiNER2 source | Potential domain-specific adaptation | Where responsibility must remain |
| --- | --- | --- |
| `gliner2/inference/schema.py`, `gliner2/joint_ie/schema.py` | Generate extractor schemas dynamically from **reviewed** category ontology. Define typed endpoints for product, task, mechanism, metric, test context and claim, with direction/constraints. | PEE's canonical category knowledge graph is authoritative. A model never invents approved ontology fields. |
| `gliner2/models/boundary/relations.py`, `gliner2/joint_ie/` | Candidate pair generation and typed relation extraction for `measures`, `contributes_to`, `conditioned_on`, `not_evidence_of`, and relationships specific to new categories. Tune decoding after real data. | PEE checks source, direction, negation, causal limits and comparability. Model scores are not evidence of truth. |
| `gliner2/inference/chunking.py`, `gliner2/inference/span_decoder.py` | Keep global source offsets and meaningful context across long reviews; disambiguate model and version mentions; preserve sentence/paragraph provenance. | PEE owns document snapshots, exact source-span validation, edition IDs and provenance. |
| `gliner2/training/data.py`, `gliner2/training/trainer.py` | Fine-tune on **licensed, independently annotated** original review passages, with publisher- and category-disjoint train/validation/test splits. | PEE owns dataset governance, contamination checking, calibration and release criteria. |
| `gliner2/auto.py`, `gliner2/models/loading.py` | Prefer local filesystem-only, verified checkpoint loading. Keep download/hub access disabled at runtime. | PEE's `phase133_licence_release_gate.ts` and offline runner enforce admitted artifacts and no-network execution. |
| `gliner2/api_client.py`, `gliner2/__init__.py` | For an eventual local-only fork, API client can be omitted from the deployment interface and imports/dependencies adjusted, subject to complete tests. | No paid API or required third-party hosted inference. A fork still retains applicable Apache obligations. |

Crucial engineering distinction: **customizing code is not the same as training a domain-specialized model**. We can customize schema and validation with no training, but robust semantic performance on unstated product attributes, unusual negations, protocol changes and multi-sentence scientific claims may require independent fine-tuning and a reliable evaluation corpus. Neither efficacy nor comparative superiority has been demonstrated yet.

## 4. Integration architecture: least-coupled option first

1. **Keep upstream code separate** in an optional, audited, offline-only model process; do not vendor/copy GLiNER2 into the PEE mainline until there is a demonstrated benefit.
2. Use an original **PEE-owned adapter** to translate reviewed category and evidence schemas to extractor queries and GLiNER outputs to untrusted candidate objects. Reuse `src/phase132_local_extractor_adapter.ts` and `src/phase133_licence_release_gate.ts` rather than replacing them.
3. Request document-exact entity spans and candidate relations. Treat every output as a **hypothesis**, not an accepted fact.
4. Apply source/product identity checks, quote-span checks, polarity/negation/conditionality checks, protocol/comparability controls, human/automated review and approval as appropriate. Never pass model scores directly to the ranking layer.
5. Promote a concept into the evolving knowledge graph only through a reviewed versioned change; rebuild the language interpretation schema from that approved graph. Preserve the meta-model's query-neutrality and deterministic ranking guarantees.
6. Where required, implement a **narrow, explicitly marked Apache-derived local-only fork**; do not modify GLiNER core prematurely when an adapter/configuration will suffice.

Target candidate record (illustrative, not a model inference result):

```json
{
  "source_id": "verified-source-snapshot-id",
  "product_id": "canonical-product-id",
  "text_spans": {"subject": [0, 12], "object": [40, 59], "evidence": [0, 90]},
  "relation": "not_evidence_of",
  "method_context": {"test_version": "unknown", "surface": "unknown"},
  "candidate_status": "quarantined",
  "model_artifact_sha256": "externally-verified-digest",
  "ranking_authorized": false
}
```

The record above is schematic and **not** a parsed original review. A real candidate must use observed offsets, valid canonical IDs and independently verified provenance.

## 5. What is possible with the user's ZIP today?

**Now:** inspect and audit the source; design adapters; test schema serialization and gating against fabricated candidates; optionally adapt the source with proper attribution; prepare a pinned local build. **Not now:** run authentic GLiNER2.5 small inference, benchmark extraction quality, fine-tune model weights, claim dependency/license closure or publish market rankings: the checkpoint and a controlled evaluation corpus are missing.

**Next material request:** obtain the **complete, unmodified model repository snapshot**, including model weights, config and tokenizer, for exactly `fastino/gliner2.5-small-v1` with revision and hashes; then confirm the full no-cost commercially compatible license graph. Do not download paid hosted API credentials. Install an exact compatible local Python environment and run network-isolated tests on independent original-review passages. If GLiNER materially wins on errors and coverage, keep it as a subordinate replaceable engine; otherwise retain the PEE-native approach.

### Bottom line

The user's downloaded code is **usable as an Apache-2.0 starting point**, subject to proper license compliance, but copying or modifying it cannot magically improve domain reasoning. For PEE, the most valuable customization lies in **ontology-driven extraction schemas, evidence provenance, negation/conditions, the evolving knowledge graph, and domain-tuned evaluation/training**. Keep the canonical scientific reasoning and ranking entirely ours.
