# S98 — Restoring scientific knowledge to the operational path

Owner decision 2026-10-20 (verbatim in `.claude/skills/pee-guided-learning/references/owner-decision-s98-operational-knowledge-path-2026-10-20.md`).
Roadmap step: R3 (scientific knowledge consulted in reading). Kind: integration and inference. Maturity: **gated**
(implemented, validated on spent and on new material, not promoted).

## Outcome

- **One canonical scientific reading now sits on the operational path, behind a gate.** `scientific_reading98`
  reads what the existing extractors already produce (Phase245 declarations, Phase265 test leads, Phase269
  judgements) plus prose quantities from `document_evidence` that no extractor kept. Store v11 persists the readings
  in `scientific_readings98`, and `adviseFromRequest253` reports them as `scientificEvidence98`.
  - Gates: `storage.scientificReadings98` for ingestion; `opts.scientific98` on the user path.
  - The old readers are unchanged and remain the rollback baseline.
  - No ranking input and no decision effect.
- **On 7 never-examined pages (sealed blind reference, first run unchanged):**

  | Measure | Baseline (gate off) | Gate on |
  |---|---|---|
  | Typed correct property | 0 of 60 | 19 of 60 |
  | Wrong property | — | 0 |
  | False attributions (sealed reference) | — | 14 |
  | Other-product values linked to the main product | — | 1 (vs 18 reviewed values linked correctly) |
  | Advice decisions changed | — | 0 of 206 |

- **Promotion.** The preregistered promotion criterion is formally met: 19 correct against 14 false or wrong. The
  owner's stop rule is stricter: "if an integration causes false attributions … keep it gated". At least 3 of the 14
  false attributions are real even after source adjudication (§2), and 8 of 18 natures disagree with the reference.
  **The path stays gated.** The causal blockers are in §6.
- **Comparability safety works as designed.** On the independent pages, carrying conditions turns 46 "comparable"
  pairs (no condition transfer) into 1 comparable, 34 conditions not established and 53 not comparable. On spent
  material, 1,915 comparable pairs become 343.
- **Robustness defect found and fixed.** An unseen dishwasher page overflowed the stack in the table reader
  (`table_acquisition1f`): fragment links resolved each other in a cycle.
  - The fix leaves output byte-identical on 31 spent pages (62 configurations).
  - A regression test fails without the fix.
- **Checks:**
  - full suite: 4,912 tests pass;
  - 206-request regression against S96: 0 answers changed;
  - integration fitness tests: pass (a mutation check confirms they fail when they should).

## 1. What was built (items 1–5, 7, 8 of the decision)

| Item | Change | Where |
|---|---|---|
| 1 Flow | Shared reading of extractor output at ingestion. First loss point for measurements: extraction admission (99 spent pages: 752 reference positives, only 36 screened leads), so prose quantities from `document_evidence` are read when no extractor kept them | `src/scientific_reading98.ts` (`readPage98`), `scripts/phase246-live-wave.mjs --scientific98` |
| 2 Interpretation | Definitions pd.6 plus QK metrics (`withAcquiredDefinitions`, metrics only, condition transfer). The S89 object guard and term scoring were reworked at the cause and kept gated after three reformulations (§4) | `src/definition_interpreter.ts` (`objectInSentence` off, `statedObjects` off) |
| 3 Persistence | Store v11 `scientific_readings98`: value, unit, kind and status, metric, property and rule, definition state, conditions/missing/conflicting/method, nature and basis, knowledge state, evidence role, retention, expiry, interpreter/definitions/QK versions, `ranking_input=0`; never in public export; no page bodies | `src/phase246_knowledge_store.ts` |
| 4 Conditions | Canonical ids (QK axes, `pd:<dimension>`, `code:<code>`), states explicit/inferred/missing/conflicts; a missing condition is never equivalence | `conditionsOf`, `compareReadings98` |
| 5 Qualitative and learned | Stored Phase269/270 judgements reported as judgements; candidate definitions stay `candidate`; no ranking | `src/scientific_evidence98.ts` |
| 7 Gating | Both gates default off; all guards and the ranking boundary unchanged | contract `scientificCapabilities.gatedEntries` |
| 8 D30 and fitness | Registry of every scientific module (status, consumer, validation, gate or debt); the test fails for an unregistered capability, an operational claim without runtime reachability, or a shadow module without debt | `tests/s98_integration_fitness.test.ts`, `tests/s98_operational_path.test.ts` |

## 2. Independent check (genuinely new material)

**Material, metrics and rules**
- 7 pages never examined by PEE, fetched under the standing policy:
  - HouseFresh: 3 air-purifier reviews;
  - Yale Appliance: 4 dishwasher reviews.
- TechGearLab was refused (self-redirect) and not bypassed.
- Metrics and stop rules were preregistered in `evaluation/s98/check-preregistration.json` before annotation.

**Reference**
- 192 values, annotated by two blind Claude agents (one per category) under
  `private-eval/s98/wave/annotation/ANNOTATION-PROTOCOL.md`.
- Sealed in `evaluation/s98/check-annotation-freeze.json` before the run: 60 with a property, 132 none, 43 with
  stated conditions.
- First run: `evaluation/s98/check-firstrun.json`, unchanged.

| Capability | Result |
|---|---|
| Quantitative attribution | 19 of 60 correct (air purifiers 17 of 55, dishwashers 2 of 5); 0 wrong; 41 not stored. Baseline: the operational rows type none of these values (0 of 60; 12 values stored as untyped rows) |
| False attributions (sealed) | 14 of 132 (air 2, dishwashers 12) |
| Conditions and methods | 15 correct readings had stated conditions: 10 of 19 stated axes recorded explicitly; for 15 readings, a required condition is reported missing rather than assumed |
| Comparability safety | 88 cross-product pairs: 1 comparable / 34 conditions not established / 53 not comparable (without condition transfer: 46 / 0 / 42) |
| Product attribution | 18 of 18 reviewed-product values linked to the main product; 1 of 1 other-product value wrongly linked |
| Nature | 10 agree, 8 disagree with the reference |
| Qualitative interpretation | 0 stored judgements on these pages (the Phase269 codes cover cooking outcomes only) |
| Knowledge reuse | 19 of 19 correct attributions through pd.6 definitions, 0 through QK-metric candidates |
| Advice path | 206 requests (23 in the two categories): 0 decisions, 0 shortlists changed; gate-off answers identical on both store copies (206 of 206); 1 answer carries scientific evidence (1 comparable, 12 not established, 15 not comparable) |
| Resources | 1.4 s per page for the shared reading; 90 readings stored |

**Post-hoc source adjudication of the 14 false attributions.** This is reported separately and never replaces the
sealed result.
- 11 are dishwasher decibel ratings read as `sound_level`. The dishwasher annotator wrote that the label set had no
  noise-level quantity, but `sound_level` is defined as appliance noise. These readings are defensible.
- 3 are real errors: two "45 dB" thresholds on the air pages and one "44 dB quietness standard" read as product
  levels.

**Nature errors on HouseFresh.**
- "Took 36 minutes" was stored as declared five times; the publisher measured it.
- 29.3 W, which the publisher measured, was stored as calculated, twice.
- The maker-rated 287 CFM was stored as measured.

## 3. Spent-material validation (post hoc; S89–S96 waves, never independent)

**Setup.** `scripts/s98-validate.mjs`, `evaluation/s98/validation-r1.json`: 115 pages ingested into store copies with
the gate off and on.

**Rollback baseline.** Identical in both copies: declarations 3,029, test measurements 46, qualitative 9,
comparative 87, products 540.

**Readings.** 1,072 stored:
- by nature: 509 measured, 483 declared, 5 calculated, 75 unresolved;
- 750 with a property;
- 147 with an explicit condition, 498 reporting a missing one.

**Attribution against the sealed S89–S96 references:**

| Outcome | Count |
|---|---|
| Correct | 380 of 854 |
| Wrong | 33 |
| Not stored | 441 |
| False | 50 of 1,219 |

The largest false group is Hz values on monitor pages read as `display_refresh_rate` (31 readings), followed by
soundbar frequency response and runtime values.

**Product attribution.**
- 174 reviewed-product values linked to the main product; 163 not linked.
- 11 other-product values wrongly linked: 10 on the S94 monitor and SSD pages, from comparison tables.

**Advice.** 0 of 206 decisions changed.

## 4. Earlier stop rules applied

The S89 object conflict was reformulated three times:
1. stated objects;
2. sentence object in term scoring;
3. splitting the competitor override.

Each attempt either broke correct readings (stating objects: 28 to 13 correct) or did not move the result. Per the
three-reformulation rule, `statedObjects` and `objectInSentence` remain off. The cause is documented: four uses of
"object noun" with different strengths (label, sentence, term, competitor) need one object-evidence model.

## 5. Findings outside the change (recorded, not fixed here)

- `registerSource` and the live-wave fetch accept any `sourceType` string. Two earlier waves used
  `independent_test_or_review` and `independent_test`, which `declarationRole246` does not know. With the gate on,
  ingestion failed until the validation mapped them. The values are not validated at the source.
- The free-text values of the QK `signal_mode` axis are noisy.
- `textBlocks225` drops text in unclosed `<p>` elements (seen in S97; still open).

## 6. Causal blockers to promotion

1. **Thresholds and standards read as product levels.** "Under 45 dB" and "the 44 dB quiet standard" have no product
   subject. The reading has no notion of a bound or norm as distinct from a result.
2. **Nature from prose.** "It took 36 minutes" in the publisher's own test narrative is stored as declared, and maker
   ratings as measured. Nature evidence from the surrounding test narrative does not reach the document-quantity
   reading.
3. **Recall.** 41 of 60 independent values (441 of 854 spent) are not stored. Most are dropped as having no defined
   property after the object and term rules (104 of 179 prose quantities on the new pages).
4. **Comparison tables.** On spent pages, values of other products are linked to the main product.

## 7. Limits

- One publisher per category, and only two categories, in the independent check.
- The references are by Claude agents, one per category, and the dishwasher annotator misread one label.
- Spent-material figures are post hoc and are not independent.
- The ablations are gate off versus on and condition transfer on versus off. No per-component ablation of
  `document_evidence` was run.
- No ranking, no recommendation, and no candidate definition promoted. R3 stays open.

## Files

- Code:
  - `src/scientific_reading98.ts`, `src/scientific_evidence98.ts`;
  - `src/phase246_knowledge_store.ts` (v11);
  - `src/definition_interpreter.ts`, `src/scientific_entities.ts`, `src/table_acquisition1f.ts`;
  - `resources/property-definitions/property-definitions.v1.json` (pd.6).
- Scripts: `scripts/s98-validate.mjs`, `scripts/s98-check.mjs`; `--scientific98` in `phase246-live-wave.mjs` and
  `phase246-knowledge.mjs`.
- Tests:
  - `tests/s98_operational_path.test.ts`, `tests/s98_integration_fitness.test.ts`;
  - `tests/table_acquisition1f.test.ts` (cycle).
- Evaluation: `evaluation/s98/` (preregistration, seal, first run, validation, advice diff).
- Private copies: pee-knowledge `private-eval/s98/` (text fields hashed; no page bytes, no store copies).
