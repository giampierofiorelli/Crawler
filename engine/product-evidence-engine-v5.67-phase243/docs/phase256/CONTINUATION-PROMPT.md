# Continuation prompt after Phase256

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE257: policy-bounded research planning (implementation of the Phase256 decision).

Use the `pee-guided-learning` skill. Read `engine/product-evidence-engine-v5.67-phase243/docs/phase256/PHASE256-ARCHITECTURE-DECISION.md`.
Check `git log` and run `node scripts/knowledge-snapshot.mjs verify`. Confirm the owner's answers to §10 (policy
location and first policy); if there are none, use the recommended defaults with `allowSourceReads:false`.

Implement exactly §8, tests first:
1. `ResearchGap181` gains `missing_declaration` and `declaration_conflict`. Phase254 maps specification gaps to
   them; Phase182 words execution by gap kind. Existing `missing_test` job ids stay unchanged.
2. `loadResearchPolicy257`, which refuses Git work trees, expired policies, unknown fields and empty scope, and
   `planResearchFromNeeds257` (pure, no Phase181 decision).
3. `executeUnderPolicy257`: re-check against the current policy, then the unchanged `executeResearchGaps182`, with
   caps from the policy.
4. Tests for every threat case in §9, including the legitimate plan. Inject the transport as a stub; no live reads.

**Do not:** forge or construct a Phase181 decision; change `planResearchGaps182`'s requirements; enable real reads;
admit evidence; rank; add cryptography (see §4 for when it becomes necessary); import teaching packages.

Then run focused tests, the full suite once, verify the store, write a short report and continuation prompt, commit
and push.
