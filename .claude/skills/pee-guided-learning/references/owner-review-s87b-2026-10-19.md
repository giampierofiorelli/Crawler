# Owner instruction and review of S87b (2026-10-19), verbatim

Received after S87b (Crawler 8d1e26c). Preserved unchanged.

## Owner instruction

Accedi alle fonti per studiare come vanno fatte queste cose accedi a tutto quello che ti può servire. Non basarti sulla tua sul su come sei stato allenato. Dovevi apprendere cose nuove perché è un territorio dove non ti stai muovendo bene a sufficienza.

## Review (as received)

La tua diagnosi è in larga parte corretta: il problema centrale di PEE è ancora la generalizzazione della conoscenza. S87b, però, è il primo intervento recente che presenta una prova concreta di trasferimento a gruppi non utilizzati per sviluppare il nuovo algoritmo.

Ho verificato il rapporto, src/observation_model.ts, gli script di valutazione, i dati del primo esperimento e i test pubblicati nel repository.

Il mio giudizio iniziale è questo: S87b è un progresso metodologico reale, con un risultato tecnico promettente, ma non è ancora la soluzione generale che chiedi da tempo.

1. Che cosa ha effettivamente dimostrato Claude

Per la prima volta ha separato il materiale utilizzato per sviluppare il classificatore da quello utilizzato per verificarlo.

Classificazione delle condizioni sperimentali — 12 gruppi di verifica

14,3%

Riconoscimento corretto con gli assi precedenti

79,0%

Riconoscimento corretto con S87b

Nuovo classificatore

309/391

Sistema precedente

56/391

Le 391 condizioni sono quelle incluse nelle classi valutate; altre 47 annotazioni classificate come “other” non entrano nel denominatore. Il riferimento è prodotto da un agente Claude, non da esperti umani indipendenti.

Il nuovo algoritmo classifica 324 condizioni su 391; di queste, 309 sono giudicate corrette. Ha quindi una precisione del 95,4% quando assegna una classe, ma si astiene per 67 condizioni.

Questa è una differenza importante rispetto al passato: non stiamo semplicemente osservando che più numeri vengono individuati. Stiamo misurando se l’algoritmo riesce a riconoscere il ruolo scientifico delle informazioni.

Tuttavia la prova resta limitata: utilizza osservazioni già raccolte nelle fasi precedenti e parte da informazioni sostanzialmente fornite come se la pagina fosse stata letta perfettamente. Non dimostra ancora la stessa capacità durante la lettura autonoma di documenti nuovi.

2. Dove S87b continua a non generalizzare

Il risultato complessivo nasconde differenze importanti.

Capacità	Risultato S87b	Mia valutazione
Classificare condizioni nei gruppi di verifica	309/391 — 79%	Miglioramento promettente
Riconoscere il tipo di grandezza misurata	259/268 — 96,6%	Buono, ma facilitato da unità e descrizioni già disponibili
Riconoscere la base della misura quando è dichiarata	36/79 — 45,6%	Ancora insufficiente
Classificare condizioni dei televisori su TechRadar	24/45 — 53,3%	Trasferimento debole
Classificare condizioni delle asciugatrici	55/82 — 67,1%	Trasferimento parziale
Utilizzare il nuovo modello nel processo operativo	Nessuna integrazione	Non dimostrato

Un aspetto da riconoscere a Claude: ha riportato il calo dalle prestazioni di sviluppo a quelle di verifica, invece di nasconderlo.

C’è anche un gruppo di televisori con 0 classificazioni corrette su un solo caso; non è una base statistica sufficiente per giudicare il gruppo. TechRadar, con 45 condizioni, è il gruppo debole più significativo.

Un esempio che rivela il problema

Consideriamo queste tre osservazioni:

Un solo concetto scientifico può essere espresso in modi diversi

“Energy consumption: 0.9 kWh per cycle”

“The eco programme used 0.9 kWh”

“We recorded 0.9 kWh during a complete wash”

Il riferimento a un ciclo completo può essere esplicito, implicito nel programma oppure derivabile dal metodo descritto. Il valore numerico e l’unità, da soli, non bastano.

S87b riconosce meglio le strutture grammaticali, ma non è ancora sufficientemente capace di recuperare la relazione scientifica implicita fra quantità, attività, condizioni e metodo.

Per questo il riconoscimento della base della misura scende al 45,6%.

Ed è proprio qui che la tua preoccupazione sul vocabolario e sulla conoscenza diventa rilevante.

3. Sta usando davvero gli algoritmi dell’intelligenza artificiale?

Non nel senso completo che intendi tu.

Ho letto src/observation_model.ts. Il classificatore contiene ancora espressioni regolari e segnali lessicali espliciti, come INSTRUMENT_HEAD, METHOD, SETTING_NOUN, PROCEDURE, SAMPLE, RELATION e TASK_DURATION.

Sono organizzati attraverso regole di precedenza e utilizzano la conoscenza generale delle unità.

Questa è una forma legittima di intelligenza artificiale simbolica, perché codifica e applica conoscenza strutturata. Non è necessariamente un approccio sbagliato.

Ma non è ancora un sistema che apprende il significato di nuove espressioni dalla conoscenza scientifica acquisita, né un sistema di estrazione di relazioni documentali addestrato o valutato rispetto a metodi moderni alternativi.

Ho confrontato il problema con alcuni riferimenti tecnici:

Metodo consolidato	Cosa manca ancora a PEE
QUDT	Un modello semantico rigoroso e riutilizzabile delle grandezze, unità e relazioni dimensionali
SHACL	Vincoli generali e verificabili sulla struttura e coerenza delle osservazioni
DocRED	Interpretare relazioni che attraversano frasi, tabelle e sezioni del documento
Snorkel	Combinare segnali imperfetti tenendo conto della loro affidabilità e correlazione

Questi sono esempi di metodologie da studiare e valutare, non quattro nuove librerie che Claude debba necessariamente installare. QUDT affronta la semantica delle misure; DocRED le relazioni nell’intero documento; Snorkel un approccio probabilistico alle regole di etichettatura.

La mia conclusione è che Claude ha scelto un approccio ragionevole come primo esperimento, ma non ha ancora dimostrato che sia l’approccio scientificamente migliore per PEE.

4. Il problema del vocabolario è più profondo di un elenco incompleto di parole

Qui voglio anche correggerti leggermente.

Non credo che il problema sia soltanto il vocabolario. È il modo in cui il vocabolario rappresenta la conoscenza e il modo in cui gli algoritmi la applicano.

Un esempio chiarisce la differenza.

Se PEE impara che “eco programme” è una modalità operativa della lavastoviglie, non dovrebbe limitarsi a riconoscere quelle due parole.

Dovrebbe possedere relazioni che permettano di stabilire che:

* si tratta di una modalità di funzionamento;
* una misura può riferirsi all’esecuzione di quella modalità;
* il consumo misurato può essere relativo a un ciclo completo;
* due consumi sono confrontabili soltanto quando i rispettivi metodi e le condizioni sono compatibili.

A quel punto una nuova frase potrebbe essere interpretata attraverso tali relazioni, anche se non contiene esattamente le parole utilizzate durante l’insegnamento.

Questo è il salto dalla corrispondenza linguistica all’interpretazione semantica.

Ed è particolarmente importante per le nuove categorie, dove PEE non conosce ancora tutti i termini.

5. Un problema importante che ho trovato nel codice

Il nuovo modello produce una comparabilityKey, costruita sostanzialmente con:

kind + metric + basis + operating settings + quantity conditions

È un buon punto di partenza per raggruppare osservazioni potenzialmente simili.

Ma non è sufficiente per dimostrarne la comparabilità scientifica.

Non comprende necessariamente il metodo di prova, lo strumento, il campione e tutte le condizioni rilevanti.

Due risultati possono avere la stessa grandezza, base e impostazione, ma essere stati ottenuti con protocolli diversi.

Quindi questa chiave dovrebbe essere interpretata come un criterio preliminare di selezione, non come dimostrazione di equivalenza sperimentale.

È un esempio preciso del lavoro ancora necessario: il modello scientifico deve essere abbastanza ricco da rendere le decisioni corrette, non soltanto abbastanza generale da riconoscere le parole.

6. La decisione che prenderei per la fase successiva

Non tornerei indietro. S87b ha prodotto qualcosa che vale la pena sviluppare: un modello strutturale trasferibile, misurato in modo più serio delle precedenti fasi.

Ma non inizierei semplicemente ad aggiungere i termini dei televisori o le espressioni mancanti sui cicli di lavaggio.

Il prossimo obiettivo dovrebbe essere un’integrazione fra ragionamento strutturale e conoscenza scientifica dinamica.

Questo significa utilizzare il modello generale di S87b come base, esaminare sistematicamente il vocabolario e le relazioni già presenti nel database, confrontare i due collegatori che oggi divergono su 267 osservazioni e verificare quali tecniche scientifiche permettano di interpretare nuove espressioni senza introdurre continuamente nuove regole nel codice.

Attenzione: i 267 disaccordi devono essere analizzati prima di fondere i collegatori; non dimostrano da soli quale dei due abbia ragione.

Soprattutto, il nuovo sistema dovrà poi funzionare durante la vera lettura e conservazione delle informazioni, non soltanto su osservazioni già preparate.

La modifica allo schema del database sarà probabilmente necessaria, ma prima stabilirei il contratto scientifico della rappresentazione, per evitare un’altra migrazione seguita dalla scoperta che manca un’informazione essenziale.

Il mio giudizio finale su S87b

Metodo di generalizzazione

Migliorato

Trasferimento fra categorie ed editori

Parzialmente dimostrato

Uso dinamico della conoscenza

Ancora assente

Algoritmo scientifico generale

Prototipo incompleto

Miglioramento operativo per PEE

Non ancora dimostrato

Quindi sì, la tua insistenza sulla generalizzazione è giustificata dai dati. Ma ti correggerei su un punto: non è necessario che PEE utilizzi obbligatoriamente un modello neurale o un LLM per diventare intelligente. Anche un sistema ibrido, che combina conoscenza formalizzata, regole scientifiche e metodi statistici, può essere molto efficace.

Quello che conta è che apprenda relazioni trasferibili, sappia applicarle in contesti nuovi e ne dimostri l’efficacia.

S87b è finalmente un passo in quella direzione. Non è ancora la soluzione.

Per ora non aggiungerei automaticamente un altro prompt a Claude: abbiamo individuato con precisione cosa valutare e cosa manca, ma conviene consolidare questa diagnosi prima di autorizzare un’altra implementazione ampia.
