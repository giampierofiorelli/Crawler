#!/usr/bin/env node
/** Third increment, part T, on the sealed held-out rows H3 (evaluation/i3/preregistration.json; seal
 * evaluation/i3/h3-freeze.json). Arms: T1 header (frozen n1.1), T2 learned column types + learned links (frozen models),
 * secondary: header+content, learned (chain links). Same scoring as N1 L1 plus provenance
 * completeness of the claims each arm derives. Refuses material that differs from its seal; never overwrites.
 * Usage: node scripts/i3-table-check.mjs LABEL --packages DIR */
import fs from 'node:fs';import path from 'node:path';import {homedir} from 'node:os';import crypto from 'node:crypto';
import {teachingTablesN1,columnRolesByN1,rowLinksN1,rowLinksLearnedN1,loadLearnedModelsN1,loadRelationRolesN1,deriveClaimsN1,deriveClaimsByN1} from '../dist/src/relation_claims_n1.js';
import {loadQuantityKnowledge} from '../dist/src/quantity_knowledge.js';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('packages'))throw Error('usage: LABEL --packages DIR');
const E=new URL('../evaluation/i3/',import.meta.url).pathname;const OUT=path.join(E,`t-check-${LABEL}.json`);if(fs.existsSync(OUT))throw Error(OUT+' exists');
const H=path.join(homedir(),'.local/share/product-evidence-engine/private-eval/i3/h3');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const fz=JSON.parse(fs.readFileSync(path.join(E,'h3-freeze.json'),'utf8'));for(const [f,h] of Object.entries(fz.files))if(sha(fs.readFileSync(path.join(H,f)))!==h)throw Error(f+' differs from its seal');
const J=f=>JSON.parse(fs.readFileSync(path.join(H,f),'utf8'));const rows=J('h3-annotation-input.json').rows,key=new Map(J('h3-rows-key.json').map(k=>[k.id,k])),ref=new Map(J('h3-reference.json').rows.map(r=>[r.id,r]));
const qk=loadQuantityKnowledge();const {role,link}=loadLearnedModelsN1();const {lex}=loadRelationRolesN1();
const ARMS={T1:{m:'header'},T2:{m:'learned',links:true},'header+content':{m:'header+content'},learned:{m:'learned'}};
const lk=l=>`${l.from}>${l.to}:${l.kind}`,pk=l=>[l.from,l.to].sort((a,b)=>a-b).join('-');
const agg={};const bump=(g,k,n=1)=>{agg[g]??={};agg[g][k]=(agg[g][k]??0)+n;};const docs=new Map();const detail=[];
for(const r of rows){const k=key.get(r.id),R=ref.get(r.id);if(!docs.has(k.doc)){const md=fs.readFileSync(path.join(arg('packages'),k.doc),'utf8');docs.set(k.doc,{md,sha:sha(md),tables:teachingTablesN1(md)});}
 const D=docs.get(k.doc);const t=D.tables.find(x=>x.rows.some(y=>y.line===k.line));const groups=['all',`cat:${k.category}`,`doc:${path.basename(k.doc)}`];const out={id:r.id};
 for(const [arm,c] of Object.entries(ARMS)){const roles=t?columnRolesByN1(t,c.m,{qk,model:c.m==='learned'?role:null}):[];const rl=roles;
  const {links}=c.links?rowLinksLearnedN1(rl,r.cells,link,lex):rowLinksN1(rl,r.cells,lex);
  const ps=new Set(links.map(lk)),rs=new Set(R.links.map(lk)),pp=new Set(links.map(pk)),rp=new Set(R.links.map(pk));
  for(const g of groups){bump(g,arm+'_pred',ps.size);bump(g,arm+'_ref',rs.size);bump(g,arm+'_tp',[...ps].filter(x=>rs.has(x)).length);bump(g,arm+'_pp',pp.size);bump(g,arm+'_pr',rp.size);bump(g,arm+'_ptp',[...pp].filter(x=>rp.has(x)).length);
   bump(g,arm+'_up',links.filter(l=>!['relevant_to','addressed_by','assessed_by','qualified_by','alternative_of'].includes(l.kind)).length);
   for(const l of links){const m=R.links.find(x=>lk(x)===lk(l));if(m){bump(g,arm+'_ql');if(JSON.stringify([...m.qualifiers].sort())===JSON.stringify([...l.qualifiers].sort()))bump(g,arm+'_qa');}}
   rl.forEach((x,j)=>{bump(g,arm+'_cols');if(x===R.columnTypes[j])bump(g,arm+'_colok');});}
  out[arm]={roles:rl,links};}
 // provenance completeness of the derived claims (T1, T2)
 const src={categoryId:k.category,document:k.doc,sha256:D.sha};
 for(const [arm,claims] of [['T1',deriveClaimsN1(D.md,src)],['T2',deriveClaimsByN1(D.md,src,'learned',{model:role,linkModel:link})]]){const c=claims.find(x=>x.source.line===k.line);
  if(c){bump('all',arm+'_claims');if(c.source.sha256===D.sha&&c.source.line===k.line&&c.participants.every(p=>p.textSha256===sha(p.text)))bump('all',arm+'_prov_ok');}}
 detail.push({...out,reference:R.links});}
const f=(a,b)=>b?+(a/b).toFixed(3):null;const summary={};
for(const [g,o] of Object.entries(agg)){summary[g]={};for(const arm of Object.keys(ARMS)){const p=f(o[arm+'_tp']??0,o[arm+'_pred']??0),r=f(o[arm+'_tp']??0,o[arm+'_ref']??0);
 summary[g][arm]={precision:p,recall:r,f1:p&&r?+(2*p*r/(p+r)).toFixed(3):0,pairPrecision:f(o[arm+'_ptp']??0,o[arm+'_pp']??0),pairRecall:f(o[arm+'_ptp']??0,o[arm+'_pr']??0),
  inventedPairs:f((o[arm+'_pp']??0)-(o[arm+'_ptp']??0),o[arm+'_pp']??0),unsupportedUpgrades:o[arm+'_up']??0,qualifierAgreement:f(o[arm+'_qa']??0,o[arm+'_ql']??0),columnTypeAccuracy:f(o[arm+'_colok']??0,o[arm+'_cols']??0),
  ...(g==='all'?{claimsAtRow:o[arm+'_claims']??0,provenanceComplete:o[arm+'_prov_ok']??0}:{})};}}
fs.mkdirSync(path.join(H,'..','runs'),{recursive:true});fs.writeFileSync(path.join(H,'..','runs',`t-check-${LABEL}-detail.json`),JSON.stringify(detail,null,1));
fs.writeFileSync(OUT,JSON.stringify({schema:'pee.i3.t-check.v1',label:LABEL,seal:fz.files,models:{role:role.version+' '+role.trainedOn,link:link.version},summary},null,1)+'\n');
for(const arm of Object.keys(ARMS))console.log(arm.padEnd(16),JSON.stringify(summary.all[arm]));
