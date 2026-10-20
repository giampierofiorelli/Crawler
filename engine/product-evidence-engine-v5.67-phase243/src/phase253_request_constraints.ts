/**
 * Phase253 — explicit requirements stated in an ordinary-English request ("at least 5 litres", "no wider than 40 cm",
 * "under £120", "battery life of at least 30 hours", "fits inside a space 57.5 cm wide").
 *
 * Reuses the Phase245 unit vocabulary (canonicalUnit245, parseNumber245) and the Phase125 budget reading. Each
 * constraint records the quantity and unit, the bound, the property it refers to, what it describes (the product or the
 * space available for it), the verbatim span and its offsets, and a status:
 *  - stated_in_request: the bound and the property are explicit and nothing negates them;
 *  - candidate: anything less clear (no bound, negation, an unclear property). It must be confirmed or asked about.
 * A quantity that describes something other than the product ("a 2 kg chicken", "for 4 people") is not a constraint.
 * A desired limit is never a measurement or a declaration. Power is compared as declared: the request does not say
 * whether rated input or output power is meant, so a power constraint carries that caution.
 */
import {canonicalUnit245,parseNumber245} from './phase245_value_normalizer.js';
import {composeQuestion125} from './phase125_compositional_dialogue_frame.js';
import type {Constraint253} from './phase253_advice_contract.js';
import {loadQuantityKnowledge,findQuantities,quantityBound,type QuantityKnowledge} from './quantity_knowledge.js';
import {readFileSync} from 'node:fs';
import {compileRuleSet,evaluate,decide,type RuleSet,type CompiledProgram} from './knowledge_rules.js';
// GK: the quantity knowledge says what the printed unit expresses; loaded once (the committed, validated pack).
let QK253:QuantityKnowledge|null=null;const qk253=()=>QK253??=loadQuantityKnowledge();
/** S102 (owner review of S100): the bound of a stated requirement and conflicts between stated requirements are decided by
 * the shared decision policy (knowledge_rules decide; resources/request-semantics/request-semantics.v1.json). The program
 * concludes requirement states only, never product facts. */
export const REQUEST_SEMANTICS_FILE='request-semantics.v1.json';
let RQ:{program:CompiledProgram;version:string}|null=null;
export function requestSemanticsRules():{program:CompiledProgram;version:string}{
 if(RQ)return RQ;const raw=JSON.parse(readFileSync(new URL('../../resources/request-semantics/'+REQUEST_SEMANTICS_FILE,import.meta.url),'utf8')) as RuleSet;
 const program=compileRuleSet(raw).get('request_requirements');if(!program)throw Error('request_requirements: program missing');return RQ={program,version:raw.version};}

export interface RequestConstraint253 extends Constraint253 {
 bound:'min'|'max';property:'capacity'|'water_tank'|'width'|'height'|'depth'|'weight'|'power'|'battery_life'|'price';
 describes:'product'|'available_space';span:string;start:number;end:number;
 status:'stated_in_request'|'candidate';confidence:'clear'|'ambiguous';note:string|null}
export interface ConstraintExtraction253 {constraints:RequestConstraint253[];unmapped:{span:string;reason:string}[]}

const MIN_BEFORE=/(?:at least|minimum(?: of)?|min\.?|no less than|not less than|more than|over|above|bigger than|larger than|greater than|upwards of|longer than|at minimum)\s*$/;
// S86b (capability audit, shared gap): the bound may follow the property word ("45 cm wide or less", "30 hours long minimum")
const PROP_WORD=String.raw`(?:(?:wide|high|tall|deep|long|heavy|across)\s+)?`;
const MIN_AFTER=new RegExp(String.raw`^\s*${PROP_WORD}(?:\+|or (?:more|bigger|larger|longer|above|higher)|minimum|min\b|at least)`);
const MAX_BEFORE=/(?:at most|maximum(?: of)?|max\.?|no more than|not more than|less than|under|below|up to|no bigger than|no larger than|no wider than|no taller than|no higher than|no deeper than|no heavier than|smaller than|lighter than|narrower than|shorter than|within)\s*$/;
const MAX_AFTER=new RegExp(String.raw`^\s*${PROP_WORD}(?:or (?:less|smaller|narrower|lighter|shorter|under)|max\b|maximum|at most|or below)`);
const SPACE=/\b(?:space|opening|gap|cupboard|shelf|alcove|cabinet|recess|nook|fits?|fit in|fit into|fit inside|fit under)\b/;
const NEGATION=/\b(?:not|never|n't|no need|don't need|doesn't need|does not need|do not need|needn't)\b/;
const BOUND_NEGATIONS=/\b(?:no|not) (?:more|less|bigger|larger|wider|taller|higher|deeper|heavier)\b/g;
// S85 (intervention A): what a quantity IS (its unit and its kind) comes from the quantity knowledge only; this reader keeps
// what is specific to checking a request against retained declarations: the bound, the property, the available space and
// the criterion. The unit symbol it returns is the Phase245 declaration vocabulary the checks compare with.
const unitOf=(u:string):string|null=>{const x=u.toLowerCase().trim();
 if(/^quarts?$|^qt$/.test(x))return 'qt';if(/^ltrs?$|^lit(?:re|er)s?$/.test(x))return 'l';if(/^millilit/.test(x))return 'ml';if(/^centimet/.test(x))return 'cm';if(/^millimet/.test(x))return 'mm';
 if(/^kilos?$|^kilograms?$/.test(x))return 'kg';if(/^grams?$/.test(x))return 'g';if(/^ounces?$/.test(x))return 'oz';if(x==='feet')return 'ft';if(x==='"'||/^inch(?:es)?$/.test(x))return 'in';
 if(/^hours?$|^hrs?$/.test(x))return 'h';
 return canonicalUnit245(u);};
/** The quantity-knowledge kinds this reader can turn into a criterion (all others stay with the quantity requirements). */
const DIMENSION_OF_KIND253:Record<string,'volume'|'length'|'mass'|'power'|'duration'>={volume:'volume',length:'length',mass:'mass',power:'power',duration:'duration'};
const CRITERION:Record<string,string>={'capacity:min':'capacity_min','water_tank:min':'water_tank_capacity_min','width:max':'width_max','height:max':'height_max','depth:max':'depth_max','weight:max':'weight_max','power:min':'power_min','battery_life:min':'battery_life_min'};

export function extractConstraints253(text:string):ConstraintExtraction253{
 const lower=text.toLowerCase().replace(/[’‘]/g,"'");
 const constraints:RequestConstraint253[]=[];const unmapped:{span:string;reason:string}[]=[];
 for(const f of findQuantities(qk253(),text)){
  // one kind only: an ambiguous unit ("dB") or another kind (a rate "12 litres a day", a pressure) is not this reader's
  const dim=f.unit.kinds.length===1?DIMENSION_OF_KIND253[f.unit.kinds[0]]??null:null;if(!dim)continue;
  const unit=unitOf(f.unitSurface);
  // a unit the declarations are never stated in ("5 years") was never a constraint here; a bounded one stays visible as a
  // typed quantity requirement (applyQuantityRequirements253)
  if(!unit)continue;
  const m={index:f.start,0:text.slice(f.start,f.end)};
  const between=/\bbetween\s+$/i.test(lower.slice(Math.max(0,f.start-12),f.start));
  const lowNum=f.low!==undefined?String(f.low):null,mainNum=String(f.high??f.value);const plus=/^\s*\+/.test(text.slice(f.end));
  // Clause-local context: the words before the quantity back to the last sentence break, and a few words after.
  // A sentence break is punctuation followed by a space or the end, never a decimal point ("57.5").
  // S86b (capability audit, shared gap): the dot of "min.", "max." or "approx." is not a sentence break
  let clauseStart=0;for(const b of lower.slice(0,m.index).matchAll(/(?<!\b(?:min|max|approx|ca))[.;!?\n](?=\s|$)/g))clauseStart=b.index!+1;
  const before=lower.slice(Math.max(clauseStart,m.index-60),m.index);const after=lower.slice(m.index+m[0].length,m.index+m[0].length+40).split(/(?<!\b(?:min|max|approx|ca))[.;!?\n](?=\s|$)/)[0];
  const ctx=before+' '+after;
  // Negated comparatives first: "no bigger than" is a maximum, "no less than" a minimum.
  let bound:'min'|'max'|null=/(?:no|not) (?:less|fewer|smaller|lower|shorter) than\s*$/.test(before)?'min':/(?:no|not) (?:more|bigger|larger|wider|taller|higher|deeper|heavier|longer) than\s*$/.test(before)?'max'
   :MIN_BEFORE.test(before)||MIN_AFTER.test(after)||plus?'min':MAX_BEFORE.test(before)||MAX_AFTER.test(after)?'max':null;
  const range=lowNum!==null;
  // A range states a requirement only with "between" or a bound word; a bare "2000-2400W" may describe a label or
  // an owned product, so its inferred bound makes it a candidate to confirm, never a stated requirement.
  const inferredBound=range&&bound===null&&!between;
  const space=SPACE.test(before)||/^\s*(?:\S+\s+){0,2}(?:space|opening|gap|cupboard|shelf|alcove|cabinet|recess)\b/.test(after);
  // S102: the local reading and the shared (quantity-knowledge) reading of the bound are two claims of equal authority;
  // the space convention is context; a bare range presumes a bound. Disagreement leaves the requirement undecided.
  const shared=quantityBound(qk253(),text,f.start,f.end,f.unit.kinds).bound;
  const rangeDefault:'min'|'max'=dim==='volume'||dim==='power'||dim==='duration'?'min':'max';
  const facts:{reading:string[][];space:string[][];range_inferred:string[][]}={reading:[],space:[],range_inferred:[]};
  if(bound)facts.reading.push(['q',`local`,bound]);if(shared)facts.reading.push(['q','shared',shared]);
  if(space)facts.space.push(['q']);if(range&&!between)facts.range_inferred.push(['q',rangeDefault]);
  const dec=decide(evaluate(requestSemanticsRules().program,facts)).find(d=>d.field==='bound')??null;
  const boundConflict=!!dec?.conflict;
  const localBound=bound;
  bound=dec?.value as 'min'|'max'|null??(boundConflict?localBound??shared:null);
  // a range stated with "between" has the kind's bound; a bare range only a presumption (asked)
  if(range&&bound===null){bound=rangeDefault;}
  const inferredBound2=range&&!between&&!dec?.value&&!boundConflict;
  const negated=NEGATION.test(before.replace(BOUND_NEGATIONS,' '));
  let property:RequestConstraint253['property']|null=null;
  // Reality check 2026-10-16: a volume said of a water tank or reservoir is the tank's, not the product's capacity
  // ("a water tank of at least 1.5 litres"); read as product capacity it was checked against boiler capacities.
  if(dim==='volume')property=/\b(?:water tank|tank|reservoir)\b/.test(ctx)?'water_tank':'capacity';
  else if(dim==='length'){
   // The word right after the quantity names it ("57.5 cm wide and 36.5 cm high"); otherwise the clause around it.
   const pick=(x:string)=>/^\s*(?:\S+\s+)?(?:wide|width|across|broad|wider)\b/.test(x)?'width':/^\s*(?:\S+\s+)?(?:tall|high|height|taller|higher)\b/.test(x)?'height':/^\s*(?:\S+\s+)?(?:deep|depth|deeper)\b/.test(x)?'depth':null;
   property=pick(after)??(/\b(?:wide|wider|width|across|broad|narrower)\b/.test(before)?'width':/\b(?:tall|taller|high|higher|height|shorter)\b/.test(before)?'height':/\b(?:deep|deeper|depth)\b/.test(before)?'depth':null);}
  else if(dim==='mass')property=/\b(?:weigh|weighs|weight|heavy|heavier|light|lighter|lightweight)\b/.test(ctx)?'weight':null;
  else if(dim==='power')property=bound==='min'||/\b(?:power|powerful|watt|watts|wattage)\b/.test(ctx)?'power':null;
  else if(dim==='duration')property=/\b(?:battery|playback|play time|playtime|listening|charge|charges|lasts?)\b/.test(ctx)?'battery_life':null;
  const span0=text.slice(m.index,m.index+m[0].length).trim();const spanFrom=between?m.index-lower.slice(0,m.index).match(/between\s+$/)![0].length:m.index;
  // Include the bound cue in the span when it is directly before the quantity ("at least 5 litres").
  const cue=(before.match(new RegExp(`(?:${MIN_BEFORE.source.replace(/\\s\*\$$/,'')}|${MAX_BEFORE.source.replace(/\\s\*\$$/,'')})\\s*$`))?.[0]??'');
  const tail=after.match(MAX_AFTER)?.[0]??after.match(MIN_AFTER)?.[0]??'';
  const spanStart=spanFrom-cue.length;const span=text.slice(spanStart,m.index+m[0].length+tail.length).trim();
  if(!property){if(dim==='length'||dim==='power'||dim==='volume')unmapped.push({span:span0,reason:`unclear which property ${unit} refers to`});continue;}
  const value=parseNumber245(range?(bound==='max'?mainNum:lowNum!):mainNum);
  if(value===null)continue;
  const eff=bound??(property==='capacity'||property==='water_tank'?'min':null);
  const criterion=eff?CRITERION[`${property}:${eff}`]:undefined;
  if(!criterion){unmapped.push({span,reason:`no checkable criterion for a ${bound??'unbounded'} ${property}`});continue;}
  const clear=!!bound&&!negated&&!inferredBound2&&!boundConflict;
  constraints.push({criterion,value,unit,bound:eff!,property,describes:space?'available_space':'product',span,start:spanStart,end:spanStart+span.length,
   status:clear?'stated_in_request':'candidate',confidence:clear?'clear':'ambiguous',
   note:boundConflict?'the request\'s words read both as a minimum and as a maximum: please confirm which':property==='power'?'declared power may be rated input or output power; compared as each source declares it':space?'the product must fit inside the space you described; clearances are not added':null});
  if(range)unmapped.push({span,reason:`the ${criterion.endsWith('_min')?'upper':'lower'} limit of the range has no checkable criterion`});
 }
 // Budget: the Phase125 reading (anchored currency limits).
 const budget=composeQuestion125(text,[{id:'request',aliases:['request'],aspects:[],schemaReviewId:'phase253'}]).userBudget;
 if(budget?.max!=null){const amount=String(budget.max);const i=text.search(new RegExp(`(?:[£$€]\\s*${amount.replace('.','\\.')}|${amount.replace('.','\\.')}\\s*(?:gbp|usd|eur|pounds|dollars|euros))`,'i'));
  const cue=i>=0?(text.slice(Math.max(0,i-20),i).match(/(?:under|below|less than|up to|at most|no more than|max(?:imum)?|budget(?: of| is)?|around)\s*$/i)?.[0]??''):'';
  const span=i>=0?text.slice(i-cue.length,i+text.slice(i).search(/\d(?![\d.,])/)+1).trim():`${budget.currency} ${amount}`;
  constraints.push({criterion:'budget_max',value:budget.max,unit:budget.currency.toLowerCase(),bound:'max',property:'price',describes:'product',span,start:i,end:i+span.length,
   status:'stated_in_request',confidence:'clear',note:'prices are checked only against retained price declarations in the same currency, which may be out of date'});}
 // S102: two different stated limits for one criterion contradict each other (the last one used to win silently): neither
 // is a confirmed requirement; both are asked
 const stated=constraints.filter(c=>c.status==='stated_in_request');
 if(stated.length>1){const m=evaluate(requestSemanticsRules().program,{stated_limit:stated.map(c=>[c.criterion,String(c.value)])});
  const conflicting=new Set(m.all('limit_conflict').map(f=>f.args[0]));
  for(const c of constraints)if(conflicting.has(c.criterion)&&c.status==='stated_in_request'){c.status='candidate';c.confidence='ambiguous';c.note='the request states different limits for this criterion: please confirm which applies';}}
 return {constraints,unmapped};
}
