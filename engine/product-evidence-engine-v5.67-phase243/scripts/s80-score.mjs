#!/usr/bin/env node
/** S80 deterministic scoring of stages S3-S5 (reading, attribution, classification) of an end-to-end run against the
 * sealed reference (protocol evaluation/s80/protocol.json). Evaluation only; no PEE code runs here.
 *  - A reference value is FOUND when PEE stored a reading on that page (declaration or test measurement) with the same
 *    number (0.5 % tolerance; a declaration's printed value may hold several numbers).
 *  - ATTRIBUTION of a found value: PEE's product equals the reference product when one name contains the other or they
 *    share a distinctive token (model code or brand+model word); a found value on another product is WRONG.
 *  - CLASSIFICATION: reference 'independent_test_measurement' stored by PEE as a declaration = under-claim; a reference
 *    declaration, estimate or non-result stored as a test measurement = over-claim; a VALIDATED measurement whose reference
 *    kind is not a test measurement = harmful.
 * Public output: counts only. Usage: node scripts/s80-score.mjs --run FILE --reference FILE --out PUBLIC_FILE */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const run=JSON.parse(readFileSync(arg('run'),'utf8')),ref=JSON.parse(readFileSync(arg('reference'),'utf8'));const OUT=arg('out');
if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const nums=s=>[...String(s??'').replace(/(\d),(\d{3})/g,'$1$2').matchAll(/-?\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
const close=(a,b)=>Math.abs(a-b)<=Math.max(1e-9,0.005*Math.abs(b));
const toks=s=>new Set(String(s??'').toLowerCase().replace(/[()®™]/g,' ').split(/[^a-z0-9]+/).filter(t=>t.length>=2&&!['air','fryer','dishwasher','purifier','series','the','and','with','review','smart'].includes(t)));
const sameProduct=(a,b)=>{const x=String(a??'').toLowerCase(),y=String(b??'').toLowerCase();if(!x||!y)return false;if(x.includes(y)||y.includes(x))return true;
 const A=toks(a),B=toks(b);const common=[...A].filter(t=>B.has(t));return common.some(t=>/\d/.test(t))||common.length>=2;};
const out={schema:'pee.s80.score-s3-s5.v1',run:{set:run.set,label:run.label,build:run.build.commit},pages:{},totals:{}};const T=out.totals;
const add=(k,n=1)=>T[k]=(T[k]??0)+n;
for(const [rid,r] of Object.entries(run.requests))for(const p of r.pages){
 const rp=ref.pages.find(x=>x.tag===p.tag);if(!rp)continue;
 const readings=[...p.declarations.map(d=>({kind:'declaration',nums:nums(d.raw_value),product:d.pname,validated:false})),
  ...p.testMeasurements.map(t=>({kind:'test',nums:[Number(t.value)],product:t.pname,validated:!!t.validated}))];
 const P={referenceValues:rp.values.length,byKind:{},found:{},wrongProduct:0,underClaim:0,overClaim:0,harmfulValidated:0,peeReadings:readings.length,peeReadingsMatched:0};
 const matched=new Set();
 for(const v of rp.values){
  const k=v.kind;P.byKind[k]=(P.byKind[k]??0)+1;add('ref:'+k);
  if(typeof v.number!=='number')continue;
  const hits=readings.filter(x=>x.nums.some(n=>close(n,v.number)));if(!hits.length)continue;
  P.found[k]=(P.found[k]??0)+1;add('found:'+k);hits.forEach(h=>matched.add(h));
  const h=hits.find(x=>sameProduct(x.product,v.product))??hits[0];
  if(!sameProduct(h.product,v.product)){P.wrongProduct++;add('wrongProduct');}
  if(k==='independent_test_measurement'&&h.kind==='declaration'){P.underClaim++;add('underClaim');}
  if(k!=='independent_test_measurement'&&h.kind==='test'){P.overClaim++;add('overClaim');}
  if(k!=='independent_test_measurement'&&h.validated){P.harmfulValidated++;add('harmfulValidated');}
 }
 P.peeReadingsMatched=matched.size;add('peeReadings',readings.length);add('peeReadingsMatched',matched.size);
 out.pages[p.tag]={request:rid,...P};
}
const rate=(f,k)=>T['ref:'+k]?`${T['found:'+k]??0}/${T['ref:'+k]}`:'0/0';
out.summary={S3_test_measurements_found:rate('f','independent_test_measurement'),S3_declarations_found:rate('f','manufacturer_declaration'),
 S4_wrong_product_among_found:T.wrongProduct??0,S5_under_claims:T.underClaim??0,S5_over_claims:T.overClaim??0,S5_harmful_validated:T.harmfulValidated??0,
 pee_readings_matching_a_reference_value:`${T.peeReadingsMatched??0}/${T.peeReadings??0}`};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');
console.log(JSON.stringify({summary:out.summary,pages:out.pages},null,1));
