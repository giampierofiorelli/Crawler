// English-first local browser research UI. All displayed user text uses textContent.
let state=null,token=null,busy=false;
const el=id=>document.getElementById(id);
function element(tag,klass,text){const e=document.createElement(tag);if(klass)e.className=klass;if(text!==undefined)e.textContent=String(text);return e;}
function say(message,isError=false){const n=el('notice');n.textContent=message;n.style.background=isError?'#ffe9e8':'#eaf1fa';}
function presentValue(x){return x.kind==='quantity'?`${x.value} ${x.unit}`:String(x.value);}
async function request(path,data={}){
 if(busy)throw Error('A request is already in progress');busy=true;
 try{const r=await fetch(path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...data,...(token?{session:token}:{}),...(state?{expectedRevision:state.snapshot.revision}:{})})});
  const result=await r.json();if(!r.ok){if(r.status===409&&result.snapshot){state=result;render();}throw Error(result.error??'Unable to save the change');}
  if(result.session)token=result.session;state=result;render();return result;
 }finally{busy=false;}
}
function saveAction(action,message){request('/api/action',{action}).then(()=>say(message)).catch(e=>say(e.message,true));}
function makeSelect(options,selected){const s=element('select');for(const [val,title] of options){const o=element('option','',title);o.value=val;o.selected=val===selected;s.append(o);}return s;}
const priorities=[['low','Low'],['normal','Normal'],['high','High'],['hard','Essential (must-have)']];
function drawCriterion(c,status){
 const card=element('article','criterion');card.dataset.key=c.key;
 card.append(element('span','tag',status==='candidate'?'Suggestion · not confirmed':status==='confirmed'?(c.priority==='hard'?'Essential confirmed need':'Confirmed need'):'Not currently active'));
 card.append(element('strong','',c.label));card.append(element('div','sub',`Key: ${c.key} · Value: ${presentValue(c.value)}`));
 const controls=element('div','criterion-controls');
 if(status==='candidate'){
  const priorityBox=element('div');const label=element('label','','Importance on confirmation');const priority=makeSelect(priorities,'normal');label.append(priority);priorityBox.append(label);controls.append(priorityBox);
  const accept=element('button','','Confirm need');accept.type='button';accept.addEventListener('click',()=>saveAction({type:'confirm_candidate',source:'user_web_control',key:c.key,priority:priority.value},'Criterion confirmed. Product suitability is still unverified.'));
  const deny=element('button','tertiary','Not wanted');deny.type='button';deny.addEventListener('click',()=>saveAction({type:'mark_criterion',source:'user_web_control',key:c.key,status:'denied'},'Suggestion marked as not wanted. This is not a verified product exclusion.'));
  const dismiss=element('button','tertiary','Set aside');dismiss.type='button';dismiss.addEventListener('click',()=>saveAction({type:'mark_criterion',source:'user_web_control',key:c.key,status:'withdrawn'},'Suggestion set aside.'));controls.append(accept,deny,dismiss);
 }else if(status==='confirmed'){
  const priorityBox=element('div');const label=element('label','','Importance');const priority=makeSelect(priorities,c.priority);priority.addEventListener('change',()=>saveAction({type:'set_priority',source:'user_web_control',key:c.key,priority:priority.value},'Priority updated.'));label.append(priority);priorityBox.append(label);controls.append(priorityBox);
  const edit=element('button','secondary','Edit');edit.type='button';const form=element('form','editor');form.hidden=true;
  const lab=element('label','','Need');const text=element('input');text.required=true;text.minLength=3;text.maxLength=300;text.value=c.label;lab.append(text);
  const vlab=element('label','','Value');let val,unit=null;
  if(c.value.kind==='boolean'){val=makeSelect([['true','Yes'],['false','No']],String(c.value.value));}
  else {val=element('input');val.required=true;if(c.value.kind==='quantity'){val.type='number';val.step='any';val.value=String(c.value.value);}
   else {val.maxLength=120;val.value=c.value.value;}}
  vlab.append(val);
  if(c.value.kind==='quantity'){const ulab=element('label','','Unit');unit=element('input');unit.required=true;unit.pattern='[a-z][a-z0-9_.-]*';unit.value=c.value.unit;ulab.append(unit);form.append(lab,vlab,ulab);}
  else form.append(lab,vlab);
  const save=element('button','','Save change');save.type='submit';form.append(save);
  form.addEventListener('submit',e=>{e.preventDefault();const value=c.value.kind==='boolean'?{kind:'boolean',value:val.value==='true'}:c.value.kind==='quantity'?{kind:'quantity',value:Number(val.value),unit:unit.value.trim()}:{kind:'choice',value:val.value.trim()};saveAction({type:'set_criterion',source:'user_web_control',key:c.key,label:text.value.trim(),value,priority:priority.value},'Criterion updated.');});
  edit.addEventListener('click',()=>{form.hidden=!form.hidden;if(!form.hidden)text.focus();});
  const setAside=element('button','tertiary','Set aside');setAside.type='button';setAside.addEventListener('click',()=>saveAction({type:'mark_criterion',source:'user_web_control',key:c.key,status:'withdrawn'},'Criterion set aside.'));
  controls.append(edit,setAside);card.append(controls,form);return card;
 }else{
  const activate=element('button','secondary','Restore and confirm');activate.type='button';activate.addEventListener('click',()=>saveAction({type:'set_criterion',source:'user_web_control',key:c.key,label:c.label,value:c.value,priority:c.priority},'Criterion restored.'));
  controls.append(activate);
 }
 card.append(controls);return card;
}
function putList(id,criteria,placeholder){const dest=el(id);dest.replaceChildren();if(!criteria.length){dest.append(element('p','empty',placeholder));return;}for(const c of criteria)dest.append(drawCriterion(c,c.status));}
function render(){if(!state)return;
 const s=state.snapshot;el('revision').textContent=`Revision ${s.revision}`;el('undo').disabled=!state.canUndo;
 el('goal-echo').textContent=state.originalRequest?`Your last request: “${state.originalRequest}”`:'Your original goal is still available to describe above.';
 const unmapped=Boolean(state.originalRequest)&&s.criteria.length===0;el('unmapped').hidden=!unmapped;
 if(unmapped)el('unmapped').textContent='We could not reliably infer a technical criterion from this request. Your original goal is preserved. Add a requirement or explain it in different words.';
 putList('candidates',s.criteria.filter(c=>c.status==='candidate'),'No provisional suggestions.');
 putList('confirmed',s.criteria.filter(c=>c.status==='confirmed'),'You haven’t confirmed any needs yet.');
 putList('inactive',s.criteria.filter(c=>!['candidate','confirmed'].includes(c.status)),'None.');
 const safety=el('safety');safety.hidden=false;const cautions=el('cautions');cautions.replaceChildren();
 // Material constraints and ranking limitations always remain visible.
 const hard=s.criteria.filter(c=>c.status==='confirmed'&&c.priority==='hard');
 const cautionTexts=[...hard.map(c=>`Essential user requirement: ${c.label} (${presentValue(c.value)}). No product has been checked against it.`),...state.view.visibleCautions,...state.seriousLimits];
 for(const c of [...new Set(cautionTexts)]){cautions.append(element('li','',c));}
 const productPanel=el('products-status');
 if(state.firstAnswer?.status==='ranking_ready'){
  productPanel.replaceChildren();
  productPanel.append(element('p','',`${state.rankingStatus==='dynamic_product_knowledge'?'Calculated now from reviewed product knowledge':'Reviewed cached release'}. Policy: ${state.firstAnswer.policyRevision}. Ranked against confirmed needs only.`));
  const list=element('ol','product-results');
  for(const p of state.firstAnswer.ranked){
   const item=element('li','product-result');item.append(element('strong','',`Rank ${p.rank}: ${p.name}`));
   item.append(element('p','',`Policy points: ${p.scorePoints}/10,000 (not a physical performance measurement).`));
   const srcs=element('ul','');for(const url of p.sourceUrls){const li=element('li');const a=element('a','',url);a.href=url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);srcs.append(li);}item.append(srcs);list.append(item);
  }
  productPanel.append(list);
  if(state.firstAnswer.held.length){const note=element('details');note.append(element('summary','',`${state.firstAnswer.held.length} candidates not ranked or held out`));const ul=element('ul');for(const p of state.firstAnswer.held)ul.append(element('li','',`${p.name}: ${p.reason}`));note.append(ul);productPanel.append(note);}
 }else{productPanel.replaceChildren(element('strong','','Not available yet'),element('p','',state.firstAnswer?.visibleCautions?.[0]??'No reviewed product ranking connected.'));}
 el('task').value=s.scope.task;el('category').value=s.scope.category??'';
 const change=state.changes;el('change-summary').textContent=change?(change.changeInConfirmedInputs?'Confirmed inputs changed. Any future verified ranking would need recomputation.':'Confirmed ranking inputs have not changed in this revision.'):'Your confirmed requirements will be tracked when you revise them.';
 const changes=el('changed-keys');changes.replaceChildren();if(change){for(const k of change.changedCriterionKeys)changes.append(element('li','',k));if(change.scopeChanged)changes.append(element('li','','Product scope changed'));}
 el('detail-trace').textContent=`State revision ${s.revision}. Confirmed-input fingerprint: ${s.rankInputFingerprint}. This hash is NOT a signature or product ranking. Evidence and model-variant validation are not connected.`;
}
async function bootPhase178(){
 try{await request('/api/create');say('Start with your everyday goal.');}catch(e){say(e.message,true);return;}
 el('intake-form').addEventListener('submit',e=>{e.preventDefault();request('/api/intake',{text:el('goal').value}).then(()=>say('Suggestions updated. Please review them before confirming.')).catch(err=>say(err.message,true));});
 el('scope-form').addEventListener('submit',e=>{e.preventDefault();const cat=el('category').value.trim();saveAction({type:'set_scope',source:'user_web_control',scope:{task:el('task').value,category:cat||null}},'Your product area was updated.');});
 el('add-form').addEventListener('submit',e=>{e.preventDefault();saveAction({type:'set_criterion',source:'user_web_control',key:el('criterion-key').value.trim(),label:el('criterion-label').value.trim(),value:{kind:'choice',value:el('criterion-value').value.trim()},priority:el('criterion-priority').value},'Your criterion was added and confirmed.');});
 el('undo').addEventListener('click',()=>request('/api/undo').then(()=>say('Last change undone; the undo is recorded as a new revision.')).catch(e=>say(e.message,true)));
 el('reset').addEventListener('click',()=>{token=null;state=null;request('/api/create').then(()=>{el('goal').value='';say('A fresh choice has been started.');}).catch(e=>say(e.message,true));});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootPhase178,{once:true});else void bootPhase178();
