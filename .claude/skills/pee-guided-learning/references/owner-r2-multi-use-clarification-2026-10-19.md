# Owner clarification for R2: one observation, several analytical uses (2026-10-19), verbatim

Received after the R2 report (`docs/plans/r2-typed-link-and-evidential-force.md`). Decision S69 in
`decisions-and-supersessions.md`. The owner's Italian framing and the English brief the owner wrote for Claude are both
preserved below the rule, byte for byte. The cited sources are methodological references (S64: research is reference,
not a mandate), checked by the owner; Claude did not fetch them.

---

Ho approfondito proprio il punto che ti preoccupava, consultando sia protocolli tecnici ufficiali sia le metodologie di prova di testate specializzate come Consumer Reports e RTINGS.

La tua richiesta di non affidarci soltanto alle ipotesi mie o di Claude è giustissima: le fonti confermano che dobbiamo distinguere il riutilizzo legittimo di una misura dalla prova di un risultato complessivo.

E questa distinzione è importante adesso, durante R2, perché Claude sta lavorando proprio sul collegamento di una misura a più analisi.

Che cosa dicono effettivamente gli esperti

Prendiamo un purificatore d’aria. Supponiamo che un laboratorio registri:

Impostazione	Potenza	CADR	Rumore
Velocità 1	8 W	75 m³/h	25 dBA
Velocità 2	20 W	170 m³/h	38 dBA
Velocità 3	45 W	310 m³/h	54 dBA

Valori inventati esclusivamente per spiegare il metodo, non risultati di un prodotto reale.

Un valore come 20 W può legittimamente essere utilizzato per descrivere sia il consumo alla velocità 2 sia il rapporto tra prestazione di purificazione e consumo alla stessa velocità.

Ma quel valore, isolato, non dimostra una curva di prestazioni e non dice quanto efficacemente il prodotto purifichi l’aria.

Questo principio è confermato da tre fonti particolarmente pertinenti.

1. ENERGY STAR ed il Department of Energy statunitense. La procedura ufficiale distingue la misura della potenza, la misura del CADR e il calcolo dell’efficienza energetica. La normativa specifica come misurare CADR e potenza durante le prove e come ricavare gli indicatori di efficienza. Il semplice valore in watt non basta.

2. HouseFresh. Nella metodologia pubblicata il 23 febbraio 2026, la testata dichiara di misurare consumo elettrico e rumore alle diverse velocità e di stimare il CADR nelle diverse configurazioni. Sono misure collegate da un contesto sperimentale, non numeri genericamente simili.

3. RTINGS e Consumer Reports. Entrambe le testate distinguono la capacità di rimuovere particelle alle diverse condizioni operative. RTINGS, con la metodologia 1.2 del maggio 2026, ha aggiunto una prova specifica di purificazione in configurazione silenziosa. Consumer Reports effettua prove di rimozione delle particelle alla massima velocità e a una configurazione con rumore non superiore a 50 dB. Questo dimostra quanto le condizioni di funzionamento siano essenziali per interpretare la prestazione.

La conclusione è che Claude fa bene a voler collegare una misura a più analisi, ma il software deve conservarne il ruolo esatto in ciascuna analisi.

La distinzione fondamentale: una misura, diversi utilizzi, ma una sola osservazione originale

La ricerca ha chiarito anche un punto ingegneristico importante.

Lo standard W3C SOSA/SSN distingue l’osservazione, la proprietà osservata, la procedura utilizzata e il risultato. Questo fornisce un modello concettuale per conservare l’identità di una misura anche quando viene riutilizzata in analisi differenti.

La letteratura metrologica del NIST sottolinea inoltre che, quando risultati o valutazioni condividono dati, le dipendenze e le correlazioni devono essere considerate. Non possiamo quindi trattare due utilizzi dello stesso dato come due conferme sperimentali indipendenti.

Per PEE suggerisco questa distinzione:

OSSERVAZIONE ORIGINALE

20 W, velocità 2, prodotto A, fonte X

Consumo per modalità

La misura contribuisce direttamente a descrivere la potenza assorbita

Analisi CADR/potenza

È un dato utilizzabile solo se collegabile a una misura CADR compatibile

Una sola provenienza: due possibili utilizzi non costituiscono due prove indipendenti.

C’è anche una precisazione: non è necessario che CADR e potenza siano sempre misurati nello stesso istante. Il Department of Energy ammette, in determinati protocolli, anche prove supplementari della potenza. Quello che conta è la compatibilità delle condizioni e del metodo, non una corrispondenza temporale obbligatoria.

E una curva richiede una serie di punti adeguatamente collegati. Il singolo valore di potenza può esserne un componente, ma non dimostra da solo l’andamento della curva.

Dobbiamo comunicarlo subito a Claude?

Sì, in questo caso lo farei ora, con un intervento molto circoscritto. Non per modificare la roadmap o aggiungere un’altra fase, ma perché Claude ha indicato come prossimo lavoro proprio la gestione dei 50 valori collegabili a più misure.

È un requisito semantico fondamentale: se stabilisce adesso che ogni collegamento multiplo equivale a una prova completa, correggere il meccanismo successivamente potrebbe essere più costoso.

Gli invierei questa sola precisazione, in inglese, con le fonti scientifiche e giornalistiche già verificate.

PEE — R2: scientific clarification before implementing multi-measurement links

Continue the authorised R2 work and preserve the existing roadmap, architecture, tests, shadow-only operation and autonomy in engineering decisions.

I have reviewed external measurement standards and the published testing methodologies of independent product-testing publications. Please account for the following distinction when addressing the 50 ambiguous power values.

One measured observation may legitimately contribute to multiple analyses, but those uses must not be interpreted as multiple independent observations or as proof of a complete performance relationship.

For example, a power measurement at a specified fan setting may:

* Directly describe power consumption at that setting.
* Serve as an input to a CADR/power analysis if a compatible CADR measurement exists.
* Contribute to a multi-setting CADR/noise/power relationship when the necessary aligned observations and conditions exist.

However, a power value alone does not demonstrate CADR, acoustic performance or an entire performance curve.

Preserve the distinction between:

1. Original observation, measured property, unit, product, source, method and operating conditions.
2. Legitimate membership or contribution to one or more analytical measurement sets.
3. Derived relationships supported by compatible observations.
4. Conclusions that the available evidence is sufficient to establish.

Measurements need compatible experimental settings and methods, but need not necessarily come from the same physical test run when the accepted procedure permits equivalent or supplemental measurements.

Do not duplicate evidence when one observation contributes to multiple outcomes. Preserve shared provenance and dependencies, and do not treat repeated use as independent corroboration.

Relevant primary and specialist references:

* US Department of Energy, 10 CFR Appendix FF — CADR, power measurement and derived efficiency: https://www.law.cornell.edu/cfr/text/10/appendix-FF_to_subpart_B_of_part_430
* HouseFresh, independent laboratory and product-testing methodology, including CADR, noise and power across fan settings: https://housefresh.com/how-we-test-air-purifiers/
* Consumer Reports, air-purifier laboratory testing and operating-speed conditions: https://www.consumerreports.org/appliances/air-purifiers/buying-guide/
* W3C SOSA/SSN, observations, observed properties and measurement procedures: https://www.w3.org/TR/vocab-ssn-2017/
* NIST, correlation and dependence in measurement uncertainty: https://www.nist.gov/publications/correlation-uncertainty-measurement-discussion-state-art-techniques

Use these as methodological references, not as a mandate for a new framework, external service or category-specific rules.

Please test at least these distinctions within the existing R2 evaluation method: legitimate multiple analytical uses of one observation; a standalone power value that cannot establish a curve; incompatible operating conditions; and repeated use of the same observation that must not count as independent evidence.

Implement the smallest general, reversible solution consistent with the existing QK/KR/WD architecture. Continue measuring both valid links recovered and unjustified conclusions, and distinguish development results from independent validation.

This clarification belongs to R2. The broader scientific-document translation and completeness work remains assigned to R3.

La ricerca, quindi, conferma la direzione generale di Claude, ma aggiunge una distinzione che non possiamo permetterci di trascurare.

Non è una nuova funzionalità specifica dei purificatori. Vale per qualunque categoria in cui una misura contribuisce a più analisi: lavatrici, televisori, deumidificatori, macchine da caffè e molte altre.

Ed è precisamente il genere di principio scientifico generale che vogliamo rendere permanente in PEE, invece di risolvere soltanto i 50 esempi attuali.
