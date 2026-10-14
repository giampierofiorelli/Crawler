import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {runJourney248} from '../src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY248} from '../src/phase248_category_registry.js';
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee248-'));
const store=()=>{const s=new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'));seedCategoryHypotheses246(s,'toasters','2026-10-14T12:00:00.000Z');return s;};
const ld=(o:unknown)=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
test('a need-only request infers the category from the need and withholds a recommendation without independent evidence',()=>{
 const s=store();
 const j=runJourney248('My toast always browns evenly on one side only, what should I buy?',s,CATEGORY_REGISTRY248);
 assert.equal(j.stages.category.categoryId,'toasters');assert.equal(j.stages.category.basis,'need_inferred');
 assert.ok(j.stages.need.concepts.some(c=>c.id==='even_browning'));
 assert.equal(j.decision,'withhold_insufficient_evidence');assert.equal(j.blockingStage,'evidence');
 assert.equal(j.rankingAuthorized,false);assert.equal(j.recommendation,null);
 s.close();
});
test('a longer category name wins over the name it contains; two named categories ask for clarification',()=>{
 const s=store();
 assert.equal(runJourney248('Is a toaster oven good for pizza?',s,CATEGORY_REGISTRY248).stages.category.categoryId,'toaster_ovens');
 const j=runJourney248('Toaster or toaster oven for my flat?',s,CATEGORY_REGISTRY248);
 assert.equal(j.decision,'clarify');assert.equal(j.stages.category.basis,'ambiguous');assert.ok(j.clarificationQuestions.length>0);
 s.close();
});
test('a known category without category knowledge is reported as unsupported with an onboarding plan; an unknown named product is out of scope; a vague request is clarified',()=>{
 const s=store();
 const html=`<!doctype html><html><head>${ld({'@context':'https://schema.org','@type':'Product',name:'Kettle K'})}</head><body><main><h1>Kettle K</h1></main></body></html>`;
 s.ingestObservation246({source:{sourceId:'src_shop',host:'shop.example',sourceType:'retailer',sourceTypeBasis:'operator_asserted'},url:'https://shop.example/k',
  sha256:createHash('sha256').update(html).digest('hex'),bytes:html.length,httpStatus:200,fetchedAt:'2026-10-14T12:00:00.000Z',runId:'r',extractorVersion:'x',
  extraction:extractSpecifications245(html,'https://shop.example/k'),categoryHypotheses:['kettles']});
 const k=runJourney248('Which kettle is the quietest?',s,CATEGORY_REGISTRY248);
 assert.equal(k.decision,'unsupported_category');assert.ok(k.researchPlan.some(p=>/1 product identities already known/.test(p)));
 assert.equal(runJourney248('What is the best tablet for drawing?',s,CATEGORY_REGISTRY248).decision,'out_of_scope');
 assert.equal(runJourney248('Can you help me pick something nice?',s,CATEGORY_REGISTRY248).decision,'clarify');
 s.close();
});
test('a budget is understood but reported as unusable while no prices are retained',()=>{
 const s=store();
 const j=runJourney248('A toaster under £40 with wide slots please',s,CATEGORY_REGISTRY248);
 assert.deepEqual([j.stages.need.budget?.currency,j.stages.need.budget?.max],['GBP',40]);
 assert.ok(j.reasons.some(r=>/budget cannot be applied/.test(r)));
 s.close();
});
test.after(()=>rmSync(dir,{recursive:true,force:true}));
