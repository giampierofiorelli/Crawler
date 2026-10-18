# Owner review of FC and engineering research on scientific knowledge, logic and generalisation (2026-10-18)

Preserved verbatim, as delivered by the owner on 2026-10-18 after the FC report (`docs/plans/product-functions-and-conditions.md`).
Owner's covering instruction: "Ciò che è opportuno, mettilo nelle tue skill non so se c'è un modo per fare una road map
che tu possa memorizzare così che non esci più dal selciato". The owner's diagram is
[owner-fc-review-2026-10-18-diagram.jpg](owner-fc-review-2026-10-18-diagram.jpg) ("Esempio: purificatore con controllo
automatico": Prodotto → Funzione auto, Sensore PM2.5 → Prova sperimentale → Condizioni, Risultato (dashed: relation to be
verified), osserva → Fonte e metodo; "Schema concettuale proposto per PEE, non descrizione di una capacità già
implementata").

Assessment and resulting decisions: [decisions-and-supersessions.md](decisions-and-supersessions.md) S63; roadmap:
[roadmap.md](roadmap.md). Factual reconciliations by Claude are in S63, not in this text.

---

Questo rapporto cambia in parte la mia valutazione precedente: Claude ha recepito la distinzione ontologica e ha effettivamente introdotto regole dichiarative nel motore esistente. Non si è limitato ad ampliare un vocabolario.

È un progresso concreto. Tuttavia, rimangono due questioni: quanto è affidabile questa nuova rappresentazione e, soprattutto, se la conoscenza scientifica viene utilizzata per ragionare e generalizzare, anziché soltanto classificare informazioni già riconosciute.

1. Che cosa è stato realmente implementato

Dal rapporto emergono tre novità:

* Entità distinte: funzioni, componenti, modalità, condizioni e risultati non vengono più trattati come informazioni intercambiabili.
* Relazioni tipizzate: un componente può abilitare una funzione, una modalità può realizzarla e una misurazione può fornire evidenza sul comportamento.
* Regole logiche: il motore Datalog esistente è stato esteso per distinguere presenza, efficacia e stati operativi, con una protezione contro l'inferenza di prestazioni dalla semplice presenza di una funzione.

Questo significa che la logica del primo ordine, nella forma operativa delle regole Datalog, adesso compare effettivamente nell'implementazione dichiarata.

Non significa ancora che PEE abbia acquisito capacità dimostrate di ragionamento di ordine superiore.

2. I numeri sono meno rassicuranti di quanto sembri

Funzioni riconosciute, prima esecuzione: 49,8% (113 su 227)
Presenza corretta fra le funzioni riconosciute: 95,6% (108 su 113)
Modalità riconosciute: 47,4% (45 su 95)
Risultati con modalità correttamente attribuita: 25,7% (28 su 109)

Il 96% citato da Claude riguarda dunque le funzioni che il sistema è riuscito a riconoscere, non tutte quelle presenti nel riferimento.

È una precisione incoraggiante, ma rimane circa metà delle funzioni non raggiunta.

Anche il collegamento tra giudizi sull'efficacia e funzioni passa da 5 a 15 su 50, ma questo miglioramento è stato ottenuto dopo aver esaminato gli errori del riferimento. È quindi un risultato tarato, non una conferma indipendente.

Il dato che mi preoccupa particolarmente è l'attribuzione: soltanto 73 dei 113 casi riconosciuti risultano correttamente attribuiti, secondo il rapporto. Una funzione reale attribuita al prodotto sbagliato diventa conoscenza falsa.

3. Il problema più delicato è nelle nuove regole di composizione

Claude scrive che:

Un componente abilita una funzione e una modalità la realizza. Ciò che si dice del mezzo è prova sulla funzione solo se il prodotto ha quella funzione.

Qui serve molta attenzione.

Prendiamo un purificatore che possiede un sensore PM2.5 e una modalità automatica.

Una recensione dice che il sensore reagisce rapidamente alle particelle.

Da questa osservazione PEE può legittimamente ricavare informazioni sul comportamento del sensore. Ma non può automaticamente concludere che la modalità automatica sia efficace nel purificare l'aria.

Per dimostrarlo potrebbero servire ulteriori passaggi: verificare se il sensore controlla effettivamente la ventilazione, come reagisce il sistema, quanto rapidamente diminuisce la concentrazione di particelle e in quali condizioni.

Questo è il punto in cui la logica dichiarativa deve diventare davvero utile.

Non basta introdurre relazioni come component_enables_function e mode_realises_function. Bisogna specificare quali inferenze quelle relazioni autorizzano, quali non autorizzano e quali ulteriori evidenze sono necessarie.

Altrimenti rischiamo di sostituire una confusione lessicale con una confusione causale.

Anche la parola efficacia merita attenzione. Una prova positiva non rende automaticamente dimostrata l'efficacia generale di una funzione. Può sostenere una conclusione limitata a un metodo, un prodotto, una configurazione e specifiche condizioni.

4. Mancano ancora due dimostrazioni decisive

La prima riguarda il riutilizzo della conoscenza scientifica.

Il file functions.v1.json contiene 29 funzioni e 22 componenti. È un punto di partenza, ma può diventare un altro vocabolario gestito manualmente.

Vorrei capire se PEE può apprendere autonomamente da fonti scientifiche che una determinata funzione realizza un certo obiettivo, quali meccanismi fisici utilizza, quali prestazioni sono pertinenti e quali metodi permettono di valutarla.

Questo dovrebbe collegarsi agli outcome già insegnati, alle relazioni measured_by e ai sistemi QK e KR.

La seconda riguarda il ragionamento trasferibile.

Non vedo ancora un esperimento che dimostri l'acquisizione di una relazione generale e il suo utilizzo su una categoria nuova.

Il fatto che Datalog sia operativo è significativo. Ma una regola dichiarativa può limitarsi a classificare fatti oppure può contribuire a derivare nuova conoscenza. Dobbiamo verificare quale delle due capacità sia stata effettivamente realizzata.

Non imporrei una logica del secondo ordine completa. Chiederei però una dimostrazione di generalizzazione relazionale, valutando se metaregole, schemi di inferenza o altre tecniche offrano un vantaggio reale.

5. Ci sono anche tre questioni di validazione

* Integrità del riferimento: durante il lavoro Claude parla di 670 elementi annotati su nove pagine, mentre il rapporto finale ne riporta 610. Potrebbero essere stati esclusi 60 elementi per ragioni legittime, ma serve una riconciliazione verificabile.
* Equivalenze: zero equivalenze false è un buon risultato soltanto se il sistema riconosce anche le equivalenze vere. Un motore che non stabilisce mai equivalenze potrebbe ottenere zero falsi positivi senza aver imparato a confrontare gli stati.
* Protezione logica: il test secondo cui nessuna regola deriva l'efficacia dalla sola presenza è utile. Occorre però verificare non soltanto la forma delle regole, ma anche le derivazioni prodotte quando si combinano più relazioni, specialmente componenti, modalità e osservazioni qualitative.

Apprezzo che Claude abbia mantenuto tutto in modalità ombra. Sarebbe prematuro portare queste conclusioni direttamente nelle classifiche.

6. Quale direzione scegliere adesso

Non sceglierei ancora il suo punto 3, cioè utilizzare queste informazioni nei consigli, se non per sperimentazioni isolate.

Darei priorità a una verifica dell'architettura esistente e delle capacità dimostrate, prima di investire nella sola espansione del vocabolario.

Questo non significa interrompere lo sviluppo per un esercizio teorico. Significa fare in modo che la prossima evoluzione migliori insieme:

* l'acquisizione di funzioni espresse attraverso azioni e non soltanto nomi;
* la ricostruzione delle condizioni distribuite nel documento;
* l'attribuzione corretta a prodotto, fonte, modalità e componente;
* il collegamento scientificamente giustificato tra funzioni, prestazioni, outcome, misure e bisogni;
* la generalizzazione su categorie e documenti nuovi.

Inoltre, chiarirei un principio per le future classifiche: la presenza verificata di una funzione può determinare l'idoneità di un prodotto a una richiesta, soprattutto se è un requisito indispensabile. È la sua efficacia che non può essere dedotta dalla sola presenza.

Questa differenza sarà essenziale quando PEE tornerà a produrre consigli.

La mia valutazione finale di questa fase: Claude ha fatto un passo nella direzione che volevamo, e questa volta ha utilizzato davvero il motore logico già esistente. Non considero quindi il lavoro fuori strada.

Ma ha dimostrato soprattutto una migliore rappresentazione dichiarativa di fatti funzionali. Non ha ancora dimostrato il ciclo completo conoscenza scientifica → relazioni generali → inferenze giustificate → apprendimento trasferibile.

È questo il risultato che terrei come obiettivo della prossima verifica, preservando integralmente ciò che è già stato implementato, senza imporre a Claude una nuova architettura e senza tornare a costruire correzioni specifiche per ogni categoria.

La tua preoccupazione è giustificata. Ho recuperato le decisioni precedenti e verificato direttamente alcuni file del repository, compresi CLAUDE.md, la skill pee-guided-learning e il nuovo codice di interpretazione delle funzioni.

Il problema non è che Claude abbia abbandonato la logica del primo ordine. Il problema è che sta realizzando parti dell'architettura concordata senza aver ancora dimostrato il meccanismo di apprendimento scientifico e generalizzazione che dovrebbe collegarle.

E questo rischia di far crescere la complessità del software più rapidamente delle sue capacità effettive.

1. Che cosa ho verificato

| Domanda | Risposta |
|---|---|
| La skill che avevamo preparato esiste? | Sì, verificato nel repository. |
| CLAUDE.md obbliga Claude a utilizzarla? | Sì, esplicitamente. |
| Le regole del primo ordine sono fuori dal codice applicativo? | Sì, almeno in parte. Il programma è in product-rules.v1.json ed è eseguito dal motore Datalog esistente. |
| La conoscenza è separata dal codice? | Parzialmente. Il vocabolario è in functions.v1.json, ma gran parte dell'interpretazione dipende ancora da procedure TypeScript. |
| È dimostrata la generalizzazione tra categorie sconosciute? | No. |
| È dimostrato il ragionamento di ordine superiore? | No. |
| Claude applica realmente tutte le istruzioni della skill? | Non ancora verificato. L'esistenza dei file non dimostra che abbia seguito l'intero metodo. |

Ho trovato un elemento particolarmente significativo: la skill stabilisce già che PEE debba essere un sistema cumulativo di apprendimento scientifico, capace di utilizzare conoscenze, errori, controesempi e metodi acquisiti per migliorare ricerca, estrazione, valutazione e comprensione di categorie nuove.

Prescrive anche di non creare motori paralleli né regole specifiche per singoli prodotti, e richiede che ogni cambiamento nel modo in cui PEE apprende o generalizza segua un protocollo di valutazione dedicato.

Quindi la direzione che stai chiedendo a Claude è già contenuta nelle sue istruzioni permanenti. Non dobbiamo inventare un'altra metodologia.

2. Ho trovato tre problemi concreti nelle regole

Questi sono più preoccupanti della semplice mancanza di generalizzazione.

Primo: assenza di equivalenza scambiata per differenza.

Nel file product-rules.v1.json, la regola M6 conclude che due risultati appartengono a stati diversi quando il sistema non riesce a dimostrare che appartengano allo stesso stato.

Ma:

* Non sapere se Sleep e Speed 1 siano equivalenti significa equivalenza non verificata.
* Sapere che sono stati diversi richiede un'evidenza ulteriore.

Con la negazione usata da Datalog, questa distinzione deve essere gestita esplicitamente. Altrimenti una mancanza di informazioni diventa una conclusione.

Secondo: il comportamento di un sensore viene generalizzato troppo facilmente.

La regola E6 permette di collegare un'osservazione su un sensore non identificato alle funzioni del prodotto classificate come basate su sensori.

Questo non garantisce che l'osservazione riguardi effettivamente il sensore responsabile della funzione.

Terzo: una misura nella stessa modalità viene trattata come evidenza della funzione.

La regola E2 collega un risultato quantitativo all'efficacia della funzione quando il risultato è stato ottenuto nella modalità associata.

Ma la coincidenza della modalità non dimostra la pertinenza della misura. Serve anche una relazione scientifica tra proprietà misurata, funzione e prestazione che vogliamo valutare.

Non sto dicendo che questi errori abbiano già contaminato le classifiche: il modulo è ancora in modalità ombra. Sto dicendo che le regole dichiarative, così scritte, consentono inferenze che richiedono verifiche semantiche più rigorose.

3. La skill contiene già il metodo per evitare questa deriva

Ho verificato anche il file references/generalization-method.md.

È particolarmente interessante perché contiene una sezione intitolata Higher-order learning, stabilita il 18 ottobre come principio permanente.

Questa sezione dice esplicitamente che Claude deve:

* Ragionare sulle regole, cercando strutture comuni fra esse.
* Esprimere i principi generali attraverso oggetti e relazioni, preferendo regole del primo ordine dove sufficienti.
* Provare a falsificare i principi con controesempi.
* Validarli su categorie, fonti e strutture non utilizzate per svilupparli.
* Considerare strumenti di ordine superiore soltanto quando il primo ordine non basta.
* Distinguere principi individuati, implementati e dimostrati.

La stessa skill contiene una distinzione decisiva: Claude che impara come sviluppatore non significa che PEE abbia imparato come software.

Qui ritroviamo esattamente ciò che volevamo ottenere.

Eppure, nella fase appena conclusa, vediamo ancora un grande modulo TypeScript che riconosce espressioni, un vocabolario scritto manualmente e nuove regole definite a partire dagli errori osservati.

La skill non vieta questi strumenti. Ma richiede che il progresso sia valutato anche in termini di complessità, trasferibilità, controesempi e capacità operative del motore.

Non vedo queste dimostrazioni nel rapporto FC.

4. Siamo davvero peggiorati?

Distinguerei due aspetti.

Come organizzazione del codice, alcune cose sono migliorate. I fatti sono tipizzati, il programma logico è esterno al modulo applicativo e vengono riutilizzati componenti esistenti.

Come disciplina di sviluppo orientata alla generalizzazione, vedo segnali di deriva. Si sta tornando a un ciclo in cui si individuano espressioni non comprese, si aggiungono riconoscitori e si misura il miglioramento sugli stessi esempi.

Il rischio è accumulare conoscenze inserite manualmente e regole sempre più numerose senza costruire la capacità autonoma di ricavarle.

Il fatto che le regole siano memorizzate in JSON non significa che PEE sappia apprenderle. Significa soltanto che può leggerle come dati.

È una differenza sostanziale.

5. Come riporterei Claude sul percorso stabilito

A questo punto interverrei prima di avviare un'altra fase di sviluppo.

Non chiederei una riscrittura, né di abbandonare FC, QE, QK, KR o WD. E non imporrei una nuova tecnologia.

Chiederei una verifica di conformità alle skill già esistenti, concentrata su quattro risultati:

* Una mappa precisa di ciò che è conoscenza dichiarativa, ciò che è logica eseguita e ciò che rimane incorporato in riconoscitori TypeScript.
* Una verifica delle regole che producono conclusioni non pienamente giustificate, con particolare attenzione a negazione, causalità, comparabilità e collegamenti tra funzione e prestazione.
* Un esperimento che mostri se conoscenze scientifiche e principi già acquisiti modificano realmente l'interpretazione di una categoria non utilizzata per costruirli.
* Una valutazione di quali meccanismi previsti dalla skill siano già operativi, quali siano soltanto documentati e quali rimangano proposte, senza dichiarare dimostrata una capacità perché esistono test sintetici.

La priorità non sarebbe aggiungere altre funzionalità, ma rendere operativo il metodo di apprendimento già concordato.

Per questa correzione utilizzerei un solo intervento consolidato, facendo riferimento a CLAUDE.md, pee-guided-learning e generalization-method.md, senza sostituire quelle istruzioni con un nuovo elenco di soluzioni imposte.

Non preparerei ancora file o pacchetti.

La mia conclusione, dopo aver letto il codice e la skill, è più precisa di prima: abbiamo già definito un metodo ingegneristico adeguato alle ambizioni di PEE; il problema attuale è che la sua applicazione non è ancora dimostrata in modo sufficiente.

Prima di investire altro lavoro in nuovi riconoscitori, è ragionevole riportare Claude a quella disciplina, preservando quanto è stato costruito.

PEE — Ricerca ingegneristica su conoscenza scientifica, logica e generalizzazione

18 ottobre 2026 · Ricerca su standard tecnici, pubblicazioni accademiche e metodi di ingegneria del software

Dalla ricerca emerge una direzione più solida di quella seguita finora. PEE possiede già alcuni componenti corretti, ma gli manca ancora un meccanismo sufficientemente generale che trasformi le conoscenze scientifiche in strumenti operativi di interpretazione, verifica e apprendimento.

La soluzione più promettente, secondo la mia valutazione delle fonti, consiste nel combinare metodi provenienti da cinque discipline: ingegneria delle ontologie, rappresentazione della conoscenza, programmazione logica, estrazione delle relazioni dai documenti e apprendimento induttivo.

Nessuna, da sola, risolve il problema.

1. La scoperta più interessante: esiste già un'ontologia industriale vicina alle esigenze di PEE

SAREF — Smart Applications REFerence ontology

Uno standard sviluppato nell'ambito di ETSI per rappresentare dispositivi, funzioni, proprietà, stati, sensori, attuatori e misurazioni, con l'obiettivo di rendere interoperabili sistemi diversi.

SAREF è particolarmente pertinente perché affronta proprio la distinzione emersa con Claude: un dispositivo può possedere componenti, offrire funzioni, controllare stati e misurare proprietà. Queste relazioni non sono sinonimi.

Accanto a SAREF ho individuato un secondo riferimento molto interessante: Functional Basis for Engineering Design, sviluppato da ricercatori nell'ingegneria meccanica e documentato anche dal NIST.

Questo metodo descrive le funzioni attraverso le azioni che un sistema compie su qualcosa, con rappresentazioni del tipo verbo-oggetto e flussi di ingresso e uscita.

È estremamente pertinente al limite individuato da Claude:

Molte funzioni sono descritte con azioni, non con nomi.

Per esempio, queste espressioni possono descrivere una capacità funzionale collegata:

* Remote control
* Adjusts settings from a phone
* Allows the user to switch the appliance off remotely

Un sistema puramente lessicale deve conoscere molte formulazioni. Un modello funzionale può rappresentare l'azione, il destinatario, il mezzo e l'effetto, e utilizzare tali relazioni per interpretare espressioni nuove.

Questo non elimina la difficoltà di estrarre correttamente il significato delle frasi. Però fornisce un modello scientificamente fondato nel quale collocarlo.

La mia prima indicazione è quindi studiare SAREF insieme a Functional Basis, senza importare automaticamente tutta l'ontologia o creare un nuovo framework. PEE può riutilizzarne i principi dentro le proprie strutture dichiarative.

2. Il secondo problema: PEE confonde ancora ciò che non sa con ciò che sa essere diverso

Nella fase precedente abbiamo individuato una regola Datalog che conclude che due modalità siano differenti quando non ne è dimostrata l'equivalenza.

Questo è un problema noto nella rappresentazione della conoscenza: la distinzione tra closed-world assumption e open-world assumption.

La prima è comune nei database e in alcuni programmi logici: entro un insieme di dati considerato completo, ciò che non è dimostrato può essere trattato come falso.

La seconda, utilizzata nelle ontologie OWL, considera la mancanza di informazioni diversa dalla falsità.

La ricerca su OWL e SHACL conferma che queste semantiche sono distinte e che combinarle richiede attenzione.

Per PEE vedo una distinzione operativa molto semplice:

| Stato della conoscenza | Interpretazione |
|---|---|
| Sleep = Speed 1, dichiarato esplicitamente | Equivalenza documentata |
| Sleep diverso da Speed 1, documentato | Differenza documentata |
| Nessuna relazione documentata | Relazione sconosciuta |
| Fonti attendibili in contrasto | Relazione controversa |

La conclusione importante è che PEE dovrebbe utilizzare la negazione come assenza soltanto quando l'insieme di informazioni è dichiarato completo per quella domanda.

Questo criterio può diventare una regola generale, utilizzabile per funzioni, modalità, prodotti, misure, identità e prove.

Non serve necessariamente sostituire Datalog. Serve delimitare correttamente le condizioni sotto cui le sue inferenze negative sono valide.

3. SOSA/SSN, PROV-O e QUDT: una struttura comune per le prove scientifiche

Questi tre riferimenti, già parzialmente conosciuti da PEE, possono svolgere funzioni complementari.

W3C SOSA/SSN

Modella che cosa viene osservato, quale proprietà, attraverso quale procedura e con quale risultato. È particolarmente utile per distinguere una misurazione dall'azione di un dispositivo.

W3C PROV-O

Permette di rappresentare provenienza, attribuzione e derivazione di informazioni. È un riferimento per sapere quali prove hanno contribuito a una conclusione.

QUDT

Distingue grandezze, tipi di quantità, dimensioni fisiche e unità. Può contribuire a impedire equivalenze quantitative non valide, pur non sostituendo la conoscenza dei metodi sperimentali.

Le specifiche W3C e la documentazione QUDT confermano queste distinzioni.

Un contributo ulteriore viene dal Vocabolario internazionale di metrologia, JCGM/VIM, che distingue il misurando dal risultato della misurazione e dalle condizioni che possono influenzarlo.

Per PEE proporrei di considerare ogni affermazione scientifica come un oggetto collegabile a una rete di relazioni.

Esempio: purificatore con controllo automatico

[diagram: owner-fc-review-2026-10-18-diagram.jpg]

Schema concettuale proposto per PEE, non descrizione di una capacità già implementata. Il collegamento tratteggiato indica una relazione da verificare.

La rappresentazione dovrebbe distinguere anche il ruolo epistemico dell'affermazione: dichiarazione del produttore, osservazione sperimentale, esperienza quotidiana, opinione dell'esperto, inferenza o ipotesi.

Questa distinzione deve rimanere valida anche quando più affermazioni appartengono allo stesso articolo.

Un miglioramento ulteriore: conservare la spiegazione delle inferenze

La ricerca sulla data provenance, in particolare quella di Green, Karvounarakis e Tannen e la successiva letteratura sulla provenienza delle query, studia come ricostruire quali informazioni hanno contribuito a produrre un risultato.

PEE potrebbe utilizzare questo principio per interrogare non soltanto una conclusione, ma la sua giustificazione.

Per esempio: perché il sistema ritiene che la modalità automatica di un prodotto sia efficace? Quali osservazioni, risultati, condizioni e regole compongono la derivazione?

KR possiede già meccanismi di prova. La strada economicamente più ragionevole è ampliarli e collegarli ai fatti scientifici, non aggiungere un'altra infrastruttura di provenance.

4. Estrazione qualitativa: ACOS non basta, serve ragionamento sull'intero documento

Claude ha identificato una difficoltà concreta: le informazioni necessarie per interpretare una prova sono spesso distribuite tra titoli, frasi, tabelle e commenti.

Gli studi sull'estrazione delle relazioni affrontano esattamente questo problema.

Yi Luan e colleghi, nella ricerca SciERC, hanno studiato l'estrazione congiunta di entità, relazioni e coreferenze nei documenti scientifici. Il metodo affronta il rischio che errori iniziali nell'identificazione delle entità compromettano le relazioni successive.

Yuan Yao e colleghi, con DocRED, hanno dimostrato l'importanza di ricostruire relazioni che richiedono informazioni provenienti da più frasi.

Una rassegna del 2024 individua ancora nella coreferenza e nel ragionamento documentale due dei principali ostacoli all'estrazione affidabile.

Per PEE questo suggerisce di trattare la lettura come un problema di collegamento di evidenze all'interno del documento, anziché limitarsi a cercare parole nella stessa frase.

Consideriamo:

The appliance was tested in sleep mode. Noise levels were recorded at a distance of one metre. The result was 32 dB(A). Unfortunately, this setting reduced airflow considerably.

Per interpretare correttamente il testo servono quattro collegamenti: la modalità utilizzata, la distanza, il valore acustico e l'osservazione sul flusso d'aria. L'ultima affermazione riguarda una prestazione diversa dalla rumorosità, pur riferendosi alla stessa configurazione.

Il modello dovrebbe ricostruire queste relazioni mantenendo traccia di dove ciascuna è stata trovata e quanto sia sicura.

Quale ruolo rimane per ABSA e ACOS?

Il lavoro di Cai, Xia e Yu (ACL 2021) sull'estrazione di quadruple ACOS è particolarmente utile per riconoscere aspetti e opinioni anche impliciti.

La ricerca COQE amplia il problema ai confronti tra oggetti e alle preferenze espresse su proprietà specifiche.

Ma per PEE questi metodi dovrebbero essere componenti dell'estrazione, non il modello completo della conoscenza.

Un'osservazione sperimentale negativa, per esempio, non è necessariamente un'opinione. E una preferenza di un recensore non dimostra da sola una superiorità tecnica.

La mia raccomandazione sarebbe di utilizzare i risultati della ricerca NLP per costruire ipotesi di relazioni, da verificare successivamente attraverso conoscenza, contesto documentale e regole tipizzate.

5. Come impedire che le regole logiche producano false conclusioni

Questa è probabilmente la parte più urgente per il codice attuale.

Claude ha aggiunto regole che collegano il comportamento di componenti e modalità all'efficacia delle funzioni.

La ricerca sulla verifica delle affermazioni suggerisce una distinzione più rigorosa.

Nel progetto FEVER, Thorne e colleghi hanno costruito un benchmark per distinguere affermazioni sostenute dalle prove, confutate e insufficientemente documentate, conservando le evidenze necessarie ai verdetti.

L'idea è applicabile a PEE, anche se il dominio delle recensioni tecniche è diverso da quello di FEVER.

Una prova può essere pertinente a una funzione senza dimostrarne l'efficacia. Può anche limitarla, contraddirla oppure lasciare aperta la questione.

Suggerirei quindi relazioni distinte:

| Relazione | Significato |
|---|---|
| relevant_to | L'osservazione riguarda una funzione o proprietà |
| supports | L'osservazione sostiene una conclusione delimitata |
| refutes | L'osservazione contraddice una conclusione delimitata |
| requires_condition | La conclusione dipende da condizioni specifiche |
| derived_from | La conclusione deriva da fatti e regole identificabili |
| unresolved | Le prove sono insufficienti o incompatibili |

Questi sono nomi illustrativi, non prescrizioni su come debbano chiamarsi i predicati nel codice.

Il problema con l'attuale regola E2 è proprio che la presenza di una misura nella modalità associata alla funzione può bastare a creare una relazione di evidenza. Serve invece verificare la pertinenza tra la grandezza misurata e l'esito valutato.

Per esempio, un consumo di 8 W misurato in modalità automatica informa sul consumo in quella modalità. Non dimostra, da solo, che il controllo automatico mantenga correttamente la qualità dell'aria.

Ragionamento rivedibile quando arrivano nuove prove

La letteratura sul defeasible reasoning affronta un secondo problema: alcune conclusioni sono giustificate dalle informazioni disponibili, ma devono poter essere ritirate quando emergono fatti nuovi.

Per PEE significa che una conclusione derivata da una dichiarazione del produttore può restare provvisoria, essere corroborata da prove indipendenti oppure entrare in conflitto con risultati successivi.

Questo si collega direttamente al requisito di apprendimento cumulativo: conservare gli elementi storici della conoscenza senza mantenere come valide conclusioni che hanno perso il loro sostegno.

Anche qui non proporrei subito un motore di argomentazione completo. Per iniziare potrebbero bastare derivazioni versionate, relazioni di supporto e contraddizione, e ricalcolo delle conclusioni quando cambiano le premesse.

6. L'apprendimento vero: Inductive Logic Programming e metaregole

Questa è la parte più direttamente collegata alla tua richiesta sul ragionamento di primo e secondo ordine.

Ho trovato tre filoni di ricerca particolarmente pertinenti.

Inductive Logic Programming (ILP)

Andrew Cropper, Sebastijan Dumančić e Stephen Muggleton hanno esaminato i metodi per imparare programmi logici a partire da esempi e conoscenza precedente. L'obiettivo è acquisire regole che generalizzino, non semplicemente memorizzare casi.

Popper — Learning from Failures

Andrew Cropper e Rolf Morel propongono un processo in cui si generano ipotesi logiche, le si verifica e si usano i fallimenti per restringere lo spazio delle ipotesi successive. È una metodologia concreta per imparare dai controesempi.

Meta-Interpretive Learning (MIL)

Il lavoro di Cropper, Morel e Muggleton sul Learning Higher-Order Logic Programs studia come utilizzare definizioni di ordine superiore per apprendere programmi più compatti e generalizzabili. I risultati sperimentali riguardano problemi specifici, tra cui strategie di robot e trasformazioni simboliche, non la lettura automatica di recensioni di prodotti.

Il valore per PEE sta nel metodo.

Supponiamo che il sistema abbia imparato da più categorie che, per valutare un dispositivo con controllo automatico, bisogna distinguere rilevamento, decisione del controllo, attuazione ed effetto finale.

Questa struttura può diventare un principio generale.

Quando incontra una categoria nuova, PEE può formulare ipotesi sui passaggi della funzione e sulle evidenze necessarie per verificarne il comportamento.

Se incontra un controllo automatico privo di sensori fisici, basato invece su timer o programmi, deve correggere l'ipotesi iniziale. Non deve aggiungere una regola speciale per il singolo modello.

È questo il tipo di apprendimento relazionale che vorrei vedere in PEE.

Non serve necessariamente quantificare direttamente sui predicati con un linguaggio del secondo ordine. È possibile rappresentare principi e relazioni come dati e utilizzare metaregole controllate per esplorarli, mantenendo il ragionamento operativo entro frammenti decidibili e verificabili.

Un limite pratico

Popper e i sistemi di Meta-Interpretive Learning sono strumenti di ricerca. Non abbiamo prove che integrarli direttamente in PEE sarebbe conveniente dal punto di vista delle dipendenze, delle risorse o dei benefici.

Perciò la raccomandazione non è installare automaticamente quei sistemi.

È trasferire prima il metodo nell'architettura esistente: generazione di ipotesi limitate, controllo dei tipi, test su esempi positivi e negativi, conservazione dei controesempi, promozione soltanto dopo validazione indipendente.

Se in seguito un motore ILP specializzato dimostrasse vantaggi sostanziali, la sua eventuale adozione potrebbe essere valutata attraverso esperimenti separati.

7. Un altro metodo molto utile: SHACL e le competency questions

Ho approfondito anche la metodologia di validazione delle ontologie.

Lo standard W3C SHACL serve a verificare che i dati rispettino vincoli dichiarati. Il suo compito è diverso da quello di un motore che deriva nuove conoscenze.

Per PEE questa separazione è utile.

Una regola può essere sintatticamente valida e tuttavia produrre conclusioni indesiderate. Un controllo semantico aggiuntivo potrebbe segnalare, per esempio, che una conclusione sull'efficacia non è accompagnata da evidenza pertinente o che una misura è stata attribuita a condizioni non documentate.

Gli ingegneri delle ontologie utilizzano inoltre le competency questions: domande che il modello della conoscenza deve essere in grado di risolvere.

Uno studio di Keet e Khan del 2024 distingue diversi tipi di queste domande, fra cui domande sulle relazioni e sulle metaproprietà.

Per PEE, esempi di domande architetturali sarebbero:

* Il sistema può distinguere una funzione dichiarata da una funzione verificata sperimentalmente?
* Può spiegare perché due misure non sono direttamente confrontabili?
* Può riconoscere che un risultato in modalità automatica è pertinente al consumo, ma insufficiente a dimostrare la qualità del controllo?
* Può acquisire una nuova relazione scientifica e utilizzarla su un prodotto non incontrato prima?
* Può riconoscere che una precedente inferenza non è più giustificata dopo l'acquisizione di un risultato contraddittorio?

Le risposte devono essere prodotte dal software, con prove delle derivazioni. Non basta che Claude sappia rispondere a queste domande mentre sviluppa.

Anche in questo caso SHACL sarebbe una fonte metodologica. Non occorre necessariamente migrare i dati in RDF o aggiungere un validatore esterno: molti controlli possono essere espressi come vincoli dichiarativi ed eseguiti usando i componenti esistenti.

8. Come verificare scientificamente la generalizzazione

La ricerca sull'apprendimento da controesempi e quella sull'ingegneria del testing offrono una metodologia applicabile subito.

In particolare, la rassegna di Segura e colleghi sul Metamorphic Testing descrive come verificare un software attraverso relazioni attese tra diverse esecuzioni, anche quando non esiste una risposta esatta facilmente disponibile per ogni nuovo caso.

Per PEE questo permetterebbe di verificare proprietà generali, non soltanto singole frasi.

Per esempio, sostituire il nome di un prodotto senza cambiare i fatti non dovrebbe modificare le inferenze scientifiche. Cambiare una modalità operativa dovrebbe invece cambiare le condizioni attribuite ai risultati. Eliminare l'unica prova che sostiene una conclusione dovrebbe far decadere quella conclusione, salvo che esistano altre prove sufficienti.

Ma il test decisivo rimane quello su dati realmente indipendenti.

La ricerca sulla valutazione selettiva in NLP mostra inoltre perché bisogna misurare insieme copertura e rischio di errore, anziché premiare sistemi che rispondono sempre oppure che si astengono sempre.

Questo è particolarmente pertinente ai risultati di Claude: l'estrazione qualitativa ha aumentato la copertura, ma ha mostrato problemi di precisione; quella funzionale ha raggiunto circa metà dei casi annotati, con una precisione della presenza elevata soltanto sul sottoinsieme riconosciuto.

I benchmark già utilizzati e poi esaminati non possono dimostrare una nuova generalizzazione indipendente.

9. Come applicare tutto questo a PEE senza ricominciare da zero

La seguente è la sintesi ingegneristica che ricavo dalla ricerca. Non è una descrizione di funzionalità già completate.

| Responsabilità | Metodi pertinenti | Componenti PEE da valorizzare |
|---|---|---|
| Significato di funzioni, componenti e stati | SAREF, Functional Basis | FC e conoscenza dichiarativa |
| Grandezze, metodi e condizioni | VIM, QUDT, SOSA/SSN | QK e KR |
| Lettura di informazioni distribuite | DocRED, SciERC, ACOS | WD, QE, 1F/1G |
| Giustificazione e conflitti | PROV-O, provenance, FEVER | KR e provenienza delle evidenze |
| Inferenze controllate | Datalog, vincoli SHACL-like | KR e contratti di lettura |
| Apprendimento di regole | ILP, Popper, metaregole | Skill e meccanismi di apprendimento previsti |
| Dimostrazione di generalizzazione | Metamorphic testing, OOD validation | Protocolli di valutazione esistenti |

Vedo una direzione abbastanza precisa.

Prima: rendere il modello semanticamente corretto

L'attuale separazione in sette classi è utile, ma le classi non devono necessariamente essere tutte mutuamente esclusive.

Una modalità può realizzare una funzione; una proprietà può essere qualitativa e al tempo stesso avere possibili metodi di valutazione quantitativa; un risultato può contenere più condizioni e riferirsi a diversi esiti.

L'ingegneria delle ontologie suggerisce di rappresentare queste sovrapposizioni mediante relazioni tipizzate, senza costringere ogni concetto in un unico contenitore.

Bisogna anche evitare di trasformare una possibile relazione funzionale in una relazione causale dimostrata.

Poi: far consultare davvero la conoscenza scientifica

È qui che vedo il miglioramento operativo più importante.

Quando PEE legge una frase, gli outcome scientifici già acquisiti, le relazioni measured_by, le conoscenze sui metodi e i vincoli di comparabilità dovrebbero contribuire a interpretarla.

Per esempio, se trova un'osservazione sulla doratura irregolare, la conoscenza scientifica sulla distribuzione del calore e sull'uniformità spaziale dovrebbe aiutare a identificare il fenomeno, i possibili esiti rilevanti e le prove da cercare.

Questa conoscenza non deve obbligare l'estrattore a vedere nel testo qualcosa che non c'è. Deve aiutare a generare e verificare interpretazioni plausibili, distinguendo sempre fatti espliciti e inferenze.

Infine: imparare dalle verifiche

Una nuova regola dovrebbe entrare nella conoscenza come ipotesi con condizioni di applicabilità, provenienza e controesempi.

Solo dopo verifiche su dati indipendenti dovrebbe poter essere promossa a regola consolidata.

Le esperienze negative devono migliorare il motore generale. Altrimenti ci ritroveremo ogni volta a scrivere nuove eccezioni.

10. Quali tecniche sceglierei per prime

Non attribuirei la stessa priorità a tutte le tecnologie individuate.

Priorità immediata: modellazione semantica, controlli di validità e inferenze giustificate

Applicare i principi SAREF, Functional Basis, SOSA/SSN e SHACL ai dati e alle regole già presenti. Verificare in particolare le conclusioni generate da E2, E6 e M6, senza perdere le inferenze valide.

Priorità immediata: collegamento reale tra conoscenza scientifica e lettura

Provare che WD, QE, FC e QK utilizzino relazioni scientifiche già acquisite per migliorare l'interpretazione, con esperimenti che isolino l'effetto della conoscenza rispetto ai soli riconoscitori lessicali.

Priorità sperimentale: apprendimento induttivo delle regole

Studiare metaregole e apprendimento dai fallimenti, iniziando da uno spazio di ipotesi limitato. Confrontare il risultato con le regole manuali, contabilizzando complessità, errori e generalizzazione.

Da rimandare: un motore completo di secondo ordine, un nuovo knowledge graph esterno o grandi modelli specializzati

Sono possibilità tecniche, non necessità dimostrate. Aggiungerle adesso rischierebbe di aumentare costi, dipendenze e complessità senza risolvere le debolezze osservate.

11. Che cosa ci dice questa ricerca sul lavoro recente di Claude

Il confronto tra la letteratura e i rapporti delle ultime fasi conduce a una valutazione abbastanza precisa.

Claude ha fatto bene a riutilizzare il motore Datalog e a conservare la conoscenza fuori dalla logica applicativa quando possibile. Ha fatto bene anche a distinguere le informazioni funzionali dalle misure e a mantenere i nuovi risultati in modalità ombra.

Ma un file JSON contenente 29 funzioni e le relative espressioni linguistiche rimane prevalentemente un vocabolario, anche quando è esterno al codice.

Un programma Datalog con regole dichiarative è un sistema di inferenza. Non diventa automaticamente un sistema di apprendimento delle regole.

Un insieme di facet condivise tra categorie è un'astrazione semantica. Non dimostra necessariamente la capacità di scoprire autonomamente nuove relazioni.

Sono livelli diversi di maturità che vanno misurati separatamente.

La parte positiva è che non serve ricostruire tutto. Le skill che avevamo già predisposto contengono il principio dell'apprendimento cumulativo, il riutilizzo delle conoscenze, la validazione su gruppi indipendenti e l'obbligo di distinguere le capacità di Claude da quelle effettivamente sviluppate in PEE.

Il punto è far sì che quelle metodologie guidino le decisioni ingegneristiche e si traducano, progressivamente, in capacità del software stesso.

Risultato della ricerca e decisione consigliata

La direzione che sceglierei è una architettura di conoscenza scientifica tipizzata, con inferenza dichiarativa, provenienza verificabile e apprendimento induttivo controllato, costruita sui moduli esistenti.

La logica del primo ordine, attraverso il motore Datalog già disponibile, è una base ragionevole. Il ragionamento di ordine superiore dovrebbe intervenire quando serve apprendere o valutare principi sulle relazioni e sulle regole, non come requisito tecnologico astratto.

Soprattutto, gli esperimenti devono mostrare un trasferimento operativo reale: una conoscenza acquisita durante la ricerca su una categoria deve migliorare la comprensione o la valutazione di una categoria diversa, senza una correzione manuale costruita appositamente per quella prova.

Non manderei ancora Claude a sviluppare un'altra serie di funzionalità. Considererei questa ricerca come la base per riallineare la prossima fase alla metodologia già consolidata, lasciandogli autonomia nella scelta delle implementazioni e imponendo rigore sulle dimostrazioni.

I riferimenti che considero più preziosi per questo riallineamento sono SAREF per le funzioni, Popper per l'apprendimento dai fallimenti, Meta-Interpretive Learning per la generalizzazione delle regole, la rassegna sull'estrazione documentale e gli standard W3C per la rappresentazione e la verifica delle evidenze.

Non ho creato prompt, file o pacchetti, né avviato modifiche al progetto. Questa è una valutazione scientifica e ingegneristica delle soluzioni applicabili; le prestazioni che tali soluzioni potrebbero produrre in PEE restano da dimostrare sperimentalmente.
