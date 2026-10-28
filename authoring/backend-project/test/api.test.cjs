const test=require('node:test');
const assert=require('node:assert/strict');
const {mkdtempSync,rmSync}=require('node:fs');
const {tmpdir}=require('node:os');
const path=require('node:path');
const {createApp,validTitle,verifyPassword}=require('../app.cjs');
const secret='test-only-secret-with-at-least-32-characters';
async function setup(t,options={}){
  const runtime=await createApp({secret,...options});
  const server=runtime.app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));runtime.close();});
  function client(){let cookie='',csrf='';return {
    cookie:()=>cookie,csrf:()=>csrf,
    async send(route,{method='GET',body,token=true,headers={}}={}){
      const res=await fetch(base+route,{method,headers:{...(cookie?{Cookie:cookie}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{}),...(method!=='GET'&&token?{'X-CSRF-Token':csrf}:{}),...headers},...(body!==undefined?{body:JSON.stringify(body)}:{})});
      const set=res.headers.getSetCookie();if(set.length)cookie=set.map(s=>s.split(';')[0]).join('; ');
      const data=res.status===204?null:await res.json();
      if(data?.csrfToken)csrf=data.csrfToken;
      return {status:res.status,data,res};
    },
    async signup(email='a@example.test'){await this.send('/api/csrf');return this.send('/api/signup',{method:'POST',body:{email,password:'faqat-mashq-paroli'}});},
    async login(email='a@example.test'){return this.send('/api/login',{method:'POST',body:{email,password:'faqat-mashq-paroli'}});}
  };}
  return {...runtime,base,client};
}
test('Title chegara va tiplari',()=>{
  for(const x of [null,4,'','   ','a'.repeat(121)])assert.equal(validTitle(x),false);
  for(const x of ['a','a'.repeat(120),'  Dars  '])assert.equal(validTitle(x),true);
});
test('Kirish CSRF va maxfiy qiymatlarni qaytarmaslik',async t=>{
  const {client,db}=await setup(t);const c=client();
  assert.equal((await c.send('/api/me')).status,401);
  assert.equal((await c.send('/api/signup',{method:'POST',body:{},token:false})).status,403);
  assert.equal((await c.signup()).status,201);
  const row=db.prepare('SELECT password_hash FROM users').get();assert(!row.password_hash.includes('faqat-mashq-paroli'));
  assert(await verifyPassword('faqat-mashq-paroli',row.password_hash));
  const old=c.cookie(),oldToken=c.csrf();
  const result=await c.login();assert.equal(result.status,200);assert.notEqual(c.cookie(),old);assert.notEqual(c.csrf(),oldToken);
  const me=await c.send('/api/me');assert.deepEqual(Object.keys(me.data).sort(),['email','id']);
  assert.equal((await c.send('/api/tasks',{method:'POST',body:{title:'Dars'},headers:{'X-CSRF-Token':oldToken}})).status,403);
});
test('Ikki hisob izolyatsiyasi va to‘liq CRUD',async t=>{
  const {client}=await setup(t);const a=client(),b=client();
  await a.signup();await a.login();await b.signup('b@example.test');await b.login('b@example.test');
  const created=await a.send('/api/tasks',{method:'POST',body:{title:'A vazifasi'}});assert.equal(created.status,201);
  const id=created.data.id;assert.equal((await a.send('/api/tasks/'+id)).status,200);
  assert.equal((await b.send('/api/tasks')).data.items.length,0);
  for(const method of ['GET','PATCH','DELETE'])assert.equal((await b.send('/api/tasks/'+id,{method,...(method==='PATCH'?{body:{done:true}}:{})})).status,404);
  const updated=await a.send('/api/tasks/'+id,{method:'PATCH',body:{done:true}});assert.equal(updated.data.done,true);
  assert.equal((await a.send('/api/tasks/'+id,{method:'DELETE'})).status,204);
  assert.equal((await a.send('/api/tasks/'+id)).status,404);
});
test('Validatsiya sahifalash va mass assignment rad etiladi',async t=>{
  const {client}=await setup(t);const c=client();await c.signup();await c.login();
  for(const title of ['',null,44,'a'.repeat(121)])assert.equal((await c.send('/api/tasks',{method:'POST',body:{title}})).status,400);
  assert.equal((await c.send('/api/tasks',{method:'POST',body:{title:'Dars',user_id:99}})).status,400);
  const id=(await c.send('/api/tasks',{method:'POST',body:{title:'Dars'}})).data.id;
  for(const body of [{},{role:'admin'},{done:'true'},{user_id:2}])assert.equal((await c.send('/api/tasks/'+id,{method:'PATCH',body})).status,400);
  for(const url of ['/api/tasks/abc','/api/tasks/-1','/api/tasks?limit=0','/api/tasks?page=abc','/api/tasks?limit=51'])assert.equal((await c.send(url)).status,400);
  assert.equal((await c.send('/api/tasks?limit=1&page=2')).data.items.length,0);
});
test('Origin CSRF logout va eski cookie',async t=>{
  const {client,base}=await setup(t);const c=client();await c.signup();await c.login();const oldCookie=c.cookie();
  assert.equal((await c.send('/api/tasks',{method:'POST',body:{title:'Dars'},token:false})).status,403);
  assert.equal((await c.send('/api/tasks',{method:'POST',body:{title:'Dars'},headers:{Origin:'https://other.example'}})).status,403);
  assert.equal((await c.send('/api/logout',{method:'POST'})).status,204);
  assert.equal((await c.send('/api/me')).status,401);
  assert.equal((await fetch(base+'/api/me',{headers:{Cookie:oldCookie}})).status,401);
});
test('Duplicate va umumiy login xatosi',async t=>{
  const {client}=await setup(t);const c=client();await c.signup();assert.equal((await c.signup()).status,409);
  const body={email:'a@example.test',password:'noto-gri-mashq-paroli'};
  const known=await c.send('/api/login',{method:'POST',body});
  const unknown=await c.send('/api/login',{method:'POST',body:{...body,email:'missing@example.test'}});
  assert.equal(known.status,401);assert.equal(unknown.status,401);assert.deepEqual(known.data,unknown.data);
});
test('Login urinish chegarasi',async t=>{
  const {client}=await setup(t,{loginLimit:2});const c=client();await c.send('/api/csrf');
  for(let i=0;i<2;i++)assert.equal((await c.send('/api/login',{method:'POST',body:{}})).status,401);
  assert.equal((await c.send('/api/login',{method:'POST',body:{}})).status,429);
});
test('Baza va sessiya server qayta yaratilganda saqlanadi',async t=>{
  const dir=mkdtempSync(path.join(tmpdir(),'web-talim-m6-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const dbPath=path.join(dir,'demo.sqlite');
  const first=await createApp({secret,dbPath});const server=first.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  const base='http://127.0.0.1:'+server.address().port;let cookie='',csrf='';
  async function req(route,body){const res=await fetch(base+route,{method:body?'POST':'GET',headers:{Cookie:cookie,...(body?{'Content-Type':'application/json','X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});const set=res.headers.getSetCookie();if(set.length)cookie=set.map(x=>x.split(';')[0]).join('; ');const data=await res.json();csrf=data.csrfToken||csrf;return data;}
  await req('/api/csrf');await req('/api/signup',{email:'persist@example.test',password:'faqat-mashq-paroli'});await req('/api/login',{email:'persist@example.test',password:'faqat-mashq-paroli'});await req('/api/tasks',{title:'Qolishi kerak'});
  await new Promise(r=>server.close(r));first.close();
  const second=await createApp({secret,dbPath});const server2=second.app.listen(0,'127.0.0.1');await new Promise(r=>server2.once('listening',r));
  try{const res=await fetch('http://127.0.0.1:'+server2.address().port+'/api/tasks',{headers:{Cookie:cookie}});assert.equal(res.status,200);assert.equal((await res.json()).items[0].title,'Qolishi kerak');}
  finally{await new Promise(r=>server2.close(r));second.close();}
});
