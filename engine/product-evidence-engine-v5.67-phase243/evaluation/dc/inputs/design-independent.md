# An independent scientific universe for PEE — conceptual design proposal

*Independent architect's proposal, derived only from `requirements.md` and general knowledge of knowledge
representation, philosophy of science, provenance and argumentation. It is a Claude-authored proposal for comparison,
not independent validation. It deliberately does not start from any existing PEE structure.*

---

## 0. Thesis in one paragraph

The universe should be **assertion-first**. The atomic unit is not an edge in a graph or a row about a product. It is
a **Claim**: one qualified proposition with its own identity. Many **Attestations** hang off each claim. An
attestation is one source, at one passage, asserting the claim (or reporting that another source asserts it). Each
attestation carries a multi-dimensional epistemic profile and its own rights class. Every claim follows one discipline,
whatever it says, so definitions, aliases, concept existence, observations, causal relations and methodological rules
all live under the same rules. That is how requirement E is met for every piece of knowledge. What the system
*believes* is never stored as a fact. A **belief state** is computed from the claims, the active rule set and the
definitions version, using a structured-argumentation engine. A small deductive kernel and a narrow graded layer for
measurement sit beside it. Graphs for navigation and vector indexes for recognition are **derived, disposable views**.
Quarantine is a partition of the belief state, not a separate store.

---

## 1. Core principles and layers

### 1.1 Principles

- **P1 — One discipline for all knowledge.** Every piece of knowledge is a claim with attestations, review state and
  history. This covers "*penetrating damp* is a concept", "*whisper-quiet* is a pole term of *noise*" and "unit #3
  measured 41 dB(A)" alike. Nothing is exempt, because exemptions are where unprovenanced knowledge leaks in.
- **P2 — Content is separate from support, and support is separate from belief.** *What is said* (claim), *who said
  it, where, and on what basis* (attestation), and *what we currently accept and why* (belief state) are three things.
  Collapsing any two of them makes it impossible to meet E1, A3, A5 and R6 at the same time.
- **P3 — Profiles are vectors, not scalars.** No single "confidence" number exists anywhere in the canonical store.
  The dimensions are nature, evidence type, independence, specificity, applicability and review state.
- **P4 — Conclusions are capped by their weakest premise, per dimension.** A conclusion's profile is the per-dimension
  meet of its premises' profiles and of the rule that produced it (E4).
- **P5 — Absence is explicit.** Unknown, unmeasured, unverified, contested and undecided are typed objects. They are
  never the null of a missing row.
- **P6 — Similarity proposes, structure disposes.** Vectors retrieve candidates. Only claims with attestations can
  relate, identify, cause or decide.
- **P7 — The constitution is separate from learned methodology.** A small set of owner-owned invariants cannot be
  revised by learning. Examples: "a declaration is never an independent test" and "synthetic never reads as
  measured". Everything else in methodology is a hypothesis with a lifecycle.
- **P8 — Append-only, bitemporal history.** Nothing is overwritten. Each record has *valid time* (when it holds in
  the world) and *transaction time* (when we came to hold it). "What was believed when" is a query.

### 1.2 Layers

| # | Layer | Holds | Must never hold |
|---|---|---|---|
| L0 | **Sources and passages** (provenance) | Source records: publisher, author role, document, version, date, access/authorisation record, rights and retention class (E5). Passage anchors: locator, hash, and a retained excerpt or paraphrase only where retention permits. "Reported-by" chains. The source's own status labels, verbatim. | Third-party full texts. Content the retention class forbids. Any judgement of truth. Merged sources (a review and the test it cites stay two sources). |
| L1 | **Lexicon / meaning** | Terms (surface strings, language), senses, and lexical claims: *alias-of* (same meaning), *cue-for* (evokes, not synonymous), *pole-term-of* (dimension, pole), *hedge-marker*, *negation-marker*. Each lexical claim has attestations and a status of supported or candidate. | World facts ("bagels" being a cue says nothing about toaster capacity values). Identity decisions between products. Vectors as truth. |
| L2 | **Concept registry** | Concept identities and their kind (need, phenomenon, strategy, category…). *Existence claims* ("there is a distinct concept X of kind K"), definitions as claims, identity/distinctness claims, undecided-identity records. | Merges on name similarity. Concepts without an existence attestation. Product facts. |
| L3 | **World knowledge** (general claims) | Causal, diagnostic, functional, requirement, contraindication, comparison, determinant, bound and threshold claims, with qualifiers (polarity, modality, quantifier, conditions, scope). | Single-unit results presented as general. Methodology. Synthetic values. Belief status. |
| L4 | **Evidence and observations** | Observation records (O&M/SOSA-shaped): feature of interest (unit, variant, model, category-typical), observed variable (I-ADOPT decomposition), result (value, unit, uncertainty, basis), procedure (method and version), conditions, sample design, result kind (measured, qualitative, declared, calculated, synthetic/illustrative). | Generalisations. Results whose feature of interest is unresolved but treated as resolved. Averages across conflicting observations. |
| L5 | **Methodology** | Admissibility rules (which evidence establishes which claim type), meta-principles as undercutter schemas, research templates per artefact kind, question-asking and abstention duties, extraction lessons, curriculum. Each rule has a lifecycle and reliability observations about itself. | World facts. Anything executable that is not in the *active* state. Owner constitution items (those are in L5-K, the kernel, which is not learnable). |
| L6 | **Belief state** (derived) | Per context (rule-set version, definition version, transaction time): the acceptance status of each claim and conclusion — established, supported, hypothesised, contested, excluded, quarantined, unknown — with the argument that justifies it. | Hand-entered statuses. Anything not recomputable from L0–L5. |
| L7 | **Learning state and research agenda** | Quarantine queue, validation decisions, experience cases (successful and failed readings, corrections, counterexamples), candidate lessons, **typed research needs** (K12), conflict dossiers. | Promoted knowledge. A research need disguised as a user question. |
| L8 | **Retrieval views** (derived) | Vector indexes per unit type, graph projections for need-first and category-first navigation, caches. Each records the embedding-model version and source snapshot. | Anything canonical. Anything not rebuildable from L0–L7. |

L0–L5 and L7 are canonical. L6 and L8 are derived. Deleting L6 or L8 loses nothing.

---

## 2. Conceptual model

### 2.1 Kinds of things (entity types)

These are grouped by layer of meaning. Each is a concept kind in L2, and its instances need existence claims.

- **Needs and goals.** `QualityDimension` (e.g. *ambient noise*, *air humidity*) with two `Pole`s. A `Need` is
  (dimension, direction toward a pole, optional target level, context qualifiers). *Less noise* and *more sound* are
  distinct needs with opposite directions on related dimensions. *Drier air* and *more humid air* are opposite
  directions on one dimension. A `ContextualNeed` specialises a general need with circumstances, such as "quiet *at
  night*, *at the setting that delivers adequate clean air*". It is a distinct entity linked by *specialises*, not a
  tag (K1).
- **Situations.** `Symptom` (observable), `Problem`, `UseSituation`, `HomeConstraint` (K2).
- **Nature.** `Phenomenon` (state or process), `Mechanism`, `Principle` (physical law or regularity), `Material`.
- **Interventions.** `Strategy` with a kind (behavioural, building/installation, maintenance, use change, service,
  purchase). `Intervention` is a concrete instance of a strategy (K4).
- **Artefacts.** `Function`/`Capability`, `Component`, `ArtefactKind` (category, subtype), `ProductModel`, `Variant`,
  `Unit` (a physical specimen tested). Identity is per level (K6).
- **Variables (I-ADOPT style).** `Variable` = (object of interest, property, matrix/context, constraints), with a
  `QuantityKind` and unit (QUDT-like), a `ValueBasis` (per run, per hour, per year, per m³…), a plausible range (as a
  claim) and a `JudgedQuality` linked to a variable where one exists (K7).
- **Conditions and methods.** `ConditionSet` (named, comparable sets of fixed conditions), `TestMethod` (with version
  and date), `SampleDesign` (replicates, blinding).
- **Normative.** `RequirementSet` (an AND/OR tree of capability-at-level leaves), `Threshold` (value possibly
  unknown), `Contraindication` (with force).
- **Epistemic and operational.** `Source`, `Passage`, `Agent` (publisher, manufacturer, lab, user, assistant),
  `ResearchNeed`, `Rule`, `ExperienceCase`, `ConflictDossier`.

### 2.2 Kinds of claims

A claim is `⟨type, arguments, qualifiers⟩` with a canonical form and a content hash. The same proposition attested by
five sources is one claim with five attestations. A claim and its denial are two claims linked by *negates*.

**Qualifiers common to all claim types:**

- `polarity` (affirmed or denied);
- `modality`: *necessarily / generally / possibly*, plus *established vs. possible* for causation;
- `quantifier` over members: *all / most / some / this-member*;
- `conditions`: a ConditionSet, conjunctive or disjunctive;
- `scope`/`specificity`: general → category → subtype → model → variant → unit;
- `hedge` (the source's own word, verbatim: "usually", "plausibly", "may");
- `valid-time`.

Modality and polarity compose structurally rather than as a flag. This is what K11 and case 22 need: *outer
polarity*, *modal operator*, *inner polarity*.

**Claim types:**

| Family | Types (arguments) | Notes |
|---|---|---|
| Meaning | `exists(concept, kind)`, `defines(concept, definiens)`, `alias(term, concept)`, `cue(term, concept)`, `poleTerm(term, dimension, pole)`, `sameAs(e1,e2)`, `distinctFrom(e1,e2)` | Existence and definition carry attestations like any claim (E) |
| Taxonomy | `subtypeOf(k1,k2)`, `memberOf(model,kind)`, `variantOf(variant, model)`, `unitOf(unit, variant)` | |
| Causal | `produces(cause, effect, mode∈{established, possible})`, `prevents`, `opposes(effect, need)`, `worksBy(artefactKind, mechanism)` | `indicates` is a different family |
| Diagnostic | `indicates(symptom, cause, strength-label)`, `discriminates(test, outcome, confirms cause, rulesOut set)` | Association ≠ causation (R4) |
| Statistical | `associated(var1, var2, population, direction)` | Never licenses `produces` |
| Functional | `hasCapability(kind, capability, quantifier)`, `hasComponent(kind, component, quantifier)`, `componentRole(component, capability)` | Component ≠ performance (K5) |
| Remedial | `addresses(strategy, problem, role∈{primary, adjunct})`, `notSubstituteFor(s1, s2)`, `requires(strategy, RequirementSet)`, `realisedBy(strategy, artefactKind)` (derived only) | `requires` must be documented; it is never defaulted |
| Normative | `contraindicates(condition, strategy/kind, force∈{essential, modifiable, non-essential})`, `applicability(claim, ConditionSet)`, `threshold(variable, need, value|unknown)`, `bound(variable, upper|lower, value)` | |
| Comparative | `compares(A, B, variable, conditions, direction, magnitude?)`, `ranks(source-ranking, list, criterion)`, `determinant(X, main=Y, notMain=Z)` | A ranking is an attestation-bearing claim of the ranking source; it is never converted into measurements |
| Observational | `observation(...)` (L4) | Typed result kind |
| Evidential | `necessaryEvidence(E, forConcluding C)`, `informs(E, C)` | Case 21 |
| Absence | `unknown(question)`, `unmeasured(variable, entity, conditions)`, `contested(claim)` | Mostly derived; a source may also assert them ("no test exists of…") |
| Methodological | `rule(...)`, `admissibility(claimType, evidenceType, specificity)`, `researchTemplate(kind)`, `questionDuty(...)` | L5 only |

### 2.3 Claims about claims

The design uses a **nanopublication-like triple of named graphs** per attestation, adapted to a relational store:

1. **Assertion** — a reference to the claim (content hash). The claim itself is shared.
2. **Provenance** (PROV-O-shaped):
   - `wasAttributedTo` the source agent;
   - `wasDerivedFrom` the passage;
   - `wasQuotedFrom`/`reportedVia` the chain of reporting sources;
   - `wasGeneratedBy` the extraction activity (extractor version, reader, date);
   - the source's own status label verbatim;
   - the evidence type;
   - the nature of the claim.
3. **Publication info** — when it entered the store, under which authorisation, rights class, and review decisions
   (who validated it, when, and against which sealed reference).

Claims about claims (the source says *X is contested*; a review says *study S used n=3*; rule R undercuts inferences of
type T) are claims whose arguments include claim identifiers. Higher-order reasoning stays first-order in the store,
which is the nanopublication / micropublication trick. Micropublication-style *support/challenge* links between
attestations and claims represent argumentation directly.

### 2.4 Epistemic profile (E1)

Each attestation has a profile with six **independent, unordered** dimensions:

- **Nature** — definition, convention, principle, mechanism explanation, calculation, measured result, qualitative
  observation, expert guidance, regulation, statistical association, hypothesis, user report, declaration.
- **Evidence type** — manufacturer declaration, retailer listing, reviewer claim, editorial, independent original
  test, regulatory notice, method reference, assistant hypothesis. Types are a closed enumeration. There is no
  conversion function between them, and the absence of one is a constitutional rule (E3).
- **Independence** — computed, not entered, over **origins**. An origin is the last source in a `reportedVia` chain.
  An origin known only through a reporter becomes a stub source with status *known-by-report*. Two attestations from
  one origin count once. Origins with a financial or authorship tie to the subject (the manufacturer, a sponsored
  lab) are marked *interested*.
- **Specificity** — general, category, subtype, model, variant or unit.
- **Applicability** — the ConditionSet and any transferability statement the source makes.
- **Review state** — quarantined, validated-by-rule, validated-by-review, rejected, superseded, retracted.

Within a dimension there is at most a **partial** order. For example, in specificity *unit* is more specific than
*category*, but it is not "stronger". The engine never combines dimensions into one scale. Admissibility rules (L5)
state, per claim type, the *required region* of the profile space. For example, `efficacy(model, variable,
conditions)` requires nature = measured result, evidence type = independent original test, specificity ≥ model, and
conditions comparable.

### 2.5 Concept existence, definitions and aliases carry status

"Penetrating damp exists as a distinct phenomenon" is a claim with attestations. A concept proposed by an extractor
from one passage is *quarantined* like any fact. An alias claim proposed by a single reviewer's usage is a *candidate*
and stays one until a dictionary-like or definitional attestation, or held-out lexical validation, supports it.
Definitions are claims of nature *definition* or *convention*. They can be superseded, and a new definition version
triggers re-derivation (A5).

### 2.6 Identity and undecided identity

Identity is never a property of strings. Entities link through `sameAs` and `distinctFrom` claims with attestations,
for example a manufacturer model-number table, or a reviewer stating "the 2024 refresh uses a different panel". The
entity-resolution step produces one of four outcomes:

- **matched** (a sameAs claim was admitted);
- **new** (an exists claim was admitted);
- **distinct** (distinctFrom);
- **undecided**.

An undecided record is a first-class `IdentityQuestion` with its candidate set and a typed research need ("need a model
number or panel type"). While identity is undecided:

- (a) observations about either candidate are not pooled;
- (b) no transfer between them is licensed;
- (c) retrieval may show both, but reasoning treats them as separate.

Model, Variant and Unit are distinct levels. Moving an observation from a unit to its model or category is an
*inference* with a rule. It never happens by re-labelling.

### 2.7 Observations

An observation is an O&M-shaped record:

- **feature of interest** — exact level (unit, variant, model, or *category-typical* as a statistical population with
  a stated sample);
- **observed variable** (I-ADOPT);
- **result** — value, unit, uncertainty or range, value basis, and *result kind*;
- **procedure** — TestMethod and version;
- **ConditionSet**;
- **SampleDesign**;
- **phenomenon time**.

**Result kind is part of the type, not a tag.** A `SyntheticResult` or `IllustrativeResult` is a different record
type. It cannot fill the `measured` argument of any admissibility rule, and the type checker rejects such rules at
load time. That turns case 18 from a policy into a structural impossibility.

---

## 3. Reasoning model

### 3.1 Three tiers, each with its own job

1. **Strict (deductive, monotonic within a context).**
   - Type and kind constraints.
   - Taxonomy (subtype inheritance, but only for claims quantified *all*).
   - Unit and basis conversion. Conversion is valid only where the ConditionSet defines the value for that basis
     (case 20).
   - Pole and direction algebra (opposition of needs).
   - User-stated exclusions.
   - Evaluation of requirement trees in a **three-valued (Kleene) logic**: satisfied / violated / unknown.
     `unknown` propagates. AND with any unknown leaf and no violated leaf is unknown. OR with no satisfied leaf and
     some unknown leaf is unknown.
   - Constitutional invariants (the L5 kernel).

   The expressive needs here are typed first-order terms, finite-domain arithmetic and interval comparison, and
   three-valued connectives.

2. **Defeasible / argumentation (non-monotonic).** Everything that depends on evidence is constructed as an
   **argument**: a tree of premises (attested claims at their admitted profile) and rules (strict or defeasible).
   This covers relevance of a strategy, efficacy, diagnosis, transfer, defaults ("dehumidifiers generally lower RH")
   and conclusions about products. Arguments attack one another in three ways:
   - *rebut*: contradictory conclusions;
   - *undermine*: attacking a premise, e.g. its attestation was retracted;
   - *undercut*: attacking the applicability of a rule, e.g. "association does not establish causation" undercuts any
     association→causation step.

   The status of a conclusion is computed under a **skeptical (grounded) semantics**. Grounded semantics never picks
   a side in an unresolved symmetric conflict: both sides come out *undecided*, which is exactly R6. Preferences that
   may defeat rather than merely attack are limited to three, all from L5 rules:
   - (i) specificity — a more specific condition-matching claim defeats a general default (R10);
   - (ii) a later version of the same source supersedes an earlier one;
   - (iii) admissibility — an argument whose premises fall outside the required profile region is not a valid argument
     at all.

   Evidence *quantity* is **not** a preference. Five weak attestations do not defeat one strong one, and vice versa.
   The expressive needs are strict and defeasible rules, three attack types, rule naming (so meta-rules can undercut
   rules), priorities from specificity only, and grounded semantics. This is the ASPIC+ family. Defeasible logic
   (Nute/Governatori) or ASP with weak constraints would also be candidates for the separate logic analyst.

3. **Graded (probabilistic only where data supports it).** This tier covers:
   - measurement uncertainty and interval propagation;
   - ranges and plausible ranges;
   - replicate statistics;
   - the count of independent origins;
   - frequency claims ("most members") when the source gives a proportion.

   Arithmetic is interval or distributional, never a fabricated probability for a qualitative claim (R12). When a
   claim's grading is qualitative ("usually"), it stays a qualitative modal label all the way to the answer.

### 3.2 Conclusion status lattice and the weakest-link cap

The conclusion statuses are:

- *Established*;
- *Supported*;
- *Hypothesised*;
- *Possible*;
- *Contested* (grounded-undecided due to a conflict);
- *Unknown* (no argument, or Kleene unknown);
- *Excluded* (defeated, or contradicted by the user's own stance).

A conclusion's status is bounded by the meet of its premises' profiles, mapped through admissibility. **R11's
"a hypothesis never yields more than a hypothesised conclusion"** is the cap rule: any premise of nature *hypothesis*
or *user report*, or any modal *possibly*, caps the conclusion at *hypothesised* or *possible*. Every answer carries
its argument, so traceability (E4) is the argument tree itself.

### 3.3 Need-first and category-first over the same knowledge, with asymmetric validity

Both directions traverse the same L3 claims. They differ in which conclusions are admissible.

**Need-first** (R1):

1. Situation → `indicates` → candidate causes (possible).
2. Discriminating tests (`discriminates`) promote one cause and rule out others. Otherwise the result is a *diagnostic
   question* if the user can observe the test, or a *research need*.
3. Cause → strategies (`addresses`, with role).
4. Filter by relevance admissibility, so anecdote, hypothesis and "may" alone fail.
5. Prefer a documented primary no-purchase remedy. Purchase strategies marked `notSubstituteFor` the primary become
   adjuncts.
6. Strategy → `requires` RequirementSet. If none is documented, the strategy is **unrealisable by any artefact**:
   status *unknown requirements*, plus a research need.
7. RequirementSet → artefact kinds or products whose capabilities satisfy the tree with admissible evidence at the
   required levels.
8. Contraindications (essential excludes; modifiable becomes a question or condition; non-essential becomes a
   disclosed disadvantage) and opposition checks.

**Category-first:**

1. Artefact → capabilities → strategies whose RequirementSets mention those capabilities. This yields **only**
   *contributes-to(strategy)*.
2. *serves(need)* is concluded only if the *full* need-first check succeeds from that need to this artefact.

The asymmetry is a rule: `serves(artefact, need)` has exactly one constructor, which is the complete chain with the
whole RequirementSet satisfied (not "unknown"). One satisfied leaf of an AND never constructs it. Category-first
therefore reports "shares capability C used by strategy S" (case 1) but cannot report "serves need N".

### 3.4 Specific expressive needs

- **Necessity / sufficiency.** `requires` (necessary conditions) and `sufficientFor` (sufficient sets) are different
  claim types. Denying sufficiency ("filtration alone is not sufficient for…") is a denied `sufficientFor`. It does
  not deny necessity.
- **Joint / alternative / level.** A RequirementSet is an AND/OR tree whose leaves are (capability, level-predicate
  on a variable, operating point). Leaves can be **bound to the same operating point** (case 12) through a shared
  operating-point variable. Requirement levels can be **derived** from user facts by a strict function: room volume ×
  air changes per hour → required CADR.
- **No vacuous satisfaction.** An empty or undocumented RequirementSet evaluates to *unknown*, never *true*. This is a
  kernel rule.
- **Defaults and exceptions.** These are defeasible rules with specificity priority (R10). Later or more specific
  evidence produces an attacking argument, and the belief state is recomputed.
- **Opposites** (R5). An `opposes(effect, need)` claim, or the derived opposition of directions on a dimension,
  creates a strict exclusion of the strategy for that need. It propagates to every artefact whose only route is
  through that strategy.
- **Diagnosis** (R4). Abductive generation of candidate causes (possible), then discrimination. `associated` claims
  feed the candidate list but cannot confirm. Confirmation requires a `discriminates` claim whose outcome was observed
  or reported by the user. The user report is admitted as a *user report* of the outcome. The source's discriminating
  rule then carries the inference, and the conclusion is capped by the user report's profile: *confirmed per source's
  test, as reported*.
- **Transfer limits** (R7). Transfer is an *inference with a licence*. A licence is a rule requiring comparability of
  conditions (ConditionSet equivalence or a documented equivalence claim), identity of the relevant variant
  attributes, and direction (unit→model needs a rule about sample representativeness; model→category is never
  licensed by one model). Missing licence = no argument = *unknown*.
- **Meta-principles** (R11). These are L5 objects of three kinds:
  - (a) *undercutter schemas* (correlation≠causation; no transfer without justification);
  - (b) *cap rules* (hypothesis → hypothesised);
  - (c) *admissibility tables*.

  Because rules are named and claims can be about rules, the reliability of a rule is itself a set of observations
  (its success/failure record on sealed evaluations). A rule's own status gates whether it executes.

### 3.5 What is deductive, defeasible, probabilistic, argumentation-based

| Deductive | Defeasible / argumentation | Graded |
|---|---|---|
| Typing, taxonomy over *all*-quantified claims, unit/basis conversion, pole algebra, requirement-tree evaluation (Kleene), user exclusions, kernel invariants, derived requirement levels | Relevance, efficacy, diagnosis, transfer, defaults, contraindication application, conflict status, identity inference, lexical status inference | Measurement uncertainty, intervals, replicate stats, origin counts, stated proportions |

---

## 4. The full cycle

### 4.1 Acquisition with quarantine (A1)

1. **Authorisation gate.** The research need names a source class. A policy check covers robots, access controls and
   retention class, and a request budget applies. A refusal is recorded as an experience case. It is never bypassed.
2. **Reading.** The document is segmented into passages (prose, table cells with headers, structured data). Only
   anchors, hashes and permitted excerpts or paraphrases are kept (L0).
3. **Extraction.** Candidate claims and observations are produced with qualifiers, the verbatim hedge and status
   labels, and `reportedVia` chains. The extractor version is recorded. Everything enters **quarantine**: review state
   *quarantined*. Quarantined attestations are visible to the reasoning engine only in an *explicitly hypothetical
   context* (for "what would change if…"), never in the decision context.
4. **Entity resolution** (A2). Each argument mention gets candidate concepts via the lexicon and vector view, then a
   structural check: kind compatibility, defining features, and for products the model number, variant attributes
   and region. The outcome is one of matched, new (an exists claim, itself quarantined), distinct or undecided. New
   terms produce lexical claims (alias/cue/pole) as *candidates*.
5. **Normalisation.** Variables are decomposed (I-ADOPT), units and bases normalised, and ConditionSets matched
   against known ones or proposed as new.
6. **Conflict detection** (A3). Claims and observations are indexed by (claim type, resolved arguments). A conflict
   exists when (a) the subjects are identical (not undecided), (b) the conditions overlap (ConditionSet intersection
   non-empty or not provably disjoint), and (c) polarity is opposed or values are incompatible beyond the stated
   uncertainty. Both sides are kept. A `ConflictDossier` records them, any candidate separating conditions, and a
   research need. Nothing is overwritten.
7. **Sufficiency judgement** (A4). For each candidate, L5 admissibility answers whether *this* attestation could
   establish *this* claim type and at which status. If not, it lists what is missing (e.g. "measured result about
   the variant under method M; have: declaration"). The missing item becomes a typed research need.
8. **Validation.** There are three routes:
   - (a) mechanical checks (provenance complete, rights recorded, schema valid);
   - (b) agreement with a sealed blind reference for a sample (for extractor-level validation);
   - (c) owner or agent review for high-impact claims.

   Validated attestations become *admitted*. Admission is a journaled belief event.
9. **Re-derivation.** Each derived conclusion stores its justification (ATMS-style: the set of premises and rules).
   Admission, retraction or a rule change invalidates exactly the dependent conclusions, which are recomputed.

### 4.2 Revision and versioning (A5)

- **Supersession**: a new version of a source supersedes its earlier attestation.
- **Retraction**: a source withdraws a claim.
- **Rejection**: our validation fails.
- **Definition change**: a new `defines` claim. Every conclusion that depended on the old definition is re-derived,
  and the old belief state remains queryable at its transaction time.

The journal records every belief event `(claim/attestation, from-state, to-state, reason, rule-set version,
time)`. "What did PEE believe on date D, and why" is a replay of the journal plus the rule set active at D.

### 4.3 Methodology learning with a rule lifecycle (A6)

- **Experience cases** record investigations and readings: the goal, the source, what was extracted, the corrections,
  and the outcome against a reference.
- A **candidate lesson** is a methodological hypothesis with provenance to the cases that motivated it. Examples: "in
  tables whose header contains 'per cycle', values have basis per run"; "for dehumidifier efficacy, ask for the test
  condition temperature".
- **Lifecycle:**
  - *proposed* (from development cases);
  - *under review* (pre-registered prediction, evaluated on a **sealed held-out set** never seen during its
    formulation);
  - *active* (scope stated; executes);
  - *superseded* (by a refined rule);
  - *retired* (failed or obsolete).
- Reliability observations (hits, misses, counterexamples by scope) attach to the rule. A counterexample in its active
  scope triggers review, not silent deletion.
- Promotion of a *world* claim and promotion of a *methodology* rule are separate gates with separate references. The
  kernel (P7) is outside the lifecycle.

### 4.4 Never-studied categories (A7)

Given a new artefact kind K (e.g. "evaporative cooler"):

1. **Schema-driven curriculum.** A `researchTemplate` instantiates the questions every artefact kind must answer:
   - which functions;
   - by which mechanisms (`worksBy`);
   - which needs and strategies they serve, with requirement sets;
   - contraindications and operating limits;
   - deciding properties (variables that discriminate among members);
   - standard test methods and condition sets;
   - subtypes and which capabilities are universal, most or some.

   Each unanswered slot is a typed research need with an acceptable-evidence specification taken from admissibility.
2. **Mechanism bridge.** If general knowledge contains mechanisms or principles that K is *documented* (attested
   `worksBy`) to use, their consequences are proposed as *transferred hypotheses* with the principle's conditions
   attached (§4.5).
3. **Authorised acquisition.** Research needs become acquisition requests under the authorisation gate.
4. **Learning order.** Mechanisms and contraindications come before product facts, because they determine which
   product facts matter.

### 4.5 Transfer (T1, T2)

A principle or mechanism claim carries an `applicability` ConditionSet expressed in **domain-neutral variables**
(temperature, RH, airflow, pressure, material). Transfer to artefact kind K in a new domain needs three things:

- (a) an attested `worksBy(K, M)`, with a declaration accepted *only* for the "works by" claim and marked as such;
- (b) evaluation of M's applicability conditions in K's documented operating envelope, with unknown conditions
  becoming qualifiers;
- (c) the transfer rule (L5) is *active*.

The output is a conclusion of nature *principle-based expectation* at most *supported-as-mechanism*. It never
demonstrates efficacy (E4). Name similarity has no role: ER and lexicon are not consulted for transfer beyond resolving
K itself. T2 is tested by withholding whole domains from development (Gate 4).

---

## 5. Semantic and vector design (V)

- **Units (V2).** Embedded units are *typed* and *generated from canonical knowledge*. Third-party text is never
  embedded beyond what retention permits. There are separate indexes per unit type:
  - (i) lexical senses (term + gloss);
  - (ii) concept prototypes: a canonical English description of a need, situation, phenomenon, strategy, capability
    or category, plus its attested aliases and cues;
  - (iii) claim glosses: one canonical sentence per admitted claim, for evidence lookup;
  - (iv) method/variable descriptions;
  - (v) user-request exemplars from sealed development material only.
- **Typed queries.** A request is first decomposed (rules plus the lexicon's negation and hedge markers) into slots:
  - reported situations;
  - needs (with direction);
  - constraints;
  - owned objects (context);
  - named products (user choice to be checked);
  - excluded or negated items;
  - questions.

  Each slot queries only the index of its type. Negated and owned slots are **never** used as positive query vectors.
  Excluded items go to exclusion matching and owned objects to context resolution (V2, R8).
- **Recognition, not relation (V1).** Retrieval returns candidate concepts. The candidate is then **verified
  structurally**: kind compatibility, polarity and direction agreement with the slot (a "more humid" request must not
  match a "drier" concept even if it is close in embedding space), and the presence of admitted claims. Similarity
  scores never enter the argumentation engine.
- **Abstention (V3).** The decision to abstain is made at slot level by a combination of signals, not an absolute
  threshold:
  - (a) *coverage*: does any verified candidate of the right kind have admitted claims?
  - (b) *relative margin*: separation between the top candidate and a typed background/null distribution, calibrated
    on sealed out-of-knowledge probes;
  - (c) *round-trip check*: the candidate's prototype, decomposed, must reproduce the slot's direction and kind;
  - (d) *rank agreement* between lexical (BM25) and dense retrieval.

  Out-of-knowledge yields a typed research need, never a nearest-neighbour answer.
- **Density (V3).** Scores are pooled *per concept* (max or top-k mean over that concept's units), not counted per
  unit, so a concept with 300 claim glosses does not outvote one with 5. Per-type indexes and per-concept
  normalisation by local density (e.g. scoring against the concept's own nearest-neighbour radius) prevent hubness.
- **Incremental (V4).** Admission of a claim or concept emits an index event. Only the affected units are
  (re)embedded and inserted. Each index records the model hash and the canonical snapshot it reflects, and a full
  rebuild must be bit-reproducible from L0–L7. Quarantined units go to a *separate* candidate index, used only by
  entity resolution, never by advice.

---

## 6. Alternative architectures

### A. Ontology-first property graph (OWL/RDF or labelled property graph)

Concepts are nodes and relations are edges with properties. Reasoning uses DL classification plus graph queries
(SPARQL/Cypher-like) and SHACL-style constraints.

- **Meets:** K5–K7 taxonomy, need-first and category-first traversal (R1 navigation), identity via `owl:sameAs`
  (dangerously eager), a familiar tooling model. Navigation is fast.
- **Fails or strains:**
  - Edge-level provenance requires reification, so in practice provenance is attached to the edge, not to a
    shareable claim with many attestations. E2 chains and independence over origins become awkward.
  - OWL is monotonic and open-world, so there are no defaults or exceptions (R10). Contradictions make the ontology
    inconsistent instead of being reported (R6).
  - Negation of modal claims (K11, case 22) has no native home.
  - Concept existence and aliases are usually treated as schema, i.e. without provenance, which violates E.
  - `sameAs` is transitive and global, which is hazardous for "never merge on similar names".
- **Verdict:** valuable as a *derived navigation view*. Inadequate as the canonical model.

### B. Assertion-first (nanopublication-like) store + structured argumentation (recommended)

The design described above.

- **Meets:**
  - E for all knowledge (P1);
  - independence over origins;
  - conflicts kept and reported by grounded semantics;
  - defaults and exceptions;
  - meta-principles as undercutters;
  - traceability as argument trees;
  - versioning through append-only attestations and belief events;
  - quarantine as a belief partition;
  - transfer as a licensed inference.
- **Strains:**
  - Representation overhead per fact.
  - Canonicalisation of claims (when two attestations assert "the same" claim) is itself an entity-resolution
    problem.
  - Argumentation cost grows with argument count, though this is bounded by the request scope.
  - Graded reasoning is deliberately thin.
  - Answer quality depends heavily on the completeness of `requires`, `worksBy` and `discriminates` claims.

### C. Probabilistic-logic design (ProbLog / Markov logic / PSL)

Claims are weighted facts and rules are weighted clauses. Inference is marginal probability, and learning fits
weights.

- **Meets:** graded uncertainty (R12, partially), soft contradictions, rule-weight learning (A6, partially), and
  an elegant combination of evidence.
- **Fails:**
  - R6: conflicts are *averaged* into a marginal, the exact behaviour forbidden.
  - R12: weights for qualitative claims are fabricated precision.
  - E1: it collapses the profile into one number.
  - E3: an implicit promotion happens, since many declarations can outweigh one test.
  - It is data-hungry for weight learning (PEE has small, sealed sets).
  - Explanations are numeric rather than argumentative (E4).
  - It is heavy at scale (C1).
- **Verdict:** use only the *idea* in the graded tier for measurements.

### D. Document-centric RAG with verification

Passages are indexed and retrieved per request. An LLM-like reader composes an answer, and a verifier checks
citations.

- **Meets:** breadth, low up-front modelling, and paraphrase recognition.
- **Fails:**
  - C3: full texts cannot be retained, so the corpus cannot exist.
  - V1: retrieval similarity becomes the de facto relation.
  - There is no stable identity (K6) and no asymmetric validity (R1).
  - It cannot represent absent knowledge (K12).
  - Belief revision is opaque (A5).
  - Transfer is only by surface similarity (T1 forbids it).
  - At runtime it requires an AI service (C1).
- **Verdict:** rejected. Only its retrieval discipline survives in L8.

### E. (Hybrid variant) Frame/case-based design

Each artefact kind has a frame (slots: functions, requirements, tests) filled per category. Reasoning is by frame
matching and cases.

- **Meets:** A7 curricula (frames are templates) and fast authoring.
- **Fails:** cross-category transfer (frames are per category, so mechanisms are duplicated); claims inside slots lack
  per-claim provenance unless re-engineered into B.
- **Verdict:** absorbed into B as `researchTemplate`.

### Recommendation

**Adopt B as canonical, with A as a derived graph view, a C-like narrow graded tier for measurements only, E as research
templates, and D's retrieval hygiene in L8.** The reasons:

1. B is the only option where the hardest invariants (E for everything, R6 no-averaging, R10/R11 defeasibility and
   meta-rules, E3 no promotion) are *structural* rather than policy.
2. It fits C1: SQLite tables (`source`, `passage`, `concept`, `term`, `claim`, `attestation`, `observation`, `rule`,
   `belief_event`, `research_need`, `conflict`, `identity_question`, `journal`) plus a few-thousand-line TypeScript
   argumentation evaluator and the existing small CPU embedder.
3. It is an isolated engine (C4) with a clear export surface: answers with argument trees and typed research needs.

---

## 7. Adversarial walk-throughs

Notation: `C:` canonical claims (attestation profile in brackets), `→` the inference attempt, `⇒` the result.

**Case 1 — purifier is not a dehumidifier.**
C: `hasCapability(airPurifier, moveAirThroughFilter, all)`; `hasCapability(dehumidifier, moveAirThroughFilter,
all)`; `requires(dehumidify, AND{removeWaterVapour≥level})`; `hasCapability(airPurifier, removeWaterVapour, all)`
**denied** [principle/guidance].
→ Category-first: purifier → shares capability with dehumidification strategy ⇒ "contributes-to: no (shared component
is not the required capability)". `serves(airPurifier, drierAir)` has one constructor, and the AND leaf
removeWaterVapour is violated ⇒ **excluded**. Similarity of prototypes in L8 is irrelevant.

**Case 2 — purchase strategy with no documented requirement.**
C: source prescribes `addresses(addSaltAndRinseAid, cloudyGlasses, primary)` [guidance];
`addresses(buyNewDishwasher, cloudyGlasses, ?)` absent or only implied; no `requires(buyNewDishwasher, …)`.
→ Need-first reaches "buy new dishwasher" only if some attested `addresses` exists. Even then its RequirementSet is
empty ⇒ Kleene *unknown* ⇒ the kernel's no-vacuous-satisfaction rule ⇒ **not realised by any artefact**. Answer:
maintenance remedy (primary); purchase not recommended; research need "requirements for purchase remedy undocumented".

**Case 3 — anecdote vs "not a substitute".**
C: `addresses(X, allergy)` [user report, n=1, hypothesis-cap]; `notSubstituteFor(X, allergenAvoidance)`
[guidance, source S]; `addresses(allergenAvoidance, allergy, primary)` [guidance].
→ Relevance admissibility for `addresses` requires guidance or better. The user report yields only a *hypothesised*
argument, capped. The `notSubstituteFor` claim makes X at most an adjunct ⇒ primary no-purchase remedy first; X
"may be considered as an adjunct" only if X has its own admissible relevance (it does not here) ⇒ **X not presented as
a remedy**. The anecdote is recorded as an experience/user-report claim.

**Case 4 — requirement met only at an unverified level.**
C: `requires(nightQuiet, AND{noise≤L at opPoint})`; product P: `observation(P, noise, …)` absent; declaration
`noise=L−3` [manufacturer declaration].
→ Admissibility for satisfying a level leaf in a *serves* conclusion requires a measured result (model-level,
comparable conditions). The declaration gives *declared-satisfies*, not satisfied ⇒ leaf **unknown** ⇒ AND unknown
⇒ `serves` not constructed. Output: "meets requirement per manufacturer declaration; unverified"; research need
"independent noise measurement at the operating point".

**Case 5 — independent tests contradict.**
C: obs1(model M, variable V, method T1, conditions C1) = 30; obs2(M, V, T2, C2) = 45; both independent tests,
different origins; C1∩C2 not provably disjoint; no separating claim.
→ Conflict detection opens a dossier. Two arguments, "V(M)≈30" and "V(M)≈45", rebut each other with no admissible
preference ⇒ grounded semantics: both **undecided** ⇒ status *contested*. The answer reports both with their sources
and conditions, does not average, and raises a research need: "find a separating condition or a third independent
test".

**Case 9 — white film diagnosis.**
C: `indicates(whiteFilm, limescale | detergentResidue | etching, possible)`; `discriminates(vinegarTest,
dissolves, confirms limescale, rulesOut {etching})` [guidance, source S] (and whatever S states about residue);
user: "it came off with vinegar" [user report].
→ Abduction gives three possible causes. Discrimination with the reported outcome ⇒ limescale *confirmed per S's test,
as reported*; etching ruled out. Strategies for limescale: `addresses(descale/salt, limescale, primary)` [maintenance]
⇒ **maintenance remedy**. Purchase strategies have no admissible route ⇒ none.

**Case 11 — air too dry.**
User: RH 25%, need = `humidity↑`. C: `opposes(dehumidification, humidity↑)` (derived from direction algebra:
dehumidification lowers RH).
→ Strict exclusion of the dehumidification strategy, propagated to dehumidifiers. Need-first finds no admitted artefact
kind with `hasCapability(…, addWaterVapour)` ⇒ **gap report**: "no family in knowledge covers humidification";
research need typed `missing-category(humidification)`. No question to the user (R9) and no near-neighbour substitute.

**Case 12 — quiet at night with enough clean air.**
User: bedroom of volume Vr, night use. ContextualNeed `quietAtNight` specialises `quiet`. C: `requires(cleanAirNight,
AND{CADR ≥ f(Vr, ACH) @op, noise ≤ L @op})` with both leaves bound to **the same operating point `op`**. f is
strict.
→ For product P, the engine seeks one operating setting s where both observations exist under the same method and
conditions. Max-setting CADR combined with min-setting noise ⇒ the binding fails ⇒ leaf pair **unknown/violated**.
General "quiet" (min-setting noise) is reported separately and does not satisfy the contextual need.

**Case 16 — package relays a study.**
Attestation A1: source = owner package Pk, passage p, `reportedVia` = [Pk], origin = Study St (stub,
*known-by-report*), status label verbatim. Attestation A2 from a review citing St.
→ Independence is computed over origins: {St}, count = 1, not 2. Evidence type and nature are judged on St (e.g.
independent original test), with *specificity and conditions as St states them*. Applicability is capped by "reported,
original not inspected" until St itself is attested. Research need: "obtain St".

**Case 17 — single unit is not the category.**
C: `observation(unit u7 of variant V, variable X, …)=x`.
→ Attempted generalisation unit→category: the transfer licence requires a population sample claim (n, sampling)
⇒ absent ⇒ no argument. The observation's feature of interest stays *u7*. Model-level use needs a representativeness
rule (e.g. production-unit invariance claim) ⇒ also absent ⇒ "one tested unit measured x". Any category-typical range
must come from a `category-typical` observation with a stated sample.

**Case 18 — synthetic value.**
A package scenario: "a household could save 120 kWh/yr" labelled `PROPOSED_NOT_TESTED`, synthetic.
→ It is stored as an `IllustrativeResult` record type with the verbatim label. Admissibility tables cannot reference
that type as `measured`, and this is a load-time type check. Every rendering path prints its kind ⇒ it can **never**
read back as measured. At most it supports `hypothesis(energy saving)` ⇒ capped *hypothesised* (also case 14).

**Case 19 — "bagels" and "whisper-quiet".**
C: `cue("bagels", toasterSlotWidth)` [candidate → supported after attestations]; *not* `alias`. `poleTerm("whisper-
quiet", noise, low)`.
→ Request "toaster for bagels" ⇒ slot `need`, lexicon resolves a *cue* ⇒ the concept slot-width capacity is
*evoked*, generating a requirement-elicitation step (or a typed research need for the threshold). It is not a synonym
substitution ("bagels" ≠ "wide slot"). "Whisper-quiet" maps to the low pole of noise, a direction and no number ⇒ no
fabricated dB threshold unless a `threshold` claim exists.

**Case 21 — necessary evidence vs informs.**
C: `necessaryEvidence(verify(drainAvailable), forConcluding suitable(continuousDrainDehumidifier))` vs
`informs(roomSize, choice)`.
→ `necessaryEvidence` makes a premise **mandatory** in the strict layer. Without it the conclusion is *unknown* (with
a question to the user if it is a user fact per R9, otherwise a research need). `informs` adds a consideration but its
absence never blocks the conclusion.

**Case 22 — "not always" vs "never".**
"Dehumidifiers do not always prevent mould" ⇒ outer polarity = denied, modal = *necessarily*, inner = affirmed ≡
`possibly(not prevents)`. "Dehumidifiers never cause mould" ⇒ outer affirmed, modal *necessarily*, inner denied.
→ The first does **not** contradict `generally(prevents)`. The two are compatible, with the first acting as an
exception marker. It does attack a `necessarily(prevents)` claim. The structural encoding makes this a strict check
instead of a string heuristic.

**Case 23 — association between low RH and sore throat.**
C: `associated(lowRH, soreThroat, population P, positive)` [statistical association].
→ An attempt to build `produces(lowRH, soreThroat)` meets the active meta-rule undercutter "correlation does not
establish causation" ⇒ the argument is undercut. The surviving conclusion is "associated in P (statistical); causation
not established". In diagnosis it may add lowRH to *possible* causes, never confirm it. A humidifier strategy cannot
be justified as a *remedy* by this alone (R3).

**Case 24 — methodological rule.**
"Abstain when the input needed for a comparison is missing" is stored in L5 as `rule(abstainOnMissingComparisonInput)`
with provenance (the experience cases or the owner) and state *proposed*.
→ While proposed it executes nowhere. It is evaluated on sealed held-out comparisons, then promoted to *active* with
scope. From then on the comparison builder checks it as a precondition, and a missing input produces *abstention +
research need*. It never appears as a world claim and is never retrieved as "evidence" about any product.

**Case 25 — new category, known mechanism.**
New kind "desiccant dehumidifier" (never studied). C: `worksBy(desiccantDehumidifier, adsorptionOfWaterVapour)`
[manufacturer declaration — admissible for worksBy only]; known principle `adsorptionCapacity decreases with
temperature↑ … conditions {…}` [principle, from another domain such as sorbent filters].
→ The transfer rule (active) applies the principle with its conditions to K's operating envelope, yielding
*principle-based expectation*: "performance less temperature-dependent than compressor units at low temperatures,
within …". It is never "demonstrated" (E4). The A7 template generates research needs: standard test method,
measured extraction at low temperature, contraindications (heat output, energy).

---

## 8. Known weaknesses and the four gates

### 8.1 Weaknesses of this design

1. **Modelling burden.** Every fact needs a qualified claim, attestations and profile fields. Extraction into this
   form is the hard part, and errors in qualifiers (a dropped "may", a lost condition) silently corrupt reasoning.
   Quarantine catches what validation catches, no more.
2. **Claim canonicalisation.** Deciding that two attestations assert *the same* claim (vs. near-variants with
   different conditions) is an identity problem of its own. Over-merging hides conflicts. Under-merging hides
   independence counts.
3. **Condition overlap is undecidable in practice.** "Not provably disjoint" will flag many spurious conflicts.
   Proving equivalence will often be impossible, so many transfers stay *unknown*. Expect high abstention.
4. **Completeness dependence.** The asymmetric validity rules are only as good as the coverage of `requires`,
   `discriminates`, `worksBy` and `opposes`. Thin coverage yields correct but unhelpful answers ("unknown"
   everywhere).
5. **Over-strict risk.** Weakest-link capping and grounded skepticism can be too conservative. One stale low-profile
   premise can cap an otherwise well-supported conclusion. The kernel must be audited for safeguards without a real
   risk.
6. **Preference engineering.** Specificity-based defeat requires a well-defined specificity order over ConditionSets.
   Mis-specified preferences silently resolve conflicts that should be reported.
7. **Lexicon and concept growth.** Candidate concepts proliferate. Undecided identities accumulate without a research
   budget to resolve them.
8. **Vector abstention calibration** depends on sealed out-of-knowledge probes. These are small and Claude-authored,
   so there is a risk of style leakage.
9. **Methodology learning is slow.** Held-out promotion on small sealed sets gives wide uncertainty, so few rules will
   be promoted quickly.
10. **Self-assessment risk.** This design, its claims taxonomy and its adversarial traces are by one Claude agent. The
    traces show the design *can* represent the cases. They do not show an extractor *will* produce those
    representations.

### 8.2 The four gates (X2)

All gates use sealed material created before the first run, keep first runs unchanged, and separate development from
held-out.

**Gate 1 — Representation.**
- *Test:* a sealed sample of passages across ≥4 categories, including withheld ones, covering K1–K14. Two blind
  annotators encode each passage into the conceptual model.
- *Measures:* encodability (fraction representable without loss); agreement on claim type, qualifiers (polarity,
  modality, quantifier, conditions), result kind and evidence type; round-trip (re-rendered claim ≡ source meaning);
  competency questions answerable by query (e.g. "which claims rest on one origin?", "what was believed on D?").
- *Must pass:* cases 16–22 as representation tests, and E-completeness (no definition, alias or concept without
  attestation).

**Gate 2 — Reasoning.**
- *Test:* the adversarial suite (all 25 patterns), plus **fresh sealed variants** of each pattern in other categories,
  authored blind to the implementation.
- *Measures:* forbidden conclusions (target zero) — vacuous realisation, averaging, promotion, unlicensed transfer,
  cause-from-association; correct status (established / supported / hypothesised / contested / unknown);
  argument-tree completeness (E4); stability under premise retraction (re-derivation matches recomputation from
  scratch); over-strictness rate (cases where an admissible conclusion was withheld).

**Gate 3 — Acquisition.**
- *Test:* unseen documents from authorised sources, with a sealed blind reference.
- *Measures:*
  - extraction precision and recall *including qualifiers*;
  - provenance to passage;
  - reportedVia chains;
  - verbatim status labels;
  - ER outcomes (false-merge rate, target zero; undecided rate);
  - conflict-detection recall on seeded conflicts;
  - sufficiency-judgement agreement;
  - rights compliance (zero violations).

  The rule lifecycle is tested by promoting a lesson only on held-out support and showing it is not reported as
  held-out after tuning.

**Gate 4 — Transfer.**
- *Test:* domains and categories withheld from all development (T2), including at least one never-studied category
  that shares a mechanism with a known one and one that only *looks* similar by name.
- *Measures:* correct principle-based transfer with conditions carried (case 25 pattern); zero transfer by name
  similarity; quality of the A7 curriculum (research needs vs. a sealed expert list of what must be learned); bounded
  claims (no "demonstrated" from principles).

### 8.3 Integration or abandonment (X3, C4)

- **Integrate** only if all four gates pass on held-out material:
  - zero forbidden conclusions;
  - false merges at zero;
  - over-strictness and abstention rates no worse than an agreed margin against the legacy system on the same sealed
    requests;
  - re-derivation reproducible.
- **Integration surface:** the legacy system consumes answers (status, argument tree, research needs) as an adviser
  back-end. The legacy store is imported only as *quarantined attestations*, never as admitted knowledge.
- **Abandon** if Gate 1 shows the model is not encodable by blind annotators with acceptable agreement, or if Gate 3
  shows extraction cannot reach the qualifier fidelity that the reasoning depends on. Representational elegance with
  unreliable acquisition is worse than the legacy system.
