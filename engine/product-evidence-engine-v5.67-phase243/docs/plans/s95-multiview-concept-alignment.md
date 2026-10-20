# S95 — Multi-view concept representation and symbolic second-stage alignment

**Roadmap step.** R3 (owner instruction "Procedi", 2026-10-20, on Claude's proposal after the owner's S94 review, verbatim
in `owner-research-s94-vectors-qualities-2026-10-20.md`). **R3 is not closed.** Shadow only; no store change, no new
dependency, no model.

## Outcome

On a new blind reference (228 never-used mentions, 6 categories, 20 identities), explicit multi-view concept
representations **do not identify concepts better than the lexical identifier**. They retrieve slightly better.

| First run (`evaluation/s95/align-s95-firstrun.json`) | Decided | Correct | Precision | Recall | Related promoted |
|---|---|---|---|---|---|
| Lexical identifier (cycle 2) | 29 | **5** | 17% | 25% | 14 |
| Type gate (S75) | 14 | 3 | 21% | 15% | 4 |
| S94 hybrid | 2 | 0 | — | 0% | 2 |
| **MV: multi-view retrieval + symbolic rerank** | 19 | 3 | 16% | 15% | 12 |
| MV, name and description views only | 15 | 3 | 20% | 15% | 9 |
| MV without the symbolic rerank | 43 | 6 | 14% | 30% | 23 |
| Lexical pick confirmed by MV | 14 | 3 | 21% | 15% | 7 |

**Retrieval (reference identities among each method's top 5):**
- multi-view 18 of 20;
- lexical 17;
- PPMI 15.

The S94 advantage of PPMI over lexical retrieval (11 against 8) **did not replicate**. The candidates are pooled, so an
identity no method retrieves is not in the reference.

**Stop rule (preregistered): met.** MV does not recover more identities than the lexical identifier. Multi-view identity
is recorded as **not demonstrated**.

## What was built (`src/knowledge_translation.ts` §9)

- **Concept views, derived at run time from existing knowledge** (MultiKE; I-ADOPT), not stored:
  - name and aliases;
  - the first sentence of the statement;
  - quantity kinds and metrics (QK typing);
  - object terms (name words that are not quantity words);
  - condition axes;
  - graph neighbours;
  - the property definitions the concept names.

  Coverage on 137 concepts (`view-coverage.json`):

  | View | Concepts |
  |---|---|
  | quantity | 76 |
  | object | 137 |
  | conditions | 12 |
  | relations | 120 |
  | linked to a property definition | 62 |

- **Retrieval:** the unweighted mean of the available view similarities (PPMI for text views).
- **Second stage (the BLINK principle, done symbolically):**
  - no quantity, property or object clash;
  - an anchor (it0: any shared word or object term; frozen it1: an alias, two shared name words or 60% of the name);
  - a margin over the next candidate.
- **Development:** the four examined references, 50 identities; two reformulations recorded in `freeze.json`. No rule
  over these signals separated identity from relatedness.

## Diagnosis (post hoc, first-run detail; not used to tune)

Of the 17 identities MV missed:
- 15 lack a strong lexical anchor: they are paraphrases;
- 6 are blocked as "different object";
- 3 are blocked by a property clash;
- 2 were never retrieved.

Of the 16 wrong identities, 12 are concepts the reference calls related.

What this means:
- **The derived object view is too crude.** "Name words that are not quantity words" mixes the object of interest,
  constraints and method words, so it blocks true identities. I-ADOPT's object and constraint cannot be recovered from a
  concept name alone; they have to be **stated** in the knowledge.
- **The identities are paraphrases.** Neither lexical anchors nor corpus PPMI similarity separates them from related
  concepts. This is the S75/S94 barrier, now confirmed on a larger reference (20 identities, 6 categories).
- **The concept graph is thin**, and conditions are typed for only 12 of 137 concepts. A multi-view method needs views
  that exist.

## What this changes

- Keep, shadow: the view derivation (it exposes which concepts lack quantity, object or condition structure); the
  multi-view retriever (best recall, 18 of 20).
- Not integrated: any multi-view identity rule.
- The owner's research direction is not refuted: S95 tested views **derived** from names and short statements, not a
  knowledge base whose concepts **state** their object, quantity and conditions. Building that structure is a knowledge
  task (the teaching translator or the owner packages), and the logical next test of MultiKE/OWL2Vec*.

## Files

- **Public:**
  - `evaluation/s95/`: preregistration, view coverage, freeze, seal, first run;
  - `scripts/s95-align.mjs`.
- **Private:**
  - `private-eval/r3/align/s95/`: input, retrieval pools, the six annotations, merged reference;
  - `private-eval/s95/`: development and first-run detail.
- **pee-knowledge:** a copy with its text hashed.
