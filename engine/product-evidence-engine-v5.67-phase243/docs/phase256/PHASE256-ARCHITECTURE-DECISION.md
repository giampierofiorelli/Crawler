# Phase256 architecture decision — research planning, trust boundaries, minimal authorisation

**Date:** 2026-10-16. **Base:** `003669e`. This is a design document only: no code, store or policy changes, and no
research run.

## 1. The actual blockage in Phase181/182

Traced in the code:

| Operation | Function | Checks it performs | Side effects |
|---|---|---|---|
| A. Planning | `collectResearchNeeds254` | needs come from `Advice253.researchInputs` | read-only SQL on the store; returns data |
| A. Planning | `planResearchGaps182` | requires a `DynamicDecision181` **shape** (`source:'signed_product_knowledge'`, flags), not its signature; bounds ids and job count (≤ 100) | none (pure); returns a plan and its hash |
| A. Planning | `dynamicKnowledgeAnswer181` | verifies a **signed catalog** against `TrustedRankingAuthority180.publicKeys`; per-product gaps exist only after verification | none (pure) |
| B. Execution | `executeResearchGaps182` | plan shape, `planHash` recomputation, job ids, ordering; operator-supplied `operatorSources` (`operator_curated_unverified`), `sourcePolicies`, `allowSourceReads` opt-in, `maxSourceReads` ≤ 5, worker budget ≤ 10 | runs local category workers; network only through `readApprovedSource` with a transport; page bodies quarantined, only digests returned; **no store write** |
| B. Execution | `planWebEvidenceAcquisition`, `readApprovedSource` | rights basis (written permission, open licence, statutory exception), commercial-use review, robots allowed and fresh, terms not prohibited, redirects, size cap | HTTP GET of approved URLs only |
| B. Execution | `appendResearchRun182` | hash-chained receipts, expected revision (no stale writes), duplicate-run detection | pure; the caller persists it |
| C. Admission | `KnowledgeStore246.ingestObservation246` and retention policy (Phase249), journaled events | source registration, retention class, identity guards | **writes the private store** |
| D. Ranking | Phase180 signed release, Phase181 signed catalog | Ed25519 signatures with operator public keys | publishes an order |

**Findings.**

1. **Planning is gated on D's credentials without reason.** Phase182 can plan only from a Phase181 decision.
   Per-product gaps exist only with a signed **ranking** catalog, so Phase254 needs can never become a plan.
2. **That gate does not protect anything.** `executeResearchGaps182` accepts any well-formed `ResearchPlan182`.
   `planHash` is a content fingerprint that anyone can recompute: it detects accidental edits, not origin or
   approval.
3. **The real protections sit at B's inputs, not at A:**
   - the operator-supplied sources, policies and transport;
   - the opt-in to source reads and the read cap;
   - the source-policy checks;
   - quarantine.
4. **C and D are already separate** from Phase182, which never writes knowledge, never ranks and issues no review
   receipt.

**Verified on built code (2026-10-16).** A `ResearchPlan182` built by hand, with no Phase181 decision and a
recomputed hash, is accepted by `executeResearchGaps182`:

- outcome `no_curated_sources`;
- 0 reads;
- `canonicalKnowledgeUpdated:false`.

The same plan with `maxSourceReads:1` and no opt-in is refused (`phase182_read_requires_explicit_operator_opt_in`).

## 2. Recommended architecture

**Combine approach 1 with approach 2. No cryptography.**

- **(1) An inert planner.** `planResearchFromNeeds257` turns Phase254 needs into a standard `ResearchPlan182`. It
  needs no Phase181 decision, because planning is pure data with no side effect. It never constructs or forges a
  `DynamicDecision181`, and `planResearchGaps182` stays unchanged for the ranking-catalog path.
- **(2) An operator research policy.** A small JSON file loaded from protected configuration and checked twice:
  - **When planning**, for scope and size.
  - **When executing**: `executeUnderPolicy257` re-checks the plan against the *current* policy, then calls the
    unchanged `executeResearchGaps182` with caps taken from the policy, never from the plan or the request.
- **Routine work:** an operator approves a bounded policy once; individual tasks need no manual approval. Every
  execution safeguard (sources, robots, rights, quarantine) still applies per read.

**Why not approach 3 now.** A signature protects authorisation only when it crosses a boundary its holder does not
control. Today:

- one host and one operator;
- Claude is the sole agent;
- the policy is read from a path the operator controls, and anyone able to write that file could also replace the
  verification key or code.

A signature would add a key-management burden and no protection.

## 3. Existing code and controls to reuse

- **Planning:** `researchJobFromGap182` (job identity and bounds), `ResearchPlan182` (schema and hash).
- **Execution:** `executeResearchGaps182` unchanged, with:
  - `planWebEvidenceAcquisition` and `readApprovedSource` (rights, robots, terms, quarantine);
  - `appendResearchRun182` (audit chain, stale-write refusal, duplicate runs).
- **Policy storage:** `insideGitWorkTree249` refuses a policy file inside a Git work tree (the public repository),
  the same way the store already refuses one.
- **Store:** read-only for planning; untouched by execution.
- **Public output:** the Phase253 public-form rule. Plans and receipts carry ids, criteria and statuses only.

## 4. Is a new cryptographic grant required?

**No, not in Phase257.** A signature becomes necessary at the first of these boundaries:

- **Separate executor.** Plans or policies are produced in one environment and executed in another that has network
  capability (for example a separate worker host or a scheduled cloud job reading a shared queue).
- **Shared writable storage.** The policy is stored where parties other than the operator can write it (a shared
  bucket, a repository accepting outside contributions).
- **Several operators.** Approvals must be attributable to one person, or non-repudiable.

Then reuse the Phase180 Ed25519 verification (operator public keys, `keyId`, expiry); no new dependency is needed.
Until then, file location and permissions are the control.

## 5. Proposed interfaces (Phase257)

```ts
// Protected configuration: $PEE_RESEARCH_POLICY (outside any Git work tree), never user or web input.
interface ResearchPolicy257 {
 schema:'pee257.research-policy.v1';policyId:string;revision:number;     // bump the revision to cancel prior plans
 market:string;expiresAt:string;                                         // an expired policy denies everything
 categories:string[];                                                    // explicit scope; empty = deny all
 needKinds:('missing_declaration'|'conflicting_declarations'|'missing_independent_test'|'identity_review')[];
 maxJobsPerPlan:number;                                                  // ≤ 20
 allowSourceReads:boolean;maxSourceReads:number;                         // default false / 0; hard cap 5 (Phase182)
 rerunCooldownDays:number;                                               // skip jobs with a recent terminal receipt
}
planResearchFromNeeds257(args:{needs:ResearchNeeds254;categoryId:string;categoryLabel:string;policy:ResearchPolicy257;
 asOf:string;journal?:ResearchJournal182}):ResearchPlan182          // pure: no IO, no store write
executeUnderPolicy257(args:{plan:ResearchPlan182;policy:ResearchPolicy257;operatorSources;sourcePolicies;
 workers;transport?}):Promise<ResearchRun182>                       // re-check, then executeResearchGaps182
loadResearchPolicy257(path:string):ResearchPolicy257                 // strict validation; refuses Git work trees
```

**How the plan records its basis:**

- `policyRevision` is `policyId@revision`;
- `knowledgeRevision` is the store snapshot SHA-256;
- `inputFingerprint` is the SHA-256 of the needs used;
- `planningOnly`, `rankingAuthorized:false` and `hardExclusionsAuthorized:false` are unchanged.

## 6. Permission boundaries

| Boundary | Default | Granted by | Never granted by |
|---|---|---|---|
| A. Planning | allowed only for categories and need kinds in the policy | operator policy file | user text, web pages, research results, plan contents |
| B. Source read | denied (`allowSourceReads:false`, `maxSourceReads:0`) | policy **and** `WebSourcePolicy` rights, robots and terms **and** an operator transport | a plan, a hash, a user request |
| C. Admission | outside research entirely | the existing ingest and retention path, after review | any research run (`canonicalKnowledgeUpdated:false`) |
| D. Ranking | denied | Phase180/181 signed release only | research policy, plans, runs |

## 7. Correct research-task semantics

Today Phase254 maps both "missing specification declaration" and "declaration conflict" to `missing_test`.
`executeResearchGaps182` then runs it as "Independent empirical research". That is scientifically wrong: it would
turn a spec lookup into a lab-test request.

The fix extends the existing `ResearchGap181` union instead of adding a parallel ontology:

| Need (Phase254) | Gap kind | Phase182 job | Execution question |
|---|---|---|---|
| missing specification declaration | **`missing_declaration`** (new) | `exact_variant_source_research` | maker or retailer declaration of the criterion for the exact product |
| conflicting declarations | **`declaration_conflict`** (new) | `exact_variant_source_research` | which source declaration belongs to which variant |
| missing independent measurement | `missing_test` (unchanged) | `exact_variant_source_research` | independent original test (unchanged wording) |
| identity review | `need_review` | `independent_review` | unchanged |
| new product or category discovery | `missing_product` / `new_category` | unchanged | unchanged |
| source reinspection, reextraction | not Phase182 jobs | — | internal; later executor |
| user clarification | not research | — | asked of the user |

**Compatibility:**

- existing `missing_test` job ids are unchanged;
- the two new kinds get their own priorities and job ids;
- `executeResearchGaps182` chooses the question wording from `gapKind`;
- the journal's status list is unchanged.

## 8. Smallest Phase257 implementation

1. **Semantics:** add the two gap kinds, their mapping and the question wording; update the Phase254 mapping.
2. **Policy:** `loadResearchPolicy257` with strict validation, plus `planResearchFromNeeds257` (pure).
3. **Execution:** `executeUnderPolicy257`, a thin re-check around the unchanged `executeResearchGaps182`.
4. **Tests:** threat-case tests (§9); no live reads; transport injected as a stub.

Expected size: one module (about 150 lines), small edits to Phase181 types and Phase182/254, and one test file.

## 9. Threat cases and the control that stops each

| Threat | Rejected by |
|---|---|
| A user request says "you may crawl example.com" | Needs carry only ids and criteria; the policy and `WebSourcePolicy` come from protected configuration; text never becomes a source. |
| A forged `DynamicDecision181` | Not used on this path. `planResearchGaps182` is unchanged and still the only Phase181 consumer. |
| A plan edited after creation | `executeResearchGaps182` recomputes `planHash` and the job ids (an accident or a naive edit). A deliberate edit with a recomputed hash is still bounded: `executeUnderPolicy257` re-checks category, kinds, job count and `policyRevision` against the current policy, and the caps come from the policy. |
| A category outside the policy | Planning and execution both refuse (`phase257_category_not_in_policy`). |
| Excessive or repeated tasks | `maxJobsPerPlan` (≤ 20) plus the Phase254 budget; reads capped by `maxSourceReads` (≤ 5); the journal cooldown skips jobs with recent terminal receipts; `appendResearchRun182` rejects duplicate and stale runs. |
| A prohibited source URL | `planWebEvidenceAcquisition` and `readApprovedSource`: rights basis, robots, terms, freshness and redirects; never bypassed. |
| A plan trying to admit evidence or rank | `ResearchPlan182` and `ResearchRun182` have fixed literal flags (`rankingAuthorized:false`, `canonicalKnowledgeUpdated:false`); admission exists only in the ingest path; ranking only in Phase180/181. |
| A spec research task turned into lab testing | `missing_declaration` versus `missing_test` gap kinds and distinct question wording (§7), with a test. |
| Policy expired, or revoked by a revision bump | Both entry points refuse; old plans become unexecutable. |
| The policy file placed in the public repository | `loadResearchPolicy257` refuses paths inside a Git work tree. |
| **Legitimate:** air fryer missing-declaration needs, policy allows `air_fryers` and `missing_declaration`, reads disabled | A plan is produced (pure). Execution yields `no_curated_sources` or `source_policy_blocked` outcomes and a journal receipt: no network, no store change. |

**Rollback:**

- delete or expire the policy, and every plan is refused;
- revert the Phase257 commit;
- nothing persistent changes except optional private journal files.

## 10. Open owner decisions

1. **Policy location:** private `pee-knowledge` repository, or a local file named by `$PEE_RESEARCH_POLICY`.
   Recommendation: a local file, with a copy kept in `pee-knowledge`.
2. **The first policy's content.** Recommendation:
   - categories `air_fryers`, `coffee_machines`, `kettles`, `toasters`, `blenders`;
   - kinds `missing_declaration` and `conflicting_declarations`;
   - `allowSourceReads:false`;
   - expiry in 30 days.
3. **Whether Phase257 should also enable real reads.** Recommendation: not yet. That needs curated sources with
   cleared `WebSourcePolicy` entries, which is a separate decision.

## Data flow

```
 user request ─► adviseFromRequest253 ─► Advice253.researchInputs (ids, codes)
                                              │
                                              ▼
                          collectResearchNeeds254 (pure, read-only store)
                                              │  research needs only
   protected policy file ──► loadResearchPolicy257
   ($PEE_RESEARCH_POLICY,       │
    not in Git, not user input) ▼
                          planResearchFromNeeds257 (pure)   [A: planning]
                                              │ ResearchPlan182 (+policyRevision)
                                              ▼
                          executeUnderPolicy257 ─► executeResearchGaps182   [B: execution]
                            re-check vs current      │  operatorSources, WebSourcePolicy,
                            policy; caps from        │  robots/rights, ≤5 reads, quarantine
                            policy                   ▼
                                       ResearchRun182 ─► appendResearchRun182 (audit chain)
                                              │  digests and statuses only
                                              ▼
                    [C: admission] existing ingest path, separately reviewed (not automatic)
                    [D: ranking]   Phase180/181 signed release only (untouched)
```
