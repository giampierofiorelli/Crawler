# Owner decisions and supersession log

**What this file is.** A record of which earlier proposals or statements have been overtaken, by what, and why.

**What it changes.** Nothing is deleted. The originals stay verbatim in:

- [research-v9-full.md](research-v9-full.md);
- [owner-operating-rules.md](owner-operating-rules.md);
- [claude-only-feasibility-audit.md](claude-only-feasibility-audit.md);
- `../history/` (the draft skill as delivered).

**Adding an entry.** Add a row when a newer owner decision or verified repository fact overtakes an earlier one.
Record the date, the source, and what still stands.

## Current owner decisions (consolidated)

Sources, all preserved:

- owner strategy (research v9 §9);
- Decision VIII;
- Correction IX;
- the Phase249 owner brief (2026-10-14), restated in `docs/phase249/PHASE249-TECHNICAL-REPORT.md`.

The decisions:

1. **Purpose.** PEE is an independent product research and buying adviser. It is judged by useful, accurate,
   evidence-calibrated advice on real needs, not by phase counts, test counts or row counts.
2. **Audit of over-restrictions.** This has permanent high priority. Justified safeguards stay.
3. **One repository.** Private persistent knowledge lives in SQLite outside Git, with verified backup and restore.
4. **Retention.** A proportionate source-class retention policy for private factual observations replaces the
   blanket per-source gate. There is no blanket licence to copy restricted material. No legal review is claimed.
5. **Public evaluation data.** It is audited. Confidential material goes outside Git. History is not rewritten.
6. **GOV.UK OPSS.** The OGL policy is approved, conditional on verification. It was verified and activated in
   Phase249, valid until 2027-04-15.
7. **Independent evaluations.** They use real user requests and untouched pages that Claude sources lawfully; the
   owner need not write cases.
8. **Paid licences.** None for now (Which?, CHOICE, Stiftung Warentest).
9. **Recommendations.** The capability must eventually work positively. Both justified action and justified
   abstention are tested.
10. **Autonomous deployment.** No premature autonomous-deployment infrastructure.
11. **Language.** English first.
12. **Dependencies.** No new repositories, paid services or heavy dependencies.
13. **Claude is the sole development agent** (Decision VIII, Correction IX). External reviewers, ChatGPT and Codex
    integration, and additional AI services are deferred. The owner restated this on 2026-10-15 when asking for
    this skill.

## Supersession log

| # | Date | Earlier material (kept) | Superseded by | What now applies |
|---|---|---|---|---|
| S1 | 2026-10-14 | Research Addendum VI: standing ChatGPT reviewer, two-agent protocol (v9 lines ~2009–2140) | Decision VIII; reaffirmed by Correction IX and the owner's 2026-10-15 instruction | **Deferred.** Its archived methods are usable by Claude alone: freeze, trace, first-failure diagnosis, challenge cases. Its workflow instructions are inactive. |
| S2 | 2026-10-14 | Research Addendum VII: Claude↔Codex/OpenAI automated integration, PR auto-review (v9 lines ~2141–2251) | Decision VIII; the 2026-10-15 instruction | **Deferred.** No bridge, API, Codex CLI, GitHub AI review or connector. Reconsider only after a new explicit owner decision. |
| S3 | 2026-10-15 | Decision VIII's statement "v5 as active operational baseline", and v5's calls for independent human gold and adjudication | Correction IX | The v1–v5 programme stays active, qualified by feasibility. Independent blind adjudication (T4) is a long-term desideratum, not a gate. Use the T1–T3 ladder with honest labels. |
| S4 | 2026-10-15 | An earlier statement (not in this package; quoted in Correction IX's executive answer) that **all** v5 proposals are achievable and independently verifiable with Claude alone | Correction IX | Claude can implement almost everything. It cannot self-produce independent human ground truth or separate review. |
| S5 | 2026-10-15 | Research v9 §2 and §2.2, owner rules item 4, Correction IX §D/§F, draft README and draft SKILL: "Phase249 incomplete / pending verification", "do not launch major implementation until Phase249 finishes" | Repository: Phase249 complete, HEAD `2580112`, final report `docs/phase249/PHASE249-TECHNICAL-REPORT.md` | Phase249 is the latest completed phase at installation. The draft's progress-log figures were confirmed by the committed report: 2,385 retained, 188 products, 140 revisions, 90 sources; set 1 v5 and v6 77/118; set 2 v7 33/59 versus v5 28/59; the evaluator path error. The "wait for Phase249" instruction is spent. The rule "check the newest phase first" still stands. |
| S6 | 2026-10-14 | Research v9 §2.1: "0 retained factual values" through Phase248; the blanket per-source `fact_storage` gate | Phase249 policy `pee249-factual-observations-v1` (owner decision 4) | Factual declarations are retained privately, within caps and with reservations honoured. Public export still needs `derived_publication`. Legal points stay open; see `RETENTION-POLICY.md`. |
| S7 | 2026-10-14 | Research v9 §9.6: OPSS approval "conditional" | Phase249 verification and activation (`evaluation/phase249/opss-policy-active.json`) | Active, narrow scope, fresh robots check per run. Safety notices are context, never performance tests. |
| S8 | 2026-10-14 | Research v9 §9.11: future autonomous self-repair, deploy and rollback contract | Phase249 owner decision 10: no premature autonomous-deployment infrastructure | The long-term goal is unchanged. The degradation monitor and the signed promotion and rollback record are the identified next pieces. Do not build them until warranted. |
| S9 | 2026-10-14 | Research v9 §2.1: Phase248 need recall 0.385 and "all in-scope recommendations withheld" | Phase249: real set 2 first run, need recall 0.625 and precision 0.625; positive `requirements_shortlist` path; signed ranking path tested synthetically | Need recall is still the main weakness. Positive ranked recommendations still require comparable independent measurements. |
| S10 | 2026-10-15 | Draft skill v1 (`../history/draft-v1-SKILL.md`): reference hierarchy without a current-state map; no reuse map; description limited to "learning, semantics, or generalization" | This installed skill | The installed SKILL.md adds automatic-invocation triggers covering all PEE development work, `current-state.md` (reuse map, commands) and this log. The method, boundaries, workflow, T1–T4 and examples are carried over in substance. |
| S11 | 2026-10-15 | Draft README-INSTALL links to claude.ai upload and API skill docs | Installation as a Claude Code project skill at `.claude/skills/pee-guided-learning/` (repository root) | Same skill format (SKILL.md frontmatter plus references). Claude Code loads it automatically from the repository. |

## Still open (owner decisions, not Claude's)

- Permission from SCA to use its Certified Home Brewer list. Its robots rules reserve against AI crawlers.
- Any paid evidence licence. This needs a documented business case first.
- Reactivating any deferred external-AI collaboration (S1, S2).
- A legal review of the retention policy's open points.
- A production hosting and persistent volume for `$PEE_KNOWLEDGE_DIR`.
