/** Offline developer evaluation. Documents supplied by operator are never packaged.
 * Usage: node scripts/phase241-evaluate-unified.mjs [--pdf /path/a.pdf] [--docx /path/a.docx] [--html /path/page.html]
 * By default a synthetic fixture demonstrates that HTML and document receipts can
 * use one unranked fact schema. No network or external API used.
 */
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
import {documentClaimsToIR241,htmlToIR241} from '../dist/src/phase241_unified_product_facts.js';
const inputs=[];
for(let i=2;i<process.argv.length;i++){
 const type=process.argv[i];if(!['--pdf','--docx','--html'].includes(type)||i+1>=process.argv.length)throw Error('Expected --pdf|--docx|--html PATH');
 inputs.push({type:type.slice(2),path:process.argv[++i]});
}
if(!inputs.length){
 const html='<dl><dt>Distinctive working clearance</dt><dd>40–90 mm</dd><dt>Mass</dt><dd>12.3 kg</dd></dl>';
 const ir=htmlToIR241(html,'synthetic:html-property-list');
 console.log(JSON.stringify({schema:'pee241.offline-review.v1',synthetic:true,sourceCount:1,observations:[{
  source:'synthetic:html-property-list',format:'html',structuredFacts:ir.facts.length,unresolved:ir.unresolvedCount,
  fields:ir.facts.map(f=>({property:f.property,role:f.role,value:f.value,locator:f.provenance.locator})),
  rankingAuthorized:false}],claimsIndependentTesting:0},null,2));
}else{
 let reports=[];
 for(const input of inputs){const bytes=readFileSync(input.path);
  const sha=createHash('sha256').update(bytes).digest('hex');
  const ir=input.type==='html'?htmlToIR241(bytes.toString('utf8'),sha):
   documentClaimsToIR241(await parseDocumentBytes228(bytes,input.type),sha);
  reports.push({fileSha256:sha,format:input.type,documentClaims:ir.facts.length,
   unresolvedVisualAndOther:ir.unresolvedCount,sourceReaderLimitationsRemain:true,
   roles:Object.fromEntries([...new Set(ir.facts.map(x=>x.role))].map(k=>[k,ir.facts.filter(x=>x.role===k).length])),
   rankingAuthorized:false,sourceOriginalPackaged:false});
 }
 console.log(JSON.stringify({schema:'pee241.offline-review.v1',synthetic:false,sourceCount:reports.length,
  observations:reports,claimsIndependentTesting:0},null,2));
}
