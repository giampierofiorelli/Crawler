# Owner review of S87e (2026-10-19), verbatim

Received after S87e (Crawler 35d1139). Preserved unchanged. The reviewer asks that its points be included in the next
consolidated assignment; it does not authorise a migration.

---

Ho verificato il rapporto S87e, il codice del ricostruttore e i risultati della prima esecuzione sui 61 editori di controllo, al commit 35d1139.

S87e è un progresso reale nella generalizzazione, ma contiene anche due risultati negativi molto istruttivi. Claude sta finalmente distinguendo ciò che funziona su documenti non utilizzati nello sviluppo da ciò che funziona soltanto sul materiale di partenza.

1. I risultati che considero più importanti

Ricostruzione su 61 editori non utilizzati nello sviluppo

98,9%

Precisione del tipo di grandezza quando riconosciuto: 173/175

82,8%

Copertura corretta: 173/209 grandezze annotate

Le altre capacità restano molto più deboli.

Scala dei valori categorici	65/68
Condizioni distinte recuperate	3/24
Base della misura recuperata	1/5
Oggetto di interesse	18 corretti, 30 errati

Valutazione su un campione di 298 dichiarazioni. Il riferimento è annotato da agenti Claude e il risultato riguarda un prototipo non operativo.

Questi numeri confermano una parte significativa della tua ipotesi: la conoscenza scientifica condivisa su unità e tipi di grandezza sembra trasferirsi meglio delle regole linguistiche costruite su pochi esempi.

Ma non dimostrano che tutta la conoscenza conservata come dati generalizzi automaticamente. Le condizioni e le basi sono ancora riconosciute troppo poco.

2. I tre problemi che emergono dalla verifica del codice

A. Claude ha scartato una regola, ma quella regola è ancora nel modulo

Questo è il punto più concreto che ho trovato.

In src/observation_reconstruction.ts, reconstructDeclaration() continua a chiamare objectOf() e a inserire il risultato nell’oggetto ricostruito, senza una condizione che disabiliti il comportamento fallito.

Quindi la regola che produce 18 attribuzioni corrette e 30 sbagliate è stata dichiarata scartata nel rapporto, ma non è stata effettivamente rimossa dal percorso sperimentale.

Non è un problema operativo immediato, perché il modulo non è ancora collegato alla produzione. È però una discrepanza che andrà corretta prima di qualsiasi integrazione.

B. Il punteggio delle condizioni può essere fuorviante

Ho controllato anche scripts/s87e-reconstruct-eval.mjs.

Lo script conta sei condizioni generate come corrispondenti al riferimento, ma soltanto tre condizioni annotate distinte risultano recuperate.

Questo può accadere perché più condizioni generate vengono associate alla stessa condizione del riferimento.

Di conseguenza, non bisogna leggere il dato come sei informazioni scientifiche recuperate correttamente.

Il risultato rilevante per la copertura è 3 su 24, cioè 12,5%.

Per una valutazione rigorosa servirebbe un abbinamento uno-a-uno tra risultati e riferimento, evitando che duplicati migliorino artificialmente il punteggio.

C. La classificazione delle prove rimane debole

Sulle 69 righe quantitative di controllo:

* 63 ruoli corretti, esattamente come la classificazione banale che considera tutto misurato;
* 6 dichiarazioni o citazioni interpretate erroneamente;
* 36 tipi di grandezza corretti, 11 errati e 22 non classificati;
* 41 proprietà con sovrapposizione lessicale rispetto al riferimento, sulle 59 prodotte.

Questo significa che la distinzione tra misurazione originale, specifica dichiarata e valore citato non è migliorata.

È un limite serio per PEE, perché una buona interpretazione delle unità non può compensare un’attribuzione sbagliata dell’origine della prova.

3. Che cosa possiamo concludere scientificamente?

S87e sostiene tre conclusioni, con livelli diversi di evidenza.

Prima conclusione, abbastanza convincente: utilizzare conoscenza strutturata sulle unità e sui tipi di grandezza permette di riconoscere molte proprietà anche su editori non impiegati nello sviluppo. I 173 collegamenti corretti su 175 prodotti sono promettenti.

Seconda conclusione, ancora limitata: le strutture dei documenti, come intestazioni di tabelle e sezioni, possono recuperare significati che non compaiono accanto al numero. Il miglioramento da 1/6 a 6/6 nello sviluppo è interessante, ma non è stato confermato sui gruppi di verifica.

Terza conclusione, troppo generale nel rapporto: le regole linguistiche non generalizzano.

In realtà, S87e dimostra che queste particolari regole linguistiche, sviluppate su questo materiale, generalizzano male. Non dimostra che gli approcci linguistici o simbolici in generale siano inadeguati.

La letteratura studiata in S87c offre anche metodi più sofisticati per modellare relazioni, contesti e segnali linguistici. Non dobbiamo escluderli sulla base di un singolo esperimento fallito.

4. Il prossimo passo corretto

Sono favorevole alla direzione suggerita da Claude: spostare progressivamente il significato scientifico nel patrimonio di conoscenze, invece di continuare a duplicarlo in espressioni regolari sparse nei moduli.

Ma questa volta vorrei che il passo successivo fosse guidato da un obiettivo misurabile:

Una stessa definizione scientifica deve poter aiutare PEE a riconoscere un’informazione nel documento, interpretarla, conservarla e riutilizzarla senza dover riscrivere la sua logica per ogni categoria.

Per riuscirci, ritengo prioritario integrare la conoscenza dichiarativa nel prototipo, misurando separatamente condizioni, oggetti, basi e ruoli della prova. Servono inoltre la correzione dello scoring delle condizioni e la disattivazione effettiva della regola fallita sull’oggetto.

Non approverei ancora la migrazione del database. Vorrei prima una dimostrazione che il nuovo modello migliori realmente il recupero semantico su documenti diversi, comprese le osservazioni qualitative.

E non utilizzerei la mancanza di un valore numerico di incertezza come veto automatico per tutte le decisioni: la sufficienza dipende dal tipo di prova e dall’obiettivo del consumatore. Questa parte del contratto deve rimanere sensibile allo scopo.

Il mio giudizio complessivo

Aspetto	Valutazione
Ricostruzione dei tipi di grandezza	Progresso convincente ma sperimentale
Generalizzazione a editori diversi	Parzialmente dimostrata
Ricostruzione delle condizioni	Insufficiente
Distinzione tra misure e dichiarazioni	Nessun miglioramento
Recupero delle basi dalle tabelle	Promettente, non confermato fuori sviluppo
Osservazioni qualitative e confronti	Non verificati nella lettura
Miglioramento delle risposte finali	Nessuno
Prontezza per la migrazione	No

S87e è utile soprattutto perché sta rendendo misurabili i limiti della generalizzazione. Rispetto alle fasi precedenti, Claude sta lavorando con maggiore disciplina sperimentale e sta ammettendo quando una soluzione peggiora i risultati.

Il pericolo da evitare ora è trasformare il successo sulle unità di misura nella conclusione che basti mettere tutto il vocabolario nel database.

La conoscenza scientifica non è soltanto un dizionario di termini. È un sistema di proprietà, relazioni, condizioni, metodi, inferenze e prove. Finché PEE non sarà in grado di applicare queste relazioni ai documenti che legge, continueremo ad avere un sistema che riconosce molte parole e molti numeri senza comprenderne abbastanza il significato.

Non invierei un altro prompt a Claude durante un’eventuale esecuzione ancora aperta. Le criticità sopra sono quelle da includere nel prossimo incarico consolidato, preservando gli esperimenti e le decisioni già acquisiti.
