# Product Evidence Engine — Phase176 engineering report

**12 October 2026** | Base: canonical v4.99 / Phase175 | Release target: v5.00 / Phase176

## Result and actual execution boundary

Implemented and tested a bounded English-first *dialogue-state candidate ledger* (`src/phase176_turn_state_ledger.ts`). The real Phase175 analysis is executed for every user turn, including its Phase174→173→172 dependency chain. The new layer also **executes** the Phase154 context graph (original review-language infrastructure adapted from medSpaCy) to distinguish text reported by other people, direct needs, conditional needs, and bounded anaphora.

It is a deterministic interpretable engineering prototype, **not** validated open-domain semantic understanding, not independent scoring/availability evidence, not deployed and not an authorized real-product ranker. No models, weights, new runtime packages or scraped corpora installed.

### Specific capabilities

1. Distinct user and assistant turn sources with SHA-256 request/conversation receipts. Assistant recommendations are never promoted to user needs.
2. Explicit preserved mention offsets from the source text and separate candidate attribution for quoted, reported, conditional or uncertain requirements.
3. A *very conservative* antecedent proposal for `it` / `that one` / similar expressions. A unique candidate from the immediately preceding **user** turn may provide a possible antecedent. An intervening assistant message, competing current item, ambiguous multiple items, quote or conditional prevents automatic resolution.
4. Negative and uncertain references remain distinct from affirmative candidate continuations. Example: `Actually I no longer want it` can refer to the prior item without treating it as an active purchase target. No hard veto is authorized.
5. Revision flags prompt a new explicit requirement snapshot instead of manufacturing a new winning product or ranking-difference rationale.
6. `false` authority flags for independent semantic validation, product evidence, exclusions, rankings, real-world user confirmation and choice change.

### Sources reviewed

- Existing Phase125 `composeQuestion125`: schema-guided candidate aspects and explicitly verified context. Reuse lesson: context must be anchored and cannot be conjured from generic pronouns. No direct import needed because the Phase175/154 modules are the actual executable dependency of Phase176.
- Existing Phase132 scoped relation screening, Phase142 lexical predicate frames, Phase151 typed document-reference recovery: document-specific evidence constraints cannot safely be copied into user-device intent without an adapter and an objective benchmark; not integrated this phase. A type-aware compatibility study is documented, not asserted performance.
- Existing Phase154 `buildContextGraph154`, originally adapted from medSpaCy MIT source and preserved within the baseline: actually reused for user-reported statement scope.
- **medSpaCy ConText rules:** https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_rule.py (trigger direction, termination and scope; clinical vocabulary is not product semantics).
- **Schema-Guided Dialogue / SGD-X:** https://github.com/google-research-datasets/dstc8-schema-guided-dialogue (turn state and schema paraphrase stress testing; >20k dialogues across domains, not PEE shopping gold; dataset CC BY-SA 4.0).
- **MultiWOZ 2.4:** https://aclanthology.org/2022.sigdial-1.34/ (annotation errors in dialogue-state datasets make in-sample scores unreliable for product selection).
- **RecSys 2021 usage-questions study:** https://research.google/pubs/soliciting-user-preferences-in-conversational-recommender-systems-via-usage-related-questions/ and authors' https://github.com/iai-group/recsys2021-crs-questions (usage-based questions for novices; original review text not redistributed with dataset).
- **fastcoref:** https://github.com/shon-otmazgin/fastcoref and archived **neuralcoref:** https://github.com/huggingface/neuralcoref (potential future learned mention scoring; unbenchmarked against our actual problem, neither integrated nor silently assigned accuracy).
- Ten user-uploaded source archives inspected: DeepKE, extruct, OAMine, WDC-PAVE, WDCProducts, GLiNER2, MAVE, Snorkel, medSpaCy, VADER. Verified root licenses of DeepKE MIT, GLiNER2 Apache 2.0, MAVE CC BY-NC 4.0, OAMine root Apache 2.0, medSpaCy MIT, Snorkel Apache 2.0, VADER MIT and BSD-style extruct. Data and other artifact licenses require separate review. The uploaded archives were **not copied into this release**.

## Tests, claims and limitations

- 42 Phase176 deterministic, developer-authored tests, including quote and attribution isolation, conditionals, ownership, cross-turn ambiguity, intervening-assistant boundary, negative corrections, anaphora stance, byte-stable receipts and scope safety.
- Eligible TypeScript regression: **2,532 tests / 136 files, 13 groups, no failures**, excluding historical Phase91/92 suites as in parent version. `evaluation/phase176/regression-ts.json`.
- Python regression: see `evaluation/phase176/regression-python.json` for final six group output.
- No independently labelled held-out sample, inter-annotator agreement, precision/recall, open-world validation, user evaluation or exact-category cross-turn accuracy. Successful authored unit tests measure only specified behaviors.
- Short forms `it`, `that`, references across assistant prompts or multiple devices, sarcasm, nested quotes, quoted strings with apostrophes, multiple users, category-to-model entity linking and complex conjunction remain unsolved.
- Some genuine needs may be conservatively withheld as uncertain; this is a recall cost to measure, not proof of correctness.
- The project has *not* introduced any new verified need→engineering-cause→metric→protocol causal edges or admitted real product measurements. An evidence-only clinical or dialogue parser must not replace Phase169–171 provenance controls.

## Engineering decision

Keep a layered pipeline: exact user utterances → bounded discourse hypotheses → user-confirmed need snapshot → domain-reviewed mechanisms/metrics → source/variant/protocol-admitted product evidence → deterministic ranking trace → transparent explanations. Do not elevate co-occurrence to causality or user-developer test success to generalization.

Phase177 should acquire an independently annotated set of authentic, unseen multi-turn purchasing conversations or other legitimately sourced language data; preregister splits by author/thread/category; track missing requirements and false vetoes, and compare a learned resolver on only a restricted clean interface against this bounded fallback. Technical causal edges need independent specialist engineering protocols per category before ranking changes.
