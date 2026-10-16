/* Ray Studio — UI part 1: chat cards + living package (text/babel) */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,E=window.RSE;
const U=window.RSU=window.RSU||{};

U.md=(t)=>{if(!t)return null;
  const parts=String(t).split('\n');
  return parts.map((line,li)=>{
    const out=[];let rest=line,k=0;
    const re=/\*\*(.+?)\*\*|\*(.+?)\*/;let m;
    while((m=re.exec(rest))){if(m.index)out.push(rest.slice(0,m.index));
      out.push(m[1]!==undefined?<b key={k++}>{m[1]}</b>:<em key={k++}>{m[2]}</em>);rest=rest.slice(m.index+m[0].length);}
    out.push(rest);
    return <React.Fragment key={li}>{li>0&&<br/>}{out}</React.Fragment>;
  });
};
const P=(who)=>D.PEOPLE[who]||D.PEOPLE.you;
U.Av=({who})=><span className={'st-av '+(who==='ray'?'ray':who==='you'?'you':'')} title={P(who).n+' · '+P(who).r}>{P(who).i}</span>;
const Sign=({uc,label})=><div className="st-sign"><i className="ti ti-signature"></i><div><b>{label||'Signed by you · Compliance lead'}</b><span>{E.now()} · version {E.cur(uc)?E.cur(uc).n:1} · logged in the trail</span></div></div>;
const Chosen=({c})=>c?<div className="chosen"><i className="ti ti-check"></i>{c}</div>:null;

/* ---------- cards ---------- */
function Card({uc,m,onBrowse}){
  const c=m.card,done=!!c.done,id=m.id;
  const wrap=(title,icon,body)=><div className={'st-card'+(done?' done':'')}>{title&&<h4><i className={'ti '+icon}></i>{title}</h4>}{body}</div>;
  switch(c.type){
  case 'tpl':{
    const recs=['ts-example','ts-uk','tm-retail','pep-am'].map(i=>D.TEMPLATES.find(t=>t.id===i));
    return wrap('Pick a job','ti-briefcase',<>
      {done?<Chosen c={c.choice}/>:<>
      <div className="st-opts two">{recs.map(t=>{const cat=D.CATS[t.cat];return(
        <button key={t.id} className="st-opt" onClick={()=>E.pickTpl(uc,id,t.id)}>
          <b><i className={'ti '+cat.ic} style={{color:cat.c}}></i>{t.t}</b><span>{t.d}</span>{t.ex&&<em>Real-world example</em>}</button>);})}</div>
      <div className="acts"><button className="st-chip" onClick={()=>onBrowse&&onBrowse(tid=>E.pickTpl(uc,id,tid))}><i className="ti ti-layout-grid"></i>Browse all {D.TEMPLATES.length} jobs</button></div></>}</>);}
  case 'mode':
    return wrap('How hands-on?','ti-steering-wheel',done?<Chosen c={c.choice}/>:
      <div className="st-opts two">
        <button className="st-opt rec" onClick={()=>E.pickMode(uc,id,'auto')}><em>Fastest</em><b><i className="ti ti-sparkles" style={{color:'var(--t-violet)'}}></i>Autopilot</b><span>You decide 3 times — the job, the rules, the final approval. I do the policy, report, refining and tuning.</span></button>
        <button className="st-opt" onClick={()=>E.pickMode(uc,id,'guide')}><em>Full control</em><b><i className="ti ti-route" style={{color:'var(--t-act)'}}></i>Guide me</b><span>We go step by step and you approve each one. Best for detailed bank policies.</span></button>
      </div>);
  case 'agree':{
    const t=E.tplOf(uc)||{};
    const rows=[['ti-briefcase','Job',t.t],['ti-book','Manual',uc.hasDocs!==false?'Your AML policy (3 documents)':'ThetaRay template'],['ti-file-text','Report','ThetaRay predefined layout'],
      ['ti-adjustments','Refining','I draft it myself — practice on your real alerts gives better feedback, with evidence'],['ti-database','Practice data','Last 6 months · 1,000 closed alerts'],
      ['ti-player-stop','Stop rule','I rerun until a round gains less than 1%'],['ti-tool','Technical fixes','I fix code and data issues myself and log each one'],
      ['ti-lock','I’ll hold','Sanctions & risk thresholds, anything about filing — I ask you','you'],['ti-signature','You sign','The final approval. Nothing goes live without you.','you']];
    return wrap('The rules we agree once','ti-file-certificate',<>
      <div className="st-agree">{rows.map(r=><div key={r[1]} className={'r'+(r[3]?' you':'')}><i className={'ti '+r[0]}></i><span className="k">{r[1]}</span><span className="v">{r[2]}</span></div>)}</div>
      {done?<Chosen c={c.choice}/>:<div className="acts"><button className="st-btn ai" onClick={()=>E.agree(uc,id)}><i className="ti ti-check"></i>Agree &amp; start</button><button className="st-btn ghost" onClick={()=>E.agree(uc,id,true)}>Guide me instead</button></div>}</>);}
  case 'policy':
    return wrap('Your manual','ti-book',done?<Chosen c={c.choice}/>:<>
      <label className="st-drop"><i className="ti ti-cloud-upload"></i><b>Drop your policy &amp; procedures</b><br/>PDF, Word, Excel or Markdown
        <input type="file" multiple hidden onChange={()=>E.policyChoice(uc,id,'sample')}/></label>
      <div className="acts"><button className="st-btn pri sm" onClick={()=>E.policyChoice(uc,id,'sample')}><i className="ti ti-files"></i>Use our sample policy (3 files)</button><button className="st-btn sm" onClick={()=>E.policyChoice(uc,id,'skip')}>Skip — use the template</button></div></>);
  case 'read':
    return wrap(null,null,<div className="st-files">{uc.files.map(f=><div key={f.name} className="st-file"><span className="ext" style={{background:f.c}}>{f.ext}</span>
      <div className="nm"><b>{f.name}</b><span>{f.pct>=100?'Found '+f.found:'Reading…'}</span>{f.pct<100&&<div className="st-prog"><i style={{width:f.pct+'%'}}></i></div>}</div>{f.pct>=100&&<i className="ti ti-circle-check ok"></i>}</div>)}</div>);
  case 'report':
    return wrap('Investigation report','ti-file-text',done?<Chosen c={c.choice}/>:
      <div className="st-opts two">
        <button className="st-opt" onClick={()=>E.reportChoice(uc,id,'predefined')}><em>Recommended</em><b>Predefined layout</b><span>Built for this job by ThetaRay. Evidence table, decision, rationale and trail.</span></button>
        <button className="st-opt" onClick={()=>E.reportChoice(uc,id,'upload')}><b>Upload your own</b><span>Use your bank’s report template. I’ll map every section.</span></button>
      </div>);
  case 'progress':
    return wrap(null,null,<div className="st-steps">{c.steps.map((s,i)=>{const st=i<c.at||done?'ok':i===c.at?'run':'';return(
      <div key={s} className={'st-step '+st}><span className="ic">{st==='ok'?<i className="ti ti-check"></i>:st==='run'?<i className="ti ti-loader-2"></i>:i+1}</span>{s}</div>);})}</div>);
  case 'change':
    return wrap(null,null,<>
      <div className="st-diff"><span className="a">{c.diff[0]}</span><i className="ti ti-arrow-right"></i><span className="b">{c.diff[1]}</span></div>
      <div className="st-proof"><i className="ti ti-shield-check"></i><div>{c.generic?<>Added as an instruction. <b>Practice on your real alerts will show whether it helps</b> — I’ll bring evidence.</>:<>Backed by <b>§{c.clause.no} {c.clause.t}</b> — {c.clause.src}</>}</div></div>
      <div className="acts"><button className="st-btn sm" onClick={()=>E.undo(uc)} disabled={E.cur(uc).n!==c.ver}><i className="ti ti-arrow-back-up"></i>Undo</button>
        <button className="st-btn sm ghost" onClick={()=>E.say(uc,'Why?')}><i className="ti ti-help-circle"></i>Why?</button>
        <button className="st-btn sm ghost" onClick={()=>E.setTab(uc,'workflow')}><i className="ti ti-eye"></i>Show me</button>
        {uc.step==='b.refine'&&<button className="st-btn sm ok" onClick={()=>E.askApply(uc)}><i className="ti ti-check"></i>Looks good</button>}</div></>);
  case 'sign':{
    const v=E.cur(uc)?E.cur(uc).n:1;
    const lines={build:['Locks version '+v+' as the starting point','Generates the MRM document and analyst user guide','Touches no real alert'],
      train:['Version '+v+' becomes the tuned baseline','Next stage: Prove, on live alerts with no effect','Touches no real alert'],
      operate:['New alerts follow version '+v+' from now on','Starting authority: '+D.AUTHORITY.find(a=>a.id===uc.operate.auth).t,'Roll back in one tap, anytime']}[c.what];
    const title={build:'Sign off Build',train:'Sign off Train',operate:'Go live'}[c.what];
    return wrap(title,'ti-signature',<>
      <div className="st-steps">{lines.map(l=><div key={l} className="st-step ok"><span className="ic"><i className="ti ti-check"></i></span>{l}</div>)}</div>
      {done?<Sign uc={uc}/>:<div className="acts"><button className={'st-btn '+(c.what==='operate'?'ai':'ok')} onClick={()=>E.sign(uc,id,c.what)}><i className={'ti '+(c.what==='operate'?'ti-player-play':'ti-signature')}></i>{c.what==='operate'?'Sign & go live':'Approve & sign'}</button>
        {c.what==='build'&&<button className="st-btn ghost" onClick={()=>{E.doneCard(uc,id,'Kept refining');uc.step='b.refine';E.emit();}}>Keep refining</button>}</div>}</>);}
  case 'handoff':
    return wrap('Who runs Train?','ti-users',done?<Chosen c={c.choice}/>:
      <div className="st-opts two">
        <button className="st-opt" onClick={()=>E.handoff(uc,id,'me')}><b><U.Av who="you"/>I’ll do it</b><span>Small team? Continue right now.</span></button>
        <button className="st-opt" onClick={()=>E.handoff(uc,id,'dana')}><em>Usual owner</em><b><U.Av who="dana"/>Dana Levi</b><span>Analyst team lead — knows how alerts are decided. Gets full context.</span></button>
      </div>);
  case 'nudge':
    return wrap(null,null,done?<Chosen c={c.choice}/>:<div className="acts" style={{marginTop:0}}>
      <button className="st-btn sm" onClick={()=>{E.log(uc,'Nudged Dana Levi','you','you');E.logMsg(uc,'Nudge sent to Dana','ti-bell');}}><i className="ti ti-bell"></i>Nudge Dana now</button>
      <button className="st-btn sm ghost" onClick={()=>E.takeBack(uc,id)}>Take it back &amp; continue myself</button></div>);
  case 'tdata':{
    const ch=(k,opts)=><div className="acts" style={{marginTop:6}}>{opts.map(o=><button key={o} className={'st-chip'+(uc.train[k]===o?' ai':'')} disabled={done} onClick={()=>E.setTrain(uc,k,o)}>{o}</button>)}</div>;
    return wrap('Practice cases','ti-database',done?<Chosen c={c.choice}/>:<>
      <div style={{fontSize:11,fontWeight:800,color:'var(--ink-3)'}}>PERIOD</div>{ch('period',['Last 3 months','Last 6 months','Last 12 months'])}
      <div style={{fontSize:11,fontWeight:800,color:'var(--ink-3)',marginTop:8}}>HOW MANY</div>{ch('size',['500 alerts','1,000 alerts','All 2,140 alerts'])}
      <div className="acts"><button className="st-btn pri" onClick={()=>E.startReplay(uc,id,false)}><i className="ti ti-player-play"></i>Start practice</button>
        <button className="st-btn ghost sm" onClick={()=>E.startReplay(uc,id,true)}><i className="ti ti-upload"></i>Use a labeled CSV instead</button></div></>);}
  case 'replay':
    return wrap('Practice round '+c.round,'ti-school',<>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}><span>{c.done.toLocaleString()} / {c.n.toLocaleString()} alerts replayed</span><b style={{color:'var(--t-ok)'}}>{c.agree}% agree</b></div>
      <div className="st-prog"><i style={{width:(c.done/c.n*100)+'%'}}></i></div>{done&&<Chosen c={c.choice}/>}</>);
  case 'diffs':
    return wrap('Where we differed','ti-git-compare',<table className="st-tbl"><thead><tr><th>Alert</th><th>Analyst</th><th>Ray</th><th>Why</th></tr></thead>
      <tbody>{D.DIFFS.map(r=><tr key={r[0]}><td className="code">{r[0]}</td><td>{r[1]}</td><td><b>{r[2]}</b></td><td style={{color:'var(--ink-2)'}}>{r[3]}</td></tr>)}</tbody></table>);
  case 'sugs':{
    const list=E.tuneSet(uc);const tech=list.filter(s=>s.cat==='bug'||s.cat==='data');const judg=list.filter(s=>!(s.cat==='bug'||s.cat==='data'));
    return wrap('Ray’s suggestions','ti-bulb',<>
      {tech.map(s=><div key={s.id} className="st-sug auto yes"><div className="h"><span className={'st-pill '+D.TUNE_CAT[s.cat][1]}>{D.TUNE_CAT[s.cat][0]}</span>{s.t}<span className="sp"></span><span className="st-pill ok"><i className="ti ti-check"></i>Fixed by Ray</span></div></div>)}
      {judg.map(s=>{const st=uc.train.sugs[s.id];return(
        <div key={s.id} className={'st-sug'+(st==='yes'?' yes':st==='no'?' no':'')}>
          <div className="h"><span className={'st-pill '+D.TUNE_CAT[s.cat][1]}>{D.TUNE_CAT[s.cat][0]}</span>{s.t}<span className="sp"></span><span className={'st-pill '+(s.imp==='High'?'risk':'warn')}>{s.imp}</span></div>
          <div className="st-diff" style={{marginTop:8}}><span className="a">{s.cur}</span><i className="ti ti-arrow-right"></i><span className="b">{s.sug}</span></div>
          <div className="ev"><i className="ti ti-chart-dots"></i><span><b>Evidence:</b> {s.ev}</span></div>
          {st?<Chosen c={st==='yes'?'Accepted':'Rejected'}/>:<div className="acts"><button className="st-btn sm ok" onClick={()=>E.decide(uc,id,s.id,true)}>Accept</button><button className="st-btn sm" onClick={()=>E.decide(uc,id,s.id,false)}>Reject</button></div>}
        </div>);})}
      {done?<Chosen c={c.choice}/>:<div className="acts"><button className="st-btn sm ai" onClick={()=>E.acceptAll(uc,id)}><i className="ti ti-checks"></i>Accept all remaining</button></div>}</>);}
  case 'round':
    return wrap(null,null,done?<Chosen c={c.choice}/>:<div className="acts" style={{marginTop:0}}>
      <button className="st-btn pri" onClick={()=>E.round(uc,id,true)}><i className="ti ti-refresh"></i>Run round {uc.train.rounds.length+1}</button>
      <button className="st-btn ghost" onClick={()=>E.round(uc,id,false)}>Sign off now</button></div>);
  case 'autorun':
    return wrap('Autopilot','ti-sparkles',<div className="st-steps">{c.steps.map((s,i)=>{const st=i<c.at||done?'ok':i===c.at?'run':'';return(
      <div key={s} className={'st-step '+st}><span className="ic">{st==='ok'?<i className="ti ti-check"></i>:st==='run'?<i className="ti ti-loader-2"></i>:i+1}</span>{s}{c.notes[i]&&<span className="who" style={{color:'var(--ink-3)'}}>{c.notes[i]}</span>}</div>);})}</div>);
  case 'handback':{const s=c.sug;const n=E.cur(uc).wf.nodes.find(x=>x.id===s.node);
    return wrap('Held for you: '+s.t,'ti-hand-stop',<>
      <div className="st-diff"><span className="a">{s.cur}</span><i className="ti ti-arrow-right"></i><span className="b">{s.sug}</span></div>
      <div className="st-proof"><i className="ti ti-chart-dots"></i><div><b>Evidence from your alerts:</b> {s.ev}.<br/><b>Where:</b> step “{n?n.t:'—'}” · <b>Why held:</b> you asked me to hold sanctions and risk thresholds.</div></div>
      {done?<Chosen c={c.choice}/>:<div className="acts"><button className="st-btn ok sm" onClick={()=>E.handback(uc,id,true)}>Accept change</button><button className="st-btn sm" onClick={()=>E.handback(uc,id,false)}>Keep my rule</button><button className="st-btn ghost sm" onClick={()=>E.pulse(uc,[s.node],'workflow')}><i className="ti ti-eye"></i>Show me</button></div>}</>);}
  case 'final':{const r=uc.train.rounds;
    const items=[['ti-book','Read your manual · '+uc.policy.length+' clauses, each linked to its source'],['ti-file-text','Used the predefined report layout'],['ti-git-branch','Drafted the workflow and tuned it to version '+c.ver],
      ['ti-school','Practiced '+r.length+' rounds on 1,000 closed alerts: '+r.map(x=>x.agree+'%').join(' → ')],['ti-tool','Fixed 2 technical issues (logged, reversible)'],['ti-bulb','Applied '+c.acc+' of 5 improvements, each with evidence'],['ti-lock','Held 1 rule for you — your decision is recorded']];
    return wrap('What I did, in plain words','ti-list-details',<>
      <div className="st-steps">{items.map(it=><div key={it[1]} className="st-step ok"><span className="ic"><i className={'ti '+it[0]}></i></span>{it[1]}</div>)}</div>
      <div className="st-proof"><i className="ti ti-shield-check"></i><div>Every action is in the <b>trail</b>, versioned and reversible — ready to hand to an auditor. No real alert was touched.</div></div>
      {done?<Sign uc={uc}/>:<div className="acts"><button className="st-btn ok" onClick={()=>E.finalSign(uc,id)}><i className="ti ti-signature"></i>Approve &amp; sign</button><button className="st-btn ghost" onClick={()=>E.setTab(uc,'trail')}>Open the trail</button></div>}</>);}
  case 'shadow':
    return wrap('Shadow run','ti-eye-check',done?<Chosen c={c.choice}/>:<>
      <div className="st-opts" style={{gridTemplateColumns:'repeat(3,1fr)'}}>{['2 weeks','4 weeks','6 weeks'].map(d=>
        <button key={d} className={'st-opt'+(uc.prove.dur===d?' sel':'')} onClick={()=>E.setProve(uc,'dur',d)}>{d==='4 weeks'&&<em>Recommended</em>}<b>{d}</b><span>{d==='2 weeks'?'Quick proof':d==='4 weeks'?'Most use cases':'Low volume'}</span></button>)}</div>
      <div className="acts" style={{marginTop:8}}>{['25%','50%','100%'].map(p=><button key={p} className={'st-chip'+(uc.prove.cov.startsWith(p)?' ai':'')} onClick={()=>E.setProve(uc,'cov',p+' of new alerts')}>{p} of new alerts</button>)}</div>
      <div className="st-proof"><i className="ti ti-target-arrow"></i><div><b>Targets to pass:</b> agreement ≥ 85% · escalation recall ≥ 95% · 0 missed SARs. Analysts see nothing; no alert changes.</div></div>
      <div className="acts"><button className="st-btn ai" onClick={()=>E.startShadow(uc,id)}><i className="ti ti-player-play"></i>Start shadow run</button></div></>);
  case 'shadowrun':{const p=uc.prove,f=Math.min(1,p.day/p.total);
    return wrap('Day '+p.day+' of '+p.total,'ti-eye-check',<>
      <div className="st-shadowbar"><i style={{width:(f*100)+'%'}}></i></div>
      <div className="st-mini" style={{marginTop:8}}>
        <div className="k"><b>{Math.round(4100*f).toLocaleString()}</b><span>alerts shadowed</span></div>
        <div className="k"><b style={{color:'var(--t-ok)'}}>{p.day?91:'—'}{p.day?'%':''}</b><span>agreement</span></div>
        <div className="k"><b style={{color:'var(--t-ok)'}}>{p.day?98:'—'}{p.day?'%':''}</b><span>escalation recall</span></div>
        <div className="k"><b>0</b><span>alerts affected</span></div></div>
      {done?<Chosen c={c.choice}/>:<div className="acts"><button className="st-btn sm" onClick={()=>E.fastForward(uc)}><i className="ti ti-player-track-next"></i>Fast-forward to the end (demo)</button></div>}</>);}
  case 'approvals':{
    const ppl=[['mlro','Sarah Klein','MLRO'],['fcc','Lior Ben-Ami','Head of Financial Crime Compliance']];
    return wrap('Proof of concept sign-off','ti-users',<>
      <table className="st-tbl"><tbody>{[['Agreement','91%','≥ 85%'],['Escalation recall','98%','≥ 95%'],['Missed SARs','0','0']].map(r=><tr key={r[0]}><td>{r[0]}</td><td><b>{r[1]}</b></td><td style={{color:'var(--ink-3)'}}>target {r[2]}</td><td><span className="st-pill ok">Met</span></td></tr>)}</tbody></table>
      <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>{ppl.map(p=><div key={p[0]} className="st-file"><U.Av who={p[0]}/><div className="nm"><b>{p[1]}</b><span>{p[2]}</span></div>
        {uc.prove.signed[p[0]]?<span className="st-pill ok"><i className="ti ti-signature"></i>Signed {uc.prove.signed[p[0]]}</span>:c.requested?<span className="st-pill warn">Waiting…</span>:<span className="st-pill">Not requested</span>}</div>)}</div>
      {done?<Chosen c={c.choice}/>:!c.requested&&<div className="acts"><button className="st-btn pri" onClick={()=>E.requestSignoff(uc,id)}><i className="ti ti-send"></i>Request both signatures</button></div>}</>);}
  case 'checklist':
    return wrap('Go-live checklist','ti-checklist',<>
      {D.CHECKLIST.map((it,i)=>{const st=uc.operate.chk[i];return(
        <div key={i} className={'st-check'+(st?' on':'')} onClick={()=>!done&&E.toggleCheck(uc,id,i)}><span className="bx">{st&&<i className="ti ti-check"></i>}</span>{it.t}
          <span className="by">{st==='ray'?'✦ proven from the trail':st==='you'?'confirmed by you':'tap to confirm'}</span></div>);})}
      {done&&<Chosen c={c.choice}/>}</>);
  case 'authority':
    return wrap('Starting authority','ti-stairs-up',done?<Chosen c={c.choice}/>:
      <div className="st-ladder">{D.AUTHORITY.map((a,i)=><button key={a.id} className="st-opt" onClick={()=>E.pickAuth(uc,id,a.id)}>{i===0&&<em>Recommended to start</em>}<b><i className={'ti '+a.ic}></i>{i+1}. {a.t}</b><span>{a.d}</span></button>)}</div>);
  case 'comment':
    return wrap(null,null,<>
      <div className="st-proof" style={{marginTop:0}}><U.Av who={c.who}/><div><b>{P(c.who).n}</b> · {P(c.who).r}<br/>“{c.text}”</div></div>
      {done?<Chosen c={c.choice}/>:<div className="acts"><button className="st-btn ok sm" onClick={()=>E.applyComment(uc,id,true)}><i className="ti ti-check"></i>Apply Dana’s change</button><button className="st-btn sm" onClick={()=>E.applyComment(uc,id,false)}>Discuss</button></div>}</>);
  default:return null;
  }
}
U.Card=Card;

/* ---------- living package ---------- */
const NW=184,GAP=22,RH=116,NH=62;
function Flow({uc,onNode}){
  const v=E.cur(uc);
  const ref=useRef(null);const [cw,setCw]=useState(0);
  useEffect(()=>{if(!ref.current||!uc.pulse.ids.length)return;const el=ref.current.querySelector('[data-nid="'+uc.pulse.ids[uc.pulse.ids.length-1]+'"]');const sc=ref.current.closest('.st-pbody');
    if(el&&sc){const top=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop;sc.scrollTop=Math.max(0,top-sc.clientHeight/2+40);}},[uc.pulse.t]);
  useEffect(()=>{if(!ref.current||!window.ResizeObserver)return;const ro=new ResizeObserver(e=>setCw(e[0].contentRect.width));ro.observe(ref.current);return()=>ro.disconnect();},[!!v,cw>0&&cw<520]);
  if(!v)return <div className="st-empty"><i className="ti ti-git-branch"></i><b>Your workflow appears here as we talk</b><span>Pick a job and Ray drafts it step by step — every step linked to your policy.</span></div>;
  const wf=v.wf,rows=wf.nodes.reduce((a,n)=>Math.max(a,n.r),0)+1;
  const pos=n=>({x:n.c*(NW+GAP),y:n.r*RH});
  const W=3*NW+2*GAP,H=rows*RH;
  const fresh=Date.now()-uc.pulse.t<3500;
  if(cw&&cw<520){
    const order=[...wf.nodes].sort((a,b)=>a.r-b.r||a.c-b.c);
    return <div className="st-flowwrap" ref={ref}><div className="st-vlist">{order.map(n=>{const k=D.KIND[n.k]||D.KIND.user,ch=v.changed.includes(n.id),pl=fresh&&uc.pulse.ids.includes(n.id);
      const outs=wf.edges.filter(e=>e[0]===n.id&&e[2]).map(e=>{const t=wf.nodes.find(x=>x.id===e[1]);return t?e[2]+' → '+t.t:null;}).filter(Boolean);
      return <div key={n.id} data-nid={n.id} className={'st-node st-vnode'+(ch?' chg':'')+(pl?' pulse':'')} onClick={()=>onNode&&onNode(n)}>
        <span className={'src'+(n.ai?' ai':'')}>{n.ai?'✦ AI':'Rule'}</span>
        <div className="h"><span className="ni" style={{background:k[1]+'22',color:k[1]}}><i className={'ti '+k[0]}></i></span><span className="nt">{n.t}</span></div>
        <div className="nm"><span><b>{n.role}</b></span><span>{n.sla}</span>{n.pol&&<span className="pol">§{n.pol}</span>}</div>
        {n.tuned&&<div className="why" style={{display:'block'}}>✦ Tuned: {n.tuned}</div>}
        {!n.tuned&&ch&&<div className="why">Updated in v{v.n}</div>}
        {outs.map(o=><div key={o} className="br"><i className="ti ti-corner-down-right"></i>{o}</div>)}
      </div>;})}</div></div>;
  }
  return <div className="st-flowwrap" ref={ref}>
    <div className="st-flow" style={{width:W,height:H}}>
      <svg width={W} height={H}>{wf.edges.map((e,i)=>{const a=wf.nodes.find(n=>n.id===e[0]),b=wf.nodes.find(n=>n.id===e[1]);if(!a||!b)return null;
        const p=pos(a),q=pos(b),x1=p.x+NW/2,y1=p.y+NH,x2=q.x+NW/2,y2=q.y;
        return <g key={i}><path d={`M${x1} ${y1} C${x1} ${y1+24},${x2} ${y2-24},${x2} ${y2-2}`}/><path d={`M${x2-4} ${y2-7} L${x2} ${y2-1} L${x2+4} ${y2-7}`}/>
          {e[2]&&<text x={(x1+x2)/2+(x1===x2?6:0)} y={(y1+y2)/2+3} textAnchor={x1===x2?'start':'middle'}>{e[2]}</text>}</g>;})}</svg>
      {wf.nodes.map(n=>{const p=pos(n),k=D.KIND[n.k]||D.KIND.user,ch=v.changed.includes(n.id),pl=fresh&&uc.pulse.ids.includes(n.id);
        return <div key={n.id} data-nid={n.id} className={'st-node'+(ch?' chg':'')+(pl?(uc.pulse.fresh?' new':' pulse'):'')} style={{left:p.x,top:p.y}} onClick={()=>onNode&&onNode(n)} title="Ask Ray about this step">
          <span className={'src'+(n.ai?' ai':'')}>{n.ai?'✦ AI':'Rule'}</span>
          <div className="h"><span className="ni" style={{background:k[1]+'22',color:k[1]}}><i className={'ti '+k[0]}></i></span><span className="nt">{n.t}</span></div>
          <div className="nm"><span><b>{n.role}</b></span><span>{n.sla}</span>{n.pol&&<span className="pol">§{n.pol}</span>}</div>
          {n.tuned&&<div className="why" style={{display:'block'}}>✦ Tuned: {n.tuned}</div>}
          {!n.tuned&&ch&&<div className="why">Updated in v{v.n}{n.note?': '+n.note.slice(0,46):''}</div>}
        </div>;})}
    </div>
    <div className="st-legend"><span><span className="st-pill ai">✦ AI</span>Ray decides or drafts</span><span><span className="st-pill">Rule</span>Fixed rule</span><span><span className="st-pill ok">§</span>Linked policy clause</span><span>Tap a step to talk about it</span></div>
  </div>;
}
function Policy({uc}){
  if(!uc.policy.length)return <div className="st-empty"><i className="ti ti-book"></i><b>Hand Ray your manual</b><span>Your policy clauses appear here, each with its source page. Everything Ray builds points back to them.</span></div>;
  return <>{uc.hasDocs&&uc.files.length>0&&<div className="st-banner ok"><i className="ti ti-files"></i>{uc.files.length} documents read · {uc.policy.length} clauses extracted<span className="sp"></span></div>}
    {uc.policy.map(c=><div key={c.no} className={'st-clause'+(uc.policyHl.includes(c.no)&&uc.lastChange&&uc.lastChange.clause.no===c.no?' hl':'')}>
      <div className="h"><span className="no">§{c.no}</span>{c.t}</div><p>{c.p}</p><div className="s"><i className="ti ti-paperclip"></i>{c.src}</div></div>)}</>;
}
function Report({uc}){
  if(!uc.report)return <div className="st-empty"><i className="ti ti-file-text"></i><b>The investigation report Ray writes</b><span>Choose a layout and preview what Ray will write on every alert.</span></div>;
  return <div className="st-doc"><div className="dh"><i className="ti ti-file-text" style={{fontSize:20,color:'var(--t-act)'}}></i><b>Investigation report · {uc.name}</b><span className="st-pill act">{uc.report==='upload'?'Your layout':'Predefined'}</span></div>
    {D.REPORT.map((r,i)=><div key={r.h} className="ds"><h5>{i+1}. {r.h}</h5><p>{r.p}</p><div className="ln" style={{width:(92-i*7)+'%'}}></div><div className="ln" style={{width:(70-i*5)+'%'}}></div></div>)}</div>;
}
function Results({uc}){
  const r=uc.train.rounds,p=uc.prove,live=uc.operate.live;
  if(!r.length&&!p.day&&!live)return <div className="st-empty"><i className="ti ti-chart-bar"></i><b>Evidence, not promises</b><span>Once Ray practices on your closed alerts, its results versus your analysts show up here.</span></div>;
  const kp=(v,l,c,tg)=><div className="st-kpi"><b style={{color:c||'inherit'}}>{v}</b><span>{l}</span>{tg&&<span className="tg" style={{color:'var(--t-ok)'}}>{tg}</span>}</div>;
  return <>
    {live&&<><div className="st-live"><span className="p"></span>Live · version {E.cur(uc).n} · {D.AUTHORITY.find(a=>a.id===uc.operate.auth).t}<span style={{flex:1}}></span><button className="st-btn sm" onClick={()=>E.rollback(uc)}><i className="ti ti-arrow-back-up"></i>Roll back</button></div>
      <div className="st-kpis">{kp('3,912','alerts, last 7 days')}{kp('31%','closed by Ray')}{kp('3.1 h','avg. time to decision')}{kp('0','SLA breaches','var(--t-ok)')}</div></>}
    {p.day>0&&<div className="st-panel"><h5><i className="ti ti-eye-check" style={{color:'var(--violet2)'}}></i>Prove · shadow run · day {p.day} of {p.total}</h5>
      <div className="st-shadowbar"><i style={{width:(p.day/p.total*100)+'%'}}></i></div>
      <div className="st-kpis" style={{marginTop:12}}>{kp(Math.round(4100*Math.min(1,p.day/p.total)).toLocaleString(),'alerts shadowed')}{kp('91%','agreement','var(--t-ok)','target ≥ 85% · met')}{kp('98%','escalation recall','var(--t-ok)','target ≥ 95% · met')}{kp('0','missed SARs','var(--t-ok)','target 0 · met')}</div>
      <table className="st-tbl"><thead><tr><th>Alert</th><th>Analysts</th><th>Ray</th><th>Note</th></tr></thead><tbody>{D.SHADOW_DIFFS.map(d=><tr key={d[0]}><td className="code">{d[0]}</td><td>{d[1]}</td><td><b>{d[2]}</b></td><td style={{color:'var(--ink-2)'}}>{d[3]}</td></tr>)}</tbody></table></div>}
    {r.length>0&&<div className="st-panel"><h5><i className="ti ti-school" style={{color:'var(--act)'}}></i>Train · Ray vs. your analysts on closed alerts</h5>
      <div className="st-kpis">{kp(r[r.length-1].agree+'%','agreement','var(--t-ok)')}{kp('34%','false positives Ray would close')}{kp(r.length>1?'0':'2','escalations Ray missed',r.length>1?'var(--t-ok)':'var(--t-risk)')}{kp('2.1 min','avg. Ray decision')}</div>
      <div className="st-rounds">{r.map(x=><div key={x.n} className="r"><b>{x.agree}%</b><i style={{height:((x.agree-70)*3.2)+'px'}}></i><span>Round {x.n}</span></div>)}</div>
      <table className="st-tbl" style={{marginTop:12}}><thead><tr><th>Alert</th><th>Analyst</th><th>Ray</th><th>Why Ray differs</th></tr></thead><tbody>{D.DIFFS.map(d=><tr key={d[0]}><td className="code">{d[0]}</td><td>{d[1]}</td><td><b>{d[2]}</b></td><td style={{color:'var(--ink-2)'}}>{d[3]}</td></tr>)}</tbody></table></div>}
  </>;
}
function Trail({uc}){
  const icon={sign:'ti-signature',ray:'ti-sparkles',you:'ti-user'};
  return <>
    <div className="st-banner"><i className="ti ti-shield-lock"></i>Every action is logged, versioned and reversible. Nothing goes live without a human signature.<span className="sp"></span>
      <button className="st-btn sm" onClick={()=>{E.log(uc,'Exported audit pack (trail + versions + MRM document)','you','you');E.logMsg(uc,'Audit pack exported','ti-download');}}><i className="ti ti-download"></i>Export for auditor</button></div>
    {uc.versions.length>0&&<div className="st-vers">{uc.versions.map(v=><button key={v.n} className={v.n===E.cur(uc).n?'on':''} title={v.summary} onClick={()=>v.n!==E.cur(uc).n&&E.restore(uc,v.n)}>v{v.n}{v.n===E.cur(uc).n?' · current':' · restore'}</button>)}</div>}
    <div className="st-trail">{uc.trail.map(t=><div key={t.id} className={'st-tr '+t.kind}><i className={'ti '+(icon[t.kind]||'ti-point')}></i>
      <div className="w"><b>{t.text}</b><span>{P(t.who).n} · {t.at}</span></div><span className="v">{t.ver}</span></div>)}</div>
    {!uc.trail.length&&<div className="st-empty"><i className="ti ti-history"></i><b>Nothing yet</b><span>Every choice, change and signature will be recorded here.</span></div>}
  </>;
}
U.Package=function({uc,onNode}){
  const tabs=[['workflow','Workflow','ti-git-branch',uc.versions.length?E.cur(uc).wf.nodes.length+' steps':null],['policy','Policy','ti-book',uc.policy.length||null],['report','Report','ti-file-text',null],
    ['results','Results','ti-chart-bar',null],['trail','Trail','ti-history',uc.trail.length||null]];
  const v=E.cur(uc);
  return <div className="st-pkg">
    <div className="st-ptabs">{tabs.map(t=><button key={t[0]} className={'st-ptab'+(uc.tab===t[0]?' on':'')} onClick={()=>E.setTab(uc,t[0])}><i className={'ti '+t[2]}></i>{t[1]}{t[3]&&<span className="c">{t[3]}</span>}</button>)}
      <span className="sp"></span>{v&&<span className="st-ver"><i className="ti ti-git-commit"></i>v{v.n} · {P(v.by).n} · {v.at}</span>}</div>
    <div className="st-pbody">
      {uc.tab==='workflow'&&<Flow uc={uc} onNode={onNode}/>}
      {uc.tab==='policy'&&<Policy uc={uc}/>}
      {uc.tab==='report'&&<Report uc={uc}/>}
      {uc.tab==='results'&&<Results uc={uc}/>}
      {uc.tab==='trail'&&<Trail uc={uc}/>}
    </div>
  </div>;
};
})();
