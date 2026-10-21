#!/usr/bin/env node
/** D1 cause trace (first increment, read-only). The census (scripts/d1-relation-census.mjs) shows WHAT the store lost;
 * this script tests WHY, with the translator that actually wrote the store (knowledge_translation.ts at the commit whose
 * source hash is in the statements' translator id), built in a separate worktree. Two steps:
 *  1. reproduction: re-translate every translated document with that build and compare, line by line, the number and the
 *     (type, subject, object) of the statements with the store. A cause is called demonstrated only where the store is
 *     reproduced;
 *  2. per lost cell: is its column header given a translation role by that translator? A neutral one-row probe table
 *     (the header plus a cell no statement pattern matches) answers it; a header without a role drops every cell under it.
 * Usage: node scripts/d1-cause-trace.mjs --translator-build DIR --packages DIR --store STORE_COPY --detail CENSUS_DETAIL --private OUT --public OUT */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {DatabaseSync} from 'node:sqlite';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const B=arg('translator-build'),PKG=arg('packages'),STORE=arg('store'),DET=arg('detail'),PRIV=arg('private'),PUB=arg('public');
for(const f of [PRIV,PUB])if(fs.existsSync(f))throw Error(f+' exists: never overwritten');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const KT=await import(path.join(B,'dist/src/knowledge_translation.js'));const QK=await import(path.join(B,'dist/src/quantity_knowledge.js'));
const srcHash=sha(fs.readFileSync(path.join(B,'src/knowledge_translation.ts'))).slice(0,12);
const qk=QK.loadQuantityKnowledge();
const db=new DatabaseSync(STORE,{readOnly:true});
const translators=db.prepare(`SELECT DISTINCT translator FROM knowledge_statements`).all().map(r=>r.translator);
if(!translators.every(t=>t.endsWith('+'+srcHash)))throw Error(`the build's translator (${srcHash}) is not the one that wrote the store (${translators})`);
// category concepts as the recording script passed them (store items; they type slots, they do not create statements)
const conceptsOf=cat=>db.prepare(`SELECT statement,concept_id,aliases_json FROM category_items WHERE category_id=? AND concept_id IS NOT NULL`).all(cat).map(r=>({id:r.concept_id,statement:r.statement,aliases:JSON.parse(r.aliases_json)}));
const st=db.prepare(`SELECT category_id,source_sha256,line,type,subject_json,object_json FROM knowledge_statements WHERE state='current'`).all();
const files=[];(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(p.endsWith('.md'))files.push(p);}})(PKG);
const byHash=new Map(files.map(f=>[sha(fs.readFileSync(f)),f]));
const key=(type,s,o)=>`${type}|${s??''}|${o??''}`;
const repro={documents:0,linesCompared:0,linesIdentical:0,statementsStore:0,statementsRerun:0};const perDoc=[];
for(const h of [...new Set(st.map(s=>s.source_sha256))]){const f=byHash.get(h);if(!f)continue;const rows=st.filter(s=>s.source_sha256===h);const cat=rows[0].category_id;
 const r=KT.translateDocument(qk,fs.readFileSync(f,'utf8'),{source:cat,concepts:conceptsOf(cat)}).statements.filter(s=>!s.selfCheck.length);
 const A=new Map(),Bm=new Map();
 for(const s of rows)(A.get(s.line)??A.set(s.line,[]).get(s.line)).push(key(s.type,JSON.parse(s.subject_json??'null')?.text,JSON.parse(s.object_json??'null')?.text));
 for(const s of r)(Bm.get(s.provenance.line)??Bm.set(s.provenance.line,[]).get(s.provenance.line)).push(key(s.type,s.subject?.text,s.object?.text));
 let same=0,n=0;for(const l of new Set([...A.keys(),...Bm.keys()])){n++;const a=[...new Set(A.get(l)??[])].sort().join('\n'),b=[...new Set(Bm.get(l)??[])].sort().join('\n');if(a===b)same++;}
 repro.documents++;repro.linesCompared+=n;repro.linesIdentical+=same;repro.statementsStore+=rows.length;repro.statementsRerun+=r.length;
 perDoc.push({document:path.basename(f),lines:n,identical:same,store:rows.length,rerun:r.length});}
// per lost cell: does its header carry a translation role? (neutral probe cell: lower-case words no statement pattern matches)
const roleCache=new Map();
const headerHasRole=h=>{if(roleCache.has(h))return roleCache.get(h);const md=`# Probe\n\n| Item | ${h} |\n|---|---|\n| alpha item | zebra quilt marmalade |\n`;
 const out=KT.translateDocument(qk,md,{source:'probe'}).statements.some(s=>(s.object?.text??'').includes('zebra quilt marmalade'));roleCache.set(h,out);return out;};
const D=JSON.parse(fs.readFileSync(DET,'utf8'));
const tablesHeader=new Map();
const cellsOf=l=>l.trim().replace(/^\|/,'').replace(/\|$/,'').split('|').map(s=>s.trim());
for(const f of files){const L=fs.readFileSync(f,'utf8').split('\n');const rel=path.relative(PKG,f);for(let i=0;i<L.length;i++)if(/^\s*\|/.test(L[i])&&/^\s*\|?\s*:?-{2,}/.test(L[i+1]??''))tablesHeader.set(rel+':'+(i+1),cellsOf(L[i]));}
const causes={};const inc=(k)=>causes[k]=(causes[k]??0)+1;const detail=[];
for(const r of D.rows){if(r.outcome==='survived_usable'||r.outcome==='survived_untyped')continue;
 let cause;
 if(r.outcome==='document_not_translated')cause='document_not_selected_for_translation';
 else if(r.outcome==='altered')cause='row_subject_is_identifier_column';
 else if(r.outcome==='unrepresentable')cause='binary_subject_to_cell_design';
 else{const hdr=[...tablesHeader.entries()].find(([k])=>k.startsWith(r.doc+':')&&D.rows.some(()=>true));
  // the header of the table holding this row
  const t=[...tablesHeader.entries()].filter(([k])=>k.startsWith(r.doc+':')).map(([k,v])=>({line:Number(k.split(':').at(-1)),v})).filter(x=>x.line<r.line).sort((a,b)=>b.line-a.line)[0];
  const hx=t?.v[r.x]??'',hy=t?.v[r.y]??'';
  if(!r.stored.length)cause='row_produced_no_statement';
  else{const lostCells=[[r.xText,hx],[r.yText,hy]].filter(([c])=>!r.stored.some(s=>(s.subject+' '+s.object).toLowerCase().includes(c.replace(/[*_`]+/g,'').toLowerCase().slice(0,25))));
   cause=lostCells.length&&lostCells.every(([,h])=>!headerHasRole(h))?'cell_header_without_translation_role':lostCells.length?'cell_with_role_not_recognised_or_split':'cells_present_in_separate_statements';}}
 inc(cause);detail.push({category:r.category,table:r.table,line:r.line,link:r.link,outcome:r.outcome,cause});}
const byCat={};for(const d of detail)(byCat[d.category]??={})[d.cause]=(byCat[d.category]?.[d.cause]??0)+1;
const headersWithoutRole=[...roleCache].filter(([,v])=>!v).length,headersWithRole=[...roleCache].filter(([,v])=>v).length;
fs.writeFileSync(PRIV,JSON.stringify({translatorSource:srcHash,repro,perDoc,detail,headerRoles:[...roleCache]},null,0));
fs.writeFileSync(PUB,JSON.stringify({schema:'pee.d1.cause-trace.v1',translatorSource:srcHash,translatorInStore:translators,reproduction:repro,reproductionPerDocument:perDoc,
 causes,causesPerCategory:byCat,probedHeaders:{withoutRole:headersWithoutRole,withRole:headersWithRole},
 demonstrated:{document_not_selected_for_translation:'scripts/s78-record-statements.mjs selects the documents (one file per category from section-split.json for air purifiers, coffee and air fryers; all files of the TV and household-dishwasher packages; the dehumidifier consolidated file); robot floor cleaners, soundbars and speakers are not in the list',
  binary_subject_to_cell_design:'knowledge_translation.ts (table rows): the subject is the subject-role column or the first column, and every other cell becomes one subject->cell statement; a relation between two non-subject cells has no slot',
  row_subject_is_identifier_column:'same code: with no subject-role header the first column is the subject, and in the need atlases the first column is a row id (N01...)',
  cell_header_without_translation_role:'same code: a cell whose header has no role in translation-cues tableHeaderRoles and that no statement pattern or quantity matches is counted unrecognised and dropped (probe-tested header by header with the store\'s translator)'}},null,1)+'\n');
console.log(JSON.stringify({repro,causes}));
