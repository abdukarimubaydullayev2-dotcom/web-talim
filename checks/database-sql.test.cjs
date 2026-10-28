const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const init=require('../dist/vendor/sqljs/sql-wasm.js');
const dataContext=vm.createContext({});vm.runInContext(fs.readFileSync('dist/database-data.js','utf8')+'\nthis.data=databaseData;this.fixture=databaseFixture;',dataContext);
(async()=>{
 let output;
 const ctx=vm.createContext({importScripts(){},initSqlJs:()=>init({locateFile:f=>path.resolve('dist/vendor/sqljs',f)}),self:{postMessage:value=>output=value}});
 vm.runInContext(fs.readFileSync('dist/database-sql-worker.js','utf8'),ctx);
 async function run(code,fixture=''){output=null;await ctx.self.onmessage({data:{type:'run',code,fixture}});return output;}
 let samples=0;
 for(let n=2;n<=70;n+=2){const a=dataContext.data[n].assignment;if(a.mode!=='sqlite')continue;const result=await run(a.code,a.useFixture?dataContext.fixture:'');assert.equal(result.type,'done',`Lesson ${n}: ${result.message}`);assert(result.bytes instanceof Uint8Array);samples++;}
 const rows=code=>run(code,dataContext.fixture);
 assert.equal((await rows('SELECT COUNT(*) AS n FROM books;')).results[0].values[0][0],3);
 assert.equal((await rows('UPDATE books SET stock=-1 WHERE id=1;')).type,'error');
 assert.equal((await rows("INSERT INTO members VALUES(4,'X','C001','3-IT');")).type,'error');
 assert.equal((await rows("INSERT INTO loans(member_id,book_id,issued_on,due_on) VALUES(999,1,'2026-10-01','2026-10-02');")).type,'error');
 assert.deepEqual(Array.from((await rows('SELECT id FROM loans WHERE returned_on IS NULL ORDER BY id')).results[0].values,r=>r[0]),[1,3]);
 assert.equal((await rows('SELECT m.id,COUNT(l.id) n FROM members m LEFT JOIN loans l ON l.member_id=m.id GROUP BY m.id ORDER BY m.id')).results[0].values[2][1],0);
 assert.equal((await rows('BEGIN; UPDATE books SET stock=8 WHERE id=1; ROLLBACK; SELECT stock FROM books WHERE id=1;')).results[0].values[0][0],3);
 const long=await run('WITH RECURSIVE n(v) AS(VALUES(1) UNION ALL SELECT v+1 FROM n WHERE v<250) SELECT v FROM n;');assert.equal(long.results[0].values.length,200);assert.equal(long.results[0].truncated,true);
 const many=await rows(Array(12).fill('SELECT 1;').join('')+'UPDATE books SET stock=9 WHERE id=1;');assert.equal(many.results.length,10);
 const SQL=await init({locateFile:f=>path.resolve('dist/vendor/sqljs',f)});const restored=new SQL.Database(many.bytes);assert.equal(restored.exec('SELECT stock FROM books WHERE id=1')[0].values[0][0],9);restored.close();
 const xss=await run("SELECT '<img src=x onerror=alert(1)>' AS title;");assert.equal(xss.results[0].values[0][0],'<img src=x onerror=alert(1)>');
 const blob=await run("SELECT x'0102' AS sample;");assert.equal(blob.results[0].values[0][0],'BLOB 2 bayt');
 console.log(`${samples} real SQLite/WASM lesson examples; FK/CHECK/UNIQUE failures, NULL and JOIN semantics, rollback, row/result limits, subsequent writes, export/restore and plain-text results passed.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
