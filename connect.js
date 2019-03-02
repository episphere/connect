console.log('connect.js loaded')

connect=function(){
    // ini
    console.log('ini at '+Date())
    let div = document.body.querySelector('#connectDiv')
    if(div){connect.UI(div)}
}

connect.api=(_=>{
    if(location.origin.match('localhost')){
        return "http://localhost:3000"
    }else{
        return "https://dceg.herokuapp.com"
    }
})()

connect.UI=function(div){
    let h = '<h3>API status: <span id="apistatus" style="color:red;font-size:small">not connected</span></h3>'
    h += '<button>Send</button><br>'
    h += '<textarea id="send"></textarea>'
    h += '<p style="color:green">Received:</p>'
    h += '<textarea id="received"></textarea>'
    div.innerHTML=h
    // check API status
    fetch(connect.api).then(resp=>{
        resp.text().then(y=>{
            apistatus.textContent=resp.statusText
            if(resp.ok){apistatus.style.color="green"}
            debugger
        })
    })
     
}

// ini
window.onload=connect