# Owner review of G1c and authorisation of G1d (2026-10-21) — verbatim

Recorded unchanged as received (Italian review, English brief). Decision rows: G1d-start in
`decisions-and-supersessions.md`; roadmap entry 2026-10-21 (G1d).

---

Il risultato di G1c è molto importante per PEE, anche se nessuno dei metodi ha superato le soglie di sviluppo.

Non considero questo un fallimento della vettorializzazione. Considero invece emersi due problemi distinti, di cui uno particolarmente serio: la qualità dei collegamenti scientifici.

La prova più significativa è che, su 70 collegamenti tra situazioni e strategie esaminati, 51 sono stati giudicati inappropriati. Questo significa che non possiamo ancora fidarci della conoscenza relazionale prodotta da G1b, anche se il sistema è tecnicamente in grado di consultarla in entrambe le direzioni.

Sul recupero semantico, invece, gli embeddings hanno migliorato la pertinenza dei risultati rispetto al metodo lessicale: precisione@5 di 0,17 contro 0,06. È un segnale positivo, ma significa anche che la grande maggioranza dei risultati recuperati resta irrilevante.

Il punto da approfondire adesso non è semplicemente come aumentare la similarità: dobbiamo impedire che somiglianze linguistiche, vettoriali o concettuali vengano scambiate per relazioni scientifiche valide.

Due aspetti che considero ancora più importanti

Ho verificato anche il codice di semantic_retrieval_g1c.ts e il rapporto completo.

1. Il metodo D non effettua ancora una vera verifica scientifica dei collegamenti. Controlla ruoli, negazioni, provenienza e concordanza tra recuperi. Sono controlli utili, ma non stabiliscono se una fonte scientifica sostenga effettivamente che una determinata strategia sia appropriata per quella situazione.

È quindi comprensibile che D riduca alcuni errori, senza risolvere il problema fondamentale.

2. Il confronto del recupero ibrido ha una limitazione tecnica. Il rapporto conferma che, nella misurazione dei primi cinque documenti recuperati, C mostra gli stessi vicini vettoriali di B, mentre la fusione viene utilizzata soltanto per costruire le proposte. Non possiamo quindi concludere che la ricerca ibrida sia stata valutata completamente anche sulla qualità del recupero.

Inoltre, la verifica dei 51 collegamenti errati è stata fatta da agenti Claude, non da esperti umani indipendenti. È una diagnosi seria che richiede controlli sulle fonti originali.

La decisione sulle controindicazioni

Qui prenderei una posizione coerente con le regole che abbiamo già definito per PEE.

Quando una fonte documenta che una soluzione non è idonea a soddisfare un requisito essenziale nelle condizioni effettive dell’utente, PEE non deve proporla come soluzione adatta.

Se invece la controindicazione dipende da una condizione modificabile, la soluzione può rimanere tra le alternative da investigare, senza essere presentata come già idonea. I limiti non essenziali vanno valutati, non trasformati automaticamente in esclusioni.

Questo evita sia esclusioni arbitrarie sia raccomandazioni scientificamente ingiustificate.

Il prossimo passo che consiglio

Non abbandonerei gli embeddings e non proverei immediatamente un terzo modello. Utilizzerei prima il modello già installato, correggendo il modo in cui la conoscenza scientifica viene collegata e verificata.

Proporrei G1d: integrità delle relazioni scientifiche e recupero semantico verificato.

Claude ha completato G1c e non ha avviato altri lavori, quindi possiamo formulare un unico incarico completo, senza interrompere un’esecuzione.

Allegati necessari: nessuno. Tutto il materiale è già nei repository. Non bisogna ricreare pacchetti o archivi.

PEE — G1d: Scientific Relation Integrity and Verified Semantic Retrieval

Authorise G1d, building directly on G1c and its completed report docs/plans/g1c-report.md.

Use pee-guided-learning, the established scientific research, existing category packages, evaluation history and architectural decisions.

Permanent objective: PEE must maintain interconnected scientific knowledge accessible by both consumer need and product category. Semantic embeddings help retrieve potentially relevant knowledge; typed scientific relationships, conditions and evidence determine what can legitimately be inferred.

1. Repair scientific relationships before trusting them

Investigate the G1c audit finding that 51 of 70 sampled situation-to-strategy links were inappropriate.

Do not merely change similarity thresholds or add aliases.

Trace sampled links back to their original source passages or structured records. Distinguish:

* a situation mentioned alongside a strategy;
* a genuinely supported applicability relationship;
* a conditional or contraindicated strategy;
* association, mechanism, causation and demonstrated effectiveness;
* missing or incorrectly extracted relationships.

Develop a general, reviewable method for deriving scientifically justified links, preserving provenance, conditions, counterevidence and epistemic status.

Do not automatically promote the 167 existing links or the 70 Claude-authored situation types.

2. Preserve and evaluate semantic retrieval

Reuse the local BGE embedding model and existing index. Do not introduce another model or service unless a controlled experiment demonstrates a specific unmet requirement.

Separate three stages:

1. Retrieval of potentially relevant knowledge.
2. Verification of the scientific relationships and applicability conditions.
3. Selection of justified strategies, categories or abstention.

Investigate why similar situations from different categories generate invented proposals.

Measure the actual hybrid retrieval ranking separately from the vector-only result; G1c’s level-1 evaluation did not expose C’s fused ranking.

Consider source-grounded semantic verification and competing hypotheses, without assuming that similarity or agreement between retrievers establishes scientific truth.

Keep generic needs independent of categories while preserving category-specific methods, measurements and qualifications.

3. Contraindications and questions

Apply this owner decision:

A documented incompatibility with an essential requirement under the user’s actual conditions prevents presenting that solution as suitable. A solution dependent on a modifiable, unverified condition may be retained as a conditional possibility, never as an already suitable recommendation. Nonessential disadvantages must be assessed rather than automatically vetoed.

A question to the user is justified only when a user-specific fact is needed to distinguish viable strategies. Missing knowledge, unsupported relations or algorithmic failures must instead trigger research planning, diagnostics or honest abstention.

Do not use questions to conceal engineering deficiencies.

4. Controlled experiments and scientific validation

Preregister the evaluation and use spent material for development.

Construct a small, source-grounded reference set with independently checked applicability relationships, including positive, negative, conditional and cross-category examples.

Compare existing G1c methods against the improved scientific verification, holding the knowledge and candidate budgets constant where appropriate.

Measure separately:

* retrieval precision and recall;
* scientific relationship correctness;
* correct needs and strategies reached;
* invented hypotheses and contraindication failures;
* justified abstention;
* performance in both need-first and category-first directions.

Use blind reviews where useful, but distinguish Claude-agent agreement from independent expert validation.

Only use the still-sealed G1 and G1b sets after development gates are satisfied. Preserve their first-run integrity.

5. Operational and repository integrity

Investigate the remaining silent losses of explicit limits, including longer real-world requests. Do not use short-request-only performance as proof of general coverage.

Ensure the corrected vertical-contract.json statuses are protected by appropriate regression/invariant tests so the G1b corruption cannot recur unnoticed.

Reuse the existing store, journal, provenance and permissions. No live-store migration, ranking promotion, autonomous scientific web browsing, paid services or new categories are authorised.

Keep semantic retrieval and scientific learning experimental until independently validated.

6. Autonomy and stopping conditions

Proceed autonomously with bounded experiments and general, reusable corrections. Avoid additional category-specific patches and repeated tuning on spent material.

If the scientific relationships cannot be validated adequately, stop their promotion rather than compensating with more heuristics.

Report what is implemented, what source examination genuinely supports, which improvements are demonstrated, and which require independent verification.

Success is not retrieving more similar text. Success is enabling PEE to find, correctly interpret and reuse scientifically justified knowledge across needs and categories, without introducing unsupported strategies or compromising existing safeguards.

Questo indirizzo mantiene il lavoro fatto su vettori, conoscenza bidirezionale e modelli scientifici, ma sposta l’attenzione su ciò che oggi impedisce il loro utilizzo affidabile.

La priorità non è trovare sempre più conoscenza. È fare in modo che PEE sappia distinguere la conoscenza pertinente da quella soltanto somigliante, e soprattutto quella scientificamente giustificata da quella che non lo è.

Solo quando queste capacità funzioneranno insieme avrà senso collegarle stabilmente al percorso che risponde all’utente.
