# Phase202 — exact-model EPA registry candidate reconciliation

Cumulative base v5.25 Phase201. New `src/phase202_energy_star_registry_reconciliation.ts` is a bounded, deterministic **offline reconciliation** of an operator-supplied byte snapshot against the official EPA ENERGY STAR **Certified Room Air Cleaners V3.0** dataset scope (`gaa3-swy6`).

Source: https://data.energystar.gov/Active-Specifications/ENERGY-STAR-Certified-Room-Air-Cleaners-V3-0/gaa3-swy6 ; EPA API context: https://www.energystar.gov/products/spec/energy_star_api_user_essentials_pd . The registry lists energy-efficiency certification information, not professional sensory quality or tested outcome quality. Matching an untrusted snapshot never authenticates the current programme issuer and never authorizes a public badge, regardless of a matching SHA-256.

`reconcileRoomAirRegistry202` checks exact product model, brand, market, specification, source dataset, full-byte SHA-256, age and recorded possible disqualifications. Ambiguous/missing models are research outcomes, not failed products. Results do not persist review text or dataset rows. Partial API pages cannot prove exclusion. No network calls or new crawler added; Phase69/201 secure acquisition requires a separately specified and tested JSON response path and official issuer checks before production. Synthetic tests only, no issuer records authenticated by PEE.

YouTube research-only feasibility: `docs/phase202/YOUTUBE-EVIDENCE-FEASIBILITY.md`.
