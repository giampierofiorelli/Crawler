# N1 L1 relation annotation guide (written before annotation; preregistration `evaluation/n1/preregistration.json`)

You annotate what single rows of expert teaching tables assert. Each row comes from a table in a research document about
a product category (televisions, dehumidifiers, speakers, soundbars, robot floor cleaners). You see only the rows
(`l1-annotation-input.json`: per row the category, the two nearest headings, the column headers and the row's cells) and
this guide. You must not read or run any code, test, rule file, store, package or system output. Decide as a careful,
scientifically literate reader would, without inventing anything.

Columns are numbered from 0 in the order of `header` (and `cells`).

## For each row

- `identifierColumns`: the column(s) whose cell names what the row is about (its subject: a situation, need, task, claim,
  property or product type). Usually one; may be empty for a row without a subject column.
- `columnTypes`: one type per column, from: `situation` (what the user faces or does), `need` (a goal or outcome the user
  wants), `function` (a product feature, mechanism, setting or design choice), `property` (a measurable characteristic or
  performance quantity), `method` (a test, measurement, metric, check or verification), `evidence` (a source, study,
  standard or result that supports something), `condition` (when, under which circumstances, a limit of applicability),
  `caveat` (a warning, misconception, invalid shortcut, risk or exception), `alternative` (another option or remedy),
  `identifier` (a code, id or label only), `value` (a number or rating only), `other`.
- `links`: the relations the row asserts between its columns, each `{"from": i, "to": j, "kind": "...", "qualifiers": [k, ...]}`.
  Kinds (direction matters):
  - `relevant_to`: column `from` is a situation, need or outcome; column `to` is a property, criterion or factor that
    matters for it (it bears on it, determines it, or must be considered for it).
  - `addressed_by`: column `from` is a situation, problem or need; column `to` is a product function, setting, design or
    action that addresses it (solves it, serves it, mitigates it).
  - `assessed_by`: column `from` is a property, outcome, need or claim; column `to` is the method, test, metric, check or
    evidence by which it is verified or measured.
  - `qualified_by`: column `to` qualifies column `from` itself (a condition, caveat or limit that applies to the subject
    as a whole), used only when no link from the subject exists for the qualifier to attach to.
  - `alternative_of`: column `to` is an alternative, substitute or competing option to column `from`.
  - `qualifiers`: the condition or caveat columns that qualify THIS link (it holds only under them, or they warn about it).
    Attach each qualifier to the link it qualifies, not to every link.
- A column may take part in several links. Do not link two columns only because they share the row: link them only when
  the row (read with its headers and headings) asserts the relation.
- `noRelation`: true when the row asserts no relation between columns (for example a planning, inventory, glossary,
  source list or bookkeeping table). Then `links` is empty.
- `notes`: one short sentence when you were unsure; otherwise empty.

Never strengthen what a row says: a relevance is not a cause, a hypothesis is not a demonstrated result, a manufacturer
claim is not a test. The link kinds above carry relevance only; if a row asserts a demonstrated causal effect, still use
the closest kind and say so in `notes`.

## Output

`{"annotator":"<label>","rows":[{"id":"...","identifierColumns":[...],"columnTypes":[...],"noRelation":false,"links":[...],"notes":""}, ...]}`
with every row, in input order.
