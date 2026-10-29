import {isAdmin} from './access.mjs';
import bcrypt from 'bcryptjs';
import catalog from './catalog.json' with {type:'json'};
const encoder=new TextEncoder();
export const PASSWORD_ITERATIONS=600000;
const SESSION_SECONDS=7*24*60*60;
const COOKIE='__Host-web-talim-session';
const hex=bytes=>Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');
const unhex=x=>Uint8Array.from(x.match(/../g)||[],x=>parseInt(x,16));
const random=n=>hex(crypto.getRandomValues(new Uint8Array(n)));
export async function digest(value){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))));}
export async function passwordHash(password,salt,iterations=PASSWORD_ITERATIONS){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations,hash:'SHA-256'},key,256)));}
// HMAC prehash keeps the full 10..128-character password within bcrypt's 72-byte bound.
export async function protectedPassword(password,pepper){
 if(typeof pepper!=='string'||pepper.length<32)throw new Error('AUTH_PASSWORD_CONFIG_MISSING');
 const key=await crypto.subtle.importKey('raw',encoder.encode(pepper),{name:'HMAC',hash:'SHA-384'},false,['sign']);
 const value=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(password)));
 return btoa(String.fromCharCode(...value));
}
export async function createPassword(password,pepper){return bcrypt.hash(await protectedPassword(password,pepper),12);}
export async function verifyPassword(password,row,pepper){
 if(row?.password_hash?.startsWith('$2'))return bcrypt.compare(await protectedPassword(password,pepper),row.password_hash);
 if(row)return equal(await passwordHash(password,row.salt,row.iterations),row.password_hash);
 await createPassword(password,pepper);return false;
}
function equal(a,b){if(a.length!==b.length)return false;let value=0;for(let i=0;i<a.length;i++)value|=a.charCodeAt(i)^b.charCodeAt(i);return value===0;}
export class AuthError extends Error{constructor(message,status=400){super(message);this.status=status;}}
function text(value,min,max,label){if(typeof value!=='string')throw new AuthError(label+'ni kiriting.');const s=value.normalize('NFKC').trim().replace(/\s+/g,' ');if(s.length<min||s.length>max||/[\x00-\x1f<>]/.test(s))throw new AuthError(label+` ${min}–${max} belgi bo‘lsin.`);return s;}
export function validateRegistration(input){
 if(!input||typeof input!=='object')throw new AuthError('Ma’lumotlar noto‘g‘ri.');
 const college=catalog.colleges.find(x=>x.id===input.collegeId);
 if(!college||college.regionId!==input.regionId||college.districtId!==input.districtId)throw new AuthError('Viloyat, tuman/shahar va texnikumni qayta tanlang.');
 if(!['student','teacher'].includes(input.role))throw new AuthError('O‘quvchi yoki o‘qituvchini tanlang.');
 const groupName=input.role==='student'?text(input.groupName,1,40,'Guruh nomi'):null;
 const login=typeof input.login==='string'?input.login.trim().toLowerCase():'';
 if(!/^[a-z0-9][a-z0-9_.-]{2,31}$/.test(login))throw new AuthError('Login 3–32 ta lotin harfi, raqam, nuqta, chiziq yoki pastki chiziqdan iborat bo‘lsin.');
 if(typeof input.password!=='string'||input.password.length<10||input.password.length>128)throw new AuthError('Parol 10–128 belgi bo‘lsin.');
 return {login,firstName:text(input.firstName,1,60,'Ism'),lastName:text(input.lastName,1,60,'Familiya'),role:input.role,regionId:college.regionId,districtId:college.districtId,collegeId:college.id,groupName,groupKey:groupName?.toLocaleUpperCase('uz').replace(/[\s_\-‐‑–—−]/g,'')||null,password:input.password};
}
function profile(row,adminAccountIds){const college=catalog.colleges.find(x=>x.id===row.college_id);return {isAdmin:isAdmin(row,{ADMIN_ACCOUNT_IDS:adminAccountIds}),id:row.id,login:row.login,firstName:row.first_name,lastName:row.last_name,role:row.role,groupName:row.group_name,regionId:row.region_id,districtId:row.district_id,collegeId:row.college_id,region:catalog.regions.find(x=>x.id===row.region_id)?.name,district:catalog.districts.find(x=>x.id===row.district_id)?.name,college:college?.name};}
export async function currentAccount(request,db){const cookie=request.headers.get('Cookie')||'';const token=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const tokenHash=await digest(token);return db.prepare('SELECT a.* FROM auth_sessions s JOIN accounts a ON a.id=s.account_id WHERE s.token_hash=? AND s.expires_at>?').bind(tokenHash,Date.now()).first();}
function json(body,status=200,extra={}){return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store',...extra}});}
const cookie=token=>`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${token?SESSION_SECONDS:0}`;
async function session(db,id,request){const token=random(32),hash=await digest(token);const old=request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);const commands=[db.prepare('INSERT INTO auth_sessions(token_hash,account_id,expires_at) VALUES(?,?,?)').bind(hash,id,Date.now()+SESSION_SECONDS*1000),db.prepare('DELETE FROM auth_sessions WHERE expires_at<=?').bind(Date.now())];if(old&&/^[a-f0-9]{64}$/.test(old))commands.push(db.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await digest(old)));commands.push(db.prepare('INSERT INTO login_events(id,account_id,created_at) VALUES(?,?,?)').bind(crypto.randomUUID(),id,Date.now()));await db.batch(commands);return cookie(token);}
async function limit(db,key,max,window){const now=Date.now(),k=await digest(key);const row=await db.prepare('INSERT INTO auth_rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END RETURNING count').bind(k,now+window,now,now).first();if(row.count>max)throw new AuthError('Urinishlar ko‘payib ketdi. Bir ozdan keyin qayta urinib ko‘ring.',429);}
export async function readBody(request){if(!request.headers.get('Content-Type')?.startsWith('application/json'))throw new AuthError('JSON formatidagi so‘rov kerak.',415);if(!request.body)throw new AuthError('So‘rov bo‘sh.');const reader=request.body.getReader();let length=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>8192){await reader.cancel();throw new AuthError('So‘rov hajmi juda katta.',413);}chunks.push(value);}const bytes=new Uint8Array(length);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new AuthError('So‘rov formati noto‘g‘ri.');}}
export async function handleAuth(request,db,{pepper,adminAccountIds}={}){const url=new URL(request.url),path=url.pathname;
 try{
  if(request.method==='GET'&&path==='/api/catalog')return json(catalog);
  if(request.method==='GET'&&path==='/api/auth/me'){const row=await currentAccount(request,db);return row?json({user:profile(row,adminAccountIds)}):json({user:null},401);}
  if(!['/api/auth/register','/api/auth/login','/api/auth/logout'].includes(path))return json({error:'Manzil topilmadi.'},404);
  if(request.method!=='POST')return json({error:'POST so‘rovi kerak.'},405,{Allow:'POST'});
  if(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')throw new AuthError('So‘rov manbasi tasdiqlanmadi. Sahifani qayta oching.',403);
  if(path==='/api/auth/logout'){const raw=request.headers.get('Cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(raw&&/^[a-f0-9]{64}$/.test(raw))await db.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(await digest(raw)).run();return json({ok:true},200,{'Set-Cookie':cookie('')});}
  const ip=request.headers.get('CF-Connecting-IP')||'local';await limit(db,path+':ip:'+ip,path.endsWith('register')?100:120,path.endsWith('register')?3600000:600000);
  const input=await readBody(request);
  if(path.endsWith('register')){
   const value=validateRegistration(input);const existing=await db.prepare('SELECT id FROM accounts WHERE login=?').bind(value.login).first();if(existing)throw new AuthError('Bu login band. Boshqa login tanlang.',409);
   const salt='',hash=await createPassword(value.password,pepper),id=crypto.randomUUID();
   try{await db.prepare('INSERT INTO accounts(id,login,first_name,last_name,role,region_id,district_id,college_id,group_name,group_key,password_hash,salt,iterations,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,value.login,value.firstName,value.lastName,value.role,value.regionId,value.districtId,value.collegeId,value.groupName,value.groupKey,hash,salt,12,Date.now()).run();}catch(e){if(/UNIQUE constraint failed.*accounts.login/i.test(String(e)))throw new AuthError('Bu login band. Boshqa login tanlang.',409);throw e;}
   const row=await db.prepare('SELECT * FROM accounts WHERE id=?').bind(id).first();return json({user:profile(row,adminAccountIds)},201,{'Set-Cookie':await session(db,id,request)});
  }
  const login=typeof input?.login==='string'?input.login.trim().toLowerCase():'';if(!/^[a-z0-9][a-z0-9_.-]{2,31}$/.test(login)||typeof input.password!=='string'||input.password.length<1||input.password.length>128)throw new AuthError('Login yoki parol noto‘g‘ri.',401);
  await limit(db,'login:'+login,20,600000);const row=await db.prepare('SELECT * FROM accounts WHERE login=?').bind(login).first();
  const valid=await verifyPassword(input.password,row,pepper);
  if(!valid)throw new AuthError('Login yoki parol noto‘g‘ri.',401);
  return json({user:profile(row,adminAccountIds)},200,{'Set-Cookie':await session(db,row.id,request)});
 }catch(e){if(e instanceof AuthError)return json({error:e.message},e.status,e.status===429?{'Retry-After':'600'}:{});console.error('auth_request_failed', {name:e?.name||'Error',category:/PBKDF2|Pbkdf2|iteration/i.test(String(e?.message))?'password_runtime_limit':/D1|SQLITE|database|no such table/i.test(String(e?.message))?'database':/CONFIG_MISSING/.test(String(e?.message))?'password_configuration':'unexpected'});return json({error:'Hisob xizmatida vaqtinchalik xato. Keyinroq qayta urinib ko‘ring.'},503);}
}
