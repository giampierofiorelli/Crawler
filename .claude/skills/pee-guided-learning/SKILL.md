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
- **Audit the whole user path before adding components** (reality check 2026-10-16). Thousands of passing module tests
  coexisted with a request path that cannot rank, and no authentic test evidence. Trace one real request through
  every stage, and score frozen requests against gold.
- **Authorise the resource, not the label** (Phase265). The Phase264 gate trusted the caller's `sitemap_metadata`
  label and any host passed to `allowDomain`, so a product page could have been fetched as "sitemap metadata". A gate
  must derive what it permits (domains, sitemap URLs, budget usage across runs) from its own validated responses and
  records.
- **Rehearse a single live run offline first, and log provider instructions** (Phase264). A fixture rehearsal of
  the one-shot pilot found that the per-host budget also capped Wikidata (4 allowed against 7 needed) before any request
  was spent. The live run then stopped on a 429 whose Retry-After value had not been logged. Record every stop
  instruction's value.
- **Measure the cause before relaxing a rule** (Phase263). Rights were suspected of discarding knowledge, but the store
  retained 2,385 of 2,385 observed facts. The loss was a missing pipeline connection (test leads never persisted)
  and misattributed rights gaps.
- **A host is not a document role** (Phase263). Report the publisher's known type as context only; a new document's
  role stays unknown until the document is reviewed.
- **Audit for existing capability by function, not by expected names** (Phase262). Phase261 searched for "search
  provider" and "web index", missed Phase223's search adapter, and wrongly called capability B absent. Before saying
  something does not exist, grep for the operation (for example `search`, `format=json`) and read the reports of
  neighbouring phases.
- **Search identifiers in their declared form; compare them in canonical form** (Phase262). A GTIN padded to 14
  digits will not match pages that print 13.
- **Check history before asking for new discovery, in metadata only** (Phase262). This separates rights withholding,
  extraction misses and identity limits from genuine absence; 17 of 19 genuine jobs were genuinely absent.
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

## 2a. Permanent engineering principles (owner instruction, 2026-10-16) — they govern every phase

The organising question of all PEE work is: **what is the smallest complete, safe, scientifically defensible path PEE
can execute today, and what is the next demonstrated obstacle to a trustworthy recommendation?**

| # | Principle | How it is enforced |
|---|---|---|
| 1 | Product outcomes over component counts: a phase states the user-facing capability it improves and demonstrates it. | Every report has a before/after table on the operational path (`scripts/phase266-reality-baseline.mjs` and frozen requests). |
| 2 | The consumer-request-to-decision path stays continuously testable. | `tests/vertical_path_fitness.test.ts` (fails when a connection is broken: fault injection included) and `tests/vertical_contract.test.ts`. |
| 3 | Reuse before implementation: audit existing behaviour (grep the operation, read neighbouring reports) before adding a component. | Name the existing owner in the report; new modules need a stated reason why no existing one can own the responsibility. |
| 4 | Investigate recurring failures: when a gap resembles an earlier one, find why the earlier fix did not protect the whole path. | `docs/architecture/vertical-contract.json` `openDebt` records the origin phase of each open gap. |
| 5 | Evidence tiers are never conflated: synthetic tests, authentic source processing, authentic independent-test evaluation and full operational advisory evaluation are reported separately. | Report metrics tables carry a tier column; the contract's status classes. |
| 6 | Autonomy with defensible safeguards: the system satisfies its own evidence requirements through verifiable procedures, never by inventing authority. | Ranking only from signed, verified catalogs (Phase181/180 gates); Phase265 rows can never rank (fitness test D). |
| 7 | Demonstrated improvement: baseline, intended improvement, actual improvement, regressions, remaining blockers. | Frozen runs committed unchanged; re-runs under new labels; benchmark diffs. |
| 8 | No silent loss of user intent: an unassessed objective stays explicit in the answer. | `Advice253.unassessedObjectives`; fitness test C. |
| 9 | Security before publication: public/private policy is checked on commits, not only on the working tree. | `.githooks/pre-push` runs `scripts/pee-publication-check.mjs` (fails closed without the private store); `--tree` and `--history` audits. |
| 10 | An incomplete vertical path is explicit technical debt, tracked until integrated, validated and operational — never re-announced as a new finding. | `vertical-contract.json` `openDebt`; the contract test requires every blocked or missing stage to be listed. |
| 11 | Every major new capability must eventually be validated on authentic external evidence on the operational path (owner brief, 2026-10-16). Synthetic tests prove wiring, not reality. Tiers stay distinct: T1 synthetic, T2 authentic controlled (authentic evidence through real components on a store copy, proposed policy or evaluation-only authority), T3 operational. | `vertical-contract.json` `authenticValidationRequirement` and the per-stage `authenticValidation` record; `tests/vertical_contract.test.ts` refuses a stage without it, and an `authentic_verified` stage without a T3 run. |
| 12 | Scientific knowledge integration: owner research packages are taught into the EXISTING knowledge architecture (Phase252 teaching: concepts, 'measurement' concepts, test conditions, `measured_by` / `not_sufficient_for` / `requires_condition` relations), keeping each claim's original status label and source; never copied wholesale, never promoted to product facts. Improvement is shown on frozen before/after request sets with untouched requests, not by import. | `src/phase269_research_teaching.ts`; `scripts/phase269-teaching-eval.mjs` (refuses to overwrite); packages kept unmodified in the private repo `research-packages/`. |
| 13 | Goal relevance is a ranking condition: a comparable measurement ranks a consumer outcome only when category knowledge says the measurement establishes that outcome. A proxy (e.g. fixed-duration empty-run energy for energy per cooked meal) is shown only as a labelled partial comparison with raw values and per-product limitations; owned equipment makes the decision a no-purchase check; a stated use that contradicts a test configuration makes the result incomparable. | `Advice253.goalAssessment`; `tests/phase269_goal_relevance.test.ts` (a proxy never ranks, even when a catalog labels it as the need). |
| 14 | Ranking authorisation is positive, never by default (owner review 2026-10-17): a scored dimension assesses an outcome only when category teaching links its measurement to that outcome (`measured_by`), the measurement is not a proxy for it, every required condition is met, and every stated outcome and factual need is assessed; missing knowledge refuses. Every path that consumes catalog evidence (ranking, partial comparison) uses the one verification `verifySignedCatalog181` (pinned key, signature, content and reference integrity, category, market, validity, permitted policy revision); a rejected catalog shows no measurement. Raw quantities carry `valueKind:'raw_quantity_only'` and never rank. | `outcomeAuthorised270`, `PARTIAL_COMPARISON_POLICY270` in `phase253_request_advice.ts`; `tests/phase270_ranking_authorisation.test.ts` (8 negative cases, 6 fault injections). |
| 15 | Held-out discipline for extraction: rules are written on development documents; a cue first seen while annotating held-out documents is removed before the single after-change run (or the run is reported as tuned). Duration, energy and cost stay separate measurands; tariffs, prices, bounds, ranges, settings and hypothetical figures are not results. | `scripts/phase270-untouched-extraction.mjs` (refuses to overwrite); `src/phase270_comparative_results.ts`. |

Before closing any phase: run the vertical fitness and contract tests, the publication check on the commits to be
pushed, the full suite, and update the contract if a stage's connection or status changed.

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
