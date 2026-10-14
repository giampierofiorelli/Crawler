/** Phase 157: bounded bridge for extruct's already-extracted JSON-LD/Microdata
 * output. Actual HTML extraction is performed by upstream extruct, NOT by
 * this file. NO page offset is invented when extruct omits one. No canonical
 * product identity, scientific evidence, database write, or ranking authority.
 */
import {createHash} from 'node:crypto';
import type {ReaderInput139} from './phase139_unmarked_english_candidate_reader.js';
import {analyzeEnglishReview156, type Review156} from './phase156_review_document_engine.js';
const sha=(s:string)=>createHash('sha256').update(s).digest('hex');
const normalization=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const obj=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==='object'&&!Array.isArray(x);
const bounded=(s:string)=>s.length>0&&s.length<=500&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s);
const text=(v:unknown):string|null=>{
 if(typeof v==='string')return bounded(v.trim())?v.trim():null;
 if(typeof v==='number'&&Number.isFinite(v))return String(v);
 if(Array.isArray(v)&&v.length===1)return text(v[0]);
 if(obj(v))return text(v['@value'])??text(v.value)??null;
 return null;
};
const typed=(v:unknown):string[]=>{
 const raw=Array.isArray(v)?v:[v];return raw.flatMap(x=>typeof x==='string'?[x.toLowerCase()]:[]).map(x=>x.split(/[\/#]/).pop()??'');
};
const field=(o:Record<string,unknown>,key:string):string|null=>text(o[key]??(obj(o.properties)?o.properties[key]:null));
const brand=(v:unknown):string|null=>typeof v==='string'?text(v):obj(v)?text(v.name):Array.isArray(v)?brand(v[0]):null;
export interface StructuredAttribute157 {name:string;value:string;path:string;sourceType:'publisher_declared_structured_metadata';
 sourceHtmlOffset:null;sourceVerified:false;scientificEvidence:false;}
export interface StructuredProduct157 {id:string;type:'Product'|'ProductGroup';sourceSyntax:'json-ld'|'microdata';path:string;
 name:string|null;brand:string|null;model:string|null;sku:string|null;mpn:string|null;gtin:string|null;
 attributes:StructuredAttribute157[];reviewPageCorrespondence:'matching_page_title'|'unresolved';
 identityVerified:false;manufacturerSpecificationVerified:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}
export interface StructuredBridge157 {phase:157;sourceUrl:string;sourceDocumentSha256:string;products:StructuredProduct157[];
 truncated:boolean;warnings:string[];extructExecutedWithinPEE:false;publisherMetadataAuthenticated:false;
 modelInferencePerformed:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}
function attributes(o:Record<string,unknown>,path:string):StructuredAttribute157[]{
 const raw=o.additionalProperty??(obj(o.properties)?o.properties.additionalProperty:undefined);
 const items=Array.isArray(raw)?raw:[raw];const out:StructuredAttribute157[]=[];
 for(let i=0;i<Math.min(items.length,120);i++){
  const item=items[i];if(!obj(item))continue;
  const name=field(item,'name');const value=field(item,'value');
  if(name&&value&&name.length<=120){out.push({name,value,path:`${path}.additionalProperty[${i}]`,
   sourceType:'publisher_declared_structured_metadata',sourceHtmlOffset:null,sourceVerified:false,scientificEvidence:false});}
 }
 return out;
}
export function bridgeExtructProductData157(input:ReaderInput139,extructData:unknown,maxProducts=60):StructuredBridge157{
 if(!Number.isSafeInteger(maxProducts)||maxProducts<1||maxProducts>200)throw Error('invalid_max_products_157');
 if(sha(input.document.text)!==input.document.sha256)throw Error('document_digest_mismatch_157');
 if(!obj(extructData))throw Error('invalid_extruct_output_157');
 const products:StructuredProduct157[]=[];const warnings:string[]=[];
 const visited=new Set<object>();let nodes=0,truncated=false;
 const visit=(node:unknown,path:string,syntax:'json-ld'|'microdata',depth=0):void=>{
  if(nodes++>6000||depth>16){truncated=true;return;}
  if(Array.isArray(node)){for(let i=0;i<Math.min(node.length,250);i++)visit(node[i],`${path}[${i}]`,syntax,depth+1);
   if(node.length>250)truncated=true;return;}
  if(!obj(node)||visited.has(node))return;visited.add(node);
  const tags=typed(node['@type']??node.type);
  const isProduct=tags.includes('product'),isGroup=tags.includes('productgroup');
  if(isProduct||isGroup){
   if(products.length>=maxProducts){truncated=true;return;}
   const get=(k:string)=>field(node,k);
   const name=get('name');const model=get('model');const id=`structured157_${products.length}`;
   const title=normalization(input.document.source.title??'');
   const fullName=normalization(name??'');
   // Title similarity is only a review PAGE hint, never proof of SKU identity.
   const corresponds=fullName.length>=8&&title.includes(fullName);
   const props=obj(node.properties)?node.properties:null;
   const b=brand(node.brand??props?.brand);
   products.push({id,type:isGroup?'ProductGroup':'Product',sourceSyntax:syntax,path,name,brand:b,model,
    sku:get('sku'),mpn:get('mpn'),gtin:get('gtin13')??get('gtin14')??get('gtin12')??get('gtin8')??get('gtin'),
    attributes:attributes(node,path),reviewPageCorrespondence:corresponds?'matching_page_title':'unresolved',
    identityVerified:false,manufacturerSpecificationVerified:false,canonicalWriteAuthorized:false,rankingAuthorized:false});
  }
  for(const [k,v] of Object.entries(node)){
   if(k==='@context'||k==='additionalProperty'||k==='properties'||k==='offers'||k==='aggregateRating'||k==='review')continue;
   if(k==='@graph'||k==='hasVariant'||k==='isVariantOf'||k==='itemListElement'||k==='mainEntity'||k==='item'||k==='about'||k==='subjectOf')visit(v,`${path}.${k}`,syntax,depth+1);
  }
 };
 for(const [key,syntax] of [['json-ld','json-ld'],['microdata','microdata']] as const){
  const raw=extructData[key];if(raw!==undefined)visit(raw,key,syntax);
 }
 if(products.length===0)warnings.push('no_product_structured_metadata');
 if(products.length>1)warnings.push('multiple_product_nodes_not_auto_merged');
 if(products.some(p=>p.attributes.length))warnings.push('publisher_property_values_are_not_independent_measurements');
 if(truncated)warnings.push('structured_input_truncated');
 return {phase:157,sourceUrl:input.document.source.url,sourceDocumentSha256:input.document.sha256,
  products,truncated,warnings,extructExecutedWithinPEE:false,publisherMetadataAuthenticated:false,
  modelInferencePerformed:false,canonicalWriteAuthorized:false,rankingAuthorized:false};
}
export interface Coordinated157 {phase:157;review:Review156;structured:StructuredBridge157;
 publisherClaimsRequireIndependentVerification:true;identityMergeAuthorized:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}
/** 156 text analysis and optional extruct output are kept side-by-side. */
export function analyzeEnglishReviewWithExtruct157(input:ReaderInput139,extructData:unknown):Coordinated157{
 const review=analyzeEnglishReview156(input);
 const structured=bridgeExtructProductData157(input,extructData);
 return {phase:157,review,structured,publisherClaimsRequireIndependentVerification:true,identityMergeAuthorized:false,
  canonicalWriteAuthorized:false,rankingAuthorized:false};
}
