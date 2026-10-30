import {handleAnalytics,isAdmin} from '../analytics/server.mjs';
import {handleAuth,currentAccount} from './service.mjs';
import {handleTeacher} from '../teacher/server.mjs';
import {handleExams} from '../exams/server.mjs';
import {handleResources} from '../resources/server.mjs';
import {handleAdminResources} from '../admin/resources-server.mjs';
export function secure(response){const headers=new Headers(response.headers);headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','strict-origin-when-cross-origin');headers.set('X-Frame-Options','DENY');headers.set('Cache-Control','private, no-store');return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}
export async function gateway(request,env,{loginHTML,accountHTML,courseHTML,clientJS,styleCSS,adminHTML,adminJS,adminCSS,teacherHTML,teacherJS,teacherCSS,examHTML,examJS,resourcesHTML,resourcesJS,adminResourcesHTML,adminResourcesJS}){
 const url=new URL(request.url),path=url.pathname;
 const content=(text,type='text/html; charset=utf-8',status=200)=>secure(new Response(text,{status,headers:{'Content-Type':type}}));
 if(path==='/api/admin/resources'||path.startsWith('/api/admin/resources/'))return secure(await handleAdminResources(request,env));
 if(path.startsWith('/api/admin/')||path.startsWith('/api/activity/'))return secure(await handleAnalytics(request,env));
 if(path.startsWith('/api/teacher/'))return secure(await handleTeacher(request,env));
 if(path.startsWith('/api/exams/'))return secure(await handleExams(request,env));
 if(path==='/api/resources'||path.startsWith('/api/resources/'))return secure(await handleResources(request,env));
 if(path.startsWith('/api/'))return secure(await handleAuth(request,env.DB,{pepper:env.AUTH_PASSWORD_PEPPER,adminAccountIds:env.ADMIN_ACCOUNT_IDS}));
 if(path==='/auth/client.js')return content(clientJS,'text/javascript; charset=utf-8');
 if(path==='/auth/style.css')return content(styleCSS,'text/css; charset=utf-8');
 if(['/assets/texnikum-building-2026.jpg'].includes(path))return env.ASSETS.fetch(request);
 let user;try{user=await currentAccount(request,env.DB);}catch{if(path==='/login'||path==='/register')return content(loginHTML);return content('Hisob xizmati vaqtincha mavjud emas. Bir ozdan so‘ng qayta urinib ko‘ring.','text/plain; charset=utf-8',503);}
 if(path==='/login'||path==='/register')return user?secure(Response.redirect(url.origin+'/',303)):content(loginHTML);
 if(!user)return secure(Response.redirect(url.origin+'/login',303));
 if(path==='/account')return content(accountHTML);
 if(path==='/teacher/resources'||path==='/teacher/resources/client.js'){if(user.role!=='teacher')return content('Bu bo‘lim o‘qituvchilar uchun.','text/plain; charset=utf-8',403);return path==='/teacher/resources'?content(resourcesHTML):content(resourcesJS,'text/javascript; charset=utf-8');}
 if(path==='/controls'||path==='/controls/client.js'){if(user.role!=='student')return content('Bu bo‘lim o‘quvchilar uchun.','text/plain; charset=utf-8',403);return path==='/controls'?content(examHTML):content(examJS,'text/javascript; charset=utf-8');}
 if(path==='/teacher'||path.startsWith('/teacher/')){if(user.role!=='teacher')return content('Bu bo‘lim o‘qituvchilar uchun.','text/plain; charset=utf-8',403);if(path==='/teacher')return content(teacherHTML);if(path==='/teacher/client.js')return content(teacherJS,'text/javascript; charset=utf-8');if(path==='/teacher/style.css')return content(teacherCSS,'text/css; charset=utf-8');return content('Topilmadi.','text/plain',404);}
 if(path==='/admin'||path.startsWith('/admin/')){if(!isAdmin(user,env))return content('Admin panelga kirish huquqi yo‘q.','text/plain; charset=utf-8',403);if(path==='/admin/resources')return content(adminResourcesHTML);if(path==='/admin/resources/client.js')return content(adminResourcesJS,'text/javascript; charset=utf-8');if(path==='/admin')return content(adminHTML);if(path==='/admin/client.js')return content(adminJS,'text/javascript; charset=utf-8');if(path==='/admin/style.css')return content(adminCSS,'text/css; charset=utf-8');return content('Topilmadi.','text/plain',404);}
 if(path==='/'||path==='/index.html'){
  const scoped=courseHTML.replace('<script src="sidebar.js">', '<script>globalThis.webTalimAccountId='+JSON.stringify(user.id)+'</script><script src="sidebar.js">');
  const accountNav='<nav class="course-account-nav" aria-label="Hisob bo‘limlari">'+(isAdmin(user,env)?'<a class="course-admin-link" href="/admin">Admin panel</a>':'')+(user.role==='teacher'?'<a href="/teacher/resources">Mening resurslarim</a><a href="/teacher">Guruhlarim</a>':'<a href="/controls">Oraliq nazoratlar</a>')+'<a href="/account">Hisobim</a></nav>';
  const withNav=scoped.replace('<header>','<header class="course-header">').replace(/(<span id="crumb">[\s\S]*?<\/span>)/,'<div class="course-header-main">$1'+accountNav+'</div>').replace('</style>','</style><link rel="stylesheet" href="/account-nav.css">');
  const privateResources=user.role==='teacher'?'<link rel="stylesheet" href="/personal-resources.css"><script src="/personal-resources.js" type="module"></script>':'';
  const html=withNav.replace('</html>','<script src="assessment-versions.js"></script><script src="analytics-client.js"></script>'+privateResources+'</html>');return content(html);
 }
 if(!['GET','HEAD'].includes(request.method))return content('Usul qo‘llanmaydi.','text/plain',405);
 return secure(await env.ASSETS.fetch(request));
}
