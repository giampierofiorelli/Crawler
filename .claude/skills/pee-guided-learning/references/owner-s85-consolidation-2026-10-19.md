# Owner review of S84 and decision S85: cross-system consolidation, safety and shared quantity understanding (2026-10-19), verbatim

Received in session `session_01KSRrjegucVNMZGsTKfhd3B` after the S84 report. Decision S85 in
`decisions-and-supersessions.md`; work in `engine/product-evidence-engine-v5.67-phase243/docs/plans/s85-safety-and-quantities.md`.

---

S84 conferma che il censimento generale era necessario. E ha fatto emergere qualcosa di più importante delle duplicazioni: PEE possiede già molte delle capacità che ci servono, ma alcune non vengono utilizzate, altre interpretano diversamente le stesse informazioni e altre ancora lasciano passare conclusioni che dovrebbero essere valutate con maggiore rigore.

Ho letto il rapporto completo pubblicato su GitHub. La mia proposta è approvare il piano A–D, ma modificare leggermente l’ordine per affrontare prima i rischi di affidabilità e di acquisizione.

Che cosa abbiamo scoperto

Moduli totali

290

In src/

Eseguiti nel test del consiglio

16

Su 206 richieste, senza catalogo firmato

Fuori dai punti d’ingresso operativi

158

79 utilizzati per altri script di valutazione o riproduzione

Relazioni scientifiche

200

Ancora a livello di ipotesi o riferimento metodologico

Il numero dei moduli non è, di per sé, un problema: alcuni sono librerie, altri servono a verificare esperimenti precedenti. Ma il censimento individua opportunità concrete di consolidamento.

La scoperta che considero particolarmente significativa riguarda la comprensione delle richieste degli utenti: «quiet dishwasher» può perdere il requisito della silenziosità, mentre «most reliable dishwasher» viene classificata fuori ambito. Quindi dobbiamo migliorare anche quella parte, che ritenevamo già abbastanza solida.

Le mie decisioni sulle otto domande di Claude

Tema	Decisione consigliata
1. Sufficienza scientifica	Una valutazione dello stesso modello, da sola, non deve bastare a dimostrare una relazione per il ranking. Non imporrei necessariamente una revisione umana: servono prove originali, provenienza e verifiche adeguate.
2. Ordine A e B	Prima due controlli mirati contro la promozione delle dichiarazioni a prove. Poi A, l’unificazione delle quantità nelle richieste.
3. Vocabolario bidirezionale	Sì al principio C, riutilizzando il database esistente. Non autorizzerei ancora la conservazione indiscriminata dei testi degli utenti o la migrazione v11.
4. Ricerca di test	Sì alla pianificazione di ricerche di prove indipendenti; l’accesso effettivo deve sempre rispettare tutte le politiche applicabili.
5. Codice irraggiungibile	Sì alla rimozione progressiva, ma soltanto dopo controlli sulle dipendenze reali e sugli esperimenti riproducibili.
6. Modelli semantici	Conserviamo i risultati precedenti. H4 può essere riesaminato senza nuovi modelli, ma senza rallentare gli interventi prioritari.
7. Osservazioni qualitative	Conservarle se consentito dalle politiche di conservazione: sono preziose per PEE. Dobbiamo renderle operative, non cancellarle perché oggi non vengono lette.
8. Roadmap R4	Correggere l’intestazione mancante, senza modificarne il contenuto o l’ordine delle R.

Una priorità aggiuntiva: prima di qualsiasi nuova acquisizione dal vivo, bisogna assicurarsi che il controllo delle politiche sia realmente applicato. Non è un buon punto da rimandare dietro a una pulizia del codice.

E per A serve cautela: il sistema di conoscenza quantitativa non riconosce ancora alcune richieste che il lettore attuale interpreta correttamente. L’unificazione deve preservare queste capacità, non sostituirle alla cieca.

Il prompt che darei ora a Claude

Non gli chiederei di realizzare tutti e quattro gli interventi contemporaneamente. Il prossimo passo deve produrre una prima integrazione concreta e misurabile, risolvendo i rischi più urgenti e consolidando il riconoscimento quantitativo delle richieste.

PEE — S85: Cross-System Consolidation, Safety and Shared Quantity Understanding

Continue from S84 (docs/plans/s84-cross-system-audit.md) and S83. The owner accepts the cross-system architectural direction A–D, with the priorities and boundaries below.

Attachments: none. Use the existing repository, PEE skill, roadmap, S82–S84 reports, evaluation harnesses and knowledge mechanisms. Do not recreate existing files or launch parallel investigations of already established facts.

Permanent architectural principle

PEE must progressively share verified concepts, scientific knowledge, vocabulary and functional mechanisms across user-request understanding, research, acquisition, extraction, evidence assessment and advice.

Reuse must be bidirectional: existing knowledge should improve operational interpretation, while new observations may propose candidate knowledge for controlled verification and future reuse.

Share authoritative meaning where concepts overlap, but retain specialised algorithms where their responsibilities genuinely differ.

Prefer extending, connecting and simplifying existing mechanisms to adding new rules, adapters, vocabularies or architectural layers.

Preserve the R1–R7 roadmap. R3 remains open, and this cross-system consolidation must not be misrepresented as completing another R.

Step 1 — Address existing safety and evidence-role risks

Before wider reuse, implement the smallest defensible safeguards against:

* Manufacturer declarations entering measured comparative evidence without an appropriate evidence-role check.
* Manufacturer specification values being counted as independently measured results.
* Loss of source provenance or test-versus-declaration status across readers, storage and downstream consumers.

Reuse existing source-role and evidence-class mechanisms. Do not build a new classification system.

A professional expert’s structured qualitative evaluation remains eligible evidence under its correct evidential role; the goal is not to exclude qualitative expertise.

Preserve existing legitimate evidence and ranking restrictions. Add explicit negative and counterexample tests.

Sufficiency decision: a same-model assessment of the owner’s teaching package must not, by itself, constitute sufficient positive evidence to establish a scientific relation for public ranking.

Distinguish source independence from assessor independence. Do not introduce a blanket requirement for human approval of every relation. Original source evidence, adequate methods, reproducibility and evidential provenance matter.

Measure the existing ra.2 exposure and affected signed-catalog outcomes. Apply only justified restrict-only safeguards, with explicit traces and no newly authorised ranking. If policy interpretation remains unresolved, leave the proposed change in shadow and report the precise decision needed.

Step 2 — Acquisition safety checkpoint

S84 found that the live acquisition script does not enforce the complete owner policy file.

Do not initiate live acquisition or widen access.

Inspect the effective enforcement path and ensure subsequent live use cannot silently bypass applicable policy controls.

Keep fail-closed behaviour for unknown or prohibited access, applicable robots restrictions and source limitations. Do not merge a missing robots.txt, a temporary error and an explicit refusal into one status.

If this requires a larger redesign, record the smallest enforceable interim safeguard and defer the comprehensive acquisition consolidation to intervention D.

Step 3 — Implement intervention A on the request path

Unify the two quantity interpreters using existing quantity knowledge as the shared semantic mechanism.

Important: do not blindly replace Phase253 with the current quantity-knowledge parser. Their observed capabilities are complementary.

Preserve and, where needed, extend support for:

* Minimum, maximum and bounded ranges.
* Dimensions and physical-space constraints.
* Rates and time denominators, such as litres per day.
* Units including kg, inches, dB(A), bar and appropriate compound units.
* Distinction between product capacity, performance, energy, flow and other measurands.
* Negation, numeric bounds and uncertainty.

Use existing property-to-criterion mappings where appropriate, but avoid two competing quantity semantics.

Verify the six S84 counterexamples and the complete set of 206 spent request regressions.

Ensure a recognised quantity is not silently discarded simply because another component cannot map it to a known criterion. Unknown or unresolved requirements must remain visible and traceable.

As targeted request-boundary checks, also preserve:

* “quiet dishwasher” as an explicit acoustic requirement;
* “most reliable dishwasher” as a legitimate reliability objective, even if evidence remains insufficient;
* product features such as “steam wand” as features, preferences or explicit constraints when appropriate, not automatically scientific outcome needs.

Avoid a wholesale rewrite of need recognition in this step.

Step 4 — Demonstrate actual improvement

Measure at least:

* Previously correct interpretations preserved.
* Correct new interpretations recovered.
* Requirements still unresolved, with reasons.
* New false recognitions, incorrect bounds or unwanted product exclusions.
* Knowledge-on/off effects where meaningful.
* Effect of evidence-role guards.
* Net code, rules, vocabulary and duplication added or removed.
* Impact on the actual request-to-advice path.

Use the 206 spent requests as regression evidence, not independent validation.

Use genuinely unused, independently authored material if already available under the project’s rights and evaluation rules. Otherwise clearly report that independent validation remains outstanding.

Keep initial failures and all first runs unchanged.

No new authorisation of rankings, no hidden widening of eligible evidence and no silent changes in scientific conclusions.

Step 5 — Preserve the next interventions without implementing them

The S84 roadmap remains:

* B: further consolidation of concept kinds, source roles, sufficiency and explanation semantics.
* C: bidirectional candidate-knowledge intake through the existing private journal and store.
* D: unified acquisition controls, access-result feedback and knowledge-informed search planning.

For C, the owner approves the architectural direction but does not yet approve bulk retention of raw user requests or the schema-v11 migration. Design privacy-preserving, provenance-aware and reversible candidate handling before requesting implementation authority.

For D, planning searches for independent tests is permitted as a research objective; actual page access remains subject to enforceable policy, robots, rights and budget restrictions.

Preserve the nine qualitative observations if retention is lawful and determine their future consumers. Do not delete potentially useful qualitative knowledge simply because it is currently unused.

The 79 potentially removable modules should be retired incrementally only after dependency and replay checks, not as part of a mass deletion.

Retain S75–S77 semantic experiments as evidence. Do not download models or rerun them here. H4 may be analysed later from existing scores; DeBERTa or distributional reranking requires a separate bounded evaluation.

Restore the missing R4 heading without changing its requirements.

Stop condition

This is one bounded implementation, not the start of all four S84 projects.

Complete the targeted safety checks and the request-side quantity consolidation, run the relevant regressions, document actual architectural simplification and report unresolved validation requirements.

Do not autonomously proceed into full B, C or D after completing this intervention.

Provide a concise final report in English with commits, verified results, unchanged safeguards, unresolved risks and the next highest-value bounded integration.

The success criterion is not merely more passing tests: it is better operational use of knowledge already held by PEE, fewer conflicting interpretations, fewer unjustified conclusions and lower architectural duplication.

Dopo questo intervento

La sequenza che manterrei è:

S85 → integrazione dei concetti e dei vocabolari condivisi → apprendimento bidirezionale nel database → acquisizione e ricerca guidate dalla conoscenza → rivalutazione mirata dei modelli semantici.

Con una precisazione: la sicurezza dell’acquisizione viene affrontata già in S85, senza aspettare la futura riorganizzazione di D.

Non si tratta di un nuovo percorso che sostituisce le R, ma di un lavoro trasversale che ne rende i risultati riutilizzabili in tutto PEE.

La cosa più importante emersa da S84 è che il problema non è la mancanza di capacità: è che molte capacità esistenti non collaborano ancora abbastanza. Questo è il momento giusto per cambiare progressivamente tale situazione, senza sprecare il lavoro precedente.
