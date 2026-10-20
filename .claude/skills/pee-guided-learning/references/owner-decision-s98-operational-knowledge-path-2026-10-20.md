# Owner decision after S97: restore the operational scientific knowledge path (2026-10-20), verbatim

Received after S97 (Crawler 3c614af). Preserved unchanged. It authorises a bounded architectural integration phase (S98):
- one canonical operational scientific interpretation path for the observations of the existing extractors;
- persistence of the essential typed scientific attributes in the existing versioned store;
- unified condition semantics;
- qualitative and learned knowledge connected through the same architecture;
- operational validation;
- integration fitness tests against recurrence.

It keeps every safeguard: new paths stay gated until validated, the old readers remain the rollback baseline, and there is
no ranking or production recommendation. R3 stays open.

---

S97 cambia sostanzialmente la diagnosi di PEE. E, questa volta, credo che abbiamo identificato un problema architetturale concreto che può spiegare una parte significativa dei risultati deludenti delle ultime fasi.

Ho letto il rapporto S97 su GitHub⁠￼ e controllato i principali moduli coinvolti.

La scoperta è seria: da S88 a S96 sono state sviluppate e sperimentate capacità scientifiche che non sono entrate nei due percorsi operativi principali di PEE.

Questo spiega anche perché continuavamo a vedere migliaia di test superati senza ottenere miglioramenti nelle risposte agli utenti.

Il vero problema che abbiamo trovato

Ricerca e conoscenza scientifica

QK, definizioni, metodi, condizioni, qualità, relazioni

Lettori sperimentali S88–S96

Test e miglioramenti misurati, prevalentemente fuori dai percorsi operativi

Vecchi lettori operativi

Continuano ad alimentare il deposito e la consulenza

Integrazione scientifica mancante

Deposito → valutazione → risposta

Riceve soltanto una parte della conoscenza disponibile

Non è soltanto una questione di vettori. È il meccanismo attraverso cui PEE trasforma la conoscenza in capacità operative a essere incompleto.

Inoltre, S97 rivela un secondo problema: alcune regole precedenti, come quelle sull'oggetto di interesse, diventano restrizioni scorrette quando la conoscenza scientifica viene arricchita.

Questo è proprio l'effetto domino che avevi ipotizzato.

La decisione che prenderei

Claude chiede quale lettore scegliere.

Non sceglierei semplicemente il vecchio lettore oppure quello nuovo. Sarebbe una falsa alternativa.

Il codice mostra che fanno anche lavori diversi.

Il lettore Phase245 e quelli Phase225/265 individuano informazioni nelle pagine. Il definition_interpreter interpreta scientificamente osservazioni già individuate, ma non sostituisce da solo tutta l'estrazione HTML.

La soluzione che raccomando è:

Un unico percorso operativo di interpretazione scientifica, alimentato dai lettori di estrazione esistenti.

Questo significa preservare gli estrattori che funzionano, ma fare in modo che le loro osservazioni attraversino uno stesso livello scientifico, che utilizzi QK, definizioni, condizioni, metodi, relazioni e provenienza.

Il deposito deve poi conservarne gli attributi scientifici essenziali, anziché scartarli.

E questa integrazione deve essere validata prima di permetterle di influenzare decisioni operative.

Che cosa dovremmo far conservare al deposito?

Informazione	Scelta
Valore, unità, tipo di grandezza	Conservare
Metrica e definizione scientifica	Conservare con riferimenti versionati
Prodotto, modello e variante	Conservare l'identità e lo stato di verifica
Condizioni e metodo di prova	Conservare, distinguendo esplicite, inferite e sconosciute
Natura del risultato	Distinguere misurato, dichiarato, calcolato e irrisolto
Provenienza e indipendenza	Conservare separatamente, senza presumere verifiche
Qualità e giudizi degli esperti	Conservare come osservazioni tipizzate, con contesto
Stato della conoscenza	Candidata, verificata per uno scopo, incerta o esclusa

Questo non richiede necessariamente nuove tabelle per ogni categoria. Claude dovrebbe scegliere un'evoluzione compatibile dello schema esistente, rispettando i vincoli legali di conservazione.

Non conserverei testi integrali delle pagine, né promuoverei automaticamente nuove informazioni a prove sufficienti per una classifica.

Cosa direi ora a Claude

S97 è concluso e Claude chiede una decisione architetturale. Qui possiamo rispondergli senza sovrapporre istruzioni a un'esecuzione in corso.

Allegati necessari: nessuno. Il rapporto S97, il debito D30, i contratti architetturali e tutto il codice necessario sono già nei repository.

PEE — Owner decision after S97: Restore the operational scientific knowledge path

S97 confirms a structural problem that must now take priority over further algorithmic experiments.

I authorise a bounded architectural integration phase to restore the flow of scientific knowledge from existing readers through persistence and into the operational evidence path.

Architectural decision

Do not arbitrarily replace the Phase245/225/265 extractors with the definition interpreter. They perform different responsibilities.

Preserve the existing source-specific extraction capabilities, but establish one canonical operational scientific interpretation path for their extracted observations.

Use the existing definition interpreter, QuantityKnowledge, typed scientific entities, structural document evidence and qualitative readers as appropriate components of that shared path.

Avoid building another parallel reader, knowledge store or evaluation-only subsystem.

Required work

1. Trace and reconnect the complete operational flow. Establish how observations move from source extraction to scientific interpretation, evidence validation, persistence and the user-facing advice path. Identify and eliminate disconnected or duplicative transformations. Correct the first demonstrated loss points instead of adding category-specific workarounds.
2. Restore scientific interpretation. Integrate existing property definitions, quantity and metric typing, objects of interest, QK conditions, methods, relevant document relationships, result nature and provenance. Address the S89 object-guard and term-scoring conflicts at their architectural cause. Do not infer an unstated object or use a missing condition as evidence of equivalence.
3. Preserve structured scientific knowledge. Extend the existing versioned store, using compatible schema changes or existing journal mechanisms as technically appropriate. Persist the scientifically necessary typed attributes and their provenance, uncertainty, version and evidence status. Preserve existing rights and retention restrictions. Do not store page bodies or create a duplicate knowledge repository.
4. Unify condition semantics. Use QK condition axes as canonical scientific identifiers where supported. Map existing definition dimensions and other condition codes without discarding information. Keep unknown, missing, conflicting and explicitly stated conditions distinguishable.
5. Connect qualitative and learned knowledge. Reuse existing qualitative observations and knowledge statements through the same scientific evidence architecture, preserving their different semantics. Do not convert expert judgements into measurements or authorise their use in ranking without suitable evidence validation.
6. Validate operationally, not only in an evaluation harness. First use the already examined S89–S97 material to diagnose losses and regressions. Then conduct genuinely independent testing when permitted evidence is available. Trace selected observations end-to-end, including what is extracted, interpreted, stored, subsequently retrieved and used. Use controlled ablations to demonstrate which restored links produce real improvements.
7. Preserve safety and reversibility. Keep new paths gated until validated. Preserve old-reader behaviour as a rollback baseline, publication guards, exact product identity, provenance, independent-evidence requirements and the signed-ranking authorisation boundary. Do not enable production recommendations or ranking merely because more scientific fields are now stored.
8. Prevent recurrence. Update vertical-contract D30 and add integration fitness tests that fail when a scientific capability exists only in a shadow harness without explicit integration status, a named consumer and a validation requirement. Tests must verify semantic preservation across component boundaries, not merely module existence or successful compilation.

Validation and stopping conditions

Show the results separately for quantitative attribution, preservation of conditions and methods, comparability safety, correct product attribution, qualitative interpretation, knowledge reuse and the advice path.

A technically successful connection is not sufficient. Demonstrate an actual downstream effect where safe and measurable.

If an integration causes false attributions, unjustified comparability or loss of existing validated capabilities, keep it gated, document the causal blocker and do not promote it.

Bound the work to the existing architecture and necessary integration. Avoid unrelated research, new models, paid APIs, unnecessary live crawling and repeated parameter tuning.

If fresh independent evidence cannot be accessed under the existing policy, do not manufacture validation or describe spent-material checks as independent.

Strategic continuity

The broader R3 research into scientific entity representations, multi-view vectors, knowledge graphs and qualitative properties remains valid, but further algorithmic experimentation is secondary until the operational knowledge path is restored.

The objective is not to maximise test counts. It is to ensure that scientific knowledge acquired by PEE can genuinely improve subsequent research, reading, extraction, attribution, comparison and advice.

R3 remains open. Do not advance to R4 or claim general operational capability without appropriate evidence.

Proceed autonomously within these boundaries, using existing modules and repositories and preserving all previous scientific findings and architectural safeguards.

Un'ultima considerazione importante

Il controfattuale S97 che passa da 95 confronti dichiarati confrontabili a 29 confrontabili, 64 con condizioni non stabilite e 2 non confrontabili mostra un altro progresso fondamentale.

PEE deve diventare più intelligente non soltanto quando riconosce qualcosa, ma anche quando capisce che due risultati non possono ancora essere confrontati in modo affidabile.

Questa è una capacità scientifica reale. Non aumenta necessariamente il numero delle risposte, ma può aumentarne la correttezza.

C'è però un limite da rispettare: S97 ha verificato questi cambiamenti su materiale già esaminato. Il miglioramento della sicurezza dei confronti è plausibile e concretamente osservato, ma la generalizzazione resta da verificare.

La mia raccomandazione è di approvare questa integrazione come prossima priorità, prima di qualsiasi S98 dedicato a nuovi algoritmi.

È la prima volta che disponiamo di una diagnosi architetturale abbastanza specifica da poter agire su una causa concreta anziché continuare a inseguire gli stessi errori nelle fasi successive.

E soprattutto è perfettamente coerente con il tuo obiettivo originale: la scienza che insegniamo a PEE deve diventare una capacità permanente del prodotto, non rimanere il risultato di un esperimento.
