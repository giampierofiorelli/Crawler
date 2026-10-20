# Owner review of the preliminary N0 design report (2026-10-20)

Received after Claude's in-session report on the preliminary N0 design. That report was read-only and, as the owner
asked, written in the session, not as a document. Its findings:

- **Observed path error.** On the frozen build 58676ef, probe sentences written for that check (not evaluation cases)
  showed that "I don't want a milk frother" and "it must not have a milk frother" yield the need `milk_drinks`.
  - Cause: the Phase248 rule "a negated wish still expresses a need" is right for an obstacle but is applied to a
    feature word that is an alias of an outcome concept.
  - The answer contract has no rejected-feature slot.
  - The error stays frozen, so that the pilot measures it.
- **Situation → outcome links.** The owner packages hold explicit situation → criterion → evidence tables that the
  store translation largely lost. The agent's estimate (one annotator, ±20%): about 31 justified links, about 9
  alternative or resource links, about 14 hypotheses, about 17 blocked by missing concepts, and 1 refuted.

Preserved verbatim (Italian).

---

Questo rapporto cambia significativamente la situazione. Claude ha finalmente individuato un errore operativo concreto nella comprensione dei bisogni, ne ha ricostruito la causa e ha trovato una possibile spiegazione del perché parte della conoscenza scientifica acquisita non riesca ad arrivare alle raccomandazioni.

La cosa positiva è che lo ha fatto senza alterare il pilota congelato.

1. La scoperta più importante: PEE confonde il contenuto con l'intenzione

L'esempio del montalatte è particolarmente significativo:

I don't want a milk frother.

PEE riconosce milk_drinks, cioè un bisogno che l'utente non ha espresso e che può addirittura essere contrario alle sue intenzioni.

La causa identificata da Claude è convincente: la negazione viene interpretata senza distinguere adeguatamente l'oggetto a cui si riferisce.

Questo significa che il futuro modello dei bisogni dovrà rispondere a due domande separate:

* Di che cosa sta parlando l'utente? Una funzione, un risultato, un problema, una caratteristica tecnica, un vincolo?
* Che cosa sta dicendo a proposito di quell'oggetto? Lo vuole, lo rifiuta, lo considera facoltativo, gli è indifferente?

La distinzione è generale. Vale per i montalatte, per il Wi-Fi di un elettrodomestico e per i segnali acustici di una lavatrice.

Non richiede una regola nuova per ogni prodotto.

2. Le cinque decisioni architetturali

Claude ha identificato cinque questioni che richiedono una decisione. Io le risolverei così, sul piano progettuale, senza autorizzarne ancora l'implementazione.

| Decisione | Mia raccomandazione |
|---|---|
| Requisito esplicitamente dichiarato | È sufficiente quando significato, ambito e forza sono inequivocabili. Non chiedere conferme inutili |
| «I don't want X» | Registrare il rifiuto esplicito, ma distinguere la preferenza negativa da un divieto categorico. Chiedere chiarimenti soltanto se la distinzione cambia la scelta |
| teaching_relevance | Sì, come relazione di pertinenza didattica, senza valore di prova causale o di prestazione |
| Riclassificazione di environment | Sì, preservando gli identificatori, la provenienza e la possibilità di ricostruire i dati precedenti |
| Negazione duplicata in Phase125 | Ritirare il lettore duplicato soltanto dopo aver dimostrato che quello condiviso ne conserva tutte le funzioni utili |

Una distinzione merita particolare attenzione: «I don't want a milk frother» non equivale necessariamente a «It must not have a milk frother».

Nel secondo caso l'esclusione è inequivocabile. Nel primo l'utente potrebbe accettare un prodotto che possiede comunque la funzione, purché soddisfi meglio gli altri bisogni. Non possiamo deciderlo arbitrariamente.

3. La scoperta sui pacchetti scientifici è ancora più interessante

Claude riferisce che le relazioni fra situazioni d'uso, criteri e verifiche sono spesso già presenti nei documenti scientifici originali, ma vengono perse durante la traduzione nella base di conoscenza.

Questo potrebbe spiegare perché PEE conosce i fenomeni tecnici ma fatica a utilizzarli per interpretare le richieste.

C'è una conseguenza architetturale fondamentale:

Dobbiamo verificare che l'apprendimento scientifico conservi non soltanto i fatti, ma anche le relazioni che spiegano quando quei fatti sono pertinenti.

Per esempio, una ricerca sui purificatori può insegnare che la rumorosità deve essere valutata insieme alla portata d'aria nelle effettive condizioni d'uso. Se il sistema conserva soltanto le misure e perde il collegamento con l'utilizzo notturno, ha acquisito un'informazione tecnica ma ha perso parte della conoscenza che ne permette l'applicazione.

Questo vale anche per le nuove categorie che PEE dovrà imparare autonomamente.

Il problema potrebbe quindi coinvolgere non soltanto la comprensione dei bisogni, ma anche il modo in cui i documenti scientifici vengono trasformati in conoscenza strutturata.

Un limite della stima di Claude

Le circa 31 relazioni considerate giustificate sono una stima di un singolo annotatore, con incertezza dichiarata. Non dimostrano ancora che un generatore automatico possa produrle correttamente.

Inoltre, eviterei di scartare indiscriminatamente ogni collegamento relativo alla salute: bloccherei le inferenze cliniche non validate, preservando la possibilità di acquisire conoscenze supportate da studi appropriati.

4. Una modifica che farei alla futura sequenza N0–N3

Non cambierei la roadmap ufficiale, ma distinguerei due verifiche all'interno del lavoro preparatorio:

Consolidamento semantico

Unificare le rappresentazioni esistenti, preservando significato, forza, provenienza e capacità dei moduli precedenti.

Conservazione delle relazioni scientifiche

Verificare quanta conoscenza relazionale si perde nel passaggio dai documenti alla base di conoscenza e come recuperarla senza inventare collegamenti.

Queste due attività sono connesse, ma hanno criteri di successo differenti.

La prima verifica che il software interpreti coerentemente ciò che comprende. La seconda che disponga davvero delle conoscenze necessarie per ragionare.

5. Cosa fare adesso con Claude

A questo punto non gli manderei nuove istruzioni.

Ha completato l'analisi preliminare, individuato un errore concreto e preparato una proposta di integrazione. La priorità deve restare il pilota R3-P, che fornirà il primo confronto indipendente.

Lascerei congelato anche l'errore sul montalatte, come Claude ha correttamente deciso. Correggerlo adesso modificherebbe ciò che l'esperimento deve misurare.

Quando riceveremo i risultati, non ci limiteremo a verificare se B è migliore di A. Dovremo capire se gli errori osservati possono essere spiegati da queste due carenze: rappresentazioni incompatibili e relazioni scientifiche perse durante l'acquisizione.

Se saranno confermate, avremo un obiettivo di sviluppo molto più concreto rispetto all'aggiunta di nuovi riconoscitori linguistici.

La direzione che emerge è promettente: PEE potrebbe migliorare sensibilmente recuperando, collegando e rendendo operativa conoscenza che ha già acquisito. Ma questa rimane un'ipotesi architetturale, da verificare con gli esperimenti successivi.

---

## Decisions recorded (row N0-design-review): design level, implementation not authorised

**Two separate questions.** A need model must answer two separate questions, by one general rule, never per product:
- the content kind of the object: function, outcome, problem, technical property or constraint;
- the stance towards it: wanted, rejected, optional or indifferent.

**The five decisions:**
1. **A stated requirement suffices** when its meaning, scope and force are unambiguous. No needless confirmation.
2. **"I don't want X"** records an explicit rejection, but distinguishes a negative preference from a categorical
   ban. Ask only if the distinction changes the choice. "I don't want X" is not "it must not have X".
3. **`teaching_relevance` is admitted** as a relation of didactic relevance, with no value as causal or performance
   evidence.
4. **The `environment` concepts are reclassified**, preserving identifiers and provenance, and keeping the earlier
   data reconstructible.
5. **The duplicate negation reader in Phase125** is retired only after the shared reader is shown to keep all of its
   useful functions.

**Health links.** Unvalidated clinical inferences are blocked. Health knowledge supported by appropriate studies stays
acquirable; health links are not discarded wholesale.

**Two verifications in the preparatory work.** The official roadmap is unchanged.
- **Semantic consolidation.** Software coherence: meaning, force, provenance and capabilities preserved.
- **Conservation of scientific relations.** How much relational knowledge is lost between document and store, and
  how to recover it without inventing links.

These have different success criteria.

**Pilot.** The milk-frother error stays frozen. The R3-P analysis must test whether the observed errors are explained
by two deficiencies:
- incompatible representations;
- scientific relations lost during acquisition.
