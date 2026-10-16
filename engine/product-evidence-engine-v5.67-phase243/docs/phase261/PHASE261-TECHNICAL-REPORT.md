# Phase261 — Research-to-Discovery Bridge

**Date:** 2026-10-16. **Base:** Phase260 HEAD `6b47cd2`. **Branch:** `claude/typescript-network-transport-test-1givnd`.
**Checkpoints:** A `76babdb` (bridge and targeted tests); B `e5b4ce7` (pilot, blocker assessment, two fixes).
**Evidence tier:** T1 (developer tests and an offline pilot on genuine job metadata; fixture URLs are not discoveries).

## 1. Result in one paragraph

`src/phase261_discovery_bridge.ts` connects a genuine research job to the existing discovery mechanisms:

> research requirement (Phase182/257 job) → discovery target → authorised discovery channel (operator `Registry220`
> source, scheduled by Phase82, read by Phase75 sitemaps or Phase221 feeds) → unverified URL candidate

It works offline on fixtures. All 19 genuine jobs map to targets. Today **none can be served**:

- 0 operator discovery channels exist for PEE's policy categories;
- the known product hosts have no source policy;
- the operator research policy disables live reads.

The bridge provides **capability A**: new documents from a known, authorised channel. **Capability B**, new publishers,
domains or channels, does not exist in PEE and is reported as absent, not simulated. Live network calls: **0**.

## 2. Reuse audit: what each mechanism accepts, and where the first connection fails

| Mechanism | Accepts | Gives | Role in the bridge |
|---|---|---|---|
| Phase75 `discoverFromApprovedSitemap` | one `WebSourcePolicy` (a rights review, or the Phase223 `public_metadata` gate), host, sitemap path, path prefix, transport | same-host URLs, `candidate_only_unverified` | reader, unchanged |
| Phase221 `discoverFromApprovedFeed221` | the same, for RSS/Atom | URLs | reader, unchanged |
| Phase82 `planMarketWatch` | `WatchSource` (seven channel types, `rightsClearedForMetadata`, cadence) | selected and blocked ids | scheduler, unchanged |
| Phase220 `runAutonomousDiscovery220` | a **free-text question** plus a vocabulary | candidates and a checkpoint | registry format (`Registry220`) and observation format (`Observation220`) reused; its question interpretation is the only step replaced |
| Phase257 policy and jobs | job ids, product, criterion, gap kind; `allowSourceReads:false` | — | input and live gate |
| Phase258 selection | descriptors of *known* sources | chosen known sources | unchanged; discovery feeds future descriptors |
| Phase260 memory | records about *canonical* source ids | — | not written (see §5) |

**First failing link.** A typed job cannot enter Phase220 without inventing a user question: it needs a question
that matches its vocabulary, and that vocabulary covers football footwear and recycling bins only. The bridge
therefore enters one level lower, at Phase82/75/221, with a typed target. It manufactures no question.

The next links, in order:

1. no operator `Registry220` source exists for any PEE policy category (the Phase244 registry is test-only);
2. `sources.policy_json` is null for all 90 known sources, so even the products' own hosts cannot be read for
   metadata;
3. the research policy disables reads.

## 3. The bridge

**`discoveryTargetFromJob261(job, {market, store})`**

- **Genuine jobs only.** It re-derives the job id with `researchJobFromGap182` and refuses any id that does not match.
- **Evidence lane from the gap kind,** using Phase258 roles and statement kinds and Phase82 channels:
  - missing or conflicting declarations → declared specifications (manufacturer or retailer channels);
  - `missing_test` → instrumental measurements and observed practical results (test feeds, specialist editorial);
  - `missing_criterion` → expert interpretation and method references.
- **Unrouted roles are listed, not forced into a wrong channel.** These are roles with no Phase82 channel type:
  video, regulatory notices, news and qualified cultural expertise.
- **Market** comes from the operator policy and is never fixed in code.
- **No language filter.** The target carries `LANGUAGE_CAPABILITIES258`, which is English-only semantics with no
  translation.
- **Publisher country is never used.**
- **Known identifiers are exact identifiers only:**
  - declared model or MPN;
  - check-digit-valid GTINs in their 14-digit form;
  - the model code of the product's own retained page URL (`urlModelToken252`).

  Names are used only to order URLs inside Phase75 (`relevanceTerms`), never to identify a product.

**`discoverForTarget261(...)`**

- **Live mode** returns `blocked_live_reads_disabled` unless the research policy allows reads. Phase257's policy type
  makes that impossible.
- **Offline mode** needs an explicit fixture transport and never falls back to the network transport.
- **Channels:** registry sources of the category, in the target's lane, with a policy, cleared in Phase82, then read
  by Phase75 or Phase221 with their own robots and rights checks.
- **Candidates rejected:**
  - already observed (normalised URL in `revisions`);
  - restricted or suspended host (`host_access`);
  - another host;
  - another model code (`url_names_other_model`).
- **Attribution of accepted candidates:**
  - `url_token_matches_known_identifier`;
  - `product_unknown`, including when a URL carries conflicting identifiers;
  - `not_product_scoped`.
- **Every candidate keeps the stages apart:**
  - candidate URL discovered: true;
  - metadata discovery allowed: true;
  - source identity registered: true only if the host is a canonical source;
  - page retrieval permitted, factual information retained, independent evidence verified, recommendation
    authorised: all false.
- **Observations** are returned in Phase220 checkpoint form (URLs and digests only).
- **Every result carries `capabilityB: {newPublisherDiscovery: false}`.**

**`assessDiscovery261(...)`** lists the blockers for a target against the operational state, with no reads.

## 4. Evaluation

**Genuine-job pilot and blocker assessment.** Script: `scripts/phase261-discovery-pilot.mjs`. Outputs, public form
only (ids, counts, reason codes; no real URLs, no identifiers, no declared values):
`evaluation/phase261/pilot-firstrun.json`, committed unchanged, and `pilot-after-fix.json`.

| Measure | Result |
|---|---|
| Research jobs mapped correctly (re-derived through Phase182) | 19/19 |
| Authorised discovery channels available today | **0** (registry sources for PEE categories: 0) |
| Blockers across 19 jobs | no registry source 19; known product hosts without a source policy 19; live reads disabled 19; capability B absent 19; no exact identifier for attribution **15** |
| Fixture candidates (2 genuine jobs, fictional hosts, public-metadata mode, basis `unknown`) | 4, all attributed to the right job and channel; `genuineDiscovery:false` |
| Genuine new discoveries | **0** (fixture URLs are not discoveries) |
| Wrong-model candidates rejected | 2/2 |
| Out-of-scope paths dropped by Phase75 | 2/2 |
| Wrong-lane channel (test feed for a declaration job) skipped | 2/2 |
| Previously observed URLs avoided | unit-tested on a temporary store. On real data it cannot be exercised: the fixture hosts are fictional, and no real host has a discovery policy. |
| Provenance kept | registry source, channel, mechanism, listing digest, `Observation220` per channel |
| Unknown identity kept unknown | `exactVariantVerified:false`; `product_unknown` when no exact identifier matches |
| Live network calls | **0** (live mode refused on both pilot jobs) |
| Store unchanged | yes |

**Defect found by the first run, fixed in checkpoint B.** Both pilot products' only exact identifier is a GTIN. A GTIN
is numeric, not a letters-and-digits model token, so a URL carrying the product's own GTIN was labelled
`product_unknown` (first run).

- **Fix:** exact path-segment match against known identifiers, with GTINs normalised by `validGtin246`. A URL that
  also names a different model code stays unknown.
- **Covered by** a regression test.
- **After the fix:** 2/2 such URLs match. Nothing else changed.

**Phase260 retry edge case: reproduced and fixed.**

- **The defect:** an identical retry of a record that had superseded another was refused, because re-validation found
  its target no longer active.
- **The fix:** retries are now matched on the caller-supplied content *before* re-validation. They return
  `already_recorded`. The same id with other content is still refused.
- **Unchanged:** transaction, journal verification and history.
- **Covered by** a new test for annotations and contributions.

**Tests and checks.**

- `tests/phase261_discovery_bridge.test.ts`: 6 tests.
- `phase260`: 13 tests, 1 new.
- Neighbouring suites (`phase75`, `82`, `220`, `221`, `223`, `244`, `257`, `258`, `259`, `260`, `261`): 120 tests,
  all passing.
- **Full suite: 4,459 tests passed**, exit 0.
- **Store:** `verify` passes (remote `32f7b2d`, integrity and journal OK, live content matches the remote; 90 sources,
  140 revisions, 189 products, 2,385 declarations, 1,374 events).
- **Public/private boundary:** committed outputs contain no `https` URL. Every long digit run belongs to a
  hexadecimal job or product id. No SQLite file or policy file is tracked.

## 5. Boundaries found (precise, not implemented)

1. **Capability B is absent.** PEE has no way to generate candidate publishers, domains or channels. Phase196's
   publisher seed is a closed list, Phase177's keyword proposals are never sent, and Phase220 says "No general web
   index is connected". Any future mechanism must produce *candidate* sources that still pass identity, rights and
   robots checks. No permanent whitelist is assumed.
2. **No operational discovery registry.** A `Registry220` for PEE's categories, with reviewed policies, is an operator
   decision. Every job's channel count depends on it.
3. **Discovery candidates cannot enter Phase260 memory.** Phase260 state events need a canonical source id. An
   unknown host has none until an observation registers it, so candidates stay as bounded `Observation220` records.
   Registering a source without an observation would fabricate one.
4. **Requirement qualifiers are inexpressible.** `ResearchGap181` and `ResearchJob182` carry only
   `product:criterion`. Each target lists `inexpressible: test_conditions, assessor_expertise, cultural_tradition`.
   On the source side, Phase258 descriptors can already express all three; on the requirement side they cannot.
5. **Phase82 has no channel types** for regulatory notices, video platforms, news or qualified cultural experts.
   Targets list these as `unroutedRoles`.
6. **Attribution needs exact identifiers.** 15 of 19 job products have only host-scoped SKUs or names, which are not
   identifiers on another host. Their candidates would all be `product_unknown`.

## 6. Forward-compatibility checks (conceptual, not jobs)

| Future requirement | Where it enters | Status |
|---|---|---|
| Air fryer: independent cooking-evenness evidence | `missing_test` → measurement or practical lane → `professional_test_feed`, `specialist_editorial` | expressible; video demonstration unrouted |
| Dehumidifier: extraction performance at stated temperature and humidity | `missing_test` with criterion `extraction_rate` | criterion expressible; **conditions inexpressible** (boundary 4) |
| Espresso: qualified Italian sensory assessment | `missing_criterion` → interpretation lane with `qualified_cultural_expertise` | role named but **unrouted**; **assessor expertise and tradition inexpressible** (boundaries 4–5) |

None is authorised. The Phase257 policy names neither these categories nor `missing_test`, and the bridge refuses a
category outside the policy. No gap kind was added.

The three teaching packages (air fryers, dehumidifiers, coffee) were not imported or used.

## 7. Limitations

- **Pilot size.** Two jobs, with fixture listings written for the pilot. Results show the path works and the safety
  rules hold. They say nothing about real discovery yield.
- **No real data for already-observed avoidance.** It is tested only on a temporary store.
- **Model-code heuristic.** Wrong-model rejection relies on `urlModelToken252`. A URL without a model code is never
  rejected and stays `product_unknown`.
- **Scope.** Only Phase75 sitemaps and Phase221 RSS/Atom feeds are read. WebSub and `approved_index_delta` watches
  are treated as wrong-lane.
