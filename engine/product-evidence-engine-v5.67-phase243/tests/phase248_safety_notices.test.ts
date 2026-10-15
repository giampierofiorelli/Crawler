import test from 'node:test';import assert from 'node:assert/strict';
import {parseSafetyNotice248,matchNotice248,categorySafetyProfile248,identifierKey248} from '../src/phase248_safety_notices.js';
import {CATEGORY_REGISTRY248} from '../src/phase248_category_registry.js';

// Synthetic notice in the GOV.UK content API shape (not a copy of a real notice).
const doc=(o:{title?:string;product?:string;hazard?:string;rows?:[string,string][];type?:string;risk?:string;extra?:string})=>({
 base_path:'/product-safety-alerts-reports-recalls/example',title:o.title??'Product Recall: Example Kettle (2601-0001)',
 first_published_at:'2026-01-02T10:00:00Z',public_updated_at:'2026-01-03T10:00:00Z',
 details:{metadata:{product_alert_type:o.type??'product-recall',product_risk_level:o.risk??'serious',product_measure_type:['recall-of-product-from-end-users'],product_recall_alert_date:'2026-01-02'},
  body:`<h2>Summary</h2><p>Product: ${o.product??'Example Kettle'}</p><p>Hazard: ${o.hazard??'The product presents a serious risk of electric shock.'}</p>
   <p>Corrective action: The product has been recalled from end users.</p><h2>Product information</h2><table><tbody>
   ${(o.rows??[['Type','Electrical appliances and equipment - Kettle'],['Brand','Examplo'],['Models','EK-2200X and EK-2300X (Argos SKU: 1234567)']]).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
   </tbody></table><h2>Hazard</h2><p>The heating element may fail and parts could explode. The product does not meet the requirements of the Electrical Equipment (Safety) Regulations 2016.</p>
   <h2>Additional information</h2><p>PSD notification number: 2601-0001</p><p>Notified by: Local Authority Trading Standards</p>${o.extra??''}`}});
const url='https://www.gov.uk/product-safety-alerts-reports-recalls/example';

test('safety notice: structured fields, identifiers, hazard from the summary line, licence and evidence semantics',()=>{
 const n=parseSafetyNotice248(doc({}),url,'2026-10-14T00:00:00Z',CATEGORY_REGISTRY248);
 assert.equal(n.noticeType,'recall');assert.equal(n.riskLevel,'serious');assert.equal(n.product.brand,'Examplo');
 assert.deepEqual(n.product.categoryIds,['kettles']);
 assert.deepEqual(n.product.identifiers.map(i=>i.code).sort(),['1234567','EK-2200X','EK-2300X']);
 assert.deepEqual(n.hazard.classes,['electric_shock']); // "explode" in the detail section does not add a class
 assert.deepEqual(n.regulationsNotMet,['Electrical Equipment (Safety) Regulations 2016']);
 assert.deepEqual(n.psdNumbers,['2601-0001']);assert.equal(n.notifiedBy,'Local Authority Trading Standards');
 assert.equal(n.source.licence,'OGL-3.0');assert.match(n.source.attribution,/Open Government Licence v3\.0/);
 assert.equal(n.evidence.performanceEvidence,false);assert.equal(n.evidence.rankingAuthorized,false);
});
test('safety notice: sizes and years are not model codes; a code in the product line is kept',()=>{
 const n=parseSafetyNotice248(doc({product:'8L Air Fryer (Model: S-18)',rows:[['Type','Electrical appliances and equipment – Air Fryer'],['Models','2.2Ltr 1500W model from 2024']]}),url,'x',CATEGORY_REGISTRY248);
 assert.deepEqual(n.product.identifiers.map(i=>i.code),['S-18']);assert.deepEqual(n.product.categoryIds,['air_fryers']);
 const o=parseSafetyNotice248(doc({product:'Example mini appliance',rows:[['Type','Electrical appliances and equipment - Toaster Oven']]}),url,'x',CATEGORY_REGISTRY248);
 assert.deepEqual(o.product.categoryIds,['toaster_ovens']);
});
test('safety notice: matching is exact on identifiers only; numeric codes also need the brand; similar names never match',()=>{
 const n=parseSafetyNotice248(doc({}),url,'x',CATEGORY_REGISTRY248);
 assert.deepEqual(matchNotice248(n,{name:'Examplo kettle',brand:'Examplo',identifiers:['ek 2200x']}),{status:'exact_identifier',identifier:'EK-2200X'});
 assert.equal(matchNotice248(n,{name:'Other',brand:'Other',identifiers:['1234567']}).status,'none');
 assert.equal(matchNotice248(n,{name:'Examplo',brand:'Examplo',identifiers:['1234567']}).status,'exact_identifier');
 assert.equal(matchNotice248(n,{name:'Examplo EK-2200 Kettle',brand:'Examplo',identifiers:['EK-2200']},'kettles').status,'brand_and_category_only');
 assert.equal(matchNotice248(n,{name:'Example Kettle EK-2200X',identifiers:[]}).status,'none');
 assert.equal(identifierKey248('t17-129 l'),'T17129L');
});
test('safety profile: counts notices by hazard and type without implying failure rates or rankings',()=>{
 const a=parseSafetyNotice248(doc({}),url,'x',CATEGORY_REGISTRY248);
 const b=parseSafetyNotice248(doc({hazard:'The product presents a high risk of fire.',risk:'high',type:'product-safety-report',title:'Product Safety Report: Counterfeit Kettle'}),url+'2','x',CATEGORY_REGISTRY248);
 const p=categorySafetyProfile248([a,b],'kettles');
 assert.equal(p.notices,2);assert.deepEqual(p.byHazard,{electric_shock:1,fire:1});assert.deepEqual(p.byType,{recall:1,safety_report:1});
 assert.equal(p.counterfeit,1);assert.equal(p.seriousOrHigh,2);assert.equal(p.rankingAuthorized,false);
 assert.equal(categorySafetyProfile248([a],'toasters').notices,0);
});
test('active OPSS policy: passes the source-policy gate only with a fresh robots check and before expiry; never claims a human legal review',async()=>{
 const {readFileSync}=await import('node:fs');const {approvedMetadataDiscovery75}=await import('../src/phase75_source_discovery.js');
 const a=JSON.parse(readFileSync(new URL('../../evaluation/phase249/opss-policy-active.json',import.meta.url),'utf8'));
 const at='2026-10-15T12:00:00Z';
 assert.equal(approvedMetadataDiscovery75({...a.policy,robotsCheckedAt:'2026-10-15T11:00:00Z'},at),true);
 assert.equal(approvedMetadataDiscovery75({...a.policy,robotsCheckedAt:null},at),false);
 assert.equal(approvedMetadataDiscovery75({...a.policy,robotsCheckedAt:'2026-10-13T11:00:00Z'},at),false);
 assert.equal(approvedMetadataDiscovery75({...a.policy,robotsCheckedAt:'2027-04-16T11:00:00Z'},'2027-04-16T12:00:00Z'),false);
 assert.match(a.status,/No human legal review/);
});
