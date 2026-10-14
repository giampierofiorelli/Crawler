/** Phase163: cautious typed relationship bridge for actual (external) GLiNER2.5
 * relation output. Relationship candidates are not scientific evidence.
 * The separate trained checkpoint has not been executed for this feature here.
 */
export type RelationType163='product_has_feature'|'feature_has_measurement'|'product_compared_with';
export interface SourceSpan163 {text:string;start:number;end:number;confidence:number}
export interface NeuralEntity163 {id:string;label:string;text:string;start:number;end:number;contextCategories:string[]}
export interface RelationProposal163 {type:RelationType163;head:SourceSpan163;tail:SourceSpan163;
 identityVerified:false;scientificEvidence:false;canonicalWriteAuthorized:false;rankingAuthorized:false}
export interface CheckedRelation163 {type:RelationType163;head:SourceSpan163;tail:SourceSpan163;
 headEntityId:string|null;tailEntityId:string|null;entityTypeCheck:'matched'|'mismatch_or_missing';
 endpointContextCategories:string[];candidateOnly:true;identityVerified:false;scientificEvidence:false;
 publisherTestStatusVerified:false;canonicalWriteAuthorized:false;rankingAuthorized:false;}
const types:Record<RelationType163,[string,string]>={
 product_has_feature:['product_model','product_feature'],
 feature_has_measurement:['product_feature','measured_value'],
 product_compared_with:['product_model','product_model']
};
const obj=(v:unknown):v is Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v);
const validPart=(v:unknown,text:string):v is SourceSpan163=>obj(v)&&typeof v.text==='string'&&v.text.length>0&&v.text.length<=160&&
 Number.isSafeInteger(v.start)&&Number.isSafeInteger(v.end)&&(v.start as number)>=0&&(v.end as number)>(v.start as number)&&
 (v.end as number)<=text.length&&text.slice(v.start as number,v.end as number)===v.text&&typeof v.confidence==='number'&&
 Number.isFinite(v.confidence)&&v.confidence>=0&&v.confidence<=1;

/** Reject corrupted source offsets; keep genuine but untyped pairs as unsupported hypotheses. */
export function reviewRelationCandidates163(text:string,raw:unknown,status:unknown,entities:NeuralEntity163[]):CheckedRelation163[] {
 if(status!=='local_model_executed_unverified'||!Array.isArray(raw)||raw.length>150)
  throw Error('phase163_invalid_relation_envelope');
 const output:CheckedRelation163[]=[];const seen=new Set<string>();
 for(const v of raw){
  if(!obj(v)||!Object.hasOwn(types,String(v.type))||!validPart(v.head,text)||!validPart(v.tail,text)||
   v.identityVerified!==false||v.scientificEvidence!==false||v.canonicalWriteAuthorized!==false||v.rankingAuthorized!==false)
   throw Error('phase163_invalid_relation_candidate');
  const type=v.type as RelationType163;const head=v.head as SourceSpan163,tail=v.tail as SourceSpan163;
  if(head.start===tail.start&&head.end===tail.end)throw Error('phase163_relation_self_link');
  const key=[type,head.start,head.end,tail.start,tail.end].join(':');
  if(seen.has(key))throw Error('phase163_duplicate_relation');seen.add(key);
  const [headLabel,tailLabel]=types[type];
  const h=entities.find(e=>e.label===headLabel&&e.start===head.start&&e.end===head.end);
  const t=entities.find(e=>e.label===tailLabel&&e.start===tail.start&&e.end===tail.end);
  const cats=[...new Set([...(h?.contextCategories??[]),...(t?.contextCategories??[])])].sort();
  output.push({type,head,tail,headEntityId:h?.id??null,tailEntityId:t?.id??null,
   entityTypeCheck:h&&t?'matched':'mismatch_or_missing',endpointContextCategories:cats,
   candidateOnly:true,identityVerified:false,scientificEvidence:false,
   publisherTestStatusVerified:false,canonicalWriteAuthorized:false,rankingAuthorized:false});
 }
 return output.sort((a,b)=>a.head.start-b.head.start||a.tail.start-b.tail.start||a.type.localeCompare(b.type));
}
