#!/usr/bin/env node
/** Third increment, part T, development comparison (evaluation/i3/preregistration.json): the column methods of
 * src/relation_claims_n1.ts (header = frozen n1.1, header+content, learned, learned+content) on the SPENT rows with
 * adjudicated references (N1 development 40, N1 H1+H2 80), by leave-one-document-out: a learned model never sees the
 * document it is scored on. Links follow the same chain rules (rowLinksN1) in every arm, so only column typing differs.
 * Writes counts to evaluation/i3/t-dev-LABEL.json and, with --train-final, the model trained on all spent rows to
 * resources/knowledge-translation/relation-role-model.v1.json (refuses to overwrite).
 * Usage: node scripts/i3-table-dev.mjs LABEL --packages DIR [--train-final] */
import fs from 'node:fs';import path from 'node:path';import {homedir} from 'node:os';
import {teachingTablesN1,columnRolesByN1,rowLinksN1,trainRoleModelN1,loadRelationRolesN1,trainLinkModelN1,rowLinksLearnedN1} from '../dist/src/relation_claims_n1.js';
import {loadQuantityKnowledge} from '../dist/src/quantity_knowledge.js';
const [LABEL]=process.argv.slice(2);const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!LABEL||!arg('packages'))throw Error('usage: LABEL --packages DIR');
const OUT=new URL(`../evaluation/i3/t-dev-${LABEL}.json`,import.meta.url).pathname;if(fs.existsSync(OUT))throw Error(OUT+' exists');
const P=path.join(homedir(),'.local/share/product-evidence-engine/private-eval/n1');const J=f=>JSON.parse(fs.readFileSync(f,'utf8'));
const sets=[{input:J(path.join(P,'dev/dev-annotation-input.json')).rows,key:J(path.join(P,'dev/dev-rows-key.json')),ref:J(path.join(P,'dev/dev-annotation-1.json')).rows},
 {input:J(path.join(P,'l1-annotation-input.json')).rows,key:(k=>[...k.H1,...k.H2])(J(path.join(P,'l1-rows-key.json'))),ref:J(path.join(P,'l1-reference.json')).rows}];
const qk=loadQuantityKnowledge();const docs=new Map();const tableOf=(doc,line)=>{if(!docs.has(doc))docs.set(doc,teachingTablesN1(fs.readFileSync(path.join(arg('packages'),doc),'utf8')));return docs.get(doc).find(t=>t.rows.some(r=>r.line===line));};
const rows=[];for(const s of sets){const K=new Map(s.key.map(k=>[k.id,k])),R=new Map(s.ref.map(r=>[r.id,r]));
 for(const r of s.input){const k=K.get(r.id),ref=R.get(r.id);const t=tableOf(k.doc,k.line);if(!t)throw Error('table not found '+r.id);rows.push({id:r.id,doc:k.doc,line:k.line,table:t,cells:r.cells,ref});}}
// training examples: one per (table, column), the reference type by majority over the table's annotated rows
const examplesOf=rs=>{const by=new Map();for(const r of rs)r.ref.columnTypes.forEach((ty,j)=>{const key=r.doc+'|'+r.table.headerLine+'|'+j;const e=by.get(key)??{table:r.table,col:j,votes:{}};e.votes[ty]=(e.votes[ty]??0)+1;by.set(key,e);});
 return [...by.values()].map(e=>({table:e.table,col:e.col,role:Object.entries(e.votes).sort((a,b)=>b[1]-a[1])[0][0]}));};
const lk=l=>`${l.from}>${l.to}:${l.kind}`,pk=l=>[l.from,l.to].sort((a,b)=>a-b).join('-');
const {lex}=loadRelationRolesN1();const METHODS=['header','header+content','learned','learned+content','learned+links'];
const agg=Object.fromEntries(METHODS.map(m=>[m,{pred:0,ref:0,tp:0,ptp:0,pp:0,pr:0,colsRight:0,cols:0}]));
const docsList=[...new Set(rows.map(r=>r.doc))];
for(const d of docsList){const test=rows.filter(r=>r.doc===d),train=rows.filter(r=>r.doc!==d);const ex=examplesOf(train);
 const models={'learned':trainRoleModelN1(ex,null,'fold'),'learned+content':trainRoleModelN1(ex,qk,'fold')};models['learned+links']=models['learned'];
 const linkModel=trainLinkModelN1(train.map(r=>({types:r.ref.columnTypes,links:r.ref.links,filled:r.cells.map(c=>!!c.trim())})),'fold');
 for(const m of METHODS)for(const r of test){const roles=columnRolesByN1(r.table,m==='learned+links'?'learned':m,{qk,model:models[m]??null});const {links}=m==='learned+links'?rowLinksLearnedN1(roles,r.cells,linkModel,lex):rowLinksN1(roles,r.cells,lex);
  const a=agg[m];const ps=new Set(links.map(lk)),rs=new Set(r.ref.links.map(lk)),pp=new Set(links.map(pk)),rp=new Set(r.ref.links.map(pk));
  a.pred+=ps.size;a.ref+=rs.size;a.tp+=[...ps].filter(x=>rs.has(x)).length;a.pp+=pp.size;a.pr+=rp.size;a.ptp+=[...pp].filter(x=>rp.has(x)).length;
  roles.forEach((x,j)=>{a.cols++;if(x===r.ref.columnTypes[j])a.colsRight++;});}}
const f=(a,b)=>b?+(a/b).toFixed(3):null;
const summary=Object.fromEntries(Object.entries(agg).map(([m,a])=>{const p=f(a.tp,a.pred),r=f(a.tp,a.ref);return [m,{precision:p,recall:r,f1:p&&r?+(2*p*r/(p+r)).toFixed(3):0,pairPrecision:f(a.ptp,a.pp),pairRecall:f(a.ptp,a.pr),inventedPairs:f(a.pp-a.ptp,a.pp),columnTypeAccuracy:f(a.colsRight,a.cols),predicted:a.pred,reference:a.ref}];}));
fs.writeFileSync(OUT,JSON.stringify({schema:'pee.i3.t-dev.v1',label:LABEL,status:'development: spent N1 rows (dev 40 + H1/H2 80), leave-one-document-out',documents:docsList.length,rows:rows.length,summary},null,1)+'\n');
console.log(JSON.stringify(summary,null,0));
if(process.argv.includes('--train-final')){const F=new URL('../resources/knowledge-translation/relation-role-model.v1.json',import.meta.url).pathname;const G=new URL('../resources/knowledge-translation/relation-link-model.v1.json',import.meta.url).pathname;
 for(const x of [F,G])if(fs.existsSync(x))throw Error(x+' exists');
 const src='spent N1 rows: development 40 (one blind annotator) + H1/H2 80 (two blind annotators, adjudicated); private-eval/n1';
 const m=trainRoleModelN1(examplesOf(rows),null,src);const lm=trainLinkModelN1(rows.map(r=>({types:r.ref.columnTypes,links:r.ref.links,filled:r.cells.map(c=>!!c.trim())})),src);
 fs.writeFileSync(F,JSON.stringify(m)+'\n');fs.writeFileSync(G,JSON.stringify(lm)+'\n');console.log('models written',m.classes.length,'classes',m.vocab.length,'features',Object.keys(lm.pairs).length,'type pairs');}
