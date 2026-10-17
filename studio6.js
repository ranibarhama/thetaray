/* Studio next v3 — "Ray's permissions": one short list, three colours, one next step. (text/babel) */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,R=window.R6;
const P=w=>D.PEOPLE[w]||D.PEOPLE.you;
const md=t=>window.RSU&&window.RSU.md?window.RSU.md(t):t;
const ORDER={alone:0,ask:1,never:2};

/* ───────── pop-over shell ───────── */
function Pop({title,sub,onClose,children,wide}){
  useEffect(()=>{const k=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}};
    window.addEventListener('keydown',k,true);return()=>window.removeEventListener('keydown',k,true);},[]);
  return <div className="s6-pop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className={'s6-popb'+(wide?' wide':'')}>
      <div className="s6-poph"><div><b>{title}</b>{sub&&<span>{sub}</span>}</div><span className="sp"></span>
        <button className="s6-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
      <div className="s6-popc">{children}</div></div></div>;
}
const dl=(name,text)=>{const b=new Blob([text],{type:'text/plain'});const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);};
const docText=(j,h)=>h+' — '+j.name+'\n\n'+R.activeClauses(j).map(c=>'['+R.MODES[c.mode].short.toUpperCase()+'] '+c.text+
  (c.ev.seen?'  ('+c.ev.seen+' seen, '+Math.round(c.ev.agreed/Math.max(1,c.ev.seen)*100)+'% agreed)':'')).join('\n')+
  '\n\nSignatures: '+(j.signs.map(s=>P(s.who).n).join(', ')||'none')+'\n';

function Papers({j,onClose}){
  const [tab,setTab]=useState('papers');
  const act=R.activeClauses(j);
  return <Pop wide title="Everything behind Ray’s lines" sub="Generated from the list — you never maintain these" onClose={onClose}>
    <div className="s6-tabs">{[['papers','What you can sign'],['flow','The flow'],['sources','Sources'],['trail','Audit trail']]
      .map(t=><button key={t[0]} className={tab===t[0]?'on':''} onClick={()=>setTab(t[0])}>{t[1]}</button>)}</div>
    {tab==='papers'&&<>
      {[['Playbook','Every line, in the order Ray applies it.','ti-list-numbers','PLAYBOOK','ray-playbook.txt'],
        ['Model risk document','What Ray decides alone, what it asks about, what it never does.','ti-shield-check','MODEL RISK DOCUMENT','model-risk.txt'],
        ['Analyst guide','One page for the floor.','ti-users','ANALYST GUIDE','analyst-guide.txt']]
        .map(x=><div key={x[0]} className="s6-exp"><i className={'ti '+x[2]}></i><div><b>{x[0]}</b><span>{x[1]}</span></div>
          <button className="s6-b" onClick={()=>dl(x[4],docText(j,x[3]))}><i className="ti ti-download"></i>Download</button></div>)}
      <div className="s6-sg"><b>Signatures on file</b>{j.signs.length
        ?<div className="s6-ppl">{j.signs.map((s,i)=><span key={i} className="s6-av" title={P(s.who).n+' · '+s.at}>{P(s.who).i}</span>)}</div>
        :<span className="s6-none">None yet — Ray asks for them when it is ready to go live.</span>}</div></>}
    {tab==='flow'&&<div className="s6-flow">
      <div className="s6-fn start"><b>Alert raised</b></div>
      {['never','ask','alone'].map(m=>act.filter(c=>c.mode===m).map(c=><React.Fragment key={c.id}>
        <div className="s6-fa"><i className="ti ti-arrow-down"></i></div>
        <div className={'s6-fn '+m}><b>{c.text}</b><span>{R.MODES[m].pill}</span></div></React.Fragment>))}
      <div className="s6-fa"><i className="ti ti-arrow-down"></i></div><div className="s6-fn end"><b>Closed, escalated, or on your desk</b></div></div>}
    {tab==='sources'&&<>
      {j.docs.length?j.docs.map(d=><div key={d.id} className="s6-exp"><i className="ti ti-file-text"></i>
        <div><b>{d.n}</b><span>{d.s||'document'}</span></div>
        <button className="s6-ib" onClick={()=>R.delDoc(j,d.id)}><i className="ti ti-trash"></i></button></div>)
        :<div className="s6-none">Only your policy so far.</div>}
      <button className="s6-b" onClick={()=>R.addDocs(j,[{n:'AML Policy 2026.pdf',s:'policy · 48 clauses'},{n:'Escalation matrix.xlsx',s:'who decides what'}])}>
        <i className="ti ti-upload"></i>Add documents</button></>}
    {tab==='trail'&&<><div className="s6-trail">{j.trail.map(t=><div key={t.id} className="r">
      <span className={'s6-av'+(t.who==='you'?' you':'')}>{t.who==='ray'?'✦':P(t.who).i}</span>
      <span className="w"><b>{t.text}</b><em>{t.at}</em></span></div>)}
      {!j.trail.length&&<div className="s6-none">Nothing yet.</div>}</div>
      <button className="s6-b" onClick={()=>dl('audit-trail.txt',j.trail.map(t=>t.at+' · '+t.who+' · '+t.text).join('\n'))}>
        <i className="ti ti-download"></i>Download the trail</button></>}
  </Pop>;
}

function Menu({j,onClose,onHand,onPapers}){
  const rows=[
    ['ti-files','Documents, flow, sources, trail','Everything Ray generates',()=>onPapers()],
    ['ti-user-share','Hand the coaching over','Dana knows how your alerts are decided',()=>onHand()],
    ['ti-copy','Copy this job','Same lines, another country',()=>R.clone(j)]];
  if(j.stage==='shadow')rows.push(['ti-player-skip-forward','Fast-forward the four weeks','For the demo',()=>R.fastForward(j)]);
  if(j.stage==='live')rows.push(['ti-arrow-back-up','Roll back','Ray stops acting alone — recorded in the trail',()=>R.rollback(j)]);
  return <Pop title={j.name} sub={R.STAGES[R.stageIdx(j)][1]} onClose={onClose}>
    {rows.map(r=><button key={r[1]} className="s6-row" onClick={()=>{onClose();r[3]();}}>
      <i className={'ti '+r[0]}></i><span className="w"><b>{r[1]}</b><em>{r[2]}</em></span></button>)}
    <button className="s6-row" onClick={()=>{onClose();R.close();}}><i className="ti ti-layout-grid"></i>
      <span className="w"><b>All of Ray’s jobs</b><em>Back to the list</em></span></button></Pop>;
}

function Hand({j,onClose}){
  const [who,setWho]=useState('dana');const [msg,setMsg]=useState('');
  return <Pop title="Who should coach Ray?" sub="They see this same list and the same alerts" onClose={onClose}>
    {[['dana','Knows how your alerts are decided'],['tom','ThetaRay services — data and technical issues']].map(w=>
      <button key={w[0]} className={'s6-row'+(who===w[0]?' on':'')} onClick={()=>setWho(w[0])}>
        <span className="s6-av">{P(w[0]).i}</span><span className="w"><b>{P(w[0]).n}</b><em>{w[1]}</em></span>
        {who===w[0]&&<i className="ti ti-check"></i>}</button>)}
    <textarea className="s6-note" placeholder="Anything they should know? (optional)" value={msg} onChange={e=>setMsg(e.target.value)}/>
    <button className="s6-b pri" onClick={()=>{onClose();R.handTo(j,who,msg.trim());}}>Hand it to {P(who).n.split(' ')[0]}</button>
  </Pop>;
}

function Sign({j,onClose}){
  const left=(j.checklist||[]).filter(c=>!c.on).length;
  if(!j.checklist)return null;
  return <Pop title="Ready to go live" sub="Three signatures and a short checklist" onClose={()=>{j.checklist=null;R.emit();onClose();}}>
    <p className="s6-lead">When you sign, Ray starts acting alone on the <b>{R.counts(j).alone} green line{R.counts(j).alone===1?'':'s'}</b>.
      Amber lines still come to you. Red lines it never touches. You can roll back with one click.</p>
    <div className="s6-chk">{j.checklist.map((c,i)=><button key={i} className={(c.on?'on':'')+(c.ray?' ray':'')} onClick={()=>R.toggleChk(j,i)}>
      <i className={'ti '+(c.on?'ti-square-check':'ti-square')}></i><span>{c.t}</span>{c.ray&&<em>✦ proven by Ray</em>}</button>)}</div>
    <div className="s6-ppl"><span className="s6-av">{P('mlro').i}</span><span className="s6-av">{P('fcc').i}</span><span className="s6-av you">YOU</span>
      <span className="s6-sgn">MLRO · Head of FCC · you</span></div>
    <button className="s6-b pri" disabled={left>0} onClick={()=>{if(R.sign(j))onClose();}}>
      {left>0?left+' to confirm first':'Request signatures and go live'}</button>
  </Pop>;
}

function Answer({j,onClose}){
  return <Pop title={j.ask.q} onClose={()=>{j.ask=null;R.emit();onClose();}}>
    <div className="s6-ans">{md(j.ask.a)}</div>
    <div className="s6-facts">
      {[['Lines','Ray does '+R.counts(j).alone+' alone · asks about '+R.counts(j).ask+' · never does '+R.counts(j).never],
        ['Agreement on closed alerts',j.stats.agree?j.stats.agree+'% (your bar: 90%)':'not tested yet'],
        ['Signed',j.signs.length?j.signs.map(s=>P(s.who).n).join(', '):'not yet'],
        ['Stage',R.STAGES[R.stageIdx(j)][1]]].map((f,i)=><div key={i}><span>{f[0]}</span><b>{f[1]}</b></div>)}</div>
  </Pop>;
}

/* ───────── one line of the list ───────── */
function Line({j,c,flash}){
  const [open,setOpen]=useState(false);
  const [ed,setEd]=useState(false);const [txt,setTxt]=useState(c.text);
  const m=R.MODES[c.mode];
  const ev=c.ev.seen?Math.round(c.ev.agreed/Math.max(1,c.ev.seen)*100):null;
  const isNew=c.changed>j.signedVer&&c.state==='on'&&j.signedVer>0;
  const proposed=c.state==='proposed';
  const pick=mode=>{const r=R.setMode(j,c.id,mode);if(!r.ok)flash(r.msg);setOpen(false);};
  return <div className={'s6-line '+c.mode+(proposed?' proposed':'')+(isNew?' changed':'')}>
    <div className="s6-lm">
      <button className={'s6-pill '+c.mode} disabled={proposed} onClick={()=>setOpen(o=>!o)} title="Change what Ray may do with this">
        <i className={'ti '+m.ic}></i>{m.short}<i className="ti ti-chevron-down c"></i></button>
      {open&&<div className="s6-menu" onMouseLeave={()=>setOpen(false)}>
        {['alone','ask','never'].map(k=><button key={k} className={'o '+k+(c.mode===k?' cur':'')} onClick={()=>pick(k)}>
          <i className={'ti '+R.MODES[k].ic}></i><span><b>{R.MODES[k].pill}</b>
          {k==='alone'&&!R.canBeAlone(j,c)&&<em>locked until Ray has earned it</em>}</span>
          {c.mode===k&&<i className="ti ti-check ck"></i>}</button>)}
        <hr/><button className="o" onClick={()=>{setOpen(false);setEd(true);setTxt(c.text);}}><i className="ti ti-pencil"></i><span><b>Edit the wording</b></span></button>
        <button className="o" onClick={()=>{setOpen(false);R.remove(j,c.id);}}><i className="ti ti-trash"></i><span><b>Remove this line</b></span></button>
      </div>}
    </div>
    <div className="s6-lb">
      {ed?<div className="s6-edit"><textarea autoFocus value={txt} onChange={e=>setTxt(e.target.value)}/>
        <div><button className="s6-b pri sm" onClick={()=>{R.editText(j,c.id,txt);setEd(false);}}>Save</button>
        <button className="s6-b gh sm" onClick={()=>setEd(false)}>Cancel</button></div></div>
        :<div className="s6-lt">{c.prevText&&c.changed>j.signedVer&&j.signedVer>0&&<del>{c.prevText}</del>}{c.text}</div>}
      <div className="s6-lmeta">
        {proposed&&<span className="s6-tag prop"><i className="ti ti-sparkles"></i>{c.by==='dana'?'Dana suggests':'Ray suggests'}{c.why?' · '+c.why:''}</span>}
        {!proposed&&ev!==null&&<span className="s6-ev"><i style={{width:ev+'%'}}></i><em>{c.ev.seen} seen · {ev}% you agreed</em></span>}
        {!proposed&&ev===null&&<span className="s6-ev none">no examples yet</span>}
        {isNew&&<span className="s6-tag new">new since you signed</span>}
        {c.by==='you'&&!proposed&&<span className="s6-tag you">you added this</span>}
      </div>
      {proposed&&<div className="s6-lact"><button className="s6-b pri sm" onClick={()=>R.decideProposal(j,c.id,true)}>Add it</button>
        <button className="s6-b gh sm" onClick={()=>R.decideProposal(j,c.id,false)}>No</button></div>}
      {c.proposal==='alone'&&!proposed&&<div className="s6-promo"><i className="ti ti-trophy"></i>
        <span><b>Ray has earned this.</b> {c.ev.agreed} of {c.ev.seen} agreed. Let it handle these alone?</span>
        <button className="s6-b pri sm" onClick={()=>R.promo(j,c.id,true)}>Make it green</button>
        <button className="s6-b gh sm" onClick={()=>R.promo(j,c.id,false)}>Not yet</button></div>}
    </div>
  </div>;
}

/* ───────── Ray's latest ───────── */
function Feed({j,flash}){
  const [pick,setPick]=useState(null);
  const waiting=j.feed.filter(f=>f.state==='wait').length;
  return <div className="s6-feed">
    <div className="s6-fh"><span className="s6-orb">✦</span><b>Ray at work</b><span className="sp"></span>
      {j.running&&<span className="s6-live"><i></i>live</span>}</div>
    <div className="s6-fstat"><div><b>{j.stats.alone.toLocaleString()}</b><span>done alone</span></div>
      <div><b>{waiting}</b><span>asking you</span></div></div>
    <div className="s6-flist">
      {j.feed.slice(0,6).map(f=>{const c=j.clauses.find(x=>x.id===f.clauseId);const a=f.alert;
        return <div key={f.id} className={'s6-fi '+f.state}>
          <div className="s6-ftop"><span className="s6-code">{a.id}</span><span className="s6-fnm">{a.who}</span><span className="s6-famt">{a.amt}</span></div>
          <div className="out">Ray {f.state==='done'?'closed it alone':'would'}: <b>{a.out}</b></div>
          {f.state==='wait'&&pick!==f.id&&<div className="acts">
            <button className="s6-yes" onClick={()=>R.agree(j,f.id)}><i className="ti ti-check"></i>Ray is right</button>
            <button className="s6-no" onClick={()=>setPick(f.id)}><i className="ti ti-pencil"></i>Not like that</button></div>}
          {f.state==='wait'&&pick===f.id&&<div className="s6-fix">
            <div className="t">For alerts like this, Ray should…</div>
            {[['alone','Do it alone'],['ask','Ask me first'],['never','Never do it']].map(o=>
              <button key={o[0]} className={o[0]} onClick={()=>{R.correct(j,f.id,o[0]);setPick(null);flash('Added to Ray’s lines');}}>
                <i className={'ti '+R.MODES[o[0]].ic}></i>{o[1]}</button>)}
            <button className="gh" onClick={()=>setPick(null)}>cancel</button></div>}
          {f.state==='agreed'&&<div className="res ok"><i className="ti ti-check"></i>you agreed</div>}
          {f.state==='corrected'&&<div className="res fix"><i className="ti ti-pencil"></i>you corrected it — see the new line</div>}
        </div>;})}
      {!j.feed.length&&<div className="s6-none">Ray is warming up…</div>}
    </div>
  </div>;
}

/* ───────── the one next step ───────── */
function Next({j,openSign}){
  const props=R.proposed(j).length;
  let t,d,btn,fn,extra=null;
  if(j.testing)return <div className="s6-next test"><div className="n"><b>Testing on your closed alerts</b>
    <span>{j.testing.cnt.toLocaleString()} of {j.testing.n.toLocaleString()} · {j.testing.agree}% agreement so far</span></div>
    <div className="s6-bar"><i style={{width:(j.testing.cnt/j.testing.n*100)+'%'}}></i></div></div>;
  if(j.stage==='draft'){t=props?'Decide the proposed lines, then test again':(j.stats.rounds?'Test again':'Next: test Ray on your closed alerts');
    d=props?'Ray found '+props+' line'+(props>1?'s':'')+' that would close the gap — add or decline them above.':'About a minute. It shows where Ray and your analysts differ, and it is the evidence that lets lines turn green.';
    btn=j.stats.rounds?'Test again':'Test it';fn=()=>R.replay(j);}
  else if(j.stage==='tested'){t='Ray matched your analysts '+j.stats.agree+'% of the time';
    d='Next it works beside them for four weeks: it decides, they decide, and nothing it does takes effect.';btn='Start the shadow run';fn=()=>R.startShadow(j);}
  else if(j.stage==='shadow'){t='Beside your analysts · day '+j.stats.shadowDay+' of '+j.stats.shadowTotal;
    d='91% agreement so far. Nothing Ray decides affects a real alert.';btn='Fast-forward (demo)';fn=()=>R.fastForward(j);
    extra=<div className="s6-bar"><i style={{width:(j.stats.shadowDay/j.stats.shadowTotal*100)+'%'}}></i></div>;}
  else if(j.stage==='ready'){t='Ray is ready';d='Three signatures, then it acts alone on the green lines.';btn='Review and sign';fn=()=>{R.openSign(j);openSign();};}
  else{const u=R.unsigned(j);t=u?'Live — '+u+' change'+(u>1?'s':'')+' since you signed':'Live';
    d=u?'Ray keeps working on the signed version until you sign the changes.':'Ray acts alone on the green lines. Everything amber still comes to you.';
    btn=u?'Sign the changes':'Roll back';fn=u?()=>{R.openSign(j);openSign();}:()=>R.rollback(j);}
  return <div className={'s6-next '+j.stage}><div className="n"><b>{t}</b><span>{d}</span>{extra}</div>
    <button className={'s6-go'+(j.stage==='live'&&!R.unsigned(j)?' sec':'')} onClick={fn}>{btn}<i className="ti ti-arrow-right"></i></button></div>;
}

/* ───────── the job ───────── */
function Job({j}){
  const [pop,setPop]=useState(null);
  const [flash,setFlash]=useState(null);
  const [t,setT]=useState('');const [hear,setHear]=useState(false);
  const f=m=>{setFlash(m);setTimeout(()=>setFlash(null),2600);};
  useEffect(()=>{if(j.ask)setPop('ask');},[j.ask]);
  const act=R.activeClauses(j),prop=R.proposed(j);
  const lines=[...prop,...act].sort((a,b)=>(a.state==='proposed'?-1:0)-(b.state==='proposed'?-1:0)||ORDER[a.mode]-ORDER[b.mode]);
  const cnt=R.counts(j);
  const send=v=>{const x=((v===undefined?t:v)||'').trim();if(!x)return;setT('');R.say(j,x);};
  const si=R.stageIdx(j);
  return <div className="s6">
    <div className="s6-bar2">
      <button className="s6-ib" onClick={()=>R.close()} title="All of Ray’s jobs"><i className="ti ti-arrow-left"></i></button>
      <b className="s6-title">{j.name}</b>
      <div className="s6-steps">{R.STAGES.map((s,i)=><span key={s[0]} className={'st'+(i<si?' done':'')+(i===si?' cur':'')}>
        <i>{i<si?<em className="ti ti-check"></em>:i+1}</i>{s[1]}</span>)}</div>
      <span className="sp"></span>
      {j.handedTo&&<span className="s6-with"><span className="s6-av">{P(j.handedTo).i}</span>with {P(j.handedTo).n.split(' ')[0]}
        <button onClick={()=>R.nudge(j)}>nudge</button><button onClick={()=>R.takeBack(j)}>take back</button></span>}
      <button className="s6-chip" onClick={()=>R.say(j,'is ray ready')}>Is Ray ready?</button>
      <button className="s6-chip" onClick={()=>R.say(j,'where am i')}>Where am I?</button>
      <button className="s6-ib" onClick={()=>setPop('menu')} title="More"><i className="ti ti-dots"></i></button>
    </div>

    <div className="s6-body">
      <div className="s6-main">
        <div className="s6-head">
          <div><h2>What Ray may do</h2><span>for <b>{j.name}</b></span></div>
          <div className="s6-key"><span className="alone"><i></i>alone <b>{cnt.alone}</b></span>
            <span className="ask"><i></i>asks you <b>{cnt.ask}</b></span><span className="never"><i></i>never <b>{cnt.never}</b></span></div>
        </div>
        {j.notes[0]&&<div className="s6-say"><span className="s6-orb">✦</span><div>{md(j.notes[0].text)}</div></div>}
        <div className="s6-lines">{lines.map(c=><Line key={c.id} j={j} c={c} flash={f}/>)}</div>
        <Next j={j} openSign={()=>setPop('sign')}/>
      </div>
      <Feed j={j} flash={f}/>
    </div>

    <div className="s6-askbar">
      <div className={'s6-ask'+(hear?' hearing':'')}>
        {hear?<div className="s6-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
          :<input value={t} placeholder="Tell Ray something new — “anything over $100k goes to a supervisor”…"
            onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}}/>}
        <button className={'s6-mic'+(hear?' on':' alive')} title="Speak to Ray" onClick={()=>{if(hear){setHear(false);send('never file a sar without a second reviewer');}else setHear(true);}}>
          <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
        <button className={'s6-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={()=>send()}><i className="ti ti-arrow-up"></i></button>
      </div>
    </div>

    {flash&&<div className="s6-flash"><i className="ti ti-bulb"></i>{flash}</div>}
    {pop==='ask'&&j.ask&&<Answer j={j} onClose={()=>setPop(null)}/>}
    {pop==='menu'&&<Menu j={j} onClose={()=>setPop(null)} onHand={()=>setPop('hand')} onPapers={()=>setPop('papers')}/>}
    {pop==='papers'&&<Papers j={j} onClose={()=>setPop(null)}/>}
    {pop==='hand'&&<Hand j={j} onClose={()=>setPop(null)}/>}
    {pop==='sign'&&j.checklist&&<Sign j={j} onClose={()=>setPop(null)}/>}
  </div>;
}

/* ───────── hub ───────── */
function Hub(){
  const [t,setT]=useState('');const [hear,setHear]=useState(false);
  const go=()=>{const v=t.trim();if(!v)return;setT('');R.hire(v);};
  return <div className="s6-hub">
    <div className="s6-hero">
      <span className="s6-orb big">✦</span>
      <h1>What should Ray take over?</h1>
      <p>Name the job. Ray writes down what it may do, you turn the lines it gets right <b className="g">green</b>,
        and it keeps asking about the rest.</p>
      <div className={'s6-ask big'+(hear?' hearing':'')}>
        {hear?<div className="s6-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
          :<input autoFocus value={t} placeholder="Screen our UK payments against sanctions…"
            onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')go();}}/>}
        <button className={'s6-mic'+(hear?' on':' alive')} onClick={()=>{if(hear){setHear(false);R.hire('uk transaction screening');}else setHear(true);}}>
          <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
        <button className={'s6-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={go}><i className="ti ti-arrow-up"></i></button></div>
      <div className="s6-chips">{D.TEMPLATES.slice(0,3).map(x=><button key={x.id} onClick={()=>R.hireTpl(x.id)}>{x.t}</button>)}</div>
    </div>
    <div className="s6-jobs">{R.state.jobs.map(j=>{const c=R.counts(j);const tot=Math.max(1,c.alone+c.ask+c.never);
      return <button key={j.id} className="s6-job" onClick={()=>R.open(j.id)}>
        <div className="t"><b>{j.name}</b><span className="s6-stg">{R.STAGES[R.stageIdx(j)][1]}</span></div>
        <div className="s6-mix"><i className="alone" style={{flex:c.alone}}></i><i className="ask" style={{flex:c.ask}}></i><i className="never" style={{flex:c.never}}></i></div>
        <div className="l"><span className="g">{c.alone} alone</span><span className="a">{c.ask} ask you</span><span className="r">{c.never} never</span></div>
      </button>;})}</div>
  </div>;
}

function RayStudio6(){
  const [,setV]=useState(0);
  useEffect(()=>R.subscribe(setV),[]);
  useEffect(()=>{R.seed();},[]);
  const j=R.state.openId?R.get(R.state.openId):null;
  return <div className="s6root">{j?<Job key={j.id} j={j}/>:<Hub/>}</div>;
}
window.RayStudio6=RayStudio6;
})();
