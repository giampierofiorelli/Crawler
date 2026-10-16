import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {capacityFromName249,powerFromName249,axisValue249,comparable249} from '../src/phase249_decision.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {researchNeedsFromAdvice254} from '../src/phase254_research_needs.js';
// Phase255 T1 tests, written before the corrections. Pages and products are synthetic fixtures.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee255-'));const AT='2026-10-16T12:00:00.000Z';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const page=(name:string,rows:[string,string][])=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@type':'Product',name})}</script></head>
 <body><main><h1>${name}</h1><p>Specifications for this product, as declared on this page.</p><table>${rows.map(([k,v])=>`<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table></main></body></html>`;
const ingest=(s:KnowledgeStore246,cat:string,host:string,url:string,html:string)=>s.ingestObservation246({source:{sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'} as SourceInput246,url,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:AT,runId:'r1',extractorVersion:'spec-extractor-7',extraction:extractSpecifications245(html,url),categoryHypotheses:[cat]});
const store=()=>new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'),CLASS);
const pid=(s:KnowledgeStore246,cat:string,name:string)=>s.products246({category:cat}).find(p=>s.product246(p)!.name===name)!;
const A=(s:KnowledgeStore246,q:string)=>adviseFromRequest253(q,s,CATEGORY_REGISTRY250);

test('quantities in a product name: one clear volume or wattage token, never a range, a mass or a model number',()=>{
 const near=(x:number|null,y:number)=>assert.ok(x!==null&&Math.abs(x-y)<1e-9,`${x} ≈ ${y}`);
 near(comparable249(capacityFromName249('Pour Over Kettle 700ml Stainless Steel'),'volume','l'),0.7);
 near(comparable249(capacityFromName249('Milk Jug 50cl'),'volume','l'),0.5);
 assert.equal(capacityFromName249('Russell Hobbs 1800W 1KG Maxi Deep Fryer'),null,'1KG is a mass');
 assert.equal(capacityFromName249('Kettle 1.7 L or 1.5 L'),null,'two tokens: ambiguous');
 assert.deepEqual(powerFromName249('3 Tier Steamer 800W'),{kind:'quantity',number:800,unit:'W',approximate:false});
 assert.equal(comparable249(powerFromName249('Deep Fryer 2.2kW Black'),'power','W'),2200);
 assert.equal(powerFromName249('Toaster 1000-1200W'),null,'a range is not one rating');
 assert.equal(powerFromName249('Xplode 1500'),null,'a model number without unit');
 assert.equal(powerFromName249('Blender 600W / 900W'),null,'two tokens: ambiguous');
});
test('a name never overrides or contradicts a declaration; a name rating is cited as a name declaration',()=>{
 const s=store();
 ingest(s,'deep_fryers','a.example','https://a.example/p/1',page('Deep Fat Fryer – 3000W',[['Power','2600W'],['Price','£59.99']]));
 ingest(s,'deep_fryers','b.example','https://b.example/p/2',page('Mini Fryer 1200W',[['Price','£29.99']]));
 const hi=A(s,'A deep fryer with at least 2800 W');
 assert.ok(hi.excluded.some(x=>x.productId===pid(s,'deep_fryers','Deep Fat Fryer – 3000W')),'the declared 2600 W decides, not the name');
 const lo=A(s,'A deep fryer with at least 1000 W');
 const mini=lo.shortlist.find(x=>x.productId===pid(s,'deep_fryers','Mini Fryer 1200W'))!;
 assert.ok(mini&&mini.evidence.every(e=>/product name/.test(e.sourceRole)));
 assert.ok(lo.limitations.some(l=>/no category knowledge|needs are not/i.test(l)),'a category without knowledge says what is not understood');
 s.close();
});
test('packaging and component dimensions are never the product\'s; unlabelled or unit-less values stay uncertain with a precise code',()=>{
 const d=(property:string,value:unknown)=>({declarationId:'d',property,value,rawValue:'x',evidenceRole:'manufacturer_declaration',sourceUrl:null,variantId:null}) as never;
 const dims=(numbers:number[],axes:string[]|null,unit='mm')=>({kind:'dimensions',numbers,unit,axes,approximate:false});
 assert.equal(axisValue249(d('Gross Dimensions (WxHxD)',dims([340,285,235],null)),'W'),null);
 assert.equal((axisValue249(d('Net Dimensions (WxHxD)',dims([320,310,265],null)),'W') as {number:number}).number,320);
 const s=store();
 ingest(s,'steam_cookers','c.example','https://c.example/p/1',page('Steamer One',[['Capacity','6'],['Dimensions','17(w) x 41(d) x 20.3(h)']]));
 ingest(s,'steam_cookers','e.example','https://e.example/p/2',page('Steamer Two',[['Dimensions','46 x 21 x 22 cm'],['Power','960 - 1140W']]));
 const codes=(q:string,name:string)=>A(s,q).researchInputs!.productChecks.find(p=>p.productId===pid(s,'steam_cookers',name))!.criteria.map(c=>c.code);
 assert.deepEqual(codes('I want a steamer of at least 5 litres','Steamer One'),['unit_missing']);
 assert.deepEqual(codes('A steamer no wider than 30 cm','Steamer One'),['unit_missing']);
 assert.deepEqual(codes('A steamer no wider than 30 cm','Steamer Two'),['axes_unlabelled']);
 s.close();
});
test('declared ranges are compared by direction; a straddling range stays uncertain',()=>{
 const s=store();
 ingest(s,'steam_cookers','e.example','https://e.example/p/2',page('Steamer Two',[['Power','960 - 1140W']]));
 const out=(q:string)=>{const a=A(s,q),p=pid(s,'steam_cookers','Steamer Two');return a.shortlist.some(x=>x.productId===p)?'include':a.excluded.some(x=>x.productId===p)?'exclude':
  'unknown:'+a.researchInputs!.productChecks.find(x=>x.productId===p)!.criteria[0].code;};
 assert.equal(out('A steamer with at least 1400 W'),'exclude','every declared value is below the minimum');
 assert.equal(out('A steamer with at least 900 W'),'include','every declared value meets the minimum');
 assert.equal(out('A steamer with at least 1000 W'),'unknown:range_straddles');
 s.close();
});
test('retained but uncertain evidence asks for source reinspection, not new research; genuine absence still asks for research',()=>{
 const s=store();
 ingest(s,'steam_cookers','c.example','https://c.example/p/1',page('Steamer One',[['Capacity','6']]));
 ingest(s,'steam_cookers','f.example','https://f.example/p/3',page('Steamer Three',[['Water capacity','1L'],['Price','£20']]));
 const n=researchNeedsFromAdvice254(A(s,'I want a steamer of at least 5 litres'),s);
 const one=n.find(x=>x.productId===pid(s,'steam_cookers','Steamer One'))!,three=n.find(x=>x.productId===pid(s,'steam_cookers','Steamer Three'))!;
 assert.equal(one.destination,'source_reinspection');assert.equal(one.status,'pending_reinspection');assert.equal(one.gap181,null,'not a Phase182 research task');
 assert.equal(three.destination,'research','a water tank is not cooking capacity: the capacity is genuinely missing');
 s.close();
});
test('a category without knowledge and without a stated limit is still not advised on',()=>{
 const s=store();ingest(s,'steam_cookers','c.example','https://c.example/p/1',page('Steamer One',[['Capacity','6']]));
 assert.equal(A(s,'a good steamer').response,'out_of_scope');
 s.close();
});
