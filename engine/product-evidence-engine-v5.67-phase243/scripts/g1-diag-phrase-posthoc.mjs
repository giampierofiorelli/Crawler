#!/usr/bin/env node
/** G1 diagnosis, POST HOC supplementary check (not preregistered; run after the E1-E5 first run): whole-phrase matching of
 * taught concept names and aliases (instead of word stems) on the spent I3 R set, read from a store copy opened read-only.
 * Asks whether the E4 failure comes from word-level matching or from the representation (generic needs taught as concepts
 * of several families). Writes evaluation/g1/diag-posthoc-phrase.json; never overwrites.
 * Usage: node scripts/g1-diag-phrase-posthoc.mjs STORE_COPY */
import {readFileSync,writeFileSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';
const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(process.argv[2],{readOnly:true});
const PE=join(homedir(),'.local/share/product-evidence-engine/private-eval');
const REQ=JSON.parse(readFileSync(join(PE,'i3/r/requests.json'),'utf8')).requests;const REF=new Map(JSON.parse(readFileSync(join(PE,'i3/r/reference.json'),'utf8')).requests.map(r=>[r.id,r]));
const norm=t=>' '+t.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim()+' ';
const items=db.prepare("SELECT category_id c,concept_id id,aliases_json a,concept_kind k FROM category_items WHERE concept_id IS NOT NULL AND category_id<>'pee_write_test'").all();
const phrases=[];for(const i of items){if(!['outcome','environment','failure','task','meaning'].includes(i.k))continue;for(const p of [i.id.replace(/_/g,' '),...JSON.parse(i.a||'[]')]){const n=norm(p);if(n.trim().split(' ').length>=1)phrases.push({fam:/_(alternative|constraint)$/.test(i.id)?'strategy:'+i.id:i.c,id:i.id,p:n});}}
let just=0,inv=0,prim=0,np=0;const ex=[];
for(const r of REQ){const ref=REF.get(r.id);const ok=new Set([...ref.plausibleFamilies.map(f=>f.family),...(ref.acceptableFamilies??[])]);const P=new Set(ref.plausibleFamilies.filter(f=>f.strength==='primary').map(f=>f.family));
 const t=norm(r.text);const hit=new Map();for(const x of phrases)if(t.includes(x.p)){(hit.get(x.fam)??hit.set(x.fam,new Set()).get(x.fam)).add(x.p.trim());}
 const fams=[...hit.keys()].filter(f=>!f.startsWith('strategy:'));for(const f of fams){if(ok.has(f))just++;else{inv++;ex.push([r.id,f,[...hit.get(f)]]);}}if(fams.some(f=>P.has(f)))prim++;np+=[...hit.keys()].filter(f=>f.startsWith('strategy:')).length;}
const OUT=new URL('../evaluation/g1/diag-posthoc-phrase.json',import.meta.url).pathname;
const res={phraseCount:phrases.length,families_justified:just,families_invented:inv,primary_found:prim,strategy_hits:np};
// how many invented whole-phrase hits come from phrases taught under two or more families
const famsOf=new Map();for(const x of phrases)(famsOf.get(x.p.trim())??famsOf.set(x.p.trim(),new Set()).get(x.p.trim())).add(x.fam);
let multi=0,single=0;for(const [id,f,ps] of ex)ps.some(p=>famsOf.get(p).size>1)?multi++:single++;
Object.assign(res,{fromPhrasesInSeveralFamilies:multi,fromSingleFamilyPhrases:single,phrasesInSeveralFamilies:[...famsOf.values()].filter(s=>s.size>1).length,distinctPhrases:famsOf.size});
const {existsSync}=await import('node:fs');if(existsSync(OUT))throw Error(OUT+' exists');
writeFileSync(OUT,JSON.stringify({schema:'pee.g1.diag-posthoc-phrase.v1',status:'post hoc, not preregistered; spent material',baselineC1:{families_justified:16,families_invented:25,primary_found:10},result:res},null,1)+'\n');console.log(JSON.stringify(res));
