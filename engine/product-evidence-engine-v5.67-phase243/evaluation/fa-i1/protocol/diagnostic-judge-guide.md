# FA-I1 — Diagnostic judge guide (role D)

For each diagnostic case you receive: the case (sources, request, expected allowed and forbidden conclusions, written by an
independent author blind to the rules), the km.2 encoding and request frame, and the conclusions the km.2 inference
program derived (predicates and their meaning in `evaluation/fa-i1/inference-v2.json`).
For every expected line decide:
- allowed line: `reached` | `reached_with_wrong_qualification` | `not_reached`;
- forbidden line: `avoided` | `derived` (the program concludes it, or concludes something that implies it).
For every failure give the `cause`: `rule` (the inference program), `schema` (the knowledge cannot be represented, so no
rule could decide), `encoding` (the encoding misrepresents the passages or the request), `case` (the case is ambiguous or
its expectation needs outside knowledge). Also list any derived conclusion that is wrong although no expected line covers
it (`unexpectedWrong`). Output `{"schema":"pee.fa-i1.diagnostic-judgement.v1","cases":[{"id":"D01","lines":[{"line":"...","kind":"allowed|forbidden","verdict":"...","cause":"none|rule|schema|encoding|case","why":"..."}],"unexpectedWrong":[]}]}`.
