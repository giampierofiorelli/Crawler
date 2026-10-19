# Owner review of S86b and decision S86c: knowledge-guided evidence discovery and precision recovery (2026-10-19), verbatim

Received in session `session_01KSRrjegucVNMZGsTKfhd3B` after the S86b report. Decision S86c in
`decisions-and-supersessions.md`; work in `engine/product-evidence-engine-v5.67-phase243/docs/plans/s86c-knowledge-guided-discovery.md`.

---

Questo rapporto conferma la tua intuizione: il problema principale non era la mancanza di conoscenza scientifica, ma il fatto che PEE non la utilizzasse abbastanza per scoprire le informazioni nelle pagine.

Ho letto il rapporto S86b e il codice dei lettori. Il risultato più importante è che Claude ha finalmente misurato il problema nel punto che ti interessava, anziché limitarsi alle classifiche o alla correttezza delle unità.

Cosa dimostra S86b

Lettura precedente

6

Misure recuperate sulle pagine S80

Lettura guidata dalla conoscenza

68

Misure riconosciute nel confronto sperimentale

Correttamente attribuite

49

Ancora con errori e ambiguità da risolvere

Questo è un salto potenziale enorme. Ma non possiamo ancora chiamarlo un miglioramento pronto per l’uso, perché la stessa configurazione guidata accetta anche 41 valori che non sono risultati di test, e attribuisce 11 risultati al prodotto sbagliato.

La tua idea è quindi confermata nella prima parte: la conoscenza può trovare molto più materiale. La seconda parte, cioè utilizzarlo correttamente, richiede ancora lavoro.

Inoltre Claude ha recuperato due capacità perdute in S85, corretto alcune lacune comuni ai due lettori e introdotto nella skill la verifica obbligatoria delle capacità conservate durante le fusioni. Questo risponde concretamente anche alla tua seconda preoccupazione.

Due verifiche importanti prima di procedere

Nel rapporto e negli script ho individuato anche due aspetti da chiarire.

Primo: il riferimento sigillato riporta 123 risultati misurati e 175 dichiarazioni, mentre il rapporto finale utilizza 125 e 170. Potrebbe dipendere da criteri differenti di deduplicazione o conteggio, ma Claude deve riconciliare questi numeri. Non dobbiamo assumere automaticamente che uno dei due sia corretto.

Secondo: lo script che confronta le estrazioni con le annotazioni utilizza il valore numerico e una similarità testuale per trovare corrispondenze. È ragionevole per una prima diagnosi, ma potrebbe associare erroneamente numeri identici presenti nello stesso contesto. Occorre verificare anche gli abbinamenti, non soltanto il risultato complessivo.

Questi controlli non annullano la scoperta: la differenza tra il lettore operativo e quello guidato è troppo grande per essere ignorata. Rendono però più affidabile la misura del miglioramento.

La decisione che prenderei

Prima S86c: recupero delle informazioni guidato dalla conoscenza, con controlli scientifici e di attribuzione. Poi S87: apprendimento bidirezionale.

Non autorizzerei ancora l’attivazione indiscriminata del lettore Phase272.

Vogliamo sviluppare una capacità generale che distingua, per ciascun valore:

* Risultato effettivamente misurato.
* Condizione o impostazione di prova.
* Specifica dichiarata.
* Risultato certificato o citato da un’altra fonte.
* Risultato appartenente a un altro prodotto.
* Informazione ancora non risolta.

Attenzione all’ultimo punto: una misura riferita a un altro prodotto non deve essere attribuita al prodotto recensito, ma non va neppure buttata via. Se PEE può identificarne correttamente il soggetto, è conoscenza potenzialmente preziosa.

Prompt unico per Claude — S86c

PEE — S86c: Knowledge-Guided Evidence Discovery and Precision Recovery

Owner decision

S86b confirms a major operational finding: scientific quantity knowledge significantly expands candidate discovery on authentic pages, but existing precision and attribution safeguards are insufficient for operational admission.

Proceed with one bounded S86c integration before S87.

Attachments: none. All required reports, code, evaluation material and skill instructions are already in the repositories.

Preserve R1–R7, S83–S86b, all scientific safeguards, rights and retention requirements. R3 remains open.

1. Verify the measurement before changing the reader

Reconcile the S86b sealed-reference counts (123 measured and 175 declared in the freeze record versus 125 measured and 170 declared in the report).

Audit the scoring methodology, particularly value-and-text matching, duplicate handling, repeated numbers, attribution and distinctions between candidates, admitted leads and actually persisted records.

Preserve the original first runs and sealed reference. If the scorer needs correction, version it and publish both the original and corrected results.

Do not retune the reference to favour the proposed implementation.

2. Integrate knowledge-guided discovery into the existing extraction architecture

Build on the Phase272 plan-guided reading and existing Phase225/226/265/270 readers, quantity knowledge, document semantics and teaching relationships.

Do not build a competing extractor or a parallel knowledge layer.

Use existing knowledge to guide the discovery of potentially relevant statements and quantities in prose and tables, not merely to classify values after their discovery.

Consolidate capabilities from both the older readers and the knowledge-guided path. Preserve every demonstrated useful capability from either mechanism.

Keep new admission initially in shadow. Production persistence must remain protected until precision and attribution are demonstrated.

3. Develop or connect the missing general reasoning

For each numeric observation, distinguish:

* Actual measured result.
* Experimental condition or controlled setting.
* Programme preset or product operating mode.
* Manufacturer specification or claim.
* Independently certified nominal measurement.
* Result quoted from another independent source.
* Derived or calculated outcome.
* Unsupported or unresolved observation.

Distinguish who performed the measurement from who published or quoted it.

The same clause may contain several values with different roles. Interpret each observation in its local context, using document context only where the link is supported.

Reuse existing scientific knowledge, condition axes, evidence roles, provenance and document links. Prefer general mechanisms over more specialised phrase lists.

A condition must never become a result simply because its unit is recognised.

Do not discard useful declarations or third-party evidence merely because they are not first-hand tests; preserve their appropriate evidential status where permitted.

4. Resolve product attribution

A measurement belongs to the product, variant or component actually tested, not automatically to the product featured in the page title.

Reuse existing exact product identity, model and provenance mechanisms.

Support results for multiple products discussed on one page when their identity is supported. Otherwise retain an unresolved attribution, without creating a verified result for the wrong product.

Do not use approximate name similarity to establish identity.

5. Measure all changes on the existing reference

Compare:

A. Pre-S86 extraction.

B. S86 operational extraction.

C. S86b knowledge-guided extraction.

D. S86c knowledge-guided extraction with validated precision controls.

Separately ablate each new control to establish its contribution.

Measure per observation and per page:

* Correct result candidates discovered.
* Correct results admitted.
* Correct quantity interpretation.
* Correct product attribution.
* Incorrect results accepted.
* Results wrongly rejected.
* Declarations and conditions correctly classified.
* Correctly unresolved evidence.
* Final eligible stored observations.
* Capabilities gained, lost or still absent.

Pay particular attention to the 41 false results, 11 incorrect product attributions and 57 results still missed in S86b.

Investigate the remaining missed cases: comparisons, bounded or approximate quantities, number words, label–value tables and derived values. Do not implement unrelated expansions merely to increase recall.

Use the mandatory old/new/combined four-set capability-preservation method.

The objective is a scientifically justified increase in correctly recovered and attributed evidence, not simply more candidate numbers.

6. Validate without confusing development with generalisation

Use the S80 pages only for development, diagnosis and regression. They are spent material.

Preserve first runs and report failures.

No new live acquisition is authorised in S86c. If independently authored, genuinely unseen and legally usable material already exists, keep it separate from development. Otherwise design the next independent evaluation and report the requirement for a fresh acquisition policy.

Do not claim generalisation until an independent first run supports it.

7. Preserve architecture and stop

Reuse existing scientific vocabulary, readers, source-role rules, knowledge store, comparison logic and revision mechanisms.

Retire duplicate code only after proving capability preservation.

No new ranking authorisation, unverified evidence promotion, automatic learning adoption, paid services or new semantic models.

Do not start S87, full intervention D or any unrelated refactoring.

Run the regression suite and report net architecture changes, the final stage-by-stage recovery figures, remaining failures and independent-validation requirements.

Stop after S86c.

The success criterion is that PEE genuinely improves its ability to discover, interpret and attribute correct evidence by applying existing scientific knowledge, while maintaining or improving precision and retaining all useful legacy capabilities.

E dopo S86c?

Se S86c riesce a portare il recupero corretto ben oltre i 6 risultati iniziali, contenendo le attribuzioni e i falsi positivi, sarà una dimostrazione di sviluppo molto più significativa delle precedenti.

A quel punto avremo due attività distinte:

Validazione indipendente: acquisire un nuovo insieme autorizzato di pagine, con riferimento preparato prima del test, per verificare che il miglioramento si generalizzi.

S87: utilizzare anche gli errori, i concetti sconosciuti e le informazioni irrisolte per alimentare l’apprendimento bidirezionale.

Non autorizzerei ancora nuove acquisizioni dal vivo senza una politica specifica, anche se Claude propone 15–20 pagine. Possiamo decidere quella sperimentazione dopo il consolidamento.

E soprattutto, questo risultato dimostra perché era importante insistere sulla tua domanda iniziale: non basta mettere insieme gli algoritmi. Bisogna verificare che la loro collaborazione migliori realmente il lavoro che PEE deve svolgere.
