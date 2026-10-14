/** Retrospective replay ONLY. Does not provide a fresh blind evaluation. */
import fs from 'node:fs';
import {parseMarked131,trainRelations131,calibrateMargin131,predictRelation131} from '../dist/src/phase131_local_relation_learning.js';
import {screenRelationContext132} from '../dist/src/phase132_contextual_relation_guard.js';
const root=new URL('../evaluation/phase131/',import.meta.url);
const read=(n)=>JSON.parse(fs.readFileSync(new URL(`${n}.json`,root),'utf8'));
const train=read('train').records.map(r=>parseMarked131(r.marked,r.label));
const validation=read('validation').records.map(r=>parseMarked131(r.marked,r.label));
const testSet=read('challenge').records.map(r=>parseMarked131(r.marked,r.label));
const model=trainRelations131(train), calibration=calibrateMargin131(model,validation,0.9);
let baseAccepted=0,baseCorrect=0,afterAccepted=0,afterCorrect=0;
const rows=testSet.map((e,index)=>{
 const p=predictRelation131(model,e,calibration.margin);
 const was=p.accepted&&p.label!=='unrelated'&&p.label!=='abstain';
 const context=was?screenRelationContext132({text:e.text,subject:e.subject,object:e.object,label:p.label}):null;
 const accepted=was&&context.allowHypothesis;
 if(was){baseAccepted++;baseCorrect+=Number(p.label===e.label);}
 if(accepted){afterAccepted++;afterCorrect+=Number(p.label===e.label);}
 return {index,expected:e.label,rawWinner:p.rawWinner,baselineAccepted:was,baselineLabel:was?p.label:null,
  scopedAccepted:accepted,scopeReasons:context?.reasons??[],qualifiers:context?.qualifiers??[]};
});
const report={phase:132,kind:'retrospective_replay_of_known_phase131_challenge',
 validity:'CONTAINS LEAKAGE INTO DEVELOPMENT DECISION: observed prior negation failure; not a new independent evaluation',
 sourceKind:'developer_composed_synthetic',train:train.length,validation:validation.length,challenge:testSet.length,
 modelVersion:model.modelVersion,calibrationMargin:calibration.margin,
 before:{accepted:baseAccepted,correct:baseCorrect,wrong:baseAccepted-baseCorrect,abstained:testSet.length-baseAccepted},
 after:{accepted:afterAccepted,correct:afterCorrect,wrong:afterAccepted-afterCorrect,abstained:testSet.length-afterAccepted},
 independence:false,fullSourceRetrievalTested:false,modelWeightsDownloaded:false,runtimeExternalDependencyAdded:false,
 items:rows};
const path=new URL('../PHASE132-RETROSPECTIVE-REPLAY.json',import.meta.url);
fs.writeFileSync(path,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({before:report.before,after:report.after,model:report.modelVersion}));
