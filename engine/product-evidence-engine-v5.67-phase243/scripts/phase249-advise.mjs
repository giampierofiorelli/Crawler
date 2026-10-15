#!/usr/bin/env node
/** Phase249: decide advice for user-confirmed requirements against the knowledge store (read-only).
 * Usage: node scripts/phase249-advise.mjs --category C --criteria '[["capacity_min","Family size",{"kind":"quantity","value":5,"unit":"l"},"hard"]]' [--db FILE] */
import {join,resolve} from 'node:path';
import {KnowledgeStore246,defaultKnowledgeDir246} from '../dist/src/phase246_knowledge_store.js';
import {createDecision177,applyDecisionAction177} from '../dist/src/phase177_decision_snapshot.js';
import {decideAdvice249,candidatesFromStore249} from '../dist/src/phase249_decision.js';
const F=Object.fromEntries(process.argv.slice(2).reduce((a,x,i,arr)=>i%2?a:[...a,[x.replace(/^--/,''),arr[i+1]]],[]));
const store=new KnowledgeStore246(resolve(F.db??join(defaultKnowledgeDir246(),'pee246.sqlite')));
let s=applyDecisionAction177(createDecision177('cli'),{type:'set_scope',source:'user_explicit_confirmation',scope:{category:F.category,task:'product_selection'}}).snapshot;
for(const [key,label,value,priority] of JSON.parse(F.criteria))s=applyDecisionAction177(s,{type:'set_criterion',source:'user_explicit_confirmation',key,label,value,priority}).snapshot;
const a=decideAdvice249({snapshot:s,candidates:candidatesFromStore249(store,F.category)});store.close();
console.log(JSON.stringify({decision:a.decision,ordered:a.ordered,rankingAuthorized:a.rankingAuthorized,statements:a.statements,
 shortlist:a.shortlist.map(x=>({name:x.name,evidence:x.evidence.map(e=>`${e.rawValue} <${e.sourceUrl}>`)})),
 outcomes:a.checks.reduce((m,c)=>(m[c.outcome]=(m[c.outcome]??0)+1,m),{}),unknownReasons:a.researchPlan.slice(0,6),cautions:a.cautions},null,1));
