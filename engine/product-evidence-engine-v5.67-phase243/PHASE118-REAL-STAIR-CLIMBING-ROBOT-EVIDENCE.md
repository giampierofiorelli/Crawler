# Phase 118 — Real original-source audit: robots that climb steps or stairs
**Product Evidence Engine v4.42 | 11 October 2026 | researched prototype, NOT a live shopping catalogue**

## User problem / semantic disambiguation

The Italian request *"Trovami i robot che sono in grado di salire gli scalini"* can mean two physically different tasks: crossing a low doorway/step, or progressing through multiple stair treads. For household robots, there is a third distinction: cleaning the stair treads themselves versus transporting a vacuum to the next floor. Treat these as separately evidenced operations, not synonyms of "stair climbing". Do not transfer a manufacturer's stacked-threshold number to a single step or a whole staircase. Whether devices are publicly purchasable is a fourth independent question.

## First-hand expert demonstrations of multiple stairs (NOT independent home trials)

| Device / system | Architecture | What was observed | What is NOT verified |
|---|---|---|---|
| **Roborock Saros Rover** | Integrated robotic vacuum with articulated wheel legs | **The Verge** directly saw the robot climb five exhibition stairs while vacuuming their treads at CES 2026. **Tom's Guide** independently observed ascents, descents and cleaning at IFA 2026. | Household safety, cleaning pickup %, real-world reliability, actual sale/release date. |
| **eufy MarsWalker** | Separate tracked carrier for a compatible vacuum (announced with Omni S2) | **TechRadar** saw the carrier bring the vacuum up and down exhibition stairs at IFA 2025. | Cleaning the treads. **eufy's own August 2026 guide expressly differentiates carrying from stair vacuuming.** Retail availability and household reliability unverified. |
| **Dreame Cyber X / QuadTrack** | Tracked stair carrier, separate from robot vacuum | **TechRadar** and **Vacuum Wars** covered a functioning exhibition demonstration in 2025. | Cleaning the individual stair treads; retail availability, compatibility and home reliability. Manufacturer's 25cm riser claim is not an independently measured household rating. |
| **MOVA Zeus 60** | Compact stepwise elevator-style carrier | **Vacuum Wars** covered IFA 2025 demonstration, described as more compact but slower-looking than tracked designs. | Actual time metrics; tread vacuuming; verified retail availability. |
| **MIGO Ascender** | Proposed integrated square-format stair-cleaning vacuum | Crowdfunding campaign promised stair climbing and tread cleaning. | **Not a shipped product**. Kickstarter displays that backers' pledges were refunded and the project was hidden indefinitely. Promises not validated as real-world consumer outcomes. |

Original sources:

1. The Verge, first-hand CES 2026 reporting on Rover (6 Jan 2026): https://www.theverge.com/tech/852121/roborock-saros-rover-stair-climbing-robot-vacuum-ces-2026
2. Tom's Guide, original Rover IFA 2026 report (3 Sep 2026): https://www.tomsguide.com/home/home-appliances/i-just-watched-a-robot-vacuum-actually-climb-stairs-it-took-3-minutes-but-those-steps-were-sparkling-after
3. TechRadar, original first-hand comparison of MarsWalker and Cyber X (5 Sep 2025): https://www.techradar.com/home/robot-vacuums/ive-seen-two-game-changing-stair-climbing-robot-vacs-in-action-theres-one-clear-winner-in-the-race-to-the-top
4. Vacuum Wars, IFA stair module coverage (updated Dec 2025): https://vacuumwars.com/the-rise-of-the-stair-climbing-robot-vacuum-ifa-2025/
5. eufy UK, first-party operational distinction (updated 11 Aug 2026): https://www.eufy.com/uk/blogs/robovac/stair-climbing-robot-vacuum
6. MIGO Kickstarter refunded/hidden original project: https://www.kickstarter.com/projects/migoascender/migo-ascender-the-stair-climbing-robot-vacuum?lang=de

**Note:** exhibition observations prove existence of the displayed operation under the demonstration conditions. They are not controlled reviews of cleaning effectiveness, stair fall incidence, longevity, navigation around irregular stairs or autonomous unsupervised home operation. Sources reporting unreleased concepts do NOT imply a dated sales launch. No model in this *reviewed cohort* had verified evidence of BOTH real multi-stair climbing AND retail sale as of this audit; this is **not an exhaustive proof of absence across the global market**.

## Actual independent original tests for *small thresholds*, and measured-provenance limits

| Actually sold robot | Manufacturer's single threshold claim | Manufacturer's combined, shaped threshold claim | Original expert test in public text | Limitation |
|---|---|---|---|---|
| **Roborock Saros 20** | 4.5 cm | 4.5 + 4.3 = **8.8 cm**, gap **>12 to <=14 cm** | **Vacuum Wars** purchased the robot and cleared a **57 mm** single barrier after repositioning. | Publisher warns it may not consistently clear 57 mm. This DOES NOT make a single 8.8 cm riser passable. |
| **Dreame X50 Ultra** | 4.2 cm | Up to **6 cm total** if gap >4 cm. Do not fabricate component heights absent from the cited primary footnote. | **Vacuum Wars** purchased the robot and observed a successful **36 mm** single board; its original review describes lower boards too. | Lab test success is not guaranteed repeatable household stair crossing. |
| **MOVA Z60 Ultra Roller Complete** | 4.8 cm | 4.5 + 3.5 = **8 cm** at an explicitly stated **7 cm** gap. | No qualifying product-specific independent measured single-step result transcribed in this phase. | Manufacturer's internal test is not independent verification; this Z60 is NOT the stair-carrying *Zeus 60*. |

Original sources:

7. Roborock Denmark official Saros 20 specifications, purchase controls and dimensional footnotes: https://dk.roborock.com/pages/roborock-saros-20
8. Vacuum Wars original independent **Saros 20** review, purchased unit, last updated 28 Aug 2026, threshold section: https://vacuumwars.com/roborock-saros-20-review/
9. Dreame X50 official product page, 4.2cm and two-step 6cm caveat: https://www.dreametech.com/products/x50-ultra-robot-vacuum
10. Vacuum Wars original independent **X50 Ultra** review, updated 1 Sep 2026; measured test board 36mm: https://vacuumwars.com/dreame-x50-ultra-review-is-it-the-best-yet/
11. MOVA Denmark official Z60, 4.8cm single and 8cm combined with exact 7cm gap: https://dk.mova.tech/products/mova-z60-ultra-rolle-complete-robot-vacuum

**No false cross-source calibration.** Two numerical maxima from original expert reviews are *observations on the publications' specific courses*, not automatically comparable maxima on one shared calibrated protocol. The publicly indexed RTINGS Saros 20 review exposes "Locked" before a 3.8cm threshold placeholder; the underlying detailed measurement is paywalled. It is NOT silently imported as a verified measured endpoint: https://www.rtings.com/robot-vacuum/reviews/roborock/saros-20 . No artificial zero is assigned to untested models.

## Implementation (real, manually curated public source evidence)

- `src/phase118_real_stair_capability_audit.ts`: typed source, device, observed operation, test setting, threshold geometry and capability statuses; verifies compatible source dispositions, rejects masquerading manufacturer claims as independent first-hand observation or original tests. Blocks "manufacturer feature => measured outcome", "two-part 8.8cm => single 8.8cm", "show-floor demo => home reliability", "unreleased concept => verified available".
- `src/phase118_stair_reviewed_source_case.ts`: 11 dated or explicitly undated primary/source pointers with original URLs and product-specific observations across 8 systems. Source editorial descriptions and event video coverage are *qualitative witness evidence*, not laboratory measurements.
- `tests/phase118_real_stair_capability_audit.test.ts`: constructed *test cases* over real **source-backed facts**, including facts for Rover and original measured Vacuum Wars thresholds. Intent verification remains an external caller contract, NOT validated multilingual NLP.
- `examples/phase118-stairs-demo.ts`: produces `PHASE118-REAL-SOURCE-RESULTS.json`; answer snapshots and source fingerprint remain canonical and query-neutral.

**Limitations:** This is NOT an automatic crawler or LLM source extraction. The URLs and claims were manually read and reviewed in this investigation. No complete source access rights survey, retrieval-version attestation or production database integration is claimed. Publisher article text is linked, not copied into the repository. A model's presence in the reviewed cohort is not proof of exhaustive global product coverage. Verification is source-linked and static as of 2026-10-11, not live retail stock. The semantic contract is externally verified by the caller; the code does not itself label Italian/English paraphrases reliably. The product ranking API returns `null` for this mixed source cohort because outcomes are not calibrated across contexts. This is empirical **capability classification**, not statistical superiority or calibrated numerical ranking.

## Next necessary proof

Get direct at-home tests of stair robots with a defined sample of staircase geometries (straight/curved, carpets/wood, tread depth, riser height, landings), measured cleaning mass/coverage per tread, failure and intervention rates, time and maintenance per floor; independently corroborate shipping status. For threshold comparability, independently approve same-protocol bridges before ranking 36mm vs 57mm as equivalent controlled maxima. Integrate normalized observations into Phase101 canonical memory and invalidation chain, rather than maintaining a manual companion snapshot forever.
