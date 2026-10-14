/** Developer-only replay: original manufacturer bytes NEVER distributed. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const previous=JSON.parse(readFileSync('/mnt/data/PHASE238-12-PDF-REPLAY.json','utf8'));
const filenames=previous.observations.map(x=>x.filename).concat([
  'EY905J_IFU_User_Manual.pdf',
  'IFU_User_Manual_Tefal_Dolci_Ice_Cream_Maker.pdf',
  'GC242D_IFU.pdf']);
const baseline=JSON.parse(readFileSync('/mnt/data/phase239-audit/PHASE239-THREE-NEW-PDF-V562-FROZEN-BASELINE.json','utf8'));
const prevBySha=new Map(previous.observations.map(x=>[x.sourceDocumentSha256,x]));
const observations=[];
for(const filename of filenames){
 const original=readFileSync('/mnt/data/'+filename),sha=createHash('sha256').update(original).digest('hex');
 const r=await parseDocumentBytes228(original,'pdf');const prev=prevBySha.get(sha);
 const methods=Object.fromEntries([...new Set(r.claims.map(x=>x.extractionMethod))].map(k=>[k,r.claims.filter(x=>x.extractionMethod===k).length]));
 observations.push({filename,sha256:sha,phase238Count:prev?.phase238Count??0,phase239Count:r.claimCount,
  unchangedFromPriorDevelopmentSample:prev?prev.phase238Count===r.claimCount:null,
  methods,discrepancies:r.discrepancies?.edges?.length??null,
  allClaimsUnverified:r.claims.every(c=>c.rankingAuthorized===false&&c.testedPerformance===false&&c.sourceRole==='publisher_document_claim_unverified'),
  noRawTextOrDocumentStored:!r.rawTextStored&&!r.rawDocumentStored,
  exactCommercialProductVariantVerified:false,reasonCodes:r.reasonCodes});
 console.log(filename,prev?.phase238Count??0,'->',r.claimCount,JSON.stringify(methods));
}
const result={schema:'pee239.original-pdf-development-replay.v1',originalPDFsNotPackaged:true,
 phase239SamplesNowDevelopmentOnly:true,independentHoldoutAccuracyNotEstablished:true,
 autonomousPEEWebAcquisitionNotDemonstrated:true,scientificTestEvidenceAdmitted:false,rankingAuthorized:false,observations};
writeFileSync('docs/phase239/PHASE239-15-ORIGINAL-PDF-REPLAY.json',JSON.stringify(result,null,2)+'\n');
