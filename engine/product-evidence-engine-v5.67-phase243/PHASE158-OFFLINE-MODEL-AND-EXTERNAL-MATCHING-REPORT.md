# Product Evidence Engine v4.82 — Phase 158 technical report

Date: 11 October 2026. Baseline: v4.81 / Phase157. Language: English first. Target: learn from the original GitHub repositories without bundling their complete source archives in each PEE release.

## Verdict

**Completed:** safe optional coordination for locally generated GLiNER2 hypotheses, local-only GLiNER2 checkpoint runner, adapted extruct JSON-LD extraction for supplied HTML, and a supervised external product-pair evaluation using frozen train/validation/test splits. Every model candidate remains non-authoritative, with exact text alignment and a source SHA-256. No database writes, ranking changes, or automatic product identity merges.

**Not completed:** running GLiNER2, Ditto or PyABSA neural inference. The checkpoint files are **not in the supplied source ZIPs**, the required GLiNER2 runtime stack is not installed, and a network request from the build environment to Hugging Face failed DNS resolution. Model-dependent measurements (accuracy, latency, RAM) cannot truthfully be given. There is no publisher-permitted complete professional review evaluation in Phase158. The core engine is not proven to generalise semantically from the external WDC pair labels.

## New functional interfaces

1. `src/phase158_offline_inference_coordination.ts`: optional explicit join of Phase156 review interpretation, Phase157 structured product claims and local model hypotheses. The input output schema records `sourceSha256`, offsets, literal surface, label, confidence and source-only alignment. A bad SHA, invented position, bad label or oversized list is rejected. The source analyser still runs without any neural output. `neuralModelExecutedWithinPEE:false` remains explicit even when external runner output is supplied. No proposal is upgraded to verified identity or scientific measurement.
2. `scripts/phase158_local_gliner_runner.py`: accepts `--model-dir /local/weights/folder --source-file local.txt`, refuses remote IDs and missing model files, sets `HF_HUB_OFFLINE=1` and `TRANSFORMERS_OFFLINE=1` before imports. Uses the original GLiNER2 `AutoExtractor.from_pretrained` and `extract_entities_long(... include_spans=True, include_confidence=True)` API, *if* dependencies and compatible weights are explicitly supplied. No successful neural run or checkpoint authenticity/licence verification is asserted; the output metadata states this.
3. `scripts/phase158_extruct_jsonld_port.py`: a scoped adaptation of extruct's `JsonLdExtractor` (Scrapinghub BSD-3-Clause) for **well-formed** JSON-LD in supplied HTML. Extracts Product/ProductGroup `@graph` values into the existing Phase157 bridge output shape. Unlike complete extruct, it refuses malformed JavaScript JSON, does not execute RDFa or Microdata, and requires `lxml`. Tested on the project's historical constructed HTML fixture, which has two demonstration product nodes; no genuine merchant/publisher HTML has been claimed.
4. `scripts/phase158_offline_matching_eval.py`: a research-only offline `scikit-learn` logistic model using twelve predefined lexical pair features. It reads Ditto's existing WDC split files directly from the **user's original ZIP** and does not store or distribute fitted coefficients or original pair records. It has no runtime dependency in the TypeScript product.

## External matching diagnostic

The test data are four historical Ditto/WDC product-pair sets (**cameras, computers, shoes, watches**). They are commercial product-title pairs with externally provided binary labels, **not** original-product-review passage annotations. The entire original dataset's rights and possible overlaps of underlying product entities between its designated train/validation/test splits are not independently certified.

- `train.txt.small`: 7,007 valid pairs. `valid.txt.small`: 1,745. Test: 4,251, with 1,156 gold matches. The script excludes malformed records rather than inventing labels.
- A standardised logistic regression is fitted only on training pairs. The threshold was selected *before observing test outcomes*, choosing a predeclared candidate threshold meeting ≥98% candidate precision and ≥10 predictions on validation; 0.96 qualified with 34/34 correct validation proposals.
- **Held-out test:** 139 matches proposed; 135 agree with positive labels, **4 contradict negative labels**; 4,112 abstentions. Precision on proposals 97.12%, recall of all gold positive pairs 11.68%. The **98% deployment precision target fails on test**. Model is not deployable for autonomous entity merges.
- Reference Phase157 positive-only token-overlap rule on the **same** test: 825 proposed, 570 true, 255 false; precision 69.09%; gold-positive recall 49.31%. The learned baseline reduces false merge proposals by abstaining far more: this is a choice of operating point, not conclusive proof of a universally superior matcher.
- Closed-world all-pair classification accuracy at 0.50: 82.88%; this is **not** the selective production precision and is not a cross-dataset performance guarantee.
- Four *leave-one-category-out* experiments fit only on the other three categories, calibrate with their validation data, and evaluate on the unseen held-out category test. Camera: 21 true/0 false; computers: 6/0; shoes: 16/1; watches: 76/2. These evaluations have very low prediction coverage and are a limited domain-shift diagnostic, not source-/entity-disjoint proof for new professional-review domains.
- Training runtime in this execution: 14.51 seconds for all five fits including feature extraction, on this analysis machine. No benchmark of production server CPU/RAM/latency is implied.

Machine-readable provenance, per-category counts, hashes, decision thresholds, validation results, false-positive counts and limitations: `PHASE158-WDC-LEARNED-OFFLINE-DIAGNOSTIC.json`. Upstream research: https://github.com/megagonlabs/ditto and https://github.com/wbsg-uni-mannheim/wdcproducts . The evaluated data came from Ditto's bundled *historical WDC splits*, **not** the complete 2024 WDC Products benchmark.

## Model candidate qualification

- **GLiNER2**: original source is present in the user's retained external archive. The external model card https://huggingface.co/fastino/gliner2-base-v1 lists a 205M-parameter model and Apache-2.0 licence and documents its local inference API. That model and licence must be pinned to a revision and the actual downloaded weights audited. No weights were locally available in this session, no CPU inference was run, and no measured RAM/time can be claimed. PEE's optional runner deliberately refuses silent online retrieval.
- **Ditto**: source https://github.com/megagonlabs/ditto (Apache-2.0 code). Its actual neural pretrained checkpoint was not among supplied files; the offline linear baseline is **not** the Ditto neural model. Historical code relies on an older Python/PyTorch stack; introducing it is not yet justified by an actual measured advantage.
- **PyABSA**: source https://github.com/yangheng95/PyABSA and English checkpoint documentation https://pyabsa.readthedocs.io/en/v2/6_tutorials/Aspect_Sentiment_Classification.html . The document indicates an optional English checkpoint download, and advises treating pretrained models as testing checkpoints. Exact checkpoint rights, security and runtime costs not yet cleared. No PyABSA model was executed.
- **extruct**: source https://github.com/scrapinghub/extruct ; documentation https://pypi.org/project/extruct/ . Complete extruct needs additional dependencies absent here (`jstyleson`, `mf2py`, `w3lib`, etc.); *only* the explicitly scoped, well-formed JSON-LD port was executed. Its provenance/licence remain internal.

## Integration safety and research limitations

- All hypotheses are explicitly opt-in and source-bound; no unseen model gains authority to write to scientific records, change deterministic rankings, bypass source distinctions, or join distinct commercial SKUs.
- Test WDC pairs include some non-English text; the test set is a historical external *matching* diagnostic, not a promise of new multilingual functionality. English remains product priority.
- Structured metadata can be self-declared by merchants/manufacturers; cannot become independently tested measurements. The bounded JSON-LD fixture was authored for prior PEE testing, not a verified live product-page scrape.
- Neural runner only checks the *existence* of checkpoint files, **not their signed origin or licence**; results remain quarantined until a reviewed source digest/checkpoint inventory exists.
- No complete professional-review documents with independently annotated gold labels were processed this phase. Real-world accuracy/recall of the overall PEE review engine still cannot be estimated.

## Verification and distribution

- TypeScript: **2,066 tests passed** in **118** eligible files, ten bounded shards; historical Phase91/92 suites excluded. The first combined run timed out after eight groups, after which the remaining two groups passed individually. See `PHASE158-TYPESCRIPT-REGRESSION.json`.
- Python: 47 primary source + 21 ingestion + 13 test-python (including four new Phase158 tests) = **81 passed**. No automatic model download was attempted.
- No new npm runtime dependencies. The new optional Python scripts require `lxml`/`scikit-learn` only for their respective explicit offline workflows; GLiNER2 neural dependencies remain uninstalled.
- **Lean distribution:** all nine original GitHub ZIPs are removed from cumulative releases, while retained locally by the user. `PHASE158-EXTERNAL-REPOSITORY-PROVENANCE.json` carries the exact SHA-256 of each original, and `licences/phase158_upstream` contains its copied licence notice. All other original project files are preserved barring regenerated bytecode caches. See the separate integrity verification for precise counts.

## Priority for Phase159

1. Obtain **one** properly licensed local GLiNER2 snapshot with model weights, config and tokenizer files (not just its GitHub source ZIP) and record file checksums, licence and reference. Confirm local CPU inference at realistic review length, resident RAM and time; do not use the internet as a required dependency.
2. Evaluate product/variant mention recall and false links on a **rights-permitted, independently annotated** complete professional review benchmark; include varied categories, and report source rights and the blind/human evaluation method.
3. Use WDC pair evaluation to benchmark learned *product identity* separately from review discourse; do not combine precision percentages from unrelated tasks. Do not auto-adopt the linear model because its held-out precision fails the threshold.
4. Enforce a well-bound HTML/content provenance contract before attributing merchant JSON-LD to a publisher's editorial review.
