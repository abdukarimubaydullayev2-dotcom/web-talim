const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const index=fs.readFileSync('course/index.html','utf8');
let serial=0;const nodes=new Map(),storage=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',textContent:'',value:'',hidden:false,children:[],lastElementChild:{querySelector:()=>true},setAttribute(k,v){this[k]=v},insertAdjacentHTML(p,s){this.innerHTML+=s},appendChild(x){this.children.push(x)},replaceChildren(...x){this.children=x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},focus(){},scrollIntoView(){}});return nodes.get(id);}
const ctx=vm.createContext({document:{getElementById:node,querySelector:node,querySelectorAll:()=>[],createElement:()=>node('created-'+serial++)},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},select:id=>ctx.selected=id,showHome:()=>node('content').innerHTML='existing home',stopCodingLab(){},stopLessonVideos(){},ensureOnlineCompiler(){}});
vm.runInContext('let currentModule=7,currentLesson=1,slideIndex=0;'+fs.readFileSync('course/database-data.js','utf8')+'\n'+fs.readFileSync('course/database-module.js','utf8')+'\n'+fs.readFileSync('course/database-workspace.js','utf8')+'\nfunction activeData(){return databaseData[currentLesson]}\nfunction activeLesson(n){showDatabaseLesson(n)}\n'+index.slice(index.indexOf('function renderResources('),index.indexOf('const module2Groups='))+'\n'+index.slice(index.indexOf('function openResource('),index.indexOf('let currentLesson='))+'\nthis.data=databaseData;this.plan=databasePlan;',ctx);
const {data,plan}=ctx;assert.equal(Object.keys(data).length,70);assert.equal(plan.groups.reduce((s,g)=>s+g.hours,0),140);assert.equal(plan.theoryHours,70);assert.equal(plan.practiceHours,70);
vm.runInContext('installDatabaseModule();showHome()',ctx);assert(node('content').innerHTML.includes('existing home'));assert.equal((node('modules').innerHTML.match(/id="m7l\d+"/g)||[]).length,70);
let videos=0;
for(let n=1;n<=70;n++){
 const d=data[n];assert.equal(d.number,n);assert.equal(d.quiz.length,10);assert.equal(d.qa.length,10);assert.equal(d.slides.length,15);assert.equal(new Set(d.quiz.map(q=>q.q)).size,10);
 assert.equal(!!d.assignment,n%2===0);assert(d.html.includes('Atamalar'));assert(d.html.includes('<pre')); assert(fs.existsSync('course/'+d.download));
 for(const q of d.quiz){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(q.correct>=0&&q.correct<4);}
 if(d.videos.length)videos++;
 for(const v of d.videos)assert(/^[\w-]{11}$/.test(v.id));
 vm.runInContext(`showDatabaseLesson(${n})`,ctx);assert.equal(ctx.selected,'m7l'+n);assert(node('content').innerHTML.includes(`${n}-MAVZU`));
 const tabs=node('.resource-tabs').innerHTML;assert(tabs.indexOf('Nazariy savollar')<tabs.indexOf('Test sinovi'));
 if(d.assignment){assert(tabs.indexOf('Nazariy savollar')<tabs.indexOf('Amaliy topshiriq'));assert(tabs.indexOf('Amaliy topshiriq')<tabs.indexOf('Test sinovi'));}
 else assert(!tabs.includes('Amaliy topshiriq'));
 if(d.videos.length)assert(tabs.indexOf('Video dars')<tabs.indexOf('Mavzu konspekti'));
 assert.equal((node('panel3').innerHTML.match(/<fieldset>/g)||[]).length,10);
 if(n===70)assert(!node('content').innerHTML.includes('showDatabaseLesson(71)'));
}
for(const score of [0,5,6,10]){
 vm.runInContext('currentLesson=46',ctx);node('quiz').querySelector=selector=>{const i=Number(selector.match(/q(\d+)/)[1]);return {value:i<score?data[46].quiz[i].correct:(data[46].quiz[i].correct+1)%4};};
 vm.runInContext('finishQuiz({preventDefault(){}})',ctx);const out=node('quiz-result').innerHTML;
 assert(out.includes(`<strong>${score*10}%</strong>`));assert(out.includes(score>=6?'Keyingi mavzuga o‘tish':'Mavzuni qayta o‘qish →'));
}
vm.runInContext('currentLesson=70',ctx);node('quiz').querySelector=s=>({value:data[70].quiz[Number(s.match(/q(\d+)/)[1])].correct});vm.runInContext('finishQuiz({preventDefault(){}})',ctx);assert(node('quiz-result').innerHTML.includes('Modul yakunlandi'));
for(let i=0;i<7;i++){vm.runInContext(`showDatabasePart(${i})`,ctx);assert(node('content').innerHTML.includes(`${i+1}-BO‘LIM`));}
vm.runInContext('showDatabaseOverview()',ctx);for(const file of ['m7-database-ish-reja.docx','m7-database-konspektlar.zip','m7-database-loyiha.zip']){assert(fs.existsSync('course/materials/'+file));assert(node('content').innerHTML.includes(file));}

assert(index.includes('7:databaseData'));assert(index.includes('7:70'));assert(index.includes('installDatabaseModule()'));
let lastWorker,timerCallback;
ctx.setTimeout=cb=>{timerCallback=cb;return 1;};ctx.clearTimeout=()=>{};
ctx.Worker=class{constructor(url){assert.equal(url,'database-sql-worker.js');lastWorker=this;}postMessage(x){this.sent=x;}terminate(){this.stopped=true;}};
vm.runInContext('currentLesson=24;renderResources(activeData());runDatabaseSQL()',ctx);
assert.equal(lastWorker.sent.type,'run');assert(lastWorker.sent.fixture.includes('CREATE TABLE books'));
assert.equal(node('db-run').disabled,true);const old=lastWorker;
vm.runInContext('runDatabaseSQL()',ctx);assert(old.stopped);
lastWorker.onmessage({data:{type:'done',version:'test',results:[{columns:['title'],values:[['<script>bad()</script>']],truncated:false}],bytes:new Uint8Array([1])}});
assert(lastWorker.stopped);assert.equal(node('db-run').disabled,false);assert.equal(node('db-export').disabled,false);
const wrap=node('db-results').children.at(-1),table=wrap.children[0],tbody=table.children[1],td=tbody.children[0].children[0];assert.equal(td.textContent,'<script>bad()</script>');assert.equal(td.innerHTML,'');
vm.runInContext('runDatabaseSQL()',ctx);lastWorker.onmessage({data:{type:'error',message:'syntax error'}});assert(node('db-status').textContent.includes('SQL xatosi'));assert(lastWorker.stopped);
vm.runInContext('runDatabaseSQL()',ctx);timerCallback();assert(lastWorker.stopped);assert(node('db-status').textContent.includes('8 soniyalik'));
for(const [,body] of index.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(body);
console.log(`70 lesson render/navigation paths, 7 sections, 35 staged assignments, 1050 slides, 700 QAs and MCQs, ${videos} video topics, 50/60% grading boundary, final route, Run/cancel/error/timeout and text-only result rendering passed. Browser layout remains unverified.`);
