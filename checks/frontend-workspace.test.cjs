const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),storage=new Map();
function get(id){if(!nodes.has(id))nodes.set(id,{id,innerHTML:'',textContent:'',value:'',hidden:false,children:[],setAttribute(k,v){this[k]=v},appendChild(x){this.children.push(x)},querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},focus(){},scrollIntoView(){},remove(){nodes.delete(this.id)}});return nodes.get(id)}
const context=vm.createContext({document:{getElementById:get,querySelector:s=>get(s),querySelectorAll:()=>[],createElement:()=>({innerHTML:'',setAttribute(){},querySelectorAll(){return[]}})},window:{addEventListener(){},removeEventListener(){}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},stopCodingLab(){},ensureOnlineCompiler(){},stopLessonVideos(){},showHome(){},showFrontendLesson(){}});
const index=fs.readFileSync('dist/index.html','utf8');
vm.runInContext('let currentModule=5,currentLesson=1,slideIndex=0;'+fs.readFileSync('dist/frontend-data.js','utf8')+'\n'+fs.readFileSync('dist/frontend-resources.js','utf8')+'\n'+fs.readFileSync('dist/frontend-module.js','utf8')+'\n'+fs.readFileSync('dist/frontend-workspace.js','utf8')+'\nfunction activeData(){return frontendData[currentLesson]}\n'+index.slice(index.indexOf('function renderResources('),index.indexOf('const module2Groups='))+'\n'+index.slice(index.indexOf('function openResource('),index.indexOf('let currentLesson=')),context);
for(let n=1;n<=110;n++){
 vm.runInContext(`currentLesson=${n};slideIndex=0;renderResources(activeData())`,context);
 const panel=get('.article').children.at(-1);if(n===5){assert(panel.innerHTML.includes('id="fe-html"'));assert(!panel.innerHTML.includes('id="fe-css"'));assert(!panel.innerHTML.includes('id="fe-js"'));}if(n===13){assert(panel.innerHTML.includes('id="fe-css"'));assert(!panel.innerHTML.includes('id="fe-js"'));}const tabs=get('.resource-tabs').innerHTML;if(n<=3)assert(!tabs.includes('Amaliy topshiriq'));else assert(tabs.indexOf('Amaliy topshiriq')<tabs.indexOf('Nazariy savollar'));assert(tabs.indexOf('Nazariy savollar')<tabs.indexOf('Test sinovi'));
 assert.equal((get('panel3').innerHTML.match(/<fieldset>/g)||[]).length,10);assert(get('panel2').innerHTML.includes('Javob:'));
 for(let i=0;i<6;i++){vm.runInContext(`openResource(${i})`,context);assert.equal(get('panel'+i).hidden,false)}
}
for(const correct of [0,5,6,10]){
 vm.runInContext('currentLesson=47',context);const qs=vm.runInContext('activeData().quiz',context);
 get('quiz').querySelector=selector=>{const i=Number(selector.match(/q(\d+)/)[1]);return {value:i<correct?qs[i].correct:(qs[i].correct+1)%4}};
 vm.runInContext('finishQuiz({preventDefault(){}})',context);const out=get('quiz-result').innerHTML;assert(out.includes(`<strong>${correct*10}%</strong>`));assert(out.includes(correct>=6?'Keyingi mavzuga o‘tish':'Mavzuni qayta o‘qish →'));
}
vm.runInContext('currentLesson=110',context);get('quiz').querySelector=selector=>({value:vm.runInContext('activeData().quiz',context)[Number(selector.match(/q(\d+)/)[1])].correct});vm.runInContext('finishQuiz({preventDefault(){}})',context);assert(get('quiz-result').innerHTML.includes('Modul yakunlandi'));
const fragment=vm.runInContext(`frontendDocument({html:'<h1>Hello</h1>',css:'h1{color:red}',js:'console.log(1)'})`,context);assert(fragment.includes('<script>console.log(1)</script>'));
const full=vm.runInContext(`frontendDocument({html:'<!doctype html><html><head><title>T</title></head><body><h1>T</h1></body></html>',css:'',js:'console.log(2)'},'<meta name="test">')`,context);assert.equal((full.match(/<html>/g)||[]).length,1);assert(full.indexOf('<meta name="test">')<full.indexOf('<title>'));
vm.runInContext('currentLesson=37',context);assert(vm.runInContext(`frontendDocument({html:'<p>Hi</p>',css:'',js:''})`,context).includes('bootstrap@5.3.8'));
console.log('110 resource render paths; tab order, 10-question tests, 50/60% boundary, final lesson and full/fragment HTML composition passed. Browser rendering remains unverified.');

assert(vm.runInContext(`frontendStageError({html:'<style>p{color:red}</style>',css:'',js:''},'html')`,context));
assert(vm.runInContext(`frontendStageError({html:'<script>console.log(1)</script>',css:'',js:''},'html')`,context));
assert(vm.runInContext(`frontendStageError({html:'<button onclick="x()">Go</button>',css:'',js:''},'css')`,context));
assert.equal(vm.runInContext(`frontendStageError({html:'<h1>Salom</h1>',css:'',js:''},'html')`,context),'');
