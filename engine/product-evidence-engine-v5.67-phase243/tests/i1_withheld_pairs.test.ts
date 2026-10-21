// First increment A3 (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
// owner-first-increment-authorisation-2026-10-21.md): "Proteggi con test specifici entrambe le coppie remain_withheld,
// senza autorizzarne il rilascio."
// The two (need, measurement) pairs of the household-dishwasher teaching that the S79 release rule withholds were
// re-checked in S80 (evaluation/s80/withheld-pairs-verification.json: both remain_withheld). Until now only the generic
// release rule was tested. These tests pin THESE two pairs on the full request -> advice path:
//  - with the strongest assessment and every condition of the pair's own measurement met, neither pair orders products
//    (the release rule withholds it: ra.1 refuses, ra.2 alone would accept);
//  - with the basis actually recorded for them (same-model reading), they are refused earlier (S85);
//  - the validated list holds neither pair, and any future entry must cite a recorded validation of that pair.
// SYNTHETIC world (fictional machines and keys) with the real Phase271 teaching: T1 wiring.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';import {createHash,generateKeyPairSync,sign} from 'node:crypto';
import {KnowledgeStore246,DEFAULT_STORAGE_POLICY246,type StoragePolicy246} from '../src/phase246_knowledge_store.js';
import {FACTUAL_CLASS_POLICY249} from '../src/phase249_retention_policy.js';
import {applyTeaching252,registerTeachingSources252} from '../src/phase252_category_teaching.js';
import {DISHWASHER_TEACHING271,SOURCES271} from '../src/phase271_category_teaching.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {testLeadsFromHtml265} from '../src/phase265_test_measurements.js';
import {assessRelation247,relations247} from '../src/phase247_category_relations.js';
import {canonicalJson180} from '../src/phase180_reviewed_first_answer.js';
import type {ProductKnowledgeCatalog181} from '../src/phase181_dynamic_knowledge_ranking.js';
import {adviseFromRequest253,VALIDATED_NEW_AUTHORISATIONS,type RankingContext253} from '../src/phase253_request_advice.js';
import {CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';

const ROOT=new URL('../../',import.meta.url).pathname;
const RECORD=JSON.parse(readFileSync(ROOT+'evaluation/s80/withheld-pairs-verification.json','utf8')) as {pairs:{category:string;need:string;measure:string;verdict:string;taughtConditions:string[]}[]};
const PAIRS=[
 {need:'cleaning_soil_removal',measure:'residual_soil_score_by_soil_type',request:'Which dishwasher is best for scrubbing dried egg? I want to avoid pre-rinsing.'},
 {need:'water_per_cycle_and_workload',measure:'litres_per_completed_workload',request:'Which dishwasher will save water? Our water supply is metered.'}];
const CLASS:StoragePolicy246={...DEFAULT_STORAGE_POLICY246,policyVersion:'pee249-class-policy',classPolicy:FACTUAL_CLASS_POLICY249};
const sha=(x:string)=>createHash('sha256').update(x).digest('hex');
const keys=generateKeyPairSync('ed25519');
const authority={publicKeys:{panel_reviewer:keys.publicKey.export({type:'spki',format:'pem'}).toString()},asOf:'2026-10-16T12:00:00Z',market:'uk'};

function world(pair:typeof PAIRS[number],independence:'human_reviewer'|'same_model_not_independent'){
 const s=new KnowledgeStore246(':memory:',CLASS);registerTeachingSources252(SOURCES271);applyTeaching252(s,[DISHWASHER_TEACHING271],'2026-10-17T10:00:00.000Z');
 const items=s.categoryItems246('dishwashers');
 const refs=(id:string)=>new Set(items.filter(i=>i.concept?.id===id).map(i=>'item:'+i.itemId));
 const rel=relations247(s,'dishwashers').find(r=>r.kind==='measured_by'&&refs(pair.measure).has(r.from)&&refs(pair.need).has(r.to));
 assert.ok(rel,`the teaching relates ${pair.measure} to ${pair.need}`);
 assessRelation247(s,{relationId:rel!.relationId,value:'establishes',basis:independence==='human_reviewer'?'teaching_source_statement':'blind_source_verification',independence,
  assessor:'fictional-assessor',citation:'fictional method record (test fixture)'},'2026-10-17T10:01:00.000Z');
 const ids:Record<string,string>={};
 for(const [name,mpn,price] of [['Calypso C1 Dishwasher','C1',399],['Delta D2 Dishwasher','D2',449]] as const){
  const url=`https://maker-${mpn.toLowerCase()}.pee-i1.test/p/${mpn}`;
  const html=`<html><head><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name,brand:'Fictional Co',mpn,model:mpn,
   offers:{'@type':'Offer',price:String(price),priceCurrency:'GBP'}})}</script></head><body><h1>${name}</h1></body></html>`;
  const x=extractSpecifications245(html,url);
  const r=s.ingestObservation246({source:{sourceId:'src_'+mpn,host:new URL(url).host,sourceType:'manufacturer',sourceTypeBasis:'operator_asserted'},url,sha256:sha(html),bytes:html.length,
   httpStatus:200,fetchedAt:'2026-10-17T09:00:00.000Z',runId:'i1',extractorVersion:'phase245@test',extraction:x,categoryHypotheses:['dishwashers'],testLeads:testLeadsFromHtml265(html,url,sha(html),x)});
  ids[mpn]=r.productIds[0];}
 return {s,ids};
}
function ranking(pair:typeof PAIRS[number],ids:Record<string,string>,conditionsMet:string[]):RankingContext253{
 const obs=(mpn:string,p:number)=>({variantId:ids[mpn],name:mpn,observations:[{dimensionKey:pair.need,valuePoints:p,hardOutcome:'pass' as const,evidenceId:'t_'+mpn.toLowerCase()}]});
 const c:ProductKnowledgeCatalog181={phase:181,schema:'181.1',market:'uk',categoryId:'dishwashers',knowledgeRevision:'synthetic_lab_v1',policyRevision:'synthetic_policy_v1',
  reviewedAt:'2026-10-15T00:00:00Z',expiresAt:'2026-11-15T00:00:00Z',discoveredVariantIds:[ids.C1,ids.D2],marketCoverageComplete:false,
  coverageStatement:'Synthetic controlled set of fictional machines; not market data.',
  dimensions:[{key:pair.need,label:'synthetic dimension',value:{kind:'boolean',value:true},methodId:'synthetic_lab_method',protocolVersion:'v1',measureId:pair.measure,conditionsMet,
   weightUnits:{hard:8000,high:4000,normal:2000,low:500},weightingReviewReference:'synthetic_weights',normalizationReviewReference:'synthetic_normalisation'}],
  originalTests:['C1','D2'].map(m=>({id:'t_'+m.toLowerCase(),variantId:ids[m],dimensionKey:pair.need,originalTestId:'lab_'+m.toLowerCase(),methodId:'synthetic_lab_method',protocolVersion:'v1',
   sourceUrl:`https://lab.pee-i1.test/${m}`,observedAt:'2026-10-14T00:00:00Z',scope:'exact_variant_original_professional_test' as const})),
  products:[obs('C1',8000),obs('D2',9000)],externalReviewReference:'synthetic_lab_review'};
 return {catalog:{catalog:c,keyId:'panel_reviewer',signatureBase64:sign(null,Buffer.from(canonicalJson180(c)),keys.privateKey).toString('base64')},authority};
}

test('A3: the public record keeps both pairs remain_withheld', ()=>{
 for(const p of PAIRS){const r=RECORD.pairs.find(x=>x.need===p.need&&x.measure===p.measure);
  assert.ok(r,`${p.need}/${p.measure} is in the S80 record`);assert.equal(r!.category,'dishwashers');assert.equal(r!.verdict,'remain_withheld');}
});

test('A3: neither pair is validated; a future entry must cite a recorded validation of that very pair', ()=>{
 for(const p of PAIRS)assert.ok(!VALIDATED_NEW_AUTHORISATIONS.some(v=>v.need===p.need&&v.measure===p.measure),`${p.need}/${p.measure} must stay withheld`);
 for(const v of VALIDATED_NEW_AUTHORISATIONS){assert.ok(existsSync(ROOT+v.validation),`validation record ${v.validation} must exist`);
  const rec=JSON.parse(readFileSync(ROOT+v.validation,'utf8')) as {pairs?:{need:string;measure:string;verdict:string}[]};
  const r=rec.pairs?.find(x=>x.need===v.need&&x.measure===v.measure);
  assert.ok(r&&r.verdict!=='remain_withheld',`${v.need}/${v.measure}: the cited record must validate this pair`);}
});

for(const p of PAIRS){
 test(`A3: ${p.need} / ${p.measure} never orders products, even with the strongest assessment and its own conditions met`, ()=>{
  const own=RECORD.pairs.find(x=>x.need===p.need&&x.measure===p.measure)!.taughtConditions;
  const w=world(p,'human_reviewer');
  const a=adviseFromRequest253(p.request,w.s,CATEGORY_REGISTRY250,{ranking:ranking(p,w.ids,own)});
  assert.equal(a.category,'dishwashers');assert.ok(a.needs.includes(p.need),`the request states ${p.need} (non-vacuous)`);
  const tr=a.authorisationTrace?.find(t=>t.measure===p.measure);
  assert.ok(tr,'the ranking step considered this pair (non-vacuous)');
  assert.equal(tr!.ra2,'authorised','ra.2 alone would accept: this is the withheld case');
  assert.notEqual(tr!.ra1,'authorised');
  assert.equal(tr!.decision,'new_authorisation_pending_validation');
  assert.equal(a.rankingAuthorized,false);assert.equal(a.ordered,false);assert.notEqual(a.response,'ranked_recommendation');assert.equal(a.ranked??null,null);
 });
 test(`A3: ${p.need} / ${p.measure} with its recorded basis (same-model reading) is refused before the release rule`, ()=>{
  const own=RECORD.pairs.find(x=>x.need===p.need&&x.measure===p.measure)!.taughtConditions;
  const w=world(p,'same_model_not_independent');
  const a=adviseFromRequest253(p.request,w.s,CATEGORY_REGISTRY250,{ranking:ranking(p,w.ids,own)});
  const tr=a.authorisationTrace?.find(t=>t.measure===p.measure)!;
  assert.equal(tr.decision,'sufficiency_same_model_only');assert.equal(a.rankingAuthorized,false);assert.equal(a.ranked??null,null);
 });
}
