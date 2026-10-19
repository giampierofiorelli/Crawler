# Owner review of S85 and decision S86: shared scientific quantity understanding across extraction (2026-10-19), verbatim

Received in session `session_01KSRrjegucVNMZGsTKfhd3B` after the S85 report. Decision S86 in
`decisions-and-supersessions.md`; work in `engine/product-evidence-engine-v5.67-phase243/docs/plans/s86-extraction-quantities.md`.

---

S85 è un buon risultato: il primo intervento sull’intero PEE ha prodotto miglioramenti concreti e ha cominciato a riutilizzare davvero la conoscenza scientifica fuori da R3.

Ho verificato il rapporto su GitHub. Le tre cose che considero più importanti sono queste:

1. Maggiore sicurezza scientifica. Le 13 coppie bisogno–misura precedentemente autorizzabili sulla base delle valutazioni dello stesso modello non lo sono più. Non significa che quelle relazioni siano false, ma che non hanno ancora una base sufficientemente verificata per autorizzare una classifica.

2. Comprensione migliore delle richieste. PEE recupera bisogni prima perduti, come quiet enough to sleep next to, distingue caratteristiche da risultati desiderati e utilizza un unico meccanismo per interpretare le quantità.

3. Acquisizione più controllata. Lo script di ricerca dal vivo applica ora la politica del proprietario prima delle richieste. La verifica è stata eseguita offline, quindi non possiamo ancora dichiarare validato l’intero comportamento operativo.

Test superati

4.839

Decisioni cambiate nelle 206 richieste

0

Nuove autorizzazioni ranking

0

C’è però una precauzione importante per il prossimo intervento: sapere che una pagina appartiene a un editore specializzato in test non significa che ogni valore contenuto nella pagina sia stato misurato da quell’editore. Potrebbe essere una specifica copiata dal produttore.

Questa distinzione va preservata quando estenderemo la conoscenza quantitativa all’estrazione dei dati dalle pagine.

E non considererei un successo architetturale soltanto il numero di righe eliminate: S85 ha aggiunto 162 righe nette per introdurre controlli necessari. Il beneficio reale è avere meno interpretazioni concorrenti, senza perdere capacità.

Il prossimo intervento che consiglierei: S86

Concordo con Claude: adesso conviene completare A, estendendo il meccanismo quantitativo condiviso dalla richiesta dell’utente alla lettura delle pagine.

È il passo più naturale verso l’architettura che abbiamo immaginato: lo stesso concetto di misura viene riconosciuto nella richiesta, cercato nei documenti, estratto con le sue condizioni e utilizzato nella valutazione delle prove.

Non avvierei ancora C, D o nuovi esperimenti con DeBERTa. Prima consolidiamo questo collegamento.

PEE — S86: Shared Scientific Quantity Understanding Across Extraction

Continue from the completed S85 report and the S84 cross-system architecture census.

Attachments: none. All required source code, reports, research knowledge, evaluation records and architectural decisions are already in the repositories.

Objective

Extend the existing shared quantity-knowledge mechanism from user-request interpretation to the operational extraction of product declarations, test measurements and comparative observations.

The objective is not merely to recognise more units. PEE must understand what was measured or declared, under which conditions, by whom, through which method and with what evidential status.

The same scientific representation should serve different parts of PEE without duplicating its meaning in separate readers.

Preserve the R1–R7 roadmap, the S83–S85 decisions, the existing knowledge store, and all safety and provenance requirements. R3 remains open.

1. Inspect the existing operational extraction paths

Trace the actual readers and consumers for Phase245 declarations, Phase265 test measurements, Phase270 test observations and Phase271 comparative results.

Identify precisely where these paths duplicate or fail to use quantity-knowledge typing.

Reuse existing quantity definitions, condition axes, evidence-role classification, provenance and versioned reading mechanisms.

Do not introduce a competing measurement ontology or another independent unit vocabulary.

2. Preserve the distinction between declarations and measured evidence

Before assigning scientific meaning or storing a measured result, determine its observation-level evidential role.

A test publisher’s page may contain manufacturer specifications, quotations, test results and editorial interpretations. Publisher identity alone must not make every value a first-hand measurement.

A test lead is not automatically a verified test result.

Keep manufacturer declarations available under their correct evidential role, without promoting them to independent measurements.

Maintain the S85 safeguards, existing declaration screens and the separation between quantitative tests and structured qualitative expert observations.

Check that a sufficiency assessment by an independent reviewer is not confused with independent original product evidence; the complete ranking path must still enforce its established evidence requirements.

3. Use quantity knowledge to interpret extracted observations

Implement a bounded extension of the existing readers that can preserve, where established:

* Quantity, unit, measurand and measurement basis.
* Compound units and time denominators.
* Relevant qualifiers such as A-weighting for acoustic quantities.
* Differences between related but non-equivalent quantities, including CADR versus airflow.
* Operating settings, test conditions, method and scope.
* Whether the value is measured, declared, estimated or not sufficiently classified.

Do not assume a measurement’s identity or conditions merely because a label, unit or surrounding document makes them plausible.

Where the evidence is insufficient, retain an explicit unresolved state and its reason.

Preserve the original source attribution and existing legal retention constraints. Do not store prohibited page bodies or unnecessary user data.

4. Reuse rather than duplicate

Where an existing reader’s local unit table or measurement interpretation is superseded, replace it incrementally with the shared quantity mechanism.

Preserve category-specific semantics only where scientifically necessary, and prefer teaching data over product-specific code.

Use the existing versioned reading and re-derivation mechanisms. Do not silently reinterpret historical observations or overwrite verified store states.

Record unknown units, labels and conditions as unresolved observations where existing mechanisms allow, but do not implement intervention C’s candidate-store migration or automatic knowledge promotion in this step.

5. Verification

Establish an unchanged baseline before modification.

Compare the old and new extraction paths on existing authentic material, including the S80 pages, the stored test rows and the 87 comparative observations where relevant.

Evaluate observation-level correctness, not merely total counts.

Include specific counterexamples for:

Manufacturer specifications appearing on professional test pages; measured versus declared acoustic levels; CADR versus general airflow; rates versus capacities; documented versus missing test conditions; and methods that are mentioned but not actually performed.

Measure recovered correct observations, false attributions, changed evidential roles, unresolved cases, provenance preservation, regressions and architectural complexity.

Use knowledge-on/off ablations where meaningful.

Treat all existing and previously examined documents as development or regression material, not independent validation. Use genuinely unseen and authorised material only if available; otherwise report the independent-validation gap explicitly.

Preserve all first-run outcomes, including failures.

6. Boundaries and stop conditions

Do not broaden acquisition permissions or initiate unauthorised live research.

Do not change public ranking authorisations, release previously blocked evidence, or weaken S85 safeguards.

Do not start interventions B, C or D, new semantic-model experiments, or a general code-removal campaign.

Complete the bounded extraction integration, run the full regression suite and report the real net changes in operational code and duplicated mechanisms.

Produce a concise English report distinguishing implementation, observed results and independently validated capabilities.

Identify the next highest-value cross-system integration after S86, taking into account the original bidirectional knowledge-reuse objective.

Stop after S86. Do not autonomously expand into the next intervention.

Un ultimo punto: il successo di S86 non sarà avere più numeri nel database. Sarà avere più misure correttamente interpretate e attribuite, con meno duplicazioni e senza confondere ciò che un produttore dichiara con ciò che un esperto ha effettivamente verificato.

Se otteniamo questo risultato, avremo collegato meglio tre parti fondamentali di PEE: richieste degli utenti, lettura dei documenti e ragionamento scientifico. Sarà una base molto più solida per l’apprendimento bidirezionale che vogliamo realizzare successivamente.
