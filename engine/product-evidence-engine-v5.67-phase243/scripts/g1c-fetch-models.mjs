#!/usr/bin/env node
/** G1c (owner authorisation 2026-10-21, verbatim owner-g1c-authorisation-2026-10-21.md): the one authorised network read for
 * the local sentence-embedding models. Downloads the pinned files of each model from its official Hugging Face repository at
 * a fixed revision into $PEE_MODELS_DIR (default ~/.local/share/product-evidence-engine/models), then records or verifies
 * SHA-256 in resources/semantic-retrieval/models.v1.json. With --verify only, no network is used. Weights are never
 * committed. No user data or knowledge content is ever sent anywhere: this script only downloads.
 * Usage: node scripts/g1c-fetch-models.mjs [--verify] */
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';import {join,dirname} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';
const MANIFEST=new URL('../resources/semantic-retrieval/models.v1.json',import.meta.url).pathname;
const DIR=process.env.PEE_MODELS_DIR??join(homedir(),'.local/share/product-evidence-engine/models');
const MODELS=[
 {id:'bge-small-en-v1.5',repo:'BAAI/bge-small-en-v1.5',revision:'5c38ec7c405ec4b44b94cc5a9bb96e735b38267a',license:'MIT',dim:384,pooling:'cls',
  queryPrefix:'Represent this sentence for searching relevant passages: ',files:['onnx/model.onnx','vocab.txt','config.json','tokenizer_config.json']},
 {id:'all-MiniLM-L6-v2',repo:'sentence-transformers/all-MiniLM-L6-v2',revision:null,license:'Apache-2.0',dim:384,pooling:'mean',queryPrefix:'',files:['onnx/model.onnx','vocab.txt','config.json','tokenizer_config.json']}];
const verifyOnly=process.argv.includes('--verify');const sha=b=>createHash('sha256').update(b).digest('hex');
const prev=existsSync(MANIFEST)?JSON.parse(readFileSync(MANIFEST,'utf8')):null;const out={schema:'pee.g1c.models.v1',runtime:{package:'onnxruntime-node',version:'1.20.1',license:'MIT'},models:[]};
for(const m of MODELS){let rev=m.revision??prev?.models.find(x=>x.id===m.id)?.revision;
 if(!rev){if(verifyOnly)throw Error('no revision for '+m.id);const r=await fetch(`https://huggingface.co/api/models/${m.repo}`);rev=(await r.json()).sha;}
 const base=join(DIR,`${m.id}@${rev}`);const files={};
 for(const f of m.files){const p=join(base,f);
  if(!existsSync(p)){if(verifyOnly)throw Error('missing '+p);const r=await fetch(`https://huggingface.co/${m.repo}/resolve/${rev}/${f}`);if(!r.ok)throw Error(`${f}: HTTP ${r.status}`);
   mkdirSync(dirname(p),{recursive:true});writeFileSync(p,Buffer.from(await r.arrayBuffer()));}
  const h=sha(readFileSync(p));const want=prev?.models.find(x=>x.id===m.id&&x.revision===rev)?.files?.[f]?.sha256;
  if(want&&want!==h)throw Error(`${m.id} ${f}: sha256 differs from the manifest`);files[f]={sha256:h,bytes:readFileSync(p).length};}
 out.models.push({id:m.id,repo:m.repo,revision:rev,license:m.license,dim:m.dim,pooling:m.pooling,queryPrefix:m.queryPrefix,source:`https://huggingface.co/${m.repo}`,files});}
if(!verifyOnly)writeFileSync(MANIFEST,JSON.stringify(out,null,1)+'\n');console.log(JSON.stringify(out.models.map(m=>({id:m.id,revision:m.revision,mb:Math.round(Object.values(m.files).reduce((a,f)=>a+f.bytes,0)/1e6)}))));
