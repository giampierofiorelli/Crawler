/**
 * R3 (owner S73, 2026-10-19): PEE's own reading of a scientific teaching document into typed, checkable statements.
 *
 * Why this module. Until R3 every piece of teaching was translated by Claude into TypeScript constants
 * (`phase269_research_teaching.ts` and successors) and then into the store; PEE itself read nothing of the owner's
 * documents. The R3 brief asks for a mechanism inside PEE that acquires knowledge from a document with provenance, scope,
 * uncertainty and reversible validation. No existing module reads such documents: the readers (WD, 1G) read product
 * pages for values, not teaching for statements.
 *
 * Method (engineering references, not libraries):
 * - Rosetta Statements: a small closed set of statement types (`translation-cues.v1.json`), each with slots and a display
 *   template, so every statement renders back into a sentence that can be checked against the quoted original.
 * - CommonKADS: statements are domain knowledge; the inferences that use them stay in the KR programs (`knowledge_link`).
 * - NeOn: slots are typed with the existing vocabularies (quantity knowledge kinds, metrics, units, condition axes, and the
 *   category's taught concepts), never with a new ontology; what they cannot type is kept as untyped words.
 * - ORKG: methods, conditions and findings are separate slots; the document's own status label and references are kept.
 *
 * What it does not do. It does not write to the store, does not decide that a statement is true, and has no category
 * words: the cues are general English relation phrases, table header roles and status markers. Shadow only.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {findQuantities,namedPhrases,normText,parseUnit,type QuantityKnowledge} from './quantity_knowledge.js';
import type {TaughtConcept} from './knowledge_link.js';

/** kt-cues.2 (R3 fidelity review): the split word is rendered; kt-cues.1 is kept for reproducing the held-out first run. */
export const TRANSLATION_CUES_FILE='translation-cues.v2.json';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');

interface StatementTypeDef {type:string;meaning:string;display:string;patterns:string[];
 /** the subject may be absent (an instruction: "Do not ..."); it is then left out, not shown as unspecified */
 optionalSubject?:boolean}
export interface TranslationCues {schema:string;version:string;statementTypes:StatementTypeDef[];conditionCues:string[];contrastCues:string[];listSeparators:string[];
 tableHeaderRoles:Record<string,string[]>;statusMarkers:{status:string;cues:string[]}[];referencePattern:string}
let cachedCues:{cues:TranslationCues;digest:string;compiled:{def:StatementTypeDef;res:RegExp[]}[]}|null=null;
export function loadTranslationCues(c?:TranslationCues){
 if(!c&&cachedCues)return cachedCues;
 const src=c?JSON.stringify(c):readFileSync(new URL('../../resources/knowledge-translation/'+TRANSLATION_CUES_FILE,import.meta.url),'utf8');
 const cues=c??JSON.parse(src) as TranslationCues;
 const out={cues,digest:sha(src),compiled:cues.statementTypes.map(def=>({def,res:def.patterns.map(p=>new RegExp(p,'i'))}))};if(!c)cachedCues=out;return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// 1. The document's blocks (markdown): paragraphs, bullets, numbered items, table rows with their header labels.
export interface DocBlock {kind:'paragraph'|'bullet'|'numbered'|'table_row';line:number;headings:string[];text:string;cells?:{header:string;text:string}[]}
const clean=(s:string)=>s.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g,'$1').replace(/[*_`]+/g,'').replace(/\s+/g,' ').trim();
export function parseTeachingDocument(md:string,range?:readonly {start:number;end:number}[]):DocBlock[]{
 const lines=md.split('\n');const blocks:DocBlock[]=[];const heads:string[]=[];let header:string[]|null=null;let para:{line:number;text:string}|null=null;
 const inRange=(i:number)=>!range||range.some(r=>i+1>=r.start&&i+1<=r.end);
 const flush=()=>{if(para&&para.text.trim())blocks.push({kind:'paragraph',line:para.line,headings:[...heads],text:clean(para.text)});para=null;};
 lines.forEach((raw,i)=>{const l=raw.trimEnd();
  const h=/^(#{1,6})\s+(.*)$/.exec(l);if(h){flush();header=null;heads.length=Math.min(heads.length,h[1].length-1);heads[h[1].length-1]=clean(h[2]);heads.length=h[1].length;return;}
  if(!inRange(i)){flush();header=null;return;}
  if(/^\s*\|/.test(l)){flush();const cells=l.trim().replace(/^\||\|$/g,'').split('|').map(c=>clean(c));
   if(cells.every(c=>/^:?-{2,}:?$/.test(c)))return;
   if(!header){header=cells;return;}
   blocks.push({kind:'table_row',line:i+1,headings:[...heads],text:cells.join(' | '),cells:cells.map((t,j)=>({header:header![j]??'',text:t}))});return;}
  header=null;
  const b=/^\s*(?:[-*•]|(\d+)[.)])\s+(.*)$/.exec(l);if(b){flush();blocks.push({kind:b[1]?'numbered':'bullet',line:i+1,headings:[...heads],text:clean(b[2])});return;}
  if(!l.trim()||/^---+$/.test(l.trim())){flush();return;}
  if(para)para.text+=' '+l;else para={line:i+1,text:l};});
 flush();return blocks;
}

/** Clauses of a block's text: sentences (not at decimals or abbreviations), then "; " and ", but" splits. */
export function clauses(text:string):string[]{
 const out:string[]=[];
 for(const s of text.split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/))for(const c of s.split(/;\s+|,\s+but\s+|\s+—\s+|\s+–\s+/))
  {const t=c.replace(/^[\s:,(]+|[\s.:;,)]+$/g,'').trim();if(t.length>=8)out.push(t);}
 return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// 2. Typed spans: what the existing vocabularies recognise in a slot, and what they do not.
export interface TypedSpan {text:string;metrics:string[];kinds:string[];axes:{axis:string;value:string}[];concepts:string[];units:string[];untyped:string[]}
const STOP=new Set('a an the of to in on at by for with and or as is are be been was were it its this that these those than then from into over under not no can may might must should would could will per each every any all such other more less most least only also very about within between without whose which who what when where how why there their them they use used using one two three'.split(' '));
export function typeSpan(qk:QuantityKnowledge,text:string,concepts:readonly TaughtConcept[]=[]):TypedSpan{
 const metrics:string[]=[],kinds:string[]=[],axes:{axis:string;value:string}[]=[],cs:string[]=[],units:string[]=[];const typed=new Set<string>();
 const mark=(hit:Set<string>)=>{for(const h of hit)for(const w of h.split(' '))typed.add(w);};
 for(const m of qk.metrics.values()){const h=namedPhrases(text,m.terms);if(h.size){metrics.push(m.id);mark(h);}}
 for(const k of qk.kinds.values()){const h=namedPhrases(text,k.terms);if(h.size){kinds.push(k.id);mark(h);}}
 for(const a of qk.axes.values())for(const [v,terms] of Object.entries(a.values??{})){const h=namedPhrases(text,terms);if(h.size){axes.push({axis:a.id,value:v});mark(h);}}
 for(const f of findQuantities(qk,text)){units.push(f.unit.expression);for(const w of normText(f.surface).split(' '))typed.add(w);}
 for(const tok of normText(text).split(/\s+/)){if(tok.length<2||STOP.has(tok))continue;const u=parseUnit(qk,tok);if(u&&u.atoms.length&&u.kinds.length===1){units.push(u.expression);typed.add(tok);}}
 for(const c of concepts){const words=c.id.split('_').filter(w=>w.length>2&&!STOP.has(w));
  const phrases=[c.id.replace(/_/g,' '),...(c.aliases??[])];const h=namedPhrases(text,phrases);
  if(h.size||(words.length>=2&&words.every(w=>new RegExp('\\b'+w+'\\w*\\b','i').test(text)))){cs.push(c.id);if(h.size)mark(h);else for(const w of words)typed.add(w);}}
 const untyped=[...new Set(normText(text).split(/[^\p{L}\p{N}.-]+/u))].filter(w=>w.length>2&&!STOP.has(w)&&!typed.has(w)&&!/^\d/.test(w));
 return {text,metrics:[...new Set(metrics)],kinds:[...new Set(kinds)],axes,concepts:[...new Set(cs)],units:[...new Set(units)],untyped};
}

// ---------------------------------------------------------------------------------------------------------------------
// 3. Statements.
export interface TranslatedStatement {id:string;type:string;
 subject:TypedSpan|null;object:TypedSpan|null;
 /** for composed_of: the parts */
 parts:TypedSpan[];
 /** an explicit contrast in the clause ("new versus aged"): the two contrasted phrases and the cue */
 contrast:{values:string[];cue:string}|null;
 /** the document's own status markers for this clause, block or heading (never upgraded) */
 status:string[];refs:string[];
 provenance:{source:string;line:number;headings:string[];block:DocBlock['kind'];header?:string};
 quote:string;rendered:string;
 /** render-back self-check (R3): problems found by comparing the rendered sentence with the quote, e.g. a negation the
  * rendering lost. A statement with a problem is kept for audit but must not be used as knowledge. */
 selfCheck:string[];
 /** how the statement was recognised: a relation pattern, or the role of a table column */
 basis:'pattern'|'table_role';typedness:'typed'|'partly_typed'|'untyped'}
export interface TranslationResult {schema:'pee.r3.translation.v1';cues:string;source:string;blocks:number;clauses:number;statements:TranslatedStatement[];
 /** clauses (or table cells) no statement type recognised: the coverage gap, reported, not hidden */
 unrecognised:number}

function statusOf(cues:TranslationCues,...texts:string[]):string[]{const t=texts.join(' | ');const out=new Set<string>();
 for(const m of cues.statusMarkers)if(namedPhrases(t,m.cues).size)out.add(m.status);return [...out];}
function refsOf(cues:TranslationCues,text:string):string[]{const re=new RegExp(cues.referencePattern,'g');const out=new Set<string>();
 for(const m of text.matchAll(re))for(const r of m[1].split(/\s*[,;]\s*/))out.add(r);return [...out];}
const fill=(tpl:string,x:{subject?:string;object?:string;verb?:string},optionalSubject=false)=>tpl.replace('{subject}',x.subject??(optionalSubject?'':'(unspecified)')).replace('{verb}',x.verb??'').replace('{object}',x.object??'(unspecified)').replace('{conditions}','').replace(/\s{2,}/g,' ').replace(/:\s+(\S)/,(m,c)=>': '+c);
/** Negations and prohibitions: a rendered sentence must keep at least as many as its quote. */
const NEGATORS=/\b(?:not|no|never|cannot|can't|don't|doesn't|isn't|aren't|won't|avoid|without|neither|nor)\b|n't\b/gi;
const negations=(t:string)=>(t.match(NEGATORS)??[]).length;
export function renderSelfCheck(quote:string,rendered:string):string[]{const out:string[]=[];if(negations(rendered)<negations(quote))out.push('negation_lost');return out;}
/** Document metadata and questions are not knowledge claims. */
const METADATA_VALUE=/^(?:https?:\/\/|www\.|\S+\.(?:md|pdf|json|zip|html?|txt)\b|v?\d+(?:\.\d+){1,3}\b|\d{1,2}\s+\w+\s+\d{4}\b|\d{4}-\d{2}-\d{2}\b)/i;
const typedness=(...s:(TypedSpan|null)[]):TranslatedStatement['typedness']=>{const xs=s.filter((x):x is TypedSpan=>!!x);
 const t=xs.filter(x=>x.metrics.length||x.kinds.length||x.concepts.length||x.axes.length).length;return t===0?'untyped':t===xs.length?'typed':'partly_typed';};
function headerRole(cues:TranslationCues,h:string):string|null{const n=normText(h);if(!n)return null;
 for(const [role,ws] of Object.entries(cues.tableHeaderRoles))if(ws.some(w=>n.includes(normText(w))))return role;return null;}
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

const TABLE_ROLE_TYPE:Record<string,string>={method:'measured_by',limitation:'limitation',applicability:'applicability',outcome:'bears_on_outcome'};
const TABLE_ROLE_DISPLAY:Record<string,string>={quantitative_finding:'{subject} {object}.',measured_by:'{subject} is measured by {object}.',limitation:'For {subject}, the document warns: {object}.',
 applicability:'For {subject}, applicability: {object}.',bears_on_outcome:'{subject} bears on: {object}.'};

/** Translate a teaching document (or some of its line ranges) into typed statements. */
export function translateDocument(qk:QuantityKnowledge,md:string,opts:{source:string;concepts?:readonly TaughtConcept[];range?:readonly {start:number;end:number}[];cues?:TranslationCues}):TranslationResult{
 const C=loadTranslationCues(opts.cues);const blocks=parseTeachingDocument(md,opts.range);const out:TranslatedStatement[]=[];let nClauses=0,unrec=0;
 const concepts=opts.concepts??[];const T=(s:string|undefined)=>s?typeSpan(qk,s.trim(),concepts):null;
 const push=(b:DocBlock,type:string,quote:string,sub:string|undefined,obj:string|undefined,basis:TranslatedStatement['basis'],header?:string,verb?:string)=>{
  if(type==='definition'&&obj&&METADATA_VALUE.test(obj.trim())){unrec++;return;}
  const def=C.cues.statementTypes.find(d=>d.type===type);const subject=T(sub),object=T(obj);
  const parts=type==='composed_of'&&obj?obj.split(/,\s*|\s+(?:and|plus|\+)\s+/).map(p=>p.trim()).filter(p=>p.length>2).map(p=>T(p)!):[];
  const cue=C.cues.contrastCues.find(c=>new RegExp('(?:^|\\s)'+esc(c)+'(?:\\s|$)','i').test(quote));
  const contrast=cue?{values:quote.split(new RegExp('\\s+'+esc(cue)+'\\s+','i')).slice(0,2).map((s,i)=>{const w=s.split(/[,;:(]/);const t=(i===0?w.at(-1)!:w[0]).trim().split(' ');return (i===0?t.slice(-3):t.slice(0,3)).join(' ');}),cue}:null;
  const display=def?.display??TABLE_ROLE_DISPLAY[type]??'{subject}: {object}.';
  out.push({id:`${opts.source}:${b.line}:${out.length}`,type,subject,object,parts,contrast,status:statusOf(C.cues,quote,b.text,b.headings.at(-1)??''),refs:refsOf(C.cues,b.text),
   provenance:{source:opts.source,line:b.line,headings:b.headings,block:b.kind,...(header?{header}:{})},quote,
   rendered:'',selfCheck:[],basis,typedness:typedness(subject,object,...parts)});
  const st=out[out.length-1];st.rendered=fill(display,{subject:subject?.text,object:object?.text,verb},def?.optionalSubject);st.selfCheck=renderSelfCheck(quote,st.rendered);};
 const byPattern=(b:DocBlock,cl:string,header?:string)=>{for(const {def,res} of C.compiled)for(const re of res){const m=re.exec(cl);if(m){push(b,def.type,cl,m.groups?.subject,m.groups?.object,'pattern',header,m.groups?.verb);return true;}}return false;};
 for(const b of blocks){
  if(b.kind==='table_row'&&b.cells){
   const subj=b.cells.find(c=>headerRole(C.cues,c.header)==='subject')?.text??b.cells[0]?.text;
   for(const c of b.cells){if(!c.text||c.text===subj)continue;nClauses++;
    if(byPattern(b,c.text,c.header))continue;
    const q=findQuantities(qk,c.text).filter(f=>f.value!==null);if(q.length&&!headerRole(C.cues,c.header)){push(b,'quantitative_finding',`${subj} | ${c.header}: ${c.text}`,`${subj} (${c.header})`,c.text,'table_role',c.header);continue;}const role=headerRole(C.cues,c.header);const type=role?TABLE_ROLE_TYPE[role]:undefined;
    if(type)push(b,type,`${subj} | ${c.header}: ${c.text}`,subj,c.text,'table_role',c.header);else unrec++;}
   continue;}
  for(const cl of clauses(b.text)){nClauses++;
   // a question asks for knowledge; it does not state it
   if(cl.includes('?')){unrec++;continue;}
   if(byPattern(b,cl))continue;
   // a quantitative finding: the clause states a value with a unit the quantity knowledge reads
   const q=findQuantities(qk,cl).filter(f=>f.value!==null);
   if(q.length){const at=q[0].start;push(b,'quantitative_finding',cl,cl.slice(0,at).trim()||undefined,cl.slice(at).trim(),'pattern');continue;}
   unrec++;}}
 return {schema:'pee.r3.translation.v1',cues:`${C.cues.version}:${C.digest.slice(0,12)}`,source:opts.source,blocks:blocks.length,clauses:nClauses,statements:out,unrecognised:unrec};
}

// ---------------------------------------------------------------------------------------------------------------------
// 4. Question-driven acquisition of condition axes (R3). The question comes from PEE's own teaching: words in the names
//    of taught measurements that the quantity knowledge cannot type (e.g. two luminance measurements that differ only by
//    "sdr" and "hdr"). The answer comes from the documents: a structure that states those words as alternative values of
//    one condition. Three general structures, no category words:
//    - an enumerated field:        filter_condition: new | aged | replaced | unknown
//    - slash alternatives + head:  SDR/HDR state, slow/fast mode
//    - an explicit contrast + head: new versus aged filters
//    A proposal is kept only when it answers a question (one of its values is such a word) and has at least two values.
//    It is a reversible proposal with provenance; nothing is stored.
export interface AxisProposal {axis:string;head:string;values:Record<string,string[]>;
 evidence:{source:string;line:number;quote:string;structure:'enumeration'|'slash'|'contrast'}[];
 answers:{measurement:string;word:string}[]}
const HEADS='state|states|mode|modes|format|formats|condition|conditions|setting|settings|load|loads|signal|signals|filter|filters|programme|programmes|program|programs|cycle|cycles|window|windows|run|runs|range|ranges|level|levels';
/** A question of the teaching: two taught measurements of the same measurand that differ by words PEE cannot type. */
export interface DistinctionQuestion {a:string;b:string;wordsA:string[];wordsB:string[]}
export function distinctionQuestions(descriptors:readonly {id:string;measurands:{kind:string;metric:string|null;level:string}[];untyped:string[]}[]):DistinctionQuestion[]{
 const key=(d:typeof descriptors[number])=>new Set(d.measurands.filter(m=>m.level==='head').map(m=>m.metric??m.kind));const out:DistinctionQuestion[]=[];
 for(let i=0;i<descriptors.length;i++)for(let j=i+1;j<descriptors.length;j++){const A=descriptors[i],B=descriptors[j];const ka=key(A),kb=key(B);
  if(![...ka].some(k=>kb.has(k)))continue;const wa=A.untyped.filter(w=>!B.untyped.includes(w)),wb=B.untyped.filter(w=>!A.untyped.includes(w));
  if(wa.length||wb.length)out.push({a:A.id,b:B.id,wordsA:wa,wordsB:wb});}
 return out;
}
export function acquireConditionAxes(qk:QuantityKnowledge,docs:readonly {source:string;md:string}[],questions:readonly DistinctionQuestion[]):AxisProposal[]{
 const wanted=new Map<string,string[]>();for(const q of questions){for(const w of q.wordsA)wanted.set(w,[...(wanted.get(w)??[]),q.a]);for(const w of q.wordsB)wanted.set(w,[...(wanted.get(w)??[]),q.b]);}
 const found=new Map<string,AxisProposal>();
 const singular=(h:string)=>h.endsWith('ss')?h:h.replace(/s$/,'');
 const HEADSET=new Set(HEADS.split('|'));
 const add=(head:string,vals:string[],source:string,line:number,quote:string,structure:AxisProposal['evidence'][number]['structure'])=>{
  const vs=[...new Set(vals.map(v=>normText(v).replace(/[^a-z0-9 -]/g,'').trim()).filter(v=>v.length>=2&&v.length<=24&&!/^\d+$/.test(v)&&!HEADSET.has(v)&&!STOP.has(v)))];if(vs.length<2)return;
  const answers=vs.flatMap(v=>(wanted.get(v)??[]).map(m=>({measurement:m,word:v})));if(!answers.length)return;
  const h=normText(head).replace(/[^a-z0-9_ ]/g,'').trim().replace(/\s+/g,'_');const axis=('acq_'+h).slice(0,40);
  const p=found.get(axis)??{axis,head:h,values:{},evidence:[],answers:[]};
  for(const v of vs)p.values[v.replace(/[^a-z0-9]+/g,'_')]=[v];p.evidence.push({source,line,quote:quote.slice(0,200),structure});
  for(const a of answers)if(!p.answers.some(x=>x.measurement===a.measurement&&x.word===a.word))p.answers.push(a);found.set(axis,p);};
 for(const d of docs)d.md.split('\n').forEach((raw,i)=>{const l=raw.replace(/[*`_]{2,}/g,'');
  const en=/^\s*(?:[-*]\s*)?([a-z][a-z_]{2,40}):\s*([^|]{1,30}(?:\s\|\s[^|]{1,30}){1,})\s*$/.exec(l);
  if(en)add(en[1],en[2].split(/\s\|\s/),d.source,i+1,l.trim(),'enumeration');
  for(const m of l.matchAll(new RegExp(`\\b([A-Za-z0-9-]{2,14})((?:/[A-Za-z0-9-]{2,14}){1,3})\\s+(${HEADS})\\b`,'g')))
   add(singular(m[3]),[m[1],...m[2].split('/').filter(Boolean)],d.source,i+1,m[0],'slash');
  for(const m of l.matchAll(new RegExp(`\\b([A-Za-z-]{3,15})\\s+(?:versus|vs\\.?)\\s+(?:[A-Za-z]+\\s+(?:or|and)\\s+)?(?:[A-Za-z]+\\s+)?([A-Za-z-]{3,15})\\s+(${HEADS})\\b`,'gi')))
   add(singular(m[3]),[m[1],m[2]],d.source,i+1,m[0],'contrast');});
 for(const p of found.values())if(qk.axes.has(p.axis))found.delete(p.axis);
 // keep an axis only when it answers a distinction completely: each side that has distinguishing words gets a value of
 // the axis (SDR vs HDR). A one-sided answer ("aged" against a measurement that names no filter state) would make PEE
 // assume the other value when a page states none, which R2 forbids.
 for(const p of found.values()){const vals=new Set(Object.values(p.values).flat());
  const complete=questions.filter(q=>{const ha=q.wordsA.some(w=>vals.has(w)),hb=q.wordsB.some(w=>vals.has(w));return (ha||hb)&&(ha||!q.wordsA.length)&&(hb||!q.wordsB.length);});
  if(!complete.length)found.delete(p.axis);else p.answers=p.answers.filter(a=>complete.some(q=>q.a===a.measurement||q.b===a.measurement));}
 return [...found.values()].sort((a,b)=>a.axis.localeCompare(b.axis));
}
/** A quantity knowledge extended with acquired axes (a reversible overlay: the pack file is unchanged). Acquired axes
 * are closed lists; they are not operating conditions unless the knowledge says so. */
export function withAcquiredAxes(qk:QuantityKnowledge,proposals:readonly AxisProposal[],load:(pack:unknown)=>QuantityKnowledge):QuantityKnowledge{
 if(!proposals.length)return qk;
 const pack=JSON.parse(JSON.stringify(qk.pack));pack.version=pack.version+'+acq';
 pack.sources=[...pack.sources,{id:'r3_acquired',title:'R3: condition axes acquired by PEE from the owner teaching documents (proposals, reversible)',url:null,use:'condition axes answering questions of the teaching',licence:'owner research (private)'}];
 pack.conditionAxes=[...pack.conditionAxes,...proposals.map(p=>({id:p.axis,values:p.values,labelled:true,source:'r3_acquired'}))];
 return load(pack);
}
