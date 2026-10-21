/**
 * N0 essential (first increment B; owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/
 * references/owner-first-increment-authorisation-2026-10-21.md). SHADOW: a shared semantic representation of a request,
 * built from what the existing readers already produce. It is not on the request path, changes no decision, exclusion
 * or ranking, and is not a second interpreter: every item comes from an existing reader, and this module only states,
 * in one vocabulary, what each one means.
 *
 * Owner decisions it applies (owner-review-n0-design-2026-10-20.md, owner-review-n0-inventory-2026-10-20.md):
 *  - two separate questions: WHAT the words are about (object role, content kind) and WHAT the request says about it
 *    (stance, force);
 *  - four stances besides 'wanted': not needed, unwanted (strength to determine), explicitly excluded, indifferent;
 *    "I don't need X" is never an absolute exclusion, and "I don't want X" is not "it must not have X";
 *  - a stated requirement suffices when its meaning, scope and force are clear (no needless confirmation);
 *  - not_sufficient_for and requires_condition are kept (the Phase116 model would lose them, I-9).
 *
 * Reused, not rewritten: language_scope (clauses, negation, indifference), need_interpretation arm A (stances; no
 * knowledge), the store's category concepts and their aliases, product_facts functions, the Phase253 constraint reader
 * (limits with their status), needKnowledge269 (measurement, condition and proxy relations).
 * The only new data are general English role and stance cues (resources/request-semantics/need-model-n0.v1.json).
 */
import {readFileSync} from 'node:fs';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {Advice253} from './phase253_advice_contract.js';
import {stanceAt,clauseAround,scopeVocabulary,type ScopeVocabulary} from './language_scope.js';
import {loadQuantityKnowledge,type QuantityKnowledge} from './quantity_knowledge.js';
import {interpretNeeds,type NeedInterpretation} from './need_interpretation.js';
import {loadProductFunctions} from './product_facts.js';
import {needKnowledge269} from './phase247_category_relations.js';
import {CATEGORY_REGISTRY250} from './phase248_category_registry.js';

export const NEED_MODEL_N0_VERSION='n0.1';
export type ObjectRoleN0='requested'|'owned'|'context'|'hypothesised'|'alternative';
export type ContentKindN0='goal'|'outcome'|'problem'|'property'|'function'|'preference'|'constraint'|'context'|'unknown';
export type StanceN0='wanted'|'not_needed'|'unwanted'|'excluded'|'indifferent';
export type ForceN0='requirement'|'preference'|'optional'|'excluded'|'none'|'undetermined';
export interface ObjectN0 {span:string;start:number;end:number;category:string;role:ObjectRoleN0;cue:string|null}
export interface ItemN0 {span:string;start:number;end:number;content:ContentKindN0;concept:string|null;conceptKind:string|null;
 stance:StanceN0;strength:'undetermined'|null;force:ForceN0;basis:'expressed'|'inferred';epistemic:'stated'|'experimental_unverified';
 /** the existing readers this item comes from */ producer:string[];
 /** the store relations of the concept: measured_by, requires_condition, not_sufficient_for (kept, never collapsed) */
 evidence?:{measures:string[];conditions:string[];notSufficient:string[]}}
export interface NeedModelN0 {schema:'pee.n0.need-model.v1';version:string;status:'shadow';text:string;category:string|null;
 objects:ObjectN0[];items:ItemN0[];
 /** operational needs read from words the request sets aside or rejects (the model never changes them) */
 conflicts:{concept:string;reason:string}[];
 /** operational needs matched on non-contiguous words (Phase248 paraphrase '~a+b'): kept visible, not anchored to a span */
 unanchored:{concept:string;words:string[]}[]}

interface CuesN0 {objectRoles:{owned:string[];hypothesised:string[];alternative:string[];requestVerbs:string[]};
 stances:{exclusionModals:string[];notNeededVerbs:string[];unwantedVerbs:string[]};force:{requirement:string[];preference:string[]};
 governed:{skip:string[];maxWords:number}}
let CUES:CuesN0|null=null;
export function needModelCuesN0():CuesN0{return CUES??=JSON.parse(readFileSync(new URL('../../resources/request-semantics/need-model-n0.v1.json',import.meta.url),'utf8')) as CuesN0;}

const esc=(w:string)=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const low=(t:string)=>t.toLowerCase().replace(/[’‘]/g,"'");
/** whole-word occurrences of a phrase (case-insensitive), as offsets */
function occurrences(text:string,phrase:string):{start:number;end:number}[]{const out:{start:number;end:number}[]=[];if(!phrase.trim())return out;
 const re=new RegExp('(?<![\\p{L}\\p{N}])'+esc(low(phrase)).replace(/\s+/g,'[\\s-]+')+'(?![\\p{L}\\p{N}])','gu');
 for(const m of low(text).matchAll(re))out.push({start:m.index!,end:m.index!+m[0].length});return out;}
const norm=(seg:string)=>' '+low(seg).replace(/[^\p{L}\p{N}' ]+/gu,' ').replace(/\s+/g,' ')+' ';
const hasCue=(seg:string,cues:readonly string[])=>{const s=norm(seg);return cues.find(c=>s.includes(' '+low(c)+' '))??null;};
const CONTENT_OF_CONCEPT:Record<string,ContentKindN0>={outcome:'outcome',failure:'problem',task:'goal',meaning:'goal',capability:'function',mechanism:'property',measurement:'property',environment:'context'};

/** The sentence around a position (to the previous and next . ! ? or line break). */
function sentenceAround(text:string,at:number){let a=at;while(a>0&&!/[.!?\n]/.test(text[a-1]))a--;let b=at;while(b<text.length&&!/[.!?\n]/.test(text[b]))b++;return {start:a,end:Math.min(text.length,b+1)};}

// ---------------------------------------------------------------------------------------------------------------------
// objects: product mentions of the category registry, with their role in the request
function objectsOf(text:string,advice:Advice253,cues:CuesN0):ObjectN0[]{
 const m:{start:number;end:number;category:string}[]=[];
 for(const e of CATEGORY_REGISTRY250)for(const a of e.aliases??[])for(const o of occurrences(text,a))m.push({...o,category:e.id});
 // the longest mention wins where two overlap
 const kept=m.sort((x,y)=>x.start-y.start||(y.end-y.start)-(x.end-x.start)).filter((x,i,arr)=>!arr.slice(0,i).some(y=>y.start<x.end&&x.start<y.end));
 const out:ObjectN0[]=[];
 kept.forEach((x,i)=>{const sent=sentenceAround(text,x.start);const prevEnd=kept.slice(0,i).filter(p=>p.end>sent.start).at(-1)?.end??sent.start;
  const before=text.slice(prevEnd,x.start);const question=text.slice(x.end,sent.end).includes('?');
  let role:ObjectRoleN0;let cue:string|null=null;
  const owned=hasCue(before,cues.objectRoles.owned);
  if(kept.slice(0,i).some(p=>p.category!==x.category)&&(cue=hasCue(before,cues.objectRoles.alternative)))role='alternative';
  else if(owned&&!hasCue(before.slice(norm(before).lastIndexOf(' '+owned+' ')+owned.length),cues.objectRoles.requestVerbs)){role='owned';cue=owned;}
  else if((question&&(cue=hasCue(before,cues.objectRoles.hypothesised)))||(cue=hasCue(text.slice(sent.start,sent.end),['worth'])))role='hypothesised';
  else if((cue=hasCue(before,cues.objectRoles.requestVerbs))||x.category===advice.category)role='requested';
  else role='context';
  out.push({span:text.slice(x.start,x.end),start:x.start,end:x.end,category:x.category,role,cue});});
 return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// stance and force of an item span, from the shared scope and the stance cues
function stanceOf(text:string,start:number,end:number,v:ScopeVocabulary,cues:CuesN0):{stance:StanceN0;strength:'undetermined'|null;force:ForceN0}{
 const st=stanceAt(text,start,end,v);const cl=clauseAround(text,start,end,v);const before=text.slice(cl.start,start);
 if(st?.stance==='indifferent')return {stance:'indifferent',strength:null,force:'none'};
 if(hasCue(before,cues.stances.exclusionModals))return {stance:'excluded',strength:null,force:'excluded'};
 if(st?.stance==='negated'){
  const i=low(before).lastIndexOf(low(st.negator));const after=i>=0?before.slice(i):before;
  if(hasCue(after,cues.stances.notNeededVerbs))return {stance:'not_needed',strength:null,force:'optional'};
  return {stance:'unwanted',strength:'undetermined',force:'undetermined'};}
 const force:ForceN0=hasCue(before,cues.force.requirement)?'requirement':hasCue(before,cues.force.preference)?'preference':'undetermined';
 return {stance:'wanted',strength:null,force};
}

export interface NeedModelOptionsN0 {qk?:QuantityKnowledge;
 /** an experimental need interpretation to include as inferred, unreviewed items (never stated ones) */ interpretation?:NeedInterpretation|null}
export function needModelN0(text:string,advice:Advice253,store:KnowledgeStore246,o:NeedModelOptionsN0={}):NeedModelN0{
 const qk=o.qk??loadQuantityKnowledge();const v=scopeVocabulary(qk);const cues=needModelCuesN0();const cat=advice.category;
 const items:ItemN0[]=[];
 const add=(start:number,end:number,content:ContentKindN0,concept:string|null,conceptKind:string|null,producer:string,force?:ForceN0)=>{
  const ex=items.find(i=>i.start===start&&i.end===end);
  if(ex){if(!ex.producer.includes(producer))ex.producer.push(producer);if((!ex.concept||ex.content==='unknown')&&concept&&content!=='unknown'){ex.concept=concept;ex.conceptKind=conceptKind;ex.content=content;}return;}
  const s=stanceOf(text,start,end,v,cues);
  items.push({span:text.slice(start,end),start,end,content,concept,conceptKind,stance:s.stance,strength:s.strength,force:force&&s.stance==='wanted'?force:s.force,basis:'expressed',epistemic:'stated',producer:[producer]});};
 // 1. limits the Phase253 constraint reader took from the request (force from its own status)
 for(const c of [...advice.constraints,...(advice.otherLimits??[])]){if(!c.span||c.status==='superseded')continue;const at=occurrences(text,c.span)[0];if(!at)continue;
  const f:ForceN0=c.status==='preference'?'preference':c.status==='candidate'||c.confidence==='ambiguous'?'undetermined':'requirement';
  add(at.start,at.end,'constraint',c.criterion,null,'phase253_request_constraints',f);}
 for(const q of advice.quantityRequirements??[]){const at=occurrences(text,q.span)[0];if(at)add(at.start,at.end,'constraint',q.kind,null,'quantity_knowledge',q.bound==='unstated'?'undetermined':'requirement');}
 // 2. category concepts by their aliases (the store's teaching), negated or not
 if(cat)for(const it of store.categoryItems246(cat).filter(i=>i.concept)){const k=it.concept!.kind as string;
  for(const a of new Set([...it.concept!.aliases,it.concept!.id.replace(/_/g,' ')]))for(const at of occurrences(text,a))add(at.start,at.end,CONTENT_OF_CONCEPT[k]??'unknown',it.concept!.id,k,'store_concepts');}
 // operational needs whose words are literal in the request (the Phase248 reading)
 const unanchored:NeedModelN0['unanchored']=[];
 for(const n of advice.researchInputs?.needSpans??[]){const lit=occurrences(text,n.matched.replace(/[~+]/g,' '));for(const at of lit)add(at.start,at.end,'unknown',n.id,null,'phase248_needs');
  if(!lit.length&&n.matched.startsWith('~'))unanchored.push({concept:n.id,words:n.matched.slice(1).split('+')});}
 // 3. functions and named modes of the reading vocabulary
 const fp=loadProductFunctions().pack;
 for(const f of fp.functions)for(const t of f.terms)for(const at of occurrences(text,t))add(at.start,at.end,'function',null,null,'product_facts');
 for(const [term] of ((fp as {modes?:{nominalTerms?:[string,string][]}}).modes?.nominalTerms??[]))for(const at of occurrences(text,term))add(at.start,at.end,'function',null,null,'product_facts');
 // 4. use contexts of the quantity knowledge (situations, not needs)
 for(const c of qk.pack.useContexts??[])for(const t of c.terms)for(const at of occurrences(text,t))add(at.start,at.end,'context',c.id,'use_context','quantity_knowledge');
 // 5. words the shared scope sets aside (need_interpretation arm A stances) that no reader typed: kept as unknown items
 const ni=interpretNeeds(text,advice,store,{knowledgeGuided:false,qk});
 const skip=new Set(cues.governed.skip);
 const stanceWords=ni.stances.map(s=>s.term).filter(w=>!skip.has(w));
 for(const w of new Set(stanceWords))for(const at of occurrences(text,w)){if(items.some(i=>i.start<at.end&&at.start<i.end))continue;
  // extend to the adjacent stance words (a phrase of at most maxWords)
  let e=at.end;for(let n=1;n<cues.governed.maxWords;n++){const m=/^\s+([\p{L}][\p{L}'-]*)/u.exec(text.slice(e));if(!m||!stanceWords.includes(low(m[1]))||skip.has(low(m[1])))break;e+=m[0].length;}
  if(stanceAt(text,at.start,e,v))add(at.start,e,'unknown',null,null,'language_scope');}
 // 6. inferred, unreviewed items of an experimental interpretation, if one is given (never stated)
 const inferred:ItemN0[]=(o.interpretation?.inferred??[]).map(i=>({span:'',start:-1,end:-1,content:'outcome' as const,concept:i.concept,conceptKind:i.kind,stance:'wanted' as const,strength:null,force:'undetermined' as const,
  basis:'inferred' as const,epistemic:'experimental_unverified' as const,producer:['need_interpretation']}));
 // the longest span wins where two items overlap, unless only the shorter one is typed by a concept
 const stated=items.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
 const covers=(y:ItemN0,x:ItemN0)=>y!==x&&y.start<=x.start&&x.end<=y.end&&(y.end-y.start)>(x.end-x.start);
 const kept=stated.filter(x=>!stated.some(y=>covers(y,x)&&!(x.concept&&!y.concept)));
 const all=[...kept,...inferred];
 // the store relations of each concept item (measurements, required conditions, proxies)
 if(cat){const ids=[...new Set(all.filter(i=>i.concept&&['outcome','goal','problem'].includes(i.content)).map(i=>i.concept!))];
  const nk=new Map(needKnowledge269(store,cat,ids).map(k=>[k.need,k]));
  for(const i of all){const k=i.concept?nk.get(i.concept):undefined;if(k&&(k.relevant.length||k.conditions.length||k.proxies.length))i.evidence={measures:k.relevant,conditions:k.conditions,notSufficient:k.proxies};}}
 // operational needs read from words the request sets aside or rejects
 const conflicts:NeedModelN0['conflicts']=[];
 for(const n of advice.needs){const its=all.filter(i=>i.concept===n&&i.basis==='expressed');
  if(its.length&&its.every(i=>i.stance!=='wanted'))conflicts.push({concept:n,reason:`the operational path reads a positive need; the request's words are ${[...new Set(its.map(i=>i.stance))].join('/')}`});}
 return {schema:'pee.n0.need-model.v1',version:NEED_MODEL_N0_VERSION,status:'shadow',text,category:cat,objects:objectsOf(text,advice,cues),items:all,conflicts,unanchored};
}
