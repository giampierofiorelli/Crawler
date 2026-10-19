import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,utimesSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {KnowledgeStore246,STORE_SCHEMA_VERSION246} from '../src/phase246_knowledge_store.js';
import {systemIntegrity80,staleCompiled80,BLOCKING_FINDINGS80} from '../src/system_integrity80.js';

// S80 C1: a run must be able to tell that it is not the system it claims to be (stale store, broken journal, stale
// compiled code, a store behind the snapshot). Found in S80: a container kept a schema-3 store under schema-10 code.
const base=mkdtempSync(join(tmpdir(),'pee80-int-'));
function currentStore(name:string){
 const f=join(base,name);process.env.PEE_ALLOW_TMP_STORE='1';
 try{const s=new KnowledgeStore246(f);s.close();}finally{delete process.env.PEE_ALLOW_TMP_STORE;}
 return f;
}
const blocking=(f:readonly string[])=>f.filter(x=>BLOCKING_FINDINGS80.has(x as never));

test('S80 integrity: a fresh store at the code schema has no store findings and records the active rules',()=>{
 const r=systemIntegrity80(currentStore('ok.sqlite'));
 assert.equal(r.store.schemaVersion,STORE_SCHEMA_VERSION246);assert.ok(r.store.integrityOk&&r.store.journalOk);
 assert.deepEqual(r.findings.filter(f=>f.startsWith('store_')),[]);
 assert.equal(r.active.rankingAuthorisation,'ra.2');assert.equal(r.active.validatedNewAuthorisations,0);
 assert.match(r.active.quantityKnowledge,/^qk\./);
});
test('S80 integrity: an older-schema store (the stale-container case) is a blocking finding',()=>{
 const f=join(base,'old.sqlite');const db=new DatabaseSync(f);
 db.exec(`CREATE TABLE events (seq INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, kind TEXT NOT NULL, payload_json TEXT NOT NULL,
  previous_sha256 TEXT NOT NULL, event_sha256 TEXT NOT NULL); PRAGMA user_version=3;`);db.close();
 const r=systemIntegrity80(f);
 assert.ok(r.findings.includes('store_schema_mismatch'));assert.ok(blocking(r.findings).length>0);
});
test('S80 integrity: a tampered journal is a blocking finding',()=>{
 const f=currentStore('tampered.sqlite');const db=new DatabaseSync(f);
 const n=(db.prepare('SELECT COUNT(*) n FROM events').get() as {n:number}).n;
 if(n===0)db.prepare("INSERT INTO events(at,kind,payload_json,previous_sha256,event_sha256) VALUES ('2026-01-01','x','{}','0','bad')").run();
 else db.prepare("UPDATE events SET payload_json='{\"tampered\":1}' WHERE seq=(SELECT MIN(seq) FROM events)").run();
 db.close();
 const r=systemIntegrity80(f);
 assert.ok(r.findings.includes('store_journal_broken'));
});
test('S80 integrity: a missing store is a blocking finding',()=>{
 const r=systemIntegrity80(join(base,'none.sqlite'));
 assert.deepEqual(blocking(r.findings).includes('store_missing'),true);
});
test('S80 integrity: snapshot lineage findings (behind and diverged block, unsaved changes only reported)',()=>{
 const f=currentStore('lin.sqlite');
 const of=(relation:string)=>systemIntegrity80(f,{snapshotStatus:{lineage:{relation},snapshotCommit:'abc1234'}});
 assert.ok(blocking(of('live_behind').findings).includes('live_store_behind_snapshot'));
 assert.ok(blocking(of('diverged').findings).includes('live_store_diverged_from_snapshot'));
 const ahead=of('live_ahead');assert.ok(ahead.findings.includes('live_store_unsaved_changes'));
 assert.ok(!blocking(ahead.findings).includes('live_store_unsaved_changes' as never));
 assert.deepEqual(of('same').snapshot,{relation:'same',commit:'abc1234'});
});
test('S80 integrity: compiled modules older than their source, or missing, are detected',()=>{
 const e=join(base,'engine');mkdirSync(join(e,'src'),{recursive:true});mkdirSync(join(e,'dist','src'),{recursive:true});
 for(const n of ['fresh','stale','missing'])writeFileSync(join(e,'src',n+'.ts'),'export {};');
 writeFileSync(join(e,'dist','src','fresh.js'),'');writeFileSync(join(e,'dist','src','stale.js'),'');
 const t=Date.now()/1000;utimesSync(join(e,'dist','src','stale.js'),t-100,t-100);utimesSync(join(e,'src','stale.ts'),t,t);
 utimesSync(join(e,'dist','src','fresh.js'),t,t);utimesSync(join(e,'src','fresh.ts'),t-100,t-100);
 assert.deepEqual(staleCompiled80(e),['missing.ts','stale.ts']);
});
