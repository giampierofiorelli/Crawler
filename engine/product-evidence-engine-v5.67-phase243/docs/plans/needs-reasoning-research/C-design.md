# C — Design-science and marketing models that link needs, outcomes, functions, behaviour, structure and measurable characteristics

Survey date: 2026-10-20. Method: web search, publisher and index pages (Crossref, J-STAGE, IDEAS/RePEc, Springer, Cambridge, HBR, Drexel), and open full texts read with `pdftotext`. No paywall, robots rule, 403 or 429 was bypassed. Where a server refused (for example MIT DSpace 429, SAGE 403, ACM 403, DBLP bot wall), the source was downgraded rather than bypassed.

Quotes are under 25 words. Everything else is paraphrase.

**Verification status legend**

- **full text read**: I read the primary text, or an authorised author or official copy of it.
- **abstract read**: I read the publisher or index abstract or summary, but not the body.
- **secondary source only**: existence and content come only from other works citing the source.
- **could not verify**: the bibliographic record exists, but its content was not reachable.

---

## Part 1 — Function–Behaviour–Structure family (design science)

### 1. Gero (1990), Design prototypes

**Citation.** Gero, J. S. (1990). Design prototypes: a knowledge representation schema for design. *AI Magazine*, 11(4), 26–36. DOI 10.1609/aimag.v11i4.854 (resolves to AAAI OJS); PDF: https://ojs.aaai.org/aimagazine/index.php/aimagazine/article/view/854

**Status:** full text read.

**Key concepts**
- Design is presented as a transformation from function (F) to structure (S). No direct path exists between them, so behaviour is the mediating layer.
- There are two kinds of behaviour:
  - *expected behaviour* (Be), derived from function. This step is called "formulation".
  - *actual behaviour from structure* (Bs), derived by analysis.
- Evaluation compares Bs with Be. Reformulation changes the expected behaviours, and through them the function, when the comparison or a newly synthesised structure reveals something.
- In the paper's window example, the behaviours are light flux transmitted, ventilation rate and solar collection. These are measurable variables, not intentions.
- Gero cites Bobrow (1984): function is the relation between a user's goal and a system's behaviour.
- "No function in structure and … no structure in function". Learned F–S shortcuts are hard to unlearn. In everyday speech the label of a structure often takes over the meaning of its function.
- A design prototype stores:
  - F, S, Be and Bs;
  - *relational knowledge* (dependency networks among the variables);
  - *qualitative knowledge* (effects of changing structure variables, normal ranges);
  - *computational knowledge* (equations);
  - *context knowledge* (exogenous variables that must come from the situation).

**Principle for an automated needs adviser.** Never link a shopper's goal directly to a part or label. Always pass through an explicit, measurable *expected behaviour*, and evaluate a product by comparing its measured behaviour (Bs) against that expected behaviour (Be). Context variables, such as room size or the noise floor in a bedroom, are exogenous inputs that the situation must supply. The product model should not assume them.

**Limits**
- The paper targets designing, not buying.
- It is a representation schema with illustrative examples, not an empirical validation.

**Failure modes**
- *Label leakage*: a structure name such as "HEPA filter" or "sleep mode" is taken as if it were the function. Gero names this blurring explicitly.
- The schema says nothing about whose goal defines F. That gap is addressed later by the situated FBS (source 2) and by Kitamura (sources 9–10).

### 2. Gero & Kannengiesser (2004), The situated FBS framework

**Citation.** Gero, J. S. & Kannengiesser, U. (2004). The situated function–behaviour–structure framework. *Design Studies*, 25(4), 373–391. DOI 10.1016/j.destud.2003.10.010 (Crossref-verified). An earlier version is in *Artificial Intelligence in Design '02*, 89–104, DOI 10.1007/978-94-017-0795-4_5.

**Status:** abstract read (Drexel repository record). The framework's content was read in full text through the co-author's account in source 3. I did not read the Design Studies body.

**Key concepts**
- The original eight FBS processes are:
  - formulation;
  - synthesis;
  - analysis;
  - evaluation;
  - documentation;
  - three types of reformulation (of S, of Be, of F).
- The abstract says the original framework "did not explicitly account for the dynamic character of the context" in which designing occurs.
- Designing involves three worlds: the *external*, the *interpreted* and the *expected*. They are linked by interpretation, focussing, action and constructive memory.
- F, B and S each appear in external, interpreted and expected variants. *External requirements* (FRe, BRe, SRe) come from another agent, usually the customer. The result is 20 processes.
- Evaluation compares *interpreted* behaviour (Bi) with *expected* behaviour (Bei), not raw facts with goals.
- Interpretation is "push-pull": it is driven both by the data and by the agent's current expectations. The same requirements can therefore be read differently by different agents, and differently over time.

**Principle for an automated needs adviser**
- Keep three things apart:
  1. what the shopper literally said (external requirement);
  2. the adviser's interpretation of it;
  3. the expected behaviour the adviser commits to.
- Reformulation is legitimate and expected. When evidence shows that the expected behaviour cannot be met, or that the shopper meant something else, the adviser should change Be or F *explicitly and traceably*. It should not silently change its ranking.

**Limits.** This is a descriptive and prescriptive framework. It has no quantitative validation.

**Failure modes**
- The interpretation step can be tilted by the system's own expectations (the "pull" side). An adviser that already "knows" sleep mode means quiet will read every page that way.
- See Dorst & Vermaas (source 4) on conceptual instability.

### 3. Kannengiesser & Zhu (2009), supporting source for source 2

**Citation.** Kannengiesser, U. & Zhu, L. (2009). An ontologically-based evaluation of software design methods. *The Knowledge Engineering Review*, 24(1), 41–58. DOI 10.1017/S0269888909000113

**Status:** full text read (publisher preview PDF).

**Key concepts**
- It restates the three worlds and the 20 situated-FBS processes, with definitions:
  - *focussing* takes aspects of the interpreted world and uses them as goals;
  - *action* changes the external world.
- External requirements on F, B and S are given by "another agent (usually the customer)".
- It cites empirical observations (Guindon 1990; Suwa et al. 1999) that new requirements are discovered while designing.

**Principle.** Requirements are not fixed at intake. The adviser should expect new requirements to appear while the shopper looks at candidates. This matches source 27 (Felix et al. 2001), where shoppers learned from seeing products.

**Limits.** Software-design context; the paper is secondary for source 2.

### 4. Dorst & Vermaas (2005), critique of FBS

**Citation.** Dorst, K. & Vermaas, P. E. (2005). John Gero's Function-Behaviour-Structure model of designing: a critical analysis. *Research in Engineering Design*, 16(1–2), 17–26. DOI 10.1007/s00163-005-0058-z (Crossref-verified).

**Status:** abstract read (UTS repository abstract, through a search extract).

**Key concepts**
- At least two different versions of the FBS model can be distinguished.
- There are open questions about *where the transition lies* between structural and intentional descriptions of artefacts.
- There are open questions about the model's empirical status.
- The follow-up by Vermaas & Dorst (2007), *Design Studies* 28(2), 133–157, which I saw only in reference lists, reports the lack of a stable definition of function.

**Principle.** The function/behaviour boundary is a modelling choice. An adviser must *define* its layers operationally (see Synthesis §2) rather than inherit them from FBS vocabulary.

**Limits.** Abstract only.

### 5. Umeda, Takeda, Tomiyama & Yoshikawa (1990), FBS (function–behaviour–state)

**Citation.** Umeda, Y., Takeda, H., Tomiyama, T. & Yoshikawa, H. (1990). Function, behaviour, and structure. In J. S. Gero (Ed.), *Applications of Artificial Intelligence in Engineering V*, Vol. 1, 177–193. Computational Mechanics Publications / Springer.

**Status:** secondary source only. The bibliography appears in reference lists, and the definition is quoted in source 6.

**Key concepts (as reported in source 6)**
- Function is "a description of behavior abstracted by human through recognition of the behavior in order to utilize the behavior".
- Behaviour is a sequence of state transitions over time.

**Limits.** I did not read the 1990 chapter itself.

### 6. Umeda, Ishii, Yoshioka, Shimomura & Tomiyama (1996), FBS Modeler

**Citation.** Umeda, Y., Ishii, M., Yoshioka, M., Shimomura, Y. & Tomiyama, T. (1996). Supporting conceptual design based on the function-behavior-state modeler. *AI EDAM*, 10(4), 275–288. DOI 10.1017/S0890060400001621

**Status:** full text read (Cambridge PDF, openly served).

**Key concepts**
- A function has two parts:
  - a symbol of the form "to do something" (from value engineering);
  - the set of behaviours that can exhibit it.
- Function–behaviour relationships are "subjective and many-to-many". For example, "hitting a bell" and "oscillating a string" both realise "to make a sound".
- Behaviour means sequential state transitions. States are entities with attributes, such as weight 1 kg or volume 100 cm³. Physical phenomena determine behaviour.
- The FBS diagram separates subjective parts (function symbols and F–B links) from objective parts (behaviours and states). Function hierarchies "can only be constructed subjectively".
- Because the objective part is computable, a tool can check its consistency and search for behaviours that realise a required function.

**Principle for an automated needs adviser**
- Treat the function → behaviour link as an *interpretive, many-to-many* claim that needs justification.
- Treat behaviour → state/property as *physical and checkable*.
- A feature name ("sleep mode") is a function symbol. Only the behaviour it actually produces, measured as states, can be tested.

**Limits.** It is a CAD tool for designers, and its evaluation is a small designer experiment.

**Failure modes.** Many-to-many links mean that one function name can hide very different behaviours. For example, "sleep mode" can mean a lower fan speed, dimmed lights, or both. Merging them on the name is an error.

### 7. Chandrasekaran & Josephson (2000), Function in device representation

**Citation.** Chandrasekaran, B. & Josephson, J. R. (2000). Function in device representation. *Engineering with Computers*, 16(3–4), 162–177. DOI 10.1007/s003660070003 (Crossref-verified).

**Status:** abstract read (Springer page). The author's PDF link listed by Semantic Scholar is dead, and no archive copy exists.

**Key concepts (abstract)**
- It analyses how engineers use "structure", "behaviour" and "function", starting from a simple ontology of objects and their causal interactions.
- It distinguishes "function as effect on the environment" from "a device-centred view of device function".
- It introduces *mode of deployment*: how the device is placed and used in its environment. This is often left implicit, but it must be represented for reasoning to be correct and complete.
- It closes by relating real-world needs to the functions of artefacts built to meet them.

**Principle for an automated needs adviser**
- The outcome a shopper wants is an *environmental effect*: a quiet bedroom, clean glasses. The device's internal behaviour, such as fan speed, is a *device-centred* description.
- The link between the two goes through the *mode of deployment*:
  - for an air purifier, room size, placement and distance to the bed;
  - for a dishwasher, the programme chosen, the load and water hardness.
- The adviser must ask for, or assume and flag, the mode of deployment before it claims that a device behaviour achieves an outcome.

**Limits.** Abstract only. The body's formalism was not verified.

**Failure modes.** Lab measurements are taken in one deployment mode, for example sound power in a test room or the eco programme in a standard load. Using them for another mode without saying so overstates the evidence.

### 8. Chandrasekaran (2005), Representing function

**Citation.** Chandrasekaran, B. (2005). Representing function: relating functional representation and functional modeling research streams. *AI EDAM*, 19(2), 65–74. DOI 10.1017/S0890060405050079

**Status:** abstract read (Cambridge page).

**Key concepts**
- It explains what a device function is, how function "arises in response to needs", and how it arises from structure and component functions.
- Functional representation (formal device ontology and reasoning) and functional modelling (domain behaviour primitives such as the functional basis) are complementary.

**Principle.** Use a formal relation backbone (need → function → behaviour → structure). Fill it with domain vocabularies such as Hirtz et al.'s flows (source 11).

**Limits.** Abstract only.

### 9. Kitamura & Mizoguchi (2003), An ontological schema for sharing conceptual engineering knowledge

**Citation.** Kitamura, Y. & Mizoguchi, R. (2003). An ontological schema for sharing conceptual engineering knowledge. *Proc. International Workshop on Semantic Web Foundations and Application Technologies (SWFAT)*, Nara, Japan, 12 March 2003, 25–28. Venue confirmed on the author's publication page. Author PDF: https://www.ritsumei.ac.jp/~y-kita/pub/kita-swfat03.pdf

**Status:** full text read.

**Key concepts**
- *Way of function achievement* separates "how to achieve" from "what is intended to achieve".
  - Example: "to weld" decomposes into the function "to unify" plus the "fusion way".
  - Bolts and nuts are another way to achieve the same function.
- A general function decomposition tree holds alternative ways in OR relationships, so several ways can achieve one required function.
- A functional concept ontology of about 220 concepts in four is-a hierarchies is detached from ways of achievement. It has an operational relationship to the device's objective behaviour.
- Ways are themselves organised in is-a hierarchies by physical principle, for example friction way and impact way.
- It was deployed at Sumitomo Electric. The paper reports positive designer feedback and one problem solved faster. This is an anecdotal evaluation.

**Principle for an automated needs adviser**
- When a shopper names a *feature*, decompose it:
  - "milk frother" = the function "make milk foam" + a way (steam wand / induction whisk / ...);
  - "sleep mode" = the function "reduce disturbance" + a way (lower fan speed / lights off / ...).
- Alternative ways can satisfy the same function. Recommend on the function, and present the way as a choice or a constraint only if the shopper insists on it.

**Limits.** Workshop paper; anecdotal deployment evidence.

**Failure modes.** Over-abstraction. Some shoppers *do* care about the way; a barista-style steam wand is the experience they want. The adviser must detect when a "way" is itself the requirement.

### 10. Kitamura & Mizoguchi (2004), Ontology-based systematization of functional knowledge

**Citation.** Kitamura, Y. & Mizoguchi, R. (2004). Ontology-based systematization of functional knowledge. *Journal of Engineering Design*, 15(4), 327–351. DOI 10.1080/09544820410001697163 (Crossref-verified). Author PDF: https://www.ritsumei.ac.jp/~y-kita/pub/kita-jed04.pdf

**Status:** full text read (key sections).

**Key concepts**
- Function is a "teleological interpretation of B1 behaviour under a given goal". The same objective behaviour can carry different functions under different goals.
- Behaviour is defined at several levels (B0–B3) relative to the device's ports and operands.
- An extended device ontology defines the roles that entities play, such as conduit and medium.
- Ways of function achievement are kept as separate, reusable knowledge. Earlier related work: Kitamura & Mizoguchi (2003), *Expert Systems with Applications*, 24(2), 153–166, DOI 10.1016/S0957-4174(02)00138-0 (Crossref).

**Principle**
- *Function is goal-relative.* The same measured behaviour, say low airflow at night, counts as "quiet operation" under the goal "undisturbed sleep" but as "reduced cleaning" under the goal "remove smoke".
- The adviser should store behaviours once and attach function labels *per goal*. It should not store "sleep mode = good".

**Limits.** Mechanical and plant domains; no consumer study.

### 11. Hirtz, Stone, McAdams, Szykman & Wood (2002), functional basis

**Citation.** Hirtz, J., Stone, R. B., McAdams, D. A., Szykman, S. & Wood, K. L. (2002). A functional basis for engineering design: reconciling and evolving previous efforts. *Research in Engineering Design*, 13(2), 65–82. DOI 10.1007/s00163-001-0008-3 (Crossref-verified). The same content is NIST Technical Note 1447 (Feb 2002): https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=821676

**Status:** full text read (NIST Technical Note version).

**Key concepts**
- A standard vocabulary of *functions* (verbs) and *flows* (objects: material, signal, energy) at class, secondary and tertiary levels.
- Function class terms are branch, channel, connect, control magnitude, convert, provision, signal and support.
- Function descriptions follow the verb–object form of Pahl & Beitz. Energy flows can be made concrete with *power conjugates* (effort × flow), for example human force.
- "Ambiguous customer needs result in the use of higher-level functions". More specific needs justify more specific functions.
- It cites Ford's Design for Six Sigma "transfer functions" that "directly measure the customer needs".

**Principle for an automated needs adviser**
- Express product functions as verb + flow, for example "remove particulate material from air" or "convert electrical energy to heat in water". A product page's marketing feature can then be mapped to a neutral function.
- Match the specificity of the function to the specificity of the stated need. Do not jump from "I want clean air" to "H13 filter".

**Limits**
- It is an engineering vocabulary and does not cover experiential outcomes such as taste or comfort.
- Validation was by modelling sample products, not by user studies.

**Failure modes.** Verb–object functions are value-free. They do not say *how much* is enough; that needs the measurement layer.

---

## Part 2 — Means-end chains (consumer behaviour)

### 12. Gutman (1982), means-end chain model

**Citation.** Gutman, J. (1982). A means-end chain model based on consumer categorization processes. *Journal of Marketing*, 46(2), 60–72. DOI 10.1177/002224298204600207 (Crossref-verified).

**Status:** secondary source only. The publisher page returned 403, and no abstract was reachable.

**Key concepts (as consistently reported by citing works)**
- Consumers see product attributes as *means* to desired *consequences* (benefits or risks avoided), which in turn serve personal *values* (desired end-states).
- Categorisation processes link concrete attributes to these more abstract consequences.
- Later sources note that the value level is often not consciously accessed.

**Principle.** The shopper's own words may sit at any level:
- attribute ("has a sleep mode");
- consequence ("won't wake me");
- value ("rested for work").

The adviser should locate each utterance on this ladder, and recommend on consequences, which are what tests can reach.

**Limits / caveats.** I could not check Gutman's exact assumptions or wording.

**Counterexamples.** See sources 14–15: chains are individual, and the hierarchy may be an artefact of the interview method.

### 13. Reynolds & Gutman (1988), laddering

**Citation.** Reynolds, T. J. & Gutman, J. (1988). Laddering theory, method, analysis, and interpretation. *Journal of Advertising Research*, 28(1), 11–31.

**Status:** secondary source only. The citation is consistent across many sources; the only full-text copy found was on a homework-sharing site of unknown provenance and was not used.

**Key concepts (secondary)**
- Laddering is a one-to-one interview that repeatedly asks "why is that important to you?". It climbs from attribute to consequence to value.
- Responses are coded into categories, aggregated in an *implication matrix*, and drawn as a *hierarchical value map* (HVM).
- Example cited by van Rekom & Wierenga (source 15) from Reynolds & Gutman's earlier work: aircraft type → more space → physical comfort → get more done → accomplishment → self-esteem.

**Principle.** "Why does that matter to you?" is the adviser's tool for moving a *feature request* up to the *outcome* it serves.

Example: "I want sleep mode." – "Why?" – "It's in my bedroom; the last one woke me." The outcome is undisturbed sleep, and the measurable target is low noise and no light or beeps at the night setting.

**Caveats**
- Aggregate HVMs depend on cut-off thresholds chosen by the analyst.
- Coding is judgemental.
- It is an interview method, and an automated adviser can afford only one or two "why" steps.

### 14. Grunert & Grunert (1995), laddering critique

**Citation.** Grunert, K. G. & Grunert, S. C. (1995). Measuring subjective meaning structures by the laddering method: theoretical considerations and methodological problems. *International Journal of Research in Marketing*, 12(3), 209–225. DOI 10.1016/0167-8116(95)00022-T (Crossref-verified).

**Status:** secondary source only. Its content is known through van Rekom & Wierenga (source 15) and a Polish segmentation study.

**Key concepts (secondary)**
- It distinguishes *soft* laddering (close to a free in-depth interview) from *hard* laddering (structured; one ladder at a time; each answer forced up a level).
- It raised early critical questions about what cognitive structure laddering actually measures.

**Principle.** Structured, forced elicitation produces the hierarchy it assumes. An adviser asking scripted "why" questions will manufacture neat chains.

### 15. van Rekom & Wierenga (2002/2007), hierarchies or networks

**Citation.** van Rekom, J. & Wierenga, B. (2002). *Means-end relations: hierarchies or networks? An inquiry into the (a)symmetry of means-end relations.* ERIM Report ERS-2002-36-MKT, Erasmus University. https://repub.eur.nl/pub/189/ The journal version is van Rekom, J. & Wierenga, B. (2007). On the hierarchical nature of means–end relationships in laddering data. *Journal of Business Research*, 60(4), 401–410. DOI 10.1016/j.jbusres.2006.10.004 (Crossref-verified).

**Status:** full text read (2002 working paper). The 2007 article was only verified bibliographically.

**Key concepts**
- Means-end relations are usually *assumed* to be hierarchical and directional, if A is a means to B, B is not a means to A. In the authors' two studies the relations were *symmetric rather than asymmetric*.
- They propose treating means-end structures as semantic networks, not straight hierarchies.
- The direction seen in laddering data can be an artefact of the "why is that important?" question.
- Hard laddering "forces" respondents upward (citing Cohen & Warlop 2001; Grunert & Grunert 1995).

**Principle**
- Do not hard-code one direction from feature to outcome. Shoppers can reason both ways ("I want quiet, so a sleep mode" and "it has a sleep mode, so it'll be quiet").
- Store the relation *with its type*, such as "is a way to achieve" or "is evidence for", rather than as a bare edge.

**Limits.** Two studies; a working-paper version was read.

**Failure modes.** Assuming that a feature automatically implies the outcome. This is exactly the owner's warning: a function is not an outcome.

---

## Part 3 — QFD / House of Quality and the Voice of the Customer

### 16. Hauser & Clausing (1988), The House of Quality

**Citation.** Hauser, J. R. & Clausing, D. (1988). The House of Quality. *Harvard Business Review*, 66(3), May–June, 63–73. https://hbr.org/1988/05/the-house-of-quality

**Status:** abstract read (HBR landing page summary). The full text is paywalled. The component structure below comes from secondary sources.

**Key concepts**
- HBR summary:
  - the HoQ is the core design tool of QFD;
  - it originated in 1972 at Mitsubishi's Kobe shipyard and was developed by Toyota and its suppliers;
  - "at Ford alone there are more than 50 applications".
- Components, per the Cambridge IfM summary and MIT Sloan's Puritan-Bennett case:
  - customer attributes with importance (voice of the customer);
  - engineering characteristics in solution-neutral, measurable terms (voice of the engineer);
  - a relationship matrix rated strong, moderate or weak;
  - a "roof" of correlations between engineering characteristics (support or conflict);
  - competitive benchmarking and target values.
- The HoQ is used "to translate it into the voice of the engineer" (MIT Sloan Review, Puritan-Bennett case).

**Principle for an automated needs adviser**
- Keep a two-sided mapping: shopper outcome ↔ measurable product characteristic, with an explicit *relationship strength*.
- The "roof" maps directly onto trade-offs:
  - higher CADR versus lower noise;
  - higher extraction pressure versus quieter grinding;
  - a shorter cycle versus better drying.
- Each characteristic needs a *target value* and a *competitor benchmark*. In a shopping context these become thresholds and comparisons across candidates.

**Limits / caveats**
- Relationship strengths are team judgements, not measured causal effects.
- The method is built for firms designing one product, not for advisers comparing many products.

**Failure modes.** Treating judgemental relationship weights as quantitative causal coefficients. See source 18.

### 17. Akao (1990), QFD

**Citation.** Akao, Y. (Ed.) (1990). *Quality Function Deployment: Integrating Customer Requirements into Product Design*. Cambridge, MA / Portland, OR: Productivity Press. Reissued 2004, ISBN 9781563273131.

**Status:** secondary source only (library catalogue and publisher records).

**Key concepts (from catalogue and publisher descriptions)**
- Demanded-quality deployment charts and quality charts.
- Applications to construction, services and software.

**Principle.** "Demanded quality", the customer's words, is deployed step by step into quality characteristics, then into parts and process parameters. Each step is a separate matrix.

**Limits.** I did not read the book.

### 18. Olewnik & Lewis (2008), limits of the House of Quality

**Citation.** Olewnik, A. & Lewis, K. (2008). Limitations of the House of Quality to provide quantitative design information. *International Journal of Quality & Reliability Management*, 25(2), 125–146. DOI 10.1108/02656710810846916 (Crossref-verified).

**Status:** abstract read (publisher abstract, through a search extract).

**Key concepts**
- A "digital experiment" identified the factors that drive the HoQ's numbers, using a hair-dryer example.
- Finding: the HoQ is useful for conceptual design, but its numerical outputs are largely invalid as quantitative design information. The problem comes from reading results in ways that the tool's assumptions and inputs do not support.

**Principle.** Relationship strengths can *rank where to look*. They do *not license* numeric claims such as "this feature delivers 30 % of your sleep quality".

**Limits.** One illustrative product.

### 19. Griffin & Hauser (1993), The Voice of the Customer

**Citation.** Griffin, A. & Hauser, J. R. (1993). The voice of the customer. *Marketing Science*, 12(1), 1–27. DOI 10.1287/mksc.12.1.1. The MIT working paper version is handle 1721.1/2425; its download returned 429 and was not retried.

**Status:** abstract read (IDEAS/RePEc).

**Key concepts (abstract)**
- The voice of the customer covers three tasks:
  1. identifying customer needs;
  2. structuring them into primary, secondary and tertiary levels;
  3. prioritising them.
- Questions studied:
  - how many customers to interview and how many analysts should read the transcripts;
  - how many needs are missed;
  - focus groups versus one-on-one interviews;
  - group-consensus (affinity) charts versus customer-sort data for structuring needs;
  - whether frequency of mention can stand in for importance.
- It reports a self-selection bias in satisfaction measures commonly used for QFD.

**Principle**
- Needs form a hierarchy, and a shopper's priority between needs must be *asked or inferred*. It cannot be read from how often something is mentioned, whether in the dialogue or in reviews.
- Single-source elicitation misses needs, so the adviser should probe areas the shopper did not raise.

**Limits.** Abstract only; the detailed numerical findings were not read.

**Failure modes.** Ranking needs by mention count, in shopper text or in review corpora. The abstract explicitly raises this question; I did not verify the answer in the body.

### 20. Ulrich & Eppinger, Identifying customer needs

**Citation.** Ulrich, K. T. & Eppinger, S. D. (2016). *Product Design and Development* (6th ed.), Chapter 5, "Identifying Customer Needs". McGraw-Hill. Edition and chapter number were verified on S. Eppinger's MIT page: https://stuff.mit.edu/people/eppinger/SDE-MIT/PDD_Text.html. Earlier editions put the chapter at Chapter 4. A 7th edition (with Yang) is listed by McGraw-Hill but was not checked.

**Status:** secondary source only. The book was not read. The guidelines below come from course slides that reproduce the chapter's guideline table (Telkom University slides) and from summaries.

**Key concepts (secondary, consistent across sources)**
- Process:
  1. define scope;
  2. gather raw data (interviews, focus groups, observing use);
  3. interpret raw data as need statements;
  4. organise them into a hierarchy (primary and secondary needs);
  5. establish relative importance (team consensus or surveys);
  6. reflect.
- Need-statement guidelines:
  - express what the product has to do, "not in terms of how it might do it";
  - be as specific as the raw data;
  - phrase positively;
  - express the need as an attribute of the product;
  - avoid "must" and "should".
- Screwdriver example. Customer: "Why don't you put protective shields around the battery contacts?"
  - Wrong: "battery contacts are covered by a plastic sliding door".
  - Right: "battery is protected from accidental shorting".
- *Latent needs* are needs many customers recognise once they see them but would not articulate in advance. Lead users and extreme users help reveal them.

**Principle for an automated needs adviser**
- Rewrite each shopper request as a *what* statement. For example, "I want a sleep mode" becomes "the purifier runs without disturbing sleep in a bedroom at night".
- Keep the original *how* as a stated preference, not as the need.
- Probe latent needs that shoppers in this category typically miss, such as filter running cost or descaling effort.

**Limits.** Textbook guidance for firms; not empirically validated as an advisory protocol.

**Failure modes**
- "Positive phrasing" can hide a *rejection*: "no beeps at night" is a real constraint.
- The adviser must not lose negative constraints when it normalises statements.

---

## Part 4 — Kano model

### 21. Kano, Seraku, Takahashi & Tsuji (1984), Attractive quality and must-be quality

**Citation.** Kano, N., Seraku, N., Takahashi, F. & Tsuji, S. (1984). 魅力的品質と当り前品質 [Attractive quality and must-be quality]. *Hinshitsu (Quality)*, *Journal of the Japanese Society for Quality Control*, 14(2), 147–156. DOI 10.20684/quality.14.2_147 (resolves to J-STAGE). Some secondary sources give pp. 39–48; J-STAGE gives 147–156.

**Status:** abstract read (J-STAGE English abstract). The Japanese body was not read.

**Key concepts (abstract)**
- Quality has subjective and objective aspects. The authors replace the one-dimensional view with a two-dimensional one: physical sufficiency × satisfaction.
- Quality elements are classified as attractive, must-be, one-dimensional, and so on.
- The theory was tested with consumer questionnaires on *TV sets and table clocks*, which are household products. A clock design applying the theory is discussed.

**Principle.** Satisfaction is not linear in a feature's presence. The adviser must know, *per shopper*, whether a property is a gate (must-be), a scale (one-dimensional) or a bonus (attractive).

### 22. Berger et al. (1993), Kano's methods for understanding customer-defined quality

**Citation.** Berger, C., Blauth, R., Boger, D., Bolster, C., Burchill, G., DuMouchel, W., Pouliot, F., Richter, R., Rubinoff, A., Shen, D., Timko, M. & Walden, D. (1993). Kano's methods for understanding customer-defined quality. *Center for Quality of Management Journal*, 2(4), Fall 1993, special issue. https://www.walden-family.com/public/cqm-journal/2-4-Whole-Issue.pdf

**Status:** full text read.

**Key concepts**
- Categories:
  - *must-be*: lack causes strong dissatisfaction, and fulfilment only reaches neutral (good brakes);
  - *one-dimensional*: satisfaction is proportional to performance (fuel economy);
  - *attractive*: delights, and absence is not dissatisfying;
  - *indifferent*: neither way (a cigarette lighter in a car);
  - *reverse*;
  - *questionable*: the two answers contradict each other.
- Each feature gets a paired functional question ("if present") and dysfunctional question ("if absent"), with five answers each. A Kano evaluation table maps the pair to a category.
- *Reverse* means "our a priori judgment of functional and dysfunctional was the reverse" of what the customer feels.
  - A few Reverse answers point to a distinct segment, which may be a segmentation opportunity.
  - A majority of Reverse answers means the designers' framing is inverted. The authors' example is pre-planned tour events.
- Mixed category votes, for example split evenly between A, M and O, may indicate *different segments*. Averaging them can mislead.
- A reproduced figure labels basic (must-be) requirements as "implied, self-evident, not mentioned, taken for granted", and performance requirements as "stated, specified, measurable".

**Principle for an automated needs adviser**
- *Must-be needs are often unspoken.* The adviser must supply category defaults: a dishwasher that cleans, a purifier that does not leak ozone.
- *Indifference* is legitimate. A feature the shopper is indifferent to should neither add to nor subtract from fit.
- *Reverse* is a first-class signal. A shopper who says "I don't want an app", "no milk system" or "no beeps" turns a feature's presence into a penalty for that shopper.
- Category assignment is per person or segment, not per feature.

**Limits.** A practitioner compendium (firm experience), not peer-reviewed validation.

**Failure modes**
- Treating Kano categories as fixed properties of features.
- Averaging across shoppers.

### 23. Mikulić & Prebežac (2011), critical review of Kano classification techniques

**Citation.** Mikulić, J. & Prebežac, D. (2011). A critical review of techniques for classifying quality attributes in the Kano model. *Managing Service Quality*, 21(1), 46–66. DOI 10.1108/09604521111100243 (Crossref-verified).

**Status:** abstract read (publisher abstract, through a search extract).

**Key concepts**
- Five classification approaches are compared:
  1. the Kano questionnaire;
  2. penalty–reward contrast analysis;
  3. the importance grid;
  4. qualitative data (critical incidents, complaints and compliments);
  5. direct classification.
- Only the Kano questionnaire and direct classification can classify attributes *before* a product is designed.
- Penalty–reward contrast analysis is useful for impact on satisfaction, but its Kano classification ability is questioned.
- The importance grid is advised against.
- Critical incidents and complaint analysis are valid but of questionable reliability.

**Principle**
- To learn whether a shopper treats a feature as must-be, attractive or reverse, *ask directly* in paired present/absent form.
- Do not infer it from review sentiment. Complaint and compliment mining is unreliable for this.

**Limits.** Abstract only.

---

## Part 5 — Jobs-to-be-done / Outcome-Driven Innovation (treated critically)

### 24. Ulwick (2002), Turn customer input into innovation

**Citation.** Ulwick, A. W. (2002). Turn customer input into innovation. *Harvard Business Review*, 80(1), January, 91–97 (HBR item R0201H).

**Status:** abstract read (HBR store summary).

**Key concepts**
- Customers should be "asked only for outcomes", not for solutions or features.
- Method:
  1. interviews deconstruct an activity into "desired outcomes";
  2. participants rate each outcome by importance and by current satisfaction;
  3. an "opportunity calculation" ranks the opportunities.
- Case: Cordis Corp. The market-share figures come from Ulwick's own firm (Strategyn), not from independent sources.

**Principle.** The outcome/solution separation agrees with Ulrich & Eppinger's "what not how" and with FBS. An *outcome* must be phrased so it can be rated for importance and satisfaction.

**Caveat.** Practitioner article; the evidence is the author's own cases.

### 25. Ulwick (2005), What Customers Want

**Citation.** Ulwick, A. W. (2005). *What Customers Want: Using Outcome-Driven Innovation to Create Breakthrough Products and Services*. McGraw-Hill. ISBN 9780071408677.

**Status:** secondary source only (PDMA book review, Strategyn pages, summaries).

**Key concepts (secondary)**
- Desired-outcome statements have a standard form: direction of improvement, unit of measure, object of control, and a contextual clarifier.
- Opportunity score as commonly reported: importance + max(importance − satisfaction, 0). The secondary sources differ on the exact formula.

**Principle.** Outcome statements with a *direction and a metric* are close to testable claims ("minimise noise heard while sleeping"). This is the bridge to the measurement layer.

**Caveats / weak empirical status**
- I found no peer-reviewed independent validation of ODI's opportunity score or of its claims of predictive success. Evidence comes mostly from consultancy cases.
- The scoring treats ordinal top-box percentages as interval data.

### 26. Christensen, Hall, Dillon & Duncan (2016), Know your customers' "jobs to be done"

**Citation.** Christensen, C. M., Hall, T., Dillon, K. & Duncan, D. S. (2016). Know your customers' "jobs to be done". *Harvard Business Review*, 94(9), September, 54–62. https://hbr.org/2016/09/know-your-customers-jobs-to-be-done

**Status:** abstract read (HBR teaser and opening). The page numbers are from the usual citation and were not verified on the page.

**Key concepts**
- Innovation remains "hit-or-miss" despite plentiful customer data. Developers focus on profiles and correlations rather than on the progress customers seek.
- Customers "hire" products to get a job done in a particular circumstance. The functional/social/emotional dimensions are widely attributed to this article; that attribution is secondary.
- The visible evidence is a McKinsey executive poll and anecdotes (a condo developer, Southern New Hampshire University).

**Principle.** The *circumstance* matters as much as the outcome: "I need coffee before a 6 am shift" differs from "weekend espresso hobby". This agrees with ISO context of use and with Chandrasekaran's mode of deployment.

**Caveats / weak empirical status**
- My searches found no peer-reviewed test of JTBD as a predictive theory.
- The practitioner literature disputes its core tenets, including whether jobs are stable and solution-agnostic. Christensen's, Ulwick's and Moesta's versions differ.
- Treat it as a *heuristic vocabulary*, not as validated science.

---

## Part 6 — Needs-based vs feature-based advice for novices

### 27. Felix, Niederberger, Steiger & Stolze (2001), Feature-oriented vs. needs-oriented product access

**Citation.** Felix, D., Niederberger, C., Steiger, P. & Stolze, M. (2001). Feature-oriented vs. needs-oriented product access for non-expert online shoppers. In B. Schmid, K. Stanoevska-Slabeva & V. Tschammer (Eds.), *Towards the E-Society* (Proc. 1st IFIP I3E), IFIP vol. 74, 399–406. Springer. DOI 10.1007/0-306-47009-8_28. Author copy: https://www.familie-steiger.ch/patrick/publications/I3E-2001.pdf

**Status:** full text read.

**Key concepts**
- Three catalogue styles:
  - hierarchical;
  - feature-oriented (a form of feature requirements);
  - needs-oriented (asking intended use, such as what photos and whether on trips).
- Shopper typology:
  - *novice*: "not able to map individual needs to product feature preferences";
  - *advanced user*;
  - *expert*.
- Experiment:
  - 20 non-experts (digital cameras), each doing both needs (N) and feature (F) sessions, in counterbalanced order;
  - ten questions per session; 25 cameras ranked through "ability profiles" of +/– relevance rules;
  - question selection by elimination (the highest potential for negative evidence).
- Results:
  - first-session satisfaction N 0.9 vs F 0.5 (scale −2..2), not significant;
  - after the second session, F scored higher (1.3 vs 0.7);
  - 18/20 recommended needs-oriented advice *for novices*;
  - eight preferred F personally, and some who struggled with feature questions still preferred F, possibly primed by feature-focused advertising.
- Learning effect: answering needs questions first raised later acceptance of the feature dialogue. Seeing ranked products let shoppers learn the needs ↔ features mapping. This effect was not significant.
- Recommendation: start non-experts in needs mode, but do not lock them in. Allow switching between modes, and treat navigation as a learning process.

**Principle for an automated needs adviser**
- Lead with outcomes and use for novices.
- *Show the mapping* from each need to the features and properties of the recommended products, so the shopper learns.
- Accept feature-level input at any time, and translate it back to the outcome it serves.

**Limits**
- n = 20, not significant, one product category, self-reported preference.
- The authors note this themselves.

**Counterexample.** Self-reported preference did not match observed difficulty. Shoppers may *ask* for features they cannot evaluate.

### 28. Stolze & Ströbel (2003, 2004), recommending as teaching

**Citations**
- Stolze, M. & Ströbel, M. (2003). Dealing with learning in eCommerce product navigation and decision support: the teaching salesman problem. *Proc. MCPC 2003* (World Congress on Mass Customization and Personalization), 47:1–47:20. Bibliographic record from DBLP via a search snippet; the DBLP site itself was bot-walled.
- Stolze, M. & Ströbel, M. (2004). Recommending as personalized teaching. In C.-M. Karat, J. O. Blom & J. Karat (Eds.), *Designing Personalized User Experiences in eCommerce*, 293–313. Springer. DOI 10.1007/1-4020-2148-8_16 (Crossref-verified).

**Status:** could not verify (content). Both exist, but no abstract or text was reachable: the Springer page redirects to a cookie wall, and DBLP is bot-walled.

**What can be said.**
- The titles frame recommending as teaching the shopper the domain, which is consistent with Felix et al.'s learning finding.
- A later Stolze paper (CHI 2004 extended abstract, "Well-integrated needs-oriented recommender components regarded as helpful") was seen only as a search title. A search summary said some experiments "could not verify a user preference for needs-oriented recommendation components". This is unverified.

**Principle (tentative).** Advice should teach. That is, it should explain which properties matter for which outcome, not only rank products.

### 29. Randall, Terwiesch & Ulrich (2005), Principles for user design of customized products

**Citation.** Randall, T., Terwiesch, C. & Ulrich, K. T. (2005). Principles for user design of customized products. *California Management Review*, 47(4), 68–85. DOI 10.2307/41166317 (Crossref-verified). Author copy: https://faculty.wharton.upenn.edu/wp-content/uploads/2012/10/Randalletal_05.pdf

**Status:** full text read.

**Key concepts**
- The paper separates *design parameters* (what the firm sets, such as processor or graphics card) from *product attributes* (what users experience, such as speed or weight).
- *Parameter-based* interfaces expose the design parameters. *Needs-based* interfaces let users state the desired values or importance of attributes, and the system configures the product.
- Perfume example: a consumer cannot specify the percentage of distearyldimonium chloride, but can say whether they prefer floral or spicy.
- In a Dell laptop experiment:
  - less-expert users made poor-fit choices with parameter interfaces and were significantly more satisfied with the needs-based one;
  - experts significantly preferred the parameter-based interface and achieved better fit with it.
- Principles:
  - customise the process to expertise;
  - provide starting points;
  - support incremental refinement;
  - use prototypes;
  - teach the consumer by explaining attributes and how they map to design parameters, and by showing distributions across the population.

**Principle for an automated needs adviser**
- Maintain three layers:
  1. outcome / attribute *as experienced* (quiet, crema);
  2. *design parameter* (fan rpm, pump pressure, grinder burr type);
  3. *mapping* between them.
- Let novices work in layer 1 and experts in layer 2.
- Always be able to explain the mapping.

**Limits.** One category (laptops); a configurator rather than a choice among existing products.

### 30. Randall, Terwiesch & Ulrich (2007), User design of customized products

**Citation.** Randall, T., Terwiesch, C. & Ulrich, K. T. (2007). Research note — User design of customized products. *Marketing Science*, 26(2), 268–280. DOI 10.1287/mksc.1050.0116 (Crossref-verified).

**Status:** abstract read (IDEAS/RePEc abstract, through a search extract).

**Key concepts**
- Parameter-based systems let users set design parameters directly. In needs-based systems, users state the relative importance of their needs and an optimisation algorithm recommends parameters.
- With parameter-based systems, outcomes (comfort and fit measures) rise with user expertise. For novices the needs-based interface gives better outcomes.

**Principle.** This is peer-reviewed support for needs-first advice to novices, conditional on expertise.

**Limits.** Abstract only; laptop domain.

---

## Part 7 — Context model

### 31. ISO 9241-11:2018, usability: definitions and concepts

**Citation.** ISO 9241-11:2018. *Ergonomics of human-system interaction — Part 11: Usability: Definitions and concepts.* 2nd ed. Geneva: ISO. It replaces the 1998 edition. Official preview (SIST): https://preview.sist.si/sist-preview/63500/33c267a5a7564f298f02bbd65721a181/ISO-9241-11-2018.pdf

**Status:** full text read for the official preview, Clauses 1–3 (terms and definitions). The later clauses (context-of-use components and measures, seen only in the table of contents) were not read.

**Key concepts (Clause 3)**
- *Usability* is the extent to which a product can be used by specified users to achieve specified goals with effectiveness, efficiency and satisfaction in a specified context of use.
- *Context of use* is a "combination of users, goals and tasks, resources, and environment". Environment includes the technical, physical, social, cultural and organisational environments.
- A *goal* is an "intended outcome".
- A *task* is a set of activities to achieve a goal. Note 2: "goals are independent of the means used to achieve them, tasks describe particular means".
- *Effectiveness* is the accuracy and completeness of goal achievement. *Efficiency* is the resources used, such as time, effort, cost and materials. *Satisfaction* is how far the user's physical, cognitive and emotional responses meet their needs and expectations.
- *Stakeholder*: different stakeholders have different needs. Users include people who use the system's *output*. A *user group* is defined by user, task or environment characteristics.
- *Harm from use* covers negative consequences for health, safety, finances or the environment, for the user or for others.

**Principle for an automated needs adviser**
- ISO gives a ready-made, standard *situation schema*. For each request, record:
  - who the users are, including indirect users such as a partner sleeping in the same room;
  - goals (outcomes);
  - tasks (means, including the features the shopper intends to use);
  - resources (budget, time, counter space, running cost);
  - environment (room size, water hardness, noise floor).
- The definition goal = outcome, task = means is the standard's own form of "a function is not an outcome".
- Outcome success splits into effectiveness (was the outcome achieved?), efficiency (at what cost in time, energy, money?) and satisfaction.

**Limits.** It is a usability standard, not a purchase model, and I read only the definitions.

---

## Synthesis

### S1. A layered model for an automated buying adviser

| Layer | What it is | Grounding in this survey | Example: air purifier | Example: espresso |
|---|---|---|---|---|
| L0 Situation / context of use | Users (including indirect users), environment, resources, mode of deployment | ISO 9241-11; Chandrasekaran & Josephson (mode of deployment); Gero (context knowledge); JTBD (circumstance) | Bedroom, 14 m², partner is a light sleeper, runs overnight | Small kitchen, weekday mornings, beginner |
| L1 Outcome (goal / need / consequence) | The intended state of the user or the world; solution-neutral | ISO "goal = intended outcome"; Ulrich & Eppinger "what not how"; Gutman consequences; Ulwick desired outcome; FR "function as effect on environment" | Sleep undisturbed while the air is cleaned | Espresso with crema and body |
| L2 Function (intended effect, verb + flow) | What the product is meant to do, independent of how | Hirtz functional basis; Kitamura functional concepts; Umeda function symbol | Remove particulates from room air; limit emitted sound and light | Extract coffee under pressure; foam milk |
| L2′ Way / feature (named mechanism) | A particular way of achieving a function, often marketed as a feature | Kitamura "way of function achievement"; ISO "task = particular means" | "Sleep mode", "night light off" | "15-bar pump", "steam wand", "pressurised basket" |
| L3 Behaviour | What the product actually does over time in a stated mode | Gero Be/Bs; Umeda behaviour = state transitions; Kitamura B1 | Delivers X m³/h at the night setting while radiating Y dB(A) | Holds about 9 bar at the puck for 25–30 s at about 93 °C |
| L4 Structure / design parameter | Components and their properties | Gero S; Randall et al. design parameters; HoQ engineering characteristics | Fan, filter grade, housing | Pump type, boiler/thermoblock, basket type |
| L5 Measurable property and test condition | A quantity with unit, method and conditions | HoQ target values and benchmarks; Ulwick metric; Hirtz power conjugates; Gero computational knowledge | CADR (per standard) and sound power or pressure *at that CADR / setting*, distance, room | Brew pressure, temperature stability, extraction yield, under a stated protocol |

**Relation types and what each licenses**

| Relation | Meaning | Licenses | Does **not** license |
|---|---|---|---|
| `situated_in` (L0 → L1) | The outcome is wanted in this context | Adding context-dependent must-be needs (bedroom → no light or beeps); choosing the test condition that matches the deployment mode | Assuming the context; unknown context must be asked or flagged |
| `refines` (L1 → L1) | A sub-outcome of a parent outcome (needs hierarchy, Griffin & Hauser / Ulrich & Eppinger) | Decomposition and importance weights *elicited from this shopper* | Importance read from mention frequency |
| `is_achieved_by_function` (L1 → L2) | The function contributes to the outcome under the goal (Kitamura: goal-relative) | Considering products that offer the function | Claiming the outcome is met |
| `is_a_way_of` (L2′ → L2) | The feature is one way of achieving the function (Kitamura OR-alternatives) | Substituting another way of achieving the same function, unless the shopper requires this way; normalising feature names | Merging features on name similarity (Umeda: many-to-many F–B links) |
| `is_realised_by_behaviour` (L2 / L2′ → L3) | The function is exhibited by this behaviour in this mode | Saying what to *measure* to check the function | Assuming every product's "sleep mode" yields the same behaviour |
| `produced_by` (L4 → L3) | Structure causes behaviour (physical, objective) | Engineering explanations ("why it's quiet"); predictions only with computational knowledge | Ranking on structure labels alone ("brushless motor, therefore quiet") |
| `measured_by` (L3 → L5) | The behaviour is quantified by this property under this test condition | Verdicts: Bs vs Be (Gero evaluation) | Using a measurement taken in a different mode or condition without a caveat |
| `meets_threshold` (L5 → L1, via Be) | The measured value satisfies the expected-behaviour target derived from the outcome | Saying "likely achieves the outcome *under condition C*" | Saying the outcome is guaranteed. The threshold is a hypothesis (FBS reformulation) |
| `trades_off_with` (L3/L5 ↔ L3/L5) | Characteristics in tension (the HoQ "roof") | Explaining compromises | Numeric weighting of the trade-off (Olewnik & Lewis) |
| `kano_class(shopper, item)` (L0 × L2′/L5) | Must-be, one-dimensional, attractive, indifferent or reverse *for this shopper* | Gating (must-be), scoring (one-dimensional), bonus (attractive), ignoring (indifferent), penalising (reverse) | Treating the class as a fixed property of the feature |

*Key rule (the owner's point, as these sources support it).* A function or feature never implies the outcome by itself. Only the chain L2′ → L3 → L5, *measured under the deployment condition* and compared with a target derived from L1, supports the claim that the feature *contributes* to the outcome.

### S2. Telling an outcome from a function from a property in shopper language (operational tests)

1. **The "how" test (Ulrich & Eppinger; Ulwick; ISO).**
   - If the phrase can be achieved in more than one technical way, it is an *outcome* or a *function*.
   - If it names one way, it is a *feature / way*. Examples: "sleep mode", "steam wand", "heat-pump drying".
2. **The beneficiary / state test (ISO goal; Chandrasekaran's environmental effect).**
   - If the subject is the person or their world ("I", "we", "the baby", "my glasses", "the room"), and it describes a state they want, it is an *outcome*.
   - If the subject is the product ("it removes…", "it froths…"), it is a *function*, or a feature if it is named.
3. **The "why?" ladder test (Reynolds & Gutman).**
   - Ask "why does that matter?". If the answer is another product statement, you were at feature or function level.
   - If the answer is a personal consequence, *that* is the outcome. Stop at the first consequence a test can reach; do not climb to values.
4. **The unit test (Gero; HoQ; Hirtz).**
   - If the phrase carries, or naturally takes, a unit and a direction ("under 25 dB", "at least 9 bar", "more than 300 m³/h", "quieter"), it is a *property* or a *requirement on behaviour*.
   - Shoppers usually give the direction without the unit. The adviser supplies the unit and the test condition.
5. **The substitutability test (Kitamura).**
   - Would the shopper accept another way that gives the same result? If yes, the named feature was a proxy for a function or outcome.
   - If no ("I want a real steam wand to learn latte art"), the way itself is the requirement. This is the over-abstraction failure mode.
6. **The test-condition test (Chandrasekaran mode of deployment; Gero context knowledge).**
   - A property is only usable once the condition is known: "noise *at the setting that gives enough CADR for 14 m²*".
   - A noise figure without its setting is a datum, not yet evidence for the outcome.
7. **The polarity test (Kano reverse; Ulrich & Eppinger positive phrasing).**
   - Negative phrasing ("no app", "no beeps", "nothing plastic touching the coffee") marks a *rejection* or *constraint*.
   - Normalise the wording, but keep the polarity.

### S3. Implications for indifference, rejected features and attractive vs must-be needs

- **Indifference is a valid, recordable answer** (Kano: indifferent). If a shopper is indifferent to a feature, it should:
  - add nothing to fit;
  - not be presented as a reason to buy;
  - still count for *price* (paying for unwanted features is a cost).
  Felix et al.'s "don't care" answer option shows this is practical in dialogue.
- **Rejected features are Kano-reverse for this shopper, not noise.**
  - Presence should be a penalty, or a hard exclusion if the shopper says so.
  - Berger et al. show that reverse answers can mark a *segment*, so they must not be averaged away.
  - A rejection can also attach to a *way* rather than a function ("no milk system to clean" while still wanting milk drinks). Store it at the right layer.
- **Must-be needs are usually unspoken** (Berger et al.'s figure: "not mentioned, taken for granted").
  - The adviser needs category-level default must-be outcomes, such as cleans properly, is safe and has no harmful emissions, checked by tests.
  - Do not rely on the shopper to state them.
  - Meeting them earns no extra credit, but failing them is disqualifying. They work as *gates*, not scores.
- **Attractive vs one-dimensional**
  - An attractive feature can lift a choice between otherwise equal candidates, but its absence should not penalise.
  - One-dimensional properties (noise, CADR, running cost) are where *measured* evidence should drive ranking.
- **Per-person and changing classes**
  - Categories are per person or segment (Berger et al.) and can change over time. The Kano lifecycle (delighter → performance → basic) is plausible but unsourced in the material I checked.
  - Elicit classes in paired present/absent form when it matters (Mikulić & Prebežac). Do not infer them from review sentiment.
- **Learning changes the answers** (Felix et al.; Kannengiesser & Zhu; situated FBS).
  - Shoppers discover requirements while looking at candidates.
  - The adviser should allow reformulation and record why it changed.

### S4. Pitfalls

1. **Function = outcome conflation.** Ranking on "has sleep mode" as if it guaranteed quiet sleep. FBS (no direct F → S path), Umeda (subjective F–B links) and Kitamura (goal-relative function) all reject this.
2. **Name merging of features or functions.** One label hides different behaviours (many-to-many F–B). Never merge on similar names; compare behaviour and measurements.
3. **Missing test condition / deployment mode.** Comparing noise at different settings, or CADR without room size, overstates the evidence.
4. **Judgemental weights read as causal.** HoQ and QFD relationship strengths, and means-end links, are elicited judgements. Olewnik & Lewis show the HoQ numbers are not valid quantitative design data. Use them to *direct attention*, not as effect sizes.
5. **Imposed hierarchy.** Laddering and HVMs can manufacture directional chains (van Rekom & Wierenga; Grunert & Grunert). Store typed relations and allow both directions of reasoning.
6. **Universalising individual chains or Kano classes.** Means-end chains and Kano categories are per person or segment. Averaging across shoppers produces incoherent "typical" needs.
7. **Importance from frequency.** Mention counts, in dialogue or in review corpora, are not importance (a question Griffin & Hauser raise).
8. **Over-abstraction.** Replacing a genuinely wanted *way* (a steam wand for learning) with its function.
9. **Locking novices in needs-mode, or experts in feature-mode.** Evidence is conditional on expertise (Randall et al. 2005, 2007), and the needs-first advantage was small and non-significant in Felix et al. Provide both modes and show the mapping.
10. **Positive-phrasing loss.** Normalising "no beeps at night" into a positive statement can drop the constraint.
11. **Practitioner frameworks presented as validated theory.** JTBD/ODI and the Kano lifecycle lack independent peer-reviewed validation in what I found. Use them as vocabulary, not as evidence.
12. **Manufacturer feature claims are not behaviour.** A declared "sleep mode, 22 dB" is a declaration of L5 under an unstated condition. Independent tests are needed to establish Bs.

---

## Source count and verification summary

Sources are numbered 1–31. Source 28 is two Stolze & Ströbel items counted as one entry.

| Status | Count | Sources |
|---|---|---|
| full text read | 11 | 1, 3, 6, 9, 10, 11, 15, 22, 27, 29, 31 (ISO: Clauses 1–3 via official preview) |
| abstract read | 12 | 2, 4, 7, 8, 16, 18, 19, 21, 23, 24, 26, 30 |
| secondary source only | 7 | 5, 12, 13, 14, 17, 20, 25 |
| could not verify (content) | 1 | 28 (existence verified via Crossref/DBLP) |
| **Total** | **31** | |
