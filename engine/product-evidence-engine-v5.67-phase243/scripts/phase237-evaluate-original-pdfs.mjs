/** Reproduce ten original publisher PDFs, in strict Phase236 documented order.
 * No original document text or bytes emitted. This is a DEVELOPMENT corpus,
 * not a heldout accuracy set; output includes claim identities and types only.
 */
import {readFileSync} from 'node:fs';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const ids=['dyson_bigquiet','dyson_washdry','dreame','philips_cx50','philips_azurion','lavazza','tefal_multicook','miele_wwi860','tefal_steam','miele_catalog'];
const old=[10,10,2,22,27,2,1,10,1,23];
if(process.argv.length!==12)throw Error('Expected ten original PDF paths in Phase236 order');
const obs=[];
for(let i=0;i<10;i++){
 const r=await parseDocumentBytes228(readFileSync(process.argv[i+2]),'pdf');
 const table=r.claims.filter(c=>c.programTableSetting);
 const authoredConflict=r.reasonCodes.includes('pdf_programme_table_vs_prose_conflict_unresolved');
 obs.push({id:ids[i],documentSha256:r.documentSha256,previousPhase236Count:old[i],claimCount:r.claimCount,
  stablePreviousCount:ids[i]==='tefal_multicook'?null:r.claimCount===old[i],
  programmeTableTuples:table.length,tupleLabels:table.map(c=>({program:c.programTableSetting.program,
   foodType:c.programTableSetting.foodType,defaultDurationMinutes:c.programTableSetting.defaultDurationMinutes,
   adjustableDurationMinutes:c.programTableSetting.adjustableDurationMinutes,
   defaultTemperatureCelsius:c.programTableSetting.defaultTemperatureCelsius,locator:c.locator})),
  authoredConflict,unresolvedConflict:authoredConflict,
  rankingAuthorized:r.rankingAuthorized,scientificEvidenceAdmitted:r.scientificEvidenceAdmitted,
  rawTextStored:r.rawTextStored,rawDocumentStored:r.rawDocumentStored});
}
console.log(JSON.stringify({schema:'pee237.ten-original-pdf-replay.v1',release:'5.61.0',
 developerSampleOnly:true,notBlindHoldout:true,publisherBytesDistributed:false,
 countsAreNotAccuracyMetrics:true,observations:obs},null,2));
