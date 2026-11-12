import {createPassword,verifyPassword,digest,readBody} from '../auth/service.mjs';
import catalog from '../auth/catalog.json' with {type:'json'};
const configuredLogin=env=>String(env.ADMIN_INITIAL_LOGIN||'').trim().toLowerCase();
const json=(error,status)=>new Response(JSON.stringify({error}),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'private,no-store'}});
async function limited(db,key,max){const now=Date.now(),hash=await digest(key);const r=await db.prepare('INSERT INTO auth_rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END RETURNING count').bind(hash,now+600000,now,now).first();return r.count>max}
function same(a,b){if(a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0}
export async function bootstrapAdministrator(request,env){const path=new URL(request.url).pathname;if(request.method!=='POST'||!['/api/auth/login','/api/auth/register'].includes(path)||!configuredLogin(env))return null;
 // Existing admin accounts always use normal password verification, including after password changes.
 if((await env.DB.prepare('SELECT account_id FROM administrators LIMIT 1').first())&&path==='/api/auth/login')return null;
 const input=await readBody(request.clone());if(String(input.login||'').trim().toLowerCase()!==configuredLogin(env))return null;
 if(path==='/api/auth/register')return json('Bu login administrator uchun band. Boshqa login tanlang.',409);
 if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return json('So‘rov manbasi tasdiqlanmadi.',403);
 if(await limited(env.DB,'admin-initial:ip:'+(request.headers.get('CF-Connecting-IP')||'local'),20))return json('Urinishlar ko‘paydi. Keyinroq qayta urinib ko‘ring.',429);
 if(typeof input.password!=='string'||input.password.length>128)return null;
 const actual=await digest('oshpaz-admin-initial:'+input.password);if(!same(actual,String(env.ADMIN_INITIAL_PASSWORD_SHA256||'')))return null;
 const college=catalog.colleges.find(x=>x.name==='Namangan shahar 3-son texnikumi');if(!college)return json('Administrator muassasasi sozlanmagan.',503);
 let row=await env.DB.prepare('SELECT * FROM accounts WHERE login=?').bind(configuredLogin(env)).first();
 if(row&&!await verifyPassword(input.password,row,env.AUTH_PASSWORD_PEPPER))return json('Bu login bilan hisob mavjud. Mavjud hisobni tekshirish uchun platforma egasiga murojaat qiling.',409);
 if(!row){const id=crypto.randomUUID(),hash=await createPassword(input.password,env.AUTH_PASSWORD_PEPPER);await env.DB.prepare('INSERT OR IGNORE INTO accounts(id,login,first_name,last_name,role,region_id,district_id,college_id,group_name,group_key,password_hash,salt,iterations,created_at) VALUES(?,?,?,?,?,?,?,?,NULL,NULL,?,?,?,?)').bind(id,configuredLogin(env),'Zulfiya','Umarova','teacher',college.regionId,college.districtId,college.id,hash,'',12,Date.now()).run();row=await env.DB.prepare('SELECT * FROM accounts WHERE login=?').bind(configuredLogin(env)).first();if(!row||!await verifyPassword(input.password,row,env.AUTH_PASSWORD_PEPPER))return json('Hisobni biriktirishda ziddiyat yuz berdi.',409)}
 await env.DB.batch([env.DB.prepare("INSERT OR IGNORE INTO admin_bootstrap(id,claimed_by,created_at) SELECT 'primary',?,? WHERE NOT EXISTS (SELECT 1 FROM administrators)").bind(row.id,Date.now()),env.DB.prepare("INSERT OR IGNORE INTO administrators(account_id,created_at) SELECT claimed_by,created_at FROM admin_bootstrap WHERE id='primary' AND claimed_by=?").bind(row.id)]);
 return null;
}
