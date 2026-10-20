# Owner review of the N0 read-only inventory (2026-10-20)

Received after commit 6984773 (`docs/plans/needs-model-inventory-n0.md`). Preserved verbatim (Italian), followed by notes.

---

Questo inventario è particolarmente importante. Ho letto il documento e credo che Claude abbia individuato un problema più profondo della semplice difficoltà a riconoscere i bisogni.

PEE possiede rappresentazioni differenti dello stesso concetto, sviluppate in fasi diverse, che non sempre condividono lo stesso significato.

Le 15 incompatibilità documentate non sono tutte errori operativi dimostrati, ma alcune hanno conseguenze potenzialmente serie.

1. La distinzione che PEE deve imparare

Consideriamo queste quattro frasi:

| Richiesta | Significato |
|---|---|
| I don't need a mop | La funzione lavaggio non è necessaria |
| I don't want a mop | La funzione lavaggio è indesiderata; occorre determinarne la forza |
| I must not have a mop | Esclusione esplicita della funzione |
| I don't mind having a mop | La presenza della funzione è indifferente |

Sono situazioni differenti e possono portare a valutazioni differenti dei prodotti.

Il problema è che diversi moduli di PEE classificano alcune di queste formulazioni in modo incompatibile.

C'è però una precisazione importante rispetto al resoconto sintetico di Claude: Phase125 viene effettivamente eseguito nel percorso corrente, ma riceve una lista vuota di aspetti. Quindi il suo comportamento errato su «I don't need a mop», verificato in un test diretto, non significa automaticamente che stia imponendo quella funzione nelle raccomandazioni attuali. Sul percorso operativo interviene soprattutto nella lettura del budget e nella segnalazione di alcuni rischi di interpretazione.

Questa distinzione è essenziale per non attribuire al sistema errori che non abbiamo ancora osservato.

2. L'incompatibilità più pericolosa potrebbe essere un'altra

Nel contratto operativo manca una rappresentazione esplicita per una funzione che l'utente non vuole.

Questo significa che PEE può possedere conoscenze utili per valutare una funzione, ma non riuscire a rappresentare completamente il rifiuto di quella funzione.

Inoltre, alcune parti del sistema confondono:

* La presenza di una caratteristica.
* La richiesta esplicita di possederla.
* La preferenza per quella caratteristica.
* Un requisito obbligatorio.

Questo è strettamente collegato alla nostra ricerca scientifica: una caratteristica tecnica non costituisce automaticamente un bisogno, e un bisogno non è automaticamente un requisito rigido.

3. C'è anche un problema nelle domande

L'inventario conferma che alcuni moduli precedenti possiedono già meccanismi per formulare domande soltanto quando possono modificare una decisione.

Il percorso attuale, invece, utilizza prevalentemente semplici stringhe di testo.

Perdiamo così informazioni come il bisogno a cui si riferisce la domanda, quale incertezza risolve e perché una risposta potrebbe cambiare la raccomandazione.

Questo suggerisce che una futura integrazione dovrebbe recuperare le capacità esistenti, ma senza aggirare le verifiche rigorose dei moduli Phase126 e Phase127.

4. Cosa cambierei nella nostra strategia

La ricerca precedente proponeva N0 come consolidamento generale dei modelli sui bisogni.

Adesso abbiamo elementi per renderlo molto più preciso.

Non autorizzerei una semplice unificazione dei tipi e dei nomi. Prima bisognerà distinguere:

Incompatibilità semantiche, che richiedono una decisione su quale interpretazione sia corretta; duplicazioni effettive, che possono essere eliminate dopo test di equivalenza; e capacità mancanti, come la rappresentazione delle caratteristiche rifiutate.

Un altro dettaglio dell'inventario merita attenzione: il modello Phase116 non rappresenta tutte le relazioni attualmente utilizzate da PEE, in particolare not_sufficient_for e requires_condition. Sceglierlo come modello unico senza adattamenti rischierebbe di far perdere conoscenza scientifica già disponibile.

Questo sarebbe contrario al nostro obiettivo di accumulare competenza riutilizzabile.

5. La mia valutazione sul lavoro di Claude

Finora la sequenza è corretta:

Ricerca scientifica completata. Ha identificato principi ingegneristici applicabili, senza rivendicare capacità non dimostrate.

Inventario N0 completato in sola lettura. Ha individuato incompatibilità concrete, con riferimenti al codice.

Diagnosi preregistrata. Le quattro famiglie di cause sono definite prima dei risultati del pilota.

Validazione del pilota ancora incompleta. Resta da stabilire quali incompatibilità abbiano effetti misurabili sulla comprensione delle richieste reali.

Le quattro cause non devono necessariamente essere esclusive: una singola richiesta può fallire sia perché una relazione scientifica non viene trovata, sia perché un modulo esistente non è integrato. Sarà importante che la diagnosi conservi questa possibilità.

Non aggiungerei ulteriori istruzioni a Claude adesso. Ha già completato il lavoro preparatorio disponibile e ha predisposto l'esperimento.

La decisione che suggerisco per la fase successiva è questa: una volta ottenuti i risultati, N0 dovrà consolidare un modello semantico comune senza perdere informazioni, capacità scientifiche o distinzioni importanti già presenti nei moduli precedenti.

Questo inventario ci offre finalmente una base concreta per farlo. Non siamo più costretti a progettare il consolidamento soltanto sulla base di ipotesi.

---

## Notes (Claude)

- **Correction to Claude's own chat summary.** That summary said Phase125 "is on the request path and treats any positive mention as required". The inventory itself was precise: on the path Phase125 receives an empty aspect list, so only its budget reading and hazard flags reach the answer. The behaviour on "I don't need a mop" was observed in a direct call. It is **not an observed error of current recommendations**.
- **Action taken before any run.** The preregistered diagnosis (`evaluation/r3p/needs-failure-causes.json`) was amended to be multi-label. Every cause that holds is recorded with its evidence, and counts are reported both per cause (non-exclusive) and for the first cause in the test order. This was done before the needs material was sealed and before any stage-2 first run.
- **Decision recorded** (row N0-review):
  - N0, when authorised after the R3-P results, consolidates one common semantic model without losing information, scientific capability or distinctions of earlier modules.
  - No plain unification of types and names. Each item is first classified as one of:
    - a semantic incompatibility, which needs a decision on the correct reading;
    - an actual duplication, removable after equivalence tests;
    - a missing capability, such as rejected features.
  - Phase116 is not adopted as the single model without adaptation, because it lacks `not_sufficient_for` and `requires_condition`.
  - Question integration recovers the existing decision-relevant capability without bypassing the Phase126/127 checks.
  - The four stances to distinguish:
    - not needed;
    - unwanted, with strength to be determined;
    - explicitly excluded;
    - indifferent.
- No further instructions; the R3-P collection resumes as scheduled.
