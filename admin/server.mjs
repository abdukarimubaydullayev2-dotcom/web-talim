import catalog from '../auth/catalog.json' with {type:'json'};
import modules from '../course/data.json' with {type:'json'};
const lessons=modules.flatMap(m=>m.lessons.map(l=>({...l,moduleId:m.id,moduleTitle:m.title})));
const publicFields='a.id,a.login,a.first_name,a.last_name,a.role,a.region_id,a.district_id,a.college_id,a.group_name,a.created_at';
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
export async function isAdministrator(db,user){return !!user&&!!await db.prepare('SELECT account_id FROM administrators WHERE account_id=?').bind(user.id).first()}
function decorate(row){return {...row,region:catalog.regions.find(x=>x.id===row.region_id)?.name||'',district:catalog.districts.find(x=>x.id===row.district_id)?.name||'',college:catalog.colleges.find(x=>x.id===row.college_id)?.name||''}}
function whereUsers(p){const clauses=['1=1'],bind=[];const add=(s,v)=>{clauses.push(s);bind.push(v)};const q=(p.get('q')||'').slice(0,80).trim();if(q){const value='%'+q.replace(/[\\%_]/g,'\\$&')+'%';add("(a.login||' '||a.first_name||' '||a.last_name) LIKE ? ESCAPE '\\'",value)}
 const role=p.get('role');if(role&&['student','teacher'].includes(role))add('a.role=?',role);
 for(const [key,col] of [['region','region_id'],['district','district_id'],['college','college_id']])if(p.get(key))add('a.'+col+'=?',p.get(key).slice(0,100));
 if(p.get('group'))add('a.group_key=?',p.get('group').normalize('NFKC').trim().toLocaleUpperCase('uz').replace(/[\s_\-‐‑–—−]/g,'').slice(0,40));
 return {sql:clauses.join(' AND '),bind}}
function paging(p){const page=Math.max(1,Math.min(10000,Number(p.get('page'))||1));return {page:Math.floor(page),size:50,offset:(Math.floor(page)-1)*50}}
export async function handleAdmin(request,env,user){const url=new URL(request.url),path=url.pathname,db=env.DB;const admin=await isAdministrator(db,user);
 if(path==='/api/admin/status'&&request.method==='GET')return json({isAdmin:admin});
 if(!admin)return json({error:'Bu bo‘lim faqat administrator uchun.'},403);
 if(request.method!=='GET')return json({error:'Bu hisobot faqat o‘qish uchun.'},405);
 const {sql,bind}=whereUsers(url.searchParams),pg=paging(url.searchParams);const rows=async(q,values=[])=>{const r=await db.prepare(q).bind(...values).all();return r.results};
 if(path==='/api/admin/overview'){
  const users=await db.prepare(`SELECT count(*) users,coalesce(sum(a.role='student'),0) students,coalesce(sum(a.role='teacher'),0) teachers FROM accounts a WHERE ${sql}`).bind(...bind).first();
  const learning=await db.prepare(`SELECT count(*) opened,coalesce(sum(p.completed),0) completed FROM lesson_progress p JOIN accounts a ON a.id=p.account_id WHERE ${sql}`).bind(...bind).first();
  const tests=await db.prepare(`SELECT count(*) attempts,round(avg(q.percent),1) average,coalesce(sum(q.percent>=60),0) passed FROM quiz_attempts q JOIN accounts a ON a.id=q.account_id WHERE ${sql}`).bind(...bind).first();
  const groups=await db.prepare(`SELECT count(*) groups FROM study_groups g JOIN accounts a ON a.id=g.owner_id WHERE ${sql}`).bind(...bind).first();
  const perModule=await rows(`SELECT substr(p.lesson_id,1,instr(p.lesson_id,'-')-1) module_key,count(*) opened,sum(p.completed) completed FROM lesson_progress p JOIN accounts a ON a.id=p.account_id WHERE ${sql} GROUP BY module_key`,bind);
  return json({summary:{...users,...learning,...tests,...groups},modules:modules.map(m=>({...{id:m.id,title:m.title,hours:m.hours,topics:m.lessons.length},...(perModule.find(p=>p.module_key==='m'+m.id)||{opened:0,completed:0})}))})
 }
 if(path==='/api/admin/users'){
  const total=await db.prepare(`SELECT count(*) total FROM accounts a WHERE ${sql}`).bind(...bind).first();const list=await rows(`SELECT ${publicFields},(SELECT count(*) FROM lesson_progress p WHERE p.account_id=a.id) opened,(SELECT coalesce(sum(completed),0) FROM lesson_progress p WHERE p.account_id=a.id) completed,(SELECT count(*) FROM quiz_attempts q WHERE q.account_id=a.id) attempts,(SELECT round(avg(percent),1) FROM quiz_attempts q WHERE q.account_id=a.id) average,(SELECT max(created_at) FROM login_events e WHERE e.account_id=a.id) last_login,exists(SELECT 1 FROM administrators ad WHERE ad.account_id=a.id) is_admin FROM accounts a WHERE ${sql} ORDER BY a.created_at DESC,a.id LIMIT ? OFFSET ?`,[...bind,pg.size,pg.offset]);return json({rows:list.map(decorate),total:total.total,page:pg.page,pageSize:pg.size})
 }
 if(path==='/api/admin/attempts'){
  const conditions=[sql],values=[...bind],p=url.searchParams;
  const id=p.get('lesson');if(id&&lessons.some(l=>l.id===id)){conditions.push('q.lesson_id=?');values.push(id)}else if(/^[1-6]$/.test(p.get('module')||'')){conditions.push('q.lesson_id LIKE ?');values.push('m'+p.get('module')+'-%')}
  for(const [key,op,end] of [['from','>=',false],['to','<',true]])if(/^\d{4}-\d{2}-\d{2}$/.test(p.get(key)||'')){const time=Date.parse(p.get(key)+'T00:00:00+05:00');if(Number.isFinite(time)){conditions.push('q.created_at'+op+'?');values.push(time+(end?86400000:0))}}
  const clause=conditions.join(' AND ');const totals=await db.prepare(`SELECT count(*) total,round(avg(q.percent),1) average,coalesce(sum(q.percent>=60),0) passed FROM quiz_attempts q JOIN accounts a ON a.id=q.account_id WHERE ${clause}`).bind(...values).first();const list=await rows(`SELECT q.id,q.lesson_id,q.percent,q.created_at,${publicFields.replace('a.id,','').replace(',a.created_at','')} ,a.id account_id FROM quiz_attempts q JOIN accounts a ON a.id=q.account_id WHERE ${clause} ORDER BY q.created_at DESC,q.id LIMIT ? OFFSET ?`,[...values,pg.size,pg.offset]);return json({...totals,rows:list.map(r=>{const l=lessons.find(l=>l.id===r.lesson_id);return {...decorate(r),lesson_title:l?.title||r.lesson_id,module_id:l?.moduleId}}),page:pg.page,pageSize:pg.size})
 }
 if(path==='/api/admin/groups'){
  const total=await db.prepare(`SELECT count(*) total FROM study_groups g JOIN accounts a ON a.id=g.owner_id WHERE ${sql}`).bind(...bind).first();const list=await rows(`SELECT g.id,g.name,g.created_at,${publicFields.replace('a.id,','').replace(',a.created_at','')},a.id owner_id,(SELECT count(*) FROM study_members sm WHERE sm.group_id=g.id) students,(SELECT count(*) FROM lesson_progress p JOIN study_members sm ON sm.account_id=p.account_id WHERE sm.group_id=g.id AND p.completed=1) completed FROM study_groups g JOIN accounts a ON a.id=g.owner_id WHERE ${sql} ORDER BY g.created_at DESC,g.id LIMIT ? OFFSET ?`,[...bind,pg.size,pg.offset]);return json({rows:list.map(decorate),total:total.total,page:pg.page,pageSize:pg.size})
 }
 if(path.startsWith('/api/admin/users/')){
  const id=decodeURIComponent(path.slice('/api/admin/users/'.length));const account=await db.prepare(`SELECT ${publicFields} FROM accounts a WHERE a.id=?`).bind(id).first();if(!account)return json({error:'Hisob topilmadi'},404);
  const progress=await rows('SELECT lesson_id,viewed,completed,best,updated_at FROM lesson_progress WHERE account_id=? ORDER BY updated_at DESC',[id]);const attempts=await rows('SELECT id,lesson_id,percent,created_at FROM quiz_attempts WHERE account_id=? ORDER BY created_at DESC LIMIT 100',[id]);const practice=await rows('SELECT lesson_id,body,updated_at FROM practice_submissions WHERE account_id=? ORDER BY updated_at DESC',[id]);const lessonInfo=r=>{const l=lessons.find(x=>x.id===r.lesson_id);return {...r,lesson_title:l?.title||r.lesson_id,module_id:l?.moduleId}};
  return json({user:decorate(account),progress:progress.map(lessonInfo),attempts:attempts.map(lessonInfo),practice:practice.map(lessonInfo),attemptsLimitedTo:100})
 }
 return json({error:'Hisobot topilmadi'},404)
}
