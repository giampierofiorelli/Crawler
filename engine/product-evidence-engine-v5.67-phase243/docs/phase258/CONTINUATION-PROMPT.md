# Continuation prompt after Phase258

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE259. Use the `pee-guided-learning` skill. Read
`engine/product-evidence-engine-v5.67-phase243/docs/phase258/PHASE258-TECHNICAL-REPORT.md` and `REUSE-AUDIT.md`.
Check `git log` and run `node scripts/knowledge-snapshot.mjs verify`. Restore and verify the research policy with
`scripts/phase257-research-policy.mjs restore`, then `verify`. It expires 2026-11-15.

**State:**
- `SourceDescriptor258` (roles, statement kinds, country, BCP 47 language, market, expertise basis, tradition,
  sponsorship, access) maps onto Phase196.
- `phase258_source_memory` provides source states, contribution feedback and dry-run selection per Phase257 job.
- All validated on synthetic fixtures; nothing is persisted; no language other than English is understood.

**Choose ONE bounded objective, after an owner decision:**
1. **Persist source descriptors and states** in the private store, backward-compatibly. Use new tables or journal
   events, with no change to canonical declarations, and keep the public/private rule. Then register REAL source
   descriptors (operator metadata only, no fetching) for the 19 Phase257 demo jobs' products, and re-run the
   selection.
2. **Multilingual evaluation set.** Collect a small, rights-checked set of real short specification statements in it,
   fr, de and ja (prepared in report §6). Seal the human labels, and measure the current English-only pipeline as a
   baseline: expected near zero, and reported as such.

**Do not:** crawl or fetch; translate automatically; compute source scores; admit evidence; rank; import teaching
packages; rewrite Git history.
