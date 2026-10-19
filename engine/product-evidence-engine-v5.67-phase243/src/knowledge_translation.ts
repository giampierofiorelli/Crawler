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

export const TRANSLATION_CUES_FILE='translation-cues.v1.json';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');

interface StatementTypeDef {type:string;meaning:string;display:string;patterns:string[]}
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
 /** how the statement was recognised: a relation pattern, or the role of a table column */
 basis:'pattern'|'table_role';typedness:'typed'|'partly_typed'|'untyped'}
export interface TranslationResult {schema:'pee.r3.translation.v1';cues:string;source:string;blocks:number;clauses:number;statements:TranslatedStatement[];
 /** clauses (or table cells) no statement type recognised: the coverage gap, reported, not hidden */
 unrecognised:number}

function statusOf(cues:TranslationCues,...texts:string[]):string[]{const t=texts.join(' | ');const out=new Set<string>();
 for(const m of cues.statusMarkers)if(namedPhrases(t,m.cues).size)out.add(m.status);return [...out];}
function refsOf(cues:TranslationCues,text:string):string[]{const re=new RegExp(cues.referencePattern,'g');const out=new Set<string>();
 for(const m of text.matchAll(re))for(const r of m[1].split(/\s*[,;]\s*/))out.add(r);return [...out];}
const fill=(tpl:string,x:{subject?:string;object?:string})=>tpl.replace('{subject}',x.subject??'(unspecified)').replace('{object}',x.object??'(unspecified)').replace('{conditions}','');
const typedness=(...s:(TypedSpan|null)[]):TranslatedStatement['typedness']=>{const xs=s.filter((x):x is TypedSpan=>!!x);
 const t=xs.filter(x=>x.metrics.length||x.kinds.length||x.concepts.length||x.axes.length).length;return t===0?'untyped':t===xs.length?'typed':'partly_typed';};
function headerRole(cues:TranslationCues,h:string):string|null{const n=normText(h);if(!n)return null;
 for(const [role,ws] of Object.entries(cues.tableHeaderRoles))if(ws.some(w=>n.includes(normText(w))))return role;return null;}
const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');

const TABLE_ROLE_TYPE:Record<string,string>={method:'measured_by',limitation:'limitation',applicability:'applicability',outcome:'bears_on_outcome'};
const TABLE_ROLE_DISPLAY:Record<string,string>={measured_by:'{subject} is measured by {object}.',limitation:'For {subject}, the document warns: {object}.',
 applicability:'For {subject}, applicability: {object}.',bears_on_outcome:'{subject} bears on: {object}.'};

/** Translate a teaching document (or some of its line ranges) into typed statements. */
export function translateDocument(qk:QuantityKnowledge,md:string,opts:{source:string;concepts?:readonly TaughtConcept[];range?:readonly {start:number;end:number}[];cues?:TranslationCues}):TranslationResult{
 const C=loadTranslationCues(opts.cues);const blocks=parseTeachingDocument(md,opts.range);const out:TranslatedStatement[]=[];let nClauses=0,unrec=0;
 const concepts=opts.concepts??[];const T=(s:string|undefined)=>s?typeSpan(qk,s.trim(),concepts):null;
 const push=(b:DocBlock,type:string,quote:string,sub:string|undefined,obj:string|undefined,basis:TranslatedStatement['basis'],header?:string)=>{
  const def=C.cues.statementTypes.find(d=>d.type===type);const subject=T(sub),object=T(obj);
  const parts=type==='composed_of'&&obj?obj.split(/,\s*|\s+(?:and|plus|\+)\s+/).map(p=>p.trim()).filter(p=>p.length>2).map(p=>T(p)!):[];
  const cue=C.cues.contrastCues.find(c=>new RegExp('(?:^|\\s)'+esc(c)+'(?:\\s|$)','i').test(quote));
  const contrast=cue?{values:quote.split(new RegExp('\\s+'+esc(cue)+'\\s+','i')).slice(0,2).map((s,i)=>{const w=s.split(/[,;:(]/);const t=(i===0?w.at(-1)!:w[0]).trim().split(' ');return (i===0?t.slice(-3):t.slice(0,3)).join(' ');}),cue}:null;
  const display=def?.display??TABLE_ROLE_DISPLAY[type]??'{subject}: {object}.';
  out.push({id:`${opts.source}:${b.line}:${out.length}`,type,subject,object,parts,contrast,status:statusOf(C.cues,quote,b.text,b.headings.at(-1)??''),refs:refsOf(C.cues,b.text),
   provenance:{source:opts.source,line:b.line,headings:b.headings,block:b.kind,...(header?{header}:{})},quote,
   rendered:fill(display,{subject:subject?.text,object:object?.text}),basis,typedness:typedness(subject,object,...parts)});};
 const byPattern=(b:DocBlock,cl:string,header?:string)=>{for(const {def,res} of C.compiled)for(const re of res){const m=re.exec(cl);if(m){push(b,def.type,cl,m.groups?.subject,m.groups?.object,'pattern',header);return true;}}return false;};
 for(const b of blocks){
  if(b.kind==='table_row'&&b.cells){
   const subj=b.cells.find(c=>headerRole(C.cues,c.header)==='subject')?.text??b.cells[0]?.text;
   for(const c of b.cells){if(!c.text||c.text===subj)continue;nClauses++;
    if(byPattern(b,c.text,c.header))continue;const role=headerRole(C.cues,c.header);const type=role?TABLE_ROLE_TYPE[role]:undefined;
    if(type)push(b,type,`${subj} | ${c.header}: ${c.text}`,subj,c.text,'table_role',c.header);else unrec++;}
   continue;}
  for(const cl of clauses(b.text)){nClauses++;if(!byPattern(b,cl))unrec++;}}
 return {schema:'pee.r3.translation.v1',cues:`${C.cues.version}:${C.digest.slice(0,12)}`,source:opts.source,blocks:blocks.length,clauses:nClauses,statements:out,unrecognised:unrec};
}
