import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';import {tmpdir} from 'node:os';import {join,resolve,dirname} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
// Phase250: the knowledge snapshot may be written only into the private data repository, never into the public code
// repository or a repository with any other origin.
const SCRIPT=resolve(dirname(fileURLToPath(import.meta.url)),'..','..','scripts','knowledge-snapshot.mjs');
const ENGINE=resolve(dirname(SCRIPT),'..');
const base=mkdtempSync(join(tmpdir(),'pee250-snap-'));
const live=join(base,'live');mkdirSync(live);writeFileSync(join(live,'pee246.sqlite'),'not used: the target check runs first');
const repo=(name:string,origin:string|null)=>{const d=join(base,name);mkdirSync(d);execFileSync('git',['init','-q',d]);
 if(origin)execFileSync('git',['-C',d,'remote','add','origin',origin]);return join(d,'snapshot');};
const sync=(snap:string)=>{const r=spawnSync(process.execPath,['--no-warnings',SCRIPT,'sync'],{encoding:'utf8',
 env:{...process.env,PEE_SNAPSHOT_DIR:snap,PEE_KNOWLEDGE_DIR:live,PEE_SNAPSHOT_TEST_REMOTE:''}});return {code:r.status,out:r.stdout};};

test('refuses a snapshot directory inside the public code repository',()=>{
 const r=sync(join(ENGINE,'knowledge-snapshot'));
 assert.equal(r.code,2);assert.match(r.out,/unsafe_snapshot_target/);assert.match(r.out,/inside_public_code_repository|origin_not_private/);
});
test('refuses a repository whose origin is not the private pee-knowledge repository',()=>{
 for(const origin of ['https://github.com/giampierofiorelli/Crawler','https://github.com/someone/pee-knowledge-public',null]){
  const r=sync(repo('r'+Math.random().toString(36).slice(2),origin));
  assert.equal(r.code,2,String(origin));assert.match(r.out,/unsafe_snapshot_target/);
 }
});
test('accepts the private repository origin (and stops only later, at the clone or store)',()=>{
 const r=sync(repo('ok',"https://github.com/giampierofiorelli/pee-knowledge"));
 assert.doesNotMatch(r.out,/unsafe_snapshot_target/);
});
