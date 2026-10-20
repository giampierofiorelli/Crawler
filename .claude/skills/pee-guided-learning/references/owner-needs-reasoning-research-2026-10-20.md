# Owner request: research on reasoning about implicit needs (2026-10-20)

Received during R3-P, while the needs pilot was frozen (build 58676ef) and waiting for the Stack Exchange quota. It
authorises a research study (literature and audit of existing PEE capability), not code changes; the frozen pilot is not
modified. Preserved verbatim (Italian). The owner's preceding message in the same exchange asked whether Claude could
take on another offline task meanwhile and return to the suspended pilot afterwards.

---

Fai tutte le ricerche di cui hai bisogno

Sì. E penso che questa sia una delle cose più utili che possiamo fare per PEE adesso.

Invece di lasciare che Claude cerchi di migliorare la comprensione dei bisogni attraverso tentativi successivi sul codice, possiamo studiare come questo problema viene affrontato nell'ingegneria dei requisiti, nell'intelligenza artificiale simbolica e nella rappresentazione della conoscenza.

Ho iniziato a consultare la letteratura tecnica e ho trovato alcuni approcci particolarmente pertinenti.

1. Esiste già una disciplina che studia esattamente questo problema

Si chiama Goal-Oriented Requirements Engineering (GORE).

Il suo scopo è comprendere gli obiettivi delle persone e trasformarli in requisiti verificabili, distinguendo bisogni, condizioni, vincoli e possibili soluzioni.

È un approccio formalizzato da metodologie come KAOS e iStar. Lo standard ISO/IEC/IEEE 29148:2018 distingue esplicitamente i bisogni degli stakeholder dalla loro traduzione in requisiti tecnici.

Per PEE è estremamente pertinente.

Prendiamo tre richieste:

* «Sono una persona che ha il sonno leggero».
* «Voglio preparare un espresso come al bar in Italia».
* «Non posso modificare i mobili della cucina per installare una lavastoviglie».

In ciascun caso, l'utente ci comunica qualcosa di significativo senza specificare tutte le caratteristiche tecniche del prodotto.

Il problema ingegneristico è ricostruire le relazioni fra ciò che dice, quello che vuole ottenere e le proprietà che permettono di verificare se una soluzione è adatta.

Questo può essere affrontato con conoscenze strutturate e ragionamento esplicito, senza richiedere necessariamente un LLM generativo a ogni interrogazione.

Ma bisogna progettare correttamente i meccanismi di inferenza.

2. Le cinque componenti scientifiche che fornirei a Claude

Dalla prima ricognizione emergono cinque filoni da integrare, senza imporre a PEE una nuova architettura prima di aver verificato quella esistente.

| Disciplina | Cosa insegna a PEE |
|---|---|
| Goal-oriented engineering (KAOS, iStar) | Distinguere obiettivi, qualità desiderate, attività e risorse |
| Context-aware reasoning | Interpretare come il contesto modifica la rilevanza di un bisogno |
| Abductive reasoning | Formulare ipotesi sui bisogni impliciti, senza trattarle come certezze |
| Function–Behaviour–Structure (FBS) | Collegare risultati desiderati, comportamento fisico e caratteristiche dei prodotti |
| Knowledge representation e provenance | Verificare e tracciare ogni passaggio del ragionamento |

Due studi sono particolarmente interessanti.

Il primo, A Goal-based Framework for Contextual Requirements (Ali e colleghi, 2010), studia esplicitamente il rapporto fra contesto, obiettivi e scelte possibili.

Il secondo, (Bruggeman, Ciliotta Chehade e Ciuccarelli, 2023), propone il ragionamento abduttivo come strumento per scoprire bisogni latenti attraverso la conoscenza del dominio. È particolarmente vicino al problema attuale di PEE, anche se presenta una proposta teorica, non una validazione della nostra implementazione.

3. Il modello che inizierei a studiare per PEE

Vorrei che PEE arrivasse a ragionare attraverso relazioni di questo genere:

Osservazione dell'utente

«I'm a light sleeper»

Interpretazione contestuale

Possibile sensibilità ai disturbi notturni

Ipotesi sul bisogno

Funzionamento compatibile con il sonno

Conoscenza scientifica

Rumore percepito, variazioni sonore, flusso d'aria, prestazioni alla velocità effettiva

Verifica richiesta

Misure pertinenti, condizioni di prova, evidenze disponibili e incertezza residua

La mia proposta è che ogni relazione abbia un tipo dichiarato e una giustificazione. PEE deve poter ricostruire perché ha collegato due concetti.

Ma c'è un passaggio ancora più importante.

PEE non dovrebbe necessariamente scegliere un solo bisogno quando ne esistono diversi plausibili. Dovrebbe poter conservare più ipotesi senza trasformarle tutte in requisiti dell'utente.

Il problema rilevato da Claude, che ha dovuto limitare le inferenze a una per richiesta, è probabilmente un segnale che manca ancora un buon meccanismo di selezione e di gestione dell'incertezza.

La ricerca sulle rappresentazioni formali offre strumenti utili. Per esempio, OWL 2 RL permette forme di ragionamento basate su regole, mentre lo standard W3C PROV-O fornisce concetti per rappresentare la provenienza delle informazioni e delle derivazioni. Non significa che PEE debba necessariamente adottare questi standard: possiamo studiarne i principi e verificare se sono già compatibili con la sua architettura.

4. Gli ingredienti pratici da ricavare dalla ricerca

La ricerca dovrebbe produrre qualcosa di utilizzabile da Claude, non semplicemente un documento accademico.

Mi concentrerei su questi elementi:

* Una tassonomia dei bisogni: espliciti, impliciti, ipotizzati, condizionali, facoltativi, negati e ancora sconosciuti. Con distinzione fra obiettivo, qualità, vincolo, funzione e caratteristica tecnica.
* Un modello di relazioni generali: ad esempio used_in, seeks_outcome, may_impair, requires_condition, measured_by, insufficient_as_evidence. Prima verificando quelle che PEE già possiede.
* Un meccanismo di inferenza giustificata: ogni nuovo bisogno deve avere una catena di conoscenze pertinente, condizioni soddisfatte, eventuali controindicazioni e provenienza. Una parola comune non è una giustificazione.
* Un sistema per gestire alternative e incertezza: distinguere ciò che PEE può affermare, suggerire, chiedere o lasciare sconosciuto. Nessun bisogno semplicemente inferito può produrre automaticamente l'esclusione di un prodotto.
* Un metodo sperimentale trasferibile: verificare che il medesimo meccanismo funzioni su purificatori, macchine da caffè, lavastoviglie e una categoria non utilizzata durante lo sviluppo.

Dovremo inoltre studiare il ragionamento causale e controfattuale: sapere che due concetti sono associati non basta per stabilire che una caratteristica del prodotto contribuisca realmente al risultato desiderato.

La distinzione fra funzioni e risultati deve rimanere centrale. Per esempio, sleep mode è una funzione; dormire senza disturbi è un risultato; le prove acustiche e prestazionali servono a valutare se quella funzione contribuisce davvero al risultato.

5. Come coordinare questa ricerca con Claude

Non modificherei il pilota già congelato. Utilizzerei il suo risultato come diagnosi indipendente, poi confronterei le debolezze effettivamente emerse con le soluzioni scientifiche individuate.

In particolare, eviterei di consegnare a Claude centinaia di nuove associazioni del tipo «light sleeper → quiet operation». Sarebbe una conoscenza fragile e specifica, proprio ciò che abbiamo cercato di superare.

Gli fornirei invece i principi verificati, i tipi di relazione, le condizioni di inferenza, i controesempi, le modalità di validazione e i riferimenti scientifici, in modo che possa integrarli nei meccanismi già esistenti.

La mia raccomandazione è quindi di avviare una ricerca ingegneristica dedicata alla comprensione dei bisogni impliciti e alla loro trasformazione in requisiti verificabili. In inglese, approfondita e basata su letteratura scientifica primaria, come le ricerche che abbiamo già svolto per le categorie di prodotto.

La differenza è che questa ricerca insegnerebbe a PEE come ragionare sui bisogni in qualunque categoria, mentre i documenti scientifici delle singole categorie gli insegnano quali fenomeni e quali prove sono pertinenti.

È proprio l'integrazione di queste due conoscenze che potrebbe permettergli di diventare progressivamente più competente e autonomo.

Non ho creato documenti o prompt per Claude: per adesso abbiamo individuato e verificato le basi scientifiche sulle quali costruire la ricerca, senza interferire con l'esperimento in corso.
