# Owner review of S99 and instruction for the next R3 step: rule governance and operational semantic correction (2026-10-20)

Preserved verbatim as received (Italian review and English instruction). The owner attached two screenshots of Claude's
S99 progress messages: (1) "The document_evidence check incorrectly applies "publisher measured" as a page-level default
even without a test cue in the value's own block (audit S77), so I'll restrict it to only count as a result when the
value's block itself carries a test cue—otherwise leaving role and nature unresolved." (2) "The quietness-standard
sentence no longer matched, because the bare word "standard" was dropped. It goes back as a head noun: the "mode" guard
already stops "standard mode"."

Claude's note on the review (2026-10-20, S100): the review's specific claim about `scientific_evidence98.ts` (a Set read
with `length` and `every`) does not hold on execution: `cb` is an array and `ca` a Set; a cross-source pair with the same
stated method returns `comparable`. The underlying point holds: no test covered that positive case; S100 adds it.

---

Sì. E questa volta credo che tu stia individuando un problema ancora più fondamentale dell’architettura di PEE: manca una gestione sistematica delle regole, delle loro priorità, delle eccezioni e dei conflitti.

Le due schermate sono particolarmente significative perché mostrano Claude che corregge il comportamento di una regola intervenendo su parole e condizioni specifiche. Ma la domanda che dovrebbe porsi è precedente:

Quale principio generale stabilisce quando una regola è applicabile, quando prevale su un’altra e quando nessuna delle due dispone di prove sufficienti?

Hai ragione anche su un altro punto: esistono discipline ingegneristiche consolidate dedicate esattamente a questo problema.

1. Le tecnologie e i principi che ci servono esistono già

Disciplina	Che cosa risolve	Rilevanza per PEE
Decision Model and Notation (DMN)	Regole sovrapposte, priorità, risultati contraddittori	Stabilire quando due regole possono applicarsi allo stesso valore
Defeasible Logic	Regole generali con eccezioni motivate	Gestire evidenze che possono correggere una conclusione precedente
Rule Conflict Analysis	Regole duplicate, incompatibili o che ne nascondono altre	Individuare difetti prima che appaiano su nuove pagine
Formal verification e property-based testing	Proprietà che devono valere per intere classi di casi	Verificare principi generali, non soltanto singole frasi
SHACL / vincoli semantici	Coerenza delle informazioni strutturate	Impedire che un risultato scientifico abbia relazioni incompatibili

Non sono tecniche inventate per PEE.

Lo standard OMG DMN⁠￼ definisce esplicitamente diverse politiche per decidere cosa fare quando più regole coincidono.

La Defeasible Logic⁠￼ studia proprio il ragionamento con regole ed eccezioni ordinate per priorità.

Esistono persino strumenti come dmn-check⁠￼ capaci di rilevare automaticamente regole duplicate, contraddittorie o rese irraggiungibili da altre regole.

2. Vediamo i tuoi due esempi

Esempio A: la parola “standard”

Claude osserva che eliminare la parola standard impedisce di riconoscere una norma; poi la reintroduce, aggiungendo una protezione per standard mode.

Ma questo ragionamento rimane locale.

Considera:

Enunciato	Interpretazione
“The standard requires 44 dB”	Riferimento normativo
“The appliance has a standard mode”	Funzione del prodotto
“The standard mode produces 44 dB”	Possibile risultato o specifica, natura da verificare
“The appliance exceeds the 44 dB standard”	Confronto rispetto a un riferimento
“The manufacturer claims 44 dB”	Dichiarazione del produttore

La parola è la stessa. Ciò che cambia è il ruolo che svolge nell’affermazione.

Non dovremmo continuare ad aggiungere eccezioni per ogni parola che accompagna standard.

Dovremmo identificare la relazione semantica fra il termine, l’oggetto, il numero, la fonte e l’azione descritta.

Esempio B: “publisher measured”

Claude nota che una regola generale considera misurati i valori di una pagina di test anche quando manca una prova locale.

Corregge chiedendo un’indicazione di test nello stesso blocco.

Ma anche questo può introdurre un problema.

Immagina una tabella:

Our laboratory measurements

Setting	Noise
Low	38 dB
Medium	44 dB
High	52 dB

Le singole righe non contengono necessariamente espressioni come we measured.

Eppure possono essere risultati misurati, perché l’intestazione della tabella ne stabilisce la natura.

Quindi non possiamo semplicemente decidere che l’evidenza locale prevalga sempre su quella generale.

Dobbiamo comprendere l’ambito di validità dell’informazione: una prova documentale può applicarsi a un’intera tabella, a una sezione o a una singola osservazione.

Questo è il cuore del problema.

3. La regola più specifica deve vincere su quella generale?

Spesso sì, ma soltanto quando la sua priorità è giustificata.

Non basta che una regola sia linguisticamente più specifica.

Proporrei di distinguere almeno questi livelli:

Vincoli scientifici e di sicurezza

Un’affermazione senza prove sufficienti non può diventare una misurazione verificata. Un soggetto incerto non può diventare automaticamente un prodotto identificato.

Evidenza esplicita e pertinente

Dichiarazioni relative a una precisa osservazione, tabella, metodo o protocollo.

Contesto ereditato, quando applicabile

Intestazioni, sezioni e informazioni documentali con un ambito verificabile.

Ipotesi e valori predefiniti

Non possono sostituire prove mancanti né promuovere un’incertezza a fatto verificato.

Questa è una proposta di organizzazione logica, non una gerarchia da applicare indiscriminatamente.

Per esempio, un’esplicita intestazione Manufacturer specifications può attribuire correttamente la natura dichiarata ai valori sottostanti, anche quando una singola cella non ripete quelle parole.

Ma se la cella contiene un’osservazione indipendente chiaramente distinta, il sistema deve riconoscere quel cambiamento di ambito.

Quando due evidenze di pari autorità sono incompatibili, PEE dovrebbe registrare il conflitto e astenersi, non far prevalere semplicemente la regola eseguita per ultima.

4. Che cosa manca concretamente nell’ingegneria di PEE

Secondo me manca un processo permanente di Rule Governance, cioè governo delle regole.

Prima di sviluppare altre eccezioni, Claude dovrebbe esaminare tutte le regole che partecipano all’interpretazione scientifica, anche se oggi sono sparse fra funzioni TypeScript, JSON, estrattori, QuantityKnowledge e interpreti.

Per ciascuna dovrebbe essere possibile stabilire:

* Responsabilità: che cosa può e non può decidere.
* Ambito: osservazione, frase, tabella, sezione, documento oppure categoria.
* Presupposti: quali evidenze devono esistere prima che la regola sia applicabile.
* Conflitti e precedenza: che cosa succede quando altre regole producono risultati incompatibili.
* Verifica: quali invarianti devono rimanere veri su tutti i casi pertinenti, comprese nuove categorie.

Questo catalogo potrebbe permettere controlli automatici prima di ogni modifica.

Per esempio, se Claude introduce una regola nuova per interpretare standard, il sistema dovrebbe segnalare che esistono già regole relative a modalità operative, norme, specifiche e valori di riferimento potenzialmente sovrapposte.

E dovrebbe verificare che la modifica non contraddica quelle preesistenti.

Una proprietà fondamentale da verificare

Aggiungere un’informazione non pertinente non deve cambiare l’interpretazione di un’osservazione.

Se aggiungo un paragrafo sulle caratteristiche del prodotto in un’altra sezione, la natura di una misurazione già identificata non dovrebbe cambiare.

Se aggiungo invece un’informazione pertinente e contraddittoria, PEE deve rivalutare la conclusione e, quando necessario, dichiarare il conflitto.

Sono esempi di test metamorfici: verificano proprietà del comportamento su molte trasformazioni dell’input, anziché una singola risposta attesa.

5. Dobbiamo introdurre un nuovo motore di regole?

Non necessariamente. E anzi eviterei di farlo subito.

PEE dispone già di un modulo knowledge_rules.ts con regole dichiarative e di altri meccanismi di validazione.

Prima di installare Drools, introdurre un nuovo framework DMN o aggiungere un altro sottosistema, vorrei capire quanto possiamo riutilizzare di ciò che esiste.

Il punto non è adottare cinque nuove tecnologie, ma applicare i loro principi ingegneristici a un meccanismo generale, con una sola responsabilità ben definita.

E qui la ricerca scientifica può aiutarci anche nell’architettura: lo studio Semantic DMN⁠￼ tratta proprio l’integrazione tra decisioni formali e conoscenza strutturata del dominio.

La mia conclusione

Penso che tu abbia ragione a insistere su questo punto, e avremmo dovuto affrontarlo sistematicamente prima.

Finora abbiamo concentrato molta attenzione su come PEE acquisisce e rappresenta la conoscenza scientifica, ma meno su un’altra capacità indispensabile:

Come garantire che centinaia di regole continuino a ragionare coerentemente quando la conoscenza cresce, si arricchisce e introduce nuove eccezioni?

Non basta che ogni regola sia corretta isolatamente. Deve essere coerente con le altre.

E soprattutto, una nuova informazione scientifica non dovrebbe rendere automaticamente sbagliata una parte del sistema che prima funzionava.

Quindi non proporrei di aggiungere semplicemente una nuova protezione per standard o un’ulteriore condizione per publisher measured.

Vorrei un audit generale dei conflitti, delle precedenze, degli ambiti e delle dipendenze fra le regole esistenti, seguito da un meccanismo permanente che impedisca il ripetersi dello stesso problema.

Dato che Claude sta già procedendo con le correzioni, non gli manderei adesso un altro prompt sovrapposto. Ma questo dovrebbe diventare un requisito architetturale esplicito del prossimo consolidamento.

E lo considero prioritario quanto l’integrità del deposito: PEE deve conservare correttamente non soltanto i dati, ma anche la coerenza dei ragionamenti che applica a quei dati.

S99 conferma una cosa importante: abbiamo iniziato a correggere l’architettura, ma non abbiamo ancora risolto il problema della comprensione scientifica dei documenti.

Ho verificato il rapporto S99⁠￼, i risultati del test cieco e il codice pubblicato nel commit b0083d3.

La mia valutazione è questa:

* Integrità del deposito: progresso concreto. Le 116 letture verificate arrivano al deposito senza alterazioni dei campi controllati.
* Identità delle osservazioni: due difetti reali corretti, compresa la perdita di 224 osservazioni distinte per una deduplicazione troppo aggressiva.
* Correttezza scientifica: non migliorata sul materiale nuovo. Le attribuzioni corrette scendono da 13 a 11, mentre le errate passano da 3 a 4.
* Prodotti: solamente 8 dei 40 valori pertinenti ai prodotti recensiti vengono conservati e collegati correttamente, contro 11 con S98.
* Decisioni: il nuovo lettore continua correttamente a non alimentare le classifiche.

Questo significa che abbiamo migliorato il trasporto della conoscenza, non ancora la sua interpretazione.

Ed è una distinzione che non vorrei perdere nei prossimi sviluppi.

Il problema di fondo è ancora presente

S99 ha collegato meglio componenti già esistenti, ma continua a lasciare che il tipo di estrattore determini il significato scientifico dell’informazione.

L’ho verificato nel codice:

* readDeclaration98 considera le informazioni provenienti da Phase245 come specifiche dichiarate, attribuendole al produttore.
* readTestLead98 considera le informazioni provenienti da Phase265 come risultati misurati.
* Le quantità trovate nel testo ricevono un’interpretazione più articolata, che utilizza contesto e prove linguistiche.

Questo significa che lo stesso tipo di osservazione può ricevere significati diversi a seconda del componente che l’ha individuata.

Una tabella contenente misure effettuate dalla redazione, per esempio, può essere trattata come una tabella di specifiche.

La correzione proposta da Claude sulle tabelle è necessaria, ma io allargherei il principio: il significato scientifico non deve dipendere dall’estrattore che ha trovato l’osservazione.

Gli estrattori devono fornire gli elementi di prova. Un meccanismo condiviso deve interpretarli.

Ho trovato anche un difetto concreto che merita attenzione

Nel modulo scientific_evidence98.ts, il confronto tra i metodi utilizza un Set JavaScript ma ne controlla la proprietà length anziché size e richiama every, che non è un metodo di Set.

Questo fa sì che la verifica sameMethod, così com’è scritta, non possa risultare vera.

È particolarmente significativo perché i 4.918 test risultano superati, ma il test sulla confrontabilità verifica il caso di due valori provenienti dalla stessa fonte, non dimostra il caso positivo di due fonti diverse con un metodo effettivamente identico.

È un difetto concreto individuato tramite lettura del codice, non ancora una regressione misurata da me in esecuzione.

Non significa che l’intero sistema sia sbagliato, ma dimostra perché abbiamo bisogno di test che coprano davvero le proprietà scientifiche dichiarate, compresi i casi positivi e non soltanto quelli che devono essere rifiutati.

Come procederei

Non farei ripartire Claude con un’altra lunga ricerca. La prossima attività dovrebbe consolidare ciò che ha costruito, concentrandosi su questi aspetti:

* Separare definitivamente estrazione e interpretazione scientifica. Il ruolo di un valore deve derivare dalle prove relative a quell’occorrenza: intestazioni, celle, contesto, metodo, attribuzione e struttura del documento. Non dal nome dell’estrattore.
* Correggere le cause residue comuni. In particolare, enunciati che contengono insieme dichiarazioni e risultati, quantità composte come 29:30, distanze fra termini e valori, identità dei prodotti e confrontabilità.
* Verificare sistematicamente i contratti fra componenti. Non soltanto che i campi arrivino integri, ma che abbiano il significato scientifico corretto e che i collegamenti siano giustificati.
* Consolidare quando il percorso funziona. Soltanto allora valutare, anche con strumenti come ECC, quali parti precedenti possono essere semplificate o eliminate.

Non introdurrei nel frattempo nuovi modelli vettoriali o altri sottosistemi.

Quindi, come giudico S99?

È un progresso ingegneristico reale, ma non un progresso dimostrato nell’accuratezza scientifica su documenti nuovi.

La conservazione delle osservazioni è migliorata. La deduplicazione è stata corretta. La rappresentazione è più ricca.

Ma il sistema continua a interpretare erroneamente parte delle informazioni già all’origine.

E la verifica indipendente mostra che il lavoro non ha ancora migliorato la correttezza generale.

Io non dichiarerei conclusa S99 come soluzione al problema semantico: dichiarerei completato l’esperimento S99, conservandone le correzioni valide e lasciando aperta la verifica dell’interpretazione scientifica.

Soprattutto, eviterei di trattare i cinque problemi residui come cinque piccoli interventi scollegati.

Tre di essi — il significato assegnato dalle tabelle, le dichiarazioni e misurazioni nella stessa frase, le soglie confuse con valori — riguardano una responsabilità comune: stabilire quale affermazione scientifica si riferisca esattamente a quale valore e a quale soggetto.

È lì che concentrerei il prossimo intervento.

La tua intuizione sul possibile effetto domino resta pertinente. Adesso, però, abbiamo esempi concreti da correggere e testare. Non serve mettere in discussione tutto PEE: serve verificare che la sua architettura attribuisca il significato scientifico una volta, nel punto appropriato, e lo mantenga coerente fino alla valutazione finale.

Farei entrambe le cose, ma in un ordine preciso e all’interno dello stesso intervento. Non le separerei in due fasi indipendenti, perché la tua preoccupazione è giustificata: rischieremmo di correggere il problema individuato da Claude e dimenticare la gestione generale delle regole, oppure di studiare le regole senza risolvere i difetti operativi.

La sequenza che sceglierei è questa:

Prima: analizzare come interagiscono le regole esistenti.

Non un audit infinito di tutto PEE, ma delle regole che decidono il significato delle osservazioni: ambito, priorità, evidenza, eccezioni e conflitti.

Subito dopo: correggere il problema concreto trovato da Claude.

Il ruolo delle misure nelle tabelle deve derivare dalle prove, non dal tipo di estrattore. Questa sarà la prima applicazione pratica del metodo generale.

Infine: rendere permanenti i controlli.

Registrare regole, conflitti e responsabilità nel progetto, con test automatici che impediscano alle successive modifiche di riprodurre gli stessi errori.

Non voglio che Claude aggiunga un’altra eccezione per le tabelle senza aver prima stabilito perché quella regola debba prevalere sulle altre.

Ma non voglio nemmeno che passi giorni a progettare un nuovo motore di regole prima di correggere una capacità fondamentale.

Cosa gli direi adesso

S99 è concluso, quindi possiamo consegnargli un’unica istruzione consolidata, che conserva entrambi gli obiettivi.

Allegati necessari: nessuno. I rapporti, il codice e le ricerche sono già nel progetto.

PEE — Next R3 Step: Rule Governance and Operational Semantic Correction

Following S99, proceed with one consolidated task combining two inseparable objectives:

1. Establish a general, permanent engineering method for managing interactions, precedence, scope, exceptions and conflicts among PEE’s scientific interpretation rules.
2. Apply that method immediately to the concrete S99 blocker: extractor-dependent interpretation of measured results, manufacturer specifications and other scientific statements, particularly in tables.

Do not treat these as separate phases, and do not complete one while leaving the other untracked.

First: bounded rule-interaction audit

Before modifying interpretation rules, inspect the existing mechanisms in knowledge_rules.ts, QuantityKnowledge, property definitions, document evidence, the definition interpreter and the operational readers.

Identify how rules interact when they concern the same observation:

* Evidence at document, section, table, row, clause and individual-value scope.
* Explicit evidence versus inherited context and defaults.
* Scientific constraints, rule conflicts and exceptions.
* Product identity, statement role, nature, provenance and test conditions.
* Existing S89 rules that become restrictive or contradictory when knowledge grows.

Do not assume the most specific rule always wins. Establish scientifically justified precedence, inheritance, conflict resolution and abstention.

Reuse existing mechanisms wherever possible. Do not introduce another rule engine unless a concrete architectural need is demonstrated.

Then: fix the S99 operational blocker

Correct the interpretation of table values using their actual scientific and structural evidence: headings, method descriptions, row/column relationships, product subjects and the scope of statements.

The extractor that discovered a value must not, by itself, determine whether that value is measured, declared, calculated, a threshold, a norm or a condition.

Use the same general principles for prose and tables.

Preserve the existing fixes for observation identity, deduplication, provenance and semantic persistence.

Make the solution permanent

Record the general rule-governance requirements in PEE’s existing architecture contract, roadmap and decision/debt tracking.

Add automated tests covering overlapping rules, conflicts, exception scope, inheritance and scientific invariants.

Use property-based or metamorphic tests where appropriate, not only individual example sentences.

Ensure later changes cannot silently introduce contradictory rules or bypass the operational scientific interpreter.

Validation

First establish regression baselines and run controlled tests on existing material. Then perform an independent evaluation on genuinely unseen documents when permitted.

Measure whether the change improves scientific correctness without causing new product misattributions, unjustified comparability or regressions in previously validated capabilities.

Keep S99’s operational gates and ranking restrictions intact until the relevant capabilities are independently validated.

Scope and completion

Do not start a wholesale rewrite, a new algorithmic research programme or category-specific patches.

Complete the bounded governance analysis, implement the S99 correction using its principles, and establish permanent regression protection.

If broader rule conflicts are identified but cannot safely be resolved within this intervention, record them as explicit architectural debt with affected consumers and verification criteria. Do not silently abandon them.

The task is complete only when both the concrete S99 correction and the reusable rule-governance mechanism have been addressed and their separate outcomes reported.

R3 remains open. Do not claim generalisation or readiness for R4 without evidence.

Perché questa volta insisterei su questo approccio

Finora Claude ha lavorato soprattutto correggendo comportamenti osservati. Ora gli stiamo chiedendo di individuare e correggere anche il meccanismo che permette a quegli errori di ripresentarsi.

La differenza è sostanziale.

E soprattutto la seconda parte non potrà essere dimenticata: dovrà rimanere registrata nell’architettura e nei test, anche dopo S100.

Questa è la strada che sceglierei: un primo intervento circoscritto, ma progettato per risolvere una classe generale di problemi, non soltanto l’ennesimo caso particolare.
