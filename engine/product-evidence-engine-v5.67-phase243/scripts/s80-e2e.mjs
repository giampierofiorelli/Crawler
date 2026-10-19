#!/usr/bin/env node
/** S80 C3/C4 end-to-end run (protocol: evaluation/s80/protocol.json). For each request of a set, on a COPY of the private
 * knowledge snapshot and with the build named by --build (a git worktree; the first run uses the frozen commit):
 *   1. advice before reading            adviseFromRequest253 (goals, evidence needed, decision on what PEE already holds)
 *   2. reading                          the build's own phase246-live-wave 'observations' (Phase245 + test leads + qualitative)
 *                                       on the request's fetched pages, then its phase246-knowledge 'ingest-observations'
 *                                       into the copy (class retention policy)
 *   3. advice after reading             same request, same copy
 *   4. validation and catalog           validateTestMeasurements268 + compileCatalog268 (current policies) over the category's
 *                                       rows, signed with an EPHEMERAL evaluation key; advice with that ranking context
 *   5. what PEE read per page           products, declarations, test measurements (with validation), qualitative codes
 * Only existing operational functions are called; nothing here changes an algorithm. The live store is never opened.
 * Refuses to run without the sealed reference hash (evaluation/s80/reference-seal.json) and never overwrites a run.
 * Full rows (values, names, URLs) -> pee-knowledge/private-eval/s80/; public file -> counts, ids, statuses only (S23).
 * Usage: node scripts/s80-e2e.mjs --set D|H --label LABEL --build /path/to/engine (a worktree's engine directory) */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,rmSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';
import {createHash,generateKeyPairSync,sign} from 'node:crypto';import {execFileSync} from 'node:child_process';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const SET=arg('set'),LABEL=arg('label'),BUILD=resolve(arg('build')??'.');
if(!/^[DH]$/.test(SET??'')||!/^[a-z0-9-]{3,40}$/.test(LABEL??''))throw Error('usage: --set D|H --label LABEL --build ENGINE_DIR');
const ENGINE=resolve(new URL('..',import.meta.url).pathname);
const PUB=join(ENGINE,'evaluation/s80',`run-${SET}-${LABEL}.json`);if(existsSync(PUB))throw Error(PUB+' exists: a run is committed unchanged, never overwritten');
const PRIV=join(process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge','private-eval/s80');mkdirSync(PRIV,{recursive:true,mode:0o700});
const WAVE=join(homedir(),'.local/share/product-evidence-engine/private-eval/s80');
const sha=b=>createHash('sha256').update(b).digest('hex');
const protocol=JSON.parse(readFileSync(join(ENGINE,'evaluation/s80/protocol.json'),'utf8'));
const seal=JSON.parse(readFileSync(join(ENGINE,'evaluation/s80/reference-seal.json'),'utf8'));
const refFile=join(PRIV,`reference-${SET}.json`);
if(!existsSync(refFile)||sha(readFileSync(refFile))!==seal[SET])throw Error('reference for set '+SET+' missing or not the sealed one');
const git=(d,...a)=>{try{return execFileSync('git',['-C',d,...a],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{return null;}};
const build={dir:BUILD,commit:git(BUILD,'rev-parse','--short','HEAD'),dirty:!!git(BUILD,'status','--porcelain','--','src','resources')};
const D=p=>import(join(BUILD,'dist/src',p));
const {KnowledgeStore246}=await D('phase246_knowledge_store.js');const {CATEGORY_REGISTRY250}=await D('phase248_category_registry.js');
const {adviseFromRequest253}=await D('phase253_request_advice.js');const {canonicalJson180}=await D('phase180_reviewed_first_answer.js');
const V=await D('phase268_evidence_validation.js');
const integrityMod=existsSync(join(BUILD,'dist/src/system_integrity80.js'))?await D('system_integrity80.js'):null;
const SNAP='/home/user/pee-knowledge/snapshot/pee246.sqlite';const snapshot={commit:git('/home/user/pee-knowledge','rev-parse','--short','HEAD'),sha256:sha(readFileSync(SNAP))};
// Reading: the build's own observation builder over the fetched pages (receipt-checked bytes), once per run.
const OBS=join(WAVE,`obs-${SET}-${LABEL}.json`);
execFileSync(process.execPath,['--no-warnings','scripts/phase246-live-wave.mjs','observations','--state',join(WAVE,'wave.json'),'--raw',join(WAVE,'raw'),'--out',OBS,'--run','s80_'+LABEL],{cwd:BUILD,stdio:['ignore','ignore','inherit']});
const allObs=JSON.parse(readFileSync(OBS,'utf8')).filter(o=>o.observation);
const keys=generateKeyPairSync('ed25519');const keyId='pee_s80_controlled_evaluation_only';
const asOf=new Date().toISOString().replace(/\.\d+Z$/,'Z');const expires=new Date(Date.now()+7*86400000).toISOString().replace(/\.\d+Z$/,'Z');
const authority={publicKeys:{[keyId]:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf,market:'uk'};
const signed=c=>({catalog:c,keyId,signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')});
const slim=a=>({response:a.response,ordered:a.ordered,rankingAuthorized:a.rankingAuthorized,category:a.category,target:a.target,needs:a.needs,unresolved:a.unresolved,
 constraints:a.constraints,unmappedConstraints:a.unmappedConstraints,goalAssessment:a.goalAssessment??null,unassessedObjectives:a.unassessedObjectives,
 shortlist:a.shortlist.map(s=>s.name),excluded:a.excluded.map(s=>s.name),unknown:a.unknown.map(s=>s.name),ranked:(a.ranked??[]).map(r=>({rank:r.rank,name:r.name,sourceUrls:r.sourceUrls})),
 held:(a.held??[]).map(h=>({name:h.name,reason:h.reason})),partialComparison:a.partialComparison??a.goalAssessment?.partialComparison??null,
 questions:a.questions,statements:a.statements,limitations:a.limitations,authorisationTrace:a.authorisationTrace??[]});
const full={schema:'pee.s80.e2e-run.v1',set:SET,label:LABEL,at:asOf,build,snapshot,referenceSha256:seal[SET],requests:{}};const pubReq={};
for(const r of protocol.requests.filter(x=>x.set===SET)){
 const urls=new Set(protocol.sources.filter(s=>s.request===r.id).map(s=>s.url));
 const dir=join(homedir(),'.local/share/product-evidence-engine/s80');mkdirSync(dir,{recursive:true});
 const db=join(dir,`copy-${SET}-${LABEL}-${r.id}.sqlite`);for(const x of ['','-wal','-shm'])rmSync(db+x,{force:true});copyFileSync(SNAP,db);
 const integrity=integrityMod?integrityMod.systemIntegrity80(db):null;
 let store=new KnowledgeStore246(db);
 const before=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250);store.close();
 const sub=join(dir,`obs-${SET}-${LABEL}-${r.id}.json`);const mine=allObs.filter(o=>urls.has(o.observation.url));writeFileSync(sub,JSON.stringify(mine));
 const ingest=JSON.parse(execFileSync(process.execPath,['--no-warnings','scripts/phase246-knowledge.mjs','ingest-observations','--db',db,'--file',sub],{cwd:BUILD,encoding:'utf8'}));
 store=new KnowledgeStore246(db);
 const after=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250);
 const product=id=>{const p=store.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id);return p?{name:p.name,declaredModel:p.declared_model}:null;};
 const rows=store.testMeasurements265();
 const v=V.validateTestMeasurements268(rows,product,V.VALIDATION_POLICY268);
 const discovered=store.db.prepare('SELECT product_id FROM products WHERE category_hypotheses_json LIKE ?').all(`%"${r.category}"%`).map(x=>x.product_id);
 let catalog=null,ranked=null,catalogError=null;
 try{catalog=V.compileCatalog268(v,V.SCORING_POLICY268,{categoryId:r.category,market:'uk',discoveredVariantIds:discovered,reviewedAt:asOf,expiresAt:expires,validationPolicy:V.VALIDATION_POLICY268});
  ranked=adviseFromRequest253(r.text,store,CATEGORY_REGISTRY250,{ranking:{catalog:signed(catalog),authority}});}catch(e){catalogError=String(e?.message??e).slice(0,200);}
 // What PEE read from each of the request's pages.
 const pages=[];
 for(const s of protocol.sources.filter(x=>x.request===r.id)){
  const rev=store.db.prepare('SELECT revision_id,retention,declarations_seen,declarations_retained FROM revisions WHERE url=? ORDER BY fetched_at DESC LIMIT 1').get(s.url);
  const decl=rev?store.db.prepare('SELECT d.product_id,d.property,d.raw_value,d.value_json,d.evidence_role,d.retention,d.state,p.name pname,p.declared_model FROM declarations d LEFT JOIN products p ON p.product_id=d.product_id WHERE d.revision_id=?').all(rev.revision_id):[];
  const tm=rev?store.db.prepare('SELECT t.measurement_id,t.product_id,t.subject_association,t.value,t.unit,t.dimension,t.condition,t.method_cue,t.evidence_role,t.reported_by,t.independence,t.state,p.name pname FROM test_measurements265 t LEFT JOIN products p ON p.product_id=t.product_id WHERE t.revision_id=?').all(rev.revision_id):[];
  const qual=rev?store.db.prepare('SELECT outcome,direction,dish,identity,product_id FROM qualitative_observations270 WHERE revision_id=?').all(rev.revision_id):[];
  const valid=new Set(v.validated.map(x=>x.measurementId??x.id));
  const o=mine.find(x=>x.observation.url===s.url);
  pages.push({tag:s.tag,url:s.url,revision:rev??null,mainProduct:o?.observation.extraction?.mainProduct??null,testLeadCandidates:o?.observation.testLeads?.probe?.candidates?.length??0,
   declarations:decl,testMeasurements:tm.map(t=>({...t,validated:valid.has(t.measurement_id),rejection:v.rejected.find(x=>(x.measurementId??x.id)===t.measurement_id)?.reasons??null})),qualitative:qual});
 }
 store.close();
 full.requests[r.id]={request:r,integrity,ingest:ingest.results,before:slim(before),after:slim(after),validation:{validated:v.validated.length,rejected:v.rejected.length},catalogError,
  catalogDimensions:catalog?.dimensions?.map(d=>d.key)??null,withCatalog:ranked?slim(ranked):null,pages};
 const n=a=>a?{response:a.response,ordered:a.ordered,rankingAuthorized:a.rankingAuthorized,category:a.category,needs:a.needs,unresolved:a.unresolved.length,
  unassessedObjectives:a.unassessedObjectives.length,shortlist:a.shortlist.length,questions:a.questions.length,limitations:a.limitations.length}:null;
 pubReq[r.id]={category:r.category,integrityFindings:integrity?.findings??null,before:n(before),after:n(after),withCatalog:n(ranked),catalogError:catalogError?'error':null,
  pages:pages.map(p=>({tag:p.tag,fetchedRevision:!!p.revision,retention:p.revision?.retention??null,declarations:p.declarations.length,testMeasurements:p.testMeasurements.length,
   validated:p.testMeasurements.filter(t=>t.validated).length,qualitative:p.qualitative.length,testLeadCandidates:p.testLeadCandidates}))};
}
writeFileSync(join(PRIV,`run-${SET}-${LABEL}.json`),JSON.stringify(full,null,1)+'\n',{mode:0o600});
writeFileSync(PUB,JSON.stringify({schema:'pee.s80.e2e-run-public.v1',set:SET,label:LABEL,at:asOf,build:{commit:build.commit,dirty:build.dirty},snapshot,referenceSha256:seal[SET],
 firstRunOfThisBuild:true,requests:pubReq},null,1)+'\n');
console.log(JSON.stringify(pubReq,null,1));
