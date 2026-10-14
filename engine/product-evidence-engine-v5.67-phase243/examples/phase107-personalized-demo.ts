/** Constructed offline demonstration: no product or measurement here is real. */
import {writeFileSync,mkdirSync} from 'node:fs';
import {InterpretationMemory101,type SourcePointer} from '../src/phase101_interpretation_memory.js';
import {EntityCognition104} from '../src/phase104_entity_cognition.js';
import {IncrementalReasoningGraph105} from '../src/phase105_incremental_reasoning_graph.js';
import {PersonalizedRecomputation107,type ReviewedTradeoffContext107}
 from '../src/phase107_personalized_recomputation.js';
const at=(second:number)=>new Date(Date.UTC(2026,9,11,9,0,second)).toISOString();
const src=(name:string):SourcePointer=>({sourceUrl:'https://constructed.example.org/'+name,
 originalTestId:name,sourceRevisionSha256:'a'.repeat(64),sourceSpanSha256:'b'.repeat(64),
 sourceLocator:'#test-location',methodologyReference:'constructed primary source methodology',
 assessmentReference:'constructed hypothetical scale adjudication',assessorId:'synthetic_reviewer',
 assessedAt:at(0),originalTestLineageReviewed:true,exactVariantReviewed:true,contextReviewed:true});
const memory=new InterpretationMemory101(),cognition=new EntityCognition104(),graph=new IncrementalReasoningGraph105();
for(const variantId of ['alpha','beta'])memory.registerProduct({categoryId:'vacuum',variantId,
 displayName:'Illustrative Vacuum '+variantId});
const config:ReviewedTradeoffContext107={nodeId:'demo_comparison',categoryId:'vacuum',useContextId:'hard_floor',
 variantIds:['alpha','beta'],criterionFrames:[
 {criterionId:'noise',frameId:'normal',scaleReference:'construct reviewed noise scale'},
 {criterionId:'cleaning',frameId:'normal',scaleReference:'construct reviewed cleaning scale'}],
 reviewedPreferenceModel:{profileReference:'constructed hypothetical user profile',
 userPreferencesConfirmed:true,independentlyReviewedAdditiveAssumptions:true,
 additiveReviewReference:'constructed hypothetical independent review',criteria:[
 {criterionId:'noise',swingWeight:0.6,weightElicitationReceipt:'constructed noise swing choice',
 valueScaleElicitationReceipt:'construct reviewed noise scale',levels:[
 {id:'poor',value:0,description:'noisy performance'},{id:'good',value:100,description:'quiet performance'}]},
 {criterionId:'cleaning',swingWeight:0.4,weightElicitationReceipt:'constructed cleaning swing choice',
 valueScaleElicitationReceipt:'construct reviewed cleaning scale',levels:[
 {id:'poor',value:0,description:'weak cleaning'},{id:'good',value:100,description:'excellent cleaning'}]}]},
 hardRequirements:[],ordinalJudgements:[],preferenceExplorationConfirmed:true,
 preferenceExplorationReference:'constructed explicit preference exploration'};
const add=(variantId:string,criterionId:string,levelId:string,testId:string)=>memory.recordApprovedClaim({
 id:testId,categoryId:'vacuum',variantId,criterionId,frameId:'normal',kind:'calibrated_level',
 levelId,scaleReference:'construct reviewed '+criterionId+' scale',source:src(testId)});
add('alpha','noise','poor','first_noise_test');add('beta','noise','good','second_noise_test');
add('alpha','cleaning','good','first_cleaning_test');add('beta','cleaning','poor','second_cleaning_test');
const worker=new PersonalizedRecomputation107(memory,cognition,graph);worker.register(config);
const before=worker.recompute(config,at(1));
memory.withdrawClaim('first_noise_test','constructed reanalysis withdrawal',at(2));
add('alpha','noise','good','corrected_noise_test');
const invalidated=worker.readFresh(config)===null;
const after=worker.recompute(config,at(3));
const document={synthetic:true,independentHumanCalibrationPerformed:false,
 sourceTextUsedDuringQuery:false,modelCallsDuringQuery:0,invalidated,
 before:before.cache?.payload,after:after.cache?.payload,
 beforeCacheSha256:before.cache?.resultSha256,afterCacheSha256:after.cache?.resultSha256,
 publicRankingAllowed:false,limitations:['Constructed source pointers, test outcomes and user preferences',
 'Cross-database transactions are not atomic; revalidation mitigates but does not eliminate races',
 'Scores conditional on unvalidated reviewed-scale assumptions']};
mkdirSync('audit/phase107',{recursive:true});
writeFileSync('audit/phase107/constructed-personalized-revision.json',JSON.stringify(document,null,2)+'\n');
console.log(JSON.stringify({before:(before.cache?.payload as any)?.primary.conditionalOrder,
 after:(after.cache?.payload as any)?.primary.conditionalOrder,invalidated}));
graph.close();cognition.close();memory.close();
