---
name: pee-guided-learning
description: Working method, owner decisions and preserved cumulative research for developing the Product Evidence Engine (PEE, engine/product-evidence-engine-v5.67-phase243). Use whenever planning, implementing, evaluating or reporting PEE work, including a new phase; spec extraction or the restrictions audit; product or category knowledge and the SQLite knowledge store; source rights and retention; understanding English buying requests, needs or reviews; the advisory journey, decision layer or recommendations; independent evidence; gold sets and first-run or held-out evaluations; and diagnosing any PEE failure. Also use when reconciling new owner research or decisions with earlier ones. Claude is the sole developer; external AI reviewers are deferred.
---

# PEE guided learning and development

Use this skill to make PEE a better independent product-buying adviser. It covers three kinds of work:

- teaching PEE category expertise;
- improving how it understands everyday English requests and reviews;
- improving the code and evaluation through evidence.

**What it is.** A working method plus the owner's decisions and research.

**What it is not.**

- Proof that a capability exists.
- A phase brief.
- Authority for spending, new services, external agents or new owner decisions.

## 1. Read before acting, in this precedence order

1. **The owner's latest explicit instruction, and the repository as it is now.** The newest phase report under
   `engine/product-evidence-engine-v5.67-phase243/docs/phaseNNN/` and its code, tests and committed results decide
   the current status.
   - Check `git log` and the latest report before relying on any snapshot.
   - Report discrepancies; never overwrite newer work with an older picture.
2. **[references/current-state.md](references/current-state.md):**
   - the verified state when the skill was installed (Phase249 complete);
   - the map of existing modules to reuse;
   - the commands.
3. **[references/decisions-and-supersessions.md](references/decisions-and-supersessions.md)** says which earlier
   proposals are superseded and why. Superseded material is kept, never deleted.
4. **[references/owner-operating-rules.md](references/owner-operating-rules.md)** holds the owner decisions through
   correction IX, as delivered.
5. **[references/claude-only-feasibility-audit.md](references/claude-only-feasibility-audit.md)** says what Claude
   alone can and cannot demonstrate. It defines the four meanings of "independent" and evaluation tiers T1–T4.
6. **[references/research-v9-full.md](references/research-v9-full.md)** is the complete original research, v1–IX,
   kept byte for byte.
   - Navigate it with [references/research-navigation.md](references/research-navigation.md); grep its headings
     (`grep -n '^#'`).
   - Read the full passages before a design decision rests on them.
7. **[references/evaluation-and-reporting.md](references/evaluation-and-reporting.md)** covers how to evaluate and
   report material work: first-failure chain, A/B/C pilots, tier labels and the report checklist.

Never claim to have read a file you have not opened. In reports, say which sections you consulted.

## 2. Hard boundaries (owner decisions)

**How Claude works**

- **Claude is the sole development agent.** None of the following:
  - ChatGPT or Codex calls, bridges, automatic AI PR reviews or the OpenAI API;
  - simulated "independent" Claude personas;
  - courier requests to the owner.
- Research addenda VI and VII are archived proposals only. Reactivating them needs a new explicit owner decision.

**Infrastructure**

- **One code repository:** `giampierofiorelli/Crawler`, which is public.
- **Private SQLite store** in `$PEE_KNOWLEDGE_DIR`, with verified backup and restore.
  - Its persistent snapshot lives only in the **private** repository `giampierofiorelli/pee-knowledge`.
  - It is restored automatically at session start.
  - After changes: `save`, then commit and push. Details in `current-state.md`.
- **No new repositories.**
- **No paid licences or services.**
- **No heavyweight models or frameworks** without measured justification and owner authorisation.
- **English first.**

**Access and rights**

- Never bypass robots rules, 403/429 responses or access controls.
- **A public URL is not storage permission**; never grant yourself rights.
- **Reuse retained evidence before asking for research** (Phase255). Tell apart an absent declaration, a retained
  value that is not comparable, and a retained but incomplete one (no unit, unlabelled axes, a range on both sides).
  Only the first is new research. Never assume a unit. A quantity in a product name never overrides a declaration.
- **Validate new contracts on real retained data before persisting them** (Phase259):
  - synthetic fixtures hid that unknown roles were unrepresentable and that selection re-proposed pages already read;
  - never feed a pipeline invented text to make it run;
  - persist only what the store does not already hold (derive, don't copy).
- **Check rules against the real distribution of their inputs** (Phase261). A model-code rule missed the only exact
  identifier two real products had: a numeric GTIN. 15 of 19 job products have no cross-host identifier at all.
- **Keep discovery capabilities apart** (Phase261):
  - finding new documents in known, authorised channels is not finding new sources;
  - discovery yields leads, never identities, permissions or memory about unregistered sources.
- **Recognise an idempotent retry before state-dependent validation** (Phase261). A retried superseding record was
  refused, because its target was no longer active.
- **Persist new facts as journal events with a rebuildable projection** (Phase260):
  - validate inside the same write transaction as the append (validating first let two writers supersede one record);
  - assert each fixture's precondition: a stale robots date made a fixture metadata-only, and a "nothing changed" check
    passed vacuously.
- **A lower rank is not an exclusion** (Phase258): candidates outside a job's scope (another product, no
  permission) must be removed, not just ordered later. Record language ability per task (detection, extraction,
  terminology, semantics, faithfulness, translation): accepting a language tag or Unicode is not understanding.
- **Verify through the real downstream guards and logical state** (Phase257):
  - test a new output through the existing validators it must pass (a research question was blocked by the source-plan guard);
  - check store invariants by table content, not file bytes (opening SQLite in WAL mode rewrites the file).
- **Put authorisation where the side effect happens** (Phase256, S26):
  - a content hash is not authority;
  - pure planning must not require ranking credentials;
  - network reads, store writes and ranking each keep their own gate.
- **Never construct a Phase181 decision or authority by hand** (Phase254, S24). `planResearchGaps182` checks the
  decision's shape, not its signature; per-product research gaps exist only from a signed, verified catalog.
  Without one, research needs stay `pending_authorization` (`phase254_research_needs.ts`).
- **No retained declaration values in the public repository** (Phase253, S23). This includes evaluation outputs:
  commit public forms (ids, names, statuses, reason types, source URLs) and keep full runs in `$PEE_PRIVATE_EVAL_DIR`.
- Honour Content-Signal `ai-input=no`, TDM reservations and `noai` meta tags.
- Never commit third-party HTML or full articles.
- Confidential evaluation inputs go to `$PEE_PRIVATE_EVAL_DIR`, outside Git.

**Evidence**

- **Keep evidence types apart.** None of these may be promoted into another:
  - manufacturer declaration;
  - retailer listing;
  - reviewer or user claim;
  - editorial content;
  - independent original test;
  - regulatory safety notice;
  - methodology reference;
  - assistant hypothesis.
- **A declaration is never independent test evidence and never a ranking.** Missing evidence is not evidence of poor
  performance.
- **Never merge product identity on similar names.** Never attach evidence to the wrong variant.

**Evaluation**

- **Honest evaluation.** Keep gold separate from operational knowledge.
- First-run results are committed unchanged.
- A set is "spent" once used for tuning; never report it as held-out afterwards.
- Frozen does not mean author-independent.

**Restrictions**

- **Audit restrictions as a permanent priority.** Look for over-strict rules that lose legitimate facts, needs or
  answers. Keep the safeguards a demonstrated risk justifies. A rule is not good just because its tests pass.
- **The recommendation capability must work positively.** Justified action and justified abstention both need
  tests. A path that always abstains is not success.

**Autonomy**

- No premature autonomous-deployment infrastructure.
- Routine engineering choices need no owner approval.
- Escalate only these:
  - legal, rights or security decisions;
  - spending;
  - major architecture changes;
  - blocked access.

**Preservation**

- Preserve research and decisions.
- Corrections add a dated note saying what is superseded and why. They never delete or silently rewrite.

## 3. Workflow for material PEE work

1. **Verify reality.**
   - Check the branch, HEAD, latest phase report and `git status`.
   - Do not touch an unfinished phase's uncommitted work.
   - Measure baselines on the real code path.
2. **Diagnose the first failing link**, not the final symptom. The chain:
   request → category → need → technical requirement → source discovery or access → region or DOM → product or
   variant identity → scoped atomic claim → provenance and evidence grade → comparability → category relation →
   decision.

   Then classify the cause as one of:
   - missing data;
   - misunderstood language;
   - wrong evidence type;
   - an over-restrictive gate.
3. **Reuse before building.** Find the existing module in the reuse map in `current-state.md` and extend it. Never
   build a parallel "teacher brain", ontology or store.
4. **Teach methods, not answers.** The curriculum is the smallest set of grounded lessons and counterexamples:
   - category mechanics and test methods;
   - English scope, negation, conditions and coreference;
   - engineering diagnosis.

   Lesson conclusions are hypotheses until evidence supports them. Never carry technical conclusions across
   unrelated categories.

   Keep the words users literally write for a need. Research adds structure (requirements, measures, insufficient
   proxies, clarifications), not better phrasing: in Phase252, situational phrases recalled 20/44 needs against 28/44
   for literal words.
5. **Spend research on decision value.** Pursue evidence that could change the advice. Budget the requests, collapse
   syndicated copies into one original source, and stop on decision value, not on a timeout.
6. **Test honestly.**
   - Freeze code and gold before a first run.
   - Compare A (existing) with B (fixed lesson) and C (adaptive) under equal budgets when the choice is genuinely
     open.
   - Label every result T1, T2, T3 or T4 (T4 is deferred).
   - Report gains and harms with denominators: new false positives, wrong attributions, unnecessary abstentions and
     cost.
   - Keep a change only if the evidence supports it. Otherwise revert it or label it a prototype.
   - A rubric only one arm can satisfy measures a capability, not generalisation: report it apart from category,
     need and decision quality.
7. **Separate developer capability from runtime capability.** Claude understanding a review does not mean PEE's
   shipped TypeScript does. Measure the deployed path.
8. **Version and report.** Commit reproducible evidence, run the full suite (`npm test`) and write the phase report.
   The checklist is in `evaluation-and-reporting.md`. State plainly what was and was not verified.

## 4. Typical tasks this skill guides

- Raising need recall on real English requests without losing precision. Need recall is the main Phase249
  weakness: about 0.4–0.6.
- Turning retained product declarations into graded category knowledge. Keep these separate:
  - observed vocabulary;
  - hypothesis;
  - method reference;
  - evidence-supported relation.
- Finding lawful, comparable independent measurements so a signed Phase180 ranking becomes possible.
- Diagnosing an extractor regression on untouched pages without overfitting to a handful of hosts.
- Interpreting a review's scope ("great except on thick carpet"): represent what was said before judging whether it
  is true.

Each new phase still needs its own brief, grounded in the latest completed phase. Installing this skill completes no
part of the research programme.
