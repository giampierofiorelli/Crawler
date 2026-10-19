# Owner review of R3 cycle 2 and engineering research note (2026-10-19), verbatim

Received after §8 of `docs/plans/r3-knowledge-translation.md`. Decision S75 in `decisions-and-supersessions.md`. The
owner's Italian review and the English research note the owner wrote for Claude are preserved below. The cited
publications are methodological references (S64: research is reference, not a mandate), selected by the owner; Claude
did not fetch them at the time of recording.

---

Il secondo ciclo di R3 è utile, ma il risultato più importante non è il 90% di precisione: è che Claude sta individuando perché PEE non riesce ancora a utilizzare gran parte della conoscenza scientifica che acquisisce.

Ho verificato anche la sezione 8 del rapporto nel repository. La mia valutazione è positiva sulla direzione, con una precisazione importante.

Che cosa è migliorato

Indicatore	Prima	Dopo
Limiti correttamente associati	24	19
Associazioni sbagliate	149	2
Precisione delle associazioni	14%	90%
Conclusioni corrette aggiuntive	0	0

Il sistema è diventato molto più selettivo: evita 147 associazioni sbagliate, ma perde anche cinque associazioni corrette.

Quindi la precisione aumenta notevolmente, mentre la capacità di recuperare tutte le conoscenze applicabili non è ancora dimostrata. Inoltre il 90% deriva da appena 21 associazioni su dati già utilizzati per la correzione.

La scoperta più interessante

Claude ha individuato che circa l’85% delle affermazioni sui limiti ha un soggetto che PEE non riesce a tipizzare.

È importante perché significa che i documenti contengono conoscenze espresse attraverso concetti come caratteristiche, procedure, dichiarazioni commerciali e risultati sperimentali, mentre PEE riconosce soprattutto grandezze e misure.

Per esempio, comprendere il CADR non significa automaticamente comprendere l’affermazione:

Un elevato CADR per le particelle non dimostra un’efficace rimozione dei gas.

Per utilizzare quella conoscenza, PEE deve comprendere la relazione tra misura, fenomeno, limite sperimentale e risultato desiderato.

È precisamente il tipo di conoscenza scientifica strutturata che volevamo sviluppare in R3.

C’è però una distinzione: Claude ipotizza che il disallineamento linguistico sia anche la causa principale delle omissioni del 45%. È plausibile, ma non ancora dimostrato. Alcune omissioni riguardano procedure composte, conflitti, condizioni e meccanismi causali: potrebbero richiedere una rappresentazione più ricca, non soltanto un migliore riconoscimento dei concetti.

Un rischio da evitare

Non vorrei che Claude ottenesse maggiore copertura semplicemente ampliando le parole riconosciute.

Il risultato deve essere una capacità generale di comprendere che espressioni differenti possono descrivere lo stesso concetto scientifico, preservandone condizioni, relazioni, negazioni e limiti.

Questo principio è già presente nelle skill e nella roadmap. Non serve ripeterlo a Claude con un altro prompt.

La mia decisione

Lascerei Claude proseguire autonomamente esattamente nella direzione che ha scelto.

Non autorizzerei ancora nuove acquisizioni, modifiche ai ranking o promozioni delle conoscenze tradotte a evidenze certe.

Il prossimo risultato che mi interesserebbe vedere è un miglioramento simultaneo di tre aspetti: maggiore copertura delle conoscenze, fedeltà scientifica preservata e più interpretazioni corrette effettivamente utilizzabili.

Per ora abbiamo una capacità di annotazione dei limiti, non ancora una migliore capacità decisionale dimostrata.

R3 è sulla strada giusta, ma siamo ancora nella fase in cui PEE sta imparando a comprendere la conoscenza, prima di poterla sfruttare pienamente.

Non manderei nessuna nuova istruzione. Claude ha già una diagnosi ragionevole e un prossimo esperimento coerente con il nostro obiettivo.


Accedi ad Internet ogni volta che ti Serve

La ricerca sta confermando un punto importante: il problema non si risolve soltanto riconoscendo più sinonimi o aggiungendo vocaboli a QK.

Nella letteratura scientifica si distinguono almeno tre operazioni diverse: individuare a quale concetto si riferisce una frase (entity linking), ricostruire le relazioni fra i concetti anche attraverso più frasi (relation extraction e coreference) e verificare che l’affermazione strutturata conservi il significato dell’originale.

Una rassegna sul biomedical entity linking pubblicata nel Journal of Biomedical Informatics descrive proprio la separazione fra ricerca dei concetti candidati e verifica più rigorosa della loro identità. È pertinente al problema di PEE, ma il suo dominio di validazione è biomedico, non quello degli elettrodomestici.

Anche lo standard W3C SKOS distingue esplicitamente equivalenza esatta, somiglianza, relazione gerarchica e semplice associazione. Questo è importante perché due espressioni che condividono una parola non devono diventare automaticamente lo stesso concetto scientifico.

Sto quindi selezionando metodi che Claude possa adattare all’architettura esistente, senza imporre nuovi modelli, dipendenze costose o un altro motore parallelo.

Ho trovato una base di ricerca ingegneristica che vale la pena trasmettere a Claude. Alcuni studi sono particolarmente pertinenti al problema emerso nel secondo ciclo di R3 e aggiungono elementi utili rispetto alla ricerca che gli avevamo già consegnato.

La conclusione principale è questa: PEE deve imparare a collegare affermazioni scientifiche complete ai concetti che già conosce, non soltanto trovare la grandezza principale di una frase.

I risultati più interessanti della ricerca

1. Entity Linking e SKOS — identificare il concetto corretto

La ricerca sull’Entity Linking distingue la ricerca di possibili corrispondenze dalla verifica del loro significato. Lo standard SKOS aggiunge una distinzione essenziale: concetti equivalenti, simili, più generali o soltanto correlati non sono intercambiabili.

2. SciERC e SciER — leggere relazioni e contesto documentale

La ricerca scientifica sull’estrazione delle informazioni mostra perché individuare isolatamente il soggetto di una frase non basta. I riferimenti, le relazioni e i metodi possono essere distribuiti in parti diverse del documento. SciER (EMNLP 2024) include anche una valutazione fuori distribuzione.

3. MinIE, BioScope e Rosetta Statements — preservare il significato

MinIE tratta esplicitamente polarità, modalità, attribuzione e quantità. BioScope studia l’ambito di negazioni e incertezze. Rosetta Statements, in una pubblicazione del giugno 2026, propone rappresentazioni strutturate che mantengono un legame comprensibile con le affermazioni originali.

4. HANS e SciFact — verificare che la corrispondenza sia giustificata

HANS dimostra sperimentalmente quanto possano essere ingannevoli le corrispondenze linguistiche superficiali. SciFact separa le affermazioni dalle evidenze che le sostengono o confutano e dalle motivazioni del giudizio.

Perché questo riguarda direttamente PEE

Consideriamo tre frasi.

Affermazione nel documento	Cosa dovrebbe comprendere PEE
Particle CADR does not establish gas removal effectiveness.	Il limite riguarda l’uso del CADR per particelle come prova della rimozione dei gas, non qualunque misura CADR
High brightness content may increase OLED burn-in risk.	Il soggetto è un’esposizione a contenuti luminosi, non una misura della luminosità del televisore
Time to reach a specified food mass loss.	Si tratta del tempo necessario a raggiungere una particolare perdita di massa, non automaticamente del tempo di cottura

Il problema comune è la struttura semantica dell’affermazione: chi o che cosa viene descritto, quale relazione viene espressa, rispetto a quale fenomeno, con quali condizioni e con quale grado di certezza.

Il metodo attuale di Claude, basato sul soggetto grammaticale, è un miglioramento locale ragionevole. Ma gli studi suggeriscono di considerare anche i ruoli semantici, il contesto e il collegamento fra concetti, perché una parola può essere nominata senza essere il vero oggetto dell’affermazione.

Questo non significa che serva necessariamente un nuovo modello linguistico: i principi possono essere sperimentati nelle strutture già esistenti.

Ricerca da trasmettere a Claude

Ti preparo una sola nota in inglese, pronta da inoltrare. Non è un nuovo prompt di sviluppo né una prescrizione tecnica: è un insieme di risultati verificabili che Claude potrà utilizzare autonomamente.

Allegati necessari: nessuno. Tutti i riferimenti sono link diretti a pubblicazioni o standard; i documenti scientifici di PEE sono già nel suo ambiente.

PEE R3 — Engineering Research: Contextual Scientific Knowledge Alignment

Research reference for the current R3 work, not a new implementation specification.

The second R3 cycle exposed a general limitation: PEE can translate some scientific statements faithfully, yet struggles to connect them to the correct scientific concepts, observations, methods, product capabilities and consumer outcomes.

The subject-head correction reduced incorrect attachments substantially, but also removed valid ones. Most limitation statements still lack a recognized subject. This suggests a broader issue than vocabulary coverage alone.

The following published research may help guide your engineering decisions.

1. Entity linking: candidate discovery versus semantic identification

French & McInnes (2023), An overview of biomedical entity linking throughout the years.

https://pmc.ncbi.nlm.nih.gov/articles/PMC9845184/

The literature distinguishes generating possible concept matches from identifying the correct concept using context and semantic type.

For PEE, a mention of power, capacity, efficiency or time does not by itself identify the scientific measurement or conclusion being discussed.

W3C SKOS Reference

https://www.w3.org/TR/skos-reference/

SKOS distinguishes exact equivalence, close similarity, broader/narrower concepts and related concepts. These distinctions are useful for avoiding false equivalence between document terminology and taught concepts.

SKOS is a terminology and concept-organization reference, not itself a complete scientific inference system.

2. Scientific information extraction requires relationships and context

Luan et al. (2018), SciERC: Multi-Task Identification of Entities, Relations, and Coreference.

https://aclanthology.org/D18-1360/

Zhang et al. (2024), SciER: Entity and Relation Extraction in Scientific Documents.

https://aclanthology.org/2024.emnlp-main.726/

These studies address entity identification together with scientific relations and document context.

Relevant distinctions for PEE include:

* The entity mentioned in a sentence versus the subject of its scientific claim.
* A measured property versus the method used to measure it.
* A feature versus its demonstrated effectiveness.
* A commercial claim versus an independent observation.
* A relationship whose essential arguments appear in different sentences or sections.

Their findings motivate evaluating context-sensitive scientific interpretations rather than relying exclusively on isolated keywords or grammatical heads.

They do not establish performance on PEE’s product documents; applicability must be tested.

3. Preserve polarity, modality, scope and attribution

Gashteovski et al. (2017), MinIE: Minimizing Facts in Open Information Extraction.

https://aclanthology.org/D17-1278/

MinIE represents polarity, modality, attribution and quantities as explicit semantic annotations.

BioScope: negation, uncertainty and linguistic scope.

https://pmc.ncbi.nlm.nih.gov/articles/PMC2586758/

BioScope shows that detecting a negation word is different from identifying which assertion that negation modifies.

Vogt et al. (2026), Rosetta Statements: simplifying FAIR knowledge graph construction.

https://academic.oup.com/database/article/doi/10.1093/database/baag030/8699725

Rosetta Statements motivate representations that remain close to natural-language claims while retaining structured semantic roles and qualifications.

These studies are pertinent to PEE’s observed translation errors involving negations, unresolved referents, limitations, expert qualifications and applicability conditions.

4. Linguistic overlap is not scientific entailment

McCoy et al. (2019), Right for the Wrong Reasons — HANS.

https://aclanthology.org/P19-1334/

The study demonstrates that apparently successful language-inference models can rely on superficial word-overlap and syntactic heuristics that fail on carefully constructed counterexamples.

Wadden et al. (2020), Fact or Fiction: Verifying Scientific Claims — SciFact.

https://aclanthology.org/2020.emnlp-main.609/

SciFact distinguishes claims, supporting or refuting evidence, and the specific rationales for those judgments.

For PEE, concept similarity should not automatically authorise a statement as evidence for a product outcome.

5. Engineering implications worth investigating

The literature suggests several complementary research directions, not a mandatory architecture:

* Distinguish retrieving plausible conceptual matches from validating their meaning.
* Represent scientific claims through semantic roles, including subject, relationship, target, conditions, modality, negation and attribution.
* Distinguish exact identity from related, broader or narrower concepts.
* Preserve contextual information across sentences, tables and document sections.
* Verify that an acquired statement actually supports the intended interpretation rather than merely containing related terminology.
* Retain explicit unknown or unresolved states when the document does not justify an alignment.

A central question is whether these principles can be realised economically through PEE’s existing WD, QE, FC, QK, KR and private knowledge structures.

No new ontology framework, paid model, external API or parallel engine is implied.

6. How to judge progress

The current R3 findings suggest distinguishing at least three possible bottlenecks: source statements not extracted, statements extracted but not mapped to the correct concepts, and correctly mapped knowledge not consulted operationally.

These are different failures and may require different solutions.

Useful evidence would show not only fewer false attachments, but also recovery of valid knowledge, preservation of scientific meaning and improved downstream interpretation. Consider negative examples where documents share words but describe different concepts or experimental outcomes.

The existing blind inventory and past experiments provide diagnostic material, but data used for corrections must remain labelled as development or tuned evidence.

The research does not prove that any particular technique will improve PEE. It provides scientific and engineering principles for selecting, comparing and validating candidate approaches.

Continue R3 autonomously within the existing roadmap and skill. Choose the methods and experiments you judge most justified by the evidence. The intended result remains transferable operational knowledge acquisition, not another collection of category-specific lexical corrections.

La mia raccomandazione

Questa ricerca la passerei a Claude. A differenza delle precedenti correzioni puntuali, è un contributo metodologico che può essere utile oltre R3.

Il suo valore sta soprattutto nel distinguere tre problemi che oggi rischiano di essere confusi: conoscenza non estratta, conoscenza estratta ma collegata male, conoscenza corretta che il software non utilizza.

Non abbiamo ancora dimostrato che il 45% di omissioni e l’85% di soggetti non tipizzabili abbiano la stessa causa. La ricerca offre a Claude metodi per verificarlo, anziché presumerlo.

Gli invierei la nota una sola volta, senza aggiungere altre istruzioni. Poi lascerei a lui la scelta degli esperimenti e dell’implementazione. Questo rispetta esattamente l’autonomia ingegneristica che abbiamo deciso di dargli.
