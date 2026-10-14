/** Phase 77: loopback integration adapter for already classified/confirmed needs.
 * Requires a trusted application's intake guard. No natural language AI is executed here.
 * TLS, identity, anti-abuse, CSRF/origin controls and notifications belong to the host.
 */
import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';
import {validateDemand,demandScopeHash,type StructuredDemand} from './phase77_decision_research.js';
import {Phase77ProgressLedger} from './phase77_progress_ledger.js';
import {assessResearchAdequacy,type ReviewedSearchAudit,type OptionPublicationApproval} from './phase78_search_adequacy.js';
import {customerResearchUpdate} from './phase78_user_updates.js';
import type {PortfolioAudit} from './phase77_decision_research.js';
export function createPhase77HttpApi(input:{ledger:Phase77ProgressLedger;
 authorizeIntake:(req:IncomingMessage)=>Promise<boolean>;
 /** Trusted backend only. Public submissions must never supply these approvals. */
 getReviewedResearch?:(context:{requestId:string;scopeHash:string})=>Promise<{
  portfolio:PortfolioAudit;audit:ReviewedSearchAudit;publicationApproval:OptionPublicationApproval|null
 }|null>;
 sharedKnowledgeEnabled?:boolean;}){
 const send=(res:ServerResponse,status:number,data:object)=>{
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
   'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
  res.end(JSON.stringify(data));
 };
 return createServer(async(req:IncomingMessage,res:ServerResponse)=>{
  try{
   if(req.method==='POST'&&req.url==='/v2/decision-research'){
    if(!await input.authorizeIntake(req))return send(res,403,{error:'intake_not_authorized'});
    if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'json_required'});
    const chunks:Buffer[]=[];let total=0;
    for await(const part of req){const b=Buffer.from(part);total+=b.length;
     if(total>4096)return send(res,413,{error:'request_too_large'});
     chunks.push(b);
    }
    let data:unknown;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}
    catch{return send(res,400,{error:'invalid_json'});}
    try{validateDemand(data as StructuredDemand);}catch{return send(res,422,{error:'structured_intent_required'});}
    const demand=data as StructuredDemand;
    const output=await input.ledger.submit(demandScopeHash(demand),demand.mode);
    return send(res,202,{...output,checkUrl:`/v2/decision-research/${output.view.requestId}`});
   }
   const match=req.url?.match(/^\/v2\/decision-research\/(req_[0-9a-f]{32})$/);
   if(req.method==='GET'&&match){
    const authorization=req.headers.authorization;
    const token=authorization?.startsWith('Bearer ')?authorization.slice(7):'';
    const context=await input.ledger.authorizedContext(match[1],token);
    if(!context)return send(res,404,{error:'not_found'});
    let coverage=null;
    if(input.getReviewedResearch){
     // If the evidence service is unavailable, the customer still sees verified stage receipts,
     // but receives NO unverified claims about portfolio coverage.
     try{
      const record=await input.getReviewedResearch({requestId:match[1],scopeHash:context.scopeHash});
      if(record&&demandScopeHash(record.portfolio.demand)===context.scopeHash)
       coverage=assessResearchAdequacy(record.portfolio,record.audit,record.publicationApproval);
     }catch{coverage=null;}
    }
    return send(res,200,{...context.view,customerUpdate:customerResearchUpdate(
     context.view,coverage,input.sharedKnowledgeEnabled===true)});
   }
   return send(res,404,{error:'not_found'});
  }catch{return send(res,503,{error:'temporarily_unavailable'});}
 });
}
