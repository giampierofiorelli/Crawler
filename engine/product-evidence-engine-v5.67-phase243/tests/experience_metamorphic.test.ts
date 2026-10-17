import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runMetamorphic,MR_FIXTURES,type MRExtract,type MRLead} from '../src/experience_metamorphic.js';

// Step 1B: the metamorphic harness itself, checked with STUB extractors on its fictional fixtures. The real builds' results
// are recorded by scripts/experience-metamorphic.mjs (violations included); these tests do not assert that any build passes.
const strip=(h:string)=>h.replace(/<[^>]+>/g,' ');
const MODELS=['Zentra Z10','Korvo K20','Brixel B30'];
/** Oracle stub: a prose value takes the product named first in its own sentence; a table value takes its column header. */
const oracle:MRExtract=html=>{const out:MRLead[]=[];
 for(const t of html.matchAll(/<table>([\s\S]*?)<\/table>/g)){const rows=[...t[1].matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map(r=>[...r[1].matchAll(/<t[hd]>(.*?)<\/t[hd]>/g)].map(c=>c[1]));
  for(const r of rows.slice(1))r.forEach((c,j)=>{const m=/^([\d,.]+)\s*(nits|ms)$/.exec(c);if(m&&j>0)out.push({value:Number(m[1].replace(/,/g,'')),unit:m[2],subject:rows[0][j]});});}
 for(const s of strip(html.replace(/<table>[\s\S]*?<\/table>/g,'')).split(/(?<=\.)\s+/)){const named=MODELS.map(m=>[m,s.indexOf(m)] as const).filter(([,i])=>i>=0).sort((a,b)=>a[1]-b[1]);
  for(const m of s.matchAll(/([\d,]+)\s*(nits|ms)\b/g))if(named.length)out.push({value:Number(m[1].replace(/,/g,'')),unit:m[2],subject:named[0][0]});}
 return out;};
/** Fault stub: the product named nearest before the value in its sentence (the EX-05 mechanism). */
const nearest:MRExtract=html=>{const out:MRLead[]=[];
 for(const s of strip(html.replace(/<table>[\s\S]*?<\/table>/g,'')).split(/(?<=\.)\s+/))for(const m of s.matchAll(/([\d,]+)\s*(nits|ms)\b/g)){
  const before=MODELS.map(x=>[x,s.lastIndexOf(x,m.index)] as const).filter(([,i])=>i>=0).sort((a,b)=>b[1]-a[1]);
  if(before.length)out.push({value:Number(m[1].replace(/,/g,'')),unit:m[2],subject:before[0][0]});}
 return [...oracle(html).filter(l=>!out.some(o=>o.value===l.value)),...out];};
/** Fault stub: reads only the first product column of a table. */
const firstColumnOnly:MRExtract=h=>{const head=/<tr><th>[^<]*<\/th><th>([^<]*)<\/th>/.exec(h)?.[1];return oracle(h).filter(l=>!head||l.subject===head);};

test('the oracle stub satisfies every relation; preconditions hold on the fixtures',()=>{
 const v=runMetamorphic(oracle);assert.equal(v.length,6);
 for(const x of v)assert.equal(x.status,'holds',x.relation+' '+x.variant+' '+JSON.stringify(x.checked));
});
test('a nearest-name extractor fails the MR3 oracle; a first-column-only extractor fails MR1 by a missing value',()=>{
 const o=runMetamorphic(nearest).find(x=>x.variant.startsWith('oracle'))!;
 assert.equal(o.status,'violated');assert.ok(o.checked.some(c=>c.followUp==='Zentra Z10'),'the comparative sentence binds the compared product');
 const c=runMetamorphic(firstColumnOnly).find(x=>x.variant==='product columns swapped')!;
 assert.equal(c.status,'violated');assert.ok(c.checked.every(x=>x.followUp==='missing'),'a missing value, not a wrong product');
});
test('no constrained lead means precondition_not_met, never a pass; unresolved is reported apart from correct',()=>{
 assert.ok(runMetamorphic(()=>[]).every(x=>x.status==='precondition_not_met'));
 const unresolved:MRExtract=h=>oracle(h).map(l=>l.value===1180?{...l,subject:null}:l);
 assert.equal(runMetamorphic(unresolved).find(x=>x.variant.startsWith('oracle'))!.status,'holds_unresolved');
});
test('the fixtures are fictional and the committed results name only the fictional products',()=>{
 const text=JSON.stringify(MR_FIXTURES);for(const real of ['LG','Samsung','Sony','Xiaomi','Dyson','Panasonic'])assert.ok(!new RegExp('\\b'+real+'\\b').test(text),real);
 for(const f of ['metamorphic-frozen-c206c9a.json','metamorphic-current-fc7a040.json']){
  const r=JSON.parse(readFileSync(new URL('../../evaluation/experience/'+f,import.meta.url),'utf8'));assert.equal(r.tier,'T1_synthetic');assert.equal(r.verdicts.length,6);
  for(const v of r.verdicts)for(const c of v.checked)assert.ok([null,'missing',...MODELS].includes(c.followUp),String(c.followUp));}
});
