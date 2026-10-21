# Owner review of the third increment (2026-10-21), verbatim

Received after Crawler commit aba3370 (third-increment report). **It authorises no implementation.** The owner asks for
an architectural review before any fourth increment ("Terrei questa come decisione da integrare nella prossima revisione
consolidata, non come un nuovo prompt da inviare subito a Claude."). Decision row: I3-review in
`decisions-and-supersessions.md`; roadmap entry of the same date. R3 stays the current step.

## Facts in the review checked against the repository (Claude, 2026-10-21)

| Statement in the review | Where it was checked | Result |
|---|---|---|
| Generic needs exist as a fixed list | `src/phase248_advisory_journey.ts:72` (`GENERIC_NEEDS250`) | confirmed |
| Research needs wait for authorisation | `src/phase254_research_needs.ts`, `src/phase257_research_planning.ts` (`pending_authorization`) | confirmed |
| An "out of scope" state exists | e.g. `src/experience_cases.ts:76` (`out_of_scope`) | confirmed |
| Relations are keyed by category | `src/phase247_category_relations.ts:19` (`categoryId`) | confirmed |
| The category registry carries cue words such as damp, condensation, humidity | `src/phase248_category_registry.ts:17` | confirmed |
| C's thresholds | `C_PARAMS` in `src/goal_understanding_c.ts`: maxSpread 3, minShared 2, hypothesisScore 2.5, keepShare 0.5, maxHypotheses 3, commitScore 7, commitLead 3, topItems 3 | confirmed |
| Object roles were not shown to work | `evaluation/i3/c-check-firstrun.json`: 16 of 18 objects found, 7 of 18 roles correct | confirmed; report corrected in `docs/plans/third-increment-report.md` §8 |

## The owner's message (Italian, unchanged)

Ho verificato il .

Claude ha fatto bene a non promuovere nessuna delle due capacità. Ma questo esperimento ci permette di distinguere meglio tre problemi che finora tendevamo a considerare insieme: mancanza di conoscenza, interpretazione sbagliata della conoscenza e decisione sbagliata su quando utilizzarla.

1. Il risultato più importante non è il 14% sulle tabelle

È il comportamento di C davanti ai problemi che PEE non conosce.

Conoscenza disponibile sulle 60 nuove richieste

Famiglia conosciuta: 11

Non conosciuta: 49

Famiglie inventate

11 → 25

Percorso attuale → C

Impegni ingiustificati

12 → 16

Percorso attuale → C

PEE non dovrebbe confondere la soluzione più plausibile tra quelle conosciute con una soluzione effettivamente giustificata per il problema dell’utente.

Questo errore è più importante di una semplice categoria non riconosciuta.

E c’è una sottigliezza: non dobbiamo correggerlo imponendo soltanto che una certa percentuale delle parole dell’utente corrisponda alle conoscenze. Rischieremmo di penalizzare proprio le inferenze scientifiche che vogliamo sviluppare.

Serve una valutazione della pertinenza del significato, delle condizioni e delle controprove, non soltanto della somiglianza lessicale.

2. Anche la distinzione tra oggetti non è ancora affidabile

Claude riferisce che C distingue prodotti richiesti, posseduti, di contesto e rifiutati.

A livello di rappresentazione è vero. Ma sui nuovi casi:

* 16 oggetti riconosciuti su 18 presenti nel vocabolario;
* soltanto 7 ruoli correttamente assegnati su 18.

Quindi N0 e C hanno acquisito un linguaggio strutturato per descrivere il problema, ma non sanno ancora popolarlo con sufficiente accuratezza.

È un esempio concreto della differenza fra implementazione e capacità dimostrata.

3. Sulle tabelle scientifiche abbiamo appreso qualcosa di prezioso

Il modello appreso funzionava meglio sul materiale già utilizzato, ma molto peggio sulle nuove strutture.

Questo non significa che apprendere le relazioni sia un approccio sbagliato. Significa che il metodo ha imparato regolarità specifiche dei documenti di sviluppo, anziché una rappresentazione sufficientemente generale del loro significato.

Il problema delle colonne verification è emblematico: possono contenere una proprietà da verificare oppure il metodo con cui farlo. Le parole dell’intestazione non sono sufficienti per decidere.

Il prossimo miglioramento dovrebbe nascere dalla comprensione del ruolo dell’informazione all’interno del documento, non dall’aggiunta di sinonimi o da un ulteriore addestramento sulle stesse strutture.

4. Cosa raccomando per il prossimo lavoro

Non rifarei il terzo incremento, né cancellerei il codice sviluppato.

Organizzerei invece il seguito intorno a tre risultati misurabili:

Capacità	Cosa deve migliorare
Conoscenza dei propri limiti	Distinguere il problema conosciuto, quello solo parzialmente coperto e quello fuori conoscenza, senza aumentare le astensioni inutili
Interpretazione semantica	Collegare richieste e fonti in base ai ruoli di situazioni, obiettivi, proprietà, funzioni e metodi, non a coincidenze di parole
Generalizzazione scientifica	Interpretare correttamente relazioni e condizioni su strutture documentali effettivamente nuove, con pochi collegamenti inventati

Aggiungerei una distinzione fondamentale alla valutazione: i 49 casi fuori conoscenza sono ottimi per verificare le astensioni e le ipotesi inventate, ma non bastano a misurare quanto bene PEE ragioni quando la conoscenza pertinente esiste. Occorrono campioni separati e adeguati per entrambi gli scenari.

Infine, eviterei di continuare a usare ripetutamente gli stessi pacchetti scientifici come se fossero nuovi. Per dimostrare davvero la generalizzazione documentale servirà materiale con strutture differenti e un protocollo di indipendenza dichiarato.

5. La direzione complessiva di PEE resta giusta?

Sì, ma questi risultati ci dicono che dobbiamo migliorare il modo in cui PEE acquisisce e applica ciò che conosce, non semplicemente aumentare il numero delle informazioni disponibili.

Il sistema oggi ha:

* una base scientifica e meccanismi di provenienza;
* un modello N0 e un percorso C sperimentale;
* una rappresentazione N1 più ricca delle relazioni documentali;
* controlli che impediscono alle nuove inferenze non validate di influenzare le risposte.

Non possiede ancora una capacità generale dimostrata di interpretare correttamente nuovi problemi e nuove relazioni scientifiche.

La roadmap R3–R7 continua quindi ad avere senso. Non dobbiamo perdere di vista R4, la lettura quantitativa e qualitativa, l’attribuzione e il futuro apprendimento delle categorie: sono parte dello stesso problema.

La mia raccomandazione è non inviare immediatamente un quarto prompt. Prima utilizzerei questo rapporto per definire il prossimo obiettivo di capacità, lasciando a Claude autonomia sui metodi e preservando i risultati già acquisiti.

Il traguardo da cercare ora non è una nuova funzionalità isolata: è che PEE sappia riconoscere quando la propria conoscenza è pertinente, quando è insufficiente e quando è contraddetta dalle condizioni del problema. Solo allora potrà utilizzarla con maggiore affidabilità per comprendere, ricercare e consigliare.

Credo che tu abbia individuato una questione fondamentale per PEE: abbiamo iniziato a sviluppare un sistema che riconosce categorie di prodotti, ma il nostro obiettivo è costruire un consulente che capisce i problemi delle persone e trova le soluzioni più giustificate dalle prove.

Queste due cose non sono equivalenti. La categoria è importante quando serve a valutare prodotti confrontabili, ma non dovrebbe necessariamente essere il punto di partenza.

E hai ragione anche sull’altra questione: PEE deve poter cercare autonomamente nuove conoscenze quando scopre di non sapere abbastanza. Altrimenti rischiamo di costruire un sistema che diventa bravo soltanto nelle categorie che abbiamo già studiato.

1. Il sito web non deve necessariamente diventare una chat

Non scarterei l’idea originale. La evolverei.

Un sito può avere un’interfaccia dinamica e intelligente, senza presentarsi come una conversazione continua. Non è affatto un approccio superato: le domande strutturate possono essere più veloci, soprattutto da iPhone, quando l’utente deve chiarire un unico punto.

Il cambiamento che farei è questo: non decidere anticipatamente che dopo ogni domanda debba esserci un questionario o una conversazione.

PEE dovrebbe determinare prima se possiede già informazioni sufficienti per offrire risultati affidabili. Se sì, li mostra. Se manca un’informazione decisiva che soltanto l’utente può conoscere, chiede il minimo necessario. Se manca conoscenza scientifica o sui prodotti, la ricerca anziché trasferire il problema all’utente.

Questo mantiene l’esperienza web che avevamo immaginato, ma rende il funzionamento sottostante molto più intelligente.

2. Il bisogno dovrebbe diventare il centro della conoscenza di PEE

Sì. Credo che questa sia la modifica concettuale più importante da prendere in considerazione.

Oggi buona parte della conoscenza scientifica di PEE è organizzata dentro categorie di prodotti. Questo è utile per valutare una lavastoviglie o una friggitrice, ma diventa un limite quando l’utente esprime un obiettivo che può essere raggiunto in modi diversi.

Prendiamo un esempio.

Richiesta dell’utente

“I want to reduce condensation and dampness in my bedroom.”

Obiettivo: ridurre umidità e condensazione

Situazione, cause possibili, condizioni ambientali, vincoli dell’utente

Deumidificazione

Rimuovere umidità dall’aria

Ventilazione

Gestire il ricambio d’aria

Isolamento

Ridurre superfici fredde

Intervento edilizio

Risolvere infiltrazioni o difetti

Possibili strategie da investigare, non raccomandazioni equivalenti o già validate. La causa del problema determina quali siano appropriate.

Noterai che alcune soluzioni richiedono un prodotto, altre un intervento e altre ancora potrebbero utilizzare qualcosa che l’utente possiede già.

Questo ci porta a una decisione molto importante:

PEE dovrebbe prima comprendere l’obiettivo, poi investigare le strategie che possono soddisfarlo, e soltanto successivamente identificare le categorie di prodotti pertinenti.

Non significa eliminare le categorie. Significa renderle uno degli strumenti per raggiungere un obiettivo, non l’unica porta d’ingresso alla conoscenza.

Questa capacità esiste già in parte?

Ho controllato direttamente il codice.

In esiste già GENERIC_NEEDS250, con bisogni trasversali come facilità di pulizia, rumore contenuto, portabilità, durata e manutenzione ridotta.

Quindi non partiamo da zero.

Ma questi bisogni generici non costituiscono ancora un sistema scientifico completo per collegare un obiettivo a più strategie, categorie, meccanismi ed evidenze.

Io svilupperei questa capacità nell’architettura della conoscenza già esistente, senza creare un secondo motore.

3. Quando è davvero necessario identificare la categoria?

Qui farei una distinzione che cambierebbe anche il modo di valutare PEE.

Tipo di richiesta	Cosa dovrebbe fare PEE
“Quale lavastoviglie lava meglio?”	Identificare correttamente la categoria richiesta e valutarla
“Voglio eliminare le macchie difficili dai vestiti”	Comprendere il risultato, poi considerare strategie e prodotti pertinenti
“Ho già un deumidificatore, ma la stanza resta umida”	Riconoscere il prodotto posseduto senza trattarlo come un nuovo acquisto
“Mi serve qualcosa che migliori l’aria in casa”	Distinguere i possibili problemi e chiarire ciò che conta, senza forzare una categoria
“Cerco un prodotto di una categoria che PEE non conosce”	Riconoscere che manca conoscenza e avviare una ricerca appropriata

Questo permette di distinguere tre fallimenti completamente diversi.

Primo: l’utente nomina esplicitamente la categoria, ma PEE non la riconosce. È un errore di interpretazione linguistica o di copertura del vocabolario.

Secondo: l’utente descrive soltanto un bisogno e PEE non individua possibili soluzioni. Qui può mancare la conoscenza che collega bisogni e strategie.

Terzo: PEE riconosce una famiglia plausibile, ma non ha sufficienti prove per valutare i prodotti. Questo è un problema di ricerca ed evidenza, non di comprensione della categoria.

Nei nostri esperimenti questi problemi sono stati talvolta misurati insieme. È uno dei motivi per cui i punteggi non descrivono ancora precisamente quale capacità manca.

4. La ricerca online deve tornare a essere una componente fondamentale

Qui concordo particolarmente con te.

Ho verificato .

PEE dispone già di meccanismi che identificano lacune nelle prove e preparano attività di ricerca. Ma nel percorso esaminato le attività sono ancora registrate come pending_authorization, e la pianificazione richiede generalmente una categoria conosciuta.

Inoltre, può restituire out_of_scope quando manca conoscenza sulla categoria.

Questo dimostra che il comportamento originale che desideravamo — riconoscere una lacuna e avviare autonomamente la ricerca pertinente — non è ancora collegato al percorso operativo generale. Esistono componenti di ricerca e navigazione, ma non basta possederli separatamente.

Immagino un PEE capace di distinguere:

* Manca un chiarimento dell’utente: chiede l’informazione essenziale.
* Manca conoscenza scientifica: cerca fonti autorevoli, studia e conserva ciò che apprende.
* Mancano prove su prodotti specifici: ricerca test originali e dati pertinenti.
* La conoscenza è contraddittoria: indaga le differenze di metodo, condizioni e attribuzione.

La ricerca dovrebbe seguire le regole esistenti su diritti, provenienza, costi, indipendenza e arresto. Non tutto ciò che viene trovato online deve diventare automaticamente conoscenza verificata.

E soprattutto: la ricerca di nuove categorie dovrebbe essere possibile anche quando PEE inizialmente non sa come chiamarle.

5. Le correzioni che Claude sta facendo sono nel codice o nella conoscenza?

Questa è una domanda molto importante. Ho esaminato il codice effettivo, non soltanto i rapporti.

La risposta è: entrambe le cose. E una parte considerevole della logica di interpretazione è ancora costituita da euristiche scritte nel codice.

Cosa ho trovato

Nel modulo , Claude ha introdotto parametri come:

Esempi dal codice

minShared: 2 — almeno due parole informative condivise

hypothesisScore: 2.5 — punteggio minimo per un’ipotesi

commitScore: 7 — punteggio per scegliere una famiglia

commitLead: 3 — vantaggio relativo richiesto

Queste sono soglie fissate nel codice e sviluppate attraverso esperimenti, non principi scientifici appresi autonomamente da PEE.

Il problema più evidente è proprio commitLead: una famiglia può dominare tutte le altre anche quando nessuna spiega adeguatamente la richiesta.

Questo è coerente con la diagnosi di Claude sugli 11 impegni ingiustificati attribuiti alla regola di dominanza relativa.

In , invece, troviamo regole per interpretare le intestazioni e costruire i collegamenti. Parte del vocabolario è stata collocata nei file JSON, mentre Claude ha anche prodotto modelli statistici appresi dalle annotazioni.

Questi ultimi sono un vero tentativo di apprendimento dai dati, ma hanno generalizzato male sulle tabelle nuove.

Infine, il registro delle categorie contiene ancora associazioni esplicite come damp, condensation, humidity per i deumidificatori, in .

Queste associazioni possono essere utili come indizi, ma non dovrebbero trasformarsi automaticamente in una conclusione.

Questo è sbagliato?

Non necessariamente. Il codice deve contenere regole generali di interpretazione e controllo. Non tutto deve essere appreso.

Per esempio, distinguere una negazione da un’affermazione, preservare la provenienza o proibire la promozione di conoscenza non verificata sono comportamenti che devono essere garantiti.

Ma una regola come «se trovo due parole simili, considero pertinente questa categoria» non dovrebbe sostituire la comprensione scientifica del collegamento fra il problema e la soluzione.

Perciò distinguerei:

Regole permanenti di ragionamento: come trattare incertezza, condizioni, negazioni, prove e revisioni.

Conoscenza scientifica appresa: quali meccanismi possono produrre determinati risultati, in quali condizioni e con quali limiti.

Euristiche linguistiche: strumenti provvisori per riconoscere espressioni, che devono poter essere migliorati attraverso esperimenti e non proliferare indefinitamente nel codice.

Attualmente PEE possiede tutti e tre gli elementi, ma non li separa ancora in maniera sufficientemente uniforme.

6. Come immagino oggi l’esperienza web

ESEMPIO CONCETTUALE — NON UNA FUNZIONE GIÀ IMPLEMENTATA

What are you trying to achieve?

I want to reduce humidity in my bedroom, especially during winter.

Goal understood: reduce excessive indoor humidity

Exploring possible approaches

Checking relevant scientific knowledge and evidence

Comparing potentially suitable solution families

One useful clarification, only if needed

Is the humidity mainly caused by condensation on cold windows, or do you also have damp walls?

The actual choices would depend on the evidence available and the uncertainty that matters.

Questo non è una chat tradizionale. È una pagina che aggiorna progressivamente la propria comprensione e mostra risultati, approfondimenti o richieste di chiarimento quando servono.

E se la conoscenza è sufficiente, PEE dovrebbe andare direttamente alla valutazione senza costringere l’utente a rispondere.

7. Cosa cambierei nella direzione del progetto

Non chiederei a Claude di correggere un’altra serie di parole che provocano errori.

Proporrei invece di rivedere il modello concettuale dell’intero percorso, preservando però le capacità già realizzate.

La sequenza di riferimento diventerebbe:

Richiesta in linguaggio naturale

Bisogno, obiettivo, situazione e vincoli

Conoscenza disponibile e sufficienza delle informazioni

Risultati

Quando sono giustificati

Chiarimento

Quando serve l’utente

Ricerca

Quando manca conoscenza

Strategie → categorie pertinenti → prodotti → evidenze

Con possibilità di più strategie, nessun acquisto e confronto tra categorie

Non dovrebbe essere una pipeline rigida: ricerca, chiarimento e valutazione possono ripetersi, e una categoria nominata esplicitamente può già essere nota fin dall’inizio.

Questo sarebbe un cambiamento abbastanza profondo rispetto al percorso attuale, ma non richiede necessariamente di buttare via il lavoro di questi mesi.

N0, N1, lo store scientifico, i moduli di ricerca, l’attribuzione e le regole di valutazione potrebbero diventare componenti di un percorso più generale.

La decisione che ti suggerisco

Non produrrei ancora un quarto prompt di implementazione.

Prima di investire altri crediti di Claude in correzioni successive, vorrei fissare un principio progettuale:

PEE è un consulente orientato agli obiettivi, non un classificatore di categorie con un motore di raccomandazione aggiunto.

Questo deve valere per la conoscenza scientifica, la ricerca autonoma, la valutazione delle prove e l’interfaccia web.

Poi farei esaminare a Claude, usando le skill già costruite, quali parti dell’architettura attuale supportano già questo comportamento e quali richiedono modifiche sostanziali. Non lo obbligherei a difendere l’architettura esistente, ma nemmeno a ricominciare da zero.

La domanda chiave non è più soltanto «quale categoria ha riconosciuto?», ma «ha compreso l’obiettivo, sa quali conoscenze gli mancano e può trovare il percorso più giustificato per soddisfarlo?»

Penso che questa sia la direzione più coerente con ciò che hai sempre voluto ottenere da PEE.

Esattamente. E credo che questo debba diventare uno dei principi fondamentali di PEE: quando il sistema riconosce un’incertezza significativa, deve cercare attivamente di risolverla, anziché limitarsi a dichiarare che non sa.

Possiamo recuperare il meglio degli esperimenti precedenti, anche quelli che non hanno superato le soglie di validazione, distinguendo però i meccanismi promettenti da quelli già sufficientemente affidabili per l’uso operativo.

La differenza importante è che PEE non deve reagire a tutte le incertezze nello stesso modo.

Come dovrebbe funzionare

PEE comprende la richiesta e valuta ciò che sa

Bisogno, situazione, vincoli, strategie e qualità delle evidenze

Conoscenza sufficiente

Procede direttamente verso soluzioni e prodotti giustificati.

Manca conoscenza

Consulta la memoria, ricerca fonti e acquisisce nuove evidenze.

Manca un dato dell’utente

Formula una domanda mirata, anche con risposte multiple nell’interfaccia web.

Evidenze insufficienti o contrastanti

Indaga ulteriormente, presenta risultati condizionati oppure si astiene.

Rivalutazione dopo l’intervento

Procedere, ricercare ancora, chiarire o arrestarsi con motivazione

Attenzione alla certezza percentuale

Qui farei una precisazione importante.

Non possiamo stabilire arbitrariamente che, ad esempio, con una certezza dell’85% PEE debba procedere e con il 75% debba fare una ricerca.

Una percentuale è utile soltanto se è calibrata e verificata sperimentalmente. Un punteggio di somiglianza fra parole o un vantaggio rispetto alla seconda categoria non equivale a una probabilità dell’85% di essere nel giusto.

Inoltre, alcune decisioni richiedono prove specifiche indipendentemente dalla percentuale: un prodotto non può essere dichiarato efficace soltanto perché il sistema è molto sicuro della propria interpretazione.

Preferirei quindi un modello che consideri contemporaneamente:

* Incertezza interpretativa: ha capito ciò che l’utente desidera?
* Copertura della conoscenza: dispone dei principi scientifici pertinenti?
* Sufficienza delle evidenze: può davvero sostenere la conclusione?
* Valore di una nuova informazione: cercare o chiedere chiarimenti può cambiare significativamente la decisione?

Le soglie quantitative possono essere apprese e calibrate in seguito, con dati indipendenti.

Il punto più interessante: imparare a risolvere le proprie lacune

Immagina che un utente chieda come ridurre l’umidità in camera da letto.

PEE comprende il problema, ma non sa ancora quale strategia sia appropriata.

Invece di scegliere immediatamente i deumidificatori, potrebbe verificare le conoscenze su condensazione, ventilazione, temperatura e infiltrazioni. Se queste non sono sufficienti, avvia una ricerca mirata. Se scopre che il fattore decisivo è un’informazione che soltanto l’utente può fornire, chiede quella.

La conoscenza scientifica acquisita resta disponibile per altre richieste, mentre le ipotesi non ancora validate rimangono separate.

Così ogni lacuna diventa potenzialmente un’occasione di apprendimento permanente.

Questo non significa cercare indefinitamente: servono condizioni di arresto basate sulla sufficienza, sul valore atteso di ulteriori ricerche, sui costi e sui risultati già ottenuti.

E gli esperimenti precedenti?

Io conserverei e integrerei progressivamente:

* la rappresentazione dei bisogni e delle posizioni dell’utente sviluppata in N0;
* la rappresentazione delle relazioni scientifiche e della loro provenienza sviluppata in N1;
* la possibilità, introdotta sperimentalmente in C, di formulare più ipotesi e distinguere un’ipotesi da una richiesta confermata.

Non promuoverei invece le euristiche che hanno aumentato le famiglie inventate o interpretato erroneamente le relazioni delle tabelle. Quelle devono essere migliorate e validate prima.

In definitiva, PEE dovrebbe essere un sistema che non si limita a misurare quanto è sicuro, ma decide che cosa fare per diventare sufficientemente informato.

E soprattutto la categoria del prodotto non dovrebbe essere obbligatoria per iniziare questo processo.

Questa è la direzione che suggerirei di formalizzare nella prossima revisione architetturale, prima del successivo incremento di implementazione.

Sono pienamente d’accordo. E questa è una correzione fondamentale alla direzione che stavamo definendo.

Non dobbiamo permettere che PEE utilizzi l’incertezza o la mancanza di conoscenza come giustificazione per un algoritmo che non funziona abbastanza bene.

Anzi, dobbiamo distinguere due responsabilità completamente diverse:

* PEE deve saper gestire le incertezze reali del problema dell’utente.
* PEE deve saper individuare quando l’incertezza è prodotta dai propri limiti tecnici, da errori algoritmici o da problemi negli altri moduli.

La seconda responsabilità è essenziale per l’apprendimento operativo che vogliamo costruire.

1. Un errore non significa necessariamente che manca conoscenza

Consideriamo cinque situazioni.

Situazione	Problema reale	Intervento appropriato
La conoscenza scientifica non esiste nello store	Lacuna conoscitiva	Ricercare e acquisire conoscenza
La conoscenza esiste, ma PEE non la trova	Errore di recupero	Migliorare ricerca interna e collegamenti
PEE trova la conoscenza, ma la interpreta male	Errore algoritmico	Correggere e validare il metodo
Un modulo precedente fornisce informazioni sbagliate	Errore di integrazione	Individuare e correggere il modulo responsabile
Il problema richiede informazioni che soltanto l’utente conosce	Ambiguità autentica	Chiedere chiarimenti

Soltanto l’ultima situazione giustifica automaticamente una domanda all’utente. E soltanto la prima giustifica, di per sé, una nuova ricerca scientifica.

Non dobbiamo confondere la ricerca su Internet con la correzione degli algoritmi.

2. Gli esperimenti precedenti dimostrano perché è importante

Abbiamo già due esempi concreti.

C — Comprensione degli obiettivi

Claude ha rilevato che 49 delle 60 richieste riguardavano famiglie di prodotti non presenti nella conoscenza insegnata.

Questo spiega una parte delle difficoltà, ma non dimostra che l’algoritmo C sia valido.

Infatti, abbiamo osservato anche attribuzioni ingiustificate, interpretazioni errate dei ruoli degli oggetti e corrispondenze fondate su parole casualmente condivise.

Questi problemi non si risolvono semplicemente insegnando altre categorie.

N1 — Lettura delle relazioni scientifiche

Il modello appreso è passato da un F1 di 0,59 durante lo sviluppo a 0,14 sulle nuove strutture.

Qui il problema non era soltanto la quantità di conoscenza scientifica disponibile: il metodo aveva appreso associazioni che non generalizzavano.

Aggiungere altre dichiarazioni allo store non correggerebbe automaticamente questo difetto.

3. Come possiamo distinguere le cause

Introdurrei un principio di diagnosi controfattuale dei fallimenti.

Per esempio, quando PEE non comprende una richiesta, durante gli esperimenti possiamo verificare cosa accadrebbe fornendo temporaneamente alcune informazioni corrette al modulo interessato.

Esempio diagnostico: richiesta non compresa

Test A — Esecuzione normale

PEE non riconosce il bisogno.

Test B — Forniamo sperimentalmente la categoria corretta

Se ora riconosce il bisogno, sappiamo che il riconoscimento della categoria è almeno uno degli ostacoli.

Test C — Forniamo anche la relazione scientifica corretta

Se il risultato cambia, possiamo isolare il contributo dell’acquisizione o interpretazione della conoscenza.

Test D — Controlliamo il ragionamento finale

Se PEE continua a sbagliare anche con input corretti, il problema si trova nel ragionamento successivo o nelle sue integrazioni.

Sono interventi sperimentali su copie o percorsi isolati, non informazioni artificiali da inserire nelle risposte operative. Ogni test identifica una possibile dipendenza causale, non necessariamente una causa unica.

In questo modo possiamo stabilire quale componente limita il risultato, anziché attribuire genericamente l’errore alla mancanza di conoscenza.

Questo metodo, in parte, è già stato utilizzato in R3-P, quando fornire la categoria corretta ha migliorato sensibilmente il riconoscimento dei bisogni. Dobbiamo renderlo una pratica riutilizzabile.

4. Ci sono quindi due cicli di miglioramento

Il primo è quello operativo, rivolto all’utente. PEE cerca conoscenza mancante, verifica le evidenze, identifica eventuali chiarimenti necessari e produce il miglior risultato giustificato possibile.

Il secondo è quello dell’apprendimento del sistema. Quando fallisce, registra il tipo di errore, ne ricerca le cause, confronta soluzioni, verifica se la correzione generalizza e conserva soltanto i miglioramenti dimostrati.

La cosa interessante è che i due cicli possono alimentarsi reciprocamente.

Una ricerca fallita può insegnare a PEE che un determinato tipo di documento richiede un metodo di lettura diverso. Una richiesta interpretata male può rivelare un limite generale nel riconoscimento degli obiettivi. Un confronto sbagliato può evidenziare condizioni scientifiche non conservate correttamente.

Ma non tutto deve essere corretto automaticamente nell’ambiente operativo: modifiche ad algoritmi, soglie o regole devono essere valutate su dati indipendenti, con possibilità di rollback.

5. Il principio che aggiungerei a PEE

Lo formulerei così:

L’incertezza non è automaticamente una lacuna di conoscenza. Prima di decidere come colmarla, PEE deve distinguere tra insufficienza delle informazioni disponibili, fallimento nel recuperarle, errore di interpretazione, difetto algoritmico e problema di integrazione. Ogni fallimento deve contribuire a individuare e migliorare il meccanismo responsabile, senza mascherare capacità non ancora dimostrate.

Aggiungerei inoltre che un algoritmo non va considerato adeguato soltanto perché riesce a riconoscere quando fallisce. Deve essere valutato anche per la sua capacità di risolvere correttamente i casi per i quali dispone degli input e della conoscenza necessari.

Questo cambia molto la nostra strategia: non dobbiamo scegliere fra migliorare gli algoritmi e insegnare nuova conoscenza. Dobbiamo costruire un sistema capace di capire quale delle due cose manca, oppure se entrambe sono necessarie.

E soprattutto dobbiamo continuare a migliorare il software, senza trasformare domande all’utente, astensioni e ricerche aggiuntive in scorciatoie che nascondono i difetti dell’architettura.

Terrei questa come decisione da integrare nella prossima revisione consolidata, non come un nuovo prompt da inviare subito a Claude.

Sì, credo che tu abbia individuato una lacuna reale nell’architettura di PEE. Ti correggerei soltanto su un punto: abbiamo già lavorato sulla conoscenza dei bisogni, anche in maniera approfondita sul piano della ricerca. Quello che non abbiamo ancora dimostrato è che PEE sappia utilizzare autonomamente quella conoscenza per scoprire, interpretare e collegare bisogni che attraversano più categorie di prodotti.

Finora abbiamo concentrato molta attenzione su questa sequenza:

Richiesta → categoria → bisogni pertinenti alla categoria → criteri → prodotti.

Ma quando l’utente esprime soltanto un obiettivo, potremmo aver bisogno della sequenza inversa:

Richiesta → bisogno o problema → possibili cause → strategie risolutive → categorie eventualmente pertinenti → prodotti.

Le due capacità devono coesistere. Non dobbiamo sostituire la prima con la seconda.

La tua osservazione è particolarmente importante perché potrebbe spiegare una parte degli insuccessi di C: stiamo chiedendo all’algoritmo di riconoscere famiglie di prodotti senza avergli ancora insegnato sufficientemente come un bisogno possa collegarsi a molteplici soluzioni, anche appartenenti a categorie differenti.

Cosa abbiamo fatto finora, e cosa manca

Ho controllato nuovamente il codice e la ricerca sui bisogni già prodotta.

Lavoro precedente	Stato effettivo
Ricerca scientifica su bisogni espliciti e impliciti	Ampia ricerca effettuata
Insegnamento dei bisogni per singole categorie (Phase250)	Implementato, con risultati limitati
Riconoscimento di bisogni trasversali come rumore, portabilità e facilità d’uso	Presente, ma elementare
Distinzione tra desideri, vincoli, preferenze e ipotesi (N0)	Implementata in modalità sperimentale
Relazioni scientifiche tra situazioni, criteri e prove (N1)	Rappresentazione sviluppata, interpretazione non validata
Conoscenza generale bisogno → strategie → più categorie	Non risulta sviluppata né validata come capacità integrata

La ricerca precedente, , riconosceva già il problema: mancava una relazione tipizzata operativa fra la situazione dell’utente e il risultato desiderato.

Nel codice attuale, inoltre, le relazioni scientifiche di phase247_category_relations.ts sono ancora associate a una categoryId. Questo ne limita l’utilizzo naturale per ragionamenti che attraversano categorie differenti.

Quindi abbiamo studiato il problema, ma non abbiamo ancora completato il passaggio dalla conoscenza scientifica sulle categorie alla conoscenza generale dei bisogni e delle possibili soluzioni.

La distinzione che finora ci è mancata

Non tutti i bisogni trasversali sono dello stesso tipo.

Prendiamo low noise (poco rumore). È una qualità desiderabile in aspirapolvere, lavatrici, deumidificatori e purificatori. Il criterio tecnico per valutarla, però, dipende dall’apparecchio, dalla modalità operativa e dall’ambiente.

Prendiamo invece I want to sleep better (voglio dormire meglio). È un obiettivo più generale, che potrebbe richiedere di capire se il problema sia rumore, temperatura, luce, umidità o altro.

Il secondo caso richiede un ragionamento che precede la scelta del prodotto.

Obiettivo trasversale

Dormire meglio

Rumore

Ridurre i disturbi acustici

Temperatura

Migliorare il comfort termico

Luce

Ridurre la luce indesiderata

Umidità

Gestire condizioni ambientali problematiche

Strategie e possibili famiglie di soluzioni

Da valutare in base alla causa, alle condizioni e alle prove disponibili

Nessuna di queste interpretazioni può diventare automaticamente il bisogno confermato dell’utente. Sono possibilità da investigare.

Cosa significherebbe insegnare davvero i bisogni a PEE

Immagino che la conoscenza scientifica debba permettere al sistema di comprendere una struttura simile a questa:

Obiettivo → situazione → possibili ostacoli o cause → strategie → meccanismi → categorie o combinazioni → criteri di valutazione → evidenze.

Un obiettivo può essere condiviso da molte categorie. Una strategia può richiedere più prodotti, oppure nessun acquisto. Una categoria può soddisfare più obiettivi, ma con efficacia e condizioni differenti.

E soprattutto, i collegamenti devono essere sostenuti da conoscenza scientifica con provenienza, qualificazioni e possibili controprove. Non basta associare parole come humidity e dehumidifier.

La conoscenza dovrebbe restare indipendente dalla prima categoria studiata. Quando PEE apprende un nuovo meccanismo, dovrebbe poter verificare se quel principio è applicabile anche ad altri problemi o categorie, senza assumere che lo sia automaticamente.

Questo spiega i risultati negativi di C?

Potenzialmente in parte, ma non possiamo ancora dimostrarlo.

L’esperimento C cercava famiglie attraverso concetti e dichiarazioni già associati alle categorie. Non disponeva di un livello sufficientemente sviluppato di conoscenza trasversale sulle strategie.

Tuttavia abbiamo visto anche errori algoritmici indipendenti: corrispondenze casuali tra parole, ruoli degli oggetti attribuiti male e decisioni ingiustificate.

La verifica corretta sarebbe un esperimento controllato: fornire temporaneamente a C collegamenti scientifici trasversali già validati e misurare quanto migliora, mantenendo invariato l’algoritmo. Poi verificare separatamente se migliorare l’algoritmo produce benefici a conoscenza invariata.

Così sapremmo quanto dipende dalla conoscenza e quanto dal software.

La mia conclusione

Penso che abbiamo individuato un prerequisito concettuale importante che nelle ultime fasi è rimasto incompleto.

Non basta insegnare a PEE i bisogni di chi cerca una friggitrice o una lavatrice. Dobbiamo insegnargli anche a riconoscere bisogni che esistono indipendentemente da qualsiasi categoria e a investigare come possano essere soddisfatti.

Questo non dovrebbe richiedere un secondo database né una nuova architettura separata: preferirei estendere coerentemente il modello di conoscenza esistente, dopo aver verificato cosa è riutilizzabile.

E non vorrei che Claude ricevesse subito l’istruzione di implementare una soluzione prestabilita. Gli chiederei prima di valutare questo livello trasversale dei bisogni insieme ai risultati negativi di C e N1, individuando quali capacità mancano davvero e quali dipendono invece da difetti già presenti negli algoritmi.

La tua intuizione cambia la priorità: prima di pretendere che PEE sappia scegliere una categoria, dobbiamo capire se gli abbiamo insegnato sufficientemente a ragionare sui bisogni che possono condurre a quella categoria, a più categorie o a nessuna.
