/** Phase251 — identity-safe category assignment for products the store holds without a category hypothesis.
 *
 * Evidence is the SOURCE's own description of THIS product, never a similar product elsewhere:
 *  - declared_type: a declared "Product type" / "Main category" style property of the product;
 *  - declared_name: a category noun in the product's declared name;
 *  - source_taxonomy: a category noun in the path of the page URL, used only when that page describes one product.
 * Guards: a name that describes a part or accessory ("garage for a robot mower", "ear grips", "tent footprint") is not
 * assigned; nouns of two unrelated categories (a bundle) or disagreeing evidence leave the product unassigned; a
 * product with no evidence stays unknown. Similar names are never used to infer anything. Assignments are hypotheses
 * with journaled evidence (KnowledgeStore246.assignProductCategory251), not reviewed facts.
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';

/** General category-noun lexicon (lower-case regexes over normalised text). Not tuned per product. */
export const CATEGORY_NOUNS251:readonly [string,RegExp][]=[
 ['microwave_ovens',/\bmicrowaves?(?: ovens?)?\b/],['toaster_ovens',/\btoaster ovens?\b/],['pizza_ovens',/\bpizza ovens?\b/],['air_fryers',/\bair ?fryers?\b/],
 ['slow_cookers',/\bslow cookers?\b/],['pressure_cookers',/\bpressure cookers?\b|\bmulti ?cookers?\b/],['rice_cookers',/\brice cookers?\b/],['blenders',/\bblenders?\b/],
 ['juicers',/\bjuicers?\b/],['food_processors',/\bfood processors?\b/],['stand_mixers',/\bstand mixers?\b/],['kettles',/\bkettles?\b/],['toasters',/\btoasters?\b/],
 ['coffee_machines',/\b(?:coffee|espresso) (?:machines?|makers?)\b/],['coffee_grinders',/\bcoffee grinders?\b/],['frying_pans',/\bfrying pans?\b|\bskillets?\b/],
 ['knife_sets',/\bknife (?:block )?sets?\b/],['dehumidifiers',/\bdehumidifiers?\b/],['air_purifiers',/\bair purifiers?\b/],['fans',/\b(?:desk|tower|pedestal|floor|ceiling) fans?\b|\bcirculators?\b/],
 ['robot_vacuums',/\brobot(?:ic)? vacuums?\b/],['vacuum_cleaners',/\bvacuum(?: cleaners?)?\b|\bvac\b/],['washing_machines',/\bwashing machines?\b/],
 ['sewing_machines',/\bsewing machines?\b/],['hair_clippers',/\b(?:hair )?clippers?\b/],['smart_scales',/\b(?:body|bathroom|smart) scales?\b/],['waste_bins',/\b(?:waste|recycling|kitchen|pedal) bins?\b/],
 ['monitors',/\bmonitors?\b/],['keyboards',/\bkeyboards?\b/],['headphones',/\bheadphones?\b|\bheadsets?\b/],['earbuds',/\bearbuds?\b|\btrue wireless\b/],['speakers',/\bspeakers?\b/],
 ['security_cameras',/\b(?:security|indoor|outdoor|doorbell) cam(?:era)?s?\b/],['laptops',/\blaptops?\b|\bnotebooks?\b/],
 ['power_drills',/\bdrill(?: drivers?)?\b/],['chainsaws',/\bchainsaws?\b/],['lawn_mowers',/\blawn ?mowers?\b/],['leaf_blowers',/\b(?:leaf )?blowers?\b/],
 ['electric_bikes',/\belectric (?:\w+ )?bikes?\b|\be-?bikes?\b/],['bicycles',/\b(?:hybrid|road|mountain|gravel|city|commuter|kids) bikes?\b|\bbicycles?\b/],
 ['tents',/\btents?\b/],['running_shoes',/\b(?:trail|running) shoes?\b/],['hiking_boots',/\bhiking boots?\b/],['first_aid_kits',/\bfirst aid kits?\b/],['chairs',/\bchairs?\b|\bsandalye\b/],
];
/** When both match, the more specific category wins (an electric bike is a bicycle; a blower/vac is a blower). */
const MORE_SPECIFIC:readonly [string,string][]=[['electric_bikes','bicycles'],['robot_vacuums','vacuum_cleaners'],['leaf_blowers','vacuum_cleaners'],
 ['toaster_ovens','toasters'],['coffee_grinders','coffee_machines']];
/** Words that make a name describe a part or accessory of another product. */
const ACCESSORY=/\b(?:garage|stands?|grips?|footprint|covers?|cases?|bags?|replacements?|spares?|attachments?|accessor(?:y|ies)|filters?|mounts?|holders?|straps?|chargers?|humidistat|hose|nozzles?|blades? for|(?:parts?|kits?) for)\b/;
const norm=(s:string)=>s.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const TYPE_PROPERTY=/^(?:product type|product category|main category|sub category|item type)$/i;

export interface CategoryAssignment251 {productId:string;name:string|null;outcome:'assigned'|'accessory'|'conflict'|'no_evidence';categoryId:string|null;
 basis:string[];revisionIds:string[];candidates:Record<string,string[]>;detail:string}

/** A name describes an accessory when an accessory word is its head: not negated ("without battery and charger"), not
 * part of a category noun ("stand" in "stand mixer"), and after the last category noun, or with no category noun at
 * all ("robot lawn mower garage", "speaker floor stands", "ear grips"; but "Power Grip ... Clipper" is a clipper). */
export function isAccessoryName(name:string):boolean{
 const t=norm(name).replace(/\bwithout\b.*$/,'').trim();
 const spans:[number,number][]=[];
 for(const [,re] of CATEGORY_NOUNS251){const g=new RegExp(re.source,'g');let m:RegExpExecArray|null;while((m=g.exec(t)))spans.push([m.index,m.index+m[0].length]);}
 const lastEnd=spans.length?Math.max(...spans.map(s=>s[1])):-1;
 const g=new RegExp(ACCESSORY.source,'g');let m:RegExpExecArray|null;
 while((m=g.exec(t))){const at=m.index;if(spans.some(([a,b])=>at>=a&&at<b))continue;if(at>=lastEnd)return true;}
 return false;
}
function categoriesIn(text:string):string[]{
 const t=norm(text);const hits=CATEGORY_NOUNS251.filter(([,re])=>re.test(t)).map(([c])=>c);
 return hits.filter(c=>!MORE_SPECIFIC.some(([spec,gen])=>gen===c&&hits.includes(spec)));
}
/** Proposes a category for each product without one (read-only). */
export function proposeCategories251(store:KnowledgeStore246):CategoryAssignment251[]{
 const products=store.db.prepare("SELECT product_id,name FROM products WHERE category_hypotheses_json='[]' AND identity_state NOT IN ('unsupported_after_rederivation','merged') ORDER BY product_id").all() as {product_id:string;name:string|null}[];
 return products.map(p=>{
  const revs=(store.db.prepare('SELECT DISTINCT d.revision_id r,v.url FROM declarations d JOIN revisions v ON v.revision_id=d.revision_id WHERE d.product_id=?').all(p.product_id) as {r:string;url:string}[]);
  const candidates:Record<string,string[]>={};const add=(basis:string,cats:string[])=>{for(const c of cats)(candidates[c]??=[]).includes(basis)||candidates[c].push(basis);};
  const types=store.db.prepare('SELECT property,raw_value FROM declarations WHERE product_id=?').all(p.product_id) as {property:string;raw_value:string}[];
  for(const t of types)if(TYPE_PROPERTY.test(t.property.trim()))add('declared_type',categoriesIn(String(t.raw_value)));
  const nameCats=categoriesIn(p.name??'');add('declared_name',nameCats);
  for(const r of revs){const single=(store.db.prepare('SELECT count(DISTINCT product_id) n FROM declarations WHERE revision_id=?').get(r.r) as {n:number}).n===1;
   if(single){let path='';try{path=decodeURIComponent(new URL(r.url).pathname);}catch{path=r.url;}add('source_taxonomy',categoriesIn(path.replace(/[/_-]+/g,' ')));}}
  const base={productId:p.product_id,name:p.name,revisionIds:revs.map(r=>r.r),candidates};
  if(isAccessoryName(p.name??''))return {...base,outcome:'accessory' as const,categoryId:null,basis:[],detail:'the declared name describes a part or accessory'};
  const cats=Object.keys(candidates);
  if(nameCats.length>1)return {...base,outcome:'conflict' as const,categoryId:null,basis:[],detail:`the name names several categories: ${nameCats.join(', ')}`};
  if(cats.length>1)return {...base,outcome:'conflict' as const,categoryId:null,basis:[],detail:`evidence disagrees: ${cats.join(', ')}`};
  if(!cats.length)return {...base,outcome:'no_evidence' as const,categoryId:null,basis:[],detail:'no category evidence from this product\'s own sources'};
  return {...base,outcome:'assigned' as const,categoryId:cats[0],basis:candidates[cats[0]],detail:`${candidates[cats[0]].join(' + ')}: ${cats[0]}`};
 });
}
/** Writes the 'assigned' proposals through the store's journaled API; returns how many products changed. */
export function applyCategoryAssignments251(store:KnowledgeStore246,proposals:readonly CategoryAssignment251[],at?:string):number{
 let n=0;for(const p of proposals)if(p.outcome==='assigned'&&p.categoryId&&store.assignProductCategory251(p.productId,p.categoryId,{basis:p.basis,revisionIds:p.revisionIds,detail:p.detail},at))n++;
 return n;
}
