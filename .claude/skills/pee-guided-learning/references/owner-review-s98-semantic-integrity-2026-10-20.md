# Owner review of S98 and decision for S99: end-to-end semantic integrity (2026-10-20)

Preserved verbatim as received (Italian). The owner's message opened with: "Quindi, assolutamente risolvi ciò che sta
bloccando, ma con questa visione".

---

S98 è un progresso architetturale importante, ma conferma che il problema di PEE è più profondo di quanto sembrasse. Questa volta, però, non siamo semplicemente tornati allo stesso punto.

Ho verificato il rapporto S98 nel commit ⁠￼3e953ef⁠￼ e i risultati del primo test indipendente.

La differenza rispetto a S97 è sostanziale: il collegamento fra conoscenza scientifica, lettura, deposito e risposta ora esiste nel codice ed è raggiungibile attraverso opzioni esplicite. Non è ancora abilitato come percorso ordinario, né autorizzato a produrre classifiche, ma non è più soltanto un lettore isolato nei test.

Il problema emerso adesso riguarda la correttezza delle informazioni che attraversano questo collegamento.

Che cosa è stato realmente dimostrato

Capacità	Risultato S98	Valutazione
Integrazione architetturale	Implementata con controlli di attivazione	Progresso concreto
Attribuzione quantitativa	0 → 19 valori corretti su 60	Migliora, ma copertura bassa
Natura dei risultati	10 concordanze, 8 discordanze	Insufficiente
Identità del prodotto	1 valore di altro prodotto attribuito erroneamente	Bloccante
Confrontabilità	Le condizioni impediscono molti confronti precedentemente ammessi	Miglioramento prudenziale, da verificare
Qualità degli esperti	Nessuna osservazione acquisita nel nuovo campione	Non dimostrata
Risposte di consulenza	Nessuna decisione cambiata	Integrazione non ancora operativamente validata

Confermo quindi la scelta di Claude: non abilitare il nuovo percorso come fonte di evidenza utilizzabile nelle decisioni.

Ma c’è una distinzione importante: molte astensioni sono appropriate quando mancano informazioni. Non dobbiamo cercare di eliminare indiscriminatamente le 41 mancate attribuzioni, perché potremmo aumentare proprio gli errori che vogliamo evitare.

La priorità è correggere le cause verificabili, non massimizzare il numero di valori riconosciuti.

1. Tre problemi che ho individuato anche nel codice

A. Il riconoscimento delle misure è ancora separato dalla comprensione del loro ruolo

In scientific_reading98.ts, una quantità trovata nel documento viene interpretata attraverso la sua unità, le parole vicine, le condizioni e la classificazione dell’evidenza.

Ma manca ancora una distinzione sufficientemente affidabile fra:

* risultato effettivamente ottenuto;
* specifica del produttore;
* soglia minima o massima;
* riferimento normativo;
* obiettivo di una prova.

Questo spiega perché il sistema possa leggere «below 45 dB» come se il prodotto avesse effettivamente registrato 45 dB.

Non serve una regola specifica per i decibel. Serve che PEE comprenda il ruolo scientifico dell’enunciato prima di attribuire il valore a un prodotto.

È una correzione generale, trasferibile a temperatura, consumi, rumore, luminosità e molte altre grandezze.

B. Ho trovato un altro possibile punto di perdita nell’estrazione

Nel codice S98, per stabilire se una quantità del documento è già stata acquisita da un altro estrattore, viene controllata essenzialmente la coppia:

valore numerico + unità

Questo è troppo debole come criterio generale di duplicazione.

Due prodotti differenti possono avere lo stesso valore e la stessa unità. Lo stesso può accadere a due misure con condizioni diverse oppure a una specifica del produttore e a un risultato indipendente.

La logica attuale potrebbe trattare osservazioni distinte come duplicati, perdendo informazioni prima ancora dell’interpretazione scientifica.

Non ho verificato una perdita effettiva causata da questo meccanismo nel campione S98, ma è un rischio architetturale specifico, individuabile nel codice e meritevole di un test mirato.

C. Anche la confrontabilità è ancora semplificata

In scientific_evidence98.ts, il confronto controlla soprattutto la natura del valore e le condizioni dichiarate.

È una buona prima protezione, ma non basta a dimostrare che due misurazioni siano scientificamente confrontabili.

Potrebbero differire per metodo, oggetto d’interesse, base del risultato o altri elementi essenziali.

Quindi il passaggio da 46 confronti ammessi a uno solo indica maggiore prudenza, non dimostra automaticamente che quell’unico confronto rimasto sia corretto.

Questo è un altro punto in cui dobbiamo evitare che una rappresentazione incompleta venga scambiata per conoscenza sufficiente.

2. C’è un problema anche nella validazione

La vicenda degli 11 livelli sonori delle lavastoviglie è significativa.

Il riferimento cieco li aveva classificati come attribuzioni false perché, secondo l’annotatore, non esisteva una proprietà appropriata. Claude ha successivamente verificato che sound_level esiste.

È giusto aver conservato il risultato originale, ma questo dimostra che il riferimento usato per misurare PEE può contenere errori scientifici.

Non possiamo giudicare il sistema soltanto attraverso annotazioni prodotte da un altro agente linguistico, senza controllarne la correttezza.

Per il prossimo esperimento servirebbero quindi definizioni scientifiche condivise prima dell’annotazione, esempi difficili e una verifica indipendente dei disaccordi. Non è necessario annotare migliaia di esempi: pochi casi affidabili sono più utili di molti casi ambigui.

3. Autorizzerei le quattro correzioni di Claude?

Sì, come intervento correttivo limitato, ma non come quattro aggiustamenti isolati.

Vorrei che fossero affrontate attraverso un unico principio: ogni osservazione scientifica deve mantenere la propria identità e il proprio significato dalla fonte fino al deposito.

Questo comprende ruolo dell’enunciato, prodotto e variante, natura del risultato, proprietà, condizioni, metodo e provenienza.

Prima di sperimentare nuovi vettori, PEE deve poter distinguere questi elementi senza che le informazioni vengano inventate, perse o attribuite erroneamente.

Non autorizzerei ancora un’altra grande espansione del sistema né l’attivazione ordinaria del nuovo percorso. Il lavoro dovrebbe essere circoscritto alle cause verificate, accompagnato da test di regressione, una verifica indipendente e condizioni di arresto.

4. La mia conclusione sulla tua preoccupazione iniziale

Avevi ipotizzato che ci trascinassimo difetti architetturali dalle prime fasi e che questi producessero un effetto domino.

S97 ha confermato un grave problema di disconnessione. S98 ha iniziato a risolverlo, ma mostra che collegare i componenti non basta se i dati che si scambiano non conservano integralmente il loro significato.

Il prossimo obiettivo non dovrebbe essere ottenere 30 o 40 attribuzioni corrette invece di 19.

Dovrebbe essere dimostrare che un’osservazione scientifica attraversa correttamente tutto il sistema, senza perdere o cambiare identità, natura, condizioni, metodo e provenienza.

Solo allora potremo valutare seriamente il contributo aggiuntivo dei vettori e delle rappresentazioni multi-vista.

La mia decisione sarebbe quindi: R3 continua, S98 rimane disattivato per le decisioni, e la prossima attività deve consolidare l’integrità semantica end-to-end.

Non chiederei a Claude altri algoritmi né nuovi profili di categoria in questa fase. Gli chiederei di correggere e verificare le cause che abbiamo finalmente identificato.
