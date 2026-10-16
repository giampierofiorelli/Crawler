/** Phase249 — evidence-calibrated advice decisions after the user has confirmed requirements.
 *
 * Three kinds of answer, each with the evidence it needs:
 *  1. ranked_recommendation — an ORDER of products by quality. Only from a signed, offline-reviewed Phase180
 *     release built on original professional test results. Unchanged gate; this module never builds an order.
 *  2. requirements_shortlist — products that MEET the user's confirmed factual constraints (capacity, size, weight,
 *     power, budget), established from cited source declarations (manufacturer or retailer specifications). It is
 *     unordered and says so: declarations are appropriate evidence that a product has a capacity or a size, never
 *     evidence that it performs well. Products whose declarations are missing or conflicting are reported as
 *     unknown, never silently excluded; products that fail are reported with the failing declaration.
 *  3. abstention — clarify (nothing confirmed), withhold (evidence insufficient), or a justified negative answer
 *     (no candidate meets the requirements).
 * Performance needs (crispness, evenness, noise in use) are never answered from declarations: when confirmed, a
 * shortlist is marked performance_unverified and the ranking stays withheld.
 */
import type {Value245} from './phase245_value_normalizer.js';
import {urlModelToken252} from './phase246_knowledge_store.js';
import type {DecisionSnapshot177,Criterion177} from './phase177_decision_snapshot.js';
import {reviewedFirstAnswer180,type SignedRelease180,type TrustedRankingAuthority180,type FirstAnswer180} from './phase180_reviewed_first_answer.js';

export type Dimension249='volume'|'length'|'mass'|'power'|'duration'|'price';
export interface SpecCriterion249 {label:string;property:RegExp;exclude?:RegExp;dimension:Dimension249;bound:'min'|'max';
 /** Phase253: the axis read from an axis-labelled overall dimensions declaration ("20.7(W) x 28.4(D) x 33(H) cm"). */
 axis?:'W'|'H'|'D'}
/** Confirmed criteria that are factual constraints checkable against declarations. Keys are stable decision keys. */
export const SPEC_CRITERIA249:Readonly<Record<string,SpecCriterion249>>={
 capacity_min:{label:'capacity at least',property:/\b(?:capacity|volume)\b/i,exclude:/\b(?:battery|bin|tank|container|bag|collection|water|dust)\b/i,dimension:'volume',bound:'min'},
 width_max:{label:'width at most',property:/\bwidth\b/i,dimension:'length',bound:'max',axis:'W'},
 height_max:{label:'height at most',property:/\bheight\b/i,exclude:/\b(?:cut|seat|back)\b/i,dimension:'length',bound:'max',axis:'H'},
 depth_max:{label:'depth at most',property:/\bdepth\b/i,dimension:'length',bound:'max',axis:'D'},
 weight_max:{label:'weight at most',property:/\bweight\b/i,exclude:/\b(?:gross|shipping|box|package|packaging)\b/i,dimension:'mass',bound:'max'},
 power_min:{label:'power at least',property:/\b(?:power|wattage|rated power)\b/i,exclude:/\b(?:consumption|standby|supply|cord|levels?|source)\b/i,dimension:'power',bound:'min'},
 budget_max:{label:'price at most',property:/^price$/i,dimension:'price',bound:'max'},
 // Phase252: declared playback time; makers usually declare it as "up to" under their own conditions (volume, ANC off).
 battery_life_min:{label:'battery life at least',property:/\b(?:battery life|playback time|music playback|playtime)\b/i,exclude:/\b(?:charg\w*|standby|recharge|talk)\b/i,dimension:'duration',bound:'min'},
};
const FACTOR:Record<Exclude<Dimension249,'price'>,Record<string,number>>={
 volume:{l:1,ml:0.001,cl:0.01,'cm³':0.001,qt:0.946353,gal:3.78541,'fl oz':0.0295735},
 length:{mm:1,cm:10,m:1000,in:25.4,ft:304.8},
 mass:{g:1,kg:1000,lb:453.592,oz:28.3495,mg:0.001},
 power:{W:1,kW:1000,mW:0.001},
 duration:{h:1,min:1/60,s:1/3600},
};
/** A declared value in the criterion's unit, or null when it cannot be compared (other unit family, text, range). */
export function comparable249(v:Value245|null,dimension:Dimension249,unit:string):number|null{
 if(!v)return null;
 // Criterion units are lowercase decision keys ("gbp", "w", "l"); declared units keep their symbols.
 if(dimension==='price')return v.kind==='price'&&v.currency===unit.toUpperCase()&&v.maxAmount===undefined?v.amount:null;
 if(v.kind!=='quantity'||v.bound||v.approximate)return null;
 const f=FACTOR[dimension];const factor=(u:string)=>f[u]??f[Object.keys(f).find(k=>k.toLowerCase()===u.toLowerCase())??''];
 const a=factor(v.unit),b=factor(unit);
 return a!==undefined&&b!==undefined?v.number*a/b:null;
}
export interface CandidateDeclaration249 {declarationId:string;property:string;value:Value245|null;rawValue:string;evidenceRole:string;sourceUrl:string|null;variantId:string|null}
export interface Candidate249 {productId:string;name:string;declarations:readonly CandidateDeclaration249[];
 /** Phase251: set when the product's identity rests on its name alone but its declarations come from pages of
  * different models; such a product is never reported as meeting requirements until its identity is reviewed. */
 identityWarning?:string|null}
/** Phase254: machine-readable reason, so later stages never parse the human reason text. */
export type CheckCode249='meets'|'fails'|'not_a_quantity'|'upper_bound_only'|'not_comparable'|'no_declaration'|'sources_disagree'|'identity_unreviewed';
export interface CriterionCheck249 {key:string;outcome:'meets'|'fails'|'unknown';code:CheckCode249;reason:string;evidence:{declarationId:string;rawValue:string;sourceUrl:string|null;evidenceRole:string}[]}
export interface ProductCheck249 {productId:string;name:string;outcome:'meets_all'|'fails'|'unknown';checks:CriterionCheck249[]}
export interface Advice249 {
 schema:'pee249.advice.v1';
 decision:'ranked_recommendation'|'requirements_shortlist'|'requirements_shortlist_performance_unverified'|'no_candidate_meets_requirements'|'withhold_insufficient_evidence'|'clarify';
 rankingAuthorized:boolean;ordered:boolean;
 shortlist:{productId:string;name:string;evidence:CriterionCheck249['evidence']}[];
 ranked:FirstAnswer180['ranked'];
 checks:ProductCheck249[];
 unverifiedNeeds:string[];
 statements:string[];cautions:string[];researchPlan:string[];
}
function checkCriterion(c:Criterion177,spec:SpecCriterion249,p:Candidate249):CriterionCheck249{
 if(c.value.kind!=='quantity')return {key:c.key,outcome:'unknown',code:'not_a_quantity',reason:'criterion is not a quantity',evidence:[]};
 const unit=c.value.unit,limit=c.value.value;
 // Declarations of the base product (variant-specific values are not applied to the whole product).
 const rel=p.declarations.filter(d=>!d.variantId&&spec.property.test(d.property)&&!(spec.exclude?.test(d.property)));
 // Phase253: the same axis of the product's overall dimensions, only when the axes are labelled in the value or in the
 // property ("Dimensions (WxDxH)"). Unlabelled triples stay unknown; component dimensions (slot, box, bowl) are not the product's.
 if(spec.axis)for(const d of p.declarations){const q=axisValue249(d,spec.axis);if(q&&!d.variantId)rel.push({...d,value:q});}
 const vals=rel.map(d=>({d,n:comparable249(d.value,spec.dimension,unit)})).filter(x=>x.n!==null) as {d:CandidateDeclaration249;n:number}[];
 // Phase252: an "up to X" declaration is an upper bound under the maker's conditions. Below a required minimum it
 // excludes the product; otherwise it shows nothing about the minimum the user needs.
 if(!vals.length){
  const ub=rel.filter(d=>d.value?.kind==='quantity'&&d.value.bound==='max').map(d=>({d,n:comparable249({...d.value,bound:undefined} as Value245,spec.dimension,unit)})).filter(x=>x.n!==null) as {d:CandidateDeclaration249;n:number}[];
  if(ub.length&&spec.bound==='min'){const top=Math.max(...ub.map(x=>x.n));
   return top<limit?{key:c.key,outcome:'fails',code:'fails',reason:`declared at most ${round(top)} ${unit} ("up to"); required ≥ ${limit} ${unit}`,evidence:ub.map(x=>ev(x.d))}
    :{key:c.key,outcome:'unknown',code:'upper_bound_only',reason:`declared "up to" ${round(top)} ${unit}: an upper bound under the maker's conditions, not the minimum you need`,evidence:ub.map(x=>ev(x.d))};}
  return {key:c.key,outcome:'unknown',code:rel.length?'not_comparable':'no_declaration',reason:rel.length?'declared, but not in a comparable unit':'no declaration for this requirement',evidence:rel.map(ev)};
 }
 const lo=Math.min(...vals.map(x=>x.n)),hi=Math.max(...vals.map(x=>x.n));
 // Sources disagreeing by more than 2 % are a conflict to resolve, not a pass or a fail.
 if(hi-lo>Math.max(Math.abs(hi),Math.abs(lo))*0.02)return {key:c.key,outcome:'unknown',code:'sources_disagree',reason:`sources disagree (${round(lo)}–${round(hi)} ${unit})`,evidence:vals.map(x=>ev(x.d))};
 const ok=spec.bound==='min'?lo>=limit:hi<=limit;
 return {key:c.key,outcome:ok?'meets':'fails',code:ok?'meets':'fails',reason:`declared ${round(spec.bound==='min'?lo:hi)} ${unit}; required ${spec.bound==='min'?'≥':'≤'} ${limit} ${unit}`,evidence:vals.map(x=>ev(x.d))};
}
const OVERALL_DIMENSIONS=/\b(?:dimensions?|size|measurements)\b/i;
const COMPONENT_DIMENSIONS=/\b(?:slot|slots|box|package|packaging|packed|shipping|carton|internal|interior|inner|cavity|drum|bowl|basket|jug|tank|plate|door|opening|cable|cord)\b/i;
/** Phase253: one axis of an overall, axis-labelled dimensions declaration as a quantity, or null. */
export function axisValue249(d:CandidateDeclaration249,axis:'W'|'H'|'D'):Value245|null{
 const v=d.value;if(!v||v.kind!=='dimensions'||v.approximate||!OVERALL_DIMENSIONS.test(d.property)||COMPONENT_DIMENSIONS.test(d.property))return null;
 let axes=v.axes;
 if(!axes){const m=d.property.match(/\b([whdl])\s*[x×*]\s*([whdl])(?:\s*[x×*]\s*([whdl]))?\b/i);
  if(m)axes=[m[1],m[2],m[3]].filter(Boolean).map(a=>a.toUpperCase());}
 if(!axes||axes.length!==v.numbers.length||new Set(axes).size!==axes.length)return null;
 const i=axes.indexOf(axis);return i<0?null:{kind:'quantity',number:v.numbers[i],unit:v.unit,approximate:false} as Value245;
}
const round=(n:number)=>Math.round(n*100)/100;
const ev=(d:CandidateDeclaration249)=>({declarationId:d.declarationId,rawValue:d.rawValue,sourceUrl:d.sourceUrl,evidenceRole:d.evidenceRole});

export function decideAdvice249(input:{snapshot:DecisionSnapshot177;candidates:readonly Candidate249[];
 signedRelease?:SignedRelease180|null;authority?:TrustedRankingAuthority180|null}):Advice249{
 const {snapshot,candidates}=input;
 const base:Omit<Advice249,'decision'>={schema:'pee249.advice.v1',rankingAuthorized:false,ordered:false,shortlist:[],ranked:[],checks:[],unverifiedNeeds:[],statements:[],cautions:[],researchPlan:[]};
 const confirmed=snapshot.criteria.filter(c=>c.status==='confirmed');
 if(!snapshot.scope.category||!confirmed.length)return {...base,decision:'clarify',statements:['Confirm the product type and at least one requirement before PEE can advise.']};
 // 1. A reviewed, signed release can authorise a quality order (Phase180 performs every check).
 if(input.signedRelease&&input.authority){
  const fa=reviewedFirstAnswer180(snapshot,input.signedRelease,input.authority);
  if(fa.status==='ranking_ready')return {...base,decision:'ranked_recommendation',rankingAuthorized:true,ordered:true,ranked:fa.ranked,
   statements:[...fa.firstLayer],cautions:[...fa.visibleCautions]};
  base.cautions.push(...fa.visibleCautions);
 }
 const spec=confirmed.filter(c=>SPEC_CRITERIA249[c.key]);
 const perf=confirmed.filter(c=>!SPEC_CRITERIA249[c.key]);
 base.unverifiedNeeds=perf.map(c=>c.label);
 if(!spec.length)return {...base,decision:'withhold_insufficient_evidence',
  statements:['Your confirmed needs concern performance; PEE has no reviewed independent test evidence to compare products on them.'],
  researchPlan:perf.map(c=>`obtain comparable independent measurements for: ${c.label}`)};
 const checks:ProductCheck249[]=candidates.map(p=>{
  const cs=spec.map(c=>checkCriterion(c,SPEC_CRITERIA249[c.key],p));
  // Only hard requirements exclude; a failed preference is reported but does not remove the product.
  const hardFail=cs.some((x,i)=>x.outcome==='fails'&&spec[i].priority==='hard');
  const anyUnknown=cs.some(x=>x.outcome==='unknown');
  let outcome:ProductCheck249['outcome']=hardFail?'fails':anyUnknown?'unknown':cs.every(x=>x.outcome==='meets')?'meets_all':'fails';
  if(p.identityWarning&&outcome!=='fails'){outcome='unknown';cs.push({key:'identity',outcome:'unknown',code:'identity_unreviewed',reason:p.identityWarning,evidence:[]});}
  return {productId:p.productId,name:p.name,outcome,checks:cs};
 }).sort((a,b)=>a.name.localeCompare(b.name)||a.productId.localeCompare(b.productId));
 const meets=checks.filter(c=>c.outcome==='meets_all'),unknown=checks.filter(c=>c.outcome==='unknown'),fails=checks.filter(c=>c.outcome==='fails');
 const cautions=[...base.cautions,'Requirement checks use specifications declared by manufacturers or retailers, cited per product; they are not independent performance tests.',
  ...(unknown.length?[`${unknown.length} candidate(s) could not be checked (missing, incomparable or conflicting declarations); they are listed, not dropped.`]:[]),
  'Coverage is limited to products PEE has observed; it is not the whole market.'];
 const plan=unknown.flatMap(u=>u.checks.filter(c=>c.outcome==='unknown').map(c=>`${u.name}: ${c.reason} (${c.key})`)).slice(0,20);
 if(meets.length){
  const shortlist=meets.map(m=>({productId:m.productId,name:m.name,evidence:m.checks.flatMap(c=>c.evidence)}));
  const decision=perf.length?'requirements_shortlist_performance_unverified':'requirements_shortlist';
  return {...base,decision,shortlist,checks,cautions,researchPlan:[...plan,...perf.map(c=>`obtain comparable independent measurements for: ${c.label}`)],
   statements:[`${meets.length} of ${checks.length} known product(s) meet every confirmed requirement according to their declared specifications (listed alphabetically, not ranked).`,
    ...(perf.length?[`Performance needs (${perf.map(c=>c.label).join(', ')}) are not verified: no independent test evidence is available, so no order is given.`]:[])]};
 }
 if(!unknown.length&&fails.length)return {...base,decision:'no_candidate_meets_requirements',checks,cautions,
  statements:[`None of the ${checks.length} known product(s) meets every hard requirement according to their declared specifications.`],
  researchPlan:['discover further candidates in this category','consider relaxing a requirement']};
 return {...base,decision:'withhold_insufficient_evidence',checks,cautions,researchPlan:plan,
  statements:['The declared specifications available are not enough to tell which products meet your requirements.']};
}

/** Candidates of one category from the knowledge store, with each retained declaration's source URL. */
export function candidatesFromStore249(store:{products246(f:{category?:string}):string[];product246(id:string):{name:string|null}|null;
 declarations246(id:string):{declarationId:string;revisionId:string;variantId:string|null;property:string;value:Value245|null;rawValue:string;evidenceRole:string}[];
 db:{prepare(sql:string):{get(...a:unknown[]):unknown}}},categoryId:string):Candidate249[]{
 return store.products246({category:categoryId}).map(pid=>{
  const p=store.product246(pid);
  const declarations:CandidateDeclaration249[]=store.declarations246(pid).map(d=>({declarationId:d.declarationId,property:d.property,value:d.value,
   rawValue:d.rawValue,evidenceRole:d.evidenceRole,variantId:d.variantId,
   sourceUrl:(store.db.prepare('SELECT url FROM revisions WHERE revision_id=?').get(d.revisionId) as {url:string}|undefined)?.url??null}));
  const fromName=capacityFromName249(p?.name??null);
  // A capacity stated only in the product's own name ("... Air Fryer 7.6L") is the source's declaration too; it is used
  // only when no capacity declaration exists, and is labelled so the citation shows where it came from.
  if(fromName&&!declarations.some(d=>/\b(?:capacity|volume)\b/i.test(d.property))){
   const src=(store.db.prepare("SELECT r.url FROM product_sources ps JOIN revisions r USING(revision_id) WHERE ps.product_id=? AND ps.role='main_product' ORDER BY r.fetched_at DESC LIMIT 1").get(pid) as {url:string}|undefined)?.url??null;
   declarations.push({declarationId:'name:'+pid,property:'Capacity (stated in product name)',value:fromName,rawValue:p!.name!,evidenceRole:'product_name_declaration',sourceUrl:src,variantId:null});
  }
  // Phase251: a name-only identity key ("20 Litre Microwave Oven" on one host) can cover several models' pages.
  const basis=(store.db.prepare('SELECT key_basis FROM products WHERE product_id=?').get(pid) as {key_basis:string}|undefined)?.key_basis;
  // Phase252: only the product's own pages (role main_product) count; a comparison table on another model's page that
  // names this product is not a second model page (development: havitsmart KB901L was flagged falsely).
  const own=((store.db.prepare("SELECT group_concat(r.url,char(10)) u FROM product_sources ps JOIN revisions r USING(revision_id) WHERE ps.product_id=? AND ps.role='main_product'").get(pid) as {u:string|null}|undefined)?.u??'').split('\n').filter(Boolean);
  const models=new Set(own.map(urlModelToken252).filter((x):x is string=>!!x));
  const identityWarning=basis==='host_name'&&models.size>1?`identity rests on the product name, but it covers ${models.size} model pages (${[...models].sort().join(', ')}): identity needs review`:null;
  // Phase252: products split from one generic name ("20 Litre Microwave Oven") are told apart by their model code.
  const model=(p as {declaredModel?:string|null}|null)?.declaredModel??null;
  const name=p?.name&&model&&!p.name.toLowerCase().replace(/[^a-z0-9]/g,'').includes(model.toLowerCase().replace(/[^a-z0-9]/g,''))?`${p.name} (${model})`:p?.name??pid;
  return {productId:pid,name,declarations,identityWarning};
 });
}

/** Exactly one volume token in a product name ("8L", "7.6 L", "1.7 litre", "6.8-Quart") gives a declared capacity. */
export function capacityFromName249(name:string|null):Value245|null{
 if(!name)return null;
 const m=[...name.matchAll(/(?<![\w.])(\d{1,2}(?:\.\d{1,2})?)\s?-?\s?(l|ltr|litres?|liters?|quarts?|qt)(?![a-z])/gi)];
 if(m.length!==1)return null;
 const u=/^q/i.test(m[0][2])?'qt':'l';
 return {kind:'quantity',number:Number(m[0][1]),unit:u,approximate:false};
}
