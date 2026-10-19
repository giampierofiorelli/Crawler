# S87d — Observation contract v0.2, first step: types, shapes, read-only adapters and what existing data carries

**Owner decision (verbatim).** "io direi di procedere così come ti hai proposto ... se te ritieni di aver ragione io ti do
l'ok". Claude agreed with all four reviewer objections; contract v0.2 is
`docs/plans/s87c-observation-contract-v0.2.md`, and this is its §6 step 1.

**Scope.** Shadow only:
- no store write (the store is opened read-only);
- no change to any operational reader;
- no migration;
- the 206 answers are unchanged by construction: a test asserts that no module imports the contract.

**Kind:** representation and evaluation. **Maturity:** implemented in shadow.

## What was built

- **`src/observation_contract.ts`.** The v0.2 record has a single shape for quantitative, qualitative and comparative
  results. Each slot is stated (with evidence), inferred (naming its rule) or unknown.
  - **Nine declarative shapes** (SHACL-style: id, path, severity, message), each with a structured report:
    - one result form;
    - a unit with every value;
    - a basis for extensive quantities;
    - every inferred slot names its rule;
    - a declaration is never an independent test;
    - and the subject and judgement checks.
  - **Read-only adapters** for `test_measurements265`, `qualitative_observations270`, `comparative_results271` and
    `declarations`. Text declarations become qualitative results on a nominal scale; I-ADOPT 1.1 defines a property as
    "a quantity or a quality".
- **`scripts/s87d-contract-coverage.mjs`.** It measures, per table and slot, the stated, inferred and unknown counts and
  the shape findings, and checks whether the private qualitative gold can be represented.
- **`tests/s87d_observation_contract.test.ts`.** Four tests. Full suite: 4,864 passed.

## What the existing data carries (live store, read-only; `evaluation/s87d/contract-coverage-live.json`)

| Table | Rows | Property | Object | Basis | Constraints | Procedure | Uncertainty | Conforming |
|---|---|---|---|---|---|---|---|---|
| test_measurements265 | 12 | **0%** | 0% | 0% | 83% | 33% | 0% | 12 |
| qualitative_observations270 | 9 | 100% | 100% | — | 0% | 0% | 0% | 9 |
| comparative_results271 | 87 | 100% | 100% | 100% (inferred) | 100% | 100% | 0% | 87 |
| declarations | 2,385 | 100% | 1% | 0% | 0% | 0% | 0% | 2,385 |

On the S80 store copy (96 test rows; `contract-coverage-s80copy.json`) the test table looks the same: property 0%,
constraints 11%.

**Qualitative gold** (310 judgements, 6 categories, Phase269–272 and Step 1D-B): `qualitative_observations270` can admit
**63** of them, all air fryers. The contract admits **310**.

## What this shows

1. **The table built for independent test results does not record what was measured.** `dimension` is
   `not_established` in every row (12 of 12 live, 96 of 96 in the S80 copy). The S87b census found this as a loss of the
   measurand words; here it shows as a field the contract cannot fill from storage.
2. **The richest representation is the narrowest.** `comparative_results271` fills property, object, basis, constraints
   and procedure, but its schema admits only cooking appliances and three measurands.
3. **Qualitative judgements outside air fryers cannot be stored.** Objection A was right, and the schema is the cause.
4. **No table records uncertainty or the statistic.** Basis is present only where the comparative experiment implies it.
5. **Every row of every table conforms to the contract.** The contract can hold all existing data, so a later migration
   can be additive: nothing that exists is lost.

## Next (each needs the owner's decision, per the review)

- **Enrichment in shadow.** Fill the unknown slots from the reading context and the knowledge, as inferred with named
  rules, and measure per group. This includes the S87b structural classifier as one labelling function among several.
- **The knowledge lifecycle states** on the 218 taught items (§4 of the contract).
- **The condition-relevance knowledge** (defining, influencing, irrelevant), seeded from the 81 `requires_condition`
  relations.
- **Only then one additive store migration,** a general observation table alongside the existing ones, with readers
  moved one at a time.
