/* Ray Studio — conversation engine, part A: store, routing, Build + Autopilot */
(function(){
const D=window.RSD;
const E=window.RSE=window.RSE||{};
const S=E.state={ucs:[],openId:null,v:0};
const subs=new Set();
E.subscribe=fn=>{subs.add(fn);return()=>subs.delete(fn);};
const emit=E.emit=()=>{S.v++;subs.forEach(f=>f(S.v));};
const wait=E.wait=ms=>new Promise(r=>setTimeout(r,ms));
const uid=()=>Math.random().toString(36).slice(2,9);
const clone=o=>JSON.parse(JSON.stringify(o));
const now=E.now=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const tplOf=E.tplOf=uc=>D.TEMPLATES.find(t=>t.id===uc.tpl);
const has=(s,arr)=>arr.some(k=>s.includes(k));
E.get=id=>S.ucs.find(u=>u.id===id);
E.cur=uc=>uc.versions[uc.versions.length-1];

/* ---------- use case lifecycle ---------- */
E.newUC=(tpl)=>{
  const t=D.TEMPLATES.find(x=>x.id===tpl);
  const uc={id:'uc'+uid(),tpl:tpl||null,name:t?t.t:'New use case',stage:'build',done:{},mode:null,step:'b.tpl',
    msgs:[],typing:false,versions:[],policy:[],policyHl:[],files:[],hasDocs:false,report:null,trail:[],tab:'workflow',
    pulse:{ids:[],t:0},train:{period:'Last 6 months',size:'1,000 alerts',rounds:[],sugs:{},replay:0},
    prove:{dur:'4 weeks',cov:'50% of new alerts',day:0,total:28,signed:{},running:false},
    operate:{chk:{},auth:'note',live:false},next:{who:'you',what:'Choose a template'},updated:now(),seed:false};
  S.ucs.unshift(uc);return uc;
};
E.open=id=>{S.openId=id;emit();};
E.close=()=>{S.openId=null;emit();};
E.log=(uc,text,who,kind)=>{const v=uc.versions.length;uc.trail.unshift({id:uid(),text,who:who||'ray',kind:kind||'ray',ver:v?('v'+v):'—',at:now()});};
const push=E.push=(uc,m)=>{const msg=Object.assign({id:uid(),at:now()},m);uc.msgs.push(msg);uc.updated=now();emit();return msg;};
E.logMsg=(uc,text,icon)=>push(uc,{from:'log',text,icon:icon||'ti-history'});
E.ray=async(uc,text,card,opts)=>{
  uc.typing=true;emit();
  await wait((opts&&opts.fast)?250:Math.min(450+(text||'').length*7,1300));
  uc.typing=false;
  return push(uc,{from:'ray',text,card:card||null});
};
E.you=(uc,text,via)=>push(uc,{from:'you',text,via});
E.doneCard=(uc,msgId,choice)=>{uc.need=null;const m=uc.msgs.find(x=>x.id===msgId);if(m&&m.card){m.card.done=true;m.card.choice=choice;}emit();};
E.setNext=(uc,who,what)=>{uc.next={who,what};emit();};
E.setTab=(uc,tab)=>{uc.tab=tab;emit();};
E.pulse=(uc,ids,tab)=>{uc.pulse={ids,t:Date.now()};if(tab)uc.tab=tab;emit();};
E.addVersion=(uc,wf,by,summary,changed,extra)=>{
  const v=Object.assign({n:uc.versions.length+1,wf,by,at:now(),summary,changed:changed||[]},extra||{});
  uc.versions.push(v);return v;
};

/* ---------- prompt interpretation ---------- */
E.matchTpl=s=>{s=' '+s.toLowerCase()+' ';
  let best=null,score=0;
  D.TEMPLATES.forEach(t=>{let sc=0;t.kw.forEach(k=>{if(s.includes(k))sc+=k.length>4?2:1;});
    if(s.includes(t.t.toLowerCase()))sc+=10;if(sc>score){score=sc;best=t;}});
  return score>0?best:null;
};
const wantsAuto=s=>has(s,['autopilot','auto pilot','auto-pilot','shortcut','you do it','do it for me','handle it','for me']);
const wantsDocs=s=>has(s,['our policy','our aml','my policy','our docs','our documents','policy','manual','procedure']);

E.createFromPrompt=async(text,via)=>{
  const uc=E.newUC(null);S.openId=uc.id;
  E.you(uc,text,via);
  await interpretOpening(uc,text.toLowerCase());
};
E.startBlank=async()=>{
  const uc=E.newUC(null);S.openId=uc.id;emit();
  await E.ray(uc,'Hi — I’m **Ray**. Think of me as your new investigator: you hire me for a job, hand me your manual, correct me, let me practice on old cases, and only then let me work. **What should I learn to investigate?**',{type:'tpl'});
};
E.startFromTpl=async(tplId)=>{
  const uc=E.newUC(null);S.openId=uc.id;emit();
  await chooseTpl(uc,tplId,'card');
};

async function interpretOpening(uc,s){
  const t=E.matchTpl(s);
  if(!t){await E.ray(uc,'Happy to help. Which job should I learn first? Pick one, or just say it — for example *“UK payment screening”*.',{type:'tpl'});return;}
  uc.tpl=t.id;uc.name=t.t;
  const auto=wantsAuto(s),docs=wantsDocs(s);
  if(auto){
    uc.mode='auto';uc.hasDocs=docs;
    E.log(uc,'Template chosen by voice/text: '+t.t,'you','you');
    await E.ray(uc,'Got it — from one sentence I understood three things:\n✓ **Job:** '+t.t+'\n✓ **Manual:** '+(docs?'your AML policy (3 documents)':'ThetaRay’s proven template')+'\n✓ **Mode:** Autopilot — you decide 3 times, I do the rest.\nHere are the rules I’ll follow. Nothing goes live without your signature.',{type:'agree'});
    E.setNext(uc,'you','Agree the rules');return;
  }
  await chooseTpl(uc,t.id,'text',docs);
}

async function chooseTpl(uc,tplId,how,docsHint){
  const t=D.TEMPLATES.find(x=>x.id===tplId);
  uc.tpl=t.id;uc.name=t.t;uc.step='b.mode';
  E.log(uc,'Chose the job: '+t.t,'you','you');
  E.logMsg(uc,'Job chosen · '+t.t,'ti-briefcase');
  await E.ray(uc,'**'+t.t+'** — good choice. It’s a proven ThetaRay setup ('+t.reg+'). How hands-on do you want to be?',{type:'mode',docsHint:!!docsHint});
  E.setNext(uc,'you','Choose how hands-on');
}

/* ---------- routing free text / voice ---------- */
E.say=async(uc,text,via)=>{
  if(!text.trim())return;
  E.you(uc,text,via);
  const s=text.toLowerCase();
  if(has(s,['undo','revert','go back a version','roll back'])&&uc.versions.length>1&&uc.stage==='build'){await E.undo(uc);return;}
  if(/\bwhy\b/.test(s)&&uc.lastChange){await explain(uc);return;}
  if(has(s,['status','where are we','recap','summar','what did you do'])){await E.recap(uc);return;}
  if(has(s,['autopilot','auto pilot'])&&uc.mode!=='auto'&&uc.step!=='b.tpl'){await E.toggleAuto(uc);return;}
  const st=uc.step;
  if(st==='b.tpl'){await interpretOpening(uc,s);return;}
  if(st==='b.mode'){
    if(wantsAuto(s)){await E.pickMode(uc,null,'auto');return;}
    if(has(s,['guide','step','myself','manual','me'])){await E.pickMode(uc,null,'guide');return;}
  }
  if(st==='b.policy'){
    if(has(s,['skip','template','default','no doc'])){await E.policyChoice(uc,null,'skip');return;}
    await E.policyChoice(uc,null,'sample');return;
  }
  if(st==='b.report'){await E.reportChoice(uc,null,has(s,['upload','own','our'])?'upload':'predefined');return;}
  if(st==='b.refine'){
    if(has(s,['looks good','apply','approve','done','sign','ready','lgtm','complete'])){await E.askApply(uc);return;}
    await E.refine(uc,text);return;
  }
  if(st==='b.agree'){if(has(s,['agree','yes','start','go','ok']))return E.agree(uc,null);}
  if(E.routeLater&&await E.routeLater(uc,s,text))return;
  await E.ray(uc,'I can do that once we reach the right step. Right now: **'+uc.next.what+'**. You can also ask me *“where are we?”*, *“why?”* or *“undo”* anytime.');
};

/* ---------- BUILD (guided) ---------- */
E.pickTpl=async(uc,msgId,tplId)=>{E.doneCard(uc,msgId,D.TEMPLATES.find(t=>t.id===tplId).t);await chooseTpl(uc,tplId,'card');};
E.pickMode=async(uc,msgId,mode)=>{
  if(msgId)E.doneCard(uc,msgId,mode==='auto'?'Autopilot':'Guide me step by step');
  uc.mode=mode;E.log(uc,mode==='auto'?'Switched on Autopilot':'Chose guided setup','you','you');
  if(mode==='auto'){
    uc.step='b.agree';
    await E.ray(uc,'Autopilot it is. Before I start, let’s **agree the rules once** — this is what I’ll do on my own, and where I’ll stop and ask you.',{type:'agree'});
    E.setNext(uc,'you','Agree the rules');return;
  }
  uc.step='b.policy';
  await E.ray(uc,'Let’s go step by step. First, **hand me your manual** — your policy and procedures. I’ll adapt the ThetaRay template to them. Prefer the template as-is? Skip it.',{type:'policy'});
  E.setNext(uc,'you','Add your policy');
};
E.policyChoice=async(uc,msgId,choice)=>{
  if(msgId)E.doneCard(uc,msgId,choice==='skip'?'Use the ThetaRay template':'Your documents');
  uc.hasDocs=choice!=='skip';
  const files=uc.tpl==='ts-example'?D.EX_FILES:D.SAMPLE_FILES;
  if(uc.hasDocs){
    uc.files=clone(files).map(f=>Object.assign(f,{pct:0}));
    const m=await E.ray(uc,'Reading your manual…',{type:'read'},{fast:true});
    for(let i=0;i<uc.files.length;i++){for(let p=25;p<=100;p+=25){await wait(170);uc.files[i].pct=p;emit();}}
    uc.policy=D.buildPolicy(uc.tpl,true);uc.policyHl=uc.policy.map(c=>c.no);E.pulse(uc,[],'policy');
    E.doneCard(uc,m.id,'Read');
    E.log(uc,'Read '+uc.files.length+' documents · extracted '+uc.policy.length+' policy clauses','ray');
    await E.ray(uc,'Done. I found **'+uc.policy.length+' policy clauses** and linked each to its page — see the **Policy** tab. Everything I build will point back to these.');
  }else{
    uc.policy=D.buildPolicy(uc.tpl,false);uc.policyHl=[];E.setTab(uc,'policy');
    E.log(uc,'Using ThetaRay template policy ('+uc.policy.length+' clauses)','ray');
    await E.ray(uc,'No problem — I’ll use the **ThetaRay template policy** ('+uc.policy.length+' clauses). You can add your documents anytime.');
  }
  uc.step='b.report';
  await E.ray(uc,'How should my **investigation report** look? It’s what I write on every alert.',{type:'report'});
  E.setNext(uc,'you','Choose the report layout');
};
E.reportChoice=async(uc,msgId,choice)=>{
  if(msgId)E.doneCard(uc,msgId,choice==='upload'?'Your own layout':'Predefined layout');
  uc.report=choice;E.setTab(uc,'report');
  E.log(uc,'Report layout: '+(choice==='upload'?'customer layout (Investigation_Report_Template.docx)':'ThetaRay predefined'),'you','you');
  await E.buildV1(uc);
};
E.buildV1=async(uc)=>{
  const wf=D.buildWorkflow(uc.tpl);
  const m=await E.ray(uc,'Drafting your workflow…',{type:'progress',steps:['Mapping policy clauses to steps','Assigning roles and SLAs','Linking data sources','Writing the report template'],at:0},{fast:true});
  uc.tab='workflow';
  const v=E.addVersion(uc,{nodes:[],edges:[]},'ray','First draft from '+(uc.hasDocs?'your policy':'the template'));
  for(let i=0;i<wf.nodes.length;i++){await wait(230);v.wf.nodes.push(wf.nodes[i]);v.wf.edges=wf.edges.filter(e=>v.wf.nodes.find(n=>n.id===e[0])&&v.wf.nodes.find(n=>n.id===e[1]));
    m.card.at=Math.min(3,Math.floor(i/2));uc.pulse={ids:[wf.nodes[i].id],t:Date.now(),fresh:true};emit();}
  m.card.at=4;E.doneCard(uc,m.id,'Done');
  E.log(uc,'Drafted workflow v1 · '+wf.nodes.length+' steps, every step linked to a policy clause','ray');
  E.logMsg(uc,'Version 1 created · logged','ti-git-commit');
  uc.step='b.refine';
  await E.ray(uc,'Here’s **version 1** — '+wf.nodes.length+' steps, each linked to a clause in your policy. Want to change anything? **Just say it in your own words** — like you’d correct a new hire. Or tap a step to ask about it.',null);
  E.setNext(uc,'you','Review version 1');
};

function findNode(wf,pred){return wf.nodes.find(pred);}
function insertAfter(wf,after,node){
  node.r=after.r+1;node.c=after.c;
  wf.nodes.forEach(n=>{if(n.r>after.r)n.r++;});
  wf.edges=wf.edges.map(e=>e[0]===after.id?[node.id,e[1],e[2]]:e);
  wf.edges.push([after.id,node.id]);wf.nodes.push(node);
}
function insertBefore(wf,target,node){
  node.r=target.r;node.c=target.c;
  wf.nodes.forEach(n=>{if(n.r>=target.r)n.r++;});
  wf.edges=wf.edges.map(e=>e[1]===target.id?[e[0],node.id,e[2]]:e);
  wf.edges.push([node.id,target.id]);wf.nodes.push(node);
}
function clauseFor(uc,list){return uc.policy.find(c=>list.includes(c.no))||uc.policy[0];}

E.refine=async(uc,text,fromWho)=>{
  const s=text.toLowerCase();
  const intent=D.INTENTS.find(i=>has(s,i.kw));
  const wf=clone(E.cur(uc).wf);
  const l1=findNode(wf,n=>/Analyst L1/.test(n.role))||wf.nodes[2];
  const target=uc.focusNode?findNode(wf,n=>n.id===uc.focusNode):null;
  let changed=[],diff=null,summary='';
  const nid='x'+uid();
  if(intent&&intent.id==='sla'){
    const n=target||l1;const before=n.sla;n.sla=/^24/.test(before)?'4 hours (high risk)':'24 hours (risk > 80)';
    changed=[n.id];diff=[n.t+' · SLA '+before,n.t+' · SLA '+n.sla];summary='SLA on “'+n.t+'”: '+before+' → '+n.sla;
  }else if(intent&&intent.id==='four'){
    const f=findNode(wf,n=>n.k==='flag')||wf.nodes[wf.nodes.length-1];
    insertBefore(wf,f,{id:nid,t:'Four-eyes supervisor check',k:'shield',ai:false,role:'Supervisor',sla:'24 hours',pol:clauseFor(uc,intent.clause).no});
    changed=[nid];diff=['“'+f.t+'” right after the investigation','Supervisor checks first, then “'+f.t+'”'];summary='Added four-eyes check before “'+f.t+'”';
  }else if(intent&&intent.id==='rescreen'){
    const a=wf.nodes.find(n=>n.r===1)||wf.nodes[0];
    insertAfter(wf,a,{id:nid,t:'Sanctions re-screening',k:'search2',ai:true,role:'Ray',sla:'Instant',pol:clauseFor(uc,intent.clause).no});
    changed=[nid];diff=['“'+a.t+'” goes straight to review','Re-screen against sanctions lists after “'+a.t+'”'];summary='Added sanctions re-screening after “'+a.t+'”';
  }else if(intent&&intent.id==='auto'){
    const a=wf.nodes.find(n=>n.r===1)||wf.nodes[0];
    insertAfter(wf,a,{id:nid,t:'Auto-close repeat low-risk alerts',k:'bolt',ai:false,role:'System',sla:'Instant',pol:clauseFor(uc,intent.clause).no});
    changed=[nid];diff=['Every alert reaches an analyst','Repeats of a pattern closed in the last 30 days close automatically'];summary='Added auto-close for repeat low-risk alerts';
  }else if(intent&&intent.id==='media'){
    const a=wf.nodes.find(n=>n.r===1)||wf.nodes[0];a.t=a.t.replace(/ \+ adverse media$/,'')+' + adverse media';
    changed=[a.id];diff=['Enrichment: KYC + transaction history','Enrichment: KYC + history + adverse media'];summary='Connected adverse media to “'+a.t+'”';
  }else if(intent&&intent.id==='owner'){
    const n=target||findNode(wf,x=>x.k==='users'&&x.role!=='Supervisor')||(l1&&l1.role!=='Supervisor'?l1:null)||findNode(wf,x=>x.role!=='Supervisor'&&x.role!=='System');const before=n.role;n.role='Supervisor';
    changed=[n.id];diff=[n.t+' · owner '+before,n.t+' · owner Supervisor'];summary='“'+n.t+'” now owned by the Supervisor';
  }else{
    const n=target||l1;n.note=text;
    changed=[n.id];diff=['“'+n.t+'” · standard instruction','“'+n.t+'” · + “'+text.slice(0,70)+(text.length>70?'…':'')+'”'];summary='Added your instruction to “'+n.t+'”';
  }
  uc.focusNode=null;
  const cl=intent?clauseFor(uc,intent.clause):clauseFor(uc,[l1.pol]);
  const v=E.addVersion(uc,wf,fromWho||'you',summary,changed);
  uc.policyHl=[cl.no];
  uc.lastChange={v:v.n,summary,clause:cl,intent:intent?intent.id:'free'};
  E.pulse(uc,changed,'workflow');
  E.log(uc,'v'+v.n+': '+summary+(fromWho==='dana'?' (Dana’s comment)':''),fromWho||'you','you');
  E.logMsg(uc,'Version '+v.n+' created · logged · reversible','ti-git-commit');
  await E.ray(uc,'Done — that’s **version '+v.n+'**.',{type:'change',diff,clause:cl,ver:v.n,generic:!intent});
  E.setNext(uc,'you','Review version '+v.n);
};
async function explain(uc){
  const c=uc.lastChange;
  await E.ray(uc,'Because of **§'+c.clause.no+' '+c.clause.t+'**: “'+c.clause.p+'” — source: '+c.clause.src+'. Tuning on your real alerts will confirm it with evidence.');
}
E.undo=async(uc)=>{
  if(uc.versions.length<2)return;
  const prev=uc.versions[uc.versions.length-2];
  const v=E.addVersion(uc,clone(prev.wf),'you','Restored version '+prev.n,[]);
  E.log(uc,'v'+v.n+': restored version '+prev.n+' (undo)','you','you');
  E.logMsg(uc,'Restored v'+prev.n+' as v'+v.n+' · nothing is ever deleted','ti-arrow-back-up');
  E.pulse(uc,prev.wf.nodes.map(n=>n.id).slice(0,0),'workflow');
  await E.ray(uc,'Undone. I restored version '+prev.n+' as **version '+v.n+'** — the change stays in the trail, nothing is deleted.');
};
E.restore=async(uc,n)=>{
  const src=uc.versions.find(x=>x.n===n);if(!src)return;
  const v=E.addVersion(uc,clone(src.wf),'you','Restored version '+n,[]);
  E.log(uc,'v'+v.n+': restored version '+n,'you','you');E.setTab(uc,'workflow');
  await E.ray(uc,'Restored version '+n+' as **version '+v.n+'**.');
};
E.askApply=async(uc)=>{
  uc.step='b.apply';
  await E.ray(uc,'Ready to sign off **Build**? This doesn’t touch a single real alert — it locks version '+E.cur(uc).n+' as the starting point for practice. I’ll generate the **MRM document** and the **analyst user guide** from it.',{type:'sign',what:'build'});
  E.setNext(uc,'you','Sign off Build');
};

/* ---------- AUTOPILOT ---------- */
E.agree=async(uc,msgId,changeIt)=>{
  if(changeIt){E.doneCard(uc,msgId,'Changed my mind — guide me');return E.pickMode(uc,null,'guide');}
  if(msgId)E.doneCard(uc,msgId,'Agreed');
  uc.mode='auto';uc.step='b.autorun';
  E.log(uc,'Agreed the Autopilot rules (held: sanctions & risk thresholds, filing, final approval)','you','sign');
  E.logMsg(uc,'Rules agreed · signed by you · '+now(),'ti-signature');
  E.setNext(uc,'ray','Running Build + Train');
  await E.autoRun(uc);
};
E.autoRun=async(uc)=>{
  const steps=['Read your manual','Report layout','Draft workflow v1','Sign-ready Build package','Practice round 1','Apply technical fixes','Practice round 2','Practice round 3 — stop rule'];
  const m=await E.ray(uc,'On it. You can watch the package build on the right — or leave and I’ll ping you.',{type:'autorun',steps,at:0,notes:[]},{fast:true});
  const tick=async(i,note,ms)=>{m.card.at=i;if(note)m.card.notes[i-1]=note;emit();await wait(ms||900);};
  await tick(0,null,700);
  uc.hasDocs=uc.hasDocs!==false;uc.policy=D.buildPolicy(uc.tpl,uc.hasDocs);uc.policyHl=uc.policy.map(c=>c.no);
  if(uc.hasDocs)uc.files=clone(uc.tpl==='ts-example'?D.EX_FILES:D.SAMPLE_FILES).map(f=>Object.assign(f,{pct:100}));
  E.setTab(uc,'policy');E.log(uc,'Read manual · '+uc.policy.length+' clauses','ray');
  await tick(1,uc.policy.length+' clauses');
  uc.report='predefined';E.setTab(uc,'report');E.log(uc,'Report: ThetaRay predefined layout','ray');
  await tick(2,'Predefined');
  const wf=D.buildWorkflow(uc.tpl);E.addVersion(uc,wf,'ray','Autopilot draft from '+(uc.hasDocs?'your policy':'template'));
  E.pulse(uc,wf.nodes.map(n=>n.id),'workflow');E.log(uc,'Drafted workflow v1 · '+wf.nodes.length+' steps','ray');
  await tick(3,'v1 · '+wf.nodes.length+' steps',1100);
  E.log(uc,'Build package ready (MRM doc + user guide drafted) — awaiting your final approval','ray');
  await tick(4,'MRM + guide drafted');
  uc.train.rounds=[{n:1,agree:87}];E.setTab(uc,'results');E.log(uc,'Practice round 1 on 1,000 closed alerts · 87% agreement','ray');
  await tick(5,'87% agreement',1100);
  const sugs=E.tuneSet(uc);sugs.filter(x=>x.cat==='bug'||x.cat==='data').forEach(x=>{uc.train.sugs[x.id]='yes';});
  sugs.filter(x=>!x.held&&(x.cat==='instr'||x.cat==='flow')).forEach(x=>{uc.train.sugs[x.id]='yes';});
  E.applyTune(uc,'ray','Autopilot: technical fixes + safe improvements');
  await tick(6,'4 fixes · 1 held for you',900);
  uc.train.rounds.push({n:2,agree:90});E.log(uc,'Practice round 2 · 90% agreement','ray');emit();
  await tick(7,'90%',900);
  uc.train.rounds.push({n:3,agree:91});E.log(uc,'Practice round 3 · 91% (+1%) — stop rule reached','ray');emit();
  await tick(8,'91% · gain < 1%, stopped',600);
  E.doneCard(uc,m.id,'Done');
  const held=sugs.find(x=>x.held);
  uc.step='b.handback';
  await E.ray(uc,'Build and Train are done. **One thing needs you** — it touches a rule you asked me to hold, so I didn’t change it. Here’s the full context:',{type:'handback',sug:held});
  E.setNext(uc,'you','Decide 1 held rule');
};
E.handback=async(uc,msgId,yes)=>{
  const held=E.tuneSet(uc).find(x=>x.held);
  E.doneCard(uc,msgId,yes?'Accepted':'Kept as is');
  uc.train.sugs[held.id]=yes?'yes':'no';
  if(yes)E.applyTune(uc,'you','Held rule accepted: '+held.t);
  E.log(uc,(yes?'Accepted':'Rejected')+' held rule: '+held.t,'you','you');
  uc.step='b.final';
  const acc=E.tuneSet(uc).filter(x=>uc.train.sugs[x.id]==='yes').length;
  await E.ray(uc,'Here’s everything I did, in plain words — so you can defend it.',{type:'final',acc,ver:E.cur(uc).n});
  E.setNext(uc,'you','Final approval');
};
E.finalSign=async(uc,msgId)=>{
  E.doneCard(uc,msgId,'Signed');
  uc.done.build=true;uc.done.train=true;uc.stage='prove';
  E.log(uc,'Signed Build + Train · package v'+E.cur(uc).n+' is the baseline for Prove','you','sign');
  E.logMsg(uc,'Signed by you · v'+E.cur(uc).n+' · '+now(),'ti-signature');
  await E.ray(uc,'Signed. That was decision 3 of 3 — **you’re done with Build and Train**. Next I prove myself on live alerts, without touching them. Shall I start with the recommended setup?',{type:'shadow',auto:true});
  uc.step='p.setup';E.setNext(uc,'you','Start Prove');
};

E.toggleAuto=async(uc)=>{
  const on=uc.mode!=='auto';uc.mode=on?'auto':'guide';
  E.log(uc,on?'Autopilot switched on':'Autopilot switched off','you','you');emit();
  if(on&&uc.stage==='build'&&!uc.versions.length&&uc.tpl){uc.step='b.agree';await E.ray(uc,'Autopilot on. Let’s **agree the rules once**, then I’ll run Build and Train and only come back for approvals.',{type:'agree'});E.setNext(uc,'you','Agree the rules');return;}
  await E.ray(uc,on?'Autopilot on — from the next step I’ll use the agreed defaults and only check back for **approvals and held rules**.':'Autopilot off — I’ll check in with you at every step.');
};
E.recap=async(uc)=>{
  const st=D.STAGES.find(s=>s.k===uc.stage);
  const v=uc.versions.length?'version '+E.cur(uc).n:'no version yet';
  await E.ray(uc,'**Where we are:** '+uc.name+' is in **'+st.t+'** ('+st.sub.toLowerCase()+'), at '+v+'. '+uc.trail.length+' actions logged. **Next:** '+(D.PEOPLE[uc.next.who]||D.PEOPLE.you).n+' — '+uc.next.what+'.');
};
})();
