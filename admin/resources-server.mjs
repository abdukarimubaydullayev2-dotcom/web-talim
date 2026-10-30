import {AuthError,currentAccount} from '../auth/service.mjs';
import {isAdmin} from '../auth/access.mjs';
import {resourceView,readResourceFile} from '../resources/server.mjs';
import assessments from '../analytics/assessments.json' with {type:'json'};
import catalog from '../auth/catalog.json' with {type:'json'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store'}});
const PAGE_SIZE=25;
function text(value,max){if(value.length>max||/[\x00-\x1f]/.test(value))throw new AuthError('Qidiruv matni juda uzun yoki noto‘g‘ri.');return value.trim();}
const like=value=>'%'+value.replace(/[!%_]/g,'!$&')+'%';
export function resourceFilters(params){const conditions=["r.status!='deleted'"],args=[];
 const module=params.get('moduleId'),lesson=params.get('lessonId');if(module!==null&&module!==''){const id=Number(module);if(!Number.isInteger(id)||id<1||id>8)throw new AuthError('Modul noto‘g‘ri.');conditions.push('r.module_id=?');args.push(id);}if(lesson!==null&&lesson!==''){const id=Number(lesson);if(!module||!Number.isInteger(id)||!assessments[Number(module)+':'+id])throw new AuthError('Mavzuni modulga mos tanlang.');conditions.push('r.lesson_id=?');args.push(id);}
 for(const [key,allowed] of [['kind',['assignment','presentation','video']],['source',['file','link']],['status',['pending','uploading','ready']]]){const value=params.get(key);if(value){if(!allowed.includes(value))throw new AuthError('Resurs filtri noto‘g‘ri.');conditions.push('r.'+key+'=?');args.push(value);}}
 const teacherId=params.get('teacherId');if(teacherId){if(!/^[a-f0-9-]{36}$/.test(teacherId))throw new AuthError('O‘qituvchi filtri noto‘g‘ri.');conditions.push('r.owner_id=?');args.push(teacherId);}
 const teacher=text(params.get('teacher')||'',120);if(teacher){conditions.push("(a.first_name||' '||a.last_name LIKE ? ESCAPE '!' OR a.last_name||' '||a.first_name LIKE ? ESCAPE '!' OR a.login LIKE ? ESCAPE '!')");args.push(like(teacher),like(teacher),like(teacher));}
 const q=text(params.get('q')||'',160);if(q){conditions.push("(r.title LIKE ? ESCAPE '!' OR r.description LIKE ? ESCAPE '!' OR r.file_name LIKE ? ESCAPE '!')");args.push(like(q),like(q),like(q));}
 const page=Number(params.get('page')||1);if(!Number.isInteger(page)||page<1||page>100000)throw new AuthError('Sahifa raqami noto‘g‘ri.');return {where:conditions.join(' AND '),args,page};
}
export async function handleAdminResources(request,env){try{
 const user=await currentAccount(request,env.DB);if(!user)throw new AuthError('Hisobga kiring.',401);if(!isAdmin(user,env))throw new AuthError('Admin huquqi kerak.',403);if(!['GET','HEAD'].includes(request.method))throw new AuthError('Bu bo‘lim faqat ko‘rish uchun.',405);
 const url=new URL(request.url),db=env.DB;
 if(url.pathname==='/api/admin/resources/options'&&request.method==='GET')return json({lessons:Object.values(assessments).map(x=>({moduleId:x.moduleId,lessonId:x.lessonId,title:x.title}))});
 if(url.pathname==='/api/admin/resources'&&request.method==='GET'){
  const f=resourceFilters(url.searchParams),from=' FROM teacher_resources r JOIN accounts a ON a.id=r.owner_id WHERE '+f.where;
  const summary=await db.prepare("SELECT COUNT(*) total,COUNT(DISTINCT r.owner_id) teachers,COALESCE(SUM(CASE WHEN r.status='ready' THEN 1 ELSE 0 END),0) ready,COALESCE(SUM(CASE WHEN r.source='file' THEN 1 ELSE 0 END),0) files"+from).bind(...f.args).first();
  const rows=(await db.prepare('SELECT r.*,a.first_name,a.last_name,a.login,a.college_id'+from+' ORDER BY r.created_at DESC,r.id LIMIT ? OFFSET ?').bind(...f.args,PAGE_SIZE,(f.page-1)*PAGE_SIZE).all()).results;
  return json({summary,total:summary.total,page:f.page,pageSize:PAGE_SIZE,resources:rows.map(r=>({...resourceView(r),teacher:{id:r.owner_id,firstName:r.first_name,lastName:r.last_name,login:r.login,college:catalog.colleges.find(c=>c.id===r.college_id)?.name||'Texnikum ko‘rsatilmagan'}}))});
 }
 const match=url.pathname.match(/^\/api\/admin\/resources\/([a-f0-9-]{36})\/file$/);if(match){const row=await db.prepare("SELECT * FROM teacher_resources WHERE id=? AND status!='deleted'").bind(match[1]).first();if(!row)throw new AuthError('Resurs topilmadi.',404);return await readResourceFile(request,env,row);}
 throw new AuthError('Manzil topilmadi.',404);
 }catch(e){if(e instanceof AuthError)return json({error:e.message},e.status);console.error('admin_resource_request_failed',{name:e?.name||'Error'});return json({error:'Resurslar hisobotini yuklab bo‘lmadi. Qayta urinib ko‘ring.'},503);}}
