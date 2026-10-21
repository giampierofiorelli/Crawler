#!/usr/bin/env node
/** D1 (first increment, owner authorisation 2026-10-21): read-only census of the situation -> criterion -> evidence
 * relations of the owner's research packages and of what the knowledge store keeps of them. Protocol registered before
 * any judgement: evaluation/d1/census-protocol.json. Nothing is written to any store; the store is opened read-only.
 * Usage:
 *   node scripts/d1-relation-census.mjs --packages DIR --store STORE_COPY --roles ROLES_ADJUDICATED --private OUT_PRIVATE --public OUT_PUBLIC [--sample N --seed S --sample-out FILE]
 * Private output: per-row cells, statements and outcomes (owner material). Public output: counts and ids only. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {DatabaseSync} from 'node:sqlite';

const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const PKG=arg('packages'),STORE=arg('store'),ROLES=arg('roles'),PRIV=arg('private'),PUB=arg('public');
if(!PKG||!STORE||!ROLES||!PRIV||!PUB)throw Error('usage: see header');
for(const f of [PRIV,PUB])if(fs.existsSync(f))throw Error(f+' exists: never overwritten');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');

// ---- 1. documents and tables (same parsing as the column-role input: header row, separator row, data rows)
const files=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.md'))files.push(p);}})(PKG);
const cellsOf=l=>l.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(s=>s.trim());
const docs=[];const tables=[];const seen=new Map();
for(const f of files.sort()){const text=fs.readFileSync(f,'utf8');const h=sha(text);const rel=path.relative(PKG,f);const dup=seen.get(h)??null;if(!dup)seen.set(h,rel);
 docs.push({doc:rel,sha256:h,lines:text.split('\n').length,duplicateOf:dup,text});if(dup)continue;
 const lines=text.split('\n');const heads=[];
 for(let i=0;i<lines.length;i++){const m=/^(#{1,6})\s+(.*)$/.exec(lines[i]);if(m){heads.length=m[1].length-1;heads[m[1].length-1]=m[2].trim();}
  if(/^\s*\|/.test(lines[i])&&i+1<lines.length&&/^\s*\|?\s*:?-{2,}/.test(lines[i+1])){const header=cellsOf(lines[i]);const rows=[];let j=i+2;
   while(j<lines.length&&/^\s*\|/.test(lines[j])){rows.push({line:j+1,cells:cellsOf(lines[j])});j++;}
   tables.push({id:`T${tables.length}`,doc:rel,headerLine:i+1,headings:heads.filter(Boolean),header,rows});i=j-1;}}}
const roles=new Map(JSON.parse(fs.readFileSync(ROLES,'utf8')).tables.map(t=>[t.id,t.roles]));
for(const t of tables){const r=roles.get(t.id);if(!r||r.length!==t.header.length)throw Error('roles do not match table '+t.id+' (inventory changed?)');t.roles=r;}

// ---- 2. category of each document (package folder; the R01-R39 register belongs to dehumidifiers)
const CAT=[[/AIR-FRYERS|^air-fryers\//i,'air_fryers'],[/COFFEE/i,'coffee_machines'],[/DEHUMIDIFIER/i,'dehumidifiers'],[/AIR-PURIFIERS/i,'air_purifiers'],
 [/ROBOT-FLOOR/i,'robot_floor_cleaners'],[/DISHWASHERS/i,'dishwashers'],[/TELEVISIONS/i,'televisions'],[/SOUNDBARS/i,'soundbars'],[/SPEAKERS/i,'speakers']];
const catOf=d=>CAT.find(([re])=>re.test(d))?.[1]??'unassigned';

// ---- 3. store (read-only): current statements by source SHA-256 and line
const db=new DatabaseSync(STORE,{readOnly:true});
const st=db.prepare(`SELECT statement_id,category_id,source_document,source_sha256,line,type,subject_json,object_json,quote_sha256 FROM knowledge_statements WHERE state='current'`).all();
const bySha=new Map();for(const s of st)(bySha.get(s.source_sha256)??bySha.set(s.source_sha256,[]).get(s.source_sha256)).push(s);
const storeDocs=[...new Set(st.map(s=>s.source_document+'|'+s.source_sha256))].map(x=>{const [d,h]=x.split('|');return {d,h};});
const events=db.prepare(`SELECT kind,payload_json FROM events WHERE kind='knowledge_statements_recorded'`).all().map(e=>({type:e.kind,p:JSON.parse(e.payload_json)}));

// translator normalisation (knowledge_translation clean()) and lower case
const clean=s=>s.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g,'$1').replace(/[*_`]+/g,'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s??'').toLowerCase();
const inSlot=(cell,slot)=>{const c=norm(cell),t=norm(slot);if(!c||!t)return false;return t.includes(c)||(c.includes(t)&&t.length>=0.6*c.length);};
const typed=j=>{if(!j)return false;const o=JSON.parse(j);return ['concepts','metrics','kinds','units','axes'].some(k=>(o[k]??[]).length>0);};
const textOf=j=>j?JSON.parse(j).text??'':'';

// ---- 4. outcomes per documented relation
const LINKS=[['situation','need'],['situation','criterion'],['need','criterion'],['criterion','evidence'],['need','evidence'],['situation','evidence']];
const isRel=r=>r.some(x=>x==='situation'||x==='need')&&r.some(x=>x==='criterion'||x==='evidence');
const docInfo=new Map(docs.filter(d=>!d.duplicateOf).map(d=>[d.doc,d]));
const rows=[];
for(const t of tables){if(!isRel(t.roles))continue;const d=docInfo.get(t.doc);const stmts=bySha.get(d.sha256)??[];const translated=stmts.length>0;
 for(const r of t.rows){const at=stmts.filter(s=>s.line===r.line);
  const cells=t.header.map((h,j)=>({j,role:t.roles[j],text:r.cells[j]??''}));
  const subjCell=at.length?cells.find(c=>c.text&&at.some(s=>inSlot(c.text,textOf(s.subject_json)))):null;
  const qualifiers=cells.filter(c=>(c.role==='condition'||c.role==='caveat')&&c.text).length;
  for(const [rx,ry] of LINKS)for(const X of cells.filter(c=>c.role===rx&&c.text))for(const Y of cells.filter(c=>c.role===ry&&c.text)){
   let outcome;let evidence=null;
   if(!translated)outcome='document_not_translated';
   else{const both=at.find(s=>(inSlot(X.text,textOf(s.subject_json))&&inSlot(Y.text,textOf(s.object_json)))||(inSlot(Y.text,textOf(s.subject_json))&&inSlot(X.text,textOf(s.object_json))));
    if(both){outcome=(typed(both.subject_json)||typed(both.object_json))?'survived_usable':'survived_untyped';evidence=both.statement_id;}
    else if(!at.length)outcome='lost_dropped_cell';
    else if(subjCell&&subjCell.role==='identifier')outcome='altered';
    else if(subjCell&&subjCell.j!==X.j&&subjCell.j!==Y.j)outcome='unrepresentable';
    else outcome='lost_dropped_cell';}
   rows.push({category:catOf(t.doc),doc:t.doc,table:t.id,line:r.line,link:rx+'->'+ry,x:X.j,y:Y.j,outcome,statement:evidence,subjectColumn:subjCell?.j??null,subjectRole:subjCell?.role??null,qualifiers,
    xText:X.text,yText:Y.text,stored:at.map(s=>({id:s.statement_id,type:s.type,subject:textOf(s.subject_json),object:textOf(s.object_json),subjectTyped:typed(s.subject_json),objectTyped:typed(s.object_json)}))});}}}

// ---- 5. provenance check per translated document
const prov=[];
for(const {d,h} of storeDocs){const local=docs.find(x=>x.sha256===h);const base=path.basename(d);const byName=docs.filter(x=>path.basename(x.doc)===base);
 const ss=bySha.get(h)??[];const lines=local?local.lines:0;
 // quote hash of table-role statements: `${subject cell} | ${header}: ${cell}` with the translator's clean()
 let verifiable=0,verified=0;
 if(local){const L=local.text.split('\n');const hdrAt=new Map();let header=null;
  L.forEach((l,i)=>{if(/^\s*\|/.test(l)){const c=l.trim().replace(/^\||\|$/g,'').replace(/\\\|/g,'\u0000').split('|').map(x=>clean(x.replace(/\u0000/g,'|')));if(c.every(x=>/^:?-{2,}:?$/.test(x)))return;if(!header){header=c;return;}hdrAt.set(i+1,{header,cells:c});}else header=null;});
  for(const s of ss){const row=hdrAt.get(s.line);if(!row)continue;verifiable++;
   const cand=[];for(const a of row.cells)for(let j=0;j<row.cells.length;j++)cand.push(`${a} | ${row.header[j]??''}: ${row.cells[j]}`);
   if(cand.some(q=>sha(q)===s.quote_sha256))verified++;}}
 prov.push({storeDocument:d,sourceSha256:h,localMatchBySha:!!local,localDocs:byName.map(x=>x.doc),shaOfSameName:byName.map(x=>x.sha256===h),statements:ss.length,
  linesBeyondDocument:local?ss.filter(s=>s.line<1||s.line>lines).length:null,tableStatements:verifiable,tableQuoteHashRecomputed:verified});}

// ---- 6. counts
const inc=(o,k,n=1)=>{o[k]=(o[k]??0)+n;};
const perCat={};
for(const d of docs.filter(x=>!x.duplicateOf)){const c=catOf(d.doc);const o=perCat[c]??={documents:0,documentsTranslated:0,relationTables:0,relationRows:0,documentedRelations:0,byLink:{},outcomes:{},outcomesByLink:{}};
 o.documents++;if((bySha.get(d.sha256)??[]).length)o.documentsTranslated++;}
for(const t of tables.filter(t=>isRel(t.roles))){const o=perCat[catOf(t.doc)];o.relationTables++;o.relationRows+=t.rows.length;}
for(const r of rows){const o=perCat[r.category];o.documentedRelations++;inc(o.byLink,r.link);inc(o.outcomes,r.outcome);(o.outcomesByLink[r.link]??={})[r.outcome]=(o.outcomesByLink[r.link]?.[r.outcome]??0)+1;}
const total={};for(const r of rows)inc(total,r.outcome);
const recordedEvents=events.map(e=>({category:e.p.categoryId,document:path.basename(e.p.sourceDocument),recorded:e.p.recorded,skippedSelfCheck:e.p.skippedSelfCheck}));

// ---- 7. validation sample (seeded), for the independent agent
const N=Number(arg('sample')??0);
if(N){let seed=Number(arg('seed')??1);const rnd=()=>{seed=(seed*1103515245+12345)%2147483648;return seed/2147483648;};
 const pool=rows.filter(r=>r.outcome!=='document_not_translated').map((r,i)=>({r,k:rnd(),i})).sort((a,b)=>a.k-b.k).slice(0,N).map(x=>x.r);
 const T=new Map(tables.map(t=>[t.id,t]));
 const sample=pool.map((r,i)=>({unit:'V'+i,category:r.category,header:T.get(r.table).header,roles:T.get(r.table).roles,
  row:T.get(r.table).rows.find(x=>x.line===r.line).cells,link:r.link,x:r.x,y:r.y,stored:r.stored.map(s=>({type:s.type,subject:s.subject,object:s.object,subjectTyped:s.subjectTyped,objectTyped:s.objectTyped}))}));
 const key=pool.map((r,i)=>({unit:'V'+i,outcome:r.outcome,table:r.table,line:r.line}));
 fs.writeFileSync(arg('sample-out'),JSON.stringify({seed:Number(arg('seed')??1),units:sample},null,1));fs.writeFileSync(arg('sample-out').replace(/\.json$/,'-key.json'),JSON.stringify(key,null,1));}

fs.mkdirSync(path.dirname(PRIV),{recursive:true});
fs.writeFileSync(PRIV,JSON.stringify({schema:'pee.d1.census-detail.v1',rows,provenance:prov,recordedEvents},null,0));
const pub={schema:'pee.d1.census-counts.v1',protocol:'evaluation/d1/census-protocol.json',store:{file:'pee-knowledge snapshot/pee246.sqlite (read-only copy)',sha256:sha(fs.readFileSync(STORE))},
 documents:docs.length,duplicates:docs.filter(d=>d.duplicateOf).length,tables:tables.length,relationTables:tables.filter(t=>isRel(t.roles)).length,documentedRelations:rows.length,outcomes:total,perCategory:perCat,
 provenance:prov.map(p=>({document:path.basename(p.storeDocument),localMatchBySha:p.localMatchBySha,statements:p.statements,linesBeyondDocument:p.linesBeyondDocument,tableStatements:p.tableStatements,tableQuoteHashRecomputed:p.tableQuoteHashRecomputed})),
 translationEvents:recordedEvents};
fs.writeFileSync(PUB,JSON.stringify(pub,null,1)+'\n');
console.log(JSON.stringify({documentedRelations:rows.length,outcomes:total},null,0));
