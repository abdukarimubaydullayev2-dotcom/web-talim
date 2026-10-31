import fs from 'node:fs';import vm from 'node:vm';import {createHash} from 'node:crypto';
const files=['lesson-data.js','module2-data.js','module3-data.js','module4-data.js','frontend-data.js','frontend-resources.js','backend-data.js','database-data.js','integration-data.js','informatics-data.js'];
const ctx=vm.createContext({});for(const file of files)vm.runInContext(fs.readFileSync('course/'+file,'utf8'),ctx);
const values=vm.runInContext('({1:lessonData,2:module2Data,3:module3Data,4:module4Data,5:frontendData,6:backendData,7:databaseData,8:integrationData,9:informaticsData})',ctx),registry={},client={};
for(const [module,data] of Object.entries(values))for(const [lesson,item] of Object.entries(data)){
 if(!item.quiz?.length)throw Error('Quiz missing '+module+':'+lesson);const version=createHash('sha256').update(JSON.stringify(item.quiz)).digest('hex').slice(0,24),key=module+':'+lesson;
 registry[key]={moduleId:Number(module),lessonId:Number(lesson),title:item.title,version,correct:item.quiz.map(x=>x.correct),optionCounts:item.quiz.map(x=>x.options.length)};
 client[key]=version;
}
fs.writeFileSync('analytics/assessments.json',JSON.stringify(registry)+'\n');fs.writeFileSync('course/assessment-versions.js','globalThis.webTalimAssessmentVersions='+JSON.stringify(client)+';\n');
console.log(Object.keys(registry).length+' assessments registered for server scoring.');
