# FA-I1 — Adjudicator guide (role A)

You receive: (a) every unit a judge attributed to `schema` or `schema_ambiguity`, or marked with a critical loss; (b) every
unit on which the two blind judges disagree (on the overlap sample); with the source item, the unit, the encoding, the
reconstruction, both judgements where present, and the schema. Decide for each:
- `expressible`: yes | partial | no, and `cause` (same values as the judge guide);
- for `schema` / `schema_ambiguity`: the exact missing or ambiguous construct, and whether it is CRITICAL (negation,
  essential condition, identity, provenance, demonstrated vs hypothesised efficacy, necessity/sufficiency);
- for `encoding`: a corrected km.2 fragment proving the unit is expressible (it will be validated mechanically; a fragment
  that fails validation does not prove expressibility).
Be strict both ways: do not excuse the schema by inventing a stretched use of a construct, and do not blame the schema for
an encoder's slip. Claude adjudication is not independent scientific validation.
Output `{"schema":"pee.fa-i1.adjudication.v1","decisions":[{"key":"S001-u01","expressible":"...","cause":"...","critical":true,"schemaGap":"...","fix":null,"why":"..."}]}`.
