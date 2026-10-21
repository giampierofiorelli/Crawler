// First increment A1 (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-first-increment-authorisation-2026-10-21.md): C2 under every experimental option and on the ranking path.
// "Nessuna conoscenza non revisionata deve raggiungere la risposta come fatto accertato. Mantieni le inferenze
// sperimentali isolate, identificate e prive di effetti decisionali." The owner review of the coordinated plan adds that
// the protection must be permanent and must not depend on today's presentation layer.
//
// What these tests protect, for arms A, B and C-lite, with and without a signed ranking context:
//  1. no decision effect: every field of the answer except the experimental one is identical to the answer without the
//     option (not a chosen subset of fields);
//  2. isolation: unreviewed statements (their text and their ids) never appear outside the experimental field;
//  3. identification: the experimental field and each inference declare themselves experimental and unreviewed;
//  4. permanence: the contract lists the experimental fields, offers the projection a presentation must use, and a
//     source scan fails when a new module or script reads an experimental field without being reviewed here;
//  5. the store itself refuses a translated statement marked reviewed or usable for ranking.
// SYNTHETIC worlds (fictional machines, keys, statements): T1 wiring of the operational components.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {COFFEE_TEACHING269,COFFEE_SOURCES269} from '../src/phase269_research_teaching.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {CONCEPT_VOCABULARY248} from '../src/phase248_concept_vocabulary.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265} from '../src/phase265_test_measurements.js';
import {assessRelation247,relations247} from '../src/phase247_category_relations.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import type {ProductKnowledgeCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {translateDocument} from '../src/knowledge_translation.js';
import {recordTranslation} from '../src/knowledge_statements.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {adviseFromRequest253,type RankingContext253} from '../src/phase253_request_advice.js';
import {EXPERIMENTAL_FIELDS253,withoutExperimental253,type Advice253} from '../src/phase253_advice_contract.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {compileRuleSet} from '../src/knowledge_rules.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const qk=loadQuantityKnowledge();const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const CANDIDATES=compileRuleSet(JSON.parse(readFileSync(new URL('../../resources/request-semantics/need-candidates.v1.json',import.meta.url),'utf8'))).get('need_candidates')!;
type Opts=NonNullable<Parameters<typeof adviseFromRequest253>[3]>;
const ARMS:{name:string;ni:NonNullable<Opts['needInterpretation']>}[]=[
 {name:'A',ni:{knowledgeGuided:false}},{name:'B',ni:{knowledgeGuided:true}},{name:'C-lite',ni:{knowledgeGuided:true,candidates:CANDIDATES}}];
const strip=(a:Advice253)=>JSON.stringify(withoutExperimental253(a));

// ---- world 1: air purifiers and dishwashers with translated (unreviewed) statements that arm B uses
const DOC=['# Context','','“We keep it running overnight beside the bed” bears on: quiet operation during sleep.','',
 'A sleep-mode label does not establish quiet operation at a useful clean-air rate.','','“The dishwasher runs while the household is asleep” bears on: quiet operation at night.'].join('\n');
function purifierWorld(){const s=new KnowledgeStore246(':memory:');registerTeachingSources252(SOURCES271);
 applyTeaching252(s,[DISHWASHER_TEACHING271,AIR_PURIFIER_TEACHING271],'2026-10-17T10:00:00.000Z');
 for(const cat of ['air_purifiers','dishwashers'])recordTranslation(s,{categoryId:cat,sourceDocument:'i1-synthetic.md',sourceSha256:sha(DOC),translator:'t-i1',
  statements:translateDocument(qk,DOC,{source:cat}).statements},{at:'2026-10-21T00:00:00Z'});
 return s;}
const W1=purifierWorld();
const INFERRING='I want an air purifier; we keep it running overnight beside the bed.';
const REQUESTS1=[INFERRING,'I need an air purifier for the bedroom, noise doesn\'t bother me.','A dishwasher under 45 cm wide, we run it overnight.',
 'I want an air purifier with a sleep mode.','Which TV should I buy?'];

test('A1 non-vacuity: arm B infers a need from unreviewed statements on this world', ()=>{
 const b=adviseFromRequest253(INFERRING,W1,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:{knowledgeGuided:true}});
 assert.ok(b.needInterpretation!.inferred.length>0,'B infers something, so the isolation tests below are not vacuous');
});

test('A1: no decision effect under A, B and C-lite: the whole answer except the experimental field is unchanged', ()=>{
 for(const t of REQUESTS1){const plain=adviseFromRequest253(t,W1,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21'});
  assert.equal(plain.needInterpretation,undefined,'operational answers carry no experimental field');
  for(const arm of ARMS){const a=adviseFromRequest253(t,W1,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:arm.ni});
   assert.equal(strip(a),JSON.stringify(plain),`arm ${arm.name} changed a field other than the experimental one: ${t}`);}}
});

test('A1: unreviewed statements (text and ids) never appear outside the experimental field', ()=>{
 const rendered=W1.db.prepare(`SELECT statement_id,rendered FROM knowledge_statements`).all() as {statement_id:string;rendered:string}[];
 assert.ok(rendered.length>0);
 for(const t of REQUESTS1)for(const arm of ARMS){const a=adviseFromRequest253(t,W1,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:arm.ni});
  const outside=strip(a);const whole=JSON.stringify(a);
  for(const r of rendered){assert.ok(!outside.includes(r.statement_id),`a statement id reached the answer outside the experimental field (${arm.name})`);
   assert.ok(!whole.includes(r.rendered),`a translated statement's text reached the answer (${arm.name}): ${r.rendered}`);}}
});

test('A1: the experimental field and each inference identify themselves as experimental and unreviewed', ()=>{
 for(const arm of ARMS){const n=adviseFromRequest253(INFERRING,W1,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:arm.ni}).needInterpretation!;
  assert.equal(n.status,'experimental_unreviewed',`arm ${arm.name}: the block declares its status`);
  assert.match(n.statusNote,/not established facts/);
  for(const i of n.inferred){assert.equal(i.state,'experimental_unverified');
   for(const p of i.path)assert.ok(p.some(x=>x.step==='statement'&&/^kst_/.test(x.ref)&&/unreliable_type|reliable_type|unmeasured_type/.test(x.text)),'each path names its statement and reliability class');}}
});

// ---- world 2: the S80 coffee world with a signed catalog that ranks (control) and translated statements
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const RANK_REQ='Which espresso machine makes the best-tasting traditional Italian espresso for under £600? We drink it every morning before work.';
function coffeeWorld(){const s=new KnowledgeStore246(':memory:',CLASS);seedCategoryHypotheses246(s,'coffee_machines');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.coffee_machines))s.addConceptAliases246('coffee_machines',id,al);
 const q=COFFEE_TEACHING269.needs.find(n=>n.id==='espresso_quality')!;
 const t={...structuredClone(COFFEE_TEACHING269),needs:[...COFFEE_TEACHING269.needs,{...q,measureId:'shot_temperature_profile',conditions:['consecutive_shots'],proxies:[],
  outcome:{...q.outcome!,text:'Brew temperature at the coffee bed over consecutive shots (fictional test method).'}}]};
 registerTeachingSources252(COFFEE_SOURCES269);applyTeaching252(s,[t],'2026-10-16T08:30:00.000Z');
 const items=s.categoryItems246('coffee_machines');const ref=(id:string)=>'item:'+items.find(i=>i.concept?.id===id)!.itemId;
 const rel=relations247(s,'coffee_machines').find(r=>r.kind==='measured_by'&&r.from===ref('espresso_sensory_assessment')&&r.to===ref('espresso_quality'))!;
 assessRelation247(s,{relationId:rel.relationId,value:'establishes',basis:'teaching_source_statement',independence:'human_reviewer',assessor:'fictional-source',citation:'fictional panel method page (test fixture)'},'2026-10-16T08:31:00.000Z');
 const CDOC=['# Mornings','','“We drink it every morning before work” bears on: little effort and low maintenance.','','Espresso quality cannot be judged from crema colour alone.'].join('\n');
 recordTranslation(s,{categoryId:'coffee_machines',sourceDocument:'i1-coffee.md',sourceSha256:sha(CDOC),translator:'t-i1',statements:translateDocument(qk,CDOC,{source:'coffee_machines'}).statements},{at:'2026-10-21T00:00:00Z'});
 const ids:Record<string,string>={};
 for(const [name,mpn,price] of [['Aurora A1 Espresso Machine','A1',399],['Borealis B2 Espresso Machine','B2',549]] as const){
  const url=`https://maker-${mpn.toLowerCase()}.pee-i1.test/p/${mpn}`;
  const html=`<html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,brand:'Fictional Co',mpn,model:mpn,
   offers:{'@type':'Offer',price:String(price),priceCurrency:'GBP'}})}</script></head><body><h1>${name}</h1></body></html>`;
  const x=extractSpecifications245(html,url);
  const r=s.ingestObservation246({source:{sourceId:'src_'+mpn,host:new URL(url).host,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
   httpStatus:200,fetchedAt:'2026-10-16T09:00:00.000Z',runId:'i1',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['coffee_machines'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)});
  ids[mpn]=r.productIds[0];}
 return {s,ids};}
const keys=generateKeyPairSync('ed25519');
const authority={publicKeys:{panel_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T12:00:00Z',market:'uk'};
function ranking(ids:Record<string,string>):RankingContext253{
 const obs=(mpn:string,p:number)=>({variantId:ids[mpn],name:mpn,observations:[{dimensionKey:'espresso_quality',valuePoints:p,hardOutcome:'pass' as const,evidenceId:'t_'+mpn.toLowerCase()}]});
 const c:ProductKnowledgeCatalog181={phase:181,schema:'181.1',market:'uk',categoryId:'coffee_machines',knowledgeRevision:'synthetic_panel_v1',policyRevision:'synthetic_taste_policy_v1',
  reviewedAt:'2026-10-15T00:00:00Z',expiresAt:'2026-11-15T00:00:00Z',discoveredVariantIds:[ids.A1,ids.B2],marketCoverageComplete:false,
  coverageStatement:'Synthetic controlled set of fictional machines; not market data.',
  dimensions:[{key:'espresso_quality',label:'Traditional espresso taste (specialist panel)',value:{kind:'boolean',value:true},methodId:'synthetic_specialist_panel',protocolVersion:'v1',
   measureId:'espresso_sensory_assessment',conditionsMet:['same_beans_and_grind','consecutive_shots'],weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'synthetic_weights',normalizationReviewReference:'synthetic_normalisation'}],
  originalTests:['A1','B2'].map(m=>({id:'t_'+m.toLowerCase(),variantId:ids[m],dimensionKey:'espresso_quality',originalTestId:'panel_'+m.toLowerCase(),methodId:'synthetic_specialist_panel',protocolVersion:'v1',
   sourceUrl:`https://panel.pee-i1.test/${m}`,observedAt:'2026-10-14T00:00:00Z',scope:'exact_variant_original_professional_test' as const})),
  products:[obs('A1',8000),obs('B2',9000)],externalReviewReference:'synthetic_panel_review'};
 return {catalog:{catalog:c,keyId:'panel_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')},authority};}

test('A1 ranking path: under A, B and C-lite the ranked answer is identical to the answer without the option', ()=>{
 const w=coffeeWorld();const ctx=ranking(w.ids);
 const plain=adviseFromRequest253(RANK_REQ,w.s,CATEGORY_REGISTRY250,{ranking:ctx,quantityKnowledge:qk,date:'2026-10-21'});
 assert.equal(plain.response,'ranked_recommendation','non-vacuous: this catalog ranks');assert.ok(plain.ranked!.length===2);
 for(const arm of ARMS){const a=adviseFromRequest253(RANK_REQ,w.s,CATEGORY_REGISTRY250,{ranking:ctx,quantityKnowledge:qk,date:'2026-10-21',needInterpretation:arm.ni});
  assert.ok(a.needInterpretation,'the experimental field is present');
  assert.equal(strip(a),JSON.stringify(plain),`arm ${arm.name} changed the ranked answer`);
  const ids=(w.s.db.prepare(`SELECT statement_id FROM knowledge_statements`).all() as {statement_id:string}[]).map(r=>r.statement_id);
  for(const id of ids)assert.ok(!JSON.stringify(a.ranked).includes(id)&&!JSON.stringify(a.authorisationTrace??[]).includes(id),'no unreviewed statement in the ranking or its trace');}
});

test('A1 permanence: the contract lists the experimental fields and its projection removes them all', ()=>{
 assert.ok(EXPERIMENTAL_FIELDS253.includes('needInterpretation'));
 const a=adviseFromRequest253(INFERRING,W1,CATEGORY_REGISTRY250,{quantityKnowledge:qk,date:'2026-10-21',needInterpretation:{knowledgeGuided:true}});
 const p=withoutExperimental253(a) as unknown as Record<string,unknown>;
 for(const f of EXPERIMENTAL_FIELDS253)assert.ok(!(f in p),'projection keeps '+f);
 assert.ok('needInterpretation' in a,'the original is not mutated');
});

/** Every reader of an experimental field must be reviewed here: a new consumer fails this test until it is shown to
 * present the content as experimental (or to read it only for evaluation). Owner: the protection is permanent and does
 * not depend on today's presentation layer. */
const REVIEWED_READERS:Record<string,string>={
 'src/need_interpretation.ts':'producer of the field',
 'src/phase253_request_advice.ts':'attaches the field; never reads it for a decision',
 'src/phase253_advice_contract.ts':'declares the field and the projection without it',
 'scripts/r3p-needs-check.mjs':'evaluation scorer (private outputs, never shown to users)',
 'scripts/r3p-needs-dev.mjs':'evaluation development runner (private outputs)',
 'scripts/i1-reachability-record.mjs':'names the option configuration only; measures which modules run, never reads the field',
};
test('A1 permanence: no unreviewed module or script reads an experimental field', ()=>{
 const root=new URL('../../',import.meta.url);const found:string[]=[];
 for(const dir of ['src','scripts'])for(const f of readdirSync(new URL(dir+'/',root))){if(!/\.(ts|mjs|js)$/.test(f))continue;
  const text=readFileSync(new URL(`${dir}/${f}`,root),'utf8');
  if(EXPERIMENTAL_FIELDS253.some(x=>text.includes(x)))found.push(`${dir}/${f}`);}
 const unreviewed=found.filter(f=>!(f in REVIEWED_READERS));
 assert.deepEqual(unreviewed,[],'new reader(s) of an experimental field: review them and present the content as experimental, not as established fact');
});

test('A1 permanence: the store refuses a translated statement marked reviewed or usable for ranking', ()=>{
 const s=new KnowledgeStore246(':memory:');
 const ins=(review:string,ranking:number)=>s.db.prepare(`INSERT INTO knowledge_statements(statement_id,category_id,source_document,source_sha256,line,headings_json,type,polarity,hedge,
  status_json,scope_json,subject_json,object_json,parts_json,rendered,quote_sha256,self_check_json,translator,reliability,review,ranking_input,state,recorded_at)
  VALUES (?,?,?,?,?,'[]','definition','positive',NULL,'[]','[]',NULL,NULL,'[]','x',?,'[]','t','unreliable_type',?,?,'current','2026-10-21')`).run('kst_'+review+ranking,'air_purifiers','d.md','0'.repeat(64),1,'0'.repeat(64),review,ranking);
 assert.throws(()=>ins('human_reviewed',0),/CHECK/);
 assert.throws(()=>ins('machine_translated_unreviewed',1),/CHECK/);
 ins('machine_translated_unreviewed',0);
});
