import {Miniflare} from 'miniflare';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const mf=new Miniflare({modules:true,modulesRules:[{type:'ESModule',include:['**/*.js'],fallthrough:true}],scriptPath:'dist/server/index.js',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],bindings:{AUTH_PASSWORD_PEPPER:'local-test-only-pepper-not-production-2026',ADMIN_INITIAL_LOGIN:'local-admin',ADMIN_INITIAL_PASSWORD_SHA256:createHash('sha256').update('oshpaz-admin-initial:Local-Admin-Test-2026').digest('hex')},serviceBindings:{ASSETS:async()=>new Response('local-test-asset')}});
const base='https://local.example';
const req=(p,body,cookie,origin=base)=>mf.dispatchFetch(base+p,{method:body===undefined?'GET':'POST',redirect:'manual',headers:{...(body===undefined?{}:{'Content-Type':'application/json',Origin:origin}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
const data=JSON.parse(readFileSync('course/data.json'));
try{
 const db=await mf.getD1Database('DB');for(const file of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort()){const sql=readFileSync('drizzle/'+file,'utf8');for(const s of sql.split('--> statement-breakpoint'))if(s.trim())await db.prepare(s).run();}
 let r=await req('/');assert.equal(r.status,303);r=await req('/api/course');assert.equal(r.status,401);
 r=await req('/login');assert.equal(r.status,200);const html=await r.text();assert(html.includes('Umarova Zulfiya'));assert(html.includes('regionId'));
 const catalog=await (await req('/api/catalog')).json();const c=catalog.colleges.find(c=>c.name.includes('Namangan shahar 3-son'));assert(c);
 const input={regionId:c.regionId,districtId:c.districtId,collegeId:c.id,role:'student',groupName:'1-OSH',firstName:'Mahalliy',lastName:'Sinov',login:'local-student',password:'Test-only-password-2026'};
 r=await req('/api/auth/register',{...input,groupName:''});assert.equal(r.status,400);
 r=await req('/api/auth/register',input,undefined,'https://elsewhere.example');assert.equal(r.status,403);
 r=await req('/api/auth/register',input);assert.equal(r.status,201,await r.clone().text());const student=r.headers.get('set-cookie').split(';')[0];assert(r.headers.get('set-cookie').includes('HttpOnly'));
 r=await req('/api/auth/login',{login:input.login,password:'incorrect'});assert.equal(r.status,401);
 r=await req('/api/auth/login',{login:input.login,password:input.password});assert.equal(r.status,200);
 r=await req('/api/auth/register',{...input,login:'local-teacher',role:'teacher',groupName:'should-be-null'});assert.equal(r.status,201);const teacher=r.headers.get('set-cookie').split(';')[0];assert.equal((await r.json()).user.groupName,null);
 r=await req('/api/course',undefined,student);const mods=(await r.json()).modules;assert.equal(mods.length,6);assert.equal(mods.reduce((a,m)=>a+m.hours,0),336);assert.equal(mods.flatMap(m=>m.lessons).length,125);
 for(const m of mods){for(const key of ['hours','theory','practice','independent'])assert.equal(m.lessons.reduce((a,l)=>a+l[key],0),m[key]);for(const l of m.lessons){assert(l.explain.length>100);assert(l.task.length>40)}}
 r=await req('/api/progress',{lessonId:'m1-l1'},student);assert.equal(r.status,200);
 r=await req('/api/quiz?lesson=m1-l1',undefined,student);const q=await r.json();assert.equal(q.questions.length,10);assert(q.questions.every(q=>q.options.length===4&&!('answer'in q)));
 r=await req('/api/quiz',{lessonId:'m1-l1',answers:[0]},student);assert.equal(r.status,400);
 const answers=Array.from({length:10},(_,i)=>(4-((i+1)%4))%4);
 r=await req('/api/quiz',{lessonId:'m1-l1',answers,percent:0},student);assert.equal(r.status,200,await r.clone().text());const score=await r.json();assert.equal(score.percent,100);assert(score.passed);
 r=await req('/api/progress',undefined,student);assert((await r.json()).progress.some(x=>x.lesson_id==='m1-l1'&&x.best===100&&x.completed));
 r=await req('/api/practice',{lessonId:'m1-l1',body:'Local test only'},student);assert.equal(r.status,200);
 r=await req('/api/practice?lesson=m1-l1',undefined,teacher);assert.equal((await r.json()).submission,null);
 r=await req('/api/groups',{name:'Test local group'},student);assert.equal(r.status,403);
 r=await req('/api/groups',{name:'Test local group'},teacher);assert.equal(r.status,201);const group=await r.json();
 r=await req('/api/groups/join',{code:group.code},student);assert.equal(r.status,200);
 r=await req('/api/teacher/report?group='+group.id,undefined,student);assert.equal(r.status,403);
 r=await req('/api/teacher/report?group='+group.id,undefined,teacher);assert.equal(r.status,200);const report=await r.json();assert.equal(report.students.length,1);assert.equal(report.students[0].completed,1);
 r=await req('/api/auth/register',{...input,login:'local-other-teacher',role:'teacher'});const other=r.headers.get('set-cookie').split(';')[0];r=await req('/api/teacher/report?group='+group.id,undefined,other);assert.equal(r.status,404);
 r=await req('/api/auth/password',{currentPassword:input.password,password:'New-test-only-password-2026'},student);assert.equal(r.status,200,await r.clone().text());
 r=await req('/api/auth/me',undefined,student);assert.equal(r.status,401);

 r=await req('/api/admin/overview');assert.equal(r.status,401);
 r=await req('/api/admin/overview',undefined,teacher);assert.equal(r.status,403);
 r=await req('/api/admin/status',undefined,teacher);assert.equal((await r.json()).isAdmin,false);
 r=await req('/api/auth/register',{...input,login:'local-admin',role:'teacher'});assert.equal(r.status,409);
 r=await req('/api/auth/login',{login:'local-admin',password:'incorrect'});assert.equal(r.status,401);assert.equal((await db.prepare('SELECT count(*) n FROM administrators').first()).n,0);
 r=await req('/api/auth/login',{login:'LOCAL-ADMIN',password:'Local-Admin-Test-2026'});assert.equal(r.status,200,await r.clone().text());const adminSession=r.headers.get('set-cookie').split(';')[0];
 r=await req('/api/admin/status',undefined,adminSession);assert.equal((await r.json()).isAdmin,true);
 r=await req('/admin',undefined,adminSession);assert.equal(r.status,200);assert((await r.text()).includes('admin-content'));
 r=await req('/api/admin/overview',undefined,adminSession);assert.equal(r.status,200,await r.clone().text());const overview=await r.json();assert.equal(overview.summary.students,1);assert.equal(overview.summary.attempts,1);assert.equal(overview.modules.length,6);
 r=await req('/api/admin/users?role=student&group=1-osh',undefined,adminSession);assert.equal(r.status,200,await r.clone().text());const filtered=await r.json();assert.equal(filtered.total,1);assert.equal(filtered.rows[0].login,'local-student');assert(!JSON.stringify(filtered).includes('password_hash'));assert(!JSON.stringify(filtered).includes('salt'));
 r=await req('/api/admin/users?q=%25',undefined,adminSession);assert.equal((await r.json()).total,0);
 r=await req('/api/admin/users?q='+encodeURIComponent("' OR 1=1 --"),undefined,adminSession);assert.equal((await r.json()).total,0);
 r=await req('/api/admin/attempts?module=1',undefined,adminSession);assert.equal(r.status,200,await r.clone().text());const attempts=await r.json();assert.equal(attempts.total,1);assert.equal(attempts.rows[0].percent,100);assert.equal(attempts.rows[0].module_id,1);assert(attempts.rows[0].lesson_title.length>10);
 r=await req('/api/admin/attempts?from=2099-01-01',undefined,adminSession);assert.equal((await r.json()).total,0);
 r=await req('/api/admin/groups',undefined,adminSession);assert.equal(r.status,200,await r.clone().text());const groups=await r.json();assert.equal(groups.total,1);assert.equal(groups.rows[0].students,1);
 r=await req('/api/admin/users/'+filtered.rows[0].id,undefined,adminSession);assert.equal(r.status,200);const details=await r.json();assert.equal(details.progress.length,1);assert.equal(details.practice[0].body,'Local test only');assert(!JSON.stringify(details).includes('password_hash'));
 r=await req('/api/admin/users',{role:'admin'},teacher);assert.equal(r.status,403);
 r=await req('/api/admin/users',{role:'admin'},adminSession);assert.equal(r.status,405);
 // Pagination fixtures are synthetic and live only in the disposable test D1.
 const baseRow=await db.prepare('SELECT * FROM accounts WHERE login=?').bind('local-student').first();
 await db.batch(Array.from({length:55},(_,i)=>db.prepare('INSERT INTO accounts(id,login,first_name,last_name,role,region_id,district_id,college_id,group_name,group_key,password_hash,salt,iterations,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind('page-'+i,'local-page-'+i,'Page','Fixture '+i,'student',baseRow.region_id,baseRow.district_id,baseRow.college_id,'1-OSH','1OSH','unused-test-only','',12,Date.now())));
 r=await req('/api/admin/users?role=student&page=1',undefined,adminSession);const p1=await r.json();assert.equal(p1.rows.length,50);assert.equal(p1.total,56);
 r=await req('/api/admin/users?role=student&page=2',undefined,adminSession);assert.equal((await r.json()).rows.length,6);
 r=await req('/api/admin/status',undefined,other);assert.equal((await r.json()).isAdmin,false);
 console.log('PASS: reserved admin login; first-login provisioning; teacher/student denied; private fields omitted; filters, SQL metacharacters, date ranges, groups, user details, practice and pagination; all reporting endpoints read-only.');
 console.log('PASS: 125 topic totals; registration validation; login; protected routes; server quiz grading; progress; private practice; group membership; teacher ownership; password change and session revocation.');
}finally{await mf.dispose()}
