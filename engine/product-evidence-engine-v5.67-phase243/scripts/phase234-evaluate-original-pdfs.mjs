/** Phase234: original manufacturer PDFs in-sample, no copies in project ZIP. */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const argv=process.argv.slice(2),args={};
for(let i=0;i<argv.length;i+=2)args[argv[i]?.replace(/^--/,'')]=argv[i+1];
const ids=['purifier','washdry','dreame','cx50','azurion'];
if(ids.some(x=>!args[x]))throw Error('Required: --purifier --washdry --dreame --cx50 --azurion');
const previous={purifier:10,washdry:10,dreame:2,cx50:22,azurion:3};
const anchors=[
 {label:'mattress',status:'standard',kind:'accessory',scope:'patient table',page:9},
 {label:'patient straps',status:'standard',kind:'accessory',scope:'patient table',page:9},
 {label:'drip stand',status:'standard',kind:'accessory',scope:'patient table',page:9},
 {label:'panhandle',status:'optional',kind:'accessory',scope:'patient table',page:9},
 {label:'examination light',status:'optional',kind:'accessory',scope:'patient table',page:9},
 {label:'clarityiq technology',status:'optional',kind:'feature',scope:null,page:19},
 {label:'user quality control mode',status:'optional',kind:'feature',scope:null,page:19},
 {label:'parallel working',status:'standard',kind:'feature',scope:null,page:14},
];
const report={schema:'pee234.original-pdf-status-evaluation.1',date:'2026-10-14',
 inSampleDevelopmentNotHeldOut:true,manufacturerDeclarationsOnly:true,
 noOriginalDocumentsPackaged:true,independentEvidenceVerified:false,rankingAuthorized:false,
 manuallySelectedStatusAnchorsExpected:anchors.length,manuallySelectedStatusAnchorsMatched:0,
 documents:[],missingAnchors:[],limits:['not held-out','incomplete accessibility recall','manufacturer options are not SKU availability','no ranking']};
for(const id of ids){
 const bytes=readFileSync(args[id]);const r=await parseDocumentBytes228(bytes,'pdf');
 const hash=createHash('sha256').update(bytes).digest('hex');
 if(r.documentSha256!==hash||r.rawTextStored||r.rawDocumentStored||r.rankingAuthorized||r.scientificEvidenceAdmitted)throw Error('unsafe receipt '+id);
 const status=r.claims.filter(c=>c.availabilityKind!==undefined);
 if(r.claimCount!==previous[id]+status.length)throw Error(`regression ${id} counts`);
 for(const c of status){
  if(c.value!==null||c.unit!=='availability'||c.model!==null||c.modelAssignment!=='unresolved'||
    c.exactVariantVerified||c.rankingAuthorized||c.testedPerformance||c.range!==undefined)throw Error('unsafe status '+id);
 }
 if(id==='azurion'){
  for(const a of anchors){const hits=status.filter(c=>c.label===a.label&&c.optionStatus===a.status&&
    c.availabilityKind===a.kind&&c.scopeComponent===a.scope&&c.locator.page===a.page);
   if(hits.length===1)report.manuallySelectedStatusAnchorsMatched++;
   else report.missingAnchors.push({...a,hits:hits.length});
  }
  if(status.some(c=>c.label.includes('set of arm supports')||c.label.includes('neuro mattress')||c.label.includes('another item')))
   throw Error('conditional/disconnected entry promoted');
 }
 if(id==='cx50'&&r.claims.filter(c=>c.componentModel).length!==22)throw Error('transducer regression');
 if(id==='washdry'&&r.claims.filter(c=>c.variantModel).length!==6)throw Error('variant regression');
 if(id==='azurion'&&!r.claims.some(c=>c.unit==='cm/s'&&c.value===6))throw Error('velocity regression');
 report.documents.push({id,sha256:hash,priorClaimCount:previous[id],claimCount:r.claimCount,
  newAvailabilityCount:status.length,newStandardCount:status.filter(c=>c.optionStatus==='standard').length,
  newOptionalCount:status.filter(c=>c.optionStatus==='optional').length,
  accessoryCount:status.filter(c=>c.availabilityKind==='accessory').length,
  featureCount:status.filter(c=>c.availabilityKind==='feature').length,
  originalDocumentBytesExcluded:true,
  statusClaims:status.map(c=>({label:c.label,optionStatus:c.optionStatus,availabilityKind:c.availabilityKind,
    scopeComponent:c.scopeComponent,locator:c.locator})),reasonCodes:r.reasonCodes});
}
if(report.missingAnchors.length)throw Error('Missing anchors '+JSON.stringify(report.missingAnchors));
process.stdout.write(JSON.stringify(report,null,2)+'\n');
