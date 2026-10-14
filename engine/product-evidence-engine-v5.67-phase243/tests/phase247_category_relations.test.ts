import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {KnowledgeStore246,type SourceInput246,type ReviewReceipt246} from '../src/phase246_knowledge_store.js';
import {extractSpecifications245} from '../src/phase245_spec_extraction.js';
import {seedCategoryHypotheses246} from '../src/phase246_category_seeds.js';
import {addRelation247,reviewRelation247,relations247,attributeVocabulary247,compileTo116,researchPriorities247} from '../src/phase247_category_relations.js';
import {seedRelations247} from '../src/phase247_relation_seeds.js';

process.env.PEE_ALLOW_TMP_STORE='1';
const dir=mkdtempSync(join(tmpdir(),'pee247-'));let n=0;const db=()=>join(dir,`s${++n}.sqlite`);
const AT='2026-10-14T12:00:00.000Z';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const src=(host:string,type:SourceInput246['sourceType']):SourceInput246=>({sourceId:'src_'+host.replace(/\W/g,'_'),host,sourceType:type,sourceTypeBasis:'operator_asserted'});
const ld=(o:unknown)=>`<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const page=(name:string,props:[string,string][])=>`<!doctype html><html><head>${ld({'@context':'https://schema.org','@type':'Product',name})}</head><body><main><h1>${name}</h1><h2>Specifications</h2><table>${props.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table></main></body></html>`;
const observe=(s:KnowledgeStore246,url:string,html:string,source:SourceInput246,cat='coffee_machines')=>s.ingestObservation246({source,url,sha256:sha(html),bytes:html.length,httpStatus:200,
 fetchedAt:AT,runId:'r1',extractorVersion:'x',extraction:extractSpecifications245(html,url),categoryHypotheses:[cat]});
const receipt=(revs:string[]):ReviewReceipt246=>({reviewId:'rv1',reviewerId:'reviewer',reviewedAt:AT,sourceRevisionIds:revs,note:'checked'});
const ok=(r:ReviewReceipt246)=>r.reviewerId==='reviewer';

test('declared-attribute vocabulary keeps labels only, works for metadata-only sources and counts distinct products',()=>{
 const s=new KnowledgeStore246(db());
 observe(s,'https://shop.example/a',page('Machine A',[['Bar pressure','15 bar'],['Water tank capacity','1.8 L']]),src('shop.example','retailer'));
 observe(s,'https://maker.example/b',page('Machine B',[['Bar pressure','19 bar'],['Weight','4 kg']]),src('maker.example','manufacturer'));
 assert.equal(s.stats246().declarationsRetained,0,'no values retained without rights');
 const v=attributeVocabulary247(s,'coffee_machines');
 assert.deepEqual(v.attributes.map(a=>[a.key,a.products,a.sourceTypes.join('+')]),[['bar pressure',2,'manufacturer+retailer']]);
 assert.ok(!JSON.stringify(v).includes('15'),'no declared value leaks into the vocabulary');
 assert.match(v.note,/not evidence of importance or performance/);
 s.close();
});
test('relations: method references need a test publisher revision; evidence needs an independent original test; hypotheses cite nothing',()=>{
 const s=new KnowledgeStore246(db());
 const lab=observe(s,'https://lab.example/how-we-test','<!doctype html><html><body><main><h1>How we test coffee machines</h1></main></body></html>',src('lab.example','independent_original_test'));
 const maker=observe(s,'https://maker.example/b',page('Machine B',[['Bar pressure','19 bar']]),src('maker.example','manufacturer'));
 seedCategoryHypotheses246(s,'coffee_machines',AT);
 const method=s.addCategoryItem246({categoryId:'coffee_machines',section:'quality_measurements',statement:'Lab method: repeated shots, temperature consistency measured.',
  knowledgeClass:'technical_hypothesis',provenance:'professional_method_reference',sourceRevisionIds:[lab.revisionId]});
 const goal=s.categoryItems246('coffee_machines').find(i=>i.concept?.id==='shot_consistency')!;
 assert.throws(()=>addRelation247(s,{categoryId:'coffee_machines',from:'item:'+method,to:'item:'+goal.itemId,kind:'measured_by',qualification:'q',support:'method_reference',sourceRevisionIds:[maker.revisionId]}),/247_method_reference_requires_test_publisher_source/);
 const rel=addRelation247(s,{categoryId:'coffee_machines',from:'item:'+method,to:'item:'+goal.itemId,kind:'measured_by',qualification:'measures consistency',support:'method_reference',sourceRevisionIds:[lab.revisionId]});
 assert.equal(addRelation247(s,{categoryId:'coffee_machines',from:'item:'+method,to:'item:'+goal.itemId,kind:'measured_by',qualification:'measures consistency',support:'method_reference',sourceRevisionIds:[lab.revisionId]}),rel,'idempotent');
 assert.throws(()=>addRelation247(s,{categoryId:'coffee_machines',from:'attr:bar pressure',to:'item:'+goal.itemId,kind:'enables',qualification:'q',support:'reviewed' as never}),/247_reviewed_support_requires_review/);
 assert.throws(()=>reviewRelation247(s,rel,'evidence_supported',receipt([maker.revisionId]),ok),/247_evidence_requires_independent_original_test/);
 reviewRelation247(s,rel,'evidence_supported',receipt([lab.revisionId]),ok);
 assert.equal(relations247(s,'coffee_machines').find(r=>r.relationId===rel)!.support,'evidence_supported');
 assert.throws(()=>addRelation247(s,{categoryId:'coffee_machines',from:'item:cat_00000000000000000000',to:'item:'+goal.itemId,kind:'enables',qualification:'q',support:'hypothesis'}),/247_unknown_item/);
 s.close();
});
test('the relation graph compiles into Phase116, its audit lists goals no method measures, and a relation change makes compiled knowledge stale',()=>{
 const s=new KnowledgeStore246(db());
 const lab=observe(s,'https://www.choice.com.au/how-we-test-toasters','<!doctype html><html><body><main><h1>How we test toasters</h1></main></body></html>',src('www.choice.com.au','independent_original_test'),'toasters');
 seedCategoryHypotheses246(s,'toasters',AT);
 s.addCategoryItem246({categoryId:'toasters',section:'quality_measurements',statement:'Four toasting cycles at a reference shade; evenness and repeatability assessed.',
  knowledgeClass:'technical_hypothesis',provenance:'professional_method_reference',sourceRevisionIds:[lab.revisionId]});
 s.compileCategory246('toasters',['toaster']);
 const before=compileTo116(s,'toasters');
 assert.deepEqual(before.audit!.uncoveredGoals.sort(),['even_browning','repeatable_results']);
 const r=seedRelations247(s,'toasters',AT);
 assert.equal(r.skipped.length,0);
 assert.equal(s.derivedNode246('compiled128:toasters')!.state,'stale');
 const after=compileTo116(s,'toasters');
 assert.deepEqual(after.audit!.uncoveredGoals,[]);
 assert.ok(after.model!.links.some(l=>l.kind==='measured_by'&&l.qualification.startsWith('[method_reference]')));
 const pr=researchPriorities247(s,'toasters');
 assert.ok(pr.some(p=>p.kind==='method_known_results_missing'));
 assert.ok(pr.every(p=>!/best|rank|recommend/i.test(p.action)),'priorities direct research, never rank products');
 s.close();
});
test.after(()=>rmSync(dir,{recursive:true,force:true}));
