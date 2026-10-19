/** S87d/S87e — the scientific contract of an observation (docs/plans/s87c-observation-contract-v0.2.md; v0.3 corrections
 * from the owner review of S87d, `owner-review-s87d-2026-10-19.md`). SHADOW: nothing operational reads it.
 *
 * One record shape for four result forms:
 *  - quantity:    a measured, calculated or declared number with its unit;
 *  - categorical: a nominal, ordinal or boolean property value (a material, a feature present, an energy class) — declared
 *                 or observed, never an evaluation;
 *  - judgement:   an evaluation with a polarity (an expert found the rinse result disappointing);
 *  - comparison:  a relation among several subjects in one experiment or statement (A cleaned better than B; the values of
 *                 several appliances on one task), with its members and the stated reasons.
 * Every slot is STATED (with an evidence pointer), INFERRED (naming the rule or knowledge item) or UNKNOWN, and no slot is
 * stronger than its evidence: an unverified page-product association is inferred, a test cue is not an instrument, a cost
 * computed from energy and a tariff is CALCULATED. Two separate reports: structural validity (the record can be stored
 * without corrupting anything) and scientific completeness per purpose (what is missing to interpret, describe, compare,
 * decide). Read-only adapters map the existing store tables; what a table cannot fill stays unknown. */

export const OBSERVATION_CONTRACT_VERSION='pee.observation.v0.3';
export type SlotState='stated'|'inferred'|'unknown';
export interface Slot<T> {state:SlotState;value:T|null;evidence?:string|null;rule?:string|null}
export const unknown=<T>():Slot<T>=>({state:'unknown',value:null});
export const stated=<T>(value:T|null|undefined,evidence:string|null=null):Slot<T>=>value===null||value===undefined||value===''?unknown<T>():{state:'stated',value,evidence};
export const inferred=<T>(value:T|null|undefined,rule:string):Slot<T>=>value===null||value===undefined||value===''?unknown<T>():{state:'inferred',value,rule};

export type ResultForm='quantity'|'categorical'|'judgement'|'comparison';
/** observed: read or measured as published; calculated: computed from other values (named); assumed: a convention filled it */
export interface Derivation {kind:'observed'|'calculated'|'assumed';from?:string[];rule?:string|null}
export type ObservationBasis='instrumented_measurement'|'reported_test_method_unspecified'|'hands_on_use_test'|'expert_inspection'|'user_report'|'declaration';
export type EvidentialRole='independent_test'|'manufacturer_declaration'|'retailer_declaration'|'editorial_declaration'|'secondary_reference_declaration'|'reviewer_claim'|'user'|'unknown';
export interface Constraint {dimension:string;value:string;state:SlotState;evidence?:string|null;rule?:string|null}
export interface Subject {name:Slot<string>;model:Slot<string>;productId:Slot<string>;
 /** what the subject is known to be: a product (stated or inferred association), only an appliance class, or unknown */
 level:'product'|'appliance_class'|'unknown';identity:SlotState}
export interface ComparisonMember {subject:number;value?:number|null;unit?:string|null;rank?:number|null;judgement?:'positive'|'negative'|'mixed'|'neutral'|null;memberObservation?:string|null}
export interface ObservationRecord {
 contract:typeof OBSERVATION_CONTRACT_VERSION;
 source:{table:string;id:string};
 subjects:Subject[];
 assessed:{property:Slot<string>;objectOfInterest:Slot<string>;constraints:Constraint[];basis:Slot<string>;statistic:Slot<string>};
 result:{form:ResultForm;derivation:Derivation;
  quantity?:{value:number|null;unit:Slot<string>;quantityKind:Slot<string>;approximate:boolean;
   /** a stated interval (range), the components of a vector (W×H×D) or the offered alternatives (options) */
   low?:number;high?:number;components?:number[]};
  categorical?:{value:string;scale:'nominal'|'ordinal'|'boolean'};
  judgement?:{polarity:'positive'|'negative'|'mixed'|'neutral';grade:Slot<string>;strength:Slot<'explicit'|'hedged'>};
  comparison?:{experiment:Slot<string>;task:Slot<string>;relation:Slot<'better'|'worse'|'equal'|'ordered'|'values_only'>;members:ComparisonMember[];reasons:string[]}};
 observationBasis:Slot<ObservationBasis>;
 procedure:Slot<string>;
 parameters:{name:string;value:string}[];
 influenceConditions:Constraint[];
 observer:{publisher:Slot<string>;role:EvidentialRole};
 limitations:string[];
 uncertainty:Slot<string>;
 provenance:{document:string|null;evidence:string|null;readerVersion:string|null};
}
/** @deprecated v0.2 name, kept for callers of S87d */
export type ObservationV02=ObservationRecord;

// ------------------------------------------------------------------------------------------- 1. structural validity
export interface Finding {shape:string;path:string;message:string}
export interface ValidityReport {valid:boolean;violations:Finding[]}
interface Rule {id:string;path:string;applies:(o:ObservationRecord)=>boolean;holds:(o:ObservationRecord)=>boolean;message:string}
const slotsOf=(o:ObservationRecord)=>[o.assessed.property,o.assessed.objectOfInterest,o.assessed.basis,o.assessed.statistic,o.observationBasis,o.procedure,o.uncertainty,
 ...o.subjects.flatMap(s=>[s.name,s.model,s.productId]),...(o.result.quantity?[o.result.quantity.unit,o.result.quantity.quantityKind]:[]),
 ...(o.result.comparison?[o.result.comparison.experiment,o.result.comparison.task,o.result.comparison.relation]:[])];
export const STRUCTURE:readonly Rule[]=[
 {id:'V1-one-result-form',path:'result',applies:()=>true,
  holds:o=>(['quantity','categorical','judgement','comparison'] as const).filter(f=>!!o.result[f]).length===1&&!!o.result[o.result.form],message:'exactly one result form, matching result.form'},
 {id:'V3-inferred-names-rule',path:'*',applies:()=>true,holds:o=>slotsOf(o).every(s=>s.state!=='inferred'||!!s.rule)&&o.assessed.constraints.every(c=>c.state!=='inferred'||!!c.rule),
  message:'every inferred slot names the rule or knowledge item that supplied it'},
 {id:'V4-declaration-not-test',path:'observer.role',applies:o=>o.observationBasis.value==='declaration',holds:o=>o.observer.role!=='independent_test',message:'a declaration is never an independent test'},
 {id:'V5-calculated-names-inputs',path:'result.derivation',applies:o=>o.result.derivation.kind!=='observed',holds:o=>!!o.result.derivation.rule&&(o.result.derivation.kind!=='calculated'||!!o.result.derivation.from?.length),
  message:'a calculated or assumed result names its rule (and, if calculated, its inputs)'},
 {id:'V6-comparison-members',path:'result.comparison.members',applies:o=>o.result.form==='comparison',holds:o=>(o.result.comparison?.members.length??0)>=2&&o.result.comparison!.members.every(m=>m.subject>=0&&m.subject<o.subjects.length),
  message:'a comparison has at least two members, each a listed subject'},
 {id:'V7-judgement-polarity',path:'result.judgement',applies:o=>o.result.form==='judgement',holds:o=>!!o.result.judgement?.polarity,message:'a judgement has a polarity'},
 {id:'V8-categorical-value',path:'result.categorical',applies:o=>o.result.form==='categorical',holds:o=>!!o.result.categorical?.value,message:'a categorical result has a value'},
 {id:'V9-instrument-claim-needs-evidence',path:'observationBasis',applies:o=>o.observationBasis.value==='instrumented_measurement',
  holds:o=>o.observationBasis.state==='stated'||o.parameters.some(p=>p.name==='instrument')||o.assessed.constraints.some(c=>/meter|instrument/.test(c.value)),
  message:'instrumented measurement is claimed only with a stated instrument or protocol'},
];
export function checkStructure(o:ObservationRecord):ValidityReport{
 const violations:Finding[]=[];for(const r of STRUCTURE)if(r.applies(o)&&!r.holds(o))violations.push({shape:r.id,path:r.path,message:r.message});
 return {valid:!violations.length,violations};
}

// ----------------------------------------------------------------------------------- 2. scientific completeness per purpose
export type Purpose='interpret'|'describe_product'|'compare'|'decide';
export interface PurposeStatus {status:'complete'|'complete_with_inferences'|'incomplete';missing:string[];inferred:string[];notAssessed:string[]}
const EXTENSIVE=new Set(['energy','volume','price_or_cost','duration']);
/** What the record lacks for each use. Condition relevance (defining vs influencing) is knowledge not yet built (contract
 * §3), so 'compare' reports it as not assessed instead of passing or failing it. */
export function assessCompleteness(o:ObservationRecord):Record<Purpose,PurposeStatus>{
 const need=(entries:[string,Slot<unknown>|SlotState|boolean][])=>{const missing:string[]=[],inf:string[]=[];
  for(const [k,v] of entries){const st=typeof v==='boolean'?(v?'stated':'unknown'):typeof v==='string'?v:v.state;if(st==='unknown')missing.push(k);else if(st==='inferred')inf.push(k);}return {missing,inf};};
 const s0=o.subjects[0];const q=o.result.quantity;
 const interpret=need([['assessed.property',o.assessed.property],['result',!!o.result[o.result.form]],['observationBasis',o.observationBasis],
  ...(q?[['result.quantity.unit',q.unit] as [string,Slot<unknown>]]:[])]);
 const describe=need([...interpretEntries(o),['subject.product',s0&&s0.level==='product'?s0.identity:'unknown']]);
 const compare=need([...interpretEntries(o),['subject.product',s0&&s0.level==='product'?s0.identity:o.result.form==='comparison'?'stated':'unknown'],
  ...(q&&EXTENSIVE.has(q.quantityKind.value??'')?[['assessed.basis',o.assessed.basis] as [string,Slot<unknown>]]:[]),
  ...(q&&q.quantityKind.state==='unknown'?[['result.quantity.quantityKind',q.quantityKind] as [string,Slot<unknown>]]:[]),
  ['procedure_or_experiment',o.procedure.state!=='unknown'?o.procedure:o.result.comparison?.experiment??unknown()]]);
 const decide=need([...interpretEntries(o),['subject.product',s0&&s0.level==='product'?(s0.identity==='stated'?'stated':'unknown'):'unknown'],
  ['observer.role',o.observer.role==='unknown'?'unknown':'stated']]);
 const st=(x:{missing:string[];inf:string[]},notAssessed:string[]=[]):PurposeStatus=>({status:x.missing.length?'incomplete':x.inf.length?'complete_with_inferences':'complete',missing:x.missing,inferred:x.inf,notAssessed});
 // S87e review: a missing numeric uncertainty is not a veto; whether the evidence suffices depends on the kind of evidence and
 // the consumer's goal (GUM 3.1.3; GRADE), so it is reported as not assessed here, never as a missing slot
 const decideNA=['condition_relevance','sufficiency_for_need',...(o.uncertainty.state==='unknown'?['uncertainty_unknown_judge_by_purpose']:[])];
 return {interpret:st(interpret),describe_product:st(describe),compare:st(compare,['condition_relevance']),decide:st(decide,decideNA)};
}
function interpretEntries(o:ObservationRecord):[string,Slot<unknown>|SlotState|boolean][]{
 return [['assessed.property',o.assessed.property],['observationBasis',o.observationBasis],...(o.result.quantity?[['result.quantity.unit',o.result.quantity.unit] as [string,Slot<unknown>]]:[])];
}

// ------------------------------------------------------------------------------------------- slot accounting (measurement)
export function slotStates(o:ObservationRecord):Record<string,SlotState>{
 const s0=o.subjects[0];
 const out:Record<string,SlotState>={'subject.product':s0&&s0.level==='product'?s0.identity:'unknown','subject.model':s0?s0.model.state:'unknown',
  'assessed.property':o.assessed.property.state,'assessed.objectOfInterest':o.assessed.objectOfInterest.state,'assessed.basis':o.assessed.basis.state,
  'assessed.statistic':o.assessed.statistic.state,
  'assessed.constraints':o.assessed.constraints.length?(o.assessed.constraints.some(c=>c.state==='stated')?'stated':'inferred'):'unknown',
  observationBasis:o.observationBasis.state,procedure:o.procedure.state,uncertainty:o.uncertainty.state,
  'observer.publisher':o.observer.publisher.state,'observer.role':o.observer.role==='unknown'?'unknown':'stated',
  'provenance.evidence':o.provenance.evidence?'stated':'unknown'};
 if(o.result.quantity){out['result.unit']=o.result.quantity.unit.state;out['result.quantityKind']=o.result.quantity.quantityKind.state;}
 if(o.result.judgement){out['result.grade']=o.result.judgement.grade.state;out['result.strength']=o.result.judgement.strength.state;}
 if(o.result.comparison){out['comparison.experiment']=o.result.comparison.experiment.state;out['comparison.relation']=o.result.comparison.relation.state;}
 return out;
}

// ------------------------------------------------------------------------------------------------ read-only adapters
const J=(s:unknown):unknown=>{if(typeof s!=='string')return s??null;try{return JSON.parse(s);}catch{return null;}};
const hostOf=(u:unknown)=>{if(!u)return null;try{return new URL(String(u)).hostname.replace(/^www\./,'');}catch{return null;}};
const OBSERVED:Derivation={kind:'observed'};
const base=(table:string,id:string,form:ResultForm):ObservationRecord=>({contract:OBSERVATION_CONTRACT_VERSION,source:{table,id},subjects:[],
 assessed:{property:unknown(),objectOfInterest:unknown(),constraints:[],basis:unknown(),statistic:unknown()},result:{form,derivation:OBSERVED},observationBasis:unknown(),
 procedure:unknown(),parameters:[],influenceConditions:[],observer:{publisher:unknown(),role:'unknown'},limitations:[],uncertainty:unknown(),
 provenance:{document:null,evidence:null,readerVersion:null}});
const ROLE:Record<string,EvidentialRole>={manufacturer_declaration:'manufacturer_declaration',retailer_declaration:'retailer_declaration',
 editorial_declaration:'editorial_declaration',secondary_reference_declaration:'secondary_reference_declaration',
 independent_original_test:'independent_test',test_publisher_operator_asserted:'independent_test',reviewer_claim:'reviewer_claim'};
/** a product association the reader did not verify is an inference, not a statement */
const pageProduct=(productId:unknown,association:string,ev:string):Subject=>{
 const unresolved=!productId||/unresolved|ambiguous/.test(association);const cls=/class/.test(association);
 return {name:unknown(),model:unknown(),productId:unresolved||cls?unknown():inferred(productId as string,'reader association: '+association),
  level:cls?'appliance_class':unresolved?'unknown':'product',identity:unresolved||cls?'unknown':/unverified/.test(association)?'inferred':'stated'};};

/** test_measurements265 row (snake_case, as stored), with its source url joined by the caller. */
export function fromTestMeasurement265(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationRecord{
 const o=base('test_measurements265',String(r.measurement_id),'quantity');const ev=`block:${r.block_sha256}#${r.block_index}@${r.value_offset}`;
 o.subjects=[pageProduct(r.product_id,String(r.subject_association??''),ev)];
 const dim=r.dimension&&r.dimension!=='not_established'?String(r.dimension):null;o.assessed.property=dim?stated(dim,ev):unknown();
 const codes=(J(r.condition_codes) as string[]|null)??[];
 o.assessed.constraints=codes.map(c=>({dimension:'reader_code',value:c,state:'stated' as SlotState,evidence:ev}));
 if(r.condition)o.assessed.constraints.push({dimension:'condition_text',value:String(r.condition),state:'stated',evidence:ev});
 if(r.setpoint_c!==null&&r.setpoint_c!==undefined)o.assessed.constraints.push({dimension:'temperature_setpoint',value:`${r.setpoint_c} °C`,state:'stated',evidence:ev});
 o.result.quantity={value:(r.value as number)??null,unit:stated(r.unit as string,ev),quantityKind:unknown(),approximate:false};
 const proto=(J(r.protocol_codes) as string[]|null)??[];o.procedure=proto.length?stated(proto.join('+'),ev):unknown();
 if(r.instrument)o.parameters.push({name:'instrument',value:String(r.instrument)});
 // a test cue says a test was reported, not how it was measured; an instrument or a meter code says that
 o.observationBasis=r.instrument||[...codes,...proto].some(c=>/meter/.test(c))?stated<ObservationBasis>('instrumented_measurement',ev)
  :r.method_cue?inferred<ObservationBasis>('reported_test_method_unspecified','phase265 method cue: '+r.method_cue):unknown();
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:ROLE[String(r.reported_by)]??'unknown'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.extractor_version as string)??null};return o;
}
/** qualitative_observations270 row: an evaluation by the tester (a judgement), about a dish cooked in the appliance. */
export function fromQualitative270(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationRecord{
 const o=base('qualitative_observations270',String(r.observation_id),'judgement');const ev=`block:${r.block_sha256}#${r.block_index}`;
 o.subjects=[pageProduct(r.product_id,String(r.identity??''),ev)];
 o.assessed.property=stated(r.outcome as string,ev);o.assessed.objectOfInterest=stated(r.dish as string,Number(r.dish_from_heading)?'heading':ev);
 if(Number(r.setting_adjusted))o.assessed.constraints.push({dimension:'setting',value:'adjusted_by_tester',state:'stated',evidence:ev});
 o.result.judgement={polarity:r.direction as 'positive',grade:unknown(),strength:stated(r.strength as 'explicit',ev)};
 o.observationBasis=r.basis==='first_person_cooking_test'?stated<ObservationBasis>('hands_on_use_test',ev):unknown();
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:'independent_test'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.reader_version as string)??null};return o;
}
const cmpSubject=(r:Record<string,unknown>,ev:string):Subject=>({name:stated(r.subject_name as string,ev),model:stated(r.subject_model as string,ev),productId:stated(r.product_id as string,ev),
 level:r.identity==='equipment_class'?'appliance_class':['exact_variant','named_product'].includes(String(r.identity))?'product':'unknown',
 identity:['exact_variant','named_product'].includes(String(r.identity))?'stated':'unknown'});
/** comparative_results271 row: one appliance's value within a publisher's multi-appliance experiment (member observation). */
export function fromComparative271(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationRecord{
 const o=base('comparative_results271',String(r.result_id),'quantity');const ev=`block:${r.block_sha256}`;
 o.subjects=[cmpSubject(r,ev)];
 o.assessed.property=stated(r.measurand as string,ev);o.assessed.objectOfInterest=stated(r.task_label as string,ev);
 o.assessed.basis=r.task_label?inferred('per_task_or_cycle','cmp271: the value refers to one completed task of the experiment'):unknown();
 const codes=(J(r.condition_codes) as string[]|null)??[];
 o.assessed.constraints=codes.map(c=>({dimension:'experiment_code',value:c,state:'stated' as SlotState,evidence:ev}));
 o.result.quantity={value:(r.value as number)??null,unit:stated(r.unit as string,ev),quantityKind:stated(r.measurand==='cost'?'price_or_cost':String(r.measurand),ev),approximate:Number(r.approximate)===1};
 if(r.value_basis==='derived_from_tariff')o.result.derivation={kind:'calculated',from:['energy measured in the same experiment','tariff stated by the publisher'],rule:'cmp271: cost = energy × tariff (publisher calculation)'};
 else if(r.value_basis==='estimated')o.result.derivation={kind:'assumed',rule:'cmp271: value estimated by the publisher'};
 // the observation's evidence is the experiment; an instrument is claimed only where the publisher names the meter
 o.observationBasis=codes.includes('power_meter')&&r.measurand!=='duration'?stated<ObservationBasis>('instrumented_measurement',ev)
  :inferred<ObservationBasis>('reported_test_method_unspecified','cmp271: publisher-reported experiment');
 o.procedure=stated('publisher_experiment:'+r.experiment_key,ev);
 o.uncertainty=r.uncertainty?stated(String(r.uncertainty),ev):unknown();
 o.limitations=((J(r.limitations) as unknown[]|null)??[]).map(x=>typeof x==='string'?x:JSON.stringify(x));
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:'independent_test'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.reader_version as string)??null};return o;
}
/** The comparison itself: all appliances measured on one task of one experiment, as one relation with its members. */
export function comparisonsFromComparative271(rows:readonly Record<string,unknown>[],urlOf:(revisionId:string)=>string|null=()=>null):ObservationRecord[]{
 const groups=new Map<string,Record<string,unknown>[]>();
 for(const r of rows){const k=`${r.experiment_key}|${r.task_index}|${r.measurand}`;(groups.get(k)??groups.set(k,[]).get(k)!).push(r);}
 const out:ObservationRecord[]=[];
 for(const [k,g] of groups){if(g.length<2)continue;const r0=g[0]!;const ev=`block:${r0.block_sha256}`;const url=urlOf(String(r0.revision_id));
  const o=base('comparative_results271',`cmpset:${k}`,'comparison');
  o.subjects=g.map(r=>cmpSubject(r,`block:${r.block_sha256}`));
  o.assessed.property=stated(r0.measurand as string,ev);o.assessed.objectOfInterest=stated(r0.task_label as string,ev);
  o.assessed.basis=r0.task_label?inferred('per_task_or_cycle','cmp271: the value refers to one completed task of the experiment'):unknown();
  const shared=((J(r0.condition_codes) as string[]|null)??[]).filter(c=>g.every(r=>((J(r.condition_codes) as string[]|null)??[]).includes(c)));
  o.assessed.constraints=shared.map(c=>({dimension:'experiment_code',value:c,state:'stated' as SlotState,evidence:ev}));
  o.result.comparison={experiment:stated(String(r0.experiment_key),ev),task:stated(r0.task_label as string,ev),relation:stated<'values_only'>('values_only',ev),
   members:g.map((r,i)=>({subject:i,value:(r.value as number)??null,unit:(r.unit as string)??null,memberObservation:String(r.result_id)})),reasons:[]};
  if(g.some(r=>r.value_basis==='derived_from_tariff'))o.result.derivation={kind:'calculated',from:['energy measured in the same experiment','tariff stated by the publisher'],rule:'cmp271: cost = energy × tariff (publisher calculation)'};
  o.observationBasis=inferred<ObservationBasis>('reported_test_method_unspecified','cmp271: publisher-reported experiment');
  o.procedure=stated('publisher_experiment:'+r0.experiment_key,ev);
  o.limitations=[...new Set(g.flatMap(r=>((J(r.limitations) as unknown[]|null)??[]).map(x=>typeof x==='string'?x:JSON.stringify(x))))];
  o.observer={publisher:stated(hostOf(url),url),role:'independent_test'};o.provenance={document:url,evidence:ev,readerVersion:(r0.reader_version as string)??null};
  out.push(o);}
 return out;
}
/** A comparative judgement stated by a reviewer ("A cleaned dried-on stains better than B because ..."). Constructor for
 * readers; no store table holds these today. */
export function comparativeJudgement(a:{subjects:{name:string;model?:string|null}[];property:string;task?:string|null;relation:'better'|'worse'|'equal'|'ordered';
 ordering?:number[];reasons?:string[];evidence:string;document:string|null;publisher?:string|null;basis?:ObservationBasis}):ObservationRecord{
 const o=base('reader',`cmpjudgement:${a.evidence}`,'comparison');
 o.subjects=a.subjects.map(s=>({name:stated(s.name,a.evidence),model:stated(s.model??null,a.evidence),productId:unknown(),level:'product',identity:'stated'}));
 o.assessed.property=stated(a.property,a.evidence);if(a.task)o.assessed.objectOfInterest=stated(a.task,a.evidence);
 const order=a.ordering??a.subjects.map((_,i)=>i);
 o.result.comparison={experiment:unknown(),task:stated(a.task??null,a.evidence),relation:stated(a.relation,a.evidence),
  members:a.subjects.map((_,i)=>({subject:i,rank:order.indexOf(i)+1})),reasons:a.reasons??[]};
 o.observationBasis=a.basis?stated(a.basis,a.evidence):unknown();
 o.observer={publisher:stated(a.publisher??hostOf(a.document),a.document),role:'independent_test'};o.provenance={document:a.document,evidence:a.evidence,readerVersion:null};return o;
}
/** declarations row: a declared value (manufacturer, retailer, editorial or reference), never a test. Numeric declarations
 * (quantity, price, unitless number, range, dimensions, options) are quantities; text and yes/no declarations are
 * CATEGORICAL values (nominal or boolean) — declared attributes, not judgements. */
export function fromDeclaration(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationRecord{
 const v=(J(r.value_json) as Record<string,unknown>|null)??{};const kind=String(v.kind??'');const ev=String(r.locator??'')||null;
 const nums=Array.isArray(v.numbers)?(v.numbers as unknown[]).filter((x):x is number=>typeof x==='number'):[];
 const numeric=['quantity','price','number','range','dimensions','options'].includes(kind);
 const o=base('declarations',String(r.declaration_id),numeric?'quantity':'categorical');
 o.subjects=[{name:unknown(),model:unknown(),productId:stated(r.product_id as string,ev),level:'product',identity:'stated'}];
 o.assessed.property=stated(r.property_key as string,ev);if(r.component)o.assessed.objectOfInterest=stated(String(r.component),ev);
 if(numeric){const unit=kind==='price'?(typeof v.currency==='string'?v.currency:null):typeof v.unit==='string'?v.unit:null;
  const q:NonNullable<ObservationRecord['result']['quantity']>={value:typeof v.number==='number'?v.number:typeof v.amount==='number'?v.amount:null,
   unit:unit?stated(unit,ev):unknown(),quantityKind:kind==='price'?stated('price_or_cost',ev):unknown(),approximate:v.approximate===true};
  if(kind==='range'&&typeof v.min==='number'&&typeof v.max==='number'){q.low=v.min;q.high=v.max;}
  if((kind==='dimensions'||kind==='options')&&nums.length)q.components=nums;
  if(kind==='options')o.assessed.statistic=stated('available_options',ev);
  o.result.quantity=q;}
 else{const text=typeof v.text==='string'?v.text:typeof v.value==='boolean'?String(v.value):String(r.raw_value??'');
  o.result.categorical={value:text,scale:kind==='boolean'||/^(?:yes|no|true|false|✓|✗)$/i.test(text.trim())?'boolean':'nominal'};
  if(kind==='boolean'&&typeof v.qualifier==='string'&&v.qualifier)o.assessed.constraints.push({dimension:'qualifier',value:v.qualifier,state:'stated',evidence:ev});}
 o.observationBasis=stated<ObservationBasis>('declaration',ev);
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:ROLE[String(r.evidence_role)]??'unknown'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.method as string)??null};return o;
}
