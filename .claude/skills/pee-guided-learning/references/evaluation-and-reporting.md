# Evaluation and reporting protocol

This protocol is condensed from:

- Decision VIII §2B–G;
- Correction IX §B–D;
- research v9 Addenda III–V;
- practice already established in Phases 245–249.

The originals take precedence; see [research-navigation.md](research-navigation.md).

## Contents

1. First-failure chain
2. Evaluation tiers and independence labels
3. Gold and held-out discipline (as practised in PEE)
4. A/B/C pilot design
5. Gains and harms to report
6. Phase report checklist

## 1. First-failure chain

Find the earliest link that demonstrably breaks:

`request → category → need → technical requirement → source discovery/access → region/DOM → product/variant identity
→ scoped atomic claim → provenance/evidence grade → comparability → category relation → decision`

For each failure, record:

- the concrete example;
- the earliest broken link;
- the cause, as one of four:
  - missing data;
  - misunderstood language;
  - wrong evidence type;
  - over-restrictive gate;
- whether that cause is a hypothesis or verified;
- a general repair, not a host-specific or phrase-specific patch;
- counterexamples;
- regressions.

## 2. Evaluation tiers and independence labels

| Tier | What it is | What it may support |
|---|---|---|
| T1 developer diagnostic | Synthetic or constructed fixtures, contrast pairs, mutation tests | Mechanics and bug repair only |
| T2 unseen real inputs | Real pages or requests, gold sealed before a frozen run. State whether Claude selected or annotated them: then it is **not author-independent** | Generalisation evidence, qualified |
| T3 pre-existing outside truth | Published human labels, original lab measurements, certification outputs. Provenance, licence, domain fit and leakage are checked | A more independent reference |
| T4 separate blind adjudication | Independent human or other reviewer | **Deferred.** Never simulated. Never a gate on T1–T3 work |

There are four meanings of "independent". Never let one stand in for another (Correction IX §B):

- independent source;
- independent example;
- unseen or frozen;
- independently adjudicated.

## 3. Gold and held-out discipline (as practised in PEE)

- **Before the run.** Commit gold and a frozen code version before the first run. Use a Git worktree at the frozen
  commit; evaluators resolve modules relative to their own path.
- **After the run.** Commit first-run results unchanged, in their own files. Development reruns go to separate files.
- **Spent sets.** Once a set informs a code change it is **spent**, a development set. Record that in the report.
- **Third-party values in gold.** Gold holds sampled facts only. Raw pages and full value lists for adjudication go to
  `$PEE_PRIVATE_EVAL_DIR`. Publish URL and SHA-256 manifests.
- **Real requests.** Use real requests only under a compatible licence, with per-case attribution (for example, the
  Stack Exchange CC BY-SA notice).
- **Synthetic cases.** Label them as synthetic. They test function, not real-world generalisation.

## 4. A/B/C pilot design

Use this design when the method choice is genuinely open:

- **A:** existing behaviour.
- **B:** fixed, expert-guided lesson, rule or policy.
- **C:** adaptive, gap-directed lesson.

All three arms get the same budget: requests, time and data. Pre-register the metrics. The simpler arm may win. Keep
only what the evidence supports.

## 5. Gains and harms to report

Always give denominators. Report each of these:

- correct information recovered, with sampled recall and precision;
- identity errors and wrong attributions; these must stay at 0 or be explained;
- new false positives;
- missed conditional scope;
- unnecessary abstentions;
- unsafe rankings;
- need recall and need precision;
- whether the decision is correct;
- cost, in requests, runtime and storage;
- transfer to unseen categories.

**Keep capability claims separate.** What Claude can do as developer is not what PEE's deployed runtime does.

## 6. Phase report checklist

`docs/phaseNNN/PHASENNN-TECHNICAL-REPORT.md` should cover the following:

1. The starting HEAD and the latest completed phase it builds on.
2. Each problem and its consequence for a real buying decision.
3. The research consulted, with direct URLs and the sections of `research-v9-full.md` read.
4. Each intervention and its rationale, including restrictions changed: rule, risk, measured effect and verdict.
5. Results: tier, first run versus development, numbers with denominators, and regressions.
6. Rights, access and compliance notes, including lapses, recorded honestly.
7. What is unresolved and why. Name the owner decisions needed.
8. Tests: full-suite count and new test files.
9. Rollback path and the next highest-value task.
10. For any change to interpretation or learning: the lesson-admission fields, the group-split (out-of-distribution)
    evidence with deduplication, the complexity account and per-field coverage, precision and abstention. See
    [generalization-method.md](generalization-method.md) Part B.

After the report, update `current-state.md` in this skill when a phase changes the baseline: date, HEAD, numbers,
open problems and new modules. Add a row to `decisions-and-supersessions.md` when an owner decision or verified fact
overtakes an earlier one.
