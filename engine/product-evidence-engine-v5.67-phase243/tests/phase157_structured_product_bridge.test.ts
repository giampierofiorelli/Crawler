import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {bridgeExtructProductData157,analyzeEnglishReviewWithExtruct157} from '../src/phase157_structured_product_bridge.js';
import type {ReaderInput139} from '../src/phase139_unmarked_english_candidate_reader.js';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
function inp(t='We tested Brand Aurora 27.'):ReaderInput139{
 return {document:{text:t,sha256:hash(t),source:{id:'doc157',originalDocumentId:'doc157',url:'https://example.org/review',title:'Brand Aurora 27 review',role:'original_product_test'}}} as ReaderInput139;
}
test('JSON-LD graph with verified location paths but unverified source claims',()=>{
 const d=bridgeExtructProductData157(inp(),{'json-ld':[{'@graph':[{'@type':'Product',name:'Brand Aurora 27',brand:{name:'Brand'},model:'A27',sku:'A27W',additionalProperty:[{'@type':'PropertyValue',name:'Noise',value:'37 dBA'}]},{'@type':'Product',name:'Brand Aurora 29',model:'A29'}]}]});
 assert.equal(d.products.length,2);assert.equal(d.products[0].model,'A27');
 assert.equal(d.products[0].attributes[0].value,'37 dBA');assert.equal(d.products[0].attributes[0].scientificEvidence,false);
 assert.equal(d.products[0].reviewPageCorrespondence,'matching_page_title');
 assert.equal(d.products[1].reviewPageCorrespondence,'unresolved');
 assert.equal(d.products[0].identityVerified,false);assert.equal(d.canonicalWriteAuthorized,false);
 assert.ok(d.warnings.includes('multiple_product_nodes_not_auto_merged'));
});
test('ProductGroup remains distinct from Product variant',()=>{
 const d=bridgeExtructProductData157(inp(),{'json-ld':[{'@type':'ProductGroup',name:'Brand Aurora series',hasVariant:[{'@type':'Product',name:'Brand Aurora 27',model:'A27'}]}]});
 assert.deepEqual(d.products.map(x=>x.type),['ProductGroup','Product']);
 assert.equal(d.products.every(x=>x.identityVerified===false),true);
});
test('microdata property arrays and schema URL names',()=>{
 const d=bridgeExtructProductData157(inp(),{microdata:[{type:'http://schema.org/Product',properties:{name:['Brand Aurora 27'],model:['A27'],brand:[{name:'Brand'}],additionalProperty:[{name:'Volume',value:'345 L'}]}}]});
 assert.equal(d.products.length,1);assert.equal(d.products[0].model,'A27');assert.equal(d.products[0].brand,'Brand');
 assert.equal(d.products[0].attributes[0].value,'345 L');
});
test('does not mistake Offer and Review ratings for products',()=>{
 const d=bridgeExtructProductData157(inp(),{'json-ld':[{'@type':'Offer',price:'399'}, {'@type':'Review',ratingValue:5}]});
 assert.equal(d.products.length,0);
});
test('rejects digest mismatch',()=>{
 const i=inp();i.document.sha256='bad';
 assert.throws(()=>bridgeExtructProductData157(i,{'json-ld':[]}),/digest/);
});
test('protects against huge or malformed input',()=>{
 assert.throws(()=>bridgeExtructProductData157(inp(),null),/invalid_extruct/);
 const d=bridgeExtructProductData157(inp(),{'json-ld':Array.from({length:70},(_,n)=>({'@type':'Product',name:`N${n}`}))},3);
 assert.equal(d.products.length,3);assert.equal(d.truncated,true);
});
test('end-to-end opt-in path keeps structured values separate from measured observations',()=>{
 const d=analyzeEnglishReviewWithExtruct157(inp(),{'json-ld':[{'@type':'Product',name:'Brand Aurora 27',model:'A27',additionalProperty:[{name:'Capacity',value:'345 L'}]}]});
 assert.equal(d.review.phase,156);assert.equal(d.structured.products.length,1);assert.equal(d.identityMergeAuthorized,false);
 assert.equal(d.rankingAuthorized,false);assert.equal(d.canonicalWriteAuthorized,false);
 assert.equal(d.structured.products[0].attributes[0].scientificEvidence,false);
});
