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
    h += '<button id="doSend">Send</button> <span style="font-size:small">GET<input type="radio" id="sendGet" checked=true>(commands) | POST<input type="radio" id="sendPost">(data) | Key: <input type="password" id="callKey"></span><br>'
    h += '<textarea id="sendContent"></textarea>'
    h += '<p style="color:green">Responded:</p>'
    h += '<textarea id="responded"></textarea>'
    div.innerHTML=h
    // check API status
    fetch(connect.api).then(resp=>{
        resp.text().then(y=>{
            apistatus.textContent=resp.statusText
            if(resp.ok){apistatus.style.color="green"}
        })
    })

    sendPost.onchange=evt=>{sendGet.checked=!evt.target.checked}
    sendGet.onchange=evt=>{sendPost.checked=!evt.target.checked}


    doSend.onclick=evt=>{
        // method
        let method = "GET"
        if(sendPost.checked){method="POST"}

        let txt = encodeURIComponent(sendContent.value)
        fetch(connect.api+'?set='+txt).then(resp=>{
            resp.json().then(y=>{
                responded.value=JSON.stringify(y,null,3)
            })
        })
        //debugger
    }    
}

// ini
window.onload=connect