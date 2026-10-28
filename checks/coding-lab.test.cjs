const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('dist/module4-data.js','utf8').replace(/^const module4Data=/,'').trim().replace(/;$/,''));
const solutions={
4:`function jamiTolov(narx,son){return Number.isFinite(narx)&&narx>=0&&Number.isInteger(son)&&son>=0?narx*son:null;}`,
5:`function maksimum(a,b,c){return [a,b,c].every(Number.isFinite)?Math.max(a,b,c):null;}`,
10:`function tortburchak(a,b){return Number.isFinite(a)&&a>0&&Number.isFinite(b)&&b>0?{perimetr:2*(a+b),yuza:a*b}:null;}`,
14:`function hisobla(n){if(!Number.isInteger(n)||n<1||n>10)return null;let summa=0,kopaytma=1;for(let i=1;i<=n;i++){summa+=i;kopaytma*=i;}return {summa,kopaytma};}`,
15:`function ortacha(a,b){return Number.isFinite(a)&&Number.isFinite(b)?(a+b)/2:null;}`,
19:`function tahlil(sonlar){if(!Array.isArray(sonlar)||!sonlar.length)return null;let summa=0,min=sonlar[0],max=sonlar[0];for(const x of sonlar){if(!Number.isFinite(x))return null;summa+=x;if(x<min)min=x;if(x>max)max=x;}return {summa,min,max};}`,
20:`function hisobot(ballar){if(!Array.isArray(ballar)||!ballar.length)return null;let summa=0,otganlar=0;for(const ball of ballar){if(!Number.isInteger(ball)||ball<0||ball>100)return null;summa+=ball;if(ball>=60)otganlar++;}return {ortacha:summa/ballar.length,otganlar};}`
};
const script=fs.readFileSync('dist/coding-lab.js','utf8');
function run(lab,code,check=true){let result;const ctx=vm.createContext({structuredClone,self:{postMessage:r=>result=r}});vm.runInContext(script+'\ncodingLabWorker();',ctx);ctx.self.onmessage({data:{code,check,functionName:lab.functionName,tests:lab.tests,inputs:[]}});return result;}
let tests=0;
for(const [n,code] of Object.entries(solutions)){const lab=data[n].lab;assert(lab);const result=run(lab,code);assert.equal(result.kind,'done');assert.equal(result.checks.length,lab.tests.length);assert(result.checks.every(t=>t.ok),JSON.stringify(result));tests+=result.checks.length;const bad=run(lab,`function ${lab.functionName}(){return 'wrong';}`);assert(bad.checks.every(t=>!t.ok));}
assert.equal(run(data[4].lab,'const x = ;',false).kind,'error');
assert.equal(run(data[4].lab,'console.log("<img src=x onerror=alert(1)>")',false).lines[0],'<img src=x onerror=alert(1)>');
assert.equal(run(data[4].lab,'document.body.textContent="changed"',false).kind,'error');
assert.equal(run(data[4].lab,'for(let i=0;i<1000;i++)console.log(i)',false).lines.length,100);
console.log(`7 exercises, ${tests} reference cases, wrong solutions, syntax, DOM isolation and output limit passed.`);
