# Owner authorisation R3-P: Negation Foundation and Knowledge-Guided Needs Pilot (2026-10-20), verbatim

Received in the Claude Code session after the read-only dependency study
(`docs/plans/post-s103-need-pilot-dependencies.md`). Italian preface and English prompt, unchanged.

---

La ricognizione conferma la nostra intuizione: la conoscenza c’è, ma PEE non la sfrutta ancora abbastanza

Ho letto il documento pubblicato da Claude, .

Il risultato più importante non è che manchino altre regole. È che PEE possiede già conoscenze utili che non raggiungono la comprensione delle richieste.

Il caso del purificatore è particolarmente significativo:

* PEE conosce già il contesto bedroom / light sleeper, ma non lo collega al bisogno di dormire senza disturbi.
* Quando il bisogno viene espresso più esplicitamente, sa individuare una verifica scientifica sensata: rumore e capacità di filtrazione alla stessa velocità della ventola.
* Le 6.118 affermazioni scientifiche censite non alimentano ancora direttamente l’interpretazione delle richieste.

Questo sostiene la nostra ipotesi, ma non ne dimostra ancora la soluzione. Dobbiamo verificare che collegare la conoscenza già posseduta produca più comprensione corretta, senza inventare bisogni.

C’è però una priorità di sicurezza: Claude ha verificato che “nothing over N litres” può già produrre una lista positiva applicando il vincolo opposto. Quindi la negazione va affrontata prima di permettere alla conoscenza di dedurre nuovi requisiti.

Le cinque decisioni che prenderei

Questione	Decisione proposta
Ordine	Prima negazione e ambito delle frasi, poi pilota A/B/C, con risultati misurati separatamente
Roadmap	Aprire un pilota sperimentale R3-P, senza alterare R3-C né ridefinire l’R4 ufficiale
Categorie	Purificatori, caffè e lavastoviglie; lavatrici successivamente
Richieste di prova	Richieste reali da fonti utilizzabili legalmente, affiancate a richieste nuove costruite da agenti indipendenti
Versione C	Solo proposte di relazioni e regole in ombra; apprendimento completo rimandato a R5

Aggiungerei un requisito essenziale: A e B devono usare lo stesso codice e la stessa correzione della negazione. Altrimenti non sapremmo se un miglioramento dipende dalla conoscenza o semplicemente da un lettore linguistico migliorato.

E la versione C deve proporre collegamenti partendo dalla conoscenza, non ricevere da Claude nuovi sinonimi scritti appositamente per superare i test. Altrimenti non dimostreremmo alcun apprendimento.

Allegati necessari

Nessun nuovo allegato. Claude ha già il documento delle dipendenze, il rapporto S103, la memoria strategica privata e i pacchetti scientifici disponibili. Non dobbiamo ricostruirli né inviarli nuovamente.

La precedente autorizzazione alla sola lettura è stata rispettata. Il prompt seguente autorizza invece esplicitamente l’implementazione del solo esperimento controllato, senza attivare classifiche o nuove deduzioni non verificate nelle risposte operative.

Prompt consolidato per Claude

PEE — Owner authorisation: Negation Foundation and Knowledge-Guided Needs Pilot (R3-P)

The read-only dependency investigation is complete. This instruction authorises one consolidated, bounded experimental intervention. Preserve all previous owner decisions, architectural contracts, publication safeguards, evidence policies, and scientific-learning objectives.

Required attachments: NONE.

Use existing repository materials, without asking the owner to resend or reconstruct them:

* docs/plans/post-s103-need-pilot-dependencies.md
* docs/plans/s103-rule-admission.md
* The existing official roadmap and D31 register.
* The 2026-10-20 strategic brainstorming memo in the private pee-knowledge repository.
* The scientific packages and inventory already available in the private repository.

Paths above are relative to the existing engine directory where applicable. Verify the actual private file paths from the index rather than inventing filenames.

Owner decisions

1. Sequence: fix and independently evaluate negation, scope and contrast first; then conduct the knowledge-guided needs pilot. Separate the measurements.
2. Roadmap: establish an explicitly experimental R3-P work package. Keep R3-C’s existing restrictions intact and preserve the authoritative meaning of R4: within-document evidence linking. Do not silently renumber later R phases.
3. Categories: use air purifiers, coffee machines/grinders and dishwashers. Do not require the washing-machine package, which is not yet available. Preserve partial-coverage labels.
4. Evaluation: combine fresh independent-agent requests with genuine consumer-language requests from sources permitted under the existing Phase251 research and licensing policy. Respect access restrictions and privacy. Do not invent real-user evidence.
5. Arm C: implement only C-lite, generating knowledge-derived candidate relations/rules in experimental shadow mode. Full rule learning and promotion remain future R5 work.

Scientific objective

Test whether PEE becomes better at understanding human goals by using scientific knowledge it already possesses, without manually adding a category-specific rule or synonym for every request.

The pilot must distinguish:

* an expressed requirement;
* an inferred technical need;
* a preference;
* a product feature;
* a scientifically relevant outcome;
* an alternative scenario;
* an unknown or ambiguous intention.

A need inferred from knowledge must never become a hard product exclusion without an appropriate explicit user requirement.

Stage 1 — Shared negation foundation

Design one reusable, typed mechanism for clause boundaries, negation scope, polarity, contrast and the distinction between negating a proposition and negating a requirement.

Reuse it across request interpretation and document reading, with reader-specific adaptations only where justified.

Do not simply invert every numerical comparator on encountering a negative word.

Test distinctions such as:

* “nothing over 6 L” → maximum 6 L, inclusive;
* “more than 6 L” → strict minimum;
* “not less than 6 L” → inclusive minimum;
* “I don’t need more than 6 L” → do not assume a mandatory maximum solely from that phrase;
* “noise doesn’t bother me” → do not invent a quiet-operation requirement;
* “measured values, not manufacturer claims” → interpret attribution and contrast within their proper scope.

Cover negated source cues, methodological descriptions and table introductions, without inferring independent measurements merely because manufacturer claims were negated.

Create and seal new independent evaluation material before using it to tune implementation. Record original outcomes, harmful errors, omissions, and regressions against S103.

Preserve shared declarative vocabulary ownership and retire proven duplicate readers rather than introducing another parallel collection of negation regexes.

Stage 2 — Knowledge-guided needs pilot

Implement a controlled knowledge-path switch in the same executable build.

Use the already available scientific knowledge: contexts of use, property definitions, category relations, measurement methods, test conditions, limitations of proxy metrics and knowledge statements.

Connect a user context to a scientific objective through explicit, typed, attributable knowledge relations—not through a new category-specific alias hidden in TypeScript.

Keep unknown request content visible in the interpretation trace. Do not silently discard clauses such as “for my bedroom” or “I’m a light sleeper”.

Create distinct outputs for stated needs, defensible inferred needs, unsupported inferences, feature requests, scenarios and questions requiring clarification.

Keep feature-versus-performance distinctions intact. For example, sleep mode is not proof of quiet operation or adequate filtration.

Do not treat existing proposed_unverified or assistant_authored_unreviewed knowledge as independently validated scientific evidence.

Experimental arms

A — Control: current needs interpretation using the shared, corrected negation foundation, with the new knowledge augmentation disabled.

B — Knowledge-guided: identical build and parser, but with the new scientific-knowledge connections enabled. Record every inferred need’s provenance and reasoning path. New unverified inferences remain experimental rather than authoritative.

C-lite — Governed candidate learning: software proposes candidate links or rule changes from existing scientific knowledge and observed gaps. Use S103 experimental rule admission and shadow evaluation. Do not let candidates change user decisions, rankings or exclusions.

Do not substitute manually supplied answer-specific aliases for autonomous candidate generation. Record whether an improvement required an engineered new relation, an existing relation or an automatically generated candidate.

Stage 3 — Independent evaluation

Preregister the evaluation protocol before the first experiment on new material.

Use genuine consumer-language requests where legally available, supplemented with fresh agent-authored cases. Keep source provenance and distinguish independent material from development or synthetic material.

Blindly annotate references and preserve first-run results unchanged.

Evaluate separately:

* expressed needs correctly understood;
* scientifically justified inferred needs;
* missed and invented needs;
* negation, scope, correction, preference and alternative scenarios;
* feature-versus-outcome mistakes;
* appropriate clarification questions;
* effects on research and evidence plans;
* harmful applied constraints and improper product exclusions.

Report each category separately and include a held-out transfer test where feasible.

Keep the original S103 baseline separate from the A/B/C comparison so improvements from negation are not incorrectly credited to scientific knowledge.

A genuine improvement in coverage must not conceal worse precision or additional harmful errors. No production promotion when harmful errors or improper exclusions increase.

Clearly distinguish Claude-authored references, licensed real-consumer wording and independent human validation, if any.

Stage 4 — Governance, retention and scientific integrity

Maintain the existing admission and lifecycle mechanisms.

New scientific rules must identify their source, assumptions, limits, counterexamples and evidence. Structural admission alone is not a scientific review.

Unreviewed additions stay experimental. Do not promote automatically simply because a test passes.

Do not rewrite the historical 152 stale revisions as part of this pilot. Any later re-derivation must be prioritised, authorised, rights-compliant and separately measured.

Do not store prohibited source bodies or expose private product values through the public repository.

Preserve all ranking, publication and signed-evidence gates. No production ranking is authorised.

Stage 5 — Report and stop conditions

Produce one consolidated report that answers:

1. Did the shared negation mechanism remove the harmful inverse-constraint behaviour without introducing new harmful interpretations?
2. Does arm B outperform arm A specifically because of scientific knowledge?
3. Which useful knowledge existed but was inaccessible on the request path?
4. Can C-lite propose useful new relations without manually engineering an answer-specific rule?
5. Does anything learned transfer to another category?
6. Which remaining limitations are representational, linguistic, scientific, evidential or architectural?
7. Is any narrowly defined capability now sufficient for controlled use, or is further work required?

Maintain regression measurements, reproducibility, costs and a clear rollback path.

Stop or keep changes experimental if false exclusions increase, scientific attribution is weakened, evidence is insufficient, independent results regress or the implementation expands beyond the authorised scope.

Use existing modules and integration points. Avoid duplicate architectures and unnecessary paid services. Preserve iPhone-compatible reporting and avoid creating downloadable packages unless requested.

The success criterion is not more rules or more detected words. It is independently demonstrated improvement in understanding users’ goals through reusable scientific knowledge and governed reasoning.

Complete the authorised intervention autonomously within its declared scope, publishing implementation and validation separately and reporting remaining uncertainty without claiming R3, R4 or R5 complete.

Per me questo è il momento giusto per l’esperimento. S103 ci ha fornito una governance migliore; l’analisi successiva ha identificato con precisione dove la conoscenza non viene utilizzata.

Adesso possiamo verificare finalmente la nostra ipotesi centrale: PEE può migliorare non soltanto perché gli aggiungiamo regole, ma perché impara a utilizzare ciò che già conosce.

E se questo esperimento dovesse dare risultati convincenti, avremmo una base molto più solida per decidere quanto investire nei vettori, nell’apprendimento di regole e nelle fasi R successive.
