/** Phase 59: research-only reconciliation of manufacturer declarations and primary tests.
 * SOURCE TRUST IS NOT A SINGLE WEIGHT: a claimed performance is not an observed test;
 * manufacturer attributes may help screening only, never certify a hard requirement.
 * No prices, retailer feeds, affiliate links, publisher rights assertion or winners.
 * DEPRECATED by Phase 60: use technical_vs_independent.ts for all new work.
 * This legacy function now FAILS CLOSED on promotional performance claims.
 * Existing declared/spec value pathways remain RESEARCH-ONLY and are not launch exports.
 */
import type { DecisionNeedsResult, Importance } from './needs_discovery.js';

export type EvidenceKind = 'manufacturer_attribute' | 'manufacturer_performance_claim' |
  'regulatory_declared_value' | 'independent_test';
export type CriterionNature = 'objective_attribute' | 'testable_performance';
export interface CriterionEvidenceRule {
  criterionId: string;
  nature: CriterionNature;
  /** Only matching contexts can support direct claims-versus-test interpretation. */
  comparisonContext: Record<string,string>;
  unit: string;
  /** Is this criterion necessary to declare a confident preference? */
  criticalIfEssential: boolean;
  rationale: string;
}
export interface EvidenceFact {
  id: string;
  variantId: string;
  criterionId: string;
  kind: EvidenceKind;
  value: number | string;
  unit: string;
  context: Record<string,string>;
  sourceUrl: string;
  /** This is research provenance ONLY; it is NOT a legal grant of commercial rights. */
  rightsStatus: 'research_only_unverified' | 'documented_commercial_derivation';
  rightsDocument?: string;
  /** Must be a named protocol for independent test observations. */
  protocol?: string;
  date: string;
}
export type EvidenceStanding = 'independent_measured' | 'manufacturer_attribute_unverified' |
  'manufacturer_performance_unverified' | 'regulatory_declared_not_independently_tested' |
  'missing' | 'ambiguous' | 'incompatible_test_conditions';
export interface CriterionStanding {
  criterionId: string;
  nature: CriterionNature;
  importance: Importance;
  byVariant: [
    { variantId:string; standing: EvidenceStanding; selectedValue?:string|number; unit?:string; evidenceIds:string[]; declaredVsMeasured?:'different_values_under_same_conditions'|'same_reported_value'; caveat:string },
    { variantId:string; standing: EvidenceStanding; selectedValue?:string|number; unit?:string; evidenceIds:string[]; declaredVsMeasured?:'different_values_under_same_conditions'|'same_reported_value'; caveat:string }
  ];
  comparison: 'tested_comparison_possible' | 'manufacturer_attribute_screening_only' |
    'no_justified_comparison';
  missingEvidenceIsNotBadPerformance: true;
  requiresMoreEvidenceForConfidentChoice: boolean;
  explanation: string;
}
export interface ReconciliationResult {
  purpose:'declared_vs_tested_research_only';
  publicationReady:false;
  rankingEligible:false;
  winnerId:null;
  combinedEvidenceScore:null;
  rulesUsed:'type_and_context_based_no_fixed_source_weights';
  criteria:CriterionStanding[];
  criticalGaps:string[];
  provenanceLinks:string[];
}
const forbidden=/(?:amazon|retailer|merchant|affiliate|commission|price|budget|msrp|rrp|discount|deal)/i;
const safeId=(s:unknown):s is string=>typeof s==='string' && /^[a-z][a-z0-9_]*$/.test(s) && !forbidden.test(s);
const contextKey=(c:Record<string,string>)=>JSON.stringify(Object.entries(c).sort(([a],[b])=>a.localeCompare(b)));
function validContext(c:unknown):c is Record<string,string> {
  return !!c && typeof c==='object' && !Array.isArray(c) && Object.keys(c).length>0 &&
    Object.entries(c).every(([k,v])=>safeId(k) && typeof v==='string' && v.trim().length>0 && !forbidden.test(v));
}
function validate(ruleList:CriterionEvidenceRule[], facts:EvidenceFact[], needs:DecisionNeedsResult, variants:[string,string]) {
  if(!needs || needs.purpose!=='needs_prototype' || needs.publicationReady!==false ||
     !Array.isArray(ruleList) || !Array.isArray(facts) || facts.length>10000 ||
     !Array.isArray(variants) || variants.length!==2 || !safeId(variants[0]) || !safeId(variants[1]) || variants[0]===variants[1])
    throw Error('Only two exact variant IDs and a research-only needs model are supported');
  const criteria=new Set(needs.criteria.map(n=>n.id));
  const seenRules=new Set<string>();
  for(const r of ruleList) {
    if(!safeId(r.criterionId) || !criteria.has(r.criterionId) || seenRules.has(r.criterionId) ||
      !['objective_attribute','testable_performance'].includes(r.nature) || !r.unit?.trim() ||
      !validContext(r.comparisonContext) || typeof r.criticalIfEssential!=='boolean' || !r.rationale?.trim())
      throw Error('Unreviewed or ambiguous criterion rule');
    seenRules.add(r.criterionId);
  }
  const seen=new Set<string>();
  for(const f of facts){
    if(!f || !safeId(f.id) || seen.has(f.id) || !variants.includes(f.variantId) ||
      !safeId(f.criterionId) || !criteria.has(f.criterionId) ||
      !['manufacturer_attribute','manufacturer_performance_claim','regulatory_declared_value','independent_test'].includes(f.kind) ||
      (typeof f.value==='number'&&!Number.isFinite(f.value)) ||
      (typeof f.value!=='number' && (typeof f.value!=='string' || !f.value.trim())) ||
      typeof f.unit!=='string' || !f.unit.trim() || !validContext(f.context) ||
      !Number.isFinite(Date.parse(f.date)) ||
      !['research_only_unverified','documented_commercial_derivation'].includes(f.rightsStatus) ||
      (f.rightsStatus==='documented_commercial_derivation' && !f.rightsDocument?.trim()) ||
      (f.kind==='independent_test' && (!f.protocol || !safeId(f.protocol))) ||
      (f.kind!=='independent_test' && f.protocol !== undefined)) throw Error('Malformed, unlicensed or ambiguous evidence record');
    let url:URL;
    try {url=new URL(f.sourceUrl)} catch {throw Error('Invalid evidence URL')}
    if(url.protocol!=='https:' || url.username || url.password || forbidden.test(url.hostname)) throw Error('Unsafe source URL');
    seen.add(f.id);
  }
}
const baseline=(variantId:string):CriterionStanding['byVariant'][number]=>({variantId,standing:'missing',evidenceIds:[],caveat:'No admissible observation available. Missing does not mean poor performance.'});
export function reconcileDeclaredWithTested(input:{
  needs:DecisionNeedsResult;
  exactVariantIds:[string,string];
  rules:CriterionEvidenceRule[];
  evidence:EvidenceFact[];
}):ReconciliationResult {
  const {needs,exactVariantIds,rules,evidence}=input;
  if (Array.isArray(evidence) && evidence.some(f=>f?.kind==='manufacturer_performance_claim')) {
    throw Error('Legacy manufacturer marketing/performance claims are prohibited; use controlled technical specifications (Phase 60)');
  }
  validate(rules,evidence,needs,exactVariantIds);
  const assessments:CriterionStanding[]=[];
  const criticalGaps:string[]=[];
  for (const n of needs.criteria) {
    const r=rules.find(x=>x.criterionId===n.id);
    const byVariant:[CriterionStanding['byVariant'][number],CriterionStanding['byVariant'][number]]=[baseline(exactVariantIds[0]),baseline(exactVariantIds[1])];
    if(r){
      for(let i=0;i<2;i++){
        const v=exactVariantIds[i];
        const candidate=evidence.filter(f=>f.variantId===v && f.criterionId===n.id && f.unit===r.unit);
        const matched=candidate.filter(f=>contextKey(f.context)===contextKey(r.comparisonContext));
        const tests=matched.filter(f=>f.kind==='independent_test');
        const declared=matched.filter(f=>f.kind==='manufacturer_performance_claim' || f.kind==='manufacturer_attribute' || f.kind==='regulatory_declared_value');
        const mismatchTests=candidate.filter(f=>f.kind==='independent_test').length && !tests.length;
        let row=baseline(v);
        // Two original independent tests can disagree. Never silently select one or average.
        if(tests.length>1 || declared.length>1){row={...row,standing:'ambiguous',evidenceIds:matched.map(f=>f.id),caveat:'Multiple observations require source/method review before selection or synthesis.'};}
        else if(tests.length===1){
          const t=tests[0];
          row={variantId:v,standing:'independent_measured',selectedValue:t.value,unit:t.unit,
            evidenceIds:[t.id,...declared.map(x=>x.id)],
            caveat:'Independent test observation under stated conditions; single test does not establish general real-world superiority.'};
          if(declared.length===1){
            row.declaredVsMeasured=t.value===declared[0].value?'same_reported_value':'different_values_under_same_conditions';
            if(row.declaredVsMeasured==='different_values_under_same_conditions')row.caveat+=' Manufacturer statement differs; investigate tolerance, units and sample variation, not automatic misconduct.';
          }
        }
        else if(mismatchTests){row={...row,standing:'incompatible_test_conditions',evidenceIds:candidate.map(f=>f.id),
          ...(declared.length===1?{selectedValue:declared[0].value,unit:declared[0].unit}:{}),
          caveat:'A claim may be shown as a manufacturer statement, but the available independent result uses different conditions; it cannot validate or refute that claim.'};}
        else if(declared.length===1){
          const d=declared[0];
          const standing:EvidenceStanding=d.kind==='regulatory_declared_value'?'regulatory_declared_not_independently_tested':
            r.nature==='objective_attribute' && d.kind==='manufacturer_attribute'?'manufacturer_attribute_unverified':'manufacturer_performance_unverified';
          row={variantId:v,standing,selectedValue:d.value,unit:d.unit,evidenceIds:[d.id],caveat:
            standing==='manufacturer_attribute_unverified'?'Manufacturer-stated property: preliminary screening only, not independently confirmed.':
            standing==='regulatory_declared_not_independently_tested'?'Regulatory declared value is not an independent market-sample test.':
            'Performance claim only: cannot be treated as a tested outcome.'};
        }
        byVariant[i]=row;
      }
    }
    const bothHaveTest=byVariant.every(x=>x.standing==='independent_measured');
    const testA=evidence.find(x=>x.id===byVariant[0].evidenceIds[0] && x.kind==='independent_test');
    const testB=evidence.find(x=>x.id===byVariant[1].evidenceIds[0] && x.kind==='independent_test');
    const bothTested=bothHaveTest && !!testA && !!testB && testA.protocol===testB.protocol;
    const bothAttributes=r?.nature==='objective_attribute' && byVariant.every(x=>x.standing==='manufacturer_attribute_unverified');
    const comparison:CriterionStanding['comparison']=bothTested?'tested_comparison_possible':bothAttributes?'manufacturer_attribute_screening_only':'no_justified_comparison';
    const requiresMoreEvidenceForConfidentChoice=n.importance==='essential' && (!r || (r.criticalIfEssential && comparison!=='tested_comparison_possible'));
    if(requiresMoreEvidenceForConfidentChoice)criticalGaps.push(n.id);
    assessments.push({criterionId:n.id,nature:r?.nature ?? 'testable_performance',importance:n.importance,byVariant,
      comparison,missingEvidenceIsNotBadPerformance:true,requiresMoreEvidenceForConfidentChoice,
      explanation:comparison==='tested_comparison_possible'?'Both variants have observations in matching stated contexts. Uncertainty and actual comparative validity still require assessment.':
        comparison==='manufacturer_attribute_screening_only'?'Both variants have matching manufacturer-declared attributes; use for provisional screening, not a laboratory-backed performance ranking.':
        'No defensible direct comparison: missing tests, incompatible protocols or declaration-only data. A manufacturer claim cannot be averaged with a measured outcome.'});
  }
  return {purpose:'declared_vs_tested_research_only',publicationReady:false,rankingEligible:false,winnerId:null,
    combinedEvidenceScore:null,rulesUsed:'type_and_context_based_no_fixed_source_weights',
    criteria:assessments,criticalGaps,
    provenanceLinks:[...new Set(evidence.map(e=>e.sourceUrl))].sort()};
}
