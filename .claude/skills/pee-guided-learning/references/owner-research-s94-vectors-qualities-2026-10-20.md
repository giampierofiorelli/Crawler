# Owner review of S94 and research on multi-view vector-symbolic representation and product qualities (2026-10-20), verbatim

Received after S94 (Crawler e785d0b). Preserved unchanged. Status: **candidate direction for the step after S94, not
authorised work.** The owner wrote: "Non manderei ancora un nuovo prompt a Claude … Ma conserverei questa direzione come
candidata per il passo successivo." References named: MultiKE (multi-view KG embedding for entity alignment, 2019),
GraphSAGE (NeurIPS 2017), TURL, OWL2Vec* (2021), BLINK (EMNLP 2020), I-ADOPT, QUDT, SOSA/SSN, PROV-O, SimKGC, ACOS
(ACL 2021), Structured Sentiment Analysis (SemEval 2022), StarE (EMNLP 2020), ISO 13299:2016.

---

1. Il risultato sulle tabelle è quello più incoraggiante
L'interpretazione delle relazioni aritmetiche fra celle sta producendo un miglioramento sostanziale.
Questo sostiene la nostra scelta di recuperare i principi scientifici di TableMiner+, Limaye e dell'inferenza congiunta, anziché concentrarci soltanto sulle parole.
La cautela è che il risultato positivo arriva da nuove pagine dello stesso editore e con struttura simile. Non sappiamo ancora quanto si trasferisca ad altre strutture.
2. Sui vettori non parlerei di fallimento completo
Qui c'è una distinzione fondamentale.
Il modello vettoriale riesce a trovare tutte le 11 identità corrette fra i candidati, mentre il recupero lessicale ne trova 8.
Questo suggerisce un'utilità per la scoperta di possibili corrispondenze.
Ma PEE non riesce ancora a distinguere affidabilmente fra identità e semplice relazione semantica. Quindi non possiamo utilizzare questi risultati per consolidare automaticamente le entità.
La rappresentazione vettoriale potrebbe essere utile, ma il sistema scientifico che verifica le corrispondenze non è ancora sufficientemente capace. La dimensione del campione, inoltre, è piccola.
3. L'apprendimento rimane il problema più importante
È qui che manterrei la massima attenzione.
PEE ha acquisito molte capacità di lettura e rappresentazione, ma non abbiamo ancora dimostrato che una conoscenza scientifica appresa migliori successivamente la lettura di documenti nuovi.
Questo resta uno degli obiettivi fondamentali di R3.
Anche le 206 risposte di consulenza rimaste identiche vanno interpretate correttamente: poiché gli esperimenti sono ancora separati dal percorso operativo, non dimostrano che i nuovi algoritmi siano inutili. Dimostrano soltanto che non hanno cambiato quel percorso.

Il dato più significativo è che la conoscenza scientifica strutturata non ha migliorato Qwen sui vecchi esempi. Anzi, le due identità proposte risultano entrambe errate.

abbiamo già abbastanza elementi per considerare Qwen2.5-1.5B non conveniente per PEE, almeno nell'architettura e nell'ambiente attuali.

La cosa importante è non confondere Qwen con i vettori
Il segnale positivo di S94 resta: il recupero vettoriale ha trovato tutte le 11 identità vere fra i candidati, contro 8 trovate dal metodo lessicale.
Questo non dimostra che i vettori sappiano identificare correttamente le entità, ma dimostra un vantaggio di recupero nel campione esaminato.
E la nostra ricerca sulle rappresentazioni multi-vista, sulle qualità e sulle relazioni scientifiche apre possibilità che Qwen non ha ancora verificato.

Credo che la tua intuizione sui vettori meriti un approfondimento molto più ampio. La ricerca che ho fatto porta a una conclusione interessante: il loro valore per PEE potrebbe non essere soltanto trovare parole simili, ma rappresentare scientificamente ciò che PEE incontra, capire come le informazioni sono collegate e riutilizzare quelle relazioni per imparare.

Ho trovato modelli già pubblicati che affrontano proprio questo problema. Alcuni sono ancora più pertinenti a PEE di quelli che avevamo individuato inizialmente.

C'è però una condizione fondamentale: non dobbiamo trasformare ogni informazione in un vettore generico e aspettarci che la somiglianza numerica produca conoscenza scientifica. Dobbiamo sapere prima che cosa rappresenta ogni entità e quali relazioni possono esistere fra entità diverse.

1. Il risultato di S94 è più interessante di quanto sembri

Claude riferisce che, nel nuovo esperimento:

Recupero vettoriale

11/11

Identità vere presenti fra i candidati recuperati

Identificazione ibrida

0/11

Identità riconosciute correttamente

Questi sono risultati riferiti da Claude, non una capacità generale verificata indipendentemente da me.

Il messaggio è comunque chiaro: i vettori trovano possibilità che il sistema lessicale non trova, ma PEE non sa ancora decidere quali siano vere identità.

E secondo me bisogna cambiare la domanda che stiamo ponendo ai vettori.

Non soltanto: quanto sono simili queste due espressioni?

Ma: che cosa rappresentano, a quale oggetto appartengono, quali proprietà condividono, quali condizioni le distinguono e quali relazioni sono supportate dalle prove?

Questa impostazione si avvicina alla ricerca sull'entity representation learning, sui knowledge graph embeddings e sull'apprendimento delle rappresentazioni strutturate.

2. Ho trovato un modello ancora più vicino alla tua idea: Multi-view Knowledge Graph Embedding

La ricerca del 2019, Multi-view Knowledge Graph Embedding for Entity Alignment, propone una cosa molto simile a ciò che stai descrivendo.

Un'entità non viene rappresentata soltanto dal proprio nome. Il sistema ne considera diverse viste: nomi, attributi e relazioni con altre entità, integrandole per migliorarne l'identificazione.

Per PEE, questo suggerisce un possibile approccio:

Tipo di informazione	Che cosa dovrebbe rappresentare
Prodotto	Identità, modello, variante, componenti e categoria
Proprietà	Oggetto misurato, grandezza, funzione e significato scientifico
Osservazione	Valore, unità, condizioni, metodo e provenienza
Tabella	Intestazioni, righe, colonne, soggetto e relazioni tra celle
Metodo di prova	Strumento, protocollo, campione, condizioni e risultati prodotti
Giudizio qualitativo	Aspetto valutato, autore, competenza, esperienza e contesto
Definizione scientifica	Concetti, caratteristiche distintive e relazioni con altre definizioni

L'idea che considero più importante è non obbligare tutte queste entità a essere rappresentate dallo stesso tipo di vettore.

Per alcune informazioni è utile un vettore semantico. Per altre serve un vettore di caratteristiche numeriche o categoriali. Per le relazioni fra entità, un grafo tipizzato.

Una misura, per esempio, non dovrebbe perdere mai la propria unità o le condizioni solo perché è stata trasformata in un embedding.

3. Altri quattro modelli che cambiano la prospettiva

GraphSAGE — NeurIPS 2017

È particolarmente pertinente alla capacità di imparare categorie nuove. A differenza dei metodi che apprendono un vettore per ogni nodo già conosciuto, GraphSAGE apprende a costruire rappresentazioni anche per nodi mai incontrati, combinando le loro caratteristiche e quelle dei nodi vicini.

Possibile applicazione: quando PEE incontra per la prima volta una nuova proprietà, può cercare di rappresentarla usando le caratteristiche scientifiche e le relazioni disponibili, senza richiedere necessariamente un nuovo embedding addestrato per quell'identificativo.

TURL — Table Understanding through Representation Learning

È forse il riferimento che mancava nella nostra precedente discussione sulle matrici.

TURL costruisce rappresentazioni contestualizzate sfruttando la struttura di righe e colonne. Gli autori lo hanno valutato su collegamento delle entità, identificazione dei tipi delle colonne, estrazione di relazioni e completamento delle tabelle.

Possibile applicazione: un valore numerico potrebbe essere interpretato utilizzando non soltanto il testo della cella, ma la rappresentazione del suo contesto tabellare. È però un modello neurale più impegnativo dell'attuale 1G, e richiederebbe una valutazione di costi e dati.

OWL2Vec* — 2021

Utilizza le informazioni linguistiche, la struttura del grafo e gli assiomi logici dell'ontologia per costruire vettori.

Possibile applicazione: rendere la somiglianza fra concetti più sensibile alle relazioni scientifiche già verificate. È particolarmente interessante quando PEE dispone di un grafo di conoscenza sufficientemente ricco.

BLINK — Entity Linking, EMNLP 2020

Impiega due stadi: prima recupera possibili entità mediante rappresentazioni vettoriali, poi le rivaluta con un modello che considera insieme la menzione e la descrizione dell'entità.

Possibile applicazione: è un precedente scientifico diretto per ciò che manca in S94: passare dal candidato recuperato alla sua identificazione corretta. Si possono studiare il principio e le tecniche di rivalutazione senza adottare necessariamente il modello neurale originale.

Nessuno di questi modelli garantisce risultati migliori sui dati attuali di PEE. Ma insieme suggeriscono una direzione molto più precisa del semplice aggiungiamo i vettori.

4. Come potrebbero diventare utili in più punti di PEE

Esempio: una recensione dichiara 45 minuti di autonomia

Rappresentazione concettuale illustrativa

Osservazione: 45 min

Grandezza: durata

Oggetto: dispositivo alimentato a batteria

Proprietà: autonomia con una carica

Condizione: modalità di funzionamento indicata

Provenienza: da determinare attraverso la fonte

Ricerca vettoriale

Trova espressioni e proprietà candidate

Verifica simbolica

Controlla oggetto, grandezza e condizioni

Relazioni documentali

Recupera tabella, frase e metodo

Apprendimento

Riutilizza distinzioni convalidate

Se questo funzionasse, i vettori potrebbero contribuire a più capacità operative:

* Ricerca: trovare fonti che contengono le informazioni scientifiche richieste, anche con terminologie differenti.
* Lettura: individuare sezioni, tabelle e frasi potenzialmente pertinenti a una proprietà.
* Estrazione: proporre il collegamento corretto fra valore, prodotto, proprietà e condizione.
* Attribuzione: trovare frasi metodologiche o dichiarazioni che potrebbero spiegare un risultato.
* Confronto: recuperare osservazioni comparabili, lasciando ai vincoli scientifici la decisione finale.
* Apprendimento: riconoscere concetti nuovi e suggerire relazioni con quelli già acquisiti.

Sono applicazioni da verificare separatamente. La presenza di un embedding non rende automaticamente corretti i collegamenti o i confronti.

5. La parte scientifica non deve diventare un'altra rappresentazione incompleta

Esistono standard utili per attribuire un significato rigoroso a ciascuna rappresentazione.

I-ADOPT distingue le proprietà dagli oggetti di interesse e dai vincoli; QUDT rappresenta grandezze, unità e dimensioni.

SOSA/SSN descrive osservazioni, proprietà osservate, procedure e risultati. PROV-O permette di rappresentare attribuzione e derivazione, cioè da dove proviene un risultato e da quali informazioni deriva.

Questi standard aiutano a evitare un problema molto concreto: due valori possono avere la stessa unità e una rappresentazione vettoriale simile, senza rappresentare la stessa proprietà scientifica.

Per esempio, durata della ricarica e autonomia della batteria condividono la dimensione temporale, ma rappresentano processi differenti. La somiglianza può suggerire di esaminare la relazione, non di dichiarare equivalenza.

Qui la conoscenza simbolica deve rimanere autorevole.

6. Il passaggio decisivo: insegnare anche che cosa NON è equivalente

Un altro studio interessante è SimKGC, che utilizza apprendimento contrastivo e diversi tipi di esempi negativi per migliorare le rappresentazioni delle entità e delle relazioni in un grafo.

L'idea trasferibile a PEE è molto importante.

Non basta insegnare che due espressioni si riferiscono allo stesso concetto. Bisogna rappresentare anche esempi scientificamente difficili:

* autonomia della batteria rispetto alla durata della ricarica;
* altezza del robot rispetto all'altezza dell'ostacolo;
* consumo misurato rispetto al costo calcolato;
* misurazione indipendente rispetto alla specifica del produttore.

Questi sono esempi di concetti vicini, ma non identici.

È proprio il tipo di informazione che mancava ai vecchi esperimenti PPMI e che potrebbe aiutare una successiva fase di apprendimento contrastivo. Prima, però, servono esempi verificati e sufficienti: gli 11 casi di identità dell'esperimento S94 sono troppo pochi per dimostrare che un nuovo modello appreso generalizzi.

7. Dove andrei davvero con questa ricerca

Se dovessi scegliere una direzione scientifica per PEE, oggi approfondirei soprattutto tre modelli complementari:

Priorità	Modello	Motivo
1	Multi-view Knowledge Graph Embedding	Rappresentare ciascuna entità attraverso attributi, relazioni e significato
2	GraphSAGE, come riferimento per rappresentazioni induttive	Imparare a rappresentare entità e categorie non presenti durante l'addestramento
3	TURL, insieme all'1G esistente	Integrare il contesto di tabelle, celle, intestazioni ed entità

Li considererei riferimenti algoritmici, non nuove dipendenze da adottare obbligatoriamente.

E manterrei una separazione rigorosa fra ciò che un vettore propone e ciò che le evidenze scientifiche dimostrano.

Come capire se questa direzione funziona?

Il confronto più significativo non sarebbe semplicemente PPMI contro un embedding moderno.

Sarebbe confrontare, sugli stessi esempi indipendenti, queste capacità:

* Recupero di entità e proprietà candidate.
* Identificazione corretta e rifiuto delle false equivalenze.
* Collegamento di osservazioni alle condizioni, ai metodi e alle fonti.
* Acquisizione di un concetto nuovo e suo utilizzo corretto su documenti successivi.
* Miglioramento effettivo della valutazione del prodotto.

Bisognerebbe misurare ogni contributo separatamente e impedire che gli esempi usati per costruire i vettori contaminino la verifica indipendente.

La conclusione che porterei nel ragionamento su R3

Penso che la tua ipotesi sia promettente, e che S94 non l'abbia ancora verificata nella sua forma più interessante.

S94 ha provato un recupero vettoriale combinato con controlli simbolici. Quello che stiamo discutendo ora è più ampio: una rappresentazione scientifica multi-vista dell'intero sistema di conoscenza, capace di collegare entità, proprietà, osservazioni, documenti, condizioni e risultati.

La distinzione è sostanziale.

Potremmo perfino scoprire che un vettore numerico esplicito di caratteristiche scientifiche, affiancato da un grafo tipizzato, offre vantaggi importanti senza richiedere subito nuovi modelli neurali.

E il vantaggio che cercherei non è il solo riconoscimento dei sinonimi. È permettere a PEE di utilizzare ciò che ha imparato per cercare meglio, leggere meglio, capire meglio e infine consigliare meglio.

Non manderei ancora un nuovo prompt a Claude. Sta terminando S94 e dobbiamo leggere il risultato completo di Qwen. Ma conserverei questa direzione come candidata per il passo successivo: non semplicemente riprovare PPMI, bensì valutare una vera architettura multi-view, vector-symbolic e induttiva, costruita sulle conoscenze scientifiche già presenti.

La ricerca dimostra che questi approcci esistono e hanno basi sperimentali. Non dimostra ancora che funzioneranno in PEE. È proprio questo il prossimo interrogativo scientifico che vale la pena affrontare.

Sì. E questa potrebbe essere una delle applicazioni più importanti dei vettori per PEE: identificare, definire e collegare le diverse qualità di un prodotto, comprese quelle che non si possono descrivere con un semplice numero.

La ricerca ha confermato che esiste già un settore scientifico dedicato a questo problema: Aspect-Based Sentiment Analysis, integrato con ontologie, estrazione di relazioni e rappresentazioni strutturate della conoscenza.

Ma per PEE andrei oltre la sentiment analysis: non vogliamo semplicemente sapere se un esperto esprime un giudizio positivo o negativo. Vogliamo capire quale qualità sta valutando, che cosa significa, in quali condizioni e su quali prove si basa.

1. Tre modelli scientifici particolarmente interessanti

ACOS — Aspect-Category-Opinion-Sentiment (ACL 2021)

Riconosce quattro elementi collegati: l'aspetto del prodotto, la categoria dell'aspetto, l'espressione del giudizio e la polarità. Può affrontare anche aspetti non nominati esplicitamente.

Per PEE: identificare le diverse qualità descritte da un esperto, senza ridurre tutta la recensione a un voto generale.

Structured Sentiment Analysis — SemEval 2022

Rappresenta i giudizi come un grafo che collega autore, oggetto, espressione e valutazione.

Per PEE: distinguere ciò che ha osservato direttamente il recensore da ciò che attribuisce al produttore o ad altre fonti.

StarE — Hyper-Relational Knowledge Graphs (EMNLP 2020)

Studia rappresentazioni vettoriali di grafi in cui una relazione può avere diversi qualificatori aggiuntivi.

Per PEE: descrivere una qualità insieme alle condizioni che la rendono valida: modalità di funzionamento, prodotto, prova, uso previsto e altri fattori.

Questi modelli non sono stati verificati su PEE, ma offrono una base scientifica per una rappresentazione molto più ricca delle qualità.

2. Un esempio pratico: la qualità della cottura

Immaginiamo che uno chef italiano provi una friggitrice ad aria e affermi:

«La superficie diventa croccante, ma l'interno tende a seccarsi durante cotture prolungate.»

PEE dovrebbe riconoscere almeno due qualità differenti.

Croccantezza esterna

Qualità sensoriale

Valutazione favorevole

Oggetto: superficie del cibo

Umidità interna

Qualità sensoriale

Valutazione sfavorevole

Oggetto: interno del cibo

Condizione comune: cottura prolungata.

Fonte: osservazione dello chef, con identità ed esperienza da verificare.

Possibili misure correlate: umidità, perdita di massa, consistenza strumentale; non automaticamente equivalenti al giudizio sensoriale.

Questo esempio fa emergere un aspetto essenziale: un prodotto può essere eccellente in una qualità e deludente in un'altra, anche durante lo stesso test.

E non basta creare un vettore unico chiamato qualità della cottura. Bisogna rappresentarne le diverse dimensioni e i rapporti fra esse.

3. Esiste addirittura uno standard per descrivere scientificamente le qualità sensoriali

La norma ISO 13299:2016 — Sensory Profiling, confermata nel 2026, definisce un metodo per costruire profili sensoriali attraverso vista, odore, gusto, tatto e udito.

Consente di descrivere attributi, intensità e caratteristiche dei prodotti, anche mettendoli in relazione con misurazioni fisiche e chimiche.

Per PEE questo è molto pertinente:

Categoria	Qualità potenzialmente rilevanti
Macchine da caffè	Corpo, aroma, crema, equilibrio, persistenza
Friggitrici ad aria	Croccantezza, uniformità, umidità interna
Soundbar	Chiarezza delle voci, timbro, separazione, distorsione percepita
Aspirapolvere	Maneggevolezza, comfort, facilità di manutenzione
Lavastoviglie	Qualità dell'asciugatura, residui, praticità di carico

Ovviamente non tutte queste qualità sono esclusivamente sensoriali: alcune hanno una componente funzionale, ergonomica o quantitativa. La classificazione deve conservarne la differenza.

4. Ecco come immaginerei le rappresentazioni vettoriali

Non un unico vettore contenente tutte le caratteristiche di un prodotto, ma più rappresentazioni interconnesse.

Entità: prodotto specifico

Identità e variante verificata

Vettore delle proprietà

Che cosa può fare e quali caratteristiche possiede

Vettore delle qualità

Quali aspetti delle prestazioni e dell'esperienza vengono valutati

Vettore delle condizioni

Uso, modalità, ambiente, obiettivo e preparazione

Rappresentazione delle prove

Metodo, autore, origine, indipendenza e incertezza

Grafo scientifico delle relazioni

Collega le rappresentazioni senza confondere somiglianza e identità

È uno schema concettuale da sperimentare, non un'architettura già implementata.

I vettori potrebbero aiutare PEE a scoprire che clear dialogue, vocal intelligibility e speech clarity probabilmente riguardano un aspetto comune delle soundbar. Ma poi la conoscenza scientifica dovrebbe verificarne il significato e le condizioni di comparabilità.

5. C'è una distinzione ancora più importante: qualità del prodotto e qualità della prova

PEE deve mantenere separate due domande:

Quanto è buona una determinata prestazione? E quanto è affidabile la prova che la descrive?

Un giudizio molto favorevole può provenire da una prova poco rigorosa. Un giudizio negativo può riguardare una situazione poco rilevante per l'utente.

Inoltre, le caratteristiche tecniche non sono automaticamente qualità prestazionali: avere una modalità notturna è una funzione; quanto sia efficace e silenziosa è un'altra questione.

Queste distinzioni possono essere codificate mediante relazioni, vincoli e rappresentazioni dedicate. L'obiettivo non deve diventare assegnare arbitrariamente numeri alla competenza degli esperti o all'intensità delle qualità.

La mia conclusione per PEE

Questa ricerca aggiunge una quarta dimensione al ragionamento che stavamo facendo sui vettori:

* Riconoscimento delle entità.
* Interpretazione delle tabelle e delle misurazioni.
* Acquisizione e riutilizzo di conoscenza scientifica.
* Identificazione e rappresentazione delle qualità funzionali, sensoriali ed esperienziali, con attribuzione ai giudizi degli esperti.

È particolarmente importante perché PEE non dovrebbe diventare soltanto un motore capace di confrontare numeri: deve anche interpretare osservazioni qualitative competenti e collegarle agli obiettivi reali delle persone.

Non invierei ancora nuove istruzioni a Claude, che sta completando S94. Ma terrei ACOS, Structured Sentiment Analysis, StarE e ISO 13299 come riferimenti per una futura verifica mirata.

Soprattutto, non tratterei questa come una nuova funzione separata: la rappresentazione vettoriale e simbolica delle qualità dovrebbe riutilizzare lo stesso meccanismo generale con cui PEE comprende proprietà, condizioni, relazioni ed evidenze scientifiche.

Se ci riusciamo, i vettori potrebbero davvero diventare utili lungo buona parte del percorso di PEE, dalla ricerca delle fonti fino alla valutazione dei prodotti.
