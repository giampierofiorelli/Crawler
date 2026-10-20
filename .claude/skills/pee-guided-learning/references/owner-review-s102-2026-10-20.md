# Owner review of S102 (2026-10-20), verbatim

Received after the S102 report (`engine/product-evidence-engine-v5.67-phase243/docs/plans/s102-rule-lifecycle.md`).
Preserved unchanged. The owner asks that the RQ08 correction be part of the next consolidated step, before the next
experiment is authorised (no new work is authorised by this review itself).

---

S102: la mia valutazione

È un progresso ingegneristico reale, soprattutto perché Claude sta finalmente eliminando alcuni vincoli ereditati invece di conservarli indefinitamente. Ma ho individuato anche una debolezza nella nuova interpretazione delle richieste che merita attenzione.

Ho verificato i due rapporti pubblicati: audit architetturale S102⁠￼ e rapporto finale S102⁠￼.

Tre cambiamenti sono particolarmente validi.

Primo: le vecchie regole hanno finalmente un ciclo di vita. Possono essere attive, in revisione, sostituite o ritirate. Le regole ritirate non vengono più eseguite, ma rimane documentato perché esistevano e perché sono state disattivate. È proprio quello che avevi chiesto.

Secondo: PEE ora tiene conto delle versioni della conoscenza utilizzata per interpretare i documenti. Il codice prevede la rielaborazione quando cambiano definizioni, QuantityKnowledge o versione dell’interprete. Un test specifico verifica la sostituzione delle letture precedenti.

Terzo: la governance inizia a essere riutilizzata anche per la richiesta dell’utente. Non è ancora una gestione completa dell’intento, ma non abbiamo più due mondi totalmente separati.

Anche il recupero di 19 delle 20 attribuzioni perdute in S100 è interessante. Va però considerato un risultato di sviluppo su materiale già esaminato, non una generalizzazione indipendente.

Un problema logico che correggerei prima della prossima fase

Nel nuovo programma request-semantics.v1.json, Claude ha introdotto la regola RQ08: se due limiti relativi allo stesso criterio hanno numeri differenti, vengono considerati in conflitto.

Questo principio non è corretto in generale.

Immagina che un utente scriva:

«Voglio una friggitrice ad aria con almeno 4 litri di capacità, possibilmente almeno 6.»

Oppure:

«Mi serve una capacità di almeno 4 litri, anzi facciamo almeno 6.»

Non sono necessariamente richieste contraddittorie. Nel secondo caso il limite di 6 litri può semplicemente sostituire quello precedente. Nel primo, i 6 litri potrebbero essere una preferenza e i 4 un requisito indispensabile.

Richieste	Interpretazione appropriata
Almeno 4 L e almeno 6 L, entrambe obbligatorie per lo stesso oggetto	Vale il limite più restrittivo: 6 L
Almeno 4 L, preferibilmente 6 L	Requisito minimo e preferenza distinti
Almeno 6 L e al massimo 4 L, per la stessa proprietà e nelle stesse condizioni	Contraddizione
Almeno 4 L per un apparecchio e 6 L per un altro	Due requisiti distinti

Ho verificato che attualmente il codice confronta soprattutto identificatore del criterio e numero, non ancora tutte queste differenze semantiche.

Questo è proprio un esempio del rischio di cui parlavamo: una governance centralizzata può applicare in modo coerente una regola concettualmente sbagliata.

Non considero quindi ancora risolto il problema della comprensione dei vincoli dell’utente.

Un’altra precisazione sulla rilettura automatica

Anche qui il progresso è reale, ma bisogna definirlo correttamente.

Il codice ora riesegue la derivazione delle osservazioni quando una revisione viene nuovamente elaborata con una diversa versione dell’interprete o delle conoscenze.

Non ho però verificato un processo che scandisca autonomamente tutto il deposito e rielabori immediatamente ogni vecchio documento interessato da un cambiamento.

Il meccanismo di invalidazione e rielaborazione esiste. La copertura automatica dell’intero patrimonio deve essere verificata separatamente.

Come procederei dopo S102

La mia raccomandazione è di non ripartire ancora con una lunga serie di correzioni locali.

Prima della prossima verifica indipendente, farei consolidare la semantica generale dei vincoli: requisiti obbligatori, preferenze, intervalli compatibili, contraddizioni autentiche, oggetti diversi e condizioni diverse.

Poi passerei alla verifica su documenti nuovi delle capacità recuperate da S102, in particolare il collegamento fra frasi introduttive, intestazioni e valori delle tabelle.

E terrei aperto D31: le regole imperative, i vocabolari duplicati e i conflitti ancora presenti non devono essere dimenticati soltanto perché ora abbiamo un registro delle regole.

Il mio giudizio finale

Gestione delle vecchie regole

Progresso concreto

Governance della richiesta utente

Parziale

Recupero delle attribuzioni

Positivo in sviluppo

Generalizzazione indipendente

Da verificare

S102 è un avanzamento reale e conserva la direzione che abbiamo stabilito. Non è però ancora una dimostrazione che tutte le nuove decisioni siano scientificamente e logicamente corrette.

La scoperta sulla regola RQ08 è istruttiva: non basta centralizzare le regole, occorre verificare che i concetti su cui ragionano siano corretti e che il sistema distingua conflitti veri da differenze perfettamente compatibili.

Non invierei un secondo lungo prompt sovrapposto. S102 è terminato, quindi possiamo includere questa verifica precisa nel prossimo intervento consolidato, prima di autorizzare la successiva sperimentazione.

E terrei fermo il criterio più importante che abbiamo individuato insieme: ogni fase deve lasciare PEE non solo con più capacità, ma con meno incoerenze, meno logica duplicata e un ragionamento più generale e riutilizzabile, dalla prima richiesta dell’utente fino alla valutazione delle prove.
