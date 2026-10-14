/**
 * Phase 242: model-neutral transient table grid.
 * Adapted to the documented OUTPUT SHAPES of Microsoft Table Transformer and
 * PaddleOCR PP-StructureV3. No third-party source code is copied and neither
 * library is installed or invoked. Tables are NOT product facts or evidence.
 */
export type Rect242 = [number, number, number, number];
export type TableProvider242 = 'table-transformer' | 'paddleocr-ppstructurev3' | 'html-native';
export type TableCell242 = {
  rows: number[];
  columns: number[];
  text: string;
  box: Rect242 | null;
  headerHint: boolean;
  projectedRowHeaderHint: boolean;
  textGeometryLinked: boolean;
  semanticAssociation: 'unresolved';
};
export type TableGrid242 = {
  schema: 'pee242.transient-table-grid.v1';
  provider: TableProvider242;
  page: number;
  sourceId: string;
  sourceDocumentSha256: string;
  rowCount: number;
  columnCount: number;
  cells: TableCell242[];
  warnings: string[];
  sourceRole: 'unverified_document_layout';
  sourceDocumentStored: false;
  rankingAuthorized: false;
  scientificEvidenceAdmitted: false;
};
export type TableBridge242 = {tables: TableGrid242[]; rejected: number; reasons: string[]};

const MAX_CELLS=600;
const obj=(v:unknown):Record<string,unknown>|null => v!==null&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:null;
const text=(v:unknown):string|null=>typeof v==='string'&&v.length<=5000?v:null;
const numeric=(v:unknown):number|null=>typeof v==='number'&&Number.isFinite(v)?v:null;
const rect=(v:unknown):Rect242|null=>{
 if(!Array.isArray(v)||v.length!==4)return null;
 const nums=v.map(numeric);if(nums.some(n=>n===null))return null;
 const b=nums as Rect242;
 if(b[0]<0||b[1]<0||b[2]<=b[0]||b[3]<=b[1]||b.some(n=>n>100000))return null;
 return b;
};
const indexes=(v:unknown):number[]|null=>{
 if(!Array.isArray(v)||!v.length||v.length>100)return null;
 if(v.some(x=>typeof x!=='number'||!Number.isInteger(x)||x<0||x>=MAX_CELLS))return null;
 const sorted=[...(v as number[])].sort((a,b)=>a-b);
 if(new Set(sorted).size!==sorted.length)return null;
 if(sorted.some((n,i)=>i&&n!==sorted[i-1]+1))return null;
 return sorted;
};
function makeGrid(provider:TableProvider242, page:number,sourceId:string,sha:string,cells:TableCell242[],warnings:string[]):TableGrid242|null {
 if(!Number.isSafeInteger(page)||page<1||page>100000||!sourceId||sourceId.length>2048||!/^[0-9a-f]{64}$/i.test(sha)||cells.length<1||cells.length>MAX_CELLS)return null;
 const rowCount=Math.max(...cells.flatMap(c=>c.rows))+1;
 const columnCount=Math.max(...cells.flatMap(c=>c.columns))+1;
 if(rowCount>MAX_CELLS||columnCount>MAX_CELLS)return null;
 const occupied=new Set<string>();
 for(const c of cells){
  for(const r of c.rows)for(const col of c.columns){const id=r+'|'+col;if(occupied.has(id))return null;occupied.add(id);}
 }
 // An incomplete header row is not evidence that column labels are known;
 // this contract does not interpret even complete rows as product identities.
 return {schema:'pee242.transient-table-grid.v1',provider,page,sourceId,sourceDocumentSha256:sha,rowCount,columnCount,cells,
  warnings,sourceRole:'unverified_document_layout',sourceDocumentStored:false,rankingAuthorized:false,scientificEvidenceAdmitted:false};
}
function reject(reason:string):TableBridge242{return {tables:[],rejected:1,reasons:[reason]};}

/** Input is the documented `cells` array returned by TATR recognize/extract.
 * TATR requires an additional PDF-token/OCR input for `cell text`.
 * A table with missing, overlapping or discontinuous grid indices is rejected.
 */
export function fromTatrCells242(raw:unknown,meta:{sourceId:string;sha256:string;page:number}):TableBridge242{
 if(!Array.isArray(raw)||raw.length<1||raw.length>MAX_CELLS)return reject('tatr_missing_or_oversized_cells');
 const cells:TableCell242[]=[];
 for(const item of raw){
  const c=obj(item);if(!c)return reject('tatr_invalid_cell');
  const rows=indexes(c.row_nums),cols=indexes(c.column_nums),bbox=rect(c.bbox);
  if(!rows||!cols||!bbox)return reject('tatr_invalid_grid_or_box');
  const value=text(c['cell text']);
  if(value===null)return reject('tatr_missing_cell_text');
  cells.push({rows,columns:cols,text:value,box:bbox,headerHint:c['column header']===true,
   projectedRowHeaderHint:c['projected row header']===true,textGeometryLinked:true,semanticAssociation:'unresolved'});
 }
 const table=makeGrid('table-transformer',meta.page,meta.sourceId,meta.sha256,cells,
   ['tatr_boxes_are_image_coordinates','cell_content_and_header_labels_not_product_identification']);
 return table?{tables:[table],rejected:0,reasons:[]}:reject('tatr_invalid_table_topology_or_metadata');
}

// PaddleOCR exposes pred_html for the grid and cell_box_list separately.
// Documentation does not guarantee an indexed one-to-one correspondence of
// their elements, so we MUST NOT guess text->bbox associations.
function decodeEntities(str:string):string|null{
 if(/<|>/.test(str))return null;
 const whitelist:{[key:string]:string}={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
 return str.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi,(m,k:string)=>{
  if(k.startsWith('#')){const hex=k[1]?.toLowerCase()==='x';const val=Number.parseInt(k.slice(hex?2:1),hex?16:10);
   return val>=32&&val<=0x10ffff&&!((val>=0xd800)&&(val<=0xdfff))?String.fromCodePoint(val):'�';}
  return whitelist[k.toLowerCase()]??m;
 });
}
function parseSimpleTableHtml242(html:string):TableCell242[]|null{
 if(html.length>140_000||/<(?:script|style|svg|iframe|img|table)\b[^>]*>[\s\S]*<table\b/i.test(html))return null;
 // Reject nested tables, stray non-table structure, and unexpected attributes.
 const matches=[...html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table\s*>/gi)];
 if(matches.length!==1)return null;
 let src=matches[0][1].replace(/<\/?(?:tbody|thead|tfoot)\s*>/gi,'').trim();
 const rowMatches=[...src.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)];
 if(rowMatches.length<1||rowMatches.length>MAX_CELLS)return null;
 if(src.replace(/<tr\b[^>]*>[\s\S]*?<\/tr\s*>/gi,'').trim())return null;
 const cells:TableCell242[]=[];const occupied=new Set<string>();
 for(let row=0;row<rowMatches.length;row++){
  const rowHtml=rowMatches[row][1];
  if(/<tr\b/i.test(rowHtml))return null;
  const cs=[...rowHtml.matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi)];
  if(!cs.length||cs.length>MAX_CELLS)return null;
  if(rowHtml.replace(/<(th|td)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'').trim())return null;
  let col=0;
  for(const m of cs){
   const attrs=m[2];
   // Reject HTML produced outside a simple validated table cell shape.
   const recognized=attrs.replace(/\b(?:rowspan|colspan)\s*=\s*(?:"[0-9]+"|'[0-9]+'|[0-9]+)/gi,'').trim();
   if(recognized)return null;
   const attr=(k:string)=>new RegExp('\\b'+k+'\\s*=\\s*(?:"([0-9]+)"|\'([0-9]+)\'|([0-9]+))','i').exec(attrs);
   const rowSpan=Number(attr('rowspan')?.slice(1).find(Boolean)??'1'),colSpan=Number(attr('colspan')?.slice(1).find(Boolean)??'1');
   if(!Number.isSafeInteger(rowSpan)||!Number.isSafeInteger(colSpan)||rowSpan<1||colSpan<1||rowSpan>30||colSpan>30||row+rowSpan>MAX_CELLS)return null;
   while(occupied.has(row+'|'+col))col++;
   if(col+colSpan>MAX_CELLS)return null;
   const val=decodeEntities(m[3]);if(val===null||val.length>5000)return null;
   const rows=Array.from({length:rowSpan},(_,i)=>row+i),columns=Array.from({length:colSpan},(_,i)=>col+i);
   for(const r of rows)for(const x of columns){const idx=r+'|'+x;if(occupied.has(idx))return null;occupied.add(idx);}
   cells.push({rows,columns,text:val.trim(),box:null,headerHint:m[1].toLowerCase()==='th',
    projectedRowHeaderHint:false,textGeometryLinked:false,semanticAssociation:'unresolved'});
   col+=colSpan;
  }
  if(cells.length>MAX_CELLS)return null;
 }
 if(cells.some(c=>c.rows.some(r=>r>=rowMatches.length)))return null;
 return cells;
}
export function fromPaddleStructure242(raw:unknown,meta:{sourceId:string;sha256:string;page:number}):TableBridge242 {
 const envelope=obj(raw);const candidates=envelope?.table_res_list;
 if(!Array.isArray(candidates)||!candidates.length||candidates.length>30)return reject('paddle_no_supported_table_results');
 const tables:TableGrid242[]=[];const reasons:string[]=[];
 for(const t of candidates){
  const v=obj(t);const html=v&&text(v.pred_html);
  if(!html){reasons.push('paddle_no_pred_html');continue;}
  const cells=parseSimpleTableHtml242(html);
  if(!cells){reasons.push('paddle_html_grid_not_safe');continue;}
  const boxes=Array.isArray(v?.cell_box_list)?v.cell_box_list:[];
  // Do not assign unverified geometry to parsed HTML cells.
  const grid=makeGrid('paddleocr-ppstructurev3',meta.page,meta.sourceId,meta.sha256,cells,
   ['paddle_pred_html_structure_only','cell_box_list_not_assumed_order_aligned',`unmapped_cell_boxes:${boxes.length}`]);
  if(grid)tables.push(grid);else reasons.push('paddle_invalid_grid_or_metadata');
 }
 return {tables,rejected:reasons.length,reasons};
}

/** Basic HTML page-table adapter: same topology contract as the model workers.
 * It does not infer product ownership or parse arbitrary DOM/web components;
 * multi-table and malformed pages are deliberately rejected.
 */
export function fromHtmlTable242(html:unknown,meta:{sourceId:string;sha256:string;page:number}):TableBridge242{
 if(typeof html!=='string')return reject('html_not_string');
 const cells=parseSimpleTableHtml242(html);
 if(!cells)return reject('html_not_a_single_supported_table');
 const grid=makeGrid('html-native',meta.page,meta.sourceId,meta.sha256,cells,
  ['html_source_authored_grid_only','semantics_and_product_variant_unresolved']);
 return grid?{tables:[grid],rejected:0,reasons:[]}:reject('html_invalid_grid_or_metadata');
}
