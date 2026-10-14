#!/usr/bin/env node
// Real CLI: zero injection of mock transports, no blanket permission toggle.
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {resolve} from 'node:path';
import {runAutonomousDiscovery220} from '../dist/src/phase220_autonomous_discovery_worker.js';
const usage='Usage: node scripts/phase220-run.mjs --request "English product need" --registry registry.json --state state.json [--output run.json]';
const argv=process.argv.slice(2),flags={};
for(let i=0;i<argv.length;i+=2){if(!['--request','--registry','--state','--output'].includes(argv[i])||!argv[i+1]){console.error(usage);process.exit(2);}flags[argv[i].slice(2)]=argv[i+1];}
if(!flags.request||!flags.registry||!flags.state){console.error(usage);process.exit(2);}
const parse=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
let checkpoint;
try{checkpoint=parse(flags.state);}catch(e){if(e.code!=='ENOENT')throw e;}
try{
 const run=await runAutonomousDiscovery220({question:flags.request,
  registry:parse(flags.registry),checkpoint,asOf:new Date().toISOString(),mode:'live'});
 const save=(path,data)=>{const full=resolve(path),tmp=full+'.tmp.'+process.pid;
  writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});renameSync(tmp,full);};
 save(flags.state,run.checkpoint);
 const {checkpoint:_,...summary}=run;
 if(flags.output)save(flags.output,summary);
 console.log(JSON.stringify(summary,null,2));
}catch(e){console.error(JSON.stringify({error:String(e)}));process.exitCode=1;}
