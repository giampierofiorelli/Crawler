# Owner review of S92 (2026-10-20), verbatim

Received after S92 (Crawler 1e76836). Preserved unchanged. It keeps the direction and every recovered method. It asks for
three corrections before going further:
1. links verifiable to the original statement, not to a table cell;
2. provenance kept separate from the nature of the result (declared, measured, calculated), with the inputs and
   assumptions of a calculation identifiable;
3. the FlyingSquid estimates compared with independent annotated data and with the correlation between signals, while
   the rule-based model with abstention stays a reference.

It also asks to complete the learning cycle: induced knowledge becomes a verified definition that improves later readings.
It does not authorise a migration or operational activation.

---

S92 è un progresso reale nell’architettura di PEE, ma non dimostra ancora che gli algoritmi scientifici recuperati da R3 funzionino meglio. Ho verificato il rapporto e il codice pubblicati nel commit 1e76836.

La scoperta più importante è molto concreta: PEE possedeva già una parte della capacità di collegare i metodi di prova ai risultati, ma il nuovo interprete scientifico non la utilizzava.

Questo conferma la tua preoccupazione precedente: alcuni problemi non richiedono nuove conoscenze o nuove regole, bensì una migliore integrazione di capacità già sviluppate.

I risultati principali

Capacità	Risultato S92	Giudizio
Collegamento tra componenti esistenti	Realizzato sperimentalmente	Positivo
Combinazione di segnali scientifici	66 classificazioni corrette su 116	Progresso parziale
Recupero della frase che prova un risultato	Circa 1 su 33 collegamenti non locali	Insufficiente
Trasferimento a una categoria mai insegnata	25 attribuzioni errate sugli aspirapolvere senza filo	Insufficiente
Riuso di Semantic-Type Gating e PPMI	Nessun guadagno sulle pagine nuove	Non dimostrato
Knowledge Graph Induction	11 coppie corrette, ma copertura molto bassa	Promettente, preliminare

Il dato di 66 classificazioni corrette va interpretato con prudenza: il riferimento contiene 102 specifiche dichiarate e soltanto 6 misure originali. Un sistema che classificasse tutto come dichiarato otterrebbe 102 classificazioni corrette.

Quindi S92 non dimostra ancora un riconoscimento affidabile delle prove indipendenti.

Tre questioni che correggerei prima di proseguire

1. Il collegamento fra metodo e risultato non è ancora verificabile

Nel codice evidenceLinksOf(), quando un valore proviene da una tabella, il collegamento restituisce spesso un puntatore alla cella della tabella, non alla frase originale che descrive il metodo.

Questo aiuta a spiegare perché il sistema possa assegnare un ruolo apparentemente corretto senza recuperare la prova precisa che lo giustifica.

La prossima correzione deve riguardare il collegamento verificabile alla fonte originale, non soltanto un classificatore più accurato.

2. Attenzione a non confondere una misura con un risultato calcolato

Nel resoconto Claude scrive di avere considerato i valori calcolati dall’editore a partire dai propri test come measured_by_publisher.

Questa formulazione è pericolosa.

Per esempio, un laboratorio può misurare il consumo elettrico e successivamente calcolare il costo annuale.

Entrambi i risultati provengono dallo stesso laboratorio, ma:

* il consumo è misurato;
* il costo annuale è calcolato;
* tariffa elettrica e ipotesi di utilizzo devono rimanere identificabili.

La provenienza dei dati e la natura del risultato devono essere due informazioni separate.

La correzione GL11 può essere utile per preservare la provenienza degli input, ma non deve trasformare un risultato derivato in una misura diretta.

3. Il modello FlyingSquid non è ancora sufficientemente affidabile

Ho controllato src/evidence_combination.ts.

L’algoritmo utilizza una stima dell’affidabilità dei segnali basata sulle loro concordanze. Ma una delle ipotesi fondamentali è che i segnali siano sufficientemente indipendenti.

Nel modello congelato, due classificatori ricevono entrambi un’affidabilità stimata del 99%, malgrado condividano parte della logica.

Questo è un segnale di possibile sovrastima, non una precisione effettivamente dimostrata del 99%.

Non eliminerei FlyingSquid, ma confronterei le sue stime con dati annotati indipendenti, analizzando la correlazione fra segnali. Nel frattempo, un sistema di regole con astensione rimane un riferimento importante.

E gli algoritmi recuperati da R3?

Non considero S92 una smentita della tua ipotesi.

Il problema è che non abbiamo ancora realizzato completamente il ciclo di apprendimento.

Knowledge Graph Induction riesce a raggruppare correttamente alcune osservazioni, ma quelle nuove conoscenze non vengono ancora trasformate e verificate come definizioni scientifiche capaci di migliorare le letture successive.

E la confusione fra battery_runtime e run_duration è istruttiva: non serve soltanto imparare nuovi sinonimi. Serve capire la differenza fra autonomia con una carica e durata di un’attività, comprese le condizioni che eventualmente le collegano.

Questa è precisamente la funzione che le relazioni scientifiche dovrebbero svolgere.

Il mio giudizio complessivo

Non cambierei direzione e non eliminerei nessuno dei metodi recuperati.

S92 ha dimostrato che riutilizzare componenti esistenti migliora alcuni risultati. Ha anche mostrato che dobbiamo perfezionare l’inferenza sulle relazioni fra documenti, non soltanto la classificazione delle singole frasi.

Prima di parlare di un nuovo successo scientifico, vorrei verificare tre effetti concreti: collegamenti alle fonti realmente corretti, distinzione affidabile fra dichiarazioni, misure e calcoli, e apprendimento di una nuova definizione che migliori la lettura di documenti successivi.

Il progresso architetturale c’è. Il progresso nell’apprendimento autonomo è ancora da dimostrare.

E manterrei una priorità precisa: non trasformare S92 in un’altra sequenza di piccoli aggiustamenti alle parole. Utilizzare invece la ricerca scientifica già studiata per perfezionare il meccanismo generale di ragionamento sulle evidenze e di acquisizione della conoscenza.
