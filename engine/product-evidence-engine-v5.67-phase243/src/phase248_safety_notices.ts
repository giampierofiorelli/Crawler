/** Phase248 — independent regulatory safety evidence from GOV.UK product safety alerts, reports and recalls
 * (Office for Product Safety and Standards, published under the Open Government Licence v3.0).
 *
 * What a notice is: an independent regulator's finding that *identified* products (brand, model codes, SKUs,
 * batches) presented a hazard, and the corrective measure taken. It is independent of the manufacturer, but it is
 * not performance evidence, not a test of the category, and not a statement about any other model: a notice is
 * attached to a product only on an exact identifier match, never on a similar name.
 *
 * Parsing is deterministic and works on the GOV.UK content API JSON (`/api/content/<path>`). Retention of notices
 * beyond the current run is governed by a source policy the owner approves; this module stores nothing.
 */
import {parseHtml245,walk245,textOf245,clean245,type Node245} from './phase245_html_dom.js';
import type {CategoryEntry248} from './phase248_advisory_journey.js';

export const SAFETY_NOTICE_PARSER248='opss-notice-2';
export const OGL_ATTRIBUTION248='Contains public sector information licensed under the Open Government Licence v3.0.';
export type HazardClass248='fire'|'electric_shock'|'burns'|'injury'|'choking'|'chemical'|'suffocation'|'entrapment'|'explosion'|'other';
export interface ModelIdentifier248 {code:string;key:string;label:string;strength:'alphanumeric'|'numeric'}
export interface SafetyNotice248 {
 schema:'pee248.safety-notice.v1';parser:typeof SAFETY_NOTICE_PARSER248;
 source:{publisher:'Office for Product Safety and Standards (GOV.UK)';url:string;licence:'OGL-3.0';attribution:string;retrievedAt:string};
 noticeType:'recall'|'safety_report'|'alert'|'other';title:string;publishedAt:string|null;updatedAt:string|null;
 riskLevel:'serious'|'high'|'medium'|'low'|'not_provided'|null;measures:string[];
 product:{name:string|null;type:string|null;categoryIds:string[];brand:string|null;counterfeit:boolean;identifiers:ModelIdentifier248[]};
 hazard:{summary:string|null;classes:HazardClass248[]};
 regulationsNotMet:string[];psdNumbers:string[];notifiedBy:string|null;
 evidence:{kind:'regulatory_safety_notice';independentOfManufacturer:true;performanceEvidence:false;scope:'identified_products_only';
  rankingAuthorized:false};
}
export interface GovUkContent248 {base_path?:string;title?:string;first_published_at?:string;public_updated_at?:string;document_type?:string;
 details?:{body?:string;metadata?:Record<string,unknown>}}

const HAZARDS:[HazardClass248,RegExp][]=[
 ['fire',/\b(?:fire|ignit\w*|overheat\w*|flames?|melt\w*)\b/i],['electric_shock',/\belectric(?:al)? shock|electrocution|live parts\b/i],
 ['burns',/\bburns?\b|\bscald\w*/i],['injury',/\binjur\w*|\blacerat\w*|\bcuts?\b/i],['choking',/\bchok\w*/i],
 ['chemical',/\bchemical\w*|\btoxic\b|\blead\b|\bphthalat\w*/i],['suffocation',/\bsuffocat\w*|\bstrangulat\w*/i],
 ['entrapment',/\bentrapment\b|\btrap\w*/i],['explosion',/\bexplo\w*/i],
];
const ID_LABEL=/\b(?:models?|sku|product codes?|identifiers?|barcodes?|batch(?:es)?|ean|gtin|part numbers?|item numbers?|lot|asin|ref|reference)\b/i;
const NOT_CODE=/^(?:\d{1,2}(?:\.\d)?(?:l|ltr|w|v|kw|qt)|(?:19|20)\d{2}|\d{1,2})$/i; // capacities, powers, years, small counts
/** Model/SKU tokens: at least three characters and a digit; separators normalised for exact comparison only. */
export function identifierKey248(code:string):string{return code.toUpperCase().replace(/[\s._/-]+/g,'');}
function codesIn(text:string,label:string):ModelIdentifier248[]{
 const out:ModelIdentifier248[]=[];
 for(const m of text.matchAll(/(?<![\p{L}\p{N}])([A-Z0-9][A-Z0-9._/-]{1,30}[A-Z0-9])(?![\p{L}\p{N}])/giu)){
  const code=m[1];if(!/\d/.test(code)||code.length<3||NOT_CODE.test(code))continue;
  const strength=/[A-Z]/i.test(code)?'alphanumeric':'numeric';
  if(strength==='numeric'&&code.replace(/\D/g,'').length<3)continue;
  // Words such as "8L" or "2.2Ltr" in a model description are sizes, not codes.
  if(/^\d+(?:\.\d+)?(?:l|ltr|litre|ml|w|v|mm|cm|kg|g|in|qt|amps?|a|mah|hz)$/i.test(code))continue;
  // "110, 100 and 90cm models": numbers in a list closed by a length unit are sizes.
  if(strength==='numeric'&&new RegExp(`\\b${code}\\b[\\d,\\s]*(?:and|or)?\\s*\\d*\\s?(?:cm|mm|in|inch|l|litre)\\b`,'i').test(text))continue;
  out.push({code,key:identifierKey248(code),label,strength});
 }
 // A model written as letters, a space and a number ("ERT 1500") in a model field is one code.
 if(/\bmodel/i.test(label))for(const m of text.matchAll(/(?<![\p{L}\p{N}])([A-Z]{2,5}) (\d{3,6})(?![\p{L}\p{N}])/gu))
  out.push({code:`${m[1]} ${m[2]}`,key:identifierKey248(m[1]+m[2]),label,strength:'alphanumeric'});
 return out.filter(o=>!(o.strength==='numeric'&&out.some(x=>x.code.includes(' ')&&x.code.endsWith(' '+o.code))));
}
const slug=(s:unknown)=>typeof s==='string'?s:null;
function sectionText(nodes:Node245[],heading:RegExp):string|null{
 const i=nodes.findIndex(n=>/^h[2-4]$/.test(n.tag)&&heading.test(textOf245(n)));if(i<0)return null;
 const parts:string[]=[];for(let j=i+1;j<nodes.length&&!/^h[2-4]$/.test(nodes[j].tag);j++){const t=textOf245(nodes[j]);if(t)parts.push(t);}
 return parts.join('\n')||null;
}
export function categoriesFor248(type:string|null,name:string|null,registry:readonly CategoryEntry248[]):string[]{
 // Plurals in regulator taxonomies ("Rice Cookers") name the same category.
 const norm=(x:string|null)=>` ${(x??'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/(\w{3,})s\b/g,'$1')} `;
 const hitsIn=(t:string)=>{const hits=registry.filter(r=>r.aliases.some(a=>t.includes(` ${a.toLowerCase().replace(/[^a-z0-9]+/g,' ')} `)));
  // "Toaster oven" names a toaster oven, not a toaster: a longer alias containing a shorter one wins.
  return hits.filter(h=>!hits.some(o=>o!==h&&o.aliases.some(a=>h.aliases.some(b=>a!==b&&a.includes(b)&&t.includes(` ${a} `))))).map(h=>h.id).sort();};
 // The product line decides when it names a category; a regulator class such as "Rice Cookers/Steamers" can span two.
 const byName=hitsIn(norm(name));
 return byName.length?byName:hitsIn(norm(type));
}
export function parseSafetyNotice248(doc:GovUkContent248,url:string,retrievedAt:string,registry:readonly CategoryEntry248[]):SafetyNotice248{
 const md=(doc.details?.metadata??{}) as Record<string,unknown>;
 const {root}=parseHtml245(`<html><body>${doc.details?.body??''}</body></html>`);
 const all=[...walk245(root)];
 const blocks=all.filter(n=>/^(?:h[2-4]|p|ul|ol|table)$/.test(n.tag)&&!all.some(a=>a!==n&&/^(?:ul|ol|table)$/.test(a.tag)&&isInside(n,a)));
 const rows=new Map<string,string>();
 for(const tr of all.filter(n=>n.tag==='tr')){
  const cells=tr.children.filter(c=>c.tag==='td'||c.tag==='th');
  if(cells.length===2){const k=clean245(textOf245(cells[0]));if(k&&!rows.has(k))rows.set(k,clean245(textOf245(cells[1])));}
 }
 const summary=(label:RegExp)=>{for(const p of all.filter(n=>n.tag==='p')){const m=new RegExp(`^${label.source}\\s*[:：]\\s*(.+)$`,'i').exec(clean245(textOf245(p)));if(m)return m[1];}return null;};
 const productName=summary(/product/);
 const hazardSummary=summary(/hazard/);
 const typeRow=[...rows].find(([k])=>/^(?:product )?type$/i.test(k))?.[1]??null;
 const type=typeRow?clean245(typeRow.replace(/^.*?\s[-–—]\s/,'')):null;
 const brandRow=[...rows].find(([k])=>/^brand$/i.test(k))?.[1]??null;
 const brand=brandRow&&!/^(?:unbranded|no brand|none|unknown|n\/a|generic)$/i.test(brandRow)?brandRow:null;
 const identifiers:ModelIdentifier248[]=[];
 for(const [k,v] of rows)if(ID_LABEL.test(k))identifiers.push(...codesIn(v,k));
 // A model code in the product line ("Elegant Life Air Fryer AF586S-T", "8L Air Fryer (Model: S-18)") is an identifier too.
 if(productName)identifiers.push(...codesIn(productName,'product line').filter(c=>c.strength==='alphanumeric'));
 const uniqIds=[...new Map(identifiers.map(i=>[i.key,i])).values()].sort((a,b)=>a.key.localeCompare(b.key));
 const hazardDetail=sectionText(blocks,/^hazard$/i);
 const hazardText=[hazardSummary,hazardDetail].filter(Boolean).join('\n');
 // The summary line states the notice's hazard; the detailed section explains mechanisms ("the fuse could fail")
 // and is used for classification only when there is no summary.
 const classifyFrom=hazardSummary??hazardDetail??'';
 const additional=sectionText(blocks,/^additional information$/i)??'';
 const alertType=slug(md.product_alert_type)??'';
 const risk=slug(md.product_risk_level);
 const title=doc.title??'';
 return {schema:'pee248.safety-notice.v1',parser:SAFETY_NOTICE_PARSER248,
  source:{publisher:'Office for Product Safety and Standards (GOV.UK)',url,licence:'OGL-3.0',attribution:OGL_ATTRIBUTION248,retrievedAt},
  noticeType:alertType==='product-recall'?'recall':alertType==='product-safety-report'?'safety_report':/alert/.test(alertType)?'alert':'other',
  title,publishedAt:slug(md.product_recall_alert_date)??doc.first_published_at??null,updatedAt:doc.public_updated_at??null,
  riskLevel:risk==='serious'||risk==='high'||risk==='medium'||risk==='low'?risk:risk==='not-provided'?'not_provided':null,
  measures:Array.isArray(md.product_measure_type)?(md.product_measure_type as unknown[]).map(String).sort():[],
  product:{name:productName,type,categoryIds:categoriesFor248(type,productName,registry),brand,
   counterfeit:/\bcounterfeit\b/i.test(`${title} ${productName??''}`),identifiers:uniqIds},
  hazard:{summary:hazardSummary,classes:(()=>{const c=HAZARDS.filter(([,re])=>re.test(classifyFrom)).map(([k])=>k);return c.length?c:classifyFrom?['other' as const]:[];})()},
  regulationsNotMet:[...new Set([...hazardText.matchAll(/\b([A-Z][\w’']*(?:\s(?:\([A-Z][\w’']*\)|[A-Z][\w’']*|and|&|of|for|on|etc\.)){0,8}\s(?:Regulations|Order)\s\d{4})\b/g)].map(m=>m[1].replace(/^The\s/,'').trim()))].sort(),
  psdNumbers:[...new Set([...additional.matchAll(/\b(\d{4}-\d{4})\b/g)].map(m=>m[1]))].sort(),
  notifiedBy:/Notified by\s*[:：]\s*(.+)/i.exec(additional)?.[1]?.trim()??null,
  evidence:{kind:'regulatory_safety_notice',independentOfManufacturer:true,performanceEvidence:false,scope:'identified_products_only',rankingAuthorized:false}};
}
function isInside(n:Node245,a:Node245){for(let p=n.parent;p;p=p.parent)if(p===a)return true;return false;}

export interface ProductRef248 {name:string;brand?:string|null;identifiers:string[]}
export type NoticeMatch248={status:'exact_identifier';identifier:string}|{status:'brand_and_category_only'}|{status:'none'};
/** A notice applies to a product only through an exact identifier match. A numeric-only code additionally needs
 * the same brand on both sides. Brand + category without an identifier is reported, never treated as a match. */
export function matchNotice248(n:SafetyNotice248,p:ProductRef248,categoryId?:string):NoticeMatch248{
 const keys=new Set(p.identifiers.map(identifierKey248).filter(k=>k.length>=3));
 const brandEq=!!n.product.brand&&!!p.brand&&n.product.brand.toLowerCase().replace(/\s+/g,'')===p.brand.toLowerCase().replace(/\s+/g,'');
 for(const id of n.product.identifiers){
  if(!keys.has(id.key))continue;
  if(id.strength==='numeric'&&!brandEq)continue;
  return {status:'exact_identifier',identifier:id.code};
 }
 if(brandEq&&(!categoryId||n.product.categoryIds.includes(categoryId)))return {status:'brand_and_category_only'};
 return {status:'none'};
}

export interface CategorySafetyProfile248 {categoryId:string;notices:number;byHazard:Record<string,number>;byType:Record<string,number>;
 counterfeit:number;seriousOrHigh:number;sources:string[];
 interpretation:'independent regulatory findings about identified products; frequencies describe notices, not failure rates';
 rankingAuthorized:false}
/** Category-level view: which hazards regulators have found in this category. A count of notices is not a failure
 * rate (market share, enforcement focus and import checks shape it), so it informs cautions, never rankings. */
export function categorySafetyProfile248(notices:readonly SafetyNotice248[],categoryId:string):CategorySafetyProfile248{
 const ns=notices.filter(n=>n.product.categoryIds.includes(categoryId));
 const count=(xs:string[])=>xs.reduce((a,x)=>(a[x]=(a[x]??0)+1,a),{} as Record<string,number>);
 return {categoryId,notices:ns.length,byHazard:count(ns.flatMap(n=>n.hazard.classes)),byType:count(ns.map(n=>n.noticeType)),
  counterfeit:ns.filter(n=>n.product.counterfeit).length,seriousOrHigh:ns.filter(n=>n.riskLevel==='serious'||n.riskLevel==='high').length,
  sources:ns.map(n=>n.source.url).sort(),
  interpretation:'independent regulatory findings about identified products; frequencies describe notices, not failure rates',rankingAuthorized:false};
}
