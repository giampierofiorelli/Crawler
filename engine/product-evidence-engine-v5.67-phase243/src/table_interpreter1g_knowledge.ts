/**
 * Quantity knowledge applied to a 1G table interpretation (GK, 2026-10-18). The published 1G interpreter is not changed:
 * this layer takes its frozen output and adds, per observation, what the quantity knowledge establishes (kind, metric,
 * frequency weighting, required and stated conditions, SI value) and which observations print the same quantity twice
 * ("147 CFM (250 m³/h)"). The result carries its own reading identity (1G identity + knowledge identity), so a
 * knowledge-informed reading is never confused with the baseline reading.
 */
import {acquireTables1F} from './table_acquisition1f.js';
import {documentModel1G,interpretDocumentTables1G,renderedView1G,INTERPRETER1G_RENDERED_VERSION,type TextModel1G,type DocumentInterpretation1G,type Observation1G} from './table_interpreter1g.js';
import type {InterpreterLessonId1G} from './table_interpreter1g_lessons.js';
import {findQuantities,parseUnit,typeQuantity,sameQuantity,type QuantityKnowledge,type TypedQuantity,type ParsedUnit} from './quantity_knowledge.js';

export interface KnowledgeObservation1G extends Observation1G {
 /** Typed by the quantity knowledge; null: not a quantity, or its unit is unknown to the knowledge. */
 quantity:TypedQuantity|null;
 /** The unit's printed surface and where it was found. */
 unitSurface:string|null;unitFrom:'cell'|'label'|null;
 /** Another observation of the same cell printing this same quantity in another unit (conversion verified). */
 sameAs:string|null;sameAsReason:string|null;
}
export interface KnowledgeInterpretation1G {schema:'pee.table-interpretation.v1g+qk';readingIdentity:string;baseReadingIdentity:string;knowledge:string;
 tables:{table:number;status:string;observations:KnowledgeObservation1G[]}[]}

const BRACKETED=/[([]\s*(?:in\s+)?([^()[\]]{1,28}?)\s*[)\]]/g;
/** A unit a label prints for its values: "(m³/h)", "[dB]", "Noise (dBA)", "Weight (pounds / kg)" (several: ambiguous, none taken). */
export function unitInLabel1G(qk:QuantityKnowledge,label:string):{unit:ParsedUnit;surface:string}|null{
 const found:{unit:ParsedUnit;surface:string}[]=[];
 // a bracket may also state a condition ("(10%, in nits)"): each comma-separated part is tried, "in" is dropped
 for(const m of label.matchAll(BRACKETED))for(const part of m[1].split(/[,;]/)){const inner=part.trim().replace(/^in\s+/i,'');const u=inner?parseUnit(qk,inner):null;if(u)found.push({unit:u,surface:inner});}
 return found.length===1?found[0]:null;
}

/** Apply the knowledge to the 1G reading of a document. `base` may be passed to reuse an existing 1G reading. */
export function interpretWithKnowledge1G(html:string,qk:QuantityKnowledge,opts:{lessons?:readonly InterpreterLessonId1G[];base?:DocumentInterpretation1G;text?:TextModel1G}={}):KnowledgeInterpretation1G{
 // The layer reads the rendered cell text (v1g.2) unless a base reading or another text model is given.
 const text:TextModel1G=opts.base?(opts.base.version===INTERPRETER1G_RENDERED_VERSION?'rendered':'decoded'):opts.text??'rendered';
 const base=opts.base??interpretDocumentTables1G(html,{lessons:opts.lessons,text});
 const acq0=acquireTables1F(html,text==='rendered'?{rendered:true}:{});const acq=text==='rendered'?{...acq0,tables:acq0.tables.map(renderedView1G)}:acq0;const doc=documentModel1G(html);
 const tables=base.tables.map(t=>{
  const at=acq.tables[t.table];const cellText=new Map(at?.cells.map(c=>[c.id,c.normalisedText])??[]);
  const ctx=[at?.caption?.normalisedText??'',at?.context.headingPath.at(-1)?.decodedText??'',...(at?.context.before.slice(-2).map(b=>b.decodedText)??[]),
   ...t.context.filter(l=>l.applies).map(l=>doc.blocks[l.block]?.text??'')].filter(Boolean);
  const obs:KnowledgeObservation1G[]=t.observations.map(o=>{
   const labels=[...o.property,...o.records,...o.sourceCells.filter(id=>id!==o.cell).map(id=>cellText.get(id)??'')].filter(Boolean);
   let quantity:TypedQuantity|null=null,unitSurface:string|null=null,unitFrom:KnowledgeObservation1G['unitFrom']=null;
   if(o.kind==='quantity'||o.kind==='range'||o.kind==='bound'||o.kind==='number'){
    const f=findQuantities(qk,o.surface).find(x=>x.value===o.value||(o.low!==undefined&&x.low===o.low&&x.high===o.high))??null;
    if(f){quantity=typeQuantity(qk,{surface:f.surface,value:f.value,low:f.low,high:f.high,unit:f.unit},{labels,conditions:o.conditions,context:ctx});unitSurface=f.unitSurface;unitFrom='cell';}
    else if(o.value!==null||o.low!==undefined){
     // the unit printed in a label of the value (column or row header, caption)
     const lu=[...o.sourceCells.filter(id=>id!==o.cell).map(id=>cellText.get(id)??''),at?.caption?.normalisedText??''].map(l=>unitInLabel1G(qk,l)).find(Boolean)??null;
     if(lu){quantity=typeQuantity(qk,{surface:o.surface+' '+lu.surface,value:o.value,...(o.low!==undefined?{low:o.low,high:o.high}:{}),unit:lu.unit},{labels,conditions:o.conditions,context:ctx});unitSurface=lu.surface;unitFrom='label';}
    }}
   return {...o,quantity,unitSurface,unitFrom,sameAs:null,sameAsReason:null};});
  // the same quantity printed twice in one cell: the later expression points to the first
  const byCell=new Map<number,KnowledgeObservation1G[]>();for(const o of obs)if(o.quantity)byCell.set(o.cell,[...(byCell.get(o.cell)??[]),o]);
  // A re-expression is in ANOTHER unit (two equal values in the same unit are two quantities, e.g. width and depth); the
  // closest earlier unmatched value of the same product wins.
  for(const list of byCell.values()){const used=new Set<string>();for(let i=1;i<list.length;i++){const cur=list[i];
   const cands=list.slice(0,i).filter(p=>!p.sameAs&&!used.has(p.id)&&p.product===cur.product&&p.quantity!.unit.expression!==cur.quantity!.unit.expression&&sameQuantity(p.quantity!,cur.quantity!).same);
   const d=(p:KnowledgeObservation1G)=>Math.abs((p.quantity!.si?.value??0)-(cur.quantity!.si?.value??0));
   const prev=cands.sort((a,b)=>d(a)-d(b))[0];
   if(prev){cur.sameAs=prev.id;cur.sameAsReason=sameQuantity(prev.quantity!,cur.quantity!).reason;used.add(prev.id);}}}
  return {table:t.table,status:t.status,observations:obs};});
 return {schema:'pee.table-interpretation.v1g+qk',readingIdentity:base.readingIdentity+'+qk:'+qk.identity,baseReadingIdentity:base.readingIdentity,knowledge:qk.identity,tables};
}
