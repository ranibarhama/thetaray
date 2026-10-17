/* Studio next v2 — THE LINE.
   One spatial idea: everything above the line Ray handles alone, everything below comes to you.
   Drag the line and you watch your workload move. Same engine (window.R4), same flows. */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,R=window.R4;
const P=w=>D.PEOPLE[w]||D.PEOPLE.you;
const md=t=>window.RSU&&window.RSU.md?window.RSU.md(t):t;
const OUTS=[['close','Close as false positive','ti-circle-check'],['esc','Escalate to L2','ti-arrow-up-right'],
  ['rfi','Escalate + request info','ti-mail-question'],['sar','Recommend a SAR','ti-flag']];
const SCOPES=[['like','Every alert like this','Ray takes them from now on'],
  ['one','Just this one','A one-off — Ray learns nothing'],
  ['ask','Ask me next time','Ray stops on anything similar']];

/* ═══════ overlays (shared shell) ═══════ */
function Pop({title,sub,onClose,children,wide}){
  useEffect(()=>{const k=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}};
    window.addEventListener('keydown',k,true);return()=>window.removeEventListener('keydown',k,true);},[]);
  return <div className="s5-pop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className={'s5-popb'+(wide?' wide':'')}>
      <div className="s5-poph"><div><b>{title}</b>{sub&&<span>{sub}</span>}</div><span className="sp"></span>
        <button className="s5-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
      <div className="s5-popc">{children}</div></div></div>;
}

function Rules({j,onClose}){
  const [q,setQ]=useState('');
  const list=j.memory.filter(r=>!q||r.text.toLowerCase().includes(q.toLowerCase()));
  const CAT={policy:['ti-file-text','from your policy'],learned:['ti-bulb','you taught this'],
    ask:['ti-hand-stop','always asks you'],guard:['ti-shield-lock','never crossed']};
  return <Pop title="What Ray knows" sub={j.memory.length+' rules · '+j.memory.filter(r=>r.cat==='learned').length+' taught by you'} onClose={onClose}>
    <div className="s5-srch"><i className="ti ti-search"></i><input autoFocus placeholder="Search the rules…" value={q} onChange={e=>setQ(e.target.value)}/></div>
    {list.map(r=>{const c=CAT[r.cat]||CAT.learned;
      return <div key={r.id} className={'s5-rule'+(r.on?'':' off')}>
        <button className={'s5-sw'+(r.on?' on':'')} onClick={()=>R.toggleRule(j,r.id)}><i></i></button>
        <div><b>{r.text}</b><span><i className={'ti '+c[0]}></i>
          {r.src&&r.src.ref?(r.src.kind==='alert'?'learned from '+r.src.ref:r.src.ref):c[1]}
          {r.src&&r.src.by?' · '+P(r.src.by).n:''}<u>{r.conf}%</u></span></div></div>;})}
    {!list.length&&<div className="s5-none">Nothing matches “{q}”.</div>}
    <button className="s5-b gh" onClick={()=>R.undo(j)}><i className="ti ti-arrow-back-up"></i>Undo the last thing you taught</button>
  </Pop>;
}

const dl=(name,text)=>{const b=new Blob([text],{type:'text/plain'});const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);};
const pbText=j=>'RAY PLAYBOOK — '+j.name+'\n\nAuthority: '+R.LEVELS[j.authority].t+'\n\n'+
  j.memory.filter(r=>r.on).map((r,i)=>(i+1)+'. '+r.text+'  ['+(r.src&&r.src.ref?r.src.ref:'policy')+']').join('\n')+
  '\n\nSignatures: '+(j.signs.map(s=>P(s.who).n).join(', ')||'none')+'\n';

function Papers({j,onClose}){
  const [tab,setTab]=useState('papers');
  const steps=j.memory.filter(r=>r.on);
  return <Pop wide title="Everything behind the work" sub="Generated from the rules — you never maintain it" onClose={onClose}>
    <div className="s5-tabs">{[['papers','What you can sign'],['flow','The flow'],['sources','Sources'],['trail','Audit trail']]
      .map(t=><button key={t[0]} className={tab===t[0]?'on':''} onClick={()=>setTab(t[0])}>{t[1]}</button>)}</div>
    {tab==='papers'&&<>
      {[['Playbook','Every rule as a numbered instruction.','ti-list-numbers',()=>dl('ray-playbook.txt',pbText(j))],
        ['Model risk document','What Ray decides, what it never decides.','ti-shield-check',()=>dl('model-risk.txt','MODEL RISK — '+j.name+'\n'+pbText(j))],
        ['Analyst guide','One page for the floor.','ti-users',()=>dl('analyst-guide.txt','ANALYST GUIDE — '+j.name+'\n'+pbText(j))]]
        .map(x=><div key={x[0]} className="s5-exp"><i className={'ti '+x[2]}></i><div><b>{x[0]}</b><span>{x[1]}</span></div>
          <button className="s5-b" onClick={x[3]}><i className="ti ti-download"></i>Download</button></div>)}
      <div className="s5-sg"><b>Signatures on file</b>{j.signs.length
        ? <div className="s5-ppl">{j.signs.map((s,i)=><span key={i} className="s5-av" title={P(s.who).n+' · '+s.at}>{P(s.who).i}</span>)}</div>
        : <span className="s5-none">None yet.</span>}</div></>}
    {tab==='flow'&&<div className="s5-flow">
      <div className="s5-fn start"><b>Alert raised</b></div>
      {steps.slice(0,6).map((r,i)=><React.Fragment key={r.id}>
        <div className="s5-fa"><i className="ti ti-arrow-down"></i></div>
        <div className={'s5-fn'+(r.cat==='ask'?' ask':r.cat==='guard'?' guard':'')}><span className="n">{i+1}</span><b>{r.text}</b></div>
      </React.Fragment>)}
      <div className="s5-fa"><i className="ti ti-arrow-down"></i></div><div className="s5-fn end"><b>Closed, escalated, or on your desk</b></div></div>}
    {tab==='sources'&&<>
      {j.docs.length?j.docs.map(d=><div key={d.id} className="s5-exp"><i className="ti ti-file-text"></i>
        <div><b>{d.n}</b><span>{d.s||'document'}</span></div>
        <button className="s5-ib" onClick={()=>R.delDoc(j,d.id)}><i className="ti ti-trash"></i></button></div>)
        :<div className="s5-none">Only your policy so far.</div>}
      <button className="s5-b" onClick={()=>R.addDocs(j,[{n:'AML Policy 2026.pdf',s:'policy · 48 clauses'},{n:'Escalation matrix.xlsx',s:'who decides what'}])}>
        <i className="ti ti-upload"></i>Add documents</button></>}
    {tab==='trail'&&<><div className="s5-trail">{j.trail.map(t=><div key={t.id} className="r">
      <span className={'s5-av'+(t.who==='you'?' you':'')}>{t.who==='ray'?'✦':P(t.who).i}</span>
      <span className="w"><b>{t.text}</b><em>{t.at}</em></span></div>)}
      {!j.trail.length&&<div className="s5-none">Nothing yet.</div>}</div>
      <button className="s5-b" onClick={()=>dl('audit-trail.txt',j.trail.map(t=>t.at+' · '+t.who+' · '+t.text).join('\n'))}>
        <i className="ti ti-download"></i>Download the trail</button></>}
  </Pop>;
}

function Ask({j,onClose}){
  const [t,setT]=useState('');const [hear,setHear]=useState(false);
  const answers=j.stream.filter(c=>c.kind==='answer'||c.kind==='note'||c.kind==='you').slice(0,6);
  const send=v=>{const x=((v===undefined?t:v)||'').trim();if(!x)return;setT('');R.ask(j,x);};
  return <Pop title="Ask Ray" sub="Or tell it what to change" onClose={onClose}>
    <div className={'s5-ask'+(hear?' hearing':'')}>
      {hear?<div className="s5-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
        :<input autoFocus value={t} placeholder="Ask anything…" onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}}/>}
      <button className={'s5-mic'+(hear?' on':' alive')} onClick={()=>{if(hear){setHear(false);send('is ray ready');}else setHear(true);}}>
        <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
      <button className={'s5-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={()=>send()}><i className="ti ti-arrow-up"></i></button></div>
    <div className="s5-chips">{[['Is Ray ready?','is ray ready'],['Where are we?','where are we'],
      ['What have you learned?','what have you learned'],['Replay the closed alerts','replay']]
      .map(c=><button key={c[0]} onClick={()=>send(c[1])}>{c[0]}</button>)}</div>
    <div className="s5-answers">{answers.map(c=>c.kind==='you'
      ? <div key={c.id} className="s5-amsg you">{c.text}</div>
      : c.kind==='note'
      ? <div key={c.id} className="s5-amsg"><span className="s5-orb sm">✦</span><div>{md(c.text)}</div></div>
      : <div key={c.id} className="s5-ansb"><span className="q">{c.ask}</span><div className="a">{md(c.a)}</div>
          {c.facts&&c.facts.length>0&&<div className="s5-facts">{c.facts.map((f,i)=><div key={i}><span>{f[0]}</span><b>{f[1]}</b></div>)}</div>}</div>)}
      {!answers.length&&<div className="s5-none">Nothing asked yet.</div>}</div>
  </Pop>;
}

function Menu({j,onClose,onHand,onPapers}){
  const rows=[
    ['ti-files','Documents, flow, sources, trail','Everything Ray generates',()=>onPapers()],
    ['ti-player-pause',j.running?'Pause Ray':'Let Ray work',j.running?'It stops deciding':'It picks up again',()=>{j.running?R.stop(j):R.start(j);}],
    ['ti-user-share','Hand the coaching over','Dana knows how your alerts are decided',()=>onHand()],
    ['ti-copy','Copy this job','Same rules, another country',()=>R.clone(j)],
    ['ti-arrow-back-up','Give Ray less authority','Reversible, and recorded',()=>R.rollback(j)]];
  if(j.stats.shadowDay>0&&j.stats.shadowDay<j.stats.shadowTotal)
    rows.splice(4,0,['ti-player-skip-forward','Fast-forward the four weeks','For the demo',()=>R.skipShadow(j)]);
  return <Pop title={j.name} sub={R.LEVELS[j.authority].t} onClose={onClose}>
    {rows.map(r=><button key={r[1]} className="s5-row" onClick={()=>{r[3]();onClose();}}>
      <i className={'ti '+r[0]}></i><span className="w"><b>{r[1]}</b><em>{r[2]}</em></span></button>)}
    <button className="s5-row" onClick={()=>{onClose();R.close();}}><i className="ti ti-layout-grid"></i>
      <span className="w"><b>All of Ray’s jobs</b><em>Back to the list</em></span></button></Pop>;
}

function Hand({j,onClose}){
  const [who,setWho]=useState('dana');const [note,setNote]=useState('');
  return <Pop title="Who should decide these?" sub="They see the same line and the same rules" onClose={onClose}>
    {[['dana','Knows how your alerts are decided'],['tom','ThetaRay services — data and technical issues']].map(w=>
      <button key={w[0]} className={'s5-row'+(who===w[0]?' on':'')} onClick={()=>setWho(w[0])}>
        <span className="s5-av">{P(w[0]).i}</span><span className="w"><b>{P(w[0]).n}</b><em>{w[1]}</em></span>
        {who===w[0]&&<i className="ti ti-check"></i>}</button>)}
    <textarea className="s5-note" placeholder="Anything they should know? (optional)" value={note} onChange={e=>setNote(e.target.value)}/>
    <button className="s5-b pri" onClick={()=>{onClose();R.handTo(j,who,note.trim());}}>Hand it to {P(who).n.split(' ')[0]}</button>
  </Pop>;
}

/* ═══════ the item that needs you ═══════ */
function Item({j,it,open,onOpen,onFlash}){
  const [mode,setMode]=useState(null);
  const [out,setOut]=useState(null);
  useEffect(()=>{if(!open){setMode(null);setOut(null);}},[open]);
  const a=it.alert;

  if(it.kind==='decide'){
    return <div className={'s5-item'+(open?' open':'')} onClick={()=>!open&&onOpen()}>
      <div className="s5-ih">
        <span className="s5-code">{a.id}</span>
        <span className="s5-nm">{a.who}</span>
        <span className="s5-amt">{a.amt}</span>
        <span className="sp"></span>
        <span className="s5-would"><em>Ray would</em><b>{a.out}</b></span>
        <span className="s5-conf" title={a.conf+'% sure'}><i style={{width:a.conf+'%'}}></i></span>
      </div>
      {open&&<div className="s5-ib2">
        {mode==='why'&&<div className="s5-why">{a.why.map((w,i)=><div key={i}><i className="ti ti-point-filled"></i>
          <span><b>{w[0]}</b> — {w[1]}</span></div>)}</div>}
        {!mode&&<div className="s5-acts">
          <button className="s5-act yes" onClick={()=>{R.agree(j,it.id);}}><i className="ti ti-check"></i>Ray is right<kbd>A</kbd></button>
          <button className="s5-act no" onClick={()=>setMode('out')}><i className="ti ti-pencil"></i>Correct it<kbd>C</kbd></button>
          <button className="s5-act gh" onClick={()=>setMode('why')}><i className="ti ti-help"></i>Why<kbd>?</kbd></button>
          <button className="s5-act gh" onClick={()=>R.later(j,it.id)}>Later</button></div>}
        {mode==='why'&&<div className="s5-acts">
          <button className="s5-act yes" onClick={()=>R.agree(j,it.id)}><i className="ti ti-check"></i>Ray is right</button>
          <button className="s5-act no" onClick={()=>setMode('out')}><i className="ti ti-pencil"></i>Correct it</button>
          <button className="s5-act gh" onClick={()=>setMode(null)}>Hide</button></div>}
        {mode==='out'&&<div className="s5-choose">
          <div className="t">What should it have been?</div>
          <div className="o">{OUTS.filter(o=>o[1]!==a.out).map(o=><button key={o[0]} onClick={()=>{setOut(o[0]);setMode('scope');}}>
            <i className={'ti '+o[2]}></i>{o[1]}</button>)}</div>
          <button className="s5-act gh" onClick={()=>setMode(null)}>never mind</button></div>}
        {mode==='scope'&&<div className="s5-choose">
          <div className="t">How far should that go?</div>
          <div className="o scope">{SCOPES.map((sc,i)=><button key={sc[0]} className={i===0?'pri':''}
            onClick={()=>{onFlash(sc[0]==='like'?'Ray takes these from now on':'Ray learned it');R.correct(j,it.id,out,sc[0]);}}>
            <b>{sc[1]}</b><em>{sc[2]}</em></button>)}</div>
          <button className="s5-act gh" onClick={()=>setMode('out')}>back</button></div>}
      </div>}
    </div>;
  }

  /* everything else that needs a person, in the same list */
  const ICON={propose:'ti-sparkles',unlock:'ti-trending-up',sign:'ti-signature',comment:'ti-message-2',
    waiting:'ti-hourglass',milestone:'ti-flag'}[it.kind]||'ti-point';
  const yes=it.kind==='sign'?'Request and sign':it.kind==='unlock'?'Move the line':it.kind==='comment'?'Accept'
    :it.kind==='waiting'?'Nudge':it.kind==='milestone'?'Got it':(it.ok||'Yes');
  const no=it.kind==='waiting'?'Decide them myself':it.kind==='milestone'?'':'No';
  const left=(it.check||[]).filter(c=>!c.on).length;
  const title=it.kind==='milestone'?(it.done+' decisions coached'):it.t;
  const body=it.kind==='milestone'?('Ray has learned '+it.rules+' rules from you.'):it.d;
  const doYes=()=>{
    if(it.kind==='propose'){if(it.act==='replay'){R.replay(j,it.id);return;}
      R.deq(j,it.id);if(it.rule){R.addRule(j,it.rule,{kind:'ray',ref:'Ray proposed it'},'learned',82);R.log(j,'Allowed: '+it.rule,'you');}R.emit();return;}
    if(it.kind==='unlock'){R.unlock(j,it.id,it.lvl);return;}
    if(it.kind==='sign'){if(left>0){onFlash('Confirm the checklist first');return;}R.sign(j,it.id);return;}
    if(it.kind==='comment'){R.deq(j,it.id);
      R.addRule(j,'Anything over $100,000 goes to a supervisor, not L2',{kind:'person',ref:'Dana Levi',by:'dana'},'learned',80);
      R.log(j,'Accepted Dana’s comment','you');R.emit();return;}
    if(it.kind==='waiting'){R.nudge(j);return;}
    R.deq(j,it.id);R.emit();
  };
  return <div className={'s5-item other '+it.kind+(open?' open':'')} onClick={()=>!open&&onOpen()}>
    <div className="s5-ih">
      <span className={'s5-ic '+it.kind}><i className={'ti '+ICON}></i></span>
      <span className="s5-nm wide">{title}</span>
      <span className="sp"></span>
      {it.kind==='comment'&&<span className="s5-av">{P(it.who).i}</span>}
    </div>
    {open&&<div className="s5-ib2">
      <p>{body}</p>
      {it.check&&<div className="s5-check">{it.check.map((c,i)=><button key={i} className={(c.on?'on':'')+(c.ray?' ray':'')}
        onClick={()=>R.toggleChk(j,it.id,i)}><i className={'ti '+(c.on?'ti-square-check':'ti-square')}></i>
        <span>{c.t}</span>{c.ray&&<em>✦ proven</em>}</button>)}</div>}
      {it.who&&it.kind==='sign'&&<div className="s5-ppl">{it.who.map(w=><span key={w} className="s5-av">{P(w).i}</span>)}<span className="s5-av you">YOU</span></div>}
      <div className="s5-acts">
        <button className="s5-act yes" onClick={doYes}>{yes}</button>
        {no&&<button className="s5-act no" onClick={()=>{if(it.kind==='waiting')R.takeBack(j);else{R.deq(j,it.id);R.log(j,'Declined: '+(it.t||'item'),'you');R.emit();}}}>{no}</button>}
      </div></div>}
  </div>;
}

/* ═══════ the line ═══════ */
function Line({j,onFlash}){
  const [drag,setDrag]=useState(null);
  const pick=lvl=>{
    if(lvl>j.unlocked){onFlash('Locked — '+R.LEVELS[lvl].need);return;}
    const up=lvl>j.authority;
    R.setAuthority(j,lvl);
    onFlash(up?(j.justTook?'Ray just took '+j.justTook+' alerts off your desk':'Ray takes more of the work now')
      :'Ray brings more back to you');
    j.justTook=0;
  };
  return <div className="s5-line">
    <div className="s5-track">
      <div className="s5-fill" style={{width:(j.authority/4*100)+'%'}}></div>
      {R.LEVELS.map(l=>{const locked=l.k>j.unlocked;
        return <button key={l.k} className={'s5-notch'+(j.authority===l.k?' cur':'')+(j.authority>l.k?' past':'')+(locked?' locked':'')}
          style={{left:(l.k/4*100)+'%'}} onClick={()=>pick(l.k)}
          title={locked?('Locked — needs: '+l.need):l.d}>
          <i>{locked?<em className="ti ti-lock"></em>:null}</i>
          <span>{l.t}</span></button>;})}
    </div>
  </div>;
}

/* ═══════ the board ═══════ */
function Board({j}){
  const [pop,setPop]=useState(null);
  const [openId,setOpenId]=useState(null);
  const [flash,setFlash]=useState(null);
  const seen=useRef({});
  const [drops,setDrops]=useState([]);

  useEffect(()=>{if(!j.running&&!j.stream.length&&!j.stats.live)R.start(j);},[j.id]);
  const onFlash=t=>{setFlash(t);setTimeout(()=>setFlash(null),1900);};

  /* alerts Ray settled on its own fall upward into Ray's side */
  useEffect(()=>{
    const done=j.stream.filter(c=>c.kind==='decision'&&c.state==='done').slice(0,4);
    const fresh=done.filter(c=>!seen.current[c.id]);
    if(fresh.length){fresh.forEach(c=>{seen.current[c.id]=1;});
      setDrops(d=>[...fresh.map(c=>({id:c.id,t:c.alert.id+' · '+c.alert.out.toLowerCase()})),...d].slice(0,5));}
  },[j.stream.length]);

  const queue=j.queue;
  const first=queue[0];
  useEffect(()=>{if(first&&!openId)setOpenId(first.id);},[first&&first.id]);
  useEffect(()=>{if(openId&&!queue.some(q=>q.id===openId))setOpenId(queue[0]?queue[0].id:null);},[queue.length]);

  useEffect(()=>{
    const k=e=>{
      if(pop||e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
      if(e.key==='r'||e.key==='R'){e.preventDefault();setPop('rules');return;}
      if(e.key==='k'||e.key==='K'){e.preventDefault();setPop('ask');return;}
      if(e.key==='e'||e.key==='E'){e.preventDefault();setPop('papers');return;}
      const it=queue.find(q=>q.id===openId);
      if(!it||it.kind!=='decide')return;
      if(e.key==='a'||e.key==='A'){e.preventDefault();R.agree(j,it.id);}
    };
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[j,openId,queue.length,pop]);

  const rayRules=j.memory.filter(r=>r.on&&r.cat!=='ask').slice(0,4);
  const askRules=j.memory.filter(r=>r.on&&r.cat==='ask');
  const replay=j.stream.find(c=>c.kind==='replay'&&!c.done);

  return <div className="s5">
    <div className="s5-bar">
      <button className="s5-ib" onClick={()=>R.close()} title="All of Ray’s jobs"><i className="ti ti-arrow-left"></i></button>
      <b className="s5-title">{j.name}</b>
      <span className="s5-dot">{j.running?<i></i>:null}</span>
      <span className="sp"></span>
      <button className="s5-chip" onClick={()=>setPop('rules')} title="What Ray knows · R"><i className="ti ti-bulb"></i>{j.memory.length} rules</button>
      <button className="s5-ib" onClick={()=>setPop('ask')} title="Ask Ray · K"><i className="ti ti-message-circle"></i></button>
      <button className="s5-ib" onClick={()=>setPop('menu')} title="More"><i className="ti ti-dots"></i></button>
    </div>

    {/* ── above the line: Ray ── */}
    <div className="s5-ray">
      <div className="s5-zh"><span className="s5-orb">✦</span><b>Ray handles these alone</b>
        <span className="sp"></span>
        <span className="s5-big">{(j.stats.closedByRay||0).toLocaleString()}</span><em>decided without you{j.stats.live?' today':''}</em></div>
      <div className="s5-rayrules">
        {rayRules.map(r=><span key={r.id} className="s5-gate" title={r.text}>{r.text}</span>)}
        {!rayRules.length&&<span className="s5-gate ghost">nothing yet — teach it by correcting below</span>}
        {j.memory.length>rayRules.length&&<button className="s5-gate more" onClick={()=>setPop('rules')}>+{j.memory.length-rayRules.length} more</button>}
      </div>
      <div className="s5-drops">{drops.map(d=><span key={d.id} className="s5-drop">{d.t}</span>)}</div>
      {replay&&<div className="s5-replay"><i className="ti ti-loader-2"></i>
        Replaying your closed alerts — {replay.cnt.toLocaleString()} of {replay.n.toLocaleString()} · {replay.agree}% agreement
        <span className="bar"><i style={{width:(replay.cnt/replay.n*100)+'%'}}></i></span></div>}
    </div>

    {/* ── the line itself ── */}
    <Line j={j} onFlash={onFlash}/>

    {/* ── below the line: you ── */}
    <div className="s5-you">
      <div className="s5-zh you"><span className="s5-av you">YOU</span><b>Comes to you</b>
        <span className="sp"></span>
        {askRules.length>0&&<span className="s5-note">{askRules.length} rule{askRules.length>1?'s':''} say “ask me first”</span>}
        <span className="s5-big">{queue.length}</span><em>waiting</em></div>
      <div className="s5-list">
        {queue.map(it=><Item key={it.id} j={j} it={it} open={openId===it.id} onOpen={()=>setOpenId(it.id)} onFlash={onFlash}/>)}
        {!queue.length&&<div className="s5-clear"><i className="ti ti-check"></i>
          <div><b>Nothing needs you</b><span>Ray is working. The moment something crosses a line you set, it appears here.</span></div></div>}
      </div>
    </div>

    {flash&&<div className="s5-flash"><i className="ti ti-bulb"></i>{flash}</div>}
    {pop==='rules'&&<Rules j={j} onClose={()=>setPop(null)}/>}
    {pop==='ask'&&<Ask j={j} onClose={()=>setPop(null)}/>}
    {pop==='papers'&&<Papers j={j} onClose={()=>setPop(null)}/>}
    {pop==='menu'&&<Menu j={j} onClose={()=>setPop(null)} onHand={()=>setPop('hand')} onPapers={()=>setPop('papers')}/>}
    {pop==='hand'&&<Hand j={j} onClose={()=>setPop(null)}/>}
  </div>;
}

/* ═══════ hub ═══════ */
function Hub(){
  const [t,setT]=useState('');const [hear,setHear]=useState(false);
  const go=()=>{const v=t.trim();if(!v)return;setT('');R.hire(v);};
  return <div className="s5-hub">
    <div className="s5-hero">
      <span className="s5-orb big">✦</span>
      <h1>How much of this work should Ray take?</h1>
      <p>Name the job. Ray starts deciding at once, everything it is not yet trusted with comes to you,
        and you move the line as it earns more.</p>
      <div className={'s5-ask big'+(hear?' hearing':'')}>
        {hear?<div className="s5-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
          :<input autoFocus value={t} placeholder="Screen our UK payments against sanctions…"
            onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')go();}}/>}
        <button className={'s5-mic'+(hear?' on':' alive')} onClick={()=>{if(hear){setHear(false);R.hire('uk transaction screening');}else setHear(true);}}>
          <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
        <button className={'s5-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={go}><i className="ti ti-arrow-up"></i></button></div>
      <div className="s5-chips mid">{D.TEMPLATES.slice(0,3).map(x=><button key={x.id} onClick={()=>R.hireTpl(x.id)}>{x.t}</button>)}</div>
    </div>
    <div className="s5-jobs">
      {R.state.jobs.map(j=>{const pct=j.authority/4*100;
        return <button key={j.id} className="s5-job" onClick={()=>R.open(j.id)}>
          <div className="t"><b>{j.name}</b>{j.queue.length>0&&<span className="s5-badge">{j.queue.length}</span>}</div>
          <div className="s5-minibar"><i style={{width:pct+'%'}}></i></div>
          <div className="l"><span>Ray: {R.LEVELS[j.authority].t.toLowerCase()}</span><span className="sp"></span>
            <span>{j.memory.length} rules</span></div>
        </button>;})}
    </div>
  </div>;
}

function RayStudio5(){
  const [,setV]=useState(0);
  useEffect(()=>R.subscribe(setV),[]);
  useEffect(()=>{R.seed();},[]);
  const j=R.state.openId?R.get(R.state.openId):null;
  return <div className="s5root">{j?<Board key={j.id} j={j}/>:<Hub/>}</div>;
}
window.RayStudio5=RayStudio5;
})();
