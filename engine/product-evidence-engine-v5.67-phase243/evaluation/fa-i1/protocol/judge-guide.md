# FA-I1 — Judge guide (roles J1, J2: fidelity of representation and reconstruction)

You receive, per item: the source item, its information units (inventory U), the km.2 encoding, the validator's
messages, the blind reconstruction, and the schema `evaluation/fa-i1/schema-v2.json`. Judge every unit separately. The
question is whether the MODEL can hold the knowledge faithfully, and whether this encoding did.

Per unit return:
- `expressible`: `yes` | `partial` | `no` — could the schema's TYPED constructs (not label/note/quote) express this unit
  faithfully, whatever the encoder did? Decide by trying: if you can write the fragment, it is expressible.
- `encoded`: `faithful` | `distorted` | `missing` | `free_text_only` — what this encoding did with it. Distorted = present
  but with a changed meaning (wrong negation, condition, modality, scope, identity, nature or label).
- `reconstructed`: `faithful` | `distorted` | `missing` — whether the blind reconstruction states it with the same meaning.
- `criticalLoss`: the critical aspects lost anywhere in the chain: `negation`, `essential_condition`, `identity`,
  `provenance`, `efficacy_status`, `modality`; empty if none.
- `cause`: `none` | `schema` (the schema cannot express it, or forces a distortion) | `encoding` (expressible but the encoder
  got it wrong) | `reconstruction` (encoded faithfully but read back wrongly from typed fields) | `schema_ambiguity` (the
  typed fields admit two readings, so a faithful encoding cannot be read back reliably) | `source_ambiguity` | `inventory_error`.
- `schemaGap`: when cause is schema or schema_ambiguity, the construct that is missing or ambiguous.
- `fix`: when cause is encoding, the minimal corrected fragment (entities and assertions in km.2 JSON) that expresses the
  unit; it will be validated mechanically.

Per item also: `missedUnits` (things the source says that the inventory missed, judged the same way),
`provenancePreserved` (source entity with role, passage with locator, the source's own label verbatim): `yes|partial|no`,
`epistemicCorrect` (claimNature, labelClass, specificity faithful to the source): `yes|partial|no`, and `validatorErrors`
counted as given.

Do not reward an encoding for keeping the original text in a free field. Do not redesign the schema to compensate for an
encoder's mistake: if the unit is expressible, the cause is encoding. Claude judgements are not independent scientific
validation; judge representation fidelity only, not whether the source is scientifically right.

Output `{"schema":"pee.fa-i1.judgement.v1","judge":"J1|J2","items":[{"item":"S001","units":[{"u":"S001-u01","expressible":"yes","encoded":"faithful","reconstructed":"faithful","criticalLoss":[],"cause":"none","schemaGap":null,"fix":null,"why":"one line"}],"missedUnits":[],"provenancePreserved":"yes","epistemicCorrect":"yes"}]}`.
