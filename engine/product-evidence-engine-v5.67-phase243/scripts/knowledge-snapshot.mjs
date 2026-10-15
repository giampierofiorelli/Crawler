#!/usr/bin/env node
/** Knowledge snapshot in Git (owner decision 2026-10-15: the knowledge store lives in the repository, in plain form).
 * Each cloud container is new, so the operational store ($PEE_KNOWLEDGE_DIR) is restored from the committed snapshot
 * at session start, and the snapshot is refreshed and committed whenever a session changes the store.
 *
 *  node scripts/knowledge-snapshot.mjs load [--force 1]   restore snapshot → $PEE_KNOWLEDGE_DIR (no build needed;
 *                                                          skipped when a live store exists unless --force)
 *  node scripts/knowledge-snapshot.mjs save                verified backup of the live store → knowledge-snapshot/
 *                                                          (needs a build; then commit knowledge-snapshot/)
 *  node scripts/knowledge-snapshot.mjs status              compare live store and snapshot
 * The live store still refuses to open inside a Git work tree; only the verified snapshot copy is committed.
 */
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,cpSync,rmSync,mkdtempSync,renameSync} from 'node:fs';
import {homedir,tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SNAP=join(ROOT,'knowledge-snapshot');
const SNAP_DB=join(SNAP,'pee246.sqlite'),SNAP_MANIFEST=SNAP_DB+'.manifest.json',SNAP_NOTICES=join(SNAP,'safety-notices');
const LIVE_DIR=process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge');
const LIVE_DB=join(LIVE_DIR,'pee246.sqlite'),LIVE_NOTICES=join(LIVE_DIR,'safety-notices');
const [cmd,...rest]=process.argv.slice(2);
const F=Object.fromEntries(rest.reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const out=x=>console.log(JSON.stringify(x));

if(cmd==='load'){
 if(!existsSync(SNAP_DB)){out({loaded:false,reason:'no_snapshot'});process.exit(0);}
 if(existsSync(LIVE_DB)&&!F.force){out({loaded:false,reason:'live_store_present',live:LIVE_DB});process.exit(0);}
 const m=JSON.parse(readFileSync(SNAP_MANIFEST,'utf8'));
 if(sha(SNAP_DB)!==m.sha256){out({loaded:false,reason:'snapshot_hash_mismatch'});process.exit(1);}
 mkdirSync(LIVE_DIR,{recursive:true});
 if(existsSync(LIVE_DB)){const kept=`${LIVE_DB}.replaced-${Date.now()}`;renameSync(LIVE_DB,kept);
  for(const x of ['-wal','-shm'])if(existsSync(LIVE_DB+x))renameSync(LIVE_DB+x,kept+x);}
 copyFileSync(SNAP_DB,LIVE_DB+'.tmp');renameSync(LIVE_DB+'.tmp',LIVE_DB);
 if(existsSync(SNAP_NOTICES))cpSync(SNAP_NOTICES,LIVE_NOTICES,{recursive:true});
 out({loaded:true,live:LIVE_DB,sha256:m.sha256,counts:m.counts});
}else if(cmd==='save'){
 const {KnowledgeStore246}=await import('../dist/src/phase246_knowledge_store.js');
 if(!existsSync(LIVE_DB)){out({saved:false,reason:'no_live_store'});process.exit(1);}
 const tmp=mkdtempSync(join(tmpdir(),'pee-snap-'));
 const store=new KnowledgeStore246(LIVE_DB);
 let r;try{r=store.backupRotate249(tmp,1);}finally{store.close();}
 if(!r.manifest.integrityOk||!r.manifest.journalOk)throw Error('snapshot_failed_verification');
 mkdirSync(SNAP,{recursive:true});
 copyFileSync(r.path,SNAP_DB);
 writeFileSync(SNAP_MANIFEST,readFileSync(r.path+'.manifest.json'));
 if(existsSync(LIVE_NOTICES)){rmSync(SNAP_NOTICES,{recursive:true,force:true});cpSync(LIVE_NOTICES,SNAP_NOTICES,{recursive:true});}
 rmSync(tmp,{recursive:true,force:true});
 if(sha(SNAP_DB)!==r.manifest.sha256)throw Error('snapshot_hash_mismatch_after_copy');
 out({saved:true,snapshot:SNAP_DB,sha256:r.manifest.sha256,counts:r.manifest.counts,next:'git add knowledge-snapshot && git commit'});
}else if(cmd==='status'){
 const m=existsSync(SNAP_MANIFEST)?JSON.parse(readFileSync(SNAP_MANIFEST,'utf8')):null;
 out({snapshot:m?{sha256:m.sha256,counts:m.counts,verifiedAt:m.verifiedAt}:null,live:existsSync(LIVE_DB)?LIVE_DB:null,
  note:'after changing the live store, run save and commit knowledge-snapshot/'});
}else{console.error('usage: knowledge-snapshot.mjs load|save|status');process.exit(2);}
