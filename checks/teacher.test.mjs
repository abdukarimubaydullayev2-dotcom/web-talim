import {DatabaseSync} from 'node:sqlite';import {readdirSync,readFileSync} from 'node:fs';import assert from 'node:assert/strict';
import {handleTeacher,makeLogin,makePassword,seal,unseal,validateRoster} from '../teacher/server.mjs';import {digest,handleAuth,verifyPassword} from '../auth/service.mjs';import {gateway} from '../auth/gateway.mjs';import catalog from '../auth/catalog.json' with {type:'json'};
const sqlite=new DatabaseSync(':memory:');sqlite.exec('PRAGMA foreign_keys=ON;');for(const file of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())sqlite.exec(readFileSync('drizzle/'+file,'utf8'));
const db={prepare(sql){const statement=sqlite.prepare(sql);let args=[];return {bind(...v){args=v;return this;},async first(){return statement.get(...args)||null;},async all(){return {results:statement.all(...args)};},async run(){return statement.run(...args);}};},async batch(items){sqlite.exec('BEGIN');try{const out=[];for(const item of items)out.push(await item.run());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};
const c=catalog.colleges.find(x=>x.id==='t281'),other=catalog.colleges.find(x=>x.id==='t282'),tokens={};
async function account(login,role,college=c){const id=crypto.randomUUID();sqlite.prepare('INSERT INTO accounts VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,login,'Ism','Familiya',role,college.regionId,college.districtId,college.id,null,null,'unused','',12,Date.now());const token=makePassword().slice(0,8).split('').map(x=>x.charCodeAt(0).toString(16)).join('').padEnd(64,'a').slice(0,64);tokens[id]='__Host-web-talim-session='+token;sqlite.prepare('INSERT INTO auth_sessions VALUES(?,?,?)').run(await digest(token),id,Date.now()+3600000);return {id,role};}
const teacher=await account('teacher','teacher'),teacher2=await account('teacher2','teacher'),outside=await account('outside','teacher',other),student=await account('student','student');
const env={DB:db,AUTH_PASSWORD_PEPPER:'test-pepper-only-for-teacher-tests-7394',ASSETS:{fetch:async()=>new Response('asset')}};
const req=(u,path,body,origin='https://test.example')=>new Request('https://test.example'+path,{method:body===undefined?'GET':'POST',headers:{...(u?{Cookie:tokens[u.id]}:{}),...(body===undefined?{}:{Origin:origin,'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
const call=(u,path,body,origin)=>handleTeacher(req(u,path,body,origin),env);
assert.equal((await call(null,'/api/teacher/groups')).status,401);assert.equal((await call(student,'/api/teacher/groups')).status,403);
assert.equal((await gateway(req(student,'/teacher'),env,{teacherHTML:'teacher'})).status,403);assert.equal(await (await gateway(req(teacher,'/teacher'),env,{teacherHTML:'teacher'})).text(),'teacher');
assert.equal((await call(teacher,'/api/teacher/groups',{name:'3-IT'},'https://evil.example')).status,403);
let response=await call(teacher,'/api/teacher/groups',{name:'3-IT',collegeId:other.id,ownerId:teacher2.id});assert.equal(response.status,201);const {group}=await response.json();assert.equal(group.owner_id,teacher.id);assert.equal(group.college_id,c.id);
const base='/api/teacher/groups/'+group.id;assert.equal((await call(teacher,'/api/teacher/groups',{name:'3 IT'})).status,409);
for(const u of [teacher2,outside])for(const suffix of ['','/credentials'])assert.equal((await call(u,base+suffix,suffix?{}:undefined)).status,404);
assert.equal((await (await call(teacher2,'/api/teacher/groups')).json()).groups.length,0);
const rows=[{firstName:'Aziz',lastName:'Karimov'},{firstName:'Malika',lastName:'Sodiqova'},{firstName:'Ўктам',lastName:'Ғаниев'}],clientId=crypto.randomUUID();
assert.throws(()=>validateRoster([...rows,rows[0]]));assert.throws(()=>validateRoster([{firstName:'',lastName:'A'}]));assert.throws(()=>validateRoster(Array(201).fill(rows[0])));
response=await call(teacher,base+'/imports',{clientId,rows});assert.equal(response.status,201);const {importId}=await response.json();
const again=await (await call(teacher,base+'/imports',{clientId,rows})).json();assert.equal(again.importId,importId);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM roster_students').get().n,3);
assert.equal((await call(teacher,base+'/imports',{clientId,rows:rows.slice(1)})).status,409);
assert.equal((await call(teacher,base+'/imports',{clientId:crypto.randomUUID(),rows})).status,409);
assert.equal((await call(teacher2,base+'/imports/'+importId+'/next',{})).status,404);
response=await call(teacher,base+'/imports/'+importId+'/next',{});assert.equal(response.status,200,await response.clone().text());assert.equal((await response.json()).completed,1);
// Simulate interruption: new detail request must expose remaining work.
let detail=await (await call(teacher,base)).json();assert.equal(detail.imports[0].completed,1);assert.equal(detail.imports[0].total,3);
for(let i=0;i<3;i++){response=await call(teacher,base+'/imports/'+importId+'/next',{});assert.equal(response.status,200);}
assert.equal((await response.json()).done,true);assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM accounts').get().n,7);
const credentials=await (await call(teacher,base+'/credentials',{})).json();assert.equal(credentials.students.length,3);assert.equal(new Set(credentials.students.map(x=>x.password)).size,3);assert.equal(new Set(credentials.students.map(x=>x.login)).size,3);
for(const r of credentials.students){assert(/^[a-z0-9][a-z0-9_.-]{2,31}$/.test(r.login));assert(r.password.length>=20);const account=sqlite.prepare('SELECT * FROM accounts WHERE login=?').get(r.login);assert.equal(account.college_id,c.id);assert.equal(account.group_key,'3IT');assert.equal(account.role,'student');assert(await verifyPassword(r.password,account,env.AUTH_PASSWORD_PEPPER));assert(!account.password_hash.includes(r.password));assert(!JSON.stringify(detail).includes(r.password));}
const r=credentials.students[0];response=await handleAuth(req(null,'/api/auth/login',{login:r.login,password:r.password}),db,{pepper:env.AUTH_PASSWORD_PEPPER});assert.equal(response.status,200);const session=response.headers.get('set-cookie').split(';')[0],studentAccount=await response.json();tokens[studentAccount.user.id]=session;
response=await handleAuth(req(studentAccount.user,'/api/auth/password',{currentPassword:r.password,password:'New-private-password-7394'}),db,{pepper:env.AUTH_PASSWORD_PEPPER});assert.equal(response.status,200,await response.clone().text());
assert.equal((await (await call(teacher,base+'/credentials',{})).json()).students.find(x=>x.login===r.login).password,null);
assert.equal((await handleAuth(req(null,'/api/auth/login',{login:r.login,password:r.password}),db,{pepper:env.AUTH_PASSWORD_PEPPER})).status,401);
assert.equal((await handleAuth(req(null,'/api/auth/login',{login:r.login,password:'New-private-password-7394'}),db,{pepper:env.AUTH_PASSWORD_PEPPER})).status,200);
const sealed=await seal('secret',env.AUTH_PASSWORD_PEPPER,'row-id');assert.equal(await unseal(sealed,env.AUTH_PASSWORD_PEPPER,'row-id'),'secret');await assert.rejects(()=>unseal(sealed,env.AUTH_PASSWORD_PEPPER,'other-row'));await assert.rejects(()=>unseal(sealed,'wrong-test-pepper-here-at-least-32-chars','row-id'));
assert.equal(new Set(Array.from({length:1000},()=>makeLogin('Aziz','Karimov'))).size,1000);
console.log('Teacher ownership, student denial, CSRF, college binding, group normalization, Excel roster validation, duplicate/replayed imports, interruption/resume, unique credentials, real password login/change/revocation, encrypted credential export and row-bound encryption passed.');sqlite.close();
