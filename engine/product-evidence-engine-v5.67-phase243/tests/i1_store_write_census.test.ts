// First increment A5 (owner authorisation 2026-10-21): census and verification only. This test keeps the committed
// census true to the code: if a store write, an event call or an external store.db access is added or removed, the
// recorded census (evaluation/a5/store-write-census.json) no longer matches and must be re-measured and reviewed, and
// the guarantees to preserve stay registered before any structural change.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';
const ROOT=new URL('../../',import.meta.url).pathname;
const C=JSON.parse(readFileSync(ROOT+'evaluation/a5/store-write-census.json','utf8'));
const G=JSON.parse(readFileSync(ROOT+'evaluation/a5/guarantees.json','utf8'));

test('A5: the recorded write census equals a fresh static census of the code', ()=>{
 const r=spawnSync(process.execPath,[ROOT+'scripts/a5-store-write-census.mjs','--static-only'],{encoding:'utf8',cwd:ROOT});
 assert.equal(r.status,0,r.stderr);
 assert.deepEqual(JSON.parse(r.stdout),C.static,'store writes, events or external db access changed: re-run the census and review the guarantees');
 assert.ok(C.static.dataWrites>0&&C.static.externalDbAccess.writes>0,'non-vacuous');
});

test('A5: the guarantees to preserve are registered, including the ones the journal cannot rebuild', ()=>{
 const ids=G.guarantees_to_preserve.map((g:{id:string})=>g.id);
 for(const id of ['G1','G2','G3','G4','G5','G6','G7'])assert.ok(ids.includes(id),id);
 assert.match(G.guarantees_to_preserve.find((g:{id:string})=>g.id==='G2').what,/independence/);
 assert.match(G.not_done_by_design,/db not made private/);
});
