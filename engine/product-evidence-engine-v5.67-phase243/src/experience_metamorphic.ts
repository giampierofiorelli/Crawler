/** Continuous-learning Step 1B — metamorphic relations for product-to-value attribution (evaluation only).
 *
 * Three general relations, each checked on FICTIONAL fixtures (invented brands Zentra, Korvo, Brixel; no third-party text):
 *  MR1 table reordering: reordering the body rows, or the product columns, of a comparison table preserves every explicit
 *      product-to-value relationship read from it.
 *  MR2 irrelevant context: adding context that does not concern the measured products (another product's news, a related
 *      link block) leaves every explicitly attributed measurement unchanged.
 *  MR3 named product over page product: a value whose own sentence names the tested product keeps that subject when the
 *      page's main product changes; plus a fixed oracle check on the source input.
 * A relation is checked only when its precondition holds on the source input (otherwise `precondition_not_met`, never a
 * pass). Expected outcomes are fixed here and are never adjusted to make a build pass; a violation is a finding.
 * Synthetic: these results show behaviour on constructed inputs, not accuracy on real pages (tier T1).
 * Pure: the extractor is passed in (scripts/experience-metamorphic.mjs supplies a build's readers). */

export interface MRLead {value:number;unit:string;subject:string|null}
export type MRExtract=(html:string)=>MRLead[];
export interface MRVerdict {relation:'MR1_table_reordering'|'MR2_irrelevant_context'|'MR3_named_over_page_product';variant:string;
 /** holds_unresolved: no wrong product, but at least one constrained value is unresolved (safe, not a correct attribution). */
 status:'holds'|'holds_unresolved'|'violated'|'precondition_not_met';
 /** Leads of the source input the relation constrains, and what happened to each in the follow-up. */
 checked:{value:number;unit:string;source:string|null;followUp:string|null|'missing'}[];note:string}

const page=(title:string,body:string)=>`<html><head><meta property="og:type" content="article" /><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'Product',name:title})}</script></head><body><h1>${title} review</h1>${body}</body></html>`;
const table=(head:string[],rows:string[][])=>`<table><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const INTRO='<p>We tested the Zentra Z10 in our lab for two weeks, measuring brightness and input lag with a colorimeter and a lag tester.</p>';
const HEAD=['Test','Zentra Z10','Korvo K20'];
const ROWS=[['SDR brightness (10% window)','250 nits','410 nits'],['HDR brightness (10% window)','690 nits','1,240 nits'],['Input lag (Game mode)','9.1 ms','12.4 ms']];
const PROSE_Z='<p>In our brightness test the Zentra Z10 reached 300 nits in Vivid mode.</p>';
const PROSE_K='<p>We also measured the Korvo K20, which reached 520 nits in Vivid mode.</p>';
const KORVO_AGAIN='<p>The Korvo K20 is the obvious rival.</p>';
const COMPARATIVE='<p>The Korvo K20 performs better than the Zentra Z10 when it comes to HDR brightness at 1,180 nits in our test.</p>';
/** The fictional fixtures (exported so the committed results can be traced to exact inputs). */
export const MR_FIXTURES={
 tableSource:page('Zentra Z10',INTRO+table(HEAD,ROWS)),
 tableRowsReversed:page('Zentra Z10',INTRO+table(HEAD,[...ROWS].reverse())),
 tableColumnsSwapped:page('Zentra Z10',INTRO+table([HEAD[0],HEAD[2],HEAD[1]],ROWS.map(r=>[r[0],r[2],r[1]]))),
 proseSource:page('Zentra Z10',INTRO+PROSE_Z+PROSE_K+KORVO_AGAIN),
 proseUnrelatedAfter:page('Zentra Z10',INTRO+PROSE_Z+PROSE_K+KORVO_AGAIN+'<p>Elsewhere, the Brixel B30 soundbar launches next month; the Brixel B30 will cost more than last year.</p>'),
 proseUnrelatedBefore:page('Zentra Z10','<p>Related: our guide to the Brixel B30 soundbar, and why the Brixel B30 sold out.</p>'+INTRO+PROSE_Z+PROSE_K+KORVO_AGAIN),
 namedSource:page('Zentra Z10',INTRO+PROSE_K+KORVO_AGAIN+COMPARATIVE),
 namedPageChanged:page('Brixel B30','<p>We tested the Brixel B30 and the Zentra Z10 in our lab for two weeks, measuring brightness and input lag with a colorimeter and a lag tester.</p>'
  +PROSE_K+KORVO_AGAIN+COMPARATIVE),
};
const key=(l:{value:number;unit:string})=>l.value+'|'+l.unit;
function compare(relation:MRVerdict['relation'],variant:string,source:MRLead[],follow:MRLead[],constrained:(l:MRLead)=>boolean,note:string):MRVerdict{
 const src=source.filter(constrained);
 if(!src.length)return {relation,variant,status:'precondition_not_met',checked:[],note:note+' (no constrained lead in the source input)'};
 const checked=src.map(l=>{const f=follow.filter(x=>key(x)===key(l));return {value:l.value,unit:l.unit,source:l.subject,followUp:f.length?(f.find(x=>x.subject===l.subject)??f[0]).subject:'missing' as const};});
 return {relation,variant,status:checked.every(c=>c.followUp===c.source)?'holds':'violated',checked,note};
}
/** Run the three relations with one extractor. MR1/MR2 constrain the leads with a named subject (an explicit
 * product-to-value relation); unresolved leads are not constrained by them. */
export function runMetamorphic(extract:MRExtract):MRVerdict[]{
 const F=MR_FIXTURES;const named=(l:MRLead)=>!!l.subject;const ts=extract(F.tableSource),ps=extract(F.proseSource),ns=extract(F.namedSource);
 const out:MRVerdict[]=[
  compare('MR1_table_reordering','body rows reversed',ts,extract(F.tableRowsReversed),named,'expected: every named table value keeps its product'),
  compare('MR1_table_reordering','product columns swapped',ts,extract(F.tableColumnsSwapped),named,'expected: every named table value follows its column product'),
  compare('MR2_irrelevant_context','unrelated product paragraph after the results',ps,extract(F.proseUnrelatedAfter),named,'expected: unchanged'),
  compare('MR2_irrelevant_context','unrelated related-link paragraph before the results',ps,extract(F.proseUnrelatedBefore),named,'expected: unchanged'),
 ];
 // MR3: the constrained values are those whose own sentence names the Korvo K20 as the tested product (520 and 1,180 nits).
 const korvo=(l:MRLead)=>l.unit==='nits'&&(l.value===520||l.value===1180);
 out.push(compare('MR3_named_over_page_product','page main product changed (Zentra Z10 to Brixel B30)',ns,extract(F.namedPageChanged),korvo,'expected: the Korvo K20 values keep their subject'));
 // Oracle part of MR3 (a fixed expectation on one input, not a relation between two outputs): those values must not be bound
 // to the page product or another compared product; unresolved is safe but is not a correct attribution.
 const ks=ns.filter(korvo);const wrong=ks.some(l=>l.subject!==null&&l.subject!=='Korvo K20');
 out.push({relation:'MR3_named_over_page_product',variant:'oracle: named tested product on the source input',
  status:!ks.length?'precondition_not_met':wrong?'violated':ks.some(l=>l.subject===null)?'holds_unresolved':'holds',
  checked:ks.map(l=>({value:l.value,unit:l.unit,source:'Korvo K20',followUp:l.subject})),note:'expected: subject Korvo K20; a null subject is unresolved'});
 return out;
}
