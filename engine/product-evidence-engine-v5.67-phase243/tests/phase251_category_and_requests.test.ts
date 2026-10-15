import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {proposeCategories251,applyCategoryAssignments251,isAccessoryName} from '../src/phase251_category_assignment.js';
import {decideAdvice249,type Candidate249} from '../src/phase249_decision.js';
import {createDecision177,applyDecisionAction177} from '../src/phase177_decision_snapshot.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {runJourney248} from '../src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {ADOPTED_LESSONS250,applyLessons250} from '../src/phase250_category_lessons.js';
import {composeQuestion125} from '../src/phase125_compositional_dialogue_frame.js';
// Phase251 T1 tests. Pages, products and values are synthetic fixtures, never real-world evidence.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee251-'));
const AT='2026-10-15T12:00:00.000Z';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const src=(host:string):SourceInput246=>({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'});
const page=(name:string,extra='')=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@type':'Product',name})}</script></head>
 <body><main><h1>${name}</h1><p>Specifications for this product, as declared by its maker on this page.</p><table><tr><th>Weight</th><td>7.5 kg</td></tr><tr><th>Power</th><td>350 W</td></tr>${extra}</table></main></body></html>`;
const ingest=(s:KnowledgeStore246,host:string,url:string,html:string)=>s.ingestObservation246({source:src(host),url,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:AT,runId:'r1',extractorVersion:'spec-extractor-7',extraction:extractSpecifications245(html,url),categoryHypotheses:[]});
const store=()=>new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'),CLASS);

test('category assignment uses the product\'s own evidence, guards accessories and bundles, and journals its basis',()=>{
 const s=store();
 ingest(s,'maker.example','https://maker.example/dehumidifiers/dd12/',page('Example 12L Dehumidifier'));
 ingest(s,'maker2.example','https://maker2.example/p/x200',page('Robot Lawn Mower Garage'));
 ingest(s,'maker3.example','https://maker3.example/p/set',page('Mix and Blend Set with Stand Mixer and Blender'));
 ingest(s,'maker4.example','https://maker4.example/p/zz9',page('ZZ9 Pro'));
 const props=proposeCategories251(s);const by=(n:string)=>props.find(p=>p.name===n)!;
 assert.equal(by('Example 12L Dehumidifier').outcome,'assigned');assert.equal(by('Example 12L Dehumidifier').categoryId,'dehumidifiers');
 assert.ok(by('Example 12L Dehumidifier').basis.includes('declared_name'));
 assert.equal(by('Robot Lawn Mower Garage').outcome,'accessory');
 assert.equal(by('Mix and Blend Set with Stand Mixer and Blender').outcome,'conflict');
 assert.equal(by('ZZ9 Pro').outcome,'no_evidence');
 assert.equal(applyCategoryAssignments251(s,props,AT),1);assert.equal(applyCategoryAssignments251(s,props,AT),0);
 assert.equal(s.products246({category:'dehumidifiers'}).length,1);
 const ev=s.db.prepare("SELECT payload_json FROM events WHERE kind='product_category_assigned'").all() as {payload_json:string}[];
 assert.equal(ev.length,1);assert.equal(JSON.parse(ev[0].payload_json).basis.includes('declared_name'),true);
 s.close();
});
test('accessory names: the accessory word must be the head, not negated and not part of a category noun',()=>{
 assert.equal(isAccessoryName('Robot Lawn Mower Garage'),true);
 assert.equal(isAccessoryName('Speaker Floor Stands for X1 Pro'),true);
 assert.equal(isAccessoryName('18V Cordless Drill Driver Without Battery and Charger'),false);
 assert.equal(isAccessoryName('Power Grip Professional Hair Clipper'),false);
 assert.equal(isAccessoryName('Artisan Stand Mixer'),false);
});
test('a name-only identity spanning several model pages is never reported as meeting requirements',()=>{
 let snap=applyDecisionAction177(createDecision177('t'),{type:'set_scope',source:'user_web_control',scope:{category:'microwave_ovens',task:'product_selection'}}).snapshot;
 snap=applyDecisionAction177(snap,{type:'set_criterion',source:'user_web_control',key:'capacity_min',label:'Family',value:{kind:'quantity',value:20,unit:'l'},priority:'hard'}).snapshot;
 const d=(id:string,url:string)=>({declarationId:id,property:'Capacity',value:{kind:'quantity',number:20,unit:'l',approximate:false} as never,rawValue:'20 L',evidenceRole:'manufacturer_declaration',sourceUrl:url,variantId:null});
 const C:Candidate249[]=[{productId:'p1',name:'20 Litre Microwave',declarations:[d('a','https://m.example/m/ab1/'),d('b','https://m.example/m/cd2/')],identityWarning:'identity needs review'},
  {productId:'p2',name:'Other 25L Microwave',declarations:[d('c','https://n.example/x/ef3/')]}];
 const a=decideAdvice249({snapshot:snap,candidates:C});
 assert.deepEqual(a.shortlist.map(s=>s.productId),['p2']);
 assert.equal(a.checks.find(c=>c.productId==='p1')?.outcome,'unknown');
 assert.ok(a.checks.find(c=>c.productId==='p1')?.checks.some(x=>x.key==='identity'));
});
test('a retired category item is kept, journaled and no longer returned',()=>{
 const s=store();seedCategoryHypotheses246(s,'toasters',AT);
 const id=s.categoryItems246('toasters')[0].itemId;
 assert.equal(s.retireCategoryItem246(id,'test_retirement',AT),true);assert.equal(s.retireCategoryItem246(id,'test_retirement',AT),false);
 assert.ok(!s.categoryItems246('toasters').some(i=>i.itemId===id));
 assert.ok(s.db.prepare('SELECT 1 FROM category_items WHERE item_id=?').get(id));
 s.close();
});
test('requests: complements in short queries, coffee-domain products and price wording',()=>{
 const s=store();for(const c of ['air_fryers','coffee_machines','toasters'])seedCategoryHypotheses246(s,c,AT);applyLessons250(s,ADOPTED_LESSONS250,AT);
 const cat=(q:string)=>runJourney248(q,s,CATEGORY_REGISTRY250).stages.category.categoryId;
 assert.notEqual(cat('parchment paper for air fryer'),'air_fryers');
 assert.notEqual(cat('toaster warming rack'),'toasters');
 assert.equal(cat('looking for an air fryer'),'air_fryers');
 assert.equal(cat('We live in a hard water area, so limescale is a problem for coffee machines.'),'coffee_machines');
 assert.notEqual(cat('Coffee roasting: is it worth upgrading from a popcorn popper to a dedicated roaster for my coffee beans?'),'coffee_machines');
 const S=[{id:'x',aliases:['thing'],aspects:[],schemaReviewId:'r'}];
 assert.deepEqual(composeQuestion125('Budget of between £200 and £350.',S).userBudget,{currency:'GBP',min:200,max:350});
 assert.equal(composeQuestion125('Is it worth going from pans below $60, to pans from $60 to $130, or to pans over $130?',S).userBudget,null);
 assert.deepEqual(composeQuestion125('hope to find one at $120 or less, they range from $25 to $250',S).userBudget,{currency:'USD',min:null,max:120});
 s.close();
});
