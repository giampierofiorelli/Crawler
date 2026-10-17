/** Phase268 — the smallest defensible path from stored, UNREVIEWED publisher-reported test measurements
 * (test_measurements265) to the existing Phase181 product-knowledge catalog. Four responsibilities stay separate:
 *
 *  1. scientific validation rules (validateTestMeasurements268): provenance, source qualification, exact product,
 *     measurand and protocol, stated conditions, duplicates and conflicts. Deterministic, versioned, explainable.
 *  2. expert-source qualification (ValidationPolicy268.qualifiedPublishers): which publishers' first-hand methods are
 *     accepted for which measurand, and on what recorded basis. An owner decision, never inferred from publisher type.
 *  3. deterministic scoring (compileCatalog268 under ScoringPolicy268): a fixed, versioned transformation of raw values
 *     to Phase181 valuePoints; the raw value and unit travel with every point.
 *  4. certification and signing: NOT here. A compiled catalog is unsigned; Phase180/181 accept it only when a pinned
 *     authority key signs it. Who may hold that key is an owner decision.
 *
 * Nothing is written back to the store: the store's CHECK constraints keep every row unreviewed. A validated
 * measurement is "valid under policy P (machine-checked)", not "reviewed", and never independence established.
 */
import type {ProductKnowledgeCatalog181,KnowledgeDimension181,OriginalTest181,ProductKnowledge181,TEST_LIMITATIONS181} from './phase181_dynamic_knowledge_ranking.js';
type Limitation181=(typeof TEST_LIMITATIONS181)[number];
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {createHash} from 'node:crypto';

type Row265=ReturnType<KnowledgeStore246['testMeasurements265']>[number];
export interface Protocol268 {
 id:string;measurand:'appliance_energy_one_hour_empty';unit:'kwh';setpointC:number;
 /** How an empty load is established: only when the value's own text says so ('stated'); also from the same document's
  * first-person test protocol ('stated_or_document_protocol'); also from the qualified publisher's recorded protocol
  * when the review is silent ('stated_or_publisher_protocol', an inference across documents). */
 load:'stated'|'stated_or_document_protocol'|'stated_or_publisher_protocol';
 /** Conditions taken from the rest of the same text block (not the value's own sentence) are acceptable. */
 acceptBlockContext:boolean;
 /** Whole appliance as tested: a value reported for one compartment of a multi-compartment product is another measurand. */
 compartments:'whole_appliance';
 /** Lower measured energy is better for this measurand. */
 direction:'lower_is_better';
 /** Phase269: the category measurement concept this protocol produces (category knowledge decides which consumer
  * outcomes it can and cannot establish), and whether it measures a fixed duration rather than a completed task. */
 measureId?:string;fixedDuration?:boolean;
}
/** Phase270: 'authorised_partial_comparison_only' is the owner's restricted authorisation (brief 2026-10-17 §4/§5): the
 * policy may produce accurately labelled partial evidence comparisons of raw quantities, conditional on catalog
 * verification and on identity, provenance and rights checks. It authorises no recommendation, no ranking and no
 * exact-variant promotion of a name-only identity. */
export type PolicyStatus268='proposed_not_authorised'|'authorised_partial_comparison_only'|'authorised';
export interface QualifiedPublisher268 {host:string;qualifiedFor:readonly string[];basis:readonly string[];
 /** The publisher's recorded protocol: conditions it applies to every result of the measurand. */
 recordedProtocol:readonly string[];reviewedBy:string}
export interface ValidationPolicy268 {
 policyId:string;revision:number;status:PolicyStatus268;
 qualifiedPublishers:readonly QualifiedPublisher268[];protocols:readonly Protocol268[];
 identity:{requireDeclaredModelCode:boolean;
  /** Phase269 (r2): which identity confidence a test needs to support a consumer ranking, versus a labelled comparison. */
  rankingRequires?:'model_code_in_tested_subject';comparisonAllows?:'product_name_only'|'model_code_in_tested_subject'};
}
export interface ScoringPolicy268 {
 policyId:string;revision:number;status:PolicyStatus268;
 /** valuePoints = round(10000 * (zeroPointsAt - value) / (zeroPointsAt - fullPointsAt)), clipped to [0, 10000]:
  * linear in the measured quantity (energy and its cost are proportional), so equal kWh differences are equal point
  * differences; the anchors are fixed by policy, not by the products present (adding a product never moves others). */
 dimensions:readonly {key:string;label:string;protocolId:string;
  /** r1: linear with fixed anchors. r2: 'raw_quantity_only' keeps the measured value and assigns no score (valuePoints 0). */
  mode?:'linear_anchored'|'raw_quantity_only';fullPointsAt:number;zeroPointsAt:number;
  weightUnits:KnowledgeDimension181['weightUnits'];justification:string}[];
}

/** r1 as proposed and evaluated in Phase268 (kept unchanged for reproduction). */
export const VALIDATION_POLICY268_R1:ValidationPolicy268={
 policyId:'pee268-test-evidence-validation',revision:1,status:'proposed_not_authorised',
 qualifiedPublishers:[{host:'www.expertreviews.co.uk',qualifiedFor:['appliance_energy_one_hour_empty'],
  basis:['first-hand tests by named staff reviewers','energy protocol stated in its own reviews','not a manufacturer or retailer of the products',
   'commercial: advertising and affiliate links (disclosed); independence of a result is not established'],
  recordedProtocol:['load_empty','duration_1h','setpoint_200c','power_meter','all_compartments'],
  reviewedBy:'Claude (sole development agent), 2026-10-16: proposal for owner approval'}],
 protocols:[{id:'er_energy_1h_empty_200c_v1',measurand:'appliance_energy_one_hour_empty',unit:'kwh',setpointC:200,load:'stated_or_document_protocol',
  acceptBlockContext:true,compartments:'whole_appliance',direction:'lower_is_better'}],
 identity:{requireDeclaredModelCode:false},
};
export const SCORING_POLICY268_R1:ScoringPolicy268={
 policyId:'pee268-energy-scoring',revision:1,status:'proposed_not_authorised',
 dimensions:[{key:'low_energy_use',label:'Measured electricity use (1 hour empty at 200 °C, one publisher protocol)',protocolId:'er_energy_1h_empty_200c_v1',
  fullPointsAt:0,zeroPointsAt:2,weightUnits:{hard:8000,high:4000,normal:2000,low:500},
  justification:'linear in kWh; 0 kWh = 10000 points, 2 kWh (above every appliance in the protocol) = 0; fixed anchors'}],
};
/** r2 (Phase269, proposed): the protocol names its measurement concept (a fixed-duration empty run, which category
 * knowledge marks as not sufficient for energy per cooked meal); identity confidence decides ranking eligibility. */
export const VALIDATION_POLICY268:ValidationPolicy268={...VALIDATION_POLICY268_R1,revision:2,status:'authorised_partial_comparison_only',
 protocols:VALIDATION_POLICY268_R1.protocols.map(p=>({...p,measureId:'energy_empty_run',fixedDuration:true})),
 identity:{requireDeclaredModelCode:false,rankingRequires:'model_code_in_tested_subject',comparisonAllows:'product_name_only'}};
/** r2 (Phase269, proposed): no score. The dimension is the measurement itself, compared only by its raw quantity, and it
 * cannot be confirmed as any consumer outcome (its key is a measurement id, not a need id). The r1 anchors are retired:
 * no replacement anchors are invented. */
export const SCORING_POLICY268:ScoringPolicy268={policyId:'pee268-energy-scoring',revision:2,status:'authorised_partial_comparison_only',
 dimensions:[{key:'energy_empty_run',label:'Electricity used in a fixed one-hour empty run at 200 °C (one publisher protocol; not energy to cook a meal)',
  protocolId:'er_energy_1h_empty_200c_v1',mode:'raw_quantity_only',fullPointsAt:0,zeroPointsAt:0,weightUnits:{hard:8000,high:4000,normal:2000,low:500},
  justification:'raw kWh only; no consumer score'}]};
/** Phase269: the protocol a catalog method id refers to (the request path asks category knowledge what it establishes). */
export function protocolOfMethod268(methodId:string,policies:readonly ValidationPolicy268[]=[VALIDATION_POLICY268]):Protocol268|null{
 for(const p of policies)for(const x of p.protocols)if(x.id===methodId)return x;return null;
}

export type Rejection268='not_current'|'not_retained'|'publisher_not_qualified'|'not_a_test_publisher_source'|'subject_unresolved'|'model_code_not_declared'|
 'measurand_not_in_protocol'|'setpoint_not_stated'|'setpoint_differs'|'duration_not_stated'|'load_not_established'|'block_context_not_accepted'|
 'single_compartment_value'|'conflicting_values_for_product'|'duplicate_of_another_revision';
export interface Validated268 {
 measurementId:string;productId:string;productName:string;declaredModel:string|null;protocolId:string;value:number;unit:string;
 source:{host:string;url:string;sha256:string;fetchedAt:string};
 /** What made it acceptable, and what limits it (always stated in the answer). */
 basis:readonly string[];limitations:readonly string[];
 /** Phase269: identity confidence and the distinct qualifications that are easily conflated. */
 identityConfidence:'model_code_in_tested_subject'|'product_name_only';
 publisherQualification:'qualified_for_measurand_by_policy';firstHand:'first_person_statement'|'review_test_protocol';
 limitationCodes:readonly Limitation181[];
 status:'valid_under_policy';policyId:string;policyRevision:number;policyStatus:ValidationPolicy268['status'];
 independenceEstablished:false;humanReviewed:false;
}
export interface Rejected268 {measurementId:string;productId:string|null;value:number|null;unit:string;reasons:readonly Rejection268[]}
export interface ValidationRun268 {validated:readonly Validated268[];rejected:readonly Rejected268[]}

/** Rule set 1. Every rejection names its reasons; nothing is promoted silently and nothing is written back. */
export function validateTestMeasurements268(rows:readonly Row265[],product:(id:string)=>{name:string|null;declaredModel:string|null}|null,policy:ValidationPolicy268):ValidationRun268{
 const ok:Validated268[]=[];const rejected:Rejected268[]=[];
 for(const r of [...rows].sort((a,b)=>a.measurementId.localeCompare(b.measurementId))){
  const why:Rejection268[]=[];const basis:string[]=[];const lim:string[]=[];
  if(r.state!=='current')why.push('not_current');
  if(r.value===null||!['facts_retained','facts_retained_class_policy'].includes(r.retention))why.push('not_retained');
  if(r.source.sourceType!=='independent_original_test'||r.reportedBy!=='test_publisher_operator_asserted')why.push('not_a_test_publisher_source');
  const pub=policy.qualifiedPublishers.find(p=>p.host===r.source.host);
  const proto=pub?policy.protocols.find(p=>p.unit===r.unit&&pub.qualifiedFor.includes(p.measurand)):undefined;
  if(!pub)why.push('publisher_not_qualified');else if(!proto)why.push('measurand_not_in_protocol');
  const p=r.productId?product(r.productId):null;
  if(!r.productId||!p||r.subjectAssociation!=='page_main_product_unverified')why.push('subject_unresolved');
  else if(policy.identity.requireDeclaredModelCode&&!p.declaredModel)why.push('model_code_not_declared');
  else if(!p.declaredModel)lim.push('the tester names the product without a model code; the exact variant rests on the product name');
  const codes=new Set(r.conditionCodes),doc=new Set(r.protocolCodes);
  if(proto&&pub){
   if(r.setpointC===null)why.push('setpoint_not_stated');else if(r.setpointC!==proto.setpointC)why.push('setpoint_differs');
   if(!codes.has('duration_1h'))why.push('duration_not_stated');
   if(codes.has('load_empty'))basis.push('empty load stated with the value');
   else if(proto.load!=='stated'&&doc.has('load_empty'))basis.push("empty load stated by the same review's own test protocol");
   else if(proto.load==='stated_or_publisher_protocol'&&pub.recordedProtocol.includes('load_empty')){basis.push("empty load from the publisher's recorded protocol");
    lim.push("this review does not itself say the appliance ran empty; the publisher's protocol does");}
   else why.push('load_not_established');
   if(codes.has('conditions_from_block')){if(!proto.acceptBlockContext)why.push('block_context_not_accepted');else lim.push('a condition is stated in the same paragraph, not the same sentence');}
   if(codes.has('single_compartment'))why.push('single_compartment_value');
   if(codes.has('all_compartments')||doc.has('all_compartments'))basis.push('every compartment running');
   if(codes.has('includes_preheat'))lim.push('includes the preheat');
   if(codes.has('power_meter')||doc.has('power_meter'))basis.push('plug-in power meter');
  }
  if(why.length){rejected.push({measurementId:r.measurementId,productId:r.productId,value:r.value,unit:r.unit,reasons:[...new Set(why)]});continue;}
  const lc:Limitation181[]=[];if(!p!.declaredModel)lc.push('identity_by_product_name_only');if(codes.has('conditions_from_block'))lc.push('condition_from_same_paragraph');
  if(!codes.has('load_empty')&&doc.has('load_empty'))lc.push('load_from_document_protocol');else if(!codes.has('load_empty'))lc.push('load_from_publisher_protocol');
  if(codes.has('all_compartments')||doc.has('all_compartments'))lc.push('all_compartments_running');if(codes.has('includes_preheat'))lc.push('includes_preheat');
  if(proto!.fixedDuration)lc.push('fixed_duration_not_cooking_task');if(policy.qualifiedPublishers.length===1)lc.push('single_publisher');
  ok.push({measurementId:r.measurementId,productId:r.productId!,productName:p!.name??r.productId!,declaredModel:p!.declaredModel,protocolId:proto!.id,value:r.value!,unit:r.unit,
   identityConfidence:p!.declaredModel?'model_code_in_tested_subject':'product_name_only',publisherQualification:'qualified_for_measurand_by_policy',
   firstHand:r.methodCue==='energy_result_with_document_protocol'?'review_test_protocol':'first_person_statement',limitationCodes:lc,
   source:{host:r.source.host,url:r.source.url,sha256:r.source.sha256,fetchedAt:r.source.fetchedAt},basis,limitations:lim,status:'valid_under_policy',
   policyId:policy.policyId,policyRevision:policy.revision,policyStatus:policy.status,independenceEstablished:false,humanReviewed:false});
 }
 // Duplicates and conflicts per product and protocol: equal values from several revisions count once; different values
 // are a conflict and none of them is used (resolution is a review, not an average).
 const groups=new Map<string,Validated268[]>();for(const v of ok){const k=v.productId+'|'+v.protocolId;groups.set(k,[...(groups.get(k)??[]),v]);}
 const keep:Validated268[]=[];
 for(const g of groups.values()){
  if(new Set(g.map(v=>v.value)).size>1){for(const v of g)rejected.push({measurementId:v.measurementId,productId:v.productId,value:v.value,unit:v.unit,reasons:['conflicting_values_for_product']});continue;}
  keep.push(g[0]);for(const v of g.slice(1))rejected.push({measurementId:v.measurementId,productId:v.productId,value:v.value,unit:v.unit,reasons:['duplicate_of_another_revision']});
 }
 return {validated:keep.sort((a,b)=>a.measurementId.localeCompare(b.measurementId)),rejected:rejected.sort((a,b)=>a.measurementId.localeCompare(b.measurementId))};
}

/** Rule set 3: deterministic scoring and compilation into an UNSIGNED Phase181 catalog. */
export function points268(value:number,d:ScoringPolicy268['dimensions'][number]):number{
 if(d.mode==='raw_quantity_only')return 0;
 const x=10000*(d.zeroPointsAt-value)/(d.zeroPointsAt-d.fullPointsAt);return Math.max(0,Math.min(10000,Math.round(x)));
}
export function compileCatalog268(v:ValidationRun268,scoring:ScoringPolicy268,args:{categoryId:string;market:string;discoveredVariantIds:readonly string[];
 reviewedAt:string;expiresAt:string;validationPolicy:ValidationPolicy268}):ProductKnowledgeCatalog181{
 const tests:OriginalTest181[]=[];const products=new Map<string,ProductKnowledge181>();
 // Phase181 accepts only identifiers (/^[a-z][a-z0-9_.:-]*$/) in its reference fields; prose stays in the policies.
 const vp=args.validationPolicy,st=(s:string)=>s==='authorised'?'authorised':s==='authorised_partial_comparison_only'?'partial-comparison-only':'proposed';
 const ver=`${vp.policyId}:r${vp.revision}`;
 for(const d of scoring.dimensions)for(const m of v.validated.filter(x=>x.protocolId===d.protocolId)){
  const id='t_'+createHash('sha256').update(m.measurementId+'|'+d.key).digest('hex').slice(0,20);
  tests.push({id,variantId:m.productId,dimensionKey:d.key,originalTestId:m.measurementId,methodId:m.protocolId,protocolVersion:ver,
   sourceUrl:m.source.url,observedAt:m.source.fetchedAt.replace(/\.\d+Z$/,'Z'),
   // Phase269: exact-variant scope only when the tested subject's own model code identifies it.
   scope:m.identityConfidence==='model_code_in_tested_subject'?'exact_variant_original_professional_test':'named_product_original_professional_test',
   ...(d.mode==='raw_quantity_only'?{measured:{value:m.value,unit:m.unit,direction:'lower_is_better' as const},limitations:[...m.limitationCodes]}:{})});
  const p=products.get(m.productId)??{variantId:m.productId,name:m.productName,observations:[]};
  products.set(m.productId,{...p,observations:[...p.observations,{dimensionKey:d.key,valuePoints:points268(m.value,d),hardOutcome:'pass',evidenceId:id}]});
 }
 const pol=`${scoring.policyId}:r${scoring.revision}:${st(scoring.status)}`;
 return {phase:181,schema:'181.1',market:args.market,categoryId:args.categoryId,
  knowledgeRevision:'k268_'+createHash('sha256').update(JSON.stringify(v.validated.map(x=>[x.measurementId,x.value]))).digest('hex').slice(0,16),
  policyRevision:pol,reviewedAt:args.reviewedAt,expiresAt:args.expiresAt,discoveredVariantIds:[...new Set(args.discoveredVariantIds)].sort(),
  coverageStatement:`Products of this category with a measurement valid under ${ver} (${vp.status}); one publisher; not market coverage.`,
  marketCoverageComplete:false,
  dimensions:scoring.dimensions.map(d=>({key:d.key,label:d.label,value:{kind:'boolean',value:true},methodId:d.protocolId,protocolVersion:ver,
   weightUnits:d.weightUnits,weightingReviewReference:pol,normalizationReviewReference:`${pol}:${d.mode==='raw_quantity_only'?'raw-quantity-only':'linear-anchored'}`,
   ...(d.mode==='raw_quantity_only'?{valueKind:'raw_quantity_only' as const}:{})})),
  originalTests:tests.sort((a,b)=>a.id.localeCompare(b.id)),products:[...products.values()].sort((a,b)=>a.variantId.localeCompare(b.variantId)),
  externalReviewReference:`not_externally_reviewed:machine_validated:${ver}:${st(vp.status)}`};
}
