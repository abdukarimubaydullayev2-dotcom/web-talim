const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process'),os=require('node:os'),path=require('node:path');
const index=fs.readFileSync('course/index.html','utf8');
const nodes=new Map(),storage=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',textContent:'',value:'',hidden:false,children:[],lastElementChild:{querySelector:()=>true},setAttribute(k,v){this[k]=v},insertAdjacentHTML(p,s){this.innerHTML+=s},appendChild(x){this.children.push(x)},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},focus(){},scrollIntoView(){}});return nodes.get(id);}
const ctx=vm.createContext({document:{getElementById:node,querySelector:node,querySelectorAll:()=>[],createElement:()=>({innerHTML:'',setAttribute(){},querySelectorAll(){return[]}})},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},select:id=>ctx.selected=id,showHome:()=>node('content').innerHTML='existing home',stopCodingLab(){},stopLessonVideos(){},ensureOnlineCompiler(){}});
vm.runInContext('let currentModule=6,currentLesson=1,slideIndex=0;'+fs.readFileSync('course/backend-data.js','utf8')+'\n'+fs.readFileSync('course/backend-module.js','utf8')+'\n'+fs.readFileSync('course/backend-workspace.js','utf8')+'\nfunction activeData(){return backendData[currentLesson]}\nfunction activeLesson(n){showBackendLesson(n)}\n'+index.slice(index.indexOf('function renderResources('),index.indexOf('const module2Groups='))+'\n'+index.slice(index.indexOf('function openResource('),index.indexOf('let currentLesson='))+'\nthis.data=backendData;this.plan=backendPlan;',ctx);
const {data,plan}=ctx;assert.equal(Object.keys(data).length,90);assert.equal(plan.groups.reduce((s,g)=>s+g.hours,0),180);assert.equal(plan.theoryHours,90);assert.equal(plan.practiceHours,90);
vm.runInContext('installBackendModule();showHome()',ctx);assert(node('content').innerHTML.includes('existing home'));assert.equal((node('modules').innerHTML.match(/id="m6l\d+"/g)||[]).length,90);
let videos=0;
for(let n=1;n<=90;n++){
 const d=data[n];assert.equal(d.number,n);assert.equal(d.quiz.length,10);assert.equal(d.qa.length,10);assert.equal(d.slides.length,15);assert.equal(new Set(d.quiz.map(q=>q.q)).size,10);
 assert.equal(!!d.assignment,n%2===0);assert(d.html.includes('Atamalar'));assert(d.html.length>2500);assert(fs.existsSync('course/'+d.download));
 for(const q of d.quiz){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(q.correct>=0&&q.correct<4);}
 if(d.videos.length)videos++;
 for(const v of d.videos)assert(/^[\w-]{11}$/.test(v.id));
 vm.runInContext(`showBackendLesson(${n})`,ctx);assert.equal(ctx.selected,'m6l'+n);assert(node('content').innerHTML.includes(`${n}-MAVZU`));
 const tabs=node('.resource-tabs').innerHTML;assert(tabs.indexOf('Nazariy savollar')<tabs.indexOf('Test sinovi'));
 if(d.assignment){assert(tabs.indexOf('Nazariy savollar')<tabs.indexOf('Amaliy topshiriq'));assert(tabs.indexOf('Amaliy topshiriq')<tabs.indexOf('Test sinovi'));}
 else assert(!tabs.includes('Amaliy topshiriq'));
 if(d.videos.length)assert(tabs.indexOf('Video dars')<tabs.indexOf('Mavzu konspekti'));
 assert.equal((node('panel3').innerHTML.match(/<fieldset>/g)||[]).length,10);
 if(n===90)assert(!node('content').innerHTML.includes('showBackendLesson(91)'));
}
for(const score of [0,5,6,10]){
 vm.runInContext('currentLesson=46',ctx);node('quiz').querySelector=selector=>{const i=Number(selector.match(/q(\d+)/)[1]);return {value:i<score?data[46].quiz[i].correct:(data[46].quiz[i].correct+1)%4};};
 vm.runInContext('finishQuiz({preventDefault(){}})',ctx);const out=node('quiz-result').innerHTML;
 assert(out.includes(`<strong>${score*10}%</strong>`));assert(out.includes(score>=6?'Keyingi mavzuga o‘tish':'Mavzuni qayta o‘qish →'));
}
vm.runInContext('currentLesson=90',ctx);node('quiz').querySelector=s=>({value:data[90].quiz[Number(s.match(/q(\d+)/)[1])].correct});vm.runInContext('finishQuiz({preventDefault(){}})',ctx);assert(node('quiz-result').innerHTML.includes('Modul yakunlandi'));
for(let i=0;i<9;i++){vm.runInContext(`showBackendPart(${i})`,ctx);assert(node('content').innerHTML.includes(`${i+1}-BO‘LIM`));}
vm.runInContext('showBackendOverview()',ctx);for(const file of ['m6-backend-ish-reja.docx','m6-backend-konspektlar.zip','m6-backend-loyiha.zip']){assert(fs.existsSync('course/materials/'+file));assert(node('content').innerHTML.includes(file));}
// Execute independent Node examples in isolated temporary directories.
const expected={7:'Dars',8:'Dars',10:'A\nB\nC',13:'Dars\nnull',14:'{"id":1,"title":"Dars","done":false}\n1',15:'1',16:'{"limit":10,"offset":10}',21:'1\nDars',23:'32 64',24:'true',26:'true\nfalse',27:'true false',28:'null\n{"done":true}',29:'<b>Dars</b>',30:'{"method":"POST","path":"/api/login","status":401}',35:'200 true',37:'https://example.test\nfalse'};
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'backend-examples-'));
try{for(const [unit,want] of Object.entries(expected)){const code=data[Number(unit)*2].assignment.code;const file=path.join(dir,'example-'+unit+'.cjs');fs.writeFileSync(file,code);const got=execFileSync(process.execPath,[file],{cwd:dir,encoding:'utf8',timeout:10000,stdio:['ignore','pipe','pipe']}).trim();assert.equal(got,want,'Node example unit '+unit);}}
finally{fs.rmSync(dir,{recursive:true,force:true});}
// SQLite samples are run against a known fixture with real SQLite.
const {DatabaseSync}=require('node:sqlite');
for(const unit of [17,18,19,20]){
 vm.runInContext(`currentLesson=${unit*2}`,ctx);node('be-code').value=data[unit*2].assignment.code;
 const code=vm.runInContext('backendCompilerCode()',ctx),db=new DatabaseSync(':memory:');db.exec(code);
 if(unit===19)assert.equal(db.prepare('SELECT done FROM tasks WHERE id=1').get().done,0);
 if(unit===20)assert.equal(db.prepare('SELECT COUNT(*) AS n FROM users').get().n,2);db.close();
}
assert(index.includes('6:backendData'));assert(index.includes('6:90'));assert(index.includes('installBackendModule()'));
// The visible Run control must send the documented event to the selected iframe.
const events=[],listeners={};let frame;
const compilerCtx=vm.createContext({activeData:()=>data[14],document:{getElementById:node,querySelectorAll:()=>[],createElement:()=>frame={style:'',contentWindow:{postMessage:(payload,origin)=>events.push({payload,origin})},addEventListener:(name,fn)=>{frame[name]=fn}}},window:{addEventListener:(name,fn)=>listeners[name]=fn,removeEventListener:name=>delete listeners[name]},localStorage:{getItem:()=>null,setItem(){}},backendEscape:String});
node('be-code').value=data[14].assignment.code;node('be-report').value='';
vm.runInContext(fs.readFileSync('course/backend-workspace.js','utf8')+'\nopenBackendCompiler()',compilerCtx);frame.load();vm.runInContext('runBackendCompiler()',compilerCtx);
assert(events.some(e=>e.payload.eventType==='populateCode'&&e.origin==='https://onecompiler.com'));
assert(events.some(e=>e.payload.eventType==='triggerRun'&&e.origin==='https://onecompiler.com'));
const before=node('be-code').value;listeners.message({source:frame.contentWindow,origin:'https://wrong.example',data:{files:[{content:'wrong'}]}});assert.equal(node('be-code').value,before);
vm.runInContext('stopBackendWorkspace()',compilerCtx);assert(!listeners.message);
for(const [,body] of index.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(body);
console.log(`90 lessons/routes, 9 sections, 45 staged assignments, 1350 slides, 900 QAs/MCQs, ${videos} video topics, 50/60% boundary, 17 Node examples and 4 SQLite fixtures passed. Browser and external player rendering remain unverified.`);
