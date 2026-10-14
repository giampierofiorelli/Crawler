import {planProductPopulation,type CandidateForPopulation} from '../src/phase80_population_portfolio.js';
const row=(id:string):CandidateForPopulation=>({id,categoryId:'mattress_cleaning',market:'uk',familyId:'extractor',stage:'discovery_stub',
 editorialAppearances:[],officialProductIdentityConfirmed:true,marketListingConfirmed:true,
 novelVerifiedTechnicalFeature:false,explicitNeedTriggered:false,validatedNicheFit:false,verifiedDiscontinued:false});
const strong={...row('well_referenced'),editorialAppearances:[
 {publisherId:'original_lab_1',originalListId:'list1',type:'professionally_tested_shortlist' as const,prominence:'leading' as const,independentPublisherAttested:true},
 {publisherId:'original_lab_2',originalListId:'list2',type:'editorial_shortlist' as const,prominence:'leading' as const,independentPublisherAttested:true}]};
const ordinary=row('tail_candidate');
const specialized={...row('niche_specialist'),explicitNeedTriggered:true,validatedNicheFit:true};
const ctx={categoryId:'mattress_cleaning',market:'uk',enrichmentBudget:1,independentDiscoveryPasses:1,
 discoveredNewPlausibleInRecentPasses:1,reviewedFamilyIds:['extractor'],demandMode:'general_launch_seed' as const};
const general=planProductPopulation(ctx,[ordinary,strong,specialized]);
const specific=planProductPopulation({...ctx,demandMode:'specific_user_need'},[ordinary,strong,specialized]);
console.log(JSON.stringify({scenario:'constructed fixtures, no real endorsements',
 generalPriority:general.selectedForEnrichment,specificPriority:specific.selectedForEnrichment,
 deferredDiscovery:general.candidates.filter(x=>x.disposition==='retain_stub_for_later').map(x=>x.productId),
 marketCoverageCertified:general.marketCoverageCertified,rankingChanged:general.rankingChanged},null,2));
