# Product Evidence Engine — continue from Phase178

**Canonical cumulative base:** `product-evidence-engine-v5.01-phase177.zip`, successor to `product-evidence-engine-v5.00-phase176.zip`. Read `PHASE177-TECHNICAL-REPORT.md`, `docs/phase177/PHASE177-ENGINEERING-NOTES.md` and the original `PEE-PHASE177-ARCHITECTURE-REVIEW-WEB-FIRST.md`; then inspect prior cumulative documentation. Do not restart the project or drop past code, studies, source rights, signed documentary research gates and regression suites.

## Product architecture remains website-first, English-first

The final service is a goal-first **website for product discovery and evidence-based advice**, with editable criteria, progressive exploration/comparison, critiques and changes of direction. It is not a mandatory continuous chat. Natural English is used at intake and for voluntary clarifications/revisions; user-facing explanations and product interfaces should be in English. A stable versioned criteria snapshot is canonical, not a conversation transcript. Use Phase176 conversation ledger optionally for scoped language input and review analysis, not as the mandatory website workflow.

## Phase177 implemented

- `src/phase177_decision_snapshot.ts`: immutable typed confirmed/provisional/denied/withdrawn/unknown criteria, explicit control actions, atomic multi-suggestion revision, undo and canonical confirmed-input fingerprint. `rankingAuthorized:false` and `exclusionsAuthorized:false` ALWAYS. Hashes are NOT authenticated signatures.
- `src/phase177_web_intake.ts`: English user text intake reusing real Phase175/174/172 and bounded Phase176 quote guard. Exact original request/offsets retained; new suggestions cannot overwrite confirmed user edits. Unrecognized request remains visible. Read-only explanatory view, NOT an installed website frontend.
- `tests/phase177_web_decision.test.ts`: 56 new passing tests. Eligible cumulative TS 2,588 across 137 files, Python 212 across six groups. Old Phase91/92 quarantined, not counted. `evaluation/phase177` stores checks and demonstration. No independent natural-language accuracy validation or real-product suitability rankings.

## Important failures still unresolved

`I want to make rigatoni` is NOT automatically recognized as a pasta-machine use case; do not erase the user goal or introduce confident product constraints. Complex attribution, sarcasm, partial quotations, contextual negation and unbounded free English remain unsafe. Snapshot hashes are not signatures or actor authentication. Hard user constraints are NOT authorized model disqualifiers without specialist engineering + exact variant/protocol evidence admission.

## Research and open source

Preserve all 12 user-supplied GitHub source archives as **research materials** if available; ask for a specific missing archive if genuinely necessary. FastCoref (root MIT) and SGD-X (CC BY-SA data) were read, studied and NOT automatically installed. Phase154 medSpaCy-inspired context is already reused via Phase175; Phase163/169–171 provide review/source evidence boundaries. Other uploaded source code (GLiNER2, DeepKE, OAMine, MAVE, Snorkel, extruct, WDC products/PAVE, VADER) remains relevant by capability but warrants measured benefit, licensing, performance and threat audits before adoption. No embedded model weights or whole GitHub repositories in the cumulative release.

## Priorities for Phase178

1. Build/test an **actual editable web-first browser surface** around the decision snapshot with accessible criteria, visible material cautions, comparisons and goal changes; avoid a conversational default.
2. Test decision **correctness and missing hard constraints**, not just perceived confidence/engagement. Assemble a genuinely held-out annotated English corpus of goal-only queries, category transfer, mixed review quotations and constrained preference updates without designer-label leakage.
3. Develop category engineering knowledge registry with independently reviewed mechanisms/tests/protocols; connect source-verified ranking difference traces only after Phase169–171 admission and deterministic policy/evidence versions.
4. For expert-review paragraphs with multiple models and pronouns, measure real coreference error costs before deciding to run FastCoref. SGD-X informs method for schema paraphrase robustness but does not validate product reviews or PEE shopping requests.
5. Work in small restartable blocks with checkpoints; do not require user Colab/computer. Ask for extra categories only if they provide a meaningful new held-out test.
