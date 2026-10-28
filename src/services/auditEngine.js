const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const SUP={fastest:'fast',best:'strong',cheapest:'affordable',leading:'trusted',guaranteed:'designed'};
const CLAIM=/\b(?:the )?(?:fastest|best|cheapest|leading|number one|guaranteed|most \w+)\b[^.!?,]*/gi;
export function runAudit(text,rules){
const act=rules.filter(r=>r.status==='active'),out=[];
const add=(cat,sev,t,exp,rule,ev,sugg)=>out.push({id:'F-'+(out.length+1),cat,sev,text:t,exp,rule,ev,sugg,state:'open'});
act.filter(r=>r.kind==='prohibited').forEach(r=>{const m=text.match(new RegExp('\\b'+esc(r.term)+'\\b','i'));
 if(m)add(r.category==='Tone and voice'?'Tone and voice':'Terminology','High',m[0],`"${m[0]}" conflicts with guideline ${r.id} (${r.title}).`,r.id,'Rule match',r.alt||'')});
act.filter(r=>r.kind==='required').forEach(r=>{if(!text.toLowerCase().includes(r.term.toLowerCase()))add('Messaging alignment','Medium','',`Required phrase "${r.term}" (${r.id}) is missing.`,r.id,'Rule match','')});
const facts=act.filter(r=>r.kind==='fact');
for(const m of text.matchAll(CLAIM)){const c=m[0].trim();
 if(facts.some(f=>c.toLowerCase().includes(f.term)))continue;
 let s=c.replace(/^the\b/i,'a');Object.keys(SUP).forEach(k=>{s=s.replace(new RegExp('\\b'+k+'\\b','i'),SUP[k])});s=s.replace(/ on the market/i,'').replace(/ solution/i,', simple solution');
 add('Unsupported promotional claims','High',c,'This comparative or superlative claim has no approved evidence configured. It is not judged false; it needs verification before publication.',null,'Needs verification',s);
 add('Missing factual evidence','Medium',c,'Add an approved fact or source in the Brand Workspace to support this statement.',null,'Needs verification','')}
text.split(/(?<=[.!?])\s+/).forEach(s=>{if(s.split(/\s+/).length>30)add('Readability and accessibility','Low',s,'Sentence exceeds 30 words, which can hurt readability.',null,'Heuristic','')});
(text.match(/\b[A-Z]{4,}\b/g)||[]).forEach(w=>add('Readability and accessibility','Low',w,'All-caps words are harder to read and may be read letter by letter by screen readers.',null,'Heuristic',w[0]+w.slice(1).toLowerCase()));
return out}
