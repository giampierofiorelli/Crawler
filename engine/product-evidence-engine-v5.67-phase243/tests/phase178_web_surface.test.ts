import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createPhase178Server} from '../src/phase178_site_server.js';
import type http from 'node:http';

const baseAssets='web/phase178';
async function withServer(fn:(base:string)=>Promise<void>){
 const server=createPhase178Server(baseAssets);
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const adr=server.address();assert(adr&&typeof adr!=='string');
 try{await fn(`http://127.0.0.1:${adr.port}`);}finally{await new Promise<void>((res,rej)=>server.close(e=>e?rej(e):res()));}
}
async function post(base:string,path:string,body:unknown,opts:Record<string,string>={}){
 const r=await fetch(base+path,{method:'POST',headers:{'content-type':'application/json',...opts},body:JSON.stringify(body)});
 return {status:r.status,data:await r.json()};
}
async function fresh(base:string){const r=await post(base,'/api/create',{});assert.equal(r.status,200);return r.data;}
const initial=(s:Record<string,any>)=>({session:s.session,expectedRevision:s.snapshot.revision});
const propose=(text:string)=>text;

test('phase178 GET loads a real English browser page, not a chatbot transcript',async()=>withServer(async base=>{
 const r=await fetch(base+'/');assert.equal(r.status,200);const html=await r.text();
 for(const x of ['<html lang="en">','id="intake-form"','id="candidates"','id="confirmed"','id="undo"','id="safety"','id="products-status"','id="scope-form"','id="inactive"'])assert.ok(html.includes(x),x);
 assert.match(html,/No professional product tests/);assert.ok(!html.includes('<script>'));
 assert.match(String(r.headers.get('content-security-policy')),/script-src 'self'/);
}));
test('phase178 includes a self-hosted English JS frontend and responsive CSS',async()=>withServer(async base=>{
 for(const file of ['/app.js','/style.css']){const r=await fetch(base+file);assert.equal(r.status,200);assert.ok((await r.text()).length>800);} 
 const css=await (await fetch(base+'/style.css')).text();assert.ok(css.includes('@media(max-width:760px)'));
}));
test('phase178 refuses arbitrary file access',async()=>withServer(async base=>{
 const r=await fetch(base+'/package.json');assert.equal(r.status,404);
}));
test('phase178 starts unconfirmed with ranking and exclusions forbidden',async()=>withServer(async base=>{
 const s=await fresh(base);assert.equal(s.snapshot.revision,0);assert.equal(s.snapshot.rankingAuthorized,false);
 assert.equal(s.snapshot.exclusionsAuthorized,false);assert.equal(s.rankingStatus,'not_available');
 assert.deepEqual(s.realProductComparisons,[]);assert.equal(s.canUndo,false);
}));
test('phase178 English intake proposes needs but cannot confirm them',async()=>withServer(async base=>{
 const s=await fresh(base);const r=await post(base,'/api/intake',{...initial(s),text:'I need a water filter for PFAS and lead.'});
 assert.equal(r.status,200);assert.ok(r.data.snapshot.revision>=1);
 assert.equal(r.data.snapshot.criteria.every((x:any)=>x.status==='candidate'),true);
 assert.equal(r.data.snapshot.rankingAuthorized,false);assert.equal(r.data.snapshot.exclusionsAuthorized,false);
 assert.equal(r.data.originalRequest,'I need a water filter for PFAS and lead.');
}));
test('phase178 explicitly confirms candidate only by user action',async()=>withServer(async base=>{
 const s=await fresh(base);const a=(await post(base,'/api/intake',{...initial(s),text:'I need a water filter for PFAS.'})).data;
 assert.ok(a.snapshot.criteria.length>0);
 const c=a.snapshot.criteria[0];
 const b=await post(base,'/api/action',{...initial({...a,session:s.session}),action:{type:'confirm_candidate',source:'user_web_control',key:c.key,priority:'hard'}});
 assert.equal(b.status,200);const z=b.data.snapshot.criteria.find((x:any)=>x.key===c.key);
 assert.equal(z.status,'confirmed');assert.equal(z.priority,'hard');assert.equal(b.data.snapshot.exclusionsAuthorized,false);
 assert.ok(b.data.view.visibleCautions.some((x:string)=>x.includes('Essential requirements')));
}));
test('phase178 one-step Undo restores confirmed ranking inputs',async()=>withServer(async base=>{
 const s=await fresh(base);const a=(await post(base,'/api/action',{...initial(s),action:{type:'set_criterion',source:'user_web_control',key:'cleaning',label:'Easy to clean',value:{kind:'boolean',value:true},priority:'normal'}})).data;
 assert.equal(a.changes.changeInConfirmedInputs,true);
 const u=await post(base,'/api/undo',{...initial({...a,session:s.session})});
 assert.equal(u.status,200);assert.equal(u.data.snapshot.criteria.length,0);
 assert.equal(u.data.snapshot.rankInputFingerprint,s.snapshot.rankInputFingerprint);
 assert.equal(u.data.canUndo,false);assert.ok(u.data.snapshot.revision>a.snapshot.revision);
}));
test('phase178 changes of priority are real state revisions and undoable',async()=>withServer(async base=>{
 const s=await fresh(base);const a=(await post(base,'/api/action',{...initial(s),action:{type:'set_criterion',source:'user_web_control',key:'budget',label:'Maximum budget',value:{kind:'quantity',value:200,unit:'gbp'},priority:'normal'}})).data;
 const b=await post(base,'/api/action',{...initial({...a,session:s.session}),action:{type:'set_priority',source:'user_web_control',key:'budget',priority:'hard'}});
 assert.equal(b.status,200);assert.equal(b.data.changes.changeInConfirmedInputs,true);assert.equal(b.data.snapshot.criteria[0].priority,'hard');
}));
test('phase178 changing product area is explicit and never auto-inferred',async()=>withServer(async base=>{
 const s=await fresh(base);
 const r=await post(base,'/api/action',{...initial(s),action:{type:'set_scope',source:'user_web_control',scope:{task:'product_selection',category:'pasta_maker'}}});
 assert.equal(r.status,200);assert.equal(r.data.snapshot.scope.category,'pasta_maker');assert.equal(r.data.snapshot.rankingAuthorized,false);
}));
test('phase178 accepts additional English text without overriding a confirmed edit',async()=>withServer(async base=>{
 const s=await fresh(base),a=(await post(base,'/api/action',{...initial(s),action:{type:'set_criterion',source:'user_web_control',key:'f.cleaning',label:'Easy to clean',value:{kind:'boolean',value:true},priority:'hard'}})).data;
 const b=await post(base,'/api/intake',{...initial({...a,session:s.session}),text:'I need a pasta machine that is easy to clean.'});
 assert.equal(b.status,200);assert.equal(b.data.snapshot.criteria.find((c:any)=>c.key==='f.cleaning').priority,'hard');
}));
test('phase178 preserves unmapped goal as raw text (rigatoni)',async()=>withServer(async base=>{
 const s=await fresh(base);const r=await post(base,'/api/intake',{...initial(s),text:'I want to make rigatoni.'});
 assert.equal(r.status,200);assert.equal(r.data.originalRequest,'I want to make rigatoni.');assert.equal(r.data.snapshot.rankingAuthorized,false);
}));
test('phase178 refuses untrusted linguistic auto-confirmation',async()=>withServer(async base=>{
 const s=await fresh(base);const r=await post(base,'/api/action',{...initial(s),action:{type:'set_criterion',source:'english_intake_candidate',key:'budget',label:'Cheap',value:{kind:'boolean',value:true},priority:'hard'}});
 assert.equal(r.status,422);const v=(await post(base,'/api/action',{...initial(s),action:{type:'set_scope',source:'user_web_control',scope:{task:'unresolved',category:null}}}));assert.equal(v.status,200);assert.equal(v.data.snapshot.revision,1);
}));
test('phase178 rejects stale browser writes with no silent overwrite',async()=>withServer(async base=>{
 const s=await fresh(base);const a=(await post(base,'/api/action',{...initial(s),action:{type:'set_criterion',source:'user_web_control',key:'quiet',label:'Quiet operation',value:{kind:'boolean',value:true},priority:'normal'}})).data;
 const stale=await post(base,'/api/action',{...initial(s),action:{type:'set_scope',source:'user_web_control',scope:{task:'product_selection',category:'kettle'}}});
 assert.equal(stale.status,409);assert.equal(stale.data.snapshot.stateHash,a.snapshot.stateHash);
}));
test('phase178 blocks external Origin header',async()=>withServer(async base=>{
 const s=await fresh(base);const r=await post(base,'/api/undo',{...initial(s)},{origin:'https://evil.example'});assert.equal(r.status,403);
}));
test('phase178 blocks cross-site fetch metadata',async()=>withServer(async base=>{
 const s=await fresh(base);const r=await post(base,'/api/undo',{...initial(s)},{'sec-fetch-site':'cross-site'});assert.equal(r.status,403);
}));
test('phase178 unknown sessions and no undo are rejected',async()=>withServer(async base=>{
 const s=await fresh(base);const r=await post(base,'/api/undo',{...initial(s)});assert.equal(r.status,422);
 const missing=await post(base,'/api/undo',{session:'invalid',expectedRevision:0});assert.equal(missing.status,404);
}));
test('phase178 rejects inappropriate or invalid browser edits',async()=>withServer(async base=>{
 const s=await fresh(base);for(const action of [{type:'mark_criterion',source:'user_web_control',key:'absent',status:'withdrawn'},
  {type:'set_criterion',source:'user_web_control',key:'__proto__',label:'Unsafe',value:{kind:'choice',value:'x'},priority:'hard'}]){
  const r=await post(base,'/api/action',{...initial(s),action});assert.equal(r.status,422);
 }
}));
test('phase178 result contains no fictional products, scores or model winners',async()=>withServer(async base=>{
 const s=await fresh(base);assert.equal(s.realProductComparisons.length,0);
 assert.equal(s.view.showVerifiedRankedProducts,false);
 assert.equal(s.snapshot.engineeringEvidenceVerified,false);
 assert.ok(s.seriousLimits[0].includes('No product suitability'));
}));
test('phase178 quote-as-review is not user-confirmed requirement',async()=>withServer(async base=>{
 const s=await fresh(base);const r=await post(base,'/api/intake',{...initial(s),text:'The reviewer wrote "I want to remove lead from tap water".'});
 assert.equal(r.status,200);assert.equal(r.data.snapshot.criteria.some((c:any)=>c.status==='confirmed'),false);
}));
test('phase178 does not leak a session into a separate session',async()=>withServer(async base=>{
 const s=await fresh(base);await post(base,'/api/action',{...initial(s),action:{type:'set_criterion',source:'user_web_control',key:'secret',label:'Private preference',value:{kind:'choice',value:'private'},priority:'normal'}});
 const t=await fresh(base);assert.equal(t.snapshot.criteria.length,0);
}));

test('phase178 makes possible missed decisive requirements visible',async()=>withServer(async base=>{
 const s=await fresh(base);const a=await post(base,'/api/intake',{...initial(s),text:'I need a water filter for PFAS and lead.'});
 assert.equal(a.status,200);assert.equal(a.data.interpretationCompleteness,'not_independently_verified');
 assert.ok(a.data.seriousLimits.some((x:string)=>x.includes('decisive needs may be missing')));
 assert.equal(a.data.snapshot.rankingAuthorized,false);
}));
