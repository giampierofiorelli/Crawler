/** S87a — knowledge-derived evidence assessment (SHADOW; internal scientific validation, never ranking).
 *
 * The recurring cause S87a identified: capabilities that make knowledge operational (shared quantity typing, links from a
 * typed value to a taught measurement, per-observation condition validity) were built and evaluated in shadow modules,
 * while the operational validator (Phase268) encodes knowledge as constants (one protocol, one publisher). This module
 * composes the existing mechanisms into ONE assessment per stored observation, so what the category teaching already
 * knows decides what an observation can be used for. Nothing new is taught here and no new vocabulary is introduced:
 *  - quantity: quantity_knowledge.typeStoredQuantity (S86);
 *  - measurement: phase272_extraction_plan.linkTypedToMeasure272 over the plan compiled from the store (Phase272/KN);
 *  - conditions: knowledge_link.conditionsMetFromStoreRecords (D27/D28, S83), per observation and per comparable group;
 *  - provenance: the stored row's source, reporting role, method cue and product association (PROV: agent, activity, entity).
 *
 * The assessment separates questions that earlier code merged (owner S87a): discovery is not verification, a publisher's
 * claim to have tested is not proof of the method, a valid measurement is not sufficient for a given need, and missing
 * information is not failure. It states PURPOSES, each with the reasons it is or is not met:
 *  - record: always (the observation is kept with its status, even when nothing else is met);
 *  - describe_product: the product is resolved, the value is linked to a taught measurement and reported first-hand;
 *  - compare_within_source: describe_product, and another product measured the same way by the same source (one
 *    publisher's protocol is constant within its documents; conditions it does not state limit cross-source use only);
 *  - compare_across_sources: describe_product, and every condition the teaching requires is verified by the record;
 *  - rank: always false here. Ranking keeps its own gate (signed catalogs, Phase181/268, ra.2).
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {loadQuantityKnowledge,typeStoredQuantity,type QuantityKnowledge} from './quantity_knowledge.js';
import {compileExtractionPlan272,typedMeasures272,linkTypedToMeasure272,type ExtractionPlan272,type TypedMeasure272} from './phase272_extraction_plan.js';
import {conditionsMetFromStoreRecords} from './knowledge_link.js';
import {CATEGORY_REGISTRY250} from './phase248_category_registry.js';

export type Purpose87='record'|'describe_product'|'compare_within_source'|'compare_across_sources'|'rank';
export interface EvidenceAssessment87 {
 measurementId:string;category:string;
 provenance:{url:string|null;host:string|null;sourceType:string|null;reportedBy:string|null;methodCue:string|null;extractorVersion:string|null};
 quantity:{kinds:string[];kind:string|null;metric:string|null;status:'typed'|'kind_ambiguous'|'untyped'};
 measure:{id:string|null;candidates:string[];basis:string};
 product:{id:string|null;state:'resolved_page_product'|'unresolved'};
 method:{claimedFirstHand:boolean;documentProtocol:boolean};
 conditions:{required:string[];verified:string[];notVerifiable:string[]};
 comparability:{withinSourcePeers:number;crossSourceGroup:boolean};
 purposes:Record<Purpose87,{met:boolean;reasons:string[]}>;
}
const TAUGHT87=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const FIRST_HAND=new Set(['first_person_test_statement','test_section_with_method_cue','bounded_table_result_with_local_method','energy_result_with_document_protocol','plan_guided_measurement_term']);

/** Assess the stored test observations of one category. `labelsOf` may supply the words a reading attached to a row (its
 * clause or table labels): the store keeps the value, unit, codes and block hash, not the measurand's words, so without
 * labels a duration or an energy can link to a measurement only when the knowledge leaves one candidate. */
export function assessStoredEvidence87(store:KnowledgeStore246,category:string,opts:{rows?:ReturnType<KnowledgeStore246['testMeasurements265']>;
 labelsOf?:(measurementId:string)=>string;qk?:QuantityKnowledge;plan?:ExtractionPlan272;allCategories?:readonly string[];
 /** S87a linking corrections (default ON here; the readers keep their earlier behaviour): the reading's words type the value
  * (a CADR in cfm is typed as CADR), a per-N measurement needs the same N, a measurement without a taught outcome is kept, a tie in the words abstains */
 linkFixes?:boolean}={}):EvidenceAssessment87[]{
 const qk=opts.qk??loadQuantityKnowledge();const cats=opts.allCategories??TAUGHT87;
 const plan=opts.plan??compileExtractionPlan272(store,category,CATEGORY_REGISTRY250.find(e=>e.id===category)?.aliases??[],cats.filter(c=>c!==category));
 const measures:TypedMeasure272[]=typedMeasures272(store,category,plan,qk);
 const rows=(opts.rows??store.testMeasurements265()).filter(r=>r.state==='current'&&r.value!==null);
 // 1. what each row is: typed quantity and the taught measurement it reports
 const fix=opts.linkFixes!==false;
 const base=rows.map(r=>{const words=opts.labelsOf?.(r.measurementId)??'';
  const q=typeStoredQuantity(qk,{value:r.value,unit:r.unit,dimension:r.dimension},fix&&words?[words]:[]);
  const labels=[opts.labelsOf?.(r.measurementId)??'',r.dimension&&r.dimension!=='not_established'?r.dimension.replace(/_/g,' '):'',r.condition??'',r.instrument??''].join(' ').trim();
  const link=q?linkTypedToMeasure272(plan,measures,q,labels,qk,fix?{outcomeless:true,scale:true,tieAbstains:true}:{}):{measureId:null,candidates:[],outcomes:[],proxyFor:[],basis:'unit not recognised by the quantity knowledge'};
  return {r,q,link};});
 // 2. conditions: per taught measurement, the store records linked to it, validated per observation (D27/D28)
 const byMeasure=new Map<string,string[]>();for(const b of base)if(b.link.measureId)(byMeasure.get(b.link.measureId)??byMeasure.set(b.link.measureId,[]).get(b.link.measureId)!).push(b.r.measurementId);
 const cond=new Map<string,{required:string[];verified:string[];notVerifiable:string[];group:boolean}>();
 for(const [m,ids] of byMeasure){const d=conditionsMetFromStoreRecords(store,category,m,ids,null,{qk});
  const inGroup=new Set(d.groups.filter(g=>g.length>1).flat());
  for(const o of d.observations)cond.set(o.test,{required:d.required,verified:o.conditions.filter(c=>c.state==='verified').map(c=>c.condition),
   notVerifiable:o.conditions.filter(c=>c.state==='not_verifiable').map(c=>c.condition),group:inGroup.has(o.test)});}
 // 3. purposes, with reasons
 const out:EvidenceAssessment87[]=base.map(({r,q,link})=>{
  const c=cond.get(r.measurementId)??{required:[],verified:[],notVerifiable:[],group:false};
  const resolved=!!r.productId&&r.subjectAssociation!=='subject_unresolved';
  const firstHand=r.source?.sourceType==='independent_original_test'&&FIRST_HAND.has(r.methodCue??'');
  const peers=link.measureId?base.filter(b=>b.link.measureId===link.measureId&&b.r.source?.host===r.source?.host&&b.r.productId&&b.r.productId!==r.productId&&b.r.unit===r.unit).length:0;
  const describe:string[]=[];if(!resolved)describe.push('product_unresolved');if(!link.measureId)describe.push(link.candidates.length>1?'measurement_ambiguous':'measurement_not_linked');
  if(!firstHand)describe.push('not_reported_as_first_hand_test');
  const within=[...describe];if(!peers)within.push('no_other_product_measured_alike_by_this_source');
  const across=[...describe];const missing=c.required.filter(x=>!c.verified.includes(x));if(missing.length)across.push(...missing.map(x=>'condition_not_stated:'+x));
  return {measurementId:r.measurementId,category,
   provenance:{url:r.source?.url??null,host:r.source?.host??null,sourceType:r.source?.sourceType??null,reportedBy:r.reportedBy??null,methodCue:r.methodCue??null,extractorVersion:r.extractorVersion??null},
   quantity:{kinds:q?.kind.id?[q.kind.id]:q?.kind.candidates??[],kind:q?.kind.id??null,metric:q?.metric.id??null,status:!q?'untyped':q.kind.id?'typed':'kind_ambiguous'},
   measure:{id:link.measureId,candidates:link.candidates,basis:link.basis},
   product:{id:r.productId??null,state:resolved?'resolved_page_product':'unresolved'},
   method:{claimedFirstHand:firstHand,documentProtocol:(r.protocolCodes??[]).length>0},
   conditions:{required:c.required,verified:c.verified,notVerifiable:c.notVerifiable},
   comparability:{withinSourcePeers:peers,crossSourceGroup:c.group},
   purposes:{record:{met:true,reasons:[]},describe_product:{met:!describe.length,reasons:describe},compare_within_source:{met:!within.length,reasons:within},
    compare_across_sources:{met:!across.length,reasons:across},rank:{met:false,reasons:['ranking_keeps_its_own_gate']}}};});
 return out;
}
