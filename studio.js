/* Ray Studio — UI part 2: voice, composer, home, workspace (text/babel) */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,E=window.RSE,U=window.RSU;

const SCRIPT={'home':'Set up UK transaction screening on autopilot with our AML policy','b.tpl':'Set up UK transaction screening on autopilot with our AML policy',
  'b.mode':'Guide me step by step','b.policy':'Use our policy documents','b.report':'Use the predefined report','b.refine':'Change the SLA to 24 hours for high-risk alerts',
  'b.apply':'Looks good, I approve','b.agree':'I agree, start','b.handoff':'I’ll do it myself','t.setup':'Use the last 6 months and start practice','t.sugs':'Accept all',
  't.round':'Run another round','t.sign':'Approve and sign','p.setup':'Four weeks on 50% of new alerts, start','p.run':'Fast forward to the end','p.sign':'Request the sign-offs',
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
  useEffect(()=>{if(ta.current){ta.current.style.height='auto';ta.current.style.height=Math.min(120,ta.current.scrollHeight)+'px';}},[txt]);
  const send=()=>{const t=txt.trim();if(!t)return;setTxt('');onSend(t,'text');};
  return <div className="st-compose">
    {voice.st.on
      ?<div className="st-voice"><div className="st-wave">{Array.from({length:9}).map((_,i)=><i key={i}></i>)}</div>
        <div className="vt"><div className="vl">{voice.st.demo?'Voice demo · mic unavailable':'Listening…'}</div>{voice.st.interim||<em>Say what you want Ray to do…</em>}</div></div>
      :<textarea ref={ta} rows={1} value={txt} autoFocus={autoFocus} placeholder={placeholder} onChange={e=>setTxt(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}/>}
    <button className={'st-ic mic'+(voice.st.on?' on':'')} title={voice.st.on?'Stop and send':'Talk to Ray'} onClick={()=>voice.st.on?voice.stop():voice.start()}>
      <i className={'ti '+(voice.st.on?'ti-player-stop-filled':'ti-microphone')}></i></button>
    {!voice.st.on&&<button className="st-ic send" disabled={!txt.trim()} onClick={send} title="Send"><i className="ti ti-arrow-up"></i></button>}
  </div>;
}

function Browser({onPick,onClose}){
  const [cat,setCat]=useState('all');const [q,setQ]=useState('');
  const list=D.TEMPLATES.filter(t=>(cat==='all'||t.cat===cat)&&(!q||(t.t+t.d+t.r+t.reg).toLowerCase().includes(q.toLowerCase())));
  return <div className="st-scrim" onClick={onClose}><div className="st-modal" onClick={e=>e.stopPropagation()}>
    <div style={{display:'flex',alignItems:'center',gap:10}}><div style={{flex:1}}><h3>Choose a job for Ray</h3><div style={{fontSize:12.5,color:'var(--ink-2)'}}>Every job is a proven ThetaRay setup. You make it yours in the next step.</div></div><button className="st-back" onClick={onClose}><i className="ti ti-x"></i></button></div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14,alignItems:'center'}}>
      <div className="st-compose" style={{padding:'2px 10px',boxShadow:'none',flex:'1 1 220px',borderRadius:12}}><i className="ti ti-search" style={{alignSelf:'center',color:'var(--ink-3)'}}></i><textarea rows={1} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search by name, country or regulator"/></div>
      <div className="st-filt"><button className={cat==='all'?'on':''} onClick={()=>setCat('all')}>All {D.TEMPLATES.length}</button>
        {Object.keys(D.CATS).map(k=><button key={k} className={cat===k?'on':''} onClick={()=>setCat(k)}><i className="stdot" style={{background:D.CATS[k].c}}></i>{D.CATS[k].n}</button>)}</div></div>
    <div className="st-tpls">{list.map(t=>{const c=D.CATS[t.cat];return <button key={t.id} className="st-tpl" onClick={()=>onPick(t.id)}>
      <div style={{display:'flex',alignItems:'center',gap:8}}><span className="st-cat" style={{width:28,height:28,fontSize:14,background:c.c+'22',color:c.c}}><i className={'ti '+c.ic}></i></span><b style={{flex:1}}>{t.t}</b></div>
      <span>{t.d}</span><div className="m">{t.r} · {t.reg}{t.ex?' · real-world example':''}</div></button>;})}</div>
  </div></div>;
}

const Journey=({uc})=><div className="st-jour">{D.STAGES.map(s=>{const done=uc.done[s.k]&&s.k!==uc.stage,cur=s.k===uc.stage&&!(s.k==='operate'&&uc.operate.live&&false);
  return <div key={s.k} className={'s'+(done||(s.k==='operate'&&uc.operate.live)?' done':cur?' cur':'')} style={{'--c':s.c}}><i></i>{s.t}</div>;})}</div>;

function Home({onBrowse}){
  const S=E.state;const [filt,setFilt]=useState('all');
  const needs=S.ucs.filter(u=>u.need);
  const list=S.ucs.filter(u=>filt==='all'||u.stage===filt);
  const sugs=[['ti-microphone','Set up UK transaction screening on autopilot with our AML policy',true],['ti-route','Build retail transaction monitoring step by step'],['ti-flask','Start from the real-world screening example']];
  return <div className="st-home"><div className="st-home-in">
    <div className="st-hero">
      <div className="st-ray lg">✦</div>
      <h1>What should Ray learn to investigate?</h1>
      <p>Onboard Ray like a new investigator — <b>by talking to it</b>. Pick the job, hand over your manual, let it practice, then sign. No code, no settings.</p>
      <Composer big autoFocus placeholder="Say it in your own words — or tap the mic" scriptKey={()=>'home'} onSend={(t,via)=>E.createFromPrompt(t,via)}/>
      <div className="st-sugs">{sugs.map(s=><button key={s[1]} className={'st-chip'+(s[2]?' ai':'')} onClick={()=>E.createFromPrompt(s[1],'text')}><i className={'ti '+s[0]}></i>{s[1]}</button>)}
        <button className="st-chip" onClick={()=>onBrowse(id=>E.startFromTpl(id))}><i className="ti ti-layout-grid"></i>Browse all {D.TEMPLATES.length} jobs</button></div>
      <div className="st-jour" style={{marginTop:22,maxWidth:560,marginLeft:'auto',marginRight:'auto'}}>{D.STAGES.map((s,i)=><div key={s.k} className="s cur" style={{'--c':s.c,alignItems:'center'}}><i style={{width:'100%'}}></i><span>{i+1}. {s.t}</span><span style={{fontWeight:600,fontSize:9.5}}>{s.sub}</span></div>)}</div>
    </div>

    {needs.length>0&&<><div className="st-sec"><h2>Needs you</h2><span className="n">{needs.length}</span><span className="sp"></span><span style={{fontSize:11.5,color:'var(--ink-3)'}}>Ray only stops for what needs a person</span></div>
      <div className="st-needs">{needs.map(u=><div key={u.id} className={'st-need '+u.need.kind} onClick={()=>E.open(u.id)}>
        <div className="h"><i className={'ti '+u.need.ic}></i>{u.need.t}</div><div className="d">{u.need.d}</div>
        <div className="f"><U.Av who={u.next.who}/>{(D.PEOPLE[u.next.who]||D.PEOPLE.you).n}<span className="sp"></span><span style={{fontWeight:700,color:'var(--t-act)'}}>Open <i className="ti ti-arrow-right"></i></span></div></div>)}</div></>}

    <div className="st-sec"><h2>Your investigators</h2><span className="sp"></span>
      <div className="st-filt"><button className={filt==='all'?'on':''} onClick={()=>setFilt('all')}>All {S.ucs.length}</button>
        {D.STAGES.map(s=>{const n=S.ucs.filter(u=>u.stage===s.k).length;return <button key={s.k} className={filt===s.k?'on':''} onClick={()=>setFilt(s.k)}><i className="stdot" style={{background:s.c}}></i>{s.t} {n}</button>;})}</div></div>
    <div className="st-team">{list.map(u=>{const t=E.tplOf(u)||{cat:'oth'},c=D.CATS[t.cat],nx=D.PEOPLE[u.next.who]||D.PEOPLE.you;return(
      <div key={u.id} className="st-uc" onClick={()=>E.open(u.id)}>
        <div className="st-uchead"><span className="st-cat" style={{background:c.c+'22',color:c.c}}><i className={'ti '+c.ic}></i></span>
          <div className="ttl"><b>{u.name}</b><span>{t.r||'—'} · {u.versions.length?'v'+E.cur(u).n:'no version'} · updated {u.updated}</span></div>
          {u.mode==='auto'&&<span className="st-pill ai"><i className="ti ti-sparkles"></i>Autopilot</span>}
          {u.operate.live&&<span className="st-pill ok"><i className="ti ti-player-play"></i>Live</span>}</div>
        <Journey uc={u}/>
        <div className="nx"><U.Av who={u.next.who}/><span><b>{nx.n}</b> · {u.next.what}</span><span className="sp"></span><i className="ti ti-chevron-right"></i></div>
      </div>);})}</div>
  </div></div>;
}

function Workspace({uc,onBrowse}){
  const th=useRef(null);
  const [prefill,setPrefill]=useState(null);
  const [mtab,setMtab]=useState('chat');
  const last=uc.msgs.length;
  useEffect(()=>{if(th.current)th.current.scrollTop=th.current.scrollHeight;},[last,uc.typing,E.state.v]);
  const stg=D.STAGES.findIndex(s=>s.k===uc.stage);
  const t=E.tplOf(uc),c=t?D.CATS[t.cat]:null;
  const nx=D.PEOPLE[uc.next.who]||D.PEOPLE.you;
  const onNode=n=>{uc.focusNode=n.id;setPrefill({text:'About “'+n.t+'”: ',t:Date.now()});setMtab('chat');};
  const quick={'b.refine':['Change the SLA to 24 hours for high-risk alerts','Add four-eyes approval before filing','Add sanctions re-screening after enrichment','Looks good — sign off'],
    't.sugs':['Accept all','Why do we differ on A-20931?'],'p.run':['Fast-forward to the end','Where are we?'],'o.live':['Where are we?','Roll back']}[uc.step]||(uc.versions.length?['Where are we?','Why?','Undo']:[]);
  return <div className="st-ws">
    <div className="st-wh">
      <button className="st-back" onClick={()=>E.close()} title="All investigators"><i className="ti ti-arrow-left"></i></button>
      {c&&<span className="st-cat" style={{background:c.c+'22',color:c.c}}><i className={'ti '+c.ic}></i></span>}
      <div className="nm"><b>{uc.name}</b><span>{c?c.n:'New use case'}{uc.versions.length?' · version '+E.cur(uc).n:''}</span></div>
      <div className="st-track">{D.STAGES.map((s,i)=>{const done=uc.done[s.k]&&(i<stg||(s.k==='operate'&&uc.operate.live));
        return <React.Fragment key={s.k}>{i>0&&<span className="ln"></span>}
          <span className={'t'+(done?' done':i===stg?' cur':'')} style={{'--c':s.c}} title={s.sub}><span className="d">{done?<i className="ti ti-check"></i>:i+1}</span><span className="l">{s.t}<small>{s.sub}</small></span></span></React.Fragment>;})}</div>
      <button className={'st-auto'+(uc.mode==='auto'?' on':'')} onClick={()=>E.toggleAuto(uc)} title="Autopilot: agree the rules once, Ray runs the steps and only checks back for approvals"><i className="ti ti-sparkles"></i>Autopilot<span className="sw"></span></button>
      <span className="st-next" title="Who acts next"><U.Av who={uc.next.who}/>Next: <b>{nx.n}</b></span>
    </div>
    <div className="st-mtabs"><button className={mtab==='chat'?'on':''} onClick={()=>setMtab('chat')}><i className="ti ti-message-circle"></i>Talk to Ray</button>
      <button className={mtab==='pkg'?'on':''} onClick={()=>setMtab('pkg')}><i className="ti ti-package"></i>Package{uc.versions.length?' · v'+E.cur(uc).n:''}</button></div>
    <div className={'st-body m-'+mtab}>
      <div className="st-chat">
        <div className="st-thread" ref={th}>
          {uc.msgs.map(m=>m.from==='log'
            ?<div key={m.id} className="st-log"><i className={'ti '+m.icon}></i>{m.text}</div>
            :<div key={m.id} className={'st-msg '+m.from}>
              {m.from==='ray'&&<div className="st-ray">✦</div>}
              <div className="bub" style={m.from==='you'?{display:'flex',justifyContent:'flex-end'}:null}>
                {m.text&&<div className="txt">{U.md(m.text)}{m.from==='you'&&<span className="via">{m.via==='voice'?'🎙 spoken':''}</span>}</div>}
                {m.card&&<U.Card uc={uc} m={m} onBrowse={onBrowse}/>}
              </div></div>)}
          {uc.typing&&<div className="st-msg ray"><div className="st-ray">✦</div><div className="st-typing"><i></i><i></i><i></i></div></div>}
        </div>
        {quick.length>0&&<div className="st-quick">{quick.map(q=><button key={q} className="st-chip" onClick={()=>E.say(uc,q,'text')}>{q}</button>)}</div>}
        <div className="st-cbox"><Composer prefill={prefill} placeholder={uc.step==='b.refine'?'Tell Ray what to change, in your own words…':'Talk or type to Ray…'} scriptKey={()=>uc.step} onSend={(tx,via)=>E.say(uc,tx,via)}/></div>
      </div>
      <U.Package uc={uc} onNode={onNode}/>
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
