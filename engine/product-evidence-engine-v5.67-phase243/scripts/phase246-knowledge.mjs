#!/usr/bin/env node
/** Phase246 knowledge store CLI (operator tool; no network access).
 *
 *  node scripts/phase246-knowledge.mjs <command> [--db FILE] [options]
 *   status                      counts, schema version, journal check, stale artifacts, suspended hosts
 *   seed --category C           add assistant-authored (unreviewed) hypotheses for C (air_fryers|coffee_machines|toasters)
 *   ingest-recovered --raw DIRS  ingest Phase245 manifest pages whose raw bytes are present AND hash-verified
 *   ingest-observations --file F ingest a JSON list of observations produced by a live run (see phase246-live-wave.mjs)
 *   add-method-refs --file F    add professional test-method pointers (paraphrase + observed revision)
 *   profile --category C [--commit REASON]   print (and optionally version) a category profile
 *   export --out FILE [--include-pending-rights]
 *   import --from FILE --db NEW  rebuild a store from an export into a new database file
 *   backup --out FILE            consistent SQLite copy (VACUUM INTO)
 *   purge                        expire local pending-rights declarations past their expiry
 *
 * Default DB: $PEE_KNOWLEDGE_DIR/pee246.sqlite, else ~/.local/share/product-evidence-engine/knowledge/pee246.sqlite.
 * The storage policy is default-deny unless --storage-policy FILE is given (operator decision, not a rights grant).
 */
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,defaultKnowledgeDir246} from '../dist/src/phase246_knowledge_store.js';
import {seedCategoryHypotheses246,CATEGORY_ALIASES246} from '../dist/src/phase246_category_seeds.js';
import {extractSpecifications245,SPEC_EXTRACTOR_VERSION} from '../dist/src/phase245_spec_extraction.js';

const [cmd,...rest]=process.argv.slice(2);
const flags={};for(let i=0;i<rest.length;i++){if(rest[i].startsWith('--')){const k=rest[i].slice(2);const v=rest[i+1]&&!rest[i+1].startsWith('--')?rest[++i]:true;flags[k]=v;}}
const root=resolve(new URL('..',import.meta.url).pathname);
const dbPath=resolve(flags.db??join(defaultKnowledgeDir246(),'pee246.sqlite'));
const storage=flags['storage-policy']?JSON.parse(readFileSync(flags['storage-policy'],'utf8')):DEFAULT_STORAGE_POLICY246;
const sha=b=>createHash('sha256').update(b).digest('hex');
const out=x=>console.log(JSON.stringify(x,null,1));

// Operator-assigned source types for the recovered pages: a classification of the publisher's role,
// not a rights decision. No rights policy is attached: the Phase244 registry was test-only.
const SOURCE_TYPE_BY_HOST={'www.switchbacktravel.com':'editorial','www.prodirectsport.com':'retailer','www.brabantia.com':'manufacturer',
 'www.ikea.com':'retailer','www.lakeland.co.uk':'retailer','docs.arduino.cc':'manufacturer','psref.lenovo.com':'manufacturer',
 'en.wikipedia.org':'reference_encyclopedia','www.apple.com':'manufacturer','www.bosch-home.co.uk':'manufacturer','shop.pimoroni.com':'retailer',
 'www.rtings.com':'independent_original_test','www.scan.co.uk':'retailer','www.pololu.com':'manufacturer','www.wickes.co.uk':'retailer',
 'www.richersounds.com':'retailer','www.sparkfun.com':'manufacturer','www.johnlewis.com':'retailer'};

if(cmd==='import'){
 if(!flags.from)throw Error('--from required');
 const s=KnowledgeStore246.import246(resolve(flags.from),dbPath,storage);out({imported:dbPath,stats:s.stats246(),journal:s.verifyJournal()});s.close();process.exit(0);
}
const store=new KnowledgeStore246(dbPath,storage);
try{
 switch(cmd){
  case 'status':out({db:dbPath,storagePolicy:storage.policyVersion,stats:store.stats246(),journal:store.verifyJournal(),stale:store.staleNodes246().slice(0,50),
   suspendedHosts:store.db.prepare('SELECT host,suspended_until,reason FROM host_access WHERE suspended_until IS NOT NULL').all()});break;
  case 'seed':{const ids=seedCategoryHypotheses246(store,flags.category);out({category:flags.category,items:ids.length});break;}
  case 'ingest-recovered':{
   const inv=JSON.parse(readFileSync(join(root,'evaluation/phase246/recovery-inventory.json'),'utf8'));
   const dirs=String(flags.raw??'').split(',').filter(Boolean);const res=[];
   for(const p of inv.pages){
    let bytes=null;for(const d of dirs){const f=join(d,p.tag+'.html');if(existsSync(f)){const b=readFileSync(f);if(sha(b)===p.recordedSha256){bytes=b;break;}}}
    if(!bytes||!p.url){res.push({tag:p.tag,ingested:false,reason:bytes?'no_url':'raw_bytes_not_verified'});continue;}
    const host=new URL(p.url).host;
    const r=store.ingestObservation246({source:{sourceId:'src_'+host.replace(/[^a-z0-9]+/gi,'_'),host,sourceType:SOURCE_TYPE_BY_HOST[host]??'unknown',
      sourceTypeBasis:'operator_asserted'},url:p.url,sha256:p.recordedSha256,bytes:p.bytes,httpStatus:200,fetchedAt:new Date(p.fetchedAt).toISOString(),
     runId:'phase245_recovered_'+p.set,extractorVersion:SPEC_EXTRACTOR_VERSION,extraction:extractSpecifications245(bytes.toString('utf8'),p.url),
     categoryHypotheses:p.categoryHypothesis?[p.categoryHypothesis]:[]});
    res.push({tag:p.tag,ingested:true,newRevision:r.newRevision,retention:r.retention,products:r.productIds.length,variants:r.variantIds.length,
     declarationsSeen:r.declarationsSeen,declarationsRetained:r.declarationsRetained});
   }
   out({db:dbPath,results:res,stats:store.stats246()});break;}
  case 'ingest-observations':{
   const obs=JSON.parse(readFileSync(resolve(flags.file),'utf8'));const res=[];
   for(const o of obs){
    if(o.access)store.recordAccess246(o.access.host,o.access.outcome,o.access.at);
    if(!o.observation)continue;
    const x=o.observation;
    const r=store.ingestObservation246({...x,extraction:x.extraction??null});
    res.push({url:x.url,newRevision:r.newRevision,retention:r.retention,products:r.productIds.length,declarationsSeen:r.declarationsSeen,declarationsRetained:r.declarationsRetained});
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
  case 'purge':out({expired:store.purgeExpired246()});break;
  default:console.error('unknown command; see header of scripts/phase246-knowledge.mjs');process.exitCode=2;
 }
}finally{store.close();}
