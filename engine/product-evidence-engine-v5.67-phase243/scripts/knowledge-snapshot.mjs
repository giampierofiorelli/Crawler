#!/usr/bin/env node
/** Knowledge snapshot in the PRIVATE repository giampierofiorelli/pee-knowledge (owner decision 2026-10-15).
 * Each cloud container is new, so the operational store ($PEE_KNOWLEDGE_DIR) is restored from the snapshot at session
 * start, and the snapshot is refreshed, committed and pushed to pee-knowledge whenever a session changes the store.
 * Snapshot directory: $PEE_SNAPSHOT_DIR, else <clone of pee-knowledge next to Crawler>/snapshot
 * (/home/user/pee-knowledge/snapshot in cloud sessions). Never put the snapshot in the public Crawler repository.
 *
 *  node scripts/knowledge-snapshot.mjs load [--force 1]   restore snapshot → $PEE_KNOWLEDGE_DIR (no build needed;
 *                                                          skipped when a live store exists unless --force)
 *  node scripts/knowledge-snapshot.mjs save                verified backup of the live store → snapshot/ (needs a build)
 *  node scripts/knowledge-snapshot.mjs sync                if the live store's content differs from the snapshot (or a
 *                                                          snapshot commit is unpushed): save, commit and push
 *                                                          pee-knowledge (needs a build). Run by the Stop and SessionEnd
 *                                                          hooks, so a change never stays only in the ephemeral
 *                                                          container. Exit 2 when a change could not be pushed.
 *  node scripts/knowledge-snapshot.mjs status              compare live store and snapshot
 * The live store still refuses to open inside a Git work tree; only the verified snapshot copy is committed.
 */
import {createHash} from 'node:crypto';
import {existsSync,mkdirSync,readFileSync,writeFileSync,copyFileSync,cpSync,rmSync,mkdtempSync,renameSync,readdirSync,statSync} from 'node:fs';
import {homedir,tmpdir} from 'node:os';
import {dirname,join,resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const SNAP=process.env.PEE_SNAPSHOT_DIR??resolve(ROOT,'..','..','..','pee-knowledge','snapshot');
const SNAP_DB=join(SNAP,'pee246.sqlite'),SNAP_MANIFEST=SNAP_DB+'.manifest.json',SNAP_NOTICES=join(SNAP,'safety-notices');
const LIVE_DIR=process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge');
const LIVE_DB=join(LIVE_DIR,'pee246.sqlite'),LIVE_NOTICES=join(LIVE_DIR,'safety-notices');
const REPO=resolve(SNAP,'..');
const [cmd,...rest]=process.argv.slice(2);
const F=Object.fromEntries(rest.reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const out=x=>console.log(JSON.stringify(x));

/** Content fingerprint of a store: every row of every table in rowid order, opened read-only. Ignores the
 * 'backup_written' journal events that saving itself appends (otherwise every save would make the live store differ
 * from its own snapshot); event hashes chain through those events, so only event content columns are compared. */
function fingerprint(file){
 const db=new DatabaseSync(file,{readOnly:true});const h=createHash('sha256');
 try{
  for(const {name,sql} of db.prepare("SELECT name,sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all()){
   const order=/WITHOUT ROWID/i.test(sql)?'':' ORDER BY rowid';
   const q=name==='events'?`SELECT at,kind,payload_json FROM events WHERE kind<>'backup_written'${order}`:`SELECT * FROM "${name}"${order}`;
   h.update('\0'+name+'\0');
   for(const r of db.prepare(q).iterate())h.update(JSON.stringify(Object.values(r))+'\n');
  }
 }finally{db.close();}
 return h.digest('hex');
}
/** Hashes of the files under a directory (safety notices), keyed by relative path. */
function dirHashes(dir){
 if(!existsSync(dir))return '';
 const files=[];const walk=d=>{for(const n of readdirSync(d)){const p=join(d,n);statSync(p).isDirectory()?walk(p):files.push(p);}};walk(dir);
 return files.map(f=>relative(dir,f)+' '+sha(f)).sort().join('\n');
}
async function save(){
 const {KnowledgeStore246}=await import('../dist/src/phase246_knowledge_store.js');
 if(!existsSync(LIVE_DB))return {saved:false,reason:'no_live_store'};
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
 return {saved:true,snapshot:SNAP_DB,sha256:r.manifest.sha256,counts:r.manifest.counts};
}
const git=(...a)=>execFileSync('git',['-C',REPO,...a],{encoding:'utf8',stdio:['ignore','pipe','pipe'],timeout:120000}).trim();
const errText=e=>String(e?.stderr||e?.message||e).slice(0,300);
const fail=(reason,extra={})=>{out({synced:false,reason,...extra,
 action:'the live store holds changes that are NOT saved in pee-knowledge: fix the cause, then run node scripts/knowledge-snapshot.mjs sync'});process.exit(2);};

if(cmd==='load'){
 if(!existsSync(SNAP_DB)){out({loaded:false,reason:'no_snapshot',expected:SNAP_DB,
  fix:'attach and clone the private repository giampierofiorelli/pee-knowledge to /home/user/pee-knowledge, then run this load again'});process.exit(0);}
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
 const r=await save();if(!r.saved){out(r);process.exit(1);}
 out({...r,next:'node scripts/knowledge-snapshot.mjs sync (commits and pushes pee-knowledge)'});
}else if(cmd==='sync'){
 if(!existsSync(LIVE_DB)){out({synced:true,reason:'no_live_store'});process.exit(0);}
 if(!existsSync(join(REPO,'.git')))fail('pee_knowledge_clone_missing',{expected:REPO});
 const changed=!existsSync(SNAP_DB)||fingerprint(LIVE_DB)!==fingerprint(SNAP_DB)||(existsSync(LIVE_NOTICES)&&dirHashes(LIVE_NOTICES)!==dirHashes(SNAP_NOTICES));
 try{git('fetch','-q','origin','main');}catch(e){fail('fetch_failed',{error:errText(e)});}
 if(changed){
  // Another session pushed a newer snapshot: a binary store cannot be merged, so it is never overwritten silently.
  if(git('rev-list','--count','HEAD..origin/main')!=='0')fail('remote_snapshot_newer',{hint:'another session changed pee-knowledge; reconcile by hand (load --force would discard the local changes)'});
  const r=await save();if(!r.saved)fail(r.reason);
 }
 try{
  if(git('status','--porcelain','--','snapshot')){
   git('add','-A','--','snapshot');
   const c=JSON.parse(readFileSync(SNAP_MANIFEST,'utf8')).counts;
   git('commit','-q','-m',`Auto-sync knowledge snapshot: ${c.declarations} declarations, ${c.products} products, ${c.category_items} category items, ${c.events} events`);
  }
 }catch(e){fail('commit_failed',{error:errText(e)});}
 // Also catches an earlier snapshot commit whose push failed.
 if(git('rev-list','--count','origin/main..HEAD')==='0'){out({synced:true,inSync:!changed});process.exit(0);}
 let err=null;
 for(const wait of [0,2,4,8,16]){if(wait)execFileSync('sleep',[String(wait)]);try{git('push','-q','origin','HEAD:main');err=null;break;}catch(e){err=e;}}
 if(err)fail('push_failed',{error:errText(err)});
 out({synced:true,pushed:git('rev-parse','--short','HEAD'),counts:JSON.parse(readFileSync(SNAP_MANIFEST,'utf8')).counts});
}else if(cmd==='status'){
 const m=existsSync(SNAP_MANIFEST)?JSON.parse(readFileSync(SNAP_MANIFEST,'utf8')):null;
 out({snapshot:m?{sha256:m.sha256,counts:m.counts,verifiedAt:m.verifiedAt}:null,live:existsSync(LIVE_DB)?LIVE_DB:null,
  contentInSync:existsSync(LIVE_DB)&&existsSync(SNAP_DB)?fingerprint(LIVE_DB)===fingerprint(SNAP_DB):null,
  snapshotDir:SNAP,note:'the Stop and SessionEnd hooks run sync automatically; run it by hand with node scripts/knowledge-snapshot.mjs sync'});
}else{console.error('usage: knowledge-snapshot.mjs load|save|sync|status');process.exit(2);}
