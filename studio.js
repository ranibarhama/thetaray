/* Ray Studio v3 — UI part 2: voice, composer, Today, workspace shell (text/babel) */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,E=window.RSE,U=window.RSU;

const SCRIPT={home:'Set up UK transaction screening on autopilot with our AML policy',brief:'Use the template policy and start',
  'b.refine':'Change the SLA to 24 hours for high-risk alerts','t.sugs':'Accept all','t.gate':'Approve and sign','p.run':'Skip to the end','o.live':'Where are we?'};

/* Ray can speak back; the user can keep the mic open for a conversation */
const SPEAK={on:false};
function say(text){
  if(!SPEAK.on||!window.speechSynthesis)return;
  try{const u=new SpeechSynthesisUtterance(String(text).replace(/\*\*/g,'').slice(0,240));u.rate=1.05;u.pitch=1;window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}catch(e){}
}
window.RSE.speak=say;

/* real speech recognition, with a scripted fallback when the mic or API is unavailable */
function useVoice(onFinal,scriptFor){
  const [st,setSt]=useState({on:false,interim:'',demo:false});
  const rec=useRef(null),tm=useRef(null),fin=useRef(''),handled=useRef(false);
  const finish=t=>{setSt({on:false,interim:'',demo:false});if(t)onFinal(t,'voice');};
  const demo=()=>{const phrase=scriptFor();let i=0;setSt({on:true,interim:'',demo:true});clearInterval(tm.current);
    tm.current=setInterval(()=>{i+=2;setSt(s=>Object.assign({},s,{interim:phrase.slice(0,i)}));if(i>=phrase.length){clearInterval(tm.current);tm.current=setTimeout(()=>finish(phrase),550);}},45);};
  const start=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){demo();return;}
    try{const r=new SR();r.lang='en-US';r.interimResults=true;r.continuous=false;fin.current='';handled.current=false;
      r.onresult=e=>{let f='',it='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)f+=t;else it+=t;}if(f)fin.current+=f;setSt(s=>Object.assign({},s,{interim:fin.current+it}));};
      r.onerror=()=>{if(handled.current)return;handled.current=true;rec.current=null;try{r.abort();}catch(x){}if(!fin.current)demo();else finish(fin.current.trim());};
      r.onend=()=>{if(handled.current)return;handled.current=true;rec.current=null;const t=fin.current.trim();if(t)finish(t);else demo();};
      rec.current=r;r.start();setSt({on:true,interim:'',demo:false});}catch(x){demo();}};
  const stop=()=>{if(st.demo){clearInterval(tm.current);clearTimeout(tm.current);finish(st.interim);return;}if(rec.current){try{rec.current.stop();}catch(x){}}};
  useEffect(()=>()=>{clearInterval(tm.current);clearTimeout(tm.current);if(rec.current)try{rec.current.abort();}catch(x){}},[]);
  return {st,start,stop};
}

/* one button: says "Talk", morphs into send when you type */
let VOICE_USED=false;
function Composer({onSend,placeholder,scriptKey,big,prefill,autoFocus,hint}){
  const [txt,setTxt]=useState('');const ta=useRef(null);const [,bump]=useState(0);
  const [conv,setConv]=useState(SPEAK.on);
  const voice=useVoice((t,via)=>{VOICE_USED=true;bump(x=>x+1);onSend(t,via);if(SPEAK.on)setTimeout(()=>{try{voiceRef.current&&voiceRef.current.start();}catch(e){}},2600);},()=>SCRIPT[scriptKey()]||SCRIPT['o.live']);
  const voiceRef=useRef(null);voiceRef.current=voice;
  useEffect(()=>{if(prefill&&prefill.text){setTxt(prefill.text);setTimeout(()=>{if(ta.current){ta.current.focus();ta.current.setSelectionRange(prefill.text.length,prefill.text.length);}},0);}},[prefill]);
  useEffect(()=>{if(ta.current){ta.current.style.height='auto';ta.current.style.height=Math.min(130,ta.current.scrollHeight)+'px';}},[txt]);
  const send=()=>{const t=txt.trim();if(!t)return;setTxt('');onSend(t,'text');};
  const typing=!!txt.trim(),on=voice.st.on;
  return <div className="s3-cw">
    <div className={'s3-cmp'+(big?' big':'')+(on?' hearing':'')}>
      {on
        ?<div className="s3-voice"><div className="s3-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}</div>
          <div className="vt"><div className="vl">{voice.st.demo?'Voice demo · microphone unavailable here':'Listening — just say it'}</div>{voice.st.interim||<em>“Change the SLA to 24 hours for high-risk alerts”…</em>}</div></div>
        :<textarea ref={ta} rows={1} value={txt} autoFocus={autoFocus} placeholder={placeholder} onChange={e=>setTxt(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}/>}
      <button className={'s3-talk'+(on?' on':typing?' send':'')} title={on?'Stop and send':typing?'Send':'Tap and speak to Ray'}
        onClick={()=>on?voice.stop():typing?send():voice.start()}>
        {on?<><i className="ti ti-player-stop-filled"></i><span>Stop</span></>:typing?<i className="ti ti-arrow-up"></i>:<><i className="ti ti-microphone"></i><span>Talk</span></>}</button>
    </div>
    {(on||conv)&&<div className="s3-hint" style={{justifyContent:'space-between'}}>
      <button className="s3-ev" onClick={()=>{const v=!conv;setConv(v);SPEAK.on=v;if(!v&&window.speechSynthesis)window.speechSynthesis.cancel();}}>
        <i className={'ti '+(conv?'ti-volume':'ti-volume-off')}></i>{conv?'Conversation mode on — Ray speaks and keeps listening':'Turn on conversation mode'}</button>
      <span></span></div>}
    {hint&&!VOICE_USED&&!typing&&!on&&<div className="s3-hint"><span>Tap <b>Talk</b> and say it out loud — Ray understands plain language</span><i className="ti ti-corner-right-up"></i></div>}
  </div>;
}

function Browser({onPick,onClose}){
  const [cat,setCat]=useState('all');const [q,setQ]=useState('');const [det,setDet]=useState(null);
  const list=D.TEMPLATES.filter(t=>(cat==='all'||t.cat===cat)&&(!q||(t.t+t.d+t.r+t.reg).toLowerCase().includes(q.toLowerCase())));
  return <div className="s3-scrim" onClick={onClose}><div className="s3-modal" onClick={e=>e.stopPropagation()}>
    <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{flex:1}}><h3>Choose a job for Ray</h3><div style={{fontSize:13.5,color:'var(--ink-2)',marginTop:3}}>Each is a proven ThetaRay setup — you make it yours in the brief.</div></div><button className="s3-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16,alignItems:'center'}}>
      <div className="s3-search"><i className="ti ti-search" style={{color:'var(--ink-3)'}}></i><input value={q} autoFocus onChange={e=>setQ(e.target.value)} placeholder="Search by name, country or regulator"/></div>
      <div className="s3-seg"><button className={cat==='all'?'on':''} onClick={()=>setCat('all')}>All</button>{Object.keys(D.CATS).map(k=><button key={k} className={cat===k?'on':''} onClick={()=>setCat(k)}>{D.CATS[k].n}</button>)}</div></div>
    <div className="s3-list" style={{marginTop:14}}>{list.map(t=>{const c=D.CATS[t.cat];const open=det===t.id;const wf=open?D.buildWorkflow(t.id):null;
      return <div key={t.id}><div className="s3-row" onClick={()=>setDet(open?null:t.id)}>
        <span className="ic" style={{background:c.c+'1f',color:c.c}}><i className={'ti '+c.ic}></i></span><div className="main"><b>{t.t}</b><span>{t.d}</span></div>
        <div className="meta"><span className="hm">{t.r}</span><i className={'ti chev '+(open?'ti-chevron-up':'ti-chevron-down')}></i></div></div>
      {open&&<div className="s3-tdet"><div className="row"><b>{wf.nodes.length}</b> steps · <b>{wf.nodes.filter(n=>n.ai).length}</b> decided by Ray · regulator: <b>{t.reg}</b></div>
        <ol>{wf.nodes.slice(0,5).map(n=><li key={n.id}>{n.t}<span> · {n.role}</span></li>)}{wf.nodes.length>5&&<li style={{color:'var(--ink-3)'}}>+ {wf.nodes.length-5} more</li>}</ol>
        <button className="s3-b pri sm" onClick={()=>onPick(t.id)}><i className="ti ti-check"></i>Use this job</button></div>}</div>;})}</div>
  </div></div>;
}

const Mini4=({uc})=>{const si=D.STAGES.findIndex(s=>s.k===uc.stage);return <span className="s3-mini4">{D.STAGES.map((s,i)=><i key={s.k} className={i<si||(uc.operate.live&&i===3)?'done':i===si?'cur':''} style={{'--c':s.c}}></i>)}</span>;};
function statusLine(uc){
  const auth=D.AUTHORITY.find(a=>a.id===uc.operate.auth).t;
  if(uc.operate.live)return 'Live · '+auth.toLowerCase();
  if(uc.step==='brief')return 'Brief drafted · not started';
  if(uc.prove.running)return 'Proving on live alerts · day '+uc.prove.day+' of '+uc.prove.total;
  if(uc.next.who==='dana')return 'Waiting on Dana · '+uc.next.what.toLowerCase();
  if(uc.gate)return 'Ready for your signature';
  const st=D.STAGES.find(s=>s.k===uc.stage);return st.t+' · '+uc.next.what.toLowerCase();
}
const WHYNOW={nudge:'Nothing has moved for a day',comment:'A colleague is blocked on your answer',sigs:'Everything passed — only signatures left',open:'Ray is waiting on you'};

/* one decision at a time, in a collapsible card pinned top-left — reachable with no scrolling */
function Needs({needs,act,onOpen}){
  const [i,setI]=useState(0);const [fly,setFly]=useState(null);const [open,setOpen]=useState(true);
  const n=needs.length,idx=Math.min(i,Math.max(0,n-1));
  useEffect(()=>{const f=e=>{if(!open)return;if(e.key==='ArrowRight')setI(x=>Math.min(n-1,x+1));if(e.key==='ArrowLeft')setI(x=>Math.max(0,x-1));};
    window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f);},[n,open]);
  const u=n?needs[idx]:null,a=u?(u.need.acts||[['Open','open']]):[];
  const run=k=>{if(k==='open'){onOpen(u);return;}setFly(u.id);setTimeout(()=>{setFly(null);act(u,k);setI(x=>Math.max(0,Math.min(x,needs.length-2)));},260);};
  return <div className={'s3-needs'+(open?'':' shut')}>
    <button className="s3-nh" onClick={()=>setOpen(o=>!o)} title={open?'Collapse':'Show what needs you'}>
      <span className={'ic'+(n?'':' ok')}><i className={'ti '+(n?'ti-bell-ringing':'ti-circle-check')}></i></span>
      <b>Needs you</b>{n>0&&<span className="cnt">{n}</span>}<span className="sp"></span>
      <i className={'ti '+(open?'ti-chevron-up':'ti-chevron-down')}></i></button>
    {open&&<div className="s3-nb">
      {!n?<div className="s3-nclear"><b>You’re all clear</b><span>Ray drops a card here the moment a decision or a signature needs you.</span></div>
       :<>
        <div className="s3-stack">
          {needs.slice(idx+1,idx+3).map((x,k)=><div key={x.id} className="s3-peekcard" style={{'--n':k+1}}></div>)}
          <div className={'s3-card'+(fly?' fly':'')} key={u.id}>
            <div className="s3-chead"><span className={'s3-cic '+u.need.kind}><i className={'ti '+u.need.ic}></i></span>
              <div style={{flex:1,minWidth:0}}><span className="s3-why">{WHYNOW[a[0][1]]||'Needs a person'}</span><b>{u.need.t}</b></div></div>
            <div className="s3-cbody">{u.need.d}</div>
            <div className="s3-cfoot">{a.map((x,k)=><button key={x[1]} className={'s3-b sm'+(k===0?' pri':'')} onClick={()=>run(x[1])}>{x[0]}</button>)}</div>
            <div className="s3-uc"><Mini4 uc={u}/><span>{u.name}</span></div>
          </div>
        </div>
        {n>1&&<div className="s3-nav"><button className="s3-ib" disabled={idx===0} onClick={()=>setI(idx-1)}><i className="ti ti-chevron-left"></i></button>
          <div className="s3-dots">{needs.map((x,k)=><i key={x.id} className={k===idx?'on':''} onClick={()=>setI(k)}></i>)}</div>
          <button className="s3-ib" disabled={idx>=n-1} onClick={()=>setI(idx+1)}><i className="ti ti-chevron-right"></i></button>
          <span className="s3-count">{idx+1} of {n}</span></div>}
       </>}
    </div>}
  </div>;
}
/* every investigation lives in one drawer, closed by default */
function Drawer({onClose,onOpen,onNew}){
  const S=E.state;const [q,setQ]=useState('');const [filt,setFilt]=useState('all');
  const list=S.ucs.filter(u=>(filt==='all'||u.stage===filt)&&(!q||(u.name+statusLine(u)).toLowerCase().includes(q.toLowerCase())));
  return <><div className="s3-dwbg" onClick={onClose}></div><div className="s3-dw">
    <div className="s3-dwh"><div className="grip"></div>
      <div className="row"><b>Your investigators</b><span className="s3-pill">{S.ucs.length}</span><span className="sp"></span><button className="s3-ib" onClick={onClose}><i className="ti ti-chevron-down"></i></button></div>
      <div className="row"><div className="s3-search"><i className="ti ti-search" style={{color:'var(--ink-3)'}}></i><input value={q} autoFocus onChange={e=>setQ(e.target.value)} placeholder="Search"/></div>
        <div className="s3-seg"><button className={filt==='all'?'on':''} onClick={()=>setFilt('all')}>All</button>{D.STAGES.map(x=><button key={x.k} className={filt===x.k?'on':''} onClick={()=>setFilt(x.k)}>{x.t}</button>)}</div></div></div>
    <div className="s3-dwb">
      <div className="s3-row s3-new" onClick={onNew}><span className="ic"><i className="ti ti-plus"></i></span>
        <div className="main"><b>Teach Ray a new job</b><span>Describe it, or start from one of {D.TEMPLATES.length} ready-made jobs</span></div><i className="ti ti-chevron-right chev"></i></div>
      {list.map(u=>{const t=E.tplOf(u)||{cat:'oth'},c=D.CATS[t.cat];return <div key={u.id} className="s3-row" onClick={()=>onOpen(u)}>
      <span className="ic" style={{background:c.c+'1f',color:c.c}}><i className={'ti '+c.ic}></i></span>
      <div className="main"><b>{u.name}</b><span>{statusLine(u)}</span></div>
      <div className="meta">{u.need&&<span className="s3-pill warn hm">Needs you</span>}{u.mode==='auto'&&<span className="s3-pill ai hm"><i className="ti ti-sparkles"></i>Autopilot</span>}<Mini4 uc={u}/><span className="hm">{u.updated}</span><i className="ti ti-chevron-right chev"></i></div></div>;})}
      {!list.length&&<div className="s3-row" style={{cursor:'default',color:'var(--ink-3)'}}>Nothing matches.</div>}</div>
  </div></>;
}

function Today({onBrowse}){
  const S=E.state;const [toast,setToast]=useState(null);const [drawer,setDrawer]=useState(false);
  const needs=S.ucs.filter(u=>u.need);
  const flash=t=>{setToast(t);setTimeout(()=>setToast(null),2600);};
  const act=(u,k)=>{if(k==='take'){E.takeOver(u);E.open(u.id);return;}
    if(k==='nudge'){E.nudge(u);flash('Nudge sent to Dana');}
    if(k==='comment'){E.applyComment3(u,true);flash('Dana’s change applied to '+u.name);}
    if(k==='sigs'){E.requestSigs(u);u.need=null;E.emit();flash('Signatures requested — MLRO and Head of FCC');}};
  const sugs=[['ti-shield-check','UK transaction screening, on autopilot, with our AML policy'],['ti-route','Retail transaction monitoring, step by step'],['ti-flask','The real-world screening example']];
  const live=S.ucs.filter(u=>u.operate.live).length,working=S.ucs.filter(u=>!u.operate.live&&(u.prove.running||u.next.who==='ray')).length;
  return <>
    <div className="s3-home">
      <Needs needs={needs} act={act} onOpen={u=>E.open(u.id)}/>
      <div className="s3-hero"><div className="s3-hero-in">
        <div className="s3-orb lg">✦</div>
        <h1>What should Ray learn to investigate?</h1>
        <p>Describe it once. Ray writes the playbook, practices on your closed cases and proves itself — you read, decide and sign.</p>
        <Composer big autoFocus hint placeholder="Describe it in your own words…" scriptKey={()=>'home'} onSend={(t,via)=>E.createFromPrompt(t,via)}/>
        <div className="s3-sugs">{sugs.map(x=><button key={x[1]} className="s3-chip" onClick={()=>E.createFromPrompt(x[1],'text')}><i className={'ti '+x[0]}></i>{x[1]}</button>)}
          <button className="s3-chip" onClick={()=>onBrowse(id=>E.startFromTpl(id))}><i className="ti ti-layout-grid"></i>All {D.TEMPLATES.length} jobs</button></div>
      </div></div>
      <button className="s3-dockbar" onClick={()=>setDrawer(true)}>
        <span className="ic"><i className="ti ti-stack-2"></i></span>
        <b>Your investigators</b><span className="s3-pill">{S.ucs.length}</span>
        <span className="dots">{S.ucs.slice(0,6).map(u=>{const st=D.STAGES.find(x=>x.k===u.stage);return <i key={u.id} title={u.name+' · '+st.t} style={{background:u.operate.live?'var(--ok)':st.c}}></i>;})}</span>
        <span className="sp"></span><span className="sum">{live} live · {working} working · {S.ucs.length-live-working} waiting</span><i className="ti ti-chevron-up"></i></button>
    </div>
    {drawer&&<Drawer onClose={()=>setDrawer(false)} onOpen={u=>{setDrawer(false);E.open(u.id);}} onNew={()=>{setDrawer(false);E.startBlank();}}/>}
    {toast&&<div className="s3-toast"><i className="ti ti-circle-check"></i>{toast}</div>}
  </>;
}
/* the ONE line that says where you are and what's next */
function readiness(uc,goStep,openSheet){
  const last=t=>[...uc.msgs].reverse().find(m=>m.card&&m.card.type===t);
  if(uc.step==='brief')return {k:'you',ic:'ti-file-description',t:<><b>Check the brief</b> · then press Start</>,btn:uc.tpl?'Start':null,act:()=>E.startBrief(uc)};
  if(uc.step==='building'||(!uc.versions.length))return {k:'ray',ic:'ti-loader-2',t:<><b>Ray is writing your playbook</b> · reading your policy first</>};
  if(uc.run&&uc.run.kind==='practice'){const r=last('replay');return {k:'ray',ic:'ti-loader-2',t:<><b>Practicing on closed alerts</b>{r?<> · {r.card.cnt.toLocaleString()} of {r.card.n.toLocaleString()}</>:null}</>};}
  if(uc.prove.running)return {k:'ray',ic:'ti-eye-check',t:<><b>Shadow run · day {uc.prove.day} of {uc.prove.total}</b> · 91% agreement · no effect on alerts</>,btn:'Skip to end (demo)',act:()=>E.skipShadow(uc),sec:true};
  const oc=E.openCmts(uc).length;
  if(oc)return {k:'you',ic:'ti-message-2',t:<><b>{oc} comment{oc>1?'s':''} waiting</b> · Ray applies {oc>1?'them':'it'} in one new version</>,btn:'Run the comments',act:()=>E.runComments(uc)};
  if(uc.stale&&uc.stage==='build')return {k:'wait',ic:'ti-alert-triangle',t:<><b>Draft changed after go-live</b> · it must pass Train and Prove again</>,btn:'Review & sign',act:openSheet};
  if(uc.comment)return {k:'you',ic:'ti-message-circle',t:<><b>Dana suggested a change</b> · it’s marked in your playbook</>,btn:'Show me',act:()=>goStep(uc.comment.node)};
  const pend=uc.train.rounds.length?E.tuneSet(uc).filter(x=>!uc.train.sugs[x.id]):[];
  if(pend.length){if(uc.next.who==='dana')return {k:'wait',ic:'ti-hourglass',t:<><b>Waiting on Dana</b> · {pend.length} suggestions to decide</>,btn:'Decide myself',act:()=>E.takeOver(uc)};
    if(uc.level==='sign')return {k:'you',ic:'ti-hand-stop',t:<><b>{pend.length} rule{pend.length>1?'s':''} held for you</b> · Ray did everything else</>,btn:'Show me',act:()=>goStep(pend[0].node)};
    return {k:'you',ic:'ti-sparkles',t:<><b>{pend.length} suggestion{pend.length>1?'s':''} to decide</b> · marked in your playbook</>,btn:'Show me',act:()=>goStep(pend[0].node)};}
  const conf=[...uc.msgs].reverse().find(m=>m.card&&m.card.type==='confirm'&&!m.card.done);
  if(conf)return {k:'you',ic:'ti-player-play',t:<><b>Your call</b> · {conf.card.label.toLowerCase()}?</>,btn:conf.card.label,act:()=>E.confirm(uc,conf.id,conf.card.what)};
  const g=uc.gate;
  if(g){const r=uc.train.rounds;
    if(g.what==='build')return {k:'you',ic:'ti-signature',t:<><b>Playbook v{E.cur(uc).n} is ready</b> · change it by talking, or sign off Build</>,btn:'Review & sign',act:openSheet};
    if(g.what==='train'||g.what==='buildtrain')return {k:'you',ic:'ti-signature',t:<><b>Practice passed · {r[r.length-1].agree}% agreement</b> · sign off {g.what==='buildtrain'?'Build + Train':'Train'}</>,btn:'Review & sign',act:openSheet};
    if(g.what==='prove')return uc.prove.requested?{k:'wait',ic:'ti-hourglass',t:<><b>Waiting for signatures</b> · MLRO and Head of FCC</>,btn:'View',act:openSheet,sec:true}:{k:'you',ic:'ti-signature',t:<><b>Shadow run passed · 3 of 3 targets</b> · two signatures needed</>,btn:'Review & request',act:openSheet};
    if(g.what==='live')return {k:'you',ic:'ti-player-play',t:<><b>Ready to go live</b> · 2 checks and your signature</>,btn:'Review & go live',act:openSheet};}
  if(uc.operate.live)return {k:'ok',ic:'ti-circle-check',t:<><b>Live</b> · {D.AUTHORITY.find(a=>a.id===uc.operate.auth).t.toLowerCase()} · 3,912 alerts this week</>,btn:'Roll back',act:()=>E.rollback3(uc),sec:true};
  return {k:'ray',ic:'ti-sparkles',t:<><b>Ray is working</b></>};
}

function SkipSheet({uc,onClose}){
  const [what,setWhat]=useState(null);
  const opts=[!uc.done.train&&['train','Skip Train','Ray never practises on your closed alerts, so you go live with no evidence that it agrees with your analysts.'],
    !uc.done.prove&&['prove','Skip Prove','Ray never runs beside your analysts on live alerts, so nothing proves it generalises beyond the training set.'],
    (!uc.done.train&&!uc.done.prove)&&['both','Skip both','Straight from the playbook to production. Only the policy and your signature stand behind it.']].filter(Boolean);
  return <div className="s3-sheetbg" onClick={onClose}><div className="s3-sheet" onClick={e=>e.stopPropagation()}>
    <div style={{display:'flex',alignItems:'center'}}><div className="s3-kick" style={{flex:1}}><i className="ti ti-player-skip-forward"></i>Skip a stage</div><button className="s3-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
    <h3>Go faster, with less proof</h3><p className="lead">Teams running a proof of concept sometimes skip ahead. It is recorded in the audit trail with your name.</p>
    <div className="s3-levels" style={{gridTemplateColumns:'1fr'}}>{opts.map(([k,t,d])=><button key={k} className={'s3-level'+(what===k?' on':'')} onClick={()=>setWhat(k)}><b>{t}</b><span>{d}</span></button>)}</div>
    {what&&<div className="s3-block" style={{marginTop:14}}><i className="ti ti-alert-triangle"></i><div><b>What you lose</b><span>{opts.find(o=>o[0]===what)[2]} The go-live checklist will say so.</span></div></div>}
    <div className="s3-sigrow"><span className="sp"></span><button className="s3-b" onClick={onClose}>Keep the full journey</button>
      <button className="s3-b danger" disabled={!what} onClick={()=>{onClose();E.skipStage(uc,what);}}>Skip and accept</button></div>
  </div></div>;
}
function CopySheet({uc,onClose}){
  const [o,setO]=useState({workflow:true,policy:true,report:true,tuning:false});
  const [tpl,setTpl]=useState(uc.tpl);
  const rows=[['workflow','The playbook','All '+(E.cur(uc)?E.cur(uc).wf.nodes.length:0)+' steps, owners and deadlines'],['policy','The policy clauses',uc.policy.length+' clauses and their sources'],
    ['report','The report layout',uc.report==='upload'?'Your own layout':'The predefined layout'],['tuning','Tuning decisions',Object.keys(uc.train.sugs||{}).length+' accepted or rejected suggestions']];
  return <div className="s3-sheetbg" onClick={onClose}><div className="s3-sheet" onClick={e=>e.stopPropagation()}>
    <div style={{display:'flex',alignItems:'center'}}><div className="s3-kick" style={{flex:1}}><i className="ti ti-copy"></i>Copy this use case</div><button className="s3-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
    <h3>Reuse {uc.name}</h3><p className="lead">Start a new use case from this one — Ray flags anything that looks country-specific.</p>
    <h4>What to copy</h4>
    {rows.map(([k,t,d])=><div key={k} className={'s3-chk'+(o[k]?' on':'')} onClick={()=>setO(x=>Object.assign({},x,{[k]:!x[k]}))}><span className="bx">{o[k]&&<i className="ti ti-check"></i>}</span><div style={{flex:1}}><b style={{fontWeight:650}}>{t}</b><span style={{display:'block',fontSize:12,color:'var(--ink-3)'}}>{d}</span></div></div>)}
    <h4>For which job</h4>
    <select className="s3-sel" value={tpl} onChange={e=>setTpl(e.target.value)}>{D.TEMPLATES.map(t=><option key={t.id} value={t.id}>{t.t} · {t.r}</option>)}</select>
    <div className="s3-sigrow"><span className="sp"></span><button className="s3-b" onClick={onClose}>Cancel</button>
      <button className="s3-b pri" onClick={()=>{onClose();E.copyFlow(uc,o,tpl);}}><i className="ti ti-copy"></i>Create the copy</button></div>
  </div></div>;
}

function Workspace({uc,onBrowse}){
  const [prefill,setPrefill]=useState(null);const [menu,setMenu]=useState(false);const [sheet,setSheet]=useState(false);const [audit,setAudit]=useState(false);
  const [skip,setSkip]=useState(false);const [copy,setCopy]=useState(false);
  const [rail,setRail]=useState(false);const [viewVer,setViewVer]=useState(null);
  const [mob,setMob]=useState(()=>window.matchMedia('(max-width:900px)').matches);
  const th=useRef(null);const seenMsgs=useRef(uc.msgs.length);
  useEffect(()=>{const mq=window.matchMedia('(max-width:900px)');const f=()=>setMob(mq.matches);mq.addEventListener?mq.addEventListener('change',f):mq.addListener(f);return()=>{mq.removeEventListener?mq.removeEventListener('change',f):mq.removeListener(f);};},[]);
  useEffect(()=>{if(th.current)th.current.scrollTop=th.current.scrollHeight;},[uc.msgs.length,uc.typing,rail]);
  useEffect(()=>{if(uc.openSheet)setSheet(true);},[uc.openSheet]);
  useEffect(()=>{if(uc.openCopy)setCopy(true);},[uc.openCopy]);
  useEffect(()=>{if(rail||!mob)seenMsgs.current=uc.msgs.length;},[rail,mob,uc.msgs.length]);
  const goStep=id=>{setViewVer(null);setRail(false);E.pulse(uc,[id]);};
  const onStep=(n,num)=>{uc.focusNode=n.id;setPrefill({text:'About step '+num+' ('+n.t+'): ',t:Date.now()});};
  const r=readiness(uc,goStep,()=>setSheet(true));
  const si=D.STAGES.findIndex(s=>s.k===uc.stage);const t=E.tplOf(uc),c=t?D.CATS[t.cat]:null;
  const lastRay=[...uc.msgs].reverse().find(m=>m.from==='ray'&&m.text);
  const peek=mob&&!rail&&uc.msgs.length>seenMsgs.current&&lastRay;
  const quick=uc.step==='b.refine'&&!uc.comment?['Change the SLA to 24 hours for high-risk alerts','Add four-eyes approval before filing','Add sanctions re-screening after enrichment']:[];
  const working=uc.typing||uc.run||uc.step==='building'||uc.prove.running;
  const ph=uc.step==='brief'?'Tell Ray what to change in the brief…':uc.stage==='build'?'Tell Ray what to change, in your own words…':'Ask or tell Ray anything…';
  return <div className="s3-ws">
    <div className="s3-h">
      <button className="s3-ib" onClick={()=>E.close()} title="All investigators"><i className="ti ti-arrow-left"></i></button>
      <div className="tt"><b>{uc.name}</b><span>{c?c.n:'New use case'}{uc.versions.length?' · playbook v'+E.cur(uc).n:''}</span></div>
      <span className="sp"></span>
      <div className="s3-steps">{D.STAGES.map((s,i)=>{const done=i<si||(s.k==='operate'&&uc.operate.live);return <span key={s.k} className={'s3-st'+(done?' done':i===si&&uc.step!=='brief'?' cur':'')} style={{'--c':s.c}} title={s.t+' · '+s.sub}>
        <span className="d">{done?<i className="ti ti-check"></i>:i+1}</span><span className="l">{s.t}</span></span>;})}</div>
      <span className="sp"></span>
      <button className="s3-lvl" onClick={()=>setMenu(m=>!m)} title="How often Ray checks with you"><i className={'ti '+E.LV[uc.step==='brief'?uc.brief.level:uc.level].ic}></i><span className="lt">{E.LV[uc.step==='brief'?uc.brief.level:uc.level].t}</span><i className="ti ti-chevron-down" style={{color:'var(--ink-3)'}}></i></button>
      <button className="s3-ib s3-raybtn" onClick={()=>setRail(true)} title="Talk history"><i className="ti ti-message-circle"></i></button>
      {menu&&<div className="s3-menu" onMouseLeave={()=>setMenu(false)}>
        <div className="lbl">Check with me</div>
        {['every','important','sign'].map(k=><button key={k} className={(uc.step==='brief'?uc.brief.level:uc.level)===k?'on':''} onClick={()=>{E.setLevel(uc,k);setMenu(false);}}><i className={'ti '+E.LV[k].ic}></i><span>{E.LV[k].t}<small>{E.LV[k].d}</small></span></button>)}
        <hr/>
        <button onClick={()=>{setMenu(false);setAudit(true);}}><i className="ti ti-shield-check"></i><span>Audit trail<small>Every decision, downloadable</small></span></button>
        <button onClick={()=>{setMenu(false);setCopy(true);}}><i className="ti ti-copy"></i><span>Copy this use case<small>Reuse it for another country</small></span></button>
        {!uc.operate.live&&(!uc.done.train||!uc.done.prove)&&<button onClick={()=>{setMenu(false);setSkip(true);}}><i className="ti ti-player-skip-forward"></i><span>Skip a stage<small>For a proof of concept</small></span></button>}
        <button onClick={()=>{setMenu(false);E.say(uc,'Where are we?','text');if(mob)setRail(true);}}><i className="ti ti-map-pin"></i>Where are we?</button>
        <button onClick={()=>{setMenu(false);E.startBlank();}}><i className="ti ti-plus"></i><span>Teach Ray a new job<small>Start another investigation</small></span></button>
        <button onClick={()=>{setMenu(false);E.close();}}><i className="ti ti-layout-list"></i>All investigators</button>
      </div>}
    </div>
    <div className={'s3-strip '+r.k}>
      <span className="ri"><i className={'ti '+r.ic}></i></span><span className="rt">{r.t}</span>
      {r.btn&&<button className={'s3-b sm '+(r.sec?'':r.k==='you'?'pri':'')} onClick={r.act}>{r.btn}</button>}
      {uc.versions.length>0&&<div className="s3-vers"><span className="vl">Versions</span>{uc.versions.map(v=><button key={v.n} title={'v'+v.n+' · '+v.summary+(uc.signs.includes(v.n)?' · signed':'')} className={(viewVer===v.n?'view ':'')+(v.n===E.cur(uc).n&&!viewVer?'cur ':'')+(uc.signs.includes(v.n)?'sig':'')} onClick={()=>setViewVer(v.n===E.cur(uc).n?null:v.n)}>{v.n}</button>)}
        <button title="Audit trail" onClick={()=>setAudit(true)} style={{width:'auto',padding:'0 6px'}}><i className="ti ti-shield-check" style={{fontSize:15}}></i></button></div>}
    </div>
    <div className="s3-body">
      <div className="s3-main">
        <div className="s3-scroll">
          {uc.step==='brief'?<U.Brief uc={uc} onBrowse={onBrowse}/>
            :uc.versions.length?<U.Playbook uc={uc} onStep={onStep} viewVer={viewVer} setViewVer={setViewVer}/>
            :<div className="s3-paper"><div className="s3-kick"><i className="ti ti-loader-2"></i>Playbook</div><div className="s3-title">Ray is reading your policy…</div><p className="s3-lead">The playbook appears here step by step.</p></div>}
        </div>
        <div className="s3-dock"><div className="s3-dock-in">
          {peek&&<div className="s3-peek" onClick={()=>setRail(true)}><span className="s3-orb sm">✦</span><span className="bd">{U.md(lastRay.text)}</span></div>}
          {quick.length>0&&<div className="s3-quick">{quick.map(q=><button key={q} className="s3-chip" onClick={()=>E.say(uc,q,'text')}>{q}</button>)}</div>}
          <Composer hint prefill={prefill} placeholder={ph} scriptKey={()=>uc.step} onSend={(tx,via)=>E.say(uc,tx,via)}/>
        </div></div>
      </div>
      {mob&&rail&&<div className="s3-railbg" onClick={()=>setRail(false)}></div>}
      <div className={'s3-rail'+(rail?' open':'')}>
        <div className="s3-rh"><span className={'s3-orb'+(working?' live':'')}>✦</span><div><b>Ray</b><span>{working?'Working on it…':'Here when you need me'}</span></div><span className="sp"></span><button className="s3-ib x" onClick={()=>setRail(false)}><i className="ti ti-x"></i></button></div>
        <div className="s3-thread" ref={th}>
          {uc.msgs.map(m=><U.Note key={m.id} uc={uc} m={m} goStep={goStep}/>)}
          {uc.typing&&<div className="s3-n"><span className="s3-orb sm">✦</span><div className="s3-typing"><i></i><i></i><i></i></div></div>}
        </div>
      </div>
    </div>
    {sheet&&uc.gate&&<U.SignSheet uc={uc} onClose={()=>setSheet(false)}/>}
    {audit&&<U.Audit uc={uc} onClose={()=>setAudit(false)} onView={n=>setViewVer(n===E.cur(uc).n?null:n)}/>}
    {skip&&<SkipSheet uc={uc} onClose={()=>setSkip(false)}/>}
    {copy&&<CopySheet uc={uc} onClose={()=>setCopy(false)}/>}
  </div>;
}

function RayStudio(){
  const [,setV]=useState(0);const [browse,setBrowse]=useState(null);
  useEffect(()=>E.subscribe(setV),[]);
  const uc=E.state.openId?E.get(E.state.openId):null;
  return <div className="s3">
    {uc?<Workspace key={uc.id} uc={uc} onBrowse={cb=>setBrowse(()=>cb)}/>:<Today onBrowse={cb=>setBrowse(()=>cb)}/>}
    {browse&&<Browser onClose={()=>setBrowse(null)} onPick={id=>{const cb=browse;setBrowse(null);cb(id);}}/>}
  </div>;
}
window.RayStudio=RayStudio;
})();
