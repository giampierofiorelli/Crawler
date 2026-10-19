#!/usr/bin/env node
/** S87e: reconstruct the slots of stored test values (S80 store copy) from their own page block and score them against the
 * sealed S86b blind page annotations (role, kind incl. per-cycle kinds, what was measured). Scope dev = trustedreviews.com
 * pages, check = the others (preregistration).
 *   node scripts/s87e-test-eval.mjs --store COPY.sqlite --manifest M --raw DIR --annotations DIR --scope dev|check [--out PUBLIC] [--private DETAIL] */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';import {DatabaseSync} from 'node:sqlite';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const R=await import(D+'observation_reconstruction.js');const P=await import(D+'phase225_transient_test_probe.js');const H=await import(D+'phase245_html_dom.js');const G=await import(D+'phase245_table_grid.js');
const qk=QK.loadQuantityKnowledge();const sha=x=>createHash('sha256').update(x).digest('hex');const scope=arg('scope')??'dev';
const man=JSON.parse(readFileSync(arg('manifest'),'utf8'));const bySha=new Map(man.map(m=>[m.sha256,m]));
const db=new DatabaseSync(arg('store'),{readOnly:true});
const rows=db.prepare("SELECT t.*, v.sha256 AS page_sha FROM test_measurements265 t JOIN revisions v ON v.revision_id=t.revision_id WHERE t.state='current'").all();
const KREF={energy_per_cycle:['energy','per_cycle_or_use'],periodic_volume:['volume','per_year'],periodic_energy:['energy','per_year']};
const toks=s=>new Set(String(s??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').split(' ').filter(w=>w.length>2));
const overlap=(a,b)=>{const A=toks(a),B=toks(b);if(!A.size||!B.size)return false;for(const x of A)if(B.has(x))return true;return false;};
const blocksCache=new Map();const cellsCache=new Map();const out=[];
// table cells of a page with their row and column headers (header bridge)
const cellsOf=(page,html)=>{if(cellsCache.has(page))return cellsCache.get(page);const m=new Map();const {root}=H.parseHtml245(html);
 for(const n of H.walk245(root))if(n.tag==='table'){const g=G.buildTableGrid245(n);if(!g)continue;const txt=(r,c)=>{const id=g.slot[r]?.[c];return id>=0&&id!==undefined?g.cells[id].text:'';};
  for(let r=0;r<g.rows;r++)for(let c=0;c<g.cols;c++){const t=txt(r,c);if(t&&!m.has(t))m.set(t,{rowHeader:c>0?txt(r,0):null,colHeader:r>0?txt(0,c):null});}}
 cellsCache.set(page,m);return m;};
for(const r of rows){const m=bySha.get(r.page_sha);if(!m)continue;const page=m.file.split('/').pop().replace('.html','');const dev=/trustedreviews/.test(m.publisher);
 if(scope==='dev'&&!dev||scope==='check'&&dev)continue;
 if(!blocksCache.has(page)){const html=readFileSync(join(arg('raw'),page+'.html'),'utf8');const a=P.textBlocks225(html,{maxBlocks:1500}).blocks;const b=P.textBlocks225(html,{maxBlocks:1500,splitLineBreaks:true}).blocks;
  blocksCache.set(page,new Map([...a,...b].map(x=>[sha(x),x])));cellsOf(page,html);}
 const block=blocksCache.get(page).get(r.block_sha256);if(!block){out.push({page,id:r.measurement_id,blockFound:false});continue;}
 const ann=JSON.parse(readFileSync(join(arg('annotations'),page+'.json'),'utf8'));
 const cands=ann.filter(a=>a.value===r.value);const ref=cands[0]??null;
 const cell=cellsCache.get(page)?.get(block.replace(/\s+/g,' ').trim())??null;
 const rec=R.reconstructTestValue(qk,{value:r.value,unit:r.unit,block,offset:r.value_offset,rowHeader:cell?.rowHeader??null,colHeader:cell?.colHeader??null},'C');
 out.push({page,publisher:m.publisher,id:r.measurement_id,blockFound:true,refFound:!!ref,ambiguousRef:cands.length>1,ref:ref&&{role:ref.role,kind:ref.kind,what:ref.what},cell,rec});}
const S=xs=>{const s={rows:xs.length,blockFound:0,refFound:0,role:{produced:0,correct:0,wrong:0},refRoles:{},kind:{annotated:0,produced:0,correct:0,wrong:0},basis:{annotated:0,produced:0,correct:0,wrong:0,falsePositive:0},property:{produced:0,overlapsWhat:0}};
 for(const x of xs){if(!x.blockFound)continue;s.blockFound++;if(!x.refFound)continue;s.refFound++;const ref=x.ref,rec=x.rec;s.refRoles[ref.role]=(s.refRoles[ref.role]??0)+1;
  if(rec.role.value){s.role.produced++;if(rec.role.value===ref.role)s.role.correct++;else s.role.wrong++;}
  const [rk,rb]=KREF[ref.kind]??[ref.kind,null];if(rk&&rk!=='other'){s.kind.annotated++;if(rec.quantityKind.value){s.kind.produced++;if(rec.quantityKind.value===rk)s.kind.correct++;else s.kind.wrong++;}}
  if(rb)s.basis.annotated++;if(rec.basis.value){s.basis.produced++;if(!rb)s.basis.falsePositive++;else if(rec.basis.value===rb)s.basis.correct++;else s.basis.wrong++;}
  if(rec.property.value){s.property.produced++;if(overlap(rec.property.value,ref.what))s.property.overlapsWhat++;}}
 return s;};
const pubs=[...new Set(out.map(x=>x.publisher).filter(Boolean))];
const res={schema:'pee.s87e.test-eval.v1',scope,technique:'C',reference:'S86b blind page annotations (sealed)',note:'property scored by word overlap with the reference description (a weak proxy)',all:S(out),byPublisher:Object.fromEntries(pubs.map(p=>[p,S(out.filter(x=>x.publisher===p))]))};
if(OUT)writeFileSync(OUT,JSON.stringify(res,null,1)+'\n');if(arg('private'))writeFileSync(arg('private'),JSON.stringify(out,null,1));console.log(JSON.stringify(res.all));
