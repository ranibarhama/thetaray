/* Ray Studio — conversation engine, part B: sign-offs, Train, Prove, Operate, seeds */
(function(){
const D=window.RSD,E=window.RSE,S=E.state;
const wait=E.wait,now=E.now,emit=E.emit;
const has=(s,arr)=>arr.some(k=>s.includes(k));
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- sign-offs ---------- */
E.sign=async(uc,msgId,what)=>{
  const v=E.cur(uc).n;
  E.doneCard(uc,msgId,{build:'Build',train:'Train',operate:'Go-live'}[what]+' · version '+v);
  if(what==='build'){
    uc.done.build=true;uc.stage='train';
    E.log(uc,'Signed off Build · v'+v+' · MRM document + user guide generated','you','sign');
    await E.ray(uc,'Signed — Build is complete; the MRM document and user guide are in History. Next, **Train**: I practice on cases your analysts already closed. Who runs it?',{type:'handoff'});
    uc.step='b.handoff';E.setNext(uc,'you','Choose who runs Train');return;
  }
  if(what==='train'){
    uc.done.train=true;uc.stage='prove';
    E.log(uc,'Signed off Train · v'+v+' is the tuned baseline','you','sign');
    await E.ray(uc,'Train is signed off. Now **Prove**: I work next to your analysts on new live alerts — nothing changes for them.',{type:'shadow'});
    uc.step='p.setup';E.setNext(uc,'you','Set up the shadow run');return;
  }
  if(what==='operate'){
    uc.operate.live=true;uc.done.operate=true;uc.step='o.live';
    E.log(uc,'GO LIVE · v'+v+' affects new alerts · authority: '+D.AUTHORITY.find(a=>a.id===uc.operate.auth).t,'you','sign');
    E.setTab(uc,'results');
    await E.ray(uc,'**I’m live.** From now on new '+uc.name+' alerts follow version '+v+', starting with **'+D.AUTHORITY.find(a=>a.id===uc.operate.auth).t.toLowerCase()+'**. You can roll back in one tap. Want a change? Just tell me — I’ll run it through Train and Prove before it touches a real alert.');
    E.setNext(uc,'ray','Working alone · monitored');
  }
};
E.handoff=async(uc,msgId,who)=>{
  if(who==='dana'){
    E.doneCard(uc,msgId,'Handed to Dana Levi');
    E.log(uc,'Handed Train to Dana Levi (analyst team lead) with full context','you','you');
    E.logMsg(uc,'Sent to Dana · context, versions and open items attached','ti-send');
    E.setNext(uc,'dana','Start practice round');
    await E.ray(uc,'Sent to **Dana Levi** with full context — what we built, why, and what’s open. It’s in her *Needs you* list, and I’ll nudge her tomorrow if it hasn’t moved.',{type:'nudge'});
    return;
  }
  E.doneCard(uc,msgId,'I’ll do it myself');
  await E.startTrain(uc);
};
E.takeBack=async(uc,msgId)=>{E.doneCard(uc,msgId,'Taken back');await E.startTrain(uc);};

/* ---------- TRAIN ---------- */
E.tuneSet=uc=>{const l=D.TUNE[(E.tplOf(uc)||{}).cat==='scr'?'scr':'tm'];return uc.tpl==='ts-example'?l:l.map(x=>x.alt?Object.assign({},x,{node:x.alt}):x);};
E.startTrain=async(uc)=>{
  uc.stage='train';uc.step='t.setup';
  await E.ray(uc,'Let me practice on **cases your analysts already decided**, and compare my calls with theirs.',{type:'tdata'});
  E.setNext(uc,'you','Start practice');
};
E.startReplay=async(uc,msgId,csv)=>{
  E.doneCard(uc,msgId,csv?'Your labeled CSV · 600 alerts':uc.train.period+' · '+uc.train.size);
  uc.step='t.run';E.setNext(uc,'ray','Practicing');
  const N=csv?600:parseInt(uc.train.size.replace(/\D/g,''))||1000;
  E.log(uc,'Practice round '+(uc.train.rounds.length+1)+' started on '+N+' closed alerts','you','you');
  const round=uc.train.rounds.length+1,target=round===1?87:91;
  const m=await E.ray(uc,'Practicing…',{type:'replay',n:N,cnt:0,agree:0,round},{fast:true});
  E.setTab(uc,'results');
  for(let i=1;i<=12;i++){await wait(220);m.card.cnt=Math.round(N*i/12);m.card.agree=Math.round(target-6+6*i/12);emit();}
  uc.train.rounds.push({n:round,agree:target});
  E.doneCard(uc,m.id,target+'% agreement');
  E.log(uc,'Round '+round+' done · '+target+'% agreement with analysts','ray');
  if(round===1){
    await E.ray(uc,'I agreed with your analysts on **87%** of '+N.toLocaleString()+' alerts. The differences are in *Evidence*.');
    const sugs=E.tuneSet(uc);
    sugs.filter(x=>x.cat==='bug'||x.cat==='data').forEach(x=>{uc.train.sugs[x.id]='yes';});
    E.applyTune(uc,'ray','Technical fixes: '+sugs.filter(x=>x.cat==='bug'||x.cat==='data').map(x=>x.t).join('; '));
    uc.step='t.sugs';
    await E.ray(uc,'I fixed **2 technical issues** myself. **3 improvements need your call** — one at a time:',{type:'sugs'});
    E.setNext(uc,'you','Decide 3 suggestions');
  }else{
    uc.step='t.sign';
    await E.ray(uc,'Round '+round+': **91%** (+4%). Nothing left that adds 1% — my stop rule says we’re done.',{type:'sign',what:'train'});
    E.setNext(uc,'you','Sign off Train');
  }
};
E.setTrain=(uc,k,v)=>{uc.train[k]=v;emit();};
E.applyTune=(uc,by,summary)=>{
  const wf=clone(E.cur(uc).wf);uc.train.applied=uc.train.applied||{};
  const ch=[];
  E.tuneSet(uc).forEach(s=>{if(uc.train.sugs[s.id]==='yes'&&!uc.train.applied[s.id]){const n=wf.nodes.find(x=>x.id===s.node);if(n){n.tuned=s.t;ch.push(n.id);}uc.train.applied[s.id]=true;}});
  if(!ch.length)return null;
  const v=E.addVersion(uc,wf,by,summary,ch,{tuned:true});
  E.pulse(uc,ch,'workflow');E.log(uc,'v'+v.n+': '+summary,by,by==='ray'?'ray':'you');
  E.logMsg(uc,'Version '+v.n+' created · logged · reversible','ti-git-commit');
  return v;
};
E.decide=async(uc,msgId,sid,yes)=>{
  uc.train.sugs[sid]=yes?'yes':'no';
  const s=E.tuneSet(uc).find(x=>x.id===sid);
  E.log(uc,(yes?'Accepted':'Rejected')+' suggestion: '+s.t,'you','you');emit();
  const pending=E.tuneSet(uc).filter(x=>!uc.train.sugs[x.id]);
  if(!pending.length)await finishSugs(uc,msgId);
};
E.acceptAll=async(uc,msgId)=>{E.tuneSet(uc).forEach(x=>{if(!uc.train.sugs[x.id])uc.train.sugs[x.id]='yes';});E.log(uc,'Accepted all remaining suggestions','you','you');emit();await finishSugs(uc,msgId);};
async function finishSugs(uc,msgId){
  const acc=E.tuneSet(uc).filter(x=>uc.train.sugs[x.id]==='yes').length;
  E.doneCard(uc,msgId,acc+' of 5 accepted');
  const v=E.applyTune(uc,'you','Applied your tuning decisions');
  uc.step='t.round';
  await E.ray(uc,(v?'Applied — **version '+v.n+'**. ':'Nothing new to apply. ')+'Run one more practice round to prove it helps?',{type:'round'});
  E.setNext(uc,'you','Run round 2 or sign off');
}
E.round=async(uc,msgId,again)=>{
  if(again){E.doneCard(uc,msgId,'Run another round');await E.startReplay(uc,null,false);return;}
  E.doneCard(uc,msgId,'Skip — sign off now');uc.step='t.sign';
  await E.ray(uc,'OK. Signing off Train makes version '+E.cur(uc).n+' the tuned baseline for Prove.',{type:'sign',what:'train'});
  E.setNext(uc,'you','Sign off Train');
};

/* ---------- PROVE ---------- */
E.setProve=(uc,k,v)=>{uc.prove[k]=v;if(k==='dur')uc.prove.total=parseInt(v)*7;emit();};
E.startShadow=async(uc,msgId)=>{
  E.doneCard(uc,msgId,uc.prove.dur+' · '+uc.prove.cov);
  uc.stage='prove';uc.step='p.run';uc.prove.running=true;uc.prove.day=0;
  E.log(uc,'Shadow run started · '+uc.prove.dur+' · '+uc.prove.cov+' · no effect on alerts','you','you');
  E.setNext(uc,'ray','Shadowing live alerts');
  const m=await E.ray(uc,'Shadow run started — I decide in parallel and **change nothing**.',{type:'shadowrun'},{fast:true});
  uc.prove.msgId=m.id;E.setTab(uc,'results');
  for(let d=1;d<=9&&uc.prove.day<uc.prove.total;d++){await wait(320);if(uc.prove.day>=uc.prove.total)return;uc.prove.day=d;emit();}
};
E.fastForward=async(uc)=>{
  if(uc.prove.day>=uc.prove.total)return;
  const step=Math.max(1,Math.round(uc.prove.total/10));
  while(uc.prove.day<uc.prove.total){uc.prove.day=Math.min(uc.prove.total,uc.prove.day+step);emit();await wait(140);}
  uc.prove.running=false;E.doneCard(uc,uc.prove.msgId,'Completed · day '+uc.prove.total);
  E.log(uc,'Shadow run complete · 91% agreement · 98% escalation recall · 0 missed SARs','ray');
  uc.step='p.sign';
  await E.ray(uc,'Shadow run complete — **all targets met**. Going live needs two signatures:',{type:'approvals'});
  E.setNext(uc,'you','Request sign-off');
};
E.requestSignoff=async(uc,msgId)=>{
  const m=uc.msgs.find(x=>x.id===msgId);m.card.requested=true;emit();
  E.log(uc,'Requested sign-off from MLRO and Head of FCC','you','you');
  E.setNext(uc,'mlro','Sign the proof of concept');
  await wait(1400);uc.prove.signed.mlro=now();E.log(uc,'Signed by Sarah Klein (MLRO)','mlro','sign');emit();
  E.setNext(uc,'fcc','Sign the proof of concept');
  await wait(1400);uc.prove.signed.fcc=now();E.log(uc,'Signed by Lior Ben-Ami (Head of FCC)','fcc','sign');emit();
  E.doneCard(uc,msgId,'Both signed');uc.done.prove=true;
  await E.startOperate(uc);
};

/* ---------- OPERATE ---------- */
E.startOperate=async(uc)=>{
  uc.stage='operate';uc.step='o.check';
  D.CHECKLIST.forEach((c,i)=>{if(c.ray)uc.operate.chk[i]='ray';});
  await E.ray(uc,'Both signed — Prove is complete. Last stretch: I ticked what I can prove; **2 items need you**.',{type:'checklist'});
  E.setNext(uc,'you','Confirm 2 checklist items');
};
E.toggleCheck=async(uc,msgId,i)=>{
  if(uc.operate.chk[i]==='ray')return;
  uc.operate.chk[i]=uc.operate.chk[i]?null:'you';emit();
  if(D.CHECKLIST.every((c,j)=>uc.operate.chk[j])){
    E.doneCard(uc,msgId,'All 5 confirmed');E.log(uc,'Go-live checklist complete','you','you');
    uc.step='o.auth';
    await E.ray(uc,'Checklist done. **How much authority do I start with?** Start small, grow with trust.',{type:'authority'});
    E.setNext(uc,'you','Choose starting authority');
  }
};
E.pickAuth=async(uc,msgId,id)=>{
  uc.operate.auth=id;E.doneCard(uc,msgId,D.AUTHORITY.find(a=>a.id===id).t);
  E.log(uc,'Starting authority: '+D.AUTHORITY.find(a=>a.id===id).t,'you','you');
  uc.step='o.go';
  await E.ray(uc,'Ready. This is the only step that affects real alerts — **your signature makes it live**.',{type:'sign',what:'operate'});
  E.setNext(uc,'you','Go live');
};
E.rollback=async(uc)=>{
  uc.operate.live=false;uc.step='o.go';E.log(uc,'Rolled back — Ray stopped affecting alerts','you','sign');
  await E.ray(uc,'Rolled back. I’m no longer affecting alerts — nothing was lost. Sign again whenever you’re ready.',{type:'sign',what:'operate'});
};

/* ---------- step-specific free text (part B) ---------- */
E.routeLater=async(uc,s,text)=>{
  const st=uc.step,find=t=>[...uc.msgs].reverse().find(m=>m.card&&m.card.type===t&&!m.card.done);
  if(st==='b.handoff'){const m=find('handoff');if(m){await E.handoff(uc,m.id,has(s,['dana','team lead','hand'])?'dana':'me');return true;}}
  if(st==='t.setup'){
    if(has(s,['3 month']))E.setTrain(uc,'period','Last 3 months');
    if(has(s,['12 month','year']))E.setTrain(uc,'period','Last 12 months');
    if(has(s,['500']))E.setTrain(uc,'size','500 alerts');
    if(has(s,['all']))E.setTrain(uc,'size','All 2,140 alerts');
    const m=find('tdata');if(m){await E.startReplay(uc,m.id,has(s,['csv','upload']));return true;}
  }
  if(st==='t.sugs'&&has(s,['accept all','all of them','yes to all'])){const m=find('sugs');if(m){await E.acceptAll(uc,m.id);return true;}}
  if(st==='t.round'){const m=find('round');if(m){await E.round(uc,m.id,!/\b(sign|skip|no|done)\b/.test(s));return true;}}
  if(st==='t.sign'||st==='b.apply'||st==='o.go'){if(has(s,['sign','approve','yes','go live','looks good'])){const m=find('sign');if(m){await E.sign(uc,m.id,m.card.what);return true;}}}
  if(st==='p.setup'){
    ['2 week','4 week','6 week'].forEach(w=>{if(s.includes(w))E.setProve(uc,'dur',w.replace('week','weeks'));});
    ['25%','50%','100%'].forEach(c=>{if(s.includes(c))E.setProve(uc,'cov',c+' of new alerts');});
    const m=find('shadow');if(m){await E.startShadow(uc,m.id);return true;}
  }
  if(st==='p.run'&&has(s,['fast','skip','finish','end','forward'])){await E.fastForward(uc);return true;}
  if(st==='p.sign'){const m=find('approvals');if(m&&!m.card.requested){await E.requestSignoff(uc,m.id);return true;}}
  if(st==='o.live'||uc.operate.live){
    if(has(s,['roll back','rollback','stop'])){await E.rollback(uc);return true;}
    await E.ray(uc,'Noted: “'+text+'”. Because I’m live, I’ll prepare it as a **draft version '+(E.cur(uc).n+1)+'** and run it through **Train and Prove** first — it won’t touch a real alert until you sign again.');
    E.log(uc,'Change requested in production: “'+text+'” → draft routed through Train + Prove','you','you');return true;
  }
  return false;
};

/* ---------- seeded team of investigators ---------- */
const T0=()=>({period:'Last 6 months',size:'1,000 alerts',rounds:[],sugs:{},replay:0});
function seed(tpl,opts){
  const uc=E.newUC(tpl);uc.seed=true;Object.assign(uc,opts.base||{});
  uc.hasDocs=true;uc.policy=D.buildPolicy(tpl,true);uc.report='predefined';
  uc.files=clone(tpl==='ts-example'?D.EX_FILES:D.SAMPLE_FILES).map(f=>Object.assign(f,{pct:100}));
  const wf=D.buildWorkflow(tpl);
  for(let i=0;i<(opts.vers||1);i++)E.addVersion(uc,clone(wf),i?'you':'ray',i?'Refined from comments':'First draft from your policy',[]);
  uc.versions.forEach((v,i)=>{v.at=opts.at||'Yesterday';});
  (opts.trail||[]).forEach(t=>uc.trail.unshift({id:Math.random().toString(36).slice(2),text:t[0],who:t[1],kind:t[2]||'ray',ver:'v'+(opts.vers||1),at:t[3]||'Yesterday'}));
  uc.mode=opts.mode||'guide';uc.updated=opts.updated||'Yesterday';
  uc.need=opts.need||null;uc.next=opts.next;
  uc.msgs=[];(opts.msgs||[]).forEach(m=>uc.msgs.push(Object.assign({id:Math.random().toString(36).slice(2),at:opts.updated||'Yesterday'},m)));
  return uc;
}
E.seed=()=>{
  if(S.ucs.length)return;
  seed('card-us',{vers:4,mode:'auto',base:{stage:'operate',step:'o.live',done:{build:true,train:true,prove:true,operate:true},operate:{chk:{0:'ray',1:'ray',2:'you',3:'ray',4:'you'},auth:'close',live:true},train:Object.assign(T0(),{rounds:[{n:1,agree:86},{n:2,agree:92}]})},
    next:{who:'ray',what:'Working alone · monitored'},updated:'2 days ago',
    trail:[['Draft v1 on Autopilot','ray'],['Signed Build + Train','you','sign'],['Shadow run complete · 93% agreement','ray'],['Signed by MLRO and Head of FCC','fcc','sign'],['GO LIVE · authority: auto-close high-confidence FPs','you','sign']],
    msgs:[{from:'log',text:'Live since 12 Oct · authority: auto-close high-confidence false positives',icon:'ti-player-play'},{from:'ray',text:'**Welcome back.** Card Fraud Issuing US has been live for 4 days: **3,912 alerts**, 31% closed automatically, 0 SLA breaches. Nothing needs you. Want a change? Just tell me.'}]});
  seed('vasp',{vers:5,base:{stage:'prove',step:'p.sign',done:{build:true,train:true},prove:{dur:'4 weeks',cov:'50% of new alerts',day:28,total:28,signed:{},running:false}},
    next:{who:'you',what:'Request sign-off'},updated:'Today, 08:10',need:{kind:'warn',ic:'ti-signature',t:'Shadow targets met — request sign-off',d:'Crypto / VASP: 91% agreement, 98% escalation recall over 4 weeks.'},
    trail:[['Shadow run complete · all targets met','ray']],
    msgs:[{from:'ray',text:'**Good news while you were away:** the 4-week shadow run on Crypto / VASP finished and all three targets are met. Going live needs two signatures:',card:{type:'approvals'}}]});
  seed('pep-am',{vers:2,base:{stage:'build',step:'b.refine'},next:{who:'you',what:'Decide on Dana’s comment'},updated:'Today, 09:24',
    need:{kind:'ai',ic:'ti-message-circle',t:'Dana commented on PEP & Adverse Media',d:'“Supervisor should own the PEP decision step.” Apply it, or discuss.'},
    trail:[['Comment from Dana Levi: “Supervisor should own the PEP decision step”','dana','you','Today, 09:24']],
    msgs:[{from:'log',text:'Version 2 · refined from your comments',icon:'ti-git-commit'},{from:'ray',text:'**Dana Levi** (analyst team lead) left a comment on version 2:',card:{type:'comment',who:'dana',text:'Supervisor should own the PEP decision step.'}}]});
  seed('cb-es',{vers:4,base:{stage:'prove',step:'p.run',done:{build:true,train:true},prove:{dur:'4 weeks',cov:'50% of new alerts',day:9,total:28,signed:{},running:true}},
    next:{who:'ray',what:'Shadowing live alerts · day 9 of 28'},updated:'Today, 07:00',
    trail:[['Shadow run started · 4 weeks · 50% of new alerts','you']],
    msgs:[{from:'ray',text:'Shadow run in progress — **day 9 of 28**. So far: 1,284 alerts, 91% agreement. I’ll ping you when the targets are clear.',card:{type:'shadowrun'}}]});
  seed('ts-uk',{vers:3,base:{stage:'train',step:'t.sugs',done:{build:true},train:Object.assign(T0(),{rounds:[{n:1,agree:87}],sugs:{t3:'yes',t5:'yes'},applied:{t3:true,t5:true}})},
    next:{who:'dana',what:'Decide 3 suggestions'},updated:'Yesterday',
    need:{kind:'ai',ic:'ti-hourglass',t:'Waiting on Dana for 1 day',d:'Transaction Screening UK: 3 tuning suggestions need a decision. Nudge her or decide yourself.'},
    trail:[['Signed off Build · v3','you','sign'],['Practice round 1 · 87% agreement','ray'],['Technical fixes applied (coverage bug, nationality gap)','ray'],['Handed Train to Dana Levi','you']],
    msgs:[{from:'ray',text:'**Picking up where Dana left off.** Practice round 1: I agreed with your analysts on **87%** of 1,000 alerts. I fixed the 2 technical issues myself; **3 suggestions** are waiting for a compliance call:',card:{type:'sugs'}}]});
  S.ucs.forEach(u=>{u.msgs.forEach(m=>{if(m.card&&m.card.type==='shadowrun')u.prove.msgId=m.id;});});
};
E.applyComment=async(uc,msgId,yes)=>{
  E.doneCard(uc,msgId,yes?'Applied':'Discussing');uc.need=null;
  if(yes){await E.refine(uc,'Supervisor should own the PEP decision step','dana');return;}
  await E.ray(uc,'I’ll ask Dana what she’s seeing. Meanwhile, tell me what you think in your own words.');
};
E.seed();
})();
