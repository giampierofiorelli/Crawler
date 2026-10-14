/** Phase235 offline original-document replay.
 * Usage: node scripts/phase235-evaluate-new-pdfs.mjs \
 *   lavazza.pdf tefal-multicook.pdf miele-wwi860.pdf tefal-steam.pdf miele-catalog.pdf
 * Supply local original paths. No file bytes, passages or page images emitted.
 */
import {readFileSync} from 'node:fs';
import {parseDocumentBytes228} from '../dist/src/phase228_document_observer.js';
const ids=['lavazza','tefal_multicook','miele_wwi860','tefal_steam','miele_catalog'];
if(process.argv.length!==7){console.error('Expected exactly 5 local source-PDF paths');process.exit(2);}
const checks={
 catalog_pwm507_mass:(c)=>c.catalogModel==='PWM 507'&&c.label==='net weight'&&c.value===98&&c.unit==='kg'&&c.locator.page===10,
 catalog_pwm507h_mass:(c)=>c.catalogModel==='PWM 507 Hygiene'&&c.label==='net weight'&&c.value===101&&c.unit==='kg'&&c.locator.page===10,
 catalog_pdr507hp_mass:(c)=>c.catalogModel==='PDR 507 HP'&&c.label==='net weight'&&c.value===68.5&&c.unit==='kg'&&c.locator.page===16,
 catalog_pdr507_mass:(c)=>c.catalogModel==='PDR 507'&&c.label==='net weight'&&c.value===49&&c.unit==='kg'&&c.locator.page===16,
 miele_energy_100:(c)=>c.label==='weighted energy consumption'&&c.value===49&&c.unit==='kwh'&&c.measurementBasis==='per 100 operating cycles; wash cycle'&&c.locator.page===2,
 miele_water_per_cycle:(c)=>c.label==='weighted water consumption'&&c.value===48&&c.unit==='l'&&c.measurementBasis==='per cycle'&&c.locator.page===2,
 miele_nominal_load:(c)=>c.label==='nominal load'&&c.value===9&&c.unit==='kg'&&c.locator.page===1,
 miele_dimensions:(c)=>c.label==='dimensions (h x w x d)'&&JSON.stringify(c.vector?.values)==='[850,596,643]'&&c.locator.page===3,
 miele_weight:(c)=>c.label==='weight'&&c.value===94&&c.unit==='kg'&&c.locator.page===3,
 miele_rated_load:(c)=>c.label==='total rated load'&&c.range?.lower===2.1&&c.range.upper===2.4&&c.unit==='kw'&&c.locator.page===3,
 tefal_rice_model_dependent:(c)=>c.label==='rice bowl'&&c.optionStatus==='conditional_unresolved'&&c.condition==='on certain models only'&&c.locator.page===5
};
const data={schema:'pee235.new-original-pdf-replay.1',version:'5.59.0',
 evaluation:'in-development-sample: documents became development cases after initial v5.58 baseline',
 publisherOriginalBytesRetained:false,originalTextStored:false,results:[],manualAnchorChecks:{}};
for(let i=0;i<ids.length;i++){
 const p=await parseDocumentBytes228(readFileSync(process.argv[i+2]),'pdf');
 data.results.push({id:ids[i],documentSha256:p.documentSha256,claims:p.claimCount,
  byMethod:Object.fromEntries([...new Set(p.claims.map(c=>c.extractionMethod))].map(k=>[k,p.claims.filter(c=>c.extractionMethod===k).length])),
  reasonCodes:p.reasonCodes, rankingAuthorized:p.rankingAuthorized});
 if(ids[i]==='miele_catalog'||ids[i]==='miele_wwi860'||ids[i]==='tefal_steam'){
  for(const [key,test] of Object.entries(checks)){
   if((ids[i]==='miele_catalog')!==key.startsWith('catalog_')&&ids[i]==='miele_catalog')continue;
   if(ids[i]==='miele_wwi860'&&!key.startsWith('miele_'))continue;
   if(ids[i]==='tefal_steam'&&!key.startsWith('tefal_'))continue;
   if(ids[i]!=='miele_catalog'&&key.startsWith('catalog_'))continue;
   data.manualAnchorChecks[key]=p.claims.some(test);
  }
 }
 if(ids[i]==='tefal_multicook')data.manualAnchorChecks.false_option_fragment_rejected=!p.claims.some(c=>c.label==='of pasta in the bowl');
}
console.log(JSON.stringify(data,null,2));
