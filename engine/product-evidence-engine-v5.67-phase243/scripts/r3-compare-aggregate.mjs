/** R3-1: aggregate the blind source-first inventory against the store comparison into a public, value-free census.
 * Reads the private inventories and comparisons ($PEE_PRIVATE_EVAL_DIR/r3) and the store dump, writes counts only:
 * stored (correct/partial/distorted/missing) by inventory unit type, representability and gap kind, and
 * "represented but unused": store items matched by a unit that no decision path consults. Consulted = what the
 * link program (teachingView) and goal relevance read: measurement concepts, the concepts reached by measured_by /
 * not_sufficient_for / requires_condition, and those relations. Usage: node scripts/r3-compare-aggregate.mjs */
import {readFileSync,writeFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const PE=join(process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local/share/product-evidence-engine/private-eval'),'r3');
const CATS=['air_purifiers','coffee_machines','air_fryers'],SIDES=['dev','heldout'];
const READ=new Set(['measured_by','not_sufficient_for','requires_condition']);
const J=f=>JSON.parse(readFileSync(f,'utf8'));const inc=(o,k,n=1)=>{o[k]=(o[k]??0)+n;};
const out={schema:'pee.r3.store-comparison-census.v1',generatedAt:new Date().toISOString(),tier:'T2 authentic controlled (owner documents; blind same-model inventory and comparison: not independent human validation)',
 consulted:'measurement concepts; concepts reached by measured_by, not_sufficient_for, requires_condition; those relations (link program and goal relevance)',categories:{}};
for(const c of CATS){const st=J(join(PE,'compare',`store-${c}.json`));
 const used=new Set();const conceptOf=new Map(st.items.map(i=>[i.id,i.concept]));
 for(const r of st.relations)if(READ.has(r.kind)){used.add(r.id);}
 for(const i of st.items)if(i.concept&&(i.concept.kind==='measurement'||st.relations.some(r=>READ.has(r.kind)&&(r.to===i.concept.id||r.from===i.concept.id))))used.add(i.id);
 out.categories[c]={storeItems:st.items.length,storeRelations:st.relations.length,storeConsulted:used.size,sides:{}};
 for(const s of SIDES){const inv=J(join(PE,'inventory',`${c}-${s}.json`)),cmp=J(join(PE,'compare',`${c}-${s}.json`));
  const type=new Map(inv.units.map(u=>[u.id,u.type]));const imp=new Map(inv.units.map(u=>[u.id,u.importance]));
  const r={units:cmp.items.length,stored:{},byType:{},highImportance:{},representable:{},gap:{},matchedStoreEntries:0,matchedUnused:0,unitsOnlyUnusedMatches:0};
  const seen=new Set();
  for(const x of cmp.items){inc(r.stored,x.stored);const t=type.get(x.unit)??'unknown';r.byType[t]??={};inc(r.byType[t],x.stored);
   if(imp.get(x.unit)==='high')inc(r.highImportance,x.stored);
   inc(r.representable,x.representable||'unstated');if(x.representable&&x.representable!=='yes')inc(r.gap,x.gap||'unstated');
   if(x.match.length){const un=x.match.filter(m=>!used.has(m));if(un.length===x.match.length&&(x.stored==='correct'||x.stored==='partial'))r.unitsOnlyUnusedMatches++;}
   for(const m of x.match)if(!seen.has(m)){seen.add(m);r.matchedStoreEntries++;if(!used.has(m))r.matchedUnused++;}}
  out.categories[c].sides[s]=r;}}
writeFileSync('evaluation/r3/store-comparison-census.json',JSON.stringify(out,null,1)+'\n');
for(const [c,v] of Object.entries(out.categories))for(const [s,r] of Object.entries(v.sides))console.log(c,s,JSON.stringify({stored:r.stored,repr:r.representable,gap:r.gap,matched:r.matchedStoreEntries,unused:r.matchedUnused,onlyUnused:r.unitsOnlyUnusedMatches}));
