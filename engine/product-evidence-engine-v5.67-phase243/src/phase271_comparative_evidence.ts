/** Phase271 — comparability of retained comparative results (owner directive 2026-10-17 §4).
 *
 * Input: `comparative_results271` rows (one task, several appliances, publisher-reported, unreviewed). Output: for one
 * taught measurement (e.g. energy_per_cooking_task), the experiments that report it, grouped by experiment and task, with
 * what each group can and cannot establish:
 *  - values are comparable only WITHIN one experiment and one task, with matched loads (a reduced load is not comparable);
 *  - results of different experiments are never compared (their protocols are not established as equivalent);
 *  - a duplicate experiment (same content republished) counts once;
 *  - a cost is tariff-derived and never stands for energy; duration, energy and cost stay separate;
 *  - the taught conditions are checked against the result's codes, each in one of three states (S83, owner review of
 *    S82): verified (every result of the group records it), incompatible (a result records a relevant difference, e.g. a
 *    reduced load against "the same food load"), or not verifiable (not recorded, or PEE cannot read it yet). A condition
 *    that cannot be verified is never read as a failure of the product.
 * Nothing here ranks: it states which comparisons the evidence supports (e.g. "air fryer X vs oven Y") and which it does
 * not (e.g. "air fryer X vs air fryer Z").
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';

/** How a taught measurement is represented by comparative results: the measurand, which result codes verify which taught
 * condition, and (S83) which codes document an incompatibility with it. A condition with no code cannot be verified
 * from this evidence (state not_verifiable), never failed. */
export const COMPARATIVE_MEASURES271:Readonly<Record<string,{measurand:'duration'|'energy'|'cost';conditionCodes:Readonly<Record<string,string>>;incompatibleCodes?:Readonly<Record<string,string>>}>>={
 energy_per_cooking_task:{measurand:'energy',conditionCodes:{same_food_load:'same_food_load',completed_doneness:'quality_assessed_same_task'},
  incompatibleCodes:{same_food_load:'quantity_reduced'}},
};
/** S83: the state of one taught condition of the measurement for one group of results, with what decided it. */
export type ConditionState271='verified'|'incompatible'|'not_verifiable';
export interface ComparativeGroup271 {
 experimentKey:string;host:string;url:string;task:string|null;measurand:string;
 items:{equipmentClass:string;subject:string|null;identity:string;value:number;unit:string;valueBasis:string}[];
 comparableWithinExperiment:boolean;reasons:string[];
 /** S83: every condition the teaching requires for THIS measurement, in one of three states, with its basis */
 conditions:{condition:string;state:ConditionState271;basis:string}[];
 /** Phase272 (owner review §9): "comparable" is structural (one experiment, one task, matched load, distinct appliances);
  * it is not the same as every taught essential condition being verified. S83: 'comparable_conditions_not_verifiable'
  * says so (was 'comparable_with_unmet_conditions', which read an unrecorded condition as unmet). */
 comparability:'comparable'|'comparable_conditions_not_verifiable'|'not_comparable';
}
export interface ComparativeEvidence271 {
 measure:string;groups:ComparativeGroup271[];experiments:number;duplicatesIgnored:number;
 /** S85: stored results whose source role is not a test publisher, excluded from comparative test evidence */
 notTestSourceExcluded:number;
 /** Groups that compare two or more distinct products of the asked equipment class under matched conditions. */
 sameClassComparable:number;
 /** Groups that compare the asked class with another class (e.g. an air fryer with an oven). */
 crossClass:number;
}
type Row={experiment_key:string;task_index:number;task_label:string|null;equipment_class:string;subject_name:string|null;identity:string;measurand:string;
 value:number;unit:string;value_basis:string;condition_codes:string[];duplicate_of_revision:string|null;host:string;url:string};

export function comparativeEvidence271(store:KnowledgeStore246,measure:string,equipmentClass:string,conditions:readonly string[]):ComparativeEvidence271|null{
 const spec=COMPARATIVE_MEASURES271[measure];if(!spec)return null;
 const stored=store.comparativeResults271({measurand:spec.measurand}) as unknown as (Row&{reported_by:string})[];
 // S85: only results reported by a test publisher are comparative test evidence (rows stored before the ingest gate, or
 // by another path, are excluded here and counted, never shown as measured)
 const all=stored.filter(r=>r.reported_by==='test_publisher_operator_asserted');
 const rows=all.filter(r=>!r.duplicate_of_revision);
 const groups=new Map<string,Row[]>();
 for(const r of rows){const k=r.experiment_key+'|'+(r.task_label??'#'+r.task_index);(groups.get(k)??groups.set(k,[]).get(k)!).push(r);}
 const out:ComparativeGroup271[]=[];
 for(const g of groups.values()){
  if(!g.some(r=>r.equipment_class===equipmentClass))continue;
  const reasons:string[]=[];
  if(g.some(r=>r.condition_codes.includes('quantity_reduced')))reasons.push('load_not_matched');
  if(g.some(r=>r.equipment_class==='several'||r.identity==='ambiguous'))reasons.push('ambiguous_subject');
  if(new Set(g.map(r=>r.equipment_class+'|'+(r.subject_name??''))).size<2)reasons.push('single_appliance');
  const codes=new Set(g.flatMap(r=>r.condition_codes).filter(c=>g.every(r=>r.condition_codes.includes(c))));
  const anyCode=new Set(g.flatMap(r=>r.condition_codes));
  const states=conditions.map(c=>{const inc=spec.incompatibleCodes?.[c],ver=spec.conditionCodes[c];
   if(inc&&anyCode.has(inc))return {condition:c,state:'incompatible' as const,basis:`a result records ${inc.replace(/_/g,' ')}`};
   if(ver&&codes.has(ver))return {condition:c,state:'verified' as const,basis:`every result records ${ver.replace(/_/g,' ')}`};
   return {condition:c,state:'not_verifiable' as const,basis:ver?`not recorded by every result (${ver.replace(/_/g,' ')})`:'PEE reads no record of this condition in comparative results'};});
  out.push({experimentKey:g[0].experiment_key,host:g[0].host,url:g[0].url,task:g[0].task_label,measurand:spec.measurand,
   items:g.map(r=>({equipmentClass:r.equipment_class,subject:r.subject_name,identity:r.identity,value:r.value,unit:r.unit,valueBasis:r.value_basis})),
   comparableWithinExperiment:!reasons.length,reasons,conditions:states,
   comparability:reasons.length||states.some(x=>x.state==='incompatible')?'not_comparable':states.every(x=>x.state==='verified')?'comparable':'comparable_conditions_not_verifiable'});
 }
 out.sort((a,b)=>a.experimentKey.localeCompare(b.experimentKey)||String(a.task).localeCompare(String(b.task)));
 const sameClass=(g:ComparativeGroup271)=>g.comparableWithinExperiment&&new Set(g.items.filter(i=>i.equipmentClass===equipmentClass&&i.subject).map(i=>i.subject)).size>=2;
 return {measure,groups:out,experiments:new Set(out.map(g=>g.experimentKey)).size,duplicatesIgnored:all.length-rows.length,notTestSourceExcluded:stored.length-all.length,
  sameClassComparable:out.filter(sameClass).length,crossClass:out.filter(g=>g.comparableWithinExperiment&&g.items.some(i=>i.equipmentClass!==equipmentClass)).length};
}
