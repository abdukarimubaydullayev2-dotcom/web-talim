import {plainText} from '../analytics/plain-text.mjs';
import {currentAccount} from '../auth/service.mjs';
import assessments from '../analytics/assessments.json' with {type:'json'};
import {all,first,json,AuthError,isAdmin,teacher} from './common.mjs';
import {courses} from './courses.mjs';
import {tasks} from './tasks.mjs';
import {files} from './files.mjs';
import {insights,subjectNames} from './insights.mjs';
import {dashboard} from './dashboard.mjs';
export async function handleLearning(request,env){try{const user=await currentAccount(request,env.DB);if(!user)throw new AuthError('Hisobga kiring.',401);const url=new URL(request.url),path=url.pathname.slice('/api/learning'.length)||'/';if(!['GET','HEAD','POST'].includes(request.method))throw new AuthError('Usul qo‘llanmaydi.',405);if(request.method==='POST'){if(request.headers.get('Origin')!==url.origin||request.headers.get('Sec-Fetch-Site')==='cross-site')throw new AuthError('So‘rov manbasi tasdiqlanmadi.',403);const now=Date.now(),key='learning:'+user.id;const n=await first(env.DB,'INSERT INTO auth_rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END RETURNING count',[key,now+60000,now,now]);if(n.count>120)throw new AuthError('So‘rovlar ko‘paydi. Bir daqiqadan so‘ng davom eting.',429);}
 if(path==='/options'&&request.method==='GET'){const groups=user.role==='teacher'?await all(env.DB,'SELECT id,name FROM teaching_groups WHERE owner_id=? AND college_id=? ORDER BY name',[user.id,user.college_id]):[];const insightGroups=isAdmin(user,env)?await all(env.DB,"SELECT g.id,g.name||' · '||a.first_name||' '||a.last_name name FROM teaching_groups g JOIN accounts a ON a.id=g.owner_id WHERE a.role='teacher' AND a.college_id=g.college_id ORDER BY g.name,a.last_name LIMIT 1000"):groups;return json({user:{id:user.id,role:user.role,name:user.first_name+' '+user.last_name,isAdmin:isAdmin(user,env)},groups,insightGroups,subjects:Object.entries(subjectNames).map(([id,title])=>({id:Number(id),title})),lessons:Object.values(assessments).map(a=>({moduleId:a.moduleId,lessonId:a.lessonId,title:plainText(a.title)}))});}
 for(const handler of [courses,tasks,files,insights,dashboard]){const response=await handler(request,env,user,path,url);if(response)return response;}
 throw new AuthError('Manzil topilmadi.',404);
 }catch(e){if(e instanceof AuthError)return json({error:e.message},e.status);console.error('learning_request_failed',{name:e?.name||'Error'});return json({error:'O‘quv xizmatida vaqtinchalik xato. Sahifani yangilab qayta urinib ko‘ring.'},503);}}
