/* Ray Studio v3 — engine layer: Brief → Playbook → gates, one Sign sheet, tracked changes */
(function(){
const D=window.RSD,E=window.RSE,S=E.state;
const wait=E.wait,now=E.now,emit=E.emit;
const has=(s,a)=>a.some(k=>s.includes(k));
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Math.random().toString(36).slice(2,9);
const LV={every:{t:'Every step',d:'Ray asks before each step',ic:'ti-list-check'},important:{t:'Only what matters',d:'Ray asks for decisions and signatures',ic:'ti-adjustments'},sign:{t:'Only to sign',d:'Autopilot — you decide 3 times',ic:'ti-sparkles'}};
E.LV=LV;

const baseNew=E.newUC;
E.newUC=tpl=>{const uc=baseNew(tpl);
  Object.assign(uc,{brief:{tpl:tpl||null,docs:true,report:'predefined',period:'Last 6 months',level:'important'},level:'important',gate:null,signedVer:0,signs:[],comment:null,run:null,step:'brief'});
  if(tpl){const t=D.TEMPLATES.find(x=>x.id===tpl);uc.tpl=tpl;uc.name=t.t;}
  uc.next={who:'you',what:'Check the brief'};return uc;};
function pingIfAway(uc,t,d){if(S.openId!==uc.id){uc.need={kind:'ai',ic:'ti-bell-ringing',t,d,acts:[['Open','open']]};emit();}}

const STOP=['the','and','for','our','its','set','up','out','new','need','want','build','make','with','from','that','this','please','case','uses','used','using','about','into','just','like','help','start','setup','something','screen','aml','policy','autopilot','step','steps'];
function candidates(str){
  const s=' '+str.toLowerCase()+' ';
  const toks=s.split(/[^a-z0-9]+/).filter(w=>w.length>1&&STOP.indexOf(w)<0);
  const out=[];
  D.TEMPLATES.forEach(t=>{
    let sc=0;t.kw.forEach(k=>{if(s.includes(k))sc+=k.length>4?2:1;});
    if(s.includes(t.t.toLowerCase()))sc+=10;
    const hay=(t.t+' '+t.r+' '+D.CATS[t.cat].n).toLowerCase();
    toks.forEach(w=>{if(hay.indexOf(w)>=0)sc+=1;});
    if(sc>0)out.push({t,sc});});
  out.sort((a,b)=>b.sc-a.sc);
  if(!out.length)return [];
  const top=out[0].sc;return out.filter(x=>x.sc>=top-0.5).slice(0,3).map(x=>x.t);
}
function parse(text){const s=' '+text.toLowerCase()+' ';
  return {cands:candidates(s),t:candidates(s)[0]||E.matchTpl(s),level:has(s,['autopilot','auto pilot','shortcut','do it for me','for me'])?'sign':has(s,['step by step','every step','guide me'])?'every':'important',
    docs:!has(s,['template policy','no policy','without our'])};}

/* ---------- Brief ---------- */
E.createFromPrompt=async(text,via)=>{
  const p=parse(text);const many=p.cands.length>1;
  const uc=E.newUC(many?null:(p.t?p.t.id:null));S.openId=uc.id;
  uc.brief.level=p.level;uc.brief.docs=p.docs;
  E.you(uc,text,via);
  if(many){await E.ray(uc,'That matches **'+p.cands.length+' jobs** — which one do you mean?',{type:'pick',opts:p.cands.map(t=>t.id)});return;}
  await E.ray(uc,p.t?'I turned that into a **brief** — it’s on the left. Tap anything to change it, or just tell me. Then press **Start**.':'Happy to help. **Which job should I learn?** Pick one in the brief, or name it.');
};
E.startFromTpl=async(id)=>{const uc=E.newUC(id);S.openId=uc.id;emit();await E.ray(uc,'Here’s a **brief** for '+uc.name+'. Adjust anything, then press **Start**.');};
E.startBlank=async()=>{const uc=E.newUC(null);S.openId=uc.id;emit();await E.ray(uc,'**Which job should I learn?** Pick one in the brief.');};
E.setBrief=(uc,k,v)=>{uc.brief[k]=v;if(k==='tpl'){const t=D.TEMPLATES.find(x=>x.id===v);uc.tpl=v;uc.name=t.t;}emit();};
E.takeOverRay=async(uc)=>{
  uc.level='important';uc.mode='guide';
  E.log(uc,'Stopped Autopilot and took over','you','decision');emit();
  await E.ray(uc,'Stopped. I’ll finish what I’m doing and then check with you at every decision instead of running ahead.');
};
E.setLevel=async(uc,lv)=>{if(uc.step==='brief'){E.setBrief(uc,'level',lv);return;}
  uc.level=lv;uc.mode=lv==='sign'?'auto':'guide';E.log(uc,'Check-with-me set to: '+LV[lv].t,'you','you');emit();
  await E.ray(uc,'From now on I’ll check with you **'+LV[lv].t.toLowerCase()+'**.'+(lv==='sign'?' I’ll still stop for held rules and every signature.':''));};

E.startBrief=async(uc)=>{
  if(!uc.tpl)return;const b=uc.brief;
  uc.level=b.level;uc.mode=b.level==='sign'?'auto':'guide';uc.train.period=b.period;uc.train.csv=!!b.csv;uc.step='building';
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
  uc.stage='train';uc.step='t.run';const round=uc.train.rounds.length+1,target=round===1?87:round===2?91:92,N=uc.train.csv?600:1000;
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
  uc.train.sugs[sid]=yes?'yes':'no';uc.need=null;(uc.sugLog=uc.sugLog||[]).push(sid);const s=E.tuneSet(uc).find(x=>x.id===sid);
  E.log(uc,(yes?'Accepted':'Rejected')+' suggestion: '+s.t,'you','you');
  if(yes)E.applyTune(uc,'you','Accepted: '+s.t);
  emit();
  if(!E.tuneSet(uc).some(x=>!uc.train.sugs[x.id]))await afterSugs(uc);
};
E.undoSug=async(uc)=>{
  const last=uc.sugLog&&uc.sugLog.length?uc.sugLog.pop():null;if(!last)return;
  delete uc.train.sugs[last];
  if(uc.train.applied&&uc.train.applied[last]&&uc.versions.length>1){const prev=uc.versions[uc.versions.length-2];
    const v=E.addVersion(uc,clone(prev.wf),'you','Undid the last suggestion decision',[]);delete uc.train.applied[last];
    E.log(uc,'v'+v.n+': undid the last suggestion decision','you','change');}
  else E.log(uc,'Undid the last suggestion decision','you','change');
  emit();await E.ray(uc,'Undone — that suggestion is open again.');
};
E.commentSug=async(uc,sid,text)=>{
  const s2=E.tuneSet(uc).find(x=>x.id===sid);if(!s2||!text.trim())return;
  E.log(uc,'Comment on suggestion “'+s2.t+'”: “'+text.trim()+'”','you','comment');emit();
  await E.ray(uc,'Noted against **'+s2.t+'** — it stays open until you accept or reject it, and the comment is in the audit trail.');
};
E.useCsv=async(uc)=>{uc.train.csv=true;E.log(uc,'Uploaded a labelled CSV as the practice set (600 alerts)','you','change');emit();
  await E.ray(uc,'Read it — **600 labelled alerts** with the expected outcome on each. I’ll practise on those instead of the last '+uc.train.period.toLowerCase()+'.');};
E.anotherRound=async(uc)=>{await E.startPractice2(uc);};
E.acceptAllSugs=async(uc)=>{E.tuneSet(uc).forEach(x=>{if(!uc.train.sugs[x.id])uc.train.sugs[x.id]='yes';});uc.need=null;E.applyTune(uc,'you','Accepted all remaining suggestions');E.log(uc,'Accepted all remaining suggestions','you','you');await afterSugs(uc);};
async function afterSugs(uc){
  if(uc.level==='every'){uc.step='t.round';await E.ray(uc,'All decided. Run one more practice round to prove the changes help?',{type:'confirm',what:'round',label:'Run round 2'});E.setNext(uc,'you','Run round 2');return;}
  await round2(uc);
}
E.startPractice2=async(uc)=>{await round2(uc);};
async function round2(uc){
  const t=await practice(uc);
  uc.step='t.gate';uc.gate={what:!uc.done.build?'buildtrain':'train'};
  await E.ray(uc,'Round '+uc.train.rounds.length+': **'+t+'%** — above the 90% target, with nothing left that adds 1%. **Ready for your signature.**');
  E.setNext(uc,'you','Sign off '+(uc.gate.what==='buildtrain'?'Build + Train':'Train'));
}
E.pickOwner=async(uc,msgId,who,note)=>{
  E.doneCard(uc,msgId,who==='you'?'I’ll run it':D.PEOPLE[who].n);
  await E.handTo(uc,who,note);
  if(who==='you'){uc.step='t.ask';await E.ray(uc,'Ready when you are — I practice on 1,000 closed alerts and come back with what I learned.',{type:'confirm',what:'practice',label:'Start practice'});E.setNext(uc,'you','Start practice');}
};
E.confirm=async(uc,msgId,what)=>{E.doneCard(uc,msgId,'Yes');if(what==='round')await round2(uc);if(what==='practice')await E.startPractice(uc);if(what==='shadow')await E.startShadow3(uc);};

/* ---------- gates & signing ---------- */
E.signGate=async(uc)=>{
  const g=uc.gate;if(!g)return;const v=E.cur(uc).n;uc.signedVer=v;uc.signs.push(v);uc.gate=null;uc.need=null;
  if(g.what==='build'){
    uc.done.build=true;uc.stage='train';uc.docsReady=true;
    E.log(uc,'Signed off Build · v'+v+' · model risk document and analyst guide written','you','sign');E.logMsg(uc,'Build signed · v'+v+' · 2 documents written','ti-signature');
    if(uc.level==='sign'){await E.ray(uc,'Signed — the **model risk document** and **analyst guide** are in the playbook. Moving straight on to **Train**.');await E.startPractice(uc);return;}
    uc.step='t.who';
    await E.ray(uc,'Signed — the **model risk document** and **analyst guide** are written (open them at the bottom of the playbook). Next is **Train**: practice on alerts your analysts already closed. That stage is usually owned by the analyst team lead. Who runs it?',{type:'handoff'});
    E.setNext(uc,'you','Choose who runs Train');
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


/* ---------- audit: phase + more event kinds ---------- */
const PHASE={build:'Build',train:'Train',prove:'Prove',operate:'Operate'};
const baseLog=E.log;
E.log=(uc,text,who,kind)=>{baseLog(uc,text,who,kind);const t=uc.trail[0];if(t)t.phase=PHASE[uc.stage]||'Build';};
E.note=(uc,text,who,kind)=>{E.log(uc,text,who||'you',kind||'view');};

/* ---------- direct edits: same tracked change, version and audit entry as talking ---------- */
E.ROLES=['System','Ray','Analyst L1','Analyst L2','Supervisor','MLRO'];
E.SLAS=['Instant','4 hours','24 hours','48 hours','5 days','10 days','30 days'];
const numOf=(wf,id)=>[...wf.nodes].sort((a,b)=>a.r-b.r||a.c-b.c).findIndex(n=>n.id===id)+1;
async function commit(uc,wf,summary,changed,anchorId,line){
  const v=E.addVersion(uc,wf,'you',summary,changed);
  const n=wf.nodes.find(x=>x.id===anchorId);
  uc.lastChange={v:v.n,summary,clause:(n&&uc.policy.find(c=>c.no===n.pol))||uc.policy[0],intent:'edit'};
  if(changed.length)E.pulse(uc,changed);
  E.log(uc,'v'+v.n+': '+summary,'you','you');
  E.logMsg(uc,'Version '+v.n+' · edited in the playbook','ti-pencil');
  if(uc.stage==='build')uc.gate={what:'build'};
  emit();
  await E.ray(uc,line+' — **version '+v.n+'**.',anchorId?{type:'anchor',anchor:anchorId}:null);
}
E.editStep=async(uc,id,d)=>{
  const wf=clone(E.cur(uc).wf),NV=uc.versions.length+1,n=wf.nodes.find(x=>x.id===id);if(!n)return;
  const chg={ver:NV},parts=[];
  if(d.role&&d.role!==n.role){chg.role={before:n.role,after:d.role};parts.push('owner is now '+d.role);n.role=d.role;}
  if(d.sla&&d.sla!==n.sla){chg.sla={before:n.sla,after:d.sla};parts.push('deadline is now '+d.sla);n.sla=d.sla;}
  if(d.ai!==undefined&&!!d.ai!==!!n.ai){chg.ai={before:n.ai?'Ray decides':'a fixed rule',after:d.ai?'Ray decides':'a fixed rule'};parts.push(d.ai?'Ray decides it':'a fixed rule decides it');n.ai=!!d.ai;}
  if(d.note&&d.note.trim()){chg.note={after:d.note.trim()};parts.push('your instruction added');n.note=d.note.trim();}
  if(d.acts){const before=(n.acts||[]).join('|');if(before!==d.acts.join('|')){const added=d.acts.filter(x=>!(n.acts||[]).includes(x));chg.acts={after:added[0]||d.acts[0],list:true};parts.push(d.acts.length>(n.acts||[]).length?'a line added to what happens':'what happens edited');n.acts=d.acts;}}
  if(!parts.length)return;
  n.chg=chg;
  await commit(uc,wf,'Step “'+n.t+'”: '+parts.join('; '),[n.id],n.id,'Step '+numOf(wf,n.id)+' updated: '+parts.join(', '));
};
E.addStep=async(uc,afterId,d)=>{
  const wf=clone(E.cur(uc).wf),NV=uc.versions.length+1;
  const a=wf.nodes.find(x=>x.id===afterId)||wf.nodes[wf.nodes.length-1];
  const nid='s'+Math.random().toString(36).slice(2,7);
  wf.nodes.forEach(x=>{if(x.r>a.r)x.r++;});
  wf.edges=wf.edges.map(e=>e[0]===a.id?[nid,e[1],e[2]]:e);
  wf.edges.push([a.id,nid]);
  wf.nodes.push({id:nid,t:(d.t||'New step').trim(),k:d.ai?'search2':'rule',ai:!!d.ai,role:d.role||'Analyst L1',sla:d.sla||'24 hours',pol:a.pol,isNew:NV,r:a.r+1,c:a.c});
  await commit(uc,wf,'Added step “'+(d.t||'New step').trim()+'” after “'+a.t+'”',[nid],nid,'Added “'+(d.t||'New step').trim()+'” as step '+numOf(wf,nid));
};
E.removeStep=async(uc,id)=>{
  const wf=clone(E.cur(uc).wf),n=wf.nodes.find(x=>x.id===id);
  if(!n||wf.nodes.length<3)return;
  const ins=wf.edges.filter(e=>e[1]===id),outs=wf.edges.filter(e=>e[0]===id);
  wf.edges=wf.edges.filter(e=>e[0]!==id&&e[1]!==id);
  ins.forEach(i=>outs.forEach(o=>{if(i[0]!==o[1]&&!wf.edges.some(e=>e[0]===i[0]&&e[1]===o[1]))wf.edges.push([i[0],o[1],i[2]||o[2]]);}));
  wf.nodes=wf.nodes.filter(x=>x.id!==id);
  if(!wf.nodes.some(x=>x.r===n.r))wf.nodes.forEach(x=>{if(x.r>n.r)x.r--;});
  await commit(uc,wf,'Removed step “'+n.t+'”',[],null,'Removed “'+n.t+'”');
};


/* ---------- comments on steps, applied in one batch ---------- */
E.comments=uc=>uc.cmts||(uc.cmts=[]);
E.addComment=(uc,nodeId,text,by)=>{
  if(!text.trim())return;
  E.comments(uc).push({id:uid(),node:nodeId,text:text.trim(),by:by||'you',at:now(),applied:false});
  const n=E.cur(uc).wf.nodes.find(x=>x.id===nodeId);
  E.log(uc,'Comment on “'+(n?n.t:'a step')+'”: “'+text.trim()+'”',by||'you','comment');
  E.logMsg(uc,'Comment added · Ray applies it when you run the comments','ti-message-2');
  emit();
};
E.delComment=(uc,id)=>{uc.cmts=E.comments(uc).filter(c=>c.id!==id);emit();};
E.openCmts=uc=>E.comments(uc).filter(c=>!c.applied);
E.runComments=async(uc)=>{
  const open=E.openCmts(uc);if(!open.length)return;
  const wf=clone(E.cur(uc).wf),NV=uc.versions.length+1,changed=[];
  open.forEach(c=>{
    const n=wf.nodes.find(x=>x.id===c.node);if(!n)return;
    const low=c.text.toLowerCase(),m=low.match(/(\d+)\s*(hour|day)/);
    if(m)   {const after=m[1]+' '+m[2]+(m[1]==='1'?'':'s');n.chg=Object.assign({ver:NV},n.chg&&n.chg.ver===NV?n.chg:null,{sla:{before:n.sla,after}});n.sla=after;}
    else if(/supervisor|mlro|level 2|l2/.test(low)){const role=/mlro/.test(low)?'MLRO':/level 2|l2/.test(low)?'Analyst L2':'Supervisor';n.chg=Object.assign({ver:NV},n.chg&&n.chg.ver===NV?n.chg:null,{role:{before:n.role,after:role}});n.role=role;}
    else if(/four-eyes|four eyes|second review/.test(low)){n.acts=(n.acts||[]).concat(['Second reviewer signs off before this completes']);n.chg=Object.assign({ver:NV},{acts:{after:'Second reviewer signs off before this completes'}});}
    else    {n.note=c.text;n.chg=Object.assign({ver:NV},n.chg&&n.chg.ver===NV?n.chg:null,{note:{after:c.text}});}
    c.applied=true;c.ver=NV;changed.push(n.id);
  });
  const who=open.filter(c=>c.by!=='you').length?'dana':'you';
  const v=E.addVersion(uc,wf,who,'Applied '+open.length+' comment'+(open.length>1?'s':''),changed);
  uc.lastChange={v:v.n,summary:v.summary,clause:uc.policy[0],intent:'comment'};
  E.pulse(uc,changed);E.log(uc,'v'+v.n+': applied '+open.length+' comment'+(open.length>1?'s':'')+' on '+changed.length+' step'+(changed.length>1?'s':''),'ray','ray');
  if(uc.stage==='build')uc.gate={what:'build'};
  emit();
  await E.ray(uc,'Applied '+open.length+' comment'+(open.length>1?'s':'')+' — **version '+v.n+'**. Each one is marked on its step.',{type:'anchor',anchor:changed[0]});
};

/* ---------- hand the next stage to someone ---------- */
E.handTo=async(uc,who,note)=>{
  uc.owner=who;uc.need=null;
  if(who==='you'){uc.next={who:'you',what:'Start practice'};E.log(uc,'Took the next stage on myself','you','decision');emit();
    await E.ray(uc,'You own it. Ready when you are.');return;}
  const p=D.PEOPLE[who];
  uc.next={who,what:'Start the practice round'};
  E.log(uc,'Handed Train to '+p.n+' ('+p.r+')'+(note?' — “'+note+'”':''),'you','decision');
  E.logMsg(uc,p.n+' is notified · context, versions and open items attached','ti-send');
  uc.need={kind:'warn',ic:'ti-hourglass',t:'Waiting on '+p.n.split(' ')[0],d:uc.name+': the practice round has not started yet.',acts:[['Nudge '+p.n.split(' ')[0],'nudge'],['Decide myself','take']]};
  emit();
  await E.ray(uc,'Sent to **'+p.n+'** with the full context — what we built, why, and what is still open. I will nudge if nothing moves by tomorrow.');
};

/* ---------- documents: add, remove, Ray-written docs, policy update ---------- */
const DOCKIND={policy:'Policy',proc:'Procedure',sup:'Supporting',ray:'Written by Ray'};
E.DOCKIND=DOCKIND;
E.docs=uc=>{
  if(!uc.docList){
    uc.docList=(uc.files||[]).map((f,i)=>Object.assign({},f,{id:'d'+i,kind:i===0?'policy':i===1?'proc':'sup'}));
  }
  return uc.docList;
};
E.addDocs=async(uc,names)=>{
  const list=E.docs(uc);
  names.forEach((nm,i)=>list.push({id:'d'+uid(),name:nm,size:(0.3+i*0.4).toFixed(1)+' MB',ext:(nm.split('.').pop()||'PDF').toUpperCase().slice(0,3),c:'#6A4BC4',found:(3+i)+' clauses',kind:'sup',pct:100,fresh:true}));
  E.log(uc,'Added '+names.length+' document'+(names.length>1?'s':''),'you','change');emit();
  await E.ray(uc,'Read '+(names.length>1?'them':'it')+'. Nothing in '+(names.length>1?'those documents':'that document')+' contradicts the playbook — I noted the extra detail against the steps it touches.');
};
E.delDoc=(uc,id)=>{uc.docList=E.docs(uc).filter(d=>d.id!==id);E.log(uc,'Removed a document','you','change');emit();};
E.rayDocs=uc=>{
  const v=E.cur(uc)?E.cur(uc).n:1,t=E.tplOf(uc)||{t:'this use case',reg:'the regulator'};
  return [
   {id:'mrm',t:'Model risk document',sub:'For validators and the regulator · version '+v,ic:'ti-shield-check',
    body:[['Purpose','Ray investigates '+t.t+' alerts under '+t.reg+'. It proposes outcomes; a person signs anything that affects a real alert.'],
      ['Data','Replayed '+(uc.train.rounds.length?'1,000 closed alerts from '+uc.train.period.toLowerCase():'no alerts yet')+'. Live alerts arrive from the case manager.'],
      ['Logic','The playbook has '+(E.cur(uc)?E.cur(uc).wf.nodes.length:0)+' steps, each tied to a clause in '+(uc.hasDocs?'the bank’s policy':'the ThetaRay template')+'. Decisions quote both values for every identifier.'],
      ['Controls','Sanctions and risk thresholds are held for a person. Filing is never automatic. Every change is versioned and reversible.'],
      ['Validation',uc.train.rounds.length?('Agreement with analysts: '+uc.train.rounds.map(r=>r.agree+'%').join(' → ')+'. '+(uc.prove.day>=uc.prove.total?'Shadow run passed all three targets.':'Shadow run in progress.')):'Not yet tuned.'],
      ['Sign-off',uc.signs.length?('Signed by the compliance lead at version '+uc.signs[uc.signs.length-1]+(uc.prove.signed.mlro?'; MLRO and Head of FCC signed the proof of concept.':'.')):'Not yet signed.']]},
   {id:'guide',t:'Analyst guide',sub:'What changes for your analysts · version '+v,ic:'ti-users',
    body:[['What Ray does',(E.cur(uc)?E.cur(uc).wf.nodes.filter(n=>n.ai).length:0)+' of the steps are decided by Ray; the rest stay rules or people.'],
      ['What you still own','Anything Ray parks for review, every escalation, and every filing decision.'],
      ['How to read Ray’s note','Ray writes the disposition, quotes the identifiers it compared and records a confidence level.'],
      ['If Ray is wrong','Reject it in the alert and tell your team lead — the comment comes back into the playbook.'],
      ['Authority today',uc.operate.live?D.AUTHORITY.find(a=>a.id===uc.operate.auth).t:'None yet — Ray affects no real alert until go-live.']]}];
};
E.readDoc=(uc,id)=>{const d=E.rayDocs(uc).find(x=>x.id===id);if(d){E.note(uc,'Opened the '+d.t.toLowerCase(),'you','view');}};
E.downloadDoc=(uc,id)=>{
  const d=E.rayDocs(uc).find(x=>x.id===id);if(!d)return;
  const txt=[uc.name+' — '+d.t,d.sub,''].concat(d.body.map(b=>b[0].toUpperCase()+'\n'+b[1]+'\n')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));
  a.download=uc.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase()+'_'+d.id+'.txt';document.body.appendChild(a);a.click();a.remove();
  E.note(uc,'Downloaded the '+d.t.toLowerCase(),'you','download');emit();
};
E.updatePolicy=async(uc)=>{
  const wf=clone(E.cur(uc).wf),NV=uc.versions.length+1;
  const targets=wf.nodes.filter(n=>n.pol).slice(0,2),changed=[];
  targets.forEach((n,i)=>{const before=n.sla;n.sla=i===0?'24 hours':n.sla;
    n.chg=Object.assign({ver:NV},i===0?{sla:{before,after:'24 hours'}}:{note:{after:'Follow the updated clause wording'}});
    if(i!==0)n.note='Follow the updated clause wording';changed.push(n.id);});
  E.docs(uc).unshift({id:'d'+uid(),name:'AML_Policy_2027.pdf',size:'2.6 MB',ext:'PDF',c:'#DC3F3B',found:'3 clauses changed',kind:'policy',pct:100,fresh:true});
  const v=E.addVersion(uc,wf,'ray','Updated from the new policy',changed);
  E.pulse(uc,changed);E.log(uc,'v'+v.n+': compared the new policy · 3 clauses changed · updated '+changed.length+' steps','ray','change');
  if(uc.stage==='build')uc.gate={what:'build'};
  else{uc.stale=true;}
  emit();
  await E.ray(uc,'Compared the new policy against the old one: **3 clauses changed**, and I updated '+changed.length+' steps in **version '+v.n+'**.'+(uc.done.train?' Because this is already past Train, **run practice again before it goes live** — I’ve marked it.':''),{type:'anchor',anchor:changed[0]});
};

/* ---------- skip a stage (POC paths) ---------- */
E.skipStage=async(uc,what)=>{
  uc.skipped=uc.skipped||{};
  const go=async(k)=>{uc.skipped[k]=true;uc.done[k]=true;E.log(uc,'Skipped '+PHASE[k]+' — accepted the consequences','you','decision');};
  if(what==='train'||what==='both')await go('train');
  if(what==='prove'||what==='both')await go('prove');
  uc.stage=uc.skipped.prove?'operate':'prove';
  uc.gate={what:uc.stage==='operate'?'live':'prove'};
  uc.step=uc.stage==='operate'?'o.gate':'p.gate';
  if(uc.stage==='operate')D.CHECKLIST.forEach((c,i)=>{if(c.ray)uc.operate.chk[i]='ray';});
  emit();
  await E.ray(uc,'Skipped '+(what==='both'?'**Train and Prove**':'**'+PHASE[what]+'**')+'. That is recorded in the audit trail with your name — and the go-live checklist now says the workflow was never tested on your alerts.');
};

/* ---------- change a live use case ---------- */
E.requestChange=async(uc,text)=>{
  uc.stale=true;uc.changeReq=text||'Change requested';
  uc.stage='build';uc.step='b.refine';uc.gate={what:'build'};uc.done.train=false;uc.done.prove=false;
  uc.train.rounds=[];uc.train.sugs={};uc.train.applied={};uc.prove.day=0;uc.prove.running=false;uc.prove.requested=false;uc.prove.signed={};
  E.log(uc,'Change requested in production: “'+(text||'')+'” — back to Build; Train and Prove must run again','you','decision');
  emit();
  await E.ray(uc,'I took the live version as the starting point and opened a **draft**. Ray keeps running live on version '+uc.signedVer+' until you sign a new one — this draft has to go through **Train and Prove** again first.');
};

/* ---------- copy a flow into a new use case ---------- */
E.copyFlow=async(uc,opts,tplId)=>{
  const t=D.TEMPLATES.find(x=>x.id===tplId)||E.tplOf(uc);
  const nu=E.newUC(t.id);S.openId=nu.id;
  nu.brief.docs=!!opts.policy;nu.brief.report=uc.report||'predefined';nu.brief.level=uc.level;
  if(opts.policy){nu.policy=clone(uc.policy);nu.hasDocs=uc.hasDocs;nu.docList=clone(E.docs(uc));}
  if(opts.workflow){const wf=clone(E.cur(uc).wf);wf.nodes.forEach(n=>{delete n.chg;delete n.isNew;if(!opts.tuning){delete n.tuned;delete n.tunedT;delete n.tunedVer;delete n.tunedBy;}});
    E.addVersion(nu,wf,'ray','Copied from '+uc.name,[]);}
  if(opts.tuning)nu.train.sugs=clone(uc.train.sugs);
  nu.copiedFrom=uc.name;
  const flags=opts.workflow?clone(E.cur(uc).wf).nodes.filter(n=>/report|OFSI|SEPBLAC|MROS|STRO|goAML|escalation mailbox/i.test(n.t+(n.acts||[]).join(' '))).map(n=>n.t):[];
  nu.checkNodes=flags;
  E.log(nu,'Copied from '+uc.name+': '+Object.keys(opts).filter(k=>opts[k]).join(', '),'you','copy');
  emit();
  await E.ray(nu,'Copied from **'+uc.name+'**'+(flags.length?'. **'+flags.length+' step'+(flags.length>1?'s look':' looks')+' country-specific** — check '+flags.map(f=>'“'+f+'”').join(' and ')+' against '+t.r+'.':'.')+' The brief is ready — press Start when it looks right.');
};

/* Ray speaks its replies when conversation mode is on */
const baseRay=E.ray;
E.ray=async(uc,text,card,opts)=>{const m=await baseRay(uc,text,card,opts);if(text&&E.speak)E.speak(text);return m;};

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
  if(has(s,['skip train','skip the train','skip practice'])&&!uc.done.train){await E.skipStage(uc,'prove'===0?'prove':'train');return;}
  if(has(s,['skip prove','skip the shadow','skip shadow'])&&!uc.done.prove){await E.skipStage(uc,'prove');return;}
  if(has(s,['hand it to dana','hand to dana','give it to dana','dana should'])&&uc.stage==='train'){await E.handTo(uc,'dana');return;}
  if(has(s,['new policy','updated policy','policy changed','update the policy'])){await E.updatePolicy(uc);return;}
  if(has(s,['copy this','copy the flow','duplicate'])){uc.openCopy=Date.now();emit();await E.ray(uc,'Pick what to copy and where it goes.');return;}
  if(E.openCmts(uc).length&&has(s,['run the comments','apply the comments','run comments'])){await E.runComments(uc);return;}
  const conf=[...uc.msgs].reverse().find(m=>m.card&&m.card.type==='confirm'&&!m.card.done);
  if(conf&&/\b(yes|start|go|run)\b/.test(s)){await E.confirm(uc,conf.id,conf.card.what);return;}
  if(uc.operate.live){await E.requestChange(uc,text);return;}
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
    msgs:[{from:'log',text:'Live since 12 Oct',icon:'ti-player-play'},{from:'ray',text:'**Welcome back.** Live for 4 days: **3,912 alerts**, 31% closed by me, 0 missed deadlines. Nothing needs you.'}]});
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
