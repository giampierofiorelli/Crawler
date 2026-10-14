/** Developer-only original PDF replay. Original manufacturer bytes never packaged. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const previous=JSON.parse(readFileSync('/mnt/data/PHASE239-15-ORIGINAL-PDF-REPLAY.json','utf8'));
const observations=[];
for(const row of previous.observations){
 const original=readFileSync('/mnt/data/'+row.filename);
 const sha=createHash('sha256').update(original).digest('hex');
 if(sha!==row.sha256)throw Error('phase240_original_document_sha_changed:'+row.filename);
 const parsed=await parseDocumentBytes228(original,'pdf');
 observations.push({filename:row.filename,sha256:sha,phase239ClaimCount:row.phase239Count,
  phase240ClaimCount:parsed.claimCount,oldClaimsUnchanged:parsed.claimCount===row.phase239Count,
  visualSlots:parsed.visualTableSlots?.length??0,
  slotKinds:Object.fromEntries([...new Set((parsed.visualTableSlots??[]).map(c=>c.kind))].map(k=>[k,parsed.visualTableSlots.filter(c=>c.kind===k).length])),
  distinctSlotPages:[...new Set((parsed.visualTableSlots??[]).map(c=>c.page))],
  allVisualSlotsAreUnassigned:(parsed.visualTableSlots??[]).every(c=>c.association==='unresolved_icon_or_column_heading'&&!c.rankingAuthorized),
  claimsNonRankable:parsed.claims.every(c=>c.rankingAuthorized===false&&c.testedPerformance===false&&c.exactVariantVerified===false),
  reasonCodes:parsed.reasonCodes});
 console.log(row.filename,parsed.claimCount,'visual',parsed.visualTableSlots?.length??0);
}
const r={schema:'pee240.fifteen-real-pdf-development-replay.v1',date:'2026-10-14',
 manufacturerOriginalsPackaged:false,previousOriginalCorpusIsDevelopmentOnly:true,
 independentHoldoutGeneralizationNotEstablished:true,visualSlotsNotScientificClaims:true,
 allClaimCountsUnchanged:observations.every(x=>x.oldClaimsUnchanged),
 originalDocuments:observations};
writeFileSync('docs/phase240/PHASE240-15-ORIGINAL-PDF-REPLAY.json',JSON.stringify(r,null,2)+'\n');
console.log('ALL PRIOR CLAIM COUNTS PRESERVED',r.allClaimCountsUnchanged);
