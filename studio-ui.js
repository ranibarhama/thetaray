/* Ray Studio v3 — UI part 1: Brief, Playbook, readiness, margin notes, Sign sheet, audit (text/babel) */
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
const P=w=>D.PEOPLE[w]||D.PEOPLE.you;U.P=P;
U.Av=({who})=>who==='ray'?<span className="s3-orb sm">✦</span>:<span className={'s3-av'+(who==='you'?' you':'')} title={P(who).n+' · '+P(who).r}>{P(who).i}</span>;
const WHO={'System':'The system','Ray':'Ray','Analyst L1':'A level-1 analyst','Analyst L2':'A level-2 analyst','Supervisor':'A supervisor','MLRO':'The MLRO'};
const when=sla=>sla==='Instant'?'instantly':'within '+sla;
const order=wf=>[...wf.nodes].sort((a,b)=>a.r-b.r||a.c-b.c);
U.order=order;

/* ---------- Brief ---------- */
U.Brief=function({uc,onBrowse}){
  const b=uc.brief,t=E.tplOf(uc),c=t?D.CATS[t.cat]:null;
  const recs=['ts-example','ts-uk','tm-retail','pep-am'].map(i=>D.TEMPLATES.find(x=>x.id===i));
  return <div className="s3-paper">
    <div className="s3-kick"><i className="ti ti-file-description"></i>Brief</div>
    <div className="s3-title">{t?'Teach Ray: '+t.t:'What should Ray learn?'}</div>
    <p className="s3-lead">This is everything Ray needs to start. Change anything by tapping it — or just tell Ray.</p>
    <div className="s3-brs">
      <div className="s3-br"><div className="k"><i className="ti ti-briefcase"></i>Job</div><div className="v">
        {t?<div className="s3-picked"><span className="ic" style={{background:c.c+'1f',color:c.c}}><i className={'ti '+c.ic}></i></span><div style={{flex:1,minWidth:0}}><b>{t.t}</b><small style={{marginTop:2}}>{t.r} · {t.reg}</small></div><button className="s3-b gh sm" onClick={()=>onBrowse(id=>E.setBrief(uc,'tpl',id))}>Change</button></div>
          :<><div className="s3-jobs">{recs.map(x=>{const cc=D.CATS[x.cat];return <button key={x.id} className="s3-job" onClick={()=>E.setBrief(uc,'tpl',x.id)}><span className="ic" style={{background:cc.c+'1f',color:cc.c}}><i className={'ti '+cc.ic}></i></span>{x.t}</button>;})}</div>
            <button className="s3-b gh sm" style={{marginTop:6}} onClick={()=>onBrowse(id=>E.setBrief(uc,'tpl',id))}><i className="ti ti-layout-grid"></i>See all {D.TEMPLATES.length} jobs</button></>}
      </div></div>
      <div className="s3-br"><div className="k"><i className="ti ti-book"></i>Policy</div><div className="v">
        <div className="s3-seg"><button className={b.docs?'on':''} onClick={()=>E.setBrief(uc,'docs',true)}>Your documents</button><button className={!b.docs?'on':''} onClick={()=>E.setBrief(uc,'docs',false)}>ThetaRay template</button></div>
        <small>{b.docs?'Ray reads your policy and procedures (3 sample documents in this demo) and ties every step to a clause.':'A proven ThetaRay default — you can add your documents later.'}</small></div></div>
      <div className="s3-br"><div className="k"><i className="ti ti-file-text"></i>Report</div><div className="v">
        <div className="s3-seg"><button className={b.report==='predefined'?'on':''} onClick={()=>E.setBrief(uc,'report','predefined')}>Predefined</button><button className={b.report==='upload'?'on':''} onClick={()=>E.setBrief(uc,'report','upload')}>Your layout</button></div></div></div>
      <div className="s3-br"><div className="k"><i className="ti ti-school"></i>Practice on</div><div className="v">
        <div className="s3-seg">{['Last 3 months','Last 6 months','Last 12 months'].map(o=><button key={o} className={b.period===o&&!b.csv?'on':''} onClick={()=>{E.setBrief(uc,'csv',false);E.setBrief(uc,'period',o);}}>{o.replace('Last ','')}</button>)}
          <button className={b.csv?'on':''} onClick={()=>E.setBrief(uc,'csv',true)}><i className="ti ti-upload"></i>Labelled CSV</button></div>
        <small>{b.csv?'A curated file with the expected outcome on each alert (600 in this demo).':'Closed alerts your analysts already decided — Ray compares its calls with theirs.'}</small></div></div>
      <div className="s3-br you"><div className="k"><i className="ti ti-message-question"></i>Check with me</div><div className="v">
        <div className="s3-levels">{['every','important','sign'].map(k=><button key={k} className={'s3-level'+(b.level===k?' on':'')} onClick={()=>E.setBrief(uc,'level',k)}>
          {k==='important'&&<em>Recommended</em>}{k==='sign'&&<em>Autopilot</em>}<b><i className={'ti '+E.LV[k].ic}></i>{E.LV[k].t}</b><span>{E.LV[k].d}</span></button>)}</div></div></div>
      <div className="s3-br you"><div className="k"><i className="ti ti-lock"></i>Always yours</div><div className="v" style={{color:'var(--ink-2)',fontSize:13.5}}>Sanctions and risk thresholds, anything about filing, and every signature. Nothing touches a real alert until you sign go-live.</div></div>
    </div>
    <div className="s3-start"><button className="s3-b ai lg" disabled={!uc.tpl} onClick={()=>E.startBrief(uc)}><i className="ti ti-player-play"></i>Start</button>
      <span>Ray writes the playbook in front of you — about 10 seconds.</span></div>
  </div>;
};

/* ---------- Evidence drill-down ---------- */
function Ev({s}){
  const [o,setO]=useState(false);
  const n=parseInt((s.ev.match(/\d+/)||['3'])[0]);
  const rows=Array.from({length:Math.min(3,n)}).map((_,i)=>['A-'+(21000+((s.id.charCodeAt(1)*97+i*131)%900)),i%2?'Escalated':'Closed',i%2?'Closed':'Escalated']);
  return <>
    <button className="s3-ev" onClick={e=>{e.stopPropagation();setO(x=>!x);}}><i className="ti ti-chart-dots"></i>{s.ev} · {o?'hide':'see the alerts'}</button>
    {o&&<table className="s3-tbl" onClick={e=>e.stopPropagation()}><thead><tr><th>Alert</th><th>Analyst</th><th>Ray before</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td className="code">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}
      {n>3&&<tr><td colSpan="3" style={{color:'var(--ink-3)'}}>+ {n-3} more</td></tr>}</tbody></table>}
    {o&&<button className="s3-ev" style={{marginTop:6}} onClick={e=>{e.stopPropagation();const csv='Alert,Analyst,Ray\n'+rows.map(r=>r.join(',')).join('\n');
      const a2=document.createElement('a');a2.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a2.download='evidence_'+s.id+'.csv';document.body.appendChild(a2);a2.click();a2.remove();}}><i className="ti ti-download"></i>Download these alerts (CSV)</button>}</>;
}

/* ---------- edit a step directly ---------- */
function StepEdit({uc,n,num,close,talk}){
  const [role,setRole]=useState(n.role),[sla,setSla]=useState(n.sla),[ai,setAi]=useState(!!n.ai),[note,setNote]=useState('');
  const [acts,setActs]=useState((n.acts||[]).slice());
  const [adding,setAdding]=useState(false);
  const [nt,setNt]=useState(''),[nrole,setNrole]=useState('Analyst L1'),[nsla,setNsla]=useState('24 hours'),[nai,setNai]=useState(false);
  const actsChanged=JSON.stringify(acts.filter(x=>x.trim()))!==JSON.stringify(n.acts||[]);
  const dirty=role!==n.role||sla!==n.sla||ai!==!!n.ai||!!note.trim()||actsChanged;
  const apply=()=>{close();E.editStep(uc,n.id,{role,sla,ai,note,acts:actsChanged?acts.filter(x=>x.trim()):null});};
  return <div className="s3-edit" onClick={e=>e.stopPropagation()}>
    <div className="s3-eh"><i className="ti ti-pencil"></i>Edit step {num}<span className="sp"></span><button className="s3-ib" style={{width:26,height:26,fontSize:15}} onClick={close}><i className="ti ti-x"></i></button></div>
    <div className="s3-er"><label>Who handles it</label><div className="s3-seg">{E.ROLES.map(r=><button key={r} className={role===r?'on':''} onClick={()=>setRole(r)}>{r}</button>)}</div></div>
    <div className="s3-er"><label>How fast</label><div className="s3-seg">{E.SLAS.map(x=><button key={x} className={sla===x?'on':''} onClick={()=>setSla(x)}>{x}</button>)}</div></div>
    <div className="s3-er"><label>Decided by</label><div className="s3-seg"><button className={ai?'on':''} onClick={()=>setAi(true)}>✦ Ray</button><button className={!ai?'on':''} onClick={()=>setAi(false)}>A fixed rule</button></div></div>
    <div className="s3-er"><label>What happens</label><div style={{width:'100%'}}>
      {(acts||[]).map((x,i)=><div key={i} className="s3-actrow"><input value={x} onChange={e=>{const c=acts.slice();c[i]=e.target.value;setActs(c);}}/>
        <button className="s3-ib" style={{width:28,height:28,fontSize:14}} onClick={()=>setActs(acts.filter((_,j)=>j!==i))}><i className="ti ti-x"></i></button></div>)}
      <button className="s3-b gh sm" onClick={()=>setActs((acts||[]).concat(['']))}><i className="ti ti-plus"></i>Add a line</button></div></div>
    <div className="s3-er"><label>Add an instruction</label><textarea rows={2} value={note} placeholder={n.note?'Current: “'+n.note+'” — type to replace it':'e.g. always call the customer above €50,000'} onChange={e=>setNote(e.target.value)}/></div>
    {adding&&<div className="s3-newform" onClick={e=>e.stopPropagation()}>
      <input autoFocus value={nt} placeholder="What happens in the new step?" onChange={e=>setNt(e.target.value)}/>
      <div className="s3-er"><label>Who handles it</label><div className="s3-seg">{E.ROLES.map(r=><button key={r} className={nrole===r?'on':''} onClick={()=>setNrole(r)}>{r}</button>)}</div></div>
      <div className="s3-er"><label>How fast</label><div className="s3-seg">{E.SLAS.map(x=><button key={x} className={nsla===x?'on':''} onClick={()=>setNsla(x)}>{x}</button>)}</div></div>
      <div className="s3-er"><label>Decided by</label><div className="s3-seg"><button className={nai?'on':''} onClick={()=>setNai(true)}>✦ Ray</button><button className={!nai?'on':''} onClick={()=>setNai(false)}>A fixed rule</button></div></div>
      <div className="s3-ef"><button className="s3-b pri sm" disabled={!nt.trim()} onClick={()=>{close();E.addStep(uc,n.id,{t:nt,role:nrole,sla:nsla,ai:nai});}}><i className="ti ti-plus"></i>Add after step {num}</button>
        <button className="s3-b gh sm" onClick={()=>setAdding(false)}>Cancel</button></div></div>}
    <div className="s3-ef">
      <button className="s3-b ok sm" disabled={!dirty} onClick={apply}><i className="ti ti-check"></i>Apply{dirty?' changes':''}</button>
      {!adding&&<button className="s3-b sm" onClick={()=>setAdding(true)}><i className="ti ti-plus"></i>Add a step after</button>}
      <button className="s3-b danger sm" onClick={()=>{close();E.removeStep(uc,n.id);}}><i className="ti ti-trash"></i>Remove</button>
      <span className="sp"></span>
      <span className="s3-or"><i className="ti ti-microphone"></i><button className="s3-ev" onClick={()=>{close();talk();}}>or tell Ray instead</button></span>
    </div>
  </div>;
}

/* ---------- one playbook step ---------- */
function Step({uc,v,n,idx,num,onStep,readOnly,editId,setEditId}){
  const [cmtOpen,setCmtOpen]=useState(false);const [draft,setDraft]=useState('');const [sc,setSc]=useState(null);const [sct,setSct]=useState('');
  const tracked=x=>x&&!readOnly&&x.ver>uc.signedVer;
  const cg=tracked(n.chg)?n.chg:null;
  const F=f=>!cg?null:(cg.f===f?{before:cg.before,after:cg.after}:cg[f]);
  const open=editId===n.id&&!readOnly;
  const isNew=!readOnly&&n.isNew&&n.isNew>uc.signedVer;
  const fresh=Date.now()-uc.pulse.t<3500&&uc.pulse.ids.includes(n.id);
  const rf=F('role'),sf=F('sla'),tf=F('title'),nf=F('note'),af=F('ai');
  const who=rf?<><del className="s3d">{WHO[rf.before]||rf.before}</del> <ins className="s3i">{WHO[rf.after]||rf.after}</ins></>:(WHO[n.role]||n.role);
  const wh=sf?<>within <del className="s3d">{sf.before}</del> <ins className="s3i">{sf.after}</ins></>:when(n.sla);
  const title=tf?<><del className="s3d">{tf.before}</del> <ins className="s3i">{tf.after}</ins></>:n.t;
  const outs=v.wf.edges.filter(e=>e[0]===n.id&&e[2]).map(e=>({l:e[2],to:idx[e[1]]})).filter(o=>o.to);
  const pend=uc.train.rounds.length&&!readOnly?E.tuneSet(uc).filter(s=>s.node===n.id&&!uc.train.sugs[s.id]):[];
  const cmt=!readOnly&&uc.comment&&uc.comment.node===n.id?uc.comment:null;
  const tFresh=n.tuned&&!readOnly&&n.tunedVer>uc.signedVer;
  const myc=readOnly?[]:E.comments(uc).filter(c=>c.node===n.id&&!c.applied);
  const donec=readOnly?[]:E.comments(uc).filter(c=>c.node===n.id&&c.applied);
  return <div className={'s3-step'+(isNew?' new':'')+(fresh?(uc.pulse.fresh?' appear':' pulse'):'')} data-nid={n.id} onClick={()=>!readOnly&&setEditId(open?null:n.id)}>
    <span className="num">{num}</span>
    <div>
      <div className="hd"><span className="t">{title}</span>{n.ai&&<span className="s3-aitag">✦ AI</span>}{n.pol&&<span className="s3-cl">§{n.pol}</span>}{isNew&&<span className="s3-pill ok">New</span>}
        {!readOnly&&<span className="s3-editbtn"><i className="ti ti-pencil"></i>Edit</span>}
        {!readOnly&&<span className={'s3-cmtbtn'+(myc.length?' has':'')} onClick={e=>{e.stopPropagation();setCmtOpen(c=>!c);}} title="Comment on this step"><i className="ti ti-message-2"></i>{myc.length||''}</span>}</div>
      <div className="s">{who} {n.ai&&n.role==='Ray'?'decides':'handles this'} {wh}.</div>
      {n.acts&&n.acts.length>0&&<ul className="s3-acts">{n.acts.map((x,ai)=><li key={ai}>{af&&af.after===x?<ins className="s3i">{x}</ins>:x}</li>)}</ul>}
      {outs.length>0&&<div className="br">{outs.map(o=><span key={o.l}><i className="ti ti-corner-down-right"></i>If {o.l.toLowerCase()} → <b>step {o.to.num}</b></span>)}</div>}
      {af&&<div className="s3-tuned fresh"><i className="ti ti-sparkles"></i><span>Now <del className="s3d">{af.before}</del> <ins className="s3i">{af.after}</ins></span></div>}
      {n.note&&<div className="s3-tuned fresh"><i className="ti ti-message-2"></i><span>{nf?<ins className="s3i">Your instruction: “{n.note}”</ins>:'Your instruction: “'+n.note+'”'}</span></div>}
      {n.tuned&&<div className={'s3-tuned'+(tFresh?' fresh':'')}><i className="ti ti-sparkles"></i><span>{tFresh?<ins className="s3i">{n.tuned}</ins>:n.tuned}{tFresh&&n.tunedBy==='ray'?<span className="s3-pill" style={{marginLeft:6}}>Fixed by Ray</span>:null}</span></div>}
      {(cg||isNew)&&<div className="s3-chg"><i className="ti ti-git-commit"></i>{isNew?'Added':'Changed'} in v{(cg||{}).ver||n.isNew}{cg&&cg.by==='dana'?' from Dana’s suggestion':''}
        {E.cur(uc).n===((cg||{}).ver||n.isNew)&&<> · <button onClick={e=>{e.stopPropagation();E.undo(uc);}}>Undo</button></>}
        {uc.lastChange&&uc.lastChange.v===E.cur(uc).n&&<> · <button onClick={e=>{e.stopPropagation();E.say(uc,'Why?');}}>Why?</button></>}</div>}
      {pend.map(s=>{const held=uc.level==='sign'&&s.held;return <div key={s.id} className={'s3-sug'+(held?' held':'')} onClick={e=>e.stopPropagation()}>
        <div className="sh"><i className={'ti '+(held?'ti-hand-stop':'ti-sparkles')}></i>{held?'Held for you':'Ray suggests'}<span className="sp"></span><span className={'s3-pill '+(s.imp==='High'?'risk':'warn')}>{s.imp} impact</span></div>
        <div className="st">{s.t}</div>
        <div className="tx"><del className="s3d">{s.cur}</del><br/><ins className="s3i">{s.sug}</ins></div>
        <div className="acts"><button className="s3-b ok sm" onClick={()=>E.decideSug(uc,s.id,true)}><i className="ti ti-check"></i>Accept</button><button className="s3-b sm" onClick={()=>E.decideSug(uc,s.id,false)}>Reject</button>
          <button className="s3-b gh sm" onClick={()=>setSc(x=>x===s.id?null:s.id)}><i className="ti ti-message-2"></i>Comment</button><Ev s={s}/>
          <span className="sp"></span>{E.tuneSet(uc).filter(x=>!uc.train.sugs[x.id]).length>1&&<button className="s3-ev" onClick={()=>E.acceptAllSugs(uc)}>Accept all {E.tuneSet(uc).filter(x=>!uc.train.sugs[x.id]).length}</button>}
          {(uc.sugLog||[]).length>0&&<button className="s3-ev" onClick={()=>E.undoSug(uc)}>Undo last</button>}</div>
        {sc===s.id&&<div style={{marginTop:8}}><textarea className="s3-cin" rows={2} autoFocus value={sct} placeholder="Why does this need a change?" onChange={e=>setSct(e.target.value)}/>
          <div className="s3-ef" style={{borderTop:0,paddingTop:6}}><button className="s3-b pri sm" disabled={!sct.trim()} onClick={()=>{E.commentSug(uc,s.id,sct);setSct('');setSc(null);}}>Add comment</button>
            <button className="s3-b gh sm" onClick={()=>setSc(null)}>Cancel</button></div></div>}
      </div>;})}
      {(cmtOpen||myc.length>0)&&!readOnly&&<div className="s3-cmts" onClick={e=>e.stopPropagation()}>
        {myc.map(c=><div key={c.id} className="s3-cm"><U.Av who={c.by}/><div className="w"><b>{P(c.by).n}</b> · {c.at}<span>{c.text}</span></div>
          {c.by==='you'&&<button className="s3-ib" style={{width:24,height:24,fontSize:13}} onClick={()=>E.delComment(uc,c.id)}><i className="ti ti-trash"></i></button>}</div>)}
        {donec.length>0&&<div className="s3-capl"><i className="ti ti-check"></i>{donec.length} comment{donec.length>1?'s':''} applied in v{donec[donec.length-1].ver}</div>}
        {cmtOpen&&<><textarea className="s3-cin" rows={2} autoFocus value={draft} placeholder={'Tell Ray or your team what should change at step '+num+'…'} onChange={e=>setDraft(e.target.value)}
          onKeyDown={e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){E.addComment(uc,n.id,draft);setDraft('');}}}/>
        <div className="s3-ef" style={{borderTop:0,paddingTop:6}}>
          <button className="s3-b pri sm" disabled={!draft.trim()} onClick={()=>{E.addComment(uc,n.id,draft);setDraft('');}}><i className="ti ti-message-2"></i>Add comment</button>
          <button className="s3-b gh sm" onClick={()=>{setCmtOpen(false);setDraft('');}}>Cancel</button>
          <span className="sp"></span>
          {['Make it 24 hours','A supervisor should own this','Add a four-eyes check'].map(q=><button key={q} className="s3-ev" style={{fontSize:11.5}} onClick={()=>setDraft(q)}>{q}</button>)}
        </div></>}
      </div>}
      {open&&<StepEdit uc={uc} n={n} num={num} close={()=>setEditId(null)} talk={()=>onStep&&onStep(n,num)}/>}
      {cmt&&<div className="s3-sug dana" onClick={e=>e.stopPropagation()}>
        <div className="sh"><U.Av who={cmt.who}/>{P(cmt.who).n} suggests<span className="sp"></span><span className="s3-pill">{P(cmt.who).r}</span></div>
        <div className="tx" style={{marginTop:8}}>“{cmt.text}”<br/><span style={{color:'var(--ink-2)'}}>{WHO[n.role]} → </span><ins className="s3i">A supervisor</ins></div>
        <div className="acts"><button className="s3-b ok sm" onClick={()=>E.applyComment3(uc,true)}><i className="ti ti-check"></i>Accept</button><button className="s3-b sm" onClick={()=>E.applyComment3(uc,false)}>Decline</button></div>
      </div>}
    </div>
  </div>;
}

function NewStep({uc,after,num,close}){
  const [t,setT]=useState(''),[role,setRole]=useState('Analyst L1'),[sla,setSla]=useState('24 hours'),[ai,setAi]=useState(false);
  return <div className="s3-newform">
    <input autoFocus value={t} placeholder="What happens in the new step?" onChange={e=>setT(e.target.value)}/>
    <div className="s3-er"><label>Who handles it</label><div className="s3-seg">{E.ROLES.map(r=><button key={r} className={role===r?'on':''} onClick={()=>setRole(r)}>{r}</button>)}</div></div>
    <div className="s3-er"><label>How fast</label><div className="s3-seg">{E.SLAS.map(x=><button key={x} className={sla===x?'on':''} onClick={()=>setSla(x)}>{x}</button>)}</div></div>
    <div className="s3-er"><label>Decided by</label><div className="s3-seg"><button className={ai?'on':''} onClick={()=>setAi(true)}>✦ Ray</button><button className={!ai?'on':''} onClick={()=>setAi(false)}>A fixed rule</button></div></div>
    <div className="s3-ef"><button className="s3-b pri sm" disabled={!t.trim()} onClick={()=>{close();E.addStep(uc,after.id,{t,role,sla,ai});}}><i className="ti ti-plus"></i>Add step {num+1}</button>
      <button className="s3-b gh sm" onClick={close}>Cancel</button></div>
  </div>;
}

function Docs({uc,readOnly}){
  const [doc,setDoc]=useState(null);
  const list=E.docs(uc),groups=[['policy','Policy'],['proc','Procedure'],['sup','Supporting']];
  const ray=uc.docsReady?E.rayDocs(uc):[];
  return <div className="s3-fold">
    {groups.map(([k,label])=>{const g=list.filter(d=>d.kind===k);if(!g.length)return null;
      return <div key={k}><div className="s3-dgl">{label}</div>
        {g.map(d=><div key={d.id} className={'s3-doc'+(d.fresh?' fresh':'')}><span className="ext" style={{background:d.c}}>{d.ext}</span>
          <div className="nm"><b>{d.name}</b><span>{d.size} · {d.found} · read by Ray</span></div>
          {!readOnly&&<button className="s3-ib" style={{width:28,height:28,fontSize:15}} title="Remove" onClick={()=>E.delDoc(uc,d.id)}><i className="ti ti-trash"></i></button>}</div>)}</div>;})}
    {ray.length>0&&<div><div className="s3-dgl">Written by Ray</div>
      {ray.map(d=><div key={d.id} className="s3-doc ray"><span className="ext" style={{background:'var(--violet2)'}}><i className={'ti '+d.ic}></i></span>
        <div className="nm"><b>{d.t}</b><span>{d.sub}</span></div>
        <button className="s3-b sm" onClick={()=>{E.readDoc(uc,d.id);setDoc(d);}}>Open</button></div>)}</div>}
    {!readOnly&&<div className="s3-ef" style={{borderTop:0,paddingTop:4}}>
      <label className="s3-b sm" style={{cursor:'pointer'}}><i className="ti ti-paperclip"></i>Add documents<input type="file" multiple hidden onChange={e=>E.addDocs(uc,[...(e.target.files&&e.target.files.length?[...e.target.files].map(f=>f.name):['Updated_Escalation_Matrix.xlsx'])])}/></label>
      <button className="s3-b sm" onClick={()=>E.updatePolicy(uc)}><i className="ti ti-refresh"></i>Update the policy</button></div>}
    {doc&&<div className="s3-sheetbg" onClick={()=>setDoc(null)}><div className="s3-sheet" onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',alignItems:'center'}}><div className="s3-kick" style={{flex:1}}><i className={'ti '+doc.ic}></i>{doc.sub}</div><button className="s3-ib" onClick={()=>setDoc(null)}><i className="ti ti-x"></i></button></div>
      <h3>{doc.t}</h3>
      {doc.body.map(b=><div key={b[0]} style={{marginBottom:14}}><h4 style={{margin:'0 0 4px'}}>{b[0]}</h4><div style={{fontSize:13.5,color:'var(--ink-2)',lineHeight:1.6}}>{b[1]}</div></div>)}
      <div className="s3-sigrow"><span className="sp"></span><button className="s3-b" onClick={()=>setDoc(null)}>Close</button><button className="s3-b pri" onClick={()=>E.downloadDoc(uc,doc.id)}><i className="ti ti-download"></i>Download</button></div>
    </div></div>}
  </div>;
}

/* ---------- Is Ray ready? ---------- */
function Ready({uc}){
  const [o,setO]=useState(false);
  const r=uc.train.rounds,p=uc.prove,live=uc.operate.live;
  if(!r.length&&!p.day&&!live)return null;
  let tone,verdict,k,rows=D.DIFFS,bar=null;
  if(live){tone='ok';verdict='Live and healthy';k=[['3,912','alerts this week'],['31%','closed by Ray'],['3.1 h','avg. decision time'],['0','deadlines missed']];rows=D.SHADOW_DIFFS;}
  else if(p.day>0){const done=p.day>=p.total;tone=done?'ok':'ai';rows=D.SHADOW_DIFFS;
    verdict=done?'Passed the shadow run — 3 of 3 targets met':'On track — day '+p.day+' of '+p.total+' on live alerts';
    k=[[Math.round(4100*Math.min(1,p.day/p.total)).toLocaleString(),'live alerts shadowed'],['91%','agreement','target 85%'],['98%','escalations caught','target 95%'],['0','missed SARs','target 0']];bar=p.day/p.total;}
  else{const a=r[r.length-1].agree,pend=E.tuneSet(uc).filter(x=>!uc.train.sugs[x.id]).length;tone=a>=90?'ok':'warn';
    verdict=a>=90?'Ready — '+a+'% agreement, no missed escalations':'Not yet — '+a+'% agreement, target 90%'+(pend?' · '+pend+' suggestion'+(pend>1?'s':'')+' below close the gap':'');
    k=[[a+'%','agreement with analysts'],['34%','false positives Ray closes'],[r.length>1?'0':'2','escalations missed'],['2.1 min','per decision']];}
  const col={ok:'var(--ok)',warn:'var(--now)',ai:'var(--violet2)'}[tone];
  return <div className={'s3-rd '+tone}>
    <div className="rh"><span className="light" style={{background:col,boxShadow:'0 0 0 4px '+col+'33'}}></span><span className="q">Is Ray ready?</span><span style={{flex:1}}></span>
      {r.length>0&&!p.day&&<div className="s3-rounds" title="Practice rounds">{r.map(x=><i key={x.n} style={{height:(x.agree-70)*1.6}}></i>)}</div>}</div>
    <div className="verdict">{verdict}</div>
    {bar!==null&&<div className="s3-bar"><i style={{width:(bar*100)+'%'}}></i></div>}
    <div className="s3-kpis">{k.map(x=><div key={x[1]} className="s3-kpi"><b>{x[0]}</b><span>{x[1]}</span>{x[2]&&<span className="tg">{x[2]} · met</span>}</div>)}</div>
    <button className="s3-ev" style={{marginTop:12}} onClick={()=>setO(x=>!x)}><i className={'ti '+(o?'ti-chevron-up':'ti-chevron-down')}></i>{o?'Hide':'Where Ray and your analysts differ'} ({rows.length})</button>
    {o&&<table className="s3-tbl"><thead><tr><th>Alert</th><th>Analysts</th><th>Ray</th><th>Why</th></tr></thead><tbody>{rows.map(d=><tr key={d[0]}><td className="code">{d[0]}</td><td>{d[1]}</td><td><b>{d[2]}</b></td><td style={{color:'var(--ink-2)'}}>{d[3]}</td></tr>)}</tbody></table>}
  </div>;
}

/* ---------- optional flow view ---------- */
function Flow({uc,v,onStep,idx,onPick}){
  const [z,setZ]=useState(1);const [stamp,setStamp]=useState(false);
  const NW=180,GAP=20,RH=104;const wf=v.wf,rows=wf.nodes.reduce((a,n)=>Math.max(a,n.r),0)+1;
  const pos=n=>({x:n.c*(NW+GAP),y:n.r*RH}),W=3*NW+2*GAP,H=rows*RH-34;
  return <div className="s3-flowwrap"><div className="s3-flownote"><i className="ti ti-hand-finger"></i>Tap a card to edit that step<span style={{flex:1}}></span>
    <button className="s3-ev" onClick={()=>setStamp(x=>!x)}><i className="ti ti-shield-check"></i>{stamp?'Hide':'Show'} who changed what</button>
    <span className="s3-zoom"><button onClick={()=>setZ(x=>Math.max(.6,+(x-.15).toFixed(2)))}>−</button><b onClick={()=>setZ(1)}>{Math.round(z*100)}%</b><button onClick={()=>setZ(x=>Math.min(1.4,+(x+.15).toFixed(2)))}>+</button></span></div>
  <div style={{width:W*z,height:H*z}}><div className="s3-flow" style={{width:W,height:H,transform:'scale('+z+')',transformOrigin:'0 0'}}>
    <svg width={W} height={H}>{wf.edges.map((e,i)=>{const a=wf.nodes.find(n=>n.id===e[0]),b=wf.nodes.find(n=>n.id===e[1]);if(!a||!b)return null;const p=pos(a),q=pos(b),x1=p.x+NW/2,y1=p.y+56,x2=q.x+NW/2,y2=q.y;
      return <g key={i}><path d={`M${x1} ${y1} C${x1} ${y1+22},${x2} ${y2-22},${x2} ${y2-2}`}/>{e[2]&&<text x={x1===x2?x1+7:(x1+x2)/2} y={(y1+y2)/2+3} textAnchor={x1===x2?'start':'middle'}>{e[2]}</text>}</g>;})}</svg>
    {wf.nodes.map(n=>{const p=pos(n);return <div key={n.id} className={'s3-nd'+(v.changed.includes(n.id)?' chg':'')} style={{left:p.x,top:p.y}} onClick={()=>onPick&&onPick(n)}>{idx[n.id].num}. {n.t}<span>{n.role} · {n.sla}</span>
      {stamp&&<span className="s3-stamp">v{n.tunedVer||(n.chg&&n.chg.ver)||n.isNew||1} · {P(n.tunedBy||(n.chg&&n.chg.by)||(n.tuned?'ray':n.chg||n.isNew?'you':'ray')).n}</span>}</div>;})}
  </div></div></div>;
}

/* ---------- the Playbook ---------- */
U.Playbook=function({uc,onStep,viewVer,setViewVer}){
  const [view,setView]=useState('steps');const [editId,setEditId]=useState(null);const [adding,setAdding]=useState(false);
  const [rules,setRules]=useState(false);const [rep,setRep]=useState(false);const [docs,setDocs]=useState(false);
  const cur=E.cur(uc);
  const v=viewVer?uc.versions.find(x=>x.n===viewVer):cur;
  const readOnly=!!viewVer&&viewVer!==cur.n;
  const ord=order(v.wf);const idx={};ord.forEach((n,i)=>idx[n.id]={num:i+1,n});
  const ref=useRef(null);
  useEffect(()=>{if(!ref.current||!uc.pulse.ids.length)return;const el=ref.current.querySelector('[data-nid="'+uc.pulse.ids[uc.pulse.ids.length-1]+'"]');const sc=ref.current.closest('.s3-scroll');
    if(el&&sc){const top=el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop;sc.scrollTop=Math.max(0,top-sc.clientHeight/3);}},[uc.pulse.t]);
  const pending=uc.train.rounds.length?E.tuneSet(uc).filter(x=>!uc.train.sugs[x.id]).length:0;
  const t=E.tplOf(uc);
  return <div className="s3-paper" ref={ref}>
    {readOnly&&<div className="s3-viewing"><i className="ti ti-history"></i>Viewing version {v.n} · {v.summary}<span className="sp"></span>
      <button className="s3-b sm" onClick={()=>{E.restore(uc,v.n);setViewVer(null);}}>Restore</button><button className="s3-b pri sm" onClick={()=>setViewVer(null)}>Back to current</button></div>}
    {!readOnly&&<Ready uc={uc}/>}
    {!readOnly&&E.openCmts(uc).length>0&&<div className="s3-runbar">
      <i className="ti ti-message-2"></i>
      <span><b>{E.openCmts(uc).length} comment{E.openCmts(uc).length>1?'s':''}</b> on {new Set(E.openCmts(uc).map(c=>c.node)).size} step{new Set(E.openCmts(uc).map(c=>c.node)).size>1?'s':''} — Ray has not applied {E.openCmts(uc).length>1?'them':'it'} yet</span>
      <span className="sp"></span><button className="s3-b ai sm" onClick={()=>E.runComments(uc)}><i className="ti ti-sparkles"></i>Run the comments</button></div>}
    <div className="s3-pbh"><div><div className="s3-kick"><i className="ti ti-book-2"></i>Playbook · version {v.n}</div>
      <div className="s3-title">{t?t.t:'Playbook'}</div>
      <p className="s3-lead" style={{marginBottom:0}}>{ord.length} steps, each tied to your policy.{pending&&!readOnly?<> <b style={{color:'var(--t-violet)'}}>{pending} suggestion{pending>1?'s':''} to decide.</b></>:''}{uc.comment&&!readOnly?<> <b style={{color:'var(--t-act)'}}>1 suggestion from Dana.</b></>:''} <b> Tap any step to edit it</b> — or tell Ray.</p></div>
      <span className="sp"></span><div className="s3-seg" style={{flex:'0 0 auto'}} title="Read it as steps, or see the diagram">
      <button className={view==='steps'?'on':''} onClick={()=>setView('steps')}><i className="ti ti-list-numbers"></i>Steps</button>
      <button className={view==='flow'?'on':''} onClick={()=>setView('flow')}><i className="ti ti-binary-tree"></i>Diagram</button></div></div>
    <div className="s3-sect">
      {view==='steps'?<>{ord.map((n,i)=><Step key={n.id} uc={uc} v={v} n={n} idx={idx} num={i+1} onStep={onStep} readOnly={readOnly} editId={editId} setEditId={setEditId}/>)}
        {!readOnly&&(adding
          ?<NewStep uc={uc} after={ord[ord.length-1]} num={ord.length} close={()=>setAdding(false)}/>
          :<button className="s3-addrow" onClick={()=>setAdding(true)}><i className="ti ti-plus"></i>Add a step at the end</button>)}</>
        :<Flow uc={uc} v={v} idx={idx} onStep={onStep} onPick={n=>{setView('steps');setEditId(n.id);setTimeout(()=>{const el=document.querySelector('[data-nid="'+n.id+'"]');if(el)el.scrollIntoView({block:'center'});},60);}}/>}
    </div>
    <div className="s3-sect"><h3><i className="ti ti-book"></i>Rules Ray follows · {uc.policy.length}<span className="sp"></span><button onClick={()=>setRules(x=>!x)}>{rules?'Hide':'Show'}<i className={'ti '+(rules?'ti-chevron-up':'ti-chevron-down')}></i></button></h3>
      {!rules&&<div style={{fontSize:13.5,color:'var(--ink-2)'}}>From {uc.hasDocs&&uc.files.length?uc.files.map(f=>f.name).slice(0,2).join(', ')+(uc.files.length>2?' and '+(uc.files.length-2)+' more':''):'the ThetaRay template'} — every clause linked to its page.</div>}
      {rules&&<div className="s3-fold">{uc.policy.map(c=><div key={c.no} className={'s3-clause'+(uc.lastChange&&uc.lastChange.clause.no===c.no?' hl':'')}><div className="h"><span className="s3-cl">§{c.no}</span>{c.t}</div><p>{c.p}</p><div className="src"><i className="ti ti-paperclip"></i>{c.src}</div></div>)}</div>}</div>
    <div className="s3-sect"><h3><i className="ti ti-file-text"></i>What Ray writes on every alert<span className="sp"></span><button onClick={()=>setRep(x=>!x)}>{rep?'Hide':'Show'}<i className={'ti '+(rep?'ti-chevron-up':'ti-chevron-down')}></i></button></h3>
      {!rep&&<div style={{fontSize:13.5,color:'var(--ink-2)'}}>A {uc.report==='upload'?'report in your own layout':'predefined report'}: {D.REPORT.map(r=>r.h.toLowerCase()).slice(0,4).join(', ')} and more.</div>}
      {rep&&<div className="s3-fold">{D.REPORT.map((r,i)=><div key={r.h} className="s3-clause"><div className="h"><span className="s3-cl">{i+1}</span>{r.h}</div><p>{r.p}</p></div>)}</div>}</div>
    <div className="s3-sect"><h3><i className="ti ti-files"></i>Documents<span className="sp"></span><button onClick={()=>setDocs(x=>!x)}>{docs?'Hide':'Show'}<i className={'ti '+(docs?'ti-chevron-up':'ti-chevron-down')}></i></button></h3>
      {!docs&&<div style={{fontSize:13.5,color:'var(--ink-2)'}}>{E.docs(uc).length} document{E.docs(uc).length===1?'':'s'} from you{uc.docsReady?', plus the model risk document and analyst guide Ray wrote':''}.</div>}
      {docs&&<Docs uc={uc} readOnly={readOnly}/>}</div>
    <div className="s3-sect"><h3><i className="ti ti-shield-lock"></i>Limits &amp; sign-offs</h3>
      <div className="s3-limits">
        <div className="s3-lim"><b><i className="ti ti-hand-stop"></i>Always held for you</b>Sanctions and risk thresholds, anything about filing.</div>
        <div className="s3-lim"><b><i className="ti ti-stairs-up"></i>Authority</b>{uc.operate.live?D.AUTHORITY.find(a=>a.id===uc.operate.auth).t:'None yet — Ray affects no real alert until go-live.'}</div>
        <div className="s3-lim"><b><i className="ti ti-signature"></i>Who signs</b>You for Build and Train; the MLRO and Head of FCC before production.</div>
        <div className="s3-lim"><b><i className="ti ti-history"></i>Signed versions</b>{uc.signs.length?uc.signs.filter((x,i,a)=>a.indexOf(x)===i).map(x=>'v'+x).join(', '):'None yet'}</div>
      </div></div>
  </div>;
};

/* ---------- Ray's margin notes ---------- */
U.Note=function({uc,m,goStep}){
  if(m.from==='log')return <div className="s3-log"><i className={'ti '+m.icon}></i>{m.text}</div>;
  if(m.from==='you')return <div className="s3-n you"><div className="ub">{U.md(m.text)}{m.via==='voice'&&<span className="via"><i className="ti ti-microphone"></i>spoken</span>}</div></div>;
  const c=m.card;let card=null;
  if(c){const st=(i,at,done)=>i<at||done?'ok':i===at?'run':'';
    if(c.type==='progress')card=<div className="s3-rc"><div className="s3-pl">{c.steps.map((s,i)=><div key={s} className={'s3-pi '+st(i,c.at,c.done)}><span className="ic">{st(i,c.at,c.done)==='ok'?<i className="ti ti-check"></i>:st(i,c.at,c.done)==='run'?<i className="ti ti-loader-2"></i>:i+1}</span>{s}</div>)}</div></div>;
    if(c.type==='read')card=<div className="s3-rc"><div className="s3-pl">{uc.files.map(f=><div key={f.name} className={'s3-pi '+(f.pct>=100?'ok':'run')}><span className="ic">{f.pct>=100?<i className="ti ti-check"></i>:<i className="ti ti-loader-2"></i>}</span><span style={{minWidth:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</span>{f.pct>=100&&<span className="nt">{f.found}</span>}</div>)}</div></div>;
    if(c.type==='replay')card=<div className="s3-rc"><div style={{display:'flex',fontSize:12.5}}><span style={{flex:1}}>{c.cnt.toLocaleString()} / {c.n.toLocaleString()} alerts</span><b style={{color:'var(--t-ok)'}}>{c.agree}% agree</b></div><div className="s3-bar" style={{margin:'6px 0 0'}}><i style={{width:(c.cnt/c.n*100)+'%'}}></i></div></div>;
    if(c.type==='shadowrun'){const p=uc.prove;card=<div className="s3-rc"><div style={{display:'flex',fontSize:12.5}}><span style={{flex:1}}>Day {p.day} of {p.total}</span><b style={{color:'var(--t-ok)'}}>{p.day?'91% agree':'—'}</b></div><div className="s3-bar" style={{margin:'6px 0 0'}}><i style={{width:(p.day/p.total*100)+'%'}}></i></div></div>;}
    if(c.type==='confirm')card=c.done?null:<div style={{display:'flex',gap:8,marginTop:8}}><button className="s3-b pri sm" onClick={()=>E.confirm(uc,m.id,c.what)}>{c.label}</button></div>;
    if(c.type==='handoff')card=c.done?null:<Handoff uc={uc} m={m}/>;
    if(c.type==='pick')card=c.done?null:<div className="s3-rc"><div className="s3-pl">{c.opts.map(o=>{const t=D.TEMPLATES.find(x=>x.id===o);return <button key={o} className="s3-pick" onClick={()=>{E.doneCard(uc,m.id,t.t);E.setBrief(uc,'tpl',o);}}><i className="ti ti-briefcase" style={{fontSize:17,color:'var(--ink-3)'}}></i><div><b>{t.t}</b><span>{t.r} · {t.reg}</span></div></button>;})}</div></div>;
    if(c.type==='change')card=<button className="s3-anchor" onClick={()=>goStep(c.anchor)}><i className="ti ti-arrow-left"></i>See it in the playbook</button>;
    if(c.type==='anchor')card=<button className="s3-anchor" onClick={()=>goStep(c.anchor)}><i className="ti ti-arrow-left"></i>Go to step</button>;
  }
  return <div className="s3-n"><span className="s3-orb sm">✦</span><div className="bd">{m.text&&U.md(m.text)}{card}</div></div>;
};

function Handoff({uc,m}){
  const [who,setWho]=useState(null),[note,setNote]=useState('');
  const people=[['you','Me','Continue right now'],['dana','Dana Levi','Analyst team lead — knows how alerts are decided'],['tom','Tom Keller','ThetaRay services — runs the rounds with you']];
  return <div className="s3-rc">
    <div className="s3-pl">{people.map(([k,n2,d])=><button key={k} className={'s3-pick'+(who===k?' on':'')} onClick={()=>setWho(k)}>
      <U.Av who={k}/><div><b>{n2}</b><span>{d}</span></div></button>)}</div>
    {who&&who!=='you'&&<textarea className="s3-cin" rows={2} value={note} placeholder="Add a note for them (optional)" onChange={e=>setNote(e.target.value)}/>}
    <div className="s3-ef" style={{borderTop:0,paddingTop:8}}><button className="s3-b pri sm" disabled={!who} onClick={()=>E.pickOwner(uc,m.id,who,note)}>
      {who==='you'?'I’ll run it':who?('Send to '+D.PEOPLE[who].n.split(' ')[0]):'Choose someone'}</button></div>
  </div>;
}

/* ---------- one Sign sheet for every gate ---------- */
U.SignSheet=function({uc,onClose}){
  const [signing,setSigning]=useState(false);
  const g=uc.gate;if(!g)return null;const v=E.cur(uc),r=uc.train.rounds;
  const sign=fn=>{setSigning(true);setTimeout(()=>{fn();onClose();},900);};
  const Ok=({items})=><div className="s3-ok-l">{items.map(x=><div key={x}><i className="ti ti-circle-check"></i><span>{x}</span></div>)}</div>;
  const changes=uc.versions.filter(x=>x.n>uc.signedVer).length;
  let kick,title,lead,body,cta;
  const openC=E.openCmts(uc).length;
  if(g.what==='build'){kick='Sign off · Build';title='Approve the playbook';lead='This locks the starting point. Ray will practice on it next.';
    body=<><h4>You’re approving</h4><Ok items={['Playbook version '+v.n+' — '+v.wf.nodes.length+' steps, each tied to a policy clause','Policy: '+(uc.hasDocs?uc.files.length+' documents, '+uc.policy.length+' clauses':'ThetaRay template'),'Report: '+(uc.report==='upload'?'your layout':'predefined layout'),changes+' change'+(changes===1?'':'s')+' since you last signed']}/>
      <h4>Nothing changes for real alerts</h4><div style={{fontSize:13.5,color:'var(--ink-2)'}}>Ray writes the model risk document and the analyst guide, then practices on closed alerts.</div>
      {openC>0&&<div className="s3-block"><i className="ti ti-alert-triangle"></i><div><b>{openC} comment{openC>1?'s':''} still open</b><span>Ray has to apply {openC>1?'them':'it'} first — otherwise the version you sign is not the version people commented on.</span></div>
        <button className="s3-b ai sm" onClick={()=>{onClose();E.runComments(uc);}}>Run the comments</button></div>}</>;cta=['Sign',()=>E.signGate(uc),false,openC>0];}
  else if(g.what==='train'||g.what==='buildtrain'){const acc=E.tuneSet(uc).filter(x=>uc.train.sugs[x.id]==='yes').length,rej=E.tuneSet(uc).filter(x=>uc.train.sugs[x.id]==='no').length;
    kick='Sign off · '+(g.what==='buildtrain'?'Build + Train':'Train');title='Approve the practice results';lead='Ray practiced on closed alerts until it stopped improving.';
    body=<><h4>Evidence</h4><div className="s3-kpis" style={{marginBottom:6}}><div className="s3-kpi"><b>{r[r.length-1].agree}%</b><span>agreement</span><span className="tg">target 90% · met</span></div><div className="s3-kpi"><b>0</b><span>escalations missed</span></div><div className="s3-kpi"><b>{r.length}</b><span>practice rounds</span></div><div className="s3-kpi"><b>{acc}/{acc+rej}</b><span>changes accepted</span></div></div>
      <h4>You’re approving</h4><Ok items={['Playbook version '+v.n+' as the baseline for the shadow run','2 technical fixes Ray made, and '+acc+' improvements you accepted',(uc.level==='sign'?'Every Ray action is in the audit trail — nothing was hidden':'All changes are versioned and reversible')]}/></>;cta=['Sign',()=>E.signGate(uc)];}
  else if(g.what==='prove'){const s=uc.prove.signed,both=s.mlro&&s.fcc;
    kick='Sign-off · Prove';title='Approve production readiness';lead='The shadow run on live alerts passed. Two senior signatures are required.';
    body=<><h4>Targets</h4><table className="s3-tbl"><tbody>{[['Agreement','91%','≥ 85%'],['Escalations caught','98%','≥ 95%'],['Missed SARs','0','0']].map(x=><tr key={x[0]}><td>{x[0]}</td><td><b>{x[1]}</b></td><td style={{color:'var(--ink-3)'}}>target {x[2]}</td><td><span className="s3-pill ok">Met</span></td></tr>)}</tbody></table>
      <h4>Signatures</h4><div className="s3-ppl">{[['mlro','Sarah Klein','MLRO'],['fcc','Lior Ben-Ami','Head of Financial Crime Compliance']].map(p=><div key={p[0]} className="s3-p"><U.Av who={p[0]}/><div className="nm"><b>{p[1]}</b><span>{p[2]}</span></div>
        {s[p[0]]?<span className="s3-pill ok"><i className="ti ti-signature"></i>Signed {s[p[0]]}</span>:uc.prove.requested?<span className="s3-pill warn">Waiting…</span>:<span className="s3-pill">Not asked yet</span>}</div>)}</div></>;
    cta=both?null:uc.prove.requested?null:['Request both signatures',()=>E.requestSigs(uc),true];}
  else if(g.what==='live'){const ok=D.CHECKLIST.every((c,i)=>uc.operate.chk[i]);
    kick='Go live';title='Let Ray work on real alerts';lead='The only step that affects real alerts. You can roll back in one tap.';
    body=<><h4>Checklist</h4>{D.CHECKLIST.map((it,i)=>{const st=uc.operate.chk[i];return <div key={i} className={'s3-chk'+(st?' on':' todo')} onClick={()=>E.toggleChk(uc,i)}><span className="bx">{st&&<i className="ti ti-check"></i>}</span>{it.t}<span className="by">{st==='ray'?'✦ proven by Ray':st==='you'?'you':'tap to confirm'}</span></div>;})}
      <h4>Start Ray with</h4><div className="s3-seg">{D.AUTHORITY.map(a=><button key={a.id} className={uc.operate.auth===a.id?'on':''} onClick={()=>E.setAuth(uc,a.id)}>{a.t.replace(' high-confidence false positives',' clear FPs')}</button>)}</div>
      <div style={{fontSize:12.5,color:'var(--ink-3)',marginTop:8}}>{D.AUTHORITY.find(a=>a.id===uc.operate.auth).d}</div></>;
    cta=['Sign & go live',()=>E.goLive(uc),false,!ok];}
  return <div className="s3-sheetbg" onClick={onClose}><div className="s3-sheet" onClick={e=>e.stopPropagation()}>
    <div style={{display:'flex',alignItems:'center'}}><div className="s3-kick" style={{flex:1}}><i className="ti ti-signature"></i>{kick}</div><button className="s3-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
    <h3>{title}</h3><p className="lead">{lead}</p>{body}
    {g.what==='prove'&&uc.prove.signed.mlro&&uc.prove.signed.fcc&&<div className="s3-signed"><i className="ti ti-circle-check"></i>Both signed — continue to go-live.</div>}
    {cta&&<div className="s3-sigrow">{!cta[2]&&<span className="s3-sigline">{signing?'You':' '}</span>}<span className="sp"></span>
      <button className={'s3-b lg '+(g.what==='live'?'ai':cta[2]?'pri':'ok')} disabled={signing||cta[3]} onClick={()=>cta[2]?cta[1]():sign(cta[1])}>{signing?<><i className="ti ti-check"></i>Signed</>:<><i className={'ti '+(cta[2]?'ti-send':'ti-signature')}></i>{cta[0]}</>}</button></div>}
  </div></div>;
};

/* ---------- audit drawer ---------- */
const isDecision=t=>t.kind==='sign'||/^(Accepted|Rejected|Declined|Brief agreed|Signed|Requested|Check-with-me|GO LIVE|Handed|Took over|Rolled back)/i.test(t.text);
const isChange=t=>/^v\d+:|Wrote|Applied|Added|Restored|fixes/i.test(t.text);
U.Audit=function({uc,onClose,onView}){
  const [f,setF]=useState('all');
  const F=[['all','All'],['dec','Decisions'],['chg','Changes'],['ray','Ray & ThetaRay'],['view','Views & files']];
  const match=(t,k)=>k==='all'||(k==='dec'&&isDecision(t))||(k==='chg'&&isChange(t))||(k==='ray'&&(t.who==='ray'||t.who==='thetaray'))||(k==='view'&&/view|download|comment/.test(t.kind||''));
  const list=uc.trail.filter(t=>match(t,f));const icon={sign:'ti-signature',ray:'ti-sparkles',you:'ti-user',comment:'ti-message-2',view:'ti-eye',download:'ti-download',decision:'ti-gavel',change:'ti-git-commit',copy:'ti-copy'};
  const download=()=>{const rows=[['Time','Who','Role','Phase','Version','Action']].concat([...uc.trail].reverse().map(t=>[t.at,P(t.who).n,P(t.who).r,t.phase||'Build',t.ver,t.text]));
    const csv=rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=uc.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase()+'_audit_trail.csv';document.body.appendChild(a);a.click();a.remove();
    E.log(uc,'Downloaded the audit trail','you','you');E.emit();};
  return <><div className="s3-drawerbg" onClick={onClose}></div><div className="s3-drawer">
    <div className="dh"><i className="ti ti-shield-check" style={{fontSize:20,color:'var(--t-ok)'}}></i><b>Audit trail</b><button className="s3-ib" onClick={onClose}><i className="ti ti-x"></i></button></div>
    <div className="db">
      <p style={{fontSize:13,color:'var(--ink-2)',margin:'0 0 14px'}}>Every action, decision and signature — who, when, which version. Entries can’t be edited or deleted.</p>
      <div className="s3-dtop"><div className="s3-seg">{F.map(([k,l])=><button key={k} className={f===k?'on':''} onClick={()=>setF(k)}>{l} <span style={{opacity:.55}}>{uc.trail.filter(t=>match(t,k)).length}</span></button>)}</div>
        <span className="sp"></span><button className="s3-b sm" onClick={download}><i className="ti ti-download"></i>CSV</button>
      <button className="s3-b sm" onClick={()=>{
        const rows=[...uc.trail].reverse().map(t=>'<tr><td>'+t.at+'</td><td>'+P(t.who).n+' · '+P(t.who).r+'</td><td>'+(t.phase||'Build')+'</td><td>'+t.ver+'</td><td>'+t.text.replace(/</g,'&lt;')+'</td></tr>').join('');
        const html='<!doctype html><meta charset=utf-8><title>Audit trail</title><style>body{font:14px/1.5 system-ui;margin:40px;color:#1a2232}h1{font-size:20px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{text-align:left;padding:8px;border-bottom:1px solid #e6e9f0;vertical-align:top}th{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#8a92a4}</style><h1>'+uc.name+' — audit trail</h1><p>Every action, decision and signature. Entries cannot be edited or deleted. Exported '+new Date().toLocaleString()+'.</p><table><tr><th>Time</th><th>Who</th><th>Phase</th><th>Version</th><th>Action</th></tr>'+rows+'</table>';
        const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([html],{type:'text/html'}));a.download=uc.name.replace(/[^a-z0-9]+/gi,'_').toLowerCase()+'_audit.html';document.body.appendChild(a);a.click();a.remove();
        E.note(uc,'Downloaded the audit report (HTML)','you','download');E.emit();}}><i className="ti ti-report"></i>Report</button></div>
      {list.map(t=><div key={t.id} className={'s3-tr '+t.kind}><span className="ic"><i className={'ti '+(icon[t.kind]||'ti-point')}></i></span><div className="w">{t.text}<span>{P(t.who).n} · {t.phase||'Build'} · {t.at}</span></div>
        <span className="v" style={{cursor:'pointer'}} onClick={()=>{const n=parseInt(String(t.ver).slice(1));if(n&&uc.versions.find(x=>x.n===n)){onView(n);onClose();}}}>{t.ver}</span></div>)}
      {!list.length&&<div className="s3-empty"><i className="ti ti-history"></i><b>Nothing here yet</b></div>}
    </div></div></>;
};
})();
