# A. Goal-oriented and ontological requirements engineering: a primary-literature survey for PEE needs reasoning

Survey date: 2026-10-20. Method: web search; bibliographic checks against Crossref (`api.crossref.org/works/<DOI>`); reading of open full texts (author preprints, arXiv, university repositories) converted with `pdftotext`; and abstracts from repository pages.

Quotes are verbatim and under 25 words. Everything else is paraphrase. No page bytes are kept beyond this note.

## Verification status legend

- **full text read**: I read the open full text, or the named sections of it. The sections are listed with each entry.
- **abstract read**: I read only the abstract, directly from a publisher or repository page.
- **secondary source only**: the bibliographic record was checked (usually against Crossref), but the content comes from other papers that describe it, or from search-engine summaries.
- **could not verify**: no reliable record was found. No entry in this survey falls in this class. Individual claims that could not be verified are flagged inline.

---

## 1. KAOS and the Louvain line of work

### 1.1 Dardenne, van Lamsweerde & Fickas (1993): Goal-directed requirements acquisition

- **Citation:** A. Dardenne, A. van Lamsweerde, S. Fickas. "Goal-directed requirements acquisition." *Science of Computer Programming* 20(1–2): 3–50, 1993.
- **DOI:** 10.1016/0167-6423(93)90021-G. Title, journal, year and pages were confirmed on Crossref.
- **Status:** secondary source only. The bibliography is verified, but the paper is behind the Elsevier paywall. Its content is described in 1.2 and 1.3 (both read in full), which cite it as [Dar93].
- **Key concepts (as reported in 1.2 and 1.3):**
  - KAOS is a goal-driven method. It builds complementary sub-models: a goal model, an object model, an agent/responsibility model and an operation model.
  - Goals are refined in AND/OR graphs until they become assignable to single agents.
  - Agents are active components (humans, devices, software) that can choose their behaviour.
  - There is a "2-button" formal layer: temporal-logic definitions are optional and are used for critical goals only.
- **Principle for PEE:** Model a need as an *objective* that may need several agents to cooperate. Refine it until each leaf can be checked against a single responsible party:
  - the product, through a measurable property;
  - the shopper, through an assumption about their behaviour;
  - the home, through a domain fact.
- **Limits:**
  - Designed for building new software-intensive systems.
  - An analyst builds the graph.
  - Formalisation is heavy.
- **Failure mode:** Nothing beyond what 1.2 and 1.3 report. I did not read the original.

### 1.2 van Lamsweerde (2001): Goal-oriented requirements engineering: a guided tour

- **Citation:** A. van Lamsweerde. "Goal-Oriented Requirements Engineering: A Guided Tour." *Proc. RE'01, 5th IEEE Int. Symp. on Requirements Engineering*, Toronto, 2001, pp. 249–262.
- **DOI:** 10.1109/ISRE.2001.948567 (confirmed on Crossref). Open copy: https://webperso.info.ucl.ac.be/~avl/files/RE01.pdf
- **Status:** full text read.
- **Key concepts:**
  - A goal is an objective that the system under consideration should achieve. Goal statements are *optative* (about what is wanted), not *indicative* (about what is). Goals range from strategic to technical, and from functional to quality-of-service.
  - **Requirement vs assumption, decided by responsibility.** A goal assigned to one agent in the software becomes a requirement. A goal assigned to one agent in the environment becomes an *assumption* (in KAOS terms, an expectation). Assumptions "cannot be enforced by the software-to-be".
  - **Goals give a completeness criterion.** The satisfaction relation "R, As, D ⊨ g with R, As, D ⊭ false" must hold for every goal. Here R is the requirements, As the environment assumptions and D the domain properties.
  - **Elicitation.** WHY questions climb to parent goals; HOW questions descend to subgoals and requirements.
  - **Obstacles.** O obstructs G in Dom iff {O, Dom} ⊨ ¬G and Dom ⊭ ¬O.
  - **Divergence.** Goals diverge iff some feasible boundary condition B makes them jointly inconsistent with Dom, while each subset without one goal remains consistent. Conflicts are "the rule, not the exception".
  - Alternative selection (which refinement, which agent) is called "by and large an open problem". The suggested direction is NFR-style qualitative reasoning or multicriteria analysis.
  - The paper summarises NFR label semantics: S (satisficed), D (denied), C (conflicting), U (undetermined).
- **Principles for PEE:**
  1. Separate what the shopper *wants* (optative) from what is *true* of the home or the shopper (indicative).
  2. Who is responsible for a goal decides its kind. "Shopper will descale weekly" is an assumption about the shopper as agent. The adviser can recommend on it but cannot enforce it, so it must be shown as an assumption.
  3. Use WHY and HOW as the two traversal directions:
     - WHY: from "quiet" up to "not woken at night".
     - HOW: from "not woken" down to "noise ≤ X dB(A) in night mode, under a stated test condition".
  4. A recommendation is justified only when requirements plus assumptions plus domain facts entail the need *and* are mutually consistent.
- **Limits:**
  - This is a tutorial and survey.
  - Formal entailment assumes formalised goals.
  - The analyst drives elicitation.
  - The paper itself admits there is no systematic alternative-selection method.
- **Failure modes:**
  - Requirements that are incomplete with respect to the goals.
  - Overlooked conflicts.
  - Late discovery of goals ("especially when WHY questions" are asked late).

### 1.3 van Lamsweerde & Letier (2000): Handling obstacles in goal-oriented requirements engineering

- **Citation:** A. van Lamsweerde, E. Letier. "Handling Obstacles in Goal-Oriented Requirements Engineering." *IEEE Transactions on Software Engineering* 26(10): 978–1005, Oct 2000.
- **DOI:** 10.1109/32.879820 (confirmed on Crossref). Open copy: https://webperso.info.ucl.ac.be/~avl/files/TSE-Obstacles.pdf
- **Status:** full text read. Sections read: abstract, introduction, §3.1–3.2 (definition and completeness), the overview of resolution strategies, and the deidealization headings.
- **Key concepts:**
  - Obstacles are "a dual notion to goals": goals capture desired conditions, obstacles capture undesirable but possible ones. The authors present obstacles as a goal-level generalisation of hazards (for safety) and threats (for security).
  - **Overidealisation.** Goals, requirements and assumptions written by analysts are often "too ideal". The fix is to *deidealise* them, that is, weaken them so they hold in realistic conditions.
  - **Domain-completeness.** A set of obstacles O1..On is domain-complete for G iff {¬O1, …, ¬On, Dom} ⊨ G. Completeness is "relative to what is known about the domain".
  - **Generation.** Obstacles are generated by *regression* of ¬G through domain properties, which works like a weakest-precondition calculus, and by formal obstruction patterns.
  - **Resolution strategies.** Obstacle elimination, by:
    - prevention;
    - goal substitution;
    - agent substitution;
    - goal deidealization;
    - object transformation.

    The other strategies are obstacle reduction and obstacle tolerance (with mitigation and goal restoration).
  - **Choosing a strategy.** The choice depends on the obstacle's likelihood, its impact (how many goals it obstructs) and its severity (the priority of those goals). The paper also says the choice "should not be done too early".
- **Principles for PEE:**
  - **Obstacles as a model of contraindications and counterexamples.** For each inferred need, generate the conditions under which a candidate product would fail it. Examples:
    - an espresso machine that needs skill and time the shopper lacks;
    - a "quiet" dishwasher whose end-of-cycle beep cannot be disabled;
    - a freestanding unit that does not fit under the worktop.
  - **Resolution kinds map onto adviser moves:**
    - agent substitution: a super-automatic machine instead of a manual one;
    - goal deidealization: "quiet enough for an adjacent room" instead of "silent";
    - mitigation: advise a night-delay programme.
  - **Domain-completeness is the right humility statement.** "We found no contraindication" means no contraindication *with respect to the knowledge we hold*. It is not an absolute claim.
- **Limits:**
  - Formal regression needs temporal-logic goals and domain theories.
  - Risk and cost-benefit analysis is declared "outside the scope".
  - The worked examples are safety-critical systems (train control, ambulance dispatch).
- **Failure modes:**
  - Requirements that are unrealistic, unachievable or incomplete because exceptional behaviour was not anticipated.
  - Resolving an obstacle too early.
- **Related, checked bibliographically only:** E. Letier, A. van Lamsweerde. "Obstacle Analysis in Requirements Engineering: Retrospective and Emerging Challenges." *IEEE TSE* 51(3): 795–801, 2025. DOI 10.1109/TSE.2025.3534318. The bibliography was confirmed on Crossref; I did not read the content (secondary source only).

### 1.4 van Lamsweerde (2009): Requirements Engineering (book)

- **Citation:** A. van Lamsweerde. *Requirements Engineering: From System Goals to UML Models to Software Specifications.* Wiley, Chichester, 2009, 712 pp.
- **ISBN:** 978-0-470-01270-3, confirmed in library catalogues. No DOI found.
- **Status:** secondary source only. The bibliography is verified; I did not read the content.
- **Key concepts:** It is the textbook consolidation of the KAOS concepts in 1.2, 1.3, 1.5 and 1.6. I make no specific content claims because I did not read it.
- **Principle and limits:** Treat it as a reference for terminology, and cite the papers for specific claims.

### 1.5 van Lamsweerde, Darimont & Letier (1998): Managing conflicts in goal-driven requirements engineering

- **Citation:** A. van Lamsweerde, R. Darimont, E. Letier. "Managing Conflicts in Goal-Driven Requirements Engineering." *IEEE TSE* 24(11): 908–926, 1998.
- **DOI:** 10.1109/32.730542. Title, journal and pages were confirmed on Crossref.
- **Status:** secondary source only. The content comes from the summary in 1.2 (read in full), from course material and from the ACoRe paper (arXiv 2303.05213) found in search.
- **Key concepts:**
  - Strong conflict means logical inconsistency.
  - The weaker and far more common *divergence* means the goals cannot all be satisfied when a particular *boundary condition* holds.
  - Divergences should be detected and then resolved, through resolution operators such as goal weakening and restriction.
- **Principle for PEE:** Many shopper needs are not contradictory in general, only *under a boundary condition*. Examples:
  - "large capacity" and "fits a narrow kitchen" conflict only when the available width is below some value;
  - "silent" and "fast drying" diverge only for some product types.

  So record the boundary condition, not a blanket conflict.
- **Limits:** Formal (temporal logic). An analyst chooses the resolutions.
- **Failure mode:** Treating divergence as absent because the goals are logically consistent in the abstract.

### 1.6 Letier & van Lamsweerde (2004): Reasoning about partial goal satisfaction

- **Citation:** E. Letier, A. van Lamsweerde. "Reasoning about Partial Goal Satisfaction for Requirements and Design Engineering." *Proc. SIGSOFT'04/FSE-12*, Newport Beach, 2004, pp. 53–62.
- **DOI:** 10.1145/1029894.1029905 (confirmed on Crossref). Open copy: https://webperso.info.ucl.ac.be/~avl/files/avl-FSE04.pdf
- **Status:** full text read. Sections read: abstract and §3.1.
- **Key concepts:**
  - Non-functional goals "cannot be satisfied in an absolute, clear-cut sense". Earlier qualitative frameworks lead to "limited conclusions", because goal formulations are imprecise and there are no rules for propagating impact.
  - Each goal is annotated with *quality variables*. A quality variable is a domain-specific random variable with a sample space and a natural-language definition.
  - Each goal is also annotated with *objective functions*. An objective function has a definition, a modality (maximise or minimise), a *target* value, and optionally the *current* value. The paper's example is the probability that response time is at most 8 minutes, with a target of 50% and a current value of 35%.
  - The impact of alternative refinements is computed with refinement equations over random variables.
- **Principle for PEE:** This is the closest GORE construct to a *verifiable requirement with test conditions*. Turn a quality need into:
  1. a quality variable with an explicit sample space (for example, noise measured under a named test standard and programme);
  2. an objective function with a target.

  "Quiet" then becomes "noise level under programme P, per standard S, minimise, target ≤ T", and the reason for the target is stated.
- **Limits:**
  - Needs probabilistic models of the system's behaviour.
  - The analyst sets the targets.
  - Designed for comparing system designs, not off-the-shelf products.
- **Failure mode:** Comparing alternatives on vague goal labels gives inconclusive or misleading rankings.

---

## 2. i* and iStar 2.0

### 2.1 Yu (1997): early-phase requirements engineering and i*

- **Citation:** E. S. K. Yu. "Towards Modelling and Reasoning Support for Early-Phase Requirements Engineering." *Proc. RE'97, 3rd IEEE Int. Symp. on Requirements Engineering*, 1997, pp. 226–235.
- **DOI:** 10.1109/ISRE.1997.566873 (confirmed by a Crossref title query). Open copy: https://ftp.cs.toronto.edu/pub/eric/RE97.pdf
- **Status:** full text read. Sections read: abstract, introduction and §2 (Strategic Dependency and Strategic Rationale models).
- **Key concepts:**
  - The *early phase* of requirements engineering models stakeholder interests and how they "might be addressed, or compromised" by alternative designs of the system and its environment. The *late phase* deals with completeness and consistency.
  - The **Strategic Dependency (SD)** model shows actors depending on one another for a *dependum*. There are four dependency types, and each leaves different freedom to the dependee:
    - **goal dependency:** the dependee chooses how to achieve it;
    - **task dependency:** the way of doing it is prescribed;
    - **resource dependency:** the dependee only has to provide something;
    - **softgoal dependency:** "it is up to the depender to decide what measures are enough".
  - Depending on others creates both *opportunity* and *vulnerability*.
  - The **Strategic Rationale (SR)** model looks inside each actor. Its elements (goals, tasks, resources, softgoals) are linked by means-ends links and task-decomposition links. Softgoals are used to evaluate alternatives.
- **Principles for PEE:**
  - **The shopper depends on the product.** The dependency type tells the adviser how much latitude to allow:
    - "I want clean dishes" is a goal dependency, so any satisfying mechanism is acceptable.
    - "I want a bean-to-cup machine" is a task or resource dependency, so the means is fixed by the shopper.
    - "I want it quiet" is a softgoal dependency, so the *shopper* decides what level is enough. The adviser must ask or mark its threshold as an assumption.
  - The adviser also depends on publishers for evidence, which makes it vulnerable to their failure. That is a useful framing for attribution.
- **Limits:**
  - Qualitative.
  - An analyst models organisational settings.
  - No formal semantics in this paper.
- **Failure mode:** Requirements written without the "whys" lose the rationale that is needed to judge alternatives later.

### 2.2 Dalpiaz, Franch & Horkoff (2016): iStar 2.0 Language Guide

- **Citation:** F. Dalpiaz, X. Franch, J. Horkoff. "iStar 2.0 Language Guide." arXiv:1605.07767 [cs.SE], 2016.
- **URL:** https://arxiv.org/abs/1605.07767 (no DOI).
- **Status:** full text read. Sections read: §4 to §6.4.
- **Key concepts:**
  - **Goal:** "a state of affairs that the actor wants to achieve and that has clear-cut criteria of achievement".
  - **Quality:** "an attribute for which an actor desires some level of achievement". The level "may be defined precisely or kept vague". Qualities guide the search for ways to achieve goals and serve as evaluation criteria.
  - **Task** and **resource:**
    - A task is an action the actor wants executed.
    - A resource is a physical or informational entity that a task needs.
  - iStar 2.0 *departs from the goal/softgoal dichotomy*: qualities may be "soft" or "hard".
  - **Refinement** is AND or inclusive OR, and a parent cannot be both. An OR-child task is a *means* for the goal (the *end*).
  - **NeededBy** links a resource to a task.
  - **Qualification** links a quality to the goal, task or resource it qualifies. Example: "Quick booking" qualifies "Trip parts booked".
  - **Contribution** links go to qualities only. Their meanings:
    - Make: "sufficient positive evidence";
    - Help: "weak positive evidence";
    - Hurt: "weak evidence against";
    - Break: "sufficient evidence against".
  - **Dependency** has five arguments: depender, dependerElmt, dependum, dependee and dependeeElmt. The "why" or "how" elements may be omitted to express *partial knowledge*. The dependum's type sets the semantics; for example, for a quality the dependee must "sufficiently satisfy" it.
- **Principles for PEE:**
  1. **Need-statement kinds.** Goal (clear-cut), quality (graded, possibly vague), task (prescribed means), resource (needed thing).
  2. **Qualification** is how "quiet *dishwasher*" or "bar-like *espresso*" should be stored: a quality attached to a goal, not a free-floating adjective.
  3. **Contributions are evidence, with strength and polarity.** They suit attributable product evidence: a lab measurement can *make* or *break*; a manufacturer claim can at most *help*.
  4. **Omitting the why or how is allowed.** This legitimises recording a need whose rationale is still unknown.
- **Limits:**
  - A notation guide. Analysis procedures are out of scope.
  - The graphical semantics of refinement were left to future versions.
- **Failure modes:**
  - Inconsistent use of the functional/non-functional distinction "varied in practice", which is why iStar 2.0 dropped it.
  - Sharing a dependum between dependencies is forbidden.

---

## 3. The NFR framework and reasoning with goal models

### 3.1 Mylopoulos, Chung & Nixon (1992): Representing and using nonfunctional requirements

- **Citation:** J. Mylopoulos, L. Chung, B. Nixon. "Representing and Using Nonfunctional Requirements: A Process-Oriented Approach." *IEEE TSE* 18(6): 483–497, June 1992.
- **DOI:** 10.1109/32.142871 (confirmed on Crossref).
- **Status:** secondary source only. The abstract was available only as a search-engine summary of the IEEE Xplore record. The semantics come from full-text descriptions in 1.2, 3.3 and 4.2.
- **Key concepts:**
  - Non-functional requirements are represented as interrelated goals.
  - Goals are refined by refinement methods.
  - Designs are evaluated for how well they support the goals.
  - The evaluation was illustrated on accuracy and performance requirements for information systems.
  - **Satisficing** (as described in 1.2): soft goals cannot be established "in a clear-cut sense". Labels propagate along contribution links.
- **Principle for PEE:** Quality needs ("quiet", "good espresso") are satisficed, not satisfied. Product choice is evaluated by propagating positive and negative contributions, not by a single pass/fail test.
- **Limits:**
  - Process-oriented and analyst-driven.
  - Qualitative.
- **Failure mode:** Treating non-functional requirements as afterthoughts.

### 3.2 Chung, Nixon, Yu & Mylopoulos (2000): Non-Functional Requirements in Software Engineering (book)

- **Citation:** L. Chung, B. A. Nixon, E. Yu, J. Mylopoulos. *Non-Functional Requirements in Software Engineering.* Kluwer Academic, Boston, 2000. International Series in Software Engineering vol. 5.
- **DOI:** 10.1007/978-1-4615-5269-7 (confirmed on Crossref). ISBN 978-0-7923-8666-7.
- **Status:** secondary source only. Checked: bibliography, catalogue table of contents (it includes "The NFR framework" and "Softgoal interdependency graphs"), and the publisher description as summarised by search.
- **Key concepts (from the description only):**
  - Non-functional requirements are softgoals in *softgoal interdependency graphs*. The graphs capture trade-offs and synergies.
  - The impact of design decisions is propagated qualitatively to judge how well a design satisfices its non-functional requirements.
  - I did not verify the book's catalogues of refinement methods or its correlation rules.
- **Principle for PEE:** Reusable *catalogues* of quality decompositions are the part of NFR work an automated adviser can use directly. An example is a "quiet" catalogue: airborne noise, tonal alerts, vibration, night mode.
- **Limits:** As for 3.1.
- **Failure mode:** Not verified.

### 3.3 Giorgini, Mylopoulos, Nicchiarelli & Sebastiani (2002, 2003): Reasoning with goal models

- **Citations:**
  - (a) P. Giorgini, J. Mylopoulos, E. Nicchiarelli, R. Sebastiani. "Reasoning with Goal Models." *ER 2002*, LNCS (vol. 2503 per secondary listings), pp. 167–181. DOI 10.1007/3-540-45816-6_22 (confirmed on Crossref).
  - (b) Extended version: "Formal Reasoning Techniques for Goal Models." *Journal on Data Semantics I*, LNCS, 2003, pp. 1–20. DOI 10.1007/978-3-540-39733-5_1 (confirmed on Crossref).
- **Status:**
  - (a) full text read, from the University of Trento technical report DIT-02-0043 (https://iris.unitn.it/retrieve/3f7a1341-1641-451e-8bf5-d43b3645f368/43.pdf). Sections read: abstract, §1–3.1, the conflict definitions and §4 in part.
  - (b) secondary source only.
- **Key concepts:**
  - Goal models allow "partially defined and possibly inconsistent goals".
  - Besides AND/OR, they use lateral relations +, −, ++ and −−. ++(G, G′) means satisfying G implies satisfying G′; −− means it implies denying G′.
  - **Two separate evidence channels.** FS(G), PS(G), FD(G) and PD(G) mean full or partial evidence that G is satisfied, or that G is denied. Satisfaction and denial are tracked *independently*.
  - **Conflicts.** A *weak conflict* is partial evidence on both sides. A *strong conflict* is FS(G) and FD(G) together.
  - **Propagation.** Qualitative propagation uses Horn clauses, so it is decidable in polynomial time. It is sound and complete with respect to the axiomatisation.
  - The quantitative variant is probabilistic, under a stated simplifying assumption that sources of evidence are *independent*.
- **Principle for PEE:**
  - Keep **evidence for and evidence against** each need as separate channels with graded strength. Do not net them into one score.
  - "Strong conflict" is exactly the state to surface to the shopper: one independent test says quiet, another says loud.
  - The independence assumption warns against counting correlated sources twice, such as syndicated reviews or one manufacturer's figure repeated by retailers.
- **Limits:**
  - The labels and initial evidence come from analysts.
  - The numeric semantics assume independent evidence.
  - The experiments used one industrial-style goal model (car manufacturer strategy).
- **Failure modes:**
  - Contradictory contributions cannot be represented in plain AND/OR models.
  - Netting evidence hides conflict.

### 3.4 Horkoff & Yu (2013): Comparison and evaluation of goal-oriented satisfaction analysis techniques

- **Citation:** J. Horkoff, E. Yu. "Comparison and evaluation of goal-oriented satisfaction analysis techniques." *Requirements Engineering* 18(3): 199–222, 2013 (online January 2012).
- **DOI:** 10.1007/s00766-011-0143-y (confirmed on Crossref).
- **Status:** secondary source only (abstract via a search summary).
- **Key concepts:**
  - Seven similar satisfaction-analysis procedures, run in three tools on three models, gave *different results depending on model structure*.
  - The authors recommend using such analysis "only as heuristics" for decisions.
- **Principle for PEE:** Label propagation is not ground truth. Any propagated "needs satisfied" verdict should be reported as heuristic, with the contributing evidence shown.
- **Limits:** Not read in full.
- **Failure mode:** Over-trusting propagated satisfaction values.

---

## 4. Requirements ontology: from Zave & Jackson to CORE and Techne

### 4.1 Zave & Jackson (1997): Four dark corners of requirements engineering

- **Citation:** P. Zave, M. Jackson. "Four Dark Corners of Requirements Engineering." *ACM TOSEM* 6(1): 1–30, Jan 1997.
- **DOI:** 10.1145/237432.237434 (confirmed on Crossref). Author copy (preprint dated 16 July 1996): https://www.pamelazave.com/4dc.pdf
- **Status:** full text read. Sections read: abstract, §1, §2 (designations), §3.2–3.3, §4 opening and §6.3 (completion criteria).
- **Key concepts:**
  1. All requirements-engineering terminology should be grounded in the environment. Primitive terms need written **designations**, which are informal but precise explanations of their real-world meaning. The paper's example is that "student" can make an assertion either vacuous or a strong constraint.
  2. Do not describe the machine. Describe the environment in two **moods**:
     - **indicative:** as it is, without or despite the machine. This is domain knowledge or assumptions.
     - **optative:** as we wish it to be. These are requirements.
  3. Every action is *environment-controlled* or *machine-controlled*, and *shared* or *unshared*. The specification may only use shared phenomena.
  4. The main role of domain knowledge is to support refining requirements into specifications.
  5. **Completion criteria:**
     - R is validated with the customer.
     - K (domain knowledge) is validated as true.
     - S uses only shared phenomena.
     - There is a proof of **S, K ⊢ R**.
     - S and K are shown to be consistent.
- **Note on notation:** The paper writes S, K ⊢ R, with K for domain knowledge. The "W, S ⊢ R" form named in the brief is the later reference-model notation (Gunter, Gunter, Jackson, Zave, *IEEE Software* 2000). That paper appeared in search but I did not read it.
- **Principles for PEE:**
  - **Designations.** Every need and property term ("quiet", "bar-like espresso", "built-in") needs a written real-world meaning. This is the vocabulary layer, and it is what stops the merging of different things on similar names.
  - **Indicative vs optative is the core split for shopper utterances:**
    - "I'm a light sleeper" is indicative, a fact about the shopper.
    - "I want espresso like an Italian bar" is optative.
    - "I can't modify my cabinets" is indicative, a fact about the home that constrains the solution.
  - **Shared phenomena.** The adviser can only verify what is observable at the interface: published measurements, dimensions and declared features. Needs must be refined down to those.
- **Limits:**
  - Aimed at machine specification.
  - The proof obligation is idealised and monotonic. CORE (4.2) criticises exactly this.
- **Failure modes:**
  - Implementation bias.
  - Undesignated terms whose meaning shifts between speakers.
  - Indicative and optative statements mixed in one module.

### 4.2 Jureta, Mylopoulos & Faulkner (2008): Revisiting the core ontology and problem in requirements engineering (CORE)

- **Citation:** I. J. Jureta, J. Mylopoulos, S. Faulkner. "Revisiting the Core Ontology and Problem in Requirements Engineering." *Proc. RE'08*, Barcelona, 2008, pp. 71–80 (best paper award).
- **DOI:** 10.1109/RE.2008.13 (confirmed on Crossref). Preprint: arXiv:0811.4364, stated as "essentially the same" as the IEEE version.
- **Status:** full text read. Sections read: §1–4 (beginning).
- **Key concepts:**
  - Stakeholder *utterances* are speech acts. The engineer must separate content from illocutionary force:
    - beliefs become **domain assumptions**;
    - desires become **goals, quality constraints and softgoals**;
    - intentions become **plans**;
    - expressives become **attitudes** (evaluations).
  - Zave & Jackson's ontology is incomplete. It misses attitudes, it cannot express partial fulfilment, it cannot say that one specification is better than another, and it "makes all requirements compulsory".
  - **Three kinds of desire:**
    - A *quality constraint* constrains a quality whose quality space is "well-defined and shared".
    - A *goal* does not constrain qualities.
    - A *softgoal* refers to a quality whose space is subjective or ill-defined.

    Quality constraints and goals are verifiable; softgoals are only "satisficed".
  - **Justified approximation**, jApprox(softgoal, quality constraint), requires a justification *and* sufficient correlation between the two quality spaces. It is valid only locally and on current information, and "new information may lead the engineer to revise" it. It reinterprets contribution links, whose semantics "remain vague".
  - **Attitudes have two roles:**
    - *optionality:* each element is compulsory or optional;
    - *preference:* an order among elements of the same type. Preferences over preferences resolve conflicts.
  - **The requirements problem is restated with non-monotonic (defeasible) consequence.** Find plans P such that K, P |~ G, Q, where Q holds quality constraints that justifiably approximate every softgoal. Then choose the most desirable P under optionality and preference.
- **Principles for PEE (central for this project):**
  1. **Shopper statements are classified by speech-act force.**
     - "I'm a light sleeper" is an assertive, so it is a belief, a domain assumption about the user.
     - "I want…" is a directive, a desire.
     - "I'd rather X than Y" is an attitude, a preference.
     - "I'll descale it weekly" is a commissive, a plan or commitment.
  2. **Softgoal to measurable property is a *justified approximation*, not a definition.** The approximation must carry its justification (source, correlation evidence). It is defeasible and can be revised when new information arrives. This matches the owner's rule that inferred needs are hypotheses.
  3. **Optional vs compulsory is explicit and comes from the shopper's attitude.** An inferred need is optional by default. An explicit "can't" constraint can be compulsory.
  4. **Defeasible consequence.** A recommendation's justification can be undone by new facts.
- **Limits:**
  - Conceptual. No algorithms or evaluation in this paper.
  - Classification is done by an engineer.
  - The paper explicitly leaves preference-order properties (such as transitivity) out of scope.
- **Failure modes:**
  - Silently making all needs compulsory.
  - Treating an approximation (screens as a proxy for convenience; dB(A) as a proxy for "not woken") as if it were the need itself.
  - Approximations that stakeholders would not accept.

### 4.3 Jureta, Borgida, Ernst & Mylopoulos (2010): Techne

- **Citation:** I. J. Jureta, A. Borgida, N. A. Ernst, J. Mylopoulos. "Techne: Towards a New Generation of Requirements Modeling Languages with Goals, Preferences, and Inconsistency Handling." *Proc. RE 2010*, Sydney, pp. 115–124.
- **DOI:** 10.1109/RE.2010.24 (confirmed on Crossref). Long version: University of Toronto CSRG technical report 606, https://ftp.cs.toronto.edu/csrg-technical-reports/606/techne-re10-v1_5-long.pdf
- **Status:** full text read, of the long technical-report version. Sections read: abstract, introduction and the overview of concepts, relations and reasoning. The first page of the tech-report PDF shows only Jureta and Borgida in the extracted header; the RE'10 paper's four authors are confirmed by Crossref and repository records.
- **Key concepts:**
  - Techne is based on CORE.
  - **Node kinds:** domain assumptions, goals, quality constraints, softgoals and tasks.
  - **Five relations:**
    - *inference*: modus ponens from more precise to less precise requirements, which generalises refinement and decomposition across kinds;
    - *conflict*: over a minimally inconsistent set;
    - *preference*;
    - *is-mandatory*;
    - *is-optional*: a system that satisfies the requirement is strictly preferred, all else equal.
  - Uses propositional Horn logic. Semantics are **paraconsistent** (a model can be inconsistent and still be reasoned with) and **non-monotonic**.
  - **Solution concepts:**
    - a *candidate solution* is any consistent part of the network;
    - it is *admissible* if it contains all mandatory requirements;
    - it is a *solution* if it also covers some optional or preferred requirements.

    Solutions are compared with a table of which optional and preferred items each one satisfies.
- **Principles for PEE:**
  - The adviser's requirement network will be inconsistent (conflicting needs, conflicting evidence). Reason over its *consistent subsets* instead of failing.
  - Each consistent subset of needs is a candidate. Admissibility uses only the mandatory (explicit, hard) needs. Ranking uses optional and preferred needs.
  - The comparison table is a transparent explanation format.
- **Limits:**
  - No visual syntax.
  - Analyst-built.
  - Propositional only: there are no numeric quality spaces in the reasoning core.
- **Failure mode:** Requiring global consistency before giving any answer.

---

## 5. Context

### 5.1 Ali, Dalpiaz & Giorgini (2010): A goal-based framework for contextual requirements modeling and analysis

- **Citation:** R. Ali, F. Dalpiaz, P. Giorgini. "A goal-based framework for contextual requirements modeling and analysis." *Requirements Engineering* 15(4): 439–458, 2010. Received 18 Feb 2010, accepted 5 July 2010, published online 27 July 2010.
- **DOI:** 10.1007/s00766-010-0110-z. Confirmed on Crossref and on the PDF header.
- **Open copy:** https://iris.unitn.it/retrieve/56988e3d-bda9-47db-9da3-45aaafdcba1c/s00766-010-0110-z.pdf
- **Status:** full text read. Sections read: abstract, introduction, §3.3–3.4 (variation points, context analysis); the analyst-effort remarks were found by search within the text.
- **Key concepts:**
  - Context can change *which goals a stakeholder has* and *which ways of achieving them are acceptable*. Example: "tourist is vegetarian" changes how "find a restaurant" may be satisfied.
  - **Contextual goal model.** Contexts are attached as preconditions at variation points:
    1. OR-decomposition alternatives;
    2. root goals (whether the goal is active);
    3. means-end (task adoptability);
    4. actor dependencies;
    5. AND-decomposition (whether a subgoal is needed);
    6. contributions to softgoals, whose sign or strength may depend on context.
  - **Context analysis** writes contexts as AND/OR formulas of *world predicates*:
    - a **fact** is a world predicate the actor can verify;
    - a **statement** is one it cannot verify, for lack of information or because it is abstract by nature. "Visitor is interested in a piece of art" is the paper's example.
  - **Support.** A formula of facts supports a statement if it "gives enough evidence" for it. A statement is **monitorable** if some formula of facts supports it, and only monitorable contexts are allowed. Some statements cannot be reduced to facts.
  - Reasoning chooses the variant valid in the current context, and also finds a minimum-cost design valid in all contexts. The authors acknowledge that the reasoning "may require an intensive intervention of the analyst".
- **Principles for PEE (directly applicable):**
  1. **Shopper situation is context, not a requirement.** "Open-plan flat", "dishwasher runs overnight" and "rented kitchen" activate or deactivate needs. They also change contribution strengths: noise matters more if the machine runs at night near the bedroom.
  2. **Fact vs statement.**
     - "Cabinet opening is 45 cm wide" is a *fact*: the shopper can measure it.
     - "I'm a light sleeper" is a *statement*: the adviser cannot verify it. It can be *supported* by facts (bedroom adjacent to the kitchen, night operation), never proven.
     - Inferred needs that rest on statements stay hypotheses.
  3. **Unmonitorable statements must not become hard filters.** This matches the owner rule.
- **Limits:**
  - Designed for runtime adaptive systems (museum guide).
  - An analyst builds the contexts and the support relations.
  - "Enough evidence" for support is left to judgement.
- **Failure mode:** Assuming a uniform context, which leads to requirements valid in only some situations.

---

## 6. Standards view: needs vs requirements

### 6.1 ISO/IEC/IEEE 29148:2018

- **Citation:** *ISO/IEC/IEEE 29148:2018, Systems and software engineering — Life cycle processes — Requirements engineering.* 2nd edition, 2018.
- **DOI:** 10.1109/IEEESTD.2018.8559686 (IEEE record, confirmed on Crossref; no page data).
- **Status:** secondary source only. The standard is paywalled, and the VDE preview PDF returned HTTP 503. Secondary sources used:
  - (a) SEBoK, "Stakeholder Needs Definition" (https://sebokwiki.org/wiki/Stakeholder_Needs_Definition), full page read;
  - (b) J. S. Wheaton, D. R. Herber, "Digital requirements engineering with an INCOSE-derived SysML meta-model," arXiv:2401.16330 (2024), Table 1 read;
  - (c) a search-indexed summary of the SEBoK glossary that cites 29148 §5.2.3;
  - (d) a GitHub-wiki summary of 29148 §5.2.4. This is a low-reliability source.
- **Key concepts (as reported by the secondary sources):**
  - **The chain:** business or mission analysis → stakeholder *needs* → stakeholder *requirements* → system requirements, with traceability throughout.
  - The SEBoK glossary, citing 29148 §5.2.3, says stakeholder requirements are derived from needs and restated as more structured, formal statements.
  - The SEBoK page frames needs as the stakeholders' perspective and system requirements as a developer perspective. It says needs statements "do not include the word 'shall'", recommending the form "The stakeholders need the system to…". This framing is attributed to INCOSE GtWR 2023, not to 29148.
  - **Characteristics of individual needs and requirements**, as tabulated from the INCOSE Guide to Writing Requirements (GtWR, 2023) by Wheaton & Herber:
    - C1 Necessary
    - C2 Appropriate
    - C3 Unambiguous
    - C4 Complete
    - C5 Singular
    - C6 Feasible
    - C7 Verifiable
    - C8 Correct
    - C9 Conforming
  - **Characteristics of sets:**
    - C10 Complete
    - C11 Consistent
    - C12 Feasible
    - C13 Comprehensible
    - C14 Able to be validated
    - C15 Correct
  - A vendor overview says 29148 Clause 5 defines 9 characteristics for an individual requirement and 5 for a set. The INCOSE table has 6 set characteristics, so the exact 29148 list **could not be verified** without the standard.
- **Principles for PEE:**
  - Keep three layers distinct:
    1. the shopper's *need* (in their words, no "shall");
    2. the adviser's *stakeholder requirement* (structured, attributable to the need);
    3. the *product requirement* (a verifiable property with a test condition).
  - Every product-level requirement must be **verifiable** (a measurable property under a stated method) and **singular** (one property per requirement).
  - Each one must trace back to a need. That trace is the "typed, justified, attributable link".
- **Limits:**
  - Contractual systems-engineering setting.
  - Assumes negotiated, validated requirements.
  - The normative wording was not checked.
- **Failure modes:** Ambiguous, compound or unverifiable requirements. (The standard names these characteristics; I did not read its failure discussion.)

---

## 7. Tacit and latent needs, and ambiguity

### 7.1 Sutcliffe & Sawyer (2013): Requirements elicitation: towards the unknown unknowns

- **Citation:** A. Sutcliffe, P. Sawyer. "Requirements elicitation: Towards the unknown unknowns." *Proc. RE'13*, 21st IEEE Int. Requirements Engineering Conf., Rio de Janeiro, 2013, pp. 92–104.
- **DOI:** 10.1109/RE.2013.6636709 (confirmed on Crossref). Record: https://eprints.lancs.ac.uk/id/eprint/66712
- **Status:** abstract read, from the Lancaster EPrints page.
- **Key concepts:**
  - The paper reviews elicitation research with a framework of how "known" requirements are, and with Common Ground discourse theory.
  - It finds elicitation techniques "relatively mature".
  - It finds growth in natural-language tools (text mining, information retrieval) for categorising and disambiguating requirements.
  - Its road map contrasts *green-field* domains with *brown-field* domains, where collections of requirements and products already exist.
  - It closes on whether "unknown unknown" requirements can be elicited at all.
  - The exact quadrant definitions of the knowness framework were **not verified**, because I read only the abstract.
- **Principles for PEE:**
  - Appliances are a *brown-field* domain: existing product collections and existing requirement catalogues can prompt needs the shopper never states. Examples: descaling burden, cycle length, door-opening clearance.
  - The adviser should propose such latent needs as *questions or hypotheses*, not assume them.
- **Limits:** Survey and road map; abstract only.
- **Failure mode:** Needs the shopper does not know they have.

### 7.2 Gervasi, Gacitua, Rouncefield, Sawyer, Kof, Ma, Piwek, De Roeck, Willis, Yang & Nuseibeh (2013): Unpacking tacit knowledge for requirements engineering

- **Citation:** V. Gervasi et al. "Unpacking Tacit Knowledge for Requirements Engineering." In W. Maalej, A. K. Thurimella (eds.), *Managing Requirements Knowledge*, Springer, 2013, pp. 23–47. The author order varies slightly between listings.
- **DOI:** 10.1007/978-3-642-34419-0_2 (confirmed on Crossref).
- **Status:** abstract read, from Lancaster EPrints 66714.
- **Key concepts:**
  - Tacit knowledge gives "economy of expression", but only when it is held in common. Otherwise confusion and misunderstanding follow.
  - The chapter reviews the views of tacit knowledge across disciplines and proposes a conceptual framework of its facets.
  - At worst, tacit requirements knowledge leads to software that fails the customer's requirements.
- **Principle for PEE:** Shopper phrases rely on unshared background. "Like an Italian bar" presupposes a reference experience (short, intense, crema). The adviser's designation of the phrase is an *interpretation* that should be shown to the shopper and be correctable.
- **Limits:** Abstract only; conceptual.
- **Failure mode:** Misunderstanding caused by assumed common ground.

### 7.3 Sawyer, Gervasi & Nuseibeh (2011): Unknown knowns: tacit knowledge in requirements engineering

- **Citation:** P. Sawyer, V. Gervasi, B. Nuseibeh. "Unknown knowns: Tacit knowledge in requirements engineering." *Proc. RE'11*, 19th IEEE Int. Requirements Engineering Conf., 2011, p. 329 (panel).
- **DOI:** 10.1109/RE.2011.6051683 (confirmed on Crossref).
- **Status:** abstract read, from Lancaster EPrints 57600.
- **Key concepts:** An "unknown known" is knowledge a customer holds but withholds from the analyst. They may withhold it:
  - deliberately;
  - accidentally, not realising its value;
  - because they cannot articulate it;
  - because they do not realise they hold it.
- **Principle for PEE:** A missing constraint is not evidence that there is no constraint. An example is the shopper never mentioning the cabinet height. Absence of a statement must not be read as "no requirement".
- **Limits:** Panel abstract only.
- **Failure mode:** Treating silence as consent.

### 7.4 Gervasi & Zowghi (2010): On the role of ambiguity in RE

- **Citation:** V. Gervasi, D. Zowghi. "On the Role of Ambiguity in RE." *REFSQ 2010*, LNCS 6182, Springer, pp. 248–254.
- **DOI:** 10.1007/978-3-642-14192-8_22 (confirmed on Crossref).
- **Status:** secondary source only (abstract summarised by search; the UTS copy is closed).
- **Key concepts:**
  - Treating ambiguity only as a defect "to be avoided at all costs" misses the phenomenon.
  - The paper proposes a finer classification of ambiguity types, with different causes and effects.
- **Principle for PEE:** Ambiguity in a shopper statement can be useful: it signals where to ask. It should be classified and retained, not silently resolved.
- **Limits:** Short paper; not read.
- **Failure mode:** Premature disambiguation.

---

## 8. Uncertainty, partial satisfaction, preferences

### 8.1 Whittle, Sawyer, Bencomo, Cheng & Bruel (2009): RELAX

- **Citation:** J. Whittle, P. Sawyer, N. Bencomo, B. H. C. Cheng, J.-M. Bruel. "RELAX: Incorporating Uncertainty into the Specification of Self-Adaptive Systems." *Proc. RE'09*, Atlanta, 2009, pp. 79–88.
- **DOI:** 10.1109/RE.2009.36 (confirmed on Crossref). Open copy: https://publications.aston.ac.uk/id/eprint/19658/1/RELAX_incorporating_uncertainty.pdf
- **Status:** full text read. Sections read: §1–2 and the process section.
- **Key concepts:**
  - Requirements are SHALL statements. RELAX marks some as **invariants**, which must never be relaxed, and lets others be relaxed under environmental uncertainty.
  - **Operators:**
    - modal: SHALL; MAY…OR;
    - temporal: EVENTUALLY, UNTIL, BEFORE/AFTER, IN, AS EARLY/LATE AS POSSIBLE, AS CLOSE AS POSSIBLE TO [frequency];
    - ordinal: AS CLOSE AS POSSIBLE TO [quantity], AS MANY/FEW AS POSSIBLE.
  - **Uncertainty factors:**
    - ENV: environment properties;
    - MON: what can be monitored;
    - REL: how MON relates to ENV;
    - DEP: dependencies between relaxed and invariant requirements.
  - **Process.** For each requirement and each condition that threatens it, ask:
    1. Is it essential? If so, it is an invariant.
    2. Can it be made more flexible?
  - Semantics are temporal fuzzy logic.
- **Principles for PEE:**
  - Separate **invariant needs** (the explicit hard constraint "must fit without modifying cabinets") from **relaxable needs** ("as quiet as possible").
  - Use the AS-…-AS-POSSIBLE vocabulary for preference-shaped quality needs.
  - The ENV/MON/REL triple is a good template for a need's verifiability:
    - ENV: what we care about (sleep disturbance);
    - MON: what is published (dB(A) under a test method);
    - REL: the assumed relation between them, which is a justified approximation as in 4.2.
- **Limits:**
  - Built for self-adaptive runtime systems.
  - The analyst decides what is invariant.
  - Fuzzy membership functions must be chosen.
- **Failure modes:**
  - Rigid SHALL statements that cannot all be met in changing conditions.
  - Self-adaptivity built ad hoc.

### 8.2 Whittle et al. (2010): RELAX journal version

- **Citation:** J. Whittle, P. Sawyer, N. Bencomo, B. H. C. Cheng, J.-M. Bruel. "RELAX: a language to address uncertainty in self-adaptive systems requirement." *Requirements Engineering* 15(2): 177–196, 2010.
- **DOI:** 10.1007/s00766-010-0101-0 (confirmed on Crossref).
- **Status:** secondary source only.
- **Key concept:** The extended version adds formal fuzzy-logic semantics, with smart-home and assisted-living examples (per repository summaries).
- **Principle, limits and failure modes:** As for 8.1.

### 8.3 Baresi, Pasquale & Spoletini (2010): FLAGS (fuzzy goals for requirements-driven adaptation)

- **Citation:** L. Baresi, L. Pasquale, P. Spoletini. "Fuzzy Goals for Requirements-Driven Adaptation." *Proc. RE 2010*, Sydney, pp. 125–134.
- **DOI:** 10.1109/RE.2010.25 (confirmed by a Crossref title query).
- **Status:** secondary source only. Sources: university news pages and the RE 2020 Most Influential Paper award notice; the abstract was not available through Crossref or Semantic Scholar.
- **Key concepts:**
  - FLAGS extends KAOS with *adaptive goals* that embed countermeasures.
  - It distinguishes **crisp goals** (Boolean satisfaction) from **fuzzy goals**, whose satisfaction is graded through fuzzy constraints.
  - It treats requirements as runtime entities.
- **Principle for PEE:** Mark each need as crisp (fits or doesn't fit) or graded (how quiet), and score them differently. A graded need yields a degree, not a filter.
- **Limits:** Not read; built for runtime adaptation.
- **Failure mode:** Not verified.

### 8.4 Liaskos, McIlraith, Sohrabi & Mylopoulos (2010): Integrating preferences into goal models

- **Citation:** S. Liaskos, S. A. McIlraith, S. Sohrabi, J. Mylopoulos. "Integrating Preferences into Goal Models for Requirements Engineering." *Proc. RE 2010*, Sydney, pp. 135–144.
- **DOI:** 10.1109/RE.2010.26 (confirmed by a Crossref title query). Open copy: https://www.cs.toronto.edu/~sheila/publications/lia-etal-re10.pdf
- **Status:** full text read. Sections read: abstract, introduction and the section on optional goals; weights searched in the text.
- **Key concepts:**
  - Classic goal models treat all goals as mandatory, so they "cannot accommodate optional ('nice-to-have') requirements".
  - **Mandatory goals** define what counts as a solution. **Optional goals** are criteria for choosing among solutions. Optional goals are connected to the mandatory structure through contribution links, not decomposition.
  - Optional goals get importance **weights in [0, 1]**, elicited for instance with AHP. The weights define a preference function.
  - A preference-based planner searches for the plan that best satisfies the weighted optional goals while fulfilling the mandatory ones.
- **Principles for PEE:**
  - **Explicit constraints are mandatory and inferred needs are optional.** "Dishwasher that fits without cabinet work" is mandatory. "Quiet because the shopper is a light sleeper" is optional (preference), and ranks candidates rather than filtering them. This is exactly the owner's "hypotheses, never hard exclusions" rule, expressed in GORE terms.
  - The weights must come from somewhere. The paper assumes they are elicited from stakeholders. An adviser must either ask, or default and disclose.
- **Limits:**
  - Planning-based, so it needs a formal domain.
  - Weights are elicited by an analyst or stakeholders.
  - Weights assume independent, additive preferences.
- **Failure mode:** Collapsing nice-to-haves into mandatory requirements, which over-constrains the solution space.

### 8.5 Liaskos, McIlraith, Sohrabi & Mylopoulos (2011): Representing and reasoning about preferences in requirements engineering

- **Citation:** S. Liaskos, S. A. McIlraith, S. Sohrabi, J. Mylopoulos. "Representing and reasoning about preferences in requirements engineering." *Requirements Engineering*, pp. 227–249, 2011. Volume and issue were not verified.
- **DOI:** 10.1007/s00766-011-0129-9. Crossref confirms the title, journal, year (online 12 Aug 2011) and pages.
- **Status:** secondary source only. The journal abstract was available only as a search summary: preference goals are distinguished from mandatory ones.
- **Key concept:** It is the journal extension of 8.4. I made no further claims.

### 8.6 Horkoff et al. (2019): GORE extended systematic mapping study

- **Citation:** J. Horkoff, F. B. Aydemir, E. Cardoso, T. Li, A. Maté, E. Paja, M. Salnitri, L. Piras, J. Mylopoulos, P. Giorgini. "Goal-oriented requirements engineering: an extended systematic mapping study." *Requirements Engineering* 24(2): 133–160, 2019 (online 2017).
- **DOI:** 10.1007/s00766-017-0280-z (confirmed on Crossref).
- **Status:** abstract read, via the Semantic Scholar API.
- **Key concepts:**
  - The study maps 246 top-cited GORE papers.
  - It finds "a proliferation of papers with new ideas and few citations", and a small number of dominant authors and papers.
  - There is a rising trend of work on adaptation, variability and evolution, and a slight rise in case studies.
- **Principle for PEE:** The GORE literature is broad but thinly consolidated. Borrow its *concepts* (the stable core: goals, softgoals, contributions, obstacles, context, preferences) rather than any one tool or notation.
- **Limits:** Abstract only.
- **Failure mode:** Proliferation without consolidation.

---

## Synthesis

### S1. A taxonomy of need-statement kinds, mapped to the shopper examples

Each kind below is followed by the sources it is grounded in.

| Kind | Definition (from the sources) | Verifiable? | Default force in PEE | Example |
|---|---|---|---|---|
| **Goal** (hard goal) | An optative state of affairs with clear-cut achievement criteria. Sources: iStar 2.0; CORE Def. 3; KAOS. | Yes | Mandatory only if stated explicitly; otherwise optional | "Make espresso drinks at home"; "Have a dishwasher in this kitchen" |
| **Quality / softgoal** | A desired level of an attribute. It is a softgoal when the quality space is subjective or ill-defined: satisficed, not satisfied. Sources: iStar 2.0 Quality; CORE softgoal; NFR. | Only through an approximation | Optional and preference-ranked | "Espresso like an Italian bar"; "Quiet" (derived from "light sleeper") |
| **Quality constraint** | Constrains a quality with a well-defined, *shared* quality space, for example a measured value under a test method. Sources: CORE Def. 2; Letier & van Lamsweerde 2004 (quality variable plus objective function with target); 29148 "verifiable". | Yes | Derived, defeasible (justified approximation of a softgoal) | "Noise ≤ T dB(A) on programme P under standard S"; "Brew temperature stability within the published test protocol" |
| **Domain assumption / fact** | An indicative statement about the world, true regardless of the product. Sources: Zave & Jackson's indicative mood; CORE belief; KAOS domain property. Ali et al. split it into **fact** (verifiable by the actor) and **statement** (not verifiable; at most *supported* by facts). | Facts yes; statements no | A context fact can make a need mandatory. A statement only supports hypotheses. | "I can't modify my kitchen cabinets": a fact about the home that bounds the solution. "I'm a light sleeper": a statement about the user. |
| **Assumption about an agent's behaviour** (KAOS expectation) | A goal assigned to an environment agent (the shopper or a household member). It cannot be enforced by the product. Source: KAOS (1.2). | Not by the adviser | Show as an assumption the recommendation relies on | "I'll grind fresh beans and tamp"; "I'll descale monthly" |
| **Context** | Conditions that activate or deactivate goals, select alternatives, or change contribution strengths. Source: Ali et al. variation points. | When it is built from facts | A modifier of other needs, not a need itself | "Dishwasher runs overnight"; "Open-plan flat"; "Rented home" |
| **Task / plan (means)** | A prescribed way to achieve a goal (iStar Task; CORE Plan, from intentions and commissives). A *task dependency* fixes the means. | Yes (feature present) | Mandatory only if the shopper insists on that means | "I want a manual lever machine"; "It must have a night programme" |
| **Resource** | A physical or informational entity needed by a task (iStar Resource; NeededBy). | Yes | Prerequisite check | Grinder, water connection, mains socket near the cabinet, cabinet cut-out |
| **Obstacle** | A condition that, together with domain knowledge, entails that a goal is not achieved, and that is consistent with the domain (van Lamsweerde & Letier). | Yes, when formulated over evidence | Generates contraindications and counter-evidence | "End-of-cycle beep not disableable" obstructs "not woken"; "Machine needs barista skill" obstructs "bar-like espresso at home"; "Unit taller than counter height" obstructs "fits without modification" |
| **Attitude: optionality** | A compulsory or optional status from the shopper's evaluation (CORE; Techne is-mandatory and is-optional; Liaskos mandatory vs optional). | n/a | Explicit "must", "can't" or "need" makes it compulsory; inferred needs are optional | "Can't modify" → compulsory; "light sleeper" → optional preference |
| **Attitude: preference** | An order among same-kind elements, including preferences over preferences for conflicts (CORE; Techne; Liaskos weights). | n/a | Ranking only | "Taste matters more than speed"; "I'd rather pay more for quieter" |
| **Invariant vs relaxable** | RELAX: invariants are never relaxed; others hold AS … AS POSSIBLE. FLAGS: crisp vs fuzzy goals. | n/a | Invariants act as filters; relaxable needs act as degrees | "Must fit" is an invariant; "As quiet as possible" is relaxable |

**Worked mapping of the three examples:**

1. **"I'm a light sleeper"**
   - It is an assertive, so a *belief* (CORE) and an *unverifiable statement* (Ali).
   - It supports a hypothesised *softgoal*, "not disturbed by appliance at night", that *qualifies* the product's operation (iStar Qualification).
   - It is activated more strongly by *context facts* (night operation; bedroom adjacent).
   - It is approximated by *quality constraints* with explicit justification (CORE jApprox): published noise under a named method, alert-tone configurability, low-noise night programme.
   - *Obstacles* (non-disableable beeps, tonal compressor noise) produce counter-evidence.
   - Its status is **optional or preference**, never a hard exclusion (Liaskos; Techne).
2. **"I want espresso like an Italian bar"**
   - It is a directive with a *softgoal* core (taste quality, subjective space) and an implied *goal* ("espresso-based drinks").
   - The phrase is tacit, so a *designation* is needed (Zave & Jackson; Gervasi et al.), and it is shown to the shopper.
   - HOW-refinement leads to OR-alternatives (iStar refinement): manual pump machine plus grinder, or super-automatic machine.
   - Each alternative carries *contributions* to the softgoal and to other qualities (convenience, cost), and *resource* needs (grinder).
   - An *agent assumption* applies: the shopper has the skill and time. Its *obstacle* (no skill or time) is resolved by **agent substitution**, that is, automation.
3. **"I can't modify my kitchen cabinets to install a dishwasher"**
   - It is an explicit *domain fact or constraint* (indicative) about the home, plus a compulsory attitude.
   - It acts as an **invariant** (RELAX) and a mandatory requirement (Liaskos; Techne admissibility).
   - Its verifiable refinement is through *facts* the shopper can measure (available width, depth and height; water and drain access) and product dimensions or installation type. These are shared phenomena (Zave & Jackson).
   - It also produces *obstacles* against built-in or integrated units.
   - Divergence with "large capacity" holds only under a *boundary condition* (narrow space; van Lamsweerde et al. 1998). Report that condition, not a blanket conflict.

### S2. Relation types used in the literature and their semantics

| Relation | Source | Semantics | Use in PEE |
|---|---|---|---|
| **AND-refinement** | KAOS; iStar 2.0; NFR | All children fulfilled → parent fulfilled. In KAOS, refinement can be proved complete given domain properties. | Need → sub-needs that are all required |
| **OR-refinement / means-end** | iStar 2.0 (inclusive OR); Yu means-ends | At least one child fulfils the parent. A task child is a *means* to the goal *end*. | Alternative product types or approaches |
| **Contribution: make / help / hurt / break** | iStar 2.0 | Sufficient or weak evidence, for or against a *quality* | Product evidence → softgoal, graded by evidence strength |
| **++ / + / − / −−, with separate Sat and Den labels (full or partial)** | Giorgini et al. 2002 | Lateral evidence relations. Satisfaction and denial evidence propagate separately. Weak and strong conflicts are definable. | Keep for and against evidence separate; detect conflicting sources |
| **Qualification** | iStar 2.0 | A quality qualifies how a goal, task or resource should be achieved | "Quiet" qualifies "wash dishes" |
| **NeededBy** | iStar 2.0 | A task needs a resource | Prerequisites (grinder, plumbing) |
| **Dependency (depender → dependum → dependee)** | Yu 1997; iStar 2.0 | Delegation, with freedom set by the dependum's type (goal, task, resource, quality) | Shopper → product; adviser → evidence publisher (vulnerability) |
| **Responsibility / assignment** | KAOS (1.2) | Assigned to the system agent: a requirement. Assigned to an environment agent: an assumption. | Product property vs shopper behaviour |
| **Operationalisation** | KAOS (1.3 abstract: goals operationalised into specifications of services and constraints) | Leaf goals become specified operations or constraints | Need → verifiable product property |
| **Obstruction** | van Lamsweerde & Letier 2000 | {O, Dom} ⊨ ¬G, with O consistent with Dom; domain-completeness of obstacle sets | Contraindication links |
| **Resolution (of an obstacle)** | van Lamsweerde & Letier 2000 | Prevention, goal substitution, agent substitution, deidealization, mitigation, restoration, tolerance | Adviser moves: alternative type, weaker target, usage tip |
| **Divergence / conflict** | van Lamsweerde et al. 1998 (via 1.2); Techne conflict over minimally inconsistent sets; CORE conflicting preferences | Goals are inconsistent only under a boundary condition, or a set is minimally inconsistent | Record conditional trade-offs |
| **Justified approximation (jApprox)** | Jureta et al. 2008 | A quality constraint approximates a softgoal, with justification and sufficient correlation; local and revisable | The typed link from a subjective need to a measurable property, with its rationale |
| **Inference** | Techne | Modus ponens from more precise to less precise requirements, across kinds | A general refinement edge |
| **Preference / is-optional / is-mandatory** | CORE; Techne; Liaskos | An order among alternatives; compulsory vs optional | Ranking vs filtering |
| **Support (fact formula → statement)** | Ali et al. 2010 | Facts give "enough evidence" for an unverifiable statement; transitive; some statements cannot be supported | Linking shopper facts to hypothesised user traits |
| **Contextual precondition at a variation point** | Ali et al. 2010 | Context enables a root goal, an alternative, a subgoal, a dependency or a contribution | Context-conditioned needs and weights |
| **ENV / MON / REL / DEP** | RELAX 2009 | What matters, what is observable, how they relate, and which requirements depend on which | The template for verifiability links |
| **Entailment / completion (S, K ⊢ R; R, As, D ⊨ G)** | Zave & Jackson; KAOS | The specification plus domain knowledge entails the requirements | The justification obligation of a recommendation, made defeasible per CORE |

### S3. What GORE does NOT solve for an automated adviser

1. **An analyst is in the loop throughout.** Every framework assumes a human engineer who:
   - classifies utterances (CORE; Techne);
   - builds the refinement graph (KAOS; iStar);
   - sets contribution labels and initial evidence (NFR; Giorgini);
   - elicits weights (Liaskos, through AHP);
   - defines contexts and support relations (Ali et al. note intensive analyst intervention);
   - decides what is invariant (RELAX).

   PEE must replace these judgements with *reusable domain knowledge* (catalogues per category) plus explicit questions to the shopper, and must label each one as such.
2. **There is no natural-language front end.** GORE starts from elicited, already-interpreted statements. Mapping "light sleeper" to a softgoal is exactly the step GORE leaves to the analyst. CORE gives the target categories (speech-act force), not the classifier. Ambiguity and tacit knowledge (Gervasi et al.; Sawyer et al.) are named as problems, not solved.
3. **GORE designs systems; it does not select products.** The frameworks optimise a *system-to-be* whose structure is chosen. PEE chooses among *existing* products whose properties are known only through third-party evidence of varying reliability. GORE has no notion of evidence provenance, independence, manufacturer-vs-test status or attribution. The closest is Giorgini et al.'s independence *assumption*, which PEE must *check*, not assume.
4. **Contribution and approximation semantics are weak.**
   - Contribution links are "vague" (Jureta et al.).
   - Different propagation procedures give different answers (Horkoff & Yu: use only as heuristics).
   - CORE's justified approximation says a softgoal-to-property link needs justification and correlation evidence, but it does not provide the correlation. For appliances, that evidence (for example, how a dB(A) figure relates to perceived sleep disturbance) must come from category research, and it stays defeasible.
5. **Measurement and test conditions are mostly absent.** Only Letier & van Lamsweerde 2004 (quality variables with sample spaces, objective functions with targets) and RELAX's MON/REL come close. Comparability of measurements across test methods is outside GORE.
6. **Single-shot, low-patience stakeholders.** GORE assumes iterative negotiation (WinWin-style, as cited in 1.2) and validation of R with the customer (Zave & Jackson's completion criterion 1). A shopper may answer one or two questions, so validation of inferred needs must be lightweight and optional.
7. **Monotonic logic vs hypotheses.** Classic KAOS and Zave & Jackson are monotonic. Only CORE (defeasible consequence) and Techne (non-monotonic, paraconsistent) accommodate revisable hypotheses and inconsistent models. Even they give no procedure for *retracting* an inferred need when the shopper's later statements contradict it.
8. **Completeness is relative.** Obstacle completeness and requirements completeness hold only "relative to what is known about the domain" (van Lamsweerde & Letier). Unknown unknowns (Sutcliffe & Sawyer) and withheld knowledge (Sawyer et al.) are unsolved. The adviser's claims of "no contraindication found" must be scoped to its knowledge.
9. **Preference elicitation burden.** Weights (Liaskos) and preference orders (CORE; Techne) must be obtained. The literature does not say how to default them safely. PEE needs disclosed defaults and sensitivity checks.
10. **Little evaluation on real users.** The mapping study (Horkoff et al.) reports a proliferation of proposals and few consolidated or evaluated ones. Treat GORE as a *conceptual vocabulary and set of relation semantics* (maturity: proposed), not as a validated inference method for PEE.

### Counts

31 sources in total:

| Status | Count | Entries |
|---|---|---|
| full text read | 14 | 1.2, 1.3, 1.6, 2.1, 2.2, 3.3a, 4.1, 4.2, 4.3, 5.1, 8.1, 8.4, SEBoK page, Wheaton & Herber 2024 |
| abstract read | 4 | 7.1, 7.2, 7.3, 8.6 |
| secondary source only | 13 | 1.1, 1.4, 1.5, Letier & van Lamsweerde 2025, 3.1, 3.2, 3.3b, 3.4, 6.1 (ISO 29148 itself), 7.4, 8.2, 8.3, 8.5 |
| could not verify | 0 | Specific unverified claims are flagged inline: the exact 29148 characteristic list, the Sutcliffe & Sawyer quadrant definitions, the FLAGS details and the Gunter et al. W notation |
