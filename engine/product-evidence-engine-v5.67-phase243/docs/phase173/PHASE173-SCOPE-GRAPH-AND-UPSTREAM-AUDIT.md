# Product Evidence Engine — Phase 173
## Reuse of review-language infrastructure for upstream needs, equipment scope and auditable goal knowledge

**12 October 2026.** Baseline: v4.96/Phase172. This is a **bounded, English-first research engineering increment**, not deployed language understanding, technical causal validation, scientific product ranking or a tested consumer adviser.

### Engineering decision

The customer's natural-language request and a professional product review are **different speech acts**. Some underlying techniques can be shared, but review statements about observed product performance cannot be repurposed as assertions of what a customer needs. Preserve the chain:

`user wording → task and equipment target/ownership → goal hypotheses → explicit constraints → proposed category mechanisms → test observables and methods → externally verified measurements → independent source/variant/rights admission → hard feasibility and ranking → ranking-trace explanation`.

**Separate goals from machine types.** “I ordered an espresso machine; which grinder...” targets a new accessory, not another machine. “Machine plus grinder within $1,500” concerns **two components and a total cost** and cannot be reduced to either component. “Would an air fryer improve reheating versus my oven?” is a **solution comparison**; “how do I reheat in my air fryer?” is a **usage question**. Phase173 makes these distinctions as bounded candidates; none starts ranking.

### Actual implemented modules

- `src/phase173_goal_scope_adapter.ts` recomputes the actual Phase172 plan, rejects tampered or cross-request plans, preserves the original user's words and explicit constraints, distinguishes select/compare/use/unresolved, and tracks *bounded* owned-equipment mentions separate from target equipment. New research-only need patterns cover reheat suitability, few-step food preparation, vacuum mixed floors, whole-use battery time, cat/dog context, stated lift-handling difficulty, allergen containment and top-loader lid opening. A new `coffee_setup` scope prevents silently converting a dual-device system into a grinder-only choice. Every derived need remains **unreviewed** and **non-veto**.
- `src/phase173_need_mechanism_graph.ts` emits stable, versioned `goal → possible mechanism → named observable` **proposals** from Phase172 and Phase173. Links include existing original-method pointers from Phase172 when applicable, never product measurements. A missing method is an explicit research task. A submitted reviewer note records a source identifier, version, excerpt hash, conclusion and limitations; because the program cannot authenticate either reviewer or source, its state is **unverified_review_submission** regardless of a favourable conclusion. No path promotes it to verified causal truth or changes a product ranking.
- `scripts/phase173_audit_source_archives.py` inventories the **ten exact user-supplied ZIPs** by SHA-256, entry count, licence-path presence and research disposition. The script does not execute, install or extract upstream code, fetch checkpoints or install dependencies. `evaluation/phase173/upstream_archive_inventory.json` is a snapshot produced from the uploaded archive files.
- `scripts/evaluate-phase173-postfreeze.mjs` runs six additional **developer-authored paraphrases of separately published public user requests**. The cases were viewed and their first-run failures used during development. The resulting file is therefore an **informed development diagnostic**, NOT a blinded or frozen held-out result and NOT an intent accuracy measurement.

### Why existing review technology can help, and where it cannot

| Supplied source | Inspected original source landmarks | Reuse decision |
|---|---|---|
| **GLiNER2** | `gliner2/inference/schema.py`, `gliner2/classification/schema.py`, `gliner2/joint_ie/schema.py`, `gliner2/models/boundary/relations.py` | Study typed entity/relationship schema and constrained joint extraction; no inference, no model weights, no Python/Torch dependency. The current online repository may have changed since this uploaded snapshot. |
| **DeepKE** | `example/re/document/README.md`, related document relation code | Refer to Phase156 original document graph and source-anchored relation hypotheses. Relation models trained on reviews are not calibrated for human shopping intent. |
| **medSpaCy** | `medspacy/context/context.py`, `context_rule.py`, `context_graph.py`; Sectionizer and tests | Study scoped modifiers, clause boundaries and assertion subjects. Clinical negation rules require domain adaptation and a distinct benchmark before being used for “don't mind”, “not too noisy”, “my dog has allergies” or family ownership. No runtime adoption. |
| **Snorkel** | `snorkel/labeling/lf/core.py`, `labeling/analysis.py`, `labeling/model/label_model.py` | Study weak-label overlap, abstention and conflict analysis. Weak labels cannot provide independent gold-standard verification of PEE intent. |
| **OAMine** | `candidate_generation/chunk.py`, `value_grouping/src/*` | Separate novel attribute phrase proposals from grouping and typing. User-goal-to-technical links are a different transfer problem from product-title attribute extraction. |
| **WDC-PAVE** | `pieutils/normalization.py`, extraction/normalization prompt directories | Study strict distinction between finding a candidate value and normalising/validating it; uploaded root has **no root LICENSE**, so no distribution of source or datasets. |
| **MAVE** | Root README and `LICENSE` | Attribute dataset with **CC BY-NC 4.0** supplied license: research only, no presumption of commercial use; no dataset included here. |
| **WDC Products** | `src/contrastive/`, nested `ditto/`, README and licences | Product identity/variant matching, not user intent; retain Phase157/158 original variant controls, do not transfer weights or bundle nested repositories. |
| **extruct** | `extruct/jsonld.py`, `w3cmicrodata.py`, `rdfa.py` | Machine-readable webpage extraction belongs to source ingestion; schema markup is not expert validation of an attribute. |
| **VADER** | Root README/`LICENSE.txt` | User sentiment is not an outcome metric, hard constraint, or demonstrated fit. Low-priority research reference. |

This is a **targeted engineering review and inventory**, not a line-by-line static audit of every third-party function. The technical/legal notes refer to the exact uploaded snapshots; nested artefacts and model checkpoints may carry distinct rights. Licences are **not re-licensed or bundled** into the new source code.

### Research and limitation controls

- Upstream scientific transfer rationale: OA-Mine describes *open-world attribute extraction* using candidate generation and clustering, **not validated causal goal engineering**: https://arxiv.org/abs/2204.13874 . The GLiNER2 project describes schema-driven information extraction, not calibrated appliance-advice inference: https://github.com/fastino-ai/GLiNER2 .
- Phase172 inherited evidence links: https://www.rtings.com/vacuum/learn/how-we-test ; https://www.which.co.uk/reviews/air-fryers/article/how-we-test-air-fryers-aCHgw2L7PYzU ; https://www.whirlpool.com/blog/washers-and-dryers/laundry-room-sizes.html ; https://sca.coffee/research/coffee-standards . Read Phase172 document registry for precise limitations and protocol family distinctions. The existence of a methods URL **does not verify a proposed mechanism, units/conditions, specific model, causal transfer or hard veto**.
- Newly consulted *user-problem* examples (no product-performance truth): https://www.reddit.com/r/VacuumCleaners/comments/1lq3nll ; https://www.reddit.com/r/VacuumCleaners/comments/1e9ucrb ; https://www.reddit.com/r/VacuumCleaners/comments/1tcqs88/cordless_vacuum_for_dust_allergy_advice/ ; https://www.reddit.com/r/espresso/comments/1n6ermu/help_me_choose_a_grinder_espresso_machine_for/ ; https://www.reddit.com/r/espresso/comments/1n9bw00/machine_grinder_recommendations_money_no_object/ ; https://www.reddit.com/r/VacuumCleaners/comments/1llja7w/best_vacuum_for_highly_allergic_pet/ . The published originals were consulted; the executable inputs are shorter author-created paraphrases, and did influence repairs. Claims about real-world NLP accuracy are forbidden.
- A present material false inference remains possible: phrase patterns and ownership/scope classification lack general language competence, referent resolution, a calibrated abstention policy and independent annotation. Do not use them as production adjudication.
- In particular, allergy-related user needs require case-by-case identification of **who or what** has the allergy, and whether air containment, disposal, exposure or cleaning efficacy is meant. The first phase only proposes general research dimensions. No HEPA or filtration performance score exists here.
- Ergonomics cannot be inferred from age, family size, ethnicity or identity. Only a directly expressed practical difficulty creates a candidate; whether it is decisive requires user confirmation and exact product fit.
- A `reviewStatus:unverified_review_submission` is a documentary receipt only. **No cryptographic signature, verified source fetch, unit/condition authentication, independent professional peer review, rights grant, exact variant match, safety approval or ranking gate was implemented.**
- Independent test collection is still needed: get distinct authentic request threads, with expert labels prepared without access to output/rules. Freeze a system version and keep evaluation articles unseen during authoring. Score target/category, negation, purchase-vs-repair, missed decisive requirements, abstention, family/variant collisions and overconfident assertions. Do not use data from these developer-selected posts to support a published accuracy percentage.

### Tests and release-level meaning

- TypeScript compile: `npm run build` passed (with external, temporary compatible Node typings in the developer sandbox; no `node_modules` packaged).
- Phase173 targeted: **34 passed**, including assertions on owned-vs-target equipment, dual-device system, repair-vs-purchase, context, negation, stable relation fingerprints, tampering, protocol pointers and unverified reviewer notes.
- **2,352 eligible TypeScript tests in 133 files** (13 isolated groups, zero failures), excluding historical Phase91/92 suites consistently with v4.96. See `evaluation/phase173/regression-ts.json`.
- Six inherited Python groups: **212 passing**, 60 emitted `ResourceWarning:` lines from the last group, associated with legacy SQLite use. The first attempted `primary_sources` group failed due to incorrect test discovery root (`-t .` omitted); rerunning with the correct root succeeded with 47 tests. See `evaluation/phase173/regression-python.json`.
- No original professional product measurements, original-variant verified rankings, independently annotated general-language benchmark, user evaluation, model inference or deployed advisory UI. **Passing software regression is not scientific validation.**

### Phase174 directions

1. Review Phase164/125–163's composition, subject/negation and document-grounding primitives against authentic English request tasks to avoid duplicated NLP modules. Use existing source-coded adapters before any new local model.
2. Model multi-component systems (coffee machine + grinder) with shared budget and separate equipment compatibility; model repair-vs-replace instead of forcing a new-purchase ranking. Validate budget parsing and currency as explicit constraints rather than guessing total spend.
3. Build an *independently annotated* task/goal corpus. Preserve full, legally permitted provenance, original request context, negation, referents, role of each equipment mention, intended outcome and explicit/implicit restrictions. Ensure author/thread/date separation for holdouts.
4. Review each proposed causal chain with **original professional method protocol version, unit, tested operating conditions, evidence independence, real product variant and rights**. Extend Phases169–171 only after signed/verified source receipts; distinguish conflicting or absent evidence from verified disqualification.
5. Only when authorized ranks exist: prove complete-order invariance against verified semantic equivalences, audit actual rank-difference traces on changed needs or evidence versions, and project first-layer visible cautions with optional deeper methods.

No further user action, Colab, paid external APIs, GitHub repository installation or model weights required for the engineering tasks accomplished here.
