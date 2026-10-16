# Phase258 technical report — source intelligence, evidence diversity, multilingual-ready metadata

**Date:** 2026-10-16. **Branch:** `claude/typescript-network-transport-test-1givnd`.

| Item | Value |
|---|---|
| Checkpoint A | `3a1f65c` |
| Checkpoint B | `6906e0a` |
| Full suite | 4,436 tests pass (19 shards), exit 0 |
| Private store | verified, unchanged (189 products, 2,385 declarations, 1,373 events) |
| Network, retrieval, translation, scoring, evidence admission | none |

## 1. Reuse audit

See `REUSE-AUDIT.md`. The existing source intelligence covers:

- Phase196: material roles, review lanes and an exploration slot, with no score or whitelist;
- Phase193: revision-scoped screening memory;
- Phase197:
  - regional search targets with a `cultural_protocol` rationale;
  - expertise basis, which excludes nationality;
- Phases 198/199: specialist validation;
- Phases 203–219: video and press discovery.

**Limits found:**

1. Phase196 has 6 material roles, so video, journalism, news, press releases, safety notices, expert interpretation and
   cultural expertise all become `unclassified`.
2. There is no shared BCP 47 validation: three diverging local regexes.
3. There is no language field on sources, revisions or declarations.
4. There is no source lifecycle beyond screening decisions.
5. There is no verified-contribution feedback.

**Language today:**

| Task | Support |
|---|---|
| Detection | none |
| Structural extraction | language-independent, with English label heuristics |
| Terminology, semantics, faithfulness | English only |
| Translation | none |
| Localisation | partial (Italian clarification labels) |

PEE does not understand Italian, French, German or Japanese.

## 2. What was added (two modules, no store migration)

**`phase258_source_contributions`** (checkpoint A):

- **`SourceDescriptor258`**, strictly validated:
  - several roles per source (12 roles) and statement kinds (8, from declared specification and instrumental
    measurement through observed practical result, reported experience, expert interpretation, promotional assertion,
    unverified opinion and safety notice);
  - separate facts: publisher country (ISO, or `unknown`), language (BCP 47, `und` allowed), product market,
    testing conditions, method, specialist basis (the Phase197 vocabulary), cultural tradition, sponsorship,
    originality, derivation and access;
  - an optional original short statement, verbatim and language-tagged, only with reviewed quotation rights.
- **It rejects:**
  - authority or country scores;
  - a sponsored or gifted "independent" measurement;
  - an opinion presented as a measurement;
  - a press release presented as a test;
  - nationality as expertise;
  - a cultural tradition without specialist validation;
  - an identity claimed as verified when it is not.
- **`materialRoleFor196`:** a deterministic mapping that never upgrades interpretation, promotion or derivative
  material.
- **`languageTag258`, `TermObservation258`** (terms are candidate data, never translations) and
  **`LANGUAGE_CAPABILITIES258`**.

**`phase258_source_memory`** (checkpoint B):

- **Source states:** append-only and hash-chained.
  - A 404 is temporary; retirement needs an operator.
  - "Useful" needs verified feedback.
  - A moved or changed source starts afresh, without permissions, reviews or feedback.
  - Tampering is detected before meaning is checked.
- **Contribution feedback:**
  - outcomes: confirmed specification, revealed error, resolved identity, independent test, valid contradiction,
    prevented wrong recommendation, no contribution, not retrievable;
  - reliability, quality, relevance, contribution, cost and eligibility kept separate;
  - no score; agreement with PEE rejected.
- **Dry-run selection for one Phase257 job:**
  - lanes by gap kind: declaration, measurement, practical, interpretation, lead;
  - excluded: other products, not-permitted access, retired or restricted sources;
  - derivatives and duplicate URLs collapsed;
  - an exploration slot for unfamiliar sources;
  - publisher and requester country never used.

## 3. Pilot (`scripts/phase258-source-pilot.mjs`, `evaluation/phase258/pilot*.json`)

**Set-up:**

- 4 retained product records (ids only; identity unverified): air fryer, espresso machine, kettle, rice cooker;
- 13 **synthetic** source fixtures covering manufacturer, retailer, independent lab, professional review, Italian
  and Japanese specialists, video, safety notice, journalism, derivative copy, press release, an undetermined-language
  owner report and a not-permitted forum;
- markets: uk, us, de, fr, it, jp; languages: en, it, fr, de, ja (with regions) and `und`.

| Measure | Result |
|---|---|
| Phase196 role from descriptors | 13/13 as expected |
| Provenance (source id, URL, origin) | 13/13 |
| Duplication | derivative copy collapsed onto the original lab |
| Geographic preference | none: swapping publisher countries changes no selection; requester country is not an input |
| Language metadata | all BCP 47 valid; `und` kept; 0 translations |
| Identity and access | every selection keeps `unverified`; not-permitted source excluded |
| Lane fits the gap | yes: declaration gaps never routed to tests or opinions; expertise only as interpretation |
| **Product attribution** | **first run: 6 selections about another product; after the fix: 0** |

**Comparison with the Phase196 route.** The same sources were fed through `analyzeEphemeralBatch195` and
`planSourceReviews196`:

- Phase196 merges 8 distinct role combinations inside its lanes;
- 7 sources become `unclassified`;
- the not-permitted forum still lands in a review lane (Phase196 has no access notion).

The descriptor keeps these distinctions and feeds Phase196 the same material role.

## 4. Defects found

1. **Misattribution (pilot first run, kept as `pilot-firstrun.json`).** Sources about another product were ranked
   lower, not excluded:
   - the rice-cooker test job received the espresso lab;
   - the kettle conflict job received air-fryer sources.

   Fixed: sources about other products are excluded; unattributed sources may only interpret or lead. Regression test
   added.
2. **Wrong rejection reason (unit test).** A tampered ledger was rejected by the meaning check before the integrity
   check, so the reason was misleading. The order is now integrity first.

## 5. Limitations

- **Fixtures, not observations.** All source descriptors are synthetic. No real source was classified, retrieved or
  read.
- **No language understanding.** Detection, interpretation and translation do not exist for any language other than
  English (scoped). Metadata only.
- **Separate validators remain.** Phases 197, 203 and 212 keep their own language regexes.
- **No persistence for the new records.** Descriptors, states and feedback are not yet stored (no migration); they
  are validated contracts for the next phase.

## 6. Prepared multilingual evaluation (not run)

Real short texts per language (en, it, fr, de, ja), each labelled for:

- negation ("non supera", "nicht", "〜ない");
- units and full-width digits ("４.５Ｌ");
- modality ("può", "kann", "〜できる");
- context;
- model attribution (statements about another model on the same page).

Score only after a language-specific reader exists, against human labels, and report per language. Accepting Unicode
is not a result.
