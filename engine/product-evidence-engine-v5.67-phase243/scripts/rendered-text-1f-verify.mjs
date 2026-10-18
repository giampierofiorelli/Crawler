#!/usr/bin/env node
/** Independent check of the v1f.2 rendered cell text (RENDERED_TEXT1F) against Chromium's innerText.
 * Oracle: headless Chromium with JavaScript disabled, every network request blocked, author stylesheets removed
 * (<style>, <link rel=stylesheet>; inline style attributes kept, as the contract models them), so only the user-agent
 * stylesheet applies. Compared after the contract's own normalisation (runs of line breaks are one break; spaces at line
 * ends dropped). Cells are matched by table order and row/cell order; tables whose cell counts differ between the two
 * parsers (tree-builder differences, outside this check) are counted separately. Documents: boundary fixtures and every
 * retained private page (unique by hash). Output: counts on stdout (with --verbose, differing cell texts: never redirect
 * them into the repository). Usage: node scripts/rendered-text-1f-verify.mjs [--verbose] [--no-private] */
import {readFileSync,existsSync,readdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';
const VERBOSE=process.argv.includes('--verbose');const D=resolve('dist/src');const A=await import(D+'/table_acquisition1f.js');
const {FIXTURES1F}=await import(resolve('dist/tests/table_acquisition1f_fixtures.js'));
const req=createRequire(import.meta.url);let pw=null;for(const p of [process.env.PLAYWRIGHT_MODULE,'playwright','/opt/node-tools/node_modules/playwright'].filter(Boolean)){try{pw=req(p);break;}catch{}}
if(!pw)throw Error('playwright with a local Chromium is required');
const E0=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval');
const EXTRA={br_cell:'<table><tr><th>CADR</th><td>Dust: 134 CFM<br>Smoke: 126 CFM<br/>Pollen: 154 CFM</td></tr><tr><th>Noise</th><td><p>Speed 1: 38 dB</p><p>Speed 2:  41 dB</p></td></tr></table>',
 hidden:'<table><tr><td>a<span hidden>secret</span><span style="display:none">x</span><span aria-hidden="true">★</span></td><td><ul><li>one</li><li>two</li></ul></td></tr><tr><td>b&nbsp;c</td><td>d <img alt="pic"> e</td></tr></table>',
 pre:'<table><tr><td><pre>a   b\n  c</pre></td><td>x\n\n  y</td></tr><tr><td><div>p<div>q</div>r</div></td><td><table><tr><td>n1</td><td>n2</td></tr><tr><td>n3</td><td>n4</td></tr></table></td></tr></table>'};
const docs=[...Object.entries({...FIXTURES1F,...EXTRA}).map(([k,html])=>({id:'fixture:'+k,html}))];
if(!process.argv.includes('--no-private')){const seen=new Set();for(const ev of readdirSync(E0).sort()){const rd=join(E0,ev,'raw');if(!existsSync(rd))continue;
 for(const f of readdirSync(rd).filter(f=>f.endsWith('.html')).sort()){const b=readFileSync(join(rd,f));const h=createHash('sha256').update(b).digest('hex');if(seen.has(h))continue;seen.add(h);docs.push({id:ev+'/'+f,html:b.toString('utf8')});}}}
const browser=await pw.chromium.launch();const ctx=await browser.newContext({javaScriptEnabled:false});await ctx.route('**/*',r=>r.request().url().startsWith('data:')?r.continue():r.abort());
const page=await ctx.newPage();
const norm=s=>s.replace(/\r/g,'').split('\n').map(l=>l.replace(/[ \t]+$/,'').replace(/^ +/,'')).join('\n').replace(/\n{2,}/g,'\n').replace(/^\n+|\n+$/g,'');
const C={documents:0,tables:0,tablesCellCountDiffers:0,cells:0,equal:0,differ:0};const ex=[];
for(const d of docs){C.documents++;const acq=A.acquireTables1F(d.html,{rendered:true});
 const clean=d.html.replace(/<style\b[\s\S]*?<\/style\s*>/gi,'').replace(/<link\b[^>]*rel=["']?stylesheet[^>]*>/gi,'');
 await page.setContent(clean,{waitUntil:'domcontentloaded'}).catch(()=>{});
 const oracle=await page.evaluate(()=>[...document.querySelectorAll('table')].map(t=>[...t.rows].map(r=>[...r.cells].map(c=>c.innerText))));
 const ours=acq.tables;for(let i=0;i<ours.length;i++){const t=ours[i];if(t.status!=='complete')continue;const o=oracle[i];C.tables++;
  const rows=new Map();for(const c of t.cells){if(!rows.has(c.sourceRow))rows.set(c.sourceRow,[]);rows.get(c.sourceRow).push(c);}
  const mine=[...rows.keys()].sort((a,b)=>a-b).map(k=>rows.get(k));
  if(!o||o.length!==mine.length||o.some((r,k)=>r.length!==mine[k].length)){C.tablesCellCountDiffers++;continue;}
  for(let r=0;r<mine.length;r++)for(let k=0;k<mine[r].length;k++){C.cells++;const a=norm(mine[r][k].renderedText??''),b=norm(o[r][k]);if(a===b)C.equal++;else{C.differ++;if(ex.length<40)ex.push({doc:d.id,table:i,r,k,ours:a.slice(0,160),chromium:b.slice(0,160)});}}}}
await browser.close();console.log(JSON.stringify(C));if(VERBOSE)for(const e of ex)console.log(JSON.stringify(e));
