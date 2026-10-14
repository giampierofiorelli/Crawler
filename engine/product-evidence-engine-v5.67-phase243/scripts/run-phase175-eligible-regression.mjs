/** Phase175 eligible TypeScript regression: isolated bounded workers; historical
 * Phase91/92 quarantine is explicit, not a claim those suites pass.
 */
import {readdirSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
const files=readdirSync('dist/tests').filter(x=>x.endsWith('.test.js')&&!/^phase(?:91|92)_/.test(x)).sort();
const groups=[];for(let i=0;i<files.length;i+=11)groups.push(files.slice(i,i+11));
let cursor=0,failed=false;const results=[];
const run=(names,index)=>new Promise(resolve=>{
 let stdout='',stderr='',done=false;
 const proc=spawn(process.execPath,['--test','--test-concurrency=2',...names.map(n=>`dist/tests/${n}`)],{stdio:['ignore','pipe','pipe']});
 const timer=setTimeout(()=>{if(!done)proc.kill('SIGKILL');},90000);
 proc.stdout.on('data',b=>{stdout+=String(b);if(stdout.length>6_000_000)proc.kill('SIGKILL');});
 proc.stderr.on('data',b=>{stderr+=String(b);if(stderr.length>1_000_000)proc.kill('SIGKILL');});
 proc.on('error',e=>{stderr+='\n'+e.message;});
 proc.on('close',code=>{
  done=true;clearTimeout(timer);
  const count=Number(/^# tests (\d+)\s*$/m.exec(stdout)?.[1]??-1);
  const failures=Number(/^# fail (\d+)\s*$/m.exec(stdout)?.[1]??-1);
  const ok=code===0&&count>=0&&failures===0;
  if(!ok)failed=true;
  console.log(`group=${index+1}/${groups.length} files=${names.length} tests=${count} failed=${failures} exit=${code}`);
  results.push({index:index+1,files:names.length,tests:count,failures,exitCode:code,ok,...(!ok?{tail:(stdout+'\n'+stderr).slice(-2500)}:{})});
  resolve();
 });
});
async function worker(){while(cursor<groups.length){const i=cursor++;await run(groups[i],i);}}
await Promise.all([worker(),worker(),worker()]);
results.sort((a,b)=>a.index-b.index);
const report={phase:175,scope:'eligible TypeScript suites, historical Phase91 and Phase92 excluded',eligibleFiles:files.length,
 groups:groups.length,passed:results.filter(r=>r.ok).reduce((n,r)=>n+r.tests,0),failedGroups:results.filter(r=>!r.ok).length,
 allGroupsPass:!failed,sha256EligiblePaths:createHash('sha256').update(files.join('\n')).digest('hex'),results};
mkdirSync('evaluation/phase175',{recursive:true});
writeFileSync('evaluation/phase175/regression-ts-recovery.json',JSON.stringify(report,null,2)+'\n');
console.log(`TOTAL ${report.passed} PASSED / ${files.length} files; failed groups ${report.failedGroups}`);
if(failed)process.exitCode=1;
