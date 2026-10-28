const base=process.argv[2]||'http://127.0.0.1:3000';
for(const path of ['/health/ready','/','/api/tasks']){const r=await fetch(new URL(path,base),{signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error(path+': HTTP '+r.status);if(path==='/api/tasks'&&!Array.isArray((await r.json()).tasks))throw new Error('tasks array kerak');console.log('PASS',path);}
