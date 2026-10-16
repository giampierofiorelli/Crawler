# Continuation prompt after Phase260

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE261: connect research jobs to existing source discovery (investigation first).

## Before starting

- Use the `pee-guided-learning` skill.
- Read `engine/product-evidence-engine-v5.67-phase243/docs/phase260/PHASE260-TECHNICAL-REPORT.md`.
- Check `git log`.
- Run `node scripts/knowledge-snapshot.mjs verify`. The store is schema v4, with an empty `source_memory260`
  projection.
- Restore and verify the research policy with `node scripts/phase257-research-policy.mjs verify`. It expires on
  2026-11-15. Renewing it is the owner's decision.

## Problem

Phase257 plans 19 valid research jobs. Phase259 selection finds 0 fresh source candidates for every one of them: every
known page has already been read, is a table attribution, or sits on a restricted host. PEE needs new sources, found
lawfully.

## Task

Investigate, then implement only the smallest coherent connection between those jobs and the existing discovery
facilities. Do not build a new engine.

1. **Audit the existing discovery facilities.** Find what each needs from an operator: `WebSourcePolicy` with
   `metadata_discovery`, a source registry, and fresh robots and terms checks. Find what each returns.
   - `phase75_source_discovery.ts`: `discoverFromApprovedSitemap`, `approvedMetadataDiscovery75`.
   - `phase82_market_watch.ts`: `planMarketWatch`, `triageMarketSignals`.
   - `phase220_autonomous_discovery_worker.ts`: `runAutonomousDiscovery220`, its operator registry and checkpoint.
2. **Find the first failing link** from a job (product, criterion, gap kind, market `uk`) to a discovery request. The
   likely candidates:
   - no approved metadata policy exists for any host;
   - jobs carry no host or channel;
   - the vocabulary does not cover the categories.
3. **Design the smallest bridge:**
   - job → discovery query terms (from the product identity and criterion, never from user text as permission);
   - → approved sources only;
   - → unverified candidate URLs.
   Record candidates through Phase260 memory as `source_state_changed` `discovered` (cause `discovery`), at the
   source level. They are never identities, evidence or permissions.
4. **Test the bridge as a dry run**, with test-only policies and fixtures, and with the real 19 jobs read-only.
   Report how many jobs could be served today, and what operator decision each remaining job needs, for example which
   approved metadata source per category and market.

## Do not

- Do any live network reads unless the owner approves a specific policy in the brief.
- Bypass robots rules, 403 or 429 responses, or terms.
- Treat a sitemap or feed as consent.
- Register sources by guessing their type, country or language.
- Manufacture reviews or verifier acceptances.
- Admit evidence, rank, translate, score sources, crawl, or rewrite Git history.

Stop after Phase261.
