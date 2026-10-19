/** S87d — the scientific contract of an observation, v0.2 (docs/plans/s87c-observation-contract-v0.2.md). SHADOW.
 *
 * One record for quantitative, qualitative and comparative findings. Every identity slot says whether it is STATED (with
 * an evidence pointer), INFERRED (with the convention or knowledge item that supplied it) or UNKNOWN; an unknown slot is
 * never equal to anything. Declarative shapes (SHACL-style: id, path, severity, message) check a record and return a
 * structured report. Read-only adapters map the existing store tables (test_measurements265, qualitative_observations270,
 * comparative_results271, declarations) into the contract; what a table cannot fill stays unknown, which measures what
 * each representation loses. Nothing here writes to the store or is read by an operational module. */

export const OBSERVATION_CONTRACT_VERSION='pee.observation.v0.2';
export type SlotState='stated'|'inferred'|'unknown';
export interface Slot<T> {state:SlotState;value:T|null;evidence?:string|null;rule?:string|null}
export const unknown=<T>():Slot<T>=>({state:'unknown',value:null});
export const stated=<T>(value:T|null|undefined,evidence:string|null=null):Slot<T>=>value===null||value===undefined||value===''?unknown<T>():{state:'stated',value,evidence};
export const inferred=<T>(value:T|null|undefined,rule:string):Slot<T>=>value===null||value===undefined||value===''?unknown<T>():{state:'inferred',value,rule};

export type ResultForm='quantitative'|'qualitative'|'comparative';
export type ObservationBasis='instrumented_measurement'|'hands_on_use_test'|'expert_inspection'|'user_report'|'declaration';
export type EvidentialRole='independent_test'|'manufacturer_declaration'|'retailer_declaration'|'editorial_declaration'|'secondary_reference_declaration'|'reviewer_claim'|'user'|'unknown';
export interface Constraint {dimension:string;value:string;state:SlotState;evidence?:string|null;rule?:string|null}
export interface ObservationV02 {
 contract:typeof OBSERVATION_CONTRACT_VERSION;
 source:{table:string;id:string};
 subjects:{name:Slot<string>;model:Slot<string>;productId:Slot<string>;identity:SlotState}[];
 assessed:{property:Slot<string>;objectOfInterest:Slot<string>;constraints:Constraint[];basis:Slot<string>;statistic:Slot<string>};
 result:{form:ResultForm;
  quantitative?:{value:number|null;unit:Slot<string>;quantityKind:Slot<string>;approximate:boolean};
  qualitative?:{judgement:'positive'|'negative'|'mixed'|'neutral';grade:Slot<string>;strength:Slot<'explicit'|'hedged'>};
  comparative?:{relation:Slot<string>;ordering:string[]}};
 observationBasis:Slot<ObservationBasis>;
 procedure:Slot<string>;
 parameters:{name:string;value:string}[];
 influenceConditions:Constraint[];
 observer:{publisher:Slot<string>;role:EvidentialRole};
 limitations:string[];
 uncertainty:Slot<string>;
 provenance:{document:string|null;evidence:string|null;readerVersion:string|null};
}

// ---------------------------------------------------------------------------------------------------- shapes (SHACL-style)
export interface ShapeResult {shape:string;path:string;severity:'violation'|'warning';message:string}
export interface ShapeReport {conforms:boolean;results:ShapeResult[]}
export interface Shape {id:string;path:string;severity:'violation'|'warning';applies:(o:ObservationV02)=>boolean;holds:(o:ObservationV02)=>boolean;message:string}
const EXTENSIVE=new Set(['energy','volume','price_or_cost','duration']);
export const SHAPES:readonly Shape[]=[
 {id:'S1-one-result-form',path:'result',severity:'violation',applies:()=>true,
  holds:o=>[o.result.quantitative,o.result.qualitative,o.result.comparative].filter(Boolean).length===1&&!!o.result[o.result.form],message:'exactly one result form, matching result.form'},
 {id:'S2-property-established',path:'assessed.property',severity:'warning',applies:()=>true,holds:o=>o.assessed.property.state!=='unknown',message:'the assessed property is not established'},
 {id:'S3-quantity-unit',path:'result.quantitative.unit',severity:'violation',applies:o=>o.result.form==='quantitative',
  holds:o=>!!o.result.quantitative&&(o.result.quantitative.unit.state!=='unknown'||o.result.quantitative.value===null),message:'a quantitative value has a unit'},
 {id:'S4-extensive-has-basis',path:'assessed.basis',severity:'warning',applies:o=>o.result.form==='quantitative'&&EXTENSIVE.has(o.result.quantitative?.quantityKind.value??''),
  holds:o=>o.assessed.basis.state!=='unknown',message:'an extensive quantity (energy, volume, money, duration) has a basis, stated or inferred'},
 {id:'S5-inferred-names-rule',path:'*',severity:'violation',applies:()=>true,
  holds:o=>[o.assessed.property,o.assessed.objectOfInterest,o.assessed.basis,o.assessed.statistic,o.observationBasis,o.procedure,o.uncertainty].every(s=>s.state!=='inferred'||!!s.rule)&&o.assessed.constraints.every(c=>c.state!=='inferred'||!!c.rule),
  message:'every inferred slot names the convention or knowledge item that supplied it'},
 {id:'S6-declaration-not-test',path:'observer.role',severity:'violation',applies:o=>o.observationBasis.value==='declaration',
  holds:o=>o.observer.role!=='independent_test',message:'a declaration is never an independent test'},
 {id:'S7-subject-for-single-result',path:'subjects',severity:'warning',applies:o=>o.result.form!=='comparative',holds:o=>o.subjects.length===1&&o.subjects[0]!.identity!=='unknown',message:'a single result names its subject'},
 {id:'S8-comparative-has-subjects',path:'subjects',severity:'violation',applies:o=>o.result.form==='comparative',holds:o=>o.subjects.length>=1,message:'a comparative result names at least one compared subject'},
 {id:'S9-qualitative-judgement',path:'result.qualitative',severity:'violation',applies:o=>o.result.form==='qualitative',holds:o=>!!o.result.qualitative?.judgement,message:'a qualitative result has a judgement'},
];
export function checkShapes(o:ObservationV02,shapes:readonly Shape[]=SHAPES):ShapeReport{
 const results:ShapeResult[]=[];for(const s of shapes)if(s.applies(o)&&!s.holds(o))results.push({shape:s.id,path:s.path,severity:s.severity,message:s.message});
 return {conforms:!results.some(r=>r.severity==='violation'),results};
}

// ------------------------------------------------------------------------------------------- slot accounting (measurement)
/** The identity slots of a record and their states, for the coverage census. */
export function slotStates(o:ObservationV02):Record<string,SlotState>{
 const s0=o.subjects[0];
 const out:Record<string,SlotState>={'subject.identity':s0?s0.identity:'unknown','subject.model':s0?s0.model.state:'unknown',
  'assessed.property':o.assessed.property.state,'assessed.objectOfInterest':o.assessed.objectOfInterest.state,'assessed.basis':o.assessed.basis.state,
  'assessed.statistic':o.assessed.statistic.state,
  'assessed.constraints':o.assessed.constraints.length?(o.assessed.constraints.some(c=>c.state==='stated')?'stated':'inferred'):'unknown',
  observationBasis:o.observationBasis.state,procedure:o.procedure.state,uncertainty:o.uncertainty.state,
  'observer.publisher':o.observer.publisher.state,'observer.role':o.observer.role==='unknown'?'unknown':'stated',
  'provenance.evidence':o.provenance.evidence?'stated':'unknown'};
 if(o.result.quantitative){out['result.unit']=o.result.quantitative.unit.state;out['result.quantityKind']=o.result.quantitative.quantityKind.state;}
 if(o.result.qualitative){out['result.grade']=o.result.qualitative.grade.state;out['result.strength']=o.result.qualitative.strength.state;}
 return out;
}

// ------------------------------------------------------------------------------------------------ read-only adapters
const J=(s:unknown):unknown=>{if(typeof s!=='string')return s??null;try{return JSON.parse(s);}catch{return null;}};
const hostOf=(u:unknown)=>{if(!u)return null;try{return new URL(String(u)).hostname.replace(/^www\./,'');}catch{return null;}};
const base=(table:string,id:string,form:ResultForm):ObservationV02=>({contract:OBSERVATION_CONTRACT_VERSION,source:{table,id},subjects:[],
 assessed:{property:unknown(),objectOfInterest:unknown(),constraints:[],basis:unknown(),statistic:unknown()},result:{form},observationBasis:unknown(),
 procedure:unknown(),parameters:[],influenceConditions:[],observer:{publisher:unknown(),role:'unknown'},limitations:[],uncertainty:unknown(),
 provenance:{document:null,evidence:null,readerVersion:null}});
const ROLE:Record<string,EvidentialRole>={manufacturer_declaration:'manufacturer_declaration',retailer_declaration:'retailer_declaration',
 editorial_declaration:'editorial_declaration',secondary_reference_declaration:'secondary_reference_declaration',
 independent_original_test:'independent_test',test_publisher_operator_asserted:'independent_test',reviewer_claim:'reviewer_claim'};

/** test_measurements265 row (snake_case, as stored), with its source url joined by the caller. */
export function fromTestMeasurement265(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationV02{
 const o=base('test_measurements265',String(r.measurement_id),'quantitative');const ev=`block:${r.block_sha256}#${r.block_index}@${r.value_offset}`;
 o.subjects=[{name:unknown(),model:unknown(),productId:stated(r.product_id as string,ev),identity:r.product_id&&r.subject_association!=='subject_unresolved'?'stated':'unknown'}];
 const dim=r.dimension&&r.dimension!=='not_established'?String(r.dimension):null;
 o.assessed.property=dim?stated(dim,ev):unknown();
 const codes=(J(r.condition_codes) as string[]|null)??[];
 o.assessed.constraints=codes.map(c=>({dimension:'reader_code',value:c,state:'stated' as SlotState,evidence:ev}));
 if(r.condition)o.assessed.constraints.push({dimension:'condition_text',value:String(r.condition),state:'stated',evidence:ev});
 if(r.setpoint_c!==null&&r.setpoint_c!==undefined)o.assessed.constraints.push({dimension:'temperature_setpoint',value:`${r.setpoint_c} °C`,state:'stated',evidence:ev});
 o.result.quantitative={value:(r.value as number)??null,unit:stated(r.unit as string,ev),quantityKind:unknown(),approximate:false};
 o.observationBasis=r.method_cue?inferred<ObservationBasis>('instrumented_measurement','phase265:method_cue='+r.method_cue):unknown();
 const proto=(J(r.protocol_codes) as string[]|null)??[];o.procedure=proto.length?stated(proto.join('+'),ev):unknown();
 if(r.instrument)o.parameters.push({name:'instrument',value:String(r.instrument)});
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:ROLE[String(r.reported_by)]??'unknown'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.extractor_version as string)??null};return o;
}
/** qualitative_observations270 row. */
export function fromQualitative270(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationV02{
 const o=base('qualitative_observations270',String(r.observation_id),'qualitative');const ev=`block:${r.block_sha256}#${r.block_index}`;
 o.subjects=[{name:unknown(),model:unknown(),productId:stated(r.product_id as string,ev),identity:r.identity==='subject_unresolved'?'unknown':'stated'}];
 o.assessed.property=stated(r.outcome as string,ev);o.assessed.objectOfInterest=stated(r.dish as string,Number(r.dish_from_heading)?'heading':ev);
 if(Number(r.setting_adjusted))o.assessed.constraints.push({dimension:'setting',value:'adjusted_by_tester',state:'stated',evidence:ev});
 o.result.qualitative={judgement:r.direction as 'positive',grade:unknown(),strength:stated(r.strength as 'explicit',ev)};
 o.observationBasis=r.basis==='first_person_cooking_test'?stated<ObservationBasis>('hands_on_use_test',ev):unknown();
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:'independent_test'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.reader_version as string)??null};return o;
}
/** comparative_results271 row: one value of one appliance within a publisher's multi-appliance experiment. */
export function fromComparative271(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationV02{
 const o=base('comparative_results271',String(r.result_id),'quantitative');const ev=`block:${r.block_sha256}`;
 o.subjects=[{name:stated(r.subject_name as string,ev),model:stated(r.subject_model as string,ev),productId:stated(r.product_id as string,ev),
  identity:['exact_variant','named_product'].includes(String(r.identity))?'stated':r.identity==='equipment_class'?'inferred':'unknown'}];
 o.assessed.property=stated(r.measurand as string,ev);o.assessed.objectOfInterest=stated(r.task_label as string,ev);
 o.assessed.basis=r.task_label?inferred('per_task_or_cycle','cmp271:value per completed task in a publisher experiment'):unknown();
 o.assessed.constraints=((J(r.condition_codes) as string[]|null)??[]).map(c=>({dimension:'experiment_code',value:c,state:'stated' as SlotState,evidence:ev}));
 o.result.quantitative={value:(r.value as number)??null,unit:stated(r.unit as string,ev),quantityKind:stated(r.measurand==='cost'?'price_or_cost':String(r.measurand),ev),approximate:Number(r.approximate)===1};
 o.observationBasis=r.value_basis==='measured'?stated<ObservationBasis>('instrumented_measurement',ev)
  :r.value_basis==='derived_from_tariff'?inferred<ObservationBasis>('instrumented_measurement','cmp271:cost derived from measured energy and a tariff'):unknown();
 o.procedure=stated('publisher_experiment:'+r.experiment_key,ev);
 o.uncertainty=r.uncertainty?stated(String(r.uncertainty),ev):unknown();
 o.limitations=((J(r.limitations) as unknown[]|null)??[]).map(x=>typeof x==='string'?x:JSON.stringify(x));
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:'independent_test'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.reader_version as string)??null};return o;
}
/** declarations row: a declared value (manufacturer or retailer), never a test. A quantity declaration is quantitative; a
 * text declaration (a material, a colour, a feature) is a nominal value, represented as a qualitative result whose grade is
 * the declared text on a nominal scale (I-ADOPT: a property is a quantity or a quality). */
export function fromDeclaration(r:Record<string,unknown>,sourceUrl:string|null=null):ObservationV02{
 const v=J(r.value_json) as {kind?:string;number?:unknown;unit?:unknown;text?:unknown;approximate?:unknown}|null;
 const isQty=v?.kind==='quantity'&&typeof v.number==='number';const ev=String(r.locator??'')||null;
 const o=base('declarations',String(r.declaration_id),isQty?'quantitative':'qualitative');
 o.subjects=[{name:unknown(),model:unknown(),productId:stated(r.product_id as string,ev),identity:'stated'}];
 o.assessed.property=stated(r.property_key as string,ev);if(r.component)o.assessed.objectOfInterest=stated(String(r.component),ev);
 if(isQty)o.result.quantitative={value:v!.number as number,unit:typeof v!.unit==='string'?stated(v!.unit,ev):unknown(),quantityKind:unknown(),approximate:v!.approximate===true};
 else o.result.qualitative={judgement:'neutral',grade:stated(typeof v?.text==='string'?`nominal:${v.text}`:String(r.raw_value??''),ev),strength:stated<'explicit'>('explicit',ev)};
 o.observationBasis=stated<ObservationBasis>('declaration',ev);
 o.observer={publisher:stated(hostOf(sourceUrl),sourceUrl),role:ROLE[String(r.evidence_role)]??'unknown'};
 o.provenance={document:sourceUrl,evidence:ev,readerVersion:(r.method as string)??null};return o;
}
