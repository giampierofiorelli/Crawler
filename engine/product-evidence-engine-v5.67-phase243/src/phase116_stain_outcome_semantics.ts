/** Phase116 addendum: goal outcome ≠ speed/pass efficiency. Research-only.
 * Evaluates reviewed original-test structured evidence, not review text or marketing.
 * Comparability requires a precise test setting, version and the same endpoint horizon.
 * Never infer a single-pass request from "removes stains best".
 */
import {ROBOT_FLOOR_MODEL116} from './phase116_category_function_model.js';

export type Lens116='final_stain_removal'|'single_pass_removal'|'elapsed_time_to_clear'|'passes_to_clear';
export type Metric116='remaining_stain_percent'|'seconds_to_clear'|'passes_to_clear'|'weighted_passes_composite';
export interface StainIntent116 {goal:'remove_stains'; primary:Lens116; implicitPassLimit:null|1; efficiencyIsSecondary:boolean; status:'bounded_not_general_nlp';}
export function interpretStainQuestion116(question:string):StainIntent116|null{
 if(!question||question.length>1000)return null;
 const s=question.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const stain=/\b(?:macchi\w*|stain\w*|incrostazion\w*|dried.on\s+mess\w*)\b/.test(s);
 const robot=/\b(?:robot\w*|robo\w*)\b/.test(s);
 if(!stain||!robot)return null;
 const onePass=/\b(?:un[ao]?\s+sol[ao]?\s+passat\w*|prim[ao]?\s+passat\w*|single[- ]pass|one[- ]pass|first[- ]pass|una?\s+passat\w*)\b/.test(s);
 const leastPass=/\b(?:meno\s+passat\w*|minor\s+numero\s+di\s+passat\w*|fewest\s+passes|least\s+passes)\b/.test(s);
 const fastest=/\b(?:meno\s+temp\w*|piu\s+veloc\w*|piu\s+rapid\w*|fastest|quickest|shortest\s+time)\b/.test(s);
 const primary:Lens116=onePass?'single_pass_removal':leastPass?'passes_to_clear':fastest?'elapsed_time_to_clear':'final_stain_removal';
 return {goal:'remove_stains',primary,implicitPassLimit:onePass?1:null,efficiencyIsSecondary:primary==='final_stain_removal',status:'bounded_not_general_nlp'};
}
export interface StainTest116{
 variant:string; labId:string;originalTestId:string;sourceUrl:string;
 protocolVersion:string;testSetupId:string;floorType:string;stainKind:string;cleaningMode:string;
 metric:Metric116;value:number;
 /** Count of passes observed by this result, not a user preference. */
 passCount?:number;
 /** Threshold set by the professional test, never guessed by the engine. */
 clearanceThresholdPercent?:number;
 /** Must be explicitly labelled as a last reading under the published protocol. */
 terminalReading?:boolean;
 independentlyMeasured:boolean;
}
export interface StainContract116{
 labId:string;protocolVersion:string;testSetupId:string;floorType:string;stainKind:string;cleaningMode:string;
}
export interface Result116{variant:string;rank:number|null;status:'ranked'|'not_comparable'|'missing'|'insufficient';value?:number;metric?:Metric116;passCount?:number;sourceUrl?:string;reason:string;}
const nonempty=(s:string)=>!!s&&s.length<=160;
function sameProtocol(x:StainTest116,p:StainContract116){return x.labId===p.labId&&x.protocolVersion===p.protocolVersion&&x.testSetupId===p.testSetupId&&x.floorType===p.floorType&&x.stainKind===p.stainKind&&x.cleaningMode===p.cleaningMode;}
function verifyRecord(x:StainTest116){
 if(![x.variant,x.labId,x.originalTestId,x.protocolVersion,x.testSetupId,x.floorType,x.stainKind,x.cleaningMode].every(nonempty)|| !/^https:\/\//.test(x.sourceUrl))throw Error('missing_source_or_protocol');
 if(!Number.isFinite(x.value)||x.value<0)throw Error('invalid_measurement');
 if(x.metric==='remaining_stain_percent'&&x.value>100)throw Error('invalid_stain_fraction');
 if(x.passCount!==undefined&&(!Number.isInteger(x.passCount)||x.passCount<1))throw Error('invalid_pass_count');
 if(x.clearanceThresholdPercent!==undefined&&(!Number.isFinite(x.clearanceThresholdPercent)||x.clearanceThresholdPercent<=0||x.clearanceThresholdPercent>100))throw Error('invalid_threshold');
 if(x.metric==='remaining_stain_percent'&&x.passCount===undefined)throw Error('missing_observation_horizon');
 if(['seconds_to_clear','passes_to_clear'].includes(x.metric)&&x.clearanceThresholdPercent===undefined)throw Error('missing_clearance_definition');
}
/** No auto-selection of a favorable laboratory or protocol. Choose the test population first.
 * On ordinary requests select *one* common terminal pass count of the reported protocol.
 * A score blending how fast stains disappeared cannot stand in for the final residue.
 * We never claim a full ranking if at least one candidate lacks comparable evidence.
 */
export function compareStainEvidence116(args:{query:string;variants:readonly string[];tests:readonly StainTest116[];contract:StainContract116;snapshotId:string}){
 if(!ROBOT_FLOOR_MODEL116.endpoints.some(e=>e.id==='result_stains'&&e.endpoint==='soil_removal'))throw Error('missing_category_goal');
 const intent=interpretStainQuestion116(args.query); if(!intent)throw Error('unsupported_intent');
 if(!nonempty(args.snapshotId)||Object.values(args.contract).some(x=>!nonempty(x)))throw Error('invalid_snapshot_or_contract');
 const unique=[...new Set(args.variants)].sort();if(unique.length<2||unique.length!==args.variants.length||unique.some(x=>!nonempty(x)))throw Error('invalid_candidates');
 for(const x of args.tests)verifyRecord(x);
 const eligible=args.tests.filter(x=>sameProtocol(x,args.contract)&&x.independentlyMeasured&&unique.includes(x.variant));
 const wanted:Metric116=intent.primary==='passes_to_clear'?'passes_to_clear':intent.primary==='elapsed_time_to_clear'?'seconds_to_clear':'remaining_stain_percent';
 // Never interpret a composite weighted by speed/passes as a pure endpoint.
 const relevant=eligible.filter(x=>x.metric===wanted&&(
    intent.primary==='final_stain_removal'?x.terminalReading===true:
    intent.primary==='single_pass_removal'?x.passCount===1:true));
 const byVariant=new Map(unique.map(variant=>[variant,relevant.filter(x=>x.variant===variant)]));
 const thresholds=new Set(relevant.map(x=>x.clearanceThresholdPercent));
 const passCounts=new Set(relevant.map(x=>x.passCount));
 const comparableHorizon=intent.primary==='final_stain_removal'||intent.primary==='single_pass_removal';
 // One exact number of passes is required for all final-endpoint comparisons.
 // Multiple threshold definitions forbid time/pass comparisons. Never harmonize them silently.
 const horizonOK=comparableHorizon?passCounts.size===1:thresholds.size===1;
 const byRecord=unique.map(variant=>{
   const values=byVariant.get(variant)!;
   if(!values.length)return {variant,record:null,reason:'no_matching_original_test_endpoint'};
   if(values.length!==1)return {variant,record:null,reason:'multiple_endpoint_records_require_reconciliation'};
   return {variant,record:values[0],reason:''};
 });
 const allPresent=byRecord.every(x=>x.record!==null);
 const canOrder=horizonOK&&allPresent;
 const sorted=canOrder?byRecord.map(x=>x.record!).sort((a,b)=>a.value-b.value||a.variant.localeCompare(b.variant)):[];
 const rank=new Map<string,number>();
 for(let i=0;i<sorted.length;i++){rank.set(sorted[i].variant,i>0&&sorted[i].value===sorted[i-1].value?rank.get(sorted[i-1].variant)!:i+1);}
 const results:Result116[]=byRecord.map(x=>({variant:x.variant,rank:canOrder?rank.get(x.variant)!:null,
   status:(canOrder?'ranked':!x.record?'missing':horizonOK?'insufficient':'not_comparable') as Result116['status'],
   ...(x.record?{value:x.record.value,metric:x.record.metric,passCount:x.record.passCount,sourceUrl:x.record.sourceUrl}:{}),
   reason:canOrder?'exact_protocol_and_horizon_matched':!x.record?x.reason:horizonOK?'full_candidate_evidence_missing_or_conflicting':'different_pass_count_or_clearance_threshold'
 })).sort((a,b)=>a.rank!==null&&b.rank!==null?a.rank-b.rank||a.variant.localeCompare(b.variant):a.variant.localeCompare(b.variant));
 return {phase:116,scope:'stain_outcome_not_general_cleaning_quality',snapshotId:args.snapshotId,intent,contract:args.contract,
   results,fullSetComparable:canOrder,ranking:canOrder?results.map(x=>({variant:x.variant,rank:x.rank})):null,
   efficientPassesUsedForGeneralRanking:false,compositeSpeedScoresExcluded:true,
   explanation:canOrder?'Compared measured outcomes at the same original test horizon; did not infer fastest or one-pass preferences.':'An equivalent original endpoint for all candidates is not available. No total ranking is claimed.',
   optionalAlternativeViews:['single_pass_removal','elapsed_time_to_clear','passes_to_clear'] as const,
   originalTextNeeded:false,publicRankingReady:false};
}
