/**
 * Quantity knowledge applied to a 1G table interpretation (GK, 2026-10-18). The published 1G interpreter is not changed:
 * this layer takes its frozen output and adds, per observation, what the quantity knowledge establishes (kind, metric,
 * frequency weighting, required and stated conditions, SI value) and which observations print the same quantity twice
 * ("147 CFM (250 m³/h)"). The result carries its own reading identity (1G identity + knowledge identity), so a
 * knowledge-informed reading is never confused with the baseline reading.
 */
import {createHash} from 'node:crypto';
import {acquireTables1F} from './table_acquisition1f.js';
import {documentModel1G,interpretDocumentTables1G,renderedView1G,INTERPRETER1G_RENDERED_VERSION,type TextModel1G,type DocumentInterpretation1G,type Observation1G} from './table_interpreter1g.js';
import type {InterpreterLessonId1G} from './table_interpreter1g_lessons.js';
import {hasPhrase,findQuantities,typeQuantity,sameQuantity,unitStatedInLabel,withLabelBasis,typeLabelledNumber,typeClass,relationChecks,type QuantityKnowledge,type TypedQuantity,type ParsedUnit,type TypedClass,type RelationCheck} from './quantity_knowledge.js';

export interface KnowledgeObservation1G extends Observation1G {
 /** Typed by the quantity knowledge; null: not a quantity, or its unit is unknown to the knowledge. */
 quantity:TypedQuantity|null;
 /** The unit's printed surface and where it was found. */
 unitSurface:string|null;unitFrom:'cell'|'label'|'metric'|null;
 /** v2: the reporting basis a label added to the unit ("daily" + L = L/day). */
 labelBasis:string|null;
 /** v2: a class value ("A+++", "H13") typed against the knowledge's ordinal scales. */
 scaleClass:TypedClass|null;
 /** Another observation of the same cell printing this same quantity in another unit (conversion verified). */
 sameAs:string|null;sameAsReason:string|null;
}
export interface KnowledgeInterpretation1G {schema:'pee.table-interpretation.v1g+qk';readingIdentity:string;baseReadingIdentity:string;knowledge:string;
 tables:{table:number;status:string;observations:KnowledgeObservation1G[];
  /** v2: relations the knowledge holds, checked per product on this table's typed values. */
  relationChecks:{product:string|null;check:RelationCheck}[]}[]}

/** A unit a label prints for its values (kept for callers; the knowledge's own reader since v2). */
export function unitInLabel1G(qk:QuantityKnowledge,label:string):{unit:ParsedUnit;surface:string}|null{return unitStatedInLabel(qk,label);}

/** Apply the knowledge to the 1G reading of a document. `base` may be passed to reuse an existing 1G reading. */
export function interpretWithKnowledge1G(html:string,qk:QuantityKnowledge,opts:{lessons?:readonly InterpreterLessonId1G[];base?:DocumentInterpretation1G;text?:TextModel1G;productGroup?:string}={}):KnowledgeInterpretation1G{
 // The layer reads the rendered cell text (v1g.2) unless a base reading or another text model is given.
 const text:TextModel1G=opts.base?(opts.base.version===INTERPRETER1G_RENDERED_VERSION?'rendered':'decoded'):opts.text??'rendered';
 const base=opts.base??interpretDocumentTables1G(html,{lessons:opts.lessons,text});
 // KN K9: statements the document makes once about how its values were obtained (an instrument, a declared scheme):
 // every block naming a document-wide kind justification of the knowledge. Applied defeasibly per value by typeQuantity.
 const docEv=(qk.pack.kindEvidence??[]).filter(e=>e.justification!=='contextual');
 const source='doc:'+createHash('sha256').update(html).digest('hex').slice(0,16);
 const doc0=documentModel1G(html);
 // A method sentence is usually followed by its results ("We measured … with a noise meter." "At the lowest speed it
 // operates at 40.2 dBA."): the statement takes in the next two text blocks of the same section.
 const sameSec=(a:typeof doc0.blocks[number],b:typeof doc0.blocks[number])=>a.sectionPath.join('/')===b.sectionPath.join('/');
 const protocol=doc0.blocks.filter(b=>b.text&&docEv.some(e=>e.terms.some(t=>hasPhrase(b.text,t)))).map(b=>{
  const next=doc0.blocks.slice(b.index+1).filter(n=>n.text).slice(0,2).filter(n=>sameSec(n,b));
  return {text:[b.text,...next.map(n=>n.text)].join(' '),ref:'block '+b.index+(next.length?'-'+next.at(-1)!.index:'')};});
 const acq0=acquireTables1F(html,text==='rendered'?{rendered:true}:{});const acq=text==='rendered'?{...acq0,tables:acq0.tables.map(renderedView1G)}:acq0;const doc=doc0;
 const tables=base.tables.map(t=>{
  const at=acq.tables[t.table];const cellText=new Map(at?.cells.map(c=>[c.id,c.normalisedText])??[]);
  // a method note inside the table (an info cell, a footnote row) speaks about this table's values of its measurand: it
  // is more specific than the class the table heading suggests, so it covers every evidence class here (KN K9)
  const tableNotes=(at?.cells??[]).filter(c=>docEv.some(e=>e.terms.some(tm=>hasPhrase(c.normalisedText,tm)))).map(c=>({text:c.normalisedText,ref:`table ${t.table} cell ${c.id}`,inTable:true}));
  const ctx=[at?.caption?.normalisedText??'',at?.context.headingPath.at(-1)?.decodedText??'',...(at?.context.before.slice(-2).map(b=>b.decodedText)??[]),
   ...t.context.filter(l=>l.applies).map(l=>doc.blocks[l.block]?.text??'')].filter(Boolean);
  const obs:KnowledgeObservation1G[]=t.observations.map(o=>{
   const labels=[...o.property,...o.records,...o.sourceCells.filter(id=>id!==o.cell).map(id=>cellText.get(id)??'')].filter(Boolean);
   let quantity:TypedQuantity|null=null,unitSurface:string|null=null,unitFrom:KnowledgeObservation1G['unitFrom']=null,labelBasis:string|null=null;
   const tctx={labels,conditions:o.conditions,context:ctx,protocol:[...tableNotes,...protocol],evidenceClass:o.evidence.class,source,cohort:`${source}#table ${t.table}#${[...o.property,...o.records,...o.conditions].join(' | ')}`};
   const withBasis=(u:ParsedUnit)=>{const b=withLabelBasis(qk,u,labels);if(b){labelBasis=b.basis;return b.unit;}return u;};
   if(o.kind==='quantity'||o.kind==='range'||o.kind==='bound'||o.kind==='number'){
    // the value is read in its whole cell (a dimension list or an axis letter is visible only there), then in its own surface
    const same=(x:{value:number|null;low?:number;high?:number})=>x.value===o.value||(o.low!==undefined&&x.low===o.low&&x.high===o.high);
    const inCell=findQuantities(qk,cellText.get(o.cell)??'');const listed=inCell.filter(x=>x.axis!==undefined);
    const f=inCell.find(x=>same(x)&&o.surface.includes(String(x.value??x.low)))??(listed.some(same)?null:findQuantities(qk,o.surface).find(same)??null);
    if(f){quantity=typeQuantity(qk,{surface:f.surface,value:f.value,low:f.low,high:f.high,unit:withBasis(f.unit)},tctx);unitSurface=f.unitSurface;unitFrom='cell';}
    // a header's unit is the unit of a cell's unitless numbers only when the cell prints no unit of its own: in
    // "Speed 1 / 40.2 dBA" the 1 belongs to a label, not to the decibels of the column header (KN K9)
    else if((o.value!==null||o.low!==undefined)&&!inCell.length){
     // the unit a label of the value states (column or row header, its in-cell label, caption): "(m³/h)", "in watts"
     const lu=[...o.sourceCells.filter(id=>id!==o.cell).map(id=>cellText.get(id)??''),...o.property,at?.caption?.normalisedText??''].map(l=>unitStatedInLabel(qk,l)).find(Boolean)??null;
     if(lu){quantity=typeQuantity(qk,{surface:o.surface+' '+lu.surface,value:o.value,...(o.low!==undefined?{low:o.low,high:o.high}:{}),unit:withBasis(lu.unit)},tctx);unitSurface=lu.surface;unitFrom='label';}
     else{const lq=typeLabelledNumber(qk,{surface:o.surface,value:o.value,...(o.low!==undefined?{low:o.low,high:o.high}:{})},tctx);if(lq){quantity=lq;unitFrom='metric';}}
    }}
   const scaleClass=o.kind==='text'||o.kind==='identifier'?typeClass(qk,o.surface,{labels,productGroup:opts.productGroup}):null;
   return {...o,quantity,unitSurface,unitFrom,labelBasis,scaleClass,sameAs:null,sameAsReason:null};});
  // the same quantity printed twice in one cell: the later expression points to the first
  const byCell=new Map<number,KnowledgeObservation1G[]>();for(const o of obs)if(o.quantity)byCell.set(o.cell,[...(byCell.get(o.cell)??[]),o]);
  // A re-expression is in ANOTHER unit (two equal values in the same unit are two quantities, e.g. width and depth); the
  // closest earlier unmatched value of the same product wins.
  for(const list of byCell.values()){const used=new Set<string>();for(let i=1;i<list.length;i++){const cur=list[i];
   const cands=list.slice(0,i).filter(p=>!p.sameAs&&!used.has(p.id)&&p.product===cur.product&&p.quantity!.unit.expression!==cur.quantity!.unit.expression&&sameQuantity(p.quantity!,cur.quantity!).same);
   const d=(p:KnowledgeObservation1G)=>Math.abs((p.quantity!.si?.value??0)-(cur.quantity!.si?.value??0));
   const prev=cands.sort((a,b)=>d(a)-d(b))[0];
   if(prev){cur.sameAs=prev.id;cur.sameAsReason=sameQuantity(prev.quantity!,cur.quantity!).reason;used.add(prev.id);}}}
  // relations checked per product over the table's typed values (a re-expression is the same value: not counted twice)
  const byProduct=new Map<string|null,TypedQuantity[]>();for(const o of obs)if(o.quantity&&!o.sameAs)byProduct.set(o.product,[...(byProduct.get(o.product)??[]),o.quantity]);
  const checks=[...byProduct].flatMap(([product,vs])=>relationChecks(qk,vs).map(check=>({product,check})));
  return {table:t.table,status:t.status,observations:obs,relationChecks:checks};});
 return {schema:'pee.table-interpretation.v1g+qk',readingIdentity:base.readingIdentity+'+qk:'+qk.identity,baseReadingIdentity:base.readingIdentity,knowledge:qk.identity,tables};
}
