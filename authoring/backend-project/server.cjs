const {createApp}=require('./app.cjs');
(async()=>{
  const port=Number(process.env.PORT||3000);
  if(!Number.isInteger(port)||port<1||port>65535) throw new Error('PORT noto‘g‘ri');
  const runtime=await createApp({dbPath:process.env.DB_PATH||'./data/school.sqlite',secret:process.env.SESSION_SECRET,
    origin:process.env.APP_ORIGIN||`http://localhost:${port}`,trustProxy:process.env.TRUST_PROXY==='1',logger:row=>console.log(JSON.stringify(row))});
  const server=runtime.app.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Loyiha: ${process.env.APP_ORIGIN||`http://localhost:${port}`}`));
  server.on('error',err=>{console.error(err.message);runtime.close();process.exitCode=1;});
  let stopping=false;
  function stop(){
    if(stopping)return;stopping=true;
    server.close(()=>{runtime.close();process.exit(0);});
    setTimeout(()=>process.exit(1),10000).unref();
  }
  process.on('SIGINT',stop);process.on('SIGTERM',stop);
})().catch(err=>{console.error(err.message);process.exitCode=1;});
