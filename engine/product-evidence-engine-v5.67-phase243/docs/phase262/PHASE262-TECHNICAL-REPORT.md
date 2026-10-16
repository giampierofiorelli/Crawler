# Phase262 — Research Jobs to General Search (Capability B), Offline

**Date:** 2026-10-16. **Base:** Phase261 HEAD `9fb6299`. **Branch:** `claude/typescript-network-transport-test-1givnd`.

**Commits:**

- Checkpoint A: `2f9058e`.
- Expectations sealed: `f78f46b`.
- Checkpoint B: `12f8860`.

**Evidence tier:** T1. These are developer tests and an offline pilot: genuine jobs and retained metadata, run against a
controlled fixture index. No real discovery happened.

## 1. Correction to Phase261

Phase261 stated that PEE has no open-web candidate-generation mechanism (capability B absent). **That was wrong.**
Phase223 already implements a general-search adapter:

- `planSearchQueries223`, `searchCandidateUrls223` and `inspectSearchLeads223`;
- an operator-configured HTTPS SearXNG `/search` JSON service;
- 14 offline tests, plus later callers in Phases 224, 225 and 228.

My audit searched for search providers or a web index, but not for the existing adapter by function. It is recorded as
supersession S31.

The precise state of the four stages:

| State | Status | Basis |
|---|---|---|
| 1. A discovery adapter exists | **yes** | `phase223_search_discovery.ts` |
| 2. A provider is configured and its use permitted | **no** | Only `docs/phase223/SEARXNG-SEARCH-CONFIG-EXAMPLE.json` exists: `enabled:false`, `serviceAccessReviewed:false`, and `search.example.org` is not a usable endpoint. The research policy disables reads. |
| 3. A real search discovered previously unknown sources | **never** | Phases 223, 224, 225 and 228 each report 0 external calls. |
| 4. Those sources produced verified useful evidence | **never** | — |

## 2. What changed (smallest connection)

**`phase223_search_discovery.ts`** keeps its old behaviour; the 14 existing tests are unchanged and passing.

- `searchCandidateUrls223` is now Phase223's question planning followed by the new **`searchWithPlan223`**. The new
  function runs the same robots check, provider JSON parsing, URL safety, tracking removal and de-duplication, but on a
  query set planned elsewhere. A plan must contain 1–3 normalised queries of at most 200 characters.
- Each lead now records `queryIndex`: the first query that found it.
- **`SearchConfig223.language`** is optional and defaults to `en`, the previous fixed value. It may be `all` or a
  language code. It filters what the provider returns. It is not source language, publisher country or
  understanding.

**`phase261_discovery_bridge.ts`.** The exact-identifier rule is exported as `attributeUrl261`, so search candidates
and sitemap candidates are attributed identically. Behaviour is unchanged.

**`phase262_job_search.ts`** (new):

- **`planJobSearch262(target)`** builds deterministic queries from a genuine Phase261 target, with no question and no
  user text. Its inputs are retained identity only:
  - an exact identifier, searched in its declared form (for example GTIN-13) but compared in its canonical 14-digit
    form;
  - otherwise brand and retained name, flagged `usesExactIdentifier:false`;
  - plus the category and the criterion.

  Its query purposes follow the existing gap kinds only:

  | Gap kind | Query purposes |
  |---|---|
  | declarations | declared specification, manufacturer documentation |
  | `missing_test` | performance measurement, practical test |
  | `missing_criterion` | test method, expert evaluation |

  Not yet expressible: evidence that challenges a conclusion, test conditions, assessor expertise, cultural tradition,
  and non-English query terms.
- **`searchForTarget262(...)`**:
  - **Live mode** is refused while the research policy disables reads (Phase257 always does). A configuration or a
    valid job id is never permission.
  - **Candidates are classified against the store:**
    - `new_domain` means the host is absent from every retained source and revision URL;
    - `known_source` takes its role only from the canonical source type;
    - a new domain's role stays `role_unknown`.
  - **Rejected:** already-observed URLs, restricted hosts, and URLs naming another model (the Phase261 rule).
  - **Every candidate:** `genuineDiscovery:false`; registration, metadata permission, retrieval, retention, evidence
    and recommendation are all false. No candidate page is ever contacted, only the search service.
- **`historicalAssessment262(store, job)`** is metadata only (identity, revisions, extractor version, retention,
  criterion labels in `revision_properties`, declarations). It separates six classes:
  - identity prevents attribution;
  - retained but not usable;
  - label seen, value withheld by rights;
  - label seen, value not extracted;
  - older extractor may have missed it;
  - absent from known sources.

  Only the last two classes (identity, absence) call for new discovery. "Label seen, value not extracted" and "older
  extractor" are reinspection opportunities (Phase255), not search.

## 3. Evaluation (`scripts/phase262-search-pilot.mjs`)

**Inputs and outputs.**

- **Sealed expectations:** `evaluation/phase262/expected.json`.
- **First run, committed unchanged:** `pilot-firstrun.json`. It is public form only: labels and counts, no real URLs,
  names or identifiers. I checked it against every retained brand and host.

**Setup.**

- **Two genuine air-fryer jobs:**
  - **P1:** `width_max`, a product with a GTIN;
  - **P2:** `capacity_min`, no exact identifier, retained brand and name.
- **One controlled fixture index** shared by both jobs and both arms, served through Phase223's real response parsing.
  It holds 13 documents built in memory: fictional new domains, the real retained page URL of P1 (for the
  already-known case), the real known hosts, another model, a syndicated copy, a tracking-parameter duplicate, and
  unsafe or malformed URLs.
- **Arm G:** the existing Phase223 path. It needs a test-only vocabulary and a **manufactured question** ("I need an
  air fryer"), and gives the same two queries for every job: "air fryer independent product review tests" and
  "air fryer manufacturer model specifications".
- **Arm T:** the typed path.

| Measure | G · P1 | T · P1 | G · P2 | T · P2 |
|---|---|---|---|---|
| Queries specific to the job (identifier or name, criterion) | no | yes (exact id + "dimensions") | no | yes (name + "capacity"; not exact) |
| Candidates | 5 | 4 | 7 | 7 |
| About the job's product (predeclared) | 2 | **3** | 2 | 2 |
| Candidates from new domains (distinct domains) | 4 (4) | 2 (2) | 6 (4) | 5 (3) |
| Wrong product attribution | **0** | **0** | **0** | **0** |
| Unresolved identity preserved (`product_unknown`) | 3 | 1 | 7 | 7 |
| Already-known URL excluded | 0 (not retrieved) | **1** | 0 | 0 |
| Another model rejected | 2 | 1 | 0 | 0 |
| Manufacturer document on the known host found | no | **yes** | — | — |
| Search calls (+ 1 robots request) | 2 | 2 | 2 | 2 |
| Live network calls | 0 | 0 | 0 | 0 |

**Expectations: 12 of 13 met.**

- **The unmet one:** "P1 other model is rejected". The document was **not retrieved** by the typed query, so nothing
  was mis-attributed. I wrote that document's title around capacity, but P1's genuine criterion is width. This is a
  fixture-authoring mismatch, not a code defect, and it is left unchanged.
- **The syndicated copy** appeared as a separate new-domain candidate, as predeclared. Without retrieval, PEE cannot
  detect derivation. Phase195/196 lineage needs page text.
- **Duplicates** with tracking parameters were merged, and unsafe or malformed URLs were dropped (Phase223).

**What this shows, and what it does not.**

- **For a product with an exact identifier,** typed queries find the product's own documentation and exclude what is
  already held. The generic path cannot: its queries do not mention the product.
- **For a product without an exact identifier,** the typed path does no better on precision (2/7). It does keep every
  candidate unresolved rather than attributed, which is the required behaviour.
- **Every figure is from a 13-document fixture index.** None is evidence of real search effectiveness.

**Historical data, all 19 genuine jobs, metadata only.**

| Class | Jobs |
|---|---|
| absent from known sources | 17 |
| identity prevents attribution | 2 |
| label seen, value withheld by rights | 0 |
| label seen, value not extracted | 0 |
| older extractor may have missed | 0 |
| retained but not usable | 0 |

Both pilot products have one own-page revision on the current extractor (`spec-extractor-7+identity-4`), value
retention, and no label for the criterion. **For these jobs, historical extraction and retention do not explain the
gap.** Known pages did not label the criterion, so new discovery is needed.

**Caveat:** the assessment sees labels, not prose. A value written only in running text would not show up.

**Checks.**

- **Tests:** `tests/phase262_job_search.test.ts`, 5 tests. Neighbouring suites (`phase220`–`228`, `244`, `257`,
  `258`, `260`, `261`, `262`): 185 tests, all passing.
- **Full suite:** 4,464 passed, exit 0.
- **Store:** verified, live content matches the remote, counts unchanged.
- **Public/private boundary:** no SQLite or policy file is tracked.

## 4. Provider assessment (SearXNG stays replaceable)

**Interface.** The job interface (`JobSearchPlan262.plan`) is provider-neutral. Only `searchWithPlan223` speaks the
SearXNG JSON protocol (`GET /search?q=&format=json`).

**Operational requirements, from the Phase223 report and SearXNG's documentation as cited there:**

- the JSON format is disabled by default and answers 403 unless enabled in the instance settings;
- the endpoint must be public HTTPS, because the Phase69 transport refuses localhost and private addresses;
- results depend on the upstream engines' availability and their anti-bot rules;
- query URLs reveal the search terms, so logs must be protected.

**Licence.** SearXNG is AGPL-3.0, from its repository. Calling a separately operated instance over HTTP does not
incorporate its code. Deploying or modifying an instance, or bundling it, needs a separate licence review under the
project's rules. None was done; nothing was installed or deployed.

**Dependence risk.** The risk is one provider that depends on other engines. Keeping the plan provider-neutral is the
mitigation; I did not add a second provider.

## 5. Language and geography

- **Query words** are English (`queryWordsLanguage:'en'`). **Identifiers** are language-neutral.
- **The result-language filter** is now configurable.
- **Separate and unclaimed:** source-document language (Phase258 `language`, still `und` for every retained source),
  publisher country (never used), product market (from the operator policy), specialist competence, and the user's
  market.
- **No translated terms** were generated. Non-English query terms need a verified terminology mapping, which does not
  exist. Foreign-language results would be leads that PEE cannot yet interpret.

## 6. Forward compatibility (conceptual)

| Future requirement | Expressible now? |
|---|---|
| Air fryer cooking evenness | yes: `missing_test`, with performance-measurement and practical-test queries |
| Dehumidifier extraction at stated temperature and humidity | criterion yes; **conditions no** (job carries `product:criterion` only) |
| Qualified Italian espresso sensory assessment | `missing_criterion` gives an expert-evaluation query; **assessor expertise and tradition no**; non-English terms no |

Missing fields on the requirement side: `testConditions`, `assessorExpertise`, `culturalTradition`, and query
language or terminology. The source side (Phase258 descriptors) already has the matching fields. The teaching
packages were not touched.

## 7. Boundary for a genuine Phase263 pilot (specified, not activated)

`ResearchPolicy257` types `allowSourceReads:false`, so no edit to the policy file can permit a read. A metadata-only
search needs a new, operation-specific operator policy. It should be validated like Phase257 (protected file outside
Git, trusted clock, expiry of at most 30 days, revocation by revision) and contain:

- **Reviewed search endpoint:** the exact `SearchConfig223.endpoint`, `serviceAccessReviewed:true` with reviewer and
  date, JSON enabled, and robots checked at run time.
- **Allowed operation:** `metadata_search` only. No candidate-page retrieval, no fact retention, no source
  registration, no trust and no ranking.
- **Limits:** jobs per run, queries per job (at most 2), total requests, response bytes (the Phase223 cap of 800 kB),
  and a time limit.
- **Validated input:** an explicit list of genuine job ids. Each id is re-derived from the plan, and the policy
  revision is recorded. A job hash alone is not permission.
- **Response handling:** 403, 429 and 5xx stop the run. Never retry around them.

## 8. Limitations

- **Fixture-only results.** Fixtures give no real search-effectiveness or new-domain yield.
- **Syndication is undetectable** without retrieval.
- **No exact identifier means no precision gain.** 15 of 19 job products lack one, so typed search mostly yields
  unresolved candidates.
- **Query templates are fixed and English.** There is no iterative refinement yet. The route for it is the
  `queryIndex` and purpose recorded per lead, which can later be joined with verified contributions (Phase260).
