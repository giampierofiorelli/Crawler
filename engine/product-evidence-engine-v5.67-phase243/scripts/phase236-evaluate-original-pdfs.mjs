/** Reproduce Phase236 on the ten original, user-supplied PDF files.
 * Run: node scripts/phase236-evaluate-original-pdfs.mjs <10 local paths>
 * Order: Dyson Big+Quiet, Dyson Wash+Dry, Dreame, Philips CX50, Philips Azurion,
 * Lavazza, Tefal MultiCook, Miele WWI860, Tefal Steam Cuisine, Miele catalogue.
 * Emits typed observation metadata only; source PDF bytes/passages never emitted.
 */
import {readFileSync} from 'node:fs';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const ids=['dyson_bigquiet','dyson_washdry','dreame','philips_cx50','philips_azurion','lavazza','tefal_multicook','miele_wwi860','tefal_steam','miele_catalog'];
if(process.argv.length!==12){console.error('Expected 10 local original PDF paths, in the documented order');process.exit(2);}
const expected={dyson_bigquiet:10,dyson_washdry:10,dreame:2,philips_cx50:22,philips_azurion:27,lavazza:2,tefal_multicook:1,miele_wwi860:10,tefal_steam:1,miele_catalog:23};
const observations=[];
for(let i=0;i<ids.length;i++){
 const r=await parseDocumentBytes228(readFileSync(process.argv[i+2]),'pdf');
 observations.push({id:ids[i],documentSha256:r.documentSha256,claimCount:r.claimCount,
  expectedDeveloperCorpusCount:expected[ids[i]],countMatchesKnownDeveloperCorpus:r.claimCount===expected[ids[i]],
  conditionalRules:r.claims.filter(c=>c.configurationDependency).map(c=>({component:c.scopeComponent,
   dimension:c.value,unit:c.unit,condition:c.configurationDependency,locator:c.locator})),
  programSettings:r.claims.filter(c=>c.programSetting).map(c=>({range:c.range,setting:c.programSetting,
   locator:c.locator})),
  reasonCodes:r.reasonCodes,rankingAuthorized:r.rankingAuthorized,scientificEvidenceAdmitted:r.scientificEvidenceAdmitted});
}
console.log(JSON.stringify({schema:'pee236.original-pdf-replay.v1',release:'5.60.0',sample:'ten development PDFs, NOT independent heldout evaluation',sourceBytesPackaged:false,
 newClaimsPublisherDeclaredOnly:true,observations},null,2));
