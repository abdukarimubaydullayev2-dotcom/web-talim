(()=>{
 const account=globalThis.webTalimAccountId;if(!account)return;
 const storageKey='web-talim:activity-queue:'+account;let queue=[],running=false,timer=null;
 try{queue=JSON.parse(localStorage.getItem(storageKey)||'[]');if(!Array.isArray(queue))queue=[];queue=queue.filter(x=>x&&['/api/activity/event','/api/activity/test'].includes(x.path)&&/^[a-zA-Z0-9-]{16,80}$/.test(x.body?.clientId||''));}catch{}
 const persist=()=>{try{localStorage.setItem(storageKey,JSON.stringify(queue));}catch{}};
 function status(id,text,error=false){const el=document.querySelector('[data-attempt-save="'+id+'"]');if(el){el.textContent=text;el.style.color=error?'#a03329':'#176f58';}}
 async function flush(){if(running||!queue.length||!navigator.onLine)return;running=true;clearTimeout(timer);try{while(queue.length){const item=queue[0];const response=await fetch(item.path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(item.body)});const data=await response.json();
  if(response.ok){queue.shift();persist();if(item.path.endsWith('/test'))status(item.body.clientId,data.result?'✓ Natija hisobingizga saqlandi: '+data.result.percent+'% ('+data.result.correct+'/'+data.result.total+').':'✓ Natija hisobingizga saqlandi.');continue;}
  if([400,409].includes(response.status)){queue.shift();persist();status(item.body.clientId,data.error||'Natijani saqlab bo‘lmadi. Sahifani yangilang.',true);continue;}
  status(item.body.clientId,response.status===401?'Natijani saqlash uchun hisobga qayta kiring.':'Natija yuborilmadi. Ulanish tiklanganda qayta yuboriladi.',true);break;
 }}catch{const item=queue[0];if(item)status(item.body.clientId,'Natija navbatda. Internet tiklanganda yuboriladi.',true);}finally{running=false;if(queue.length)timer=setTimeout(flush,15000);}}
 function enqueue(path,body){if(queue.length>=300){status(body.clientId,'Saqlash navbati to‘ldi. Internetni tekshiring.',true);return;}queue.push({path,body});persist();flush();}
 const baseRender=renderResources;renderResources=function(data){const value=baseRender(data);if(data)enqueue('/api/activity/event',{clientId:crypto.randomUUID(),kind:'lesson_open',moduleId:currentModule,lessonId:currentLesson});return value;};
 const baseFinish=finishQuiz;finishQuiz=function(event){const qs=activeData().quiz,form=document.getElementById('quiz'),answers=qs.map((q,i)=>{const x=form.querySelector(`input[name="q${i}"]:checked`);return x?Number(x.value):null;}),moduleId=currentModule,lessonId=currentLesson,version=globalThis.webTalimAssessmentVersions?.[moduleId+':'+lessonId],clientId=crypto.randomUUID();const result=baseFinish(event);
  const message=document.createElement('p');message.dataset.attemptSave=clientId;message.textContent='Natija hisobingizga yuborilmoqda…';document.getElementById('quiz-result').appendChild(message);
  if(!version){status(clientId,'Test versiyasi yuklanmadi. Sahifani yangilang.',true);return result;}enqueue('/api/activity/test',{clientId,moduleId,lessonId,version,answers});return result;
 };
 window.addEventListener('online',flush);document.addEventListener('visibilitychange',()=>{if(!document.hidden)flush();});enqueue('/api/activity/event',{clientId:crypto.randomUUID(),kind:'visit'});
})();
