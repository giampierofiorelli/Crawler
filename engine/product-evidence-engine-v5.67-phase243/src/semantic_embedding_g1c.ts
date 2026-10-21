/** G1c (owner authorisation 2026-10-21, verbatim in .claude/skills/pee-guided-learning/references/
 * owner-g1c-authorisation-2026-10-21.md). Local, offline sentence embeddings.
 *
 * A pretrained sentence-embedding model (pinned in resources/semantic-retrieval/models.v1.json: official repository,
 * revision, licence, SHA-256 of every file) runs on the CPU through onnxruntime-node (MIT). Nothing is sent anywhere: the
 * weights are read from $PEE_MODELS_DIR, downloaded once by scripts/g1c-fetch-models.mjs.
 *
 * The tokenizer is the BERT WordPiece algorithm (uncased): basic tokenisation (lower case, accents stripped, punctuation
 * split), then greedy longest-match-first sub-words with '##'. Pooling follows the model card (CLS for bge, mean for
 * MiniLM); vectors are L2-normalised, so a dot product is the cosine. A similarity is a ranking signal, never a
 * probability of correctness.
 *
 * Callers: src/semantic_retrieval_g1c.ts, scripts/g1c-*.mjs, tests (tests inject a deterministic embedder and never need
 * the weights). */
import {readFileSync,existsSync} from 'node:fs';import {join} from 'node:path';import {homedir} from 'node:os';import {createHash} from 'node:crypto';

export interface ModelSpecG1c {id:string;repo:string;revision:string;license:string;dim:number;pooling:'cls'|'mean';queryPrefix:string;
 files:Record<string,{sha256:string;bytes:number}>}
export interface EmbedderG1c {modelId:string;modelRevision:string;dim:number;
 /** queries may carry the model's query instruction; passages never do */
 embed(texts:readonly string[],kind:'query'|'passage'):Promise<Float32Array[]>}

export function modelManifestG1c():ModelSpecG1c[]{
 return (JSON.parse(readFileSync(new URL('../../resources/semantic-retrieval/models.v1.json',import.meta.url),'utf8')) as {models:ModelSpecG1c[]}).models;}
export const modelsDirG1c=()=>process.env.PEE_MODELS_DIR??join(homedir(),'.local/share/product-evidence-engine/models');

// ---- WordPiece (BERT, uncased)
const isPunct=(c:string)=>/[\p{P}\p{S}]/u.test(c);
function basicTokens(text:string):string[]{
 const t=text.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu,'');const out:string[]=[];let cur='';
 for(const ch of t){if(/\s/.test(ch)){if(cur)out.push(cur);cur='';}else if(isPunct(ch)){if(cur)out.push(cur);cur='';out.push(ch);}else cur+=ch;}
 if(cur)out.push(cur);return out;
}
export class WordPieceG1c {private vocab:Map<string,number>;constructor(vocabText:string){this.vocab=new Map(vocabText.split('\n').map((w,i)=>[w.replace(/\r$/,''),i] as [string,number]).filter(([w])=>w.length));}
 id(t:string){return this.vocab.get(t)??this.vocab.get('[UNK]')!;}
 encode(text:string,maxLen=256):number[]{const ids=[this.id('[CLS]')];
  for(const w of basicTokens(text)){if(w.length>100){ids.push(this.id('[UNK]'));continue;}
   let start=0;const sub:number[]=[];let bad=false;
   while(start<w.length){let end=w.length;let cur:number|undefined;
    while(start<end){const piece=(start>0?'##':'')+w.slice(start,end);if(this.vocab.has(piece)){cur=this.vocab.get(piece);break;}end--;}
    if(cur===undefined){bad=true;break;}sub.push(cur);start=end;}
   ids.push(...(bad?[this.id('[UNK]')]:sub));if(ids.length>=maxLen-1)break;}
  return [...ids.slice(0,maxLen-1),this.id('[SEP]')];}
}

/** Load a pinned model from disk, verifying each file's SHA-256 against the manifest before use. */
export async function loadEmbedderG1c(modelId='bge-small-en-v1.5',o:{batch?:number;maxLen?:number}={}):Promise<EmbedderG1c>{
 const spec=modelManifestG1c().find(m=>m.id===modelId);if(!spec)throw Error('g1c_unknown_model:'+modelId);
 const base=join(modelsDirG1c(),`${spec.id}@${spec.revision}`);
 for(const [f,{sha256}] of Object.entries(spec.files)){const p=join(base,f);if(!existsSync(p))throw Error('g1c_model_missing:'+p+' (run scripts/g1c-fetch-models.mjs)');
  if(createHash('sha256').update(readFileSync(p)).digest('hex')!==sha256)throw Error('g1c_model_hash_mismatch:'+f);}
 // the runtime is an optional, separately pinned dependency (package.json devDependencies); loaded only when a model is used
 const RUNTIME='onnxruntime-node';const ort=await import(RUNTIME) as {InferenceSession:{create(p:string,o:object):Promise<{run(f:object):Promise<Record<string,{data:unknown}>>}>};Tensor:new(t:string,d:BigInt64Array,s:number[])=>object};
 const session=await ort.InferenceSession.create(join(base,'onnx/model.onnx'),{intraOpNumThreads:2});
 const tok=new WordPieceG1c(readFileSync(join(base,'vocab.txt'),'utf8'));const batch=o.batch??16,maxLen=o.maxLen??256;
 return {modelId:spec.id,modelRevision:spec.revision,dim:spec.dim,async embed(texts,kind){const out:Float32Array[]=[];
  for(let b=0;b<texts.length;b+=batch){const chunk=texts.slice(b,b+batch).map(t=>tok.encode((kind==='query'?spec.queryPrefix:'')+t,maxLen));
   const L=Math.max(...chunk.map(c=>c.length));const n=chunk.length;
   const ids=new BigInt64Array(n*L),mask=new BigInt64Array(n*L),types=new BigInt64Array(n*L);
   chunk.forEach((c,i)=>c.forEach((x,j)=>{ids[i*L+j]=BigInt(x);mask[i*L+j]=1n;}));
   const r=await session.run({input_ids:new ort.Tensor('int64',ids,[n,L]),attention_mask:new ort.Tensor('int64',mask,[n,L]),token_type_ids:new ort.Tensor('int64',types,[n,L])});
   const h=r.last_hidden_state.data as Float32Array;const D=spec.dim;
   for(let i=0;i<n;i++){const v=new Float32Array(D);
    if(spec.pooling==='cls')for(let d=0;d<D;d++)v[d]=h[(i*L)*D+d];
    else{const len=chunk[i].length;for(let j=0;j<len;j++)for(let d=0;d<D;d++)v[d]+=h[(i*L+j)*D+d];for(let d=0;d<D;d++)v[d]/=len;}
    let s=0;for(let d=0;d<D;d++)s+=v[d]*v[d];s=Math.sqrt(s)||1;for(let d=0;d<D;d++)v[d]/=s;out.push(v);}}
  return out;}};
}
export const dotG1c=(a:Float32Array,b:Float32Array)=>{let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;};
