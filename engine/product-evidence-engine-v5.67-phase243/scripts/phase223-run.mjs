#!/usr/bin/env node
/** Operational entry: real Phase220/221 source discovery + Phase222 reading,
 * and optionally configured Phase223 SearXNG JSON search + page inspection.
 * There is intentionally no CLI mock-transport option. Results aren't rankings.
 */
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {resolve} from 'node:path';
import {runAutonomousDiscovery220} from '../dist/src/phase220_autonomous_discovery_worker.js';
import {observeDiscoveredPages222} from '../dist/src/phase222_transient_public_page_observer.js';
import {searchCandidateUrls223,inspectSearchLeads223} from '../dist/src/phase223_search_discovery.js';
const usage='Usage: node scripts/phase223-run.mjs --request "English product need" --registry registry.json --state state.json [--search-config config.json] [--output run.json]';
const argv=process.argv.slice(2),flags={};
for(let i=0;i<argv.length;i+=2){if(!['--request','--registry','--state','--output','--search-config'].includes(argv[i])||!argv[i+1]){
 console.error(usage);process.exit(2);}flags[argv[i].slice(2)]=argv[i+1];}
if(!flags.request||!flags.registry||!flags.state){console.error(usage);process.exit(2);}
const parse=p=>JSON.parse(readFileSync(resolve(p),'utf8'));
const save=(path,data)=>{const full=resolve(path),tmp=full+'.tmp.'+process.pid;
 writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});renameSync(tmp,full);};
let checkpoint;try{checkpoint=parse(flags.state);}catch(e){if(e.code!=='ENOENT')throw e;}
try{
 const registry=parse(flags.registry),now=new Date().toISOString();
 const discovery=await runAutonomousDiscovery220({question:flags.request,registry,checkpoint,asOf:now,mode:'live'});
 const observations=await observeDiscoveredPages222({run:discovery,registry,observedAt:now,mode:'live'});
 let search=null,searchObservations=null;
 if(flags['search-config']){
  search=await searchCandidateUrls223({question:flags.request,registry,
   config:parse(flags['search-config']),mode:'live'});
  if(search.candidates.length)searchObservations=await inspectSearchLeads223({search,registry,observedAt:now,mode:'live'});
 }
 save(flags.state,discovery.checkpoint);
 const {checkpoint:_,...sourceDiscovery}=discovery;
 const result={schema:'pee223.cli.v1',sourceDiscovery,observations,search,searchObservations,
  verifiedProductCount:0,independentEvidenceAdmitted:0,rankingAuthorized:false,
  noSourceBodiesStored:true,
  limitations:['Search URLs and publisher metadata are unverified leads; no ranking is authorized.',
   'A configured search endpoint is required for general web discovery.']};
 if(flags.output)save(flags.output,result);
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error(JSON.stringify({error:String(e)}));process.exitCode=1;}
