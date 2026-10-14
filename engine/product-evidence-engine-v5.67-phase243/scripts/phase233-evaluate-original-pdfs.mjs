/** Phase233: replay 5 supplied originals, never embed PDF bytes in output/package. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const argv=process.argv.slice(2),args={};
for(let i=0;i<argv.length;i+=2)args[argv[i]?.replace(/^--/,'')]=argv[i+1];
const ids=['purifier','washdry','dreame','cx50','azurion'];
if(ids.some(id=>!args[id]))throw Error('Missing --purifier --washdry --dreame --cx50 --azurion original document paths');
const reference={
 azurion:[
  {label:'source image distance',lower:89.5,upper:119.5,unit:'cm',scope:'frontal c-arm',condition:null,page:5},
  {label:'source-image distance',lower:87.9,upper:130.6,unit:'cm',scope:'lateral l-arc',condition:null,page:5}],
 washdry:[
  {label:'input voltage',lower:100,upper:120,unit:'v',scope:null,condition:'low voltage',page:1},
  {label:'input voltage',lower:200,upper:240,unit:'v',scope:null,condition:'high voltage',page:1},
  {label:'operating temperature range',lower:0,upper:40,unit:'celsius',scope:null,condition:null,page:1},
  {label:'water pressure required',lower:14.5,upper:116,unit:'psi',scope:null,condition:null,page:1}]
};
const report={schema:'pee233.original-pdf-interval-evaluation.1',date:'2026-10-13',
 inSampleDevelopmentNotHeldOut:true,manufacturerDeclarationsOnly:true,
 noOriginalDocumentsPackaged:true,independentEvidenceVerified:false,rankingAuthorized:false,
 manuallyAnnotatedIntervalAnchorsExpected:6,manuallyAnnotatedIntervalAnchorsMatched:0,
 documents:[],missingAnchors:[],priorPhase232Counts:{purifier:10,washdry:6,dreame:2,cx50:22,azurion:1}};
for(const id of ids){
 const bytes=readFileSync(args[id]);const r=await parseDocumentBytes228(bytes,'pdf');
 const hash=createHash('sha256').update(bytes).digest('hex');
 if(r.documentSha256!==hash||r.rawTextStored||r.rawDocumentStored||r.rankingAuthorized||r.scientificEvidenceAdmitted)throw Error('unsafe receipt '+id);
 const ranges=r.claims.filter(c=>c.range!==undefined);
 if(ranges.some(c=>c.value!==null||c.model!==null||c.rankingAuthorized||c.exactVariantVerified||c.optionStatus!=='not_established'))throw Error('unsafe range '+id);
 for(const a of reference[id]??[]){
  const matches=ranges.filter(c=>c.label===a.label&&c.range?.lower===a.lower&&c.range?.upper===a.upper&&c.unit===a.unit&&c.scopeComponent===a.scope&&c.condition===a.condition&&c.locator.page===a.page);
  if(matches.length!==1)report.missingAnchors.push({id,...a,matches:matches.length});
  else report.manuallyAnnotatedIntervalAnchorsMatched++;
 }
 if(id==='cx50'&&r.claims.filter(c=>c.componentModel).length!==22)throw Error('prior scoped table regression');
 if(id==='washdry'&&r.claims.filter(c=>c.variantModel).length!==6)throw Error('prior variant weights regression');
 if(id==='azurion'&&!r.claims.some(c=>c.unit==='cm/s'&&c.value===6))throw Error('prior compound unit regression');
 report.documents.push({id,sha256:hash,claimCount:r.claimCount,priorCount:report.priorPhase232Counts[id],intervalCount:ranges.length,
  variantCount:r.claims.filter(c=>c.variantModel).length,componentCount:r.claims.filter(c=>c.componentModel).length,
  ranges:ranges.map(c=>({label:c.label,range:c.range,scopeComponent:c.scopeComponent,condition:c.condition,locator:c.locator})),
  reasonCodes:r.reasonCodes});
}
if(report.missingAnchors.length)throw Error('Missing original-document anchors: '+JSON.stringify(report.missingAnchors));
process.stdout.write(JSON.stringify(report,null,2)+'\n');
