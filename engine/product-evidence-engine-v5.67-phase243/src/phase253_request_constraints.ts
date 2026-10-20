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
import {SPEC_CRITERIA249,comparable249} from './phase249_decision.js';
// GK: the quantity knowledge says what the printed unit expresses; loaded once (the committed, validated pack).
let QK253:QuantityKnowledge|null=null;const qk253=()=>QK253??=loadQuantityKnowledge();
/** S102 (owner review of S100): the bound of a stated requirement and conflicts between stated requirements are decided by
 * the shared decision policy (knowledge_rules decide; resources/request-semantics/request-semantics.v1.json). The program
 * concludes requirement states only, never product facts. */
export const REQUEST_SEMANTICS_FILE='request-semantics.v1.json';
export interface RequestVocabulary253 {closure:{strict:string[];inclusive:string[]};intent:{hedge:string[];correction:string[];alternative:string[];condition:string[];otherObject:string[]}}
let RQ:{program:CompiledProgram;combination:CompiledProgram;version:string;vocabulary:RequestVocabulary253}|null=null;
export function requestSemanticsRules():{program:CompiledProgram;combination:CompiledProgram;version:string;vocabulary:RequestVocabulary253}{
 if(RQ)return RQ;const raw=JSON.parse(readFileSync(new URL('../../resources/request-semantics/'+REQUEST_SEMANTICS_FILE,import.meta.url),'utf8')) as RuleSet&RequestVocabulary253;
 const ps=compileRuleSet(raw);const program=ps.get('request_requirements'),combination=ps.get('request_combination');
 if(!program||!combination)throw Error('request semantics: program missing');
 return RQ={program,combination,version:raw.version,vocabulary:{closure:raw.closure,intent:raw.intent}};}

export interface RequestConstraint253 extends Constraint253 {
 bound:'min'|'max';property:'capacity'|'water_tank'|'width'|'height'|'depth'|'weight'|'power'|'battery_life'|'price';
 describes:'product'|'available_space';span:string;start:number;end:number;
 /** S103: stated_in_request (applied), candidate (asked), preference (reported, never applied), superseded (corrected
  * by the user), implied (a stricter limit on the same property, object and scenario applies) */
 status:'stated_in_request'|'candidate'|'preference'|'superseded'|'implied';confidence:'clear'|'ambiguous';note:string|null;
 /** S103: whether the limit itself satisfies the requirement, and what says so (a bound word, 'between', the space
  * convention, or the cautious default) */
 closure:'inclusive'|'strict';closureBasis:'word'|'between'|'space'|'default';
 /** S103: decided by request_requirements (null: not decided, e.g. no bound word) */ force:'requirement'|'preference'|'superseded'|null;
 /** S103: what the limit is said of (the product to buy or another one) and the scenario it belongs to */ object:'product'|'other';scenario:string;
 /** S103: the relations request_combination found with other limits of the request (by index) */
 relations:{kind:'corrects'|'corrected_by'|'combined_with'|'implied_by'|'alternative_to'|'contradicts'|'other_object';with:number}[];
 /** S103: the question to ask when the status is candidate */ question?:string;
 /** S103: the value in the criterion's base unit (l, mm, g, W, h; price as stated) */ base:number|null}
export interface ConstraintExtraction253 {constraints:RequestConstraint253[];unmapped:{span:string;reason:string}[]}

// S103 (D31/F12): the bound words of this reader (MIN_BEFORE, MIN_AFTER, MAX_BEFORE, MAX_AFTER, the property word before an
// after-bound) are retired into the quantity-knowledge pack (qk.2.5); one bound reader, shared with documents, reads them.
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
const CRITERION:Record<string,string>={'capacity:min':'capacity_min','capacity:max':'capacity_max','power:max':'power_max','water_tank:min':'water_tank_capacity_min','width:max':'width_max','height:max':'height_max','depth:max':'depth_max','weight:max':'weight_max','power:min':'power_min','battery_life:min':'battery_life_min'};

export function extractConstraints253(text:string):ConstraintExtraction253{
 const lower=text.toLowerCase().replace(/[’‘]/g,"'");
 const constraints:RequestConstraint253[]=[];const unmapped:{span:string;reason:string}[]=[];
 // S103: what the readers saw for each constraint (parallel to constraints)
 const meta:{stated:boolean;elliptic:'hedge'|'correction'|'alternative'|null}[]=[];
 for(const f of findQuantities(qk253(),text)){
  // one kind only: an ambiguous unit ("dB") or another kind (a rate "12 litres a day", a pressure) is not this reader's
  const dim=f.unit.kinds.length===1?DIMENSION_OF_KIND253[f.unit.kinds[0]]??null:null;if(!dim)continue;
  const unit=unitOf(f.unitSurface);
  // a unit the declarations are never stated in ("5 years") was never a constraint here; a bounded one stays visible as a
  // typed quantity requirement (applyQuantityRequirements253)
  if(!unit)continue;
  const m={index:f.start,0:text.slice(f.start,f.end)};
  const between=/\bbetween\s+$/i.test(lower.slice(Math.max(0,f.start-12),f.start));
  const lowNum=f.low!==undefined?String(f.low):null,mainNum=String(f.high??f.value);
  // Clause-local context: the words before the quantity back to the last sentence break, and a few words after.
  // A sentence break is punctuation followed by a space or the end, never a decimal point ("57.5").
  // S86b (capability audit, shared gap): the dot of "min.", "max." or "approx." is not a sentence break
  let clauseStart=0;for(const b of lower.slice(0,m.index).matchAll(/(?<!\b(?:min|max|approx|ca))[.;!?\n](?=\s|$)/g))clauseStart=b.index!+1;
  const before=lower.slice(Math.max(clauseStart,m.index-60),m.index);const after=lower.slice(m.index+m[0].length,m.index+m[0].length+40).split(/(?<!\b(?:min|max|approx|ca))[.;!?\n](?=\s|$)/)[0];
  const ctx=before+' '+after;
  // S103 (D31/F12): the bound is the quantity knowledge's reading (shared with documents; the local word lists are retired
  // into the pack); the space convention is context; a bare range presumes a bound (asked, never applied)
  const sq=quantityBound(qk253(),text,f.start,f.end,f.unit.kinds);
  const range=lowNum!==null;
  const space=SPACE.test(before)||/^\s*(?:\S+\s+){0,2}(?:space|opening|gap|cupboard|shelf|alcove|cabinet|recess)\b/.test(after);
  const rangeDefault:'min'|'max'=dim==='volume'||dim==='power'||dim==='duration'?'min':'max';
  const facts:{reading:string[][];space:string[][];range_inferred:string[][]}={reading:[],space:[],range_inferred:[]};
  if(sq.bound)facts.reading.push(['q','shared',sq.bound]);
  if(space)facts.space.push(['q']);if(range&&!between)facts.range_inferred.push(['q',rangeDefault]);
  const dec=decide(evaluate(requestSemanticsRules().program,facts)).find(d=>d.field==='bound')??null;
  const boundConflict=!!dec?.conflict;
  let bound=(dec?.value??null) as 'min'|'max'|null;
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
  // Include the bound cue in the span: before the quantity ("at least 5 litres") or after it ("5 litres or more")
  const pw=(qk253().pack.language.en.boundPropertyWords??[]).join('|');const cueRe=sq.cue?sq.cue.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'):null;
  const cue=cueRe?(new RegExp(`(?:^|[^\\p{L}])(${cueRe}\\s*)$`,'iu').exec(before)?.[1]??''):'';
  const tail=cueRe&&!cue?(new RegExp(`^\\s*(?:(?:${pw})\\s+)?${cueRe}(?![\\p{L}])`,'iu').exec(after)?.[0]??''):'';
  const spanStart=spanFrom-cue.length;const span=text.slice(spanStart,m.index+m[0].length+tail.length).trim();
  if(!property){if(dim==='length'||dim==='power'||dim==='volume')unmapped.push({span:span0,reason:`unclear which property ${unit} refers to`});continue;}
  const clear=!!bound&&!negated&&!inferredBound2&&!boundConflict;
  const note=boundConflict?'the request\'s words read both as a minimum and as a maximum: please confirm which':property==='power'?'declared power may be rated input or output power; compared as each source declares it':space?'the product must fit inside the space you described; clearances are not added':null;
  const mk=(criterion:string,value:number,b:'min'|'max',closure:'inclusive'|'strict',closureBasis:RequestConstraint253['closureBasis']):RequestConstraint253=>({criterion,value,unit,bound:b,property:property!,describes:space?'available_space':'product',span,start:spanStart,end:spanStart+span.length,
   status:clear?'stated_in_request':'candidate',confidence:clear?'clear':'ambiguous',note,closure,closureBasis,force:null,object:'product',scenario:'base',relations:[],base:baseValue253(criterion,value,unit)});
  // S103 (owner: "between 3 and 5 litres is represented only partially"): both ends of a stated interval are limits
  if(range&&between){for(const side of ['min','max'] as const){const crit=CRITERION[`${property}:${side}`];const v=parseNumber245(side==='min'?lowNum!:mainNum);
    if(!crit||v===null){unmapped.push({span,reason:`the ${side==='min'?'lower':'upper'} limit of the range has no checkable criterion`});continue;}
    constraints.push(mk(crit,v,side,'inclusive','between'));meta.push({stated:clear,elliptic:null});}
   continue;}
  const value=parseNumber245(range?(bound==='max'?mainNum:lowNum!):mainNum);
  if(value===null)continue;
  const eff=bound??(property==='capacity'||property==='water_tank'?'min':null);
  const criterion=eff?CRITERION[`${property}:${eff}`]:undefined;
  if(!criterion){unmapped.push({span,reason:`no checkable criterion for a ${bound??'unbounded'} ${property}`});continue;}
  const cl=closureOf253(sq.cue??'');
  constraints.push(mk(criterion,value,eff!,cl??'inclusive',cl?'word':space?'space':'default'));meta.push({stated:clear,elliptic:null});
  if(range)unmapped.push({span,reason:`the ${criterion.endsWith('_min')?'upper':'lower'} limit of the range has no checkable criterion`});
 }
 // Budget: the Phase125 reading (anchored currency limits).
 const budget=composeQuestion125(text,[{id:'request',aliases:['request'],aspects:[],schemaReviewId:'phase253'}]).userBudget;
 if(budget?.max!=null){const amount=String(budget.max);const i=text.search(new RegExp(`(?:[£$€]\\s*${amount.replace('.','\\.')}|${amount.replace('.','\\.')}\\s*(?:gbp|usd|eur|pounds|dollars|euros))`,'i'));
  const cue=i>=0?(text.slice(Math.max(0,i-20),i).match(/(?:under|below|less than|up to|at most|no more than|max(?:imum)?|budget(?: of| is)?|around)\s*$/i)?.[0]??''):'';
  const span=i>=0?text.slice(i-cue.length,i+text.slice(i).search(/\d(?![\d.,])/)+1).trim():`${budget.currency} ${amount}`;
  const bc=closureOf253(cue);
  constraints.push({criterion:'budget_max',value:budget.max,unit:budget.currency.toLowerCase(),bound:'max',property:'price',describes:'product',span,start:i,end:i+span.length,
   status:'stated_in_request',confidence:'clear',note:'prices are checked only against retained price declarations in the same currency, which may be out of date',
   closure:bc??'inclusive',closureBasis:bc?'word':'default',force:null,object:'product',scenario:'base',relations:[],base:budget.max});meta.push({stated:true,elliptic:null});}
 // S103 (owner review of S102: RQ08 was wrong): the force of each limit and how the limits combine
 resolveRequestLimits253(text,constraints,meta,unmapped);
 return {constraints,unmapped};
}

// ---------------------------------------------------------------------------------------------------------------------
// S103: request semantics (owner review of S102 and authorisation of 2026-10-20). A request can state requirements,
// preferences, corrections, alternative scenarios and limits for other objects; two different limits are not, in general,
// a contradiction. The words that signal each are vocabulary data (request-semantics.v1.json intent and closure); the
// decisions are the request_requirements and request_combination rule programs; the interval arithmetic stays here.
const UNIT253:Record<string,string>={volume:'l',length:'mm',mass:'g',power:'W',duration:'h'};
export function baseValue253(criterion:string,value:number,unit:string):number|null{
 const s=SPEC_CRITERIA249[criterion];if(!s)return null;if(s.dimension==='price')return value;
 // canonical: 12 significant digits, so that 8383 ml is 8.383 l (not 8.383000000000001) wherever limits are compared
 const b=comparable249({kind:'quantity',number:value,unit,approximate:false} as never,s.dimension,UNIT253[s.dimension]);return b===null?null:Number(b.toPrecision(12));}
const norm253=(x:string)=>x.toLowerCase().replace(/\s+/g,' ').trim();
/** Whether the limit itself satisfies the requirement, from the bound phrase; null when the phrase is not listed. */
export function closureOf253(phrase:string):'inclusive'|'strict'|null{
 const v=requestSemanticsRules().vocabulary.closure;const p=norm253(phrase);if(!p)return null;
 if(v.inclusive.includes(p))return 'inclusive';if(v.strict.includes(p))return 'strict';return null;}
const esc253=(x:string)=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const words253=(ws:readonly string[])=>new RegExp(`(?:^|[^\\p{L}'])(?:${[...ws].sort((a,b)=>b.length-a.length).map(esc253).join('|')})(?![\\p{L}])`,'iu');
const MIN_WORD253=/^(?:at least|minimum(?: of)?|min\.?|no less than|not less than|more than|over|above|upwards of)$/i;
const MAX_WORD253=/^(?:at most|maximum(?: of)?|max\.?|no more than|not more than|less than|under|below|up to|within)$/i;
// what may follow an elliptical number ("make it 6 for a family", "possibly 6.", "or 6 if guests come")
const FOLLOW253=/^\s*(?:$|[,.;!?)]|(?:for|if|when|and|but|please|then|instead|tops|max|min|at|in|on|as|so|or|would|should|is|thanks?)\b)/i;
function desc253(c:RequestConstraint253):string{const w=c.bound==='min'?(c.closure==='strict'?'more than':'at least'):(c.closure==='strict'?'less than':'at most');
 return `${w} ${c.value} ${c.unit} (${c.property.replace('_',' ')})`;}
function resolveRequestLimits253(text:string,cs:RequestConstraint253[],meta:{stated:boolean;elliptic:'hedge'|'correction'|'alternative'|null}[],unmapped:{span:string;reason:string}[]){
 const V=requestSemanticsRules().vocabulary.intent;
 // 1. Elliptical limits: a bare number after a hedge, correction or alternative word refers back to the previous limit
 const starts=new Set(findQuantities(qk253(),text).map(q=>q.start));
 const markers=[...V.hedge.map(w=>[w,'hedge']),...V.correction.map(w=>[w,'correction']),...V.alternative.map(w=>[w,'alternative'])].sort((a,b)=>b[0].length-a[0].length) as [string,'hedge'|'correction'|'alternative'][];
 const ELL=new RegExp(`(?:^|[^\\p{L}'])(${markers.map(m=>esc253(m[0])).join('|')})\\s*,?\\s*(?:(?:make|let'?s say)\\s+(?:it|that)\\s+)?(?:(?:it|that)\\s+)?(?:(at least|at most|minimum(?: of)?|maximum(?: of)?|no less than|no more than|more than|less than|over|under|above|below|up to)\\s+)?(\\d+(?:\\.\\d+)?)(?![\\d.,]*\\d)`,'giu');
 const added:{c:RequestConstraint253;m:typeof meta[number]}[]=[];
 for(const m of text.matchAll(ELL)){const numStart=m.index!+m[0].length-m[3].length;if(starts.has(numStart))continue;
  if(!FOLLOW253.test(text.slice(numStart+m[3].length)))continue;
  const ante=[...cs].filter(c=>c.end<=m.index!+m[0].indexOf(m[1])+1&&c.property!=='price').sort((a,b)=>b.end-a.end)[0];
  if(!ante||m.index!-ante.end>200)continue;
  const kind=markers.find(x=>x[0].toLowerCase()===m[1].toLowerCase())![1];
  const bw=m[2]?.toLowerCase();const bound=bw?(MIN_WORD253.test(bw)?'min':MAX_WORD253.test(bw)?'max':ante.bound):ante.bound;
  const criterion=CRITERION[`${ante.property}:${bound}`];const value=Number(m[3]);
  const spanStart=m.index!+m[0].indexOf(m[1]);const span=text.slice(spanStart,numStart+m[3].length);
  if(!criterion){unmapped.push({span,reason:`no checkable criterion for a ${bound} ${ante.property}`});continue;}
  const cl=bw?closureOf253(bw):ante.closure;
  added.push({c:{criterion,value,unit:ante.unit,bound,property:ante.property,describes:ante.describes,span,start:spanStart,end:spanStart+span.length,
   status:ante.status==='stated_in_request'?'stated_in_request':'candidate',confidence:ante.confidence,note:`the number refers back to "${ante.span}"`,closure:cl??'inclusive',closureBasis:bw&&cl?'word':ante.closureBasis,
   force:null,object:ante.object,scenario:'base',relations:[],base:baseValue253(criterion,value,ante.unit)},m:{stated:meta[cs.indexOf(ante)]?.stated??false,elliptic:kind}});}
 for(const a of added){cs.push(a.c);meta.push(a.m);}
 const order=cs.map((_,i)=>i).sort((a,b)=>cs[a].start-cs[b].start);
 // 2. Intent words between the previous limit and this one (and the condition after it)
 const HEDGE=words253(V.hedge),CORR=words253(V.correction),ALT=words253(V.alternative),COND=words253(V.condition),OTHER=words253(V.otherObject);
 const hedge=new Set<number>(),corrected=new Map<number,number>(),cond=new Map<number,string>();let altN=0;
 order.forEach((i,k)=>{const c=cs[i];const prevEnd=k?cs[order[k-1]].end:0;const win=text.slice(prevEnd,c.start);const mk=meta[i].elliptic;
  const earlier=order.slice(0,k).filter(j=>cs[j].property===c.property&&cs[j].object===c.object);
  if(mk==='hedge'||HEDGE.test(win))hedge.add(i);
  if(OTHER.test(win)&&order.slice(0,k).some(j=>cs[j].property===c.property))c.object='other';
  if((mk==='correction'||CORR.test(win))&&earlier.length)corrected.set(earlier.at(-1)!,i);
  const after=text.slice(c.end,c.end+60).split(/[,.;!?]/)[0];const cm=COND.exec(' '+after);
  if(cm)cond.set(i,(after.slice(Math.max(0,cm.index-1))).trim());
  if((mk==='alternative'||(ALT.test(win)&&!/\bor (?:more|less|bigger|larger|smaller|under|below|above)\b/i.test(win)))&&earlier.length&&!corrected.has(earlier.at(-1)!))
   c.scenario=cond.get(i)??(after.match(/^\s*((?:for|if|when|in case)\b[^,.;!?]*)/i)?.[1].trim()||`alternative ${++altN}`);});
 // a condition distinguishes a scenario only against another limit of the same property and side without it
 for(const [i,label] of cond){const c=cs[i];if(c.scenario!=='base')continue;
  if(cs.some((d,j)=>j!==i&&d.property===c.property&&d.object===c.object&&d.bound===c.bound&&!cond.has(j)))c.scenario=label;}
 // 3. Force (request_requirements)
 const ids=cs.map((_,i)=>'c'+i);
 const ff:{stated_bound:string[][];hedge:string[][];corrected_by:string[][]}={stated_bound:[],hedge:[],corrected_by:[]};
 cs.forEach((_,i)=>{if(meta[i].stated)ff.stated_bound.push([ids[i]]);if(hedge.has(i))ff.hedge.push([ids[i]]);});
 for(const [e,l] of corrected)ff.corrected_by.push([ids[e],ids[l]]);
 const fd=decide(evaluate(requestSemanticsRules().program,ff));
 cs.forEach((c,i)=>{c.force=(fd.find(d=>d.object===ids[i]&&d.field==='force')?.value??null) as RequestConstraint253['force'];});
 for(const [e,l] of corrected){cs[e].relations.push({kind:'corrected_by',with:l});cs[l].relations.push({kind:'corrects',with:e});}
 cs.forEach(c=>{if(c.force==='superseded'){c.status='superseded';c.note=`replaced by your later "${cs[c.relations.find(r=>r.kind==='corrected_by')!.with].span}"`;}
  else if(c.force==='preference'){c.status='preference';c.note='a preference: reported, never used to exclude a product';}});
 // 4. Combination (request_combination); only clear, mandatory limits combine or contradict
 const cf:Record<string,string[][]>={mandatory:[],preference:[],frame:[],limit:[]};
 cs.forEach((c,i)=>{if(c.force==='requirement'&&c.status==='stated_in_request')cf.mandatory.push([ids[i]]);if(c.force==='preference')cf.preference.push([ids[i]]);
  cf.frame.push([ids[i],c.property,c.object,c.scenario]);if(c.base!==null)cf.limit.push([ids[i],c.bound==='min'?'low':'high',String(Number(c.base.toPrecision(12))),c.closure]);});
 const cm=evaluate(requestSemanticsRules().combination,cf);
 if(cm.all('violation').length)throw Error('request_semantics_invariant: a preference became a mandatory requirement (RC10)');
 const pairs=(p:string)=>cm.all(p).map(f=>[ids.indexOf(f.args[0]),ids.indexOf(f.args[1])] as [number,number]);
 const ask=(i:number,q:string,why:string)=>{const c=cs[i];if(c.status!=='stated_in_request')return;c.status='candidate';c.confidence='ambiguous';c.question=q;c.note=why;};
 for(const [a,b] of pairs('other_object')){cs[a].relations.push({kind:'other_object',with:b});
  if(cs[a].object==='other')ask(a,`You wrote "${cs[a].span}": is that a limit for the product you are choosing now?`,'this limit seems to describe another product; PEE checks one product at a time');}
 for(const [a,b] of pairs('contradiction')){cs[a].relations.push({kind:'contradicts',with:b});
  ask(a,`You asked for ${desc253(cs[a])} and ${desc253(cs[b])}; no product can satisfy both. Which applies?`,'contradicts another stated limit: neither is applied until you confirm');}
 // alternatives: only what every scenario requires is certain
 const alts=pairs('alternative');for(const [a,b] of alts)cs[a].relations.push({kind:'alternative_to',with:b});
 const altIdx=[...new Set(alts.flat())];
 for(const key of new Set(altIdx.map(i=>cs[i].property+'|'+cs[i].object))){const grp=altIdx.filter(i=>cs[i].property+'|'+cs[i].object===key&&cs[i].status==='stated_in_request');
  const scen=new Set(grp.map(i=>cs[i].scenario));
  for(const side of ['min','max'] as const){const mem=grp.filter(i=>cs[i].bound===side);if(!mem.length)continue;
   const covered=[...scen].every(sc=>mem.some(i=>cs[i].scenario===sc));
   const weakest=covered?[...mem].sort((x,y)=>{const d=(cs[x].base??0)-(cs[y].base??0);if(d)return side==='min'?d:-d;return cs[x].closure==='inclusive'?-1:1;})[0]:-1;
   for(const i of mem){if(i===weakest){cs[i].note='applies in every scenario you described';continue;}
    ask(i,`You said ${desc253(cs[i])}${cs[i].scenario.startsWith('alternative')?' as an alternative':' '+cs[i].scenario}: should PEE apply it?`,'belongs to one of the alternative scenarios you described');}}}
 // within one frame, compatible mandatory limits both hold: the stricter limit of each side applies
 for(const [a,b] of pairs('combines'))cs[a].relations.push({kind:'combined_with',with:b});
 const frames=new Map<string,number[]>();cs.forEach((c,i)=>{if(c.status==='stated_in_request')(frames.get(`${c.criterion}|${c.object}|${c.scenario}`)??frames.set(`${c.criterion}|${c.object}|${c.scenario}`,[]).get(`${c.criterion}|${c.object}|${c.scenario}`)!).push(i);});
 for(const g of [...frames.values()].filter(g=>g.length>1)){
  const strict=(i:number)=>cs[i].closure==='strict'?1:0;
  const best=[...g].sort((x,y)=>{const d=(cs[y].base??0)-(cs[x].base??0);if(d)return cs[x].bound==='min'?d:-d;return strict(y)-strict(x);})[0];
  for(const i of g)if(i!==best){cs[i].status='implied';cs[i].relations.push({kind:'implied_by',with:best});cs[i].note=`implied by the stricter limit "${cs[best].span}"`;}}
 // one applied limit per criterion (the decision snapshot holds one value per key): the stricter one
 const byCrit=new Map<string,number[]>();cs.forEach((c,i)=>{if(c.status==='stated_in_request')(byCrit.get(c.criterion)??byCrit.set(c.criterion,[]).get(c.criterion)!).push(i);});
 for(const g of [...byCrit.values()].filter(g=>g.length>1)){const best=[...g].sort((x,y)=>{const d=(cs[y].base??0)-(cs[x].base??0);return cs[x].bound==='min'?d:-d;})[0];
  for(const i of g)if(i!==best)ask(i,`You wrote "${cs[i].span}" and "${cs[best].span}": which limit applies?`,'two applied limits for one criterion');}
}
