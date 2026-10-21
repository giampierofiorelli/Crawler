# Owner review of the first increment (2026-10-21)

Received after Crawler commit 00a7908 (report `docs/plans/first-increment-report.md`) and pee-knowledge commit a4218ea.
Preserved verbatim (Italian), followed by the decisions recorded. Implementation of the next phase is NOT authorised
by this review: it prepares the next single consolidated instruction.

---

Ho verificato il .

Il risultato è significativo: abbiamo individuato con precisione uno dei principali ostacoli che impediscono a PEE di trasformare la ricerca scientifica in conoscenza utilizzabile.

1. La scoperta fondamentale

Relazioni scientifiche contenute nei documenti già tradotti

2.481

Utilizzabili come relazioni tipizzate

151 (6,1%)

Conservate, ma non tipizzate

115 (4,6%)

Perse, alterate o non rappresentabili

2.215 (89,3%)

Altre 1.910 relazioni documentate appartengono a pacchetti non ancora tradotti. Il censimento riguarda le relazioni tra celle di tabelle, non tutta la conoscenza contenuta nei documenti.

Questo spiega perché PEE può avere acquisito migliaia di dichiarazioni scientifiche e continuare a non comprendere il collegamento tra una situazione descritta dall’utente e le caratteristiche che contano.

Un esempio: sapere che una macchina da caffè è larga 30 cm non equivale a sapere quando e perché l’ingombro diventa un criterio importante, quali spazi operativi servono e quali prove permettono di valutarlo.

La ricerca originale contiene spesso questi collegamenti. La rappresentazione attuale ne perde una parte consistente.

Un aspetto positivo è che Claude ha riprodotto esattamente le 6.118 dichiarazioni esistenti mediante il traduttore originale. Questo rafforza la diagnosi del processo di acquisizione; non dimostra ancora che un nuovo traduttore sappia recuperare correttamente le relazioni mancanti.

2. Cosa è stato effettivamente completato

Le verifiche riportate distinguono bene i risultati ottenuti dai problemi ancora aperti.

* R3-C: protezioni aggiunte e testate per le inferenze sperimentali, il contratto verticale e i prodotti trattenuti.
* A5: identificata una debolezza importante del journal, senza modifiche strutturali al database.
* N0: costruito un primo modello semantico condiviso, ancora isolato dalle decisioni operative.
* D1: misurata la perdita di relazioni scientifiche e individuati diversi meccanismi che la producono.

5.044 test superati; nessuna differenza nelle 206 risposte di regressione.

Sono verifiche positive dell’incremento, non una dimostrazione di affidabilità generale o di trasferimento scientifico a nuove categorie.

Il prossimo passo non dovrebbe essere un’altra lunga diagnosi generale. Abbiamo già individuato problemi abbastanza concreti da iniziare a sviluppare i meccanismi permanenti che li affrontano, con esperimenti controllati.

3. Le decisioni architetturali che servono adesso

Dal rapporto e dall’inventario N0 emergono tre questioni da risolvere prima del successivo intervento importante.

Questione	Decisione che raccomando
I-8: chi distingue funzione e risultato?	La richiesta dell’utente determina cosa vuole ottenere e con quale forza; la conoscenza scientifica revisionata determina come una funzione possa contribuire al risultato. Le due valutazioni non devono essere confuse.
N1: come conservare le relazioni?	Estendere in modo compatibile le rappresentazioni esistenti, con estremità tipizzate, condizioni, provenienza e stato di revisione. Nessun secondo database della conoscenza.
A5: journal o ricostruzione dagli input?	Garantire la ricostruzione completa tramite eventi o input immutabili e versionati. Le valutazioni indipendenti, le citazioni e le qualificazioni devono essere recuperabili senza perdita.

Una precisazione su I-8

Prendiamo una macchina da caffè.

Se l’utente chiede una macchina con lancia vapore, sta chiedendo la presenza di una funzione. PEE dovrebbe poterla verificare sul modello e sulla variante esatti.

Se chiede una macchina che produca un’ottima microschiuma, sta chiedendo un risultato. Non basta sapere che possiede una lancia vapore: servono prove pertinenti sulla qualità ottenuta.

Se dice che preferirebbe la lancia ma non è indispensabile, la sua assenza non dovrebbe automaticamente escludere il prodotto.

Questa distinzione dovrebbe diventare generale per qualunque categoria.

Una precisazione su N1

Non proporrei di rappresentare ogni riga scientifica come una singola affermazione rigida.

Una stessa situazione può essere collegata a diversi bisogni, criteri e metodi di prova. Serve preservare quelle connessioni, compresa la possibilità che un risultato dipenda da più condizioni o che una prova non sia sufficiente a dimostrarlo.

Il modello attuale phase247_category_relations.ts dispone già di relazioni tipizzate e regole di revisione. Conviene partire da lì, verificando gli adattamenti necessari, piuttosto che sviluppare una struttura concorrente.

E la distinzione tra conoscenza suggerita e conoscenza scientificamente verificata deve rimanere obbligatoria.

4. Quale sviluppo farei seguire

Prossima sequenza proposta

N1 — Progettazione e recupero controllato delle relazioni

Definire il modello persistente compatibile, quindi provare il recupero su documenti già censiti e verificare quanta informazione sopravvive.

C — Comprensione di oggetto, categoria e obiettivo

Sviluppare in ombra il riconoscimento dei ruoli degli oggetti. Collegare obiettivi a famiglie di soluzioni soltanto quando N1 fornisce conoscenze adeguate.

F e G — Lettura scientifica e valutazione

Far proseguire R4 e migliorare gli strumenti di valutazione indipendente, senza aspettare che N1 e C siano terminati.

N2–N3 e R5–R7

Selezione delle ipotesi, validazione, apprendimento governato e consulenza operativa dopo aver verificato le capacità necessarie.

Non autorizzerei subito la traduzione in massa delle 1.910 relazioni non ancora acquisite. Prima verificherei il nuovo meccanismo su materiale già disponibile, senza cambiare i riferimenti sperimentali congelati. Dopo una validazione soddisfacente, l’acquisizione dei pacchetti mancanti potrà essere eseguita in modo controllato, senza duplicati e con provenienza verificabile.

5. Un’ultima cautela

Il rapporto definisce alcune protezioni C2 permanenti. È positivo che siano state introdotte verifiche automatiche, ma una scansione statica dei consumatori non dimostra da sola che ogni possibile presentazione futura sia sicura. Il confine di pubblicazione dovrebbe essere protetto anche da un’interfaccia esplicita che esponga soltanto i campi autorizzati.

Analogamente, il modello N0 è stato testato, ma non ancora validato su richieste indipendenti. Otto incompatibilità rappresentate e testate in ombra non equivalgono a otto problemi risolti nel comportamento operativo.

Queste distinzioni devono rimanere visibili anche quando inizieremo a integrarli.

La mia conclusione

Il primo incremento ha raggiunto il suo obiettivo: non tanto migliorare già le raccomandazioni, quanto creare condizioni più affidabili per farlo.

Adesso eviterei sia un altro ciclo di sola diagnosi sia una grande ristrutturazione del repository.

La priorità è trasformare N1 e il riconoscimento generale degli obiettivi in capacità operative verificabili, conservando tutte le garanzie introdotte.

Le decisioni che raccomando su I-8, rappresentazione delle relazioni e ricostruibilità del database sono abbastanza precise da preparare il successivo incarico consolidato a Claude. Quel prompt dovrà includere fin dall’inizio tutte le dipendenze scientifiche e architetturali, i test indipendenti, i limiti di autonomia e le condizioni di arresto.

R4 potrà avanzare separatamente, mentre R5–R7 resteranno esplicitamente nella roadmap.

Soprattutto, la prossima fase dovrà dimostrare un miglioramento reale: che PEE, grazie alla conoscenza scientifica recuperata, riesce a comprendere richieste nuove che prima non comprendeva, senza inventare bisogni. Questo è il risultato da cercare, non semplicemente un database più ricco.

---

## Decisions recorded (row First-increment-review): design level; implementation awaits the next consolidated instruction

**Scope of the result.** The first increment's results are verifications of that increment. They do not demonstrate
general reliability or scientific transfer to new categories. The next phase must avoid both another round of pure
diagnosis and a large repository restructuring.

**I-8: who separates function from outcome.**
- The user's request decides what the user wants to obtain, and with what force.
- Reviewed scientific knowledge decides how a function can contribute to an outcome.
- The two judgements are never merged. The rule is general, for every category:
  - a requested function ("with a steam wand") is a presence requirement, verified on the exact model and variant;
  - a requested outcome ("excellent microfoam") needs relevant evidence of the quality achieved, and having the
    function is not enough;
  - a function preferred but not indispensable does not exclude a product that lacks it.

**N1: how relations are kept.**
- Extend the existing representations compatibly, starting from `phase247_category_relations.ts` (typed relations and
  review rules).
- Each relation carries typed ends, conditions, provenance and review status.
- No second knowledge database. A table row is not forced into one rigid statement: one situation may link to several
  needs, criteria and test methods, and a result may depend on several conditions, or a test may be insufficient to
  establish it.
- The split between suggested and scientifically verified knowledge stays mandatory.

**A5: journal or rederivation from inputs.**
- Full reconstruction must be guaranteed, through events or through immutable, versioned inputs.
- Independent assessments, citations and qualifications (guarantee G2) must be recoverable without loss.

**Proposed sequence.**
1. N1: design the compatible persistent model, then try recovery on documents already censused, and measure what
   survives.
2. C: object-role recognition in shadow; goals are linked to solution families only when N1 supplies adequate
   knowledge.
3. F and G: R4 continues separately, with better independent-evaluation tools, without waiting for N1 and C.
4. N2–N3 and R5–R7: after the needed capabilities are verified. R5–R7 stay explicitly in the roadmap.

**Not yet authorised:** bulk translation of the 1,910 relations in untranslated packages. The new mechanism is first
verified on material already available, without changing frozen experimental references. After satisfactory
validation, acquisition of the missing packages proceeds in a controlled way: no duplicates, verifiable provenance.

**Caution on C2.** A static scan of consumers does not by itself show that every future presentation is safe. The
publication boundary must also be protected by an explicit interface that exposes only authorised fields.
`withoutExperimental253` is a projection that removes listed fields; an allow-list interface is a separate,
still-open item.

**Caution on N0.** N0 is tested but not validated on independent requests. Eight incompatibilities represented and
tested in shadow are not eight problems solved in operational behaviour. These distinctions must stay visible when
integration starts.

**Goal of the next phase.** Show a real improvement: with the recovered scientific knowledge, PEE understands new
requests it did not understand before, without inventing needs. A richer database is not the goal. The next
consolidated instruction will state, from the start, the scientific and architectural dependencies, the independent
tests, the autonomy limits and the stop conditions.
