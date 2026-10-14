/** Offline evaluation CLI. Accept only user-supplied reviewed JSON, no network. */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {evaluateVideoEvidence206} from '../dist/src/phase206_video_evidence_benchmark.js';
const [datasetPath,predictionsPath,pairsPath,providerId,providerVersion]=process.argv.slice(2);
if(!datasetPath||!providerId||!providerVersion){
 process.stderr.write('Usage: node scripts/phase206-evaluate.mjs dataset.json predictions.json pairs.json provider_id version\n');
 process.exit(2);
}
const load=p=>p==='-'?[]:JSON.parse(readFileSync(resolve(p),'utf8'));
try{
 const report=evaluateVideoEvidence206(load(datasetPath),predictionsPath?load(predictionsPath):[],
  pairsPath?load(pairsPath):[],providerId,providerVersion);
 process.stdout.write(JSON.stringify(report,null,2)+'\n');
}catch(e){process.stderr.write(String(e)+'\n');process.exitCode=1;}
