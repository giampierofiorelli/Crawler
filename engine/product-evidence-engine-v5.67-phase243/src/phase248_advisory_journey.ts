/** Phase248 — end-to-end advisory journey: plain-English request -> category -> need -> category requirements ->
 * candidates -> evidence -> decision, with the blocking stage made explicit.
 *
 * Reuses Phase125 (budget, hazards), the Phase246 store (products, declarations, retention) and the Phase247
 * category graph (concepts, graded relations, measurement methods). It never ranks: a recommendation needs
 * independent evidence for the user's need on at least two identified candidates, which PEE does not hold yet,
 * so the honest outputs today are clarification, scoped guidance and a research plan.
 * Deterministic for the same text and store state. English-first.
 */
import {negationAt,scopeVocabulary,stanceAt} from './language_scope.js';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {type SafetyNotice248,matchNotice248,categorySafetyProfile248} from './phase248_safety_notices.js';
import {relations247} from './phase247_category_relations.js';
import {composeQuestion125,type CategorySchema125} from './phase125_compositional_dialogue_frame.js';

export interface CategoryEntry248 {id:string;aliases:readonly string[];
 /** Phrases in which an alias denotes a part or accessory, not this category ("milk steamer", "steamer basket"). */
 partPhrases?:readonly string[];
 /** Weaker single-word cues naming the category's typical product or use ("espresso", "crumpets"). */
 cues?:readonly string[];
 /** Phase250: counterexamples per need concept: phrases in which a matching word does not express that need
  * ("pressure cooker" is not brew pressure; "hard to find" is not hard water). A match inside such a phrase, or a
  * paraphrase match in a text containing one, is dropped. */
 needCounterexamples?:Readonly<Record<string,readonly string[]>>;
 /** Phase250: aliases that name this category only when one of the context words also occurs ("grinder" with "coffee"). */
 aliasContext?:Readonly<Record<string,readonly string[]>>;
 /** Phase250: needs a declared specification can check, mapped to SPEC_CRITERIA249 decision keys. */
 needCriteria?:Readonly<Record<string,readonly string[]>>;
 /** Phase252: the clarification a taught need raises when the user has not said what it requires ("How many hours of
  * playback do you need between charges?"); asked only when that need is recognised. */
 needQuestions?:Readonly<Record<string,string>>;}
export type Decision248='recommend'|'withhold_insufficient_evidence'|'unsupported_category'|'clarify'|'out_of_scope';
export type Stage248='category'|'need'|'requirements'|'candidates'|'evidence'|'decision';

const norm=(s:string)=>s.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’‘]/g,"'")
 .replace(/[^a-z0-9£$€' ]+/g,' ').replace(/\s+/g,' ').trim();
/** Whole-word phrase positions of each alias in normalized text (plural 's'/'es' tolerated). */
function find(t:string,alias:string,singular=false):{start:number;end:number}[]{
 const a0=norm(alias);if(!a0)return [];
 // Phase252 (development): a plural category name also names the singular ("earbuds" / "earbud"); category names
 // only, since for cues and need phrases the singular often means something else ("grounds" / "ground").
 const a=singular&&/[^s]s$/.test(a0)&&a0.length>4?a0.slice(0,-1):a0;
 const re=new RegExp(`(?:^| )(${a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:e?s)?)(?= |$)`,'g');
 const out:{start:number;end:number}[]=[];let m:RegExpExecArray|null;
 while((m=re.exec(t))){const start=m.index+(m[0].startsWith(' ')?1:0);out.push({start,end:start+m[1].length});}
 return out;
}
const STOP=new Set(['a','an','the','to','of','for','and','or','with','in','on','my','me','i','it','is','be','that','this','very','so','too','just','into','out','come','comes','get','gets',
 // Phase249: function words that real, longer requests contain and that must never count as need evidence.
 'are','was','were','been','being','am','do','does','did','done','have','has','had','having','will','would','could','should','can','may','might','must',
 'not','no','nor','but','if','then','than','as','at','by','from','up','down','over','under','about','above','before','again','also','any','all',
 'some','such','each','every','other','own','same','both','few','more','most','much','many','only','there','here','when','where','why','how','who','whom',
 'whose','which','what','these','those','they','them','their','we','us','our','you','your','he','she','his','her','its','term','terms',
 'really','actually','quite','still','yet','ever','now','currently','recently','etc','lots','bit','kind','sort']);
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
/** Phase250: needs any product category can serve (the generic needs of evaluation/phase250/need-catalogue.json). They
 * are recognised as needs but never, alone, identify the product category. */
/** Phase250: requests longer than this many words (real questions with background) get stricter need handling. */
export const LONG_REQUEST_WORDS250=40;
export const GENERIC_NEEDS250:ReadonlySet<string>=new Set(['small_kitchen','cleaning_effort','low_noise','low_maintenance','ease_of_use',
 'durability','occasional_use','batch_capacity','portability','versatility']);
/** Words that name products or categories, not needs: excluded from need scoring. */
const PRODUCT_WORDS=new Set(['machine','maker','fryer','air','airfryer','toaster','oven','coffee','espresso','kettle','blender','appliance','gadget','one','product','buy','best','good','want','need','which','what','home','use','make','thing','things','cook','food']);
/** Concepts described by the request: IDF-weighted overlap between the request's content words and each
 * concept's own descriptions (its aliases and the statements of items carrying it), within one category.
 * Requires two distinct overlapping need words, or one alias word that is rare in the category. */
export const DESCRIBED_THRESHOLD248=2.2;
// R3-P: the S80 negator and clause-word sets (NEGATORS80, CLAUSE80) are retired into the shared scope (src/language_scope.ts,
// vocabulary in the quantity-knowledge pack language.en.scope).
function describedConcepts(t:string,store:KnowledgeStore246,cats:readonly string[],registry:readonly CategoryEntry248[]){
 const out:{key:string;alias:string;start:number;end:number}[]=[];
 // Phase250 (development, after set 3): on long requests the paraphrase overlap mostly fired by chance (real sets and
 // set 3 together: 2-6 correct against 8-12 false needs per arm), so long requests use explicit need phrases only.
 const longRequest=t.split(' ').length>LONG_REQUEST_WORDS250;
 const catWords=new Set(registry.flatMap(r=>[...r.aliases,...(r.cues??[])]).flatMap(a=>norm(a).split(' ')).map(stem));
 // Phase250: product words are excluded by their surface form (singular or plural). They were compared after
 // stemming, so "machines", "makers", "toasters" and "blenders" (stems machin, mak, toast, blend) slipped through
 // and produced chance need matches ("machin+hard+long" -> limescale).
 const productWord=(w:string)=>PRODUCT_WORDS.has(w)||PRODUCT_WORDS.has(w.replace(/s$/,''))||PRODUCT_WORDS.has(w.replace(/es$/,''));
 // S80: words inside the scope of a negation ("without using a lot of water", "not too loud") are never positive
 // evidence for a need: in the S80 first run "proper+without+wat" inferred a drying need from "without using a lot of
 // water". The scope runs from the negator to the next clause boundary, over at most four content words.
 const ws=t.split(' ');const negated=new Set<number>();
 // R3-P: the scope is the shared one (src/language_scope.ts): a word is negated when a negator governs it
 {let pos=0;const sv=scopeVocabulary();for(let i=0;i<ws.length;i++){if(ws[i]&&(sv.negators.includes(ws[i])||/n't$/.test(ws[i])||negationAt(t,pos,sv)))negated.add(i);pos+=ws[i].length+1;}}
 const reqTokens=new Set(ws.filter((w,i)=>w&&!negated.has(i)&&!STOP.has(w)&&!productWord(w)).map(stem).filter(w=>w.length>=3&&!PRODUCT_WORDS.has(w)&&!catWords.has(w)));
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
   // Long requests (real questions with background) produce chance co-occurrences: they need three overlapping words.
   if(!longRequest&&hit.length>=(reqTokens.size>20?3:2)&&aliasHit&&score>=DESCRIBED_THRESHOLD248)out.push({key:`${c}|${id}|${d.kind}`,alias:'~'+hit.join('+'),start:-1,end:-1});
  }
 }
 return out;
}
/** Longest-match resolution: a match contained in a longer match of another entry is dropped
 * ("toaster" inside "toaster oven"). */
function longestMatches<T>(t:string,entries:readonly {key:T;aliases:readonly string[]}[],loose=false,singular=false){
 const hits:{key:T;alias:string;start:number;end:number}[]=[];
 for(const e of entries)for(const al of e.aliases)for(const p of (loose?findLoose(t,al):find(t,al,singular)))hits.push({key:e.key,alias:al,...p});
 // Phase269 (development D1): a loose hit that skips words ("cooking [results] for one") does not suppress a contiguous
 // hit of another concept inside it ("cooking results").
 const gapped=(h:{alias:string;start:number;end:number})=>!new RegExp(`^${norm(h.alias).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:e?s)?$`).test(t.slice(h.start,h.end));
 return hits.filter(h=>!hits.some(o=>o!==h&&o.key!==h.key&&o.start<=h.start&&o.end>=h.end&&(o.end-o.start)>(h.end-h.start)&&!(gapped(o)&&!gapped(h))));
}
const GENERIC=/^(?:something|anything|one|ones|new one|an? appliance|appliances?|products?|things?|gadgets?|a gadget|a product|stuff|kit|equipment|it|this|that|the kitchen|kitchen|type|kind|model|brand|options?|features?|machines?|devices?|units?)$/;
// ---- Phase253: purchase target. The product being bought is the head of the noun phrase that follows a buying
// construction ("looking for X", "need X", "which X", "replace ... with X"), or that opens the title. A category name
// elsewhere in the text (owned product, context, a part's host) is not the purchase. Generic heads ("one", "way") and
// proper names or model codes ("Rebel T5i") decide nothing; then the category stage decides as before.
export interface PurchaseTarget253 {kind:'category'|'other'|'ambiguous'|'none';category:string|null;other:string|null;
 basis:'purchase_phrase_head'|'category_stage';phrases:{phrase:string;head:string;category:string|null;linked?:boolean}[]}
const ANCHOR253=/(?:^| )(?:looking for|look for|looking at|shopping for|searching for|in the market for|recommendations? for|recommend(?:ed)?|suggestions? for|suggest|need|needs|want|wanted|buy|buying|purchase|purchasing|get|getting|choose|choosing|which|what|best|good|cheap|decent|replace(?: \S+){0,5} with|replacement for|upgrade to|switch to|considering|thinking of getting|alternatives? to)(?= |$)/g;
const SKIP253=/^(?:(?:kind|type|sort|size|brand|make|model|style|set|pair|couple|piece) of |(?:a|an|the|some|any|new|another|second|replacement|good|great|decent|cheap|budget|quality|best|nice|simple|small|large|big) )+/;
const BOUNDARY253=new Set(['for','to','that','which','who','with','without','in','on','of','from','under','over','so','because','and','or','but','i','me','my','we','our','you','your','they','them','their','he','she','his','her','its','us','is','are','was','were','be','been','can','could','should','will','would','than','vs','versus','as','at','by','if','when','while','it','this','these','those','there','do','does','did','have','has','had','suitable','compatible','capable','ideal','similar','like','please','also','too','now','then','just','not','no','into','onto','inside','around','about','one','ones','where','how','what','why','whose','enough','big','bigger','small','smaller','large','larger','compact','quiet','cheap','cheaper','decent','powerful','reliable','durable','light','lighter','heavy','safe','fast','quick','affordable','expensive','sized','easy','better','best','good','great','nice','ideal','perfect']);
/** The evaluative adjectives of BOUNDARY253 (the same words, not a new list) and the degree words that grade them. */
const PRENOMINAL253=new Set(['big','bigger','small','smaller','large','larger','compact','quiet','cheap','cheaper','decent','powerful','reliable','durable','light','lighter','heavy','safe','fast','quick','affordable','expensive','easy','better','best','good','great','nice','ideal','perfect']);
const DEGREE253=/^(?:most|least|more|less|very|really|super|extra|quite)$/;
const GENERIC_HEAD253=/^(?:way|ways|method|methods|technique|techniques|idea|ideas|option|options|one|ones|thing|things|something|anything|recommendation|recommendations|advice|model|models|brand|brands|type|types|kind|size|product|products|appliance|appliances|machine|machines|device|devices|feature|features|material|materials|place|time|help|info|information|budget|price|prices|deal|deals|setup|set|kit|stuff|equipment|gear|tips|tip|difference|differences|guide|review|reviews|answer|question|alternative|alternatives|replacement|upgrade|purchase)$/;
export function purchaseTarget253(text:string,registry:readonly CategoryEntry248[],allowed?:ReadonlySet<string>):PurchaseTarget253{
 const phrases:{phrase:string;head:string;category:string|null;linked?:boolean}[]=[];
 // Categories the category stage set aside (excluded, rejected, alias without its context) cannot be the purchase.
 const blocked=(np:string)=>!!allowed&&longestMatches(np,registry.map(r=>({key:r.id,aliases:r.aliases})),false,true).some(h=>h.end===np.length&&!allowed.has(h.key));
 const categoryAt=(np:string):string|null=>{const hits=longestMatches(np,registry.map(r=>({key:r.id,aliases:r.aliases})),false,true);
  const end=hits.filter(h=>h.end===np.length&&!(registry.find(r=>r.id===h.key)?.partPhrases??[]).some(pp=>find(np,pp).some(p=>p.start<=h.start&&p.end>=h.end)));
  const ok=end.filter(h=>!allowed||allowed.has(h.key));
  return ok.length?ok.sort((a,b)=>(b.end-b.start)-(a.end-a.start))[0].key:null;};
 const segments=text.split(/[.?!;:\n()\[\]]+|,| [-–—]+ /);
 segments.forEach((raw,si)=>{const seg=norm(raw);if(!seg)return;
  const starts:number[]=[];let m:RegExpExecArray|null;const re=new RegExp(ANCHOR253.source,'g');
  // A negated buying construction ("I don't want a toaster") introduces no purchase.
  while((m=re.exec(seg))){
   if(/(?:^| )(?:don't|dont|do not|not|never|no|won't|wouldn't)(?: \S+)? ?$/.test(seg.slice(0,m.index)+' '))continue;
   // need / want / get name a purchase only with an article ("need an amp"), not an outcome ("want even toast", "get hot").
   // which / what open a purchase question; inside a sentence they are usually relative ("materials which stay").
   if(/^ ?(?:which|what)$/.test(m[0])&&!/(?:^|(?:^| )(?:of|about|on|know|sure|wondering|decide|deciding|unsure|advise|recommend|tell me))\s*$/.test(seg.slice(0,m.index)))continue;
   if(/^ ?(?:need|needs|want|wanted|get|getting)$/.test(m[0])&&!/^(?:a|an|the|some|any|one|another|second|new|two|2)\b/.test(seg.slice(m.index+m[0].length+1)))continue;
   starts.push(m.index+m[0].length+1);}
  // A title that opens with a noun phrase ("Baking sheet in air fryer") states what is being looked for.
  if(si===0&&!starts.includes(0)&&!new RegExp('^'+ANCHOR253.source.replace(/^\(\?:\^\| \)/,'')).test(seg)&&!/^(?:how|why|what|when|where|who|can|could|is|are|was|do|does|did|should|would|will|i|i'm|im|my|we|our|you|it|this|there|has|have|any|help|please)\b/.test(seg))starts.push(0);
  for(const st of starts){let rest=seg.slice(Math.min(st,seg.length)).trim();
   const replacing=st>0&&/(?:^| )replace(?: \S+){0,5} with $/.test(seg.slice(0,st));
   const replaced=replacing?seg.slice(0,st).replace(/^.*?replace/,''):'';
   for(let k=0;k<3&&rest;k++){
    rest=rest.replace(SKIP253,'');const toks=rest.split(' ');const np:string[]=[];let i=0;
    for(;i<toks.length&&np.length<6;i++){
     // S85 (owner boundary check: "most reliable dishwasher" was out of scope): before the head, an evaluative adjective
     // of the boundary list ("quiet", "reliable"), with a degree word ("most", "very"), modifies the product; after it,
     // the adjective still ends the phrase ("a dishwasher quiet enough").
     if(!np.length&&(PRENOMINAL253.has(toks[i])||(DEGREE253.test(toks[i])&&PRENOMINAL253.has(toks[i+1]??''))))continue;
     if(BOUNDARY253.has(toks[i]))break;
     // Reality check 2026-10-16: an article inside the phrase starts a new noun phrase, so the word before it is a verb
     // or preposition, not part of the purchase ("which espresso machine makes the best ..." names an espresso machine).
     if(np.length&&/^(?:a|an|the)$/.test(toks[i])){np.pop();break;}
     // Phase269 (development D7): after a category name, an adverb or a verb starts the predicate ("which air fryer
     // actually cooks ..."), not a longer noun phrase. Phase271 adds the verbs of development requests WD3 and PD2.
     // S86b (capability audit, shared gap: "a dishwasher quieter than 44 dB(A)" and "a dishwasher using less than 1 kWh" were
     // out of scope): after a category name, a comparative followed by "than" or an -ing verb starts the predicate too.
     if(np.length&&categoryAt(np.join(' '))&&(toks[i+1]==='than'||/^[a-z]{2,}ing$/.test(toks[i])))break;
     if(np.length&&categoryAt(np.join(' '))&&(/ly$/.test(toks[i])||/^(?:cooks|makes|gives|uses|has|heats|browns|produces|works|runs|costs|keeps|lets|takes|needs|does|dries|gets)$/.test(toks[i])))break;
     np.push(toks[i]);}
    if(!np.length)break;
    // A title led by a verb form ("Using the outlet ...") or by a relation noun ("Meaning of ...") names no purchase.
    if(st===0&&k===0&&!starts.slice(0,-1).includes(0)&&(/ing$/.test(np[0])&&/^(?:the|a|an|this|that|these|those|some|any)$/.test(np[1]??'')||toks[i]==='of'))break;
    while(np.length>1&&/(?:ed|ing)$/.test(np[np.length-1])&&!categoryAt(np.join(' ')))np.pop();
    const phrase=np.join(' '),head=np[np.length-1];
    // Proper names and model codes ("Canon", "WF-1000XM3") name a product, not a type: they decide nothing here.
    const rawHead=raw.match(new RegExp(`(?:^|[^A-Za-z0-9])(${head.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})(?![A-Za-z0-9])`,'i'))?.[1]??head;
    const rawNp=raw.match(new RegExp(np.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('[^A-Za-z0-9]+'),'i'))?.[0]??'';
    const capitals=(rawNp.match(/(?:^|[^A-Za-z])[A-Z][a-z]/g)??[]).length;
    const proper=/\d/.test(head)||capitals>=2||(/^[A-Z]/.test(rawHead)&&raw.trim().indexOf(rawHead)>0&&!/^[A-Z]/.test(raw.trim().split(/\s+/)[1]??''));
    let cat=categoryAt(phrase);
    // Phase269 (development D3): "the crispiest chips possible from an air fryer" - an outcome obtained from a named
    // category is a purchase of that category ('from' or 'using' only: "a tray in an air fryer" is an accessory).
    if(!cat){const after=seg.slice(Math.min(st,seg.length)).trim();const at=after.indexOf(phrase);
     const tail=at>=0?after.slice(at+phrase.length):'';const m2=/^ (?:\S+ ){0,2}?(?:from|using) (?:a|an|my|the) (.{3,60})$/.exec(tail);
     if(m2){const words=m2[1].split(' ');for(let n=Math.min(4,words.length);n>0&&!cat;n--){const c2=categoryAt(words.slice(0,n).join(' '));if(c2)cat=c2;}}}
    if(cat)phrases.push({phrase,head,category:cat});
    else if(blocked(phrase)){}
    else if(!proper&&head.length>=3&&/^[a-z]+$/.test(head)&&!GENERIC_HEAD253.test(head)&&!GENERIC.test(phrase)){
     // Linked to a category: it modifies the head ("headphone amp"), or it is what is being replaced.
     const names=registry.map(r=>({key:r.id,aliases:r.aliases}));
     const linked=longestMatches(phrase,names,false,true).length>0||(replacing&&longestMatches(replaced,names,false,true).length>0);
     phrases.push({phrase,head,category:null,linked});}
    // Coordinated alternatives ("an air fryer or a toaster oven") are further purchase phrases.
    if(!['or','vs','versus','and'].includes(toks[i]??''))break;rest=toks.slice(i+1).join(' ');
   }
  }
 });
 const t0=norm(text);const names=registry.map(r=>({key:r.id,aliases:r.aliases}));
 const nameHits=longestMatches(t0,names,false,true);
 // ... or the category is its complement nearby ("tray to put my air fryer on", "the cable ... to the headset").
 // Phase253 development: a category named within the next 10 words of the text ("tray can I put my air fryer
 // on", "mortar and pestle replaces a blender") is the purchase's complement, with or without a preposition.
 for(const p of phrases)if(!p.category&&!p.linked){const toks=t0.split(' ');
  for(let i=0;i<toks.length&&!p.linked;i++)if(toks[i]===p.head){const off=toks.slice(0,i+1).join(' ').length+1;const win=toks.slice(i+1,i+11).join(' ');
   p.linked=nameHits.some(h=>h.start>=off&&h.start<off+win.length);}}
 const cats=[...new Set(phrases.filter(p=>p.category).map(p=>p.category!))];
 const others=phrases.filter(p=>!p.category);
 const anyName=longestMatches(norm(text),registry.map(r=>({key:r.id,aliases:r.aliases})),false,true).length>0;
 if(cats.length===1)return {kind:'category',category:cats[0],other:null,basis:'purchase_phrase_head',phrases};
 if(cats.length>1)return {kind:'ambiguous',category:null,other:null,basis:'purchase_phrase_head',phrases};
 // A non-category purchase displaces a named category only when it is linked to it, or when the category is named
 // neither in the first sentence nor in any purchase phrase (then it is only context).
 const firstSentence=norm(text.split(/[.?!\n](?=\s|$)/)[0]??'');
 const titleNames=longestMatches(firstSentence,names,false,true).length>0;
 const decisive=others.filter(p=>p.linked||!titleNames);
 if(decisive.length&&anyName)return {kind:'other',category:null,other:decisive[0].phrase.replace(/^(?:a|an|the|some) /,''),basis:'purchase_phrase_head',phrases};
 return {kind:'none',category:null,other:null,basis:'purchase_phrase_head',phrases};
}
/** A product term the user names but the registry does not know ("laptop", "running shoes"). */
/** Phase250: searched sentence by sentence. Normalisation removes punctuation, so in the whole text a named product
 * ran into the next sentence ("shopping for a pressure cooker could anyone advise") and was never delimited. */
function namedProductTermIn(text:string,buyingOnly=false):string|null{
 for(const sentence of text.split(/[.?!;:\n()]+/)){const term=namedProductTerm(norm(sentence),buyingOnly);if(term)return term;}
 return null;
}
function namedProductTerm(t:string,buyingOnly=false):string|null{
 // buyingOnly: only buying constructions ("which X to buy", "buy a X"); "want/need X" often introduces a need
 // ("want chips that come out crispy"), so it is used only when nothing else resolved the request.
 // Phase250: buying constructions real requests use ("I'm shopping for a pressure cooker", "looking for a grinder").
 const buying='best|recommend|which|choose|buy|buying|suggest|shopping for|looking for|in the market for|considering|thinking of getting|thinking about getting|planning to buy';
 const verbs=buyingOnly?buying:buying+'|what|need|want';
 const re=new RegExp(`\\b(?:${verbs})\\s+(?:is the best |s the best |a good |the best |a |an |the |me a |me an |me |some )?([a-z][a-z' ]{1,30}?)(?= for| to| that| which| with| under| from| is| are| should| do| would| can| but| please|$| and| or|\\?)`,'g');
 for(const m of t.matchAll(re)){
  const term=m[1].trim().replace(/^(?:good|new|cheap|decent|great|sturdy) /,'');
  if(!GENERIC.test(term)&&!/^(?:to|is|are|should|do|i|my|you|it)\b/.test(term))return term;
 }
 return null;
}

export interface Journey248 {
 schema:'pee248.journey.v1';text:string;
 stages:{
  /** Phase253: what the user is buying (the category stage below follows it). */
  target:PurchaseTarget253;
  category:{categoryId:string|null;basis:'explicit_alias'|'cue_inferred'|'need_inferred'|'ambiguous'|'unresolved';candidates:string[];namedUnknownTerm:string|null;excluded:string[]};
  need:{concepts:{id:string;categoryId:string;matched:string;kind:string|null}[];budget:{currency:string;min:number|null;max:number|null}|null;hazards:string[]};
  requirements:{measuredBy:{conceptId:string;method:string;support:string;source:string|null}[];cautions:{attribute:string;conceptId:string;kind:string;support:string;note:string}[];
   unmeasuredConcepts:string[];categoryHasKnowledge:boolean;
   /** Phase250: recognised needs that a declared specification can check (decision keys of SPEC_CRITERIA249), to be
    * confirmed by the user before Phase249's decideAdvice249 builds a cited, unordered shortlist; a stated budget is
    * carried as budget_max. Checking a declaration establishes a fact (a capacity, a width), never performance. */
   factualRequirements:{conceptId:string;criterion:string;stated:{value:number;unit:string}|null}[]};
  candidates:{active:number;withDeclaredAttributes:number;retainedDeclarations:number;budgetApplicable:boolean};
  evidence:{evidenceSupportedRelations:number;independentResultsForNeed:number;methodReferences:number;
   /** Independent regulatory safety findings (GOV.UK OPSS) supplied by the caller; null when none were supplied. */
   safety:{noticesInCategory:number;byHazard:Record<string,number>;candidateMatches:{productId:string;identifier:string;url:string;noticeType:string}[];
    brandOnlyCandidates:number;sources:string[];note:string}|null};
 };
 decision:Decision248;blockingStage:Stage248|null;reasons:string[];clarificationQuestions:string[];researchPlan:string[];
 rankingAuthorized:false;recommendation:null|{productIds:string[];basis:string};
}

/** Runs the journey for one request. `registry` lists the categories PEE knows by name (with or without
 * category knowledge); concepts and relations come from the store. */
export function runJourney248(text:string,store:KnowledgeStore246,registry:readonly CategoryEntry248[],options:{safetyNotices?:readonly SafetyNotice248[]}={}):Journey248{
 if(typeof text!=='string'||text.length<3||text.length>2000)throw Error('248_invalid_request');
 const t=norm(text);
 // ---- category: explicit names (longest match), else inferred from need concepts of exactly one category
 // A category named under negation ("without a deep fat fryer", "rather not use a deep fryer") is excluded, not chosen.
 const negated=(start:number)=>/(?:^| )(?:without|not|no|instead of|rather than|other than|avoid|avoiding|don't want|do not want|rather not use|not using|never)(?: \S+){0,2} ?$/.test(t.slice(0,start).trimEnd()+' ');
 const allNamed=longestMatches(t,registry.map(r=>({key:r.id,aliases:r.aliases})),false,true);
 // "...don't want a toaster whose sides get hot": a negated name followed by a qualifying clause is a constraint on
 // that category, not its exclusion.
 const qualified=(end:number)=>/^ (?:whose|that|which|with|where)\b/.test(t.slice(end));
 const isExcluded=(h:{start:number;end:number})=>negated(h.start)&&!qualified(h.end);
 // Phase249: an alias inside an accessory or part phrase ("milk steamer", "steamer basket") does not name the category;
 // nor does a feature named with "with/without/has a ..." when another category is named explicitly.
 const partOf=(h:{key:string;start:number;end:number})=>(registry.find(r=>r.id===h.key)?.partPhrases??[]).some(pp=>find(t,pp).some(p=>p.start<=h.start&&p.end>=h.end))
  ||accessoryOf(h)
  // An alias that needs context ("grinder" names a coffee grinder only where coffee is the subject).
  ||(()=>{const e=registry.find(r=>r.id===h.key);const al=t.slice(h.start,h.end).replace(/e?s$/,'');const need=e?.aliasContext?.[al];
   return !!need&&!need.some(w=>find(t,w).length);})();
 // Phase250 (development): an accessory or spare part of a named product ("a filter for my espresso machine",
 // "stand mixer attachments") is not that product; applies to names and to weaker cues.
 function accessoryOf(h:{start:number;end:number}){return /(?:^| )(?:filters?|baskets?|gaskets?|beaters?|attachments?|parts|portafilters?|carafes?|lids?|seals?|replacements?) for (?:my|our|his|her|their|the|a|an|this)(?: \S+)? ?$/.test(t.slice(Math.max(0,h.start-60),h.start).trimEnd()+' ')
  ||/^(?: \S+)? (?:attachments?|beaters?|spare parts|parts|filters?|gaskets?|portafilters?|carafes?|replacement parts|racks?|liners?|trays?|mats?|covers?|cases?|baskets?)\b/.test(t.slice(h.end))
  // Phase251 (development; QueryNER human labels): "<thing> for (a|my|the) <product>" buys the thing, not the product
  // ("parchment paper for air fryer", "liners for air fryers"), unless the words before "for" are a buying, searching,
  // budget or space expression ("looking for an air fryer", "room for an air fryer", "best for ...").
  // Short, query-like requests only: in sentences "X for Y" is usually a purpose or a problem ("a problem for coffee
  // machines"), not a purchase (development: Phase248 dev d06).
  ||(()=>{if(t.split(' ').length>8)return false;const m=/(?:^| )([a-z0-9']+) for(?: a| an| the| my| our| your| this)? ?$/.exec(t.slice(Math.max(0,h.start-60),h.start).trimEnd()+' ');
   return !!m&&!/^(?:looking|shopping|searching|search|recommendations?|recommend|suggestions?|advice|budget|room|space|money|options?|ideas?|best|good|great|something|anything|one|need|want|buy|buying|go|went|opt|opted|settle|settled|ask|asking|hunt|hunting|market|paid|pay|used|use|reviews?|alternative|alternatives|replacement|substitute|time|ready|it|is|are|was|that|this)$/.test(m[1]);})();}
 // "I could buy an electrical blender, but ...": a product considered and set aside is not the one being chosen.
 const rejected=(h:{start:number;end:number})=>/(?:^| )(?:could|might) (?:buy|use|get)(?: a| an| the)?(?: \S+)? ?$/.test(t.slice(Math.max(0,h.start-50),h.start).trimEnd()+' ')&&/^(?: \S+){0,6} but\b/.test(t.slice(h.end,h.end+60));
 const named0=allNamed.filter(h=>!isExcluded(h)&&!partOf(h)&&!rejected(h));
 const featureOf=(h:{key:string;start:number})=>/(?:^| )(?:with|without|has|have|having|plus|including)(?: a| an| the)?(?: milk| built in| integrated)? ?$/.test(t.slice(0,h.start).trimEnd()+' ');
 const named1=new Set(named0.map(h=>h.key)).size>1?named0.filter(h=>!(featureOf(h)&&named0.some(o=>o.key!==h.key&&!featureOf(o)))):named0;
 // "replace it with a toaster oven", "switch to an air fryer": the replacement target is the category sought.
 const targetOf=(h:{start:number})=>/(?:replac\S* (?:\S+ ){0,3}with|switch(?:ing)? to|upgrad\S* to|swap\S* (?:\S+ ){0,3}for|instead get|thinking of getting)(?: a| an| the)? ?$/.test(t.slice(0,h.start).trimEnd()+' ');
 const named2=new Set(named1.map(h=>h.key)).size>1&&named1.some(targetOf)?named1.filter(h=>named1.filter(targetOf).some(x=>x.key===h.key)):named1;
 // Phase250: when several categories are named, the one introduced by a buying construction is the one being chosen
 // ("Has anyone used one of the < $500 manual espresso machines ... better than my Aeropress"), but only when exactly
 // one category is introduced that way; otherwise the request stays ambiguous.
 const buyTarget=(h:{start:number})=>/(?:^| )(?:buy|buying|get|getting|purchase|purchasing|shopping for|looking for|looking at|considering|in the market for|choose|choosing|recommend|recommendations? for|best|which|want|need|replace (?:\S+ ){0,3}with|one of the|invest\S* in)(?: a| an| the| new| good| decent| cheap| quality| some| any| these| those)*(?: (?!(?:from|my|our|your|his|her|their|to|of|with|in|on|at|for)\b)\S+){0,2} ?$/.test(t.slice(Math.max(0,h.start-80),h.start).trimEnd()+' ');
 // A product the user already owns or uses ("my Aeropress", "I am currently using a moka pot") is context, not the
 // choice, when another named category remains.
 const owned=(h:{start:number})=>/(?:^| )(?:my|our|i (?:already )?(?:have|own|use)|i am (?:currently )?using|i'm (?:currently )?using|currently (?:using|use|have|own)|we (?:already )?(?:have|own|use))(?: a| an| the| old| current| cheap| little| trusty)*(?: \S+)?(?: and(?: a| an| the)?(?: \S+){0,3})? ?$/.test(t.slice(Math.max(0,h.start-80),h.start).trimEnd()+' ');
 const keys2=new Set(named2.map(h=>h.key)),unowned=named2.filter(h=>!owned(h));
 const named3=keys2.size>1&&unowned.length&&new Set(unowned.map(h=>h.key)).size<keys2.size?unowned:named2;
 const buyKeys=new Set(named3.filter(buyTarget).map(h=>h.key));
 const named=new Set(named3.map(h=>h.key)).size>1&&buyKeys.size===1?named3.filter(h=>buyKeys.has(h.key)):named3;
 const excludedCategories=[...new Set(allNamed.filter(isExcluded).map(h=>h.key))].sort();
 const explicit=[...new Set(named.map(h=>h.key))].filter(c=>!excludedCategories.includes(c)||named.some(h=>h.key===c)).sort();
 const cueHits=longestMatches(t,registry.filter(r=>r.cues?.length).map(r=>({key:r.id,aliases:r.cues!}))).filter(h=>!negated(h.start)&&!accessoryOf(h));
 const cueCats=[...new Set(cueHits.map(h=>h.key))].filter(c=>!excludedCategories.includes(c)).sort();
 const knowledgeCats=registry.filter(r=>store.categoryItems246(r.id).length>0).map(r=>r.id);
 const conceptEntries=knowledgeCats.flatMap(c=>{const seen=new Set<string>();
  return store.categoryItems246(c).filter(i=>i.concept&&!seen.has(i.concept.id)&&!!seen.add(i.concept.id))
   .map(i=>({key:`${c}|${i.concept!.id}|${i.concept!.kind}`,aliases:i.concept!.aliases}));});
 // A need phrase that runs into a product noun describes the product being named ("a good manual espresso machine"),
 // not a stated need ("I want good espresso").
 const modifiesProduct=(h:{end:number})=>h.end>=0&&/^ (?:\S+ )?(?:machines?|makers?|fryers?|toasters?|ovens?|kettles?|blenders?|models?)\b/.test(t.slice(h.end));
 const counter=(h:{key:string;start:number;end:number})=>{const [c,id]=h.key.split('|');
  const phrases=registry.find(r=>r.id===c)?.needCounterexamples?.[id]??[];
  return phrases.some(pp=>find(t,pp).some(p=>h.start<0||(p.start<=h.end&&p.end>=h.start)));};
 // Phase252 (development): a need the user says they do not care about or do not need ("not bothered about
 // noise-cancelling", "not looking for wireless or noise-cancelling", "ANC doesn't matter") is not a need. Indifference
 // markers only: "don't want cold spots" or "no more cold spots" still express a need.
 // R3-P: the Phase252 indifference patterns are retired into the shared scope: a need is set aside when its clause is
 // indifferent to it ("noise doesn't bother me", "ANC doesn't matter", "not fussed about wifi") or a negated requirement
 // governs it ("I don't need X", "no need for X"); a negated wish ("don't want cold spots") still expresses a need.
 const indifferent=(h:{start:number;end:number})=>{if(h.start<0)return false;const st=stanceAt(t,h.start,h.end);
  return st?.stance==='indifferent'||(st?.stance==='negated'&&st.kind==='requirement');};
 const exactHits=longestMatches(t,conceptEntries,true).filter(h=>!modifiesProduct(h));
 // A paraphrase of a need the user has set aside everywhere it is named is set aside too.
 const setAside=new Set(exactHits.filter(h=>h.start>=0).map(h=>h.key).filter(k=>exactHits.filter(h=>h.key===k&&h.start>=0).every(indifferent)));
 const conceptHits=[...exactHits.filter(h=>!indifferent(h)&&!setAside.has(h.key)),...describedConcepts(t,store,knowledgeCats,registry).filter(h=>!setAside.has(h.key))].filter(h=>!counter(h));
 let categoryId:string|null=null;let basis:Journey248['stages']['category']['basis']='unresolved';
 if(explicit.length===1){categoryId=explicit[0];basis='explicit_alias';}
 else if(explicit.length>1)basis='ambiguous';
 else if(cueCats.length===1){categoryId=cueCats[0];basis='cue_inferred';}
 else if(cueCats.length>1)basis='ambiguous';
 else{
  // Phase250: a need shared by several categories ("long lasting", "multipurpose", "small kitchen") does not identify
  // which product the user means; only needs specific to one category can infer it.
  const sharedNeed=(id:string)=>GENERIC_NEEDS250.has(id)||new Set(conceptEntries.filter(e=>e.key.split('|')[1]===id).map(e=>e.key.split('|')[0])).size>1;
  const cats=[...new Set(conceptHits.filter(h=>!sharedNeed(h.key.split('|')[1])).map(h=>h.key.split('|')[0]))].filter(c=>!excludedCategories.includes(c));
  // Phase250 (development): in a long request one need phrase ("living alone", "non-stick wearing off") is too weak
  // to decide the product; two distinct needs of the same category are required there.
  const distinct=(c:string)=>new Set(conceptHits.filter(h=>h.key.startsWith(c+'|')&&!sharedNeed(h.key.split('|')[1])).map(h=>h.key.split('|')[1])).size;
  const strong=t.split(' ').length<=LONG_REQUEST_WORDS250||(cats.length===1&&distinct(cats[0])>=2);
  if(cats.length===1&&strong){categoryId=cats[0];basis='need_inferred';}else if(cats.length>1)basis='ambiguous';}
 // Phase249: a request naming a product PEE does not know ("which non-stick pan to buy") is about that product; need words
 // ("cook for one", "flavour") must not pull it into another category.
 const termAny=namedProductTermIn(text,true);
 const termKnown=!!termAny&&registry.some(r=>[...r.aliases,...(r.cues??[])].some(a=>find(norm(termAny),a).length));
 if(basis==='need_inferred'&&termAny&&!termKnown){categoryId=null;basis='unresolved';}
 // Phase272 (unknown-category pilot): need words shared with several known categories ("dries", "cheap to run") do not make
 // a request naming an unknown product ("which tumble dryer ...") ambiguous between those categories: it names a category
 // PEE has no knowledge of, which is a gap to state, not a choice to ask about. Only when no known category is named.

 // Phase253: the purchase phrase decides between several named categories, and a category named only as context
 // (an accessory's host, an owned product, a physics term) is not the purchase.
 const purchase=purchaseTarget253(text,registry,new Set(named0.map(h=>h.key)));let purchaseOther:string|null=null;
 if(purchase.kind==='category'&&!excludedCategories.includes(purchase.category!)){categoryId=purchase.category;basis='explicit_alias';}
 else if(purchase.kind==='other'&&categoryId&&basis==='explicit_alias'){purchaseOther=purchase.other;categoryId=null;basis='unresolved';}
 else if(purchase.kind==='ambiguous'&&basis!=='ambiguous'){categoryId=null;basis='ambiguous';}
 // Phase272 (unknown-category pilot): need words shared with known categories ("dries", "reduce my bills") do not move a
 // request naming an unknown product ("which tumble dryer ...") into one of those categories or make it ambiguous between
 // them: it names a category PEE has no knowledge of, a gap to state. Only when no known category is named or cued, and the
 // purchase phrase (or the Phase249 named term) is that unknown product.
 const unknownPurchase=purchase.kind==='none'?purchase.phrases.find(p=>!p.category&&p.phrase.split(' ').length<=4)?.phrase??null:null;
 if((basis==='ambiguous'||basis==='need_inferred')&&!explicit.length&&!cueCats.length&&(unknownPurchase||(termAny&&!termKnown))){categoryId=null;basis='unresolved';purchaseOther=purchaseOther??unknownPurchase;}
 const target:PurchaseTarget253=purchase.kind==='none'||(purchase.kind==='category'&&purchase.category!==categoryId)
  ?{...purchase,kind:categoryId?'category':basis==='ambiguous'?'ambiguous':'none',category:categoryId,basis:'category_stage'}:purchase;
 const namedUnknownTerm=basis==='unresolved'?purchaseOther??termAny??namedProductTermIn(text):null;
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
 const entry=registry.find(e=>e.id===categoryId);
 const factualRequirements:Journey248['stages']['requirements']['factualRequirements']=[
  ...concepts.flatMap(c=>(entry?.needCriteria?.[c.id]??[]).map(k=>({conceptId:c.id,criterion:k,stated:null}))),
  ...(budget?.max!=null?[{conceptId:'budget',criterion:'budget_max',stated:{value:budget.max,unit:budget.currency}}]:[])];
 const categoryHasKnowledge=!!categoryId&&items.length>0;
 // ---- candidates and evidence
 const products=categoryId?store.products246({category:categoryId}):[];
 const withAttrs=products.filter(p=>!!store.db.prepare('SELECT 1 FROM revision_properties WHERE product_id=?').get(p)).length;
 const retained=products.reduce((a,p)=>a+store.declarations246(p).length,0);
 const evidenceSupported=rels.filter(r=>r.support==='evidence_supported'&&wanted.has(conceptOfRef(r.to)??'')).length;
 // Independent product results for the need. S85 (owner): a specification value is never an independently measured
 // result, even when a test publisher's page lists it (role test_publisher_declaration_unreviewed is a declaration).
 // Declarations no longer count; measured results reach advice only through validated test evidence (Phase268, ranking
 // path), so the journey reports none here.
 const independentResults=0;
 // Safety notices attach to candidates only through an exact identifier the candidate's own sources declared.
 let safety:Journey248['stages']['evidence']['safety']=null;
 if(categoryId&&options.safetyNotices){
  // The same notice can arrive from several searches: one notice per source URL.
  const ns=[...new Map(options.safetyNotices.filter(n=>n.product.categoryIds.includes(categoryId)).map(n=>[n.source.url,n])).values()];
  const profile=categorySafetyProfile248(ns,categoryId);
  const matches:{productId:string;identifier:string;url:string;noticeType:string}[]=[];let brandOnly=0;
  for(const pid of products){
   const p=store.product246(pid);if(!p)continue;
   const ids=[...Object.entries(p.identifiers as Record<string,string>).filter(([k])=>k!=='_key'&&k!=='brand').map(([,v])=>String(v)),
    ...(p.declaredModel?[p.declaredModel]:[]),...(p.name??'').split(/\s+/).filter(t=>/\d/.test(t)&&/[a-z]/i.test(t)&&t.length>=4&&!/^\d+(?:\.\d+)?(?:l|w|kg|g|ml|cm|mm)$/i.test(t))];
   let brandHit=false;
   for(const n of ns){const m=matchNotice248(n,{name:p.name??'',brand:p.brand,identifiers:ids},categoryId);
    if(m.status==='exact_identifier')matches.push({productId:pid,identifier:m.identifier,url:n.source.url,noticeType:n.noticeType});
    else if(m.status==='brand_and_category_only')brandHit=true;}
   if(brandHit&&!matches.some(x=>x.productId===pid))brandOnly++;
  }
  safety={noticesInCategory:ns.length,byHazard:profile.byHazard,candidateMatches:matches,brandOnlyCandidates:brandOnly,sources:profile.sources.slice(0,10),
   note:'regulator findings about identified products (OGL v3.0); counts are notices, not failure rates; never a ranking signal'};
 }
 // ---- decision
 const reasons:string[]=[];const questions:string[]=[];const plan:string[]=[];
 if(safety?.candidateMatches.length)reasons.push(`${new Set(safety.candidateMatches.map(m=>m.productId)).size} candidate(s) are named by exact identifier in a UK product safety notice`);
 if(safety?.brandOnlyCandidates)plan.push(`check ${safety.brandOnlyCandidates} candidate(s) whose brand has a ${categoryId?.replace(/_/g,' ')} safety notice: model identifiers needed to tell whether it applies`);
 let decision:Decision248;let blocking:Stage248|null;
 const goalQuestion=(cat:string)=>{const goals=store.categoryItems246(cat).filter(i=>i.section==='user_goals'&&i.concept);
  return goals.length?`What matters most to you: ${goals.slice(0,4).map(g=>g.statement.replace(/\.$/,'').toLowerCase()).join('; or ')}?`:`What do you mainly want the ${cat.replace(/_/g,' ')} to do for you?`;};
 if(basis==='ambiguous'){decision='clarify';blocking='category';
  const opts=(purchase.kind==='ambiguous'?[...new Set(purchase.phrases.filter(p=>p.category).map(p=>p.category!))]:explicit.length>1?explicit:[...new Set(conceptHits.map(h=>h.key.split('|')[0]))]).map(c=>c.replace(/_/g,' '));
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
  const QUESTION:Record<string,string>={capacity_min:'What capacity do you need at least (litres, cups or slices)?',
   width_max:'How much space do you have for it (maximum width, depth and height)?'};
  const taught=concepts.map(c=>entry?.needQuestions?.[c.id]).filter((q):q is string=>!!q);
  for(const k of new Set(factualRequirements.filter(f=>!f.stated).map(f=>f.criterion==='depth_max'||f.criterion==='height_max'?'width_max':f.criterion)))
   if(QUESTION[k]&&!taught.length)questions.push(QUESTION[k]);
  questions.push(...new Set(taught));
  if(factualRequirements.length)plan.push(`once confirmed, check ${[...new Set(factualRequirements.map(f=>f.criterion))].join(', ')} against cited declarations (requirements shortlist, unordered)`);
  if(unmeasured.length)plan.push(`find an original test method for: ${unmeasured.join(', ')}`);
  for(const m of measuredBy)if(m.support==='method_reference')plan.push(`obtain independent results measured by: ${m.method.slice(0,90)}`);
  // Phase252: a taught (hypothesis-level) method says what would show the outcome; its results are still missing.
   else if(m.support==='hypothesis')plan.push(`missing evidence for ${m.conceptId}: independent results of ${m.method.slice(0,90)}`);
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
  stages:{target,category:{categoryId,basis,candidates:explicit,namedUnknownTerm,excluded:excludedCategories},need:{concepts,budget,hazards},
   requirements:{measuredBy,cautions,unmeasuredConcepts:unmeasured,categoryHasKnowledge,factualRequirements},
   candidates:{active:products.length,withDeclaredAttributes:withAttrs,retainedDeclarations:retained,budgetApplicable:retained>0},
   evidence:{evidenceSupportedRelations:evidenceSupported,independentResultsForNeed:independentResults,methodReferences:measuredBy.filter(m=>m.support==='method_reference').length,safety}},
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
