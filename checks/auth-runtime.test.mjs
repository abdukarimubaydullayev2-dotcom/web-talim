import {createHash} from 'node:crypto';
import assessments from '../analytics/assessments.json' with {type:'json'};
import {spawn,spawnSync} from 'node:child_process';import assert from 'node:assert/strict';import {readFileSync,rmSync,readdirSync} from 'node:fs';
const cli=['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js'];const config=['--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/auth-tests'];
rmSync('.wrangler/auth-tests',{recursive:true,force:true});
for(const migration of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort()){
 const migrate=spawnSync(process.execPath,[...cli,'d1','execute','DB',...config,'--file','drizzle/'+migration],{encoding:'utf8'});if(migrate.status!==0)throw new Error(migrate.stderr+'\n'+migrate.stdout);
}
// Local fixture only: stable owner identity, not a production account or password.
const adminId='00000000-0000-4000-8000-000000000001',adminToken='f'.repeat(64),adminCookie='__Host-web-talim-session='+adminToken;
const tokenHash=createHash('sha256').update(adminToken).digest('hex');
const seedSQL=`INSERT INTO accounts(id,login,first_name,last_name,role,region_id,district_id,college_id,password_hash,salt,iterations,created_at) VALUES('${adminId}','local-admin','Local','Admin','teacher','r7','d1','t281','unused-local-fixture','',12,${Date.now()}); INSERT INTO auth_sessions VALUES('${tokenHash}','${adminId}',${Date.now()+3600000});`;
const seeded=spawnSync(process.execPath,[...cli,'d1','execute','DB',...config,'--command',seedSQL],{encoding:'utf8'});if(seeded.status!==0)throw Error(seeded.stderr);
const child=spawn(process.execPath,[...cli,'dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/auth-tests','--ip','127.0.0.1','--inspector-port','0','--port','8789','--var','AUTH_PASSWORD_PEPPER:local-test-pepper-not-for-production-7394','--var','ADMIN_ACCOUNT_IDS:'+adminId],{stdio:['ignore','pipe','pipe']});let logs='';child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);
const base='http://127.0.0.1:8789';const request=(path,body,cookie,origin=base)=>fetch(base+path,{redirect:'manual',method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json',Origin:origin}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
try{
 let ready=false;for(let i=0;i<200;i++){try{const r=await request('/api/catalog');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}if(!ready)throw Error('Runtime not ready: '+logs);for(let warm=0;warm<3;warm++){await new Promise(r=>setTimeout(r,700));const probe=await request('/api/auth/me');if(probe.status!==401)throw Error('Runtime warmup failed');}
 let r=await request('/');assert.equal(r.status,303);assert(r.headers.get('location').endsWith('/login'));
 r=await request('/materials/m8-001-konspekt.docx');assert.equal(r.status,303);
 r=await request('/api/auth/me');assert.equal(r.status,401);
 const cat=await (await request('/api/catalog')).json();assert.equal(cat.regions.length,14);assert(cat.colleges.length>600);const c=cat.colleges.find(x=>x.name==='Namangan shahar 3-son texnikumi');
 const input={regionId:c.regionId,districtId:c.districtId,collegeId:c.id,role:'student',groupName:'3-IT',firstName:'Sinov',lastName:'O‘quvchi',login:'test-'+Date.now(),password:'Test-Password-7394!'};
 r=await request('/api/auth/register',{...input,groupName:''});assert.equal(r.status,400);
 r=await request('/api/auth/register',{...input,districtId:'wrong'});assert.equal(r.status,400);
 r=await request('/api/auth/register',input,undefined,'https://other.example');assert.equal(r.status,403);
 r=await request('/api/auth/register',input);const body=await r.json();assert.equal(r.status,201,JSON.stringify(body)+'\n'+logs);assert.equal(body.user.groupName,'3-IT');assert.equal(body.user.role,'student');assert(!JSON.stringify(body).includes('password'));
 const cookie=r.headers.get('set-cookie');assert(cookie.includes('HttpOnly')&&cookie.includes('Secure')&&cookie.includes('SameSite=Lax'));const session=cookie.split(';')[0];
 r=await request('/',undefined,session);assert.equal(r.status,200);const html=await r.text();assert(html.includes('installIntegrationModule'));assert(html.includes('Hisobim'));assert(html.includes(body.user.id));
 r=await request('/materials/m8-001-konspekt.docx',undefined,session);assert.equal(r.status,200);assert((await r.arrayBuffer()).byteLength>1000);
 r=await request('/vendor/sqljs/sql-wasm.wasm',undefined,session);assert.equal(r.status,200);
 r=await request('/api/auth/me',undefined,session);assert.equal((await r.json()).user.login,input.login);
 r=await request('/api/admin/overview',undefined,session);assert.equal(r.status,403);
 r=await request('/admin',undefined,session);assert.equal(r.status,403);
 r=await request('/admin',undefined,adminCookie);assert.equal(r.status,200);assert((await r.text()).includes('Faollik va natijalar'));
 r=await request('/api/admin/overview',undefined,adminCookie);assert.equal(r.status,200);assert.equal((await r.json()).summary.registered,2);
 r=await request('/api/admin/options',undefined,adminCookie);assert.equal((await r.json()).lessons.length,465);
 const quiz=assessments['8:1'];
 r=await request('/api/activity/event',{clientId:crypto.randomUUID(),kind:'lesson_open',moduleId:8,lessonId:1},session);assert.equal(r.status,200);
 r=await request('/api/activity/test',{clientId:crypto.randomUUID(),moduleId:8,lessonId:1,version:quiz.version,answers:quiz.correct,percent:0},session);assert.equal(r.status,201);assert.equal((await r.json()).result.percent,100);
 r=await request('/api/admin/report?section=attempts&collegeId='+c.id+'&group=3-it',undefined,adminCookie);const report=await r.json();assert.equal(r.status,200,JSON.stringify(report));assert.equal(report.total,1);assert.equal(report.rows[0].percent,100);
 r=await request('/api/admin/report?section=groups',undefined,adminCookie);assert.equal(r.status,200);assert.equal((await r.json()).rows[0].tested_students,1);
 r=await request('/login');assert((await r.text()).includes('Zargarlik'));
 r=await request('/api/auth/register',input);assert.equal(r.status,409);
 r=await request('/api/auth/login',{login:input.login,password:'wrong'});assert.equal(r.status,401);
 r=await request('/api/auth/login',{login:input.login.toUpperCase(),password:input.password});assert.equal(r.status,200);const loginCookie=r.headers.get('set-cookie').split(';')[0];
 r=await request('/api/auth/logout',{},loginCookie);assert.equal(r.status,200);assert(r.headers.get('set-cookie').includes('Max-Age=0'));
 r=await request('/api/auth/me',undefined,loginCookie);assert.equal(r.status,401);
 r=await request('/api/auth/register',{...input,login:input.login+'-t',role:'teacher',groupName:'FORGED'});assert.equal(r.status,201);const teacherSession=r.headers.get('set-cookie').split(';')[0],teacher=await r.json();assert.equal(teacher.user.groupName,null);assert.equal(teacher.user.role,'teacher');
 r=await request('/teacher',undefined,teacherSession);assert.equal(r.status,200);assert((await r.text()).includes('Excel namuna'));
 r=await request('/teacher',undefined,session);assert.equal(r.status,403);
 for(const asset of ['/teacher/client.js','/teacher-files.js','/vendor/teacher/exceljs.min.js','/vendor/teacher/pdf-lib.min.js','/vendor/teacher/fontkit.umd.min.js','/vendor/teacher/DejaVuSans.ttf']){r=await request(asset,undefined,teacherSession);assert.equal(r.status,200,asset);assert((await r.arrayBuffer()).byteLength>100);}
 r=await request('/api/teacher/groups',{name:'3-IT'},teacherSession);assert.equal(r.status,201);const group=(await r.json()).group;
 r=await request('/api/teacher/groups/'+group.id+'/imports',{clientId:crypto.randomUUID(),rows:[{firstName:'O‘ktam',lastName:'G‘aniyev'},{firstName:'Malika',lastName:'Sodiqova'}]},teacherSession);assert.equal(r.status,201,await r.clone().text());const job=(await r.json()).importId;
 for(let i=0;i<3;i++){r=await request('/api/teacher/groups/'+group.id+'/imports/'+job+'/next',{},teacherSession);assert.equal(r.status,200,await r.clone().text());}assert.equal((await r.json()).completed,2);
 r=await request('/api/teacher/groups/'+group.id+'/credentials',{},teacherSession);assert.equal(r.status,200);const creds=await r.json();assert.equal(creds.students.length,2);assert.notEqual(creds.students[0].password,creds.students[1].password);
 r=await request('/api/auth/login',{login:creds.students[0].login,password:creds.students[0].password});assert.equal(r.status,200);const provisionedCookie=r.headers.get('set-cookie').split(';')[0];
 r=await request('/api/auth/password',{currentPassword:creds.students[0].password,password:'New-Student-Password-7394!'},provisionedCookie);assert.equal(r.status,200,await r.clone().text());
 const examStudentCookie=r.headers.get('set-cookie').split(';')[0];
 r=await request('/api/teacher/groups/'+group.id+'/credentials',{},teacherSession);assert.equal((await r.json()).students[0].password,null);
 const examBank=Array.from({length:300},(_,i)=>({question:'Savol '+(i+1),options:['A '+i,'B '+i,'C '+i,'D '+i],correct:i%4}));
 r=await request('/api/exams/teacher/create',{clientId:crypto.randomUUID(),groupId:group.id,title:'Oraliq nazorat',questionCount:25,questions:examBank},teacherSession);assert.equal(r.status,201,await r.clone().text());const exam=(await r.json()).exam;
 r=await request('/controls',undefined,examStudentCookie);assert.equal(r.status,200);assert((await r.text()).includes('Oraliq nazoratlar'));
 for(const asset of ['/controls.css','/controls-base.css','/controls/client.js','/exam-import.js','/exam-teacher.js','/vendor/teacher/jszip.min.js']){r=await request(asset,undefined,examStudentCookie);assert.equal(r.status,200,asset);}
 r=await request('/api/exams/student/list',undefined,session);assert.equal((await r.json()).exams.length,0);
 r=await request('/api/exams/student/list',undefined,examStudentCookie);assert.equal((await r.json()).exams.length,1);
 r=await request('/api/exams/student/'+exam.id+'/start',{},examStudentCookie);assert.equal(r.status,201,await r.clone().text());const examPaper=(await r.json()).attempt;assert.equal(examPaper.questions.length,25);
 const answers=examPaper.questions.map(q=>{const i=Number(q.question.slice(6))-1;return q.options.indexOf(String.fromCharCode(65+i%4)+' '+i);});
 r=await request('/api/exams/student/'+exam.id+'/save',{answers,revision:0},examStudentCookie);assert.equal(r.status,200,await r.clone().text());
 r=await request('/api/exams/student/'+exam.id+'/start',{},examStudentCookie);assert.equal(r.status,200);assert.deepEqual((await r.json()).attempt.questions,examPaper.questions);
 r=await request('/api/exams/student/'+exam.id+'/submit',{answers,revision:1,percent:0},examStudentCookie);assert.equal(r.status,200,await r.clone().text());assert.equal((await r.json()).attempt.result.percent,100);
 r=await request('/api/exams/teacher/'+exam.id+'/results',undefined,teacherSession);assert.equal(r.status,200);assert.equal((await r.json()).students.find(x=>x.login===creds.students[0].login).percent,100);
 r=await request('/api/exams/student/'+exam.id+'/submit',{answers:Array(25).fill(null),revision:0},examStudentCookie);assert.equal((await r.json()).attempt.result.percent,100);
 console.log('Real Worker+D1 group exams: 300-question bank, 25-question paper, membership isolation, student assets, stable resume, autosave, server grading and teacher results passed.');
 r=await request('/teacher/resources',undefined,teacherSession);assert.equal(r.status,200);assert((await r.text()).includes('Mening resurslarim'));r=await request('/teacher/resources',undefined,examStudentCookie);assert.equal(r.status,403);
 const resourceInput={clientId:crypto.randomUUID(),title:'Shaxsiy mustaqil ish',description:'Faqat o‘zimga',moduleId:5,lessonId:2,kind:'assignment',source:'link',url:'https://example.org/my-material'};
 r=await request('/api/resources',resourceInput,teacherSession);assert.equal(r.status,201,await r.clone().text());const linkResource=(await r.json()).resource;
 r=await request('/api/resources?moduleId=5&lessonId=2&ready=1',undefined,teacherSession);assert.equal((await r.json()).resources.length,1);
 r=await request('/api/resources',undefined,examStudentCookie);assert.equal(r.status,403);r=await request('/api/resources/'+linkResource.id+'/update',{...resourceInput,title:'Yangilangan',moduleId:6,lessonId:1},adminCookie);assert.equal(r.status,404);
 const fileBytes=new TextEncoder().encode('O‘qituvchining shaxsiy fayli — Web Ta’lim');r=await request('/api/resources',{...resourceInput,clientId:crypto.randomUUID(),source:'file',fileName:'mustaqil-ish.txt',byteSize:fileBytes.length},teacherSession);assert.equal(r.status,201);const fileResource=(await r.json()).resource;
 r=await fetch(base+'/api/resources/'+fileResource.id+'/upload',{method:'POST',headers:{Cookie:teacherSession,Origin:base,'Content-Type':'application/octet-stream','Content-Length':String(fileBytes.length)},body:fileBytes});assert.equal(r.status,200,await r.clone().text());assert.equal((await r.json()).resource.status,'ready');
 r=await request('/api/resources/'+fileResource.id+'/file',undefined,teacherSession);assert.equal(r.status,200);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),fileBytes);assert(r.headers.get('content-disposition').startsWith('attachment;'));
 r=await fetch(base+'/api/resources/'+fileResource.id+'/file',{headers:{Cookie:teacherSession,Range:'bytes=2-6'}});assert.equal(r.status,206,await r.clone().text());assert.equal(r.headers.get('content-range'),'bytes 2-6/'+fileBytes.length);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),fileBytes.slice(2,7));
 r=await request('/admin/resources',undefined,adminCookie);assert.equal(r.status,200);assert((await r.text()).includes('Barcha o‘qituvchilar resurslari'));
 r=await request('/admin/resources',undefined,teacherSession);assert.equal(r.status,403);
 r=await request('/api/admin/resources?teacher='+encodeURIComponent(teacher.user.login)+'&moduleId=5&lessonId=2&kind=assignment',undefined,adminCookie);assert.equal(r.status,200,await r.clone().text());const resourceReport=await r.json();assert.equal(resourceReport.total,2);assert(resourceReport.resources.every(x=>x.teacher.id===teacher.user.id));
 r=await request('/api/admin/resources',undefined,teacherSession);assert.equal(r.status,403);
 r=await request('/api/admin/resources/'+fileResource.id+'/file',undefined,adminCookie);assert.equal(r.status,200,await r.clone().text());assert.deepEqual(new Uint8Array(await r.arrayBuffer()),fileBytes);
 r=await fetch(base+'/api/admin/resources/'+fileResource.id+'/file',{headers:{Cookie:adminCookie,Range:'bytes=2-6'}});assert.equal(r.status,206);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),fileBytes.slice(2,7));
 console.log('Real Worker+D1+R2 admin teacher-resource report: admin-only page, teacher/module/topic filters, cross-owner download and Range passed.');
 r=await request('/api/resources/'+fileResource.id+'/file',undefined,adminCookie);assert.equal(r.status,404);r=await request('/api/resources/'+fileResource.id+'/file',undefined,examStudentCookie);assert.equal(r.status,403);
 r=await request('/',undefined,teacherSession);assert((await r.text()).includes('/personal-resources.js'));r=await request('/',undefined,examStudentCookie);assert(!(await r.text()).includes('/personal-resources.js'));
 r=await request('/api/resources/'+fileResource.id+'/delete',{},teacherSession);assert.equal(r.status,200);r=await request('/api/resources/'+fileResource.id+'/file',undefined,teacherSession);assert.equal(r.status,404);
 console.log('Real Worker+D1+R2 private resources: metadata, raw stream upload, byte-for-byte download, Range seek, own-teacher-only file access, lesson filters, course hook injection and deletion passed.');
 // Separate Informatics subject uses stable namespace 9; old Web IDs retain their meaning.
 r=await request('/informatics-data.js',undefined,examStudentCookie);assert.equal(r.status,200);assert((await r.text()).includes('const informaticsData='));
 const info=assessments['9:60'];assert.equal(info.correct.length,10);
 r=await request('/api/activity/test',{clientId:crypto.randomUUID(),moduleId:9,lessonId:60,version:info.version,answers:info.correct},examStudentCookie);assert.equal(r.status,201,await r.clone().text());assert.equal((await r.json()).result.percent,100);
 r=await request('/api/admin/report?section=attempts&moduleId=9&lessonId=60',undefined,adminCookie);assert.equal(r.status,200);const infoReport=await r.json();assert(infoReport.rows.some(x=>x.module_id===9&&x.percent===100));
 r=await request('/api/resources',{clientId:crypto.randomUUID(),moduleId:9,lessonId:60,kind:'presentation',source:'link',title:'Informatika funksiyalar',description:'Sinov',url:'https://example.org/functions'},teacherSession);assert.equal(r.status,201,await r.clone().text());const infoResource=(await r.json()).resource;
 r=await request('/api/resources?moduleId=9&lessonId=60',undefined,teacherSession);assert.equal(r.status,200);assert((await r.json()).resources.some(x=>x.id===infoResource.id));
 r=await request('/api/admin/resources?moduleId=9&lessonId=60',undefined,adminCookie);assert.equal(r.status,200);assert((await r.json()).resources.some(x=>x.id===infoResource.id));
 console.log('Informatics real HTTP: protected content asset, server scoring 100%, admin result subject filter, teacher topic binding, admin cross-teacher resource filter passed.');
 // Full new learning workflow against real Worker/D1/R2.
 const learn=async(path,data,cookie=teacherSession,status=200)=>{const response=await request('/api/learning'+path,data,cookie);assert.equal(response.status,status,await response.clone().text()+' '+path);return response.json();};
 for(const page of ['/teacher/courses','/teacher/insights','/teacher/assignments']){r=await request(page,undefined,teacherSession);assert.equal(r.status,200);assert((await r.text()).includes('learning-app'));r=await request(page,undefined,examStudentCookie);assert.equal(r.status,403);}
 r=await request('/learn',undefined,examStudentCookie);assert.equal(r.status,200);for(const asset of ['/learning-client.js','/learning-style.css','/learning-entry.js']){r=await request(asset,undefined,examStudentCookie);assert.equal(r.status,200);assert((await r.arrayBuffer()).byteLength>100);}
 const lc=await learn('/courses',{title:'Runtime Informatika',description:'Mahalliy sinov'},teacherSession,201);
 r=await request('/api/learning/courses/'+lc.id,undefined,examStudentCookie);assert.equal(r.status,404);
 const lh=await learn('/courses/'+lc.id+'/chapters',{title:'Hisoblash'},teacherSession,201),ll=await learn('/chapters/'+lh.id+'/lessons',{title:'Ikki son yig‘indisi',kind:'amaliy'},teacherSession,201);
 await learn('/lessons/'+ll.id+'/update',{revision:1,title:'Ikki son yig‘indisi',kind:'amaliy',conspect:'Ikki sonning yig‘indisini hisoblash uchun ularni qo‘shamiz. Natijani kichik misolda tekshiramiz.',slides:[{title:'Misol',body:'2+3=5'}],qa:[{q:'2+3 nechchi?',a:'5'}],quiz:[{q:'2+3 nechchi?',options:['3','4','5','6'],correct:2,explanation:'2+3=5'}],published:true,videoUrl:''});
 await learn('/courses/'+lc.id+'/share',{revision:1,groupIds:[group.id]});const studentLesson=await learn('/lessons/'+ll.id,undefined,examStudentCookie);assert(!('correct' in studentLesson.lesson.quiz[0]));
 await learn('/lessons/'+ll.id+'/open',{},examStudentCookie);const lscore=await learn('/lessons/'+ll.id+'/test',{clientId:crypto.randomUUID(),version:studentLesson.lesson.version,answers:[2]},examStudentCookie,201);assert.equal(lscore.result.percent,100);
 const ltask=await learn('/tasks',{groupId:group.id,lessonId:ll.id,title:'Yechim yuboring',instructions:'2+3 ifodasini hisoblab matn va faylni biriktiring.'},teacherSession,201);let lsub=(await learn('/tasks/'+ltask.id+'/draft',{},examStudentCookie)).submission;
 const lfile=(await learn('/files',{submissionId:lsub.id,fileName:'answer.js',byteSize:fileBytes.length},examStudentCookie,201)).file;
 r=await fetch(base+'/api/learning/files/'+lfile.id+'/upload',{method:'POST',headers:{Cookie:examStudentCookie,Origin:base,'Content-Type':'application/octet-stream','Content-Length':String(fileBytes.length)},body:fileBytes});assert.equal(r.status,200,await r.clone().text());lsub=(await learn('/submissions/'+lsub.id,undefined,examStudentCookie)).submission;
 await learn('/submissions/'+lsub.id+'/submit',{revision:lsub.revision,text:'Yig‘indi 5 ga teng.'},examStudentCookie);lsub=(await learn('/submissions/'+lsub.id)).submission;await learn('/submissions/'+lsub.id+'/review',{revision:lsub.revision,grade:95,feedback:'Yechim to‘g‘ri, izohni kengaytiring.'});
 r=await request('/api/learning/files/'+lfile.id+'/file',undefined,teacherSession);assert.equal(r.status,200);assert.deepEqual(new Uint8Array(await r.arrayBuffer()),fileBytes);
 const lm=await learn('/insights?groupId='+group.id+'&courseId='+lc.id);assert(lm.students.some(x=>x.cells[0]?.last_percent===100));const ld=await learn('/my',undefined,examStudentCookie);assert.equal(ld.resume.href,'/learn?lessonId='+ll.id);assert(ld.tasks.some(x=>x.grade===95));
 await learn('/courses/'+lc.id+'/share',{revision:2,groupIds:[]});r=await request('/api/learning/files/'+lfile.id+'/file',undefined,examStudentCookie);assert.equal(r.status,404);
 console.log('Real Worker learning suite: all pages/roles, private course creation/publication/share/revocation, correct-key redaction, server test score, streamed student file, final submission, teacher grade, matrix, dashboard and protected download passed.');
 r=await request('/api/auth/register',{...input,login:input.login+'-a',role:'admin'});assert.equal(r.status,400);
 console.log('Admin pages/API, report filtering, server scoring and admission panel passed. Real Worker+D1 HTTP: registration chain, required student group, teacher null group, validation, CSRF, password login, duplicate login, session/logout, protected course/documents/WASM passed.');
}finally{child.kill('SIGTERM');setTimeout(()=>child.kill('SIGKILL'),1500).unref();}
