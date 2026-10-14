# PEE continuity: begin Phase179

**Canonical cumulative base:** `product-evidence-engine-v5.02-phase178.zip` (successor to v5.01 / Phase177). Read `PHASE178-TECHNICAL-REPORT.md`, `docs/phase178/ENGINEERING-NOTES.md`, `PEE-START-NEW-CHAT-PHASE178.md`, and the cumulative history. Do not restart from scratch, drop any research, file, license, historic source identity/protocol controls or regression tests.

## Permanent product rules

PEE is an **English-first, website-first** independent consumer product discovery and evidence-based comparison service, NOT a mandatory continuing chatbot. User text is used at intake and optional later critiques/changes. Canonical decision state is versioned user-controlled criteria, NOT a transcript. Needs/criteria derived from English are untrusted candidates until confirmation. A user hard constraint is not proof that a product fails it; only exact model/protocol-aligned admitted professional tests can justify exclusion. Identical verified confirmed needs, context, evidence snapshot and ranking policy must produce identical complete rankings regardless of paraphrase/identity. Avoid sales persuasion, unsupported confidence, fictional product reviews or exaggerated coverage.

## Phase178 implementation and tests

`web/phase178/{index.html,style.css,app.js}`: real responsive browser research interface, all user-facing copy English, editable candidate/confirmed/denied/withdrawn criteria, explicit priority, preservation of boolean/choice/quantity values, scope/categorization, one-step undo, immediately visible cautions and honest absence of real product rankings. `src/phase178_site_server.ts`: local-only in-memory HTTP API, server-held Phase177 snapshots, expectedRevision concurrency gates, isolated random sessions and cautious request/origin checks. Run `npm run demo:phase178` locally if a permitted machine/browser is available; not production/deployed.

21 Phase178 tests passed; 2,609 eligible cumulative TS tests in 138 files (excluding historic Phase91/92); six Python groups passed 212 tests, historical SQLite warnings. A desktop/mobile Playwright bridge to actual local API passed; direct browser localhost connection was blocked by environment administration. The 9 independent-thread developer paraphrase diagnostic found **five queries with zero suggestions**. PFAS+lead test detected only PFAS. Not blinded ground truth, not a statistical accuracy estimate. URLs, raw prompts, outputs and method limits preserved in `evaluation/phase178/`.

## Next urgent development

**Do not treat the website interface as evidence that NLP works.** Build an external annotation/evaluation protocol for crucial requirement recall, false decisive constraints, missed multiple needs, negation, category detection, task selection vs troubleshooting and abstention, with category transfer and real English sources unseen at design time. Need an independently reviewed goal→technical mechanism→performance protocol registry before authorizing product comparisons. Only connect audited ranking-difference traces from Phase169–171 with real exact variant evidence, otherwise abstain. Evaluate FastCoref for expert-review multi-product attribution if it can outperform scoped existing code with measured runtime and licensing. SGD-X remains language robustness methodology, not shopping benchmark. English only. Keep all user-supplied GitHub archives as candidate engineering materials, not automatic dependencies. Avoid forcing long chats. Work in recoverable checkpoints; don't ask user to run Colab.

## Release safety

All files from v5.01 were preserved except an explicit version/scripts update to `package.json`; new Phase178 code/research/tests added, no external model weights or whole GitHub archives embedded. Verify the actual new archive against the historical source, not just development directory. Never claim real independent product rankings or live user testing.
