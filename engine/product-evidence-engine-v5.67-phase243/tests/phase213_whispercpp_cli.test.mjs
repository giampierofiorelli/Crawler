import test from 'node:test';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {resolve} from 'node:path';
const script=resolve('scripts/phase213-whispercpp-local.mjs');
test('probe accurately reports no bundled model or built executable',()=>{
 const run=spawnSync(process.execPath,[script,'--probe'],{encoding:'utf8',timeout:8000});
 assert.equal(run.status,0);const p=JSON.parse(run.stdout);
 assert.equal(p.completeModelBundled,false);assert.equal(p.actualInferenceExecuted,false);
 assert.equal(p.noAutomaticDownload,true);
});
test('source-only ZIPs never masquerade as ASR inference',()=>{
 const run=spawnSync(process.execPath,[script,'fake.json','fake.mp4','nonexistent.bin','nonexistent-cli','out.json'],{encoding:'utf8',timeout:8000});
 assert.notEqual(run.status,0);assert.match(run.stderr,/phase213_local_model_or_binary_missing/);
});
