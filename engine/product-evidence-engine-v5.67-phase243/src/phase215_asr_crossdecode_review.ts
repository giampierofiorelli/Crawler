/** Phase215: compare TWO local decodes of the SAME uploaded audio, without a human
 * reference. The output is a textless review queue, NEVER an accuracy estimate.
 * Differences between two decodes by the same model are correlated and cannot
 * establish either transcription's correctness. All source text remains transient.
 */
import {evaluateLocalAsr212,type Transcript212} from './phase212_local_asr_evaluation.js';

export type Alert215='unit_disagreement'|'quantity_disagreement'|'context_sensitive_unit'|'transcript_presence_mismatch';
export interface ReviewFlag215{windowStartSecond:number;windowEndSecond:number;alerts:Alert215[];claimVerified:false;manualReferenceAvailable:false;}
export interface CrossDecode215{
 schema:'pee215.crossdecode-triage.v1'; uploadSha256:string; modelSha256:string;
 scope:'same_model_two_windowing_strategies'; transcriptTextRetained:false;
 comparedWindows:number; alerts:ReviewFlag215[];repeatedLanguageObservation:string[];
 languageChangeAccuracy:null;wordErrorRate:null;characterErrorRate:null;
 originalPublisherAuthenticated:false;productEvidenceAdmissionAuthorized:false;
 needsOriginalAudioInspection:boolean;
 noAlertsIsNotAccuracy:true; conclusion:'diagnostic_disagreement_only';
}
const stop=(s:string):never=>{throw Error(`phase215_${s}`);};
const norm=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/\s+/gu,' ');
// Deliberately narrow: numeric plus adjacent units. Unknown/misspoken units are
// retained as suspects, never rewritten (e.g. "bits" for screen brightness).
const qty=(text:string):{value:string;unit:string}[]=>{
 const pattern=/\b(\d{1,3}(?:,\d{3})+|\d{1,7}(?:\.\d{1,3})?)\s*(°\s*[cf]|grams?|g|kg|hertz|hz|nits?|bits?|hits?|watts?|w|gb|mb|fps|mah|%)(?![a-z])/giu;
 const result:{value:string;unit:string}[]=[];
 for(const match of text.matchAll(pattern)){
  let unit=norm(match[2]).replace(/\s/g,'');
  if(unit==='hertz')unit='hz'; if(unit==='grams'||unit==='gram')unit='g';
  if(unit==='nits')unit='nit'; if(unit==='watts'||unit==='watt')unit='w';
  result.push({value:match[1].replace(/,/g,''),unit});
 }
 return result;
};
const problematic=(t:string)=>/\b(display|screen|brightness|peak brightness|luminance)\b/iu.test(t);
const qa=(parts:{value:string;unit:string}[],context:string)=>{
 const num=new Map<string,Set<string>>();
 for(const part of parts){const s=num.get(part.value)??new Set<string>();s.add(part.unit);num.set(part.value,s);}
 return {num,questionable:parts.some(p=>['bit','bits','hit','hits'].includes(p.unit)&&problematic(context))};
};
function getText(t:Transcript212,a:number,b:number){
 return t.segments.filter(s=>s.startSecond<b&&s.endSecond>a).map(s=>s.text).join(' ');
}
/** `windowStarts` are explicit timing of independent decoding windows, NOT
 * inferred from segment counts. They must span the entire clip without gaps.
 * Windows are disjoint and the sequence is deterministic by construction.
 */
export function assessCrossDecode215(full:Transcript212,windowed:Transcript212,windowStarts:number[]):CrossDecode215{
 evaluateLocalAsr212(full,null);evaluateLocalAsr212(windowed,null);
 if(full.uploadSha256!==windowed.uploadSha256||full.runtime.modelSha256!==windowed.runtime.modelSha256||
  full.runtime.engine!==windowed.runtime.engine||full.runtime.engineVersion!==windowed.runtime.engineVersion||
  Math.abs(full.durationSeconds-windowed.durationSeconds)>0.001)stop('mismatched_source_or_engine');
 if(full.runtime.languageStrategy!=='global_language'||windowed.runtime.languageStrategy!=='multilingual_windows')stop('strategy');
 if(!Array.isArray(windowStarts)||!windowStarts.length||windowStarts.length>500||windowStarts[0]!==0||
  windowStarts.some((v,i)=>!Number.isFinite(v)||v<0||v>=full.durationSeconds||(i>0&&v<=windowStarts[i-1]))||
  windowStarts.some((v,i)=>i>0&&v-windowStarts[i-1]>30)||
  full.durationSeconds-windowStarts[windowStarts.length-1]>30)stop('windows');
 const alerts:ReviewFlag215[]=[];
 for(let i=0;i<windowStarts.length;i++){
  const a=windowStarts[i],b=i+1<windowStarts.length?windowStarts[i+1]:full.durationSeconds;
  const primary=getText(full,a,b),secondary=getText(windowed,a,b);
  const p=qa(qty(primary),primary),q=qa(qty(secondary),secondary);
  const issues=new Set<Alert215>();
  if(Boolean(primary.trim())!==Boolean(secondary.trim()))issues.add('transcript_presence_mismatch');
  const common=[...p.num.keys()].filter(k=>q.num.has(k));
  for(const value of common){const u=p.num.get(value)!,v=q.num.get(value)!;
   if([...u].some(x=>!v.has(x))||[...v].some(x=>!u.has(x)))issues.add('unit_disagreement');}
  if(p.num.size&&q.num.size&&!common.length)issues.add('quantity_disagreement');
  if(p.questionable||q.questionable)issues.add('context_sensitive_unit');
  if(issues.size)alerts.push({windowStartSecond:a,windowEndSecond:b,alerts:[...issues].sort(),claimVerified:false,manualReferenceAvailable:false});
 }
 const langs=[...new Set(windowed.segments.map(s=>s.language).filter((x):x is string=>x!==null))].sort();
 return {schema:'pee215.crossdecode-triage.v1',uploadSha256:full.uploadSha256,
  modelSha256:full.runtime.modelSha256,scope:'same_model_two_windowing_strategies',
  transcriptTextRetained:false,comparedWindows:windowStarts.length,alerts,
  repeatedLanguageObservation:langs,languageChangeAccuracy:null,wordErrorRate:null,characterErrorRate:null,
  originalPublisherAuthenticated:false,productEvidenceAdmissionAuthorized:false,
  needsOriginalAudioInspection:alerts.length>0,noAlertsIsNotAccuracy:true,conclusion:'diagnostic_disagreement_only'};
}
