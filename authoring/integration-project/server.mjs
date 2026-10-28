import http from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {randomUUID} from 'node:crypto';
import {openStore,validTitle} from './store.mjs';
const root=dirname(fileURLToPath(import.meta.url));
const assets={'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/style.css':['style.css','text/css; charset=utf-8']};
async function jsonBody(req){
 const parts=[];let size=0;
 for await(const chunk of req){size+=chunk.length;if(size>16384){const e=new Error('Tana 16 KiBdan oshdi');e.status=413;throw e;}parts.push(chunk);}
 try{return JSON.parse(Buffer.concat(parts).toString('utf8'));}catch{const e=new Error('JSON noto‘g‘ri');e.status=400;throw e;}
}
export function createApp({store=openStore(),logger=console.log}={}){
 const server=http.createServer(async(req,res)=>{
  const start=performance.now(),requestId=randomUUID();let pathname='invalid';
  res.setHeader('X-Request-Id',requestId);res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  res.on('finish',()=>logger(JSON.stringify({requestId,method:req.method,pathname,status:res.statusCode,ms:Math.round(performance.now()-start)})));
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(body));};
  const error=(status,code,message)=>send(status,{error:{code,message}});
  try{
   const url=new URL(req.url,'http://localhost');pathname=url.pathname;
   if(req.method==='GET'&&pathname==='/health/live')return send(200,{status:'live'});
   if(req.method==='GET'&&pathname==='/health/ready'){try{if(store.ready())return send(200,{status:'ready'});}catch{}return error(503,'NOT_READY','Baza tayyor emas');}
   if(req.method==='GET'&&assets[pathname]){const [name,type]=assets[pathname];res.writeHead(200,{'Content-Type':type});return res.end(await readFile(join(root,'public',name)));}
   if(pathname==='/api/tasks'&&req.method==='GET'){
    const done=url.searchParams.get('done');if(done!==null&&!['0','1'].includes(done))return error(400,'INVALID_FILTER','done 0 yoki 1 bo‘lsin');
    return send(200,store.list(done===null?undefined:Number(done)));
   }
   if(pathname==='/api/tasks'&&req.method==='POST'){
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return error(415,'JSON_REQUIRED','application/json kerak');
    const body=await jsonBody(req);if(!body||!validTitle(body.title))return error(400,'INVALID_TITLE','Vazifa nomi 1–80 belgi bo‘lsin');
    return send(201,{task:store.create(body.title)});
   }
   const match=pathname.match(/^\/api\/tasks\/([1-9]\d*)$/);
   if(match&&['PATCH','DELETE'].includes(req.method)){
    const id=Number(match[1]);if(!Number.isSafeInteger(id))return error(400,'INVALID_ID','id noto‘g‘ri');
    if(req.method==='DELETE'){if(!store.remove(id))return error(404,'NOT_FOUND','Vazifa topilmadi');res.writeHead(204);return res.end();}
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return error(415,'JSON_REQUIRED','application/json kerak');
    const body=await jsonBody(req);if(!body||typeof body.done!=='boolean')return error(400,'INVALID_DONE','done boolean bo‘lsin');
    const task=store.update(id,body.done);return task?send(200,{task}):error(404,'NOT_FOUND','Vazifa topilmadi');
   }
   error(404,'NOT_FOUND','Manzil topilmadi');
  }catch(e){if(res.destroyed||res.headersSent)return;error(e.status||500,e.status?'INVALID_BODY':'INTERNAL',e.status?e.message:'Ichki xato');}
 });
 server.requestTimeout=10000;server.headersTimeout=10000;
 return {server,store,async close(){await new Promise((yes,no)=>server.close(e=>e?no(e):yes()));store.close();}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const dataDir=resolve(process.env.DATA_DIR||join(root,'data'));await mkdir(dataDir,{recursive:true});
 const port=Number(process.env.PORT||3000);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT 1..65535 bo‘lsin');
 const app=createApp({store:openStore(join(dataDir,'tasks.sqlite'))});app.server.listen(port,'0.0.0.0',()=>console.log(`Demo: http://localhost:${port} (faqat o‘quv ma’lumotlari)`));
 let stopping=false;async function stop(){if(stopping)return;stopping=true;const timer=setTimeout(()=>process.exit(1),8000);timer.unref();try{await app.close();clearTimeout(timer);process.exitCode=0;}catch{process.exitCode=1;}}
 process.on('SIGINT',stop);process.on('SIGTERM',stop);
}
