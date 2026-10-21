# FA-I1 — Encoder guide (role E: represent knowledge in the km.2 model)

You receive knowledge items and the schema `evaluation/fa-i1/schema-v2.json` (the km.2 knowledge model, a hypothesis under
test). Represent EVERYTHING each item says using the schema's typed entities, predicates and qualifiers. Do not add
outside knowledge. Do not improve the source. Represent its hedges, labels, conditions and negations exactly.

Rules:
1. **Typed content only.** `label`, `note` and passage `quote` are for humans; anything you put only there is NOT
   represented. If something cannot be expressed with the typed constructs, put it in `unrepresented` with the reason.
   Never stretch a construct to a meaning it does not have; report the gap instead.
2. **One meaning per entity.** Use an alias only for the same meaning. Different meanings are different entities; use
   `distinct_from` when the source warns against confusing them.
3. **Necessity is not sufficiency.** Use `requires_capability` for what a strategy needs (each group is required; inside a
   group any member suffices). `has_capability` modality: `necessary` = every member, `typical` = most, `possible` = some.
4. **Negation** is `asserted: "denied"`; direction of change is `effect`. "Not sufficient" = `modality: "sufficient"` with
   `asserted: "denied"`; "not a substitute for" = `substitutes_for` denied.
5. **Epistemic dimensions are separate:** `claimNature` (what kind of claim), `evidence` (source role, independence,
   method stated, support count, the source's own label VERBATIM in `sourceLabel`, and its `labelClass`), `specificity`,
   `applicability`, `review` (always `derived_unreviewed` here).
6. **Every assertion cites a passage** (an entity of type `passage` with `source`, `locator` and the `quote`), and the
   passage cites a `source` entity with its role. Owner research packages have role `owner_research_package`,
   independence `not_independent` unless the row itself reports an independent test (then the cited test source is a
   separate source entity with its own role). Store concepts: source role `assistant` for assistant-authored items, with
   their stored provenance/knowledge class as `sourceLabel`.
7. **Conditions** go on the assertion they limit, with kind, force (`essential` if the statement or recommendation fails
   without it; `modifiable` if the user could change it; `nonessential`; `unknown` if the source does not say) and stance.
8. **Observations** (a measured or reported value about an artefact) are `observation` entities with `about`, `property`,
   `value` (comparator, number, unit as given; null unit if none), `statistic`, measurement `conditions`, `method`, and
   `nature` ("measured_result" or "qualitative_observation" or "declared").
9. Ids: lower-case with a type prefix, e.g. `need:less_noise_bedroom`, `cap:remove_water_vapour`. Reuse an id within an
   item for the same entity.

Output per item: `{"item":"S001","entities":[...],"assertions":[...],"unrepresented":[{"text":"...","reason":"..."}]}`
in one JSON document `{"schema":"pee.fa-i1.encoding.v1","items":[...]}`.

Diagnostic cases additionally need a request frame per case:
`"frame":{"qtarget":[situation/need ids the user states],"qartefact":[artefact ids the user names or asks about],
"ctx":[{"ref":context id,"state":"holds|does_not_hold|unknown"}],"excluded":[ids the user rejects or negates],
"confirms":[cause ids a user fact confirms]}`.

## Example (synthetic, for format only)

```json
{"item":"X1","entities":[
 {"id":"src:pkg_ap","type":"source","role":"owner_research_package","independence":"not_independent","label":"Owner package air purifiers"},
 {"id":"psg:x1","type":"passage","source":"src:pkg_ap","locator":{"section":"3. Consumer needs (PROPOSED)","row":4,"column":"Hard-stop"},"quote":"A purifier is not a substitute for exterior-venting extraction"},
 {"id":"str:use_purifier","type":"strategy","kind":"acquire_artefact","action":"act:run_air_purifier","target":null,"label":"use an air purifier"},
 {"id":"str:ducted_extraction","type":"strategy","kind":"building_or_installation","action":"act:extract_air_outdoors","target":null,"label":"ducted extraction to outdoors"}],
 "assertions":[{"id":"x1-a1","subject":"str:use_purifier","predicate":"substitutes_for","object":"str:ducted_extraction","asserted":"denied","modality":null,"effect":null,
  "conditions":{"logic":"all","items":[]},"scope":{"level":"general","refs":[],"contexts":[]},
  "epistemic":{"claimNature":"expert_guidance","evidence":{"sourceRole":"owner_research_package","independence":"not_independent","methodStated":"no","supportCount":1,"sourceLabel":"PROPOSED","labelClass":"proposed_not_tested"},
   "specificity":"general","applicability":{"conditionsStated":"no","transfer":"unknown"},"review":"derived_unreviewed"},
  "support":[{"passage":"psg:x1"}],"counter":[],"note":""}],
 "unrepresented":[]}
```
