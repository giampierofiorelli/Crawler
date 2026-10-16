#!/usr/bin/env node
/** Reality check (2026-10-16): the frozen consumer requests (evaluation/phase266/requests.json) through the operational
 * request-to-advice path, adviseFromRequest253, on a COPY of the verified knowledge snapshot (the live store is never
 * opened). Full outputs (declared values, URLs) go to privateEvaluationDir249()/phase266; the public file keeps names,
 * statuses, PEE-authored questions and counts only (S23).
 * Usage: node scripts/phase266-reality-baseline.mjs --label baseline|after-fix1|...
 */
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,rmSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {privateEvaluationDir249} from '../dist/src/phase249_retention_policy.js';
import {CATEGORY_REGISTRY250} from '../dist/src/phase248_category_registry.js';
import {adviseFromRequest253} from '../dist/src/phase253_request_advice.js';
import {runJourney248} from '../dist/src/phase248_advisory_journey.js';

const label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:'baseline';
if(!/^[a-z0-9-]{3,40}$/.test(label))throw Error('bad --label');
const pub=`evaluation/phase266/${label}.json`;if(existsSync(pub))throw Error(`${pub} exists: a run is committed unchanged, never overwritten`);
const R=JSON.parse(readFileSync('evaluation/phase266/requests.json','utf8'));
const dir=join(homedir(),'.local','share','product-evidence-engine','reality');mkdirSync(dir,{recursive:true});
const db=join(dir,`copy-${label}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});
copyFileSync('/home/user/pee-knowledge/snapshot/pee246.sqlite',db);
const store=new KnowledgeStore246(db);const before=JSON.stringify(store.stats246());
const full=[],pubRows=[];
for(const r of R.requests){
 const j=runJourney248(r.text,store,CATEGORY_REGISTRY250);
 const a=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250);
 full.push({id:r.id,journey:j,advice:a});
 pubRows.push({id:r.id,kind:r.kind,response:a.response,ordered:a.ordered,rankingAuthorized:a.rankingAuthorized,
  target:a.target,category:a.category,categoryBasis:j.stages.category.basis,journeyDecision:j.decision,
  needs:a.needs,unresolvedNeeds:a.unresolved,
  constraints:a.constraints.map(c=>({criterion:c.criterion,value:c.value,unit:c.unit,bound:c.bound,status:c.status,span:c.span})),
  unmappedConstraints:a.unmappedConstraints,
  shortlist:a.shortlist.map(s=>s.name).sort(),excluded:a.excluded.map(s=>s.name).sort(),unknown:a.unknown.map(s=>s.name).sort(),
  conflicts:a.conflicts.length,questions:a.questions,
  statementKinds:a.statements.map(s=>s.replace(/\d+(?:\.\d+)?/g,'#').slice(0,160)),limitations:a.limitations.length});
}
const after=JSON.stringify(store.stats246());store.close();
const p=join(privateEvaluationDir249(),'phase266');mkdirSync(p,{recursive:true,mode:0o700});
writeFileSync(join(p,`${label}-full.json`),JSON.stringify({label,at:new Date().toISOString(),full},null,1)+'\n',{mode:0o600});
writeFileSync(pub,JSON.stringify({schema:'pee266.reality-check-run.v1',label,firstRun:label==='baseline',storeCopyUnchanged:before===after,
 note:'public form: names, statuses, PEE-authored questions; declared values and URLs are in the private full run',results:pubRows},null,1)+'\n');
console.log(JSON.stringify(pubRows.map(x=>({id:x.id,response:x.response,category:x.category,basis:x.categoryBasis,constraints:x.constraints.map(c=>`${c.criterion}${c.bound==='max'?'≤':'≥'}${c.value}${c.unit}:${c.status}`),
 shortlist:x.shortlist.length,excluded:x.excluded.length,unknown:x.unknown.length,q:x.questions.length})),null,1));
