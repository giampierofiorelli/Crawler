/** Synthetic, rights-free Phase196 source discovery, never a verified live review. */
import {analyzeEphemeralBatch195} from '../dist/src/phase195_ephemeral_batch_lineage.js';
import {emptyLedger193} from '../dist/src/phase193_screening_memory.js';
import {loadPublisherSeed196,planSourceReviews196} from '../dist/src/phase196_source_intelligence.js';
import {evaluateSourceQueue196} from '../dist/src/phase196_evaluation.js';
const template='Synthetic reviewer notes: direct measurement claim in a structured study, test rig conditions and practical usability observations. '.repeat(7);
const make=(sourceId,url,category,variantId,transientText=template)=>({sourceId,url,category,variantId,
 transientText,textBasis:'analyst_annotation',dates:[],attribution:[],measurements:[]});
const a=make('known_uk','https://www.which.co.uk/reviews/coffee-machines/abc','coffee_machines','maker_one');
const b=make('new_expert','https://independent-coffee-lab.example.org/review/abc','coffee_machines','maker_one',template+' fresh testing');
const c=make('commercial_stars','https://deals.example.net/top-coffee','coffee_machines','maker_one','Amazon review averages and star counts; no original study.');
const d=make('rare_only','https://niche.example.org/reviews/rare','steamers','rare_model','Insufficient independent testing so far.');
b.attribution=[{targetSourceId:'known_uk',kind:'explicitly_cites'}];
const batch=analyzeEphemeralBatch195({batchId:'phase196_synthetic_demo',analyzedAt:'2026-10-13T12:00:00Z',reviews:[a,b,c,d]});
const annotations=[['known_uk','original_instrumental_claim','espresso_temp'],['new_expert','structured_practical_claim','espresso_temp'],
 ['commercial_stars','marketplace_stars_only','espresso_temp'],['rare_only','unclassified','safety']].map(([sourceId,materialRole,field])=>
 ({sourceId,market:'UK',field,protocol:null,materialRole,sourceRevision:null,freshPublisherBytes:null}));
const matrix=planSourceReviews196({batch,annotations,seed:loadPublisherSeed196('data/phase196/publisher-method-seed.json'),
 ledger:emptyLedger193(),maxQueue:3});
const labels=[{sourceId:'known_uk',containsOriginalCriterionEvidence:true,isMarketplaceStarsOnly:false,provenance:'synthetic_fixture',reviewerIds:[]},
 {sourceId:'new_expert',containsOriginalCriterionEvidence:true,isMarketplaceStarsOnly:false,provenance:'synthetic_fixture',reviewerIds:[]},
 {sourceId:'commercial_stars',containsOriginalCriterionEvidence:false,isMarketplaceStarsOnly:true,provenance:'synthetic_fixture',reviewerIds:[]},
 {sourceId:'rare_only',containsOriginalCriterionEvidence:false,isMarketplaceStarsOnly:false,provenance:'synthetic_fixture',reviewerIds:[]}];
const metrics=evaluateSourceQueue196(matrix,labels);
console.log(JSON.stringify({phase:196,version:'5.20.0',dataset:'authored_synthetic_not_independent_benchmark',
 observedSourceCount:matrix.rows.length,queue:matrix.reviewQueue,unknownExploration:matrix.explorationIncluded,
 expectedOriginalTestVerification:0,productCoverage:matrix.coverage,
 sourceBodiesStored:matrix.sourceBodiesStored,performanceOnSuppliedSyntheticLabels:metrics,
 publicRankingAllowed:matrix.publicRankingAllowed},null,2));
