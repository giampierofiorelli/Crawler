# Continuation prompt after Phase261

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE262: first genuine source-discovery pilot under separately verified access permissions.

## Before starting

- Use the `pee-guided-learning` skill.
- Read `engine/product-evidence-engine-v5.67-phase243/docs/phase261/PHASE261-TECHNICAL-REPORT.md`, especially §2 and
  §5.
- Check `git log`.
- Run `node scripts/knowledge-snapshot.mjs verify`.
- Run `node scripts/phase257-research-policy.mjs verify`. The research policy expires on 2026-11-15.

## Precondition (owner decision, not Claude's)

The Phase261 bridge works offline, but 0 of the 19 jobs can be served. Three things block them:

- there is no operator discovery registry for PEE's categories;
- no known host has a source policy;
- live reads are disabled.

Phase262 may start only after the owner, in the brief, does all of the following:

1. **Names one to three hosts and one category** for a pilot, with the channel type and sitemap or feed path for
   each. These should preferably be hosts that already appear as sources of genuine job products.
2. **States the access basis for each host:** either a reviewed metadata-discovery policy, or the Phase223
   public-metadata mode, which asserts no licence. A fresh robots and terms check runs at execution.
3. **Approves a new research-policy revision** allowing metadata-discovery reads only, with an explicit read cap. Page
   retrieval and fact retention stay disabled unless separately approved.

If any of these is missing, do not perform any network read. Report what is missing.

## Task, given the precondition

1. Express the approved hosts as a `Registry220` held outside Git (like the research policy), with a durable copy in
   the private repository. Load it and validate it.
2. Run `discoverForTarget261` live for the genuine jobs of that category, within the read cap. Use the existing
   Phase75/221 readers and robots checks; there is no new transport.
3. Report genuine candidates per job: attribution, already-observed exclusions, wrong-model rejections, reads used,
   and any 403, 404 or 429 responses, which feed `recordAccess246`. Never bypass them.
4. Do not retrieve candidate pages, retain facts, register sources or record Phase260 memory for unknown hosts.
   Candidates stay `Observation220` leads.

## Do not

- Implement capability B (new publisher discovery) without a separate decision. It remains absent.
- Import the three teaching packages; they are the next priority after this pilot.
- Admit evidence, rank, translate, score sources, crawl, or rewrite Git history.

Stop after Phase262.
