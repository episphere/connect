http = require('http')

port = process.env.PORT || 3000

server = http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin':'*'
    });
    console.log(req)
    if(req.url=="/favicon.ico"){
        res.end()
    }else{
        let ans = 'received at ' + Date() + '\n' + req.url
        res.write(ans, 'utf-8');
        res.end();
    }
});
 
// listen on the port
server.listen(port, function () {
    console.log('api up on port: ' + port); 
});