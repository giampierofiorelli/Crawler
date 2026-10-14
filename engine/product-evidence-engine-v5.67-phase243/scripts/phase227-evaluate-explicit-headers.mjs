/** Offline synthetic diagnostics. Does not fetch or establish scientific evidence. */
import {createHash} from 'node:crypto';
import {probeTransientTestContent225} from '../dist/src/phase225_transient_test_probe.js';
const datasets=[
 {category:'football_footwear',url:'https://fixture-lab.example.org/football-test',
  products:[{name:'Invented Boot F22',model:'F22',sku:'F22'},{name:'Invented Boot G33',model:'G33',sku:'G33'}],
  heads:'<th id="h-model">Model</th><th id="h-weight">Measured mass (g)</th>',
  rows:'<tr><th id="r-f22">F22</th><td headers="r-f22 h-weight">188</td></tr><tr><th id="r-g33">G33</th><td headers="h-weight r-g33">204</td></tr>'},
 {category:'recycling_bins',url:'https://fixture-lab.example.org/bin-test',
  products:[{name:'Invented Recycling Bin RB40',model:'RB40',sku:'RB40'}],
  heads:'<th id="h-model">Model</th><th id="h-volume">Measured compartment volume (l)</th><th id="h-advertising">Manufacturer total volume (l)</th>',
  rows:'<tr><th id="r-rb40">RB40</th><td headers="r-rb40 h-volume">12</td><td headers="r-rb40 h-advertising">40</td></tr>'}];
const cases=[];
for(const item of datasets){
 const html=`<html><body><p>We measured the test products using a calibrated measurement instrument.</p><table><caption>Our test measurements</caption><thead><tr>${item.heads}</tr></thead><tbody>${item.rows}</tbody></table></body></html>`;
 const result=probeTransientTestContent225(html,item.url,{documentSha256:createHash('sha256').update(html).digest('hex'),productLeads:item.products});
 cases.push({category:item.category,fixtureSynthetic:true,sourceUrl:item.url,documentSha256:createHash('sha256').update(html).digest('hex'),
  candidateCount:result.candidates.length,tableResults226:result.tableResults226,measurementCandidates:result.candidates.map(c=>({
   id:c.id,subjectModel:c.subject?.model,unit:c.unit,value:c.value,dimension:c.publisherDeclaredDimension,
   targetScope:c.publisherDeclaredTargetScope,methodReviewed:c.methodReviewed,exactVariantVerified:c.exactVariantVerified,
   rankingAuthorized:c.rankingAuthorized})),blocks:result.blockingReasons,sourcePassagesRetained:result.sourcePassagesRetained});
}
const output={schema:'pee227.explicit-header-demo.v1',mode:'synthetic_fixture',realNetworkRequests:0,
 independentScientificTestsAuthenticated:0,productRankingAuthorized:false,cases};
process.stdout.write(JSON.stringify(output,null,2)+'\n');
