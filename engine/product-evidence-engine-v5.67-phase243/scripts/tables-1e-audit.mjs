#!/usr/bin/env node
/** Table understanding (Stages A-D, development material only; no network). Every page here was examined before.
 *   baseline LABEL   per page and policy, the leads of the existing readers (no plan; plan; Step 1D-A; 1D-A2 B and C) and the
 *                    Step 1D-A2 table-reader output, as digests (public) and in full (private). Never overwritten.
 *   check LABEL BASE re-run the same readers and compare with baseline BASE: every page and policy must be identical.
 *   inventory LABEL  structural audit of every table on every page (DOM tables, nested, beyond the 40-table limit, grids,
 *                    cells, slots, spans, headers, warnings, cells without a reader block, client-rendered data) and, when
 *                    src/table_ledger1e.js exists, the decision ledger of every cell element (stage, rule, blockers).
 * Pages: every fetched page of private-eval/{phase268,phase270,phase271,phase272,step1c,step1d-b}. */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {documentLeads,buildIdentity} from './experience-observe.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
const [cmd,label,base]=process.argv.slice(2);if(!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: baseline|check|inventory LABEL [BASE]');
const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';
const OUTDIR=process.env.TABLES1E_OUT_DIR;const PUBD=OUTDIR??'evaluation/tables-1e',PRIVD=OUTDIR??join(REPO,'private-eval/tables-1e');
const EVALS=['phase268','phase270','phase271','phase272','step1c','step1d-b'];
const D=resolve('dist/src');const T=await import(D+'/phase265_test_measurements.js');const SP=await import(D+'/phase245_spec_extraction.js');
const SEM=await import(D+'/document_semantics.js');const PL=await import(D+'/phase272_extraction_plan.js');const ST=await import(D+'/phase246_knowledge_store.js');
const R=await import(D+'/phase248_category_registry.js');const B=await import(D+'/phase225_transient_test_probe.js');
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const pages=[];for(const ev of EVALS){const W=JSON.parse(readFileSync(join(ROOT,ev,'wave.json'),'utf8'));
 for(const p of W.pages)if(p.outcome==='fetched'&&existsSync(join(ROOT,ev,'raw',p.tag+'.html')))pages.push({ev,tag:p.tag,category:p.category,host:new URL(p.finalUrl??p.url).host.replace(/^www\./,''),url:p.finalUrl??p.url,sha256:p.sha256,sourceType:p.sourceType});}
const store=new ST.KnowledgeStore246(LIVE);const plans={};
const planOf=c=>{if(c in plans)return plans[c];if(!TAUGHT.includes(c))return plans[c]=null;
 return plans[c]=PL.compileExtractionPlan272(store,c,R.CATEGORY_REGISTRY250.find(e=>e.id===c)?.aliases??[],TAUGHT.filter(t=>t!==c));};
const htmlOf=p=>{const b=readFileSync(join(ROOT,p.ev,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);return b.toString('utf8');};
const POLICIES=[['plan',undefined],['A_inventory','candidate_1c_inventory'],['B_semantics','candidate_1c_semantics'],['C_semantics_tables','candidate_1c_semantics_tables']];
const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});

async function readersOf(p){const html=htmlOf(p);const plan=planOf(p.category);const out={};
 const x=T.testDocumentSubject268(SP.extractSpecifications245(html,p.url),p.sourceType??'independent_original_test');
 out.noPlan=T.testLeadsFromHtml265(html,p.url,p.sha256,x,{category:p.category}).probe.candidates;
 if(plan){for(const [k,pol] of POLICIES){const r=await documentLeads(D,{evaluation:p.ev,docTag:p.tag,category:p.category},pol?{policy:pol}:{});if(r.unobservable)throw Error(p.tag+' '+r.unobservable);out[k]=r.leads;}
  const sem=SEM.readDocumentSemantics1D2(html,p.url);const deep=B.textBlocks225(html,{maxBlocks:1500}).blocks;
  out.tableReader=SEM.structuredTableLeads1D2(sem,plan,{sourceUrl:p.url,documentSha256:p.sha256,blocks:deep,documentReportsTesting:deep.some(b=>PL.TEST_CONTEXT272.test(b))});}
 return out;}

if(cmd==='baseline'||cmd==='check'){
 const PUB=join(PUBD,`${cmd}-${label}.json`),PRIV=join(PRIVD,`${cmd}-${label}.json`);for(const f of [PUB,PRIV])if(existsSync(f))throw Error(f+' exists: never overwritten');
 const res={},full={};for(const p of pages){const r=await readersOf(p);full[p.ev+'/'+p.tag]=r;res[p.ev+'/'+p.tag]=Object.fromEntries(Object.entries(r).map(([k,v])=>[k,{n:v.length,digest:sha(JSON.stringify(v))}]));}
 const meta={schema:'pee.tables1e.'+cmd+'.v1',label,at:new Date().toISOString(),build:buildIdentity(D),planDigests:Object.fromEntries(Object.entries(plans).map(([c,p])=>[c,p?.compiledFrom.digest??null])),
  liveStoreSha256:sha(readFileSync(LIVE)),pages:pages.length,tier:'development (every page examined before)'};
 let diff=null;if(cmd==='check'){const b=JSON.parse(readFileSync(join(PUBD,`baseline-${base}.json`),'utf8'));diff=[];
  for(const [k,v] of Object.entries(res))for(const [pol,d] of Object.entries(v))if(b.pages[k]?.[pol]?.digest!==d.digest)diff.push({page:k,policy:pol,before:b.pages[k]?.[pol]??null,after:d});
  for(const k of Object.keys(b.pages))if(!res[k])diff.push({page:k,missing:true});}
 mkdirSync(PUBD,{recursive:true});mkdirSync(PRIVD,{recursive:true});
 writeFileSync(PUB,JSON.stringify({...meta,...(diff?{against:base,identical:diff.length===0,differences:diff}:{}),pages:res},null,1)+'\n');
 writeFileSync(PRIV,JSON.stringify({...meta,leads:full},null,1)+'\n');
 console.log(JSON.stringify({...meta,totals:Object.fromEntries(['noPlan',...POLICIES.map(p=>p[0]),'tableReader'].map(k=>[k,Object.values(res).reduce((a,v)=>a+(v[k]?.n??0),0)])),...(diff?{identical:diff.length===0,differences:diff.length}:{})},null,1));
 store.close();process.exit(0);}

if(cmd!=='inventory')throw Error('unknown command '+cmd);
const PUB=join(PUBD,`inventory-${label}.json`),PRIV=join(PRIVD,`inventory-${label}.json`);for(const f of [PUB,PRIV])if(existsSync(f))throw Error(f+' exists: never overwritten');
const H=await import(D+'/phase245_html_dom.js');const G=await import(D+'/phase245_table_grid.js');
const L=existsSync(D+'/table_ledger1e.js')?await import(D+'/table_ledger1e.js'):null;
const docs=[];const t0all=Date.now();
for(const p of pages){const html=htmlOf(p);const t0=Date.now();const {root,nodeCount,truncated}=H.parseHtml245(html);
 const tables=[];let i=0;
 for(const n of H.walk245(root)){if(n.kind!=='element'||n.tag!=='table')continue;let a=n.parent,depth=0;while(a){if(a.tag==='table')depth++;a=a.parent;}
  const g=G.buildTableGrid245(n);const it=g?G.interpretTableGrid245(g):null;const srcCells=g?g.cells.length:0;
  const slots=g?g.slot.flat():[];
  tables.push({domIndex:i++,nested:depth>0,grid:!!g,rows:g?.rows??0,cols:g?.cols??0,sourceCells:srcCells,slots:slots.length,occupiedSlots:slots.filter(s=>s>=0).length,emptySlots:slots.filter(s=>s<0).length,
   spanned:g?g.cells.filter(c=>c.rowspan>1||c.colspan>1).length:0,th:g?g.cells.filter(c=>c.header).length:0,scope:g?g.cells.filter(c=>c.scope).length:0,headersAttr:g?g.cells.filter(c=>c.headersAttr.length).length:0,
   thead:g?g.theadRows.size:0,caption:!!g?.caption,warnings:g?.warnings??[],mode:it?.mode??null,modeReasons:it?.reasons??[],phase245Readings:it?.readings.length??0});}
 const sem=SEM.readDocumentSemantics1D2(html,p.url);let k=0;
 for(const t of tables){if(t.nested){t.semantics='nested_table_not_read';continue;}if(!t.grid){t.semantics='no_grid';continue;}
  if(k>=sem.tables.length){t.semantics='beyond_table_limit_40';k++;continue;}const st=sem.tables[k++];
  t.semantics='read';t.semIndex=st.index;t.context=st.context;t.hardExcluded=st.hardExcluded;t.headerRows=st.headerRows;
  t.cellsWithoutBlock=st.cells.filter(c=>c.blockIndex===null).length;t.headerCellsInSemantics=st.cells.filter(c=>c.header).length;}
 // Client-rendered data: long JSON-bearing attributes or framework data scripts that a static reader does not read.
 const noScript=html.replace(/<script\b[\s\S]*?<\/script>/gi,'');const dataAttrs=[...noScript.matchAll(/\sdata-[a-z-]+="([^"]{2000,})"/g)].length;
 const nextData=/id="__NEXT_DATA__"|window\.__NUXT__|data-react-class|data-props=/.test(html);
 const visible=noScript.replace(/<(style|svg|noscript|template)\b[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').length;
 let ledger=null;const plan=planOf(p.category);
 let equivalence=null;
 if(L){const deep=B.textBlocks225(html,{maxBlocks:1500}).blocks;const drt=deep.some(b=>PL.TEST_CONTEXT272.test(b));
  ledger=L.tableLedger1E(sem,plan,{sourceUrl:p.url,documentSha256:p.sha256,blocks:deep,documentReportsTesting:drt,html});
  // Instrumentation must not change what it diagnoses: the ledger's accepted elements are the frozen reader's leads, in order.
  const reader=plan?SEM.structuredTableLeads1D2(sem,plan,{sourceUrl:p.url,documentSha256:p.sha256,blocks:deep,documentReportsTesting:drt}):[];
  const a=JSON.stringify(reader.map(r=>[r.id,r.blockIndex,r.valueOffset,r.value,r.unit])),b=JSON.stringify(ledger.leads.map(r=>[r.id,r.blockIndex,r.valueOffset,r.value,r.unit]));
  equivalence={readerLeads:reader.length,ledgerLeads:ledger.leads.length,identical:a===b};}
 docs.push({page:p.ev+"/"+p.tag,ev:p.ev,host:p.host,category:p.category,plan:!!plan,equivalence,nodes:nodeCount,parseTruncated:truncated,ms:Date.now()-t0,
  tables,clientRendered:{longDataAttributes:dataAttrs,frameworkData:nextData,visibleChars:visible,suspected:dataAttrs>0&&visible<5000},ledger});}
store.close();
const flat=docs.flatMap(d=>d.tables.map(t=>({...t,host:d.host,page:d.page})));
const sum={pages:docs.length,hosts:[...new Set(docs.map(d=>d.host))].length,tablesDom:flat.length,nested:flat.filter(t=>t.nested).length,noGrid:flat.filter(t=>!t.grid).length,
 beyondLimit:flat.filter(t=>t.semantics==='beyond_table_limit_40').length,readBySemantics:flat.filter(t=>t.semantics==='read').length,
 sourceCells:flat.reduce((a,t)=>a+t.sourceCells,0),occupiedSlots:flat.reduce((a,t)=>a+t.occupiedSlots,0),emptySlots:flat.reduce((a,t)=>a+t.emptySlots,0),spannedCells:flat.reduce((a,t)=>a+t.spanned,0),
 thCells:flat.reduce((a,t)=>a+t.th,0),scopeCells:flat.reduce((a,t)=>a+t.scope,0),headersAttrCells:flat.reduce((a,t)=>a+t.headersAttr,0),tablesWithThead:flat.filter(t=>t.thead).length,tablesWithCaption:flat.filter(t=>t.caption).length,
 gridWarnings:count(flat.flatMap(t=>t.warnings)),modes:count(flat.filter(t=>t.grid).map(t=>t.mode)),modeReasons:count(flat.flatMap(t=>t.modeReasons)),
 contexts:count(flat.filter(t=>t.semantics==='read').map(t=>t.context)),hardExcludedTables:flat.filter(t=>t.hardExcluded).length,
 cellsWithoutBlock:flat.reduce((a,t)=>a+(t.cellsWithoutBlock??0),0),cellsInUnreadTables:flat.filter(t=>t.semantics!=='read').reduce((a,t)=>a+t.sourceCells,0),
 parseTruncatedPages:docs.filter(d=>d.parseTruncated).length,clientRenderedPages:docs.filter(d=>d.clientRendered.suspected).map(d=>d.page),pagesWithoutTables:docs.filter(d=>!d.tables.length).length,
 byHost:Object.fromEntries([...new Set(docs.map(d=>d.host))].map(h=>[h,{pages:docs.filter(d=>d.host===h).length,tables:flat.filter(t=>t.host===h).length,read:flat.filter(t=>t.host===h&&t.semantics==='read').length,
  modes:count(flat.filter(t=>t.host===h&&t.grid).map(t=>t.mode)),contexts:count(flat.filter(t=>t.host===h&&t.semantics==='read').map(t=>t.context))}])),
 ms:Date.now()-t0all,...(L?{ledgerEquivalence:{pages:docs.filter(d=>d.equivalence).length,identical:docs.filter(d=>d.equivalence?.identical).length,readerLeads:docs.reduce((a,d)=>a+(d.equivalence?.readerLeads??0),0),ledgerLeads:docs.reduce((a,d)=>a+(d.equivalence?.ledgerLeads??0),0)},ledger:L.summariseLedgers1E(docs.map(d=>d.ledger).filter(Boolean))}:{})};
const meta={schema:'pee.tables1e.inventory.v1',label,at:new Date().toISOString(),build:buildIdentity(D),tier:'development (every page examined before)',ledgerVersion:L?.TABLE_LEDGER1E_VERSION??null};
mkdirSync(PUBD,{recursive:true});mkdirSync(PRIVD,{recursive:true});
writeFileSync(PRIV,JSON.stringify({...meta,summary:sum,documents:docs},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...meta,summary:sum,documents:docs.map(d=>({page:d.page,host:d.host,category:d.category,plan:d.plan,nodes:d.nodes,parseTruncated:d.parseTruncated,clientRendered:d.clientRendered,
 tables:d.tables,ledger:d.ledger?L.publicLedger1E(d.ledger):null}))},null,1)+'\n');
console.log(JSON.stringify(sum,null,1).slice(0,6000));
