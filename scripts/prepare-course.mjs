import {cpSync,mkdirSync} from 'node:fs';
mkdirSync('public',{recursive:true});
cpSync('course','public',{recursive:true});

mkdirSync('public/admin',{recursive:true});
for(const name of ['client.js','style.css'])cpSync('admin/'+name,'public/admin/'+name);
