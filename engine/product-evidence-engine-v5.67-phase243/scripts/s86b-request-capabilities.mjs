#!/usr/bin/env node
/** S86b: score the sealed request probes (evaluation/s86b/request-probes.json) on one build, or classify two runs into the
 * four capability sets (only old / only new / both / neither).
 *   node scripts/s86b-request-capabilities.mjs --build DIR --out FILE
 *   node scripts/s86b-request-capabilities.mjs --sets OLD NEW --out FILE
 * Probe texts are invented requests (no user data); outputs hold no retained declaration values. */
import {readFileSync,writeFileSync,existsSync,copyFileSync,mkdtempSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const PROBES=JSON.parse(readFileSync('evaluation/s86b/request-probes.json','utf8')).probes;
if(process.argv.includes('--sets')){
 const i=process.argv.indexOf('--sets');const A=JSON.parse(readFileSync(process.argv[i+1],'utf8')),B=JSON.parse(readFileSync(process.argv[i+2],'utf8'));
 const sets={only_old:[],only_new:[],both:[],neither:[]};const byGroup={};
 for(const p of PROBES){const a=A.results[p.id].ok,b=B.results[p.id].ok;const k=a&&b?'both':a?'only_old':b?'only_new':'neither';
  sets[k].push({id:p.id,group:p.group,text:p.text,old:A.results[p.id].verdict,new:B.results[p.id].verdict});const g=p.group.split(':')[0];(byGroup[g]??={both:0,only_old:0,only_new:0,neither:0})[k]++;}
 const out={schema:'pee.s86b.request-capability-sets.v1',old:A.build,new:B.build,counts:Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,v.length])),byGroup,sets};
 if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify({counts:out.counts,byGroup},null,1));process.exit(0);}
const BUILD=arg('build');const D=join(BUILD,'dist/src/');
const {extractConstraints253}=await import(D+'phase253_request_constraints.js');
const {KnowledgeStore246}=await import(D+'phase246_knowledge_store.js');const {adviseFromRequest253}=await import(D+'phase253_request_advice.js');
const {CATEGORY_REGISTRY250}=await import(D+'phase248_category_registry.js');const QK=await import(D+'quantity_knowledge.js');
const live=join(homedir(),'.local/share/product-evidence-engine/knowledge/pee246.sqlite');
const dir=mkdtempSync(join(homedir(),'.cache-s86b-'));const copy=join(dir,'store.sqlite');copyFileSync(live,copy);
const store=new KnowledgeStore246(copy);const qk=QK.loadQuantityKnowledge();
const results={};
for(const p of PROBES){const ex=extractConstraints253(p.text);const a=adviseFromRequest253(p.text,store,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-19'});
 const cons=[...ex.constraints,...(a.constraints??[])];
 const seen=JSON.stringify({c:cons,u:[...ex.unmapped,...(a.unmappedConstraints??[])],q:a.quantityRequirements??null,qs:a.questions??null,n:a.needs??null,o:a.unassessedObjectives??null}).toLowerCase();
 const nums=p.text.match(/\d+(?:[.,]\d+)*/g)??[];
 const visible=nums.length?nums.some(n=>seen.includes(n)):/noise|sound|acoustic|quiet/.test(seen);
 const e=p.expect;let ok=true;const why=[];
 if(e.c){const hit=cons.find(c=>c.criterion===e.c&&Math.abs(c.value-e.v)<1e-9);
  if(!hit){ok=false;why.push(visible?'constraint_missing_but_visible':'lost');}
  else{if(hit.bound!==e.b){ok=false;why.push('wrong_bound');}
   if(e.s&&((e.s==='stated')!==(hit.status==='stated_in_request'))){ok=false;why.push('wrong_status:'+hit.status);}}
  const wrong=cons.filter(c=>c.criterion!==e.c&&c.criterion!=='budget_max');if(wrong.length){ok=false;why.push('extra:'+wrong.map(c=>c.criterion+'='+c.value).join(','));}}
 if(e.visible&&!visible){ok=false;why.push('not_visible');}
 if(e.none){const bad=cons.filter(c=>e.none==='any'?c.criterion!=='budget_max':c.criterion===e.none);if(bad.length){ok=false;why.push('false_constraint:'+bad.map(c=>c.criterion+'='+c.value).join(','));}}
 results[p.id]={ok,verdict:ok?'correct':why.join(';'),constraints:cons.map(c=>`${c.criterion}=${c.value} ${c.unit} ${c.bound} ${c.status}`),visible};}
const out={schema:'pee.s86b.request-capabilities.v1',build:BUILD,probes:PROBES.length,correct:Object.values(results).filter(r=>r.ok).length,results};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify({build:BUILD,correct:out.correct,of:PROBES.length}));
