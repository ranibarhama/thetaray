/* Studio next (v4) — THE DECK. Everything that needs a person arrives as one card.
   → agree · ← correct · ↑ why · space later · R rules · A authority · E evidence · K ask · ? keys */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,R=window.R4;
const P=w=>D.PEOPLE[w]||D.PEOPLE.you;
const md=t=>window.RSU&&window.RSU.md?window.RSU.md(t):t;
const OUTS=[['close','Close as false positive','ti-circle-check'],['esc','Escalate to L2','ti-arrow-up-right'],
  ['rfi','Escalate + request info','ti-mail-question'],['sar','Recommend a SAR','ti-flag']];
const SCOPES=[['like','Every alert like this','Becomes a rule Ray applies from now on'],
  ['one','Just this alert','A one-off. Ray learns nothing.'],
  ['ask','Ask me next time','Ray stops and asks on anything similar']];

/* ═══════════ the card ═══════════ */
function Card({j,it,depth,fly,mode,setMode,onDo}){
  if(depth>0)return <div className="k4-card behind" style={{'--d':depth}}></div>;
  const cls='k4-card'+(fly?' fly-'+fly:'');

  if(it.kind==='decide'){const a=it.alert;
    return <div className={cls+' k4-alert'}>
      <div className="k4-top"><span className="code">{a.id}</span>
        {it.fromReplay&&<span className="k4-pill">from the replay</span>}
        {it.later&&<span className="k4-pill">you parked this</span>}
        <span className="sp"></span><span className="k4-amt">{a.amt}</span></div>
      <div className="k4-who">{a.who}</div>
      <div className="k4-verdict"><em>Ray would</em><b>{a.out}</b>
        <span className="k4-conf"><i style={{width:a.conf+'%'}}></i><u>{a.conf}% sure</u></span></div>
      {mode==='why'&&<div className="k4-why">{a.why.map((w,i)=><div key={i}><i className="ti ti-point-filled"></i>
        <span><b>{w[0]}</b> — {w[1]}</span></div>)}</div>}
      {!mode&&<div className="k4-hint">press <kbd>↑</kbd> to see why Ray decided this</div>}
      {mode==='out'&&<div className="k4-pick">
        <div className="t">What should it have been?</div>
        {OUTS.filter(o=>o[1]!==a.out).map((o,i)=><button key={o[0]} onClick={()=>setMode('scope:'+o[0])}>
          <kbd>{i+1}</kbd><i className={'ti '+o[2]}></i>{o[1]}</button>)}
        <button className="gh" onClick={()=>setMode(null)}><kbd>esc</kbd>never mind</button></div>}
      {mode&&mode.indexOf('scope:')===0&&<div className="k4-pick">
        <div className="t">How far should that go?</div>
        {SCOPES.map((sc,i)=><button key={sc[0]} className={i===0?'pri':''} onClick={()=>onDo('correct',mode.split(':')[1],sc[0])}>
          <kbd>{i+1}</kbd><span><b>{sc[1]}</b><em>{sc[2]}</em></span></button>)}
        <button className="gh" onClick={()=>setMode('out')}><kbd>esc</kbd>back</button></div>}
    </div>;
  }

  if(it.kind==='milestone')return <div className={cls+' k4-mile'}>
    <span className="k4-big">{it.done}</span>
    <b>decisions coached</b>
    <p>Ray has learned <b>{it.rules} rules</b> from you. Everything it decides from here carries them.</p>
    <div className="k4-hint">press <kbd>→</kbd> to keep going</div></div>;

  if(it.kind==='propose')return <div className={cls+' k4-ray'}>
    <span className="k4-orb">✦</span><div className="k4-qt">{it.t}</div><p>{it.d}</p></div>;

  if(it.kind==='comment')return <div className={cls+' k4-person'}>
    <span className="k4-av big">{P(it.who).i}</span><div className="k4-qt">{it.t}</div><p>{it.d}</p></div>;

  if(it.kind==='unlock')return <div className={cls+' k4-up'}>
    <i className="ti ti-trending-up"></i><div className="k4-qt">{it.t}</div><p>{it.d}</p></div>;

  if(it.kind==='sign'){const left=(it.check||[]).filter(c=>!c.on).length;
    return <div className={cls+' k4-sign'}>
      <i className="ti ti-signature"></i><div className="k4-qt">{it.t}</div><p>{it.d}</p>
      {it.check&&<div className="k4-check">{it.check.map((c,i)=><button key={i} className={(c.on?'on':'')+(c.ray?' ray':'')}
        onClick={()=>R.toggleChk(j,it.id,i)}><i className={'ti '+(c.on?'ti-square-check':'ti-square')}></i>
        <span>{c.t}</span>{c.ray&&<em>✦ proven</em>}</button>)}</div>}
      <div className="k4-ppl">{(it.who||[]).map(w=><span key={w} className="k4-av">{P(w).i}</span>)}<span className="k4-av you">YOU</span></div>
      {left>0&&<div className="k4-hint warn">{left} still to confirm before this can be signed</div>}</div>;}

  if(it.kind==='waiting')return <div className={cls+' k4-person'}>
    <span className="k4-av big">{P(it.who).i}</span><div className="k4-qt">{it.t}</div><p>{it.d}</p></div>;

  return <div className={cls}><div className="k4-qt">{it.t||'—'}</div></div>;
}

/* ═══════════ overlays ═══════════ */
function Overlay({title,sub,onClose,children,wide}){
  useEffect(()=>{const k=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();onClose();}};
    window.addEventListener('keydown',k,true);return()=>window.removeEventListener('keydown',k,true);},[]);
  return <div className="k4-ov" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className={'k4-ovb'+(wide?' wide':'')}>
      <div className="k4-ovh"><div className="w"><b>{title}</b>{sub&&<span>{sub}</span>}</div><span className="sp"></span>
        <button className="k4-ib" onClick={onClose}><kbd>esc</kbd></button></div>
      <div className="k4-ovc">{children}</div></div></div>;
}

function Rules({j,onClose}){
  const [q,setQ]=useState('');
  const list=j.memory.filter(r=>!q||r.text.toLowerCase().includes(q.toLowerCase()));
  const CAT={policy:['ti-file-text','from your policy'],learned:['ti-bulb','you taught this'],
    ask:['ti-hand-stop','always asks you'],guard:['ti-shield-lock','never crossed']};
  return <Overlay title="What Ray knows" sub={j.memory.length+' rules · '+j.memory.filter(r=>r.cat==='learned').length+' taught by you'} onClose={onClose}>
    <div className="k4-srch"><i className="ti ti-search"></i><input autoFocus placeholder="Search the rules…" value={q} onChange={e=>setQ(e.target.value)}/></div>
    <div className="k4-rules">{list.map(r=>{const c=CAT[r.cat]||CAT.learned;
      return <div key={r.id} className={'k4-rule'+(r.on?'':' off')}>
        <button className={'k4-sw'+(r.on?' on':'')} onClick={()=>R.toggleRule(j,r.id)} title={r.on?'Turn off':'Turn on'}><i></i></button>
        <div><b>{r.text}</b><span><i className={'ti '+c[0]}></i>
          {r.src&&r.src.ref?(r.src.kind==='alert'?'learned from '+r.src.ref:r.src.ref):c[1]}
          {r.src&&r.src.by?' · '+P(r.src.by).n:''}<u>{r.conf}%</u></span></div></div>;})}
      {!list.length&&<div className="k4-none">Nothing matches “{q}”.</div>}</div>
    <button className="k4-b gh" onClick={()=>R.undo(j)}><i className="ti ti-arrow-back-up"></i>Undo the last thing you taught</button>
  </Overlay>;
}

function Authority({j,onClose}){
  return <Overlay title="How much may Ray do alone?" sub="Notches unlock only when the evidence earns them" onClose={onClose}>
    {R.LEVELS.map(l=>{const locked=l.k>j.unlocked,cur=l.k===j.authority;
      return <button key={l.k} className={'k4-lvl'+(cur?' cur':'')+(locked?' locked':'')}
        onClick={()=>{if(!locked){R.setAuthority(j,l.k);onClose();}}}>
        <span className="k">{locked?<i className="ti ti-lock"></i>:cur?<i className="ti ti-check"></i>:l.k}</span>
        <span className="w"><b>{l.t}</b><span>{locked?('Needs: '+l.need):l.d}</span></span>
        {cur&&<span className="k4-pill now">now</span>}</button>;})}
  </Overlay>;
}

const dl=(name,text)=>{const b=new Blob([text],{type:'text/plain'});const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);};
const playbookText=j=>'RAY PLAYBOOK — '+j.name+'\n'+Array(41).join('=')+'\n\nAuthority: '+R.LEVELS[j.authority].t+
  '\n\n'+j.memory.filter(r=>r.on).map((r,i)=>(i+1)+'. '+r.text+'\n   ['+(r.src&&r.src.ref?r.src.ref:'policy')+' · confidence '+r.conf+'%]').join('\n\n')+
  '\n\nSignatures: '+(j.signs.map(s=>P(s.who).n+' ('+s.at+')').join(', ')||'none')+'\n';

function Evidence({j,onClose}){
  const [tab,setTab]=useState('papers');
  const steps=j.memory.filter(r=>r.on);
  return <Overlay wide title="Everything behind the work" sub="Ray writes these from its rules — you never maintain them" onClose={onClose}>
    <div className="k4-tabs">{[['papers','What you can sign'],['flow','The flow'],['sources','Sources'],['trail','Audit trail']]
      .map(t=><button key={t[0]} className={tab===t[0]?'on':''} onClick={()=>setTab(t[0])}>{t[1]}</button>)}</div>
    {tab==='papers'&&<>
      {[['Playbook','Every rule as a numbered instruction, with the alert that taught it.','ti-list-numbers',()=>dl('ray-playbook.txt',playbookText(j))],
        ['Model risk document','What Ray decides, what it never decides, the evidence behind each threshold.','ti-shield-check',()=>dl('model-risk.txt','MODEL RISK DOCUMENT — '+j.name+'\n\nScope: '+R.LEVELS[j.authority].t+'\n'+playbookText(j))],
        ['Analyst guide','One page for the floor: what Ray handles, what still comes to them.','ti-users',()=>dl('analyst-guide.txt','ANALYST GUIDE — '+j.name+'\n\n'+playbookText(j))]]
        .map(x=><div key={x[0]} className="k4-exp"><i className={'ti '+x[2]}></i><div><b>{x[0]}</b><span>{x[1]}</span></div>
          <button className="k4-b" onClick={x[3]}><i className="ti ti-download"></i>Download</button></div>)}
      <div className="k4-sign2"><b>Signatures on file</b>{j.signs.length
        ? <div className="k4-ppl">{j.signs.map((s,i)=><span key={i} className="k4-av" title={P(s.who).n+' · '+s.at}>{P(s.who).i}</span>)}</div>
        : <span className="k4-none">None yet — a card asks for them when a notch needs them.</span>}</div></>}
    {tab==='flow'&&<div className="k4-flow">
      <div className="k4-fn start"><b>Alert raised</b></div>
      {steps.slice(0,6).map((r,i)=><React.Fragment key={r.id}>
        <div className="k4-fa"><i className="ti ti-arrow-down"></i></div>
        <div className={'k4-fn'+(r.cat==='ask'?' ask':r.cat==='guard'?' guard':'')}><span className="n">{i+1}</span><b>{r.text}</b>
          <span>{r.cat==='ask'?'Ray stops and asks you':r.cat==='guard'?'Ray never crosses this':'Ray decides this itself'}</span></div>
      </React.Fragment>)}
      <div className="k4-fa"><i className="ti ti-arrow-down"></i></div>
      <div className="k4-fn end"><b>Closed, escalated, or on your desk</b></div></div>}
    {tab==='sources'&&<>
      {j.docs.length?j.docs.map(d=><div key={d.id} className="k4-exp"><i className="ti ti-file-text"></i>
        <div><b>{d.n}</b><span>{d.s||'document'}</span></div>
        <button className="k4-ib" onClick={()=>R.delDoc(j,d.id)}><i className="ti ti-trash"></i></button></div>)
        :<div className="k4-none">Only your policy so far.</div>}
      <button className="k4-b" onClick={()=>R.addDocs(j,[{n:'AML Policy 2026.pdf',s:'policy · 48 clauses'},{n:'Escalation matrix.xlsx',s:'who decides what'}])}>
        <i className="ti ti-upload"></i>Add documents</button></>}
    {tab==='trail'&&<><div className="k4-trail">{j.trail.map(t=><div key={t.id} className="r">
      <span className={'k4-av'+(t.who==='you'?' you':'')}>{t.who==='ray'?'✦':P(t.who).i}</span>
      <span className="w"><b>{t.text}</b><em>{t.at}</em></span></div>)}
      {!j.trail.length&&<div className="k4-none">Nothing yet.</div>}</div>
      <button className="k4-b" onClick={()=>dl('audit-trail.txt',j.trail.map(t=>t.at+' · '+t.who+' · '+t.text).join('\n'))}>
        <i className="ti ti-download"></i>Download the trail</button></>}
  </Overlay>;
}

function Ask({j,onClose}){
  const [t,setT]=useState('');const [hear,setHear]=useState(false);
  const answers=j.stream.filter(c=>c.kind==='answer'||c.kind==='note'||c.kind==='you').slice(0,6);
  const send=v=>{const x=((v===undefined?t:v)||'').trim();if(!x)return;setT('');R.ask(j,x);};
  const chips=[['Is Ray ready?','is ray ready'],['Where are we?','where are we'],['What have you learned?','what have you learned'],
    ['Replay the closed alerts','replay'],['Give Ray less authority','less authority']];
  return <Overlay title="Ask Ray" sub="Or tell it what to change" onClose={onClose}>
    <div className={'k4-ask'+(hear?' hearing':'')}>
      {hear?<div className="k4-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
        :<input autoFocus value={t} placeholder="Ask anything…" onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}}/>}
      <button className={'k4-mic'+(hear?' on':' alive')} onClick={()=>{if(hear){setHear(false);send('is ray ready');}else setHear(true);}}>
        <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
      <button className={'k4-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={()=>send()}><i className="ti ti-arrow-up"></i></button></div>
    <div className="k4-chips">{chips.map(c=><button key={c[0]} onClick={()=>send(c[1])}>{c[0]}</button>)}</div>
    <div className="k4-answers">{answers.map(c=>c.kind==='you'
      ? <div key={c.id} className="k4-amsg you">{c.text}</div>
      : c.kind==='note'
      ? <div key={c.id} className="k4-amsg"><span className="k4-orb sm">✦</span><div>{md(c.text)}</div></div>
      : <div key={c.id} className="k4-ansb"><span className="q">{c.ask}</span><div className="a">{md(c.a)}</div>
          {c.facts&&c.facts.length>0&&<div className="k4-facts">{c.facts.map((f,i)=><div key={i}><span>{f[0]}</span><b>{f[1]}</b></div>)}</div>}</div>)}
      {!answers.length&&<div className="k4-none">Nothing asked yet.</div>}</div>
  </Overlay>;
}

function Keys({onClose}){
  const K=[['→','Agree with Ray'],['←','Correct it'],['↑','Why did Ray decide that'],['space','Park this one for later'],
    ['1–4','Pick the outcome, then how far it goes'],['R','What Ray knows'],['A','How much Ray may do alone'],
    ['E','Documents, flow, sources, audit trail'],['K','Ask Ray anything'],['?','This list'],['esc','Close anything']];
  return <Overlay title="Everything is a key" sub="You never have to reach for the mouse" onClose={onClose}>
    <div className="k4-keylist">{K.map(k=><div key={k[0]}><kbd>{k[0]}</kbd><span>{k[1]}</span></div>)}</div></Overlay>;
}

function Menu({j,onClose,onHand}){
  const rows=[
    ['ti-player-pause',j.running?'Pause Ray':'Let Ray work',j.running?'It stops deciding until you start it again':'It picks up where it left off',()=>{j.running?R.stop(j):R.start(j);}],
    ['ti-user-share','Hand the coaching over','Dana knows how your alerts are decided',()=>onHand()],
    ['ti-copy','Copy this job','Same rules, another country',()=>R.clone(j)],
    ['ti-arrow-back-up','Give Ray less authority','Reversible, and recorded',()=>R.rollback(j)]];
  if(j.stats.shadowDay>0&&j.stats.shadowDay<j.stats.shadowTotal)
    rows.splice(3,0,['ti-player-skip-forward','Fast-forward the four weeks','For the demo',()=>R.skipShadow(j)]);
  return <Overlay title={j.name} sub={R.LEVELS[j.authority].t} onClose={onClose}>
    {rows.map(r=><button key={r[1]} className="k4-row" onClick={()=>{r[3]();onClose();}}>
      <i className={'ti '+r[0]}></i><span className="w"><b>{r[1]}</b><em>{r[2]}</em></span></button>)}
    <button className="k4-row" onClick={()=>{onClose();R.close();}}><i className="ti ti-layout-grid"></i>
      <span className="w"><b>All of Ray’s jobs</b><em>Back to the list</em></span></button>
  </Overlay>;
}

function Hand({j,onClose}){
  const [who,setWho]=useState('dana');const [note,setNote]=useState('');
  return <Overlay title="Who should decide these?" sub="They get the same deck, the same rules, the same evidence" onClose={onClose}>
    {[['dana','Knows how your alerts are decided'],['tom','ThetaRay services — data and technical issues']].map(w=>
      <button key={w[0]} className={'k4-row'+(who===w[0]?' on':'')} onClick={()=>setWho(w[0])}>
        <span className="k4-av">{P(w[0]).i}</span><span className="w"><b>{P(w[0]).n}</b><em>{w[1]}</em></span>
        {who===w[0]&&<i className="ti ti-check"></i>}</button>)}
    <textarea className="k4-note" placeholder="Anything they should know? (optional)" value={note} onChange={e=>setNote(e.target.value)}/>
    <button className="k4-b pri" onClick={()=>{onClose();R.handTo(j,who,note.trim());}}>Hand it to {P(who).n.split(' ')[0]}</button>
  </Overlay>;
}

/* ═══════════ the deck ═══════════ */
function Deck({j}){
  const [fly,setFly]=useState(null);
  const [mode,setMode]=useState(null);
  const [ov,setOv]=useState(null);
  const [toast,setToast]=useState(null);
  const busy=useRef(false);
  const q=j.queue,card=q[0];

  useEffect(()=>{if(!j.running&&!j.stream.length&&!j.stats.live)R.start(j);},[j.id]);
  useEffect(()=>{setMode(null);},[card&&card.id]);
  const flash=t=>{setToast(t);setTimeout(()=>setToast(null),1700);};

  const act=(kind,a,b)=>{
    if(!card||busy.current)return;
    if(card.kind==='sign'&&kind==='yes'&&(card.check||[]).some(c=>!c.on)){flash('Confirm the checklist first');return;}
    busy.current=true;
    const before=j.memory.length;
    setFly(kind==='agree'||kind==='yes'?'right':kind==='later'?'down':'left');
    setTimeout(()=>{
      if(kind==='agree')R.agree(j,card.id);
      else if(kind==='correct')R.correct(j,card.id,a,b);
      else if(kind==='later')R.later(j,card.id);
      else if(kind==='yes'){
        if(card.kind==='propose'){
          if(card.act==='replay')R.replay(j,card.id);
          else{R.deq(j,card.id);if(card.rule){R.addRule(j,card.rule,{kind:'ray',ref:'Ray proposed it'},'learned',82);R.log(j,'Allowed: '+card.rule,'you');}R.emit();}
        }
        else if(card.kind==='unlock')R.unlock(j,card.id,card.lvl);
        else if(card.kind==='sign')R.sign(j,card.id);
        else if(card.kind==='comment'){R.deq(j,card.id);
          R.addRule(j,'Anything over $100,000 goes to a supervisor, not L2',{kind:'person',ref:'Dana Levi',by:'dana'},'learned',80);
          R.log(j,'Accepted Dana’s comment','you');R.emit();}
        else if(card.kind==='waiting')R.nudge(j);
        else {R.deq(j,card.id);R.emit();}
      }
      else if(kind==='no'){
        if(card.kind==='waiting')R.takeBack(j);
        else{R.deq(j,card.id);R.log(j,'Declined: '+(card.t||'card'),'you');R.emit();}
      }
      setFly(null);setMode(null);busy.current=false;
      if(j.memory.length>before)flash('Ray learned it');
    },230);
  };

  useEffect(()=>{
    const k=e=>{
      if(ov)return;
      if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
      const key=e.key;
      if(key==='r'||key==='R'){e.preventDefault();setOv('rules');return;}
      if(key==='a'||key==='A'){e.preventDefault();setOv('auth');return;}
      if(key==='e'||key==='E'){e.preventDefault();setOv('ev');return;}
      if(key==='k'||key==='K'){e.preventDefault();setOv('ask');return;}
      if(key==='?'||key==='/'){e.preventDefault();setOv('keys');return;}
      if(!card)return;
      const dec=card.kind==='decide';
      if(key==='Escape'){e.preventDefault();setMode(mode&&mode.indexOf('scope:')===0?'out':null);return;}
      if(mode==='out'||(mode&&mode.indexOf('scope:')===0)){
        const n=parseInt(key,10);
        if(n>=1&&n<=4){e.preventDefault();
          if(mode==='out'){const opts=OUTS.filter(o=>o[1]!==card.alert.out);if(opts[n-1])setMode('scope:'+opts[n-1][0]);}
          else if(SCOPES[n-1])act('correct',mode.split(':')[1],SCOPES[n-1][0]);}
        return;
      }
      if(key==='ArrowRight'){e.preventDefault();act(dec?'agree':'yes');}
      else if(key==='ArrowLeft'){e.preventDefault();dec?setMode('out'):act('no');}
      else if(key==='ArrowUp'&&dec){e.preventDefault();setMode(m=>m==='why'?null:'why');}
      else if(key===' '){e.preventDefault();act('later');}
    };
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);
  },[j,card&&card.id,mode,ov]);

  const taught=j.memory.filter(r=>r.cat==='learned'||r.cat==='ask').length;
  const dec=card&&card.kind==='decide';
  const yesLabel=!card?'':card.kind==='sign'?'Request and sign':card.kind==='unlock'?'Move the dial'
    :card.kind==='milestone'?'Keep going':card.kind==='comment'?'Accept':card.kind==='waiting'?'Nudge':(card.ok||'Yes');
  return <div className="k4">
    <div className="k4-bar">
      <button className="k4-ib" onClick={()=>R.close()} title="All of Ray’s jobs"><i className="ti ti-arrow-left"></i></button>
      <b className="k4-nm">{j.name}</b>
      <span className="k4-dot" title={j.running?'Ray is working':'Paused'}>{j.running?<i></i>:null}</span>
      <span className="sp"></span>
      <button className="k4-stat" onClick={()=>setOv('rules')} title="What Ray knows · R">
        <i className="ti ti-bulb"></i><b>{taught}</b><em>taught</em></button>
      <button className="k4-stat" onClick={()=>setOv('auth')} title="How much Ray may do alone · A">
        <span className="k4-notch">{R.LEVELS.map(l=><i key={l.k} className={(j.authority>=l.k?'on ':'')+(j.unlocked>=l.k?'ok':'lock')}></i>)}</span>
        <em>{R.LEVELS[j.authority].t}</em></button>
      <button className="k4-ib" onClick={()=>setOv('ev')} title="Documents, flow, sources, trail · E"><i className="ti ti-files"></i></button>
      <button className="k4-ib" onClick={()=>setOv('ask')} title="Ask Ray · K"><i className="ti ti-message-circle"></i></button>
      <button className="k4-ib" onClick={()=>setOv('keys')} title="Keys · ?"><i className="ti ti-keyboard"></i></button>
      <button className="k4-ib" onClick={()=>setOv('menu')} title="More"><i className="ti ti-dots"></i></button>
    </div>

    <div className="k4-stage">
      {card
        ? <div className="k4-stack">{q.slice(0,3).map((it,i)=><Card key={it.id} j={j} it={it} depth={i} fly={i===0?fly:null}
            mode={i===0?mode:null} setMode={setMode} onDo={act}/>)}</div>
        : <div className="k4-done"><i className="ti ti-check"></i><b>Nothing needs you</b>
            <p>Ray is working{j.stats.seen?' — '+j.stats.seen.toLocaleString()+' alerts decided so far':''}. The next card appears the moment something crosses a line you set.</p>
            <div className="k4-keys"><span><kbd>R</kbd>see what it knows</span><span><kbd>K</kbd>ask it something</span></div></div>}
    </div>

    <div className="k4-foot">
      <div className="k4-acts">
        {dec&&!mode&&<><button className="k4-act no" onClick={()=>setMode('out')}><kbd>←</kbd><i className="ti ti-pencil"></i>Correct</button>
          <button className="k4-act skip" onClick={()=>act('later')}><kbd>space</kbd>Later</button>
          <button className="k4-act yes" onClick={()=>act('agree')}><i className="ti ti-check"></i>Agree<kbd>→</kbd></button></>}
        {dec&&mode==='why'&&<><button className="k4-act skip" onClick={()=>setMode(null)}><kbd>↑</kbd>Hide</button>
          <button className="k4-act no" onClick={()=>setMode('out')}><kbd>←</kbd>Correct</button>
          <button className="k4-act yes" onClick={()=>act('agree')}>Agree<kbd>→</kbd></button></>}
        {card&&!dec&&<><button className="k4-act no" onClick={()=>act('no')}><kbd>←</kbd>{card.kind==='waiting'?'Decide myself':card.kind==='milestone'?'Later':'No'}</button>
          <button className="k4-act yes" onClick={()=>act('yes')}>{yesLabel}<kbd>→</kbd></button></>}
        {!card&&<span className="k4-waitmsg">waiting for the next thing that needs a person…</span>}
      </div>
      <span className="k4-count">{q.length?q.length+' in the deck':'deck empty'}</span>
    </div>

    {toast&&<div className="k4-toast"><i className="ti ti-bulb"></i>{toast}</div>}
    {ov==='rules'&&<Rules j={j} onClose={()=>setOv(null)}/>}
    {ov==='auth'&&<Authority j={j} onClose={()=>setOv(null)}/>}
    {ov==='ev'&&<Evidence j={j} onClose={()=>setOv(null)}/>}
    {ov==='ask'&&<Ask j={j} onClose={()=>setOv(null)}/>}
    {ov==='keys'&&<Keys onClose={()=>setOv(null)}/>}
    {ov==='menu'&&<Menu j={j} onClose={()=>setOv(null)} onHand={()=>setOv('hand')}/>}
    {ov==='hand'&&<Hand j={j} onClose={()=>setOv(null)}/>}
  </div>;
}

/* ═══════════ hub ═══════════ */
function Hub(){
  const [t,setT]=useState('');const [hear,setHear]=useState(false);
  const go=()=>{const v=t.trim();if(!v)return;setT('');R.hire(v);};
  return <div className="k4-hub">
    <div className="k4-hero">
      <span className="k4-orb big">✦</span>
      <h1>What should Ray take over?</h1>
      <p>Say it in one line. Ray starts deciding your alerts at once, and everything that needs a person
        comes to you as one card at a time — agree, correct, or park it.</p>
      <div className={'k4-ask big'+(hear?' hearing':'')}>
        {hear?<div className="k4-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
          :<input autoFocus value={t} placeholder="Screen our UK payments against sanctions…"
            onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')go();}}/>}
        <button className={'k4-mic'+(hear?' on':' alive')} onClick={()=>{if(hear){setHear(false);R.hire('uk transaction screening');}else setHear(true);}}>
          <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
        <button className={'k4-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={go}><i className="ti ti-arrow-up"></i></button></div>
      <div className="k4-chips mid">{D.TEMPLATES.slice(0,3).map(x=><button key={x.id} onClick={()=>R.hireTpl(x.id)}>{x.t}</button>)}</div>
    </div>
    <div className="k4-jobs">
      {R.state.jobs.map(j=><button key={j.id} className="k4-job" onClick={()=>R.open(j.id)}>
        <div className="t"><b>{j.name}</b>{j.queue.length>0&&<span className="k4-badge">{j.queue.length}</span>}</div>
        <div className="l"><span className="k4-notch">{R.LEVELS.map(l=><i key={l.k} className={(j.authority>=l.k?'on ':'')+(j.unlocked>=l.k?'ok':'lock')}></i>)}</span>
          {R.LEVELS[j.authority].t}</div>
        <div className="s">{j.stats.seen.toLocaleString()} decided · {j.memory.length} rules{j.stats.agree?' · '+j.stats.agree+'% agreement':''}</div>
      </button>)}
    </div>
  </div>;
}

function RayStudio4(){
  const [,setV]=useState(0);
  useEffect(()=>R.subscribe(setV),[]);
  useEffect(()=>{R.seed();},[]);
  const j=R.state.openId?R.get(R.state.openId):null;
  return <div className="n4">{j?<Deck key={j.id} j={j}/>:<Hub/>}</div>;
}
window.RayStudio4=RayStudio4;
})();
