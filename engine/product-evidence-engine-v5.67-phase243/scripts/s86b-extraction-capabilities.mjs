#!/usr/bin/env node
/** S86b: run the sealed extraction probes (evaluation/s86b/extraction-probes.json) on one build, or classify two runs into the
 * four capability sets. Fixture pages are fictional; outputs hold no retained values.
 *   node scripts/s86b-extraction-capabilities.mjs --build DIR --out FILE
 *   node scripts/s86b-extraction-capabilities.mjs --sets OLD NEW --out FILE */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {createHash} from 'node:crypto';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
const OUT=arg('out');if(OUT&&existsSync(OUT))throw Error(OUT+' exists: never overwritten');
const PROBES=JSON.parse(readFileSync('evaluation/s86b/extraction-probes.json','utf8')).probes;
if(process.argv.includes('--sets')){
 const i=process.argv.indexOf('--sets');const A=JSON.parse(readFileSync(process.argv[i+1],'utf8')),B=JSON.parse(readFileSync(process.argv[i+2],'utf8'));
 const sets={only_old:[],only_new:[],both:[],neither:[]};const byGroup={};
 for(const p of PROBES){const a=A.results[p.id].ok,b=B.results[p.id].ok;const k=a&&b?'both':a?'only_old':b?'only_new':'neither';
  sets[k].push({id:p.id,group:p.group,probe:p.probe,old:A.results[p.id].verdict,new:B.results[p.id].verdict});(byGroup[p.group]??={both:0,only_old:0,only_new:0,neither:0})[k]++;}
 const typed=(R)=>Object.values(R.results).filter(r=>r.kindOk===true).length;
 const out={schema:'pee.s86b.extraction-capability-sets.v1',old:A.build,new:B.build,counts:Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,v.length])),
  typedCorrectly:{old:typed(A),new:typed(B)},byGroup,sets};
 if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify({counts:out.counts,typedCorrectly:out.typedCorrectly,byGroup},null,1));process.exit(0);}
const BUILD=arg('build');const D=join(BUILD,'dist/src/');
const {probeTransientTestContent225}=await import(D+'phase225_transient_test_probe.js');const {screenTestLead265}=await import(D+'phase265_test_measurements.js');
const sha=s=>createHash('sha256').update(s).digest('hex');const url='https://review-lab.example.org/tests/review';
const products=[{name:'Sample Unit U1',model:'U1',sku:'SKU-U1'}];
const make=body=>`<html><head><title>Fixture</title></head><body><p>We tested this unit ourselves in our lab using calibrated instruments.</p>${body}</body></html>`;
const run=html=>{const x=probeTransientTestContent225(html,url,{productLeads:products,documentSha256:sha(html)});return x.candidates.map(c=>({c,r:screenTestLead265(c,{url,sha256:sha(html)})}));};
const FAMILY={sound_level:['sound_pressure_level','sound_power_level'],volume_flow:['volumetric_flow_rate'],volume_rate:['periodic_volume'],energy_rate:['periodic_energy_consumption'],
 charge:['electric_charge'],ratio:['ratio','amount_fraction'],mass_rate:['mass_flow_rate']};
const kindOk=(lead,k)=>{const ks=lead?.quantity?.kinds;if(!ks)return null;return (FAMILY[k]??[k]).some(x=>ks.includes(x));};
// one real candidate from this build's own probe, used as the template for screen probes
const base=run(make('<h2>How we tested</h2><p>We measured 58 dB(A) at one metre on the top setting.</p>'))[0]?.c;if(!base)throw Error('no template candidate');
const results={};
for(const p of PROBES){const e=p.expect;let out;
 if(p.group.startsWith('screen')){const r=screenTestLead265({...base,unit:p.probe.unit,value:p.probe.value,publisherDeclaredDimension:p.probe.declared??null},{url,sha256:base.documentSha256});
  out={accepted:r.ok,reason:r.ok?null:r.reason,unit:r.ok?r.lead.unit:null,kinds:r.ok?r.lead.quantity?.kinds??null:null,kindOk:r.ok&&e.kind?kindOk(r.lead,e.kind):null};
  out.ok=out.accepted===e.accept;}
 else{const html=p.group.startsWith('table')?make(`<table><caption>Our test measurements</caption><thead><tr><th scope="col">Model</th><th scope="col">${p.probe.header}</th></tr></thead><tbody><tr><th scope="row">Sample Unit U1</th><td>${p.probe.cell}</td></tr></tbody></table>`)
   :make(`<h2>How we tested</h2><p>${p.probe.text}</p>`);
  const xs=run(html);const acc=xs.filter(x=>x.r.ok);const hit=acc.find(x=>Math.abs(x.r.lead.value-(e.value??NaN))<1e-9);
  out={candidates:xs.map(x=>`${x.c.value} ${x.c.unit}`),accepted:acc.map(x=>`${x.r.lead.value} ${x.r.lead.unit}`),rejected:xs.filter(x=>!x.r.ok).map(x=>x.r.reason),
   kinds:hit?.r.lead.quantity?.kinds??null,kindOk:hit&&e.kind?kindOk(hit.r.lead,e.kind):null};
  out.ok=e.lead?!!hit:acc.length===0;}
 out.verdict=out.ok?'correct':(e.accept===false||e.lead===false)?'false_accept':out.candidates&&!out.candidates.length?'no_candidate':out.reason??(out.rejected?.join(',')||'missed');
 results[p.id]=out;}
const out={schema:'pee.s86b.extraction-capabilities.v1',build:BUILD,probes:PROBES.length,correct:Object.values(results).filter(r=>r.ok).length,
 typedCorrectly:Object.values(results).filter(r=>r.kindOk===true).length,results};
if(OUT)writeFileSync(OUT,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify({build:BUILD,correct:out.correct,typed:out.typedCorrectly,of:PROBES.length}));
