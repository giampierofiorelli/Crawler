# Owner authorisation: rule admission and semantic validation (2026-10-20), verbatim

Received after the rule-admission assessment (`engine/product-evidence-engine-v5.67-phase243/docs/plans/rule-admission-assessment.md`).
Preserved unchanged. It authorises the next consolidated R3 intervention (S103) and fast-check as a test-only
devDependency.

---

Io approverei fast-check e confermerei le priorità di Claude, ma con alcune correzioni importanti prima di farlo partire.

Ho letto il rapporto di valutazione⁠￼ e controllato knowledge_rules.ts.

La scoperta più importante è confermata: S100 dispone già di un meccanismo per gestire i conflitti durante l’esecuzione, ma il controllo statico di ammissione non è efficace quanto avevamo creduto. Le dichiarazioni troppo generiche dei gruppi contestati consentono infatti di ammettere sovrapposizioni senza analizzarne realmente le condizioni.

È un limite serio, ma finalmente circoscritto.

Le decisioni che prenderei

Strumento	Decisione	Motivo
fast-check		Solo dipendenza di sviluppo, per generare e ridurre controesempi riproducibili
Z3	Rimandare	I vincoli numerici semplici possono essere gestiti con aritmetica degli intervalli
Drools / DMN	Non installare	Riutilizzare le metodologie di analisi senza aggiungere Java/Maven
knowledge_rules esistente	Consolidare	È la base architetturale che vogliamo migliorare, non sostituire

L’approvazione di fast-check non significa autorizzare una nuova dipendenza nel motore operativo. Deve rimanere nei test, con versione bloccata, costi contenuti e vantaggi misurabili rispetto ai test attuali.

Tre correzioni alla proposta di Claude

1. Non promettiamo un’analisi esatta di tutte le regole soltanto perché il vocabolario è finito.

Il codice contiene anche variabili, negazioni, relazioni fra predicati e confronti numerici. Un analizzatore TypeScript può essere molto utile, ma dovrà dichiarare esplicitamente quali classi di regole sa verificare completamente.

Per quelle che non sa analizzare, deve segnalare analisi incompleta, non nessun conflitto.

È una distinzione importante anche nella letteratura sulle tabelle decisionali DMN: il controllo di lacune e sovrapposizioni richiede una semantica precisa del dominio analizzato.

2. Non tutti i test metamorfici suggeriti sono validi.

Claude propone che riordinare le frasi della richiesta non debba cambiare i requisiti.

Ma questo è falso per richieste come:

«Almeno 4 litri. Anzi, facciamo 6.»

Invertendo le due frasi cambia l’ultima correzione dell’utente.

Il test corretto è: riordinare requisiti indipendenti non deve cambiare l’interpretazione; riordinare correzioni e riferimenti contestuali può cambiarla.

fast-check permette di costruire test con condizioni esplicite sui casi generati, evitando di imporre proprietà universali sbagliate.

3. La semantica dei vincoli deve essere leggermente più completa.

Ho verificato un’altra lacuna in phase253_request_constraints.ts: oggi il sistema distingue min e max, ma non conserva sistematicamente la differenza fra limiti inclusivi ed esclusivi.

Quindi at least 4 L e more than 4 L rischiano di diventare lo stesso vincolo. Inoltre between 3 and 5 litres viene rappresentato solo parzialmente dal criterio disponibile.

Prima di ammettere nuove regole sui vincoli dobbiamo rappresentare correttamente anche intervalli, inclusività degli estremi, unità, oggetto, condizioni e scenari alternativi.

Un’unica istruzione consolidata per Claude

Allegati necessari: nessuno. Il rapporto di valutazione, S100–S102, D31 e tutti i moduli interessati sono già nel repository.

PEE — Authorisation: Rule Admission and Semantic Validation

I approve fast-check as a test-only devDependency, provided its license and compatibility are verified and its version is locked. Do not introduce Drools, Z3 or any new runtime rule engine.

Proceed with the next consolidated R3 intervention, preserving S100–S102, D31, existing scientific knowledge, rights restrictions and all ranking/publication gates.

Priorities and execution order

1. Rule admission and invariants. Implement a general admission process that requires a justified semantic meaning, scope, prerequisites, exceptions, counterexamples, provenance, intended consumers, rule classification and test evidence. An arbitrary technical heuristic must not become a protected invariant. Review and supersede RQ08 with its documented lifecycle.
2. Static rule analysis. Extend the existing knowledge_rules engine to detect semantic overlap, conflicting conclusions, redundant or subsumed rules and meaningful gaps. Replace blanket contest declarations with justified, inspectable conflicts and witnesses. State exactly which rule classes the analyser covers; never claim completeness outside that scope. Deliberate abstention is not automatically a rule gap.
3. User-request semantics. Correct RQ08 through a general model of mandatory requirements, preferences, corrections, alternatives, scenarios, objects and conditions. Implement interval compatibility, strict versus inclusive boundaries, unit normalization and contradictory constraints. Preserve distinctions between user intent, inferred needs and verified product evidence.
4. Property-based validation. Use fast-check to generate meaningful positive, negative, boundary and metamorphic cases. Store reproducible seeds and minimized counterexamples. Metamorphic transformations must preserve semantic scope: reordering independent requirements is valid, but reordering corrections or scenario-dependent statements can change meaning.
5. Existing hardcoded policies. Continue the audit of operational interpretation and request paths. Identify remaining semantic policies in TypeScript, migrate justified policies to the shared declarative governance, and genuinely retire superseded decisions. Preserve algorithms in code when appropriate. Do not create a second rule engine or another shadow interpretation path.
6. Scientific reading and knowledge lifecycle. Preserve D31’s unresolved table-introduction problem and validate it using tables with clearly established measurement/specification provenance. Report which existing stored observations can actually be rederived under current retention and rights rules, which cannot, and why. Do not assume that all original page bodies remain available.
7. Independent validation. After freezing the implementation, evaluate genuinely new user requests and new document/table evidence against preregistered references. Report correctness, coverage, justified abstentions, false product attribution, meaningful downstream effects and regressions separately. Keep previously examined material clearly labelled as development or retrospective validation.

Engineering and scientific safeguards

Rule consistency is not scientific correctness. Every admitted rule must be justified in meaning as well as executable form.

A new rule must not be allowed to invalidate a previously correct general capability silently. If the analysis cannot establish that a rule is safe, keep it provisional and report the uncertainty.

Use bounded experiments, preserve earlier decisions, avoid unnecessary network/API costs, and stop if error rates worsen, legitimate rules are incorrectly rejected by the new analyser, or a previously protected invariant would need to be weakened without justification.

Completion

Report separately:

* what was implemented;
* what was independently validated;
* which old rules were replaced or retired;
* which semantic policies remain hardcoded and why;
* what remains open in D31;
* whether the integrated system actually became more correct and maintainable.

Do not claim R3 complete or authorise production ranking. The objective is a permanently reusable, scientifically justified rule-admission and reasoning architecture, not simply a larger rule collection.

La mia raccomandazione finale è di dare a Claude questa autorizzazione. Non serve un’altra lunga fase esplorativa sugli strumenti: la valutazione che ha svolto è sufficiente per scegliere una direzione tecnica ragionevole.

La ricerca successiva sulla generazione e validazione di regole a partire da documenti scientifici rimane un obiettivo importante, ma la affronterei quando il processo di ammissione sarà affidabile. Altrimenti rischieremmo di generare automaticamente molte nuove regole senza essere ancora capaci di determinarne la qualità.

Questa volta voglio che il risultato sia un sistema che sa non soltanto eseguire regole, ma anche dimostrare perché una regola merita di essere utilizzata e quando deve smettere di esserlo.
