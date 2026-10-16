/**
 * Phase252 — proactive category teaching for two pilot categories (microwave_ovens, headphones), chosen by the criteria
 * in evaluation/phase252/teaching-pilot-selection.json.
 *
 * Two kinds of teaching are compared in Stage 4 under the same phrase budget:
 *  - LEXICAL_L252: vocabulary-based lessons in the Phase250 format (names and need phrases), written from general
 *    knowledge only, BEFORE any research for this phase (committed first).
 *  - Research-guided teaching (added after the research, in this module): material built from consulted sources that
 *    teaches what to understand, where and how to research, how to interpret evidence and how to apply it, compiled
 *    into the existing registry, store items and category relations.
 * Nothing here is reviewed evidence: every statement enters the store as a technical hypothesis.
 */
import type {CategoryLesson250,NeedLesson250} from './phase250_category_lessons.js';
import type {ConceptKind128} from './phase128_category_cognition_dialogue_bridge.js';

const N=(id:string,kind:ConceptKind128,statement:string,aliases:string[],counterexamples?:string[]):NeedLesson250=>({id,kind,statement,aliases,...(counterexamples?{counterexamples}:{})});

/** Pre-registered per-category budget, the same for the lexical and the research-guided arm. */
export const TEACHING_BUDGET252={needs:10,phrases:45,counterexamples:12} as const;

/** Arm L — vocabulary-based lessons, written 2026-10-16 from general knowledge, before the Phase252 research. */
export const LEXICAL_L252:readonly CategoryLesson250[]=[
 {categoryId:'microwave_ovens',registry:{aliases:['microwave','microwaves','microwave oven','microwave ovens']},needs:[
  N('batch_capacity','environment','Cook or heat enough food for several people or large dishes.',['family','large plates','big enough','large dish','for four']),
  N('small_kitchen','environment','Fit a small kitchen or limited counter space.',['small kitchen','limited counter space','compact','small space']),
  N('fast_heating','outcome','Heat food quickly.',['heats quickly','fast','quick','powerful']),
  N('even_heating','outcome','Heat food evenly without cold spots.',['evenly','cold spots','even heating','uneven']),
  N('ease_of_use','outcome','Simple to operate.',['easy to use','simple controls','simple to use']),
  N('cleaning_effort','outcome','Easy to clean.',['easy to clean','cleaning']),
  N('grill_browning','task','Grill or brown food.',['grill','browning','crispy']),
  N('defrosting','task','Defrost frozen food.',['defrost','defrosting']),
 ]},
 {categoryId:'headphones',registry:{aliases:['headphones','headphone','earphones','earbuds','headset','in-ear','over-ear']},needs:[
  N('noise_cancelling','outcome','Block outside noise.',['noise cancelling','noise canceling','anc','block noise']),
  N('comfort','outcome','Comfortable to wear for long periods.',['comfortable','comfort','long sessions']),
  N('sound_quality','outcome','Good sound.',['sound quality','good sound','bass','clear sound']),
  N('battery_life','outcome','Long battery life.',['battery life','long battery']),
  N('wireless','environment','Wireless connection.',['wireless','bluetooth']),
  N('durability','outcome','Last a long time.',['durable','last long','break']),
  N('microphone_calls','task','Make calls.',['calls','microphone','mic']),
  N('portability','environment','Easy to carry or travel with.',['portable','travel','foldable']),
  N('sport_fit','task','Use while exercising.',['running','gym','workout']),
 ]},
];

// ---------------------------------------------------------------------------------------------------------------
// Research-guided teaching (arm G). Written 2026-10-16 after the research recorded in TEACHING_SOURCES252, before any
// Stage 4 request was collected. Each statement says what kind of claim it is:
//  - source_backed_observation: what a consulted source states (paraphrased, cited);
//  - method_reference: how a consulted source says an outcome is measured or defined;
//  - instructor_hypothesis: the instructor's reasoning, not supported by a consulted source;
//  - independently_supported_relation: a relation supported by independent evidence (none yet in this material).
// In the store every taught statement is a technical hypothesis, assistant-authored and unreviewed.
// ---------------------------------------------------------------------------------------------------------------
import {registryWithLessons250,applyLessons250,NEED_CRITERIA250} from './phase250_category_lessons.js';
import type {CategoryEntry248} from './phase248_advisory_journey.js';
import type {KnowledgeStore246} from './phase246_knowledge_store.js';
import {addRelation247} from './phase247_category_relations.js';

export type TeachingBasis252='source_backed_observation'|'method_reference'|'instructor_hypothesis'|'independently_supported_relation';
export interface TeachingSource252 {id:string;url:string;publisher:string;
 role:'regulator'|'standard_catalogue'|'manufacturer_guide'|'retail_guide'|'academic'|'independent_test_publisher'|'standards_body';
 consulted:string;access:string;teaches:string}
export interface Taught252 {text:string;basis:TeachingBasis252;sources:readonly string[]}
export interface TaughtNeed252 extends NeedLesson250 {
 /** D: goal → functional requirement → technical property a declaration can check (SPEC_CRITERIA249 keys). */
 requirement?:{criteria:readonly string[];why:Taught252};
 /** C: what would actually show the outcome (measurand and method), versus what makers declare. */
 outcome?:Taught252;
 /** C: declared attributes that look relevant, and how far they go ("not_sufficient_for", "may_support"). */
 proxies?:readonly {attribute:string;kind:'not_sufficient_for'|'may_support';note:Taught252}[];
 /** D: the clarification asked when this need is recognised but its parameter is unknown. */
 question?:string;
}
export interface CategoryTeaching252 {
 categoryId:string;version:string;written:string;
 /** A: boundary, names (the same names as the lexical arm: a control for name recognition) and contrasting phrases. */
 registry:{aliases:string[];partPhrases:string[]};
 subtypes:readonly Taught252[];mechanisms:readonly Taught252[];
 needs:readonly TaughtNeed252[];
 /** B: how to choose a source type for a given evidence question (a method, not a list of sites). */
 sourceRoutes:readonly {question:string;sourceRoles:readonly TeachingSource252['role'][];why:string}[];
 /** C: how to read evidence types in this category. */
 interpretation:readonly Taught252[];
 /** D: when the taught relations do not apply. */
 applicability:readonly Taught252[];
 /** Known gaps and instructor hypotheses still to test. */
 gaps:readonly Taught252[];
}

export const TEACHING_SOURCES252:readonly TeachingSource252[]=[
 {id:'doe2010',url:'https://www.govinfo.gov/content/pkg/FR-2010-07-22/html/2010-17773.htm',publisher:'US DOE, Federal Register 75 FR 42579',role:'regulator',consulted:'2026-10-16',access:'public domain (US federal)',
  teaches:'DOE repealed the microwave cooking-efficiency test (1 kg water load, IEC 705 based): not accurate or repeatable; water not representative of food; IEC 60705 showed more test-to-test variation'},
 {id:'iec60705',url:'https://webstore.iec.ch/en/publication/82953',publisher:'IEC (catalogue page of IEC 60705:2024 ed. 5)',role:'standard_catalogue',consulted:'2026-10-16',access:'catalogue page public; standard text paid (not read)',
  teaches:'IEC 60705 defines methods for main performance characteristics of household microwave ovens, using water loads and specified dishes; no energy method for grill or steam functions'},
 {id:'fda_mw',url:'https://www.fda.gov/radiation-emitting-products/resources-you-radiation-emitting-products/microwave-ovens',publisher:'US FDA',role:'regulator',consulted:'2026-10-16',access:'public domain (US federal)',
  teaches:'leakage limit 5 mW/cm2 at about 5 cm over the oven life; heating by absorption in water, thick foods heated inside by conduction; do not use an oven whose door does not close firmly or is damaged'},
 {id:'lg_guide',url:'https://www.lg.com/uk/lg-experience/helpful-hints/microwave-size-and-buying-guide/',publisher:'LG UK (manufacturer buying guide)',role:'manufacturer_guide',consulted:'2026-10-16',access:'public page',
  teaches:'types (solo, grill, convection), size bands by household, measure space and clearance; inverter evenness figures attributed to unnamed third-party tests (marketing claims, conditions not disclosed)'},
 {id:'olive2013',url:'https://aes2.org/publications/elibrary-page/?id=16768',publisher:'Olive, Welti, McMullin, AES (Harman research)',role:'academic',consulted:'2026-10-16 (abstract and summaries only)',access:'abstract public; paper paid',
  teaches:'listener preference for headphones relates to the deviation of the measured frequency response from a target curve; measurement on a head-and-torso simulator; research by a manufacturer-affiliated lab'},
 {id:'olive2018',url:'https://aes2.org/publications/elibrary-page/?id=19436',publisher:'Olive et al., AES (Harman research)',role:'academic',consulted:'2026-10-16 (abstract and summaries only)',access:'abstract public; paper paid',
  teaches:'model predicting preference from deviation to target for in-ear headphones (reported r=0.91 in the authors\' sample); later work finds listener segments preferring different bass/treble'},
 {id:'itu_h870',url:'https://www.itu.int/dms_pubrec/itu-t/rec/h/T-REC-H.870-202203-I!!SUM-HTM-E.htm',publisher:'ITU-T / WHO, Recommendation H.870',role:'standards_body',consulted:'2026-10-16',access:'summary public',
  teaches:'safe listening devices: sound-dose limits (adults 80 dB for 40 h/week; children 75 dB), volume limiting and parental limiters'},
 {id:'ip_iec60529',url:'https://www.dlsemc.com/ipx3-and-ipx4-spraying-water-and-splashing-water/',publisher:'test laboratory explainer of IEC 60529 (secondary)',role:'independent_test_publisher',consulted:'2026-10-16',access:'public page',
  teaches:'IPX4 means splashing water from any direction (oscillating tube or spray nozzle, about 10 minutes); it says nothing about immersion, jets or solid particles; IEC 60529 itself not read'},
 {id:'rtings_hp',url:'https://www.rtings.com/headphones',publisher:'RTINGS (independent test publisher)',role:'independent_test_publisher',consulted:'2026-10-16 (review pages: measured fields only; methodology pages not reachable)',access:'robots allow; rights to results not established',
  teaches:'independent tests report noise isolation in dB by band (bass, mid, treble) and scenarios, continuous and total battery life in hours, charge time; values not retained'},
];
const S=(text:string,basis:TeachingBasis252,...sources:string[]):Taught252=>({text,basis,sources});
const TN=(n:NeedLesson250,x:Omit<TaughtNeed252,keyof NeedLesson250>):TaughtNeed252=>({...n,...x});

export const RESEARCH_GUIDED_G252:readonly CategoryTeaching252[]=[
 {categoryId:'microwave_ovens',version:'g252.1',written:'2026-10-16',
  registry:{aliases:['microwave','microwaves','microwave oven','microwave ovens'],
   partPhrases:['microwave safe','microwave cover','microwave plate','microwave popcorn','microwave rice','microwave container','microwave bowl','microwave steamer','microwave cart','microwave shelf','microwave tray','microwave mug']},
  subtypes:[S('Solo models heat and defrost; grill models add browning; combination (convection) models add a fan and heating element and can bake.','source_backed_observation','lg_guide'),
   S('Countertop and built-in installations differ in the space and clearance they need.','source_backed_observation','lg_guide')],
  mechanisms:[S('A magnetron produces microwaves absorbed mainly by water in food; thick foods heat inside by conduction from the outer layers, so heating is uneven without stirring or standing time.','source_backed_observation','fda_mw')],
  needs:[
   TN(N('batch_capacity','environment','Heat or cook for several people or large dishes.',['family','large plate','dinner plate','casserole','for four']),
    {requirement:{criteria:['capacity_min'],why:S('Nominal cavity litres are what makers declare; whether a dish fits also depends on turntable diameter and cavity shape.','instructor_hypothesis')},
     proxies:[{attribute:'turntable diameter',kind:'may_support',note:S('A declared turntable diameter bounds the largest round dish that turns.','instructor_hypothesis')}],
     question:'How many people do you usually heat food for, and what is the largest dish it must hold?'}),
   TN(N('small_kitchen','environment','Fit a small kitchen or limited counter space.',['small kitchen','counter space','fit under','cupboard']),
    {requirement:{criteria:['width_max','depth_max','height_max'],why:S('Measure the space before buying and allow clearance for the door and airflow.','source_backed_observation','lg_guide')},
     question:'How much space do you have for it (width, depth and height), including room for the door to open?'}),
   TN(N('fast_heating','outcome','Heat food quickly.',['heats quickly','fast','wattage']),
    {requirement:{criteria:['power_min'],why:S('Declared microwave output power (measured on a water load by the maker) relates to how fast a water load warms.','instructor_hypothesis','iec60705')},
     outcome:S('time to heat a standard food or water load under one protocol, measured independently','method_reference','iec60705','doe2010'),
     proxies:[{attribute:'microwave power',kind:'may_support',note:S('Declared output power is measured on a water load; DOE found water-load tests poorly repeatable, so small differences in watts mean little.','source_backed_observation','doe2010')}],
     question:'Is speed important enough to pay for a higher output power, or is reheating time not a concern?'}),
   TN(N('even_heating','outcome','Heat food evenly without cold spots.',['evenly','cold spots','cold in the middle']),
    {outcome:S('temperature spread across a standard load after heating, measured independently under one protocol','method_reference','iec60705'),
     proxies:[{attribute:'microwave power',kind:'not_sufficient_for',note:S('Output power says how much energy, not how evenly it is absorbed; thick foods heat by conduction inside.','source_backed_observation','fda_mw')},
      {attribute:'inverter',kind:'not_sufficient_for',note:S('Inverter evenness figures on maker pages come from unnamed tests with undisclosed conditions: claims, not evidence.','source_backed_observation','lg_guide')}]}),
   TN(N('defrosting','task','Defrost frozen food.',['defrost','frozen']),
    {outcome:S('evenness of a standard frozen load after the defrost programme, measured independently','instructor_hypothesis')}),
   TN(N('grill_browning','task','Brown or crisp food, or bake, rather than only reheat.',['grill','browning','soggy']),
    {proxies:[{attribute:'grill power',kind:'not_sufficient_for',note:S('IEC 60705 has no energy method for grill functions; grill watts do not show browning results.','source_backed_observation','iec60705')}],
     question:'Do you want to brown or bake in it (grill or combination model), or only reheat and defrost (solo model)?'}),
   TN(N('ease_of_use','outcome','Simple to operate.',['easy to use','simple controls','dial']),{}),
   TN(N('cleaning_effort','outcome','Easy to clean.',['easy to clean','wipe']),
    {proxies:[{attribute:'easy clean coating',kind:'not_sufficient_for',note:S('Coating and antibacterial claims are maker claims from maker-chosen tests.','source_backed_observation','lg_guide')}]}),
   TN(N('radiation_safety','failure','Concern about microwave leakage or a damaged door.',['radiation','leakage']),
    {outcome:S('Leakage is regulated (US limit 5 mW/cm2 at about 5 cm over the oven life); a damaged or loose door is the warning sign, not the model choice.','source_backed_observation','fda_mw')}),
  ],
  sourceRoutes:[
   {question:'Does a model fit, hold a dish, have a grill or a given output power?',sourceRoles:['manufacturer_guide'],why:'declared design facts: the maker\'s own specification page for that exact model code'},
   {question:'Does a model heat faster or more evenly than another?',sourceRoles:['independent_test_publisher'],why:'only independent measurements on the same protocol compare outcomes; maker figures come from maker-chosen tests'},
   {question:'What does a declared number mean and how is it measured?',sourceRoles:['standard_catalogue','regulator'],why:'standards and regulators define the measurand and expose known limits (DOE repeal)'},
   {question:'Is a model or brand subject to a safety notice?',sourceRoles:['regulator'],why:'regulator notices about identified models; never a performance signal'},
  ],
  interpretation:[
   S('A declared output power is a maker measurement on a water load, not an independent result; DOE found such water-load tests not accurate or repeatable enough to regulate.','source_backed_observation','doe2010'),
   S('Litre capacity is a nominal cavity figure; it does not say whether a given dish fits or turns.','instructor_hypothesis'),
  ],
  applicability:[
   S('Water-load results do not represent real food loads; conclusions about speed transfer to food only approximately.','source_backed_observation','doe2010'),
   S('Combination and grill functions are outside the microwave water-load methods; their results need other tests.','source_backed_observation','iec60705'),
  ],
  gaps:[S('No independent heating-evenness or speed results are held for any stored model.','instructor_hypothesis'),
   S('IEC 60705 test clauses (output power, evenness) were not read: the standard text is paid.','instructor_hypothesis','iec60705')],
 },
 {categoryId:'headphones',version:'g252.1',written:'2026-10-16',
  registry:{aliases:['headphones','headphone','earphones','earbuds','headset','in-ear','over-ear'],
   partPhrases:['ear pads','earpads','headphone stand','headphone amp','headphone jack','headphone adapter','headphone cable','ear tips','headphone splitter','headphone case','headphone port','headphone output']},
  subtypes:[S('Over-ear, on-ear and in-ear designs; closed-back designs isolate more than open-back; active noise cancelling adds microphones and processing.','instructor_hypothesis'),
   S('Wired, Bluetooth and radio (RF) wireless headphones differ in latency, battery needs and range.','instructor_hypothesis')],
  mechanisms:[S('Perceived sound depends on the frequency response at the eardrum, which depends on fit and seal; it is measured on a head-and-torso simulator.','source_backed_observation','olive2013')],
  needs:[
   TN(N('noise_cancelling','outcome','Hear less outside noise (active cancelling or passive isolation).',['noise cancelling','anc','noisy','commute','plane']),
    {outcome:S('attenuation in dB by frequency band (bass, mid, treble) measured on the same rig, with and without cancelling','method_reference','rtings_hp'),
     proxies:[{attribute:'noise cancelling',kind:'not_sufficient_for',note:S('A declared "noise cancelling" feature does not say how much noise, at which frequencies; only measured attenuation compares.','source_backed_observation','rtings_hp')}],
     question:'Where will you mostly use them: commuting, flights, an open office or at home?'}),
   TN(N('comfort','outcome','Comfortable for long sessions.',['comfortable','hours','glasses','hurt']),
    {requirement:{criteria:['weight_max'],why:S('Declared weight is one checkable part of comfort; clamping force and fit are not declared.','instructor_hypothesis')},
     question:'Do you prefer over-ear, on-ear or in-ear, and do you wear glasses?'}),
   TN(N('sound_quality','outcome','Sound the listener prefers or finds accurate.',['sound quality','bass','accurate']),
    {outcome:S('measured frequency response compared with a preference target on a head simulator','method_reference','olive2013','olive2018'),
     proxies:[{attribute:'frequency response',kind:'not_sufficient_for',note:S('A declared range such as 20 Hz to 20 kHz says nothing about tonal balance; preference relates to the measured response curve.','source_backed_observation','olive2013')},
      {attribute:'driver diameter',kind:'not_sufficient_for',note:S('Driver size is a design fact, not a measured sound outcome.','instructor_hypothesis')}]}),
   TN(N('battery_life','outcome','Long playback between charges.',['battery','flight']),
    {requirement:{criteria:['battery_life_min'],why:S('Makers declare playback hours, usually "up to" under their own conditions.','instructor_hypothesis')},
     outcome:S('continuous playback hours measured independently at a stated volume, with cancelling on and off','method_reference','rtings_hp'),
     question:'How many hours of listening do you need between charges?'}),
   TN(N('wireless','environment','No cable to the source.',['wireless','bluetooth']),
    {question:'Do you need them wireless, or is a cable fine (no charging, no latency)?'}),
   TN(N('microphone_calls','task','Calls and meetings.',['calls','meetings','zoom']),
    {outcome:S('recorded microphone quality in quiet and noisy conditions, measured independently','instructor_hypothesis')}),
   TN(N('sport_fit','task','Exercise: secure fit, sweat and rain.',['running','gym','sweat']),
    {outcome:S('An IP rating is a certified test of water ingress: IPX4 is splashing from any direction, not immersion or jets.','source_backed_observation','ip_iec60529'),
     question:'Will you wear them for running or workouts, and in rain?'}),
   TN(N('hearing_safety','failure','Protect hearing, for example a child\'s.',['volume limit','kids']),
    {outcome:S('Safe-listening devices limit sound dose (WHO/ITU H.870: adults 80 dB for 40 h a week, children 75 dB) and offer parental volume limits.','source_backed_observation','itu_h870'),
     question:'Who will use them, and do you need a volume limit (for a child)?'}),
   TN(N('durability','outcome','Last a long time.',['durable','broke']),{}),
   TN(N('portability','environment','Easy to carry or travel with.',['foldable']),{}),
  ],
  sourceRoutes:[
   {question:'Weight, battery hours as declared, codecs, connection, fit type?',sourceRoles:['manufacturer_guide'],why:'declared design facts from the maker\'s page for that exact model'},
   {question:'Which one blocks more noise, sounds closer to a preference target, or lasts longer at a set volume?',sourceRoles:['independent_test_publisher'],why:'only measurements on one rig and protocol compare outcomes'},
   {question:'Is a target response or a test method valid?',sourceRoles:['academic','standards_body'],why:'peer-reviewed listening research and standards define what is measured and its limits (note manufacturer-affiliated research)'},
   {question:'Is a volume level safe, especially for children?',sourceRoles:['standards_body'],why:'WHO/ITU safe-listening limits'},
  ],
  interpretation:[
   S('Declared battery life is usually "up to" under maker conditions: an upper bound; below the user\'s need it excludes, above it proves nothing.','instructor_hypothesis'),
   S('Preference-target research comes from a manufacturer-affiliated lab and listener segments differ; a target deviation is a predictor, not a verdict for every listener.','source_backed_observation','olive2018'),
  ],
  applicability:[
   S('Fit changes in-ear and over-ear measurements; a result on a test head may differ on a given listener.','source_backed_observation','olive2013'),
   S('An IP rating covers water ingress as tested, not sweat chemistry or durability over months.','source_backed_observation','ip_iec60529'),
  ],
  gaps:[S('No independent isolation, battery or response measurements are held for any stored model; rights to retain RTINGS results are not established.','instructor_hypothesis','rtings_hp'),
   S('IEC 60268-7 (headphone measurement methods) and IEC 60529 texts were not read.','instructor_hypothesis')],
 },
];

/** The phrase budget actually used by a lesson or teaching (names, cues and need phrases). */
export function phraseCount252(l:{registry?:{aliases?:readonly string[];cues?:readonly string[]};needs:readonly {aliases:readonly string[]}[]}):number{
 return (l.registry?.aliases?.length??0)+(l.registry?.cues?.length??0)+l.needs.reduce((a,n)=>a+n.aliases.length,0);
}
/** The vocabulary part of a teaching, in the Phase250 lesson format (same machinery as the lexical arm). */
export function lessonOf252(t:CategoryTeaching252):CategoryLesson250{
 return {categoryId:t.categoryId,registry:{aliases:[...t.registry.aliases],partPhrases:[...t.registry.partPhrases]},
  needs:t.needs.map(n=>({id:n.id,kind:n.kind,statement:n.statement,aliases:[...n.aliases],...(n.counterexamples?{counterexamples:[...n.counterexamples]}:{})})),
  mechanism:t.mechanisms[0]?.text,measurement:t.interpretation[0]?.text};
}
/** Registry with the teachings: Phase250 merge, plus each taught need's checkable criteria and clarification. */
export function registryWithTeaching252(base:readonly CategoryEntry248[],teachings:readonly CategoryTeaching252[]):CategoryEntry248[]{
 const reg=registryWithLessons250(base,teachings.map(lessonOf252));
 return reg.map(e=>{const t=teachings.find(x=>x.categoryId===e.id);if(!t)return e;
  const needCriteria:Record<string,readonly string[]>={...NEED_CRITERIA250};const needQuestions:Record<string,string>={};
  for(const n of t.needs){if(n.requirement)needCriteria[n.id]=[...n.requirement.criteria];if(n.question)needQuestions[n.id]=n.question;}
  return {...e,needCriteria,needQuestions};});
}
const cite=(x:Taught252)=>`${x.text} [${x.basis}${x.sources.length?'; '+x.sources.map(id=>TEACHING_SOURCES252.find(s=>s.id===id)?.url??id).join(' '):''}]`.slice(0,500);
/** Applies teachings through the store's own APIs (idempotent): need concepts (Phase250 path), then measurement,
 * subtype, mechanism, gap and question items, measured_by relations from each taught method to its need, and
 * declared-attribute relations (may_support / not_sufficient_for). All are hypotheses; nothing is promoted. */
export function applyTeaching252(store:KnowledgeStore246,teachings:readonly CategoryTeaching252[],at=new Date().toISOString()){
 const lessons=applyLessons250(store,teachings.map(lessonOf252),at);let items=0,relations=0;
 for(const t of teachings){
  const add=(section:Parameters<KnowledgeStore246['addCategoryItem246']>[0]['section'],x:Taught252,stream:string)=>{
   const n=store.categoryItems246(t.categoryId).length;
   const id=store.addCategoryItem246({categoryId:t.categoryId,section,statement:cite(x),knowledgeClass:'technical_hypothesis',provenance:'assistant_authored_unreviewed',studyStream:stream as never},at);
   if(store.categoryItems246(t.categoryId).length>n)items++;return id;};
  const needItem=(id:string)=>store.categoryItems246(t.categoryId).find(i=>i.concept?.id===id)?.itemId;
  for(const x of t.subtypes)add('product_subtypes',x,'technical_mechanisms');
  for(const x of t.mechanisms.slice(1))add('mechanisms',x,'technical_mechanisms');
  for(const x of [...t.interpretation.slice(1),...t.applicability])add('spec_need_relevance',x,'original_test_methods');
  for(const x of t.gaps)add('unknowns_priorities',x,'original_test_methods');
  for(const n of t.needs){const target=needItem(n.id);if(!target)continue;
   if(n.outcome){const m=add('quality_measurements',n.outcome,'original_test_methods');
    const before=store.db.prepare('SELECT count(*) c FROM category_relations').get() as {c:number};
    addRelation247(store,{categoryId:t.categoryId,from:'item:'+m,to:'item:'+target,kind:'measured_by',support:'hypothesis',qualification:`${n.outcome.basis}: ${n.outcome.text}`.slice(0,300).replace(/[<>\r\n]/g,' ')},at);
    if((store.db.prepare('SELECT count(*) c FROM category_relations').get() as {c:number}).c>before.c)relations++;}
   for(const p of n.proxies??[]){const before=store.db.prepare('SELECT count(*) c FROM category_relations').get() as {c:number};
    addRelation247(store,{categoryId:t.categoryId,from:'attr:'+p.attribute.toLowerCase(),to:'item:'+target,kind:p.kind,support:'hypothesis',qualification:`${p.note.basis}: ${p.note.text}`.slice(0,300).replace(/[<>\r\n]/g,' ')},at);
    if((store.db.prepare('SELECT count(*) c FROM category_relations').get() as {c:number}).c>before.c)relations++;}
   if(n.question)add('user_questions',S(n.question,'instructor_hypothesis'),'user_outcomes');
  }
 }
 return {...lessons,items,relations};
}
