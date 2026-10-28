const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map();function get(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',open:false,insertAdjacentHTML(pos,html){this.innerHTML+=html;}});return nodes.get(id);}
const context=vm.createContext({document:{getElementById:get},select:id=>{context.selection=id;},renderResources:d=>{context.rendered=d;},showHome:()=>{get('content').innerHTML='existing modules';}});
vm.runInContext('let currentModule=1,currentLesson=1;'+fs.readFileSync('course/frontend-data.js','utf8')+'\n'+fs.readFileSync('course/frontend-resources.js','utf8')+'\n'+fs.readFileSync('course/frontend-module.js','utf8'),context);
vm.runInContext('installFrontendModule();showHome();',context);assert(get('content').innerHTML.includes('existing modules'));assert(get('content').innerHTML.includes('220 soat'));
assert.equal((get('modules').innerHTML.match(/id="m5l\d+"/g)||[]).length,110);assert.equal((get('modules').innerHTML.match(/id="m5g\d+"/g)||[]).length,9);
for(let n=1;n<=110;n++){vm.runInContext(`showFrontendLesson(${n})`,context);assert.equal(context.selection,'m5l'+n);assert(get('content').innerHTML.includes(`${n}-MAVZU`));assert.equal(context.rendered.number,n);assert.equal(context.rendered.quiz.length,10);assert(get('content').innerHTML.includes('resource-tabs'));if(n<110)assert(get('content').innerHTML.includes(`showFrontendLesson(${n+1})`));else assert(!get('content').innerHTML.includes('showFrontendLesson(111)'));}
for(let i=0;i<9;i++){vm.runInContext(`showFrontendPart(${i})`,context);assert(get('content').innerHTML.includes(`${i+1}-BO‘LIM`));}
vm.runInContext('showFrontendOverview()',context);assert(get('content').innerHTML.includes('materials/m5-frontend-reja.docx'));assert(fs.existsSync('course/materials/m5-frontend-reja.docx'));
console.log('110 lesson routes, 9 section routes, source download, navigation boundaries and existing home preservation passed.');
