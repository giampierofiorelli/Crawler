# Continuation prompt after Phase253

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE254. Before anything, use the `pee-guided-learning` skill.

Read `engine/product-evidence-engine-v5.67-phase243/docs/phase253/PHASE253-TECHNICAL-REPORT.md` (the ten answers) and
`docs/phase253/MODULE-INVENTORY.md`. Check `git log` and run `node scripts/knowledge-snapshot.mjs verify`. Expect
pee-knowledge `38495fe` or later. If the private repository is not attached, follow `CLAUDE.md`.

**State at handover:**
- An ordinary request now reaches `decideAdvice249` through `adviseFromRequest253`. It returns an unordered, cited
  shortlist with exclusions, unknowns, conflicts, questions and limitations.
- Phase253 first run (43 cases), N against P:
  - correct response type 35 against 8;
  - constraints 25/26 against 0/26;
  - justified positives 14 of 17 against 0;
  - harmful 0 and 0.
  The positives are T1 (synthetic requests on real retained evidence, same author): not held-out. The 16 new real
  requests contained no checkable limit.
- Development after the first run (spent cases) brings T1 to 27/27 and harm to 0. It added:
  - axis-labelled dimensions;
  - purchase-target rules;
  - bare ranges as candidates.
- 19 sources were typed manufacturer and 1 retailer from retained evidence (journaled, reversible,
  `heuristic_unverified`); 33 remain unknown.
- The teaching-package interface exists (`pee253.teaching-package.v1`). No owner package has been processed.
  Reserved untaught categories: `rice_cookers`, `pressure_cookers`, `food_processors`, `steam_cookers`.
- Committed advice runs are public forms. Full runs stay in `$PEE_PRIVATE_EVAL_DIR/phase253`. Always use
  `--out` (public) and `--private-out` with `scripts/phase253-advice-arms.mjs`.
- Spent sets: sets 1–5, the Phase252 teaching set and the Phase253 advice set.

**Open owner decisions (ask, do not decide):**
1. Whether to rewrite pushed history to remove retained declaration values committed in `eac647d` and `771158e`.
   They were replaced by public forms in `5c4081a`.
2. Whether to adopt `headphones` and `microwave_ovens` into the operational registry. The store has checkable
   products; the registry does not name them.
3. When the scientific teaching packages (air fryers, dehumidifiers, coffee machines, coffee grinders) are
   available, and where they will be placed.

**Priorities, in order:**
1. **Held-out real positive test.** Pre-register first, then find a lawful source of real requests that state
   checkable limits (Stack Exchange is exhausted for this). Run N unchanged and commit the first run unchanged
   (public form).
2. **Research loop.** Connect `Advice253.unresolved`, unknown and conflict reasons to
   `phase182_gap_research_orchestrator` as research tasks.
   - Lawful acquisition happens only through the existing source controls.
   - New declarations re-enter the store, and the request is answered again.
   - Measure how many unknowns become checkable.
3. **Requests that are not purchases.** Add a purchase-intent signal so that categories named as context (`r07`,
   `r13`) do not become the purchase. Use general rules, not vocabulary.
4. **Declarations that could exclude.** Let declared ranges wholly below a minimum, and capacities stated in product
   names, exclude a product. Keep anything ambiguous unknown.
5. **Teaching packages**, if provided:
   - validate with `scripts/phase253-import-package.mjs`;
   - apply to an evaluation copy only;
   - pre-register a first run that includes the reserved untaught categories as controls;
   - adopt only if advice is not worse.

**Rules:** CLAUDE.md non-negotiables; first-run results committed unchanged; T1 never reported as held-out; no
declared values in the public repository; no rankings from declarations; no vocabulary added only to raise scores.
