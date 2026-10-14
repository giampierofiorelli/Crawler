import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readDimensionalContext145} from '../dist/src/phase145_unit_context_bridge.js';
import {readCrossCategoryObservations144} from '../dist/src/phase144_cross_category_observation_graph.js';
const source=JSON.parse(readFileSync('research/phase145_cross_domain_postcode_challenge.json','utf8'));
const h=x=>createHash('sha256').update(x).digest('hex');
const rows=source.items.map(r=>{
 const input={document:{text:r.text,sha256:h(r.text),source:{id:r.id,originalDocumentId:r.id,url:r.url,title:'Brief publisher-sourced excerpt',role:'original_product_test'}},pageIdentity:{reviewedProductId:r.id,reviewedVariantId:r.id,reviewedAliases:[r.product]}};
 const b=readCrossCategoryObservations144(input),n=readDimensionalContext145(input);
 return {id:r.id,category:r.category,publisher:r.publisher,url:r.url,excerptHash:h(r.text),
  prior144QuantityCount:b.observations.length,phase145QuantityCount:n.measurements.length,
  measurements:n.measurements.map(m=>({literal:m.quantity.literal,dimension:m.dimension,originalUnit:m.originalUnit,canonicalUnit:m.canonicalUnit,canonicalValue:m.canonicalValue,role:m.role,subject:m.subjectSurface?.literal??null,subjectAuthenticated:m.subjectAuthenticated,
   roleReasons:m.roleReasons,spanSha256:m.quantity.sha256})),surfaceLinks:n.surfaceLinks.length,
  coverageTruncated:n.coverageTruncated,canonicalWriteAuthorized:n.canonicalWriteAuthorized,rankingAuthorized:n.rankingAuthorized};
});
const result={phase:145,version:'4.69-phase145',sourceKind:'selected_original_professional_excerpts',selectionTiming:'after_code_written_not_independent_or_blind',evaluationKind:'diagnostic_only_no_gold',citationScope:'four short snippets, not complete article',
 publisherCount:new Set(rows.map(x=>x.publisher)).size,categoryCount:new Set(rows.map(x=>x.category)).size,
 accuracy:null,independentGoldAnnotations:0,rows};
writeFileSync('PHASE145-CROSS-DOMAIN-DIAGNOSTIC.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(rows.map(x=>({category:x.category,previous:x.prior144QuantityCount,current:x.phase145QuantityCount,units:x.measurements.map(m=>m.originalUnit),roles:x.measurements.map(m=>m.role)})),null,2));
