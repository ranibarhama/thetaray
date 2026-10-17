/* Studio next (v4) — engine. Own state, reuses RSD data. Never touches RSE/v3 state. */
(function(){
const D=window.RSD;
const R=window.R4={};
const S=R.state={jobs:[],openId:null,v:0,quiet:false};
const subs=[];
R.subscribe=f=>{subs.push(f);return()=>{const i=subs.indexOf(f);if(i>=0)subs.splice(i,1);};};
const emit=R.emit=()=>{S.v++;subs.forEach(f=>f(S.v));};
const uid=()=>Math.random().toString(36).slice(2,9);
const P4=w=>D.PEOPLE[w]||D.PEOPLE.you;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
R.get=id=>S.jobs.find(j=>j.id===id);
R.open=id=>{S.openId=id;emit();};
R.close=()=>{S.openId=null;emit();};

/* ---------- authority: one dial, five notches ---------- */
const LEVELS=R.LEVELS=[
  {k:0,t:'Watch',d:'Ray decides nothing. It shows what it would do.',need:null},
  {k:1,t:'Suggest',d:'Ray proposes an outcome on every alert. You confirm each one.',need:'Nothing — this is where every job starts.'},
  {k:2,t:'Act with my approval',d:'Ray works live alerts beside your analysts. Nothing it decides takes effect.',
   need:'One practice round at 90% agreement or better, with no missed escalations.'},
  {k:3,t:'Act alone on low risk',d:'Ray closes clear false positives by itself. Anything else still comes to you.',
   need:'Four weeks of shadow at target, signed by the MLRO and the Head of FCC.'},
  {k:4,t:'Act alone',d:'Ray runs the whole job and reports. You see only exceptions.',
   need:'Thirty days at level 3 with no missed SARs, and your signature on the authority.'}
];

/* ---------- alerts Ray works on (real-looking, drawn from the use case) ---------- */
const WHY={
  close:[['Pattern seen before','This counterparty pair closed 4 times in 30 days, same amount band.'],
    ['Inside policy','§3.1 treats repeat low-value transfers between known parties as expected activity.'],
    ['No sanctions hit','Re-screened against OFSI, OFAC and EU lists 2 minutes ago — clean.']],
  esc:[['New counterparty','First transfer to this beneficiary; no history on the account.'],
    ['Policy trigger','§4.3 requires escalation when a high-risk jurisdiction appears in the chain.'],
    ['Structuring shape','Six transfers just under the reporting threshold within 48 hours.']],
  rfi:[['Missing KYC','Source of funds was never documented for this corporate account.'],
    ['Policy trigger','§5.2 asks for an RFI before filing when the customer file is incomplete.']]
};
const NAMES=['Summit Capital Bank','Orion Trading LLC','Banco Norte Pacifico','Delta Freight Co','Meridian Holdings',
  'Castle Point Ltd','Aurora Exchange','Harbour & Vine','Nordik Metals','Bay Street Imports'];
const OUT={close:'Close as false positive',esc:'Escalate to L2',rfi:'Escalate + request information',sar:'Recommend a SAR'};
let aseq=31870;
const mkAlert=(kind)=>{
  const k=kind||(Math.random()<0.72?'close':Math.random()<0.7?'esc':'rfi');
  return {id:'A-'+(++aseq),coin:Math.random(),who:NAMES[Math.floor(Math.random()*NAMES.length)],
    amt:'$'+(Math.floor(Math.random()*900)+40).toLocaleString()+',000',
    kind:k,out:OUT[k],why:WHY[k]||WHY.close,conf:k==='close'?88+Math.floor(Math.random()*11):62+Math.floor(Math.random()*26)};
};
R.mkAlert=mkAlert;

/* ---------- a job ---------- */
const newJob=(tplId,name)=>{
  const t=tplId?D.TEMPLATES.find(x=>x.id===tplId):null;
  return {id:'j'+uid(),name:name||(t?t.t:'New job'),tpl:t?t.id:null,cat:t?t.cat:'tm',
    authority:1,unlocked:1,stream:[],queue:[],memory:[],docs:[],signs:[],trail:[],
    stats:{seen:0,agreed:0,corrected:0,rounds:0,agree:0,shadowDay:0,shadowTotal:28,live:false,closedByRay:0},
    running:false,born:Date.now()};
};
R.newJob=newJob;

const push=(j,card)=>{card.id=uid();card.at=card.at||'now';j.stream.unshift(card);if(j.stream.length>60)j.stream.pop();return card;};
R.push=push;
const log=(j,text,who)=>{j.trail.unshift({id:uid(),text,who:who||'ray',at:'now'});};
R.log=log;

const addRule=(j,text,src,cat,conf)=>{
  const r={id:uid(),text,src:src||null,cat:cat||'policy',conf:conf===undefined?72:conf,on:true,at:'now',hits:0};
  j.memory.unshift(r);return r;
};
R.addRule=addRule;
R.toggleRule=(j,id)=>{const r=j.memory.find(x=>x.id===id);if(!r)return;r.on=!r.on;
  log(j,(r.on?'Re-enabled':'Turned off')+' rule: '+r.text,'you');
  push(j,{kind:'note',text:r.on?'Rule back on. I will apply it from the next alert.':'Rule off. I will stop applying it — the alerts it changed are listed in the audit trail.'});
  emit();};
R.editRule=(j,id,text)=>{const r=j.memory.find(x=>x.id===id);if(!r)return;const before=r.text;r.text=text;r.at='now';
  log(j,'Edited rule: "'+before+'" → "'+text+'"','you');emit();};

/* ---------- the queue ---------- */
const FRONT={unlock:1,sign:1,comment:1,propose:1,milestone:1,waiting:1};
const enq=(j,item)=>{item.id=uid();item.at=item.at||'now';
  // the things that move the job forward jump the alert queue — they are why you are here
  if(FRONT[item.kind])j.queue.unshift(item);else j.queue.push(item);
  return item;};
R.enq=enq;
R.later=(j,id)=>{const i=j.queue.findIndex(x=>x.id===id);if(i<0)return;
  const it=j.queue.splice(i,1)[0];it.later=true;j.queue.push(it);emit();};
R.deq=(j,id)=>{const i=j.queue.findIndex(x=>x.id===id);if(i>=0)j.queue.splice(i,1);};

/* ---------- Ray at work: the live loop ---------- */
R.start=async(j)=>{
  if(j.running)return;j.running=true;emit();
  push(j,{kind:'note',text:'Reading your policy and the last 1,000 closed alerts. I will start deciding now and show you each one.'});
  log(j,'Started working on '+j.name,'ray');emit();
  await wait(700);
  // the first three rules Ray derives from the policy itself
  if(!j.memory.length){
    [['Close repeat low-value transfers between known parties','policy',84],
     ['Escalate anything touching a high-risk jurisdiction','policy',91],
     ['Never file a SAR — stop at L2 and let a person decide','guard',99]]
      .forEach(r=>addRule(j,r[0],{kind:'policy',ref:'from your policy'},r[1],r[2]));
    push(j,{kind:'learned',n:3,text:'Three rules read straight from your policy.'});
  }
  emit();
  R.tick(j);
};
R.stop=(j)=>{j.running=false;emit();};

let timers={};
/* the one rule that decides which side of the line an alert falls on */
R.needsMe=(j,a,lvl)=>{const L=lvl===undefined?j.authority:lvl;
  if(L<=1)return true;                                   // watch / suggest: every alert is yours
  if(L===2)return a.kind==='sar'||a.conf<78;             // beside your analysts: it settles the clear ones
  if(L===3)return a.kind!=='close'?a.conf<72:false;      // alone on low risk: closes clear false positives itself
  return a.conf<55;                                      // alone: only the genuinely unclear reach you
};
R.tick=(j)=>{
  clearTimeout(timers[j.id]);
  const step=async()=>{
    if(!j.running)return;
    // Ray never floods you: while you owe it decisions it keeps working but stops queueing
    const waiting=j.queue.filter(q=>q.kind==='decide').length;
    if(waiting>=6){timers[j.id]=setTimeout(step,1200);return;}
    const a=mkAlert();
    j.stats.seen++;
    const needsMe=R.needsMe(j,a);
    if(needsMe){
      enq(j,{kind:'decide',alert:a});
      push(j,{kind:'decision',alert:a,state:'queued'});
    }else{
      if(a.kind==='close')j.stats.closedByRay++;
      push(j,{kind:'decision',alert:a,state:'done'});
    }
    emit();
    timers[j.id]=setTimeout(step,j.authority>=3?900:1600);
  };
  timers[j.id]=setTimeout(step,900);
};

/* ---------- the coach loop ---------- */
R.agree=(j,itemId)=>{
  const it=j.queue.find(x=>x.id===itemId);if(!it)return;
  R.deq(j,itemId);j.stats.agreed++;
  const c=j.stream.find(s=>s.alert&&it.alert&&s.alert.id===it.alert.id);if(c)c.state='agreed';
  // agreement raises confidence in the rules that produced it
  j.memory.slice(0,3).forEach(r=>{if(r.on)r.conf=Math.min(99,r.conf+1);});
  log(j,'Agreed with Ray on '+it.alert.id,'you');
  R.afterCoach(j);emit();
};
R.correct=(j,itemId,outKind,scope)=>{
  const it=j.queue.find(x=>x.id===itemId);if(!it)return;
  R.deq(j,itemId);j.stats.corrected++;
  const c=j.stream.find(s=>s.alert&&it.alert&&s.alert.id===it.alert.id);
  if(c){c.state='corrected';c.correctedTo=OUT[outKind];}
  const scopeT={one:'this alert only',like:'every alert like this',ask:'ask me next time'}[scope];
  let text;
  if(scope==='one')text='On '+it.alert.id+': '+OUT[outKind].toLowerCase()+' (one-off, not a rule)';
  else if(scope==='ask')text='Ask me before deciding alerts that look like '+it.alert.id;
  else text=OUT[outKind]+' when the alert looks like '+it.alert.id+' — '+it.alert.who+', '+it.alert.amt;
  const r=addRule(j,text,{kind:'alert',ref:it.alert.id,by:'you'},scope==='ask'?'ask':'learned',scope==='one'?60:78);
  push(j,{kind:'learned',n:1,text:'Learned from '+it.alert.id+' — '+scopeT+'.',ruleId:r.id});
  log(j,'Corrected '+it.alert.id+' → '+OUT[outKind]+' ('+scopeT+')','you');
  R.afterCoach(j);emit();
};
R.askWhy=(j,itemId)=>{const it=j.queue.find(x=>x.id===itemId);if(it)it.why=!it.why;emit();};

/* after enough coaching Ray offers a replay, then the next notch */
R.afterCoach=(j)=>{
  const done=j.stats.agreed+j.stats.corrected;
  if(done>0&&done%8===0)enq(j,{kind:'milestone',done,rules:j.memory.filter(r=>r.cat==='learned'||r.cat==='ask').length});
  if(done>=4&&!j.replayOffered&&!j.stats.rounds){
    j.replayOffered=true;
    enq(j,{kind:'propose',t:'Replay the last 1,000 closed alerts with what I just learned',
      d:'About a minute. It tells us both whether the corrections hold up, and it is the evidence the next authority notch needs.',ok:'Run it',act:'replay'});
  }
  if(done>=4&&j.stats.agree>=90&&j.unlocked<2&&!j.queue.some(q=>q.kind==='unlock'))R.offerUnlock(j,2);
};
R.offerUnlock=(j,lvl)=>{
  enq(j,{kind:'unlock',lvl,t:'You can move me to “'+LEVELS[lvl].t+'”',
    d:LEVELS[lvl].d+' The evidence is in — '+(lvl===2?j.stats.agree+'% agreement over 1,000 of your own closed alerts, no missed escalations.':'targets met and signed.')});
};

R.acceptAll=(j)=>{
  const props=j.queue.filter(q=>q.kind==='propose'&&q.rule);
  props.forEach(p=>{R.deq(j,p.id);addRule(j,p.rule,{kind:'ray',ref:'Ray proposed it'},'learned',82);log(j,'Allowed: '+p.rule,'you');});
  if(props.length){push(j,{kind:'learned',n:props.length,text:'Allowed '+props.length+' of Ray’s proposals in one go.'});emit();}
};

/* ---------- undo the last thing you taught ---------- */
R.undo=(j)=>{
  const r=j.memory.find(x=>x.cat==='learned'||x.cat==='ask');
  if(!r){push(j,{kind:'note',text:'Nothing of yours to undo yet — the rules in my memory all came from your policy.'});emit();return;}
  j.memory=j.memory.filter(x=>x.id!==r.id);
  push(j,{kind:'note',text:'Undone: **'+r.text+'**. It is out of my memory, and the undo itself is in the trail.'});
  log(j,'Undid rule: '+r.text,'you');emit();
};

/* ---------- hand the coaching to someone else ---------- */
R.handTo=(j,who,note)=>{
  j.handedTo=who;
  enq(j,{kind:'waiting',who,t:P4(who).n+' is deciding these',
    d:'Context, rules and the open queue were sent over'+(note?' with your note: “'+note+'”':'')+'. You can nudge or take it back at any time.'});
  push(j,{kind:'note',text:'**'+P4(who).n+' is notified.** They see the same queue you do; nothing waits on you until they are done.'});
  log(j,'Handed the coaching to '+P4(who).n,'you');emit();
};
R.nudge=(j)=>{const w=j.queue.find(q=>q.kind==='waiting');if(w)w.d='Nudged just now. '+w.d;
  log(j,'Nudged '+(j.handedTo?P4(j.handedTo).n:'them'),'you');emit();};
R.takeBack=(j)=>{const w=j.queue.find(q=>q.kind==='waiting');if(w)R.deq(j,w.id);
  j.handedTo=null;log(j,'Took the decisions back','you');
  push(j,{kind:'note',text:'Back with you. The queue is yours again.'});emit();};

/* ---------- go-live checklist, attached to the gate that needs it ---------- */
R.CHECK=(window.RSD.CHECKLIST||[]).map(c=>({t:c.t,ray:c.ray}));

/* ---------- replay (practice round) ---------- */
R.replay=async(j,itemId)=>{
  if(itemId)R.deq(j,itemId);
  j.stats.rounds++;
  const card=push(j,{kind:'replay',n:1000,cnt:0,agree:0,round:j.stats.rounds,done:false});
  emit();
  const target=j.stats.rounds===1?91:j.stats.rounds===2?94:96;
  for(let i=1;i<=12;i++){await wait(190);card.cnt=Math.round(1000*i/12);card.agree=Math.round(target-5+5*i/12);emit();}
  card.done=true;card.agree=target;j.stats.agree=target;
  log(j,'Replay '+j.stats.rounds+' · '+target+'% agreement with your analysts','ray');
  push(j,{kind:'note',text:'**'+target+'% agreement** across 1,000 alerts your analysts already closed. '+
    (target>=90?'That clears the bar for the next authority notch.':'Still under the 90% bar — the disagreements are in your queue.')});
  // a couple of disagreements to coach
  [mkAlert('esc'),mkAlert('close')].forEach(a=>{a.conf=58+Math.floor(Math.random()*8);enq(j,{kind:'decide',alert:a,fromReplay:true});});
  if(j.unlocked<2&&target>=90)R.offerUnlock(j,2);
  emit();
};

/* ---------- moving the dial ---------- */
R.setAuthority=(j,lvl)=>{
  if(lvl>j.unlocked)return false;
  const before=j.authority;j.authority=lvl;
  log(j,'Authority '+(lvl>before?'raised':'lowered')+' to “'+LEVELS[lvl].t+'”','you');
  push(j,{kind:'note',text:lvl>before?'Authority raised to **'+LEVELS[lvl].t+'**. '+LEVELS[lvl].d
    :'Authority lowered to **'+LEVELS[lvl].t+'**. I will bring more to you again — nothing I did before is undone, and the change is in the trail.'});
  if(lvl>before){
    const take=j.queue.filter(q=>q.kind==='decide'&&!R.needsMe(j,q.alert,lvl));
    take.forEach(t=>{R.deq(j,t.id);if(t.alert.kind==='close')j.stats.closedByRay++;
      const c=j.stream.find(x=>x.alert&&x.alert.id===t.alert.id);if(c)c.state='done';});
    if(take.length){j.justTook=take.length;
      push(j,{kind:'note',text:'**I took '+take.length+' of the alerts on your desk.** They are all ones the line now says I may decide — the rest stayed with you.'});
      log(j,'Ray took '+take.length+' queued alerts after the authority change','ray');}
  }
  if(lvl>=2&&!j.stats.shadowDay){j.stats.shadowDay=1;R.shadow(j);}
  if(lvl>=3)j.stats.live=true;
  emit();return true;
};
R.unlock=(j,itemId,lvl)=>{
  const it=j.queue.find(x=>x.id===itemId);
  if(lvl>=3){ // the real gate: two senior signatures
    R.deq(j,itemId);
    enq(j,{kind:'sign',lvl,t:'Two signatures to let me act alone on low risk',
      d:'The MLRO and the Head of Financial Crime Compliance sign the authority. Until both sign, nothing changes.',who:['mlro','fcc'],
      check:R.CHECK.map(c=>({t:c.t,on:!!c.ray,ray:!!c.ray}))});
    emit();return;
  }
  R.deq(j,itemId);j.unlocked=Math.max(j.unlocked,lvl);R.setAuthority(j,lvl);
};
R.toggleChk=(j,itemId,i)=>{const it=j.queue.find(x=>x.id===itemId);if(!it||!it.check||it.check[i].ray)return;
  it.check[i].on=!it.check[i].on;emit();};
R.sign=(j,itemId)=>{
  const it=j.queue.find(x=>x.id===itemId);if(!it)return;
  if(it.check&&it.check.some(c=>!c.on))return;
  R.deq(j,itemId);
  (it.who||[]).forEach(w=>j.signs.push({who:w,at:'now',lvl:it.lvl}));
  j.signs.push({who:'you',at:'now',lvl:it.lvl});
  log(j,'Signed by MLRO, Head of FCC and you','you');
  j.unlocked=Math.max(j.unlocked,it.lvl);R.setAuthority(j,it.lvl);
};
R.rollback=(j)=>{
  const to=Math.max(1,j.authority-1);
  j.stats.live=false;
  push(j,{kind:'note',text:'**Rolled back.** I am back to “'+LEVELS[to].t+'” and will not act alone. Everything I decided stays in the audit trail.'});
  log(j,'Rolled back to '+LEVELS[to].t,'you');
  j.authority=to;emit();
};

/* ---------- shadow (prove) as a background run, not a stage ---------- */
R.shadow=async(j)=>{
  while(j.stats.shadowDay>0&&j.stats.shadowDay<j.stats.shadowTotal&&j.authority>=2){
    await wait(2600);
    if(j.authority<2||j.stats.shadowDay>=j.stats.shadowTotal)return;
    j.stats.shadowDay++;emit();
    if(j.stats.shadowDay===j.stats.shadowTotal){
      push(j,{kind:'note',text:'**Four weeks beside your analysts.** 4,118 live alerts, 93% agreement, every escalation caught, no missed SARs.'});
      log(j,'Shadow complete · 93% agreement','ray');
      if(j.unlocked<3)R.offerUnlock(j,3);
      emit();
    }
  }
};
R.skipShadow=(j)=>{j.stats.shadowDay=j.stats.shadowTotal;j.stats.agree=Math.max(j.stats.agree,93);
  push(j,{kind:'note',text:'Fast-forwarded the four weeks for the demo. In a real bank this is the part nobody skips.'});
  log(j,'Shadow fast-forwarded (demo)','you');
  if(j.unlocked<3)R.offerUnlock(j,3);emit();};

/* ---------- sources (policy, report layout, practice data) ---------- */
R.addDocs=(j,files)=>{(files||[]).forEach(f=>j.docs.push(Object.assign({id:uid()},f)));
  push(j,{kind:'note',text:'Read '+(files||[]).length+' new document'+((files||[]).length>1?'s':'')+'. Anything it changes will show up as a rule, not as a silent edit.'});
  log(j,'Added '+(files||[]).length+' document(s)','you');emit();};
R.delDoc=(j,id)=>{const i=j.docs.findIndex(d=>d.id===id);if(i>=0){log(j,'Removed document '+j.docs[i].n,'you');j.docs.splice(i,1);}emit();};

/* ---------- the ask bar ---------- */
const has=(s,arr)=>arr.some(w=>s.includes(w));
R.ask=async(j,text)=>{
  const s=(text||'').toLowerCase().trim();if(!s)return;
  push(j,{kind:'you',text});emit();await wait(380);
  if(has(s,['ready','can you go live','good to go'])){push(j,{kind:'answer',ask:'Is Ray ready?',a:R.readyLine(j),facts:R.readyFacts(j)});emit();return;}
  if(has(s,['where','status','what stage','how far'])){push(j,{kind:'answer',ask:'Where are we?',a:R.whereLine(j),facts:R.whereFacts(j)});emit();return;}
  if(has(s,['why'])){const last=j.stream.find(c=>c.kind==='decision');
    push(j,{kind:'answer',ask:'Why that decision?',a:last?('On **'+last.alert.id+'** I chose '+last.alert.out.toLowerCase()+'. Three things decided it:'):'Nothing decided yet.',
      facts:last?last.alert.why.map(w=>[w[0],w[1]]):[]});emit();return;}
  if(has(s,['learn','memory','rules','know'])){push(j,{kind:'answer',ask:'What have you learned?',
    a:'**'+j.memory.filter(r=>r.on).length+' rules** are live — '+j.memory.filter(r=>r.cat==='learned').length+' of them from your corrections. They are listed on the right, each with the alert that taught it.',
    facts:j.memory.slice(0,3).map(r=>[r.text,r.src?('from '+(r.src.ref||r.src.kind)):'from your policy'])});emit();return;}
  if(has(s,['less authority','slow down','take back','rollback','roll back'])){R.rollback(j);return;}
  if(has(s,['more authority','trust you','act alone'])){
    if(j.unlocked>j.authority)R.setAuthority(j,j.unlocked);
    else push(j,{kind:'answer',ask:'More authority?',a:'Not yet — '+LEVELS[Math.min(4,j.authority+1)].t+' needs this first:',facts:[[LEVELS[Math.min(4,j.authority+1)].need,'']]});
    emit();return;}
  if(has(s,['replay','practice','test'])){await R.replay(j);return;}
  if(has(s,['stop','pause'])){R.stop(j);push(j,{kind:'note',text:'Paused. Nothing new will be decided until you start me again.'});emit();return;}
  push(j,{kind:'answer',ask:text,a:'I can answer **is Ray ready**, **where are we**, **why did you decide that**, **what have you learned**, or you can tell me to **replay**, **pause**, or **give me less authority**.',facts:[]});
  emit();
};
R.readyLine=(j)=>{
  if(j.stats.live)return '**Working alone on low risk** and healthy — '+j.stats.closedByRay.toLocaleString()+' clear false positives closed by me, everything else still came to a person.';
  if(j.stats.shadowDay>=j.stats.shadowTotal)return '**Ready for the next notch.** Four weeks beside your analysts at 93%, every escalation caught.';
  if(j.stats.shadowDay>0)return '**Not yet — day '+j.stats.shadowDay+' of '+j.stats.shadowTotal+'** beside your analysts. Nothing I decide affects an alert.';
  if(j.stats.agree>=90)return '**Ready to act with your approval.** '+j.stats.agree+'% agreement across 1,000 of your own closed alerts.';
  if(j.stats.rounds)return '**Not yet — '+j.stats.agree+'% against a 90% bar.** The disagreements are in your queue.';
  return '**Not proven yet.** I have decided '+j.stats.seen+' alerts in front of you, but I have not been replayed against your analysts.';
};
R.readyFacts=(j)=>[['Alerts decided in front of you',String(j.stats.seen)],
  ['You agreed / corrected',j.stats.agreed+' / '+j.stats.corrected],
  ['Agreement on replay',j.stats.agree?j.stats.agree+'% (bar: 90%)':'not replayed yet'],
  ['Authority now',LEVELS[j.authority].t],
  ['Next notch needs',LEVELS[Math.min(4,j.authority+1)].need||'—']];
R.whereLine=(j)=>'You are supervising at **'+LEVELS[j.authority].t+'**. '+LEVELS[j.authority].d;
R.whereFacts=(j)=>[['Needs a person right now',String(j.queue.length)],
  ['Rules Ray is applying',String(j.memory.filter(r=>r.on).length)],
  ['Signatures on file',j.signs.length?j.signs.map(x=>(D.PEOPLE[x.who]||{n:x.who}).n).join(', '):'none yet'],
  ['Shadow',j.stats.shadowDay?('day '+j.stats.shadowDay+' of '+j.stats.shadowTotal):'not started'],
  ['Last thing I did',(j.trail[0]||{text:'nothing yet'}).text]];

/* ---------- hire ---------- */
R.hire=async(txt)=>{
  const s=(txt||'').toLowerCase();
  let t=null,best=0;
  D.TEMPLATES.forEach(x=>{let sc=0;(x.kw||[]).forEach(k=>{if(s.includes(k))sc+=2;});
    x.t.toLowerCase().split(/[^a-z]+/).forEach(w=>{if(w.length>3&&s.includes(w))sc++;});
    if(sc>best){best=sc;t=x;}});
  const j=newJob(t?t.id:null,t?t.t:(txt||'New job').slice(0,46));
  S.jobs.unshift(j);S.openId=j.id;emit();
  await wait(260);
  await R.start(j);
  return j;
};
R.hireTpl=async(id)=>{const j=newJob(id);S.jobs.unshift(j);S.openId=j.id;emit();await wait(200);await R.start(j);return j;};
R.clone=(j)=>{const n=newJob(j.tpl,j.name+' · copy');n.memory=j.memory.map(r=>Object.assign({},r,{id:uid()}));
  n.docs=j.docs.slice();S.jobs.unshift(n);S.openId=n.id;
  push(n,{kind:'note',text:'Copied from **'+j.name+'** with all '+n.memory.length+' rules. Change what is different here; the original is untouched.'});
  log(n,'Copied from '+j.name,'you');emit();return n;};

/* ---------- seeds: two jobs already in flight, so the tab is never empty ---------- */
R.seed=()=>{
  if(S.jobs.length)return;
  // one live, to show the end state
  const live=newJob('card-us');live.name='Card Fraud Issuing US';
  live.authority=3;live.unlocked=3;live.stats={seen:3912,agreed:48,corrected:11,rounds:2,agree:94,shadowDay:28,shadowTotal:28,live:true,closedByRay:1204};
  ['Close duplicate alerts on the same transaction within 24 hours',
   'Escalate any card-present transaction in a sanctioned country',
   'Never close an alert on an account opened in the last 30 days',
   'Ask me before closing anything over $50,000'].forEach((t,i)=>addRule(live,t,{kind:'alert',ref:'A-30'+(412+i),by:i%2?'dana':'you'},i===3?'ask':'learned',88+i));
  addRule(live,'Never file a SAR — stop at L2 and let a person decide',{kind:'policy',ref:'from your policy'},'guard',99);
  live.signs=[{who:'mlro',at:'12 Oct'},{who:'fcc',at:'12 Oct'},{who:'you',at:'12 Oct'}];
  ['Live since 12 Oct · acting alone on low risk','Signed by MLRO and Head of FCC','Shadow complete · 93% agreement'].forEach(t=>log(live,t,'ray'));
  push(live,{kind:'digest',n:3912,closed:1204,esc:118,agree:94});
  push(live,{kind:'note',text:'**Welcome back.** Four days acting alone on low risk: 3,912 alerts, I closed 1,204 clear false positives, and nothing missed a deadline.'});
  enq(live,{kind:'propose',t:'Let me also close duplicate alerts raised within 24 hours',
    d:'I have seen 212 of these and you closed every one. It would take about 6% of the queue off your analysts.',ok:'Allow it',act:'rule',
    rule:'Close duplicate alerts raised within 24 hours of the first'});
  enq(live,{kind:'comment',who:'dana',t:'Dana Levi: “Supervisor should own anything over $100k, not L2”',
    d:'She left this on your rule about large transfers. Accepting it adds a rule and tells her it is done.',ok:'Accept',act:'comment'});
  S.jobs.push(live);

  // one mid-coaching, so the loop is visible immediately
  const mid=newJob('ts-uk');mid.name='Transaction Screening UK';
  mid.authority=1;mid.unlocked=1;mid.stats={seen:0,agreed:0,corrected:0,rounds:0,agree:0,shadowDay:0,shadowTotal:28,live:false,closedByRay:0};
  S.jobs.push(mid);
  emit();   // without this the hub renders before the seed lands and shows no jobs
};
})();
