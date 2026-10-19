# Owner review of S86, proposed S87, and the revised order: capability preservation and extraction recovery first (2026-10-19), verbatim

Received in session `session_01KSRrjegucVNMZGsTKfhd3B` after the S86 report. Decision S86b in
`decisions-and-supersessions.md`. The owner first proposes S87 (intervention C), then reorders the programme: the
capability-preservation verification of S85 and S86 and the three-configuration extraction-recovery comparison come
first. S87 has **not** been started. Work in
`engine/product-evidence-engine-v5.67-phase243/docs/plans/s86b-capability-preservation-and-recovery.md`.

---

S86 è un altro passo avanti importante. Adesso PEE comincia davvero a utilizzare la stessa conoscenza quantitativa in due punti diversi: quando interpreta ciò che chiede l’utente e quando legge le prove contenute nelle pagine.

Ho verificato il rapporto pubblicato su GitHub. I risultati dichiarati sono coerenti con i dati riportati:

* 4.846 test superati, senza nuove autorizzazioni di ranking.
* Sulle 12 pagine già esaminate, gli stessi 7 risultati vengono conservati: 5 ora hanno un tipo quantitativo identificato e 2 rimangono correttamente ambigui.
* Sulle 99 osservazioni già memorizzate, 67 sono ora tipizzate in lettura; le altre 32 riguardano costi in pence, che il vocabolario quantitativo non gestisce ancora.
* La distinzione tra dichiarazione del produttore e misurazione del recensore è stata rafforzata a livello di singolo valore.
* Le 206 richieste di regressione restano invariate.

Sono risultati di sviluppo e regressione, non una validazione indipendente su pagine nuove.

Quale strada sceglierei adesso

Sceglierei C: iniziare il circuito bidirezionale di apprendimento, prima di estendere ulteriormente il lettore Phase225.

È il passo che collega più direttamente il lavoro appena completato alla visione generale che abbiamo definito: non soltanto usare la conoscenza per leggere, ma utilizzare ciò che viene letto per migliorare la conoscenza futura.

C’è però una distinzione essenziale.

Non tutto ciò che PEE non comprende è una nuova parola da imparare.

Per esempio, le 32 osservazioni in pence sono costi, non necessariamente termini sconosciuti. I due livelli sonori ambigui richiedono informazioni sulla misura, non nuovi sinonimi. E una dichiarazione del produttore esclusa dalle misure indipendenti non è un errore di lettura: è una corretta classificazione dell’evidenza.

Se mettessimo tutto indistintamente in un registro di «nuovo vocabolario», costruiremmo un altro meccanismo confuso.

Propongo quindi che il primo passo di C riguardi la corretta identificazione, classificazione e conservazione controllata delle opportunità di apprendimento, senza promuovere automaticamente nuove conoscenze operative.

Prompt consolidato per Claude — S87

Allegati necessari: nessuno. Tutti i rapporti e i meccanismi esistenti sono già nei repository. Non è necessario creare pacchetti o ricostruire documenti.

PEE — S87: Bidirectional Knowledge Learning, Candidate Intake and Controlled Reuse

Owner decision

S86 is complete. Proceed with the first bounded implementation of S84 intervention C: connecting observations made by PEE’s existing readers to its existing knowledge-management mechanisms.

This is the beginning of bidirectional knowledge reuse across the whole Product Evidence Engine.

Existing knowledge must improve reading and interpretation. New observations must be able to propose reusable knowledge, subject to evidence, provenance, uncertainty and validation.

Do not create a separate learning architecture or new autonomous agent.

Prerequisites

Read the existing PEE skill, roadmap, generalisation method and S84–S86 reports. Inspect the actual store schema, journal, research gaps, candidate/adoption mechanisms, retention policy and operational consumers before changing anything.

All required files are already available in the repositories. No attachments or external services are needed.

Preserve R1–R7; R3 remains open. Respect all previous scientific, architectural, legal and ranking decisions.

1. Establish what is genuinely a learning opportunity

Audit observations that current readers cannot fully interpret or deliberately set aside, including:

* Previously unknown technical labels, units, expressions and measurement terms.
* Known quantities whose scientific identity remains ambiguous.
* Missing measurement conditions, methods or provenance.
* Manufacturer declarations correctly excluded from independent-test evidence.
* Unknown terminology encountered in user requests.

Classify these cases by their actual cause.

Do not treat every unresolved observation as a vocabulary candidate.

Examples:

* Pence is a known currency unit outside the current quantitative scope, not necessarily new vocabulary.
* An unspecified dB measurement may lack methodological context rather than a synonym.
* A manufacturer claim rejected as an independent measurement is a correctly classified declaration, not a failed extraction.
* An unfamiliar technical expression may be a genuine candidate for vocabulary or scientific concept learning.

Preserve these distinctions in the resulting records and evaluation.

2. Reuse the existing private knowledge store

Trace and reuse the existing research-gap, category-item, relation, provenance, journal, retirement and adoption mechanisms.

Implement the smallest durable, reversible candidate-intake capability that these mechanisms can safely support.

Each accepted observation should have sufficient structured provenance to explain:

* What kind of information was encountered.
* Where it originated, within applicable retention rights.
* Why existing knowledge could not resolve it.
* Whether it suggests terminology, a missing scientific relation, an unsupported quantity type, missing evidence or another research need.
* Its current evidential and adoption status.
* Which original observation or category version can be reconsidered later.

Prefer existing tables and event types. Do not introduce schema v11 or a parallel store.

If the existing schema cannot faithfully represent a required distinction, preserve the unresolved case and explain the limitation instead of silently forcing an incorrect representation.

3. Protect privacy, rights and scientific meaning

Do not retain complete user requests, page bodies or prohibited source text.

For request-derived signals, first determine what can be processed or counted without new persistent personal data. Do not start storing normalised request fragments merely because the architecture could technically support them.

For document-derived signals, retain only permitted structured terminology, provenance and classification metadata. Apply existing rights and retention rules.

Keep hypothesis, candidate, observation and verified knowledge separate.

Similarity is not equivalence; repetition is not independent verification; a manufacturer’s claim is not a measured scientific result.

No new candidate may automatically become a live alias, established scientific relation, ranking fact or eligibility rule.

Existing adoption and validation mechanisms remain authoritative. Safe observation and classification may operate autonomously; consequential knowledge promotion requires the applicable evidence and validation checks.

4. Make the feedback path reusable

Avoid an intake capability used only by one extraction module.

Define a shared interface through which existing operational components can submit appropriately classified candidate observations without duplicating the journal or promotion workflow.

Demonstrate it first using existing extraction signals from S86.

Examine whether request understanding, search planning, quantitative reading and qualitative reading could later use the same mechanism without separate candidate systems.

Do not implement every producer in this step. Establish the common contract and one verified operational producer.

A candidate should be capable of informing subsequent targeted research or reconsideration, but not of changing evidence assessments or advice until properly adopted.

5. Prevent noise and accumulation

Ensure deterministic candidate identity, provenance-aware deduplication, idempotent recording, retirement and recovery.

Repeated processing of the same page revision must not artificially increase evidence or frequency.

Distinguish multiple observations from genuinely independent supporting sources.

Do not allow unsupported candidates to accumulate indefinitely without status, expiration, consolidation or a defensible research priority.

Avoid category-specific vocabulary patches, new synonym lists and manual TypeScript exceptions as the primary solution.

6. Validate the first implementation

Establish an unchanged baseline before modifications.

Use the existing S86 reading results, stored observations, knowledge journal and spent evaluations as development material.

Include counterexamples for:

* Unknown terminology versus an unsupported but known unit.
* Missing method versus a genuinely unknown concept.
* Declared manufacturer value versus measured evidence.
* Repeated observations from one source versus independent observations.
* A candidate colliding with an existing category or alias.
* Candidate retirement and subsequent reconsideration.
* Replay of the same source without duplicate evidence.
* Source or user information that retention policy does not permit storing.

Measure:

* Correctly classified candidate opportunities.
* False or noisy candidates.
* Provenance and rights compliance.
* Duplication avoided.
* Journal integrity and replay behaviour.
* Whether any existing operational behaviour changes unexpectedly.
* Net architectural complexity and reuse.

Use knowledge-on/off comparisons where they can establish a meaningful operational difference.

Do not mistake successful candidate capture for validated autonomous learning. Distinguish observation intake, candidate formation, evidence-based promotion and actual reuse in later operations.

Do not claim independent validation from material already examined by Claude.

7. Scope and stop conditions

No live web acquisition, paid services, model downloads or new semantic-model experiment.

Do not widen ranking permissions or bypass S85–S86 declaration and evidence safeguards.

Do not implement the complete Phase225 prose expansion, Phase245 declaration rewrite, or the full acquisition intervention D.

Do not create a new learning engine, ontology, knowledge store, architectural roadmap or general refactoring project.

Do not delete the existing nine qualitative observations.

Run all relevant tests and preserve initial failures and first-run results.

Deliver a concise English report covering commits, implemented mechanisms, observed results, unchanged safeguards, validation limitations, net complexity and the next highest-value bounded integration.

Stop after implementing and checking this first candidate-intake capability. Do not automatically proceed into broader knowledge promotion or additional interventions.

The success criterion is a reliable reusable path from previously unresolved observations to traceable learning opportunities, using PEE’s existing knowledge mechanisms without introducing unverified scientific conclusions.

Perché questo è il momento giusto

Finora abbiamo migliorato soprattutto il percorso conoscenza → interpretazione.

Con S87 iniziamo l’altra direzione: interpretazione → nuove opportunità di conoscenza.

Il primo risultato non sarà ancora un PEE che impara autonomamente qualsiasi concetto. Sarà l’infrastruttura operativa necessaria a farlo con rigore, senza accumulare parole inutili, falsi sinonimi e ipotesi non verificate.

Dopo S87 valuteremo ciò che Claude avrà effettivamente costruito e decideremo se completare la lettura della prosa, collegare le osservazioni qualitative oppure rafforzare la ricerca guidata dalla conoscenza.

Il traguardo resta uno solo: una conoscenza acquisita in qualsiasi parte di PEE deve poter migliorare, quando pertinente e verificata, tutto il resto del sistema.

Hai ragione su entrambe le questioni. E la seconda, secondo me, è particolarmente importante perché riguarda il modo in cui vogliamo sviluppare PEE da ora in avanti.

Ho confrontato il codice precedente con quello di S85 e S86 su GitHub. Posso darti una risposta abbastanza precisa.

1. Perché non vediamo ancora miglioramenti concreti nei risultati finali?

Perché finora abbiamo migliorato soprattutto la capacità di interpretare le informazioni, non ancora quella di trasformarle in consigli migliori.

I miglioramenti esistono, ma sono concentrati nelle fasi intermedie.

Capacità	Prima	Dopo
Comprensione delle quantità nelle richieste	Due sistemi in disaccordo	Un sistema condiviso, con alcuni errori recuperati
Tipizzazione dei 7 risultati estratti dalle pagine S80	0 tipizzati	5 tipizzati, 2 ambigui
Tipizzazione delle 99 osservazioni memorizzate	0 tipizzate	67 tipizzate in lettura
Decisioni sulle 206 richieste già utilizzate	Risultati precedenti	Nessuna decisione cambiata
Miglioramento delle classifiche reali	Non dimostrato	Ancora non dimostrato

Questo avviene principalmente per tre ragioni.

La prima: le 12 pagine disponibili contengono pochissime misurazioni utili per verificare le nuove capacità. Non abbiamo ancora visto PEE migliorare concretamente l’estrazione di CADR, flussi d’aria o consumi su nuove pagine autentiche.

La seconda: molte delle informazioni ora riconosciute meglio non arrivano ancora a influenzare le decisioni. Le classifiche richiedono prove e cataloghi verificati, mentre D28 rimane sperimentale.

La terza: stiamo usando principalmente dati già esaminati. Sono utili per verificare che non abbiamo peggiorato il software, ma insufficienti per dimostrare un miglioramento generale.

Quindi la mia valutazione è:

Abbiamo dimostrato progressi nella rappresentazione quantitativa e alcuni recuperi nelle richieste. Non abbiamo ancora dimostrato un corrispondente miglioramento dell’efficacia complessiva di PEE.

E dobbiamo iniziare a misurare esplicitamente anche questo secondo risultato.

2. Abbiamo davvero unito il meglio dei due sistemi?

Qui la risposta è: in parte sì, ma non considero ancora verificato che il merging sia completo.

Ho controllato precisamente phase253_request_constraints.ts e quantity_knowledge.ts.

In S85 Claude non ha semplicemente eliminato il vecchio interprete per sostituirlo con quello di R3.

Ha trasferito nella conoscenza quantitativa alcune capacità che il vecchio sistema aveva e quello nuovo non possedeva, fra cui:

* Il riconoscimento degli intervalli, come between 3 and 5 litres.
* L’interpretazione di litres a day, utilizzando il vocabolario già presente nella conoscenza quantitativa.
* Il riconoscimento delle misure in pollici espresse con il simbolo ", anche prima di un’altra parola.

Ha inoltre mantenuto nel vecchio componente le responsabilità che non riguardano semplicemente l’identità della quantità: limiti minimi e massimi, dimensioni degli spazi disponibili, associazione alle caratteristiche del prodotto e criteri verificabili.

Quindi un tentativo di fusione intelligente c’è stato.

Anche S86 ha mantenuto alcuni controlli scientifici precedenti. Un esempio significativo è l’intestazione Measured time (W): la prima implementazione non riconosceva più la contraddizione tra tempo e watt. I test hanno individuato il problema e Claude lo ha corretto.

Questo è positivo.

Ma manca una verifica che considero essenziale

Non vedo ancora dimostrato in modo sistematico che tutte le capacità utili dei vecchi sistemi siano sopravvissute e siano state integrate nel meccanismo condiviso.

I 206 test sulle richieste, le 12 pagine S80 e i test aggiunti sono controlli importanti, ma non coprono necessariamente tutte le combinazioni che i vecchi lettori gestivano.

Inoltre, S86 non ha completato l’unificazione: i lettori Phase225, Phase245 e parte di Phase270 mantengono ancora meccanismi locali, per motivi dichiarati.

Non è necessariamente sbagliato. Significa però che il consolidamento rimane parziale.

3. Come vorrei verificare tutte le future fusioni

Introdurrei una regola permanente.

Quando PEE possiede due meccanismi simili, non dobbiamo semplicemente scegliere quello più recente o apparentemente migliore.

Dobbiamo identificare quattro insiemi di capacità:

Solo vecchio sistema

Capacità utili che rischiamo di perdere

Solo nuovo sistema

Capacità da aggiungere al meccanismo comune

Entrambi

Funzionalità duplicate da consolidare

Nessuno dei due

Lacune comuni da studiare e risolvere

Meccanismo condiviso migliorato

Conserva le capacità corrette di entrambi, elimina le duplicazioni e supera i limiti comuni quando possibile.

E naturalmente dobbiamo verificare che le vecchie capacità fossero effettivamente corrette, non conservarle soltanto perché esistevano.

Questa è la differenza tra sostituzione e consolidamento con trasferimento delle capacità.

4. Cosa cambierei nel nostro programma

Non abbandonerei il lavoro S87 sull’apprendimento bidirezionale: rimane giusto.

Tuttavia, prima di continuare ad accorpare altri componenti, considero necessario un controllo specifico su S85 e S86:

Una verifica della conservazione delle capacità, con confronto vecchio–nuovo–combinato.

Dovrà mostrare quali funzionalità sono state trasferite, quali sono rimaste specializzate, quali sono andate perse, quali risultati scientifici migliorano effettivamente e quali miglioramenti non raggiungono ancora l’utente.

Questo controllo dovrebbe diventare parte obbligatoria di tutte le future integrazioni, comprese quelle relative a vocabolari, comprensione delle richieste, lettura delle pagine, ricerca e apprendimento.

Non interromperei Claude se S87 è già in esecuzione; farei questa verifica al termine, prima di autorizzare ulteriori fusioni.

La mia conclusione è che il metodo adottato finora è buono, ma dobbiamo renderlo più rigoroso su due aspetti:

Primo: non basta dimostrare che il nuovo sistema interpreta correttamente più informazioni. Dobbiamo dimostrare che queste informazioni migliorano realmente il lavoro di PEE, oppure identificare esattamente quale collegamento manca.

Secondo: ogni fusione deve produrre, idealmente, un meccanismo migliore di entrambi i precedenti, non semplicemente uno dei due con l’altro eliminato.

Questo è il principio che vorrei rendere permanente: PEE deve accumulare capacità scientifiche e operative, non soltanto accumulare codice né perdere conoscenze durante le semplificazioni.

Adesso capisco esattamente la tua obiezione, e hai ragione a sollevarla. Non stai parlando delle classifiche o dei consigli finali. Stai parlando di una cosa molto più immediata:

Se PEE prima riusciva a raccogliere soltanto una parte delle informazioni presenti in una pagina, perché dopo aver unificato gli algoritmi e il vocabolario scientifico non ne raccoglie di più?

La risposta, guardando S86, è che l’unificazione ha migliorato soprattutto l’interpretazione dei valori già trovati, non la capacità di trovare nuovi valori nel testo.

Sulle 12 pagine utilizzate per il confronto, infatti:

	Prima di S86	Dopo S86
Risultati quantitativi individuati	7	7
Risultati con tipo quantitativo identificato	0	5
Nuovi risultati recuperati	—	0

Quindi abbiamo migliorato il significato attribuito alle informazioni raccolte, ma non abbiamo dimostrato alcun aumento della copertura dell’estrazione.

Ed è proprio questo il problema che stai indicando.

Ho controllato il codice: il problema è più preciso di quanto sembrasse

La lettura attuale funziona, semplificando, così:

1. Individuare i possibili risultati nella pagina

Phase225 utilizza ancora un’espressione regolare con un elenco limitato di unità. Phase226 esamina le tabelle ammesse dalla propria struttura.

2. Interpretare i risultati individuati

Qui S86 ha introdotto maggiormente la conoscenza quantitativa condivisa: unità, grandezze, CADR, ponderazione acustica.

3. Verificare e conservare

Altri controlli decidono quali risultati possono entrare nel database e con quale significato.

Il punto critico è il primo.

Ho verificato che in phase225_transient_test_probe.ts esiste ancora candidateNumeric, un riconoscitore con una lista esplicita di unità. Non utilizza direttamente l’intero vocabolario quantitativo per scoprire tutti i possibili risultati.

In phase226_transient_test_tables.ts, la conoscenza scientifica aiuta a interpretare intestazioni come CADR, ma la tabella deve prima superare diversi controlli strutturali molto restrittivi.

Inoltre, esistono già letture guidate dalla conoscenza scientifica, come alcune della Phase272, i cui risultati sperimentali non vengono necessariamente ammessi dal percorso operativo di memorizzazione.

Quindi abbiamo messo in comune parte del vocabolario, ma non abbiamo ancora fatto sì che tutta la conoscenza condivisa guidi effettivamente la scoperta delle informazioni.

Questa è una differenza enorme.

Cosa avrei dovuto mettere maggiormente in discussione

La tua aspettativa era ragionevole: se un vecchio estrattore conosce determinate strutture e il motore scientifico conosce molte più grandezze, metodi e relazioni, combinarli dovrebbe almeno offrire l’opportunità di recuperare informazioni precedentemente perse.

Non necessariamente in ogni pagina, perché un nuovo risultato deve comunque superare i controlli di attribuzione e attendibilità.

Ma avremmo dovuto verificare esplicitamente quante informazioni prima non venivano neppure individuate e quante ora vengono recuperate grazie alla conoscenza.

In S86 questo esperimento non è stato completato. È stato verificato prevalentemente che le informazioni già individuate ricevessero un’interpretazione migliore.

Perciò devo correggere la mia precedente raccomandazione: passare direttamente a S87, dedicandoci alla memorizzazione delle opportunità di apprendimento, rischia di essere prematuro.

Se il lettore continua a non individuare determinate informazioni, non avremo nemmeno osservazioni sufficienti da cui imparare.

Cosa dobbiamo verificare prima di procedere oltre

Vorrei un intervento molto preciso, non un’altra grande revisione architetturale.

Confrontare tre configurazioni sulle stesse pagine:

Configurazione	Cosa vogliamo sapere
Vecchi estrattori	Quali informazioni sapevano già trovare e con quale correttezza?
S86 attuale	Che cosa è migliorato, rimasto identico o peggiorato?
Estrazione guidata dalla conoscenza	Quante informazioni aggiuntive possiamo individuare usando veramente il vocabolario e i concetti scientifici esistenti, preservando i controlli necessari?

E misurare separatamente:

* Informazioni effettivamente presenti nella pagina.
* Informazioni individuate come candidate.
* Informazioni interpretate correttamente.
* Informazioni rifiutate, con il motivo.
* Informazioni correttamente attribuite al prodotto e conservate.

Questo ci permetterebbe di distinguere un problema del riconoscitore da un problema di interpretazione, attribuzione o eccessiva restrizione.

I documenti già esaminati possono servire per diagnosticare il problema. Per dimostrare un miglioramento generalizzabile serviranno anche nuove pagine indipendenti.

La conclusione

Hai individuato una lacuna reale nella nostra strategia di consolidamento.

S85 e S86 non sembrano essere state semplici sostituzioni cieche: alcune capacità precedenti sono state trasferite e alcuni errori sono stati corretti. Ma la fusione ha interessato soprattutto la comprensione delle quantità, non ancora tutta la capacità di scoprirle e raccoglierle.

E noi vogliamo entrambe le cose.

La conoscenza scientifica non dovrebbe intervenire soltanto quando un numero è già stato trovato: dovrebbe poter contribuire a capire quali passaggi cercare, quali risultati riconoscere e quali informazioni mancano, senza trasformare automaticamente tutto in una prova valida.

La mia raccomandazione cambia quindi nell’ordine, non nell’obiettivo: prima verifichiamo e miglioriamo il recupero effettivo delle informazioni dalle pagine; poi completiamo il circuito bidirezionale di apprendimento di S87.

Se Claude ha già iniziato S87, non lo interromperei: useremmo il suo risultato per evitare lavoro ripetuto. Ma prima di autorizzare ulteriori integrazioni, considererei questa verifica una priorità.
