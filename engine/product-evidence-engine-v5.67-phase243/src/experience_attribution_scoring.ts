/** Continuous-learning Step 1C — frozen attribution scoring (evaluation only). Pure; the same rules score every arm.
 *
 * Gold value items (one per value and product): subjectStatus `exact` (one product), `shared` (the page states the same
 * result for several products: one item per product, same `group`), or `undetermined` (the page does not establish whose
 * value it is; subject null). Accepted identity variants are listed per item with their evidence.
 *
 * Item classes (per gold item; when several leads carry the value, the best class wins, identically for every arm):
 *  correct | correct_multi (a multi-subject lead naming this product) | false_identity_match (the shared-token identity
 *  rule accepts the name but its brand contradicts the gold brand) | unresolved (only leads without a subject) |
 *  wrong_product | missing; for `undetermined` items: correctly_unresolved | unsupported_assignment | missing.
 * Lead classes (per lead, so that a wrong assignment is never hidden by a correct one): lead_correct, lead_multi_correct,
 *  lead_multi_overreach, lead_wrong_product, lead_false_identity, lead_unsupported (assigned where gold says undetermined),
 *  lead_unresolved, lead_not_gold_value (no gold value of that value and unit: not an attribution question).
 * Unresolved is never counted as correct.
 */

export interface GoldValue1C {id:string;doc:string;value:number;unit:string;subjectStatus:'exact'|'shared'|'undetermined';subject:string|null;
 acceptedVariants?:{name:string;evidence:string}[];group?:string|null}
export interface ScoredLead1C {value:number;unit:string;subject:string|null;subjects?:string[]|null}
export type ItemClass1C='correct'|'correct_multi'|'false_identity_match'|'unresolved'|'wrong_product'|'missing'|'correctly_unresolved'|'unsupported_assignment';
export type LeadClass1C='lead_correct'|'lead_multi_correct'|'lead_multi_overreach'|'lead_wrong_product'|'lead_false_identity'|'lead_unsupported'|'lead_unresolved'|'lead_not_gold_value';

const GENERIC=new Set(['the','a','and','with','review','in','1','smart','oled','tv','tvs','air','fryer','fryers','purifier','purifiers','dishwasher','dishwashers','tumble','dryer','dryers','television','series','dual','basket','integrated','heat','pump']);
const core=(s:string|null|undefined)=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9.+\- ]+/g,' ').split(/\s+/).filter(t=>t&&!GENERIC.has(t)));
/** The Phase272 subject rule (unchanged): core-token Jaccard >= 0.6 or a shared digit-bearing token. */
export function sameProduct1C(a:string|null|undefined,b:string|null|undefined):boolean{const x=core(a),y=core(b);if(!x.size||!y.size)return false;let i=0;for(const t of x)if(y.has(t))i++;
 return i/(x.size+y.size-i)>=0.6||[...x].some(t=>/\d/.test(t)&&y.has(t));}
/** Step 1C addition: the extracted name must not contradict the gold brand (its first token), unless it is code-only. */
export function brandConsistent1C(gold:string,extracted:string):boolean{
 const brand=String(gold).trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9+]/g,'');const toks=[...core(extracted)];
 return toks.some(t=>t.replace(/[^a-z0-9+]/g,'')===brand||t.split('+').includes(brand))||toks.every(t=>/\d/.test(t));}
const names=(g:GoldValue1C)=>[g.subject,...(g.acceptedVariants??[]).map(v=>v.name)].filter((x):x is string=>!!x);
export function identity1C(g:GoldValue1C,s:string):'match'|'false_identity'|'no'{
 let fi=false;for(const n of names(g)){if(sameProduct1C(n,s)){if(brandConsistent1C(n,s))return 'match';fi=true;}}return fi?'false_identity':'no';}
const same=(g:{value:number;unit:string},l:{value:number;unit:string})=>Math.abs(l.value-g.value)<=1e-9*Math.max(1,Math.abs(g.value))&&l.unit===g.unit;
const RANK:ItemClass1C[]=['correct','correct_multi','false_identity_match','unresolved','wrong_product','missing'];
export function scoreItem1C(g:GoldValue1C,leads:readonly ScoredLead1C[]):ItemClass1C{
 const L=leads.filter(l=>same(g,l));
 if(g.subjectStatus==='undetermined')return L.some(l=>l.subject||l.subjects?.length)?'unsupported_assignment':L.length?'correctly_unresolved':'missing';
 const cls=L.map((l):ItemClass1C=>{
  if(l.subject){const k=identity1C(g,l.subject);return k==='match'?'correct':k==='false_identity'?'false_identity_match':'wrong_product';}
  if(l.subjects?.length)return l.subjects.some(s=>identity1C(g,s)==='match')?'correct_multi':'wrong_product';
  return 'unresolved';});
 return cls.length?cls.sort((a,b)=>RANK.indexOf(a)-RANK.indexOf(b))[0]:'missing';
}
export function scoreLead1C(l:ScoredLead1C,gold:readonly GoldValue1C[]):LeadClass1C{
 const G=gold.filter(g=>same(g,l));if(!G.length)return 'lead_not_gold_value';
 if(!l.subject&&!l.subjects?.length)return 'lead_unresolved';
 if(l.subjects?.length)return l.subjects.every(s=>G.some(g=>g.subjectStatus!=='undetermined'&&identity1C(g,s)==='match'))?'lead_multi_correct':'lead_multi_overreach';
 if(G.some(g=>g.subjectStatus!=='undetermined'&&identity1C(g,l.subject!)==='match'))return 'lead_correct';
 if(G.some(g=>g.subjectStatus!=='undetermined'&&identity1C(g,l.subject!)==='false_identity'))return 'lead_false_identity';
 if(G.every(g=>g.subjectStatus==='undetermined'))return 'lead_unsupported';
 return 'lead_wrong_product';
}
/** Item transitions between two arms (e.g. B -> C). "newConfidentlyWrong": items wrong (or false identity) in `to` that were
 * not wrong in `from` — the safety measure of Step 1C. */
export function compareArms1C(from:Record<string,ItemClass1C>,to:Record<string,ItemClass1C>){
 const wrong=(c:ItemClass1C)=>c==='wrong_product'||c==='false_identity_match'||c==='unsupported_assignment';
 const good=(c:ItemClass1C)=>c==='correct'||c==='correct_multi'||c==='correctly_unresolved';
 const ids=Object.keys(to);const t:Record<string,number>={};
 for(const id of ids)if(from[id]!==to[id]){const k=from[id]+'>'+to[id];t[k]=(t[k]??0)+1;}
 return {transitions:t,newConfidentlyWrong:ids.filter(id=>wrong(to[id])&&!wrong(from[id])),correctLost:ids.filter(id=>good(from[id])&&!good(to[id])),
  correctGained:ids.filter(id=>!good(from[id])&&good(to[id])),wrongRemoved:ids.filter(id=>wrong(from[id])&&!wrong(to[id]))};
}
