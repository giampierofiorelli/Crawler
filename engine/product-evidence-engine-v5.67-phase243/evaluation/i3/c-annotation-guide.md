# Third increment C: annotation guide for buying messages (written before annotation; `evaluation/i3/preregistration.json`)

You annotate what a careful, scientifically literate buying adviser would understand from each shopper message, before
recommending anything. You see only the messages (`requests.json`), the family list below and this guide. Do not read or
run any code, rule, store or system output. Never invent: annotate only what the message supports.

## Families

Use these ids when one fits, otherwise `other:<short words>` (e.g. `other:humidifier`, `other:fan`, `other:ventilation
work`). Use `no_purchase` for a remedy that needs no product (opening windows, cleaning, a setting on something owned).

air_fryers, coffee_machines, coffee_grinders, toasters, toaster_ovens, kettles, dishwashers, air_purifiers, televisions,
dehumidifiers, blenders, deep_fryers, rice_cookers, steam_cookers, pressure_cookers, food_processors, stand_mixers,
tumble_dryers

## For each message

- `objects`: every product, appliance or object the message mentions, with
  `{"text": "<words>", "family": "<id or other:...>", "role": "requested" | "owned" | "context" | "alternative" | "rejected"}`.
  - `requested`: what the shopper asks to buy or choose.
  - `owned`: something they have now (including what they want to replace).
  - `context`: mentioned only as circumstance ("next to the fridge", "my baby's cot").
  - `alternative`: an option they are weighing.
  - `rejected`: something they rule out.
- `type`: `named` (a product family is requested by name), `problem` (only a problem, situation or goal is described), or
  `mixed` (both, or the requested object is unclear from what is named).
- `goals`: what the shopper wants to achieve, in short phrases using their meaning, not their words ("drier bedroom air",
  "quiet at night").
- `plausibleFamilies`: the families a careful adviser would consider for this message, each
  `{"family": "...", "strength": "primary" | "secondary", "why": "<one sentence>"}`.
  - `primary`: the message points to it clearly.
  - `secondary`: reasonable, but needs confirmation.
  - Include `no_purchase` when a no-buy remedy is a reasonable first step.
  - For a `named` message, the requested family is primary.
- `acceptableFamilies`: families that are defensible to mention but not necessary (omitting them is not an error).
- `unjustifiedFamilies`: families an adviser might wrongly jump to from surface words, with a short reason (e.g. the word
  "air" does not make an air purifier relevant).
- `sufficient`:
  - `true` when a careful adviser could choose ONE family to research now without asking;
  - `false` when they should first ask, or keep several options open;
  - `nothing_fits` when no family in the list or reasonable product would help, or the message is too vague to act on.
- `keyUncertainty`: when `sufficient` is not `true`, the single most important thing the adviser does not know (short
  phrase).
- `usefulQuestions`: one or two questions an adviser should ask first, the most useful first. Each question must reduce
  `keyUncertainty` or avoid a wrong conclusion. Empty when `sufficient` is `true` and nothing important is missing.
- `notes`: one sentence when unsure; otherwise empty.

## Output

`{"annotator":"<label>","requests":[{"id":"...","objects":[...],"type":"...","goals":[...],"plausibleFamilies":[...],"acceptableFamilies":[...],"unjustifiedFamilies":[...],"sufficient":true,"keyUncertainty":"","usefulQuestions":[],"notes":""}, ...]}`
with every message, in order.
