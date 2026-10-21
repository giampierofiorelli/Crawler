/** Third increment, C (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-third-increment-authorisation-2026-10-21.md; preregistration evaluation/i3/preregistration.json). SHADOW.
 *
 * Understanding the goal before the product. For one buying message it separates:
 *  - what the shopper REQUESTED (a product family named with a buying role), what they OWN, what is CONTEXT, what they
 *    weigh as an ALTERNATIVE and what they REJECT (object roles from N0, plus the shared negation scope);
 *  - the product families PEE HYPOTHESISES from its own knowledge when the message only describes a problem or goal.
 *    A hypothesis is never a need attributed to the user and never a requirement, an exclusion or a ranking input: it
 *    keeps why it was formed, the knowledge that supports it (with references), the conditions that limit it and what
 *    would count against it;
 *  - what to do next: COMMIT to a family (only when the shopper named it, or when one hypothesis clearly dominates),
 *    ASK the question that best separates the leading hypotheses, or ABSTAIN when no knowledge supports a family.
 *
 * Reused, not rewritten: N0 objects (need_model_n0), the shared negation and indifference scope (language_scope), the
 * stemmer and idf of need_interpretation, the store's category teaching (items with concepts), translated statements
 * and, optionally, N1 row claims. No category, product or phrase is named here; families come from the registry and
 * the store. Nothing here is on the request path. */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import type {Advice253} from './phase253_advice_contract.js';
import {needModelN0,type ObjectN0} from './need_model_n0.js';
import {stemsNI,INFERENCE_TYPES} from './need_interpretation.js';
import {statementsOf} from './knowledge_statements.js';
import {claimsOfN1} from './relation_claims_n1.js';
import {stanceAt,scopeVocabulary,tokens} from './language_scope.js';
import {loadQuantityKnowledge,type QuantityKnowledge} from './quantity_knowledge.js';
import {CATEGORY_REGISTRY250} from './phase248_category_registry.js';

export const GOAL_C_VERSION='c.1';
/** Development parameters (development material only: spent R3-P and N1 requests). */
export const C_PARAMS={
 /** a word shared with the knowledge of more families than this is generic and supports nothing */ maxSpread:3,
 /** an item must share at least this many informative words with the message, unless one of them is specific to its family */ minShared:2,
 /** a family is a hypothesis when its best items reach this score */ hypothesisScore:2.5,
 /** further hypotheses are kept while within this share of the best one */ keepShare:0.5,
 /** at most this many hypotheses */ maxHypotheses:3,
 /** a single hypothesis is enough to commit only above this score and this lead over the next */ commitScore:7,commitLead:3,
 /** items summed per family */ topItems:3};

export type ObjectRoleC='requested'|'owned'|'context'|'alternative'|'rejected'|'hypothesised';
export interface SupportC {ref:string;kind:'concept'|'statement'|'claim';text:string;shared:string[]}
export interface HypothesisC {family:string;epistemic:'hypothesis_unverified';score:number;reason:string;support:SupportC[];
 conditions:string[];counterEvidence:string[]}
export interface GoalUnderstandingC {schema:'pee.c.goal-understanding.v1';version:string;status:'shadow';text:string;
 objects:{span:string;family:string;role:ObjectRoleC;cue:string|null}[];
 requested:string|null;type:'named'|'problem'|'mixed';
 hypotheses:HypothesisC[];
 action:'commit'|'ask'|'abstain';actionBasis:string;committed:string|null;
 question:{text:string;separates:string[]}|null;
 /** words of the message no knowledge item used (left for the adviser, never dropped silently) */ unexplained:string[]}

interface ItemC {family:string;ref:string;kind:SupportC['kind'];text:string;stems:Set<string>;conditions:string[];caveats:string[];
 /** the words that NAME the concept (its id and aliases), not merely occur in its sentence */ names?:Set<string>}
const cache=new WeakMap<KnowledgeStore246,Map<string,ItemC[]>>();
/** The goal- and situation-side knowledge of every family the store teaches (and, with claims, the row claims). */
function knowledgeItems(store:KnowledgeStore246,claims:boolean):ItemC[]{
 const key=claims?'claims':'plain';let m=cache.get(store);if(!m){m=new Map();cache.set(store,m);}
 const hit=m.get(key);if(hit)return hit;
 const out:ItemC[]=[];const families=new Set(CATEGORY_REGISTRY250.map(r=>r.id));
 const GOAL_KINDS=new Set(['outcome','environment','failure','task','meaning']);
 for(const fam of families){
  for(const i of store.categoryItems246(fam).filter(i=>i.concept&&GOAL_KINDS.has(i.concept.kind as string))){
   const text=[i.concept!.id.replace(/_/g,' '),...i.concept!.aliases,i.statement].join(' ');
   out.push({family:fam,ref:'item:'+i.itemId,kind:'concept',text:i.statement.slice(0,240),stems:stemsNI(text),conditions:i.concept!.kind==='environment'?[i.statement.slice(0,160)]:[],caveats:[],
    names:stemsNI([i.concept!.id.replace(/_/g,' '),...i.concept!.aliases].join(' '))});}
  const st=statementsOf(store,fam,{types:INFERENCE_TYPES});
  for(const s of st){const side=['measured_by','requires','bears_on_outcome'].includes(s.type)?(s.subject as {text?:string}|null)?.text??'':'';if(!side)continue;
   out.push({family:fam,ref:s.statementId,kind:'statement',text:s.rendered.slice(0,240),stems:stemsNI(side),conditions:s.scope.slice(0,2),caveats:s.type==='limitation'||s.type==='not_sufficient'?[s.rendered.slice(0,160)]:[]});}
  if(claims)for(const c of claimsOfN1(store,fam)){const from=c.participants.filter(p=>p.role==='situation'||p.role==='need');if(!from.length)continue;
   const quals=c.links.flatMap(l=>l.qualifiers).map(q=>c.participants.find(p=>p.col===q)).filter(Boolean) as {role:string;text:string}[];
   out.push({family:fam,ref:c.claimId,kind:'claim',text:c.participants.map(p=>p.text).join(' | ').slice(0,240),stems:stemsNI(from.map(p=>p.text).join(' ')),
    conditions:quals.filter(q=>q.role==='condition').map(q=>q.text.slice(0,160)),caveats:quals.filter(q=>q.role==='caveat').map(q=>q.text.slice(0,160))});}}
 m.set(key,out);return out;
}

export interface GoalUnderstandingOptionsC {qk?:QuantityKnowledge;claims?:boolean}
export function goalUnderstandingC(text:string,advice:Advice253,store:KnowledgeStore246,o:GoalUnderstandingOptionsC={}):GoalUnderstandingC{
 const qk=o.qk??loadQuantityKnowledge();const v=scopeVocabulary(qk);
 // ---- objects: N0 roles; a negated or excluded mention is rejected
 const n0=needModelN0(text,advice,store,{qk});
 const objects=n0.objects.map((x:ObjectN0)=>{const st=stanceAt(text,x.start,x.end,v);
  return {span:x.span,family:x.category,role:(st?.stance==='negated'?'rejected':x.role) as ObjectRoleC,cue:st?.negator??x.cue};});
 // c.1 dev-it3: when N0 finds no requested object, the operational purchase target counts as requested only if the message
 // names that family and does not mention it only as owned, context, alternative or rejected
 const requested=objects.find(x=>x.role==='requested')?.family??
  (advice.category&&objects.some(x=>x.family===advice.category)&&!objects.some(x=>x.family===advice.category&&x.role!=='requested'&&x.role!=='hypothesised')?advice.category:null);
 const rejected=new Set(objects.filter(x=>x.role==='rejected').map(x=>x.family));
 // ---- message words: not set aside by the scope, not product names
 const aliasStems=new Set(CATEGORY_REGISTRY250.flatMap(r=>r.aliases).flatMap(a=>[...stemsNI(a)]));
 const setAside=new Set<string>();for(const t of tokens(text))if(t.kind==='word'&&stanceAt(text,t.start,t.end,v))for(const s of stemsNI(t.w))setAside.add(s);
 const words=new Set([...stemsNI(text)].filter(s=>!setAside.has(s)&&!aliasStems.has(s)));
 // ---- hypotheses: families whose goal- and situation-side knowledge shares specific words with the message
 const items=knowledgeItems(store,!!o.claims);
 const df=new Map<string,number>(),fams=new Map<string,Set<string>>();
 for(const it of items)for(const s of it.stems){df.set(s,(df.get(s)??0)+1);(fams.get(s)??fams.set(s,new Set()).get(s)!).add(it.family);}
 const N=Math.max(1,items.length);const idf=(s:string)=>Math.log((N+1)/((df.get(s)??0)+0.5));
 const spread=(s:string)=>fams.get(s)?.size??0;
 const byFam=new Map<string,{it:ItemC;score:number;shared:string[]}[]>();
 for(const it of items){const shared=[...it.stems].filter(s=>words.has(s)&&spread(s)<=C_PARAMS.maxSpread);if(!shared.length)continue;
  // c.1 dev-it1: one shared word is support only when it NAMES a taught concept; a rare word that merely occurs in a
  // sentence of the teaching ("spare", "before", "morning") is not evidence of the family
  if(shared.length<C_PARAMS.minShared&&!shared.some(s=>it.names?.has(s)))continue;
  const score=shared.reduce((a,s)=>a+idf(s)/spread(s),0);(byFam.get(it.family)??byFam.set(it.family,[]).get(it.family)!).push({it,score,shared});}
 const ranked=[...byFam].map(([family,xs])=>{const top=xs.sort((a,b)=>b.score-a.score).slice(0,C_PARAMS.topItems);return {family,top,score:top.reduce((a,x)=>a+x.score,0)};})
  // c.1 dev-it2: a family needs at least two distinct words of the message in its support; one word, even one naming a
  // concept ("round", "day", "baby"), is coincidence, not a reason
  .filter(f=>!rejected.has(f.family)&&f.score>=C_PARAMS.hypothesisScore&&new Set(f.top.flatMap(x=>x.shared)).size>=C_PARAMS.minShared)
  .sort((a,b)=>b.score-a.score||a.family.localeCompare(b.family));
 const best=ranked[0]?.score??0;
 const kept=ranked.filter(f=>f.score>=best*C_PARAMS.keepShare).slice(0,C_PARAMS.maxHypotheses);
 const hypotheses:HypothesisC[]=kept.map(f=>{const sw=[...new Set(f.top.flatMap(x=>x.shared))];
  return {family:f.family,epistemic:'hypothesis_unverified',score:Number(f.score.toFixed(2)),
   reason:`the message's words (${sw.join(', ')}) match what PEE's ${f.family} teaching says about situations or goals`,
   support:f.top.map(x=>({ref:x.it.ref,kind:x.it.kind,text:x.it.text,shared:x.shared})),
   conditions:[...new Set(f.top.flatMap(x=>x.it.conditions))].slice(0,3),
   counterEvidence:[...new Set([...f.top.flatMap(x=>x.it.caveats),...[...rejected].map(r=>`the message rules out ${r}`)])].slice(0,3)};});
 // ---- action and question
 let action:GoalUnderstandingC['action'];let actionBasis:string;let committed:string|null=null;let question:GoalUnderstandingC['question']=null;
 // c.1 dev-it3: a question names a goal in the teaching's own words: a concept statement, else a claim's need cell, else
 // the situation side of a statement
 const goalOf=(h:HypothesisC)=>{const sup=h.support.find(x=>x.kind==='concept')??h.support.find(x=>x.kind==='claim')??h.support[0];if(!sup)return h.family;
  const t=sup.kind==='claim'?(sup.text.split(' | ')[1]??sup.text):sup.kind==='statement'?sup.text.replace(/^[“"]?([^”"]+)[”"]?\s+(?:is measured by|bears on|requires).*$/i,'$1'):sup.text;
  return t.split(/[.;]/)[0].trim().slice(0,90);};
 const label=(f:string)=>f.replace(/_/g,' ').replace(/s$/,'');
 if(requested){action='commit';actionBasis='named_by_the_shopper';committed=requested;}
 else if(!hypotheses.length){action='abstain';actionBasis='no_knowledge_supports_a_family';
  question={text:'What would you most like to change or achieve, and in which room or situation?',separates:[]};}
 else if(hypotheses.length===1&&hypotheses[0].score>=C_PARAMS.commitScore&&(ranked[1]?.score??0)*C_PARAMS.commitLead<=hypotheses[0].score){
  action='commit';actionBasis='one_hypothesis_clearly_dominates';committed=hypotheses[0].family;}
 else{action='ask';actionBasis=hypotheses.length>1?'several_hypotheses':'one_weak_hypothesis';
  const [a,b]=hypotheses;
  question=b?{text:`Is your main aim closer to "${goalOf(a)}" (where a ${label(a.family)} could help) or to "${goalOf(b)}" (where a ${label(b.family)} could help)?`,separates:[a.family,b.family]}
   :{text:`Is your main aim "${goalOf(a)}"? If so a ${label(a.family)} may help; if not, what outcome matters most to you?`,separates:[a.family]};}
 const used=new Set(hypotheses.flatMap(h=>h.support.flatMap(s=>s.shared)));
 const type:GoalUnderstandingC['type']=requested?(hypotheses.some(h=>h.family!==requested)?'mixed':'named'):objects.length?'mixed':'problem';
 return {schema:'pee.c.goal-understanding.v1',version:GOAL_C_VERSION,status:'shadow',text,objects,requested,type,hypotheses,action,actionBasis,committed,question,
  unexplained:[...words].filter(w=>!used.has(w)).slice(0,12)};
}
