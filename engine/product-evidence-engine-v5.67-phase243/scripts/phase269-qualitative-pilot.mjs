#!/usr/bin/env node
/** Phase269 qualitative-observation pilot: runs qualitativeObservations269 on the transient page bytes of the private
 * evaluation directory (Phase268 raw dir) and scores against the private gold (phase269/qualitative-gold.json). Writes
 * only to the private evaluation directory and never overwrites a run. Usage: node scripts/phase269-qualitative-pilot.mjs LABEL */
const root=new URL('..',import.meta.url).pathname;const fs=await import('node:fs');
const {qualitativeObservations269}=await import(root+'dist/src/phase269_qualitative_observations.js');
const P=process.env.HOME+'/.local/share/product-evidence-engine/private-eval/';const G=JSON.parse(fs.readFileSync(P+'phase269/qualitative-gold.json','utf8'));
const res=[];let tp=0,fp=0,fn=0,dirOk=0;
for(const d of G.documents){const html=fs.readFileSync(P+'phase268/raw/'+d.tag+'.html','utf8');const {observations}=qualitativeObservations269(html);
 const got=observations.map(o=>({dish:o.dish,outcome:o.outcome,direction:o.direction,strength:o.strength,adj:o.settingAdjusted,cmp:o.comparative}));
 const used=new Set();let t=0;
 for(const g of d.obs){const i=got.findIndex((o,k)=>!used.has(k)&&o.dish===g.dish&&o.outcome===g.outcome&&o.direction===g.direction);if(i>=0){used.add(i);t++;}}
 tp+=t;fn+=d.obs.length-t;fp+=got.length-used.size;
 res.push({tag:d.tag,untouched:!!d.untouched,gold:d.obs.length,extracted:got.length,matched:t,extra:got.filter((o,k)=>!used.has(k))});}
console.log(JSON.stringify({tp,fp,fn,precision:tp/(tp+fp),recall:tp/(tp+fn),res},null,1));
const OUT=P+'phase269/qualitative-'+(process.argv[2]??'run')+'.json';if(fs.existsSync(OUT))throw Error('exists: '+OUT);fs.writeFileSync(OUT,JSON.stringify({tp,fp,fn,res},null,1));
