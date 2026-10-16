/**
 * Phase253 Stage 4 — proposals to type sources registered as 'unknown', only from evidence already retained:
 *  - brand_matches_host: every brand declared on the source's own product pages is the host's own name
 *    ("Cosori" on cosori.com) → manufacturer;
 *  - several_foreign_brands: two or more declared brands, none of them the host's name → retailer.
 * Anything else stays unknown: no brand declared, or one brand that is not the host's name (an own label, a
 * distributor or a retailer cannot be told apart). Missing evidence stays missing. Proposals are applied with
 * KnowledgeStore246.classifySourceType253 (journaled, basis 'heuristic_unverified', reversible). Typing a source
 * changes the role its declarations are cited with; a manufacturer declaration is still never an independent test.
 */
import type {KnowledgeStore246} from './phase246_knowledge_store.js';

export interface SourceTypeProposal253 {sourceId:string;host:string;to:'manufacturer'|'retailer'|null;rule:string;brands:string[];detail:string}
const alnum=(s:string)=>s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
/** The host's own label: "www.greenworkstools.co.uk" → "greenworkstools". */
export function hostLabel253(host:string):string{
 const parts=host.toLowerCase().replace(/^www\d?\./,'').split('.');
 const sld=/^(?:co|com|net|org|ac|gov)$/;
 return parts.length>=3&&sld.test(parts[parts.length-2])?parts[parts.length-3]:parts[0];
}
/** A brand names the host when its full name, or its first word of 4+ letters, is part of the host label. */
export function brandMatchesHost253(brand:string,host:string):boolean{
 const label=alnum(hostLabel253(host)),full=alnum(brand),first=alnum(brand.split(/[\s&-]+/)[0]??'');
 return (full.length>=3&&label.includes(full))||(first.length>=4&&label.includes(first));
}
export function proposeSourceTypes253(store:KnowledgeStore246):SourceTypeProposal253[]{
 const sources=store.db.prepare("SELECT source_id,host FROM sources WHERE source_type='unknown' ORDER BY host").all() as {source_id:string;host:string}[];
 const brandsOf=store.db.prepare("SELECT DISTINCT p.brand FROM revisions r JOIN product_sources ps USING(revision_id) JOIN products p USING(product_id) WHERE r.source_id=? AND ps.role='main_product' AND p.brand IS NOT NULL AND p.brand<>''");
 return sources.map(s=>{
  const brands=(brandsOf.all(s.source_id) as {brand:string}[]).map(b=>b.brand).sort();
  const own=brands.filter(b=>brandMatchesHost253(b,s.host));
  if(brands.length&&own.length===brands.length)return {sourceId:s.source_id,host:s.host,to:'manufacturer' as const,rule:'brand_matches_host',brands,
   detail:`every brand declared on its own product pages (${brands.join(', ')}) is the host's name (${hostLabel253(s.host)})`.slice(0,300)};
  if(brands.length>=2&&!own.length)return {sourceId:s.source_id,host:s.host,to:'retailer' as const,rule:'several_foreign_brands',brands,
   detail:`declares ${brands.length} brands (${brands.join(', ')}), none of them the host's name`.slice(0,300)};
  return {sourceId:s.source_id,host:s.host,to:null,rule:brands.length?'one_brand_not_host':'no_brand_declared',brands,
   detail:brands.length?`one brand (${brands.join(', ')}) that is not the host's name: own label, distributor or retailer cannot be told apart`:'no brand declared on its product pages'};
 });
}
