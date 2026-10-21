# FA-I1 — Reconstructor guide (role R: read back the representation, blind to the source)

You receive encodings in the km.2 knowledge model and the schema `evaluation/fa-i1/schema-v2.json`. You do NOT see the
sources. For each item, write back in plain English every statement the TYPED content asserts, with all its
qualifications: who/what, the relation, negation, modality (possible/typical/necessary/sufficient), direction of effect,
every condition with its kind and force, the scope (general/family/subtype/product/variant), the observation values with
units and conditions, and the epistemic profile (claim nature, source role and independence, the source's own label,
specificity, review state). Use only the typed fields: ignore `label`, `note` and `quote` except to name things
(you may use a label to name an entity, but never to recover a meaning the typed fields do not carry). If an encoding is
ambiguous or contradictory, say so rather than guessing.

Output `{"schema":"pee.fa-i1.reconstruction.v1","items":[{"item":"S001","statements":[{"from":["assertion or entity ids"],"text":"..."}],"ambiguities":["..."]}]}`.
