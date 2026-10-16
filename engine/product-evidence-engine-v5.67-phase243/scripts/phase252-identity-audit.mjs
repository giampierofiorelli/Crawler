#!/usr/bin/env node
/** Phase252 — product identity audit of the knowledge store, and the verified corrections.
 * Audit (read-only): products whose own pages (role main_product) carry different URL model codes (collisions);
 * name-only identities whose page URL carries a model code absent from the name (collision risk, kept apart at ingest
 * since Phase252); products known only from comparison tables; product-line names ("2000 Series") recorded as products;
 * same host and same name in several products (false-split candidates). The output holds ids, names, URLs and counts,
 * never declaration values.
 * Correction (--apply 1 --verified FILE): runs KnowledgeStore246.splitProductIdentity252 for each verified collision.
 * Usage: node scripts/phase252-identity-audit.mjs [--db FILE] [--out FILE] [--apply 1 --verified FILE]
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve,join} from 'node:path';import {homedir} from 'node:os';
import {KnowledgeStore246,urlModelToken252} from '../dist/src/phase246_knowledge_store.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const db=F.db??join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local','share','product-evidence-engine','knowledge'),'pee246.sqlite');
const store=new KnowledgeStore246(resolve(db));
function audit(){
 const P=store.db.prepare('SELECT product_id,key_basis,name,declared_model,identity_state FROM products').all();
 const src=store.db.prepare('SELECT ps.product_id,ps.role,r.url,r.revision_id FROM product_sources ps JOIN revisions r USING(revision_id)').all();
 const nDecl=Object.fromEntries(store.db.prepare('SELECT product_id,count(*) n FROM declarations GROUP BY product_id').all().map(r=>[r.product_id,r.n]));
 const by={};for(const s of src)(by[s.product_id]??=[]).push(s);
 const out={collisions:[],nameWithoutModel:[],tableOnly:[],productLines:[],sameNameSeveralProducts:[]};
 const key={};
 for(const p of P){if(['merged','unsupported_after_rederivation'].includes(p.identity_state))continue;
  const own=(by[p.product_id]??[]).filter(s=>s.role==='main_product');const urls=[...new Set(own.map(s=>s.url))];
  const models=[...new Set(urls.map(urlModelToken252).filter(Boolean))].sort();
  const row={productId:p.product_id,keyBasis:p.key_basis,name:p.name,declaredModel:p.declared_model,ownPages:urls,declarations:nDecl[p.product_id]??0};
  if(models.length>1)out.collisions.push({...row,models});
  else if(p.key_basis==='host_name'&&models.length===1&&!((p.name??'')+(p.declared_model??'')).toLowerCase().replace(/[^a-z0-9]/g,'').includes(models[0]))out.nameWithoutModel.push({...row,urlModel:models[0]});
  if(!own.length&&(by[p.product_id]??[]).length)out.tableOnly.push({...row,namedOn:[...new Set(by[p.product_id].map(s=>s.url))]});
  if(/\b(?:series|range|collection|line)\s*$/i.test(p.name??''))out.productLines.push(row);
  const host=(()=>{try{return new URL((by[p.product_id]??[])[0]?.url).host;}catch{return null;}})();
  if(host&&p.name){const k=host+'|'+p.name.toLowerCase().replace(/\s+/g,' ').trim();(key[k]??=[]).push(p.product_id);}
 }
 out.sameNameSeveralProducts=Object.entries(key).filter(([,v])=>v.length>1).map(([k,v])=>({hostAndName:k,products:v}));
 return {products:P.length,...out,counts:Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v.length]))};
}
const before=audit();const applied=[];
if(F.apply){
 const V=JSON.parse(readFileSync(resolve(F.verified),'utf8'));
 for(const v of V.splits){
  const revs=store.db.prepare(`SELECT ps.revision_id r FROM product_sources ps JOIN revisions r USING(revision_id) WHERE ps.product_id=? AND ps.role='main_product' AND r.url=?`).all(v.productId,v.move.url).map(x=>x.r);
  const id=store.splitProductIdentity252(v.productId,{revisionIds:revs,movedModel:v.move.model,keptModel:v.keep.model,reason:'identity_name_shared_by_model_pages',detail:v.evidence.slice(0,300)});
  applied.push({from:v.productId,to:id,movedRevisions:revs.length,movedDeclarations:store.declarations246(id).length,keptDeclarations:store.declarations246(v.productId).length});
 }
}
const after=F.apply?audit():null;store.close();
const report={schema:'pee252.identity-audit.v1',auditedAt:new Date().toISOString(),note:'ids, names, URLs and counts only; no declaration values',before,applied,afterCounts:after?.counts??null};
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify({before:before.counts,applied,after:after?.counts??null}));
