# Owner review of S78: release safety (2026-10-19), verbatim (English part)

Received after §15 of `docs/plans/r3-knowledge-translation.md`. Decision S79 in `decisions-and-supersessions.md`.
The Italian part (summary): improvements real but circumscribed (wrong attributions 5 and 14 remain; results on
examined data; no demonstrated generalisation); ra.2 is the default and also authorises two pairs ra.1 blocked, with a
shadow on hypothetical dimensions, not real signed catalogs; caveats' wording reaches user answers while scope and
conditions are stored but not checked when used; 12/16 relevant is not enough to show them as scientific information,
even labelled "not reviewed". No new LLM experiments, no new large architectural review; act only on these two issues.

S78 has delivered useful improvements, but my review of the code identified two release-safety issues.

1. ra.2 is already the default. Preserve its stricter safeguards, but keep the two newly authorised outcome–measurement paths from enabling rankings until their scientific sufficiency and real signed-catalog behaviour have been specifically validated. Do not restore the unsafe ra.1 behaviour.
2. Machine-translated, unreviewed scientific caveats can now appear in consumer-facing answers, although their scope and applicability conditions are not yet evaluated. Keep these caveats internal/shadow until their contextual applicability and factual relevance are adequately validated. A label saying "not reviewed" is not a substitute for validation.

Please resolve these two issues without disrupting the broader S78 improvements. Continue algorithmic refinement autonomously, measuring useful end-to-end gains rather than test counts or isolated benchmark improvements.

(Italian closing, summary): the engineering direction is right, the system's reliability is not yet; priority is to
consolidate what works, keep unvalidated knowledge from influencing users, and show progress on genuinely new data.
