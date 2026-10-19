# Owner decision S87a: scientific architecture review and internal research freedom (2026-10-19), verbatim

Received in session `session_01KSRrjegucVNMZGsTKfhd3B` after the S86d report: two complementary briefs ("PEE — Scientific
Architecture Review and Generalisation of Knowledge into Operational Intelligence" and "PEE — Owner Decision: Internal Research
Freedom, Knowledge Database and General Scientific Intelligence"), introduced by the owner in Italian. Decision S87a in
`decisions-and-supersessions.md`; work in `engine/product-evidence-engine-v5.67-phase243/docs/plans/s87a-generalisation-and-research-freedom.md`.

---

Il secondo prompt non sostituisce il primo: lo completa. Ho sbagliato a presentarlo come sostitutivo.
I due incarichi affrontano aspetti diversi ma complementari dello stesso problema:
Primo prompt — Intelligenza scientifica e architettura: studiare le tecniche utilizzate dagli esperti di intelligenza artificiale, esaminare algoritmi, vocabolari, traduzioni e regole di PEE, individuare la logica generale mancante e svilupparla.
Secondo prompt — Libertà di ricerca e database interno: eliminare le limitazioni sperimentali arbitrarie, ampliare la ricerca, permettere la raccolta e il riutilizzo delle informazioni consentite e costruire un database scientifico molto più ricco.
Insieme definiscono l'obiettivo completo: dare a PEE sia la capacità di acquisire conoscenza su larga scala, sia l'intelligenza necessaria per interpretarla, verificarla e utilizzarla.

PEE — Scientific Architecture Review and Generalisation of Knowledge into Operational Intelligence

Owner decision

S86d has revealed a recurring architectural failure: PEE acquires scientific knowledge and increasingly discovers evidence, but this knowledge does not consistently improve the entire operational pipeline.

The owner now requests a research-led engineering intervention addressing the underlying generalisation problem, not another collection of local patches.

You are authorised to investigate the architecture broadly, challenge previous design decisions, research established techniques and develop and test general solutions where justified.

Scientific rigour must remain strict. Engineering exploration should be substantially more autonomous.

Core problem

Explain why PEE repeatedly develops a useful capability in one subsystem but fails to propagate it to other subsystems.

The S86d example is concrete: 84 extracted observations in a development-store copy, but only one passes the existing Phase268 validation policy.

Do not assume that the answer is simply to relax Phase268, add protocols, extend a word list, or connect another existing function.

Determine whether the architecture lacks a genuinely general mechanism for representing and applying scientific knowledge.

Trace the complete operational chain:

User intention → research planning → source discovery → acquisition → document understanding → evidence extraction → attribution → scientific validation → comparison → advice → learning.

Identify where correct knowledge or evidence loses meaning, becomes unreachable, is misinterpreted or is excluded without a scientifically justified reason.

Research established approaches before selecting an algorithm

Investigate relevant primary research and established methods in information retrieval, information extraction, document-level reasoning, entity linking, knowledge representation, weak supervision, evidence verification, provenance and uncertainty.

Useful starting points include DocRED, KILT, Stanford’s Snorkel research and W3C provenance standards. Explore additional credible techniques where appropriate.

Distinguish empirically supported methods from plausible but unverified ideas.

Do not mechanically import another system’s architecture. Determine which principles are applicable to PEE, what existing components already implement them, and what is missing.

You may propose and experimentally develop a new general algorithm if the evidence demonstrates that existing mechanisms cannot provide the required capability.

New models or dependencies are not prohibited in principle, but justify their scientific benefits, licences, computational costs and alternatives. Preserve the previous negative results from S75–S77 unless a genuinely different task and evaluation justify reconsideration.

Audit the complete scientific vocabulary and reasoning chain

Examine how PEE creates, translates, stores and uses its existing scientific knowledge.

Investigate the original sources, machine-translated statements, category concepts, measurement definitions, unit vocabularies, aliases, condition axes, method relationships, evidence roles, inference rules and validation policies.

Pay particular attention to:

* Whether translations preserve negation, scope, quantities, conditions, uncertainty and scientific meaning.
* Whether several vocabularies represent the same concept inconsistently.
* Whether different components apply contradictory rules to the same evidence.
* Whether a method or relationship is truly supported or merely hypothesised.
* Whether scientifically valid observations are lost because a specialised rule does not recognise their category, publisher or presentation.
* Whether existing restrictions represent demonstrated safety requirements or historical limitations of earlier experiments.

The objective is not to flatten every distinction into one vocabulary. It is to develop reusable scientific meaning while preserving relevant context and provenance.

The required scientific distinction

A system must not confuse:

* Discovery with verification.
* A feature with a product.
* A setting with a measured outcome.
* A declared value with an independent test.
* A test method with evidence that the method was actually performed.
* Scientific comparability with general relevance.
* Missing information with evidence of failure.
* A valid measurement with evidence sufficient to satisfy a particular user need.

An expert’s structured qualitative observations must remain usable evidence under their appropriate role.

A publisher must not be rejected merely because it is absent from an old category-specific whitelist. Equally, being a publisher or claiming to have tested a product must not automatically authenticate a measurement.

Investigate general, evidence-based ways of assessing these distinctions.

Broader research and acquisition autonomy

PEE is intended to function as a specialised search and evidence-understanding engine. Its acquisition and research capabilities must not be artificially restricted by limitations inherited from small pilot experiments.

The owner withdraws the assumption that previous experimental limits, such as 40 requests, eight hosts or a fixed list of publishers, should become permanent architectural restrictions.

You may design a broader, adaptive research strategy covering appropriate publicly accessible and otherwise authorised sources, with source diversity and evidence yield determining search priorities.

Maintain compliance with applicable access rights, copyright and database rights, robots requirements, site stability, privacy and retention rules. Do not reuse expired permissions or bypass access controls.

Use the existing protected-policy mechanism for network operations. Establish an applicable policy reflecting this broader owner research objective rather than silently bypassing enforcement. If an external or legally necessary permission is missing, identify the specific restriction without blocking unrelated lawful research.

Research should be broad enough to learn and generalise, but resource-efficient, measurable and respectful of source systems.

Algorithmic and mathematical evaluation

Do not measure success by test counts, added vocabulary entries or the quantity of extracted numbers alone.

Evaluate the entire evidence pipeline, measuring the correct evidence available at each stage and the reasons evidence is lost.

Use appropriate formal metrics, including precision, recall, attribution accuracy, coverage, abstention, evidence sufficiency, duplication and end-to-end utility.

Account for clustering by publisher and document layout, statistical uncertainty, and contamination between development and validation sets.

Compare existing mechanisms with proposed unified mechanisms, retaining the four-set capability-preservation method.

Use ablation, counterexamples and genuinely unseen material wherever available.

Separate the first independent evaluation, subsequent development and any later independent confirmation.

Engineering freedom and expected result

You have substantial discretion to select the best research and engineering approach.

If the problem is a disconnected existing capability, reconnect it.

If existing mechanisms overlap, integrate the correct capabilities of all of them.

If the scientific vocabulary is incomplete or inconsistent, improve its general representation and test the result.

If there is a genuinely missing reasoning capability, design and prototype an appropriate reusable algorithm.

Prefer mechanisms that improve several parts of PEE simultaneously. Avoid new category-specific exceptions, competing knowledge systems or additional layers without demonstrated value.

Implement and test a bounded, reversible improvement when justified, not merely produce another architectural report.

Preserve the established R1–R7 roadmap, the knowledge store, provenance and consequential ranking safeguards. Experiment freely in shadow, but do not enable unvalidated production ranking decisions.

Delivery

Explain precisely:

1. The recurring architectural cause.
2. What established research suggests.
3. Which existing mechanisms and vocabularies should be retained, improved, consolidated or retired.
4. Whether new general reasoning is necessary and why.
5. What you actually implemented or prototyped.
6. What improved operationally and mathematically.
7. Which limitations remain and what independent evidence is needed.
8. How the solution contributes to future autonomous learning across PEE.

Distinguish verified results, development experiments and engineering hypotheses.

The owner expects independent scientific judgment, not compliance with a predetermined algorithm.

The central objective is a Product Evidence Engine that uses its acquired scientific knowledge to become demonstrably better at researching, reading, extracting, attributing, validating and understanding new evidence, across categories and publishers.

Stop before unvalidated production promotion or irreversible architectural changes. Do not expand into unrelated development merely to increase activity.

PEE — Owner Decision: Internal Research Freedom, Knowledge Database and General Scientific Intelligence

Fundamental clarification from the owner

PEE is currently an internal research and development project.

I am building my own scientific product-evidence database and research engine. I am not currently operating a public consumer service or reselling collected page content.

Previous instructions have repeatedly imposed experimental restrictions that obstructed research, reduced evidence coverage, caused unnecessary work and increased development costs.

I am withdrawing those self-imposed development restrictions.

The objective now is to build the strongest scientifically reliable internal research and learning system possible.

Do not carry forward arbitrary experimental limitations simply because they exist in earlier policies or code.

1. Remove unnecessary development restrictions

Audit the operational effects of the existing acquisition, retention, source-selection and validation restrictions.

Identify and remove or replace restrictions that originate solely from historical experiments, including:

* Fixed 40-request or similar research limits.
* Fixed numbers of hosts or pages.
* Requiring a separate owner decision for every routine research experiment.
* Publisher whitelists based on the first successful test.
* Permanent source exclusions caused by temporary access or parsing failures.
* Metadata-only retention imposed without a specific applicable reason.
* Category-specific rules that prevent otherwise legitimate evidence from being considered.
* Hard-coded experimental protocols that prevent general scientific assessment.

Do not simply disable safeguards indiscriminately.

Distinguish restrictions required by applicable external rights, access permissions, privacy or system stability from restrictions we created ourselves for experimental convenience.

Preserve the former where applicable. Remove the latter.

Implement a reusable internal research configuration through the existing mechanisms so PEE no longer depends on repeated one-off authorisations for ordinary permitted development research.

The owner authorises broad internal research within this scope. Use adaptive resource management rather than arbitrary numerical ceilings.

Do not bypass authentication, technical access restrictions or applicable external rights.

2. Build a useful internal research database

PEE must be capable of acquiring, preserving and reusing the information necessary to develop its scientific intelligence.

Investigate the existing database architecture and remove unjustified obstacles to retaining useful research information.

The internal knowledge system should support:

* Products, models, variants, features and components.
* Manufacturer specifications and declarations.
* Original independent tests and quantitative measurements.
* Structured qualitative expert observations.
* Experimental methods, instruments and operating conditions.
* Measurement uncertainty and scientific comparability.
* Evidence relationships, source identity and provenance.
* Contradictory results and unresolved evidence.
* Reusable scientific knowledge and its evolution.
* Research gaps and future learning opportunities.

Do not discard scientifically useful observations merely because the current ranking or validation system cannot yet use them.

Maintain their correct evidential status.

Use private storage for internal research material. Where retention of underlying source material is permitted, allow the material needed for reproducibility, verification and future reprocessing. Where it is not, preserve legally appropriate structured evidence and provenance instead.

Do not publish source copies or private research records in the public GitHub repository.

Prefer improving the existing database and knowledge architecture over creating another parallel store.

3. Solve the recurring algorithmic problem

S86d established that knowledge-guided extraction can recover much more information, yet downstream validation admits almost none of it because the validator relies on a narrowly hard-coded publisher protocol.

This is a recurring architectural problem, not merely a Phase268 bug.

Investigate why acquired knowledge fails to become operational intelligence across:

Research → discovery → reading → extraction → identity → scientific interpretation → validation → comparison → advice → learning.

Review the complete existing vocabularies, translations, scientific relations, inference rules, measurement definitions, condition representations and validation mechanisms.

Research established approaches in information retrieval, entity linking, document understanding, information extraction, knowledge representation and scientific evidence verification.

Use your independent engineering judgment to design an appropriate general algorithm, reusing and combining existing capabilities.

Do not assume another list of rules or another experimental module is sufficient.

4. Distinguish scientific evaluation from arbitrary rejection

A source absent from an old whitelist must not automatically be treated as scientifically invalid.

A valid observation must not disappear because no category-specific validation protocol was previously written.

Instead, establish what the evidence actually demonstrates:

* Who reported or measured it.
* Which product and variant it concerns.
* What was measured, observed or declared.
* Which method and conditions apply.
* Whether the information is original, quoted, derived or uncertain.
* Whether it can support a particular scientific comparison.

Knowledge already acquired by PEE should help determine the relevant methods and requirements.

It must not fabricate proof of a test, source independence or product identity.

Keep observations available under their justified status even when they cannot yet support ranking.

5. Engineering autonomy

You have freedom to investigate the complete system, challenge previous assumptions, conduct appropriate experiments and implement general improvements.

Do not artificially restrict your investigation to one historical phase.

Preserve correct existing capabilities when consolidating mechanisms.

Prefer durable, mathematically and scientifically justified approaches over category-specific patches.

Use resources efficiently. Avoid unnecessary paid services, repeated experiments with no additional information value and duplicated architectures.

Do not interrupt productive development with unnecessary requests for routine approval.

6. Measure actual improvement

Evaluate how much genuinely correct information PEE:

1. Discovers.
2. Reads and extracts.
3. Scientifically interprets.
4. Correctly attributes.
5. Preserves in its knowledge database.
6. Can validate for the intended evidential purpose.
7. Can reuse in subsequent research and learning.

Use precision, recall, coverage, attribution accuracy, abstention, provenance completeness and error analysis.

Distinguish implementation, development experiments and independent verification.

Do not mistake accepting more data for establishing more scientific facts.

Keep consequential production ranking safeguards separate from internal scientific research.

7. Development versus public deployment

The immediate objective is internal research, database construction and algorithm development.

Public deployment will have its own explicit operational review, including rights, retention, privacy, source access, infrastructure and publication requirements.

Do not prematurely impose public-product limitations on unrelated internal experiments.

At the same time, do not assume that internal use automatically overrides applicable legal rights or external access controls.

Required outcome

Implement and test meaningful general improvements where justified, not merely another report.

Explain:

* Which historical restrictions were unnecessary and how they were removed.
* Which external obligations actually remain and why.
* How the internal research database has become more useful.
* What general algorithmic problem was identified.
* Which existing scientific capabilities were consolidated.
* What operational improvements were measured.
* Which obstacles still prevent knowledge from being reused.
* What should be developed next.

Preserve the existing R1–R7 roadmap and the history of previous experiments.

The fundamental objective is to build a scientific intelligence engine that can research broadly, collect useful evidence, understand it, preserve it, learn from it and progressively improve its own capabilities across unfamiliar product categories.

Do not let restrictions created for earlier small experiments become permanent limitations of PEE.
