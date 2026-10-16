# Phase253 Stage 6 — dormant module inventory

This inventory is linked from `PHASE253-TECHNICAL-REPORT.md` §6. It refines the audit's architectural observation
("146 of 241 modules outside the path", `PRE-PHASE253-GAP-AUDIT.md`) by measuring execution, not only imports.

## How this was measured

- **Import graph** (static): 90 of 245 `src/` modules can be reached by import from `phase253_request_advice.ts`.
- **Execution** (V8 coverage of one N-arm run over the 43 Phase253 cases):
  - 33 modules are loaded;
  - only **11 execute any named function**.

Reachable is not the same as used.

| Status on the advice path | Modules |
|---|---|
| **Executed** (11) | `phase246_knowledge_store`, `phase248_advisory_journey`, `phase253_request_advice`, `phase253_request_constraints`, `phase249_decision`, `phase177_decision_snapshot`, `phase125_compositional_dialogue_frame`, `phase245_value_normalizer`, `phase250_category_lessons`, `phase247_category_relations`, `phase193_screening_memory` |
| **Loaded only** (22) | `phase248_category_registry` (constants), `phase249_retention_policy`, `phase248_safety_notices`, `category_cognitive_mesh`, `phase116_category_function_model`, `phase128_category_cognition_dialogue_bridge`, `phase75_source_discovery`, `web_evidence_acquisition`, `approved_web_reader`, `phase180_reviewed_first_answer`, `phase122/123/124` native retrieval and intent modules, `adaptive_schema_evolution`, `category_evidence_matrix`, `phase189/191/192` source screens, `phase223_public_metadata_access`, `phase245_html_dom` |
| **Not loaded** | everything else, including every family below |

## The families named in the brief

The decision column has three values:

- **connect next** means it is the next justified link;
- **keep as research** means it stays callable and tested but outside the advice path;
- **park** means no work is planned until a stated precondition is met.

Nothing is deleted. Every module keeps its tests.

| Family | Modules (test files) | What it does | Why it is not on the path | Decision |
|---|---|---|---|---|
| Headphone measurements | `open_headphone_measurements` (1), `lab_uncertainty` (3), `phase183_source_measurement_intake` (2) | Attributed CC BY frequency-response excerpt (HD600 only); interval check of lab-reported uncertainty; quarantined intake of permission-reviewed measurement tables | There are no independent measurements in the store for any product PEE holds. `headphones` is not in the operational registry. | **park** until reviewed independent measurements exist for products in the store. Performance needs are reported as "Not checked" meanwhile. |
| Category cognition / function models | `category_cognitive_mesh` (5), `phase116_category_function_model` (2), `phase128_category_cognition_dialogue_bridge`, `phase104_entity_cognition` | Research-only category orchestration; function–behaviour–outcome models | Loaded through the journey's imports, but no function is called. Category knowledge reaches advice through `category_items` (Phase246/250). | **keep as research**. Schema inspiration for Stage 7 packages (function → need → checkable property), not a runtime dependency. |
| Need discovery | `needs_discovery` (7), `needs_demo_pipeline` (1), `phase168_qualitative_need_research_bridge` (1), `phase173_need_mechanism_graph` (1) | Phase56 explicit use-case → evidence requirement mapping; toy ranking demo; qualitative research bridge; mechanism-graph proposals | Superseded on the path by the Phase248 need stage plus the Phase253 constraints. `needs_demo_pipeline` produces a toy winner ("NEVER publish"). | **keep as research**; `needs_demo_pipeline` stays isolated. |
| Cold-start intake | `category_cold_start_intake` (1), `phase72_semantic_intake`, `phase109_source_wide_semantic_intake`, `phase177_web_intake` | Reviewed-policy, ephemeral intake for unknown categories | The advice path reads only the store. Intake belongs to acquisition runs, not to answering. | **keep** (acquisition side). |
| Research execution | `category_research_execution` (4), `phase129_category_growth_cycle`, `phase179_category_learning` (1), `phase182_gap_research_orchestrator` (10) | Bounded execution of category research plans; gap research | `Advice253` carries `researchPlan` strings, but nothing executes them. | **connect next**: feed `unresolved`, unknown and conflict reasons to `phase182_gap_research_orchestrator` as research tasks (never as evidence admission). It is the shortest loop from "could not check" to new retained declarations. |
| Source discovery / promotion | `phase75_source_discovery` (4), `phase220_autonomous_discovery_worker` (9), `phase221/223` discovery, `phase124_authorized_discovery` | Lawful sitemap discovery; discovery worker over operator-reviewed registries | Discovery gives leads, not evidence. Answering must never trigger network access. | **keep** (acquisition side); feeds the research loop above. |
| Lab-needs bridges | `lab_needs_bridge` (6), `phase166_quantified_evidence_bridge` (4), `phase167_source_variant_quantity_adapter`, `phase169/170` | Confirmed needs → original lab measurements; English quantity requests → original-evidence research | Overlaps with Phase253: `phase166` parses quantity requests for research, while `phase253_request_constraints` parses them for checks. Neither has lab data to bridge to. | **park** `lab_needs_bridge` (no lab data). Reconcile the two quantity parsers into one when the research loop is connected. |

## Gaps the inventory exposed

1. **Registry versus store.**
   - The operational registry (`CATEGORY_REGISTRY250`, 13 categories) has no `headphones` or `microwave_ovens`. The store holds checkable products in both.
   - Such requests are answered "not a category PEE holds".
   - The Phase252 teaching that covered them was not adopted (Phase252 §4). This is a coverage decision for the owner, not something to fix with vocabulary.
2. **Two quantity parsers.** `phase166` (research) and `phase253_request_constraints` (decision) both read quantities from English requests.
3. **Ranking code outside the signed path.** `needs_demo_pipeline` produces a winner. It is isolated (not loaded), and must stay so.
