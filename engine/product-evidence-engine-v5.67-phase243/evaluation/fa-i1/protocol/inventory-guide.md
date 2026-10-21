# FA-I1 — Inventory guide (role U: information units, blind to the knowledge model)

You receive knowledge items: rows of owner research-package tables (with headings and column headers), stored
teaching concepts with their relations, quantity-knowledge aspects and property definitions. You do NOT see, and must
not look for, the knowledge model under test. Your inventory is the reference against which a representation is judged,
so it must capture everything the item says, independently of any schema.

For each item, list its **atomic information units**: the smallest statements that are true or false on their own.
Split a cell that says several things. Keep what the source says, not what you know; do not add outside knowledge.

Each unit: `{"u":"S001-u01","type":TYPE,"text":"a precise paraphrase","critical":[...],"where":"column header or field"}`

TYPE is one of:
- `entity` — something is named or defined (a quantity, a component, a situation, a need, a product family or subtype);
- `relation` — something stands in a relation to something else (causes, indicates, serves, requires, measures, is part of, is a kind of, is better/worse for);
- `condition` — a condition under which a statement holds (if/when/only/at least/below/for X);
- `quantity` — a number with its unit and what it quantifies (or a range, a threshold);
- `qualitative` — a qualitative observation or judgement (crisp, harsh, pleasant);
- `strategy` — an action a user can take (including NOT buying, maintaining, ventilating, changing a setting);
- `contraindication` — when something must not be used, is unsuitable, or is a hard stop; say whether it is absolute or can be overcome;
- `negation` — the source says something does NOT hold / is NOT a substitute / is NOT sufficient;
- `method` — how something was measured or tested, with its conditions;
- `provenance` — who or what states it (source citation, reference code, standard, study);
- `status` — the source's own epistemic label or hedge (PROPOSED, tested, hypothesis, synthetic, "may", "likely", source-backed);
- `scope` — what the statement is about (general, a family, a subtype, one product or one tested unit);
- `modality` — necessity, sufficiency or mere possibility ("required", "enough", "can", "not sufficient");
- `identity` — a distinction the source draws between things that could be confused (X is not Y; X differs from Y).

`critical` lists which of these the unit carries, if any: `negation`, `essential_condition` (a condition without which
the statement or a recommendation fails), `identity`, `provenance`, `efficacy_status` (whether effectiveness is
demonstrated, merely asserted or hypothesised), `modality` (necessary vs sufficient vs possible). Mark a unit critical only
when losing it would change what an adviser may conclude.

Return `{"item":"S001","units":[...]}` for every item, in one JSON document `{"schema":"pee.fa-i1.inventory.v1","items":[...]}`.
