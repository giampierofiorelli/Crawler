# Phase176 — scoped dialogue-state candidate ledger (English-first)

Date: 2026-10-12. Parent: canonical `product-evidence-engine-v4.99-phase175.zip`.

## Engineering objective
Prevent false propagation of quoted statements, external claims, hypothetical product needs, and ambiguous cross-turn references into shopping objectives. Reuse the actual Phase175→174→173→172 chain and Phase154 review-origin ConText algorithm. Explicit source-offset tracking, deterministic candidate ledger and abstention; no evidence admission, ranking or real-product claims.

## Scope and deliberate limits

- New module `src/phase176_turn_state_ledger.ts`, `trackNeedConversation176()`, maximum 12 turns, 4,000 characters per turn. Reads user and assistant turns but **does not mine assistant statements as user preferences**.
- Preserves a `NeedGraph175` candidate for each user turn; recognizes double-quoted text and ConText-style third-party-report/conditional scopes. Reported, quoted or hypothetical named devices remain inspectable but never count as unconditional user requests.
- Resolves bounded pronoun references **only** from a unique candidate on the immediately previous user turn, with no intervening assistant turn, no active conflicting new-device mention, and no attributed/quoted/conditional scope. A candidate link is **never confirmed identity or intent**.
- Differentiates affirmative, uncertain and explicitly rejected anaphora; a rejected item is not an active purchase target, and does **not** authorize a product exclusion.
- No universal coreference, full pronoun syntax, implicit discourse speaker recovery, verified multi-turn preference update, exact arbitrary negation, sarcasm recognition, speech transcription, brand/model resolution, source trust or proof of semantic equivalence. Nested/dangling quotes and quoted single-quote spans are not reliably handled. Such contexts should be escalated in a later parser/annotation layer.
- 42 tests so far, all developer-authored; neither independent held-out natural-query accuracy nor user studies are claimed.

## Reviewed research and source software

1. **Google Research SGD / SGD-X**, state slots, active intent and schema paraphrase robustness. https://github.com/google-research-datasets/dstc8-schema-guided-dialogue . The dataset claims >20k annotated conversations and has CC BY-SA 4.0. It is not product shopping gold and is not imported.
2. **MultiWOZ 2.4**, Ye, Manotumruksa, Yilmaz, SIGDIAL 2022, https://aclanthology.org/2022.sigdial-1.34/ . Revisions to held-out annotations significantly change apparent model performance, so PEE must not claim accuracy from designer labels.
3. **medSpaCy ConText**, https://github.com/medspacy/medspacy/blob/master/medspacy/context/context_rule.py . Context triggers, directions and termination/scopes inform actual existing Phase154, MIT license; clinical rules do not transfer automatically to shopping.
4. **Usage-based conversational preference elicitation**, Kostric, Balog, Radlinski, RecSys 2021, https://research.google/pubs/soliciting-user-preferences-in-conversational-recommender-systems-via-usage-related-questions/ . Novice-centered usage questions motivate clarifications without user engineering jargon. Research authors' GitHub https://github.com/iai-group/recsys2021-crs-questions distributes question labels but not underlying full Amazon review text.
5. **fastcoref** https://github.com/shon-otmazgin/fastcoref and archived **neuralcoref** https://github.com/huggingface/neuralcoref : candidate learned referent resolution for a future isolated evaluation; not integrated. No evidence they solve PEE domain-scope or device identity safely; runtime model weights/maintenance burden not evaluated.
6. **User-supplied archives**, studied as source not dependencies: DeepKE (MIT); GLiNER2 (Apache-2.0); OAMine root code (Apache-2.0, its data separately licensed); MAVE (CC BY-NC 4.0); medSpaCy (MIT); Snorkel (Apache-2.0); VADER (MIT); extruct (BSD-style text); WDC-PAVE/WDCProducts licensing must be audited per artifact. No model/data has been copied or automatically installed.

## Evidence separation

A user sentence gives only an assertion about the user's needs. A documented mechanism gives at most a hypothesis about which performance dimensions to investigate. A test protocol defines a way to measure a product, not evidence that an exact variant passed it. Only Phase169–171 evidence admission + validated measurement/comparability/ranking may support a ranking.

## Next steps

Independent multi-annotator original-query benchmark, including author/thread deduplication and unseen categories; specialist technical protocol review per causal edge; candidate-referent clarification and correction UX; verified evidence snapshot/criterion diff pipeline. Do not mistake 42 tests for validation of general language understanding.
