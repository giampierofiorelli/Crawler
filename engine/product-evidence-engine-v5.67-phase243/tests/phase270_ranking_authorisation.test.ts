import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {CONCEPT_VOCABULARY248} from '../src/phase248_concept_vocabulary.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {applyLessons250,ADOPTED_LESSONS250} from '../src/phase250_category_lessons.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {COFFEE_TEACHING269,COFFEE_SOURCES269,AIR_FRYER_TEACHING269,RESEARCH_SOURCES269} from '../src/phase269_research_teaching.js';
import {adviseFromRequest253,outcomeAuthorised270,outcomeAuthorisedRa2,type RankingContext253} from '../src/phase253_request_advice.js';
import {assessRelation247,relations247} from '../src/phase247_category_relations.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import {verifySignedCatalog181,dynamicKnowledgeAnswer181,type ProductKnowledgeCatalog181,type KnowledgeDimension181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {createDecision177,applyDecisionAction177} from '../src/phase177_decision_snapshot.js';
import {testLeadsFromHtml265,testDocumentSubject268} from '../src/phase265_test_measurements.js';
import {validateTestMeasurements268,compileCatalog268,VALIDATION_POLICY268,SCORING_POLICY268,type ValidationPolicy268} from '../src/phase268_evidence_validation.js';

// Phase270 (owner review §2, §3, §5, §10). Every product, host and value is FICTIONAL. Two worlds: coffee machines with a
// scored specialist-panel dimension (the ranking path), and air fryers with the r2 raw-quantity energy metric (the
// partial-comparison path).
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee270-'));let n=0;
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const keys=generateKeyPairSync('ed25519'),rogue=generateKeyPairSync('ed25519');
const authority={publicKeys:{panel_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T12:00:00Z',market:'uk'};
const signed=(c:ProductKnowledgeCatalog181,k=keys)=>({catalog:c,keyId:'panel_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),k.privateKey).toString('base64')});

// ---- Coffee: the ranking path -------------------------------------------------------------------------------------
const REQUEST='Which espresso machine makes the best-tasting traditional Italian espresso for under £600?';
// S78: ranking needs positive evidence that the measurement ESTABLISHES the outcome. The fictional world records it as a
// source-citing assessment of its espresso relation ('establishes' by default; tests vary it).
type Suff=('establishes'|'informs_only')[];
function coffee(teach=true,sufficiency:Suff=['establishes']){
 const s=new KnowledgeStore246(':memory:',CLASS);seedCategoryHypotheses246(s,'coffee_machines');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.coffee_machines))s.addConceptAliases246('coffee_machines',id,al);
 if(teach){registerTeachingSources252(COFFEE_SOURCES269);applyTeaching252(s,[COFFEE_TEACHING269],'2026-10-16T08:30:00.000Z');
  const items=s.categoryItems246('coffee_machines');const ref=(id:string)=>'item:'+items.find(i=>i.concept?.id===id)!.itemId;
  const rel=relations247(s,'coffee_machines').find(r=>r.kind==='measured_by'&&r.from===ref('espresso_sensory_assessment')&&r.to===ref('espresso_quality'))!;
  sufficiency.forEach((v,i)=>assessRelation247(s,{relationId:rel.relationId,value:v,basis:'teaching_source_statement',assessor:'fictional-source-'+i,citation:'fictional panel method page, section 2 (test fixture)'},'2026-10-16T08:31:00.000Z'));}
 const ids:Record<string,string>={};
 for(const [name,mpn,price] of [['Aurora A1 Espresso Machine','A1',399],['Borealis B2 Espresso Machine','B2',549]] as const){
  const url=`https://maker-${mpn.toLowerCase()}.pee270.test/p/${mpn}`;
  const html=`<html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,brand:'Fictional Co',mpn,model:mpn,offers:{'@type':'Offer',price:String(price),priceCurrency:'GBP'}})}</script></head><body><h1>${name}</h1></body></html>`;
  const x=extractSpecifications245(html,url);
  ids[mpn]=s.ingestObservation246({source:{sourceId:'src_'+mpn,host:new URL(url).host,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
   httpStatus:200,fetchedAt:'2026-10-16T09:00:00.000Z',runId:'p270',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['coffee_machines'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)}).productIds[0];
 }
 return {s,ids};
}
function panel(ids:Record<string,string>,dim:Partial<KnowledgeDimension181>={},o:Partial<ProductKnowledgeCatalog181>={}):ProductKnowledgeCatalog181{
 const d:KnowledgeDimension181={key:'espresso_quality',label:'Traditional espresso taste (specialist panel)',value:{kind:'boolean',value:true},methodId:'synthetic_specialist_panel',protocolVersion:'v1',
  measureId:'espresso_sensory_assessment',conditionsMet:['same_beans_and_grind'],weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'synthetic_weights',normalizationReviewReference:'synthetic_normalisation',...dim};
 for(const [k,v] of Object.entries(dim))if(v===undefined)delete (d as unknown as Record<string,unknown>)[k];
 const raw=d.valueKind==='raw_quantity_only';
 return {phase:181,schema:'181.1',market:'uk',categoryId:'coffee_machines',knowledgeRevision:'synthetic_panel_v1',policyRevision:'synthetic_taste_policy_v1',
  reviewedAt:'2026-10-15T00:00:00Z',expiresAt:'2026-11-15T00:00:00Z',discoveredVariantIds:[ids.A1,ids.B2],marketCoverageComplete:false,coverageStatement:'Synthetic controlled set of fictional machines; not market data.',
  dimensions:[d],originalTests:['A1','B2'].map((m,i)=>({id:'t_'+m.toLowerCase(),variantId:ids[m],dimensionKey:'espresso_quality',originalTestId:'panel_'+m.toLowerCase(),methodId:'synthetic_specialist_panel',protocolVersion:'v1',
   sourceUrl:`https://panel.pee270.test/${m}`,observedAt:'2026-10-14T00:00:00Z',scope:'exact_variant_original_professional_test' as const,...(raw?{measured:{value:7+i,unit:'points',direction:'higher_is_better' as const}}:{})})),
  products:([['A1',8000],['B2',9000]] as const).map(([m,p])=>({variantId:ids[m],name:m,observations:[{dimensionKey:'espresso_quality',valuePoints:raw?0:p,hardOutcome:'pass' as const,evidenceId:'t_'+m.toLowerCase()}]})),
  externalReviewReference:'synthetic_panel_review',...o};
}
const advise=(s:KnowledgeStore246,r:RankingContext253|null,q=REQUEST)=>adviseFromRequest253(q,s,CATEGORY_REGISTRY250,{ranking:r});

test('control: positive, attributable relevance (teaching measured_by + signed measureId + conditions met) ranks',()=>{
 const w=coffee();const a=advise(w.s,{catalog:signed(panel(w.ids)),authority});
 assert.equal(a.response,'ranked_recommendation');assert.equal(a.goalAssessment!.decision,'ranking');
 assert.deepEqual(a.ranked!.map(x=>x.productId),[w.ids.B2,w.ids.A1]);
});

test('§2 negative: no ranking without positive evidence that the measurement establishes the outcome under its conditions',()=>{
 const w=coffee(),bare=coffee(false);
 const cases:[string,ReturnType<typeof coffee>,ProductKnowledgeCatalog181,string][]=[
  ['unknown measurement',w,panel(w.ids,{measureId:'panel_vibes_score'}),'unknown measurement'],
  ['unknown catalog method (no measureId, no protocol)',w,panel(w.ids,{measureId:undefined}),'unknown measurement'],
  ['missing category teaching',bare,panel(bare.ids),''],
  ['no measurement→outcome relation (a known measurement of another outcome)',w,panel(w.ids,{measureId:'brew_temperature_stability',conditionsMet:['consecutive_shots','same_beans_and_grind']}),'no measured by relation'],
  ['missing essential experimental condition',w,panel(w.ids,{conditionsMet:[]}),'conditions not met'],
  // S78: a measured_by relation alone never establishes the outcome
  ['measured_by without any sufficiency assessment',coffee(true,[]),panel(coffee(true,[]).ids),'sufficiency not established'],
  ['the source says the measurement only informs the outcome',coffee(true,['informs_only']),panel(coffee(true,['informs_only']).ids),'sufficiency only informs'],
  ['sources disagree on sufficiency',coffee(true,['establishes','informs_only']),panel(coffee(true,['establishes','informs_only']).ids),'sufficiency contested'],
 ];
 for(const [why,world,cat,reason] of cases){
  const a=advise(world.s,{catalog:signed(cat),authority});
  assert.notEqual(a.response,'ranked_recommendation',why);assert.equal(a.rankingAuthorized,false,why);assert.equal(a.ordered,false,why);
  assert.ok(a.unassessedObjectives.includes('espresso_quality'),why+': the objective stays unassessed');
  if(reason)assert.ok(a.limitations.some(l=>l.includes('espresso_quality: '+reason)),why+': '+a.limitations.join(' | '));
 }
});

test('§2 negative: a known unsuitable proxy, and a valid catalog for an unrelated category, never rank',()=>{
 const k={relevant:['energy_per_cooking_task'],proxies:['energy_empty_run'],conditions:['same_food_load']};
 const d={...panel({A1:'a1',B2:'b2'}).dimensions[0],conditionsMet:['same_food_load']};
 assert.deepEqual(outcomeAuthorised270(k,d,'energy_empty_run'),{ok:false,reason:'known_proxy'});
 assert.deepEqual(outcomeAuthorised270(k,d,'energy_per_cooking_task'),{ok:true});
 assert.deepEqual(outcomeAuthorised270(undefined,d,'energy_per_cooking_task'),{ok:false,reason:'no_category_teaching'});
 assert.deepEqual(outcomeAuthorised270(k,d,null),{ok:false,reason:'unknown_measurement'});
 const w=coffee();const a=advise(w.s,{catalog:signed(panel(w.ids,{},{categoryId:'kettles'})),authority});
 assert.equal(a.rankingAuthorized,false);assert.ok(a.limitations.some(l=>/not used: it covers a different category/.test(l)));
});

test('§2/§10 negative: an unassessed essential objective blocks the overall ranking and stays unassessed',()=>{
 const w=coffee();
 const a=advise(w.s,{catalog:signed(panel(w.ids)),authority},'Which espresso machine makes the best-tasting traditional Italian espresso for under £600? I am tired of inconsistent shots.');
 assert.ok(a.needs.includes('shot_consistency'),'precondition: the second outcome is recognised: '+a.needs.join(','));
 assert.notEqual(a.response,'ranked_recommendation');assert.equal(a.ordered,false);
 assert.ok(a.unassessedObjectives.includes('shot_consistency'));
 assert.ok(a.statements.some(x=>/^No ranking: not every stated objective is assessed/.test(x)));
});

test('§5: a raw-quantity dimension is never a score — no order, no tie, even if signed and relevant',()=>{
 const w=coffee();const a=advise(w.s,{catalog:signed(panel(w.ids,{valueKind:'raw_quantity_only'})),authority});
 assert.equal(a.rankingAuthorized,false);assert.equal(a.ranked,undefined);
 // Directly at Phase181: a raw dimension is refused; a non-zero placeholder or a missing quantity is invalid content.
 let snap=createDecision177('p270');snap=applyDecisionAction177(snap,{type:'set_scope',source:'user_request_statement',scope:{task:'product_selection',category:'coffee_machines'}}).snapshot;
 snap=applyDecisionAction177(snap,{type:'state_in_request',source:'user_request_statement',key:'espresso_quality',label:'Traditional espresso taste (specialist panel)',value:{kind:'boolean',value:true} as never,priority:'high',referenceHash:sha('x')}).snapshot;
 const d=dynamicKnowledgeAnswer181({snapshot:snap,catalog:signed(panel(w.ids,{valueKind:'raw_quantity_only'})),authority});
 assert.equal(d.status,'research_required');assert.equal(d.ranked.length,0);
 const bad=panel(w.ids,{valueKind:'raw_quantity_only'});
 const scored={...bad,products:bad.products.map(p=>({...p,observations:p.observations.map(o=>({...o,valuePoints:5000}))}))};
 assert.deepEqual(verifySignedCatalog181(signed(scored),authority,{categoryId:'coffee_machines'}),{ok:false,reason:'invalid_or_altered_content'});
 const noQty={...bad,originalTests:bad.originalTests.map(({measured:_m,...t})=>t)};
 assert.deepEqual(verifySignedCatalog181(signed(noQty),authority,{categoryId:'coffee_machines'}),{ok:false,reason:'invalid_or_altered_content'});
});

// ---- Air fryers: the partial-comparison path ------------------------------------------------------------------------
const HOST='www.fryerlab.test';
const review=(product:string,body:string)=>`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:`${product} review: A fictional tagline`})}</script></head><body><h1>${product} review: A fictional tagline</h1>${body}</body></html>`;
const PROTOCOL='<h2>How I tested the fryer</h2><p>Before any cooking, the first thing I do is test the power consumption by running it empty for 1 hour at 200&deg;C, using a plug-in power meter to record usage. If it has two drawers, I will run both.</p>';
const policy:ValidationPolicy268={...VALIDATION_POLICY268,qualifiedPublishers:[{...VALIDATION_POLICY268.qualifiedPublishers[0],host:HOST}]};
function fryers(){
 const s=new KnowledgeStore246(join(dir,`s${++n}.sqlite`),CLASS);
 seedCategoryHypotheses246(s,'air_fryers','2026-10-16T08:00:00.000Z');applyLessons250(s,ADOPTED_LESSONS250,'2026-10-16T08:00:00.000Z');
 registerTeachingSources252(RESEARCH_SOURCES269);applyTeaching252(s,[AIR_FRYER_TEACHING269],'2026-10-16T08:30:00.000Z');
 for(const [k,name,v] of [['zephyr','Zephyrine Crisp 3 ZC300X Air Fryer','0.512'],['nimbus','Nimbus Duo NB200Y Air Fryer','0.611']] as const){
  const html=review(name,PROTOCOL+`<p>One hour&rsquo;s usage at 200&deg;C consumed ${v} kWh of electricity.</p>`);const url=`https://${HOST}/reviews/${k}-review`;
  const x=testDocumentSubject268(extractSpecifications245(html,url),'independent_original_test');
  s.ingestObservation246({source:{sourceId:'src_fryerlab',host:HOST,sourceType:'independent_original_test',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),
   bytes:html.length,httpStatus:200,fetchedAt:'2026-10-16T09:00:00.000Z',runId:'run_270',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['air_fryers'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)});
 }
 const product=(id:string)=>{const r=s.db.prepare('SELECT name,declared_model FROM products WHERE product_id=?').get(id) as {name:string|null;declared_model:string|null}|undefined;return r?{name:r.name,declaredModel:r.declared_model}:null;};
 const v=validateTestMeasurements268(s.testMeasurements265(),product,policy);
 const all=(s.db.prepare('SELECT product_id FROM products').all() as {product_id:string}[]).map(r=>r.product_id);
 const cat=compileCatalog268(v,SCORING_POLICY268,{categoryId:'air_fryers',market:'uk',discoveredVariantIds:all,reviewedAt:'2026-10-16T12:00:00Z',expiresAt:'2026-10-23T12:00:00Z',validationPolicy:policy});
 return {s,cat};
}
const Q='Which air fryer gives the best cooking results for one person while using relatively little electricity?';
const auth={publicKeys:{k:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T13:00:00Z',market:'uk'};
const env=(c:ProductKnowledgeCatalog181,k=keys)=>({catalog:c,keyId:'k',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),k.privateKey).toString('base64')});

test('§3/§10 control: a verified r2 catalog gives a labelled partial comparison; response and decision agree',()=>{
 const {s,cat}=fryers();assert.equal(cat.dimensions[0].valueKind,'raw_quantity_only');assert.equal(cat.policyRevision,'pee268-energy-scoring:r2:partial-comparison-only');
 const a=advise(s,{catalog:env(cat),authority:auth},Q);
 assert.equal(a.goalAssessment!.decision,'partial_comparison');assert.equal(a.response,'partial_comparison');assert.equal(a.ordered,false);assert.equal(a.rankingAuthorized,false);
 assert.equal(a.goalAssessment!.partialComparison!.items.length,2);
 assert.ok(a.unassessedObjectives.includes('cooking_results')&&a.unassessedObjectives.includes('low_energy_use'));
 s.close();
});

test('§3 fault injection: an invalid, expired, wrongly-signed or altered catalog shows none of its measurements but still triggers research',()=>{
 const {s,cat}=fryers();
 const sig=env(cat);const flipped=Buffer.from(sig.signatureBase64,'base64');flipped[5]^=1;
 const altered={...sig,catalog:{...cat,originalTests:cat.originalTests.map(t=>({...t,measured:{...t.measured!,value:t.measured!.value/10}}))}};
 const unpermitted=env({...cat,policyRevision:'pee268-energy-scoring:r1:proposed'});
 const cases:[string,RankingContext253,string][]=[
  ['invalid signature',{catalog:{...sig,signatureBase64:flipped.toString('base64')},authority:auth},'untrusted_key_or_bad_signature'],
  ['expired catalog',{catalog:sig,authority:{...auth,asOf:'2026-10-24T00:00:00Z'}},'expired'],
  ['wrong authority (unpinned signer)',{catalog:env(cat,rogue),authority:auth},'untrusted_key_or_bad_signature'],
  ['altered measurements after signing',{catalog:altered,authority:auth},'untrusted_key_or_bad_signature'],
  ['wrong market',{catalog:sig,authority:{...auth,market:'au'}},'wrong_market'],
  ['policy revision not permitted for partial comparison',{catalog:unpermitted,authority:auth},''],
 ];
 const values=cat.originalTests.map(t=>String(t.measured!.value));assert.equal(values.length,2);
 for(const [why,ctx,reason] of cases){
  const a=advise(s,ctx,Q);
  assert.equal(a.goalAssessment!.partialComparison,undefined,why);assert.notEqual(a.response,'partial_comparison',why);assert.equal(a.rankingAuthorized,false,why);
  const text=JSON.stringify([a.statements,a.limitations,a.goalAssessment]);
  for(const v of values)assert.ok(!text.includes(v),`${why}: measurement ${v} leaked`);
  assert.ok(a.statements.some(x=>/^What would answer this: /.test(x)),why+': targeted research is still stated');
  if(reason){assert.deepEqual(verifySignedCatalog181(ctx.catalog,ctx.authority,{categoryId:'air_fryers'}),{ok:false,reason},why);
   assert.ok(a.researchPlan.some(x=>x.includes(`catalog rejected (${reason})`)),why);}
 }
 s.close();
});

test('§10: owned equipment gives a no-purchase check that does not say "do not buy"; response mirrors the decision',()=>{
 const {s,cat}=fryers();
 const a=advise(s,{catalog:env(cat),authority:auth},'I already have a fan oven. Is an air fryer actually cheaper to run, or should I keep using the oven?');
 assert.equal(a.goalAssessment!.decision,'no_purchase_check');assert.equal(a.response,'no_purchase_check');
 assert.ok(!a.statements.some(x=>/\b(?:do not|don't|must not|should not) buy\b/i.test(x)));
 assert.ok(a.statements.some(x=>/Buying may not be necessary/i.test(x)));
 s.close();
});

test('S78 ra.2: conditions are checked per measurement, never pooled across the need; ra.1 stays for comparison only',()=>{
 const byMeasure=new Map([['energy_per_cooking_task',{sufficiency:'established',conditions:['same_food_load']}],['crisp_panel',{sufficiency:'established',conditions:['blinded_panel']}]]);
 const k={proxies:['energy_empty_run'],byMeasure};
 const d={...panel({A1:'a1',B2:'b2'}).dimensions[0],conditionsMet:['same_food_load']};
 assert.deepEqual(outcomeAuthorisedRa2(k,d,'energy_per_cooking_task'),{ok:true},'the other measurement\'s blinded panel is not a condition of energy');
 assert.deepEqual(outcomeAuthorised270({relevant:[...byMeasure.keys()],proxies:k.proxies,conditions:['blinded_panel','same_food_load']},d,'energy_per_cooking_task'),
  {ok:false,reason:'conditions_not_met'},'ra.1 pooled the conditions (the defect ra.2 corrects)');
 assert.deepEqual(outcomeAuthorisedRa2(k,{...d,conditionsMet:[]},'energy_per_cooking_task'),{ok:false,reason:'conditions_not_met'});
 assert.deepEqual(outcomeAuthorisedRa2(k,d,'energy_empty_run'),{ok:false,reason:'known_proxy'});
 assert.deepEqual(outcomeAuthorisedRa2({proxies:[],byMeasure:new Map([['m',{sufficiency:'unassessed',conditions:[]}]])},d,'m'),{ok:false,reason:'sufficiency_not_established'});
 const w=coffee();const a=advise(w.s,{catalog:signed(panel(w.ids)),authority});
 assert.equal(a.authorisationTrace![0].decidedBy,'ra.2');assert.equal(a.authorisationTrace![0].ra2,'authorised');
 const legacy=adviseFromRequest253(REQUEST,coffee(true,[]).s,CATEGORY_REGISTRY250,{ranking:{catalog:signed(panel(coffee(true,[]).ids)),authority},rankingAuthorisation:'ra.1'});
 assert.equal(legacy.authorisationTrace![0].ra1,'authorised');assert.equal(legacy.authorisationTrace![0].ra2,'sufficiency_not_established','the trace shows what ra.1 accepted without evidence');
});

