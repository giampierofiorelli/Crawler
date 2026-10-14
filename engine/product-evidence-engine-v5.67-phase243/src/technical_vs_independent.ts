/** Phase 60 — research-only technical specifications versus independent evidence.
 * This module MUST NOT admit marketing copy, price data, retailer content or
 * manufacturer opinions. It does not score or rank real products.
 * Provenance/approval tokens are documentary assertions, NOT verified legal rights.
 */
export type Value = number | boolean;
export type SpecNature = 'physical_or_functional_attribute' | 'nominal_technical_performance';
export type IndependentKind = 'laboratory_measurement' | 'independent_editorial_assessment';
export type SourceOrigin = 'TECHNICAL_SPECIFICATION' | 'INDEPENDENT_EVIDENCE';
export interface ReviewedCriterion {
  criterionId: string;
  specFieldKey: string;
  specNature: SpecNature;
  testFieldKey?: string;
  unit: string;
  context: Record<string, string>;
  /** Field mapping is a controlled editorial decision, not automatic keyword matching. */
  reviewedBy: string;
  reviewReference: string;
}
export interface Provenance {
  sourceUrl: string;
  documentId: string;
  documentSha256: string;
  publisherName: string;
  capturedAt: string;
  rightsMode: 'research_only' | 'documented_commercial_rights';
  /** Documentation only. A string here does not verify the licence. */
  rightsReference?: string;
  approval: {
    reviewerId: string;
    documentSha256: string;
    exactVariantId: string;
    reviewedAt: string;
    status: 'approved' | 'pending' | 'rejected';
    evidenceReference: string;
  };
}
interface BaseFact {
  id: string;
  exactVariantId: string;
  criterionId: string;
  value: Value;
  unit: string;
  context: Record<string, string>;
  provenance: Provenance;
}
export interface TechnicalSpecification extends BaseFact {
  origin: 'TECHNICAL_SPECIFICATION';
  sourceType: 'manufacturer_technical_document' | 'official_regulatory_document';
  documentSection: 'technical_specifications';
  specFieldKey: string;
  nature: SpecNature;
}
export interface IndependentMeasurement extends BaseFact {
  origin: 'INDEPENDENT_EVIDENCE';
  kind: 'laboratory_measurement';
  sourceType: 'independent_laboratory' | 'independent_professional_reviewer';
  testFieldKey: string;
  protocolId: string;
  protocolVersion: string;
}
export interface IndependentEditorialAssessment extends Omit<BaseFact, 'value'|'unit'> {
  origin: 'INDEPENDENT_EVIDENCE';
  kind: 'independent_editorial_assessment';
  sourceType: 'independent_professional_reviewer';
  testFieldKey: string;
  /** Structured editorial classification, not a fabricated lab measurement. */
  finding: 'favourable' | 'mixed' | 'unfavourable';
  methodologyReference: string;
}
export type AdmissibleFact = TechnicalSpecification | IndependentMeasurement | IndependentEditorialAssessment;
export interface VariantCriterionView {
  variantId: string;
  technicalSpecification: null | { value:Value; unit:string; sourceId:string; verifiedByThirdParty:false; nature:SpecNature };
  independentMeasurement: null | { value:Value; unit:string; sourceId:string; protocolId:string; protocolVersion:string };
  independentEditorial: null | { finding:'favourable'|'mixed'|'unfavourable'; sourceId:string };
  status: 'missing'|'specification_only'|'independent_only'|'specification_and_independent'|'needs_editorial_review';
  observations: string[];
}
export interface CriterionComparison {
  criterionId:string;
  byVariant:[VariantCriterionView,VariantCriterionView];
  comparison:'direct_independent_measurement_comparison_possible'|'technical_specification_comparison_only'|'no_supported_comparison';
  /** A spec+test of one variable never yields two independent evidence contributions. */
  evidenceContributionPerCriterionMax:1;
  missingIsNotNegative:true;
  explanation:string;
}
export interface EvidenceSeparationResult {
  purpose:'technical_vs_independent_research_only';
  publicationReady:false;
  rankingEligible:false;
  winnerId:null;
  combinedScore:null;
  criteria:CriterionComparison[];
  discardedAsInvalid:never[];
  caveats:string[];
}
const prohibited=/(?:amazon|merchant|retailer|affiliate|commission|discount|marketing|promotion|advertis|sponsored|price|budget|msrp|rrp|claim|deal)/i;
const safeId=(s:unknown):s is string=>typeof s==='string' && /^[a-z][a-z0-9_]*$/.test(s) && !prohibited.test(s);
const sha256=(s:unknown):s is string=>typeof s==='string' && /^[a-f0-9]{64}$/.test(s);
const date=(v:unknown)=>typeof v==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(v) && Number.isFinite(Date.parse(v));
function contextKey(o:Record<string,string>){return JSON.stringify(Object.entries(o).sort(([a],[b])=>a.localeCompare(b)));}
function validContext(o:unknown):o is Record<string,string> {
  return !!o && typeof o==='object' && !Array.isArray(o) && Object.keys(o).length>0 &&
    Object.entries(o).every(([k,v])=>safeId(k) && typeof v==='string' && v.length>0 && v.length<120 && !prohibited.test(v));
}
function safeUrl(s:string){
  try {const u=new URL(s);return u.protocol==='https:' && !u.username && !u.password && !prohibited.test(u.hostname) && !/(?:\/marketing\/|\/campaign\/|\/ads\/)/i.test(u.pathname)}catch{return false}
}
function validProvenance(p:Provenance,variantId:string) {
  if (!p || !safeUrl(p.sourceUrl) || !safeId(p.documentId) || !sha256(p.documentSha256) ||
      !p.publisherName?.trim() || !date(p.capturedAt) ||
      !['research_only','documented_commercial_rights'].includes(p.rightsMode) ||
      (p.rightsMode==='documented_commercial_rights' && !p.rightsReference?.trim()) ||
      !p.approval || p.approval.status!=='approved' || !safeId(p.approval.reviewerId) ||
      p.approval.documentSha256!==p.documentSha256 || p.approval.exactVariantId!==variantId ||
      !date(p.approval.reviewedAt) || !p.approval.evidenceReference?.trim())
    throw new Error('Documentary source approval absent, mismatched or malformed');
  // No externally authenticated identity or licence is implied by this check.
}
function validate(rules:ReviewedCriterion[],facts:AdmissibleFact[],variants:[string,string]) {
  if(!Array.isArray(variants)||variants.length!==2||!variants.every(safeId)||variants[0]===variants[1]||
     !Array.isArray(rules)||rules.length===0||!Array.isArray(facts)||facts.length>10000)throw new Error('Invalid input');
  const keys=new Set<string>();
  for(const r of rules){
    if(!r||!safeId(r.criterionId)||keys.has(r.criterionId)||!safeId(r.specFieldKey)||
       (r.testFieldKey!==undefined&&!safeId(r.testFieldKey))||
       !['physical_or_functional_attribute','nominal_technical_performance'].includes(r.specNature)||
       !r.unit?.trim()||!validContext(r.context)||!safeId(r.reviewedBy)||!r.reviewReference?.trim())
      throw new Error('Missing controlled, reviewed technical field mapping');
    keys.add(r.criterionId);
  }
  const ids=new Set<string>();
  for(const f of facts){
    const r=rules.find(r=>r.criterionId===f?.criterionId);
    if(!f||!r||!safeId(f.id)||ids.has(f.id)||!variants.includes(f.exactVariantId)||
       !['TECHNICAL_SPECIFICATION','INDEPENDENT_EVIDENCE'].includes(f.origin)||
       !validContext(f.context))
      throw new Error('Invalid, unsupported or promotional evidence');
    // Fixed approved mapping + exact units/context for specifications and measurements.
    if(f.origin==='TECHNICAL_SPECIFICATION') {
      if(f.documentSection!=='technical_specifications'||
         !['manufacturer_technical_document','official_regulatory_document'].includes(f.sourceType)||
         f.specFieldKey!==r.specFieldKey||f.nature!==r.specNature||f.unit!==r.unit||
         (typeof f.value!=='boolean' && (typeof f.value!=='number'||!Number.isFinite(f.value))))
        throw new Error('Marketing content or unreviewed technical specification rejected');
    } else if(f.kind==='laboratory_measurement') {
      if(!['independent_laboratory','independent_professional_reviewer'].includes(f.sourceType)||
         !r.testFieldKey||f.testFieldKey!==r.testFieldKey||!safeId(f.protocolId)||!safeId(f.protocolVersion)||
         f.unit!==r.unit||typeof f.value!=='number'||!Number.isFinite(f.value))
        throw new Error('Unreviewed or malformed independent measurement');
    } else if(f.kind==='independent_editorial_assessment') {
      if(f.sourceType!=='independent_professional_reviewer'||!r.testFieldKey||f.testFieldKey!==r.testFieldKey||
         !['favourable','mixed','unfavourable'].includes(f.finding)||!f.methodologyReference?.trim())
        throw new Error('Unreviewed independent editorial assessment');
    } else throw new Error('Unsupported manufacturer marketing or evidence type');
    if(contextKey(f.context)!==contextKey(r.context))throw new Error('Evidence conditions differ from reviewed criterion');
    validProvenance(f.provenance,f.exactVariantId);
    ids.add(f.id);
  }
}
export function separateTechnicalAndIndependentEvidence(input:{
  exactVariantIds:[string,string];
  rules:ReviewedCriterion[];
  evidence:AdmissibleFact[];
}):EvidenceSeparationResult {
  const {exactVariantIds,rules,evidence}=input;
  validate(rules,evidence,exactVariantIds);
  const criteria:CriterionComparison[]=rules.map(r=>{
    const byVariant=exactVariantIds.map(variantId=>{
      const matches=evidence.filter(f=>f.exactVariantId===variantId&&f.criterionId===r.criterionId);
      const specs=matches.filter((f):f is TechnicalSpecification=>f.origin==='TECHNICAL_SPECIFICATION');
      const measured=matches.filter((f):f is IndependentMeasurement=>f.origin==='INDEPENDENT_EVIDENCE'&&f.kind==='laboratory_measurement');
      const editorial=matches.filter((f):f is IndependentEditorialAssessment=>f.origin==='INDEPENDENT_EVIDENCE'&&f.kind==='independent_editorial_assessment');
      const duplicated=specs.length>1||measured.length>1||editorial.length>1;
      const s=specs.length===1?specs[0]:null;
      const m=measured.length===1?measured[0]:null;
      const e=editorial.length===1?editorial[0]:null;
      const status:VariantCriterionView['status']=duplicated?'needs_editorial_review':
        (s && (m||e))?'specification_and_independent':s?'specification_only':(m||e)?'independent_only':'missing';
      const observations:string[]=[];
      if(s && m)observations.push('Technical specification and independent result are distinct sources, not two independent tests.');
      if(s && m && s.value!==m.value)observations.push('Values differ; compare declared and tested conditions and measurement uncertainty.');
      if(s && !m && !e)observations.push('Only a technical specification is available; no independent performance confirmation.');
      if(!s&&!m&&!e)observations.push('No evidence available. Absence is not poor performance.');
      if(duplicated)observations.push('Multiple records of the same category require editorial reconciliation; no silent averaging.');
      return {variantId,technicalSpecification:s ? {value:s.value,unit:s.unit,sourceId:s.id,verifiedByThirdParty:false as const,nature:s.nature}:null,
        independentMeasurement:m?{value:m.value,unit:m.unit,sourceId:m.id,protocolId:m.protocolId,protocolVersion:m.protocolVersion}:null,
        independentEditorial:e?{finding:e.finding,sourceId:e.id}:null,status,observations};
    }) as [VariantCriterionView,VariantCriterionView];
    const [a,b]=byVariant;
    const tests=a.independentMeasurement&&b.independentMeasurement &&a.status!=='needs_editorial_review' &&b.status!=='needs_editorial_review' &&
      a.independentMeasurement.protocolId===b.independentMeasurement.protocolId &&
      a.independentMeasurement.protocolVersion===b.independentMeasurement.protocolVersion;
    const specs=a.technicalSpecification&&b.technicalSpecification&&
      a.status!=='needs_editorial_review'&&b.status!=='needs_editorial_review';
    const comparison:CriterionComparison['comparison']=tests?'direct_independent_measurement_comparison_possible':
      specs?'technical_specification_comparison_only':'no_supported_comparison';
    return {criterionId:r.criterionId,byVariant,comparison,evidenceContributionPerCriterionMax:1 as const,missingIsNotNegative:true as const,
      explanation:comparison==='direct_independent_measurement_comparison_possible'?
        'Same stated method and conditions; precision, sample variation and practical relevance remain to be evaluated.':
        comparison==='technical_specification_comparison_only'?
        'Only documentation-based feature comparison is supported; never an independent performance ranking.':
        'No justified cross-product comparison for this criterion; absent or incompatible independent tests are not negative outcomes.'};
  });
  return {purpose:'technical_vs_independent_research_only',publicationReady:false,rankingEligible:false,winnerId:null,combinedScore:null,
    criteria,discardedAsInvalid:[],caveats:[
      'Documentary approval fields are not independent confirmation of licence, identity or source authenticity.',
      'No vendor marketing claims or retailer information admitted.',
      'No score is generated and no source gets a fixed numerical trust weight.',
      'An absence of independent tests does not justify declaring superiority.',
    ]};
}
