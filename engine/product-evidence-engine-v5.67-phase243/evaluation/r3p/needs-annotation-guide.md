# R3-P needs annotation guide (written before annotation; preregistration evaluation/r3p/preregistration.json)

You annotate what shoppers need, from their messages to a buying adviser. You see only the messages (`requests.json`), the
label list (`needs-labels.json`) and this guide. You must not read or run any code, test, rule file or system output. Decide
by what a careful, scientifically literate human adviser would understand, without inventing anything.

## Labels

`needs-labels.json` lists, per category, **outcomes** (what the shopper wants the product to achieve, e.g.
`quiet_night_operation`) and **environment** concepts (circumstances that change the advice, e.g. `cannot_plumb_constraint`,
or alternatives where buying may be unnecessary). Use a label id when it fits; otherwise write `other:<short words>`.
Coffee grinders and coffee machines: use labels of either list.

## For each message

- `category`: the label-list category it is about (`air_purifiers`, `coffee_machines`, `coffee_grinders`, `dishwashers`,
  `dehumidifiers`) or `other`.
- `needs`: each need, as `{"label": "...", "basis": "expressed" | "inferred", "text": "<the words it rests on>", "why": "..."}`.
  - `expressed`: the shopper says it, in any words ("it must be quiet at night" → `quiet_night_operation`).
  - `inferred`: the shopper does not say it, but a careful adviser would conclude it from what they describe, and you can
    say why in one sentence ("I'm a light sleeper and it's for the bedroom" → `quiet_night_operation`). Infer only what the
    message supports. Do not add needs that most buyers have but this message gives no sign of.
- `acceptable`: labels that are defensible but not necessary (an adviser could reasonably raise them; omitting them is not an
  error). Empty when none.
- `notNeeds`: aspects the shopper says do NOT matter, rejects, or negates ("noise doesn't bother me" → `noise`), as
  `{"aspect": "...", "label": "<label id if one fits, else null>", "text": "..."}`.
- `features`: product features asked for by name ("sleep mode", "auto mode", "milk frother", "wifi"), as
  `{"feature": "...", "text": "...", "outcomeItSuggests": "<label id or null>"}`. A feature is not proof of the outcome: list it
  here, and list the outcome under `needs` only if the message also gives the goal (expressed or inferred).
- `limits`: numeric limits, with the fields of `evaluation/s103/request-annotation-guide.md` (property, side, value, unit,
  closure, kind, handling). Empty when none.
- `scenarios`: situations the shopper describes as alternatives ("for weekdays… but when guests come…"), as short words.
- `questions`: what a careful adviser should ask before searching, as short phrases naming the aspect (e.g. "room size",
  "how many people", "plumbing possible?"). Empty when nothing important is missing.
- `notABuyingRequest`: true when the message is not about choosing a product (then leave the other fields empty).

## Output

`{"annotator":"<label>","requests":[{"id":"...", ...fields above...}, ...]}` with every message, in order.
