/** S89: PEE improves its own definitions from documents (owner review of S88: "il meccanismo generale con cui PEE costruisce,
 * verifica, corregge e applica qualsiasi definizione scientifica").
 *
 * Bootstrapping with verification (Snowball/DIPRE-style term harvesting, guarded against semantic drift):
 *  1. seeds: values the current definitions attribute through a term in the value's own words (state 'stated');
 *  2. harvest: the word n-grams of each value's own words (between it and its neighbouring quantities);
 *  3. verify: an n-gram becomes a learned term of a property only if it recurs with that property's seeds in at least two
 *     documents, its occurrences are pure enough among values whose unit the property admits, it never accompanies another
 *     property's seeds, and it is neither a known object of another concept nor already another property's term;
 *  4. propose: recurring n-grams with a consistent unit kind that no definition admits are proposed as candidate concepts
 *     (never used for attribution; they are the start of a new definition).
 * A learned term taught by one source is 'candidate' (usable with lower weight, never decision_usable); corroborated by
 * independent publishers it is 'supported' (S90, owner review of S89). Every term carries its provenance;
 * 'verified' needs a held-out check (a later wave), and only a verified definition may become decision_usable.
 * The learned layer is merged into the pack, so the improvement reaches every consumer of the definitions (reading plan,
 * attribution, interpretation, comparability) without changing any algorithm. */
import {createHash} from 'node:crypto';
import {normText,hasPhrase,parseUnit,type QuantityKnowledge} from './quantity_knowledge.js';
import {loadPropertyDefinitions,type DefinitionPack,type PropertyDefinitions} from './property_definitions.js';
import {interpretWithDefinitions,ownWords,kindsOf,type ObservationInput} from './definition_interpreter.js';
import {denotationOf,trainDistributional,phraseSimilarity,subjectHead,stem,type Denotation,type DistributionalModel} from './knowledge_translation.js';

export const DEFINITION_LEARNING_VERSION='pee89.definition-learning.v1';
export interface LearningObservation extends ObservationInput {docId:string;publisher:string}
export interface LearnedTerm {property:string;term:string;state:'candidate'|'supported';evidence:{seedDocs:number;seedPublishers:number;seeds:number;occurrences:number;purity:number;docs:string[];
 /** S92 E2: a term proposed by distributional similarity to the property's terms (no seed of its own) */
 similarity?:number;via?:'seeds'|'distributional'}}
export interface ProposedConcept {term:string;kind:string;state:'proposed';evidence:{docs:number;publishers:number;occurrences:number;categories:string[];
 /** S93: the values seen with the phrase, in SI (log10), for the magnitude-coherence check */
 log10Si?:number[];publishersList?:string[];docsList?:string[]};
 /** S92 E3 (knowledge-graph induction, R3 document concepts): what the phrase denotes, its consolidated key (head stem and
  * kind) and typed relations to existing properties; never used for attribution. */
 denotes?:Denotation;key?:string;relations?:{property:string;relation:'same_kind'|'contains_property_term'}[]}
/** S92: switches for the R3 non-generative mechanisms in learning (owner review of S91). */
export interface LearningOptions {
 /** S93: a value counts as explained by a definition (a seed) only when a SUPPORTED term of it names the value; a weak
  * (candidate-term or context-only) attribution does not stop a new concept from being proposed */
 strongSeeds?:boolean;
 /** true: the R3 dn.1 semantic-type gate; 'grammar': dn.1 plus a nominal-head requirement (S92 development: REJECTED, it
  * removed verbal frame-evoking terms such as "climbing" that carried correct attributions; FrameNet frames are evoked by
  * verbs too). Kept switchable for reproduction. */
 typeGate?:boolean|'grammar';distributional?:{minSimilarity:number;margin:number;window?:number;minCount?:number}|null;relations?:boolean}
const REFUSED_DENOTATION:ReadonlySet<Denotation>=new Set(['condition','claim_or_label','source_or_evidence']);
// English closed-class words and verb morphology (no domain vocabulary)
const VERB_FORM=/^[a-z]+(?:ing|ed)$/;
const PARTICLE=new Set(['up','down','upper','lower','over','under','off','on','out','in','into','onto','across','through','around','about','totaling','totalling','combines','combined']);
const NOUN_PLURAL_OK=/^(?:watts|decibels|hours|minutes|seconds|litres|liters|hairs|obstacles|levels|speakers|channels)$/;
const hasQuantityHead=(g:string)=>!/\b(?:tests?|testing|tested|trials?|review|reviews)$/.test(g);
export const DEFAULT_THRESHOLDS={minSeedDocs:2,minSeedPublishers:2,minPurity:0.6,minSpecificity:0.7,minTermChars:4,maxN:3,minProposalDocs:2,minProposalPublishers:2,adjacentTokens:4};
export interface LearnedLayer {schema:'pee.learned-definitions.v1';version:string;learnedFrom:{definitions:string;observations:number;documents:number;digest:string};
 thresholds:typeof DEFAULT_THRESHOLDS;terms:LearnedTerm[];proposals:ProposedConcept[]}

const STOP=new Set(('a an the and or of to in on at for by with from as is are was were be been it its this that these those than then not no but if when '+
 'which who what where how all any each both more most less such same other only also very can could may might will would should do does did '+
 'our we us i my you your they their there here about around roughly nearly almost up just over under per into after before while '+
 'has have had got get gets compared average averages overall score scored scores result results test tested testing').split(' '));
const tokens=(s:string)=>normText(s).replace(/[^a-z0-9%.\- ]+/g,' ').split(/\s+/).filter(Boolean);
// a sentence boundary inside a phrase ("power. what makes") is not a term
/** Word n-grams (1..maxN) of a span, without digits or stopwords at either edge. */
export function ngrams(span:string,maxN=3):string[]{
 const ws=tokens(span).filter(w=>!/\d/.test(w));const out=new Set<string>();
 for(let n=1;n<=maxN;n++)for(let i=0;i+n<=ws.length;i++){const g=ws.slice(i,i+n);if(STOP.has(g[0])||STOP.has(g[n-1]))continue;
  if(g.slice(0,-1).some(w=>/\.$/.test(w)))continue;out.add(g.join(' ').replace(/\.$/,''));}
 return [...out];
}

/** Harvest and verify. Pure: the same observations and definitions give the same layer. */
export function learnFromDocuments(defs:PropertyDefinitions,qk:QuantityKnowledge,obs:readonly LearningObservation[],th=DEFAULT_THRESHOLDS,opts:LearningOptions={}):LearnedLayer{
 // E1 (R3 dn.1 semantic type, informed by grammar): a property term names a quantity, so its head is nominal; a term that
 // denotes a condition, a claim, a source or a test, or whose words are verb forms or particles, is refused
 const gate=(g:string)=>{if(!opts.typeGate)return true;const dn=denotationOf(qk,g);if(REFUSED_DENOTATION.has(dn))return false;if(opts.typeGate!=='grammar')return true;if(dn==='measurement_or_test'&&!hasQuantityHead(g))return false;
  const ws=g.split(' ');const head=ws.at(-1)!;return !VERB_FORM.test(head)&&!PARTICLE.has(head)&&!ws.every(w=>PARTICLE.has(w)||VERB_FORM.test(w))&&!/^\w+s$/.test(head)||NOUN_PLURAL_OK.test(head);};
 const known=[...new Set((defs.pack.knownObjects?.objects??[]).flatMap(o=>o.nouns.map(n=>normText(n))))];
 const surfaceOf=new Map<string,string>();for(const p of defs.properties.values())for(const [t] of p.surface)surfaceOf.set(normText(t),p.id);
 type Occ={doc:string;pub:string;kinds:string[];seed:string|null;cat:string|null;identity:boolean;si:number|null};
 const occ=new Map<string,Occ[]>();
 for(const o of obs){const r=interpretWithDefinitions(defs,qk,o);
  const supportedTerm=(id:string|null)=>!!id&&r.property.evidence.some(e=>e.startsWith('label:')&&(defs.properties.get(id)?.surface??[]).some(([t,st])=>st!=='candidate'&&normText(t)===e.slice(6)));
  const seed=r.property.state==='stated'&&(!opts.strongSeeds||supportedTerm(r.property.value))?r.property.value:null;
  const kinds=kindsOf(qk,o).candidates;const label=String(o.label??'');const span=ownWords(label,o.valueAt,qk);
  const pu=parseUnit(qk,String(o.unit??'').trim());const si=pu&&o.value!==null&&o.value>0?Math.log10(o.value*pu.factor+(pu.offset??0)):null;
  const structural=o.structure?.label?ngrams(o.structure.label,th.maxN):[];
  // only the words adjacent to the value (its own noun phrase), on either side within its own words
  const at=o.valueAt==null?-1:span.length-(label.length-o.valueAt)+0;const cut=at>=0?at:span.length;
  const left=tokens(span.slice(0,Math.max(0,label.indexOf(span)>=0&&o.valueAt!=null?o.valueAt-label.indexOf(span):cut))).slice(-th.adjacentTokens).join(' ');
  const right=tokens(o.valueAt!=null&&label.indexOf(span)>=0?span.slice(o.valueAt-label.indexOf(span)):'').slice(1,1+th.adjacentTokens).join(' ');
  for(const g of [...new Set([...structural,...ngrams(left,th.maxN),...ngrams(right,th.maxN)])]){if(g.length<th.minTermChars)continue;let list=occ.get(g);if(!list){list=[];occ.set(g,list);}
   // words of the product's name are identity, not property vocabulary
   const idWords=new Set(tokens(String(o.pageSubject??'')).filter(w=>w.length>2));
   list.push({doc:o.docId,pub:o.publisher,kinds,seed,cat:o.category??null,identity:g.split(' ').every(w=>idWords.has(w)),si});}}
 const terms:LearnedTerm[]=[];const proposals:ProposedConcept[]=[];
 for(const [g,os] of [...occ.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
  if(known.some(k=>k===g||hasPhrase(g,k)))continue;
  const seedProps=new Set(os.map(x=>x.seed).filter((x):x is string=>!!x));
  if(seedProps.size===1){const p=[...seedProps][0];if(surfaceOf.has(g))continue;
   const def=defs.properties.get(p)!;const admitted=os.filter(x=>x.kinds.some(k=>def.quantity?.kinds.includes(k)));
   const seeds=os.filter(x=>x.seed===p);const docs=[...new Set(seeds.map(x=>x.doc))];const pubs=new Set(seeds.map(x=>x.pub));
   const purity=admitted.length?seeds.length/admitted.length:0;
   // specificity: the term accompanies values of the property's kinds, not values of any kind ("strong", a product class)
   const specificity=os.length?admitted.length/os.length:0;if(specificity<th.minSpecificity||os.some(x=>x.identity))continue;
   // S90 (owner review of S89): one source may teach a term, with an uncertainty state; independent sources corroborate it
   if(docs.length>=th.minSeedDocs&&purity>=th.minPurity&&gate(g))terms.push({property:p,term:g,state:pubs.size>=th.minSeedPublishers?'supported':'candidate',evidence:{seedDocs:docs.length,seedPublishers:pubs.size,seeds:seeds.length,occurrences:admitted.length,purity:+purity.toFixed(3),docs:docs.sort()}});
   continue;}
  if(seedProps.size===0){
   // a recurring phrase next to values of one unit kind that no definition explains: a candidate concept (never attributed)
   const kindsAll=os.map(x=>x.kinds.length===1?x.kinds[0]:null);const k=kindsAll[0];
   // not a unit word ("inches"), not a single short word; the phrase must be a noun phrase of at least two words or a long word
   if(!k||kindsAll.some(x=>x!==k)||g.split(' ').some(w=>parseUnit(qk,w))||g.split(' ').length<2&&g.length<8)continue;
   const docs=new Set(os.map(x=>x.doc));if(docs.size<th.minProposalDocs||new Set(os.map(x=>x.pub)).size<th.minProposalPublishers)continue;
   proposals.push({term:g,kind:k,state:'proposed',evidence:{docs:docs.size,publishers:new Set(os.map(x=>x.pub)).size,occurrences:os.length,categories:[...new Set(os.map(x=>x.cat).filter((x):x is string=>!!x))].sort(),
    log10Si:os.map(x=>x.si).filter((x):x is number=>x!==null).map(x=>+x.toFixed(3)),publishersList:[...new Set(os.map(x=>x.pub))].sort(),docsList:[...docs].sort()}});}}
 // S92 E2: distributional proposals (R3 option 1, PPMI over the learning text): a phrase with no seed of its own, near a
 // property's terms and accompanying values of that property's kinds, becomes a candidate term of it
 if(opts.distributional){const D=opts.distributional;const model:DistributionalModel=trainDistributional(obs.map(o=>[o.label,o.context].filter(Boolean).join(' ')),{window:D.window,minCount:D.minCount});
  const props=[...defs.properties.values()].filter(p=>p.quantity);
  for(const [g,os] of [...occ.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){if(os.some(x=>x.seed)||surfaceOf.has(g)||known.some(k=>k===g||hasPhrase(g,k))||os.some(x=>x.identity)||!gate(g))continue;
   const docs=[...new Set(os.map(x=>x.doc))];if(docs.length<th.minSeedDocs)continue;
   const scored=props.map(p=>({p,sim:Math.max(0,...p.surface.map(([t])=>phraseSimilarity(model,g,t)))})).sort((a,b)=>b.sim-a.sim);const [b1,b2]=scored;
   if(!b1||b1.sim<D.minSimilarity||(b2&&b1.sim-b2.sim<D.margin))continue;
   const admitted=os.filter(x=>x.kinds.some(k=>b1.p.quantity?.kinds.includes(k)));if(admitted.length/os.length<th.minSpecificity)continue;
   if(terms.some(t=>t.term===g))continue;
   terms.push({property:b1.p.id,term:g,state:'candidate',evidence:{seedDocs:0,seedPublishers:0,seeds:0,occurrences:admitted.length,purity:0,docs:docs.sort(),similarity:+b1.sim.toFixed(3),via:'distributional'}});}}
 // S92 E3: knowledge-graph induction over the proposals: denotation, a consolidated key, typed relations to properties
 if(opts.relations)for(const pr of proposals){pr.denotes=denotationOf(qk,pr.term);const head=subjectHead(pr.term)||pr.term;pr.key=stem(head.split(' ').at(-1)??head)+'@'+pr.kind;
  const rel:NonNullable<ProposedConcept['relations']>=[];for(const p of defs.properties.values()){if(!p.quantity?.kinds.includes(pr.kind))continue;
   rel.push({property:p.id,relation:p.surface.some(([t])=>hasPhrase(pr.term,normText(t)))?'contains_property_term':'same_kind'});}
  pr.relations=rel.sort((a,b)=>(a.relation==='contains_property_term'?0:1)-(b.relation==='contains_property_term'?0:1)||a.property.localeCompare(b.property));}
 // keep the most specific learned term when a shorter one only repeats it
 const kept=terms.filter(t=>!terms.some(u=>u!==t&&u.property===t.property&&u.term.includes(t.term)&&u.evidence.seeds>=t.evidence.seeds&&u.term.length>t.term.length));
 const digest=createHash('sha256').update(JSON.stringify(obs.map(o=>[o.docId,o.value,o.unit,o.label,o.valueAt]))).digest('hex');
 return {schema:'pee.learned-definitions.v1',version:DEFINITION_LEARNING_VERSION,learnedFrom:{definitions:defs.identity,observations:obs.length,documents:new Set(obs.map(o=>o.docId)).size,digest},
  thresholds:th,terms:kept,proposals:proposals.sort((a,b)=>b.evidence.docs-a.evidence.docs||a.term.localeCompare(b.term))};
}

/** Merge a learned layer into a definition pack: learned terms become candidate surface terms of their property. The result is
 * loaded and validated like any pack, so every consumer of the definitions uses it. */
export function withLearned(qk:QuantityKnowledge,pack:DefinitionPack,layer:LearnedLayer):PropertyDefinitions{
 const p=JSON.parse(JSON.stringify(pack)) as DefinitionPack;
 for(const t of layer.terms){const d=p.properties.find(x=>x.id===t.property);if(d&&!d.surface.some(([s])=>normText(s)===t.term))d.surface.push([t.term,t.state]);}
 p.version=pack.version+'+learned:'+layer.learnedFrom.digest.slice(0,8);
 return loadPropertyDefinitions(qk,p);
}

// ---------------------------------------------------------------------------------------------------------------------
// S93 (owner review of S92): the learning cycle. An induced concept becomes a candidate DEFINITION only after a
// verification without gold, and as a definition it reaches every reader (attribution, interpretation, comparison).
export interface DefinitionProposal {id:string;label:string;kind:string;terms:string[];object:string;objectNouns:string[];plausibleSi:[number,number];
 relations:LearnedRelation[];denotes:string|null;
 verification:{publishers:number;docs:number;occurrences:number;log10Spread:number;passed:string[];failed:string[]}}
/** S94 (owner review of S93): a relation between a learned concept and an existing property. A shared head word is lexical
 * evidence only ('shares_head_term', never a hierarchy). Following I-ADOPT, a property is its quantity kind AND its object
 * of interest: 'narrower_than' needs the same kind and an object the property's own definition names; a same-kind property
 * whose definition names other objects is a 'different_object' (neither identical nor broader). No relation is verified
 * here: every one stays a candidate until checked on later documents. */
export interface LearnedRelation {property:string;relation:'same_kind'|'contains_property_term'|'shares_head_term'|'different_object'|'narrower_than';basis?:string;verified?:false}
export function semanticRelation(d:{id:string;object?:string|null;objectNouns?:readonly string[];quantity?:{kinds:readonly string[]}|null},kind:string,modifiers:readonly string[]):LearnedRelation|null{
 if(!d.quantity?.kinds.includes(kind))return null;
 const own=new Set([...(d.objectNouns??[]),...String(d.object??'').toLowerCase().split(/[^a-z]+/).filter(w=>w.length>=4)].map(w=>stem(w)));
 const mods=modifiers.map(w=>stem(w.toLowerCase()));
 if(!d.objectNouns?.length)return {property:d.id,relation:'shares_head_term',basis:'object_of_property_not_defined',verified:false};
 if(mods.some(m=>own.has(m)))return {property:d.id,relation:'narrower_than',basis:'same_kind_and_object_named_by_the_definition',verified:false};
 return {property:d.id,relation:'different_object',basis:'same_kind_other_object',verified:false};
}
export const PROMOTION_THRESHOLDS={minPublishers:2,minDocs:2,minOccurrences:3,maxLog10Spread:1.5};
/** Group the layer's proposals by consolidated key (head stem and kind) and verify each group: independent publishers,
 * documents, occurrences, one quantity kind, coherent magnitudes (the values of one concept agree within 1.5 decades),
 * a denotation that is a quantity (not a condition, claim or source) and a head that no existing definition names. */
export function proposeDefinitions(defs:PropertyDefinitions,layer:LearnedLayer,th=PROMOTION_THRESHOLDS):DefinitionProposal[]{
 const groups=new Map<string,ProposedConcept[]>();for(const p of layer.proposals){if(!p.key)continue;groups.set(p.key,[...(groups.get(p.key)??[]),p]);}
 const out:DefinitionProposal[]=[];
 for(const [key,ps] of [...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){const kind=ps[0].kind;
  const pubs=new Set(ps.flatMap(p=>p.evidence.publishersList??[])),docs=new Set(ps.flatMap(p=>p.evidence.docsList??[]));const occ=ps.reduce((n,p)=>n+p.evidence.occurrences,0);
  const si=ps.flatMap(p=>p.evidence.log10Si??[]);const spread=si.length?Math.max(...si)-Math.min(...si):Infinity;
  const label=[...ps].sort((a,b)=>b.evidence.occurrences-a.evidence.occurrences||b.term.length-a.term.length)[0].term;const head=label.split(' ').at(-1)!;
  const denotes=ps[0].denotes??null;const passed:string[]=[],failed:string[]=[];
  (pubs.size>=th.minPublishers?passed:failed).push('publishers');(docs.size>=th.minDocs?passed:failed).push('documents');(occ>=th.minOccurrences?passed:failed).push('occurrences');
  (spread<=th.maxLog10Spread?passed:failed).push('magnitude_coherence');(denotes&&['condition','claim_or_label','source_or_evidence'].includes(denotes)?failed:passed).push('denotes_a_quantity');
  // the whole phrase must be new (S93 also made a head named by a property a NARROWER concept; superseded in S94: a
  // shared head word is lexical evidence, not a hierarchy, e.g. charging time is not a kind of run duration)
  const terms=[...new Set(ps.map(p=>p.term))];
  ([...defs.properties.values()].some(d=>d.surface.some(([t])=>terms.includes(normText(t))))?failed:passed).push('phrase_not_an_existing_term');
  // S94: a property named by the head word is only lexically related; hierarchy needs the I-ADOPT object check
  const mods0=label.split(' ').slice(0,-1).filter(w=>w.length>=3&&!/\d/.test(w));
  const headRel=[...defs.properties.values()].filter(d=>d.surface.some(([t])=>normText(t)===head)).map(d=>semanticRelation(d as never,kind,mods0)).filter((r):r is LearnedRelation=>!!r);
  // a quantity concept varies across products: a single repeated value is a fixed phrase, not a measured concept
  (new Set(si.map(x=>x.toFixed(2))).size>=2?passed:failed).push('values_vary');
  const mods=label.split(' ').slice(0,-1).filter(w=>w.length>=4&&!/\d/.test(w));
  const id='learned_'+key.replace(/@.*/,'').replace(/[^a-z0-9]+/g,'_')+'_'+kind.replace(/[^a-z0-9]+/g,'_');
  out.push({id,label,kind,terms,object:label,objectNouns:mods.length?mods:[head],plausibleSi:si.length?[10**(Math.min(...si)-1),10**(Math.max(...si)+1)]:[0,1],
   relations:[...(ps[0].relations??[]).filter(r=>!headRel.some(h=>h.property===r.property)),...headRel],denotes,verification:{publishers:pubs.size,docs:docs.size,occurrences:occ,log10Spread:+spread.toFixed(3),passed,failed}});}
 return out;
}
/** Add verified proposals to a definition pack as CANDIDATE properties (never decision-usable); the pack is loaded and
 * validated like any other, so the new definitions reach every consumer. */
export function withLearnedDefinitions(qk:QuantityKnowledge,pack:DefinitionPack,proposals:readonly DefinitionProposal[]):PropertyDefinitions{
 const p=JSON.parse(JSON.stringify(pack)) as DefinitionPack;const ok=proposals.filter(x=>!x.verification.failed.length);
 if(!p.sources.some(s=>s.id==='s93_learned'))p.sources.push({id:'s93_learned',kind:'learned',title:'S93 learning cycle: concepts induced from documents and verified without gold'} as never);
 for(const d of ok){if(p.properties.some(x=>x.id===d.id))continue;
  p.properties.push({id:d.id,label:d.label,form:'quantity',quantity:{kinds:[d.kind]},object:d.object,objectNouns:d.objectNouns,plausibleSi:d.plausibleSi,basis:null,
   surface:d.terms.map(t=>[t,'candidate']),conditions:[],state:'candidate',sources:['s93_learned']} as never);}
 p.version=pack.version+'+definitions:'+ok.length;
 return loadPropertyDefinitions(qk,p);
}
