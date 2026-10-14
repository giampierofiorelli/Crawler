# Phase 119 — What does “best robot” / “best value robot” mean without a cleaning task?

**11 October 2026 | Cumulative v4.43 | Research-only, not yet attached to the live recommendation gate**

## Why this matters

Two natural-language prompts — **“Qual è il miglior robot?”** and **“Qual è il miglior robot qualità-prezzo?”** — contain no statement that the user wants dry vacuuming, wet floor washing, both, or help choosing between them. After a discussion about steam-powered cleaning systems, the conversation also raises **context inheritance**: a verified ongoing steam-only constraint may persist in a follow-up, but a hypothetical, general best-robot question must not silently inherit steam or assume a hybrid robot. "Robot" without a floor-cleaning context is broader still; this adapter is explicitly scoped only to robot floor cleaners after category disambiguation.

We separate (a) **use goal** (vacuum, mop, both, undecided) from (b) **physical product type** (dry-only robot, wash-only robot, or combined). The former must be user-intent-dependent. A combined robot can be assessed for vacuum-only use without being ruled out just because it has additional hardware. Explicit **hardware exclusions** are different from the focus of use. We treat unsupported/unknown capability separately from documented absence.

## The human-facing response policy

1. Recover only **verified** context and apply explicit hard requirements. Do not invent a task because dual-function robots dominate editorial lists.
2. If task choice is genuinely unknown, issue one concise question: “Ti interessa soprattutto aspirare, lavare i pavimenti oppure entrambe le funzioni?” Show separately qualified alternatives to the user who declines to choose. Never publish a single cross-task winner.
3. If task is known, identify candidate sets by documented function, not marketing technology or rankings. `vacuum` means evaluate actual suction/pickup outcomes, `mop` means stain/floor outcomes, `both` means jointly evaluate independent endpoints; relevant floor surfaces and constraints remain important.
4. `best_performance` compares appropriately contextualized verified outcomes. A product that cleans better does not become worse simply because it needs more time unless the user values that time; avoid invented goal weighting. Where comparison is not supported, disclose it.
5. `best_value` introduces **market-local current price**, but still cannot collapse objective quality to publisher star-rating ÷ price. Hard requirements are gates, then compare multiobjective quality and cost; if a product is demonstrably no worse on reviewed *matching* endpoints and cheaper, that is a robust partial domination. When better performance competes with lower price, retain both on the frontier. There is no universal value score without an elicited value/price tradeoff.
6. New product status is separate: **announced, prototype, preorder** may appear in upcoming-product research, but are **not** currently orderable picks. Check country-specific retailer status as of observed date. A firmware function promised for later is not part of today's verified capability.
7. Basic price data is not total ownership cost: consumables, electricity/water, repair, support, maintenance and failure risk require verified data before changing value rankings.

### Example of query-vs-product independence

- "Only vacuuming matters to me" ⇒ mixed vac+mop robots **remain candidates** if their vacuuming endpoint is relevant. This is a *task emphasis*, not necessarily a hardware ban.
- "I explicitly don't want a mop or water system" ⇒ verified wet-hardware absence is a mandatory gate; robots with unknown hardware cannot simply pass.
- "I want mopping only" ⇒ a machine that both vacuums and mops can still be eligible if mopping quality and operational mode have been proven. "I only want a washing machine without vacuum hardware" adds an exclusion.
- "One robot for both" ⇒ both independently documented operating functions are needed, along with appropriate testing for each before claims about combined quality.
- "Best price-quality" ⇒ distinguish efficiency frontier from personalized single winner; low price cannot erase a failed mandatory feature.

## Implemented narrow module

- `src/phase119_task_scope_and_value_gate.ts`: a typed, reviewed-frame (not language-parser) gate with three parallel task views, function/availability/hardware eligibility, dated market-specific prices and uncertainty-preserving robust dominance using matching independent original measurement protocols and metrics.
- `tests/phase119_task_scope_and_value_gate.test.ts`: constructed, illustrative fixtures (the URLs are `example.org`, not actual reviews). Tests for missing task, best vs value, legitimate hybrids, true exclusions, unreleased products, advertisements, source metadata, method revisions, price dates, trade-offs, order invariance and an impossible request.
- `package.json` `test:phase119` + cumulative source archive.

The inputs must have externally established source attribution. **Passing `verification:'independently_reviewed_frame'` is a contract, not proof that a user said it.** Function evidence also establishes advertised/documented presence rather than high performance. The "documented function" class needs source-identity verification upstream. No full free-language task parser, country auto-detection or live prices are added here. The matching-protocol dominance requires the supplied evidence vector to be complete and relevant; this code does **not** prove that upstream extraction returned all material endpoints. The module never asserts an overall product winner and leaves untested candidates' quality unresolved.

### Known necessary integration work

- Add task-scope and explicit hardware-exclusion slots to the Phase113 local-model *proposal* schema, keeping literal span grounding, uncertainty, negation and independently adjudicated context. The present Phase113 schema only supports narrower categories/goals and cannot reliably answer these two prompts.
- Use the general Phase111 consequence-based clarification gate with full candidate eligibility/rank changes, and persist the verified task scope in Phase112 canonical intent without modifying query-neutral product evidence.
- Feed verified current prices from the price-observation module; retain market, currency, taxes, ship-to restrictions, source date, SKU, stock and variant identity. Capture multi-source inconsistency as unresolved.
- Apply the same lifecycle/feature status pattern to the steam research: current on-floor steam, dock-only washing with hot water, announced steam products, future firmware activation are all distinct dimensions.
- Benchmark on **independently labeled genuine user questions**, especially "solo aspirazione" versus "non voglio un lavapavimenti", "robot con vapore" versus "base con acqua calda", new conversation versus continuing referent, unknown/mixed use and multilingual negation. Measure wrong-scope recommendations, false exclusions, unnecessary clarification, omissions, false product/source attribution, and ranking-invariance violations. Without a live benchmark this phase is structural only.

## Original expert and UX sources

These support the **need to separate endpoints and tasks**, not an invented best-product ranking:

- Vacuum Wars, *How We Test Robot Vacuums*: https://vacuumwars.com/how-vacuum-wars-tests-robot-vacuums/
- Vacuum Wars, *Robot Vacuum Buying Guide* (September 30, 2026), distinct cleaning goals and mop systems: https://vacuumwars.com/robot-vacuum-buyers-guide/
- Vacuum Wars, *Robot Vacuums* hub (September 30, 2026), distinct vacuum-only, combo, and obstacle-avoidance comparisons: https://vacuumwars.com/robot-vacuums/
- RTINGS, *Robot Vacuum Test Bench 1.1*, revised July 27, 2026: https://www.rtings.com/robot-vacuum/tests/changelogs/1-1
- Nielsen Norman Group, *Explicitly State the Difference Between Options* (August 23, 2024), usability guidance: https://www.nngroup.com/articles/explicit-differences/
- Earlier cumulative project methodology: `PHASE100-ADAPTIVE-PREFERENCE-ELICITATION-RESEARCH.md`, `PHASE111-LONG-CONTEXT-AND-AMBIGUITY-RESEARCH.md`, `PHASE112-SEMANTIC-EQUIVALENCE-REAL-SOURCE-AUDIT.md`, `PHASE117-GOAL-OUTCOME-COMPARABILITY.md`, `PHASE118-REAL-STAIR-CLIMBING-ROBOT-EVIDENCE.md`.

**Boundaries:** reviewer evidence and pricing examples are synthetic unit-test records; no autonomous discovery, no live local LLM validation, no global completeness guarantee and no approval for public retail rankings.
