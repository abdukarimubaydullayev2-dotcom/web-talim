const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const index=fs.readFileSync('dist/index.html','utf8');
let serial=0;const nodes=new Map(),storage=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',textContent:'',value:'',hidden:false,children:[],lastElementChild:{querySelector:()=>true},setAttribute(k,v){this[k]=v},insertAdjacentHTML(p,s){this.innerHTML+=s},appendChild(x){this.children.push(x)},replaceChildren(...x){this.children=x},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},focus(){},scrollIntoView(){}});return nodes.get(id);}
const ctx=vm.createContext({document:{getElementById:node,querySelector:node,querySelectorAll:()=>[],createElement:()=>node('created-'+serial++)},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},select:id=>ctx.selected=id,showHome:()=>node('content').innerHTML='existing home',stopCodingLab(){},stopLessonVideos(){},ensureOnlineCompiler(){}});
vm.runInContext('let currentModule=8,currentLesson=1,slideIndex=0;'+fs.readFileSync('dist/integration-data.js','utf8')+'\n'+fs.readFileSync('dist/integration-module.js','utf8')+'\n'+fs.readFileSync('dist/integration-workspace.js','utf8')+'\nfunction activeData(){return integrationData[currentLesson]}\nfunction activeLesson(n){showIntegrationLesson(n)}\n'+index.slice(index.indexOf('function renderResources('),index.indexOf('const module2Groups='))+'\n'+index.slice(index.indexOf('function openResource('),index.indexOf('let currentLesson='))+'\nthis.data=integrationData;this.plan=integrationPlan;',ctx);
const {data,plan}=ctx;assert.equal(Object.keys(data).length,45);assert.equal(plan.groups.reduce((s,g)=>s+g.hours,0),90);assert.equal(plan.theoryHours,40);assert.equal(plan.practiceHours,50);
vm.runInContext('installIntegrationModule();showHome()',ctx);assert(node('content').innerHTML.includes('existing home'));assert.equal((node('modules').innerHTML.match(/id="m8l\d+"/g)||[]).length,45);
let videos=0;
for(let n=1;n<=45;n++){
 const d=data[n];assert.equal(d.number,n);assert.equal(d.quiz.length,10);assert.equal(d.qa.length,10);assert.equal(d.slides.length,15);assert.equal(new Set(d.quiz.map(q=>q.q)).size,10);
 assert.equal(!!d.assignment,n%9===0||((n-1)%9)%2===1);assert(d.html.includes('Atamalar'));assert(d.html.includes('<pre')); assert(fs.existsSync('dist/'+d.download));
 for(const q of d.quiz){assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert(q.correct>=0&&q.correct<4);}
 if(d.videos.length)videos++;
 for(const v of d.videos)assert(/^[\w-]{11}$/.test(v.id));
 vm.runInContext(`showIntegrationLesson(${n})`,ctx);assert.equal(ctx.selected,'m8l'+n);assert(node('content').innerHTML.includes(`${n}-MAVZU`));
 const tabs=node('.resource-tabs').innerHTML;assert(tabs.indexOf('Nazariy savollar')<tabs.indexOf('Test sinovi'));
 if(d.assignment){assert(tabs.indexOf('Nazariy savollar')<tabs.indexOf('Amaliy topshiriq'));assert(tabs.indexOf('Amaliy topshiriq')<tabs.indexOf('Test sinovi'));}
 else assert(!tabs.includes('Amaliy topshiriq'));
 if(d.videos.length)assert(tabs.indexOf('Video dars')<tabs.indexOf('Mavzu konspekti'));
 assert.equal((node('panel3').innerHTML.match(/<fieldset>/g)||[]).length,10);
 if(n===45)assert(!node('content').innerHTML.includes('showIntegrationLesson(71)'));
}
for(const score of [0,5,6,10]){
 vm.runInContext('currentLesson=32',ctx);node('quiz').querySelector=selector=>{const i=Number(selector.match(/q(\d+)/)[1]);return {value:i<score?data[32].quiz[i].correct:(data[32].quiz[i].correct+1)%4};};
 vm.runInContext('finishQuiz({preventDefault(){}})',ctx);const out=node('quiz-result').innerHTML;
 assert(out.includes(`<strong>${score*10}%</strong>`));assert(out.includes(score>=6?'Keyingi mavzuga o‘tish':'Mavzuni qayta o‘qish →'));
}
vm.runInContext('currentLesson=45',ctx);node('quiz').querySelector=s=>({value:data[45].quiz[Number(s.match(/q(\d+)/)[1])].correct});vm.runInContext('finishQuiz({preventDefault(){}})',ctx);assert(node('quiz-result').innerHTML.includes('Modul yakunlandi'));
for(let i=0;i<5;i++){vm.runInContext(`showIntegrationPart(${i})`,ctx);assert(node('content').innerHTML.includes(`${i+1}-BO‘LIM`));}
vm.runInContext('showIntegrationOverview()',ctx);for(const file of ['m8-integration-ish-reja.docx','m8-integration-konspektlar.zip','m8-integration-loyiha.zip']){assert(fs.existsSync('dist/materials/'+file));assert(node('content').innerHTML.includes(file));}

assert(index.includes('8:integrationData'));assert(index.includes('8:45'));assert(index.includes('installIntegrationModule()'));
let lastWorker,timerCallback;
ctx.setTimeout=cb=>{timerCallback=cb;return 1;};ctx.clearTimeout=()=>{};
ctx.Worker=class{constructor(url){assert.equal(url,'integration-js-worker.js');lastWorker=this;}postMessage(x){this.sent=x;}terminate(){this.stopped=true;}};
vm.runInContext('currentLesson=4;renderResources(activeData());runIntegrationJS()',ctx);
assert(lastWorker.sent.code.includes('validTitle'));assert.equal(node('it-run').disabled,true);
const old=lastWorker;vm.runInContext('runIntegrationJS()',ctx);assert(old.stopped);
lastWorker.onmessage({data:{type:'done',lines:['<script>bad()</script>'],checks:3}});
assert(lastWorker.stopped);assert.equal(node('it-run').disabled,false);assert.equal(node('it-output').textContent,'<script>bad()</script>');assert.equal(node('it-output').innerHTML,'');
vm.runInContext('runIntegrationJS()',ctx);lastWorker.onmessage({data:{type:'error',message:'Assertion: title',lines:[]}});assert(node('it-status').textContent.includes('Kod xatosi'));assert(lastWorker.stopped);
vm.runInContext('runIntegrationJS()',ctx);timerCallback();assert(lastWorker.stopped);assert(node('it-status').textContent.includes('5 soniyalik'));
vm.runInContext('runIntegrationJS();stopIntegrationJS()',ctx);assert(lastWorker.stopped);
for(const [,body] of index.matchAll(/<script>([\s\S]*?)<\/script>/g))new Function(body);
console.log('45 routes, 5 sections, 20 theory/25 practice, 675 slides, 450 QAs/MCQs, 50/60% boundary, final route and Run/cancel/error/timeout passed; browser layout unverified.');
