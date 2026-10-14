import fs from 'node:fs';import cp from 'node:child_process';import path from 'node:path';
const base='dist/tests';
const files=fs.readdirSync(base).filter(x=>x.endsWith('.test.js')&&!['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'].includes(x)).sort();
let totalPass=0,totalFail=0;let groups=[];
for(let i=0;i<files.length;i+=7){
 const slice=files.slice(i,i+7).map(f=>path.join(base,f));
 const r=cp.spawnSync(process.execPath,['--test','--test-concurrency=2',...slice],{encoding:'utf8',timeout:50000,maxBuffer:1024*1024*8});
 const pass=+(r.stdout.match(/# pass (\d+)/)||[])[1]||0;
 const fail=+(r.stdout.match(/# fail (\d+)/)||[])[1]||0;
 const group={group:i/7+1,files:slice.map(f=>path.basename(f)),pass,fail,exitCode:r.status,timedOut:r.error?.code==='ETIMEDOUT'};
 groups.push(group);totalPass+=pass;totalFail+=fail;
 process.stdout.write(JSON.stringify({group:group.group,pass,fail,status:r.status,timeout:group.timedOut})+'\n');
 if(r.status!==0||group.timedOut){fs.writeFileSync('/mnt/data/phase132_regression_failure.txt',r.stdout+'\n'+r.stderr);break;}
}
const report={phase:132,numberOfTestFiles:files.length,groups,passed:totalPass,failed:totalFail,
 excluded:['phase91_watch_gate.test.js','phase92_recipe_lifecycle.test.js'],complete:groups.length===Math.ceil(files.length/7)&&!groups.some(g=>g.timedOut||g.fail||g.exitCode!==0)};
fs.writeFileSync('PHASE132-REGRESSION-GROUPS.json',JSON.stringify(report,null,2)+'\n');
process.stdout.write('FINAL '+JSON.stringify({passed:report.passed,failed:report.failed,complete:report.complete})+'\n');
