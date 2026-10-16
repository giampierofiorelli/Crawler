#!/usr/bin/env node
/** Phase260 — read-only compatibility check of the v4 migration and the source-memory projection on REAL retained data.
 * Works on a COPY of the verified snapshot outside Git (the live store and the snapshot are not opened for writing).
 * Checks: canonical tables equal in content before and after the migration; the journal unchanged and verified; an
 * empty, consistent projection; and, for every retained (revision, product) link, that the Phase260 descriptor equals
 * the Phase259 descriptor. No memory record is written: nothing is reviewed or annotated here.
 * Output: counts and hashes only (no declaration values).
 * Usage: node scripts/phase260-real-store-compat.mjs [--out FILE]
 */
import {writeFileSync,copyFileSync,mkdirSync,rmSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
import {createHash} from 'node:crypto';import {DatabaseSync} from 'node:sqlite';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {descriptorFromRetained259} from '../dist/src/phase258_source_contributions.js';
import {checkSourceMemory260,rebuildSourceMemory260,descriptorWithMemory260} from '../dist/src/phase260_source_memory_store.js';
const out=process.argv.includes('--out')?process.argv[process.argv.indexOf('--out')+1]:null;
const dir=join(homedir(),'.local','share','product-evidence-engine','arms260');mkdirSync(dir,{recursive:true});
const dbf=join(dir,'real-copy.sqlite');for(const x of ['','-wal','-shm'])rmSync(dbf+x,{force:true});
copyFileSync('/home/user/pee-knowledge/snapshot/pee246.sqlite',dbf);
const sha=s=>createHash('sha256').update(s).digest('hex');
const TABLES=['sources','revisions','sightings','products','variants','product_sources','declarations','category_items','category_versions','derived_nodes','derived_edges',
 'host_access','research_gaps','product_keys','revision_properties','category_relations','events'];
const contentHash=db=>Object.fromEntries(TABLES.map(t=>[t,sha(JSON.stringify(db.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all()))]));
const ro=new DatabaseSync(dbf,{readOnly:true});
const before={version:ro.prepare('PRAGMA user_version').get().user_version,tables:contentHash(ro)};ro.close();

const s=new KnowledgeStore246(dbf);
const after={version:s.schemaVersion(),tables:contentHash(s.db)};
const journal=s.verifyJournal();const check0=checkSourceMemory260(s);
// Rebuilding from the real journal writes no record: there are no memory events yet.
const rebuilt=rebuildSourceMemory260(s);
// Every retained link: the Phase260 descriptor (no memory) equals the Phase259 one, built with the Phase259 inputs.
const restricted=new Set(s.db.prepare('SELECT host FROM host_access WHERE restricted>0 OR suspended_until IS NOT NULL').all().map(r=>r.host));
const links=s.db.prepare(`SELECT ps.product_id,ps.revision_id,MIN(ps.role) attribution,r.url,r.sha256,r.fetched_at,r.state,s.source_id,s.host,s.source_type,s.source_type_basis,p.identity_state
 FROM product_sources ps JOIN revisions r USING(revision_id) JOIN sources s USING(source_id) JOIN products p USING(product_id) GROUP BY ps.product_id,ps.revision_id`).all();
let equal=0;const differ=[];
for(const l of links){
 const props=s.db.prepare('SELECT property FROM declarations WHERE revision_id=? AND product_id=?').all(l.revision_id,l.product_id).map(x=>x.property);
 const p259=descriptorFromRetained259({productId:l.product_id,...l,nd:props.length,declaredProperties:props,restricted:restricted.has(l.host)});
 const p260=descriptorWithMemory260(s,l.revision_id,l.product_id);
 if(JSON.stringify(p259)===JSON.stringify(p260.descriptor)&&p260.annotations.length===0)equal++;else differ.push(l.revision_id+':'+l.product_id);
}
const changed=TABLES.filter(t=>before.tables[t]!==after.tables[t]);
const result={schema:'pee260.real-store-compat.v1',input:'copy of pee-knowledge snapshot/pee246.sqlite (outside Git); live store not opened',
 migration:{from:before.version,to:after.version,canonicalTablesChanged:changed,journal:{events:journal.events,ok:journal.ok}},
 projection:{beforeRebuild:check0,rebuild:{records:rebuilt.records},after:checkSourceMemory260(s)},
 descriptors:{links:links.length,equalToPhase259:equal,differ:differ.slice(0,20)},
 memoryRecordsWritten:0,reviewsManufactured:0,observationsModified:0,network:false};
s.close();
const text=JSON.stringify(result,null,1)+'\n';
if(out)writeFileSync(out,text);process.stdout.write(text);
if(changed.length||!journal.ok||!result.projection.after.projectionConsistent||equal!==links.length)process.exitCode=1;
