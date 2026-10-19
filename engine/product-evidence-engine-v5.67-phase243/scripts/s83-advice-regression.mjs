#!/usr/bin/env node
/** S83 request-to-advice regression: every request text held in the evaluation sets (Phase248 journeys, Phase250/251 real
 * requests, Phase266, Phase271 cross-evaluation, S80 protocol: all spent, used here for regression only) is answered by
 * one build's adviseFromRequest253 on a read-only copy of the live store. Full answers are private (they can hold
 * retained values); `--diff OLD NEW` writes public counts of what changed, by field.
 * Usage:
 *   node scripts/s83-advice-regression.mjs --build DIR --out PRIVATE_FILE
 *   node scripts/s83-advice-regression.mjs --diff OLD_PRIVATE NEW_PRIVATE --out PUBLIC_FILE */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdtempSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const SETS=['phase248/journey-dev.json','phase248/journey-heldout.json','phase248/journey-heldout2.json','phase250/journey-real-requests-set3.json',
 'phase251/journey-real-requests-set4.json','phase266/requests.json','phase271/cross-eval-set.json','s80/protocol.json'];
if(process.argv.includes('--diff')){
 const i=process.argv.indexOf('--diff');const A=JSON.parse(readFileSync(process.argv[i+1],'utf8')),B=JSON.parse(readFileSync(process.argv[i+2],'utf8'));
 const T={};const inc=(k,n=1)=>T[k]=(T[k]??0)+n;const ex=[];
 const fields=['category','response','decision','needs','unresolved','unassessedObjectives','statements','limitations','researchPlan','goalOutcomes','authorisationTrace','uninterpreted'];
 for(const [id,a] of Object.entries(A.answers)){const b=B.answers[id];inc('requests');if(!b){inc('missing_in_new');continue;}
  let any=false;for(const f of fields){if(JSON.stringify(a[f]??null)!==JSON.stringify(b[f]??null)){inc('changed:'+f);any=true;}}
  if(any){inc('changed_requests');ex.push({id,changed:fields.filter(f=>JSON.stringify(a[f]??null)!==JSON.stringify(b[f]??null))});}
  if(a.decision!==b.decision)inc(`decision:${a.decision}->${b.decision}`);}
 const out={schema:'pee.s83.advice-regression-diff.v1',old:A.build,new:B.build,totals:T,changed:ex};
 if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(T,null,1));process.exit(0);}
const BUILD=arg('build')??process.cwd();const D=join(BUILD,'dist/src/');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const QK=await import(D+'quantity_knowledge.js');
const live=join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite');
const dir=mkdtempSync(join(homedir(),'.cache-s83-'));const copy=join(dir,'store.sqlite');copyFileSync(live,copy);
const store=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const texts=[];for(const f of SETS){const j=JSON.parse(readFileSync(join('evaluation',f),'utf8'));
 const walk=(o,k)=>{if(typeof o==='string'){if((k==='text'||k==='request')&&o.length>15&&/\s/.test(o))texts.push(o);return;}if(Array.isArray(o))o.forEach(x=>walk(x,k));else if(o&&typeof o==='object')for(const [kk,v] of Object.entries(o))walk(v,kk);};walk(j,'');}
const uniq=[...new Set(texts)];const answers={};
for(const [n,t] of uniq.entries()){const a=adviseFromRequest253(t,store,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-19'});
 answers['r'+String(n).padStart(3,'0')]={text:t,category:a.category,response:a.response,decision:a.goalAssessment?.decision??null,needs:a.needs,unresolved:a.unresolved,
  unassessedObjectives:a.unassessedObjectives,statements:a.statements,limitations:a.limitations,researchPlan:a.researchPlan,goalOutcomes:a.goalAssessment?.outcomes??null,
  authorisationTrace:a.authorisationTrace??null,uninterpreted:a.uninterpreted??null};}
const out={schema:'pee.s83.advice-regression.v1',build:BUILD,store:'copy of the live store (read only use)',requests:uniq.length,answers};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify({requests:uniq.length}));
