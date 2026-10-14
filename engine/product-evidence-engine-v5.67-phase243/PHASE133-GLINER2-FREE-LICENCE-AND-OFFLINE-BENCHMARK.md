# Phase 133 — Free-license gate and reproducible offline model comparison

**Date:** 11 October 2026. **Parent:** v4.56 / Phase 132. **Release:** v4.57 / Phase 133.  
**Scope:** implement an enforceable, fail-closed project policy for zero-license-fee, locally operated model candidates, and a real local-only comparison harness. **Not:** an executed GLiNER2 benchmark, a commercial clearance opinion, proof of accuracy, or an autonomous product recommender.

## Executive engineering decision

The project owns source discovery, evidence identity, relation validation, category knowledge, rankings and dialogue. Optional local neural extractors are **untrusted hypothesis generators**. The existence of a model on GitHub or Hugging Face, even with a permissive license, is not enough to authorize production incorporation.

As of this audit, the **upstream GLiNER2 library** and **`fastino/gliner2.5-small-v1` checkpoint** independently claim **Apache License 2.0**. Its conditions allow royalty-free commercial use, modification and redistribution subject to notices and other license conditions. We have not yet verified an exact local model artifact, the full runtime dependency closure, data provenance for future fine-tuning, or model quality. **No model code or weights have been incorporated.**

Model card, including approximate 74M parameters, 296 MB weights, English-only and CPU inference: https://huggingface.co/fastino/gliner2.5-small-v1
Library and LICENSE: https://github.com/fastino-ai/GLiNER2 ; https://github.com/fastino-ai/GLiNER2/blob/main/LICENSE
Library dependency manifest: https://github.com/fastino-ai/GLiNER2/blob/main/pyproject.toml
Apache 2.0 primary license: https://opensource.org/license/apache-2.0
GLiNER2.5 model family release (24 August 2026): https://fastino.ai/blog/gliner2-5-span-free-information-extraction

**Do not confuse:** the optional *hosted Fastino API* in the model card with the permissive **local checkpoint**. No API is needed for the proposed experiment, and no API call is allowed by its offline runner. This is a technical interpretation of upstream licensing, **not a legal opinion or warranty**.

## Current execution preflight

| Check | Finding | Decision |
|---|---|---|
| GLiNER2 code license | Apache 2.0 in upstream `LICENSE` and package metadata | *Declared and verified as upstream metadata* |
| Chosen GLiNER2.5 small checkpoint | Apache 2.0 in model card | *Declared and verified as upstream metadata* |
| Exact code/wheel version and hash | Not installed or pinned in this execution environment | Block |
| Checkpoint files and SHA-256 | No local checkpoint; no artifact hashes obtained | Block |
| Full runtime and transitive dependency inventory | Missing; upstream lists `pydantic`, `requests`, `tqdm`, `urllib3` plus local extras including `numpy`, `peft`, `safetensors`, `torch`, `transformers` | Block |
| Model inference | Not run: checkpoint unavailable and environment cannot fetch Hub/PyPI packages | **No GLiNER2 accuracy figure** |
| Python | 3.13.5 available; model card says 3.10 or newer; compatibility not proven locally | Needs actual run |
| Additional license costs | Apache-2.0 documents no royalties; hardware/electricity/storage can still cost money | Separately cost runtime |

The library is not the same thing as the checkpoint, training data or all transitive packages. Example: some **older GLiNER** model weights elsewhere are marked noncommercial; a permissive library does **not** override such a restriction: https://github.com/urchade/GLiNER/blob/main/docs/intro.md

## New implementation in v4.57

**`src/phase133_licence_release_gate.ts`** implements a conservative policy check for separately reviewed and cryptographically pinned inventories of code, weights, tokenizers, runtime packages and datasets. It rejects missing evidence, unknown SPDX labels, non-commercial terms, GPL under the current **permissive-only** policy, usage fees, subscriptions, private permission, required external services, missing notices and unreviewed transitive dependencies. This is stricter than what some otherwise lawful licenses allow, by deliberate product policy. Local operation and permission to use commercially are independent checks.

This control does **not** declare online metadata authentic by itself. Reviewers must independently verify exact artifacts, their origins, dependency closure and supplied SHA-256 values. The Phase132 relation safety guard continues to reject unsupported claims and every result remains `knowledgeWriteAuthorized:false` and `rankingAuthorized:false`.

**`scripts/phase133_offline_checkpoint_probe.py`** is an **opt-in, offline-only** checkpoint inference benchmark for GLiNER2.5 Small. Before importing model code it requires: (1) local checkpoint path; (2) exact digest and license inventory for every checkpoint file; (3) an explicit reviewed runtime dependency inventory; (4) no external service. It disables Hugging Face and Transformers online access via environment settings and **only passes a local path** to `AutoExtractor.from_pretrained`. It computes strict pair-direction-aware relation predictions against the existing Phase131 test records and writes a transparent report. Predictions from a local neural model remain separate from the canonical knowledge graph.

**Security limit:** environment flags and local paths prevent normal library Hub fetches, but are **not a hardened sandbox against malicious third-party code**. Production needs isolation with outbound network denied at the operating-system/container level. The manifest currently checks declared artifact data and file hashes, but cannot prove that the declared dependency list is exhaustive; that is a human-reviewed supply-chain task. No untrusted code is launched automatically during ordinary tests.

**`PHASE133-CANDIDATE-AUDIT.json`** records the actual pending/incomplete approval, not a fictional authorized manifest. **`PHASE133-OFFLINE-PROBE-RESULT.json`** reports the blocked preflight. The repo contains no third-party weights, binaries or fonts.

## Reproduce the blocked preflight now

```bash
python scripts/phase133_offline_checkpoint_probe.py \
  --checkpoint /mnt/data/nonexistent-checkpoint \
  --manifest PHASE133-CANDIDATE-AUDIT.json \
  --dataset evaluation/phase131/challenge.json \
  --output PHASE133-OFFLINE-PROBE-RESULT.json
```

Expected observed status: `blocked_preflight`, `local_checkpoint_not_present`, `modelExecuted:false`. **This is not a GLiNER benchmark.**

To run with real weights later, first inspect and pin the actual local files, obtain the full reviewed dependency list and set approval only after the documented manual review. Do not change `reviewer_approved` to `true` merely to bypass preflight. Running under OS-enforced no-network access is necessary.

## Fair model comparison, once actually runnable

Hold out complete publishers and whole categories, not random sentences from the same review. Build source-referenced judgments from original permitted documents, each with product identity, exact spans, source edition, question relevance, relation direction, negative/conditional scope and independent annotations. Two adjudicators should review disagreements before labels are frozen. Record artifact digests and fixed schemas. Benchmark the native model, native + context guard, and GLiNER2.5-small on identical evidence; make a second blind holdout for iterative tuning.

Compare entity F1, relation precision/recall at exact endpoints, false accepted scientific relations, negation/conditional error, abstention rate, source identity errors, minutes of expert review per valid relationship, memory/CPU and no-network operation. A cheap local model wins only if it actually improves the outcomes under the project's budget and licensing requirements. **A benchmark comprised of 18 developer-authored records is not an adequate launch criterion.**

Prior research: DocRED shows the importance of document-level relations (https://aclanthology.org/P19-1074/). GLiNER2's relation extraction API and span limits are documented here: https://github.com/fastino-ai/GLiNER2/blob/main/tutorial/6-relation_extraction.md. Hugging Face explains model-card license metadata and its limits: https://huggingface.co/docs/hub/repositories-licenses.

## Results and next build gate

- **New tests:** 10 TypeScript plus 9 Python tests. Their assertions concern safe failure, manifest consistency, exact attributed pairs, no unauthorized writes, and offline preflight only.
- **Historical regressions:** completed in six groups except the same two known legacy files of phases 91/92; numerical results in `PHASE133-REGRESSION-GROUPS.json` and release manifest.
- **GLiNER2 executed:** no. **Real professional reviews autonomously extracted:** no. **Full free-commercial dependency review:** not complete.
- **Next required input:** an exact, locally obtained, unmodified Apache-2.0 checkpoint + fixed independent gold corpus. Neither should be replaced with synthetic predictions simply to report a positive experiment.

**Engineering verdict:** proceed with the project-owned evidence engine and the stricter license control; admit no third-party runtime component until its exact artifacts are locally inspectable and the independent comparison is completed.
