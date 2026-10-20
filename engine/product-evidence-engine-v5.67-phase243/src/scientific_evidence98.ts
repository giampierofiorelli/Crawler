/**
 * S98 (owner decision 2026-10-20): the user path's consumer of the stored scientific readings. For the products an answer
 * considers, it reports per defined property what kind of evidence the store holds (measured, declared, calculated,
 * unresolved), which conditions are missing, and whether the products' results can be compared. Stored expert judgements
 * (Phase269/270 qualitative codes) are reported as judgements, never as measurements.
 * S99 (owner review of S98, 2026-10-20): stated conditions are necessary, not sufficient. Two readings compare only when
 * both are values of a product (a result or a specification: never a threshold, norm, target or condition), neither is a
 * bound, their nature, kind, basis, object and definition version agree, every condition either requires is stated equal
 * by both, and their methods are known to agree: measured or calculated results of DIFFERENT sources compare only under a
 * stated common method; one source under one method compares within that source (S54). A missing element makes the
 * comparison 'conditions_unestablished', never assumed equal.
 * Gated (adviseFromRequest253 opts.scientific98); it changes no decision, no order and no recommendation.
 */
import type {KnowledgeStore246,ScientificReadingRow98} from './phase246_knowledge_store.js';

export type ComparisonVerdict98='comparable'|'comparable_within_source'|'conditions_unestablished'|'not_comparable';
export interface ScientificEvidence98 {schema:'pee98.scientific-evidence.v1';products:number;
 properties:{property:string;products:number;readings:Record<string,number>;missingConditions:Record<string,number>;
  comparisons:Record<ComparisonVerdict98,number>;reasons:Record<string,number>}[];
 judgements:{products:number;observations:number;byAspect:Record<string,{positive:number;negative:number;mixed:number}>};
 rankingInput:false;decisionEffect:'none'}
type Row=ScientificReadingRow98&{conditions:{id:string;value:string|null;state:string}[];missing:string[];conflicts:string[];
 method?:{codes:string[];cue:string|null;instrumentStated:boolean};source_id?:string|null};
const VALUE_ROLES=new Set(['result','specification']);
/** Whether two results of one property can be compared, from what both state. */
export function compareReadings98(a:Row,b:Row):{verdict:ComparisonVerdict98;reason:string}{
 // S99: only values of a product compare; a bound is a limit, not a point value (rows before v12 carry no role: unknown)
 for(const r of [a,b]){if(r.statement_role!=null&&!VALUE_ROLES.has(r.statement_role))return {verdict:'not_comparable',reason:'statement_role_'+r.statement_role};
  if(r.bound)return {verdict:'not_comparable',reason:'bound_not_a_point_value'};}
 if(a.nature!==b.nature)return {verdict:'not_comparable',reason:'different_nature'};
 if(a.kind&&b.kind&&a.kind!==b.kind)return {verdict:'not_comparable',reason:'different_kind'};
 if(a.result_basis&&b.result_basis&&a.result_basis!==b.result_basis)return {verdict:'not_comparable',reason:'different_basis'};
 if(a.object&&b.object&&a.object!==b.object)return {verdict:'not_comparable',reason:'different_object'};
 if(a.conflicts.length||b.conflicts.length)return {verdict:'conditions_unestablished',reason:'conflicting_conditions'};
 const explicit=(r:Row)=>new Map(r.conditions.filter(c=>c.value!==null&&c.state==='explicit').map(c=>[c.id,c.value!]));
 const ea=explicit(a),eb=explicit(b);
 for(const [id,v] of ea)if(eb.has(id)&&eb.get(id)!==v)return {verdict:'not_comparable',reason:'different_'+id};
 const required=new Set([...a.missing,...b.missing]);
 for(const id of required)if(!(ea.has(id)&&eb.has(id)))return {verdict:'conditions_unestablished',reason:'missing_'+id};
 if(a.definitions_identity!==b.definitions_identity)return {verdict:'conditions_unestablished',reason:'different_definition_version'};
 if(a.nature==='measured'||a.nature==='calculated'){
  const ma=a.method?.cue??null,mb=b.method?.cue??null;const ca=new Set(a.method?.codes??[]),cb=b.method?.codes??[];
  const sameSource=!!a.source_id&&a.source_id===b.source_id;
  const stated=(ca.size>0||!!ma)&&(cb.length>0||!!mb);
  const sameMethod=stated&&ma===mb&&cb.length===ca.size&&cb.every(c=>ca.has(c));
  if(stated&&!sameMethod)return {verdict:sameSource?'conditions_unestablished':'not_comparable',reason:'different_method'};
  if(sameSource)return {verdict:'comparable_within_source',reason:'one_source'+(sameMethod?'_one_stated_method':'_method_unstated')};
  if(!sameMethod)return {verdict:'conditions_unestablished',reason:'method_not_established_across_sources'};}
 return {verdict:'comparable',reason:'role_nature_basis_object_conditions_and_method_agree'};
}
export function scientificEvidence98(store:KnowledgeStore246,productIds:readonly string[]):ScientificEvidence98{
 const ids=[...new Set(productIds)];const byProp=new Map<string,Row[]>();
 for(const p of ids)for(const r of store.scientificReadings98({productId:p}) as Row[]){if(!r.property_id||r.form!=='quantity')continue;byProp.set(r.property_id,[...(byProp.get(r.property_id)??[]),r]);}
 const properties=[...byProp.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([property,rs])=>{
  const readings:Record<string,number>={};const missing:Record<string,number>={};const reasons:Record<string,number>={};
  const comparisons:Record<ComparisonVerdict98,number>={comparable:0,comparable_within_source:0,conditions_unestablished:0,not_comparable:0};
  for(const r of rs){readings[r.nature]=(readings[r.nature]??0)+1;for(const m of r.missing)missing[m]=(missing[m]??0)+1;}
  // results of different products only (a product compared with itself is not a comparison)
  for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){if(rs[i].product_id===rs[j].product_id)continue;const c=compareReadings98(rs[i],rs[j]);comparisons[c.verdict]++;reasons[c.reason]=(reasons[c.reason]??0)+1;}
  return {property,products:new Set(rs.map(r=>r.product_id)).size,readings,missingConditions:missing,comparisons,reasons};});
 const byAspect:Record<string,{positive:number;negative:number;mixed:number}>={};let obs=0;const withJ=new Set<string>();
 for(const p of ids)for(const q of store.qualitativeObservations270({productId:p})){const a=String(q.outcome);const d=String(q.direction) as 'positive'|'negative'|'mixed';
  (byAspect[a]??={positive:0,negative:0,mixed:0})[d]++;obs++;withJ.add(p);}
 return {schema:'pee98.scientific-evidence.v1',products:ids.length,properties,judgements:{products:withJ.size,observations:obs,byAspect},rankingInput:false,decisionEffect:'none'};
}
