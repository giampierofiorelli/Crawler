/** Benchmark of exact user-provided PDF bytes. Not a product testing or accuracy estimate.
 * Original documents are never packaged or persisted by the PEE.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const args={};const argv=process.argv.slice(2);
for(let i=0;i<argv.length;i+=2)args[argv[i].replace(/^--/,'')]=argv[i+1];
const expected=['purifier','washdry','dreame','cx50','azurion'];
if(expected.some(k=>!args[k])){process.stderr.write('Usage: node scripts/phase231-evaluate-original-pdfs.mjs --purifier PDF --washdry PDF --dreame PDF --cx50 PDF --azurion PDF\n');process.exit(2);}
const reference={
 'C5-1|number of elements|160|count|14':true,
 'C8-5|scanplane aperture|22.4|mm|14':true,
 'L12-3|scanplane aperture|38|mm|14':true,
 'S5-1|number of elements|80|count|14':true,
 'S8-3|field of view|90|degrees|14':true,
 'X7-2t|number of elements|2500|count|15':true,
 'L15-7io|scanplane aperture|23|mm|15':true,
 'S12-4|number of elements|96|count|15':true
};
const sha=b=>createHash('sha256').update(b).digest('hex');
const report={schema:'pee231.real-pdf-scope-benchmark.1',basis:'exact_user_uploads_offline',
 scope:'selected_manually_checked_values_not_population_accuracy',sourceUrlsNotVerified:true,
 publisherSpecificationsOnly:true,sourceBinariesIncluded:false,independentEvidenceVerified:false,rankingAuthorized:false,
 documents:[],selectedComponentAnchors:{count:8,matched:0,missing:[]},notes:[]};
for(const k of expected){
 const data=readFileSync(args[k]);const result=await parseDocumentBytes228(data,'pdf');
 if(result.documentSha256!==sha(data)||result.rankingAuthorized||result.scientificEvidenceAdmitted||
 result.rawDocumentStored||result.rawTextStored||result.claims.some(c=>c.exactVariantVerified||c.testedPerformance||c.rankingAuthorized))
   throw Error('Parser breached evidence or provenance boundary: '+k);
 const components=result.claims.filter(c=>c.componentModel);
 if(components.some(c=>c.model!==null||c.modelAssignment!=='unresolved'||!c.locator.page||!c.locator.box))
   throw Error('Unsafe parent model attribution: '+k);
 const rec={id:k,sha256:sha(data),sourcePagesProcessedAtMost:24,totalClaims:result.claimCount,
 componentScopedCount:components.length,unscopedCount:result.claimCount-components.length,
 reasonCodes:result.reasonCodes};
 if(k==='azurion'){
  rec.specificCompoundUnitCase=result.claims.filter(c=>c.label.startsWith('two speed control')).map(c=>({value:c.value,unit:c.unit}));
  if(rec.specificCompoundUnitCase.length!==1||rec.specificCompoundUnitCase[0].unit!=='cm/s')throw Error('Compound unit still misread');
 }
 if(k==='cx50'){
   const got=new Set(components.map(c=>[c.componentModel,c.label,c.value,c.unit,c.locator.page].join('|')));
   report.selectedComponentAnchors.missing=Object.keys(reference).filter(anchor=>!got.has(anchor));
   report.selectedComponentAnchors.matched=8-report.selectedComponentAnchors.missing.length;
   if(report.selectedComponentAnchors.missing.length)throw Error('Selected component anchors missing');
 }
 if(k==='washdry'&&result.claimCount!==0)throw Error('Multivariant unrelated PDF emitted unscoped claims');
 report.documents.push(rec);
}
report.notes.push('Subset is development/in-sample; do not treat 8/8 as out-of-sample reliability, precision or recall.');
report.notes.push('The prior five manufacturer-authored PDFs remain unrelated to real PEE web acquisition.');
process.stdout.write(JSON.stringify(report,null,2)+'\n');
