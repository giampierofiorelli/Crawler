/** Honest replay of inherited authentic public metadata leads, not of footage.
 * Test-generated temporary coordinator/reviewer keys demonstrate only schema.
 * All provider implementations deliberately marked NOT EXECUTED.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {generateKeyPairSync,sign} from 'node:crypto';
import {freezeFingerprints207,freezeMessage207} from '../dist/src/phase207_signed_benchmark_admission.js';
import {comparePairedVideoProviders208} from '../dist/src/phase208_paired_provider_trial.js';
const source='docs/phase206/REAL-VIDEO-METADATA-PILOT.json';
const original=JSON.parse(readFileSync(source,'utf8'));
if(original.cases.length!==6||original.cases.some(c=>c.reviewBasis!=='metadata_only'))throw Error('source_metadata_changed');
const kp=Array.from({length:3},()=>generateKeyPairSync('ed25519'));
const policy={policyId:'phase208_demo_ephemeral_not_prod',anchors:kp.map((k,i)=>({
 keyId:`demo_${i}`,principalId:i===0?'demo_coordinator':`demo_reviewer_${i}`,
 role:i===0?'benchmark_coordinator':'independent_video_reviewer',
 publicKeyPem:k.publicKey.export({type:'spki',format:'pem'}).toString(),
 activeFrom:'2026-10-01T00:00:00Z',activeThrough:'2026-11-01T00:00:00Z'}))};
const plans=[
 {categoryId:'coffee_machines',buyerUseCaseId:'traditional_espresso',criterionId:'espresso_outcome',expectedObservation:'specialist_result'},
 {categoryId:'air_fryers',buyerUseCaseId:'food_preparation',criterionId:'practical_cooking',expectedObservation:'daily_use'},
 {categoryId:'japanese_knives',buyerUseCaseId:'sashimi_cutting',criterionId:'blade_sharpening',expectedObservation:'specialist_result'}
];
const vendors=[['native','pee_native_205'],['youtubejs','youtubejs'],['transcript','youtube_transcript_api'],['pyabsa','pyabsa']];
const outputs=[];
for(const p of plans){
 const cases=original.cases.filter(c=>c.categoryId===p.categoryId);
 const datasetId=`phase208_${p.categoryId}_public_metadata`;
 const arms=vendors.map(([armId,family])=>{
  const payload={schema:'pee207.freeze.v1',datasetId,providerId:armId,providerVersion:'not_executed',
   ...freezeFingerprints207(cases,[],[]),frozenAt:'2026-10-13T09:00:00Z',blindAccessAttested:true};
  const frozen={payload,keyId:'demo_0',signatureBase64Url:sign(null,Buffer.from(freezeMessage207(payload)),
   kp[0].privateKey).toString('base64url')};
  return {armId,family,runStatus:'not_executed',admission:{schema:'pee207.admission.v1',datasetId,
   cases,predictions:[],pairPredictions:[],frozen,caseReviews:[],pairReviews:[],policy,
   asOf:'2026-10-13T10:00:00Z'}};
 });
 const result=comparePairedVideoProviders208({schema:'pee208.paired-trial.v1',
  trialId:`pilot_${p.categoryId}`,buyerUseCaseId:p.buyerUseCaseId,categoryId:p.categoryId,
  criteria:[{criterionId:p.criterionId,critical:true,expectedObservation:p.expectedObservation},
   ...[...new Set(cases.map(c=>c.criterionId))].filter(c=>c!==p.criterionId).map(criterionId=>({
    criterionId,critical:false,expectedObservation:'daily_use'}))],arms});
 if(result.resultState!=='unscorable_no_shared_gold'||result.reviewedCasesWithTwoSignatures!==0||
    result.arms.some(a=>a.fieldResults.claimKind.accuracyOnPredictions!==null))throw Error('unexpected_gold');
 outputs.push({categoryId:p.categoryId,cases:result.totalCases,sourceMetadataOnly:true,
  reviewedVideos:0,admittedLabels:0,providerExecutions:0,accuracy:null,
  heldCriticalCriteria:result.missingCriticalCriterionIds,
  comparedProviders:result.arms.map(a=>({provider:a.family,runStatus:a.runStatus})),
  scientificAccuracyClaimAllowed:result.scientificAccuracyClaimAllowed});
}
const output={schema:'pee208.public-metadata-replay.v1',replayDate:'2026-10-13',
 source,publicMetadataLeadCount:original.cases.length,sourceVideosViewed:false,
 transcriptsExamined:false,testOwnedEphemeralKeysOnly:true,providerCodeExecuted:false,
 independentExpertAnnotatorsEnrolled:false,verifiedGoldLabels:0,providerAccuracy:null,
 categoryTrials:outputs,realWorldProviderSuperiorityClaimAllowed:false};
console.log(JSON.stringify(output,null,2));
if(process.argv[2]==='--write')writeFileSync('docs/phase208/PUBLIC-METADATA-FAIR-REPLAY.json',JSON.stringify(output,null,2)+'\n');
