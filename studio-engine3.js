/* Ray Studio v3 — engine layer: Brief → Playbook → gates, one Sign sheet, tracked changes */
(function(){
const D=window.RSD,E=window.RSE,S=E.state;
const wait=E.wait,now=E.now,emit=E.emit;
const has=(s,a)=>a.some(k=>s.includes(k));
const clone=o=>JSON.parse(JSON.stringify(o));
const LV={every:{t:'Every step',d:'Ray asks before each step',ic:'ti-list-check'},important:{t:'Only what matters',d:'Ray asks for decisions and signatures',ic:'ti-adjustments'},sign:{t:'Only to sign',d:'Autopilot — you decide 3 times',ic:'ti-sparkles'}};
E.LV=LV;

const baseNew=E.newUC;
E.newUC=tpl=>{const uc=baseNew(tpl);
  Object.assign(uc,{brief:{tpl:tpl||null,docs:true,report:'predefined',period:'Last 6 months',level:'important'},level:'important',gate:null,signedVer:0,signs:[],comment:null,run:null,step:'brief'});
  if(tpl){const t=D.TEMPLATES.find(x=>x.id===tpl);uc.tpl=tpl;uc.name=t.t;}
  uc.next={who:'you',what:'Check the brief'};return uc;};
function pingIfAway(uc,t,d){if(S.openId!==uc.id){uc.need={kind:'ai',ic:'ti-bell-ringing',t,d,acts:[['Open','open']]};emit();}}

function parse(text){const s=' '+text.toLowerCase()+' ';
  return {t:E.matchTpl(s),level:has(s,['autopilot','auto pilot','shortcut','do it for me','for me'])?'sign':has(s,['step by step','every step','guide me'])?'every':'important',
    docs:!has(s,['template policy','no policy','without our'])};}

/* ---------- Brief ---------- */
E.createFromPrompt=async(text,via)=>{
  const p=parse(text);const uc=E.newUC(p.t?p.t.id:null);S.openId=uc.id;
  uc.brief.level=p.level;uc.brief.docs=p.docs;
  E.you(uc,text,via);
  await E.ray(uc,p.t?'I turned that into a **brief** — it’s on the left. Tap anything to change it, or just tell me. Then press **Start**.':'Happy to help. **Which job should I learn?** Pick one in the brief, or name it.');
};
E.startFromTpl=async(id)=>{const uc=E.newUC(id);S.openId=uc.id;emit();await E.ray(uc,'Here’s a **brief** for '+uc.name+'. Adjust anything, then press **Start**.');};
E.startBlank=async()=>{const uc=E.newUC(null);S.openId=uc.id;emit();await E.ray(uc,'**Which job should I learn?** Pick one in the brief.');};
E.setBrief=(uc,k,v)=>{uc.brief[k]=v;if(k==='tpl'){const t=D.TEMPLATES.find(x=>x.id===v);uc.tpl=v;uc.name=t.t;}emit();};
E.setLevel=async(uc,lv)=>{if(uc.step==='brief'){E.setBrief(uc,'level',lv);return;}
  uc.level=lv;uc.mode=lv==='sign'?'auto':'guide';E.log(uc,'Check-with-me set to: '+LV[lv].t,'you','you');emit();
  await E.ray(uc,'From now on I’ll check with you **'+LV[lv].t.toLowerCase()+'**.'+(lv==='sign'?' I’ll still stop for held rules and every signature.':''));};

E.startBrief=async(uc)=>{
  if(!uc.tpl)return;const b=uc.brief;
  uc.level=b.level;uc.mode=b.level==='sign'?'auto':'guide';uc.train.period=b.period;uc.step='building';
  E.log(uc,'Brief agreed: '+uc.name+' · '+(b.docs?'your policy':'ThetaRay template policy')+' · '+(b.report==='upload'?'your report layout':'predefined report')+' · check with me: '+LV[b.level].t,'you','sign');
  E.setNext(uc,'ray','Writing the playbook');
  await E.policyChoice(uc,null,b.docs?'sample':'skip',true);
  uc.report=b.report;
  await E.buildV1(uc);
  if(uc.level==='sign'){await E.ray(uc,'Playbook v1 is written. On to practice — no need to wait for me.');await E.startPractice(uc);return;}
  uc.step='b.refine';uc.gate={what:'build'};
  await E.ray(uc,'**Your playbook is ready.** Read it like a new hire’s manual. Tell me what to change in your own words — or sign off Build when it reads right.');
  E.setNext(uc,'you','Review the playbook');
};
E.buildV1=async(uc)=>{
  const wf=D.buildWorkflow(uc.tpl);
  const m=await E.ray(uc,'Writing the playbook…',{type:'progress',steps:['Map each policy clause to a step','Assign owners and deadlines','Write the report template'],at:0},{fast:true});
  const v=E.addVersion(uc,{nodes:[],edges:[]},'ray','First draft from '+(uc.hasDocs?'your policy':'the template'));
  for(let i=0;i<wf.nodes.length;i++){await wait(280);v.wf.nodes.push(wf.nodes[i]);v.wf.edges=wf.edges.filter(e=>v.wf.nodes.find(n=>n.id===e[0])&&v.wf.nodes.find(n=>n.id===e[1]));
    m.card.at=Math.min(2,Math.floor(i/3));uc.pulse={ids:[wf.nodes[i].id],t:Date.now(),fresh:true};emit();}
  E.doneCard(uc,m.id,'Playbook v1 · '+wf.nodes.length+' steps');
  E.log(uc,'Wrote playbook v1 · '+wf.nodes.length+' steps, each tied to a policy clause','ray');
};

/* ---------- Train ---------- */
E.applyTune=(uc,by,summary)=>{
  const wf=clone(E.cur(uc).wf);uc.train.applied=uc.train.applied||{};const ch=[];const nv=uc.versions.length+1;
  E.tuneSet(uc).forEach(s=>{if(uc.train.sugs[s.id]==='yes'&&!uc.train.applied[s.id]){const n=wf.nodes.find(x=>x.id===s.node);
    if(n){n.tuned=s.sug;n.tunedT=s.t;n.tunedVer=nv;n.tunedBy=(s.cat==='bug'||s.cat==='data')?'ray':by;ch.push(n.id);}uc.train.applied[s.id]=true;}});
  if(!ch.length)return null;
  const v=E.addVersion(uc,wf,by,summary,ch,{tuned:true});E.pulse(uc,ch);E.log(uc,'v'+v.n+': '+summary,by,by==='ray'?'ray':'you');return v;
};
async function practice(uc){
  uc.stage='train';uc.step='t.run';const round=uc.train.rounds.length+1,target=round===1?87:round===2?91:92,N=1000;
  E.setNext(uc,'ray','Practicing');
  const m=await E.ray(uc,round===1?'Practicing on **1,000 alerts** your analysts already closed. About a minute — I’ll ping you if you leave.':'Practice round '+round+' — checking that the changes help.',{type:'replay',n:N,cnt:0,agree:0,round},{fast:true});
  uc.run={kind:'practice'};
  for(let i=1;i<=12;i++){await wait(230);m.card.cnt=Math.round(N*i/12);m.card.agree=Math.round(target-6+6*i/12);emit();}
  uc.train.rounds.push({n:round,agree:target});uc.run=null;E.doneCard(uc,m.id,target+'% agreement');
  E.log(uc,'Practice round '+round+' · '+target+'% agreement with your analysts','ray');
  pingIfAway(uc,'Practice round '+round+' is done · '+uc.name,target+'% agreement with your analysts.');
  return target;
}
E.startPractice=async(uc)=>{
  await practice(uc);
  const sugs=E.tuneSet(uc),tech=sugs.filter(x=>x.cat==='bug'||x.cat==='data');
  tech.forEach(x=>uc.train.sugs[x.id]='yes');E.applyTune(uc,'ray','Technical fixes: '+tech.map(x=>x.t).join('; '));
  if(uc.level==='sign'){sugs.filter(x=>!x.held&&!(x.cat==='bug'||x.cat==='data')).forEach(x=>uc.train.sugs[x.id]='yes');E.applyTune(uc,'ray','Autopilot: applied the safe improvements');}
  uc.step='t.sugs';const pend=sugs.filter(x=>!uc.train.sugs[x.id]);
  await E.ray(uc,'**87% agreement** with your analysts. I fixed '+tech.length+' technical issues myself'+(uc.level==='sign'?' and applied the safe improvements':'')+'. **'+pend.length+' '+(pend.length===1?'change needs':'changes need')+' your call** — '+(uc.level==='sign'?'I held it because it touches a threshold':'they’re marked in the playbook')+'.');
  E.setNext(uc,'you','Decide '+pend.length+' suggestion'+(pend.length>1?'s':''));
};
E.decideSug=async(uc,sid,yes)=>{
  if(uc.train.sugs[sid])return;
  uc.train.sugs[sid]=yes?'yes':'no';uc.need=null;const s=E.tuneSet(uc).find(x=>x.id===sid);
  E.log(uc,(yes?'Accepted':'Rejected')+' suggestion: '+s.t,'you','you');
  if(yes)E.applyTune(uc,'you','Accepted: '+s.t);
  emit();
  if(!E.tuneSet(uc).some(x=>!uc.train.sugs[x.id]))await afterSugs(uc);
};
E.acceptAllSugs=async(uc)=>{E.tuneSet(uc).forEach(x=>{if(!uc.train.sugs[x.id])uc.train.sugs[x.id]='yes';});uc.need=null;E.applyTune(uc,'you','Accepted all remaining suggestions');E.log(uc,'Accepted all remaining suggestions','you','you');await afterSugs(uc);};
async function afterSugs(uc){
  if(uc.level==='every'){uc.step='t.round';await E.ray(uc,'All decided. Run one more practice round to prove the changes help?',{type:'confirm',what:'round',label:'Run round 2'});E.setNext(uc,'you','Run round 2');return;}
  await round2(uc);
}
async function round2(uc){
  const t=await practice(uc);
  uc.step='t.gate';uc.gate={what:!uc.done.build?'buildtrain':'train'};
  await E.ray(uc,'Round '+uc.train.rounds.length+': **'+t+'%** — above the 90% target, with nothing left that adds 1%. **Ready for your signature.**');
  E.setNext(uc,'you','Sign off '+(uc.gate.what==='buildtrain'?'Build + Train':'Train'));
}
E.confirm=async(uc,msgId,what)=>{E.doneCard(uc,msgId,'Yes');if(what==='round')await round2(uc);if(what==='practice')await E.startPractice(uc);if(what==='shadow')await E.startShadow3(uc);};

/* ---------- gates & signing ---------- */
E.signGate=async(uc)=>{
  const g=uc.gate;if(!g)return;const v=E.cur(uc).n;uc.signedVer=v;uc.signs.push(v);uc.gate=null;uc.need=null;
  if(g.what==='build'){
    uc.done.build=true;uc.stage='train';E.log(uc,'Signed off Build · v'+v+' · MRM document and user guide generated','you','sign');E.logMsg(uc,'Build signed · v'+v,'ti-signature');
    if(uc.level==='every'){uc.step='t.ask';await E.ray(uc,'Signed. Next is **Train**: I practice on 1,000 alerts your analysts already closed. Start?',{type:'confirm',what:'practice',label:'Start practice'});E.setNext(uc,'you','Start practice');}
    else{await E.ray(uc,'Signed — the MRM document and user guide are in the audit trail. Moving straight on to **Train**.');await E.startPractice(uc);}
    return;}
  if(g.what==='train'||g.what==='buildtrain'){
    const w=g.what==='buildtrain'?'Build + Train':'Train';
    uc.done.build=true;uc.done.train=true;uc.stage='prove';E.log(uc,'Signed off '+w+' · v'+v+' is the baseline for Prove','you','sign');E.logMsg(uc,w+' signed · v'+v,'ti-signature');
    if(uc.level==='every'){uc.step='p.ask';await E.ray(uc,'Signed. Next is **Prove**: 4 weeks on 50% of new live alerts — your analysts see nothing. Start?',{type:'confirm',what:'shadow',label:'Start shadow run'});E.setNext(uc,'you','Start the shadow run');}
    else await E.startShadow3(uc);
  }
};
E.startShadow3=async(uc)=>{
  uc.stage='prove';uc.step='p.run';const p=uc.prove;p.running=true;p.day=0;p.total=parseInt(p.dur)*7;
  E.log(uc,'Shadow run started · '+p.dur+' · '+p.cov+' · no effect on alerts','you','you');E.setNext(uc,'ray','Shadowing live alerts');
  const m=await E.ray(uc,'Shadow run started: **'+p.dur+' on '+p.cov+'**. Analysts see nothing; I decide in parallel. I’ll ping you when it’s done.',{type:'shadowrun'},{fast:true});p.msgId=m.id;
  for(let d=1;d<=9;d++){await wait(320);if(!p.running)return;p.day=d;emit();}
};
E.skipShadow=async(uc)=>{
  const p=uc.prove;if(p.day>=p.total&&!p.running)return;p.running=false;const st=Math.max(1,Math.round(p.total/10));
  while(p.day<p.total){p.day=Math.min(p.total,p.day+st);emit();await wait(120);}
  if(p.msgId)E.doneCard(uc,p.msgId,'Completed · '+p.total+' days');
  E.log(uc,'Shadow run complete · 91% agreement · 98% escalations caught · 0 missed SARs','ray');
  uc.step='p.gate';uc.gate={what:'prove'};
  pingIfAway(uc,'Shadow run passed · '+uc.name,'All 3 targets met — two signatures needed.');
  await E.ray(uc,'Shadow run complete — **all 3 targets met**. Going to production needs the MLRO and the Head of FCC to sign.');
  E.setNext(uc,'you','Request sign-off');
};
E.requestSigs=async(uc)=>{
  if(uc.prove.requested)return;uc.prove.requested=true;uc.need=null;emit();
  E.log(uc,'Requested sign-off from the MLRO and Head of FCC','you','you');E.setNext(uc,'mlro','Sign the proof');
  await wait(1300);uc.prove.signed.mlro=now();E.log(uc,'Signed by Sarah Klein (MLRO)','mlro','sign');E.setNext(uc,'fcc','Sign the proof');
  await wait(1300);uc.prove.signed.fcc=now();E.log(uc,'Signed by Lior Ben-Ami (Head of FCC)','fcc','sign');
  uc.done.prove=true;uc.stage='operate';uc.step='o.gate';uc.gate={what:'live'};uc.signs.push(E.cur(uc).n);
  D.CHECKLIST.forEach((c,i)=>{if(c.ray)uc.operate.chk[i]='ray';});
  E.logMsg(uc,'Prove signed by MLRO + Head of FCC','ti-signature');
  await E.ray(uc,'Both signed. **One step left: going live.** I ticked what I can prove; two checks are yours.');
  E.setNext(uc,'you','Go live');
};
E.toggleChk=(uc,i)=>{if(uc.operate.chk[i]==='ray')return;uc.operate.chk[i]=uc.operate.chk[i]?null:'you';emit();};
E.setAuth=(uc,a)=>{uc.operate.auth=a;emit();};
E.goLive=async(uc)=>{
  const v=E.cur(uc).n;uc.operate.live=true;uc.done.operate=true;uc.signedVer=v;uc.signs.push(v);uc.gate=null;uc.step='o.live';
  const a=D.AUTHORITY.find(x=>x.id===uc.operate.auth).t;
  E.log(uc,'GO LIVE · v'+v+' · authority: '+a,'you','sign');E.logMsg(uc,'Live · v'+v,'ti-player-play');
  await E.ray(uc,'**I’m live**, starting with *'+a.toLowerCase()+'*. Roll back anytime from the bar at the top. Want a change? Tell me — it goes through Train and Prove before it touches a real alert.');
  E.setNext(uc,'ray','Working alone · monitored');
};
E.rollback3=async(uc)=>{uc.operate.live=false;uc.gate={what:'live'};uc.step='o.gate';E.log(uc,'Rolled back — Ray stopped affecting alerts','you','sign');emit();await E.ray(uc,'Rolled back. Nothing is lost — go live again whenever you’re ready.');};
E.nudge=(uc)=>{E.log(uc,'Nudged Dana Levi','you','you');E.logMsg(uc,'Nudge sent to Dana','ti-bell');uc.need=null;emit();};
E.takeOver=async(uc)=>{uc.next={who:'you',what:'Decide the suggestions'};uc.need=null;E.log(uc,'Took over the Train decisions from Dana','you','you');emit();};
E.applyComment3=async(uc,yes)=>{
  const c=uc.comment;if(!c)return;uc.comment=null;uc.need=null;
  if(yes){uc.focusNode=c.node;await E.refine(uc,'Supervisor should own this step','dana');uc.gate={what:'build'};emit();return;}
  E.log(uc,'Declined Dana’s suggestion: '+c.text,'you','you');emit();await E.ray(uc,'Declined — I’ll let Dana know, with the reason in the audit trail.');
};

/* ---------- talk ---------- */
E.say=async(uc,text,via)=>{
  if(!text.trim())return;E.you(uc,text,via);const s=text.toLowerCase();
  if(has(s,['undo','revert that','take that back'])&&uc.versions.length>1&&!uc.operate.live){await E.undo(uc);return;}
  if(/\bwhy\b/.test(s)&&uc.lastChange){const c=uc.lastChange.clause;await E.ray(uc,'Because of **§'+c.no+' '+c.t+'**: “'+c.p+'” ('+c.src+').');return;}
  if(has(s,['where are we','status','recap','summar','what did you do'])){await E.recap(uc);return;}
  if(uc.step==='brief'){
    const p=parse(s);if(p.t)E.setBrief(uc,'tpl',p.t.id);
    if(has(s,['autopilot','for me']))E.setBrief(uc,'level','sign');
    if(has(s,['step by step','every step']))E.setBrief(uc,'level','every');
    if(has(s,['template']))E.setBrief(uc,'docs',false);
    if(has(s,['our policy','our doc','my policy']))E.setBrief(uc,'docs',true);
    if(/\b(start|go|go ahead|looks good|yes)\b/.test(s)&&uc.tpl){await E.startBrief(uc);return;}
    await E.ray(uc,uc.tpl?'Updated the brief. Press **Start** when it looks right.':'Which job? Pick one in the brief, or name it — e.g. *“UK payment screening”*.');return;
  }
  if(has(s,['accept all'])&&uc.train.rounds.length&&E.tuneSet(uc).some(x=>!uc.train.sugs[x.id])){await E.acceptAllSugs(uc);return;}
  if(/\b(sign|approve|go live)\b/.test(s)&&uc.gate){uc.openSheet=Date.now();emit();await E.ray(uc,'Here’s what you’re signing.');return;}
  if(has(s,['skip','fast forward','fast-forward'])&&uc.prove.running){await E.skipShadow(uc);return;}
  const conf=[...uc.msgs].reverse().find(m=>m.card&&m.card.type==='confirm'&&!m.card.done);
  if(conf&&/\b(yes|start|go|run)\b/.test(s)){await E.confirm(uc,conf.id,conf.card.what);return;}
  if(uc.operate.live){await E.ray(uc,'Noted: “'+text+'”. I’ll draft it as **version '+(E.cur(uc).n+1)+'** and run it through Train and Prove first — it won’t touch a real alert until you sign.');E.log(uc,'Change requested in production: “'+text+'”','you','you');return;}
  if(uc.step==='building'||uc.run){await E.ray(uc,'One moment — I’m mid-way. I’ll take that right after.');return;}
  if(uc.versions.length&&(uc.stage==='build'||uc.stage==='train')){await E.refine(uc,text);if(uc.stage==='build')uc.gate={what:'build'};emit();return;}
  await E.ray(uc,'Got it. Right now: **'+uc.next.what+'**. You can also ask *“where are we?”*, *“why?”* or *“undo”*.');
};

/* ---------- seeded team ---------- */
function seed3(tpl,o){
  const uc=E.newUC(tpl);uc.seed=true;uc.step=o.step;uc.stage=o.stage;uc.done=o.done||{};uc.level=o.level||'important';uc.mode=uc.level==='sign'?'auto':'guide';
  uc.hasDocs=true;uc.policy=D.buildPolicy(tpl,true);uc.report='predefined';uc.brief.tpl=tpl;
  uc.files=clone(tpl==='ts-example'?D.EX_FILES:D.SAMPLE_FILES).map(f=>Object.assign(f,{pct:100}));
  const wf=D.buildWorkflow(tpl);if(o.mod)o.mod(wf);
  for(let i=0;i<o.vers;i++){const v=E.addVersion(uc,clone(wf),i?'you':'ray',i?'Refined':'First draft from your policy',[]);v.at=o.at||'Yesterday';}
  uc.signedVer=o.signedVer||0;uc.signs=o.signs||[];uc.gate=o.gate||null;uc.comment=o.comment||null;
  if(o.train)Object.assign(uc.train,o.train);if(o.prove)Object.assign(uc.prove,o.prove);if(o.operate)Object.assign(uc.operate,o.operate);
  uc.next=o.next;uc.need=o.need||null;uc.updated=o.updated||'Yesterday';
  (o.trail||[]).forEach(t=>uc.trail.unshift({id:Math.random().toString(36).slice(2),text:t[0],who:t[1],kind:t[2]||'ray',ver:t[3]||'v'+o.vers,at:t[4]||o.updated||'Yesterday'}));
  uc.msgs=(o.msgs||[]).map(m=>Object.assign({id:Math.random().toString(36).slice(2),at:o.updated||'Yesterday'},m));
  if(o.allSugs){const cv=E.cur(uc);E.tuneSet(uc).forEach(x=>{uc.train.sugs[x.id]='yes';uc.train.applied=uc.train.applied||{};uc.train.applied[x.id]=true;
    const n=cv.wf.nodes.find(y=>y.id===x.node);if(n&&!n.tuned){n.tuned=x.sug;n.tunedT=x.t;n.tunedVer=uc.signedVer;n.tunedBy='you';}});}
  return uc;
}
E.seed3=()=>{
  S.ucs.splice(0,S.ucs.length);
  seed3('card-us',{vers:4,allSugs:true,stage:'operate',step:'o.live',level:'sign',done:{build:true,train:true,prove:true,operate:true},signedVer:4,signs:[2,4,4,4],
    train:{rounds:[{n:1,agree:86},{n:2,agree:92}]},prove:{dur:'4 weeks',cov:'50% of new alerts',day:28,total:28,running:false,signed:{mlro:'12 Oct',fcc:'12 Oct'}},operate:{chk:{0:'ray',1:'ray',2:'you',3:'ray',4:'you'},auth:'close',live:true},
    next:{who:'ray',what:'Working alone · monitored'},updated:'2 days ago',
    trail:[['Playbook v1 written on Autopilot','ray'],['Signed off Build + Train','you','sign'],['Shadow run complete · 93% agreement','ray'],['Signed by Sarah Klein (MLRO) and Lior Ben-Ami (Head of FCC)','fcc','sign'],['GO LIVE · authority: auto-close high-confidence false positives','you','sign']],
    msgs:[{from:'log',text:'Live since 12 Oct',icon:'ti-player-play'},{from:'ray',text:'**Welcome back.** Live for 4 days: **3,912 alerts**, 31% closed by me, 0 SLA breaches. Nothing needs you.'}]});
  seed3('vasp',{vers:5,allSugs:true,stage:'prove',step:'p.gate',done:{build:true,train:true},signedVer:5,signs:[2,5],gate:{what:'prove'},
    train:{rounds:[{n:1,agree:86},{n:2,agree:91}]},prove:{dur:'4 weeks',cov:'50% of new alerts',day:28,total:28,running:false,signed:{}},
    next:{who:'you',what:'Request sign-off'},updated:'Today, 08:10',
    need:{kind:'warn',ic:'ti-signature',t:'Shadow passed — sign-off needed',d:'Crypto / VASP met all 3 targets over 4 weeks.',acts:[['Request signatures','sigs'],['Open','open']]},
    trail:[['Shadow run complete · all 3 targets met','ray']],
    msgs:[{from:'ray',text:'**While you were away:** the 4-week shadow run finished and **all 3 targets are met**. Going live needs two signatures.'}]});
  seed3('pep-am',{vers:2,stage:'build',step:'b.refine',gate:{what:'build'},comment:{who:'dana',node:'n3',text:'Supervisor should own the PEP decision step.'},
    next:{who:'you',what:'Decide on Dana’s suggestion'},updated:'Today, 09:24',
    need:{kind:'ai',ic:'ti-message-circle',t:'Dana suggested a change',d:'PEP & Adverse Media: “Supervisor should own the PEP decision step.”',acts:[['Accept','comment'],['Open','open']]},
    trail:[['Suggestion from Dana Levi: “Supervisor should own the PEP decision step”','dana','you']],
    msgs:[{from:'ray',text:'**Dana Levi** suggested a change — it’s marked in the playbook at step 3.',card:{type:'anchor',anchor:'n3'}}]});
  seed3('cb-es',{vers:4,allSugs:true,stage:'prove',step:'p.run',done:{build:true,train:true},signedVer:4,signs:[2,4],
    train:{rounds:[{n:1,agree:88},{n:2,agree:92}]},prove:{dur:'4 weeks',cov:'50% of new alerts',day:9,total:28,running:true,signed:{}},
    next:{who:'ray',what:'Shadowing live alerts'},updated:'Today, 07:00',trail:[['Shadow run started · 4 weeks · 50% of new alerts','you']],
    msgs:[{from:'ray',text:'Shadow run in progress — **day 9 of 28**, 91% agreement so far. I’ll ping you when the targets are clear.'}]});
  const ts=seed3('ts-uk',{vers:3,stage:'train',step:'t.sugs',done:{build:true},signedVer:2,signs:[2],
    mod:null,train:{rounds:[{n:1,agree:87}],sugs:{t3:'yes',t5:'yes'},applied:{t3:true,t5:true}},
    next:{who:'dana',what:'Decide 3 suggestions'},updated:'Yesterday',
    need:{kind:'warn',ic:'ti-hourglass',t:'Waiting on Dana for 1 day',d:'Transaction Screening UK: 3 practice suggestions need a decision.',acts:[['Nudge Dana','nudge'],['Decide myself','take']]},
    trail:[['Signed off Build · v2','you','sign','v2'],['Practice round 1 · 87% agreement','ray'],['Technical fixes applied (coverage count, nationality gap)','ray'],['Handed the Train decisions to Dana Levi','you']],
    msgs:[{from:'log',text:'Build signed · v2',icon:'ti-signature'},{from:'ray',text:'**Picking up where Dana left off.** Practice round 1: **87%** agreement. I fixed 2 technical issues; **3 suggestions** are marked in the playbook.'}]});
  const v=E.cur(ts);E.tuneSet(ts).filter(x=>x.id==='t3'||x.id==='t5').forEach(x=>{const n=v.wf.nodes.find(y=>y.id===x.node);if(n){n.tuned=x.sug;n.tunedT=x.t;n.tunedVer=3;n.tunedBy='ray';}});
  emit();
};
E.seed3();
})();
