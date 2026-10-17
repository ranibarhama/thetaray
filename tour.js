/* Ray Platform — "Show me around" guided tour (text/babel, self-mounting) */
(function(){
const {useState,useEffect,useRef}=React;
const KEY='rayTourSeen3', POS='rayTourStep3';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const nav=()=>window.__ray||{};

const waitFor=async(sel,ms=2600)=>{const t0=Date.now();
  while(Date.now()-t0<ms){const els=[...document.querySelectorAll(sel)].filter(e=>e.getClientRects().length);
    if(els.length)return els;await sleep(90);}
  return [];};

const goScreen=async(s)=>{const n=nav();if(!n.go||n.screen===s)return;n.go(s);await sleep(420);};
const openCase=async()=>{const n=nav();if(n.screen!=='case'&&n.openCase){n.openCase('CASE-AML-0001-3');await sleep(520);}};
const openUC=async()=>{await goScreen('studio');const E=window.RSE;if(!E)return;
  if(!E.state.openId){const u=E.state.ucs.find(x=>x.stage==='train')||E.state.ucs[0];if(u){E.open(u.id);await sleep(520);}}};
const closeUC=async()=>{await goScreen('studio');const E=window.RSE;if(E&&E.state.openId){E.close();await sleep(420);}};

/* Each step: t title · d body · sel target (all matches are framed together) · place · before() */
const STEPS=[
  {t:'Welcome to Ray',d:'Two minutes on how this product works. The platform has two halves: **Studio**, where you teach Ray a job, and **Investigations**, where the work gets done. We start in Studio, because nothing happens until Ray has been taught. Use \u2190 \u2192 to move, Esc to leave — you can reopen this any time.',
   place:'center',before:()=>goScreen('studio')},
  {t:'The two halves',d:'**Studio** hires and trains an investigator. **Investigations** is the casework itself. Admin is settings. Switch between them at any point without losing where you were.',
   sel:'.navarea',all:true,place:'bottom',before:()=>goScreen('studio')},
  {t:'Teach Ray a job in one sentence',d:'Describe the job in plain language — typed or spoken — and Ray writes the playbook. Or start from one of 24 ready-made jobs. This is the whole intake: no forms, no rule builder.',
   sel:'.s3-cmp',place:'top',before:closeUC},
  {t:'Four stages, like a new hire',d:'**Build** — write the playbook. **Train** — practise on alerts your analysts already closed. **Prove** — shadow a senior on live alerts, with no effect on them. **Operate** — work alone, under the authority you signed. Ray earns each stage.',
   sel:'.s3-steps',place:'bottom',before:openUC},
  {t:'The only two questions',d:'**Is Ray ready?** gives the verdict, every target against its threshold and the one thing that closes the gap. **Where am I?** gives the stage, the signed version, who acts next and what Ray did last. One click each — or ask them out loud and Ray answers in words.',
   sel:'.s3-qs',place:'bottom',before:openUC},
  {t:'You decide how often Ray asks',d:'**Every step**, **only what matters**, or **Autopilot** — Ray does the whole job and stops only at what you must sign. Change it at any point; it never changes what needs your signature.',
   sel:'.s3-lvl',place:'bottom',before:openUC},
  {t:'The playbook, in plain sentences',d:'Ray writes how it will investigate as numbered steps, each tied to a clause in your policy. Read it like a new hire\u2019s manual, or switch to **Diagram** for the flow. Every change shows as a tracked edit until you sign it.',
   sel:'.s3-paper',place:'center',before:openUC},
  {t:'Two ways to change anything',d:'**Tap any step** to edit its owner, deadline, rule or instructions — **or just tell Ray** in your own words. The microphone sits beside the send arrow in every chat field, so speaking is always an option.',
   sel:'.s3-cmp',place:'top',before:openUC},
  {t:'Now the other half',d:'That is Ray taught. **Investigations** is where the work happens — and it does not open on a list of cases. It opens on **decisions**: every number is a filter, and an agent manages their own tasks, assignments and load from here.',
   sel:'.kpis',place:'bottom',before:()=>goScreen('dashboard')},
  {t:'Two views of every screen',d:'**Classic** is the familiar layout. **Smart** rebuilds the same content around what needs you next. Same data, same engine — a different experience. The dashboard and the case home page both have this switch.',
   sel:'.modetgl',place:'bottom',before:()=>goScreen('dashboard')},
  {t:'Your environment, your lens',d:'**Agent** shows your own work. **Manager** shows the team — workload, assignment, swimlanes you can drag people across, and a phone-sized pulse you can send to yourself for the morning check.',
   sel:'.roleseg',place:'bottom',before:()=>goScreen('dashboard')},
  {t:'The case is a map',d:'Open a case and it is not a document to read — it is a **map of what happened**, with the accounts, people and transactions as a network you move through.',
   sel:'.canvas',place:'center',before:openCase},
  {t:'Play it through time',d:'The timeline is the story. Press **play** and the case builds itself in the order events actually happened — the fastest way into a case you have never seen. \u00bd\u00d7 slows it down.',
   sel:'.tdock',place:'top',before:openCase},
  {t:'Map or artifacts',d:'The same case, two ways: the **map** for how things connect, **artifacts** for the documents, alerts, visualisations and datasets behind it. Nothing from today\u2019s product was cut — it is the same seven sections.',
   sel:'.viewseg',place:'bottom',before:openCase},
  {t:'The handover brief',d:'When a case changes hands, Ray writes the brief: what the previous analyst finished, what is still open, and what it would do next. No more reading a stranger\u2019s notes from the start.',
   sel:'.hopanel,.hd-chip',place:'left',before:openCase},
  {t:'A workspace you shape',d:'Every artifact opens as a **floating panel** you can move, expand or pin side by side — and reset to the default layout in one click. Analysts who want their own cockpit can build it; everyone else never has to.',
   sel:'.case-hdr',place:'bottom',before:openCase},
  {t:'That\u2019s the tour',d:'Everything here is explained in more depth under **\u24d8 about** on any screen, and you can reopen this walkthrough from the **compass button** in the top bar whenever you want.',
   sel:'.tour-open',place:'bottom'}
];

function Tour(){
  const [i,setI]=useState(-1);
  const [box,setBox]=useState(null);
  const [busy,setBusy]=useState(false);
  const live=useRef(0);

  useEffect(()=>{window.__tour={start:(from)=>{const s=typeof from==='number'?from:(parseInt(localStorage.getItem(POS)||'0',10)||0);setI(s<STEPS.length?s:0);},
    stop:()=>{try{localStorage.setItem(KEY,'1');localStorage.setItem(POS,String(Math.max(0,i)));}catch(e){}setI(-1);},running:()=>i>=0};},[i]);

  useEffect(()=>{document.body.classList.toggle('tour-live',i>=0);},[i]);

  useEffect(()=>{let t=null;
    let seen=false;try{seen=!!localStorage.getItem(KEY);}catch(e){seen=false;}
    if(!seen)t=setTimeout(()=>setI(0),900);
    return()=>t&&clearTimeout(t);},[]);

  useEffect(()=>{
    if(i<0){setBox(null);return;}
    const token=++live.current;let stop=false,timer=null;
    (async()=>{
      const st=STEPS[i];setBusy(true);setBox(null);
      try{if(st.before)await st.before();}catch(e){}
      if(stop||token!==live.current)return;
      let els=st.sel?await waitFor(st.sel):[];
      if(stop||token!==live.current)return;
      if(els.length){
        const first=els[0];
        const r0=first.getBoundingClientRect();
        if(r0.top<60||r0.bottom>innerHeight-60){first.scrollIntoView({block:'center',behavior:'smooth'});await sleep(380);}
      }
      setBusy(false);
      const track=()=>{
        if(stop||token!==live.current)return;
        const now=st.sel?[...document.querySelectorAll(st.sel)].filter(e=>e.getClientRects().length):[];
        if(!now.length){setBox(null);return;}
        const list=st.all?now:[now[0]];
        let x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
        list.forEach(e=>{const r=e.getBoundingClientRect();x1=Math.min(x1,r.left);y1=Math.min(y1,r.top);x2=Math.max(x2,r.right);y2=Math.max(y2,r.bottom);});
        setBox({x:x1,y:y1,w:x2-x1,h:y2-y1});
      };
      track();timer=setInterval(track,250);
    })();
    return()=>{stop=true;if(timer)clearInterval(timer);};
  },[i]);

  useEffect(()=>{if(i<0)return;
    const k=e=>{if(e.key==='Escape'){e.preventDefault();close();}
      if(e.key==='ArrowRight'||e.key==='Enter'){e.preventDefault();next();}
      if(e.key==='ArrowLeft'){e.preventDefault();setI(x=>Math.max(0,x-1));}};
    window.addEventListener('keydown',k);return()=>window.removeEventListener('keydown',k);},[i]);

  const save=n=>{try{localStorage.setItem(POS,String(n));}catch(e){}};
  const done=()=>{try{localStorage.setItem(KEY,'1');localStorage.removeItem(POS);}catch(e){}setI(-1);};
  const close=()=>{try{localStorage.setItem(KEY,'1');}catch(e){}save(i);setI(-1);};
  const next=()=>setI(x=>{if(x>=STEPS.length-1){done();return -1;}save(x+1);return x+1;});

  if(i<0)return null;
  const st=STEPS[i],last=i===STEPS.length-1;
  const pad=8,W=Math.min(430,innerWidth-24);
  let cs={};
  if(!box||st.place==='center'){cs={left:(innerWidth-W)/2,top:Math.max(80,innerHeight/2-150)};}
  else{
    const place=st.place==='top'?'top':st.place==='bottom'?'bottom':(box.y>innerHeight/2?'top':'bottom');
    let left=box.x+box.w/2-W/2;left=Math.max(12,Math.min(left,innerWidth-W-12));
    let top=place==='bottom'?box.y+box.h+pad+10:box.y-pad-10;
    cs=place==='bottom'?{left,top}:{left,bottom:innerHeight-top};
    if(place==='bottom'&&top>innerHeight-200)cs={left,bottom:12};
  }
  return <div className="tour">
    <div className="tour-scrim" onClick={close}></div>
    {box&&<div className="tour-spot" style={{left:box.x-pad,top:box.y-pad,width:box.w+pad*2,height:box.h+pad*2}}></div>}
    <div className="tour-card" style={cs}>
      <div className="tour-top"><span className="tour-n">{i+1} <em>/ {STEPS.length}</em></span>
        <div className="tour-bar"><i style={{width:((i+1)/STEPS.length*100)+'%'}}></i></div>
        <button className="tour-x" onClick={close} title="Close (Esc)"><i className="ti ti-x"></i></button></div>
      <h3>{st.t}</h3>
      <p>{window.RSU&&window.RSU.md?window.RSU.md(st.d):st.d}</p>
      <div className="tour-act">
        <button className="tour-b" disabled={i===0||busy} onClick={()=>{save(Math.max(0,i-1));setI(x=>Math.max(0,x-1));}}><i className="ti ti-arrow-left"></i>Back</button>
        <span className="sp"></span>
        <button className="tour-skip" onClick={done}>Skip the tour</button>
        <button className="tour-b pri" disabled={busy} onClick={next}>{last?'Done':'Next'}{!last&&<i className="ti ti-arrow-right"></i>}</button>
      </div>
    </div>
  </div>;
}

const host=document.createElement('div');host.id='tour-root';document.body.appendChild(host);
ReactDOM.createRoot(host).render(<Tour/>);
})();
