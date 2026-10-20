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
import {loadQuantityKnowledge,parseUnit,typeQuantity,quantityBound,type QuantityKnowledge} from './quantity_knowledge.js';
import {loadPropertyDefinitions,type PropertyDefinitions,type Lifecycle} from './property_definitions.js';
import {interpretWithDefinitions,type StructuralContext} from './definition_interpreter.js';
import {metricEntities,withAcquiredDefinitions} from './scientific_entities.js';
import {withReaderConditions,readerConditionAxes} from './knowledge_link.js';
import type {Fact245} from './phase245_spec_extraction.js';
import type {ScreenedLead265} from './phase265_test_measurements.js';
import type {QualitativeObservation269} from './phase269_qualitative_observations.js';

export const SCIENTIFIC_READER98='sr99.1';
/** S99 (owner review of S98, 2026-10-20, verbatim in owner-review-s98-semantic-integrity-2026-10-20.md): the role of the
 * statement a value sits in, decided before the value is attributed to a product. A result was obtained (measured or
 * calculated); a specification is a maker's or certifier's stated value; a threshold is a bound with no product claim
 * ("under 45 dB"); a norm is a value a standard, regulation or guideline sets; a target is what a test or a buyer aims at;
 * a condition is a setting of the test. Only results and specifications are values OF a product. */
export type StatementRole99='result'|'specification'|'threshold'|'norm'|'target'|'condition'|'judgement'|'unresolved';
export interface StatementReading99 {role:StatementRole99;
 /** a bounded value ("up to 4 hours", "under 45 dB") is a limit, never a point value */
 bound:'min'|'max'|null;cue:string|null;basis:string}
/** S99: whose value it is, and on what evidence. A product is linked only when the source states it (its row, its name in
 * the clause, an anaphor to the page product, the section it heads); otherwise unresolved. Never inferred from similarity. */
export interface SubjectReading99 {value:'page_product'|'named_product'|'other_product'|'none'|'unresolved';name:string|null;basis:string}
/** S99: the observation's identity in its source: which reader found it and where (a locator and offset; no text). */
export interface SourceIdentity99 {reader:'phase245'|'phase265'|'document_evidence'|'phase269';key:string;locator:string|null;offset:number|null}
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
 /** S99: statement role, subject, who produced the value, the result's basis (per run, per period) and object of interest */
 statement:StatementReading99;subject:SubjectReading99;provenance:'publisher'|'manufacturer'|'third_party'|'unresolved';
 resultBasis:string|null;object:string|null;source:SourceIdentity99|null;
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
type Interp=ReturnType<typeof interpretWithDefinitions>;
interface QuantityObservation {value:number|null;unit:string;label:string;context:string;conditions:readonly string[];category:string|null;codes?:readonly string[];
 /** S99: the value's position in its label, its printed form, the page product and the document frame (full clause reading) */
 valueAt?:number|null;surface?:string|null;pageSubject?:string|null;frame?:string|null;structure?:StructuralContext|null}
function interpretQuantity(ctx:ScientificContext98,o:QuantityObservation):{typed:ReturnType<typeof typeQuantity>|null;interp:Interp;unitOk:boolean}{
 const {qk,defs}=ctx;const u=o.unit?parseUnit(qk,o.unit.trim()):null;
 const typed=u?typeQuantity(qk,{surface:`${o.value??''} ${o.unit}`.trim(),value:o.value,unit:u},{labels:[o.label],conditions:o.conditions,context:o.context?[o.context]:[]}):null;
 const full=o.valueAt!=null;
 const interp=interpretWithDefinitions(defs,qk,{value:o.value,unit:o.unit,label:o.label,context:o.context,conditions:[...o.conditions],category:o.category,
  ...(full?{valueAt:o.valueAt,surface:o.surface??null,pageSubject:o.pageSubject??null,frame:o.frame??null,structure:o.structure??null}:{})},
  full?{ownTermObject:true,roleModel:'links',situation:true,provenance:true} as never:{ownTermObject:true} as never);
 return {typed,interp,unitOk:!!u};
}
function assemble(ctx:ScientificContext98,o:QuantityObservation,q:{typed:ReturnType<typeof typeQuantity>|null;interp:Interp;unitOk:boolean},
 nature:ScientificReading98['nature'],natureBasis:string,method:ScientificReading98['method'],
 x:{statement:StatementReading99;subject:SubjectReading99;provenance:ScientificReading98['provenance'];source:SourceIdentity99|null}):ScientificReading98{
 const {typed,interp}=q;const p=interp.property;const prop=p.value;const c=conditionsOf(ctx,prop,interp,typed,o.codes??[]);
 const pstate:ScientificReading98['property']['state']=p.state==='stated'||p.state==='inferred'?p.state:p.state==='ambiguous'?'ambiguous':'unknown';
 const basis=interp.basis.value&&interp.basis.value!=='none'&&(interp.basis.state==='stated'||interp.basis.state==='inferred')?interp.basis.value:null;
 return {form:'quantity',quantity:{kind:typed?.kind.id??null,kindStatus:!q.unitOk?'not_recognised':typed?.kind.id?'typed':'ambiguous',metric:typed?.metric.id??null},
  property:{id:prop,state:pstate,rule:p.rule,definitionState:prop?ctx.defs.properties.get(prop)?.state??null:null},...c,method,nature,natureBasis,judgement:null,
  knowledgeState:pstate==='ambiguous'||c.conflicts.length?'uncertain':'candidate',
  statement:x.statement,subject:x.subject,provenance:x.provenance,resultBasis:basis,object:prop?interp.object.value??null:null,source:x.source};
}
/** The bound a value's own words put on it, from the quantity knowledge's shared bound words. */
function boundOf(ctx:ScientificContext98,text:string,start:number,end:number,unit:string):{bound:'min'|'max'|null;cue:string|null}{
 const u=unit?parseUnit(ctx.qk,unit.trim()):null;if(!u)return {bound:null,cue:null};
 const b=quantityBound(ctx.qk,text,start,end,u.kinds);return {bound:b.bound,cue:b.cue};
}
/** A Phase245 specification declaration: a declared value of the row's product; its label is the declaration's own property
 * label. A bound in the printed value ("up to 120 min") is kept: a bounded specification is not a point value. */
export function readDeclaration98(ctx:ScientificContext98,f:Fact245,category:string|null,key?:string):ScientificReading98|null{
 const v=f.value as {kind:string;number?:number;min?:number;unit?:string};
 if(v.kind!=='quantity'&&v.kind!=='range')return null;
 const o:QuantityObservation={value:v.kind==='range'?v.min??null:v.number??null,unit:v.unit??'',label:f.property,context:f.section??'',conditions:[],category};
 const raw=String(f.rawValue??'');const at=raw.search(/\d/);const b=at>=0?boundOf(ctx,raw,at,at+(/^[\d.,]+/.exec(raw.slice(at))?.[0].length??1),v.unit??''):{bound:null,cue:null};
 return assemble(ctx,o,interpretQuantity(ctx,o),'declared','specification_declaration',{codes:[],cue:null,instrumentStated:false},
  {statement:{role:'specification',bound:b.bound,cue:b.cue,basis:'phase245_specification_row'},subject:{value:'page_product',name:null,basis:'phase245_row_identity'},
   provenance:'manufacturer',source:{reader:'phase245',key:key??declarationKey98(f),locator:f.locator?.slice(-200)??null,offset:null}});
}
/** A screened Phase265 test-result lead: a publisher-reported measurement with its reader codes and method cue; the label
 * is the publisher's dimension (a QK metric's label when the reader typed one) and the lead's own condition text. The
 * Phase265 screen already refuses bounds, thresholds, hypotheticals and declarations, so a lead is a result. */
export function readTestLead98(ctx:ScientificContext98,l:ScreenedLead265,category:string|null):ScientificReading98{
 const dimLabel=ctx.qk.metrics.get(l.dimension)?.label??(l.dimension==='not_established'?'':l.dimension.replace(/_/g,' '));
 const codes=[...l.conditionCodes,...l.protocolCodes];
 const o:QuantityObservation={value:l.value,unit:l.unit,label:[dimLabel,l.condition??''].filter(Boolean).join(' '),context:'',conditions:l.condition?[l.condition]:[],category,codes};
 const sa=l.subjectAssignment;
 const subj:SubjectReading99=sa==='page_context_unverified'&&l.subject?{value:'page_product',name:l.subject.name,basis:'phase265_'+sa}:
  (sa==='table_row_declared_model_unverified'||sa==='clause_named_model_unverified')&&l.subject?{value:'named_product',name:l.subject.name,basis:'phase265_'+sa}:{value:'unresolved',name:null,basis:'phase265_'+sa};
 return assemble(ctx,o,interpretQuantity(ctx,o),'measured','publisher_test_lead:'+l.methodCue,{codes:[...new Set(codes)].sort(),cue:l.methodCue,instrumentStated:!!l.instrument},
  {statement:{role:'result',bound:null,cue:null,basis:'phase265_screened_result'},subject:subj,provenance:'publisher',
   source:{reader:'phase265',key:l.leadId,locator:'block:'+l.blockIndex,offset:l.valueOffset}});
}
/** A Phase269 qualitative code: a judgement, never a measurement. */
export function readQualitative98(_ctx:ScientificContext98,q:QualitativeObservation269,_i=0):ScientificReading98{
 return {form:'judgement',quantity:null,property:{id:null,state:'unknown',rule:'judgement_not_a_quantity',definitionState:null},
  conditions:q.settingAdjusted?[{id:'code:setting_adjusted',value:null,state:'explicit',from:'reader_code'}]:[],missing:[],conflicts:[],
  method:{codes:[],cue:q.basis,instrumentStated:false},nature:'unresolved',natureBasis:'qualitative_'+q.basis,
  judgement:{aspect:q.outcome==='taught_dimension'?(q.dimension272??'taught_dimension'):q.outcome,polarity:q.direction,strength:q.strength},knowledgeState:'candidate',
  statement:{role:'judgement',bound:null,cue:null,basis:'phase269_'+q.basis},subject:{value:'page_product',name:null,basis:'phase269_page_review'},provenance:'publisher',
  resultBasis:null,object:null,source:{reader:'phase269',key:'q'+_i,locator:null,offset:null}};
}
export const reading98Digest=(r:ScientificReading98)=>createHash('sha256').update(JSON.stringify(r)).digest('hex');

// ---------------- the page through the shared path ----------------
import {readDocumentEvidence,type SegmentQuantity,type Segment} from './document_evidence.js';
import {textBlocks225} from './phase225_transient_test_probe.js';
import {TEST_CONTEXT272} from './phase272_extraction_plan.js';
import {screenTestLead265,type TestLeadsInput265} from './phase265_test_measurements.js';
import type {SpecExtraction245} from './phase245_spec_extraction.js';
const NATURE:Record<string,ScientificReading98['nature']>={publisher_measured:'measured',manufacturer_declared:'declared',nominal_certified:'declared',derived_or_estimated:'calculated'};
const has99=(text:string,cue:string)=>new RegExp('(?:^|[^\\p{L}\\p{N}])'+cue.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\p{L}\\p{N}])','u').test(text.toLowerCase());
/** The value's own clause in its sentence (clause breaks: punctuation and contrastive conjunctions). */
function clauseOf(sent:string,start:number,end:number):string{
 const head=sent.slice(0,start).split(/[;:()–—]|[.!?](?:\s|$)|,\s|\b(?:but|while|whereas|although)\b/i).at(-1)??'';const tail=sent.slice(end).split(/[;:()–—]|[.!?](?:\s|$)|,\s|\b(?:but|while|whereas|although|which)\b/i)[0]??'';
 return head+sent.slice(start,end)+tail;
}
/** S99: the statement role of a value in its sentence. Norm and target cues of the value's own clause come first (data in the
 * definitions pack); then a bound (shared quantity-knowledge bound words): a bounded value a maker states is a bounded
 * specification, a bounded value the publisher reports with an event verb a bounded result, any other bound a threshold;
 * otherwise the evidential role the interpreter found from positive evidence (S91-S93). Never a default to 'result'. */
export function statementRole99(ctx:ScientificContext98,sent:string,start:number,end:number,unit:string,role:{value:string|null;reason:string|null},fallbackClass:string|null):StatementReading99{
 const clause=clauseOf(sent,start,end);const cues=ctx.defs.pack.statementRoles;
 // a norm cue names an external rule; followed by a mode, setting or level word it names the product's own mode ("standard mode")
 const after=new Set(cues?.notNormAfter??[]);
 const normHit=(c:string)=>{const re=new RegExp('(?:^|[^\\p{L}\\p{N}])'+c.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\p{L}\\p{N}])\\s*([\\p{L}]+)?','gu');
  for(const m of clause.toLowerCase().matchAll(re))if(!m[1]||!after.has(m[1]))return true;return false;};
 const norm=cues?.norm.find(normHit);if(norm)return {role:'norm',...boundOf(ctx,sent,start,end,unit),basis:'norm_cue:'+norm};
 const target=cues?.target.find(c=>has99(clause,c));if(target)return {role:'target',...boundOf(ctx,sent,start,end,unit),basis:'target_cue:'+target};
 const b=boundOf(ctx,sent,start,end,unit);const r=role.value;
 const mapped:StatementRole99|null=r==='measured_result'||r==='derived'?'result':r==='declared_spec'||r==='certified_or_quoted'?'specification':r==='test_condition'||r==='programme_preset'?'condition':null;
 const fromClass:StatementRole99|null=fallbackClass==='publisher_measured'||fallbackClass==='derived_or_estimated'?'result':fallbackClass==='manufacturer_declared'||fallbackClass==='nominal_certified'?'specification':null;
 if(b.bound){
  // a generic or sufficiency claim ("anything under 45 dB", "quiet enough") states a threshold, not a product's value
  const generic=(cues?.threshold??[]).find(c=>has99(clause,c));
  if(generic)return {role:'threshold',...b,basis:'bound_in_generic_claim:'+generic};
  if(mapped==='specification'||mapped==='result')return {role:mapped,...b,basis:'bounded_'+mapped+':'+(role.reason??'')};
  if(fromClass)return {role:fromClass,...b,basis:'bounded_'+fromClass+':document_class:'+fallbackClass};
  return {role:'unresolved',...b,basis:'bound_without_role_evidence'};}
 if(mapped)return {role:mapped,bound:null,cue:null,basis:'evidence_role:'+(role.reason??'')};
 if(fromClass)return {role:fromClass,bound:null,cue:null,basis:'document_class:'+fallbackClass};
 return {role:'unresolved',bound:null,cue:null,basis:'no_positive_evidence'};
}
const normName99=(x:string)=>x.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
/** A quantity the structural document reader found in prose or a label:value line (document_evidence), read in its own
 * sentence: the interpreter gets the value's position, the page product and the section structure, so the evidential role
 * (S91 positive evidence, S92 situation type), the nature and provenance (S93) and the clause's other product (S86c) are
 * those of this occurrence. A number that is part of a product or model name is not a quantity of the product. */
export function readDocumentQuantity98(ctx:ScientificContext98,q:SegmentQuantity,seg:Segment,pageSubject:string|null,documentTests:boolean,category:string|null,url='',pageNames:readonly string[]=pageSubject?[pageSubject]:[]):ScientificReading98|null{
 if(q.identifierPart||!q.quantity||q.quantity.value===null)return null;
 const text=seg.text;const at=q.start;const len=String(q.surface).length;
 const sentStart=Math.max(0,text.slice(0,at).search(/[^.!?]*$/));let sentEnd=text.slice(at+len).search(/[.!?](?:\s|$)/);sentEnd=sentEnd<0?text.length:at+len+sentEnd+1;
 const winStart=Math.max(sentStart,at-120);const prefix=seg.label?seg.label+' | ':'';
 const label=prefix+text.slice(winStart,Math.min(sentEnd,at+len+60));const valueAt=prefix.length+(at-winStart);
 const unit=q.quantity.unit.expression;const conds=q.quantity.conditions.map(c=>c.raw).filter(Boolean);
 const sc=ctx.defs.pack.documentSections;let sectionRole:StructuralContext['sectionRole']=null;
 if(sc)for(const h of [...seg.headings].reverse()){const t=h.toLowerCase();if(sc.specification.some(c=>has99(t,c))){sectionRole='specification';break;}if(sc.comparison.some(c=>has99(t,c))){sectionRole='comparison';break;}if(sc.test.some(c=>has99(t,c))){sectionRole='test';break;}}
 const structure:StructuralContext={container:seg.role==='pair'||seg.role==='embedded_pair'?'label_value':'prose',label:seg.label,section:seg.headings.at(-1)??null,sectionRole,tableContext:null,documentTests,sectionHeadingLine:null};
 const o:QuantityObservation={value:q.quantity.value,unit,label,context:seg.headings.slice(-2).join(' | '),conditions:conds,category,valueAt,surface:q.surface,pageSubject,frame:seg.headings.join(' | '),structure};
 const qi=interpretQuantity(ctx,o);const it=qi.interp;
 // the Phase225 sentence cue that makes a value a test setting does not decide alone when the definitions state the value's
 // own property ("at 3 litres, the dust bag holds…", "a running time of 180 minutes in Quiet mode")
 const conditionCue=it.role.value==='test_condition'||it.role.value==='programme_preset';
 const role=conditionCue&&it.property.state==='stated'?{value:null,reason:'condition_cue_with_stated_property:'+(it.role.reason??'')}:it.role;
 // document_evidence classes a sentence 'publisher_measured' by a page-level default on pages that report tests (audit S77):
 // a document default is not the value's own evidence, so it counts only when the value's block carries a test cue itself
 const localTest=TEST_CONTEXT272.test(seg.text)||/\b(?:I|we) (?:tested|measured|timed|recorded|weighed|metered)\b/i.test(seg.text);
 const docClass=q.evidenceClass==='publisher_measured'&&!localTest?null:q.evidenceClass;
 const statement=q.recordRole==='condition'?{role:'condition' as const,bound:null,cue:null,basis:'document_record_condition'}:statementRole99(ctx,label,valueAt,valueAt+len,unit,role,docClass);
 // nature: the clause's own evidence (S93) first; the document class only when the clause has none; a statement that is
 // not a value of the product (threshold, norm, target) has no nature of a result
 const ev=it.evidence;let nature:ScientificReading98['nature'];let natureBasis:string;
 if(statement.role==='condition'){nature='condition';natureBasis='condition:'+statement.basis;}
 else if(statement.role==='threshold'||statement.role==='norm'||statement.role==='target'){nature='unresolved';natureBasis='statement_role:'+statement.role;}
 else if(ev&&ev.nature!=='unresolved'&&ev.nature!=='condition'){nature=ev.nature;natureBasis='clause_evidence:'+ev.reason;}
 else if(statement.role==='specification'){nature='declared';natureBasis='statement_role:specification:'+statement.basis;}
 else if(statement.role==='result'){nature=NATURE[docClass??'']==='calculated'?'calculated':'measured';natureBasis='statement_role:result:'+statement.basis;}
 else {nature='unresolved';natureBasis='document_evidence:'+q.evidenceClass+':no_clause_evidence';}
 // subject: never a product for a statement that is not a value of one; another product named in the clause is never the
 // page's; otherwise the product the source states (sentence, embedded item, section heading, anaphor to the page product)
 const mains=new Set(pageNames.map(normName99));const main=pageSubject?normName99(pageSubject):null;const own=q.product&&q.productBasis!=='none'?q.product:null;
 const isPage=(n:string)=>mains.has(normName99(n));
 let subject:SubjectReading99;
 if(statement.role==='threshold'||statement.role==='norm'||statement.role==='target'||statement.role==='condition')subject={value:'none',name:null,basis:'statement_role:'+statement.role};
 // S86c's check only WITHHOLDS the page product (a capitalised word may be a mode name): it is another product only when a
 // product other than the page's is actually named
 else if(it.subject==='other_product')subject=own&&!isPage(own)?{value:'other_product',name:own,basis:'other_product_named:'+q.productBasis}:{value:'unresolved',name:null,basis:'possible_other_product_in_clause'};
 else if(own&&main&&isPage(own))subject=sectionRole==='comparison'&&q.productBasis!=='sentence'?{value:'unresolved',name:null,basis:'comparison_section'}:{value:'page_product',name:own,basis:'stated_'+q.productBasis};
 else if(own)subject={value:'named_product',name:own,basis:'stated_'+q.productBasis};
 else subject={value:'unresolved',name:null,basis:'not_stated'};
 const provenance:ScientificReading98['provenance']=ev?.provenance??(statement.role==='specification'?'manufacturer':statement.role==='result'?'publisher':'unresolved');
 return assemble(ctx,o,qi,nature,natureBasis,{codes:[],cue:null,instrumentStated:false},{statement,subject,provenance,
  // identity: the segment (one element can hold several segments, each with its own offsets), its element and the offset
  source:{reader:'document_evidence',key:createHash('sha256').update(url+'|'+seg.id+'|'+seg.locator+'|'+(seg.embedded?.path??'')+'|'+q.start).digest('hex').slice(0,24),locator:seg.locator.slice(-200),offset:q.start}});
}
export interface PageReading98 {interpreter:ScientificContext98['identity'];
 declarations:{key:string;reading:ScientificReading98}[];leads:{leadId:string;reading:ScientificReading98}[];
 document:{key:string;value:number;unit:string;product:string|null;productBasis:string;evidenceClass:string;locator:string;reading:ScientificReading98}[];
 qualitative:{index:number;reading:ScientificReading98}[];
 counts:{declarations:number;leads:number;documentQuantities:number;documentKept:number;documentSkipped:Record<string,number>;
  /** S99: how 'already captured' was decided: the same occurrence, the same value elsewhere (read), a lead whose text could not be verified (treated as the same) */
  identity:{sameOccurrence:number;sameValueOtherOccurrence:number;leadTextUnverified:number}}}
/** The stable key of a Phase245 declaration within its revision (the store derives the same key). */
export function declarationKey98(f:Fact245):string{return createHash('sha256').update(JSON.stringify([f.section,f.propertyKey,f.value,f.variant,f.product.ref,f.product.name])).digest('hex').slice(0,24);}
/** Read one page (transient bytes) through the shared scientific path: the existing extractors' outputs are interpreted,
 * and document_evidence quantities the extractors did not capture are added only when the interpretation attributes them
 * to a defined property (stated or inferred); everything else is counted, not kept.
 * S99: an observation is the same as one an extractor captured only when it is the same occurrence in the source (the
 * same element as a Phase245 declaration, or the same block text and value as a Phase265 lead), never because two values
 * share a number and a unit: two products, two conditions or a declaration and a test result can print the same value. */
export function readPage98(html:string,url:string,sha256:string,x:SpecExtraction245|null,leads:TestLeadsInput265|null,quals:readonly QualitativeObservation269[],category:string|null,sourceType:string|null):PageReading98{
 const ctx=scientificContext98();const out:PageReading98={interpreter:ctx.identity,declarations:[],leads:[],document:[],qualitative:[],
  counts:{declarations:0,leads:0,documentQuantities:0,documentKept:0,documentSkipped:{},identity:{sameOccurrence:0,sameValueOtherOccurrence:0,leadTextUnverified:0}}};
 const skip=(k:string)=>{out.counts.documentSkipped[k]=(out.counts.documentSkipped[k]??0)+1;};
 // units compare in the quantity knowledge's canonical form ('nits' and 'cd/m²' are one unit)
 const nu=(u:string)=>{const p=u?parseUnit(ctx.qk,u.trim()):null;return p?p.expression:u.replace(/\s+/g,'').toLowerCase();};const nt=(t:string)=>t.replace(/\s+/g,' ').trim().toLowerCase();
 type Taken={value:number;unit:string;locator:string|null;window:string|null;kind:'declaration'|'lead'};const taken:Taken[]=[];
 for(const f of x?.facts??[]){const key=declarationKey98(f);const r=readDeclaration98(ctx,f,category,key);if(!r)continue;out.declarations.push({key,reading:r});out.counts.declarations++;
  const v=f.value as {number?:number;min?:number;unit?:string};if(v.unit)taken.push({value:v.number??v.min??NaN,unit:nu(v.unit),locator:(f.locator??'').replace(/@r\d+c\d+$/,'')||null,window:null,kind:'declaration'});}
 // a lead's own block text (the probe's default blocks), verified by its hash, gives the occurrence's text window
 let blocks:string[]|null=null;
 for(const c of leads?.probe.candidates??[]){const sc=screenTestLead265(c,{url,sha256});if(!sc.ok)continue;
  out.leads.push({leadId:sc.lead.leadId,reading:readTestLead98(ctx,sc.lead,category)});out.counts.leads++;
  blocks??=textBlocks225(html).blocks;const b=blocks[sc.lead.blockIndex];
  const lines=b?[b,...b.split(/\n+/)]:[];const line=lines.find(l=>createHash('sha256').update(l).digest('hex')===sc.lead.blockSha256)??null;
  const win=line?nt(line.slice(Math.max(0,sc.lead.valueOffset-30),sc.lead.valueOffset+12)):null;
  taken.push({value:sc.lead.value,unit:nu(sc.lead.unit),locator:null,window:win,kind:'lead'});}
 const de=readDocumentEvidence(html,ctx.qk,{sourceType});const segs=new Map(de.segments.map(s=>[s.id,s]));
 const pageSubject=x&&!x.mainProduct.ambiguous&&x.mainProduct.name?x.mainProduct.name:de.pageSubject;
 // the page's own subject as the document states it (title, h1, principal entity): the same statement, not a similar name
 const pageNames=[pageSubject,de.pageSubject].filter((v):v is string=>!!v);
 const documentTests=de.segments.some(s=>s.region==='subject'&&TEST_CONTEXT272.test(s.text));
 for(const q of de.quantities){out.counts.documentQuantities++;const s=segs.get(q.segment);if(!s||s.region==='boilerplate'||s.duplicateOf){skip('boilerplate_or_duplicate');continue;}
  if(q.identifierPart){skip('product_name_part');continue;}if(!q.quantity||q.quantity.value===null){skip('not_a_point_value');continue;}
  const unit=q.quantity.unit.expression;const same=taken.filter(t=>t.value===q.quantity!.value&&t.unit===nu(unit));
  if(same.length){const segText=nt(s.text);
   const occurrence=same.some(t=>t.kind==='declaration'?!!t.locator&&(s.locator.startsWith(t.locator)||t.locator.startsWith(s.locator)):t.window===null||segText.includes(t.window));
   if(same.some(t=>t.kind==='lead'&&t.window===null))out.counts.identity.leadTextUnverified++;
   if(occurrence){out.counts.identity.sameOccurrence++;skip('already_extracted');continue;}
   out.counts.identity.sameValueOtherOccurrence++;}
  const r=readDocumentQuantity98(ctx,q,s,pageSubject,documentTests,category,url,pageNames);if(!r){skip('not_read');continue;}
  if(!r.property.id||(r.property.state!=='stated'&&r.property.state!=='inferred')){skip('no_defined_property');continue;}
  out.document.push({key:r.source!.key,value:q.quantity.value,unit,product:r.subject.name,productBasis:r.subject.basis,
   evidenceClass:q.evidenceClass,locator:s.locator.slice(-200),reading:r});out.counts.documentKept++;}
 quals.forEach((q,i)=>out.qualitative.push({index:i,reading:readQualitative98(ctx,q,i)}));
 return out;
}
