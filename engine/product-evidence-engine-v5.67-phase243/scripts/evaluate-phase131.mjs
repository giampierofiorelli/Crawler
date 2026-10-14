import fs from 'node:fs';
import {parseMarked131,trainRelations131,calibrateMargin131,evaluateRelations131} from '../dist/src/phase131_local_relation_learning.js';
const root=new URL('../evaluation/phase131/',import.meta.url);
const load=name=>JSON.parse(fs.readFileSync(new URL(name+'.json',root),'utf8'));
const datasets=Object.fromEntries(['train','validation','challenge'].map(n=>[n,load(n)]));
const parse=a=>a.records.map(r=>parseMarked131(r.marked,r.label));
const model=trainRelations131(parse(datasets.train));
const calibration=calibrateMargin131(model,parse(datasets.validation),0.9);
const validation=evaluateRelations131(model,parse(datasets.validation),calibration.margin);
const challenge=evaluateRelations131(model,parse(datasets.challenge),calibration.margin);
const report={phase:131,model:model.algorithm,modelVersion:model.modelVersion,
 splitSizes:Object.fromEntries(Object.entries(datasets).map(([k,v])=>[k,v.records.length])),
 contaminationWarning:'All three datasets authored by the same developer; challenge text written and frozen before model code but is NOT an independently adjudicated blind original-source benchmark.',
 inputLimit:'Model receives manually marked entity spans. No autonomous entity recognition, retrieval, publisher authentication or cross-sentence coreference.',
 sourceMode:'Constructed statements, not live original publisher prose',
 calibration,validation,challenge,
 reference:'Trainable local multinomial naive Bayes with n-gram features and deterministic abstention threshold; does not calibrate probability',
 independentlyValidated:false,productRankingAuthorized:false};
fs.writeFileSync(new URL('../PHASE131-RELATION-LEARNING-EVALUATION.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({model:model.modelVersion,calibration,challenge:{size:challenge.size,accepted:challenge.accepted,correct:challenge.correct,wrong:challenge.wrong,abstained:challenge.abstained,perClass:challenge.perClass}},null,2));
