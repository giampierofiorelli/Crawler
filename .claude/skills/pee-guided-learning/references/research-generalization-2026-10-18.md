# Owner research — engineering techniques for generalisation (2026-10-18), preserved as delivered

**Status.** Owner research and assessment, delivered in Italian after the 1G report (Crawler `dc80b9f`). It is direction
and engineering reference, **not** a capability and **not** an authorisation for a phase. Claude's analysis of it
against the repository, and the working discipline derived from it, are in
[generalization-method.md](generalization-method.md). Nothing below is edited; facts it states that Claude has not
verified (e.g. licences, catalogue dates) stay owner statements until verified.

---

Se serve, parto in Toto rendilo anche parte della skill

Sono d’accordo con la tua proposta: darei a Claude direttamente la ricerca ingegneristica che abbiamo appena fatto e lascerei che sia lui a ragionare su come applicarla a PEE. Non preparerei un altro lungo prompt prescrittivo.

Anzi, invertirei proprio l’ordine delle prossime attività: prima rafforzare la capacità generale di apprendere e interpretare; poi utilizzare quella capacità per integrare operativamente la conoscenza scientifica di cui abbiamo parlato.

Questo potrebbe evitare di costruire il sistema della conoscenza sopra un interprete che continua ad avere problemi di generalizzazione.

Anche l’idea della skill è sensata, con una precisazione: la skill servirebbe a disciplinare il lavoro di Claude Code, mentre i meccanismi di generalizzazione che devono funzionare autonomamente in PEE dovranno essere implementati nel software. Le due cose sono complementari.

Sulle unità di misura, però, farei una distinzione importante.

QUDT è molto ampio, ma non comprende necessariamente tutte le metriche

Ho verificato il catalogo ufficiale QUDT aggiornato a settembre 2026⁠￼. Contiene vocabolari per unità, grandezze fisiche, dimensioni e relativi sistemi. È una base scientifica molto solida.

Esiste anche UCUM⁠￼, uno standard specificamente pensato per rappresentare le unità di misura in modo non ambiguo tra sistemi informatici.

Ma dobbiamo distinguere:

Elemento	Esempio
Unità	dBA, W, kWh, m³/h
Grandezza	Livello sonoro, potenza, energia, portata
Metrica applicativa	CADR, efficacia di rimozione delle macchie
Metodo	Protocollo utilizzato per misurare la prestazione
Condizioni	Modalità, temperatura, durata, distanza

Una metrica specifica può richiedere conoscenze che un’ontologia generale delle unità non contiene.

Quindi sì: quando PEE incontra una misura sconosciuta, dovrebbe essere capace di avviare una ricerca scientifica mirata, purché l’accesso online sia autorizzato e conforme alle politiche delle fonti.

La procedura ideale sarebbe:

* Cercare prima nella conoscenza interna.
* Consultare QUDT e, quando utile, UCUM.
* Se manca la definizione, cercare fonti scientifiche o normative autorevoli.
* Ricostruire grandezza, unità, metodologia, condizioni e significato.
* Validare la nuova conoscenza e renderla riutilizzabile, senza creare una nuova regola specifica nel codice.
* Riesaminare, quando possibile, le precedenti osservazioni rimaste irrisolte.

Non deve effettuare una ricerca online a ogni incontro con una misura già conosciuta.

Una precisazione sulle licenze: QUDT è distribuito con licenza CC BY 4.0, che richiede attribuzione. Prima di importarne automaticamente i dati in PEE bisognerà verificare la compatibilità con le regole del progetto. Consultarlo come riferimento e incorporarne il vocabolario sono due operazioni diverse.

E per Claude farei esattamente come suggerisci

Una volta conclusa la fase 1G, gli passerei la ricerca ingegneristica precedente integralmente, senza trasformarla subito in una lista di istruzioni implementative.

Vorrei che Claude valutasse autonomamente quali principi sono già presenti, quali sono veramente nuovi, quali tecniche possono essere integrate e se convenga formalizzare la metodologia nella skill scientifica esistente oppure in una componente distinta, senza duplicazioni.

Non gli chiederei ancora di integrare tutta la conoscenza scientifica. Prima deve essere robusto il meccanismo generale che la utilizzerà.

La distinzione decisiva che conserverei è questa:

Claude può imparare e applicare una metodologia di generalizzazione durante lo sviluppo; PEE deve invece acquisire meccanismi propri per utilizzare conoscenza, valutare controesempi e migliorare senza dipendere continuamente da Claude.

Se riusciamo a ottenere questo risultato, avremo costruito qualcosa di molto più utile di un interprete che funziona soltanto sulle tabelle già incontrate.

La ricerca scientifica conferma che esistono tecniche ingegneristiche concrete per favorire e verificare la generalizzazione. Non dobbiamo inventare da zero un metodo per PEE.

La conclusione principale è che il problema non si risolve aggiungendo più regole, né semplicemente usando un modello AI. Occorre cambiare come vengono rappresentate le conoscenze, come vengono formulate le ipotesi e soprattutto come si decide se una correzione è davvero generale.

Uno studio pubblicato su Nature Machine Intelligence identifica proprio il fenomeno che abbiamo osservato: shortcut learning, cioè sistemi che imparano scorciatoie efficaci sui dati conosciuti ma fragili quando cambiano le condizioni. Succede anche nel machine learning avanzato.

Per PEE distinguerei due obiettivi:

* Generalizzazione della comprensione: riconoscere la stessa relazione scientifica in prodotti, categorie, linguaggi e strutture HTML differenti.
* Generalizzazione dell’apprendimento: ricavare da un errore un principio riutilizzabile, anziché una nuova eccezione.

1. Inductive Logic Programming (ILP): imparare relazioni, non parole

È una delle tecniche più pertinenti per il nostro progetto.

L’Inductive Logic Programming costruisce ipotesi logiche utilizzando esempi e conoscenze già disponibili. Invece di memorizzare singole associazioni, tenta di ricostruire regole relazionali che valgono anche per casi nuovi. È un settore consolidato, con una rassegna scientifica importante pubblicata nel 2022.

Esempio per PEE.

Approccio fragile

if label contains "Noise" and unit contains "dBA" → extract measurement

Principio generalizzabile

Una cella numerica può rappresentare un’osservazione quando la struttura e le evidenze del documento identificano una grandezza, una relazione con il soggetto misurato e le eventuali condizioni applicabili.

Il secondo principio può funzionare anche per temperature, potenze, portate, tempi, consumi e grandezze ancora sconosciute, perché opera sulle relazioni.

In pratica, PEE potrebbe avere predicati generali come:

hasQuantity, hasUnit, appliesToProduct, underCondition, supportedBySource, hasMethod.

Le lezioni scientifiche aggiungerebbero conoscenza a questi predicati, non nuovi percorsi di codice per singoli prodotti.

Questa tecnica non garantisce automaticamente di apprendere la regola giusta: la qualità degli esempi, dei controesempi e della conoscenza di partenza rimane decisiva.

2. CEGIS: apprendere attraverso controesempi

Questa tecnica è ancora più interessante per il modo in cui Claude sta già lavorando.

Counterexample-Guided Inductive Synthesis (CEGIS) è un metodo di sintesi di programmi in cui un sistema propone una soluzione, un verificatore cerca un controesempio e quel controesempio viene utilizzato per restringere lo spazio delle soluzioni successive.

Non è semplicemente «correggere e riprovare»: la nuova soluzione deve rispettare anche i vincoli emersi dagli errori precedenti.

Proposta di una regola generale

Verificatore cerca controesempi

Nessun errore trovato

Passa alla validazione indipendente

Controesempio trovato

Riformula il principio, non aggiungere una toppa

Nuova iterazione controllata

Immaginiamo che PEE impari questa ipotesi: «Ogni numero vicino alla parola power è un valore in watt».

Il verificatore produce un controesempio: power consumption per year, espresso in kWh.

La correzione generale non sarebbe «aggiungi un’eccezione per annual power». Sarebbe distinguere potenza ed energia attraverso le loro dimensioni fisiche.

Questo è un vero miglioramento trasferibile.

Per PEE implementerei inizialmente un ciclo ispirato a CEGIS, senza dichiararlo una sintesi formalmente verificata finché non esisteranno specifiche e verificatori sufficientemente completi.

3. Ontologie scientifiche e sistemi di tipi: generalizzare attraverso la fisica

Questa tecnica, per PEE, potrebbe avere un impatto immediato.

In ingegneria del software si utilizzano sistemi di tipi per impedire operazioni prive di significato. Possiamo applicare lo stesso principio alle osservazioni scientifiche.

Esiste uno standard di riferimento chiamato QUDT — Quantities, Units, Dimensions and Types⁠￼, che rappresenta grandezze, unità, dimensioni fisiche e relazioni tra loro. Non è semplicemente un elenco di abbreviazioni: consente ragionamenti sulla compatibilità e sulle conversioni.

Ecco cosa cambierebbe.

Testo trovato	Riconoscimento semantico
350 m³/h	Portata volumetrica
206 CFM	Portata volumetrica
42 dB(A)	Livello sonoro ponderato A
1200 W	Potenza
1,2 kWh	Energia
45 °C	Temperatura

PEE potrebbe comprendere che le prime due misure riguardano la stessa dimensione fisica, pur richiedendo un controllo sul fatto che rappresentino anche la stessa prestazione e le stesse condizioni.

Comprenderebbe inoltre che W e kWh non sono grandezze intercambiabili e che un livello sonoro in dBA non può essere trattato automaticamente come equivalente a qualunque valore indicato genericamente in dB.

L’algoritmo generale sarebbe:

Testo o tabella
    ↓
Identificazione delle quantità candidate
    ↓
Recupero della conoscenza scientifica
    ↓
Controllo dimensionale e semantico
    ↓
Verifica delle condizioni e della fonte
    ↓
Interpretazione verificata o astensione

Questo è molto più generalizzabile di cento regex per cento unità.

E soprattutto permette di utilizzare le ricerche scientifiche che abbiamo già svolto: la conoscenza di nuove categorie alimenta lo stesso sistema di tipi, relazioni e metodologie.

Nota tecnica: QUDT è un ottimo riferimento per progettare la rappresentazione, ma non implicherei automaticamente l’importazione dell’intera ontologia. I dati hanno proprie condizioni di licenza e PEE deve conservarne la conformità.

4. Constraint-based reasoning: comprendere una tabella come un problema di vincoli

Qui incontriamo un’altra tecnica ben applicabile a PEE: Constraint Satisfaction Problems (CSP), eventualmente con vincoli pesati.

Il principio è formulare più interpretazioni dell’intera tabella e scartare quelle che violano fatti strutturali o scientifici certi.

Consideriamo una tabella con tre modalità operative, due prodotti e sei valori numerici.

Le ipotesi potrebbero essere:

* Le righe rappresentano velocità.
* Le colonne rappresentano prodotti.
* I numeri rappresentano una grandezza fisica identificata nella didascalia.

L’interprete dovrebbe distinguere due tipi di vincoli.

Vincoli forti: un’intestazione HTML esplicitamente collegata a una cella, un’identità documentata, una dimensione fisica incompatibile, oppure una condizione esplicitamente negata dalla fonte.

Vincoli deboli: la plausibilità di una misura, le relazioni fisiche comunemente osservate, l’analogia con altre tabelle o i suggerimenti forniti dalla conoscenza della categoria.

Un vincolo debole può sostenere un’ipotesi, ma non deve prevalere sulla struttura certa né diventare prova dell’esistenza di una misura.

È la direzione già esplorata dai sistemi di interpretazione semantica congiunta come TableMiner+⁠￼, che utilizzano informazioni interne ed esterne alla tabella.

La generalizzazione deriva da questo: i vincoli riguardano relazioni astratte, non l’identità dell’editore o il nome del prodotto.

E suggerirei di penalizzare le interpretazioni che richiedono troppe assunzioni non documentate, mantenendo sempre la possibilità di non scegliere nessuna ipotesi.

5. Metamorphic Testing e Property-Based Testing: testare proprietà generali

Claude sta già utilizzando una parte di questa metodologia. Possiamo renderla molto più sistematica.

Il metamorphic testing verifica relazioni che devono rimanere vere tra input trasformati e relativi risultati. È una tecnica particolarmente utile quando non è facile sapere preventivamente quale debba essere l’output esatto di ogni caso.

Per PEE, proporrei trasformazioni di due tipi:

Trasformazione	Comportamento corretto
Scambiare due colonne preservando le intestazioni	Stesse osservazioni, con nuove coordinate
Trasporre una tabella valida	Stessi significati e relazioni
Sostituire nomi di prodotti con altri identificatori validi	Stesso schema interpretativo, identità aggiornate
Convertire un valore tra unità compatibili	Grandezza fisica equivalente
Rimuovere una dichiarazione metodologica essenziale	Perdita della relativa attribuzione, non invenzione del metodo
Cambiare esplicitamente una modalità operativa	Aggiornamento delle condizioni dell’osservazione
Aggiungere una tabella di specifiche accanto a una tabella di test	Nessuna contaminazione tra dichiarazioni e misure

Le prime trasformazioni verificano l’invarianza. Le ultime verificano la sensibilità alle informazioni realmente importanti.

Per generare automaticamente centinaia di variazioni, un’opzione concreta nel nostro ambiente TypeScript è fast-check⁠￼: genera input secondo proprietà dichiarate e riduce i casi falliti a controesempi più piccoli (shrinking).

Non propongo di aggiungerlo automaticamente come dipendenza: prima occorre verificare cosa possiede già il runner dei test. Ma è una tecnologia concreta da considerare.

Il punto fondamentale è che superare tutti questi test non garantisce la comprensione semantica; impedisce però molte forme di comportamento fragile.

6. Out-of-Distribution Generalization: dimostrare che funziona su dati davvero nuovi

Questa è la tecnica di validazione che considero più importante per impedire a Claude di continuare a correggere casi specifici.

Nella letteratura scientifica si parla di Out-of-Distribution (OOD) Generalization: verificare che un sistema funzioni anche quando i nuovi dati differiscono da quelli utilizzati nello sviluppo.

Il progetto WILDS⁠￼, presentato a ICML 2021, ha dimostrato quanto possano diminuire le prestazioni quando cambia il contesto dei dati. Il lavoro TableShift⁠￼ ha studiato specificamente questo fenomeno per il machine learning su dati tabellari.

Per PEE non basta scegliere casualmente nove tabelle da quelle già disponibili.

Dobbiamo distinguere diversi tipi di novità.

Test	Che cosa dimostra
Editore mai utilizzato nello sviluppo	Trasferimento a nuovi siti
Categoria mai utilizzata nello sviluppo	Trasferimento della comprensione scientifica
Struttura HTML mai utilizzata	Generalizzazione strutturale
Grandezza fisica nuova	Capacità di utilizzare nuove conoscenze
Metodo sperimentale differente	Generalizzazione dell’attribuzione
Nuovo prodotto su un editore già noto	Robustezza rispetto alle identità

Una metodologia standard è il GroupKFold / Leave-One-Group-Out⁠￼: tutte le osservazioni di un gruppo, per esempio un editore, restano insieme nello stesso lato della divisione tra sviluppo e verifica.

Dobbiamo anche deduplicare copie e pagine equivalenti: se una tabella identica compare sia nello sviluppo sia nella verifica, non abbiamo dimostrato generalizzazione.

Il risultato dovrebbe mostrare non soltanto l’accuratezza complessiva, ma anche le prestazioni nei gruppi più difficili e il numero di interpretazioni ingiustificate.

7. Minimum Description Length: penalizzare la complessità superflua

Un altro metodo interessante è il Minimum Description Length (MDL), un principio di selezione dei modelli che bilancia la capacità di spiegare i dati con la complessità della spiegazione.

È un approccio formalizzato nella teoria dell’inferenza statistica.

Per PEE possiamo ricavarne una regola ingegneristica:

Quando due algoritmi danno risultati comparabili sui test indipendenti, preferire quello con meno eccezioni, meno parametri arbitrari e una spiegazione più generale.

Esempio:

* Soluzione A: dodici controlli speciali per etichette di potenza, consumo e autonomia.
* Soluzione B: un meccanismo per identificare dimensioni fisiche, condizioni temporali e tipi di osservazione.

Se B dimostra prestazioni almeno equivalenti su dati nuovi, ha un vantaggio architetturale importante: può essere esteso introducendo conoscenza, senza cambiare continuamente il codice.

Attenzione: la soluzione più corta non è necessariamente quella giusta. MDL è un principio di selezione, non una prova di correttezza. I vincoli scientifici e la verifica indipendente rimangono prioritari.

8. Selective Prediction: conoscere i limiti della propria comprensione

La ricerca sulla Selective Classification studia sistemi che possono astenersi quando non dispongono di elementi sufficienti, bilanciando affidabilità e quantità delle risposte prodotte.

Per PEE è essenziale.

Non vogliamo che impari a generalizzare aumentando il numero delle interpretazioni sbagliate.

Dobbiamo misurare congiuntamente:

* Coverage: quante osservazioni interpreta.
* Precisione: quante interpretazioni prodotte sono corrette.
* Correttezza completa: quante includono prodotto, grandezza, unità, condizioni e provenienza esatti.
* Astensioni giustificate: quanti casi lascia irrisolti per motivi effettivamente fondati.

Nel recente esperimento 1G, Claude ha riferito solo 8 condizioni corrette su 54 nel set di controllo. Questo suggerisce che il recupero delle condizioni rimane un problema importante, ma non identifica da solo la soluzione.

Un sistema più generale potrebbe inizialmente estrarre meno osservazioni, ma essere molto più affidabile su quelle che interpreta.

Il nostro obiettivo è aumentare progressivamente la copertura mantenendo sotto controllo gli errori scientifici, non massimizzare il numero di numeri estratti.

9. Come combinerei concretamente queste tecniche in PEE

La soluzione non è scegliere un unico algoritmo vincente. È combinarli in un’architettura nella quale ciascuno risolve un problema specifico.

Acquisizione neutra 1F

Già implementata, verifica limitata superata

Riconoscimento relazionale + conoscenza scientifica

Tipi fisici, unità, metodologie, relazioni, esperienze

Inferenza globale e vincoli

Ipotesi sull’intera tabella, controllo del documento e delle contraddizioni

Osservazioni o astensioni

Fonte, condizioni e dipendenze sempre tracciabili

Apprendimento da errori e controesempi

ILP / CEGIS-inspired, lezioni generali versionate

Validazione e promozione

Ablazioni, metamorfici, test OOD, regressioni, rollback

È un’architettura proposta, non qualcosa che PEE abbia già completato.

Un ciclo algoritmico concreto

Questa sarebbe la logica essenziale del meccanismo di apprendimento, da integrare con l’infrastruttura già esistente:

Quando PEE incontra un errore:
  1. Identifica il primo ragionamento scorretto.
  2. Recupera la conoscenza scientifica pertinente.
  3. Formula un principio generale candidato.
  4. Raccoglie esempi positivi e controesempi.
  5. Genera trasformazioni strutturali equivalenti.
  6. Verifica:
       - correttezza;
       - assenza di regressioni;
       - dipendenza effettiva dalla nuova conoscenza;
       - comportamento su gruppi non usati
         per costruire la soluzione.
  7. Esegue l'ablazione del nuovo principio.
  8. Se la prova è insufficiente:
       mantiene il principio sperimentale,
       senza promuoverlo.
  9. Se la validazione è adeguata:
       versiona e promuove la lezione
       attraverso le procedure esistenti.
 10. Identifica letture precedenti che potrebbero
       beneficiare della nuova conoscenza.

La parte particolarmente interessante è il punto 6: il programma non deve soltanto dimostrare che il nuovo principio produce risultati migliori, ma anche che la conoscenza aggiunta è effettivamente responsabile del miglioramento.

Ad esempio, in una prova controllata possiamo confrontare lo stesso interprete con la conoscenza acustica disponibile e senza quella conoscenza, a parità di input e altri meccanismi.

Se l’effetto è nullo, dobbiamo capire se la conoscenza non viene consultata, non viene utilizzata oppure non serve in quel caso.

10. Quali tecniche introdurrei per prime

Questa è la mia priorità ingegneristica per PEE, tenendo conto dei costi e dell’attuale livello di sviluppo.

Tecnica	Priorità	Impatto previsto
Tipi scientifici, grandezze e relazioni	Molto alta	Comprensione trasferibile tra categorie
Inferenza globale con vincoli	Molto alta	Interpretazione coerente della tabella
Test OOD per editore, categoria e struttura	Molto alta	Verifica reale della generalizzazione
Property-based e metamorphic testing	Molto alta	Individuazione di scorciatoie ed errori
Apprendimento da controesempi, stile CEGIS/ILP	Alta	Lezioni riutilizzabili anziché correzioni locali
Complessità e semplicità del modello, ispirate a MDL	Alta	Contenimento delle eccezioni
Selective prediction / astensione	Alta	Controllo degli errori scientifici
IRM e Group DRO	Successiva, se giustificata	Tecniche di apprendimento robusto per modelli addestrati

Le ultime due famiglie di ottimizzazione, Invariant Risk Minimization e Group Distributionally Robust Optimization, hanno basi scientifiche solide, ma sono sviluppate principalmente per modelli addestrati su distribuzioni di dati. Non le implementerei direttamente nel nostro interprete TypeScript senza una necessità dimostrata. I loro principi di invarianza e valutazione per gruppi, invece, sono già utili.

11. Come impedire concretamente a Claude di tornare alle correzioni specifiche

Qui serve qualcosa di più di un’istruzione nel CLAUDE.md.

Introducerei una procedura obbligatoria di ammissione delle nuove lezioni.

Prima di promuovere una modifica interpretativa, Claude dovrebbe documentare:

Campo	Domanda
Failure mechanism	Qual è il difetto generale?
Scientific or structural principle	Quale conoscenza lo corregge?
Applicability	Su quali strutture e condizioni dovrebbe valere?
Counterexamples	Dove potrebbe fallire?
Independent evidence	Ha funzionato su dati estranei allo sviluppo?
Ablation	La lezione contribuisce realmente?
Regression	Quali comportamenti corretti peggiora?
Rollback	Come viene disattivata se fallisce?

Il controllo può essere automatizzato per la presenza dei dati, l’esecuzione dei test e il blocco della promozione. Non può, da solo, dimostrare matematicamente che un principio semantico valga universalmente.

Questo sarebbe coerente con il modo in cui Claude ha già iniziato a utilizzare GL1–GL10, ma introdurrebbe una disciplina molto più rigorosa prima della promozione.

Conclusione della ricerca

La combinazione che considero più promettente per PEE è:

Apprendimento relazionale (ILP) + controesempi (CEGIS) + conoscenza scientifica tipizzata (QUDT come riferimento) + inferenza vincolata + verifica metamorfica e OOD.

Non sono nomi scelti arbitrariamente: ciascuna di queste tecniche è sostenuta da un filone di ricerca scientifica e affronta un problema che abbiamo effettivamente incontrato.

La scoperta che ritengo più utile è questa:

Dobbiamo spostare progressivamente la complessità dal codice alla rappresentazione della conoscenza.

Quando PEE incontra una nuova grandezza fisica, non dovrebbe richiedere un’altra versione dell’interprete. Dovrebbe apprendere la grandezza, le sue unità, le relazioni e le condizioni di misura, e il medesimo algoritmo generale dovrebbe cominciare a utilizzarle.

Quando incontra un nuovo formato di tabella, dovrebbe provare a ricostruirne le relazioni attraverso i vincoli strutturali e scientifici già acquisiti.

Quando fallisce, dovrebbe cercare un controesempio che gli permetta di correggere il principio, non soltanto l’istanza.

Questo è il percorso ingegneristico più concreto che vedo per provare ad arrivare a una generalizzazione significativa senza dipendere necessariamente da un modello AI per ogni nuova pagina.

Non trasformerei ancora questa ricerca in un nuovo incarico per Claude. La conserverei come base tecnica da confrontare con il rapporto 1G, così da scegliere i meccanismi realmente mancanti e non pagare per ricostruire quelli già presenti.

Il risultato di 1G è molto importante: abbiamo finalmente una base da cui generalizzare

Ho verificato nel repository la presenza del nuovo table_interpreter1g.ts, delle lezioni GL e degli strumenti di valutazione pubblicati. Il codice conferma che l’interpretazione globale precede la ricostruzione delle osservazioni, senza utilizzare le conclusioni dei vecchi lettori.

Per la prima volta abbiamo anche un confronto sperimentale abbastanza chiaro tra il nuovo approccio e i precedenti.

Risultati sul campione di controllo di Claude

151 elementi annotati, 8 tabelle distinte

Il nuovo lettore raggiunge 89/151 elementi corretti, circa il 59%, contro 3/151 per ciascun lettore precedente. I risultati sono quelli riferiti da Claude; non ho rieseguito indipendentemente il benchmark.

È un miglioramento molto ampio sul campione esaminato. Ed è importante che Claude abbia congelato il codice prima della prima valutazione di controllo e abbia lasciato GL9 e GL10 provvisorie, perché derivate da errori osservati proprio in quel controllo.

Ma c’è un risultato che dobbiamo guardare con particolare attenzione:

Condizioni sperimentali correttamente recuperate

8/54

circa 15%

In più, Claude riporta 28 condizioni aggiuntive non presenti nelle annotazioni. La loro natura va verificata: non possiamo considerarle tutte false senza esaminare le fonti.

Il lettore sta imparando a riconoscere la struttura della tabella molto più efficacemente, ma non comprende ancora abbastanza le condizioni scientifiche che danno significato alle misure.

Questo coincide precisamente con il problema che avevi individuato.

Quello che ho scoperto guardando il codice

C’è un dettaglio che rafforza la tua idea di affrontare subito la generalizzazione.

Il nuovo 1G recupera il lessico di Phase272:

UNIT_LEXICON272, DIMENSION_WORDS272, TEST_CONTEXT272

Ma contiene ancora elenchi e riconoscitori scritti manualmente, come PROPERTY_WORDS, PROPERTY_HEAD, SETTING, TEST_CUE e METHOD_HEAD.

Non è automaticamente un errore. Alcuni riconoscitori linguistici sono necessari.

Il problema è che questo non equivale ancora a un motore che consulta sistematicamente la conoscenza scientifica acquisita, comprende le relazioni tra grandezze e metodologie e le applica a categorie nuove.

Quindi 1G rappresenta un salto architetturale reale, ma la generalizzazione rimane in parte sostenuta da vocabolari e regole progettati manualmente. È esattamente ciò che vorremmo superare, almeno dove possibile.

Questo è verificabile direttamente nel codice dell’interprete 1G⁠￼.

Cosa considero dimostrato e cosa no

Aspetto	Valutazione
Nuova architettura globale	Implementazione verificata nel codice
Miglioramento sui campioni	Forte, secondo i benchmark di Claude
Ablazioni e lezioni GL	Implementate e sperimentate
Condizioni metodologiche	Ancora un limite rilevante
Generalizzazione a editori nuovi	Non dimostrata
Uso sistematico della conoscenza scientifica	Non ancora dimostrato
Apprendimento autonomo di PEE	Non dimostrato
Utilizzabilità per il ranking operativo	Non ancora autorizzata né validata

C’è anche un elemento molto positivo: il costo computazionale riportato è contenuto — mediana di 52 ms per pagina e 193 MB di memoria sul corpus. Questo ci permette di sperimentare metodi di ragionamento più robusti senza assumere immediatamente che servirà un modello AI.

La suite di 4.639 test passati e le regressioni invariate sono buoni risultati ingegneristici, ma non dimostrano da soli la correttezza scientifica su fonti nuove.

Adesso seguirei esattamente la sequenza che hai proposto

Prima la generalizzazione, poi l’integrazione approfondita della conoscenza scientifica.

Passerei a Claude integralmente la ricerca sulle tecniche ingegneristiche che abbiamo appena svolto: ILP, CEGIS, sistemi di tipi scientifici, ragionamento per vincoli, metamorphic testing, OOD, MDL e selective prediction.

Non gli darei un altro prompt che gli dica già quali componenti implementare. Voglio che esamini queste tecniche alla luce di ciò che ha appena costruito e distingua autonomamente:

* ciò che 1G già realizza;
* ciò che è soltanto imitato attraverso euristiche;
* ciò che può diventare un meccanismo generale riutilizzabile;
* ciò che conviene formalizzare nella skill esistente;
* come dimostrare che le nuove capacità si trasferiscono a tabelle ed editori sconosciuti.

Gli chiederei anche di ragionare sull’apprendimento dai controesempi senza trasformarlo in un’autorizzazione a continuare a correggere sempre gli stessi campioni.

Successivamente gli daremo il materiale che abbiamo consolidato sull’utilizzo operativo della conoscenza scientifica: metriche attese, unità, condizioni, ricerca mirata, sufficienza delle prove e riesame retroattivo.

La differenza è importante: non vogliamo due grandi sistemi separati, uno che generalizza e uno che conosce la scienza. Vogliamo che la conoscenza scientifica sia proprio uno degli strumenti attraverso cui l’interprete generalizza.

E aggiungerei una cautela per i futuri test: i campioni di sviluppo e controllo attuali sono già stati esposti, quindi non possono essere riciclati come nuova verifica indipendente.

La mia conclusione

Non abbandonerei affatto l’approccio algoritmico dopo questo risultato.

1G è passato da 3 a 89 elementi pienamente corretti sul controllo rispetto ai lettori precedenti. È abbastanza per giustificare la ricerca di un metodo più generale, senza dover ricorrere subito all’AI per ogni tabella.

Ma non continuerei neppure a perfezionare 1G attraverso decine di correzioni locali.

Adesso farei ragionare Claude sulle tecniche di generalizzazione e gli lascerei individuare una soluzione architetturale riutilizzabile, prima di costruirci sopra il sistema scientifico.

Il prossimo progresso che voglio vedere non è 89 elementi corretti che diventano 110 sugli stessi dati: è che ciò che PEE ha imparato su queste otto tabelle lo aiuti a comprendere tabelle realmente nuove, senza che nessuno debba insegnargli ogni volta un’altra eccezione.
