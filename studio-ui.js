/* Ray Studio v2 — UI part 1: chat cards + living package (text/babel) */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,E=window.RSE;
const U=window.RSU=window.RSU||{};

U.md=(t)=>{if(!t)return null;
  return String(t).split('\n').map((line,li)=>{
    const out=[];let rest=line,k=0;const re=/\*\*(.+?)\*\*|\*(.+?)\*/;let m;
    while((m=re.exec(rest))){if(m.index)out.push(rest.slice(0,m.index));
      out.push(m[1]!==undefined?<b key={k++}>{m[1]}</b>:<em key={k++}>{m[2]}</em>);rest=rest.slice(m.index+m[0].length);}
    out.push(rest);return <React.Fragment key={li}>{li>0&&<br/>}{out}</React.Fragment>;});
};
const P=(who)=>D.PEOPLE[who]||D.PEOPLE.you;
U.P=P;
U.Av=({who})=><span className={'st-av '+(who==='ray'?'ray':who==='you'?'you':'')} title={P(who).n+' · '+P(who).r}>{P(who).i}</span>;
const Signed=({c,label})=><div className="signed"><i className="ti ti-signature"></i><div><b>{label||'Signed by you · Compliance lead'}</b><span>{c.when||E.now()}{c.ver?' · version '+c.ver:''} · recorded in History</span></div></div>;
const Hd=({t,right})=><div className="cd-h">{t}<span className="sp"></span>{right}</div>;
const Btns=({children})=><div className="btns">{children}</div>;
const Stp=({st,i,label,note})=><div className={'stp '+st}><span className="ic">{st==='ok'?<i className="ti ti-check"></i>:st==='run'?<i className="ti ti-loader-2"></i>:i+1}</span>{label}{note&&<span className="nt">{note}</span>}</div>;

/* one-line receipt for finished cards — tap to see the full record */
const RCPT={tpl:['Job'],mode:['Mode'],agree:['Rules','ti-file-certificate'],setup:['Using'],policy:['Policy'],report:['Report'],read:['Read'],progress:['Drafted'],
  sign:['Signed','ti-signature'],handoff:['Train owner'],nudge:['Handoff'],tdata:['Practice data'],replay:['Practice'],sugs:['Suggestions'],round:['Next'],autorun:['Autopilot'],
  handback:['Held rule'],final:['Final approval','ti-signature'],shadow:['Shadow run'],shadowrun:['Shadow run'],approvals:['Sign-off','ti-signature'],checklist:['Checklist'],authority:['Authority'],comment:['Dana’s comment'],change:['Changed','ti-git-commit']};
function Receipt({c,children}){
  const [open,setOpen]=useState(false);
  const r=RCPT[c.type]||['Done'];
  return <>
    <div className="st-rc" onClick={()=>setOpen(o=>!o)} title={open?'Hide details':'Show details'}>
      <i className={'ti '+(r[1]||'ti-circle-check')+' ok'}></i><span><b>{r[0]}</b> · {c.choice||'Done'}</span><span className="sp"></span>
      {c.when&&<span style={{fontSize:11,color:'var(--ink-3)'}}>{c.when}</span>}<i className={'ti ex '+(open?'ti-chevron-up':'ti-chevron-down')}></i></div>
    {open&&children}</>;
}

/* ---------- cards ---------- */
function Card({uc,m,onBrowse}){
  const c=m.card;
  const body=<CardBody uc={uc} m={m} onBrowse={onBrowse}/>;
  if(c.type==='change'&&E.cur(uc)&&c.ver!==E.cur(uc).n)return <Receipt c={{type:'change',choice:'v'+c.ver+' · '+(c.summary||'Changed'),when:m.at}}><div className="cd">{body}</div></Receipt>;
  if(c.done&&c.type!=='change')return <Receipt c={c}><div className="cd">{body}</div></Receipt>;
  return <div className="cd" data-mid={m.id}>{body}</div>;
}

function CardBody({uc,m,onBrowse}){
  const c=m.card,done=!!c.done,id=m.id;
  switch(c.type){
  case 'tpl':{
    const recs=['ts-example','ts-uk','tm-retail','pep-am'].map(i=>D.TEMPLATES.find(t=>t.id===i));
    return <><Hd t="Pick a job"/>
      <div className="opts two">{recs.map(t=>{const cat=D.CATS[t.cat];return(
        <button key={t.id} className="opt" disabled={done} onClick={()=>E.pickTpl(uc,id,t.id)}>
          <b><i className={'ti '+cat.ic} style={{color:cat.c}}></i>{t.t}</b><span>{t.d}</span></button>);})}</div>
      {!done&&<Btns><button className="st-btn ghost sm" onClick={()=>onBrowse&&onBrowse(tid=>E.pickTpl(uc,id,tid))}><i className="ti ti-layout-grid"></i>See all {D.TEMPLATES.length} jobs</button></Btns>}</>;}
  case 'mode':
    return <><Hd t="How hands-on?"/>
      <div className="opts two">
        <button className="opt" disabled={done} onClick={()=>E.pickMode(uc,id,'auto')}><em>Fastest</em><b><i className="ti ti-sparkles" style={{color:'var(--t-violet)'}}></i>Autopilot</b><span>You decide 3 times. Ray does the rest and checks back for approvals.</span></button>
        <button className="opt" disabled={done} onClick={()=>E.pickMode(uc,id,'guide')}><em>Full control</em><b><i className="ti ti-route"></i>Step by step</b><span>You confirm each step. Best for detailed bank policies.</span></button>
      </div></>;
  case 'agree':{
    const t=E.tplOf(uc)||{};
    const rows=[['ti-briefcase','Job',t.t],['ti-book','Policy',uc.hasDocs!==false?'Your AML policy (3 documents)':'ThetaRay template'],['ti-school','Practice','1,000 closed alerts, until a round gains < 1%'],
      ['ti-tool','Fixes','Technical issues: Ray fixes and logs them'],['ti-lock','Held for you','Sanctions & risk thresholds, anything about filing','you'],['ti-signature','You sign','The final approval — nothing goes live without you','you']];
    return <><Hd t="Rules we agree once"/>
      <div className="kv">{rows.map(r=><div key={r[1]} className={'r'+(r[3]?' you':'')}><i className={'ti '+r[0]}></i><span className="k">{r[1]}</span><span className="v">{r[2]}</span></div>)}</div>
      {!done&&<Btns><button className="st-btn ai" onClick={()=>E.agree(uc,id)}><i className="ti ti-check"></i>Agree &amp; start</button><button className="st-btn ghost" onClick={()=>E.agree(uc,id,true)}>Go step by step instead</button></Btns>}</>;}
  case 'setup':{
    const su=uc.setup||{docs:true,report:'predefined'};
    return <><Hd t="Ray will use"/>
      <div className="kv">
        <div className="r"><i className="ti ti-book"></i><span className="k">Policy</span><span className="v"><div className="seg2"><button className={su.docs?'on':''} onClick={()=>E.setSetup(uc,'docs',true)}>Your documents</button><button className={!su.docs?'on':''} onClick={()=>E.setSetup(uc,'docs',false)}>ThetaRay template</button></div></span></div>
        <div className="r"><i className="ti ti-file-text"></i><span className="k">Report</span><span className="v"><div className="seg2"><button className={su.report==='predefined'?'on':''} onClick={()=>E.setSetup(uc,'report','predefined')}>Predefined</button><button className={su.report==='upload'?'on':''} onClick={()=>E.setSetup(uc,'report','upload')}>Your layout</button></div></span></div>
      </div>
      {su.docs&&<label className="drop"><i className="ti ti-cloud-upload"></i><span>Drop your policy files here — or use our <b>3 sample documents</b></span><input type="file" multiple hidden onChange={()=>E.setupGo(uc,id)}/></label>}
      <Btns><button className="st-btn pri" onClick={()=>E.setupGo(uc,id)}><i className="ti ti-wand"></i>Build version 1</button></Btns></>;}
  case 'policy':
    return <><Hd t="Your policy"/><Btns><button className="st-btn pri sm" disabled={done} onClick={()=>E.policyChoice(uc,id,'sample')}>Use sample policy</button><button className="st-btn sm" disabled={done} onClick={()=>E.policyChoice(uc,id,'skip')}>Use the template</button></Btns></>;
  case 'report':
    return <><Hd t="Report"/><Btns><button className="st-btn pri sm" disabled={done} onClick={()=>E.reportChoice(uc,id,'predefined')}>Predefined</button><button className="st-btn sm" disabled={done} onClick={()=>E.reportChoice(uc,id,'upload')}>Your layout</button></Btns></>;
  case 'read':
    return <div className="files">{uc.files.map(f=><div key={f.name} className="sfile"><span className="ext" style={{background:f.c}}>{f.ext}</span>
      <div className="nm"><b>{f.name}</b><span>{f.pct>=100?'Found '+f.found:'Reading…'}</span>{f.pct<100&&<div className="sprog"><i style={{width:f.pct+'%'}}></i></div>}</div>{f.pct>=100&&<i className="ti ti-circle-check ok"></i>}</div>)}</div>;
  case 'progress':
    return <div className="stps">{c.steps.map((s,i)=><Stp key={s} i={i} label={s} st={i<c.at||done?'ok':i===c.at?'run':''}/>)}</div>;
  case 'change':
    return <>
      <div className="diff"><div className="a"><span className="lb">Before</span><span>{c.diff[0]}</span></div><div className="b"><span className="lb">Now</span><span>{c.diff[1]}</span></div></div>
      <div className="proof"><i className="ti ti-shield-check"></i><div>{c.generic?<>Added as an instruction — <b>practice on your real alerts will show if it helps</b>.</>:<>Backed by <b>§{c.clause.no} {c.clause.t}</b> · {c.clause.src}</>}</div></div>
      <Btns><button className="st-btn sm" onClick={()=>E.undo(uc)}><i className="ti ti-arrow-back-up"></i>Undo</button>
        <button className="st-btn ghost sm" onClick={()=>E.say(uc,'Why?')}>Why?</button>
        <button className="st-btn ghost sm" onClick={()=>E.pulse(uc,E.cur(uc).changed,'workflow')}>Show me</button></Btns></>;
  case 'sign':{
    const v=E.cur(uc)?E.cur(uc).n:1;
    const lines={build:['Locks version '+v+' as the starting point','Generates the MRM document and user guide','Touches no real alert'],
      train:['Version '+v+' becomes the tuned baseline','Next: Prove, on live alerts with no effect','Touches no real alert'],
      operate:['New alerts follow version '+v,'Starting authority: '+D.AUTHORITY.find(a=>a.id===uc.operate.auth).t,'Roll back in one tap, anytime']}[c.what];
    return <><Hd t={{build:'Sign off Build',train:'Sign off Train',operate:'Go live'}[c.what]}/>
      <div className="stps">{lines.map((l,i)=><Stp key={l} i={i} label={l} st="ok"/>)}</div>
      {done?<Signed c={c}/>:<Btns><button className={'st-btn '+(c.what==='operate'?'ai':'ok')} onClick={()=>E.sign(uc,id,c.what)}><i className={'ti '+(c.what==='operate'?'ti-player-play':'ti-signature')}></i>{c.what==='operate'?'Sign & go live':'Approve & sign'}</button>
        {c.what==='build'&&<button className="st-btn ghost" onClick={()=>{E.doneCard(uc,id,'Kept refining');uc.step='b.refine';E.emit();}}>Keep refining</button>}</Btns>}</>;}
  case 'handoff':
    return <><Hd t="Who runs Train?"/><div className="opts two">
      <button className="opt" disabled={done} onClick={()=>E.handoff(uc,id,'me')}><b><U.Av who="you"/>Me</b><span>Continue right now.</span></button>
      <button className="opt" disabled={done} onClick={()=>E.handoff(uc,id,'dana')}><em>Usual owner</em><b><U.Av who="dana"/>Dana Levi</b><span>Analyst team lead. Gets the full context.</span></button></div></>;
  case 'nudge':
    return <Btns><button className="st-btn sm" disabled={done} onClick={()=>{E.log(uc,'Nudged Dana Levi','you','you');E.logMsg(uc,'Nudge sent to Dana','ti-bell');}}><i className="ti ti-bell"></i>Nudge Dana</button>
      <button className="st-btn ghost sm" disabled={done} onClick={()=>E.takeBack(uc,id)}>Do it myself</button></Btns>;
  case 'tdata':
    return <><Hd t="Practice cases"/>
      <div className="kv">
        <div className="r"><i className="ti ti-calendar"></i><span className="k">Period</span><span className="v"><div className="seg2">{['Last 3 months','Last 6 months','Last 12 months'].map(o=><button key={o} className={uc.train.period===o?'on':''} onClick={()=>E.setTrain(uc,'period',o)}>{o.replace('Last ','')}</button>)}</div></span></div>
        <div className="r"><i className="ti ti-stack-2"></i><span className="k">Alerts</span><span className="v"><div className="seg2">{['500 alerts','1,000 alerts','All 2,140 alerts'].map(o=><button key={o} className={uc.train.size===o?'on':''} onClick={()=>E.setTrain(uc,'size',o)}>{o.replace(' alerts','')}</button>)}</div></span></div>
      </div>
      <Btns><button className="st-btn pri" onClick={()=>E.startReplay(uc,id,false)}><i className="ti ti-player-play"></i>Start practice</button>
        <button className="st-btn ghost sm" onClick={()=>E.startReplay(uc,id,true)}>Use a labeled CSV</button></Btns></>;
  case 'replay':
    return <><Hd t={'Practice round '+c.round} right={<b style={{color:'var(--t-ok)',fontSize:13,textTransform:'none',letterSpacing:0}}>{c.agree}% agree</b>}/>
      <div style={{fontSize:12.5,color:'var(--ink-2)'}}>{c.cnt.toLocaleString()} of {c.n.toLocaleString()} alerts replayed</div>
      <div className="sprog ai"><i style={{width:(c.cnt/c.n*100)+'%'}}></i></div></>;
  case 'sugs':return <Sugs uc={uc} m={m}/>;
  case 'round':
    return <Btns><button className="st-btn pri" disabled={done} onClick={()=>E.round(uc,id,true)}><i className="ti ti-refresh"></i>Run round {uc.train.rounds.length+1}</button>
      <button className="st-btn ghost" disabled={done} onClick={()=>E.round(uc,id,false)}>Sign off now</button></Btns>;
  case 'autorun':
    return <><Hd t="Autopilot" right={!done&&<span className="st-pill ai">Working</span>}/>
      <div className="stps">{c.steps.map((s,i)=><Stp key={s} i={i} label={s} note={c.notes[i]} st={i<c.at||done?'ok':i===c.at?'run':''}/>)}</div></>;
  case 'handback':{const s=c.sug;const n=E.cur(uc).wf.nodes.find(x=>x.id===s.node);
    return <><Hd t="Held for you" right={<span className="st-pill risk">{s.imp} impact</span>}/>
      <div className="sug-t">{s.t}</div>
      <div className="diff"><div className="a"><span className="lb">Today</span><span>{s.cur}</span></div><div className="b"><span className="lb">Ray</span><span>{s.sug}</span></div></div>
      <Evidence s={s} where={n?n.t:null}/>
      {!done&&<Btns><button className="st-btn ok sm" onClick={()=>E.handback(uc,id,true)}>Accept change</button><button className="st-btn sm" onClick={()=>E.handback(uc,id,false)}>Keep my rule</button></Btns>}</>;}
  case 'final':{const r=uc.train.rounds;
    const items=['Read your policy — '+uc.policy.length+' clauses, each linked to its source','Used the predefined report layout','Built and tuned the workflow to version '+c.ver,
      'Practiced '+r.length+' rounds: '+r.map(x=>x.agree+'%').join(' → '),'Fixed 2 technical issues, applied '+c.acc+' of 5 improvements','Held 1 rule for you — your decision is recorded'];
    return <><Hd t="What I did"/>
      <div className="stps">{items.map((it,i)=><Stp key={it} i={i} label={it} st="ok"/>)}</div>
      <div className="proof"><i className="ti ti-shield-check"></i><div>Every action is in <b>History</b>, versioned and reversible. No real alert was touched.</div></div>
      {done?<Signed c={c}/>:<Btns><button className="st-btn ok" onClick={()=>E.finalSign(uc,id)}><i className="ti ti-signature"></i>Approve &amp; sign</button></Btns>}</>;}
  case 'shadow':
    return <><Hd t="Shadow run"/>
      <div className="kv">
        <div className="r"><i className="ti ti-calendar"></i><span className="k">Length</span><span className="v"><div className="seg2">{['2 weeks','4 weeks','6 weeks'].map(d=><button key={d} className={uc.prove.dur===d?'on':''} onClick={()=>E.setProve(uc,'dur',d)}>{d}</button>)}</div></span></div>
        <div className="r"><i className="ti ti-percentage"></i><span className="k">New alerts</span><span className="v"><div className="seg2">{['25%','50%','100%'].map(p=><button key={p} className={uc.prove.cov.startsWith(p)?'on':''} onClick={()=>E.setProve(uc,'cov',p+' of new alerts')}>{p}</button>)}</div></span></div>
        <div className="r"><i className="ti ti-target-arrow"></i><span className="k">To pass</span><span className="v">Agreement ≥ 85% · escalations caught ≥ 95% · 0 missed SARs</span></div>
      </div>
      <Btns><button className="st-btn ai" onClick={()=>E.startShadow(uc,id)}><i className="ti ti-player-play"></i>Start shadow run</button></Btns></>;
  case 'shadowrun':{const p=uc.prove,f=Math.min(1,p.day/p.total);
    return <><Hd t={'Day '+p.day+' of '+p.total} right={<span className="st-pill ai">No effect on alerts</span>}/>
      <div className="sbar"><i style={{width:(f*100)+'%'}}></i></div>
      <div className="mini">
        <div className="k"><b>{Math.round(4100*f).toLocaleString()}</b><span>alerts</span></div>
        <div className="k"><b style={{color:'var(--t-ok)'}}>{p.day?'91%':'—'}</b><span>agreement</span></div>
        <div className="k"><b style={{color:'var(--t-ok)'}}>{p.day?'98%':'—'}</b><span>escalations caught</span></div>
        <div className="k"><b>0</b><span>alerts changed</span></div></div>
      {!done&&<Btns><button className="st-btn sm" onClick={()=>E.fastForward(uc)}><i className="ti ti-player-track-next"></i>Skip to the end (demo)</button></Btns>}</>;}
  case 'approvals':{
    const ppl=[['mlro','Sarah Klein','MLRO'],['fcc','Lior Ben-Ami','Head of Financial Crime Compliance']];
    return <><Hd t="Sign-off" right={<span className="st-pill ok">3 of 3 targets met</span>}/>
      <div className="files">{ppl.map(p=><div key={p[0]} className="sfile"><U.Av who={p[0]}/><div className="nm"><b>{p[1]}</b><span>{p[2]}</span></div>
        {uc.prove.signed[p[0]]?<span className="st-pill ok"><i className="ti ti-signature"></i>Signed {uc.prove.signed[p[0]]}</span>:c.requested?<span className="st-pill warn">Waiting…</span>:<span className="st-pill">Not asked yet</span>}</div>)}</div>
      {!done&&!c.requested&&<Btns><button className="st-btn pri" onClick={()=>E.requestSignoff(uc,id)}><i className="ti ti-send"></i>Request both signatures</button></Btns>}</>;}
  case 'checklist':
    return <><Hd t="Go-live checklist"/>
      {D.CHECKLIST.map((it,i)=>{const st=uc.operate.chk[i];return(
        <div key={i} className={'chk'+(st?' on':' todo')} onClick={()=>!done&&E.toggleCheck(uc,id,i)}><span className="bx">{st&&<i className="ti ti-check"></i>}</span>{it.t}
          <span className="by">{st==='ray'?'✦ proven by Ray':st==='you'?'you':'tap to confirm'}</span></div>);})}</>;
  case 'authority':
    return <><Hd t="Starting authority"/><div className="opts">{D.AUTHORITY.map((a,i)=><button key={a.id} className="opt" disabled={done} onClick={()=>E.pickAuth(uc,id,a.id)}>{i===0&&<em>Recommended to start</em>}<b><i className={'ti '+a.ic}></i>{a.t}</b><span>{a.d}</span></button>)}</div></>;
  case 'comment':
    return <><div className="proof" style={{marginTop:0}}><U.Av who={c.who}/><div><b>{P(c.who).n}</b> · {P(c.who).r}<br/>“{c.text}”</div></div>
      {!done&&<Btns><button className="st-btn ok sm" onClick={()=>E.applyComment(uc,id,true)}><i className="ti ti-check"></i>Apply it</button><button className="st-btn sm" onClick={()=>E.applyComment(uc,id,false)}>Discuss</button></Btns>}</>;
  default:return null;
  }
}

/* evidence line with drill-down into the alerts behind a claim */
function Evidence({s,where}){
  const [open,setOpen]=useState(false);
  const n=parseInt((s.ev.match(/\d+/)||['3'])[0]);
  const rows=Array.from({length:Math.min(3,n)}).map((_,i)=>['A-'+(21000+((s.id.charCodeAt(1)*97+i*131)%900)),i%2?'Escalated':'Closed',i%2?'Closed':'Escalated']);
  return <>
    <div className="evb"><i className="ti ti-chart-dots"></i><span>{s.ev}{where?' · step “'+where+'”':''} · <button onClick={()=>setOpen(o=>!o)}>{open?'Hide':'See the '+n+' alerts'}</button></span></div>
    {open&&<table className="stbl"><thead><tr><th>Alert</th><th>Analyst</th><th>Ray before</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td className="code">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}
      {n>3&&<tr><td colSpan="3" style={{color:'var(--ink-3)'}}>+ {n-3} more in Evidence</td></tr>}</tbody></table>}</>;
}

/* suggestions: one at a time */
function Sugs({uc,m}){
  const c=m.card,id=m.id;
  const [tOpen,setT]=useState(false);
  const list=E.tuneSet(uc),tech=list.filter(s=>s.cat==='bug'||s.cat==='data'),judg=list.filter(s=>!(s.cat==='bug'||s.cat==='data'));
  const idx=judg.findIndex(s=>!uc.train.sugs[s.id]);
  if(c.done||idx<0)return <><Hd t="Suggestions"/><div className="stps">{judg.map(x=><div key={x.id} className="stp ok"><span className="ic">{uc.train.sugs[x.id]==='yes'?<i className="ti ti-check"></i>:<i className="ti ti-x"></i>}</span>{x.t}<span className="nt">{uc.train.sugs[x.id]==='yes'?'Accepted':'Rejected'}</span></div>)}</div></>;
  const s=judg[idx];
  return <>
    <Hd t={'Suggestion '+(idx+1)+' of '+judg.length} right={<div className="pager">{judg.map((x,i)=><i key={x.id} className={uc.train.sugs[x.id]==='yes'?'yes':uc.train.sugs[x.id]==='no'?'no':i===idx?'on':''}></i>)}</div>}/>
    <div style={{display:'flex',gap:6,marginBottom:4}}><span className={'st-pill '+D.TUNE_CAT[s.cat][1]}>{D.TUNE_CAT[s.cat][0]}</span><span className={'st-pill '+(s.imp==='High'?'risk':'warn')}>{s.imp} impact</span></div>
    <div className="sug-t">{s.t}</div>
    <div className="diff"><div className="a"><span className="lb">Today</span><span>{s.cur}</span></div><div className="b"><span className="lb">Ray</span><span>{s.sug}</span></div></div>
    <Evidence key={s.id} s={s}/>
    <Btns><button className="st-btn ok" onClick={()=>E.decide(uc,id,s.id,true)}><i className="ti ti-check"></i>Accept</button><button className="st-btn" onClick={()=>E.decide(uc,id,s.id,false)}>Reject</button>
      <span style={{flex:1}}></span><button className="st-btn ghost sm" onClick={()=>E.acceptAll(uc,id)}>Accept all</button></Btns>
    <div className="st-rc" style={{marginTop:12}} onClick={()=>setT(o=>!o)}><i className="ti ti-tool ok"></i><span><b>{tech.length} technical fixes</b> already applied by Ray</span><span className="sp"></span><i className={'ti ex '+(tOpen?'ti-chevron-up':'ti-chevron-down')}></i></div>
    {tOpen&&<div className="stps" style={{padding:'10px 4px 0'}}>{tech.map(x=><div key={x.id} className="stp ok"><span className="ic"><i className="ti ti-check"></i></span>{x.t}</div>)}</div>}
  </>;
}
U.Card=Card;

/* ---------- living package ---------- */
const NW=184,GAP=22,NH=60;
function Flow({uc,onNode}){
  const v=E.cur(uc);
  const ref=useRef(null);const [cw,setCw]=useState(0);
  const narrow=cw>0&&cw<520;
  useEffect(()=>{if(!ref.current||!window.ResizeObserver)return;const ro=new ResizeObserver(e=>setCw(e[0].contentRect.width));ro.observe(ref.current);return()=>ro.disconnect();},[!!v,narrow]);
  useEffect(()=>{if(!ref.current||!uc.pulse.ids.length)return;const el=ref.current.querySelector('[data-nid="'+uc.pulse.ids[uc.pulse.ids.length-1]+'"]');const sc=ref.current.closest('.pbody');
    if(el&&sc){const top=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop;sc.scrollTop=Math.max(0,top-sc.clientHeight/2+40);}},[uc.pulse.t]);
  if(!v)return null;
  const wf=v.wf,fresh=Date.now()-uc.pulse.t<3500;
  const cls=n=>'nd'+(v.changed.includes(n.id)?' chg':'')+(fresh&&uc.pulse.ids.includes(n.id)?(uc.pulse.fresh?' new':' pulse'):'');
  const inner=n=>{const k=D.KIND[n.k]||D.KIND.user;return <>
    <div className="h"><span className="ni" style={{background:k[1]+'1f',color:k[1]}}><i className={'ti '+k[0]}></i></span><span className="nt">{n.t}</span>{n.ai&&<span className="ai" title="Ray decides or drafts with AI"></span>}</div>
    <div className="nm"><span>{n.role} · {n.sla}</span>{n.pol&&<span className="pol">§{n.pol}</span>}</div>
    {n.tuned?<div className="why">Tuned: {n.tuned}</div>:v.changed.includes(n.id)?<div className="why">Changed in v{v.n}{n.note?': '+n.note:''}</div>:null}</>;};
  if(narrow){
    const order=[...wf.nodes].sort((a,b)=>a.r-b.r||a.c-b.c);
    return <div className="flowwrap" ref={ref}><div className="vlist">{order.map(n=>{
      const outs=wf.edges.filter(e=>e[0]===n.id&&e[2]).map(e=>{const t=wf.nodes.find(x=>x.id===e[1]);return t?e[2]+' → '+t.t:null;}).filter(Boolean);
      return <div key={n.id} data-nid={n.id} className={cls(n)+' v'} onClick={()=>onNode&&onNode(n)}>{inner(n)}{outs.map(o=><div key={o} className="br"><i className="ti ti-corner-down-right"></i>{o}</div>)}</div>;})}</div></div>;
  }
  const rows=wf.nodes.reduce((a,n)=>Math.max(a,n.r),0)+1;
  const nh=n=>{const lines=Math.min(3,Math.ceil(n.t.length/21));const why=n.tuned||v.changed.includes(n.id);return 20+Math.max(22,lines*16)+21+(why?(n.tuned&&n.tuned.length>30?36:22):0);};
  const rowH=Array.from({length:rows}).map((_,r)=>Math.max(NH,...wf.nodes.filter(n=>n.r===r).map(nh)));
  const rowY=rowH.reduce((acc,h,i)=>{acc.push(i?acc[i-1]+rowH[i-1]+52:0);return acc;},[]);
  const pos=n=>({x:n.c*(NW+GAP),y:rowY[n.r]});
  const W=3*NW+2*GAP,H=rowY[rows-1]+rowH[rows-1]+6;
  return <div className="flowwrap" ref={ref}>
    <div className="flow" style={{width:W,height:H}}>
      <svg width={W} height={H}>{wf.edges.map((e,i)=>{const a=wf.nodes.find(n=>n.id===e[0]),b=wf.nodes.find(n=>n.id===e[1]);if(!a||!b)return null;
        const p=pos(a),q=pos(b),x1=p.x+NW/2,y1=p.y+nh(a),x2=q.x+NW/2,y2=q.y;
        return <g key={i}><path d={`M${x1} ${y1} C${x1} ${y1+26},${x2} ${y2-26},${x2} ${y2-2}`}/>
          {e[2]&&<text x={x1===x2?x1+7:(x1+x2)/2} y={y1+(y2-y1)/2+3} textAnchor={x1===x2?'start':'middle'}>{e[2]}</text>}</g>;})}</svg>
      {wf.nodes.map(n=>{const p=pos(n);return <div key={n.id} data-nid={n.id} className={cls(n)} style={{left:p.x,top:p.y}} onClick={()=>onNode&&onNode(n)} title="Tap to talk to Ray about this step">{inner(n)}</div>;})}
    </div>
    <div className="legend"><span><span className="ai"></span>Ray decides with AI</span><span><b style={{color:'var(--t-act)'}}>§</b> Your policy clause</span><span><i className="ti ti-hand-finger"></i>Tap a step to talk about it</span></div>
  </div>;
}
function Rules({uc}){
  return <>{uc.hasDocs&&uc.files.length>0&&<div className="sect"><i className="ti ti-files"></i>{uc.files.length} documents · {uc.policy.length} clauses</div>}
    {uc.policy.map(c=><div key={c.no} className={'cl'+(uc.lastChange&&uc.lastChange.clause.no===c.no?' hl':'')}>
      <div className="h"><span className="no">§{c.no}</span>{c.t}</div><p>{c.p}</p><div className="s"><i className="ti ti-paperclip"></i>{c.src}</div></div>)}</>;
}
function Report({uc}){
  return <div className="sdoc"><div className="dh"><i className="ti ti-file-text" style={{fontSize:20,color:'var(--ink-3)'}}></i><b>Investigation report</b><span className="st-pill">{uc.report==='upload'?'Your layout':'Predefined'}</span></div>
    {D.REPORT.map((r,i)=><div key={r.h} className="ds"><h5>{i+1}. {r.h}</h5><p>{r.p}</p><div className="ln" style={{width:(92-i*7)+'%'}}></div></div>)}</div>;
}
function Evid({uc}){
  const r=uc.train.rounds,p=uc.prove,live=uc.operate.live;
  const kp=(v,l,tg)=><div className="kp"><b>{v}</b><span>{l}</span>{tg&&<span className="tg">{tg}</span>}</div>;
  return <>
    {live&&<><div className="livebar"><span className="p"></span>Live · version {E.cur(uc).n} · {D.AUTHORITY.find(a=>a.id===uc.operate.auth).t}<span className="sp"></span><button className="st-btn sm" onClick={()=>E.rollback(uc)}><i className="ti ti-arrow-back-up"></i>Roll back</button></div>
      <div className="kp4">{kp('3,912','alerts, last 7 days')}{kp('31%','closed by Ray')}{kp('3.1 h','avg. time to decision')}{kp('0','SLA breaches')}</div></>}
    {p.day>0&&<div className="pn"><h5><i className="ti ti-eye-check" style={{color:'var(--violet2)'}}></i>Prove · shadow run<span className="sp"></span><span className="st-pill">Day {p.day} of {p.total}</span></h5>
      <div className="sbar"><i style={{width:(p.day/p.total*100)+'%'}}></i></div>
      <div className="kp4">{kp(Math.round(4100*Math.min(1,p.day/p.total)).toLocaleString(),'alerts')}{kp('91%','agreement','target 85% · met')}{kp('98%','escalations caught','target 95% · met')}{kp('0','missed SARs','target 0 · met')}</div>
      <table className="stbl"><thead><tr><th>Alert</th><th>Analysts</th><th>Ray</th><th>Why</th></tr></thead><tbody>{D.SHADOW_DIFFS.map(d=><tr key={d[0]}><td className="code">{d[0]}</td><td>{d[1]}</td><td><b>{d[2]}</b></td><td style={{color:'var(--ink-2)'}}>{d[3]}</td></tr>)}</tbody></table></div>}
    {r.length>0&&<div className="pn"><h5><i className="ti ti-school" style={{color:'var(--act)'}}></i>Train · Ray vs. your analysts</h5>
      <div className="kp4">{kp(r[r.length-1].agree+'%','agreement')}{kp('34%','false positives Ray closes')}{kp(r.length>1?'0':'2','escalations missed')}{kp('2.1 min','per decision')}</div>
      <div className="rounds">{r.map(x=><div key={x.n} className="r"><b>{x.agree}%</b><i style={{height:((x.agree-70)*3.6)+'px'}}></i><span>Round {x.n}</span></div>)}</div>
      <table className="stbl" style={{marginTop:14}}><thead><tr><th>Alert</th><th>Analyst</th><th>Ray</th><th>Why Ray differs</th></tr></thead><tbody>{D.DIFFS.map(d=><tr key={d[0]}><td className="code">{d[0]}</td><td>{d[1]}</td><td><b>{d[2]}</b></td><td style={{color:'var(--ink-2)'}}>{d[3]}</td></tr>)}</tbody></table></div>}
  </>;
}
const isDecision=t=>t.kind==='sign'||/^(Accepted|Rejected|Agreed|Chose|Signed|Requested|Starting authority|Go-live|GO LIVE|Handed|Rolled back)/i.test(t.text);
const isChange=t=>/^v\d+:|Drafted|Applied|Added|Restored|fixes/i.test(t.text);
function History({uc}){
  const [f,setF]=useState('all');
  const F=[['all','All'],['dec','Decisions'],['chg','Changes'],['ray','By Ray']];
  const match=(t,k)=>k==='all'||(k==='dec'&&isDecision(t))||(k==='chg'&&isChange(t))||(k==='ray'&&t.who==='ray');
  const list=uc.trail.filter(t=>match(t,f));
  const icon={sign:'ti-signature',ray:'ti-sparkles',you:'ti-user'};
  const download=()=>{
    const rows=[['Time','Who','Role','Version','Action']].concat([...uc.trail].reverse().map(t=>[t.at,P(t.who).n,P(t.who).r,t.ver,t.text]));
    const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download=uc.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase()+'_audit_trail.csv';document.body.appendChild(a);a.click();a.remove();
    E.log(uc,'Downloaded the audit trail for the auditor','you','you');E.emit();
  };
  return <>
    <div className="hist-top"><div className="seg2">{F.map(([k,l])=><button key={k} className={f===k?'on':''} onClick={()=>setF(k)}>{l} <span style={{opacity:.6}}>{uc.trail.filter(t=>match(t,k)).length}</span></button>)}</div>
      <span className="sp"></span><button className="st-btn sm" onClick={download}><i className="ti ti-download"></i>Download for auditor</button></div>
    {uc.versions.length>0&&<div className="vers">{uc.versions.map(v=><button key={v.n} className={v.n===E.cur(uc).n?'on':''} title={v.summary} onClick={()=>v.n!==E.cur(uc).n&&E.restore(uc,v.n)}>v{v.n}{v.n===E.cur(uc).n?' · current':' · restore'}</button>)}</div>}
    {list.length?<div className="trl">{list.map(t=><div key={t.id} className={'tr '+t.kind}><span className="ic"><i className={'ti '+(icon[t.kind]||'ti-point')}></i></span>
      <div className="w">{t.text}<span>{P(t.who).n} · {t.at}</span></div><span className="v">{t.ver}</span></div>)}</div>
      :<div className="st-empty" style={{minHeight:200}}><i className="ti ti-history"></i><b>Nothing here yet</b><span>Every choice, change and signature is recorded — it can’t be edited or deleted.</span></div>}
  </>;
}
U.tabsFor=uc=>{
  const t=[];
  if(uc.versions.length)t.push(['workflow','How Ray works','ti-git-branch']);
  if(uc.policy.length)t.push(['policy','Your rules','ti-book']);
  if(uc.report)t.push(['report','Report','ti-file-text']);
  if(uc.train.rounds.length||uc.prove.day||uc.operate.live)t.push(['results','Evidence','ti-chart-bar']);
  if(t.length)t.push(['trail','History','ti-history']);
  return t;
};
U.Package=function({uc,onNode,open,onClose}){
  const tabs=U.tabsFor(uc);
  const tab=tabs.find(t=>t[0]===uc.tab)?uc.tab:(tabs[0]||[])[0];
  const v=E.cur(uc);
  return <div className={'pkg'+(open?' open':'')}>
    {tabs.length>0&&<div className="ptabs">{tabs.map(t=><button key={t[0]} className={'ptab'+(tab===t[0]?' on':'')} onClick={()=>E.setTab(uc,t[0])}><i className={'ti '+t[2]}></i>{t[1]}</button>)}
      <span className="sp"></span>{v&&<span className="ver"><i className="ti ti-git-commit"></i>v{v.n} · {v.at}</span>}</div>}
    <button className="st-ib sheet-x" onClick={onClose} title="Close"><i className="ti ti-x"></i></button>
    <div className="pbody">
      {!tabs.length&&<div className="st-empty"><i className="ti ti-package"></i><b>Your use case appears here as you talk</b><span>Ray builds it like onboarding a new investigator — four simple stages, and you sign each one.</span>
        <div className="steps4">{D.STAGES.map(s=><div key={s.k}><b><span className="st-dot" style={{'--c':s.c}}></span>{s.t}</b><span>{s.sub}</span></div>)}</div></div>}
      {tab==='workflow'&&<Flow uc={uc} onNode={onNode}/>}
      {tab==='policy'&&<Rules uc={uc}/>}
      {tab==='report'&&<Report uc={uc}/>}
      {tab==='results'&&<Evid uc={uc}/>}
      {tab==='trail'&&<History uc={uc}/>}
    </div>
  </div>;
};
})();
