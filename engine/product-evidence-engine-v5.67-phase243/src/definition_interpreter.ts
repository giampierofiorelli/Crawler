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
import {UNIT_LEXICON272,type PlanMeasurement272} from './phase272_extraction_plan.js';
import {classifyCondition87} from './observation_model.js';

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
 untyped:string[];basis:BasisSlot;object:{value:string|null;state:SlotState;rule:string|null}}
export interface ObservationInput {value:number|null;unit:string;label?:string|null;context?:string|null;conditions?:readonly string[];category?:string|null}

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

function termScore(d:PropertyDefinition,qk:QuantityKnowledge,label:string,context:string):{score:number;evidence:string[]}{
 const terms:[string,number][]=d.surface.map(([t,s])=>[t,s==='candidate'?0.5:1]);
 if(d.quantity?.metric)for(const t of qk.metrics.get(d.quantity.metric)?.terms??[])terms.push([t,1]);
 for(const n of d.quantity?.countNouns??[])terms.push([n,1]);
 let score=0;const ev:string[]=[];
 // fix1: a candidate (generic) term supports the property only together with a noun naming its object of interest
 const objectNamed=!d.objectNouns?.length||d.objectNouns.some(n=>has(label,n)||has(context,n));
 for(const [t,w] of terms){if(w<1&&!objectNamed)continue;if(has(label,t)){score+=2*w;ev.push('label:'+t);}else if(has(context,t)){score+=w;ev.push('context:'+t);}}
 return {score,evidence:ev};
}

/** Attribution: the defined property a value reports. A unit kind alone only nominates candidates; a surface term of the
 * definition in the value's own label or context must support the choice. Equal support for two properties chooses neither. */
export function attributeProperty(defs:PropertyDefinitions,qk:QuantityKnowledge,o:ObservationInput):PropertySlot{
 const label=norm(o.label),context=norm(o.context);const cls=unitClass(defs,o.unit);const kk=cls?{kind:null,candidates:[]}:kindsOf(qk,o);
 const pool=applicableProperties(defs,o.category);
 const unitNoun=norm(o.unit);
 const byUnit=pool.filter(d=>d.form==='quantity'&&(cls?d.quantity!.nonQkUnits?.includes(cls):(kk.candidates.some(k=>d.quantity!.kinds.includes(k))||(d.quantity!.countNouns??[]).some(n=>unitNoun===n))));
 const kind=kk.kind??(kk.candidates.length===1?kk.candidates[0]:null);
 if(!byUnit.length)return {value:null,state:'unknown',evidence:[],rule:kk.candidates.length||cls?'no_definition_admits_unit_kind':'unit_not_typed',alternatives:[],kind};
 const scored=byUnit.map(d=>({d,...termScore(d,qk,label,context)})).sort((a,b)=>b.score-a.score||a.d.id.localeCompare(b.d.id));
 const top=scored[0];
 if(top.score<=0){
  // the category profile licenses a unit-kind attribution when it lists exactly one property admitting the unit
  if(byUnit.length===1&&o.category&&defs.profiles.get(o.category)?.properties.includes(byUnit[0].id))
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
export function interpretWithDefinitions(defs:PropertyDefinitions,qk:QuantityKnowledge,o:ObservationInput):DefinitionInterpretation{
 const category=o.category??null;const label=norm(o.label),context=norm(o.context);
 const property=attributeProperty(defs,qk,o);const d=property.value?defs.properties.get(property.value)!:null;
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
 return {version:DEFINITION_INTERPRETER_VERSION,definitions:defs.identity,category,property,conditions:readings,missingDefining,untyped,basis,
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
