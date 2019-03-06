http = require('http')
fs = require('fs')
port = process.env.PORT || 3000
env={}
if(process.env.connectEnv){
    //env=JSON.parse(decodeURIComponent(process.env.connectEnv))
    eval("env="+decodeURIComponent(process.env.connectEnv))
    console.log('env',env)
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
        console.log(`call from ${req.headers.host} at ${Date()}`)
        //console.log(req)
        let ans={
            'received':Date(),
            'method':req.method,
            'headers':req.headers,
            'url':req.url
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
                fs.readdir('files/'+req.headers.key,function(err,x){
                    if(err){
                        if(env[req.headers.key]){ // if key is registered
                            fs.mkdirSync('files/'+req.headers.key)
                            //fs.writeFileSync(`files/${req.headers.key}/${req.headers.filename}`,decodeURIComponent(ans.body))
                        }else{
                            console.log('unregistered key :',err,req.headers.key,req.headers.filename)
                        }
                    }
                    fs.readdir('files/'+req.headers.key,function(err,x){
                        if(x){
                            fs.writeFileSync(`files/${req.headers.key}/${req.headers.filename}`,decodeURIComponent(ans.body))
                        }else{
                            console.log('unknown key, permission denied')
                        }
                    })
                        
                    //console.log(err,x)
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