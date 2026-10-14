# PEE Phase179 — Autonomous category learning: engineering contract

2026-10-12 | Status: implemented research coordination prototype; scientific validation and live autonomous discovery not demonstrated.

## Product requirements

PEE is an English-first website for independent product exploration, not a mandatory chatbot. Decision-state snapshots from Phase177 remain the user-controlled source of requirements. The system must discover unfamiliar categories, identify user outcomes, alternative equipment families, engineering mechanisms, measurable performance and failure modes, professional protocols, exact variants and limits, then validate in source-disjoint real English requests. New discoveries do not automatically modify product rankings, vetoes or confirmed user criteria.

## Existing capabilities reused, not replaced

- Phases73/74 (`category_cognitive_mesh.ts`, `category_research_execution.ts`): capability/dependency planning, bounded local research worker execution, evidence intake with source gating; a missing worker is reported, not fabricated.
- Phase128/129 (`phase128_category_cognition_dialogue_bridge.ts`, `phase129_category_growth_cycle.ts`): category brain, exact-span observations, original source identity, quarantine, review, cache invalidation and cautious language projections; Phase179 delegates category concept staging to these modules.
- Phases172–174: goal and technical method proposals and bounded generalization cases; their lexical knowledge is not canonical evidence.
- Phases169–171: original professional-source identity, exact variant and protocol comparability, signed reconciliation. Phase179 does NOT bypass this pathway.
- Phase177/178: user-controlled website criteria, preserved original English input, editing, undo and explicit unknowns. The research ledger is not a second source of product truth.
- Source archives DeepKE, GLiNER2, Snorkel, medSpaCy, MAVE, OAMine, WDC, FastCoref, SGD-X remain method options subject to evidence, licenses and deployment reviews; no new inference weights or dependencies were imported.

## New executable interface

`src/phase179_category_learning.ts`:

1. `planCategoryLearning179`: any safe English category label, existing category route from Phase73, nine technical research streams. Allows known/unknown/ambiguous states; never presumes search or scientific validity.
2. `runCategoryInvestigation179`: dispatches existing local Phase129/74 research workers. If no worker is installed it returns a missing-worker outcome. No automatic commercial search API is claimed.
3. `stageNeedEvidence179`: accepts documents with original IDs, supplied source content hashes and extraction permissions, plus source-span-anchored candidate links `goal → outcome → mechanism → observable → test method`. It checks identifiers, bounds and literal spans; keeps the exact passage SHA-256 and offsets, not the article body. Edge labels themselves are candidates, not source-proven entailments.
4. `summarizeResearchGaps179`: method missing, multiple original documents suggesting the same edge, review and independent English evaluation requirements. Multiple documents are NOT independently authenticated studies or proof of causality.
5. `stageExistingCategoryConcepts179`: delegates to Phase129's reviewed ontology quarantine without forking it.
6. `openResearchLedger179` / `appendResearchBatch179`: append-only, optimistic revision and hash-linked research records, separate from canonical category knowledge. No direct publication or product-scoring interface.

## Research agenda for each new category

1. User outcomes: original English problems, negative wishes, ambiguous needs, non-shopping requests.
2. Technology families: alternatives capable of producing the result and structural incompatibilities.
3. Engineering mechanism: causal model with conditions and falsifiers.
4. Observable performance: testable output, units, loads, environmental conditions.
5. Original professional test protocols: version, variant, protocol comparability and uncertainty.
6. Critical feasibility: geometry, interface, installation, safety and compatibility limits.
7. Conflicts and coverage gaps: contradictory, incomparable or missing findings.
8. Product-level sources: independently measured exact variant with dated original provenance.
9. Independent user validation: source-disjoint English requests, critical-miss/false-veto tests, paraphrase invariance and evidence-policy stability.

## Five initial deep-study categories

- Vacuum cleaners: pet hair, stairs, flooring and access require differentiated surface/debris tests, not generic suction as a substitute. Source: https://www.rtings.com/vacuum/learn/how-we-test
- Drinking-water filters: taste, dissolved minerals, lead and PFAS are distinct; check exact-model and contaminant-specific certification, applicable conditions and cartridge designation, not a generic logo. Sources: https://www.nsf.org/consumer-resources/articles/contaminant-reduction-claims-guide ; https://www.nsf.org/consumer-resources/articles/product-label-literature-claims
- Washing machines: installed fit and door geometry first, independently examine performance tests and load constraints. Source: https://www.consumerreports.org/appliances/washing-machines/how-we-test/
- Electric kettles: one-cup minimum fill, temperature control, noise and handling do not have a universal priority order. Sources: https://www.which.co.uk/reviews/kettles/article/how-we-test-kettles-a70Wd0m1eRSd ; https://www.choice.com.au/home-and-living/kitchen/kettles-and-tea-makers/articles/how-we-test-kettles
- Pasta makers: rolling/cutting versus extrusion and compatibility with desired shapes must be researched before any cross-model scoring. Source: https://www.seriouseats.com/best-pasta-makers-7557265

These links are research leads from the previous Phase179 research decision, not ingested product measurements, and the last three have not been revalidated in this development block.

## External technical basis and qualifications

- W3C PROV-O models entities, activities, agents and derivation: https://www.w3.org/TR/prov-o/ . Our TypeScript structs are provenance-inspired, **not** a PROV-O or OWL implementation.
- W3C SHACL supplies graph constraint validation concepts: https://www.w3.org/TR/shacl/ . Our input validators are **not** SHACL conformant.
- NSF clarifies why model-specific contaminant claims matter: https://www.nsf.org/consumer-resources/articles/product-label-literature-claims . No certified filter model has been admitted in this phase.
- RTINGS explains surface/debris-dependent vacuum protocols: https://www.rtings.com/vacuum/learn/how-we-test . This does not establish a suitable model for any user.

## Falsifiable acceptance criteria for real autonomous learning

1. A trusted autonomous source-transport worker actually acquires permitted primary sources for an unseen category with observable permission and license metadata and a reproducible discovery log. Current Phase179 does **not** demonstrate this.
2. A general English extraction model or algorithm identifies new goals, mechanisms, limitations and measurable methods with anchored source spans; score on source-disjoint original documents rather than designer-generated paraphrases.
3. Independently adjudicated engineering annotations demonstrate critical-need recall, false decisive constraints, appropriate abstention and method-protocol linkage per category, with confidence intervals where sampling allows.
4. Repeated source versions, contradictions and withdrawn tests trigger research invalidation without silently changing confirmed user criteria or approved rankings.
5. Before product ranking, admit exact-model/source/protocol evidence through the existing Phase169–171 gates and verify full-ranking metamorphic equivalence under intent-preserving paraphrases.
6. Record worker coverage, time and acquisition costs, review workload, failure modes, maintenance and rollback; compare with lighter generic baselines before adding external models.

## Current bounded result

Phase179 demonstrates deterministic planning and research staging for arbitrary safe English category labels, proposal integrity checks and safe append-only research snapshots. Its unit tests use synthetic method sentences; they do NOT demonstrate successful autonomous scientific reading, legal crawling, causal validation, general-English comprehension or model recommendations.
