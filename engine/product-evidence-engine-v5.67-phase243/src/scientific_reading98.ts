/**
 * S98 (owner decision 2026-10-20, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-decision-s98-operational-knowledge-path-2026-10-20.md): the ONE operational scientific interpretation path for the
 * observations the existing extractors produce. It adds no extractor and no store: it reads what Phase245 (specification
 * declarations), Phase225/226/265 (test-result leads) and Phase269 (qualitative codes) already found, while the page bytes
 * are still transient, and types each observation with the existing scientific components:
 *  - the quantity knowledge (unit, kind, metric, the conditions it reads, the conditions a metric requires);
 *  - the property definitions (pd.5) plus the QK metrics that no definition covers, as CANDIDATE definitions that carry
 *    their required conditions (S96 overlay with the S97 C1 transfer);
 *  - the reader condition codes as values of QK condition axes (reader-conditions.v1, S82);
 *  - the nature of the result and its basis, the method cues, and the state of the knowledge.
 * Conditions use QK axis ids as the canonical identifiers; a definition dimension without an axis keeps its own id
 * ('pd:<id>'), a reader code no axis covers keeps its code ('code:<code>'). Explicitly stated, inferred, missing and
 * conflicting conditions stay distinguishable. A missing condition is never evidence of equivalence; an unstated object is
 * never inferred. Output is codes, ids and values the store already keeps; no page text. Never a ranking input.
 */
import {createHash} from 'node:crypto';
import {loadQuantityKnowledge,parseUnit,typeQuantity,type QuantityKnowledge} from './quantity_knowledge.js';
import {loadPropertyDefinitions,type PropertyDefinitions,type Lifecycle} from './property_definitions.js';
import {interpretWithDefinitions} from './definition_interpreter.js';
import {metricEntities,withAcquiredDefinitions} from './scientific_entities.js';
import {withReaderConditions,readerConditionAxes} from './knowledge_link.js';
import type {Fact245} from './phase245_spec_extraction.js';
import type {ScreenedLead265} from './phase265_test_measurements.js';
import type {QualitativeObservation269} from './phase269_qualitative_observations.js';

export const SCIENTIFIC_READER98='sr98.1';
export type ConditionState98='explicit'|'inferred';
export interface ConditionReading98 {
 /** canonical id: a QK axis id, 'pd:<dimension>' for a definition dimension with no axis, 'code:<code>' for a reader code no axis covers */
 id:string;value:string|null;state:ConditionState98;from:'reader_code'|'label'|'context'|'protocol'}
export interface ScientificReading98 {
 form:'quantity'|'judgement'|'categorical';
 quantity:{kind:string|null;kindStatus:'typed'|'ambiguous'|'not_recognised';metric:string|null}|null;
 property:{id:string|null;state:'stated'|'inferred'|'ambiguous'|'unknown';rule:string|null;definitionState:Lifecycle|null};
 conditions:ConditionReading98[];
 /** canonical ids of the conditions the property's definition or its QK metric require that the observation does not state */
 missing:string[];
 /** canonical ids stated with two different values */
 conflicts:string[];
 method:{codes:string[];cue:string|null;instrumentStated:boolean};
 nature:'measured'|'declared'|'calculated'|'condition'|'unresolved';natureBasis:string;
 judgement:{aspect:string;polarity:string;strength:string}|null;
 knowledgeState:'candidate'|'uncertain';
}
export interface ScientificContext98 {qk:QuantityKnowledge;defs:PropertyDefinitions;identity:{reader:string;definitions:string;quantityKnowledge:string}}
let cached:ScientificContext98|null=null;
/** The knowledge the operational path interprets with: QK with the reader-condition axes; pd.5 plus the QK metrics no
 * definition covers, as candidates with their required conditions. Public knowledge only (no private package is read). */
export function scientificContext98():ScientificContext98{
 if(cached)return cached;
 const qk0=loadQuantityKnowledge();const qk=withReaderConditions(qk0);const pd=loadPropertyDefinitions(qk);
 const defs=withAcquiredDefinitions(qk,pd.pack,metricEntities(qk,pd),{rows:false,metrics:true,transferConditions:true,sourceId:'s98_qk_metrics'}).defs;
 return cached={qk,defs,identity:{reader:SCIENTIFIC_READER98,definitions:defs.identity,quantityKnowledge:qk.identity}};
}
/** Canonical id of a definition dimension: its QK axis, or 'pd:<id>'. */
export function canonicalDimension98(defs:PropertyDefinitions,dimension:string):string{return defs.dimensions.get(dimension)?.qkAxis??'pd:'+dimension;}

function conditionsOf(ctx:ScientificContext98,property:string|null,interp:ReturnType<typeof interpretWithDefinitions>,typed:ReturnType<typeof typeQuantity>|null,codes:readonly string[]):{conditions:ConditionReading98[];missing:string[];conflicts:string[]}{
 const out:ConditionReading98[]=[];
 const push=(c:ConditionReading98)=>{if(!out.some(x=>x.id===c.id&&x.value===c.value))out.push(c);};
 for(const r of interp.conditions)if(r.dimension&&!r.relational)push({id:canonicalDimension98(ctx.defs,r.dimension),value:r.value,state:'explicit',from:'label'});
 for(const c of typed?.conditions??[])push({id:c.axis,value:c.value,state:c.from==='method'||c.from==='context'?'inferred':'explicit',from:c.from==='context'?'context':c.from==='method'?'protocol':'label'});
 const rc=readerConditionAxes(codes);
 for(const [axis,value] of rc.axes)push({id:axis,value,state:'explicit',from:'reader_code'});
 for(const u of rc.unmapped)push({id:'code:'+u,value:null,state:'explicit',from:'reader_code'});
 const stated=new Set(out.filter(c=>c.value!==null||c.id.startsWith('code:')).map(c=>c.id));
 const required=new Set<string>([...interp.missingDefining.map(d=>canonicalDimension98(ctx.defs,d)),...(typed?.missingConditions??[])]);
 const d=property?ctx.defs.properties.get(property):undefined;const m=d?.quantity?.metric?ctx.qk.metrics.get(d.quantity.metric):undefined;
 for(const a of m?.requires??[])required.add(a);
 const missing=[...required].filter(id=>!stated.has(id)).sort();
 const conflicts=[...new Set(out.filter(c=>c.value!==null&&c.state==='explicit'&&out.some(x=>x.id===c.id&&x.value!==null&&x.value!==c.value&&x.state==='explicit')).map(c=>c.id))].sort();
 return {conditions:out,missing,conflicts};
}
function readQuantity(ctx:ScientificContext98,o:{value:number|null;unit:string;label:string;context:string;conditions:readonly string[];category:string|null;codes?:readonly string[]},
 nature:ScientificReading98['nature'],natureBasis:string,method:ScientificReading98['method']):ScientificReading98{
 const {qk,defs}=ctx;const u=o.unit?parseUnit(qk,o.unit.trim()):null;
 const typed=u?typeQuantity(qk,{surface:`${o.value??''} ${o.unit}`.trim(),value:o.value,unit:u},{labels:[o.label],conditions:o.conditions,context:o.context?[o.context]:[]}):null;
 const interp=interpretWithDefinitions(defs,qk,{value:o.value,unit:o.unit,label:o.label,context:o.context,conditions:[...o.conditions],category:o.category},{ownTermObject:true} as never);
 const p=interp.property;const prop=p.value;const c=conditionsOf(ctx,prop,interp,typed,o.codes??[]);
 const pstate:ScientificReading98['property']['state']=p.state==='stated'||p.state==='inferred'?p.state:p.state==='ambiguous'?'ambiguous':'unknown';
 return {form:'quantity',quantity:{kind:typed?.kind.id??null,kindStatus:!u?'not_recognised':typed?.kind.id?'typed':'ambiguous',metric:typed?.metric.id??null},
  property:{id:prop,state:pstate,rule:p.rule,definitionState:prop?defs.properties.get(prop)?.state??null:null},...c,method,nature,natureBasis,judgement:null,
  knowledgeState:pstate==='ambiguous'||c.conflicts.length?'uncertain':'candidate'};
}
/** A Phase245 specification declaration: a declared value; its label is the declaration's own property label. */
export function readDeclaration98(ctx:ScientificContext98,f:Fact245,category:string|null):ScientificReading98|null{
 const v=f.value as {kind:string;number?:number;min?:number;unit?:string};
 if(v.kind!=='quantity'&&v.kind!=='range')return null;
 return readQuantity(ctx,{value:v.kind==='range'?v.min??null:v.number??null,unit:v.unit??'',label:f.property,context:f.section??'',conditions:[],category},
  'declared','specification_declaration',{codes:[],cue:null,instrumentStated:false});
}
/** A screened Phase265 test-result lead: a publisher-reported measurement with its reader codes and method cue; the label
 * is the publisher's dimension (a QK metric's label when the reader typed one) and the lead's own condition text. */
export function readTestLead98(ctx:ScientificContext98,l:ScreenedLead265,category:string|null):ScientificReading98{
 const dimLabel=ctx.qk.metrics.get(l.dimension)?.label??(l.dimension==='not_established'?'':l.dimension.replace(/_/g,' '));
 const codes=[...l.conditionCodes,...l.protocolCodes];
 return readQuantity(ctx,{value:l.value,unit:l.unit,label:[dimLabel,l.condition??''].filter(Boolean).join(' '),context:'',conditions:l.condition?[l.condition]:[],category,codes},
  'measured','publisher_test_lead:'+l.methodCue,{codes:[...new Set(codes)].sort(),cue:l.methodCue,instrumentStated:!!l.instrument});
}
/** A Phase269 qualitative code: a judgement, never a measurement. */
export function readQualitative98(_ctx:ScientificContext98,q:QualitativeObservation269):ScientificReading98{
 return {form:'judgement',quantity:null,property:{id:null,state:'unknown',rule:'judgement_not_a_quantity',definitionState:null},
  conditions:q.settingAdjusted?[{id:'code:setting_adjusted',value:null,state:'explicit',from:'reader_code'}]:[],missing:[],conflicts:[],
  method:{codes:[],cue:q.basis,instrumentStated:false},nature:'unresolved',natureBasis:'qualitative_'+q.basis,
  judgement:{aspect:q.outcome==='taught_dimension'?(q.dimension272??'taught_dimension'):q.outcome,polarity:q.direction,strength:q.strength},knowledgeState:'candidate'};
}
export const reading98Digest=(r:ScientificReading98)=>createHash('sha256').update(JSON.stringify(r)).digest('hex');

// ---------------- the page through the shared path ----------------
import {readDocumentEvidence,type SegmentQuantity} from './document_evidence.js';
import {screenTestLead265,type TestLeadsInput265} from './phase265_test_measurements.js';
import type {SpecExtraction245} from './phase245_spec_extraction.js';
const NATURE:Record<string,ScientificReading98['nature']>={publisher_measured:'measured',manufacturer_declared:'declared',nominal_certified:'declared',derived_or_estimated:'calculated'};
/** A quantity the structural document reader found in prose or a label:value line (document_evidence). Its own words (the
 * text just before it in its sentence) are the label; the reader's QK typing, product, evidential class and record role are
 * kept. A number that is part of a product or model name is not a quantity of the product. */
export function readDocumentQuantity98(ctx:ScientificContext98,q:SegmentQuantity,segmentText:string,segmentLabel:string|null,headings:readonly string[],category:string|null):ScientificReading98|null{
 if(q.identifierPart||!q.quantity||q.quantity.value===null)return null;
 const at=q.start;const sentStart=Math.max(0,segmentText.slice(0,at).search(/[^.!?]*$/));
 const own=(segmentLabel?segmentLabel+' | ':'')+segmentText.slice(Math.max(sentStart,at-80),at+String(q.surface).length+30);
 const unit=q.quantity.unit.expression;const conds=q.quantity.conditions.map(c=>c.raw).filter(Boolean);
 const nature=q.recordRole==='condition'?'condition':NATURE[q.evidenceClass]??'unresolved';
 const r=readQuantity(ctx,{value:q.quantity.value,unit,label:own,context:headings.slice(-2).join(' | '),conditions:conds,category},nature,'document_evidence:'+q.evidenceClass,{codes:[],cue:null,instrumentStated:false});
 return r;
}
export interface PageReading98 {interpreter:ScientificContext98['identity'];
 declarations:{key:string;reading:ScientificReading98}[];leads:{leadId:string;reading:ScientificReading98}[];
 document:{key:string;value:number;unit:string;product:string|null;productBasis:string;evidenceClass:string;locator:string;reading:ScientificReading98}[];
 qualitative:{index:number;reading:ScientificReading98}[];
 counts:{declarations:number;leads:number;documentQuantities:number;documentKept:number;documentSkipped:Record<string,number>}}
/** The stable key of a Phase245 declaration within its revision (the store derives the same key). */
export function declarationKey98(f:Fact245):string{return createHash('sha256').update(JSON.stringify([f.section,f.propertyKey,f.value,f.variant,f.product.ref,f.product.name])).digest('hex').slice(0,24);}
/** Read one page (transient bytes) through the shared scientific path: the existing extractors' outputs are interpreted,
 * and document_evidence quantities the extractors did not capture are added only when the interpretation attributes them
 * to a defined property (stated or inferred); everything else is counted, not kept. */
export function readPage98(html:string,url:string,sha256:string,x:SpecExtraction245|null,leads:TestLeadsInput265|null,quals:readonly QualitativeObservation269[],category:string|null,sourceType:string|null):PageReading98{
 const ctx=scientificContext98();const out:PageReading98={interpreter:ctx.identity,declarations:[],leads:[],document:[],qualitative:[],
  counts:{declarations:0,leads:0,documentQuantities:0,documentKept:0,documentSkipped:{}}};
 const skip=(k:string)=>{out.counts.documentSkipped[k]=(out.counts.documentSkipped[k]??0)+1;};
 const taken:{value:number;unit:string}[]=[];const nu=(u:string)=>u.replace(/\s+/g,'').toLowerCase();
 for(const f of x?.facts??[]){const r=readDeclaration98(ctx,f,category);if(!r)continue;out.declarations.push({key:declarationKey98(f),reading:r});out.counts.declarations++;
  const v=f.value as {number?:number;min?:number;unit?:string};if(v.unit)taken.push({value:v.number??v.min??NaN,unit:nu(v.unit)});}
 for(const c of leads?.probe.candidates??[]){const s=screenTestLead265(c,{url,sha256});if(!s.ok)continue;
  out.leads.push({leadId:s.lead.leadId,reading:readTestLead98(ctx,s.lead,category)});out.counts.leads++;taken.push({value:s.lead.value,unit:nu(s.lead.unit)});}
 const de=readDocumentEvidence(html,ctx.qk,{sourceType});const segs=new Map(de.segments.map(s=>[s.id,s]));
 for(const q of de.quantities){out.counts.documentQuantities++;const s=segs.get(q.segment);if(!s||s.region==='boilerplate'||s.duplicateOf){skip('boilerplate_or_duplicate');continue;}
  if(q.identifierPart){skip('product_name_part');continue;}if(!q.quantity||q.quantity.value===null){skip('not_a_point_value');continue;}
  const unit=q.quantity.unit.expression;if(taken.some(t=>t.value===q.quantity!.value&&t.unit===nu(unit))){skip('already_extracted');continue;}
  const r=readDocumentQuantity98(ctx,q,s.text,s.label,s.headings,category);if(!r){skip('not_read');continue;}
  if(!r.property.id||(r.property.state!=='stated'&&r.property.state!=='inferred')){skip('no_defined_property');continue;}
  out.document.push({key:createHash('sha256').update(url+'|'+s.locator+'|'+q.start).digest('hex').slice(0,24),value:q.quantity.value,unit,product:q.product,productBasis:q.productBasis,
   evidenceClass:q.evidenceClass,locator:s.locator.slice(-200),reading:r});out.counts.documentKept++;}
 quals.forEach((q,i)=>out.qualitative.push({index:i,reading:readQualitative98(ctx,q)}));
 return out;
}
