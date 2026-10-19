# Owner direction: PEE engineering priorities after S77 (2026-10-19), verbatim

Received after §14 of `docs/plans/r3-knowledge-translation.md`. Decision S78 in `decisions-and-supersessions.md`.

PEE — Engineering Priorities After S77

Continue R3 with the following priorities. Use your engineering judgement and existing skills. This is one consolidated direction, not a request for isolated patches.

1. Suspend LLM/NLI experiments. Preserve the findings and reproducibility tools. Do not train, download or benchmark further models for now. Continue fine-tuning PEE's own algorithms.
2. Correct scientifically unsafe ranking logic. Audit outcomeAuthorised270 and related consumers. A measured_by relationship must not automatically establish an outcome. Require positive evidence of sufficiency. Check experimental conditions per measurement, not pooled across unrelated measurements. Validate changes in shadow mode before altering production decisions.
3. Review inherited algorithms critically. Do not assume existing code, thresholds, heuristics, knowledge structures or tests are correct merely because they were developed in earlier phases. Identify demonstrably defective or obsolete logic and determine whether it should be corrected, extended or replaced.
4. Strengthen scientific knowledge representation. Address the inability to preserve applicability, experimental conditions, uncertainty, negation, causal relationships, expert judgements, compound procedures and conflicting evidence. Integrate improvements into the existing architecture rather than creating a parallel system.
5. Improve document reading and extraction. Focus on faithful recovery of meaningful quantitative and qualitative information, including tables, compound statements, methods, context and source attribution. Measure both coverage and distortion, not coverage alone.
6. Improve evidence classification and product attribution. Distinguish manufacturer declarations, reviewer measurements, estimates and unknown evidence roles. Verify that observations belong to the correct product, variant, experiment and conditions.
7. Review concept identification without obsessing over it. Maintain the distinction between identity, hierarchy, relatedness and unknown. Do not promote lexical or statistical similarity into scientific equivalence. Address this alongside other bottlenecks, not as the sole objective of R3.
8. Make acquired knowledge operational. Trace genuine scientific statements from their original documents through storage and retrieval to reading, inference and decisions. Identify where valid knowledge is ignored, lost or misinterpreted. Demonstrate useful changes in behaviour, not merely additional stored statements.
9. Improve the evaluation infrastructure. Independently check scorers, baselines, reference construction, version selection, legacy paths and regression tests. Use representative new cases when available. Never present tuned or previously examined references as independent validation.
10. Fine-tune through evidence, not endless experimentation. Prioritise high-impact defects, use focused diagnostic experiments, and measure precision, recall, coverage, harmful conclusions, abstentions and downstream effects. Avoid category-specific patches and repeated marginal variations targeting the same failed metric.
11. Preserve existing capabilities. Compare before and after on real scientific workflows. Do not sacrifice correct results for higher headline metrics. Preserve provenance, deterministic decisions, existing safeguards and reproducibility.
12. Report engineering progress transparently. Distinguish verified bugs, architectural limitations, implemented corrections, observed improvements and unresolved hypotheses. Tests passing are necessary but do not establish scientific correctness.

Operating principles

* You have autonomy over architecture, implementation, experiments and priorities.
* Do not seek owner approval for routine, safe engineering improvements.
* Keep unsupported or newly enabled rankings out of production until their scientific basis is validated and authorisation is explicit.
* No unnecessary new dependencies, external acquisitions or reconstruction of existing documents.
* Stop approaches with no meaningful benefit rather than repeatedly optimising them.
* Concentrate on transferable capabilities across product categories.

Primary objective: Make PEE demonstrably better at acquiring, understanding, evaluating and reusing scientific evidence to support correct product decisions.

The goal is not more code, more tests or improved performance on a single benchmark. It is a scientifically reliable software system moving toward a usable MVP.
