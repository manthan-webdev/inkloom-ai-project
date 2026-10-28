import {createContext,useContext,useEffect,useState} from 'react';import {initial} from '../data/initialData';
const C=createContext();export const useApp=()=>useContext(C);
const OK={'Pending Review':['Approved','Rejected','Changes Requested'],Analyzed:['Pending Review'],'Changes Requested':['Draft'],Rejected:['Draft']};
export function AppProvider({children}){
const [s,setS]=useState(()=>{try{return JSON.parse(localStorage.getItem('inkloom-v1'))||initial}catch{return initial}});
const [toast,setToast]=useState('');const [aiOpen,setAi]=useState(false);const [ctx,setCtx]=useState({});
useEffect(()=>{try{localStorage.setItem('inkloom-v1',JSON.stringify(s))}catch{}},[s]);
const say=m=>{setToast(m);setTimeout(()=>setToast(''),2500)};
const rev=(p,d,note)=>({...p,revisions:[{id:'R-'+(p.revisions.length+1),draftId:d.id,title:d.title,at:new Date().toISOString(),note,status:d.status,snap:d.text,role:p.role},...p.revisions]});
const save=(d,note)=>setS(p=>{const nd={...d,updated:new Date().toISOString()};const has=p.drafts.some(x=>x.id===nd.id);return rev({...p,drafts:has?p.drafts.map(x=>x.id===nd.id?nd:x):[nd,...p.drafts]},nd,note)});
const move=(d,to,note)=>{if(!(OK[d.status]||[]).includes(to)){say(`Invalid transition: ${d.status} to ${to}`);return false}
 const open=d.findings.filter(f=>f.state==='open').length;if(to==='Pending Review'&&open&&!confirm(open+' open findings remain. Submit anyway?'))return false;
 const c=note?[...d.comments,{by:s.role,at:new Date().toISOString(),text:note}]:d.comments;save({...d,status:to,comments:c},`${d.status} to ${to}${note?': '+note:''}`);say('Status: '+to);return true};
const v={s,setS,save,move,say,toast,aiOpen,setAi,ctx,setCtx,setRole:r=>setS(p=>({...p,role:r})),reset:()=>{setS(initial);say('Demo data reset')}};
return <C.Provider value={v}>{children}</C.Provider>}
