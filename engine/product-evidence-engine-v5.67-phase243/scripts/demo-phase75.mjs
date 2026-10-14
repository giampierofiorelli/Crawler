/** Offline demonstration of persisted research state. Fictional lab metadata. */
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';import os from 'node:os';
import {createHash} from 'node:crypto';
import {runPhase75Research} from '../dist/src/phase75_runtime.js';
import {Phase75ResearchJournal} from '../dist/src/phase75_memory.js';
const temp=await mkdtemp(path.join(os.tmpdir(),'pee75-demo-'));
const asOf='2026-10-10T19:00:00Z';let calls=0;
try{
 const journal=new Phase75ResearchJournal(path.join(temp,'research.json'));
 const worker={execution:'local_only',capability:'category_identity',async run(task,date){calls++;
  return {outcome:'research_material_collected',sourceReferences:[{referenceId:'fixture_source',sourceId:'fixture_org',
   url:'https://fixture.org.uk/research',contentSha256:createHash('sha256').update('mock document').digest('hex'),observedAt:date}],
   questions:[],reasonCode:'fixture_reference_only'};}};
 const config={label:'Air purifiers',catalog:[],asOf,workers:[worker],journal,gaps:[],maxTasks:1};
 const first=await runPhase75Research(config);
 const second=await runPhase75Research(config);
 console.log(JSON.stringify({phase:75,fixtureOnly:true,firstExecution:first.executed.actualWorkExecuted,
  secondExecution:second.executed.actualWorkExecuted,workerCalls:calls,persistedRevision:second.persistedRevision,
  pendingTasks:second.pendingTaskIds,articleTextStored:false,productionDatabaseConnected:false,
  rankable:false},null,2));
}finally{await rm(temp,{recursive:true,force:true});}
