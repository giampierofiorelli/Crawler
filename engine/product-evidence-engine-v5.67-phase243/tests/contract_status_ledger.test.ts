// G1d (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-g1d-authorisation-2026-10-21.md, §5): the G1b commit e8d44a3 overwrote every open-debt resolvedStatus in
// docs/architecture/vertical-contract.json with one entry's text, and the contract tests did not notice. These tests make
// such a change visible:
//  - every open-debt entry's item, resolvedStatus and progress are pinned by hash in a ledger
//    (docs/architecture/open-debt-ledger.json); a change fails until that entry's ledger record is updated with a date,
//    an author and a reason (scripts/open-debt-ledger.mjs --update ID), one entry at a time;
//  - no non-trivial status, progress or item text is shared by two entries (a bulk overwrite is caught even if the
//    ledger were regenerated);
//  - statuses use the contract's vocabulary ('open', 'open: ...', 'resolved...').
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..','..');
const C=JSON.parse(readFileSync(resolve(root,'docs/architecture/vertical-contract.json'),'utf8')) as {openDebt:Record<string,unknown>[]};
const L=JSON.parse(readFileSync(resolve(root,'docs/architecture/open-debt-ledger.json'),'utf8')) as
 {schema:string;entries:{id:string;item:string|null;resolvedStatus:string|null;progress:string|null;history:{date:string;by:string;reason:string}[]}[]};
const h=(v:unknown)=>v===undefined||v===null?null:createHash('sha256').update(String(v)).digest('hex');

test('open-debt ledger: every entry is pinned; a change needs its own ledger record with a reason',()=>{
 assert.equal(L.schema,'pee.open-debt-ledger.v1');
 const byId=new Map(L.entries.map(e=>[e.id,e]));
 assert.deepEqual(C.openDebt.map(d=>d.id).sort(),[...byId.keys()].sort(),'every open-debt id has exactly one ledger entry');
 for(const d of C.openDebt){const e=byId.get(String(d.id))!;
  for(const k of ['item','resolvedStatus','progress'] as const)
   assert.equal(h(d[k]),e[k],`${d.id}.${k} changed: if intended, run scripts/open-debt-ledger.mjs --update ${d.id} --by ... --reason ...`);
  assert.ok(e.history.length>=1&&e.history.every(x=>x.date&&x.by&&x.reason),`${d.id}: ledger history needs date, author and reason`);}
});

test('open-debt invariant: no non-trivial status, progress or item text is shared by two entries',()=>{
 for(const k of ['item','resolvedStatus','progress']){const seen=new Map<string,string>();
  for(const d of C.openDebt){const v=d[k];if(typeof v!=='string'||v.length<=40)continue;
   assert.ok(!seen.has(v),`${k} of ${d.id} is identical to ${seen.get(v)}'s: a bulk overwrite?`);seen.set(v,String(d.id));}}
});

test('open-debt invariant: statuses use the contract vocabulary',()=>{
 for(const d of C.openDebt){const s=d.resolvedStatus;if(s===undefined)continue;
  assert.match(String(s),/^(?:open(?::\s.+)?|resolved[a-z_]*(?::\s.+)?)$/s,`${d.id}: unexpected status`);}
});
