import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const root=process.cwd();
const launch=path.join(root,'dist-launch');
const entry=await import(path.join(launch,'launch/index.js'));
test('compiled launch surface exposes only the independent recommendation pipeline',()=>{
  assert.deepEqual(Object.keys(entry),['buildLaunchRecommendation']);
});
test('launch distribution excludes legacy experimental modules',async()=>{
  const names=await readdir(launch);
  for(const forbidden of ['purchase_decision.js','price_observations.js','provider_feeds.js','commercial_rights.js','coverage_pilot.js','engine.js','list_price_context.js','manufacturer_editorial_gate.js']){
    assert.equal(names.includes(forbidden),false,forbidden);
  }
});
test('compiled release verifier rejects an accidentally included legacy file',async()=>{
  const injected=path.join(launch,'purchase_decision.js');
  try {
    await writeFile(injected,'export const x=1;\n');
    const run=spawnSync(process.execPath,['scripts/verify-launch.mjs'],{cwd:root,encoding:'utf8'});
    assert.notEqual(run.status,0);
    assert.match(run.stderr,/Disallowed launch file/);
  } finally { await unlink(injected).catch(()=>{}); }
});
test('compiled release verifier rejects references to prohibited price modules',async()=>{
  const target=path.join(launch,'launch_pipeline.js');
  const original=await readFile(target,'utf8');
  try {
    await writeFile(target,original+'\n// import price_observations\n');
    const run=spawnSync(process.execPath,['scripts/verify-launch.mjs'],{cwd:root,encoding:'utf8'});
    assert.notEqual(run.status,0);
    assert.match(run.stderr,/Forbidden reference/);
  } finally { await writeFile(target,original); }
});
