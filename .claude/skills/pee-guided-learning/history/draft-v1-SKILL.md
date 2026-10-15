---
name: pee-guided-learning
description: Guide Product Evidence Engine (PEE) category expertise, English review/request understanding, and evidence-led code improvement. Use when auditing or developing PEE learning, semantics, or generalization.
---

# Product Evidence Engine — Guided Competence Development

## Purpose and activation

Use this skill for Product Evidence Engine (PEE) tasks involving: (a) building reusable technical knowledge of a product category; (b) improving natural-English request or product-review interpretation; (c) deciding which evidence to acquire next; (d) diagnosing and improving PEE implementation and evaluation methods; or (e) reconciling new phase results with the owner's cumulative research.

This skill is a **working method and research reference**, not a declaration that PEE already has the proposed capabilities. It does not authorize changes to the repository, spending, new services, external agents or owner decisions on its own.

## Required reference hierarchy

1. **Latest explicit owner instruction and verified current repository state** take precedence for implementation status. Check the current branch, final technical report, code, tests and storage artifacts. Do not reuse the October 2026 Phase248–249 snapshot as current truth.
2. **Owner decisions through correction IX:** read [owner-operating-rules.md](references/owner-operating-rules.md) before planning or changing code. Later decisions override superseded suggestions in earlier research without deleting them.
3. **Full original cumulative research:** [research-v9-full.md](references/research-v9-full.md). This contains the complete historical research/strategy record through version 9, including all previously proposed mechanisms and caveats. It is preserved intact, not replaced by a summary. Use [research-navigation.md](references/research-navigation.md) to find the relevant sections and review adjacent/cross-cutting sections; consult the source material itself for decisions.
4. **Claude-only evaluation and feasibility:** [claude-only-feasibility-audit.md](references/claude-only-feasibility-audit.md). Read when proposing how to implement/evaluate something with only Claude available, especially semantic ground truth.

Never claim to have read a source file you have not opened. Do not rely only on this SKILL.md for comprehensive scientific content. When changing a relevant feature, consult cumulative work, prior code, and fresh primary evidence before adopting a new technique. Cite the underlying papers/reports precisely in a phase report; verify links and contextual fit when practical.

## Owner decisions — hard boundaries

- **Current workflow:** Claude alone develops PEE. No automatic ChatGPT/Codex calls, PR-review bots, bridges, extra paid APIs, secondary repositories, new heavyweight/local AI models or libraries by default. Future options may remain documented but **inactive** until new owner authorization.
- Preserve **one existing GitHub repository**. Use private configurable persistent SQLite files and suitable backup/recovery; never assume ephemeral workspaces or private gold data belong in public Git.
- Focus **English-language** product advice, requests, review understanding and extraction. Do not add multilingual scope now.
- Never conflate manufacturer specs, consumer experiences, journalism, independent original test results, safety notices, or actual physical measurements. Respect rights/access/robots/terms/attribution and the evidence hierarchy; a publicly visible page is not a blanket copying permission.
- Audit **overrestrictive conditions** for false negatives without compromising identity attribution, safety or provenance. Avoid unconditional blocklists, blanket 'unknown' outcomes or ranking abstentions where proportionate evidence suffices.
- Do not silently import tools or implement a brand-new teacher architecture: inspect and reuse existing PEE modules first.
- Preserve all research and prior decisions in versioned history. Corrections should document the superseded proposition and reason, not erase it.

## Repeatable learning-and-development workflow

### 1. Diagnose an actual failure or knowledge gap

Reproduce from canonical running code or current datastore; locate the first failing step across: user intent → category → user need → technical requirements → source discovery → text/DOM segmentation → product/version attribution → scoped atomic semantic claim → source appraisal → comparable measurements → decision. Differentiate absent data from misunderstood language, inappropriate evidence and excessively restrictive gates.

Report a concrete baseline and explain why it matters to an ordinary buying decision. Do not optimize only for counts of extracted statements, tests passed or stored rows.

### 2. Teach the relevant *method*, not pre-set answers

Choose the smallest useful curriculum and grounded examples. Possibilities:

- **Category expertise:** operating principles, subtypes, user goals, consequential specifications, counterexamples, test methods, standards, measured outcomes, uncertainty and independent original sources.
- **Natural language/reviews:** implicit aspects, targets, negation, qualifiers, exceptions, scope, conditions, comparisons, coreference, subjective experience versus factual measurement; separate extracting *what was asserted* from proving *whether it is true*.
- **Engineering expertise:** reproduce issue, identify underlying error class, search relevant established approaches, test general fix, check regressions and negative outcomes.

Treat lesson conclusions as hypotheses unless supported. Enable contradiction and revision. Do not transfer category-specific technical conclusions merely because a teaching pattern generalizes.

### 3. Allocate research intelligently

Identify what is missing for a better decision. Compare expected value of information against research cost, likely source quality, user friction and error risk. Prefer evidence that could change advice over collecting more already-known low-value attributes. Budget search, audit source duplication/syndication, preserve recovery for previously dismissed sources, and stop only when justified by decision value and uncertainty—not an unconditional timeout or missing gold.

### 4. Use the existing implementation and keep experiments reversible

Inspect actual relevant modules, dependencies, source licences, hardware/storage costs and runtime limitations before changing code. A Claude-authored analysis or lesson is **not** proof that the deployed TypeScript runtime can perform the same reasoning. Distinguish deterministic program improvements, external grounded data, optional local inference proposals and merely human-readable plans. Benchmark proposed strategies on the real execution path before claiming improvements.

### 5. Test honestly, with equal budgets and explicit provenance

Where useful, compare (A) existing baseline, (B) fixed guided curriculum and (C) adaptive gap-directed curriculum on *the same cost/time/data budget*. Freeze implementation and evaluation inputs before first run. Isolate development data and genuinely untouched cases, archive initial runs, and prevent revisiting spent held-outs as 'new' evidence. Seek pre-existing third-party human-annotated language datasets and independently measured results when appropriate and lawful.

Label evaluation strengths accurately:

- **T1 — developer diagnostic:** Claude-authored synthetic/focused fixtures; proves mechanics, not external generalization.
- **T2 — unseen real-world inputs:** frozen first-run cases; if Claude selected or annotated them, they are **not author-independent**.
- **T3 — externally referenced truth:** documented pre-existing outside annotations, standards or original lab observations; evaluate source quality, license, domain fit and contamination.
- **T4 — truly separate blind adjudication:** currently **deferred**; no invented external reviewer, no masquerading as another Claude persona.

Track both gains and harms: semantically correct recovered claims; wrong target/model/variant attributions; missed conditional scope; new false positives; evidence validity; non-comparable metrics; actual need interpretation; unnecessary abstention; recommendation calibration; runtime/storage/search cost; cold-category transfer. No overclaiming from passing tests.

### 6. Version and report

For material work, record: problem and user consequence; current repo/version; relevant prior methods and direct source URLs; intervention and rationale; evaluation tiers and baseline; first-run untouched outcome versus subsequent tuned development; regressions; evidence/source rights; remaining uncertainty; decisions requiring owner authorization; rollback path; next highest-value task. Update historical assumptions only through explicit corrections. Proceed with routine work autonomously; request owner input only when a genuine decision is required.

## Recommended first application when Phase249 is completed

1. **Check completion first**: Verify Phase249 published status and final report. If not complete, do not assume its draft facts are validated or interrupt work to begin a new learning framework.
2. Inventory and audit existing category knowledge, source memory, advisory, natural-English intent, semantic review extraction, evidence and test modules.
3. Pick **one empirically demonstrated bottleneck** (possibly colloquial English needs or scoped multi-aspect review understanding), not 12 simultaneous redesigns.
4. Run a small baseline/fixed-curriculum/adaptive-curriculum pilot with external grounding where feasible, scope-limited budgets and T1–T3 evaluation. Maintain the option that the simplest approach wins.
5. Retain and integrate only evidence-backed gains. Report limitations, avoid false 'scientifically proven' assertions, and continue without repeatedly asking the owner for routine choices.

## Examples of appropriate tasks

- "Teach PEE how to map 'I don't want food that's half raw' to the right cooking-performance goal; distinguish linguistic comprehension from proof a model cooks evenly."
- "Diagnose why PEE loses a review's hard-floor exception, use original research on linguistic scope, and measure new false positives on unseen reviews."
- "Find a category's original performance-test methods, and teach PEE which questions distinguish marketing specifications from useful measurements."
- "Audit an extractor regression and improve Claude's repair method without overfitting to a handful of pages."

## Not a substitute for the next phase prompt

The skill makes a method reusable across sessions. The next **phase-specific prompt** must still be grounded in the *actual completed Phase249 results*, the latest branch and verified operational data. Do not mistake installation of this Skill for completed PEE functionality or approval of every historical proposal.
