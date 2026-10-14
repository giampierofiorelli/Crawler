/** Offline proof: real queue and persisted journal; fictional source reference.
 * It does NOT imply an AI model or live internet was contacted. */
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';import path from 'node:path';
import {createHash} from 'node:crypto';
import {Phase76RequestQueue} from '../dist/src/phase76_request_queue.js';
import {Phase75ResearchJournal} from '../dist/src/phase75_memory.js';
import {workNextUserRequest} from '../dist/src/phase76_service.js';
const dir=await mkdtemp(path.join(os.tmpdir(),'pee76-'));
try{
 const queue=new Phase76RequestQueue(path.join(dir,'requests.json'));
 const journal=new Phase75ResearchJournal(path.join(dir,'journal.json'));
 const request=await queue.submit({categoryLabel:'Pet air purifiers',useCaseKey:'allergy_friendly',catalog:[]});
 if('kind'in request)throw Error('Unexpected intake result');
 const noWorker=await workNextUserRequest({queue,journal,catalog:[],workers:[],gaps:[]});
 const duplicate=await queue.submit({categoryLabel:'Pet air purifiers',useCaseKey:'allergy_friendly',catalog:[]});
 console.log(JSON.stringify({scenario:'unknown_category_request',simulatedSourcesOnly:true,
  firstStatus:request.view.status,afterWorkerUnavailable:noWorker.view.status,
  duplicateReusesRequestId:!('kind'in duplicate)&&duplicate.view.requestId===request.view.requestId,
  independentReviewRequired:true,realModelConnected:false,publicWebsiteConnected:false},null,2));
}finally{await rm(dir,{recursive:true,force:true});}
