/**
 * S98 (owner decision 2026-10-20): the user path's consumer of the stored scientific readings. For the products an answer
 * considers, it reports per defined property what kind of evidence the store holds (measured, declared, calculated,
 * unresolved), which conditions are missing, and whether the products' results can be compared: two results compare only
 * when every condition either requires is stated by both with the same value; a missing condition makes the comparison
 * 'conditions_unestablished' (never assumed equal), a different stated value makes it 'not_comparable'. Results of a
 * different nature (a measurement against a declaration) are never compared. Stored expert judgements (Phase269/270
 * qualitative codes, never read on the user path before S98) are reported as judgements, never as measurements.
 * Gated (adviseFromRequest253 opts.scientific98); it changes no decision, no order and no recommendation.
 */
import type {KnowledgeStore246,ScientificReadingRow98} from './phase246_knowledge_store.js';

export type ComparisonVerdict98='comparable'|'conditions_unestablished'|'not_comparable';
export interface ScientificEvidence98 {schema:'pee98.scientific-evidence.v1';products:number;
 properties:{property:string;products:number;readings:Record<string,number>;missingConditions:Record<string,number>;
  comparisons:Record<ComparisonVerdict98,number>;reasons:Record<string,number>}[];
 judgements:{products:number;observations:number;byAspect:Record<string,{positive:number;negative:number;mixed:number}>};
 rankingInput:false;decisionEffect:'none'}
type Row=ScientificReadingRow98&{conditions:{id:string;value:string|null;state:string}[];missing:string[];conflicts:string[]};

/** Whether two results of one property can be compared, from their stated conditions only. */
export function compareReadings98(a:Row,b:Row):{verdict:ComparisonVerdict98;reason:string}{
 if(a.nature!==b.nature)return {verdict:'not_comparable',reason:'different_nature'};
 if(a.conflicts.length||b.conflicts.length)return {verdict:'conditions_unestablished',reason:'conflicting_conditions'};
 const explicit=(r:Row)=>new Map(r.conditions.filter(c=>c.value!==null&&c.state==='explicit').map(c=>[c.id,c.value!]));
 const ea=explicit(a),eb=explicit(b);
 for(const [id,v] of ea)if(eb.has(id)&&eb.get(id)!==v)return {verdict:'not_comparable',reason:'different_'+id};
 const required=new Set([...a.missing,...b.missing]);
 for(const id of required)if(!(ea.has(id)&&eb.has(id)))return {verdict:'conditions_unestablished',reason:'missing_'+id};
 return {verdict:'comparable',reason:'conditions_stated_and_equal_or_none_required'};
}
export function scientificEvidence98(store:KnowledgeStore246,productIds:readonly string[]):ScientificEvidence98{
 const ids=[...new Set(productIds)];const byProp=new Map<string,Row[]>();
 for(const p of ids)for(const r of store.scientificReadings98({productId:p}) as Row[]){if(!r.property_id||r.form!=='quantity')continue;byProp.set(r.property_id,[...(byProp.get(r.property_id)??[]),r]);}
 const properties=[...byProp.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([property,rs])=>{
  const readings:Record<string,number>={};const missing:Record<string,number>={};const reasons:Record<string,number>={};
  const comparisons:Record<ComparisonVerdict98,number>={comparable:0,conditions_unestablished:0,not_comparable:0};
  for(const r of rs){readings[r.nature]=(readings[r.nature]??0)+1;for(const m of r.missing)missing[m]=(missing[m]??0)+1;}
  // results of different products only (a product compared with itself is not a comparison)
  for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){if(rs[i].product_id===rs[j].product_id)continue;const c=compareReadings98(rs[i],rs[j]);comparisons[c.verdict]++;reasons[c.reason]=(reasons[c.reason]??0)+1;}
  return {property,products:new Set(rs.map(r=>r.product_id)).size,readings,missingConditions:missing,comparisons,reasons};});
 const byAspect:Record<string,{positive:number;negative:number;mixed:number}>={};let obs=0;const withJ=new Set<string>();
 for(const p of ids)for(const q of store.qualitativeObservations270({productId:p})){const a=String(q.outcome);const d=String(q.direction) as 'positive'|'negative'|'mixed';
  (byAspect[a]??={positive:0,negative:0,mixed:0})[d]++;obs++;withJ.add(p);}
 return {schema:'pee98.scientific-evidence.v1',products:ids.length,properties,judgements:{products:withJ.size,observations:obs,byAspect},rankingInput:false,decisionEffect:'none'};
}
