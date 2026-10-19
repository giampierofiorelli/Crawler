# E — Comparability of test results and methods (research for PEE S87c)

Date: 2026-10-19. Researcher: Claude (sub-agent). Scope: primary sources only where reachable.

**How the sources are marked**

- **verified (read):** I opened the page or document and read the cited passage, either through WebFetch or through
  `curl` plus text extraction.
- **not verified (snippet):** only a search-result snippet or a secondary summary was available.
- **Access refusals were respected, not bypassed:**
  - EUR-Lex HTML returned an AWS WAF challenge (HTTP 202 `x-amzn-waf-action: challenge`). The EU texts were read
    instead from the EU Publications Office Cellar (official content negotiation on
    `http://publications.europa.eu/resource/celex/<CELEX>`) and from legislation.gov.uk.
  - loinc.org returned 403.
  - iso.org returned 403.
  - The BSI shop returned 429.
- Quotations are kept short.

---

## 0. Executive summary

Every domain studied reduces "are these two numbers comparable?" to the same four questions:

1. **Same measurand?** This means the same quantity *as fully specified*: the kind of quantity, the object, the state
   and conditions, the basis and the statistic.
2. **Same procedure, or a demonstrated relation between procedures?** Identical procedure, a validated-equivalent
   procedure, or a procedure with a known, documented correction.
3. **Conditions within the stated reference intervals?**
4. **Is the difference larger than the combined uncertainty?** This is a compatibility test.

PEE should store enough per observation to answer each question later. It should also grade comparability on an
explicit scale, not as a yes/no tied to one publisher's protocol. The appliance regulations show that "the same number
on the label" is a fully specified measurand: programme, load, cycles, weighting, ambient and rounding are all fixed.
They also show that values for other programmes are *explicitly* "indicative only". Independent publishers differ in
how they version their methods:

- RTINGS versions explicitly and converts old results.
- CHOICE splits results into eras.
- Which? and HouseFresh describe their methods, with only partial version history.

---

## 1. Metrology (JCGM VIM, GUM, ISO/IEC 17025, ISO 13528)

### 1.1 VIM definitions (JCGM 200, online edition at jcgm.bipm.org) — all verified (read)

**Measurand (VIM 2.3)** — <https://jcgm.bipm.org/vim/en/2.3.html> — verified (read)

- The measurand is the "quantity intended to be measured".
- Note 1 says that its specification "requires knowledge of the kind of quantity, description of the state of the
  phenomenon, body, or substance carrying the quantity".
- Note 3 warns that the quantity actually measured "may differ from the measurand as defined".
- **PEE implication:** "noise 44 dB" is *not* a measurand. "A-weighted sound power level, eco programme, rated load,
  re 1 pW" is one.

**Measurement procedure (VIM 2.6)** — <https://jcgm.bipm.org/vim/en/2.6.html> — verified (read)

- A measurement procedure is a "detailed description of a measurement according to one or more measurement principles
  and to a given measurement method, based on a measurement model and including any calculation to obtain a measurement
  result".
- Note 1 says that it is "usually documented in sufficient detail to enable an operator to perform a measurement".
- **PEE implication:** the calculation, for example a CADR estimate derived from a decay curve, is *part of* the
  procedure.

**Influence quantity (VIM 2.52)** — <https://jcgm.bipm.org/vim/en/2.52.html> — verified (read)

- An influence quantity "does not affect the quantity that is actually measured, but affects the relation between the
  indication and the measurement result".
- Note 2: in the GUM the concept also covers quantities that affect the measured quantity itself.
- **PEE implication:** ambient temperature, room volume, mains voltage and firmware are all candidate influence
  quantities to record.

**Reference operating condition (VIM 4.11)** — <https://jcgm.bipm.org/vim/en/4.11.html> — verified (read)

- It is the operating condition "prescribed for evaluating the performance of a measuring instrument or measuring
  system or for comparison of measurement results".
- Note 1: it specifies "intervals of values of the measurand and of the influence quantities".
- **PEE implication:** reference conditions are *intervals*. Comparability can be checked as interval containment.

**Metrological traceability (VIM 2.41)** — <https://jcgm.bipm.org/vim/en/2.41.html> — verified (read)

- It means that a result "can be related to a reference through a documented unbroken chain of calibrations".
- Note 1: for some quantities the reference can be a measurement procedure.

**Metrological comparability (VIM 2.46)** — <https://jcgm.bipm.org/vim/en/2.46.html> — verified (read)

- It is the comparability of results "for quantities of a given kind, that are metrologically traceable to the same
  reference".
- Note 2: it "does not necessitate that the measured quantity values and associated measurement uncertainties compared
  be of the same order of magnitude".
- **Key distinction:** *comparability* is about a common reference, that is, being able to put the two values on one
  scale.

**Metrological compatibility (VIM 2.47)** — <https://jcgm.bipm.org/vim/en/2.47.html> — verified (read)

- It is the property of a set of results "for a specified measurand" such that the absolute difference of any pair "is
  smaller than some chosen multiple of the standard measurement uncertainty of that difference".
- Note 1: it is "the criterion for deciding whether two measurement results refer to the same measurand or not".
- Note 2: correlation matters. Without correlation, the uncertainty of the difference is the root-sum-square of the two
  standard uncertainties.
- **Key distinction:** *compatibility* is about agreement within uncertainty.
- PEE needs both:
  - comparability, to decide whether two values *may* be compared;
  - compatibility, to decide whether they *agree* or whether the difference is meaningful.

**Repeatability, intermediate precision and reproducibility conditions (VIM 2.20, 2.22 and 2.24)** — verified (read)

- Intermediate precision (2.22, <https://jcgm.bipm.org/vim/en/2.22.html>): conditions that include "the same
  measurement procedure, same location, and replicate measurements ... over an extended period of time". These "may
  include other conditions involving changes". Note 1 lists new calibrations, calibrators, operators and measuring
  systems.
- Reproducibility (2.24, <https://jcgm.bipm.org/vim/en/2.24.html>): conditions with "different locations, operators,
  measuring systems". Note 1: these "may use different measurement procedures".
- Both definitions say that a specification "should give the conditions changed and unchanged".
- **PEE mapping:**
  - Within one publisher, on one method version, over time: this is roughly *intermediate precision*.
  - Across publishers: this is *reproducibility* conditions, possibly with different procedures.

### 1.2 GUM (JCGM 100:2008) — verified (read)

The PDF was downloaded from BIPM, <https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf>, and the text was
extracted. The DOI landing page is <https://www.bipm.org/doi/10.59161/JCGM100-2008E>.

- **2.3.1:** standard uncertainty is "uncertainty of the result of a measurement expressed as a standard deviation".
- **2.3.5:** expanded uncertainty is an "interval about the result".
- **2.3.6:** the coverage factor k is "typically in the range 2 to 3".
- **3.1.2:** a result "is complete only when accompanied by a statement of the uncertainty".
- **3.1.3:** "The measurand should be defined with sufficient completeness with respect to the required accuracy".
  - Its example is a steel bar, whose definition needs temperature and pressure only if micrometre accuracy is wanted.
  - *This is the formal basis for "sufficiency for a need".* How completely the measurand must be defined depends on
    the accuracy the decision requires.
- **3.3.2:** the sources of uncertainty include "(a) incomplete definition of the measurand" and "(d) inadequate
  knowledge of the effects of environmental conditions".
- **D.1.1:** "incomplete definition of the measurand introduces into the uncertainty ... a component of uncertainty".
- **6.3.1 Note:** known systematic corrections should be applied, not absorbed into an enlarged "uncertainty".
- **PEE implication:**
  - When a publisher gives no uncertainty, PEE must use a *prior* (Type B evaluation, GUM 2.3.3). Possible priors are
    the regulation's verification tolerance or the standard's stated precision; see §2 and §2.4.
  - Missing measurand details should *widen* the uncertainty, not be silently ignored.

### 1.3 ISO/IEC 17025:2017, method selection and validation

The standard itself is paywalled. These sources were read:

- **European Accreditation FAQ 40.5:**
  <https://european-accreditation.org/sp_accordion_faqs/40-5-question-on-validation-verification-of-methods/> —
  verified (read).
  - It cites clause 7.2.2.1: "the laboratory shall validate non-standard methods, laboratory-developed methods and
    standard methods used outside their intended scope".
  - It says unmodified standard methods "just have to be verified due to article 7.2.1.5".
  - A "standard" method is a "document, established by consensus and approved by a recognized body", following ISO/IEC
    Guide 2.
  - "Standard methods are expected to include an indication of their performance characteristics".
- **EA FAQ on using a standard method outside its scope:** <https://european-accreditation.org/?p=43475> — verified
  (read).
  - Such a method "could not be considered and described simply as a standard method". It is an in-house method
    "adapted from" or "based on" the standard, and it must be "validated" for the intended application.
- **PEE implication:** the `method_status` field needs these values:
  - `standard_unmodified` (for example AHAM AC-1, or the EU regulation method);
  - `standard_modified_or_out_of_scope` (for example a CADR test in a different room size, or CHOICE's "modified IEC
    Draft Standard load");
  - `publisher_in_house` (for example the HouseFresh incense test or the RTINGS benches);
  - `undocumented`.
- **Claim boundary:** only the first value supports the "identical method" grade across publishers. "Based on standard
  X" is *not* the same as standard X.

### 1.4 Proficiency testing (ISO 13528), how labs decide that two results agree

ISO 13528 itself was not reachable (iso.org returned 403).

- **Eurachem leaflet "Understanding PT performance assessment":**
  <https://eurachem.org/images/stories/leaflets/pt/pt_perf_assmnt/PT_Understand_Evaluation_V1_EN.pdf> — verified
  (read; the PDF text was extracted).
  - **z score:** it compares the deviation from the assigned value with the standard deviation for proficiency
    assessment (σ_pt). z′ is used when u(x_pt) > 0.3 σ_pt.
  - **ζ (zeta) score:** it "states whether the laboratory's result agrees with the assigned value within the respective
    uncertainty".
  - **E_n:** it "uses a combination of expanded uncertainties as the normalisation factor (≈95 %)".
  - **Interpretation, per ISO 13528:2022 clause 9.4.2:**
    - |score| ≤ 2.0 is acceptable;
    - 2.0 < |score| < 3.0 is a warning;
    - |score| ≥ 3.0 is an action signal.
    - "|En| < 1 ... indicate[s] successful (acceptable) performance".
- **NIST Dataplot reference:** <https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/zetascor.htm> —
  verified (read).
  - ζ = (x − x_ref)/√(u(x)² + u(x_ref)²).
  - Above 2 is a warning signal; above 3 is an action signal.
  - It cites ISO 13528:2005, pp. 29–30.
- **PEE implication:** these scores give an operational *agreement* test between two observations of the same
  measurand. For two publishers' values x₁ and x₂ with uncertainties u₁ and u₂, compute
  ζ = (x₁−x₂)/√(u₁²+u₂²):
  - |ζ| ≤ 2: the results agree, and the difference is not meaningful.
  - |ζ| ≥ 3: the results genuinely disagree. Investigate: a different measurand, a different unit, firmware, or an
    error.
- **Caveat:** publishers almost never state u. PEE would use documented priors and must label the outcome *modelled*,
  not measured.

---

## 2. Appliance regulations and standards as formal measurand definitions

### 2.1 Dishwashers

**EU 2019/2017 (energy label)** — verified (read). Source: legislation.gov.uk, as adopted:
<https://www.legislation.gov.uk/eur/2019/2017/annex/I/adopted>, `/annex/III/`, `/annex/IV/` and `/annex/IX/`.

- **Definitions (Annex I):**
  - EPEC is the "energy consumption ... for the eco programme, expressed in kilowatt hour per cycle".
  - EPWC is in "litres per cycle".
  - Programme duration T_t runs from initiation, "excluding any user programmed delay, until the end of the programme
    is indicated and the user has access to the load".
  - "eco" is the programme "declared by the manufacturer as suitable to clean normally soiled tableware".
  - Rated capacity is the "maximum number of place settings ... when loaded in accordance with the supplier's
    instructions".
- **Measurement (Annex IV):**
  - All label parameters are "measured and/or calculated using the eco programme with the household dishwasher loaded
    at rated capacity".
  - Energy, water, duration, cleaning and drying are "measured concurrently".
  - Rounding:
    - EPWC to 0.1 L;
    - T_t to the nearest minute;
    - noise "in dB(A) with respect to 1 pW", to an integer (that is, *sound power*, not sound pressure at a distance).
  - EEI = EPEC/SPEC × 100, where:
    - SPEC = 0.025·ps + 1.35 for ps ≥ 10 and width > 50 cm;
    - otherwise SPEC = 0.09·ps + 0.45.
- **Label (Annex III):** "eco programme energy consumption (EPEC) in kWh per 100 cycles, rounded to the nearest
  integer".
  - **Basis conversion:** label kWh/100 cycles = 100 × EPEC (kWh/cycle), with a rounding loss (EPEC has 3 decimals; the
    label value is an integer).
- **Verification tolerances (Annex IX, Table 5):**

  | Parameter | Tolerance |
  |---|---|
  | EPEC | +5 % |
  | EPWC | +5 % |
  | I_C | −14 % |
  | I_D | −12 % |
  | T_t | +5 % or 10 min, whichever is longer |
  | Noise | +2 dB(A) re 1 pW |

  - These tolerances are explicitly *not* an allowance for the supplier's declaration: they "shall not be used by the
    supplier as an allowed tolerance".
  - Declared values may not be "more favourable for the supplier than the values reported in the technical
    documentation".

**EU 2019/2022 (ecodesign)** — verified (read). Source: EU Cellar,
`http://publications.europa.eu/resource/celex/32019R2022`.

- The same measurement basis applies: "The eco programme at rated capacity shall be used".
- The user information must include values for all programmes, plus "information that the values given for programmes
  other than the eco programme are indicative only".
- **PEE implication:** a manufacturer's non-eco programme value is legally *indicative*. It is not on the regulated
  measurand basis.

**Contrast with independent tests:**

- **Which? (verified, read):** <https://www.which.co.uk/reviews/dishwashers/article/how-we-test-dishwashers-aaVzw8e0VrkY>
  - "We test the energy and water efficiency of a dishwasher on both the main and eco cycles".
  - It does not rely on the label "because they're almost always based on the eco program".
  - Running cost assumes the main programme five times a week.
  - Noise is measured with a sonometer during the wash phase and judged by a 3-expert panel.
  - Score weights: cleaning 42 %, drying 18 %, energy and water 20 %, ease of use 15 %, quietness 5 %.
  - **Result:** a Which? "noise" result is *not* the same measurand as label dB(A) re 1 pW (sound power). A Which?
    main-programme kWh is not EPEC.
- **CHOICE (Australia; verified, read):**
  <https://www.choice.com.au/home-and-living/kitchen/dishwashers/articles/how-we-test-dishwashers>
  - It selects the auto programme over normal when available.
  - It uses a "modified IEC Draft Standard load".
  - The method is "based partly on the current Australian Standard and partly on the ... IEC Draft Standard".
  - The method "changes once in a while"; in 2024 drying was folded into the soiled test.
  - Results are partitioned into "2023 and prior" and "2024+". This is an explicit *method-era boundary* published by
    the tester itself.

### 2.2 Tumble dryers, EU 2023/2534 (energy label; applies from 1 July 2025)

Verified (read). Source: EU Cellar, `http://publications.europa.eu/resource/celex/32023R2534`; ELI
<http://data.europa.eu/eli/reg_del/2023/2534/oj>.

- **Eco programme:** "able to dry cotton laundry from an initial moisture content of the load of 60 % down to a final
  moisture content of the load of 0 %".
- **Loads:** "full load" is the rated capacity; "partial load" is "half of the rated capacity".
- **Annex IV:**
  - The weighted energy consumption, weighted programme duration, final moisture content and condensation efficiency
    are calculated "on the basis of three drying cycles at full load and four drying cycles at partial load".
  - These quantities are measured concurrently.
  - The eco programme is run "with no further modification of the final moisture content setting".
- **Label:**
  - "weighted average energy consumption per 100 drying cycles in kWh" (E_tC × 100, rounded to an integer);
  - "duration of the eco programme at full load";
  - noise is the weighted L_WA "in the eco programme at full load during the drying cycle".
  - **Mixed bases:** the energy figure is *weighted* (full plus partial loads), while duration and noise are *full
    load*.
- **Verification (Table 7):**
  - E_dry and T_dry: +6 %.
  - C_t: −6 %.
  - Noise: +2 dB.
  - Validity criterion: average final moisture content < 1.5 %.
- **PEE implication:** a reviewer's "drying time for a 4 kg load of mixed fabrics" fails to match the label measurand on
  three axes: load, textile and end condition. It is not comparable to the label T_dry. It is only comparable within
  that publisher's own method version.

### 2.3 Televisions and electronic displays, EU 2019/2013 (energy label)

Verified (read). Source: EU Cellar, `http://publications.europa.eu/resource/celex/32019R2013`.

- **Annex IV §1, on-mode power conditions:**
  - (a) "normal configuration";
  - (b) "ambient temperature of 23 °C +/- 5 °C";
  - (c) "dynamic broadcast video signal test loops representing typical broadcast content ... in standard dynamic range
    (SDR)", while for HDR the display "must automatically and correctly respond to the HDR metadata in the test loop";
    the reported value is the "average power consumed over 10 consecutive minutes";
  - (d) warm-up and stabilisation rules;
  - (e) ABC (automatic brightness control) switched off, or 100 lux at the sensor if it cannot be switched off.
- **"Normal configuration"** is the setting "recommended to the end-user by the supplier from the initial set up menu or
  the factory setting".
  - **PEE implication:** a reviewer's power reading in a *calibrated* picture mode is a different measurand.
- **Product information sheet (Annex V):** "On mode power demand for Standard Dynamic Range (SDR)", rounded to 0.1 W
  below 100 W and to an integer from 100 W.
- **Verification (Table 6):** on-mode power +7 %. Off, standby and networked standby: +0.10 W if ≤ 1 W, otherwise
  +10 %.
- **Status labels:** SDR and HDR power are *two different measurands*. They must never be merged.

### 2.4 Room air cleaners: ANSI/AHAM AC-1-2020 and IEC 63086

**ANSI/AHAM AC-1-2020** — verified (read). The PDF is the copy incorporated by reference in the US CFR, published by
Public.Resource.Org: <https://law.resource.org/pub/us/cfr/ibr/inc/ansi/aham.ac-1.2020.pdf>.

- **Purpose:** the methods "provide a means to compare and evaluate different brands".
- **Definition 3.14:** CADR is "the rates of contaminant reduction in the test chamber when the air cleaner is turned
  on, minus the rate of natural decay ... multiplied by the volume of the test chamber". It is "always the measurement
  of an air cleaner performance as a complete system".
- **Chamber:** 1008 ft³ is "treated as a constant" in the CADR equation.
- **Conditions:**
  - (21 ± 3) °C and (40 ± 5) % RH;
  - (115 ± 1) V, (60 ± 1) Hz.
- **Contaminant size ranges:** smoke 0.1–1.0 µm, dust 0.5–3 µm, pollen 5–11 µm.
- **Measurable range (Scope):**
  - minimum CADR: dust 10, smoke 10, pollen 25 cfm;
  - maximum CADR: dust 600, smoke 600, pollen 450 cfm.
  - Precision (2σ, 95 %): ±10 / ±10 / ±25 cfm.
  - "a CADR cannot be distinguished between zero (0) and a CADR rating less than those CADR limits".
  - *Note:* secondary sources quote older limits (450 cfm); the 2020 text read here gives 600 cfm for dust and smoke.
- **PEE implication:**
  - AHAM CADR is a single, explicitly bounded measurand. Two AHAM CADR values for the *same particle type* are
    identical-method comparable.
  - CADR above the stated maximum is outside the method's validated range, so it should be flagged.
  - Smoke, dust and pollen CADR are three distinct measurands.

**IEC 63086** — not verified (snippet).

- Search snippets of standards listings (BSI shop, DIN, globalspec) say:
  - IEC 63086-1:2020 (+A1:2023) is the general part;
  - IEC 63086-2-1 specifies "test methods for measuring the performance ... for the reduction of particulate
    pollutants", with "limits of measurability for the CADR ... in Annex A".
- The BSI page returned 429 and IEC/VDE previews were not readable, so the room volume, particle source and m³/h basis
  could not be confirmed.
- **Treatment:** consider IEC CADR (m³/h) and AHAM CADR (cfm) as *convertible units* but **not** an identical method,
  until the procedures are checked. The AHAM text's informative note gives "1 cfm = 1.699 m3h"; that conversion is
  arithmetic only.

**HouseFresh, an independent publisher with an in-house method** — verified (read):
<https://housefresh.com/how-we-test-air-purifiers/>

- Setup:
  - a 728 ft³ room;
  - incense smoke;
  - a PurpleAir Zen sensor, giving PM1, PM2.5 and PM10.
- Particle tests cover the highest speed and the "highest speed under 45 dBA".
- Since 2025 it estimates PM1 CADR "taking into account the natural ventilation of our 728 cubic feet test room".
- Method history:
  - testing began at the end of 2020;
  - PurpleAir Touch from 2021;
  - in 2024 it switched to the Zen sensor and "re-tested all air purifiers";
  - noise and energy have been measured together since 2024;
  - CADR estimates and the HouseFresh score since 2025.
- Comparability claims:
  - noise is measured "in the same location and using the same tools, so results can be compared across different
    brands and models";
  - the page does not state whether Touch-era and Zen-era particle data are comparable.
- **PEE implication:**
  - A HouseFresh "PM1 CADR" is a *derived estimate from a different procedure*: a different room volume, aerosol, size
    fraction and fan setting. It is **not comparable** to AHAM smoke CADR without a validated relation.
  - It *is* comparable within HouseFresh's post-2025 method era.
  - The instrument change in 2024 marks a method-version boundary.

### 2.5 What regulations and standards fix

| Element | Dishwasher label 2019/2017 | Tumble dryer label 2023/2534 | TV label 2019/2013 | AHAM AC-1-2020 |
|---|---|---|---|---|
| Programme or mode | eco | eco (60 %→0 % moisture) | normal configuration; SDR loop / HDR loop | max-speed system test (per standard) |
| Load | rated capacity (ps) | full and half; 3 + 4 cycles | n/a | contaminant type (smoke/dust/pollen) |
| Basis | kWh/cycle; label kWh/100 cycles; L/cycle; h:min | weighted kWh/100 cycles; full-load duration | W (10-min average) | cfm in 1008 ft³ chamber |
| Conditions | per harmonised standard | per harmonised standard | 23 ± 5 °C; ABC off or 100 lx | 21 ± 3 °C, 40 ± 5 % RH, 115 V |
| Noise basis | dB(A) re 1 pW (sound power) | L_WA, full load, drying cycle | n/a | n/a |
| Tolerance or precision | +5 % E, +5 % W, T +5 %/10 min, +2 dB | +6 % E, T; +2 dB | +7 % on-mode | ±10/±10/±25 cfm (2σ) |
| Validity range | n/a | final moisture < 1.5 % | n/a | min/max CADR |

Rows marked "per harmonised standard" were not opened. The harmonised standards (e.g. EN IEC 60436, EN 61121) were not
read.

---

## 3. Independent publishers: method versions and internal comparability

### 3.1 RTINGS, versioned test benches

Source: <https://www.rtings.com/company/versioned-test-benches> — verified (read). The article text was extracted from
the page's embedded data via `curl`; robots.txt permits it, disallowing only `/user_reviews/` and `/admin/`. The rendered
WebFetch view was empty.

- Ratings change for three reasons:
  - "Firmware updates";
  - "New test added or testing methodology changed";
  - "Adjustments of the weights of the ratings system".
- Changes are versioned: "All tests and weights adjustments are done at the same time and are versioned. A change log
  will also be posted".
  - Cadence: "For TVs, 1-2/year. For headphones: 2-3/year."
- The version is shown in the review: "The version of the test bench that was used for a review is listed on top of the
  review page".
- Products in the lab are "ported over to the new version", but "the text in the reviews isn't changed during the
  porting process, so ... the text may no longer be accurate for the new score".
- Older products appear in tables with "scores ... converted and grayed out to show that they are approximations".
- The embedded page data also shows per-review messages such as "We converted this review to Test Bench 2.3".
- Snippets only (not verified):
  - the laptop TB 0.9 introduced a "Previous Methodology Score" and a converted score
    (<https://www.rtings.com/laptop/tests/changelogs/0-9>);
  - the laptop TB 0.9.1 changed only a scoring curve while "actual test results didn't change"
    (<https://www.rtings.com/laptop/tests/changelogs/0-9-1>);
  - a discussion reports re-scoring 63 vacuums after TB 0.8.
- **PEE implications:**
  1. RTINGS separates **measurements** from **scores**. A scoring-curve change leaves measurements comparable but
     breaks score comparability, so PEE must store *which layer* a value belongs to (raw measurement vs. derived
     score).
  2. Converted older scores are, by the publisher's own words, "approximations". Grade them "convertible
     (approximate)", never "identical".
  3. Review **prose** may be older than the review's **scores**, so extracted qualitative claims need their own version
     stamp.
  4. A firmware retest is a change of *object state*, not of method. Record the firmware or retest date separately.

### 3.2 Which?, CHOICE and HouseFresh

All three were read; see §2.1 and §2.4.

- **Which?** publishes the procedure and weights but, on the page read, gives no version identifier and no cross-era
  comparability statement.
- **CHOICE** partitions results into "2023 and prior" and "2024+".
- **HouseFresh** gives a dated change history (2020, 2021, 2024, 2025) without version IDs.
- **Generalisation:** the *method-version key* for a publisher is one of:
  - an explicit version (RTINGS "Test Bench 2.3");
  - an explicit era (CHOICE "2024+");
  - an inferred era from dated method-change notes (HouseFresh, the 2024 sensor change);
  - unknown (no history).

---

## 4. Harmonisation frameworks in other domains

### 4.1 Clinical laboratory: LOINC method axis and result harmonisation

**LOINC.** loinc.org returned 403, so the official Users' Guide was not read.

- **SNOMED International's LOINC implementation guide:**
  <https://docs.snomed.org/implementation-guides/loinc-implementation-guide/about-loinc/2.1-loinc-features> — verified
  (read).
  - LOINC names are "defined in terms of six major axes": component, property, time, system, scale and method.
  - The fully specified name "must include entries for the first five".
  - "the method axis is included only when the method distinction makes an important difference".
- **Lin, Vreeman, McDonald, Huff, J Biomed Inform 2012;45(4):658-66:**
  <https://lhncbc.nlm.nih.gov/LHC-publications/pubs/AuditingconsistencyandusefulnessofLOINCuseamongthreelargeinstitutionsusingversionspacesforgroupingLOINCcodes.html>
  — verified (read, abstract page).
  - A loss-of-meaning category is where "tests with a specific 'method' could be rolled-up with tests that were
    'methodless'".
  - The authors conclude that variations mean "some data not being truly interoperable across different enterprises".
- **Pattern for PEE:**
  - The *measurand identity* is component + property + time aspect + system + scale.
  - *Method* is a qualifier, added only when it changes interpretation.
  - Rolling a method-specific value up to a methodless concept is allowed for retrieval, but it loses meaning. It must
    be recorded as a downgrade, not as identity.

**Harmonisation.** JCTLM newsletter, 2020 special report:
<https://cms.jctlm.org/wp-content/uploads/2024/12/JCTLM_Newsletter_2020_Special_Report1_June-2020.pdf> — verified
(read).

- "harmonized ... mean[s] equivalent results, within clinically meaningful limits, among different measurement
  procedures intended to measure the same measurand".
- Standardisation achieves this "by having metrological traceability of calibration to higher order reference materials
  and/or reference measurement procedures" (ISO 17511:2020).
- The obstacle is the "lack of commutability of reference materials".
- **PEE mapping:** "equivalent within *decision-meaningful* limits" is exactly the definition PEE needs for the
  `equivalent` grade. The limits come from the buyer's need, as with clinically meaningful limits.

### 4.2 Environmental monitoring: reference methods and demonstration of equivalence

Sources (both verified, read):

- Directive 2008/50/EC, Annex VI: EU Cellar `http://publications.europa.eu/resource/celex/32008L0050`.
- Its recast, Directive (EU) 2024/2881: Cellar `.../celex/32024L2881`. It applies from 12 Dec 2026; the date comes
  from a snippet via eumonitor.eu and is not verified.

Content:

- A Member State "may use any other method which it can demonstrate gives results equivalent" to the reference method.
- For PM, it may use one that "displays a consistent relationship to the reference method".
- "the results achieved by that method must be corrected to produce results equivalent to those that would have been
  achieved by using the reference method".
- The correction should be "applied retroactively to past measurement data in order to achieve better data
  comparability".
- The recast keeps this wording and names EN 16450:2017 automated PM systems as an example.
- **Data quality objectives (2008/50, Annex I):**
  - uncertainty at the 95 % level of 15 % (SO₂/NO₂/CO, O₃) and 25 % (PM, benzene) for fixed measurements;
  - looser limits for indicative measurements (e.g. 50 % for PM) and for modelling.
- **PEE mapping — this is the template for the graded scale:**
  - *reference method*: **identical**;
  - *demonstrated-equivalent method*: **equivalent**;
  - *consistent relationship + correction function*: **convertible**;
  - *indicative* or *modelled* data: comparable at a lower tier, with an explicitly larger uncertainty.
  - Retroactive correction implies PEE must keep raw values and re-derive converted ones when a conversion is learned.

### 4.3 FAIR variable descriptions (I-ADOPT)

Source: I-ADOPT Framework ontology v1.1.0 (2025-05-28), <https://i-adopt.github.io/ontology/> (w3id:
<https://w3id.org/iadopt/ont/1.1.0>) — verified (read). Overview: <https://i-adopt.github.io/overview.html> — verified
(read). The overview says the framework comes from the RDA I-ADOPT Working Group under the GO FAIR Foundation.

- **Variable:** "A description of something observed or derived, minimally consisting of an ObjectOfInterest and its
  Property".
- **Matrix:** an entity "in which the ObjectOfInterest is contained".
- **ContextObject:** an entity providing "additional background information".
- **Constraint:** "limits the scope of the observation and confines the context to a particular state". It "constrains
  other components".
- **StatisticalModifier:** "which statistical measure has been applied".
- **PEE mapping, for example dishwasher noise:**
  - Property: sound power level, A-weighted.
  - ObjectOfInterest: the dishwasher model.
  - Constraints: eco programme; rated load; drying-cycle phase (for dryers).
  - StatisticalModifier: weighted average (dryer L_WA) or 10-min mean (TV power).
  - **Rule:** two observations are the *same variable* only if all components and constraints match. A missing
    constraint makes the match "unknown", not "identical".

---

## 5. Evidence grading for heterogeneous sources (GRADE)

Source: GRADE Handbook, <https://gdt.gradepro.org/app/handbook/handbook.html> — verified (read, sections 5.1–5.2.3).

- **Certainty levels:** High, Moderate, Low, Very low. High means "We are very confident that the true effect lies close
  to that of the estimate".
- **Inconsistency (5.2.2):** "unexplained heterogeneity of results".
  - It is judged by the spread of point estimates, CI overlap, a heterogeneity test and I².
  - If heterogeneity is *explained* by differences in population, intervention, outcome or *study methods*, separate
    estimates may be presented instead of rating down.
  - Otherwise, rate down 1–2 levels.
- **Indirectness (5.2.3):** there are four sources:
  - population;
  - intervention;
  - outcome measures: surrogates "in place of the patient-important outcome", which require "rating down ... by one, or
    even two, levels";
  - indirect comparisons (A vs C and B vs C): these rest on a "similarity assumption" and "always warrant rating down
    by one level".
- **PEE mapping, "sufficiency for a need":**
  - *Indirectness* is distance between the observed measurand and the buyer's need. Examples:
    - the buyer asks about real-world quietness at night, while the evidence is label dB(A) sound power on the eco
      programme (a surrogate outcome);
    - the buyer has a 30 m² room, while the evidence is CADR in a 1008 ft³ chamber (an indirect population).
  - *Indirect comparison:* product A tested by publisher P and product B tested by publisher Q, with no common anchor,
    means downgrading one level at least. A common anchor would be the same product tested by both publishers.
  - *Inconsistency:* two publishers disagree on the same measurand. First try to *explain* it: a different method
    version, firmware or measurand. If explained, present the values separately. If unexplained, downgrade.

---

## 6. Implications for PEE

### 6.1 Fields an observation must store, so comparability can be decided later

| Group | Field | Why (source) |
|---|---|---|
| **Measurand** | `quantity_kind` (e.g. energy, duration, sound power level, sound pressure level, CADR) | VIM 2.3 |
| | `property_qualifier` (e.g. A-weighted; SDR vs HDR; smoke/dust/pollen/PM1) | VIM 2.3; TV and AHAM sections |
| | `object_state` (model ID, firmware, variant; never merged on name) | VIM 2.3 "state"; RTINGS firmware retests |
| | `constraints[]` (programme/mode, load, picture mode, fan speed, cycle phase, initial/final condition) | I-ADOPT Constraint; EU regs |
| | `basis` (per cycle / per 100 cycles / weighted full+partial / per place setting / per year at N uses) | Dishwasher and dryer Annexes III and IV; Which? running-cost basis |
| | `statistic` (single run, mean of n, weighted average, 10-min mean, derived estimate) | I-ADOPT StatisticalModifier |
| **Value** | `value_raw`, `unit_raw`, `rounding/resolution` as published | Rounding rules in Annex IV |
| | `value_layer` = measurement / derived calculation / publisher score / rank / qualitative | RTINGS scores vs results |
| **Method** | `method_ref` (standard ID + edition, e.g. "ANSI/AHAM AC-1-2020"; "EU 2019/2017 Annex IV"; or publisher method name) | VIM 2.6; 17025 |
| | `method_status` = standard_unmodified / standard_based_modified / publisher_in_house / undocumented | EA FAQs on 17025 7.2 |
| | `method_version` (explicit version, era, or inferred era + evidence) and `method_version_source` | RTINGS, CHOICE, HouseFresh |
| | `calculation_ref` (e.g. converted score, CADR estimate from decay) | VIM 2.6 "including any calculation" |
| **Conditions** | `conditions{}` with stated intervals (ambient °C, RH, voltage, room volume, lux) and `conditions_completeness` | VIM 4.11; TV Annex IV; AHAM 4.2 |
| | `instrument` (e.g. PurpleAir Zen, sonometer) and `instrument_change_date` | VIM 2.22 Note 1 |
| **Uncertainty** | `u_stated` (if any), `u_prior` + `u_prior_source` (e.g. regulation tolerance, AHAM 2σ, publisher repeat count), `n_runs` | GUM 3.1.2, 2.3.3; Which? repeats |
| | `validity_range` (e.g. AHAM min/max CADR) and `in_range` flag | AHAM Scope |
| **Provenance** | publisher, evidence type (manufacturer declaration / regulated declared value / independent test), test date, publish date, retest/porting date, text-vs-score date | EU Annex IX (declared ≠ verified); RTINGS porting |

### 6.2 Graded comparability scale (a pair relation, computed when needed)

| Grade | Condition | Example |
|---|---|---|
| **C0 identical** | Same measurand (all constraints, basis and statistic), same `method_ref`+`method_version` (or the same unmodified standard), conditions within the same reference intervals | Two RTINGS TB 2.3 measurements; two AHAM AC-1-2020 smoke CADRs; label EPEC of two dishwashers |
| **C1 equivalent** | Same measurand; different procedure with *documented* equivalence (an equivalence demonstrated within decision-meaningful limits) | EU "demonstration of equivalence"; JCTLM harmonised results |
| **C2 convertible** | Same quantity kind; known deterministic or calibrated relation (basis change, unit, documented correction function, publisher conversion). Carries the conversion's uncertainty | label kWh/100 cycles ↔ EPEC ×100; cfm ↔ m³/h (unit only); RTINGS converted scores ("approximations"); EU PM correction factors |
| **C3 related, not comparable** | Same quantity kind but a different measurand definition (programme, load, mode, size fraction, sound power vs pressure) and no known relation. May still support *ordinal* within-publisher use or GRADE "indirect" evidence | Which? main-programme kWh vs label EPEC; HouseFresh PM1 CADR vs AHAM smoke CADR; reviewer calibrated-mode watts vs SDR normal-configuration watts |
| **C4 not comparable** | Different quantity kinds or layers (measurement vs score), or a different object state | score vs measurement; SDR vs HDR power |
| **CU unknown** | Required measurand or method fields missing | Article giving "52 dB" with no mode or distance |

**Agreement test (compatibility), applicable only at C0–C2:**

- ζ = Δ/√(u₁²+u₂²);
- |ζ| ≤ 2: agree;
- 2–3: questionable;
- ≥ 3: disagree, so explain (GRADE inconsistency) or flag.
- Use u priors with their source shown.

### 6.3 What "within-publisher comparability" needs

These follow from VIM 2.22 (intermediate precision) and the publisher practices above:

1. **The same method version or era.** Comparison across an explicit version boundary is C2 only if the publisher
   provides a conversion (RTINGS), and C3 otherwise (CHOICE 2023− vs 2024+; HouseFresh Touch vs Zen).
2. **The same value layer.** Raw measurements survive scoring-curve changes; scores do not.
3. **Instrument and location continuity**, or a recorded change. HouseFresh's 2024 sensor change is the kind of
   condition change VIM 2.22 Note 1 says must be specified.
4. **Test date and firmware/state date**, since retests after firmware updates change the object, not the method.
5. **The same constraints** (programme, load, fan speed), *within* the publisher too. Which? tests both the main and eco
   programmes; HouseFresh tests the max speed and the max speed under 45 dBA.
6. **A text/score version stamp.** RTINGS states that prose may not match ported scores.

### 6.4 Sufficiency for a need (GUM 3.1.3 + GRADE)

- **Measurand completeness depends on the need.** The definition needs only as many constraints as the decision's
  required accuracy demands (GUM 3.1.3). So `CU unknown` can be *sufficient* for a coarse need: a 10 dB difference on
  an unknown basis can still rank, while 2 dB cannot.
- **Start sufficiency at the comparability grade and downgrade for:**
  - indirectness: measurand ≠ need (surrogate), or conditions ≠ the buyer's situation (room size, use programme);
  - indirect comparison: different publishers with no anchor;
  - unexplained inconsistency;
  - imprecision: the difference is within the tolerance or uncertainty prior.
- **Never treat manufacturer declarations as independent tests.** The EU verification procedure itself treats declared
  values as claims to be checked against tolerances (Annex IX). This matches the PEE non-negotiable.

---

## 7. Source log

| # | Source | URL | Status |
|---|---|---|---|
| 1 | VIM 2.3 measurand | https://jcgm.bipm.org/vim/en/2.3.html | verified (read) |
| 2 | VIM 2.6 measurement procedure | https://jcgm.bipm.org/vim/en/2.6.html | verified (read) |
| 3 | VIM 2.22, 2.24 precision conditions | https://jcgm.bipm.org/vim/en/2.22.html ; https://jcgm.bipm.org/vim/en/2.24.html | verified (read) |
| 4 | VIM 2.41 traceability | https://jcgm.bipm.org/vim/en/2.41.html | verified (read) |
| 5 | VIM 2.46 comparability | https://jcgm.bipm.org/vim/en/2.46.html | verified (read) |
| 6 | VIM 2.47 compatibility | https://jcgm.bipm.org/vim/en/2.47.html | verified (read) |
| 7 | VIM 2.52 influence quantity | https://jcgm.bipm.org/vim/en/2.52.html | verified (read) |
| 8 | VIM 4.11 reference operating condition | https://jcgm.bipm.org/vim/en/4.11.html | verified (read) |
| 9 | GUM JCGM 100:2008 | https://www.bipm.org/documents/20126/2071204/JCGM_100_2008_E.pdf | verified (read) |
| 10 | EA FAQ 40.5 (17025 7.2.1.5 / 7.2.2.1) | https://european-accreditation.org/sp_accordion_faqs/40-5-question-on-validation-verification-of-methods/ | verified (read) |
| 11 | EA FAQ standard method outside scope | https://european-accreditation.org/?p=43475 | verified (read) |
| 12 | Eurachem PT scores leaflet (ISO 13528:2022 §9.4.2) | https://eurachem.org/images/stories/leaflets/pt/pt_perf_assmnt/PT_Understand_Evaluation_V1_EN.pdf | verified (read) |
| 13 | NIST Dataplot zeta score | https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/zetascor.htm | verified (read) |
| 14 | ISO 13528 / ISO 17025 originals | https://www.iso.org/standard/78879.html | not read (403) |
| 15 | EU 2019/2017 Annexes I, III, IV, IX | https://www.legislation.gov.uk/eur/2019/2017/annex/IV/adopted (and I, III, IX) | verified (read) |
| 16 | EU 2019/2022 | http://publications.europa.eu/resource/celex/32019R2022 | verified (read) |
| 17 | EU 2023/2534 | http://publications.europa.eu/resource/celex/32023R2534 | verified (read) |
| 18 | EU 2019/2013 | http://publications.europa.eu/resource/celex/32019R2013 | verified (read) |
| 19 | ANSI/AHAM AC-1-2020 | https://law.resource.org/pub/us/cfr/ibr/inc/ansi/aham.ac-1.2020.pdf | verified (read) |
| 20 | IEC 63086-1 / 63086-2-1 listings | https://shop-checkout.bsigroup.com/products/household-and-similar-electrical-air-cleaning-appliances-methods-for-measuring-the-performance-particular-requirements-for-determination-of-particle-reduction | not verified (snippet; 429) |
| 21 | RTINGS versioned test benches | https://www.rtings.com/company/versioned-test-benches | verified (read) |
| 22 | RTINGS laptop TB 0.9 / 0.9.1 changelogs; 63-vacuum re-score | https://www.rtings.com/laptop/tests/changelogs/0-9 | not verified (snippet) |
| 23 | Which? how we test dishwashers | https://www.which.co.uk/reviews/dishwashers/article/how-we-test-dishwashers-aaVzw8e0VrkY | verified (read) |
| 24 | CHOICE how we test dishwashers | https://www.choice.com.au/home-and-living/kitchen/dishwashers/articles/how-we-test-dishwashers | verified (read, first 100k chars) |
| 25 | HouseFresh how we test air purifiers | https://housefresh.com/how-we-test-air-purifiers/ | verified (read) |
| 26 | SNOMED LOINC IG, LOINC axes | https://docs.snomed.org/implementation-guides/loinc-implementation-guide/about-loinc/2.1-loinc-features | verified (read) |
| 27 | Lin et al. 2012 JBI (LOINC method roll-up) | https://lhncbc.nlm.nih.gov/LHC-publications/pubs/AuditingconsistencyandusefulnessofLOINCuseamongthreelargeinstitutionsusingversionspacesforgroupingLOINCcodes.html | verified (read, abstract) |
| 28 | LOINC Users' Guide | https://loinc.org/kb/users-guide/major-parts-of-a-loinc-term/ | not read (403) |
| 29 | JCTLM newsletter 2020, harmonisation definition | https://cms.jctlm.org/wp-content/uploads/2024/12/JCTLM_Newsletter_2020_Special_Report1_June-2020.pdf | verified (read) |
| 30 | Directive 2008/50/EC Annex VI.B, Annex I | http://publications.europa.eu/resource/celex/32008L0050 | verified (read) |
| 31 | Directive (EU) 2024/2881 (recast) equivalence | http://publications.europa.eu/resource/celex/32024L2881 | verified (read); application date not verified (snippet) |
| 32 | I-ADOPT ontology v1.1.0 | https://i-adopt.github.io/ontology/ | verified (read) |
| 33 | GRADE Handbook §5 | https://gdt.gradepro.org/app/handbook/handbook.html | verified (read) |

**Gaps:**

- ISO 13528, ISO/IEC 17025 and ISO 5725 were read only through accreditation and metrology bodies' summaries.
- The IEC 63086-2-1 procedure was not read.
- The EU harmonised test standards (EN IEC 60436, EN 61121, EN 62087) were not read.
- The detailed RTINGS changelogs are rendered client-side and were not read.
