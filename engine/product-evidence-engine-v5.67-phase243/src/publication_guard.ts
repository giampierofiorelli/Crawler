/** Publication guard (2026-10-16 engineering correction; S23 / principle 9). The public repository must never receive a
 * retained declaration value bound to its product (pee249-factual-observations-v1 is private-only). Commit f388d3a did
 * exactly that inside an evaluation gold file, while every test passed. This guard checks what is ADDED by commits,
 * not the working tree, against the private store's retained declarations.
 *
 * Rule (deliberately narrow, so public product information is not blocked): an added line is a finding when, within a
 * window of nearby added lines of the same file, it carries
 *   1. a distinctive name bigram of a stored product (a bigram shared by at most MAX_SHARE products, not made only of
 *      generic words), and
 *   2. one of THAT product's retained declared values written with its unit or currency ("1.4 L", "£599"), or a
 *      two-decimal price ("399.95"). Bare numbers (counts, years, hash fragments) never match.
 * Product names, user-stated limits, synthetic fixtures and values without their product pass. Findings never contain
 * the value or the line: only file, line number, product id and a value digest, so the report itself is publishable.
 */
import {createHash} from 'node:crypto';

export interface RetainedDeclaration {productId:string;productName:string;rawValue:string}
export interface AddedLine {file:string;line:number;text:string;commit?:string}
export interface PublicationFinding {commit:string|null;file:string;line:number;productId:string;rule:'product_bound_declared_value'|'private_store_artifact';valueDigest:string}
export interface PublicationIndex {bigrams:Map<string,Set<string>>;numbers:Map<string,Set<string>>;
 /** Exact multi-word product names, matched as a token sequence (names made only of generic words have no bigram). */
 names:Map<string,Set<string>>}

const GENERIC=new Set(['the','and','for','with','of','a','an','in','to','by','x','machine','machines','coffee','espresso','air','fryer','fryers','kettle',
 'toaster','blender','oven','microwave','litre','litres','liter','l','ml','w','kg','g','cm','mm','steel','black','white','silver','grey','gray','pro',
 'plus','new','automatic','electric','digital','smart','mini','max','series','model','edition','set','pack','with','and','uk','eu']);
const MAX_SHARE=3,WINDOW=3;
const tokens=(s:string)=>s.normalize('NFKD').toLowerCase().replace(/[̀-ͯ]/g,'').split(/[^a-z0-9]+/).filter(Boolean);
/** A value is its number with its unit ("1.4|l", "800|ml", "599|gbp"); prices also as "N|price" when written with two
 * decimals. A bare number (a count, a year, a hash fragment) never matches. */
const UNIT:Readonly<Record<string,string>>={l:'l',ltr:'l',litre:'l',litres:'l',liter:'l',liters:'l',ml:'ml',cl:'cl',w:'w',watt:'w',watts:'w',kw:'kw',
 kg:'kg',g:'g',grams:'g',gram:'g',lb:'lb',lbs:'lb',cm:'cm',mm:'mm',m:'m',in:'in',inch:'in',inches:'in',bar:'bar',db:'db',dba:'db',v:'v',mah:'mah',
 h:'h',hours:'h',hrs:'h',min:'min',mins:'min',minutes:'min',gbp:'gbp','£':'gbp',usd:'usd','$':'usd',eur:'eur','€':'eur',cad:'cad',aud:'aud',cc:'cc'};
const CURRENCY=new Set(['gbp','usd','eur','cad','aud']);
function valueKeys(s:string):string[]{
 const out:string[]=[];const t=s.toLowerCase().replace(/,(?=\d{3}\b)/g,'');
 for(const m of t.matchAll(/([£$€])\s*(\d+(?:\.\d+)?)/g))out.push(`${Number(m[2])}|${UNIT[m[1]]}`,...(/\.\d\d$/.test(m[2])?[`${Number(m[2])}|price`]:[]));
 for(const m of t.matchAll(/(?<![\d.])(\d+(?:\.\d+)?)\s*([a-z£$€]+)/g)){const u=UNIT[m[2]];if(u){out.push(`${Number(m[1])}|${u}`);if(CURRENCY.has(u)&&/\.\d\d$/.test(m[1]))out.push(`${Number(m[1])}|price`);}}
 return out;
}
/** In a public line: number+unit, currency+number, and two-decimal numbers as possible prices. */
function lineKeys(s:string):string[]{
 // URLs are addresses (slugs often repeat a product name), not disclosures of a retained value.
 s=s.replace(/https?:\/\/\S+/g,' ');
 const out=valueKeys(s);
 for(const m of s.matchAll(/(?<![\d.])(\d+\.\d\d)(?![\d.])/g))out.push(`${Number(m[1])}|price`);
 return out;
}
const digest=(s:string)=>createHash('sha256').update(s).digest('hex').slice(0,12);

export function buildPublicationIndex(rows:readonly RetainedDeclaration[]):PublicationIndex{
 const bigrams=new Map<string,Set<string>>(),numbers=new Map<string,Set<string>>(),names=new Map<string,Set<string>>();
 for(const r of rows){
  const t=tokens(r.productName);
  if(t.length>=2){const nm=' '+t.join(' ')+' ';(names.get(nm)??names.set(nm,new Set()).get(nm)!).add(r.productId);}
  for(let i=0;i+1<t.length;i++){if(GENERIC.has(t[i])&&GENERIC.has(t[i+1]))continue;const b=t[i]+' '+t[i+1];
   (bigrams.get(b)??bigrams.set(b,new Set()).get(b)!).add(r.productId);}
  const ns=numbers.get(r.productId)??numbers.set(r.productId,new Set()).get(r.productId)!;
  // A value printed in the product's own public name ("20 Litre Microwave Oven") discloses nothing retained.
  const inName=new Set(valueKeys(r.productName));for(const k of valueKeys(r.rawValue))if(!inName.has(k))ns.add(k);
 }
 for(const [b,ps] of [...bigrams])if(ps.size>MAX_SHARE)bigrams.delete(b);
 for(const [n,ps] of [...names])if(ps.size>MAX_SHARE)names.delete(n);
 return {bigrams,numbers,names};
}

/** Scan added lines (grouped by commit and file). A line marked `pee-publication: allow` is skipped (an explicit,
 * greppable exception for reviewed public facts). */
export function scanAddedLines(lines:readonly AddedLine[],idx:PublicationIndex):PublicationFinding[]{
 const out:PublicationFinding[]=[];const seen=new Set<string>();
 const groups=new Map<string,AddedLine[]>();
 for(const l of lines){const k=(l.commit??'')+'\0'+l.file;(groups.get(k)??groups.set(k,[]).get(k)!).push(l);}
 for(const g of groups.values()){
  g.sort((a,b)=>a.line-b.line);
  const prod=g.map(l=>{const t=tokens(l.text);const ps=new Set<string>();
   for(let i=0;i+1<t.length;i++)for(const p of idx.bigrams.get(t[i]+' '+t[i+1])??[])ps.add(p);
   const seq=' '+t.join(' ')+' ';for(const [n,qs] of idx.names)if(seq.includes(n))for(const p of qs)ps.add(p);return ps;});
  g.forEach((l,i)=>{
   if(/pee-publication:\s*allow/.test(l.text))return;
   const near=new Set<string>();for(let j=Math.max(0,i-WINDOW);j<=Math.min(g.length-1,i+WINDOW);j++)
    if(Math.abs(g[j].line-l.line)<=WINDOW)for(const p of prod[j])near.add(p);
   if(!near.size)return;
   for(const n of lineKeys(l.text))for(const p of near)if(idx.numbers.get(p)?.has(n)){
    const k=`${l.commit}|${l.file}|${l.line}|${p}`;if(seen.has(k))continue;seen.add(k);
    out.push({commit:l.commit??null,file:l.file,line:l.line,productId:p,rule:'product_bound_declared_value',valueDigest:digest(p+'|'+n)});}
  });
 }
 return out;
}
/** Private artefacts never belong in the public repository, whatever their content. */
export function privateArtifactFindings(files:readonly {file:string;commit?:string}[]):PublicationFinding[]{
 return files.filter(f=>/(?:^|\/)(?:private-eval\/|pee-knowledge\/)|\.sqlite(?:-wal|-shm)?$|-full\.json$|requests-with-values\.json$/.test(f.file))
  .map(f=>({commit:f.commit??null,file:f.file,line:0,productId:'',rule:'private_store_artifact' as const,valueDigest:''}));
}
/** Parse `git log -p --unified=0` / `git diff --unified=0` output into added lines. */
export function addedLinesFromDiff(diff:string):{lines:AddedLine[];files:{file:string;commit?:string}[]}{
 const lines:AddedLine[]=[];const files:{file:string;commit?:string}[]=[];let commit:string|undefined;let file='';let n=0;
 for(const raw of diff.split('\n')){
  const c=/^commit ([0-9a-f]{7,40})/.exec(raw);if(c){commit=c[1];continue;}
  const f=/^\+\+\+ b\/(.+)$/.exec(raw);if(f){file=f[1];files.push({file,commit});continue;}
  if(raw.startsWith('+++ /dev/null')){file='';continue;}
  const h=/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);if(h){n=Number(h[1]);continue;}
  if(file&&raw.startsWith('+')&&!raw.startsWith('+++')){lines.push({file,line:n,text:raw.slice(1),commit});n++;}
 }
 return {lines,files};
}
