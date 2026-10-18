#!/usr/bin/env node
/** Global table interpreter (1G): metamorphic checks on retained tables (no network, nothing written to the repository
 * except the public count summary). For every selected table the source table is rebuilt from its neutral acquisition in
 * three forms, each spliced into the same document at the table's own source position:
 *   I  identity rebuild (same cells, same order; th/td and attributes kept, thead dropped)  -- the reference;
 *   T  transposition (cell (r,c) -> (c,r); scope row<->col);
 *   P  column permutation (every column but the first reversed).
 * The interpretation is invariant when the multiset of observations (product, properties, value, unit, conditions,
 * evidence class) of T and P equals that of I. Tables with merged cells are skipped (none in the retained corpus).
 * Usage: node scripts/tables-1g-metamorphic.mjs LABEL [--set dev|check] */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
const [label,...rest]=process.argv.slice(2);const ARG=k=>{const i=rest.indexOf('--'+k);return i>=0?rest[i+1]:null;};
if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: LABEL [--set dev|check]');const SET=ARG('set')??'dev';
const OUT=join('evaluation/tables-1g',`metamorphic-${SET}-${label}.json`);if(existsSync(OUT))throw Error(OUT+' exists');
const D=resolve('dist/src');const I=await import(D+'/table_interpreter1g.js');const A=await import(D+'/table_acquisition1f.js');
const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const SEL=JSON.parse(readFileSync(SET==='dev'?'evaluation/tables-1e/sample.json':'evaluation/tables-1g/check-selection.json','utf8')).tables.filter(s=>s.id!=='C02');
const inner=c=>{const m=/^<(td|th)\b[^>]*>/i.exec(c.raw??'');let s=(c.raw??'').slice(m?m[0].length:0);s=s.replace(/<\/(?:td|th)\s*>\s*$/i,'');return s;};
const attrs=(c,swap)=>Object.entries(c.rawAttrs).filter(([k])=>k!=='rowspan'&&k!=='colspan').map(([k,v])=>{if(swap&&k==='scope')v=v==='row'?'col':v==='col'?'row':v;return ` ${k}="${v.replace(/"/g,'&quot;')}"`;}).join('');
function rebuild(t,mode){const R=t.counts.rows,C=t.counts.cols;const placed=t.cells.filter(c=>c.gridRow!==null);const at=(r,c)=>{const id=t.slot[r][c];return id>=0?placed[id]:null;};
 const rows=mode==='T'?C:R,cols=mode==='T'?R:C;const order=[...Array(cols).keys()];if(mode==='P')order.splice(1,order.length-1,...order.slice(1).reverse());
 let h='<table>'+(t.caption?.raw??'');
 for(let r=0;r<rows;r++){h+='<tr>';for(const c0 of order){const c=mode==='T'?at(c0,r):at(r,c0);if(!c){h+='<td></td>';continue;}const tag=c.header?'th':'td';h+=`<${tag}${attrs(c,mode==='T')}>${inner(c)}</${tag}>`;}h+='</tr>';}
 return h+'</table>';}
const key=o=>JSON.stringify([o.product,[...o.property].sort(),o.value,o.low??null,o.unit,[...o.conditions].sort(),o.evidence.class]);
const multiset=obs=>{const m=new Map();for(const o of obs){const k=key(o);m.set(k,(m.get(k)??0)+1);}return m;};
const diff=(a,b)=>{let d=0;for(const [k,v] of a)d+=Math.abs(v-(b.get(k)??0));for(const [k,v] of b)if(!a.has(k))d+=v;return d;};
const out=[];
for(const s of SEL){const [ev,tag]=s.page.split('/');const html=readFileSync(join(ROOT,ev,'raw',tag+'.html'),'utf8');
 const t=A.acquireTables1F(html).tables.filter(x=>!x.nested)[s.table];
 if(t.status!=='complete'||t.cells.some(c=>(c.rowspan??1)>1||(c.colspan??1)>1)||!t.src){out.push({id:s.id,skipped:'merged cells or incomplete'});continue;}
 const run=mode=>{const doc=html.slice(0,t.src.start)+rebuild(t,mode)+html.slice(t.src.end);const r=I.interpretDocumentTables1G(doc);
  const ti=r.tables.filter(x=>(x.locator.match(/table/g)||[]).length===1)[s.table];return {status:ti.status,hyp:ti.selected?.hypothesis.id??null,obs:ti.observations};};
 const base=run('I'),T=run('T'),P=run('P');const mb=multiset(base.obs);
 out.push({id:s.id,publisher:s.publisher,base:{status:base.status,hypothesis:base.hyp,observations:base.obs.length},
  transposed:{status:T.status,hypothesis:T.hyp,observations:T.obs.length,differences:diff(mb,multiset(T.obs)),invariant:diff(mb,multiset(T.obs))===0},
  permuted:{status:P.status,hypothesis:P.hyp,observations:P.obs.length,differences:diff(mb,multiset(P.obs)),invariant:diff(mb,multiset(P.obs))===0}});}
const tested=out.filter(o=>!o.skipped);
const summary={tables:out.length,tested:tested.length,transpositionInvariant:tested.filter(o=>o.transposed.invariant).length,permutationInvariant:tested.filter(o=>o.permuted.invariant).length,
 transpositionDifferences:tested.reduce((a,o)=>a+o.transposed.differences,0),permutationDifferences:tested.reduce((a,o)=>a+o.permuted.differences,0),observations:tested.reduce((a,o)=>a+o.base.observations,0)};
mkdirSync('evaluation/tables-1g',{recursive:true});
writeFileSync(OUT,JSON.stringify({schema:'pee.tables1g.metamorphic.v1',label,set:SET,at:new Date().toISOString(),interpreter:I.INTERPRETER1G_VERSION,summary,tables:out},null,1)+'\n');
console.log(JSON.stringify(summary));for(const o of tested)console.log(o.id,o.base.hypothesis,'| T',o.transposed.hypothesis,o.transposed.differences,'| P',o.permuted.hypothesis,o.permuted.differences);
