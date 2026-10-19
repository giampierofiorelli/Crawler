import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {CONCEPT_VOCABULARY248} from '../src/phase248_concept_vocabulary.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {adviseFromRequest253,teachingCaveatsShadow,type RankingContext253} from '../src/phase253_request_advice.js';
import {assessRelation247,relations247} from '../src/phase247_category_relations.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import type {ProductKnowledgeCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {testLeadsFromHtml265} from '../src/phase265_test_measurements.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {COFFEE_TEACHING269,COFFEE_SOURCES269} from '../src/phase269_research_teaching.js';
import {loadQuantityKnowledge} from '../src/quantity_knowledge.js';
import {translateDocument} from '../src/knowledge_translation.js';
import {recordTranslation} from '../src/knowledge_statements.js';

// S80 C2 (owner R3 consolidation, priority 2: decision safety). END-TO-END guards on the real request -> advice path,
// not unit checks or source greps: (A) a pair the release rule withholds never orders products, whatever signed catalog
// is supplied, while the same catalog ranks once the withholding reason is gone (non-vacuous); (B) machine-translated
// statements never reach any user-facing field although the store holds caveats PEE would attach (non-vacuous).
// SYNTHETIC world (fictional machines, hosts, keys): T1 wiring of the operational components.
const REQUEST='Which espresso machine makes the best-tasting traditional Italian espresso for under £600?';
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const MACHINES=[['Aurora A1 Espresso Machine','A1',399],['Borealis B2 Espresso Machine','B2',549]] as const;

/** `secondMeasure`: the taste outcome also has a second measurement with its own condition: the case where ra.1 pooled
 * both conditions and refused, while ra.2 (own conditions only) would authorise: the S79 'withheld' case. */
function world(o:{secondMeasure:boolean;establishes:boolean}){
 const s=new KnowledgeStore246(':memory:',CLASS);seedCategoryHypotheses246(s,'coffee_machines');
 for(const [id,al] of Object.entries(CONCEPT_VOCABULARY248.coffee_machines))s.addConceptAliases246('coffee_machines',id,al);
 let t=structuredClone(COFFEE_TEACHING269);
 if(o.secondMeasure){const q=t.needs.find(n=>n.id==='espresso_quality')!;
  t={...t,needs:[...t.needs,{...q,measureId:'shot_temperature_profile',conditions:['consecutive_shots'],proxies:[],
   outcome:{...q.outcome!,text:'Brew temperature at the coffee bed over consecutive shots (fictional test method).'}}]};}
 registerTeachingSources252(COFFEE_SOURCES269);applyTeaching252(s,[t],'2026-10-16T08:30:00.000Z');
 const items=s.categoryItems246('coffee_machines');const ref=(id:string)=>'item:'+items.find(i=>i.concept?.id===id)!.itemId;
 const rel=relations247(s,'coffee_machines').find(r=>r.kind==='measured_by'&&r.from===ref('espresso_sensory_assessment')&&r.to===ref('espresso_quality'))!;
 if(o.establishes)assessRelation247(s,{relationId:rel.relationId,value:'establishes',basis:'teaching_source_statement',independence:'human_reviewer',assessor:'fictional-source',citation:'fictional panel method page (test fixture)'},'2026-10-16T08:31:00.000Z');
 const ids:Record<string,string>={};
 for(const [name,mpn,price] of MACHINES){
  const url=`https://maker-${mpn.toLowerCase()}.pee-s80.test/p/${mpn}`;
  const html=`<html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,brand:'Fictional Co',mpn,model:mpn,
   offers:{'@type':'Offer',price:String(price),priceCurrency:'GBP'}})}</script></head><body><h1>${name}</h1></body></html>`;
  const x=extractSpecifications245(html,url);
  const r=s.ingestObservation246({source:{sourceId:'src_'+mpn,host:new URL(url).host,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
   httpStatus:200,fetchedAt:'2026-10-16T09:00:00.000Z',runId:'s80',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['coffee_machines'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)});
  ids[mpn]=r.productIds[0];
 }
 return {s,ids};
}
const keys=generateKeyPairSync('ed25519');
const authority={publicKeys:{panel_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T12:00:00Z',market:'uk'};
function catalog(ids:Record<string,string>,conditionsMet:string[]):ProductKnowledgeCatalog181{
 const obs=(mpn:string,p:number)=>({variantId:ids[mpn],name:mpn,observations:[{dimensionKey:'espresso_quality',valuePoints:p,hardOutcome:'pass' as const,evidenceId:'t_'+mpn.toLowerCase()}]});
 return {phase:181,schema:'181.1',market:'uk',categoryId:'coffee_machines',knowledgeRevision:'synthetic_panel_v1',policyRevision:'synthetic_taste_policy_v1',
  reviewedAt:'2026-10-15T00:00:00Z',expiresAt:'2026-11-15T00:00:00Z',discoveredVariantIds:[ids.A1,ids.B2],marketCoverageComplete:false,
  coverageStatement:'Synthetic controlled set of fictional machines; not market data.',
  dimensions:[{key:'espresso_quality',label:'Traditional espresso taste (specialist panel)',value:{kind:'boolean',value:true},methodId:'synthetic_specialist_panel',protocolVersion:'v1',
   measureId:'espresso_sensory_assessment',conditionsMet,weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'synthetic_weights',normalizationReviewReference:'synthetic_normalisation'}],
  originalTests:['A1','B2'].map(m=>({id:'t_'+m.toLowerCase(),variantId:ids[m],dimensionKey:'espresso_quality',originalTestId:'panel_'+m.toLowerCase(),methodId:'synthetic_specialist_panel',protocolVersion:'v1',
   sourceUrl:`https://panel.pee-s80.test/${m}`,observedAt:'2026-10-14T00:00:00Z',scope:'exact_variant_original_professional_test' as const})),
  products:[obs('A1',8000),obs('B2',9000)],externalReviewReference:'synthetic_panel_review'};
}
const ctx=(c:ProductKnowledgeCatalog181):RankingContext253=>({catalog:{catalog:c,keyId:'panel_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')},authority});

test('S80 C2-A: a withheld authorisation (ra.2 would accept, ra.1 refused) never orders products on the full path',()=>{
 const w=world({secondMeasure:true,establishes:true});
 const a=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:ctx(catalog(w.ids,['same_beans_and_grind']))});
 const tr=a.authorisationTrace!.find(t=>t.measure==='espresso_sensory_assessment')!;
 assert.equal(tr.ra2,'authorised');assert.equal(tr.ra1,'conditions_not_verified');assert.equal(tr.decision,'new_authorisation_pending_validation');
 assert.equal(a.rankingAuthorized,false);assert.equal(a.ordered,false);assert.notEqual(a.response,'ranked_recommendation');
 assert.equal(a.ranked??null,null);
 assert.ok(a.unassessedObjectives.some(o=>/best-tasting/.test(o)),'the taste objective stays explicitly unassessed');
 assert.ok(a.limitations.some(l=>/new authorisation pending validation/.test(l)),'the refusal is stated');
});
test('S80 C2-A (control): the same catalog ranks once no rule refuses it, so the withholding above is the release rule',()=>{
 const w=world({secondMeasure:true,establishes:true});
 const a=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:ctx(catalog(w.ids,['same_beans_and_grind','consecutive_shots']))});
 assert.equal(a.response,'ranked_recommendation');assert.equal(a.rankingAuthorized,true);
 assert.deepEqual(a.ranked!.map(x=>x.rank),[1,2]);
});
test('S80 C2-A: without positive sufficiency evidence no catalog ranks, even one ra.1 alone would have accepted',()=>{
 const w=world({secondMeasure:false,establishes:false});
 const a=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{ranking:ctx(catalog(w.ids,['same_beans_and_grind']))});
 const tr=a.authorisationTrace![0];
 assert.equal(tr.ra1,'authorised');assert.equal(tr.decision,'sufficiency_not_established');
 assert.equal(a.rankingAuthorized,false);assert.equal(a.ordered,false);
});
test('S80 C2-A: the production entry point accepts no rule choice (ra.1 cannot be switched back on by a caller)',()=>{
 const w=world({secondMeasure:false,establishes:false});
 const opts={ranking:ctx(catalog(w.ids,['same_beans_and_grind'])),rankingAuthorisation:'ra.1'} as unknown as Parameters<typeof adviseFromRequest253>[3];
 const a=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,opts);
 assert.equal(a.rankingAuthorized,false);assert.equal(a.authorisationTrace![0].decidedBy,'ra.2-restrict-only');
});

test('S80 C2-B: machine-translated caveats never reach any field of the answer, although PEE holds caveats it would attach',()=>{
 const w=world({secondMeasure:false,establishes:false});const qk=loadQuantityKnowledge();
 const DOC=['# Espresso quality','','Espresso quality cannot be judged from crema colour alone.','','Espresso quality is not a crema thickness.'].join('\n');
 const st=translateDocument(qk,DOC,{source:'coffee_machines',concepts:[{id:'espresso_quality',statement:'Espresso quality.',aliases:['espresso quality']}]}).statements;
 recordTranslation(w.s,{categoryId:'coffee_machines',sourceDocument:'s80.md',sourceSha256:sha(DOC),translator:'t-s80',statements:st},{at:'2026-10-19T00:00:00Z'});
 const a=adviseFromRequest253(REQUEST,w.s,CATEGORY_REGISTRY250,{});
 const shadow=teachingCaveatsShadow(w.s,a);
 assert.ok(shadow.length>0,'non-vacuous: the store holds a caveat PEE would attach to this answer');
 const answer=JSON.stringify(a);
 for(const c of shadow)assert.ok(!answer.includes(c.caveat.rendered),'a translated caveat reached the answer: '+c.caveat.rendered);
 assert.ok(!/crema colour|crema thickness/i.test(answer),'no wording of the translated document reaches the answer');
});
