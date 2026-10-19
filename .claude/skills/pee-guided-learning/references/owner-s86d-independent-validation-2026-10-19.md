# Owner brief S86d: independent validation, scientific generalisation and architectural learning (2026-10-19), verbatim

Received in session `session_01KSRrjegucVNMZGsTKfhd3B` after the S86c report. Decision S86d in `decisions-and-supersessions.md`;
work in `engine/product-evidence-engine-v5.67-phase243/docs/plans/s86d-independent-validation.md`.

---

PEE — S86d: Independent Validation, Scientific Generalisation and Architectural Learning

Owner objective

S86c demonstrated a substantial improvement in knowledge-guided extraction on previously examined pages. The next objective is to establish whether that improvement generalises to unfamiliar documents, understand its remaining limitations, and identify the most scientifically justified route towards reliable operational use.

This is not merely a benchmark exercise.

PEE is being developed as an independent scientific evidence engine that progressively improves its ability to research, read, interpret, attribute, evaluate and learn from product evidence across unfamiliar categories.

The owner expects scientific initiative, architectural judgment and critical reasoning, not mechanical execution of a prescribed technical solution.

Starting point

Continue from S86c, preserving all previous decisions, architectural knowledge, evidence policies and the R1–R7 roadmap. R3 remains open.

Reuse existing code, research material, evaluation infrastructure, knowledge stores and reports. No attachments are required.

The S86c baseline, including its limitations and unsuccessful first runs, remains part of the historical evidence.

1. Determine the most informative independent experiment

Design a rigorous, resource-efficient evaluation on genuinely unseen professional-test documents.

The previously proposed sample of 15–20 pages from at least four publishers is a reasonable starting point, not an inflexible methodological requirement.

You may improve the sampling strategy, number of pages, category distribution, source diversity and experimental design if there is a clear scientific reason.

Prioritise representative variation, including document layouts, prose, tables, multiple products, measurements, test conditions, manufacturer declarations and qualitative expert evidence where relevant.

Avoid cherry-picking and data leakage.

Freeze the candidate implementation and evaluation criteria before the first independent run. Preserve the first results unchanged.

An annotation produced by another Claude agent can be blind to the implementation without being independent human validation. State this distinction accurately.

2. Compare existing capabilities without restricting your scientific judgment

Evaluate the operational S86 reader against the frozen S86c knowledge-guided reader.

Use S86b’s uncontrolled knowledge-guided configuration or other baselines when they provide meaningful diagnostic evidence.

Measure the entire extraction process, not merely the number of recognised quantities:

* Relevant evidence genuinely present.
* Candidates discovered.
* Correct scientific interpretation.
* Correct distinction between measurements, declarations, settings, methods and other evidential roles.
* Product and variant attribution.
* Correctly unresolved observations.
* Evidence correctly admitted and actually persisted.
* Duplicates, false positives, false negatives and unjustified exclusions.

Evaluate per document, publisher and category as well as overall.

Retain the pre-registered S86c criteria as reference targets: substantial recovery improvement, minimal false evidence, minimal wrong-product attribution and preservation of correct legacy capabilities.

Interpret those targets with appropriate denominators, uncertainty and scientific judgment rather than treating an arbitrary threshold as proof of general capability.

3. Investigate unexpected findings

If the experiment reveals an unanticipated problem, investigate its cause.

Do not assume that the current algorithms, vocabulary, document representation, scientific knowledge or ranking safeguards are already optimal.

Distinguish:

1. Knowledge available but not consulted.
2. Correct mechanisms prevented from operating by incompatible representations or excessive restrictions.
3. Existing capabilities that need to be combined or generalised.
4. Genuinely missing reasoning capabilities requiring new development.

You are encouraged to challenge earlier engineering assumptions when the evidence contradicts them.

Prefer reusable improvements that benefit multiple categories and multiple stages of PEE over additional product-specific recognisers.

Preserve the mandatory four-set capability comparison: only old, only new, both and neither. A previously correct capability must not silently disappear.

4. Scientific autonomy and experimental iteration

You have autonomy to select appropriate diagnostic methods, conduct bounded ablations, investigate alternatives and propose or prototype a better general mechanism if the evidence justifies doing so.

Do not interpret the S86c architecture as an untouchable final design.

However, separate clearly:

* The frozen first-run evaluation.
* Subsequent error analysis.
* Development changes made after examining results.
* Any additional validation on genuinely fresh material.

A system modified after inspecting the test material has been developed on that material; its later performance on the same pages is not independent validation.

Do not repeatedly tune to a single dataset and claim generalisation.

Make practical decisions about experimental scope and computational cost. Reuse existing tools and mechanisms before introducing new dependencies.

Avoid unnecessary paid services, expensive model experiments, duplicated modules and parallel architectures.

5. Preserve scientific and operational safeguards

Maintain original evidence attribution, uncertainty, lawful retention, robots compliance, access restrictions and ranking safeguards.

Live acquisition is permitted only within an existing, active owner policy that explicitly authorises the relevant requests and satisfies the S85 enforcement gate.

Do not create, extend or bypass such authorisation yourself.

If no suitable policy is available, complete the useful offline preparation and analysis, identify exactly what blocks the independent evaluation, and do not make unauthorised requests.

Do not enable a new production extraction path or change public ranking authorisations on the strength of development results.

Diagnostic experiments and reversible shadow implementations are permitted within the agreed resource and safety boundaries.

6. Evaluate the broader consequences for PEE

Consider what the results teach us about the general architecture.

Can scientific knowledge reliably improve discovery, not just classification?

Can qualitative and quantitative evidence be processed through shared scientific representations without losing their distinctive meanings?

Are observations currently lost because readers fail to find them, because attribution fails, or because valid results are excluded downstream?

Could the findings inform the existing candidate-learning pathway planned for S87?

Look for general mechanisms whose benefits can propagate between request understanding, research planning, document reading, interpretation and evidence evaluation.

Do not implement an unrelated, project-wide refactor. Report broader opportunities with evidence and priorities.

7. Deliverable and decision boundary

Produce an English, evidence-backed report covering:

* What was tested and how.
* The frozen first-run results.
* Scientific interpretation of success and failure.
* Regressions and preserved capabilities.
* Unexpected findings and their causes.
* Any justified experimental improvements, separately labelled.
* Independent-validation limitations.
* Architectural implications.
* The recommended next bounded implementation or experiment.

Report complexity, resource consumption and real functional benefits where measurable.

Explain whether the evidence supports considering S86c for operational admission, further generalisation work, or a different approach.

Stop before production activation or a new major development phase. The owner will decide after reviewing your findings.

The objective is not to make a chosen algorithm pass a benchmark. It is to determine, as rigorously and efficiently as possible, how PEE can become better at discovering and understanding original scientific evidence on documents it has never encountered before.
