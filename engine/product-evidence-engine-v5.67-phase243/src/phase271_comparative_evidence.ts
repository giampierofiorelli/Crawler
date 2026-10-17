/** Phase271 — comparability of retained comparative results (owner directive 2026-10-17 §4).
 *
 * Input: `comparative_results271` rows (one task, several appliances, publisher-reported, unreviewed). Output: for one
 * taught measurement (e.g. energy_per_cooking_task), the experiments that report it, grouped by experiment and task, with
 * what each group can and cannot establish:
 *  - values are comparable only WITHIN one experiment and one task, with matched loads (a reduced load is not comparable);
 *  - results of different experiments are never compared (their protocols are not established as equivalent);
 *  - a duplicate experiment (same content republished) counts once;
 *  - a cost is tariff-derived and never stands for energy; duration, energy and cost stay separate;
 *  - the taught conditions are checked against the result's codes; an unrecorded condition stays missing.
 * Nothing here ranks: it states which comparisons the evidence supports (e.g. "air fryer X vs oven Y") and which it does
 * not (e.g. "air fryer X vs air fryer Z").
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';

/** How a taught measurement is represented by comparative results: the measurand, and which result codes satisfy which
 * taught condition (conditions with no code are never satisfied by this evidence). */
export const COMPARATIVE_MEASURES271:Readonly<Record<string,{measurand:'duration'|'energy'|'cost';conditionCodes:Readonly<Record<string,string>>}>>={
 energy_per_cooking_task:{measurand:'energy',conditionCodes:{same_food_load:'same_food_load',completed_doneness:'quality_assessed_same_task'}},
};
export interface ComparativeGroup271 {
 experimentKey:string;host:string;url:string;task:string|null;measurand:string;
 items:{equipmentClass:string;subject:string|null;identity:string;value:number;unit:string;valueBasis:string}[];
 comparableWithinExperiment:boolean;reasons:string[];conditionsMet:string[];conditionsMissing:string[];
 /** Phase272 (owner review §9): "comparable" is structural (one experiment, one task, matched load, distinct appliances);
  * it is not the same as every taught essential condition being met. 'comparable_with_unmet_conditions' says so. */
 comparability:'comparable'|'comparable_with_unmet_conditions'|'not_comparable';
}
export interface ComparativeEvidence271 {
 measure:string;groups:ComparativeGroup271[];experiments:number;duplicatesIgnored:number;
 /** Groups that compare two or more distinct products of the asked equipment class under matched conditions. */
 sameClassComparable:number;
 /** Groups that compare the asked class with another class (e.g. an air fryer with an oven). */
 crossClass:number;
}
type Row={experiment_key:string;task_index:number;task_label:string|null;equipment_class:string;subject_name:string|null;identity:string;measurand:string;
 value:number;unit:string;value_basis:string;condition_codes:string[];duplicate_of_revision:string|null;host:string;url:string};

export function comparativeEvidence271(store:KnowledgeStore246,measure:string,equipmentClass:string,conditions:readonly string[]):ComparativeEvidence271|null{
 const spec=COMPARATIVE_MEASURES271[measure];if(!spec)return null;
 const all=store.comparativeResults271({measurand:spec.measurand}) as unknown as Row[];
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
  const met=conditions.filter(c=>spec.conditionCodes[c]&&codes.has(spec.conditionCodes[c]));
  out.push({experimentKey:g[0].experiment_key,host:g[0].host,url:g[0].url,task:g[0].task_label,measurand:spec.measurand,
   items:g.map(r=>({equipmentClass:r.equipment_class,subject:r.subject_name,identity:r.identity,value:r.value,unit:r.unit,valueBasis:r.value_basis})),
   comparableWithinExperiment:!reasons.length,reasons,conditionsMet:met,conditionsMissing:conditions.filter(c=>!met.includes(c)),
   comparability:reasons.length?'not_comparable':met.length===conditions.length?'comparable':'comparable_with_unmet_conditions'});
 }
 out.sort((a,b)=>a.experimentKey.localeCompare(b.experimentKey)||String(a.task).localeCompare(String(b.task)));
 const sameClass=(g:ComparativeGroup271)=>g.comparableWithinExperiment&&new Set(g.items.filter(i=>i.equipmentClass===equipmentClass&&i.subject).map(i=>i.subject)).size>=2;
 return {measure,groups:out,experiments:new Set(out.map(g=>g.experimentKey)).size,duplicatesIgnored:all.length-rows.length,
  sameClassComparable:out.filter(sameClass).length,crossClass:out.filter(g=>g.comparableWithinExperiment&&g.items.some(i=>i.equipmentClass!==equipmentClass)).length};
}
