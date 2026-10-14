/** Original manufacturer PDF evaluation. Source binaries are provided by the user;
 * never bundled, logged verbatim or used as independent product testing. */
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const args=process.argv.slice(2);
const files={};for(let i=0;i<args.length;i+=2)files[args[i].replace(/^--/,'')]=args[i+1];
if(!files.purifier||!files.washdry||!files.dreame){
 process.stderr.write('Usage: node scripts/phase230-evaluate-original-pdfs.mjs --purifier PATH --washdry PATH --dreame PATH\n');
 process.exit(2);
}
const gold=JSON.parse(readFileSync('evaluation/phase230/REAL-PDF-MANUAL-GOLD.json','utf8'));
const output={schema:'pee230.original-pdf-benchmark.1',mode:'offline_actual_user_uploaded_manufacturer_documents',
 originalUrlsUnknown:true,manufacturerClaimsOnly:true,independentEvidenceVerified:false,rankingAuthorized:false,
 selectedGoldNotExhaustive:true,sources:[],totals:{selectedGold:0,selectedMatched:0,emitted:0,unmatchedEmitted:0}};
for(const [id,meta] of Object.entries(gold.sources)){
 const file=readFileSync(files[id]);const t=performance.now();const result=await parseDocumentBytes228(file,'pdf');
 const durationMs=Math.round(performance.now()-t);
 const got=result.claims.map(c=>[c.label,c.value,c.unit,c.locator.page]);
 const key=x=>JSON.stringify(x);
 const known=new Set(meta.expectedSelectedClaims.map(key));
 const emitted=new Set(got.map(key));
 const matched=meta.expectedSelectedClaims.filter(g=>emitted.has(key(g)));
 const emittedUnknown=got.filter(g=>!known.has(key(g)));
 const forbidden=(meta.forbiddenCrossScopeClaims??[]).filter(c=>emitted.has(key(c)));
 if(result.claims.some(c=>c.model!==null||c.exactVariantVerified||c.rankingAuthorized||c.testedPerformance))throw Error('Unsafe model/verification/ranking attribution: '+id);
 if(forbidden.length)throw Error('Unsafe cross-component weight promoted: '+id);
 if(id==='washdry'&&result.claimCount!==0)throw Error('Multiple model release unexpectedly created unscoped claims');
 output.totals.selectedGold+=meta.expectedSelectedClaims.length;
 output.totals.selectedMatched+=matched.length;output.totals.emitted+=got.length;output.totals.unmatchedEmitted+=emittedUnknown.length;
 output.sources.push({id,documentSha256:result.documentSha256,bytes:file.length,pagesSelectedForReading:24,
  durationMs,selectedGoldCount:meta.expectedSelectedClaims.length,selectedMatchedCount:matched.length,
  selectedMissing:meta.expectedSelectedClaims.filter(g=>!emitted.has(key(g))),
  emittedCount:got.length,unmatchedEmittedCount:emittedUnknown.length,unmatchedEmitted:emittedUnknown,
  modelResolved:result.declaredModel!==null,reasonCodes:result.reasonCodes,
  metadataOnly:result.rawTextStored===false&&result.rawDocumentStored===false});
}
output.totals.selectedGoldRecall=output.totals.selectedMatched/output.totals.selectedGold;
process.stdout.write(JSON.stringify(output,null,2)+'\n');
