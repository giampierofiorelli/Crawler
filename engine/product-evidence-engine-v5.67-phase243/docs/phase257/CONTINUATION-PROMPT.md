# Continuation prompt after Phase257

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE258. Use the `pee-guided-learning` skill. Read `engine/product-evidence-engine-v5.67-phase243/docs/phase257/PHASE257-TECHNICAL-REPORT.md`.
Check `git log` and run `node scripts/knowledge-snapshot.mjs verify`. Then:

- run `node scripts/phase257-research-policy.mjs restore` (from pee-knowledge) and then `verify`;
- the policy expires 2026-11-15: re-issue with a higher revision only if the owner approves.

**State:**
- Phase254 needs become policy-bounded `ResearchPlan182` plans (`planResearchFromNeeds257`).
- `executeUnderPolicy257` runs them as dry runs: reads, workers and transport are forced off; every job ends
  `no_curated_sources`.
- No Phase181 decision is ever constructed.

**Choose ONE bounded objective, after an owner decision:**
1. **Curated source registry** (recommended first).
   - Design and populate, by operator review, exact-product source candidates and `WebSourcePolicy` entries
     (rights basis, robots, terms) for the 19 demo jobs' products.
   - Still no reads: show which jobs would become `retrieve_for_research` and which stay blocked, and why.
2. **Read enablement design.** Specify exactly how an owner-approved policy revision could allow ≤ 5 reads through the
   existing `readApprovedSource`, with quarantine and no admission. Design only.

**Do not:** construct Phase181 decisions; enable reads without an explicit owner decision; admit evidence; rank;
import teaching packages; rewrite Git history.
