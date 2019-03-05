http = require('http')
fs = require('fs')

port = process.env.PORT || 3000

server = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Headers':'key'
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
        if(req.method=="POST"){
            ans.body=''
            req.on('data', function (data) {
                ans.body += data;
            });
            req.on('end', function () {
                res.end(JSON.stringify(ans,null,3));
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