# Phase251 technical report: validating guided learning, category assignment, external and semantic checks

Branch `claude/typescript-network-transport-test-1givnd`.

- **Starting point:** `3d47e2e`, the Phase250 report.
- **Freeze before the new set:** `ac4e953`.

**Labels used throughout:**

- **first run:** the code was frozen, collection and scoring rules were pre-registered, and the gold was committed before
  the run; results were committed unchanged.
- **development:** the code was changed after seeing the material.
- **Tiers:** T1 synthetic, T2 real requests with Claude-authored gold, T3 pre-existing human labels.
- **Gold:** no gold here is independently adjudicated.

## Contents

1. Starting state and persistence
2. First run of A, R and D on untouched set 4
3. Generalisation failures and development changes
4. Category assignment for uncategorised products
5. Observations turned into useful category knowledge
6. External human-annotated data
7. Review semantics: diagnostic on the deployed runtime
8. Research consulted
9. Rights, access and compliance
10. Unresolved, and why
11. Tests
12. Rollback and next steps

## 1. Starting state and persistence

**Verification at start:**
- Branch and HEAD matched `origin`.
- `knowledge-snapshot.mjs verify` on `origin/main` (`d704bd8`): integrity, journal and counts OK; the live store was
  equal in content.

**Test item.** The persistence test item `pee_write_test` was retired, with the owner's agreement:
- new journaled method `retireCategoryItem246`;
- the item is kept in the table and no longer returned;
- synced as `ff4c80d`.

**Store changes this phase.** Every change went through `sync` and was verified on `origin/main`:

| Commit | Change | Verified state |
|---|---|---|
| `ff4c80d` | test item retired | — |
| `7efa0c3` | 57 category assignments | integrity OK, journal OK, live content = remote |

- Nothing private entered the public repository.
- The sync workflow was not redesigned.

## 2. First run of A, R and D on untouched set 4

**Protocol.** `evaluation/phase251/protocol.json`, committed with the freeze `ac4e953` before any candidate was
collected or read. It fixed:
- the arms;
- one base snapshot for every arm (`pee-knowledge` `f9f20cc`), so products and declarations are identical across arms;
- the sites and quotas;
- a sha256 sampling order;
- the screening rules;
- decision-quality scoring.

**Arms:**
- **A:** the Phase249 journey;
- **R:** the generic repairs only;
- **D:** the repairs plus `ADOPTED_LESSONS250`.

**Material.** 50 Stack Exchange questions, collected through the official API only:

| Site | Questions | Quota |
|---|---|---|
| cooking | 18 | 20 |
| coffee | 4 | 12 |
| diy | 10 | 10 |
| hardwarerecs | 10 | 10 |
| bicycles | 8 | 8 |

- Cooking and coffee fell short of quota because their eligible pools ran out.
- Every exclusion is logged with its reason: `screening.json`.
- Gold was committed (`e388ed3`) before any arm ran.

**What the sampling produced.** The sampling was not curated toward the curricula. As a result:
- only 5 cases concern catalogue categories (4 listed needs);
- 45 are other products: hardware, bicycle parts, pans, knives, accessories, DIY.

This set therefore measures harm and abstention well, and need recall poorly.

**First-run results.** T2, committed unchanged (`88a1edb`).

| Arm | Correct (of 50) | Harmful (wrong category) | Unhelpful abstention | Advise cases correct (of 5) | Needs found (of 4) | Need precision | False needs on out-of-scope cases | Budgets correct (of 50) | Unsafe rankings |
|---|---|---|---|---|---|---|---|---|---|
| A | 40 | 9 | 1 | 1 | 0 | 0/6 | 5 | 47 | 0 |
| R | 44 | 5 | 1 | 1 | 0 | — | 0 | 48 | 0 |
| **D** | **46** | **3** | 1 | **4** | **3** | **3/4** | 0 | 48 | 0 |

**Paired differences** (per case; better / worse / same):

| Comparison | Decisions | Needs |
|---|---|---|
| R vs A | 4 / 0 / 46 | 5 / 0 / 45 |
| D vs R | 3 / 1 / 46 | 2 / 0 / 48 |
| D vs A | 7 / 0 / 43 | 7 / 0 / 43 |

**Reading:**
- **Generic repairs and category teaching both help, separately.** The repairs removed 4 harmful attributions (A → R).
  The lessons added 3 correct advise decisions and 3 correct needs (R → D).
- **One worsening (D vs R):** an espresso filter basket question went from correct to unhelpful (ambiguous).
- **Remaining harmful decisions in D (3):** a coffee roaster, an Aeropress filter and a French press were sent to
  coffee machines by the weak cue "coffee".
- **Sample size.** It is small, especially for advise cases (5); no significance is claimed.

**Cost:**
- 25 API requests;
- runtime per 50 cases: A 0.57 s, R 0.60 s, D 1.59 s.

## 3. Generalisation failures and development changes

Set 4 is spent after its first run. Everything here is **development**, evaluated on all spent sets (Phase248 dev and
held-out 1–2, Phase249 real sets 1–2, Phase250 set 3, Phase251 set 4) and on QueryNER (§6).

**Failure analysis by type (first run):**

| Failure type | Example | Outcome |
|---|---|---|
| Product mentioned versus requested | the cue "coffee" decided coffee machines for a roaster, an Aeropress filter, a French press | fixed (`dropCues`) |
| Accessories versus complete products | "Aeropress metal filters", "espresso filter basket"; on QueryNER, "parchment paper for air fryer", "liners for air fryers", "toaster warming rack" | partly fixed (below) |
| Owned versus intended purchase | handled by the Phase250 ownership rule | no new failure |
| Rejected products | — | no new failure |
| Shared needs inferring a category | — | no new failure |
| Long questions | — | the long-request rule remains |
| Budgets | "pans below $60, $60 to $130, over $130" (price tiers) read as a limit; "Budget of between £200 and £350" missed | fixed |

**Changes kept.** Each is a general mechanism:

1. **`dropCues` in lessons; "coffee" withdrawn as a coffee-machine cue.**
   - Coffee names beans and the drink, which many products share.
   - All spent sets: set 4 harmful 3 → 0 and correct 46 → 48; set 3 wrong attributions 4 → 2 at the cost of one
     correct category; Phase248/249 sets unchanged.
   - Rejected alternative: reinstating B's manual-brewer lesson lowered need recall on set 3 (10 → 7 of 24).
2. **Budget parser.**
   - "between X and Y" ranges.
   - Three or more prices with only comparative anchors ("below", "under") are treated as price tiers, not the user's
     limit; strong anchors (budget, spend, or less, tops, `<`) still count.
3. **Complements in short queries.**
   - Applies to requests of at most 8 words: "<thing> for (a|my|the) <product>" buys the thing, unless the words before
     "for" are a buying, search, budget or space expression.
   - Accessory nouns after a product name are recognised (rack, liners, trays, mats, covers…).
   - Restricted to short requests because in a sentence ("limescale is a problem for coffee machines") "for" is a
     purpose; the unrestricted version broke Phase248 dev d06.

**Tried and rejected: a selective alternative to the long-request rule.**
- Idea: read paraphrases only in request sentences (questions; want / need / looking-for sentences) instead of
  switching them off on long requests.
- Result: it recovered neither lost technical need (r02, s06) and added false needs: real set 1 +3, set 2 +2,
  set 3 +4. Set 4 correct decisions fell 48 → 46.
- Decision: reverted. The Phase250 rule stays. Mechanism questions on long requests remain a known loss.

**Development result of the current code (D′):**

| Set (spent) | Correct | Harmful | Unhelpful | Needs | Budgets | Wrong attributions |
|---|---|---|---|---|---|---|
| Set 4 | 48/50 | 0 | 2 | 3/4 | 50/50 | — |
| Set 3 | — | — | — | 10/24 (precision 0.714) | 73/73 | 2/73 (A: 15) |

**This configuration has no untouched first run.**

## 4. Category assignment for uncategorised products

**Why categories were missing.** 81 products (1,020 retained declarations, 43% of 2,385) came from the Phase249
extraction held-out pages:
- those pages were collected category-agnostically;
- their manifests record no category;
- so ingestion received no category hypothesis.

Raw pages are not stored. Nothing in the product data was wrong; the category evidence was simply never recorded.

**Method.** New module `src/phase251_category_assignment.ts`, writing through the new journaled store method
`assignProductCategory251`. The evidence is the source's own description of **that** product:

| Evidence | Condition |
|---|---|
| declared_type | a declared "Product type" or "Main category" property |
| declared_name | a category noun in the declared name, from a general lexicon of 44 categories |
| source_taxonomy | a category noun in the page path, only for single-product pages |

**Guards:**
- **accessory:** an accessory word that heads the name, not negated ("without battery and charger") and not part of a
  category noun ("stand" in "stand mixer");
- **bundle:** two category nouns in the name;
- **conflict:** evidence that disagrees;
- **no evidence:** stays unknown.

No similar-name inference or identity change is used anywhere. Assignments are hypotheses, with their basis journaled.

**Gold.** Written before the method (`category-assignment-gold.json`). This is development material: no untouched
uncategorised products exist.

**Results:**

| Run | Assigned | Correct | Wrong | Declarations correctly categorised |
|---|---|---|---|---|
| First pass | 55 | 55 | 0 | 820 |
| After the accessory-guard correction | **57** | **57** | **0** | **842 of 1,020** |

- The accessory-guard correction was needed because a negated or non-head accessory word ("without charger", "Power
  Grip … Clipper") had blocked 2 products.
- Justified unknowns: 10 (5 accessories, 3 extraction artefacts such as "4000 Series", 1 bundle, 1 unknown).
- Products left unknown although their category is known to the annotator: 14. These are model codes with no category
  word in the name or URL ("KB904L", "ATH-SQ1TW2", "Roccbox", "eufy 11S MAX").
- 41 variants inherit their product's category; 0 variant collisions.

**Coverage.**
- Declarations on categorised products: 1,365 → 2,207 of 2,385.
- Categorised products: 107 → 164 of 188.

**Identity defect found.** One store product, "20 Litre Microwave Oven", carries the declarations of **two different
Sharp models** (MS02EB and QS204AEB).
- Cause: Phase246 keys identity by host + name when no model identifier is declared, and both pages use the same
  generic name.
- The raw pages are not stored, so the identity cannot be re-derived.
- **Mitigation (kept):** `candidatesFromStore249` flags a product whose name-only identity spans several model pages.
  `decideAdvice249` never reports such a product as meeting requirements; it reports it as unknown with the reason.
- Before the fix, the decision layer had produced a shortlist that cited both models for one product.

## 5. Observations turned into useful category knowledge

`scripts/phase251-observational-knowledge.mjs` counts per category, with duplicates controlled.

- **Observed attributes:** declared labels on at least 2 products **from at least 2 hosts**, so one site's many
  models count once. Frequency is never read as importance.
- **Checkable factual criteria:** SPEC_CRITERIA249 keys with comparable declared values on at least 2 products from
  at least 2 hosts. These are exactly what `decideAdvice249` needs for a cited shortlist.

| | Before assignment | After |
|---|---|---|
| Categories with products | 21 | 44 |
| Observed attributes (2+ products, 2+ hosts) | 21 | 44 |
| **Categories with at least one checkable factual criterion** | **5** | **13** |
| Checkable criteria | 15 | 28 |

New checkable categories:
- dehumidifiers;
- frying pans;
- headphones;
- keyboards;
- microwave ovens;
- running shoes;
- tents;
- waste bins.

**Competence test (factual requirements, real store copy).** "Microwave of at least 20 L and 800 W":
- before assignment: no category, no answer;
- after: a cited, unordered evaluation of 3 microwaves.
  - With the identity guard, the merged Sharp product is reported unknown, and two products are unknown because their
    sources disagree (800 vs 1,000 W).
  - The decision is `withhold`: correct, but not yet a positive shortlist.
  - Without the identity guard, it would have been a wrong positive.

**Not changed:**
- Unseen-request understanding did not change: the request registry does not include these new store categories.
  Questions about them are still out of scope (§10).
- No hypotheses, method references or evidence-supported relations were created from observations:
  - frequency is not evidence;
  - no relation is supported (0 before and after).
- No redundant `observed_pattern` items were written.

## 6. External human-annotated data

| Resource | Licence / access | Used? | Why |
|---|---|---|---|
| **QueryNER** (`bltlab/queryner`) | CC BY 4.0; HF robots allow; official datasets-server API (no new dependency) | **Yes**, T3 | Human spans for the core product type versus modifiers fit "product versus accessory or related item" |
| Amazon ESCI (`amazon-science/esci-data`) | Repository Apache-2.0 | No | Data are large parquet files that need a new dependency to read. Its "Complement" label would suit accessory relations; candidate for later with a lightweight reader. |
| WDC PAVE | Licence not found on the page | No | Not used without established terms |

**QueryNER rules** (`queryner-summary.json`). Labels are mechanical from the human spans:
- **product case:** a registry alias inside a `core_product_type` span;
- **not-product case:** the alias is in a modifier or other span.

The raw rule mislabelled substrings ("toaster" inside "toaster oven") and non-coffee grinders. The post-run
**exact-span** rule (the human core span equals the alias) is reported beside it.

| Train split, 7,841 queries | R | D |
|---|---|---|
| Product cases, exact span | 23/23 | 26/29 |
| Product cases, raw rule | 28/33 | 31/44 |
| Not-product cases, wrong attributions: first run | 4/4 | 4/4 |
| Not-product cases, wrong attributions: development | 1/4 | 1/4 |

- D's 3 exact-span misses are cautious abstentions on "Porlex / Jura grinder" queries that carry no coffee word.
- The test split (993 queries) contains only 2 usable cases: both correct.

**Scope of these labels.** They measure product-type versus modifier recognition, not consumer needs. **No
human-annotated benchmark of consumer needs in buying questions was found.** Need evaluation stays T2.

## 7. Review semantics: diagnostic on the deployed runtime

Script: `scripts/phase251-review-semantics-diagnostic.mjs`.

**Design (T1).**
- 12 synthetic contrast statements adapted from research v9 Addendum IV §2.1 probes.
- A **scripted provider** (not a model) proposes one correct and one wrong interpretation per statement to the Phase110
  runtime (`extractReview110`).
- The wrong interpretations cover: negation dropped, qualified criticism read as praise, condition dropped,
  surface-specific criticism generalised, variant swapped, comparison reversed, manufacturer claim promoted to a test,
  unverified recall stated as fact, expectation taken as result, implicit aspect mis-mapped, wrong number, ungrounded
  span.

**Results:**
- Correct interpretations accepted: 12/12.
- **Wrong interpretations rejected: 2/12.** Only the wrong number (numeric anchor gate) and the ungrounded span were
  caught.
- **All 10 meaning errors passed**, consistent with the module's own declared scope
  ("offset_and_shape_only_not_semantic_entailment").
- With no model, the runtime produced **0** interpretations.
- Phase113 flags negation for adjudication ("negation_requires_scope_adjudication") and abstains; it does not resolve
  negation scope.

**Conclusion.**
- The deployed TypeScript runtime has **no native review comprehension**. It validates shape and grounding of proposals
  from an external model.
- What Claude understands as developer is not runtime capability.
- **Recommended next step:** cheap deterministic coherence checks in the Phase110 validator:
  - an "unless / if / only when" span with no condition code;
  - "claims / says / according to" with direct-test evidence;
  - "looked like / could not find / might" stated as observed;
  - "my old / previous" attributed to the reviewed product.
- No second semantic engine was built.

## 8. Research consulted

**Skill files:**
- `SKILL.md`;
- `current-state.md`;
- `decisions-and-supersessions.md`;
- `evaluation-and-reporting.md`.

**Research v9.** Addendum IV §1–5, read in Phase250. It informed the §7 statement design: the §2.1 probes and the
CheckList contrast-pair method, §3.

**External sources:**
- QueryNER dataset card and licence: `https://huggingface.co/datasets/bltlab/queryner`, CC BY 4.0, arXiv 2405.09507;
- ESCI README and LICENSE: `https://github.com/amazon-science/esci-data`, Apache-2.0;
- WDC PAVE page: `https://webdatacommons.org/structureddata/wdc-pave/`, no licence found.

## 9. Rights, access and compliance

**Stack Exchange.**
- API only, with Node's built-in proxy setting (`NODE_USE_ENV_PROXY=1`).
- 25 requests.
- CC BY-SA attribution per case (`NOTICE-CC-BY-SA.md`).
- Raw responses stay in `$PEE_PRIVATE_EVAL_DIR`.

**QueryNER.**
- CC BY 4.0, read through the official API: 89 requests, 1 s apart.
- Raw rows stay private. The repository holds only counts and four short example queries, with attribution in
  `queryner-summary.json`.

**General:**
- No site pages were crawled.
- No robots rule or access control was bypassed.
- No private data entered the public repository.

**ECC plugin.** It was activated this session at the owner's request. Its GateGuard hook demanded fact statements
before edits; these were provided and complied with. No ECC agent or external AI service was used for development.

## 10. Unresolved, and why

- **The current configuration (D′) has no untouched first run.** Set 4's first run validated D, not D′.
- **The next set needs more advise cases.** A pre-registered plan with appliance-heavy sources is needed: set 4 had
  only 5.
- **Request understanding for the newly categorised store categories** (microwaves, dehumidifiers, monitors…). The
  registry does not name them, so questions about them are out of scope. Extending the registry needs the same
  lesson-and-evaluation discipline.
- **Identity:** the Sharp merge is flagged, not split. Splitting needs the pages re-fetched, within robots and retention
  rules.
- **14 products** remain uncategorised: no evidence.
- **Review comprehension:** absent in the runtime (§7).
- **Consumer-need gold:** T2 only; no T3 found.
- **Independent performance evidence:** none; 0 supported relations; rankings remain unavailable.

## 11. Tests

- **Full suite: 4,385 passed in 18 shards, 0 failures.** Phase250: 4,380.
- **New file** `tests/phase251_category_and_requests.test.ts` (5 tests): category assignment and guards, accessory
  head rule, identity warning, item retirement, complements, coffee-domain products and budgets.
- **New scripts:**
  - `phase251-collect-requests.mjs`;
  - `phase251-score.mjs`;
  - `phase251-category-assignment.mjs`;
  - `phase251-observational-knowledge.mjs`;
  - `phase251-queryner-eval.mjs`;
  - `phase251-review-semantics-diagnostic.mjs`.
- **New CLI command:** `phase246-knowledge.mjs retire-item`.

## 12. Rollback and next steps

**Rollback.**
- **Code:** revert to `88a1edb` (first-run state), or to `ac4e953` (the freeze).
- **Store:** `git -C /home/user/pee-knowledge checkout ff4c80d -- snapshot`, then `knowledge-snapshot.mjs load --force 1`.
  This removes the 57 assignments; they are also journaled and can be identified by event kind.

**Next, by decision value:**
1. A new untouched set (set 5), with a pre-registered appliance-heavy plan, first-running D′ against R and A.
2. Extend the request registry to the 8 newly checkable store categories through lessons. Measure on set 5.
3. Phase110 deterministic coherence checks (§7), measured with the same contrast set plus new pairs.
4. A lightweight ESCI reader, if it can be done without a heavy dependency, for accessory and complement relations
   (T3).
5. Re-fetch the two Sharp pages lawfully to split the merged identity, and audit all `host_name` identities.
