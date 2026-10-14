import {fromTatrCells242,fromPaddleStructure242,fromHtmlTable242} from '../dist/src/phase242_table_structure_bridge.js';
const meta={sourceId:'synthetic://phase242/sample',sha256:'a'.repeat(64),page:1};
const html='<table><tr><th>Parameter</th><th>Model Q</th></tr><tr><td>Width</td><td>45 cm</td></tr></table>';
const tatr=[
 {row_nums:[0],column_nums:[0],bbox:[10,10,110,40],'column header':true,'cell text':'Parameter'},
 {row_nums:[0],column_nums:[1],bbox:[110,10,210,40],'column header':true,'cell text':'Model Q'},
 {row_nums:[1],column_nums:[0],bbox:[10,40,110,70],'cell text':'Width'},
 {row_nums:[1],column_nums:[1],bbox:[110,40,210,70],'cell text':'45 cm'},
];
const results={tatr:fromTatrCells242(tatr,meta),paddle:fromPaddleStructure242({table_res_list:[{pred_html:html,cell_box_list:[[10,10,40,20]]}]},meta),html:fromHtmlTable242(html,meta)};
console.log(JSON.stringify({schema:'pee242.model-free-synthetic.v1',realInference:false,modelsExecuted:0,originalDocumentsProcessed:0,
 providers:Object.fromEntries(Object.entries(results).map(([k,v])=>[k,{accepted:v.tables.length,rejected:v.rejected,
 rows:v.tables[0]?.rowCount??null,columns:v.tables[0]?.columnCount??null,cells:v.tables[0]?.cells.length??null,
 rankingAuthorized:v.tables[0]?.rankingAuthorized??null,allSemanticsUnresolved:v.tables.every(t=>t.cells.every(c=>c.semanticAssociation==='unresolved'))}])),
 claimsOfImprovedPDFRecall:false},null,2));
