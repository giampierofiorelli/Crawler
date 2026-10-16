import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type SourceInput246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {ADOPTED_LESSONS250,applyLessons250} from '../src/phase250_category_lessons.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {runJourney248,purchaseTarget253} from '../src/phase248_advisory_journey.js';
import {createDecision177,applyDecisionAction177,assertDecisionSnapshot177} from '../src/phase177_decision_snapshot.js';
import {extractConstraints253} from '../src/phase253_request_constraints.js';
import {adviseFromRequest253} from '../src/phase253_request_advice.js';
import {validateAdviceGold253,scoreRow253,summarise253,type AdviceGold253} from '../src/phase253_advice_contract.js';
// Phase253 T1 tests, written before the request-to-advice path was implemented. Pages, products, prices and requests
// are synthetic fixtures, never real-world evidence.
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee253-'));const AT='2026-10-16T12:00:00.000Z';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const src=(host:string,t:SourceInput246['sourceType']='manufacturer'):SourceInput246=>({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:t,sourceTypeBasis:'operator_asserted'});
const page=(name:string,rows:[string,string][],gtin?:string)=>`<!doctype html><html><head><script type="application/ld+json">${JSON.stringify({'@type':'Product',name,...(gtin?{gtin13:gtin}:{})})}</script></head>
 <body><main><h1>${name}</h1><p>Specifications for this product, as declared on this page.</p><table>${rows.map(([k,v])=>`<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table></main></body></html>`;
const ingest=(s:KnowledgeStore246,host:string,url:string,html:string,t:SourceInput246['sourceType']='manufacturer')=>s.ingestObservation246({source:src(host,t),url,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:AT,runId:'r1',extractorVersion:'spec-extractor-7',extraction:extractSpecifications245(html,url),categoryHypotheses:['air_fryers']});
function fixture(){
 const s=new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'),CLASS);
 seedCategoryHypotheses246(s,'air_fryers',AT);applyLessons250(s,ADOPTED_LESSONS250,AT);
 ingest(s,'big.example','https://big.example/p/af55',page('Big Fryer 55',[['Capacity','5.5 L'],['Weight','6 kg'],['Price','£99']]));
 ingest(s,'small.example','https://small.example/p/af40',page('Small Fryer 40',[['Capacity','4 L'],['Weight','4 kg'],['Price','£59']]));
 ingest(s,'plain.example','https://plain.example/p/af00',page('Plain Fryer',[['Weight','5 kg'],['Power','1500 W']]));
 ingest(s,'maker.example','https://maker.example/p/af60',page('Twin Fryer 60',[['Capacity','6 L'],['Weight','7 kg']],'4006381333931'));
 ingest(s,'shop.example','https://shop.example/p/twin',page('Twin Fryer 60',[['Capacity','3 L'],['Weight','7 kg']],'4006381333931'),'retailer');
 return s;
}
const pid=(s:KnowledgeStore246,name:string)=>s.products246({category:'air_fryers'}).find(p=>s.product246(p)!.name===name)!;

test('advice gold is validated strictly: missing or inconsistent labels throw with the case named',()=>{
 const ok:AdviceGold253={id:'g1',text:'air fryer at least 5 litres',tier:'T1_synthetic',purchase:{target:'category',category:'air_fryers',other:null},
  constraints:[{criterion:'capacity_min',value:5,unit:'l'}],explicitNeeds:[],implicitNeeds:[],unresolved:[],response:'positive_shortlist',shortlist:{include:['p1'],exclude:[],unknown:[]}};
 assert.equal(validateAdviceGold253([ok]).length,1);
 assert.throws(()=>validateAdviceGold253([{...ok,response:undefined}]),/case g1: response invalid/);
 assert.throws(()=>validateAdviceGold253([{...ok,shortlist:null}]),/positive_shortlist needs shortlist gold/);
 assert.throws(()=>validateAdviceGold253([{...ok,purchase:{target:'category',category:null,other:null}}]),/purchase.category required/);
 assert.throws(()=>validateAdviceGold253([{...ok,constraints:[{criterion:'capacity_min',value:5,unit:'mm'}]}]),/not convertible/);
});
test('purchase target: the head of the purchase phrase decides, not every category name in the text',()=>{
 const s=fixture();const t=(q:string)=>runJourney248(q,s,CATEGORY_REGISTRY250).stages.target;
 assert.equal(t('Looking for an air fryer of at least 5 litres').kind,'category');
 assert.equal(t('What kind of tray can I use to put my air fryer on?').kind,'other');
 assert.equal(t('Baking sheet in air fryer, and alternatives').kind,'other');
 assert.equal(t('My old air fryer broke, I need a new one').category,'air_fryers');
 assert.equal(t('I already have a coffee machine and want a coffee grinder').category,'coffee_grinders');
 assert.equal(t('Should I get an air fryer or a toaster oven?').kind,'ambiguous');
 // A title opening with a buying construction is not itself the noun phrase; "a set of X" is X.
 assert.equal(purchaseTarget253('Looking for a good set of air fryer liners',CATEGORY_REGISTRY250).other,'air fryer liners');
 assert.ok(!purchaseTarget253('Looking for a good air fryer',CATEGORY_REGISTRY250).phrases.some(p=>p.head==='looking'));
 const j=runJourney248('Playing music on my headphones from a laptop - do I need an amp?',s,CATEGORY_REGISTRY250);
 assert.notEqual(j.stages.target.kind,'category');
 s.close();
});
test('explicit quantities become typed constraints with spans; inferred or ambiguous ones do not',()=>{
 const c=(q:string)=>extractConstraints253(q);
 assert.deepEqual(c('an air fryer of at least 5 litres').constraints.map(x=>[x.criterion,x.value,x.unit,x.status]),[['capacity_min',5,'l','stated_in_request']]);
 assert.deepEqual(c('no wider than 40 cm please').constraints.map(x=>[x.criterion,x.value,x.unit]),[['width_max',40,'cm']]);
 assert.deepEqual(c('battery life of at least 30 hours').constraints.map(x=>[x.criterion,x.value,x.unit]),[['battery_life_min',30,'h']]);
 assert.deepEqual(c('it must fit inside a space 57.5 cm wide').constraints.map(x=>[x.criterion,x.value,x.unit]),[['width_max',57.5,'cm']]);
 assert.deepEqual(c('under £120').constraints.map(x=>[x.criterion,x.value,x.unit]),[['budget_max',120,'gbp']]);
 const span=c('I want one that holds at least 5 litres').constraints[0];assert.equal(span.span,'at least 5 litres');
 assert.equal(c('for a family of four').constraints.length,0);
 assert.equal(c('enough to roast a 2 kg chicken').constraints.length,0);
 assert.ok(c('it does not need to be 5 litres').constraints.every(x=>x.status!=='stated_in_request'));
 assert.ok(c('no bigger than 3 litres').unmapped.length===1);
});
test('Phase177: a constraint stated verbatim may be confirmed only with its span hash; NLP candidates still cannot',()=>{
 let s=createDecision177('t');
 s=applyDecisionAction177(s,{type:'state_in_request',source:'user_request_statement',key:'capacity_min',label:'at least 5 litres',value:{kind:'quantity',value:5,unit:'l'},priority:'hard',referenceHash:sha('at least 5 litres')}).snapshot;
 assert.equal(s.criteria[0].status,'confirmed');assert.equal(s.criteria[0].provenance.source,'user_request_statement');assertDecisionSnapshot177(s);
 assert.throws(()=>applyDecisionAction177(s,{type:'state_in_request',source:'user_request_statement',key:'weight_max',label:'light',value:{kind:'quantity',value:5,unit:'kg'},priority:'hard',referenceHash:'x'} as never),/phase177/);
 let u=applyDecisionAction177(createDecision177('u'),{type:'set_criterion',source:'user_web_control',key:'capacity_min',label:'Six litres',value:{kind:'quantity',value:6,unit:'l'},priority:'hard'}).snapshot;
 u=applyDecisionAction177(u,{type:'state_in_request',source:'user_request_statement',key:'capacity_min',label:'at least 5 litres',value:{kind:'quantity',value:5,unit:'l'},priority:'hard',referenceHash:sha('at least 5 litres')}).snapshot;
 assert.deepEqual(u.criteria[0].value,{kind:'quantity',value:6,unit:'l'},'a request statement never overrides a user control');
});
test('end to end: a stated requirement gives a cited, unordered shortlist without asking for it again',()=>{
 const s=fixture();const a=adviseFromRequest253('I am looking for an air fryer of at least 5 litres',s,CATEGORY_REGISTRY250);
 assert.equal(a.response,'positive_shortlist');assert.equal(a.ordered,false);assert.equal(a.rankingAuthorized,false);
 assert.deepEqual(a.shortlist.map(x=>x.productId),[pid(s,'Big Fryer 55')]);
 assert.ok(a.shortlist[0].evidence.every(e=>e.sourceUrl&&e.productId===a.shortlist[0].productId));
 assert.ok(a.excluded.some(x=>x.productId===pid(s,'Small Fryer 40')&&x.reasons.some(r=>/4 l/.test(r))));
 assert.ok(a.unknown.some(x=>x.productId===pid(s,'Plain Fryer')));
 assert.ok(a.conflicts.some(x=>x.productId===pid(s,'Twin Fryer 60')));
 assert.ok(!a.questions.some(q=>/capacity/i.test(q)),'the stated capacity is not asked again');
 assert.ok(a.limitations.some(l=>/not independent/i.test(l))&&a.limitations.some(l=>/not the whole market/i.test(l)));
 s.close();
});
test('end to end: justified negative, justified abstention, budget only with usable prices, and other purchase targets',()=>{
 const s=fixture();const A=(q:string)=>adviseFromRequest253(q,s,CATEGORY_REGISTRY250);
 assert.equal(A('I need an air fryer of at least 10 litres').response,'justified_negative');
 const w=A('looking for an air fryer that weighs no more than 1 kg');assert.equal(w.response,'justified_negative');
 const b=A('an air fryer of at least 5 litres under £120');assert.equal(b.response,'positive_shortlist');
 assert.ok(b.shortlist[0].evidence.some(e=>/£99/.test(e.rawValue)));
 assert.equal(A('a good air fryer').response,'clarification');
 assert.equal(A('What kind of tray can I use to put my air fryer on?').response,'out_of_scope');
 const g=validateAdviceGold253([{id:'e',text:'x x x',tier:'T1_synthetic',purchase:{target:'category',category:'air_fryers',other:null},constraints:[{criterion:'capacity_min',value:5,unit:'l'}],
  explicitNeeds:[],implicitNeeds:[],unresolved:[],response:'positive_shortlist',shortlist:{include:[pid(s,'Big Fryer 55')],exclude:[pid(s,'Small Fryer 40')],unknown:[pid(s,'Plain Fryer'),pid(s,'Twin Fryer 60')]}}]);
 const row=scoreRow253(g[0],A('I am looking for an air fryer of at least 5 litres'));
 assert.equal(row.harmful,false);assert.equal(row.responseOk,true);assert.equal(summarise253([row]).m6_productChecks.agree,4);
 s.close();
});
