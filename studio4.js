/* Studio next (v4) — one surface: Ray at work · Needs a person · Ray's memory (text/babel) */
(function(){
const {useState,useEffect,useRef}=React;
const D=window.RSD,R=window.R4;
const P=w=>D.PEOPLE[w]||D.PEOPLE.you;
const md=t=>window.RSU&&window.RSU.md?window.RSU.md(t):t;
const OUTS=[['close','Close as false positive','ti-circle-check'],['esc','Escalate to L2','ti-arrow-up-right'],
  ['rfi','Escalate + request info','ti-mail-question'],['sar','Recommend a SAR','ti-flag']];

/* ─────────── the authority dial ─────────── */
function Dial({j,onPick}){
  const [open,setOpen]=useState(false);
  return <div className="n4-dialwrap">
    <button className="n4-dial" onClick={()=>setOpen(o=>!o)} title="How much Ray may do alone">
      <span className="lbl"><em>Authority</em><b>{R.LEVELS[j.authority].t}</b></span>
      <span className="n4-notches">{R.LEVELS.map(l=><i key={l.k} className={(j.authority>=l.k?'on ':'')+(j.unlocked>=l.k?'ok':'lock')}></i>)}</span>
      <i className="ti ti-chevron-down"></i></button>
    {open&&<div className="n4-dialpop" onMouseLeave={()=>setOpen(false)}>
      <div className="hd">How much may Ray do alone?<span>Each notch unlocks only when the evidence earns it.</span></div>
      {R.LEVELS.map(l=>{const locked=l.k>j.unlocked,cur=l.k===j.authority;
        return <button key={l.k} className={'n4-lvl'+(cur?' cur':'')+(locked?' locked':'')}
          onClick={()=>{if(!locked){onPick(l.k);setOpen(false);}}}>
          <span className="k">{locked?<i className="ti ti-lock"></i>:cur?<i className="ti ti-check"></i>:l.k}</span>
          <span className="w"><b>{l.t}</b><span>{locked?('Needs: '+l.need):l.d}</span></span>
          {cur&&<span className="n4-tag">now</span>}</button>;})}
    </div>}
  </div>;
}

/* ─────────── stream cards ─────────── */
function Why({a}){return <div className="n4-why">{a.why.map((w,i)=><div key={i} className="r">
  <i className="ti ti-point-filled"></i><span><b>{w[0]}</b> — {w[1]}</span></div>)}</div>;}

function Decision({c}){
  const [o,setO]=useState(false);const a=c.alert;
  const tone=c.state==='corrected'?'corr':c.state==='agreed'?'ok':c.state==='queued'?'wait':'';
  return <div className={'n4-card dec '+tone}>
    <div className="n4-dh">
      <span className="code">{a.id}</span>
      <span className="who">{a.who} · {a.amt}</span>
      <span className="sp"></span>
      {c.state==='queued'&&<span className="n4-tag wait">waiting for you</span>}
      {c.state==='agreed'&&<span className="n4-tag ok"><i className="ti ti-check"></i>you agreed</span>}
      {c.state==='corrected'&&<span className="n4-tag corr"><i className="ti ti-pencil"></i>you corrected</span>}
    </div>
    <div className="n4-out">
      {c.state==='corrected'
        ? <><del>{a.out}</del><i className="ti ti-arrow-right"></i><b>{c.correctedTo}</b></>
        : <b>{a.out}</b>}
      <span className="n4-conf" title="How sure Ray is"><i style={{width:a.conf+'%'}}></i><em>{a.conf}%</em></span>
    </div>
    <button className="n4-link" onClick={()=>setO(x=>!x)}><i className={'ti '+(o?'ti-chevron-up':'ti-chevron-down')}></i>{o?'Hide the reasoning':'Why'}</button>
    {o&&<Why a={a}/>}
  </div>;
}

function Replay({c}){
  return <div className="n4-card rep">
    <div className="n4-rh"><i className={'ti '+(c.done?'ti-circle-check':'ti-loader-2')}></i>
      <b>{c.done?'Replay '+c.round+' complete':'Replaying your closed alerts'}</b>
      <span className="sp"></span><span className="num">{c.cnt.toLocaleString()} / {c.n.toLocaleString()}</span></div>
    <div className="n4-prog"><i style={{width:(c.cnt/c.n*100)+'%'}}></i></div>
    <div className="n4-agree"><b>{c.agree}%</b> agreement with your analysts<span className="bar"><i style={{width:c.agree+'%'}}></i><em style={{left:'90%'}} title="the 90% bar"></em></span></div>
  </div>;
}

function Stream({j,onJump}){
  return <div className="n4-stream">
    {j.stream.map(c=>{
      if(c.kind==='decision')return <Decision key={c.id} c={c}/>;
      if(c.kind==='replay')return <Replay key={c.id} c={c}/>;
      if(c.kind==='learned')return <div key={c.id} className="n4-learn"><i className="ti ti-bulb"></i>
        <span><b>+{c.n} learned</b> · {c.text}</span>
        {c.ruleId&&<button className="n4-link" onClick={()=>onJump(c.ruleId)}>show the rule</button>}</div>;
      if(c.kind==='digest')return <div key={c.id} className="n4-card dig"><div className="n4-digg">
        {[['Alerts this week',c.n.toLocaleString()],['Closed by Ray',c.closed.toLocaleString()],['Escalated',String(c.esc)],['Agreement',c.agree+'%']]
          .map(x=><div key={x[0]}><b>{x[1]}</b><span>{x[0]}</span></div>)}</div></div>;
      if(c.kind==='you')return <div key={c.id} className="n4-you">{c.text}</div>;
      if(c.kind==='answer')return <div key={c.id} className="n4-card ans">
        <span className="q">{c.ask}</span><div className="a">{md(c.a)}</div>
        {c.facts&&c.facts.length>0&&<div className="n4-facts">{c.facts.map((f,i)=><div key={i} className="r"><span className="k">{f[0]}</span><span className="v">{f[1]}</span></div>)}</div>}</div>;
      return <div key={c.id} className="n4-say"><span className="orb">✦</span><div>{md(c.text)}</div></div>;
    })}
    {!j.stream.length&&<div className="n4-empty"><span className="orb">✦</span>Ray has not started yet.</div>}
  </div>;
}

/* ─────────── the queue ─────────── */
function Correct({onPick,onCancel}){
  const [out,setOut]=useState(null);
  if(!out)return <div className="n4-corr">
    <div className="t">What should it have been?</div>
    <div className="opts">{OUTS.map(o=><button key={o[0]} onClick={()=>setOut(o[0])}><i className={'ti '+o[2]}></i>{o[1]}</button>)}</div>
    <button className="n4-link" onClick={onCancel}>never mind</button></div>;
  return <div className="n4-corr">
    <div className="t">How far should that go?</div>
    <div className="opts scope">
      <button onClick={()=>onPick(out,'one')}><b>Just this alert</b><span>A one-off. Ray learns nothing.</span></button>
      <button className="pri" onClick={()=>onPick(out,'like')}><b>Every alert like this</b><span>Becomes a rule Ray applies from now on.</span></button>
      <button onClick={()=>onPick(out,'ask')}><b>Ask me next time</b><span>Ray stops and asks on anything similar.</span></button>
    </div>
    <button className="n4-link" onClick={()=>setOut(null)}>back</button></div>;
}

function QItem({j,it,focus}){
  const [mode,setMode]=useState(null);
  if(it.kind==='decide'){const a=it.alert;
    return <div className={'n4-q dec'+(focus?' focus':'')}>
      <div className="n4-qh"><span className="code">{a.id}</span><span className="who">{a.who} · {a.amt}</span>
        {it.fromReplay&&<span className="n4-tag">from the replay</span>}</div>
      <div className="n4-qout">Ray would <b>{a.out.toLowerCase()}</b><span className="n4-conf sm"><i style={{width:a.conf+'%'}}></i><em>{a.conf}%</em></span></div>
      {it.why&&<Why a={a}/>}
      {!mode&&<div className="n4-qa">
        <button className="n4-b pri" onClick={()=>R.agree(j,it.id)}><i className="ti ti-check"></i>Agree <kbd>A</kbd></button>
        <button className="n4-b" onClick={()=>setMode('c')}><i className="ti ti-pencil"></i>Correct <kbd>C</kbd></button>
        <button className="n4-b gh" onClick={()=>R.askWhy(j,it.id)}><i className="ti ti-help"></i>Why <kbd>?</kbd></button>
      </div>}
      {mode==='c'&&<Correct onCancel={()=>setMode(null)} onPick={(o,sc)=>{setMode(null);R.correct(j,it.id,o,sc);}}/>}
    </div>;
  }
  if(it.kind==='unlock')return <div className="n4-q up">
    <div className="n4-qt"><i className="ti ti-trending-up"></i>{it.t}</div><p>{it.d}</p>
    <div className="n4-qa"><button className="n4-b pri" onClick={()=>R.unlock(j,it.id,it.lvl)}>Move the dial</button>
      <button className="n4-b gh" onClick={()=>R.deq(j,it.id)||R.emit()}>Not yet</button></div></div>;
  if(it.kind==='sign'){const left=(it.check||[]).filter(c=>!c.on).length;
    return <div className="n4-q sign">
    <div className="n4-qt"><i className="ti ti-signature"></i>{it.t}</div><p>{it.d}</p>
    {it.check&&<div className="n4-check">{it.check.map((c,i)=><button key={i} className={'r'+(c.on?' on':'')+(c.ray?' ray':'')}
      onClick={()=>R.toggleChk(j,it.id,i)} title={c.ray?'Ray proved this one':'Tap to confirm'}>
      <i className={'ti '+(c.on?'ti-square-check':'ti-square')}></i><span>{c.t}</span>
      {c.ray&&<em>✦ proven by Ray</em>}</button>)}</div>}
    <div className="n4-ppl">{(it.who||[]).map(w=><span key={w} className="n4-av">{P(w).i}</span>)}<span className="n4-av you">YOU</span></div>
    <div className="n4-qa"><button className="n4-b pri" disabled={left>0} onClick={()=>R.sign(j,it.id)}>
        {left>0?left+' to confirm first':'Request and sign'}</button>
      <button className="n4-b gh" onClick={()=>R.deq(j,it.id)||R.emit()}>Later</button></div></div>;}
  if(it.kind==='comment')return <div className="n4-q cmt">
    <div className="n4-qt"><span className="n4-av">{P(it.who).i}</span>{it.t}</div><p>{it.d}</p>
    <div className="n4-qa"><button className="n4-b pri" onClick={()=>{R.deq(j,it.id);
      R.addRule(j,'Anything over $100,000 goes to a supervisor, not L2',{kind:'person',ref:'Dana Levi',by:'dana'},'learned',80);
      R.push(j,{kind:'learned',n:1,text:'Added from Dana’s comment. She has been told it is done.'});R.log(j,'Accepted Dana’s comment','you');R.emit();}}>Accept</button>
      <button className="n4-b gh" onClick={()=>{R.deq(j,it.id);R.log(j,'Declined Dana’s comment','you');R.emit();}}>Decline</button></div></div>;
  if(it.kind==='waiting')return <div className="n4-q wait">
    <div className="n4-qt"><span className="n4-av">{P(it.who).i}</span>{it.t}</div><p>{it.d}</p>
    <div className="n4-qa"><button className="n4-b" onClick={()=>R.nudge(j)}><i className="ti ti-bell"></i>Nudge</button>
      <button className="n4-b gh" onClick={()=>R.takeBack(j)}>Decide them myself</button></div></div>;
  // propose
  return <div className="n4-q pro">
    <div className="n4-qt"><span className="orb">✦</span>{it.t}</div><p>{it.d}</p>
    <div className="n4-qa"><button className="n4-b pri" onClick={()=>{
      if(it.act==='replay'){R.replay(j,it.id);return;}
      R.deq(j,it.id);if(it.rule){R.addRule(j,it.rule,{kind:'ray',ref:'Ray proposed it'},'learned',82);
        R.push(j,{kind:'learned',n:1,text:'Allowed: '+it.rule});R.log(j,'Allowed: '+it.rule,'you');}
      R.emit();}}>{it.ok||'Do it'}</button>
      <button className="n4-b gh" onClick={()=>{R.deq(j,it.id);R.log(j,'Declined: '+it.t,'you');R.emit();}}>No</button></div></div>;
}

/* ─────────── memory ─────────── */
function Memory({j,flash}){
  const [q,setQ]=useState('');const [ed,setEd]=useState(null);const [txt,setTxt]=useState('');
  const list=j.memory.filter(r=>!q||r.text.toLowerCase().includes(q.toLowerCase()));
  const CAT={policy:['ti-file-text','from your policy'],learned:['ti-bulb','learned from an alert'],
    ask:['ti-hand-stop','always asks you'],guard:['ti-shield-lock','a line Ray never crosses']};
  return <div className="n4-mem">
    <div className="n4-memtop">
      <button className="n4-link" onClick={()=>R.undo(j)}><i className="ti ti-arrow-back-up"></i>Undo the last thing you taught</button>
    </div>
    <div className="n4-search"><i className="ti ti-search"></i>
      <input placeholder={'Search '+j.memory.length+' rules…'} value={q} onChange={e=>setQ(e.target.value)}/></div>
    {list.map(r=>{const c=CAT[r.cat]||CAT.learned;
      return <div key={r.id} className={'n4-rule'+(r.on?'':' off')+(flash===r.id?' flash':'')}>
        <button className={'n4-sw'+(r.on?' on':'')} onClick={()=>R.toggleRule(j,r.id)} title={r.on?'Turn this rule off':'Turn it back on'}><i></i></button>
        <div className="w">
          {ed===r.id
            ? <div className="n4-edit"><textarea autoFocus value={txt} onChange={e=>setTxt(e.target.value)}/>
                <div><button className="n4-b pri sm" onClick={()=>{R.editRule(j,r.id,txt.trim()||r.text);setEd(null);}}>Save</button>
                  <button className="n4-b gh sm" onClick={()=>setEd(null)}>Cancel</button></div></div>
            : <b onClick={()=>{setEd(r.id);setTxt(r.text);}} title="Click to edit">{r.text}</b>}
          <span className="src"><i className={'ti '+c[0]}></i>
            {r.src&&r.src.ref?<>{r.src.kind==='alert'?'learned from ':''}{r.src.ref}{r.src.by?' · '+P(r.src.by).n:''}</>:c[1]}
            <span className="n4-cf" title={'Ray’s confidence: '+r.conf+'%'}><i style={{width:r.conf+'%'}}></i></span></span>
        </div></div>;})}
    {!list.length&&<div className="n4-none">Nothing matches “{q}”.</div>}
  </div>;
}

/* ─────────── exports / sources / trail ─────────── */
const dl=(name,text)=>{const b=new Blob([text],{type:'text/plain'});const u=URL.createObjectURL(b);
  const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1500);};
const playbookText=j=>'RAY PLAYBOOK — '+j.name+'\n'+'='.repeat(40)+'\n\nAuthority: '+R.LEVELS[j.authority].t+
  '\nRules Ray applies ('+j.memory.filter(r=>r.on).length+'):\n\n'+
  j.memory.filter(r=>r.on).map((r,i)=>(i+1)+'. '+r.text+'\n   ['+(r.src&&r.src.ref?r.src.ref:'policy')+' · confidence '+r.conf+'%]').join('\n\n')+
  '\n\nSignatures: '+(j.signs.map(s=>P(s.who).n+' ('+s.at+')').join(', ')||'none')+'\n';

function Sheet({j,tab,onClose,onTab}){
  const steps=j.memory.filter(r=>r.on);
  return <div className="n4-sheetwrap" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="n4-sheet">
      <div className="n4-sh"><b>Everything behind the work</b>
        <span className="sp"></span><button className="n4-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
      <div className="n4-tabs">{[['exports','What you can sign'],['flow','The flow'],['sources','Sources'],['trail','Audit trail']]
        .map(t=><button key={t[0]} className={tab===t[0]?'on':''} onClick={()=>onTab(t[0])}>{t[1]}</button>)}</div>
      <div className="n4-sb">
        {tab==='exports'&&<>
          <p className="n4-lead">Ray writes these from its memory whenever you ask. They are the documents your regulator reads — not something you have to keep up to date by hand.</p>
          {[['Playbook','Every rule as a numbered instruction, with the alert that taught it.','ti-list-numbers',()=>dl('ray-playbook.txt',playbookText(j))],
            ['Model risk document','What Ray decides, what it never decides, and the evidence behind each threshold.','ti-shield-check',()=>dl('model-risk.txt','MODEL RISK DOCUMENT — '+j.name+'\n\nScope: '+R.LEVELS[j.authority].t+'\n'+playbookText(j))],
            ['Analyst guide','One page for the floor: what Ray handles, what still comes to them.','ti-users',()=>dl('analyst-guide.txt','ANALYST GUIDE — '+j.name+'\n\nRay handles: clear false positives.\nYou still handle: everything it asks about.\n\n'+playbookText(j))]]
            .map(x=><div key={x[0]} className="n4-exp"><i className={'ti '+x[2]}></i>
              <div><b>{x[0]}</b><span>{x[1]}</span></div><button className="n4-b" onClick={x[3]}><i className="ti ti-download"></i>Download</button></div>)}
          <div className="n4-signbox"><b>Signatures on file</b>
            {j.signs.length?<div className="n4-ppl">{j.signs.map((s,i)=><span key={i} className="n4-av" title={P(s.who).n+' · '+s.at}>{P(s.who).i}</span>)}</div>
              :<span className="n4-none">None yet — the dial asks for them when a notch needs them.</span>}</div></>}
        {tab==='flow'&&<>
          <p className="n4-lead">The same rules drawn as the flow your team is used to. Ray generates it; you never maintain it.</p>
          <div className="n4-flow">
            <div className="n4-fn start"><b>Alert raised</b><span>every alert in scope</span></div>
            {steps.slice(0,6).map((r,i)=><React.Fragment key={r.id}>
              <div className="n4-fa"><i className="ti ti-arrow-down"></i></div>
              <div className={'n4-fn'+(r.cat==='ask'?' ask':r.cat==='guard'?' guard':'')}>
                <span className="n">{i+1}</span><b>{r.text}</b>
                <span>{r.cat==='ask'?'Ray stops and asks you':r.cat==='guard'?'Ray never crosses this':'Ray decides this itself'}</span></div>
            </React.Fragment>)}
            <div className="n4-fa"><i className="ti ti-arrow-down"></i></div>
            <div className="n4-fn end"><b>Closed, escalated, or on your desk</b><span>whichever the rules above reached</span></div>
          </div></>}
        {tab==='sources'&&<>
          <p className="n4-lead">What Ray read. Add or remove anything at any time — every change shows up as a rule, never as a silent edit.</p>
          {j.docs.length?j.docs.map(d=><div key={d.id} className="n4-doc"><i className="ti ti-file-text"></i>
            <div><b>{d.n}</b><span>{d.s||'document'}</span></div>
            <button className="n4-ib" onClick={()=>R.delDoc(j,d.id)} title="Remove"><i className="ti ti-trash"></i></button></div>)
            :<div className="n4-none">Only your policy so far.</div>}
          <button className="n4-b" onClick={()=>R.addDocs(j,[{n:'AML Policy 2026.pdf',s:'policy · 48 clauses'},{n:'Escalation matrix.xlsx',s:'who decides what'}])}>
            <i className="ti ti-upload"></i>Add documents</button></>}
        {tab==='trail'&&<>
          <p className="n4-lead">Every decision, in order, with who made it. Downloadable for the regulator.</p>
          <div className="n4-trail">{j.trail.map(t=><div key={t.id} className="r">
            <span className={'n4-av'+(t.who==='you'?' you':'')}>{t.who==='ray'?'✦':P(t.who).i}</span>
            <span className="w"><b>{t.text}</b><em>{t.at}</em></span></div>)}
            {!j.trail.length&&<div className="n4-none">Nothing yet.</div>}</div>
          <button className="n4-b" onClick={()=>dl('audit-trail.txt',j.trail.map(t=>t.at+' · '+t.who+' · '+t.text).join('\n'))}><i className="ti ti-download"></i>Download the trail</button></>}
      </div>
    </div></div>;
}

/* ─────────── the ask bar ─────────── */
function AskBar({j}){
  const [t,setT]=useState('');const [hear,setHear]=useState(false);const ta=useRef(null);
  const send=()=>{const v=t.trim();if(!v)return;setT('');R.ask(j,v);};
  useEffect(()=>{const k=e=>{if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();ta.current&&ta.current.focus();}};
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[]);
  const chips=[['Is Ray ready?','is ray ready'],['Where are we?','where are we'],['What have you learned?','what have you learned'],['Why that decision?','why']];
  return <div className="n4-askwrap">
    <div className="n4-chips">{chips.map(c=><button key={c[0]} onClick={()=>R.ask(j,c[1])}>{c[0]}</button>)}</div>
    <div className={'n4-ask'+(hear?' hearing':'')}>
      {hear?<div className="n4-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
        :<input ref={ta} value={t} placeholder="Ask Ray anything, or tell it what to change…   ⌘K"
          onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}}/>}
      <button className={'n4-mic'+(hear?' on':' alive')} title={hear?'Stop':'Speak to Ray'}
        onClick={()=>{if(hear){setHear(false);R.ask(j,'is ray ready');}else setHear(true);}}>
        <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
      <button className={'n4-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={send}><i className="ti ti-arrow-up"></i></button>
    </div>
  </div>;
}

function Hand({j,onClose}){
  const [who,setWho]=useState('dana');const [note,setNote]=useState('');
  const who3=[['dana','Knows how your alerts are decided'],['tom','ThetaRay services — handles data and technical issues'],['you','Keep it yourself']];
  return <div className="n4-sheetwrap" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="n4-sheet sm">
      <div className="n4-sh"><b>Who should decide these?</b><span className="sp"></span>
        <button className="n4-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
      <div className="n4-sb">
        <p className="n4-lead">They get the same queue, the same rules and the same evidence. Nothing waits on you while they work, and you can take it back at any time.</p>
        {who3.map(w=><button key={w[0]} className={'n4-pick'+(who===w[0]?' on':'')} onClick={()=>setWho(w[0])}>
          <span className="n4-av">{P(w[0]).i}</span><span className="w"><b>{P(w[0]).n}</b><span>{w[1]}</span></span>
          {who===w[0]&&<i className="ti ti-check"></i>}</button>)}
        <textarea className="n4-note" placeholder="Anything they should know? (optional)" value={note} onChange={e=>setNote(e.target.value)}/>
        <div className="n4-qa"><button className="n4-b pri" onClick={()=>{onClose();if(who!=='you')R.handTo(j,who,note.trim());}}>
          {who==='you'?'Keep it':'Hand it to '+P(who).n.split(' ')[0]}</button>
          <button className="n4-b gh" onClick={onClose}>Cancel</button></div>
      </div></div></div>;
}

/* ─────────── the desk ─────────── */
function Desk({j}){
  const [sheet,setSheet]=useState(null);const [more,setMore]=useState(false);const [hand,setHand]=useState(false);
  const [flash,setFlash]=useState(null);const [side,setSide]=useState('queue');
  const strRef=useRef(null);
  useEffect(()=>{if(strRef.current)strRef.current.scrollTop=0;},[j.stream.length]);
  // opening a job that has never run starts Ray at once — there is no "set up" step to sit through
  useEffect(()=>{if(!j.running&&!j.stream.length&&!j.stats.live)R.start(j);},[j.id]);
  useEffect(()=>{const k=e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    const first=j.queue.find(q=>q.kind==='decide');if(!first)return;
    if(e.key==='a'||e.key==='A'){e.preventDefault();R.agree(j,first.id);}
    if(e.key==='?'){e.preventDefault();R.askWhy(j,first.id);}};
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[j,j.queue.length]);
  const jump=id=>{setSide('memory');setFlash(id);setTimeout(()=>setFlash(null),1600);};
  const n=j.queue.length;
  return <div className="n4-desk">
    <div className="n4-head">
      <button className="n4-ib" onClick={()=>R.close()} title="All of Ray’s jobs"><i className="ti ti-arrow-left"></i></button>
      <div className="tt"><b>{j.name}</b><span>{j.stats.live?'working alone on low risk':j.running?'working now':'paused'}
        {j.stats.shadowDay>0&&j.stats.shadowDay<j.stats.shadowTotal?' · beside your analysts, day '+j.stats.shadowDay+' of '+j.stats.shadowTotal:''}</span></div>
      <span className="sp"></span>
      <Dial j={j} onPick={l=>R.setAuthority(j,l)}/>
      <button className="n4-ib" title={j.running?'Pause Ray':'Let Ray work'} onClick={()=>j.running?R.stop(j):R.start(j)}>
        <i className={'ti '+(j.running?'ti-player-pause':'ti-player-play')}></i></button>
      <button className="n4-ib" onClick={()=>setSheet('exports')} title="Documents, flow, sources, audit trail"><i className="ti ti-files"></i></button>
      <button className="n4-ib" onClick={()=>setMore(m=>!m)} title="More"><i className="ti ti-dots"></i></button>
      {more&&<div className="n4-menu" onMouseLeave={()=>setMore(false)}>
        <button onClick={()=>{setMore(false);setSheet('trail');}}><i className="ti ti-shield-check"></i><span>Audit trail<small>Every decision, downloadable</small></span></button>
        <button onClick={()=>{setMore(false);setSheet('sources');}}><i className="ti ti-file-text"></i><span>Sources<small>Policy and documents Ray read</small></span></button>
        <button onClick={()=>{setMore(false);setHand(true);}}><i className="ti ti-user-share"></i><span>Hand the coaching over<small>Dana knows how alerts are decided</small></span></button>
        <button onClick={()=>{setMore(false);R.clone(j);}}><i className="ti ti-copy"></i><span>Copy this job<small>Same rules, another country</small></span></button>
        {j.stats.shadowDay>0&&j.stats.shadowDay<j.stats.shadowTotal&&
          <button onClick={()=>{setMore(false);R.skipShadow(j);}}><i className="ti ti-player-skip-forward"></i><span>Fast-forward the four weeks<small>For the demo</small></span></button>}
        <hr/>
        <button onClick={()=>{setMore(false);R.rollback(j);}}><i className="ti ti-arrow-back-up"></i><span>Give Ray less authority<small>Reversible, and recorded</small></span></button>
      </div>}
    </div>

    <div className="n4-body">
      <div className="n4-main" ref={strRef}>
        <div className="n4-mh"><span className="orb">✦</span><b>Ray at work</b>
          <span className="sp"></span>
          <span className="n4-live">{j.running&&<i className="dot"></i>}{j.stats.seen.toLocaleString()} decided{j.stats.closedByRay?' · '+j.stats.closedByRay.toLocaleString()+' closed by Ray':''}</span></div>
        <Stream j={j} onJump={jump}/>
      </div>

      <div className="n4-side">
        <div className="n4-stabs">
          <button className={side==='queue'?'on':''} onClick={()=>setSide('queue')}>Needs a person{n>0&&<span className="n4-badge">{n}</span>}</button>
          <button className={side==='memory'?'on':''} onClick={()=>setSide('memory')}>Ray’s memory<span className="n4-badge gh">{j.memory.length}</span></button>
        </div>
        {side==='queue'
          ? <div className="n4-qlist">
              {j.queue.filter(q=>q.kind==='propose'&&q.rule).length>1&&
                <button className="n4-allbtn" onClick={()=>R.acceptAll(j)}>
                  <i className="ti ti-checks"></i>Allow all {j.queue.filter(q=>q.kind==='propose'&&q.rule).length} proposals</button>}
              {j.queue.map((it,i)=><QItem key={it.id} j={j} it={it} focus={i===0&&it.kind==='decide'}/>)}
              {!n&&<div className="n4-quiet"><i className="ti ti-check"></i><b>Nothing needs you</b>
                <span>Ray is working. It will stop and ask the moment something crosses a line you set.</span></div>}
            </div>
          : <Memory j={j} flash={flash}/>}
      </div>
    </div>

    <AskBar j={j}/>
    {sheet&&<Sheet j={j} tab={sheet} onTab={setSheet} onClose={()=>setSheet(null)}/>}
    {hand&&<Hand j={j} onClose={()=>setHand(false)}/>}
  </div>;
}

/* ─────────── the hub ─────────── */
function Hub(){
  const [t,setT]=useState('');const [hear,setHear]=useState(false);
  const go=()=>{const v=t.trim();if(!v)return;setT('');R.hire(v);};
  const tpls=D.TEMPLATES.slice(0,3);
  return <div className="n4-hub">
    <div className="n4-hero">
      <span className="n4-orbbig">✦</span>
      <h1>What should Ray take over?</h1>
      <p>Say it in one line. Ray starts deciding your alerts straight away — you watch, correct it a few times, and raise how much it may do alone when the evidence says so.</p>
      <div className={'n4-ask big'+(hear?' hearing':'')}>
        {hear?<div className="n4-wave">{Array.from({length:11}).map((_,i)=><i key={i}></i>)}<span>Listening — just say it</span></div>
          :<input autoFocus value={t} placeholder="Screen our UK payments against sanctions…"
            onChange={e=>setT(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')go();}}/>}
        <button className={'n4-mic'+(hear?' on':' alive')} onClick={()=>{if(hear){setHear(false);R.hire('uk transaction screening');}else setHear(true);}}>
          <i className={'ti '+(hear?'ti-player-stop-filled':'ti-microphone')}></i></button>
        <button className={'n4-send'+(t.trim()?' on':'')} disabled={!t.trim()} onClick={go}><i className="ti ti-arrow-up"></i></button>
      </div>
      <div className="n4-tchips">{tpls.map(x=><button key={x.id} onClick={()=>R.hireTpl(x.id)}>
        <i className={'ti '+(D.CATS[x.cat]||{ic:'ti-briefcase'}).ic}></i>{x.t}</button>)}
        <button className="gh" onClick={()=>R.hireTpl('ts-example')}>or one of 24 jobs Ray already knows</button></div>
    </div>
    <div className="n4-staff">
      <div className="n4-sh2">Ray is already doing these</div>
      <div className="n4-cards">{R.state.jobs.map(j=>{
        const q=j.queue.length;
        return <button key={j.id} className="n4-jc" onClick={()=>R.open(j.id)}>
          <div className="top"><b>{j.name}</b>{q>0&&<span className="n4-badge">{q}</span>}</div>
          <div className="lvl"><span className="n4-notches sm">{R.LEVELS.map(l=><i key={l.k} className={(j.authority>=l.k?'on ':'')+(j.unlocked>=l.k?'ok':'lock')}></i>)}</span>{R.LEVELS[j.authority].t}</div>
          <div className="st">{j.stats.seen.toLocaleString()} decided · {j.memory.length} rules{j.stats.agree?' · '+j.stats.agree+'% agreement':''}</div>
        </button>;})}
      </div>
    </div>
  </div>;
}

function RayStudio4(){
  const [,setV]=useState(0);
  useEffect(()=>R.subscribe(setV),[]);
  useEffect(()=>{R.seed();},[]);
  const j=R.state.openId?R.get(R.state.openId):null;
  return <div className="n4">{j?<Desk key={j.id} j={j}/>:<Hub/>}</div>;
}
window.RayStudio4=RayStudio4;
})();
