#!/usr/bin/env node
/** A5 (first increment, owner authorisation 2026-10-21: "per ora soltanto censimento e verifica"). Read-only census of
 * how the knowledge store is written and what its journal can reconstruct. Nothing in the store or the code changes.
 *  1. static (TypeScript AST): every SQL write (INSERT, UPDATE, DELETE, REPLACE, CREATE, DROP, ALTER) in
 *     KnowledgeStore246's methods, with the event kinds the same method appends; and every write or read that another
 *     module makes through `store.db` (the external dependence on the public field);
 *  2. on a controlled copy of the store (opened read-only): per table, rows, and how much of each table the journal
 *     identifies (a row's primary key appears in some event payload) and carries (every non-timestamp column value of the
 *     row appears in one event payload); the hash chain of the journal; the one projection that is rebuilt from events
 *     (source_memory260) compared with a rebuild into a scratch database.
 * "Introducing a store method" is not the same as making a write rebuildable: a write is rebuildable from the journal
 * only when its event carries the content (measured in 2), not when it is called through a method (measured in 1).
 * Usage: node scripts/a5-store-write-census.mjs --store STORE_COPY --public OUT_PUBLIC --private OUT_PRIVATE */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {DatabaseSync} from 'node:sqlite';import ts from 'typescript';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const STATIC_ONLY=process.argv.includes('--static-only');
const STORE=arg('store'),PUB=arg('public'),PRIV=arg('private');if(!STATIC_ONLY)for(const f of [PUB,PRIV])if(fs.existsSync(f))throw Error(f+' exists: never overwritten');
const SRC=new URL('../src/',import.meta.url).pathname;
const WRITE=/\b(INSERT|UPDATE|DELETE|REPLACE|CREATE\s+(?:TABLE|INDEX|TRIGGER|VIEW)|DROP|ALTER)\b/i;
const tableOf=sql=>{const m=/\b(?:INSERT(?:\s+OR\s+\w+)?\s+INTO|UPDATE|DELETE\s+FROM|REPLACE\s+INTO|CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?|DROP\s+TABLE(?:\s+IF\s+EXISTS)?|ALTER\s+TABLE)\s+([A-Za-z_][A-Za-z0-9_]*)/i.exec(sql);return m?m[1]:null;};
const verbOf=sql=>(WRITE.exec(sql)?.[1]??'').toUpperCase().split(/\s+/)[0];
const textOfNode=n=>ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n)?n.text:ts.isTemplateExpression(n)?n.head.text+n.templateSpans.map(s=>'${}'+s.literal.text).join(''):null;

// ---- 1a. KnowledgeStore246 methods
const file=SRC+'phase246_knowledge_store.ts';const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.ES2022,true);
const methods=[];
ts.forEachChild(sf,function visit(n){if(ts.isClassDeclaration(n)&&n.name?.text==='KnowledgeStore246'){for(const m of n.members){
  if(!(ts.isMethodDeclaration(m)||ts.isConstructorDeclaration(m)||ts.isGetAccessor(m))||!m.body)continue;
  const name=m.name?m.name.getText(sf):'constructor';const writes=[];const events=[];let calls=new Set();
  (function walk(x){const t=textOfNode(x);if(t&&WRITE.test(t)&&/\b(INTO|UPDATE|FROM|TABLE)\b/i.test(t))writes.push({verb:verbOf(t),table:tableOf(t),line:sf.getLineAndCharacterOfPosition(x.getStart()).line+1});
   if(ts.isCallExpression(x)&&ts.isPropertyAccessExpression(x.expression)&&x.expression.expression.kind===ts.SyntaxKind.ThisKeyword){const callee=x.expression.name.text;calls.add(callee);
    if(callee==='event'&&x.arguments[0]){const k=textOfNode(x.arguments[0]);events.push(k??'(computed)');}}
   ts.forEachChild(x,walk);})(m.body);
  methods.push({method:name,line:sf.getLineAndCharacterOfPosition(m.getStart()).line+1,writes,events:[...new Set(events)],calls:[...calls].filter(c=>c!=='event'&&c!=='db')});}}
 ts.forEachChild(n,visit);});
// a write is "journalled in method" when the same method appends an event; transitively when a this.-method it calls does
const byName=new Map(methods.map(m=>[m.method,m]));
const eventsReachable=(m,seen=new Set())=>{if(seen.has(m.method))return [];seen.add(m.method);return [...m.events,...m.calls.flatMap(c=>byName.has(c)?eventsReachable(byName.get(c),seen):[])];};
const writes=methods.flatMap(m=>m.writes.map(w=>({...w,method:m.method,eventsInMethod:m.events,eventsReachable:[...new Set(eventsReachable(m))]})));
const schemaWrites=writes.filter(w=>['CREATE','DROP','ALTER'].includes(w.verb));const dataWrites=writes.filter(w=>!['CREATE','DROP','ALTER'].includes(w.verb));

// ---- 1b. other modules using store.db / .db
const external=[];
for(const f of fs.readdirSync(SRC).filter(f=>f.endsWith('.ts')&&f!=='phase246_knowledge_store.ts')){const s=ts.createSourceFile(f,fs.readFileSync(SRC+f,'utf8'),ts.ScriptTarget.ES2022,true);
 const imp=/from '\.\/phase246_knowledge_store\.js'/.test(s.text);
 (function walk(x){if(ts.isPropertyAccessExpression(x)&&x.name.text==='db'&&imp){
   // the SQL handed to the next prepare/exec on this access
   let p=x.parent;let sql=null;while(p&&!ts.isCallExpression(p))p=p.parent;
   if(p&&ts.isCallExpression(p)&&ts.isPropertyAccessExpression(p.expression)&&['prepare','exec'].includes(p.expression.name.text)&&p.arguments[0])sql=textOfNode(p.arguments[0]);
   const kind=sql?(WRITE.test(sql)&&/\b(INTO|UPDATE|FROM|TABLE)\b/i.test(sql)?'write':'read'):'other';
   external.push({module:f,line:s.getLineAndCharacterOfPosition(x.getStart()).line+1,kind,verb:sql?verbOf(sql)||'SELECT':null,table:sql?tableOf(sql)??(/FROM\s+([A-Za-z_]\w*)/i.exec(sql)?.[1]??null):null});}
  ts.forEachChild(x,walk);})(s);}

const staticSummary=()=>({storeMethods:methods.length,methodsThatWrite:methods.filter(m=>m.writes.length).length,
  dataWrites:dataWrites.length,dataWritesJournalledInMethod:dataWrites.filter(w=>w.eventsInMethod.length).length,dataWritesJournalledViaCalledMethod:dataWrites.filter(w=>!w.eventsInMethod.length&&w.eventsReachable.length).length,
  dataWritesWithoutAnyEvent:dataWrites.filter(w=>!w.eventsReachable.length).length,schemaWrites:schemaWrites.length,eventCallSites:methods.reduce((a,m)=>a+m.events.length,0),
  writesByTable:Object.fromEntries([...new Set(dataWrites.map(w=>w.table))].map(t=>[t,{writes:dataWrites.filter(w=>w.table===t).length,withoutEvent:dataWrites.filter(w=>w.table===t&&!w.eventsReachable.length).length}])),
  externalDbAccess:{sites:external.length,writes:external.filter(e=>e.kind==='write').length,reads:external.filter(e=>e.kind==='read').length,other:external.filter(e=>e.kind==='other').length,
   modules:Object.fromEntries([...new Set(external.map(e=>e.module))].map(m=>[m,{writes:external.filter(e=>e.module===m&&e.kind==='write').length,reads:external.filter(e=>e.module===m&&e.kind==='read').length,other:external.filter(e=>e.module===m&&e.kind==='other').length,
    writeTables:[...new Set(external.filter(e=>e.module===m&&e.kind==='write').map(e=>e.table))]}]))}});
if(STATIC_ONLY){console.log(JSON.stringify(staticSummary()));process.exit(0);}
// ---- 2. controlled copy (read-only)
const db=new DatabaseSync(STORE,{readOnly:true});
const tables=db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`).all().map(r=>r.name);
const events=db.prepare(`SELECT seq,at,kind,payload_json,previous_sha256,event_sha256 FROM events ORDER BY seq`).all();
// hash chain: each event's previous hash is the preceding event's hash (the event hash recomputation is the store's own; only linkage is checked here)
let chainBreaks=0;for(let i=1;i<events.length;i++)if(events[i].previous_sha256!==events[i-1].event_sha256)chainBreaks++;
const kinds={};for(const e of events)kinds[e.kind]=(kinds[e.kind]??0)+1;
const payloads=events.map(e=>e.payload_json);const allPayload=payloads.join('\n');
const coverage=[];
for(const t of tables){if(t==='events'||t==='sqlite_sequence')continue;
 const cols=db.prepare(`PRAGMA table_info(${t})`).all();const pk=cols.filter(c=>c.pk>0).map(c=>c.name);
 const rows=db.prepare(`SELECT * FROM ${t}`).all();
 let identified=0,carried=0;
 const content=cols.filter(c=>!/(_at|^at|recorded_at|updated_at|created_at)$/.test(c.name)&&c.pk===0).map(c=>c.name);
 for(const r of rows){const ids=pk.map(k=>r[k]).filter(v=>v!==null&&v!==undefined).map(String);
  if(ids.length&&ids.every(v=>v.length>=4&&allPayload.includes(JSON.stringify(v).slice(1,-1))))identified++;
  // a value is carried when it occurs raw (numbers, nested JSON objects) or as an escaped JSON string
  const vals=content.map(c=>r[c]).filter(v=>v!==null&&v!==undefined&&String(v).length>=3).map(v=>[String(v),JSON.stringify(String(v)).slice(1,-1)]);
  if(vals.length&&payloads.some(p=>vals.every(([a,b])=>p.includes(a)||p.includes(b))))carried++;}
 coverage.push({table:t,rows:rows.length,primaryKey:pk,identifiedByJournal:identified,contentCarriedByJournal:carried});}

// projection rebuild: source_memory260 from events, into a scratch in-memory database (the store module's own rebuild)
let projection=null;
try{const M=await import(new URL('../dist/src/phase260_source_memory_store.js',import.meta.url).href);
 const fn=Object.entries(M).find(([k,v])=>typeof v==='function'&&/rebuild/i.test(k));
 projection={rebuildFunction:fn?fn[0]:null,note:fn?'found; comparison run by the A5 test on a store copy (tests/i1_store_write_census.test.ts)':'no exported rebuild function found'};}catch(e){projection={error:String(e.message)};}

const pub={schema:'pee.a5.store-write-census.v1',date:new Date().toISOString().slice(0,10),
 store:{file:'read-only copy of pee-knowledge snapshot/pee246.sqlite',sha256:crypto.createHash('sha256').update(fs.readFileSync(STORE)).digest('hex'),tables:tables.length,events:events.length,chainBreaks,eventKinds:kinds},
 static:staticSummary(),
 journalCoverage:coverage,projection,
 reading:'identifiedByJournal: the row\'s primary key occurs in some event payload; contentCarriedByJournal: every non-key, non-timestamp value of the row occurs in one event payload, the minimum for rebuilding the row from the journal alone. A table with content carried 0 cannot be rebuilt from the journal, whichever method writes it.'};
fs.mkdirSync(path.dirname(PRIV),{recursive:true});
fs.writeFileSync(PRIV,JSON.stringify({methods,writes,external},null,1));fs.writeFileSync(PUB,JSON.stringify(pub,null,1)+'\n');
console.log(JSON.stringify(pub.static,null,0).slice(0,1500));
