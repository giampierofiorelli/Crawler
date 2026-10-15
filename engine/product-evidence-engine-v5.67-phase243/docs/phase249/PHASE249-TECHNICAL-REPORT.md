# Phase249 technical report: restrictions audit, lawful knowledge accumulation, calibrated advice

Branch `claude/typescript-network-transport-test-1givnd`. Starting point: `cc5b524` (Phase248 plus owner settings).

All numbers come from committed files. Labels used throughout:

- **first run** — measured once on material the code had never seen. Gold was committed before the run and results
  were committed unchanged.
- **development** — the code was later adjusted on that material.

## 1. Restrictions audit: what was examined, kept and corrected

Each rule was judged on three questions: what risk it addresses, whether that risk is demonstrated, and what
legitimate information it suppresses. Evidence came from controlled runs on the earlier fully annotated gold sets
and from new, untouched sets.

| Rule | Risk it addresses | Measured effect | Verdict |
|---|---|---|---|
| **Holding back facts flagged ambiguous**: conflicting values, compound and per-variant values, value spans several properties, text group without spec context, listing says discontinued. | Wrong values or wrong attribution. | Across all 6 fully annotated gold sets (evaluator `--audit-held`), the held-back facts contain **0 recoverable correct facts**. Releasing them would add only false positives and false associations (for example 5 FA on ho247). | **Justified, kept.** |
| **Item-listing exclusion**: ≥3 sibling cards with a link and an image. | Reading related-product carousels as the page product. | Excluded whole product pages whose layout grid holds teaser tiles (Midea: 0/8 facts). | **Over-broad, corrected.** Cards must be small (≤1,200 characters), contain no spec structures, and make up ≥60 % of the container's text. |
| **`role=tablist` exclusion** | Tab buttons are navigation. | Excluded the tab panels a CMS wrapper holds. | **Corrected.** A tablist containing tab panels is content. |
| **"modal / popup / drawer" class exclusion** | Cookie, newsletter and cart dialogs. | Excluded Decathlon's specification drawer (0/5). | **Corrected.** A drawer holding a specification structure is content; other modals stay excluded. |
| **Two different h1 headings → ambiguous product** | Category or comparison pages. | An h1 repeated verbatim (desktop and mobile copies) held back every value (Worx: 0/9). | **Corrected.** Identical headings count once; different ones stay ambiguous. |
| **Label must end with ":" in line lists** | Prose read as attributes. | Lost "Height 8.1 cm"-style spec lines (Ocado, Stone Audio). | **Narrowed.** Unmarked lines are read only when the value is measurable and at least two such lines appear. |
| **Label ≤ 8 words**, counting bracketed notes | Sentences read as labels. | Lost "Unit Size (W x H x D in mm)". | **Narrowed.** Unit and axis notes are excluded from the count. |
| **"Discontinued" scan** of the main text | Showing stale prices. | Triggered by script text and related-product cards (SmartUK price). | **Narrowed** to visible main-region text. |
| **Exact two-item label/value pairs** | Feature prose. | Lost values followed by a bracketed note. | **Narrowed.** A closing bracketed note is kept as a qualifier. |
| **Main product unnamed** (no h1, structured data or OG title) | Category pages and app shells. | Ebac 2150e: 7 correct values held. | **Kept, unresolved.** A page title alone also names category pages, and no safe alternative was demonstrated. |
| **Normalisation gaps**: ms, Ah, N·m, Ω, l/s, mA, cm3, HP, decimal comma, footnote markers, bracketed conversions, units in `[ ]` or "(… in mm)". | None; these were gaps, not safeguards. | Values kept only as text or misread ("9,5 kg" read as options; "1,000W" read as [1, 0]). | **Corrected.** |
| **Per-source `fact_storage` gate for all retention** | Copying third-party material. | 1,346 observed declarations, 0 retained. | **Over-broad, replaced.** A source-class policy for private factual observations; see §3. |
| **Recommendations only via a signed Phase180 release** | Unsupported quality rankings. | Also blocked a different legitimate answer: which products meet factual constraints. | **Kept for rankings.** A cited, unordered requirements shortlist was added; see §5. |
| **Need inference from description overlap** | Missed needs. | On real requests, function words counted as evidence and need words pulled pans, scales and grills into kitchen-appliance categories (precision 0.2). | **Corrected.** Stopwords; named products outrank need inference; part phrases; product-modifier check; three overlapping words required in long texts. |
| **GOV.UK OPSS policy inert** | Unverified licence. | Notices could not be kept. | **Activated** after verification; see §6. |

## 2. Information recovered, and whether critical errors increased

### Extraction, independent first runs

| Set | Pages / hosts | Version | Sampled recall | Identity errors | Wrong attributions |
|---|---|---|---|---|---|
| Phase249 set 1 (14 new categories) | 34 / 20 | v5 | 77/118 (0.653) | 0 | 0 |
| | | v6 | 77/118 (0.653) | 0 | 0 |
| Phase249 set 2 (supplementary) | 19 / 11 | v5 | 28/59 (0.475) | 0 | 0 |
| | | v6 | 32/59 (0.542) | 0 | 0 |
| | | v7 | 33/59 (0.559) | 0 | 0 |

Two points stand out:

- **v6 did not generalise to set 1.** Its large development gain (157 → 188 of 190 on the Phase248 set) did not appear
  on untouched set 1. On set 2, v6 and v7 together gained 5 facts (+8.5 points).
- **Precision held.** On set 2, v7's changes over v5 were 1 new fact and 8 values given a structured type, all
  hand-checked correct. No version produced an identity error or a wrong attribution on any untouched set.

Development results:

- spec-extractor-7 reaches 106/118 on set 1 (now spent) and 188/190 on the Phase248 set.
- Every earlier fully annotated gold set is unchanged against v4 (dev245 92/92, un1 30/31, un2 61/62, ho246 28/29,
  ho247 61/65, ho247b 60/61).

What still loses facts on untouched pages:

- content rendered client-side (Alpkit, KitchenAid, Vornado specifications, Singer feature bullets);
- unlabelled prices;
- names that appear only in a `<title>` (Ebac).

**Process error, recorded honestly.** The first set-2 attempt ran the v7 evaluator three times, because the script
resolves the extractor relative to its own path. v5 and v6 were then run once each from frozen worktrees. The v7
numbers are identical to the earlier run.

### Advisory journey on real requests

The requests are genuine, independently written English questions from Stack Exchange (CC BY-SA, attributed), not
synthetic.

| Set | Status | Version | Category | Decision | Need recall | Need precision | Unsafe |
|---|---|---|---|---|---|---|---|
| Real set 1 (31) | first run | Phase248 journey | 0.710 | 0.742 | 0.50 | 0.20 | 0 |
| Real set 1 | development (spent) | round 3 | 0.935 | 0.903 | 0.50 | 0.667 | 0 |
| **Real set 2 (22)** | **first run** | Phase248 journey | 0.591 | 0.591 | 0.625 | 0.455 | 0 |
| **Real set 2** | **first run** | **round 3** | **0.818** | **0.727** | **0.625** | **0.625** | **0** |

The earlier sets are unchanged or better: dev 1.0; held-out 1 at 1.0 and 1.0, need recall 0.5; held-out 2 at 0.938 and
0.875, need recall 0.385.

**Need recall did not improve.** It is still the main weakness. The remaining failures on real set 2:

- grinders read as coffee machines through cue words;
- "pressure cooker" reaching coffee through "brew pressure";
- budgets written as "< $500" or "70€ tops" not parsed.

## 3. Knowledge PEE can now retain and reuse

The policy, `pee249-factual-observations-v1`, is documented with its legal basis and open questions in
`docs/phase249/RETENTION-POLICY.md`. Primary sources were read this session: GOV.UK copyright and database-right
guidance, CDPA s28A and s29A, and the Copyright and Rights in Databases Regulations 1997, regs 12, 13, 16 and 19.

**What it keeps.**

- Individual factual declarations with provenance, in the **private** store only.
- Never prose, page bodies, reviews or images.

**Limits and overrides.**

- **Per-host caps**, so PEE samples a source rather than extracting a substantial part of its database: 300
  products for manufacturers, 50 for retailers and encyclopaedias, 30 for others.
- **Independent test publishers:** 25 products per host, numeric measurements only.
- **Reservations honoured:** a robots.txt Content-Signal `ai-input=no`, a TDM reservation or a `noai` robots meta
  each mean metadata only.
- **Per-source decisions win:** a refusal, terms reviewed as prohibiting the use, or a robots refusal.

**Publication.** Public exports still require `derived_publication`. Private exports and backups include the values.

**Result on the operational store.** Re-deriving every hash-verified page:

- **0 → 2,385 retained declarations**;
- 140 revisions, 188 products and 90 sources;
- an intact event journal.

The only metadata-only revisions are three methodology pages with nothing to extract.

**Reuse.**

- The decision layer reads retained declarations to check requirements, citing the source URL for each value.
- Re-derivation re-runs automatically when extractor or identity rules change.
- Safety notices are stored under the OGL policy; see §6.

**Persistence.**

- The store lives in `$PEE_KNOWLEDGE_DIR`, outside Git, and refuses to open inside a working tree.
- `backup-rotate` writes timestamped backups with SHA-256 manifests and integrity and journal checks.
- `verify-backup` checks a backup read-only.
- `restore` keeps the replaced file.
- A restore drill on the real store reproduced all counts.
- The container is ephemeral, so durable hosting needs `PEE_KNOWLEDGE_DIR` on a persistent volume with backups on a
  second medium. Nothing pretends otherwise.

## 4. Independent test evidence (priority 8)

- **GOV.UK OPSS notices.** Active and persisted (35 notices). They are regulatory safety findings, never performance
  tests.
- **SCA Certified Home Brewer list.** This is genuine third-party certification (pass/fail) of drip coffee brewers.
  However, the site's robots.txt explicitly lists AI crawlers, including ClaudeBot and anthropic-ai. PEE treats that
  as a reservation and does not use the site. Using it needs SCA's permission (owner action).
- **Retention policy for test publishers.** Insubstantial, cited, numeric measurements are now retainable, capped at
  25 products per publisher. In practice this applies to publishers PEE may read under robots and their terms.
- **Not acquired:** Which?, CHOICE and Stiftung Warentest (paid; not authorised).
- **What a licence would add.** Comparable, multi-product measurements under one protocol, for example CHOICE air
  fryers or Which? toasters. Those are exactly what Phase180 needs for a signed ranking; no open source provides them
  for PEE's kitchen categories.

## 5. Is PEE closer to defensible recommendations?

Yes, in a calibrated way. `decideAdvice249` is the decision step after the user confirms requirements:

- **`requirements_shortlist`.** An unordered list of products meeting every confirmed factual constraint, each with
  cited declarations. Unknown or conflicting products are listed, not dropped, and failures are reported.
  - On the real store, "air fryer with room for a family meal (≥ 5 L)" shortlists 3 of 4 known products.
  - "Kettle ≥ 1.5 L" shortlists 1 of 2.
- **`requirements_shortlist_performance_unverified`.** Used when a performance need is also confirmed.
- **`ranked_recommendation`.** Only through a valid signed Phase180 release. A synthetic, isolated test proves the
  positive path works and that a forged release is refused.
- **`no_candidate_meets_requirements`, `withhold_insufficient_evidence` and `clarify`.**

PEE can now answer "which of these fit my needs" with evidence. It still cannot say "which is best" until comparable,
independent measurements exist.

## 6. GOV.UK OPSS policy

`evaluation/phase249/opss-policy-active.json` records:

- the owner's conditional authorisation;
- the verification findings: licence statement, absence of "otherwise stated" credits in 30 notices, attribution,
  exemptions (attachments never fetched), access conditions, commercial reuse;
- the narrow scope;
- validity until 2027-04-15.

No human legal review is claimed. Persistence runs only through the policy gate, with a fresh robots check each run;
a test checks this.

## 7. Public evaluation material

See `docs/phase249/PUBLIC-EVALUATION-AUDIT.md`:

- no raw third-party HTML;
- no contact data;
- 642 sampled factual gold values, at most 26 per page;
- CC BY-SA request excerpts, with a notice file.

Material already in Git history cannot be withdrawn by moving files. Future confidential material goes to
`$PEE_PRIVATE_EVAL_DIR`, which is refused inside Git.

## 8. Compliance notes

- **legislation.gov.uk.** Its robots.txt sets Crawl-delay 5. Six statute requests were made faster than that. No
  further requests were made.
- **nationalarchives.gov.uk.** Its robots.txt declares `ai-input=no`. The OGL text was read once to verify the
  licence and is cited by URL only, not stored.
- **sca.coffee.** One page was fetched before the AI-crawler robots groups were noticed. It is not used or stored.
- **Stack Exchange API.** About 30 anonymous API requests, within quota.

## 9. Unresolved, and why

- **Need recall (≈ 0.4–0.6).** The concept vocabulary covers three categories with a few aliases each. Real
  questions need category-specific needs PEE does not model yet (milk drinks, office use, grinder types). This needs
  more category knowledge, not looser matching: looser matching raised false positives.
- **Extraction misses on untouched pages.** Mostly content PEE cannot see in the served HTML, which would need
  rendering. Pages named only by their title remain unsolved without a demonstrated safe rule.
- **No comparable independent performance evidence for any category.** Rankings remain unavailable. This is correct,
  not a defect.
- **Retention policy legal points left open:** contract terms without reservations, "lawful use" under s28A, and
  case law not re-verified. The restriction is kept for any source whose terms are reviewed as prohibiting the use.
- **Second independent extraction set below target** (19 pages, 11 hosts), because of discovery yield within budget.
- **Autonomous improvement.** Frozen versions, first-run immutability, held-out discipline, regression sets,
  re-derivation, verified backups and restore now form the needed substrate. A degradation monitor and a signed
  promotion and rollback record are the next pieces. As instructed, they were not built prematurely.

## 10. Tests

- Full suite: **4,367 tests passed in 17 shards**, 0 failures.
- New Phase249 tests:
  - `tests/phase249_retention_policy.test.ts` (6);
  - `tests/phase249_decision.test.ts` (7);
  - 10 extractor tests for v6 and v7;
  - an OPSS policy-gate test.
- npm scripts: `test:phase249`, `advise:phase249`, `audit:phase249-public`.
