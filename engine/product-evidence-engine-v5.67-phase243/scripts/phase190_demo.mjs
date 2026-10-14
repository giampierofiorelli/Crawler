// Research-only, deterministic scenario replay. NEVER a public product recommendation.
import {readFileSync,writeFileSync} from 'node:fs';
import {auditRobustPreferences190} from '../dist/src/phase190_robust_preference_audit.js';
const d=JSON.parse(readFileSync('evaluation/phase189/annotated-live-source-pilot.json','utf8'));
const raw=(id)=>d.records.find(r=>r.id===id);
const criteria=[
 {field:'hose_airflow',protocol:'rtings_vacuum_v1.4',condition:'maximum_hose_airflow',unit:'cfm',direction:'higher',
  utilityAnchor:{worst:0,best:150,reviewReference:'analyst_hypothesis_not_reviewed'},weight:{minimum:0.25,maximum:0.75}},
 {field:'operating_noise',protocol:'rtings_vacuum_v1.4',condition:'bare_floor',unit:'dba',direction:'lower',
  utilityAnchor:{worst:100,best:30,reviewReference:'analyst_hypothesis_not_reviewed'},weight:{minimum:0.25,maximum:0.75}}
];
const obs=(id)=>{const r=raw(id),p=d.sourcePages.find(x=>x.id===r.sourceId);return {variantId:r.variantId,category:r.category,field:r.field,
 protocol:r.protocol,condition:r.condition,unit:r.unit,low:r.value,high:r.value,originalGroup:r.originalGroup,sourceReference:p.url,
 kind:'original_professional_lab_annotation',bounds:'reported_point_no_uncertainty_estimate'};};
const s={stage:'research_only_unreviewed',category:'vacuum',variantA:'dyson_v15_detect',variantB:'shark_stratos_iz862h',
 userGoalConfirmed:true,purpose:'Research-only sensitivity audit of two reviewed RTINGS measurement fields, not whole-product quality.',
 criteria,observations:['v15_airflow','shark_airflow','v15_noise','shark_noise'].map(obs)};
const original=auditRobustPreferences190(s);
const missing=auditRobustPreferences190({...s,criteria:[...criteria,{...criteria[0],field:'carpet_deep_cleaning',weight:{minimum:0,maximum:0}}]});
const inconsistent=auditRobustPreferences190({...s,observations:[...s.observations,{...s.observations[2],originalGroup:'different_lab_observation',low:90,high:90}]});
const unsupported=auditRobustPreferences190({...s,userGoalConfirmed:false});
const out={phase:190,releaseStatus:'RESEARCH ONLY: no source admission, no retail ranking',sourceReuse:'Phase189 manual annotations, not publisher-source custody',
 scenarios:{original,missingNewCriterion:missing,duplicateConflictingObservation:inconsistent,unconfirmedGoal:unsupported}};
writeFileSync('evaluation/phase190/research-scenario-results.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({original:original.status,missing:missing.status,contradiction:inconsistent.status,unconfirmed:unsupported.status,publicRankingAllowed:original.publicRankingAllowed}));
