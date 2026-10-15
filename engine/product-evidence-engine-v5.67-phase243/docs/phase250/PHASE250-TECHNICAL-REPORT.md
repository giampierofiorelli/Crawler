# Phase250 technical report: persistent private knowledge, category lessons, everyday-English needs

Branch `claude/typescript-network-transport-test-1givnd`.

**Starting point:** `a781a59`.
- Phase249 was complete at `2580112`.
- Three owner-session commits followed it: the knowledge snapshot script, the SessionStart restore hook and the
  skill/CLAUDE.md updates.

**Labels used throughout:**
- **first run:** the code was frozen and the gold committed before the run, and the results were committed unchanged.
- **development:** the code was changed after seeing that material.
- Tiers T1–T3 follow `evaluation-and-reporting.md`. All gold here was written by Claude: it is **not
  author-independent** and **not independently adjudicated** (T4 is deferred).

## Contents

1. Private knowledge persistence
2. Diagnosis: the first broken link on the known failures
3. Interventions
4. A/B/C experiment on an untouched real-request set
5. Development after the first run, and what was kept
6. Category knowledge before and after; do retained declarations contribute?
7. From a need to a cited answer: the vertical slice
8. Review interpretation: what transfers
9. Research consulted
10. Rights, access and compliance
11. Unresolved, and why
12. Tests
13. Rollback and next steps

## 1. Private knowledge persistence

**Owner decision (2026-10-15, recorded as S12).**
- A second, **private** repository, `giampierofiorelli/pee-knowledge`, holds knowledge snapshots only.
- The code stays in the public Crawler repository.
- The live SQLite store stays outside every Git work tree, in `$PEE_KNOWLEDGE_DIR`.

**Reviewed risk.** The first version of `scripts/knowledge-snapshot.mjs` (`fe8695e`) wrote `engine/knowledge-snapshot/`
**inside the public repository**. Git history shows no file under that path, nor any `*.sqlite`, was ever committed.
The current script writes to `/home/user/pee-knowledge/snapshot`.

**Safeguards added** (`scripts/knowledge-snapshot.mjs`, `.gitignore`):

| Safeguard | Behaviour |
|---|---|
| Private target only | `save` and `sync` refuse a snapshot directory inside the public code repository, outside any Git repository, or in a repository whose `origin` is not `giampierofiorelli/pee-knowledge`. |
| `sync` | Compares the live store and the snapshot by **content**: every row of every table, ignoring the `backup_written` journal events that saving appends. On a difference it writes a verified backup, then commits and pushes. |
| No silent overwrite | If another session pushed a newer snapshot, `sync` stops with exit 2. A binary store cannot be merged. |
| Retried push | Up to 5 attempts. An unpushed earlier commit is pushed too. Failure exits 2. |
| `verify` | Checks the snapshot **as committed on `origin/main`**, exactly what a new session restores: SHA-256 against its manifest, SQLite integrity, the hash-chained journal and the counts. It also compares the content with the live store. |
| Hooks | Stop and SessionEnd run `sync` (`.claude/hooks/pee-knowledge-sync.sh`; registered with the owner's authorisation). A failure blocks the end of the turn once. |
| `.gitignore` | `knowledge-snapshot/` and `pee-knowledge/` are ignored in the code repository. |

**What was actually tested:**

1. **Write and restore round trip (manual).** One labelled test item (`pee_write_test`) was written through the store
   API. It was saved, committed and pushed (`f9f20cc`). It was then read back from a **fresh clone**, with the SHA-256
   matching. The item is still in the store and is harmless: it is a separate category with no concepts.
2. **`sync` on an isolated copy.** The test used a local bare remote, with no network and no production data touched:
   - with no change: no commit;
   - after one write: a commit and push `3ff46d2`;
   - run again: in sync.
3. **Real Phase250 change.**
   - `apply-lessons` added 45 items to the live store.
   - `sync` pushed `d704bd8`.
   - `verify` on `origin/main` returned `verified:true`, integrity and journal OK, 100 category items, and live
     content equal to the remote.
4. **Target refusal (T1 test).** `tests/phase250_knowledge_snapshot.test.ts` (3 tests) covers:
   - refusal inside Crawler;
   - refusal for a foreign origin;
   - refusal with no origin;
   - acceptance of the private origin.

**Not tested.** Whether a hook registered mid-session fires in that same session. `sync` was run by hand after the
store change.

## 2. Diagnosis: the first broken link on the known failures

Traces on Phase249 real set 2 (T2, spent). Each row gives the earliest broken link and the cause:

| Failure | First broken link | Cause | Mechanism, verified on the trace |
|---|---|---|---|
| Grinders read as coffee machines (s08, s22) | category | missing data, plus a cue rule | No grinder category, so the weak cue "coffee" decided the category. |
| "pressure cooker" read as coffee (s19) | category | misunderstood language | Normalisation removes punctuation, so "shopping for a pressure cooker. Could anyone…" never ended the product name. The unknown-product guard then never fired. A paraphrase overlap ("pressure" + "size") then inferred coffee. |
| False limescale need (s03, s11) | need | a bug, plus chance overlap | Product words were filtered **after** stemming. "machines", "makers", "toasters" and "blenders" (stems `machin`, `mak`, `toast`, `blend`) escaped the filter and fed the overlap. |
| "Don't want to go over 500 euros", "70€ tops" (s05, s13) | need (budget) | misunderstood language | The parser required a currency **symbol before** the number and one of a few trigger words. |

The spent Phase248/249 development sets showed two further classes:
- **needs stated as problems**: "pale on one side and burnt on the other", "my shots vary a lot";
- **needs stated through circumstances**: "I'm on my own most evenings", "not much room on my worktop".

Full list: `evaluation/phase250/gap-analysis.json`.

## 3. Interventions

All of these extend existing modules. No parallel store, ontology or "learning brain" was added.

**Generic repairs (R).**
- `phase125_compositional_dialogue_frame.ts` `monetaryBudget`:
  - symbol or currency word, before or after the number;
  - anchors such as "<", "or less", "tops", "not … go over";
  - unanchored prices ignored; two different limits treated as a conflict.
- `phase248_advisory_journey.ts`:
  - product words filtered by surface form;
  - buying constructions searched **per sentence**;
  - more buying verbs ("shopping for", "looking for");
  - owned or used products ("my Aeropress", "I am currently using a moka pot") are context when another category
    remains;
  - the category introduced by a buying construction is chosen among several;
  - a need shared by several categories (catalogue generic needs, or a need id present in two or more categories)
    cannot alone infer the category;
  - per-need counterexamples (`needCounterexamples`).

**Category lessons.**
- `src/phase250_category_lessons.ts` holds data and application only. It applies lessons through
  `addCategoryItem246` and `addConceptAliases246` and extends `CategoryEntry248`.
- Every need item is `technical_hypothesis` / `assistant_authored_unreviewed`.
- **B (fixed curriculum):** one lesson per category for 12 kitchen categories, written from general category
  knowledge **before** the failure analysis. 41 needs, 230 phrases, 11 counterexamples.
- **C (adaptive):** lessons chosen from R's failures on the spent sets: problem and circumstance vocabulary, grinder,
  pressure-cooker, stand-mixer and food-processor categories, counterexamples. 8 categories, 26 needs, 134 phrases,
  11 counterexamples.
- Both stayed within the pre-registered budget `LESSON_BUDGET250`: 12 categories, 45 needs, 260 phrases,
  30 counterexamples.

**Shared label space.** `evaluation/phase250/need-catalogue.json` was written before B, C and the new set:
- 16 categories with their needs, plus 9 generic needs;
- a rule for needs outside the catalogue, recorded as "unlisted".

## 4. A/B/C experiment on an untouched real-request set

**Material.** `evaluation/phase250/journey-real-requests-set3.json`:
- 73 Stack Exchange questions (cooking, coffee), CC BY-SA, attributed;
- collected **after** the freeze `e8d0574`, through the official API, with fixed query plans;
- selected by an explicit criterion;
- gold committed (`705f771`) before any arm ran.

**Composition.**
- 30 cases are in catalogue categories, with 24 listed needs and 29 unlisted needs.
- 43 cases are about other products: knives, pans, ovens, spice grinders and so on. They test false attributions.

**Arms.** Each arm ran on its own copy of the real store (snapshot `048d473` + `f9f20cc`):
- **A:** the Phase249 journey, from a worktree at `e8c9d36`;
- **R:** the generic repairs only;
- **B** and **C:** R plus the curricula.

**First-run results, T2.** Committed unchanged in `750af71`, file `journey-real-requests-set3-score-firstrun.json`.

| Arm | Needs found (of 24 listed) | Need precision | Recall incl. unlisted (of 53) | Category correct (of 30 catalogue cases) | Wrong category attributions (of 73) | Correct or justified abstention (of 73) | Budget correct (of 73) | Unsafe rankings |
|---|---|---|---|---|---|---|---|---|
| A | 0 | 0/9 | 0 | 12 | 15 | 57 | 71 | 0 |
| R | 0 | 0/7 | 0 | 12 | 13 | 59 | 73 | 0 |
| **B** | **8** (0.333) | **8/17 (0.471)** | 8 (0.151) | 20 | 12 | 54 | 73 | 0 |
| **C** | **7** (0.292) | **7/16 (0.438)** | 7 (0.132) | 23 | 12 | 58 | 73 | 0 |

**Reading.**
- On this untouched material, the Phase249 system recognised **none** of the 24 needs. Its vocabulary covered 3
  categories; this set mostly asks about grinders, mixers and other appliances it did not model.
- The generic repairs alone fixed budgets (71 → 73 of 73) and two wrong attributions, but found no needs.
- Both curricula found needs. They are statistically indistinguishable on 24 needs: 8 against 7.
  - B covered more categories (kettles, food processors, blender hardness).
  - C made fewer category mistakes, because B's manual-brewer names made 5 coffee and grinder requests ambiguous.
- Recall over **all** needs stays low (0.13–0.15). Most needs real users state are not in any curriculum: no plastic,
  fits inside an Aeropress, plumbed water line, smooth nut butter.

**New harms introduced by the lessons:**
- 3 spice, peanut-butter and allspice grinders were attributed to coffee grinders;
- 1 vacuum sealer was attributed to air fryers through "living alone";
- 1 request for stand-mixer beaters was attributed to stand mixers.

**Unchanged errors in every arm:**
- an espresso-machine filter (an accessory) read as a coffee machine;
- a blender mentioned and rejected;
- an OTG (oven toaster griller) read as a toaster;
- a bamboo steamer read as a steam cooker;
- a bean pot read as an air fryer through "non-stick wearing off".

**Cost.**
- 20 API requests, 0 page fetches.
- Runtime for 73 cases: R 0.84 s, B 2.2 s, C 1.5 s.
- 0 new dependencies.

## 5. Development after the first run, and what was kept

Set 3 is now **spent**. Every number in this section is **development**.

**Changes**, each a general mechanism, not a phrase patch:

| Change | What it does | Effect |
|---|---|---|
| Long requests | Over 40 words, need paraphrase overlap is off, and inferring the category from needs requires two distinct category-specific needs. | On real sets 1–3 together, long-request paraphrases had given 2–6 correct against 8–12 false needs per arm. **Cost:** two mechanism questions on real sets 1–2 lost a correct need (r02 "heat + fan", s06 "bar + pressure"). |
| Accessories | "a filter for my X", "X attachments" are not X, for names and for weak cues. | |
| Set-aside products | "I could buy a blender, but …" is not the choice. | |
| Context-dependent aliases | "grinder", "hand grinder" and similar name a coffee grinder only where coffee is the subject. | |
| Registry vocabulary | OTG names a toaster oven; "bamboo steamer" is a counterexample for steam cookers. | |

**Adopted configuration, `ADOPTED_LESSONS250` (arm D):**
- C plus B, without B's manual-brewer lesson;
- plus the alias context and registry vocabulary above.

Applied to the operational store (`apply-lessons`) and used through `CATEGORY_REGISTRY250`. The union itself **was
never run first on untouched material**; the next phase must measure it on a new set.

**Development results, D against R** (files in `evaluation/phase250/development/`):

| Set (all spent) | Needs found, R | Needs found, D | False needs, R → D | Wrong category attributions, R → D |
|---|---|---|---|---|
| Phase250 set 3 | 0/24 | 10/24 (precision 0.667) | 1 → 5 | 11 → 4 |
| Phase248 held-out 1 | 6/12 | 11/12 | 0 → 3 | 0 → 0 |
| Phase248 held-out 2 | 5/13 | 13/13 | 0 → 1 | 0 → 0 |
| Phase249 real set 1 | 1/4 | 3/4 | 1 → 9 | 0 → 0 |
| Phase249 real set 2 | 4/8 | 6/8 | 0 → 12 | 3 → 8 |

On Phase249 sets 1–2, most of D's "false needs" and "wrong categories" are an artefact of the **old label space**.
That gold was written when grinders, pressure cookers and stand mixers were out of scope, so it labels them `null`. It
lists no needs for unmodelled categories. Examples: s13 "puree hard fruit (like coconut)", s05 "milk foam", s19 "pot
size".

Those gold files were **not** relabelled: they are frozen first-run records. The comparison is therefore reported but
not used to choose.

**Kept, because the first run supports it:**
- the generic repairs;
- lessons from both curricula;
- the counterexample and context mechanisms.

**Not kept:**
- B's manual-brewer lesson (measured harm: 5 ambiguity regressions);
- the derived observed-pattern items (§6).

## 6. Category knowledge before and after; do retained declarations contribute?

Measured on the real store (`scripts/phase250-category-knowledge-audit.mjs`; files
`category-knowledge-before.json` and `category-knowledge-after.json`). The four kinds of knowledge are counted
separately, never summed.

| Kind | Before | After |
|---|---|---|
| Observed: declared-attribute vocabulary (labels, 2 or more products) | 196 | 196 |
| Observed: `observed_pattern` items from declarations | 0 | 0 (see below) |
| Hypotheses: category items (excluding measurement methods) | 48 | 89 |
| Hypotheses: need concepts carried by user-goal items | 7 | 43 |
| Hypotheses: relations | 13 | 13 |
| Methods: measurement-method items | 6 | 10 |
| Methods: method-reference relations | 5 | 5 |
| **Independently supported** relations (reviewed or evidence_supported) | **0** | **0** |
| Categories with need knowledge | 3 | 11 |

**Do the 2,385 retained declarations contribute?** Measured, not assumed:

1. **No category item or relation cites a declaration-bearing revision, before or after.** The declarations do not
   feed hypotheses, methods or relations.
2. **1,020 of the 2,385 (43%) belong to products with no category hypothesis**, so they cannot inform any category.
   1,365 are attached to categorised products.
3. **Observed vocabulary.**
   - The existing method `deriveObservedPatterns246` was run on a copy (`category-knowledge-derive-experiment.json`).
     It would add 196 observed-pattern items. 149 of them come from 2 encyclopedia smartphone pages and single-board
     computers; 35 are kitchen categories.
   - It adds no information the attribute vocabulary does not already hold, and the need matcher never reads it.
   - It was **not** written to the operational store. A larger database is not evidence of expertise.
4. **Where declarations do contribute: factual requirements.**
   - Phase249 `decideAdvice249` already checks confirmed requirements against cited declarations.
   - Phase250 connects recognised needs to those checks (§7).
   - 9 candidate need–attribute links exist in the store, such as `batch_capacity` with "Capacity" and
     `small_kitchen` with "Dimensions". These are links a reviewer could test, not findings.
5. **No relation was promoted to evidence-supported.** No comparable independent measurements were acquired this
   phase (§11).

## 7. From a need to a cited answer: the vertical slice

**New in the journey:** `stages.requirements.factualRequirements`.
- A recognised need that a declared specification can check becomes a factual requirement to confirm:
  - `batch_capacity` → `capacity_min`;
  - `small_kitchen` → width, depth or height maximum;
  - a stated budget → `budget_max`.
- The journey asks the matching question.
- Once the user confirms, the existing `decideAdvice249` builds a cited, unordered shortlist or a justified negative.

**Run on a copy of the real store with the adopted lessons.**

Request: "family of four … big enough … kitchen is tiny". The journey gave:
- category `air_fryers`;
- needs `batch_capacity` and `small_kitchen`;
- two questions: capacity, and space.

With the answers "at least 5 l" and "at most 400 mm wide":

| Product | Outcome | Basis |
|---|---|---|
| Ninja Foodi AF300UK | fails | Declared 415 mm wide, against 400 mm required (cited). |
| Lakeland 8 L models (2) | unknown | No width declaration. |
| Air Fryer | unknown | Capacity and width both undeclared. |

Decision: `withhold_insufficient_evidence`; no ranking. Missing evidence stays "unknown", never "fails".

**Correct positive answers and justified abstentions.**
- The slice shows a justified negative answer and justified unknowns on real data.
- A positive shortlist is reached when declarations suffice; the Phase249 examples covered this, for instance air
  fryers of at least 5 L.
- Ranked recommendations remain gated by signed Phase180 releases; 0 unsafe rankings anywhere.

## 8. Review interpretation: what transfers

Read: research v9 Addendum IV §1–5, lines 1461–1584.

**Transfers directly to reviews:**
1. **Owned versus chosen product.** "my old blender leaked; this one hasn't". This is the reference-resolution lesson,
   Addendum IV §2.2 step 1. The `owned` rule is a first, request-level form of it.
2. **Accessory versus product, and set-aside products.** These are wrong-entity associations, the error class the
   addendum calls critical.
3. **Problem-stated needs.** Example: "pale on one side" maps to `even_browning`. This is the same mapping a review
   needs from complaint to aspect: an implicit aspect, as in ACOS.
4. **Counterexample lists.** They are a small, explicit form of the addendum's contrast-pair teaching (CheckList,
   Contrast Sets).

**Still missing:**
- condition and scope ("great on tiles, hopeless on thick carpet");
- comparison direction;
- the speaker or evidential role.

The Phase110/113/125 modules should be measured on these with contrast pairs before any new schema.

**Not transferable:** the long-request rule. Reviews are long by nature; they need scope-aware extraction, not
switching paraphrase off.

## 9. Research consulted

**Skill files read this session:**
- `SKILL.md`;
- `references/current-state.md`;
- `decisions-and-supersessions.md`;
- `owner-operating-rules.md`;
- `claude-only-feasibility-audit.md` (Correction IX);
- `evaluation-and-reporting.md`;
- `research-navigation.md`.

**`research-v9-full.md`:**
- Addendum IV §1–5 (lines 1461–1584) was read **after** the A/B/C design and run. It informed §8, not the experiment
  design.
- The other sections were not reopened this session.

**External primary sources:**
- Stack Exchange robots.txt (`https://coffee.stackexchange.com/robots.txt`,
  `https://cooking.stackexchange.com/robots.txt`), read on 2026-10-15;
- the Stack Exchange API (`https://api.stackexchange.com/2.3/search/advanced`).

## 10. Rights, access and compliance

**Stack Exchange.**
- The sites' robots.txt now reads `Disallow: /` for all agents, with `Content-signal: search=no, ai-train=no`.
- PEE fetched **no site pages**. It used only the official API, a separate host, which served the requests normally.
- Use: evaluation only, with per-case CC BY-SA attribution (`evaluation/phase250/NOTICE-CC-BY-SA.md`). No training
  and no search indexing.
- Raw API responses stay in `$PEE_PRIVATE_EVAL_DIR`.
- Two candidates without a licence field were dropped.

**Transport lapse, recorded.**
- The first collection attempt used Node's built-in `fetch`, which ignores the container proxy. It received an HTTP
  403 that **did not come from Stack Exchange**; the request never left through the sanctioned proxy.
- The script stopped on the 403, as designed.
- After checking the proxy documentation, it was rerun with `NODE_USE_ENV_PROXY=1`, the documented setting. Nothing
  else changed.
- This is not a bypass of a site's access control. It is recorded here so it can be judged.

**Public evaluation audit** (`npm run audit:phase249-public`):
- no new HTML;
- no new e-mails;
- the "phone" hits in Phase250 files are false positives (digits of a SHA-256 next to "hotel" or "completely").

**Data placement.**
- No snapshot, database or private evaluation input was committed to the public repository.
- The live store was never opened inside a Git work tree.

## 11. Unresolved, and why

- **The adopted configuration (D) has no first-run measurement.** It needs a new untouched set. Sets 1–3 are spent.
- **Needs outside any curriculum.** All-needs recall is 0.13–0.21 even with lessons. Real requests carry many
  product-specific constraints: materials, fit, plumbing, nut butter. The next lever is better coverage of these, not
  looser matching.
- **Gold.** All three real sets were annotated by Claude: T2, not author-independent. No pre-existing human-labelled
  need dataset for buying requests was found or used (T3 absent).
- **Independent performance evidence.** None was acquired, so 0 relations are evidence-supported. Rankings remain
  correctly unavailable. Paid publishers and SCA remain owner decisions.
- **Declarations without category.** 1,020 retained declarations (43%) are on uncategorised products. Assigning
  categories needs identity-safe rules, never similar-name merging.
- **Mechanism questions on long requests** lost two correct concepts (§5).
- **The test item `pee_write_test`** remains in the store. The owner was asked whether to remove it. There is no
  delete API for category items; superseding it would be the route.

## 12. Tests

- **Full suite:** **4,380 tests passed in 18 shards, 0 failures.** Before: 4,367.
- **New:**
  - `tests/phase250_knowledge_snapshot.test.ts` (3);
  - `tests/phase250_need_understanding.test.ts` (10): budgets, sentence-level product names, plural product words,
    owned versus chosen, grinder context, accessories and set-aside products, shared needs and long requests,
    problem-stated needs with counterexamples, factual requirements, budgets and idempotent lessons.
- **New scripts:**
  - `phase250-journey-arms.mjs`;
  - `phase250-score.mjs`;
  - `phase250-collect-requests.mjs`;
  - `phase250-category-knowledge-audit.mjs`.
- **New commands:**
  - `phase246-knowledge.mjs apply-lessons`;
  - `knowledge-snapshot.mjs sync`;
  - `knowledge-snapshot.mjs verify`.

## 13. Rollback and next steps

**Rollback.**
- **Code:** revert `a0a0eb1` (development) and `e8d0574` (freeze). The registry falls back to
  `CATEGORY_REGISTRY248`.
- **Store:** restore the pee-knowledge snapshot `f9f20cc`:
  1. `git -C /home/user/pee-knowledge checkout f9f20cc -- snapshot`;
  2. `node scripts/knowledge-snapshot.mjs load --force 1`.

**Next, by decision value.**
1. Collect real request set 4 (untouched; include non-kitchen categories) and run D first, against A. This is the
   first honest measurement of the adopted configuration.
2. Look for a T3 reference: a published, licensed human-labelled corpus of product needs or questions. If none fits,
   say so.
3. Category assignment for the 1,020 uncategorised declarations, so retained facts can feed category checks.
4. A review-semantics probe on the existing Phase110/113 modules with contrast pairs: owned versus new, scope and
   condition, comparison direction (§8).
5. Lawful comparable independent measurements for one category, to obtain the first evidence-supported relation.
