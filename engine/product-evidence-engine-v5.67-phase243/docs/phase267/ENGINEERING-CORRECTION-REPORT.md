# Engineering Correction and Vertical Integration

**Date:** 2026-10-16. **Base:** `b5cba60` (reality check), verified clean.

**Store:** verified; live = remote; 1,374 events.

This is an engineering correction, not a conventional phase. No network request was made; the private store was not
modified. Every evaluation ran on copies or isolated in-memory stores.

**Evidence tiers:**

- **[T1]**: synthetic;
- **[auth]**: authentic material;
- **[op]**: operational path.

## A. Publication integrity (S23)

**What `f388d3a` published.** Three retained declaration values, each bound to its named product, in
`evaluation/phase266/requests.json`: one price and two water-tank capacities. They are not repeated here.

**Reach:**

- pushed to `origin/claude/typescript-network-transport-test-1givnd`, the **only** remote branch;
- no tags, **no pull requests** (checked through the GitHub API);
- `1dc5630` removed the values from the current file only.

**Wider exposure, found by the new history audit** (`scripts/pee-publication-check.mjs --history`, 139 commits).
`f388d3a` is one instance of an older pattern:

| Class | Where | Still in the current tree? |
|---|---|---|
| Phase253 advice runs with retained `rawValue` prices | `eac647d`, `771158e` (about 120 lines) | No (removed by `5c4081a`; history only) |
| Phase266 gold | `f388d3a` (3 values) | No (history only) |
| Phase245–249 extractor-evaluation outputs ("Product \| Property = {value}") | 43 files, about 204 value rows, under `evaluation/phase245`–`phase249` | **Yes** |
| Phase246/247 gold and export files with value objects | 3 files, 84 value objects | **Yes** |
| Report tables quoting product values | for example `docs/phase255` | **Yes** (a few lines) |

- The pre-S23 files date from before S23 existed: S23 covered advice runs only.
- **Guard precision:** on the current tree the line rule reports 38 findings in 21 files. A local sample showed true
  exposures and false positives (generic fixture names, "5G" read as grams, standards text). The structural counts
  above are the better measure of what is exposed.

**Options and risks:**

1. **Make the repository private** (owner, GitHub settings).
   - Immediate; covers the tree and the history; reversible.
   - The public design repository becomes private.
2. **Forward redaction of current files** (a new commit replacing values with public forms, full copies kept
   privately).
   - Follows the `5c4081a` precedent.
   - Alters committed first-run evaluation files, which conflicts with "first-run results are committed unchanged"
     unless full copies are preserved privately.
   - History is unchanged.
3. **History rewrite** (`git filter-repo`, replacing the text or removing the affected paths, then force-push).
   - Only one branch and no PRs, so the collateral on GitHub is small.
   - It breaks every existing clone (including session checkouts) and changes every commit hash after the first
     affected one (Phase244 onward).
   - **It needs explicit owner authorisation.**
4. **Residual after any option:** copies already fetched or forked; GitHub keeps unreferenced commits reachable by SHA
   until garbage collection (a purge needs a GitHub Support request); search caches.

**Safest correction:** option 1 now, then 2 (redact, with full private copies), then 3 only if the owner requires a clean
public history. All three are owner decisions; none was taken. No force-push, branch deletion or rewrite was done.

**Preventive mechanism (implemented):**

- `src/publication_guard.ts` and `scripts/pee-publication-check.mjs` check what commits **add**, against the private
  store's 2,385 retained declarations.
  - **Finding rule:** a distinctive product-name bigram or an exact multi-word product name, plus that product's own
    value written with its unit or currency, or as a two-decimal price.
  - **Ignored:** values printed in the product's own name, URLs, and bare numbers.
  - **Refused by path:** private artefacts (`*.sqlite`, `private-eval/`, `*-full.json`).
- **Modes:** default (unpushed commits), `--range`, `--history`, `--tree`. It fails closed without the private store.
- `.githooks/pre-push` runs it on every push; `core.hooksPath` is set by the session-start hook.
- **Verified:**
  - detects 3/3 values in `f388d3a`; `1dc5630` and later commits are clean;
  - the hook refuses the violating range (exit 1) and passes a clean one;
  - `tests/publication_guard.test.ts` (3 tests, fictional data) shows detection, and passes names, unbound values, user
    limits, name-borne values, URLs and an explicit `pee-publication: allow` marker.

**Push decision.** The new commits are guard-clean, and pushing them does not complicate any option (a filter-repo
rewrite rewrites descendants too). They were pushed only after the guard passed on the exact range, through the hook.

## B. Why integration gaps recurred

| Gap (reality check) | First identified | How earlier phases handled it | Class |
|---|---|---|---|
| Request path cannot reach ranking | Phase248 ("`rankingAuthorized` always false") | Phase249 added the Phase180 route inside `decideAdvice249`, proven by an isolated synthetic test; Phase253 connected request → `decideAdvice249` but passed no release, and **fixed `ordered:false` / `rankingAuthorized:false` into the `Advice253` type** | Fixed for a narrower path; a safety deferral **encoded as a structural disconnection** |
| No producer of the signed catalog or release | Phase249 (§5: "only through a signed Phase180 release"); Phase253 gap audit F2/F5 ("the Phase180 ranking can never activate"); Phase254–257 | Recorded each time as needing an owner decision; never escalated as a tracked blocker | Missing ownership or authorisation decision; missing downstream consumer |
| Phase265 measurements cannot reach decisions | Phase265 (by design: unreviewed staging) | Correctly kept out of ranking; no validation step was specified | Missing downstream consumer (evidence validation not designed) |
| Web surface disconnected from the store path | Phase178 (built before the store) | Never revisited | Missing downstream consumer, unresolved interface |
| Ranking works only on fixtures | Phase180/181, Phase249 tests | Only synthetic tests | Capability that existed only in synthetic tests |

**The recurring pattern.** Each phase closed on its own stage contract with tests on synthetic inputs, and judged
safety by the **absence of unsafe output** ("0 unsafe rankings"). Nothing required the **positive** end-to-end
capability to remain reachable. So a deferral ("no ranking until reviewed evidence exists") silently became a
disconnection (no route even when it does). Continuation prompts moved to the next stage, and the owner decision on
review and signing authority was never tracked as open debt.

**Process change** (now in the skill, §2a):

- a permanent vertical fitness test with fault injection;
- a machine-readable contract whose test fails when a stage loses its component or its test;
- open debt tracked by origin phase;
- authorisation gates refuse at run time instead of being removed from the path.

## C. Operational architecture map

The machine-readable map is `docs/architecture/vertical-contract.json`, enforced by `tests/vertical_contract.test.ts`.

| Stage | Component | Status |
|---|---|---|
| Request | `adviseFromRequest253` | authentic_verified (limited) |
| Goal interpretation | `runJourney248`, `purchaseTarget253` | authentic_verified; performance-need vocabulary partial |
| Technical requirements | `extractConstraints253`, Phase177 | authentic_verified |
| Candidates | `eligibleCandidates253`, `decideAdvice249` | authentic_verified (store); new discovery **blocked** (no live acquisition authorised) |
| Authentic evidence | Phase225/226/265 | **blocked**: 0 authentic test documents; synthetic only |
| Attribution | `subjectAssociation265` | synthetic_verified |
| Evidence validation | — | **not_implemented** (D1) |
| Comparable assessment and scoring | — | **not_implemented** (D2) |
| Authorised ranking | `dynamicKnowledgeAnswer181`, `reviewedFirstAnswer180` | **synthetic_verified, now connected**; production disabled |
| Explainable answer | `Advice253` | synthetic_verified (ranked); authentic_verified (shortlists) |
| Web surface | `createPhase178Server` | disconnected (D4) |

## D. Architectural fitness tests (implemented, all passing)

| Property | Test |
|---|---|
| A. End-to-end continuity | `vertical_path_fitness`: the real request reaches the authorised Phase181 ranking |
| B. Positive and negative decisions | correct ranking (over-budget best-scorer excluded; unreviewed product held); no ranking for 6 unauthorised or insufficient variants (no context, untrusted signer, expired, tampered, no covering dimension, no measurements) |
| C. Intent preserved | budget and taste objective both kept; "Not assessed" stated whenever unranked |
| D. Evidence integrity | a staged Phase265 measurement does not move the order; declarations alone never order |
| E. Determinism | identical answers for a reordered catalog; ties share a rank |
| F. Public/private | `publication_guard` tests and the pre-push hook |
| G. Regression detection | the probe fails for 4 injected faults: ranking context dropped, budget lost, objective dropped, need vocabulary removed |
| Contract | `vertical_contract`: components exist, cited tests exist, blocked or missing stages are listed as debt |

## E. Minimal vertical integration — achieved on synthetic evidence

`adviseFromRequest253(text, store, registry, {ranking:{catalog, authority}})` is the change, inside the existing
orchestrator, with no new engine:

1. Stated performance needs that a reviewed catalog dimension covers are confirmed through Phase177 `state_in_request`,
   with the request's own words as provenance.
2. The existing `dynamicKnowledgeAnswer181` verifies the signature, expiry, category, market and coverage, then ranks.
3. The order is restricted to products that passed every stated factual check (`decideAdvice249`).
4. The answer cites original tests and keeps the signature caution.
5. Without valid authority, the specification answer stands, with explicit unassessed objectives.

For "Which espresso machine makes the best-tasting traditional Italian espresso for under £600?" over 4 fictional
machines and a synthetic signed panel catalog [T1]:

- B2 ranks first and A1 second;
- C3, the best taste score but over budget, is excluded;
- D4, in budget but unreviewed, is held;
- the taste objective is assessed.

The **contract change** is that `Advice253.ordered` and `rankingAuthorized` are booleans, true only for
`ranked_recommendation`. `unassessedObjectives` is added.

**Vocabulary:** `espresso_quality` aliases were added to `CONCEPT_VOCABULARY248` ("best-tasting", "tasting espresso",
and so on). The live store still uses its seeded aliases; reseeding (`phase246-knowledge.mjs seed-vocabulary`) is an
operator step and was not run.

**Production ranking stays disabled:** no CLI or surface supplies a catalog, because none exists.

**Measured on the operational path [op]:**

- `evaluation/phase266/after-integration.json` and the 43-case Phase253 benchmark keep identical responses and
  product lists (7/7 and 43/43);
- R4, R5 and R7 now state their unassessed objective ("best-tasting traditional italian espresso", "quietest coffee
  machine", "best air fryer");
- one Phase253 case states a recognised unassessed need ("smooth texture");
- generic phrasings ("best way", "best type", "best option") are filtered after a first pass showed 3 false triggers.

## F. Autonomous evidence-to-ranking architecture (design; not implemented)

| Responsibility | Reuse | Automatable? | Owner decision needed |
|---|---|---|---|
| 1. Evidence validation (originality, method, conditions, exact variant, provenance, independence, uncertainty) | `test_measurements265` rows; Phase200 custody and scope-reviewer attestations; Phase193 screening | Exact variant, provenance, method and conditions present, unit validity, duplicates and conflicts: **yes**. Publisher independence: only against an owner-approved register of test publishers (conflict of interest, method disclosure) | Independence criteria and register; a schema policy change allowing a state beyond `unreviewed` |
| 2. Normalisation | `comparable249` unit factors; Phase172 domain protocol registry | **Yes**, within one protocol and method; incompatible protocols are never merged | None beyond the protocol list |
| 3. Criterion scoring | Phase181 `valuePoints` and `weightUnits` | **Yes**, once a versioned per-dimension policy is approved (monotone mapping between reviewed anchors, no extrapolation, no score from incomplete observations) | Scoring policies (one review per dimension, not per recommendation) |
| 4. Release integrity | Phase181 catalog and Ed25519 verification | Compiling the catalog: **yes**. Signing certifies that the automated checks passed under named policy versions, not scientific validity | Who holds the key; whether policy-bound automatic signing is allowed |

**Subjective outcomes** (traditional Italian espresso taste) need specialist panel results attributed to their source
(`originalTestId` = the panel's publication). The engine never scores taste itself.

**Nothing in F was implemented:** each step needs an owner decision above, and building it now would pre-empt them.

## G. Authentic evidence: the next experiment

The reality-check inventory still holds; no new resource was found. There are 0 original test documents. The minimum
package is 3–5 original professional tests of coffee machines or air fryers, covering 2+ exact variants already in the
store. Each document needs:

- source and original publication, method and date;
- exact model and variant;
- measured criteria with values, units and conditions;
- the publisher's independence statement;
- rights and permitted processing (private retention under Phase249; no publication).

For taste, it needs a named specialist panel. Supplying the documents is not permission to publish them.

**Blocking dependency:** the owner's rights decision, or supply of the package.

## H. Measured results

| | Before | After |
|---|---|---|
| Request → authorised ranking reachable | No (structurally impossible) | Yes, with a verified catalog [T1] |
| Unauthorised or insufficient evidence ranked | 0 | 0 (6 variants tested) |
| Unassessed objective stated (R4, R5, R7) | 0/3 | 3/3 [op] |
| Decisions changed on 7 + 43 frozen cases | — | 0 |
| End-to-end fitness and contract tests | none | 7 (4 + 3), with 4 fault injections detected |
| Commit-level publication check | none | pre-push hook; history and tree audits |

- **Safeguards intact:**
  - signature, expiry, category, market and coverage gates (Phase181);
  - exact-identity attribution;
  - Phase249 retention;
  - Phase265 rows never rank;
  - manufacturer declarations never order products.
- **Unproven:** any authentic test extraction, validation, scoring or ranking.
- **Remaining debt:** D1–D4 in the contract.
- **Full suite (`npm test`):** 4,503 tests passed across 19 shards, exit 0.
- **Store:** verified; live = remote; unchanged.

## Answers

1. **Smallest complete, defensible path today:** request → category and stated limits → cited, unordered specification
   shortlist from authentic declarations, with unassessed objectives stated. A ranked answer is possible only from a
   verified signed catalog; none exists.
2. **Components:** `adviseFromRequest253`, `runJourney248`, `extractConstraints253`, Phase177, `decideAdvice249`,
   Phase181.
3. **Repaired and tested:**
   - request → Phase181 ranking (synthetic catalog);
   - intent preservation;
   - commit-level publication guard.
4. **Can a request reach a justified ranking with authorised controlled evidence?** Yes [T1], through the real entry
   point; unauthorised evidence is held.
5. **Still needed for authentic evidence:**
   - authentic original tests (rights);
   - an evidence validator, scoring policies and a catalog signing authority (owner decisions, §F).
6. **How future breakage is detected:** `vertical_path_fitness` (with fault injection), `vertical_contract`, the
   publication pre-push hook, and the skill's §2a closing checklist.
7. **Highest-impact next engineering task:** after the owner decides §F's scoring and signing policy, implement the
   validator and catalog compiler (D1/D2) from `test_measurements265` to a Phase181 catalog. Exercise it with the
   existing fitness probe on the first authentic test package.

Stopped for independent review.
