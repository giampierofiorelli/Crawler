# Product Evidence Engine — Fase 172: prima la decisione dell'utente, poi la spiegazione

**Data:** 12 ottobre 2026  
**Tipo:** ricerca esplorativa indipendente e revisione critica della direzione di prodotto, **non** nuova release software  
**Base controllata:** v4.95 / Fase 171, incluso `PEE-START-NEW-CHAT-PHASE172.md` e `PHASE171-ORIGINAL-SOURCE-CONFLICT-RECONCILIATION.md`.  
**Lingua prioritaria:** inglese per l'esperienza PEE e l'interpretazione delle richieste. Il presente documento è redatto in italiano per il confronto progettuale.

## 1. Verdetto provvisorio

L'ipotesi «prodotto → punteggio/classifica → spiegazione del perché» è **troppo ristretta** come modello universale. Esiste una domanda reale di raccomandazioni rapide, ma le ricerche di UX e i racconti pubblici indicano esigenze più varie: capire cosa serve; comparare su attributi pertinenti; evitare una caratteristica problematica; capire costi, manutenzione, riparabilità; saper distinguere misure e vita quotidiana; capire quale compromesso accettare; recuperare fiducia davanti a recensioni contraddittorie. **La spiegazione deve essere progettata come supporto alla scelta, non come giustificazione retorica di un vincitore.**

Le prove raccolte sostengono la necessità di **testare** questo modello. Non dimostrano che un preciso layout, ordine di sezioni o algoritmo PEE sia già migliore. Non abbiamo intervistato o osservato direttamente utenti PEE.

## 2. Come sono state valutate le fonti

- **Ricerca UX osservazionale**: Nielsen Norman Group, Baymard Institute. Utile per conoscere comportamenti osservati e problemi di navigazione/comparazione. Le percentuali Baymard provengono dai loro campioni e contesti di test, non da un censimento di tutti i consumatori.
- **Studi peer-reviewed**: esperimenti su qualità informativa e persuasione, sintesi su sistemi di raccomandazione. Consentono inferenze circoscritte al disegno di studio e alle condizioni testate.
- **Voci spontanee utenti**: thread Reddit su apparecchi, caffè e friggitrici ad aria, selezionati per varietà di domande. Sono *esempi e generatori di ipotesi*, non un campione rappresentativo, non evidenze di prestazione né prova della sincerità dell'autore.
- **Documenti degli editori di test**: RTINGS sulla propria metodologia. Sono autodichiarazioni utili per l'architettura dei confronti e per la verifica dei protocolli, non verifiche esterne di indipendenza.
- **Codice PEE**: lettura diretta del documento di continuità, rapporto Fase171 e moduli `phase164_user_request_journey.ts` e `phase171_source_conflict_workbench.ts` dalla v4.95.

## 3. Risultati concreti della ricerca

### 3.1 Confronto comprensibile e informazioni simmetriche

NN/g (2024) distingue decisioni **non compensatorie** («non posso superare 35 cm») e **compensatorie** («accetto un po' più di rumore per una pulizia migliore»). La prima richiede un filtro affidabile; la seconda una comparazione tra poche opzioni con gli stessi attributi. Suggerisce confronti leggibili generalmente su non più di cinque prodotti, e anche due su schermo piccolo; informazioni mancanti non devono essere nascoste o sostituite.

NN/g (2014, 2019) osserva che quando un prodotto ha molti dettagli e l'altro pochi, l'utente non può valutarli alla pari. Baymard (2023, 2026) trova errori di presentazione nei cataloghi che inducono a scartare prodotti potenzialmente adatti. Questi risultati non indicano che una lunga tabella sia sempre la migliore risposta: prima viene la sintesi, i dettagli restano consultabili.

Fonti: https://www.nngroup.com/articles/comparison-tables/ ; https://www.nngroup.com/articles/product-descriptions/ ; https://www.nngroup.com/articles/ecommerce-product-pages/ ; https://baymard.com/research-articles/list-item-design-ecommerce ; https://baymard.com/research-articles/current-state-ecommerce-product-page-ux

### 3.2 Conoscere gli svantaggi è parte centrale della decisione

Baymard, sulla base di test di usabilità di pagine prodotto, riferisce che **il 53% degli utenti osservati ha cercato attivamente le recensioni negative di almeno un prodotto**; non significa che il 53% di tutti gli acquirenti lo faccia in ogni acquisto. Un commento negativo può essere poco pertinente per una persona e decisivo per un'altra (es. aspirapolvere scarso con peli animali, rilevante soltanto se l'utente ha animali).

Per PEE la domanda da affrontare non è semplicemente «quali sono i difetti?», ma **«quali difetti sono importanti per me, quali tollerabili e quali ancora non verificati?»**. Le lamentele degli utenti vanno usate come segnali di esigenze da verificare, non come prova che quel prodotto abbia davvero il problema.

Fonti: https://baymard.com/research-articles/respond-to-negative-user-reviews ; https://baymard.com/research-articles/user-reviews-dtc

### 3.3 Le motivazioni reali non coincidono con le categorie marketing

Esempi osservati nei thread pubblici:

- Un acquirente di elettrodomestici si chiede perché consigli così contraddittori lo spingano a spendere più di quanto servirebbe per le sue esigenze: non sta chiedendo «qual è il marchio più prestigioso», ma «quanto beneficio concreto ottengo pagando di più?». https://www.reddit.com/r/Appliances/comments/1nkhdtv/why_is_all_appliance_advice_absolutely_miserable/ (il post iniziale risulta poi eliminato; restano commenti e una versione indicizzata: citare con questa limitazione).
- Su una friggitrice ad aria per single, si discute se la **larghezza utilizzabile del cestello** sia più utile della capienza nominale in litri; un altro utente teme contemporaneamente un apparecchio troppo grande da pulire e troppo piccolo per cucinare. https://www.reddit.com/r/airfryer/comments/1e7v9u3 ; https://www.reddit.com/r/airfryer/comments/1gwdj63
- Una persona racconta che una friggitrice grande non entra nemmeno nel lavello/lavastoviglie: il problema non è solo dimensione esterna, ma **facilità di pulizia nel suo ambiente domestico**. https://www.reddit.com/r/airfryer/comments/1efxjds/best_stainless_steel_easy_to_clean_air_fryers_for/
- Una persona chiede una lavastoviglie che resti silenziosa durante lavaggio **e scarico**, perché la cucina è vicina al soggiorno e la TV: la scheda con un solo valore dB non basta a risolvere la domanda. https://www.reddit.com/r/Appliances/comments/1vv275o/quietest_dishwasher_which_one_would_you_recommend/
- Chi cerca una macchina espresso può desiderare bevande ripetibili e manutenzione minima più di funzioni aggiuntive, anche con un budget elevato. https://www.reddit.com/r/espresso/comments/1v31zbl/need_a_espresso_machine_recommendation_for_a_no/ ; https://www.reddit.com/r/espresso/comments/1nk51z1/recommend_a_low_maintenance_machine_1000/
- Discussioni sulla durata insistono su **ricambi, riparabilità e assistenza**: aspetti spesso assenti da prove di prestazione a breve termine. https://www.reddit.com/r/BuyItForLife/comments/1ll5naj ; https://www.reddit.com/r/BuyItForLife/comments/1g67yp9/what_review_sites_do_you_trust_wirecutter/

**Limite decisivo:** nessuno di questi thread consente di stabilire la performance reale di un modello commerciale né la frequenza di una necessità nella popolazione. Servono soltanto per costruire un catalogo iniziale di bisogni da validare.

### 3.4 Una spiegazione convincente può peggiorare la scelta

Tintarev e Masthoff (2012) distinguono varie finalità delle spiegazioni (efficacia, soddisfazione, trasparenza, controllo, fiducia, persuasione, efficienza) e avvertono che non sono intercambiabili.

Rahman, Siemon e Ruotsalo, *International Journal of Human-Computer Studies* (2026), esperimento **N=231** dopo esclusione di nove partecipanti, tre compiti simulati: spiegazioni più persuasive hanno aumentato la selezione di opzioni **meno coerenti con le preferenze dichiarate**. Lo studio ha misurato scelte tra raccomandazioni, **non acquisti reali di elettrodomestici**. Una ragione diretta per vietare nel design PEE superlativi, linguaggio di scarsità, autorità non verificata e «fidati di noi» se non supportati.

Fonti: https://link.springer.com/article/10.1007/s11257-011-9117-5 ; https://researchprofiles.ku.dk/en/publications/persuasive-explanations-for-recommender-systems-how-explanations-/ ; https://www.sciencedirect.com/science/article/pii/S1071581925002757

### 3.5 La qualità informativa e il rischio dipendono dal prodotto

Esperimento britannico con **3.544 acquirenti online di prodotti fai-da-te**: la qualità dell'informazione sul prodotto ha influenzato gli esiti osservati nello scenario, con effetti che variavano per criterio, categoria e coinvolgimento nell'acquisto; per prodotti a maggior coinvolgimento è richiesto maggiore dettaglio. Questo sostiene un'esperienza **adattiva per categoria e per gravità della scelta**, non una scheda universale fissa.

Una review sistematica su **118 articoli** individua incertezza, conoscenza, rischio percepito, prezzo, esperienza e coinvolgimento come temi ricorrenti nella ricerca delle informazioni.

Fonti: https://doi.org/10.1108/IJRDM-04-2023-0266 ; https://doi.org/10.1108/RAUSP-08-2019-0174

### 3.6 I test comparabili sono un fondamento, non tutta la decisione

RTINGS dichiara che il confronto corretto dipende da categoria, protocollo, versione e condizioni di misura; esplicitamente, le valutazioni generali rispecchiano un utente medio ipotetico e il singolo utente potrebbe attribuire pesi diversi. RTINGS dichiara inoltre che per le raccomandazioni contano anche disponibilità, prezzo, caratteristiche di nicchia, compatibilità e aspetti di esperienza non esauriti dai punteggi standardizzati.

Questi sono criteri dichiarati dall'editore, non verifica indipendente dei suoi metodi. PEE deve quindi preservare la metodologia e distinguere misure, condizioni, valutazioni editoriali, rischi ignoti e disponibilità attuale.

Fonti: https://www.rtings.com/company/test-benches-and-scoring-system ; https://www.rtings.com/headphones/learn/how-we-test ; https://www.rtings.com/air-fryer/learn/how-we-test

## 4. Audit critico dell'approccio PEE attuale

| Aspetto v4.95 verificato | Punto forte | Rischio o gap da colmare |
|---|---|---|
| Fasi 164–165, request journey | Contesto inglese, follow-up, vincoli, ambiguità | Richieste concepite soprattutto come **insieme di criteri**, non anche come domande esplorative o costi del compromesso |
| Fasi 166–167, numeric evidence bridge | Limiti, unità, identità/variante, fonte | Variabile tecnica non sempre rappresenta il **risultato reale nella vita dell'utente** |
| Fase 168, qualitativo | Funzione presente vs prestazione adeguata | Manca una tassonomia convalidata di esiti vissuti, svantaggi, sforzo e inconvenienti d'uso |
| Fasi 169–171 | Conferme firmate, replay, conflitti e metodi | Rischio di uno stack di audit molto rigoroso senza ancora un'esperienza di decisione dimostrata utile |
| Ranking bloccato nei moduli research | Evita classifiche ingiustificate | Non deve tradursi in una risposta sterile: **si può offrire guida provvisoria specifica** e una domanda mirata, senza inventare un vincitore |
| Solo test costruiti | Ottimi per invarianti e regressioni | Non misurano copertura delle domande vere, utilità, comprensione o decisioni migliori |

**Correzione di rotta:** nessuna nuova classifica automatica o interfaccia di «spiegazione del ranking» va considerata requisito già validato. Prima occorre un contratto di *decision support* e prove UX.

## 5. Quali compiti l'utente potrebbe chiedere davvero? Tassonomia candidata, non convalidata

1. **Orientarsi nella categoria:** «Ho bisogno di una friggitrice ad aria? Di quanti litri per me?»; spiegare termini e trade-off.
2. **Trovare una soluzione:** «Qual è il miglior modello per le mie esigenze?»; breve shortlist, eventualmente un candidato preferito con condizioni.
3. **Confrontare candidati nominati:** «A o B?»; differenze davvero decisive, omissioni, dimensioni comparabili.
4. **Verificare un modello trovato altrove:** «Questo modello è valido? Quali problemi ha?»; punti forti/deboli, identità della variante, fonti.
5. **Eliminare i rischi temuti:** «Non voglio qualcosa che si rompa dopo due anni»; distinguere evidenze longitudinali da mere impressioni.
6. **Valutare il salto di prezzo:** «Vale la pena spendere £150 in più?»; differenza concreta, uso previsto, costo totale.
7. **Tradurre specifiche in vita reale:** «45 dBA mi disturberanno durante la TV?»; evitare conversioni arbitrarie senza contesto/test.
8. **Trovare un compromesso:** «Meglio più silenziosa o più facile da pulire?»; chiarire priorità, risultati controfattuali.
9. **Acquisto pratico:** «È disponibile nel mio Paese? Quanto mi costa realmente?»; prezzo/stock freschi e separati dai test storici.
10. **Convivere, riparare o sostituire:** «Meglio riparare quella che ho?»; se dati sufficienti, valutazione distinta da ricerca nuovo modello.
11. **Comprendere un disaccordo:** «Perché due esperti dicono cose diverse?»; protocollo, varianti, metodo, condizioni e incertezze.
12. **Ridurre la fatica decisionale:** «Dammi una scelta sensata, non venti alternative»; sintesi senza persuasione.
13. **Capire se cambiare idea:** «Cosa cambia se elimino il budget, se vivo da solo, se cucino due piatti insieme?»; ricalcolo deterministico su vincoli diversi.

Si tratta di ipotesi da ricavare e validare su un corpus indipendente di vere domande, non di percentuali di mercato.

## 6. Un modello di risposta incentrato sulla decisione, NON sempre una classifica

### Strato A — Diagnosi della domanda
Identificare: compito effettivo; contesto/risultato desiderato; condizioni inderogabili; preferenze scambiabili; rischi che l'utente vuole evitare; conoscenze mancanti; tempo e budget; mercato; grado di urgenza; desiderio di risposta breve o approfondita. Non presumere che tutti vadano interrogati su tutto.

### Strato B — Cosa possiamo verificare?
Per ogni proposizione, conservare: `claim` (es. facilità di pulizia); tipo (presenza / misura / prestazione / esperienza / costo futuro / rischio); fonte e originalità; variante; metodo e contesto; validità temporale; qualità verificata o provvisoria; eventuale disaccordo. Segnare esplicitamente `unknown` invece di interpretarlo come zero o come voto negativo.

### Strato C — Decisione possibile
Stati distinti: **risposta informativa** (anche senza prodotti); **confronto qualitativo condizionale**; **shortlist provvisoria** con motivi ed esclusioni non definitive; **raccomandazione verificata** solo se tutte le precondizioni sono soddisfatte; **sospensione motivata** quando una risposta specifica rischia di ingannare. La via scelta dipende dal compito, non dalla necessità di mostrare una top 10.

### Strato D — Spiegazione concreta per l'utente
Proposta da testare, non UI definitiva:

1. **Risposta principale breve** («Per il tuo uso, A sembra più adatto di B, ma non è ancora verificata la rumorosità»), oppure spiegazione concettuale se l'utente non sta ancora acquistando.
2. **Due o tre motivi legati alla domanda**, non alle caratteristiche considerate importanti da un sito esterno.
3. **Il compromesso e il problema più rilevante** (cosa perdi, cosa può andare storto, quando scegliere l'alternativa).
4. **Che cosa è stato effettivamente testato**, metodo e fonte consultabile; non nascondere ciò che è dichiarato dal produttore o non verificato.
5. **Che cosa potrebbe cambiare la scelta** (un solo chiarimento utile o una misura originale mancante, se davvero decisiva).
6. Approfondimenti opzionali: tabella omogenea, metodologia, note sulle varianti, conflitti, altri candidati e intervallo prezzi.

**Modalità differenti per compito:** risposta diretta, confronto 2–3 prodotti, chiarimento didattico, esplorazione per esigenze, oppure piano di ricerca quando le prove sono insufficienti. Non imporre sempre il medesimo template.

### Controfattuale come test di onestà
PEE dovrebbe poter dire: «Se la pulizia è più importante della capacità, l'ordine di preferenza potrebbe cambiare; ecco il dato che oggi manca». **Non** deve fabbricare uno spostamento di ranking se il dato è ignoto, né usare l'assenza di test come prova di inferiorità.

## 7. Domande di ricerca ancora aperte (importanti)

- Quali sono i segmenti di utenti reali e le differenze tra principiante, conoscitore, acquirente deciso, confrontatore, persona che compra un regalo?
- Quanto spesso gli utenti vogliono *una risposta sola* rispetto a *una scelta fra due/tre*? Dipende dal costo e dalla categoria?
- Quanto dettaglio tecnico chiedono, e quando quel dettaglio li aiuta o sovraccarica?
- Quanto pesa il costo totale (consumi, capsule, filtri, detergenti, ricambi, riparazioni) rispetto al prezzo iniziale?
- Cosa vuol dire «silenzioso», «facile da pulire», «affidabile» **nel contesto concreto** di ciascuno? Quando servono test mirati e quando mancano fonti valide?
- L'utente desidera solo test professionali come base della raccomandazione, oppure anche testimonianze come **informazione secondaria distinta**? PEE deve rispettare preferenze individuali sulle fonti, mai mescolando livelli di prova.
- L'impostazione «sempre spiegare ciò che manca» genera chiarezza oppure frustrazione? Come dosare la cautela senza nascondere i limiti?
- Quando il consiglio dovrebbe essere *non comprare*, *rimanda*, *ripara*, *riduci il budget*, *non c'è abbastanza differenza*, anziché trovare sempre un nuovo vincitore?

## 8. Disegno di verifica prima di implementare il prodotto finale

Questi numeri sono **proposte di ricerca**, non campioni già raccolti:

**Fase esplorativa**: raccogliere un corpus con diritti e privacy rispettati di vere domande in inglese da varie categorie e situazioni; codifica aperta indipendente da almeno due persone di bisogni, contesto, dubbi, rischi e output desiderato; includere casi fuori tassonomia. Se possibile svolgere 18–24 interviste distribuite per compito e livello di conoscenza (numero iniziale pragmatico, non power analysis).

**Fase di test dei prototipi**: confrontare almeno tre versioni: (A) classifica più motivazioni; (B) breve consiglio con compromessi/rischi; (C) modalità scelta in funzione del compito. Usare gli stessi casi verificati e la medesima evidenza. Misurare: comprensione corretta del limite scientifico, identificazione delle differenze decisive, errori di scelta simulata, preferenze erroneamente attribuite, tempo alla scelta, necessità di consultare altri siti, soddisfazione e percezione di pressione persuasiva. Non usare solo intenzione d'acquisto o fiducia percepita come metrica primaria.

**Audit esperto separato**: su un campione stratificato di risposte, verificare per ogni fatto il testo originale, la variante, il metodo, la comparabilità, gli aggiornamenti e il rischio di omissioni importanti.

**Regole d'ingresso al ranking**: prima serve un test indipendente di accuratezza dell'interpretazione dell'intento, un registro di fonti/metodi verificato e una policy esplicita su dati mancanti, non soltanto i test di regressione con input costruiti.

## 9. Scelte immediate consigliate

1. **Non avviare subito una fase 172 di sola generazione delle spiegazioni.** Congelare il design della schermata finale in attesa di prove sui compiti degli utenti.
2. Realizzare una **tassonomia testabile dei compiti decisionali** e un formato di casi annotabili, riutilizzando gli interpreti PEE esistenti.
3. Scrivere un **contratto di spiegazione non persuasiva e verificabile**: ragione legata a un bisogno; fonte; svantaggio; grado di incertezza; `unknown` esplicito; effetto di modificare una preferenza; nessun risultato simulato come testato.
4. Testare prototipi di risposte su casi realistici *senza* attribuire successi di accuratezza finché mancano utenti/annotazioni indipendenti.
5. Investire nel confronto di qualità sul **significato dell'uso quotidiano**, non solo sui numeri: esplicitare per ogni categoria quali segnali di prova lo supportano o meno.
6. Mantenere tutta l'infrastruttura di prove/provenienza della v4.95. Non servono nuovi pesi neurali o servizi SaaS per questa revisione concettuale.

## 10. Fonti consultate — URL direttamente copiabili

**UX osservazionale e linee guida**

1. Nielsen Norman Group (2024), *Comparison Tables for Products, Services, and Features*: https://www.nngroup.com/articles/comparison-tables/
2. NN/g (2014), *3 Tips for Better Product Descriptions*: https://www.nngroup.com/articles/product-descriptions/
3. NN/g (2019), *UX Guidelines for Ecommerce Product Pages*: https://www.nngroup.com/articles/ecommerce-product-pages/
4. NN/g, *Designing for Different Types of E-Commerce Shoppers*: https://www.nngroup.com/articles/ecommerce-shoppers/
5. Baymard (2019; aggiornamenti dati successivi), *Respond to Negative User Reviews*: https://baymard.com/research-articles/respond-to-negative-user-reviews
6. Baymard (2023), *2 Key Design Principles for Product Listing Information*: https://baymard.com/research-articles/list-item-design-ecommerce
7. Baymard (aggiornato 2026), *Product Page UX 2026*: https://baymard.com/research-articles/current-state-ecommerce-product-page-ux
8. Baymard (2022), *DTC User Reviews*: https://baymard.com/research-articles/user-reviews-dtc

**Studi e revisioni scientifiche**

9. Tintarev & Masthoff (2012), *Evaluating the effectiveness of explanations for recommender systems*, User Modeling and User-Adapted Interaction: https://doi.org/10.1007/s11257-011-9117-5
10. Rahman, Siemon & Ruotsalo (2026), *Persuasive explanations for recommender systems*, N=231, International Journal of Human-Computer Studies: https://doi.org/10.1016/j.ijhcs.2025.103720 ; testo/abstract istituzionale: https://researchprofiles.ku.dk/en/publications/persuasive-explanations-for-recommender-systems-how-explanations-/
11. *Presenting products on websites – the importance of information quality criteria for online shoppers*, N=3544, International Journal of Retail & Distribution Management: https://doi.org/10.1108/IJRDM-04-2023-0266
12. *A systematic review of consumer information search in online and offline environments*, 118 articoli: https://doi.org/10.1108/RAUSP-08-2019-0174
13. *Advances and challenges in conversational recommender systems: A survey* (2021): https://www.sciencedirect.com/science/article/pii/S2666651021000164
14. *Online information search and decision making: Effects of web search stance* (2016), N=109, categoria bottled water: https://doi.org/10.1016/j.chb.2015.11.028

**Metodologia dichiarata dei test professionali**

15. RTINGS (2026), *Test Benches and Scoring System*: https://www.rtings.com/company/test-benches-and-scoring-system
16. RTINGS, *How We Test Air Fryers*: https://www.rtings.com/air-fryer/learn/how-we-test
17. RTINGS, *How We Test Headphones*: https://www.rtings.com/headphones/learn/how-we-test

**Voci spontanee (campione opportunistico, non rappresentativo)**

18. r/Appliances, consigli discordanti: https://www.reddit.com/r/Appliances/comments/1nkhdtv/why_is_all_appliance_advice_absolutely_miserable/
19. r/airfryer, capacità vs larghezza cestello: https://www.reddit.com/r/airfryer/comments/1e7v9u3
20. r/airfryer, single e capacità: https://www.reddit.com/r/airfryer/comments/1gwdj63
21. r/airfryer, facilità di pulizia: https://www.reddit.com/r/airfryer/comments/1efxjds/best_stainless_steel_easy_to_clean_air_fryers_for/
22. r/Appliances, rumorosità in ambiente domestico: https://www.reddit.com/r/Appliances/comments/1vv275o/quietest_dishwasher_which_one_would_you_recommend/
23. r/espresso, macchina per uso quotidiano: https://www.reddit.com/r/espresso/comments/1v31zbl/need_a_espresso_machine_recommendation_for_a_no/
24. r/espresso, manutenzione minima: https://www.reddit.com/r/espresso/comments/1nk51z1/recommend_a_low_maintenance_machine_1000/
25. r/BuyItForLife, riparabilità e assistenza: https://www.reddit.com/r/BuyItForLife/comments/1ll5naj
26. r/BuyItForLife, diffidenza verso selezioni degli esperti: https://www.reddit.com/r/BuyItForLife/comments/1g67yp9/what_review_sites_do_you_trust_wirecutter/

---

**Stato della decisione:** nessuna release Fase172 viene dichiarata completata; queste conclusioni sono una **base di ricerca e di revisione del prodotto**. Una tassonomia proposta non equivale a una classificazione verificata. Le pubblicazioni scientifiche e le osservazioni UX non sono dati di accuratezza di PEE. I commenti Reddit non sono considerati evidenza professionale sulle prestazioni dei prodotti.
