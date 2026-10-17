#!/usr/bin/env node
/** Phase246 knowledge store CLI (operator tool; no network access).
 *
 *  node scripts/phase246-knowledge.mjs <command> [--db FILE] [options]
 *   status                      counts, schema version, journal check, stale artifacts, suspended hosts
 *   seed --category C           add assistant-authored (unreviewed) hypotheses for C (air_fryers|coffee_machines|toasters)
 *   ingest-recovered --raw DIRS  ingest Phase245 manifest pages whose raw bytes are present AND hash-verified
 *   ingest-observations --file F ingest a JSON list of observations produced by a live run (see phase246-live-wave.mjs);
 *                               Phase265: their test-result leads are persisted as unreviewed test measurements
 *   test-measurements [--product ID]   stored test measurements (unreviewed, never evidence) and per-product conflicts
 *   add-method-refs --file F    add professional test-method pointers (paraphrase + observed revision)
 *   apply-lessons                adopted Phase250 category lessons (hypothesis items and concept aliases; idempotent)
  *   retire-item --item ID --reason R   retire a category item (journaled; never deleted)
 *   seed-relations --category C  add the initial graded relations (hypotheses + cited method references)
 *   category-graph --category C  relations, declared-attribute vocabulary, Phase116 audit, research priorities
 *   profile --category C [--commit REASON]   print (and optionally version) a category profile
 *   export --out FILE [--include-pending-rights]
 *   import --from FILE --db NEW  rebuild a store from an export into a new database file
 *   backup --out FILE            consistent SQLite copy (VACUUM INTO)
 *   backup-rotate [--dir D] [--keep N]  timestamped, verified backups (integrity + journal + manifest), newest N kept
 *   verify-backup --file F       integrity, journal chain and counts of a backup (read-only)
 *   restore --from F             restore a verified backup over --db (the replaced file is kept alongside)
 *   reconcile-gaps               close research gaps resolved by later observations or policy changes
 *   export-shards --out DIR --audience public|private   deterministic NDJSON shards + manifest; public = publication rules
 *   import-shards --from DIR --db NEW
 *   revisit-plan [--as-of ISO] [--days N] [--full]   which current revisions are worth fetching again, and why
 *   rights-worksheet             per-source rights decision worksheet (grants nothing)
 *   (any ingest) --rights FILE   operator-reviewed WebSourcePolicy per host; absent = nothing retained beyond metadata
 *   purge                        expire local pending-rights declarations past their expiry
 *
 * Default DB: $PEE_KNOWLEDGE_DIR/pee246.sqlite, else ~/.local/share/product-evidence-engine/knowledge/pee246.sqlite.
 * Storage policy: 'class' (default; Phase249 source-class policy for private factual observations), 'deny' (Phase246
 * default-deny) or a FILE (operator decision). None of these is a rights grant for publication.
 */
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve,dirname} from 'node:path';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,defaultKnowledgeDir246,verifyStoreFile249,restoreStore249} from '../dist/src/phase246_knowledge_store.js';
import {seedCategoryHypotheses246,CATEGORY_ALIASES246} from '../dist/src/phase246_category_seeds.js';
import {seedRelations247} from '../dist/src/phase247_relation_seeds.js';
import {CONCEPT_VOCABULARY248} from '../dist/src/phase248_concept_vocabulary.js';
import {ADOPTED_LESSONS250,applyLessons250} from '../dist/src/phase250_category_lessons.js';
import {relations247,attributeVocabulary247,compileTo116,researchPriorities247} from '../dist/src/phase247_category_relations.js';
import {extractSpecifications245,SPEC_EXTRACTOR_VERSION} from '../dist/src/phase245_spec_extraction.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../dist/src/phase265_test_measurements.js';

const [cmd,...rest]=process.argv.slice(2);
const flags={};for(let i=0;i<rest.length;i++){if(rest[i].startsWith('--')){const k=rest[i].slice(2);const v=rest[i+1]&&!rest[i+1].startsWith('--')?rest[++i]:true;flags[k]=v;}}
const root=resolve(new URL('..',import.meta.url).pathname);
const dbPath=resolve(flags.db??join(defaultKnowledgeDir246(),'pee246.sqlite'));
// Phase249: the operational default is the documented source-class policy for factual observations (private,
// capped per host, reservations honoured). '--storage-policy deny' restores the Phase246 default-deny policy;
// '--storage-policy FILE' loads an operator policy.
const {FACTUAL_CLASS_POLICY249}=await import('../dist/src/phase249_retention_policy.js');
const CLASS_DEFAULT={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const sp=flags['storage-policy']??process.env.PEE_STORAGE_POLICY??'class';
const storage=sp==='class'?CLASS_DEFAULT:sp==='deny'?DEFAULT_STORAGE_POLICY246:JSON.parse(readFileSync(sp,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
// Operator-reviewed rights policies (WebSourcePolicy per host). Absent by default: nothing is self-granted.
const rights=flags.rights?JSON.parse(readFileSync(resolve(flags.rights),'utf8')):{};
const policyFor=host=>rights[host]??undefined;
const out=x=>console.log(JSON.stringify(x,null,1));

// Operator-assigned source types for the recovered pages: a classification of the publisher's role,
// not a rights decision. No rights policy is attached: the Phase244 registry was test-only.
const SOURCE_TYPE_BY_HOST={'www.switchbacktravel.com':'editorial','www.prodirectsport.com':'retailer','www.brabantia.com':'manufacturer',
 'www.ikea.com':'retailer','www.lakeland.co.uk':'retailer','docs.arduino.cc':'manufacturer','psref.lenovo.com':'manufacturer',
 'en.wikipedia.org':'reference_encyclopedia','www.apple.com':'manufacturer','www.bosch-home.co.uk':'manufacturer','shop.pimoroni.com':'retailer',
 'www.rtings.com':'independent_original_test','www.scan.co.uk':'retailer','www.pololu.com':'manufacturer','www.wickes.co.uk':'retailer',
 'www.richersounds.com':'retailer','www.sparkfun.com':'manufacturer','www.johnlewis.com':'retailer'};

if(cmd==='import-shards'){
 if(!flags.from)throw Error('--from DIR required');
 const s=KnowledgeStore246.importShards246(resolve(flags.from),dbPath,storage);out({imported:dbPath,stats:s.stats246(),journal:s.verifyJournal()});s.close();process.exit(0);
}
if(cmd==='import'){
 if(!flags.from)throw Error('--from required');
 const s=KnowledgeStore246.import246(resolve(flags.from),dbPath,storage);out({imported:dbPath,stats:s.stats246(),journal:s.verifyJournal()});s.close();process.exit(0);
}
const store=new KnowledgeStore246(dbPath,storage);
try{
 switch(cmd){
  case 'backup-rotate':{const r=store.backupRotate249(resolve(flags.dir??join(dirname(dbPath),'backups')),Number(flags.keep??7));out(r);break;}
  case 'verify-backup':{out(verifyStoreFile249(resolve(flags.file)));break;}
  case 'restore':{store.close();out(restoreStore249(resolve(flags.from),dbPath));process.exit(0);}
  case 'reconcile-gaps':out({identity:store.reconcileIdentityGaps246(),retention:store.reconcileRetentionGaps249()});break;
  case 'status':out({db:dbPath,storagePolicy:storage.policyVersion,stats:store.stats246(),journal:store.verifyJournal(),stale:store.staleNodes246().slice(0,50),
   suspendedHosts:store.db.prepare('SELECT host,suspended_until,reason FROM host_access WHERE suspended_until IS NOT NULL').all()});break;
  case 'seed':{const ids=seedCategoryHypotheses246(store,flags.category);out({category:flags.category,items:ids.length});break;}
  case 'ingest-recovered':{
   const inv=JSON.parse(readFileSync(join(root,'evaluation/phase246/recovery-inventory.json'),'utf8'));
   const dirs=String(flags.raw??'').split(',').filter(Boolean);const res=[];
   for(const p of inv.pages){
    let bytes=null;for(const d of dirs){const f=join(d,p.tag+'.html');if(existsSync(f)){const b=readFileSync(f);if(sha(b)===p.recordedSha256){bytes=b;break;}}}
    if(!bytes||!p.url){res.push({tag:p.tag,ingested:false,reason:bytes?'no_url':'raw_bytes_not_verified'});continue;}
    const host=new URL(p.url).host;const x=testDocumentSubject268(extractSpecifications245(bytes.toString('utf8'),p.url),SOURCE_TYPE_BY_HOST[host]??'unknown');
    const r=store.ingestObservation246({source:{sourceId:'src_'+host.replace(/[^a-z0-9]+/gi,'_'),host,sourceType:SOURCE_TYPE_BY_HOST[host]??'unknown',
      sourceTypeBasis:'operator_asserted',policy:policyFor(host)},url:p.url,sha256:p.recordedSha256,bytes:p.bytes,httpStatus:200,fetchedAt:new Date(p.fetchedAt).toISOString(),
     runId:'phase245_recovered_'+p.set,extractorVersion:SPEC_EXTRACTOR_VERSION,extraction:x,
     categoryHypotheses:p.categoryHypothesis?[p.categoryHypothesis]:[],testLeads:testLeadsFromHtml265(bytes.toString('utf8'),p.url,p.recordedSha256,x)});
    res.push({tag:p.tag,ingested:true,newRevision:r.newRevision,retention:r.retention,products:r.productIds.length,variants:r.variantIds.length,
     declarationsSeen:r.declarationsSeen,declarationsRetained:r.declarationsRetained,testMeasurements:r.testMeasurements??null});
   }
   out({db:dbPath,results:res,stats:store.stats246()});break;}
  case 'ingest-observations':{
   const obs=JSON.parse(readFileSync(resolve(flags.file),'utf8'));const res=[];
   for(const o of obs){
    if(o.access)store.recordAccess246(o.access.host,o.access.outcome,o.access.at);
    if(!o.observation)continue;
    const x=o.observation;
    const r=store.ingestObservation246({...x,source:{...x.source,policy:policyFor(x.source.host)},extraction:x.extraction??null});
    res.push({url:x.url,newRevision:r.newRevision,retention:r.retention,products:r.productIds.length,declarationsSeen:r.declarationsSeen,declarationsRetained:r.declarationsRetained,
     testMeasurements:r.testMeasurements??null});
   }
   out({results:res,stats:store.stats246()});break;}
  case 'profile':{
   const c=flags.category;if(flags.commit)out(store.commitCategoryVersion246(c,String(flags.commit)));
   const p=store.categoryProfile246(c);
   if(CATEGORY_ALIASES246[c]){const comp=store.compileCategory246(c,CATEGORY_ALIASES246[c]);p.phase128OntologySnapshot=comp.ontologySnapshot;}
   out(p);break;}
  case 'export':{if(!flags.out)throw Error('--out required');const h=store.writeExport246(resolve(flags.out),{includePendingRights:!!flags['include-pending-rights']});
   out({export:resolve(flags.out),contentSha256:h,includesPendingRights:!!flags['include-pending-rights']});break;}
  case 'backup':{if(!flags.out)throw Error('--out required');store.backup246(resolve(flags.out));out({backup:resolve(flags.out)});break;}
  case 'add-method-refs':{
   // Professional-method pointers: short assistant paraphrases tied to an observed revision already in the store.
   const f=JSON.parse(readFileSync(resolve(flags.file),'utf8'));const res=[];
   for(const i of f.items){
    const rev=store.db.prepare('SELECT revision_id FROM revisions WHERE url=? AND sha256=?').get(i.source.url,i.source.sha256);
    if(!rev){res.push({statement:i.statement.slice(0,40),added:false,reason:'source_revision_not_in_store'});continue;}
    res.push({added:true,itemId:store.addCategoryItem246({categoryId:i.category,section:i.section,statement:i.statement,knowledgeClass:'technical_hypothesis',
     provenance:'professional_method_reference',sourceRevisionIds:[rev.revision_id],studyStream:i.studyStream,concept:i.concept})});
   }
   out(res);break;}
  case 'export-shards':{
   // --audience public|private (required): public = a destination others can read (e.g. a public repository).
   if(!flags.out||!['public','private'].includes(flags.audience))throw Error('--out DIR and --audience public|private required');
   out({dir:resolve(flags.out),...store.exportShards246(resolve(flags.out),{includePendingRights:!!flags['include-pending-rights'],audience:flags.audience})});break;}
  case 'revisit-plan':{const p=store.revisitPlan246({asOf:flags['as-of']??new Date().toISOString(),extractorVersion:SPEC_EXTRACTOR_VERSION,baseIntervalDays:flags.days?Number(flags.days):undefined});
   out(flags.full?p:{...p,plan:p.plan.filter(x=>x.action!=='skip').slice(0,100)});break;}
  case 'rights-worksheet':out(store.rightsWorksheet246());break;
  case 'test-measurements':{const ms=store.testMeasurements265(flags.product?{productId:flags.product}:{});
   out({measurements:ms,conflicts:flags.product?store.testMeasurementConflicts265(flags.product):null});break;}
  case 'seed-vocabulary':{let n=0;for(const [c,m] of Object.entries(CONCEPT_VOCABULARY248))for(const [id,al] of Object.entries(m))n+=store.addConceptAliases246(c,id,al);out({itemsUpdated:n});break;}
  // Phase250: the adopted category lessons (need hypotheses, everyday vocabulary, mechanism and method statements).
  case 'apply-lessons':out(applyLessons250(store,ADOPTED_LESSONS250));break;
  // Phase269: research-package teaching through the Phase252 machinery (concepts, measurements, conditions, relations).
  case 'apply-teaching':{const {applyTeaching252,registerTeachingSources252}=await import('../dist/src/phase252_category_teaching.js');
   const {AIR_FRYER_TEACHING269,RESEARCH_SOURCES269,COFFEE_TEACHING269,COFFEE_SOURCES269}=await import('../dist/src/phase269_research_teaching.js');
   const P270=await import('../dist/src/phase270_teaching.js');
   const P271=await import('../dist/src/phase271_category_teaching.js');const P272=await import('../dist/src/phase272_category_teaching.js');
   registerTeachingSources252([...RESEARCH_SOURCES269,...COFFEE_SOURCES269,...P270.SOURCES270,...P271.SOURCES271,...P272.SOURCES272]);
   // '--teaching phase270' applies the Phase270 deltas (air fryers, coffee) or the dehumidifier pilot; default: Phase269.
   const t=(flags.teaching==='phase272'?{televisions:P272.TELEVISION_TEACHING272}:flags.teaching==='phase271'?{dishwashers:P271.DISHWASHER_TEACHING271,air_purifiers:P271.AIR_PURIFIER_TEACHING271}:flags.teaching==='phase270'?{air_fryers:P270.AIR_FRYER_TEACHING270,coffee_machines:P270.COFFEE_TEACHING270,dehumidifiers:P270.DEHUMIDIFIER_TEACHING270}:flags.teaching==='phase271-provenance'?{dehumidifiers:P270.DEHUMIDIFIER_TEACHING271}:
    {air_fryers:AIR_FRYER_TEACHING269,coffee_machines:COFFEE_TEACHING269})[flags.category];if(!t)throw Error('no teaching for '+flags.category);
   out(applyTeaching252(store,[t]));break;}
  case 'retire-item':out({retired:store.retireCategoryItem246(flags.item,flags.reason)});break;
  case 'seed-relations':out({category:flags.category,...seedRelations247(store,flags.category)});break;
  case 'category-graph':{const c=flags.category;const comp=compileTo116(store,c);
   out({categoryId:c,relations:relations247(store,c),vocabulary:attributeVocabulary247(store,c),phase116Audit:comp.audit,phase116Reason:comp.reason,
    priorities:researchPriorities247(store,c)});break;}
  case 'reconcile':out({identityGapsResolved:store.reconcileIdentityGaps246()});break;
  case 'purge':out({expired:store.purgeExpired246()});break;
  default:console.error('unknown command; see header of scripts/phase246-knowledge.mjs');process.exitCode=2;
 }
}finally{store.close();}
