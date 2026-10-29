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
 let ready=false;for(let i=0;i<200;i++){try{const r=await request('/api/catalog');if(r.ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,150));}if(!ready)throw Error('Runtime not ready: '+logs);await new Promise(r=>setTimeout(r,1200));
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
 r=await request('/api/admin/options',undefined,adminCookie);assert.equal((await r.json()).lessons.length,405);
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
 r=await request('/api/auth/register',{...input,login:input.login+'-t',role:'teacher',groupName:'FORGED'});assert.equal(r.status,201);const teacher=await r.json();assert.equal(teacher.user.groupName,null);assert.equal(teacher.user.role,'teacher');
 r=await request('/api/auth/register',{...input,login:input.login+'-a',role:'admin'});assert.equal(r.status,400);
 console.log('Admin pages/API, report filtering, server scoring and admission panel passed. Real Worker+D1 HTTP: registration chain, required student group, teacher null group, validation, CSRF, password login, duplicate login, session/logout, protected course/documents/WASM passed.');
}finally{child.kill('SIGTERM');setTimeout(()=>child.kill('SIGKILL'),1500).unref();}
