/** All TS test files except explicitly quarantined Phase91/92 legacy suites. */
import {readdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const files=readdirSync('dist/tests').filter(f=>f.endsWith('.test.js') &&
 !['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'].includes(f)).sort();
if(!files.some(f=>f==='phase172_goal_suitability_guide.test.js'))throw Error('phase172_missing');
const groups=[];for(let i=0;i<files.length;i+=11)groups.push(files.slice(i,i+11));
const selected=process.argv[2];const indexes=selected?selected.split(',').map(x=>Number(x)-1):groups.map((_,i)=>i);
let total=0;const results=[];
for(const i of indexes){
 if(!Number.isSafeInteger(i)||i<0||i>=groups.length)throw Error('invalid group number');
 const paths=groups[i].map(f=>'dist/tests/'+f);
 const run=spawnSync(process.execPath,['--test','--test-concurrency=3',...paths],{
  encoding:'utf8',timeout:95_000,maxBuffer:10_000_000});
 const output=(run.stdout??'')+'\n'+(run.stderr??'');
 const count=Number(/^# tests (\d+)\s*$/m.exec(output)?.[1]);
 const fail=Number(/^# fail (\d+)\s*$/m.exec(output)?.[1]);
 results.push({group:i+1,files:groups[i].length,count,fail,status:run.status,error:run.error?.message??null});
 if(run.status!==0||run.error||!Number.isInteger(count)||fail!==0){
  console.error(JSON.stringify(results.at(-1)),output.slice(-3500));process.exit(1);
 }
 total+=count;console.log(`GROUP ${i+1}/${groups.length}: ${count} PASS`);
}
if(!selected)writeFileSync('evaluation/phase172/regression-ts.json',JSON.stringify({
 scope:'eligible compiled TS suites excluding historic phase91/phase92',testFiles:files.length,
 groups:groups.length,passed:total,failed:0,results},null,2)+'\n');
console.log('TOTAL:',total, 'FILES:',files.length);
