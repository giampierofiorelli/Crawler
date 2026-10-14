# Product Evidence Engine — Phase 179 research decision

**Date:** 2026-10-12  
**Status:** Evidence-informed engineering proposal; not implemented or validated as a product-ranking knowledge base.  
**Canonical software base:** PEE v5.02 / Phase178. English-only product input and output; website-first interaction.  

## Decision

Build a **versioned, category-grounded need→outcome→mechanism→observable→method knowledge system**, starting with five deliberately contrasting product categories. Reuse PEE's existing source, identity, protocol, claim and user-decision modules; do not build a generic keyword list, install another language model automatically, or import reviewers' aggregate scores as universal ranking weights.

**Why this is needed:** Phase178's nine source-disjoint-thread developer paraphrases generated zero candidate needs for five prompts; an independent browser smoke case requesting PFAS and lead recognized only PFAS. These are qualitative engineering failures, not an unbiased accuracy estimate. User-written goals and category names alone do not establish product capability. Professional test protocols specify *what is measured and under which conditions*, but do not independently validate every inferred causal link or prove suitability of a real model.

**Distinguish four evidence classes:** (1) actual user expression and author-confirmed requirement, (2) candidate causal/functional engineering link, (3) published professional test/technical certification scope, (4) observed and admitted exact-model performance under an identified protocol. An item in one class cannot silently become an item in another.

## Research priorities and independent examples

### 1. Vacuum cleaners — task-dependent performance

- **English goal examples:** "My cat sheds on rugs and I have stairs"; "I can barely lift my old upright."  
- **Need candidates:** pet-hair collection on the *actual surface*, accessible cleaning of stairs/furniture, carried weight and handling, maintenance.  
- **Engineering observables:** source-defined pet-hair pickup by surface; carpet and hard-floor pickup by debris type; portability, maneuverability, brush access, relevant attachments.  
- **Original method:** RTINGS separates performance on distinct surfaces and pet hair from design and portability. A single suction number cannot substitute for all the task outcomes.  
- **Caveat:** test protocol versions, source-defined scores, and exact variants must remain separate; do not generalize specific pickup performance to inaccessible geometry or patient-specific ergonomic ability.

Source: https://www.rtings.com/vacuum/learn/how-we-test

### 2. Drinking-water filters — outcome and certification are claim-specific

- **English goals:** "Make my water taste better" versus "Reduce lead" versus "Reduce PFAS". These may require distinct technical evidence and sometimes information about incoming water and installation.
- **Mechanism families:** aesthetic taste/odor treatment, contaminant-specific treatment, filtration media, reverse osmosis, installation/service conditions (candidate families, not proofs for each product).
- **Observables:** *named contaminant reduction claim*, identified certified system and replacement cartridge, certified use conditions and service life, plumbing/access dimensions; where appropriate the specific water testing context.
- **Hard boundary:** A generic NSF/ANSI standard number does **not** establish that every contaminant within the standard is reduced by a given model. Check the actual listed reduction claim; an ordinary taste improvement is not lead or PFAS protection.
- **Relevant scope:** NSF distinguishes aesthetic claims (42) from health-effect claims (53) and RO systems (58). NSF indicates 53/58 with PFAS designation for PFAS; US EPA points to certification limits and differences from drinking-water limits. Check current standards/registry and exact listing date before asserting coverage.

Sources: https://www.nsf.org/consumer-resources/articles/standards-water-treatment-systems ; https://www.nsf.org/about-nsf/faqs/water-filters-faqs ; https://www.nsf.org/consumer-resources/articles/contaminant-reduction-claims-guide ; https://www.epa.gov/water-research/identifying-drinking-water-filters-certified-reduce-pfas

### 3. Washing machines — feasibility before scored preferences

- **English goals:** "The utility cupboard is only so deep"; "The duvet must fit"; "I need effective cleaning without fabric damage".
- **Separate:** installation feasibility (overall installed geometry, hoses, clearance, opening and service), load type/capacity, wash effectiveness, rinsing, gentle fabric treatment, noise/vibration, water/electricity consumption.
- **Professional methods:** Consumer Reports evaluates stain performance with standardized swatches and spectrocolorimetry, noise/vibration, water/energy, and gentleness. Installation for a *specific variant* is a separate documentary feasibility check.
- **Caveat:** catalogue capacity is not proof that a particular duvet fits; depth without hoses and clearances is not installed depth; unknown clearance cannot be marked as verified incompatibility.

Source: https://www.consumerreports.org/appliances/washing-machines/how-we-test/

### 4. Electric kettles — an apparently simple category exposes context-dependent priorities

- **English goals:** "I only heat water for one cup"; "I need quiet boiling early in the morning"; "I struggle to lift a full kettle"; "I need a precise temperature for tea."
- **Observables:** minimum operating fill volume, boil time at defined starting volume/temperature, overboil time, sound under defined conditions, pour ergonomics (filled mass and balance), temperature accuracy, materials, descaling access.
- **Independent methods disagree on aggregate importance:** Which? publishes a laboratory score with ease of use 30%, speed 20%, overboil 15%, minimum fill 15%, scale filter 15%, noise 5%; CHOICE uses noise 40%, ease 40%, boiling time 10%, energy efficiency 10%. Those published weightings describe the reviewers' schemes, *not weights for PEE users*.
- **Engineering consequence:** retain original component measures and protocol differences, not inherited overall rating or fixed category-wide preference weights.

Sources: https://www.which.co.uk/reviews/kettles/article/how-we-test-kettles-aYVyI4A7WEY6 ; https://www.choice.com.au/home-and-living/kitchen/kettles-and-tea-makers/articles/how-we-test-kettles

### 5. Pasta-making equipment — technology-family selection precedes product scoring

- **English goals:** "I want to make ravioli sheets"; "I want to make rigatoni"; "I want quick fresh noodles and easy cleanup".
- **Function split:** dough sheeting/rolling, cutting strands, extrusion through shapes/dies, manual shaping, attachments needing an existing mixer. Some goals need a specific mechanism or combined workflow; the goal alone should not force a single appliance.
- **Observables:** supported shape and die/attachment compatibility on actual variant; consistent sheet thickness/tearing; cutting accuracy; output rate; dough-type limits; cleaning and workflow time; counter/storage constraints.
- **Professional methodology:** Serious Eats tested 15 machines, including thickness with calipers, elapsed rolling/cutting time, different doughs and cleaning. These method observations should be matched to actual requested shapes, not generalized from fettuccine to rigatoni.
- **Caveat:** a roller alone is not proof of the ability to extrude tubular pasta; likewise a desired shape need not imply the user must buy a machine because manual alternatives exist.

Source: https://www.seriouseats.com/best-pasta-makers-7098725

## Proposed data contract (illustrative, *not implemented*)

A category-independent schema should store a graph of typed, versioned records:

```
English user expression
  -> hypothesized outcome [span, scope, polarity, confidence status]
  -> user-confirmed or user-rejected requirement [priority, hard/soft, reason]
  -> candidate function/mechanism [evidence state, necessary/possible/alternative]
  -> measurable observable [units, conditions, direction, context]
  -> original professional method [URL, date/version, source, rights, scope]
  -> exact-model admitted observation [variant, protocol, date, uncertainty]
  -> non-compensatory feasibility checks + deterministic ranking policy
  -> concise source-traceable result and optional technical detail
```

**Mandatory controls:**
1. Separate category-agnostic *need dimensions* from category-specific mechanisms and test observables. Many goals lead to multiple plausible families; allow branching and explicit unknowns.
2. Each edge is candidate, domain-reviewed, contradicted or admitted according to source/identity/protocol rules; labels by themselves cannot increase trust.
3. Version the mapping, source protocol, observed measurements, active user snapshot and ranking policy. Only the latter verified combination may change/recalculate rankings.
4. Record positive, negative, excluded alternatives, capability of owned equipment, and task type (purchase, compare, repair). User-confirmed hard requirements are not automatic product vetoes.
5. Do not use a model's confident prose, product-review sentiment, generic standards-badge, brand, or professional overall winner as a proxy for an absent observation.
6. Preserve test-method heterogeneity; never blend incomparable revisions or different target conditions into a single numeric scale.
7. Keep original source URLs and claim-specific licensing; do not reproduce proprietary source text or assume third-party datasets are freely redistributable.

## Reuse of existing PEE architecture

- `src/phase172_domain_protocol_registry.ts`: narrow provenance-aware test-method pointers (currently examples for five initial appliance groups). Extend under review rather than duplicating.
- `src/phase173_need_mechanism_graph.ts`: unreviewed relation proposals and note/fingerprint custody; never interpret a submitted reviewer note as authenticated expert approval.
- `src/phase174_category_transfer_probe.ts`: provisional rules and categories (kettles, filters, pasta); useful for failure diagnosis, not general language competency.
- `src/phase177_decision_snapshot.ts` + Phase178 web/API: keep user-controlled versioned choice as canonical state; no forced persistent chat.
- Phase169–171: preserve original-source identity, exact-variant comparability, signed-replay and conflicting-evidence controls before claims and ranking.
- Phase154/175/176 review NLP and optional context inference: reuse where measured to improve source attribution and user input, not as a compulsory dialogue infrastructure.
- User-supplied GitHub repositories: research algorithms/patterns and licenses; use optional model/OSS only when measured improvement exceeds hosting, dependency and maintenance costs.

## Validation that can falsify this approach

A. Build a *source-disjoint* set of authentic English consumer prompts per category. Independent domain annotation must label outcome, context, hard constraints, ambiguous assumptions, alternative technology, mechanisms to investigate, decisive misses and appropriate abstentions. Preserve original posts and source boundaries; adjudicate disagreements. Held-out means no thread/person/near-duplicate influence from development.

B. Report per-category critical-need recall, false positive critical constraints, severity-weighted omissions, correct non-shopping task classification, unjustified veto count and abstention appropriateness, not just lexical matching rate. Include unsupported-but-fluent answers as errors.

C. Metamorphic test paraphrases, ordering, negations, quotations, and correction of single facts. Canonically equivalent confirmed snapshots + same evidence/policy/eligible products must reproduce the entire ranking and explanation trace; a materially different need should change relevant evidence criteria only where justified.

D. Test if a category-specific mechanism library is actually superior to a single generic attribute list **on previously unseen English tasks**, including category-holdout and cross-family transfer. If it does not improve critical-need coverage without increasing false hard constraints, simplify it.

E. Measure source availability, review cost, rate of stale mechanisms, protocol changes, maintenance burden and version drift, not only model linguistic accuracy.

## Proposed bounded sequence

1. Audit current category/need registries and consolidate duplicates into one referenced schema; do not discard previous evidence or licensed material.
2. Deeply review the five pilot categories above with original method texts, exact claims/conditions and at least two independent expert sources where available.
3. Create a **small** explicitly provisional, typed mechanism library with evidence links; test it against held-out goals and adversarial constraints.
4. Only then introduce exact-model observations via Phase169–171; compare website results with counterfactual edits and log verified ranking traces.
5. Expand to coffee makers and air fryers, followed by refrigerators or other families selected for genuinely new engineering challenges, not just more products.

## Scientific framing

Quality Function Deployment (QFD) describes a method for relating customer requirements to design/product development. ISO 16355-1:2021 is a **relevant process reference**, not independent certification of this proposed PEE knowledge graph or of an inferred need-to-performance edge. Source: https://www.iso.org/cms/%20render/live/en/sites/isoorg/contents/data/standard/07/41/74103.html

## Boundaries of this research note

This is an evidence-informed architectural recommendation, not a full expert audit, source-licensed measurement dataset, implementation, quality estimate, product ranking or release. Method descriptions were inspected at linked sources on 2026-10-12; no full reproduction of copyrighted test protocols is supplied.
