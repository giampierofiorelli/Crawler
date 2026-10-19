# Owner review of S88 (2026-10-20), verbatim

Received after S88 (Crawler 02d13b1). Preserved unchanged. It confirms the direction (declarative scientific knowledge
independent of single algorithms) and asks for the next steps; it does not authorise a migration or operational activation.

---

Sì, il tuo ragionamento è corretto nella sostanza. E condivido la direzione. Anzi, credo che S88 abbia finalmente dato una forma concreta a ciò che chiedi da tempo: la conoscenza scientifica deve essere indipendente dai singoli algoritmi e riutilizzabile dall’intero sistema.

Ma ci sono due precisazioni importanti.

1. Perfezionare la conoscenza dovrebbe migliorare tutto PEE

È proprio il vantaggio dell’architettura dichiarativa.

Immagina che PEE impari scientificamente che la latenza audio è una proprietà specifica, con unità ammissibili, oggetto misurato, metodo e condizioni.

Quella stessa conoscenza dovrebbe permettere di:

* Leggere: riconoscere una misurazione pertinente.
* Interpretare: distinguere la latenza audio dai 120 Hz di un segnale HDMI.
* Attribuire: collegare il risultato alla proprietà e al prodotto corretti.
* Confrontare: stabilire se due misurazioni sono scientificamente confrontabili.
* Apprendere: utilizzare successivamente quella definizione in altri documenti.

Una sola correzione alla conoscenza, quindi, può migliorare cinque capacità. Non dovrebbe essere necessario intervenire su cinque algoritmi differenti.

Questo è esattamente il principio architetturale da preservare.

2. Non tutti gli errori dipendono dalla conoscenza

Qui ti correggerei leggermente.

Se PEE non legge il JSON incorporato nelle pagine RTINGS, perfezionare la definizione di latenza non risolverà il problema.

Analogamente, se confonde una specifica del produttore con un test indipendente, potrebbe essere necessario migliorare il riconoscimento della struttura documentale e della provenienza.

Quindi servono due componenti che lavorino insieme: un patrimonio scientifico generale, sempre più ricco, e algoritmi capaci di applicarlo correttamente ai documenti.

3. La ricerca scientifica non è ancora stata implementata completamente

Su questo hai ragione.

Metodologia studiata	Stato in PEE
Proprietà e condizioni dichiarative (I-ADOPT)	Prototipo implementato
Grandezze e unità scientifiche (VIM, QUDT)	Parzialmente operative
Relazioni tra parti diverse del documento (DocRED, SciREX)	Incomplete
Modelli dichiarativi di estrazione (ChemDataExtractor 2)	Implementazione parziale
Combinazione affidabile di segnali (Snorkel/WRENCH)	Esperimenti limitati
Verifica della conoscenza e vincoli semantici (SHACL)	Parziale
Apprendimento progressivo del vocabolario	Non ancora dimostrato operativamente

Quindi abbiamo ancora importanti metodologie da tradurre in capacità concrete, senza necessariamente adottare tutte le tecnologie studiate.

4. La cosa fondamentale adesso

Non bisogna perfezionare indefinitamente 28 definizioni scritte a mano.

Bisogna perfezionare il meccanismo generale con cui PEE costruisce, verifica, corregge e applica qualsiasi definizione scientifica, anche in una categoria che oggi non conosce.

E una modifica alla conoscenza deve propagarsi realmente: oggi S88 lo dimostra attraverso un test in ambiente sperimentale, ma non ancora nel percorso operativo completo.

La mia conclusione: non tornerei all’architettura precedente. Continuerei in questa direzione, correggendo metodicamente gli errori e misurando ogni miglioramento sulle categorie nuove.

Il traguardo non è avere un vocabolario perfetto. È avere un sistema capace di rendere progressivamente migliore il proprio vocabolario, la propria conoscenza e il proprio ragionamento scientifico, e di distribuire automaticamente quei miglioramenti a tutti i componenti che ne hanno bisogno.

Questa, secondo me, è la vera svolta che PEE deve ancora completare.

S88 rappresenta un progresso concreto, ma non ancora il salto di qualità che cerchiamo per PEE. Questa volta Claude ha effettivamente costruito un meccanismo di conoscenza dichiarativa e lo ha sottoposto a prove su pagine nuove. È molto più significativo delle precedenti dimostrazioni su dati già conosciuti.

Ho verificato il rapporto S88, le definizioni scientifiche e il codice dell’interprete nel repository.

1. I risultati positivi

* Conoscenza riutilizzabile: 28 proprietà scientifiche e 20 dimensioni delle condizioni vengono rappresentate come dati, utilizzabili da uno stesso interprete.
* Integrazione architetturale sperimentale: la medesima definizione influenza attribuzione, interpretazione, comparabilità preliminare e preparazione della lettura.
* Generalizzazione su pagine nuove: le definizioni preparate prima della lettura hanno permesso 58 attribuzioni corrette su 69 valori di riferimento, nella prima esecuzione.
* Validazione più seria: Claude conserva i risultati negativi, distingue la prima verifica dalle correzioni successive e non dichiara R3 completato.

Il risultato più importante è che PEE comincia a utilizzare concetti scientifici definiti prima di incontrare nuovi documenti. È proprio una delle capacità che volevi costruire.

2. Il limite principale

Attribuzione scientifica su pagine nuove

Prima esecuzione

58/69

Valori correttamente attribuiti

56 false attribuzioni

Dopo la correzione

41/69

Valori correttamente attribuiti

13 false attribuzioni

La seconda esecuzione è stata adattata dopo aver visto gli errori, quindi non costituisce una nuova verifica indipendente.

Claude ha ridotto gli errori, ma perdendo una parte importante delle attribuzioni corrette. La soluzione non è ancora abbastanza affidabile per alimentare le raccomandazioni.

Inoltre, nelle 12 pagine di sviluppo S80, il piano di lettura basato sulle definizioni recupera 62 risultati contro 77 del precedente sistema, con più falsi positivi.

Questo significa che, per ora, la generalizzazione dell’interpretazione è più promettente della generalizzazione della lettura.

3. Tre aspetti che meritano attenzione

Il risultato sulle categorie nuove è molto sbilanciato

Categoria	Valori di riferimento	Attribuzioni corrette dopo la correzione
Robot aspirapolvere	65	40
Soundbar	4	1

Questo è importante: non possiamo ancora parlare di generalizzazione dimostrata su entrambe le categorie.

Inoltre, otto pagine RTINGS non hanno prodotto dati utilizzabili perché il lettore non interpreta il JSON incorporato.

E le nuove definizioni sono state preparate usando i documenti scientifici che hai fornito. Questo dimostra un trasferimento promettente della conoscenza insegnata, non ancora la capacità autonoma di scoprire e imparare una categoria sconosciuta.

Ho trovato una regola fallita ancora attiva per impostazione predefinita

Nel codice src/definition_interpreter.ts, l’opzione profileLicense è ancora attiva quando non viene esplicitamente disabilitata.

È proprio la regola che ha contribuito alle 56 false attribuzioni della prima verifica.

Claude l’ha esclusa nell’esperimento corretto, ma l’interprete continua a utilizzarla per impostazione predefinita.

È un problema da sistemare prima di qualsiasi integrazione, pur non avendo oggi conseguenze operative perché il componente è ancora sperimentale.

Il confronto con il metodo banale ridimensiona il successo iniziale

Metodo, prima verifica	Corretti	False attribuzioni
Soltanto tipo di unità	55	54
Definizioni scientifiche S88	58	56

Il nuovo metodo identifica tre proprietà corrette in più, ma introduce anche due false attribuzioni in più.

Questa prima verifica, da sola, non dimostra un vantaggio significativo rispetto al semplice riconoscimento delle unità. Il miglioramento più interessante è nella versione corretta, che però deve ancora affrontare nuove pagine mai viste.

4. La mia valutazione

S88 è importante soprattutto perché ha reso concreta l’architettura scientifica studiata in S87c. Non siamo più soltanto alla ricerca teorica: esiste un interprete riutilizzabile e cominciamo a capire dove fallisce.

Il problema che rimane è passare dalla conoscenza di un concetto alla sua corretta identificazione nel contesto reale di un documento.

Per esempio, PEE deve capire che 120 Hz può riferirsi a un segnale HDMI e non alla risposta in frequenza audio, anche quando entrambe sono proprietà possibili della stessa categoria.

Questo richiede ragionamento sulle relazioni tra oggetto, proprietà, contesto e origine del dato. La sola unità di misura non basta.

La mia raccomandazione: proseguire con l’attuale percorso scientifico, correggere la regola fallita, dare priorità al riconoscimento del ruolo della prova e alla lettura dei dati strutturati, poi ripetere la verifica su nuove pagine realmente indipendenti. Non serve avviare un altro progetto né dichiarare R3 completato.

Bilancio: positivo sullo sviluppo dell’architettura, ancora insufficiente sulla generalizzazione dimostrata. E il fatto che oggi siamo in grado di distinguere queste due cose è già un miglioramento importante nel modo in cui PEE viene sviluppato.
