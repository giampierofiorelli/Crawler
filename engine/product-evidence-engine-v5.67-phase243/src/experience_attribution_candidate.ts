/** Continuous-learning Step 1C — constrained attribution candidate (EVALUATION ONLY; not used by any production path).
 *
 * Re-decides the subject of each measurement lead from local structural and grammatical evidence, in fixed precedence:
 *  1. explicit local structure: a comparison-table column (R1a); a value in parentheses opened directly after a product
 *     (R1b); a value owned by an unnamed referent such as "its predecessor's" (R1d, unresolved); a possessive
 *     "<product>'s … <value>" (R1c); "<product> and its … <value>" (R1f);
 *  2. a documented multi-subject statement: "both" with exactly two named products in the sentence (R1e); otherwise it
 *     stays unresolved with its candidate subjects;
 *  3. an unambiguous grammatical subject: the only product in the value's clause that is not in an object position
 *     ("than", "against", "beaten by", "unlike", prepositions, coordination with an object), near the clause head (R2);
 *     an elided subject inherits the previous clause's subject (R2b); a pronoun subject takes the subject of the previous
 *     sentence in the same block (R3c);
 *  4. no competing local evidence (every named product is an object, or none is named): the section heading's single
 *     product (R3b), else the document's main product when the section heading names no product (R3a, the weakest rule);
 *  5. otherwise explicit unresolved identity, with candidate subjects, the reason and the evidence that would resolve it.
 * Never nearest-name binding as such, never identity from title or name similarity alone, never "both" without two named
 * referents. Deterministic, no dependencies, no category vocabulary. Pure: callers supply the reader's blocks and mentions.
 */

/** `model` is the surface matched in the text; `name` the identity reported. Step 1D-A (optional, additive): `key` groups several
 * surfaces of one entity (a document inventory supplies them); without it every model is its own entity, as in Step 1C. */
export interface Mention1C {name:string;model:string;key?:string}
export interface Lead1C {value:number;unit:string;blockIndex:number;valueOffset?:number|null;subject?:{name:string}|null}
export type Rule1C='R1a_table_column'|'R1a_table_cell_ambiguous'|'R1b_parenthetical'|'R1c_possessive'|'R1d_unnamed_referent'|'R1e_multi_subject'
 |'R1e_multi_subject_unidentified'|'R1f_coordinated_possessive'|'R2_grammatical_subject'|'R2_several_subject_candidates'|'R2b_elided_subject'
 |'R3a_document_main_product'|'R3b_section_heading'|'R3c_pronoun_antecedent'|'R4_no_subject_evidence'|'R0_unlocated';
export interface Decision1C {status:'attributed'|'multi_subject'|'unresolved';subject:string|null;subjects?:string[];rule:Rule1C;
 /** Provisional-observation fields (evaluation only): who it could be, why it is unresolved, what would resolve it. */
 candidates?:string[];reason?:string;neededEvidence?:string;
 location:{blockIndex:number;sentenceIndex:number|null;valueOffset:number|null}}
export interface Context1C {
 /** The reader's block list (textBlocks225 with maxBlocks 1500, which drops th cells) and the matching tags. */
 blocks:readonly string[];tags:readonly string[];mentions:readonly Mention1C[];page:{name:string}|null;
 /** comparisonCells272: cell text -> column product, or null when the text occurs in several columns. */
 cells:ReadonlyMap<string,{name:string}|null>;
 /** Step 1D-A (optional): section scope from a document inventory's heading hierarchy; replaces the nearest-heading rule. */
 section?:(blockIndex:number)=>{subject:{name:string}|null;competing:number};
 /** Step 1D-A2 (optional): the product of a table cell from its own row/column header through the Phase245 grid
  * (src/document_semantics.ts cellProducts1D2); undefined when the block is not such a cell. Used before `cells`. */
 cellOf?:(blockIndex:number)=>{subject:{name:string}|null}|undefined;
}

const esc=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const TECH_CODE=/^(?:\d+[kK]|\d+(?:hz|p|fps|w|in|mm)|HDR\d*|HDMI\d*|USB\d*|PM\d+(?:\.\d)?|UHD\d*)$/i;
/** Generic technical standards and grades that the mention detector reads as "brand + code" (HEPA 14, MERV 13, ISO 16890). */
const STANDARD=/^(?:HEPA|MERV|ISO|IEC|EN|ANSI|AHAM|CADR|HDMI|USB|HDR|IP|DIN|BS|ENERGY|Wi-?Fi|Bluetooth|Dolby|DTS|PM)$/i;
const NOT_LEAD=/^(?:The|A|An|I|We|My|Our|Its|This|That|Best|Review|Tested|And|With|Both|Than|Unlike|Like|Versus|Vs)$/;
/** Mention preparation: drop technical codes that are not models (4K, 120Hz, PM2.5) and restore a name the mention
 * detector truncated ("Quiet BP06" for "Dyson Big+Quiet BP06"): when the detected brand word is also used as an ordinary
 * lower-case word, the longest capitalised span ending in the code and containing that word replaces it. */
export function prepareMentions1C(mentions:readonly Mention1C[],text:string):Mention1C[]{
 const out:Mention1C[]=[];
 for(const m of mentions){const first=m.name.split(/\s+/)[0];if(TECH_CODE.test(m.model)||STANDARD.test(first))continue;
  const lowerUse=new RegExp('\\b'+esc(first.toLowerCase())+'\\b').test(text);
  const spans=lowerUse?[...text.matchAll(new RegExp('((?:[A-Z][\\w+&.\\-]*\\s+){1,3})'+esc(m.model)+'\\b','g'))]
   .map(x=>{const t=x[1].trim().split(/\s+/);while(t.length&&NOT_LEAD.test(t[0]))t.shift();return t.join(' ');})
   .filter(s=>s.toLowerCase().includes(first.toLowerCase())):[];
  const best=spans.sort((a,b)=>b.length-a.length)[0];
  out.push(best&&best.length>first.length?{name:best+' '+m.model,model:m.model}:m);}
 return out;
}
const SENT=/(?<=[.!?])\s+(?=[A-Z£“"])/;
const CLAUSE=/;|\s+(?:but|while|whereas|although|though)\s+|,\s+(?:and|but|so|yet)\s+|\s+[—–]\s+/gi;
const OBJECT=/\b(?:than|against|over|versus|vs\.?|like|unlike|compared\s+(?:to|with)|by|beat|beats|beating|outperforms?|outperforming|outshines?|matches|matching|trails?|behind|ahead\s+of|of|with|to|from|as|for|on|in|at|into)(?:\s+[a-z][\w-]*){0,2}\s*$/i;
const COORD=/\b(?:and|or|nor)\s*$/i;
const DETS=/(?:\b(?:the|a|an|its|their|both|either|each|pricier|cheaper|older|newer|rival|competing)\s+)+$/i;
const UNNAMED=/\b(?:its|their|the)\s+(?:\w+\s+)?(?:predecessor|successor|rival|competitor|sibling|stablemate|older\s+model|newer\s+model|cheaper\s+model|pricier\s+model|other\s+model)(?:['’]s)?\s+(?:[\w-]+\s+){0,3}$/i;
const ELIDED=/^\s*(?:also\s+|even\s+|still\s+|then\s+)?(?:has|have|had|is|was|were|are|delivers?|delivered|reach(?:es|ed)?|achiev(?:es|ed)|measur(?:es|ed)|record(?:s|ed)|hits?|manag(?:es|ed)|scor(?:es|ed)|performs?|offers?|produc(?:es|ed)|uses?|used|draws?|drew|consumes?|consumed|took|takes|needed|needs|registers?|registered|returns?|returned|clocks?|clocked|peaks?|peaked|tops?|topped)\b/i;
const PRONOUN=/^\s*(?:it|it['’]s|this\s+(?:one|model|unit|\w+))\b/i;

interface Occ {m:Mention1C;i:number;len:number;object:boolean;lead:string}
function occurrences(text:string,mentions:readonly Mention1C[]):Occ[]{
 const occ:{m:Mention1C;i:number;len:number}[]=[];
 for(const m of mentions)for(const x of text.matchAll(new RegExp('\\b'+esc(m.model)+'\\b','g')))occ.push({m,i:x.index!,len:x[0].length});
 // A standalone brand ("the LG's 632 nits", "the Panasonic (12.7ms)") stands for a product only when exactly one document
 // product carries that brand; a brand shared by several products (or followed by a model token) is not an alias.
 const brands=new Map<string,Mention1C[]>();for(const m of mentions){const b=m.name.split(/\s+/)[0];if(b!==m.model&&!(brands.get(b)??[]).some(x=>K(x)===K(m)))brands.set(b,[...(brands.get(b)??[]),m]);}
 for(const [b,ms] of brands)if(ms.length===1)for(const x of text.matchAll(new RegExp('\\b'+esc(b)+'\\b(?!\\s+[A-Z0-9])','g')))occ.push({m:ms[0],i:x.index!,len:x[0].length});
 occ.sort((a,b)=>a.i-b.i||b.len-a.len);const out:Occ[]=[];
 // With entity keys, a surface nested inside a longer surface of the same entity ("Airmega 100" in "Coway Airmega 100") is one occurrence.
 for(let j=occ.length-1;j>=0;j--){const o=occ[j];if(o.m.key&&occ.some((p,q)=>q!==j&&K(p.m)===K(o.m)&&p.i<=o.i&&p.i+p.len>=o.i+o.len&&p.len>o.len))occ.splice(j,1);}
 for(const o of occ){let pre=text.slice(0,o.i);
  // Strip the product's own name tokens ("the LG " before "B5") and determiners, then read the governing word.
  for(const t of o.m.name.split(/\s+/).filter(t=>t!==o.m.model).reverse())pre=pre.replace(new RegExp(esc(t)+'\\s*$','i'),'');
  pre=pre.replace(DETS,'');const prev=out[out.length-1];
  // Coordination inherits the previous product's role; with no earlier product in the span, a comparison word shortly
  // before ("like the Blueair Signature or the Winix 9800") makes the coordinated product an object too.
  const coordObject=COORD.test(pre)&&(prev?prev.object:/\b(?:than|like|unlike|versus|vs\.?|compared|against|over)\b[^.;]{0,60}$/i.test(pre));
  out.push({...o,object:OBJECT.test(pre)||coordObject,lead:pre});}
 return out;
}
const K=(m:Mention1C)=>m.key??m.model;
const distinct=(o:readonly Occ[])=>[...new Map(o.map(x=>[K(x.m),x.m])).values()];
/** Subject of a span: the only product not in an object position, preceded by at most 12 words in the span. */
function subjectOf(span:string,mentions:readonly Mention1C[]):Mention1C|null{
 const s=occurrences(span,mentions).filter(o=>!o.object);if(distinct(s).length!==1)return null;
 return s[0].lead.trim().split(/\s+/).filter(Boolean).length<=12?s[0].m:null;
}
function locate(block:string,l:Lead1C):number|null{
 const num=(s:string)=>Number(s.replace(/,/g,''));
 if(l.valueOffset!=null){const m=/^[\d.,]+/.exec(block.slice(l.valueOffset));if(m&&num(m[0].replace(/[.,]$/,''))===l.value)return l.valueOffset;}
 for(const m of block.matchAll(/\d[\d,]*(?:\.\d+)?/g))if(num(m[0])===l.value)return m.index!;
 return null;
}
/** The nearest preceding h1-h3 heading: its subject (the only non-object product, in a heading without comparison
 * wording), and whether it names any product in a non-object position. */
function section(ctx:Context1C,bi:number):{subject:{name:string}|null;competing:number}{
 if(ctx.section)return ctx.section(bi);
 for(let i=bi-1;i>=0;i--)if(/^h[1-3]$/.test(ctx.tags[i]??'')){const h=ctx.blocks[i];const occ=occurrences(h,ctx.mentions);const non=distinct(occ.filter(o=>!o.object));
  const comparative=/\b(?:vs\.?|versus|than|compared|against)\b/i.test(h);
  return {subject:non.length===1&&!comparative?non[0]:null,competing:non.length};}
 return {subject:null,competing:0};
}

/** A page "product" that reads as a sentence (a headline: many words, pronouns, verbs) is not an identity; the single
 * document product named inside it replaces it, else there is no page product. */
export function pageIdentity1C(page:{name:string}|null,mentions:readonly Mention1C[]):{name:string}|null{
 if(!page)return null;const w=page.name.trim().split(/\s+/);
 if(w.length<=7&&!/\b(?:I|we|you|would|is|are|was|were|but|my|our|if|wins?)\b/i.test(page.name))return page;
 const inside=[...new Map(mentions.filter(m=>new RegExp('\\b'+esc(m.model)+'\\b').test(page.name)).map(m=>[K(m),m])).values()];return inside.length===1?{name:inside[0].name}:null;
}
export function attributeLead1C(l:Lead1C,ctx:Context1C):Decision1C{
 const block=ctx.blocks[l.blockIndex]??'';const at=block?locate(block,l):null;
 const loc=(s:number|null)=>({blockIndex:l.blockIndex,sentenceIndex:s,valueOffset:at});
 const un=(rule:Rule1C,reason:string,needed:string,cands:string[],s:number|null=null):Decision1C=>({status:'unresolved',subject:null,rule,reason,neededEvidence:needed,candidates:[...new Set(cands)],location:loc(s)});
 const ok=(m:{name:string},rule:Rule1C,s:number|null):Decision1C=>({status:'attributed',subject:m.name,rule,location:loc(s)});
 const multi=(d:Mention1C[],s:number):Decision1C=>({status:'multi_subject',subject:null,subjects:d.map(m=>m.name),rule:'R1e_multi_subject',location:loc(s)});
 const onPage=(m:Mention1C)=>!!ctx.page&&new RegExp('\\b'+esc(m.model)+'\\b').test(ctx.page.name);
 if(at===null)return !ctx.mentions.some(m=>!onPage(m))&&ctx.page?ok(ctx.page,'R3a_document_main_product',null)
  :un('R0_unlocated','value not located in its block','a locatable source sentence or cell',l.subject?[l.subject.name]:[]);
 // R1a: comparison-table column (Step 1D-A2: by grid position when the caller supplies it, else by cell text).
 const grid=ctx.cellOf?.(l.blockIndex);
 if(grid!==undefined)return grid.subject?ok(grid.subject,'R1a_table_column',null):un('R1a_table_cell_ambiguous','the cell header does not name one document product','a product named by the row or column header',[]);
 const cell=ctx.cells.get(block.trim());
 if(cell!==undefined)return cell?ok(cell,'R1a_table_column',null):un('R1a_table_cell_ambiguous','the cell text occurs in several product columns','the column of this cell',[]);
 const sents=block.split(SENT);let off=0,si=0;
 for(;si<sents.length-1;si++){if(at<off+sents[si].length+1)break;off+=sents[si].length+1;}
 const sent=sents[si];const rel=at-off;
 const bounds=[0,...[...sent.matchAll(CLAUSE)].map(m=>m.index!+m[0].length)].filter(b=>b<=rel);const cStart=bounds[bounds.length-1];
 const cEnd=[...sent.matchAll(CLAUSE)].map(m=>m.index!).find(b=>b>rel)??sent.length;
 const clause=sent.slice(cStart,cEnd);const pre=sent.slice(cStart,rel);
 const named=distinct(occurrences(sent.slice(0,rel),ctx.mentions));
 // "both" is a statement about products only with two named products or comparison wording ("matches the X (both …)");
 // "both came out well" about two foods is not.
 const productBoth=named.length>=2||/\b(?:than|matches|match|versus|vs\.?|compared|like|same\s+as|equal)\b/i.test(sent);
 const both=(d:Mention1C[])=>d.length===2?multi(d,si):un('R1e_multi_subject_unidentified','"both" refers to products not all named in the sentence','both referents named as products',[...d.map(m=>m.name),...(ctx.page?[ctx.page.name]:[])],si);
 // R1b: a value inside parentheses opened right after a product ("the C6 (1,251 nits)"); "(both … v)" goes to R1e.
 const open=pre.lastIndexOf('(');
 if(open>=0&&!pre.slice(open).includes(')')){const before=pre.slice(0,open);const o=occurrences(before,ctx.mentions).pop();
  if(o&&/^\s{0,2}$/.test(before.slice(o.i+o.len)))return ok(o.m,'R1b_parenthetical',si);
  // A labelled value inside the parenthesis: "(C5: 775 nits)".
  const inner=pre.slice(open+1);const lab=occurrences(inner,ctx.mentions)[0];
  if(lab&&/^\s*(?:the\s+)?$/i.test(inner.slice(0,lab.i))&&/^\s*[:=]\s*$/.test(inner.slice(lab.i+lab.len)))return ok(lab.m,'R1b_parenthetical',si);
  // A product named once (not a document mention) directly before the parenthesis: "the Coway Airmega 200M (64.3 dBA)".
  const once=/((?:[A-Z][\w+&.\-]*\s+){1,3}[A-Z0-9][\w+&.\-]*\d[\w+&.\-]*)\s{0,2}$/.exec(before);
  if(once){const t=once[1].trim().split(/\s+/);while(t.length&&NOT_LEAD.test(t[0]))t.shift();
   if(t.length>=2&&!STANDARD.test(t[0])&&!TECH_CODE.test(t[t.length-1]))return ok({name:t.join(' ')},'R1b_parenthetical',si);}
  if(/\bboth\b/i.test(pre.slice(open))&&productBoth)return both(named);}
 // R1d: a value owned by an unnamed referent ("its predecessor's 606 nits").
 if(UNNAMED.test(pre))return un('R1d_unnamed_referent','the value belongs to an unnamed product (predecessor, rival, …)','the referent named as a product',named.map(m=>m.name),si);
 // R1c: possessive "<product>'s … v" with no other product in between.
 const poss=occurrences(pre,ctx.mentions).filter(o=>/^['’]s\b/.test(pre.slice(o.i+o.len))).pop();
 if(poss&&!occurrences(pre.slice(poss.i+poss.len),ctx.mentions).length&&pre.length-poss.i<60)return ok(poss.m,'R1c_possessive',si);
 // R1f: "<product> and its … v".
 const co=/\b([A-Za-z0-9-]+)\s+(?:and|with)\s+its\b[^.]{0,40}$/.exec(pre);
 if(co){const o=occurrences(pre.slice(0,co.index+co[1].length),ctx.mentions).pop();if(o&&o.i+o.len===co.index+co[1].length)return ok(o.m,'R1f_coordinated_possessive',si);
  // The same with a product named without a model code ("the Xiaomi Elite and its 61.5 dBA"): a capitalised name of 2-4 words.
  const nm=/((?:[A-Z][\w+&.\-]*\s+){1,3}[A-Z][\w+&.\-]*)\s+(?:and|with)\s+its\b[^.]{0,40}$/.exec(pre);
  if(nm){const t=nm[1].split(/\s+/);while(t.length&&NOT_LEAD.test(t[0]))t.shift();if(t.length>=2&&!STANDARD.test(t[0]))return ok({name:t.join(' ')},'R1f_coordinated_possessive',si);}}
 // R1e: "both" in the value's clause.
 if(/\bboth\b/i.test(pre)&&productBoth)return both(named);
 // R2: the grammatical subject before the value in its clause.
 // Products inside a closed parenthetical aside ("(C5: 775 nits)") are not clause subjects.
 const preMasked=pre.replace(/\([^()]*\)/g,m=>' '.repeat(m.length));
 const pOcc=occurrences(preMasked,ctx.mentions);const subj=distinct(pOcc.filter(o=>!o.object));
 if(subj.length>1)return un('R2_several_subject_candidates','several products in subject position','a structure binding the value to one of them',subj.map(m=>m.name),si);
 if(subj.length===1){const h=subjectOf(preMasked,ctx.mentions);if(h)return ok(h,'R2_grammatical_subject',si);
  return un('R2_several_subject_candidates','the only non-object product is far from the clause head','the clause subject',[subj[0].name],si);}
 // R2 (fronted value): "At 633 nits, the S85F is …".
 // A fronted value ("At 633 nits, it is …"): the clause continues after the first comma following the value.
 const fr=/^[\d.,]*\d\s*[^,]{0,30},\s*/.exec(sent.slice(rel,cEnd));
 const tail=fr&&pre.trim().split(/\s+/).filter(Boolean).length<=4?sent.slice(rel+fr[0].length,cEnd):null;
 if(tail){const f=occurrences(tail.slice(0,80),ctx.mentions)[0];
  if(f&&!f.object&&f.lead.trim().split(/\s+/).filter(Boolean).length<=1)return ok(f.m,'R2_grammatical_subject',si);}
 // R2b: elided subject ("…, and has even less lag (8.9 ms) than …") inherits the previous clause's subject.
 if(cStart>0&&ELIDED.test(clause)){const h=subjectOf(sent.slice(0,cStart),ctx.mentions);if(h)return ok(h,'R2b_elided_subject',si);}
 // R3c: a pronoun subject (before the value, or after a fronted value) takes the previous sentence's subject in this block.
 if(PRONOUN.test(pre.replace(/^[^,]{0,60},\s*/,''))||(tail!==null&&PRONOUN.test(tail))){
  for(let k=si-1;k>=0;k--){const h=subjectOf(sents[k],ctx.mentions);if(h)return ok(h,'R3c_pronoun_antecedent',si);}}
 // A product in subject position after the value that no rule bound: unresolved.
 const later=occurrences(clause.slice(rel-cStart),ctx.mentions).filter(o=>!o.object);
 if(later.length&&!named.length)return un('R4_no_subject_evidence','a product follows the value but is not established as its subject','a structural or grammatical link',distinct(later).map(m=>m.name),si);
 // R3b / R3a: no competing product in subject position.
 const sec=section(ctx,l.blockIndex);
 if(sec.subject)return ok(sec.subject,'R3b_section_heading',si);
 if(ctx.page&&sec.competing===0)return ok(ctx.page,'R3a_document_main_product',si);
 return un('R4_no_subject_evidence','no product established by structure, grammar or section','a sentence or section naming the product',[...named.map(m=>m.name),...(ctx.page?[ctx.page.name]:[])],si);
}
