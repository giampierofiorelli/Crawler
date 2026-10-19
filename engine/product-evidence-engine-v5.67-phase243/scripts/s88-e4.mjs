#!/usr/bin/env node
/** S88 E4: unseen categories (robot floor cleaners, soundbars) on fresh pages of the S88 wave (private-eval/s88/wave.json).
 * Items: every quantity with a unit the QK pack knows, found in the page's text blocks (reader-independent), sampled evenly
 * (at most 40 per page). Protocol: evaluation/s88/e4-protocol.json (committed before the annotation).
 *   input                     write the blind annotator's input (page title, value, text window; no system output)
 *   run LABEL ARM             ARM = pd2 (sealed definitions) | pd1 (development definitions only) | unitkind ; once per LABEL
 *   score LABEL               score a run against the sealed reference (evaluation/s88/e4-annotation-freeze.json)
 * Public output: counts only. Private output: rows with text windows (never committed to Crawler). */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';import {execSync} from 'node:child_process';
const sha=b=>createHash('sha256').update(b).digest('hex');const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval/s88');
const D=new URL('../dist/src/',import.meta.url).href;const QK=await import(D+'quantity_knowledge.js');const PD=await import(D+'property_definitions.js');const I=await import(D+'definition_interpreter.js');
const {textBlocks225}=await import(D+'phase225_transient_test_probe.js');const qk=QK.loadQuantityKnowledge();
const [cmd,LABEL,ARM]=process.argv.slice(2);
const wave=JSON.parse(readFileSync(join(ROOT,'wave.json'),'utf8'));
const pages=wave.pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval').map(p=>{const b=readFileSync(join(ROOT,'raw',p.tag+'.html'));if(sha(b)!==p.sha256)throw Error('bytes differ '+p.tag);return {...p,html:b.toString('utf8')};});
function items(){const out=[];
 for(const p of pages){const blocks=textBlocks225(p.html,{maxBlocks:3000}).blocks;const title=(/<title[^>]*>([^<]*)<\/title>/i.exec(p.html)?.[1]??'').replace(/\s+/g,' ').trim().slice(0,140);
  const all=[];blocks.forEach((b,bi)=>{for(const q of QK.findQuantities(qk,b)){if(q.value===null&&q.low===undefined)continue;all.push({bi,start:q.start,end:q.end,surface:q.surface,value:q.value??q.low,unit:q.unitSurface});}});
  const seen=new Set();const uniq=all.filter(a=>{const k=blocks[a.bi].slice(Math.max(0,a.start-60),a.end+30);if(seen.has(k))return false;seen.add(k);return true;});
  const k=Math.ceil(uniq.length/40)||1;
  uniq.filter((_,i)=>i%k===0).forEach((a,j)=>{const b=blocks[a.bi];
   out.push({id:`${p.tag}-${j}`,page:p.tag,host:new URL(p.url).hostname,category:p.category,title,value:a.value,unit:a.unit,surface:a.surface,
    window:b.slice(Math.max(0,a.start-160),a.end+160),label:b.slice(Math.max(0,a.start-80),a.end+30),valueAt:Math.min(80,a.start),context:b.slice(0,600)});});}
 return out;}
if(cmd==='input'){const it=items();const f=join(ROOT,'e4-annotation-input.json');if(existsSync(f))throw Error(f+' exists');
 const defsLabels=PD.loadPropertyDefinitions(qk);
 writeFileSync(f,JSON.stringify({labels:{properties:[...defsLabels.properties.values()].map(p=>({id:p.id,meaning:`${p.label} (${p.form}; about: ${p.object})`})),dimensions:[...defsLabels.dimensions.values()].map(d=>({id:d.id,meaning:d.label}))},
  items:it.map(({id,category,title,value,unit,surface,window})=>({id,category,pageTitle:title,value,unit,surface,text:window}))},null,1));
 writeFileSync(join(ROOT,'e4-items.json'),JSON.stringify(it,null,1));console.log(it.length,'items',sha(readFileSync(f)));}
// the value's offset in its label: the occurrence of its surface nearest the label's centre of construction (80 chars in)
const locate=x=>{const occ=[];let i=-1;while((i=x.label.indexOf(String(x.surface),i+1))>=0)occ.push(i);return occ.length?occ.sort((a,b)=>Math.abs(a-80)-Math.abs(b-80))[0]:null;};
const defsFor=arm=>{if(arm==='pd1'){const raw=execSync('git show 447ae33:engine/product-evidence-engine-v5.67-phase243/resources/property-definitions/property-definitions.v1.json',{cwd:new URL('..',import.meta.url).pathname});return PD.loadPropertyDefinitions(qk,JSON.parse(raw));}return PD.loadPropertyDefinitions(qk);};
if(cmd==='run'){const f=join(ROOT,`e4-run-${LABEL}.json`);if(existsSync(f))throw Error(f+' exists: a run is made once');
 const it=JSON.parse(readFileSync(join(ROOT,'e4-items.json'),'utf8'));const NOLIC=ARM.endsWith('-nolicense');const LIC=ARM.endsWith('-license');const defs=defsFor(ARM==='unitkind'?'pd2':ARM.replace(/-(no)?license$/,''));
 const rows=it.map(x=>{const o={value:x.value,unit:x.unit,label:x.label,context:x.context,category:x.category,valueAt:x.valueAt??locate(x)};
  if(ARM==='unitkind'){const r=I.attributeProperty(defs,qk,o);const c=r.value?[r.value,...r.alternatives]:r.alternatives;return {id:x.id,property:c.length===1?c[0]:null,conditions:[],basis:null};}
  // S89: arm pd2 uses the interpreter default (no licence since S89); S88 runs reproduce with pd1/pd2 + '-license'
  const r=I.interpretWithDefinitions(defs,qk,o,LIC?{profileLicense:true}:NOLIC?{profileLicense:false}:{});return {id:x.id,property:r.property.value,propertyState:r.property.state,conditions:r.conditions.filter(c=>c.dimension&&c.value).map(c=>({dimension:c.dimension,value:c.value})),basis:r.basis.value,missingDefining:r.missingDefining};});
 writeFileSync(f,JSON.stringify({label:LABEL,arm:ARM,definitions:defs.identity,at:new Date().toISOString(),rows},null,1));console.log(LABEL,ARM,defs.identity,rows.filter(r=>r.property).length,'/',rows.length,'attributed');}
if(cmd==='score'){const fr=JSON.parse(readFileSync(new URL('../evaluation/s88/e4-annotation-freeze.json',import.meta.url),'utf8'));const rb=readFileSync(join(ROOT,'e4-annotations.json'));
 if(sha(rb)!==fr.annotationsSha256)throw Error('reference does not match its seal');const ref=JSON.parse(rb).items;
 const run=JSON.parse(readFileSync(join(ROOT,`e4-run-${LABEL}.json`),'utf8'));const it=new Map(JSON.parse(readFileSync(join(ROOT,'e4-items.json'),'utf8')).map(x=>[x.id,x]));
 const S=rows=>{const s={items:0,refPositive:0,correct:0,wrong:0,abstained:0,refNone:0,falseAttribution:0,correctNone:0,
  conditions:{annotated:0,produced:0,matched:0},basis:{annotated:0,correct:0,wrong:0}};
  for(const r of rows){const a=ref[r.id];if(!a)continue;s.items++;const ok=x=>x&&(x===a.property||x===a.alsoAcceptable);
   if(a.property==='none'){s.refNone++;if(r.property&&r.property!==a.alsoAcceptable)s.falseAttribution++;else s.correctNone++;}
   else{s.refPositive++;if(!r.property)s.abstained++;else if(ok(r.property))s.correct++;else s.wrong++;}
   const ac=(a.conditions??[]).map(c=>c.dimension);s.conditions.annotated+=ac.length;s.conditions.produced+=r.conditions.length;
   const pool=[...ac];for(const c of r.conditions){const i=pool.indexOf(c.dimension);if(i>=0){pool.splice(i,1);s.conditions.matched++;}}
   if(a.basis&&a.basis!=='unclear'&&a.property!=='none'){s.basis.annotated++;const b=r.basis??null;if(b===a.basis)s.basis.correct++;else if(b&&b!=='none'||a.basis==='none'&&b)s.basis.wrong++;}}
  return s;};
 const rows=run.rows;const by=f=>Object.fromEntries([...new Set(rows.map(r=>f(it.get(r.id))))].sort().map(k=>[k,S(rows.filter(r=>f(it.get(r.id))===k))]));
 const out={schema:'pee.s88.e4-score.v1',label:LABEL,arm:run.arm,definitions:run.definitions,reference:fr.annotationsSha256,overall:S(rows),byCategory:by(x=>x.category),byGroup:by(x=>x.category+' @ '+x.host)};
 const pub=new URL(`../evaluation/s88/e4-${LABEL}.json`,import.meta.url);if(existsSync(pub))throw Error('exists');writeFileSync(pub,JSON.stringify(out,null,1)+'\n');
 console.log(LABEL,JSON.stringify(out.overall));for(const [g,v] of Object.entries(out.byGroup))console.log(' ',g.padEnd(40),JSON.stringify({c:v.correct,w:v.wrong,a:v.abstained,fa:v.falseAttribution,pos:v.refPositive,none:v.refNone,cond:v.conditions}));}
