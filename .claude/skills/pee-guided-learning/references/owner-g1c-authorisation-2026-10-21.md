# Owner authorisation of G1c (2026-10-21), verbatim

Received after Crawler commit 92ea4e3 (owner review of G1b recorded). Authorises G1c "Scientific Semantic Retrieval and
Bidirectional Knowledge", including the experimental introduction of a small pretrained local sentence-embedding model
and a network read limited to the initial download of the model and its technical dependencies from verifiable official
sources. Phase257 restrictions on site reads, the operational store, ranking and evidence authority are unchanged.
Decision row: G1c-start.

## The owner's message (Italian, unchanged)

Claude ha recepito correttamente la nostra revisione. E soprattutto ha riconosciuto una distinzione importante: il fallimento della somiglianza statistica PPMI non dimostra che un moderno modello di embeddings semantici non possa funzionare.

A questo punto autorizzerei il prossimo esperimento, ma con una prospettiva più ampia rispetto alla semplice risoluzione delle parafrasi.

La vettorializzazione deve essere studiata come possibile capacità permanente di PEE, utilizzabile per ricercare conoscenza per bisogno, categoria, situazione, meccanismo e fonte scientifica. Non deve diventare l’ennesimo modulo sperimentale scollegato.

Conserverei inoltre una cautela: le 926 situazioni e i 167 collegamenti alle strategie sono strutture effettivamente costruite, ma la loro accuratezza scientifica non è ancora stata dimostrata indipendentemente.

Prompt consolidato per Claude

Allegati necessari: nessuno. Tutti i documenti, le skill, i pacchetti scientifici e i risultati precedenti sono già disponibili nei repository. Nessuna ricostruzione è richiesta.

PEE — G1c: Scientific Semantic Retrieval and Bidirectional Knowledge

Autorizzo il prossimo incremento G1c, partendo dai risultati di G1b e dalla revisione registrata al commit 92ea4e3.

Utilizza attivamente pee-guided-learning, le skill pertinenti, la ricerca scientifica disponibile e le capacità già implementate.

Ti lascio autonomia nella scelta dei metodi e nell’organizzazione degli esperimenti. L’obiettivo è sviluppare capacità generali e riutilizzabili, non ottimizzazioni per le richieste già esaminate.

1. Principio architetturale permanente

PEE deve possedere una conoscenza scientifica unica e interconnessa, consultabile sia per bisogno sia per categoria.

La conoscenza deve essere:

* strutturata per consentire ragionamento su obiettivi, situazioni, cause, strategie, meccanismi, proprietà, condizioni ed evidenze;
* indicizzabile semanticamente per recuperare informazioni pertinenti anche quando le parole non coincidono;
* verificabile attraverso provenienza, indipendenza delle fonti, stato epistemico e condizioni di applicabilità.

La vettorializzazione non sostituisce le relazioni scientifiche: contribuisce a individuare conoscenza candidata, che deve essere interpretata e verificata prima dell’utilizzo decisionale.

Questo principio deve essere applicabile anche alla futura ricerca documentale, all’estrazione quantitativa e qualitativa, all’attribuzione, alla valutazione dei prodotti e all’apprendimento di nuove categorie.

2. Autorizzazione al modello locale

Autorizzo esplicitamente l’introduzione sperimentale di un piccolo modello preaddestrato di sentence embeddings, eseguibile localmente e offline, senza API o servizi a pagamento.

Autorizzo una lettura di rete limitata al download iniziale del modello e delle eventuali dipendenze tecniche necessarie da fonti ufficiali verificabili.

Scegli autonomamente un modello appropriato, privilegiando:

* qualità semantica, leggerezza, compatibilità con l’ambiente e inferenza CPU;
* licenze permissive compatibili con PEE, sia per il modello sia per il runtime;
* versione, revisione e hash verificabili;
* riproducibilità, costi di memoria e tempi di indicizzazione/inferenza contenuti.

Registra la scelta e il suo fondamento prima della valutazione indipendente. Nessun dato dell’utente o contenuto scientifico deve essere inviato a servizi remoti per generare embeddings.

Questa autorizzazione non modifica le restrizioni Phase257 sulle letture di siti e fonti scientifiche, né autorizza modifiche allo store operativo.

Se nessun modello adeguato può essere utilizzato in sicurezza e nei limiti di costo, documenta il blocco senza introdurre un servizio a pagamento.

3. Confronto sperimentale

Preregistra un confronto controllato tra:

A. Situazioni e bisogni scientificamente tipizzati.

B. Recupero mediante sentence embeddings locali.

C. Recupero ibrido, semantico e lessicale/strutturato.

D. Recupero ibrido seguito dalla verifica di ruoli, relazioni scientifiche, condizioni, controindicazioni e provenienza.

Confronta i metodi con le baseline C e G1b a parità di conoscenza disponibile e, dove appropriato, di numero di candidati recuperati.

Non limitarti alla similarità linguistica: misura il recupero dei bisogni e delle strategie realmente pertinenti.

Mantieni distinti tre livelli di valutazione:

1. Accuratezza del recupero della conoscenza.
2. Correttezza scientifica dei collegamenti recuperati.
3. Correttezza delle ipotesi e delle decisioni successive.

Effettua anche una verifica cieca, su un campione preregistrato, dell’accuratezza delle situazioni e dei collegamenti alle strategie derivati da G1b. Le 926 situazioni e i 167 collegamenti non devono essere considerati automaticamente validati.

4. Indicizzazione della conoscenza

Studia una rappresentazione vettoriale permanente e ricostruibile delle unità di conoscenza pertinenti: bisogni, situazioni, strategie, meccanismi e dichiarazioni scientifiche.

Non indicizzare indiscriminatamente intere pagine o creare copie non consentite dei contenuti originali.

Ogni vettore deve restare associato all’identificatore canonico della conoscenza, alla provenienza, alle condizioni, allo stato di revisione e alla versione del modello.

Riutilizza lo store e i moduli esistenti. Nessun secondo motore decisionale, database remoto o nuova fonte di verità.

Verifica che una nuova conoscenza validamente acquisita possa essere reindicizzata e resa ricercabile da più bisogni e categorie, senza duplicazione delle dichiarazioni scientifiche.

Per questo incremento utilizza copie e proiezioni sperimentali.

5. Sicurezza semantica

Valuta esplicitamente i casi in cui la similarità semantica può essere fuorviante:

* negazioni e preferenze contrarie;
* prodotto posseduto rispetto a prodotto richiesto;
* situazioni opposte;
* causa rispetto a sintomo;
* funzione disponibile rispetto a risultato dimostrato;
* bisogni generici presenti in molte categorie;
* condizioni scientifiche che rendono una strategia inadatta.

Non trasformare il punteggio vettoriale in una probabilità di correttezza senza calibrazione.

Non consentire che la sola similarità semantica autorizzi requisiti, esclusioni, affermazioni di efficacia o ranking.

6. Materiale e validazione

Usa per lo sviluppo soltanto materiale già consumato.

Mantieni distinti:

* l’insieme G1, disponibile per la prima verifica GF con i limiti di indipendenza già dichiarati;
* il nuovo insieme G1b di 75 richieste, ancora sigillato per la verifica successiva di generalizzazione.

Preserva i criteri di valutazione e le condizioni di arresto preregistrate, registrando preventivamente ogni adattamento necessario al nuovo confronto.

Non correggere i metodi sui risultati dei primi test indipendenti. Se nessuna alternativa supera la soglia di sviluppo, interrompi la promozione e conserva il materiale sigillato.

Valuta separatamente la generalizzazione tra bisogni, categorie e formulazioni linguistiche, oltre al numero di collegamenti inventati.

7. Difetti operativi residui

Mantieni visibile il problema dei limiti espliciti ancora persi (10/32 sul precedente insieme G1).

Indaga le cause usando materiale già consumato o nuovo materiale destinato esclusivamente allo sviluppo, senza utilizzare gli insiemi sigillati per correggere il codice.

Eventuali correzioni devono essere generali, test-first e accompagnate da regression diff. Non devono alterare ranking, esclusioni o autorità delle evidenze.

8. Autonomia e condizioni di arresto

Procedi autonomamente con gli esperimenti e le decisioni tecniche ordinarie nei limiti autorizzati.

Preserva le decisioni e i risultati di R3-P, N0, N1, C, G1 e G1b. Non ricominciare lo sviluppo delle componenti che possono essere riutilizzate.

Non avviare nuove categorie, ricerca web scientifica autonoma, modifiche allo store operativo o promozioni di capacità non validate.

Consegna un rapporto che distingua chiaramente:

* ciò che è stato implementato;
* i risultati su sviluppo;
* le verifiche indipendenti;
* la correttezza scientifica dei collegamenti;
* i costi e i limiti del modello locale;
* la generalizzazione dimostrata;
* il percorso per integrare stabilmente il recupero semantico nei moduli esistenti.

Obiettivo fondamentale: dimostrare che PEE può recuperare e riutilizzare conoscenza scientifica pertinente attraverso il significato, sia partendo da un bisogno sia partendo da una categoria, senza aumentare ipotesi inventate, interpretazioni scorrette o decisioni ingiustificate.

La vettorializzazione è una candidata architetturale prioritaria, non una capacità da dichiarare valida prima degli esperimenti.

Perché questa impostazione è importante

Il salto che stiamo cercando di compiere è significativo:

Finora: PEE cerca parole e concetti associati a una categoria, tentando successivamente di ricostruire il bisogno.

Obiettivo: PEE comprende la richiesta, recupera semanticamente conoscenze pertinenti, attraversa bisogni e categorie, verifica i collegamenti scientifici e individua le strategie appropriate.

E questo deve funzionare anche nel verso opposto, quando si parte direttamente da un prodotto.

Non considero però gli embeddings una soluzione magica. Se una relazione scientifica è stata estratta erroneamente, il recupero vettoriale potrebbe trovarla benissimo e restituire comunque una conclusione sbagliata. Ecco perché il controllo scientifico è parte integrante dell’esperimento.

Questa è l’autorizzazione consolidata che darei a Claude. Non aggiungerei altri requisiti mentre lavora: il prompt contempla già conoscenza bidirezionale, vettorializzazione, dipendenze, costi, fonti, sicurezza, validazione e condizioni di arresto.
