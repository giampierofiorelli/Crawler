/** S88: one interpreter driven by declarative property definitions (src/property_definitions.ts).
 * The same definition is consumed for:
 *  - attribution: which defined property a value reports (unit kind from the quantity-knowledge pack, then the definition's
 *    surface terms in the value's own labels before its context);
 *  - interpretation: which condition dimensions the observation states (definition values, then cues, then typed
 *    quantities of the dimension's kind), each with the relevance the definition gives it; the basis (stated by words or
 *    unit, or the definition's default as an inferred slot only when a run is named);
 *  - evaluation: Q1 comparability from the dimensions the definition says DEFINE the measurand;
 *  - reading: a plan measurement list compiled from the definitions (see definitionPlanMeasurements).
 * No category-specific branch: a category only selects a profile from the data. Shadow: no operational caller. */
import {hasPhrase,normText,parseUnit,typeQuantity,findQuantities,type QuantityKnowledge} from './quantity_knowledge.js';
import {applicableProperties,relevanceOf,type Basis,type ConditionDimension,type PropertyDefinition,type PropertyDefinitions,type Relevance} from './property_definitions.js';
import {UNIT_LEXICON272,TEST_CONTEXT272,type PlanMeasurement272} from './phase272_extraction_plan.js';
import {classifyCondition87} from './observation_model.js';
import {observationRole86c,otherProductInClause86c,type ObservationRole86c} from './phase225_transient_test_probe.js';
import type {DocumentSemantics1D2} from './document_semantics.js';

export const DEFINITION_INTERPRETER_VERSION='pee88.definition-interpreter.v1';
export type SlotState='stated'|'inferred'|'ambiguous'|'unknown';
export interface PropertySlot {value:string|null;state:SlotState;evidence:string[];rule:string|null;alternatives:string[];kind:string|null}
export interface DimensionReading {dimension:string|null;structure:string;value:string|null;state:'stated'|'unknown';relevance:Relevance|null;evidence:string|null;from:'label'|'context'|'condition'|null;
 /** S88 it1: a relation over the condition (comparison, procedure state, identity) from the S87b structural principles. */
 relational?:boolean}
export interface BasisSlot {value:Basis|'none'|null;state:SlotState;evidence:string|null;rule:string|null}
export interface DefinitionInterpretation {version:string;definitions:string;category:string|null;property:PropertySlot;
 conditions:DimensionReading[];
 /** Defining dimensions of the attributed property the observation does not state (limits comparability, never identity). */
 missingDefining:string[];
 /** Condition texts no dimension types (kept, never dropped). */
 untyped:string[];basis:BasisSlot;object:{value:string|null;state:SlotState;rule:string|null};
 /** S89: evidential role and subject from document structure (S86c), kept apart from the property (never merged). */
 role:{value:ObservationRole86c|null;reason:string|null};subject:'page_product'|'other_product'|'unresolved'}
export interface ObservationInput {value:number|null;unit:string;label?:string|null;context?:string|null;conditions?:readonly string[];category?:string|null;
 /** S89: offset of the value in the label; when given, a label term supports the value only if no other number lies between them. */
 valueAt?:number|null;
 /** S89: the printed value (to locate its end) and the page's product name (to tell another product's value). */
 surface?:string|null;pageSubject?:string|null;
 /** S90: what the document's structure says about the value (Step 1D-A2 semantics, reused): its structural label (table
  * headers, the label of a "label: value" line), its container and the role its section or table announces. */
 structure?:StructuralContext|null}
export interface StructuralContext {container:'table_cell'|'label_value'|'prose';label:string|null;section:string|null;
 sectionRole:'specification'|'test'|'comparison'|null;tableContext:'test'|'specification'|'unknown'|null;
 /** S91: the value sits under a methodology heading (Step 1D-A2), and the page type the document announces. */
 methodSection?:boolean;pageType?:string|null;
 /** S91: the document reports its own testing somewhere (first-person test context in any block). */
 documentTests?:boolean}

/** S90: the structural context of a value in reader block `bi` (textBlocks225 order, as Step 1D-A2 aligns it). The section
 * role comes from the heading path, innermost first, matched against the definitions' document-section cues (data). */
export function structuralContextOf(defs:PropertyDefinitions,sem:DocumentSemantics1D2,blockTexts:readonly string[],bi:number,valueStart:number):StructuralContext{
 const b=sem.blocks[bi];const cues=defs.pack.documentSections;
 const headings=(b?.headingPath??[]).map(i=>blockTexts[i]??'').filter(Boolean);
 let sectionRole:StructuralContext['sectionRole']=null;let section:string|null=headings.at(-1)??null;
 if(cues)for(const h of [...headings].reverse()){const t=norm(h);
  if(cues.specification.some(c=>has(t,c))){sectionRole='specification';section=h;break;}
  if(cues.comparison.some(c=>has(t,c))){sectionRole='comparison';section=h;break;}
  if(cues.test.some(c=>has(t,c))){sectionRole='test';section=h;break;}}
 if(b?.cell){const t=sem.tables.find(x=>x.index===b.cell!.table);const cell=t?.cells.find(c=>c.blockIndex===bi);
  const label=[...(cell?.rowLabels??[]),...(cell?.colLabels??[])].filter(x=>x&&x.length<=80).join(' | ')||null;
  return {container:'table_cell',label,section,sectionRole,tableContext:t?.context??'unknown'};}
 const text=blockTexts[bi]??'';const lv=/^\s*([A-Za-z][^:\n]{1,48}):\s*/.exec(text);
 if(lv&&valueStart>=lv[0].length-1&&valueStart<=lv[0].length+40)return {container:'label_value',label:lv[1].trim(),section,sectionRole,tableContext:null};
 return {container:'prose',label:null,section,sectionRole,tableContext:null};
}
/** S91: the documentary context of a value — structural label, container, section and its role, table context, methodology
 * section, page type — one object carried to the definitions (owner review of S90). */
export function documentContextOf(defs:PropertyDefinitions,sem:DocumentSemantics1D2,blockTexts:readonly string[],bi:number,valueStart:number):StructuralContext{
 const base=structuralContextOf(defs,sem,blockTexts,bi,valueStart);const b=sem.blocks[bi];
 return {...base,methodSection:b?.sectionRole==='methodology'||(b?.sectionRole==='test_results'&&base.sectionRole===null)?true:false,pageType:sem.pageType?.kind??null,
  documentTests:blockTexts.some(t=>TEST_CONTEXT272.test(t))};
}
/** S91: who states a value, from cues in its own clause: the manufacturer (declared), the publisher's own testing (first-person
 * test context or a measuring verb), or nobody identifiable. Positive evidence only; no default. */
export interface RoleEvidence {measured:string[];declared:string[];quoted:boolean;condition:boolean}
export function roleEvidence(structure:StructuralContext|null|undefined,sentence:{role:ObservationRole86c;reason:string}|null,clause:string,sentenceText:string,declarationCues:readonly string[],k:{measurementCues?:readonly string[];instrument?:ConditionDimension|null;setting?:ConditionDimension|null;procedure?:readonly ConditionDimension[]}={}):RoleEvidence{
 const ev:RoleEvidence={measured:[],declared:[],quoted:sentence?.role==='certified_or_quoted',condition:sentence?.role==='test_condition'||sentence?.role==='programme_preset'};
 const firstPerson=/\b(?:i|we|my|our|us)\b/i;
 if(sentence?.role==='measured_result'&&sentence.reason==='measuring_verb')ev.measured.push('measuring_verb');
 if(TEST_CONTEXT272.test(clause))ev.measured.push('test_context_in_clause');else if(TEST_CONTEXT272.test(sentenceText))ev.measured.push('test_context_in_sentence');
 if(structure?.tableContext==='test')ev.measured.push('test_table');
 if((structure?.sectionRole==='test'||structure?.methodSection)&&firstPerson.test(sentenceText))ev.measured.push('test_section_first_person');
 const st=norm(sentenceText),cl=norm(clause);
 // an instrument of the definitions' instrument dimension named in the value's sentence
 if(k.instrument&&(Object.values(k.instrument.values).flat().some(v=>has(st,v))||k.instrument.cues.some(c=>has(st,c))))ev.measured.push('instrument_in_sentence');
 // a verb reporting what the product did in use, in the value's clause
 const ov=(k.measurementCues??[]).find(c=>has(cl,c));if(ov)ev.measured.push('observation_verb:'+ov);
 // a document that reports its own testing, and a value stated under a specific operating setting
 if(structure?.documentTests&&k.setting&&Object.values(k.setting.values).flat().some(v=>has(cl,v)))ev.measured.push('tested_document_setting');
 // in a test section, a condition of a measurement procedure (tolerance, distance) stated in the clause
 if((structure?.sectionRole==='test'||structure?.methodSection)&&(k.procedure??[]).some(dm=>Object.values(dm.values).flat().some(v=>has(cl,v))))ev.measured.push('test_section_procedure_condition');
 if(sentence?.role==='declared_spec')ev.declared.push('declaration_cue:'+sentence.reason);
 if(structure&&structure.container!=='prose'&&(structure.tableContext==='specification'||structure.sectionRole==='specification'))ev.declared.push('specification_'+structure.container);
 if(structure?.container==='label_value'&&structure.sectionRole!=='test'&&!structure.methodSection)ev.declared.push('label_value_outside_tests');
 const decl=declarationCues.find(c=>has(norm(clause),c));if(decl&&!ev.measured.includes('measuring_verb'))ev.declared.push('clause:'+decl);
 return ev;
}
/** S91: the role from positive evidence. Quoted and test conditions keep the sentence's reading; otherwise the class with
 * evidence wins, a measuring verb or first-person test context outweighing a generic capability cue; without evidence the
 * role stays unresolved (an abstention, never "measured by default"). */
/** Locality of each kind of evidence: the clause (3) outranks the sentence or the structure around the value (2), which
 * outranks the section or the document (1). */
const LOCALITY:Record<string,number>={measuring_verb:3,observation_verb:3,test_context_in_clause:3,instrument_in_sentence:2,test_context_in_sentence:2,test_table:2,
 test_section_first_person:1,tested_document_setting:1,test_section_procedure_condition:1,declaration_cue:3,clause:3,specification_table_cell:2,specification_label_value:2,label_value_outside_tests:1};
const locality=(e:string)=>LOCALITY[e.split(':')[0]]??1;
export function roleFromEvidence(ev:RoleEvidence):{value:ObservationRole86c|null;reason:string|null}{
 if(ev.quoted)return {value:'certified_or_quoted',reason:'quoted'};
 if(ev.condition)return {value:'test_condition',reason:'condition'};
 const m=Math.max(0,...ev.measured.map(locality)),d=Math.max(0,...ev.declared.map(locality));
 if(m>d)return {value:'measured_result',reason:'evidence:'+ev.measured.join('+')+(d?' over '+ev.declared.join('+'):'')};
 if(d>m)return {value:'declared_spec',reason:'evidence:'+ev.declared.join('+')+(m?' over '+ev.measured.join('+'):'')};
 return {value:'unresolved',reason:m?'conflicting_evidence_same_locality':'no_positive_evidence'};
}
/** S90: the evidence role inherited from structure first, then the sentence (S86c). Kept for reproduction of S90 runs. */
export function roleFrom(structure:StructuralContext|null|undefined,sentence:{role:ObservationRole86c;reason:string}|null,clause?:{text:string;declarationCues:readonly string[]}):{value:ObservationRole86c|null;reason:string|null}{
 const st=structure;const sr=sentence;
 // a clause that attributes a capability to the product without a measuring verb declares it
 const declClause=!!clause&&sr?.role==='measured_result'&&sr.reason==='no_other_role'&&clause.declarationCues.some(c=>has(norm(clause.text),c));
 if(st){
  const declared=st.tableContext==='specification'||st.sectionRole==='specification';
  const tested=st.tableContext==='test'||st.sectionRole==='test';
  if(st.container!=='prose'){
   if(sr&&(sr.role==='certified_or_quoted'||sr.role==='test_condition'))return {value:sr.role,reason:'sentence:'+sr.reason};
   if(declared&&!tested)return {value:'declared_spec',reason:'structure:specification_'+st.container};
   if(tested)return {value:'measured_result',reason:'structure:test_'+st.container};
   if(st.container==='label_value')return {value:'declared_spec',reason:'structure:label_value_outside_tests'};}
  if(sr&&sr.role==='measured_result'&&sr.reason==='no_other_role'&&declared)return {value:'declared_spec',reason:'structure:specification_section'};
  if(sr&&sr.role==='unresolved'&&sr.reason==='approximate_value'&&tested)return {value:'measured_result',reason:'structure:approximate_in_test_section'};}
 if(declClause&&st?.sectionRole!=='test')return {value:'declared_spec',reason:'clause:declaration_cue'};
 if(declClause&&!st)return {value:'declared_spec',reason:'clause:declaration_cue'};
 return sr?{value:sr.role,reason:sr.reason}:{value:null,reason:null};
}

const norm=(s:string|null|undefined)=>normText(String(s??'').replace(/_/g,' '));
const has=(text:string,phrase:string)=>!!text&&hasPhrase(text,phrase);
const PERIOD_RE=/^(.+?)\s*(?:\/|\bper\b|\ba\b)\s*(?:yr|year|annum|month|mo|week|wk|day)$/;
const unitClass=(defs:PropertyDefinitions,unit:string):'currency'|'currency_per_energy'|null=>{const u=norm(unit);if(!u)return null;
 if(defs.pack.nonQkUnitForms.currency_per_energy.some(f=>u===f||u.endsWith(f)))return 'currency_per_energy';
 const head=PERIOD_RE.exec(u)?.[1]??u;
 if(defs.pack.nonQkUnitForms.currency.some(f=>head===f))return 'currency';return null;};
/** A currency unit carrying a period ("GBP/yr") states a per_period basis. */
const unitPeriod=(unit:string)=>PERIOD_RE.test(norm(unit));

/** Quantity kinds the value's unit admits, narrowed by the pack's own typing of its labels (reuse of quantity knowledge). */
export function kindsOf(qk:QuantityKnowledge,o:{value:number|null;unit:string;label?:string|null;context?:string|null}):{kind:string|null;candidates:string[]}{
 const p=parseUnit(qk,String(o.unit??'').trim());if(!p)return {kind:null,candidates:[]};
 const tq=typeQuantity(qk,{surface:`${o.value??''} ${o.unit}`.trim(),value:o.value,unit:p},{labels:o.label?[o.label]:[],context:o.context?[o.context]:[]});
 return {kind:tq.kind.id,candidates:tq.kind.id?[tq.kind.id]:[...tq.kind.candidates]};
}

/** S89: the label as the value's own words: when the value's offset is known, keep only the span between the numbers that
 * neighbour it (a term attaches to the nearest number, DocRED/SciREX-style local association). */
export function ownWords(label:string,valueAt:number|null|undefined,qk?:QuantityKnowledge):string{
 if(valueAt==null||valueAt<0||valueAt>label.length)return label;
 // neighbours are other QUANTITIES (a number with a unit the pack knows), not any digit ("4K" is a word)
 const nums=qk?findQuantities(qk,label).map(q=>[q.start,q.end] as const):[...label.matchAll(/\d+(?:[.,]\d+)?/g)].map(m=>[m.index!,m.index!+m[0].length] as const);
 const self=nums.find(([a,b])=>a<=valueAt&&valueAt<b)??nums.find(([a])=>a>=valueAt);
 if(!self)return label;
 const before=nums.filter(([,b])=>b<=self[0]).at(-1),after=nums.find(([a])=>a>=self[1]);
 // words between two quantities: a value owns the words after it up to the first clause break, and the words before it back
 // to the last clause break; without a break the gap is split at its midpoint
 const BREAK=/[,;:()\[\]–—]|\b(?:and|but|while|whereas|with|than|versus|vs|had|has|was|were|is|are|which|compared)\b/gi;
 const cutIn=(a:number,b:number,last:boolean)=>{const seg=label.slice(a,b);const ms=[...seg.matchAll(BREAK)];if(!ms.length)return Math.round((a+b)/2);
  const m=last?ms.at(-1)!:ms[0]!;return a+m.index!+(last?m[0].length:0);};
 const from=before?cutIn(before[1],self[0],true):0,to=after?cutIn(self[1],after[0],false):label.length;
 return label.slice(from,to);
}
function termScore(d:PropertyDefinition,qk:QuantityKnowledge,label:string,context:string,inProfile=false):{score:number;evidence:string[]}{
 const terms:[string,number][]=d.surface.map(([t,s])=>[t,s==='candidate'?0.5:1]);
 if(d.quantity?.metric)for(const t of qk.metrics.get(d.quantity.metric)?.terms??[])terms.push([t,1]);
 for(const n of d.quantity?.countNouns??[])terms.push([n,1]);
 let score=0;const ev:string[]=[];
 // fix1: a candidate (generic) term supports the property only together with a noun naming its object of interest
 const objectNamed=!d.objectNouns?.length||d.objectNouns.some(n=>has(label,n)||has(context,n));
 // outside a profile that lists the property, the object must be named for any term (the category does not supply it)
 if(!objectNamed&&!inProfile)return {score:0,evidence:[]};
 const ownObject=!!d.objectNouns?.length&&d.objectNouns.some(n=>has(label,n));
 // S89: support from the wider context alone needs the property's object in the value's own words
 for(const [t,w] of terms){if(w<1&&!objectNamed)continue;if(has(label,t)){score+=2*w;ev.push('label:'+t);}else if(has(context,t)&&(ownObject||!d.objectNouns?.length&&!inProfile)){score+=w;ev.push('context:'+t);}}
 return {score,evidence:ev};
}

/** Attribution: the defined property a value reports. A unit kind alone only nominates candidates; a surface term of the
 * definition in the value's own label or context must support the choice. Equal support for two properties chooses neither. */
/** opts.profileLicense (S89: default false; true only reproduces the refuted S88 dev rule): a profile listing one property for the unit kind attributes
 * without a term. E4 showed it is valid only for values already known to be results (it attributed every length on a robot page). */
export function attributeProperty(defs:PropertyDefinitions,qk:QuantityKnowledge,o:ObservationInput,opts:{profileLicense?:boolean}={}):PropertySlot{
 const sl=o.structure?.label?norm(o.structure.label)+' | ':'';const fullLabel=sl+norm(o.label);const label=sl+norm(ownWords(String(o.label??''),o.valueAt,qk)),context=norm(o.context);const cls=unitClass(defs,o.unit);const kk=cls?{kind:null,candidates:[]}:kindsOf(qk,o);
 const pool=applicableProperties(defs,o.category);
 const unitNoun=norm(o.unit);
 const byUnit=pool.filter(d=>d.form==='quantity'&&(cls?d.quantity!.nonQkUnits?.includes(cls):(kk.candidates.some(k=>d.quantity!.kinds.includes(k))||(d.quantity!.countNouns??[]).some(n=>unitNoun===n))));
 const kind=kk.kind??(kk.candidates.length===1?kk.candidates[0]:null);
 if(!byUnit.length)return {value:null,state:'unknown',evidence:[],rule:kk.candidates.length||cls?'no_definition_admits_unit_kind':'unit_not_typed',alternatives:[],kind};
 const prof=o.category?defs.profiles.get(o.category):undefined;
 // S89: the value's own words name an object of another concept (and none of this property's object nouns): not this property
 // the value's own sentence (not the whole window) decides whether it names another concept's object
 const raw=String(o.label??'');const at=o.valueAt??-1;
 const sentence=at>=0?norm(raw.slice(Math.max(0,raw.slice(0,at).search(/[^.!?]*$/)),at+(raw.slice(at).search(/[.!?](\s|$)/)+1||raw.length-at))):fullLabel;
 const otherObjects=(defs.pack.knownObjects?.objects??[]).filter(k=>k.nouns.some(n=>has(sentence,n))).map(k=>k.id);
 const qkCompetitors=[...qk.metrics.values()].filter(m=>kk.candidates.includes(m.kind)&&m.terms.some(t=>has(label,t)));
 const subsumes=(d:PropertyDefinition,m:string)=>d.quantity?.metric===m||(d.quantity?.relatedMetrics??[]).includes(m);
 const si=(()=>{const p=parseUnit(qk,String(o.unit??'').trim());return p&&o.value!==null?o.value*p.factor+(p.offset??0):null;})();
 const admissible=(d:PropertyDefinition)=>{
  if(d.plausibleSi&&si!==null&&(si<d.plausibleSi[0]||si>d.plausibleSi[1]))return false;
  const ownObject=(d.objectNouns??[]).some(n=>has(label,n));
  if(otherObjects.length&&!ownObject)return false;
  if(qkCompetitors.some(m=>!subsumes(d,m.id))&&!qkCompetitors.some(m=>subsumes(d,m.id))&&!ownObject)return false;
  return true;};
 // S90: a value that bounds the range of a DIFFERENT quantity just before it ("+8 dB from 200 Hz to 10 kHz") is that
 // quantity's band (its condition), not a result of its own
 if(at>0){const before=raw.slice(Math.max(0,at-60),at);const m=/(?:from|between|over)\s+(?:[\d.,]+\s*[^\s\d]+\s+(?:to|and|–|-)\s+)?$/i.exec(before);
  if(m){const prev=findQuantities(qk,before.slice(0,m.index)).at(-1);if(prev&&!prev.unit.kinds.some(k=>kk.candidates.includes(k)))
   return {value:null,state:'unknown',evidence:[],rule:'band_of_another_measurement',alternatives:byUnit.map(d=>d.id),kind};}}
 const rejected=byUnit.filter(d=>!admissible(d)).map(d=>d.id);
 const scored=byUnit.filter(admissible).map(d=>({d,...termScore(d,qk,label,context,!!prof?.properties.includes(d.id))})).sort((a,b)=>b.score-a.score||a.d.id.localeCompare(b.d.id));
 if(!scored.length)return {value:null,state:'unknown',evidence:[],rule:'value_names_another_concept_or_outside_plausible_range',alternatives:rejected,kind};
 const top=scored[0];
 if(top.score<=0){
  // the category profile licenses a unit-kind attribution when it lists exactly one property admitting the unit
  if(opts.profileLicense===true&&byUnit.length===1&&o.category&&defs.profiles.get(o.category)?.properties.includes(byUnit[0].id))
   return {value:byUnit[0].id,state:'inferred',evidence:['profile:'+o.category],rule:'profile_single_property_for_unit_kind',alternatives:[],kind};
  return {value:null,state:'unknown',evidence:[],rule:'unit_kind_without_supporting_term',alternatives:byUnit.map(d=>d.id),kind};}
 const tied=scored.filter(s=>s.score===top.score);
 if(tied.length>1)return {value:null,state:'ambiguous',evidence:tied.flatMap(t=>t.evidence),rule:'equal_support',alternatives:tied.map(t=>t.d.id),kind};
 return {value:top.d.id,state:top.evidence.some(e=>e.startsWith('label:'))?'stated':'inferred',evidence:top.evidence,rule:top.evidence.some(e=>e.startsWith('label:'))?null:'term_in_context_only',alternatives:scored.slice(1).filter(s=>s.score>0).map(s=>s.d.id),kind};
}

/** Type one condition text to a dimension: a value phrase first, then a dimension cue, then a quantity of the dimension's kind.
 * Dimensions relevant to the property are tried first; any shared dimension may type it. */
export function typeCondition(defs:PropertyDefinitions,qk:QuantityKnowledge,text:string,property?:string|null,category?:string|null):{dimension:ConditionDimension;value:string|null;via:'value'|'cue'|'quantity'}|null{
 const t=norm(text);if(!t)return null;
 const dims=[...defs.dimensions.values()];
 // fix1: the head noun decides the dimension ("standard test load" is a load, whatever value word precedes it)
 const head=t.replace(/[^a-z ]/g,' ').trim().split(/\s+/).at(-1)??'';
 const headDim=head.length>2?dims.find(d=>d.cues.some(c=>c===head||c.split(' ').at(-1)===head)):undefined;
 if(headDim){const v=Object.entries(headDim.values).find(([,ph])=>ph.some(p=>has(t,p)));return {dimension:headDim,value:v?.[0]??null,via:v?'value':'cue'};}
 const rel=(d:ConditionDimension)=>property?relevanceOf(defs,property,d.id,category):'irrelevant';
 const order=(d:ConditionDimension)=>({defining:0,influencing:1,irrelevant:2}[rel(d)]);
 const ranked=[...dims].sort((a,b)=>order(a)-order(b));
 for(const d of ranked)for(const [v,ph] of Object.entries(d.values))if(ph.some(p=>has(t,p)))return {dimension:d,value:v,via:'value'};
 const qs=findQuantities(qk,t);
 for(const d of ranked){const kinds=d.valueKinds??(d.qkAxis?[qk.axes.get(d.qkAxis)?.valueKind].filter((x):x is string=>!!x):[]);
  if(kinds.length&&qs.some(q=>q.unit.kinds.some(k=>kinds.includes(k)))&&(d.cues.some(c=>has(t,c))||qs.length===1&&t.replace(/[\d.,\s]+/g,'').length<=12))return {dimension:d,value:qs[0].surface,via:'quantity'};}
 for(const d of ranked)if(d.cues.some(c=>has(t,c)))return {dimension:d,value:null,via:'cue'};
 return null;
}

const RELATIONAL=new Set(['comparison_or_basis','procedure_state','identity']);
/** S88 it1: layered condition typing. Structure comes from the category-free S87b principles (relation before object: a
 * comparison, a procedure state or an identity statement is a relation, whatever setting it mentions); the dimension, its
 * value and relevance come from the definitions. Either layer may type a condition the other cannot. */
export function classifyConditionWithDefinitions(defs:PropertyDefinitions,qk:QuantityKnowledge,text:string,measuredKind:string|null,property?:string|null,category?:string|null):
 {structure:string|null;dimension:ConditionDimension|null;value:string|null;relational:boolean;via:string|null;kind?:string|null}{
 const s=classifyCondition87(qk,String(text).replace(/_/g,' '),measuredKind);const d=typeCondition(defs,qk,text,property,category);
 const cls=s.class==='unclassified'?null:s.class;
 if(cls&&RELATIONAL.has(cls))return {structure:cls,dimension:d?.dimension??null,value:d?.via==='value'?d.value:null,relational:true,via:'structure'};
 if(cls)return {structure:cls==='quantity'?'quantity':cls,dimension:d?.dimension??null,value:d?.value??null,relational:false,via:d?'both':'structure',kind:s.kind};
 return {structure:d?.dimension.structure??null,dimension:d?.dimension??null,value:d?.value??null,relational:false,via:d?'definitions':null};
}

/** The basis slot: stated by words or by the unit's kind; otherwise the definition's default as an inferred slot, only when a
 * run, programme or task is named; otherwise unknown. Intensive properties (no basis in the definition) have none. */
export function basisOf(defs:PropertyDefinitions,d:PropertyDefinition|null,kind:string|null,label:string,context:string,namedRun:boolean):BasisSlot{
 const c=defs.pack.basisCues;const text=label+' | '+context;
 for(const b of ['per_run','per_period','per_hour','per_unit'] as const){const w=c[b].find(x=>has(text,x));if(w)return {value:b,state:'stated',evidence:w,rule:null};}
 // 'per' + up to two words + a run noun ("per completed task") states the run as the basis
 const perRun=new RegExp('\\bper (?:\\w+ ){0,2}(?:'+c.runNamed.map(w=>w.replace(/[^a-z ]/g,'')).join('|')+')s?\\b').exec(text);
 if(perRun)return {value:'per_run',state:'stated',evidence:perRun[0],rule:null};
 if(kind==='energy_per_event'||kind==='volume_per_event')return {value:'per_run',state:'stated',evidence:'unit:'+kind,rule:null};
 if(kind?.startsWith('periodic_'))return {value:'per_period',state:'stated',evidence:'unit:'+kind,rule:null};
 if(!d)return {value:null,state:'unknown',evidence:null,rule:null};
 if(!d.basis)return {value:'none',state:'inferred',evidence:null,rule:'definition_is_intensive'};
 if(d.basis.default==='per_run'&&(namedRun||d.basis.when==='always'))return {value:'per_run',state:'inferred',evidence:null,rule:d.basis.rule};
 return {value:null,state:'unknown',evidence:null,rule:'basis_not_stated_and_no_run_named'};
}

/** Interpret one observation with the definitions: attribution, conditions with relevance, missing defining dimensions, basis. */
export function interpretWithDefinitions(defs:PropertyDefinitions,qk:QuantityKnowledge,o:ObservationInput,opts:{profileLicense?:boolean;roleModel?:'s90'|'evidence'}={}):DefinitionInterpretation{
 const category=o.category??null;const label=norm(o.label),context=norm(o.context);
 const property=attributeProperty(defs,qk,o,opts);const d=property.value?defs.properties.get(property.value)!:null;
 const readings:DimensionReading[]=[];const untyped:string[]=[];
 for(const c of o.conditions??[]){const r=classifyConditionWithDefinitions(defs,qk,c,property.kind,d?.id,category);
  if(!r.structure){untyped.push(norm(c));continue;}
  readings.push({dimension:r.dimension?.id??null,structure:r.structure,value:r.value,state:'stated',relevance:d&&r.dimension&&!r.relational?relevanceOf(defs,d.id,r.dimension.id,category):null,evidence:norm(c),from:'condition',relational:r.relational});}
 // dimensions of the property stated in the value's own label or context (value phrases only: a cue alone states no value)
 if(d)for(const [dimId] of d.conditions){if(readings.some(r=>r.dimension===dimId))continue;const dim=defs.dimensions.get(dimId)!;
  for(const [src,text] of [['label',label],['context',context]] as const){const hit=Object.entries(dim.values).find(([,ph])=>ph.some(p=>has(text,p)));
   if(hit){readings.push({dimension:dimId,structure:dim.structure,value:hit[0],state:'stated',relevance:relevanceOf(defs,d.id,dimId,category),evidence:hit[1].find(p=>has(text,p))!,from:src});break;}}}
 const runWords=defs.pack.basisCues.runNamed;
 const namedRun=readings.some(r=>!!r.dimension&&['programme','soil_or_task','load','end_point'].includes(r.dimension)&&r.value!==null)||runWords.some(w=>has(label,w)||has(context,w))||(o.conditions??[]).some(c=>runWords.some(w=>has(norm(c),w)));
 const basis0=basisOf(defs,d,property.kind,label,context,namedRun);
 const basis:BasisSlot=basis0.state!=='stated'&&unitPeriod(o.unit)?{value:'per_period',state:'stated',evidence:'unit:'+o.unit,rule:null}:basis0;
 if(d)for(const r of readings)if(r.dimension&&!r.relational)r.relevance=relevanceOf(defs,d.id,r.dimension,category,basis.value);
 const missingDefining=d?d.conditions.map(([x])=>x).filter(x=>relevanceOf(defs,d.id,x,category,basis.value)==='defining'&&!readings.some(r=>r.dimension===x&&r.value!==null&&!r.relational)):[];
 let role:{value:ObservationRole86c|null;reason:string|null}={value:null,reason:null};let subject:'page_product'|'other_product'|'unresolved'='unresolved';
 if(o.valueAt!=null&&o.label){const end=o.valueAt+String(o.surface??o.value??'').length;const r=observationRole86c(o.label,o.valueAt,end,property.kind??'');const head=o.label.slice(0,o.valueAt).split(/[.!?;]\s/).at(-1)??'';
  if(opts.roleModel==='s90')role=roleFrom(o.structure,r,{text:head,declarationCues:defs.pack.evidenceCues?.declaration??[]});
  else{const tail=o.label.slice(end).split(/[.!?;]\s/)[0]??'';const clauseHead=head.split(/[,;()–—]|\b(?:but|while|whereas|than)\b/i).at(-1)??head;
   const clause=clauseHead+o.label.slice(o.valueAt,end)+(tail.split(/[,;()–—]|\b(?:but|while|whereas|than)\b/i)[0]??'');
   role=roleFromEvidence(roleEvidence(o.structure,r,clause,head+o.label.slice(o.valueAt,end)+tail,defs.pack.evidenceCues?.declaration??[],
    {measurementCues:defs.pack.evidenceCues?.measurement??[],instrument:defs.dimensions.get('instrument')??null,setting:defs.dimensions.get('operating_setting')??null,
     procedure:['response_tolerance','measurement_distance','acoustic_quantity'].map(x=>defs.dimensions.get(x)).filter((x):x is ConditionDimension=>!!x)}));}
  subject=otherProductInClause86c(o.label,o.valueAt,end,o.pageSubject??null)?'other_product':o.pageSubject?'page_product':'unresolved';}
 return {version:DEFINITION_INTERPRETER_VERSION,definitions:defs.identity,category,property,conditions:readings,missingDefining,untyped,basis,role,subject,
  object:d?{value:d.object,state:'inferred',rule:'definition_object_of_interest'}:{value:null,state:'unknown',rule:null}};
}

export type Q1Verdict='comparable'|'comparable_within_source'|'conditions_unestablished'|'not_comparable'|'different_property'|'undetermined';
/** Q1 (protocol comparability) of two interpreted observations, from the dimensions the definition says DEFINE the
 * measurand. A differing influencing dimension is a caveat, never a refusal. Values of one source under one protocol
 * compare within that source even when it leaves defining conditions unstated. */
export function compareByDefinition(defs:PropertyDefinitions,a:DefinitionInterpretation,b:DefinitionInterpretation,opts:{sameSourceProtocol?:boolean}={}):{verdict:Q1Verdict;reasons:string[];caveats:string[]}{
 if(!a.property.value||!b.property.value)return {verdict:'undetermined',reasons:['property_not_attributed'],caveats:[]};
 if(a.property.value!==b.property.value)return {verdict:'different_property',reasons:[a.property.value+'≠'+b.property.value],caveats:[]};
 const p=a.property.value;const cat=a.category??b.category;const basis=a.basis.value??b.basis.value;const reasons:string[]=[];const caveats:string[]=[];let unknown=false;
 if(a.basis.value&&b.basis.value&&a.basis.value!==b.basis.value)return {verdict:'not_comparable',reasons:['basis '+a.basis.value+'≠'+b.basis.value],caveats};
 for(const [dim] of defs.properties.get(p)!.conditions){const r=relevanceOf(defs,p,dim,cat,basis);if(r==='irrelevant')continue;
  const val=(x:DefinitionInterpretation)=>x.conditions.find(c=>c.dimension===dim&&!c.relational)?.value??null;const va=val(a),vb=val(b);
  if(va!==null&&vb!==null&&normText(va)!==normText(vb)){if(r==='defining')return {verdict:'not_comparable',reasons:[`${dim}: ${va}≠${vb}`],caveats};caveats.push(`${dim} differs (influencing)`);continue;}
  if(r==='defining'&&(va===null||vb===null)){unknown=true;reasons.push(dim+' not stated');}}
 if(!unknown)return {verdict:'comparable',reasons:[],caveats};
 return opts.sameSourceProtocol?{verdict:'comparable_within_source',reasons,caveats}:{verdict:'conditions_unestablished',reasons,caveats};
}

/** Reading: plan measurements compiled from the definitions (terms from surfaces, units from the pack's kinds, conditions from
 * relevant dimensions). Outcomes come from the definition or are inherited from the taught measurements it decomposes. */
export function definitionPlanMeasurements(defs:PropertyDefinitions,qk:QuantityKnowledge,category:string|null,taughtOutcomes:ReadonlyMap<string,readonly string[]>=new Map()):PlanMeasurement272[]{
 const out:PlanMeasurement272[]=[];
 for(const d of applicableProperties(defs,category)){if(d.form!=='quantity')continue;
  const units=UNIT_LEXICON272.filter(u=>{const p=parseUnit(qk,u.unit==='°c'?'°C':u.unit);return !!p&&p.kinds.some(k=>d.quantity!.kinds.includes(k));});
  const conds=d.conditions.filter(([x])=>relevanceOf(defs,d.id,x,category)!=='irrelevant').map(([x])=>{const dim=defs.dimensions.get(x)!;
   return {id:x,terms:[...new Set([...dim.cues,...Object.values(dim.values).flat()].map(w=>normText(w)))].slice(0,16)};});
  out.push({id:d.id,outcomes:[...new Set([...(d.outcomes??[]),...(taughtOutcomes.get(d.id)??[])])].sort(),proxyFor:[],dimensions:[...new Set(units.map(u=>u.dimension))],
   units:units.map(u=>u.unit),terms:[...new Set(d.surface.map(([t])=>normText(t)))],conditions:conds});}
 return out.sort((a,b)=>a.id.localeCompare(b.id));
}
