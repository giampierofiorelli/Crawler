# Owner authorisation of G1 (2026-10-21), verbatim

Received after Crawler commit 243b1d1 (goal-first architectural review). Authorises G1: diagnosis E1–E5 on copies first,
then goal-first knowledge and a goal-first path in shadow, with diagnostic gates. No change to ranking or evidence
guarantees; Phase257 network-read authorisations unchanged; experimental changes on copies; clarify store v10 vs code v14
before any operational persistence change. Decision row: G1-start in `decisions-and-supersessions.md`.

## The owner's message (Italian, unchanged)

Ho esaminato il e i dati della diagnosi.

La revisione conferma che dobbiamo cambiare il punto di ingresso del ragionamento di PEE. Ma non dobbiamo ricominciare da zero.

La scoperta più importante riguarda le 60 richieste esaminate:

Situazione identificata	Richieste
Conoscenza già disponibile e raggiungibile	11
Rimedio senza acquisto già conosciuto, ma irraggiungibile	6
Famiglia conosciuta o documentata, ma non collegata al percorso	8
Rimedio senza acquisto non documentato	9
Famiglia realmente assente	14
Nessuna famiglia da scegliere	12

Quindi attribuire genericamente 49 insuccessi alla mancanza di conoscenza era fuorviante.

In realtà, PEE possiede già parte delle informazioni necessarie, ma la struttura attuale impedisce di raggiungerle partendo da un bisogno.

C’è anche un dato incoraggiante: negli 11 casi in cui la famiglia era già insegnata e raggiungibile, C l’ha individuata in 10. È una diagnosi retrospettiva su un campione piccolo, non una nuova validazione indipendente, ma mostra perché non dobbiamo considerare inutilizzabile tutto il lavoro precedente.

Quale opzione sceglierei?

Autorizzerei G1, ma organizzato in due passaggi con una verifica fra i due.

Non sceglierei soltanto E1–E5, perché il blocco architetturale è già documentato nel codice. D’altra parte, non autorizzerei una migrazione generale del database prima di avere misurato che cosa sblocca concretamente ciascun intervento.

Il percorso dovrebbe essere:

* Diagnosi E1–E5: verificare le cause effettive, distinguendo conoscenza assente, conoscenza irraggiungibile, difetti algoritmici e limiti di rappresentazione.
* G1 incrementale: costruire il livello trasversale dei bisogni e un ingresso goal-first, riutilizzando store, provenienza e moduli esistenti, se gli esperimenti sostengono le scelte tecniche.

Non chiederei a Claude di fermarsi per ogni decisione ordinaria. Può proseguire autonomamente quando le verifiche giustificano il lavoro, fermandosi invece davanti a rischi nuovi o modifiche fondamentali non autorizzate.

Un’ulteriore cautela: Claude riferisce che lo store persistente è ancora alla versione 10 mentre il codice prevede la 14. Questo va chiarito prima di qualsiasi migrazione sullo store operativo, senza presumere che il semplice disallineamento sia un guasto: potrebbe dipendere dal fatto che le nuove strutture sono state deliberatamente utilizzate soltanto sulle copie.

Autorizzazione consolidata per Claude

Allegati necessari: nessuno. Il rapporto architetturale, gli esperimenti precedenti, la ricerca scientifica e le skill sono già nei repository.

PEE — G1: Goal-First Knowledge, with Diagnostic Gates

Autorizzo il prossimo incremento G1, partendo dagli esperimenti controfattuali E1–E5 del rapporto architectural-review-goal-first.md (commit 243b1d1).

L’obiettivo è rendere PEE un consulente scientifico orientato ai bisogni: deve poter comprendere un obiettivo indipendentemente dal prodotto, considerare diverse strategie e categorie, comprese combinazioni e soluzioni senza acquisto, e utilizzare ciò che apprende in nuove situazioni.

Utilizza attivamente pee-guided-learning, le altre skill pertinenti e le capacità già sviluppate. Ti lascio autonomia nella progettazione e negli esperimenti. Le soluzioni architetturali proposte nel rapporto non sono prescrizioni tecniche.

Prima: diagnosi E1–E5

Esegui gli esperimenti su copie, mantenendo invariati i meccanismi che non sono oggetto della prova.

Verifica quanto gli errori dipendano da:

* conoscenza realmente assente;
* conoscenza esistente ma irraggiungibile;
* incapacità di rappresentare strategie trasversali o senza acquisto;
* interpretazione linguistica e attribuzione dei ruoli;
* integrazione tra moduli.

Non considerare dimostrate le classificazioni retrospettive. Conserva i risultati originali e distingui gli esperimenti diagnostici dalla successiva validazione indipendente.

Poi: sviluppo G1

Se la diagnosi conferma i presupposti, procedi autonomamente con un’estensione compatibile della conoscenza e un percorso goal-first inizialmente in ombra.

La conoscenza deve poter collegare obiettivi, situazioni, possibili cause, strategie, meccanismi, categorie, condizioni ed evidenze, senza imporre che ogni bisogno appartenga a una categoria.

Confronta alternative che riutilizzino lo store esistente. Non presumere necessaria una migrazione generalizzata dei campi category_id; scegli la soluzione che meglio conserva compatibilità, provenienza, revisioni e ricostruibilità.

Intervieni anche sui difetti algoritmici e di integrazione dimostrati, senza mascherarli con ulteriori sinonimi, soglie arbitrarie, domande all’utente o nuove ricerche.

Distingui:

* ciò che l’utente ha espresso;
* ciò che PEE ipotizza;
* ciò che la conoscenza scientifica sostiene;
* ciò che resta sconosciuto;
* ciò che richiede ricerca;
* ciò che può essere deciso sulla base delle evidenze.

Una domanda all’utente deve risolvere un’incertezza realmente sua, non compensare un difetto del software.

Ricerca e apprendimento

Prepara il collegamento fra lacune di conoscenza e richieste di ricerca tipizzate, anche in assenza di una categoria.

L’obiettivo futuro resta la ricerca online autonoma, con acquisizione scientifica cumulativa. In questo incremento non modificare unilateralmente le autorizzazioni alle letture di rete stabilite da Phase257.

Prima di intervenire sulla persistenza operativa, chiarisci il disallineamento segnalato fra store v10 e codice v14. Proteggi snapshot, valutazioni, giornale e dati esistenti. Le modifiche sperimentali restano su copie.

Validazione e autonomia

Preregistra confronti, metriche, campioni e criteri di arresto. Valuta separatamente richieste con conoscenza disponibile, conoscenza irraggiungibile, strategie senza acquisto, conoscenza assente e nessuna categoria necessaria.

Usa materiale indipendente per le conclusioni di generalizzazione e dichiara il livello effettivo di indipendenza. Verifica anche falsi collegamenti, ipotesi inventate, astensioni ingiustificate, informazioni perse e regressioni.

Il nuovo ragionamento resta in ombra finché non viene validato. Eventuali correzioni circoscritte al percorso operativo richiedono test e differenze spiegate; non autorizzo modifiche a ranking o garanzie sulle evidenze.

Mantieni il lavoro proporzionato: riutilizza esperimenti e materiali esistenti, limita le riformulazioni e non ampliare l’incarico a nuove categorie o a una ricostruzione generale.

Puoi procedere senza interrompermi per scelte tecniche ordinarie. Se gli esperimenti smentiscono un presupposto fondamentale, fermati sulla parte interessata e proponi l’alternativa, proseguendo dove giustificato.

Risultato atteso: un miglioramento misurabile nella capacità di PEE di partire dal bisogno, raggiungere conoscenza pertinente, riconoscere correttamente ciò che manca e considerare più strategie, senza aumentare errori o inferenze ingiustificate.

Consegna il rapporto distinguendo implementazione, risultati sperimentali, validazione indipendente, limiti e prerequisiti per la futura integrazione operativa.

Questo è il punto su cui insisterei: non stiamo abbandonando gli algoritmi C e N1, ma stiamo rimuovendo una dipendenza architetturale che potrebbe impedirgli di esprimere le proprie capacità.

Il successo di G1 non sarà semplicemente riconoscere più categorie. Sarà dimostrare che, quando una persona descrive un problema, PEE riesce a raggiungere la conoscenza corretta, considerare le alternative appropriate e distinguere ciò che è supportato da ciò che richiede ancora indagine.
