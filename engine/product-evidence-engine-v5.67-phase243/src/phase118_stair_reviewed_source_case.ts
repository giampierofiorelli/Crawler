/** Manually reviewed, PUBLICLY LINKED original-source case; not scraped data, not live inventory.
 * 2026-10-11 reference snapshot. Sources and contexts explicitly distinguish booth demo,
 * manufacturer's statement, campaign cancellation and retail product page.
 */
import type {StairEvidence118,Observation118} from './phase118_real_stair_capability_audit.js';
const obs=(productId:string,capability:Observation118['capability'],disposition:Observation118['disposition'],sourceId:string,setting:Observation118['setting'],scopeNote:string,geometry?:Observation118['geometry'],measurementProtocol?:string):Observation118=>({productId,capability,disposition,sourceId,setting,scopeNote,...(geometry?{geometry}:{}),...(measurementProtocol?{measurementProtocol}:{})});
export const ORIGINAL_STAIR_CASE_118:StairEvidence118={
 revision:'phase118_manual_primary_sources_r1',asOf:'2026-10-11',
 sources:[
  {id:'verge-2026-01-06',url:'https://www.theverge.com/tech/852121/roborock-saros-rover-stair-climbing-robot-vacuum-ces-2026',published:'2026-01-06',publisher:'The Verge',kind:'independent_firsthand_exhibition',scope:'CES 2026: reviewer observed five-step ascent with vacuuming; household operation untested'},
  {id:'tomsguide-2026-09-03',url:'https://www.tomsguide.com/home/home-appliances/i-just-watched-a-robot-vacuum-actually-climb-stairs-it-took-3-minutes-but-those-steps-were-sparkling-after',published:'2026-09-03',publisher:"Tom's Guide",kind:'independent_firsthand_exhibition',scope:'IFA 2026: firsthand ascent, descent and cleaning; no home trial, no sales confirmed'},
  {id:'techradar-2025-09-05',url:'https://www.techradar.com/home/robot-vacuums/ive-seen-two-game-changing-stair-climbing-robot-vacs-in-action-theres-one-clear-winner-in-the-race-to-the-top',published:'2025-09-05',publisher:'TechRadar',kind:'independent_firsthand_exhibition',scope:'IFA 2025: witnessed Cyber X and MarsWalker tracked-carrier stair traversal; demonstration not household reliability test'},
  {id:'vacuumwars-2025-12-17',url:'https://vacuumwars.com/the-rise-of-the-stair-climbing-robot-vacuum-ifa-2025/',published:'2025-12-17',publisher:'Vacuum Wars',kind:'independent_firsthand_exhibition',scope:'IFA 2025: photographed/filmed MOVA Zeus 60 elevator-like stair-traversal demo; speed not instrumented'},
  {id:'vacuumwars-x50-original-2026-09-01',url:'https://vacuumwars.com/dreame-x50-ultra-review-is-it-the-best-yet/',published:'2026-09-01',publisher:'Vacuum Wars',kind:'independent_original_test',scope:'Original purchased Dreame X50 Ultra; independently cleared a 36mm single threshold; page last updated Sep 1, 2026, initial test earlier'},
  {id:'dreame-x50-official',url:'https://www.dreametech.com/products/x50-ultra-robot-vacuum',published:null,publisher:'Dreame official US',kind:'manufacturer_publication',scope:'Official X50 specs: 4.2cm single vertical threshold; 6cm two-tier maximum only with >4cm gap; original components not fully specified'},
  {id:'mova-z60-official',url:'https://dk.mova.tech/products/mova-z60-ultra-rolle-complete-robot-vacuum',published:null,publisher:'MOVA official Denmark',kind:'manufacturer_publication',scope:'MOVA Z60 single up to 4.8cm; two-piece 4.5+3.5cm at 7cm separation; internal manufacturer tests'},
  {id:'vacuumwars-test-2026-08-28',url:'https://vacuumwars.com/roborock-saros-20-review/',published:'2026-08-28',publisher:'Vacuum Wars',kind:'independent_original_test',scope:'Purchased Saros 20; original single-step 57 mm threshold cleared after repositioning; publisher cautions may not consistently clear this height; method version not stated'},
  {id:'eufy-2026-08-11',url:'https://www.eufy.com/uk/blogs/robovac/stair-climbing-robot-vacuum',published:'2026-08-11',publisher:'eufy UK',kind:'manufacturer_publication',scope:'Describes MarsWalker as carrier; explicitly states it does not vacuum stair treads'},
  {id:'roborock-store-accessed-2026-10-11',url:'https://dk.roborock.com/pages/roborock-saros-20',published:null,publisher:'Roborock Official Denmark',kind:'manufacturer_publication',scope:'As accessed 2026-10-11; product buy link and manufacturer internal two-part threshold geometry, not household staircase performance'},
  {id:'migo-kickstarter-refund',url:'https://www.kickstarter.com/projects/migoascender/migo-ascender-the-stair-climbing-robot-vacuum?lang=de',published:null,publisher:'Kickstarter / MIGO campaign',kind:'original_campaign_record',scope:'Kickstarter campaign header reports pledges refunded and indefinitely hidden; previous functionality promises are manufacturer claims'},
 ],
 products:[
  {id:'roborock-saros-rover',name:'Roborock Saros Rover',mobility:'integrated_wheeled_legs',systemRole:'integrated_vacuum'},
  {id:'dreame-cyber-x',name:'Dreame Cyber X / QuadTrack',mobility:'tracked_carrier',systemRole:'carrier_plus_compatible_vacuum'},
  {id:'eufy-marswalker',name:'eufy MarsWalker',mobility:'tracked_carrier',systemRole:'carrier_plus_compatible_vacuum',compatibleVacuum:'eufy Omni S2 as announced, final compatibility to confirm'},
  {id:'mova-zeus-60',name:'MOVA Zeus 60',mobility:'elevator_carrier',systemRole:'carrier_plus_compatible_vacuum'},
  {id:'migo-ascender',name:'MIGO Ascender',mobility:'square_integrated_concept',systemRole:'integrated_vacuum'},
  {id:'dreame-x50-ultra',name:'Dreame X50 Ultra',mobility:'lifting_threshold_chassis',systemRole:'integrated_vacuum'},
  {id:'mova-z60-ultra',name:'MOVA Z60 Ultra Roller Complete',mobility:'lifting_threshold_chassis',systemRole:'integrated_vacuum'},
  {id:'roborock-saros-20',name:'Roborock Saros 20',mobility:'lifting_threshold_chassis',systemRole:'integrated_vacuum'},
 ],
 observations:[
  obs('roborock-saros-rover','multiple_stair_ascent','observed_yes','verge-2026-01-06','exhibition_demo','CES straight demonstration staircase: five steps; household and curved staircase not independently validated'),
  obs('roborock-saros-rover','vacuum_stair_treads','observed_yes','verge-2026-01-06','exhibition_demo','CES 2026: vacuum head seen passing along step; cleaning pickup quantity NOT measured'),
  obs('roborock-saros-rover','multiple_stair_ascent','observed_yes','tomsguide-2026-09-03','exhibition_demo','IFA 2026: attended stair demonstration, not domestic test'),
  obs('roborock-saros-rover','multiple_stair_descent','observed_yes','tomsguide-2026-09-03','exhibition_demo','IFA 2026: reviewer witnessed descent, no unsupervised use'),
  obs('roborock-saros-rover','vacuum_stair_treads','observed_yes','tomsguide-2026-09-03','exhibition_demo','IFA 2026: journalist observed cleaning on steps; no quantified removal'),
  obs('dreame-cyber-x','multiple_stair_ascent','observed_yes','techradar-2025-09-05','exhibition_demo','IFA 2025: tracked carrier transported docked vacuum upstairs'),
  obs('dreame-cyber-x','multiple_stair_descent','observed_yes','techradar-2025-09-05','exhibition_demo','IFA 2025: tracked carrier demonstrated stair traversal both ways'),
  obs('eufy-marswalker','multiple_stair_ascent','observed_yes','techradar-2025-09-05','exhibition_demo','IFA 2025: MarsWalker carried compatible robot up staircase'),
  obs('eufy-marswalker','multiple_stair_descent','observed_yes','techradar-2025-09-05','exhibition_demo','IFA 2025: MarsWalker descended demo steps'),
  obs('eufy-marswalker','vacuum_stair_treads','explicit_no','eufy-2026-08-11','editorial_description','eufy states MarsWalker transports compatible robot and does not vacuum stair treads itself'),
  obs('mova-zeus-60','multiple_stair_ascent','observed_yes','vacuumwars-2025-12-17','exhibition_demo','IFA 2025: compact elevator-like lifting platform moves across staircase; no full in-home trial'),
  obs('migo-ascender','multiple_stair_ascent','manufacturer_claim_yes','migo-kickstarter-refund','editorial_description','Crowdfunding promised stair climbing; not independently validated for household use'),
  obs('migo-ascender','vacuum_stair_treads','manufacturer_claim_yes','migo-kickstarter-refund','editorial_description','Crowdfunding advertised stair cleaning; performance not independently validated'),
  obs('migo-ascender','retail_sale','explicit_no','migo-kickstarter-refund','campaign_status','Original Kickstarter campaign explicitly says pledges refunded / project indefinitely hidden'),
  obs('dreame-x50-ultra','single_threshold','manufacturer_claim_yes','dreame-x50-official','manufacturer_lab','Dreame official internal test: single vertical step 4.2cm; not a full staircase',{kind:'single',maxSingleCm:4.2}),
  obs('dreame-x50-ultra','two_part_threshold','manufacturer_claim_yes','dreame-x50-official','manufacturer_lab','Dreame official internal test: two-part total up to 6cm when gap between parts >4cm; component heights not published in the cited footnote',{kind:'two_part',totalCm:6}),
  obs('dreame-x50-ultra','single_threshold','independently_tested_yes','vacuumwars-x50-original-2026-09-01','independent_test','Vacuum Wars independently crossed a 36mm single board; no repeated reliability probability reported',{kind:'single',maxSingleCm:3.6},'Vacuum Wars 36mm single-board protocol; version not given'),
  obs('dreame-x50-ultra','retail_sale','original_seller_yes','dreame-x50-official','product_page','Official brand page presents model for sale; shipping depends on region'),
  obs('mova-z60-ultra','single_threshold','manufacturer_claim_yes','mova-z60-official','manufacturer_lab','MOVA official claim: 4.8cm maximum single barrier from manufacturer tests',{kind:'single',maxSingleCm:4.8}),
  obs('mova-z60-ultra','two_part_threshold','manufacturer_claim_yes','mova-z60-official','manufacturer_lab','MOVA official internal conditions: 4.5 + 3.5cm in a two-part geometry with 7cm gap',{kind:'two_part',firstCm:4.5,secondCm:3.5,totalCm:8,interstepGapMinCm:7,interstepGapMaxCm:7}),
  obs('mova-z60-ultra','retail_sale','original_seller_yes','mova-z60-official','product_page','Official Denmark shop shows buy-now controls; stock and shipping need local confirmation'),
  obs('roborock-saros-20','single_threshold','manufacturer_claim_yes','roborock-store-accessed-2026-10-11','manufacturer_lab','Roborock internal test claim: 4.5 cm single door threshold, not staircase',{kind:'single',maxSingleCm:4.5}),
  obs('roborock-saros-20','two_part_threshold','manufacturer_claim_yes','roborock-store-accessed-2026-10-11','manufacturer_lab','Two separate step thresholds: 4.5 cm + 4.3 cm, distance greater than 12 cm and up to 14 cm, not a single 8.8 cm step',{kind:'two_part',firstCm:4.5,secondCm:4.3,totalCm:8.8,interstepGapMinCm:12,interstepGapMaxCm:14}),
  obs('roborock-saros-20','single_threshold','independently_tested_yes','vacuumwars-test-2026-08-28','independent_test','Original review reports clearing 57 mm single barrier after repositioning; no repeatability guarantee',{kind:'single',maxSingleCm:5.7},'Vacuum Wars single-threshold test; publisher method revision not reported in article'),
  obs('roborock-saros-20','retail_sale','original_seller_yes','roborock-store-accessed-2026-10-11','product_page','Official Danish product page displays purchase availability; region and inventory vary'),
 ]
};
