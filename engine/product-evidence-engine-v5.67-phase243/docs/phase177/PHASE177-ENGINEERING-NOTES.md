# Phase177 — canonical web decision snapshot and provenance-preserving English intake

**Parent:** v5.00 / Phase176 (all earlier code kept). **Deliverable:** research-only code and tests; no deployed website and no real product ranking.

## Architecture implemented

`src/phase177_decision_snapshot.ts`: immutable typed state with user-control-confirmed criteria, provisional suggestions, different unknown/denied/withdrawn states, importance flags, optional choice scope, revision chain, explicit web control actions, typed values, deterministic confirmed-input fingerprints, diff, atomic web batches and undo as a new audit revision. Hashes help detect accidental tampering but **are not authenticated signatures** or server permissions. The final production service requires server-side validation, persistence, event authorization and independent evidence versioning.

`src/phase177_web_intake.ts`: consumes the actual Phase175 role/context results, its inherited Phase174 facets and Phase172 goal probes. Uses the Phase176 single-turn quotation guard only where quote markers exist. Suggestions carry the original English request, observed substrings, character offsets and request hash; suggestions can NEVER set a confirmed or excluded requirement. An unmapped request remains visible (`unmappedGoalText`) rather than becoming a fabricated category. A confirmed user UI change supersedes later candidate extraction. One English intake with multiple suggestions is committed as a single reversible web gesture. Read-only first layer shows warnings and lacks any product winner.

The Phase175 chain already calls Phase154-style scoped context for equipment/ownership (developed originally for reviews), and Phase174/173/172 goal mappings. Phase176 turn ledger is retained as optional helper, **not** required or treated as canonical user state. Phase169–171 evidence gates are untouched and are not bypassed by the new state schema.

## Structural and adversarial behavior

- Canonical requirement keys are stable English slugs. Fingerprint uses confirmed values, priorities and scope in sorted order; it ignores original query paraphrase, actor ID and insertion order. This is a property of **structured and already-confirmed inputs**; it is not proof that unconstrained English expressions have been correctly understood as equivalent.
- Hard criteria are *user wishes*, not test-verified product disqualifiers. No product evidence, rankings, exclusions or publication permissions are authorized.
- Direct user controls can confirm, change, deny, withdraw or mark unknown. NLP suggestions have candidate-only provenance. Key and source reference checks resist accidental cross-source contamination; they do not authenticate actors over a network.
- `stateHash` chains revisions, `rankInputFingerprint` compares canonical confirmed inputs and remains separate from the snapshot/history hash. A product ranking system would also need validated evidence/variant/protocol/policy fingerprints.
- Atomic batch means that adding multiple tentative suggestions is one undoable action; batch failure commits nothing.
- No machine learning model is installed or implicitly inferred from a zip, no local inference accuracy is claimed.

## Known failures and critical limitations

1. General English goal inference is not solved. `I want to make rigatoni` remains an unmapped goal; `I need a pasta maker to make rigatoni` has a bounded research suggestion. The goal must not be erased or interpreted as no need. No unverified ranking should appear.
2. Quotation guard covers correctly paired English double quotation marks and curly double quotes. Single quotes, incomplete quotes, nested attribution, complex reported speech, sarcasm, and unknown negation remain unsafe; candidate suggestions may still include context errors. Automatic acceptance is never allowed.
3. Snapshot revision integrity hashes are not digital signatures. Production requires authenticated server handling, replay protection, authorization, privacy retention rules, and state schema migration.
4. No scoring trace, admitted real model measurements, variant-specific compatibility verification or ranking policy was connected; tests verify contract invariants, not decision quality.
5. Version 177 view is a **data contract**, not the deployed accessible browser UI. Criterion widgets, compare cards, opt-in free text, persistence and UX experiments are future work.
6. English only. No currently validated independent natural-language benchmark or cross-category user study.
7. Hard requirement validation must eventually distinguish expressed constraint from engineering compatibility evidence; do not combine them via blind database edges.

## Research / open-source interpretation

The user-supplied FastCoref source (MIT) outputs mention clusters and character spans; it is relevant to attribution in multi-product professional reviews, where a false antecedent could contaminate evidence. However, the uploaded source contains no verified, production-approved model weights and `pyproject.toml` references Torch/Transformers/SpaCy ecosystem dependencies. It was **not integrated**. Evaluate only in a separately versioned, licensed isolated harness against Phase154/175 bounded resolution on held-out, manually annotated English review comparisons.

The user-supplied SGD/SGD-X repository (CC BY-SA 4.0) is useful for schema-slot state representation and linguistic-variation stress testing. It contains task-oriented dialogues, not authentic product decision sessions or professional reviews; not imported as training or test gold. Schema variation is a legitimate risk even when semantic intent is held constant. Source: https://github.com/google-research-datasets/dstc8-schema-guided-dialogue ; https://doi.org/10.1609/aaai.v36i10.21341 .

Relevant design research: Chen & Pu, feedback/revision based recommenders, https://doi.org/10.1007/s11257-008-9057-x ; Nielsen Norman Group on explicit comparative differences, https://www.nngroup.com/articles/explicit-differences/ . Neither proves optimal PEE UI.

## Audit of provided GitHub archives (root license only; assets/datasets separately)

| Archive | Root license observed in uploaded source | Candidate reuse | Phase177 decision |
|---|---|---|---|
| `DeepKE-main(3).zip` | MIT | Knowledge extraction algorithms | Study only; no neural dependency |
| `GLiNER2-main(3).zip` | Apache-2.0 | English extraction, entities, relations | Source study; do not deploy weights |
| `OAMine-main(1).zip` | Apache-2.0 | Attributes and values for product descriptions | Study only; data separate license |
| `wdc-pave-main(1).zip` | Root license not established from zip | Attribute-value extraction evaluation | Audit rights before reuse |
| `wdcproducts-main(2).zip` | BSD-style root, nested Ditto Apache-2.0 | Product matching and deduplication | Existing review-side provenance remains authoritative |
| `MAVE-main(1).zip` | CC BY-NC 4.0 | Research into product attribute vocabulary | No commercial data adoption |
| `snorkel-main(3).zip` | Apache-2.0 | Weak labeling and label QA | Source study, evaluate independently |
| `medspacy-master(3).zip` | MIT | Negation, scope and ConText methods | Already informs PEE Phase154; actively reused |
| `vaderSentiment-master(1).zip` | MIT | Sentiment baseline | Not used for product suitability scoring |
| `extruct-master(1).zip` | BSD-style root | Structured source metadata | Not a substitute for independent evidence verification |
| `dstc8-schema-guided-dialogue-master.zip` | CC BY-SA 4.0 dataset | Schema/state and paraphrase robustness | Methodology only; no imported data |
| `fastcoref-main.zip` | MIT root code | Review pronouns/product referents | Candidate isolated evaluation; no default dependency |

The audits describe the **uploaded zip roots**, not independent permissions to use all nested data, models, checkpoints or third-party dependencies. No open-source package was copied into the new Phase177 module.

## Empirical verification

Run `npm run test:phase177`, `python scripts/phase177-regression.py` from a correctly installed environment. Exclude the two quarantined historic Phase91/92 TypeScript test files consistently with Phase176; see `evaluation/phase177/regression-ts.json` and `regression-python.json` for actual counts. Adversarial examples are developer-authored; do not treat them as blinded accuracy evidence.

**Next:** build real editable web UI/flow on this contract, create an independent annotated goal-first English query sample from unseen public threads and category holdouts, compare user choice correctness on structured critiquing vs conversational intake, and connect ranking only after independently admitted evidence and verified ranking provenance are available.
