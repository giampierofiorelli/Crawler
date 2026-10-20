/** S92 (owner review of S91: "combinazione di segnali e gestione dell'incertezza"): a label model that combines several
 * imperfect signals of one binary decision without gold labels (data programming, Ratner et al. 2016; closed-form triplet
 * estimator, FlyingSquid, Fu et al. 2020; S87c research D §1.4).
 *
 * Each signal votes +1, -1 or 0 (abstains) per item. Under conditional independence of the signals given the true label
 * Y, the observable agreement E[v_i v_j] equals a_i a_j, where a_i = E[v_i Y] (abstentions count 0). Any three signals give
 * |a_i| = sqrt(|E[v_i v_j] E[v_i v_k] / E[v_j v_k]|); the median over all valid triplets is kept. Signs assume better-
 * than-random signals. A signal's accuracy where it votes is (1 + a_i / coverage_i) / 2; its weight is the log-odds of that
 * accuracy. The prediction is the sign of the weighted vote; a vote whose margin is below `margin` abstains (selective
 * classification).
 *
 * Limits (stated, not hidden): correlated signals (two readers sharing a cue list) violate the independence assumption and
 * inflate each other's estimated accuracy; with fewer than three signals the accuracies are not identifiable. No gold label
 * is read by `fitLabelModel`. Callers: scripts/s92-role-eval.mjs, scripts/s92-check.mjs. Shadow and evaluation only. */
export const EVIDENCE_COMBINATION_VERSION='pee92.label-model.v1';
export interface LabelModel {version:string;signals:string[];items:number;coverage:number[];a:number[];accuracy:number[];weight:number[];margin:number;
 notes:string[]}
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
/** Fit from a vote matrix (items x signals, values in {-1,0,1}); no gold. */
export function fitLabelModel(signals:readonly string[],votes:readonly (readonly number[])[],opts:{margin?:number}={}):LabelModel{
 const m=signals.length,n=votes.length;const notes:string[]=[];
 const cov=signals.map((_,i)=>votes.filter(v=>v[i]!==0).length/Math.max(1,n));
 const E=(i:number,j:number)=>votes.reduce((s,v)=>s+v[i]*v[j],0)/Math.max(1,n);
 const M:number[][]=signals.map((_,i)=>signals.map((__,j)=>i===j?0:E(i,j)));
 const a=signals.map((_,i)=>{const est:number[]=[];
  for(let j=0;j<m;j++)for(let k=j+1;k<m;k++){if(j===i||k===i)continue;const d=M[j][k];if(Math.abs(d)<1e-3)continue;const x=Math.abs(M[i][j]*M[i][k]/d);if(Number.isFinite(x))est.push(Math.sqrt(x));}
  if(!est.length){notes.push(`${signals[i]}: no valid triplet (accuracy not identifiable)`);return 0;}
  est.sort((x,y)=>x-y);return est[Math.floor(est.length/2)];});
 const accuracy=a.map((x,i)=>cov[i]>0?clamp((1+clamp(x/cov[i],0,1))/2,0.5,0.99):0.5);
 const weight=accuracy.map(p=>Math.log(p/(1-p)));
 return {version:EVIDENCE_COMBINATION_VERSION,signals:[...signals],items:n,coverage:cov.map(x=>+x.toFixed(4)),a:a.map(x=>+x.toFixed(4)),accuracy:accuracy.map(x=>+x.toFixed(4)),weight:weight.map(x=>+x.toFixed(4)),margin:opts.margin??0.5,notes};
}
/** Weighted vote with selective abstention. */
export function predictLabel(model:LabelModel,votes:readonly number[]):{label:1|-1|0;score:number;voters:string[]}{
 let s=0;const voters:string[]=[];votes.forEach((v,i)=>{if(v!==0){s+=v*model.weight[i];voters.push((v>0?'+':'-')+model.signals[i]);}});
 return {label:Math.abs(s)<model.margin||!voters.length?0:s>0?1:-1,score:+s.toFixed(4),voters};
}
