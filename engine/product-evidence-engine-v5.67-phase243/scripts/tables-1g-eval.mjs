#!/usr/bin/env node
/** Global table interpreter (1G): development and check evaluation against source-grounded annotations (no network).
 *
 * Sets: dev = the 18-table sample (evaluation/tables-1e/sample.json; annotations sealed in annotation-freeze.json; SPENT,
 * used to develop 1G); check = the nine-table check selection (evaluation/tables-1g/check-selection.json; blind
 * annotations sealed in check-annotation-freeze.json before any 1G run; C02 duplicates C01 and is counted once).
 * Arms: 1G = src/table_interpreter1g.ts on the neutral acquisition (no older reader's output as input); C = the legacy
 * semantic table reader (policy candidate_1c_semantics_tables); E = the 1E lesson-enabled shadow reader with every shadow
 * lesson (policy candidate_1e_tables). Comparison is by SOURCE CELL and element (value at that cell), then entity
 * (product), conditions, evidence kind and, for 1G, table structure and axis roles. Baselines' leads all claim to be test
 * measurements (that is what the readers emit), so their evidence kind is "measured".
 * Output: private full result (pee-knowledge private-eval/tables-1g) and public value-free summary
 * (evaluation/tables-1g); never overwritten. Usage: node scripts/tables-1g-eval.mjs run LABEL --set dev|check [--arms 1g,c,e] */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {documentLeads,buildIdentity} from './experience-observe.mjs';
const [cmd,label,...rest]=process.argv.slice(2);const ARG=k=>{const i=rest.indexOf('--'+k);return i>=0?rest[i+1]:null;};
if(cmd!=='run'||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: run LABEL --set dev|check [--arms 1g,c,e]');
const sha=b=>createHash('sha256').update(b).digest('hex');const D=resolve('dist/src');
const I=await import(D+'/table_interpreter1g.js');const GL=await import(D+'/table_interpreter1g_lessons.js');const A=await import(D+'/table_acquisition1f.js');const SEM=await import(D+'/document_semantics.js');
const SET=ARG('set')??'dev';const ARMS=(ARG('arms')??'1g,c,e').split(',').flatMap(a=>a==='ablation'?['1g-none',...GL.activeInterpreterLessons1G().map(id=>'1g-'+id.split('_')[0])]:a==='provisional'?GL.INTERPRETER_LESSONS1G.filter(l=>l.state==='provisional').map(l=>'1g+'+l.id.split('_')[0]):[a]);
// 1G variants: '1g' = active lessons; '1g-none' = no lesson; '1g-GLk' = active lessons without GLk
// '1g+GLk' = active lessons plus a provisional one
const lessonsOf=arm=>arm==='1g'?GL.activeInterpreterLessons1G():arm==='1g-none'?[]:arm.startsWith('1g+')?[...GL.activeInterpreterLessons1G(),...GL.ALL_INTERPRETER_LESSONS1G.filter(id=>id.split('_')[0]===arm.slice(3))]:GL.activeInterpreterLessons1G().filter(id=>id.split('_')[0]!==arm.slice(3));
const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const CFG=SET==='dev'?{sel:'evaluation/tables-1e/sample.json',ann:join(ROOT,'tables-1e/annotations.json'),freeze:'evaluation/tables-1e/annotation-freeze.json',dup:[]}
 :{sel:'evaluation/tables-1g/check-selection.json',ann:join(ROOT,'tables-1e/annotations-1g-check.json'),freeze:'evaluation/tables-1g/check-annotation-freeze.json',dup:['C02']};
const PRIV=join(REPO,'private-eval/tables-1g',`eval-${SET}-${label}.json`),PUB=join('evaluation/tables-1g',`eval-${SET}-${label}.json`);
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: never overwritten');
const annBytes=readFileSync(CFG.ann);if(sha(annBytes)!==JSON.parse(readFileSync(CFG.freeze,'utf8')).annotationsSha256)throw Error('annotations differ from the sealed hash');
const ANN=JSON.parse(annBytes).tables;const SEL=JSON.parse(readFileSync(CFG.sel,'utf8')).tables;
const pageOf=key=>{const [ev,tag]=key.split('/');const W=JSON.parse(readFileSync(join(ROOT,ev,'wave.json'),'utf8'));const p=W.pages.find(x=>x.tag===tag);
 const b=readFileSync(join(ROOT,ev,'raw',tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+key);return {ev,tag,url:p.finalUrl??p.url,html:b.toString('utf8'),category:p.category};};
const n=s=>String(s??'').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const sameName=(a,b)=>!!a&&!!b&&n(a)===n(b);
const KIND={publisher_measured:'measured',manufacturer_declared:'declared',nominal_certified:'nominal_certified',derived_or_estimated:'derived_or_estimated',price:'price',rating_score:'rating_score',setting:'setting',identifier:'identifier'};
const ROLE={product:['product'],property:['property','measure'],measure:['measure','property'],condition:['condition'],record:['appliance_or_method','rating_criterion','other'],none:['none']};
const condMatch=(gold,sys)=>{if(!gold.length)return sys.length?'extra':'none_needed';const S=sys.map(n);const hit=gold.filter(g=>S.some(s=>s&&(s.includes(n(g))||n(g).includes(s))));return hit.length===gold.length?'full':hit.length?'partial':'missing';};
const ALL_SHADOW=['TL1_section_method_scope','TL2_header_units','TL3_dimension_from_table_context','TL4_compound_cell_elements','TL5_setting_axis_conditions','TL6_cell_identity','TL7_table_cells_owned_by_table'];
const rows=[];const tables=[];
for(const s of SEL){if(CFG.dup.includes(s.id))continue;const a=ANN.find(t=>t.id===s.id);if(!a)throw Error('no annotation '+s.id);const p=pageOf(s.page);
 const acq=A.acquireTables1F(p.html);const at=acq.tables.filter(t=>!t.nested)[s.table];
 const rowPos=new Map();const cellOf=new Map();for(const c of at.cells){const k=rowPos.get(c.sourceRow)??0;rowPos.set(c.sourceRow,k+1);cellOf.set(`${c.sourceRow},${k}`,c);}
 const byGrid=new Map(at.cells.filter(c=>c.gridRow!==null).map(c=>[`${c.gridRow},${c.gridCol}`,c]));
 const sys={};let tableRow=null;
 for(const arm of ARMS.filter(a=>a.startsWith('1g'))){const t0=process.hrtime.bigint();const r=I.interpretDocumentTables1G(p.html,{lessons:lessonsOf(arm)});const ms=Number(process.hrtime.bigint()-t0)/1e6;const ti=r.tables.find(t=>t.table===at.index);
  const h=ti.selected?.hypothesis??null;const im0=ti.implicitAxes??{};const role0=lv=>lv&&lv.length?lv[lv.length-1]:'none';
  const rr=h&&!h.layout?(h.rowLevels.length?role0(h.rowLevels):im0.row??'none'):null,cr=h&&!h.layout?(h.colLevels.length?role0(h.colLevels):im0.col??'none'):null;
  const axesOk=(rr?ROLE[rr].includes(a.rowAxis.role):a.structure==='layout_not_data')&&(cr?ROLE[cr].includes(a.colAxis.role):a.structure==='layout_not_data');
  sys[arm]={status:ti.status,axesOk,readingIdentity:r.readingIdentity,items:ti.observations.map(o=>({cell:o.cell,value:o.value,low:o.low,product:o.product,conditions:o.conditions,kind:KIND[o.evidence.class]??'unclear',class:o.evidence.class,unit:o.unit,unresolved:o.unresolved}))};
  if(arm!=='1g')continue;const role=lv=>lv&&lv.length?lv[lv.length-1]:'none';const im=ti.implicitAxes??{};const rowRole=h&&!h.layout?(h.rowLevels.length?role(h.rowLevels):im.row??'none'):null,colRole=h&&!h.layout?(h.colLevels.length?role(h.colLevels):im.col??'none'):null;
  tableRow={id:s.id,publisher:s.publisher,status:ti.status,hypothesis:h?.id??null,support:ti.selected?.support??null,annotated:{structure:a.structure,row:a.rowAxis.role,col:a.colAxis.role},
   rowAgrees:rowRole?ROLE[rowRole].includes(a.rowAxis.role):a.structure==='layout_not_data',colAgrees:colRole?ROLE[colRole].includes(a.colAxis.role):a.structure==='layout_not_data',
   ms:Math.round(ms),passes:r.passes,tied:ti.tied.length,contextLinks:ti.context.filter(l=>l.applies).length};tables.push(tableRow);}
 const sem=SEM.readDocumentSemantics1D2(p.html,p.url);
 for(const [arm,policy] of [['c','candidate_1c_semantics_tables'],['e','candidate_1e_tables']]){if(!ARMS.includes(arm))continue;
  const L=await documentLeads(D,{evaluation:p.ev,docTag:p.tag,category:p.category},{policy,details:true,...(arm==='e'?{lessons:ALL_SHADOW}:{})});
  const items=[];for(const l of L.leads??[]){const cell=sem.blocks[l.blockIndex]?.cell;if(!cell||cell.table!==s.table)continue;const c=byGrid.get(`${cell.row},${cell.col}`);if(!c)continue;
   items.push({cell:c.id,value:l.value,product:l.subject??null,conditions:l.condition?[l.condition]:[],kind:'measured',unit:l.unit});}
  sys[arm]={items};}
 for(const ca of a.cells)for(const [k,e] of ca.elements.entries()){const c=cellOf.get(`${ca.r},${ca.c}`);
  const row={table:s.id,publisher:s.publisher,r:ca.r,c:ca.c,k,kind:e.kind,value:e.value,product:e.product??null,conditions:e.conditions??[],dimension:e.dimension??null,uncertain:!!e.uncertain,arms:{}};
  for(const arm of ARMS){const x=(sys[arm]?.items??[]).find(it=>c&&it.cell===c.id&&(it.value===e.value||it.low===e.value))??null;
   if(!x){row.arms[arm]={found:false,ok:false,stage:arm.startsWith('1g')?(sys[arm].status==='not_interpreted'?'not_interpreted':sys[arm].status==='layout'?'layout':sys[arm].items.some(i=>i.cell===c?.id)?'value_parse':'structure'):'not_read'};continue;}
   const product=e.product?(sameName(x.product,e.product)?'correct':x.product?'wrong':'missing'):(x.product?'invented':'correct_null');
   const cond=condMatch(row.conditions,x.conditions);const kind=x.kind===e.kind?'correct':x.kind==='unclear'?'abstained':'wrong';
   const falseMeasurement=x.kind==='measured'&&e.kind!=='measured'&&e.kind!=='other';
   const prodOk=product==='correct'||product==='correct_null';const condOk=cond==='full'||cond==='none_needed'||cond==='extra';const ok=prodOk&&condOk&&kind==='correct';
   const axesWrong=arm.startsWith('1g')&&!sys[arm].axesOk;
   const stage=ok?null:axesWrong?'axis_roles':!prodOk?'product':!condOk?'conditions':'evidence_kind';
   row.arms[arm]={found:true,product,conditions:cond,kind,systemKind:x.kind,systemClass:x.class??null,falseMeasurement,ok,stage,systemProduct:x.product,systemConditions:x.conditions,unresolved:x.unresolved??[]};}
  rows.push(row);}}
const summ=f=>{const R=rows.filter(f);const o={elements:R.length};for(const arm of ARMS){const a=R.map(r=>r.arms[arm]);
 o[arm]={found:a.filter(x=>x.found).length,fullyCorrect:a.filter(x=>x.ok).length,productCorrect:a.filter(x=>x.found&&(x.product==='correct'||x.product==='correct_null')).length,
  productWrong:a.filter(x=>x.product==='wrong').length,productInvented:a.filter(x=>x.product==='invented').length,productMissing:a.filter(x=>x.product==='missing').length,
  conditionsFull:a.filter(x=>x.conditions==='full').length,conditionsWithUnmatchedExtra:R.filter((r,i)=>a[i].found&&a[i].systemConditions.some(c=>!r.conditions.some(g=>{const G=n(g),C=n(c);return C&&(G.includes(C)||C.includes(G));}))).length,conditionsNeeded:R.filter((r,i)=>r.conditions.length&&a[i].found).length,
  kindCorrect:a.filter(x=>x.kind==='correct').length,kindAbstained:a.filter(x=>x.kind==='abstained').length,kindWrong:a.filter(x=>x.kind==='wrong').length,falseMeasurements:a.filter(x=>x.falseMeasurement).length,
  firstFailure:a.filter(x=>!x.ok).reduce((m,x)=>{m[x.stage]=(m[x.stage]??0)+1;return m;},{})};}return o;};
const summary={all:summ(()=>true),measured:summ(r=>r.kind==='measured'),notMeasured:summ(r=>r.kind!=='measured'),
 byKind:Object.fromEntries([...new Set(rows.map(r=>r.kind))].map(k=>[k,summ(r=>r.kind===k)])),
 byPublisher:Object.fromEntries([...new Set(rows.map(r=>r.publisher))].map(k=>[k,summ(r=>r.publisher===k)])),
 ablationVs1g:Object.fromEntries(ARMS.filter(a=>a.startsWith('1g-')||a.startsWith('1g+')).map(a=>[a,{fullyCorrectLost:rows.filter(r=>r.arms['1g']?.ok&&!r.arms[a].ok).length,fullyCorrectGained:rows.filter(r=>!r.arms['1g']?.ok&&r.arms[a].ok).length,
  productWrongAdded:rows.filter(r=>r.arms[a].product==='wrong'&&r.arms['1g']?.product!=='wrong').length,falseMeasurementsAdded:rows.filter(r=>r.arms[a].falseMeasurement&&!r.arms['1g']?.falseMeasurement).length,
  axesTables:tables.length?undefined:undefined}])),
 tables:{n:tables.length,rowAxisAgrees:tables.filter(t=>t.rowAgrees).length,colAxisAgrees:tables.filter(t=>t.colAgrees).length,
  statuses:tables.reduce((m,t)=>(m[t.status]=(m[t.status]??0)+1,m),{}),msMedian:tables.map(t=>t.ms).sort((a,b)=>a-b)[Math.floor(tables.length/2)]??null,msMax:Math.max(0,...tables.map(t=>t.ms))}};
const meta={schema:'pee.tables1g.eval.v1',label,set:SET,at:new Date().toISOString(),build:buildIdentity(D),interpreter:I.INTERPRETER1G_VERSION,arms:ARMS,
 tier:SET==='dev'?'development: the 18 sample tables were used to develop 1G (spent); annotator is a separate Claude agent':'check: blind annotations sealed before the first 1G run; same publishers and partly the same templates as development; not held-out'};
mkdirSync(join(REPO,'private-eval/tables-1g'),{recursive:true});mkdirSync('evaluation/tables-1g',{recursive:true});
writeFileSync(PRIV,JSON.stringify({...meta,summary,tables,rows},null,1)+'\n');
// public form: no values, products or condition texts
writeFileSync(PUB,JSON.stringify({...meta,summary,tables,rows:rows.map(r=>({table:r.table,r:r.r,c:r.c,k:r.k,kind:r.kind,arms:Object.fromEntries(Object.entries(r.arms).map(([k,v])=>[k,{found:v.found,ok:v.ok,product:v.product??null,conditions:v.conditions??null,kind:v.kind??null,systemKind:v.systemKind??null,falseMeasurement:v.falseMeasurement??false,stage:v.stage??null}]))}))},null,1)+'\n');
console.log(JSON.stringify({all:summary.all,measured:summary.measured,tables:summary.tables},null,1));
