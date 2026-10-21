# G1 annotation guide: goal-first reference for shopping messages

You annotate short messages that people send to a home-appliance adviser (PEE). PEE should start from the person's need
or problem, not from a product category. You see only the message and PEE's knowledge catalogue
(`knowledge-catalogue.json`). You never see PEE's output.

**Purpose.** For each message, record what a careful, scientifically minded adviser would understand and consider.

**What you must not do.**
- Do not guess what PEE will do.
- Do not invent product facts.

## Fields (one JSON object per message)

| Field | Content |
|---|---|
| `id` | the message id |
| `objects` | Every product or thing the message mentions: `{text, family, role}`. `family` is a catalogue family id (`family:dehumidifiers`) or `other:<short name>`. `role` is one of: `requested` (they want to obtain it), `owned` (they have it), `context` (part of the situation: a room, a wall, a pet), `alternative` (they weigh it as an option), `rejected` (they rule it out). |
| `expressed` | What the person states explicitly: `goals` (list of short phrases), `constraints` (list of `{kind, text}`; kind: `budget`, `size`, `noise`, `energy`, `time`, `other`). Copy only what is said; nothing inferred. |
| `strategies` | The ways an expert would consider to meet the need, best first: `{id, kind, strength, why}`. `id` is a catalogue id (family or strategy) or `free:<short name>` for anything outside the catalogue (a product family, a repair, a habit change, a service, a combination). `kind` is `purchase` or `no_purchase`. `strength` is `primary` (what an expert would consider first) or `secondary` (reasonable under some conditions). Include no-purchase strategies whenever an expert would. |
| `unjustified` | Catalogue entries that a superficial reading might suggest but that do not address the need, each with a one-line `why`. |
| `categoryNeeded` | `named` (the person asks for a product family), `to_discover` (a product is probably part of the answer but the person has not named it), `not_yet` (the need should be clarified or a no-purchase step comes first), or `none` (no product category is appropriate: vague, gift without hints, information only, nothing fits). |
| `sufficient` | `true` if an adviser could reasonably proceed with the primary strategy now, `false` if a genuine uncertainty must be resolved first, `nothing_fits` if no strategy in or out of the catalogue fits. |
| `userOnlyUncertainty` | The single most important thing that **only the person** can tell (their room, what they own, what they tried, a priority), or `none`. Knowledge PEE could look up is not a user-only uncertainty. |
| `outsideCatalogue` | `true` if the primary strategy is not in the catalogue, `false` otherwise. |
| `notes` | Optional. |

## Rules

1. **Judge the need, not the wording.**
   - "Black spots on the bathroom ceiling" is a damp and mould problem, even though "mould" is not written.
   - A product mentioned as owned or as context is not requested.
2. **Prefer the expert's first step.** If the usual first step needs no purchase (ventilation, repair, a habit, a
   setting, using what they own), make it `primary` and mark the products as `secondary`.
3. **Several strategies are normal.** List each one that an expert would mention, up to 5.
4. **Leave `unjustified` empty when nothing tempting is wrong.**
5. **Be literal in `expressed`.** "Under £200" is a budget. "It's for a small flat" is a size constraint only if the
   person links it to the product.
6. **Annotate each message on its own.** Do not compare messages.

Output: a JSON file `{"annotator": "<A1|A2>", "items": [ ... ]}`.
