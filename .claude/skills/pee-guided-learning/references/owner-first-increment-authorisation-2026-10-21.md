# Owner authorisation of the first increment of the coordinated plan (2026-10-21)

Received after Crawler commit c1588cf and pee-knowledge commit e08206b. Preserved verbatim (Italian). This is the
single consolidated instruction the owner announced in `owner-review-coordinated-plan-2026-10-21.md`.

---

A questo punto possiamo autorizzare lo sviluppo. Claude riferisce di aver salvato gli originali R3-P nel repository privato e registrato le nostre ultime decisioni. Il lavoro precedente non va ripetuto.

Autorizzerei il primo incremento del piano coordinato, senza allargarlo a N1–N3 o R4–R7. Queste fasi restano nel programma complessivo.

Allegati necessari: nessuno. Il piano, la revisione del proprietario, il rapporto R3-P, l’inventario N0 e i materiali scientifici sono già nei repository o nell’ambiente di Claude. Non serve inviare altri documenti.

Ecco l’unica istruzione consolidata.

Procedi con il primo incremento del piano coordinato PEE, secondo docs/plans/coordinated-plan-after-r3p.md (commit ea545e2) e la successiva revisione del proprietario (commit c1588cf).

Questa è l’autorizzazione all’implementazione esclusivamente nei confini seguenti. Conserva tutte le decisioni già registrate, senza ripetere ricerche, diagnosi o inventari completati.

A — Integrità e sicurezza (R3-C)

A1–A4: test prima delle modifiche.

* Estendi C2 alle opzioni sperimentali A, B, C-lite e ai percorsi di ranking pertinenti. Nessuna conoscenza non revisionata deve raggiungere la risposta come fatto accertato. Mantieni le inferenze sperimentali isolate, identificate e prive di effetti decisionali.
* Correggi il contratto verticale e aggiungi test di raggiungibilità effettiva dei moduli, non soltanto di presenza degli export.
* Proteggi con test specifici entrambe le coppie remain_withheld, senza autorizzarne il rilascio.
* Registra correttamente i limiti di C3/C4: finché il percorso decisionale è bloccato, valuta astensione giustificata ed evidenze mancanti, non classifiche inesistenti.

A5: per ora soltanto censimento e verifica.

* Identifica le scritture dirette, quelle effettivamente coperte dal journal e le dipendenze esterne da store.db.
* Su copie controllate, determina quali informazioni siano realmente ricostruibili e quali no.
* Non modificare ancora strutturalmente lo store, non rendere privato db e non spostare le scritture prima di aver dimostrato quali garanzie devono essere preservate.
* Non confondere l’introduzione di metodi dello store con la ricostruibilità degli eventi.

A6–A7: elimina i due cicli di import introdotti da R3-P con modifiche minime e test di equivalenza; correggi il requisito Node.js secondo le dipendenze effettivamente utilizzate. Non avviare una ristrutturazione generale.

B — N0 essenziale, esclusivamente in ombra

Introduci una rappresentazione semantica condivisa, riutilizzando i moduli esistenti e l’inventario delle 15 incompatibilità.

Distingui:

* prodotto richiesto, già posseduto, citato come contesto, ipotizzato o alternativo;
* obiettivi, risultati, problemi, proprietà, funzioni, preferenze e vincoli;
* voluto, non necessario, indesiderato, esplicitamente escluso e indifferente;
* forza del requisito, provenienza e stato epistemico.

Preserva le relazioni not_sufficient_for e requires_condition.

Le funzioni esplicitamente rifiutate devono essere rappresentabili senza diventare bisogni positivi. Non equiparare automaticamente «non mi serve» a un’esclusione assoluta.

Utilizza i controesempi già documentati, compresi montalatte e mop. Verifica le incompatibilità dell’inventario senza pretendere di risolvere quelle fuori dal modello essenziale.

Nessuna nuova inferenza deve modificare decisioni, esclusioni o ranking. Non costruire un altro motore parallelo e non introdurre correzioni specifiche per singole categorie.

D1 — Censimento scientifico, sola lettura

Esamina tutti i pacchetti scientifici effettivamente disponibili, senza ricrearli.

Misura per categoria:

* relazioni situazione → criterio → evidenza presenti nei documenti;
* relazioni conservate correttamente nella conoscenza strutturata;
* relazioni perse, alterate, non collegate o non rappresentabili;
* provenienza verificabile e stato della conoscenza;
* eventuali dipendenze dalla struttura dello store.

Non procedere ancora alla re-derivazione N1. Distingui le perdite dimostrate dalle cause soltanto ipotizzate.

Vincoli generali

1. Mantieni il programma complessivo A–G e R4–R7, ma non implementare ora le fasi successive.
2. Non modificare i materiali e i risultati sigillati di R3-P. Gli originali privati devono rimanere intatti.
3. Non introdurre servizi a pagamento o nuove dipendenze architetturali non necessarie.
4. Nessuno spostamento in archive/, divisione dello store o eliminazione generalizzata delle regex.
5. Scrivi i test pertinenti prima del codice. Verifica regressioni, percorsi reali e invarianti di sicurezza.
6. Mantieni la compatibilità con il codice esistente e non alterare silenziosamente il comportamento della consulenza.
7. Interrompi la parte interessata se emergono conflitti semantici non autorizzati, regressioni inspiegate, problemi di permessi o rischi per l’integrità. Prosegui autonomamente sulle parti indipendenti e sicure.

Consegna

Completa autonomamente il lavoro autorizzato, senza richiedere approvazioni intermedie per decisioni già concordate.

Nel rapporto finale distingui chiaramente:

* modifiche implementate;
* verifiche effettivamente eseguite e relativi risultati;
* ipotesi ancora da dimostrare;
* incompatibilità e rischi residui;
* risultati del censimento scientifico;
* prerequisiti per C, N1, N2 e le fasi successive.

Pubblica i commit secondo la procedura esistente, mantenendo documentazione e roadmap coerenti.

Obiettivo fondamentale: rendere più affidabile l’intera catena di PEE — comprensione, acquisizione scientifica, conservazione, attribuzione e utilizzo della conoscenza — mediante capacità generali e permanenti, non mediante nuove regole costruite per superare singoli test.

Una precisazione importante: questo incarico non autorizza ancora a risolvere tutti i problemi scoperti. Autorizza un incremento concreto, con condizioni di arresto e risultati verificabili.

Quando Claude avrà finito, potremo utilizzare il censimento scientifico e il modello N0 per progettare il riconoscimento generale degli obiettivi e il recupero N1 delle relazioni perse, senza dover ricominciare l’analisi.

---

## Scope as understood (Claude)

| Item | Authorised | Not authorised |
|---|---|---|
| A1 | C2 tests over options A, B, C-lite and the ranking path; permanent guard that experimental inferences stay isolated, marked, and without decision effect | Changing what the answer recommends |
| A2 | Contract corrections; a runtime reachability test from the advice entry point | |
| A3 | Tests pinning the two `remain_withheld` pairs | Releasing either pair |
| A4 | Recording C3/C4 scoring limits (justified abstention, precise missing evidence) | Scoring a ranking that cannot exist |
| A5 | Census of direct writes, journal coverage, external `store.db` dependents; rederivability check on controlled copies | Structural store change, private `db`, moving writes |
| A6-A7 | Remove the two R3-P import cycles minimally, with equivalence tests; Node.js `engines` per the dependencies used | General restructuring |
| B | N0 shared semantic representation in shadow, reusing existing modules | Any effect on decisions, exclusions or ranking; a parallel engine; per-category fixes |
| D1 | Read-only survival census over every available package, per category | N1 re-derivation |
