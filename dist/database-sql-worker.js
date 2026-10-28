/* Isolated in-memory SQLite. Every run gets a fresh fixture. */
importScripts('vendor/sqljs/sql-wasm.js');
const engine=initSqlJs({locateFile:file=>'vendor/sqljs/'+file});
self.onmessage=async event=>{
 const data=event.data;if(!data||data.type!=='run'||typeof data.code!=='string'||data.code.length>50000)return;
 let db;
 try{
  const SQL=await engine;db=new SQL.Database();db.exec('PRAGMA foreign_keys=ON;');
  if(data.fixture)db.exec(data.fixture);
  const results=[],iterator=db.iterateStatements(data.code);
  for(const statement of iterator){
   const columns=statement.getColumnNames(),values=[];let truncated=false;
   while(statement.step()){
    if(columns.length){if(values.length>=200){truncated=true;break;}values.push(statement.get().map(x=>ArrayBuffer.isView(x)?'BLOB '+x.length+' bayt':typeof x==='string'?x.slice(0,2000):x));}
   }
   if(columns.length && results.length<10)results.push({columns,values,truncated});
  }
  const version=db.exec('SELECT sqlite_version()')[0].values[0][0];
  const bytes=db.export();self.postMessage({type:'done',results,changes:db.getRowsModified(),version,bytes},[bytes.buffer]);
 }catch(error){self.postMessage({type:'error',message:String(error.message||error)});}
 finally{if(db)db.close();}
};
