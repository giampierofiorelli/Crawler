# Continuation prompt after Phase262

Copy into a new session on `giampierofiorelli/Crawler`, branch `claude/typescript-network-transport-test-1givnd`.

---

PEE — PHASE263: first genuine metadata-only search pilot (only if the owner authorises it).

## Before starting

- Use the `pee-guided-learning` skill.
- Read `engine/product-evidence-engine-v5.67-phase243/docs/phase262/PHASE262-TECHNICAL-REPORT.md`, especially §1,
  §4 and §7.
- Check `git log`.
- Run `node scripts/knowledge-snapshot.mjs verify`.
- Run `node scripts/phase257-research-policy.mjs verify`. The research policy expires on 2026-11-15.

## Owner preconditions (none can be inferred)

1. **A search endpoint:** a public HTTPS SearXNG `/search` instance, or another provider through a replaceable
   adapter, with JSON enabled. Give its access terms as reviewed, by whom and when. Any licence review needed for
   operating it is the owner's.
2. **Approval of a metadata-search policy**, as specified in the Phase262 report §7:
   - operation `metadata_search` only;
   - explicit genuine job ids;
   - limits on queries, requests, bytes and time;
   - expiry of at most 30 days;
   - no page retrieval, fact retention, source registration or ranking.
3. **Network access** from the session to that endpoint.

If any precondition is missing, do not make any network request. Report exactly which one is missing.

## Task, given the preconditions

1. Implement the policy validator by reusing Phase257 conventions: protected file outside Git, trusted clock, strict
   fields, revision. Wire it as the only gate that lets `searchForTarget262` run live. Write tests first. A Phase257
   policy, a Phase223 config, or a job id alone must still be refused.
2. Run live for 2–4 of the approved genuine jobs. Keep the first run unchanged.
3. Report, separately:
   - new domains;
   - attribution (exact match, unknown, rejected);
   - already-seen exclusions;
   - requests used;
   - any 403, 429 or 5xx responses (stop, never retry around them).

   Then judge relevance by hand against criteria written before the run.
4. Candidates stay leads. Do not open candidate pages, register sources or write Phase260 memory for unknown hosts.

## After Phase263

Next comes structured teaching from the three research packages (air fryers, dehumidifiers, coffee). Evaluate it on
unseen requests before and after teaching. It needs the requirement-side fields named in the Phase262 report §6.

## Do not

- Install or deploy SearXNG.
- Translate terms or claim multilingual understanding.
- Admit evidence, rank, score sources, crawl, or rewrite Git history.

Stop after Phase263.
