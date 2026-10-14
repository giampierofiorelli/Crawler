/** Phase238 local developer-only replay. Use original public PDF bytes separately; never package them. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const past=JSON.parse(readFileSync('/mnt/data/PHASE237-TEN-ORIGINAL-PDF-REPLAY.json','utf8'));
const candidates=[
 'Dyson Purifier Big+Quiet Formaldehyde_BP03_Tech Spec .pdf',
 'Dyson US AB Wash+Dry WD04-05-06 Tech Spec LV HV_2024.pdf',
 'R2527-Aqua_10_Pro_Track-_EN_TR_VI_TH_ID_MS_UA_ZH-HK_ZH-TW.pdf',
 'Philips-CX50-Specifications.pdf',
 'philips-azurion-bi-plane-specifications-7b20-12.pdf',
 'medias.pdf','medias 2(1).pdf','B18ba7+ic+L.pdf',
 'FS_11359330_GBE_GB-en-GB(1).pdf','Full_Miele_PRO_Range_brochure_2021.pdf',
 'FS_11359330_GBE_GB-en-GB(2).pdf',
 'BTC_Assoluta_MAN_UTE_WEB_PKG00002365_A_20250711.pdf'];
const previousBySha=new Map(past.observations.map(x=>[x.documentSha256,x]));
const observations=[];
for(const filename of candidates){
 const bytes=readFileSync('/mnt/data/'+filename),sha=createHash('sha256').update(bytes).digest('hex');
 const a=await parseDocumentBytes228(bytes,'pdf'),old=previousBySha.get(sha);
 observations.push({filename,sourceDocumentSha256:sha,priorPhase237Count:old?.claimCount??null,
  phase238Count:a.claimCount,stablePreviousCount:old?old.claimCount===a.claimCount:null,
  comparisonClass:old?'developer_sample':'phase238_new_or_repeat_uploaded',
  unresolvedDocumentDiscrepancies:a.discrepancies?.edges.length??null,
  authorClaimsOnly:a.claims.every(c=>c.sourceRole==='publisher_document_claim_unverified'&&!c.rankingAuthorized),
  modelAssignmentVerified:false,independentPerformanceEvidenceAdmitted:false,
  reasonCodes:a.reasonCodes});
}
const result={schema:'pee238.original-pdf-local-replay.v1',developerSampleOnly:true,
 independentHoldoutAfterTuning:false,originalManufacturerPDFsPackaged:false,rankingAuthorized:false,
 observations};
writeFileSync('/mnt/data/PHASE238-ORIGINAL-PDF-REPLAY.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(observations.map(o=>({file:o.filename,count:o.phase238Count,prior:o.priorPhase237Count,conflicts:o.unresolvedDocumentDiscrepancies,stable:o.stablePreviousCount})),null,2));
