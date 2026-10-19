# Owner review of S87a (2026-10-19), verbatim

Received after S87a (Crawler 8b14bcc). Preserved unchanged; Claude's verification of its figures and the corrections it
caused are in `docs/plans/s87a-generalisation-and-research-freedom.md` §10.

---

Ho verificato il rapporto S87a e il codice pubblicato nel repository, al commit 8b14bcc.

La tua impressione è sostanzialmente corretta: Claude ha lavorato molto più sul secondo prompt che sul primo. Non ha ignorato completamente il primo, ma ne ha affrontato soprattutto la diagnosi architetturale, senza realizzare l’indagine scientifica e algoritmica approfondita che avevamo richiesto.

C’è anche un problema più importante: S87a non dimostra ancora un miglioramento della capacità operativa complessiva di PEE.

1. Verifica dei due incarichi

Obiettivo richiesto	Valutazione
Individuare perché le conoscenze non si propagano	Diagnosi concreta
Studiare sistematicamente gli algoritmi degli esperti	Solo ricognizione teorica
Esaminare tutti i vocabolari, traduzioni e regole	Non dimostrato
Progettare e verificare un meccanismo generale di ragionamento	Prototipo parziale
Eliminare limiti sperimentali arbitrari	Diverse modifiche implementate
Abilitare una ricerca interna più ampia	Infrastruttura pronta, non attiva
Costruire un database scientifico più ricco	Archiviazione aggiunta, contenuto informativo ancora incompleto
Migliorare le raccomandazioni attraverso conoscenza acquisita	Nessun miglioramento verificato

Claude ha effettivamente identificato quattro rappresentazioni scollegate dello stesso risultato scientifico: quella del lettore, quella delle quantità, quella delle misure insegnate e quella del validatore.

È una diagnosi fondata, ma non equivale ad aver risolto il problema.

2. Analisi oggettiva dei risultati

Il dato più interessante non è quello che Claude mette in evidenza, ma ciò che succede quando confrontiamo precisione e quantità di informazioni utilizzabili.

Indicatore sulle 84 osservazioni	Prima	Dopo S87a
Collegamenti a misure scientifiche insegnate	54	34
Collegamenti giudicati errati	Circa 9	0
Collegamenti corretti stimati	Circa 45	34
Osservazioni utilizzabili per descrivere un prodotto	41	22
Osservazioni confrontabili nella stessa fonte	40	21
Osservazioni ammesse dal validatore operativo	1	1
Cambiamenti nelle 206 risposte	0	0

Dati dichiarati nel rapporto S87a; la correttezza dei collegamenti è stata giudicata da Claude stesso, non da una verifica indipendente.

Qui c’è una distinzione essenziale.

Claude ha ottenuto una maggiore precisione apparente dei collegamenti, passando da circa 9 errori su 54 a nessun errore riscontrato sui 34 rimasti.

Ma ha anche ridotto la copertura. Se prendiamo per buono il suo controllo manuale, i collegamenti corretti erano circa 45 e ora sono 34.

Quindi non abbiamo ancora dimostrato che PEE comprenda più informazioni corrette. Abbiamo dimostrato principalmente che il nuovo meccanismo è più prudente nell’assegnare un significato.

È un possibile miglioramento dell’affidabilità, ma non equivale al miglioramento generale che avevamo richiesto.

3. Cosa mi preoccupa nel nuovo algoritmo

Ho esaminato src/evidence_assessment.ts. Ci sono quattro punti particolarmente importanti.

A. La comparabilità nella stessa fonte è troppo semplicistica.

Il codice cerca sostanzialmente un altro prodotto dello stesso editore, associato alla stessa misura e unità.

Ma due recensioni pubblicate dallo stesso editore non sono necessariamente confrontabili: possono utilizzare protocolli differenti, cambiare gli strumenti, modificare le condizioni o effettuare i test in anni diversi.

Il codice non verifica ancora sufficientemente queste differenze prima di assegnare l’idoneità al confronto.

B. La comparabilità tra fonti non è completamente dimostrata.

Il controllo verifica soprattutto che siano soddisfatte le condizioni scientifiche richieste dalla conoscenza.

Non verifica direttamente, nella decisione finale, che esista un confronto concreto con un’altra fonte e che i relativi metodi siano effettivamente equivalenti.

Può avere senso come indicatore preliminare di potenziale comparabilità, ma sarebbe prematuro trattarlo come una validazione scientifica completa.

C. Il riconoscimento di una prova originale resta basato su indizi.

Il codice utilizza una lista di modalità di lettura e la classificazione della fonte per identificare una presunta prova di prima mano.

Questi segnali possono essere utili, ma non equivalgono a verificare che il metodo sia stato realmente eseguito e descritto in modo sufficiente.

D. Continua a dipendere da categorie e regole esplicite.

Il nuovo componente contiene ancora un elenco delle sei categorie insegnate e una lista definita di segnali di prima mano.

Non è necessariamente sbagliato, ma mostra che non siamo ancora davanti a un algoritmo che apprenda autonomamente a interpretare nuove categorie e nuovi tipi di evidenza.

Il punto positivo è che tutto questo rimane sperimentale. Non è stato introdotto nella classifica operativa, quindi tali limiti non hanno compromesso il ranking.

4. Il primo prompt: che cosa manca esattamente?

Qui considero il lavoro insufficiente rispetto all’incarico ricevuto.

Avevamo chiesto un’indagine chirurgica sull’intero sistema di conoscenza di PEE: traduzioni, significati scientifici, regole, vocabolari, rappresentazioni, algoritmi di ricerca, meccanismi di inferenza e modalità con cui si generalizzano le capacità.

Claude ha presentato una sezione di ricerca che cita W3C PROV, DocRED, KILT, Snorkel, Fellegi–Sunter, SciFact e metrologia.

Ma nel rapporto non emerge un’indagine bibliografica approfondita, né un confronto sperimentale tra diversi algoritmi generali. Sono soprattutto associazioni tra metodi noti e problemi già identificati in PEE.

Mancano in particolare:

* Un inventario sistematico delle regole e dei vocabolari effettivamente operativi.
* Una verifica semantica delle traduzioni e delle relazioni scientifiche già insegnate.
* Un confronto rigoroso tra gli algoritmi attuali e tecniche alternative riconosciute nella letteratura.
* Una dimostrazione che la nuova rappresentazione migliori più moduli contemporaneamente.
* Una verifica del recupero della conoscenza su categorie o documenti nuovi.

Claude conclude che non serve un nuovo motore di inferenza. Questa può essere un’ipotesi ragionevole, ma non la considero una conclusione scientificamente dimostrata.

Ha costruito un componente che combina funzioni esistenti. Non ha ancora dimostrato che questa combinazione risolva la generalizzazione.

5. Il secondo prompt: risultato migliore, ma incompleto

Qui il lavoro è più concreto.

Restrizioni tecniche migliorate

Le sospensioni temporanee non diventano più esclusioni permanenti; sono stati aggiunti Crawl-delay, limiti scorrevoli e attese adattive.

Archivio privato implementato

È stata prevista l’archiviazione delle pagine quando consentita, con controlli sulle riserve.

Politica permanente non attivata

La configurazione con 60 richieste per sito al giorno e 1.500 complessive è stata preparata, ma un controllo automatico ne ha bloccato l’attivazione. Nessuna nuova pagina è stata acquisita.

Database scientifico non ancora arricchito come richiesto

La struttura di archiviazione è migliorata, ma il sistema continua a perdere le parole e il contesto che permettono di stabilire che cosa è stato misurato.

C’è poi una questione che ritengo importante chiarire.

Claude ha mantenuto il limite di 25 prodotti per editore, classificandolo come vincolo legale esterno.

La normativa britannica sui diritti delle banche dati distingue invece estrazioni sostanziali e insostanziali, comprese quelle ripetute e sistematiche. Non stabilisce un tetto universale di 25 prodotti per sito. Quel numero appare quindi una precauzione progettuale di PEE, non una soglia direttamente imposta dalla legge.

Questo non significa che qualunque estrazione sia consentita. Significa che Claude avrebbe dovuto distinguere più accuratamente la norma giuridica dalla regola prudenziale inventata durante lo sviluppo.

È esattamente una delle verifiche che gli avevamo chiesto.

6. La mia valutazione complessiva

Dimensione	Giudizio
Diagnosi del problema architetturale	Buona e concreta
Ricerca scientifica sugli algoritmi	Insufficiente rispetto alla richiesta
Revisione completa delle conoscenze esistenti	Non dimostrata
Nuova logica di valutazione	Interessante, ma preliminare
Recupero di informazioni scientifiche utilizzabili	Non migliorato in modo dimostrato
Maggiore libertà di ricerca	Implementata in parte
Attivazione della ricerca su nuove pagine	Non avvenuta
Miglioramento operativo per l’utente	Nessuno dimostrato

Il mio giudizio è che S87a sia un intervento parzialmente riuscito, non il completamento dei due incarichi.

Claude ha identificato bene il problema dei confini tra moduli, ma continua a risolverlo principalmente introducendo una nuova rappresentazione sperimentale. E quella rappresentazione, per il momento, non viene utilizzata dagli altri componenti operativi.

È proprio il fenomeno ricorrente che volevamo superare.

7. Quale direzione prenderei ora

Non gli farei ripetere tutto e non lo manderei subito a modificare Phase268.

Vorrei prima una verifica precisa di questa domanda:

Qual è il modello generale di un’osservazione scientifica che PEE deve poter comprendere, conservare e riutilizzare in tutti i suoi componenti?

Non soltanto value + unit, ma un significato che includa il soggetto, la grandezza misurata, il metodo, le condizioni, il ruolo evidenziale, l’incertezza, la provenienza, le relazioni con la conoscenza già posseduta e gli utilizzi scientificamente giustificati.

Claude ha già individuato quasi tutti questi elementi. Quello che non ha ancora dimostrato è di saperli integrare in un meccanismo generale che cambi effettivamente le prestazioni dell’intero sistema.

Prima di introdurre ulteriori regole, gli chiederei di valutare matematicamente quanto ogni informazione sopravviva al passaggio fra i moduli, confrontando le rappresentazioni esistenti e le alternative scientificamente fondate. Dovrebbe poi scegliere e sperimentare la soluzione più promettente, senza imporre noi un algoritmo specifico.

E manterrei separato il problema dell’attivazione della politica permanente di ricerca: è un ostacolo operativo, non deve diventare il motivo per rimandare ancora il lavoro scientifico.

In conclusione: avevi ragione a sospettare che il primo prompt non fosse stato affrontato fino in fondo. Non è stato completamente ignorato, ma la sua parte più ambiziosa e importante — individuare, progettare e dimostrare la capacità generale mancante — rimane aperta. E non considererei S87a un motivo sufficiente per dichiarare risolto R3.
