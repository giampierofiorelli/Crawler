import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {analyzeEphemeralBatch195,writeDerivedMetadata195}=require('../dist/src/phase195_ephemeral_batch_lineage.js');
const {mkdtempSync,readFileSync,rmSync}=require('node:fs');
const {tmpdir}=require('node:os');
const {join}=require('node:path');
const body='Only transient context describing an original device laboratory review and practical usage evaluation. Measurements were collected under a documented method for a specific variant. The narrative body must never persist in any summary report. This text is synthetic and copyright free.'.repeat(4);
const r=(id,variantId='air_cleaner_x',text=body)=>({sourceId:id,url:`https://${id}.example.net/review?utm_source=demo`,category:'air_purifiers',variantId,
 transientText:text,textBasis:'rights_appropriate_extract',
 dates:[{kind:'publisher_datePublished',iso:'2025-04-01T12:00:00Z'}],attribution:[],measurements:[]});
const a=r('original');a.measurements=[{field:'cadr',value:200,unit:'cfm',protocol:'cert_v1',condition:'smoke',producerId:'lab_a',testEventId:'lab_a_001',basis:'original_test_claimed'}];
const b=r('copy','air_cleaner_x',body.replace('practical usage','daily-use'));b.attribution=[{targetSourceId:'original',kind:'reports_test_of'}];b.measurements=[{...a.measurements[0],basis:'third_party_test_reported'}];
const c=r('independent');c.transientText='Independent laboratory measurements using a second documented apparatus; results coincidentally match another laboratory but remain separate evidence. '+('Different independently-authored laboratory report. ').repeat(20);c.measurements=[{...a.measurements[0],producerId:'lab_b',testEventId:'lab_b_002'}];
const d=r('rare_model','air_cleaner_rare');d.transientText='Only a seller listing exists, without an original professional test.';d.measurements=[];
const report=analyzeEphemeralBatch195({batchId:'synthetic_batch_195',analyzedAt:'2026-10-13T08:00:00Z',reviews:[a,b,c,d]});
const dir=mkdtempSync(join(tmpdir(),'pee195-'));
try{const file=join(dir,'summary.json');writeDerivedMetadata195(file,report);const out=readFileSync(file,'utf8');
 if(out.includes(body)||out.includes('Independent laboratory measurements using a second'))throw Error('source_body_leak');
 console.log(JSON.stringify({phase:195,documents:report.sources.length,candidateLinks:report.documentCandidates.length,
 measurementCollisions:report.measurementCollisions.length,coverage:report.coverage,
 sourceBodyPresentInSavedReport:false,actualOriginalExperimentsVerified:0,publicRankingAllowed:report.publicRankingAllowed},null,2));}
finally{rmSync(dir,{recursive:true,force:true})}
