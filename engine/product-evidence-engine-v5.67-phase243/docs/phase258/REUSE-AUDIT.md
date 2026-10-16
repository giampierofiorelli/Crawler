# Phase258 reuse audit — source intelligence, evidence diversity, language

What exists (code read on 2026-10-16), and what Phase258 adds.

## Existing modules, reused

| Module | What it already does | Limitation found |
|---|---|---|
| Phase193 `screening_memory` | Hash-chained screening decisions scoped to a document revision and policy; supersession; a "discovery only" decision keeps candidate products | Screening decisions, not source states (moved, unavailable, retired, changed ownership) |
| Phase196 `source_intelligence` | `MaterialRole196`, scoped matrix, review lanes, a reserved exploration slot for unfamiliar sources, no universal score, no whitelist, links to Phase182 jobs | 6 material roles: video, journalism, news, press releases, safety notices, expert interpretation and cultural expertise all fall into `unclassified` |
| Phase197 `evidence_sufficiency` | `RegionalSearchTarget197` (with a `cultural_protocol` rationale), `AssessorExpertise197` (expertise basis; "nationality is not competence") | Local language regex only |
| Phase198/199 | Specialist outcome validation and disclosure; "passport, language, celebrity never convey authority" | — |
| Phase96 | Qualitative original-test findings, separate from stars and numbers | — |
| Phase203–218 | Video discovery, provider normalisation, licensed media, ASR evaluation, discovery-time provenance | Not executed in this phase |
| Phase219 | Press releases, catalogue notices, company signals as discovery metadata | — |
| Phase246 store | Sources, revisions (superseded_by), declarations, journaled events | No language field on sources, revisions or declarations |
| Phase245 / 248 / 252 | Structural extraction; request interpretation; faithfulness checks | English label heuristics and English semantics only |
| Phase257 | Policy-bounded research plans | — |

## Language capabilities today (`LANGUAGE_CAPABILITIES258`)

| Task | Support |
|---|---|
| Language detection | none |
| Structural HTML extraction | language-independent structure; English label heuristics |
| Multilingual terminology matching | English only |
| Semantic interpretation | English only (scoped) |
| Faithfulness checking | English only (lexical) |
| Translation | none |
| Frontend localisation | partial: Italian clarification labels (Phase127) |

**Conclusion.** PEE stores Unicode text and can carry language tags. It does not understand Italian, French, German or
Japanese.

**Language-neutral identifiers already exist:** `SPEC_CRITERIA249` keys, need concept ids, product ids and source
hashes. Terms in each language are kept separately as `TermObservation258` (`candidate_unreviewed`), never as
translations.

## Added in Phase258

**Checkpoint A** (`src/phase258_source_contributions.ts`):

- `SourceDescriptor258`, strictly validated:
  - several roles per source, and statement kinds;
  - publisher country, BCP 47 language (with `und`), product market;
  - testing conditions, method, and specialist basis (the Phase197 vocabulary, no nationality);
  - cultural tradition, which always requires specialist validation;
  - sponsorship, originality, derivation, access;
  - an optional short original statement, only with reviewed quotation rights.
- `materialRoleFor196`: a deterministic mapping onto Phase196 that never upgrades interpretation, promotion or
  derivative material.
- `languageTag258`: one shared BCP 47 well-formedness check. Phases 197, 203 and 212 keep their local regexes; unifying
  them is a later clean-up.

**No store migration.** Language and roles live in descriptors and source-state events, not in canonical
declarations.

**Checkpoint B:** see the Phase258 report.
