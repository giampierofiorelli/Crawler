/** Phase178 local web prototype. 127.0.0.1 only, in-memory anonymous sessions.
 * It exposes existing Phase177 decision actions, never product scoring. NOT production security. */
import http, {type IncomingMessage,type ServerResponse} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createDecision177,applyDecisionAction177,undoDecision177,compareDecisions177,
 type DecisionSnapshot177,type DecisionAction177,assertDecisionSnapshot177} from './phase177_decision_snapshot.js';
import {reviewedFirstAnswer180,type SignedRelease180,type TrustedRankingAuthority180} from './phase180_reviewed_first_answer.js';
import {dynamicKnowledgeAnswer181,type SignedCatalog181} from './phase181_dynamic_knowledge_ranking.js';
import {proposeWebIntake177,proposeIntakeOnDecision177,renderWebDecision177} from './phase177_web_intake.js';

export interface Phase178Session { current:DecisionSnapshot177; parent:DecisionSnapshot177|null; originalRequest:string|null; lastIntakeIssues:readonly string[]; }
export const MAX_PHASE178_SESSIONS=80;
const MAX_BYTES=8192;
const mime:Record<string,string>={'/':'text/html; charset=utf-8','/index.html':'text/html; charset=utf-8',
 '/app.js':'text/javascript; charset=utf-8','/style.css':'text/css; charset=utf-8'};
const names:Record<string,string>={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css'};
function send(res:ServerResponse,status:number,obj:unknown){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(obj));}
function invalidMessage(e:unknown){const s=String(e instanceof Error?e.message:e);return /^phase17[78]_/.test(s)?s:'invalid_request';}
async function body(req:IncomingMessage):Promise<Record<string,unknown>>{
 if(!/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type']??'')))throw Error('phase178_json_only');
 let size=0,text='';for await(const buf of req){size+=buf.length;if(size>MAX_BYTES)throw Error('phase178_payload_too_large');text+=buf.toString('utf8');}
 let data:unknown;try{data=JSON.parse(text)}catch{throw Error('phase178_invalid_json')}
 if(data===null||Array.isArray(data)||typeof data!=='object'||Object.getPrototypeOf(data)!==Object.prototype)throw Error('phase178_invalid_body');
 return data as Record<string,unknown>;
}
export interface PublicationConfig180 {
 /** Provisioned by the local server operator, not accepted from the requester. */
 authority:TrustedRankingAuthority180; releases:readonly SignedRelease180[];
}
export interface KnowledgeConfig181 {
 /** Catalogs are independently reviewed, offline-signed PRODUCT OBSERVATIONS.
  * They contain no prepared ranking; never accept one from the browser. */
 authority:TrustedRankingAuthority180; catalogs:readonly SignedCatalog181[];
}
function project(s:Phase178Session,publication:PublicationConfig180|null,knowledge:KnowledgeConfig181|null){
 const current=s.current;assertDecisionSnapshot177(current);
 const prior=s.parent;const changed=prior?compareDecisions177(prior,current):null;
 const matching=publication?.releases.find(x=>x.release?.categoryId===current.scope.category&&
  x.release?.rankInputFingerprint===current.rankInputFingerprint)??null;
 const cachedAnswer=reviewedFirstAnswer180(current,matching,
  (publication?{...publication.authority,asOf:new Date().toISOString()}:null)??{asOf:'2026-10-12T18:00:00Z',market:'uk',publicKeys:{}});
 const signedKnowledge=knowledge?.catalogs.find(x=>x.catalog?.categoryId===current.scope.category)??null;
 const dynamicAnswer=knowledge?dynamicKnowledgeAnswer181({snapshot:current,catalog:signedKnowledge,
  authority:{...knowledge.authority,asOf:new Date().toISOString()}}):null;
 const firstAnswer=dynamicAnswer?.status==='ranking_ready'?dynamicAnswer:
  cachedAnswer.status==='ranking_ready'?cachedAnswer:dynamicAnswer??cachedAnswer;
 const rankingStatus=firstAnswer.status==='ranking_ready'?
  firstAnswer===dynamicAnswer?'dynamic_product_knowledge':'reviewed_release':'not_available';
 return {snapshot:current,view:renderWebDecision177(current),originalRequest:s.originalRequest,intakeIssues:s.lastIntakeIssues,
    canUndo:Boolean(prior),changes:changed,firstAnswer,rankingStatus,realProductComparisons:firstAnswer.ranked,
    interpretationCompleteness:'not_independently_verified',
    seriousLimits:[...(s.originalRequest?['Interpretation may be incomplete. Compare all suggested criteria with your original request: decisive needs may be missing.']:[]),
    ...(firstAnswer.status==='ranking_ready'?firstAnswer.visibleCautions:['No product suitability or ranking is authorised for this decision. Verified product evidence is not connected.',...firstAnswer.visibleCautions])]};
}
/** Export for deterministic testing and explicit lifecycle shutdown. */
export function createPhase178Server(assetsRoot=resolve(process.cwd(),'web/phase178'),publication:PublicationConfig180|null=null,knowledge:KnowledgeConfig181|null=null){
 if(publication){
  if(!Array.isArray(publication.releases)||publication.releases.length>200)throw Error('phase180_invalid_publication_config');
  const keys=publication.releases.map(r=>`${r.release?.categoryId}:${r.release?.rankInputFingerprint}`);
  if(new Set(keys).size!==keys.length)throw Error('phase180_duplicate_precomputed_release');
 }
 if(knowledge){
  if(!Array.isArray(knowledge.catalogs)||knowledge.catalogs.length>300)throw Error('phase181_invalid_knowledge_config');
  const ids=knowledge.catalogs.map(x=>`${x.catalog?.market}:${x.catalog?.categoryId}`);
  if(new Set(ids).size!==ids.length)throw Error('phase181_duplicate_catalog');
 }
 const sessions=new Map<string,Phase178Session>();
 const server=http.createServer(async(req,res)=>{
  const host=String(req.headers.host??'');
  const url=new URL(req.url??'/',`http://${host||'localhost'}`);
  const origin=req.headers.origin;
  try{
   // Local development demo only. Fail-closed if not served on loopback.
   if(!/^(127\.0\.0\.1|localhost):\d+$/.test(host))return send(res,403,{error:'phase178_loopback_only'});
   if(origin&&origin!==`http://${host}`)return send(res,403,{error:'phase178_wrong_origin'});
   if(req.method==='GET'){
    if(!Object.prototype.hasOwnProperty.call(names,url.pathname))return send(res,404,{error:'not_found'});
    const file=await readFile(resolve(assetsRoot,names[url.pathname]));
    res.writeHead(200,{'content-type':mime[url.pathname],'cache-control':'no-store',
     'x-content-type-options':'nosniff','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",'x-frame-options':'DENY'});
    res.end(file);return;
   }
   if(req.method!=='POST'||!url.pathname.startsWith('/api/'))return send(res,405,{error:'method_not_allowed'});
   if(req.headers['sec-fetch-site']&&req.headers['sec-fetch-site']!=='same-origin'&&req.headers['sec-fetch-site']!=='none')return send(res,403,{error:'phase178_cross_site_rejected'});
   const data=await body(req);
   if(url.pathname==='/api/create'){
    if(sessions.size>=MAX_PHASE178_SESSIONS)return send(res,429,{error:'phase178_session_cap'});
    const id=randomUUID(),s:Phase178Session={current:createDecision177('d'+randomUUID().replaceAll('-','')),parent:null,originalRequest:null,lastIntakeIssues:[]};
    sessions.set(id,s);return send(res,200,{session:id,...project(s,publication,knowledge)});
   }
   if(typeof data.session!=='string'||!sessions.has(data.session))return send(res,404,{error:'phase178_unknown_session'});
   const s=sessions.get(data.session)!;
   if(data.expectedRevision!==s.current.revision)return send(res,409,{error:'phase178_stale_revision',...project(s,publication,knowledge)});
   if(url.pathname==='/api/intake'){
    const intake=proposeWebIntake177(data.text as string);
    const next=proposeIntakeOnDecision177(s.current,intake);
    if(next!==s.current&&next.stateHash!==s.current.stateHash){s.parent=s.current;s.current=next;}
    s.originalRequest=intake.originalEnglishRequest;s.lastIntakeIssues=intake.unresolvedIssues;
    return send(res,200,project(s,publication,knowledge));
   }
   if(url.pathname==='/api/action'){
    const action=data.action as DecisionAction177;
    const next=applyDecisionAction177(s.current,action).snapshot;
    s.parent=s.current;s.current=next;return send(res,200,project(s,publication,knowledge));
   }
   if(url.pathname==='/api/undo'){
    if(!s.parent)return send(res,422,{error:'phase178_nothing_to_undo'});
    const prior=s.parent;s.current=undoDecision177(s.current,prior).snapshot;s.parent=null;
    return send(res,200,project(s,publication,knowledge));
   }
   return send(res,404,{error:'not_found'});
  }catch(e){const msg=invalidMessage(e);return send(res,msg==='phase178_payload_too_large'?413:422,{error:msg});}
 });
 return server;
}
