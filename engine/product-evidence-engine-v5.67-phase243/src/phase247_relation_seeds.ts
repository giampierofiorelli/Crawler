/** Phase247 — initial relations for the air fryer, coffee machine and toaster graphs.
 * Hypothesis relations are framings to test. Method-reference relations cite the observed revision of a published
 * test-method page that measures the target outcome; they say the outcome is measurable that way, not how any
 * product performs. Relations are attached to items by concept id or by the method pointer's source revision. */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {addRelation247,attributeVocabulary247,type RelationKind247} from './phase247_category_relations.js';

type End=string;// 'concept:<id>' | 'method:<host>' | 'attr:<key>' | 'attrs:<regex>' (every observed attribute key matching)
type Seed=[End,RelationKind247,End,string];
export const RELATION_SEEDS247:Record<string,Seed[]>={
 air_fryers:[
  ['concept:forced_hot_air_convection','enables','concept:cooking_evenness','Air distribution across the basket plausibly governs evenness; untested here'],
  ['concept:forced_hot_air_convection','enables','concept:crisp_texture','Moving hot air dries and browns surfaces; degree depends on load and airflow'],
  ['method:www.choice.com.au','measured_by','concept:cooking_evenness','Published lab method assesses how evenly pieces brown with standard foods'],
  ['attrs:^(?:capacity|basket capacity|drawer capacity|total capacity)$','not_sufficient_for','concept:cooking_evenness','Declared drawer volume does not establish usable single-layer crisping area or evenness'],
  ['attrs:^(?:capacity|basket capacity|drawer capacity|total capacity)$','may_support','concept:cook_single_portion','Capacity bounds batch size; small portions may not need large drawers'],
  ['attrs:^(?:power|wattage|power consumption|power requirements|power w)$','not_sufficient_for','concept:crisp_texture','Rated watts alone do not establish crisping; airflow and load matter'],
 ],
 coffee_machines:[
  ['concept:extraction_parameters','enables','concept:espresso_quality','Temperature stability, puck pressure, grind, dose and time govern extraction'],
  ['attrs:^(?:pump pressure|bar pressure|pressure|pump)$','not_sufficient_for','concept:espresso_quality','A declared pump bar rating describes the pump, not pressure at the coffee puck'],
  ['method:www.choice.com.au','measured_by','concept:espresso_quality','Published method: blind expert tasting of espresso (crema, aroma, flavour, mouthfeel)'],
  ['method:www.choice.com.au','measured_by','concept:shot_consistency','Published method: temperature consistency over four consecutive coffees'],
  ['concept:scale_buildup','may_risk','concept:low_maintenance','Scale build-up adds descaling work and may degrade performance over time'],
 ],
 toasters:[
  ['concept:radiant_element_heating','enables','concept:even_browning','Element spacing and slot centring plausibly govern evenness'],
  ['method:www.choice.com.au','measured_by','concept:even_browning','Published method: four cycles at a reference shade, evenness of browning assessed'],
  ['method:www.choice.com.au','measured_by','concept:repeatable_results','Published method: results compared cycle to cycle for consistency'],
  ['attrs:^(?:slot dimensions|slot width|slot size)$','may_support','concept:thick_bread_fit','Slot width/depth bound which bread fits; centring guides may matter for evenness'],
  ['attrs:^(?:power|wattage|power consumption|power w)$','not_sufficient_for','concept:even_browning','Rated power does not establish evenness of browning'],
 ],
};

/** Adds the seed relations for one category (idempotent). Returns the relation ids and any seeds skipped
 * because the referenced item or source is not in the store. */
export function seedRelations247(store:KnowledgeStore246,categoryId:string,at?:string){
 const seeds=RELATION_SEEDS247[categoryId];if(!seeds)throw Error('247_no_relation_seed');
 const items=store.categoryItems246(categoryId);
 const vocab=attributeVocabulary247(store,categoryId,1).attributes.map(a=>a.key);
 const resolveAll=(e:End):{ref:string;revs:string[]}[]=>{
  if(!e.startsWith('attrs:')){const r=resolve(e);return r?[r]:[];}
  const re=new RegExp(e.slice(6));const keys=vocab.filter(k=>re.test(k));
  // No page has declared it yet: keep the relation on the first literal alternative so it applies when one does.
  return (keys.length?keys:[/^\^\(\?:([^|)]+)/.exec(e.slice(6))?.[1]??e.slice(6)]).map(k=>({ref:'attr:'+k,revs:[]}));
 };
 const resolve=(e:End):{ref:string;revs:string[]}|null=>{
  if(e.startsWith('attr:'))return {ref:e,revs:[]};
  if(e.startsWith('concept:')){const it=items.find(i=>i.concept?.id===e.slice(8));return it?{ref:'item:'+it.itemId,revs:[]}:null;}
  const host=e.slice(7);
  // The method pointer item of this category whose cited revision comes from that publisher host.
  for(const it of items.filter(i=>i.provenance==='professional_method_reference'&&i.section==='quality_measurements'))
   for(const rev of it.sourceRevisionIds){const h=(store.db.prepare('SELECT s.host FROM revisions r JOIN sources s USING(source_id) WHERE r.revision_id=?').get(rev) as {host:string}|undefined)?.host;
    if(h===host)return {ref:'item:'+it.itemId,revs:[rev]};}
  return null;
 };
 const added:string[]=[];const skipped:string[]=[];
 for(const [f,kind,t,q] of seeds){
  const as=resolveAll(f),b=resolve(t);if(!as.length||!b){skipped.push(`${f} ${kind} ${t}`);continue;}
  for(const a of as){const revs=[...a.revs,...b.revs];
   added.push(addRelation247(store,{categoryId,from:a.ref,to:b.ref,kind,qualification:q,support:revs.length?'method_reference':'hypothesis',sourceRevisionIds:revs},at));}
 }
 return {added,skipped};
}
