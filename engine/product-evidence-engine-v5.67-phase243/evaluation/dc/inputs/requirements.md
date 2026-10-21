# Requirements for an independent scientific universe for PEE (design input, structure-neutral)

PEE is an independent product research and buying adviser (English first). Its scientific core must become a
cumulative scientific-learning system: knowledge about what determines performance and what establishes a result;
research methodology (how to investigate an unfamiliar category); and operational experience (successful and failed
readings, ambiguities, corrections, counterexamples). The intended cycle: scientific learning → better research →
better extraction → better evaluation → new experiences → improved knowledge. Uncertainty is a research problem:
ambiguous findings are kept provisionally with their open question, investigated when worth it, never promoted without
support. Lessons stay hypotheses until held-out evidence supports them. Every requirement below is a capability or an
invariant; none prescribes a data structure. "MUST" requirements are acceptance criteria for the design.

## Constraints
- C1 Claude is the sole developer; no external AI services, no paid services, no heavy dependencies (a small local
  embedding model on CPU and a small SQLite store already exist and may be used if fit). Node.js/TypeScript codebase.
- C2 Private data stays private (owner research packages, retained third-party facts); public outputs are counts.
- C3 Rights: never bypass robots, 403/429 or access controls; a public URL is not storage permission; keep only what
  the retention policy permits; third-party full texts are not stored.
- C4 The core is an isolated experimental engine, integrable later or abandoned; no second permanent architecture.

## K — Knowledge that must be representable (with its qualifications)
- K1 Needs and goals, general and contextual (a general need qualified by circumstances is distinct from it); opposite
  needs on the same quality dimension (less noise vs more sound; drier vs more humid air) are distinct.
- K2 Situations a user reports: symptoms (observable), problems, use situations, constraints of the home.
- K3 Phenomena, causes and mechanisms (physical states, processes, principles), with causal direction and
  possibility vs established causation; "indicates" (diagnostic evidence) is distinct from "produces" (causation).
- K4 Strategies and interventions: behavioural, building/installation, maintenance, use changes, services, purchases;
  primary remedy vs adjunct; "X is not a substitute for Y".
- K5 Functions/capabilities of artefacts, components and their role; presence of a component is not performance.
- K6 Categories, subtypes, products, variants, units tested; exact identity (never merged on similar names);
  capabilities held by all, most or some members.
- K7 Measurable properties (quantities with units, kinds, metrics, value basis such as per run / per period, object
  of interest, plausible ranges) and judged qualities (subjective/qualitative judgements, linked to the quantity they
  concern where one exists); conditions that define or influence a value; test methods with fixed conditions,
  sample design (replicates, blinding), protocol version and date.
- K8 Observations: measured results, qualitative observations, declarations, calculations, synthetic/illustrative
  values, each about the right subject (a tested unit, a product, a variant, a category typical range), with the
  conditions of measurement.
- K9 Requirements and thresholds (a strategy needs several capabilities jointly or alternatively, each possibly at a
  level), contraindications with force (essential incompatibility / modifiable condition / non-essential
  disadvantage), applicability conditions with conjunction and disjunction.
- K10 Comparisons (A vs B on a property under conditions), rankings stated by a source, "the main determinant of X is
  Y, not Z", upper bounds, thresholds whose value is unknown.
- K11 Negation of every kind: denied relations, denied sufficiency/necessity, "not always" vs "never", hedges
  ("usually", "plausibly", "may").
- K12 Absent knowledge as a first-class object: what is unknown, unmeasured, unverified, contested; a typed research need.
- K13 Methodological knowledge: how to investigate a category, which evidence establishes a claim, admissibility
  rules, questions to ask a user, abstention duties, curriculum of what to learn — kept distinct from world knowledge
  and promoted separately when it becomes an executable rule.
- K14 Lexicon: surface expressions of the same meaning (aliases) vs terms that only evoke a concept (cues) vs pole
  terms of a dimension; each with its status (supported / candidate) and provenance.

## E — Epistemics, evidence and provenance (MUST hold for every piece of knowledge, including definitions, aliases,
observations and the existence of concepts, not only for relations)
- E1 Separate, unordered dimensions: nature of the claim (definition, convention, physical principle, mechanism
  explanation, calculation, measured result, qualitative observation, expert guidance, regulation, statistical
  association, hypothesis, user report, declaration), strength and independence of evidence, specificity (general …
  unit tested), applicability (conditions, transferability), review state. No single strength scale.
- E2 A source that reports another source (a research package citing a study, a review citing a test) is distinct
  from the cited source; independence and role are judged on the original; every claim keeps the source's own status
  label verbatim (e.g. PROPOSED_NOT_TESTED, synthetic).
- E3 Evidence types are never promoted into one another (manufacturer declaration, retailer listing, reviewer claim,
  editorial, independent original test, regulatory notice, method reference, assistant hypothesis); a declaration is
  never an independent test; missing evidence is not evidence of poor performance.
- E4 Every conclusion is traceable to its premises, rules and sources; conclusions never state more than their weakest
  relevant support in each dimension; demonstrated efficacy requires a measured result about that artefact under
  comparable conditions; a principle or a result about another artefact or condition never demonstrates.
- E5 Rights and retention class are recorded with every source and passage.

## R — Reasoning (admissible and forbidden)
- R1 Need-first (situation → causes → strategies → capabilities → artefacts → evidence) and category-first (artefact →
  capabilities → strategies → needs served, contraindications, deciding properties) over the SAME knowledge; validity is
  not symmetric: providing one necessary capability is not serving a need.
- R2 Necessity vs sufficiency, joint and alternative requirements, levels; no vacuous satisfaction (a strategy with no
  documented requirement is not "realised" by an artefact).
- R3 Relevance of a strategy needs an evidence profile: an anecdote, a hypothesis or a "may" never makes a remedy;
  "not a substitute for" makes a purchase an adjunct; a documented primary no-purchase remedy is preferred.
- R4 Diagnosis: possible causes from symptoms; discriminating tests stated by sources confirm one cause and rule out
  others; association never confirms causation.
- R5 Opposites: a strategy whose effect opposes a requested need is excluded; this propagates to artefacts.
- R6 Contradictions: conflicting claims or observations under overlapping conditions withhold the conclusion and are
  reported, never resolved by picking one or averaging.
- R7 Transfer limits: a measurement does not transfer across non-comparable conditions, models, variants or load; a
  category tendency does not establish a product's performance; a product result does not establish the category.
- R8 Negation and stance in requests: negated or rejected items are exclusions; owned objects are context; a named
  product is the user's choice and is checked, not replaced.
- R9 Questions only when two justified alternatives differ by a fact only the user knows; missing knowledge yields a
  typed research need, never a question or an invented answer.
- R10 Non-monotonicity: defaults with exceptions; later or more specific evidence can withdraw a conclusion.
- R11 Meta-level principles must be stateable and enforced: "correlation does not establish causation", "a result does
  not transfer without justification", "a hypothesis never yields more than a hypothesised conclusion", rules about
  which evidence establishes which claim types, reliability of sources and of rules themselves.
- R12 Uncertainty: graded where evidence supports grading (e.g. measurement uncertainty, ranges, number of independent
  sources), qualitative where it does not; never fabricated precision.

## A — Acquisition and learning
- A1 Read original documents (tables, prose, structured data) and extract qualified knowledge with provenance down to
  the passage; every extracted item enters QUARANTINE (proposed, not used for decisions) until validated.
- A2 Recognise concepts already in the universe (entity resolution with explicit undecided states), add new ones
  without duplicating; never merge distinct meanings.
- A3 Detect conflicts with existing knowledge and keep both sides with their evidence; never silently overwrite.
- A4 Judge whether a source is sufficient to establish a claim (and say what is missing).
- A5 Revision over time: supersession, retraction, versioned knowledge, re-derivation when rules or definitions change;
  what was believed when is recoverable.
- A6 Learn methodology from experience (successful and failed investigations, counterexamples) as hypotheses with
  provenance, promoted only on held-out support; rules have a lifecycle (proposed, under review, active, superseded,
  retired).
- A7 Learn a never-studied category: derive what must be learned (functions, mechanisms, contraindications, deciding
  properties, test methods) from the general knowledge; research needs are typed; acquisition respects authorisation.

## T — Transfer
- T1 A principle or mechanism learned in one domain is recognised as applicable in another when the other domain's
  artefact is documented to work by it, with conditions and limits carried over; never by name similarity.
- T2 Transfer must work on domains and knowledge not used during development.

## V — Semantic and vector layer
- V1 Vectors recognise meaning (paraphrases, user wording) and retrieve candidates; similarity is never a relation, a
  cause, an identity merge or a decision.
- V2 Units of meaning are typed (what is embedded, at what granularity); requests are decomposed into typed slots;
  negation and owned objects are not used as positive query content.
- V3 Abstention: out-of-knowledge requests are detected without absolute similarity thresholds alone; dense topics must
  not outvote sparse ones.
- V4 New knowledge becomes retrievable incrementally; indexes are derived views of the canonical knowledge.

## X — Governance, verification, integration
- X1 Everything is journaled and reproducible; first runs are kept unchanged; evaluation material sealed before use;
  development material is never reported as held-out.
- X2 The design must be verifiable by four gates: representation, reasoning, acquisition, transfer.
- X3 Integration path into PEE (or abandonment) with explicit criteria; the legacy system is a source of requirements
  and negative cases, not a template.

## Adversarial cases any design must pass (abstract patterns from earlier experiments)
1. Purifier shares "moves air through a filter" with dehumidification but cannot remove water vapour: not a dehumidifier.
2. Purchase strategy with no documented requirement must not be "realised" by any artefact (it was: "buy a new
   dishwasher" when the source prescribes salt and rinse aid).
3. A user anecdote ("since I bought X my allergy is gone") must not make a remedy relevant; the source says X is not a
   substitute for the primary no-purchase remedy.
4. Category-first: an artefact that meets a requirement only at an unverified level must not be said to serve the need.
5. Two independent tests of the same model contradict with no separating condition: report conflict; do not average.
6. Peak brightness measured in one picture mode; user uses another: unknown, not pass/fail.
7. 55-inch variant measured; 77-inch variant with different panel asked: no transfer.
8. Carbon adsorption principle + "contains carbon" do not show a product removes odours; only the standard test does.
9. White film: three possible causes; user's vinegar test result confirms limescale per the source's discriminating
   test; remedy is maintenance, not purchase.
10. Damp patch growing after rain = penetrating damp per stated indicators; "a dehumidifier does not address
    penetrating damp".
11. Air too dry (25% RH): dehumidifiers oppose the need; no family covers humidification: report a gap.
12. "Quiet" in general vs quiet at night with enough clean air at the same setting (two requirements bound to one
    operating point; requirement derived from room volume).
13. Capability held by only some subtypes; unspecified model: not attributed.
14. Hypothesis and synthetic figure (PROPOSED_NOT_TESTED) tempting a firm energy-saving claim.
15. Operating limit below which a device must not run (essential), a drain condition the user can arrange
    (modifiable), higher running cost (non-essential).
16. A package relays a study's result: provenance must reach the study; independence judged on the study.
17. A single tested unit's result must not be stored as the category's result.
18. A synthetic scenario value must never read back as a measured result.
19. Term "bagels" evokes a capacity concept for toasters but is not a synonym; "whisper-quiet" is a pole term.
20. A property's value per run vs per year; a condition that defines the value only for one basis.
21. "Required to verify X before concluding Y" (necessary evidence) vs "X informs Y".
22. "Not always" vs "never" under negation of a modal claim.
23. "Correlation does not establish causation" applied to a statistical association between low humidity and sore throat.
24. Methodological rule "abstain when the input needed for a comparison is missing" kept as methodology, executable once
    promoted, not as a fact about the world.
25. A new category whose product works by a mechanism already known in another category: reuse with its limits.
