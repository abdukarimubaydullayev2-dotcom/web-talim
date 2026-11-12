import adminHTML from '../admin/index.html?raw';
import {handleAdmin} from '../admin/server.mjs';
import {bootstrapAdministrator} from '../admin/bootstrap.mjs';
import loginHTML from '../auth/login.html?raw';
import accountHTML from '../auth/account.html?raw';
import clientJS from '../auth/client.js?raw';
import styleCSS from '../auth/style.css?raw';
import courseHTML from '../course/index.html?raw';
import modules from '../course/data.json';
import banks from '../course/banks.json';
import {handleAuth,currentAccount,readBody} from '../auth/service.mjs';
const all=modules.flatMap(m=>m.lessons.map(l=>({...l,module:m.id})));
const lesson=(id:string)=>all.find(l=>l.id===id);
function json(body:any,status=200){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'private,no-store'}})}
function content(body:string,type='text/html;charset=utf-8'){return new Response(body,{headers:{'Content-Type':type,'Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}})}
function quiz(id:string){const l=lesson(id)!;const m=modules[l.module-1];const peer=m.lessons.filter(x=>x.id!==id);const own=[
 {question:'Ushbu mavzuning asosiy tushunchasini to‘g‘ri ifodalagan javob qaysi?',options:[l.explain,...peer.slice(0,3).map(x=>x.explain)],answer:0},
 {question:'Mavzudagi texnologik nazorat qaysi javobda berilgan?',options:[l.control,...peer.slice(-3).map(x=>x.control)],answer:0},
 {question:'Ushbu mavzu bo‘yicha ko‘nikmani qaysi topshiriq tekshiradi?',options:[l.task,...peer.slice(1,4).map(x=>x.task)],answer:0},
 {question:'Amaliy ish natijasini ishonchli baholashning to‘g‘ri yo‘li qaysi?',options:['Jarayonni kuzatish, o‘lchovlarni qayd etish va belgilangan mezon bilan solishtirish','Faqat suratning chiroyliligiga qarash','Hech qanday qaydsiz taxmin qilish','Faqat ishning tezligiga qarab baholash'],answer:0}];
 return [...own,...banks[l.module-1]].map((q,i)=>{const off=(i+l.number)%4;const opts=q.options.map((x,j)=>({text:x,correct:j===q.answer}));const rotated=[...opts.slice(off),...opts.slice(0,off)];return {question:q.question,options:rotated.map(x=>x.text),answer:rotated.findIndex(x=>x.correct)}});
}
async function learning(request:Request,env:any,user:any,path:string){const db=env.DB;
 if(request.method==='GET'&&path==='/api/course')return json({modules});
 if(request.method==='GET'&&path==='/api/progress'){const {results}=await db.prepare('SELECT lesson_id,viewed,completed,best FROM lesson_progress WHERE account_id=?').bind(user.id).all();return json({progress:results})}
 if(request.method==='GET'&&path==='/api/quiz'){const id=new URL(request.url).searchParams.get('lesson')||'';if(!lesson(id))return json({error:'Mavzu topilmadi'},404);return json({questions:quiz(id).map(({answer,...q})=>q)})}
 if(request.method==='GET'&&path==='/api/practice'){const id=new URL(request.url).searchParams.get('lesson')||'';if(!lesson(id))return json({error:'Mavzu topilmadi'},404);const row=await db.prepare('SELECT body,updated_at FROM practice_submissions WHERE account_id=? AND lesson_id=?').bind(user.id,id).first();return json({submission:row||null})}
 if(request.method==='GET'&&path==='/api/groups'){
  if(user.role==='teacher'){const {results}=await db.prepare('SELECT g.id,g.name,g.code,count(m.account_id) as students FROM study_groups g LEFT JOIN study_members m ON m.group_id=g.id WHERE g.owner_id=? GROUP BY g.id ORDER BY g.created_at DESC').bind(user.id).all();return json({groups:results})}
  const {results}=await db.prepare('SELECT g.id,g.name,a.first_name,a.last_name FROM study_groups g JOIN study_members m ON m.group_id=g.id JOIN accounts a ON a.id=g.owner_id WHERE m.account_id=?').bind(user.id).all();return json({groups:results})
 }
 if(request.method==='GET'&&path==='/api/teacher/report'){
  if(user.role!=='teacher')return json({error:'Ruxsat yo‘q'},403);const id=new URL(request.url).searchParams.get('group');const g=await db.prepare('SELECT id FROM study_groups WHERE id=? AND owner_id=?').bind(id,user.id).first();if(!g)return json({error:'Guruh topilmadi'},404);
  const {results}=await db.prepare('SELECT a.id,a.first_name,a.last_name,a.login,a.group_name,count(p.lesson_id) as viewed,coalesce(sum(p.completed),0) as completed,(SELECT round(avg(q.percent)) FROM quiz_attempts q WHERE q.account_id=a.id) as average FROM study_members m JOIN accounts a ON a.id=m.account_id LEFT JOIN lesson_progress p ON p.account_id=a.id WHERE m.group_id=? GROUP BY a.id ORDER BY a.last_name,a.first_name').bind(id).all();return json({students:results})
 }
 if(request.method!=='POST')return json({error:'Manzil topilmadi'},404);
 if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json({error:'So‘rov manbasi noto‘g‘ri'},403);
 const b=await readBody(request);
 if(path==='/api/groups'){
  if(user.role!=='teacher')return json({error:'Faqat o‘qituvchi guruh yaratadi'},403);const name=String(b.name||'').trim();if(name.length<1||name.length>40)return json({error:'Guruh nomi 1–40 belgi bo‘lsin'},400);const id=crypto.randomUUID(),code=crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase();await db.prepare('INSERT INTO study_groups(id,owner_id,name,code,created_at) VALUES(?,?,?,?,?)').bind(id,user.id,name,code,Date.now()).run();return json({id,code},201)
 }
 if(path==='/api/groups/join'){
  if(user.role!=='student')return json({error:'Guruhga faqat o‘quvchi qo‘shiladi'},403);const code=String(b.code||'').trim().toUpperCase();if(!/^[A-F0-9]{16}$/.test(code))return json({error:'Guruh kodini tekshiring'},400);const g=await db.prepare('SELECT g.id FROM study_groups g JOIN accounts a ON a.id=g.owner_id WHERE g.code=? AND a.college_id=?').bind(code,user.college_id).first();if(!g)return json({error:'Ushbu texnikumda bunday kodli guruh topilmadi'},404);await db.prepare('INSERT OR IGNORE INTO study_members(group_id,account_id) VALUES(?,?)').bind(g.id,user.id).run();return json({ok:true})
 }
 if(!lesson(b.lessonId))return json({error:'Mavzu topilmadi'},404);
 if(path==='/api/quiz'){
  const questions=quiz(b.lessonId);if(!Array.isArray(b.answers)||b.answers.length!==10||b.answers.some((a:any)=>!Number.isInteger(a)||a<0||a>3))return json({error:'Barcha 10 savolga javob bering'},400);
  const correct=questions.reduce((s,q,i)=>s+Number(q.answer===b.answers[i]),0),percent=correct*10;
  await db.batch([db.prepare('INSERT INTO quiz_attempts(id,account_id,lesson_id,percent,answers,created_at) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),user.id,b.lessonId,percent,JSON.stringify(b.answers),Date.now()),db.prepare('INSERT INTO lesson_progress(account_id,lesson_id,viewed,completed,best,updated_at) VALUES(?,?,1,?,?,?) ON CONFLICT(account_id,lesson_id) DO UPDATE SET completed=max(completed,excluded.completed),best=max(best,excluded.best),updated_at=excluded.updated_at').bind(user.id,b.lessonId,percent>=60?1:0,percent,Date.now())]);return json({correct,total:10,percent,passed:percent>=60,review:questions.map((q,i)=>({question:q.question,answer:q.answer,explanation:q.options[q.answer],correct:q.answer===b.answers[i]}))})
 }
 if(path==='/api/progress'){
  await db.prepare('INSERT INTO lesson_progress(account_id,lesson_id,viewed,completed,best,updated_at) VALUES(?,?,1,0,0,?) ON CONFLICT(account_id,lesson_id) DO UPDATE SET viewed=1,updated_at=excluded.updated_at').bind(user.id,b.lessonId,Date.now()).run();return json({ok:true})
 }
 if(path==='/api/practice'){
  const body=String(b.body||'');if(body.length>6000)return json({error:'Javob 6000 belgidan oshmasin'},400);await db.prepare('INSERT INTO practice_submissions(account_id,lesson_id,body,updated_at) VALUES(?,?,?,?) ON CONFLICT(account_id,lesson_id) DO UPDATE SET body=excluded.body,updated_at=excluded.updated_at').bind(user.id,b.lessonId,body,Date.now()).run();return json({ok:true})
 }
 return json({error:'Manzil topilmadi'},404)
}
export default {async fetch(request:Request,env:any){const path=new URL(request.url).pathname;try{
 if(path.startsWith('/api/auth/')||path==='/api/catalog'){if(path==='/api/auth/login'||path==='/api/auth/register'){const blocked=await bootstrapAdministrator(request,env);if(blocked)return blocked;}return handleAuth(request,env.DB,{pepper:env.AUTH_PASSWORD_PEPPER});}
 if(path==='/auth/client.js')return content(clientJS,'text/javascript;charset=utf-8');
 if(path==='/auth/style.css')return content(styleCSS,'text/css;charset=utf-8');
 if(['/assets/texnikum-building-2026.jpg','/assets/umarova-zulfiya.png'].includes(path))return env.ASSETS.fetch(request);
 const user=await currentAccount(request,env.DB);
 if(path==='/login'||path==='/register')return user?Response.redirect(new URL('/',request.url),303):content(loginHTML);
 if(!user)return path.startsWith('/api/')?json({error:'Hisobga kiring'},401):Response.redirect(new URL('/login',request.url),303);
 if(path.startsWith('/api/admin/'))return handleAdmin(request,env,user);
 if(path==='/admin'||path==='/admin/setup')return content(adminHTML);
 if(path.startsWith('/api/'))return learning(request,env,user,path);
 if(path==='/account')return content(accountHTML);
 if(path==='/'||path==='/teacher')return content(courseHTML);
 if(!['GET','HEAD'].includes(request.method))return json({error:'Usul qo‘llanmaydi'},405);
 return env.ASSETS.fetch(request);
 }catch(e:any){return json({error:e?.status?e.message:'Xizmatda vaqtinchalik xato. Qayta urinib ko‘ring.'},e?.status||503)}}};
