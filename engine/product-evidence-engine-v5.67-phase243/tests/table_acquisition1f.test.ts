import test from 'node:test';import assert from 'node:assert/strict';
import {acquireTables1F,decodeHtml5Text1F,decodeHtml5Attribute1F} from '../src/table_acquisition1f.js';
import {parseHtml245,walk245} from '../src/phase245_html_dom.js';
import {readDocumentSemantics1D2} from '../src/document_semantics.js';
import {FIXTURES1F as F} from './table_acquisition1f_fixtures.js';

// Neutral table acquisition: boundary fixtures (FICTIONAL). The independent comparison with an HTML5 parser is
// scripts/table-acquisition-1f-verify.mjs (Chromium); these tests pin the contract.
const one=(html:string,i=0)=>acquireTables1F(html).tables[i];

test('NFKC-sensitive characters are kept as written; the legacy projection is unchanged',()=>{
 const t=one(F.nfkc);assert.equal(t.status,'complete');
 const text=t.cells.map(c=>c.decodedText);
 for(const s of ['21 m²','250 m³/h ½ speed','Beta B2 ﬁlter','１２ µm','4 Ω'])assert.ok(text.includes(s),s);
 assert.ok(t.cells.some(c=>c.legacyText==='21 m2'),'legacy text (textOf245) still normalises: it is not changed');
});
test('citation markers, footnote markers and hidden content stay available with their structural roles',()=>{
 const t=one(F.markers);assert.equal(t.status,'complete');
 const c=(s:string)=>t.cells.find(x=>x.decodedText.startsWith(s))!;
 assert.equal(c('41 dB').decodedText,'41 dB[3] [a]');assert.ok(c('41 dB').elements.some(e=>e.roles.includes('citation_marker')));
 assert.equal(c('Alpha').decodedText,'Alpha A1 ★');assert.ok(c('Alpha').elements.some(e=>e.roles.includes('hidden')));
 const price=c('£99');assert.equal(price.decodedText,'£99 old £1201');
 assert.ok(price.elements.some(e=>e.roles.includes('footnote_marker')));
 assert.deepEqual(price.links[0].fragmentTarget,{resolved:true,locator:'html>body>article>ol>li',tag:'li',decodedText:'Measured at 1 m.'});
 const hidden=price.elements.find(e=>e.roles.includes('hidden'))!;assert.equal(price.decodedText.slice(hidden.start,hidden.end),'old £120');
});
test('character references follow the HTML5 tokenizer, in text and in attribute values; CR/LF normalised',()=>{
 const t=one(F.references);
 assert.equal(t.cells[3].decodedText,'♥ ¬it; & text € � 😀 & ≂̸ &unknownref; � a\rb');
 assert.equal(t.cells[5].decodedText,'line1\nline2\nline3');
 assert.equal(t.cells[0].attrs.title,'&notit; &amp=x','attribute rule: a legacy name followed by "=" or an alphanumeric is not decoded');
 assert.equal(t.cells[2].links[0].href,'/p?a=1&copy=2&b=3&notin');assert.equal(t.cells[2].links[0].rawHref,'/p?a=1&copy=2&amp;b=3&notin');
 assert.ok(t.cells[3].raw!.includes('&hearts;'),'raw source kept byte for byte');
 assert.equal(decodeHtml5Text1F('&notin'),'¬in');assert.equal(decodeHtml5Attribute1F('&notin'),'&notin');
});
test('nested tables are acquired as tables of their own and referenced from the containing cell',()=>{
 const d=acquireTables1F(F.nested);assert.equal(d.tables.length,2);
 const [outer,inner]=d.tables;assert.equal(outer.status,'complete');assert.equal(inner.status,'complete');
 assert.equal(inner.nested,true);assert.deepEqual(inner.containingCell,{table:0,cell:2});assert.deepEqual(outer.cells[2].nestedTables,[1]);
 assert.equal(outer.cells[2].decodedText,'pinner 5 Wq','the containing cell keeps the nested text');
 const sem=readDocumentSemantics1D2(F.nested,'https://x.test/a');
 assert.deepEqual(sem.tablesNotRead?.map(x=>x.reason),['nested'],'the semantic contract lists the table it does not read');
});
test('more than 60 columns: incomplete, every dropped cell listed with its content; the semantic contract says so',()=>{
 const t=one(F.wide);assert.equal(t.status,'incomplete');assert.deepEqual(t.reasons,[{code:'column_limit',count:10}]);
 const dropped=t.cells.filter(c=>c.droppedBy==='column_limit');assert.equal(dropped.length,10);assert.ok(dropped.every(c=>c.gridRow===null&&c.decodedText));
 assert.equal(t.cells.length,130);
 const sem=readDocumentSemantics1D2(F.wide,'https://x.test/a');assert.equal(sem.tables[0].acquisition?.status,'incomplete');
});
test('more than 40 tables: all acquired; the semantic contract lists the ones beyond its limit',()=>{
 const d=acquireTables1F(F.many);assert.equal(d.tables.length,42);assert.ok(d.tables.every(t=>t.status==='complete'));
 const sem=readDocumentSemantics1D2(F.many,'https://x.test/a');assert.equal(sem.tables.length,40);
 assert.deepEqual(sem.tablesNotRead?.map(x=>x.reason),['table_limit_40','table_limit_40']);
});
test('merged cells: spans, rowspan=0 and coordinates; each source cell once',()=>{
 const t=one(F.merged);assert.equal(t.status,'complete');assert.equal(t.caption?.decodedText,'Synthetic merged');
 const g=(s:string)=>t.cells.find(c=>c.decodedText===s)!;
 assert.deepEqual([g('Model').rowspan,g('Model').colspan,g('Noise (dBA)').colspan,g('55').rowspan,g('all').rowspan],[2,1,2,2,2]);
 assert.deepEqual([g('all').gridRow,g('all').gridCol],[5,1]);assert.equal(g('Note: tested at 1 m').colspan,3);
 assert.equal(new Set(t.cells.map(c=>c.locator)).size,t.cells.length);
 assert.deepEqual(t.sections.map(s=>s.tag),['thead','tbody']);assert.equal(g('Low').section,'thead');
});
test('implied end tags: raw slices end where the cell ends; text is exact (no block spacing added)',()=>{
 const t=one(F.implied);assert.deepEqual(t.cells.map(c=>c.raw),['<td>a','<td>b','<td colspan=2>c<p>para<div>block</div></td>']);
 assert.equal(t.cells[2].decodedText,'cparablock');assert.equal(t.cells[2].normalisedText,'cparablock');
});
test('content an HTML5 parser would move out of the table makes it incomplete; tables in raw-text elements are listed',()=>{
 const t=one(F.foster);assert.equal(t.status,'incomplete');assert.equal(t.reasons[0].code,'content_outside_cells');
 assert.deepEqual(t.outsideCellContent.map(o=>[o.kind,o.raw]),[['element','<div>misplaced</div>'],['text','stray text']]);
 const d=acquireTables1F(F.raw_table);assert.equal(d.tables.length,1);
 assert.deepEqual(d.unparsedTables.map(u=>[u.tag,u.reasons[0].code]),[['noscript','table_in_raw_text_element']]);
});
test('neutral document context: heading path, nearby blocks and figure caption, without interpretation',()=>{
 const t=one(F.figure);
 assert.deepEqual(t.context.headingPath.map(h=>[h.level,h.decodedText]),[[1,'Guide'],[2,'Noise']]);
 assert.deepEqual(t.context.before.map(b=>b.decodedText),['Before one.']);
 assert.deepEqual(t.context.after.map(b=>b.decodedText),['Figure 1: noise','After one.'],'stops at the next heading');
 assert.equal(t.context.figure?.caption?.decodedText,'Figure 1: noise');
});
test('legacy parse is unchanged: keepSource only adds source fields',()=>{
 for(const html of Object.values(F)){const ser=(n:unknown)=>JSON.stringify(n,(k,v)=>['parent','src','rawText','rawAttrs','implied'].includes(k)?undefined:v);
  const a=parseHtml245(html),b=parseHtml245(html,{keepSource:true});assert.equal(ser(b.root),ser(a.root));
  assert.ok([...walk245(a.root)].every(n=>n.src===undefined&&n.rawText===undefined),'default parse carries no source fields');}
});
