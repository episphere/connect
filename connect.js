console.log('connect.js loaded')

connect=function(){
    // ini
    console.log('ini at '+Date())
    let div = document.body.querySelector('#connectDiv')
    if(div){connect.UI(div)}
}

connect.api= location.origin.match('localhost') ? "http://localhost:3000" : "https://episphere-connect.herokuapp.com"

connect.UI=function(div){
    // show/hide POST options
    sendPost.onclick=function(){
        ifPost.hidden=false
    }
    sendGet.onclick=function(){
        ifPost.hidden=true
    }
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
            let fileType = file.name.slice(file.name.lastIndexOf('.')+1, file.name.length);
            filename.value=file.name // copy name to filename input
            document.getElementById('filename').value = filename.value;
            document.getElementById('fileType').value = fileType;
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
        let txt = sendContent.value !== "" ? sendContent.value : 'status';
        var opts = {
            method:method,
            headers:{
                "Authorization": `Bearer ${callKey.value}`,
                "Content-Type": "application/json"
            }
        }
        
        if(method=="POST"){
            const fileType = document.getElementById('fileType').value;
            if(fileType !== 'csv' && fileType !== 'tsv' && fileType !== 'json') {
                handleError('File type not supported!');
                return;
            }
            if(filename.value === "" || fileType.value === ""){
                handleError('Please upload a file!');
                return;
            }
            if(txt === ""){
                handleError('File is empty!');
                return;
            }
            
            opts.body=JSON.stringify({
                data: txt,
                filename: filename.value,
                type: fileType
            })
            txt="submit"
        }
        handleError('');
        fetch(connect.api+"/"+txt,opts).then(resp=>{
            resp.json().then(y=>{
                responded.value=JSON.stringify(y,null,3)
            })
        })
        //debugger
    }    
}

handleError = (err) => {
    let errorMessage = document.getElementById('error');
    errorMessage.innerHTML = err;
}
// ini
window.onload=connect