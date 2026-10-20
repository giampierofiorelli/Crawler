# Owner review of S91 (2026-10-20), verbatim

Received after S91 (Crawler 843927c). Preserved unchanged. It keeps the architecture and redirects the method:
- a circumscribed, experimental comparison of algorithms on PEE's real problems:
  - document-level relations between methods, tables and results;
  - evidence combination;
  - knowledge-graph induction with the non-generative R3 mechanisms;
- measured on new pages and, where possible, on the full path;
- no LLMs for now.

It does not authorise a migration or operational activation, and it does not replace the work done.

The message has three parts, kept in their order:
1. A review of S91 and a targeted algorithm study.
2. The recovery of the six names of the original programme and the S87c method names. The six names are in the memo
   "Memoria strategica" (2026-10-17, §6.3), in pee-knowledge `owner-documents/`.
3. The recovery of the R3 cycle 3 (S76) semantic experiment, with a proposal to retest its three non-generative
   mechanisms.

---

Sì, secondo me ci siamo parzialmente allontanati dal piano scientifico originale. Non nella direzione architetturale, che rimane corretta, ma nel modo in cui stiamo affrontando i problemi.

Ho confrontato S91 con lo studio S87c e con gli obiettivi che avevamo fissato prima delle varie fasi R.

La tua seconda intuizione è altrettanto importante: vale la pena fare una nuova ricerca scientifica, ma molto più mirata, per individuare e confrontare gli algoritmi adatti ai problemi specifici di PEE. Non serve ricominciare l’intera ricerca teorica.

1. Dove siamo rispetto al piano originale

Obiettivo scientifico	Stato reale
Vocabolario e proprietà scientifiche riutilizzabili	Realizzati in forma sperimentale
Generalizzazione a editori sconosciuti	Dimostrata parzialmente
Comprensione del significato delle osservazioni	Ancora incompleta
Collegamento tra frasi, tabelle, metodi e risultati	Fortemente incompleto
Distinzione tra prove indipendenti e dichiarazioni	Insufficiente
Apprendimento autonomo della conoscenza	Primo risultato positivo, molto piccolo
Comprensione di giudizi qualitativi e confronti	Non ancora dimostrata
Miglioramento dell’intero percorso fino ai consigli	Non dimostrato

La mia preoccupazione principale è questa: stiamo lavorando soprattutto su attribuzione di proprietà e classificazione del ruolo della prova, mentre il progetto originario era molto più ampio.

L’obiettivo era che PEE acquisisse conoscenza scientifica e la utilizzasse per migliorare ricerca, lettura, estrazione, attribuzione, valutazione e apprendimento di nuove categorie.

Questa visione non va sostituita con l’obiettivo più ristretto di aumentare la precisione di un singolo classificatore.

2. S91 conferma che manca un pezzo fondamentale della ricerca

Ho verificato il rapporto S91 e i componenti definition_interpreter.ts e table_interpreter1g.ts.

Attribuzione delle proprietà

97%

Precisione selettiva su 402 valori nuovi

Ruolo della prova

59/180

Classificazioni corrette con S91

S91 è molto bravo a evitare attribuzioni sbagliate quando riconosce una proprietà: 101 corrette, una errata e due false attribuzioni. Ma recupera soltanto 101 delle 180 proprietà disponibili. Non è quindi una comprensione completa.

Soprattutto, il nuovo classificatore del ruolo della prova peggiora rispetto a S90, che ne riconosceva 89 correttamente sullo stesso campione. Anche il piccolo vantaggio dell’apprendimento (+2 attribuzioni) non dimostra ancora una capacità generale.

Il caso più rivelatore è quello individuato su Air Purifier First:

* Il documento spiega come sono stati eseguiti i test.
* Una tabella successiva contiene risultati come 41.4 dBA.
* PEE riconosce il numero, ma non sa collegarlo alla procedura descritta altrove.

Questo non è principalmente un problema di aggiungere termini al vocabolario. È un problema di ragionamento sulle relazioni fra informazioni distribuite nel documento.

Ed è esattamente uno dei problemi principali affrontati dalla ricerca scientifica che Claude aveva studiato in S87c.

3. Ho ricontrollato la letteratura: quali algoritmi studierei per PEE?

Ho cercato lavori specifici, compresi metodi per documenti HTML, relazioni fra sezioni, estrazione di misure, combinazione delle prove e comprensione qualitativa.

Questi sono i candidati più pertinenti, non una lista di tecnologie da installare indiscriminatamente.

Priorità massima: Document-level Relation Extraction

SciREX, DocRED/EIDER, evidence graph e relazioni n-arie

Costruire collegamenti fra dichiarazione del metodo, strumento, tabella, proprietà, prodotto e risultato, anche quando si trovano in sezioni diverse.

È l’approccio più direttamente collegato ai problemi di S91. EIDER, per esempio, estrae prima le evidenze rilevanti e poi le combina con il contesto complessivo del documento.

Comprensione congiunta di HTML, tabelle e testo

DOM-LM, MarkupLM, TAT-QA/TAGOP

Questi lavori trattano la struttura dei documenti come informazione, invece di appiattire tutto in una sequenza di frasi.

MarkupLM e DOM-LM apprendono rappresentazioni che combinano testo e struttura HTML. TAGOP collega celle e porzioni di testo per eseguire ragionamenti. Sono candidati da confrontare con gli interpreti già presenti in PEE, non necessariamente sostituti.

Estrazione congiunta di misure e relazioni

MeasEval, CONNER, ChemDataExtractor 2

L’obiettivo è estrarre insieme valore, proprietà, oggetto, condizioni e legami, anziché riconoscerli separatamente e cercare di ricomporli dopo.

ChemDataExtractor 2 è particolarmente interessante perché genera parser a partire da modelli dichiarativi delle proprietà, in linea con l’architettura scelta per PEE.

Combinazione di segnali e gestione dell’incertezza

Snorkel, Weak Supervision, Selective Classification

Oggi PEE utilizza molteplici riconoscitori che possono contraddirsi. La letteratura studia come stimarne l’affidabilità, evitare di contare più volte indizi correlati e scegliere quando astenersi.

Questa famiglia di metodi potrebbe aiutare a combinare prova linguistica, struttura documentale, conoscenza e metodo sperimentale.

Interpretazione delle valutazioni qualitative

Aspect-Based Sentiment Analysis, Aspect–Opinion–Sentiment Triplet Extraction

Sono metodi per identificare che cosa viene giudicato, quale valutazione viene espressa e a quale oggetto si riferisce.

Per PEE andrebbero estesi con competenza della fonte, condizioni di utilizzo e fondamento osservativo. È un percorso ancora poco sviluppato nelle fasi S88–S91.

La distinzione fondamentale: questi studi descrivono algoritmi e architetture realmente utilizzati nella ricerca, ma non dimostrano automaticamente che uno di essi sia il migliore per PEE. I risultati pubblicati riguardano altri dataset e altri obiettivi.

Dobbiamo confrontarli sui problemi e sulle pagine reali di PEE, rispettando i vincoli di costo, licenza e autonomia.

4. Quale approccio scientifico sceglierei come prima ipotesi?

Non sceglierei immediatamente un grande modello linguistico, né continuerei ad aggiungere una nuova regola per ogni errore.

La mia prima ipotesi sarebbe un sistema ibrido di estrazione documentale guidato dalla conoscenza scientifica, organizzato così:

Documento HTML

Frasi, sezioni, tabelle, celle, metadati e fonti

Grafo delle evidenze

Collegamenti fra valori, proprietà, metodi, condizioni e prodotti

Definizioni scientifiche condivise

Vincoli, relazioni e conoscenza riutilizzabile

Inferenza con evidenze e incertezza

Attribuzione e ruolo della prova, con astensione motivata

Conoscenza verificabile e riutilizzabile

Lettura, valutazione, confronto e apprendimento

Questo non significa creare cinque moduli nuovi. Significa verificare se i componenti già esistenti — soprattutto l’interprete di tabelle 1G, la semantica documentale e le definizioni dichiarative — possono realizzare queste funzioni mediante un modello comune.

Un esempio del risultato desiderato: se PEE incontra una tabella senza verbi di misurazione, deve poter trovare la metodologia applicabile in un’altra sezione, attribuire correttamente la prova, conservarne il collegamento e riutilizzarlo. Se l’associazione non è dimostrabile, deve dichiararlo.

5. Come eviterei di perderci nuovamente

Il passo successivo dovrebbe essere un confronto scientifico circoscritto fra algoritmi, non una nuova ricerca generica di centinaia di fonti.

Confronterei, sullo stesso materiale:

* L’attuale sistema S90/S91, come riferimento.
* Un collegamento documentale esplicito che riutilizzi ContextLink1G e le relazioni già presenti.
* Un metodo di estrazione congiunta o selezione delle evidenze ispirato a SciREX/EIDER e ChemDataExtractor 2.
* Solo se i primi approcci risultano insufficienti, un modello leggero che utilizzi insieme HTML e testo, valutandone anche costi e licenza.

La valutazione dovrebbe distinguere provenienza della prova, metodo collegato, proprietà, condizioni, giudizi qualitativi, errori introdotti e risultati persi. E dovrebbe verificare se un miglioramento della conoscenza si propaga davvero a lettura, attribuzione e valutazione, anche su categorie nuove.

Non considererei la capacità dimostrata finché non supera una verifica indipendente su nuove pagine e non produce un beneficio misurabile sul percorso completo.

La mia conclusione sulle tue due domande

Prima domanda: ci siamo persi rispetto al piano scientifico?

Parzialmente sì. Abbiamo seguito la direzione corretta verso definizioni scientifiche generali e conoscenza riutilizzabile, ma abbiamo dedicato molte fasi a perfezionare riconoscitori locali. Una parte sostanziale delle tecniche studiate per collegare informazioni attraverso il documento non è stata ancora utilizzata.

Seconda domanda: dobbiamo tornare a studiare gli algoritmi scientifici?

Sì, in modo selettivo e sperimentale. Ho individuato qui alcune famiglie molto pertinenti, soprattutto document-level relation extraction, rappresentazioni della struttura HTML ed estrazione congiunta delle evidenze.

La cosa che vorrei evitare è che Claude risponda semplicemente aggiungendo altri termini o un nuovo insieme di regole a S91. Il problema richiede probabilmente un ragionamento più generale sulle relazioni documentali.

Non serve interrompere o sostituire il lavoro già fatto, né avviare una nuova architettura senza prove.

Il principio originale da recuperare è questo: non vogliamo insegnare a PEE a riconoscere meglio alcuni numeri. Vogliamo insegnargli a comprendere come si costruisce una prova scientifica, come interpretarla e come utilizzare quell’apprendimento ovunque sia pertinente.

S91 non ha ancora raggiunto questo obiettivo, ma ha individuato un caso concreto sul quale possiamo finalmente confrontare gli algoritmi giusti.

Sì, li ho ritrovati. E avevi ragione: nella risposta precedente non ti avevo restituito alcuni dei nomi fondamentali che avevamo già individuato.

Ho recuperato il documento originale del 17 ottobre 2026, intitolato PEE — Memoria strategica: conoscenza scientifica, estrazione guidata e apprendimento di categorie sconosciute. È precedente agli studi S87c–S91.

1. I sei nomi del programma originale

Questi sono i termini tecnici riportati nel documento, nella sezione 6.3.

Nome originale	Che cosa doveva imparare PEE
Transfer Learning	Trasferire competenze da un compito o una categoria a un’altra
Domain Generalization	Applicare conoscenze a categorie mai incontrate durante lo sviluppo
Meta-Learning / Learning to Learn	Imparare strategie che permettano di apprendere nuove categorie
Ontology Learning / Knowledge Graph Induction	Acquisire automaticamente concetti scientifici e relazioni fra essi
Active Learning / Active Curriculum Selection	Scegliere quali fonti, esperimenti e categorie studiare per ottenere il maggiore guadagno di conoscenza
Continual Learning	Migliorare progressivamente senza perdere competenze già acquisite

Questi erano i concetti strategici originali. Non sono tutti singoli algoritmi: sono famiglie di metodi e campi di ricerca, all’interno dei quali occorre identificare algoritmi concreti.

La formulazione che avevamo adottato era generalizzazione interdominio e meta-apprendimento procedurale del sistema, senza affermare che PEE stesse già addestrando autonomamente un modello neurale.

2. I nomi degli studi e algoritmi approfonditi successivamente in S87c

Ho ritrovato anche quelli nel documento scientifico di Claude:

Ambito	Nomi registrati
Estrazione di misure	MeasEval, ChemDataExtractor 2, CQE, grobid-quantities, AxCell
Relazioni tra parti del documento	DocRED, Re-DocRED, EIDER, SciREX, TAT-QA
Rappresentazione del significato	FrameNet, I-ADOPT, SOSA/SSN, OBOE, QUDT, LOINC
Combinazione di segnali	Snorkel, FlyingSquid, WRENCH, Probabilistic Soft Logic (PSL)
Apprendimento di relazioni e vocabolario	Distant Supervision, Snowball, Active Learning
Verifica dei vincoli scientifici	SHACL, VIM, GUM

Sono riportati nello studio docs/plans/s87c-source-study-and-representation-contract.md, con le fonti specifiche nelle note docs/research/s87c/.

Alcuni nomi sono benchmark, altri algoritmi, standard, ontologie o sistemi di riferimento: non vanno trattati come tecnologie equivalenti.

3. La cosa fondamentale che avevamo stabilito

Rileggendo il documento del 17 ottobre emerge una differenza importante rispetto al lavoro recente.

Non volevamo soltanto che PEE riconoscesse meglio il significato di un valore.

Volevamo che imparasse un metodo generale per acquisire conoscenza scientifica.

Il ciclo che avevamo definito era:

Ricerca scientifica iniziale

Conoscenza preliminare

Domande e ricerca più intelligenti

Estrazione di nuove evidenze

Verifica e conoscenza migliorata

Le conoscenze acquisite devono migliorare la lettura e le successive ricerche, con verifica esterna.

Il documento prevedeva persino un esperimento su una decima categoria mai insegnata, per verificare se PEE avesse imparato un procedimento trasferibile, non soltanto un nuovo insieme di definizioni.

4. Che cosa significa per il lavoro attuale?

S88–S91 affrontano soprattutto due parti di questo programma:

* Ontology Learning / Knowledge Representation: definizioni, proprietà, condizioni e relazioni.
* Domain Generalization: verifica dell’interpretazione su editori e categorie non utilizzati nello sviluppo.

Il resto, in particolare Meta-Learning, Active Curriculum Selection e Continual Learning, non è ancora stato dimostrato come capacità generale di PEE.

Questo non annulla i progressi recenti. Ci dice però che non dobbiamo confondere la costruzione del patrimonio scientifico con l’apprendimento del metodo per costruirlo autonomamente.

La tua preoccupazione era quindi fondata. Ho ritrovato sia i sei nomi del programma strategico originale sia le metodologie specifiche studiate successivamente. Sono due livelli diversi della ricerca e dobbiamo conservarli entrambi.

Prima di far procedere Claude, userei proprio questa distinzione per verificare che il prossimo lavoro contribuisca all’obiettivo originale e non si limiti a perfezionare indefinitamente il classificatore del ruolo della prova.

Sì, li ho ritrovati esattamente. E la tua osservazione merita attenzione: quegli approcci furono scartati dopo esperimenti condotti con una rappresentazione scientifica molto più debole di quella che stiamo sviluppando oggi.

Non sono ricordi vaghi: ho recuperato i commit originali di R3, ciclo 3, S76, del 19 ottobre 2026, e la successiva revisione S77.

1. I modelli e gli algoritmi effettivamente sperimentati

Approccio	Nome esatto	Scopo
NLI — Natural Language Inference	cross-encoder/nli-deberta-v3-xsmall	Stabilire se un’espressione corrisponde semanticamente a un concetto scientifico
Small Language Model	Qwen/Qwen2.5-0.5B-Instruct	Classificare la relazione fra espressione e concetto
LLM locale	Qwen/Qwen2.5-1.5B-Instruct	Distinguere identità, somiglianza, gerarchia e assenza di relazione
Corpus-distributional similarity	Recupero per somiglianza distribuzionale	Individuare concetti candidati da sottoporre a verifica
Semantic-type gating	dn.1 + allineamento v1	Escludere collegamenti fra concetti di tipo incompatibile

I due Qwen erano modelli linguistici veri e propri; DeBERTa era utilizzato come classificatore NLI, non come generatore di testo.

Il codice dell’esperimento è ancora identificato in scripts/r3-semantic/validate.py e scripts/r3-semantic-score.mjs. I modelli non vennero integrati nel percorso operativo.

Fonte: commit S76 — esperimento semantico e risultati⁠￼.

Sì. Escludendo gli LLM, riprenderei tre meccanismi sperimentati in R3, ma non li riattiverei indiscriminatamente. Li metterei alla prova con la nuova rappresentazione scientifica costruita in S87c–S91.

Ho verificato che il codice di questi meccanismi è ancora nel repository, soprattutto in src/knowledge_translation.ts. Quindi non dobbiamo ricostruirli da zero.

Che cosa vale la pena recuperare

Metodo di R3	Mia valutazione	Perché
Semantic-Type Gating (denotationOf, alignWithType)	Priorità alta	Impedire che un termine relativo a una condizione, a una proprietà o a un risultato venga collegato a un concetto di tipo incompatibile
Corpus-Distributional Similarity — PPMI + Cosine Similarity (trainDistributional)	Da riprovare	Trovare espressioni e concetti candidati nei documenti scientifici, anche quando utilizzano parole differenti
Document Concepts / Knowledge Graph Induction (documentConcepts)	Priorità molto alta	Conservare nuovi concetti, distinzioni e relazioni incontrati nei documenti anziché perderli quando non corrispondono al vocabolario esistente

1. Semantic-Type Gating

In R3 aveva ridotto le false identità da 18 a 4, ma riconosceva correttamente soltanto il 45% dei tipi semantici nel primo test.

Oggi abbiamo definizioni più ricche: proprietà, oggetti, unità, condizioni e relazioni.

Verificherei se queste conoscenze possono migliorare il riconoscimento dei tipi, invece di utilizzare prevalentemente le vecchie parole-segnale.

2. PPMI e somiglianza distribuzionale

L’algoritmo era stato addestrato sui documenti scientifici dell’utente, utilizzando finestre di parole e Positive Pointwise Mutual Information.

Non aveva superato il recupero lessicale: nei primi tre candidati trovava 21 identità su 25, contro 22 del metodo lessicale.

Ma potrebbe essere utile in un ruolo più limitato: proporre nuovi termini, non dichiarare automaticamente che due concetti sono identici.

Lo confronterei nuovamente con il metodo lessicale, sulla base di riferimenti indipendenti e categorie nuove. Se non aggiunge valore, non lo utilizzerei.

3. Document Concepts e Knowledge Graph Induction

Questo è il metodo che considero strategicamente più interessante.

In R3 avevamo individuato centinaia di espressioni scientifiche che PEE non sapeva collegare alla conoscenza esistente.

Il problema era che poteva conservarle come espressioni, ma non stabilire se indicassero lo stesso concetto, concetti correlati oppure proprietà differenti.

Oggi possiamo tentare di sfruttare le definizioni scientifiche condivise per costruire e verificare quelle relazioni.

Questo contribuirebbe direttamente all’apprendimento di nuove categorie, invece di limitarsi a migliorare un classificatore.

E per il problema attuale di S91?

Qui farei una distinzione fondamentale.

Nessuno dei tre metodi risolve automaticamente il collegamento fra una metodologia di prova e la tabella che ne contiene i risultati.

Per questo continuerei in parallelo a sperimentare le relazioni documentali già presenti in ContextLink1G e methodLinks, applicando i principi studiati in DocRED, EIDER e SciREX.

È probabilmente l’intervento più direttamente utile alla lettura delle prove originali.

Che cosa non riprenderei per ora

Non riprenderei i due Qwen. E non considererei prioritario neppure il classificatore NLI deberta-v3-xsmall: nella verifica S76 aveva riconosciuto soltanto 4 identità su 14, promuovendo erroneamente sette concetti correlati a identità. Un nuovo test avrebbe senso soltanto dopo aver migliorato le informazioni e le relazioni fornite al modello.

Inoltre, PPMI, Semantic-Type Gating e Document Concepts non erano tutti stati cancellati: nel repository esistono ancora. Era stato interrotto soprattutto il percorso sperimentale verso il loro utilizzo operativo.

La mia proposta è quindi recuperare e confrontare i tre metodi non generativi, concentrandoci soprattutto su Knowledge Graph Induction e sulla comprensione delle relazioni documentali.

E lo farei con un criterio preciso: non basta migliorare la somiglianza tra termini. La nuova conoscenza deve consentire a PEE di recuperare più prove corrette, attribuirle meglio e riutilizzarle anche su categorie mai insegnate.

La tua intuizione è plausibile: le debolezze della vecchia rappresentazione possono aver limitato quegli algoritmi. Ma non abbiamo ancora dimostrato che, con l’architettura nuova, funzioneranno meglio. Questo è esattamente l’esperimento che ora vale la pena fare, senza tornare indietro e senza introdurre LLM.
