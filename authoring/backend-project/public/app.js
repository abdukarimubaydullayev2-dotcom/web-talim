let csrf='',page=1;
const el=id=>document.getElementById(id);
function status(text,error=false){el('status').textContent=text;el('status').classList.toggle('error',error);}
async function api(url,{method='GET',body}={}){
  const res=await fetch(url,{method,credentials:'same-origin',headers:{...(body?{'Content-Type':'application/json'}:{}),...(method!=='GET'?{'X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=res.status===204?null:await res.json();
  if(!res.ok)throw new Error(data?.error||'So‘rov bajarilmadi');return data;
}
async function token(){csrf=(await api('/api/csrf')).csrfToken;}
async function showAccount(){
  try{const user=await api('/api/me');el('auth').hidden=true;el('workspace').hidden=false;el('profile').textContent=user.email;await loadTasks();}
  catch(err){el('auth').hidden=false;el('workspace').hidden=true;status(err.message);}
}
async function busy(fn){
  const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
  try{await fn();}catch(err){status(err.message,true);}finally{buttons.forEach(b=>b.disabled=false);el('prev').disabled=page<=1;}
}
async function loadTasks(){
  const data=await api(`/api/tasks?page=${page}&limit=10`);el('tasks').replaceChildren();el('empty').hidden=!!data.items.length;el('page').textContent=`${page}-sahifa`;
  for(const task of data.items){
    const li=document.createElement('li'),check=document.createElement('input'),span=document.createElement('span'),remove=document.createElement('button');
    check.type='checkbox';check.checked=task.done;check.setAttribute('aria-label',`${task.title} bajarildi`);span.textContent=task.title;remove.textContent='O‘chirish';remove.type='button';
    check.addEventListener('change',()=>busy(async()=>{await api('/api/tasks/'+task.id,{method:'PATCH',body:{done:check.checked}});await loadTasks();status('Holat saqlandi.');}).finally(()=>loadTasks().catch(()=>{})));
    remove.addEventListener('click',()=>busy(async()=>{await api('/api/tasks/'+task.id,{method:'DELETE'});await loadTasks();status('Vazifa o‘chirildi.');}));
    li.append(check,span,remove);el('tasks').append(li);
  }
  el('prev').disabled=page<=1;
}
el('auth-form').addEventListener('submit',event=>{event.preventDefault();busy(async()=>{
  const form=new FormData(event.target);const data=await api('/api/login',{method:'POST',body:{email:form.get('email'),password:form.get('password')}});
  csrf=data.csrfToken;event.target.reset();page=1;await showAccount();status('Tizimga kirdingiz.');
});});
el('signup').addEventListener('click',()=>busy(async()=>{
  const form=el('auth-form');if(!form.reportValidity())return;const body=new FormData(form);
  await api('/api/signup',{method:'POST',body:{email:body.get('email'),password:body.get('password')}});status('Hisob yaratildi. Endi shu ma’lumotlar bilan Kirish tugmasini bosing.');
}));
el('task-form').addEventListener('submit',event=>{event.preventDefault();busy(async()=>{
  const input=event.target.elements.title;await api('/api/tasks',{method:'POST',body:{title:input.value}});input.value='';page=1;await loadTasks();status('Vazifa saqlandi.');
});});
el('logout').addEventListener('click',()=>busy(async()=>{await api('/api/logout',{method:'POST'});await token();el('auth').hidden=false;el('workspace').hidden=true;status('Hisobdan chiqdingiz.');}));
el('prev').addEventListener('click',()=>busy(async()=>{if(page>1)page--;await loadTasks();}));
el('next').addEventListener('click',()=>busy(async()=>{page++;await loadTasks();}));
busy(async()=>{await token();await showAccount();});
