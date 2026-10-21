#!/usr/bin/env node
/** N1 L0/L1 scorer (preregistration evaluation/n1/preregistration.json). For each sampled table row (key: document, line)
 * it predicts the row's links two ways and scores them against a blind reference:
 *  - T0: the store as written (the 8cf307c translator's statements at the row, read-only store copy), each statement mapped
 *    to the columns its subject and object came from (the D1 slot test) and to the closest link kind;
 *  - T1: the N1 row claim (src/relation_claims_n1.ts, from dist/).
 * L0: N1 column roles vs the D1 adjudicated roles (collapsed to the D1 vocabulary).
 * Private output: per-row predictions and reference (owner material). Public output: counts only.
 * Usage: node scripts/n1-relation-eval.mjs --packages DIR --store STORE_COPY --input ROWS --key KEY --reference REF --d1roles ROLES --d1tables TABLES --private OUT --public OUT [--label L] */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {DatabaseSync} from 'node:sqlite';
import {teachingTablesN1,columnRolesN1,deriveClaimsN1,loadRelationRolesN1} from '../dist/src/relation_claims_n1.js';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const need=['packages','store','input','key','reference','d1roles','d1tables','private','public'];for(const k of need)if(!arg(k))throw Error('missing --'+k);
for(const f of [arg('private'),arg('public')])if(fs.existsSync(f))throw Error(f+' exists: never overwritten');
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const J=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const rows=J(arg('input')).rows,keyRaw=J(arg('key')),ref=J(arg('reference')).rows;
const key=Array.isArray(keyRaw)?keyRaw:[...(keyRaw.H1??[]),...(keyRaw.H2??[])];
const kById=new Map(key.map(k=>[k.id,k])),refById=new Map(ref.map(r=>[r.id,r]));
const d1roles=new Map(J(arg('d1roles')).tables.map(t=>[t.id,t.roles]));
const db=new DatabaseSync(arg('store'),{readOnly:true});
const stAt=db.prepare("SELECT type,subject_json,object_json FROM knowledge_statements WHERE state='current' AND source_sha256=? AND line=?");
const clean=s=>s.replace(/\[([^\]]+)\]\((?:[^)]+)\)/g,'$1').replace(/[*_`]+/g,'').replace(/\s+/g,' ').trim();
const norm=s=>clean(s??'').toLowerCase();
const inSlot=(cell,slot)=>{const c=norm(cell),t=norm(slot);if(!c||!t)return false;return t.includes(c)||(c.includes(t)&&t.length>=0.6*c.length);};
const T0KIND={measured_by:'assessed_by',requires:'assessed_by',bears_on_outcome:'relevant_to',limitation:'qualified_by',applicability:'qualified_by',not_sufficient:'qualified_by'};
const {mapping}=loadRelationRolesN1();
const COLLAPSE={function:'criterion',property:'criterion',method:'evidence',evidence:'evidence',situation:'situation',need:'need',condition:'condition',caveat:'caveat',identifier:'identifier',alternative:'other',value:'other',other:'other'};
const docCache=new Map();const doc=d=>{if(!docCache.has(d)){const md=fs.readFileSync(path.join(arg('packages'),d),'utf8');docCache.set(d,{md,sha:sha(md),tables:teachingTablesN1(md)});}return docCache.get(d);};
const lk=l=>`${l.from}>${l.to}:${l.kind}`,pk=l=>[l.from,l.to].sort((a,b)=>a-b).join('-');
const agg={};const bump=(g,k,n=1)=>{agg[g]??={};agg[g][k]=(agg[g][k]??0)+n;};
const detail=[];
for(const r of rows){const k=kById.get(r.id),R=refById.get(r.id);if(!k||!R)throw Error('no key/reference for '+r.id);
 const D=doc(k.doc);const groups=[r.id.split('-')[0],'all',`cat:${k.category}`];
 // T1
 const claim=deriveClaimsN1(D.md,{categoryId:k.category,document:k.doc,sha256:D.sha}).find(c=>c.source.line===k.line)??null;
 const t1=claim?claim.links:[];
 // T0
 const t0=[];for(const s of stAt.all(D.sha,k.line)){const sub=s.subject_json?JSON.parse(s.subject_json).text??'':'',obj=s.object_json?JSON.parse(s.object_json).text??'':'';
  const sc=r.cells.findIndex(c=>inSlot(c,sub)),oc=r.cells.findIndex((c,j)=>j!==sc&&inSlot(c,obj));
  if(sc>=0&&oc>=0)t0.push({from:sc,to:oc,kind:T0KIND[s.type]??'other',qualifiers:[]});}
 // L0: roles of the N1 table at this row vs D1 adjudicated roles
 const tbl=D.tables.find(t=>t.rows.some(x=>x.line===k.line));const roles=tbl?columnRolesN1(tbl):[];const d1=d1roles.get(k.table)??[];
 if(d1.length===roles.length)roles.forEach((x,j)=>{for(const g of groups){bump(g,'L0_columns');if(COLLAPSE[x]===d1[j]||(d1[j]==='source'&&COLLAPSE[x]==='evidence'))bump(g,'L0_agree');}});
 const refLinks=R.links,refSet=new Set(refLinks.map(lk)),refPairs=new Set(refLinks.map(pk));
 for(const [arm,pred] of [['T0',t0],['T1',t1]]){const ps=new Set(pred.map(lk)),pp=new Set(pred.map(pk));
  for(const g of groups){bump(g,arm+'_predicted',ps.size);bump(g,arm+'_reference',refSet.size);
   bump(g,arm+'_exact_tp',[...ps].filter(x=>refSet.has(x)).length);bump(g,arm+'_pair_tp',[...pp].filter(x=>refPairs.has(x)).length);bump(g,arm+'_pairs_predicted',pp.size);bump(g,arm+'_pairs_reference',refPairs.size);
   bump(g,arm+'_invented_pairs',[...pp].filter(x=>!refPairs.has(x)).length);
   if(R.noRelation&&pred.length)bump(g,arm+'_relations_where_none');
   if(pred.some(l=>!['relevant_to','addressed_by','assessed_by','qualified_by','alternative_of','other'].includes(l.kind)))bump(g,arm+'_unsupported_upgrades');
   for(const l of pred){const m=refLinks.find(x=>lk(x)===lk(l));if(m){bump(g,arm+'_qual_links');if(JSON.stringify([...m.qualifiers].sort())===JSON.stringify([...l.qualifiers].sort()))bump(g,arm+'_qual_agree');}}}}
 detail.push({id:r.id,category:k.category,doc:k.doc,line:k.line,roles,d1roles:d1,t0,t1,reference:refLinks,claimId:claim?.claimId??null});}
const rate=(a,b)=>b?Number((a/b).toFixed(3)):null;
const summary={};for(const [g,o] of Object.entries(agg)){summary[g]={rows:detail.filter(d=>g==='all'||d.id.startsWith(g+'-')||g==='cat:'+d.category).length,L0:{columns:o.L0_columns??0,agreement:rate(o.L0_agree??0,o.L0_columns??0)}};
 for(const arm of ['T0','T1'])summary[g][arm]={predictedLinks:o[arm+'_predicted']??0,referenceLinks:o[arm+'_reference']??0,
  precision:rate(o[arm+'_exact_tp']??0,o[arm+'_predicted']??0),recall:rate(o[arm+'_exact_tp']??0,o[arm+'_reference']??0),
  pairPrecision:rate(o[arm+'_pair_tp']??0,o[arm+'_pairs_predicted']??0),pairRecall:rate(o[arm+'_pair_tp']??0,o[arm+'_pairs_reference']??0),
  inventedPairShare:rate(o[arm+'_invented_pairs']??0,o[arm+'_pairs_predicted']??0),relationsWhereNone:o[arm+'_relations_where_none']??0,
  unsupportedUpgrades:o[arm+'_unsupported_upgrades']??0,qualifierAgreementOnMatchedLinks:rate(o[arm+'_qual_agree']??0,o[arm+'_qual_links']??0)};}
fs.mkdirSync(path.dirname(arg('private')),{recursive:true});
fs.writeFileSync(arg('private'),JSON.stringify({schema:'pee.n1.l1-detail.v1',label:arg('label'),mapping,detail},null,1));
const pub={schema:'pee.n1.l1-scores.v1',label:arg('label'),mapping,reference:path.basename(arg('reference')),referenceSha256:sha(fs.readFileSync(arg('reference'))),store:{sha256:sha(fs.readFileSync(arg('store')))},summary};
fs.writeFileSync(arg('public'),JSON.stringify(pub,null,1)+'\n');console.log(JSON.stringify(summary.all,null,0));
