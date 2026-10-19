# A. General models of an observation / variable / measurement — findings for PEE (S87c)

Researched 2026-10-19. Each claim is marked **verified (read)** when I opened the primary page and read the
statement myself. It is marked **not verified (secondary/snippet)** when it comes from a search snippet, a secondary
page, or a page I could not open. Quotations are kept short. No repository content was read.

Access notes:
- loinc.org (Users' Guide, terms of use) returned **HTTP 403** to every request. I did not try to get round it.
- The LOINC material below therefore comes from these sources instead:
  - the 1998 LOINC design paper (primary);
  - SNOMED International's LOINC implementation guide (an official secondary source that quotes the Users' Guide);
  - HL7 FHIR.
- EUR-Lex returned an empty 202 (bot challenge), so I used the legislation.gov.uk copy of Regulation (EU) 2019/2017.
  For definitions and the method annex that copy has the same text as the EU original; UK amendments apply only to
  UK application.
- jcgm.fr returned 503; I used the official BIPM-hosted VIM online (jcgm.bipm.org).

---

## 1. I-ADOPT (RDA, Interoperable Descriptions of Observable Property Terminology)

Sources:
- https://i-adopt.github.io/ontology/ (v1.1.0, 2025-05-28) — **verified (read)**.
- https://i-adopt.github.io/overview.html — **verified (read)**.
- Huber et al., CoRDI 2023, https://www.tib-op.org/ojs/index.php/CoRDI/article/download/366/498/6180,
  doi:10.52825/CoRDI.v1i.366 — **verified (read)** (PDF pages 1–5).
- arXiv 2107.06547 (Magagna et al. 2021) — abstract **verified (read)**; full text not read.

**(a) Decomposition.**
- A *Variable* is "a description of something observed or derived, minimally consisting of an ObjectOfInterest and
  its Property".
- Its optional components are:
  - **ContextObject** — an entity that provides background to the ObjectOfInterest;
  - **Matrix** — an entity that contains the ObjectOfInterest (a sub-property of hasContextObject);
  - **Constraint** — "limits the scope of an observation and confines its context to a particular state"; it
    *constrains* a named component;
  - **StatisticalModifier** — e.g. mean or maximum.
- An Entity can be a **System**:
  - an *AsymmetricSystem* has role-bearing parts: **hasNumerator / hasDenominator** and **hasSource / hasTarget**
    (flux);
  - a *SymmetricSystem* has interchangeable parts.
- **VariableSet** groups variables through "applicable" components.

**(b) Conditions and basis.**
- I-ADOPT has no separate "conditions" slot. State restrictions are expressed as *Constraints* attached to the
  component they constrain. In the CoRDI example "female" constrains the context object *Calanus finmarchicus*.
- **Basis** ("per cycle", "per portion") fits the **AsymmetricSystem numerator/denominator** pattern. For example,
  energy is the numerator and one complete programme run is the denominator entity.
- Temporal aggregation fits **StatisticalModifier** or a Constraint.
- I-ADOPT describes the *variable* only. It has **no** procedure, instrument or result: those are left to
  SOSA/O&M/OBOE. The CoRDI paper says it can be used together with OBOE *Characteristic* or OBI *study design*.

**(c) Comparability.**
- Implicit: two observations are of the same variable when their component terms match after mapping.
- The CoRDI paper argues that mapping effort is reduced "as only the variable components reference terms need to be
  mapped" — **verified (read)**.
- I-ADOPT does not judge method comparability.

**(d) Scaling.**
- I-ADOPT is explicitly compositional: a new variable is a new *combination* of reusable entity, property and
  constraint terms taken from existing vocabularies (PATO, GO, WoRMS…).
- The CoRDI paper reports that automatic role assignment is hard for broad ontologies. For example, it cannot always
  tell an ObjectOfInterest from a Matrix or a ContextObject, so it falls back to the generic "ContextObject" role —
  **verified (read)**.
- This is a useful warning for PEE: role assignment is the hard part, not the vocabulary.

**(e) Licence.** The ontology and site are **CC BY 4.0**; the CoRDI paper is CC BY 4.0 — **verified (read)**.

**(f) PEE implications.**
- Store the *measurand* as a composition, not as a category-specific label:
  - `property` (energy, mass, duration, sound pressure level…);
  - `objectOfInterest` (the appliance, or a process such as "programme run");
  - `matrix` / `contextObject` (load, room, food batch);
  - `constraints[]`, each with a target component (programme = eco; load = rated capacity; fan = max);
  - `statisticalModifier` (mean of n runs, max);
  - `basis` as an explicit **denominator entity** (one programme run, one year at 280 cycles, 100 cycles, one
    portion, one m³ of air).
- "0.9 kWh per cycle", "the eco programme used 0.9 kWh" and "0.9 kWh during a complete wash" all map to:
  property = energy; ObjectOfInterest = dishwasher; denominator = one complete programme run; constraint =
  programme eco (in the 2nd), unknown (in the 1st and 3rd).

## 2. LOINC six-axis model

Sources:
- Huff et al. 1998, *Development of the LOINC vocabulary*, JAMIA, https://pmc.ncbi.nlm.nih.gov/articles/PMC61302/ —
  **verified (read)** (first 100k characters).
- SNOMED International LOINC implementation guide,
  https://docs.snomed.org/implementation-guides/loinc-implementation-guide/about-loinc/2.1-loinc-features —
  **verified (read)** (official secondary source quoting the LOINC Users' Guide).
- HL7 FHIR R4, https://hl7.org/fhir/R4/loinc.html — **verified (read)**.
- LOINC Users' Guide (loinc.org/kb/users-guide/…) — **not verified (HTTP 403)**.

**(a) Decomposition.**
- The axes are Component (analyte, with subparts for subspecies and challenge), Property (kind of quantity, e.g.
  mass concentration), Time aspect, System (usually the specimen), Scale (Qn / Ord / Nom / Nar) and Method.
- The 1998 syntax is `<component>.<subspecies>^<chall>:<property>:<timing>:<system>:<prec>:<method>` —
  **verified (read)**.

**(b) Conditions and basis.**
- **Time aspect is part of the term identity.** The values are PT (point in time) and interval values such as 24H;
  "Timed" means the duration is sent separately — **verified (read)** (Huff 1998).
- The SNOMED guide's example is urine sodium over 24 h, which uses the 24H time part — **verified (read)**.
- Challenge conditions (e.g. a glucose tolerance dose and time) sit inside the Component as "challenge" — **verified
  (read)** (syntax in Huff 1998).
- Instrument and lab-specific conditions are *excluded* from the name. Per a search snippet of the Users' Guide
  section "not part of the name", certain test-performance parameters are excluded — **not verified (snippet)**.

**(c) Comparability.**
- The **method axis is used only when the other five axes are insufficient** — "used only when information specified
  in the other five axes is insufficient" — **verified (read)** (Huff 1998).
- The test is clinical: methods get separate codes when the results differ in reference range, sensitivity or
  specificity, i.e. when they would belong in separate columns. Comparable methods share a *methodless* code —
  **verified (read)** (Huff 1998 states the principle; the word "methodless" is not used there).
- The SNOMED guide says method is included only when it "makes an important difference" to interpretation —
  **verified (read)**.
- A LOINC forum post says to use the methodless code when the lab reports screen and confirmation in the same field —
  **not verified (snippet)**.
- Codes are created only for combinations "that exist in real systems" — **verified (read)**.

**(d) Scaling.**
- Each axis value is a reusable **Part** (LP codes).
- Terms are pre-coordinated, but Parts form a multi-axial hierarchy that supports subsumption; FHIR exposes the Parts
  as filterable properties — **verified (read)** (FHIR R4).
- New domains need new Parts and new pre-coordinated terms. LOINC does not compose terms at run time.

**(e) Licence.**
- LOINC is free of charge under the Regenstrief licence and terms of use (SNOMED guide, **verified (read)**).
- Value sets must carry the LOINC copyright notice (FHIR, **verified (read)**).
- The exact terms at loinc.org/terms-of-use are **not verified (403)**.
- PEE should reuse the *pattern*, not LOINC content.

**(f) PEE implications.**
- Make **time aspect / basis an identity axis of the measurand**, not a free-text note. Its values: per run / cycle,
  per hour, per year at stated usage, per 100 cycles, point-in-time reading, or maximum over the run.
- Adopt LOINC's **"method only when it matters"** rule:
  - store `method` always when known;
  - treat it as a comparability-*splitting* axis only where knowledge says that methods give non-comparable results
    (e.g. a publisher's own drying score versus the EN 60436 drying index).
- Default to *method-less* comparability within one publisher.

## 3. W3C SOSA/SSN and ISO 19156:2023 (OGC OMS)

Sources:
- W3C Recommendation 2017, https://www.w3.org/TR/vocab-ssn/ — **verified (read)** (first 100k characters).
- New SOSA/SSN edition Public Draft, https://w3c.github.io/sdw-sosa-ssn/ssn/ — **verified (read)** (summary of the
  change history).
- OGC 20-082r4 = ISO 19156:2023 *Observations, measurements and samples*, https://docs.ogc.org/as/20-082r4/20-082r4.html
  — **verified (read)**: downloaded, converted to text, and §8.2, §9.2.4–9.2.7, §9.10 and Annex C read.
- https://www.ogc.org/standards/om/ — **verified (read)**.

**(a) Decomposition.**
- In SOSA an *Observation* is an act that carries out a **Procedure** to estimate a property value of a
  **FeatureOfInterest**. Its parts are:
  - an **ObservableProperty** ("a measurable quality of a FeatureOfInterest");
  - a **Sensor** — a device, agent (including humans) or software;
  - a **Result** (hasSimpleResult);
  - **phenomenonTime** (the time the result applies to);
  - **resultTime**;
  - **Sample** (represents a FeatureOfInterest);
  - in ssn-system, **Condition** ("a range for a quality that constrains a system's operation").
- All of the above is **verified (read)**.
- ISO 19156:2023 keeps this core and adds the following, all **verified (read)**:
  - **proximate** versus **ultimate** feature of interest. The proximate one is the proxy that is actually measured
    (a sample, a clause); the ultimate one is "the entity that is ultimately of interest";
  - **ObservingProcedure** — "description of steps performed in order to determine the value of an
    observableProperty by an Observer";
  - Observer, Host, Deployment;
  - **parameter: NamedValue** — "Arbitrary event-specific parameter";
  - **resultQuality**;
  - validTime.

**(b) Conditions and basis.**
- ISO 19156:2023 §9.2.4 is the key source text — **verified (read)**:
  - the ObservingProcedure is "a generic or standard procedure, rather than an event-specific process";
  - event-specific settings — "instrument settings, calibrations or inputs, local position, detection limits, asset
    identifier or operator" — are recorded as **parameters** that augment the procedure;
  - parameters tightly bound to the procedure may go in the procedure description;
  - parameters "should not be used instead of the procedure", and should not repeat existing attributes;
  - its worked example adds a `samplingDepth` parameter rather than making each depth a new feature.
- Time: **phenomenonTime** is mandatory (exactly one). If the result averages several samples, phenomenonTime is the
  interval they cover — **verified (read)**. This is how O&M expresses an interval basis.
- There is no explicit "denominator / basis" construct. That belongs to the observed property or the unit.

**(c) Comparability.**
- Neither SOSA nor OMS defines an equivalence test.
- They supply the *slots* a test needs: same observedProperty, same ultimate FoI type, same procedure, parameters and
  quality.
- The 2017 SOSA page does not discuss comparison — **verified (read)**.

**(d) Scaling.**
- Domain-neutral: domains add property, procedure and feature vocabularies.
- The new SOSA draft adds the following — **verified (read)**:
  - a generic `Property`, replacing ObservableProperty and ActuatableProperty, which are deprecated;
  - ObservationCollection;
  - Sample subclasses (Material, Spatial, Statistical).

**(e) Licence.**
- SOSA/SSN 2017: W3C and OGC copyright under W3C document-use rules; the ontology files are under the W3C software
  licence (not separately verified) — **verified (read)** for the document notice.
- OGC 20-082r4: a free OGC copyright licence that permits use, copy, modify and distribute with notices retained —
  **verified (read)**.
- The ISO 19156:2023 edition itself is paid; the OGC edition has "identical content" — **verified (read)**.

**(f) PEE implications.**
- Separate the **standard procedure** (the method: "EN 60436 eco at rated capacity", "publisher X's 1 kg chips
  protocol") from the **event parameters** (setting = max fan, distance = 1 m, room 30 m³, temperature 200 °C, load
  = 12 place settings).
- Record **proximate versus ultimate FoI**:
  - in a review, the ultimate FoI is the product model;
  - the proximate one is the tested unit or sample (a single review unit, a batch of food);
  - this decides whether a result describes "the model" or "one unit".
- Keep **phenomenonTime/interval semantics**, i.e. over what the result was aggregated (one run, the mean of 3 runs,
  a 7-day use).
- Keep **resultQuality**: n runs, rounding, uncertainty if given.
- Keep the **observer/publisher** as the Observer/Host (who measured, with which instrument).

## 4. QUDT and OM (units and quantity kinds)

Sources:
- https://www.qudt.org/ — **verified (read)**: CC BY 4.0, last updated 2026-09-15.
- QUDT user guide, https://github.com/qudt/qudt-public-repo/wiki/User-Guide-for-QUDT — **verified (read)**.
- https://qudt.org/vocab/unit/KiloW-HR — **verified (read)**.
- https://qudt.org/vocab/quantitykind/Energy — **verified (read)**.
- OM 2.0, https://github.com/HajoRijgersberg/OM — **verified (read)**: CC BY 4.0; Rijgersberg et al., *Semantic Web*
  4(1) 2013, doi:10.3233/SW-2012-0069 (paper not opened).

**(a) Decomposition.**
- QUDT: Quantity → QuantityValue (value + unit); Unit → hasQuantityKind and conversionMultiplier.
- QuantityKind → dimension vector (A, E, L, I, M, H, T, D exponents).
- Example: kWh has quantity kinds Energy and ElectricEnergy, dimension A0E0L2I0M1H0T-2D0, conversionMultiplier
  3.6e6, and factor units kW and h — all **verified (read)**.
- OM: Measure = numerical value + unit, attached to a Quantity (e.g. Diameter) — **verified (read)**.

**(b) Conditions and basis.**
- Neither model encodes conditions.
- **Basis is not captured by the unit**: "kWh" and "kWh per cycle" have the same dimension. "Per cycle" is a count
  basis that dimension vectors cannot see.
- **Same dimension does not mean the same kind.** The QUDT guide notes that energy and torque share a dimension and a
  unit but form different commensurability families through curated `specializationOf` and `exactMatch` relations —
  **verified (read)**.
- This matches VIM 1.2 Note 2 (see §6).

**(c) Comparability.**
- Unit conversion is valid only within one quantity kind or commensurability family.
- QUDT decides *convertibility*, not *comparability of results*.

**(d) Scaling.** Strongly compositional: units are built from factor units with exponents (`hasFactorUnit`), and
quantity kinds are curated with broader/specialisation links.

**(e) Licence.** QUDT is CC BY 4.0 and OM 2.0 is CC BY 4.0 — both **verified (read)**. PEE can reuse identifiers or
small extracts with attribution.

**(f) PEE implications.**
- Store `quantityKind` and `unit` separately, and convert units only within a kind.
- Store **basis as its own field**, never folded into the unit string. "0.9 kWh/cycle" becomes unit kWh, kind
  Energy, basis = one programme run. "kWh/annum" becomes unit kWh, basis = one year at a stated usage pattern.
- Do not treat two values as the same kind just because their dimensions match. Examples: sound power level and
  sound pressure level are both dB; CADR and airflow are both m³/h.

## 5. OBOE (Extensible Observation Ontology)

Sources:
- https://github.com/NCEAS/oboe/ — **verified (read)**: v1.2, CC BY 3.0.
- `oboe-core.owl`, https://raw.githubusercontent.com/NCEAS/oboe/master/oboe-core.owl — **verified (read)** (rdfs
  comments).
- W3C SDW alignment, https://www.w3.org/2015/spatial/wiki/Alignment_to_OBOE.html — **verified (read)**.
- https://semtools.ecoinformatics.org/oboe.html — **verified (read)**.
- Madin et al. 2007, *Ecological Informatics* 2:279–296 — **not verified (snippet)**.

**(a) Decomposition.**
- An **Observation** of an **Entity** groups **Measurements**.
- Each Measurement has a **Characteristic** (the property), a **Standard** (the unit or controlled vocabulary), a
  **Protocol** and a value; `hasPrecision` also exists.
- In the W3C alignment, an OBOE Measurement corresponds to a sosa:Observation, a Characteristic to an
  ObservableProperty, and a Protocol to a Procedure — **verified (read)**.

**(b) Conditions and context.**
- `hasContext`: "one observation serves as the context for another observation". The domain is the contextualised
  observation and the range is the context.
- "The assertions made by contextual observations are assumed of the contextualized observations." Context is
  **transitive**.
- All of the above is **verified (read)** (oboe-core.owl comment).
- So conditions are **themselves observations**. For example, an observation of a room (volume 30 m³, temperature
  21 °C) is the context of an observation of the purifier's noise. That room observation can be shared by every
  measurement made in the same test session.

**(c) Comparability.**
- Not formalised. Shared context, characteristic, standard and protocol give the basis for integrating data —
  inferred from the model, not stated.

**(d) Scaling.**
- Entities, characteristics and standards are extension points for domain ontologies — **verified (read)** (GitHub
  README / semtools page).

**(e) Licence.** CC BY 3.0 (GitHub README) — **verified (read)**.

**(f) PEE implications.**
- Model a review's **test session / test setup as a context observation** that many result observations point to:
  room, load, programme, instrument, ambient conditions.
- Transitive inheritance avoids losing conditions between modules. A downstream module resolves the context chain
  instead of relying on a copy that may be lost.
- This answers PEE's "meaning does not survive between modules" failure directly. Conditions are stored once, by
  reference, and are inherited.

## 6. JCGM 200:2012 (VIM 3) — exact definitions

All sources are the official online VIM at jcgm.bipm.org, and every entry was **verified (read)**:

| Entry | Source | Content |
|---|---|---|
| **1.2 kind of quantity** | https://jcgm.bipm.org/vim/en/1.2.html | "aspect common to mutually comparable quantities". Note 2: quantities of the same kind have the same dimension, but the same dimension does not imply the same kind (energy versus moment of force). |
| **2.3 measurand** | https://jcgm.bipm.org/vim/en/2.3.html | "quantity intended to be measured". Note 1: specifying a measurand requires the kind of quantity *and* a description of the state of the phenomenon, body or substance carrying it. Note 3: the measuring system and its conditions may change the phenomenon, so the measured quantity may differ from the measurand (a rod at 23 °C versus a specified 20 °C). |
| **2.5 measurement method** | https://jcgm.bipm.org/vim/en/2.5.html | "generic description of a logical organization of operations used in a measurement". |
| **2.6 measurement procedure** | https://jcgm.bipm.org/vim/en/2.6.html | "detailed description of a measurement according to one or more measurement principles and to a given measurement method", including the measurement model and any calculation. It may state a target uncertainty. |
| **2.24 reproducibility condition** | https://jcgm.bipm.org/vim/en/2.24.html | A condition including different locations, operators and measuring systems, with replicate measurements on the same or similar objects. Note 2: a specification "should give the conditions changed and unchanged". |
| **2.46 metrological comparability** | https://jcgm.bipm.org/vim/en/2.46.html | Comparability "for quantities of a given kind, that are metrologically traceable to the same reference". |
| **2.47 metrological compatibility** | https://jcgm.bipm.org/vim/en/2.47.html | The property of a set of results for a **specified measurand** such that the difference of any pair is smaller than a chosen multiple of the standard uncertainty of that difference. Note 1: it is the criterion for deciding whether results refer to the same measurand. |
| **2.52 influence quantity** | https://jcgm.bipm.org/vim/en/2.52.html | A quantity that, in a direct measurement, "does not affect the quantity that is actually measured" but affects the relation between indication and result. Example 3: the micrometer's temperature is an influence quantity, while the rod's own temperature may be part of the measurand's definition. |

**Licence.** JCGM documents are © JCGM/BIPM and free to read online. Their reuse terms were not checked; quote
minimally.

**PEE implications (central).**
- VIM gives the principled split PEE is missing. A condition is either:
  1. **part of the measurand definition** (state of the object: the programme, load, food quantity, fan setting,
     distance for a sound-pressure reading — changing it changes *what* is measured); or
  2. an **influence quantity** (ambient temperature, supply voltage, instrument — changing it changes the
     *result*, not the measurand); or
  3. part of the **measurement procedure / method** (publisher protocol, calculation such as the mean of 3 runs or a
     normalisation to rated capacity).
- Comparability is graded:
  - **same kind** → units convertible;
  - **same measurand** (kind + basis + state constraints) → values describe the same thing;
  - **same procedure, or reproducibility conditions declared** → values can be ranked across publishers;
  - **compatibility** (difference within uncertainty) → the values agree.
- Review data rarely has uncertainty. So cross-publisher *ranking* should normally be blocked unless the
  procedures are declared equivalent: same standard, same programme, same load.

## 7. Consumer-appliance energy-label regulation: basis and programme are part of the measurand

Sources:
- Commission Delegated Regulation (EU) 2019/2017 (household dishwashers, energy labelling), legislation.gov.uk copy:
  - Annex I definitions, https://www.legislation.gov.uk/eur/2019/2017/annex/I — **verified (read)**;
  - Annex III label, https://www.legislation.gov.uk/eur/2019/2017/annex/III — **verified (read)**;
  - Annex IV methods, https://www.legislation.gov.uk/eur/2019/2017/annex/IV — **verified (read)**.
- EUR-Lex CELEX:32019R2017 — **not verified** (bot challenge).
- IEC 60436 — the webstore page I tried (62357) was the wrong publication, so it is **not verified**. Annex IV
  refers to harmonised standards in general terms.

**Definitions (Annex I), verified (read):**
- **'programme'** — "a series of operations that are pre-defined and are declared by the supplier as suitable for
  specified levels of soil or types of load, or both".
- **'cycle'** — "a complete cleaning, rinsing, and drying process, as defined by the programme selected, …until all
  activity ceases".
- **'eco programme energy consumption' (EPEC)** — energy consumption for the eco programme, "expressed in kilowatt
  hour per cycle".
- **'rated capacity'** — the maximum number of place settings, including serving pieces, cleaned, rinsed and dried in
  one cycle.
- **'programme duration'** — from initiation, excluding user delay, until the end is indicated and the load is
  accessible.

**Annex IV, verified (read):**
- Energy, EEI, water, duration, cleaning, drying and noise "shall be measured and/or calculated using the eco
  programme with the household dishwasher loaded at rated capacity".
- Energy, water, duration, cleaning and drying "shall be measured concurrently".
- EEI = EPEC/SPEC × 100, where SPEC is a function of place settings. This is a *derived* quantity normalised to
  capacity.
- Cleaning and drying are **indices relative to a reference dishwasher**: a ratio measurand that is meaningful only
  against that reference.

**Annex III label, verified (read):**
- The label shows EPEC "in kWh per 100 cycles", whereas Annex I and IV express EPEC in kWh **per cycle**.
- So one regulation uses two **bases** for the same measurand, and the basis must be explicit to compare values.

**Implication.**
- The legally defined measurand "dishwasher energy" = energy × basis (one complete cycle, or 100 cycles) ×
  programme (eco) × load (rated capacity) × procedure (harmonised standard). All five are identity-bearing.
- A review's "0.9 kWh in our eco test" matches the regulated measurand only when the programme and load match.
  Otherwise it is the same *property and basis*, but with different constraints and procedure. That allows
  within-publisher comparison, not cross-publisher ranking against label values.
- Manufacturer label values are declarations under a standard procedure, not independent tests. This is consistent
  with the PEE non-negotiables.

---

## Synthesis: recommended "scientific contract of the representation" for a PEE observation

The aim is a stored observation that can later answer "describe / compare within a publisher / compare across
publishers / rank" without re-reading the page. The structure below draws on each source as follows:

| Source | What PEE takes from it |
|---|---|
| I-ADOPT | the measurand composition |
| VIM | the measurand / influence / procedure split |
| LOINC | time aspect as identity; method only when it splits |
| O&M 2023 | procedure versus event parameters; proximate versus ultimate feature of interest; quality |
| OBOE | context as shared, inherited observations |
| QUDT | the kind/unit separation |

```
Observation
  measurand (identity; I-ADOPT + VIM 2.3 + LOINC axes)
    property            -> reusable property term (energy, duration, mass, sound pressure level, airflow rate…)
    quantityKind        -> QUDT-style kind (dimension is not identity; VIM 1.2 N2)
    objectOfInterest    -> entity or process (appliance | programme run | cooked batch | room air)
    basis               -> denominator entity + count (1 programme run | 100 runs | 1 year @ stated usage | 1 portion | 1 h)
    timeAspect          -> point | over-run | interval(duration) | max/min-over-interval (LOINC Time + modifier)
    statisticalModifier -> mean of n | max | single run
    stateConstraints[]  -> {target component, dimension (setting|programme|load|distance|temperature|food), value}
                           (VIM 2.3 N1: they define WHAT is measured)
    scale               -> quantitative | ordinal (score/10) | nominal | narrative (LOINC Scale)
  value                 -> number/category + unit (unit separate from basis)
  procedure             -> {name/standard or publisher protocol id, method class, version} (O&M ObservingProcedure; VIM 2.6)
  parameters[]          -> event-specific: instrument, settings not in the measurand, operator (O&M 9.2.4)
  influenceConditions[] -> ambient temperature, supply, water hardness… (VIM 2.52)
  context               -> ref to a shared TestSession/Setup observation (OBOE hasContext, transitive)
  featureOfInterest     -> ultimate = product model; proximate = the tested unit or sample
  observer              -> publisher + instrument (+ declaration versus independent test)
  phenomenonTime / resultTime / publicationDate
  resultQuality         -> n runs, rounding, uncertainty, reference (e.g. "index relative to reference machine")
  provenance            -> source span, extraction rule version
  unknowns[]            -> explicit list of identity slots NOT stated (needed so absence is not read as equality)
```

Comparability decision ladder:

1. **Same quantityKind** (otherwise not comparable).
2. **Same basis and timeAspect**, or a declared conversion. Examples: per cycle ↔ per 100 cycles is exact; per year
   needs the stated usage pattern.
3. **Same stateConstraints** that are part of the measurand. Any *unknown* slot blocks a claim of equality.
4. **Within a publisher**: the same procedure is assumed when the publisher declares a fixed protocol.
5. **Across publishers**: requires the same named standard procedure, or knowledge that the procedures are
   non-splitting (LOINC's methodless rule); otherwise only "same property" and no ranking.
6. **Compatibility / agreement** only when uncertainty is known (VIM 2.47); otherwise report the values side by side.
