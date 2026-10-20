#!/usr/bin/env node
/**
 * R3-P stage 2: assemble the sealed needs material (evaluation/r3p/preregistration.json, needs-protocol.json).
 *
 *  node scripts/r3p-needs-assemble.mjs real-input --candidates c1.json[,c2.json] --screening s1.json[,s2.json,...]
 *     Writes private needs/requests-real.json: the screened real requests ({id,text} for the annotators, plus attribution
 *     kept for the merge). Real ids are "se-<site>-<questionId>". Only included questions, in screening order.
 *  node scripts/r3p-needs-assemble.mjs merge
 *     Writes private needs/requests.json (authored + real, with source, category stratum for real cases, attribution and
 *     licence) and needs/reference.json (reference-authored.json + reference-real.json, one entry per request), then
 *     evaluation/r3p/needs-freeze.json with the SHA-256 of both. Refuses if a request lacks a reference or vice versa.
 *
 * The main session runs this without reading request texts or references: it copies records and checks ids only.
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const PRIV=process.env.PEE_PRIVATE_EVAL_DIR??join(homedir(),'.local','share','product-evidence-engine','private-eval');
const N=join(PRIV,'r3p','needs');const E=new URL('../evaluation/r3p/',import.meta.url).pathname;
const [mode,...rest]=process.argv.slice(2);const arg=k=>{const i=rest.indexOf('--'+k);return i<0?null:rest[i+1];};
const read=f=>JSON.parse(readFileSync(f,'utf8'));const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const at=f=>f.startsWith('/')?f:join(N,f);
const realId=c=>`se-${String(c.site).replace(/\.stackexchange\.com$/,'')}-${c.questionId}`;

if(mode==='real-input'){
 const cands=new Map();for(const f of (arg('candidates')??'').split(',').filter(Boolean)){const c=read(at(f));for(const a of Object.values(c.strata??{}))for(const x of a)cands.set(String(x.questionId),x);}
 const out=[];const seen=new Set();
 for(const f of (arg('screening')??'').split(',').filter(Boolean)){const s=read(at(f));
  for(const d of s.decisions??[]){if(d.decision!=='include')continue;const q=String(d.questionId);if(seen.has(q))continue;seen.add(q);
   const c=cands.get(q);if(!c)throw Error('included question '+q+' is not among the candidates');
   if(!c.license)throw Error('included question '+q+' has no licence');
   out.push({id:realId(c),text:c.text,stratum:c.stratum,attribution:{site:c.site,questionId:c.questionId,link:c.link,author:c.author,license:c.license,created:c.created}});}}
 const dest=join(N,'requests-real.json');if(existsSync(dest)&&!rest.includes('--force'))throw Error(dest+' exists (use --force to rewrite before sealing)');
 writeFileSync(dest,JSON.stringify({schema:'pee.r3p.needs-requests-real.v1',source:'Stack Exchange API, CC BY-SA (attribution per case)',requests:out},null,1));
 const by={};for(const r of out)by[r.stratum]=(by[r.stratum]??0)+1;console.log(JSON.stringify({written:dest,count:out.length,byStratum:by}));
}
else if(mode==='merge'){
 const authored=read(join(N,'authored.json')).requests;const real=existsSync(join(N,'requests-real.json'))?read(join(N,'requests-real.json')).requests:[];
 const requests=[...authored.map(r=>({id:r.id,source:'authored',text:r.text})),
  ...real.map(r=>({id:r.id,source:'real',stratum:r.stratum,text:r.text,attribution:r.attribution}))];
 const refs=[...read(join(N,'reference-authored.json')).requests,...(real.length?read(join(N,'reference-real.json')).requests:[])];
 const ids=new Set(requests.map(r=>r.id)),rids=new Set(refs.map(r=>r.id));
 const missing=[...ids].filter(i=>!rids.has(i)),orphan=[...rids].filter(i=>!ids.has(i));
 if(missing.length||orphan.length||ids.size!==requests.length||rids.size!==refs.length)throw Error(JSON.stringify({missing,orphan,dupRequests:requests.length-ids.size,dupRefs:refs.length-rids.size}));
 const rq=join(N,'requests.json'),rf=join(N,'reference.json');
 for(const f of [rq,rf])if(existsSync(f)&&!rest.includes('--force'))throw Error(f+' exists (use --force to rewrite before sealing)');
 writeFileSync(rq,JSON.stringify({schema:'pee.r3p.needs-requests.v1',requests},null,1));
 writeFileSync(rf,JSON.stringify({schema:'pee.r3p.needs-reference.v1',merged:['reference-authored.json',...(real.length?['reference-real.json']:[])],requests:refs},null,1));
 const counts={requests:requests.length,authored:authored.length,real:real.length};
 const fz={schema:'pee.r3p.needs-freeze.v1',sealedAt:new Date().toISOString(),
  rule:'requests and the merged blind reference are hashed and committed before any PEE run on the material (preregistration.json)',
  counts,files:{'requests.json':sha(rq),'reference.json':sha(rf)}};
 writeFileSync(join(E,'needs-freeze.json'),JSON.stringify(fz,null,1)+'\n');console.log(JSON.stringify(fz));
}
else{console.error('usage: r3p-needs-assemble.mjs real-input --candidates F[,F] --screening F[,F] | merge [--force]');process.exit(2);}
