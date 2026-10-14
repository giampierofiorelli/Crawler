#!/usr/bin/env node
/** Synthetic fixture runner: table research leads only; never live web access. */
import {probeTransientTestContent225} from '../dist/src/phase225_transient_test_probe.js';
import {createHash} from 'node:crypto';
const sha=x=>createHash('sha256').update(x).digest('hex');
const cases=[
 {category:'football_footwear',url:'https://synthetic-review.example.org/tests/boots',name:'Fictional Football FX1',model:'FX1',
  method:'We weighed our test samples on a digital scale.',measure:'Measured mass (g)',value:'196'},
 {category:'recycling_bins',url:'https://synthetic-review.example.org/tests/bins',name:'Fictional Recycling Bin BX2',model:'BX2',
  method:'We measured usable compartment volume with our test gauge.',measure:'Measured compartment volume (l)',value:'18'}
];
const report={schema:'pee226.synthetic-table-demo.v1',fixtureOnly:true,liveWebRequests:0,
 sourceBodiesStored:false,scientificTestsAuthenticated:0,rankedProducts:0,results:[]};
for(const c of cases){
 const html=`<html><body><p>${c.method}</p><table><caption>Our test measurements</caption><thead><tr>`+
 `<th scope="col">Model</th><th scope="col">${c.measure}</th></tr></thead><tbody><tr>`+
 `<th scope="row">${c.model}</th><td>${c.value}</td></tr></tbody></table></body></html>`;
 const probe=probeTransientTestContent225(html,c.url,{documentSha256:sha(html),
  productLeads:[{name:c.name,model:c.model,sku:c.model}]});
 report.results.push({category:c.category,measurementCandidates:probe.candidates.map(x=>({id:x.id,value:x.value,
  unit:x.unit,modelUnverified:x.subject?.model,dimensionUnverified:x.publisherDeclaredDimension,
  targetScopeUnverified:x.publisherDeclaredTargetScope,methodCue:x.methodCue,
  scientificEvidenceAdmitted:x.scientificEvidenceAdmitted,rankingAuthorized:x.rankingAuthorized})),
  tableResults:probe.tableResults226,blockedReasons:probe.blockingReasons});
}
console.log(JSON.stringify(report,null,2));
