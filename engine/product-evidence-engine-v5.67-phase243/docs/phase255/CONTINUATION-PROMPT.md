# Continuation prompt after Phase255

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE256: a narrowly scoped authority for research planning (design first).

Use the `pee-guided-learning` skill. Read `engine/product-evidence-engine-v5.67-phase243/docs/phase255/PHASE255-TECHNICAL-REPORT.md`
and the Phase254 report. Check `git log` and run `node scripts/knowledge-snapshot.mjs verify` (expect pee-knowledge
`38495fe` or later).

**State:**
- `collectResearchNeeds254` produces typed needs with five destinations: research, user_clarification,
  reextraction, source_reinspection, not_actionable.
- Research needs stay `pending_authorization`. `planResearchGaps182` requires a Phase181 decision, whose
  per-product gaps exist only with a signed catalog that PEE does not have.
- `source_reinspection` needs (re-read the same permitted page) have no executor.

**Objective:** design and propose, for owner approval, the smallest separate authority that can authorise research
**planning only**:
- an operator-held key and a signed, expiring, category-scoped research-planning grant;
- it never authorises ranking, evidence admission or bypassing source policies;
- it never accepts user text as permission.

Show how a grant would let the queued Phase254 needs become a `ResearchPlan182` **without** fabricating a Phase181
decision. Either a separate entry point beside `planResearchGaps182` that reuses `researchJobFromGap182`, or a
documented alternative.

Write the design and its threat cases first. Implement only after the owner approves it.

**Do not:** fabricate a Phase181 decision; weaken `planResearchGaps182`; crawl or research live; admit evidence;
import teaching packages; rewrite Git history.
