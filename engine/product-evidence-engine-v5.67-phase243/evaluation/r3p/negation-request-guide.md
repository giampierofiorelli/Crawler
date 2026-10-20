# R3-P negation request guide (written before annotation; preregistration evaluation/r3p/preregistration.json)

Annotate the limits exactly as in `evaluation/s103/request-annotation-guide.md` (unchanged; read it first). Then add the
stances below. You see only the messages and the two guides; you must not read or run any code, test, rule file or system
output. Decide by what a careful human adviser would understand.

## Negation and limits (reminders, not new rules)

- Read what the shopper accepts. "Nothing over 6 L" accepts 6 L and less: `side: max`, `closure: inclusive`. "Not less than
  6 L": `side: min`, `inclusive`. "More than 6 L": `min`, `strict`.
- A negated need is not a requirement: "I don't need more than 6 L" says 6 L would be enough; it does not forbid more.
  Annotate it with `side: max`, `kind: preference` and `handling: report`, and say why in `note`, unless the message makes a
  real upper limit clear elsewhere.
- Negation of something else in the sentence ("I'm not sure, but at least 4 litres") does not change the limit.

## Stances (new field)

For each message, list the product aspects the shopper expresses an attitude about, other than the numeric limits:
`{"aspect": "<short words, e.g. noise, wifi, weight, price, size, colour>", "stance": "wanted" | "required" |
"indifferent" | "rejected", "text": "<exact words>"}`.
- `required`: must have ("it has to be quiet"); `wanted`: would like ("quiet would be nice");
- `indifferent`: does not matter to them ("noise doesn't bother me", "not fussed about wifi");
- `rejected`: they do not want it ("I don't want wifi", "no touchscreen").

## Output

`{"requests":[{"id":"n01","limits":[...S103 fields...],"stances":[...]}, ...]}` with every message, in order.
