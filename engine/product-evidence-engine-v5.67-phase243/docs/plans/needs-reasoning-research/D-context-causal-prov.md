# Survey D: context, knowledge-based and conversational recommendation, causal reasoning, knowledge representation and provenance

Prepared 2026-10-20 for the PEE needs-inference study. Work was on the web only; no PEE files were read.

## Method and verification

- **Verification labels:**
  - **full text read:** the relevant sections were read from an open copy.
  - **abstract read:** only the abstract or publisher description was read.
  - **secondary source only:** the content is known only from other works (SEP entries, survey papers, citing papers).
  - **could not verify:** the work's existence was confirmed, but not its content.
- **Bibliographic data:** unless a source's entry says otherwise, DOIs, volumes and pages were checked against the Crossref API (`api.crossref.org/works/<doi>`).
- **Quotes:** all quotes are under 25 words. Everything else is paraphrase.

**Totals:** 38 sources. 19 full text read, 8 abstract read, 10 secondary source only, 1 could not verify.

---

## A. Context

### A1. Dey (2001). Understanding and Using Context
- **Citation:** Dey, A. K. (2001). Understanding and using context. *Personal and Ubiquitous Computing* 5(1), 4–7.
- **DOI:** https://doi.org/10.1007/s007790170019 (checked on Crossref).
- **Status:** secondary source only.
  - The author's PDF on gatech.edu failed: TLS error, then HTTP 503. Academia.edu returned 403.
  - The definition below matches across several secondary sources: Wikipedia "Context awareness", arXiv 1305.0982, and course notes.
- **Key concepts:**
  - Context is any information that characterises the situation of an entity: "any information that can be used to characterize the situation of an entity".
  - An entity is a person, place or object relevant to the user–application interaction, including the user and the application themselves.
  - Four primary context types are named: location, identity, time and activity. Secondary context (for example, an e-mail address) is derived from the primary types.
  - A system is context-aware if it uses context to provide information or services that are relevant to the user's task.
- **Principle for PEE:** Context is information *about the situation*, not the need itself. "Small flat" characterises the user's situation. The need it may activate, such as compactness or low noise, is a separate object.
- **Limits:**
  - The definition is so broad that almost anything counts as context.
  - Critics note that the framework cannot type a given piece of context.
  - It was designed for sensor-driven ubiquitous computing, not for dialogue.
- **Failure mode:** Treating every stated fact as context without a relevance test leads to over-inference. "We have a dog" is relevant to vacuum cleaners and air purifiers, but probably irrelevant to kettles.

### A2. Adomavicius & Tuzhilin (2011). Context-Aware Recommender Systems (handbook chapter)
- **Citation:** Adomavicius, G., & Tuzhilin, A. (2011). Context-aware recommender systems. In Ricci, Rokach, Shapira & Kantor (eds.), *Recommender Systems Handbook*, Springer, pp. 217–253.
- **DOI:** https://doi.org/10.1007/978-0-387-85820-3_7. Crossref gives the online date as 2010-10-05; the print edition is 2011.
- **Status:** secondary source only.
  - Springer redirected to its login page.
  - Content comes from citing papers and from A3 below, the authors' companion article, which was read in full.
- **Key concepts (as reported by secondary sources):**
  - Recommendation becomes a function of User × Item × Context rather than User × Item.
  - Three ways to use context:
    - **contextual pre-filtering:** context selects the data before recommendation;
    - **contextual post-filtering:** recommendations are adjusted after a context-free step;
    - **contextual modelling:** context is part of the model itself.
  - Context can be hierarchical (for example, time → weekday/weekend).
- **Principle for PEE:** Context has an explicit *place* in the reasoning pipeline. For a symbolic adviser, context acts as a pre-filter on which *needs and knowledge relations are activated*, not as a filter on products.
- **Limits:** The chapter is ratings-centric: context is mostly a dimension in collaborative filtering data.
- **Failure mode:** Exact pre-filtering on narrow context leaves too little support. AI Magazine (A3) reports that this is why generalised pre-filtering was introduced. For PEE, the analogue is not discarding knowledge because the context does not match it exactly; generalising up a concept hierarchy is the alternative.

### A3. Adomavicius, Mobasher, Ricci & Tuzhilin (2011). Context-Aware Recommender Systems (AI Magazine)
- **Citation:** Adomavicius, G., Mobasher, B., Ricci, F., & Tuzhilin, A. (2011). Context-aware recommender systems. *AI Magazine* 32(3), 67–80.
- **DOI:** https://doi.org/10.1609/aimag.v32i3.2364 (checked on Crossref).
- **Status:** full text read (open PDF from ojs.aaai.org).
- **Key concepts:**
  - The article contrasts Dourish's *representational* view with his *interactional* view.
    - **Representational:** context is information that is delineable, stable, and separable from the activity.
    - **Interactional:** context is "occasioned rather than static" and is in a cyclical relationship with the activity.
  - It classifies what the system knows about contextual factors as fully observable, partially observable or unobservable.
  - It classifies how contextual factors change over time as static or dynamic. Relevance itself can change: a factor may stop mattering.
  - It names three paradigms: contextual pre-filtering, post-filtering and contextual modelling.
  - It describes generalised pre-filtering, which moves up the context hierarchy when exact context data is sparse.
- **Principle for PEE:**
  - Store for each context factor:
    - whether it is *observed* (stated by the user);
    - whether it is *inferred*;
    - whether it is *unknown*.
  - The relevance of a factor depends on the product category and on the dialogue. Clarifying questions can change which factors matter.
- **Limits:** Most of the methods surveyed are statistical and need rating data, which PEE does not have.
- **Failure mode:** Assuming a fixed, fully observable context schema in conversation. The user's stated situation is partial, and it grows during the dialogue.

### A4. Dourish (2004). What we talk about when we talk about context
- **Citation:** Dourish, P. (2004). What we talk about when we talk about context. *Personal and Ubiquitous Computing* 8(1), 19–30.
- **DOI:** https://doi.org/10.1007/s00779-003-0253-8 (checked on Crossref).
- **Status:** secondary source only (as summarised in A3).
- **Key concepts:**
  - The representational view of context rests on four assumptions: context is information, delineable, stable, and independent of the activity.
  - The interactional view holds that context and activity shape each other.
- **Principle for PEE:** Context is not a fixed form. What counts as relevant context is decided *with* the task: the product category and the stated goal.
- **Limits:** The paper is a conceptual critique, not a design method.
- **Failure mode:** A form-based "context profile" that is asked up front regardless of category.

### A5. McCarthy (1993). Notes on Formalizing Context
- **Citation:** McCarthy, J. (1993). Notes on formalizing context. *Proc. IJCAI-93*, pp. 555–562.
- **Stable URLs:**
  - https://mlanthology.org/ijcai/1993/mccarthy1993ijcai-notes
  - CogPrints eprint 418.
- **Status:** abstract read (proceedings listing and abstract; CogPrints returned 403 to the fetch tool).
- **Key concepts:**
  - Contexts are first-class objects. `ist(c, p)` asserts that proposition p is true in context c.
  - Lifting axioms relate propositions across contexts. Contexts let an axiomatisation be extended beyond its original limits.
  - The notes are explicitly tentative and propose no single language.
  - The 1997 follow-up with Buvač adds `value(c, e)`. Per search results, `value(c, e)` designates the value of term e in context c.
- **Principle for PEE:** Every inferred claim should carry the context in which it holds. For example, "low noise matters" holds in the context (bedroom placement, light sleeper), not globally. A knowledge relation is really `ist(context, relation)`.
- **Limits:** McCarthy's logic of context is not implemented in any lightweight tool. PEE needs only the idea of a context qualifier, not the logic.
- **Failure mode:** Writing decontextualised rules ("dog → needs HEPA filter") that are then applied where their implicit context does not hold.

---

## B. Knowledge-based and constraint-based recommendation

### B1. Burke (2000). Knowledge-based recommender systems
- **Citation:** Burke, R. (2000). Knowledge-based recommender systems. In A. Kent (ed.), *Encyclopedia of Library and Information Systems*, vol. 69, suppl. 32. Marcel Dekker.
  - Citing papers give the title as "...Library & Information *Systems*", not "Science".
  - The publisher is not confirmed by any source found here.
- **Status:** secondary source only. No DOI was found, and the academia.edu copy returned 403.
- **Content:** cited by others for the following points.
  - Knowledge-based recommenders avoid the ramp-up (cold-start) problem.
  - They draw on case-based reasoning; Entree and FindMe are the examples.
- **Principle for PEE:** see B2, which states the same ideas in a text that was read in full.

### B2. Burke (2002). Hybrid Recommender Systems: Survey and Experiments
- **Citation:** Burke, R. (2002). Hybrid recommender systems: survey and experiments. *User Modeling and User-Adapted Interaction* 12(4), 331–370.
- **DOI:** https://doi.org/10.1023/A:1021240730564 (checked on Crossref).
- **Status:** full text read (open PDF from ugr.es).
- **Key concepts:**
  - Knowledge-based recommenders are distinguished by **functional knowledge**: "knowledge about how a particular item meets a particular user need".
  - **Three kinds of knowledge:**
    - **catalog knowledge:** items and their features, for example "Thai is a kind of Asian cuisine";
    - **functional knowledge:** mapping needs to item properties, for example a romantic dinner is served by "quiet with an ocean view";
    - **user knowledge:** the most challenging kind, which is in the worst case the general user-modelling problem.
  - Existing utility-based systems make users do the need→feature mapping themselves, through preference functions or long questionnaires.
  - Knowledge-based systems cannot "discover" niches. They suggest only associations that a knowledge engineer has entered.
- **Principle for PEE:** Its core asset is *functional knowledge* (need → product property), kept separate from catalog facts and from user facts. Each functional link is a knowledge relation that needs provenance (see section E).
- **Limits:** Knowledge acquisition is the bottleneck. Functional links in Entree were hand-made, with no evidence attached.
- **Failure mode:** Functional links that look plausible are entered as if they were facts. "Quiet with an ocean view → romantic" is an association, not a tested effect.

### B3. Felfernig & Burke (2008). Constraint-based recommender systems: technologies and research issues
- **Citation:** Felfernig, A., & Burke, R. (2008). Constraint-based recommender systems: technologies and research issues. *Proc. 10th Int. Conf. on Electronic Commerce (ICEC '08)*, ACM, Article 3, pp. 1–10.
- **DOI:** https://doi.org/10.1145/1409540.1409544 (checked on Crossref).
- **Status:** secondary source only. Content is known through B4, the expanded chapter by Felfernig and co-authors.
- **Key concepts:** constraint-based recommendation; taxonomy of recommendation knowledge; open issues.
- **Principle for PEE:** see B4.

### B4. Felfernig, Friedrich, Jannach & Zanker (2011). Developing Constraint-based Recommenders
- **Citation:** Felfernig, A., Friedrich, G., Jannach, D., & Zanker, M. (2011). Developing constraint-based recommenders. In *Recommender Systems Handbook*, Springer, pp. 187–215.
- **DOI:** https://doi.org/10.1007/978-0-387-85820-3_6 (checked on Crossref).
- **Status:** full text read (preprint PDF hosted at bgu.ac.il).
- **Key concepts:**
  - **The knowledge base is a tuple:**
    - customer properties V_C;
    - product properties V_PROD;
    - constraints over customer properties C_R (for example, beginner → not high risk);
    - **filter conditions C_F** linking requirements to product properties;
    - product instances C_PROD.
  - **Recommendation is a constraint satisfaction problem (CSP):** the knowledge base plus the user's unary requirements C_C.
  - "No matching product found" is called "highly undesirable". Answers are:
    - query relaxation;
    - minimal relaxation, linear-time per-product relaxations;
    - repair alternatives;
    - conflict-directed, interactive relaxation.
  - **Dialogue:**
    - personalised question sequences, defined as a finite-state automaton;
    - different technical or non-technical vocabulary depending on the user;
    - novices "are not capable of formulating such questions" in complex domains, so the system must lead.
  - **Ranking:** multi-attribute utility theory (MAUT) or soft constraints rank the items that pass the filters.
- **Principle for PEE:**
  - Keep hard filters (user-confirmed requirements) separate from soft preferences, which only rank.
  - An inferred need belongs in ranking or explanation, never in C_F.
- **Limits:**
  - The chapter's own example rule "beginners must not get high-risk products" is a paternalistic hard filter of the kind PEE must avoid unless the user confirms it.
  - Relaxation is defined over requirements already accepted as hard.
- **Failure mode:** An inferred need is encoded as a filter condition, the result set becomes empty, and relaxation has to undo an inference the user never made.

### B5. Felfernig, Schubert & Zehentner (2012). An efficient diagnosis algorithm for inconsistent constraint sets (FastDiag)
- **Citation:** Felfernig, A., Schubert, M., & Zehentner, C. (2012). An efficient diagnosis algorithm for inconsistent constraint sets. *AI EDAM* 26(1), 53–62.
- **DOI:** https://doi.org/10.1017/S0890060411000011 (checked on Crossref; online 2011-06-10).
- **Preprint:** arXiv:2102.09005.
- **Status:** full text read (ar5iv).
- **Key concepts:**
  - **Diagnosis:** a subset Δ of the customer requirements whose removal restores consistency with the knowledge base. Only requirements can be deleted; the knowledge base is assumed consistent.
  - **Minimal diagnosis:** no proper subset of it works.
  - **Preferred diagnosis:** requirements are totally ordered by importance, diagnoses are compared lexicographically, and the least important requirements are dropped first.
  - **FastDiag** applies QuickXPlain's divide-and-conquer to diagnoses directly. Finding one diagnosis costs about as much as finding one minimal conflict, logarithmic in the number of constraints for a fixed diagnosis size.
- **Principle for PEE:**
  - When requirements conflict, propose the *minimal, least-important* set to relax, and show it.
  - Inferred needs should rank *below* every user-stated requirement in this ordering, so they are always the first to go. Better still, they are never hard constraints at all.
- **Limits:**
  - The method assumes a total importance order, which users rarely give.
  - Consistency checking needs a constraint solver. PEE could use plain SQL filters with per-product relaxation instead.
- **Failure mode:** An ordering learned from defaults rather than from the user. That silently decides which of the user's wishes to drop.

### B6. Junker (2004). QuickXPlain
- **Citation:** Junker, U. (2004). QUICKXPLAIN: preferred explanations and relaxations for over-constrained problems. *Proc. AAAI-04*, pp. 167–172.
- **Status:** secondary source only (as cited and described in B5).
- **Key concept:** finds one preferred minimal conflict by divide-and-conquer, given a linear preference order over constraints.
- **Principle for PEE:** Explain *why* nothing matches by showing a minimal conflict ("A and B together rule everything out"), not the whole requirement set.

### B7. Jannach (2004). ADVISOR SUITE: a knowledge-based sales advisory system
- **Citation:** Jannach, D. (2004). ADVISOR SUITE – a knowledge-based sales advisory system. *Proc. ECAI 2004*, IOS Press, pp. 720–724.
- **Stable URL:** https://web-ainf.aau.at/pub/jannach/files/Conference_ECAI_2004.pdf
- **Status:** full text read.
- **Key concepts:**
  - **Customer-property values come from three sources:**
    - direct questions;
    - external sources such as a CRM system;
    - deduction from other variables. **Tabular mappings** derive properties that "a novice user cannot be asked directly".
  - **Knowledge types:**
    - filtering rules;
    - utility functions for ranking;
    - dialogue-flow rules (for example, go to the expert page if self-rated expertise is high);
    - personalised explanation rules.
  - **When no product remains,** filters are relaxed incrementally by priority, as in hierarchical constraint satisfaction. The applied and relaxed filters become the explanation.
  - **Users can override expert priorities,** stating that a rule should never be relaxed or never be applied. The paper notes that expert priorities "do not necessarily match the preferences of the customer".
- **Principle for PEE:**
  - Mark every customer property with *how it was obtained*: asked, imported, or derived.
  - Use the record of relaxed rules as the explanation.
  - Let the user veto or pin any rule.
- **Limits:**
  - A commercial experience report, with no controlled evaluation in this paper.
  - Derived properties are deduced and then used like asked ones.
- **Failure mode:** Derived (deduced) properties are used as hard filters. This is exactly the risk PEE must avoid.

### B8. Felfernig & Gula (2006). An empirical study on consumer behavior in the interaction with knowledge-based recommender applications
- **Citation:** Felfernig, A., & Gula, B. (2006). *Proc. IEEE CEC/EEE 2006*, p. 37.
- **DOI:** https://doi.org/10.1109/CEC-EEE.2006.14 (found by Crossref bibliographic query; the AAU portal lists Gula as first author).
- **Status:** could not verify. The study exists, but no abstract or text was reachable, so no finding is reported here.

### B9. Randall, Terwiesch & Ulrich (2007). User Design of Customized Products
- **Citation:** Randall, T., Terwiesch, C., & Ulrich, K. T. (2007). Research note—User design of customized products. *Marketing Science* 26(2), 268–280.
- **DOI:** https://doi.org/10.1287/mksc.1050.0116 (checked on Crossref; the first author is Taylor Randall).
- **Status:** abstract read.
- **Key concepts:**
  - **Two kinds of design interface:**
    - **needs-based:** users rate the relative importance of their needs, and an optimiser proposes a design;
    - **parameter-based:** users set technical parameters directly.
  - In a laptop experiment, the outcomes of the parameter-based interface improved with user expertise.
  - "For novices, the needs-based interface results in better outcomes than the parameter-based interface."
- **Principle for PEE:**
  - Ask novices about needs and situations ("Where will it stand? Who sleeps nearby?"), not about specifications ("What dB(A)?").
  - Allow parameter entry for experts.
- **Limits:**
  - A single study in a single domain (laptops) — taken from the abstract only.
  - "Needs" in this study are importance weights, not inferred needs.
- **Failure mode:** Converting needs to parameters with a mapping that the user cannot inspect. Novices then cannot detect a wrong mapping.

---

## C. Critiquing, preference elicitation and preference construction

### C1. Chen & Pu (2012). Critiquing-based recommenders: survey and emerging trends
- **Citation:** Chen, L., & Pu, P. (2012). Critiquing-based recommenders: survey and emerging trends. *User Modeling and User-Adapted Interaction* 22(1–2), 125–150.
- **DOI:** https://doi.org/10.1007/s11257-011-9108-6 (checked on Crossref; online 2011).
- **Status:** abstract read.
- **Key concepts:**
  - Critiquing is iterative feedback on shown items, such as "cheaper" or "quieter".
  - **Three branches:**
    - natural-language critiques;
    - system-suggested critiques;
    - user-initiated critiques.
  - A hybrid framework combines the three branches. User studies suggest that hybrid critiquing increases users' decision confidence.
- **Principle for PEE:**
  - After a first shortlist, let the user steer with critiques.
  - Critique dimensions should be outcomes the user understands ("quieter", "smaller"), not raw specifications.
- **Limits:** Results come from the authors' own user studies; only the abstract was read.
- **Failure mode:** System-suggested critiques expose only the dimensions the catalogue varies on. Those may not be the ones the user cares about.

### C2. Pu, Faltings, Chen, Zhang & Viappiani (2011). Usability guidelines for product recommenders based on example critiquing research
- **Citation:** Pu, P., Faltings, B., Chen, L., Zhang, J., & Viappiani, P. (2011). Usability guidelines for product recommenders based on example critiquing research. In *Recommender Systems Handbook*, pp. 511–545.
- **DOI:** https://doi.org/10.1007/978-0-387-85820-3_16 (checked on Crossref).
- **Status:** abstract read.
- **Key concepts:**
  - Guidelines are organised by stage: initial preference elicitation, preference revision, and result presentation.
  - The **ACE** framework names three interacting objectives: decision *Accuracy*, user *Confidence* and interaction *Effort*.
- **Principle for PEE:** Every question has an effort cost. It must buy accuracy or confidence.
- **Limits:** The guideline text itself was not read.

### C3. Viappiani, Faltings & Pu (2006). Preference-based search using example-critiquing with suggestions
- **Citation:** Viappiani, P., Faltings, B., & Pu, P. (2006). Preference-based search using example-critiquing with suggestions. *Journal of Artificial Intelligence Research* 27, 465–503.
- **DOI:** https://doi.org/10.1613/jair.2075 (checked on Crossref).
- **Status:** full text read (ar5iv of arXiv:1110.0026).
- **Key concepts:**
  - Users' preferences are "not well established, but constructed while learning about the possibilities". They are elicited best "with a complete and realistic context".
  - **Fixed question-answer elicitation** "can lead to means objectives": proxies that users believe correlate with their real goals, which then "distract from the true target choice".
  - Users add a preference only when they expect it to have an effect. **Hidden preferences** must be stimulated by showing options.
  - **Look-ahead principle:** show suggestions that would become optimal if the user added one more preference. The authors call this a heuristic, not a theorem.
  - Suggestions raised the chance of finding the target item by up to 78% (as stated in the abstract).
- **Principle for PEE:**
  - Be careful about turning context directly into technical questions: they create means objectives ("I need 5 litres" when the real goal is "dry laundry indoors").
  - Prefer showing contrasting options, each with the need it would serve.
- **Limits:**
  - Tested on apartment and similar catalogue search.
  - Assumes the user can evaluate the examples shown.
- **Failure mode:** The adviser's inferred need becomes the user's stated preference through suggestion. Preference construction cuts both ways: the system can *create* a need.

### C4. Payne, Bettman & Johnson (1993). The Adaptive Decision Maker
- **Citation:** Payne, J. W., Bettman, J. R., & Johnson, E. J. (1993). *The Adaptive Decision Maker*. Cambridge University Press.
- **DOI:** https://doi.org/10.1017/CBO9781139173933 (checked on Crossref).
- **Status:** secondary source only (catalogue descriptions and citations).
- **Key concepts:**
  - Decision makers use a repertoire of strategies, such as compensatory and lexicographic, and choose among them by trading effort against accuracy.
  - Strategy choice depends on the task and context.
- **Principle for PEE:**
  - Expect non-compensatory screening ("must fit under the counter") alongside compensatory trade-offs.
  - Ask which requirements are absolute.
- **Limits:** Laboratory decision research; not about advisers.

### C5. Lichtenstein & Slovic, eds. (2006). The Construction of Preference
- **Citation:** Lichtenstein, S., & Slovic, P. (eds.) (2006). *The Construction of Preference*. Cambridge University Press.
- **DOI:** https://doi.org/10.1017/CBO9780511618031 (checked on Crossref).
- **Status:** abstract read (abstract of the overview chapter on cambridge.org).
- **Key concepts:**
  - In many situations people do not know what they prefer, so they construct preferences when a decision arises.
  - Construction is most likely when elements are unfamiliar, when options force trade-offs between existing preferences, or when considerations must be weighed in new ways.
  - It follows that elicitation can shape the preferences it reveals.
- **Principle for PEE:**
  - The wording and order of questions influence the answer.
  - Record the question that produced each preference. Do not present an inferred need in a leading way.
- **Limits:** An edited collection; most findings are lab-based.

---

## D. Conversational recommendation and clarifying questions

### D1. Jannach, Manzoor, Cai & Chen (2021). A Survey on Conversational Recommender Systems
- **Citation:** Jannach, D., Manzoor, A., Cai, W., & Chen, L. (2021). A survey on conversational recommender systems. *ACM Computing Surveys* 54(5), Article 105, 36 pp.
- **DOI:** https://doi.org/10.1145/3453154. Crossref gives issue 5; the arXiv preprint footer says No. 4.
- **Status:** full text read (arXiv:2004.00646 v2).
- **Key concepts:**
  - Classic recommenders assume users already know their preferences. Users may instead "construct their preferences only during the decision process".
  - Conversational recommendation fits high-involvement products with no past data, such as smartphones.
  - **Domain-independent user intents (Table 1):**
    - Initiate Conversation and Chit-chat;
    - Provide Preferences and Revise Preferences;
    - Ask for Recommendation;
    - Obtain Explanation and Obtain Details;
    - Feedback on Recommendation;
    - Restart, Accept Recommendation and Quit.
    - Research on intents is scarce: only 11 papers discuss them explicitly.
  - **Choosing the next question:**
    - static attribute weights;
    - entropy-based selection, which picks the attribute that most narrows the candidate items, sometimes with popularity information;
    - state machines;
    - reinforcement learning, which decides between "ask" and "recommend".
  - Knowledge-based systems are mostly system-driven. Critiquing systems are system-driven or mixed-initiative.
- **Principle for PEE:**
  - Decide each turn between ask, recommend and explain.
  - Support "Obtain Explanation" and "Revise Preferences" as first-class intents.
  - A symbolic substitute for entropy is to ask the question whose answer most changes the activated needs or the shortlist.
- **Limits:**
  - The survey finds that evaluation practice is weak and that many systems are tested with simulated users.
  - Item-space entropy ignores whether the question is *understandable* to a novice.
- **Failure mode:** Optimising dialogue length alone. A short dialogue that rests on unconfirmed inferences is worse than one more question.

### D2. Aliannejadi, Zamani, Crestani & Croft (2019). Asking clarifying questions in open-domain information-seeking conversations
- **Citation:** Aliannejadi, M., Zamani, H., Crestani, F., & Croft, W. B. (2019). Asking clarifying questions in open-domain information-seeking conversations. *Proc. SIGIR 2019*, pp. 475–484.
- **DOI:** https://doi.org/10.1145/3331184.3331265 (checked on Crossref). Preprint: arXiv:1907.06554.
- **Status:** abstract read.
- **Key concepts:**
  - **Qulac dataset:** more than 10K question–answer pairs for 198 TREC topics with 762 facets.
  - **Framework:** question retrieval, then question selection, then document retrieval.
  - In an oracle setting, one good clarifying question improved retrieval by "over 170%" in P@1.
- **Principle for PEE:** A single well-chosen question that resolves the facet the need depends on can be worth more than many inferences.
- **Limits:**
  - The oracle result is an upper bound.
  - The domain is web search, not purchase advice.
- **Failure mode:** Asking about a facet that does not change the answer. That costs effort and gains nothing.

### D3. Zamani, Dumais, Craswell, Bennett & Lueck (2020). Generating Clarifying Questions for Information Retrieval
- **Citation:** Zamani, H., Dumais, S., Craswell, N., Bennett, P., & Lueck, G. (2020). Generating clarifying questions for information retrieval. *Proc. The Web Conference 2020*, pp. 418–428.
- **DOI:** https://doi.org/10.1145/3366423.3380126 (checked on Crossref).
- **Status:** full text read (Microsoft camera-ready PDF).
- **Key concepts:**
  - **Taxonomy of clarification types**, built from Bing query reformulations:
    - **disambiguation;**
    - **preference**, with four sub-types: personal ("for whom"), spatial ("where"), temporal ("when") and purpose ("for what purpose");
    - **topic;**
    - **comparison.**
  - Most clarifying questions can be formulated using a few templates, such as "Who are you shopping for?". A **rule-based template completion** model fills them from entity types.
  - Users reported functional and emotional benefits from clarification, including confidence. A clarification pane raised clickthrough by about 48% relative to query suggestion.
- **Principle for PEE:**
  - The four preference sub-types map directly onto appliance context dimensions: who (household, sleepers, pets), where (room, size, plumbing), when (usage times) and purpose.
  - A small rule-based template set is adequate. No generative model is needed.
- **Limits:**
  - Web search domain.
  - The learned models need large logs; only the template part transfers.

---

## E. Causality and mechanism

### E1. Pearl (2009). Causality: Models, Reasoning, and Inference (2nd ed.)
- **Citation:** Pearl, J. (2009). *Causality: Models, Reasoning, and Inference*, 2nd ed. Cambridge University Press.
- **DOI:** https://doi.org/10.1017/CBO9780511803161 (confirmed via a Cambridge Core record).
- **Status:** secondary source only. The book was not read; its content is taken from Pearl's own summaries in E2 and E3.
- **Key concepts:**
  - Structural causal models;
  - the do-operator;
  - causal diagrams;
  - identification of effects;
  - counterfactuals.
- **Principle for PEE:** see E2 and E3.

### E2. Pearl (2019). The seven tools of causal inference, with reflections on machine learning
- **Citation:** Pearl, J. (2019). The seven tools of causal inference, with reflections on machine learning. *Communications of the ACM* 62(3), 54–60.
- **DOI:** https://doi.org/10.1145/3241036 (checked on Crossref).
- **Status:** full text read (UCLA technical report R-481, the author's version).
- **Key concepts:**
  - **Three-level hierarchy:**
    - Association, P(y|x);
    - Intervention, P(y|do(x), z);
    - Counterfactual, P(y_x|x′,y′).
    - The hierarchy is directional: "Interventional questions cannot be answered from purely observational information".
  - **Tool 1:** encode causal assumptions so they are *transparent* (inspectable) and *testable*.
  - **Tool 5 (external validity):** results from one experimental setup do not automatically carry to another. A system "cannot be expected to perform well when environmental conditions change, unless the changes are localized and identified."
- **Principle for PEE:**
  - "Owners of dogs often buy HEPA purifiers" is level 1.
  - "A HEPA filter reduces airborne pet dander in a room" is a level-2 claim. It needs interventional evidence (a test), stated with its conditions.
  - A lab test's result transfers to the user's home only under stated conditions such as room size and mode.
- **Limits:**
  - Pearl's tools are probabilistic.
  - PEE needs only the *typing* of claims by level and explicit, inspectable assumptions, not the calculus.
- **Failure mode:** Treating review co-mentions or purchase co-occurrence as evidence that a feature *achieves* an outcome.

### E3. Pearl & Mackenzie (2018). The Book of Why
- **Citation:** Pearl, J., & Mackenzie, D. (2018). *The Book of Why: The New Science of Cause and Effect*. Basic Books.
- **Bibliographic data:** ISBN 9780465097609, confirmed on OpenLibrary.
- **Status:** full text read (chapter 1, author-hosted PDF at bayes.cs.ucla.edu).
- **Key concepts:**
  - **Ladder of Causation:**
    - rung 1, seeing (association);
    - rung 2, doing (intervention);
    - rung 3, imagining (counterfactuals).
  - Questions about interventions "cannot be answered by using passively collected data, no matter how big".
  - A causal model is what lets rung-1 data answer rung-2 questions.
- **Principle for PEE:** Label every knowledge relation with its rung, and never promote a rung-1 link into rung-2 advice ("this will reduce...").
- **Limits:** A popular-science book.

### E4. Woodward (2003). Making Things Happen
- **Citation:** Woodward, J. (2003). *Making Things Happen: A Theory of Causal Explanation*. Oxford University Press.
- **DOI:** https://doi.org/10.1093/0195155270.001.0001. Crossref gives the online date as 2004.
- **Status:** secondary source only (SEP entry "Causation and Manipulability").
- **Key concepts:**
  - X causes Y if an *intervention* on X would change Y.
  - An intervention must be the only cause of X, must not affect Y by another route, and must leave the other causes of Y unchanged.
  - Causal generalisations are those that are **invariant** under interventions.
  - In a common-cause structure, X and Y are correlated, yet P(Y|do X) = P(Y).
- **Principle for PEE:**
  - A justified "property P → outcome O" claim requires evidence that *changing* P (comparing otherwise similar products, or a mode on and off) changes O.
  - The claim also needs the *range of invariance*: the conditions under which it holds.
- **Limits:**
  - The account is non-reductive: interventions are defined causally.
  - It does not tell you how to find such evidence.
- **Failure mode:** Confounding in reviews. Premium models have both feature P and better outcome O because of a third factor, such as build quality.

### E5. Machamer, Darden & Craver (2000). Thinking about Mechanisms
- **Citation:** Machamer, P., Darden, L., & Craver, C. F. (2000). Thinking about mechanisms. *Philosophy of Science* 67(1), 1–25.
- **DOI:** https://doi.org/10.1086/392759 (checked on Crossref).
- **Status:** secondary source only. The SEP entry "Mechanisms in Science" was read, plus abstract snippets; the open copy on ucsd.edu returned 503.
- **Key concepts:**
  - A mechanism is "entities and activities organized such that they are productive of regular changes" (p. 3), from set-up to termination conditions.
  - Activities (productive doings) carry the causal and explanatory role.
  - From the wider literature (per SEP): mechanism *sketches* contain black boxes and filler terms such as "activates", while *schemas* are fuller.
  - Correlations are not mechanisms. Mechanistic and difference-making evidence are often both needed for a causal claim.
- **Principle for PEE:** A causal-justification record should name the following:
  - the entity, which is the product part;
  - the activity: filters, absorbs, isolates;
  - the set-up conditions: placement, mode, room;
  - the termination outcome.
  - A filler verb ("helps with") marks a sketch, not a mechanism.
- **Limits:** The regularity requirement is debated; SEP adopts a minimal definition.
- **Failure mode:** Marketing mechanisms such as "ionic technology purifies air". A mechanism story without difference-making evidence is not a test.

### E6. Halpern & Pearl (2005). Causes and Explanations: A Structural-Model Approach. Part I: Causes
- **Citation:** Halpern, J. Y., & Pearl, J. (2005). Causes and explanations: a structural-model approach. Part I: Causes. *British Journal for the Philosophy of Science* 56(4), 843–887.
- **DOI:** https://doi.org/10.1093/bjps/axi147 (checked on Crossref). Preprint: arXiv cs/0011012.
- **Status:** full text read (ar5iv).
- **Key concepts:**
  - Actual (token) causation is defined relative to a causal model and a context u.
  - **Conditions:**
    - **AC1:** both the candidate cause and the effect actually hold;
    - **AC2:** counterfactual dependence under some contingency;
    - **AC3:** minimality.
  - Whether something is a cause depends on the chosen variables. The authors call this "a feature of our model, not a bug".
  - Causation is not always transitive (the paper's example is Billy's medical treatment).
- **Principle for PEE:**
  - Causal claims are relative to the variables modelled. State them, for example as "noise level in dB(A) at 1 m in sleep mode".
  - Do not chain relations transitively without checking. A → B → C does not license A → C.
- **Limits:** The paper concerns token causation (this event), while PEE mostly needs type-level claims.
- **Failure mode:** Automatically composing relation chains (dog → hair → clogged filter → need for washable filter → ...) and presenting the result as justified.

### E7. Cartwright (1989). Nature's Capacities and Their Measurement
- **Citation:** Cartwright, N. (1989). *Nature's Capacities and Their Measurement*. Clarendon Press, Oxford.
- **DOI:** https://doi.org/10.1093/0198235070.001.0001. Crossref gives 1994, the Oxford Scholarship Online edition, and the LSE record cites 1994.
- **Status:** abstract read (LSE Research Online record).
- **Key concepts:**
  - The general causal claims of science ascribe *capacities* (causal powers) to things.
  - Singular causal claims are primary.
  - Capacities can be measured when suitable conditions are met.
  - Science is treated as measurement.
- **Principle for PEE:**
  - "A HEPA filter has the capacity to capture fine particles" is a capacity claim. Whether it is *exercised* depends on conditions such as airflow, room volume and run time.
  - Store the capacity and the conditions for its manifestation separately.
- **Limits:**
  - Philosophical. The measurement conditions are domain-specific.
  - "Nomological machine" is from Cartwright's later work and was not verified here.
- **Failure mode:** Capacity claims become outcome promises. "Has a HEPA filter" is not the same as "will clean your 40 m² living room".

---

## F. Knowledge representation and provenance standards

### F1. W3C PROV-O: The PROV Ontology (W3C Recommendation, 30 April 2013)
- **Citation:** Lebo, T., Sahoo, S., & McGuinness, D. (eds.). *PROV-O: The PROV Ontology*. W3C Recommendation, 30 April 2013.
- **URL:** https://www.w3.org/TR/prov-o/
- **Status:** full text read (relevant sections).
- **Key concepts:**
  - **Starting-point classes:** Entity, Activity and Agent.
  - **Starting-point properties:**
    - wasGeneratedBy, used, wasDerivedFrom;
    - wasAttributedTo, wasAssociatedWith, actedOnBehalfOf;
    - wasInformedBy, startedAtTime and endedAtTime.
  - **Expanded terms:**
    - wasRevisionOf, wasQuotedFrom, hadPrimarySource;
    - generatedAtTime and invalidatedAtTime;
    - Bundle, Plan, SoftwareAgent and others.
  - **Qualification pattern:** a binary relation is restated as an instance carrying more detail. For example, qualifiedDerivation points to a Derivation with hadActivity, hadUsage and hadGeneration; qualifiedAssociation carries hadPlan and hadRole. The qualified form implies the unqualified one.
  - PROV-O conforms to OWL-RL except for five axioms.
- **Principle for PEE:**
  - Each knowledge relation is an Entity:
    - generated by an extraction or teaching Activity;
    - that used specific source Entities;
    - associated with an Agent (owner, Claude, a parser version) following a Plan (a policy or extractor version).
  - Revisions are wasRevisionOf links, not overwrites.
  - Retirement is invalidatedAtTime, not deletion.
- **Limits:** RDF/OWL tooling is heavy. The model, not the serialisation, is what transfers.

### F2. W3C PROV-DM: The PROV Data Model (W3C Recommendation, 30 April 2013)
- **Citation:** Moreau, L., & Missier, P. (eds.). *PROV-DM: The PROV Data Model*. W3C Recommendation, 30 April 2013.
- **URL:** https://www.w3.org/TR/prov-dm/
- **Status:** full text read (relevant sections).
- **Key concepts:**
  - **Entity:** a thing "with some fixed aspects".
  - **Activity:** something "that occurs over a period of time and acts upon or with entities".
  - **Agent:** "bears some form of responsibility" for an activity.
  - **Derivation:** the transformation or update of one entity into another. It does not require a known activity.
  - **Derivation sub-types:** Revision, Quotation and Primary Source. A primary source is produced by an agent with direct experience.
  - **Bundle:** a named set of provenance descriptions, which allows provenance of provenance. Several provenance accounts of the same entity can coexist.
  - **Six components:** entities/activities, derivations, agents/responsibility, bundles, alternates, collections.
- **Principle for PEE:**
  - "Primary source" is the right label for a laboratory measurement by an independent tester. A review quoting a manufacturer is a Quotation of the manufacturer, not a primary source.
  - Keep competing accounts side by side rather than merging them.

### F3. OWL 2 Web Ontology Language Profiles (2nd ed.), the OWL 2 RL section
- **Citation:** Motik, B., et al. (eds.). *OWL 2 Web Ontology Language Profiles (Second Edition)*. W3C Recommendation, 11 December 2012.
- **URL:** https://www.w3.org/TR/owl2-profiles/
- **Status:** full text read (the OWL 2 RL section).
- **Key concepts:**
  - OWL 2 RL is designed to be "implemented using rule-based reasoning engines". It has polynomial reasoning, never infers unnamed individuals, and avoids nondeterminism.
  - **Syntactic asymmetry:** existentials and unions are allowed only in *subclass* position. Superclass position allows intersection, complement, universal quantification, hasValue and max-cardinality 0/1.
  - **Partial axiomatisation:** first-order implication rules over a predicate T(s,p,o), covering equality, properties, classes, class axioms, datatypes and schema vocabulary.
  - Under theorem PR1's conditions the rules are complete for entailment. On arbitrary RDF graphs they stay sound but completeness is lost.
- **Principle for PEE:**
  - A small, forward-chaining rule set over triples is a well-understood design: subclass, subproperty, domain/range, inverse and transitive closure. It suits SQLite with recursive CTEs.
  - It cannot conclude that something *exists*, for example "this user has some need". That matches PEE's "never invent" stance.
- **Limits:**
  - See F4: OWL semantics are open-world and monotonic.
  - Defaults ("usually"), exceptions ("unless the user says otherwise") and retraction by later evidence cannot be expressed natively. PEE needs those for defeasible need inference.
  - The OWL 2 RL document itself does not discuss defaults; this point follows from the semantics stated in F4.

### F4. OWL 2 Web Ontology Language Primer (2nd ed.)
- **Citation:** Hitzler, P., et al. (eds.). *OWL 2 Web Ontology Language Primer (Second Edition)*. W3C Recommendation, 11 December 2012.
- **URL:** https://www.w3.org/TR/owl2-primer/
- **Status:** full text read (sections 2, 4.4 and 4.7).
- **Key concepts:**
  - **Open-world assumption:** a missing fact "may simply be missing (but possibly true)".
  - "OWL 2 is not a database framework."
  - No unique-name assumption: OWL does not assume that "different names are names for different individuals".
- **Principle for PEE:**
  - Unknown must stay unknown. A missing specification is not "absent".
  - Never assume two product names denote different, or the same, products without an explicit identity statement. This matches the rule against merging similar names.
- **Limits:**
  - Monotonicity is implied by OWL's first-order semantics, but the primer does not use the word.
  - PEE's SQLite store is closed-world by default, so this must be designed in explicitly, for example with a three-valued status.

### F5. SKOS Simple Knowledge Organization System Reference (W3C Recommendation, 18 August 2009)
- **Citation:** Miles, A., & Bechhofer, S. (eds.). *SKOS Reference*. W3C Recommendation, 18 August 2009.
- **URL:** https://www.w3.org/TR/skos-reference/
- **Status:** full text read (relevant sections).
- **Key concepts:**
  - **Vocabulary:**
    - Concept and ConceptScheme;
    - prefLabel (at most one per language), altLabel and hiddenLabel.
  - **Hierarchy:**
    - `broader`/`narrower` are *direct* links and are **not transitive**;
    - `broaderTransitive` is the transitive super-property.
  - **Association:**
    - `related` is symmetric, non-transitive and disjoint from `broaderTransitive`, so a pair cannot be both hierarchical and associative;
    - closeMatch is non-transitive "to avoid compounding errors", while exactMatch is transitive.
  - SKOS is "not a formal knowledge representation language". The links have no formal axiomatic meaning about the world.
  - definition and scopeNote are documentation properties.
- **Principle for PEE:**
  - Use SKOS-style typing for the *vocabulary* of needs, contexts and properties: labels, synonyms, broader/narrower.
  - Do not let `related` carry inference weight. It is association by design.
  - Use closeMatch rather than exactMatch for cross-source term mapping.
- **Limits:** SKOS is not suited to causal or conditional relations; those need their own typed relations.
- **Failure mode:** Inferring transitively over `broader` or `related` and drifting far from the original concept.

### F6. Groth, Gibson & Velterop (2010). The anatomy of a nanopublication
- **Citation:** Groth, P., Gibson, A., & Velterop, J. (2010). The anatomy of a nanopublication. *Information Services & Use* 30(1–2), 51–56.
- **DOI:** https://doi.org/10.3233/ISU-2010-0613 (checked on Crossref).
- **Status:** abstract read. The publisher returned 403 for the full text.
- **Key concepts:**
  - A nanopublication is a core scientific statement packaged with its context, so that statements can be found, linked, attributed and curated.
  - The model is serialised with named graphs in RDF, built from existing community technologies.
  - The paper discusses aggregating nanopublications.
- **Principle for PEE:** The unit of knowledge is one assertion plus its provenance, not a document.

### F7. Kuhn et al. (2018). Nanopublications: A Growing Resource of Provenance-Centric Scientific Linked Data
- **Citation:** Kuhn, T., Meroño-Peñuela, A., Malic, A., et al. (2018). Nanopublications: a growing resource of provenance-centric scientific linked data. *Proc. IEEE eScience 2018*.
- **Preprint:** arXiv:1809.06532.
- **Status:** full text read (ar5iv).
- **Key concepts:**
  - **Four named graphs:**
    - Assertion;
    - Provenance (how the assertion came about);
    - Publication info (how this record was made: creator, time, licence);
    - a Head graph that ties them together.
  - **Trusty URIs:** each identifier embeds a hash of the full content, so any change is detectable.
  - Nanopublications are immutable. New versions are new records; indexes, which are themselves nanopublications, define sets and versions.
  - More than 10 million nanopublications existed at the time of writing.
- **Principle for PEE:**
  - Separate *why the claim is believed* (provenance) from *how this row was created* (publication info).
  - Hash each knowledge record.
  - Never edit a record in place: supersede it.
- **Limits:**
  - Retraction and supersession mechanics are not described in this paper.
  - RDF and signatures are more than PEE needs.

---

## G. Commonsense relation inventories (design input only)

### G1. Speer, Chin & Havasi (2017). ConceptNet 5.5: An Open Multilingual Graph of General Knowledge
- **Citation:** Speer, R., Chin, J., & Havasi, C. (2017). ConceptNet 5.5: an open multilingual graph of general knowledge. *Proc. AAAI-17*, 31(1).
- **DOI:** https://doi.org/10.1609/aaai.v31i1.11164 (checked on Crossref).
- **Preprint:** arXiv:1612.03975.
- **Status:** full text read (ar5iv), plus the project wiki pages "Relations" and "Edges".
- **Key concepts:**
  - **36 core relations**, 7 symmetric. Those relevant here, with the wiki's examples:
    - UsedFor: bridge → cross water;
    - CapableOf: knife → cut;
    - HasPrerequisite: dream → sleep;
    - MotivatedByGoal: compete → win;
    - Desires: person → love;
    - **ObstructedBy:** sleep → noise;
    - Causes: exercise → sweat, defined as "it is typical for A to cause B";
    - CausesDesire, ReceivesAction, AtLocation;
    - HasFirstSubevent and HasLastSubevent.
  - **Sources:**
    - crowdsourcing (Open Mind Common Sense, games with a purpose);
    - Wiktionary, the largest source at 18.1M edges;
    - WordNet, OpenCyc and DBpedia.
  - **Scale:** more than 21M edges and more than 8M nodes.
  - Edges carry weight, `sources`, `dataset`, `license` and `surfaceText` (per the wiki).
- **Principle for PEE:**
  - A useful *checklist of relation types* for the needs layer: goal (MotivatedByGoal), obstacle (ObstructedBy), prerequisite (HasPrerequisite), function (UsedFor/CapableOf).
  - "sleep ObstructedBy noise" is exactly the shape of "light sleeper → low-noise need".
- **Limits and noise:**
  - Provenance exists only at contributor and dataset level. It is not evidence for the claim, and it carries no conditions or scope.
  - Its "Causes" means *typical*, not tested.
  - Terms are not disambiguated, and linked-data alignments are "underspecified, many-to-many".
  - The paper makes no reliability claim.
- **Failure mode:** Importing ConceptNet edges as knowledge would bring rung-1 associations into the advice. Use the *relation inventory* only, not the data.

### G2. Sap et al. (2019). ATOMIC: An Atlas of Machine Commonsense for If-Then Reasoning
- **Citation:** Sap, M., Le Bras, R., Allaway, E., Bhagavatula, C., Lourie, N., Rashkin, H., Roof, B., Smith, N. A., & Choi, Y. (2019). ATOMIC: an atlas of machine commonsense for if-then reasoning. *Proc. AAAI-19*, 33(01), 3027–3035.
- **DOI:** https://doi.org/10.1609/aaai.v33i01.33013027 (checked on Crossref).
- **Preprint:** arXiv:1811.00146.
- **Status:** full text read (ar5iv).
- **Key concepts:**
  - **Nine if-then relations on events about PersonX:**
    - xIntent: why X does it;
    - xNeed: what X needed first;
    - xAttr: how X is perceived;
    - xEffect, xReact and xWant;
    - oEffect, oReact and oWant: the same for others.
  - **Groupings:** causes or preconditions (xIntent, xNeed), effects, and stative (xAttr).
  - **Scale and quality:**
    - 877,108 triples from 24,313 base events;
    - crowdsourced as free text on Mechanical Turk;
    - 86.2% of annotations were judged valid.
  - Overlap with ConceptNet is low.
- **Principle for PEE:**
  - The x/o split, actor versus others affected, is useful: "light sleeper *partner*" is an oReact concern.
  - xNeed/xIntent separate a *precondition* from a *motive*. PEE should keep "needs plumbing" (prerequisite) distinct from "wants fresh air" (goal).
- **Limits:**
  - Free-text, crowd-sourced inferences about *plausible* human reactions, with about 14% judged invalid.
  - No provenance per claim beyond collection.
  - Not about artefacts or properties.
- **Failure mode:** Treating plausible mental-state inferences as facts about this user.

---

## Synthesis

### 1. Context model: context activates needs; it is not a need

**Design stance.** This combines Dey (A1), Adomavicius et al. (A3), Dourish (A4), McCarthy (A5) and Zamani et al. (D3).

- A **context fact** is information about the shopper's situation, in Dey's sense.
- A **need** is a goal the product should serve.
- A **knowledge relation** links them in a context-qualified way, in McCarthy's sense:
  `ist(context-condition, activates(need, strength))`.
- Context is used as a **pre-filter on knowledge**, deciding which need relations are live (A2, A3). It is never a product filter.

**Dimensions that matter for appliance advice.** These follow Zamani's who/where/when/purpose and Dey's identity/location/time/activity.

| Dimension | Examples | Typical effect |
|---|---|---|
| Who (household) | light sleeper, baby, elderly, allergy sufferer, pets (dog, cat), number of people | activates noise, filtration, capacity or safety needs; selects affected party (x vs o, ATOMIC) |
| Where (space) | flat size, room (bedroom, kitchen), floor area/volume, shared walls, storage space | activates compactness and noise; sets conditions for capacity claims (room volume) |
| Infrastructure | no plumbing / "can't plumb", no venting, socket type, renter (cannot drill), water hardness | **hard feasibility constraints**, but only when stated or confirmed by the user |
| When (usage pattern) | night-time use, daily vs weekly, while working from home | activates noise-at-night, energy and cycle-time needs |
| Purpose / goal | dry laundry indoors, reduce dust, faster coffee | the root goal; needs derive from it |
| Climate / environment | humidity, temperature, pollen season, outdoor air quality | conditions for whether capacity becomes outcome (Cartwright) |
| Constraints of the shopper | budget, brand exclusions, expertise level | ranking and dialogue style (novice → needs-based questions, B9) |
| Observability | stated / inferred / unknown | governs assert vs ask (A3) |

**How context changes the relevance of a need.** These are rules for the knowledge layer.

- **Activation, not assertion.** `light_sleeper ∧ placement=bedroom ⇒ candidate_need(low_noise_night, strength=high, status=inferred)`.
  - If placement is unknown, the need is *candidate, conditional*. That is a reason to ask, not to filter.
- **Context is typed by category relevance** (the interactional view, A4). "Dog" matters for vacuums and purifiers but not for kettles. Store `relevant_categories` on each activation relation.
- **Context facts have provenance and status:** stated, confirmed, inferred from another context fact, or unknown. Inferences from inferences carry decaying strength and are never chained silently (E6, non-transitivity).
- **Generalise when specific knowledge is missing** (generalised pre-filtering, A3). If there is no relation for "studio flat", use "small flat" via SKOS `broader`, and say so.
- **Infrastructure context is the only kind that may become a hard constraint, and only once stated by the user.** "Can't plumb" excludes plumbed-in dishwashers. A *guessed* "probably can't plumb (renter)" may not.

### 2. Minimal causal-justification record for "property → outcome"

This draws on Pearl (E2, E3), Woodward (E4), MDC (E5), Halpern & Pearl (E6), Cartwright (E7), PROV (F1, F2) and nanopublications (F6, F7).

**Fields:**

```
relation_id            stable id; content hash (trusty-URI idea)
subject_property       typed product property (e.g. filter_class=H13, noise_dB_A_sleep_mode)
outcome                typed outcome (e.g. airborne_PM2.5_reduction, perceived_noise_at_night)
direction              increases / decreases / enables / prevents / no_effect
claim_level            association | intervention | counterfactual   (Pearl rung)
claim_kind             capacity (can) | manifestation (does, under conditions)   (Cartwright)
mechanism              entity + activity + set-up/termination (MDC);
                       or "sketch" flag when only filler verbs are known
conditions             scope of invariance (Woodward): room size/volume, mode, placement,
                       duration, ambient conditions; units and thresholds
effect_size            value + unit + uncertainty, or null
evidence[]             each: source_entity, evidence_type
                       (controlled_test | standard_test_method | comparative_test |
                        expert_explanation | manufacturer_declaration | user_report |
                        co-occurrence), independence (independent / manufacturer),
                       primary_source flag (PROV hadPrimarySource), conditions_of_test
transfer_assumptions   why the test conditions carry to the user's home (Pearl Tool 5)
contraindications      known conditions under which the effect fails or reverses
provenance             PROV: wasGeneratedBy(activity), used(sources), wasAttributedTo(agent),
                       plan (policy/extractor version), generatedAtTime
publication_info       who/what wrote this row, when, licence/retention class (nanopub pubinfo)
status                 proposed | supported | contested | retired; wasRevisionOf; invalidatedAtTime
```

**Labelling rules for association-only links:**

- Any relation whose evidence is only co-occurrence (reviews, purchases, co-mentions, ConceptNet/ATOMIC-style commonsense) gets `claim_level = association`. It may be used to
  - **suggest a question** ("Many dog owners ask about washable filters; is shedding a concern?"), or
  - **order candidate needs**,

  but **never** to assert that a property achieves an outcome. It never ranks products as if the property helped.
- A manufacturer declaration supports at most `capacity` with `independence = manufacturer`. It is never an independent test.
- A mechanism story without a difference-making test is `mechanism = sketch` and `claim_level = association`, however plausible it is.
- An `intervention`-level claim requires at least one controlled or comparative test, with `conditions` recorded. It is used for advice *only* when the user's context satisfies the conditions, or when they are stated as caveats.
- No transitive composition. A chain A→B→C is stored only if C is justified on its own; otherwise it is shown as a chain of separately justified steps.

### 3. What a small SQLite system can adopt from PROV-O, OWL 2 RL, SKOS and nanopublications

**From PROV:**
- Three core tables or roles: `entity` (sources, knowledge rows, observations), `activity` (extraction run, teaching session, dialogue turn) and `agent` (owner, Claude, parser version).
- Edge tables for `used`, `generated_by`, `derived_from` and `attributed_to`.
- Qualified derivation as a row carrying activity, usage and role.
- `hadPrimarySource` versus quotation as a column.
- Revision chains (`was_revision_of`) and `invalidated_at` instead of deletes.
- Bundles, meaning provenance of provenance, map to the run or batch id that wrote a set of rows.

**From nanopublications:**
- One knowledge assertion per row.
- Separate provenance columns (why believed) from publication-info columns (who wrote the row, when, under which retention class).
- A content hash per row.
- Immutability: new versions supersede old ones.

**From OWL 2 RL:**
- A small, sound, forward-chaining rule set over a triple-like relation table: subclass/subproperty closure, inverse, transitive (only for explicitly transitive relations), domain/range typing.
- No existential introduction: never create an unnamed need or product.
- Implement this with recursive CTEs and materialised derived rows that carry `derived_by_rule`.

**What not to adopt from OWL 2 RL:**
- OWL's open-world, monotonic semantics are a poor fit for *defeasible* need inference.
- Instead, keep an explicit three-valued status (true / false / unknown) and a `defeated_by` link.
- A user's statement overrides an inferred default. That is non-monotonic and must be handled outside OWL semantics.

**From SKOS:**
- Concept vocabularies for needs, contexts, outcomes and properties: prefLabel, altLabel, hiddenLabel.
- broader/narrower as non-transitive edges with a separate transitive closure.
- `related` kept as non-inferential, and closeMatch versus exactMatch for cross-source mapping.

**From OWL (the Primer):**
- No unique-name assumption, which also respects "never merge on similar names".
- Unknown ≠ false.

### 4. Conversational policy: when to assert, suggest, ask or leave unknown

**Assert** a fact or need only when it is:
- stated by the user;
- confirmed by the user; or
- deterministically entailed by stated facts plus intervention-level knowledge whose conditions are met.

Assertions are the only things that may act as hard filters, and among them only feasibility constraints and explicit must-haves (B4, B7). Even then:
- keep a relaxation path, a minimal, least-important diagnosis (B5, B6);
- explain the conflict (B6, B7).

**Suggest** (rank, never filter) when a need is inferred from context with a supported relation but has not been confirmed:
- Show it as a reason on the product ("quieter in sleep mode, relevant if it will be in a bedroom").
- Let the user veto or pin it (B7).
- Look-ahead suggestions (C3): show an option that becomes best if the inferred need is real.

**Ask** when all of the following hold:
1. An unconfirmed inferred need, or an unknown context fact, would *change the shortlist or the ranking materially*. This is a symbolic analogue of entropy-based attribute selection (D1) and of the one-good-question result (D2).
2. The question can be posed in needs or situation terms understandable to a novice. Novices do better with needs-based than with parameter-based interfaces (B9), and in complex domains novices cannot formulate the questions themselves (B4).
3. The effort is justified by accuracy or confidence (ACE, C2).

Prefer Zamani-style templates (D3): who, where, when, for what purpose.

**Avoid** fixed batteries of technical questions. They create means objectives (C3) and shape the constructed preference (C5).

**Leave unknown** when:
- no supported relation exists;
- the only link is association-level and the answer would not change the shortlist; or
- the user declined to answer.

Unknown is reported as unknown, not as absent (F4).

**Support user intents explicitly** (D1): obtain explanation, revise preferences, restart, critique (C1).

### 5. Pitfalls

1. **Association promoted to causation.** Review co-mentions, purchase co-occurrence and commonsense "Causes" edges (G1) are rung 1. They must not justify "property P improves outcome O" (E2, E3).
2. **Confounding.** Premium products bundle many features. An outcome difference cannot be attributed to one feature without a like-for-like comparison or a controlled test (E4).
3. **Lost conditions.** A lab result in a small chamber, or a declared noise level in the quietest mode, does not carry to the user's room or mode without a transfer assumption (E2 Tool 5, E7).
4. **Transitive inference chains.** dog → hair → filter clog → washable filter → ... Causation is not always transitive (E6). SKOS `broader` and `related` are deliberately non-transitive (F5).
5. **Inferred need used as a filter.** This produces empty or wrongly narrowed result sets, and relaxation then has to undo an inference the user never made (B4, B5). An inferred need must always rank below stated requirements.
6. **Derived customer properties treated like asked ones** (B7). Every property needs an acquisition mode.
7. **Means objectives and leading questions.** Technical questions and suggestive framing create preferences rather than discovering them (C3, C5). Record which question produced each answer.
8. **Context over-reach.** Context facts applied in categories where they are irrelevant (A1, A4). Each activation relation needs category scope.
9. **Closed-world defaults in SQLite.** A missing row is read as "no". Use explicit unknown (F4).
10. **Merging on names.** No unique-name assumption in either direction (F4). This matches PEE's existing rule.
11. **Commonsense resources as data.** ConceptNet and ATOMIC carry contributor-level provenance only, with typical/plausible semantics and known invalid rates (about 14% for ATOMIC). Use their relation *types* as design input only.
12. **Over-asking.** Every question costs effort (C2). Ask only when the answer would change the shortlist materially, and use needs language.
13. **Overwriting knowledge.** In-place edits destroy auditability. Supersede, hash and invalidate instead (F1, F7).
14. **Mechanism theatre.** A plausible mechanism story ("ionic", "antibacterial coating") with no difference-making evidence is a sketch, not a justification (E5).
