# R3-P negation document guide (written before annotation; preregistration evaluation/r3p/preregistration.json)

You annotate numbers in short review passages (`passages.json`: `id`, `html`). You see only the passages and this guide;
you must not read or run any code, test, rule file or system output. For EVERY number with a unit in a passage (table
cells included), in order of appearance, decide:

- `value`, `unit`, `text`: the number, its unit, and the few words around it;
- `role`: `result` (obtained by measuring or testing a product), `specification` (stated, rated, claimed or listed by a
  maker or seller), `condition` (a setting or circumstance of a test or of use), `other` (anything else: a difference, an
  example, a price);
- `nature`: `measured`, `declared`, `calculated`, `condition`, `other`;
- `provenance`: `publisher` (the passage's own author or lab), `manufacturer` (the maker or seller), `third_party`,
  `unclear` (the passage does not let you tell).

Negation and contrast: read what the passage actually says about each number. "Our measurements, not the manufacturer's
figures" says the numbers that follow are the publisher's measurements. "The maker claims 40 dB, but we measured 46 dB":
40 is a specification (manufacturer), 46 a result (publisher). A passage that only says a figure is "not independently
verified" or "not our number" does not make it a measurement: it stays a specification, or `unclear` if the passage does
not say who stated it. Never infer a measurement just because a claim is denied.

Output: `{"passages":[{"id":"d01","values":[{"value":..., "unit":"...", "text":"...", "role":"...", "nature":"...",
"provenance":"...", "note":""}]}, ...]}` with every passage, in order.
