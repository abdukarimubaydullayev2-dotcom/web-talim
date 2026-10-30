// This module is server-only: answer keys and paper mappings never go to student clients.
import {AuthError,digest} from '../auth/service.mjs';
export function validateBank(input){
 if(!Array.isArray(input)||input.length<2||input.length>1000)throw new AuthError('Bankda 2–1000 ta savol bo‘lsin.');const seen=new Set();
 const clean=(value,max)=>{if(typeof value!=='string')throw new AuthError('Savol va javoblar matn bo‘lishi kerak.');const s=value.normalize('NFKC').trim();if(!s||s.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s))throw new AuthError('Savol yoki javob matni bo‘sh yoki juda uzun.');return s;};
 return input.map((q,i)=>{try{const question=clean(q?.question,2000),key=question.toLocaleLowerCase('uz').replace(/\s+/g,' ');if(seen.has(key))throw new AuthError('Savol takrorlangan.');seen.add(key);if(!Array.isArray(q.options)||q.options.length<2||q.options.length>6)throw new AuthError('2–6 ta javob varianti kerak.');const options=q.options.map(x=>clean(x,1000));if(new Set(options.map(x=>x.toLocaleLowerCase('uz').replace(/\s+/g,' '))).size!==options.length)throw new AuthError('Javob variantlari takrorlangan.');if(!Number.isInteger(q.correct)||q.correct<0||q.correct>=options.length)throw new AuthError('Aynan bitta to‘g‘ri javobni * bilan belgilang.');return {question,options,correct:q.correct};}catch(e){if(e instanceof AuthError)throw new AuthError((i+1)+'-savol: '+e.message);throw e;}});
}
export function combinationsAtLeast(n,k,needed){let count=1;k=Math.min(k,n-k);for(let i=1;i<=k;i++){count=count*(n-k+i)/i;if(count>=needed)return true;}return count>=needed;}
export function validateQuestionCount(value,bankCount,students){if(!Number.isInteger(value)||value<1||value>100||value>=bankCount)throw new AuthError('Beriladigan savollar soni 1–100 oralig‘ida va bankdagi savollar sonidan kam bo‘lsin.');if(!combinationsAtLeast(bankCount,value,Math.max(2,students)))throw new AuthError('Barcha o‘quvchilarga turli savollar to‘plami yetmaydi. Bankka savol qo‘shing yoki olinadigan sonni o‘zgartiring.');return value;}
function randomBelow(n){const limit=Math.floor(4294967296/n)*n;let v;do{v=crypto.getRandomValues(new Uint32Array(1))[0];}while(v>=limit);return v%n;}
export function shuffled(values){const a=[...values];for(let i=a.length-1;i>0;i--){const j=randomBelow(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
const setKey=indices=>[...indices].sort((a,b)=>a-b).join(',');
export function selectUnusedSet(n,k,used){for(let i=0;i<32;i++){const selection=shuffled(Array.from({length:n},(_,j)=>j)).slice(0,k),key=setKey(selection);if(!used.has(key))return {selection,key};}
 // Exhaustion-safe fallback finds a free combination even near capacity.
 const a=Array.from({length:k},(_,i)=>i);while(true){const key=setKey(a);if(!used.has(key))return {selection:shuffled(a),key};let i=k-1;while(i>=0&&a[i]===n-k+i)i--;if(i<0)throw new AuthError('Bu nazorat uchun turli savollar to‘plami tugagan. O‘qituvchiga murojaat qiling.',409);a[i]++;for(let j=i+1;j<k;j++)a[j]=a[j-1]+1;}
}
export function paperFor(bank,selection){return selection.map(q=>({q,order:shuffled(bank[q].options.map((_,i)=>i))}));}
export function studentPaper(bank,paper){return paper.map((p,i)=>({number:i+1,question:bank[p.q].question,options:p.order.map(o=>bank[p.q].options[o])}));}
export function validAnswers(answers,paper){if(!Array.isArray(answers)||answers.length!==paper.length||answers.some((a,i)=>a!==null&&(!Number.isInteger(a)||a<0||a>=paper[i].order.length)))throw new AuthError('Javoblar soni yoki tanlangan variant noto‘g‘ri.');return answers;}
export function grade(bank,paper,answers){validAnswers(answers,paper);const correct=answers.reduce((n,a,i)=>n+(a!==null&&paper[i].order[a]===bank[paper[i].q].correct?1:0),0);return {correct,total:paper.length,percent:Math.round(correct*100/paper.length)};}
