/** Phase160 adaptation of ExtractGPT pieutils/evaluation.py:
 * attribute coverage/error partition NN,NV,VN,VC,VW, only for annotated data.
 * Original ExtractGPT Apache-2.0 licence in licences/phase160_upstream.
 * No inferred labels, no semantic equivalence assertion, no ranking input.
 */
export type ErrorBucket160='NN'|'NV'|'VN'|'VC'|'VW';
export interface AttributeAudit160 {NN:number;NV:number;VN:number;VC:number;VW:number;
 total:number;predicted:number;goldPresent:number;exactMatches:number;independentGoldDeclared:boolean;
 rankingAuthorized:false;}
const absent=(value:string|null|undefined)=>value==null||['n/a','none'].includes(value.trim().toLowerCase());
export function auditAttributes160(rows:readonly {target:readonly (string|null)[];prediction:string|null}[],
  independentGoldDeclared=false):AttributeAudit160 {
 if(rows.length>100000)throw Error('phase160_attribute_audit_budget');
 const result:AttributeAudit160={NN:0,NV:0,VN:0,VC:0,VW:0,total:rows.length,predicted:0,
  goldPresent:0,exactMatches:0,independentGoldDeclared,rankingAuthorized:false};
 for(const r of rows){
  if(!Array.isArray(r.target)||!r.target.length||r.target.some(x=>x!==null&&typeof x!=='string')||
    r.prediction!==null&&typeof r.prediction!=='string')throw Error('phase160_invalid_gold_row');
  const gold=r.target.filter((x):x is string=>!absent(x));const predicted=!absent(r.prediction);
  if(gold.length)result.goldPresent++;if(predicted)result.predicted++;
  let bucket:ErrorBucket160;
  if(!gold.length&&!predicted)bucket='NN';
  else if(!gold.length&&predicted)bucket='NV';
  else if(gold.length&&!predicted)bucket='VN';
  else if(gold.includes(r.prediction!))bucket='VC';
  else bucket='VW';
  result[bucket]++;if(bucket==='VC')result.exactMatches++;
 }
 return result;
}
