import {cp,mkdir,readdir,rm} from 'node:fs/promises';
await mkdir('public',{recursive:true});
for(const entry of await readdir('course',{withFileTypes:true})){if(entry.name==='index.html')continue;await cp('course/'+entry.name,'public/'+entry.name,{recursive:true});}
await rm('public/index.html',{force:true});
await cp('teacher/style.css','public/controls-base.css');
await mkdir('public/vendor/teacher',{recursive:true});
for(const [from,to] of [
 ['node_modules/exceljs/dist/exceljs.min.js','exceljs.min.js'],
 ['node_modules/pdf-lib/dist/pdf-lib.min.js','pdf-lib.min.js'],
 ['node_modules/@pdf-lib/fontkit/dist/fontkit.umd.min.js','fontkit.umd.min.js'],
 ['node_modules/exceljs/LICENSE','EXCELJS-LICENSE.txt'],
 ['node_modules/pdf-lib/LICENSE.md','PDF-LIB-LICENSE.txt'],
 ['node_modules/jszip/dist/jszip.min.js','jszip.min.js'],
 ['node_modules/jszip/LICENSE.markdown','JSZIP-LICENSE.txt']
])await cp(from,'public/vendor/teacher/'+to);
