import {useState} from 'react';
import {Routes,Route,NavLink,Link,useNavigate,useParams} from 'react-router-dom';
import {LayoutDashboard,Palette,FilePlus2,ClipboardCheck,History,BarChart3,Settings,Bot,Hexagon} from 'lucide-react';
import {useApp} from './context/AppContext';import {runAudit} from './services/auditEngine';import {reply} from './services/assistantService';import {samples} from './data/initialData';
const fmt=d=>new Date(d).toLocaleString();
const CATS=['Tone and voice','Terminology','Messaging alignment','Unsupported promotional claims','Missing factual evidence','Readability and accessibility'];
const Logo=()=><div className="mono" style={{display:'flex',gap:8,alignItems:'center',color:'var(--cy)'}}><Hexagon/><b>INKLOOM AI</b></div>;
const Empty=({t})=><p className="mu sm">{t}</p>;
const useDraft=()=>{const {id}=useParams();const {s}=useApp();return s.drafts.find(d=>d.id===id)||(id?null:s.drafts[0])};

function Access(){return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:20}}><div className="panel" style={{maxWidth:560}}>
<Logo/><p className="mono sm mu">ROUND 02 · THE BUILD · A CODE BUSTERS PROJECT</p>
<h1 style={{fontSize:'2.2rem',margin:'12px 0'}}>Brand Governance That Explains Itself.</h1>
<p className="mu">Intelligent Brand Governance Platform. Set brand rules, audit drafts, understand each finding, fix wording, and route content through human review.</p>
<p><span className="demo">DEMO ENVIRONMENT</span> <span className="sm mu">No login. Data stays in this browser.</span></p>
<Link to="/dashboard"><button className="btn lime">Enter Demo Workspace</button></Link></div></div>}

function Shell({children}){const {s,setRole,toast,aiOpen,setAi}=useApp();
const L=[['/dashboard','Dashboard',LayoutDashboard],['/workspace','Brand Workspace',Palette],['/audit','Content Audit',FilePlus2],['/review','Review Queue',ClipboardCheck],['/history','Revision History',History],['/insights','Insights',BarChart3],['/settings','Settings',Settings]];
return <div className="shell"><nav className="side" aria-label="Main"><Logo/><div className="mono sm mu" style={{margin:'6px 0 14px'}}>Demo Workspace</div>
{L.map(([to,t,I])=><NavLink key={to} to={to} className={({isActive})=>'nav'+(isActive?' active':'')}><I size={14}/> {t}</NavLink>)}
<button className="btn mg" style={{marginTop:14}} onClick={()=>setAi(!aiOpen)}><Bot size={14}/> AI Assistant</button></nav>
<main className="main"><div className="top"><span className="demo">DEMO ENVIRONMENT</span>
<label className="sm mu">Simulated role <select aria-label="Role" value={s.role} onChange={e=>setRole(e.target.value)} style={{width:'auto'}}><option value="creator">Creator</option><option value="reviewer">Reviewer</option></select></label></div>
{children}</main>{aiOpen&&<Assistant/>}{toast&&<div className="toast" role="status">{toast}</div>}</div>}

function Assistant(){const {s,ctx,setAi,say,save}=useApp();const [msgs,setM]=useState([]);const [q,setQ]=useState('');
const draft=s.drafts.find(d=>d.id===ctx.draftId);const finding=draft?.findings.find(f=>f.id===ctx.findingId);
const ask=t=>{if(!t.trim())return;const r=reply(t,{draft,finding,rules:s.rules});setM(m=>[...m,{r:'u',t},{r:'a',t:r.text,p:r.proposal}]);setQ('')};
const apply=p=>{const f=draft.findings.find(x=>x.id===p.id);if(!f||!draft.text.includes(f.text))return say('Text no longer present');
 save({...draft,text:draft.text.replace(f.text,p.to),findings:draft.findings.map(x=>x.id===f.id?{...x,state:'applied'}:x)},`Assistant proposal applied to ${f.id}`);say('Applied. Re-run the audit.')};
return <aside className="ai" aria-label="AI Assistant"><div style={{display:'flex',justifyContent:'space-between'}}><b style={{color:'var(--mg)'}}>Inkloom AI Assistant</b><button className="btn" onClick={()=>setAi(false)}>Close</button></div>
<p className="sm mu">Demo assistant: local rules and response templates. No LLM is connected.{draft?` Context: ${draft.title}${finding?' / '+finding.id:''}`:''}</p>
<div className="msgs">{!msgs.length&&<Empty t="Pick a prompt below."/>}{msgs.map((m,i)=><div key={i} className={'m '+m.r}>{m.t}{m.p&&<div><button className="btn lime" onClick={()=>apply(m.p)}>Apply to draft</button></div>}</div>)}</div>
<div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>{['Explain the highest-priority issue','Summarize my audit findings','Suggest a safer alternative','How does review work?'].map(p=><button key={p} className="btn sm" onClick={()=>ask(p)}>{p}</button>)}</div>
<div style={{display:'flex',gap:6}}><input aria-label="Message" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask(q)}/><button className="btn" onClick={()=>ask(q)}>Send</button></div></aside>}

function Dashboard(){const {s}=useApp();const D=s.drafts;const n=x=>D.filter(d=>d.status===x).length;const fl=D.flatMap(d=>d.findings).filter(f=>f.state==='open');
return <><h1>Brand Intelligence Command Center</h1><p className="mu">Review content, enforce brand standards, and resolve compliance issues before publication.</p>
<Link to="/audit"><button className="btn lime">New Content Audit</button></Link>
<div className="grid4" style={{margin:'16px 0'}}>{[['Drafts / analyzed',n('Draft')+n('Analyzed')],['Pending reviews',n('Pending Review')],['Open findings',fl.length],['Approved',n('Approved')]].map(([a,b])=><div className="panel" key={a}><div className="big mono">{b}</div><div className="sm mu">{a}</div></div>)}</div>
<div className="cols"><div className="panel"><h2>Review queue preview</h2>{D.filter(d=>d.status==='Pending Review').slice(0,3).map(d=><div className="row" key={d.id}><Link to={'/review/'+d.id}>{d.title}</Link></div>)}{!n('Pending Review')&&<Empty t="Nothing pending. Submit an audited draft."/>}</div>
<div className="panel"><h2>Findings by category</h2>{fl.length?CATS.map(c=>{const k=fl.filter(f=>f.cat===c).length;return k?<div key={c} className="sm">{c}: {k}</div>:null}):<Empty t="Run an audit to see findings."/>}</div>
<div className="panel"><h2>Recent activity</h2>{s.revisions.slice(0,4).map(r=><div className="row sm" key={r.id}>{r.title}: {r.note}</div>)}{!s.revisions.length&&<Empty t="No actions yet."/>}</div>
<div className="panel"><h2>Guidelines</h2><p>{s.rules.filter(r=>r.status==='active').length} active / {s.rules.length} total <span className="tag">demo data</span></p></div></div></>}

function Workspace(){const {s,setS,say}=useApp();const [f,setF]=useState({title:'',kind:'prohibited',term:'',alt:''});
const up=(id,fn)=>setS(p=>({...p,rules:fn(p.rules)}));
const add=()=>{if(!f.title.trim()||!f.term.trim())return say('Title and term are required');
 up(0,r=>[...r,{id:'G-'+(Math.max(0,...r.map(x=>+x.id.slice(2)))+1),title:f.title,kind:f.kind,term:f.term,alt:f.alt,category:f.kind==='prohibited'?'Terminology':f.kind==='fact'?'Approved facts':'Messaging alignment',status:'active'}]);setF({title:'',kind:'prohibited',term:'',alt:''});say('Rule saved')};
return <><h1>Brand Workspace</h1><p className="mu">{s.rules.filter(r=>r.status==='active').length} active rules. Source URLs are labels only; nothing is fetched or verified.</p>
<div className="cols"><div className="panel"><h2>Guidelines</h2>{s.rules.map(r=><div className="row" key={r.id}><b className="mono">{r.id}</b> {r.title} <span className="tag">{r.kind}: {r.term}</span>
<div><button className="btn sm" onClick={()=>up(0,x=>x.map(y=>y.id===r.id?{...y,status:y.status==='active'?'disabled':'active'}:y))}>{r.status==='active'?'Disable':'Enable'}</button>{' '}
<button className="btn sm" onClick={()=>{const t=prompt('Edit title',r.title);if(t){up(0,x=>x.map(y=>y.id===r.id?{...y,title:t}:y));say('Rule saved')}}}>Edit</button>{' '}
<button className="btn mg sm" onClick={()=>confirm('Delete '+r.id+'?')&&up(0,x=>x.filter(y=>y.id!==r.id))}>Delete</button></div></div>)}</div>
<div className="panel"><h2>Add rule</h2><label>Title<input value={f.title} onChange={e=>setF({...f,title:e.target.value})}/></label>
<label>Type<select value={f.kind} onChange={e=>setF({...f,kind:e.target.value})}><option value="prohibited">Prohibited term</option><option value="required">Required phrase</option><option value="fact">Approved fact / evidence keyword</option></select></label>
<label>Term<input value={f.term} onChange={e=>setF({...f,term:e.target.value})}/></label><label>Preferred alternative<input value={f.alt} onChange={e=>setF({...f,alt:e.target.value})}/></label><br/><button className="btn lime" onClick={add}>Save rule</button></div></div></>}

function Audit(){const {s,save,say,setCtx}=useApp();const nav=useNavigate();const ex=useDraft();
const [d,setD]=useState(ex||{id:'D-'+Date.now(),title:'',type:'Social Media',text:'',status:'Draft',findings:[],comments:[]});
const set=o=>setD({...d,...o});const wc=d.text.trim()?d.text.trim().split(/\s+/).length:0;
const ok=()=>d.title.trim()&&d.text.trim()||(say('Title and text are required'),false);
const run=()=>{if(!ok())return;const x={...d,findings:runAudit(d.text,s.rules),status:'Analyzed'};save(x,`Audit run: ${x.findings.length} findings`);setCtx({draftId:x.id});nav('/results/'+x.id)};
return <><h1>Content Audit</h1><div className="panel"><div className="cols"><label>Title<input value={d.title} onChange={e=>set({title:e.target.value})}/></label>
<label>Type<select value={d.type} onChange={e=>set({type:e.target.value})}>{Object.keys(samples).map(t=><option key={t}>{t}</option>)}</select></label>
<label>Sample<select value="" onChange={e=>e.target.value&&set({text:samples[e.target.value]})}><option value="">Load sample...</option>{Object.keys(samples).map(t=><option key={t}>{t}</option>)}</select></label></div>
<label>Content<textarea value={d.text} onChange={e=>set({text:e.target.value})}/></label>
<p className="mono sm mu">{d.text.length} chars · {wc} words · {d.status}{d.updated?' · updated '+fmt(d.updated):''}</p>
<button className="btn lime" onClick={run}>Run Brand Audit</button>{' '}<button className="btn" onClick={()=>ok()&&(save(d,'Draft saved'),say('Draft saved'))}>Save Draft</button></div>
<div className="panel" style={{marginTop:14}}><h2>Drafts</h2>{s.drafts.map(x=><div className="row" key={x.id}><Link to={'/audit/'+x.id} onClick={()=>setTimeout(()=>location.reload(),0)}>{x.title}</Link> <span className="tag">{x.status}</span></div>)}</div></>}

function Results(){const {s,save,say,setCtx,setAi,ctx}=useApp();const d=useDraft();const [cat,setCat]=useState('');const [sev,setSev]=useState('');const [sel,setSel]=useState(null);const [edit,setEdit]=useState('');
if(!d)return <><h1>Audit Results</h1><Empty t="No draft found. Start a content audit."/></>;
const fs=d.findings.filter(f=>(!cat||f.cat===cat)&&(!sev||f.sev===sev));const f=d.findings.find(x=>x.id===sel);
const upd=(id,o,n)=>save({...d,findings:d.findings.map(x=>x.id===id?{...x,...o}:x)},n);
const pick=x=>{setSel(x.id);setEdit(x.sugg);setCtx({draftId:d.id,findingId:x.id})};
const apply=()=>{if(!f.text||!d.text.includes(f.text))return say('Cannot apply: text not found');
 save({...d,text:d.text.replace(f.text,edit),findings:d.findings.map(x=>x.id===f.id?{...x,state:'applied',sugg:edit}:x)},`Applied suggestion for ${f.id}`);say('Applied. Re-run the audit.')};
const parts=f&&f.text&&d.text.includes(f.text)?d.text.split(f.text):null;
return <><h1>Audit Results: {d.title}</h1><p className="mu sm">Frontend rule-based demo engine, not an AI model. Claims flagged need verification; they are not declared false.</p>
<div className="cols"><div className="panel"><h2>Content</h2><p style={{whiteSpace:'pre-wrap'}}>{parts?<>{parts[0]}<mark>{f.text}</mark>{parts.slice(1).join(f.text)}</>:d.text}</p>
<Link to={'/audit/'+d.id}><button className="btn sm" onClick={()=>setTimeout(()=>location.reload(),0)}>Edit draft</button></Link>{' '}
<button className="btn sm lime" onClick={()=>{save({...d,findings:runAudit(d.text,s.rules),status:'Analyzed'},'Audit re-run');say('Audit re-run')}}>Re-run audit</button>{' '}
<button className="btn sm" onClick={()=>d.status==='Analyzed'?nav2(d):say('Run an audit first')}>Submit for Review</button></div>
<div className="panel"><h2>Findings ({fs.length})</h2><select aria-label="Category" value={cat} onChange={e=>setCat(e.target.value)}><option value="">All categories</option>{CATS.map(c=><option key={c}>{c}</option>)}</select>
<select aria-label="Severity" value={sev} onChange={e=>setSev(e.target.value)}><option value="">All severities</option>{['Critical','High','Medium','Low'].map(c=><option key={c}>{c}</option>)}</select>
{!fs.length&&<Empty t="No findings match. Run an audit or clear filters."/>}
{fs.map(x=><div key={x.id} className={'row'+(sel===x.id?' sel':'')}><button className="btn sm" onClick={()=>pick(x)}>{x.id}</button> <span className={'tag sev-'+x.sev}>{x.sev}</span> {x.cat} <span className="tag">{x.state}</span></div>)}</div>
{f&&<div className="panel"><h2>{f.id} · {f.cat}</h2><p>Affected: <mark>{f.text||'(missing)'}</mark></p><p>{f.exp}</p><p className="sm mu">Guideline: {f.rule||'none'} · Evidence: {f.ev}</p>
{f.sugg&&<><label>Suggested correction (editable)<input value={edit} onChange={e=>setEdit(e.target.value)}/></label><p className="sm mu">Wording needs human review; it is not verified evidence.</p></>}
{f.sugg&&f.state==='open'&&<button className="btn lime" onClick={apply}>Accept and apply</button>}{' '}
<button className="btn" onClick={()=>upd(f.id,{state:'dismissed'},`Dismissed ${f.id}`)}>Dismiss</button>{' '}
<button className="btn mg" onClick={()=>{setCtx({draftId:d.id,findingId:f.id});setAi(true)}}>Ask AI Assistant to explain this issue</button></div>}</div></>;
function nav2(x){const ok=window.__move(x,'Pending Review');ok&&(location.hash='#/review/'+x.id)}}
function Wire(){const {move}=useApp();window.__move=move;return null}

function Review(){const {s}=useApp();return <><h1>Review Queue</h1><div className="panel">{!s.drafts.length&&<Empty t="No content yet."/>}{s.drafts.map(d=><div className="row" key={d.id}><Link to={'/review/'+d.id}>{d.title}</Link> <span className="tag">{d.type}</span> <span className="tag">{d.status}</span> <span className="sm mu">{d.findings.filter(f=>f.state==='open').length} open · {fmt(d.updated)}</span></div>)}</div></>}
function ReviewDetail(){const {s,move}=useApp();const d=useDraft();const [c,setC]=useState('');const rv=s.role==='reviewer';
if(!d)return <Empty t="Not found."/>;
const act=(to,need)=>{if(need&&!c.trim())return alert('Add a reviewer comment');move(d,to,c)&&setC('')};
return <><h1>Review: {d.title}</h1><p className="mu sm">Role switching is simulated; no real authorization.</p><div className="cols"><div className="panel"><span className="tag">{d.status}</span><p style={{whiteSpace:'pre-wrap'}}>{d.text}</p>{d.findings.map(f=><div className="sm row" key={f.id}>{f.id} {f.sev} {f.cat} [{f.state}]</div>)}</div>
<div className="panel"><h2>Decision</h2>{d.comments.map((x,i)=><div className="row sm" key={i}>{x.by} {fmt(x.at)}: {x.text}</div>)}
<textarea style={{minHeight:70}} aria-label="Comment" value={c} onChange={e=>setC(e.target.value)}/>
{rv?<><button className="btn lime" onClick={()=>act('Approved')}>Approve</button> <button className="btn" onClick={()=>act('Changes Requested',1)}>Request Changes</button> <button className="btn mg" onClick={()=>act('Rejected',1)}>Reject</button></>:<><button className="btn" onClick={()=>act('Pending Review')}>Submit for Review</button> <button className="btn" onClick={()=>act('Draft')}>Return to Editing</button></>}</div></div></>}

function Hist(){const {s}=useApp();const [o,setO]=useState(null);return <><h1>Revision History</h1><div className="panel">{!s.revisions.length&&<Empty t="No actions recorded yet."/>}{s.revisions.map(r=><div className="row" key={r.id}><b className="mono">{r.id}</b> {r.title} · {r.note} <span className="tag">{r.status}</span> <span className="sm mu">{fmt(r.at)}</span> <button className="btn sm" onClick={()=>setO(o===r.id?null:r.id)}>Snapshot</button>{o===r.id&&<pre className="sm" style={{whiteSpace:'pre-wrap'}}>{r.snap}</pre>}</div>)}</div></>}
function Insights(){const {s}=useApp();const fs=s.drafts.flatMap(d=>d.findings);if(!fs.length)return <><h1>Governance Insights</h1><Empty t="Insufficient data. Run an audit first."/></>;
const cnt=k=>fs.reduce((a,f)=>(a[f[k]||'none']=(a[f[k]||'none']||0)+1,a),{});const B=({o})=>Object.entries(o).map(([k,v])=><div key={k} className="sm">{k} ({v})<div className="bar" style={{width:v/fs.length*100+'%'}}/></div>);
return <><h1>Governance Insights</h1><div className="cols"><div className="panel"><h2>By category</h2><B o={cnt('cat')}/></div><div className="panel"><h2>By severity</h2><B o={cnt('sev')}/></div><div className="panel"><h2>Guidelines triggered</h2><B o={cnt('rule')}/></div>
<div className="panel"><h2>Workflow</h2><p>Pending: {s.drafts.filter(d=>d.status==='Pending Review').length} · Approved: {s.drafts.filter(d=>d.status==='Approved').length} · Revisions: {s.revisions.length}</p></div></div></>}
function Sett(){const {reset}=useApp();return <><h1>Settings</h1><div className="panel"><p>Workspace: Demo Workspace. Theme: cyberpunk (fixed). Data persists in this browser's localStorage only.</p>
<p className="sm mu">Limits: no backend, no real auth, rule-based audit, demo assistant, no external fact verification. Future: secure backend proxy for an organizer-permitted LLM; keys never in the browser.</p>
<button className="btn mg" onClick={()=>confirm('Reset all demo data?')&&reset()}>Reset demo data</button></div></>}

export default function App(){const page=(C)=><Shell><Wire/><C/></Shell>;
return <Routes><Route path="/" element={<Access/>}/><Route path="/dashboard" element={page(Dashboard)}/><Route path="/workspace" element={page(Workspace)}/>
<Route path="/audit" element={page(Audit)}/><Route path="/audit/:id" element={page(Audit)}/><Route path="/results" element={page(Results)}/><Route path="/results/:id" element={page(Results)}/>
<Route path="/review" element={page(Review)}/><Route path="/review/:id" element={page(ReviewDetail)}/><Route path="/history" element={page(Hist)}/><Route path="/insights" element={page(Insights)}/><Route path="/settings" element={page(Sett)}/>
<Route path="*" element={<Shell><h1>404</h1><Link to="/dashboard">Back to dashboard</Link></Shell>}/></Routes>}
