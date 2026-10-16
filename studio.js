/* Ray Studio v2 — UI part 2: voice, composer, home, workspace (text/babel) */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,E=window.RSE,U=window.RSU;

const SCRIPT={'home':'Set up UK transaction screening on autopilot with our AML policy','b.tpl':'Set up UK transaction screening on autopilot with our AML policy',
  'b.mode':'Step by step please','b.setup':'Use our policy documents and the predefined report','b.refine':'Change the SLA to 24 hours for high-risk alerts',
  'b.apply':'Looks good, I approve','b.agree':'I agree, start','b.handoff':'I’ll do it myself','t.setup':'Use the last 6 months and start practice','t.sugs':'Accept all',
  't.round':'Run another round','t.sign':'Approve and sign','p.setup':'Four weeks on 50% of new alerts, start','p.run':'Skip to the end','p.sign':'Request the sign-offs',
  'o.go':'Sign and go live','o.live':'Where are we?'};

/* real speech recognition, with a scripted fallback when the mic or API is unavailable */
function useVoice(onFinal,scriptFor){
  const [st,setSt]=useState({on:false,interim:'',demo:false});
  const rec=useRef(null),tm=useRef(null),fin=useRef(''),handled=useRef(false);
  const finish=(text)=>{setSt({on:false,interim:'',demo:false});if(text)onFinal(text,'voice');};
  const demo=()=>{
    const phrase=scriptFor();let i=0;
    setSt({on:true,interim:'',demo:true});
    clearInterval(tm.current);
    tm.current=setInterval(()=>{i+=2;setSt(s=>Object.assign({},s,{interim:phrase.slice(0,i)}));
      if(i>=phrase.length){clearInterval(tm.current);tm.current=setTimeout(()=>finish(phrase),550);}},45);
  };
  const start=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){demo();return;}
    try{
      const r=new SR();r.lang='en-US';r.interimResults=true;r.continuous=false;fin.current='';handled.current=false;
      r.onresult=e=>{let f='',it='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)f+=t;else it+=t;}
        if(f)fin.current+=f;setSt(s=>Object.assign({},s,{interim:fin.current+it}));};
      r.onerror=()=>{if(handled.current)return;handled.current=true;rec.current=null;try{r.abort();}catch(x){}if(!fin.current)demo();else finish(fin.current.trim());};
      r.onend=()=>{if(handled.current)return;handled.current=true;rec.current=null;const t=fin.current.trim();if(t)finish(t);else demo();};
      rec.current=r;r.start();setSt({on:true,interim:'',demo:false});
    }catch(x){demo();}
  };
  const stop=()=>{
    if(st.demo){clearInterval(tm.current);clearTimeout(tm.current);finish(st.interim);return;}
    if(rec.current){try{rec.current.stop();}catch(x){}}
  };
  useEffect(()=>()=>{clearInterval(tm.current);clearTimeout(tm.current);if(rec.current)try{rec.current.abort();}catch(x){}},[]);
  return {st,start,stop};
}

function Composer({onSend,placeholder,scriptKey,big,prefill,autoFocus}){
  const [txt,setTxt]=useState('');
  const ta=useRef(null);
  const voice=useVoice((t,via)=>onSend(t,via),()=>SCRIPT[scriptKey()]||SCRIPT['o.live']);
  useEffect(()=>{if(prefill&&prefill.text){setTxt(prefill.text);setTimeout(()=>{if(ta.current){ta.current.focus();ta.current.setSelectionRange(prefill.text.length,prefill.text.length);}},0);}},[prefill]);
  useEffect(()=>{if(ta.current){ta.current.style.height='auto';ta.current.style.height=Math.min(130,ta.current.scrollHeight)+'px';}},[txt]);
  const send=()=>{const t=txt.trim();if(!t)return;setTxt('');onSend(t,'text');};
  return <div className={'st-cmp'+(big?' big':'')}>
    {voice.st.on
      ?<div className="st-voice"><div className="st-wave">{Array.from({length:9}).map((_,i)=><i key={i}></i>)}</div>
        <div className="vt"><div className="vl">{voice.st.demo?'Voice demo · microphone unavailable':'Listening…'}</div>{voice.st.interim||<em>Say what you want Ray to do…</em>}</div></div>
      :<textarea ref={ta} rows={1} value={txt} autoFocus={autoFocus} placeholder={placeholder} onChange={e=>setTxt(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}/>}
    <button className={'st-cb mic'+(voice.st.on?' on':'')} title={voice.st.on?'Stop and send':'Talk to Ray'} onClick={()=>voice.st.on?voice.stop():voice.start()}>
      <i className={'ti '+(voice.st.on?'ti-player-stop-filled':'ti-microphone')}></i></button>
    {!voice.st.on&&<button className="st-cb send" disabled={!txt.trim()} onClick={send} title="Send"><i className="ti ti-arrow-up"></i></button>}
  </div>;
}

function Browser({onPick,onClose}){
  const [cat,setCat]=useState('all');const [q,setQ]=useState('');
  const list=D.TEMPLATES.filter(t=>(cat==='all'||t.cat===cat)&&(!q||(t.t+t.d+t.r+t.reg).toLowerCase().includes(q.toLowerCase())));
  return <div className="st-scrim" onClick={onClose}><div className="st-modal" onClick={e=>e.stopPropagation()}>
    <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{flex:1}}><h3>Choose a job for Ray</h3><div style={{fontSize:13,color:'var(--ink-2)',marginTop:2}}>Each is a proven ThetaRay setup — you make it yours next.</div></div><button className="st-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:16,alignItems:'center'}}>
      <div className="st-search"><i className="ti ti-search" style={{color:'var(--ink-3)'}}></i><input value={q} autoFocus onChange={e=>setQ(e.target.value)} placeholder="Search by name, country or regulator"/></div>
      <div className="seg2"><button className={cat==='all'?'on':''} onClick={()=>setCat('all')}>All</button>{Object.keys(D.CATS).map(k=><button key={k} className={cat===k?'on':''} onClick={()=>setCat(k)}>{D.CATS[k].n}</button>)}</div></div>
    <div className="sh-list st-tpls">{list.map(t=>{const c=D.CATS[t.cat];return <div key={t.id} className="sh-row" onClick={()=>onPick(t.id)}>
      <span className="ic" style={{background:c.c+'1f',color:c.c}}><i className={'ti '+c.ic}></i></span>
      <div className="main"><b>{t.t}</b><span>{t.d}</span></div><div className="meta"><span className="hide-m">{t.r}</span><i className="ti ti-chevron-right chev"></i></div></div>;})}</div>
  </div></div>;
}

const Mini4=({uc})=>{const si=D.STAGES.findIndex(s=>s.k===uc.stage);return <span className="st-mini4" title={D.STAGES[si].t}>{D.STAGES.map((s,i)=><i key={s.k} className={i<si||(uc.operate.live&&i===3)?'done':i===si?'cur':''} style={{'--c':s.c}}></i>)}</span>;};

function Home({onBrowse}){
  const S=E.state;const [filt,setFilt]=useState('all');
  const needs=S.ucs.filter(u=>u.need);
  const list=S.ucs.filter(u=>filt==='all'||u.stage===filt);
  const sugs=[['ti-microphone','Set up UK transaction screening on autopilot with our AML policy'],['ti-route','Build retail transaction monitoring step by step'],['ti-flask','Start from the real-world screening example']];
  return <div className="sh"><div className="sh-in">
    <div className="sh-hero">
      <div className="mk lg">✦</div>
      <h1>What should Ray learn to investigate?</h1>
      <p>Talk to Ray like a new investigator. It builds, practices and proves itself — you decide and sign.</p>
      <Composer big autoFocus placeholder="Describe it in your own words, or tap the mic" scriptKey={()=>'home'} onSend={(t,via)=>E.createFromPrompt(t,via)}/>
      <div className="sh-sugs">{sugs.map(s=><button key={s[1]} className="st-chip" onClick={()=>E.createFromPrompt(s[1],'text')}><i className={'ti '+s[0]}></i>{s[1]}</button>)}</div>
      <button className="sh-link" onClick={()=>onBrowse(id=>E.startFromTpl(id))}>or browse all {D.TEMPLATES.length} jobs</button>
    </div>

    {needs.length>0&&<><div className="sh-sec"><h2>Needs you</h2><span className="n">{needs.length}</span></div>
      <div className="sh-list">{needs.map(u=><div key={u.id} className={'sh-row need '+u.need.kind} onClick={()=>E.open(u.id)}>
        <span className="ic"><i className={'ti '+u.need.ic}></i></span>
        <div className="main"><b>{u.need.t}</b><span>{u.need.d}</span></div>
        <div className="meta"><U.Av who={u.next.who}/><i className="ti ti-chevron-right chev"></i></div></div>)}</div></>}

    <div className="sh-sec"><h2>Your investigators</h2><span className="sp"></span>
      <div className="sh-seg"><button className={filt==='all'?'on':''} onClick={()=>setFilt('all')}>All</button>
        {D.STAGES.map(s=><button key={s.k} className={filt===s.k?'on':''} onClick={()=>setFilt(s.k)}>{s.t}</button>)}</div></div>
    <div className="sh-list">{list.map(u=>{const t=E.tplOf(u)||{cat:'oth'},c=D.CATS[t.cat],st=D.STAGES.find(s=>s.k===u.stage),nx=U.P(u.next.who);return(
      <div key={u.id} className="sh-row" onClick={()=>E.open(u.id)}>
        <span className="ic" style={{background:c.c+'1f',color:c.c}}><i className={'ti '+c.ic}></i></span>
        <div className="main"><b>{u.name}</b><span>{u.operate.live?'Live · working alone':st.t+' · '+(u.next.who==='you'?'your turn: ':u.next.who==='ray'?'':nx.n+': ')+u.next.what.toLowerCase()}</span></div>
        <div className="meta">{u.mode==='auto'&&<span className="st-pill ai hide-m"><i className="ti ti-sparkles"></i>Autopilot</span>}<Mini4 uc={u}/><span className="hide-m">{u.updated}</span><i className="ti ti-chevron-right chev"></i></div>
      </div>);})}
      {!list.length&&<div className="sh-row" style={{cursor:'default',color:'var(--ink-3)'}}>Nothing in this stage yet.</div>}</div>
  </div></div>;
}

/* the single "what happens next" model shared by the next-action bar */
const LABEL={tpl:'Pick a job',mode:'Choose how hands-on you want to be',agree:'Agree the rules',setup:'Confirm what Ray uses',handoff:'Choose who runs Train',tdata:'Start the practice round',
  sugs:'Decide the suggestions',round:'Run another round, or sign off',handback:'Decide the held rule',final:'Give the final approval',shadow:'Start the shadow run',
  approvals:'Request the sign-offs',checklist:'Confirm the checklist',authority:'Choose Ray’s starting authority',comment:'Decide on Dana’s comment',policy:'Add your policy',report:'Choose the report'};
function nextAction(uc){
  if(uc.typing)return {k:'ray',ic:'ti-loader-2',t:<>Ray is writing…</>};
  const open=[...uc.msgs].reverse().find(m=>m.card&&!m.card.done&&m.card.type!=='change');
  if(open){const c=open.card;
    if(c.type==='autorun')return {k:'ray',ic:'ti-loader-2',t:<><b>Autopilot is running</b> · step {Math.min(c.at+1,c.steps.length)} of {c.steps.length}</>};
    if(c.type==='replay')return {k:'ray',ic:'ti-loader-2',t:<><b>Practicing</b> · {c.cnt.toLocaleString()} of {c.n.toLocaleString()} alerts</>};
    if(c.type==='read'||c.type==='progress')return {k:'ray',ic:'ti-loader-2',t:<><b>Ray is drafting</b> version 1…</>};
    if(c.type==='shadowrun')return {k:'ray',ic:'ti-eye-check',t:<><b>Shadow run</b> · day {uc.prove.day} of {uc.prove.total} · no effect on alerts</>,btn:'Skip to end',act:()=>E.fastForward(uc)};
    if(c.type==='nudge')return {k:'wait',ic:'ti-hourglass',t:<><b>Waiting on Dana Levi</b> · start practice</>,btn:'Do it myself',act:()=>E.takeBack(uc,open.id)};
    if(c.type==='approvals'&&c.requested)return {k:'wait',ic:'ti-hourglass',t:<><b>Waiting for signatures</b> · MLRO and Head of FCC</>};
    const direct={agree:['Agree & start',()=>E.agree(uc,open.id)],setup:['Build version 1',()=>E.setupGo(uc,open.id)],tdata:['Start practice',()=>E.startReplay(uc,open.id,false)],
      shadow:['Start',()=>E.startShadow(uc,open.id)],approvals:['Request',()=>E.requestSignoff(uc,open.id)],final:['Approve & sign',()=>E.finalSign(uc,open.id)],
      round:['Run round '+(uc.train.rounds.length+1),()=>E.round(uc,open.id,true)],
      sign:[open.card.what==='operate'?'Sign & go live':'Approve & sign',()=>E.sign(uc,open.id,open.card.what)]}[c.type];
    const label=c.type==='sign'?{build:'Sign off Build',train:'Sign off Train',operate:'Go live'}[c.what]:LABEL[c.type]||'Continue';
    return {k:'you',ic:'ti-hand-click',t:<><b>Your turn</b> · {label}</>,btn:direct?direct[0]:'Show me',act:direct?direct[1]:null,mid:open.id};
  }
  if(uc.step==='b.refine'&&E.cur(uc))return {k:'you',ic:'ti-message-2',t:<><b>Your turn</b> · tell Ray what to change, or sign off v{E.cur(uc).n}</>,btn:'Sign off',act:()=>E.askApply(uc)};
  if(uc.operate.live)return {k:'ok',ic:'ti-circle-check',t:<><b>Live</b> · Ray works alone, monitored</>,btn:'Evidence',act:()=>E.setTab(uc,'results')};
  return null;
}

function Workspace({uc,onBrowse}){
  const th=useRef(null);
  const [prefill,setPrefill]=useState(null);
  const [menu,setMenu]=useState(false);
  const [sheet,setSheet]=useState(false);
  const [mob,setMob]=useState(()=>window.matchMedia('(max-width:860px)').matches);
  const seen=useRef(uc.pulse.t);
  useEffect(()=>{const mq=window.matchMedia('(max-width:860px)');const f=()=>setMob(mq.matches);mq.addEventListener?mq.addEventListener('change',f):mq.addListener(f);return()=>{mq.removeEventListener?mq.removeEventListener('change',f):mq.removeListener(f);};},[]);
  useEffect(()=>{if(th.current)th.current.scrollTop=th.current.scrollHeight;},[uc.msgs.length,uc.typing]);
  useEffect(()=>{if(sheet)seen.current=uc.pulse.t;},[sheet,uc.pulse.t]);
  const stg=D.STAGES.findIndex(s=>s.k===uc.stage);
  const t=E.tplOf(uc),c=t?D.CATS[t.cat]:null;
  const na=nextAction(uc);
  const onNode=n=>{uc.focusNode=n.id;setPrefill({text:'About “'+n.t+'”: ',t:Date.now()});setSheet(false);};
  const showCard=mid=>{const el=th.current&&th.current.querySelector('[data-mid="'+mid+'"]');if(el){th.current.scrollTop=el.offsetTop-th.current.offsetTop-20;el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');}};
  const quick=uc.step==='b.refine'?['Change the SLA to 24 hours for high-risk alerts','Add four-eyes approval before filing','Add sanctions re-screening after enrichment']:[];
  const peek=mob&&!sheet&&U.tabsFor(uc).length>0&&uc.pulse.t>seen.current;
  return <div className="ws">
    <div className="wh">
      <button className="st-ib" onClick={()=>E.close()} title="All investigators"><i className="ti ti-arrow-left"></i></button>
      <div className="wh-t"><b>{uc.name}</b><span>{c?c.n:'New use case'}{uc.versions.length?' · version '+E.cur(uc).n:''}</span></div>
      <span className="sp"></span>
      <div className="st-track">{D.STAGES.map((s,i)=>{const done=i<stg||(s.k==='operate'&&uc.operate.live);
        return <React.Fragment key={s.k}>{i>0&&<span className={'ln'+(i<=stg?' done':'')}></span>}
          <span className={'tk'+(done?' done':i===stg?' cur':'')} style={{'--c':s.c}} title={s.t+' · '+s.sub}><span className="d">{done?<i className="ti ti-check"></i>:i+1}</span><span className="l">{s.t}</span></span></React.Fragment>;})}</div>
      <span className="sp"></span>
      {uc.mode==='auto'&&<span className="st-auto-b"><i className="ti ti-sparkles"></i>Autopilot</span>}
      <button className="st-ib st-mpkg" onClick={()=>setSheet(true)} title="Open the package"><i className="ti ti-package"></i></button>
      <button className="st-ib" onClick={()=>setMenu(m=>!m)} title="More"><i className="ti ti-dots"></i></button>
      {menu&&<div className="st-menu" onMouseLeave={()=>setMenu(false)}>
        <button onClick={()=>{E.toggleAuto(uc);setMenu(false);}}><i className="ti ti-sparkles"></i><span>Autopilot<small>Ray runs steps, you approve</small></span><span className={'st-sw'+(uc.mode==='auto'?' on':'')}></span></button>
        <hr/>
        <button onClick={()=>{setMenu(false);E.say(uc,'Where are we?','text');}}><i className="ti ti-map-pin"></i>Where are we?</button>
        <button onClick={()=>{setMenu(false);E.setTab(uc,'trail');if(mob)setSheet(true);}}><i className="ti ti-history"></i><span>History &amp; audit<small>Every decision, downloadable</small></span></button>
        <button onClick={()=>{setMenu(false);E.close();}}><i className="ti ti-layout-list"></i>All investigators</button>
      </div>}
    </div>
    <div className="wb">
      <div className="chat">
        <div className="thread" ref={th}><div className="thread-in">
          {uc.msgs.map(m=>m.from==='log'
            ?<div key={m.id} className="st-log"><i className={'ti '+m.icon}></i>{m.text}</div>
            :m.from==='you'
            ?<div key={m.id} className="m you"><div className="ub">{U.md(m.text)}{m.via==='voice'&&<span className="via"><i className="ti ti-microphone"></i>spoken</span>}</div></div>
            :m.card&&m.card.done&&['read','progress','replay'].includes(m.card.type)
            ?<div key={m.id} className="st-log"><i className="ti ti-circle-check" style={{color:'var(--t-ok)'}}></i>{m.card.type==='read'?'Read '+uc.files.length+' documents':m.card.type==='progress'?'Drafted version 1':'Practice round '+m.card.round+' · '+m.card.choice}</div>
            :<div key={m.id} className="m ray"><div className="mk sm">✦</div><div className="body">
              {m.text&&<div className="tx">{U.md(m.text)}</div>}
              {m.card&&<U.Card uc={uc} m={m} onBrowse={onBrowse}/>}</div></div>)}
          {uc.typing&&<div className="m ray"><div className="mk sm">✦</div><div className="st-typing"><i></i><i></i><i></i></div></div>}
        </div></div>
        <div className="cw">
          {peek&&<button className="peek" onClick={()=>setSheet(true)}><span className="nw"></span>Package updated{uc.versions.length?' · v'+E.cur(uc).n:''} — view</button>}
          {na&&<div className={'nb '+na.k}><i className={'ti '+na.ic}></i><span className="t">{na.t}</span>
            {na.btn&&<button className={'st-btn sm '+(na.k==='you'?'pri':'')} onClick={()=>na.act?na.act():showCard(na.mid)}>{na.btn}</button>}</div>}
          {quick.length>0&&<div className="qk">{quick.map(q=><button key={q} className="st-chip" onClick={()=>E.say(uc,q,'text')}>{q}</button>)}</div>}
          <Composer prefill={prefill} placeholder={uc.step==='b.refine'?'Tell Ray what to change, in your own words…':'Talk or type to Ray…'} scriptKey={()=>uc.step} onSend={(tx,via)=>E.say(uc,tx,via)}/>
        </div>
      </div>
      {mob&&sheet&&<div className="sheet-scrim" onClick={()=>setSheet(false)}></div>}
      <U.Package uc={uc} onNode={onNode} open={sheet} onClose={()=>setSheet(false)}/>
    </div>
  </div>;
}

function RayStudio(){
  const [,setV]=useState(0);
  const [browse,setBrowse]=useState(null);
  useEffect(()=>E.subscribe(setV),[]);
  const uc=E.state.openId?E.get(E.state.openId):null;
  return <div className="st">
    {uc?<Workspace key={uc.id} uc={uc} onBrowse={cb=>setBrowse(()=>cb)}/>:<Home onBrowse={cb=>setBrowse(()=>cb)}/>}
    {browse&&<Browser onClose={()=>setBrowse(null)} onPick={id=>{const cb=browse;setBrowse(null);cb(id);}}/>}
  </div>;
}
window.RayStudio=RayStudio;
})();
