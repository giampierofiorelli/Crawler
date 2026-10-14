import test from 'node:test';
import assert from 'node:assert/strict';
import {fromTatrCells242,fromPaddleStructure242,fromHtmlTable242} from '../src/phase242_table_structure_bridge.js';
const meta={sourceId:'https://example.org/manual.pdf',sha256:'a'.repeat(64),page:4};
const cell=(r:number,c:number,t:string,h=false)=>({row_nums:[r],column_nums:[c],bbox:[10+c*100,10+r*40,100+c*100,45+r*40], 'cell text':t,'column header':h});
const tatr=[cell(0,0,'Parameter',true),cell(0,1,'Model A',true),cell(1,0,'Mass'),cell(1,1,'49 kg')];
test('242: TATR documented cell format retains image geometry and source context, no product inference',()=>{
 const r=fromTatrCells242(tatr,meta);assert.equal(r.rejected,0);assert.equal(r.tables[0].rowCount,2);
 assert.equal(r.tables[0].columnCount,2);assert.deepEqual(r.tables[0].cells[3].box,[110,50,200,85]);
 assert.equal(r.tables[0].cells[3].text,'49 kg');assert.equal(r.tables[0].rankingAuthorized,false);
 assert.ok(r.tables[0].cells.every(c=>c.semanticAssociation==='unresolved'));
});
test('242: TATR complete supercell may span multiple contiguous rows/cols',()=>{
 const r=fromTatrCells242([{...cell(0,0,'title',true),column_nums:[0,1]},cell(1,0,'Weight'),cell(1,1,'72 kg')],meta);
 assert.equal(r.tables.length,1);assert.deepEqual(r.tables[0].cells[0].columns,[0,1]);
});
test('242: TATR rejects overlapping assignments rather than silently overriding grid entries',()=>{
 assert.equal(fromTatrCells242([...tatr,cell(1,1,'77 kg')],meta).tables.length,0);
});
test('242: TATR rejects gaps or duplicate row / column indices',()=>{
 assert.equal(fromTatrCells242([{...cell(0,0,'mass'),column_nums:[0,2]}],meta).tables.length,0);
 assert.equal(fromTatrCells242([{...cell(0,0,'mass'),row_nums:[0,0]}],meta).tables.length,0);
});
test('242: TATR rejects invalid or missing boxes, text and provenance',()=>{
 assert.equal(fromTatrCells242([{...cell(0,0,'mass'),bbox:[0,0,0,100]}],meta).tables.length,0);
 assert.equal(fromTatrCells242([{...cell(0,0,'mass'),'cell text':undefined}],meta).tables.length,0);
 assert.equal(fromTatrCells242(tatr,{...meta,sha256:'not-digest'}).tables.length,0);
});
test('242: PaddleOCR documented pred_html creates table topology but NO guessed bbox alignment',()=>{
 const p={table_res_list:[{pred_html:'<html><body><table><thead><tr><th>Attribute</th><th>Variant</th></tr></thead><tbody><tr><td>Pressure</td><td>37 mbar</td></tr></tbody></table></body></html>',cell_box_list:[[2,3,4,5]],table_ocr_pred:{}}]};
 const r=fromPaddleStructure242(p,meta);assert.equal(r.rejected,0);assert.equal(r.tables.length,1);assert.equal(r.tables[0].cells.length,4);
 assert.equal(r.tables[0].cells[3].text,'37 mbar');assert.equal(r.tables[0].cells[3].box,null);
 assert.equal(r.tables[0].cells[3].textGeometryLinked,false);assert.equal(r.tables[0].rankingAuthorized,false);
 assert.match(r.tables[0].warnings.join('|'),/unmapped_cell_boxes:1/);
});
test('242: PaddleOCR HTML colspan/rowspan grid coordinates obey merged cells',()=>{
 const r=fromPaddleStructure242({table_res_list:[{pred_html:'<table><tr><th colspan="2">Header</th></tr><tr><td>Weight</td><td>49 kg</td></tr></table>'}]},meta);
 assert.deepEqual(r.tables[0].cells[0].columns,[0,1]);assert.deepEqual(r.tables[0].cells[2].columns,[1]);
 const s=fromPaddleStructure242({table_res_list:[{pred_html:'<table><tr><th rowspan="2">Weight</th><td>49 kg</td></tr><tr><td>50 kg</td></tr></table>'}]},meta);
 assert.equal(s.tables.length,1);assert.deepEqual(s.tables[0].cells[0].rows,[0,1]);
 assert.deepEqual(s.tables[0].cells[2].columns,[1]);
});
test('242: PaddleOCR refuses malformed or opaque nested table, rather than emitting facts',()=>{
 const candidates=['<table><tr><td>A</td><td>A</td></tr><table><tr><td>B</td></tr></table></table>',
 '<table><tr><td>Mass<script>unexpected</script></td></tr></table>',
 '<table><tr><td rowspan="0">bad</td></tr></table>',
 '<table><tr><td colspan="999">bad</td></tr></table>'];
 for(const html of candidates)assert.equal(fromPaddleStructure242({table_res_list:[{pred_html:html}]},meta).tables.length,0);
});
test('242: PaddleOCR rejects a row span extending beyond the actual table',()=>{
 const r=fromPaddleStructure242({table_res_list:[{pred_html:'<table><tr><td rowspan="3">Incomplete</td></tr></table>'}]},meta);
 assert.equal(r.tables.length,0);
});
test('242: PaddleOCR rejects multiple tables embedded in a single prediction',()=>{
 const r=fromPaddleStructure242({table_res_list:[{pred_html:'<table><tr><td>A</td></tr></table><table><tr><td>B</td></tr></table>'}]},meta);
 assert.equal(r.tables.length,0);
});
test('242: PaddleOCR supports multiple independently declared outputs while reporting rejected siblings',()=>{
 const r=fromPaddleStructure242({table_res_list:[{pred_html:'<table><tr><td>A</td></tr></table>'},{pred_html:'bad'}]},meta);
 assert.equal(r.tables.length,1);assert.equal(r.rejected,1);
});
test('242: neither vendor adapter ever promotes structural cells to product evidence',()=>{
 const a=fromTatrCells242(tatr,meta).tables[0],b=fromPaddleStructure242({table_res_list:[{pred_html:'<table><tr><td>4 kW</td></tr></table>'}]},meta).tables[0];
 for(const x of [a,b]){assert.equal(x.scientificEvidenceAdmitted,false);assert.equal(x.sourceRole,'unverified_document_layout');assert.equal(x.sourceDocumentStored,false);}
});

test('242: native HTML and Paddle model output preserve the same grid structure without inferring specs',()=>{
 const html='<table><thead><tr><th>Measurement</th><th>Series B</th></tr></thead><tbody><tr><td>Depth</td><td>68 cm</td></tr></tbody></table>';
 const native=fromHtmlTable242(html,meta).tables[0];
 const paddle=fromPaddleStructure242({table_res_list:[{pred_html:html}]},meta).tables[0];
 assert.deepEqual(native.cells,paddle.cells);assert.equal(native.provider,'html-native');
 assert.equal(native.rankingAuthorized,false);
});
test('242: unsupported multi-table HTML page fails closed; caller must locate individual tables',()=>{
 const h='<table><tr><td>Product X</td></tr></table><table><tr><td>Product Y</td></tr></table>';
 assert.equal(fromHtmlTable242(h,meta).tables.length,0);
});
test('242: installation clearance and applicability threshold remain unlabeled structural observations',()=>{
 const h='<table><tr><th>Installation clearance</th><td>600 mm</td></tr><tr><th>Applies only when</th><td>at least 2600 W</td></tr></table>';
 const r=fromHtmlTable242(h,meta);
 assert.equal(r.tables[0].cells.length,4);
 assert.ok(r.tables[0].cells.every(c=>c.semanticAssociation==='unresolved'));
 assert.equal(r.tables[0].scientificEvidenceAdmitted,false);
});
