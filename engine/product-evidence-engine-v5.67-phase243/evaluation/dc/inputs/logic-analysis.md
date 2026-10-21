# Logic analysis for the PEE scientific universe

**Status:** design-charter input from the independent logic analyst. This is a Claude-agent analysis for
comparison, not independent validation. The only project input was `requirements.md`; everything else is general
knowledge. Requirement ids (K1…X3, cases 1–25) refer to that file.

**Thesis in one line.** The requirements call for **first-order expressivity over a reified, typed vocabulary**:

- n-ary statements with conditions;
- bounded existentials;
- counting and arithmetic;
- three-valued, skeptical non-monotonic reasoning;
- typed meta-rules over relation types and over rules.

They do **not** call for second-order semantics. The few needs that look genuinely second-order are better kept
outside the logic, as governed processes: predicate invention, consistency claims about the theory itself, and
identity of indiscernibles.

---

## 1. Expressivity requirements

### 1.1 Feature-by-feature

| Feature | Needed by | Form required | Where the assumption must hold |
|---|---|---|---|
| Universal quantification | R2 (all necessary capabilities met), K6 ("all members"), R7 | Bounded ∀ over finite, recorded sets. It is computed as ¬∃ counterexample with negation-as-failure (NAF), guarded by **existential import** | Only over sets the store declares complete for the purpose: the requirement set of a strategy, the variants of a product line |
| Existential quantification | K10 (threshold with unknown value), K12 (unknown as an object), case 12 (∃ operating point), T1 (∃ role mapping) | ∃ in rule bodies (joins). ∃ in rule heads as **labelled nulls / Skolem terms**, non-recursive | Labelled nulls never satisfy a comparison (unknown ≠ any value) |
| Counting / generalized quantifiers | K6 (all/most/some), R12 (number of *independent* sources), case 5 | Stratified aggregates: count, min, max over deduplicated original sources | Count only after the provenance-chain resolution of E2. Otherwise relays inflate counts |
| n-ary relations | K7–K10 (value + unit + basis + condition + method + subject + source + time) | Reified statement/event objects with role attributes. Binary-only triples are insufficient without reification | Everywhere: a measurement without its condition is a different, weaker claim |
| Function symbols | Derived requirements (case 12), research needs (K12), unit conversion | Skolem terms `req(need, context)` and `gap(question, subject)`, of depth ≤ 1 or weakly acyclic | Must not recurse. Otherwise termination is lost |
| Classical negation (strong ¬) | K11 (denied relations, "never", "does not address") | An explicit negative literal stored as a claim with its own evidence | World level: a ¬ claim needs support just like a positive one |
| Default negation (NAF) | R2, R9, K12, case 4 | `not known(…)`, `not verified(…)` | **Only over epistemic/store predicates, never over world predicates** (§1.3) |
| Defaults and exceptions | R10, K11 hedges ("usually"), K6 ("most") | Defeasible rules with exceptions | World generalisations and category tendencies |
| Priorities | R10 (specificity, later evidence), A5 (supersession), R3 (primary vs adjunct) | A **partial** preference relation between arguments, computed per claim type from admissibility rules. Never one total scale (E1) | Incomparable arguments must remain in conflict (R6) |
| Modalities | K3 (possible vs established cause), K11 ("may", "not always"), case 21 | Reified **epistemic status** and **quantity/modality tags** on claims. No Kripke semantics required | — |
| Epistemic "known / believed / verified" | E4, R9, K12, case 4 | Predicates over claims: `admitted`, `verified`, `contested`, `quarantined`; NAF over these | Closed world over the store's own records |
| Temporal validity | A5, K7 (protocol version and date), product revisions | **Bitemporal**: valid time (when the claim holds of the world) × transaction time (when the store believed it) | "What was believed when" = transaction-time query |
| Belief revision | A3, A5, A6, R10 | Justification-based retraction (TMS/DRed) over an append-only assertion log | No silent overwrite: supersession is a recorded relation |
| Quantifying over relations and rules | R11, A6, T1, case 23 | Over **reified relation types and rule identifiers**, which are finite individuals: first-order (§3) | Meta-rules sit in a higher stratum than the rules they govern |
| Claims about claims | E2 (relays), E1 (review state), R6, A4 | Statement reification with a `about(claim)` link. A level index prevents self-reference | Level n may refer only to levels < n |
| Uncertainty | R12, E1 | Several **separate** qualitative lattices plus **intervals** for quantities. No single number | Graded only where a source provides grading (measurement uncertainty, replicates) |
| Argumentation | R6, R10, R11, E4 | Attack types: rebut (contrary conclusion), undercut (inference not applicable), undermine (premise weak); skeptical (grounded) acceptance | Conflict yields *undecided*, which is reported |
| Arithmetic | K7, K9, case 12, case 20 | Built-ins (+, ×, comparison), unit conversion, interval arithmetic, basis conversion (per run ↔ per year) only with a declared usage-pattern assumption | Never inside recursion that can create new numbers indefinitely |
| Open vs closed world | E3, R7, R9, K12 | **Open world** for world facts; **closed world** for the store's records, the user's stated request slots and rule lifecycle states | Formal split (§1.3) |

### 1.2 Per requirement group

- **K (representation).** First-order, many-sorted vocabulary.
  - Needs n-ary reified statements and explicit strong negation.
  - Needs quantity/modality tags for "all, most, some, never, not always, usually, may".
  - Needs Skolem terms for unknown thresholds and research needs.
  - Needs typed lexical relations, which are a *separate sort*:
    - `alias(term, concept)`;
    - `cue(term, concept)`;
    - `pole(term, dimension, direction)`.
  - K1's opposite needs require a *dimension* sort with a direction attribute. Opposition is then a computed relation
    (same dimension, opposite direction), not a free-text antonym.
  - K13 is a distinct sort, `MethodRule`, with a lifecycle. That requirement is the main driver of §3.
- **E (epistemics).** Every object, including concepts and aliases, carries:
  - a provenance link to a passage;
  - a nature tag;
  - a position on several independent ordered dimensions (E1).

  E4's "never more than its weakest relevant support" is a **monotone ceiling**: a conclusion's position on each
  dimension is ≤ the meet of its premises' positions. This needs a lattice per dimension and a meet per derivation.
  Probability is not needed. E2 needs recursion over `reports(source, cited)` chains, which transitive closure in
  Datalog handles. E3 needs **type-disjointness axioms** over evidence types, with no promotion rule.
- **R (reasoning).**
  - R1 needs both directions over one relation set. That is a query-direction question, not a separate logic. The
    asymmetry ("one necessary capability ≠ serving") follows from R2's conjunctive requirement semantics.
  - R2 needs bounded ∀ with existential import, plus joint (AND) and alternative (OR) groups with levels.
  - R4 needs abductive candidate generation (possible causes) plus confirmation by discriminating tests. Abduction is
    bounded here: candidates come from stored `indicates` links, so no hypothesis search is required.
  - R6 and R10 need skeptical non-monotonic semantics with a three-valued outcome.
  - R11 needs meta-rules over relation types and rule kinds.
  - R12 needs intervals and qualitative grades.
- **A (acquisition).**
  - A1 needs a quarantine status that is invisible to decision rules: a layer-flow constraint.
  - A2 needs a three-valued identity: `same`, `distinct`, `undecided`. There is no equality reasoning from attribute
    similarity, so no Leibniz identity (§3).
  - A3 needs paraconsistent storage: contradictory claims coexist without explosion.
  - A5 needs bitemporality and incremental re-derivation.
  - A6 needs rules as first-class, versioned objects.
  - A7 needs a schema of "what a category must have": existential obligations whose unfilled instances become typed
    research needs (Skolem objects).
- **T (transfer).** Needs a *mapping* from a mechanism schema's roles to a new domain's entities. That is an
  existential over finite role bindings, so it is first-order. It also needs a rule that carries the schema's
  conditions and limits, and caps the epistemic status at "expected by principle".
- **V (vectors).** Similarity is outside the logic. The only logical requirement is **information-flow typing**:
  - vector outputs may enter only `candidate_*` predicates;
  - those predicates may feed only resolution and quarantine rules, never world, decision or identity rules.

### 1.3 The decisive negation rule

The requirements mix "unknown", "false" and "not stated", and the legacy failures came from conflating them. The
design should enforce syntactically:

1. A world predicate `p` may appear negated only as **strong negation** `¬p`, which is a stored or derived claim with
   evidence.
2. **NAF (`not`)** may be applied only to **epistemic or store predicates**: `known_p`, `verified`, `admitted`,
   `documented`, `stated_by_user`, `active_rule`. Each such use is read as "not (yet) known", and its consequences
   are statuses (*unknown*, *abstain*, *research need*), never world claims.

This is the logic-programming form of an epistemic specification. It makes E3 ("missing evidence is not evidence of
poor performance") a well-formedness property that a checker can verify, rather than a convention.

### 1.4 Adversarial cases → features

| Case | Decisive features |
|---|---|
| 1 purifier ≠ dehumidifier | A function is defined by a *necessary* capability (removes water vapour). A shared component or process is not sufficient. Strong ¬ on the capability |
| 2 vacuous realisation | Bounded ∀ with existential import; `documented` guard |
| 3 anecdote, not-a-substitute | Admissibility by evidence nature; `notSubstituteFor` → adjunct role; preference for a primary no-purchase remedy |
| 4 unverified level | Three-valued `meets`; NAF over `verified` only |
| 5 contradicting tests | Rebuttal with incomparable preferences → undecided; aggregation forbidden |
| 6 picture mode | Condition argument in an n-ary measurement; comparability predicate; unknown outcome |
| 7 variant transfer | Identity sort; `comparable(variant1, variant2, property)` must be established, not assumed |
| 8 carbon principle | Principle-based conclusions are capped below "demonstrated"; demonstration requires a measured result by a standard method on that artefact |
| 9 white film | Bounded abduction plus a discriminating test; user report admissible about the user's own situation |
| 10 penetrating damp | Indicators → diagnosis; strong ¬ `addresses(dehumidifier, penetrating_damp)` |
| 11 air too dry | Opposition on a dimension; exclusion propagates to artefacts; coverage gap as a Skolem research need |
| 12 one operating point | Existential over a shared setting variable (quantifier scope); arithmetic-derived requirement |
| 13 some subtypes | Quantity tag `some`; no attribution down to an unspecified member |
| 14 hypothesis plus synthetic | Status ceiling (hypothesis, synthetic) propagates; never becomes measured |
| 15 contraindication force | Typed contraindication (essential / modifiable / non-essential) with distinct effects |
| 16 relayed study | `reports` chain; independence computed on the origin |
| 17 unit vs category | Subject sort discipline; no "unit → category" rule |
| 18 synthetic value | Nature tag immutable; type-disjointness |
| 19 bagels / whisper-quiet | Lexical sorts (cue vs alias vs pole) |
| 20 per run vs per year | Basis as an argument; condition scoped to a basis; conversion needs a declared usage assumption |
| 21–23 | §5 |
| 24 abstain rule as methodology | `MethodRule` sort with lifecycle; executes only when `active` |
| 25 mechanism transfer | §5 |

---

## 2. Candidate formalisms

### 2.1 Comparison table

| Formalism | Expressivity vs needs | Decidability / complexity | Explanations | Contradiction | Node/TS feasibility |
|---|---|---|---|---|---|
| **OWL 2 EL** | Class hierarchies, existential restrictions. No n-ary, no defaults, no NAF, no arithmetic | PTime | Justifications (axiom sets) | Inconsistency is global and explosive | In-house EL saturation is feasible (small). Value limited to taxonomy |
| **OWL 2 QL** | Query rewriting over taxonomies | AC⁰ data complexity | Weak | Same | Feasible but irrelevant (no database-scale need) |
| **OWL 2 RL** | Rule-expressible OWL fragment; disjointness, property chains | PTime; encodable in Datalog | Rule traces | Inconsistency flags only | **Directly encodable as Datalog rules.** Recommended as the vocabulary-axiom subset |
| **OWL 2 DL** (SROIQ) | Rich class logic, open world, cardinalities | N2ExpTime-complete | Justifications, costly | Explosive | Needs a Java reasoner (HermiT, Pellet): impractical |
| **Datalog + stratified negation + aggregates** | Recursion (provenance chains, closure), NAF, counting. No defaults or conflict semantics on its own | PTime data complexity | Proof trees / why-provenance are natural | NAF cycles are disallowed by stratification | **In-house: semi-naive evaluation, ~1–2k LOC** |
| **Datalog with well-founded semantics (WFS)** | Adds three-valued handling of negative cycles. Undefined = undecided | PTime data complexity (alternating fixpoint) | Proof trees plus "undefined because of cycle X" | Mutual attack → undefined (skeptical) | **In-house: alternating fixpoint on top of the evaluator** |
| **Datalog± / existential rules** | ∃ in heads (labelled nulls) for unknown thresholds, research needs, required objects | Undecidable in general; decidable for weakly acyclic, guarded and sticky classes | Chase traces | Constraints as denial rules | Bounded chase in-house is feasible **if restricted to weakly acyclic** (checked statically). Nemo/Vadalog are external |
| **ASP** (clingo) with weak constraints | Defaults, choice, optimisation, cautious/brave reasoning, strong negation | NP / Σ₂ᵖ; grounding blow-up with arithmetic | Weak natively (xclingo exists) | No stable model, or several; cautious = skeptical | External solver (clingo C++, or clingo-wasm in Node at several MB). Feasible but a substantial dependency |
| **Defeasible logic** (Nute/Antoniou DL, with priorities) | Strict, defeasible and defeater rules, superiority relation | **Linear** in theory size (propositional after grounding) | Proof tags (+∂/−∂) are explicit | Ambiguity blocking yields "not provable" on both sides | In-house small (≤1k LOC). Preferences are a single superiority relation, so multi-dimensional criteria must be compiled into it |
| **Structured argumentation** (ASPIC+, ABA, DeLP) | Rebut, undercut, undermine; preferences (last-link / weakest-link); claims about inference applicability | Grounded semantics is PTime in the argumentation framework, but argument construction can be exponential. ABA flat-grounded corresponds to WFS of a logic program | **Best**: an argument *is* the explanation, including why it was defeated | Undecided arguments, reported (R6) | In-house via a **WFS translation** (grounded = WFS for flat ABA), or bounded argument construction |
| **ProbLog / LPMLN** | Probabilistic facts and rules; inference by knowledge compilation | #P-hard; compilation is exponential in the worst case | Probability plus proofs | Absorbed into probabilities | Python/C toolchains: impractical. Also contradicts R12 (fabricated precision) |
| **Markov logic** | Weighted first-order formulas | #P; approximate MCMC | Poor | Soft, averaged: **violates R6** | Impractical, and conceptually wrong here |
| **Probabilistic soft logic** | Hinge-loss MRF on [0,1] | Convex, PTime | Poor | Averaged into soft truth: violates R6 | Java: impractical. Conceptually wrong for decisions |
| **HiLog / reification syntax** | Higher-order *syntax* (variables in predicate position) with **first-order semantics** | Same as the underlying engine | As the engine | As the engine | Free: a modelling convention (relation types and rules as terms) |
| **Full SOL / HOL, interactive provers** (Lean, Isabelle, Coq) | Everything, including Leibniz identity, induction principles and arbitrary quantification over predicates | SOL (standard semantics) has no complete proof system; validity is not even semi-decidable | Machine proofs, unreadable to the owner | Explosive (classical) | **Impractical** (heavy, non-Node, human proof engineering) |
| **JTMS** | Justification graph; in/out labels; dependency-directed retraction | Linear-ish per update | Justifications = explanations | Contradiction nodes → backtracking | **In-house, small.** Equivalent to keeping Datalog provenance plus DRed |
| **ATMS** | Labels = minimal assumption environments; many contexts at once | Labels can be exponential | Environments explain dependence on conditions | Nogoods record inconsistent assumption sets | In-house feasible at small scale. Useful for conditions (picture mode A/B, room scenarios) and "under which assumptions does this hold" |
| **AGM belief revision** | Rationality postulates for contraction and revision of belief *sets* | Revision of logically closed sets is intractable in general | Weak | Resolves conflicts by choosing (entrenchment): **violates R6 if applied to evidence** | Postulates useful as **test properties**, not as a mechanism. Base revision with recorded supersession is the operational form |
| **Temporal / bitemporal model** | Valid time × transaction time on every assertion | Trivial (interval columns) | Time-travel queries | Supersession explicit | SQLite already fits |
| **Vector–symbolic hybrid** | Embeddings for retrieval, alias candidates, request slotting | — | Similarity scores are not explanations | n/a | Existing CPU model. **Allowed only as a candidate generator** |

### 2.2 Reading of the comparison

**Description logics.** They answer a narrower question than PEE asks. Their strength is classification under the
open-world assumption (OWA). PEE needs:

- n-ary conditioned statements;
- non-monotonic exceptions;
- epistemic NAF;
- arithmetic;
- paraconsistent storage.

DLs provide none of these natively. OWL's global inconsistency is the opposite of R6: one conflicting pair of tests
would make the knowledge base trivial. The useful part is OWL 2 RL, as a *pattern catalogue* of vocabulary axioms
expressed as Datalog rules:

- subclass;
- domain and range;
- disjointness (e.g. evidence types are pairwise disjoint);
- inverse relations;
- property chains.

**Datalog family.** It fits the bulk of the work:

- E2 provenance chains;
- K6 category membership;
- R1 traversal in both directions;
- R2 requirement satisfaction;
- A5 re-derivation.

Data complexity is polynomial, proofs are trees, and an in-house evaluator is small. Stratified negation alone is too
weak for R6 and R10, because conflicting defaults create negative cycles that stratification forbids. **WFS** is the
minimal extension. Its third truth value (*undefined*) is exactly the "withhold and report" status. Datalog± adds
value invention, which is needed only for Skolem objects (unknown thresholds, derived requirements, research needs).
Restricted to weakly acyclic rules, which a static check verifies, termination is preserved.

**ASP** is more expressive than needed for the core. Its distinctive strengths are choice and optimisation (weak
constraints), which matter for *selecting a shortlist* under preferences, not for *establishing what is supported*.
Stable-model semantics has a known pitfall here:

- an odd negative loop makes the program have no answer set;
- conflicts produce several answer sets, and the system must then be told to reason cautiously.

Both are manageable but invite errors. ASP is the strongest alternative engine (§4.3), at the price of an external
solver and weaker explanations.

**Defeasible logic versus structured argumentation.** Both satisfy R10 at low cost. Argumentation is preferred for
one reason: **undercutting**. R11's meta-principles are not rebuttals. "Correlation does not establish causation"
does not assert ¬cause; it says the inference from association to cause is not licensed. Only undercutters express
that without asserting a falsehood. DL's defeaters approximate undercut, but its single superiority relation cannot
naturally carry E1's several unordered dimensions.

ASPIC+ handles these with argument orderings. Grounded semantics is skeptical, so incomparable conflicts stay
undecided, which is R6. ABA and ASPIC+ under grounded semantics compile to a normal logic program evaluated under
WFS. So **one in-house engine (Datalog + WFS) can carry both the strict and the defeasible layer**, provided argument
construction is bounded by grounding the finite rule instances.

**Probabilistic logics** fail three requirements at once:

- R12 forbids fabricated precision;
- R6 forbids resolving conflict by weighting;
- E1 forbids a single strength scale.

They also need external toolchains. Interval and qualitative representations meet R12 without these defects. A
probability can appear as *data*, when a source reports one (e.g. a measured failure rate with a confidence
interval), stored as an interval-valued attribute and never as the system's degree of belief.

**Belief revision.** AGM contraction and revision presuppose that the system must *choose* when inputs conflict. PEE's
evidence layer must not choose (R6, A3). It keeps both sides. What PEE revises is the set of *active rules and admitted
claims* through recorded acts (supersede, retract, retire), with derivations recomputed. That is base revision plus a
TMS, with AGM postulates (success, inclusion, vacuity, extensionality) reused as *tests* of the governance layer.

**Full SOL** is discussed in §3.

**Vector hybrids.** Vectors are allowed as a candidate generator under a type discipline (§4.2). Neuro-symbolic
systems that learn rule weights by gradient conflate similarity with support and are excluded.

---

## 3. The second-order question

### 3.1 Needs that look second-order

| Need | Surface form | Reified first-order form | Verdict |
|---|---|---|---|
| R11 / case 23 "correlation does not establish causation" | ∀R (Causal(R) → ∀e (Assoc(e) → ¬Establishes(e, R(x,y)))) | Relation types are individuals: `relType(c, r)`, `causal(r)`, `nature(e, statistical_association)`. Meta-rule: `undercut(arg) :- concludes(arg,c), relType(c,r), causal(r), lastStep(arg,s), basis(s,e), nature(e,statistical_association), not causalIdentification(c)` | **First-order over reified relation types suffices** |
| Admissibility: which evidence establishes which claim type | ∀ claim types T, ∀ evidence types E: Admits(T,E) → … | `admits(claimType, evidenceNature, minConditions)` as a table; `establishes` is defined by a single rule that joins it | FO; it is even data, not rules |
| Rule reliability (R11, A6) | ∀ rule ρ: Reliable(ρ) → conclusions(ρ) inherit… | Rules have ids; derivations record rule ids (proof terms); `reliability(ruleId, grade)` enters the ceiling meet | FO with provenance. Requires rules as terms (HiLog-style), which a reified rule table gives |
| "A hypothesis never yields more than a hypothesised conclusion" | ∀ derivations d ∀ premises p ∈ d … | Status ceiling = meet over premises, enforced by the engine on every derivation | FO, and in fact an engine **invariant**, not a rule |
| "A result does not transfer without justification" | ∀ properties P ∀ x,y: P(x) ∧ ¬Justified(x,y,P) → ¬Infer P(y) | `transfers(obs, subj2) :- comparable(subj(obs), subj2, prop(obs), cond(obs))`; there is no other rule deriving an observation about subj2 | FO. The "∀P" ranges over property *individuals* |
| Transfer of a mechanism schema (T1, case 25) | ∃ mapping σ from roles to entities such that Schema[σ] holds | Schemas are individuals with role slots; `binds(inst, role, entity)`; applicability = all role constraints satisfied by bound entities (bounded ∀ over roles) | FO with bounded ∃ over finite role bindings |
| Meta-principles about evidence types (E3) | ∀ evidence types E1 ≠ E2: ¬Promote(E1,E2) | Disjointness of a finite sort plus absence of any promoting rule (a static check on the rule base) | FO plus a **syntactic check** |

### 3.2 Why reification suffices: the semantic point

Reification gives **Henkin-style** quantification over relations. Variables range over the relation types and rules
*named in the vocabulary*, not over all subsets of the domain. For PEE this restriction is a feature:

- the meta-principles are about the relation types the universe recognises (causal, diagnostic, enabling, …);
- the evidence types are those the policy lists;
- the rules are those that went through the lifecycle.

Admitting a new relation type is a governed act (A6), not something a quantifier should range over silently.
Henkin-semantics SOL is equivalent to many-sorted FOL, so the price of reification is nil in expressivity relative
to what the governance layer will allow anyway. In return PEE keeps:

- completeness;
- polynomial evaluation;
- explanation by proof trees.

Two technical safeguards are required.

1. **Typed reification.** Reified relation-type terms carry a sort (causal, diagnostic, definitional, lexical, …).
   Meta-rules quantify over a sort, never over "any term". This prevents meta-rules accidentally applying to lexical
   or vector-candidate relations.
2. **Level stratification (Tarski hierarchy).** A claim about claims lives at level n+1. A rule at level n may test
   level-n+1 status only positively, or through NAF in a strictly higher stratum. Without this, statements like
   "this claim is unsupported" become self-referential and can produce paradox. Under WFS that shows up as spurious
   *undefined*; under ASP as missing answer sets. The stratification check is static.

### 3.3 Where reification does not suffice, and what to do instead

1. **Identity of indiscernibles.** "Two products are the same iff they share all properties" is genuinely
   second-order (∀P). PEE must not have this: K6 and A2 forbid merging on similarity. Identity is by explicit
   identifiers and a three-valued `same / distinct / undecided` relation. The inexpressibility is protective.
2. **Predicate invention and methodology induction (A6).** Learning a *new* relation type, or a new rule shape, from
   experience is a search over rule space: second-order, and inductive rather than deductive. No logic should do this
   internally. It is a governed process outside the logic: proposals are reified `MethodRule` objects in quarantine,
   scored on held-out cases, promoted by a recorded act. The logic only needs to *represent* candidate rules (FO
   terms) and *execute* active ones.
3. **Claims about the theory as a whole.** Consistency, completeness, and "no active rule can derive a demonstrated
   claim from a declaration" are metatheorems. Logic cannot prove them about itself in general (Gödel/Tarski limits
   for rich theories). For a finite Datalog program they are checkable **externally**:
   - static analysis of rule dependency graphs;
   - property tests on synthetic data (§6).

   That is the right home for them.
4. **Unbounded schema matching.** Analogy over arbitrary structure (graph isomorphism-like mapping of an unknown-size
   schema) is first-order but computationally hard. Schemas must be **small and role-typed** (≤ ~10 roles), which
   makes matching a bounded join.

### 3.4 Costs and risks of full SOL

- **Proof theory.** Under standard semantics, valid SOL sentences are not recursively enumerable. Any implemented
  prover would be incomplete in an unprincipled way.
- **Tooling.** HOL provers are heavy, interactive, non-Node, and require proof engineering. That violates C1 and the
  sole-developer constraint.
- **Explanation.** Higher-order proofs are not readable by the owner; E4 requires traceability.
- **Classical explosion.** Higher-order logics are classical. One contradiction among test results trivialises
  everything, the opposite of R6.
- **Category error.** SOL tempts the design to treat a schema match as a truth. The danger in T1 and case 1 is not
  lack of expressivity but over-generalisation.

---

## 4. Recommended layered combination

### 4.1 The layers

| Layer | Formalism | Stores / computes |
|---|---|---|
| L0 Lexicon and vectors | Embeddings (existing CPU model) + typed lexical facts | `alias / cue / pole` (supported or candidate); vector indexes as **derived views** |
| L1 World knowledge (canonical) | Many-sorted first-order vocabulary, **reified n-ary statements**, strong negation, OWL 2 RL-style vocabulary axioms as Datalog | Needs, situations, phenomena, mechanisms, strategies, capabilities, artefacts, properties, observations, requirements; each statement with provenance, nature, conditions, quantity tag, bitemporal stamps |
| L2 Derivation | **Datalog with stratified aggregates, built-ins (arithmetic, units, intervals), weakly acyclic existentials (Skolem)** | Closure, provenance chains, derived requirements, bounded ∀ checks, research-need objects |
| L3 Defeasible / argumentation | **ASPIC+-style structured argumentation under grounded semantics, compiled to WFS** on the same engine | Defaults with exceptions, rebut / undercut / undermine, partial preferences; outcomes: accepted / rejected / **undecided (reported)** |
| L4 Evidence and uncertainty | **Product of qualitative lattices** (nature, independence, specificity, applicability, review state) + **intervals**; ceiling = componentwise meet | Status of every conclusion; comparisons only when intervals separate |
| L5 Meta-level and methodology | **Typed meta-rules over reified relation types and rule ids** (HiLog-style syntax, FO semantics), in higher strata; `MethodRule` sort with lifecycle | R11 principles as undercutters; admissibility table; rule reliability; abstention and question duties |
| L6 Revision and time | **Append-only bitemporal assertion log + justification maintenance** (JTMS = Datalog provenance + DRed); optional ATMS-style labels for conditions | Supersession, retraction, re-derivation, "believed when" |

All of L2–L5 run on **one in-house engine**: semi-naive Datalog with an alternating-fixpoint WFS, aggregates,
built-ins, bounded Skolem terms and proof recording. Estimated size: 2–4k lines of TypeScript, no dependency. SQLite
holds L1 and L6; the engine loads relevant slices. ATMS labels are an optional later addition.

### 4.2 Interfaces (the anti-confusion contract)

Every predicate is declared with a **layer** and a **sort signature**. A static checker admits a rule only if its
information flow respects these arrows.

1. **Vectors → logic.** L0 emits only `candidate_match(span, concept, score, model_ver)` and
   `candidate_slot(request, slot, value)`.
   - These may appear in the bodies of L2 rules whose heads are `proposal_*` or `quarantine_*`, or request-parsing
     slots that a deterministic check confirms.
   - They may never appear in a rule whose head is a world, identity, decision or evidence predicate.
   - *Similarity therefore never becomes a relation.*
2. **Quarantine → world.** Extracted statements are `proposed(st)`. World rules match only `admitted(st)`, produced
   by an L5 admission act (journaled).
3. **Derivation → evidence.** Every derived conclusion receives a status = meet of its premises' statuses ∧ the
   reliability of each rule used. The nature of a deduced conclusion is `inferred(by: principle | calculation |
   definition)`, never `measured`.
   - `demonstrated(artefact, property, cond)` is definable **only** from an admitted measured observation whose
     subject is that artefact (or an established-comparable unit) under comparable conditions.
   - *Deduction therefore never becomes scientific truth without evidence.*
4. **Argumentation → decision.** Decisions use only *accepted* conclusions. *Undecided* ones are reported with both
   sides. *Rejected* ones are kept and explained. Aggregation over conflicting values is undefined by construction:
   no aggregate rule applies to a set containing an undecided pair.
5. **Meta → object.** Meta-rules act on object-level inference by:
   - undercutting arguments;
   - gating rule activation (`active(rule)`);
   - capping status.

   They never assert world facts.
6. **Revision.** Any change to L1, rule activation or vocabulary triggers re-derivation of dependents. Old derived
   states remain queryable by transaction time.

### 4.3 Alternatives

| Alternative | Composition | Gains | Costs |
|---|---|---|---|
| **B. ASP-centred** | Same L0, L1, L4, L6; L2–L3 and shortlist selection in ASP (clingo-wasm), cautious consequences for "established", weak constraints for ranking | Rich defaults, choice and optimisation in one language; mature solver; easy encoding of joint/alternative requirements and preferences | External multi-MB dependency; grounding blow-up with numeric conditions; explanations need extra tooling; risk of no or many answer sets on conflicting data; harder incremental re-derivation |
| **C. Defeasible-logic-centred** | Datalog for L2; Nute/Antoniou defeasible logic (ambiguity blocking, defeaters) for L3; preferences compiled into a superiority relation | Simplest and linear-time; very clear proof tags; smallest code | Single superiority relation strains E1's several dimensions; undercut only via defeaters; meta-rules over reified rules are less natural |
| **D. Standards-centred (not recommended)** | OWL 2 DL ontology + SHACL constraints + separate rule engine + probabilistic scoring | Interoperable vocabularies; external tooling | Java reasoners (C1); OWA without NAF; no defaults; explosive inconsistency; probabilities violate R12/R6; n-ary awkward |

B is the reasonable fallback if L3 encodings in WFS prove clumsy (signal: argument-construction code growing beyond
the engine). C is the fallback if the WFS engine proves unexpectedly hard to make explainable.

---

## 5. Formal sketches

Notation: Datalog-like, `not` = NAF (epistemic predicates only), `¬` = strong negation, `st:` = a reified statement.
Statuses are lattice tuples.

### Case 2: no vacuous satisfaction

```
reqGroup(S,G,Mode)                         % Mode ∈ {all, any}
member(G,Cap,Level)
documentedReqs(S) :- reqGroup(S,G,_), admitted(st_req(S,G)).

unmetAll(A,G) :- reqGroup(_,G,all), member(G,C,L), not meetsVerified(A,C,L).
metAny(A,G)   :- reqGroup(_,G,any), member(G,C,L), meetsVerified(A,C,L).
groupOk(A,G)  :- reqGroup(_,G,all), artefact(A), not unmetAll(A,G).
groupOk(A,G)  :- metAny(A,G).
failsSome(A,S):- reqGroup(S,G,_), artefact(A), not groupOk(A,G).

realises(A,S) :- documentedReqs(S), artefact(A), not failsSome(A,S).   % existential import
noRequirementBasis(S) :- strategy(S), not documentedReqs(S).          % → research need, never realisation
```

"Buy a new dishwasher" has no `documentedReqs`, so `realises` is underivable for every artefact. The source's
prescribed strategies ("add salt", "add rinse aid") are maintenance strategies and rank first. Without the
`documentedReqs` guard, ∀ over an empty set is vacuously true. That guard is the formal fix.

### Case 3: anecdote and not-a-substitute

```
st1: effective(buyX, allergy_relief)   nature=user_report, subject=user_situation
st2: notSubstituteFor(buyX, removeAllergenSource, allergy)   nature=expert_guidance
st3: primaryRemedy(removeAllergenSource, allergy)            nature=expert_guidance

admits(efficacy, N) for N ∈ {measured_result, regulation, expert_guidance(with basis)}   % user_report ∉
relevantRemedy(S,N) :- st: effective(S,N), admitted(st), nature(st,K), admits(efficacy,K).
role(S,N,adjunct)   :- relevantRemedy(S,N), notSubstituteFor(S,P,N), relevantRemedy(P,N).
role(S,N,primary)   :- primaryRemedy(S,N), admitted(...).
prefer(P,S)         :- role(P,N,primary), role(S,N,adjunct).
```

st1 is retained as a K2 situation report, but it cannot instantiate `relevantRemedy`. Even if buyX had admissible
support, st2 caps its role at *adjunct*, and the no-purchase primary remedy is preferred.

### Case 4: category-first with unverified level

```
meets(A,C,L) ∈ {yes, no, unknown}
meetsVerified(A,C,L) :- obs(o,A,prop(C),V,cond), nature(o,measured_result), admitted(o),
                        comparableCond(cond, reqCond(C)), V ≥ L.
refuted(A,C,L)       :- (same pattern with V < L, interval wholly below L).
unknownLevel(A,C,L)  :- needsCap(N,C,L), artefact(A), hasCap(A,C),
                        not meetsVerified(A,C,L), not refuted(A,C,L).
serves(A,N)    :- (case-2 pattern with meetsVerified).
mayServe(A,N)  :- every failing group fails only through unknownLevel atoms.     % status: unverified
researchNeed(sk_gap(A,C,L)) :- unknownLevel(A,C,L).
```

A declaration-only level, or a level measured under non-comparable conditions, gives `unknownLevel`. The output is
"may serve; level unverified", plus a typed research need, never "serves".

### Case 5: contradiction

```
o1: obs(model M, brightness, 1450±50 nits, cond c1), independent_test, source s1
o2: obs(model M, brightness,  900±50 nits, cond c2), independent_test, source s2
overlapCond(c1,c2), not separatingCondition(c1,c2), disjoint(interval(o1), interval(o2))
  ⇒ rebut(arg(o1), arg(o2)), rebut(arg(o2), arg(o1)), incomparable(pref(o1), pref(o2))
```

Under grounded semantics (WFS) both value conclusions are **undefined**, and `conflict(M, brightness, {o1,o2})` is
derived for the report. `pooled(M, brightness, V)` requires `not conflictAny(M, brightness)` and an admitted pooling
method, so averaging is underivable.

### Case 9: discriminating test

```
indicates(white_film, limescale), indicates(white_film, etching), indicates(white_film, detergent_residue)   % diagnostic, not causal
possibleCause(Sym,C) :- reported(user, Sym), indicates(Sym,C).
discTest(vinegar_soak, dissolves, confirms=limescale, excludes={etching, detergent_residue}) % source-stated
userResult(vinegar_soak, dissolves)          nature=user_report, subject=user_situation (admissible for this claim type)
confirmedCause(C) :- possibleCause(Sym,C), discTest(T,R,C,_), userResult(T,R).
ruledOut(C2)      :- discTest(T,R,_,Ex), C2 ∈ Ex, userResult(T,R).
strategyFor(C) → {use_salt, rinse_aid, descale}   kind=maintenance, primary
```

Confirmation comes only through a source-stated discriminating test. `indicates` never derives `causes`. The user
report is admissible here because the claim type is the user's own situation, not efficacy. The remedy is
maintenance, so a purchase gets no realisation basis (case 2).

### Case 12: two requirements at one operating point; derived requirement

```
need: quiet_at_night_with_clean_air (context=night, room R) — distinct from general quiet
derivedReq(sk_req(N,R), cadr, ≥, ACH·vol(R)) :- needTarget(N, ach, ACH), roomVolume(R, vol), source-stated ACH.
ok(A,N) :- ∃S. setting(A,S),
           measured(A, noise, S, Vn, cond_n), Vn ≤ θnight,
           measured(A, cadr,  S, Vc, cond_c), Vc ≥ ACH·vol(R),
           comparable(cond_n, standard_noise), comparable(cond_c, standard_cadr).
```

The single variable `S` shared by both conjuncts is the point. The wrong reading is
`∃S1 (noise ok) ∧ ∃S2 (cadr ok)`. This is a **quantifier-scope** distinction, and a design that stores
"noise: 24 dB" and "CADR: 300" as unconditioned product attributes cannot express it.

- Unit conversion (m³/h ↔ CFM) and measurement intervals are built-ins.
- If noise is known only at the maximum setting, the outcome for other settings is `unknown`.
- `θnight` without a sourced value is a Skolem `sk_thr(night_noise)`. That yields a research need, and comparisons
  against it yield unknown.

### Case 21: necessary evidence vs informs

```
necessaryEvidence(Y, X)     % source: "verify X before concluding Y"
informs(X, Y)               % X is a supporting consideration
blocked(Y)  :- necessaryEvidence(Y,X), not verified(X).
concluded(Y):- argumentFor(Y) accepted, not blocked(Y).
```

`informs` adds an argument whose absence changes nothing. `necessaryEvidence` turns absence into a block, and the
output becomes a research need or a user question (R9, if X is a fact only the user knows).

### Case 22: "not always" vs "never"

Quantity tags over a scope Σ (circumstances or members): `always`, `usually`, `sometimes`, `never`, `not_always`.

```
neg(always)    = not_always      % ∃σ∈Σ ¬P
neg(never)     = sometimes       % ∃σ∈Σ  P
neg(sometimes) = never
neg(not_always)= always
never ⇒ not_always   only with existential import (Σ ≠ ∅)
instance(σ, P):  from always → P(σ) (strict); from usually → P(σ) (defeasible);
                 from not_always / sometimes → nothing (unknown); from never → ¬P(σ)
```

A source saying "X does not always reduce Y" yields `not_always` and **never** `¬reduces(X,Y)` for the user's case.
Modal claims follow the same square with □/◇: ¬□P = ◇¬P, which is not □¬P.

### Case 23: correlation vs causation as a meta-rule

```
relTypeSort(causes, causal).  relTypeSort(produces, causal).  relTypeSort(indicates, diagnostic).
st_a: associated(low_RH, sore_throat)  nature=statistical_association, sources=…
rule r_assoc2cause (defeasible, kind=assoc_to_cause): associated(X,Y) ⇒ rel(causes, X, Y)
meta: undercut(Arg) :- concludes(Arg, rel(R,X,Y)), relTypeSort(R, causal),
                       usesRuleKind(Arg, assoc_to_cause),
                       not causalIdentification(X,Y).      % e.g. controlled exposure, accepted mechanism + dose-response
```

The causal argument is undercut, not rebutted. No ¬causes is asserted, so the conclusion is "associated; causation
not established". A separate mechanism claim (mucosal drying), if admitted, is its own argument with nature
`mechanism_explanation`. It yields at most "plausible mechanism". The meta-rule quantifies over the *sort* of `R`,
which is the reified first-order form of "∀R causal".

### Case 25: transfer of a mechanism schema

```
schema(adsorption, roles={sorbent, sorbate, carrier_flow},
       conditions={saturation_capacity_finite, contact_time_dependent}, limits={breakthrough_when_saturated})
instanceOf(i1, adsorption, {sorbent=activated_carbon, sorbate=VOC, carrier_flow=air}, domain=air_purifiers)
documentedWorksBy(A2, adsorption, binds={sorbent=zeolite, sorbate=water_vapour, carrier_flow=air})
        nature=method_reference or independent_test  (declaration → only declared_mechanism)
roleTypesOk(A2, adsorption) :- ∀ role ρ: type(bind(ρ)) ⊑ roleType(adsorption, ρ).    % bounded ∀
applies(adsorption, A2) :- documentedWorksBy(...), roleTypesOk(...).
carry(A2, C) :- applies(adsorption, A2), conditions(adsorption, C).        % e.g. capacity, regeneration
contra(A2, L) :- applies(adsorption, A2), limits(adsorption, L).
expected(A2, behaviour) status ≤ principle_based;  demonstrated(A2, …) still needs measured obs on A2.
```

No rule mentions names or embedding similarity. Applicability requires a documented `worksBy` and role-type
compatibility. Conditions and limits are carried over. Performance is never transferred. Renaming every identifier
must leave the conclusions unchanged; the checks in §6 test this.

---

## 6. Minimal executable checks before any build

All checks run on **synthetic** micro-universes: no third-party data, a few hundred lines of fixtures. They use a
throw-away prototype evaluator (semi-naive Datalog + alternating-fixpoint WFS), or hand-derived expected outputs.
Each check proves one property the choice relies on.

| # | Check | What it proves |
|---|---|---|
| 1 | **Vacuity**: strategy with zero, one, or several `all`/`any` groups; artefact meeting none, some, all | Existential import works; joint vs alternative semantics; case 2 cannot recur |
| 2 | **Conflict → undecided**: two incomparable rebutting tests; then add a separating condition; then a preference | WFS/grounded yields undefined (not a choice); a separating condition resolves it legitimately; no aggregate fires on undecided |
| 3 | **Layer-flow static check**: inject rules using `candidate_match` in world/identity heads | The checker rejects them; similarity cannot become a relation (V1) |
| 4 | **NAF discipline**: inject `not worldPredicate` rules | Rejected; E3 is a syntactic guarantee |
| 5 | **Ceiling property test**: random derivation DAGs with random premise statuses | Every conclusion's status ≤ meet of its premises on every dimension; hypothesis and synthetic taint never disappear (cases 14, 18) |
| 6 | **Quantifier scope**: device meeting noise at setting 1 and CADR at setting 3 only | `ok` fails; with the same setting it passes (case 12). Derived requirement from room volume and unit conversion round-trip |
| 7 | **Negation square**: table of quantity tags × negation × instance derivation | `not_always` never yields ¬P(σ); `never ⇒ not_always` only with non-empty scope (case 22) |
| 8 | **Undercut vs rebut**: case 23 fixture with and without `causalIdentification` | The causal conclusion is undecided-by-undercut, with no ¬cause asserted; it is reinstated only by an admitted identification |
| 9 | **Stratification and levels**: rule bases with claims about claims, including a self-referential "unsupported" claim | The static checker detects cross-level negative cycles; WFS gives no spurious *undefined* in admitted rule bases |
| 10 | **Revision equivalence**: random add/retract/retire sequences | Incremental re-derivation (DRed) equals recomputation from scratch; bitemporal query at t0 returns exactly the t0 conclusions (A5) |
| 11 | **α-renaming and decoys** (transfer): rename every identifier in a held-out synthetic domain; add a decoy artefact with a name similar to a known one but no `worksBy` | Conclusions invariant under renaming; the decoy gets nothing (T1, T2, case 1). Seal the synthetic held-out domain before running |
| 12 | **Termination of existentials**: weak-acyclicity checker on rule sets, including a deliberately cyclic Skolem rule | The checker rejects non-terminating value invention; admitted sets terminate |
| 13 | **Explanation completeness**: for every accepted, undecided or rejected conclusion | The proof tree reaches admitted source passages and rule ids; undecided carries its attack cycle (E4) |
| 14 | **Adversarial suite**: cases 1–25 as fixtures with expected outputs written *before* the prototype runs | Expressivity coverage. Any case not encodable flags a missing feature, before architecture is fixed |
| 15 | **Scale smoke test**: ~10⁵ synthetic facts, ~200 rules | Polynomial behaviour holds within interactive time on CPU in Node |
| 16 (optional) | **Differential test** vs an ASP encoding on small instances, if a solver is available locally at development time | Agreement of WFS/grounded outcomes with cautious ASP consequences where theory predicts it; validates alternative B as a fallback |

**Pass criterion for the choice.** Checks 1–14 pass with the single in-house engine, and no case in check 14
needs a feature outside §4.1. If check 2, 8 or 9 needs encodings that grow unmanageable, switch L3 to alternative B
(ASP) or C (defeasible logic) before building.
