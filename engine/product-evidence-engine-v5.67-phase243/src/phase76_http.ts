/** Loopback HTTP adapter demonstrating what the site would call. The hosting
 * application must supply authentication, abuse controls, CSRF/origin policy,
 * TLS and rate limiting before making this public. No model/tool execution in handlers.
 */
import {createServer,type IncomingMessage,type ServerResponse} from 'node:http';
import type {CategoryIdentity} from './category_cognitive_mesh.js';
import {Phase76RequestQueue} from './phase76_request_queue.js';
export function createPhase76HttpApi(input:{queue:Phase76RequestQueue;catalog:readonly CategoryIdentity[]}){
 const send=(res:ServerResponse,status:number,body:object)=>{
  res.writeHead(status,{'Content-Type':'application/json; charset=utf-8',
   'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
   'Referrer-Policy':'no-referrer'});res.end(JSON.stringify(body));
 };
 return createServer(async(req:IncomingMessage,res:ServerResponse)=>{
  try{
   if(req.method==='POST'&&req.url==='/v1/research-requests'){
    // Must be a same-origin, authenticated application request in production.
    const type=req.headers['content-type'];
    if(typeof type!=='string'||!type.startsWith('application/json'))return send(res,415,{error:'json_required'});
    let body='';for await(const chunk of req){body+=chunk;
     if(body.length>4096)return send(res,413,{error:'request_too_large'});}
    let data:unknown;try{data=JSON.parse(body);}catch{return send(res,400,{error:'invalid_json'});}
    if(!data||typeof data!=='object'||Array.isArray(data)||
      typeof (data as Record<string,unknown>).categoryLabel!=='string'||
      typeof (data as Record<string,unknown>).useCaseKey!=='string')
      return send(res,400,{error:'invalid_request'});
    const {categoryLabel,useCaseKey,productLabel}=data as {categoryLabel:string;useCaseKey:string;productLabel?:string};
    if(productLabel!==undefined&&typeof productLabel!=='string')return send(res,400,{error:'invalid_product_label'});
    const result=await input.queue.submit({categoryLabel,useCaseKey,productLabel,catalog:input.catalog});
    if('kind'in result)return send(res,422,result);
    return send(res,202,{...result,checkUrl:`/v1/research-requests/${result.view.requestId}`});
   }
   const match=req.url?.match(/^\/v1\/research-requests\/(req_[0-9a-f]{32})$/);
   if(req.method==='GET'&&match){
    const auth=req.headers.authorization??'';
    const token=auth.startsWith('Bearer ')?auth.slice(7):'';
    const state=await input.queue.publicStatus(match[1],token);
    return state?send(res,200,state):send(res,404,{error:'not_found'});
   }
   return send(res,404,{error:'not_found'});
  }catch{return send(res,503,{error:'temporarily_unavailable'});}
 });
}
