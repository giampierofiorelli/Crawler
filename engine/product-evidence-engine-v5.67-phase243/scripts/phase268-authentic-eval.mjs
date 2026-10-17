#!/usr/bin/env node
/** Phase268 controlled evaluation on AUTHENTIC evidence: the frozen request (evaluation/phase268/frozen-request.json)
 * through adviseFromRequest253 on a COPY of the live knowledge store, (a) without a ranking context, and (b) with a
 * catalog compiled from the stored test measurements by validateTestMeasurements268 + compileCatalog268 and signed
 * with an EPHEMERAL evaluation key (no production key exists; who may sign is an owner decision). Policy alternatives
 * are run on the same rows. Full outputs (values, statements) go to the private evaluation directory; the public file
 * keeps product names, ranks, counts and reasons only (S23, principle 9). A run is never overwritten.
 * Usage: node scripts/phase268-authentic-eval.mjs --label firstrun
 */
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,rmSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {KnowledgeStore246,defaultKnowledgeDir246} from '../dist/src/phase246_knowledge_store.js';
import {privateEvaluationDir249} from '../dist/src/phase249_retention_policy.js';
import {CATEGORY_REGISTRY250} from '../dist/src/phase248_category_registry.js';
import {adviseFromRequest253} from '../dist/src/phase253_request_advice.js';
import {canonicalJson180} from '../dist/src/phase180_reviewed_first_answer.js';
import {validateTestMeasurements268,compileCatalog268,VALIDATION_POLICY268_R1 as VALIDATION_POLICY268,SCORING_POLICY268_R1 as SCORING_POLICY268} from '../dist/src/phase268_evidence_validation.js';

const label=process.argv.includes('--label')?process.argv[process.argv.indexOf('--label')+1]:'firstrun';
if(!/^[a-z0-9-]{3,40}$/.test(label))throw Error('bad --label');
const pub=`evaluation/phase268/authentic-advisory-${label}.json`;if(existsSync(pub))throw Error(`${pub} exists: a run is committed unchanged, never overwritten`);
const F=JSON.parse(readFileSync('evaluation/phase268/frozen-request.json','utf8'));
const frozenSha=createHash('sha256').update(readFileSync('evaluation/phase268/frozen-request.json')).digest('hex');
const dir=join(homedir(),'.local','share','product-evidence-engine','p268');mkdirSync(dir,{recursive:true});
const db=join(dir,`eval-${label}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});
copyFileSync(join(defaultKnowledgeDir246(),'pee246.sqlite'),db);
const store=new KnowledgeStore246(db);const before=JSON.stringify(store.stats246());
const asOf=new Date().toISOString().replace(/\.\d+Z$/,'Z');const expires=new Date(Date.now()+7*86400000).toISOString().replace(/\.\d+Z$/,'Z');
const product=id=>{const r=store.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id);return r?{name:r.name,declaredModel:r.declared_model}:null;};
const rows=store.testMeasurements265();
const discovered=store.db.prepare("SELECT product_id FROM products WHERE category_hypotheses_json LIKE '%\"air_fryers\"%'").all().map(r=>r.product_id);
const keys=generateKeyPairSync('ed25519');const keyId='pee268_controlled_evaluation_only';
const authority={publicKeys:{[keyId]:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf,market:'uk'};
const signed=c=>({catalog:c,keyId,signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')});
const variants={
 proposed_default:VALIDATION_POLICY268,
 strict_value_sentence_only:{...VALIDATION_POLICY268,protocols:VALIDATION_POLICY268.protocols.map(p=>({...p,load:'stated',acceptBlockContext:false}))},
 permissive_publisher_protocol:{...VALIDATION_POLICY268,protocols:VALIDATION_POLICY268.protocols.map(p=>({...p,load:'stated_or_publisher_protocol'}))},
 model_code_required:{...VALIDATION_POLICY268,identity:{requireDeclaredModelCode:true}},
};
const unranked=adviseFromRequest253(F.request,store,CATEGORY_REGISTRY250);
const full={label,at:asOf,frozenSha,unranked,variants:{}};const pubVariants={};
const nameOf=id=>product(id)?.name??id;
for(const [k,pol] of Object.entries(variants)){
 const v=validateTestMeasurements268(rows,product,pol);
 const cat=compileCatalog268(v,SCORING_POLICY268,{categoryId:'air_fryers',market:'uk',discoveredVariantIds:discovered,reviewedAt:asOf,expiresAt:expires,validationPolicy:pol});
 const a=adviseFromRequest253(F.request,store,CATEGORY_REGISTRY250,{ranking:{catalog:signed(cat),authority}});
 full.variants[k]={validation:v,catalog:cat,advice:a};
 const reasons={};for(const r of v.rejected)for(const x of r.reasons)reasons[x]=(reasons[x]??0)+1;
 pubVariants[k]={validated:v.validated.length,validatedProducts:v.validated.map(x=>nameOf(x.productId)).sort(),rejected:v.rejected.length,rejectionReasons:reasons,
  response:a.response,ordered:a.ordered,rankingAuthorized:a.rankingAuthorized,
  ranked:(a.ranked??[]).map(r=>({rank:r.rank,name:r.name,citations:r.sourceUrls.length})),held:(a.held??[]).length,
  needs:a.needs,unassessedObjectives:a.unassessedObjectives,statementKinds:a.statements.map(s=>s.replace(/\d+(?:\.\d+)?/g,'#').slice(0,200)),
  limitations:a.limitations.map(s=>s.replace(/\d+(?:\.\d+)?/g,'#').slice(0,200))};
}
const after=JSON.stringify(store.stats246());store.close();
const p=join(privateEvaluationDir249(),'phase268');mkdirSync(p,{recursive:true,mode:0o700});
writeFileSync(join(p,`authentic-advisory-${label}-full.json`),JSON.stringify(full,null,1)+'\n',{mode:0o600});
writeFileSync(pub,JSON.stringify({schema:'pee268.authentic-advisory-run.v1',label,firstRun:label==='firstrun',at:asOf,frozenRequestSha256:frozenSha,request:F.request,
 storeCopyUnchanged:before===after,storeStats:JSON.parse(before),testMeasurementRows:rows.length,signing:'ephemeral evaluation key generated in this run; not a production authority',
 unranked:{response:unranked.response,ordered:unranked.ordered,needs:unranked.needs,unassessedObjectives:unranked.unassessedObjectives},
 variants:pubVariants},null,1)+'\n');
console.log(JSON.stringify(pubVariants,null,1));
