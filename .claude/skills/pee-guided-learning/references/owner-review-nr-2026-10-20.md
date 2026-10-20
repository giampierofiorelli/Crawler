# Owner review of the NR needs-reasoning research (2026-10-20)

Received after commit ac110ad (`docs/plans/needs-reasoning-research.md`). Preserved verbatim (Italian), followed by a
fact note.

---

Ho esaminato direttamente il documento , pubblicato nel commit ac110ad.

La ricerca ha individuato un problema architetturale concreto che potrebbe spiegare una parte delle difficoltà di PEE nella comprensione dei bisogni. E soprattutto propone di affrontarlo recuperando conoscenze e meccanismi già esistenti.

1. La scoperta fondamentale

Il dato che considero più significativo è questo:

* 284 concetti di categoria, tra cui 55 risultati (outcome).
* 200 relazioni tipizzate, ma nessuna collega direttamente una situazione dell'utente a un risultato desiderato.
* 237 dichiarazioni bears_on_outcome, ancora non revisionate.
* Numerosi meccanismi di ragionamento distribuiti in moduli precedenti, non collegati al percorso attuale della richiesta.

Questo suggerisce che PEE ha già buona parte degli elementi necessari, ma non dispone ancora di un collegamento affidabile per utilizzarli insieme.

La relazione proposta activates potrebbe colmare una parte di questa lacuna.

Per esempio:

Situazione dell'utente

Persona sensibile al rumore, utilizzo notturno

Relazione tipizzata activates

Risultato potenzialmente rilevante

Funzionamento che non disturbi il sonno

Conseguenze per la ricerca

Esaminare rumore, condizioni d'uso e prestazioni effettive

La relazione non dimostra che l'utente abbia quel bisogno. Permette di generare un'ipotesi giustificata da esaminare.

2. Tre aspetti che terrei sotto osservazione

Il primo riguarda la qualità della conoscenza. Una relazione nuova, per quanto ben strutturata, non diventa affidabile soltanto perché deriva da dichiarazioni già presenti nel database. Le 6.118 dichiarazioni scientifiche risultano ancora non revisionate, secondo l'audit. N1 dovrà quindi dimostrare che sa derivare relazioni corrette, non semplicemente generarne molte.

Il secondo riguarda le ipotesi multiple. Concordo con l'idea di superare il limite artificiale di una sola inferenza per richiesta. Ma l'esperimento precedente aveva già prodotto sette inferenze ingiustificate su dodici. Consentirne diverse potrebbe peggiorare il problema. Prima di modificare quel limite, bisogna validare il modo in cui PEE seleziona, smentisce e mantiene in sospeso le ipotesi.

Il terzo riguarda il concetto di risultato dimostrato. La ricerca distingue correttamente funzioni, comportamento e prestazioni. Aggiungerei una cautela: anche una misurazione reale non dimostra automaticamente che un prodotto soddisfi un bisogno. Contano metodo, condizioni, soglie pertinenti e trasferibilità al contesto dell'utente. Analogamente, una previsione fisica ben validata può contribuire alla valutazione, purché non venga presentata come misura diretta.

3. Come giudico la sequenza N0–N3

| Fase proposta | Giudizio |
|---|---|
| N0 — Consolidare i modelli esistenti | Priorità alta. Prima inventariare le equivalenze e le incompatibilità |
| N1 — Relazioni activates | Promettente, ma la validazione scientifica delle relazioni è indispensabile |
| N2 — Ipotesi multiple | Architetturalmente sensato, da misurare contro i falsi positivi |
| N3 — Valutazione indipendente | Necessaria; una categoria nuova costituisce una prima prova di trasferimento, non una dimostrazione di generalità |

C'è anche un punto positivo nella metodologia: Claude ha documentato il grado di verifica delle 130 fonti, dichiarando 55 letture integrali e i limiti delle altre. I risultati bibliografici sono quindi più trasparenti di una semplice raccolta di citazioni, pur restando una ricerca condotta da agenti e non una verifica indipendente da parte mia.

4. La decisione che prenderei ora

Non autorizzerei ancora N0–N3 come sviluppo. Aspetterei il risultato del pilota congelato.

Il documento scientifico è completo come proposta, ma lo stesso documento riconosce che non è stata ancora dimostrata la capacità di derivare correttamente le nuove relazioni dalla conoscenza esistente.

Quando avremo i risultati A/B/C-lite potremo identificare quali problemi derivano da:

* Riconoscimento insufficiente del linguaggio.
* Relazioni scientifiche mancanti o scorrette.
* Selezione sbagliata fra bisogni plausibili.
* Utilizzo incompleto dei moduli già sviluppati.

È importante non confondere questi problemi, perché richiedono interventi differenti.

C'è infine un principio che vorrei preservare nel futuro apprendimento autonomo di PEE: quando scopre una relazione scientifica valida, il sistema deve poterla riutilizzare in nuove categorie quando le condizioni sono applicabili, senza doverla riscrivere per ogni prodotto o formulazione dell'utente.

Questa è ancora una capacità da dimostrare. Ma la ricerca appena conclusa fornisce una base progettuale concreta per tentare di realizzarla.

Per adesso lascerei Claude completare la raccolta delle richieste reali all'orario previsto. Non serve un nuovo prompt e non dobbiamo modificare né la ricerca appena pubblicata né il pilota.

Il prossimo rapporto sperimentale ci permetterà di scegliere la sequenza di sviluppo sulla base degli errori effettivamente osservati.

---

## Fact note (Claude, from the committed files)

The "sette inferenze ingiustificate su dodici" refers to the R3-P stage 2 development run
(`evaluation/r3p/needs-dev-stage2-final.json`). That file records arm B with 13 inferred needs, of which 6 matched the
development labels and 7 did not. These are development figures on spent requests, after tuning, not the sealed
first run. The owner's point stands with these counts: 7 of the 13 inferences lacked a matching label.

## Decisions taken (recorded in `decisions-and-supersessions.md`, row NR-review)

- N0–N3 are **not** authorised as development. The choice of sequence waits for the R3-P first runs (A/B/C-lite).
- The R3-P report must separate the causes of failures into four classes:
  - insufficient language recognition;
  - missing or incorrect scientific relations;
  - wrong selection among plausible needs;
  - incomplete use of existing modules.
- Cautions for any later work:
  - N1 must show it derives *correct* relations from the unreviewed statements, not many;
  - the one-inference cap is not lifted before selection, defeat and suspension of hypotheses are validated against
    false positives;
  - a real measurement does not by itself show a product meets a need (method, conditions, relevant thresholds and
    transfer to the user's context decide);
  - a validated physical prediction may contribute but is never presented as a direct measurement;
  - one new category is a first transfer test, not a proof of generality.
- Principle for future autonomous learning: a validated scientific relation is reusable in new categories when its
  conditions apply, without being rewritten per product or per user wording (still to be demonstrated).
- The NR research document and the frozen pilot are not modified. No new prompt; the real-request collection resumes
  at the scheduled time.
