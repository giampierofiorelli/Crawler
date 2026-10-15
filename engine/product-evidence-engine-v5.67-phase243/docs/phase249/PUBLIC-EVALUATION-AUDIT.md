# Audit of public evaluation material (Phase249)

Reproduce with `node scripts/phase249-public-audit.mjs evaluation` (read-only).

## Findings (2026-10-15, 322 files)

| Check | Result |
|---|---|
| Raw third-party HTML | None. The 7 HTML files (`evaluation/phase83/fixtures/site/*`) are synthetic fixtures. Raw page bytes of every live run stay in operator scratch directories, referenced by URL and SHA-256 manifests. |
| E-mail addresses | 0. |
| Phone-like numbers | Pattern hits only, in hash manifests, CSVs and IDs. No contact data. |
| Third-party factual values in gold files | 642 values in 9 gold files (Phases 245–249). Maximum per page: 6–26 values, a sample of each page's specification rows, plus page types and abstention expectations. |
| Long verbatim text | Stack Exchange request excerpts (≤ 360 characters each) in the Phase249 real-request benchmarks and their results, under CC BY-SA with per-case author and link. See `evaluation/phase249/NOTICE-CC-BY-SA.md`. Everything else that is long is PEE's own prose: notes, paraphrases, method summaries. |
| Government data | `phase184` ENERGY STAR data, under the EPA data licence (US federal data). GOV.UK notices appear only as paths, gold annotations and metrics. |
| Reddit material (Phases 172–178) | Developer-written paraphrases only, as their files state. |

## Assessment

- **Gold values.** The gold values are individual facts sampled from each page, never whole tables or articles. They
  are kept public because they make the first-run results reproducible. That is an insubstantial use, cited per
  page through the manifests.
- **Separation from the operational store.** The private store keeps far more (2,385 values) and never publishes
  them.
- **Exposure that moving files cannot reverse.** Every file listed above is already in the public Git history.
  Moving or deleting it now would not remove it from history, and history was not rewritten (owner instruction).
  If a rights holder asked for removal, the files could be removed going forward and the history question would be
  an owner decision.

## Going forward

- **Confidential material goes outside Git.** This covers raw pages, adjudication inputs carrying full value lists,
  and any licensed results. It belongs in `$PEE_PRIVATE_EVAL_DIR`, by default
  `~/.local/share/product-evidence-engine/private-eval`. `privateEvaluationDir249()` refuses any location inside a
  Git working tree.
- **What is published:** metrics, manifests (URL, SHA-256, fetch time) and gold limited to sampled facts.
- **Already ignored:** `.gitignore` ignores `*.sqlite` and `private-eval/`.
- **Separate output files:** first-run and development results stay in separate files, with first-run files never
  edited after commit.
