import {cp,mkdir,readdir,rm} from 'node:fs/promises';
await mkdir('public',{recursive:true});
for(const entry of await readdir('course',{withFileTypes:true})){if(entry.name==='index.html')continue;await cp('course/'+entry.name,'public/'+entry.name,{recursive:true});}
await rm('public/index.html',{force:true});
