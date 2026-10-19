# Owner brief: independent engineering and scientific architecture audit (2026-10-19), verbatim

Received after §13 of `docs/plans/r3-knowledge-translation.md` (S76 closed). Decision S77 in
`decisions-and-supersessions.md`.

---

PEE — R3: Independent engineering and scientific architecture audit

S76 is closed. Before attributing the repeated semantic-alignment failures to model limitations, I want an evidence-based audit of the entire underlying system, including components inherited from earlier phases.

The central question is whether the algorithms, data representations, knowledge structures, integrations and evaluation methods that R3 relies on are actually correct and adequate for PEE’s current scientific objectives.

Do not assume existing components are valid merely because they pass their historical tests. Equally, do not assume that they are defective.

Investigate the complete operational chain, from original scientific documents through extraction, interpretation, concept representation, identity validation, knowledge storage and retrieval to the components that consume that knowledge.

In particular, establish whether:

* Legacy algorithms, rules, thresholds, filters or data structures impose outdated or scientifically unjustified assumptions.
* Current execution paths actually use the intended versions of the code, knowledge and configurations, rather than obsolete logic, stale data or unintended fallbacks.
* New algorithms are conceptually appropriate and correctly implemented, including their input construction, model-output interpretation, scoring and evaluation.
* Existing knowledge representations can faithfully express the scientific relationships, experimental conditions, qualitative evidence and limitations required by PEE.
* Scientifically correct knowledge is lost, distorted, incorrectly identified or simply never consulted.
* Historical tests and reference annotations genuinely validate the required behaviour, rather than merely confirming earlier implementation assumptions.

Use original-document evidence, independently reasoned scientific expectations, isolated component experiments, controlled bypasses or ablations, and end-to-end traces as appropriate. Distinguish bugs, architectural limitations, missing capabilities, evaluation defects and genuinely unsupported scientific inferences.

Preserve all existing findings, experimental provenance and the distinction between development evidence and genuinely untouched validation. Do not present same-model annotations as independent scientific verification.

You have full engineering autonomy to choose the audit method, inspect existing modules and implement general, justified corrections where the evidence supports them. Reuse what is genuinely sound; revise or replace what is demonstrably inadequate. Avoid speculative rewrites, category-specific patches, unnecessary dependencies and further expensive model experiments without a clear justification.

Keep rankings and production decisions protected. Do not acquire new external research material or require new owner attachments for this audit.

The outcome should identify which foundations are trustworthy, which are not yet validated, which actually constrain R3, and what measured improvements follow from any corrections.

Our objective is not to make a particular model succeed. It is to establish that PEE’s architecture can faithfully acquire, preserve, understand and operationally reuse scientific knowledge across categories.

Continue autonomously and report verified findings, unresolved uncertainties and the consequences for R3 and the future MVP.
