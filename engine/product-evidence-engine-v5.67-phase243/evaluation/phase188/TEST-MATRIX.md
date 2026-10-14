# Phase188 synthetic adverse experiment map

These are code-level fixture checks, **not empirical evidence of improved recommendation accuracy**.

| Risk | Corresponding targeted test(s) |
|---|---|
| 1 duplicate experiment and editorial summary | 2, 3, 34 |
| 2 repeated websites pretending to be independent | 3, 16–18 |
| 3 expert observations vs measured technical field | 4, 5 |
| 4 manufacturer-only versus verified | 6 |
| 5 wrong variant / method / protocol | 8–14, 35 |
| 6 no original proof | 7, 28 |
| 7 changed scope must not borrow cached conclusion | 28–30 |
| 8 ranking inversion from candidate addition | Not implemented: future Phase181/Scikit-Criteria comparison |
| 9 sensitivity to preference ranges | Not implemented: requires reviewed policy intervals |
| 10 withdrawn source or reviewed revision invalidation | 23, 25, 26 |
| 11 new product, incomplete coverage | 7, 31; actual Phase182 search path unchanged |
| 12 genuine independent source disagreements | 4: mocked qualitative disagreement; real-case pilot still required |

Additional: provenance lineage cycles (20), editorials without sources (19), unsupported source stance (14–15), authenticity (22–24), deterministic input order (33).

**Coverage honesty:** 35 focused fixtures exercise implementation invariants but do not fulfill all 12 proposed real-world experiments. Unfulfilled rows are not claimed as passing.
