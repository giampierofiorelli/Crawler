// First increment A6 (owner authorisation 2026-10-21): "elimina i due cicli di import introdotti da R3-P con modifiche
// minime e test di equivalenza ... Non avviare una ristrutturazione generale."
// The two cycles R3-P introduced were need_interpretation <-> phase253_request_advice (needKnowledge269) and
// quantity_knowledge <-> language_scope (the default scope vocabulary). The older phase75 <-> phase223 cycle predates
// R3-P and is outside this authorisation: it is listed as known, so that any NEW cycle fails here.
import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {scopeVocabulary} from '../src/language_scope.js';
import {loadQuantityKnowledge,DEFAULT_QUANTITY_PACK} from '../src/quantity_knowledge.js';
import * as P253 from '../src/phase253_request_advice.js';
import * as P247 from '../src/phase247_category_relations.js';

const DIST=new URL('../src/',import.meta.url).pathname;
const IMPORT=/(?:^|[;\n])\s*(?:import|export)\s[^;]*?from\s*['"](\.\/[^'"]+)['"]|import\(\s*['"](\.\/[^'"]+)['"]\s*\)/g;
function graph(){const g=new Map<string,string[]>();
 for(const f of readdirSync(DIST).filter(f=>f.endsWith('.js'))){const m=f.slice(0,-3);
  g.set(m,[...new Set([...readFileSync(DIST+f,'utf8').matchAll(IMPORT)].map(x=>(x[1]??x[2]).replace(/^\.\//,'').replace(/\.js$/,'')))]);}
 return g;}
/** Strongly connected components with more than one module (Tarjan). */
function cycles(g:Map<string,string[]>):string[][]{let i=0;const idx=new Map<string,number>(),low=new Map<string,number>(),on=new Set<string>(),st:string[]=[],out:string[][]=[];
 const visit=(v:string)=>{idx.set(v,i);low.set(v,i);i++;st.push(v);on.add(v);
  for(const w of g.get(v)??[]){if(!g.has(w))continue;if(!idx.has(w)){visit(w);low.set(v,Math.min(low.get(v)!,low.get(w)!));}else if(on.has(w))low.set(v,Math.min(low.get(v)!,idx.get(w)!));}
  if(low.get(v)===idx.get(v)){const c:string[]=[];let w:string;do{w=st.pop()!;on.delete(w);c.push(w);}while(w!==v);if(c.length>1)out.push(c.sort());}};
 for(const v of g.keys())if(!idx.has(v))visit(v);return out.sort((a,b)=>a[0].localeCompare(b[0]));}

const KNOWN_OLDER=[['phase223_public_metadata_access','phase75_source_discovery']];

test('A6: neither R3-P cycle exists, and no new runtime import cycle appears', ()=>{
 const c=cycles(graph());
 for(const cyc of c)for(const m of ['need_interpretation','phase253_request_advice','quantity_knowledge','language_scope'])
  assert.ok(!cyc.includes(m),`${m} is still in an import cycle: ${cyc.join(' <-> ')}`);
 assert.deepEqual(c,KNOWN_OLDER,'only the known pre-R3-P cycle remains (it is outside this authorisation)');
});

test('A6 equivalence: the default scope vocabulary is the quantity-knowledge pack section, unchanged', ()=>{
 assert.deepEqual(scopeVocabulary(),loadQuantityKnowledge().pack.language.en.scope);
 assert.equal(DEFAULT_QUANTITY_PACK,'quantity-knowledge.v3.json','the pack constant is still exported from quantity_knowledge');
});

test('A6 equivalence: needKnowledge269 is one function, still exported from phase253 for existing callers', ()=>{
 assert.equal(typeof P247.needKnowledge269,'function');
 assert.equal(P253.needKnowledge269,P247.needKnowledge269,'phase253 re-exports the same function (no copy, no behaviour change)');
});
