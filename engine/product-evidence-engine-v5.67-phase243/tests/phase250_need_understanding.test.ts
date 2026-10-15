import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {KnowledgeStore246} from '../src/phase246_knowledge_store.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {runJourney248} from '../src/phase248_advisory_journey.js';
import {CATEGORY_REGISTRY248,CATEGORY_REGISTRY250} from '../src/phase248_category_registry.js';
import {composeQuestion125} from '../src/phase125_compositional_dialogue_frame.js';
import {ADOPTED_LESSONS250,CURRICULUM_B250,ADAPTIVE_C250,applyLessons250,lessonBudget250,registryWithLessons250} from '../src/phase250_category_lessons.js';
// Phase250 T1 tests: constructed contrast pairs for the generic repairs and the category lessons (mechanics only; the
// generalisation evidence is the set 3 first run in evaluation/phase250/).
process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee250-'));
const AT='2026-10-15T12:00:00.000Z';
const store=(lessons=ADOPTED_LESSONS250)=>{const s=new KnowledgeStore246(join(dir,'s'+Math.random().toString(36).slice(2)+'.sqlite'));
 for(const c of ['air_fryers','coffee_machines','toasters'])seedCategoryHypotheses246(s,c,AT);applyLessons250(s,lessons,AT);return s;};
const S=[{id:'x',aliases:['thing'],aspects:[],schemaReviewId:'r'}];
const budget=(q:string)=>composeQuestion125(q,S).userBudget;

test('budgets written as real requests write them are anchored limits; unanchored prices are not budgets',()=>{
 assert.deepEqual(budget('one of the < $500 manual espresso machines'),{currency:'USD',min:null,max:500});
 assert.deepEqual(budget("I'd like to spend 70€ tops."),{currency:'EUR',min:null,max:70});
 assert.deepEqual(budget("Don't want to go over 500 euros."),{currency:'EUR',min:null,max:500});
 assert.deepEqual(budget('a good one that is $120 or less'),{currency:'USD',min:null,max:120});
 assert.deepEqual(budget('my budget is around 200 pounds'),{currency:'GBP',min:null,max:200});
 assert.equal(budget('Is the $999 robot vacuum best?'),null);
 assert.equal(budget('costs about $300'),null);
 assert.equal(budget('ranging from simple $25 models to $250'),null);
 assert.equal(budget('budget $600 and £400'),null);
});
test('a named product PEE does not model is delimited per sentence and never reaches coffee through shared words',()=>{
 const s=store([]);
 const j=runJourney248("Ideal pressure cooker size for a pound of beans. I'm shopping for a pressure cooker. Could anyone advise on the size?",s,CATEGORY_REGISTRY248);
 assert.equal(j.stages.category.categoryId,null);assert.equal(j.stages.category.namedUnknownTerm,'pressure cooker');assert.equal(j.decision,'out_of_scope');
 s.close();
});
test('plural product words no longer produce chance need matches',()=>{
 const s=store([]);
 const j=runJourney248('There are dozens of machines and makers on the market, it is very hard to choose; what is the cheapest coffee maker in the long run?',s,CATEGORY_REGISTRY248);
 assert.ok(!j.stages.need.concepts.some(c=>c.id==='scale_buildup'));
 s.close();
});
test('an owned product is context; the product introduced by a buying construction is the choice',()=>{
 const s=store();
 const j=runJourney248('I am thinking of buying a coffee grinder for my espresso machine at home. Which burr grinder should I buy?',s,CATEGORY_REGISTRY250);
 assert.equal(j.stages.category.categoryId,'coffee_grinders');
 const k=runJourney248('Has anyone used one of the < $500 manual espresso machines? Is the coffee better than what I get from my Aeropress?',s,CATEGORY_REGISTRY250);
 assert.equal(k.stages.category.categoryId,'coffee_machines');
 s.close();
});
test('"grinder" names a coffee grinder only in a coffee context; spice and peanut-butter grinders are not coffee grinders',()=>{
 const s=store();
 assert.equal(runJourney248('Which grinder should I buy for espresso beans?',s,CATEGORY_REGISTRY250).stages.category.categoryId,'coffee_grinders');
 const p=runJourney248('What features should I look for in a hand grinder for peanut butter? I want a durable grinder.',s,CATEGORY_REGISTRY250);
 assert.notEqual(p.stages.category.categoryId,'coffee_grinders');
 s.close();
});
test('an accessory for a named product and a product set aside are not the product being chosen',()=>{
 const s=store();
 assert.notEqual(runJourney248('What size should I measure to buy a filter for my espresso machine?',s,CATEGORY_REGISTRY250).stages.category.categoryId,'coffee_machines');
 assert.notEqual(runJourney248('I could buy an electric blender, but the salad comes out too fine. Which vegetable chopper is good?',s,CATEGORY_REGISTRY250).stages.category.categoryId,'blenders');
 s.close();
});
test('needs shared by many categories, or one phrase in a long request, do not decide the product category',()=>{
 const s=store();
 const j=runJourney248('Living alone means my leftovers go a long way and I do not use ingredients as fast as supermarkets expect. For a while I have been considering a vacuum sealing system to avoid throwing food away, but reviews were poor. Is any retail vacuum sealing system worth the expense?',s,CATEGORY_REGISTRY250);
 assert.notEqual(j.stages.category.categoryId,'air_fryers');
 assert.notEqual(runJourney248('I want something long lasting and easy to clean.',s,CATEGORY_REGISTRY250).stages.category.basis,'need_inferred');
 s.close();
});
test('needs stated as problems are recognised (adaptive lessons), with counterexamples',()=>{
 const s=store();
 assert.ok(runJourney248('My toast is always pale on one side and burnt on the other.',s,CATEGORY_REGISTRY250).stages.need.concepts.some(c=>c.id==='even_browning'));
 assert.ok(runJourney248('My espresso shots vary a lot from one cup to the next.',s,CATEGORY_REGISTRY250).stages.need.concepts.some(c=>c.id==='shot_consistency'));
 assert.ok(runJourney248('I want a coffee machine that makes a good latte with proper milk foam.',s,CATEGORY_REGISTRY250).stages.need.concepts.some(c=>c.id==='milk_drinks'));
 assert.ok(!runJourney248('It is very hard to choose a coffee machine; espresso is the hardest drink to make.',s,CATEGORY_REGISTRY250).stages.need.concepts.some(c=>c.id==='scale_buildup'));
 s.close();
});
test('a recognised need that a declared specification can check becomes a factual requirement to confirm',()=>{
 const s=store();
 const j=runJourney248('We are a family of four and want an air fryer big enough for everyone; our kitchen is tiny. Under £120.',s,CATEGORY_REGISTRY250);
 const crit=j.stages.requirements.factualRequirements.map(f=>f.criterion);
 assert.ok(crit.includes('capacity_min')&&crit.includes('width_max')&&crit.includes('budget_max'));
 assert.deepEqual(j.stages.requirements.factualRequirements.find(f=>f.criterion==='budget_max')?.stated,{value:120,unit:'GBP'});
 assert.ok(j.clarificationQuestions.some(q=>/capacity/.test(q)));
 assert.equal(j.rankingAuthorized,false);
 s.close();
});
test('curricula respect the pre-registered equal budget; lessons apply idempotently through the store API',()=>{
 assert.ok(lessonBudget250(CURRICULUM_B250).within);assert.ok(lessonBudget250(ADAPTIVE_C250).within);
 const s=store([]);const first=applyLessons250(s,ADOPTED_LESSONS250,AT);const again=applyLessons250(s,ADOPTED_LESSONS250,AT);
 assert.ok(first.itemsAdded>0);assert.equal(again.itemsAdded,0);
 for(const c of ['coffee_grinders','kettles','pressure_cookers'])assert.ok(s.categoryItems246(c).every(i=>i.knowledgeClass==='technical_hypothesis'&&i.provenance==='assistant_authored_unreviewed'));
 const reg=registryWithLessons250(CATEGORY_REGISTRY248,ADOPTED_LESSONS250);
 assert.ok(!reg.some(e=>e.id==='manual_coffee_brewers'));assert.equal(CATEGORY_REGISTRY248.find(e=>e.id==='coffee_grinders'),undefined);
 s.close();
});
