import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,urlModelToken252,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {candidatesFromStore249} from '../src/phase249_decision.js';
// Phase252 T1 tests for product identity. Pages, products and values are synthetic fixtures, never real-world evidence.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee252-'));
const AT='2026-10-16T12:00:00.000Z';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const SRC:SourceInput246={sourceId:'src_maker',host:'maker.example',sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'};
const page=(name:string,watts:string)=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@type':'Product',name})}</script></head>
 <body><main><h1>${name}</h1><p>Specifications for this product, as declared by its maker on this page.</p><table><tr><th>Capacity</th><td>20 L</td></tr><tr><th>Power</th><td>${watts}</td></tr></table></main></body></html>`;
const ingest=(s:KnowledgeStore246,url:string,html:string)=>s.ingestObservation246({source:SRC,url,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:AT,runId:'r1',extractorVersion:'spec-extractor-7',extraction:extractSpecifications245(html,url),categoryHypotheses:['microwave_ovens']});
const store=()=>new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'),CLASS);
const owner=(s:KnowledgeStore246,url:string)=>(s.db.prepare("SELECT ps.product_id p FROM product_sources ps JOIN revisions r USING(revision_id) WHERE r.url=? AND ps.role='main_product'").get(url) as {p:string}).p;
const rev=(s:KnowledgeStore246,url:string)=>(s.db.prepare('SELECT revision_id r FROM revisions WHERE url=?').get(url) as {r:string}).r;

test('urlModelToken252 reads one model code from the last path segment, else nothing',()=>{
 assert.equal(urlModelToken252('https://www.sharp.example/microwaves/qs204aeb/'),'qs204aeb');
 assert.equal(urlModelToken252('https://numatic.example/products/henry-cordless-hvb160/'),'hvb160');
 assert.equal(urlModelToken252('https://maker.example/products/microwave-oven/'),null);
 assert.equal(urlModelToken252('https://maker.example/p/ab12x-cd34y'),null);
 assert.equal(urlModelToken252('https://maker.example/product/2135'),null);
});
test('two model pages sharing a generic name are kept apart at ingest, with a gap; a page still resolves to its own product',()=>{
 const s=store();const A='https://maker.example/microwaves/ab12x/',B='https://maker.example/microwaves/cd34y/';
 ingest(s,A,page('20 Litre Microwave Oven','800 W'));ingest(s,B,page('20 Litre Microwave Oven','700 W'));
 assert.notEqual(owner(s,A),owner(s,B));
 assert.equal(s.product246(owner(s,B))!.keyBasis,'host_model');
 assert.ok(s.db.prepare("SELECT 1 FROM research_gaps WHERE kind='identity_name_shared_by_model_pages'").get());
 ingest(s,B,page('20 Litre Microwave Oven','750 W')); // a new revision of page B
 assert.equal(new Set((s.db.prepare("SELECT ps.product_id p FROM product_sources ps JOIN revisions r USING(revision_id) WHERE r.url=?").all(B) as {p:string}[]).map(r=>r.p)).size,1);
 s.close();
});
test('a recorded collision is split by whole page, journaled, reversible, and never empties the original',()=>{
 const s=store();const A='https://maker.example/microwaves/ab12x/',B='https://maker.example/microwaves/page-two/';
 ingest(s,A,page('20 Litre Microwave Oven','800 W'));ingest(s,B,page('20 Litre Microwave Oven','700 W')); // no code in B's URL: merged as before Phase252
 const pid=owner(s,A);assert.equal(owner(s,B),pid);
 const before=s.declarations246(pid).length;
 assert.throws(()=>s.splitProductIdentity252(pid,{revisionIds:[rev(s,A),rev(s,B)],movedModel:'cd34y',keptModel:'ab12x',reason:'test_split',detail:'synthetic'},AT),/252_split_must_keep/);
 const nid=s.splitProductIdentity252(pid,{revisionIds:[rev(s,B)],movedModel:'cd34y',keptModel:'ab12x',reason:'test_split',detail:'title and URL model codes differ'},AT);
 assert.equal(s.declarations246(nid).length+s.declarations246(pid).length,before);
 assert.ok(s.declarations246(nid).length>0&&s.declarations246(nid).every(d=>d.revisionId===rev(s,B)));
 assert.equal(s.product246(nid)!.declaredModel,'CD34Y');assert.equal(s.product246(pid)!.declaredModel,'AB12X');
 assert.equal(JSON.parse((s.db.prepare("SELECT payload_json FROM events WHERE kind='product_identity_split'").get() as {payload_json:string}).payload_json).to,nid);
 assert.equal(s.reverseProductSplit252(nid,'test_reversal',AT),true);assert.equal(s.reverseProductSplit252(nid,'test_reversal',AT),false);
 assert.equal(s.declarations246(pid).length,before);assert.ok(!s.products246().includes(nid));
 s.close();
});
test('the identity warning counts only the product\'s own model pages, not tables that name it elsewhere',()=>{
 const s=store();const A='https://maker.example/microwaves/ab12x/',B='https://maker.example/microwaves/page-two/',T='https://maker.example/compare/zz99q/';
 ingest(s,A,page('20 Litre Microwave Oven','800 W'));ingest(s,B,page('20 Litre Microwave Oven','700 W'));ingest(s,T,page('Other Oven','900 W'));
 const pid=owner(s,A);
 s.db.prepare("INSERT INTO product_sources VALUES (?,?,'named_in_table')").run(pid,rev(s,T));
 const w=()=>candidatesFromStore249(s,'microwave_ovens').find(c=>c.productId===pid)!.identityWarning;
 assert.equal(w(),null);
 s.db.prepare('UPDATE revisions SET url=? WHERE revision_id=?').run('https://maker.example/microwaves/cd34y/',rev(s,B)); // a second own model page
 assert.match(w()!,/2 model pages \(ab12x, cd34y\)/);
 s.close();
});
