# Owner decision: Qwen suspended as an R3 development direction (2026-10-20), verbatim

Received during S94 Stage 3, while the fourth Qwen run (structured input on the new S94 reference) was in progress. That
run was stopped at once and is reported as not executed. Code, results and reasons are kept (S94 report §4).

---

Direi di sospendere Qwen come direzione di sviluppo per R3, conservando codice, risultati e motivazioni. Non significa escludere per sempre qualsiasi modello linguistico. Qwen ci sta costando molto senza dimostrare utilità

---

**Scope (Claude's reading, for the record):**
- Suspended: Qwen as an R3 development direction; no further Qwen runs, prompt variants or model sizes in R3.
- Kept: `scripts/r3-semantic/validate.py` (with the `LLM_INPUT=structured` variant), `scripts/r3-semantic-score.mjs`,
  every committed result in `evaluation/r3/semantic-*.json`, and the reasons in the S94 report.
- Not decided: language models in general. A future use needs a new owner decision.
