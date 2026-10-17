#!/usr/bin/env node
/** Continuous-learning Step 1C: frozen attribution comparison on new untouched comparative-review pages (no network here;
 * pages come from the bounded Step 1C wave, scripts/phase246-live-wave.mjs, state in the private evaluation directory).
 *   render              plain-text rendering of every fetched page for the gold annotator (no extractor is run)
 *   freeze-gold         hash and count the annotated gold -> evaluation/step1c/gold-freeze.json (refuses to overwrite)
 *   run LABEL           verify the code freeze and the gold hash, run every arm ONCE on the same pages, score with the
 *                       frozen scorer (src/experience_attribution_scoring.ts) and write the private full result and the
 *                       public value-free result (refuses to overwrite)
 * Arms (evaluation/step1c/protocol.json): A frozen Phase272 guided build c206c9a; B current tuned build; C current build
 * + the constrained attribution candidate; D current build + the Step 1B ambiguity-only counterfactual (ablation). */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {documentLeads,buildIdentity,MATCHING_RULE_DIGEST} from './experience-observe.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
// REHEARSAL ONLY: PEE_STEP1C_EVAL / PEE_STEP1C_PUBDIR point the same code at development pages and a scratch protocol copy.
const EV=process.env.PEE_STEP1C_EVAL??'step1c';const P=join(homedir(),'.local/share/product-evidence-engine/private-eval',EV);
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const PUBDIR=process.env.PEE_STEP1C_PUBDIR??'evaluation/step1c';
const [cmd,label]=process.argv.slice(2);
const wave=()=>JSON.parse(readFileSync(join(P,'wave.json'),'utf8'));
const fetched=()=>wave().pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval');

if(cmd==='render'){
 // Tables keep their rows ("| a | b |") so the annotator sees column structure; headings are marked "##".
 const dec=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#8217;|&rsquo;/g,'’').replace(/&#8216;|&lsquo;/g,'‘').replace(/&#8220;|&ldquo;/g,'“').replace(/&#8221;|&rdquo;/g,'”')
  .replace(/&#8211;|&ndash;/g,'–').replace(/&#8212;|&mdash;/g,'—').replace(/&quot;/g,'"').replace(/&#039;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n));
 mkdirSync(join(P,'annot'),{recursive:true});
 for(const p of fetched()){const file=join(P,'raw',p.tag+'.html');if(sha(readFileSync(file))!==p.sha256)throw Error('bytes differ: '+p.tag);
  const t=dec(readFileSync(file,'utf8').replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|svg|noscript|iframe|template)\b[\s\S]*?<\/\1\s*>/gi,'')
   .replace(/<h[1-6]\b[^>]*>/gi,'\n## ').replace(/<\/h[1-6]>/gi,'\n').replace(/<tr\b[^>]*>/gi,'\n|').replace(/<\/t[hd]>/gi,' |').replace(/<(p|li|br|div|section|article|figcaption|caption)\b[^>]*>/gi,'\n')
   .replace(/<[^>]+>/g,' ')).split('\n').map(x=>x.replace(/[ \t]+/g,' ').trim()).filter(Boolean).join('\n');
  writeFileSync(join(P,'annot',p.tag+'.txt'),`URL: ${p.finalUrl??p.url}\nCATEGORY: ${p.category}\n\n${t}\n`);console.log(p.tag,t.length);}
 process.exit(0);
}
if(cmd==='freeze-gold'){
 const out=join(PUBDIR,'gold-freeze.json');if(existsSync(out))throw Error(out+' exists');
 const b=readFileSync(join(P,'gold.json'));const G=JSON.parse(b);const by=k=>G.values.filter(v=>v.subjectStatus===k).length;
 writeFileSync(out,JSON.stringify({schema:'pee.step1c.gold-freeze.v1',frozenAt:new Date().toISOString(),goldSha256:sha(b),annotator:G.annotator,
  documents:G.documents.map(d=>({tag:d.tag,category:d.category})),values:G.values.length,exact:by('exact'),shared:by('shared'),undetermined:by('undetermined'),
  withVariants:G.values.filter(v=>v.acceptedVariants?.length).length,note:'frozen before any comparison arm ran on these pages; contents private'},null,1)+'\n');
 console.log(readFileSync(out,'utf8'));process.exit(0);
}
if(cmd!=='run'||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: render | freeze-gold | run LABEL');
const PRIV=join(REPO,'private-eval',EV,`run-${label}.json`),PUB=join(PUBDIR,`run-${label}.json`);
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: a first run is never overwritten');
// 1. Code freeze: every listed file must still have its frozen hash.
for(const [h,f] of readFileSync(join(PUBDIR,'freeze.sha256'),'utf8').trim().split('\n').map(l=>l.split(/\s+/)))
 if(sha(readFileSync(f.startsWith('/')?f:resolve(f)))!==h)throw Error('frozen file changed: '+f);
// 2. Gold freeze.
const gb=readFileSync(join(P,'gold.json'));const GF=JSON.parse(readFileSync(join(PUBDIR,'gold-freeze.json'),'utf8'));
if(sha(gb)!==GF.goldSha256)throw Error('gold differs from the frozen hash');const G=JSON.parse(gb);
const PR=JSON.parse(readFileSync(join(PUBDIR,'protocol.json'),'utf8'));
const S=await import(resolve('dist/src/experience_attribution_scoring.js'));const UNIT=(await import(resolve('dist/src/phase272_extraction_plan.js'))).canonicalUnit272;
const UE={db:['db','dba','db(a)'],nits:['nits','nit','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs','sec'],hours:['hours','hrs','h'],'%':['%','percent'],l:['l','litres','liters'],w:['w','watts'],kwh:['kwh'],ms:['ms'],cfm:['cfm']};
const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return UNIT?.(l)??l;};
const gold=G.values.map(v=>({...v,unit:canon(v.unit)}));
const arms=PR.arms.map(a=>({...a,dist:resolve(a.dist)}));const runs={};const frozenPlans=JSON.parse(readFileSync('evaluation/phase272/plans-frozen-known.json','utf8'));
for(const a of arms){runs[a.id]={};for(const d of G.documents){const r=await documentLeads(a.dist,{evaluation:EV,docTag:d.tag,category:d.category},a.policy?{policy:a.policy}:{});
 if(r.unobservable)throw Error(a.id+' '+d.tag+': '+r.unobservable);if(frozenPlans[d.category]!==r.meta.planDigest)throw Error('plan digest differs from the frozen one: '+d.category);
 runs[a.id][d.tag]=r;}}
const result={};
for(const a of arms){const items={},leads=[];
 for(const d of G.documents){const L=runs[a.id][d.tag].leads.map(l=>({...l,unit:canon(l.unit)}));const g=gold.filter(v=>v.doc===d.tag);
  for(const v of g)items[v.id]=S.scoreItem1C(v,L);for(const l of L)leads.push({doc:d.tag,cls:S.scoreLead1C(l,g),assignment:l.assignment,lead:l});}
 result[a.id]={items,leads};}
const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});
const summary=Object.fromEntries(arms.map(a=>[a.id,{items:count(Object.values(result[a.id].items)),leads:count(result[a.id].leads.map(l=>l.cls)),
 perDocument:Object.fromEntries(G.documents.map(d=>[d.tag,{items:count(gold.filter(v=>v.doc===d.tag).map(v=>result[a.id].items[v.id])),leads:count(result[a.id].leads.filter(l=>l.doc===d.tag).map(l=>l.cls))}])),
 rulesUsed:count(result[a.id].leads.map(l=>l.assignment??'none'))}]));
const cmp={};for(const [f,t] of PR.comparisons)cmp[f+'->'+t]=S.compareArms1C(result[f].items,result[t].items);
const meta={schema:'pee.step1c.run.v1',label,at:new Date().toISOString(),tier:'T2_untouched_first_run',protocolSha256:sha(readFileSync(join(PUBDIR,'protocol.json'))),goldSha256:GF.goldSha256,
 matchingRuleDigest:MATCHING_RULE_DIGEST,builds:Object.fromEntries(arms.map(a=>[a.id,buildIdentity(a.dist)])),documents:G.documents.map(d=>({tag:d.tag,category:d.category})),
 gold:{values:gold.length,byStatus:count(gold.map(v=>v.subjectStatus))}};
mkdirSync(join(REPO,'private-eval',EV),{recursive:true});
writeFileSync(PRIV,JSON.stringify({...meta,summary,comparisons:cmp,result,runs},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...meta,summary,comparisons:cmp,items:Object.fromEntries(arms.map(a=>[a.id,result[a.id].items]))},null,1)+'\n');
console.log(JSON.stringify({gold:meta.gold,summary:Object.fromEntries(arms.map(a=>[a.id,{items:summary[a.id].items,leads:summary[a.id].leads}])),
 comparisons:Object.fromEntries(Object.entries(cmp).map(([k,v])=>[k,{newConfidentlyWrong:v.newConfidentlyWrong.length,correctLost:v.correctLost.length,correctGained:v.correctGained.length,wrongRemoved:v.wrongRemoved.length}]))},null,1));
