import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {CONCEPT_VOCABULARY248} from '../src/phase248_concept_vocabulary.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253,type RankingContext253} from '../src/phase253_request_advice.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import type {ProductKnowledgeCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {testLeadsFromHtml265} from '../src/phase265_test_measurements.js';
import type {Advice253} from '../src/phase253_advice_contract.js';

// ARCHITECTURAL FITNESS TEST — the consumer-request-to-decision path as one service (principles 2, 8, 10).
// SYNTHETIC and isolated: fictional machines on fictional hosts, ingested through the real Phase246 path into an
// in-memory store; a catalog signed with a key generated here stands in for a reviewed release. Nothing touches the
// private knowledge store. This proves the operational components cooperate; it is not authentic validation.
const REQUEST='Which espresso machine makes the best-tasting traditional Italian espresso for under £600?';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const MACHINES=[['Aurora A1 Espresso Machine','A1',399],['Borealis B2 Espresso Machine','B2',549],['Cumulus C3 Espresso Machine','C3',650],['Drift D4 Espresso Machine','D4',299]] as const;
function world(){
 const s=new KnowledgeStore246(':memory:',CLASS);
 seedCategoryHypotheses246(s,'coffee_machines');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.coffee_machines))s.addConceptAliases246('coffee_machines',id,al);
 const ids:Record<string,string>={};
 for(const [name,mpn,price] of MACHINES){
  const url=`https://maker-${mpn.toLowerCase()}.pee-vertical.test/p/${mpn}`;
  const html=`<html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,brand:'Fictional Co',mpn,model:mpn,
   offers:{'@type':'Offer',price:String(price),priceCurrency:'GBP'}})}</script></head><body><h1>${name}</h1></body></html>`;
  const x=extractSpecifications245(html,url);
  const r=s.ingestObservation246({source:{sourceId:'src_'+mpn,host:new URL(url).host,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
   httpStatus:200,fetchedAt:'2026-10-16T09:00:00.000Z',runId:'vertical',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['coffee_machines'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)});
  ids[mpn]=r.productIds[0];
 }
 return {s,ids};
}
const keys=generateKeyPairSync('ed25519'),rogue=generateKeyPairSync('ed25519');
const authority={publicKeys:{panel_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T12:00:00Z',market:'uk'};
function catalog(ids:Record<string,string>,o:Partial<ProductKnowledgeCatalog181>={}):ProductKnowledgeCatalog181{
 const obs=(mpn:string,p:number)=>({variantId:ids[mpn],name:mpn,observations:[{dimensionKey:'espresso_quality',valuePoints:p,hardOutcome:'pass' as const,evidenceId:'t_'+mpn.toLowerCase()}]});
 return {phase:181,schema:'181.1',market:'uk',categoryId:'coffee_machines',knowledgeRevision:'synthetic_panel_v1',policyRevision:'synthetic_taste_policy_v1',
  reviewedAt:'2026-10-15T00:00:00Z',expiresAt:'2026-11-15T00:00:00Z',discoveredVariantIds:[ids.A1,ids.B2,ids.C3,ids.D4],marketCoverageComplete:false,
  coverageStatement:'Synthetic controlled set of fictional machines; not market data.',
  dimensions:[{key:'espresso_quality',label:'Traditional espresso taste (specialist panel)',value:{kind:'boolean',value:true},methodId:'synthetic_specialist_panel',protocolVersion:'v1',
   weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'synthetic_weights',normalizationReviewReference:'synthetic_normalisation'}],
  originalTests:['A1','B2','C3'].map(m=>({id:'t_'+m.toLowerCase(),variantId:ids[m],dimensionKey:'espresso_quality',originalTestId:'panel_'+m.toLowerCase(),methodId:'synthetic_specialist_panel',protocolVersion:'v1',
   sourceUrl:`https://panel.pee-vertical.test/${m}`,observedAt:'2026-10-14T00:00:00Z',scope:'exact_variant_original_professional_test' as const})),
  products:[obs('A1',8000),obs('B2',9000),obs('C3',9500)],externalReviewReference:'synthetic_panel_review',...o};
}
const signed=(c:ProductKnowledgeCatalog181,k=keys)=>({catalog:c,keyId:'panel_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),k.privateKey).toString('base64')});
type Advise=(t:string,s:KnowledgeStore246,r:typeof CATEGORY_REGISTRY250,o?:{ranking?:RankingContext253|null})=>Advice253;

/** The fitness probe: the properties the full path must keep. Returns violations (empty = the path is intact). */
function verticalProbe(advise:Advise,w=world()):string[]{
 const v:string[]=[];const ctx={catalog:signed(catalog(w.ids)),authority};
 const a=advise(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:ctx});
 if(a.response!=='ranked_recommendation')v.push(`A: authorised evidence did not reach the ranking (response ${a.response})`);
 if(!a.constraints.some(c=>c.criterion==='budget_max'&&c.value===600))v.push('C: the budget constraint was lost');
 if(JSON.stringify(a.ranked?.map(x=>[x.productId,x.rank]))!==JSON.stringify([[w.ids.B2,1],[w.ids.A1,2]]))v.push('A/B: wrong ranking (over-budget C3 must be excluded, unreviewed D4 held)');
 if(!a.ranked?.every(x=>x.sourceUrls.length&&x.originalTestIds.length))v.push('D: a ranked product lacks cited original tests');
 const unauth=advise(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:{catalog:signed(catalog(w.ids),rogue),authority}});
 if(unauth.rankingAuthorized||unauth.ordered)v.push('B: an untrusted signature produced a ranking');
 if(!unauth.unassessedObjectives.some(o=>/best-tasting/.test(o)))v.push('C: the unassessed taste objective was dropped');
 return v;
}

test('A–C, G: the real request path reaches the authorised Phase181 ranking, keeps the budget and fails closed without authority',()=>{
 const w=world();const a=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:{catalog:signed(catalog(w.ids)),authority}});
 assert.equal(a.response,'ranked_recommendation');assert.equal(a.rankingAuthorized,true);assert.equal(a.ordered,true);
 assert.deepEqual(a.ranked!.map(x=>[x.name,x.rank]),[['Borealis B2 Espresso Machine',1],['Aurora A1 Espresso Machine',2]],'C3 (best score, over budget) excluded by the stated limit');
 assert.ok(a.excluded.some(x=>x.productId===w.ids.C3));
 assert.ok(a.held!.some(h=>h.productId===w.ids.D4&&/no independently reviewed/.test(h.reason)),'D4 is in budget but unreviewed: held, not ranked');
 assert.deepEqual(a.unassessedObjectives,[],'the taste objective was assessed by the reviewed dimension');
 assert.ok(a.statements.some(x=>/Ranked by Traditional espresso taste \(specialist panel\) from the signed catalog synthetic_panel_v1/.test(x)));
 assert.ok(a.limitations.some(x=>/does not independently establish scientific quality/.test(x)),'a signature is not scientific validity');
 assert.deepEqual(verticalProbe(adviseFromRequest253),[],'the fitness probe passes on the intact path');
});

test('B: insufficient, unauthorised, expired or non-covering evidence holds the ranking and keeps the objective explicit',()=>{
 const w=world();const run=(ranking:RankingContext253|null)=>adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking});
 for(const [why,r] of [['no ranking context',null],['untrusted signer',{catalog:signed(catalog(w.ids),rogue),authority}],
  ['expired catalog',{catalog:signed(catalog(w.ids,{expiresAt:'2026-10-15T12:00:00Z'})),authority}],
  ['tampered after signing',{catalog:{...signed(catalog(w.ids)),catalog:catalog(w.ids,{products:[]})},authority}],
  ['no covering dimension',{catalog:signed(catalog(w.ids,{dimensions:[{...catalog(w.ids).dimensions[0],key:'milk_drinks'}]})),authority}],
  ['no product has the measurement',{catalog:signed(catalog(w.ids,{products:[],originalTests:[]})),authority}]] as const){
  const a=run(r as RankingContext253|null);
  assert.equal(a.rankingAuthorized,false,why);assert.equal(a.ordered,false,why);assert.equal(a.response,'positive_shortlist',why);
  assert.ok(a.unassessedObjectives.length>0,why);assert.ok(a.statements.some(x=>/^Not assessed: /.test(x)),why);
 }
});

test('D, E: unreviewed store measurements and manufacturer declarations never rank; identical inputs give identical answers',()=>{
 const w=world();const ctx={catalog:signed(catalog(w.ids)),authority};
 const before=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:ctx});
 // A publisher-reported test measurement for the low-scored machine is staged in the store (Phase265): it must not move the order.
 const url='https://lab.pee-vertical.test/a1',html=`<html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:'Aurora A1 Espresso Machine',brand:'Fictional Co',mpn:'A1',model:'A1'})}</script></head><body><h2>How we tested</h2><p>We measured the noise of the A1 at 40 dB using a sound meter.</p></body></html>`;
 const x=extractSpecifications245(html,url);
 w.s.ingestObservation246({source:{sourceId:'src_lab',host:'lab.pee-vertical.test',sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
  httpStatus:200,fetchedAt:'2026-10-16T10:00:00.000Z',runId:'vertical',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['coffee_machines'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)});
 assert.equal(w.s.testMeasurements265().length,1,'the staged measurement exists');
 const after=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:ctx});
 assert.deepEqual(after.ranked,before.ranked,'staged measurements are not ranking input');
 assert.equal(adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250).ordered,false,'declarations and staged measurements alone never order products');
 // Determinism: the same request, criteria, policy and evidence; catalog order does not matter.
 const c=catalog(w.ids);const reordered=signed({...c,products:[...c.products].reverse(),originalTests:[...c.originalTests].reverse()});
 const r1=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:ctx}),r2=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:{catalog:reordered,authority}});
 assert.deepEqual([r1.response,r1.ranked,r1.held,r1.excluded,r1.unknown],[r2.response,r2.ranked,r2.held,r2.excluded,r2.unknown]);
 // A tie stays a tie.
 const tie=catalog(w.ids,{products:[...catalog(w.ids).products.slice(0,1),{...catalog(w.ids).products[1],observations:[{...catalog(w.ids).products[1].observations[0],valuePoints:8000}]},catalog(w.ids).products[2]]});
 assert.deepEqual(adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:{catalog:signed(tie),authority}}).ranked!.map(x=>x.rank),[1,1]);
});

test('G: the fitness probe fails when an essential connection is deliberately broken',()=>{
 const dropsRanking:Advise=(t,s,r)=>adviseFromRequest253(t,s,r);                          // ranking context not forwarded
 const dropsBudget:Advise=(t,s,r,o)=>adviseFromRequest253(t.replace(' for under £600',''),s,r,o); // a stated limit lost
 const dropsObjective:Advise=(t,s,r,o)=>({...adviseFromRequest253(t,s,r,o),unassessedObjectives:[]});
 assert.ok(verticalProbe(dropsRanking).some(x=>x.startsWith('A:')));
 assert.ok(verticalProbe(dropsBudget).some(x=>x.startsWith('C: the budget')));
 assert.ok(verticalProbe(dropsBudget).some(x=>x.startsWith('A/B:')),'without the limit the over-budget machine is ranked: detected');
 assert.ok(verticalProbe(dropsObjective).some(x=>x.includes('objective was dropped')));
 // Need recognition disconnected (no vocabulary in the store): the request can no longer reach the ranking.
 const bare=world();for(const row of bare.s.db.prepare("SELECT item_id FROM category_items WHERE concept_id='espresso_quality'").all() as {item_id:string}[])
  bare.s.db.prepare("UPDATE category_items SET aliases_json='[]' WHERE item_id=?").run(row.item_id);
 assert.ok(verticalProbe(adviseFromRequest253,bare).some(x=>x.startsWith('A:')));
});
