# Continuation prompt after Phase264

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE265: persist Phase225/226 test-result leads into knowledge, then teaching from the research packages.

## Before starting

- Use `pee-guided-learning`.
- Read `engine/product-evidence-engine-v5.67-phase243/docs/phase264/PHASE264-TECHNICAL-REPORT.md`.
- Check `git log`.
- Run `node scripts/knowledge-snapshot.mjs verify`.

**State.** The Phase264 live metadata pilot ran once. It stopped on its first request: Wikidata answered 429 with
Retry-After. Nothing was discovered. Its policy (`pee264_metadata_pilot` r2) expires on 2026-10-23. Do not re-run it
unless the owner explicitly confirms a resumed run; any such run is reported as a second run.

## Task

1. **Connect the Phase225/226/227 test-result leads to persistent knowledge.**
   - The leads carry a value, unit, condition, method cue and an unverified subject.
   - Store them as `test_publisher_declaration_unreviewed` measurements, using the existing Phase246/249 tables and
     the journal. Respect the class policy, caps and reservations.
   - Product identity stays unverified unless an exact identifier matches; never merge on similar names.
   - Write tests first, on fixtures. There is still no lawful real page body: do not fetch one.
2. **Structured teaching** from the air-fryer, dehumidifier and coffee research packages, evaluated on unseen requests
   before and after teaching. The gold set stays separate, and a tuned set is never reported as held-out.

## Do not

- Retrieve pages.
- Bypass robots rules, 403/429 or Retry-After.
- Change the Phase249 retention policy.
- Admit evidence, rank or score sources.
- Rewrite Git history.

Stop after Phase265.
