# Owner authorisation of a bounded semantic-model experiment (2026-10-19), verbatim

Received after §12 of `docs/plans/r3-knowledge-translation.md`. Decision S76 in `decisions-and-supersessions.md`. The
owner's Italian framing and the English authorisation are preserved below. The model card cited is a reference the
owner found; Claude did not fetch it at the time of recording.

---

La diagnosi di Claude è convincente: continuare a migliorare la ricerca dei candidati non sembra più la priorità di R3. Il problema è stabilire se due espressioni rappresentino davvero lo stesso concetto scientifico, anziché concetti semplicemente collegati.

Il dato decisivo è questo:

* 22 identità su 25 hanno già il candidato corretto fra i primi tre.
* Il sistema riesce invece a riconoscere correttamente soltanto una minoranza di quelle identità.
* La somiglianza statistica non ha risolto il problema: riconosce argomenti vicini, non necessariamente significati equivalenti.

Questo è un caso in cui prendere in considerazione un modello semantico locale ha senso. Ma distinguerei l’autorizzazione a sperimentarlo dall’autorizzazione a integrarlo stabilmente in PEE.

Ho trovato un’alternativa più leggera da valutare

Prima di adottare un LLM generativo, Claude potrebbe confrontarlo con un modello specializzato nella Natural Language Inference (NLI): verificare se un’affermazione implica un’altra, la contraddice oppure non permette di concludere nulla.

Esiste, per esempio, DeBERTa-v3-xsmall NLI⁠￼:

* 70,8 milioni di parametri, con pesi di circa 283 MB.
* Licenza Apache 2.0.
* Esecuzione locale, senza API a pagamento.
* Accuratezza dichiarata dell’87,77% sul benchmark MultiNLI, non sui problemi scientifici di PEE.

C’è un limite importante: un modello NLI non comprende automaticamente che due termini scientifici isolati siano equivalenti. Claude dovrebbe verificare se il contesto documentale gli permette di distinguere identità, gerarchia e semplice correlazione. Non è affatto garantito.

Perciò non imporrei neppure questo modello: lo proporrei come alternativa da valutare rispetto a un piccolo LLM.

La decisione che suggerisco

Autorizzerei un esperimento circoscritto con un modello semantico locale, ma non ancora la sua integrazione permanente.

Prima dell’adozione occorrerebbe dimostrare, su dati nuovi e ciechi, un recupero nettamente migliore delle identità corrette, senza promuovere relazioni soltanto correlate a identità scientifiche.

Verificherei anche memoria, tempi, licenze e costi di esecuzione: gratuito da scaricare non significa gratuito da mantenere in produzione.

Se vuoi autorizzare Claude, gli manderei soltanto questo messaggio. Nessun allegato necessario.

I authorise a bounded, shadow-only feasibility experiment with a small, permissively licensed local semantic model, without paid APIs or external research-source acquisition.

You have full autonomy to compare a lightweight NLI model with a small local LLM, or to reject both if the evidence or runtime costs do not justify them.

The objective is to validate genuine scientific concept identities and relationships, not merely improve semantic similarity. Use a genuinely fresh blind reference, preserve unresolved cases, and measure precision, recall, transfer and computational costs.

This authorises experimentation, not permanent integration, production dependencies, or changes to rankings. Do not commit model weights to the repositories.

If the approach does not demonstrate a meaningful improvement, stop that experiment and continue R3 through the other established bottlenecks, using your engineering judgement.

Il mio orientamento è quindi favorevole all’esperimento. Non vorrei però che PEE diventasse dipendente da un modello pesante quando l’obiettivo è costruire conoscenza scientifica permanente e riutilizzabile.

Il modello, se utile, dovrebbe essere uno strumento per acquisire e verificare conoscenza, non sostituire il motore deterministico che la utilizza.
