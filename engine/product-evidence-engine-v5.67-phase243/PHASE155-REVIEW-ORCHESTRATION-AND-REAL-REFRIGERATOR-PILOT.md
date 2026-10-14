# Product Evidence Engine v4.79 / Phase 155
## Coordinated upstream-derived engines and genuine refrigerator review reading

**Date:** 11 October 2026. **Baseline:** user-provided cumulative v4.78 / Phase154 ZIP. **Mode:** explicit English-first source-document intake, reversible review hypotheses only.

### Engineering change and sources reused

This phase **actually connects** the existing Phase153 candidate inventory, the **medSpaCy** ConText direction/scope graph that was ported from the user's original MIT-licensed repository in Phase154, and **Snorkel** LF vote-matrix diagnostics that were ported from the user's original Apache-2.0 repository in Phase154. This is not a new claim of having ported GLiNER2 or DeepKE's learned encoders. Their exact original source ZIPs and cumulative studies remain bundled for later justified use. See `PHASE154-OSS-REUSE-AND-CONTEXT-INTEGRATION.md` and `THIRD-PARTY-PHASE154.md` for the upstream file/attribution chain.

The opt-in `analyzeEnglishReview155(input)` in `src/phase155_review_orchestrator.ts` implements the following *controlled cooperation*:

1. Runs `analyzeEnglishProductDocument154()` and **retains that baseline unchanged** for audit.
2. Refines the inventory to respect source-layout boundaries. A heading followed by a new line is **not** a commercial name; the earlier candidate is not rewritten or erased. Recognizes explicit manufacturer/model shapes, multi-token brands including `&`, and codes in a delimited `Model Code | Finish` table. All output offsets and SHA-256 hashes reference the original input characters.
3. Uses source-title/first-party-page *correspondence* (not verified commercial identity) to distinguish candidate reviewed model, other models mentioned in comparisons, and table variants. The reviewed model's code in the variant table is flagged separately from other finishes.
4. Sends **corrected spans** to the medSpaCy-derived context graph, so lexical scopes such as `did not test` and termination `but` operate on actual mentions rather than newline-joined fake entities. Missing/contradictory spans remain abstentions.
5. Sends *same-task* categorical role votes to the Snorkel-derived diagnostic analysis: title match, variant-table match, comparison-phrase match. Disagreement yields an unresolved role; LF coverage and conflict are descriptive, **not truth probabilities**, and the vote sources are correlated.
6. Proposes guarded model-to-model comparison/similarity relationships when local language licenses that *hypothesis*. Does **not** equate mechanical similarity with identical SKU/product identity, does not infer source-wide links from remote mentions, and does not approve scientific facts.
7. Reads a small category-neutral set of **explicit label/value lines**, with separate handling for `advertised_specification` versus `publisher_test_observation_candidate`, attaching measurements only as **unverified page-context candidates**. Unlike free-standing numbers in prose, label/value pairing must be locally explicit. Does not convert or infer other units.
8. Returns one full review ledger (original inventory, mentions, context, LF matrix, relation proposals, metric candidates, uncertainty and truncation). `sourceAuthenticated`, `canonicalWriteAuthorized`, and `rankingAuthorized` are **always false**. No network connection, ML weight, runtime dependency, database mutation or public UI credits were introduced.

### Real online reviews used

Both reviews are independently published editorial sources; **the selected text windows were manually chosen and transcribed by the developer**, not independently annotated or source-disjoint blind gold. The publisher text is intentionally **not redistributed** within this ZIP. The scripts accept an authorized locally supplied text file via `--file`. The JSON records contain source URLs, source-window SHA-256, input length, model surfaces, role counts, numeric diagnostics, and explicit uncertainty but **not** article paragraphs.

**Source A (development case):** RTINGS, [Maytag MRT311FFFE Refrigerator Review](https://www.rtings.com/refrigerator/reviews/maytag/mrt311fffh-black), Kelsey Linhares, Evan Jakab and John Peroramas; published **12 March 2026**; **methodology v1.1**. Transcribed 2,470 characters from the introductory description, the sizes/variants table, popular comparisons, and selected produce/noise result rows. As an editorial source, RTINGS says it purchases and tests its own units; this claim does not by itself establish independent verification of every source row.

- Before: Phase154's unchanged inventory gave **18 spans**, including **10 malformed cross-line names**.
- After: **11 mention occurrences**, **six unique written surfaces**, and **zero cross-line commercial-name spans**. Candidate surfaces: `Maytag MRT311FFFE`, `Whirlpool WRT311FZDW`, `GE GTS22KGNRWW`, `MRT311FFFH`, `MRT311FFFE` and `MRT311FFFZ`.
- Role occurrences: 3 reviewed, 5 comparison, 3 variant, 0 unresolved in the *selected* excerpts. `MRT311FFFE` is explicitly flagged as the reviewed variant code, while `MRT311FFFH` and `MRT311FFFZ` are not.
- Guarded relational proposals: Whirlpool **similarity**, GE **comparison**. They are *not* scientifically validated or database-ready.
- Structured measurement candidates (all source-page hypotheses): **81%** produce moisture retention, **36%** crisper humidity, **21.5%** fridge cabinet humidity, and **44.9 dBA** noise during cooling. All are labelled publisher test observation candidates and refer provisionally to Maytag. No conclusion about other models' measurements is generated.

**Source B (additional post-code challenge, subsequently used for error fixes):** RTINGS, [LG STUDIO SRFB27W3 Refrigerator Review](https://www.rtings.com/refrigerator/reviews/lg/studio-srfb27w3), Justin Pires, Evan Jakab and Yannick Khong; originally reviewed **28 October 2025**, retested **11 August 2026**, **methodology v1.1**. Manually selected 1,663 characters from the introduction, variant description, comparisons, and selected storage/produce results. **Do not call this a blind holdout:** after the first diagnostic, the source exposed a missed multi-part manufacturer name and an unrecognized comparison expression, and the source was used to improve the algorithm.

- Before: Phase154 inventory **12 spans**, **seven cross-line artifacts**. After: **five mention occurrences**, **four unique full model names**, zero cross-line spans.
- Distinguishes `LG STUDIO SRFB27W3` from `LG LRFLC2706S`, `Bosch 800 Series B36CT80SNS` and `Fisher & Paykel Series 7 RF201AHJSX1`. Explicit comparison/similarity proposals remain unverified.
- Proposed measurements: advertised refrigerator volume **17.8 cu. ft.** versus reported usable refrigerator volume **13.4 cu. ft.**, plus produce moisture retention **83.6%**, drawer humidity **49.0%**, cabinet humidity **17.1%**. **Advertised** and reviewer-report classes remain distinct.
- **Open failure:** the particular excerpt gives two finishes in prose but **no code-bearing variant table**. The tool reports `no_explicit_variant_table_detected`; it does not invent the model codes or claim variant coverage. The review page elsewhere contains additional material, which this evaluation did not feed into the system.

Detailed machine-readable diagnostics are `PHASE155-MAYTAG-REAL-REVIEW-DIAGNOSTIC.json` and `PHASE155-LG-REAL-REVIEW-CHALLENGE.json`. Both use short excerpts taken from real reviews, **not full article ingestion**. Timing observations in these JSON files are one-off local calls, *not* a benchmark of scalable throughput. Test-window SHA-256 identifies exactly what was run without republishing copyright-protected passages.

### Controlled test instructions

```
npm run test:phase155
npm run build
node scripts/evaluate-phase155.mjs --file /path/to/authorized-review-excerpts.txt \
  --title 'Maytag MRT311FFFE Refrigerator Review' \
  --url 'https://www.rtings.com/refrigerator/reviews/maytag/mrt311fffh-black'
```

The script outputs **derived diagnostic JSON only**. It intentionally does not fetch, store, rehost or redistribute the publisher's full article. The main analysis remains explicit opt-in and does **not** connect to canonical evidence or the ranked recommendation pipeline.

### Regression and audit

After all changes: **2,037 eligible TypeScript tests passed across 114 eligible files**, run in bounded shards with the 2 historical Phase91/92 legacy suites excluded as in Phase154; **77 Python tests passed** (47 primary, 21 ingestion, 9 Phase133 offline probe). There are **14 new Phase155 tests**, all passing. This is a grouped execution, not a successful single whole-suite command; see `PHASE155-RELEASE-VERIFICATION.json`.

### Remaining limitations and next real gate

- Neither study is an **independent blind/source-disjoint benchmark**. Candidate accuracy, precision, recall and causal evidence quality are **unknown**.
- No automatic licensed web acquisition or full-review boilerplate/HTML reading is connected; existing input still requires a locally supplied text document. This avoids pretending to have processed an entire review when only sections were supplied.
- Mentions without consistent explicit model codes, abbreviations/partial references, brand-only anaphora, variant descriptions in prose, pronouns, dense tables and measurement condition details remain incomplete. A same-written-surface role hint must never be read as verified product identity.
- Two reviews do not establish cross-category generalization; washing machines, ovens, air fryers, etc. require an independent controlled evaluation.
- No new weights or GLiNER2/DeepKE heavy frameworks are imported at runtime. If a later evaluation requires them, measure source permission, model weights, CPU/RAM, test lift, licensing/deployment and reversibility before deciding.
- Release does **not** authorize recommendations or user-facing purchase claims based on this reading.

### Source provenance and licenses

- RTINGS refrigerator review Maytag: https://www.rtings.com/refrigerator/reviews/maytag/mrt311fffh-black
- RTINGS refrigerator review LG: https://www.rtings.com/refrigerator/reviews/lg/studio-srfb27w3
- medSpaCy MIT original user-provided source: https://github.com/medspacy/medspacy
- Snorkel Apache-2.0 original user-provided source: https://github.com/snorkel-team/snorkel
- GLiNER2 user-provided original archive (not a runtime dependency): https://github.com/fastino-ai/GLiNER2
- DeepKE user-provided original archive (not a runtime dependency): https://github.com/zjunlp/DeepKE

The source-attribution and licence files preserved in `third_party` and original archives satisfy code provenance tracking without adding visible website credits. Any future browser distribution still needs a distribution-specific compliance audit.
