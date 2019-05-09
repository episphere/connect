console.log('connect.js loaded')

connect=function(){
    // ini
    console.log('ini at '+Date())
    let div = document.body.querySelector('#connectDiv')
    if(div){connect.UI(div)}
}

connect.api= location.origin.match('localhost') ? "http://localhost:3000" : "https://episphere-connect.herokuapp.com"

connect.UI=function(div){
    let h = '<h3>API status: <span id="apistatus" style="color:red;font-size:small">not connected</span></h3>'
    h += '<button id="doSend">Send</button> <span style="font-size:small">GET<input type="radio" name="HTTPVerb" id="sendGet" checked=true>(retrieve) | POST<input type="radio" name="HTTPVerb" id="sendPost">(submit)<br/><br/>Key: <input type="password" id="callKey"> | Filename <input id="filename">(data) | Type <input id="type">(data)</span><br/><br/>'
    h += '<textarea id="sendContent"></textarea>'
    h += '<br><input type="file" id="loadFile">'
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

    // sendPost.onchange=evt=>{sendGet.checked=!evt.target.checked}
    // sendGet.onchange=evt=>{sendPost.checked=!evt.target.checked}

    loadFile.onchange=function(evt){
        var files=evt.target.files
        if(files.length>0){
            let file=files[0]
            filename.value=file.name // copy name to filename input
            sendPost.click() // presume file loaded is to be posted (i.e. it is not a list of commands)
            var reader = new FileReader()
            reader.onload = function() {
                sendContent.value=reader.result
                //debugger
            }
            reader.readAsText(file)
            //debugger
        }
        
    }

    doSend.onclick=evt=>{
        // method
        responded.value = ""
        let method = "GET"
        if (sendPost.checked) {
            method="POST"
        }

        let txt = sendContent.value
        var opts = {
            method:method,
            headers:{
                "Authorization": `Bearer ${callKey.value}`,
                "Content-Type": "application/json"
            }
        }
        if(method=="POST"){
            opts.body=JSON.stringify({
                data: txt,
                filename: filename.value,
                type: type.value
            })
            txt="submit"
        }
        fetch(connect.api+"/"+txt,opts).then(resp=>{
            resp.json().then(y=>{
                responded.value=JSON.stringify(y,null,3)
            })
        })
        //debugger
    }    
}

// ini
window.onload=connect