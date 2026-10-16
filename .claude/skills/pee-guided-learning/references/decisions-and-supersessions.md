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
3. **One code repository.** Private persistent knowledge lives in SQLite, with verified backup and restore. Its
   snapshot lives in the private data repository `giampierofiorelli/pee-knowledge` (S12).
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
| S12 | 2026-10-15 | Owner decision 3 and research v9 §9.1 ("exactly one repository"); `current-state.md` interim note (store restored from an owner-held backup zip) | Owner decision 2026-10-15: a second, **private** repository `giampierofiorelli/pee-knowledge` holds the knowledge-store snapshot | Source code stays in the single public repository. The data snapshot lives only in the private repository and is restored automatically at session start. The SQLite store and the retention policy (`publicExport:false`) are unchanged. |
| S13 | 2026-10-15 | Owner proposal of the same day: commit the store in plain form to the public Crawler repository | Not carried out. The session's safety system blocked publishing third-party data; the owner chose the private repository (S12) instead | Never commit the store or its values to the public repository. |
| S14 | 2026-10-15 | S9 and `current-state.md` §1–2 (Phase249): need recall "≈ 0.4–0.6" on real requests, the "concept vocabulary covers three categories", and "category knowledge has not been derived from retained declarations" (open question) | Phase250 report §4–6: untouched set 3 first run (A 0/24, B 8/24, C 7/24); the category knowledge audit | On new categories, the Phase249 system found 0/24 needs. Lessons, not looser matching, recover them. The open question is answered: declarations feed factual requirement checks, but 0 category items or relations. The Phase249 figures are kept as Phase249 history. |
| S16 | 2026-10-15 | Phase250 report §5 and `current-state.md` §0: the adopted configuration "has no first run"; 43% of declarations "cannot inform any category" | Phase251 report §2 and §4: untouched set 4 first run (A 40, R 44, D 46 correct of 50; harmful 9 / 5 / 3); identity-safe category assignment (57/57 correct, 842 declarations categorised) | D is first-run validated on set 4 (5 advise cases). D′ (later development) is not. Phase250's statements stay as Phase250 history. |
| S17 | 2026-10-15 | Phase246 identity design: host + name keys are safe when no model identifier is declared | Phase251 finding: two Sharp microwave models (MS02EB, QS204AEB) were merged under one generic name | Name-only identities spanning several model pages are flagged and never shortlisted (`decideAdvice249`). An identity audit and split, from lawfully re-fetched pages, is pending. |
| S18 | 2026-10-16 | S16: "D′ (later development) is not" first-run validated. S17: identity split "pending" | Phase252 report §1–2: set 5 first run (D′ 21/30 correct and 4 harmful, against R 14/11); verified Sharp split (journaled, reversible); ingest guard | D′ is first-run validated on decisions, not on needs. The S17 split is done; table-only products and product lines remain open. |
| S19 | 2026-10-16 | Research v9 §4.3/§10 and the Phase250 lessons: a research-guided teaching pack is expected to improve need understanding | Phase252 report §4: on the untouched first run, research-guided G tied lexical L on decisions and lost on explicit needs (20/44 against 28/44); G adds requirements, cautions and missing-evidence statements | Teaching packs keep their research structure but must keep users' literal need words. Adopting G into the operational registry is deferred until a merged version wins a fresh first run. |
| S20 | 2026-10-16 | Phase251 diagnostic: Phase110 validation catches only number and grounding errors (2/12) | Phase252 bounded faithfulness checks (7 lexical checks) | Phase110 now rejects common unfaithful encodings. This is still not entailment or truth; evidence is T1 only. |
| S21 | 2026-10-16 | Phase248–252 journey: a recognised request ends in a research plan; `decideAdvice249` is reached only from a hand-built Phase177 snapshot; scores measure category and response labels | Phase253 report §1, §5: `adviseFromRequest253` connects journey → constraints → Phase177 (`user_request_statement`, span hash) → eligibility → `decideAdvice249`; first run N 35/43 correct against P 8, 14 of 17 justified positives, 0 harmful (T1, not held-out) | Advice is evaluated on ten separate metrics (`phase253_advice_contract.ts`); a strict scorer refuses incomplete gold. A specification shortlist is unordered and never a ranking. |
| S22 | 2026-10-16 | Phase246 source typing: `unknown` stays unknown until an operator asserts a type | Phase253 Stage 4: 19 manufacturer and 1 retailer typed from retained evidence (brand equals host; several foreign brands), basis `heuristic_unverified`, journaled and reversible | Only `unknown` sources may be typed this way; one foreign brand or no brand stays unknown; advice cites inferred types as inferred. |
| S23 | 2026-10-16 | Practice up to Phase253 first run: committed evaluation runs may hold full outputs | Phase253 public/private check: runs held retained declaration values (`eac647d`, `771158e`) | Committed advice runs are public forms (no declared values); full runs only in private-eval. History rewrite is an owner decision. |
| S24 | 2026-10-16 | Phase253 module inventory: "connect next: feed unresolved, unknown and conflict reasons to `phase182_gap_research_orchestrator`" | Phase254 trust-boundary check: `planResearchGaps182` needs a Phase181 decision; per-product gaps come only from a signed catalog (none exists); a hand-built decision would pass its shape check | The bridge (`collectResearchNeeds254`) produces typed needs with the exact Phase182 job preview (`researchJobFromGap182`) but no plan; all research needs stay `pending_authorization`. Entering Phase182 needs an owner-approved authority. Downstream stages read `decideAdvice249` check codes, never reason text. |
| S15 | 2026-10-15 | Phase249 practice of sourcing real requests from Stack Exchange, without an access note | Robots.txt of the Stack Exchange sites, read on 2026-10-15 (`Disallow: /`, `Content-signal: search=no, ai-train=no`) | Real requests come only through the official API (`api.stackexchange.com`), for evaluation, with CC BY-SA attribution; site pages are never fetched. Revisit if the API terms or signals change. |

## Still open (owner decisions, not Claude's)

- Permission from SCA to use its Certified Home Brewer list. Its robots rules reserve against AI crawlers.
- Any paid evidence licence. This needs a documented business case first.
- Reactivating any deferred external-AI collaboration (S1, S2).
- A legal review of the retention policy's open points.
- A production hosting and persistent volume for `$PEE_KNOWLEDGE_DIR`. Until then, the private repository is the
  durable copy (S12).
