#!/usr/bin/env node
/** FA-I1 stratified sample (owner authorisation 2026-10-21: "60 righe dei pacchetti, 20 concetti dello store, 10 aspetti
 * QK e 10 proprietà PD", with representation of conditions, negations, quantitative measures, qualitative observations,
 * no-purchase strategies, cross relations, contraindications, provenance and unvalidated knowledge).
 * Read-only: owner packages (extracted copy), a COPY of the store opened read-only, QK and PD files.
 * Writes the private sample (package text) to $PEE_PRIVATE_EVAL_DIR/fa-i1/sample.json and the public manifest (ids,
 * strata, features, text hashes; no text) to evaluation/fa-i1/sample-manifest.json. Rows used by the G1c audit, the G1d
 * trace and the G1d reference R are excluded (they informed the design). Seeded, reproducible.
 * Usage: node scripts/fa-i1-sample.mjs --packages DIR --store COPY */
import {readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {TAUGHT_DOCS_LOADER} from './g1c-lib.mjs';
const arg=k=>{const i=process.argv.indexOf('--'+k);return i>0?process.argv[i+1]:null;};
if(!arg('packages')||!arg('store'))throw Error('usage: --packages DIR --store COPY');
if(/\/\.local\/share\/product-evidence-engine\/knowledge\//.test(resolve(arg('store'))))throw Error('refusing the live store');
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'fa-i1');mkdirSync(PE,{recursive:true});
const OUT=join(PE,'sample.json'),MAN=new URL('../evaluation/fa-i1/sample-manifest.json',import.meta.url).pathname;
if(existsSync(OUT)||existsSync(MAN))throw Error('sample exists: it is built once');
const sha=t=>createHash('sha256').update(t).digest('hex');
// seeded PRNG (mulberry32)
let seed=20261021;const rnd=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};
const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[x[i],x[j]]=[x[j],x[i]];}return x;};
const N1=await import('../dist/src/relation_claims_n1.js');const {CATEGORY_REGISTRY250}=await import('../dist/src/phase248_category_registry.js');
// ---- exclusions: rows that informed the design (G1c audit = G1d trace, G1d reference R)
const PEV=join(homedir(),'.local/share/product-evidence-engine/private-eval');const J=p=>JSON.parse(readFileSync(join(PEV,p),'utf8'));
const g1cJ=J('g1c/rows.json');const g1cRows=new Map((Array.isArray(g1cJ)?g1cJ:g1cJ.rows).map(r=>[r.id,r]));
const usedIds=new Set([...J('g1d/trace/key.json').items.map(k=>k.rowId),...J('g1d/ref/key.json').items.map(k=>k.rowId??k.row)].filter(Boolean));
const usedLines=new Set([...usedIds].map(id=>g1cRows.get(id)?.provenance).filter(Boolean).map(p=>p.document+'#'+p.line));
// ---- package table rows (every teaching table, not only the G1b situation tables)
const docs=TAUGHT_DOCS_LOADER(arg('packages')).filter(d=>d.path.endsWith('.md'));
const names=new Map(CATEGORY_REGISTRY250.map(e=>[e.id,[e.id.replace(/_/g,' ').replace(/s$/,''),...((e.aliases??[]))]]));
const FEAT={
 condition:/\b(if|when|unless|only if|provided|depends on|at least|below|above|under|over|between|requires?)\b|[≥≤<>]/i,
 negation:/\b(not|no|never|cannot|can't|without|none|neither|nor|isn't|doesn't|don't|won't)\b/i,
 quantitative:/\d+(?:[.,]\d+)?\s*(%|°\s?c|°|w\b|kw|kwh|l\b|litres?|liters?|db|dba|mm|cm|m\b|m2|m²|m3|m³|kg|g\b|min|minutes?|h\b|hours?|pa|kpa|bar|ppm|µg|ug|rpm|hz|lux|nits?|ms)\b/i,
 qualitative:/\b(crisp|soggy|taste|texture|perceived|subjective|appearance|comfort|annoy|pleasant|harsh|clarity|smell|odou?r|feel|tone|tonal)\w*/i,
 no_purchase:/\b(ventilat|open (a |the )?window|clean|descal|maintain|maintenance|repair|adjust|setting|reposition|move the|relocat|seal|insulat|behaviou?r|habit|instead of buying|no purchase|without buying|existing)\w*/i,
 contraindication:/\b(not suitable|unsuitable|avoid|unsafe|hazard|danger|risk|do not|don't use|contraindicat|incompatible|reject|not a substitute|hard[- ]stop|warning|never use)\w*/i,
 provenance:/\b(PROPOSED|TESTED|SOURCE|R\d{2}|EN \d|IEC|ISO|AHAM|DOE|EU \d|regulation|standard|study|source)\b|\[[^\]]+\]/,
 unvalidated:/\b(PROPOSED|NOT[_ ]TESTED|synthetic|hypothes|unverified|assumption|speculative|proposed)\w*/i};
const crossCat=(cat,text)=>[...names].some(([id,al])=>id!==cat&&al.some(a=>a.length>3&&new RegExp('\\b'+a.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'s?\\b','i').test(text)));
const pool=new Map();let partial=0,excluded=0;
for(const d of docs){for(const t of N1.teachingTablesN1(d.text))for(const r of t.rows){
 const cells=r.cells.map((x,i)=>({header:t.header[i]??'',text:x.trim()}));if(cells.filter(c=>c.text).length<2){partial++;continue;}
 if(usedLines.has(d.path+'#'+r.line)){excluded++;continue;}
 const text=[...t.headings,...t.header,...cells.map(c=>c.text)].join(' | ');const f=Object.entries(FEAT).filter(([,re])=>re.test(text)).map(([k])=>k);if(crossCat(d.category,cells.map(c=>c.text).join(' ')))f.push('cross_category');
 (pool.get(d.category)??pool.set(d.category,[]).get(d.category)).push({kind:'package_row',category:d.category,document:d.path,line:r.line,headings:t.headings.slice(-3),header:t.header,cells,features:f});}}
// greedy stratified selection: 10 rows per category, maximising features not yet covered (target >= 8 rows per feature)
const ALLF=[...Object.keys(FEAT),'cross_category'];const cover=Object.fromEntries(ALLF.map(k=>[k,0]));const rows=[];
for(const cat of ['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions']){let cand=shuffle(pool.get(cat)??[]);
 for(let k=0;k<10&&cand.length;k++){const score=r=>r.features.reduce((s,f)=>s+(cover[f]<8?1:0),0)+rnd()*0.5;cand.sort((a,b)=>score(b)-score(a));const pick=cand.shift();rows.push(pick);for(const f of pick.features)cover[f]++;}}
// ---- store concepts (copy, read-only), stratified by concept kind and category, with their relations and assessments
mkdirSync(join(homedir(),'.cache-fa'),{recursive:true});const copy=join(homedir(),'.cache-fa','base.sqlite');copyFileSync(arg('store'),copy);
const db=new DatabaseSync(copy,{readOnly:true});
const items=db.prepare(`SELECT item_id,category_id,section,statement,knowledge_class,provenance,state,concept_kind,concept_id,aliases_json FROM category_items WHERE superseded_by IS NULL AND concept_id IS NOT NULL`).all();
const rels=db.prepare(`SELECT relation_id,category_id,from_ref,to_ref,kind,support,qualification FROM category_relations`).all();
const ass=db.prepare(`SELECT * FROM relation_assessments`).all();
const byKind=new Map();for(const it of shuffle(items))(byKind.get(it.concept_kind??'none')??byKind.set(it.concept_kind??'none',[]).get(it.concept_kind??'none')).push(it);
const concepts=[];const kinds=[...byKind.keys()].sort();
while(concepts.length<20){let added=false;for(const k of kinds){const l=byKind.get(k);if(l.length&&concepts.length<20){
 // prefer an item with relations and an unseen category
 l.sort((a,b)=>{const ra=rels.filter(r=>r.from_ref==='item:'+a.item_id||r.to_ref==='item:'+a.item_id).length,rb=rels.filter(r=>r.from_ref==='item:'+b.item_id||r.to_ref==='item:'+b.item_id).length;
  const ca=concepts.some(c=>c.category_id===a.category_id)?1:0,cb=concepts.some(c=>c.category_id===b.category_id)?1:0;return (ca-cb)||(Math.min(rb,1)-Math.min(ra,1));});
 concepts.push(l.shift());added=true;}}if(!added)break;}
const itemById=new Map(items.map(i=>[i.item_id,i]));
const conceptItems=concepts.map(c=>{const rr=rels.filter(r=>r.from_ref==='item:'+c.item_id||r.to_ref==='item:'+c.item_id).map(r=>({...r,assessments:ass.filter(a=>a.relation_id===r.relation_id&&!a.superseded_by).map(a=>({aspect:a.aspect,value:a.value,basis:a.basis,independence:a.independence,citation:a.citation,note:a.note})),
  other:(()=>{const o=(r.from_ref==='item:'+c.item_id?r.to_ref:r.from_ref);const it=o.startsWith('item:')?itemById.get(o.slice(5)):null;return it?{ref:o,concept_id:it.concept_id,concept_kind:it.concept_kind,statement:it.statement}:{ref:o};})()}));
 return {kind:'store_concept',category:c.category_id,concept:{...c,aliases:JSON.parse(c.aliases_json??'[]')},relations:rr};});
// ---- QK aspects and PD properties
const QK=JSON.parse(readFileSync(new URL('../resources/quantity-knowledge/quantity-knowledge.v3.json',import.meta.url),'utf8'));
const PD=JSON.parse(readFileSync(new URL('../resources/property-definitions/property-definitions.v1.json',import.meta.url),'utf8'));
const aspects=shuffle(QK.aspects.filter(a=>a.id!=='other')).slice(0,10).map(a=>({kind:'qk_aspect',category:null,aspect:a,phenomena:(QK.phenomena??[]).filter(p=>p.aspect===a.id),facets:(QK.facets??[]).filter(f=>(f.aspects??[f.aspect]).includes?.(a.id))}));
const q=shuffle(PD.properties.filter(p=>p.form==='quantity')).slice(0,6),j=shuffle(PD.properties.filter(p=>p.form==='judgement')).slice(0,4);
const props=[...q,...j].map(p=>({kind:'pd_property',category:null,property:p,conditionDimensions:(p.conditions??[]).map(([id])=>PD.conditionDimensions.find(x=>x.id===id)).filter(Boolean)}));
// ---- write
const all=[...rows,...conceptItems,...aspects,...props].map((x,i)=>({item:'S'+String(i+1).padStart(3,'0'),...x}));
const textOf=x=>JSON.stringify(x);
writeFileSync(OUT,JSON.stringify({schema:'pee.fa-i1.sample.v1',seed:20261021,items:all},null,1)+'\n');
const coverage=Object.fromEntries(ALLF.map(f=>[f,rows.filter(r=>r.features.includes(f)).length]));
writeFileSync(MAN,JSON.stringify({schema:'pee.fa-i1.sample-manifest.v1',seed:20261021,built:new Date().toISOString().slice(0,10),
 note:'Private sample (package and store text) in $PEE_PRIVATE_EVAL_DIR/fa-i1/sample.json; this manifest holds ids, strata, features and SHA-256 of each item only.',
 exclusions:{designRowsExcluded:excluded,rowsWithFewerThanTwoCells:partial},
 strata:{package_row:rows.length,store_concept:conceptItems.length,qk_aspect:aspects.length,pd_property:props.length},
 packageRowFeatureCoverage:coverage,packageRowsPerCategory:Object.fromEntries([...new Set(rows.map(r=>r.category))].map(c=>[c,rows.filter(r=>r.category===c).length])),
 conceptKinds:Object.fromEntries([...new Set(concepts.map(c=>c.concept_kind??'none'))].map(k=>[k,concepts.filter(c=>(c.concept_kind??'none')===k).length])),
 items:all.map(x=>({item:x.item,kind:x.kind,category:x.category,features:x.features??null,id:x.kind==='package_row'?x.document+'#'+x.line:x.kind==='store_concept'?x.concept.item_id:x.kind==='qk_aspect'?x.aspect.id:x.property.id,sha256:sha(textOf(x))})),
 sampleSha256:sha(readFileSync(OUT,'utf8'))},null,1)+'\n');
console.log('rows',rows.length,'concepts',conceptItems.length,'aspects',aspects.length,'props',props.length,'coverage',JSON.stringify(coverage),'excluded',excluded,'partial',partial);
