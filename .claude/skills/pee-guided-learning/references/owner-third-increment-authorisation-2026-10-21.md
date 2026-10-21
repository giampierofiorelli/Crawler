# Owner authorisation of the third increment (2026-10-21)

Two owner messages received after Crawler commit 1981d82, preserved verbatim (Italian):
1. the third-increment prompt with the owner's research notes ("Che ne pensi?");
2. after Claude's reply, the explicit confirmation.

The confirmation states that the prompt in message 1 is the instruction ("secondo il prompt già ricevuto e le precisazioni
che hai proposto"). Claude's reply between them proposed four refinements; the owner adopted them with one precision.
Those refinements were:
- the reference annotates the problem, plausible solution families, the useful question and sufficiency instead of
  "category recognised";
- the independence limits of table material are declared (Claude saw all 313 package table headers during D1);
- the hypothesis lane extends N0's provenance and epistemic status;
- cited sources are verified before they ground a design choice.

---

## Message 1 (prompt and research notes)

Che ne pensi?

Le quattro osservazioni di Claude sono utili e, soprattutto, mostrano che sta utilizzando le analisi precedenti per individuare le dipendenze reali.

Autorizzerei il terzo incremento, con due precisazioni importanti.

La prima: non dobbiamo obbligare PEE a riconoscere una categoria quando l’utente non ne indica una. In quei casi può essere più intelligente individuare due possibili famiglie di soluzioni, spiegare perché potrebbero essere pertinenti e fare una domanda mirata. Il successo non è assegnare sempre una categoria, ma interpretare correttamente il problema.

La seconda: non chiederei subito un nuovo pacchetto scientifico. Claude dovrebbe prima verificare se dispone di documenti realmente non esaminati, utilizzabili per una validazione indipendente. Se non bastano, deve dichiarare il limite, senza riciclare H1/H2 come materiale nuovo.

Inoltre, lascerei a Claude ampia autonomia metodologica. Non gli prescriverei come utilizzare contenuti delle celle, coerenza delle righe o conoscenza quantitativa: sono possibilità che dovrebbe confrontare usando le proprie skill.

Prompt unico per Claude — Terzo incremento

Allegati necessari: nessuno. Tutto il materiale precedente è già disponibile nei repository. Non serve ricostruirlo.

PEE — Third Increment: Goal Understanding and Scientific Relation Interpretation

Ti autorizzo a procedere con il terzo incremento del programma coordinato PEE, sulla base delle decisioni registrate fino al commit 1981d82.

Utilizza attivamente pee-guided-learning, le altre skill pertinenti, la ricerca scientifica già disponibile, gli esperimenti R3-P/N1, l’inventario N0 e le capacità esistenti.

Hai autonomia per scegliere metodi, confrontare alternative, progettare esperimenti e proporre soluzioni migliori di quelle finora ipotizzate. Non limitarti a eseguire le nostre proposte tecniche.

Obiettivi

C — Comprendere l’obiettivo prima del prodotto

Sviluppa e valuta, inizialmente in ombra, una capacità generale di interpretare richieste nelle quali l’utente:

* nomina un prodotto;
* descrive soltanto un problema o un risultato desiderato;
* cita prodotti posseduti, alternative oppure oggetti di contesto;
* non fornisce informazioni sufficienti per identificare una soluzione.

PEE deve distinguere ciò che l’utente ha effettivamente richiesto dalle possibili soluzioni ipotizzate scientificamente.

Non forzare una categoria. Quando opportuno, conserva più ipotesi, individua la domanda utile a distinguerle oppure astieniti.

N1 — Comprendere meglio le relazioni scientifiche

Prosegui dal meccanismo N1 già implementato, senza ricominciare.

Indaga i limiti emersi sui documenti indipendenti: significato delle intestazioni, contenuto delle celle, tipo e direzione delle relazioni, condizioni e controindicazioni.

Confronta liberamente approcci generali, inclusi quelli già presenti in PEE. Non aggiungere semplicemente altre parole o regole specifiche per superare i casi falliti.

Le nuove relazioni restano sperimentali finché non soddisfano i criteri di ammissione.

Valutazione

Definisci e registra prima dello sviluppo un protocollo che misuri separatamente:

* identificazione corretta dell’oggetto e del suo ruolo;
* interpretazione degli obiettivi dichiarati;
* ipotesi scientificamente giustificate e ipotesi inventate;
* qualità delle domande di chiarimento;
* astensioni corrette e astensioni ingiustificate;
* accuratezza delle relazioni scientifiche, inclusi tipo, direzione, condizioni e provenienza;
* miglioramento operativo rispetto ai percorsi precedenti.

Utilizza dati nuovi e indipendenti. H1/H2, R3-P e i precedenti campioni di sviluppo sono ormai materiale esaminato.

Cerca prima materiale idoneo già disponibile. Non richiedere automaticamente nuovi pacchetti all’owner. Se la validazione indipendente non è fattibile, documenta il limite e non promuovere la capacità.

Distingui sempre implementazione, esperimento e risultato dimostrato.

Vincoli permanenti

Preserva le decisioni I-8, N0, N1 e A5, le protezioni C2, le valutazioni indipendenti e la provenienza scientifica.

Non introdurre nuovi motori paralleli, servizi a pagamento, regole per singoli prodotti o promozioni automatiche di conoscenze non revisionate.

Nessun cambiamento non validato può influenzare ranking, esclusioni o raccomandazioni operative.

Il lavoro sulla lettura delle relazioni scientifiche prepara R4, ma non ne ridefinisce o anticipa il completamento. N2–N3 e R5–R7 restano nella roadmap.

Autonomia e risultato atteso

Organizza autonomamente il lavoro e sfrutta le skill esistenti. Puoi condurre esperimenti esplorativi e confrontare alternative, mantenendo congelati i riferimenti indipendenti.

Non fermarti per decisioni tecniche ordinarie già comprese nei confini autorizzati. Se emerge una nuova scelta architetturale fondamentale, presenta le alternative senza assumere unilateralmente l’autorizzazione.

Concludi con un rapporto che distingua capacità implementate, prestazioni indipendenti, errori dannosi, progressi rispetto alle baseline e problemi residui.

Obiettivo principale: PEE deve dimostrare di comprendere meglio problemi nuovi e di interpretare più correttamente la conoscenza scientifica acquisita, senza aumentare inferenze arbitrarie, falsi collegamenti o decisioni ingiustificate.

Una differenza rispetto agli incarichi precedenti è importante: qui non stiamo decidendo anticipatamente quali algoritmi Claude debba sviluppare. Gli affidiamo due problemi scientifici strettamente collegati, gli strumenti già disponibili e la responsabilità di dimostrare ciò che funziona.

Il risultato ideale non è necessariamente riconoscere tutte le categorie né recuperare tutte le relazioni. È che PEE sappia distinguere sempre meglio tra ciò che comprende, ciò che può ragionevolmente ipotizzare e ciò che deve ancora verificare.

E questo terzo incremento non sostituisce il resto della nostra roadmap: ricerca e lettura documentale, estrazione quantitativa e qualitativa, attribuzione, R4–R7 e apprendimento cumulativo rimangono obiettivi del programma.

Cosa dice la ricerca scientifica sul terzo incremento di PEE

La direzione che abbiamo scelto è coerente con la letteratura scientifica. Gli esperti, però, suggeriscono una distinzione fondamentale: comprendere un problema, formulare ipotesi, fare domande e consigliare una soluzione sono capacità diverse, che devono essere valutate separatamente.

Questo è particolarmente importante per PEE, perché vogliamo che la conoscenza scientifica migliori concretamente il comportamento del sistema, non soltanto la quantità di informazioni che conserva.

1. Non forzare la categoria: gli studi ci danno ragione

Uno studio del 2023 pubblicato su Transactions of the Association for Computational Linguistics, InSCIt, analizza conversazioni in cui le richieste sono incomplete o non risolvibili immediatamente. Gli autori distinguono tre comportamenti: rispondere, chiedere chiarimenti oppure fornire informazioni pertinenti senza pretendere di aver risolto la domanda.

È esattamente la distinzione che serve a PEE.

Per esempio, davanti alla richiesta:

“My bedroom windows are wet every morning.”

PEE non dovrebbe decidere automaticamente che l’utente vuole acquistare un deumidificatore. Dovrebbe riconoscere il problema della condensazione, considerare spiegazioni e soluzioni alternative e distinguere ciò che è noto da ciò che va verificato.

2. Fare domande migliori, non più domande

La ricerca di Mohammad Aliannejadi e colleghi, pubblicata al CIKM 2021, mostra che non esiste una strategia di dialogo universalmente migliore: chiedere chiarimenti o proporre informazioni dipende dal costo dell’interazione e da quanto la risposta aiuterà davvero la ricerca.

Inoltre, uno studio pubblicato nel 2022 sull’esperienza degli utenti ha esaminato come la qualità e l’ordine delle domande influenzino soddisfazione e comportamento.

Conseguenza per PEE: non basta misurare quante domande corrette produce. Dobbiamo misurare se una domanda riduce un’incertezza importante, evita una conclusione sbagliata o permette di proseguire senza interrogare inutilmente l’utente.

3. Per interpretare le tabelle scientifiche, le intestazioni non bastano

Qui gli esperti sono particolarmente chiari.

Douglas Burdick e colleghi di IBM Research, in un lavoro pubblicato su Proceedings of the VLDB Endowment (2020), distinguono esplicitamente l’estrazione della struttura di una tabella dalla sua comprensione semantica.

Per interpretarla correttamente occorre collegare le celle non soltanto alle intestazioni, ma anche a unità di misura, note, titoli, riferimenti e testo circostante.

Una rassegna del 2024 sull’estrazione di informazioni a livello di documento individua inoltre problemi persistenti nella risoluzione dei riferimenti, nel ragionamento sulle relazioni e nei dati usati come riferimento per la valutazione.

Questo spiega molto bene il risultato N1: PEE può trovare le colonne collegate, ma non necessariamente capire la relazione espressa.

Per il terzo incremento, quindi, condivido la scelta di lasciare Claude libero di confrontare più approcci. Concentrarsi esclusivamente su nuovi vocabolari per le intestazioni sarebbe scientificamente riduttivo.

4. L’astensione deve essere una capacità misurabile

Yonatan Geifman e Ran El-Yaniv, nel lavoro SelectiveNet, studiano il rapporto fra quantità di casi affrontati e rischio di errore (risk–coverage trade-off). Il loro risultato è importante: un sistema non dovrebbe essere valutato soltanto per quante previsioni produce, ma anche per l’affidabilità di quelle che decide di produrre.

Applicato a PEE, significa che non dobbiamo premiare un sistema che assegna una categoria a 48 richieste su 48 se alcune assegnazioni sono arbitrarie.

Dobbiamo invece distinguere la categoria corretta, l’ipotesi plausibile ma non confermata, la domanda necessaria e l’astensione giustificata.

5. La conoscenza pertinente può essere anche contraddittoria

Uno studio presentato a IJCAI 2025 da Ziyu Ge e colleghi dimostra che i sistemi basati sul recupero di informazioni possono avere difficoltà quando le prove disponibili sono in conflitto, specialmente se hanno attendibilità differenti.

Questo è direttamente pertinente alle 11 informazioni contraddittorie recuperate dal nuovo N1, contro le 2 del percorso precedente.

Non basta trovare una relazione che contiene parole simili a quelle dell’utente. Occorre verificare che siano compatibili la situazione, la polarità, le condizioni e lo scopo della richiesta.

6. La generalizzazione è il punto su cui gli esperti invitano alla massima cautela

Un lavoro particolarmente recente, The Illusion of Generalization in Tabular Language Models, riesamina le prestazioni di un modello su 165 dataset. Gli autori individuano contaminazioni e problemi di valutazione capaci di far apparire la generalizzazione molto migliore di quanto sia realmente.

È un richiamo importante per PEE.

I risultati N1 sullo sviluppo — precisione 78% — erano molto più alti del 37% ottenuto su H1. Non possiamo ripetere lo stesso errore usando altre righe dello stesso tipo di tabella per dichiarare un miglioramento generalizzato.

Il mio giudizio rispetto alle ricerche

Nostra decisione	Valutazione rispetto alla letteratura
Comprendere l’obiettivo prima di fissare la categoria	Ben sostenuta
Formulare ipotesi e domande anziché forzare risposte	Ben sostenuta
Migliorare N1 oltre la sola lettura delle intestazioni	Fortemente giustificata
Applicare negazioni e condizioni al recupero	Coerente con i problemi documentati
Testare su documenti e richieste realmente nuovi	Essenziale
Far lavorare Claude con maggiore autonomia metodologica	Ragionevole, ma l’efficacia va dimostrata

Cambierei una sola cosa nell’attenzione del terzo incremento: darei ancora più importanza alla valutazione del passaggio dall’ipotesi alla conoscenza giustificata.

Vorrei che ogni ipotesi prodotta da PEE conservasse il motivo per cui è stata formulata, quali prove la sostengono, quali condizioni ne limitano l’applicabilità e che cosa potrebbe smentirla.

È un requisito trasversale a C, N1, N2 e, successivamente, R4–R7.

Non vedo invece nella letteratura esaminata motivi sufficienti per imporre ora un modello linguistico pesante, un nuovo database a grafo o una ristrutturazione generale del sistema.

Conclusione: gli esperti sostengono le principali scelte del nostro terzo incremento, ma non ne garantiscono il successo. Il test decisivo sarà dimostrare che PEE comprende meglio problemi e documenti mai esaminati, produce meno collegamenti sbagliati e sa quando chiedere ulteriori informazioni.

Non aggiungerei adesso un nuovo prompt a Claude: quello del terzo incremento contiene già gli obiettivi fondamentali e lascia spazio per applicare le sue skill.

---

## Message 2 (explicit confirmation)

Sì, confermo l’autorizzazione al terzo incremento. Le precisazioni di Claude sono corrette e coerenti con le decisioni precedenti.

Apprezzo soprattutto tre aspetti: non forzare una categoria, distinguere le ipotesi dai bisogni effettivamente espressi e riconoscere i limiti dell’indipendenza dei materiali di valutazione.

Farei soltanto una precisazione: il riconoscimento della categoria resta una misura utile quando l’utente nomina chiaramente un prodotto. Non deve però diventare un obiettivo universale, perché nelle richieste basate soltanto su un problema può essere più appropriato considerare più soluzioni o chiedere chiarimenti.

Puoi inviare a Claude questa conferma, senza ripetere il prompt precedente.

Confermo esplicitamente l’autorizzazione al terzo incremento PEE, secondo il prompt già ricevuto e le precisazioni che hai proposto.

Procedi autonomamente, utilizzando attivamente le skill esistenti e mantenendo libertà scientifica e progettuale entro i confini concordati.

Approvo la preregistrazione, i riferimenti sigillati, lo sviluppo sperimentale di C e della semantica delle tabelle, e la pubblicazione delle prime esecuzioni senza modifiche successive.

Non forzare l’attribuzione di categorie. Valuta separatamente il riconoscimento dei prodotti esplicitamente nominati e la comprensione delle richieste basate su problemi o obiettivi.

Dichiara correttamente i limiti dell’indipendenza dei materiali e verifica le fonti scientifiche prima di utilizzarle come fondamento di decisioni architetturali.

Mantieni ogni ipotesi distinta dai bisogni confermati, con giustificazione, condizioni, evidenze e possibili controprove.

Non occorrono ulteriori approvazioni per le normali decisioni tecniche comprese nell’incarico. Rispetta le condizioni di arresto concordate e non promuovere capacità non validate.

Procedi.

Non aggiungerei altri requisiti. Ora è importante lasciare lavorare Claude senza interromperlo, valutando alla fine che cosa ha realmente dimostrato e quali capacità PEE ha acquisito.
