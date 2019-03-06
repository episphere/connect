http = require('http')
fs = require('fs')
port = process.env.PORT || 3000
env={}
if(process.env.connectEnv){
    try{
        env=JSON.parse(decodeURIComponent(process.env.connectEnv))
    }catch{
        env={}
        console.log('no environment keys registered')
    }
    
    //console.log('env',env)
}



server = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'key,filename'
    });
    req.headers.key=req.headers.key||"NA"
    req.headers.filename=req.headers.filename||"NA"
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
            'cmd':req.url,
            'ans':[],
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
                fs.readdir('files/'+req.headers.key,function(err,x){
                    if(err){
                        if(env[req.headers.key]){ // if key is registered
                            fs.mkdirSync('files/'+req.headers.key)
                            //fs.writeFileSync(`files/${req.headers.key}/${req.headers.filename}`,decodeURIComponent(ans.body))
                        }else{
                            console.log('unregistered key :',err,req.headers.key,req.headers.filename)
                            ans.ans.push(`unregistered key : ${err}, ${req.headers.key}, ${req.headers.filename}`)
                        }
                    }
                    fs.readdir('files/'+req.headers.key,function(err,x){
                        if(x){
                            fs.writeFileSync(`files/${req.headers.key}/${req.headers.filename}`,decodeURIComponent(ans.body))
                            ans.ans.push(`${req.headers.filename} saved at ${Date()}`)
                        }else{
                            console.log('unknown key, permission denied')
                            ans.ans.push('unknown key, permission denied')
                        }
                        res.end(JSON.stringify(ans,null,3));
                    })       
                    //console.log(err,x)
                })

            });  
        }else{
            if(ans.cmd=="/help"){
                ans.ans=[
                    '/help : lists available commands',
                    '/files : lists files under your API key (provided as header) <-- NOT DEVELOPED YET',
                    '/files/<filename> : returns file <-- NOT DEVELOPED YET',
                    '/files/<filename>/<case id> : returns file row for corresponding case <-- NOT DEVELOPED YET',
                    '/info/ : returns summary information on your files <-- NOT DEVELOPED YET',
                    '/info/<filename> : returns detailed information on file <-- NOT DEVELOPED YET',
                    '/transactions> : log of transactions using your key <-- NOT DEVELOPED YET',
                ]
            }
            res.end(JSON.stringify(ans,null,3));
        }
        //res.write(ans, 'utf-8');
        
    }
}); 
 
// listen on the port
server.listen(port, function () {
    console.log('api up on port: ' + port); 
});