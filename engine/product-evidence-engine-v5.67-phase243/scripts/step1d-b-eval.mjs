#!/usr/bin/env node
/** Continuous-learning Step 1D-B: frozen validation of the Step 1D-A2 HTML-first reader on genuinely unseen pages.
 * No network here: pages come from the bounded Step 1D-B wave (scripts/phase246-live-wave.mjs, state in the private
 * evaluation directory). Protocol: evaluation/step1d-b/protocol.json (committed before any new page was examined).
 *   screen --urls FILE|U1,U2   offline: compare candidate URLs with every URL used before (wave receipts, evaluation
 *                              files, private evaluations, store revisions read-only), canonical form
 *   gate                       offline: robots Content-Signal and page reservations (noai, TDM), paywall/login markers,
 *                              canonical-link and content-duplicate screen against every earlier retained page
 *   render                     plain-text rendering of every fetched page for the annotator (no extractor is run)
 *   freeze-gold                hash and count the sealed reference -> evaluation/step1d-b/gold-freeze.json (no overwrite)
 *   run LABEL                  verify code freeze, gold hash and plan digests; run arms A, B, C ONCE on the same pages;
 *                              score with the frozen Step 1C scorer; write private full and public value-free results
 *   adjudicate LABEL           summarise the separate source-based adjudication (private adjudication-LABEL.json) beside
 *                              the frozen score; the frozen run is never modified
 * Arms (identical inputs, plan, scorer): A candidate_1c_inventory (Step 1D-A); B candidate_1c_semantics (+ structural
 * identity and context); C candidate_1c_semantics_tables (B + structured test-table reader) = frozen candidate ebda3d4. */
import {readFileSync,writeFileSync,existsSync,mkdirSync,readdirSync,statSync} from 'node:fs';import {join,resolve} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
import {documentLeads,documentInventory,buildIdentity,MATCHING_RULE_DIGEST} from './experience-observe.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
// REHEARSAL ONLY: PEE_STEP1D_B_EVAL / PEE_STEP1D_B_PUBDIR point the same code at spent pages and a scratch protocol copy.
const EV=process.env.PEE_STEP1D_B_EVAL??'step1d-b';const ROOT=join(homedir(),'.local/share/product-evidence-engine/private-eval');const P=join(ROOT,EV);
const REPO=process.env.PEE_KNOWLEDGE_REPO??'/home/user/pee-knowledge';const PUBDIR=process.env.PEE_STEP1D_B_PUBDIR??'evaluation/step1d-b';
const LIVE=join(process.env.PEE_KNOWLEDGE_DIR??join(homedir(),'.local/share/product-evidence-engine/knowledge'),'pee246.sqlite');
const [cmd,...rest]=process.argv.slice(2);const F={};for(let i=0;i<rest.length;i++)if(rest[i].startsWith('--'))F[rest[i].slice(2)]=rest[i+1]&&!rest[i+1].startsWith('--')?rest[++i]:true;
const label=rest.find(a=>!a.startsWith('--')&&!Object.values(F).includes(a));
const wave=()=>JSON.parse(readFileSync(join(P,'wave.json'),'utf8'));
const fetched=()=>wave().pages.filter(p=>p.outcome==='fetched'&&p.role==='heldout_eval');
const count=xs=>xs.reduce((o,k)=>(o[k]=(o[k]??0)+1,o),{});
/** Canonical URL form for the prior-use screen: host without www., no query or fragment, no trailing slash, lower case. */
const canonUrl=u=>{try{const x=new URL(u);return (x.host.replace(/^www\./,'')+x.pathname.replace(/\/+$/,'')).toLowerCase();}catch{return null;}};
function walk(dir,out=[]){if(!existsSync(dir))return out;for(const f of readdirSync(dir)){const p=join(dir,f);let s;try{s=statSync(p);}catch{continue;}
 if(s.isDirectory()){if(!/node_modules|\.git$/.test(f))walk(p,out);}else if(/\.json$/.test(f)&&s.size<60e6)out.push(p);}return out;}
async function priorUrls(){
 const files=[...walk(ROOT).filter(f=>!f.startsWith(P+'/')),...walk(resolve('evaluation')).filter(f=>!f.startsWith(resolve(PUBDIR))),...walk(join(REPO,'private-eval')).filter(f=>!f.includes('/'+EV+'/')),...walk(join(REPO,'policy'))];
 const set=new Set();for(const f of files){const t=readFileSync(f,'utf8');for(const m of t.matchAll(/https?:\/\/[^"'\s<>\\)]+/g)){const c=canonUrl(m[0].replace(/[.,;]+$/,''));if(c)set.add(c);}}
 const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(LIVE,{readOnly:true});for(const r of db.prepare('SELECT url FROM revisions').all()){const c=canonUrl(r.url);if(c)set.add(c);}db.close();
 return {set,files:files.length};
}
const dec=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&#8217;|&rsquo;/g,'’').replace(/&#8216;|&lsquo;/g,'‘').replace(/&#8220;|&ldquo;/g,'“').replace(/&#8221;|&rdquo;/g,'”')
 .replace(/&#8211;|&ndash;/g,'–').replace(/&#8212;|&mdash;/g,'—').replace(/&quot;/g,'"').replace(/&#039;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n));
/** The Step 1C annotator rendering (unchanged): tables keep their rows ("| a | b |"), headings are marked "##". */
const renderText=html=>dec(html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|svg|noscript|iframe|template)\b[\s\S]*?<\/\1\s*>/gi,'')
 .replace(/<h[1-6]\b[^>]*>/gi,'\n## ').replace(/<\/h[1-6]>/gi,'\n').replace(/<tr\b[^>]*>/gi,'\n|').replace(/<\/t[hd]>/gi,' |').replace(/<(p|li|br|div|section|article|figcaption|caption)\b[^>]*>/gi,'\n')
 .replace(/<[^>]+>/g,' ')).split('\n').map(x=>x.replace(/[ \t]+/g,' ').trim()).filter(Boolean).join('\n');
const shingles=t=>{const w=t.toLowerCase().replace(/[^a-z0-9 ]+/g,' ').split(/\s+/).filter(Boolean);const s=new Set();for(let i=0;i+8<=w.length;i++)s.add(sha(w.slice(i,i+8).join(' ')).slice(0,16));return s;};

if(cmd==='screen'){
 const urls=existsSync(String(F.urls))?readFileSync(String(F.urls),'utf8').split(/\s+/).filter(Boolean):String(F.urls).split(',');
 const {set,files}=await priorUrls();const rows=urls.map(u=>({url:u,canonical:canonUrl(u),usedBefore:set.has(canonUrl(u))}));
 mkdirSync(P,{recursive:true});writeFileSync(join(P,'screen.json'),JSON.stringify({at:new Date().toISOString(),priorUrlCount:set.size,filesScanned:files,rows},null,1)+'\n');
 console.log('prior canonical URLs',set.size,'from',files,'files + store revisions');for(const r of rows)console.log(r.usedBefore?'USED ':'new  ',r.url);process.exit(0);
}
if(cmd==='gate'){
 const {detectReservations249}=await import(resolve('dist/src/phase249_retention_policy.js'));const W=wave();
 const hosts=Object.fromEntries(Object.entries(W.robots).map(([h,r])=>[h,{status:r.status,reservations:detectReservations249(r.body??null,null)}]));
 const prior=[];for(const d of readdirSync(ROOT)){const raw=join(ROOT,d,'raw');if(d===EV||!existsSync(raw))continue;for(const f of readdirSync(raw))if(f.endsWith('.html'))prior.push({tag:d+'/'+f,sh:shingles(renderText(readFileSync(join(raw,f),'utf8')))});}
 const {set}=await priorUrls();const pages=[];
 for(const p of fetched()){const html=readFileSync(join(P,'raw',p.tag+'.html'),'utf8');if(sha(readFileSync(join(P,'raw',p.tag+'.html')))!==p.sha256)throw Error('bytes differ '+p.tag);
  const host=new URL(p.finalUrl??p.url).host;const r=detectReservations249(W.robots[host]?.body??null,html);
  const canon=/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(html)?.[1]??/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i.exec(html)?.[1]??null;
  const sh=shingles(renderText(html));let best={tag:null,jaccard:0};
  for(const q of prior){let i=0;for(const x of sh)if(q.sh.has(x))i++;const j=i/((sh.size+q.sh.size-i)||1);if(j>best.jaccard)best={tag:q.tag,jaccard:Math.round(j*1000)/1000};}
  const visible=renderText(html);
  pages.push({tag:p.tag,host,reservations:r,canonicalLink:canon,canonicalUsedBefore:canon?set.has(canonUrl(canon)):null,closestPriorPage:best,
   loginOrPaywallText:/subscribe to (continue|read)|sign in to (continue|read)|create a free account to (continue|read)|this content is for (members|subscribers)/i.test(visible),
   productJsonLd:/"@type"\s*:\s*"(Product|ProductGroup)"/.test(html),visibleChars:visible.length});}
 const out={schema:'pee.step1d-b.gate.v1',at:new Date().toISOString(),hosts,pages};writeFileSync(join(P,'gate.json'),JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out,null,1));process.exit(0);
}
if(cmd==='render'){
 mkdirSync(join(P,'annot'),{recursive:true});
 for(const p of fetched()){const file=join(P,'raw',p.tag+'.html');if(sha(readFileSync(file))!==p.sha256)throw Error('bytes differ: '+p.tag);const t=renderText(readFileSync(file,'utf8'));
  writeFileSync(join(P,'annot',p.tag+'.txt'),`URL: ${p.finalUrl??p.url}\nCATEGORY: ${p.category}\n\n${t}\n`);console.log(p.tag,t.length);}
 process.exit(0);
}
if(cmd==='freeze-gold'){
 const out=join(PUBDIR,'gold-freeze.json');if(existsSync(out))throw Error(out+' exists');
 const b=readFileSync(join(P,'gold.json'));const G=JSON.parse(b);const by=k=>G.values.filter(v=>v.subjectStatus===k).length;
 writeFileSync(out,JSON.stringify({schema:'pee.step1d-b.gold-freeze.v1',frozenAt:new Date().toISOString(),goldSha256:sha(b),annotator:G.annotator,
  documents:G.documents.map(d=>({tag:d.tag,category:d.category,publisher:d.publisher,pageType:d.pageType,principalStated:!!d.principal,products:d.products.length,otherProducts:(d.otherProducts??[]).length})),
  values:G.values.length,exact:by('exact'),shared:by('shared'),undetermined:by('undetermined'),uncertain:G.values.filter(v=>v.uncertain).length,
  withVariants:G.values.filter(v=>v.acceptedVariants?.length).length,inTables:G.values.filter(v=>v.location==='table').length,
  negativeControls:G.negativeControls.length,negativeControlKinds:count(G.negativeControls.map(n=>n.kind)),qualitative:G.qualitative.length,
  note:'sealed before any comparison arm ran on these pages; contents private'},null,1)+'\n');
 console.log(readFileSync(out,'utf8'));process.exit(0);
}
if(cmd==='adjudicate'){
 const run=JSON.parse(readFileSync(join(REPO,'private-eval',EV,`run-${label}.json`),'utf8'));const A=JSON.parse(readFileSync(join(REPO,'private-eval',EV,`adjudication-${label}.json`),'utf8'));
 const PR=JSON.parse(readFileSync(join(PUBDIR,'protocol.json'),'utf8'));const classes=PR.adjudication.classes;
 for(const a of A.items)if(!classes.includes(a.adjudicated))throw Error('unknown adjudication class '+a.adjudicated);
 const need=run.adjudicationQueue.map(q=>q.key);const have=new Set(A.items.map(a=>a.key));const missing=need.filter(k=>!have.has(k));if(missing.length)throw Error('not adjudicated: '+missing.join(','));
 const by=(arm,f)=>count(A.items.filter(a=>a.arm===arm&&(!f||f(a))).map(a=>a.adjudicated));
 const out={schema:'pee.step1d-b.adjudication.v1',label,at:new Date().toISOString(),runSha256:sha(readFileSync(join(REPO,'private-eval',EV,`run-${label}.json`))),
  note:'source-based adjudication by the developer (Claude), recorded beside the frozen score; the frozen run is unchanged',
  byArm:Object.fromEntries(['A','B','C'].map(k=>[k,by(k)])),newInCvsA:by('C',a=>a.newVsA),gates:A.gates,
  items:A.items.map(a=>({key:a.key,arm:a.arm,doc:a.doc,frozen:a.frozen,adjudicated:a.adjudicated,newVsA:!!a.newVsA,cause:a.cause??null}))};
 writeFileSync(join(PUBDIR,`adjudication-${label}.json`),JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify({byArm:out.byArm,newInCvsA:out.newInCvsA,gates:out.gates},null,1));process.exit(0);
}
if(cmd!=='run'||!/^[a-z0-9-]{3,40}$/.test(label??''))throw Error('usage: screen | gate | render | freeze-gold | run LABEL | adjudicate LABEL');

const PRIV=join(REPO,'private-eval',EV,`run-${label}.json`),PUB=join(PUBDIR,`run-${label}.json`);
for(const f of [PRIV,PUB])if(existsSync(f))throw Error(f+' exists: a first run is never overwritten');
// 1. Code freeze: every listed file must still have its frozen hash.
for(const [h,f] of readFileSync(join(PUBDIR,'freeze.sha256'),'utf8').trim().split('\n').map(l=>l.split(/\s+/)))
 if(sha(readFileSync(f.startsWith('/')?f:resolve(f)))!==h)throw Error('frozen file changed: '+f);
// 2. Gold freeze.
const gb=readFileSync(join(P,'gold.json'));const GF=JSON.parse(readFileSync(join(PUBDIR,'gold-freeze.json'),'utf8'));
if(sha(gb)!==GF.goldSha256)throw Error('gold differs from the frozen hash');const G=JSON.parse(gb);
const PR=JSON.parse(readFileSync(join(PUBDIR,'protocol.json'),'utf8'));const D=resolve('dist/src');
const S=await import(D+'/experience_attribution_scoring.js');const PL=await import(D+'/phase272_extraction_plan.js');const T=await import(D+'/phase265_test_measurements.js');
const SP=await import(D+'/phase245_spec_extraction.js');const Q=await import(D+'/phase269_qualitative_observations.js');const ST=await import(D+'/phase246_knowledge_store.js');
const R=await import(D+'/phase248_category_registry.js');const I=await import(D+'/experience_entity_inventory.js');
const UE={db:['db','dba','db(a)','decibels','decibel'],nits:['nits','nit','cd/m2','cd/m²'],minutes:['minutes','mins','min'],seconds:['seconds','s','secs','sec'],hours:['hours','hrs','h','hour'],'%':['%','percent'],l:['l','litres','liters'],w:['w','watts'],kwh:['kwh'],ms:['ms'],cfm:['cfm']};
const canon=u=>{const l=String(u).toLowerCase();for(const [k,v] of Object.entries(UE))if(v.includes(l))return k;return PL.canonicalUnit272?.(l)??l;};
const TAUGHT=['air_fryers','coffee_machines','dehumidifiers','dishwashers','air_purifiers','televisions'];
const ARMS=[['A','candidate_1c_inventory'],['B','candidate_1c_semantics'],['C','candidate_1c_semantics_tables']];
const good=c=>c==='correct'||c==='correct_multi'||c==='correctly_unresolved';const wrong=c=>c==='wrong_product'||c==='false_identity_match'||c==='unsupported_assignment';
const gs=(s,v=[])=>({subject:s,subjectStatus:'exact',acceptedVariants:v,id:'',doc:'',value:0,unit:''});
const same=(a,b)=>Math.abs(a.value-b.value)<=1e-9*Math.max(1,Math.abs(a.value))&&a.unit===b.unit;
const gold=G.values.map(v=>({...v,unit:canon(v.unit)}));const negs=G.negativeControls.map(n=>({...n,unit:canon(n.unit)}));
const store=new ST.KnowledgeStore246(LIVE);const docsOut=[];const queue=[];const rss0=process.memoryUsage().rss;let rssPeak=rss0;
for(const d of G.documents){
 if(PR.knowledgeState.planDigests[d.category]===undefined)throw Error('category without a frozen plan digest: '+d.category);
 const plan=PL.compileExtractionPlan272(store,d.category,R.CATEGORY_REGISTRY250.find(e=>e.id===d.category)?.aliases??[],TAUGHT.filter(t=>t!==d.category));
 if(plan.compiledFrom.digest!==PR.knowledgeState.planDigests[d.category])throw Error('plan digest differs from the frozen one: '+d.category);
 const g=gold.filter(x=>x.doc===d.tag);const ng=negs.filter(x=>x.doc===d.tag);const res={};
 const productsAll=d.products.map(p=>({name:p.name,variants:p.variants??[]}));const others=(d.otherProducts??[]).map(n=>({name:n,variants:[]}));
 const matchAny=(list,n)=>list.filter(p=>S.identity1C(gs(p.name,p.variants),n)==='match');
 for(const [k,policy] of ARMS){const t0=Date.now();const r=await documentLeads(D,{evaluation:EV,docTag:d.tag,category:d.category},{policy,details:true});
  if(r.unobservable)throw Error(k+' '+d.tag+': '+r.unobservable);if(r.meta.planDigest!==plan.compiledFrom.digest)throw Error('arm plan differs');rssPeak=Math.max(rssPeak,process.memoryUsage().rss);
  const L=r.leads.map(l=>({...l,unit:canon(l.unit)}));const items=Object.fromEntries(g.map(x=>[x.id,S.scoreItem1C(x,L)]));
  const leads=L.map((l,i)=>({i,cls:S.scoreLead1C(l,g),subject:l.subject,subjects:l.subjects,value:l.value,unit:l.unit,assignment:l.assignment,blockIndex:l.blockIndex,condition:l.condition,dimension:l.dimension,methodCue:l.methodCue,unresolved:l.unresolved??null}));
  // Item details: matched lead conditions, competitor-to-principal, unit mismatches.
  const detail={};for(const x of g){const M=L.filter(l=>same(l,x));const ok=M.filter(l=>l.subject&&S.identity1C(x,l.subject)==='match');
   detail[x.id]={leads:M.length,correctLeads:ok.length,conditionMissing:!!(x.conditions?.length&&ok.length&&ok.every(l=>!l.condition&&!(l.conditionCodes?.length))),
    toPrincipal:items[x.id]==='wrong_product'&&!!d.principal&&M.some(l=>l.subject&&S.identity1C(gs(d.principal,(d.products.find(p=>p.name===d.principal)?.variants)??[]),l.subject)==='match'),
    unitMismatch:L.some(l=>Math.abs(l.value-x.value)<=1e-9*Math.max(1,Math.abs(x.value))&&l.unit!==x.unit&&l.subject&&S.identity1C(x,l.subject)==='match')};}
  const dupKeys=count(L.map(l=>[l.value,l.unit,l.subject??'-',l.blockIndex].join('|')));
  const negRead=ng.filter(n=>L.some(l=>same(l,n)&&(!n.subject||!l.subject||S.identity1C(gs(n.subject),l.subject)==='match'))).map(n=>n.id);
  res[k]={ms:Date.now()-t0,items,leads,detail,negRead,duplicates:Object.values(dupKeys).filter(n=>n>1).reduce((a,n)=>a+n-1,0),
   newFalsePositives:leads.filter(l=>l.cls==='lead_not_gold_value'&&!ng.some(n=>same(l,n))).length,meta:r.meta};}
 // Inventories (A: Step 1D-A; B/C: with the semantic-document contract), principal, page type, entities.
 const ivA=await documentInventory(D,{evaluation:EV,docTag:d.tag,category:d.category});const ivB=await documentInventory(D,{evaluation:EV,docTag:d.tag,category:d.category},{semantics:true});
 const sem=ivB.semantics;const html=ivA.html;
 const cfgAB=T.readingConfiguration265({plan}),cfgC=T.readingConfiguration265({plan,semantics:sem});
 const entityView=inv=>{const P=inv.entities.filter(e=>e.type==='product');
  const ents=productsAll.map(p=>({name:p.name,found:P.filter(e=>S.identity1C(gs(p.name,p.variants),e.canonical)==='match').map(e=>e.canonical)}));
  return {goldProducts:ents.length,found:ents.filter(e=>e.found.length).length,split:ents.filter(e=>e.found.length>1).length,productEntities:P.length,
   merges:P.filter(e=>matchAny(productsAll,e.canonical).length>1).map(e=>e.canonical),
   otherNamedProducts:P.filter(e=>!matchAny(productsAll,e.canonical).length&&matchAny(others,e.canonical).length).length,
   unknownEntities:P.filter(e=>!matchAny(productsAll,e.canonical).length&&!matchAny(others,e.canonical).length).map(e=>e.canonical),
   notProduct:inv.entities.filter(e=>['standard','instrument','other'].includes(e.type)).length,missing:ents.filter(e=>!e.found.length).map(e=>e.name)};};
 const x=T.testDocumentSubject268(SP.extractSpecifications245(html,ivA.url),'independent_original_test');
 const page0=x?.mainProduct?.name&&!x.mainProduct.ambiguous?{name:x.mainProduct.name,model:null}:null;const pA=T.planPageSubject272(page0,T.documentMentions272(html))?.name??null;
 const pv=d.principal?(d.products.find(p=>p.name===d.principal)?.variants??[]):[];
 const judge=n=>!n?(d.principal?'missed':'correct_none'):d.principal&&S.identity1C(gs(d.principal,pv),n)==='match'?'correct':'false_main_subject';
 const principal={gold:d.principal??null,A:pA,Aclass:judge(pA),B:sem.principal.name,Bclass:judge(sem.principal.name),conflicts:sem.principal.conflicts,pageTypeGold:d.pageType,pageTypeRead:sem.pageType.kind};
 // Qualitative: A with the Phase272 mentions and page subject; B (= C, the table reader reads no qualitative text) with the contract's mentions.
 let qual=null;const qg=G.qualitative.filter(q=>q.doc===d.tag);
 {const map=JSON.parse(readFileSync(resolve('evaluation/phase272/protocol-addendum.json'),'utf8')).codeToOutcomeMap[d.category]??{};
  const runQ=(mentions,page)=>Q.qualitativeObservations269(html,{plan,mentions,page}).observations.map(o=>({dimension:o.outcome==='taught_dimension'?o.dimension272:(map[o.outcome]??'code:'+o.outcome),direction:o.direction,subject:o.subject?.name??null}));
  const score=obs=>count(qg.map(q=>{const s=obs.filter(o=>o.dimension===q.dimension&&o.direction===q.direction);if(!s.length)return 'missing';
   return s.some(o=>o.subject&&q.subject&&S.identity1C(gs(q.subject),o.subject)==='match')?'correct':s.some(o=>o.subject)?'wrong_product':'unresolved';}));
  const unsupported=obs=>obs.filter(o=>!qg.some(q=>q.dimension===o.dimension&&q.direction===o.direction)).length;
  const wrongEmitted=obs=>obs.filter(o=>o.subject&&!matchAny([...productsAll,...others],o.subject).length).length;
  const mA=T.documentMentions272(html);const oA=runQ(mA,T.planPageSubject272(page0,mA));
  const mB=I.attributionMentions1D(ivB.inventory).map(m=>({name:m.name,model:m.model}));const oB=runQ(mB,sem.principal.name?{name:sem.principal.name,model:null}:null);
  qual={gold:qg.length,A:score(oA),B:score(oB),emittedA:oA.length,emittedB:oB.length,unsupportedA:unsupported(oA),unsupportedB:unsupported(oB),unknownSubjectA:wrongEmitted(oA),unknownSubjectB:wrongEmitted(oB)};}
 // Where C's missing values are (same classes as the Step 1D-A2 census).
 const numRe=v=>new RegExp('(?<![\\d.,])(?:'+[String(v),...(Math.abs(v)>=1000?[Number(v).toLocaleString('en-US')]:[])].map(z=>z.replace(/\./g,'\\.')).join('|')+')(?![\\d])');
 const noScript=html.replace(/<!--([\s\S]*?)-->/g,'').replace(/<(script|style|svg|template|noscript|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');const visible=noScript.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ');
 const missingC=g.filter(v=>res.C.items[v.id]==='missing').map(v=>{const re=numRe(v.value);const bi=ivA.blocks.findIndex(b=>re.test(b));
  return {id:v.id,unit:v.unit,goldLocation:v.location??null,where:bi<0?(re.test(visible)?'visible_not_in_reader_blocks':re.test(html)?'scripts_or_attributes_only':'absent_from_html'):sem.blocks[bi]?.cell?'table_cell':'prose'};});
 // Scorer limitation found before scoring: distinct gold products the frozen identity rule cannot tell apart.
 const indistinct=[];for(let i=0;i<productsAll.length;i++)for(let j=i+1;j<productsAll.length;j++)if(S.identity1C(gs(productsAll[i].name,productsAll[i].variants),productsAll[j].name)==='match')indistinct.push([productsAll[i].name,productsAll[j].name]);
 // Adjudication queue: every confidently wrong item or lead in any arm, and every declaration read (decided from the source, recorded separately).
 for(const [k] of ARMS){for(const v of g)if(wrong(res[k].items[v.id]))queue.push({key:`${k}:item:${v.id}`,arm:k,doc:d.tag,kind:'item',goldId:v.id,frozen:res[k].items[v.id],newVsA:k!=='A'&&!wrong(res.A.items[v.id])});
  for(const l of res[k].leads)if(['lead_wrong_product','lead_false_identity','lead_unsupported','lead_multi_overreach'].includes(l.cls))queue.push({key:`${k}:lead:${d.tag}:${l.i}`,arm:k,doc:d.tag,kind:'lead',frozen:l.cls,value:l.value,unit:l.unit,subject:l.subject,blockIndex:l.blockIndex,
   newVsA:k!=='A'&&!res.A.leads.some(a=>a.value===l.value&&a.unit===l.unit&&a.subject===l.subject&&a.cls===l.cls)});
  for(const n of res[k].negRead)queue.push({key:`${k}:neg:${n}`,arm:k,doc:d.tag,kind:'negative_control',negId:n,frozen:'declaration_read_as_result',newVsA:k!=='A'&&!res.A.negRead.includes(n)});}
 const tableLeads=res.C.leads.filter(l=>!res.B.leads.some(b=>b.blockIndex===l.blockIndex&&b.value===l.value&&b.unit===l.unit));
 const ents={A:entityView(ivA.inventory),B:entityView(ivB.inventory)};
 docsOut.push({doc:d.tag,category:d.category,publisher:d.publisher,pageType:d.pageType,gold:g.length,goldUncertain:g.filter(v=>v.uncertain).length,negativeControls:ng.length,
  readingConfiguration:{AB:cfgAB?T.readingIdentity265(cfgAB):null,C:cfgC?T.readingIdentity265(cfgC):null,planContentDigest:cfgAB?.plan.contentDigest??null},
  arms:Object.fromEntries(ARMS.map(([k])=>[k,{items:count(Object.values(res[k].items)),leads:count(res[k].leads.map(l=>l.cls)),leadCount:res[k].leads.length,ms:res[k].ms,
   negativeControlsRead:res[k].negRead.length,duplicates:res[k].duplicates,newFalsePositives:res[k].newFalsePositives,
   conditionMissing:Object.values(res[k].detail).filter(z=>z.conditionMissing).length,competitorToPrincipal:Object.values(res[k].detail).filter(z=>z.toPrincipal).length,
   unitMismatch:Object.values(res[k].detail).filter(z=>z.unitMismatch).length,uncertainItems:count(g.filter(v=>v.uncertain).map(v=>res[k].items[v.id]))}])),
  items:Object.fromEntries(ARMS.map(([k])=>[k,res[k].items])),
  regressionsVsA:Object.fromEntries(ARMS.map(([k])=>[k,g.filter(v=>good(res.A.items[v.id])&&!good(res[k].items[v.id])).map(v=>({id:v.id,to:res[k].items[v.id]}))])),
  newWrongVsA:Object.fromEntries(ARMS.map(([k])=>[k,g.filter(v=>wrong(res[k].items[v.id])&&!wrong(res.A.items[v.id])).map(v=>v.id)])),
  newNegativeVsA:Object.fromEntries(ARMS.map(([k])=>[k,res[k].negRead.filter(n=>!res.A.negRead.includes(n))])),
  tableReaderLeads:{total:tableLeads.length,byClass:count(tableLeads.map(l=>l.cls))},
  entities:ents,principal,qualitative:qual,missingC,scorerIndistinctGoldProducts:indistinct.length,
  cost:{semanticsMs:sem.stats.milliseconds,nodes:sem.stats.nodes,truncated:sem.stats.truncated,tables:sem.tables.length,tableModes:count(sem.tables.map(t=>t.phase245Mode)),htmlBytes:Buffer.byteLength(html)},
  _private:{res,indistinct}});}
store.close();
// Aggregations by document, publisher, category, page type and unique product.
const agg=(f)=>{const ds=docsOut.filter(f);const sum=(k,part)=>ds.reduce((o,d)=>{for(const [c,n] of Object.entries(d.arms[k][part]))o[c]=(o[c]??0)+n;return o;},{});
 const tot=(k,f2)=>ds.reduce((a,d)=>a+f2(d.arms[k]),0);
 return {documents:ds.length,gold:ds.reduce((a,d)=>a+d.gold,0),items:Object.fromEntries(ARMS.map(([k])=>[k,sum(k,'items')])),leads:Object.fromEntries(ARMS.map(([k])=>[k,sum(k,'leads')])),
  negativeControlsRead:Object.fromEntries(ARMS.map(([k])=>[k,tot(k,a=>a.negativeControlsRead)])),regressionsVsA:Object.fromEntries(ARMS.map(([k])=>[k,ds.flatMap(d=>d.regressionsVsA[k]).length])),
  newWrongVsA:Object.fromEntries(ARMS.map(([k])=>[k,ds.flatMap(d=>d.newWrongVsA[k]).length])),newNegativeVsA:Object.fromEntries(ARMS.map(([k])=>[k,ds.flatMap(d=>d.newNegativeVsA[k]).length]))};};
const groups=key=>Object.fromEntries([...new Set(docsOut.map(d=>d[key]))].map(v=>[v,agg(d=>d[key]===v)]));
const byProduct={};for(const d of G.documents)for(const p of d.products){const ids=gold.filter(v=>v.doc===d.tag&&v.subject===p.name).map(v=>v.id);if(!ids.length)continue;const dd=docsOut.find(z=>z.doc===d.tag);
 byProduct[d.tag+'#'+d.products.indexOf(p)]=Object.fromEntries(ARMS.map(([k])=>[k,count(ids.map(id=>dd.items[k][id]))]));}
const sumEnt=(k,f)=>docsOut.reduce((a,d)=>a+(Array.isArray(d.entities[k][f])?d.entities[k][f].length:d.entities[k][f]),0);
const summary={all:agg(()=>true),byPublisher:groups('publisher'),byCategory:groups('category'),byPageType:groups('pageType'),byProduct,
 principal:Object.fromEntries(['A','B'].map(k=>[k,count(docsOut.map(d=>d.principal[k+'class']))])),pageTypeAgreement:docsOut.filter(d=>d.principal.pageTypeGold===d.principal.pageTypeRead).length,
 entities:Object.fromEntries(['A','B'].map(k=>[k,Object.fromEntries(['goldProducts','found','split','productEntities','otherNamedProducts','notProduct','merges','unknownEntities','missing'].map(f=>[f,sumEnt(k,f)]))])),
 qualitative:docsOut.reduce((o,d)=>{if(!d.qualitative)return o;for(const k of ['A','B'])for(const [c,n] of Object.entries(d.qualitative[k]))o[k+':'+c]=(o[k+':'+c]??0)+n;
  for(const f of ['gold','emittedA','emittedB','unsupportedA','unsupportedB','unknownSubjectA','unknownSubjectB'])o[f]=(o[f]??0)+d.qualitative[f];return o;},{}),
 missingC:count(docsOut.flatMap(d=>d.missingC.map(m=>m.where))),tableReaderLeads:count(docsOut.flatMap(d=>Object.entries(d.tableReaderLeads.byClass).flatMap(([c,n])=>Array(n).fill(c)))),
 perArm:Object.fromEntries(ARMS.map(([k])=>[k,{duplicates:docsOut.reduce((a,d)=>a+d.arms[k].duplicates,0),newFalsePositives:docsOut.reduce((a,d)=>a+d.arms[k].newFalsePositives,0),
  conditionMissing:docsOut.reduce((a,d)=>a+d.arms[k].conditionMissing,0),competitorToPrincipal:docsOut.reduce((a,d)=>a+d.arms[k].competitorToPrincipal,0),unitMismatch:docsOut.reduce((a,d)=>a+d.arms[k].unitMismatch,0),
  msPerDocument:Math.round(docsOut.reduce((a,d)=>a+d.arms[k].ms,0)/Math.max(1,docsOut.length)),leads:docsOut.reduce((a,d)=>a+d.arms[k].leadCount,0)}])),
 scorerIndistinctGoldProducts:docsOut.reduce((a,d)=>a+d.scorerIndistinctGoldProducts,0),memory:{rssStartMb:Math.round(rss0/1e6),rssPeakMb:Math.round(rssPeak/1e6)},
 truncatedDocuments:docsOut.filter(d=>d.cost.truncated).length,adjudicationQueue:count(queue.map(q=>q.arm+':'+q.kind))};
const itemsAll=k=>Object.assign({},...docsOut.map(d=>d.items[k]));
const comparisons=Object.fromEntries([['A','B'],['A','C'],['B','C']].map(([f,t])=>[f+'->'+t,S.compareArms1C(itemsAll(f),itemsAll(t))]));
// Frozen-scorer gate values (the adjudicated gates are recorded separately; the decision uses both, as pre-registered).
const read=gold.filter(v=>ARMS.some(([k])=>itemsAll(k)[v.id]!=='missing')).length;const cA=Object.values(itemsAll('A')).filter(good).length,cC=Object.values(itemsAll('C')).filter(good).length;
const goodIn=(d,k)=>Object.values(d.items[k]).filter(good).length;
const frozenGates={G1_merges_B_minus_A:summary.entities.B.merges-summary.entities.A.merges,G1_new_false_identity_C:comparisons['A->C'].newConfidentlyWrong.filter(id=>itemsAll('C')[id]==='false_identity_match').length,
 G2_new_confidently_wrong_C:comparisons['A->C'].newConfidentlyWrong.length,G3_new_declarations_read_C:summary.all.newNegativeVsA.C,G4_false_principal_B:summary.principal.B.false_main_subject??0,
 G5_A_successes_lost_in_C:comparisons['A->C'].correctLost.length,G5_lost_to_missing_or_wrong:docsOut.flatMap(d=>d.regressionsVsA.C).filter(r=>r.to==='missing'||wrong(r.to)).length,
 primary:{successesA:cA,successesC:cC,delta:cC-cA,documentsGained:docsOut.filter(d=>goodIn(d,'C')>goodIn(d,'A')).map(d=>d.doc),
  publishersGained:[...new Set(docsOut.filter(d=>goodIn(d,'C')>goodIn(d,'A')).map(d=>d.publisher))],attributableRead:read,documents:docsOut.length}};
const meta={schema:'pee.step1d-b.run.v1',label,at:new Date().toISOString(),tier:'T2_untouched_first_run',protocolSha256:sha(readFileSync(join(PUBDIR,'protocol.json'))),goldSha256:GF.goldSha256,
 matchingRuleDigest:MATCHING_RULE_DIGEST,build:buildIdentity(D),arms:Object.fromEntries(ARMS),documents:G.documents.map(d=>({tag:d.tag,category:d.category,publisher:d.publisher,pageType:d.pageType})),
 gold:{values:gold.length,byStatus:count(gold.map(v=>v.subjectStatus)),uncertain:gold.filter(v=>v.uncertain).length,negativeControls:negs.length,qualitative:G.qualitative.length}};
mkdirSync(join(REPO,'private-eval',EV),{recursive:true});
writeFileSync(PRIV,JSON.stringify({...meta,summary,comparisons,frozenGates,adjudicationQueue:queue,documents:docsOut},null,1)+'\n');
writeFileSync(PUB,JSON.stringify({...meta,summary:{...summary,byProduct:undefined,byProductCount:Object.keys(byProduct).length},comparisons,frozenGates,
 adjudicationQueue:queue.map(q=>({key:q.key,arm:q.arm,doc:q.doc,kind:q.kind,frozen:q.frozen,newVsA:q.newVsA})),
 documents:docsOut.map(({_private,missingC,entities,principal,...d})=>({...d,missingC:missingC.map(m=>({id:m.id,unit:m.unit,goldLocation:m.goldLocation,where:m.where})),
  entities:Object.fromEntries(['A','B'].map(k=>[k,{...entities[k],merges:entities[k].merges.length,unknownEntities:entities[k].unknownEntities.length,missing:entities[k].missing.length}])),
  principal:{Aclass:principal.Aclass,Bclass:principal.Bclass,pageTypeGold:principal.pageTypeGold,pageTypeRead:principal.pageTypeRead,conflicts:principal.conflicts.length}}))},null,1)+'\n');
console.log(JSON.stringify({gold:meta.gold,all:summary.all,principal:summary.principal,entities:summary.entities,perArm:summary.perArm,frozenGates,
 comparisons:Object.fromEntries(Object.entries(comparisons).map(([k,v])=>[k,{newConfidentlyWrong:v.newConfidentlyWrong.length,correctLost:v.correctLost.length,correctGained:v.correctGained.length,wrongRemoved:v.wrongRemoved.length}]))},null,1));
