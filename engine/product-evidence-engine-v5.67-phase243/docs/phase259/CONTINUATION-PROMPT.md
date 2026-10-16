# Continuation prompt after Phase259

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE260: minimal source-intelligence persistence.

Use the `pee-guided-learning` skill. Read
`engine/product-evidence-engine-v5.67-phase243/docs/phase259/PHASE259-TECHNICAL-REPORT.md`, especially the
persistence requirements. Check `git log`, run `node scripts/knowledge-snapshot.mjs verify`, and restore and verify the
research policy (it expires 2026-11-15).

Implement exactly the Phase259 table, tests first:
1. Journal event kinds in the existing hash-chained events:
   - `source_annotation_recorded` (reviewed facts only, with basis, `reviewId` and supersedes);
   - `screening_decision_recorded` (`DecisionEvent193`);
   - `source_state_changed` (`SourceStateEvent258`);
   - `source_contribution_verified` (`ContributionFeedback258`).
2. One projection rebuilt from the journal, with backward-compatible schema migration and snapshot verification.
3. `descriptorFromRetained259` reads annotations when present; unknown stays unknown otherwise.
4. Tests: append-only, supersession, recovery by replay, no guessed values accepted, no scores, a public output without
   values. Store sync and verify afterwards.

**Do not:** register sources by guessing; fetch or crawl; translate; score sources; admit evidence; rank; rewrite Git
history.
