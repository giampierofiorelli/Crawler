# Owner decision after R3-P, with the external architecture audit (2026-10-21)

The owner's message contained three parts, preserved verbatim below:

1. **Part A:** an architecture review written by another Claude session, the "plugin audit", which the owner
   forwarded. It is an external review still to be verified.
2. **Part B:** the owner's review of the R3-P report (commit 6969977).
3. **Part C:** the owner's decision to integrate the audit into one coordinated programme.

Claude's verification of Part A against the code is in `docs/plans/coordinated-plan-after-r3p.md` §1.

---

## Part A — external audit (forwarded, verbatim)

All three reports are in. I'll verify the store's upward imports and the runtime cycles before writing this up.

## PEE architecture review: findings

The engine is safe where it matters most. Ranking fails closed, the build is clean, and all 16 tests in the vertical-path, contract and decision-safety files pass. The structure, though, has drifted well beyond what the roadmap rules allow. I changed nothing; this was a read-only review, and I checked the key claims myself.

### Gaps that block the current step (R3-C)

1. **The safety test for machine translation only runs with default options.** C2 requires that no machine-translated text reaches a user-facing field. The test calls the advice entry point with `{}`. The opt-in `needInterpretation` path writes translated knowledge into the answer, and the test never exercises it.
2. **The vertical contract is wrong about two modules.** It says `knowledge_statements` and `product_facts` are on no user path. Both are imported at runtime by the advice entry point (`phase253` → `need_interpretation`). The contract test only checks that each stage's exports exist, not that stages are connected.
3. **Knowledge cannot change a decision, by design.** The evidence and ranking stages are blocked, so C3 and C4 can only score intermediate fields: goals understood, evidence needed, classification. They cannot score the final decision. This should be written into the preregistered C3/C4 scoring before any run.
4. **A clean "knowledge vs added words" ablation isn't possible yet.** Knowledge lives in 31 JSON files, but about 300 regex and word-list constants in the code also act as knowledge. Turning off the JSON leaves the code lists active.
5. **The "two withheld pairs" (C2) have no recorded status.** A generic `pending_validation` reason exists, but the two specific pairs aren't recorded or tested.

### Structural debt (not blocking now)

- **The store is a god object.** `KnowledgeStore246` is 1,590 lines with about 65 methods, and it calls extraction and discovery code. It does 82 direct writes against only 37 journal events. Only one table can be rebuilt from the journal, which falls short of the owner's "journal plus rebuildable projection" rule. It also exposes its `db` handle, and other modules write through it directly.
- **Several modules do the same job**, which the "no parallel engines" rule forbids:
  - 5 legacy SQLite stores, plus a Postgres path;
  - 9 table readers;
  - 8 discovery modules;
  - about 7 unit vocabularies;
  - several old request-to-advice paths.

  `src/index.ts` exports the old path, not the current `phase253`/`phase246` one.
- **Three runtime import cycles:**
  - `need_interpretation` ↔ `phase253`;
  - `quantity_knowledge` ↔ `language_scope`;
  - `phase75` ↔ `phase223`.
- **Navigation is hard.** 229 of 305 source files are named by phase number, and the numbers don't show layer or age. `package.json` has 277 phase scripts. The engine root holds about 110 old manifest and continuation files, and the directory name says phase243 while work is at about 272.
- **Small items:**
  - `engines` says Node `>=20`, but `node:sqlite` needs 22.5 or later.
  - Most tests use built inputs; real-data checks live in about 400 evaluation scripts outside the test suite.

### What I'd do

- **Now, inside R3-C (small, test-first):**
  - rerun the C2 test with the opt-in options switched on;
  - add a reachability check to the contract test and fix the two wrong entries;
  - record and test the two withheld pairs;
  - make the store's `db` handle and `event()` private, so all writes go through journalled store methods (this helps C1).
- **Needs your decision (major architecture):**
  - name one module for each job and mark the rest legacy;
  - split the store;
  - move the code word lists into knowledge packs or freeze them as the "base reader";
  - move old phase files into `archive/` with `git mv`, without deleting anything.

Should I start on the R3-C items? I can also publish this review as a shareable page if that helps.

---

## Part B — owner review of the R3-P report (verbatim)

PEE — R3-P concluso: cosa cambia per il programma di sviluppo

Ho letto direttamente il , pubblicato da Claude nel commit 6969977.

Adesso abbiamo elementi sufficienti per prendere alcune decisioni architetturali. Non dobbiamo però dimenticare il resto del programma PEE, compreso l'audit dell'altra sessione.

La scoperta che cambia le priorità

Bisogni mancati da B

90/100

Nel nuovo riferimento sigillato

Bisogni mancati con categoria non riconosciuta

63/90

La prima barriera è a monte

Controfattuale: fornire la categoria corretta

Esperimento diagnostico successivo alla prima esecuzione. Non rappresenta una nuova prestazione operativa di PEE.

La conseguenza è notevole: PEE spesso non arriva nemmeno alla fase in cui può utilizzare le proprie conoscenze scientifiche, perché non identifica correttamente l'oggetto della richiesta o la categoria di prodotto.

Questo problema ha due forme differenti:

* L'utente nomina il prodotto, ma PEE non lo riconosce oppure confonde un oggetto del contesto con quello da valutare.
* L'utente descrive soltanto il risultato che vuole ottenere, senza nominare un prodotto. PEE non sa ancora passare in modo affidabile dall'obiettivo alle possibili categorie e soluzioni.

La seconda situazione è particolarmente importante perché riguarda la visione originaria del progetto: un consulente che comprende il problema dell'utente, anche quando l'utente non sa quale prodotto acquistare.

La seconda scoperta: la conoscenza scientifica viene persa

Nel campione diagnostico di 25 relazioni necessarie, Claude ne ha trovate:

Conservate in forma utilizzabile

11/25

11 conservate

14 perse o alterate

Non è una percentuale rappresentativa di tutti i documenti scientifici di PEE. È però una verifica concreta, riferita alle relazioni necessarie per questi casi.

Il rapporto descrive, per esempio, una relazione tra poco spazio disponibile e ingombro della macchina da caffè, compresi gli spazi operativi. Il documento originale la contiene, ma la conoscenza strutturata conserva soltanto una parte dell'informazione e associa persino un tipo di misura non pertinente.

Questo indica che il problema dell'acquisizione scientifica non può essere subordinato interamente alla comprensione dei bisogni. È un difetto autonomo del processo di apprendimento e può compromettere molte altre capacità di PEE.

2. La diagnosi non esaurisce il problema

Claude ha identificato anche 10 bisogni raggiungibili ma scartati durante la selezione, 20 bisogni senza un concetto corrispondente nel catalogo e soltanto 3 classificati come conoscenza scientifica realmente assente.

Questi numeri non vanno sommati: le cause possono sovrapporsi. Inoltre, un concetto mancante nel catalogo non implica necessariamente che la conoscenza manchi dai documenti.

Un altro risultato è significativo: Phase172, un vecchio modulo che sembrava promettente, interpreta erroneamente alcuni rumori di purificatori e lavastoviglie come rumori di frigoriferi. Dunque recuperare indiscriminatamente i moduli precedenti sarebbe un errore.

Il consolidamento deve riutilizzare le capacità valide, non semplicemente riattivare il vecchio codice.

C'è anche un problema nel riferimento sperimentale: la lista dei concetti utilizzata per le annotazioni escludeva alcuni tipi. Di conseguenza, un bisogno corretto milk_drinks è stato contato come inventato. Claude ha mantenuto invariati i risultati sigillati e dichiarato la correzione successiva. È metodologicamente corretto, ma mostra che anche il sistema di valutazione richiede miglioramenti.

3. Come entra in gioco l'audit dell'altra sessione

Qui c'è una novità rispetto al rapporto di Claude.

Ho esaminato anche il percorso di codice congelato 58676ef che collega phase253_request_advice.ts a need_interpretation.ts.

Posso confermare che l'interpretazione sperimentale dei bisogni viene aggiunta all'oggetto Advice253 quando è attiva l'opzione needInterpretation. Quel campo può contenere inferenze derivate da dichiarazioni scientifiche ancora non revisionate, sebbene etichettate come sperimentali e non utilizzate direttamente nelle decisioni.

Questo rende il rilievo C2 dell'altro audit concreto e meritevole di verifica. Non ho però dimostrato che testi scientifici tradotti automaticamente vengano effettivamente mostrati all'utente finale come fatti accertati. È necessario verificare il percorso completo di presentazione.

Le altre criticità segnalate dall'audit restano pertinenti: il contratto verticale potrebbe non verificare adeguatamente i collegamenti tra moduli, le scritture del database potrebbero non essere tutte ricostruibili dal journal e alcune conoscenze potrebbero essere duplicate nel codice.

Queste questioni non sono state risolte da R3-P.

4. La sequenza di sviluppo che propongo ora

Non seguirei rigidamente l'ordine finale proposto da Claude, perché N0 viene collocato dopo altri interventi pur essendo riconosciuto come prerequisito semantico.

Distinguerei invece i prerequisiti minimi dalle attività che possono procedere autonomamente.

| Filone | Prossimo lavoro | Dipendenza |
|---|---|---|
| R3-C e integrità | Verificare C2, percorsi effettivi e contratti di sicurezza | Può partire indipendentemente |
| N0 essenziale | Stabilire un modello comune di oggetto, contesto, bisogno, rifiuto e forza | Prima delle nuove inferenze operative |
| Categoria e obiettivo | Comprendere che cosa l'utente vuole ottenere, anche senza nominare il prodotto | Usa le distinzioni di N0 |
| N1 | Conservare e recuperare le relazioni scientifiche dai pacchetti originali | Richiede concetti e provenienza tipizzati |
| N2 | Selezionare ipotesi, considerare alternative e controindicazioni | Dopo aver migliorato le conoscenze disponibili |
| N3 | Validare le nuove capacità su richieste indipendenti e autentiche | Dopo le implementazioni |

Questo non significa autorizzare automaticamente tutte queste fasi. È una proposta di dipendenze e ordine di lavoro.

La lettura documentale, R4 e la verifica di quanto è stato appreso dai pacchetti scientifici possono avanzare come filoni separati. Non devono aspettare che la comprensione dei bisogni sia perfetta.

E non perdiamo R5, R6 e R7: apprendimento delle regole, trasferimento tra categorie e consulenza completa rimangono obiettivi espliciti del programma.

Una precauzione per il riconoscimento della categoria

Non vorrei che il risultato R3-P spingesse Claude a introdurre semplicemente molti sinonimi di purifier, grinder, dishwasher e così via.

Il riconoscimento della categoria dovrebbe includere una distinzione generale tra prodotto richiesto, prodotto posseduto, oggetto citato come contesto e prodotto soltanto ipotizzato.

Quando l'utente non nomina nessun prodotto, il sistema dovrebbe anche poter considerare più famiglie di soluzioni, senza fingere che la categoria sia già stata determinata.

È un problema di interpretazione del compito e di collegamento obiettivo → soluzione, non soltanto di vocabolario.

5. Un problema immediato: la conservazione dei materiali sperimentali

Nel resoconto finale Claude riferisce che il repository privato contiene una copia con i testi sostituiti dalle impronte SHA-256. Gli originali completi restano soltanto nel suo ambiente di esecuzione, perché la copia integrale è stata bloccata da un controllo dei permessi.

Questo punto merita attenzione prima che quell'ambiente venga eliminato.

Le impronte permettono di verificare l'identità di un documento quando lo si possiede già, ma non consentono di ricostruirne il contenuto.

Se gli originali non vengono conservati in un luogo autorizzato, una parte dell'esperimento potrebbe non essere più riesaminabile. La soluzione richiede un controllo dei diritti di conservazione, delle licenze e delle autorizzazioni, senza aggirare il blocco esistente.

Non serve ripetere l'esperimento. Serve decidere come preservare legittimamente ciò che è stato prodotto.

6. Dove siamo veramente

R3-P completato come esperimento. La negazione numerica mostra un miglioramento circoscritto; la comprensione dei bisogni non è pronta.

Ricerca scientifica e inventario N0 disponibili. Abbiamo basi sufficienti per progettare il consolidamento senza ricominciare gli studi.

R3-C e problemi di integrità ancora aperti. L'audit dell'altra sessione deve essere verificato e collegato alla roadmap.

R4–R7 e apprendimento delle categorie ancora da sviluppare e validare. La conclusione di R3-P non li sostituisce.

La decisione che prenderei

Passerei dalla fase di sola diagnosi a una fase di sviluppo coordinato, ma delimitato da verifiche di sicurezza e dipendenze architetturali.

Prima farei confluire l'audit dell'altra sessione nel quadro ufficiale di PEE, verificando i rilievi realmente bloccanti. Poi autorizzerei il lavoro sul modello semantico minimo e sul riconoscimento generale di categoria e obiettivo, senza ancora promuovere le inferenze di B o le regole di C-lite.

Parallelamente, terrei aperto il filone sul recupero delle relazioni scientifiche, perché abbiamo già evidenze sufficienti che la loro perdita costituisca un problema reale.

Non preparerei un nuovo prompt sovrapposto agli altri senza prima fissare queste decisioni in un unico incarico consolidato.

Soprattutto, non considererei l'esito deludente di R3-P un motivo per rallentare tutto PEE. Ci ha mostrato dove si interrompe la catena di ragionamento. Adesso dobbiamo intervenire sulla catena completa, continuando contemporaneamente a migliorare lettura scientifica, estrazione, attribuzione e apprendimento.

---

## Part C — owner decision on integrating the audit (verbatim)

Sì, dobbiamo assolutamente utilizzare anche l'audit del plugin. Non lo terrei completamente separato. Anzi, alla luce dei risultati R3-P, alcune delle sue osservazioni diventano ancora più importanti.

Farei però una distinzione: un unico programma di sviluppo, con filoni tecnici distinti e dipendenze esplicite. Non voglio che Claude lavori sui bisogni mentre un'altra sessione ristruttura il database o modifica gli stessi moduli senza coordinamento.

Come integrerei i due lavori

| Risultati di Claude | Rilievi del plugin da integrare |
|---|---|
| PEE non riconosce spesso categoria e obiettivo | Verificare i percorsi operativi e i vecchi motori di interpretazione |
| Conoscenza scientifica persa durante l'acquisizione | Verificare struttura dello store, journal e ricostruibilità |
| Diverse rappresentazioni incompatibili dei bisogni | Consolidare i moduli duplicati e stabilire responsabilità univoche |
| Inferenze scientifiche ancora inaffidabili | Verificare che la conoscenza non revisionata non raggiunga impropriamente le risposte |
| Necessità di esperimenti A/B attendibili | Separare conoscenza dichiarativa e vocabolari incorporati nel codice |
| Capacità scientifiche esistenti ma non utilizzate | Verificare i collegamenti effettivi nel contratto verticale |

Il collegamento più importante è quello fra acquisizione scientifica, database e utilizzo della conoscenza.

Claude ha dimostrato, nel campione esaminato, che molte relazioni contenute nei documenti originali non sopravvivono in forma utilizzabile.

Il plugin ha segnalato che KnowledgeStore246 concentra molte responsabilità, permette scritture dirette e dispone di un journal che potrebbe non consentire la ricostruzione completa.

Non possiamo ancora affermare che il secondo problema provochi il primo. Ma sarebbe sbagliato progettare N1 senza verificare il rapporto tra questi due aspetti.

Come cambierei le priorità

1. Integrità e sicurezza, R3-C

Verificare prima C2, i percorsi che espongono conoscenza non validata, le connessioni del contratto verticale e i due casi trattenuti. Sono questioni di sicurezza e correttezza, non semplici miglioramenti organizzativi.

2. Consolidamento semantico e comprensione

N0, riconoscimento generale degli oggetti e delle categorie, interpretazione dei bisogni. Utilizzare la ricerca scientifica e le incompatibilità già individuate, senza creare un altro motore parallelo.

3. Conservazione e applicazione della conoscenza

N1 e verifica del percorso documento → dichiarazione → relazione → database → ragionamento. Qui entra direttamente anche l'audit sul journal e sulla ricostruibilità.

4. Ragionamento, apprendimento e trasferimento

N2–N3, R4–R7, ipotesi multiple, collegamento delle evidenze, apprendimento governato e trasferimento scientifico tra categorie.

Questo è un ordine di dipendenze, non una proposta di fermare ogni filone finché il precedente non sia completamente concluso. La ricerca e la progettazione delle parti indipendenti possono avanzare contemporaneamente.

Cosa non farei

Non approverei adesso lo spostamento di centinaia di file in archive/, la divisione immediata di KnowledgeStore246 o la rimozione generale delle regex.

Il plugin ha identificato potenziali problemi, ma alcune raccomandazioni sono ristrutturazioni importanti che richiedono un'analisi delle dipendenze.

Prima serve distinguere i problemi che impediscono il funzionamento corretto da quelli di manutenzione.

E soprattutto non dobbiamo perdere vecchie capacità scientifiche mentre consolidiamo l'architettura.

La decisione che propongo

Facciamo entrare formalmente l'audit del plugin nel programma ufficiale di PEE, mantenendolo identificato come revisione esterna ancora da verificare.

Claude dovrà confrontarlo con lo stato effettivo del codice, la roadmap e i risultati R3-P, classificando ogni rilievo come verificato, parzialmente confermato, superato o non dimostrato.

Non servirà ripetere tutta la diagnosi. E non sarà necessario chiedergli di rifare la ricerca scientifica.

Da questo confronto dovrà uscire un unico piano coordinato che comprenda anche il nostro programma precedente: R3-C, N0–N3, R4–R7, documenti scientifici, estrazione, apprendimento e architettura del database.

Una cosa per me è essenziale: non trasformare PEE in un progetto di pulizia del codice. La manutenzione deve servire a costruire le capacità scientifiche per cui lo stiamo sviluppando.

Quindi sì, utilizziamo tutto ciò che il plugin ha trovato. La mia proposta è integrarlo nella prossima decisione complessiva, senza aprire un secondo sviluppo indipendente e senza perdere nessuno degli obiettivi che avevamo già concordato.
