/* Ray Studio — data layer (ported from Ray Studio prototype v19) */
(function(){
const CATS={
  tm:{n:'Transaction Monitoring',c:'#4A72E8',ic:'ti-arrows-exchange'},
  scr:{n:'Screening',c:'#16A6AE',ic:'ti-scan'},
  cor:{n:'Correspondent',c:'#9068C4',ic:'ti-building-bank'},
  fr:{n:'Fraud',c:'#E5534E',ic:'ti-shield-lock'},
  oth:{n:'Specialised',c:'#7B6CF0',ic:'ti-world'}
};
const TEMPLATES=[
 {id:'ts-example',cat:'scr',t:'Transaction Screening Example',r:'Multi-region',reg:'Local sanctions & PEP regimes',d:'Real-world package: Ray reviews every hit in parallel, decides the alert and closes or parks it.',kw:['example','real-world','production'],ex:true},
 {id:'tm-retail',cat:'tm',t:'Transaction Monitoring for Retail Banking',r:'Global',reg:'FATF / local FIU',d:'Spots suspicious activity across retail current, savings and card accounts.',kw:['retail','structuring'],pop:true},
 {id:'ts-uk',cat:'scr',t:'Transaction Screening UK',r:'United Kingdom',reg:'FCA · OFSI',d:'Screens UK payments in real time against OFSI, UN and EU sanctions lists.',kw:['uk','united kingdom','ofsi','britain','payments','sanction'],pop:true},
 {id:'cb-es',cat:'cor',t:'Correspondent Banking Spain',r:'Spain',reg:'SEPBLAC · Banco de España',d:'Monitors respondent bank flows through your correspondent accounts in Spain.',kw:['spain','respondent','sepblac']},
 {id:'cs-eu',cat:'scr',t:'Customer Screening EU Sanctions',r:'European Union',reg:'EBA · national authorities',d:'Screens customers against EU sanctions at onboarding and on every list update.',kw:['eu','onboarding','europe']},
 {id:'tm-corp',cat:'tm',t:'Transaction Monitoring for Corporate Banking',r:'Global',reg:'FATF / local FIU',d:'Detects money laundering risk in corporate and business banking activity.',kw:['corporate','business banking','trade-based']},
 {id:'fr-inst',cat:'fr',t:'Instant Payments Fraud (SEPA Inst)',r:'Eurozone',reg:'EBA · PSD3',d:'Stops authorised push payment scams and account takeover on instant payments.',kw:['instant','sepa','app scam','push payment']},
 {id:'tf-sg',cat:'oth',t:'Trade Finance AML Singapore',r:'Singapore',reg:'MAS',d:'Finds over- and under-invoicing and dual-use goods risk in trade finance.',kw:['singapore','invoic','dual-use']},
 {id:'vasp',cat:'tm',t:'Crypto / VASP Transaction Monitoring',r:'Global',reg:'FATF Travel Rule',d:'Monitors crypto flows for mixer exposure and Travel Rule gaps.',kw:['crypto','vasp','bitcoin','mixer','travel rule']},
 {id:'msb-ae',cat:'tm',t:'Remittance & Money Services UAE',r:'United Arab Emirates',reg:'CBUAE',d:'Covers remittance corridors and agent networks for money service businesses.',kw:['remittance','uae','money service','hawala','msb']},
 {id:'pep-am',cat:'scr',t:'PEP & Adverse Media Screening',r:'Global',reg:'FATF R.12',d:'Identifies politically exposed persons and negative news about your customers.',kw:['pep','adverse','media','politically']},
 {id:'card-us',cat:'fr',t:'Card Fraud Issuing US',r:'United States',reg:'Reg E · Card networks',d:'Detects card-not-present fraud, card testing and compromised merchants.',kw:['issuing','united states','cnp']},
 {id:'wm-ch',cat:'oth',t:'Wealth Management AML Switzerland',r:'Switzerland',reg:'FINMA · MROS',d:'Monitors private banking clients for source-of-wealth and structure risk.',kw:['wealth','swiss','switzerland','private bank']},
 {id:'mule',cat:'fr',t:'Money Mule Detection Retail',r:'Global',reg:'Local FIU',d:'Finds accounts used to receive and pass on stolen or laundered money.',kw:['mule','pass-through']},
 {id:'ts-us',cat:'scr',t:'Transaction Screening US (OFAC)',r:'United States',reg:'OFAC · FinCEN',d:'Screens USD payments against OFAC SDN and sectoral lists before release.',kw:['ofac','us screening','sdn','dollar']},
 {id:'ts-sg',cat:'scr',t:'Transaction Screening Singapore',r:'Singapore',reg:'MAS',d:'Screens SGD and cross-border payments against MAS-mandated lists.',kw:['singapore screening','mas']},
 {id:'cb-us',cat:'cor',t:'Correspondent Banking US',r:'United States',reg:'FinCEN · OCC',d:'Monitors respondent bank activity through US correspondent accounts.',kw:['correspondent us','nested','respondent']},
 {id:'tm-sme',cat:'tm',t:'Transaction Monitoring for SME Banking',r:'Global',reg:'FATF / local FIU',d:'Watches small-business accounts for turnover that does not match the trade.',kw:['sme','small business','turnover']},
 {id:'fr-card-eu',cat:'fr',t:'Card Fraud Acquiring EU',r:'European Union',reg:'EBA · PSD3',d:'Finds merchant collusion, laundering through terminals and refund abuse.',kw:['acquiring','merchant','refund','terminal']},
 {id:'kyc-rev',cat:'oth',t:'Periodic KYC Review',r:'Global',reg:'FATF R.10',d:'Reviews customer files on their risk cycle and flags what changed.',kw:['kyc','periodic review','refresh','cdd']},
 {id:'sanc-cust',cat:'scr',t:'Customer Screening UK (OFSI)',r:'United Kingdom',reg:'FCA · OFSI',d:'Screens customers and UBOs against the OFSI consolidated list.',kw:['customer screening uk','ofsi customer','ubo']},
 {id:'tf-ae',cat:'oth',t:'Trade Finance AML UAE',r:'United Arab Emirates',reg:'CBUAE',d:'Checks letters of credit for invoicing and dual-use goods risk.',kw:['trade finance uae','letters of credit']},
 {id:'tm-gaming',cat:'tm',t:'Gaming & Betting AML',r:'Global',reg:'Local gambling regulators',d:'Monitors deposits, play patterns and withdrawals for laundering.',kw:['gaming','betting','casino','gambling']},
 {id:'fr-loan',cat:'fr',t:'Loan & Application Fraud',r:'Global',reg:'Local FIU',d:'Detects falsified income, synthetic identities and first-payment default rings.',kw:['loan fraud','application','synthetic identity']},
];
const SAMPLE_FILES=[
  {name:'AML_Policy_2026.pdf',size:'2.4 MB',ext:'PDF',c:'#DC3F3B',found:'14 policy clauses'},
  {name:'Alert_Handling_Procedure_v4.docx',size:'860 KB',ext:'DOC',c:'#2C47B1',found:'9 workflow rules'},
  {name:'Escalation_Matrix.xlsx',size:'120 KB',ext:'XLS',c:'#28941E',found:'5 roles and 4 SLAs'}
];
const EX_FILES=[
  {name:'Screening_Decision_Standard_v1.md',size:'23 KB',ext:'MD',c:'#2C47B1',found:'7 decision rules'},
  {name:'Hit_Review_Method_v1.md',size:'19 KB',ext:'MD',c:'#6A4BC4',found:'3 hit verdicts'},
  {name:'Country_Guidelines_UK_RTS_v1.md',size:'4 KB',ext:'MD',c:'#28941E',found:'5 close states'},
  {name:'Change_State_Method_v1.md',size:'3 KB',ext:'MD',c:'#DC3F3B',found:'2 state routes'}
];
const ACTS={ex:{"n1": ["Stream alerts from the reporting database", "Gate by alert type and queue", "Route to the queue's use case"], "n2": ["Assign to Ray if nobody holds it", "If an analyst holds it, add a note only"], "n3": ["Read every hit on the alert", "Up to 60 hits in one pass", "Otherwise chunks of up to 19 hits"], "n4": ["Compare name, date of birth, nationality and ID documents", "Give every hit a verdict: no match, possible, true match", "Quote both values for every identifier"], "n5": ["Count the verdicts against all hits", "An unreviewed hit forces an escalation"], "n6": ["The highest-risk hit sets the outcome", "Write the disposition section", "Record a confidence level"], "n7": ["Set the state to closed", "Resolution: approved", "Post Ray's note"], "n8": ["Park it unassigned for post-Ray investigation", "Recommend further investigation", "Post Ray's note"], "n9": ["Apply the country close state", "Run EDD or decline as required", "Notify the escalation mailbox"]},scr:{"n1": ["Hold the payment"], "n2": ["Score the match strength", "Discount anything below the threshold"], "n3": ["Compare the identifiers", "Request more information", "Add a note"], "n4": ["Select a closure reason", "Add to the good-guy list"], "n5": ["Attach the evidence"], "n6": ["Approve the block", "Or return it to level 1"], "n7": ["Record the rationale"], "n8": ["Freeze the funds", "File the report"]},tm:{"n1": ["Assign a risk score"], "n2": ["Pull 90 days of activity", "Attach related alerts"], "n3": ["Review the activity", "Add a note", "Close or escalate"], "n4": ["Select a closure reason", "Write the rationale"], "n5": ["Attach the evidence", "Set the priority"], "n6": ["Request information from the customer", "Link alerts into one case"], "n7": ["Approve the closure"], "n8": ["Draft the report narrative", "Submit the report"]}};
const KIND={bell:['ti-bell','#4A72E8'],lock:['ti-lock','#7B6CF0'],db:['ti-database','#16A6AE'],search2:['ti-search','#7B6CF0'],rule:['ti-list-check','#E8850C'],user:['ti-user','#2f6df6'],close:['ti-circle-check','#1e9e6a'],up:['ti-arrow-up-right','#E8850C'],users:['ti-users','#9068C4'],bolt:['ti-bolt','#E8850C'],flag:['ti-flag','#d93a3a'],shield:['ti-shield-check','#1e9e6a']};

function buildWorkflow(tplId){
  const tpl=TEMPLATES.find(t=>t.id===tplId)||TEMPLATES[1];
  const A=tpl.id==='ts-example'?ACTS.ex:(tpl.cat==='scr'?ACTS.scr:ACTS.tm);
  const withActs=o=>{o.acts=(A[o.id]||[]).slice();return o;};
  if(tpl.id==='ts-example') return {
    nodes:[
      withActs({id:'n1',r:0,c:1,t:'Screening alert received',k:'bell',ai:false,role:'System',sla:'Instant',pol:'1'}),
      withActs({id:'n2',r:1,c:1,t:'Claim alert for Ray',k:'lock',ai:false,role:'Ray',sla:'Instant',pol:'9'}),
      withActs({id:'n3',r:2,c:1,t:'Collect hits & split into chunks',k:'db',ai:false,role:'System',sla:'Instant',pol:'3'}),
      withActs({id:'n4',r:3,c:1,t:'Review every hit in parallel',k:'search2',ai:true,role:'Ray',sla:'Instant',pol:'2'}),
      withActs({id:'n5',r:4,c:1,t:'Coverage check & highlights',k:'rule',ai:false,role:'System',sla:'Instant',pol:'4'}),
      withActs({id:'n6',r:5,c:1,t:'Decide alert & write summary',k:'user',ai:true,role:'Ray',sla:'Instant',pol:'7'}),
      withActs({id:'n7',r:6,c:0,t:'Close as false positive',k:'close',ai:false,role:'Ray',sla:'Instant',pol:'9'}),
      withActs({id:'n8',r:6,c:2,t:'Park for analyst review',k:'up',ai:false,role:'Ray',sla:'Instant',pol:'9'}),
      withActs({id:'n9',r:7,c:2,t:'Analyst & Compliance decision',k:'users',ai:false,role:'Analyst L1',sla:'24 hours',pol:'8'})
    ],
    edges:[['n1','n2'],['n2','n3'],['n3','n4','Hit chunks'],['n4','n5'],['n5','n6'],['n6','n7','High-confidence FP'],['n6','n8','Match or unresolved'],['n8','n9']]
  };
  const regRep={'cb-es':'SEPBLAC report','ts-uk':'OFSI report','wm-ch':'MROS goAML','tf-sg':'STRO filing','msb-ae':'goAML UAE','card-us':'Chargeback'}[tpl.id]||'Regulatory report';
  if(tpl.cat==='scr') return {
    nodes:[
      withActs({id:'n1',r:0,c:1,t:'Screening hit raised',k:'bell',ai:false,role:'System',sla:'Instant',pol:'3.1'}),
      withActs({id:'n2',r:1,c:1,t:'Auto-discount weak matches',k:'bolt',ai:false,role:'System',sla:'Instant',pol:'4.3'}),
      withActs({id:'n3',r:2,c:1,t:'L1 hit review',k:'user',ai:true,role:'Analyst L1',sla:'4 hours',pol:'4.2'}),
      withActs({id:'n4',r:3,c:0,t:'Release as false positive',k:'close',ai:false,role:'Analyst L1',sla:'4 hours',pol:'4.3'}),
      withActs({id:'n5',r:3,c:2,t:'Escalate possible match',k:'up',ai:false,role:'Analyst L1',sla:'4 hours',pol:'5.1'}),
      withActs({id:'n6',r:4,c:2,t:'Supervisor decision',k:'users',ai:false,role:'Supervisor',sla:'24 hours',pol:'5.4'}),
      withActs({id:'n7',r:5,c:1,t:'Release payment',k:'close',ai:false,role:'Supervisor',sla:'24 hours',pol:'7.2'}),
      withActs({id:'n8',r:5,c:2,t:'Block & '+regRep,k:'flag',ai:false,role:'MLRO',sla:'24 hours',pol:'6.1'})
    ],
    edges:[['n1','n2'],['n2','n3','Remaining hits'],['n3','n4','No match'],['n3','n5','Possible match'],['n5','n6'],['n6','n7','Not a match'],['n6','n8','True match']]
  };
  return {
    nodes:[
      withActs({id:'n1',r:0,c:1,t:'Alert generated',k:'bell',ai:false,role:'System',sla:'Instant',pol:'3.1'}),
      withActs({id:'n2',r:1,c:1,t:'Auto-enrichment',k:'db',ai:false,role:'System',sla:'Instant',pol:'3.1'}),
      withActs({id:'n3',r:2,c:1,t:'L1 triage',k:'user',ai:true,role:'Analyst L1',sla:'48 hours',pol:'4.2'}),
      withActs({id:'n4',r:3,c:0,t:'Close as false positive',k:'close',ai:false,role:'Analyst L1',sla:'48 hours',pol:'4.3'}),
      withActs({id:'n5',r:3,c:2,t:'Escalate to L2',k:'up',ai:false,role:'Analyst L1',sla:'24 hours',pol:'5.1'}),
      withActs({id:'n6',r:4,c:2,t:'Investigation & RFI',k:'search2',ai:true,role:'Analyst L2',sla:'10 days',pol:'5.4'}),
      withActs({id:'n7',r:5,c:1,t:'Close with rationale',k:'close',ai:false,role:'Supervisor',sla:'5 days',pol:'7.2'}),
      withActs({id:'n8',r:5,c:2,t:'File '+(tpl.cat==='fr'?'fraud report':'SAR'),k:'flag',ai:false,role:'MLRO',sla:'30 days',pol:'6.1'})
    ],
    edges:[['n1','n2'],['n2','n3'],['n3','n4','No concern'],['n3','n5','Suspicious'],['n5','n6'],['n6','n7','Explained'],['n6','n8','Suspicion confirmed']]
  };
}

function buildPolicy(tplId,hasDocs){
  const tpl=TEMPLATES.find(t=>t.id===tplId)||TEMPLATES[1];
  if(tpl.id==='ts-example'){
    const f=n=>hasDocs?n:'ThetaRay template';
    return [
      {no:'1',t:'Scope and routing',p:'Every transaction screening alert in one of the 21 screening queues is investigated. The queue picks the use case and the country guidelines.',src:f('Screening_Decision_Standard_v1.md · Scope')},
      {no:'2',t:'Name matching',p:'Names are compared as sets of name parts, never as strings. Spelling and transliteration variants are the same part. An initial is a possible variant: it neither confirms nor rules out a match.',src:f('Screening_Decision_Standard_v1.md · Name matching')},
      {no:'3',t:'Hit-by-hit comparison',p:'Every hit is compared on name, date of birth, nationality, identity documents, entity type and list. Match score is context, never evidence.',src:f('Hit_Review_Method_v1.md · How to review a hit')},
      {no:'4',t:'Evidence grounding',p:'Every identifier claim quotes both values. Every hit gets a verdict row; a missing row is recorded as unreviewed and forces an escalation.',src:f('Screening_Decision_Standard_v1.md · Evidence grounding')},
      {no:'5',t:'Missing information',p:'A verified full date-of-birth mismatch is decisive. A missing date of birth is neutral. Matching document numbers are always a true-match risk.',src:f('Screening_Decision_Standard_v1.md · Missing information')},
      {no:'6',t:'Sanctions clearing',p:'Sanctions hits can be cleared only on a verified DOB mismatch, no name overlap, every listed birth year more than 3 years apart, or a partial overlap plus two differing discriminators.',src:f('Screening_Decision_Standard_v1.md · Sanctions clearing')},
      {no:'7',t:'Alert outcome',p:'The alert follows its highest-risk hit. False Positive leads to Approve/Proceed; anything else leads to Human Review Required.',src:f('Screening_Decision_Standard_v1.md · Outcome rules')},
      {no:'8',t:'Close states after escalation',p:'Compliance closes an escalated alert as True Match, Internal Stop, PEP with/without issue, or Internal Watch with/without issue.',src:f('Country_Guidelines_UK_RTS_v1.md · UK guidance')},
      {no:'9',t:'Change state',p:'The state change is always last. Only a high-confidence false positive is closed; everything else is parked unassigned. If an analyst holds the alert, Ray only adds a note.',src:f('Change_State_Method_v1.md · Target state')}
    ];
  }
  const src=hasDocs?'AML_Policy_2026.pdf':'ThetaRay template · '+tpl.t;
  const scr=tpl.cat==='scr';
  return [
    {no:'3.1',t:'Scope',p:scr?'Screening applies to all inbound and outbound payments and to every customer at onboarding and on list updates, within '+tpl.r+'.':'Monitoring covers all current, savings and card accounts. Alerts are generated by approved detection scenarios and scored by risk.',src:src+(hasDocs?' · p.4':'')},
    {no:'4.2',t:'Alert review timelines',p:scr?'Level 1 must review every screening hit within 4 hours during business hours. Payments stay on hold until a decision is recorded.':'Level 1 must review standard alerts within 48 hours. Alerts with a risk score above 80 must be reviewed within 24 hours.',src:src+(hasDocs?' · p.12':'')},
    {no:'4.3',t:scr?'Automatic discounting':'False-positive closure',p:scr?'Matches below a similarity score of 75 may be discounted automatically when date of birth or country does not match.':'Closing an alert as a false positive requires a closure reason from the approved list and a written rationale.',src:src+(hasDocs?' · p.13':'')},
    {no:'5.1',t:'Escalation criteria',p:scr?'Any hit where two or more identifiers match must be escalated to a supervisor.':'Escalate to Level 2 when activity cannot be explained by the customer profile, or when the customer is linked to another open case.',src:hasDocs?'Alert_Handling_Procedure_v4.docx · §2':src},
    {no:'5.4',t:scr?'Supervisor decision':'Requests for information',p:scr?'A supervisor confirms or rejects a true match. Blocking requires a second reviewer (four-eyes).':'Level 2 may request information from the customer through the relationship manager. The customer has 10 business days to respond.',src:hasDocs?'Escalation_Matrix.xlsx · Sheet 1':src},
    {no:'6.1',t:'Suspicious activity reporting',p:'Only the MLRO decides whether to report. Reports are filed with '+tpl.reg.split(' · ')[0]+' within 30 days of the suspicion being formed.',src:src+(hasDocs?' · p.18':'')},
    {no:'7.2',t:'Record keeping',p:'All decisions, notes and evidence are kept for at least 5 years after the alert is closed.',src:src+(hasDocs?' · p.22':'')}
  ];
}

const REPORT=[
  {h:'Alert summary',p:'Alert ID, queue, customer and the trigger in one paragraph.'},
  {h:'What Ray reviewed',p:'Every hit or transaction checked, with the data source for each.'},
  {h:'Evidence table',p:'Identifier-by-identifier comparison, quoting both values.'},
  {h:'Decision & rationale',p:'Outcome, confidence and the policy clause behind it.'},
  {h:'Recommended next action',p:'Close, park, escalate or file — and who acts next.'},
  {h:'Audit trail',p:'Package version, timestamps and every state change.'}
];

/* plain-language changes Ray understands in Build (Review & refine) */
const INTENTS=[
  {id:'sla',kw:['sla','24 hour','24h','faster','deadline','hours'],title:'Faster review for high-risk alerts',clause:['4.2','8']},
  {id:'four',kw:['four-eyes','four eyes','4-eyes','4 eyes','second review','second person','approval before'],title:'Four-eyes approval before filing',clause:['5.4','8']},
  {id:'rescreen',kw:['re-screen','rescreen','re screen','screening after'],title:'Sanctions re-screening after enrichment',clause:['3.1','3']},
  {id:'media',kw:['adverse','media','negative news'],title:'Adverse media in enrichment',clause:['5.1','3']},
  {id:'auto',kw:['auto-close','auto close','autoclose','repeat','low-risk','low risk'],title:'Auto-close repeat low-risk alerts',clause:['4.3','7']},
  {id:'owner',kw:['supervisor should','should own','owner','owns this','own this'],title:'Supervisor owns the decision',clause:['5.4','8']}
];

/* fine-tuning suggestions (Train) */
const TUNE={
  scr:[
    {id:'t1',node:'n6',alt:'n3',cat:'instr',t:'Tighten the close-as-false-positive instruction',cur:'Recommend False Positive whenever name matching rules the candidate out.',sug:'Recommend False Positive only when every hit is ruled out with a quoted identifier. An initial alone never supports a rule-out.',ev:'7 alerts Ray closed were escalated by your analysts',imp:'High'},
    {id:'t2',node:'n4',alt:'n2',cat:'rule',held:true,t:'Year-gap rule clears sanctions hits too early',cur:'Clear a sanctions hit when every listed birth year is more than 3 years from the customer’s.',sug:'Raise the year gap to 5 years when the list record carries only year-of-birth values.',ev:'4 alerts cleared on a 4-year gap were true-match risks',imp:'High'},
    {id:'t3',node:'n5',alt:'n2',cat:'bug',t:'Duplicate hits counted twice in the coverage check',cur:'Coverage counts each hit row; the same person on two lists looks unreviewed.',sug:'De-duplicate hits by list entry before counting coverage.',ev:'12 escalations were caused only by the coverage count',imp:'Medium'},
    {id:'t4',node:'n8',alt:'n6',cat:'flow',t:'No path when an analyst already holds the alert',cur:'Ray adds a note and stops; the recommendation has no owner.',sug:'Add a “Notify holder” step: send the analyst Ray’s recommendation with a 24-hour SLA.',ev:'9 alerts waited more than 3 days for a decision',imp:'Medium'},
    {id:'t5',node:'n3',alt:'n3',cat:'data',t:'Customer nationality missing on many alerts',cur:'Nationality comes only from the payment message.',sug:'Read nationality from the KYC profile before the hit review.',ev:'Missing on 18% of alerts · 22 avoidable escalations',imp:'High'}
  ],
  tm:[
    {id:'t1',node:'n4',cat:'instr',t:'Rationale must cite the activity',cur:'Close as false positive with a closure reason.',sug:'Close only with a rationale that names the transactions that explain the alert.',ev:'11 closures were reopened by QA for thin rationale',imp:'High'},
    {id:'t2',node:'n1',cat:'rule',held:true,t:'High-risk threshold misses fast layering',cur:'Fast-track alerts with a risk score above 80.',sug:'Fast-track at 75 when funds leave within 48 hours of arriving.',ev:'5 SAR-worthy alerts scored 75–80 and waited 48h',imp:'High'},
    {id:'t3',node:'n2',cat:'bug',t:'Related alerts attached twice',cur:'Enrichment links related alerts on every refresh.',sug:'De-duplicate linked alerts by alert ID.',ev:'Duplicate links on 14% of alerts',imp:'Medium'},
    {id:'t4',node:'n6',cat:'flow',t:'No path when the RFI is unanswered',cur:'Investigation waits until the customer responds.',sug:'After 10 business days, escalate to the supervisor with a draft exit recommendation.',ev:'8 cases stalled beyond 30 days',imp:'Medium'},
    {id:'t5',node:'n2',cat:'data',t:'Counterparty country missing on wires',cur:'Country comes from the SWIFT field 59 only.',sug:'Fall back to the beneficiary bank BIC country.',ev:'Missing on 21% of wires · 17 avoidable escalations',imp:'High'}
  ]
};
const TUNE_CAT={instr:['Instruction','act'],rule:['Rule','warn'],bug:['Technical fix','risk'],flow:['Process','ai'],data:['Data gap','ok']};
const DIFFS=[['A-20931','Escalated','Close as false positive','Same pattern closed 4 times in 30 days'],['A-21107','Closed','Escalate','New high-risk counterparty in the chain'],['A-21388','Escalated','Escalate + RFI','Same outcome, Ray adds an RFI'],['A-21744','SAR filed','Escalate','Ray stops at L2: filing is the MLRO’s call']];
const SHADOW_DIFFS=[['A-30412','Closed','Escalate','Counterparty added to OFSI list on 2 Oct'],['A-30587','Escalated','Close','Duplicate of A-30586, same transaction'],['A-30901','Closed after 3 days','Closed in 2 min','Same outcome, faster']];
const CHECKLIST=[
  {t:'MRM document approved',ray:true},
  {t:'User guide shared with analysts',ray:true},
  {t:'Analysts trained on the new workflow',ray:false},
  {t:'Rollback plan agreed',ray:true},
  {t:'Monitoring owner assigned',ray:false}
];
const AUTHORITY=[
  {id:'note',t:'Post notes only',d:'Ray adds its findings as a note. Analysts decide everything.',ic:'ti-note'},
  {id:'rec',t:'Recommend',d:'Ray recommends an outcome and prepares the close. An analyst confirms.',ic:'ti-thumb-up'},
  {id:'close',t:'Auto-close high-confidence false positives',d:'Ray closes clear false positives on its own; everything else goes to analysts.',ic:'ti-circle-check'}
];
const STAGES=[
  {k:'build',t:'Build',sub:'Hire & brief',c:'var(--now)',ic:'ti-briefcase'},
  {k:'train',t:'Train',sub:'Practice on old cases',c:'var(--act)',ic:'ti-school'},
  {k:'prove',t:'Prove',sub:'Shadow a senior',c:'var(--violet2)',ic:'ti-eye-check'},
  {k:'operate',t:'Operate',sub:'Work alone',c:'var(--ok)',ic:'ti-player-play'}
];
const PEOPLE={
  you:{n:'You',r:'Compliance lead',i:'YOU'},
  dana:{n:'Dana Levi',r:'Analyst team lead',i:'DL'},
  mlro:{n:'Sarah Klein',r:'MLRO',i:'SK'},
  fcc:{n:'Lior Ben-Ami',r:'Head of FCC',i:'LB'},
  ray:{n:'Ray',r:'AI investigator',i:'✦'},
  tom:{n:'Tom Keller',r:'ThetaRay services',i:'TK'},
  thetaray:{n:'ThetaRay',r:'Services team',i:'TR'}
};

window.RSD={ACTS,CATS,TEMPLATES,SAMPLE_FILES,EX_FILES,KIND,buildWorkflow,buildPolicy,REPORT,INTENTS,TUNE,TUNE_CAT,DIFFS,SHADOW_DIFFS,CHECKLIST,AUTHORITY,STAGES,PEOPLE};
})();
