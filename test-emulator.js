const http = require('http');
function check(path, port){
  return new Promise((resolve)=>{
    const req = http.get({host:'127.0.0.1', port, path}, res=>{
      const {statusCode} = res;
      let chunks='';
      res.on('data',d=>chunks+=d);
      res.on('end',()=>resolve({path, port, statusCode, length: chunks.length}));
    });
    req.on('error', err=>resolve({path, port, error: err.message}));
    req.setTimeout(5000, ()=>{req.abort(); resolve({path, port, error:'timeout'});});
  });
}
(async()=>{
  const results = [];
  results.push(await check('/philly-wings/us-central1/platformMenu?platform=doordash', 5002));
  results.push(await check('/platform/doordash', 5003));
  results.push(await check('/platform/ubereats', 5003));
  results.push(await check('/platform/grubhub', 5003));
  console.log(JSON.stringify(results,null,2));
})();
