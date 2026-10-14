/** Phase248 — end-to-end advisory journey: plain-English request -> category -> need -> category requirements ->
 * candidates -> evidence -> decision, with the blocking stage made explicit.
 *
 * Reuses Phase125 (budget, hazards), the Phase246 store (products, declarations, retention) and the Phase247
 * category graph (concepts, graded relations, measurement methods). It never ranks: a recommendation needs
 * independent evidence for the user's need on at least two identified candidates, which PEE does not hold yet,
 * so the honest outputs today are clarification, scoped guidance and a research plan.
 * Deterministic for the same text and store state. English-first.
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {relations247} from './phase247_category_relations.js';
import {composeQuestion125,type CategorySchema125} from './phase125_compositional_dialogue_frame.js';

export interface CategoryEntry248 {id:string;aliases:readonly string[];
 /** Weaker single-word cues naming the category's typical product or use ("espresso", "crumpets"). */
 cues?:readonly string[];}
export type Decision248='recommend'|'withhold_insufficient_evidence'|'unsupported_category'|'clarify'|'out_of_scope';
export type Stage248='category'|'need'|'requirements'|'candidates'|'evidence'|'decision';

const norm=(s:string)=>s.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’‘]/g,"'")
 .replace(/[^a-z0-9£$€' ]+/g,' ').replace(/\s+/g,' ').trim();
/** Whole-word phrase positions of each alias in normalized text (plural 's'/'es' tolerated). */
function find(t:string,alias:string):{start:number;end:number}[]{
 const a=norm(alias);if(!a)return [];
 const re=new RegExp(`(?:^| )(${a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:e?s)?)(?= |$)`,'g');
 const out:{start:number;end:number}[]=[];let m:RegExpExecArray|null;
 while((m=re.exec(t))){const start=m.index+(m[0].startsWith(' ')?1:0);out.push({start,end:start+m[1].length});}
 return out;
}
const STOP=new Set(['a','an','the','to','of','for','and','or','with','in','on','my','me','i','it','is','be','that','this','very','so','too','just','into','out','come','comes','get','gets']);
/** Light English stemmer for matching only (easiest->easi, browns->brown, evenly->even, crispy->crisp). */
const stem=(w:string)=>w.replace(/'s$/,'').replace(/(?:iest|ier)$/,'y').replace(/(?:ness|ingly|edly|ing|ed|est|er|ly|y|es|s)$/,'')||w;
/** Order-free match of an alias's content words within a short window (paraphrase tolerance for needs). */
function findLoose(t:string,alias:string):{start:number;end:number}[]{
 const words=t.split(' ');const want=[...new Set(norm(alias).split(' ').filter(w=>w&&!STOP.has(w)).map(stem))];
 if(!want.length)return [];if(want.length===1)return find(t,alias);
 const win=want.length+3;const out:{start:number;end:number}[]=[];
 const offs:number[]=[];let o=0;for(const w of words){offs.push(o);o+=w.length+1;}
 for(let i=0;i<words.length;i++){const span=words.slice(i,i+win).map(stem);
  if(stem(words[i])===want[0]||want.includes(stem(words[i]))){if(want.every(x=>span.includes(x))){
   const last=Math.max(...want.map(x=>i+span.indexOf(x)));out.push({start:offs[i],end:offs[last]+words[last].length});i=last;}}}
 return out;
}
/** Words that name products or categories, not needs: excluded from need scoring. */
const PRODUCT_WORDS=new Set(['machine','maker','fryer','air','airfryer','toaster','oven','coffee','espresso','kettle','blender','appliance','gadget','one','product','buy','best','good','want','need','which','what','home','use','make','thing','things','cook','food']);
/** Concepts described by the request: IDF-weighted overlap between the request's content words and each
 * concept's own descriptions (its aliases and the statements of items carrying it), within one category.
 * Requires two distinct overlapping need words, or one alias word that is rare in the category. */
export const DESCRIBED_THRESHOLD248=2.2;
function describedConcepts(t:string,store:KnowledgeStore246,cats:readonly string[],registry:readonly CategoryEntry248[]){
 const out:{key:string;alias:string;start:number;end:number}[]=[];
 const catWords=new Set(registry.flatMap(r=>[...r.aliases,...(r.cues??[])]).flatMap(a=>norm(a).split(' ')).map(stem));
 const reqTokens=new Set(t.split(' ').filter(w=>w&&!STOP.has(w)).map(stem).filter(w=>w.length>=3&&!PRODUCT_WORDS.has(w)&&!catWords.has(w)));
 for(const c of cats){
  const items=store.categoryItems246(c).filter(i=>i.concept);
  const docs=new Map<string,{alias:Set<string>;text:Set<string>;kind:string}>();
  for(const i of items){const d=docs.get(i.concept!.id)??{alias:new Set(),text:new Set(),kind:i.concept!.kind};
   for(const a of i.concept!.aliases)for(const w of norm(a).split(' '))if(w&&!STOP.has(w))d.alias.add(stem(w));
   for(const w of norm(i.statement).split(' '))if(w&&!STOP.has(w))d.text.add(stem(w));
   docs.set(i.concept!.id,d);}
  const N=docs.size;const df=new Map<string,number>();
  for(const d of docs.values())for(const w of new Set([...d.alias,...d.text]))df.set(w,(df.get(w)??0)+1);
  const idf=(w:string)=>Math.log((N+1)/((df.get(w)??0)+0.5));
  for(const [id,d] of docs){
   const hit=[...reqTokens].filter(w=>d.alias.has(w)||d.text.has(w));
   const score=hit.reduce((a,w)=>a+idf(w)*(d.alias.has(w)?1.5:1),0);
   const aliasHit=hit.some(w=>d.alias.has(w));
   if(hit.length>=2&&aliasHit&&score>=DESCRIBED_THRESHOLD248)out.push({key:`${c}|${id}|${d.kind}`,alias:'~'+hit.join('+'),start:-1,end:-1});
  }
 }
 return out;
}
/** Longest-match resolution: a match contained in a longer match of another entry is dropped
 * ("toaster" inside "toaster oven"). */
function longestMatches<T>(t:string,entries:readonly {key:T;aliases:readonly string[]}[],loose=false){
 const hits:{key:T;alias:string;start:number;end:number}[]=[];
 for(const e of entries)for(const al of e.aliases)for(const p of (loose?findLoose:find)(t,al))hits.push({key:e.key,alias:al,...p});
 return hits.filter(h=>!hits.some(o=>o!==h&&o.key!==h.key&&o.start<=h.start&&o.end>=h.end&&(o.end-o.start)>(h.end-h.start)));
}
const GENERIC=/^(?:something|anything|one|an? appliance|appliances?|products?|things?|gadgets?|a gadget|a product|stuff|kit|equipment|it|this|that|the kitchen|kitchen)$/;
/** A product term the user names but the registry does not know ("laptop", "running shoes"). */
function namedProductTerm(t:string):string|null{
 const m=/\b(?:best|recommend|which|what|choose|buy|need|want|suggest)\s+(?:is the best |s the best |a good |the best |a |an |the |me a |me an |me |some )?([a-z][a-z' ]{1,30}?)(?= for| to| that| which| with| under| from| is| are| please|$| and| or|\?)/.exec(t);
 if(!m)return null;const term=m[1].trim().replace(/^(?:good|new|cheap|decent|great) /,'');
 return GENERIC.test(term)||/^(?:to|is|are|should|do|i|my|you|it)\b/.test(term)?null:term;
}

export interface Journey248 {
 schema:'pee248.journey.v1';text:string;
 stages:{
  category:{categoryId:string|null;basis:'explicit_alias'|'cue_inferred'|'need_inferred'|'ambiguous'|'unresolved';candidates:string[];namedUnknownTerm:string|null;excluded:string[]};
  need:{concepts:{id:string;categoryId:string;matched:string;kind:string|null}[];budget:{currency:string;min:number|null;max:number|null}|null;hazards:string[]};
  requirements:{measuredBy:{conceptId:string;method:string;support:string;source:string|null}[];cautions:{attribute:string;conceptId:string;kind:string;support:string;note:string}[];
   unmeasuredConcepts:string[];categoryHasKnowledge:boolean};
  candidates:{active:number;withDeclaredAttributes:number;retainedDeclarations:number;budgetApplicable:boolean};
  evidence:{evidenceSupportedRelations:number;independentResultsForNeed:number;methodReferences:number};
 };
 decision:Decision248;blockingStage:Stage248|null;reasons:string[];clarificationQuestions:string[];researchPlan:string[];
 rankingAuthorized:false;recommendation:null|{productIds:string[];basis:string};
}

/** Runs the journey for one request. `registry` lists the categories PEE knows by name (with or without
 * category knowledge); concepts and relations come from the store. */
export function runJourney248(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[]):Journey248{
 if(typeof text!=='string'||text.length<3||text.length>2000)throw Error('248_invalid_request');
 const t=norm(text);
 // ---- category: explicit names (longest match), else inferred from need concepts of exactly one category
 // A category named under negation ("without a deep fat fryer", "rather not use a deep fryer") is excluded, not chosen.
 const negated=(start:number)=>/(?:^| )(?:without|not|no|instead of|rather than|other than|avoid|avoiding|don't want|do not want|rather not use|not using|never)(?: \S+){0,2} ?$/.test(t.slice(0,start).trimEnd()+' ');
 const allNamed=longestMatches(t,registry.map(r=>({key:r.id,aliases:r.aliases})));
 // "...don't want a toaster whose sides get hot": a negated name followed by a qualifying clause is a constraint on
 // that category, not its exclusion.
 const qualified=(end:number)=>/^ (?:whose|that|which|with|where)\b/.test(t.slice(end));
 const isExcluded=(h:{start:number;end:number})=>negated(h.start)&&!qualified(h.end);
 const named=allNamed.filter(h=>!isExcluded(h));
 const excludedCategories=[...new Set(allNamed.filter(isExcluded).map(h=>h.key))].sort();
 const explicit=[...new Set(named.map(h=>h.key))].filter(c=>!excludedCategories.includes(c)||named.some(h=>h.key===c)).sort();
 const cueHits=longestMatches(t,registry.filter(r=>r.cues?.length).map(r=>({key:r.id,aliases:r.cues!}))).filter(h=>!negated(h.start));
 const cueCats=[...new Set(cueHits.map(h=>h.key))].filter(c=>!excludedCategories.includes(c)).sort();
 const knowledgeCats=registry.filter(r=>store.categoryItems246(r.id).length>0).map(r=>r.id);
 const conceptEntries=knowledgeCats.flatMap(c=>{const seen=new Set<string>();
  return store.categoryItems246(c).filter(i=>i.concept&&!seen.has(i.concept.id)&&!!seen.add(i.concept.id))
   .map(i=>({key:`${c}|${i.concept!.id}|${i.concept!.kind}`,aliases:i.concept!.aliases}));});
 const conceptHits=[...longestMatches(t,conceptEntries,true),...describedConcepts(t,store,knowledgeCats,registry)];
 let categoryId:string|null=null;let basis:Journey248['stages']['category']['basis']='unresolved';
 if(explicit.length===1){categoryId=explicit[0];basis='explicit_alias';}
 else if(explicit.length>1)basis='ambiguous';
 else if(cueCats.length===1){categoryId=cueCats[0];basis='cue_inferred';}
 else if(cueCats.length>1)basis='ambiguous';
 else{const cats=[...new Set(conceptHits.map(h=>h.key.split('|')[0]))].filter(c=>!excludedCategories.includes(c));
  if(cats.length===1){categoryId=cats[0];basis='need_inferred';}else if(cats.length>1)basis='ambiguous';}
 const namedUnknownTerm=basis==='unresolved'?namedProductTerm(t):null;
 // ---- need: concepts of the resolved category; budget and hazards from Phase125
 const concepts=categoryId?[...new Map(conceptHits.filter(h=>h.key.startsWith(categoryId+'|')).map(h=>{const [c,id,kind]=h.key.split('|');
  return [id,{id,categoryId:c,matched:h.alias,kind:kind||null}];})).values()].sort((a,b)=>a.id.localeCompare(b.id)):[];
 const schemas:CategorySchema125[]=(registry.length?registry:[{id:'none',aliases:['none']}]).map(r=>({id:r.id,aliases:[...r.aliases],aspects:[],schemaReviewId:'registry_248'}));
 const frame=composeQuestion125(text,schemas);
 const budget=frame.userBudget;
 const hazards=frame.hazards.filter(h=>!['unresolved_decision_goal','multiple_explicit_categories'].includes(h));
 // ---- requirements from the category graph
 const rels=categoryId?relations247(store,categoryId):[];
 const items=categoryId?store.categoryItems246(categoryId):[];
 const conceptOfRef=(ref:string)=>items.find(i=>'item:'+i.itemId===ref)?.concept?.id??null;
 const itemOfRef=(ref:string)=>items.find(i=>'item:'+i.itemId===ref);
 const wanted=new Set(concepts.map(c=>c.id));
 const measuredBy=rels.filter(r=>r.kind==='measured_by'&&wanted.has(conceptOfRef(r.to)??'')).map(r=>({conceptId:conceptOfRef(r.to)!,
  method:(itemOfRef(r.from)?.statement??r.from).slice(0,200),support:r.support,
  source:r.sourceRevisionIds[0]?((store.db.prepare('SELECT url FROM revisions WHERE revision_id=?').get(r.sourceRevisionIds[0]) as {url:string}|undefined)?.url??null):null}));
 const cautions=rels.filter(r=>r.from.startsWith('attr:')&&wanted.has(conceptOfRef(r.to)??'')).map(r=>({attribute:r.from.slice(5),conceptId:conceptOfRef(r.to)!,
  kind:r.kind,support:r.support,note:r.qualification}));
 const unmeasured=[...wanted].filter(c=>!measuredBy.some(m=>m.conceptId===c)).sort();
 const categoryHasKnowledge=!!categoryId&&items.length>0;
 // ---- candidates and evidence
 const products=categoryId?store.products246({category:categoryId}):[];
 const withAttrs=products.filter(p=>!!store.db.prepare('SELECT 1 FROM revision_properties WHERE product_id=?').get(p)).length;
 const retained=products.reduce((a,p)=>a+store.declarations246(p).length,0);
 const evidenceSupported=rels.filter(r=>r.support==='evidence_supported'&&wanted.has(conceptOfRef(r.to)??'')).length;
 // Independent product results for the need: retained declarations from independent original-test sources
 // that are verified for a purpose. None exist until test results are acquired under reviewed rights.
 const independentResults=products.reduce((a,p)=>a+store.declarations246(p).filter(d=>d.evidenceRole==='test_publisher_declaration_unreviewed'&&d.state==='verified_for_purpose').length,0);
 // ---- decision
 const reasons:string[]=[];const questions:string[]=[];const plan:string[]=[];
 let decision:Decision248;let blocking:Stage248|null;
 const goalQuestion=(cat:string)=>{const goals=store.categoryItems246(cat).filter(i=>i.section==='user_goals'&&i.concept);
  return goals.length?`What matters most to you: ${goals.slice(0,4).map(g=>g.statement.replace(/\.$/,'').toLowerCase()).join('; or ')}?`:`What do you mainly want the ${cat.replace(/_/g,' ')} to do for you?`;};
 if(basis==='ambiguous'){decision='clarify';blocking='category';
  const opts=(explicit.length>1?explicit:[...new Set(conceptHits.map(h=>h.key.split('|')[0]))]).map(c=>c.replace(/_/g,' '));
  reasons.push('several product categories fit the request');questions.push(`Are you deciding between ${opts.join(' and ')}, or is one of them already chosen?`);}
 else if(!categoryId&&namedUnknownTerm){decision='out_of_scope';blocking='category';
  reasons.push(`"${namedUnknownTerm}" is not a product category PEE holds knowledge or products for`);plan.push(`category onboarding needed before advising on "${namedUnknownTerm}"`);}
 else if(!categoryId){decision='clarify';blocking='category';reasons.push('no product category can be established from the request');
  questions.push('Which kind of product are you looking for, and what should it help you do?');}
 else if(!categoryHasKnowledge){decision='unsupported_category';blocking='requirements';
  reasons.push(`no category knowledge for ${categoryId}: goals, mechanisms and test methods are not modelled`);
  plan.push(`model ${categoryId}: user goals, mechanisms, measurable outcomes and professional test methods`);
  if(products.length)plan.push(`${products.length} product identities already known for ${categoryId}`);}
 else{
  if(!concepts.length){questions.push(goalQuestion(categoryId));reasons.push('need not specific enough to select category requirements');}
  if(unmeasured.length)plan.push(`find an original test method for: ${unmeasured.join(', ')}`);
  for(const m of measuredBy)if(m.support==='method_reference')plan.push(`obtain independent results measured by: ${m.method.slice(0,90)}`);
  if(budget&&!retained)reasons.push('budget cannot be applied: no prices are retained (rights not established)');
  if(products.length<2)plan.push(`discover more ${categoryId} candidates (only ${products.length} identified)`);
  if(evidenceSupported>0&&independentResults>0&&products.length>=2&&concepts.length){
   // Even then, the order comes from a reviewed, signed projection (Phase180), never from this function.
   decision='withhold_insufficient_evidence';blocking='decision';reasons.push('evidence present but ranking requires a reviewed, signed decision snapshot (Phase180)');
  }else{
   decision='withhold_insufficient_evidence';
   blocking=!concepts.length?'need':evidenceSupported===0&&independentResults===0?'evidence':products.length<2?'candidates':'evidence';
   if(!evidenceSupported)reasons.push('no evidence-supported relation for the stated need');
   if(!independentResults)reasons.push('no independent test results for any candidate');
  }
 }
 return {schema:'pee248.journey.v1',text,
  stages:{category:{categoryId,basis,candidates:explicit,namedUnknownTerm,excluded:excludedCategories},need:{concepts,budget,hazards},
   requirements:{measuredBy,cautions,unmeasuredConcepts:unmeasured,categoryHasKnowledge},
   candidates:{active:products.length,withDeclaredAttributes:withAttrs,retainedDeclarations:retained,budgetApplicable:retained>0},
   evidence:{evidenceSupportedRelations:evidenceSupported,independentResultsForNeed:independentResults,methodReferences:measuredBy.filter(m=>m.support==='method_reference').length}},
  decision,blockingStage:blocking,reasons,clarificationQuestions:questions,researchPlan:plan,rankingAuthorized:false,recommendation:null};
}

/** Scores journeys against a benchmark: category, concepts, decision and budget, plus the blocking-stage profile. */
export function scoreJourneys248(cases:readonly {id:string;expectedCategory:string|null;expectedConcepts:string[];expectedDecision:string;expectedBudget?:{currency:string;max:number}}[],
 run:(text:string)=>Journey248,texts:Record<string,string>){
 const rows=cases.map(c=>{const j=run(texts[c.id]);const cat=j.stages.category.basis==='ambiguous'?'ambiguous':j.stages.category.categoryId;
  const got=new Set(j.stages.need.concepts.map(x=>x.id));const exp=new Set(c.expectedConcepts);
  const tp=[...exp].filter(x=>got.has(x)).length;
  return {id:c.id,categoryOk:cat===c.expectedCategory,decisionOk:j.decision===c.expectedDecision,
   conceptTp:tp,conceptExpected:exp.size,conceptFp:[...got].filter(x=>!exp.has(x)).length,
   budgetOk:c.expectedBudget?!!j.stages.need.budget&&j.stages.need.budget.currency===c.expectedBudget.currency&&j.stages.need.budget.max===c.expectedBudget.max:true,
   gotCategory:cat,gotConcepts:[...got],gotDecision:j.decision,blockingStage:j.blockingStage,rankingAuthorized:j.rankingAuthorized};});
 const n=rows.length;const sum=(k:'conceptTp'|'conceptExpected'|'conceptFp')=>rows.reduce((a,r)=>a+r[k],0);
 const blocking:Record<string,number>={};for(const r of rows)blocking[String(r.blockingStage)]=(blocking[String(r.blockingStage)]??0)+1;
 return {cases:n,categoryAccuracy:+(rows.filter(r=>r.categoryOk).length/n).toFixed(3),decisionAccuracy:+(rows.filter(r=>r.decisionOk).length/n).toFixed(3),
  conceptRecall:sum('conceptExpected')?+(sum('conceptTp')/sum('conceptExpected')).toFixed(3):null,
  conceptPrecision:(sum('conceptTp')+sum('conceptFp'))?+(sum('conceptTp')/(sum('conceptTp')+sum('conceptFp'))).toFixed(3):null,
  budgetAccuracy:+(rows.filter(r=>r.budgetOk).length/n).toFixed(3),unsafeRankings:rows.filter(r=>r.rankingAuthorized).length,blocking,rows};
}
