/** Run the entire TS test corpus in bounded child-process shards.
 * The all-files single invocation has repeatedly stalled in this evaluation
 * container at the high-subprocess Phase92 suites despite isolated success.
 * Bounded shards prevent deadlocks from consuming an unbounded CI job.
 */
import {readdirSync} from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const files=readdirSync('dist/tests').filter(n=>n.endsWith('.test.js')).sort()
 .map(n=>path.join('dist/tests',n));
if(!files.length)throw Error('Missing compiled TypeScript tests');
const shardSize=13;let tests=0;
const starts=[];for(let i=0;i<files.length;i+=shardSize)starts.push(i);
// Stress-heavy Phase92/93 tests run first, in a fresh shard.
const selected=process.argv[2];
if(selected!==undefined&&!/^[1-9][0-9]*$/.test(selected))throw Error('Invalid shard number');
const chosen=selected===undefined?starts.reverse():starts.filter(i=>i/shardSize+1===Number(selected));
if(!chosen.length)throw Error('No test shard selected');
for(const i of chosen){
 const shard=files.slice(i,i+shardSize);
 const run=spawnSync(process.execPath,['--test','--test-concurrency=3',...shard],{
  encoding:'utf8',timeout:90_000,maxBuffer:6_000_000});
 const output=(run.stdout||'')+'\n'+(run.stderr||'');
 const count=/^# tests (\d+)\s*$/m.exec(output);
 const failed=/^# fail (\d+)\s*$/m.exec(output);
 if(run.status!==0||run.error||!count||!failed||Number(failed[1])!==0){
  process.stderr.write(`Phase93 shard ${i/shardSize+1} FAILED: ${run.error?.message??run.status}\n${output.slice(-6000)}\n`);
  process.exit(1);
 }
 tests+=Number(count[1]);
 process.stdout.write(`Shard ${Math.floor(i/shardSize)+1}: ${count[1]} passed; ${shard.length} files\n`);
}
process.stdout.write(`${tests} compiled JavaScript/TypeScript tests passed across ${chosen.length} executed shard(s).\n`);
