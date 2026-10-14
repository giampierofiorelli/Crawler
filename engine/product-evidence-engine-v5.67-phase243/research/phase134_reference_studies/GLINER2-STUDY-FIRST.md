# Product Evidence Engine — GLiNER2 as engineering reference, not a required dependency
**Decision note — 11 October 2026**

**Input actually inspected:** user-provided `/mnt/data/GLiNER2-main.zip` and local PEE v4.57 Phase 133 sources, particularly phases 128–133. The user did not authorize installing GLiNER2 or making it a production dependency. This is **source review and architectural analysis**, not a new PEE release, model benchmark, executed inference, memory-usage benchmark, or completed legal assessment of all external artifacts.

## Executive decision

**NO installation, bundling, vendoring, runtime import, Python service, model weights, external API, or changes to v4.57 now.** Treat the uploaded source as a study/reference implementation. Reuse ideas by independently implementing and validating the necessary capabilities in the existing PEE architecture. Revisit a replaceable local model only if it wins on original expert-document evaluations after assessing accuracy, abstention, cost and deployment.

Apache 2.0 already allows commercial use and changes without royalties. If actual code is copied, attribution/license/modified-file obligations survive: renaming the code does not erase them. Implementing the *ideas* and established algorithmic techniques with independently authored code is a different approach; do not copy protected expression by accident. Check patents and source-specific licenses if relevant. Model weights, training data and transitive dependencies need their own examination.

## Direct facts verified in the user's ZIP

- `GLiNER2-main/LICENSE`: Apache License 2.0. `pyproject.toml` line 18 declares `Apache-2.0`, runtime Python >=3.10. This does NOT attest to arbitrary pretrained checkpoints or transitive dependencies.
- `pyproject.toml` lines 34–39: base dependencies `pydantic`, `requests`, `tqdm`, `urllib3`. Lines 43–50: local inference profile requires `numpy`, `peft`, `safetensors`, **`torch`**, **`transformers`**; training has more dependencies. Their exact installed versions and transitive graph remain unknown.
- `gliner2/joint_ie/engine.py`: neural joint extraction imports `torch` directly and coordinates candidate building and graph decoding. `gliner2/models/loading.py` lines 123–142 accepts a local directory **or downloads using `hf_hub_download` when given a remote repo ID**. An isolation policy must explicitly prohibit that path if local runtime were ever considered.
- No complete trained checkpoint corresponding to `fastino/gliner2.5-small-v1` is present in the uploaded source ZIP, so authentic prediction quality and server resource needs cannot be determined from it alone.

## Six engineering lessons worth retaining WITHOUT importing its code

### 1. Schema-driven reasoning on typed concepts, rather than product-specific rules
- **GLiNER2 evidence:** `gliner2/joint_ie/schema.py`, `EntitySpec`, `RelationSpec`, `JointSchema`, typed head/tail, directed/inverse relation, caps (`~lines 22–113`).
- **PEE adaptation:** construct admissible relation types dynamically from **reviewed** category knowledge (`src/phase128_category_cognition_dialogue_bridge.ts`). Use typed concepts Product, Mechanism, Task, Metric, Outcome, TestCondition, EvidenceClaim, ProtocolVersion, Source.
- **Why useful:** it lets new approved categories expand the interpretation vocabulary without maintaining separate hand-built if/else parsers.

### 2. Propose multiple candidates; select a consistent graph rather than the highest-scoring edge alone
- **GLiNER2 evidence:** `gliner2/joint_ie/candidates.py` NodeCandidate/EdgeCandidate and caps; `gliner2/joint_ie/optimizers/greedy.py` and `beam.py` candidate search, deterministic tie-break and feasibility check.
- **PEE adaptation:** build a bounded candidate graph over verified document spans and apply constraints before accepting an **extraction hypothesis**. The output is still NOT a scientifically established claim or a rank.
- **Why useful:** isolated decisions can generate contradictions; joint selection can compare alternatives and explicitly abstain. Start with deterministic filtering and a small greedy baseline; only add beam search if evidence on real text demonstrates worthwhile improvement.

### 3. Distinguish 'no extractable relation' from 'search/constraints infeasible'
- **GLiNER2 evidence:** `gliner2/joint_ie/optimizers/beam.py` lines ~86–109 emits `feasible=False` when it cannot satisfy constraints; documentation `tutorial/15-joint_ie.md` highlights the distinction.
- **PEE adaptation:** statuses `supported_hypothesis`, `no_candidate`, `insufficient_evidence`, `constraint_infeasible`, `needs_more_context`, and `source_unverified` remain separate. Infeasible extraction must NOT be converted into 'the product has no such feature'.

### 4. Keep source-character offsets and boundaries across long documents
- **GLiNER2 evidence:** `gliner2/joint_ie/long_text.py` lines ~14–77 remaps chunk spans to the full text and deduplicates overlapping fragments. **It deliberately does not synthesize cross-chunk relations**.
- **PEE adaptation:** maintain precise snapshot + offsets (`src/phase132_local_extractor_adapter.ts` already validates spans). For cross-paragraph reasoning, stage candidate links as needing separate cross-chunk verification, not as immediately supported edges.
- **Why useful:** performance claims frequently involve a result in one paragraph and the test conditions several paragraphs away.

### 5. Confidence calibration and abstention are separate from evidence truth
- **GLiNER2 evidence:** `gliner2/joint_ie/calibration.py` implements temperature scaling and expected calibration error; `candidates.py` uses logits/probabilities and candidate caps.
- **PEE adaptation:** preserve the Phase 131 model's calibration/abstention pipeline, report selective precision and coverage by category, source, document and relation type. Model confidence means confidence in *extraction*, NOT probability that the manufacturer's claim is true.

### 6. Tight separation between scoring, constrained decoding and the authoritative knowledge graph
- **GLiNER2 evidence:** `gliner2/joint_ie/engine.py` has separate `score` and `_decode` phases.
- **PEE adaptation:** parser -> scored candidate spans/relations -> scoped constraints/contradiction checks -> source/protocol verification -> quarantine -> reviewed knowledge update -> deterministic comparison and ranking. Model code never writes canonical product facts and never picks winning products.

## What NOT to copy as our architecture

- **Do not adopt the entire Python runtime** just to gain schema and constraint handling. PEE's current core is TypeScript; forced PyTorch/Transformers plus a second deployment stack adds dependency security, environment management, memory/cold-start and maintenance burdens. CPU compatibility in upstream documentation does not mean negligible memory or operating cost; no benchmark has been executed.
- **Do not assume the neural layer is optional for pretrained-model quality**. Code/schema rules without learned weights do NOT produce the language generalization of GLiNER2. We can reproduce graph constraints independently; whether our own extractor reaches adequate semantic performance remains to be measured.
- **Do not use upstream cloud API/client**; the PEE product has a no-paid-API/no-remote-dependency commitment.
- **Do not copy scores directly into product quality scoring**; extracted claims need source identity, protocol comparability, causality checks, expert relevance and independent validation.
- **Do not indiscriminately port beam search**: it increases complexity and compute. Compare against a simple baseline on frozen real-document annotations first.

## PEE code that already handles important parts

- `src/phase128_category_cognition_dialogue_bridge.ts`: reviewed category schema and question interpretation.
- `src/phase129_category_growth_cycle.ts`: discovery staging and explicit review before growth.
- `src/phase131_local_relation_learning.ts`: in-house relation classifier, still weak on unseen data.
- `src/phase132_contextual_relation_guard.ts`: conservative polarity/negation and scope vetoes, not universal NLI.
- `src/phase132_local_extractor_adapter.ts`: source-hash/span validation and quarantine of optional local-model output.
- `src/phase133_licence_release_gate.ts`: external-artifact license gate, no deployment authorization granted by this audit.

**Most valuable next native improvement:** an independent TypeScript module that applies **typed, provenance-preserving, category-derived graph consistency constraints** to the candidate relations from phases 129/131, while producing explicit failure/abstention reasons. It should incorporate the above design lessons, not copied source, and be evaluated against frozen original review excerpts with separate source-level holdout.

## Deployment and adoption gates — no GLiNER2 until every gate is met

1. **Quality:** independently annotated original professional reviews; source-disjoint and category-disjoint evaluation; precision/recall, false-positive relationship rates, negation scope, cross-sentence cases and abstention curves. PEE baseline frozen before comparison.
2. **Runtime:** CPU and (if useful) GPU process RAM peak, startup, throughput, concurrency, storage footprint, latency on realistic document lengths and failure recovery on the actual target server class. No numbers invented until benchmarked.
3. **Security and reliability:** exact pinned hashes, license closure for code + weights + tokenizer + datasets + transitive dependencies, supply-chain vulnerabilities, offline/no-remote loading, deterministic input/output contract, process isolation and timeouts.
4. **Maintenance and reversibility:** removable optional worker or plugin; native PEE operation without the model; model-specific failure must degrade to evidence retrieval/abstention rather than product hallucination.
5. **Business constraint:** all software and model artifacts free for commercial use without individual permissions or royalties; hosting/CPU/energy still have costs.
6. **Net benefit:** a material gain in independent factual extraction *per total operational complexity*; no adoption merely because it works on GitHub demos.

## Decision table

| Option | Cost/deployment impact | Independent-quality evidence | Decision now |
|---|---|---|---|
| Study GLiNER2 and independently implement the useful methods in PEE | No new runtime components | Must validate native improvements | **YES** |
| Copy a few Apache-covered functions verbatim into PEE | No PyTorch automatically, but attribution/change tracking and maintainability required | No inherent ML quality improvement | **NOT YET**: unnecessary while original implementation is possible |
| Run pretrained GLiNER2 in a separate offline worker | Python, inference packages, model files, maintenance | Not benchmarked on PEE task | **NOT YET** |
| Migrate PEE's cognition/ranking to GLiNER2 | High architectural coupling | No justification; GLiNER2 extracts information, does not evaluate scientific truth | **NO** |

## Source links

The following official public references are additional corroboration; the module-level technical conclusions above were obtained from **the uploaded ZIP**, not inferred from the web:

- Upstream repository: https://github.com/fastino-ai/GLiNER2
- Joint IE walkthrough: https://github.com/fastino-ai/GLiNER2/blob/main/tutorial/15-joint_ie.md
- Long-document boundaries: https://github.com/fastino-ai/GLiNER2/blob/main/tutorial/12-long_context.md
- Package dependencies: https://github.com/fastino-ai/GLiNER2/blob/main/pyproject.toml
- Project research paper: https://aclanthology.org/2025.emnlp-demos.10/
- Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

**Bottom line:** the source is valuable as a technical textbook and reference implementation. Learning from it now does not justify making it part of the runtime, turning PEE into a mixed Python/TypeScript server, or accepting its extraction decisions. We can keep that possibility open and deploy it only if robust external evaluation later earns the extra complexity.
