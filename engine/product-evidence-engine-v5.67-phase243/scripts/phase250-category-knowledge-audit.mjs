#!/usr/bin/env node
/** Phase250 — what category knowledge does PEE hold, and do retained product declarations contribute to it?
 * Counts, per category, four kinds of knowledge kept apart (never summed into one "knowledge" number):
 *   observed  — declared-attribute vocabulary (labels pages declare) and observed_pattern items aggregated from retained
 *               declarations: what products are DESCRIBED with, never importance or performance;
 *   hypotheses — assistant-authored category items and relations with support 'hypothesis';
 *   methods   — measurement-method items and relations with support 'method_reference' (a cited method, not a result);
 *   supported — relations reviewed or evidence_supported (independent original-test results).
 * Then it checks whether declarations reach the advice path: relations or items citing declaration-bearing revisions,
 * and declared attributes that a catalogue need's own words refer to (a link a reviewer could test; not a finding).
 * Usage: node scripts/phase250-category-knowledge-audit.mjs --db STORE [--derive 1] [--out FILE]
 *   --derive 1 runs KnowledgeStore246.deriveObservedPatterns246 on the store first (writes: use a copy or the live store
 *   deliberately).
 */
import {readFileSync,writeFileSync} from 'node:fs';import {resolve} from 'node:path';
import {KnowledgeStore246} from '../dist/src/phase246_knowledge_store.js';
import {relations247,attributeVocabulary247} from '../dist/src/phase247_category_relations.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const store=new KnowledgeStore246(resolve(F.db));
const catalogue=JSON.parse(readFileSync(new URL('../evaluation/phase250/need-catalogue.json',import.meta.url),'utf8'));
const productCats=store.db.prepare("SELECT value c,count(*) n FROM products,json_each(category_hypotheses_json) WHERE identity_state NOT IN ('unsupported_after_rederivation','merged') GROUP BY 1").all();
const itemCats=store.db.prepare('SELECT DISTINCT category_id c FROM category_items').all().map(r=>r.c);
const cats=[...new Set([...productCats.map(r=>r.c),...itemCats])].filter(c=>c!=='pee_write_test').sort();
const derived={};
if(F.derive)for(const c of cats)derived[c]=store.deriveObservedPatterns246(c,'2026-10-15T12:00:00.000Z').length;
const out={schema:'pee250.category-knowledge-audit.v1',db:F.db,derivedNow:F.derive?derived:null,categories:{}};
const declRevs=new Set(store.db.prepare("SELECT DISTINCT revision_id r FROM declarations WHERE state IN ('extracted_unverified','reviewed','verified_for_purpose')").all().map(r=>r.r));
for(const c of cats){
 const items=store.categoryItems246(c);const rels=relations247(store,c);const vocab=attributeVocabulary247(store,c);
 const decls=store.db.prepare("SELECT count(*) n FROM declarations d JOIN products p USING(product_id) WHERE d.state IN ('extracted_unverified','reviewed','verified_for_purpose') AND p.category_hypotheses_json LIKE ?").get('%"'+c+'"%').n;
 const products=productCats.find(r=>r.c===c)?.n??0;
 const needWords=Object.keys(catalogue.categories[c]?.needs??{});
 // A declared attribute a need's own vocabulary names (e.g. "capacity" for batch_capacity): candidate link only.
 const needTerms={batch_capacity:/capacity|volume|cups|slices|litre|liter|quart/i,low_noise:/noise|db\b|decibel/i,temperature_control:/temperature/i,
  milk_drinks:/milk|froth|steam/i,small_kitchen:/dimension|width|height|depth|size/i,cleaning_effort:/dishwasher|removable/i,grind_range:/grind|setting/i,
  fast_boil:/boil|power|watt/i,hard_ingredients:/power|watt|speed/i,even_browning:/brown/i,thick_bread_fit:/slot|width/i,scale_buildup:/descal|filter|scale/i};
 const candidateLinks=vocab.attributes.flatMap(a=>needWords.filter(n=>needTerms[n]?.test(a.labels.join(' '))).map(n=>({need:n,attribute:a.labels[0],products:a.products})));
 out.categories[c]={products,retainedDeclarations:decls,
  observed:{declaredAttributes:vocab.attributes.length,observedPatternItems:items.filter(i=>i.knowledgeClass==='observed_pattern').length},
  hypotheses:{items:items.filter(i=>i.knowledgeClass==='technical_hypothesis'&&i.section!=='quality_measurements').length,relations:rels.filter(r=>r.support==='hypothesis').length,
   needConcepts:new Set(items.filter(i=>i.concept&&i.section==='user_goals').map(i=>i.concept.id)).size},
  methods:{items:items.filter(i=>i.section==='quality_measurements').length,relations:rels.filter(r=>r.support==='method_reference').length},
  supported:{reviewedRelations:rels.filter(r=>r.support==='reviewed').length,evidenceSupportedRelations:rels.filter(r=>r.support==='evidence_supported').length,
   reviewedItems:items.filter(i=>i.state==='reviewed').length},
  declarationsReachKnowledge:{itemsCitingDeclarationRevisions:items.filter(i=>i.sourceRevisionIds.some(r=>declRevs.has(r))).length,
   relationsCitingDeclarationRevisions:rels.filter(r=>r.sourceRevisionIds.some(x=>declRevs.has(x))).length,candidateNeedAttributeLinks:candidateLinks}};
}
store.close();
if(F.out)writeFileSync(resolve(F.out),JSON.stringify(out,null,1)+'\n');
const tot=k=>Object.values(out.categories).reduce((a,c)=>a+k(c),0);
console.log(JSON.stringify({categories:cats.length,declarations:tot(c=>c.retainedDeclarations),declaredAttributes:tot(c=>c.observed.declaredAttributes),
 observedPatternItems:tot(c=>c.observed.observedPatternItems),hypothesisItems:tot(c=>c.hypotheses.items),hypothesisRelations:tot(c=>c.hypotheses.relations),
 needConcepts:tot(c=>c.hypotheses.needConcepts),methodItems:tot(c=>c.methods.items),methodRelations:tot(c=>c.methods.relations),
 supportedRelations:tot(c=>c.supported.reviewedRelations+c.supported.evidenceSupportedRelations),
 itemsOrRelationsCitingDeclarations:tot(c=>c.declarationsReachKnowledge.itemsCitingDeclarationRevisions+c.declarationsReachKnowledge.relationsCitingDeclarationRevisions),
 candidateNeedAttributeLinks:tot(c=>c.declarationsReachKnowledge.candidateNeedAttributeLinks.length)}));
