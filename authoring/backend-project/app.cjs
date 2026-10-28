/* Teaching app: one Node 24 process, a small SQLite database, same-origin UI. */
const express = require('express');
const session = require('express-session');
const {DatabaseSync} = require('node:sqlite');
const {randomBytes, scrypt, timingSafeEqual} = require('node:crypto');
const {promisify} = require('node:util');
const path = require('node:path');
const fs = require('node:fs');
const derive = promisify(scrypt);
const HASH_OPTIONS = {N:32768,r:8,p:3,maxmem:64*1024*1024};
const SESSION_MS = 60*60*1000;

function validTitle(value) {
  return typeof value === 'string' && value.trim().length >= 1 && value.trim().length <= 120;
}
function equalToken(a,b) {
  if(typeof a !== 'string' || typeof b !== 'string') return false;
  const x=Buffer.from(a), y=Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x,y);
}
async function hashPassword(password, salt=randomBytes(16).toString('hex')) {
  const hash=await derive(password,salt,64,HASH_OPTIONS);
  return `${salt}:${hash.toString('hex')}`;
}
async function verifyPassword(password, encoded) {
  const [salt,hex]=encoded.split(':');
  const actual=await derive(password,salt,64,HASH_OPTIONS);
  const expected=Buffer.from(hex,'hex');
  return expected.length===actual.length && timingSafeEqual(actual,expected);
}
function makeStore(db) {
  // express-session's Store supplies its event interface; these four methods
  // are the adapter between session objects and parameterised SQLite queries.
  const store=new session.Store();
  store.get=(sid,cb)=>{
    try {
      const row=db.prepare('SELECT value,expires FROM sessions WHERE sid=?').get(sid);
      if(!row) return cb(null,null);
      if(row.expires<=Date.now()) {db.prepare('DELETE FROM sessions WHERE sid=?').run(sid);return cb(null,null);}
      cb(null,JSON.parse(row.value));
    } catch(e) {cb(e);}
  };
  store.set=(sid,value,cb=()=>{})=>{
    try {
      const expires=value.cookie.expires ? new Date(value.cookie.expires).getTime() : Date.now()+SESSION_MS;
      db.prepare('INSERT INTO sessions(sid,value,expires) VALUES (?,?,?) ON CONFLICT(sid) DO UPDATE SET value=excluded.value,expires=excluded.expires')
        .run(sid,JSON.stringify(value),expires);
      db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
      cb(null);
    } catch(e) {cb(e);}
  };
  store.destroy=(sid,cb=()=>{})=>{try{db.prepare('DELETE FROM sessions WHERE sid=?').run(sid);cb(null);}catch(e){cb(e);}};
  store.touch=(sid,value,cb=()=>{})=>store.set(sid,value,cb);
  return store;
}
async function createApp({dbPath=':memory:',secret,origin='http://localhost:3000',trustProxy=false,logger=()=>{},loginLimit=20}={}) {
  if(typeof secret!=='string'||secret.length<32) throw new Error('SESSION_SECRET kamida 32 belgili tasodifiy kalit bo‘lsin');
  const parsedOrigin=new URL(origin);
  if(!['http:','https:'].includes(parsedOrigin.protocol)||parsedOrigin.origin!==origin) throw new Error('APP_ORIGIN faqat protokol, host va portdan iborat bo‘lsin');
  const secure=parsedOrigin.protocol==='https:';
  if(dbPath!==':memory:') fs.mkdirSync(path.dirname(path.resolve(dbPath)),{recursive:true});
  const db=new DatabaseSync(dbPath);
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY,email TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS tasks(
      id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
      done INTEGER NOT NULL DEFAULT 0 CHECK(done IN (0,1)));
    CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks(user_id);
    CREATE TABLE IF NOT EXISTS sessions(sid TEXT PRIMARY KEY,value TEXT NOT NULL,expires INTEGER NOT NULL);`);
  const dummyHash=await hashPassword('suniy-mavjud-bolmagan-hisob');
  const app=express();
  app.disable('x-powered-by');
  if(trustProxy) app.set('trust proxy',1);
  app.use((req,res,next)=>{
    res.set('X-Content-Type-Options','nosniff');
    res.set('Referrer-Policy','same-origin');
    res.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    if(secure) res.set('Strict-Transport-Security','max-age=31536000');
    const started=Date.now();
    res.on('finish',()=>logger({method:req.method,path:req.path,status:res.statusCode,ms:Date.now()-started}));
    next();
  });
  app.use('/api',(req,res,next)=>{res.set('Cache-Control','no-store');next();});
  app.use(express.json({limit:'16kb'}));
  app.use(session({name:'school.sid',secret,store:makeStore(db),resave:false,saveUninitialized:false,
    cookie:{httpOnly:true,secure,sameSite:'lax',maxAge:SESSION_MS}}));
  app.get('/health',(req,res)=>res.json({ok:true}));
  app.get('/api/csrf',(req,res)=>{
    req.session.csrf ||= randomBytes(32).toString('hex');
    res.json({csrfToken:req.session.csrf});
  });
  app.use('/api',(req,res,next)=>{
    if(['GET','HEAD','OPTIONS'].includes(req.method)) return next();
    if(req.get('Origin') && req.get('Origin')!==origin) return res.status(403).json({error:'Origin ruxsat etilmagan'});
    if(!equalToken(req.get('X-CSRF-Token'),req.session.csrf)) return res.status(403).json({error:'CSRF token noto‘g‘ri'});
    next();
  });
  const attempts=new Map();
  function limitLogin(req,res,next) {
    const now=Date.now();
    for(const [ip,v] of attempts) if(v.until<=now) attempts.delete(ip);
    const key=req.ip;
    let v=attempts.get(key);
    if(!v) {
      if(attempts.size>=1000) return res.status(429).json({error:'Keyinroq urinib ko‘ring'});
      v={count:0,until:now+15*60*1000};attempts.set(key,v);
    }
    if(++v.count>loginLimit) {res.set('Retry-After',String(Math.ceil((v.until-now)/1000)));return res.status(429).json({error:'Urinishlar chegarasi. Keyinroq urinib ko‘ring'});}
    next();
  }
  function credentials(body) {
    if(!body||typeof body.email!=='string'||typeof body.password!=='string') return null;
    const email=body.email.trim().toLowerCase(),password=body.password;
    if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<15||password.length>128) return null;
    return {email,password};
  }
  app.post('/api/signup',limitLogin,async(req,res)=>{
    const input=credentials(req.body);
    if(!input) return res.status(400).json({error:'Email formati yoki parol uzunligi (15–128 belgi) noto‘g‘ri'});
    const encoded=await hashPassword(input.password);
    try {
      const result=db.prepare('INSERT INTO users(email,password_hash) VALUES (?,?)').run(input.email,encoded);
      res.status(201).json({id:Number(result.lastInsertRowid),email:input.email});
    } catch(e) {
      if(db.prepare('SELECT id FROM users WHERE email=?').get(input.email)) return res.status(409).json({error:'Bu email band'});
      throw e;
    }
  });
  app.post('/api/login',limitLogin,async(req,res,next)=>{
    const input=credentials(req.body);
    if(!input) return res.status(401).json({error:'Email yoki parol noto‘g‘ri'});
    const user=db.prepare('SELECT id,email,password_hash FROM users WHERE email=?').get(input.email);
    const match=await verifyPassword(input.password,user?.password_hash||dummyHash);
    if(!user||!match) return res.status(401).json({error:'Email yoki parol noto‘g‘ri'});
    req.session.regenerate(err=>{
      if(err) return next(err);
      req.session.userId=user.id;
      req.session.csrf=randomBytes(32).toString('hex');
      res.json({user:{id:user.id,email:user.email},csrfToken:req.session.csrf});
    });
  });
  function signedIn(req,res,next) {
    if(!req.session.userId) return res.status(401).json({error:'Avval tizimga kiring'});
    next();
  }
  app.get('/api/me',signedIn,(req,res)=>{
    const user=db.prepare('SELECT id,email FROM users WHERE id=?').get(req.session.userId);
    if(!user) return res.status(401).json({error:'Hisob topilmadi'});
    res.json(user);
  });
  const outputTask=row=>({...row,done:Boolean(row.done)});
  app.get('/api/tasks',signedIn,(req,res)=>{
    const page=Number(req.query.page??1),limit=Number(req.query.limit??10);
    if(!Number.isSafeInteger(page)||page<1||page>10000||!Number.isInteger(limit)||limit<1||limit>50)
      return res.status(400).json({error:'page 1–10000 va limit 1–50 bo‘lsin'});
    const rows=db.prepare('SELECT id,title,done FROM tasks WHERE user_id=? ORDER BY id DESC LIMIT ? OFFSET ?')
      .all(req.session.userId,limit,(page-1)*limit);
    res.json({items:rows.map(outputTask),page,limit});
  });
  app.post('/api/tasks',signedIn,(req,res)=>{
    if(!validTitle(req.body?.title)||Object.keys(req.body).some(k=>k!=='title')) return res.status(400).json({error:'Faqat 1–120 belgili title yuboring'});
    const r=db.prepare('INSERT INTO tasks(user_id,title) VALUES (?,?)').run(req.session.userId,req.body.title.trim());
    res.status(201).json(outputTask(db.prepare('SELECT id,title,done FROM tasks WHERE id=?').get(Number(r.lastInsertRowid))));
  });
  app.use('/api/tasks/:id',signedIn,(req,res,next)=>{
    const id=Number(req.params.id);
    if(!Number.isSafeInteger(id)||id<1) return res.status(400).json({error:'ID musbat butun son bo‘lsin'});
    const row=db.prepare('SELECT id,title,done FROM tasks WHERE id=? AND user_id=?').get(id,req.session.userId);
    if(!row) return res.status(404).json({error:'Vazifa topilmadi'});
    req.task=row;next();
  });
  app.get('/api/tasks/:id',(req,res)=>res.json(outputTask(req.task)));
  app.patch('/api/tasks/:id',(req,res)=>{
    const b=req.body;
    if(!b||typeof b!=='object'||Array.isArray(b)||!Object.keys(b).length||Object.keys(b).some(k=>!['title','done'].includes(k))
       ||('title'in b&&!validTitle(b.title))||('done'in b&&typeof b.done!=='boolean'))
      return res.status(400).json({error:'Faqat title matni yoki done boolean qiymatini yuboring'});
    const title='title'in b?b.title.trim():req.task.title,done='done'in b?Number(b.done):req.task.done;
    db.prepare('UPDATE tasks SET title=?,done=? WHERE id=? AND user_id=?').run(title,done,req.task.id,req.session.userId);
    res.json({id:req.task.id,title,done:Boolean(done)});
  });
  app.delete('/api/tasks/:id',(req,res)=>{
    db.prepare('DELETE FROM tasks WHERE id=? AND user_id=?').run(req.task.id,req.session.userId);
    res.status(204).end();
  });
  app.post('/api/logout',signedIn,(req,res,next)=>{
    req.session.destroy(err=>{
      if(err) return next(err);
      res.clearCookie('school.sid',{path:'/',httpOnly:true,sameSite:'lax',secure});
      res.status(204).end();
    });
  });
  app.use('/api',(req,res)=>res.status(404).json({error:'Endpoint topilmadi'}));
  app.use(express.static(path.join(__dirname,'public')));
  app.use((req,res)=>res.status(404).json({error:'Sahifa topilmadi'}));
  app.use((err,req,res,next)=>{
    if(res.headersSent) return next(err);
    if(err.type==='entity.too.large') return res.status(413).json({error:'So‘rov tanasi juda katta'});
    if(err.type==='entity.parse.failed') return res.status(400).json({error:'JSON sintaksisi noto‘g‘ri'});
    logger({event:'server-error',message:err.message});
    res.status(500).json({error:'Ichki server xatosi'});
  });
  return {app,db,close:()=>db.close()};
}
module.exports={createApp,validTitle,hashPassword,verifyPassword,equalToken};
