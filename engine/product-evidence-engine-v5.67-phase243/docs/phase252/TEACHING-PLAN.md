# Phase252 teaching plan (generated from src/phase252_category_teaching.ts)

This file is generated from the versioned teaching material; the module is the source of truth. **Nothing here is reviewed evidence.** Every statement enters the knowledge store as a technical hypothesis, assistant-authored and unreviewed. Each statement carries one of four labels:

- **Source-backed observation:** what a consulted source states, paraphrased and cited.
- **Method reference:** how a consulted source says an outcome is measured or defined.
- **Instructor hypothesis:** Claude's reasoning, not supported by a consulted source.
- **Independently supported relation:** none exists yet.

## Sources consulted (2026-10-16)

| Id | Publisher | Role | Access | What it teaches |
|---|---|---|---|---|
| [doe2010](https://www.govinfo.gov/content/pkg/FR-2010-07-22/html/2010-17773.htm) | US DOE, Federal Register 75 FR 42579 | regulator | public domain (US federal) | DOE repealed the microwave cooking-efficiency test (1 kg water load, IEC 705 based): not accurate or repeatable; water not representative of food; IEC 60705 showed more test-to-test variation |
| [iec60705](https://webstore.iec.ch/en/publication/82953) | IEC (catalogue page of IEC 60705:2024 ed. 5) | standard catalogue | catalogue page public; standard text paid (not read) | IEC 60705 defines methods for main performance characteristics of household microwave ovens, using water loads and specified dishes; no energy method for grill or steam functions |
| [fda_mw](https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens) | US FDA | regulator | public domain (US federal) | leakage limit 5 mW/cm2 at about 5 cm over the oven life; heating by absorption in water, thick foods heated inside by conduction; do not use an oven whose door does not close firmly or is damaged |
| [lg_guide](https://www.lg.com/uk/lg-experience/helpful-hints/microwave-size-and-buying-guide/) | LG UK (manufacturer buying guide) | manufacturer guide | public page | types (solo, grill, convection), size bands by household, measure space and clearance; inverter evenness figures attributed to unnamed third-party tests (marketing claims, conditions not disclosed) |
| [olive2013](https://aes2.org/publications/elibrary-page/?id=16768) | Olive, Welti, McMullin, AES (Harman research) | academic | abstract public; paper paid | listener preference for headphones relates to the deviation of the measured frequency response from a target curve; measurement on a head-and-torso simulator; research by a manufacturer-affiliated lab |
| [olive2018](https://aes2.org/publications/elibrary-page/?id=19436) | Olive et al., AES (Harman research) | academic | abstract public; paper paid | model predicting preference from deviation to target for in-ear headphones (reported r=0.91 in the authors' sample); later work finds listener segments preferring different bass/treble |
| [itu_h870](https://www.itu.int/dms_pubrec/itu-t/rec/h/T-REC-H.870-202203-I!!SUM-HTM-E.htm) | ITU-T / WHO, Recommendation H.870 | standards body | summary public | safe listening devices: sound-dose limits (adults 80 dB for 40 h/week; children 75 dB), volume limiting and parental limiters |
| [ip_iec60529](https://www.dlsemc.com/ipx3-and-ipx4-spraying-water-and-splashing-water/) | test laboratory explainer of IEC 60529 (secondary) | independent test publisher | public page | IPX4 means splashing water from any direction (oscillating tube or spray nozzle, about 10 minutes); it says nothing about immersion, jets or solid particles; IEC 60529 itself not read |
| [rtings_hp](https://www.rtings.com/headphones) | RTINGS (independent test publisher) | independent test publisher | robots allow; rights to results not established | independent tests report noise isolation in dB by band (bass, mid, treble) and scenarios, continuous and total battery life in hours, charge time; values not retained |

Sources were read through public pages only (robots allowed). No standard text was read: IEC 60705, IEC 60268-7 and IEC 60529 are paid. Only the abstracts of the AES papers were read. Nothing was copied into the repository beyond short paraphrases.

## microwave_ovens (g252.1, 2026-10-16)

### A. What must be understood

Names (shared with the lexical arm, as a name-recognition control): microwave, microwaves, microwave oven, microwave ovens.

Contrasting phrases (accessories, consumables, parts): microwave safe, microwave cover, microwave plate, microwave popcorn, microwave rice, microwave container, microwave bowl, microwave steamer, microwave cart, microwave shelf, microwave tray, microwave mug.

- Solo models heat and defrost; grill models add browning; combination (convection) models add a fan and heating element and can bake. — *source backed observation* ([lg_guide](https://www.lg.com/uk/lg-experience/helpful-hints/microwave-size-and-buying-guide/))
- Countertop and built-in installations differ in the space and clearance they need. — *source backed observation* ([lg_guide](https://www.lg.com/uk/lg-experience/helpful-hints/microwave-size-and-buying-guide/))
- A magnetron produces microwaves absorbed mainly by water in food; thick foods heat inside by conduction from the outer layers, so heating is uneven without stirring or standing time. — *source backed observation* ([fda_mw](https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens))

### B. Where and how to research (source type by evidence question)

| Evidence question | Source roles | Why |
|---|---|---|
| Does a model fit, hold a dish, have a grill or a given output power? | manufacturer guide | declared design facts: the maker's own specification page for that exact model code |
| Does a model heat faster or more evenly than another? | independent test publisher | only independent measurements on the same protocol compare outcomes; maker figures come from maker-chosen tests |
| What does a declared number mean and how is it measured? | standard catalogue, regulator | standards and regulators define the measurand and expose known limits (DOE repeal) |
| Is a model or brand subject to a safety notice? | regulator | regulator notices about identified models; never a performance signal |

### C. How to interpret evidence

- A declared output power is a maker measurement on a water load, not an independent result; DOE found such water-load tests not accurate or repeatable enough to regulate. — *source backed observation* ([doe2010](https://www.govinfo.gov/content/pkg/FR-2010-07-22/html/2010-17773.htm))
- Litre capacity is a nominal cavity figure; it does not say whether a given dish fits or turns. — *instructor hypothesis*

### D. How to apply it: needs to requirements to properties

**batch_capacity** (environment): Heat or cook for several people or large dishes.

- **Phrases:** family, large plate, dinner plate, casserole, for four
- **Checkable requirement:** capacity_min — Nominal cavity litres are what makers declare; whether a dish fits also depends on turntable diameter and cavity shape. *(instructor hypothesis)*
- **Declared "turntable diameter" is may support this need:** A declared turntable diameter bounds the largest round dish that turns. *(instructor hypothesis)*
- **Clarification:** How many people do you usually heat food for, and what is the largest dish it must hold?

**small_kitchen** (environment): Fit a small kitchen or limited counter space.

- **Phrases:** small kitchen, counter space, fit under, cupboard
- **Checkable requirement:** width_max, depth_max, height_max — Measure the space before buying and allow clearance for the door and airflow. *(source backed observation)*
- **Clarification:** How much space do you have for it (width, depth and height), including room for the door to open?

**fast_heating** (outcome): Heat food quickly.

- **Phrases:** heats quickly, fast, wattage
- **Checkable requirement:** power_min — Declared microwave output power (measured on a water load by the maker) relates to how fast a water load warms. *(instructor hypothesis)*
- **What would show it:** time to heat a standard food or water load under one protocol, measured independently *(method reference; [iec60705](https://webstore.iec.ch/en/publication/82953), [doe2010](https://www.govinfo.gov/content/pkg/FR-2010-07-22/html/2010-17773.htm))*
- **Declared "microwave power" is may support this need:** Declared output power is measured on a water load; DOE found water-load tests poorly repeatable, so small differences in watts mean little. *(source backed observation)*
- **Clarification:** Is speed important enough to pay for a higher output power, or is reheating time not a concern?

**even_heating** (outcome): Heat food evenly without cold spots.

- **Phrases:** evenly, cold spots, cold in the middle
- **What would show it:** temperature spread across a standard load after heating, measured independently under one protocol *(method reference; [iec60705](https://webstore.iec.ch/en/publication/82953))*
- **Declared "microwave power" is not sufficient for this need:** Output power says how much energy, not how evenly it is absorbed; thick foods heat by conduction inside. *(source backed observation)*
- **Declared "inverter" is not sufficient for this need:** Inverter evenness figures on maker pages come from unnamed tests with undisclosed conditions: claims, not evidence. *(source backed observation)*

**defrosting** (task): Defrost frozen food.

- **Phrases:** defrost, frozen
- **What would show it:** evenness of a standard frozen load after the defrost programme, measured independently *(instructor hypothesis)*

**grill_browning** (task): Brown or crisp food, or bake, rather than only reheat.

- **Phrases:** grill, browning, soggy
- **Declared "grill power" is not sufficient for this need:** IEC 60705 has no energy method for grill functions; grill watts do not show browning results. *(source backed observation)*
- **Clarification:** Do you want to brown or bake in it (grill or combination model), or only reheat and defrost (solo model)?

**ease_of_use** (outcome): Simple to operate.

- **Phrases:** easy to use, simple controls, dial

**cleaning_effort** (outcome): Easy to clean.

- **Phrases:** easy to clean, wipe
- **Declared "easy clean coating" is not sufficient for this need:** Coating and antibacterial claims are maker claims from maker-chosen tests. *(source backed observation)*

**radiation_safety** (failure): Concern about microwave leakage or a damaged door.

- **Phrases:** radiation, leakage
- **What would show it:** Leakage is regulated (US limit 5 mW/cm2 at about 5 cm over the oven life); a damaged or loose door is the warning sign, not the model choice. *(source backed observation; [fda_mw](https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens))*

### Applicability limits

- Water-load results do not represent real food loads; conclusions about speed transfer to food only approximately. — *source backed observation* ([doe2010](https://www.govinfo.gov/content/pkg/FR-2010-07-22/html/2010-17773.htm))
- Combination and grill functions are outside the microwave water-load methods; their results need other tests. — *source backed observation* ([iec60705](https://webstore.iec.ch/en/publication/82953))

### Gaps and hypotheses still to test

- No independent heating-evenness or speed results are held for any stored model. — *instructor hypothesis*
- IEC 60705 test clauses (output power, evenness) were not read: the standard text is paid. — *instructor hypothesis* ([iec60705](https://webstore.iec.ch/en/publication/82953))

## headphones (g252.1, 2026-10-16)

### A. What must be understood

Names (shared with the lexical arm, as a name-recognition control): headphones, headphone, earphones, earbuds, headset, in-ear, over-ear.

Contrasting phrases (accessories, consumables, parts): ear pads, earpads, headphone stand, headphone amp, headphone jack, headphone adapter, headphone cable, ear tips, headphone splitter, headphone case, headphone port, headphone output.

- Over-ear, on-ear and in-ear designs; closed-back designs isolate more than open-back; active noise cancelling adds microphones and processing. — *instructor hypothesis*
- Wired, Bluetooth and radio (RF) wireless headphones differ in latency, battery needs and range. — *instructor hypothesis*
- Perceived sound depends on the frequency response at the eardrum, which depends on fit and seal; it is measured on a head-and-torso simulator. — *source backed observation* ([olive2013](https://aes2.org/publications/elibrary-page/?id=16768))

### B. Where and how to research (source type by evidence question)

| Evidence question | Source roles | Why |
|---|---|---|
| Weight, battery hours as declared, codecs, connection, fit type? | manufacturer guide | declared design facts from the maker's page for that exact model |
| Which one blocks more noise, sounds closer to a preference target, or lasts longer at a set volume? | independent test publisher | only measurements on one rig and protocol compare outcomes |
| Is a target response or a test method valid? | academic, standards body | peer-reviewed listening research and standards define what is measured and its limits (note manufacturer-affiliated research) |
| Is a volume level safe, especially for children? | standards body | WHO/ITU safe-listening limits |

### C. How to interpret evidence

- Declared battery life is usually "up to" under maker conditions: an upper bound; below the user's need it excludes, above it proves nothing. — *instructor hypothesis*
- Preference-target research comes from a manufacturer-affiliated lab and listener segments differ; a target deviation is a predictor, not a verdict for every listener. — *source backed observation* ([olive2018](https://aes2.org/publications/elibrary-page/?id=19436))

### D. How to apply it: needs to requirements to properties

**noise_cancelling** (outcome): Hear less outside noise (active cancelling or passive isolation).

- **Phrases:** noise cancelling, anc, noisy, commute, plane
- **What would show it:** attenuation in dB by frequency band (bass, mid, treble) measured on the same rig, with and without cancelling *(method reference; [rtings_hp](https://www.rtings.com/headphones))*
- **Declared "noise cancelling" is not sufficient for this need:** A declared "noise cancelling" feature does not say how much noise, at which frequencies; only measured attenuation compares. *(source backed observation)*
- **Clarification:** Where will you mostly use them: commuting, flights, an open office or at home?

**comfort** (outcome): Comfortable for long sessions.

- **Phrases:** comfortable, hours, glasses, hurt
- **Checkable requirement:** weight_max — Declared weight is one checkable part of comfort; clamping force and fit are not declared. *(instructor hypothesis)*
- **Clarification:** Do you prefer over-ear, on-ear or in-ear, and do you wear glasses?

**sound_quality** (outcome): Sound the listener prefers or finds accurate.

- **Phrases:** sound quality, bass, accurate
- **What would show it:** measured frequency response compared with a preference target on a head simulator *(method reference; [olive2013](https://aes2.org/publications/elibrary-page/?id=16768), [olive2018](https://aes2.org/publications/elibrary-page/?id=19436))*
- **Declared "frequency response" is not sufficient for this need:** A declared range such as 20 Hz to 20 kHz says nothing about tonal balance; preference relates to the measured response curve. *(source backed observation)*
- **Declared "driver diameter" is not sufficient for this need:** Driver size is a design fact, not a measured sound outcome. *(instructor hypothesis)*

**battery_life** (outcome): Long playback between charges.

- **Phrases:** battery, flight
- **Checkable requirement:** battery_life_min — Makers declare playback hours, usually "up to" under their own conditions. *(instructor hypothesis)*
- **What would show it:** continuous playback hours measured independently at a stated volume, with cancelling on and off *(method reference; [rtings_hp](https://www.rtings.com/headphones))*
- **Clarification:** How many hours of listening do you need between charges?

**wireless** (environment): No cable to the source.

- **Phrases:** wireless, bluetooth
- **Clarification:** Do you need them wireless, or is a cable fine (no charging, no latency)?

**microphone_calls** (task): Calls and meetings.

- **Phrases:** calls, meetings, zoom
- **What would show it:** recorded microphone quality in quiet and noisy conditions, measured independently *(instructor hypothesis)*

**sport_fit** (task): Exercise: secure fit, sweat and rain.

- **Phrases:** running, gym, sweat
- **What would show it:** An IP rating is a certified test of water ingress: IPX4 is splashing from any direction, not immersion or jets. *(source backed observation; [ip_iec60529](https://www.dlsemc.com/ipx3-and-ipx4-spraying-water-and-splashing-water/))*
- **Clarification:** Will you wear them for running or workouts, and in rain?

**hearing_safety** (failure): Protect hearing, for example a child's.

- **Phrases:** volume limit, kids
- **What would show it:** Safe-listening devices limit sound dose (WHO/ITU H.870: adults 80 dB for 40 h a week, children 75 dB) and offer parental volume limits. *(source backed observation; [itu_h870](https://www.itu.int/dms_pubrec/itu-t/rec/h/T-REC-H.870-202203-I!!SUM-HTM-E.htm))*
- **Clarification:** Who will use them, and do you need a volume limit (for a child)?

**durability** (outcome): Last a long time.

- **Phrases:** durable, broke

**portability** (environment): Easy to carry or travel with.

- **Phrases:** foldable

### Applicability limits

- Fit changes in-ear and over-ear measurements; a result on a test head may differ on a given listener. — *source backed observation* ([olive2013](https://aes2.org/publications/elibrary-page/?id=16768))
- An IP rating covers water ingress as tested, not sweat chemistry or durability over months. — *source backed observation* ([ip_iec60529](https://www.dlsemc.com/ipx3-and-ipx4-spraying-water-and-splashing-water/))

### Gaps and hypotheses still to test

- No independent isolation, battery or response measurements are held for any stored model; rights to retain RTINGS results are not established. — *instructor hypothesis* ([rtings_hp](https://www.rtings.com/headphones))
- IEC 60268-7 (headphone measurement methods) and IEC 60529 texts were not read. — *instructor hypothesis*
