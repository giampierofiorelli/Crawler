# B — Abduction, hypothesis management, defeasible reasoning and argumentation for an implicit-needs adviser

Survey date: 2026-10-20. Method: web search; reading of abstracts, open full texts and publisher metadata. No file in the
Crawler or pee-knowledge repositories was read. Quotes are under 25 words. Each source carries a verification status:

- **full text read**: the open full text (or an author preprint) was retrieved and the relevant passages were read;
- **abstract read**: only the abstract or publisher summary was read, plus bibliographic metadata (DOI checked against
  Crossref where noted);
- **secondary source only**: existence and bibliographic data confirmed, but the content statements come from other
  scholars' summaries (and are marked as such);
- **could not verify**: a specific claim that I could not confirm in any source I reached.

Where something is from my background knowledge and not confirmed in this session, it is flagged "[unverified]".

Relevance frame (from the brief): PEE must hypothesise implicit needs from what a shopper says, keep several competing
hypotheses alive with justification and uncertainty, never convert a hypothesis into a hard exclusion, decide what to
assert / suggest / ask / leave unknown, and record why each inference was made. The current prototype caps inferences at
one per request because it has no selection and uncertainty mechanism.

---

## Part 1 — Abduction: concept and criteria for a "best" explanation

### 1. Douven, I. "Abduction". *Stanford Encyclopedia of Philosophy* (first published 9 Mar 2011; substantive revision 18 Jun 2025), with the supplement "Peirce on Abduction"

- URL: https://plato.stanford.edu/entries/abduction/ (supplement: https://plato.stanford.edu/entries/abduction/peirce.html)
- Status: **full text read** (entry and supplement; a secondary scholarly source for Peirce).
- Key concepts:
  - "Abduction" has two senses. Peirce's original sense is the *generation* of hypotheses (context of discovery). The
    modern sense is the *justification* of hypotheses, usually called Inference to the Best Explanation (IBE).
  - Peirce's schema (CP 5.189): a surprising fact C is observed; if A were true, C would be "a matter of course"; hence
    there is reason to *suspect* A. Peirce called abduction "the only logical operation which introduces any new idea"
    (CP 5.172).
  - On the supplement's reading, Peircean abduction licenses entertaining A as a candidate *worth pursuing*, not accepting
    it as true. Deduction then derives testable consequences, and induction judges them.
  - The entry gives three modern forms. ABD1: infer that the best explanation is true (too strong). ABD2: infer it only if
    it is also *good enough*, and no agreed criterion of "good enough" exists. ABD3: infer only that the best is closer to
    the truth than its rivals (comparative).
  - Van Fraassen's "best of a bad lot" objection: the best of the hypotheses we happened to consider may still be false. A
    catch-all "none of the above" hypothesis is usually uninformative. The objection bites ABD1, not ABD2 or ABD3.
  - Relation to Bayesianism: explanatory considerations can be used to set priors and likelihoods, or as a heuristic when
    probabilities are unknown.
- Principle for a needs adviser: an abduced need is a **candidate worth pursuing**, not a fact. Accept a hypothesis only
  if it is both comparatively best (ABD3) and absolutely good enough (ABD2). Otherwise keep it as a suggestion or a
  question.
- Limits: the entry is philosophical and gives no algorithm. There is no agreed threshold for "good enough".
- Failure modes warned about: best-of-a-bad-lot. The generator of hypotheses (PEE's need vocabulary) bounds what can ever
  be inferred, and an incomplete vocabulary silently produces confident wrong answers.

### 2. Josephson, J. R. & Josephson, S. G. (eds.) (1994). *Abductive Inference: Computation, Philosophy, Technology*. Cambridge University Press

- DOI (chapters): book chapters carry DOIs under 10.1017/CBO9780511530128 (ch. 1 "Conceptual analysis of abduction",
  pp. 5–30: https://doi.org/10.1017/CBO9780511530128.002; ch. 7 "The computational complexity of abduction",
  pp. 157–179: https://doi.org/10.1017/CBO9780511530128.008). ISBN 978-0-521-43461-4 (hb); paperback 1996.
- Status: **secondary source only** for the book's text. Metadata and chapter list were read on Cambridge Core. Chapter 1
  had no summary and is paywalled. The schema was confirmed on a third-party page (aitopics.org) and in Josephson's own
  1989 paper (source 3, full text). A secondary source attributes to the book acceptance only if the hypothesis
  "surpasses other explanations ... by a distinct margin" after a thorough search, with explanatory power, plausibility,
  parsimony and internal consistency as ranking criteria.
- **Could not verify**: the exact list "coverage, plausibility, parsimony, consistency" in the book's own words. It is
  consistent with source 3 and with secondary summaries, but I did not see it in the book text.
- Key concepts (as verified via source 3 and secondary summaries):
  - Schema: D is a collection of data; H explains D; no other hypothesis explains D as well as H; therefore H is probably
    true.
  - Confidence is *graded* and depends on several factors (listed under source 3).
  - Comparison with alternatives can be *implicit*: rivals are compared part by part without generating all of them
    (secondary summary).
  - Best explanations are usually *composite*: sets of co-occurring hypotheses that jointly cover the data.
- Principle: rank a candidate need by explanatory coverage of the cues, plausibility, parsimony and consistency.
  **Require a margin over rivals** before asserting it.
- Limits: designed for diagnosis-like tasks with a fairly complete hypothesis space and enumerable findings.

### 3. Josephson, J. R. (1989). "Reducing uncertainty by using explanatory relationships". NASA Technical Reports Server, document N89-19831 (Ohio State University)

- URL: https://ntrs.nasa.gov/api/citations/19890010466/downloads/19890010466.pdf (scanned; a workshop paper reproduced
  in an NTRS proceedings volume; I did not identify the exact proceedings title).
- Status: **full text read** (OCR text extracted from the PDF).
- Key concepts:
  - The strength of an abductive conclusion depends on several factors:
    - how good H is by itself;
    - how decisively H surpasses the alternatives;
    - how thorough the search for alternative explanations was;
    - pragmatic considerations: "the costs of being wrong and the benefits of being right", and "how strong the need is
      to come to a conclusion at all, especially considering the possibility of seeking further evidence before
      deciding".
  - Hypothesis interactions are typed: mutually incompatible; refinement (A is a more detailed refinement of B); causal
    (A could be caused by B); explanatory alternatives (compatible, with overlapping coverage).
  - A staged acceptance strategy builds a composite explanation:
    1. **Essentials**: the only plausible explanation of some finding. Accept them.
    2. **Clear Bests**: no rival is anywhere near as good for some finding. Accept them.
    3. Drop hypotheses that are explanatorily superfluous given the accepted ones.
    4. If findings remain unexplained, the best strategy is to **gather more data**.
    5. Only under time or cost pressure accept **Weak Bests** ("the best guesses we can make under the circumstances").
  - Findings "vote" for their best explanation. Converging independent lines (Whewell's consilience) raise confidence.
  - Unexplained findings guide data gathering: discriminate between the good alternative explanations of *important*
    findings.
- Principle (directly implementable):
  - A tiered status ladder: Essential → Clear Best → Weak Best → unresolved.
  - **When no hypothesis is clearly best, ask** (gather data) rather than guess.
  - Choose the question that discriminates between the leading alternatives.
  - Guesses are labelled as guesses.
- Limits: assumes local-match confidence scores exist and that the important findings can be enumerated. It is a
  heuristic strategy, not an optimality proof.
- Failure modes: accepting Weak Bests as if they were Clear Bests. Double-counting non-independent cues as "converging
  votes".

### 4. Josephson, J. R. (2001). "On the proof dynamics of inference to the best explanation". *Cardozo Law Review* 22, 1621

- URL: https://larc.cardozo.yu.edu/clr/vol22/iss5/15
- Status: **abstract read**. The PDF returned HTTP 403 and was not retrieved; I did not attempt to bypass it.
- Key concepts (abstract):
  - Abductive arguments are fallible, but they can fail in only a limited number of recognisable ways, which makes them
    easier to critique and defend.
  - The static argument pattern is distinct from the dynamic process of generating and testing hypotheses.
  - Best explanations are usually composite.
  - A software implementation of a simplified strategy performed well in testing.
  - The essay proposes a definition of "beyond a reasonable doubt".
- Principle: give every inference a **finite checklist of attack points** (the ways it can fail), so it can be audited and
  defended. This is the same idea as critical questions (sources 15–17).
- Limits: legal and scientific setting. I did not read the details.

### 5. Bylander, T., Allemang, D., Tanner, M. C. & Josephson, J. R. (1991). "The computational complexity of abduction". *Artificial Intelligence* 49(1–3), 25–60

- DOI: 10.1016/0004-3702(91)90005-5 (Crossref-checked). A version is chapter 7 of source 2.
- Status: **abstract read** (via the Cambridge chapter summary; the journal abstract is elided in Semantic Scholar).
- Key concepts:
  - Abduction is defined as finding the most plausible *combination* of hypotheses that explains *all* the data.
  - This is NP-hard in general.
  - The drivers of intractability are: "choosing between incompatible hypotheses, reasoning about cancellation effects
    among hypotheses, and satisfying the maximum plausibility requirement".
  - A tractable, restricted class of abduction problems exists. [unverified detail: the class excludes incompatibility
    and cancellation interactions; I recall this but did not read it in this session.]
- Principle:
  - Do **not** compute a globally "most plausible complete explanation" of a shopper's utterance.
  - Use local, greedy, staged acceptance (source 3).
  - Keep the need vocabulary such that incompatibilities are explicit and few.
  - Do not demand full coverage of every cue.
- Limits: worst-case results. Real knowledge bases may be easy in practice.
- Failure modes: designs that silently require global optimisation, such as "find the best set of needs explaining
  everything said", will not scale or will be approximated opaquely.

### 6. Peng, Y. & Reggia, J. A. (1990). *Abductive Inference Models for Diagnostic Problem-Solving*. Springer (Symbolic Computation series), xii+284 pp.

- DOI: 10.1007/978-1-4419-8682-5 (Springer record; chapter 2 DOI 10.1007/978-1-4419-8682-5_2).
- Status: **secondary source only**. The Springer landing page redirected to a login and was not read. The definitions
  were confirmed in a 2013 arXiv paper (arXiv:1303.1466) that restates them.
- Key concepts (per the secondary source):
  - Diagnosis is set covering over a causal network of disorders → manifestations. An explanation is a *cover* of the
    observed manifestations.
  - Parsimony criteria are nested:
    - **minimum** cover: the smallest cardinality;
    - **irredundant** cover: no proper subset is still a cover;
    - **relevant** cover: every disorder explains at least one observed manifestation.
  - The minimum covers are a subset of the irredundant covers, which are a subset of the relevant covers.
  - [unverified: the book adds a probabilistic causal model that ranks covers by likelihood.]
- Principle: when several needs could account for the same cue, prefer **irredundant** sets: do not posit a second need
  that explains nothing beyond the first. Do not, however, force the *minimum*-cardinality set, since shoppers often
  have several genuine needs.
- Limits: assumes a complete disorder–manifestation map. Minimum-cardinality parsimony is a bias, not a truth.
- Failure modes: parsimony suppresses genuine co-occurring needs (a dog owner who is also a light sleeper).

### 7. Poole, D. (1988). "A logical framework for default reasoning". *Artificial Intelligence* 36(1), 27–47

- DOI: 10.1016/0004-3702(88)90077-X
- Status: **abstract read** (via a mirror; the publisher abstract is elided in Semantic Scholar) and **full text read** of
  the author's Theorist project page (https://www.cs.ubc.ca/~poole/theorist.html).
- Key concepts:
  - Default reasoning is cast as theory formation, not deduction. Defaults are predefined *possible hypotheses*; the
    semantics stay standard first-order.
  - The user supplies facts and the *forms* of possible hypotheses.
  - [standard Theorist definition, unverified in this session: an explanation is a set of hypothesis instances, consistent
    with the facts, which together with the facts implies the goal.]
  - Two uses. *Explanation* (abduction): explain an observation. *Prediction* (default reasoning): decide whether to
    predict something unknown. The page says observations are explained with normality and abnormality assumptions, and
    predictions use normality assumptions.
  - The THEORIST prototype ran all the examples. The paper discusses the multiple-extension problem. Brewka (1989) notes
    that Theorist does not represent priorities between defaults adequately.
- Principle:
  - Separate **facts** (what the shopper said, product data), **assumables** (typed need hypotheses) and **constraints**.
  - An inferred need is legitimate only as a *named assumable* used in a consistent explanation.
  - Keep "explain what was said" (abduction) separate from "predict what else is probably true" (default prediction).
- Limits: priorities between defaults need an extension. Multiple extensions must be handled explicitly.

### 8. Poole, D. (1993). "Probabilistic Horn abduction and Bayesian networks". *Artificial Intelligence* 64(1), 81–129

- DOI: 10.1016/0004-3702(93)90061-F (Crossref-checked). Preprint: https://www.cs.ubc.ca/~poole/papers/pha-bn.pdf
- Status: **full text read** (abstract and sections 1–2 read; later sections skimmed by keyword).
- Key concepts:
  - Horn-clause abduction with probabilities attached to hypotheses.
  - "Disjoint declarations" group mutually exclusive, covering hypotheses, which behave like random variables.
    Hypotheses in different declarations are independent.
  - Any discrete Bayesian network can be represented. The paper argues it is "better to invent new hypotheses to explain
    dependence".
  - The covering assumption is that the rules list all causes. If they do not, add a hypothesis "a is true for some other
    reason". This is an explicit **catch-all** that keeps the bad-lot problem visible.
  - Many logically possible diagnoses are too unlikely to be worth generating. Removing low-prior possibilities a priori is
    risky because "the unlikely occurrence" may be the truth.
  - Under the stated assumptions, minimal explanations are mutually exclusive, so their probabilities add up.
- Principle:
  - Give each need-hypothesis group an explicit "other / none of these" member.
  - Represent mutually exclusive need variants as one disjoint declaration (for example, the espresso-style variants).
  - Rank explanations by probability *when* probabilities exist.
  - Prune for generation but never for exclusion.
- Limits: independence and covering assumptions, and calibrated priors that PEE does not have. Inventing hidden
  hypotheses to model dependence adds representational burden.

### 9. Kakas, A. C., Kowalski, R. A. & Toni, F. (1992). "Abductive logic programming". *Journal of Logic and Computation* 2(6), 719–770

- DOI: 10.1093/logcom/2.6.719 (Crossref-checked).
- Status: **abstract read** for the 1992 paper. **Full text read** of the authors' updated survey, Kakas, Kowalski & Toni,
  "The Role of Abduction in Logic Programming" (preprint: https://www.doc.ic.ac.uk/~rak/papers/mod-survey.pdf; it states
  that it updates the 1992 paper).
- Key concepts (from the updated survey):
  - The abductive task is to find Δ such that T ∪ Δ ⊨ G and T ∪ Δ is consistent. This is too weak on its own, so Δ is
    restricted to pre-specified **abducible** predicates, so that explanations name *causes*, not other effects.
  - An abductive framework is a triple ⟨T, A, I⟩: theory, abducibles, **integrity constraints**. Integrity constraints
    reject explanations, replacing the plain consistency check.
  - Explanations should be *basic* (not explainable by other explanations) and *minimal* (not subsumed by another
    explanation).
  - The existence of multiple explanations "is a general characteristic", and the selection of preferred explanations is
    an important problem.
  - Ways to discriminate between explanations:
    - "crucial literals", whose testing rejects one of two incompatible explanations;
    - *corroboration*, where an explanation fails if its predicted consequences are not observed;
    - Sergot's approach of obtaining information **from the user during query evaluation**;
    - domain-specific preference orders.
  - Abduction is non-monotonic: new information can make an explanation inconsistent. The survey also links abduction to
    truth maintenance (JTMS/ATMS).
- Principle:
  - Declare which predicates are abducible (the need vocabulary) and which are integrity constraints, for example "a
    hypothesised need can never contradict an explicit statement".
  - Use crucial literals to choose what to ask: the observation that would refute one of two rival needs.
- Limits: logic-programming machinery; no account of graded uncertainty without extensions.

### 10. de Kleer, J. (1986). "An assumption-based TMS". *Artificial Intelligence* 28(2), 127–162

- DOI: 10.1016/0004-3702(86)90080-9 (Crossref-checked). PDF: https://www.dekleer.org/Publications/An%20Assumption-Based%20TMS.pdf
- Status: **full text read** (abstract, introduction and sections on labels, environments and nogoods).
- Key concepts:
  - Every datum is labelled with the sets of assumptions (environments) under which it holds. Many contexts are therefore
    represented **simultaneously**: "context switching is free", and most backtracking and all retraction are avoided.
  - A label must be **consistent, sound, complete and minimal** with respect to the justifications.
  - An inconsistent environment is a **nogood**. Every superset of a nogood is also nogood, so a contradiction "merely
    indicates that a specific set of assumptions is inconsistent".
  - The architecture is suited to tasks where "a reasonable fraction of the potential solutions must be explored"; its
    analysis "is inherently ambiguous, and thus multiple solutions are produced".
  - Cost: with n assumptions there are up to 2^n environments. The ATMS finds all solutions, and extra control is needed
    to make it find fewer.
- Principle: keep each need-hypothesis as an **assumption**. Label every downstream conclusion (a feature relevance, a
  ranking adjustment, a warning) with the set of need-assumptions it depends on. Record incompatible need pairs as
  nogoods. Then:
  - the adviser can show "if you are a light sleeper → X; if not → Y" without recomputing;
  - retracting a need after the user answers is a label lookup, not a re-run;
  - provenance ("why was this inferred?") comes for free.
- Limits: exponential worst case. The ATMS stores no preferences or probabilities, so it must be paired with a selection
  mechanism.
- Failure modes: label explosion when many independent weak assumptions are allowed. Mitigate by capping the number of
  active assumptions per conversation and by focusing (de Kleer's later work on focusing is [unverified] here).

### 11. Doyle, J. (1979). "A truth maintenance system". *Artificial Intelligence* 12(3), 231–272

- DOI: 10.1016/0004-3702(79)90008-0 (resolved via Semantic Scholar; MIT handle http://hdl.handle.net/1721.1/5733 for the
  memo version).
- Status: **abstract read** (via aggregator and Semantic Scholar summaries).
- Key concepts:
  - A TMS records the **reasons** (justifications) for program beliefs, so that beliefs can be revised when assumptions
    fail.
  - Dependency-directed backtracking changes the current set of assumptions when a contradiction is found.
  - Explanations of beliefs are summarised from the recorded reasons.
  - Single current context: the justification-based TMS (JTMS), in contrast with the ATMS.
- Principle: every inferred need must carry its **justification record** (cue → rule → need). Withdrawing a premise
  withdraws its consequences automatically.
- Limits: one context at a time. Exploring alternatives requires backtracking, which is why de Kleer's ATMS fits
  coexisting hypotheses better.

---

## Part 2 — Defeasible reasoning and argumentation

### 12. Dung, P. M. (1995). "On the acceptability of arguments and its fundamental role in nonmonotonic reasoning, logic programming and n-person games". *Artificial Intelligence* 77(2), 321–357

- DOI: 10.1016/0004-3702(94)00041-X (Crossref-checked). PDF: https://cse-robotics.engr.tamu.edu/dshell/cs631/papers/dung95acceptability.pdf
- Status: **full text read** (definitions, sections 2–3).
- Key concepts:
  - An argumentation framework is a set of arguments and an *attack* relation; arguments are abstract.
  - A set is *conflict-free* if no member attacks another. It is *admissible* if it is conflict-free and defends each
    member against every attacker.
  - Semantics:
    - **preferred** extension: a maximal admissible set (credulous);
    - **grounded** extension: the least fixpoint (sceptical);
    - **stable** extension: conflict-free and attacks everything outside it.
  - Many non-monotonic logics and logic-programming semantics are special cases of the framework.
  - Credulous acceptance means in *some* preferred extension. Sceptical acceptance means in all of them, or in the
    grounded extension.
- Principle (status mapping): treat each need-hypothesis as an argument, and each critical question or contrary cue as an
  attacking argument. Then:
  - a need **in the grounded extension** is sceptically accepted, a candidate for "assert" (still subject to the
    confidence rules);
  - a need **in some but not all preferred extensions** is credulously accepted, so "suggest" or "ask";
  - a need **in no extension** is defeated.
  Competing hypotheses coexist as alternative preferred extensions.
- Limits: abstract. It says nothing about where arguments and attacks come from, nor about strengths or preferences.
  Computing preferred extensions is intractable in general [unverified complexity detail; well-known in the literature].

### 13. Modgil, S. & Prakken, H. (2013). "A general account of argumentation with preferences". *Artificial Intelligence* 195, 361–397

- DOI: 10.1016/j.artint.2012.10.008 (Crossref-checked); preprint arXiv:1804.06763.
- Status: **abstract read**.
- Key concepts: builds on ASPIC+ to give a general framework for argumentation with preferences. It revises the
  definition of conflict-free sets and accommodates a broader range of instantiating logics.
- Principle: preferences (for example, specificity, or explicit statement over inferred need) decide which *attacks*
  succeed as *defeats*. They are not a separate scoring layer.

### 14. Modgil, S. & Prakken, H. (2014). "The ASPIC+ framework for structured argumentation: a tutorial". *Argument & Computation* 5(1), 31–62

- DOI: 10.1080/19462166.2013.869766. Preprint: http://hdl.handle.net/1874/304259
- Status: **full text read** (preprint; sections 2–3 and the section on argument schemes).
- Key concepts:
  - Arguments are built from **strict** rules (deductive) and **defeasible** rules ("only create a presumption in favour of
    their conclusion"), from *axiom* premises (unattackable) and *ordinary* premises (attackable).
  - There are three attack types:
    - **undermining**: attack an ordinary premise;
    - **rebutting**: attack the conclusion of a defeasible inference;
    - **undercutting**: deny that a defeasible rule applies, via its name n(r).
  - Preferences turn attacks into defeats. Dung semantics then evaluate the result.
  - Well-defined instantiations satisfy the Caminada–Amgoud *rationality postulates*: closure and consistency.
  - Argument schemes are formalised by treating schemes as defeasible inference rules, and "critical questions as pointers
    to counterarguments" (underminers, rebutters, undercutters).
- Principle (direct design): each need-inference rule ("bedroom + light sleeper ⇒ quiet-night-operation need") is a
  **named defeasible rule**. Then:
  - its cue premises are ordinary premises: the cue may have been misread, so it can be undermined;
  - a contrary statement ("noise doesn't bother me") rebuts;
  - an exception ("it will run only while I'm out") undercuts, because the rule does not apply;
  - the shopper's explicit statements are axioms, which an inference can never override.
- Limits: modelling effort. Preference orderings must be supplied. Getting the rationality postulates right needs care
  with contraposition and closure.

### 15. Walton, D., Reed, C. & Macagno, F. (2008). *Argumentation Schemes*. Cambridge University Press

- DOI: 10.1017/CBO9780511802034 (from a library catalogue record; not Crossref-checked). ISBN 978-0-521-72374-9 (pb),
  978-0-521-89790-7 (hb).
- Status: **secondary source only** (metadata and reviews; the compendium itself was not read).
- Key concepts (secondary): a systematic compendium of presumptive argument schemes (sources disagree on the count), each
  with critical questions, in a notation meant for computational use. A review notes that schemes are supplanting the
  traditional fallacies as tools for analysing informal argument.
- Argument from (positive/negative) consequences: **secondary source only**. A reproduced version in an AI handbook
  (arXiv:2212.07996) and a patent document give the scheme "if A is brought about, good consequences will plausibly
  occur; therefore A should be brought about", with these critical questions:
  - How strong is the likelihood that the cited consequences will occur?
  - What evidence supports the claim?
  - Are there consequences of the opposite value that should be taken into account?
- Caveat (secondary): Pinto argues that many critical questions have heuristic rather than normative force, and so may
  not shift the burden of proof as Walton claims.

### 16. Walton, D. N. (1996). *Argumentation Schemes for Presumptive Reasoning*. Lawrence Erlbaum. Practical reasoning (argument from goal)

- Status: **secondary source only**. The scheme and questions were read verbatim as quoted in Atkinson et al. 2006
  (source 17, full text).
- Key concepts:
  - W1 (necessary condition): G is a goal for agent a; doing A is *necessary* for a to carry out G; therefore a ought to
    do A.
  - W2 (sufficient condition): the same with *sufficient*.
  - Critical questions:
    - CQ1: Are there alternative ways of realising goal G?
    - CQ2: Is it possible to do action A?
    - CQ3: Does agent a have goals other than G which should be taken into account?
    - CQ4: Are there other consequences of doing action A which should be taken into account?
  - Practical reasoning is presumptive: the presumption stands only if the critical questions posed are answered
    satisfactorily. Because the challenges are open-ended, "discussion can always be re-opened".
- Principle: when PEE turns a need into a *recommendation*, the need → feature step is practical reasoning. Each
  recommended feature must survive the four questions:
  - CQ1: is there another feature that satisfies the need?
  - CQ2: is it available within the constraints?
  - CQ3: does it conflict with other needs, such as price or size?
  - CQ4: side effects (a quiet mode that halves dehumidification rate).
- Failure mode: treating the presumption as a conclusion, so that the critical questions are never posed.

### 17. Atkinson, K., Bench-Capon, T. & McBurney, P. (2006). "Computational representation of practical argument". *Synthese* 152, 157–206

- DOI: 10.1007/s11229-005-3488-2 (Crossref-checked). PDF: https://cgi.csc.liv.ac.uk/~katie/synthese06.pdf
- Status: **full text read** (sections 1–2.3).
- Key concepts:
  - Practical reasoning is a presumptive justification of an action plus critical questions; the paper builds on Walton.
  - Walton's "goal" is split into **state** S, **goal** G and **value** V: "Agent a wishes to achieve state S so as to
    bring about goal G which promotes a value V."
  - This gives sixteen critical questions. Answers to CQ1 differ depending on whether the shopper wants a state, a goal or
    a value.
  - Values explain rational disagreement: two people may agree on a goal for different reasons. The paper also gives a
    dialogue protocol (PARMA) and a BDI implementation.
- Principle: represent a need at the right level. For "espresso like an Italian bar":
  - the **state** is a short, concentrated shot with crema;
  - the **goal** is café-quality espresso at home;
  - the **value** is authenticity or ritual.
  Alternatives and questions differ by level, so ask at the level that discriminates.
- Limits: designed for persuasion dialogues between agents. The sixteen questions are heavy for a consumer interaction
  and need selection.

### 18. Nute, D. (1994). "Defeasible logic". In Gabbay, Hogger & Robinson (eds.), *Handbook of Logic in Artificial Intelligence and Logic Programming*, vol. 3, Oxford University Press, pp. 353–395

- URL: https://academic.oup.com/book/53007/chapter/421965116 (OUP record).
- Status: **secondary source only**. The structure was confirmed via Wikipedia and the Antoniou et al. papers; the
  chapter was not read.
- Key concepts:
  - **strict rules** are classical;
  - **defeasible rules** hold typically and can be defeated by contrary evidence;
  - **defeaters** only block conclusions and never support any;
  - an acyclic **superiority relation** between rules resolves conflicts.
  - The logic is sceptical: conflicting conclusions with no superiority both stay unproven.
- Principle:
  - Defeaters are exactly what PEE needs for the "never exclude on a hypothesis" rule. A cue such as "it's for the garage"
    can *block* the quiet-night need without asserting the opposite.
  - Superiority encodes "explicit statement > specific inference > generic inference".
- Related: Maher, M. J. (2001), "Propositional defeasible logic has linear complexity", *Theory and Practice of Logic
  Programming* 1(6); arXiv:cs/0405090. **Abstract read**: inference in propositional defeasible logic runs in linear
  time, unlike most propositional non-monotonic logics. This makes defeasible logic a cheap, auditable core for a
  symbolic adviser.
- Limits: no graded uncertainty. Its sceptical semantics loses credulous alternatives, so pair it with ATMS-style labels
  or preferred extensions to keep the alternatives visible.

---

## Part 3 — Abduction for (latent) needs and in design

### 19. Bruggeman, R., Ciliotta Chehade, E. & Ciuccarelli, P. (2023). "Expanding user need finding through abductive reasoning". In *Proceedings of the International Conference on Engineering Design (ICED23)*, Bordeaux, 24–28 July 2023. *Proceedings of the Design Society* (Cambridge University Press), pp. 1745–1754

- DOI: **10.1017/pds.2023.175** (printed on the paper). Open copy: NSF PAR https://par.nsf.gov/servlets/purl/10590701.
  Design Society page: https://iced23.designsociety.org/publication/46383/Expanding+user+need+finding+through+abductive+reasoning
- Status: **full text read** (whole paper, 10 pp., Northeastern University; NSF grant 2050052).
- **Found and verified**: the authors, title, venue and DOI match the owner's citation. The owner's description ("abductive
  reasoning to discover latent needs using domain knowledge") is accurate in outline. The "domain knowledge" is
  *design knowledge* held by a human designer.
- What it actually proposes:
  - Traditional latent-need methods are framed as **deductive**: A ∪ F ⊢ Th, from an axiom (the users' use of the
    product) and facts (for example, lead-user data) to a theory of the need. Each method covers one "dimension": the
    accessibility of user information, its source (general vs lead users), or its handling procedure (manual vs
    automated, emotional vs rational needs). So each yields only a "latent need attribute".
  - Abduction (Peirce/March, formalised after Tomiyama et al. 2003) has the designer combine deduced theories with their
    own **design knowledge K** to conjecture new facts, by semantic consequence ⊨. When one method's output is judged
    inadequate, another method's theories are integrated, recursively, until "a latent need is isolated".
  - Worked example (shoes): users spend time putting on shoes, and lead users slip shoes on. The deduced theory is "laces
    are a burden", and the abduced need is "the lacing system is a burden on time for users and needs to be less
    burdensome".
  - It claims "soundness" (A ⊨ Th(K) when A ⊢ Th) and "completeness" (the converse) of the abductive approach. These are
    argued informally and are not proved in a formal-logic sense.
  - The designer must first build a "preliminary user model" from design knowledge, then validate the deduced theories
    against it iteratively.
- Empirical validation: **none**. It is explicitly a theoretical development ("This theoretical development shows...").
  The paper suggests think-aloud protocols for future assessment. Future work is to model designer knowledge
  computationally so that systems can "abduce the latent need".
- Principle for PEE:
  - Latent needs come from **combining several weak, typed evidence sources with domain knowledge**, not from one cue →
    one need deduction. Multiple dimensions (situation of use, user type, emotional vs rational) should each contribute.
  - Validation of a conjectured need is iterative.
  - This supports keeping several partial need-attributes and synthesising them, rather than capping at one inference.
- Limits and caveats:
  - No algorithm, no selection criteria, no treatment of uncertainty or of when to stop.
  - The logical notation is loose: the formulae lost characters in extraction, and the soundness and completeness claims
    are argumentative.
  - The "domain knowledge" is a human designer's tacit knowledge, not a typed knowledge base.
  - The setting is product *design* (finding needs of a user population), not advising an individual shopper.
- Follow-up by the same group, which partly addresses the validation gap: Bruggeman, R., Ciliotta Chehade, E., Marion, T.
  & Ciuccarelli, P. (2025). "Probabilistic methods for evaluating human and LLMs during design problem-solving".
  *Proceedings of the Design Society* 5 (ICED25), pp. 2651–2660. DOI 10.1017/pds.2025.10279. Status: **full text read
  via a tool summary of the Cambridge core-reader page** (numbers to be rechecked against the PDF).
  - Data: online shoe reviews annotated by a sentiment model. Participants: 10 UX researchers in two protocol groups,
    workshops with 30 designers, and a survey of 43 participants. Compared with GPT-4o and a prompted GPT-4o.
  - Soundness is a proxy: annotation-usage consistency. Completeness is a proxy: the variance of latency rankings.
  - Humans used more user opinions and covered more of the need space. The LLMs produced "narrower, categorically
    constrained needs".
  - The abductive component appears as a conditional-probability term in a transition model whose combining function is
    left unspecified. Groups are very small, and there is no ground-truth latent need.
- Closest other verified work on computational latent-need elicitation: Zhou, F., Jiao, R. J. & Linsey, J. S. (2015).
  "Latent customer needs elicitation by use case analogical reasoning from sentiment analysis of online product reviews".
  *Journal of Mechanical Design* 137(7). DOI 10.1115/1.4030159. Status: **abstract read** (via Peeref; the authors as
  cited in source 19's reference list).
  - Layer 1: sentiment prediction with fuzzy SVMs over affective lexicons.
  - Layer 2: use-case analogical reasoning with case-based reasoning (retrieval and adaptation) to infer implicit
    characteristics of latent needs.
  - Case study: Kindle Fire HD 7".

### 20. Dorst, K. (2011). "The core of 'design thinking' and its application". *Design Studies* 32(6), 521–532

- DOI: 10.1016/j.destud.2011.07.006 (from the UTS repository record).
- Status: **abstract read**. **Could not verify** the full definitions of abduction-1 and abduction-2 in the paper's own
  text, because the paper is closed access.
- Key concepts:
  - The abstract considers "the fundamental reasoning pattern behind design", then "the core design practices of framing
    and frame creation".
  - Per secondary sources: design reasoning is framed as "WHAT + HOW → VALUE". **Abduction-1** is closed problem
    solving: the working principle (HOW) and the aspired value are known, and the WHAT is sought.
  - [unverified, from background knowledge] **Abduction-2** is open problem solving: only the VALUE is known, and the HOW
    (a frame or working principle) and the WHAT must be created together.
- Principle: a buying adviser mostly does abduction-1. The shopper's value ("quiet sleep") is known or hypothesised,
  working principles (low-noise mode, inverter compressor) are domain knowledge, and the WHAT is a product. When the value
  itself is uncertain, the adviser is in "framing" territory and should **ask**, not choose a frame silently.
- Limits: a conceptual design-theory paper with no empirical test of the reasoning pattern.

### 21. Roozenburg, N. F. M. (1993). "On the pattern of reasoning in innovative design". *Design Studies* 14(1), 4–18

- Status: **secondary source only** (citation from an AI EDAM reference list; content from Koskela et al. and other
  secondary summaries). DOI not verified.
- Key concepts (secondary):
  - **Explanatory abduction** (Peirce/March) suits diagnosis and troubleshooting: the rule is known and the case is
    inferred.
  - **Innovative abduction** is where the rule itself is not known and must be inferred together with the presumed
    reason. Roozenburg and Eekels later coined "innoduction".
- Principle: PEE's need inference is *explanatory* abduction over known typed rules. When no rule in the knowledge base
  links the cue to a need, the system should **not invent one at query time**. It should say "unknown" and log a
  knowledge gap for offline teaching.
- Limits: design theory and conceptual.

### 22. Kolko, J. (2010). "Abductive thinking and sensemaking: the drivers of design synthesis". *Design Issues* 26(1), 15–28

- DOI: 10.1162/desi.2010.26.1.15 (as cited in source 19's reference list).
- Status: **secondary source only**. The open copy required a login, and I did not use an unofficial mirror.
- Key concepts (secondary): design synthesis is sensemaking that brings order to complexity. It is often done privately,
  so it looks "magical" to clients. Abduction is the "best guess" inference that produces new knowledge, in contrast to
  deduction and induction.
- Principle: make synthesis **externalised and inspectable**. Every abductive step should be recorded, which is PEE's
  "record why each inference was made".
- Limits: a practitioner-oriented essay with no empirical validation.

---

## Part 4 — When to ask instead of assume: value of information and abstention

### 23. Howard, R. A. (1966). "Information value theory". *IEEE Transactions on Systems Science and Cybernetics* 2(1), 22–26

- DOI: 10.1109/TSSC.1966.300074 (Crossref-checked metadata: title, author, volume, issue and pages).
- Status: **secondary source only** for content (paywalled).
- Key concepts (secondary):
  - The value of information is the most a decision-maker should pay to know an uncertain quantity *before* deciding. This
    is the "value of clairvoyance", or expected value of perfect information (EVPI).
  - Illustrated by a bidding example (secondary description).
  - EVPI is non-negative and an upper bound on the value of any imperfect information.
- Principle: ask the shopper about a hypothesised need only when the answer could **change the recommendation** enough to
  be worth the cost of the question (friction, attention). If every plausible answer leads to the same shortlist, do not
  ask.
- Limits: needs a utility model and probabilities over answers. A symbolic adviser can approximate it qualitatively: does
  the hypothesis change the shortlist or ranking? By how much? For how many candidates?

### 24. Rao, S. & Daumé III, H. (2018). "Learning to ask good questions: Ranking clarification questions using neural expected value of perfect information". *Proceedings of ACL 2018* (Long Papers), pp. 2737–2746

- DOI: 10.18653/v1/P18-1255. URL: https://aclanthology.org/P18-1255/
- Status: **full text read** (method sections).
- Key concepts:
  - "a good question is one whose expected answer will be useful".
  - EVPI(q | p) = Σ over answers of P(a | p, q) · U(p + a), where U(p + a) is the utility of the post once updated with
    the answer.
  - Candidate questions are ranked by expected utility. An answer model and a utility calculator are learned jointly from
    77K StackExchange posts in three domains.
  - Evaluated against expert judgments on 500 samples, with significant improvement over baselines.
- Principle: a symbolic analogue for PEE. Generate the candidate questions from the open hypotheses' critical questions.
  For each, estimate:
  1. the plausible answers (from the knowledge base);
  2. how much each answer would change the shortlist (utility);
  3. how likely each answer is.
  Ask the top one, or none if all are near zero.
- Limits: neural and data-hungry. The utility is learned from a proxy (post edits). It does not transfer directly to a
  symbolic, non-LLM query-time system, though the decision structure does.

### 25. Chow, C. K. (1970). "On optimum recognition error and reject tradeoff". *IEEE Transactions on Information Theory* 16(1), 41–46

- DOI: 10.1109/TIT.1970.1054406 (Crossref-checked).
- Status: **abstract read** (via the IBM publication page summary and later citing papers).
- Key concepts:
  - An optimum *rejection rule*: abstain when the best posterior is below a threshold.
  - The error and reject rates trade off, and the error rate can be computed from the reject function. The slope of the
    error–reject curve equals the threshold (per a citing paper).
  - A later paper notes that Chow's rule is not optimal when the posterior estimates are themselves erroneous.
- Principle: asserting a need is a classification with a **reject option**. The threshold for asserting should rise with
  the cost of being wrong (compare Josephson's "costs of being wrong").
- Limits: needs calibrated posteriors, which PEE does not have. Use ordinal tiers instead.

### 26. El-Yaniv, R. & Wiener, Y. (2010). "On the foundations of noise-free selective classification". *Journal of Machine Learning Research* 11, 1605–1641

- URL: https://jmlr.org/papers/v11/el-yaniv10a.html
- Status: **abstract read**.
- Key concepts: selective classification trades **coverage** for lower **risk** (the risk–coverage trade-off). The paper
  characterises achievable risk–coverage trade-offs in the noise-free setting.
- Principle: report both how often PEE asserts a need (coverage) and how often the asserted needs are wrong (selective
  risk). The current one-inference cap fixes coverage arbitrarily instead of choosing it on a risk–coverage curve.
- Limits: a theoretical, noise-free setting.

---

## Verification tally

| Status | Count | Sources |
|---|---|---|
| full text read | 11 | 1 SEP Abduction (+ Peirce supplement); 3 Josephson 1989; 8 Poole 1993; 9 Kakas–Kowalski–Toni updated survey (for ALP); 10 de Kleer 1986; 12 Dung 1995; 14 Modgil & Prakken 2014; 17 Atkinson et al. 2006; 19 Bruggeman et al. 2023; 19b Bruggeman et al. 2025 (via tool summary); 24 Rao & Daumé 2018 |
| abstract read | 11 | 4 Josephson 2001; 5 Bylander et al. 1991; 7 Poole 1988 (+ Theorist page); 9 KKT 1992; 11 Doyle 1979; 13 Modgil & Prakken 2013; 18b Maher 2001; 19c Zhou, Jiao & Linsey 2015; 20 Dorst 2011; 25 Chow 1970; 26 El-Yaniv & Wiener 2010 |
| secondary source only | 8 | 2 Josephson & Josephson 1994 (book text); 6 Peng & Reggia 1990; 15 Walton, Reed & Macagno 2008 (and the argument-from-consequences questions); 16 Walton 1996 (questions verbatim via source 17); 18 Nute 1994; 21 Roozenburg 1993; 22 Kolko 2010; 23 Howard 1966 |
| could not verify (specific claims) | 3 claims | the exact Josephson & Josephson wording of "coverage, plausibility, parsimony, consistency"; Dorst's abduction-2 definition in his own text; the precise tractable class in Bylander et al. |

Total distinct sources: 30.

---

## Synthesis

### (1) An implementable hypothesis-management pattern for a symbolic needs adviser

**Representation.** A need hypothesis is a record:

```
Hypothesis {
  id
  need            : typed need from the vocabulary (an abducible; Poole / KKT)
  level           : state | goal | value (Atkinson et al.)
  group           : disjoint-declaration id; members are mutually exclusive variants, plus an explicit
                    "other/none" member (Poole 1993)
  support         : [ { cue (verbatim span of the shopper's words or a structured fact),
                        rule_id (named defeasible rule, ASPIC+ n(r)),
                        domain_knowledge_refs } ]       -- the justification (Doyle); several cues = consilience (Josephson 1989)
  assumptions     : set of assumption ids this hypothesis rests on (ATMS environment; de Kleer)
  covers          : which cues it explains (Peng & Reggia, Josephson)
  defeaters       : [ { critical_question_id, kind: undermine | rebut | undercut, state: open | answered-for | answered-against } ]
  incompatible_with : hypothesis ids (nogoods)
  tier            : essential | clear_best | weak_best | candidate (Josephson 1989)
  status          : asserted | suggested | to_ask | unknown | defeated   (see (2))
  licenses        : what downstream modules may do with it (see (2))
  provenance      : rule version, knowledge-store version, timestamp
}
```

**Generation (abduction, bounded).**

- Fire only **named rules** from the typed knowledge (explanatory abduction; Roozenburg). Never invent rules at query
  time.
- For each cue, collect *all* rules that would make it "a matter of course" (Peirce). Do not stop at the first one.
- Every group carries an explicit "other reason / none" alternative (Poole), so the bad lot stays visible (Douven /
  van Fraassen).

**Coexistence.** Use one of two mechanisms:

- **ATMS-style**: each hypothesis is an assumption. Each downstream conclusion carries a label (minimal sets of
  need-assumptions), and incompatible needs are nogoods. The adviser can then present conditional advice ("if quiet
  operation at night matters → A, B; if not → C also qualifies") and retract on an answer without recomputing (de Kleer).
- **Argumentation**: hypotheses are ASPIC+ arguments. Critical questions are attackers (undermine the cue, rebut the
  need, undercut the rule), and explicit statements are axiom premises with top priority. Compute the grounded extension
  (sceptical) and, where cheap, the preferred extensions (credulous). Competing needs show up as alternative extensions
  (Dung; Modgil & Prakken).

A practical combination: a **defeasible-logic core** (linear time; Maher), with superiority "explicit > specific >
generic" and defeaters for blocking cues, plus **ATMS-style labels** on recommendation effects to keep the alternatives.

**Selection criteria (ordinal, auditable; no global optimisation, because of Bylander et al.).**

1. **Consistency / integrity**: the hypothesis contradicts no explicit statement or hard constraint (KKT integrity
   constraints). A violation means it is defeated.
2. **Explanatory coverage**: the number of independent cues it explains. Count only cues with distinct sources, to avoid
   double counting (Josephson's convergence).
3. **Specificity**: the more specific rule beats the generic one (defeasible-logic superiority).
4. **Plausibility**: the prior plausibility tier of the rule as taught in the knowledge base. Use ordinal levels, not
   fake probabilities.
5. **Margin over rivals in the same group**: Essential (the only explanation), Clear Best (no rival near), Weak Best
   (ahead but not decisively).
6. **Parsimony as irredundancy only**: drop a hypothesis that explains nothing not already explained. Do **not** impose
   minimum cardinality, because shoppers have several needs at once (Peng & Reggia, with caveat).

This replaces the "one inference per request" cap with a cap per *group* (the best member) plus irredundancy across
groups.

**When to ask (value of information, qualitative EVPI).** For each open hypothesis h with tier in {clear_best, weak_best,
candidate}, compute:

- *impact(h)*: does accepting or rejecting h change the shortlist, the ranking order of the top-k, or a warning? Measure it
  by re-running the decision layer under both labels; the ATMS makes this cheap.
- *uncertainty(h)*: the tier, and the number of open critical questions.
- *stakes(h)*: the cost of being wrong (Josephson). This is high when acting on h would drop or demote many products, or
  when h concerns safety or allergy.

Ask the question that maximises impact × uncertainty × stakes (Rao & Daumé's EVPI, approximated). Prefer a *crucial
literal*: the question whose answer refutes one of two rival needs (KKT). Ask at the discriminating level: state, goal or
value (Atkinson). Ask nothing when every answer leads to the same advice (Howard: zero value of information). Limit
questions per turn: one or two, the highest first.

### (2) Epistemic statuses for an inferred need and what each licenses

| Status | When | Licenses downstream | Never licenses |
|---|---|---|---|
| **asserted** | The shopper stated it, or it was confirmed by an answer. An inferred need may reach this status only if it is Essential or Clear Best, has no open critical question that matters, and sits in the grounded extension. Even then, label it "inferred" in the explanation. | Weighting criteria in ranking; explanatory text ("because you said…"); hard constraints **only if the shopper stated or confirmed them** | Exclusion based on an inference the shopper did not confirm |
| **suggested** | Clear Best or Weak Best; credulously accepted (in some preferred extension); low stakes | Soft re-ranking with a visible reason; a "you might care about…" note; showing the relevant spec (for example, night-mode dB) | Hard filtering; hiding products; strong claims |
| **to_ask** | Rival hypotheses are close, or stakes are high, and the value-of-information test says the answer would change the advice | Emitting a question (the crucial literal); conditional presentation ("if X… / if not…") | Acting as if answered |
| **unknown** | No rule fires, or only the catch-all "other / none" fits, or the cues are too weak | Logging a knowledge gap for offline teaching; neutral treatment | Inventing a need; guessing silently |
| **defeated** | Contradicted by an explicit statement (rebut), a blocking cue (defeater or undercut), or an integrity constraint | Recording why it was considered and why it was dropped; not resurrecting it unless the defeater is withdrawn | Any influence on ranking |

Invariant (from the brief, supported by the sources): **no unconfirmed hypothesis ever produces an exclusion.**

- Peirce and Douven: abduction yields candidates worth pursuing.
- Josephson: Weak Bests are guesses.
- Poole: low-probability possibilities may be true.

Only shopper statements or confirmations (axiom premises) may become hard constraints. Every status change is logged
with its justification (Doyle), its label (de Kleer) and the critical question answered.

### (3) Known pitfalls

1. **Best of a bad lot**: the need vocabulary bounds what can be inferred. Mitigate with explicit "other / none" members
   and "unknown" status, and by logging uncovered cues (Douven; Poole).
2. **Cap-at-one (current prototype) vs. explosion**: one inference per request hides genuine co-occurring needs. Unlimited
   assumptions make labels explode (de Kleer: 2^n) and global best-explanation search is NP-hard (Bylander et al.). Use
   per-group selection, irredundancy and a small active-assumption budget instead.
3. **Over-parsimony**: minimum-cardinality covers suppress real multiple needs (Peng & Reggia, caveat).
4. **Double-counting non-independent cues**: "bedroom" and "at night" may both stem from one fact. Consilience requires
   independent lines (Josephson 1989).
5. **Presumption treated as conclusion**: critical questions never posed (Walton). Each rule must carry its critical
   questions as explicit attackers (ASPIC+ tutorial).
6. **Hypothesis leaking into hard filters**: an unconfirmed need used to exclude products. This needs a code-level
   invariant and a test.
7. **Fake precision**: inventing probabilities to rank needs without calibration (Chow's rule fails when posteriors are
   wrong). Prefer ordinal tiers and margins.
8. **Asking too much or too little**: questions with no decision impact annoy the shopper (zero VoI). Silent guessing on
   high-stakes needs violates "costs of being wrong" (Howard; Josephson).
9. **Wrong level of need**: confusing state, goal and value leads to wrong alternatives and wrong questions (Atkinson et
   al.).
10. **Query-time invention**: generating new need rules on the fly (innovative abduction) in a system meant to be
    symbolic and auditable. Route such gaps to offline teaching (Roozenburg; Bruggeman et al.'s call for computational
    designer knowledge is a research agenda, not a validated method).
11. **Over-reading Bruggeman et al. 2023**: it is a theoretical argument with no empirical validation and no selection
    or uncertainty mechanism. It motivates multi-source synthesis of needs but cannot be cited as evidence that a
    particular abductive procedure works. The 2025 follow-up has very small samples and proxy metrics.
12. **Sceptical-only semantics hides alternatives**: grounded or defeasible-logic conclusions drop credulous options. Keep
    preferred extensions or ATMS labels so that "suggested" and "to ask" items are not lost (Dung; Nute).
