/** Phase93: human-labelled pilot scoring harness for legitimately authorized
 * manufacturer HTML pages. No crawling/discovery is performed here: only the
 * existing Phase68/69 reader may fetch, and Phase70 outputs stay quarantined.
 */
import {acquireReviewedHtmlSpecifications,type HtmlMainlineResult} from './phase90_html_mainline.js';
import {ReviewedRecipeStore} from './phase85_source_recipes.js';
import type {CategoryFieldRegistry} from './category_evidence_matrix.js';
import type {WebCandidate,WebSourcePolicy} from './web_evidence_acquisition.js';
import type {SourceTransport} from './approved_web_reader.js';
export type PilotCase={caseId:string;candidate:WebCandidate;policy:WebSourcePolicy;
 registry:CategoryFieldRegistry;expectedModel:string;annotator:string;
 labelReceipt:string;reference:Readonly<Record<string,{number:number;unit:string}>>;};
export type PilotCaseResult={caseId:string;status:HtmlMainlineResult['status'];
 reasons:readonly string[];correct:number;incorrect:number;missing:number;unexpected:number;
 extracted:number;referenceCount:number;monitoring:HtmlMainlineResult['monitoring'];
 recipeDigest:string|null;};
export type PilotReport={schema:'phase93_permissioned_pilot_v1';
 cases:number;quarantinedCases:number;blockedCases:number;correct:number;incorrect:number;
 missing:number;unexpected:number;precision:number|null;recall:number|null;
 results:readonly PilotCaseResult[];automaticLlmCalls:0;publicationReady:false;
 validationLevel:'controlled_or_permissioned_cases_only';};
const id=(x:unknown)=>typeof x==='string'&&/^[a-z][a-z0-9_]{2,90}$/.test(x);
/** Reference numbers are supplied by independent annotators; code cannot
 * authenticate their real identity or licensing, so report must state limits. */
export async function runPermissionedHtmlPilot(args:{cases:readonly PilotCase[];
 recipeStore:ReviewedRecipeStore;watchDbPath:string;asOf:string;
 transportFor:(p:PilotCase)=>SourceTransport|undefined;}):Promise<PilotReport>{
 if(!Array.isArray(args.cases)||args.cases.length<2||args.cases.length>30||
  !args.watchDbPath||typeof args.transportFor!=='function'||!args.recipeStore)
  throw Error('phase93_invalid_pilot_configuration');
 const caseIds=new Set<string>(),models=new Set<string>(),urls=new Set<string>();
 for(const p of args.cases){
  if(!p||!id(p.caseId)||caseIds.has(p.caseId)||!p.candidate||!p.policy||!p.registry||
   !p.expectedModel||p.expectedModel.length>100||!id(p.annotator)||!id(p.labelReceipt)||
   p.annotator===p.registry.reviewedBy||!p.reference||
   !Object.keys(p.reference).length||Object.keys(p.reference).length>20||
   Object.entries(p.reference as Record<string,{number:number;unit:string}>).some(([key,v])=>!id(key)||!v||!Number.isFinite(v.number)||
     typeof v.unit!=='string'||v.unit.length>50)||
   models.has(p.expectedModel.toLowerCase())||urls.has(p.candidate.url)||
   !p.policy.rightsDocumentId||!p.policy.reviewedBy)
   throw Error('phase93_invalid_or_overlapping_pilot_reference');
  caseIds.add(p.caseId);models.add(p.expectedModel.toLowerCase());urls.add(p.candidate.url);
 }
 // A label maker cannot also approve the recipe being evaluated.
 const approved=(await args.recipeStore.snapshotHtml()).active;
 for(const p of args.cases){
  if(approved.some(r=>r.recipe.source_host===new URL(p.candidate.url).hostname&&
   r.recipe.category===p.registry.categoryId&&r.recipe.human_review.reviewer===p.annotator))
   throw Error('phase93_reference_annotator_is_recipe_reviewer');
 }
 const results:PilotCaseResult[]=[];
 for(const p of args.cases){
  const actual=await acquireReviewedHtmlSpecifications({registry:p.registry,candidate:p.candidate,
   policy:p.policy,asOf:args.asOf,expectedModel:p.expectedModel,
   recipeStore:args.recipeStore,transport:args.transportFor(p),
   watchDbPath:args.watchDbPath,monitoringMode:'required'});
  const found=new Map<string,{number:number;unit:string}>();
  for(const o of actual.observations){
   if(o.value.type==='number'&&o.value.unit){
    found.set(o.fieldKey,{number:o.value.number,unit:o.value.unit});
   }
  }
  let correct=0,incorrect=0,missing=0,unexpected=0;
  for(const [key,reference] of Object.entries(p.reference as Record<string,{number:number;unit:string}>)){
   const actualField=found.get(key);
   if(!actualField)missing++;
   else if(actualField.number===reference.number&&actualField.unit===reference.unit)correct++;
   else incorrect++;
  }
  for(const field of found.keys())if(!Object.hasOwn(p.reference,field))unexpected++;
  results.push({caseId:p.caseId,status:actual.status,reasons:actual.reasons,
   correct,incorrect,missing,unexpected,extracted:found.size,
   referenceCount:Object.keys(p.reference).length,monitoring:actual.monitoring,
   recipeDigest:actual.recipeSha256});
 }
 const sum=(k:'correct'|'incorrect'|'missing'|'unexpected')=>results.reduce((n,r)=>n+r[k],0);
 const correct=sum('correct'),incorrect=sum('incorrect'),missing=sum('missing'),unexpected=sum('unexpected');
 const pden=correct+incorrect+unexpected,rden=correct+incorrect+missing;
 return {schema:'phase93_permissioned_pilot_v1',cases:results.length,
  quarantinedCases:results.filter(r=>r.status==='quarantined').length,
  blockedCases:results.filter(r=>r.status==='blocked').length,
  correct,incorrect,missing,unexpected,precision:pden?correct/pden:null,
  recall:rden?correct/rden:null,results,automaticLlmCalls:0,publicationReady:false,
  validationLevel:'controlled_or_permissioned_cases_only'};
}
