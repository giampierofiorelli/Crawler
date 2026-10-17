#!/usr/bin/env node
/** Phase269 teaching evaluation: the frozen requests of evaluation/phase269/teaching-eval-set.json through the operational
 * request path (runJourney248 + adviseFromRequest253) on a COPY of the live store, with the Phase268 controlled catalog
 * (proposed default policy, evaluation-only signer) supplied, so that use of the empty-run energy proxy is observable.
 * Scores the seven behaviours defined in the set. A run is never overwritten. Public output: ids, decisions, concept and
 * measure ids, scores (no product values). Usage: node scripts/phase269-teaching-eval.mjs --label baseline
 */
import {readFileSync,writeFileSync,copyFileSync,rmSync,existsSync,mkdirSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {KnowledgeStore246,defaultKnowledgeDir246} from '../dist/src/phase246_knowledge_store.js';
import {CATEGORY_REGISTRY250} from '../dist/src/phase248_category_registry.js';
import {adviseFromRequest253} from '../dist/src/phase253_request_advice.js';
import {runJourney248} from '../dist/src/phase248_advisory_journey.js';
import {canonicalJson180} from '../dist/src/phase180_reviewed_first_answer.js';
import * as P268 from '../dist/src/phase268_evidence_validation.js';
const {validateTestMeasurements268,compileCatalog268}=P268;
// The baseline ran with the Phase268 r1 policies (then exported under these names). '--catalog r1' (default) repeats exactly
// that context; '--catalog r2' uses the Phase269 proposed revisions.
const catalogRev=process.argv.includes('--catalog')?process.argv[process.argv.indexOf('--catalog')+1]:'r1';
if(!['r1','r2'].includes(catalogRev))throw Error('bad --catalog');
const VALIDATION_POLICY268=catalogRev==='r1'?P268.VALIDATION_POLICY268_R1:P268.VALIDATION_POLICY268;
const SCORING_POLICY268=catalogRev==='r1'?P268.SCORING_POLICY268_R1:P268.SCORING_POLICY268;

const label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:'baseline';
if(!/^[a-z0-9-]{3,40}$/.test(label))throw Error('bad --label');
// '--set coffee' runs evaluation/phase269/coffee-eval-set.json (cross-category transfer); default: the air-fryer set.
const setName=process.argv.includes('--set')?process.argv[process.argv.indexOf('--set')+1]:'teaching';if(!/^[a-z]+$/.test(setName))throw Error('bad --set');
const out=`evaluation/phase269/${setName}-${label}.json`;if(existsSync(out))throw Error(`${out} exists: runs are never overwritten`);
const setFile=`evaluation/phase269/${setName==='teaching'?'teaching':setName}-eval-set.json`;const SET=JSON.parse(readFileSync(setFile,'utf8'));
const setSha=createHash('sha256').update(readFileSync(setFile)).digest('hex');
const dir=join(homedir(),'.local','share','product-evidence-engine','p269');mkdirSync(dir,{recursive:true});
const db=join(dir,`eval-${label}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});
copyFileSync(join(defaultKnowledgeDir246(),'pee246.sqlite'),db);
const store=new KnowledgeStore246(db);const before=JSON.stringify(store.stats246());
// The Phase268 controlled catalog, rebuilt exactly as phase268-authentic-eval.mjs builds it (proposed default policy).
const asOf=new Date().toISOString().replace(/\.\d+Z$/,'Z');const expires=new Date(Date.now()+7*86400000).toISOString().replace(/\.\d+Z$/,'Z');
const product=id=>{const r=store.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id);return r?{name:r.name,declaredModel:r.declared_model}:null;};
const discovered=store.db.prepare("SELECT product_id FROM products WHERE category_hypotheses_json LIKE '%\"air_fryers\"%'").all().map(r=>r.product_id);
const v=validateTestMeasurements268(store.testMeasurements265(),product,VALIDATION_POLICY268);
const compiled=compileCatalog268(v,SCORING_POLICY268,{categoryId:'air_fryers',market:'uk',discoveredVariantIds:discovered,reviewedAt:asOf,expiresAt:expires,validationPolicy:VALIDATION_POLICY268});
const keys=generateKeyPairSync('ed25519');const keyId='pee269_controlled_evaluation_only';
const ranking={catalog:{catalog:compiled,keyId,signatureBase64:sign(null,Buffer.from(canonicalJson180(compiled)),keys.privateKey).toString('base64')},
 authority:{publicKeys:{[keyId]:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf,market:'uk'}};

/** What the answer exposes, in the set's vocabulary. Falls back to the baseline derivation when no goal assessment exists. */
function observed(a,j){
 const g=a.goalAssessment??null;
 if(g)return {decision:g.decision,needs:a.needs,unassessed:a.unassessedObjectives,
  measures:Object.fromEntries(g.outcomes.map(o=>[o.need,o.relevantMeasures])),proxies:Object.fromEntries(g.outcomes.map(o=>[o.need,o.rejectedProxies])),
  conditions:[...new Set(g.outcomes.flatMap(o=>o.requiredConditions))],incomparable:g.outcomes.some(o=>o.incomparable.length>0),
  assessedVia:Object.fromEntries(g.outcomes.filter(o=>o.coverage==='assessed').map(o=>[o.need,o.assessedBy??[]]))};
 const proxies={};for(const c of j.stages.requirements.cautions)if(c.kind==='not_sufficient_for')(proxies[c.conceptId]??=[]).push('attr:'+c.attribute);
 const decision=a.response==='ranked_recommendation'?'ranking':a.response==='clarification'&&a.questions.length?'clarify':'research';
 // A ranked answer in the baseline is assessed through the catalog dimensions it was ranked by.
 const assessedVia={};if(a.response==='ranked_recommendation')for(const n of a.needs)if(!a.unassessedObjectives.includes(n))assessedVia[n]=['energy_empty_run'];
 return {decision,needs:a.needs,unassessed:a.unassessedObjectives,measures:{},proxies,conditions:[],incomparable:false,assessedVia};
}
const share=(hit,total)=>total?hit/total:null;
function score(r,o){
 const s={};
 s['1_outcomes']=share(r.outcomes.filter(x=>o.needs.includes(x)).length,r.outcomes.length);
 const m=Object.entries(r.measures).flatMap(([n,ms])=>ms.map(x=>[n,x]));s['2_criteria']=share(m.filter(([n,x])=>(o.measures[n]??[]).includes(x)).length,m.length);
 const p=Object.entries(r.proxies).flatMap(([n,ps])=>ps.map(x=>[n,x]));s['3_proxies']=share(p.filter(([n,x])=>(o.proxies[n]??[]).includes(x)).length,p.length);
 s['4_conditions']=share(r.conditions.filter(x=>o.conditions.includes(x)).length,r.conditions.length);
 s['5_incomparable']=r.incomparableExpected?(o.incomparable?1:0):null;
 // Every gold outcome lacks adequate authentic evidence today: each must be reported as unassessed; assessment through a
 // gold proxy is a hard failure.
 const proxyAssessed=Object.entries(o.assessedVia).filter(([n,via])=>via.some(x=>(r.proxies[n]??[]).includes(x))).map(([n])=>n);
 s['6_unassessed']=proxyAssessed.length?0:share(r.outcomes.filter(x=>o.unassessed.includes(x)).length,r.outcomes.length);
 s['6_proxyAssessedFailure']=proxyAssessed;
 s['7_decision']=o.decision===r.decision?1:0;
 return s;
}
const rows=[];
for(const part of ['development','untouched'])for(const r of SET[part]){
 const j=runJourney248(r.text,store,CATEGORY_REGISTRY250);const a=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250,{ranking});
 const o=observed(a,j);rows.push({id:r.id,part,goldDecision:r.decision,observed:{...o,response:a.response,ranked:(a.ranked??[]).length},score:score(r,o)});
}
const mean=(part,k)=>{const xs=rows.filter(x=>x.part===part).map(x=>x.score[k]).filter(x=>typeof x==='number');return xs.length?Math.round(1000*xs.reduce((a,b)=>a+b,0)/xs.length)/1000:null;};
const K=['1_outcomes','2_criteria','3_proxies','4_conditions','5_incomparable','6_unassessed','7_decision'];
const summary=Object.fromEntries(['development','untouched'].map(p=>[p,{...Object.fromEntries(K.map(k=>[k,mean(p,k)])),
 proxyAssessedFailures:rows.filter(x=>x.part===p&&x.score['6_proxyAssessedFailure'].length).map(x=>x.id)}]));
const after=JSON.stringify(store.stats246());store.close();
writeFileSync(out,JSON.stringify({schema:'pee269.teaching-run.v1',label,at:asOf,setSha256:setSha,storeCopyUnchanged:before===after,
 controlledCatalog:{revision:catalogRev,validated:v.validated.length,dimension:compiled.dimensions.map(d=>d.key)},summary,rows},null,1)+'\n');
console.log(JSON.stringify(summary,null,1));
