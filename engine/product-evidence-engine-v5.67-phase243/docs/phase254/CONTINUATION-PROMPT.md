# Continuation prompt after Phase254

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE255. Before anything, use the `pee-guided-learning` skill.

Read `engine/product-evidence-engine-v5.67-phase243/docs/phase254/PHASE254-TECHNICAL-REPORT.md`. Check `git log`
(Phase254 ends at `f435e56` or later) and run `node scripts/knowledge-snapshot.mjs verify` (expect pee-knowledge
`38495fe` or later).

**State at handover:**
- `collectResearchNeeds254` turns advice gaps into typed research needs (`pee254.research-needs.v1`).
- Every research need is `pending_authorization`. `planResearchGaps182` needs a Phase181 decision, and per-product
  gaps exist only with a signed, verified catalog, which PEE does not have.
- Never construct a `DynamicDecision181` by hand.
- First run on real retained products: 32/34 correct, 0 missed, 1 false, 2 wrong destination, attribution 33/33.

**Choose ONE bounded objective:**
1. **Readable values.** Let product-name declarations ("1500W", "700ml") and unit-less dimension texts be compared,
   or at least coded `not_comparable` rather than `no_declaration`, so the bridge sends them to reextraction.
   Measure on `evaluation/phase254/research-needs-gold.json` (development) and on new cases.
2. **Authority for research planning.** Propose an owner-approved authority that can authorise research planning
   (not ranking) without a signed product catalog, so that Phase182 can plan the queued needs. This needs an owner
   decision first; write the proposal, do not implement it unilaterally.

**Out of scope unless the owner asks:**
- live research or crawling;
- automatic evidence admission;
- Git history rewrite;
- teaching packages;
- registry additions for headphones or microwaves.

**Rules:** CLAUDE.md non-negotiables; tests first; first-run results committed unchanged; no declared values in the
public repository.
