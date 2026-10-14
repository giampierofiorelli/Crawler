/** Phase92: signed append-only HTML-recipe lifecycle events and held-out validation.
 * This module never fetches URLs, runs a local model, stores HTML, or authorizes claims.
 * Trusted reviewer public keys must be provisioned outside the recipe store.
 */
import {createHash,createPublicKey,verify} from 'node:crypto';
import {spawn} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {ReviewedHtmlRecord} from './phase85_source_recipes.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
export const phase92Hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export function phase92Canonical(x:unknown):string{
 if(Array.isArray(x))return '['+x.map(phase92Canonical).join(',')+']';
 if(x&&typeof x==='object')return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+phase92Canonical((x as Record<string,unknown>)[k])).join(',')+'}';
 return JSON.stringify(x);
}
export type HtmlLifecycleEvent={
 kind:'html_lifecycle_v1';action:'suspend'|'supersede';
 scope:{host:string;prefix:string;category:string};
 previousDigest:string;previousRecordSha256:string;
 nextDigest:string|null;nextRecordSha256:string|null;
 occurredAt:string;
 heldOut:{manifestSha256:string;distinctModels:number;labelReceipts:string[]}|null;
 approval:{reviewer:string;receipt:string;signature:string};
};
export type HeldOutSample={url:string;model:string;html:string;labelledBy:string;
 expected:Record<string,{value:number;unit:string}>};
export type HeldOutProof=NonNullable<HtmlLifecycleEvent['heldOut']>;
/** The original qualification manifest's separately labelled reference data.
 * Required solely in memory to establish disjoint held-out models/URLs. */
export type QualificationReference={url:string;model:string;labelledBy:string;
 expected:Record<string,{value:number;unit:string}>};
/** Original Phase87 qualification digest must match these training references,
 * and no hold-out may reuse their model identity or URL. */
export function checkDisjointQualificationReferences(record:ReviewedHtmlRecord,
 training:readonly QualificationReference[],heldOut:readonly HeldOutSample[]):void{
 if(!Array.isArray(training)||training.length<2||training.length>6||
  training.length!==record.recipe.qualification.distinct_models)
  throw Error('Missing original qualification reference identities');
 const trainingModels=new Set<string>(),trainingUrls=new Set<string>(),labelReceipts=new Set<string>();
 const manifest:{url:string;model:string;expected:QualificationReference['expected']}[]=[];
 for(const ref of training){
  if(!ref||typeof ref.model!=='string'||ref.model.length<2||ref.model.length>120||
   typeof ref.url!=='string'||!receipt(ref.labelledBy)||
   !ref.expected||Object.keys(ref.expected).length!==record.recipe.mappings.length||
   ref.labelledBy===record.recipe.human_review.reviewer)
   throw Error('Invalid original qualification reference');
  let u:URL;
  try{u=new URL(ref.url);}catch{throw Error('Invalid original qualification URL');}
  if(u.protocol!=='https:'||u.hostname!==record.recipe.source_host||
   !(record.recipe.path_prefix.endsWith('/')?u.pathname.startsWith(record.recipe.path_prefix):
     u.pathname===record.recipe.path_prefix||u.pathname.startsWith(record.recipe.path_prefix+'/'))||
   u.username||u.password||u.port||u.hash)
   throw Error('Original qualification source mismatch');
  for(const mapping of record.recipe.mappings){
   const expected=ref.expected[mapping.field_key];
   if(!expected||!Number.isFinite(expected.value)||expected.unit!==mapping.unit)
    throw Error('Invalid original reference values');
  }
  const model=ref.model.trim().toLowerCase();
  if(trainingModels.has(model)||trainingUrls.has(ref.url))throw Error('Duplicate training model or URL');
  trainingModels.add(model);trainingUrls.add(ref.url);labelReceipts.add(ref.labelledBy);
  manifest.push({url:ref.url,model:ref.model,expected:ref.expected});
 }
 if(phase92Hash(phase92Canonical(manifest))!==(record.recipe.qualification as {reference_manifest_sha256?:unknown}).reference_manifest_sha256||
  phase92Canonical([...labelReceipts].sort())!==
   phase92Canonical([...record.recipe.qualification.independent_label_receipts].sort()))
  throw Error('Qualification reference manifest does not match approved recipe');
 for(const sample of heldOut){
  if(trainingModels.has(sample.model.trim().toLowerCase())||trainingUrls.has(sample.url))
   throw Error('Held-out page overlaps qualification samples');
 }
}

const digest=/^[a-f0-9]{64}$/;
const identity=(x:unknown)=>typeof x==='string'&&/^[a-z][a-z0-9_]{2,119}$/.test(x);
const receipt=(x:unknown)=>typeof x==='string'&&x.length>=8&&x.length<=160&&x.trim()===x;
export const htmlRecipeScope=(r:ReviewedHtmlRecord)=>({host:r.recipe.source_host,prefix:r.recipe.path_prefix,category:r.recipe.category});
export const htmlRecordDigest=(r:ReviewedHtmlRecord)=>phase92Hash(phase92Canonical(r));
export function phase92SigningMessage(event:HtmlLifecycleEvent):Buffer{
 // Signature is over every other property including qualification, predecessor and successor hashes.
 const {approval,...rest}=event;
 return Buffer.from(phase92Canonical({...rest,approval:{reviewer:approval.reviewer,receipt:approval.receipt}}),'utf8');
}
export function checkLifecycleEvent(e:HtmlLifecycleEvent,trustedReviewers:Readonly<Record<string,string>>):void{
 if(!e||e.kind!=='html_lifecycle_v1'||!['suspend','supersede'].includes(e.action)||
 !e.scope||typeof e.scope.host!=='string'||typeof e.scope.prefix!=='string'||typeof e.scope.category!=='string'||
 !digest.test(e.previousDigest)||!digest.test(e.previousRecordSha256)||
 (e.nextDigest!==null&&!digest.test(e.nextDigest))||(e.nextRecordSha256!==null&&!digest.test(e.nextRecordSha256))||
 !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(e.occurredAt)||
 !Number.isFinite(Date.parse(e.occurredAt))||!e.approval||!identity(e.approval.reviewer)||
 !receipt(e.approval.receipt)||typeof e.approval.signature!=='string'||
 !/^[A-Za-z0-9+/]{86}==$/.test(e.approval.signature)||
 (e.action==='suspend'&&(e.nextDigest!==null||e.nextRecordSha256!==null||e.heldOut!==null))||
 (e.action==='supersede'&&(!e.nextDigest||!e.nextRecordSha256||e.nextDigest===e.previousDigest||
 !e.heldOut||!digest.test(e.heldOut.manifestSha256)||
 !Number.isInteger(e.heldOut.distinctModels)||e.heldOut.distinctModels<2||e.heldOut.distinctModels>6||
 !Array.isArray(e.heldOut.labelReceipts)||e.heldOut.labelReceipts.length<1||
 e.heldOut.labelReceipts.some(x=>!receipt(x)))))throw Error('Invalid signed HTML lifecycle event');
 const pem=trustedReviewers[e.approval.reviewer];
 if(typeof pem!=='string'||!pem)throw Error('Untrusted HTML lifecycle reviewer');
 try{
  const signature=Buffer.from(e.approval.signature,'base64');
  if(signature.length!==64||!verify(null,phase92SigningMessage(e),createPublicKey(pem),signature))
   throw Error('Invalid lifecycle signature');
 }catch{throw Error('Invalid lifecycle signature');}
}
async function offlineExtract(record:ReviewedHtmlRecord,s:HeldOutSample):Promise<Record<string,{value:number;unit:string}>>{
 const input=JSON.stringify({recipe:record.recipe,url:s.url,model:s.model,html:s.html});
 if(Buffer.byteLength(input)>850_000)throw Error('Held-out sample cap');
 return await new Promise((resolvePromise,reject)=>{
  const process=spawn('python3',['-m','phase87.cli','extract'],{cwd:root,
   env:{...processEnv(),PYTHONPATH:root},stdio:['pipe','pipe','ignore'],shell:false});
  let output='',settled=false;
  const timer=setTimeout(()=>{process.kill();finish(Error('Held-out extraction timeout'));},12_000);
  const finish=(error?:Error,result?:Record<string,{value:number;unit:string}>)=>{
   if(settled)return;settled=true;clearTimeout(timer);
   if(error)reject(error);else resolvePromise(result!);
  };
  process.on('error',e=>finish(e));process.stdin.on('error',()=>{});
  process.stdout.on('data',(b:Buffer)=>{output+=b.toString('utf8');
   if(Buffer.byteLength(output)>30000){process.kill();finish(Error('Held-out output cap'));}});
  process.on('close',code=>{if(settled)return;
   try{const r=JSON.parse(output) as {ok:boolean;result:Record<string,{value:number;unit:string}>};
    if(code!==0||r.ok!==true)throw Error('Held-out extraction refused');
    finish(undefined,r.result);
   }catch{finish(Error('Held-out extraction refused'));}
  });
  process.stdin.end(input);
 });
}
function processEnv(){return process.env;}
/** Offline held-out independent labels are checked against actual deterministic Phase87 extraction.
 * Independence of annotators is attested, not magically proven by their names.
 * HTML and numeric expected measurements do NOT persist in the Phase85 store.
 */
export async function qualifyHtmlReplacementHeldOut(record:ReviewedHtmlRecord,samples:readonly HeldOutSample[]):Promise<HeldOutProof>{
 if(!Array.isArray(samples)||samples.length<2||samples.length>6)throw Error('Need 2–6 held-out pages');
 const models=new Set<string>(),urls=new Set<string>(),labels=new Set<string>();
 const meta:{url:string;model:string;referenceSha256:string;labelledBy:string}[]=[];
 for(const s of samples){
  if(!s||typeof s.url!=='string'||typeof s.model!=='string'||s.model.length<2||s.model.length>120||
   !receipt(s.labelledBy)||s.labelledBy===record.recipe.human_review.reviewer||
   typeof s.html!=='string'||Buffer.byteLength(s.html,'utf8')>750000||
   models.has(s.model.toLowerCase())||urls.has(s.url)||!s.expected||
   Object.keys(s.expected).length!==record.recipe.mappings.length)throw Error('Invalid held-out reference');
  models.add(s.model.toLowerCase());urls.add(s.url);labels.add(s.labelledBy);
  const extracted=await offlineExtract(record,s);
  if(Object.keys(extracted).length!==record.recipe.mappings.length)throw Error('Held-out incomplete extraction');
  for(const mapping of record.recipe.mappings){
   const observed=extracted[mapping.field_key],expected=s.expected[mapping.field_key];
   if(!observed||!expected||!Number.isFinite(expected.value)||
    observed.value!==expected.value||observed.unit!==expected.unit||expected.unit!==mapping.unit)
    throw Error('Held-out independently labelled mismatch');
  }
  meta.push({url:s.url,model:s.model,labelledBy:s.labelledBy,
   referenceSha256:phase92Hash(phase92Canonical(s.expected))});
 }
 return {manifestSha256:phase92Hash(phase92Canonical(meta)),distinctModels:models.size,
  labelReceipts:[...labels].sort()};
}
