/* Studio next v3 — "Ray's permissions". One short list of plain lines; each line is green (Ray alone),
   amber (asks you first) or red (never). Everything — talking, correcting an alert, a colleague's
   comment — edits that list. Own state: window.R6. Never touches RSE / R4. */
(function(){
const D=window.RSD;
const R=window.R6={};
const S=R.state={jobs:[],openId:null,v:0};
const subs=[];
R.subscribe=f=>{subs.push(f);return()=>{const i=subs.indexOf(f);if(i>=0)subs.splice(i,1);};};
const emit=R.emit=()=>{S.v++;subs.forEach(f=>f(S.v));};
const uid=()=>Math.random().toString(36).slice(2,9);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const P=w=>D.PEOPLE[w]||D.PEOPLE.you;
R.get=id=>S.jobs.find(j=>j.id===id);

R.MODES={alone:{k:'alone',pill:'Ray does this alone',short:'Alone',ic:'ti-bolt'},
         ask:{k:'ask',pill:'Ray asks you first',short:'Asks you',ic:'ti-hand-stop'},
         never:{k:'never',pill:'Ray never does this',short:'Never',ic:'ti-ban'}};
R.STAGES=[['draft','Draft'],['tested','Tested'],['shadow','Beside analysts'],['live','Live']];
const SO={draft:0,tested:1,shadow:2,ready:2,live:3};
R.stageIdx=j=>SO[j.stage];

const OUTS={close:'Close as false positive',esc:'Escalate to L2',rfi:'Request more information'};
const NAMES=['Summit Capital Bank','Orion Trading LLC','Banco Norte Pacifico','Delta Freight Co','Meridian Holdings',
  'Castle Point Ltd','Aurora Exchange','Harbour & Vine','Nordik Metals','Bay Street Imports'];
let aseq=31870;

/* ---------- jobs & clauses ---------- */
const mkClause=(text,mode,out,ev)=>({id:uid(),text,mode,out:out||'close',state:'on',by:'policy',
  ev:Object.assign({seen:0,agreed:0,wrong:0},ev||{}),changed:0,prev:null,proposal:null,declined:false});
R.mkClause=mkClause;
const newJob=(name,tpl)=>({id:'j'+uid(),name,tpl:tpl||null,clauses:[],version:1,signedVer:0,stage:'draft',
  stats:{agree:0,rounds:0,shadowDay:0,shadowTotal:28,alone:0,seen:0,asked:0},feed:[],trail:[],signs:[],docs:[],
  running:false,handedTo:null,notes:[],ask:null,checklist:null});
R.newJob=newJob;
const log=R.log=(j,text,who)=>{j.trail.unshift({id:uid(),text,who:who||'ray',at:'now'});};
const note=(j,text)=>{j.notes.unshift({id:uid(),text});if(j.notes.length>4)j.notes.pop();};
const bump=(j,why)=>{j.version++;log(j,why,'you');};
R.activeClauses=j=>j.clauses.filter(c=>c.state==='on');
R.proposed=j=>j.clauses.filter(c=>c.state==='proposed');
R.counts=j=>{const a=R.activeClauses(j);return {alone:a.filter(c=>c.mode==='alone').length,ask:a.filter(c=>c.mode==='ask').length,never:a.filter(c=>c.mode==='never').length};};
R.unsigned=j=>j.clauses.filter(c=>c.changed>j.signedVer&&c.state==='on').length;

/* ---------- the earn-it rule: green has to be earned ---------- */
R.canBeAlone=(j,c)=>SO[j.stage]>=1||c.ev.seen>=4;
R.whyNot=(j,c)=>'Ray has not earned this yet — it needs a few examples you agree with, or a test on your closed alerts.';

/* ---------- Ray at work ---------- */
const pickClause=(j)=>{const a=R.activeClauses(j).filter(c=>c.mode!=='never');return a[Math.floor(Math.random()*a.length)];};
R.start=(j)=>{if(j.running)return;j.running=true;
  if(!j.started){j.started=true;
    note(j,'I read your policy and wrote three lines from it. I start by asking you about everything — you turn the ones I get right green.');
    log(j,'Started on '+j.name,'ray');}
  emit();R.tick(j);};
R.stop=(j)=>{j.running=false;clearTimeout(R._t&&R._t[j.id]);emit();};
R._t={};
R.tick=(j)=>{
  clearTimeout(R._t[j.id]);
  const step=()=>{
    if(!j.running)return;
    const wait_=j.feed.filter(f=>f.state==='wait').length;
    // while a person is already holding 3 questions Ray only keeps going with what it may do alone
    const pool=R.activeClauses(j).filter(c=>c.mode!=='never'&&(wait_<3||(j.stage==='live'&&c.mode==='alone')));
    const c=pool[Math.floor(Math.random()*pool.length)];
    if(!c){R._t[j.id]=setTimeout(step,1500);return;}
    const a={id:'A-'+(++aseq),who:NAMES[Math.floor(Math.random()*NAMES.length)],
      amt:'$'+(Math.floor(Math.random()*900)+40)+',000',out:OUTS[c.out]||OUTS.close,
      conf:c.mode==='alone'?90+Math.floor(Math.random()*9):64+Math.floor(Math.random()*22)};
    j.stats.seen++;
    const aloneNow=c.mode==='alone'&&(j.stage==='live');
    const item={id:uid(),alert:a,clauseId:c.id,state:aloneNow?'done':'wait'};
    if(aloneNow){j.stats.alone++;c.ev.seen++;c.ev.agreed++;}
    else j.stats.asked++;
    j.feed.unshift(item);if(j.feed.length>14)j.feed.pop();
    emit();
    R._t[j.id]=setTimeout(step,j.stage==='live'?1100:1800);
  };
  R._t[j.id]=setTimeout(step,700);
};
R.open=(id)=>{S.openId=id;const j=R.get(id);emit();if(j&&!j.stats.noAuto)R.start(j);};
R.close=()=>{const j=R.get(S.openId);if(j)R.stop(j);S.openId=null;emit();};

/* ---------- teaching: agree / correct ---------- */
const clauseOf=(j,f)=>j.clauses.find(c=>c.id===f.clauseId);
R.agree=(j,fid)=>{
  const f=j.feed.find(x=>x.id===fid);if(!f||f.state!=='wait')return;
  f.state='agreed';const c=clauseOf(j,f);
  if(c){c.ev.seen++;c.ev.agreed++;
    if(c.mode==='ask'&&c.ev.agreed>=4&&c.ev.wrong===0&&!c.declined&&!c.proposal){
      c.proposal='alone';log(j,'Ray asked to take over: '+c.text,'ray');}}
  emit();
};
R.correct=(j,fid,mode)=>{
  const f=j.feed.find(x=>x.id===fid);if(!f||f.state!=='wait')return;
  f.state='corrected';f.to=mode;
  const gov=clauseOf(j,f);if(gov){gov.ev.seen++;gov.ev.wrong++;gov.proposal=null;}
  const a=f.alert;
  const c=mkClause(a.out+' — alerts like '+a.who+' (about '+a.amt+')',mode==='alone'&&!R.canBeAlone(j,{ev:{seen:0}})?'ask':mode,
    a.out===OUTS.esc?'esc':a.out===OUTS.rfi?'rfi':'close');
  c.by='you';c.changed=j.version+1;c.ev.seen=1;c.src=a.id;
  j.clauses.push(c);bump(j,'Corrected '+a.id+' → Ray '+R.MODES[c.mode].short.toLowerCase()+' for alerts like it');
  if(mode==='alone'&&c.mode!=='alone')note(j,'Ray has not earned “alone” for this yet, so I set it to ask you first.');
  emit();return c;
};
R.later=(j,fid)=>{const f=j.feed.find(x=>x.id===fid);if(f){j.feed=j.feed.filter(x=>x.id!==fid);j.feed.push(f);emit();}};

/* ---------- editing a line ---------- */
R.setMode=(j,cid,mode)=>{
  const c=j.clauses.find(x=>x.id===cid);if(!c||c.mode===mode)return {ok:true};
  if(mode==='alone'&&!R.canBeAlone(j,c))return {ok:false,msg:R.whyNot(j,c)};
  c.prev=c.mode;c.mode=mode;c.changed=j.version+1;c.proposal=null;
  bump(j,'Changed to “'+R.MODES[mode].pill.toLowerCase()+'”: '+c.text);emit();return {ok:true};
};
R.editText=(j,cid,text)=>{const c=j.clauses.find(x=>x.id===cid);if(!c||!text.trim())return;
  c.prevText=c.text;c.text=text.trim();c.changed=j.version+1;bump(j,'Edited a line: “'+c.prevText+'” → “'+c.text+'”');emit();};
R.remove=(j,cid)=>{const c=j.clauses.find(x=>x.id===cid);if(!c)return;c.state='off';bump(j,'Removed: '+c.text);emit();};
R.promo=(j,cid,yes)=>{const c=j.clauses.find(x=>x.id===cid);if(!c)return;
  if(yes){c.prev=c.mode;c.mode='alone';c.changed=j.version+1;bump(j,'Let Ray take over: '+c.text);}
  else{c.declined=true;log(j,'Declined to let Ray take over: '+c.text,'you');}
  c.proposal=null;emit();};
R.decideProposal=(j,cid,yes)=>{const c=j.clauses.find(x=>x.id===cid);if(!c)return;
  if(yes){c.state='on';c.changed=j.version+1;bump(j,'Accepted '+(c.by==='dana'?'Dana’s':'Ray’s')+' proposed line: '+c.text);}
  else{c.state='off';log(j,'Declined proposed line: '+c.text,'you');}
  emit();};

/* ---------- test on closed alerts ---------- */
R.replay=async(j)=>{
  if(j.testing)return;j.testing={cnt:0,n:1000,agree:0};j.stats.rounds++;emit();
  const target=j.stats.rounds===1?87:j.stats.agree<90?91:93;
  for(let i=1;i<=12;i++){await wait(170);j.testing.cnt=Math.round(1000*i/12);j.testing.agree=Math.round(target-6+6*i/12);emit();}
  j.stats.agree=target;
  R.activeClauses(j).forEach(c=>{const n=60+Math.floor(Math.random()*150);c.ev.seen+=n;c.ev.agreed+=Math.round(n*target/100);c.ev.wrong+=n-Math.round(n*target/100);});
  log(j,'Tested on 1,000 closed alerts · '+target+'% agreement','ray');
  j.testing=null;
  if(target<90){
    const add=[['Re-screen the counterparty after enrichment, before closing anything','ask','close','Ray'],
               ['Treat a nationality gap of more than 5 years as a different person','ask','close','Ray']];
    add.forEach(a=>{if(!j.clauses.some(c=>c.text===a[0])){const c=mkClause(a[0],a[1],a[2]);c.state='proposed';c.by='ray';c.why='4 alerts your analysts closed would have been decided differently';j.clauses.push(c);}});
    note(j,'**'+target+'% agreement** — under your 90% bar. I found two lines that would close the gap; they are proposed in the list for you to accept or decline.');
  }else{
    j.stage='tested';
    R.activeClauses(j).filter(c=>c.mode==='ask'&&!c.declined&&!c.proposal&&c.ev.wrong<=c.ev.seen*0.1).slice(0,2).forEach(c=>{c.proposal='alone';});
    note(j,'**'+target+'% agreement** across 1,000 alerts your analysts already closed. That clears the bar — and a couple of lines have earned green.');
  }
  emit();
};

/* ---------- beside the analysts, then live ---------- */
R.startShadow=async(j)=>{
  j.stage='shadow';j.stats.shadowDay=1;
  log(j,'Started working beside your analysts (no effect on alerts)','you');
  note(j,'Four weeks beside your analysts on live alerts. I decide, they decide, and nothing I do takes effect.');emit();
  while(j.stage==='shadow'&&j.stats.shadowDay<j.stats.shadowTotal){
    await wait(2400);if(j.stage!=='shadow')return;j.stats.shadowDay++;emit();}
  if(j.stage==='shadow')R.shadowDone(j);
};
R.shadowDone=(j)=>{j.stats.shadowDay=j.stats.shadowTotal;j.stage='ready';j.stats.agree=Math.max(j.stats.agree,93);
  log(j,'Shadow complete · 93% agreement','ray');
  note(j,'**Four weeks, 4,118 live alerts, 93% agreement, every escalation caught.** Two senior signatures and yours, and I start on the green lines.');emit();};
R.fastForward=(j)=>{if(j.stage==='shadow')R.shadowDone(j);};
R.CHECK=(D.CHECKLIST||[]).map(c=>({t:c.t,ray:!!c.ray,on:!!c.ray}));
R.openSign=(j)=>{j.checklist=R.CHECK.map(c=>Object.assign({},c));emit();};
R.toggleChk=(j,i)=>{if(j.checklist&&!j.checklist[i].ray){j.checklist[i].on=!j.checklist[i].on;emit();}};
R.sign=(j)=>{
  if(!j.checklist||j.checklist.some(c=>!c.on))return false;
  j.signs=[{who:'mlro',at:'now'},{who:'fcc',at:'now'},{who:'you',at:'now'}];
  j.signedVer=j.version;j.stage='live';j.checklist=null;
  // anything waiting on a line that is now green is settled by Ray from here on
  j.feed.forEach(f=>{const c=j.clauses.find(x=>x.id===f.clauseId);
    if(f.state==='wait'&&c&&c.mode==='alone'){f.state='done';j.stats.alone++;c.ev.seen++;c.ev.agreed++;}});
  log(j,'Signed by the MLRO, the Head of FCC and you · Ray is live','you');
  note(j,'**Live.** I act alone on the green lines. Everything amber still comes to you, and the red lines I never touch.');emit();return true;};
R.rollback=(j)=>{j.stage='ready';log(j,'Rolled back — Ray no longer acts alone','you');
  note(j,'**Rolled back.** I am no longer acting alone. Nothing I did is undone, and it is all in the audit trail.');emit();};

/* ---------- people ---------- */
R.handTo=(j,who,msg)=>{j.handedTo=who;log(j,'Handed the coaching to '+P(who).n,'you');
  note(j,'**'+P(who).n+' is notified** and sees this same list. '+(msg?'Your note: “'+msg+'”. ':'')+'You can nudge or take it back any time.');emit();};
R.nudge=(j)=>{log(j,'Nudged '+(j.handedTo?P(j.handedTo).n:'them'),'you');note(j,'Nudged just now.');emit();};
R.takeBack=(j)=>{j.handedTo=null;log(j,'Took the coaching back','you');emit();};
R.clone=(j)=>{const n=newJob(j.name+' · copy',j.tpl);
  n.clauses=j.clauses.filter(c=>c.state==='on').map(c=>Object.assign({},c,{id:uid(),changed:1,ev:{seen:0,agreed:0,wrong:0},proposal:null}));
  n.docs=j.docs.slice();S.jobs.unshift(n);log(n,'Copied from '+j.name,'you');
  note(n,'Copied **'+n.clauses.length+' lines** from '+j.name+'. Change what is different here; the original is untouched.');
  S.openId=n.id;emit();R.start(n);return n;};
R.addDocs=(j,files)=>{files.forEach(f=>j.docs.push(Object.assign({id:uid()},f)));log(j,'Added '+files.length+' document(s)','you');
  note(j,'Read '+files.length+' new document'+(files.length>1?'s':'')+'. Anything that changes my lines will show up as a proposed line, never a silent edit.');emit();};
R.delDoc=(j,id)=>{j.docs=j.docs.filter(d=>d.id!==id);log(j,'Removed a document','you');emit();};

/* ---------- saying things ---------- */
R.readyLine=(j)=>{
  if(j.stage==='live')return '**Working alone on the green lines.** '+j.stats.alone+' decided without you so far.';
  if(j.stage==='ready')return '**Ready.** Four weeks beside your analysts at 93%, every escalation caught. It needs your signature and two senior ones.';
  if(j.stage==='shadow')return '**Not yet — day '+j.stats.shadowDay+' of '+j.stats.shadowTotal+'** beside your analysts. Nothing I decide has any effect yet.';
  if(j.stage==='tested')return '**Ready to run beside your analysts.** '+j.stats.agree+'% agreement on 1,000 of your own closed alerts.';
  if(j.stats.rounds)return '**Not yet — '+j.stats.agree+'% against your 90% bar.** The lines I proposed would close the gap.';
  return '**Not proven yet.** I have worked '+j.stats.seen+' alerts in front of you, but I have not been tested against your analysts.';
};
R.whereLine=(j)=>{const c=R.counts(j);
  return 'Ray may do **'+c.alone+'** thing'+(c.alone===1?'':'s')+' alone, asks you about **'+c.ask+'**, and never does **'+c.never+'**. '+
  ({draft:'It is a draft — nothing has been tested yet.',tested:'It is tested and waiting to run beside your analysts.',
    shadow:'It is running beside your analysts, day '+j.stats.shadowDay+' of '+j.stats.shadowTotal+'.',ready:'It is ready — it needs signatures to go live.',live:'It is live.'})[j.stage];};
const has=(s,a)=>a.some(w=>s.includes(w));
R.say=async(j,text)=>{
  const s=(text||'').toLowerCase().trim();if(!s)return;
  if(has(s,['ready','go live','good to go'])){j.ask={q:'Is Ray ready?',a:R.readyLine(j)};emit();return;}
  if(has(s,['where am','where are','status','how far'])){j.ask={q:'Where am I?',a:R.whereLine(j)};emit();return;}
  if(has(s,['test','replay','closed alerts'])){R.replay(j);return;}
  if(has(s,['roll back','rollback','less authority','take back'])&&j.stage==='live'){R.rollback(j);return;}
  if(has(s,['undo'])){const c=[...j.clauses].reverse().find(x=>x.by==='you'&&x.state==='on');
    if(c){c.state='off';bump(j,'Undid: '+c.text);note(j,'Undone: **'+c.text+'**.');emit();}return;}
  /* otherwise: it is a new line */
  const mode=has(s,['never','do not','don’t',"don't"])?'never':has(s,['on your own','by yourself','alone','automatically'])?'alone':'ask';
  const clean=text.replace(/^(please\s+)?(you\s+)?(should\s+)?/i,'').replace(/^(never|do not|don['’]t)\s+/i,'').replace(/\b(on your own|by yourself|alone|automatically)\b/ig,'').replace(/\s+/g,' ').trim();
  const c=mkClause(clean.charAt(0).toUpperCase()+clean.slice(1),'ask','esc');
  c.by='you';c.changed=j.version+1;
  let msg;
  if(mode==='alone'&&!R.canBeAlone(j,c)){msg='Added — but Ray has not earned “alone” yet, so it asks you first.';}
  else{c.mode=mode;msg='Added as “'+R.MODES[mode].pill.toLowerCase()+'”.';}
  j.clauses.push(c);bump(j,'Added a line: '+c.text);note(j,msg);emit();
};

/* ---------- hire ---------- */
R.hire=(txt)=>{
  const s=(txt||'').toLowerCase();let t=null,best=0;
  D.TEMPLATES.forEach(x=>{let sc=0;(x.kw||[]).forEach(k=>{if(s.includes(k))sc+=2;});
    x.t.toLowerCase().split(/[^a-z]+/).forEach(w=>{if(w.length>3&&s.includes(w))sc++;});if(sc>best){best=sc;t=x;}});
  return R.hireTpl(t?t.id:null,t?t.t:(txt||'New job').slice(0,46));};
R.hireTpl=(id,name)=>{
  const t=id?D.TEMPLATES.find(x=>x.id===id):null;
  const j=newJob(name||(t?t.t:'New job'),id);
  j.clauses=[mkClause('Close repeat low-value transfers between known parties','ask','close'),
             mkClause('Escalate anything touching a high-risk jurisdiction','ask','esc'),
             mkClause('File a SAR — Ray stops at L2 and a person decides','never','esc')];
  j.clauses.forEach(c=>{c.changed=1;});
  S.jobs.unshift(j);S.openId=j.id;emit();R.start(j);return j;};

/* ---------- seeds ---------- */
R.seed=()=>{
  if(S.jobs.length)return;
  const mk=(t,m,o,ev,by)=>{const c=mkClause(t,m,o,ev);c.by=by||'you';return c;};
  // live
  const live=newJob('Card Fraud Issuing US','card-us');live.stage='live';live.version=4;live.signedVer=4;live.started=true;
  live.stats={agree:94,rounds:2,shadowDay:28,shadowTotal:28,alone:1204,seen:3912,asked:212};
  live.clauses=[mk('Close duplicate alerts raised on the same transaction within 24 hours','alone','close',{seen:640,agreed:631,wrong:9}),
    mk('Close card-present transactions under $500 at a known merchant','alone','close',{seen:412,agreed:405,wrong:7}),
    mk('Escalate any card-present transaction in a sanctioned country','ask','esc',{seen:96,agreed:94,wrong:2}),
    mk('Ask before closing anything over $50,000','ask','esc',{seen:58,agreed:58,wrong:0}),
    mk('File a SAR — Ray stops at L2 and a person decides','never','esc',{},'policy')];
  live.clauses.forEach(c=>{c.changed=1;});
  live.clauses[2].proposal='alone';
  const dana=mkClause('Anything over $100,000 goes to a supervisor, not L2','ask','esc');dana.state='proposed';dana.by='dana';dana.why='Dana Levi commented on your large-transfer line';
  live.clauses.push(dana);
  live.signs=[{who:'mlro',at:'12 Oct'},{who:'fcc',at:'12 Oct'},{who:'you',at:'12 Oct'}];
  ['Live since 12 Oct · acting alone on the green lines','Signed by the MLRO, the Head of FCC and you','Shadow complete · 93% agreement'].forEach(t=>log(live,t,'ray'));
  note(live,'**Welcome back.** Four days live: '+live.stats.seen.toLocaleString()+' alerts, '+live.stats.alone.toLocaleString()+' closed without you, nothing past a deadline.');
  // mid-shadow
  const sh=newJob('Correspondent Banking Spain','cor-es');sh.stage='shadow';sh.version=3;sh.signedVer=0;sh.started=true;
  sh.stats={agree:91,rounds:2,shadowDay:9,shadowTotal:28,alone:0,seen:1284,asked:96};
  sh.clauses=[mk('Close nested-account alerts where the respondent bank is on the approved list','ask','close',{seen:210,agreed:196,wrong:14}),
    mk('Escalate any respondent bank in a high-risk jurisdiction','ask','esc',{seen:132,agreed:127,wrong:5}),
    mk('File a SAR — Ray stops at L2 and a person decides','never','esc',{},'policy')];
  sh.clauses.forEach(c=>{c.changed=1;});
  log(sh,'Shadow run started','you');note(sh,'Day 9 of 28 beside your analysts: 1,284 alerts so far, 91% agreement.');
  // draft
  const dr=newJob('Transaction Screening UK','ts-uk');
  dr.clauses=[mkClause('Close repeat low-value transfers between known parties','ask','close'),
    mkClause('Escalate anything touching a high-risk jurisdiction','ask','esc'),
    mkClause('File a SAR — Ray stops at L2 and a person decides','never','esc')];
  dr.clauses.forEach(c=>{c.changed=1;});
  S.jobs.push(live,sh,dr);emit();
};
})();
