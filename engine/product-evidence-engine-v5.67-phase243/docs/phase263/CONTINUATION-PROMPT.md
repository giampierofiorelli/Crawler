# Continuation prompt after Phase263

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE264: first genuine metadata-discovery pilot (requires the owner's approval sentence).

## Before starting

- Use `pee-guided-learning`.
- Read `engine/product-evidence-engine-v5.67-phase243/docs/phase263/PHASE263-TECHNICAL-REPORT.md` (§3) and
  `PHASE263-ASSESSMENT.md`.
- Check `git log`.
- Run `node scripts/knowledge-snapshot.mjs verify`.
- Run `node scripts/phase257-research-policy.mjs verify`. That policy expires on 2026-11-15.

## Precondition

Proceed to live requests only if this brief contains the owner's explicit approval of the metadata-only pilot in
Phase263 §3 (Wikidata P856 for job brands, then robots and sitemaps on the returned official domains, with budgets
and expiry). Otherwise implement and test offline, and report what is missing.

## Task

1. **Implement a narrow metadata-discovery policy validator** following Phase257 conventions:
   - protected file outside Git, trusted clock, strict fields, revision, expiry of at most 30 days;
   - explicit genuine job ids, re-derived through Phase182;
   - per-run request, byte and time budgets;
   - allowed operations: Wikidata entity lookup and robots/sitemap metadata only.

   Write tests first. A Phase257 policy, a provider config or a job id alone must still be refused.
2. **Add a Wikidata official-website provider** for the identity and declaration lane. Brand → P856 gives an
   unverified *candidate official domain*: the brand match is ambiguous until reviewed. Feed it into the existing
   Phase261 known-source discovery through a registry built in memory from the approved pilot, never persisted as a
   permission.
3. **Run once, live, within budget,** and keep the first run unchanged. Report separately:
   - brands resolved to an official domain;
   - robots and sitemap reachability;
   - sitemap URLs matching job identifiers (exact, unknown, rejected);
   - already-seen exclusions;
   - requests and bytes used;
   - every 403, 429 or 5xx (stop; never bypass).

   Judge relevance by hand against criteria written before the run.
4. **Keep candidates as leads:** no product-page retrieval, no fact retention, no source registration, no Phase260
   memory for unknown hosts.

## Then

Next comes structured teaching from the air-fryer, dehumidifier and coffee research packages, evaluated on unseen
requests before and after teaching.

## Do not

- Deploy SearXNG, or operate AGPL software, without a licence decision.
- Admit evidence, rank, score sources, translate, or rewrite Git history.

Stop after Phase264.
