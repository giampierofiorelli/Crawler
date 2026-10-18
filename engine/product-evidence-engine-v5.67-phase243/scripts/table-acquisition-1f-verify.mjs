#!/usr/bin/env node
/** Independent verification of the neutral table acquisition (src/table_acquisition1f.ts) against Chromium's HTML5 parser.
 *
 * Oracle: DOMParser (a conforming HTML5 tree builder, scripting disabled) in headless Chromium, plus a grid computed here
 * from the oracle DOM by the HTML table model (independent of src/phase245_table_grid.ts). Nothing is fetched: documents
 * are the boundary fixtures (dist/tests/table_acquisition1f_fixtures.js) and, when present, retained private pages
 * (PEE_PRIVATE_EVAL_DIR or ~/.local/share/product-evidence-engine/private-eval). Output: counts only on stdout; with
 * --verbose also the differing cells (may contain retained page text: never redirect it into the repository).
 *
 * Checks, for every table PEE declares complete: same number of source cells; per cell the same grid anchor, rowspan,
 * colspan, th markup, attributes (decoded), link hrefs, descendant element sequence (tbody elements the HTML5 parser
 * inserts are not source information) and decoded text (exact, raw-text elements excluded on both sides); the raw source slice re-parsed by the oracle gives the same cell text; same caption;
 * same heading path. Tables declared incomplete or unsupported are listed with their reasons. Also every entry of the
 * named character-reference table is decoded by the oracle and compared.
 * Usage: node scripts/table-acquisition-1f-verify.mjs [--verbose] [--no-private] */
import {readFileSync,existsSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createRequire} from 'node:module';
const VERBOSE=process.argv.includes('--verbose');const D=resolve('dist/src');
const A=await import(D+'/table_acquisition1f.js');const NR=await import(D+'/html5_named_references.js');
const {FIXTURES1F}=await import(resolve('dist/tests/table_acquisition1f_fixtures.js'));
const req=createRequire(import.meta.url);let pw=null;
for(const p of [process.env.PLAYWRIGHT_MODULE,'playwright','/opt/node-tools/node_modules/playwright'].filter(Boolean)){try{pw=req(p);break;}catch{}}
if(!pw)throw Error('playwright (with a local Chromium) is required for the independent comparison');
const E0=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
// The nine retained tables of the acquisition quick test (page, index among non-nested tables).
const AUTHENTIC=[['phase270/w_vs_oven',0],['phase270/tr_electricity',0],['phase271/t_ninja_doublestack',1],['phase272/u_ap_hf_puroair_240',3],['step1c/s1c_ap_hf_bedroom',0],
 ['phase272/u_tv_tg_lg_b6',0],['step1d-b/s1db_ap_apf_a231_hpa100',2],['step1d-b/s1db_ap_apf_a231_p800',0],['step1d-b/s1db_dh_ih_best',0]];
const docs=Object.entries(FIXTURES1F).map(([k,html])=>({id:'fixture:'+k,html,only:null}));
if(!process.argv.includes('--no-private'))for(const [p,ti] of AUTHENTIC){const f=join(E0,p.split('/')[0],'raw',p.split('/')[1]+'.html');if(existsSync(f))docs.push({id:'retained:'+p,html:readFileSync(f,'utf8'),only:ti});}

const browser=await pw.chromium.launch();const page=await (await browser.newContext()).newPage();await page.goto('about:blank');
const RAWTAGS=['script','style','textarea','title','noscript','template','xmp','iframe','noembed','noframes'];
const oracle=(html)=>page.evaluate(([html,RAWTAGS])=>{
 const doc=new DOMParser().parseFromString(html,'text/html');const RAW=new Set(RAWTAGS);
 const inRaw=(e,stop=null)=>{for(let a=e.parentElement;a&&a!==stop;a=a.parentElement)if(RAW.has(a.localName))return true;return false;};
 const text=n=>{const c=n.cloneNode(true);for(const r of [...c.querySelectorAll(RAWTAGS.join(','))])r.remove();return c.textContent;};
 // descendant elements; the content of raw-text elements is not markup in the acquisition contract
 const tags=n=>[...n.querySelectorAll('*')].filter(e=>!inRaw(e,n)).map(e=>e.localName);
 const all=[...doc.querySelectorAll('table')];const tables=all.filter(t=>!inRaw(t));
 const headings=[...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(h=>!inRaw(h));
 const out=tables.map(t=>{const secs=[];let loose=[];for(const c of t.children){const n=c.localName;if(n==='tr'){loose.push(c);continue;}if(['thead','tbody','tfoot'].includes(n)){if(loose.length){secs.push(loose);loose=[];}secs.push([...c.children].filter(r=>r.localName==='tr'));}}if(loose.length)secs.push(loose);
  const cells=[],slot=[];let base=0;
  for(const s of secs){for(let r=0;r<s.length;r++){const row=base+r;slot[row]??=[];let col=0;
   for(const td of [...s[r].children].filter(x=>x.localName==='td'||x.localName==='th')){while(slot[row][col]!==undefined)col++;
    const rs=td.rowSpan===0?s.length-r:Math.min(td.rowSpan,s.length-r);const cs=td.colSpan;const id=cells.length;
    cells.push({row,col,rowspan:rs,colspan:cs,header:td.localName==='th',text:text(td),attrs:Object.fromEntries([...td.attributes].map(a=>[a.name,a.value])),
     links:[...td.querySelectorAll('a[href]')].filter(a=>!inRaw(a,td)).map(a=>a.getAttribute('href')),tags:tags(td)});
    for(let dr=0;dr<rs;dr++){slot[row+dr]??=[];for(let dc=0;dc<cs;dc++)if(slot[row+dr][col+dc]===undefined)slot[row+dr][col+dc]=id;}col+=cs;}}base+=s.length;}
  let hp=[];for(const h of headings){if(h.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING&&!h.contains(t)){const L=+h.localName[1];hp=hp.filter(x=>x.level<L);hp.push({level:L,text:text(h)});}}
  const cap=[...t.children].find(c=>c.localName==='caption');
  return {nested:!!t.parentElement.closest('table'),cells,caption:cap?text(cap):null,headingPath:hp};});
 return {tables:out,tablesInRaw:all.length-tables.length};
},[html,RAWTAGS]);
const reparse=(raw)=>page.evaluate(([raw,RAWTAGS])=>{const d=new DOMParser().parseFromString(`<table><tbody><tr>${raw}</tr></tbody></table>`,'text/html');const td=d.querySelector('td,th');if(!td)return null;
 const c=td.cloneNode(true);for(const r of [...c.querySelectorAll(RAWTAGS.join(','))])r.remove();return c.textContent;},[raw,RAWTAGS]);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const summary={documents:docs.length,tables:0,complete:0,incomplete:0,unsupported:0,cellsCompared:0,cellDiscrepancies:0,rawSliceDiscrepancies:0,captionDiscrepancies:0,headingDiscrepancies:0,
 tableCountMismatch:0,notComplete:[],unparsedTablesVsOracleRaw:[],byDocument:[]};
for(const d of docs){const mine=A.acquireTables1F(d.html);const o=await oracle(d.html);
 if(mine.tables.length!==o.tables.length){summary.tableCountMismatch++;if(VERBOSE)console.log(d.id,'tables',mine.tables.length,o.tables.length);}
 const pairs=mine.tables.map((t,i)=>[t,o.tables[i]]);
 const sel=d.only===null?pairs:[pairs.filter(([t])=>!t.nested)[d.only]].filter(Boolean);
 const docRow={id:d.id,tables:sel.length,statuses:{},discrepancies:0};
 const unparsed=mine.unparsedTables.reduce((a,u)=>a+(u.reasons[0].count??0),0);if(unparsed||o.tablesInRaw)summary.unparsedTablesVsOracleRaw.push({id:d.id,pee:unparsed,oracle:o.tablesInRaw});
 for(const [t,ot] of sel){summary.tables++;summary[t.status]++;docRow.statuses[t.status]=(docRow.statuses[t.status]??0)+1;
  if(t.status!=='complete'){summary.notComplete.push({id:d.id,table:t.index,status:t.status,reasons:t.reasons.map(r=>r.code+(r.count!==undefined?':'+r.count:''))});continue;}
  if(!ot||ot.nested!==t.nested||ot.cells.length!==t.cells.length){summary.cellDiscrepancies++;docRow.discrepancies++;if(VERBOSE)console.log(d.id,'table',t.index,'cell count',t.cells.length,ot?.cells.length);continue;}
  for(const [k,c] of t.cells.entries()){const x=ot.cells[k];summary.cellsCompared++;
   const diffs=[];
   if(c.gridRow!==x.row||c.gridCol!==x.col)diffs.push('anchor');if(c.rowspan!==x.rowspan||c.colspan!==x.colspan)diffs.push('span');if(c.header!==x.header)diffs.push('header');
   if(!eq(c.attrs,x.attrs))diffs.push('attrs');if(!eq(c.links.map(l=>l.href),x.links))diffs.push('links');
   // HTML5 inserts a tbody around rows written directly in a table: a parser-created element, not source information.
   const mineTags=c.elements.map(e=>e.tag),noTbody=xs=>xs.filter(t=>t!=='tbody');
   if(!eq(noTbody(mineTags),noTbody(x.tags))||mineTags.filter(t=>t==='tbody').length>x.tags.filter(t=>t==='tbody').length)diffs.push('elements');
   if(c.decodedText!==x.text)diffs.push('text');
   if(diffs.length){summary.cellDiscrepancies++;docRow.discrepancies++;if(VERBOSE)console.log(d.id,'table',t.index,'cell',k,diffs.join(','),JSON.stringify(c.decodedText.slice(0,80)),'|',JSON.stringify(x.text.slice(0,80)),diffs.includes('elements')?c.elements.map(e=>e.tag).join(',')+' | '+x.tags.join(','):'');}
   if(c.raw!==null){const rt=await reparse(c.raw);if(rt!==x.text){summary.rawSliceDiscrepancies++;docRow.discrepancies++;if(VERBOSE)console.log(d.id,'raw slice',t.index,k,JSON.stringify(c.raw.slice(0,80)));}}}
  if((t.caption?.decodedText??null)!==ot.caption){summary.captionDiscrepancies++;docRow.discrepancies++;}
  if(!eq(t.context.headingPath.map(h=>[h.level,h.decodedText]),ot.headingPath.map(h=>[h.level,h.text]))){summary.headingDiscrepancies++;docRow.discrepancies++;if(VERBOSE)console.log(d.id,'heading path',t.index);}}
 summary.byDocument.push(docRow);}
// Named character references: every table entry through the oracle's tokenizer, in text and in attribute values.
const names=[...NR.namedReferences1F().keys()];
const ref=await page.evaluate(names=>{const d=new DOMParser().parseFromString('<div>'+names.map(n=>`<p>&${n}</p><p data-v="&${n}"></p>`).join('')+'</div>','text/html');const ps=[...d.querySelectorAll('p')];
 return names.map((n,i)=>[ps[2*i].textContent,ps[2*i+1].getAttribute('data-v')]);},names);
let refBad=0;names.forEach((n,i)=>{if(A.decodeHtml5Text1F('&'+n)!==ref[i][0]||A.decodeHtml5Attribute1F('&'+n)!==ref[i][1]){refBad++;if(VERBOSE)console.log('reference',n);}});
summary.namedReferences={entries:names.length,discrepancies:refBad};
await browser.close();
console.log(JSON.stringify(summary,null,1));
process.exitCode=summary.cellDiscrepancies||summary.rawSliceDiscrepancies||summary.captionDiscrepancies||summary.headingDiscrepancies||summary.tableCountMismatch||refBad?1:0;
