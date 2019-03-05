http = require('http')
fs = require('fs')
port = process.env.PORT || 3000
env={}
if(process.env.connectEnv){
    env=JSON.parse(decodeURIComponent(process.env.connectEnv))
}



server = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'key,filename'
    });
    //'Content-Type': 'application/json',
    //'Content-Type': 'text/plain',
    //console.log(req)
    if(req.url=="/favicon.ico"){
        res.end()
    }else{
        console.log(`call from ${req.url} at ${Date()}`) 
        let ans={
            'received':Date(),
            'method':req.method,
            'headers':req.headers
        }
        if(process.env.connectEnv){
            ans.env=process.env.connectEnv.length
        }else{
            ans.env=false
        }
        if(req.method=="POST"){
            ans.body=''
            req.on('data', function (data) {
                ans.body += data;
            });
            req.on('end', function () {
                res.end(JSON.stringify(ans,null,3));
                fs.readdir('files/'+req.key,function(err,x){
                    if(err&&(env[req.key])){
                        fs.mkdirSync('files/'+req.key)
                    }
                    fs.writeFileSync(`files/${req.key}/lele.csv`,decodeURIComponent(ans.body))
                    console.log(err,x)
                })
            });  
        }else{
            res.end(JSON.stringify(ans,null,3));
        }
        //res.write(ans, 'utf-8');
        
    }
});
 
// listen on the port
server.listen(port, function () {
    console.log('api up on port: ' + port); 
});