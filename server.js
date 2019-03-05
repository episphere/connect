http = require('http')
fs = require('fs')

port = process.env.PORT || 3000

server = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin':'*'
    });
    //'Content-Type': 'application/json',
    //'Content-Type': 'text/plain',
    console.log(req)
    if(req.url=="/favicon.ico"){
        res.end()
    }else{
        let ans={
            'received':Date(),
            'method':req.method
        }
        ans = JSON.stringify(ans,null,3)
        //res.write(ans, 'utf-8');
        res.end(ans);
    }
});
 
// listen on the port
server.listen(port, function () {
    console.log('api up on port: ' + port); 
});