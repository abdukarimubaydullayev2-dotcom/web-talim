import {handleAnalytics,isAdmin} from '../analytics/server.mjs';
import {handleAuth,currentAccount} from './service.mjs';
export function secure(response){const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('X-Frame-Options','DENY');headers.set('Cache-Control','private, no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
export async function gateway(request,env,{loginHTML,accountHTML,courseHTML,clientJS,styleCSS,adminHTML,adminJS,adminCSS}){
 const url=new URL(request.url),path=url.pathname;
 const content=(text,type='text/html; charset=utf-8',status=200)=>secure(new Response(text,{status,headers:{'Content-Type':type}}));
 if(path.startsWith('/api/admin/')||path.startsWith('/api/activity/'))return secure(await handleAnalytics(request,env));
 if(path.startsWith('/api/'))return secure(await handleAuth(request,env.DB,{pepper:env.AUTH_PASSWORD_PEPPER,adminAccountIds:env.ADMIN_ACCOUNT_IDS}));
 if(path==='/auth/client.js')return content(clientJS,'text/javascript; charset=utf-8');
 if(path==='/auth/style.css')return content(styleCSS,'text/css; charset=utf-8');
 if(['/assets/texnikum-building-2026.jpg'].includes(path))return env.ASSETS.fetch(request);
 let user;try{user=await currentAccount(request,env.DB);}catch{if(path==='/login'||path==='/register')return content(loginHTML);return content('Hisob xizmati vaqtincha mavjud emas. Bir ozdan so‘ng qayta urinib ko‘ring.','text/plain; charset=utf-8',503);}
 if(path==='/login'||path==='/register')return user?secure(Response.redirect(url.origin+'/',303)):content(loginHTML);
 if(!user)return secure(Response.redirect(url.origin+'/login',303));
 if(path==='/account')return content(accountHTML);
 if(path==='/admin'||path.startsWith('/admin/')){if(!isAdmin(user,env))return content('Admin panelga kirish huquqi yo‘q.','text/plain; charset=utf-8',403);if(path==='/admin')return content(adminHTML);if(path==='/admin/client.js')return content(adminJS,'text/javascript; charset=utf-8');if(path==='/admin/style.css')return content(adminCSS,'text/css; charset=utf-8');return content('Topilmadi.','text/plain',404);}
 if(path==='/'||path==='/index.html'){
  const scoped=courseHTML.replace('<script src="sidebar.js">', '<script>globalThis.webTalimAccountId='+JSON.stringify(user.id)+'</script><script src="sidebar.js">');
  const adminLink=isAdmin(user,env)?'<a href="/admin" style="position:fixed;bottom:66px;right:18px;z-index:20;background:#183d35;color:white;padding:10px 17px;border-radius:24px;text-decoration:none;font:14px system-ui">Admin panel</a>':'';
  const html=scoped.replace('</html>',adminLink+'<script src="assessment-versions.js"></script><script src="analytics-client.js"></script>'+'<a href="/account" style="position:fixed;bottom:18px;right:18px;z-index:20;background:#176f58;color:white;border:1px solid #b9d7c8;padding:10px 17px;border-radius:24px;text-decoration:none;font:14px system-ui;box-shadow:0 3px 15px #173f3420">Hisobim</a></html>');return content(html);
 }
 if(!['GET','HEAD'].includes(request.method))return content('Usul qo‘llanmaydi.','text/plain',405);
 return secure(await env.ASSETS.fetch(request));
}
