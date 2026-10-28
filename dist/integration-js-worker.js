// Browser JavaScript exercises only. No Node APIs or DOM. Parent terminates after 5s.
self.onmessage=async event=>{
 const code=event.data?.code;if(typeof code!=='string')return;
 const lines=[];let checks=0;
 const format=x=>{try{return typeof x==='string'?x:JSON.stringify(x)??String(x);}catch{return String(x);}};
 const log=(...args)=>{if(lines.length<100)lines.push(args.map(format).join(' ').slice(0,2000));};
 const assert=(condition,message='Tekshiruv')=>{checks++;if(!condition)throw new Error('Assertion: '+message);};
 try{const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;await new AsyncFunction('console','assert','"use strict";\n'+code)({log,warn:log,error:log},assert);self.postMessage({type:'done',lines,checks});}
 catch(e){self.postMessage({type:'error',lines,message:String(e.message).slice(0,2000),checks});}
};
