/** Phase172: narrow, research-only links from candidate dimensions to original
 * test-method descriptions or documentary installation guidance. No product
 * measurements, source-independence audit, causal certification or ranking. */
import type {GoalResearch172,Category172} from './phase172_goal_suitability_guide.js';

export type DocumentaryKind172='original_professional_test_method'|'technical_standard_index'|'manufacturer_general_installation_guidance';
export interface DocumentedMethod172{
 id:string;category:Exclude<Category172,'unknown'>;dimensions:readonly string[];
 title:string;url:string;kind:DocumentaryKind172;
 /** What the linked document actually covers, not a promise of full validation. */
 supports:string;doesNotEstablish:string;
}
export interface DimensionResearch172{
 dimension:string;methods:readonly DocumentedMethod172[];
 status:'method_documented_product_evidence_missing'|'method_still_to_locate';
 technicalLinkScientificallyValidated:false;productMeasurementVerified:false;
}
export interface ProtocolResearch172{
 phase:172;requestSha256:string;category:Category172;dimensions:readonly DimensionResearch172[];
 verifiedIndependentMeasurements:0;productRankingAuthorized:false;productVetoAuthorized:false;
 registryScope:'non_exhaustive_documentary_examples';
}
const METHODS:readonly DocumentedMethod172[]=[
 {id:'which_airfryer_test_2026',category:'air_fryer',dimensions:['food_specific_texture_result','uniformity','intervention_needed','cleaning_burden'],
  title:'Which? How we test air fryers (10 Apr 2026)',url:'https://www.which.co.uk/reviews/air-fryers/article/how-we-test-air-fryers-aCHgw2L7PYzU',kind:'original_professional_test_method',
  supports:'Tests on named foods, ease of use and cleaning, cooking time and energy use',
  doesNotEstablish:'No specific product result; results for tested foods do not transfer to every dish or load'},
 {id:'which_airfryer_capacity',category:'air_fryer',dimensions:['usable_cooking_area','cycles_needed','batch_size'],
  title:'Which? air fryer original model tests, measured maximum cooking capacity',url:'https://www.which.co.uk/reviews/air-fryers/tower-t17024-digital-air-fryer',kind:'original_professional_test_method',
  supports:'Publishes measured maximum cooking capacity by weight for a specific model',
  doesNotEstablish:'Measured food mass is not basket surface area; does not measure number of cycles for a particular household'},
 {id:'sca_coffee_standards',category:'coffee_machine',dimensions:['grinder_and_bean_role','repeatability'],
  title:'Specialty Coffee Association standards list (SCA-320, SCA-350)',url:'https://sca.coffee/research/coffee-standards',kind:'technical_standard_index',
  supports:'Identifies separate published specifications and test methods for home grinders and espresso machines',
  doesNotEstablish:'Index does not document every test detail or prove a grinder is needed for a given user'},
 {id:'rtings_vacuum_methods',category:'vacuum_cleaner',dimensions:['pet_hair_pickup_by_surface','access_under_furniture','stair_cleaning_access','carried_weight','handling_effort'],
  title:'RTINGS How We Test Vacuums (14 Mar 2025)',url:'https://www.rtings.com/vacuum/learn/how-we-test',kind:'original_professional_test_method',
  supports:'Distinguishes floor and debris pickup from portability, maneuverability and pet hair tests',
  doesNotEstablish:'No measured fitness for a particular home, stair geometry or user'},
 {id:'whirlpool_installed_clearance',category:'washing_machine',dimensions:['installed_depth','door_swing_clearance','service_clearance','loading_access'],
  title:'Whirlpool Laundry room sizes and installation clearance guidance',url:'https://www.whirlpool.com/blog/washers-and-dryers/laundry-room-sizes.html',kind:'manufacturer_general_installation_guidance',
  supports:'Identifies installation clearance, hookups, door swing, passage/access and model-specific instructions',
  doesNotEstablish:'Guidance is manufacturer-origin and generic, not a tested clearance for any candidate model'},
 {id:'which_washer_protocol',category:'washing_machine',dimensions:['rinsing_effectiveness','wash_performance','water_use','energy_use','program_length'],
  title:'Which? How we test washing machines (5 Oct 2026)',url:'https://www.which.co.uk/reviews/washing-machines/article/how-we-test-washing-machines-aQOn95P2K1rC',kind:'original_professional_test_method',
  supports:'Describes stain cleaning, rinse residue, spin water, energy, water and duration test procedures',
  doesNotEstablish:'Does not tell whether any particular model fits the user installation'},
 {id:'which_fridge_method',category:'refrigerator',dimensions:['measured_noise_protocol','noise_events_and_character','placement_context'],
  title:'Which? How we test fridges (5 Jun 2026)',url:'https://www.which.co.uk/reviews/fridges/article/how-we-test-fridges-aEkH84g4EMj8',kind:'original_professional_test_method',
  supports:'Uses a sound chamber and assesses refrigerator noise character over time, including compressor starts',
  doesNotEstablish:'No direct measured disturbance in a specific studio or sleep environment'},
 {id:'which_fridge_capacity',category:'refrigerator',dimensions:['usable_storage','cooling_stability','energy_use'],
  title:'Which? How we test fridge freezers (6 Aug 2026)',url:'https://www.which.co.uk/reviews/fridge-freezers/article/how-we-test-fridge-freezers-akb4p8i1ToWy',kind:'original_professional_test_method',
  supports:'Uses usable storage, cooling/freezing, temperature conditions and energy tests for combined appliances',
  doesNotEstablish:'Fridge-freezer methods are not automatically equivalent to refrigerator-only models or revised protocols'},
];
export function listResearchMethods172():readonly DocumentedMethod172[]{
 return METHODS.map(m=>({...m,dimensions:[...m.dimensions]}));
}
export function mapGoalToMethodResearch172(plan:GoalResearch172):ProtocolResearch172{
 if(!plan||plan.phase!==172||!/^[0-9a-f]{64}$/.test(plan.requestSha256)||
  !Array.isArray(plan.candidates)||!Array.isArray(plan.unresolvedDimensions)||
  plan.candidateKnowledgeOnly!==true||plan.independentEvidenceVerified!==false||
  plan.rankingAuthorized!==false||plan.productExclusionsAuthorized!==false||plan.publicationAuthorized!==false)
  throw Error('phase172_protocol_requires_candidate_only_plan');
 const dimensions=[...new Set(plan.unresolvedDimensions)].sort().map(d=>{
  const methods=METHODS.filter(m=>m.category===plan.category&&m.dimensions.includes(d))
   .sort((a,b)=>a.id.localeCompare(b.id));
  return {dimension:d,methods:methods.map(m=>({...m,dimensions:[...m.dimensions]})),
   status:methods.length?'method_documented_product_evidence_missing' as const:'method_still_to_locate' as const,
   technicalLinkScientificallyValidated:false as const,productMeasurementVerified:false as const};
 });
 return {phase:172,requestSha256:plan.requestSha256,category:plan.category,
  dimensions,verifiedIndependentMeasurements:0,productRankingAuthorized:false,
  productVetoAuthorized:false,registryScope:'non_exhaustive_documentary_examples'};
}
