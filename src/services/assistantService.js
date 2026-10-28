const ORD='CriticalHighMediumLow';
export function reply(q,{draft,finding,rules}){
const t=q.toLowerCase(),act=rules.filter(r=>r.status==='active');
if(/guideline|rule|brand/.test(t))return{text:'Active guidelines: '+act.map(r=>`${r.id} ${r.title}`).join('; ')};
if(!draft)return{text:'Open a draft or audit result so I can use its context.'};
const f=draft.findings.filter(x=>x.state==='open');
if(/explain|why/.test(t)&&(finding||f[0])){const x=finding||f[0];return{text:`${x.id} (${x.cat}, ${x.sev}): ${x.exp}\nEvidence status: ${x.ev}.`+(x.ev==='Needs verification'?'\nA reviewer or approved source must confirm this before publication.':'')}}
if(/summar/.test(t))return{text:f.length?`${f.length} open finding(s) in "${draft.title}": `+f.map(x=>x.id+' '+x.cat).join('; ')+'.':'No open findings. Run an audit if the draft changed.'};
if(/first|priorit|highest/.test(t)){const o=[...f].sort((a,b)=>ORD.indexOf(a.sev)-ORD.indexOf(b.sev))[0];return{text:o?`Start with ${o.id}: "${o.text||'(missing phrase)'}". ${o.exp}`:'Nothing open to prioritise.'}}
if(/rewrite|voice|alternative|safer|suggest/.test(t)){const x=finding?.sugg?finding:f.find(y=>y.sugg);return x?{text:`Proposed replacement for "${x.text}": "${x.sugg}". This is wording only, not verified evidence. Review before applying.`,proposal:{id:x.id,to:x.sugg}}:{text:'No replacement is available for the open findings.'}}
if(/review|submit|approv/.test(t))return{text:`Status is "${draft.status}". Resolve or dismiss findings, then Submit for Review. A reviewer approves, rejects or requests changes (role switch is simulated).`};
return{text:'Try: explain the highest-priority issue, summarize findings, suggest a safer alternative, or how review works.'}}
